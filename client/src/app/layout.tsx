import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SecurityProvider } from "@/components/SecurityProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "MovieVerse Pro — Watch HD Movies & TV Shows Online Free | #1 Movie Platform",
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
    title: "MovieVerse Pro — #1 Platform to Watch Movies Online Free",
    description: "Discover, stream, review, and track 50,000+ movies & TV shows with high-speed CineSrc streaming on MovieVerse Pro.",
    url: "https://movie-verse-pro-client.vercel.app",
    siteName: "MovieVerse Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieVerse Pro — #1 Platform to Watch Movies Online",
    description: "Stream full movies & TV series in HD for free on MovieVerse Pro.",
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
