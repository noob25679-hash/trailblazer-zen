import { useApp } from '@/context/AppContext';

export default function LogsScreen() {
  const { trekLogs, deleteLog, setScreen } = useApp();

  const km = trekLogs.reduce((s, l) => s + (l.distanceKm || 0), 0).toFixed(1);
  const elev = trekLogs.reduce((s, l) => s + (l.elevationGain || 0), 0);
  const rated = trekLogs.filter(l => l.rating);
  const avgR = rated.length ? (rated.reduce((s, l) => s + l.rating, 0) / rated.length).toFixed(1) : '—';

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-[52px] pb-4 flex justify-between items-end" style={{ background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, transparent 100%)' }}>
        <div>
          <div className="font-mono text-[9px] tracking-[3px] text-primary uppercase">History</div>
          <div className="font-display text-[36px] tracking-[1px] text-foreground leading-none mt-0.5">Trek Logs</div>
        </div>
        <button onClick={() => setScreen('feed')} className="font-mono text-[9px] px-3 py-2 rounded-full border border-primary bg-transparent text-primary cursor-pointer">← Back</button>
      </div>
      <div className="flex-1 overflow-y-auto scroll-hide">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 px-4 mb-5">
          {[
            { val: trekLogs.length, label: 'Treks' },
            { val: km, label: 'KM Hiked' },
            { val: elev, label: 'Elev (m)' },
            { val: avgR, label: 'Avg Rating' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
              <div className="font-display text-[32px] text-primary leading-none">{s.val}</div>
              <div className="font-mono text-[8px] tracking-[2px] text-muted-foreground mt-1 uppercase">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="font-mono text-[11px] tracking-[1.5px] text-muted-foreground uppercase px-4 mb-2.5 font-semibold">Trek History</div>
        <div className="px-4">
          {!trekLogs.length ? (
            <div className="text-center py-8">
              <div className="text-[56px] mb-4">📓</div>
              <div className="font-display text-[22px] text-secondary-foreground">No Logs Yet</div>
              <div className="text-[13px] text-muted-foreground mt-2">Tap + to log your first trek</div>
            </div>
          ) : (
            trekLogs.map(l => {
              const date = new Date(l.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const meta = [
                l.distanceKm && `📏 ${l.distanceKm}km`,
                l.durationMinutes && `⏱ ${Math.floor(l.durationMinutes / 60)}h${l.durationMinutes % 60}m`,
                l.elevationGain && `↑${l.elevationGain}m`,
                l.rating && `${'⭐'.repeat(l.rating)}`,
              ].filter(Boolean).join(' · ');
              const typeIcon = l.trekType === 'duo' ? '👫' : l.trekType === 'group' ? '👥' : '🧍';
              const typeLabel = l.trekType === 'duo' ? 'Duo' : l.trekType === 'group' ? 'Group' : 'Solo';
              return (
                <div key={l.id} className="bg-card border border-border rounded-2xl p-3 mb-2.5 flex gap-3 items-center">
                  <div className="text-[28px] w-[52px] h-[52px] rounded-[14px] bg-secondary flex items-center justify-center flex-shrink-0">🥾</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="font-bold text-[14px] text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{l.trailTitle}</div>
                      <span className="text-[10px] bg-secondary rounded-md px-1.5 py-0.5 text-muted-foreground">{typeIcon} {typeLabel}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{date}</div>
                    {meta && <div className="text-[10px] text-muted-foreground mt-0.5">{meta}</div>}
                    {l.companions?.length > 0 && (
                      <div className="text-[11px] text-muted-foreground mt-1">🤝 With: <span className="text-secondary-foreground">{l.companions.join(', ')}</span></div>
                    )}
                    {l.notes && <div className="text-[11px] text-text-dim mt-1 italic">{l.notes}</div>}
                  </div>
                  <button onClick={() => deleteLog(l.id)} className="font-mono text-[9px] p-2.5 rounded-full border border-destructive bg-transparent text-destructive cursor-pointer">🗑️</button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
