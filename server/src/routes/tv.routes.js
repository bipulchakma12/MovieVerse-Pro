import express from 'express';
import {
  getTvShows,
  getTvShowByIdOrSlug,
  createTvShow,
} from '../controllers/tv.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTvShows);
router.get('/:idOrSlug', getTvShowByIdOrSlug);
router.post('/', protect, adminOnly, createTvShow);

export default router;
