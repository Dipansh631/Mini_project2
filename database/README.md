# Database Setup (Task-Based SQL Files)

This folder contains SQL migrations split by task so each part of the database can be created independently.

## Execution Order

Run files in this exact order in Supabase SQL Editor:

1. `database/sql/001_extensions.sql`
2. `database/sql/002_users.sql`
3. `database/sql/003_deals.sql`
4. `database/sql/004_emails.sql`
5. `database/sql/005_user_history.sql`
6. `database/sql/006_admin_credentials.sql`
7. `database/sql/007_org_columns_and_backfill.sql`
8. `database/sql/008_user_scoped_data.sql`

## Notes

- These scripts are idempotent where possible (`if not exists`, `drop policy if exists`).
- The backend currently uses Supabase service-role credentials, so service operations bypass RLS.
- If a policy already exists with different logic, the script uses `drop policy if exists` before recreation.
