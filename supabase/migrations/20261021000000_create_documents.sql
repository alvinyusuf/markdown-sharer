-- Readmeo MVP: documents, limits, timestamps, and row level security.

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  content text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint documents_title_check check (
    char_length(btrim(title)) between 1 and 200
  ),
  constraint documents_slug_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) between 3 and 120
  ),
  constraint documents_slug_key unique (slug),
  constraint documents_description_check check (
    description is null or char_length(description) <= 500
  ),
  constraint documents_content_check check (
    octet_length(content) between 1 and 2097152
    and btrim(content) <> ''
  ),
  constraint documents_status_check check (status in ('draft', 'published')),
  constraint documents_published_at_check check (
    status = 'draft' or published_at is not null
  )
);

comment on table public.documents is
  'Markdown documents owned by a Supabase auth user. Content is stored as text and rendered on demand.';
comment on column public.documents.content is
  'Raw Markdown. Maximum 2 MiB (2097152 bytes) of UTF-8 data.';

create index documents_owner_updated_idx
  on public.documents (owner_id, updated_at desc);

create index documents_public_idx
  on public.documents (published_at desc)
  where status = 'published';

-- Keep updated_at accurate no matter which client performs the update.
create or replace function public.set_document_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger documents_set_updated_at
  before update on public.documents
  for each row
  execute function public.set_document_updated_at();

-- Ownership is immutable. RLS checks the new row, this trigger protects
-- against accidental owner_id changes from future server code.
create or replace function public.prevent_document_owner_change()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Changing the document owner is not allowed'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger documents_prevent_owner_change
  before update on public.documents
  for each row
  execute function public.prevent_document_owner_change();

-- Enforce a per-user ceiling in the database as well as in the server action.
-- The advisory lock serialises concurrent inserts for the same owner.
create or replace function public.enforce_document_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  document_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(new.owner_id::text)::bigint);

  select count(*)
    into document_count
    from public.documents
   where owner_id = new.owner_id;

  if document_count >= 100 then
    raise exception 'Document limit reached'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger documents_enforce_limit
  before insert on public.documents
  for each row
  execute function public.enforce_document_limit();

alter table public.documents enable row level security;

-- Owners can read every one of their documents, including drafts.
create policy "Owners can read their documents"
  on public.documents
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

-- Anonymous readers and other signed-in users can only read published rows.
create policy "Published documents are public"
  on public.documents
  for select
  to anon, authenticated
  using (status = 'published');

create policy "Users can create their own drafts"
  on public.documents
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and status = 'draft'
  );

create policy "Owners can update their documents"
  on public.documents
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their documents"
  on public.documents
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- Explicit grants: anon may only read. Writes require an authenticated session
-- and must still satisfy the policies above.
revoke all on table public.documents from anon;
grant select on table public.documents to anon;
grant select, insert, update, delete on table public.documents to authenticated;
