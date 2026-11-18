import { buildUrlSet, fetchTmdbItems, mediaSlug, SITE_URL, xmlResponse, type SitemapUrl } from '@/utils/sitemap';

export const revalidate = 86400;

export async function GET() {
  const items = await fetchTmdbItems('/discover/tv', 20, {
    sort_by: 'popularity.desc',
    'vote_count.gte': '50',
  });

  const urls: SitemapUrl[] = [
    { loc: `${SITE_URL}/tv`, changefreq: 'daily' as const, priority: 1.0 },
    ...items.map((item) => ({
      loc: `${SITE_URL}/tv/${mediaSlug(item.title, item.id, 'tv-series')}`,
      changefreq: 'weekly' as const,
      priority: 0.8,
    })),
  ];

  return xmlResponse(buildUrlSet(urls));
}
