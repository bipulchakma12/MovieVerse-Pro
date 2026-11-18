import { buildUrlSet, SITE_URL, xmlResponse, type ChangeFrequency, type SitemapUrl } from '@/utils/sitemap';

/**
 * Prerender this sitemap instead of building it per request.
 *
 * With `force-dynamic` every Googlebot/Bingbot fetch had to hit a cold
 * serverless function. Prerendering removes that failure mode (Search Console
 * reported "Couldn't fetch") while `revalidate` still refreshes `lastmod`
 * hourly.
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

/**
 * Keep this list in sync with the main navigation.
 * The `label` is only written as an XML comment so humans can see which
 * navigation item each URL belongs to — Google ignores comments.
 */
const MAIN_PAGES: Array<{ path: string; label: string; changefreq: ChangeFrequency; priority: number }> = [
  { path: '', label: 'Home', changefreq: 'daily', priority: 1.0 },
  { path: '/trending', label: 'Movies', changefreq: 'daily', priority: 0.9 },
  { path: '/tv', label: 'TV Shows', changefreq: 'daily', priority: 0.9 },
  { path: '/top-imdb', label: 'Top IMDB', changefreq: 'daily', priority: 0.9 },
  { path: '/search', label: 'Search', changefreq: 'weekly', priority: 0.7 },
];

export function GET() {
  const lastmod = new Date();
  const urls: SitemapUrl[] = MAIN_PAGES.map((page) => ({
    loc: `${SITE_URL}${page.path}`,
    lastmod,
    changefreq: page.changefreq,
    priority: page.priority,
    comment: page.label,
  }));

  return xmlResponse(buildUrlSet(urls));
}
