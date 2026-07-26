import express from 'express';
import {
  getCastMembers,
  getCastById,
  createCastMember,
  updateCastMember,
  deleteCastMember,
} from '../controllers/cast.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCastMembers);
router.get('/:id', getCastById);
router.post('/', protect, adminOnly, createCastMember);
router.put('/:id', protect, adminOnly, updateCastMember);
router.delete('/:id', protect, adminOnly, deleteCastMember);

export default router;
