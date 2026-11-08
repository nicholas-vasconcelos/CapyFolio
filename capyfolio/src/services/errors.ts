import type { PostgrestError } from '@supabase/supabase-js';

/** Throws on a Supabase error so callers can use try/catch. The message is technical (for logs); UI copy lives in callers. */
export function check<T>(result: { data: T; error: PostgrestError | null }, context: string): T {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  return result.data;
}
