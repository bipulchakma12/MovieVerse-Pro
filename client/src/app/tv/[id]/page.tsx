import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveTvShowDetail } from '@/utils/mediaDetail';
import TvDetailClient from './_components/TvDetailClient';

export const runtime = 'nodejs';

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params) {
  return await params;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  try {
    const { id } = await resolveParams(params);
    const show = await resolveTvShowDetail(String(id));
    if (!show) return { title: 'TV Show not found — MovieVerse Pro' };

    const title = `Watch ${show.name}${show.firstAirYear ? ` (${show.firstAirYear})` : ''} Online in HD — MovieVerse Pro`;
    const description = show.storyline || show.overview || `Watch ${show.name} online in HD quality on MovieVerse Pro.`;
    const poster = show.bannerUrl || show.posterUrl;

    return {
      title,
      description,
      keywords: [show.name, `watch ${show.name} online`, `${show.name} HD`, `${show.name} full episodes`, 'free TV shows online', 'watch series online', 'MovieVerse Pro'],
      alternates: {
        canonical: `https://www.movieversepro.xyz/tv/${id}`,
      },
      openGraph: {
        title,
        description,
        type: 'video.tv_show',
        url: `https://www.movieversepro.xyz/tv/${id}`,
        images: poster ? [{ url: poster, width: 1280, height: 720, alt: show.name }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: poster ? [poster] : undefined,
      },
    };
  } catch {
    return { title: 'MovieVerse Pro — Watch TV Shows Online' };
  }
}

export default async function TvShowDetailsPage({ params }: { params: Params }) {
  const { id } = await resolveParams(params);
  const show = await resolveTvShowDetail(String(id));
  if (!show) {
    notFound();
  }
  return <TvDetailClient tvShow={show} params={{ id: String(id) }} />;
}
