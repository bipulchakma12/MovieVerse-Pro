import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Movie, Genre } from '../models/index.js';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY || '6e7c00461b0e03333f481d7c61800e3d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Famous Cineb Popular Movie TMDB IDs
const CINEB_TOP_MOVIES = [
  533535, // Deadpool & Wolverine
  1022789, // Inside Out 2
  872585, // Oppenheimer
  76600,  // Avatar: The Way of Water
  693134, // Dune: Part Two
  603692, // John Wick: Chapter 4
  299534, // Avengers: Endgame
  27205,  // Inception
  157336, // Interstellar
  155,    // The Dark Knight
  634649, // Spider-Man: No Way Home
  361743, // Top Gun: Maverick
  505642, // Black Panther: Wakanda Forever
  438148, // Minions: The Rise of Gru
  675353, // Sonic the Hedgehog 2
  508947, // Turning Red
];

export const seedCinebMovies = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn('⚠️ MONGODB_URI missing');
      return { success: false, message: 'MONGODB_URI missing' };
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(connStr);
    }

    console.log('🔄 Fetching Cineb Top Released Movies from TMDB API...');

    const defaultGenre = await Genre.findOneAndUpdate(
      { slug: 'cineb-popular' },
      { name: 'Cineb Popular Movies', slug: 'cineb-popular', description: 'Popular full movies available on Cineb' },
      { upsert: true, new: true }
    );

    let count = 0;

    for (const tmdbId of CINEB_TOP_MOVIES) {
      try {
        const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos`;
        const res = await fetch(url);
        if (!res.ok) continue;

        const data = await res.json();
        if (!data.title) continue;

        const slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        const posterUrl = data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';

        const bannerUrl = data.backdrop_path
          ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
          : posterUrl;

        const trailerObj = data.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || data.videos?.results?.[0];
        const trailerUrl = trailerObj ? `https://www.youtube.com/embed/${trailerObj.key}` : 'https://www.youtube.com/embed/YoHD9XEInc0';

        await Movie.findOneAndUpdate(
          { $or: [{ tmdbId: String(tmdbId) }, { slug }] },
          {
            title: data.title,
            slug,
            tmdbId: String(tmdbId),
            storyline: data.overview || `${data.title} - Popular released movie.`,
            posterUrl,
            bannerUrl,
            trailerUrl,
            videoUrl: `https://vidsrc.to/embed/movie/${tmdbId}`,
            releaseYear: data.release_date ? parseInt(data.release_date.split('-')[0]) : 2024,
            runtimeMinutes: data.runtime || 120,
            language: data.original_language ? data.original_language.toUpperCase() : 'EN',
            country: 'US',
            ratingAverage: Math.round((data.vote_average || 8.0) * 10) / 10,
            ratingCount: data.vote_count || 1500,
            viewsCount: (data.popularity || 500) * 10,
            isFeatured: true,
            isTrending: true,
            status: 'published',
            genres: [defaultGenre._id],
          },
          { upsert: true, new: true }
        );

        count++;
        console.log(`  ✅ Added Cineb Movie [${count}]: ${data.title} (TMDB ID: ${tmdbId})`);
      } catch (err) {
        console.warn(`  ⚠️ Failed to fetch TMDB movie ${tmdbId}:`, err.message);
      }
    }

    console.log(`🎉 Cineb Movie Seeder Finished! Successfully loaded ${count} top released movies into MongoDB Atlas!`);
    return { success: true, message: `Loaded ${count} top Cineb movies into MongoDB Atlas`, count };
  } catch (error) {
    console.error('❌ Cineb Seeder Error:', error.message);
    return { success: false, message: error.message };
  }
};
