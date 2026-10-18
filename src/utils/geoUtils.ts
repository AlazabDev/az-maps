import { GeoLocation, PostgisQueryResult } from '../types/maps';

/**
 * Calculates the great-circle distance between two points in meters (Haversine formula).
 * Points are passed as [longitude, latitude] to match PostGIS / GeoJSON standard.
 */
export function calculateHaversineDistanceMeters(
  point1: [number, number],
  point2: [number, number]
): number {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;

  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Formats distance in km or meters nicely.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} م`;
  }
  return `${(meters / 1000).toFixed(2)} كم`;
}

/**
 * Simulates executing PostGIS spatial SQL queries over the in-memory locations dataset.
 */
export function executeMockPostgisQuery(
  querySql: string,
  locations: GeoLocation[],
  params?: {
    centerLon?: number;
    centerLat?: number;
    radiusMeters?: number;
    minLon?: number;
    minLat?: number;
    maxLon?: number;
    maxLat?: number;
  }
): PostgisQueryResult {
  const startTime = performance.now();
  const normalizedSql = querySql.trim();

  let matchedLocations = [...locations];

  // 1. ST_DWithin query (e.g. 5000m radius around point)
  if (normalizedSql.includes('ST_DWithin') || normalizedSql.includes('5000')) {
    const centerLon = params?.centerLon ?? 29.949; // Default Sidi Gaber
    const centerLat = params?.centerLat ?? 31.184;
    const radius = params?.radiusMeters ?? 5000;

    matchedLocations = locations
      .map(loc => {
        const dist = calculateHaversineDistanceMeters(loc.geom.coordinates, [centerLon, centerLat]);
        return { loc, dist };
      })
      .filter(item => item.dist <= radius)
      .sort((a, b) => a.dist - b.dist)
      .map(item => item.loc);
  }
  // 2. Bounding Box query
  else if (normalizedSql.includes('ST_MakeEnvelope') || normalizedSql.includes('BBOX')) {
    const minLon = params?.minLon ?? 29.85;
    const maxLon = params?.maxLon ?? 30.05;
    const minLat = params?.minLat ?? 31.10;
    const maxLat = params?.maxLat ?? 31.30;

    matchedLocations = locations.filter(loc => {
      const [lon, lat] = loc.geom.coordinates;
      return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
    });
  }
  // 3. UberFix tickets query
  else if (normalizedSql.includes("layer = 'uberfix'") || normalizedSql.includes('uberfix')) {
    matchedLocations = locations.filter(loc => loc.layer === 'uberfix');
  }
  // 4. Projects query
  else if (normalizedSql.includes("layer = 'projects'") || normalizedSql.includes('daftra') || normalizedSql.includes('erpnext')) {
    matchedLocations = locations.filter(loc => loc.layer === 'projects' || loc.source.system === 'erpnext');
  }

  const columns = ['id', 'code', 'name', 'layer', 'status', 'source_system', 'longitude', 'latitude', 'distance_from_query_point'];

  const rows = matchedLocations.map(loc => {
    const [lon, lat] = loc.geom.coordinates;
    const dist = params?.centerLon && params?.centerLat
      ? formatDistance(calculateHaversineDistanceMeters(loc.geom.coordinates, [params.centerLon, params.centerLat]))
      : `${(calculateHaversineDistanceMeters(loc.geom.coordinates, [29.949, 31.184]) / 1000).toFixed(2)} كم`;

    return {
      id: loc.id.slice(0, 8) + '...',
      code: loc.code,
      name: loc.name,
      layer: loc.layer,
      status: loc.status,
      source_system: loc.source.system,
      longitude: lon.toFixed(5),
      latitude: lat.toFixed(5),
      distance_from_query_point: dist,
      rawLocation: loc
    };
  });

  const duration = Math.round((performance.now() - startTime) * 10) / 10 + 2.8;

  return {
    columns,
    rows,
    executionTimeMs: duration,
    rowCount: rows.length,
    query: querySql
  };
}

/**
 * Converts GeoLocations into a valid GeoJSON FeatureCollection.
 */
export function exportToGeoJson(locations: GeoLocation[]): string {
  const featureCollection = {
    type: 'FeatureCollection',
    name: 'Alazab_Maps_Export',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    features: locations.map(loc => ({
      type: 'Feature',
      id: loc.id,
      geometry: loc.geom,
      properties: {
        code: loc.code,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        status: loc.status,
        layer: loc.layer,
        source_system: loc.source.system,
        external_id: loc.source.external_id,
        ...loc.metadata
      }
    }))
  };

  return JSON.stringify(featureCollection, null, 2);
}

/**
 * Parses user-uploaded GeoJSON text and returns created GeoLocations.
 */
export function parseGeoJsonInput(jsonText: string): GeoLocation[] {
  try {
    const parsed = JSON.parse(jsonText);
    const features = parsed.features || (parsed.type === 'Feature' ? [parsed] : []);

    return features.map((feat: any, idx: number): GeoLocation => {
      const coords = feat.geometry?.coordinates || [29.949 + idx * 0.01, 31.184 + idx * 0.01];
      const props = feat.properties || {};

      return {
        id: feat.id || crypto.randomUUID(),
        workspace_id: 'ws-alazab-eg-01',
        code: props.code || `AZ-IMP-${1000 + idx}`,
        name: props.name || `موقع مستورد ${idx + 1}`,
        address: props.address || 'موقع مسجل من ملف جغرافي',
        city: props.city || 'Alexandria',
        geom: {
          type: 'Point',
          coordinates: [coords[0], coords[1]]
        },
        status: (props.status as any) || 'active',
        layer: (props.layer as any) || 'projects',
        metadata: {
          category: props.category || 'مستورد خارجي',
          priority: props.priority || 'medium'
        },
        source: {
          system: 'manual',
          entity_type: 'geojson_import',
          external_id: `IMPORT-${Date.now()}-${idx}`,
          last_synced_at: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
  } catch (err) {
    throw new Error('الملف ليس بصيغة GeoJSON صالحة');
  }
}
