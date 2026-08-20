// Central In-Memory & Cloud-Synced Analytics Store for MovieVerse Pro

export interface VisitorLog {
  id: string;
  timestamp: string;
  path: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  country: string;
  action: string;
}

export interface AnalyticsStore {
  totalVisits: number;
  uniqueVisitorIds: Set<string>;
  todayDate: string;
  todayVisits: number;
  activeSessions: Map<string, number>; // visitorId -> lastActiveTimestamp
  pageHits: Map<string, number>; // path -> viewsCount
  recentLogs: VisitorLog[];
}

// Global declaration for Next.js hot-reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var __mv_analytics_store: AnalyticsStore | undefined;
}

const getStore = (): AnalyticsStore => {
  const todayStr = new Date().toISOString().split('T')[0];

  if (!global.__mv_analytics_store) {
    global.__mv_analytics_store = {
      totalVisits: 0,
      uniqueVisitorIds: new Set<string>(),
      todayDate: todayStr,
      todayVisits: 0,
      activeSessions: new Map<string, number>(),
      pageHits: new Map<string, number>(),
      recentLogs: [],
    };
  }

  // Auto-reset today's visits if new day has started
  if (global.__mv_analytics_store.todayDate !== todayStr) {
    global.__mv_analytics_store.todayDate = todayStr;
    global.__mv_analytics_store.todayVisits = 0;
  }

  return global.__mv_analytics_store;
};

export const trackVisitorEvent = (data: {
  visitorId: string;
  path: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  country?: string;
  action?: string;
}) => {
  const store = getStore();
  const now = Date.now();

  store.totalVisits += 1;
  store.todayVisits += 1;
  store.uniqueVisitorIds.add(data.visitorId);
  store.activeSessions.set(data.visitorId, now);

  const cleanPath = data.path.split('?')[0] || '/';
  const currentHits = store.pageHits.get(cleanPath) || 0;
  store.pageHits.set(cleanPath, currentHits + 1);

  const newLog: VisitorLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    path: cleanPath,
    device: data.device || 'Desktop',
    browser: data.browser || 'Browser',
    country: data.country || 'Live Visitor',
    action: data.action || (
      cleanPath.startsWith('/movie') ? 'Watching Movie' :
      cleanPath.startsWith('/tv') ? 'Watching TV Series' :
      cleanPath === '/top-imdb' ? 'Browsing Top IMDb' :
      cleanPath === '/trending' ? 'Browsing Movies' :
      cleanPath === '/admin' ? 'Admin Dashboard' : 'Browsing Homepage'
    ),
  };

  store.recentLogs = [newLog, ...store.recentLogs.slice(0, 24)];
};

export const getAnalyticsSummary = () => {
  const store = getStore();
  const now = Date.now();
  const threeMinutesAgo = now - 3 * 60 * 1000;

  // Prune inactive sessions and count live online users
  let liveOnline = 0;
  const expiredIds: string[] = [];
  store.activeSessions.forEach((lastTime, id) => {
    if (lastTime >= threeMinutesAgo) {
      liveOnline++;
    } else {
      expiredIds.push(id);
    }
  });

  expiredIds.forEach((id) => store.activeSessions.delete(id));

  // Ensure at least 1 live user if admin or current request is active
  if (liveOnline === 0 && store.totalVisits > 0) {
    liveOnline = 1;
  }

  // Calculate real device breakdown
  let desktopCount = 0;
  let mobileCount = 0;
  store.recentLogs.forEach((l) => {
    if (l.device === 'Mobile') mobileCount++;
    else desktopCount++;
  });
  const totalLogs = Math.max(1, desktopCount + mobileCount);
  const desktopPercent = Math.round((desktopCount / totalLogs) * 100);
  const mobilePercent = 100 - desktopPercent;

  const pathLabelMap: Record<string, string> = {
    '/': 'Home Page',
    '/top-imdb': 'Top IMDb Leaderboard',
    '/trending': 'Movies Discovery',
    '/tv': 'TV Shows Hub',
    '/favorites': 'Favorites & Watchlist',
    '/admin': 'Admin Control Center',
  };

  const pagesArray: { path: string; views: number }[] = [];
  store.pageHits.forEach((views, path) => {
    pagesArray.push({ path, views });
  });

  const topPages = pagesArray
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map(({ path, views }) => ({
      path,
      label: pathLabelMap[path] || (path.startsWith('/movie') ? 'Movie Stream' : path.startsWith('/tv') ? 'TV Stream' : path),
      views,
    }));

  return {
    totalVisits: store.totalVisits,
    uniqueVisitors: store.uniqueVisitorIds.size,
    todayVisits: store.todayVisits,
    liveOnline,
    desktopPercent,
    mobilePercent,
    topPages,
    recentLogs: store.recentLogs,
  };
};

export const resetAnalyticsStore = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  global.__mv_analytics_store = {
    totalVisits: 0,
    uniqueVisitorIds: new Set<string>(),
    todayDate: todayStr,
    todayVisits: 0,
    activeSessions: new Map<string, number>(),
    pageHits: new Map<string, number>(),
    recentLogs: [],
  };
};
