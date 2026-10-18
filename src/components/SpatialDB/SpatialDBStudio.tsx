import React, { useState } from 'react';
import { Database, Play, Copy, Check, Sparkles, Terminal, FileCode2, Layers, MapPin, Eye, Search } from 'lucide-react';
import { GeoLocation, PostgisQueryResult } from '../../types/maps';
import { executeMockPostgisQuery } from '../../utils/geoUtils';

interface SpatialDBStudioProps {
  locations: GeoLocation[];
  onHighlightLocations: (ids: string[], buffer?: { center: [number, number]; radiusMeters: number; title: string }) => void;
  onOpenMap: () => void;
}

const PRESET_QUERIES = [
  {
    id: 'radius_5km',
    title_ar: '1. استعلام النطاق 5 كم (ST_DWithin من وثيقة العزب)',
    title_en: '5km Radius ST_DWithin from Sidi Gaber',
    description_ar: 'الاستعلام الفعلي المحدد في البند 5.4 لجلب المواقع في نطاق 5000م حول نقطة سيدي جابر [29.949, 31.184]',
    sql: `-- الاستعلام الجغرافي الفعلي من المخطط التنفيذي (البند 5.4)
SELECT
    id,
    code,
    name,
    layer_id,
    ST_AsGeoJSON(geom)::jsonb AS geometry,
    ROUND(ST_Distance(
        geom::geography,
        ST_SetSRID(ST_MakePoint(29.949, 31.184), 4326)::geography
    )::numeric, 2) AS distance_meters
FROM az_maps.geo_locations
WHERE workspace_id = 'ws-alazab-eg-01'
  AND ST_DWithin(
      geom::geography,
      ST_SetSRID(
          ST_MakePoint(29.949, 31.184),
          4326
      )::geography,
      5000
  )
ORDER BY
    ST_Distance(
        geom::geography,
        ST_SetSRID(
            ST_MakePoint(29.949, 31.184),
            4326
        )::geography
    );`,
    params: { centerLon: 29.949, centerLat: 31.184, radiusMeters: 5000 }
  },
  {
    id: 'bbox_alex',
    title_ar: '2. استعلام النطاق المحيط BBOX للإسكندرية الكبرى',
    title_en: 'Alexandria Bounding Box ST_MakeEnvelope',
    description_ar: 'استخراج كافة المشروعات والأصول الواقعة داخل حدود BBOX الإسكندرية',
    sql: `SELECT
    id,
    code,
    name,
    status,
    geom
FROM az_maps.geo_locations
WHERE workspace_id = 'ws-alazab-eg-01'
  AND geom && ST_MakeEnvelope(29.85, 31.10, 30.05, 31.30, 4326)
ORDER BY created_at DESC;`,
    params: { minLon: 29.85, maxLon: 30.05, minLat: 31.10, maxLat: 31.30 }
  },
  {
    id: 'uberfix_tickets',
    title_ar: '3. استعلام طلبات صيانة UberFix الحرجة والمسافات',
    title_en: 'UberFix Active Tickets with Priority Sorting',
    description_ar: 'فلترة طلبات الصيانة المفتوحة والحرجة لحساب أقرب فرق الدعم الفني',
    sql: `SELECT
    l.id,
    l.code,
    l.name,
    l.status,
    e.external_id AS uberfix_ticket_id,
    l.metadata->>'priority' AS priority,
    l.metadata->>'assigned_technician' AS technician
FROM az_maps.geo_locations l
JOIN az_maps.geo_entity_links e ON l.id = e.location_id
WHERE e.source_system = 'uberfix'
  AND l.status IN ('pending', 'in_progress')
ORDER BY l.created_at DESC;`,
    params: {}
  },
  {
    id: 'layer_counts',
    title_ar: '4. إحصائيات الطبقات وفهارس GiST المكانية',
    title_en: 'Layer Feature Statistics & Spatial Indexes',
    description_ar: 'حساب عدد العناصر بكل طبقة وحالة الفهارس المكانية النشطة',
    sql: `SELECT
    l.name AS layer_name,
    l.layer_type,
    l.visibility,
    COUNT(f.id) AS feature_count,
    pg_size_pretty(pg_relation_size('az_maps.geo_locations_geom_gix')) AS gist_index_size
FROM az_maps.geo_layers l
LEFT JOIN az_maps.geo_features f ON l.id = f.layer_id
GROUP BY l.id, l.name, l.layer_type, l.visibility;`,
    params: {}
  }
];

const DDL_MIGRATION_SQL = `-- Alazab Maps Enterprise Schema (PostgreSQL + PostGIS)
-- Defined according to Section 5.3 of Executive Blueprint

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS az_maps;

-- 1. Locations Table
CREATE TABLE az_maps.geo_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    code TEXT,
    name TEXT NOT NULL,
    address TEXT,
    geom GEOMETRY(Point, 4326) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (workspace_id, code)
);

CREATE INDEX geo_locations_geom_gix
    ON az_maps.geo_locations USING GIST (geom);

CREATE INDEX geo_locations_geog_gix
    ON az_maps.geo_locations USING GIST ((geom::geography));

CREATE INDEX geo_locations_workspace_idx
    ON az_maps.geo_locations (workspace_id);

-- 2. Layers Table
CREATE TABLE az_maps.geo_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name TEXT NOT NULL,
    layer_type TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'private',
    style_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Features Table
CREATE TABLE az_maps.geo_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    layer_id UUID NOT NULL
        REFERENCES az_maps.geo_layers(id),
    geom GEOMETRY(Geometry, 4326) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    revision INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX geo_features_geom_gix
    ON az_maps.geo_features USING GIST (geom);

CREATE INDEX geo_features_workspace_layer_idx
    ON az_maps.geo_features (workspace_id, layer_id);

-- 4. Entity Links Table (ERPNext, UberFix, Daftra, Hikvision)
CREATE TABLE az_maps.geo_entity_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    location_id UUID NOT NULL
        REFERENCES az_maps.geo_locations(id),
    source_system TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    external_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (
        workspace_id,
        source_system,
        entity_type,
        external_id
    )
);

-- 5. Geofences Table
CREATE TABLE az_maps.geo_geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name TEXT NOT NULL,
    boundary GEOMETRY(Polygon, 4326),
    rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Audit Events
CREATE TABLE az_maps.geo_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

export const SpatialDBStudio: React.FC<SpatialDBStudioProps> = ({
  locations,
  onHighlightLocations,
  onOpenMap
}) => {
  const [activeTab, setActiveTab] = useState<'query' | 'ddl' | 'tables'>('query');
  const [selectedPreset, setSelectedPreset] = useState(PRESET_QUERIES[0]);
  const [customSql, setCustomSql] = useState(PRESET_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<PostgisQueryResult | null>(() =>
    executeMockPostgisQuery(PRESET_QUERIES[0].sql, locations, PRESET_QUERIES[0].params)
  );
  const [copied, setCopied] = useState(false);

  const handleRunQuery = () => {
    const result = executeMockPostgisQuery(customSql, locations, selectedPreset.params);
    setQueryResult(result);
  };

  const handleSelectPreset = (preset: typeof PRESET_QUERIES[0]) => {
    setSelectedPreset(preset);
    setCustomSql(preset.sql);
    const result = executeMockPostgisQuery(preset.sql, locations, preset.params);
    setQueryResult(result);
  };

  const handleCopySql = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShowOnMap = () => {
    if (!queryResult || queryResult.rows.length === 0) return;
    const rawIds = queryResult.rows.map(r => r.rawLocation?.id).filter(Boolean);

    // If radius 5km query, pass the buffer circle too
    if (selectedPreset.id === 'radius_5km') {
      onHighlightLocations(rawIds, {
        center: [29.949, 31.184],
        radiusMeters: 5000,
        title: 'نتائج استعلام ST_DWithin (نطاق 5000 م حول سيدي جابر)'
      });
    } else {
      onHighlightLocations(rawIds);
    }

    onOpenMap();
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden" dir="rtl">
      {/* Studio Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">استوديو قواعد البيانات الجغرافية PostGIS</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PostGIS 3.4.1 Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              المخطط المعتمد <code className="text-amber-300 font-mono">az_maps</code> وفهارس GiST المكانية ودوال <code className="text-amber-300 font-mono">ST_DWithin</code>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('query')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'query' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            محرر الاستعلامات المكانية
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'tables' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            جداول az_maps (9 جداول)
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'ddl' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            كود الـ Migration التأسيسي (DDL)
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      {activeTab === 'query' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Query Sidebar (Presets) */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l border-slate-800 bg-slate-900/30 p-4 overflow-y-auto shrink-0 flex flex-col gap-3">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>استعلامات جاهزة للتنفيذ</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="space-y-2">
              {PRESET_QUERIES.map(preset => {
                const isSelected = selectedPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-right p-3 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-amber-400 mb-1 leading-snug">{preset.title_ar}</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{preset.description_ar}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>نظام الإسناد الجغرافي:</span>
                <span className="font-mono text-slate-300">EPSG:4326 (WGS 84)</span>
              </div>
              <div className="flex justify-between">
                <span>فهارس الهندسة:</span>
                <span className="font-mono text-emerald-400">GIST (geom::geography)</span>
              </div>
              <div className="flex justify-between">
                <span>توليد المعرفات:</span>
                <span className="font-mono text-slate-300">gen_random_uuid()</span>
              </div>
            </div>
          </div>

          {/* Query Editor & Result Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* SQL Editor Area */}
            <div className="h-48 lg:h-56 border-b border-slate-800 bg-slate-950 flex flex-col">
              <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>psql -d alazab_gis -U postgres</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySql(customSql)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ الاستعلام'}</span>
                  </button>
                  <button
                    onClick={handleRunQuery}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded shadow-md transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>تنفيذ (Run SQL)</span>
                  </button>
                </div>
              </div>
              <textarea
                value={customSql}
                onChange={e => setCustomSql(e.target.value)}
                className="w-full flex-1 p-4 bg-transparent font-mono text-xs text-amber-200/90 focus:outline-none resize-none leading-relaxed selection:bg-amber-500/30"
                spellCheck={false}
              />
            </div>

            {/* Results Table Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/20">
              {/* Results Stats Bar */}
              <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-300">
                  <span>النتائج المسترجعة: <strong className="text-white font-mono tabular-nums">{queryResult?.rowCount || 0}</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>زمن التنفيذ: <strong className="text-emerald-400 font-mono tabular-nums">{queryResult?.executionTimeMs || 0} ms</strong></span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">خادم PostGIS محلي مفهرس</span>
                </div>

                {queryResult && queryResult.rows.length > 0 && (
                  <button
                    onClick={handleShowOnMap}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>إظهار النتائج على الخريطة التفاعلية</span>
                  </button>
                )}
              </div>

              {/* Table Data */}
              <div className="flex-1 overflow-auto p-4">
                {queryResult && queryResult.rows.length > 0 ? (
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">#</th>
                          {queryResult.columns.map(col => (
                            <th key={col} className="py-2.5 px-3 font-semibold font-mono">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {queryResult.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                            <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                            {queryResult.columns.map(col => (
                              <td key={col} className="py-2 px-3 text-slate-200 tabular-nums">
                                {col === 'source_system' ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 uppercase">
                                    {String(row[col])}
                                  </span>
                                ) : col === 'status' ? (
                                  <span className="text-emerald-400 font-sans font-medium">{String(row[col])}</span>
                                ) : col === 'name' ? (
                                  <span className="font-sans font-bold text-white">{String(row[col])}</span>
                                ) : (
                                  String(row[col] ?? '')
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                    <Search className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-sm">لا توجد نتائج مطابقة لشروط الاستعلام</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tables Architecture View */}
      {activeTab === 'tables' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="text-xs text-slate-400 mb-2">
            الجداول التسعة المعتمدة لمنصة الخرائط المركزية مع تفويض Workspaces وحقول الهندسة المكانية (Section 5.2):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'az_maps.geo_locations',
                desc: 'المواقع الأساسية، الإحداثيات، العناوين، وحالة التشغيل',
                fields: ['id (UUID)', 'workspace_id', 'code (UNIQUE)', 'name', 'address', 'geom (Point, 4326)', 'status', 'metadata (JSONB)']
              },
              {
                name: 'az_maps.geo_layers',
                desc: 'تصنيف الطبقات وإدارتها ونمط العرض المصرح به',
                fields: ['id (UUID)', 'workspace_id', 'name', 'layer_type', 'visibility', 'style_id', 'created_at']
              },
              {
                name: 'az_maps.geo_features',
                desc: 'العناصر الهندسية المتقدمة (نقاط، مسارات، مضلعات)',
                fields: ['id (UUID)', 'workspace_id', 'layer_id (FK)', 'geom (Geometry, 4326)', 'properties (JSONB)', 'revision']
              },
              {
                name: 'az_maps.geo_entity_links',
                desc: 'ربط المعرفات الخارجية (ERPNext / UberFix / Daftra) بدون تكرار',
                fields: ['id (UUID)', 'workspace_id', 'location_id (FK)', 'source_system', 'entity_type', 'external_id (UNIQUE)']
              },
              {
                name: 'az_maps.geo_geofences',
                desc: 'نطاقات الخدمة والبافر الجغرافي وقواعد زمن الاستجابة',
                fields: ['id (UUID)', 'workspace_id', 'name', 'boundary (Polygon)', 'rules (JSONB)']
              },
              {
                name: 'az_maps.geo_styles',
                desc: 'أنماط MapLibre / MapTiler وهوية العزب البصرية',
                fields: ['id (UUID)', 'workspace_id', 'style_key', 'style_json (JSONB)', 'version']
              },
              {
                name: 'az_maps.geo_source_events',
                desc: 'أحداث الـ Webhooks لضمان مبدأ الـ Idempotency وعدم التكرار',
                fields: ['id (UUID)', 'source_system', 'event_id', 'payload (JSONB)', 'processed_at']
              },
              {
                name: 'az_maps.geo_audit_events',
                desc: 'سجل التدقيق الأمني لعمليات الإنشاء والتعديل والحذف',
                fields: ['id (UUID)', 'actor_id', 'action', 'resource_type', 'resource_id', 'created_at']
              },
              {
                name: 'az_maps.geo_workspaces',
                desc: 'الملكية ونطاق عزل البيانات المؤسسية المتعددة',
                fields: ['id (UUID)', 'organization_id', 'name', 'status', 'created_at']
              }
            ].map((tbl, i) => (
              <div key={i} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-xs font-bold text-amber-400">{tbl.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">PostGIS</span>
                </div>
                <p className="text-xs text-slate-300">{tbl.desc}</p>
                <div className="pt-2">
                  <div className="text-[10px] text-slate-400 mb-1 font-semibold">الحقول الرئيسية:</div>
                  <div className="flex flex-wrap gap-1">
                    {tbl.fields.map((f, fi) => (
                      <span key={fi} className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DDL Migration Code View */}
      {activeTab === 'ddl' && (
        <div className="flex-1 p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">ملف تهيئة قاعدة البيانات والتوسيعات المكانية</h3>
              <p className="text-xs text-slate-400">migration_001_az_maps_schema.sql (مطابق للبند 5.3 في وثيقة القرار المعماري)</p>
            </div>
            <button
              onClick={() => handleCopySql(DDL_MIGRATION_SQL)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ إلى الحافظة' : 'نسخ ملف SQL كامل'}</span>
            </button>
          </div>
          <pre className="flex-1 p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-auto font-mono text-xs text-slate-300 leading-relaxed">
            {DDL_MIGRATION_SQL}
          </pre>
        </div>
      )}
    </div>
  );
};
