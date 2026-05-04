import { useState } from 'react';
import cover from '@/assets/profile-cover.jpg';
import avatar from '@/assets/profile-avatar.jpg';
import jungle from '@/assets/trail-jungle.jpg';
import mountain from '@/assets/trail-mountain.jpg';
import coast from '@/assets/trail-coast.jpg';
import visitedMap from '@/assets/visited-map.jpg';

const POSTS = [jungle, mountain, coast, jungle];

const VISITED = [
  { id: 1, name: 'La Costa Verde', country: 'Peru', date: 'Mar 2025', x: 38, y: 42 },
  { id: 2, name: 'Mt. Aurora Ridge', country: 'Chile', date: 'Jan 2025', x: 30, y: 70 },
  { id: 3, name: 'Big Sur', country: 'USA', date: 'Aug 2024', x: 15, y: 22 },
  { id: 4, name: 'Wild Atlantic', country: 'Ireland', date: 'Jun 2024', x: 60, y: 18 },
];

export default function ProfileScreen({ onBack }: { onBack?: () => void }) {
  const [following, setFollowing] = useState(false);
  const [activePin, setActivePin] = useState<number | null>(null);

  return (
    <main className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-[460px] pb-20">
        {/* Cover */}
        <div className="relative h-[210px]">
          <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
          <button
            onClick={onBack}
            aria-label="Back"
            className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/90 text-foreground flex items-center justify-center shadow"
          >
            ←
          </button>
          <button
            aria-label="More"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/90 text-foreground flex items-center justify-center shadow"
          >
            •••
          </button>
        </div>

        {/* Avatar + actions */}
        <div className="px-5 -mt-12 flex items-end justify-between">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-background bg-card">
            <img src={avatar} alt="Skye Silva" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setFollowing(f => !f)}
              className={`px-5 py-2 rounded-full font-mono text-[11px] tracking-[2px] uppercase transition-all active:scale-[0.98] ${
                following
                  ? 'bg-secondary text-foreground border border-border'
                  : 'bg-foreground text-background'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
            <button
              aria-label="Message"
              className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 7 9-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Identity */}
        <div className="px-5 mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl tracking-[1px] text-foreground">Skye Silva</h1>
            <p className="text-sm text-muted-foreground">@shotbyskye</p>
          </div>
          <div className="flex items-center gap-5 pt-1">
            <Stat value="204" label="Following" />
            <Stat value="1.2M" label="Followers" />
          </div>
        </div>

        <p className="px-5 mt-3 text-sm text-foreground/90 leading-relaxed">
          Hi I'm Skye! ✨ Lisbon, Portugal based 📍 Travel + drone videographer ✈️ Follow my adventures!
        </p>

        {/* Posts grid */}
        <div className="grid grid-cols-2 gap-2 px-3 mt-5">
          {POSTS.map((src, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden bg-card">
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Places visited section */}
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-mono text-[10px] tracking-[2px] text-muted-foreground uppercase">Journey</p>
              <h2 className="font-display text-xl tracking-[1.5px] text-primary">PLACES VISITED</h2>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">{VISITED.length} spots</span>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-lg">
            <div className="relative w-full aspect-[4/3]">
              <img src={visitedMap} alt="Visited places map" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-[hsl(150_38%_18%/0.05)]" />

              {VISITED.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePin(p.id === activePin ? null : p.id)}
                  className="absolute -translate-x-1/2 -translate-y-full group"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  aria-label={p.name}
                >
                  <span className="block w-3 h-3 rounded-full bg-accent ring-4 ring-accent/30 animate-pulse" />
                  {activePin === p.id && (
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full whitespace-nowrap bg-card/95 backdrop-blur px-2.5 py-1.5 rounded-xl shadow border border-border text-left">
                      <span className="block font-display tracking-[1px] text-[12px] text-foreground leading-none">{p.name}</span>
                      <span className="block font-mono text-[9px] text-muted-foreground mt-0.5">{p.country} · {p.date}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Visited list */}
          <ul className="mt-4 space-y-2">
            {VISITED.map(v => (
              <li
                key={v.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
              >
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" />
                  </svg>
                </span>
                <div className="flex-1 leading-tight">
                  <p className="font-display tracking-[1px] text-[14px]">{v.name}</p>
                  <p className="text-[11px] text-muted-foreground">{v.country}</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{v.date}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-lg tracking-[1px] text-primary leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
