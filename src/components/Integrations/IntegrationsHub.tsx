import React, { useState } from 'react';
import { SyncEvent, McpToolDefinition, GeoLocation } from '../../types/maps';
import { INITIAL_SYNC_EVENTS, MCP_TOOLS } from '../../data/mockData';
import { Cpu, RefreshCw, Bot, CheckCircle2, ArrowRightLeft, Radio, Server, ShieldCheck, Play, Terminal } from 'lucide-react';
import { calculateHaversineDistanceMeters, formatDistance } from '../../utils/geoUtils';

interface IntegrationsHubProps {
  locations: GeoLocation[];
  onAddEvent?: (evt: SyncEvent) => void;
}

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({ locations }) => {
  const [activeTab, setActiveTab] = useState<'mcp' | 'sync' | 'adapters'>('mcp');
  const [selectedMcpTool, setSelectedMcpTool] = useState<McpToolDefinition>(MCP_TOOLS[0]);
  const [toolArgsJson, setToolArgsJson] = useState<string>(
    JSON.stringify(MCP_TOOLS[0].sampleArgs, null, 2)
  );
  const [toolExecutionOutput, setToolExecutionOutput] = useState<any>(null);
  const [isExecutingTool, setIsExecutingTool] = useState(false);

  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>(INITIAL_SYNC_EVENTS);
  const [simulatedSource, setSimulatedSource] = useState<'erpnext' | 'uberfix' | 'daftra'>('erpnext');

  // Handle MCP Tool Invocation
  const handleSelectTool = (tool: McpToolDefinition) => {
    setSelectedMcpTool(tool);
    setToolArgsJson(JSON.stringify(tool.sampleArgs, null, 2));
    setToolExecutionOutput(null);
  };

  const handleRunMcpTool = () => {
    setIsExecutingTool(true);

    setTimeout(() => {
      let args: any = {};
      try {
        args = JSON.parse(toolArgsJson);
      } catch {
        args = selectedMcpTool.sampleArgs;
      }

      let result: any = {};

      switch (selectedMcpTool.name) {
        case 'maps_search_locations': {
          const q = (args.query || '').toLowerCase();
          const matched = locations.filter(l =>
            l.name.toLowerCase().includes(q) ||
            l.code.toLowerCase().includes(q) ||
            l.address.toLowerCase().includes(q)
          );
          result = {
            success: true,
            total_matches: matched.length,
            locations: matched.map(m => ({
              id: m.id,
              code: m.code,
              name: m.name,
              city: m.city,
              coordinates: m.geom.coordinates,
              layer: m.layer
            }))
          };
          break;
        }
        case 'maps_get_location': {
          const loc = locations.find(l => l.id === args.id || l.code === args.id) || locations[0];
          result = {
            success: true,
            location: loc
          };
          break;
        }
        case 'maps_find_nearby': {
          const lon = args.longitude || 29.949;
          const lat = args.latitude || 31.216;
          const radius = args.radius_meters || 5000;
          const nearby = locations
            .map(l => ({
              location: l,
              distance_meters: Math.round(calculateHaversineDistanceMeters(l.geom.coordinates, [lon, lat]))
            }))
            .filter(item => item.distance_meters <= radius)
            .sort((a, b) => a.distance_meters - b.distance_meters);

          result = {
            success: true,
            center_point: [lon, lat],
            radius_meters: radius,
            found_count: nearby.length,
            results: nearby.map(n => ({
              id: n.location.id,
              name: n.location.name,
              code: n.location.code,
              layer: n.location.layer,
              distance_human: formatDistance(n.distance_meters),
              distance_meters: n.distance_meters
            }))
          };
          break;
        }
        case 'maps_get_project_map': {
          const prj = locations.find(l => l.layer === 'projects') || locations[0];
          result = {
            success: true,
            project_code: args.project_code || 'PRJ-2026-ALM-09',
            project_name: prj.name,
            geometry: prj.geom,
            linked_work_order: 'AZ-PROJ-2026-0028',
            surrounding_assets: 3,
            nearest_emergency_branch: 'المكتب الفني سموحة (1.4 كم)'
          };
          break;
        }
        case 'maps_calculate_route': {
          result = {
            success: true,
            origin: [args.origin_lon || 29.932, args.origin_lat || 31.219],
            destination: [args.dest_lon || 29.949, args.dest_lat || 31.216],
            distance_km: 2.85,
            duration_minutes: 8.5,
            route_summary: 'عبر طريق الكورنيش وميدان سيدي جابر المحطة',
            eta: new Date(Date.now() + 8.5 * 60000).toISOString()
          };
          break;
        }
        case 'maps_list_layers': {
          result = {
            success: true,
            layers: [
              { key: 'projects', title: 'المشروعات الهندسية', count: 6 },
              { key: 'uberfix', title: 'صيانة ومواقع UberFix', count: 5 },
              { key: 'branches', title: 'فروع ومقرات العزب', count: 4 },
              { key: 'assets', title: 'المعدات والأصول الثقيلة', count: 3 },
              { key: 'fleet', title: 'أسطول التشغيل الميداني', count: 3 }
            ]
          };
          break;
        }
        case 'maps_get_geo_summary': {
          const city = args.city || 'الإسكندرية';
          const inCity = locations.filter(l => l.city === city || l.address.includes(city));
          result = {
            success: true,
            target_city: city,
            total_active_sites: inCity.length,
            projects_in_progress: inCity.filter(l => l.layer === 'projects').length,
            open_uberfix_tickets: inCity.filter(l => l.layer === 'uberfix' && l.status !== 'inactive').length,
            quick_response_coverage: '100% مغطاة ضمن نطاق الـ 5 كم لسيدي جابر وسموحة'
          };
          break;
        }
        default:
          result = { success: true, message: 'Executed' };
      }

      setToolExecutionOutput(result);
      setIsExecutingTool(false);
    }, 150);
  };

  // Simulate Webhook Reception
  const handleSimulateWebhook = () => {
    let newEvt: SyncEvent;
    if (simulatedSource === 'erpnext') {
      newEvt = {
        id: `evt-erp-${Date.now()}`,
        source_system: 'erpnext',
        event_type: 'project_updated',
        entity_type: 'Project',
        external_id: 'PRJ-2026-ALM-09',
        payload: {
          project_name: 'أبراج العلمين الجديدة',
          completion: Math.min(100, Math.floor(Math.random() * 20) + 70),
          status: 'In Progress'
        },
        status: 'processed',
        timestamp: new Date().toISOString(),
        message: 'تم استقبال وتحديث إحداثيات ونسبة إنجاز المشروع بنجاح'
      };
    } else if (simulatedSource === 'uberfix') {
      newEvt = {
        id: `evt-uf-${Date.now()}`,
        source_system: 'uberfix',
        event_type: 'technician_dispatched',
        entity_type: 'ticket',
        external_id: 'UBERFIX-TKT-4029',
        payload: {
          ticket: 'تسريب مياه وحدة التكييف المركزي',
          technician: 'م. كريم الشناوي',
          status: 'En Route (في الطريق)'
        },
        status: 'processed',
        timestamp: new Date().toISOString(),
        message: 'تم توجيه الفني إلى موقع سيدي جابر وحساب المسار المباشر'
      };
    } else {
      newEvt = {
        id: `evt-daf-${Date.now()}`,
        source_system: 'daftra',
        event_type: 'work_order_approved',
        entity_type: 'work_order',
        external_id: 'AZ-PROJ-2026-0028',
        payload: {
          client: 'أبو عوف مصر',
          branch: 'سيدي جابر',
          budget_egp: 1450000
        },
        status: 'processed',
        timestamp: new Date().toISOString(),
        message: 'تم ربط أمر التشغيل بموقع geo_locations برقم AZ-AUF-SG'
      };
    }

    setSyncEvents(prev => [newEvt, ...prev]);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden" dir="rtl">
      {/* Integrations Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">مركز التكامل المؤسسي وبروتوكول الوكلاء AZ MCP</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                mcp.alazab.com/maps
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تكامل مباشر مع ERPNext و UberFix و Daftra وأدوات الخرائط الموجهة لوكلاء الذكاء الاصطناعي (AZ Foundry / Codex)
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('mcp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'mcp' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            أدوات الوكلاء (AZ MCP Tools)
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'sync' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            سجل أحداث المزامنة (Sync Events)
          </button>
          <button
            onClick={() => setActiveTab('adapters')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'adapters' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            المحولات المعمارية (Adapters)
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      {activeTab === 'mcp' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* MCP Tools Catalog */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l border-slate-800 bg-slate-900/20 p-4 overflow-y-auto shrink-0 space-y-2">
            <div className="text-xs font-bold text-slate-400 mb-2 flex items-center justify-between">
              <span>أدوات خرائط العزب المتاحة للوكلاء (7 أدوات)</span>
              <Bot className="w-4 h-4 text-amber-400" />
            </div>

            {MCP_TOOLS.map((tool, idx) => {
              const isSelected = selectedMcpTool.name === tool.name;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-right p-3 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500 text-white shadow-md'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-amber-400 font-bold">{tool.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400 uppercase">
                      {tool.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{tool.description_ar}</div>
                </button>
              );
            })}
          </div>

          {/* MCP Playground & Runner */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* Tool Header & Action */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-amber-400">{selectedMcpTool.name}</span>
                  <span className="text-xs text-slate-400 font-sans">({selectedMcpTool.description_en})</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{selectedMcpTool.description_ar}</p>
              </div>

              <button
                onClick={handleRunMcpTool}
                disabled={isExecutingTool}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecutingTool ? 'جاري الاستدعاء...' : 'تشغيل الأداة (Invoke Tool)'}</span>
              </button>
            </div>

            {/* Split: Args & Output */}
            <div className="flex-1 grid grid-rows-2 overflow-hidden">
              {/* Arguments Editor */}
              <div className="border-b border-slate-800 flex flex-col bg-slate-900/10 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">مدخلات الأداة (JSON Arguments)</span>
                  <span className="text-[11px] text-slate-500 font-mono">Agent Tool Call Payload</span>
                </div>
                <textarea
                  value={toolArgsJson}
                  onChange={e => setToolArgsJson(e.target.value)}
                  className="w-full flex-1 p-4 bg-transparent font-mono text-xs text-slate-300 focus:outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Output Viewer */}
              <div className="flex flex-col bg-slate-950 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">مخرجات استدعاء الأداة (Tool Result)</span>
                  <span className="text-[11px] text-emerald-400 font-mono">Status: Verified</span>
                </div>
                <pre className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-amber-200/90 leading-relaxed selection:bg-amber-500/30" dir="ltr">
                  {toolExecutionOutput
                    ? JSON.stringify(toolExecutionOutput, null, 2)
                    : '// اضغط "تشغيل الأداة" لمحاكاة استدعاء الوكيل واسترجاع النتائج'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Events Stream */}
      {activeTab === 'sync' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Simulator Bar */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white">محاكي إرسال Webhooks الأنظمة المصدرية</div>
              <div className="text-xs text-slate-400">اختبار تدفق البيانات والـ Idempotency وعدم تكرار السجلات</div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={simulatedSource}
                onChange={e => setSimulatedSource(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="erpnext">ERPNext / Frappe (مشاريع وأصول)</option>
                <option value="uberfix">UberFix (طلبات صيانة وفنيين)</option>
                <option value="daftra">Daftra (أوامر تشغيل)</option>
              </select>
              <button
                onClick={handleSimulateWebhook}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إصدار حدث Webhook</span>
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {syncEvents.map(evt => (
              <div key={evt.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold border border-slate-700">
                      {evt.source_system.toUpperCase()}
                    </span>
                    <span className="font-mono text-slate-400">{evt.event_type}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-slate-300 font-bold">{evt.external_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{evt.status}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {new Date(evt.timestamp).toLocaleTimeString('ar-EG')}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300">{evt.message}</div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-400 overflow-x-auto" dir="ltr">
                  {JSON.stringify(evt.payload)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Architecture Adapters View */}
      {activeTab === 'adapters' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="text-xs text-slate-400 mb-2">
            المحولات المعمارية المعتمدة (Integration Adapters) لفصل منطق الأنظمة الخارجية عن نواة المنصة الجغرافية (Section 7):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                system: 'ERPNext / Frappe',
                role: 'المشروعات والعملاء والأصول المرتبطة بالـ ERP',
                mechanism: 'Frappe REST API + Document Hooks',
                dataFlow: 'إرسال أحداث التعديل والإنشاء إلى Integration Worker وتحديث geo_locations',
                color: 'text-blue-400 border-blue-500/30'
              },
              {
                system: 'UberFix',
                role: 'طلبات الصيانة والفنيون وحالات التنفيذ الميداني',
                mechanism: 'Supabase API / DB Events',
                dataFlow: 'تحديث فوري لطلبات الصيانة وتوزيع الفنيين وحساب المسافات ونطاقات التغطية',
                color: 'text-amber-400 border-amber-500/30'
              },
              {
                system: 'Daftra',
                role: 'أوامر التشغيل والبيانات المالية والمقايسات',
                mechanism: 'daftra-mcp أو واجهة الخدمة المباشرة',
                dataFlow: 'ربط أمر التشغيل (مثل AZ-PROJ-2026-0028) بالموقع الجغرافي دون تكرار البيانات',
                color: 'text-emerald-400 border-emerald-500/30'
              },
              {
                system: 'Hikvision',
                role: 'كاميرات المراقبة المحيطية ومؤشرات الاتصال',
                mechanism: 'Device Metadata Adapter',
                dataFlow: 'تسجيل إحداثيات الكاميرات ورابط البث ومراقبة حالة الاتصال المصرح بها',
                color: 'text-red-400 border-red-500/30'
              }
            ].map((ad, idx) => (
              <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className={`font-bold text-sm ${ad.color}`}>{ad.system}</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">Adapter Contract</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold">مصدر الحقيقة المعتمد: </span>
                    <span className="text-white">{ad.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">آلية التكامل: </span>
                    <span className="text-amber-300 font-mono">{ad.mechanism}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">تدفق البيانات: </span>
                    <span className="text-slate-300 leading-relaxed">{ad.dataFlow}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
