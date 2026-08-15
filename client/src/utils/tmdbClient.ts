export const TMDB_API_KEY = '6e7c00461b0e03333f481d7c61800e3d';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMAGE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

// YouTube Full Movies & Blockbuster Trailer Keys
const POPULAR_YOUTUBE_KEYS = [
  'YoHD9XEInc0', // Inception / Action
  'Way9Dexny3w', // Dune / Sci-Fi
  'uYPbbksJxIg', // Oppenheimer
  'TcMBFSGVi1c', // Avengers / Marvel
  '8Qn_spdM5Zg', // Interstellar
  'd9MyW72ELq0', // Avatar
  'EXeTwQWrcwY', // The Dark Knight
  'qEVUtrk8_B4', // John Wick
  'hEJnMQGLa88', // Spider-Man
  'a8Gx8wiNbs8', // Transformers
];

export const fetchTMDBPopularMovies = async (page = 1) => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`);
    const data = await res.json();

    if (data.results && Array.isArray(data.results)) {
      return data.results.map((m: any, index: number) => {
        const youtubeKey = POPULAR_YOUTUBE_KEYS[index % POPULAR_YOUTUBE_KEYS.length];
        const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeKey}`;

        return {
          _id: m.id.toString(),
          tmdbId: m.id.toString(),
          title: m.title,
          slug: m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${m.id}`,
          storyline: m.overview || 'No storyline available.',
          posterUrl: m.poster_path
            ? `${TMDB_IMAGE_BASE}${m.poster_path}`
            : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
          bannerUrl: m.backdrop_path ? `${TMDB_IMAGE_ORIGINAL}${m.backdrop_path}` : `${TMDB_IMAGE_BASE}${m.poster_path}`,
          trailerUrl: youtubeEmbedUrl,
          videoUrl: youtubeEmbedUrl,
          releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : 2024,
          runtimeMinutes: 120 + (index * 5) % 45,
          ratingAverage: Math.round((m.vote_average || 7.8) * 10) / 10,
          ratingCount: m.vote_count || 320,
          genres: [{ name: 'Popular', slug: 'popular' }],
        };
      });
    }
    return [];
  } catch (err) {
    console.error('TMDB Direct Fallback error:', err);
    return [];
  }
};

export const fetchTMDBPopularTvShows = async (page = 1) => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`);
    const data = await res.json();

    if (data.results && Array.isArray(data.results)) {
      return data.results.map((t: any) => ({
        _id: t.id.toString(),
        tmdbId: t.id.toString(),
        name: t.name,
        slug: (t.name || 'tv-show').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${t.id}`,
        storyline: t.overview || 'No storyline available.',
        posterUrl: t.poster_path
          ? `${TMDB_IMAGE_BASE}${t.poster_path}`
          : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80',
        bannerUrl: t.backdrop_path ? `${TMDB_IMAGE_ORIGINAL}${t.backdrop_path}` : `${TMDB_IMAGE_BASE}${t.poster_path}`,
        firstAirYear: t.first_air_date ? parseInt(t.first_air_date.split('-')[0]) : 2024,
        numberOfSeasons: 1,
        ratingAverage: Math.round((t.vote_average || 8.0) * 10) / 10,
        ratingCount: t.vote_count || 400,
        genres: [{ name: 'Popular', slug: 'popular' }],
      }));
    }
    return [];
  } catch (err) {
    console.error('TMDB TV Popular Fallback error:', err);
    return [];
  }
};

export const fetchTMDBMovieDetail = async (idOrSlug: string) => {
  try {
    const extractedTmdbId = idOrSlug.split('-').pop();
    const targetId = (extractedTmdbId && !isNaN(Number(extractedTmdbId))) ? extractedTmdbId : '19995';

    const res = await fetch(`${TMDB_BASE_URL}/movie/${targetId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`);
    const data = await res.json();

    const videos = data.videos?.results || [];
    const trailer = videos.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip'));
    
    const youtubeKey = trailer?.key || POPULAR_YOUTUBE_KEYS[Math.abs(parseInt(targetId || '0')) % POPULAR_YOUTUBE_KEYS.length];
    const youtubeUrl = `https://www.youtube.com/embed/${youtubeKey}`;

    return {
      _id: data.id ? data.id.toString() : targetId,
      tmdbId: data.id ? data.id.toString() : targetId,
      title: data.title || 'Featured Movie',
      slug: (data.title || 'featured-movie').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${data.id}`,
      storyline: data.overview || 'No storyline available.',
      posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : '',
      bannerUrl: data.backdrop_path ? `${TMDB_IMAGE_ORIGINAL}${data.backdrop_path}` : '',
      trailerUrl: youtubeUrl,
      videoUrl: youtubeUrl,
      releaseYear: data.release_date ? parseInt(data.release_date.split('-')[0]) : 2024,
      runtimeMinutes: data.runtime || 128,
      ratingAverage: Math.round((data.vote_average || 8.0) * 10) / 10,
      ratingCount: data.vote_count || 1200,
      country: data.production_countries?.[0]?.name || 'United States',
      genres: data.genres?.map((g: any) => g.name) || ['Action', 'Sci-Fi'],
    };
  } catch (err) {
    console.error('TMDB Direct Detail Fallback error:', err);
    return null;
  }
};

export const fetchTMDBTvShowDetail = async (idOrSlug: string) => {
  try {
    const extractedTmdbId = idOrSlug.split('-').pop();
    const targetId = (extractedTmdbId && !isNaN(Number(extractedTmdbId))) ? extractedTmdbId : '1399';

    const res = await fetch(`${TMDB_BASE_URL}/tv/${targetId}?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    if (!data || !data.id) return null;

    return {
      _id: data.id.toString(),
      tmdbId: data.id.toString(),
      name: data.name,
      slug: (data.name || 'tv-show').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${data.id}`,
      storyline: data.overview || 'No storyline available.',
      posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : '',
      bannerUrl: data.backdrop_path ? `${TMDB_IMAGE_ORIGINAL}${data.backdrop_path}` : '',
      trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
      firstAirYear: data.first_air_date ? parseInt(data.first_air_date.split('-')[0]) : 2024,
      numberOfSeasons: data.number_of_seasons || 1,
      numberOfEpisodes: data.number_of_episodes || 10,
      ratingAverage: Math.round((data.vote_average || 8.0) * 10) / 10,
      ratingCount: data.vote_count || 500,
      country: data.origin_country?.[0] || 'US',
      status: data.status || 'Returning Series',
      genres: data.genres?.map((g: any) => g.name) || ['Action', 'Drama'],
    };
  } catch (err) {
    console.error('TMDB TV Show Detail Fallback error:', err);
    return null;
  }
};
