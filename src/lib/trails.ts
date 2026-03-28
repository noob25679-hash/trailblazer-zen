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
      const timeout = setTimeout(() => controller.abort(), 20000);
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
