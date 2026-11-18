import { TMDB_API_KEY, TMDB_BASE_URL } from '@/utils/tmdbClient';

export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapUrl {
  loc: string;
  lastmod?: Date | string;
  changefreq?: ChangeFrequency;
  priority?: number;
  /** Optional label rendered as an XML comment above the entry (for human readers). */
  comment?: string;
}

/** Canonical site URL without a trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.movieversepro.xyz').replace(/\/+$/, '');

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ENTITIES[char]);
}

function formatLastmod(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function buildUrlSet(urls: SitemapUrl[]): string {
  const rows: string[] = [];

  for (const url of urls) {
    if (url.comment) {
      // "--" is not allowed inside an XML comment.
      rows.push(`  <!-- ${url.comment.replace(/--/g, '- -')} -->`);
    }

    const parts = [`    <loc>${escapeXml(url.loc)}</loc>`];
    if (url.lastmod) parts.push(`    <lastmod>${formatLastmod(url.lastmod)}</lastmod>`);
    if (url.changefreq) parts.push(`    <changefreq>${url.changefreq}</changefreq>`);
    if (typeof url.priority === 'number') parts.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
    rows.push(`  <url>\n${parts.join('\n')}\n  </url>`);
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    rows.join('\n'),
    '</urlset>',
    '',
  ].join('\n');
}

export function buildSitemapIndex(sitemaps: { loc: string; lastmod?: Date | string }[]): string {
  const rows = sitemaps.map((sitemap) => {
    const parts = [`    <loc>${escapeXml(sitemap.loc)}</loc>`];
    if (sitemap.lastmod) parts.push(`    <lastmod>${formatLastmod(sitemap.lastmod)}</lastmod>`);
    return `  <sitemap>\n${parts.join('\n')}\n  </sitemap>`;
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    rows.join('\n'),
    '</sitemapindex>',
    '',
  ].join('\n');
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, must-revalidate',
    },
  });
}

export interface TmdbSitemapItem {
  id: string;
  title: string;
}

/**
 * Builds the same slug format the site uses in its links:
 * "spider-man-no-way-home-634649".
 */
export function mediaSlug(title: string, id: string, fallback = 'title'): string {
  const base = (title || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return `${base || fallback}-${id}`;
}

/**
 * Reads a TMDB list endpoint and returns deduplicated items with their titles.
 * Failures are swallowed per page so one bad request never breaks a sitemap.
 */
export async function fetchTmdbItems(
  endpoint: string,
  pages = 20,
  params: Record<string, string> = {}
): Promise<TmdbSitemapItem[]> {
  const requests = Array.from({ length: pages }, (_, index) => {
    const query = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY || TMDB_API_KEY,
      ...params,
      page: String(index + 1),
    });

    return (async () => {
      try {
        const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${query.toString()}`, {
          next: { revalidate: 86400 },
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data?.results) ? data.results : [];
      } catch {
        return [];
      }
    })();
  });

  const results = await Promise.all(requests);
  const seen = new Set<number>();
  const items: TmdbSitemapItem[] = [];

  for (const item of results.flat() as Array<{ id?: number; title?: string; name?: string }>) {
    if (typeof item?.id !== 'number' || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push({
      id: String(item.id),
      title: item.title || item.name || '',
    });
  }

  return items;
}
