import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Trail, fetchTrailsFromOverpass, FALLBACK_TRAILS } from '@/lib/trails';
import { TrekLog, calcXP, getRank } from '@/lib/xp';

type Screen = 'feed' | 'map' | 'saved' | 'logs' | 'profile' | 'sensors' | 'rank' | 'shop' | 'camera';

interface AppState {
  screen: Screen;
  setScreen: (s: Screen) => void;
  trails: Trail[];
  savedTrails: Trail[];
  toggleSave: (trail: Trail) => void;
  trekLogs: TrekLog[];
  addLog: (log: TrekLog) => void;
  deleteLog: (id: string) => void;
  userName: string;
  setUserName: (n: string) => void;
  userLatLng: [number, number] | null;
  setUserLatLng: (ll: [number, number] | null) => void;
  isTracking: boolean;
  setIsTracking: (v: boolean) => void;
  trackName: string;
  setTrackName: (n: string) => void;
  cart: any[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  friends: any[];
  addFriend: (f: any) => void;
  removeFriend: (name: string) => void;
  loadTrailsForArea: (lat: number, lng: number, zoom: number, force?: boolean) => Promise<void>;
  isLoadingTrails: boolean;
  showToast: (msg: string) => void;
  toastMessage: string;
  toastVisible: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  logout: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('feed');
  const [trails, setTrails] = useState<Trail[]>([]);
  const [savedTrails, setSavedTrails] = useState<Trail[]>(() =>
    JSON.parse(localStorage.getItem('trekr_saved') || '[]')
  );
  const [trekLogs, setTrekLogs] = useState<TrekLog[]>(() =>
    JSON.parse(localStorage.getItem('trekr_logs') || '[]')
  );
  const [userName, setUserNameState] = useState(() =>
    localStorage.getItem('trekr_name') || 'Trekker'
  );
  const [userLatLng, setUserLatLng] = useState<[number, number] | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [cart, setCart] = useState<any[]>(() =>
    JSON.parse(localStorage.getItem('trekr_cart') || '[]')
  );
  const [friends, setFriends] = useState<any[]>(() =>
    JSON.parse(localStorage.getItem('trekr_friends') || '[]')
  );
  const [isLoadingTrails, setIsLoadingTrails] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('trekr_name'));
  const lastFetchArea = useRef<string>('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const setUserName = useCallback((n: string) => {
    setUserNameState(n);
    localStorage.setItem('trekr_name', n);
  }, []);

  const toggleSave = useCallback((trail: Trail) => {
    setSavedTrails(prev => {
      const exists = prev.find(t => t.id === trail.id);
      const next = exists ? prev.filter(t => t.id !== trail.id) : [...prev, trail];
      localStorage.setItem('trekr_saved', JSON.stringify(next));
      return next;
    });
  }, []);

  const addLog = useCallback((log: TrekLog) => {
    setTrekLogs(prev => {
      const next = [log, ...prev];
      localStorage.setItem('trekr_logs', JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteLog = useCallback((id: string) => {
    setTrekLogs(prev => {
      const next = prev.filter(l => l.id !== id);
      localStorage.setItem('trekr_logs', JSON.stringify(next));
      return next;
    });
  }, []);

  const addToCart = useCallback((product: any) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      let next;
      if (existing) {
        next = prev.map(c => c.id === product.id ? { ...c, qty: (c.qty || 1) + 1 } : c);
      } else {
        next = [...prev, { ...product, qty: 1 }];
      }
      localStorage.setItem('trekr_cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem('trekr_cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart(prev => {
      const next = prev.map(c =>
        c.id === id ? { ...c, qty: Math.max(1, (c.qty || 1) + delta) } : c
      );
      localStorage.setItem('trekr_cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const addFriend = useCallback((f: any) => {
    setFriends(prev => {
      const next = [...prev, { ...f, addedAt: Date.now() }];
      localStorage.setItem('trekr_friends', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFriend = useCallback((name: string) => {
    setFriends(prev => {
      const next = prev.filter(f => f.name !== name);
      localStorage.setItem('trekr_friends', JSON.stringify(next));
      return next;
    });
  }, []);

  // Load cached trails from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('trekr_cached_trails');
      if (cached) {
        const parsed = JSON.parse(cached) as Trail[];
        if (parsed.length > 0) setTrails(parsed);
      } else {
        // No cache yet — seed with fallback trails immediately
        setTrails(FALLBACK_TRAILS);
      }
    } catch {
      setTrails(FALLBACK_TRAILS);
    }
  }, []);

  const loadTrailsForArea = useCallback(async (lat: number, lng: number, zoom: number, force?: boolean) => {
    const areaKey = `${lat.toFixed(1)}_${lng.toFixed(1)}_${zoom}`;
    if (!force && lastFetchArea.current === areaKey) return;
    lastFetchArea.current = areaKey;

    setIsLoadingTrails(true);
    const radius = zoom > 12 ? 15000 : zoom > 9 ? 40000 : 80000;
    try {
      const fetched = await fetchTrailsFromOverpass(lat, lng, radius);
      if (fetched.length > 0) {
        setTrails(prev => {
          const existingIds = new Set(prev.filter(t => !t.id.startsWith('fb_')).map(t => t.id));
          const newTrails = fetched.filter(t => !existingIds.has(t.id));
          if (newTrails.length === 0) return prev;
          const realPrev = prev.filter(t => !t.id.startsWith('fb_'));
          const merged = [...realPrev, ...newTrails].sort((a, b) => b.popularity - a.popularity);
          try { localStorage.setItem('trekr_cached_trails', JSON.stringify(merged.slice(0, 100))); } catch {}
          return merged;
        });
        showToast(`Found ${fetched.length} trails nearby!`);
      } else {
        showToast('No new trails found in this area');
      }
    } catch (e) {
      console.warn('Failed to fetch trails:', e);
      showToast('⚠️ Could not fetch trails — showing cached data');
    }
    setIsLoadingTrails(false);
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem('trekr_name');
    localStorage.removeItem('trekr_account');
    setUserNameState('Trekker');
    setIsLoggedIn(false);
  }, []);

  // Get user location on mount — defer network fetch to avoid blocking initial render
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const ll: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            setUserLatLng(ll);
            loadTrailsForArea(ll[0], ll[1], 11);
          },
          () => {
            loadTrailsForArea(19.2, 73.7, 10);
          },
          { timeout: 10000 }
        );
      } else {
        loadTrailsForArea(19.2, 73.7, 10);
      }
    }, 2000); // Defer 2s so initial paint completes first
    return () => clearTimeout(timerId);
  }, [loadTrailsForArea]);

  return (
    <AppContext.Provider
      value={{
        screen, setScreen, trails, savedTrails, toggleSave,
        trekLogs, addLog, deleteLog, userName, setUserName,
        userLatLng, setUserLatLng, isTracking, setIsTracking,
        trackName, setTrackName, cart, addToCart, removeFromCart,
        changeQty, friends, addFriend, removeFriend,
        loadTrailsForArea, isLoadingTrails, showToast,
        toastMessage, toastVisible, isLoggedIn, setIsLoggedIn, logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
