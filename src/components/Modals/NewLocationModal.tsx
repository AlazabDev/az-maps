import React, { useState, useEffect } from 'react';
import { X, MapPin, Save, ShieldCheck } from 'lucide-react';
import { GeoLocation, LayerType, SourceSystem, LocationStatus } from '../../types/maps';

interface NewLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: GeoLocation) => void;
  initialCoords?: [number, number] | null; // [lng, lat]
}

export const NewLocationModal: React.FC<NewLocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCoords
}) => {
  const [name, setName] = useState('أبو عوف - سيدي جابر');
  const [code, setCode] = useState('AZ-AUF-SG');
  const [address, setAddress] = useState('شارع المشير أحمد إسماعيل، سيدي جابر، الإسكندرية');
  const [city, setCity] = useState('الإسكندرية');
  const [lng, setLng] = useState(initialCoords ? initialCoords[0] : 29.949);
  const [lat, setLat] = useState(initialCoords ? initialCoords[1] : 31.216);
  const [layer, setLayer] = useState<LayerType>('projects');
  const [sourceSystem, setSourceSystem] = useState<SourceSystem>('daftra');
  const [externalId, setExternalId] = useState('AZ-PROJ-2026-0028');
  const [status, setStatus] = useState<LocationStatus>('active');

  useEffect(() => {
    if (initialCoords) {
      setLng(Number(initialCoords[0].toFixed(5)));
      setLat(Number(initialCoords[1].toFixed(5)));
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLocation: GeoLocation = {
      id: crypto.randomUUID(),
      workspace_id: 'ws-alazab-eg-01',
      code: code.trim() || `AZ-LOC-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: name.trim() || 'موقع جديد',
      address: address.trim() || 'الإسكندرية، مصر',
      city: city.trim() || 'الإسكندرية',
      geom: {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      },
      status,
      layer,
      metadata: {
        category: 'مشروع مسجل يدوياً',
        completion_percentage: 100
      },
      source: {
        system: sourceSystem,
        entity_type: 'work_order',
        external_id: externalId.trim() || 'MANUAL-01',
        last_synced_at: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSave(newLocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">إضافة موقع جغرافي جديد (geo_locations)</h3>
              <p className="text-[11px] text-slate-400">حفظ نقطة مكانية وربطها بنظام ERPNext أو Daftra أو UberFix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الموقع (Name)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="أبو عوف - سيدي جابر"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الكود المرجعي (Code)</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                placeholder="AZ-AUF-SG"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">العنوان التفصيلي (Address)</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="شارع المشير، سيدي جابر، الإسكندرية"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">المدينة (City)</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">خط الطول (Longitude)</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={e => setLng(parseFloat(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">خط العرض (Latitude)</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={e => setLat(parseFloat(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الطبقة المكانية (Layer)</label>
              <select
                value={layer}
                onChange={e => setLayer(e.target.value as LayerType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="projects">المشروعات الهندسية</option>
                <option value="uberfix">صيانة UberFix</option>
                <option value="branches">فروع ومقرات العزب</option>
                <option value="assets">المعدات والأصول</option>
                <option value="fleet">الأسطول الميداني</option>
                <option value="surveillance">كاميرات المراقبة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">النظام المصدر (Source)</label>
              <select
                value={sourceSystem}
                onChange={e => setSourceSystem(e.target.value as SourceSystem)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="daftra">Daftra (أوامر تشغيل)</option>
                <option value="erpnext">ERPNext (مشروعات/أصول)</option>
                <option value="uberfix">UberFix (صيانة)</option>
                <option value="central_id">الهوية المركزية</option>
                <option value="manual">إدخال يدوي</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الحالة (Status)</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as LocationStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="active">نشط (Active)</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="pending">معلق</option>
                <option value="maintenance">تحت الصيانة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">المعرف الخارجي (External ID)</label>
            <input
              type="text"
              value={externalId}
              onChange={e => setExternalId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              placeholder="AZ-PROJ-2026-0028"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الموقع في قاعدة البيانات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
