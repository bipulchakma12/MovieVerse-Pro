import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.movieversepro.xyz').replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    // Main sitemap (navigation pages) + section sitemaps (movie/TV detail pages).
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/trending/sitemap.xml`,
      `${baseUrl}/top-imdb/sitemap.xml`,
      `${baseUrl}/movie/sitemap.xml`,
      `${baseUrl}/tv/sitemap.xml`,
    ],
  };
}
