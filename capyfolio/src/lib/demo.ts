// Demo account: a shared login on the login page so anyone can try CapyFolio without signing up.
//
// The account is real (it reads the same data as everyone else), but nothing it does is stored:
// - the database refuses every write from it (migration 20261111120100_hero_color_and_demo.sql);
// - the services below check isDemoMode() and return the change as if it had been saved, so the
//   app updates its own state and the visitor sees the feature work until they reload.
//
// The password is public on purpose; the database lockdown is what keeps the account safe.

export const DEMO_EMAIL = 'demo@capyfolio.test';
export const DEMO_PASSWORD = 'capyfolio-demo';

let demoMode = false;

/** True while the signed-in session is the demo account. */
export const isDemoMode = (): boolean => demoMode;

export const setDemoMode = (on: boolean): void => {
  demoMode = on;
};

/** Supabase marks the account with app_metadata.demo = true (users cannot change app_metadata). */
export const isDemoAuthUser = (user: { app_metadata?: Record<string, unknown> } | null | undefined): boolean =>
  user?.app_metadata?.demo === true;

/** A local URL for a file the visitor picked, so uploads "work" without leaving the browser. */
export const localFileUrl = (file: Blob): string => URL.createObjectURL(file);
