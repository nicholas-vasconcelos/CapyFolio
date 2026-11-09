/*
 * Helpers for links users type in (project repository, GitHub, LinkedIn, Lattes…).
 * People often leave out "https://"; rendered as-is, "www.github.com/x" would be read
 * by the browser as a path on our own site.
 */

/** Turns a stored link ("github.com/x") into an absolute https URL. */
export function externalUrl(value: string): string {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** The link as people read it: no protocol, no "www.", no trailing slash. */
export function displayUrl(value: string): string {
  return value.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}

/**
 * The absolute http(s) URL to store for what the user typed, or null when it is not a
 * web address (another scheme, spaces, no domain). Empty input gives ''.
 */
export function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/\s/.test(trimmed)) return null;
  // A scheme other than http(s) ("javascript:", "ftp://", "mailto:") is never accepted.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) return null;
  try {
    const url = new URL(externalUrl(trimmed));
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    // Needs a real domain: "github.com", not "localhost" or "abc".
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** True when the link points at one of the hosts (or a subdomain of one). */
export function isOnHost(value: string, hosts: readonly string[]): boolean {
  const normalized = normalizeUrl(value);
  if (!normalized) return false;
  const host = new URL(normalized).hostname.toLowerCase().replace(/^www\./, '');
  return hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}
