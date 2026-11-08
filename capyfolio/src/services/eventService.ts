import { supabase } from '../lib/supabase';
import type { Event } from '../types';
import { check } from './errors';
import { toEvent } from './mappers';

/** Events are read-only for clients (no write policies). */
export const eventService = {
  async list(): Promise<Event[]> {
    const rows = check(
      await supabase.from('events_view').select('*').order('starts_at', { ascending: true, nullsFirst: false }),
      'eventService.list',
    );
    return rows.map(toEvent);
  },

  async getById(id: string): Promise<Event | undefined> {
    const row = check(await supabase.from('events_view').select('*').eq('id', id).maybeSingle(), 'eventService.getById');
    return row ? toEvent(row) : undefined;
  },
};
