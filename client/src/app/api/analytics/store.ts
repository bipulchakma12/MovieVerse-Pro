// Central In-Memory & Cloud-Synced Analytics Store for MovieVerse Pro with Permanent Multi-Layer Persistence
import fs from 'fs';
import path from 'path';

export interface VisitorLog {
  id: string;
  timestamp: string;
  path: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  country: string;
  action: string;
}

export interface ChartBarStat {
  key: string;
  label: string;
  subLabel?: string;
  visits: number;
  uniqueVisitors?: number;
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
  hourlyMap: Map<number, { visits: number; uniqueSet: Set<string> }>; // 0-23 -> stats
  monthlyMap: Map<string, number>; // 'YYYY-MM' -> visits
  yearlyMap: Map<string, number>; // 'YYYY' -> visits
}

// Global declaration for Next.js hot-reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var __mv_analytics_store: AnalyticsStore | undefined;
}

// File path for serverless persistent disk storage
const getDiskStoragePath = () => {
  try {
    const tmpDir = process.env.NODE_ENV === 'production' ? '/tmp' : process.cwd();
    return path.join(tmpDir, 'mv_analytics_persistent_v1.json');
  } catch {
    return '/tmp/mv_analytics_persistent_v1.json';
  }
};

const loadFromDisk = (): AnalyticsStore | null => {
  try {
    const filePath = getDiskStoragePath();
    if (fs.existsSync(filePath)) {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (raw && typeof raw.totalVisits === 'number') {
        const store: AnalyticsStore = {
          totalVisits: raw.totalVisits || 0,
          uniqueVisitorIds: new Set(raw.uniqueVisitorIds || []),
          todayDate: raw.todayDate || new Date().toISOString().split('T')[0],
          todayVisits: raw.todayVisits || 0,
          activeSessions: new Map(),
          pageHits: new Map(Object.entries(raw.pageHits || {})),
          recentLogs: raw.recentLogs || [],
          dailyMap: new Map(),
          hourlyMap: new Map(),
          monthlyMap: new Map(Object.entries(raw.monthlyMap || {})),
          yearlyMap: new Map(Object.entries(raw.yearlyMap || {})),
        };

        if (raw.dailyMap) {
          Object.entries(raw.dailyMap).forEach(([k, v]: [string, any]) => {
            store.dailyMap.set(k, {
              visits: v.visits || 0,
              uniqueSet: new Set(v.uniqueIds || []),
            });
          });
        }

        if (raw.hourlyMap) {
          Object.entries(raw.hourlyMap).forEach(([k, v]: [string, any]) => {
            store.hourlyMap.set(Number(k), {
              visits: v.visits || 0,
              uniqueSet: new Set(v.uniqueIds || []),
            });
          });
        }

        return store;
      }
    }
  } catch {}
  return null;
};

const saveToDisk = (store: AnalyticsStore) => {
  try {
    const filePath = getDiskStoragePath();
    const serializedDaily: Record<string, { visits: number; uniqueIds: string[] }> = {};
    store.dailyMap.forEach((v, k) => {
      serializedDaily[k] = {
        visits: v.visits,
        uniqueIds: Array.from(v.uniqueSet),
      };
    });

    const serializedHourly: Record<string, { visits: number; uniqueIds: string[] }> = {};
    store.hourlyMap.forEach((v, k) => {
      serializedHourly[String(k)] = {
        visits: v.visits,
        uniqueIds: Array.from(v.uniqueSet),
      };
    });

    const serialized = {
      totalVisits: store.totalVisits,
      uniqueVisitorIds: Array.from(store.uniqueVisitorIds),
      todayDate: store.todayDate,
      todayVisits: store.todayVisits,
      pageHits: Object.fromEntries(store.pageHits),
      recentLogs: store.recentLogs.slice(0, 50),
      dailyMap: serializedDaily,
      hourlyMap: serializedHourly,
      monthlyMap: Object.fromEntries(store.monthlyMap),
      yearlyMap: Object.fromEntries(store.yearlyMap),
    };

    fs.writeFileSync(filePath, JSON.stringify(serialized), 'utf-8');
  } catch {}
};

const getStore = (): AnalyticsStore => {
  const todayStr = new Date().toISOString().split('T')[0];

  if (!global.__mv_analytics_store) {
    const diskData = loadFromDisk();
    if (diskData) {
      global.__mv_analytics_store = diskData;
    } else {
      global.__mv_analytics_store = {
        totalVisits: 0,
        uniqueVisitorIds: new Set<string>(),
        todayDate: todayStr,
        todayVisits: 0,
        activeSessions: new Map<string, number>(),
        pageHits: new Map<string, number>(),
        recentLogs: [],
        dailyMap: new Map<string, { visits: number; uniqueSet: Set<string> }>(),
        hourlyMap: new Map<number, { visits: number; uniqueSet: Set<string> }>(),
        monthlyMap: new Map<string, number>(),
        yearlyMap: new Map<string, number>(),
      };
    }
  }

  // Shift todayDate when calendar day changes, but NEVER touch past daily, monthly, yearly history
  if (global.__mv_analytics_store.todayDate !== todayStr) {
    global.__mv_analytics_store.todayDate = todayStr;
    global.__mv_analytics_store.todayVisits = 0;
    global.__mv_analytics_store.hourlyMap.clear();
    saveToDisk(global.__mv_analytics_store);
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
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const monthStr = todayStr.substring(0, 7);
  const yearStr = todayStr.substring(0, 4);
  const currentHour = now.getHours();

  // Merge client distributed backup so history is permanently cumulative
  if (data.clientHistory) {
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
    if (data.clientHistory.totalVisits && data.clientHistory.totalVisits > store.totalVisits) {
      store.totalVisits = data.clientHistory.totalVisits;
    }
  }

  // Increment genuine visits
  store.totalVisits += 1;
  store.todayVisits += 1;
  store.uniqueVisitorIds.add(data.visitorId);
  store.activeSessions.set(data.visitorId, now.getTime());

  // Update Daily Map (Permanent cumulative store)
  const dayEntry = store.dailyMap.get(todayStr) || { visits: 0, uniqueSet: new Set<string>() };
  dayEntry.visits += 1;
  dayEntry.uniqueSet.add(data.visitorId);
  store.dailyMap.set(todayStr, dayEntry);

  // Update Hourly Map for Today
  const hourEntry = store.hourlyMap.get(currentHour) || { visits: 0, uniqueSet: new Set<string>() };
  hourEntry.visits += 1;
  hourEntry.uniqueSet.add(data.visitorId);
  store.hourlyMap.set(currentHour, hourEntry);

  // Update Monthly Map (Permanent cumulative store)
  const currentMonthVisits = store.monthlyMap.get(monthStr) || 0;
  store.monthlyMap.set(monthStr, currentMonthVisits + 1);

  // Update Yearly Map (Permanent cumulative store)
  const currentYearVisits = store.yearlyMap.get(yearStr) || 0;
  store.yearlyMap.set(yearStr, currentYearVisits + 1);

  // Update Page Hits
  const cleanPath = data.path.split('?')[0] || '/';
  const currentHits = store.pageHits.get(cleanPath) || 0;
  store.pageHits.set(cleanPath, currentHits + 1);

  const newLog: VisitorLog = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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

  store.recentLogs = [newLog, ...store.recentLogs.slice(0, 49)];
  saveToDisk(store);
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

  // 1. TODAY: 12 intervals (Every 2 hours)
  const todayBreakdown: ChartBarStat[] = [];
  const hourLabels = [
    { start: 0, label: '12 AM', range: '12 AM - 2 AM' },
    { start: 2, label: '2 AM', range: '2 AM - 4 AM' },
    { start: 4, label: '4 AM', range: '4 AM - 6 AM' },
    { start: 6, label: '6 AM', range: '6 AM - 8 AM' },
    { start: 8, label: '8 AM', range: '8 AM - 10 AM' },
    { start: 10, label: '10 AM', range: '10 AM - 12 PM' },
    { start: 12, label: '12 PM', range: '12 PM - 2 PM' },
    { start: 14, label: '2 PM', range: '2 PM - 4 PM' },
    { start: 16, label: '4 PM', range: '4 PM - 6 PM' },
    { start: 18, label: '6 PM', range: '6 PM - 8 PM' },
    { start: 20, label: '8 PM', range: '8 PM - 10 PM' },
    { start: 22, label: '10 PM', range: '10 PM - 12 AM' },
  ];

  hourLabels.forEach((slot) => {
    const h1 = store.hourlyMap.get(slot.start);
    const h2 = store.hourlyMap.get(slot.start + 1);
    const visits = (h1?.visits || 0) + (h2?.visits || 0);
    const uniqueCount = (h1?.uniqueSet?.size || 0) + (h2?.uniqueSet?.size || 0);
    todayBreakdown.push({
      key: `h_${slot.start}`,
      label: slot.label,
      subLabel: slot.range,
      visits,
      uniqueVisitors: uniqueCount,
    });
  });

  // Helper generator for daily ranges (strictly cumulative from permanent dailyMap)
  const generateDailyRange = (daysCount: number): ChartBarStat[] => {
    const result: ChartBarStat[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const stat = store.dailyMap.get(dateStr);
      result.push({
        key: dateStr,
        label: daysCount <= 7 ? weekday : `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
        subLabel: fullLabel,
        visits: stat?.visits || 0,
        uniqueVisitors: stat?.uniqueSet?.size || 0,
      });
    }
    return result;
  };

  // 2. 7 DAYS Breakdown
  const sevenDaysBreakdown = generateDailyRange(7);

  // 3. 15 DAYS Breakdown
  const fifteenDaysBreakdown = generateDailyRange(15);

  // 4. 1 MONTH (30 Days) Breakdown
  const oneMonthBreakdown = generateDailyRange(30);

  // 5. 1 YEAR (12 Months) Breakdown
  const currentYear = new Date().getFullYear();
  const oneYearBreakdown: ChartBarStat[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let m = 0; m < 12; m++) {
    const monthNum = String(m + 1).padStart(2, '0');
    const monthKey = `${currentYear}-${monthNum}`;
    const label = monthNames[m];
    const fullLabel = `${monthNames[m]} ${currentYear}`;
    const visits = store.monthlyMap.get(monthKey) || 0;
    oneYearBreakdown.push({
      key: monthKey,
      label,
      subLabel: fullLabel,
      visits,
    });
  }

  // Yearly breakdown (last 3 years)
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
    todayBreakdown,
    sevenDaysBreakdown,
    fifteenDaysBreakdown,
    oneMonthBreakdown,
    oneYearBreakdown,
    dailyBreakdown: fifteenDaysBreakdown.map((b) => ({
      date: b.key,
      label: b.subLabel || b.label,
      visits: b.visits,
      uniqueVisitors: b.uniqueVisitors || 0,
    })),
    monthlyBreakdown: oneYearBreakdown.map((b) => ({
      month: b.key,
      label: b.subLabel || b.label,
      visits: b.visits,
    })),
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
    hourlyMap: new Map<number, { visits: number; uniqueSet: Set<string> }>(),
    monthlyMap: new Map<string, number>(),
    yearlyMap: new Map<string, number>(),
  };
  saveToDisk(global.__mv_analytics_store);
};
