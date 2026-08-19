// MovieVerse Pro — Main Layout (v2.1)
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SecurityProvider } from "@/components/SecurityProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
        {/* Google Search Console Verification — Hardcoded for 100% detection */}
        <meta name="google-site-verification" content="MH1Osikqntad8Po7T5cLX2qqGlwwi7gT3i02s8YRGHc" />
        {/* Browser Favicon Logo */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <SecurityProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </SecurityProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
