import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fetchFromTMDB, TMDB_CONFIG } from '../config/tmdb.js';
import { Movie, Genre } from '../models/index.js';

dotenv.config();

/**
 * Sync extensive list of TMDB movies (Popular, Trending, Top Rated, Upcoming) into MongoDB
 */
export const syncMoviesFromTMDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn('⚠️ MONGODB_URI missing for TMDB sync');
      return { success: false, message: 'MONGODB_URI missing' };
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connStr);
    }

    console.log('🔄 Fetching live movie genres from TMDB API...');
    const genreData = await fetchFromTMDB('/genre/movie/list');
    
    // Save genres into MongoDB
    const genreMap = new Map();
    for (const g of genreData.genres || []) {
      const slug = g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const genreDoc = await Genre.findOneAndUpdate(
        { slug },
        { name: g.name, slug, description: `${g.name} movies` },
        { upsert: true, new: true }
      );
      genreMap.set(g.id, genreDoc._id);
    }

    console.log('🎬 Fetching 200+ movies across TMDB Popular, Trending, Top Rated & Upcoming lists...');

    const pagesToFetch = [1, 2, 3, 4, 5];
    const fetchPromises = [];

    for (const page of pagesToFetch) {
      fetchPromises.push(fetchFromTMDB('/movie/popular', { page }).catch(() => ({ results: [] })));
      fetchPromises.push(fetchFromTMDB('/trending/movie/week', { page }).catch(() => ({ results: [] })));
      fetchPromises.push(fetchFromTMDB('/movie/top_rated', { page }).catch(() => ({ results: [] })));
      fetchPromises.push(fetchFromTMDB('/movie/upcoming', { page }).catch(() => ({ results: [] })));
    }

    const resArray = await Promise.all(fetchPromises);
    let rawMovies = [];
    resArray.forEach((r) => {
      if (r && Array.isArray(r.results)) {
        rawMovies = rawMovies.concat(r.results);
      }
    });

    const uniqueMovies = Array.from(new Map(rawMovies.map((m) => [m.id, m])).values());
    console.log(`📦 Fetched ${uniqueMovies.length} unique TMDB movies to process into MongoDB...`);

    let importedCount = 0;

    for (let index = 0; index < uniqueMovies.length; index++) {
      const item = uniqueMovies[index];
      if (!item.title || !item.poster_path) continue;

      const tmdbId = String(item.id);
      const slug =
        item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') + `-${tmdbId}`;

      const posterUrl = `${TMDB_CONFIG.TMDB_IMAGE_BASE}${item.poster_path}`;
      const bannerUrl = item.backdrop_path
        ? `${TMDB_CONFIG.TMDB_IMAGE_ORIGINAL}${item.backdrop_path}`
        : posterUrl;

      const mappedGenres = (item.genre_ids || [])
        .map((id) => genreMap.get(id))
        .filter(Boolean);

      const releaseYear = item.release_date ? parseInt(item.release_date.split('-')[0]) : 2024;
      const cinesrcUrl = `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;

      await Movie.findOneAndUpdate(
        { tmdbId },
        {
          tmdbId,
          imdbId: item.imdb_id || null,
          title: item.title,
          originalTitle: item.original_title || item.title,
          slug,
          storyline: item.overview || 'No storyline available.',
          posterUrl,
          bannerUrl,
          trailerUrl: `https://www.youtube.com/embed/YoHD9XEInc0`,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          cinesrcUrl,
          releaseYear,
          releaseDate: item.release_date ? new Date(item.release_date) : undefined,
          runtimeMinutes: 120 + Math.floor(Math.random() * 35),
          language: item.original_language ? item.original_language.toUpperCase() : 'English',
          country: 'United States',
          ratingAverage: Math.round((item.vote_average || 7.5) * 10) / 10,
          ratingCount: item.vote_count || 100,
          popularity: item.popularity || 50,
          viewsCount: Math.floor(Math.random() * 25000) + 1000,
          isFeatured: (item.vote_average || 0) >= 7.8,
          isTrending: (item.popularity || 0) >= 40,
          status: 'published',
          genres: mappedGenres,
        },
        { upsert: true, new: true }
      );

      importedCount++;
    }

    console.log(`✅ Successfully imported and saved ${importedCount} TMDB movies into MongoDB!`);
    return {
      success: true,
      message: `Successfully imported ${importedCount} TMDB movies into MongoDB catalog with CineSrc stream links`,
      count: importedCount,
    };
  } catch (error) {
    console.error('❌ TMDB Extensive Sync Error:', error.message);
    return { success: false, message: error.message };
  }
};
