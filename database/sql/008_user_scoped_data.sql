-- Task 8: Add user ownership columns for existing databases
alter table public.deals
  add column if not exists user_email text;

alter table public.emails
  add column if not exists user_email text;

create index if not exists idx_deals_user_email
  on public.deals (user_email);

create index if not exists idx_emails_user_email
  on public.emails (user_email);

-- Optional backfill: attach old rows to a placeholder user id.
-- update public.deals set user_email = 'legacy@local' where user_email is null;
-- update public.emails set user_email = 'legacy@local' where user_email is null;
