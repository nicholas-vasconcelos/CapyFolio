// Per-account id lists: favorites, event registrations and connections. RLS limits every read and write to rows
// owned by the signed-in profile, so `profileId` must be that profile's id.
import { supabase } from '../lib/supabase';
import { check } from './errors';

export const favoriteService = {
  async listIds(profileId: string): Promise<string[]> {
    const rows = check(
      await supabase.from('project_favorites').select('project_id').eq('profile_id', profileId),
      'favoriteService.listIds',
    );
    return rows.map((row) => row.project_id);
  },

  async set(profileId: string, projectId: string, on: boolean): Promise<void> {
    if (on) {
      check(
        await supabase
          .from('project_favorites')
          .upsert({ profile_id: profileId, project_id: projectId }, { onConflict: 'project_id,profile_id', ignoreDuplicates: true }),
        'favoriteService.add',
      );
    } else {
      check(
        await supabase.from('project_favorites').delete().eq('profile_id', profileId).eq('project_id', projectId),
        'favoriteService.remove',
      );
    }
  },
};

export const registrationService = {
  async listIds(profileId: string): Promise<string[]> {
    const rows = check(
      await supabase.from('event_registrations').select('event_id').eq('profile_id', profileId),
      'registrationService.listIds',
    );
    return rows.map((row) => row.event_id);
  },

  async set(profileId: string, eventId: string, on: boolean): Promise<void> {
    if (on) {
      check(
        await supabase
          .from('event_registrations')
          .upsert({ profile_id: profileId, event_id: eventId }, { onConflict: 'event_id,profile_id', ignoreDuplicates: true }),
        'registrationService.add',
      );
    } else {
      check(
        await supabase.from('event_registrations').delete().eq('profile_id', profileId).eq('event_id', eventId),
        'registrationService.remove',
      );
    }
  },
};

export const connectionService = {
  async listIds(profileId: string): Promise<string[]> {
    const rows = check(
      await supabase.from('connections').select('target_id').eq('profile_id', profileId),
      'connectionService.listIds',
    );
    return rows.map((row) => row.target_id);
  },

  async set(profileId: string, targetId: string, on: boolean): Promise<void> {
    if (on) {
      check(
        await supabase
          .from('connections')
          .upsert({ profile_id: profileId, target_id: targetId }, { onConflict: 'profile_id,target_id', ignoreDuplicates: true }),
        'connectionService.add',
      );
    } else {
      check(
        await supabase.from('connections').delete().eq('profile_id', profileId).eq('target_id', targetId),
        'connectionService.remove',
      );
    }
  },
};
