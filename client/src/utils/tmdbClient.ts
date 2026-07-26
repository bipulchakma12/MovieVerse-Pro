export const TMDB_API_KEY = '6e7c00461b0e03333f481d7c61800e3d';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMAGE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

export const fetchTMDBPopularMovies = async () => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`);
    const data = await res.json();
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((m: any) => ({
        _id: m.id.toString(),
        tmdbId: m.id,
        title: m.title,
        slug: m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        storyline: m.overview || 'No storyline available.',
        posterUrl: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
        bannerUrl: m.backdrop_path ? `${TMDB_IMAGE_ORIGINAL}${m.backdrop_path}` : '',
        trailerUrl: `https://www.youtube.com/embed/YoHD9XEInc0`,
        videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
        releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : 2024,
        runtimeMinutes: 120,
        ratingAverage: Math.round((m.vote_average || 7.5) * 10) / 10,
        ratingCount: m.vote_count || 100,
        genres: [{ name: 'Popular', slug: 'popular' }],
      }));
    }
    return [];
  } catch (err) {
    console.error('TMDB Direct Fallback error:', err);
    return [];
  }
};

export const fetchTMDBMovieDetail = async (idOrSlug: string) => {
  try {
    const isId = /^\d+$/.test(idOrSlug);
    let tmdbId = isId ? idOrSlug : null;

    if (!tmdbId) {
      // Fetch popular to find matching title slug
      const popular = await fetchTMDBPopularMovies();
      const match = popular.find((m: any) => m.slug === idOrSlug || m._id === idOrSlug);
      if (match) tmdbId = match.tmdbId.toString();
    }

    const targetId = tmdbId || '1120293'; // Fallback sample ID
    const res = await fetch(`${TMDB_BASE_URL}/movie/${targetId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`);
    const data = await res.json();

    const videos = data.videos?.results || [];
    const trailer = videos.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : 'https://www.youtube.com/embed/YoHD9XEInc0';

    return {
      _id: data.id.toString(),
      tmdbId: data.id,
      title: data.title || 'Featured Blockbuster',
      slug: (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      storyline: data.overview || 'No storyline available.',
      posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : '',
      bannerUrl: data.backdrop_path ? `${TMDB_IMAGE_ORIGINAL}${data.backdrop_path}` : '',
      trailerUrl,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      releaseYear: data.release_date ? parseInt(data.release_date.split('-')[0]) : 2024,
      runtimeMinutes: data.runtime || 120,
      ratingAverage: Math.round((data.vote_average || 8.0) * 10) / 10,
      ratingCount: data.vote_count || 500,
      country: data.production_countries?.[0]?.name || 'United States',
      genres: data.genres?.map((g: any) => g.name) || ['Action', 'Sci-Fi'],
    };
  } catch (err) {
    console.error('TMDB Direct Detail Fallback error:', err);
    return null;
  }
};
