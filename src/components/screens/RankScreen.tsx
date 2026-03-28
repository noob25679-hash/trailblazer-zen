import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calcXP, getRank, RANKS, BADGES, COMMUNITY } from '@/lib/xp';

export default function RankScreen() {
  const { trekLogs, savedTrails, userName, cart } = useApp();
  const [tab, setTab] = useState<'rank' | 'badges' | 'leaderboard'>('rank');

  const xp = calcXP(trekLogs);
  const rank = getRank(xp);
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  const progress = nextRank ? ((xp - rank.min) / (nextRank.min - rank.min)) * 100 : 100;

  const userEntry = { name: userName, xp, isMe: true };
  const fakeBoard = [
    ...COMMUNITY.slice(0, 4).map(c => ({ ...c, isMe: false })),
    userEntry,
    ...COMMUNITY.slice(4, 7).map(c => ({ ...c, xp: Math.max(0, c.xp - 300), isMe: false })),
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-[52px] pb-4" style={{ background: 'linear-gradient(180deg, hsl(var(--secondary)) 0%, transparent 100%)' }}>
        <div className="font-mono text-[9px] tracking-[3px] text-primary uppercase">Compete</div>
        <div className="font-display text-[36px] tracking-[1px] text-foreground leading-none mt-0.5">Your Rank</div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide">
        {/* XP Card */}
        <div className="mx-4 mb-4">
          <div className="bg-card border border-border rounded-[20px] p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="font-mono text-[10px] tracking-[1px] font-semibold uppercase text-primary bg-green-dim px-3 py-1 rounded-full inline-block">{rank.title}</div>
                <div className="font-display text-[36px] text-foreground mt-2">{xp.toLocaleString()} XP</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-muted-foreground">Next rank</div>
                <div className="text-[13px] text-secondary-foreground font-bold">{nextRank ? `${nextRank.min.toLocaleString()} XP` : 'MAX RANK'}</div>
              </div>
            </div>
            <div className="bg-border rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-lime-400 transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* XP breakdown */}
        <div className="font-mono text-[11px] tracking-[1.5px] text-muted-foreground uppercase px-4 mb-2.5 font-semibold">How to earn XP</div>
        <div className="mx-4 mb-5 bg-card border border-border rounded-2xl overflow-hidden">
          {[
            ['🥾 Log a trek', '+100 XP'],
            ['📏 Per km hiked', '+10 XP'],
            ['↑ Per 100m elevation', '+20 XP'],
            ['⭐ 5-star rating given', '+50 XP'],
          ].map(([label, xp]) => (
            <div key={label} className="flex justify-between px-4 py-3 border-b border-border last:border-b-0">
              <span className="text-[13px] text-secondary-foreground">{label}</span>
              <span className="text-primary font-mono text-[12px]">{xp}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-secondary mx-0 sticky top-0 z-10">
          {(['rank', 'badges', 'leaderboard'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 font-mono text-[11px] tracking-[0.5px] uppercase font-semibold cursor-pointer transition-all bg-transparent border-none border-b-2 ${
                tab === t ? 'text-primary border-primary' : 'text-text-dim border-transparent'
              }`}>
              {t === 'rank' ? '📊 Ranks' : t === 'badges' ? '🏆 Badges' : '🏅 Board'}
            </button>
          ))}
        </div>

        {tab === 'rank' && (
          <div className="p-4">
            {RANKS.map(r => (
              <div key={r.cls} className={`flex items-center gap-3 bg-card border rounded-2xl px-3.5 py-3 mb-2.5 ${
                rank.cls === r.cls ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <div className="font-display text-[24px]">{r.title.split(' ')[0]}</div>
                <div className="flex-1">
                  <div className="font-bold text-[14px] text-foreground">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground">{r.min.toLocaleString()} - {r.max.toLocaleString()} XP</div>
                </div>
                {rank.cls === r.cls && <span className="text-primary text-[12px]">← You</span>}
              </div>
            ))}
          </div>
        )}

        {tab === 'badges' && (
          <div className="flex flex-wrap gap-2.5 p-4">
            {BADGES.map(b => {
              const unlocked = b.check(trekLogs);
              return (
                <div key={b.id} className={`flex flex-col items-center gap-1 w-[calc(33.33%-7px)] bg-card border rounded-2xl p-3 text-center ${
                  unlocked ? 'border-primary bg-primary/5' : 'border-border opacity-35 grayscale'
                }`}>
                  <div className="text-[28px]">{b.icon}</div>
                  <div className="font-mono text-[8px] tracking-[1px] text-muted-foreground uppercase">{b.name}</div>
                  <div className="text-[9px] text-text-dim">{b.desc}</div>
                  {unlocked && <div className="text-[9px] text-primary mt-0.5">✓ EARNED</div>}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="p-4 pb-20">
            {fakeBoard.map((p, i) => (
              <div key={p.name} className={`flex items-center gap-3 bg-card border rounded-2xl px-3.5 py-3 mb-2 ${
                p.isMe ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <div className={`font-display text-[22px] w-8 text-center ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-text-dim'
                }`}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
                <div className="w-10 h-10 rounded-full bg-green-dim flex items-center justify-center font-display text-[18px] text-white flex-shrink-0">
                  {(p.name[0] || 'T').toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[14px] text-foreground">{p.name}{p.isMe ? ' 👈 You' : ''}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{getRank(p.xp).title}</div>
                </div>
                <div className="font-display text-[20px] text-primary">{p.xp.toLocaleString()}<span className="text-[10px] text-muted-foreground"> XP</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
