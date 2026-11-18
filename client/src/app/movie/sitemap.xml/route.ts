import { buildUrlSet, fetchTmdbItems, mediaSlug, SITE_URL, xmlResponse, type SitemapUrl } from '@/utils/sitemap';

export const revalidate = 86400;

export async function GET() {
  const items = await fetchTmdbItems('/discover/movie', 20, {
    sort_by: 'popularity.desc',
    'vote_count.gte': '50',
  });

  const urls: SitemapUrl[] = items.map((item) => ({
    loc: `${SITE_URL}/movie/${mediaSlug(item.title, item.id, 'movie')}`,
    changefreq: 'weekly',
    priority: 0.8,
  }));

  return xmlResponse(buildUrlSet(urls));
}
