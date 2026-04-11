import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Trail, fetchTrailsFromOverpass, FALLBACK_TRAILS } from '@/lib/trails';
import { TrekLog, calcXP, getRank } from '@/lib/xp';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

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
  user: User | null;
  guestMode: boolean;
  setGuestMode: (v: boolean) => void;
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
  const [savedTrails, setSavedTrails] = useState<Trail[]>([]);
  const [trekLogs, setTrekLogs] = useState<TrekLog[]>([]);
  const [userName, setUserNameState] = useState('Trekker');
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const lastFetchArea = useRef<string>('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);

      if (currentUser) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', currentUser.id)
          .single();
        if (profile) setUserNameState(profile.display_name);

        // Fetch trek logs
        const { data: logs } = await supabase
          .from('trek_logs')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('completed_at', { ascending: false });
        if (logs) {
          setTrekLogs(logs.map(l => ({
            id: l.id,
            trailTitle: l.trail_title,
            completedAt: l.completed_at,
            distanceKm: Number(l.distance_km),
            durationMinutes: l.duration_minutes,
            elevationGain: l.elevation_gain,
            rating: l.rating,
            notes: l.notes || '',
            trekType: l.trek_type as 'solo' | 'duo' | 'group',
            companions: l.companions || [],
          })));
        }

        // Fetch saved trails
        const { data: saved } = await supabase
          .from('saved_trails')
          .select('*')
          .eq('user_id', currentUser.id);
        if (saved) {
          setSavedTrails(saved.map(s => ({
            id: s.external_trail_id,
            title: s.title,
            location: s.location || 'Nearby',
            lat: Number(s.lat),
            lng: Number(s.lng),
            difficulty: s.difficulty as Trail['difficulty'],
            distance: Number(s.distance),
            rating: Number(s.rating),
            elevation: s.elevation,
            typeIcon: s.type_icon || '⛰️',
            typeLabel: s.type_label || 'Trail',
            isHighRated: s.is_high_rated || false,
            popularity: s.popularity || 0,
          })));
        }
      } else {
        setUserNameState('Trekker');
        setTrekLogs([]);
        setSavedTrails([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setUserName = useCallback(async (n: string) => {
    setUserNameState(n);
    if (user) {
      await supabase.from('profiles').update({ display_name: n }).eq('user_id', user.id);
    }
  }, [user]);

  const toggleSave = useCallback(async (trail: Trail) => {
    if (!user) return;
    const exists = savedTrails.find(t => t.id === trail.id);
    if (exists) {
      setSavedTrails(prev => prev.filter(t => t.id !== trail.id));
      await supabase.from('saved_trails').delete().eq('user_id', user.id).eq('external_trail_id', trail.id);
    } else {
      setSavedTrails(prev => [...prev, trail]);
      await supabase.from('saved_trails').insert({
        user_id: user.id,
        external_trail_id: trail.id,
        title: trail.title,
        location: trail.location,
        lat: trail.lat,
        lng: trail.lng,
        difficulty: trail.difficulty,
        distance: trail.distance,
        rating: trail.rating,
        elevation: trail.elevation,
        type_icon: trail.typeIcon,
        type_label: trail.typeLabel,
        is_high_rated: trail.isHighRated,
        popularity: trail.popularity,
      });
    }
  }, [user, savedTrails]);

  const addLog = useCallback(async (log: TrekLog) => {
    setTrekLogs(prev => [log, ...prev]);
    if (user) {
      const { data } = await supabase.from('trek_logs').insert({
        user_id: user.id,
        trail_title: log.trailTitle,
        completed_at: log.completedAt,
        distance_km: log.distanceKm,
        duration_minutes: log.durationMinutes,
        elevation_gain: log.elevationGain,
        rating: log.rating,
        notes: log.notes,
        trek_type: log.trekType,
        companions: log.companions,
      }).select().single();
      // Update local log with DB id
      if (data) {
        setTrekLogs(prev => prev.map(l => l.id === log.id ? { ...l, id: data.id } : l));
      }
    }
  }, [user]);

  const deleteLog = useCallback(async (id: string) => {
    setTrekLogs(prev => prev.filter(l => l.id !== id));
    if (user) {
      await supabase.from('trek_logs').delete().eq('id', id).eq('user_id', user.id);
    }
  }, [user]);

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

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUserNameState('Trekker');
    setIsLoggedIn(false);
    setUser(null);
    setGuestMode(false);
    setTrekLogs([]);
    setSavedTrails([]);
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
    }, 2000);
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
        user, guestMode, setGuestMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
