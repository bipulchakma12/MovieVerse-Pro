import { startImportService } from '../services/importService.js';

/**
 * Scheduled Cron Job helper to trigger daily TMDB Export Import
 */
export const runDailyImportJob = async () => {
  console.log('⏰ Triggering Scheduled TMDB Daily Export Importer Job...');
  try {
    const result = await startImportService();
    console.log('✅ Daily Import Job started successfully:', result);
  } catch (error) {
    console.error('⚠️ Daily Import Job error:', error.message);
  }
};
