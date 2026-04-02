-- Task 6: admin credentials table and policies
create table if not exists public.admin_credentials (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  dob date not null,
  username text unique not null,
  password text not null,
  organization text not null default 'Default Org',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.admin_credentials enable row level security;

drop policy if exists "Service role full access on admin_credentials" on public.admin_credentials;
create policy "Service role full access on admin_credentials"
  on public.admin_credentials for all
  using (true)
  with check (true);
