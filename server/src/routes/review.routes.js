import express from 'express';
import {
  getMovieReviews,
  addReview,
  toggleLikeReview,
  addReply,
  deleteReview,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/movie/:movieId', getMovieReviews);
router.post('/movie/:movieId', protect, addReview);
router.patch('/:id/like', protect, toggleLikeReview);
router.post('/:id/reply', protect, addReply);
router.delete('/:id', protect, deleteReview);

export default router;
