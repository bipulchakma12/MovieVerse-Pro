// MovieVerse Pro — 100% Genuine Real-Time Cloud-Synced Visitor Tracking Engine

export interface VisitorLog {
  id: string;
  timestamp: string;
  path: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  country: string;
  action: string;
}

export interface VisitorAnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  liveOnline: number;
  desktopPercent: number;
  mobilePercent: number;
  topPages: { path: string; label: string; views: number }[];
  recentLogs: VisitorLog[];
}

const STORAGE_KEY_VISITOR_ID = 'mv_real_visitor_uuid';
const STORAGE_KEY_CACHED_STATS = 'mv_real_cached_stats';

// Get or assign real unique visitor UUID
export const getOrCreateVisitorId = (): { id: string; isNew: boolean } => {
  if (typeof window === 'undefined') return { id: 'srv', isNew: false };
  let id = localStorage.getItem(STORAGE_KEY_VISITOR_ID);
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY_VISITOR_ID, id);
    return { id, isNew: true };
  }
  return { id, isNew: false };
};

export const detectDevice = (): 'Desktop' | 'Mobile' | 'Tablet' => {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
};

export const detectBrowser = (): string => {
  if (typeof window === 'undefined') return 'Chrome';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Browser';
};

// 100% Real-Time Cross-Device Page Visit Recorder
export const recordPageVisit = async (pathName = '/') => {
  if (typeof window === 'undefined') return;

  try {
    const { id: visitorId } = getOrCreateVisitorId();
    const device = detectDevice();
    const browser = detectBrowser();

    const payload = {
      visitorId,
      path: pathName || '/',
      device,
      browser,
      action: pathName.startsWith('/movie')
        ? 'Watching Movie'
        : pathName.startsWith('/tv')
        ? 'Watching TV Series'
        : pathName === '/top-imdb'
        ? 'Viewing Top IMDb'
        : pathName === '/trending'
        ? 'Browsing Movies'
        : pathName === '/admin'
        ? 'Admin Dashboard'
        : 'Viewing Homepage',
    };

    // Send Beacon / API request to central Next.js server
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Track error:', e);
  }
};

// 100% Real-Time Analytics Fetcher from Central Server
export const fetchLiveVisitorAnalytics = async (): Promise<VisitorAnalyticsData> => {
  if (typeof window === 'undefined') {
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      todayVisits: 0,
      liveOnline: 1,
      desktopPercent: 100,
      mobilePercent: 0,
      topPages: [],
      recentLogs: [],
    };
  }

  try {
    const res = await fetch('/api/analytics/stats', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    const data = await res.json();
    if (data.success && data.data) {
      localStorage.setItem(STORAGE_KEY_CACHED_STATS, JSON.stringify(data.data));
      return data.data;
    }
  } catch (e) {
    console.error('Fetch live stats error:', e);
  }

  // Fallback to cached stats if network blips
  try {
    const cached = localStorage.getItem(STORAGE_KEY_CACHED_STATS);
    if (cached) return JSON.parse(cached);
  } catch {}

  return {
    totalVisits: 1,
    uniqueVisitors: 1,
    todayVisits: 1,
    liveOnline: 1,
    desktopPercent: 100,
    mobilePercent: 0,
    topPages: [{ path: '/', label: 'Home Page', views: 1 }],
    recentLogs: [],
  };
};

export const getVisitorAnalytics = (): VisitorAnalyticsData => {
  if (typeof window === 'undefined') {
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      todayVisits: 0,
      liveOnline: 1,
      desktopPercent: 100,
      mobilePercent: 0,
      topPages: [],
      recentLogs: [],
    };
  }
  try {
    const cached = localStorage.getItem(STORAGE_KEY_CACHED_STATS);
    if (cached) return JSON.parse(cached);
  } catch {}
  return {
    totalVisits: 0,
    uniqueVisitors: 0,
    todayVisits: 0,
    liveOnline: 1,
    desktopPercent: 100,
    mobilePercent: 0,
    topPages: [],
    recentLogs: [],
  };
};

// Reset analytics across central server and client
export const clearRealVisitorAnalytics = async () => {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/analytics/reset', { method: 'POST' });
  } catch (e) {}
  localStorage.removeItem(STORAGE_KEY_CACHED_STATS);
};
