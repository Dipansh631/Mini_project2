-- Task 5: user history table, index, and policies
create table if not exists public.user_history (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_history_email
  on public.user_history (user_email);

alter table public.user_history enable row level security;

drop policy if exists "Users can view own history" on public.user_history;
create policy "Users can view own history"
  on public.user_history for select
  using (auth.jwt() ->> 'email' = user_email);

drop policy if exists "Admins can view all history" on public.user_history;
create policy "Admins can view all history"
  on public.user_history for select
  using (
    exists (
      select 1 from public.users
      where users.email = auth.jwt() ->> 'email'
        and users.role = 'admin'
    )
  );

drop policy if exists "Service role full access on history" on public.user_history;
create policy "Service role full access on history"
  on public.user_history for all
  using (true)
  with check (true);
