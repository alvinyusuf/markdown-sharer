-- DESTRUCTIVE CUTOVER: stop all old deployments and REST writes first.
begin;
lock table public.documents in access exclusive mode;
delete from public.documents;
alter table public.documents
  drop constraint documents_content_check,
  drop column content,
  add column content_encrypted jsonb not null,
  add column content_size_bytes integer not null
    check (content_size_bytes between 1 and 2097152);

-- A format check cannot authenticate ciphertext without the server key.
create function public.valid_document_envelope(envelope jsonb, size_bytes integer)
returns boolean language plpgsql immutable
set search_path = public, pg_temp
as $$
declare
  field text;
  decoded bytea;
begin
  if jsonb_typeof(envelope) is distinct from 'object'
    or envelope->'version' is distinct from '1'::jsonb
    or jsonb_typeof(envelope->'key_id') is distinct from 'string'
    or (envelope->>'key_id') !~ '^v[1-9][0-9]*$' then
    return false;
  end if;
  foreach field in array array['iv', 'tag', 'ciphertext'] loop
    if jsonb_typeof(envelope->field) is distinct from 'string'
      or (envelope->>field) !~ '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$' then
      return false;
    end if;
    decoded := decode(envelope->>field, 'base64');
    if replace(encode(decoded, 'base64'), E'\n', '') <> (envelope->>field)
      or octet_length(decoded) <> (
        case field
          when 'iv' then 12
          when 'tag' then 16
          else size_bytes
        end
      ) then
      return false;
    end if;
  end loop;
  return true;
exception when others then
  return false;
end;
$$;
alter table public.documents add constraint documents_envelope_check
  check (public.valid_document_envelope(content_encrypted, content_size_bytes));

create or replace function public.prevent_document_owner_change()
returns trigger language plpgsql set search_path = public, pg_temp
as $$
begin
  if new.owner_id is distinct from old.owner_id
    or new.id is distinct from old.id
    or new.is_demo is distinct from old.is_demo then
    raise exception 'Changing document encryption context is not allowed'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;
comment on table public.documents is 'Markdown documents with authenticated server-encrypted content; metadata remains plaintext.';
comment on column public.documents.content_encrypted is 'AES-256-GCM envelope. Keys exist only in the application secret store.';
comment on column public.documents.content_size_bytes is 'Plaintext UTF-8 byte length, maximum 2 MiB.';
commit;
