// Central In-Memory & Cloud-Synced Analytics Store for MovieVerse Pro with Daily, Monthly & Yearly Breakdown

export interface VisitorLog {
  id: string;
  timestamp: string;
  path: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  country: string;
  action: string;
}

export interface DayStat {
  date: string; // 'YYYY-MM-DD'
  label: string; // e.g. 'Thu, Aug 20'
  visits: number;
  uniqueVisitors: number;
}

export interface MonthStat {
  month: string; // 'YYYY-MM'
  label: string; // e.g. 'Aug 2026'
  visits: number;
}

export interface YearStat {
  year: string; // 'YYYY'
  label: string; // e.g. '2026'
  visits: number;
}

export interface AnalyticsStore {
  totalVisits: number;
  uniqueVisitorIds: Set<string>;
  todayDate: string;
  todayVisits: number;
  activeSessions: Map<string, number>; // visitorId -> lastActiveTimestamp
  pageHits: Map<string, number>; // path -> viewsCount
  recentLogs: VisitorLog[];
  dailyMap: Map<string, { visits: number; uniqueSet: Set<string> }>; // 'YYYY-MM-DD' -> stats
  monthlyMap: Map<string, number>; // 'YYYY-MM' -> visits
  yearlyMap: Map<string, number>; // 'YYYY' -> visits
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
      dailyMap: new Map<string, { visits: number; uniqueSet: Set<string> }>(),
      monthlyMap: new Map<string, number>(),
      yearlyMap: new Map<string, number>(),
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
  clientHistory?: {
    dailyMap?: Record<string, number>;
    monthlyMap?: Record<string, number>;
    yearlyMap?: Record<string, number>;
    totalVisits?: number;
    uniqueCount?: number;
  };
}) => {
  const store = getStore();
  const now = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];
  const monthStr = todayStr.substring(0, 7);
  const yearStr = todayStr.substring(0, 4);

  // Sync client backup if server is fresh after cold start
  if (data.clientHistory && store.totalVisits < (data.clientHistory.totalVisits || 0)) {
    if (data.clientHistory.dailyMap) {
      Object.entries(data.clientHistory.dailyMap).forEach(([d, v]) => {
        const existing = store.dailyMap.get(d) || { visits: 0, uniqueSet: new Set<string>() };
        existing.visits = Math.max(existing.visits, v);
        store.dailyMap.set(d, existing);
      });
    }
    if (data.clientHistory.monthlyMap) {
      Object.entries(data.clientHistory.monthlyMap).forEach(([m, v]) => {
        store.monthlyMap.set(m, Math.max(store.monthlyMap.get(m) || 0, v));
      });
    }
    if (data.clientHistory.yearlyMap) {
      Object.entries(data.clientHistory.yearlyMap).forEach(([y, v]) => {
        store.yearlyMap.set(y, Math.max(store.yearlyMap.get(y) || 0, v));
      });
    }
    store.totalVisits = Math.max(store.totalVisits, data.clientHistory.totalVisits || 0);
  }

  // Increment genuine visits
  store.totalVisits += 1;
  store.todayVisits += 1;
  store.uniqueVisitorIds.add(data.visitorId);
  store.activeSessions.set(data.visitorId, now);

  // Update Daily Map
  const dayEntry = store.dailyMap.get(todayStr) || { visits: 0, uniqueSet: new Set<string>() };
  dayEntry.visits += 1;
  dayEntry.uniqueSet.add(data.visitorId);
  store.dailyMap.set(todayStr, dayEntry);

  // Update Monthly Map
  const currentMonthVisits = store.monthlyMap.get(monthStr) || 0;
  store.monthlyMap.set(monthStr, currentMonthVisits + 1);

  // Update Yearly Map
  const currentYearVisits = store.yearlyMap.get(yearStr) || 0;
  store.yearlyMap.set(yearStr, currentYearVisits + 1);

  // Update Page Hits
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

  // Generate last 14 days breakdown
  const dailyBreakdown: DayStat[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const stat = store.dailyMap.get(dateStr);
    dailyBreakdown.push({
      date: dateStr,
      label,
      visits: stat?.visits || 0,
      uniqueVisitors: stat?.uniqueSet?.size || 0,
    });
  }

  // Generate 12 months breakdown of current year
  const currentYear = new Date().getFullYear();
  const monthlyBreakdown: MonthStat[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let m = 0; m < 12; m++) {
    const monthNum = String(m + 1).padStart(2, '0');
    const monthKey = `${currentYear}-${monthNum}`;
    const label = `${monthNames[m]} ${currentYear}`;
    const visits = store.monthlyMap.get(monthKey) || 0;
    monthlyBreakdown.push({
      month: monthKey,
      label,
      visits,
    });
  }

  // Generate Yearly breakdown (last 3 years)
  const yearlyBreakdown: YearStat[] = [];
  for (let y = currentYear - 2; y <= currentYear; y++) {
    const yStr = String(y);
    const visits = store.yearlyMap.get(yStr) || 0;
    yearlyBreakdown.push({
      year: yStr,
      label: yStr,
      visits,
    });
  }

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
    dailyBreakdown,
    monthlyBreakdown,
    yearlyBreakdown,
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
    dailyMap: new Map<string, { visits: number; uniqueSet: Set<string> }>(),
    monthlyMap: new Map<string, number>(),
    yearlyMap: new Map<string, number>(),
  };
};
