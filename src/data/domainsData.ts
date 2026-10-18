import {
  EnterpriseDomainInfo,
  BimProjectDetail,
  FacilityAssetRecord,
  NetworkCctvTopology,
  SupplyChainHub,
  SmartLightingPanel,
  AzlexaIndoorBuilding,
  ManufacturingPlant
} from '../types/maps';

export const DOMAINS_INFO: EnterpriseDomainInfo[] = [
  {
    key: 'construction_bim',
    numberStr: '01',
    title_ar: 'المشروعات الإنشائية الحديثة',
    sub_ar: 'Construction GIS + BIM + Project Digital Twin',
    badge_en: 'Construction & BIM',
    description_ar: 'ربط المواقع بالمخططات المعمارية والإنشائية، مناطق التنفيذ، المستخلصات المالية، مراحل الإنجاز، معدات الموقع، وبيانات BIM والنماذج ثلاثية الأبعاد.',
    accentColor: '#3b82f6', // blue
    iconName: 'Building2'
  },
  {
    key: 'facility_cmms',
    numberStr: '02',
    title_ar: 'UberFix وإدارة المرافق',
    sub_ar: 'Facility GIS + CMMS + Asset Management',
    badge_en: 'Facility & CMMS',
    description_ar: 'مواقع المنشآت والمساحات والمعدات، أوامر الصيانة، حالة الأصول الهندسية، الفنيون، ومناطق التغطية، مع ربط سجلات الصيانة بالموقع الفعلي للأصل.',
    accentColor: '#f59e0b', // amber
    iconName: 'Wrench'
  },
  {
    key: 'network_cctv',
    numberStr: '03',
    title_ar: 'CCTV والشبكات المستدامة',
    sub_ar: 'Network GIS + CCTV + Infrastructure Topology',
    badge_en: 'CCTV & Network',
    description_ar: 'توزيع الكاميرات وأجهزة التسجيل والسويتشات والكابلات والألياف ونقاط الاتصال، مع تمثيل الطوبولوجيا، المسارات ونقاط الأعطال ومناطق تغطية الكاميرات.',
    accentColor: '#ef4444', // red
    iconName: 'Video'
  },
  {
    key: 'supply_chain',
    numberStr: '04',
    title_ar: 'سلسلة التوريدات وتشغيل الفروع',
    sub_ar: 'Supply Chain GIS + Logistics + Inventory',
    badge_en: 'Supply Chain & Logistics',
    description_ar: 'ربط الفروع باحتياجات التشغيل والمخزون والموردين والمستودعات والشحنات وأوامر الشراء والتسليم، مع رؤية جغرافية للتوريدات.',
    accentColor: '#06b6d4', // cyan
    iconName: 'Truck'
  },
  {
    key: 'smart_light',
    numberStr: '05',
    title_ar: 'Smart Light وتوريدات الكهرباء',
    sub_ar: 'Electrical GIS + Smart Lighting + Energy Assets',
    badge_en: 'Electrical & Lighting',
    description_ar: 'توزيع وحدات الإنارة واللوحات الكهربائية والدوائر ونقاط التغذية والأحمال، وربط المشروعات بقطع الغيار والتشغيل والصيانة.',
    accentColor: '#eab308', // yellow
    iconName: 'Zap'
  },
  {
    key: 'smart_home_azlexa',
    numberStr: '06',
    title_ar: 'Smart Home / Azlexa',
    sub_ar: 'Azlexa + IoT + Indoor Digital Twin',
    badge_en: 'Smart Home & Azlexa',
    description_ar: 'هيكلة المواقع إلى مبانٍ وطوابق وغرف وأجهزة، مع ربط أجهزة التحكم والمستشعرات والمشاهد الآلية وأنظمة المنازل الذكية.',
    accentColor: '#8b5cf6', // purple
    iconName: 'Home'
  },
  {
    key: 'manufacturing_trace',
    numberStr: '07',
    title_ar: 'التصنيع المترابط بالمواقع',
    sub_ar: 'Manufacturing GIS + MES Integration + Project Traceability',
    badge_en: 'Manufacturing & MES',
    description_ar: 'المصانع وخطوط الإنتاج والمنتجات ومكوناتها والطلبات المرتبطة بالمشروعات، مع تتبع التصنيع والتجهيز والشحن والتركيب في المواقع.',
    accentColor: '#10b981', // emerald
    iconName: 'Factory'
  }
];

// 01 Data
export const BIM_PROJECTS: BimProjectDetail[] = [
  {
    id: 'bim-01-alamein',
    code: 'PRJ-2026-ALM-09',
    name: 'أبراج العلمين الجديدة - التوأم الرقمي للواجهات والأعمال الإنشائية',
    city: 'العلمين الجديدة',
    coordinates: [28.948, 30.835],
    bimElementsCount: 14820,
    lodLevel: 'LOD 350',
    currentPhase: 'المرحلة الثالثة: تركيب تكسيات الألمنيوم والزجاج المزدوج المقوى',
    progressPercentage: 68,
    invoicingMilestones: [
      { title: 'مستخلص رقم 1: الأعمال الخرسانية والهيكل الإنشائي', amountEgp: 18500000, status: 'paid' },
      { title: 'مستخلص رقم 2: قطاعات الألمنيوم والسبايدر سيستم', amountEgp: 9400000, status: 'paid' },
      { title: 'مستخلص رقم 3: الألواح الزجاجية والعوازل الحرارية', amountEgp: 7200000, status: 'under_review' },
      { title: 'مستخلص رقم 4: التسليم الابتدائي ومحاضر الاختبار', amountEgp: 4100000, status: 'upcoming' }
    ],
    executionZones: [
      { name: 'القطاع الشمالي (البرج A - الواجهة البحرية)', status: 'ongoing', completion: 74 },
      { name: 'القطاع الأوسط (منطقة البوديوم والمول)', status: 'completed', completion: 100 },
      { name: 'القطاع الجنوبي (البرج B - الأبراج الفندقية)', status: 'ongoing', completion: 56 },
      { name: 'مهبط الطائرات العمودية والأسطح العليا', status: 'queued', completion: 15 }
    ],
    activeMachinery: [
      { type: 'ونش برجي Potain MDT 389', code: 'CRN-01', radiusMeters: 65, operator: 'كابتن محمود البنا' },
      { type: 'منصة تسلق واجهات Mast Climber #3', code: 'MC-03', radiusMeters: 18, operator: 'فني تشغيل: عزت رضوان' },
      { type: 'مضخة خرسانة ذراع 42 م Putzmeister', code: 'PMP-02', radiusMeters: 42, operator: 'سائق: عادل شحاتة' }
    ]
  },
  {
    id: 'bim-02-sidi-gaber',
    code: 'AZ-PROJ-2026-0028',
    name: 'أبو عوف سيدي جابر - المخطط التنفيذي والتشطيب التجاري',
    city: 'الإسكندرية',
    coordinates: [29.949, 31.216],
    bimElementsCount: 2340,
    lodLevel: 'LOD 300',
    currentPhase: 'المرحلة النهائية: توريد وتركيب وحدات الإضاءة الذكية والرفوف الخشبية',
    progressPercentage: 92,
    invoicingMilestones: [
      { title: 'مستخلص رقم 1: أعمال التكسير والتأسيس والكهرباء', amountEgp: 480000, status: 'paid' },
      { title: 'مستخلص رقم 2: تجليد الحوائط والأرضيات البورسلين', amountEgp: 520000, status: 'paid' },
      { title: 'مستخلص رقم 3: الديكورات ووحدات العرض والتسليم', amountEgp: 450000, status: 'under_review' }
    ],
    executionZones: [
      { name: 'صالة العرض الرئيسية ومنطقة الكاشير', status: 'completed', completion: 100 },
      { name: 'منطقة التحميص وركن الضيافة', status: 'ongoing', completion: 90 },
      { name: 'المخزن الخلفي ووحدة التبريد', status: 'completed', completion: 100 }
    ],
    activeMachinery: [
      { type: 'رافعة مقصية هيدروليكية للأسقف', code: 'SCL-01', radiusMeters: 8, operator: 'فني صيانة: تامر شوقي' }
    ]
  }
];

// 02 Data
export const FACILITY_ASSETS: FacilityAssetRecord[] = [
  {
    id: 'ast-01',
    code: 'CHL-001',
    name: 'مبرد مياه مركزي Carrier AquaSnap 120 Ton',
    facility: 'فرع ومجمع سيدي جابر الإسكندرية',
    locationPoint: [29.949, 31.216],
    healthScore: 78,
    assetCategory: 'HVAC',
    lastMaintenanceDate: '2026-09-20',
    nextScheduledDate: '2026-10-25',
    openWorkOrderId: 'UBERFIX-TKT-4029',
    assignedTechnician: 'م. كريم الشناوي',
    coverageZone: 'نطاق سيدي جابر المحطة'
  },
  {
    id: 'ast-02',
    code: 'ELV-004',
    name: 'مصعد ركاب بانورامي شندلر 1000 كجم',
    facility: 'برج الأطباء سيدي جابر',
    locationPoint: [29.950, 31.217],
    healthScore: 54,
    assetCategory: 'Elevators',
    lastMaintenanceDate: '2026-08-10',
    nextScheduledDate: '2026-10-18',
    openWorkOrderId: 'UBERFIX-TKT-4031',
    assignedTechnician: 'فني طوارئ: محمود الشريف',
    coverageZone: 'وسط الإسكندرية'
  },
  {
    id: 'ast-03',
    code: 'GEN-002',
    name: 'مولد كهربائي ديزل كاتربيلر 500 ك.ف.أ',
    facility: 'المكتب الفني سموحة الإسكندرية',
    locationPoint: [29.963, 31.216],
    healthScore: 92,
    assetCategory: 'Electrical',
    lastMaintenanceDate: '2026-10-05',
    nextScheduledDate: '2026-11-05',
    assignedTechnician: 'فني أحمد عبد العال',
    coverageZone: 'شرق الإسكندرية وسموحة'
  },
  {
    id: 'ast-04',
    code: 'PMP-008',
    name: 'مجموعة مضخات مكافحة الحريق Grundfos Dual Electric+Diesel',
    facility: 'مستودع الميناء المنشية',
    locationPoint: [29.897, 31.198],
    healthScore: 88,
    assetCategory: 'Fire Safety',
    lastMaintenanceDate: '2026-09-15',
    nextScheduledDate: '2026-10-30',
    assignedTechnician: 'م. إيهاب ممدوح',
    coverageZone: 'غرب الإسكندرية والموانئ'
  }
];

// 03 Data
export const NETWORK_CCTV_TOPOLOGY: NetworkCctvTopology = {
  id: 'top-alex-central',
  siteName: 'المجمع التقني والمقرات - سيدي جابر وسموحة',
  coordinates: [29.949, 31.216],
  cameras: [
    {
      id: 'CAM-SG-01',
      model: 'Hikvision DS-2DE4425IW-DE PTZ 4MP',
      headingDeg: 45,
      fovAngleDeg: 80,
      resolution: '2560x1440 @ 30fps',
      status: 'online',
      streamUrl: 'rtsp://stream.alazab.com/sg/cam01',
      coordinates: [29.949, 31.216]
    },
    {
      id: 'CAM-SG-02',
      model: 'Hikvision DarkFighter Bullet 8MP 4K',
      headingDeg: 190,
      fovAngleDeg: 105,
      resolution: '3840x2160 @ 25fps',
      status: 'online',
      streamUrl: 'rtsp://stream.alazab.com/sg/cam02',
      coordinates: [29.9485, 31.2155]
    },
    {
      id: 'CAM-SM-03',
      model: 'Hikvision AcuSense Dome 4MP',
      headingDeg: 310,
      fovAngleDeg: 95,
      resolution: '2560x1440 @ 30fps',
      status: 'online',
      streamUrl: 'rtsp://stream.alazab.com/sm/cam03',
      coordinates: [29.962, 31.215]
    }
  ],
  switches: [
    {
      id: 'SW-CORE-01',
      model: 'Cisco Catalyst 9300 48P PoE+',
      poeBudgetWatts: 740,
      portsInUse: 42,
      totalPorts: 48,
      status: 'healthy'
    },
    {
      id: 'SW-DIST-02',
      model: 'Ubiquiti UniFi Pro Max 24 PoE',
      poeBudgetWatts: 400,
      portsInUse: 19,
      totalPorts: 24,
      status: 'healthy'
    }
  ],
  fiberRoutes: [
    {
      id: 'FBR-SG-SM-01',
      fromPoint: [29.949, 31.216], // Sidi Gaber
      toPoint: [29.962, 31.215],   // Smouha
      fiberType: 'Armored Outdoor',
      attenuationDb: 0.32,
      status: 'optimal'
    },
    {
      id: 'FBR-SG-MIA-02',
      fromPoint: [29.949, 31.216],
      toPoint: [29.988, 31.235], // Miami Hub
      fiberType: 'SingleMode 24-core',
      attenuationDb: 0.48,
      status: 'optimal'
    }
  ]
};

// 04 Data
export const SUPPLY_CHAIN_HUBS: SupplyChainHub[] = [
  {
    id: 'hub-01-borg',
    code: 'HUB-BORG-CENTRAL',
    name: 'المستودع اللوجستي المركزي - برج العرب الصناعية',
    type: 'central_warehouse',
    coordinates: [29.673, 30.916],
    inventoryValueEgp: 48500000,
    activeShipmentsCount: 8,
    stockFulfillmentRate: 98.4,
    openPurchaseOrders: 14,
    recentDeliveries: [
      {
        trackingNumber: 'TRK-2026-901',
        origin: 'مستودع برج العرب المركزي',
        destination: 'مشروع أبراج العلمين الجديدة',
        materialType: 'قطاعات ألمنيوم معالجة وواجهات زجاجية',
        truckPlate: 'س ق ج 7412',
        status: 'in_transit',
        eta: '45 دقيقة',
        currentCoords: [29.215, 30.865]
      },
      {
        trackingNumber: 'TRK-2026-904',
        origin: 'مستودع برج العرب المركزي',
        destination: 'موقع أبو عوف سيدي جابر',
        materialType: 'لوحات إنارة ذكية ومفاتيح Schneider Electric',
        truckPlate: 'ر ف ع 3819',
        status: 'delivered',
        eta: 'وصلت الموقع',
        currentCoords: [29.949, 31.216]
      }
    ]
  },
  {
    id: 'hub-02-mansoura',
    code: 'HUB-MANS-DELTA',
    name: 'مركز الدعم والتوزيع اللوجستي للدلتا - المنصورة',
    type: 'regional_depot',
    coordinates: [31.378, 31.040],
    inventoryValueEgp: 19200000,
    activeShipmentsCount: 3,
    stockFulfillmentRate: 94.1,
    openPurchaseOrders: 6,
    recentDeliveries: [
      {
        trackingNumber: 'TRK-2026-885',
        origin: 'مركز المنصورة',
        destination: 'فرع طنطا التجاري',
        materialType: 'كابلات نحاسية معزولة ومواسير EMT',
        truckPlate: 'د ق ط 1190',
        status: 'in_transit',
        eta: '30 دقيقة',
        currentCoords: [31.185, 30.890]
      }
    ]
  }
];

// 05 Data
export const SMART_LIGHTING_PANELS: SmartLightingPanel[] = [
  {
    id: 'pnl-01-sg',
    panelCode: 'MDB-SMART-SG-01',
    locationName: 'لوحة التوزيع الذكية الرئيسية - سيدي جابر',
    coordinates: [29.949, 31.216],
    totalLoadKva: 84.5,
    powerFactor: 0.96,
    totalFixturesCount: 168,
    dimmingLevelPercentage: 75,
    automatedSchedule: 'جدول توفير الطاقة: 100% (9 ص - 7 م)، 40% (7 م - 12 ص)، 15% طوارئ ليلاً',
    circuits: [
      { circuitId: 'C1-TRACK', zoneName: 'سبوت لايت صالة العرض والممرات', breakerRatingAmp: 32, activeCurrentAmp: 21.4, status: 'energized' },
      { circuitId: 'C2-FAÇADE', zoneName: 'إضاءة الواجهة الخارجية واللوجو', breakerRatingAmp: 25, activeCurrentAmp: 16.2, status: 'energized' },
      { circuitId: 'C3-HVAC', zoneName: 'تغذية وحدات التبريد الداخلي', breakerRatingAmp: 63, activeCurrentAmp: 44.8, status: 'energized' },
      { circuitId: 'C4-EMERG', zoneName: 'إنارة الطوارئ ومخارج الهروب', breakerRatingAmp: 16, activeCurrentAmp: 4.1, status: 'energized' }
    ],
    sparePartsInventory: [
      { item: 'مشغل ليد DALI Driver 100W Tridonic', quantity: 18, compatibility: 'وحدات المسار المغناطيسي' },
      { item: 'قاطع تيار ذكي Schneider Acti9 32A', quantity: 6, compatibility: 'لوحات MDB' }
    ]
  },
  {
    id: 'pnl-02-alm',
    panelCode: 'MDB-FACADE-ALM-09',
    locationName: 'لوحة إنارة الواجهات المعمارية LED - أبراج العلمين',
    coordinates: [28.948, 30.835],
    totalLoadKva: 240.0,
    powerFactor: 0.98,
    totalFixturesCount: 1240,
    dimmingLevelPercentage: 85,
    automatedSchedule: 'مزامنة فلكية (غروب الشمس حتى الشروق) مع عروض ضوئية وطنية',
    circuits: [
      { circuitId: 'Z1-TOWER-A', zoneName: 'الخطوط الرأسية - البرج الشمالي', breakerRatingAmp: 100, activeCurrentAmp: 78.5, status: 'energized' },
      { circuitId: 'Z2-TOWER-B', zoneName: 'الخطوط الرأسية - البرج الجنوبي', breakerRatingAmp: 100, activeCurrentAmp: 74.1, status: 'energized' },
      { circuitId: 'Z3-CROWN', zoneName: 'تاج البرج وإنارة الملاحة الجوية', breakerRatingAmp: 40, activeCurrentAmp: 22.0, status: 'energized' }
    ],
    sparePartsInventory: [
      { item: 'وحدة بكسل DMX RGBW IP67 Cree', quantity: 80, compatibility: 'شرائط الواجهة' }
    ]
  }
];

// 06 Data
export const AZLEXA_INDOOR_BUILDINGS: AzlexaIndoorBuilding[] = [
  {
    id: 'azl-bld-01',
    code: 'AZL-HQ-CAI',
    buildingName: 'المقر الإداري الذكي لمجموعة العزب - المهندسين',
    name: 'المقر الإداري الذكي لمجموعة العزب - المهندسين',
    coordinates: [31.205, 30.056],
    floorsCount: 4,
    activeScenes: ['وضع العمل الصباحي (Business Mode)', 'وضع ترشيد الطاقة المسائي', 'أمان الإغلاق الليلي'],
    floors: [
      {
        floorNumber: 0,
        floorName: 'الطابق الأرضي: الاستقبال وصالة العرض الهندسية',
        rooms: [
          {
            roomId: 'rm-lobby',
            roomName: 'بهو الاستقبال الرئيسي',
            tempCelsius: 22.5,
            humidity: 48,
            motionDetected: true,
            devices: [
              { id: 'dev-l1', name: 'إنارة البهو المعمارية', type: 'dimmer', state: true, value: 80 },
              { id: 'dev-ac1', name: 'تكييف الاستقبال المركزي', type: 'thermostat', state: true, value: 22 },
              { id: 'dev-door', name: 'الباب الزجاجي الأوتوماتيكي', type: 'relay', state: true }
            ]
          },
          {
            roomId: 'rm-showroom',
            roomName: 'معرض المواد والتشطيبات الذكية',
            tempCelsius: 23.0,
            humidity: 50,
            motionDetected: true,
            devices: [
              { id: 'dev-show-light', name: 'إضاءة سبوت المعروضات', type: 'dimmer', state: true, value: 100 },
              { id: 'dev-screen', name: 'شاشة العرض التفاعلية BIM', type: 'relay', state: true }
            ]
          }
        ]
      },
      {
        floorNumber: 1,
        floorName: 'الطابق الأول: المكاتب الفنية وغرفة الخوادم',
        rooms: [
          {
            roomId: 'rm-server',
            roomName: 'غرفة السيرفرات والبنية الرقمية GIS',
            tempCelsius: 18.2,
            humidity: 42,
            motionDetected: false,
            devices: [
              { id: 'dev-srv-ac1', name: 'تكييف دقيق رئيسي PAC-1', type: 'thermostat', state: true, value: 18 },
              { id: 'dev-srv-ac2', name: 'تكييف دقيق احتياطي PAC-2', type: 'thermostat', state: true, value: 19 },
              { id: 'dev-ups', name: 'نظام إدارة بطاريات UPS', type: 'sensor', state: true, value: '98% مشحونة' }
            ]
          },
          {
            roomId: 'rm-eng',
            roomName: 'المكتب الهندسي وغرفة العمليات',
            tempCelsius: 23.5,
            humidity: 46,
            motionDetected: true,
            devices: [
              { id: 'dev-eng-light', name: 'إنارة مكاتب المهندسين', type: 'dimmer', state: true, value: 90 },
              { id: 'dev-curtain', name: 'ستائر التحكم الشمسي الآلية', type: 'curtain', state: true, value: 'مفتوحة 60%' }
            ]
          }
        ]
      }
    ]
  }
];

// 07 Data
export const MANUFACTURING_PLANTS: ManufacturingPlant[] = [
  {
    id: 'mfg-01-borg',
    plantCode: 'PLANT-BORG-01',
    name: 'مجمع مصانع العزب للزجاج المعماري والألمنيوم (Borg El Arab)',
    industrialCity: 'مدينة برج العرب الجديدة، المنطقة الصناعية الثالثة',
    coordinates: [29.678, 30.912],
    productionLines: [
      { lineId: 'L1-CNC', name: 'خط قص وتفريغ قطاعات الألمنيوم CNC الألماني', currentProduct: 'قطاعات واجهات كورتن وول مخصصة', dailyCapacity: '450 متر طولي', utilizationPercent: 88 },
      { lineId: 'L2-TEMPER', name: 'فرن معالجة وسيكوريت الزجاج المزدوج', currentProduct: 'زجاج مقوى عازل حرارياً Double Glazed', dailyCapacity: '620 متر مربع', utilizationPercent: 92 },
      { lineId: 'L3-COAT', name: 'خط الدهان الإلكتروستاتيكي وبودرة PVDF', currentProduct: 'دهان مقاوم للملوحة والعوامل البحرية', dailyCapacity: '800 متر طولي', utilizationPercent: 79 }
    ],
    activeProjectOrders: [
      {
        orderNumber: 'MES-ORD-2026-081',
        targetProject: 'أبراج العلمين الجديدة (PRJ-2026-ALM-09)',
        targetProjectLocation: [28.948, 30.835],
        productName: 'ألواح واجهات زجاجية مزدوجة Low-E 32mm',
        quantity: '1,450 م²',
        stage: 'dispatched_to_site',
        progressPercentage: 90,
        estimatedDeliveryDate: '2026-10-18'
      },
      {
        orderNumber: 'MES-ORD-2026-092',
        targetProject: 'أبو عوف سيدي جابر (AZ-PROJ-2026-0028)',
        targetProjectLocation: [29.949, 31.216],
        productName: 'واجهة سيكوريت 12 مم مع أبواب أوتوماتيكية',
        quantity: '180 م²',
        stage: 'installed',
        progressPercentage: 100,
        estimatedDeliveryDate: 'تم التركيب'
      }
    ]
  },
  {
    id: 'mfg-02-october',
    plantCode: 'PLANT-OCT-02',
    name: 'مصنع العزب للأعمال الخشبية والتجاليد الفاخرة (6th October)',
    industrialCity: 'مدينة 6 أكتوبر، المنطقة الصناعية الرابعة، الجيزة',
    coordinates: [30.885, 29.912],
    productionLines: [
      { lineId: 'L1-WOOD', name: 'خط النجارة الدقيقة والقص بالليزر 5-Axis', currentProduct: 'أرفف خشبية وقواطيع ديكورية', dailyCapacity: '120 وحدة', utilizationPercent: 84 },
      { lineId: 'L2-LACQUER', name: 'كابينة دهان الأكريليك واللاكيه المعالج', currentProduct: 'تشطيبات مقاومة للرطوبة والحرائق', dailyCapacity: '85 قطعة', utilizationPercent: 75 }
    ],
    activeProjectOrders: [
      {
        orderNumber: 'MES-ORD-2026-104',
        targetProject: 'بالم هيلز أكتوبر فيلات (AZ-PHO-V12)',
        targetProjectLocation: [30.952, 29.986],
        productName: 'تجاليد أخشاب أرو ماسيف وأبواب بارتفاع 3 أمتار',
        quantity: '48 باب وفيلا',
        stage: 'coating_assembly',
        progressPercentage: 70,
        estimatedDeliveryDate: '2026-10-22'
      }
    ]
  }
];
