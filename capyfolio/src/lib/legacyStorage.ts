// Keys written by the pre-Supabase mock version of the app. They can hold copies of user records,
// including the old plaintext test passwords, so they are removed on startup.
const LEGACY_KEYS = [
  'capyfolio_users',
  'capyfolio_posts',
  'capyfolio_projects',
  'capyfolio_events',
  'capyfolio_session_user',
  'capyfolio_favorites',
  'capyfolio_registrations',
  'capyfolio_connections',
];

export function clearLegacyStorage(): void {
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable (private mode, blocked site data); nothing to clean then.
  }
}
