// MovieVerse Pro — Main Layout (v2.1)
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SecurityProvider } from "@/components/SecurityProvider";
import { Chrome } from "@/components/Chrome";
import EzoicPageView from "@/components/EzoicPageView";

export const metadata: Metadata = {
  title: "MovieVerse Pro",
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
    title: "MovieVerse Pro",
    description: "Discover, stream, review, and track 50,000+ movies & TV shows with high-speed CineSrc streaming on MovieVerse Pro.",
    url: "https://movie-verse-pro-client.vercel.app",
    siteName: "MovieVerse Pro",
    type: "website",
    images: [
      {
        url: "https://www.movieversepro.xyz/icon.svg",
        width: 512,
        height: 512,
        alt: "MovieVerse Pro logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieVerse Pro",
    description: "Stream full movies & TV series in HD for free on MovieVerse Pro.",
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
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
        {/* Browser Favicon Logo */}
        <link rel="icon" type="image/svg+xml" sizes="512x512" href="/icon.svg" />
        <link rel="alternate icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />

        {/* Structured Data (JSON-LD) — site name + logo for Google search results */}
        <script type="application/ld+json">
          {`{"@context":"https://schema.org","@type":"WebSite","name":"MovieVerse Pro","url":"https://www.movieversepro.xyz/","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://www.movieversepro.xyz/search?q={search_term_string}"},"query-input":"required name=search_term_string"}}`}
        </script>
        <script type="application/ld+json">
          {`{"@context":"https://schema.org","@type":"Organization","name":"MovieVerse Pro","url":"https://www.movieversepro.xyz/","logo":{"@type":"ImageObject","url":"https://www.movieversepro.xyz/icon.svg","width":512,"height":512},"image":"https://www.movieversepro.xyz/icon.svg","sameAs":[]}`}
        </script>
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
