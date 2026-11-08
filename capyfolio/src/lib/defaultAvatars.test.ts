import { describe, expect, it } from 'vitest';
import { DEFAULT_AVATAR_URLS, isDefaultAvatar, nextDefaultAvatar, randomDefaultAvatar } from './defaultAvatars';

// Paths of the SVGs actually present in public/default-avatars (only the keys are used).
const publicFiles = Object.keys(import.meta.glob('../../public/default-avatars/*.svg')).map((path) => path.replace('../../public', ''));

describe('default avatars', () => {
  it('has a file in public/ for every colour, and no stray files', () => {
    expect([...publicFiles].sort()).toEqual([...DEFAULT_AVATAR_URLS].sort());
  });

  it('picks across the whole palette, never out of range', () => {
    expect(randomDefaultAvatar(() => 0)).toBe(DEFAULT_AVATAR_URLS[0]);
    expect(randomDefaultAvatar(() => 0.9999)).toBe(DEFAULT_AVATAR_URLS[DEFAULT_AVATAR_URLS.length - 1]);
    expect(randomDefaultAvatar(() => 1)).toBe(DEFAULT_AVATAR_URLS[DEFAULT_AVATAR_URLS.length - 1]);
  });

  it('cycles to the next colour and recognises default paths only', () => {
    expect(nextDefaultAvatar(DEFAULT_AVATAR_URLS[0])).toBe(DEFAULT_AVATAR_URLS[1]);
    expect(nextDefaultAvatar(DEFAULT_AVATAR_URLS[DEFAULT_AVATAR_URLS.length - 1])).toBe(DEFAULT_AVATAR_URLS[0]);
    expect(isDefaultAvatar('/default-avatars/navy.svg')).toBe(true);
    expect(isDefaultAvatar('https://example.com/a.png')).toBe(false);
    expect(isDefaultAvatar(undefined)).toBe(false);
  });
});
