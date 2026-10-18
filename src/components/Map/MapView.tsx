import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// leaflet.heat attaches to window.L
if (typeof window !== 'undefined' && !(window as any).L) {
  (window as any).L = L;
}
import 'leaflet.heat';

import { GeoLocation, GeoLayer, GeoFence, LayerType } from '../../types/maps';
import {
  Layers,
  Crosshair,
  MapPin,
  ZoomIn,
  ZoomOut,
  Flame,
  Sliders,
  Eye,
  EyeOff,
  Filter,
  Info,
  Box
} from 'lucide-react';
import { formatDistance } from '../../utils/geoUtils';
import { Bim3DViewerModal } from './Bim3DViewerModal';

interface MapViewProps {
  locations: GeoLocation[];
  layers: GeoLayer[];
  geofences: GeoFence[];
  selectedLocation: GeoLocation | null;
  onSelectLocation: (location: GeoLocation | null) => void;
  onMapClickCoordinates?: (coords: [number, number]) => void;
  isAddingLocationMode?: boolean;
  highlightedIds?: string[];
  activeRadiusBuffer?: { center: [number, number]; radiusMeters: number; name?: string; title?: string } | null;
  onClearRadiusBuffer?: () => void;
}

type MapTheme = 'dark' | 'streets' | 'satellite' | 'light';

const TILE_PROVIDERS: Record<MapTheme, { url: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19
  },
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    maxZoom: 19
  }
};

const LAYER_COLORS: Record<LayerType, string> = {
  projects: '#3b82f6',
  uberfix: '#f59e0b',
  branches: '#10b981',
  assets: '#8b5cf6',
  fleet: '#06b6d4',
  geofences: '#ec4899',
  surveillance: '#ef4444'
};

export const MapView: React.FC<MapViewProps> = ({
  locations,
  layers,
  geofences,
  selectedLocation,
  onSelectLocation,
  onMapClickCoordinates,
  isAddingLocationMode = false,
  highlightedIds = [],
  activeRadiusBuffer = null,
  onClearRadiusBuffer
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const geofencesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const heatmapLayerRef = useRef<L.HeatLayer | null>(null);

  const [mapTheme, setMapTheme] = useState<MapTheme>('dark');
  const [activeCity, setActiveCity] = useState<'alex' | 'cairo' | 'alamein' | 'all'>('alex');
  const [internalBuffer, setInternalBuffer] = useState<{ center: [number, number]; radiusMeters: number; title: string; name?: string } | null>(null);

  // UberFix Heatmap Controls
  const [isHeatmapEnabled, setIsHeatmapEnabled] = useState(true);
  const [showMarkersWithHeatmap, setShowMarkersWithHeatmap] = useState(true);
  const [heatmapRadius, setHeatmapRadius] = useState(32);
  const [heatmapBlur, setHeatmapBlur] = useState(20);
  const [heatmapPriorityFilter, setHeatmapPriorityFilter] = useState<'all' | 'high_critical'>('all');
  const [isHeatmapConfigOpen, setIsHeatmapConfigOpen] = useState(false);
  
  // Experimental 3D BIM Viewer Modal
  const [isBimModalOpen, setIsBimModalOpen] = useState(false);
  const [bimModalLocation, setBimModalLocation] = useState<GeoLocation | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center on Alexandria Sidi Gaber
    const map = L.map(mapContainerRef.current, {
      center: [31.216, 29.949],
      zoom: 13,
      zoomControl: false,
      attributionControl: true
    });

    const tile = L.tileLayer(TILE_PROVIDERS.dark.url, {
      attribution: TILE_PROVIDERS.dark.attribution,
      maxZoom: TILE_PROVIDERS.dark.maxZoom
    }).addTo(map);

    tileLayerRef.current = tile;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;

    const geofencesGroup = L.layerGroup().addTo(map);
    geofencesLayerGroupRef.current = geofencesGroup;

    // Handle map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (onMapClickCoordinates) {
        onMapClickCoordinates([lng, lat]);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const provider = TILE_PROVIDERS[mapTheme];
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [mapTheme]);

  // Leaflet.heat Heatmap Layer for UberFix Maintenance Tickets
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing heatmap layer if present
    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (!isHeatmapEnabled) return;

    // Filter UberFix maintenance incidents
    const uberfixLocations = locations.filter(loc => {
      if (loc.layer !== 'uberfix') return false;
      if (heatmapPriorityFilter === 'high_critical') {
        return loc.metadata.priority === 'high' || loc.metadata.priority === 'critical';
      }
      return true;
    });

    if (uberfixLocations.length === 0) return;

    // Convert to Leaflet.heat LatLng tuples: [lat, lng, intensity]
    const heatData: L.HeatLatLngTuple[] = uberfixLocations.map(loc => {
      const [lng, lat] = loc.geom.coordinates;
      let intensity = 0.45;
      if (loc.metadata.priority === 'critical') intensity = 1.0;
      else if (loc.metadata.priority === 'high') intensity = 0.8;
      else if (loc.metadata.priority === 'medium') intensity = 0.55;

      return [lat, lng, intensity];
    });

    // Create Leaflet.heat layer with high-contrast gradient
    try {
      const heat = L.heatLayer(heatData, {
        radius: heatmapRadius,
        blur: heatmapBlur,
        maxZoom: 18,
        minOpacity: 0.25,
        gradient: {
          0.2: '#0284c7', // sky-600
          0.4: '#10b981', // emerald-500
          0.6: '#f59e0b', // amber-500
          0.8: '#ef4444', // red-500
          1.0: '#991b1b'  // red-800 deep heat
        }
      }).addTo(map);

      heatmapLayerRef.current = heat;
    } catch (err) {
      console.error('Error initializing Leaflet.heat layer:', err);
    }
  }, [locations, isHeatmapEnabled, heatmapRadius, heatmapBlur, heatmapPriorityFilter]);

  // Update Markers based on locations, enabled layers, and highlights
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // If heatmap is enabled and user chose not to show markers with heatmap
    if (isHeatmapEnabled && !showMarkersWithHeatmap) {
      // Don't render uberfix markers, only other layers
    }

    // Map enabled layers keys
    const enabledLayerKeys = new Set(layers.filter(l => l.enabled).map(l => l.key));

    locations.forEach(loc => {
      if (!enabledLayerKeys.has(loc.layer)) return;
      if (loc.layer === 'uberfix' && isHeatmapEnabled && !showMarkersWithHeatmap) {
        return; // Suppressed in heatmap-only mode
      }

      const [lng, lat] = loc.geom.coordinates;
      const isSelected = selectedLocation?.id === loc.id;
      const isHighlighted = highlightedIds.length > 0 && highlightedIds.includes(loc.id);
      const color = LAYER_COLORS[loc.layer] || '#3b82f6';

      // Custom HTML Marker Icon
      const iconHtml = `
        <div class="relative group cursor-pointer">
          <div style="background-color: ${color}; width: ${isSelected ? '32px' : '26px'}; height: ${isSelected ? '32px' : '26px'}; border: 2.5px solid #ffffff; box-shadow: 0 0 15px ${color}88, 0 4px 6px rgba(0,0,0,0.4);"
               class="rounded-full flex items-center justify-center text-white transition-all transform duration-200 ${isSelected ? 'scale-125 ring-4 ring-amber-400' : ''} ${isHighlighted ? 'ring-4 ring-cyan-400 animate-pulse' : ''}">
            <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 9999px;"></div>
          </div>
          ${isSelected ? `<div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-[10px] text-white px-2 py-0.5 rounded whitespace-nowrap shadow-lg">${loc.code}</div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: iconHtml,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Build popup HTML
      const popupHtml = `
        <div class="p-3 text-right" dir="rtl" style="min-width: 240px; font-family: 'Cairo', sans-serif;">
          <div class="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">${loc.code}</span>
            <span class="text-[11px] font-medium text-slate-400 uppercase">${loc.source.system}</span>
          </div>
          <h4 class="text-sm font-bold text-white mb-1">${loc.name}</h4>
          <p class="text-xs text-slate-300 mb-2 leading-relaxed">${loc.address}</p>
          
          <div class="bg-slate-900/80 p-2 rounded border border-slate-800 mb-2 text-xs space-y-1">
            <div class="flex justify-between text-slate-400">
              <span>الإحداثيات:</span>
              <span class="font-mono text-slate-200 tabular-nums">${lng.toFixed(4)}, ${lat.toFixed(4)}</span>
            </div>
            ${loc.metadata.assigned_technician ? `
            <div class="flex justify-between text-slate-400">
              <span>الفني المكلف:</span>
              <span class="text-amber-300 font-medium">${loc.metadata.assigned_technician}</span>
            </div>` : ''}
            ${loc.metadata.priority ? `
            <div class="flex justify-between text-slate-400">
              <span>درجة الأولوية:</span>
              <span class="font-bold ${loc.metadata.priority === 'critical' ? 'text-red-400' : 'text-amber-400'}">${loc.metadata.priority.toUpperCase()}</span>
            </div>` : ''}
            ${loc.metadata.completion_percentage !== undefined ? `
            <div class="flex justify-between text-slate-400">
              <span>نسبة الإنجاز:</span>
              <span class="text-emerald-400 font-bold">${loc.metadata.completion_percentage}%</span>
            </div>` : ''}
          </div>

          <div class="flex items-center gap-1.5 pt-1">
            <button id="btn-buf-${loc.id}" class="flex-1 py-1 px-2 text-center text-[11px] font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded border border-amber-500/40 transition-colors">
              نطاق 5 كم
            </button>
            <button id="btn-focus-${loc.id}" class="flex-1 py-1 px-2 text-center text-[11px] font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded border border-blue-500/40 transition-colors">
              تركيز
            </button>
          </div>

          <div class="pt-1.5 mt-1.5 border-t border-slate-700/80">
            <button id="btn-bim-${loc.id}" class="w-full py-1 px-2 text-center text-[11px] font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg border border-blue-400/50 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              <span>استعراض نموذج BIM ثلاثي الأبعاد (3D)</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      marker.on('popupopen', () => {
        const bufBtn = document.getElementById(`btn-buf-${loc.id}`);
        if (bufBtn) {
          bufBtn.onclick = () => {
            setInternalBuffer({
              center: loc.geom.coordinates,
              radiusMeters: 5000,
              title: `نطاق 5 كم حول ${loc.name}`
            });
          };
        }

        const focusBtn = document.getElementById(`btn-focus-${loc.id}`);
        if (focusBtn) {
          focusBtn.onclick = () => {
            map.flyTo([lat, lng], 16, { duration: 1.2 });
          };
        }

        const bimBtn = document.getElementById(`btn-bim-${loc.id}`);
        if (bimBtn) {
          bimBtn.onclick = () => {
            setBimModalLocation(loc);
            setIsBimModalOpen(true);
          };
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [locations, layers, selectedLocation, highlightedIds, isHeatmapEnabled, showMarkersWithHeatmap]);

  // Update Geofences Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const geofencesGroup = geofencesLayerGroupRef.current;
    if (!map || !geofencesGroup) return;

    geofencesGroup.clearLayers();

    const isGeofenceLayerEnabled = layers.find(l => l.key === 'geofences')?.enabled ?? true;
    if (!isGeofenceLayerEnabled) return;

    geofences.forEach(gf => {
      if (!gf.active) return;

      if (gf.type === 'radius_buffer' && gf.center && gf.radius_meters) {
        const [lng, lat] = gf.center;
        const circle = L.circle([lat, lng], {
          radius: gf.radius_meters,
          color: '#ec4899',
          weight: 2,
          dashArray: '6, 6',
          fillColor: '#ec4899',
          fillOpacity: 0.12
        });

        circle.bindTooltip(`
          <div class="text-right text-xs font-sans" dir="rtl">
            <strong class="text-pink-400 block">${gf.name}</strong>
            <span class="text-slate-300 text-[11px]">${gf.rules.service_level}</span>
          </div>
        `, { sticky: true, className: 'bg-slate-900 border border-slate-700 text-white rounded' });

        geofencesGroup.addLayer(circle);
      } else if (gf.type === 'polygon_boundary' && gf.polygon_coordinates) {
        const latLngs = gf.polygon_coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
        const polygon = L.polygon(latLngs, {
          color: '#3b82f6',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 0.08
        });

        polygon.bindTooltip(`
          <div class="text-right text-xs font-sans" dir="rtl">
            <strong class="text-blue-400 block">${gf.name}</strong>
            <span class="text-slate-300 text-[11px]">${gf.rules.service_level}</span>
          </div>
        `, { sticky: true, className: 'bg-slate-900 border border-slate-700 text-white rounded' });

        geofencesGroup.addLayer(polygon);
      }
    });

    // 03 CCTV & Network Topology: Fiber Optic Routes & Camera FOV Cones
    const isSurveillanceEnabled = layers.find(l => l.key === 'surveillance')?.enabled ?? true;
    if (isSurveillanceEnabled) {
      // 1. Fiber Route: Sidi Gaber -> Smouha
      const fiberLine1 = L.polyline(
        [[31.216, 29.949], [31.215, 29.962]],
        { color: '#06b6d4', weight: 3, dashArray: '6, 6', opacity: 0.85 }
      );
      fiberLine1.bindTooltip(
        '<div class="text-right text-xs font-mono" dir="rtl"><strong class="text-cyan-400">مسار ألياف بصرية FBR-SG-SM-01</strong><br/><span class="text-slate-300">24-Core Armored Outdoor (0.32 dB/km)</span></div>',
        { sticky: true, className: 'bg-slate-900 border border-cyan-500/50 text-white rounded' }
      );
      geofencesGroup.addLayer(fiberLine1);

      // 2. Fiber Route: Sidi Gaber -> Miami
      const fiberLine2 = L.polyline(
        [[31.216, 29.949], [31.235, 29.988]],
        { color: '#06b6d4', weight: 2.5, dashArray: '4, 4', opacity: 0.7 }
      );
      fiberLine2.bindTooltip(
        '<div class="text-right text-xs font-mono" dir="rtl"><strong class="text-cyan-400">مسار ألياف شرق FBR-SG-MIA-02</strong><br/><span class="text-slate-300">SingleMode 24-core (0.48 dB/km)</span></div>',
        { sticky: true, className: 'bg-slate-900 border border-cyan-500/50 text-white rounded' }
      );
      geofencesGroup.addLayer(fiberLine2);

      // 3. Camera FOV Cone (Sidi Gaber Camera 1, 80° FOV)
      const cam1Center = [31.2162, 29.9488];
      const cone1 = L.polygon([
        cam1Center as [number, number],
        [31.2185, 29.9515],
        [31.2192, 29.9495],
        cam1Center as [number, number]
      ], {
        color: '#ef4444',
        weight: 1.5,
        fillColor: '#ef4444',
        fillOpacity: 0.2
      });
      cone1.bindTooltip(
        '<div class="text-right text-xs" dir="rtl"><strong class="text-red-400">مخروط رؤية كاميرا PTZ (FOV 80°)</strong><br/><span class="text-slate-300">تغطية البوابة الرئيسية سيدي جابر</span></div>',
        { sticky: true, className: 'bg-slate-900 border border-red-500/40 text-white rounded' }
      );
      geofencesGroup.addLayer(cone1);
    }
  }, [geofences, layers]);

  // Active Radius Buffer
  const currentBuffer = activeRadiusBuffer || internalBuffer;

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }

    if (currentBuffer) {
      const [lng, lat] = currentBuffer.center;
      const circle = L.circle([lat, lng], {
        radius: currentBuffer.radiusMeters,
        color: '#f59e0b',
        weight: 2.5,
        fillColor: '#f59e0b',
        fillOpacity: 0.15
      }).addTo(map);

      circle.bindTooltip(`
        <div class="text-right text-xs font-sans p-1" dir="rtl">
          <strong class="text-amber-400 block">${currentBuffer.title || currentBuffer.name || 'استعلام نطاق مكاني ST_DWithin'}</strong>
          <span class="text-slate-300 font-mono text-[11px]">${formatDistance(currentBuffer.radiusMeters)}</span>
        </div>
      `, { permanent: true, direction: 'top', className: 'bg-slate-900 border border-amber-500/50 text-white rounded px-2 py-1' });

      radiusCircleRef.current = circle;
      map.flyToBounds(circle.getBounds(), { padding: [50, 50], duration: 1.5 });
    }
  }, [currentBuffer]);

  // Handle selected location pan
  useEffect(() => {
    if (!selectedLocation || !mapInstanceRef.current) return;
    const [lng, lat] = selectedLocation.geom.coordinates;
    mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1 });
  }, [selectedLocation]);

  const handleCityJump = (cityKey: 'alex' | 'cairo' | 'alamein' | 'all') => {
    setActiveCity(cityKey);
    const map = mapInstanceRef.current;
    if (!map) return;

    switch (cityKey) {
      case 'alex':
        map.flyTo([31.216, 29.949], 13, { duration: 1.2 });
        break;
      case 'cairo':
        map.flyTo([30.044, 31.235], 11, { duration: 1.2 });
        break;
      case 'alamein':
        map.flyTo([30.835, 28.948], 12, { duration: 1.2 });
        break;
      case 'all':
        map.flyTo([30.6, 30.5], 8, { duration: 1.4 });
        break;
    }
  };

  const uberfixTicketsCount = locations.filter(l => l.layer === 'uberfix').length;

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 flex flex-col">
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* City Shortcuts */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl">
          <button
            onClick={() => handleCityJump('alex')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeCity === 'alex'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            الإسكندرية (المقر الإقليمي)
          </button>
          <button
            onClick={() => handleCityJump('cairo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeCity === 'cairo'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            القاهرة والجيزة (المقر العام)
          </button>
          <button
            onClick={() => handleCityJump('alamein')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeCity === 'alamein'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            العلمين والساحل
          </button>
          <button
            onClick={() => handleCityJump('all')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeCity === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            مصر
          </button>
        </div>

        {/* Heatmap & Theme Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* 3D BIM Viewer Launch Button */}
          <button
            onClick={() => {
              const targetLoc = selectedLocation || locations.find(l => l.layer === 'projects') || locations[0];
              setBimModalLocation(targetLoc);
              setIsBimModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl border border-blue-400/40 transition-all pointer-events-auto cursor-pointer"
            title="استعراض نموذج BIM ثلاثي الأبعاد تفاعلي للمشروع"
          >
            <Box className="w-3.5 h-3.5 text-amber-300" />
            <span>نموذج 3D BIM</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-amber-300 font-bold hidden sm:inline">
              LOD 350
            </span>
          </button>

          {/* Heatmap Toggle & Config Bar */}
          <div className="relative flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl">
            <button
              onClick={() => setIsHeatmapEnabled(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isHeatmapEnabled
                  ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-slate-950 shadow-md font-bold animate-pulse'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="تفعيل/تعطيل خريطة الكثافة الحرارية لبلاغات UberFix"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>خريطة حرارية (Heatmap)</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-white font-bold">
                {uberfixTicketsCount}
              </span>
            </button>

            {isHeatmapEnabled && (
              <button
                onClick={() => setIsHeatmapConfigOpen(prev => !prev)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isHeatmapConfigOpen ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
                title="إعدادات الخريطة الحرارية"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Heatmap Settings Dropdown Menu */}
            {isHeatmapEnabled && isHeatmapConfigOpen && (
              <div
                className="absolute top-12 left-0 w-72 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-lg space-y-3 text-xs z-[1100]"
                dir="rtl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>تخصيص الخريطة الحرارية</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Leaflet.heat v0.2</span>
                </div>

                {/* Show Markers Checkbox */}
                <label className="flex items-center justify-between cursor-pointer select-none text-slate-300">
                  <span>إظهار نقاط المواقع مع التدرج</span>
                  <input
                    type="checkbox"
                    checked={showMarkersWithHeatmap}
                    onChange={e => setShowMarkersWithHeatmap(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                </label>

                {/* Filter Priority */}
                <div>
                  <span className="block text-slate-400 text-[11px] mb-1">تصفية حسب درجة الخطورة:</span>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setHeatmapPriorityFilter('all')}
                      className={`py-1 text-[11px] rounded font-medium transition-colors ${
                        heatmapPriorityFilter === 'all'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      كافة البلاغات ({uberfixTicketsCount})
                    </button>
                    <button
                      onClick={() => setHeatmapPriorityFilter('high_critical')}
                      className={`py-1 text-[11px] rounded font-medium transition-colors ${
                        heatmapPriorityFilter === 'high_critical'
                          ? 'bg-red-500 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      حرجة وعالية فقط
                    </button>
                  </div>
                </div>

                {/* Radius Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>نصف قطر انتشار الحرارة (Radius)</span>
                    <span className="font-mono text-amber-400">{heatmapRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="2"
                    value={heatmapRadius}
                    onChange={e => setHeatmapRadius(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Blur Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>درجة التلاشي والانسياب (Blur)</span>
                    <span className="font-mono text-amber-400">{heatmapBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="35"
                    step="2"
                    value={heatmapBlur}
                    onChange={e => setHeatmapBlur(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Gradient Legend Strip */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                    <span>منخفضة</span>
                    <span>متوسطة</span>
                    <span>عالية</span>
                    <span>حرجة</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 via-amber-500 via-red-500 to-red-900 border border-slate-700 shadow-inner"></div>
                </div>
              </div>
            )}
          </div>

          {/* Map Base Style Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl">
            <button
              onClick={() => setMapTheme('dark')}
              title="نمط داكن تكتيكي"
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mapTheme === 'dark' ? 'bg-slate-700 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              داكن
            </button>
            <button
              onClick={() => setMapTheme('streets')}
              title="خريطة الشوارع التفصيلية"
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mapTheme === 'streets' ? 'bg-slate-700 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              شوارع
            </button>
            <button
              onClick={() => setMapTheme('satellite')}
              title="صور الأقمار الصناعية"
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mapTheme === 'satellite' ? 'bg-slate-700 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              أقمار
            </button>
            <button
              onClick={() => setMapTheme('light')}
              title="نمط نهارى فاتح"
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mapTheme === 'light' ? 'bg-slate-700 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              فاتح
            </button>
          </div>
        </div>
      </div>

      {/* Adding Location Banner when active */}
      {isAddingLocationMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white animate-bounce text-xs">
          <Crosshair className="w-4 h-4" />
          <span>انقر فوق أي نقطة بالخريطة لتحديد الإحداثيات وإنشاء موقع جديد</span>
        </div>
      )}

      {/* Active Buffer Clear Button */}
      {currentBuffer && (
        <div className="absolute top-16 right-4 z-[1000] bg-slate-900/95 border border-amber-500/60 p-2.5 rounded-xl shadow-xl flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></div>
          <div>
            <div className="text-xs font-bold text-amber-400">{currentBuffer.title || currentBuffer.name || 'دائرة نصف قطر 5 كم'}</div>
            <div className="text-[11px] text-slate-400">نطاق الاستعلام المكاني ST_DWithin</div>
          </div>
          <button
            onClick={() => {
              setInternalBuffer(null);
              if (onClearRadiusBuffer) onClearRadiusBuffer();
            }}
            className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600"
          >
            إلغاء النطاق
          </button>
        </div>
      )}

      {/* The Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Bottom Left Controls: Zoom & Location */}
      <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          aria-label="تكبير الخريطة"
          className="w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 rounded-lg flex items-center justify-center shadow-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          aria-label="تصغير الخريطة"
          className="w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 rounded-lg flex items-center justify-center shadow-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleCityJump('alex')}
          aria-label="إعادة التمركز"
          title="التمركز في سيدي جابر الإسكندرية"
          className="w-9 h-9 bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg flex items-center justify-center shadow-lg transition-colors"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Bottom Right Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-xl hidden md:block">
        <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between gap-4">
          <span>دليل الطبقات المكانية</span>
          {isHeatmapEnabled && (
            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-400" />
              <span>خريطة حرارية نشطة</span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>المشروعات (ERPNext)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>صيانة UberFix</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>الفروع والمقرات</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>الأصول الثقيلة</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>الأسطول الميداني</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>كاميرات المراقبة</span>
          </div>
        </div>

        {/* Heatmap density bar when enabled */}
        {isHeatmapEnabled && (
          <div className="mt-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>كثافة بلاغات الصيانة (UberFix)</span>
              <span className="font-mono text-red-400">Heatmap</span>
            </div>
            <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 via-amber-500 via-red-500 to-red-900 border border-slate-700"></div>
          </div>
        )}
      </div>

      {/* Experimental 3D BIM Viewer Modal */}
      <Bim3DViewerModal
        isOpen={isBimModalOpen}
        onClose={() => setIsBimModalOpen(false)}
        location={bimModalLocation}
        allLocations={locations}
        onSelectAnotherLocation={loc => setBimModalLocation(loc)}
      />
    </div>
  );
};
