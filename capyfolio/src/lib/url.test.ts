import { describe, expect, it } from 'vitest';
import { isOnHost, normalizeUrl } from './url';

describe('normalizeUrl', () => {
  it('adds https:// when the protocol is missing', () => {
    expect(normalizeUrl('www.linkedin.com/in/fulano')).toBe('https://www.linkedin.com/in/fulano');
    expect(normalizeUrl('github.com/x/y')).toBe('https://github.com/x/y');
  });

  it('keeps http(s) links and returns empty for empty input', () => {
    expect(normalizeUrl('http://exemplo.com.br/a')).toBe('http://exemplo.com.br/a');
    expect(normalizeUrl('   ')).toBe('');
  });

  it('refuses other schemes and things that are not web addresses', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeUrl('ftp://exemplo.com')).toBeNull();
    expect(normalizeUrl('meu projeto')).toBeNull();
    expect(normalizeUrl('localhost:3000')).toBeNull();
    expect(normalizeUrl('https://user:pass@exemplo.com')).toBeNull();
  });
});

describe('isOnHost', () => {
  it('accepts the host and its subdomains only', () => {
    expect(isOnHost('www.linkedin.com/in/x', ['linkedin.com'])).toBe(true);
    expect(isOnHost('br.linkedin.com/in/x', ['linkedin.com'])).toBe(true);
    expect(isOnHost('linkedin.com.evil.io/x', ['linkedin.com'])).toBe(false);
    expect(isOnHost('notlinkedin.com', ['linkedin.com'])).toBe(false);
  });
});
