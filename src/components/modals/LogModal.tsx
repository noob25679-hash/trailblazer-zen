import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TrekLog } from '@/lib/xp';

export default function LogModal({ onClose, prefillName }: { onClose: () => void; prefillName?: string }) {
  const { addLog, showToast, friends } = useApp();
  const [trailTitle, setTrailTitle] = useState(prefillName || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dist, setDist] = useState('');
  const [dur, setDur] = useState('');
  const [elev, setElev] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [trekType, setTrekType] = useState<'solo' | 'duo' | 'group'>('solo');
  const [companions, setCompanions] = useState<string[]>([]);
  const [companionInput, setCompanionInput] = useState('');

  useEffect(() => { if (prefillName) setTrailTitle(prefillName); }, [prefillName]);

  const submit = () => {
    if (!trailTitle.trim()) { showToast('⚠️ Enter a trail name'); return; }
    const log: TrekLog = {
      id: 'log_' + Date.now(),
      trailTitle: trailTitle.trim(),
      completedAt: date || new Date().toISOString(),
      distanceKm: parseFloat(dist) || 0,
      durationMinutes: parseInt(dur) || 0,
      elevationGain: parseInt(elev) || 0,
      rating,
      notes,
      trekType,
      companions,
    };
    const xpEarned = 100 + Math.floor(log.distanceKm * 10) + Math.floor(log.elevationGain / 100) * 20 + (rating === 5 ? 50 : 0) + (trekType === 'duo' ? 50 : trekType === 'group' ? 100 : 0);
    addLog(log);
    showToast(`✅ Trek logged! +${xpEarned} XP 🎉`);
    onClose();
  };

  const addCompanion = () => {
    const name = companionInput.trim();
    if (!name || companions.includes(name)) return;
    if (trekType === 'duo' && companions.length >= 1) { showToast('Duo = max 1 companion'); return; }
    setCompanions([...companions, name]);
    setCompanionInput('');
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-end" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-card rounded-t-3xl w-full p-6 border-t border-border-bright animate-sheet-up max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-text-dim mx-auto mb-5" />
        <div className="font-display text-[24px] mb-5">Log a Trek</div>

        <div className="mb-4">
          <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Trail Name *</label>
          <input value={trailTitle} onChange={e => setTrailTitle(e.target.value)}
            placeholder="e.g. Harishchandragad" className="w-full bg-secondary border border-border rounded-xl px-3.5 py-3 text-foreground text-[14px] outline-none focus:border-primary" />
        </div>

        <div className="mb-4">
          <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Date Completed</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-3.5 py-3 text-foreground text-[14px] outline-none focus:border-primary" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Distance (km)</label>
            <input type="number" value={dist} onChange={e => setDist(e.target.value)} placeholder="12.5"
              className="w-full bg-secondary border border-border rounded-xl px-3.5 py-3 text-foreground text-[14px] outline-none focus:border-primary" />
          </div>
          <div>
            <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Duration (min)</label>
            <input type="number" value={dur} onChange={e => setDur(e.target.value)} placeholder="240"
              className="w-full bg-secondary border border-border rounded-xl px-3.5 py-3 text-foreground text-[14px] outline-none focus:border-primary" />
          </div>
        </div>

        <div className="mb-4">
          <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Elevation Gain (m)</label>
          <input type="number" value={elev} onChange={e => setElev(e.target.value)} placeholder="1200"
            className="w-full bg-secondary border border-border rounded-xl px-3.5 py-3 text-foreground text-[14px] outline-none focus:border-primary" />
        </div>

        {/* Trek Type */}
        <div className="mb-4">
          <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Trek Type</label>
          <div className="flex gap-2">
            {(['solo', 'duo', 'group'] as const).map(t => (
              <button key={t} onClick={() => setTrekType(t)}
                className={`flex-1 py-2.5 px-2 rounded-xl border text-[12px] text-center cursor-pointer transition-all ${
                  trekType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-secondary-foreground'
                }`}>
                {t === 'solo' ? '🧍 Solo' : t === 'duo' ? '👫 Duo' : '👥 Group'}
              </button>
            ))}
          </div>
        </div>

        {trekType !== 'solo' && (
          <div className="mb-4">
            <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Companions</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {companions.map((c, i) => (
                <span key={c} className="flex items-center gap-1.5 bg-secondary border border-border rounded-full px-2.5 py-1 text-[12px] text-secondary-foreground">
                  {c} <button onClick={() => setCompanions(companions.filter((_, j) => j !== i))} className="bg-transparent border-none text-text-dim text-[14px] cursor-pointer p-0">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={companionInput} onChange={e => setCompanionInput(e.target.value)}
                placeholder="Add companion..." className="flex-1 bg-secondary border border-border rounded-xl px-3.5 py-2.5 text-foreground text-[14px] outline-none focus:border-primary" />
              <button onClick={addCompanion} className="font-mono text-[9px] px-3 py-2 rounded-full border border-primary bg-transparent text-primary cursor-pointer flex-shrink-0">Add</button>
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="mb-4">
          <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Your Rating</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(v => (
              <span key={v} onClick={() => setRating(v)} className={`text-[28px] cursor-pointer transition-opacity ${v <= rating ? 'opacity-100' : 'opacity-30'}`}>⭐</span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="How was the trek?" className="w-full bg-secondary border border-border rounded-xl px-3.5 py-3 text-foreground text-[14px] outline-none focus:border-primary min-h-[80px] resize-none" />
        </div>

        <button onClick={submit} className="w-full font-mono text-[10px] tracking-[1.5px] uppercase py-3 rounded-full border-none bg-gradient-to-br from-primary to-green-dark text-white cursor-pointer text-center">Save Trek Log</button>
        <button onClick={onClose} className="w-full font-mono text-[10px] tracking-[1.5px] uppercase py-3 rounded-full border border-primary bg-transparent text-primary cursor-pointer text-center mt-2">Cancel</button>
      </div>
    </div>
  );
}
