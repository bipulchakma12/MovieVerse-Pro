import mongoose from 'mongoose';
import { IMPORT_STATUS } from '../types/tmdb.types.js';

const tmdbImportProgressSchema = new mongoose.Schema(
  {
    exportFilename: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(IMPORT_STATUS),
      default: IMPORT_STATUS.IDLE,
      index: true,
    },
    totalMoviesInExport: {
      type: Number,
      default: 0,
    },
    processedCount: {
      type: Number,
      default: 0,
    },
    importedCount: {
      type: Number,
      default: 0,
    },
    skippedCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    currentBatchIndex: {
      type: Number,
      default: 0,
    },
    totalBatches: {
      type: Number,
      default: 0,
    },
    batchSize: {
      type: Number,
      default: 100,
    },
    lastProcessedTmdbId: {
      type: Number,
      default: null,
    },
    estimatedSecondsRemaining: {
      type: Number,
      default: 0,
    },
    startedAt: Date,
    completedAt: Date,
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    lastErrorMessage: String,
  },
  {
    timestamps: true,
  }
);

export const TmdbImportProgress = mongoose.model('TmdbImportProgress', tmdbImportProgressSchema);
