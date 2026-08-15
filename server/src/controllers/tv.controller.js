import { TvShow } from '../models/TvShow.js';
import { Genre } from '../models/Genre.js';
import { fetchFromTMDB, TMDB_CONFIG } from '../config/tmdb.js';

/**
 * On-the-fly live TMDB TV Show fetcher & upsert into MongoDB
 */
const fetchAndSaveTmdbTvShow = async (tmdbId) => {
  try {
    const tmdbData = await fetchFromTMDB(`/tv/${tmdbId}`);
    if (!tmdbData || !tmdbData.id) return null;

    const slug =
      tmdbData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${tmdbData.id}`;

    const posterUrl = tmdbData.poster_path
      ? `${TMDB_CONFIG.TMDB_IMAGE_BASE}${tmdbData.poster_path}`
      : 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=600&q=80';
    const bannerUrl = tmdbData.backdrop_path
      ? `${TMDB_CONFIG.TMDB_IMAGE_ORIGINAL}${tmdbData.backdrop_path}`
      : posterUrl;

    const firstAirYear = tmdbData.first_air_date ? parseInt(tmdbData.first_air_date.split('-')[0]) : 2024;
    const cinesrcUrl = `https://vidsrc.cc/v2/embed/tv/${tmdbData.id}/1/1`;

    const tvShowDoc = await TvShow.findOneAndUpdate(
      { tmdbId: String(tmdbData.id) },
      {
        tmdbId: String(tmdbData.id),
        name: tmdbData.name,
        originalName: tmdbData.original_name || tmdbData.name,
        slug,
        storyline: tmdbData.overview || 'No storyline available.',
        posterUrl,
        bannerUrl,
        trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
        cinesrcUrl,
        firstAirYear,
        firstAirDate: tmdbData.first_air_date ? new Date(tmdbData.first_air_date) : undefined,
        numberOfSeasons: tmdbData.number_of_seasons || 1,
        numberOfEpisodes: tmdbData.number_of_episodes || 10,
        originalLanguage: tmdbData.original_language ? tmdbData.original_language.toUpperCase() : 'English',
        country: tmdbData.origin_country?.[0] || 'US',
        ratingAverage: Math.round((tmdbData.vote_average || 8.0) * 10) / 10,
        ratingCount: tmdbData.vote_count || 100,
        popularity: tmdbData.popularity || 50,
        status: tmdbData.status || 'Returning Series',
        isFeatured: (tmdbData.vote_average || 0) >= 8.0,
        isTrending: (tmdbData.popularity || 0) >= 50,
      },
      { upsert: true, new: true }
    );

    return tvShowDoc;
  } catch (err) {
    console.error('Failed to auto-fetch TMDB TV Show:', err.message);
    return null;
  }
};

// @desc    Get all TV shows with filtering, live TMDB search, pagination
// @route   GET /api/tv
export const getTvShows = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      year,
      sort = '-createdAt',
      page = 1,
      limit = 30,
      featured,
      trending,
    } = req.query;

    const query = {};

    if (search) {
      // Live search fallback to TMDB search API
      try {
        const tmdbSearch = await fetchFromTMDB('/search/tv', { query: search, page });
        if (tmdbSearch && Array.isArray(tmdbSearch.results) && tmdbSearch.results.length > 0) {
          for (const item of tmdbSearch.results.slice(0, 10)) {
            if (item.id) await fetchAndSaveTmdbTvShow(item.id);
          }
        }
      } catch (e) {}

      query.$or = [
        { name: new RegExp(search, 'i') },
        { tmdbId: search },
      ];
    }
    if (genre && genre !== 'all') {
      const foundGenre = await Genre.findOne({ slug: genre });
      if (foundGenre) query.genres = foundGenre._id;
    }
    if (year) query.firstAirYear = Number(year);
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;

    const skip = (Number(page) - 1) * Number(limit);

    let tvShows = await TvShow.find(query)
      .populate('genres', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // If page requested exceeds local DB or returns few items, live fetch from TMDB API
    if (tvShows.length < Number(limit) && !search) {
      try {
        const tmdbPageRes = await fetchFromTMDB('/tv/popular', { page });
        if (tmdbPageRes && Array.isArray(tmdbPageRes.results) && tmdbPageRes.results.length > 0) {
          for (const item of tmdbPageRes.results) {
            if (item.id) await fetchAndSaveTmdbTvShow(item.id);
          }
          // Re-query MongoDB after live TMDB page import
          tvShows = await TvShow.find(query)
            .populate('genres', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));
        }
      } catch (e) {}
    }

    const total = await TvShow.countDocuments(query);
    const calculatedPages = Math.ceil(total / Number(limit));
    const pages = search ? calculatedPages : Math.max(calculatedPages, 500);

    res.status(200).json({
      success: true,
      count: tvShows.length,
      total: search ? total : 50000,
      pages,
      currentPage: Number(page),
      data: tvShows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single TV show by ID, TMDB ID or Slug (with 100,000+ TMDB Live Auto-Fetch)
// @route   GET /api/tv/:idOrSlug
export const getTvShowByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let tvShow;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      tvShow = await TvShow.findById(idOrSlug).populate('genres', 'name slug');
    } else {
      tvShow = await TvShow.findOne({
        $or: [
          { slug: idOrSlug },
          { tmdbId: idOrSlug },
          { slug: new RegExp('^' + idOrSlug + '$', 'i') },
        ],
      }).populate('genres', 'name slug');
    }

    // If not found in MongoDB, extract TMDB ID and live fetch from 100,000+ TMDB catalog
    if (!tvShow) {
      const extractedTmdbId = idOrSlug.split('-').pop();
      if (extractedTmdbId && !isNaN(Number(extractedTmdbId))) {
        tvShow = await fetchAndSaveTmdbTvShow(extractedTmdbId);
      }
    }

    if (!tvShow) {
      return res.status(404).json({ success: false, message: 'TV Show not found' });
    }

    tvShow.viewsCount += 1;
    await tvShow.save();

    res.status(200).json({
      success: true,
      data: tvShow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new TV Show (Admin)
// @route   POST /api/tv
export const createTvShow = async (req, res, next) => {
  try {
    const tvShow = await TvShow.create(req.body);
    res.status(201).json({
      success: true,
      message: 'TV Show created successfully',
      data: tvShow,
    });
  } catch (error) {
    next(error);
  }
};
