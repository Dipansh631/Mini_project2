-- Task 7: Ensure organization columns and keep existing rows valid
alter table public.users
  add column if not exists organization text;

alter table public.admin_credentials
  add column if not exists organization text;

-- Optional backfill for existing null organizations
update public.users
set organization = 'Default Org'
where organization is null;

update public.admin_credentials
set organization = 'Default Org'
where organization is null;
