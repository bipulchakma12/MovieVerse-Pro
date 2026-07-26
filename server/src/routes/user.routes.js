import express from 'express';
import {
  updateProfile,
  changePassword,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateChangePassword } from '../middleware/validate.js';

const router = express.Router();

// User profile routes (protected)
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, validateChangePassword, changePassword);

// Admin-only routes
router.get('/', protect, adminOnly, getAllUsers);
router.patch('/:id/block', protect, adminOnly, toggleBlockUser);
router.delete('/:id', protect, adminOnly, deleteUser);

export default router;
