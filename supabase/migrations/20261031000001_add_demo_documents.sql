-- Add support for anonymous demo/temporary documents that auto-expire after 24 hours.

-- 1. Make owner_id nullable so guest uploads don't require an authenticated auth.users row.
alter table public.documents
  alter column owner_id drop not null;

-- 2. Add expiration and demo flag columns.
alter table public.documents
  add column is_demo boolean not null default false,
  add column expires_at timestamptz;

-- 3. Add constraint to ensure demo documents always have an expiry date and are published.
alter table public.documents
  add constraint documents_demo_check check (
    (is_demo = false and owner_id is not null and expires_at is null)
    or (is_demo = true and expires_at is not null and owner_id is null and status = 'published')
  );

-- 4. Index on expires_at for efficient cleanup and filtering.
create index documents_expires_at_idx
  on public.documents (expires_at)
  where is_demo = true;

-- 5. Update RLS policy for reading published documents: must not be expired.
drop policy if exists "Published documents are public" on public.documents;
create policy "Published documents are public"
  on public.documents
  for select
  to anon, authenticated
  using (
    status = 'published'
    and (expires_at is null or expires_at > now())
  );

-- 6. Allow anonymous users to create demo documents.
create policy "Anonymous users can create demo documents"
  on public.documents
  for insert
  to anon, authenticated
  with check (
    is_demo = true
    and owner_id is null
    and status = 'published'
    and expires_at is not null
    and expires_at = (now() + interval '24 hours')
  );

-- Grant insert permission to anon role.
grant insert on table public.documents to anon;

-- Set timestamps in the database, including for direct anonymous REST inserts.
create function public.set_demo_document_expiry()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.is_demo then
    new.created_at = now();
    new.updated_at = now();
    new.published_at = now();
    new.expires_at = now() + interval '24 hours';
  end if;
  return new;
end;
$$;

create trigger documents_set_demo_expiry
  before insert on public.documents
  for each row execute function public.set_demo_document_expiry();

-- Access stops at expires_at via RLS. Physical deletion runs within one minute.
create extension if not exists pg_cron;
select cron.schedule(
  'delete-expired-demo-documents',
  '* * * * *',
  $$delete from public.documents where is_demo = true and expires_at <= now()$$
);
