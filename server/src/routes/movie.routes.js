import express from 'express';
import {
  getMovies,
  getMovieByIdOrSlug,
  getMovieRecommendations,
  createMovie,
  updateMovie,
  deleteMovie,
  syncTMDB,
} from '../controllers/movie.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMovies);
router.post('/sync-tmdb', syncTMDB);
router.get('/sync-tmdb', syncTMDB);
router.get('/:idOrSlug', getMovieByIdOrSlug);
router.get('/:id/recommendations', getMovieRecommendations);

// Admin movie management
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

export default router;
