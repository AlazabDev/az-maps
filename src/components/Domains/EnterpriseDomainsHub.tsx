import React, { useState } from 'react';
import {
  EnterpriseDomainKey,
  EnterpriseDomainInfo,
  BimProjectDetail,
  FacilityAssetRecord,
  NetworkCctvTopology,
  SupplyChainHub,
  SmartLightingPanel,
  AzlexaIndoorBuilding,
  ManufacturingPlant,
  GeoLocation
} from '../../types/maps';
import {
  DOMAINS_INFO,
  BIM_PROJECTS,
  FACILITY_ASSETS,
  NETWORK_CCTV_TOPOLOGY,
  SUPPLY_CHAIN_HUBS,
  SMART_LIGHTING_PANELS,
  AZLEXA_INDOOR_BUILDINGS,
  MANUFACTURING_PLANTS
} from '../../data/domainsData';
import {
  Building2,
  Wrench,
  Video,
  Truck,
  Zap,
  Home,
  Factory,
  CheckCircle2,
  AlertCircle,
  Play,
  Sliders,
  ChevronRight,
  Eye,
  MapPin,
  Clock,
  Layers,
  Thermometer,
  Shield,
  Activity,
  ArrowRight,
  Check,
  Box
} from 'lucide-react';
import { Bim3DViewerModal } from '../Map/Bim3DViewerModal';

interface EnterpriseDomainsHubProps {
  onOpenMapAtLocation: (coords: [number, number], zoomLevel?: number) => void;
  activeDomainKey?: EnterpriseDomainKey;
}

const DOMAIN_ICONS: Record<EnterpriseDomainKey, React.ComponentType<{ className?: string }>> = {
  construction_bim: Building2,
  facility_cmms: Wrench,
  network_cctv: Video,
  supply_chain: Truck,
  smart_light: Zap,
  smart_home_azlexa: Home,
  manufacturing_trace: Factory
};

export const EnterpriseDomainsHub: React.FC<EnterpriseDomainsHubProps> = ({
  onOpenMapAtLocation,
  activeDomainKey: initialDomainKey
}) => {
  const [selectedDomain, setSelectedDomain] = useState<EnterpriseDomainKey>(
    initialDomainKey || 'construction_bim'
  );

  // 01 State
  const [selectedBim, setSelectedBim] = useState<BimProjectDetail>(BIM_PROJECTS[0]);
  const [isBimModalOpen, setIsBimModalOpen] = useState(false);

  // 05 State: Interactive circuit breaker toggle simulation
  const [activeCircuits, setActiveCircuits] = useState<Record<string, boolean>>({
    'C1-TRACK': true,
    'C2-FAÇADE': true,
    'C3-HVAC': true,
    'C4-EMERG': true,
    'Z1-TOWER-A': true,
    'Z2-TOWER-B': true,
    'Z3-CROWN': true
  });

  // 06 State: Interactive indoor IoT device toggles
  const [deviceStates, setDeviceStates] = useState<Record<string, boolean>>({
    'dev-l1': true,
    'dev-ac1': true,
    'dev-door': true,
    'dev-show-light': true,
    'dev-screen': true,
    'dev-srv-ac1': true,
    'dev-srv-ac2': true,
    'dev-eng-light': true,
    'dev-curtain': true
  });

  const [activeFloorIndex, setActiveFloorIndex] = useState(0);

  const currentDomainInfo = DOMAINS_INFO.find(d => d.key === selectedDomain)!;

  const toggleCircuit = (circuitId: string) => {
    setActiveCircuits(prev => ({ ...prev, [circuitId]: !prev[circuitId] }));
  };

  const toggleDevice = (devId: string) => {
    setDeviceStates(prev => ({ ...prev, [devId]: !prev[devId] }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans" dir="rtl">
      {/* 7 Domains Horizontal Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {DOMAINS_INFO.map(domain => {
          const Icon = DOMAIN_ICONS[domain.key];
          const isSelected = selectedDomain === domain.key;
          return (
            <button
              key={domain.key}
              onClick={() => setSelectedDomain(domain.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md scale-102'
                  : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-amber-400 border border-slate-700'
              }`}>
                {domain.numberStr}
              </span>
              <Icon className="w-3.5 h-3.5" />
              <span>{domain.title_ar}</span>
            </button>
          );
        })}
      </div>

      {/* Domain Header Sub-banner */}
      <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
            style={{ backgroundColor: `${currentDomainInfo.accentColor}25`, border: `1px solid ${currentDomainInfo.accentColor}60`, color: currentDomainInfo.accentColor }}
          >
            {React.createElement(DOMAIN_ICONS[currentDomainInfo.key], { className: 'w-4 h-4' })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">{currentDomainInfo.title_ar}</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">
                {currentDomainInfo.sub_ar}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{currentDomainInfo.description_ar}</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (selectedDomain === 'construction_bim') {
              onOpenMapAtLocation(selectedBim.coordinates, 15);
            } else if (selectedDomain === 'facility_cmms') {
              onOpenMapAtLocation(FACILITY_ASSETS[0].locationPoint, 15);
            } else if (selectedDomain === 'network_cctv') {
              onOpenMapAtLocation(NETWORK_CCTV_TOPOLOGY.coordinates, 16);
            } else if (selectedDomain === 'supply_chain') {
              onOpenMapAtLocation(SUPPLY_CHAIN_HUBS[0].coordinates, 12);
            } else if (selectedDomain === 'smart_light') {
              onOpenMapAtLocation(SMART_LIGHTING_PANELS[0].coordinates, 15);
            } else if (selectedDomain === 'smart_home_azlexa') {
              onOpenMapAtLocation(AZLEXA_INDOOR_BUILDINGS[0].coordinates, 16);
            } else if (selectedDomain === 'manufacturing_trace') {
              onOpenMapAtLocation(MANUFACTURING_PLANTS[0].coordinates, 13);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow transition-all whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>التركيز المباشر على الخريطة الجغرافية</span>
        </button>
      </div>

      {/* Main Domain Interactive Panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ========================================================================= */}
        {/* DOMAIN 01: Construction GIS + BIM + Project Digital Twin */}
        {/* ========================================================================= */}
        {selectedDomain === 'construction_bim' && (
          <div className="space-y-6">
            {/* Project Picker and 3D BIM Launcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">اختر المشروع الإنشائي:</span>
                {BIM_PROJECTS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedBim(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedBim.id === p.id
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {p.name.split(' - ')[0]} ({p.city})
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsBimModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg border border-blue-400/50 transition-all shrink-0 cursor-pointer"
              >
                <Box className="w-4 h-4 text-amber-300" />
                <span>تشغيل النموذج التفاعلي 3D BIM Model</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-amber-300 font-bold">
                  {selectedBim.lodLevel}
                </span>
              </button>
            </div>

            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">نسبة الإنجاز الإنشائي</span>
                <div className="flex items-baseline gap-2">
                  <strong className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {selectedBim.progressPercentage}%
                  </strong>
                  <span className="text-xs text-slate-400 font-mono">{selectedBim.lodLevel}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedBim.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">عناصر التوأم الرقمي (BIM Elements)</span>
                <strong className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
                  {selectedBim.bimElementsCount.toLocaleString()}
                </strong>
                <span className="text-[11px] text-slate-400 block mt-1">عنصر إنشائي ومعماري وكهروميكانيكي</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">المرحلة الحالية</span>
                <strong className="text-xs font-bold text-white block leading-relaxed line-clamp-2">
                  {selectedBim.currentPhase}
                </strong>
                <span className="text-[10px] text-amber-400 font-mono mt-1 block">كود المشروع: {selectedBim.code}</span>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">المعدات النشطة بالموقع</span>
                <strong className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {selectedBim.activeMachinery.length} معدات
                </strong>
                <span className="text-[11px] text-slate-400 block mt-1">تتبع دوراني ودوائر تغطية الأوناش</span>
              </div>
            </div>

            {/* Split: Execution Zones & Invoicing Milestones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Execution Zones */}
              <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>مناطق التنفيذ الميداني (Execution Zones)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Spatial Zoning</span>
                </div>

                <div className="space-y-3">
                  {selectedBim.executionZones.map((zone, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{zone.name}</span>
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                            zone.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : zone.status === 'ongoing'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {zone.status === 'completed' ? 'مكتمل 100%' : zone.status === 'ongoing' ? 'قيد التنفيذ' : 'في الانتظار'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${zone.completion}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoicing Milestones */}
              <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>المستخلصات المالية ومطابقات الإنجاز</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">ERPNext / Daftra Billing</span>
                </div>

                <div className="space-y-2.5">
                  {selectedBim.invoicingMilestones.map((ms, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{ms.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          القيمة: <strong className="text-amber-400">{ms.amountEgp.toLocaleString()} ج.م</strong>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap ${
                          ms.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : ms.status === 'under_review'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ms.status === 'paid' ? 'تم الصرف' : ms.status === 'under_review' ? 'تحت المراجعة' : 'مستقبلية'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Site Heavy Machinery */}
            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>معدات الموقع وأقطار التغطية الميدانية (Machinery GIS)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedBim.activeMachinery.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">{m.code}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        نصف القطر: {m.radiusMeters}م
                      </span>
                    </div>
                    <div className="text-white font-medium">{m.type}</div>
                    <div className="text-slate-400 text-[11px]">المشغل المسؤول: {m.operator}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOMAIN 02: Facility GIS + CMMS + Asset Management */}
        {/* ========================================================================= */}
        {selectedDomain === 'facility_cmms' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">إدارة الأصول والمرافق ونظام أوامر صيانة UberFix</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ربط السجلات الفنية بالموقع المكاني الفعلي للأصل ومراقبة مؤشرات الصحة التشغيلية (Asset Health Score)
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-lg font-mono">
                {FACILITY_ASSETS.length} أصول كبرى تحت المتابعة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FACILITY_ASSETS.map(asset => (
                <div key={asset.id} className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {asset.code}
                      </span>
                      <span className="text-[11px] font-mono uppercase text-slate-400">{asset.assetCategory}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">مؤشر الكفاءة:</span>
                      <strong
                        className={`font-mono text-sm font-bold ${
                          asset.healthScore >= 80 ? 'text-emerald-400' : asset.healthScore >= 60 ? 'text-amber-400' : 'text-red-400'
                        }`}
                      >
                        {asset.healthScore}%
                      </strong>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white">{asset.name}</h4>
                  <p className="text-slate-300">{asset.facility}</p>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">آخر صيانة مسجلة:</span>
                      <span className="font-mono text-slate-200">{asset.lastMaintenanceDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الصيانة الوقائية القادمة:</span>
                      <span className="font-mono text-slate-200">{asset.nextScheduledDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الفني المسؤول:</span>
                      <span className="text-amber-300 font-semibold">{asset.assignedTechnician}</span>
                    </div>
                    {asset.openWorkOrderId && (
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span className="text-red-400 font-semibold">أمر تشغيل صيانة مفتوح:</span>
                        <span className="font-mono text-red-300 font-bold">{asset.openWorkOrderId}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">نطاق التغطية: {asset.coverageZone}</span>
                    <button
                      onClick={() => onOpenMapAtLocation(asset.locationPoint, 16)}
                      className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>عرض في الخريطة</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOMAIN 03: Network GIS + CCTV + Infrastructure Topology */}
        {/* ========================================================================= */}
        {selectedDomain === 'network_cctv' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">طوبولوجيا كاميرات CCTV وشبكات الألياف الضوئية المستدامة</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تمثيل زوايا ومخاريط الرؤية (FOV Cones)، مسارات الكابلات، ومراقبة أجهزة التوزيع PoE Switches
                </p>
              </div>
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-mono">
                Hikvision + Cisco Infrastructure
              </span>
            </div>

            {/* Cameras & FOV Cones */}
            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-red-400" />
                <span>توزيع الكاميرات ومخاريط زوايا الرؤية (Camera FOV Coverage)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {NETWORK_CCTV_TOPOLOGY.cameras.map(cam => (
                  <div key={cam.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-amber-400 font-bold">{cam.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-mono">
                        {cam.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-white font-medium">{cam.model}</div>

                    <div className="space-y-1 text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                      <div className="flex justify-between">
                        <span>زاوية الاتجاه:</span>
                        <span className="font-mono text-slate-200">{cam.headingDeg}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span>اتساع المخروط (FOV):</span>
                        <span className="font-mono text-slate-200">{cam.fovAngleDeg}° Cone</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الدقة:</span>
                        <span className="font-mono text-slate-200">{cam.resolution}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-500 text-[10px] truncate max-w-[140px]" dir="ltr">
                        {cam.streamUrl}
                      </span>
                      <button
                        onClick={() => onOpenMapAtLocation(cam.coordinates, 17)}
                        className="text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        تركيز
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fiber Routes & PoE Switches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>مسارات كابلات الألياف الضوئية (Fiber Optic Routes)</span>
                </h4>
                <div className="space-y-2">
                  {NETWORK_CCTV_TOPOLOGY.fiberRoutes.map(f => (
                    <div key={f.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-blue-400 font-bold">{f.id}</span>
                        <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">
                          فقد: {f.attenuationDb} dB/km
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px]">النوع: {f.fiberType}</div>
                      <div className="text-slate-500 text-[10px]">الحالة: {f.status} (مسار محمي ضد العوامل البيئية)</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>سويتشات التوزيع والميزانية الكهربائية (PoE Switches)</span>
                </h4>
                <div className="space-y-2">
                  {NETWORK_CCTV_TOPOLOGY.switches.map(sw => (
                    <div key={sw.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono">{sw.id}</span>
                        <span className="font-mono text-amber-400 text-[11px]">
                          المنافذ: {sw.portsInUse} / {sw.totalPorts}
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px]">{sw.model}</div>
                      <div className="text-slate-400 text-[10px]">ميزانية الطاقة: {sw.poeBudgetWatts} Watt PoE+</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOMAIN 04: Supply Chain GIS + Logistics + Inventory */}
        {/* ========================================================================= */}
        {selectedDomain === 'supply_chain' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">سلاسل التوريدات اللوجستية وإمدادات الفروع والمشروعات</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  رؤية مكانية حية للمستودعات المركزية، شاحنات النقل في الطريق، وأوامر الشراء والتسليم
                </p>
              </div>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs rounded-lg font-mono">
                Logistics & ERPNext Stock
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {SUPPLY_CHAIN_HUBS.map(hub => (
                <div key={hub.id} className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{hub.name}</h4>
                      <span className="font-mono text-[11px] text-amber-400">{hub.code}</span>
                    </div>
                    <button
                      onClick={() => onOpenMapAtLocation(hub.coordinates, 13)}
                      className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>الموقع الجغرافي</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-400 block">قيمة المخزون</span>
                      <strong className="text-xs font-mono text-emerald-400">
                        {(hub.inventoryValueEgp / 1000000).toFixed(1)}M ج.م
                      </strong>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-400 block">شحنات نشطة</span>
                      <strong className="text-xs font-mono text-cyan-400">{hub.activeShipmentsCount}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-400 block">نسبة الاستيفاء</span>
                      <strong className="text-xs font-mono text-amber-400">{hub.stockFulfillmentRate}%</strong>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-300 mb-2 text-xs">الشحنات وأوامر التسليم المرتبطة:</h5>
                    <div className="space-y-2">
                      {hub.recentDeliveries.map(del => (
                        <div key={del.trackingNumber} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-amber-400 font-bold">{del.trackingNumber}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                del.status === 'delivered'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                              }`}
                            >
                              {del.status === 'delivered' ? 'تم الوصول والتسليم' : `في الطريق (${del.eta})`}
                            </span>
                          </div>
                          <div className="text-white font-medium text-[11px]">{del.materialType}</div>
                          <div className="text-slate-400 text-[10px] flex justify-between">
                            <span>لوحة الشاحنة: {del.truckPlate}</span>
                            <span>إلى: {del.destination}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOMAIN 05: Electrical GIS + Smart Lighting + Energy Assets */}
        {/* ========================================================================= */}
        {selectedDomain === 'smart_light' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">الإنارة الذكية واللوحات الكهربائية ومراقبة الأحمال</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  إدارة دوائر MDBs، استهلاك الطاقة بالكيلوفولت أمبير (kVA)، وجداول التشغيل الأوتوماتيكية
                </p>
              </div>
              <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-lg font-mono">
                DALI / DMX Control & Energy Assets
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {SMART_LIGHTING_PANELS.map(panel => (
                <div key={panel.id} className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{panel.locationName}</h4>
                      <span className="font-mono text-amber-400 text-[11px]">{panel.panelCode}</span>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-[10px] text-slate-400 block">إجمالي الحمل</span>
                      <strong className="text-yellow-400 text-sm">{panel.totalLoadKva} kVA</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>معامل القدرة (Power Factor):</span>
                      <span className="font-mono text-emerald-400 font-bold">{panel.powerFactor}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>عدد كشافات الإنارة:</span>
                      <span className="font-mono text-slate-200">{panel.totalFixturesCount} كشاف LED</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>مستوى التعتيم (Dimming):</span>
                      <span className="font-mono text-amber-400 font-bold">{panel.dimmingLevelPercentage}%</span>
                    </div>
                    <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                      {panel.automatedSchedule}
                    </div>
                  </div>

                  {/* Interactive Circuits Switches */}
                  <div>
                    <h5 className="font-bold text-slate-300 mb-2">دوائر التوزيع والقواطع الذكية (تحكم فوري):</h5>
                    <div className="space-y-2">
                      {panel.circuits.map(c => {
                        const isEnergized = activeCircuits[c.circuitId] ?? true;
                        return (
                          <div
                            key={c.circuitId}
                            className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-amber-400">{c.circuitId}</span>
                                <span className="text-white font-medium">{c.zoneName}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500">
                                تيار: {isEnergized ? `${c.activeCurrentAmp}A` : '0.0A'} / قاطع {c.breakerRatingAmp}A
                              </span>
                            </div>

                            <button
                              onClick={() => toggleCircuit(c.circuitId)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                isEnergized
                                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}
                            >
                              {isEnergized ? 'مُفعّل (ON)' : 'مفصول (OFF)'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOMAIN 06: Smart Home / Azlexa + IoT + Indoor Digital Twin */}
        {/* ========================================================================= */}
        {selectedDomain === 'smart_home_azlexa' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">منظومة المنازل الذكية Azlexa والتوأم الرقمي الداخلي (Indoor GIS)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  هيكلة المباني إلى طوابق وغرف ومستشعرات حرارة وحركة ومشاهد أوتوماتيكية متزامنة
                </p>
              </div>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs rounded-lg font-mono">
                Azlexa OS & Indoor Spatial Hierarchy
              </span>
            </div>

            {AZLEXA_INDOOR_BUILDINGS.map(bld => (
              <div key={bld.id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-5">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white">{bld.name}</h4>
                    <span className="text-xs font-mono text-amber-400">{bld.code}</span>
                  </div>

                  {/* Floor Selector Buttons */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {bld.floors.map((flr, fi) => (
                      <button
                        key={fi}
                        onClick={() => setActiveFloorIndex(fi)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeFloorIndex === fi
                            ? 'bg-purple-600 text-white font-bold shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        طابق {flr.floorNumber}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rooms Grid in active floor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bld.floors[activeFloorIndex].rooms.map(room => (
                    <div key={room.roomId} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="font-bold text-white text-sm">{room.roomName}</span>
                        <div className="flex items-center gap-3 text-slate-300">
                          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                            <Thermometer className="w-3.5 h-3.5" />
                            <span>{room.tempCelsius}°C</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">رطوبة {room.humidity}%</span>
                        </div>
                      </div>

                      {/* Room Devices Switches */}
                      <div className="space-y-2">
                        {room.devices.map(dev => {
                          const isDevOn = deviceStates[dev.id] ?? dev.state;
                          return (
                            <div
                              key={dev.id}
                              className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-white font-medium">{dev.name}</div>
                                {dev.value && (
                                  <div className="text-[10px] text-purple-300 font-mono">القيمة: {dev.value}</div>
                                )}
                              </div>
                              <button
                                onClick={() => toggleDevice(dev.id)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                  isDevOn
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}
                              >
                                {isDevOn ? 'مشغل' : 'مغلق'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOMAIN 07: Manufacturing GIS + MES Traceability */}
        {/* ========================================================================= */}
        {selectedDomain === 'manufacturing_trace' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">التصنيع المترابط بالمواقع وتتبع تنفيذ المنتجات المعمارية</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ربط مصانع برج العرب و6 أكتوبر بمشروعات العزب وتتبع دورة التصنيع من الـ CAD حتى التركيب بالموقع
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg font-mono">
                MES Pipeline & Full Traceability
              </span>
            </div>

            <div className="space-y-6">
              {MANUFACTURING_PLANTS.map(plant => (
                <div key={plant.id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{plant.name}</h4>
                      <span className="text-[11px] text-slate-400">{plant.industrialCity}</span>
                    </div>
                    <button
                      onClick={() => onOpenMapAtLocation(plant.coordinates, 13)}
                      className="text-amber-400 hover:text-amber-300 font-semibold text-xs flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>عرض موقع المصنع</span>
                    </button>
                  </div>

                  {/* Production Lines */}
                  <div>
                    <h5 className="font-bold text-slate-300 mb-2">خطوط الإنتاج الصناعي النشطة:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {plant.productionLines.map(line => (
                        <div key={line.lineId} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-emerald-400 font-bold">{line.lineId}</span>
                            <span className="text-[10px] font-mono text-slate-400">استغلال {line.utilizationPercent}%</span>
                          </div>
                          <div className="text-white font-medium">{line.name}</div>
                          <div className="text-[10px] text-slate-400">الطاقة: {line.dailyCapacity}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MES Traceability Stages */}
                  <div>
                    <h5 className="font-bold text-slate-300 mb-2">أوامر الإنتاج وتتبع التوريد والتركيب بالمشروعات:</h5>
                    <div className="space-y-3">
                      {plant.activeProjectOrders.map(order => (
                        <div key={order.orderNumber} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="font-mono text-amber-400 font-bold">{order.orderNumber}</span>
                              <h6 className="text-white font-bold mt-0.5">{order.productName} ({order.quantity})</h6>
                            </div>
                            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {order.targetProject}
                            </span>
                          </div>

                          {/* 6 Stages Progress Tracker */}
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-1.5 pt-2">
                            {[
                              { key: 'cad_design', label: '1. تصميم CAD' },
                              { key: 'cnc_fabrication', label: '2. تشغيل CNC' },
                              { key: 'coating_assembly', label: '3. دهان وتجميع' },
                              { key: 'qa_inspection', label: '4. فحص الجودة QA' },
                              { key: 'dispatched_to_site', label: '5. شحن للموقع' },
                              { key: 'installed', label: '6. تركيب نهائي' }
                            ].map((stg, si) => {
                              const STAGES_ORDER = [
                                'cad_design',
                                'cnc_fabrication',
                                'coating_assembly',
                                'qa_inspection',
                                'dispatched_to_site',
                                'installed'
                              ];
                              const currentStageIdx = STAGES_ORDER.indexOf(order.stage);
                              const isCompleted = si <= currentStageIdx;
                              const isCurrent = si === currentStageIdx;

                              return (
                                <div
                                  key={stg.key}
                                  className={`p-1.5 rounded-lg text-center text-[10px] font-semibold border ${
                                    isCurrent
                                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold animate-pulse'
                                      : isCompleted
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                                  }`}
                                >
                                  {stg.label}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3D BIM Viewer Modal */}
      {selectedBim && (
        <Bim3DViewerModal
          isOpen={isBimModalOpen}
          onClose={() => setIsBimModalOpen(false)}
          location={{
            id: selectedBim.id,
            workspace_id: 'ws-alazab-eg-01',
            code: selectedBim.code,
            name: selectedBim.name,
            address: `${selectedBim.city} - موقع المشروع الإنشائي`,
            city: selectedBim.city,
            geom: { type: 'Point', coordinates: selectedBim.coordinates },
            status: 'active',
            layer: 'projects',
            metadata: {
              completion_percentage: selectedBim.progressPercentage
            },
            source: {
              system: 'erpnext',
              entity_type: 'Project',
              external_id: selectedBim.code,
              last_synced_at: new Date().toISOString()
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }}
        />
      )}
    </div>
  );
};
