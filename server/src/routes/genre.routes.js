import express from 'express';
import {
  getGenres,
  getGenreByIdOrSlug,
  createGenre,
  updateGenre,
  deleteGenre,
} from '../controllers/genre.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGenres);
router.get('/:idOrSlug', getGenreByIdOrSlug);
router.post('/', protect, adminOnly, createGenre);
router.put('/:id', protect, adminOnly, updateGenre);
router.delete('/:id', protect, adminOnly, deleteGenre);

export default router;
