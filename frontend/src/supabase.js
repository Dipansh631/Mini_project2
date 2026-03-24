// src/supabase.js  – Singleton Supabase client for the browser
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Auth features will not work. Add them to frontend/.env'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
