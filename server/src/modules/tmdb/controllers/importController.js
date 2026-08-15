import {
  startImportService,
  resumeImportService,
  stopImportService,
  getImportStatusService,
  getImportLogsService,
  searchTmdbMoviesService,
  importSingleMovieService,
} from '../services/importService.js';

// @desc    Start TMDB Daily Export import
// @route   POST /api/admin/import/start
// @access  Admin
export const startImport = async (req, res, next) => {
  try {
    const result = await startImportService();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Resume TMDB import if interrupted
// @route   POST /api/admin/import/resume
// @access  Admin
export const resumeImport = async (req, res, next) => {
  try {
    const result = await resumeImportService();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Stop / Pause TMDB import
// @route   POST /api/admin/import/stop
// @access  Admin
export const stopImport = async (req, res, next) => {
  try {
    const result = await stopImportService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get TMDB import status and progress metrics
// @route   GET /api/admin/import/status
// @access  Admin
export const getImportStatus = async (req, res, next) => {
  try {
    const result = await getImportStatusService();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get TMDB import logs
// @route   GET /api/admin/import/logs
// @access  Admin
export const getImportLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const result = await getImportLogsService(limit, page);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Search TMDB movies by title
// @route   GET /api/admin/import/search?q=MovieTitle
// @access  Public / Admin
export const searchTmdb = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || '';
    const results = await searchTmdbMoviesService(query);
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Select movie from TMDB search -> Auto Save TMDB ID & Generate CineSrc URL
// @route   POST /api/admin/import/select
// @access  Public / Admin
export const selectAndImportMovie = async (req, res, next) => {
  try {
    const { tmdbId } = req.body;
    if (!tmdbId) {
      return res.status(400).json({ success: false, message: 'TMDB ID is required' });
    }
    const result = await importSingleMovieService(tmdbId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

