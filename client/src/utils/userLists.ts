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
  watchedAt?: number;
  formattedWatchedTime?: string;
}

const FAV_KEY = 'movieverse_saved_favorites';
const WL_KEY = 'movieverse_saved_watchlater';
const HISTORY_KEY = 'movieverse_watch_history';

// ================= FAVORITES =================
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

// ================= WATCH LATER =================
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

// ================= WATCH HISTORY (Works 100% For Guests & Logged-in Users) =================
export function getWatchHistory(): SavedMediaItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addToWatchHistory(item: SavedMediaItem): void {
  if (!item || (!item._id && !item.tmdbId)) return;
  if (typeof window === 'undefined') return;

  try {
    const list = getWatchHistory();
    const idToMatch = String(item._id || item.tmdbId);

    // Remove if already exists so we can move it to the top
    const filtered = list.filter((i) => String(i._id) !== idToMatch && String(i.tmdbId) !== idToMatch);

    const now = Date.now();
    const historyItem: SavedMediaItem = {
      ...item,
      watchedAt: now,
      formattedWatchedTime: new Date(now).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Keep up to 50 items
    const updated = [historyItem, ...filtered].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('movieverse_lists_updated'));
  } catch (e) {
    console.error('Failed to update watch history:', e);
  }
}

export function removeFromWatchHistory(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    const list = getWatchHistory();
    const updated = list.filter((i) => String(i._id) !== String(id) && String(i.tmdbId) !== String(id));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('movieverse_lists_updated'));
  } catch (e) {}
}

export function clearWatchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event('movieverse_lists_updated'));
  } catch (e) {}
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
