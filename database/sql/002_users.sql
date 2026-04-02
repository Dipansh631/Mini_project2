-- Task 2: users table and policies
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  organization text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid()::text = id::text);

drop policy if exists "Service role full access on users" on public.users;
create policy "Service role full access on users"
  on public.users for all
  using (true)
  with check (true);
