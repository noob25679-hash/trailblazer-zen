export interface TrekLog {
  id: string;
  trailTitle: string;
  completedAt: string;
  distanceKm: number;
  durationMinutes: number;
  elevationGain: number;
  rating: number;
  notes: string;
  trekType: 'solo' | 'duo' | 'group';
  companions: string[];
}

export const RANKS = [
  { title: '🥾 Beginner', cls: 'rank-beginner', min: 0, max: 500 },
  { title: '🧭 Explorer', cls: 'rank-explorer', min: 500, max: 1500 },
  { title: '⛰️ Trailblazer', cls: 'rank-trailblazer', min: 1500, max: 3000 },
  { title: '🏔️ Summit Seeker', cls: 'rank-summit', min: 3000, max: 6000 },
  { title: '🌟 Legend', cls: 'rank-legend', min: 6000, max: 9999 },
];

export const BADGES = [
  { id: 'first_trek', icon: '🥾', name: 'First Step', desc: 'Log your first trek', check: (logs: TrekLog[]) => logs.length >= 1 },
  { id: 'trek5', icon: '🎯', name: '5 Treks', desc: 'Complete 5 treks', check: (logs: TrekLog[]) => logs.length >= 5 },
  { id: 'trek10', icon: '💪', name: '10 Treks', desc: 'Complete 10 treks', check: (logs: TrekLog[]) => logs.length >= 10 },
  { id: 'km50', icon: '📏', name: '50km Club', desc: 'Hike 50km total', check: (logs: TrekLog[]) => logs.reduce((s, l) => s + (l.distanceKm || 0), 0) >= 50 },
  { id: 'km100', icon: '🛣️', name: '100km Legend', desc: 'Hike 100km total', check: (logs: TrekLog[]) => logs.reduce((s, l) => s + (l.distanceKm || 0), 0) >= 100 },
  { id: 'elev1000', icon: '🏔️', name: 'Sky High', desc: '1000m elevation total', check: (logs: TrekLog[]) => logs.reduce((s, l) => s + (l.elevationGain || 0), 0) >= 1000 },
  { id: 'perfect', icon: '⭐', name: 'Perfectionist', desc: 'Give a 5-star rating', check: (logs: TrekLog[]) => logs.some(l => l.rating === 5) },
];

export function calcXP(logs: TrekLog[]): number {
  return logs.reduce((total, l) => {
    let xp = 100;
    xp += Math.floor((l.distanceKm || 0) * 10);
    xp += Math.floor((l.elevationGain || 0) / 100) * 20;
    if (l.rating === 5) xp += 50;
    if (l.trekType === 'duo') xp += 50;
    if (l.trekType === 'group') xp += 100;
    return total + xp;
  }, 0);
}

export function getRank(xp: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

export const PRODUCTS = [
  { id: 'p1', name: 'Trail Pro X Boots', brand: 'Quechua', price: 2499, orig: 3499, cat: 'boots', icon: '👟', rating: 4.5 },
  { id: 'p2', name: 'Summit 45L Backpack', brand: 'Decathlon', price: 1899, orig: 2499, cat: 'bags', icon: '🎒', rating: 4.7 },
  { id: 'p3', name: 'Carbon Trek Poles', brand: 'Black Diamond', price: 3299, orig: 4500, cat: 'poles', icon: '🥢', rating: 4.8 },
  { id: 'p4', name: 'Windproof Jacket', brand: 'Columbia', price: 2999, orig: 4999, cat: 'clothing', icon: '🧥', rating: 4.6 },
  { id: 'p5', name: 'First Aid Kit Pro', brand: 'SafeTrek', price: 799, orig: 999, cat: 'safety', icon: '⛑️', rating: 4.9 },
  { id: 'p6', name: 'Hydration Bladder 2L', brand: 'CamelBak', price: 1299, orig: 1799, cat: 'hydration', icon: '💧', rating: 4.7 },
  { id: 'p7', name: 'Merino Wool Socks', brand: 'Darn Tough', price: 599, orig: 899, cat: 'clothing', icon: '🧦', rating: 4.8 },
  { id: 'p8', name: 'Headlamp 350 Lumens', brand: 'Petzl', price: 1499, orig: 2199, cat: 'safety', icon: '🔦', rating: 4.9 },
  { id: 'p9', name: 'Trekking Gaiters', brand: 'Outdoor Research', price: 899, orig: 1299, cat: 'boots', icon: '🦵', rating: 4.4 },
  { id: 'p10', name: 'Dry Bag Set 3pc', brand: 'Sea to Summit', price: 1099, orig: 1499, cat: 'bags', icon: '🗃️', rating: 4.6 },
  { id: 'p11', name: 'Energy Gel Pack x10', brand: 'GU Energy', price: 699, orig: 899, cat: 'hydration', icon: '⚡', rating: 4.5 },
  { id: 'p12', name: 'GPS Watch Lite', brand: 'Garmin', price: 8999, orig: 12999, cat: 'safety', icon: '⌚', rating: 4.8 },
];

export const COMMUNITY = [
  { name: 'ArjunTrekker', xp: 4800, treks: 28, km: 342 },
  { name: 'PriyaHikes', xp: 3200, treks: 19, km: 218 },
  { name: 'RohitSummit', xp: 2100, treks: 14, km: 156 },
  { name: 'NehaAdventure', xp: 1600, treks: 11, km: 98 },
  { name: 'VikasPeak', xp: 900, treks: 7, km: 64 },
  { name: 'SnehaTrails', xp: 600, treks: 5, km: 41 },
  { name: 'AmitWalker', xp: 350, treks: 3, km: 22 },
  { name: 'KavyaPahadi', xp: 5200, treks: 33, km: 410 },
  { name: 'SureshRaahi', xp: 2800, treks: 17, km: 198 },
  { name: 'AnjaliSherpaji', xp: 7100, treks: 45, km: 612 },
];
