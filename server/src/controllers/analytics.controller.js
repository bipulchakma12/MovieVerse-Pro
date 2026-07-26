import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Review } from '../models/Review.js';
import { Genre } from '../models/Genre.js';

// @desc    Get system analytics summary (Admin)
// @route   GET /api/analytics/dashboard
// @access  Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalReviews,
      totalGenres,
      topViewedMovies,
      topRatedMovies,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({}),
      Movie.countDocuments({ status: 'published' }),
      Review.countDocuments({}),
      Genre.countDocuments({}),
      Movie.find({ status: 'published' })
        .sort({ viewsCount: -1 })
        .limit(5)
        .select('title viewsCount ratingAverage posterUrl slug'),
      Movie.find({ status: 'published' })
        .sort({ ratingAverage: -1, ratingCount: -1 })
        .limit(5)
        .select('title ratingAverage ratingCount posterUrl slug'),
      User.find({}).sort({ createdAt: -1 }).limit(5).select('name email avatar role createdAt'),
    ]);

    // Calculate total views across all movies
    const viewsAggregate = await Movie.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$viewsCount' } } },
    ]);
    const totalViews = viewsAggregate[0]?.totalViews || 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalMovies,
          totalReviews,
          totalGenres,
          totalViews,
        },
        topViewedMovies,
        topRatedMovies,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get genre breakdown analytics (Admin)
// @route   GET /api/analytics/genres
// @access  Admin
export const getGenreDistribution = async (req, res, next) => {
  try {
    const genreStats = await Movie.aggregate([
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          movieCount: { $sum: 1 },
          avgRating: { $avg: '$ratingAverage' },
        },
      },
      {
        $lookup: {
          from: 'genres',
          localField: '_id',
          foreignField: '_id',
          as: 'genreInfo',
        },
      },
      { $unwind: '$genreInfo' },
      {
        $project: {
          _id: 1,
          name: '$genreInfo.name',
          slug: '$genreInfo.slug',
          movieCount: 1,
          avgRating: { $round: ['$avgRating', 1] },
        },
      },
      { $sort: { movieCount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      count: genreStats.length,
      data: genreStats,
    });
  } catch (error) {
    next(error);
  }
};
