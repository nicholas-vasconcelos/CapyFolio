import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (copy capyfolio/.env.example to .env.local).',
  );
}

const REMEMBER_KEY = 'capyfolio.remember-session';

/** Storage can throw (private mode, blocked site data); treat that as "not available". */
const safe = <T,>(read: () => T, fallback: T): T => {
  try {
    return read();
  } catch {
    return fallback;
  }
};

/** "Manter conectado" on the login form. Default on, as before the checkbox did anything. */
export function setRememberSession(remember: boolean): void {
  safe(() => localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0'), undefined);
}

const remembers = () => safe(() => localStorage.getItem(REMEMBER_KEY) !== '0', true);

/**
 * Session storage for supabase-js: localStorage when the user wants to stay signed in,
 * sessionStorage (cleared when the browser closes) otherwise. Reads check both, so a
 * session saved before the choice changed is still found.
 */
const authStorage = {
  getItem: (key: string) => safe(() => localStorage.getItem(key) ?? sessionStorage.getItem(key), null),
  setItem: (key: string, value: string) =>
    safe(() => {
      const [keep, drop] = remembers() ? [localStorage, sessionStorage] : [sessionStorage, localStorage];
      keep.setItem(key, value);
      drop.removeItem(key);
    }, undefined),
  removeItem: (key: string) =>
    safe(() => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }, undefined),
};

/** Single browser client. Uses the publishable (anon) key only; RLS does the authorization. */
export const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: authStorage },
});
