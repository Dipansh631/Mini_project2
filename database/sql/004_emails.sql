-- Task 4: emails table and policies
create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  client_name text,
  email_text text not null,
  sentiment text,
  emotion text,
  sentiment_score float,
  created_at timestamptz not null default now()
);

alter table public.emails
  add column if not exists user_email text;

create index if not exists idx_emails_user_email
  on public.emails (user_email);

alter table public.emails enable row level security;

drop policy if exists "Authenticated users can view emails" on public.emails;
create policy "Authenticated users can view emails"
  on public.emails for select
  using (auth.role() = 'authenticated');

drop policy if exists "Service role can manage emails" on public.emails;
create policy "Service role can manage emails"
  on public.emails for all
  using (true)
  with check (true);
