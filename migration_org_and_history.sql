-- Migration: Add Organization Support and User History
-- Date: 2026-03-27

-- 1. Add organization column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS organization TEXT;

-- 2. Add organization column to admin_credentials table
ALTER TABLE public.admin_credentials 
ADD COLUMN IF NOT EXISTS organization TEXT;

-- 3. Create user_history table for tracking actions
CREATE TABLE IF NOT EXISTS public.user_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on user_history
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Users can view their own history
DROP POLICY IF EXISTS "Users can view own history" ON public.user_history;
CREATE POLICY "Users can view own history" ON public.user_history
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- 6. Policy: System can insert history (Service Role)
DROP POLICY IF EXISTS "System can insert history" ON public.user_history;
CREATE POLICY "System can insert history" ON public.user_history
    FOR INSERT WITH CHECK (true);
