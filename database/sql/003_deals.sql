-- Task 3: deals table and policies
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  client_name text not null,
  deal_value float not null,
  stage text not null default 'Lead',
  interactions int not null default 0,
  success_probability float,
  predicted_revenue float,
  sentiment text,
  sentiment_score float,
  deal_score float,
  risk_level text,
  lead_category text,
  created_at timestamptz not null default now()
);

alter table public.deals
  add column if not exists user_email text;

create index if not exists idx_deals_user_email
  on public.deals (user_email);

alter table public.deals enable row level security;

drop policy if exists "Authenticated users can view deals" on public.deals;
create policy "Authenticated users can view deals"
  on public.deals for select
  using (auth.role() = 'authenticated');

drop policy if exists "Service role can manage deals" on public.deals;
create policy "Service role can manage deals"
  on public.deals for all
  using (true)
  with check (true);
