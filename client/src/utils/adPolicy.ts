/**
 * Ad policy — strict separation between third-party (movie API) ads and the site's own ads.
 *
 * Default behaviour (unchanged from before): ANY window.open() to an external origin is
 * blocked. This deterministically kills every ad popup, popunder, and redirect that tries
 * to leave the page.
 *
 * To enable YOUR OWN ads after you add them: add the ad network's domains to the
 * NEXT_PUBLIC_OWN_AD_DOMAINS environment variable on the host (comma-separated), e.g.
 *
 *   NEXT_PUBLIC_OWN_AD_DOMAINS=ads.example.com,adservice.google.com,pagead2.googlesyndication.com
 *
 * Ad domains you own will then open normally; every other external origin stays blocked.
 * Subdomains of an allowlisted domain are allowed (ads.example.com allows cdn.ads.example.com).
 */

const DEFAULT_OWN_AD_DOMAINS = '';

export function getOwnAdDomains(): string[] {
  const raw = process.env.NEXT_PUBLIC_OWN_AD_DOMAINS ?? DEFAULT_OWN_AD_DOMAINS;
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url, 'https://placeholder.local').hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** True for same-origin URLs (including relative URLs). */
export function isSameOrigin(url: string): boolean {
  if (typeof window === 'undefined') return true; // SSR: treat as same-origin
  try {
    const host = new URL(url, window.location.origin).hostname.toLowerCase();
    return host === window.location.hostname.toLowerCase();
  } catch {
    return false;
  }
}

/** True if the URL belongs to one of YOUR ad domains (configured via env var). */
export function isOwnAdUrl(url: string): boolean {
  const host = hostnameOf(url);
  if (!host) return false;
  return getOwnAdDomains().some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/** Whether window.open(url) is allowed: own site or an allowlisted own-ad domain. */
export function canOpenPopup(url: string): boolean {
  if (!url) return true;
  if (isSameOrigin(url)) return true;
  return isOwnAdUrl(url);
}
