import path from 'path';
import { Movie, Genre, Cast } from '../../../models/index.js';
import { TmdbImportProgress } from '../models/TmdbImportProgress.js';
import { TmdbImportLog } from '../models/TmdbImportLog.js';
import { IMPORT_STATUS, LOG_LEVEL } from '../types/tmdb.types.js';
import { downloadDailyExport, extractMovieIdsFromExport, getExportFilename } from '../utils/downloader.js';
import { fetchEnrichedMovieDetails, searchTmdbMovies } from '../utils/tmdbApiClient.js';
import { TMDB_CONFIG } from '../../../config/tmdb.js';

let isRunning = false;
let shouldStop = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Log helper
 */
const addLog = async (progressId, level, action, message, details = {}) => {
  try {
    await TmdbImportLog.create({
      importProgressId: progressId,
      level,
      action,
      tmdbId: details.tmdbId,
      movieTitle: details.movieTitle,
      message,
      details,
    });
  } catch (e) {
    console.error('Failed to save import log:', e.message);
  }
};

/**
 * Helper: Map TMDB Enriched Movie to MongoDB Movie format
 */
const saveTmdbMovieToMongo = async (enriched) => {
  const tmdbId = enriched.id;
  const title = enriched.title || enriched.original_title;
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${tmdbId}`;

  // Map genres
  const genreDocIds = [];
  if (enriched.genres && Array.isArray(enriched.genres)) {
    for (const g of enriched.genres) {
      const gSlug = g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const doc = await Genre.findOneAndUpdate(
        { slug: gSlug },
        { name: g.name, slug: gSlug, description: `${g.name} movies` },
        { upsert: true, new: true }
      );
      genreDocIds.push(doc._id);
    }
  }

  // Map cast & director
  const castRefList = [];
  if (enriched.credits?.cast && Array.isArray(enriched.credits.cast)) {
    const topCast = enriched.credits.cast.slice(0, 5);
    for (const c of topCast) {
      const photoUrl = c.profile_path ? `${TMDB_CONFIG.TMDB_IMAGE_BASE}${c.profile_path}` : undefined;
      const castDoc = await Cast.findOneAndUpdate(
        { name: c.name },
        { name: c.name, photoUrl, roleType: 'actor' },
        { upsert: true, new: true }
      );
      castRefList.push({
        person: castDoc._id,
        characterName: c.character || 'Role',
        role: 'actor',
      });
    }
  }

  // Find Director
  if (enriched.credits?.crew && Array.isArray(enriched.credits.crew)) {
    const director = enriched.credits.crew.find((cr) => cr.job === 'Director');
    if (director) {
      const photoUrl = director.profile_path ? `${TMDB_CONFIG.TMDB_IMAGE_BASE}${director.profile_path}` : undefined;
      const dDoc = await Cast.findOneAndUpdate(
        { name: director.name },
        { name: director.name, photoUrl, roleType: 'director' },
        { upsert: true, new: true }
      );
      castRefList.push({
        person: dDoc._id,
        characterName: 'Director',
        role: 'director',
      });
    }
  }

  // Media URLs
  const posterUrl = enriched.poster_path
    ? `${TMDB_CONFIG.TMDB_IMAGE_BASE}${enriched.poster_path}`
    : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80';
  
  const bannerUrl = enriched.backdrop_path
    ? `${TMDB_CONFIG.TMDB_IMAGE_ORIGINAL}${enriched.backdrop_path}`
    : posterUrl;

  // Trailers
  const youtubeTrailers = (enriched.videos?.results || []).filter(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const mainTrailerKey = youtubeTrailers[0]?.key;
  const trailerUrl = mainTrailerKey
    ? `https://www.youtube.com/embed/${mainTrailerKey}`
    : 'https://www.youtube.com/embed/YoHD9XEInc0';

  const releaseYear = enriched.release_date ? parseInt(enriched.release_date.split('-')[0]) : 2024;

  const movieData = {
    tmdbId,
    imdbId: enriched.external_ids?.imdb_id || enriched.imdb_id,
    title,
    originalTitle: enriched.original_title,
    slug,
    storyline: enriched.overview || 'No storyline available.',
    posterUrl,
    bannerUrl,
    trailerUrl,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    cinesrcUrl: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
    releaseYear,
    releaseDate: enriched.release_date ? new Date(enriched.release_date) : undefined,
    runtimeMinutes: enriched.runtime || 120,
    language: 'English',
    country: enriched.production_countries?.[0]?.name || 'United States',
    ratingAverage: Math.round((enriched.vote_average || 7.0) * 10) / 10,
    ratingCount: enriched.vote_count || 0,
    popularity: enriched.popularity || 0,
    viewsCount: Math.floor(Math.random() * 5000) + 100,
    budget: enriched.budget || 0,
    revenue: enriched.revenue || 0,
    adult: Boolean(enriched.adult),
    homepage: enriched.homepage || '',
    isFeatured: (enriched.vote_average || 0) >= 7.8,
    isTrending: (enriched.popularity || 0) >= 50,
    status: 'published',
    genres: genreDocIds,
    castMembers: castRefList,
    keywords: (enriched.keywords?.keywords || []).map((k) => k.name),
    productionCompanies: (enriched.production_companies || []).map((pc) => ({
      id: pc.id,
      name: pc.name,
      logoPath: pc.logo_path ? `${TMDB_CONFIG.TMDB_IMAGE_BASE}${pc.logo_path}` : undefined,
      originCountry: pc.origin_country,
    })),
    productionCountries: enriched.production_countries || [],
    streamingProviders: (enriched['watch/providers']?.results?.US?.flatrate || []).map((sp) => ({
      providerId: sp.provider_id,
      providerName: sp.provider_name,
      logoPath: sp.logo_path ? `${TMDB_CONFIG.TMDB_IMAGE_BASE}${sp.logo_path}` : undefined,
    })),
    trailers: (youtubeTrailers || []).slice(0, 5).map((y) => ({
      key: String(y.key || ''),
      name: String(y.name || ''),
      site: String(y.site || 'YouTube'),
      type: String(y.type || 'Trailer'),
    })),
  };

  const savedDoc = await Movie.findOneAndUpdate({ tmdbId }, movieData, { upsert: true, new: true });
  return savedDoc;
};

/**
 * Core Batch Importer Execution Loop
 */
const runImportLoop = async (progress, allMovieIds) => {
  isRunning = true;
  shouldStop = false;

  const batchSize = parseInt(process.env.IMPORT_BATCH_SIZE || '100', 10);
  const delayMs = parseInt(process.env.IMPORT_DELAY || '250', 10);

  const totalMovies = allMovieIds.length;
  const totalBatches = Math.ceil(totalMovies / batchSize);

  progress.status = IMPORT_STATUS.PROCESSING;
  progress.totalMoviesInExport = totalMovies;
  progress.totalBatches = totalBatches;
  progress.batchSize = batchSize;
  progress.startedAt = progress.startedAt || new Date();
  await progress.save();

  await addLog(progress._id, LOG_LEVEL.INFO, 'IMPORT_STARTED', `TMDB Daily Export import loop processing ${totalMovies} movies in ${totalBatches} batches.`);

  const startTime = Date.now();

  for (let bIndex = progress.currentBatchIndex; bIndex < totalBatches; bIndex++) {
    if (shouldStop) {
      progress.status = IMPORT_STATUS.PAUSED;
      progress.lastActivityAt = new Date();
      await progress.save();
      await addLog(progress._id, LOG_LEVEL.WARN, 'IMPORT_PAUSED', 'Import process paused by admin user.');
      isRunning = false;
      return;
    }

    const startIdx = bIndex * batchSize;
    const batchIds = allMovieIds.slice(startIdx, startIdx + batchSize);

    // Get existing tmdbIds in database to skip duplicates
    const existingMovies = await Movie.find({ tmdbId: { $in: batchIds } }).select('tmdbId');
    const existingTmdbIds = new Set(existingMovies.map((m) => m.tmdbId));

    for (const tmdbId of batchIds) {
      if (shouldStop) break;

      // Duplicate Handling: Never import same TMDB movie twice
      if (existingTmdbIds.has(tmdbId)) {
        progress.skippedCount += 1;
        progress.processedCount += 1;
        continue;
      }

      try {
        const enriched = await fetchEnrichedMovieDetails(tmdbId);

        if (!enriched) {
          progress.skippedCount += 1;
          progress.processedCount += 1;
          await addLog(progress._id, LOG_LEVEL.INFO, 'MOVIE_SKIPPED', `Skipped TMDB ID ${tmdbId} (Not found or adult/deleted)`, { tmdbId });
        } else {
          await saveTmdbMovieToMongo(enriched);
          progress.importedCount += 1;
          progress.processedCount += 1;
          progress.lastProcessedTmdbId = tmdbId;
          await addLog(progress._id, LOG_LEVEL.SUCCESS, 'MOVIE_IMPORTED', `Imported "${enriched.title}" (TMDB ID: ${tmdbId})`, {
            tmdbId,
            movieTitle: enriched.title,
          });
        }
      } catch (err) {
        progress.failedCount += 1;
        progress.processedCount += 1;
        await addLog(progress._id, LOG_LEVEL.ERROR, 'MOVIE_FAILED', `Failed importing TMDB ID ${tmdbId}: ${err.message}`, { tmdbId, error: err.message });
      }

      await sleep(delayMs);
    }

    // Update batch progress & estimate remaining time
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const itemsRemaining = totalMovies - progress.processedCount;
    const avgSecondsPerItem = progress.processedCount > 0 ? elapsedSeconds / progress.processedCount : 0.3;
    progress.estimatedSecondsRemaining = Math.round(itemsRemaining * avgSecondsPerItem);

    progress.currentBatchIndex = bIndex + 1;
    progress.lastActivityAt = new Date();
    await progress.save();
  }

  progress.status = IMPORT_STATUS.COMPLETED;
  progress.completedAt = new Date();
  progress.estimatedSecondsRemaining = 0;
  await progress.save();

  await addLog(progress._id, LOG_LEVEL.SUCCESS, 'IMPORT_FINISHED', `TMDB Import Completed! Total Imported: ${progress.importedCount}, Skipped: ${progress.skippedCount}, Failed: ${progress.failedCount}`);
  isRunning = false;
};

/**
 * Start Importer Service
 */
export const startImportService = async () => {
  if (isRunning) {
    throw new Error('An import process is already running.');
  }

  const filename = getExportFilename(0);
  const cacheDir = path.join(process.cwd(), 'scratch', 'tmdb_exports');

  let progress = await TmdbImportProgress.findOne({ exportFilename: filename });
  if (!progress) {
    progress = await TmdbImportProgress.create({ exportFilename: filename, status: IMPORT_STATUS.DOWNLOADING });
  }

  // 1. Download export
  progress.status = IMPORT_STATUS.DOWNLOADING;
  await progress.save();

  let gzipPath;
  try {
    gzipPath = await downloadDailyExport(filename, cacheDir);
  } catch (err) {
    // Try yesterday's export file if today's is not published yet
    const yesterdayFilename = getExportFilename(1);
    console.warn(`Today's export not ready, trying yesterday's: ${yesterdayFilename}`);
    gzipPath = await downloadDailyExport(yesterdayFilename, cacheDir);
  }

  // 2. Extract Movie IDs
  const allMovieIds = await extractMovieIdsFromExport(gzipPath);

  // 3. Start async batch processing loop (unblocked)
  runImportLoop(progress, allMovieIds).catch((err) => {
    console.error('Fatal error in import loop:', err);
    progress.status = IMPORT_STATUS.FAILED;
    progress.lastErrorMessage = err.message;
    progress.save();
  });

  return {
    success: true,
    message: 'TMDB Daily Export import started successfully',
    exportFilename: filename,
    totalMoviesInExport: allMovieIds.length,
  };
};

/**
 * Resume Interrupted Import
 */
export const resumeImportService = async () => {
  if (isRunning) {
    throw new Error('An import process is already running.');
  }

  const progress = await TmdbImportProgress.findOne({
    status: { $in: [IMPORT_STATUS.PAUSED, IMPORT_STATUS.FAILED, IMPORT_STATUS.PROCESSING] },
  }).sort({ updatedAt: -1 });

  if (!progress) {
    throw new Error('No paused or interrupted import found to resume.');
  }

  const cacheDir = path.join(process.cwd(), 'scratch', 'tmdb_exports');
  const gzipPath = path.join(cacheDir, progress.exportFilename);

  const allMovieIds = await extractMovieIdsFromExport(gzipPath);

  runImportLoop(progress, allMovieIds).catch((err) => {
    console.error('Fatal error in resumed import loop:', err);
    progress.status = IMPORT_STATUS.FAILED;
    progress.lastErrorMessage = err.message;
    progress.save();
  });

  return {
    success: true,
    message: `Resumed TMDB import from batch ${progress.currentBatchIndex}`,
    progress,
  };
};

/**
 * Stop / Pause Importer Service
 */
export const stopImportService = async () => {
  if (!isRunning) {
    return { success: true, message: 'No active import is currently running.' };
  }

  shouldStop = true;
  return { success: true, message: 'Stopping TMDB import loop. Progress will be saved.' };
};

/**
 * Get Import Status & Metrics
 */
export const getImportStatusService = async () => {
  const activeProgress = await TmdbImportProgress.findOne({})
    .sort({ updatedAt: -1 });

  if (!activeProgress) {
    return {
      status: IMPORT_STATUS.IDLE,
      isRunning: false,
      importedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      processedCount: 0,
      totalMoviesInExport: 0,
      remainingMovies: 0,
      estimatedSecondsRemaining: 0,
    };
  }

  const remainingMovies = Math.max(0, activeProgress.totalMoviesInExport - activeProgress.processedCount);

  return {
    progressId: activeProgress._id,
    exportFilename: activeProgress.exportFilename,
    status: activeProgress.status,
    isRunning,
    importedMovies: activeProgress.importedCount,
    skippedMovies: activeProgress.skippedCount,
    failedMovies: activeProgress.failedCount,
    processedMovies: activeProgress.processedCount,
    totalMoviesInExport: activeProgress.totalMoviesInExport,
    remainingMovies,
    currentBatchIndex: activeProgress.currentBatchIndex,
    totalBatches: activeProgress.totalBatches,
    estimatedSecondsRemaining: activeProgress.estimatedSecondsRemaining,
    lastActivityAt: activeProgress.lastActivityAt,
  };
};

/**
 * Get Import Logs
 */
export const getImportLogsService = async (limit = 100, page = 1) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    TmdbImportLog.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    TmdbImportLog.countDocuments(),
  ]);

  return {
    success: true,
    count: logs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: logs,
  };
};

/**
 * Search TMDB Movies by title
 */
export const searchTmdbMoviesService = async (query) => {
  if (!query || query.trim().length === 0) return [];
  const results = await searchTmdbMovies(query);
  return results.map((m) => ({
    tmdbId: String(m.id),
    title: m.title || m.original_title,
    originalTitle: m.original_title,
    releaseDate: m.release_date,
    releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : null,
    posterUrl: m.poster_path
      ? `${TMDB_CONFIG.TMDB_IMAGE_BASE}${m.poster_path}`
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    bannerUrl: m.backdrop_path ? `${TMDB_CONFIG.TMDB_IMAGE_ORIGINAL}${m.backdrop_path}` : null,
    ratingAverage: Math.round((m.vote_average || 7.0) * 10) / 10,
    overview: m.overview,
    popularity: m.popularity,
    cinesrcUrl: `https://vidsrc.cc/v2/embed/movie/${m.id}`,
  }));
};

/**
 * Import a Single Movie by TMDB ID
 * Automatically saves tmdbId & generates CineSrc stream URL
 */
export const importSingleMovieService = async (tmdbId) => {
  const enriched = await fetchEnrichedMovieDetails(tmdbId);
  if (!enriched) {
    throw new Error(`Movie with TMDB ID ${tmdbId} not found on TMDB`);
  }
  const savedMovie = await saveTmdbMovieToMongo(enriched);
  return {
    success: true,
    message: `Movie "${savedMovie.title}" imported successfully. TMDB ID ${tmdbId} saved & CineSrc URL generated.`,
    movie: savedMovie,
    cinesrcUrl: savedMovie.cinesrcUrl,
  };
};

