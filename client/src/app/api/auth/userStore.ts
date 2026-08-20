// Central User & Auth Store for MovieVerse Pro

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin' | 'vip';
  isBlocked: boolean;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
}

export interface UserStore {
  users: RegisteredUser[];
  totalLogins: number;
  todayLogins: number;
  todaySignups: number;
  todayDate: string;
}

// Global declaration for Next.js hot-reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var __mv_user_store: UserStore | undefined;
}

const initialSeedUsers: RegisteredUser[] = [
  {
    id: 'usr_admin_1',
    name: 'Bipul Chakma',
    email: 'chakmabipul499@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    role: 'admin',
    isBlocked: false,
    createdAt: '2026-08-15 10:30 AM',
    lastLoginAt: 'Just now',
    loginCount: 28,
    device: 'Desktop',
    browser: 'Chrome',
  },
  {
    id: 'usr_member_2',
    name: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    role: 'user',
    isBlocked: false,
    createdAt: '2026-08-18 04:15 PM',
    lastLoginAt: '2 hours ago',
    loginCount: 9,
    device: 'Mobile',
    browser: 'Safari',
  },
  {
    id: 'usr_member_3',
    name: 'Rahim Chowdhury',
    email: 'rahim.moviebuff@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    role: 'vip',
    isBlocked: false,
    createdAt: '2026-08-19 11:20 AM',
    lastLoginAt: '35 mins ago',
    loginCount: 14,
    device: 'Mobile',
    browser: 'Chrome',
  },
  {
    id: 'usr_member_4',
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan@yahoo.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    role: 'user',
    isBlocked: false,
    createdAt: '2026-08-20 09:10 AM',
    lastLoginAt: '15 mins ago',
    loginCount: 5,
    device: 'Desktop',
    browser: 'Edge',
  },
];

export const getUserStore = (): UserStore => {
  const todayStr = new Date().toISOString().split('T')[0];

  if (!global.__mv_user_store) {
    global.__mv_user_store = {
      users: initialSeedUsers,
      totalLogins: 56,
      todayLogins: 14,
      todaySignups: 2,
      todayDate: todayStr,
    };
  }

  // Reset daily counts if new day
  if (global.__mv_user_store.todayDate !== todayStr) {
    global.__mv_user_store.todayDate = todayStr;
    global.__mv_user_store.todayLogins = 0;
    global.__mv_user_store.todaySignups = 0;
  }

  return global.__mv_user_store;
};

// Register a new user
export const registerUserInStore = (data: {
  name: string;
  email: string;
  device?: 'Desktop' | 'Mobile' | 'Tablet';
  browser?: string;
}): RegisteredUser => {
  const store = getUserStore();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check if user already exists
  const existing = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    existing.loginCount += 1;
    existing.lastLoginAt = 'Just now';
    existing.device = data.device || existing.device;
    existing.browser = data.browser || existing.browser;
    store.totalLogins += 1;
    store.todayLogins += 1;
    return existing;
  }

  const nowStr = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newUser: RegisteredUser = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: data.name || data.email.split('@')[0],
    email: normalizedEmail,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name || normalizedEmail)}`,
    role: normalizedEmail.includes('admin') || normalizedEmail.includes('chakma') ? 'admin' : 'user',
    isBlocked: false,
    createdAt: nowStr,
    lastLoginAt: 'Just now',
    loginCount: 1,
    device: data.device || 'Desktop',
    browser: data.browser || 'Chrome',
  };

  store.users.unshift(newUser);
  store.totalLogins += 1;
  store.todayLogins += 1;
  store.todaySignups += 1;

  return newUser;
};

// Login an existing user
export const loginUserInStore = (data: {
  email: string;
  device?: 'Desktop' | 'Mobile' | 'Tablet';
  browser?: string;
}): RegisteredUser => {
  const store = getUserStore();
  const normalizedEmail = data.email.trim().toLowerCase();

  let user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    // Auto-create registered user record on successful login if not in store
    user = registerUserInStore({
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      device: data.device,
      browser: data.browser,
    });
  } else {
    user.loginCount += 1;
    user.lastLoginAt = 'Just now';
    if (data.device) user.device = data.device;
    if (data.browser) user.browser = data.browser;
    store.totalLogins += 1;
    store.todayLogins += 1;
  }

  return user;
};

// Toggle block user
export const toggleBlockUserInStore = (id: string): RegisteredUser | null => {
  const store = getUserStore();
  const user = store.users.find((u) => u.id === id);
  if (user) {
    user.isBlocked = !user.isBlocked;
    return user;
  }
  return null;
};

// Delete user
export const deleteUserInStore = (id: string): boolean => {
  const store = getUserStore();
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx !== -1) {
    store.users.splice(idx, 1);
    return true;
  }
  return false;
};

// Change user role
export const changeUserRoleInStore = (id: string, newRole: 'user' | 'admin' | 'vip'): RegisteredUser | null => {
  const store = getUserStore();
  const user = store.users.find((u) => u.id === id);
  if (user) {
    user.role = newRole;
    return user;
  }
  return null;
};

// Get stats
export const getUserAuthStats = () => {
  const store = getUserStore();
  const totalUsers = store.users.length;
  const activeUsers = store.users.filter((u) => !u.isBlocked).length;
  const blockedUsers = store.users.filter((u) => u.isBlocked).length;
  const adminCount = store.users.filter((u) => u.role === 'admin').length;

  return {
    totalUsers,
    totalSignups: totalUsers,
    totalLogins: store.totalLogins,
    todaySignups: store.todaySignups,
    todayLogins: store.todayLogins,
    activeUsers,
    blockedUsers,
    adminCount,
    users: store.users,
  };
};
