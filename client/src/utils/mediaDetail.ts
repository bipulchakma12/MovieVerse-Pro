import { fetchTMDBMovieDetail, fetchTMDBTvShowDetail } from '@/utils/tmdbClient';

const BACKEND_TIMEOUT_MS = 600;

async function fetchBackend(path: string): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${apiUrl}${path}`, { signal: controller.signal });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts a numeric TMDB id from a direct id ("1399") or a slugged id
 * ("game-of-thrones-1399"). Returns null when no numeric segment exists.
 */
export function extractNumericTmdbId(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (/^\d+$/.test(s)) return s;
  const tail = s.split('-').pop() ?? '';
  return /^\d+$/.test(tail) ? tail : null;
}

/**
 * Resolves a movie by id, preferring the backend when it is reachable
 * (600ms budget) and falling back to TMDB otherwise.
 */
export async function resolveMovieDetail(id: string): Promise<any> {
  const [backendRes, tmdbMovie] = await Promise.all([
    fetchBackend(`/movies/${id}`),
    fetchTMDBMovieDetail(id),
  ]);
  return backendRes?.success && backendRes?.data ? backendRes.data : tmdbMovie;
}

/**
 * Resolves a TV show by id, preferring the backend when it is reachable
 * (600ms budget) and falling back to TMDB otherwise.
 */
export async function resolveTvShowDetail(id: string): Promise<any> {
  const [backendRes, tmdbShow] = await Promise.all([
    fetchBackend(`/tv/${id}`),
    fetchTMDBTvShowDetail(id),
  ]);
  return backendRes?.success && backendRes?.data ? backendRes.data : tmdbShow;
}
