import type { Metadata } from "next";

const title = "TV Shows — Stream Popular Series in HD | MovieVerse Pro";
const description =
  "Browse trending TV shows on MovieVerse Pro. Stream popular series, new seasons and full episodes in HD, free and without sign-up.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tv" },
  openGraph: { title, description, url: "/tv", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function TvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
