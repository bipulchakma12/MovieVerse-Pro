import { buildUrlSet, fetchTmdbItems, mediaSlug, SITE_URL, xmlResponse, type SitemapUrl } from '@/utils/sitemap';

export const revalidate = 3600;

export async function GET() {
  const [movies, shows] = await Promise.all([
    fetchTmdbItems('/trending/movie/day', 1),
    fetchTmdbItems('/trending/tv/day', 1),
  ]);

  const urls: SitemapUrl[] = [
    { loc: `${SITE_URL}/trending`, changefreq: 'daily', priority: 1.0 },
    ...movies.map((item) => ({
      loc: `${SITE_URL}/movie/${mediaSlug(item.title, item.id, 'movie')}`,
      changefreq: 'daily' as const,
      priority: 0.7,
    })),
    ...shows.map((item) => ({
      loc: `${SITE_URL}/tv/${mediaSlug(item.title, item.id, 'tv-series')}`,
      changefreq: 'daily' as const,
      priority: 0.7,
    })),
  ];

  return xmlResponse(buildUrlSet(urls));
}
