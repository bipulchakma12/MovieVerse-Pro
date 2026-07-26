import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import readline from 'readline';
import https from 'https';
import http from 'http';

/**
 * Format date as MM_DD_YYYY for TMDB Daily Export filename
 */
export const getExportFilename = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  
  return `movie_ids_${mm}_${dd}_${yyyy}.json.gz`;
};

/**
 * Download TMDB Daily Export file (.json.gz) to local cache
 */
export const downloadDailyExport = async (filename, outputDir) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const destination = path.join(outputDir, filename);
  
  // If already downloaded today, return local file
  if (fs.existsSync(destination) && fs.statSync(destination).size > 1000) {
    console.log(`📁 Local export file exists: ${filename}`);
    return destination;
  }

  const exportBaseUrl = process.env.TMDB_EXPORT_URL || 'http://files.tmdb.org/p/exports/';
  const url = `${exportBaseUrl}${filename}`;

  console.log(`🌐 Downloading TMDB Daily Export from: ${url}`);

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 404) {
        return reject(new Error(`Daily export file not found (404): ${filename}`));
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download export. HTTP Status: ${response.statusCode}`));
      }

      const fileStream = fs.createWriteStream(destination);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ TMDB Daily Export downloaded: ${filename}`);
        resolve(destination);
      });

      fileStream.on('error', (err) => {
        fs.unlink(destination, () => {});
        reject(err);
      });
    });

    request.on('error', (err) => reject(err));
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Download timeout (30s)'));
    });
  });
};

/**
 * Extract all movie IDs from gunzipped JSON lines export stream
 * Line format: {"adult":false,"id":12,"original_title":"Finding Nemo","popularity":...}
 */
export const extractMovieIdsFromExport = async (gzipFilePath) => {
  const ids = [];
  const fileStream = fs.createReadStream(gzipFilePath);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gunzip),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line || !line.trim()) continue;
    try {
      const parsed = JSON.parse(line.trim());
      if (parsed.id && typeof parsed.id === 'number') {
        ids.push(parsed.id);
      }
    } catch (e) {
      // Ignore malformed line
    }
  }

  console.log(`📦 Extracted ${ids.length} total Movie IDs from TMDB Daily Export!`);
  return ids;
};
