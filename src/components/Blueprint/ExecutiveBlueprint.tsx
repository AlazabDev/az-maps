import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Shield, Layers, Network, Server, Database, Globe, ArrowRight, Code, Key } from 'lucide-react';

export const ExecutiveBlueprint: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(1);

  const SECTIONS = [
    { id: 1, title: '1. القرار المعماري (Architectural Decision)' },
    { id: 2, title: '2. البنية التقنية المعتمدة للتصميم' },
    { id: 3, title: '3. المخطط المعماري الشامل' },
    { id: 4, title: '4. أسماء الخدمات والنطاقات المستهدفة' },
    { id: 5, title: '5. تصميم قاعدة البيانات الجغرافية PostGIS' },
    { id: 6, title: '6. تصميم واجهات Alazab Maps API v1' },
    { id: 7, title: '7. استراتيجية التكامل مع أنظمة العزب' },
    { id: 8, title: '8. واجهة المستخدم الموحدة' },
    { id: 9, title: '9. هيكل المستودع المقترح (Monorepo)' },
    { id: 10, title: '10. معايير القبول وخطة الإطلاق' }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden" dir="rtl">
      {/* Blueprint Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">المخطط التنفيذي لنظام Alazab Maps (az-maps)</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Executive Architecture Specification
              </span>
            </div>
            <p className="text-xs text-slate-400">
              المعمارية المركزية · قواعد البيانات المكانية · واجهات API · التكامل المؤسسي · خطة التنفيذ والإطلاق
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-l border-slate-800 bg-slate-900/20 p-4 overflow-y-auto shrink-0 space-y-1">
          <div className="text-xs font-bold text-slate-400 mb-2 px-2">فهرس المحاور التنفيذية</div>
          {SECTIONS.map(sec => {
            const isCurrent = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Section Content Display */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl">
          {/* Section 1 */}
          {activeSection === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">1. القرار المعماري</h3>
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl leading-relaxed text-sm text-slate-300 space-y-3">
                <p>
                  بناء <strong>Alazab Maps</strong> باعتبارها خدمة جغرافية مؤسسية موحدة (<strong>Enterprise Geospatial Platform</strong>)، وليست تطبيقًا منفصلًا يكرر بيانات ERPNext أو UberFix أو بقية أنظمة العزب.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="font-bold text-amber-400 text-xs mb-1">1. Alazab Maps Core</div>
                    <div className="text-[11px] text-slate-400">تخزين المواقع والهندسة المكانية والبحث وإدارة الطبقات والصلاحيات.</div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="font-bold text-blue-400 text-xs mb-1">2. Alazab Maps Services</div>
                    <div className="text-[11px] text-slate-400">الخرائط الأساسية، المسارات، الترميز الجغرافي، والاستعلامات المكانية.</div>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="font-bold text-emerald-400 text-xs mb-1">3. Alazab Maps Apps</div>
                    <div className="text-[11px] text-slate-400">لوحة الإدارة، خرائط المشروعات، الصيانة، الفروع، واللوحات التشغيلية.</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                  <strong>القاعدة الحاكمة:</strong> كل نظام يحتفظ بسجلاته التجارية والتشغيلية الأصلية، بينما تحتفظ منصة الخرائط بمراجعها الجغرافية والبيانات المكانية اللازمة لعرضها وتحليلها.
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-bold">النظام المؤسسي</th>
                      <th className="py-2.5 px-4 font-bold">مصدر الحقيقة المعتمد (Source of Truth)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-blue-400">ERPNext / Frappe</td>
                      <td className="py-2.5 px-4 text-slate-300">المشروعات والعملاء والأصول المرتبطة بالـ ERP</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-amber-400">UberFix</td>
                      <td className="py-2.5 px-4 text-slate-300">طلبات الصيانة والفنيون وحالات التنفيذ</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-emerald-400">Daftra</td>
                      <td className="py-2.5 px-4 text-slate-300">أوامر التشغيل والبيانات المالية والمقايسات</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-pink-400">Alazab Maps</td>
                      <td className="py-2.5 px-4 text-slate-300">المواقع والإحداثيات والحدود الجغرافية والطبقات</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-purple-400">الهوية المركزية</td>
                      <td className="py-2.5 px-4 text-slate-300">المستخدمون والأدوار والتفويض والصلاحيات</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-cyan-400">AZ MCP / Agents</td>
                      <td className="py-2.5 px-4 text-slate-300">وصول الوكلاء إلى الأدوات والعمليات الجغرافية</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 2 */}
          {activeSection === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">2. البنية التقنية المعتمدة للتصميم</h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-bold">المكون المعماري</th>
                      <th className="py-2.5 px-4 font-bold">الاختيار المعتمد</th>
                      <th className="py-2.5 px-4 font-bold">التبرير الهندسي والتشغيلي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {[
                      { component: 'Frontend', choice: 'React + TypeScript', reason: 'قابل لإعادة الاستخدام داخل تطبيقات ومكونات العزب' },
                      { component: 'Map Engine', choice: 'MapLibre GL JS / Leaflet', reason: 'خرائط Vector سريعة مع دعم التخصيص وWebGL' },
                      { component: 'Spatial Database', choice: 'PostgreSQL + PostGIS', reason: 'الفهرسة المكانية والاستعلامات الجغرافية المتقدمة' },
                      { component: 'Maps Backend', choice: 'Node.js + Fastify + TypeScript', reason: 'خدمة مستقلة وعقود API واضحة وسريعة' },
                      { component: 'Tile Server', choice: 'Martin Vector Tiles', reason: 'توليد Vector Tiles فوري من PostGIS مباشرة' },
                      { component: 'Basemap', choice: 'MapTiler / Carto / OSM', reason: 'عدم تحمل عبء استضافة خرائط العالم والطرق ذاتياً' },
                      { component: 'Routing', choice: 'Valhalla Adapter', reason: 'حساب المسارات والتوجيه وزمن وصول فرق الصيانة' },
                      { component: 'Geocoding', choice: 'Provider Adapter', reason: 'إمكانية تغيير المزود دون تعديل كود التطبيقات' },
                      { component: 'Authentication', choice: 'OIDC / JWT', reason: 'التكامل مع منظومة الهوية المركزية للعزب' }
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-4 font-bold text-white">{row.component}</td>
                        <td className="py-2.5 px-4 font-mono text-amber-400 font-semibold">{row.choice}</td>
                        <td className="py-2.5 px-4 text-slate-300">{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3 */}
          {activeSection === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">3. المخطط المعماري الشامل</h3>
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <div className="text-xs text-slate-400">التدفق الهرمي للطبقات والخدمات الجغرافية:</div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 leading-relaxed space-y-3">
                  <div className="text-amber-400 font-bold">1. Alazab Maps Platform (maps.alazab.com)</div>
                  <div className="pl-4 text-slate-400">
                    ├── Projects GIS (خرائط المشروعات)<br />
                    ├── UberFix GIS (مواقع الصيانة والتكليف)<br />
                    ├── Assets GIS (الأصول والمعدات الثقيلة)<br />
                    ├── Branches GIS (المقرات والفروع)<br />
                    ├── Fleet GIS (أسطول المركبات)<br />
                    └── Engineering GIS (المخططات المساحية)
                  </div>

                  <div className="text-blue-400 font-bold mt-2">2. Alazab Maps API Gateway (api.alazab.com/maps/v1)</div>
                  <div className="pl-4 text-slate-400">
                    ├── Authentication · Authorization · Validation · Audit<br />
                    ├── Locations Service & Layers<br />
                    ├── Spatial Search (ST_DWithin, BBOX)<br />
                    ├── Routing Adapter (Valhalla)<br />
                    └── Geocoding Adapter & Imports
                  </div>

                  <div className="text-emerald-400 font-bold mt-2">3. Storage & Integration Layer</div>
                  <div className="pl-4 text-slate-400">
                    ├── PostgreSQL / PostGIS (Spatial Core)<br />
                    ├── Martin Vector Tiles Server<br />
                    ├── ERPNext & UberFix Webhook Adapters<br />
                    └── AZ MCP Protocol for AI Agents
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4 */}
          {activeSection === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">4. أسماء الخدمات والنطاقات المستهدفة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { domain: 'maps.alazab.com', role: 'لوحة الخرائط الموحدة وواجهة الإدارة المركزية' },
                  { domain: 'api.alazab.com/maps/v1', role: 'الواجهة العامة لخرائط المؤسسة والمواقع المكانية' },
                  { domain: 'maps.alazab.com/tiles', role: 'تقديم Vector Tiles عبر Reverse Proxy مع التفويض' },
                  { domain: 'maps.alazab.com/styles', role: 'أنماط العزب وألوان الخرائط والرموز' },
                  { domain: 'mcp.alazab.com/maps', role: 'أدوات الخرائط الموجهة لوكلاء الذكاء الاصطناعي' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                    <div className="font-mono text-xs font-bold text-amber-400" dir="ltr">{item.domain}</div>
                    <div className="text-xs text-slate-300">{item.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5 */}
          {activeSection === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">5. تصميم قاعدة البيانات الجغرافية PostGIS</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                اعتماد معيار <code>UUID</code> لهويات السجلات، مع الاحتفاظ بمعرّفات الأنظمة المصدرية في جدول <code>geo_entity_links</code>، لحماية نموذج الخرائط من التبعية لطرق توليد المعرفات في ERPNext أو Daftra.
              </p>
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-white text-xs">استعلام ST_DWithin المعتمد في الوثيقة (نطاق 5 كم):</div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-amber-300/90 overflow-x-auto" dir="ltr">
{`SELECT id, name, ST_AsGeoJSON(geom)::jsonb AS geometry
FROM az_maps.geo_locations
WHERE workspace_id = $1
  AND ST_DWithin(
      geom::geography,
      ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
      5000
  )
ORDER BY ST_Distance(
    geom::geography,
    ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
);`}
                </pre>
              </div>
            </div>
          )}

          {/* Section 6 */}
          {activeSection === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">6. تصميم واجهات Alazab Maps API</h3>
              <p className="text-xs text-slate-300">
                17 نقطة نهاية موحدة تحت المسار <code>https://api.alazab.com/maps/v1</code> لضمان استرجاع وإدخال المواقع والمسارات والطبقات بكفاءة.
              </p>
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="font-bold text-white text-xs">عقد إنشاء موقع (طلب عينة أبو عوف سيدي جابر):</div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-amber-300/90 overflow-x-auto" dir="ltr">
{`{
  "name": "Abu Auf - Sidi Gaber",
  "code": "AZ-AUF-SG",
  "address": "Sidi Gaber, Alexandria, Egypt",
  "geometry": {
    "type": "Point",
    "coordinates": [29.949, 31.184]
  },
  "source": {
    "system": "daftra",
    "entity_type": "work_order",
    "external_id": "AZ-PROJ-2026-0028"
  }
}`}
                </pre>
              </div>
            </div>
          )}

          {/* Section 7 */}
          {activeSection === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">7. استراتيجية التكامل وربط UberFix و ERPNext و MCP</h3>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  المنصة المركزية تستخدم <strong>Integration Adapters</strong> بدل كتابة منطق خاص بكل نظام داخل نواة GIS.
                </p>
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <strong className="text-amber-400 block mb-1">أول استخدام تشغيلي موصى به:</strong>
                  ربط بيانات UberFix (طلبات الصيانة، الفنيون، نطاقات الاستجابة) للحصول على قيمة فورية ملموسة لمسؤولي التشغيل.
                </div>
              </div>
            </div>
          )}

          {/* Section 8 */}
          {activeSection === 8 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">8. وحدات واجهة المستخدم الموحدة</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  'Map Explorer (استعراض المواقع والطبقات)',
                  'Map Editor (تحرير النقاط والحدود)',
                  'Layer Manager (إظهار وترتيب الطبقات)',
                  'Project Locator (ربط مشروعات ERPNext)',
                  'Operations Dashboard (مراقبة طلبات الصيانة)',
                  'Import Center (رفع GeoJSON وKML)',
                  'Map Styles (تخصيص الألوان والهوية)',
                  'Permissions (صلاحيات الوصول للطبقات)'
                ].map((unit, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300">
                    {unit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 9 */}
          {activeSection === 9 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">9. هيكل المستودع المقترح (Monorepo)</h3>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 leading-relaxed" dir="ltr">
{`alazab-maps/
├── apps/
│   ├── maps-web/           # لوحة الخرائط المركزية (React + TS)
│   └── maps-api/           # خدمة الـ Fastify API المستقلة
├── packages/
│   ├── maps-types/         # الأنواع المشتركة وPostGIS Types
│   ├── maps-client/        # TypeScript SDK للمنظومة
│   ├── maps-ui/            # مكونات الخرائط القابلة للإدراج
│   └── maps-mcp/           # خادم ومحولات بروتوكول الوكلاء
├── services/
│   ├── sync-worker/        # معالجة أحداث Webhook غير المتزامنة
│   ├── routing-adapter/    # محول Valhalla للتوجيه
│   ├── geocoding-adapter/  # محول الترميز الجغرافي
│   └── import-worker/      # معالجة ملفات GIS وCAD
└── integrations/
    ├── erpnext/            # Document Hooks لمشروعات Frappe
    ├── uberfix/            # Supabase Realtime & DB Hooks
    └── daftra/             # أوامر التشغيل وdaftra-mcp`}
              </pre>
            </div>
          )}

          {/* Section 10 */}
          {activeSection === 10 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">10. معايير القبول وخطة الإطلاق</h3>
              <div className="space-y-2 text-xs">
                {[
                  'نجاح جميع اختبارات عزل مساحات العمل (Workspace Isolation) والوصول المصرح للطبقات.',
                  'تطابق روابط السجلات الخارجية (External IDs) مع معرّفات المصدر دون إنشاء تكرارات.',
                  'نجاح إعادة تشغيل حدث المزامنة نفسه (Idempotency) دون أي تغيير غير مقصود.',
                  'صحة التحويل الهندسي بين أنظمة الإحداثيات EPSG:4326 وتفسير معايير GeoJSON.',
                  'اختبار استمرار عمل بقية الأنظمة في حال توقف Maps (ألا يعطل توقف الخرائط إنشاء طلب صيانة أو أمر تشغيل).'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
