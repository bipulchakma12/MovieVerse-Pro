export const TMDB_CONFIG = {
  TMDB_API_KEY: process.env.TMDB_API_KEY || '6e7c00461b0e03333f481d7c61800e3d',
  TMDB_BASE_URL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: process.env.TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500',
  TMDB_IMAGE_ORIGINAL: process.env.TMDB_IMAGE_ORIGINAL || 'https://image.tmdb.org/t/p/original',
};

/**
 * Fetch data from TMDB API
 */
export const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const url = new URL(`${TMDB_CONFIG.TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_CONFIG.TMDB_API_KEY);
    
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDB API request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('⚠️ TMDB Fetch Error:', error.message);
    throw error;
  }
};
