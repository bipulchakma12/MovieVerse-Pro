// MovieVerse Pro — Main Layout (v2.1)
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SecurityProvider } from "@/components/SecurityProvider";
import { Chrome } from "@/components/Chrome";
import EzoicPageView from "@/components/EzoicPageView";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://www.movieversepro.xyz";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MovieVerse Pro",
  url: `${SITE_URL}/`,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MovieVerse Pro",
  url: `${SITE_URL}/`,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/icon-512.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/icon-512.png`,
  sameAs: [],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "MovieVerse Pro — Watch Movies & TV Shows Online Free in HD",
  description: "MovieVerse Pro is the ultimate online movie streaming platform. Watch full movies, blockbuster hits, trending TV series, and trailers in full HD online for free.",
  keywords: [
    "movie",
    "movies",
    "movie verse pro",
    "movieverse pro",
    "movieverse",
    "watch movies online",
    "free movie streaming",
    "hd movies",
    "tv shows",
    "full movie online",
    "blockbuster movies"
  ],
  authors: [{ name: "MovieVerse Pro Team" }],
  creator: "MovieVerse Pro",
  publisher: "MovieVerse Pro",
  robots: "index, follow",
  openGraph: {
    title: "MovieVerse Pro — Watch Movies & TV Shows Online Free in HD",
    description: "Discover, stream, review, and track 50,000+ movies & TV shows with high-speed CineSrc streaming on MovieVerse Pro.",
    url: "https://www.movieversepro.xyz",
    siteName: "MovieVerse Pro",
    type: "website",
    images: [
      {
        url: "https://www.movieversepro.xyz/icon-512.png",
        width: 512,
        height: 512,
        alt: "MovieVerse Pro logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieVerse Pro — Watch Movies & TV Shows Online Free in HD",
    description: "Stream full movies & TV series in HD for free on MovieVerse Pro.",
  },
  icons: {
    // Google Search only shows favicons that are square raster images >= 48x48
    // (SVG and 32x32 icons are ignored), so the PNG/ICO set is listed first.
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: '512x512' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Tag Manager */}
        <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-T2MPR28W"></script>
        <script>
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());`}
        </script>

        {/* Ezoic — Step 2: Site Integration (header scripts; privacy first) */}
        <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js"></script>
        <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js"></script>
        <script async src="//www.ezojs.com/ezoic/sa.min.js"></script>
        <script>
          {`window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd = ezstandalone.cmd || [];`}
        </script>
        <script src="//ezoicanalytics.com/analytics.js"></script>

        {/* Resource Preconnection for High-Speed Image & API Delivery */}
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        
        {/* Theme and Web App Config */}
        <meta name="theme-color" content="#0b0c10" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Google Search Console Verification — Hardcoded for 100% detection */}
        <meta name="google-site-verification" content="MH1Osikqntad8Po7T5cLX2qqGlwwi7gT3i02s8YRGHc" />
        {/* Favicons are declared through metadata.icons above (PNG 48–512 + favicon.ico) */}

        {/* Structured Data (JSON-LD) — site name + logo for Google search results */}
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <SecurityProvider>
              <Chrome>{children}</Chrome>
              <EzoicPageView />
            </SecurityProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
