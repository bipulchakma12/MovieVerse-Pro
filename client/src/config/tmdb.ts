export const TMDB_CONFIG = {
  TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY || '6e7c00461b0e03333f481d7c61800e3d',
  TMDB_BASE_URL: process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500',
  TMDB_IMAGE_ORIGINAL: process.env.NEXT_PUBLIC_TMDB_IMAGE_ORIGINAL || 'https://image.tmdb.org/t/p/original',
};
