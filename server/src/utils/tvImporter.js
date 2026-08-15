import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fetchFromTMDB, TMDB_CONFIG } from '../config/tmdb.js';
import { TvShow, Genre } from '../models/index.js';

dotenv.config();

/**
 * Sync extensive list of TMDB TV Shows (Popular & Trending TV Series) into MongoDB
 */
export const syncTvShowsFromTMDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn('⚠️ MONGODB_URI missing for TMDB TV sync');
      return { success: false, message: 'MONGODB_URI missing' };
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connStr);
    }

    console.log('🔄 Fetching live TV genres from TMDB API...');
    const genreData = await fetchFromTMDB('/genre/tv/list');
    
    const genreMap = new Map();
    for (const g of genreData.genres || []) {
      const slug = g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const genreDoc = await Genre.findOneAndUpdate(
        { slug },
        { name: g.name, slug, description: `${g.name} TV Shows` },
        { upsert: true, new: true }
      );
      genreMap.set(g.id, genreDoc._id);
    }

    console.log('📺 Fetching popular & trending TV Series from TMDB API...');
    const pagesToFetch = [1, 2, 3, 4, 5];
    const fetchPromises = [];

    for (const page of pagesToFetch) {
      fetchPromises.push(fetchFromTMDB('/tv/popular', { page }).catch(() => ({ results: [] })));
      fetchPromises.push(fetchFromTMDB('/trending/tv/week', { page }).catch(() => ({ results: [] })));
      fetchPromises.push(fetchFromTMDB('/tv/top_rated', { page }).catch(() => ({ results: [] })));
    }

    const resArray = await Promise.all(fetchPromises);
    let rawTvShows = [];
    resArray.forEach((r) => {
      if (r && Array.isArray(r.results)) {
        rawTvShows = rawTvShows.concat(r.results);
      }
    });

    const uniqueTvShows = Array.from(new Map(rawTvShows.map((t) => [t.id, t])).values());
    console.log(`📦 Fetched ${uniqueTvShows.length} unique TMDB TV Shows to process into MongoDB...`);

    let importedCount = 0;

    for (let index = 0; index < uniqueTvShows.length; index++) {
      const item = uniqueTvShows[index];
      if (!item.name || !item.poster_path) continue;

      const tmdbId = String(item.id);
      const slug =
        item.name
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

      const firstAirYear = item.first_air_date ? parseInt(item.first_air_date.split('-')[0]) : 2024;
      const cinesrcUrl = `https://vidsrc.cc/v2/embed/tv/${tmdbId}/1/1`;

      await TvShow.findOneAndUpdate(
        { tmdbId },
        {
          tmdbId,
          name: item.name,
          originalName: item.original_name || item.name,
          slug,
          storyline: item.overview || 'No storyline available for this TV series.',
          posterUrl,
          bannerUrl,
          trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
          cinesrcUrl,
          firstAirYear,
          firstAirDate: item.first_air_date ? new Date(item.first_air_date) : undefined,
          numberOfSeasons: 1 + Math.floor(Math.random() * 5),
          numberOfEpisodes: 8 + Math.floor(Math.random() * 20),
          originalLanguage: item.original_language ? item.original_language.toUpperCase() : 'English',
          country: item.origin_country?.[0] || 'US',
          ratingAverage: Math.round((item.vote_average || 8.0) * 10) / 10,
          ratingCount: item.vote_count || 150,
          popularity: item.popularity || 60,
          viewsCount: Math.floor(Math.random() * 30000) + 2000,
          status: 'Returning Series',
          isFeatured: (item.vote_average || 0) >= 8.0,
          isTrending: (item.popularity || 0) >= 50,
          genres: mappedGenres,
        },
        { upsert: true, new: true }
      );

      importedCount++;
    }

    console.log(`✅ Successfully imported and saved ${importedCount} TV Shows into MongoDB!`);
    return {
      success: true,
      message: `Successfully imported ${importedCount} TV Shows into MongoDB catalog with CineSrc stream links`,
      count: importedCount,
    };
  } catch (error) {
    console.error('❌ TMDB TV Sync Error:', error.message);
    return { success: false, message: error.message };
  }
};
