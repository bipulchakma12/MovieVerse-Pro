import express from 'express';
import {
  getFavorites,
  toggleFavorite,
  getWatchLater,
  toggleWatchLater,
  getWatchHistory,
  updateWatchProgress,
} from '../controllers/userList.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Favorites
router.get('/favorites', protect, getFavorites);
router.post('/favorites/toggle', protect, toggleFavorite);

// Watch Later
router.get('/watch-later', protect, getWatchLater);
router.post('/watch-later/toggle', protect, toggleWatchLater);

// Watch History
router.get('/watch-history', protect, getWatchHistory);
router.post('/watch-history/progress', protect, updateWatchProgress);

export default router;
