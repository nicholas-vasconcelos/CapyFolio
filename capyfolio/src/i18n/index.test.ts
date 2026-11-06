import { describe, expect, it } from 'vitest';
import { fmt, plural, t } from './index';

describe('fmt and plural', () => {
  it('fills placeholders and formats numbers the Brazilian way', () => {
    expect(fmt(t.settings.charCount, { n: 12, max: 600 })).toBe('12/600 caracteres');
    expect(plural(1200, t.profile.connectionsOne, t.profile.connectionsOther)).toBe('1.200 conexões');
    expect(plural(1, t.views.projectsOne, t.views.projectsOther)).toBe('1 projeto publicado');
  });

  it('leaves unknown placeholders alone', () => {
    expect(fmt('{a} e {b}', { a: 'x' })).toBe('x e {b}');
  });
});
