import { Favorite } from '../models/Favorite.js';
import { WatchLater } from '../models/WatchLater.js';
import { WatchHistory } from '../models/WatchHistory.js';

// ================= FAVORITES =================
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'movie',
        populate: { path: 'genres', select: 'name slug' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const existing = await Favorite.findOne({ user: req.user._id, movie: movieId });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ success: true, isFavorite: false, message: 'Removed from favorites' });
    } else {
      await Favorite.create({ user: req.user._id, movie: movieId });
      return res.status(201).json({ success: true, isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    next(error);
  }
};

// ================= WATCH LATER =================
export const getWatchLater = async (req, res, next) => {
  try {
    const list = await WatchLater.find({ user: req.user._id })
      .populate({
        path: 'movie',
        populate: { path: 'genres', select: 'name slug' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

export const toggleWatchLater = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const existing = await WatchLater.findOne({ user: req.user._id, movie: movieId });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ success: true, inWatchLater: false, message: 'Removed from watch later' });
    } else {
      await WatchLater.create({ user: req.user._id, movie: movieId });
      return res.status(201).json({ success: true, inWatchLater: true, message: 'Added to watch later' });
    }
  } catch (error) {
    next(error);
  }
};

// ================= WATCH HISTORY & CONTINUE WATCHING =================
export const getWatchHistory = async (req, res, next) => {
  try {
    const history = await WatchHistory.find({ user: req.user._id })
      .populate({
        path: 'movie',
        populate: { path: 'genres', select: 'name slug' },
      })
      .sort({ lastWatchedAt: -1 });

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

export const updateWatchProgress = async (req, res, next) => {
  try {
    const { movieId, watchedDurationSeconds, totalDurationSeconds } = req.body;
    const progressPercentage = totalDurationSeconds > 0 ? Math.round((watchedDurationSeconds / totalDurationSeconds) * 100) : 0;
    const isCompleted = progressPercentage >= 90;

    const history = await WatchHistory.findOneAndUpdate(
      { user: req.user._id, movie: movieId },
      {
        watchedDurationSeconds,
        totalDurationSeconds,
        progressPercentage,
        isCompleted,
        lastWatchedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
