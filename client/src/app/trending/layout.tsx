import type { Metadata } from "next";

const title = "Trending Movies — Watch Popular Films in HD | MovieVerse Pro";
const description =
  "Browse trending movies on MovieVerse Pro. Stream new releases, blockbusters and popular films in full HD, free and without sign-up.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/trending" },
  openGraph: { title, description, url: "/trending", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
