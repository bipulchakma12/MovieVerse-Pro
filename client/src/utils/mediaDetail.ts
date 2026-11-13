import { fetchTMDBMovieDetail, fetchTMDBTvShowDetail } from '@/utils/tmdbClient';

const BACKEND_TIMEOUT_MS = 600;
// In development, default to the local backend; in production, only hit the backend
// when one is explicitly configured — otherwise go straight to TMDB (avoids a
// guaranteed-refused localhost:5000 request for every visitor).
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV !== 'production' ? 'http://localhost:5000/api' : undefined);

async function fetchBackend(path: string): Promise<any> {
  if (!API_URL) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, { signal: controller.signal });
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
