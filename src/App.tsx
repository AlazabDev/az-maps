import React, { useState } from 'react';
import {
  MapPin,
  Database,
  Globe,
  Cpu,
  BookOpen,
  Plus,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Radio,
  ExternalLink,
  ChevronDown,
  Building2,
  Wrench,
  Landmark,
  Truck,
  Video,
  Download,
  Upload,
  AlertTriangle,
  Compass,
  Bot,
  Flame
} from 'lucide-react';
import { GeoLocation, GeoLayer, GeoFence, LayerType, SourceSystem } from './types/maps';
import { INITIAL_LOCATIONS, INITIAL_LAYERS, INITIAL_GEOFENCES } from './data/mockData';
import { MapView } from './components/Map/MapView';
import { SpatialDBStudio } from './components/SpatialDB/SpatialDBStudio';
import { APIExplorer } from './components/APIExplorer/APIExplorer';
import { IntegrationsHub } from './components/Integrations/IntegrationsHub';
import { ImportExportCenter } from './components/ImportExport/ImportExportCenter';
import { ExecutiveBlueprint } from './components/Blueprint/ExecutiveBlueprint';
import { NewLocationModal } from './components/Modals/NewLocationModal';
import { GeospatialAssistant } from './components/AI/GeospatialAssistant';
import { EnterpriseDomainsHub } from './components/Domains/EnterpriseDomainsHub';
import { formatDistance, calculateHaversineDistanceMeters } from './utils/geoUtils';

type ActiveView = 'map' | 'domains' | 'db' | 'api' | 'integrations' | 'import_export' | 'blueprint';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('map');
  const [locations, setLocations] = useState<GeoLocation[]>(INITIAL_LOCATIONS);
  const [layers, setLayers] = useState<GeoLayer[]>(INITIAL_LAYERS);
  const [geofences, setGeofences] = useState<GeoFence[]>(INITIAL_GEOFENCES);

  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(INITIAL_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [activeRadiusBuffer, setActiveRadiusBuffer] = useState<{
    center: [number, number];
    radiusMeters: number;
    name?: string;
  } | null>(null);

  // New Location Modal & Map Click
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);
  const [isAddingLocationMode, setIsAddingLocationMode] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Handle Layer Toggle
  const handleToggleLayer = (key: LayerType) => {
    setLayers(prev =>
      prev.map(l => (l.key === key ? { ...l, enabled: !l.enabled } : l))
    );
  };

  // Filter locations for sidebar
  const filteredLocations = locations.filter(loc => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource =
      selectedSourceFilter === 'all' || loc.source.system === selectedSourceFilter;

    const layerEnabled = layers.find(l => l.key === loc.layer)?.enabled ?? true;

    return matchesSearch && matchesSource && layerEnabled;
  });

  const handleMapClick = (coords: [number, number]) => {
    if (isAddingLocationMode) {
      setClickedCoords(coords);
      setIsAddModalOpen(true);
      setIsAddingLocationMode(false);
    }
  };

  const handleLocationCreated = (newLoc: GeoLocation) => {
    setLocations(prev => [newLoc, ...prev]);
    setSelectedLocation(newLoc);
    // Update layer count
    setLayers(prev =>
      prev.map(l => (l.key === newLoc.layer ? { ...l, feature_count: l.feature_count + 1 } : l))
    );
  };

  const handleLocationsImported = (imported: GeoLocation[]) => {
    setLocations(prev => [...imported, ...prev]);
  };

  const handleSpatialHighlight = (
    ids: string[],
    buffer?: { center: [number, number]; radiusMeters: number; title: string }
  ) => {
    setHighlightedIds(ids);
    if (buffer) {
      setActiveRadiusBuffer(buffer);
    }
  };

  // Quick Stats
  const projectsCount = locations.filter(l => l.layer === 'projects').length;
  const uberfixCount = locations.filter(l => l.layer === 'uberfix' && l.status !== 'inactive').length;
  const branchesCount = locations.filter(l => l.layer === 'branches').length;

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans" dir="rtl">
      {/* 1. Header (Adhering to Top Bar Contract: Brand - Nav Links - 1 Primary Action) */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between gap-6 shrink-0 z-50">
        {/* Brand Zone (Single element wordmark) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
            AZ
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              Alazab Maps
            </span>
            <span className="text-xs text-amber-400 font-mono hidden sm:inline">az-maps</span>
          </div>
        </div>

        {/* Navigation Zone (Clean single-line links) */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { key: 'map', label: 'الخريطة التفاعلية (Map)', icon: MapPin },
            { key: 'domains', label: 'القطاعات السبعة (7 Domains)', icon: Layers },
            { key: 'db', label: 'استوديو PostGIS', icon: Database },
            { key: 'api', label: 'واجهات API v1', icon: Globe },
            { key: 'integrations', label: 'التكامل و AZ MCP', icon: Cpu },
            { key: 'import_export', label: 'استيراد وتصدير', icon: Upload },
            { key: 'blueprint', label: 'المخطط المعماري', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key as ActiveView)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Primary Action Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile view dropdown selector */}
          <div className="lg:hidden">
            <select
              value={activeView}
              onChange={e => setActiveView(e.target.value as ActiveView)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5"
            >
              <option value="map">الخريطة التفاعلية</option>
              <option value="domains">القطاعات السبعة (7 Domains)</option>
              <option value="db">قاعدة PostGIS</option>
              <option value="api">واجهات API v1</option>
              <option value="integrations">التكامل المؤسسي وMCP</option>
              <option value="import_export">استيراد وتصدير</option>
              <option value="blueprint">المخطط المعماري</option>
            </select>
          </div>

          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-md transition-all whitespace-nowrap"
            title="فتح المساعد الجغرافي الذكي (Google Maps Grounding)"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>المساعد الذكي (AI)</span>
          </button>

          <button
            onClick={() => {
              if (activeView !== 'map') setActiveView('map');
              setIsAddingLocationMode(prev => !prev);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-md transition-all whitespace-nowrap ${
              isAddingLocationMode
                ? 'bg-red-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isAddingLocationMode ? 'إلغاء وضع التحديد' : 'إضافة موقع (geo_locations)'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Viewport */}
      <main className="flex-1 overflow-hidden relative">
        {activeView === 'map' && (
          <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
            {/* Interactive Sidebar for Map */}
            <aside className="w-full md:w-88 lg:w-96 border-b md:border-b-0 md:border-l border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-col overflow-hidden shrink-0 z-10">
              {/* Quick KPI Strip */}
              <div className="grid grid-cols-3 border-b border-slate-800/80 bg-slate-900/60 p-2.5 text-center text-xs divide-x divide-slate-800 divide-x-reverse">
                <div>
                  <span className="text-[10px] text-slate-400 block">المشروعات</span>
                  <strong className="text-blue-400 font-mono text-sm tabular-nums">{projectsCount}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">صيانة UberFix</span>
                  <strong className="text-amber-400 font-mono text-sm tabular-nums">{uberfixCount}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">الفروع والمقرات</span>
                  <strong className="text-emerald-400 font-mono text-sm tabular-nums">{branchesCount}</strong>
                </div>
              </div>

              {/* Search & Source Filter Bar */}
              <div className="p-3 border-b border-slate-800 bg-slate-900/40 space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="بحث بالاسم أو الكود (سيدي جابر، العلمين)..."
                    className="w-full pl-3 pr-8 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>

                <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-0.5">
                  <span className="text-slate-400 whitespace-nowrap">المصدر:</span>
                  {[
                    { key: 'all', label: 'الكل' },
                    { key: 'erpnext', label: 'ERPNext' },
                    { key: 'uberfix', label: 'UberFix' },
                    { key: 'daftra', label: 'Daftra' },
                    { key: 'hikvision', label: 'Hikvision' }
                  ].map(src => (
                    <button
                      key={src.key}
                      onClick={() => setSelectedSourceFilter(src.key)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors whitespace-nowrap ${
                        selectedSourceFilter === src.key
                          ? 'bg-slate-700 text-amber-300 font-bold border border-slate-600'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer Manager Toggles */}
              <div className="p-3 border-b border-slate-800 bg-slate-900/20">
                <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-between">
                  <span>إدارة الطبقات المكانية (Layers)</span>
                  <span className="text-[10px] text-slate-500 font-mono">{layers.length} طبقات</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {layers.map(layer => (
                    <label
                      key={layer.id}
                      className={`flex items-center justify-between p-1.5 rounded-lg border cursor-pointer select-none transition-all ${
                        layer.enabled
                          ? 'bg-slate-800/80 border-slate-700 text-white'
                          : 'bg-slate-900/30 border-slate-850 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: layer.color }}
                        />
                        <span className="text-[11px] truncate font-medium">{layer.name_en}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={layer.enabled}
                        onChange={() => handleToggleLayer(layer.key)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 mr-1"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* 7 Domains Quick Shortcut Banner */}
              <div className="p-2.5 mx-2.5 mt-2 bg-gradient-to-r from-blue-950/70 via-purple-950/60 to-slate-900 border border-slate-700/80 rounded-xl flex items-center justify-between shadow-sm">
                <div className="min-w-0 pr-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>القطاعات التشغيلية السبعة</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    BIM · Facilities · CCTV · Supply · Smart Light · Azlexa · MES
                  </div>
                </div>
                <button
                  onClick={() => setActiveView('domains')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow transition-colors shrink-0 whitespace-nowrap"
                >
                  استعراض
                </button>
              </div>

              {/* Locations Scrollable Feed */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                  <span>المواقع النشطة ({filteredLocations.length})</span>
                  <span className="text-[10px] text-slate-500">انقر للعرض والتمركز</span>
                </div>

                {filteredLocations.map(loc => {
                  const isSelected = selectedLocation?.id === loc.id;
                  const isHighlighted = highlightedIds.includes(loc.id);

                  return (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-slate-800 border border-amber-500/80 shadow-md'
                          : isHighlighted
                          ? 'bg-cyan-950/40 border border-cyan-500/50'
                          : 'bg-slate-900/40 border border-slate-850 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800 font-bold">
                          {loc.code}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase text-slate-400">
                            {loc.source.system}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </div>
                      </div>

                      <h4 className="font-bold text-white text-xs mb-1 leading-snug">{loc.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate mb-1">{loc.address}</p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/50">
                        <span className="font-mono tabular-nums">
                          {loc.geom.coordinates[0].toFixed(3)}, {loc.geom.coordinates[1].toFixed(3)}
                        </span>
                        {loc.metadata.completion_percentage !== undefined && (
                          <span className="text-emerald-400 font-bold">
                            إنجاز {loc.metadata.completion_percentage}%
                          </span>
                        )}
                        {loc.metadata.priority && (
                          <span className="text-amber-400 font-bold uppercase">
                            أولوية: {loc.metadata.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Interactive Map Canvas */}
            <div className="flex-1 h-full relative">
              <MapView
                locations={locations}
                layers={layers}
                geofences={geofences}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                onMapClickCoordinates={handleMapClick}
                isAddingLocationMode={isAddingLocationMode}
                highlightedIds={highlightedIds}
                activeRadiusBuffer={activeRadiusBuffer}
                onClearRadiusBuffer={() => setActiveRadiusBuffer(null)}
              />
            </div>
          </div>
        )}

        {activeView === 'domains' && (
          <EnterpriseDomainsHub
            onOpenMapAtLocation={(coords, zoomLevel) => {
              setActiveView('map');
              // Pan to coordinates
              const target = locations.find(l =>
                Math.abs(l.geom.coordinates[0] - coords[0]) < 0.001 &&
                Math.abs(l.geom.coordinates[1] - coords[1]) < 0.001
              );
              if (target) {
                setSelectedLocation(target);
              } else {
                setSelectedLocation({
                  id: 'temp-domain-loc',
                  workspace_id: 'ws-alazab-eg-01',
                  code: 'DOM-FOC',
                  name: 'موقع القطاع التشغيلي',
                  address: 'الموقع الجغرافي للقطاع',
                  city: 'الإسكندرية',
                  geom: { type: 'Point', coordinates: coords },
                  status: 'active',
                  layer: 'projects',
                  metadata: {},
                  source: { system: 'central_id', entity_type: 'domain', external_id: 'DOM-01', last_synced_at: new Date().toISOString() },
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
            }}
          />
        )}

        {activeView === 'db' && (
          <SpatialDBStudio
            locations={locations}
            onHighlightLocations={handleSpatialHighlight}
            onOpenMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'api' && (
          <APIExplorer
            locations={locations}
            onLocationCreated={handleLocationCreated}
          />
        )}

        {activeView === 'integrations' && (
          <IntegrationsHub locations={locations} />
        )}

        {activeView === 'import_export' && (
          <ImportExportCenter
            locations={locations}
            onLocationsImported={handleLocationsImported}
            onOpenMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'blueprint' && (
          <ExecutiveBlueprint />
        )}
      </main>

      {/* New Location Modal */}
      <NewLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleLocationCreated}
        initialCoords={clickedCoords}
      />

      {/* Gemini AI Geospatial Assistant with Google Maps Grounding */}
      <GeospatialAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        locations={locations}
        onFocusLocation={loc => {
          setSelectedLocation(loc);
          setActiveView('map');
          setIsAiAssistantOpen(false);
        }}
      />
    </div>
  );
}
