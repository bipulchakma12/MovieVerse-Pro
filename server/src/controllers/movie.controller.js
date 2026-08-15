import { Movie } from '../models/Movie.js';
import { Genre } from '../models/Genre.js';

// @desc    Get all movies with filtering, sorting, pagination, and search
// @route   GET /api/movies
export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      year,
      language,
      country,
      sort = '-createdAt',
      page = 1,
      limit = 12,
      featured,
      trending,
    } = req.query;

    const query = { status: 'published' };

    if (search) {
      query.$text = { $search: search };
    }
    if (genre) {
      const foundGenre = await Genre.findOne({ slug: genre });
      if (foundGenre) query.genres = foundGenre._id;
    }
    if (year) query.releaseYear = Number(year);
    if (language) query.language = new RegExp(language, 'i');
    if (country) query.country = new RegExp(country, 'i');
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;

    const skip = (Number(page) - 1) * Number(limit);

    let movies = await Movie.find(query)
      .populate('genres', 'name slug')
      .populate('castMembers.person', 'name photoUrl roleType')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // If page requested exceeds local DB or returns few items, live fetch from TMDB API
    if (movies.length < Number(limit) && !search) {
      try {
        const { fetchFromTMDB, TMDB_CONFIG } = await import('../config/tmdb.js');
        const tmdbPageRes = await fetchFromTMDB('/movie/popular', { page });
        if (tmdbPageRes && Array.isArray(tmdbPageRes.results) && tmdbPageRes.results.length > 0) {
          for (const item of tmdbPageRes.results) {
            if (item.id) {
              const tmdbId = String(item.id);
              const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${tmdbId}`;
              await Movie.findOneAndUpdate(
                { tmdbId },
                {
                  tmdbId,
                  title: item.title,
                  originalTitle: item.original_title || item.title,
                  slug,
                  storyline: item.overview || 'No storyline available.',
                  posterUrl: item.poster_path ? `${TMDB_CONFIG.TMDB_IMAGE_BASE}${item.poster_path}` : '',
                  bannerUrl: item.backdrop_path ? `${TMDB_CONFIG.TMDB_IMAGE_ORIGINAL}${item.backdrop_path}` : '',
                  cinesrcUrl: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
                  releaseYear: item.release_date ? parseInt(item.release_date.split('-')[0]) : 2024,
                  ratingAverage: Math.round((item.vote_average || 7.5) * 10) / 10,
                  ratingCount: item.vote_count || 100,
                  popularity: item.popularity || 50,
                  status: 'published',
                },
                { upsert: true, new: true }
              );
            }
          }
          movies = await Movie.find(query)
            .populate('genres', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));
        }
      } catch (e) {}
    }

    const total = await Movie.countDocuments(query);
    const calculatedPages = Math.ceil(total / Number(limit));
    const pages = search ? calculatedPages : Math.max(calculatedPages, 500);

    res.status(200).json({
      success: true,
      count: movies.length,
      total: search ? total : 50000,
      pages,
      currentPage: Number(page),
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID or Slug
// @route   GET /api/movies/:idOrSlug
export const getMovieByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let movie;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(idOrSlug)
        .populate('genres', 'name slug')
        .populate('castMembers.person', 'name photoUrl bio roleType');
    } else {
      movie = await Movie.findOne({
        $or: [
          { slug: idOrSlug },
          { tmdbId: idOrSlug },
          { slug: new RegExp('^' + idOrSlug + '$', 'i') },
        ],
      })
        .populate('genres', 'name slug')
        .populate('castMembers.person', 'name photoUrl bio roleType');
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Increment views counter
    movie.viewsCount += 1;
    await movie.save();

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get movie recommendations (similar genres)
// @route   GET /api/movies/:id/recommendations
export const getMovieRecommendations = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const recommendations = await Movie.find({
      _id: { $ne: movie._id },
      genres: { $in: movie.genres },
    })
      .populate('genres', 'name slug')
      .limit(6);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie (Admin)
// @route   POST /api/movies
export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync real movies & genres live from TMDB API
// @route   POST /api/movies/sync-tmdb
export const syncTMDB = async (req, res, next) => {
  try {
    const { syncMoviesFromTMDB } = await import('../utils/tmdbImporter.js');
    const result = await syncMoviesFromTMDB();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    next(error);
  }
};
