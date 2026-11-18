import { buildUrlSet, fetchTmdbItems, mediaSlug, SITE_URL, xmlResponse, type SitemapUrl } from '@/utils/sitemap';

export const revalidate = 86400;

export async function GET() {
  const items = await fetchTmdbItems('/movie/top_rated', 10);

  const urls: SitemapUrl[] = [
    { loc: `${SITE_URL}/top-imdb`, changefreq: 'daily', priority: 1.0 },
    ...items.map((item) => ({
      loc: `${SITE_URL}/movie/${mediaSlug(item.title, item.id, 'movie')}`,
      changefreq: 'weekly' as const,
      priority: 0.8,
    })),
  ];

  return xmlResponse(buildUrlSet(urls));
}
