export interface Trail {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  distance: number;
  rating: number;
  elevation: number | null;
  typeIcon: string;
  typeLabel: string;
  isHighRated: boolean;
  popularity: number; // higher = more famous
}

// Popularity scoring based on OSM tag richness
function calcPopularity(tags: Record<string, string>): number {
  let score = 0;
  const tagCount = Object.keys(tags).length;
  score += tagCount * 2;
  if (tags.wikipedia || tags.wikidata) score += 30;
  if (tags.tourism) score += 10;
  if (tags.name?.match(/fort|peak|falls|temple/i)) score += 15;
  if (tags.ele && parseInt(tags.ele) > 1000) score += 10;
  if (tags.historic) score += 10;
  return score;
}

export async function fetchTrailsFromOverpass(
  lat: number,
  lng: number,
  radiusMeters: number = 40000
): Promise<Trail[]> {
  const query = `[out:json][timeout:25];(
    node["historic"="fort"]["name"](around:${radiusMeters},${lat},${lng});
    way["historic"="fort"]["name"](around:${radiusMeters},${lat},${lng});
    node["natural"="peak"]["name"](around:${radiusMeters},${lat},${lng});
    node["natural"="waterfall"]["name"](around:${radiusMeters},${lat},${lng});
    node["tourism"="viewpoint"]["name"](around:${radiusMeters},${lat},${lng});
    node["natural"="hill"]["name"](around:${radiusMeters},${lat},${lng});
    node["leisure"="nature_reserve"]["name"](around:${radiusMeters},${lat},${lng});
  );out center;`;

  const mirrors = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];

  let data: any = null;
  for (const mirror of mirrors) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${mirror}?data=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        data = await res.json();
        break;
      }
    } catch {
      continue;
    }
  }

  if (!data?.elements) return [];

  const seen = new Set<string>();
  return data.elements
    .filter((e: any) => {
      if (!e.tags?.name) return false;
      const key = e.tags.name + '_' + (e.tags.historic || e.tags.natural || e.tags.tourism || '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((el: any) => {
      const tags = el.tags || {};
      let typeIcon = '⛰️', typeLabel = 'Trail', difficulty: Trail['difficulty'] = 'Moderate';

      if (tags.historic === 'fort' || tags.historic === 'castle') {
        typeIcon = '🏯'; typeLabel = 'Fort'; difficulty = 'Hard';
      } else if (tags.natural === 'peak') {
        typeIcon = '🏔️'; typeLabel = 'Peak';
        difficulty = (tags.ele && parseInt(tags.ele) > 1000) ? 'Hard' : 'Moderate';
      } else if (tags.natural === 'waterfall') {
        typeIcon = '💧'; typeLabel = 'Waterfall'; difficulty = 'Easy';
      } else if (tags.natural === 'hill') {
        typeIcon = '⛰️'; typeLabel = 'Hill'; difficulty = 'Easy';
      } else if (tags.tourism === 'viewpoint') {
        typeIcon = '🌄'; typeLabel = 'Viewpoint'; difficulty = 'Easy';
      } else if (tags.leisure === 'nature_reserve') {
        typeIcon = '🌿'; typeLabel = 'Reserve'; difficulty = 'Moderate';
      }

      const popularity = calcPopularity(tags);
      const ele = tags.ele ? parseInt(tags.ele) : null;
      const dist = ele
        ? parseFloat((ele / 300 + Math.random() * 4 + 2).toFixed(1))
        : parseFloat((Math.random() * 10 + 2).toFixed(1));
      const rating = parseFloat(
        (popularity > 40 ? 4.2 + Math.random() * 0.8 : 3.2 + Math.random() * 1.2).toFixed(1)
      );

      const trailLat = el.center ? el.center.lat : el.lat;
      const trailLng = el.center ? el.center.lon : el.lon;

      if (!trailLat || !trailLng) return null;

      return {
        id: 'trail_' + el.id,
        title: tags.name,
        location: tags['addr:city'] || tags['addr:village'] || tags['addr:region'] || 'Nearby',
        lat: trailLat,
        lng: trailLng,
        difficulty,
        distance: dist,
        rating,
        elevation: ele,
        typeIcon,
        typeLabel,
        isHighRated: rating >= 4.5,
        popularity,
      } as Trail;
    })
    .filter(Boolean)
    .sort((a: Trail, b: Trail) => b.popularity - a.popularity);
}

export function difficultyColor(d: string): string {
  const dl = (d || '').toLowerCase();
  if (dl.includes('easy')) return 'text-primary border-primary';
  if (dl.includes('hard')) return 'text-destructive border-destructive';
  return 'text-warning border-warning';
}

export const FALLBACK_TRAILS: Trail[] = [
  { id: 'fb_1', title: 'Rajgad Fort', location: 'Pune', lat: 18.2461, lng: 73.6828, difficulty: 'Hard', distance: 6.5, rating: 4.7, elevation: 1395, typeIcon: '🏯', typeLabel: 'Fort', isHighRated: true, popularity: 80 },
  { id: 'fb_2', title: 'Lohagad Fort', location: 'Lonavala', lat: 18.7083, lng: 73.4769, difficulty: 'Moderate', distance: 3.5, rating: 4.5, elevation: 1033, typeIcon: '🏯', typeLabel: 'Fort', isHighRated: true, popularity: 75 },
  { id: 'fb_3', title: 'Kalsubai Peak', location: 'Ahmednagar', lat: 19.6015, lng: 73.7107, difficulty: 'Hard', distance: 8.0, rating: 4.8, elevation: 1646, typeIcon: '🏔️', typeLabel: 'Peak', isHighRated: true, popularity: 90 },
  { id: 'fb_4', title: 'Harishchandragad', location: 'Ahmednagar', lat: 19.3930, lng: 73.7790, difficulty: 'Hard', distance: 7.2, rating: 4.6, elevation: 1424, typeIcon: '🏔️', typeLabel: 'Peak', isHighRated: true, popularity: 85 },
  { id: 'fb_5', title: 'Visapur Fort', location: 'Lonavala', lat: 18.7178, lng: 73.4633, difficulty: 'Moderate', distance: 4.0, rating: 4.3, elevation: 1084, typeIcon: '🏯', typeLabel: 'Fort', isHighRated: false, popularity: 60 },
  { id: 'fb_6', title: 'Tikona Fort', location: 'Pawna', lat: 18.6513, lng: 73.4956, difficulty: 'Moderate', distance: 3.0, rating: 4.2, elevation: 1066, typeIcon: '🏯', typeLabel: 'Fort', isHighRated: false, popularity: 55 },
  { id: 'fb_7', title: 'Devkund Waterfall', location: 'Bhira', lat: 18.3950, lng: 73.4600, difficulty: 'Easy', distance: 5.0, rating: 4.4, elevation: null, typeIcon: '💧', typeLabel: 'Waterfall', isHighRated: false, popularity: 65 },
  { id: 'fb_8', title: 'Andharban Trail', location: 'Tamhini', lat: 18.4600, lng: 73.4300, difficulty: 'Moderate', distance: 13.0, rating: 4.6, elevation: 850, typeIcon: '🌿', typeLabel: 'Reserve', isHighRated: true, popularity: 70 },
  { id: 'fb_9', title: 'Torna Fort', location: 'Pune', lat: 18.2767, lng: 73.6228, difficulty: 'Hard', distance: 7.5, rating: 4.5, elevation: 1403, typeIcon: '🏯', typeLabel: 'Fort', isHighRated: true, popularity: 78 },
  { id: 'fb_10', title: 'Duke\'s Nose', location: 'Lonavala', lat: 18.7345, lng: 73.4123, difficulty: 'Easy', distance: 2.5, rating: 4.1, elevation: 650, typeIcon: '🌄', typeLabel: 'Viewpoint', isHighRated: false, popularity: 50 },
];

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
