import { supabase } from '../lib/supabase';
import type { User } from '../types';
import { check } from './errors';
import { toProfileUpdate, toUser } from './mappers';
import { isDemoMode } from '../lib/demo';

export const userService = {
  /** People shown in the app. Organization profiles exist only as post authors. */
  async list(): Promise<User[]> {
    const rows = check(
      await supabase.from('profiles_view').select('*').eq('is_organization', false).order('created_at', { ascending: true }),
      'userService.list',
    );
    return rows.map((row) => toUser(row));
  },

  async getById(id: string): Promise<User | undefined> {
    const row = check(await supabase.from('profiles_view').select('*').eq('id', id).maybeSingle(), 'userService.getById');
    return row ? toUser(row) : undefined;
  },

  /** Profile of the signed-in account, or undefined when there is no session or no profile yet. */
  async getCurrent(email?: string): Promise<User | undefined> {
    const row = check(await supabase.from('profiles_view').select('*').eq('is_me', true).maybeSingle(), 'userService.getCurrent');
    return row ? toUser(row, email) : undefined;
  },

  /** Updates the signed-in user's own profile (RLS rejects any other row). Returns the stored version. */
  async update(user: User): Promise<User> {
    // Demo account: the change lives in the app's state until the page reloads.
    if (isDemoMode()) return user;
    check(await supabase.from('profiles').update(toProfileUpdate(user)).eq('id', user.id).select('id').single(), 'userService.update');
    const saved = await userService.getById(user.id);
    return saved ? { ...saved, email: user.email } : user;
  },
};
