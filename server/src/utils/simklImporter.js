import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fetchFromSimkl } from '../config/simkl.js';
import { Movie, Genre } from '../models/index.js';

dotenv.config();

const SIMKL_YOUTUBE_KEYS = [
  'YoHD9XEInc0',
  'Way9Dexny3w',
  'uYPbbksJxIg',
  'TcMBFSGVi1c',
  '8Qn_spdM5Zg',
  'd9MyW72ELq0',
  'EXeTwQWrcwY',
  'qEVUtrk8_B4',
  'hEJnMQGLa88',
  'a8Gx8wiNbs8',
];

/**
 * Import Simkl Trending Movies into MongoDB
 */
export const syncMoviesFromSimkl = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn('⚠️ MONGODB_URI missing for Simkl sync');
      return { success: false, message: 'MONGODB_URI missing' };
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connStr);
    }

    console.log('🔄 Fetching Simkl Trending Movies...');
    const simklMovies = await fetchFromSimkl('/movies/trending');

    if (!Array.isArray(simklMovies) || simklMovies.length === 0) {
      console.warn('⚠️ No movies returned from Simkl API');
      return { success: false, message: 'No movies returned from Simkl API' };
    }

    // Default Simkl Genre
    const defaultGenre = await Genre.findOneAndUpdate(
      { slug: 'simkl-trending' },
      { name: 'Simkl Trending', slug: 'simkl-trending', description: 'Trending movies from Simkl API' },
      { upsert: true, new: true }
    );

    let importedCount = 0;

    for (let idx = 0; idx < simklMovies.length; idx++) {
      const item = simklMovies[idx];
      if (!item.title) continue;

      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Formulate Simkl Poster URL
      const posterUrl = item.poster
        ? `https://simkl.in/posters/${item.poster}_m.jpg`
        : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';

      const bannerUrl = item.fanart
        ? `https://simkl.in/fanart/${item.fanart}_medium.jpg`
        : posterUrl;

      const youtubeKey = SIMKL_YOUTUBE_KEYS[idx % SIMKL_YOUTUBE_KEYS.length];
      const youtubeUrl = `https://www.youtube.com/embed/${youtubeKey}`;

      const releaseYear = item.release_date
        ? parseInt(item.release_date.split('/')[2] || item.release_date.split('-')[0]) || 2026
        : 2026;

      await Movie.findOneAndUpdate(
        { slug },
        {
          title: item.title,
          slug,
          storyline: item.overview || `${item.title} - Popular release tracked on Simkl.`,
          posterUrl,
          bannerUrl,
          trailerUrl: youtubeUrl,
          videoUrl: youtubeUrl,
          releaseYear,
          runtimeMinutes: 110 + (idx * 5) % 40,
          language: item.original_language ? item.original_language.toUpperCase() : 'English',
          country: item.country ? item.country.toUpperCase() : 'United States',
          ratingAverage: item.ratings?.simkl?.rating
            ? Math.round(item.ratings.simkl.rating * 10) / 10
            : 8.2,
          ratingCount: item.watched || 350,
          viewsCount: (item.plan_to_watch || 1000) + 500,
          isFeatured: true,
          isTrending: true,
          status: 'published',
          genres: [defaultGenre._id],
        },
        { upsert: true, new: true }
      );

      importedCount++;
    }

    console.log(`✅ Successfully imported ${importedCount} Simkl movies into MongoDB Atlas!`);
    return {
      success: true,
      message: `Imported ${importedCount} Simkl movies successfully`,
      count: importedCount,
    };
  } catch (error) {
    console.error('❌ Simkl Import Error:', error.message);
    return { success: false, message: error.message };
  }
};
