import express from 'express';
import { getDashboardStats, getGenreDistribution } from '../controllers/analytics.controller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/genres', protect, adminOnly, getGenreDistribution);

export default router;
