import { useEffect, useRef, useCallback, useState } from 'react';
import { useApp } from '@/context/AppContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapScreen() {
  const {
    screen,
    trails,
    userLatLng,
    loadTrailsForArea,
    isLoadingTrails,
    savedTrails,
    toggleSave,
    showToast,
  } = useApp();

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [sheetTrail, setSheetTrail] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const addUserDot = useCallback((map: L.Map, ll: [number, number]) => {
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 0 12px rgba(34,197,94,0.8)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    userMarkerRef.current = L.marker(ll, { icon, zIndexOffset: 1000 }).addTo(map);
  }, []);

  const initMap = useCallback(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.invalidateSize(true);
      return;
    }

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    }).setView(userLatLng || [19.2, 73.7], userLatLng ? 12 : 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    map.on('moveend', () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const center = map.getCenter();
        loadTrailsForArea(center.lat, center.lng, map.getZoom());
      }, 700);
    });

    mapRef.current = map;
    setMapReady(true);

    const center = map.getCenter();
    loadTrailsForArea(center.lat, center.lng, map.getZoom());

    if (userLatLng) {
      addUserDot(map, userLatLng);
    }
  }, [addUserDot, loadTrailsForArea, userLatLng]);

  useEffect(() => {
    initMap();
    return () => {
      clearTimeout(debounceRef.current);
    };
  }, [initMap]);

  useEffect(() => {
    if (screen !== 'map' || !mapRef.current) return;

    const map = mapRef.current;
    const sync = setTimeout(() => {
      map.invalidateSize(true);
      const center = map.getCenter();
      loadTrailsForArea(center.lat, center.lng, map.getZoom());
      if (userLatLng) addUserDot(map, userLatLng);
    }, 120);

    return () => clearTimeout(sync);
  }, [screen, userLatLng, addUserDot, loadTrailsForArea]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach(m => {
      try {
        map.removeLayer(m);
      } catch {
        // ignore stale marker cleanup errors
      }
    });
    markersRef.current = [];

    const zoom = map.getZoom();
    const maxMarkers = zoom > 13 ? 50 : zoom > 10 ? 30 : 15;
    const allValid = trails.filter(t => t.lat && t.lng);

    const bounds = map.getBounds();
    const inBounds = bounds.isValid()
      ? allValid.filter(t => bounds.contains([t.lat, t.lng]))
      : allValid;

    const visible = (inBounds.length > 0 ? inBounds : allValid).slice(0, maxMarkers);

    visible.forEach(trail => {
      const isPopular = trail.isHighRated;
      const size = isPopular ? 44 : 36;
      const bgColor = isPopular ? '#16a34a' : '#15803d';
      const glowColor = isPopular ? 'rgba(34,197,94,0.7)' : 'rgba(34,197,94,0.3)';

      const icon = L.divIcon({
        className: '',
        html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer">
          <div style="width:${size}px;height:${size}px;border-radius:50%;background:${bgColor};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:${isPopular ? 20 : 16}px;box-shadow:0 3px 12px ${glowColor}">${trail.typeIcon || '⛰️'}</div>
          <div style="background:rgba(8,13,8,0.88);color:white;font-family:sans-serif;font-size:10px;font-weight:700;padding:3px 7px;border-radius:6px;white-space:nowrap;max-width:110px;overflow:hidden;text-overflow:ellipsis;border:1px solid rgba(34,197,94,0.5);box-shadow:0 2px 6px rgba(0,0,0,0.4)">${trail.title}</div>
        </div>`,
        iconSize: [120, size + 26],
        iconAnchor: [60, size + 26],
      });

      const m = L.marker([trail.lat, trail.lng], { icon }).addTo(map);
      m.on('click', () => setSheetTrail(trail));
      markersRef.current.push(m);
    });
  }, [trails, mapReady, screen]);

  const locateMe = () => {
    if (!navigator.geolocation) return showToast('⚠️ Location not supported');

    showToast('📍 Getting location...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const ll: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        if (mapRef.current) {
          mapRef.current.setView(ll, 14);
          addUserDot(mapRef.current, ll);
        }
        showToast('📍 Found you!');
      },
      () => showToast('⚠️ Could not get location'),
      { timeout: 10000 }
    );
  };

  const isSaved = sheetTrail ? !!savedTrails.find(s => s.id === sheetTrail.id) : false;

  return (
    <div className="absolute inset-0" style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
      <div ref={containerRef} className="absolute inset-0" />

      <div
        className="absolute left-4 right-4 flex justify-between items-center pointer-events-none z-[500]"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
      >
        <div className="pointer-events-auto bg-background/90 backdrop-blur-xl border border-border-bright rounded-full px-4 py-2 flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isLoadingTrails ? 'bg-primary animate-pulse-green' : 'bg-text-dim'
            }`}
          />
          <span className="font-mono text-[10px] text-secondary-foreground tracking-[1px]">
            {markersRef.current.length} TRAILS
          </span>
        </div>

        <button
          onClick={locateMe}
          className="pointer-events-auto cursor-pointer bg-background/90 backdrop-blur-xl border border-border-bright rounded-full px-4 py-2 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
          </svg>
          <span className="font-mono text-[10px] text-secondary-foreground tracking-[1px]">LOCATE</span>
        </button>
      </div>

      <div
        className="absolute right-4 z-[500] flex flex-col gap-2"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 66px)' }}
      >
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-[42px] h-[42px] rounded-full bg-background/90 border border-border-bright flex items-center justify-center cursor-pointer text-secondary-foreground text-[20px] font-light"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-[42px] h-[42px] rounded-full bg-background/90 border border-border-bright flex items-center justify-center cursor-pointer text-secondary-foreground text-[20px] font-light"
        >
          −
        </button>
      </div>

      {sheetTrail && (
        <div className="absolute bottom-20 left-3 right-3 z-[600] bg-card border border-border-bright rounded-[20px] p-3.5 flex items-center gap-3 animate-slide-up">
          <div className="text-[32px] flex-shrink-0">{sheetTrail.typeIcon || '⛰️'}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14px] text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              {sheetTrail.title}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {sheetTrail.difficulty} · {sheetTrail.distance}km · ⭐{sheetTrail.rating}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                toggleSave(sheetTrail);
                showToast(isSaved ? 'Removed' : '🔖 Saved!');
              }}
              className="font-mono text-[9px] tracking-[1.5px] uppercase px-3 py-2 rounded-full cursor-pointer border-none bg-gradient-to-br from-primary to-green-dark text-white"
            >
              {isSaved ? '🔖 Saved' : '+ Save'}
            </button>
            <button
              onClick={() => {
                setSheetTrail(null);
                window.dispatchEvent(new CustomEvent('openLogModal', { detail: sheetTrail.title }));
              }}
              className="font-mono text-[9px] tracking-[1.5px] uppercase px-3 py-2 rounded-full cursor-pointer border border-primary bg-transparent text-primary"
            >
              Log
            </button>
          </div>
          <button
            onClick={() => setSheetTrail(null)}
            className="bg-transparent border-none text-text-dim text-[20px] cursor-pointer p-1"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
