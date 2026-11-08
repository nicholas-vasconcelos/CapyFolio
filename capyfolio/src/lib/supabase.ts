import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (copy capyfolio/.env.example to .env.local).',
  );
}

/** Single browser client. Uses the publishable (anon) key only; RLS does the authorization. */
export const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
