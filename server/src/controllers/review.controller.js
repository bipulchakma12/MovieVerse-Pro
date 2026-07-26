import { Review } from '../models/Review.js';
import { Movie } from '../models/Movie.js';

// @desc    Get all reviews for a movie (by ID or Slug)
// @route   GET /api/reviews/movie/:movieId
export const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    let movieDoc = null;

    if (movieId.match(/^[0-9a-fA-F]{24}$/)) {
      movieDoc = await Movie.findById(movieId);
    } else {
      movieDoc = await Movie.findOne({ slug: movieId });
    }

    if (!movieDoc) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const reviews = await Review.find({ movie: movieDoc._id })
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update review for a movie (by ID or Slug)
// @route   POST /api/reviews/movie/:movieId
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { movieId: idOrSlug } = req.params;
    const userId = req.user._id;

    let movieDoc = null;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      movieDoc = await Movie.findById(idOrSlug);
    } else {
      movieDoc = await Movie.findOne({ slug: idOrSlug });
    }

    if (!movieDoc) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const movieId = movieDoc._id;
    let review = await Review.findOne({ user: userId, movie: movieId });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        user: userId,
        movie: movieId,
        rating,
        comment,
      });
    }

    // Recalculate movie average rating
    const stats = await Review.aggregate([
      { $match: { movie: movieId } },
      {
        $group: {
          _id: '$movie',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Movie.findByIdAndUpdate(movieId, {
        ratingAverage: Math.round(stats[0].avgRating * 10) / 10,
        ratingCount: stats[0].count,
      });
    }

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review saved successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike review
// @route   PATCH /api/reviews/:id/like
export const toggleLikeReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userId = req.user._id;
    const isLiked = review.likes.includes(userId);

    if (isLiked) {
      review.likes = review.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      review.likes.push(userId);
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a review
// @route   POST /api/reviews/:id/reply
export const addReply = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.replies.push({
      user: req.user._id,
      comment,
    });

    await review.save();

    const populated = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Reply posted',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
