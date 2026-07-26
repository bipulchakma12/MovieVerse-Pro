import mongoose from 'mongoose';
import { LOG_LEVEL } from '../types/tmdb.types.js';

const tmdbImportLogSchema = new mongoose.Schema(
  {
    importProgressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TmdbImportProgress',
      index: true,
    },
    level: {
      type: String,
      enum: Object.values(LOG_LEVEL),
      default: LOG_LEVEL.INFO,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    tmdbId: {
      type: Number,
      index: true,
    },
    movieTitle: String,
    message: {
      type: String,
      required: true,
    },
    details: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

export const TmdbImportLog = mongoose.model('TmdbImportLog', tmdbImportLogSchema);
