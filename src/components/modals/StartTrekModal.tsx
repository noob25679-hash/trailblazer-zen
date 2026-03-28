import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function StartTrekModal({ onClose }: { onClose: () => void }) {
  const { setIsTracking, setTrackName, setScreen, showToast } = useApp();
  const [name, setName] = useState('');

  const start = () => {
    if (!name.trim()) { showToast('⚠️ Enter a trek name first'); return; }
    setTrackName(name.trim());
    setIsTracking(true);
    showToast(`🔴 Recording "${name.trim()}"`);
    onClose();
    setScreen('sensors');
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-end" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-card rounded-t-3xl w-full p-6 border-t border-border-bright animate-sheet-up">
        <div className="w-10 h-1 rounded-full bg-text-dim mx-auto mb-5" />
        <div className="text-center mb-5">
          <div className="text-[48px] mb-2">🥾</div>
          <div className="font-display text-[24px] mb-1">Start a Trek</div>
          <div className="text-[13px] text-muted-foreground">Give your trek a name before heading out</div>
        </div>
        <div className="mb-4">
          <label className="font-mono text-[9px] tracking-[2px] text-muted-foreground uppercase block mb-1.5">Trek Name *</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Harishchandragad Summit" autoFocus
            className="w-full bg-secondary border border-border rounded-xl px-3.5 py-3 text-foreground text-[14px] outline-none focus:border-primary" />
        </div>
        <div className="bg-secondary rounded-[14px] p-3.5 mb-5">
          <div className="font-mono text-[9px] text-muted-foreground tracking-[1px] mb-2">WHAT GETS RECORDED</div>
          <div className="flex flex-wrap gap-2">
            {['📍 GPS Route', '🏔️ Elevation', '📏 Distance', '⏱ Duration', '💨 Speed', '🧭 Compass'].map(s => (
              <span key={s} className="text-[12px] text-secondary-foreground">{s}</span>
            ))}
          </div>
        </div>
        <button onClick={start} className="w-full font-mono text-[13px] tracking-[1.5px] uppercase py-3 rounded-full border-none bg-gradient-to-br from-primary to-green-dark text-white cursor-pointer text-center">
          🔴 Start Recording
        </button>
        <button onClick={onClose} className="w-full font-mono text-[10px] tracking-[1.5px] uppercase py-3 rounded-full border border-primary bg-transparent text-primary cursor-pointer text-center mt-2">Cancel</button>
      </div>
    </div>
  );
}
