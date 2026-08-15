import express from 'express';

const router = express.Router();

// @desc    API Root welcome & available endpoints
// @route   GET /api
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Welcome to MovieVerse Pro REST API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      movies: '/api/movies',
      auth: '/api/auth',
      genres: '/api/genres',
      reviews: '/api/reviews',
      userLists: '/api/user-lists',
      adminImport: '/api/admin/import',
    },
    timestamp: new Date().toISOString(),
  });
});

// @desc    Health check
// @route   GET /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'MovieVerse Pro API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
