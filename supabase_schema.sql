-- ============================================================
-- SalesLens AI – Supabase SQL Schema
-- Run this entire script in: Supabase → SQL Editor → New Query
-- ============================================================

-- ── 1. USERS table ──────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz not null default now()
);

-- Row Level Security: users can only read their own row
alter table public.users enable row level security;
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid()::text = id::text);
create policy "Service role full access on users"
  on public.users for all
  using (true)
  with check (true);

-- ── 2. DEALS table ──────────────────────────────────────────
create table if not exists public.deals (
  id                   uuid primary key default gen_random_uuid(),
  client_name          text not null,
  deal_value           float not null,
  stage                text not null default 'Lead',
  interactions         int  not null default 0,
  success_probability  float,
  predicted_revenue    float,
  sentiment            text,
  sentiment_score      float,
  deal_score           float,
  risk_level           text,
  lead_category        text,
  created_at           timestamptz not null default now()
);

alter table public.deals enable row level security;
-- All authenticated users can read deals
create policy "Authenticated users can view deals"
  on public.deals for select
  using (auth.role() = 'authenticated');
-- Only service role (backend) can insert/update/delete
create policy "Service role can manage deals"
  on public.deals for all
  using (true)
  with check (true);

-- ── 3. EMAILS table ─────────────────────────────────────────
create table if not exists public.emails (
  id               uuid primary key default gen_random_uuid(),
  client_name      text,
  email_text       text not null,
  sentiment        text,
  emotion          text,
  sentiment_score  float,
  created_at       timestamptz not null default now()
);

alter table public.emails enable row level security;
create policy "Authenticated users can view emails"
  on public.emails for select
  using (auth.role() = 'authenticated');
create policy "Service role can manage emails"
  on public.emails for all
  using (true)
  with check (true);
