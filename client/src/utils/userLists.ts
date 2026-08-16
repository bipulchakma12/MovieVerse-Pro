export interface SavedMediaItem {
  _id: string;
  tmdbId?: string;
  title: string;
  slug: string;
  posterUrl: string;
  releaseYear?: number;
  runtimeMinutes?: number;
  ratingAverage?: number;
  type: 'movie' | 'tv';
  genres?: any[];
  savedAt?: number;
}

const FAV_KEY = 'movieverse_saved_favorites';
const WL_KEY = 'movieverse_saved_watchlater';

// Helper to get from storage
export function getSavedFavorites(): SavedMediaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isItemInFavorites(id: string): boolean {
  if (!id) return false;
  const list = getSavedFavorites();
  return list.some((item) => String(item._id) === String(id) || String(item.tmdbId) === String(id));
}

export function toggleItemFavorite(item: SavedMediaItem): boolean {
  if (!item || (!item._id && !item.tmdbId)) return false;
  const list = getSavedFavorites();
  const idToMatch = String(item._id || item.tmdbId);
  const exists = list.some((i) => String(i._id) === idToMatch || String(i.tmdbId) === idToMatch);

  let updated: SavedMediaItem[];
  if (exists) {
    updated = list.filter((i) => String(i._id) !== idToMatch && String(i.tmdbId) !== idToMatch);
  } else {
    updated = [{ ...item, savedAt: Date.now() }, ...list];
  }

  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('movieverse_lists_updated'));
  } catch (e) {
    console.error('Storage error:', e);
  }

  // Optional background backend sync
  syncWithBackend('/user-lists/favorites/toggle', item._id);

  return !exists;
}

// Watch Later Helpers
export function getSavedWatchLater(): SavedMediaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isItemInWatchLater(id: string): boolean {
  if (!id) return false;
  const list = getSavedWatchLater();
  return list.some((item) => String(item._id) === String(id) || String(item.tmdbId) === String(id));
}

export function toggleItemWatchLater(item: SavedMediaItem): boolean {
  if (!item || (!item._id && !item.tmdbId)) return false;
  const list = getSavedWatchLater();
  const idToMatch = String(item._id || item.tmdbId);
  const exists = list.some((i) => String(i._id) === idToMatch || String(i.tmdbId) === idToMatch);

  let updated: SavedMediaItem[];
  if (exists) {
    updated = list.filter((i) => String(i._id) !== idToMatch && String(i.tmdbId) !== idToMatch);
  } else {
    updated = [{ ...item, savedAt: Date.now() }, ...list];
  }

  try {
    localStorage.setItem(WL_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('movieverse_lists_updated'));
  } catch (e) {
    console.error('Storage error:', e);
  }

  // Optional background backend sync
  syncWithBackend('/user-lists/watch-later/toggle', item._id);

  return !exists;
}

async function syncWithBackend(endpoint: string, movieId?: string) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('movieverse-token');
  if (!token || !movieId) return;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ movieId }),
    }).catch(() => null);
  } catch (e) {
    // Ignore backend errors so user action never fails
  }
}
