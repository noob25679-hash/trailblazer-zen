import { useApp } from '@/context/AppContext';

export default function SavedScreen() {
  const { savedTrails, toggleSave, showToast } = useApp();

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-[52px] pb-4" style={{ background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, transparent 100%)' }}>
        <div className="font-mono text-[9px] tracking-[3px] text-primary uppercase">Collection</div>
        <div className="font-display text-[36px] tracking-[1px] text-foreground leading-none mt-0.5">Saved Trails</div>
        <div className="text-[12px] text-muted-foreground mt-1">{savedTrails.length} trails bookmarked</div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-hide px-4">
        {!savedTrails.length ? (
          <div className="text-center py-16">
            <div className="text-[56px] mb-4">🔖</div>
            <div className="font-display text-[22px] text-secondary-foreground">No Saved Trails</div>
            <div className="text-[13px] text-muted-foreground mt-2">Browse the feed and save trails you want to explore</div>
          </div>
        ) : (
          savedTrails.map(t => (
            <div key={t.id} className="bg-card border border-border rounded-2xl p-3 mb-2.5 flex gap-3 items-center active:scale-[0.98] transition-transform">
              <div className="text-[28px] w-[52px] h-[52px] rounded-[14px] bg-secondary flex items-center justify-center flex-shrink-0">
                {t.typeIcon || '⛰️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px] text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{t.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex gap-2.5">
                  <span>{t.difficulty}</span><span>{t.distance}km</span><span>⭐{t.rating}</span>
                </div>
              </div>
              <button onClick={() => { toggleSave(t); showToast('Removed'); }}
                className="font-mono text-[9px] px-3 py-2 rounded-full border border-destructive bg-transparent text-destructive cursor-pointer">
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
