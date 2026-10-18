import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle2, AlertCircle, FileCheck, Layers, Copy, Check } from 'lucide-react';
import { GeoLocation, LayerType } from '../../types/maps';
import { exportToGeoJson, parseGeoJsonInput } from '../../utils/geoUtils';

interface ImportExportCenterProps {
  locations: GeoLocation[];
  onLocationsImported: (newLocations: GeoLocation[]) => void;
  onOpenMap: () => void;
}

const SAMPLE_IMPORT_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [29.985, 31.232]
      },
      properties: {
        code: 'AZ-IMP-MIA',
        name: 'فرع ومستودع ميامي - شرق الإسكندرية',
        address: 'شارع جمال عبد الناصر، ميامي، الإسكندرية',
        city: 'الإسكندرية',
        category: 'مستودع تشغيل سريع',
        layer: 'branches'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [29.897, 31.145]
      },
      properties: {
        code: 'AZ-IMP-DKH',
        name: 'محطة خرسانة ومعدات الدخيلة',
        address: 'المنطقة الصناعية، الدخيلة، الإسكندرية',
        city: 'الإسكندرية',
        category: 'أصول ومعدات صب',
        layer: 'assets'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [29.924, 31.206]
      },
      properties: {
        code: 'UF-IMP-902',
        name: 'بلاغ صيانة عاجل: مضخة إطفاء الحريق - سبورتنج',
        address: 'شارع بورسعيد، سبورتنج، الإسكندرية',
        city: 'الإسكندرية',
        priority: 'high',
        layer: 'uberfix'
      }
    }
  ]
};

export const ImportExportCenter: React.FC<ImportExportCenterProps> = ({
  locations,
  onLocationsImported,
  onOpenMap
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [inputText, setInputText] = useState(JSON.stringify(SAMPLE_IMPORT_GEOJSON, null, 2));
  const [selectedTargetLayer, setSelectedTargetLayer] = useState<LayerType>('projects');
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    count: number;
    message: string;
  } | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);

  const handleProcessImport = () => {
    try {
      const parsed = parseGeoJsonInput(inputText);
      if (parsed.length === 0) {
        setImportStatus({
          success: false,
          count: 0,
          message: 'لم يتم العثور على عناصر جغرافية صالحة داخل الملف'
        });
        return;
      }

      onLocationsImported(parsed);
      setImportStatus({
        success: true,
        count: parsed.length,
        message: `تم استيراد ${parsed.length} موقع جغرافي بنجاح وإضافتها إلى قاعدة البيانات المكانية`
      });
    } catch (err: any) {
      setImportStatus({
        success: false,
        count: 0,
        message: err.message || 'خطأ في معالجة ملف GeoJSON'
      });
    }
  };

  const handleDownloadGeoJson = () => {
    const geojsonString = exportToGeoJson(locations);
    const blob = new Blob([geojsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alazab_maps_export_${new Date().toISOString().slice(0, 10)}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyExportJson = () => {
    navigator.clipboard.writeText(exportToGeoJson(locations));
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">مركز الاستيراد والتصدير الجغرافي (Import / Export)</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                GeoJSON · KML · CSV
              </span>
            </div>
            <p className="text-xs text-slate-400">
              رفع ملفات المساحة والخرائط، التحقق الهندسي ST_IsValid وتصدير الحزم الجغرافية المتوافقة مع QGIS وArcGIS
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'import' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>استيراد ملفات (Import)</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'export' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير البيانات (Export)</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      {activeTab === 'import' ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Controls & Options */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l border-slate-800 bg-slate-900/30 p-4 shrink-0 flex flex-col gap-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الطبقة المستهدفة (Target Layer)</label>
              <select
                value={selectedTargetLayer}
                onChange={e => setSelectedTargetLayer(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2.5 focus:outline-none"
              >
                <option value="projects">المشروعات الهندسية (projects)</option>
                <option value="uberfix">طلبات ومواقع UberFix</option>
                <option value="branches">فروع ومقرات العزب</option>
                <option value="assets">المعدات والأصول الثقيلة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نماذج جاهزة للاختبار</label>
              <button
                onClick={() => setInputText(JSON.stringify(SAMPLE_IMPORT_GEOJSON, null, 2))}
                className="w-full text-right p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs text-slate-200 transition-colors"
              >
                <div className="font-semibold text-amber-400">عينة مواقع إسكندرية جديدة</div>
                <div className="text-[11px] text-slate-400">3 نقاط جغرافية (ميامي، الدخيلة، سبورتنج)</div>
              </button>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-300">
              <div className="font-bold text-white mb-1">ضوابط التحقق الهندسي:</div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>التحقق من صحة الإحداثيات [lon, lat]</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>فحص الحدود الجغرافية لجمهورية مصر</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>توليد معرفات UUID فريدة</span>
              </div>
            </div>

            <button
              onClick={handleProcessImport}
              className="mt-auto w-full py-2.5 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>فحص ومعالجة الاستيراد</span>
            </button>

            {importStatus && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  importStatus.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {importStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  <span>{importStatus.success ? 'اكتملت المعالجة بنجاح' : 'تعذر الاستيراد'}</span>
                </div>
                <div className="text-[11px] leading-relaxed">{importStatus.message}</div>
                {importStatus.success && (
                  <button
                    onClick={onOpenMap}
                    className="mt-2 w-full py-1.5 text-center text-[11px] font-bold bg-emerald-500 text-slate-950 rounded hover:bg-emerald-400 transition-colors"
                  >
                    عرض المواقع الجديدة على الخريطة
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Textarea Editor */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">محتوى ملف الـ GeoJSON (FeatureCollection)</span>
              <span className="text-[11px] font-mono text-slate-500">EPSG:4326 CRS84</span>
            </div>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full flex-1 p-4 bg-transparent font-mono text-xs text-slate-300 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
              dir="ltr"
            />
          </div>
        </div>
      ) : (
        /* Export Tab */
        <div className="flex-1 p-6 flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">تصدير قاعدة البيانات المكانية الحالية ({locations.length} موقع)</h3>
              <p className="text-xs text-slate-400">توليد ملف GeoJSON قياسي متوافق مع كافة برمجيات نظم المعلومات الجغرافية GIS</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyExportJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedExport ? 'تم النسخ' : 'نسخ كود JSON'}</span>
              </button>
              <button
                onClick={handleDownloadGeoJson}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل ملف GeoJSON (.geojson)</span>
              </button>
            </div>
          </div>

          <pre className="flex-1 p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-auto font-mono text-xs text-amber-200/90 leading-relaxed" dir="ltr">
            {exportToGeoJson(locations)}
          </pre>
        </div>
      )}
    </div>
  );
};
