import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { calcXP, getRank, COMMUNITY } from '@/lib/xp';

export default function ProfileScreen() {
  const { userName, setUserName, trekLogs, savedTrails, setScreen, friends, addFriend, removeFriend, showToast, logout } = useApp();
  const [tab, setTab] = useState<'stats' | 'friends' | 'settings'>('stats');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [friendInput, setFriendInput] = useState('');
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light'));

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      setIsLight(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle('light', next);
    localStorage.setItem('theme', next ? 'light' : 'dark');
  };

  const xp = calcXP(trekLogs);
  const rank = getRank(xp);
  const km = trekLogs.reduce((s, l) => s + (l.distanceKm || 0), 0).toFixed(1);
  const elev = trekLogs.reduce((s, l) => s + (l.elevationGain || 0), 0);

  const saveName = () => {
    if (nameInput.trim().length < 2) return;
    setUserName(nameInput.trim());
    setEditingName(false);
    showToast('✅ Name updated!');
  };

  const handleAddFriend = () => {
    const name = friendInput.trim();
    if (!name) { showToast('⚠️ Enter a username'); return; }
    if (name.toLowerCase() === userName.toLowerCase()) { showToast("⚠️ That's you!"); return; }
    if (friends.find((f: any) => f.name.toLowerCase() === name.toLowerCase())) { showToast('Already your friend!'); return; }
    const found = COMMUNITY.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!found) { showToast('⚠️ User not found'); return; }
    addFriend(found);
    setFriendInput('');
    showToast(`✅ ${found.name} added!`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="text-center pt-[52px] pb-7 px-5" style={{ background: 'linear-gradient(180deg, hsl(var(--green-dim)) 0%, hsl(var(--background)) 100%)' }}>
        <div className="w-20 h-20 rounded-full bg-green-dim border-[3px] border-primary flex items-center justify-center font-display text-[32px] text-white mx-auto mb-3">
          {(userName[0] || 'T').toUpperCase()}
        </div>
        <div className="font-display text-[28px] tracking-[1px]">{userName.toUpperCase()}</div>
        <div className="mt-1.5"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] tracking-[1px] font-semibold uppercase ${rank.cls === 'rank-beginner' ? 'bg-green-dim text-green-muted border border-green-muted' : rank.cls === 'rank-explorer' ? 'bg-blue-900/30 text-blue-400 border border-blue-400' : rank.cls === 'rank-trailblazer' ? 'bg-purple-900/30 text-purple-400 border border-purple-400' : rank.cls === 'rank-summit' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-400' : 'bg-red-900/30 text-red-400 border border-red-400'}`}>{rank.title}</span></div>
        <button onClick={() => { setNameInput(userName); setEditingName(true); }}
          className="mt-3 font-mono text-[9px] px-3 py-2 rounded-full border border-primary bg-transparent text-primary cursor-pointer">✏️ Edit Name</button>
      </div>

      {/* Edit Name Modal */}
      {editingName && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-end" onClick={e => e.target === e.currentTarget && setEditingName(false)}>
          <div className="bg-card rounded-t-3xl w-full p-6 border-t border-border-bright animate-sheet-up">
            <div className="w-10 h-1 rounded-full bg-text-dim mx-auto mb-5" />
            <div className="font-display text-[24px] mb-5">Edit Trail Name</div>
            <input value={nameInput} onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              className="w-full bg-secondary border border-border rounded-xl px-3.5 py-3 text-foreground text-[14px] outline-none focus:border-primary mb-4" />
            <div className="flex gap-2.5">
              <button onClick={() => setEditingName(false)} className="flex-1 font-mono text-[10px] px-5 py-3 rounded-full border border-primary bg-transparent text-primary cursor-pointer">Cancel</button>
              <button onClick={saveName} className="flex-1 font-mono text-[10px] px-5 py-3 rounded-full border-none bg-gradient-to-br from-primary to-green-dark text-white cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border bg-secondary flex-shrink-0">
        {(['stats', 'friends', 'settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 font-mono text-[11px] tracking-[0.5px] uppercase font-semibold cursor-pointer transition-all bg-transparent border-none border-b-2 ${
              tab === t ? 'text-primary border-primary' : 'text-text-dim border-transparent'
            }`}>
            {t === 'stats' ? '📊 Stats' : t === 'friends' ? '👥 Friends' : '⚙️ Settings'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide">
        {tab === 'stats' && (
          <div>
            <div className="grid grid-cols-2 gap-2.5 px-4 mt-4">
              {[
                { val: trekLogs.length, label: 'Treks' },
                { val: km, label: 'KM Hiked' },
                { val: savedTrails.length, label: 'Saved' },
                { val: elev, label: 'Elev (m)' },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                  <div className="font-display text-[32px] text-primary leading-none">{s.val}</div>
                  <div className="font-mono text-[8px] tracking-[2px] text-muted-foreground mt-1 uppercase">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4 mt-4 flex flex-col gap-2">
              <button onClick={() => setScreen('shop')} className="w-full font-mono text-[10px] px-5 py-3 rounded-full border border-primary bg-transparent text-primary cursor-pointer text-center">🛒 Trek Shop</button>
              <button onClick={() => setScreen('logs')} className="w-full font-mono text-[10px] px-5 py-3 rounded-full border border-primary bg-transparent text-primary cursor-pointer text-center">📓 View All Trek Logs</button>
            </div>
          </div>
        )}

        {tab === 'friends' && (
          <div className="p-4">
            <div className="bg-card border border-border rounded-2xl p-4 mb-4">
              <div className="font-mono text-[9px] tracking-[2px] text-muted-foreground mb-2.5">ADD A FRIEND</div>
              <div className="flex gap-2">
                <input value={friendInput} onChange={e => setFriendInput(e.target.value)}
                  placeholder="Enter username..." className="flex-1 bg-secondary border border-border rounded-xl px-3.5 py-2.5 text-foreground text-[14px] outline-none focus:border-primary" />
                <button onClick={handleAddFriend} className="font-mono text-[9px] px-3 py-2 rounded-full border-none bg-gradient-to-br from-primary to-green-dark text-white cursor-pointer flex-shrink-0">Add</button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="font-mono text-[11px] tracking-[1.5px] text-muted-foreground uppercase font-semibold">Your Friends</div>
              <span className="font-mono text-[9px] text-muted-foreground">{friends.length} friend{friends.length !== 1 ? 's' : ''}</span>
            </div>
            {!friends.length ? (
              <div className="text-center py-8">
                <div className="text-[56px] mb-4">👥</div>
                <div className="font-display text-[22px] text-secondary-foreground">No Friends Yet</div>
                <div className="text-[13px] text-muted-foreground mt-2">Search trekkers above and add them!</div>
              </div>
            ) : (
              friends.map((f: any) => (
                <div key={f.name} className="flex items-center gap-3 bg-card border border-border rounded-2xl px-3.5 py-3 mb-2.5">
                  <div className="w-11 h-11 rounded-full bg-green-dim border-2 border-primary flex items-center justify-center font-display text-[20px] text-white flex-shrink-0">
                    {(f.name[0] || 'T').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] text-foreground">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{getRank(f.xp || 0).title} · {f.treks || 0} treks</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="font-display text-[18px] text-primary">{(f.xp || 0).toLocaleString()}<span className="text-[9px] text-muted-foreground"> XP</span></div>
                    <button onClick={() => { removeFriend(f.name); showToast('Removed'); }} className="font-mono text-[8px] px-2 py-1 rounded-full border border-destructive bg-transparent text-destructive cursor-pointer">Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div>
            <div className="font-mono text-[11px] tracking-[1.5px] text-muted-foreground uppercase mt-4 px-4 mb-2.5 font-semibold">Appearance</div>
            <div className="mx-4 bg-card border border-border rounded-2xl overflow-hidden mb-4">
              <div className="flex items-center gap-3 px-4 py-4">
                <span className="text-[18px] w-8 text-center">{isLight ? '🌙' : '☀️'}</span>
                <span className="flex-1 text-[14px] text-secondary-foreground">{isLight ? 'Dark Mode' : 'Light Mode'}</span>
                <button onClick={toggleTheme} className="w-12 h-7 rounded-full relative transition-colors" style={{ background: isLight ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}>
                  <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${isLight ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="font-mono text-[11px] tracking-[1.5px] text-muted-foreground uppercase px-4 mb-2.5 font-semibold">Settings</div>
            <div className="mx-4 bg-card border border-border rounded-2xl overflow-hidden">
              {[
                { icon: '🔔', label: 'Notifications' },
                { icon: '📍', label: 'Location Access' },
                { icon: '💾', label: 'Data stored locally' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0">
                  <span className="text-[18px] w-8 text-center">{item.icon}</span>
                  <span className="flex-1 text-[14px] text-secondary-foreground">{item.label}</span>
                  <span className="text-[11px] text-primary">ON</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-5 flex flex-col gap-2.5 pb-10">
              <button onClick={logout} className="w-full font-mono text-[10px] px-5 py-3 rounded-full border border-destructive bg-transparent text-destructive cursor-pointer text-center">🚪 Log Out</button>
              <button onClick={() => { localStorage.removeItem('trekr_saved'); localStorage.removeItem('trekr_logs'); showToast('Data cleared'); window.location.reload(); }}
                className="w-full font-mono text-[10px] px-5 py-3 rounded-full border border-destructive bg-transparent text-destructive cursor-pointer text-center">🗑️ Clear All Data</button>
              <div className="text-center mt-2 text-[11px] text-text-dim font-mono">TREKR v2.0 · Built for the mountains</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
