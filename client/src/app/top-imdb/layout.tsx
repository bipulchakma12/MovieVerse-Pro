import type { Metadata } from "next";

const title = "Top IMDb Movies — Highest Rated Films | MovieVerse Pro";
const description =
  "Explore the highest rated movies on IMDb, ranked and ready to stream in HD on MovieVerse Pro. Discover top-scoring blockbusters and classics.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/top-imdb" },
  openGraph: { title, description, url: "/top-imdb", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function TopImdbLayout({ children }: { children: React.ReactNode }) {
  return children;
}
