import { useState } from 'react';
import logo from '@/assets/hikehub-logo.jpg';
import jungle from '@/assets/trail-jungle.jpg';
import mountain from '@/assets/trail-mountain.jpg';
import coast from '@/assets/trail-coast.jpg';
import miniMap from '@/assets/mini-map.jpg';

const CATEGORIES = ['Jungle', 'Mountain', 'Coast', 'Desert', 'Snow'] as const;

const TRAILS = [
  { id: 1, name: 'La Costa Verde', region: 'Peru, S. America', img: jungle, rating: 4.8, distance: '7km', cat: 'Jungle' },
  { id: 2, name: 'Mt. Aurora Ridge', region: 'Patagonia, Chile', img: mountain, rating: 4.9, distance: '12km', cat: 'Mountain' },
  { id: 3, name: 'Wild Atlantic Way', region: 'Donegal, Ireland', img: coast, rating: 4.6, distance: '9km', cat: 'Coast' },
];

const TOP = [
  { id: 1, name: 'Salvador', sub: 'Brazil', img: jungle },
  { id: 2, name: 'La Sierra', sub: 'Peru', img: mountain },
  { id: 3, name: 'Big Sur', sub: 'USA', img: coast },
];

export default function FypScreen({ onSignOut, onProfile }: { onSignOut?: () => void; onProfile?: () => void }) {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>('Jungle');
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-[460px] pb-32">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="HikeHub" className="w-9 h-9 rounded-xl object-cover ring-1 ring-border" />
            <div className="leading-tight">
              <p className="font-mono text-[10px] tracking-[2px] text-muted-foreground uppercase">Discover</p>
              <h1 className="font-display text-2xl tracking-[1.5px] text-primary">HIKEHUB</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconBtn label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
            </IconBtn>
            <button onClick={onSignOut} className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-border">
              <img src={logo} alt="profile" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        {/* Hero greeting */}
        <section className="px-5 mb-5">
          <h2 className="font-display text-[34px] leading-[1.05] tracking-[1px] text-foreground">
            Find your<br />next <span className="text-primary">adventure</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Curated trails from a community of hikers.</p>
        </section>

        {/* Category tabs */}
        <nav className="px-5 mb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-6">
            {CATEGORIES.map(cat => {
              const isActive = active === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`pb-2 font-mono text-[11px] tracking-[2px] uppercase transition-colors relative whitespace-nowrap ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {cat}
                  {isActive && <span className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Horizontal trail cards */}
        <section className="pl-5 mb-7 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 pr-5">
            {TRAILS.map(t => (
              <article
                key={t.id}
                className="relative shrink-0 w-[230px] h-[300px] rounded-[28px] overflow-hidden shadow-lg bg-card"
              >
                <img src={t.img} alt={t.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-mono font-semibold text-foreground flex items-center gap-1">
                  ★ {t.rating}
                </span>

                <div className="absolute bottom-3 left-3 right-3 bg-card/95 backdrop-blur rounded-2xl px-3 py-2.5 flex items-center justify-between">
                  <div className="leading-tight">
                    <p className="font-display tracking-[1px] text-foreground text-[15px]">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.region}</p>
                  </div>
                  <span className="text-[10px] font-mono text-primary">{t.distance}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Top destinations */}
        <section className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display tracking-[2px] text-lg text-foreground">TOP DESTINATIONS</h3>
            <button className="text-muted-foreground text-xs">•••</button>
          </div>
          <ul className="space-y-3">
            {TOP.map(d => (
              <li
                key={d.id}
                className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-card border border-border"
              >
                <img src={d.img} alt="" loading="lazy" className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 leading-tight">
                  <p className="font-display tracking-[1px] text-[15px]">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">{d.sub}</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Mini map dock */}
      <MiniMapDock open={mapOpen} onToggle={() => setMapOpen(o => !o)} />
    </main>
  );
}

function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="w-10 h-10 rounded-full bg-card border border-border text-foreground flex items-center justify-center"
    >
      {children}
    </button>
  );
}

function MiniMapDock({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out`}
      style={{
        bottom: open ? '12px' : '16px',
        width: open ? 'min(440px, calc(100vw - 24px))' : '220px',
        height: open ? 'min(60vh, 520px)' : '76px',
      }}
    >
      <button
        onClick={onToggle}
        className="relative w-full h-full rounded-[26px] overflow-hidden shadow-2xl border border-border bg-card text-left"
      >
        <img src={miniMap} alt="Trail map" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[hsl(150_38%_18%/0.18)]" />

        {/* Pin */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <span className="block w-3 h-3 rounded-full bg-accent ring-4 ring-accent/30 animate-pulse" />
        </span>

        {/* Collapsed label */}
        {!open && (
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 bg-card/85 backdrop-blur px-2.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[10px] tracking-[2px] uppercase text-foreground">Live map</span>
            </div>
            <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M7 14l5-5 5 5" />
              </svg>
            </span>
          </div>
        )}

        {/* Expanded header */}
        {open && (
          <>
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="bg-card/90 backdrop-blur px-3 py-1.5 rounded-full">
                <p className="font-mono text-[10px] tracking-[2px] uppercase text-muted-foreground">Nearby</p>
                <p className="font-display tracking-[1.5px] text-sm text-foreground -mt-0.5">LA COSTA VERDE</p>
              </div>
              <span className="w-9 h-9 rounded-full bg-card/90 text-foreground flex items-center justify-center shadow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M17 10l-5 5-5-5" />
                </svg>
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
              {[
                { l: 'Distance', v: '7 km' },
                { l: 'Elev.', v: '420 m' },
                { l: 'Time', v: '2h 40' },
              ].map(s => (
                <div key={s.l} className="bg-card/95 backdrop-blur px-3 py-2 rounded-xl">
                  <p className="font-mono text-[9px] tracking-[2px] uppercase text-muted-foreground">{s.l}</p>
                  <p className="font-display tracking-[1px] text-sm text-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </button>
    </div>
  );
}
