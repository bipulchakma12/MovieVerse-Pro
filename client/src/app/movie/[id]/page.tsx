import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveMovieDetail } from '@/utils/mediaDetail';
import MovieDetailClient from './_components/MovieDetailClient';

export const runtime = 'nodejs';

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params) {
  const resolved = await params;
  return resolved;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  try {
    const { id } = await resolveParams(params);
    const movie = await resolveMovieDetail(String(id));
    if (!movie) return { title: 'Movie not found — MovieVerse Pro' };

    const title = `Watch ${movie.title}${movie.releaseYear ? ` (${movie.releaseYear})` : ''} Online in HD — MovieVerse Pro`;
    const description = movie.storyline || movie.overview || `Watch ${movie.title} online in HD quality on MovieVerse Pro.`;
    const poster = movie.bannerUrl || movie.posterUrl;

    return {
      title,
      description,
      keywords: [movie.title, `watch ${movie.title} online`, `${movie.title} HD`, `${movie.title} full movie`, 'free movies online', 'watch movies HD', 'MovieVerse Pro'],
      alternates: {
        canonical: `https://www.movieversepro.xyz/movie/${id}`,
      },
      openGraph: {
        title,
        description,
        type: 'video.movie',
        url: `https://www.movieversepro.xyz/movie/${id}`,
        images: poster ? [{ url: poster, width: 1280, height: 720, alt: movie.title }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: poster ? [poster] : undefined,
      },
    };
  } catch {
    return { title: 'MovieVerse Pro — Watch Movies Online' };
  }
}

export default async function MovieDetailsPage({ params }: { params: Params }) {
  const { id } = await resolveParams(params);
  const movie = await resolveMovieDetail(String(id));
  if (!movie) {
    notFound();
  }
  return <MovieDetailClient movie={movie} params={{ id: String(id) }} />;
}
