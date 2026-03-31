import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { difficultyColor, Trail, haversine } from '@/lib/trails';

export default function FeedScreen() {
  const { trails, savedTrails, toggleSave, setScreen, showToast, isLoadingTrails, userLatLng, loadTrailsForArea } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = [...trails];
    // Sort by distance from user if location available
    if (userLatLng) {
      list = list.map(t => ({
        ...t,
        _dist: haversine(userLatLng[0], userLatLng[1], t.lat, t.lng),
      })).sort((a, b) => (a as any)._dist - (b as any)._dist);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.location.toLowerCase().includes(q));
    }
    if (filter === 'popular') list = list.filter(t => t.isHighRated);
    else if (filter === 'easy') list = list.filter(t => t.difficulty === 'Easy');
    else if (filter === 'moderate') list = list.filter(t => t.difficulty === 'Moderate');
    else if (filter === 'hard') list = list.filter(t => t.difficulty === 'Hard');
    return list;
  }, [trails, search, filter, userLatLng]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'popular', label: '🔥 Popular' },
    { key: 'easy', label: '🟢 Easy' },
    { key: 'moderate', label: '🟡 Moderate' },
    { key: 'hard', label: '🔴 Hard' },
  ];

  const openLogModal = (name?: string) => {
    window.dispatchEvent(new CustomEvent('openLogModal', { detail: name }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-[52px] pb-4 flex justify-between items-center" style={{ background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-2.5">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" fill="#10B981" fillOpacity="0.15"/>
            <circle cx="50" cy="50" r="40" fill="#10B981" stroke="white" strokeWidth="4"/>
            <path d="M30 65L50 30L70 65" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 65L40 30L60 65" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            <path d="M15 65H85" stroke="white" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <div>
            <div className="font-display text-[28px] tracking-[2px] text-foreground leading-none">TREKR</div>
            <div className="font-mono text-[8px] tracking-[3px] text-primary uppercase">Nearby Trails</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setScreen('shop')} className="font-mono text-[9px] tracking-[1.5px] uppercase px-2.5 py-[7px] rounded-full border border-primary bg-transparent text-primary cursor-pointer">🛒</button>
          <button onClick={() => setScreen('logs')} className="font-mono text-[9px] tracking-[1.5px] uppercase px-2.5 py-[7px] rounded-full border border-primary bg-transparent text-primary cursor-pointer">📓</button>
          <button onClick={() => openLogModal()} className="font-mono text-[9px] tracking-[1.5px] uppercase px-3 py-[7px] rounded-full border-none bg-gradient-to-br from-primary to-green-dark text-white cursor-pointer shadow-[0_4px_20px_rgba(34,197,94,0.3)]">+ Log</button>
        </div>
      </div>

      {/* Search */}
      <div className="mx-4 mb-3 bg-card border border-border rounded-full px-4 py-2.5 flex items-center gap-2.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-muted-foreground flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search trails..." className="flex-1 bg-transparent border-none text-foreground text-[14px] outline-none placeholder:text-text-dim" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto scroll-hide">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full font-mono text-[11px] tracking-[0.5px] uppercase font-semibold cursor-pointer transition-all border ${
              filter === f.key ? 'border-primary bg-green-dim text-primary' : 'border-border bg-card text-muted-foreground'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Refresh nearby button */}
      <div className="px-4 mb-3">
        <button onClick={() => {
          if (userLatLng) {
            loadTrailsForArea(userLatLng[0], userLatLng[1], 11, true);
          } else {
            showToast('📍 Getting location...');
            navigator.geolocation?.getCurrentPosition(
              pos => loadTrailsForArea(pos.coords.latitude, pos.coords.longitude, 11, true),
              () => showToast('⚠️ Location unavailable'),
              { timeout: 10000 }
            );
          }
        }}
          className="w-full py-2.5 rounded-full border border-border bg-card text-secondary-foreground font-mono text-[11px] tracking-[1px] uppercase cursor-pointer flex items-center justify-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          {isLoadingTrails ? 'Scanning...' : 'Discover nearby trails'}
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto scroll-hide pb-4">
        <div className="px-4">
          {isLoadingTrails && trails.length === 0 ? (
            <div className="text-center py-16">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="mx-auto mb-2 animate-pulse">
                <circle cx="50" cy="50" r="48" fill="#10B981" fillOpacity="0.1"/>
                <circle cx="50" cy="50" r="40" fill="#10B981" stroke="white" strokeWidth="4"/>
                <path d="M30 65L50 30L70 65" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 65H85" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              </svg>
              <div className="font-display text-[22px] text-secondary-foreground">Finding Trails...</div>
              <div className="text-[13px] text-muted-foreground mt-2">Getting your location to discover nearby trails</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-[56px] mb-4">🏔️</div>
              <div className="font-display text-[22px] text-secondary-foreground">No Trails Found</div>
              <div className="text-[13px] text-muted-foreground mt-2">Try a different search or filter</div>
            </div>
          ) : (
            filtered.map(trail => (
              <TrailCard key={trail.id} trail={trail} saved={!!savedTrails.find(s => s.id === trail.id)} onSave={() => toggleSave(trail)} onLog={() => openLogModal(trail.title)} userLatLng={userLatLng} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TrailCard({ trail, saved, onSave, onLog }: { trail: Trail; saved: boolean; onSave: () => void; onLog: () => void }) {
  return (
    <div className="bg-card border border-border rounded-[20px] overflow-hidden mb-3 transition-transform active:scale-[0.98]">
      <div className="relative w-full h-40" style={{ background: 'linear-gradient(135deg, #0f2010, #162816)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-[60px]" style={{ background: 'linear-gradient(to top, rgba(8,13,8,0.85), transparent)' }} />
      </div>
      <div className="p-3.5">
        <div className="font-bold text-[15px] text-foreground mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {trail.typeIcon || '⛰️'} {trail.title}
        </div>
        <div className="text-[11px] text-muted-foreground mb-2.5">
          📍 {trail.location} {trail.typeLabel && <span className="text-primary text-[10px]">· {trail.typeLabel}</span>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-mono text-[9px] font-medium px-2 py-0.5 rounded-md border uppercase tracking-[0.5px] ${difficultyColor(trail.difficulty)}`}>{trail.difficulty}</span>
          <span className="font-mono text-[9px] font-medium px-2 py-0.5 rounded-md border text-primary border-primary uppercase tracking-[0.5px]">📏 {trail.distance}km</span>
          {trail.elevation ? (
            <span className="font-mono text-[9px] font-medium px-2 py-0.5 rounded-md border text-warning border-warning uppercase tracking-[0.5px]">↑ {trail.elevation}m</span>
          ) : (
            <span className="font-mono text-[9px] font-medium px-2 py-0.5 rounded-md border text-warning border-warning uppercase tracking-[0.5px]">⭐ {trail.rating}</span>
          )}
          {trail.isHighRated && <span className="font-mono text-[9px] font-medium px-2 py-0.5 rounded-md text-primary bg-primary/10 uppercase tracking-[0.5px]">🔥 Popular</span>}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={onSave}
            className="font-mono text-[10px] tracking-[1.5px] uppercase font-medium px-3.5 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1.5 border-none bg-gradient-to-br from-primary to-green-dark text-white shadow-[0_4px_20px_rgba(34,197,94,0.3)]">
            {saved ? '🔖 Saved' : '+ Save'}
          </button>
          <button onClick={onLog}
            className="font-mono text-[10px] tracking-[1.5px] uppercase font-medium px-3.5 py-2 rounded-full cursor-pointer transition-all border border-primary bg-transparent text-primary">
            Log Trek
          </button>
        </div>
      </div>
    </div>
  );
}
