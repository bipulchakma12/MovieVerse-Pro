import { TMDB_CONFIG } from '../../../config/tmdb.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getHeaders = () => {
  const token = process.env.TMDB_ACCESS_TOKEN;
  const headers = {
    accept: 'application/json',
  };
  if (token && !token.includes('mock')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Fetch movie changes list from TMDB API (/movie/changes)
 */
export const fetchMovieChanges = async (page = 1, startDate, endDate) => {
  const apiKey = process.env.TMDB_API_KEY || TMDB_CONFIG.TMDB_API_KEY;
  const baseUrl = process.env.TMDB_BASE_URL || TMDB_CONFIG.TMDB_BASE_URL;

  let url = `${baseUrl}/movie/changes?page=${page}`;
  if (apiKey) url += `&api_key=${apiKey}`;
  if (startDate) url += `&start_date=${startDate}`;
  if (endDate) url += `&end_date=${endDate}`;

  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    throw new Error(`TMDB Changes API request failed with status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Fetch complete enriched movie details from TMDB with append_to_response
 */
export const fetchEnrichedMovieDetails = async (tmdbId, retries = 3) => {
  const apiKey = process.env.TMDB_API_KEY || TMDB_CONFIG.TMDB_API_KEY;
  const baseUrl = process.env.TMDB_BASE_URL || TMDB_CONFIG.TMDB_BASE_URL;

  const appendFields = [
    'credits',
    'videos',
    'images',
    'release_dates',
    'keywords',
    'recommendations',
    'similar',
    'watch/providers',
    'external_ids',
  ].join(',');

  const url = `${baseUrl}/movie/${tmdbId}?api_key=${apiKey}&append_to_response=${appendFields}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { headers: getHeaders() });

      if (response.status === 404) {
        return null; // Movie deleted or doesn't exist on TMDB
      }

      if (response.status === 429) {
        // Rate limited - wait exponential backoff
        const retryAfter = parseInt(response.headers.get('retry-after') || '2', 10);
        console.warn(`⏳ TMDB Rate limited (429). Retrying in ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      const backoff = attempt * 1000;
      await sleep(backoff);
    }
  }

  return null;
};

/**
 * Search TMDB movies by title query
 */
export const searchTmdbMovies = async (query) => {
  const apiKey = process.env.TMDB_API_KEY || TMDB_CONFIG.TMDB_API_KEY;
  const baseUrl = process.env.TMDB_BASE_URL || TMDB_CONFIG.TMDB_BASE_URL;

  const url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: getHeaders() });

  if (!response.ok) {
    throw new Error(`TMDB Search API failed with status: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
};

