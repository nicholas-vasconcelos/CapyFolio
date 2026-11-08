// Default profile photos: a person silhouette on a design-palette background, served from public/default-avatars.
// New accounts get one at random; the sign-up trigger only accepts these paths from sign-up metadata.
export const DEFAULT_AVATAR_COLORS = ['navy', 'green', 'gold', 'navy-tint', 'green-tint', 'gold-tint'] as const;
export type DefaultAvatarColor = (typeof DEFAULT_AVATAR_COLORS)[number];

export const defaultAvatarUrl = (color: DefaultAvatarColor) => `/default-avatars/${color}.svg`;

export const DEFAULT_AVATAR_URLS = DEFAULT_AVATAR_COLORS.map(defaultAvatarUrl);

export function isDefaultAvatar(url: string | null | undefined): boolean {
  return Boolean(url && (DEFAULT_AVATAR_URLS as string[]).includes(url));
}

/** A random default avatar; `random` is injectable for tests. */
export function randomDefaultAvatar(random: () => number = Math.random): string {
  const index = Math.min(DEFAULT_AVATAR_COLORS.length - 1, Math.floor(random() * DEFAULT_AVATAR_COLORS.length));
  return defaultAvatarUrl(DEFAULT_AVATAR_COLORS[index]);
}

/** The next default avatar after `current` (for a "trocar cor" button), wrapping around. */
export function nextDefaultAvatar(current: string): string {
  const index = (DEFAULT_AVATAR_URLS as string[]).indexOf(current);
  return DEFAULT_AVATAR_URLS[(index + 1) % DEFAULT_AVATAR_URLS.length];
}
