import express from 'express';
import {
  startImport,
  resumeImport,
  stopImport,
  getImportStatus,
  getImportLogs,
} from '../controllers/importController.js';
import { protect, adminOnly } from '../../../middleware/auth.js';

const router = express.Router();

// Admin Import Routes
router.post('/start', protect, adminOnly, startImport);
router.post('/resume', protect, adminOnly, resumeImport);
router.post('/stop', protect, adminOnly, stopImport);
router.get('/status', protect, adminOnly, getImportStatus);
router.get('/logs', protect, adminOnly, getImportLogs);

export default router;
