import type { Metadata } from "next";

const title = "Search Movies & TV Shows | MovieVerse Pro";
const description =
  "Search 50,000+ movies and TV shows on MovieVerse Pro and stream instantly in HD. Find films by title, genre and release year.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/search" },
  openGraph: { title, description, url: "/search", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
