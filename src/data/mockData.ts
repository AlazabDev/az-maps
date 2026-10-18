import { GeoLocation, GeoLayer, GeoFence, McpToolDefinition, ApiEndpointSpec, SyncEvent } from '../types/maps';

export const INITIAL_LAYERS: GeoLayer[] = [
  {
    id: 'layer-proj-01',
    workspace_id: 'ws-alazab-eg-01',
    key: 'projects',
    name_ar: 'المشروعات الهندسية (ERPNext / Daftra)',
    name_en: 'Engineering Projects',
    description_ar: 'مواقع مشروعات التشييد، التشطيبات والواجهات المربوطة بسجلات ERPNext وأوامر Daftra',
    layer_type: 'point',
    visibility: 'public',
    color: '#3b82f6', // blue-500
    icon: 'Building2',
    enabled: true,
    feature_count: 6,
    source_system: 'erpnext'
  },
  {
    id: 'layer-uberfix-01',
    workspace_id: 'ws-alazab-eg-01',
    key: 'uberfix',
    name_ar: 'صيانة ومواقع UberFix',
    name_en: 'UberFix Maintenance Orders',
    description_ar: 'طلبات الصيانة الميدانية، البلاغات المفتوحة ومواقع الفنيين المكلفين',
    layer_type: 'point',
    visibility: 'public',
    color: '#f59e0b', // amber-500
    icon: 'Wrench',
    enabled: true,
    feature_count: 5,
    source_system: 'uberfix'
  },
  {
    id: 'layer-branches-01',
    workspace_id: 'ws-alazab-eg-01',
    key: 'branches',
    name_ar: 'فروع ومقرات العزب',
    name_en: 'Alazab Branches & Offices',
    description_ar: 'المقرات الإدارية، المكاتب الفنية والمستودعات المركزية في المحافظات',
    layer_type: 'point',
    visibility: 'public',
    color: '#10b981', // emerald-500
    icon: 'Landmark',
    enabled: true,
    feature_count: 4,
    source_system: 'central_id'
  },
  {
    id: 'layer-assets-01',
    workspace_id: 'ws-alazab-eg-01',
    key: 'assets',
    name_ar: 'المعدات والأصول الثقيلة',
    name_en: 'Heavy Machinery & Assets',
    description_ar: 'الأوناش البرجية، مضخات الخرسانة، ومولدات الطاقة الميدانية',
    layer_type: 'point',
    visibility: 'private',
    color: '#8b5cf6', // purple-500
    icon: 'Cpu',
    enabled: true,
    feature_count: 3,
    source_system: 'erpnext'
  },
  {
    id: 'layer-fleet-01',
    workspace_id: 'ws-alazab-eg-01',
    key: 'fleet',
    name_ar: 'أسطول التشغيل الميداني',
    name_en: 'Fleet & Mobile Workshops',
    description_ar: 'مركبات الصيانة السريعة ووحدات المسح المجهزة',
    layer_type: 'point',
    visibility: 'private',
    color: '#06b6d4', // cyan-500
    icon: 'Truck',
    enabled: true,
    feature_count: 3,
    source_system: 'uberfix'
  },
  {
    id: 'layer-geofence-01',
    workspace_id: 'ws-alazab-eg-01',
    key: 'geofences',
    name_ar: 'نطاقات الخدمة (Geofences)',
    name_en: 'Service Geofences & Buffers',
    description_ar: 'نطاقات التغطية المكانية، دوائر استجابة 5 كم والحدود التشغيلية',
    layer_type: 'polygon',
    visibility: 'public',
    color: '#ec4899', // pink-500
    icon: 'Radio',
    enabled: true,
    feature_count: 3,
    source_system: 'manual'
  },
  {
    id: 'layer-hikvision-01',
    workspace_id: 'ws-alazab-eg-01',
    key: 'surveillance',
    name_ar: 'مراقبة المواقع (Hikvision)',
    name_en: 'Hikvision Site Surveillance',
    description_ar: 'كاميرات المراقبة الجغرافية ومؤشرات الاتصال المباشر',
    layer_type: 'point',
    visibility: 'restricted',
    color: '#ef4444', // red-500
    icon: 'Video',
    enabled: true,
    feature_count: 3,
    source_system: 'hikvision'
  }
];

export const INITIAL_LOCATIONS: GeoLocation[] = [
  // 1. Exact entity from the user specification!
  {
    id: 'c5e347a2-6c37-4b81-8aa6-529d3b1c630e',
    workspace_id: 'ws-alazab-eg-01',
    code: 'AZ-AUF-SG',
    name: 'أبو عوف - سيدي جابر',
    name_en: 'Abu Auf - Sidi Gaber',
    address: 'شارع المشير أحمد إسماعيل، سيدي جابر، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.949, 31.216] // [lng, lat]
    },
    status: 'active',
    layer: 'projects',
    metadata: {
      category: 'تشطيبات تجارية وتجهيز',
      completion_percentage: 92,
      budget_egp: 1450000,
      contact_person: 'م. سامح القاضي',
      phone: '+20 100 123 4567'
    },
    source: {
      system: 'daftra',
      entity_type: 'work_order',
      external_id: 'AZ-PROJ-2026-0028',
      last_synced_at: '2026-10-17T06:30:00Z'
    },
    created_at: '2026-02-10T08:00:00Z',
    updated_at: '2026-10-16T14:20:00Z'
  },
  // 2. New Alamein Towers Project (ERPNext)
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    workspace_id: 'ws-alazab-eg-01',
    code: 'AZ-ALM-T01',
    name: 'أبراج العلمين الجديدة - الواجهات الزجاجية',
    name_en: 'New Alamein Towers - Facades',
    address: 'المنطقة الشاطئية، مدينة العلمين الجديدة، مطروح',
    city: 'العلمين الجديدة',
    geom: {
      type: 'Point',
      coordinates: [28.948, 30.835]
    },
    status: 'in_progress',
    layer: 'projects',
    metadata: {
      category: 'إنشاءات كبرى وتكسيات زجاجية',
      completion_percentage: 68,
      budget_egp: 28400000,
      contact_person: 'د.م. أيمن العزب',
      phone: '+20 122 987 6543'
    },
    source: {
      system: 'erpnext',
      entity_type: 'Project',
      external_id: 'PRJ-2026-ALM-09',
      last_synced_at: '2026-10-17T05:00:00Z'
    },
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2026-10-16T11:15:00Z'
  },
  // 3. Palm Hills October Residential (ERPNext)
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    workspace_id: 'ws-alazab-eg-01',
    code: 'AZ-PHO-V12',
    name: 'بالم هيلز أكتوبر - مجمع الفيلات النماذج الخاصة',
    name_en: 'Palm Hills October - Luxury Villas',
    address: 'طريق التحرير، 6 أكتوبر، الجيزة',
    city: 'الجيزة',
    geom: {
      type: 'Point',
      coordinates: [30.952, 29.986]
    },
    status: 'active',
    layer: 'projects',
    metadata: {
      category: 'تشطيبات معمارية متكاملة',
      completion_percentage: 84,
      budget_egp: 16200000,
      contact_person: 'م. شريف عبد الرازق'
    },
    source: {
      system: 'erpnext',
      entity_type: 'Project',
      external_id: 'PRJ-2025-PHO-34',
      last_synced_at: '2026-10-16T22:00:00Z'
    },
    created_at: '2025-08-15T09:00:00Z',
    updated_at: '2026-10-15T18:00:00Z'
  },
  // 4. New Administrative Capital Commercial Mall
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    workspace_id: 'ws-alazab-eg-01',
    code: 'AZ-NAC-C05',
    name: 'العاصمة الإدارية - مول الأعمال والمال',
    name_en: 'New Admin Capital - Financial Mall',
    address: 'حي المال والأعمال، العاصمة الإدارية الجديدة',
    city: 'القاهرة',
    geom: {
      type: 'Point',
      coordinates: [31.733, 30.015]
    },
    status: 'in_progress',
    layer: 'projects',
    metadata: {
      category: 'أعمال كهروميكانيكية MEP وتكييف مركزي',
      completion_percentage: 45,
      budget_egp: 41000000,
      contact_person: 'م. هشام نصير'
    },
    source: {
      system: 'erpnext',
      entity_type: 'Project',
      external_id: 'PRJ-2026-NAC-102',
      last_synced_at: '2026-10-17T01:30:00Z'
    },
    created_at: '2026-01-05T07:30:00Z',
    updated_at: '2026-10-16T19:40:00Z'
  },

  // UberFix Maintenance Orders
  {
    id: 'uf-ticket-4029',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4029',
    name: 'بلاغ صيانة: تسريب مياه وحدة التكييف المركزي - فرع سيدي جابر',
    name_en: 'HVAC Leakage - Sidi Gaber Branch',
    address: 'سيدي جابر المحطة، عمارة الأطباء، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.946, 31.214]
    },
    status: 'in_progress',
    layer: 'uberfix',
    metadata: {
      issue_type: 'كهروميكانيك / تكييف',
      priority: 'high',
      assigned_technician: 'م. كريم الشناوي (فني تكييف أول)',
      phone: '+20 102 345 6789'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4029',
      last_synced_at: '2026-10-17T07:05:00Z'
    },
    created_at: '2026-10-17T06:10:00Z',
    updated_at: '2026-10-17T07:05:00Z'
  },
  {
    id: 'uf-ticket-4033',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4033',
    name: 'عطل لوحة التوزيع الرئيسية - مستودع الميناء المنشية',
    name_en: 'Main Electrical Panel Fault - Mansheya Port',
    address: 'بوابة 10، ميناء الإسكندرية، المنشية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.897, 31.198]
    },
    status: 'pending',
    layer: 'uberfix',
    metadata: {
      issue_type: 'كهرباء قوى ومحولات',
      priority: 'critical',
      assigned_technician: 'فني أحمد عبد العال',
      phone: '+20 111 223 3445'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4033',
      last_synced_at: '2026-10-17T06:45:00Z'
    },
    created_at: '2026-10-17T05:30:00Z',
    updated_at: '2026-10-17T06:45:00Z'
  },
  {
    id: 'uf-ticket-4045',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4045',
    name: 'معايرة مضخة الضغط العالي - سموحة جرين بلازا',
    name_en: 'High Pressure Pump Calibration - Smouha',
    address: 'شارع 14 مايو، سموحة، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.965, 31.218]
    },
    status: 'active',
    layer: 'uberfix',
    metadata: {
      issue_type: 'صحي ومضخات غاطسة',
      priority: 'medium',
      assigned_technician: 'م. إيهاب ممدوح'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4045',
      last_synced_at: '2026-10-16T20:00:00Z'
    },
    created_at: '2026-10-16T15:20:00Z',
    updated_at: '2026-10-16T20:00:00Z'
  },
  // Additional high-density tickets for heatmap clusters
  {
    id: 'uf-ticket-4030',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4030',
    name: 'عطل وحدة تبريد مجمع سيدي جابر التجاري',
    name_en: 'Commercial Chiller Overhaul - Sidi Gaber',
    address: 'محطة ترام سيدي جابر، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.948, 31.215]
    },
    status: 'pending',
    layer: 'uberfix',
    metadata: {
      issue_type: 'تكييف وتبريد',
      priority: 'high',
      assigned_technician: 'م. كريم الشناوي'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4030',
      last_synced_at: '2026-10-17T06:50:00Z'
    },
    created_at: '2026-10-17T06:15:00Z',
    updated_at: '2026-10-17T06:50:00Z'
  },
  {
    id: 'uf-ticket-4031',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4031',
    name: 'توقف مصعد برج الأطباء - سيدي جابر',
    name_en: 'Elevator Emergency - Sidi Gaber Medical',
    address: 'شارع المشير إسماعيل، سيدي جابر، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.950, 31.217]
    },
    status: 'in_progress',
    layer: 'uberfix',
    metadata: {
      issue_type: 'مصاعد وكهروميكانيك',
      priority: 'critical',
      assigned_technician: 'فني طوارئ: محمود الشريف'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4031',
      last_synced_at: '2026-10-17T07:15:00Z'
    },
    created_at: '2026-10-17T06:40:00Z',
    updated_at: '2026-10-17T07:15:00Z'
  },
  {
    id: 'uf-ticket-4046',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4046',
    name: 'صيانة وقائية لمولد الديزل الاحتياطي - نادي سموحة',
    name_en: 'Backup Diesel Generator Service - Smouha',
    address: 'ميدان فيكتور عمانويل، سموحة، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.963, 31.216]
    },
    status: 'active',
    layer: 'uberfix',
    metadata: {
      issue_type: 'مولدات ومحطات طاقة',
      priority: 'medium',
      assigned_technician: 'فني أحمد عبد العال'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4046',
      last_synced_at: '2026-10-17T05:30:00Z'
    },
    created_at: '2026-10-17T04:00:00Z',
    updated_at: '2026-10-17T05:30:00Z'
  },
  {
    id: 'uf-ticket-4047',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4047',
    name: 'إصلاح لوحة التحكم الذكية - مجمع سموحة السكني',
    name_en: 'Smart BMS Panel Repair - Smouha Compound',
    address: 'شارع ألبرت الأول، سموحة، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.967, 31.214]
    },
    status: 'pending',
    layer: 'uberfix',
    metadata: {
      issue_type: 'تحكم آلي وأنظمة ذكية',
      priority: 'high',
      assigned_technician: 'م. إيهاب ممدوح'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4047',
      last_synced_at: '2026-10-17T06:20:00Z'
    },
    created_at: '2026-10-17T05:50:00Z',
    updated_at: '2026-10-17T06:20:00Z'
  },
  {
    id: 'uf-ticket-4034',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4034',
    name: 'خلل كهربائي في ونش الرصيف البحري - ميناء الإسكندرية',
    name_en: 'Quay Crane Electrical Trip - Alexandria Port',
    address: 'رصيف 22، ميناء غرب، المنشية، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.894, 31.196]
    },
    status: 'in_progress',
    layer: 'uberfix',
    metadata: {
      issue_type: 'معدات بحرية ورافعات',
      priority: 'critical',
      assigned_technician: 'فريق التدخل السريع للموانئ'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4034',
      last_synced_at: '2026-10-17T07:10:00Z'
    },
    created_at: '2026-10-17T06:30:00Z',
    updated_at: '2026-10-17T07:10:00Z'
  },
  {
    id: 'uf-ticket-4050',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4050',
    name: 'تلف كابل التغذية الأرضي - فرع ميامي',
    name_en: 'Underground Feeder Cable Damage - Miami',
    address: 'شارع جمال عبد الناصر، ميامي، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.988, 31.235]
    },
    status: 'pending',
    layer: 'uberfix',
    metadata: {
      issue_type: 'شبكات كهرباء أرضية',
      priority: 'high',
      assigned_technician: 'فني طوارئ: أحمد عبد العال'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4050',
      last_synced_at: '2026-10-17T06:40:00Z'
    },
    created_at: '2026-10-17T05:00:00Z',
    updated_at: '2026-10-17T06:40:00Z'
  },
  {
    id: 'uf-ticket-4060',
    workspace_id: 'ws-alazab-eg-01',
    code: 'UF-2026-4060',
    name: 'ارتفاع حرارة غرفة السيرفرات - المقر الرئيسي المهندسين',
    name_en: 'Server Room Thermal Alert - Mohandessin HQ',
    address: 'شارع جامعة الدول، المهندسين، الجيزة',
    city: 'الجيزة',
    geom: {
      type: 'Point',
      coordinates: [31.206, 30.057]
    },
    status: 'in_progress',
    layer: 'uberfix',
    metadata: {
      issue_type: 'تكييف دقيق وغرف خوادم',
      priority: 'critical',
      assigned_technician: 'م. طارق كمال (مهندس أنظمة)'
    },
    source: {
      system: 'uberfix',
      entity_type: 'ticket',
      external_id: 'UBERFIX-TKT-4060',
      last_synced_at: '2026-10-17T07:20:00Z'
    },
    created_at: '2026-10-17T06:55:00Z',
    updated_at: '2026-10-17T07:20:00Z'
  },

  // Branches & Hubs
  {
    id: 'br-hq-cairo',
    workspace_id: 'ws-alazab-eg-01',
    code: 'AZ-HQ-CAI',
    name: 'المقر الرئيسي لمجموعة العزب - المهندسين',
    name_en: 'Alazab Group Headquarters - Mohandessin',
    address: 'شارع جامعة الدول العربية، المهندسين، الجيزة',
    city: 'الجيزة',
    geom: {
      type: 'Point',
      coordinates: [31.205, 30.056]
    },
    status: 'active',
    layer: 'branches',
    metadata: {
      category: 'المقر التنفيذي المركزي',
      contact_person: 'الإدارة العامة',
      phone: '+20 2 3760 0000'
    },
    source: {
      system: 'central_id',
      entity_type: 'Branch',
      external_id: 'BR-001',
      last_synced_at: '2026-10-17T00:00:00Z'
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2026-10-17T00:00:00Z'
  },
  {
    id: 'br-eng-alex',
    workspace_id: 'ws-alazab-eg-01',
    code: 'AZ-BR-ALX',
    name: 'المكتب الفني والهندسي للإسكندرية والساحل - سموحة',
    name_en: 'Alexandria Technical Office - Smouha',
    address: 'ميدان فيكتور عمانويل، سموحة، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.962, 31.215]
    },
    status: 'active',
    layer: 'branches',
    metadata: {
      category: 'إدارة العمليات الهندسية',
      contact_person: 'م. طارق العزب',
      phone: '+20 3 425 1100'
    },
    source: {
      system: 'central_id',
      entity_type: 'Branch',
      external_id: 'BR-002',
      last_synced_at: '2026-10-17T00:00:00Z'
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2026-10-17T00:00:00Z'
  },
  {
    id: 'br-hub-delta',
    workspace_id: 'ws-alazab-eg-01',
    code: 'AZ-HUB-MANS',
    name: 'مركز الدعم اللوجستي للدلتا - المنصورة',
    name_en: 'Delta Logistics Hub - Mansoura',
    address: 'طريق المحلة - المنصورة السريع، الدقهلية',
    city: 'المنصورة',
    geom: {
      type: 'Point',
      coordinates: [31.378, 31.040]
    },
    status: 'active',
    layer: 'branches',
    metadata: {
      category: 'توزيع وتخزين المعدات',
      contact_person: 'أ. عادل النجار'
    },
    source: {
      system: 'central_id',
      entity_type: 'Branch',
      external_id: 'BR-003',
      last_synced_at: '2026-10-17T00:00:00Z'
    },
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2026-10-17T00:00:00Z'
  },

  // Assets (Heavy Machinery)
  {
    id: 'asset-crane-01',
    workspace_id: 'ws-alazab-eg-01',
    code: 'AST-CRN-389',
    name: 'ونش برجي Potain MDT 389 - موقع العلمين',
    name_en: 'Potain MDT 389 Top-Slewing Crane',
    address: 'المنطقة الشاطئية، العلمين الجديدة',
    city: 'العلمين الجديدة',
    geom: {
      type: 'Point',
      coordinates: [28.947, 30.836]
    },
    status: 'active',
    layer: 'assets',
    metadata: {
      asset_model: 'Potain MDT 389 L16',
      category: 'معدات رفع ثقيلة',
      last_ping: 'منذ 4 دقائق'
    },
    source: {
      system: 'erpnext',
      entity_type: 'Asset',
      external_id: 'AST-2025-081',
      last_synced_at: '2026-10-17T06:55:00Z'
    },
    created_at: '2025-05-10T12:00:00Z',
    updated_at: '2026-10-17T06:55:00Z'
  },
  {
    id: 'asset-pump-02',
    workspace_id: 'ws-alazab-eg-01',
    code: 'AST-PMP-42M',
    name: 'مضخة خرسانة ذراع 42 م Putzmeister - سيدي جابر',
    name_en: 'Putzmeister Concrete Boom Pump 42m',
    address: 'سيدي جابر، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.951, 31.217]
    },
    status: 'active',
    layer: 'assets',
    metadata: {
      asset_model: 'Putzmeister BSF 42-5.16 H',
      category: 'صب وخلط خرسانات',
      last_ping: 'منذ 12 دقيقة'
    },
    source: {
      system: 'erpnext',
      entity_type: 'Asset',
      external_id: 'AST-2025-104',
      last_synced_at: '2026-10-17T06:40:00Z'
    },
    created_at: '2025-07-22T08:00:00Z',
    updated_at: '2026-10-17T06:40:00Z'
  },

  // Fleet
  {
    id: 'flt-van-04',
    workspace_id: 'ws-alazab-eg-01',
    code: 'FLT-VAN-04',
    name: 'سيارة صيانة وتدخل سريع رقم 4 (UberFix)',
    name_en: 'Mobile Service Van #04',
    address: 'طريق الجيش (الكورنيش)، كليوباترا، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.932, 31.219]
    },
    status: 'active',
    layer: 'fleet',
    metadata: {
      speed_kmh: 38,
      heading_deg: 72,
      assigned_technician: 'فني طوارئ: محمود الشريف'
    },
    source: {
      system: 'uberfix',
      entity_type: 'fleet_device',
      external_id: 'DEV-GPS-041',
      last_synced_at: '2026-10-17T07:11:00Z'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-10-17T07:11:00Z'
  },
  {
    id: 'flt-truck-02',
    workspace_id: 'ws-alazab-eg-01',
    code: 'FLT-TRK-02',
    name: 'شاحنة النقل الثقيل والرافعات الهيدروليكية',
    name_en: 'Heavy Hauler Truck #02',
    address: 'محور 26 يوليو، اتجاه أكتوبر، الجيزة',
    city: 'الجيزة',
    geom: {
      type: 'Point',
      coordinates: [31.080, 30.015]
    },
    status: 'active',
    layer: 'fleet',
    metadata: {
      speed_kmh: 56,
      heading_deg: 260,
      assigned_technician: 'سائق: عصام بركات'
    },
    source: {
      system: 'uberfix',
      entity_type: 'fleet_device',
      external_id: 'DEV-GPS-018',
      last_synced_at: '2026-10-17T07:09:00Z'
    },
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-10-17T07:09:00Z'
  },

  // Surveillance (Hikvision)
  {
    id: 'hik-cam-01',
    workspace_id: 'ws-alazab-eg-01',
    code: 'HIK-CAM-SG-01',
    name: 'كاميرا المراقبة المحيطية PTZ - موقع سيدي جابر',
    name_en: 'Hikvision PTZ Cam #01 - Sidi Gaber',
    address: 'البوابة الرئيسية، سيدي جابر، الإسكندرية',
    city: 'الإسكندرية',
    geom: {
      type: 'Point',
      coordinates: [29.9488, 31.2162]
    },
    status: 'active',
    layer: 'surveillance',
    metadata: {
      camera_status: 'online',
      asset_model: 'DS-2DE4425IW-DE(T5)',
      last_ping: 'متصل - 1080p 25fps'
    },
    source: {
      system: 'hikvision',
      entity_type: 'camera',
      external_id: 'HIK-DEVICE-9901',
      last_synced_at: '2026-10-17T07:12:00Z'
    },
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-10-17T07:12:00Z'
  }
];

export const INITIAL_GEOFENCES: GeoFence[] = [
  {
    id: 'geo-sidi-gaber-5km',
    workspace_id: 'ws-alazab-eg-01',
    name: 'نطاق استجابة سيدي جابر وسرعة التدخل (نصف قطر 5 كم)',
    city: 'الإسكندرية',
    type: 'radius_buffer',
    center: [29.949, 31.216],
    radius_meters: 5000,
    rules: {
      service_level: 'SLA-15 (أقل من 15 دقيقة)',
      max_response_time_minutes: 15,
      dispatch_group: 'فريق طوارئ وسط وشرق الإسكندرية'
    },
    active: true
  },
  {
    id: 'geo-alex-metro',
    workspace_id: 'ws-alazab-eg-01',
    name: 'حدود النطاق الحضري للإسكندرية الكبرى',
    city: 'الإسكندرية',
    type: 'polygon_boundary',
    polygon_coordinates: [
      [29.85, 31.18],
      [29.90, 31.22],
      [30.05, 31.28],
      [30.12, 31.31],
      [30.08, 31.19],
      [29.95, 31.15],
      [29.85, 31.18]
    ],
    rules: {
      service_level: 'تغطية قياسية - 45 دقيقة',
      max_response_time_minutes: 45,
      dispatch_group: 'عمليات قطاع الساحل الشمالي والإسكندرية'
    },
    active: true
  },
  {
    id: 'geo-cairo-ring',
    workspace_id: 'ws-alazab-eg-01',
    name: 'نطاق الخدمة السريعة للطريق الدائري القاهرة الكبرى',
    city: 'القاهرة / الجيزة',
    type: 'radius_buffer',
    center: [31.205, 30.056],
    radius_meters: 18000,
    rules: {
      service_level: 'طوارئ ومشروعات العاصمة - 30 دقيقة',
      max_response_time_minutes: 30,
      dispatch_group: 'فريق الدعم اللوجستي المركزي بالقاهرة'
    },
    active: true
  }
];

export const API_ENDPOINTS: ApiEndpointSpec[] = [
  {
    method: 'GET',
    path: '/health',
    title_ar: 'فحص صحة الخدمة ومؤشرات الجاهزية',
    description_ar: 'التحقق من اتصال قاعدة PostGIS، خادم Martin للـ Tiles وجاهزية محول المسارات',
    category: 'system',
    sampleResponse: {
      status: 'healthy',
      version: '1.0.4',
      database: {
        postgis: 'PostGIS 3.4.1 (GEOS 3.12.1, PROJ 9.3.1)',
        connection_pool: 'active (12/20 connections)'
      },
      tile_server: {
        service: 'Martin Vector Tiles',
        status: 'online'
      },
      uptime_seconds: 489201
    }
  },
  {
    method: 'GET',
    path: '/locations',
    title_ar: 'استعراض المواقع مع pagination والفلترة',
    description_ar: 'جلب المواقع الجغرافية مع تصفية حسب مساحة العمل، النوع، والنطاق BBOX',
    category: 'core',
    samplePayload: {
      workspace_id: 'ws-alazab-eg-01',
      limit: 20,
      offset: 0,
      layer: 'projects'
    },
    sampleResponse: {
      count: 6,
      total: 6,
      locations: [
        {
          id: 'c5e347a2-6c37-4b81-8aa6-529d3b1c630e',
          name: 'Abu Auf - Sidi Gaber',
          code: 'AZ-AUF-SG',
          geometry: { type: 'Point', coordinates: [29.949, 31.216] },
          status: 'active'
        }
      ]
    }
  },
  {
    method: 'POST',
    path: '/locations',
    title_ar: 'إنشاء موقع جغرافي جديد',
    description_ar: 'حفظ موقع جغرافي مرتبط بنظام مصدر (ERPNext أو Daftra أو UberFix)',
    category: 'core',
    samplePayload: {
      name: 'Abu Auf - Sidi Gaber',
      code: 'AZ-AUF-SG',
      address: 'Sidi Gaber, Alexandria, Egypt',
      geometry: {
        type: 'Point',
        coordinates: [29.949, 31.216]
      },
      source: {
        system: 'daftra',
        entity_type: 'work_order',
        external_id: 'AZ-PROJ-2026-0028'
      }
    },
    sampleResponse: {
      id: 'c5e347a2-6c37-4b81-8aa6-529d3b1c630e',
      name: 'Abu Auf - Sidi Gaber',
      geometry: { type: 'Point', coordinates: [29.949, 31.216] },
      status: 'active',
      source: {
        system: 'daftra',
        external_id: 'AZ-PROJ-2026-0028'
      }
    }
  },
  {
    method: 'GET',
    path: '/locations/{id}',
    title_ar: 'تفاصيل الموقع والروابط المرجعية',
    description_ar: 'استرجاع السجل الجغرافي الكامل شاملاً الـ Metadata والكيانات المربوطة',
    category: 'core',
    sampleResponse: {
      id: 'c5e347a2-6c37-4b81-8aa6-529d3b1c630e',
      name: 'Abu Auf - Sidi Gaber',
      geometry: { type: 'Point', coordinates: [29.949, 31.216] },
      properties: { budget: 1450000, completion: 92 }
    }
  },
  {
    method: 'PATCH',
    path: '/locations/{id}',
    title_ar: 'تحديث بيانات أو إحداثيات الموقع',
    description_ar: 'تعديل الإحداثيات أو الحالة مع تسجيل عملية التحديث في سجل التدقيق audit_events',
    category: 'core',
    samplePayload: {
      status: 'active',
      address: 'Sidi Gaber El-Mahatta, Alexandria'
    },
    sampleResponse: {
      updated: true,
      revision: 2,
      updated_at: '2026-10-17T07:13:00Z'
    }
  },
  {
    method: 'GET',
    path: '/locations/nearby',
    title_ar: 'البحث المكاني بنصف قطر (ST_DWithin)',
    description_ar: 'استعلام PostGIS للحصول على المواقع الواقعة ضمن مسافة محددة من نقطة إحداثيات',
    category: 'spatial',
    samplePayload: {
      lon: 29.949,
      lat: 31.216,
      radius_meters: 5000
    },
    sampleResponse: {
      query_point: [29.949, 31.216],
      radius_meters: 5000,
      results_count: 5,
      items: [
        { name: 'Abu Auf - Sidi Gaber', distance_meters: 0 },
        { name: 'UF-2026-4029 HVAC Leak', distance_meters: 380 },
        { name: 'Smouha Tech Office', distance_meters: 1420 }
      ]
    }
  },
  {
    method: 'GET',
    path: '/features',
    title_ar: 'استرجاع عناصر GeoJSON وفق BBOX',
    description_ar: 'تصدير العناصر المكانية المتقاطعة مع نافذة العرض الجغرافي الحالية',
    category: 'spatial',
    sampleResponse: {
      type: 'FeatureCollection',
      features: []
    }
  },
  {
    method: 'POST',
    path: '/features',
    title_ar: 'إضافة عنصر هندسي (نقطة أو مضلع أو مسار)',
    description_ar: 'إدراج كائن هندسي في جدول geo_features مع التحقق من صحة ST_IsValid',
    category: 'spatial',
    samplePayload: {
      layer_id: 'layer-proj-01',
      geometry: { type: 'Point', coordinates: [29.949, 31.216] },
      properties: { title: 'New Survey Station' }
    },
    sampleResponse: { id: 'feat-new-01', status: 'stored' }
  },
  {
    method: 'GET',
    path: '/layers',
    title_ar: 'استعراض الطبقات المصرح بها للمستخدم',
    description_ar: 'قائمة الطبقات المتاحة حسب مساحة العمل وصلاحيات الهوية المركزية',
    category: 'core',
    sampleResponse: {
      layers: [
        { key: 'projects', count: 6 },
        { key: 'uberfix', count: 5 },
        { key: 'branches', count: 4 }
      ]
    }
  },
  {
    method: 'POST',
    path: '/layers',
    title_ar: 'إنشاء طبقة جغرافية جديدة',
    description_ar: 'تخصيص طبقة مع تحديد نوع الهندسة ونمط العرض وصلاحية الرؤية',
    category: 'core',
    samplePayload: {
      name: 'Safety Inspection Zones',
      layer_type: 'polygon',
      visibility: 'private'
    },
    sampleResponse: { id: 'layer-safe-01', created: true }
  },
  {
    method: 'GET',
    path: '/styles/{key}',
    title_ar: 'تحميل نمط خريطة العزب',
    description_ar: 'استرجاع MapLibre Style JSON بألوان وهوية مجموعة العزب',
    category: 'core',
    sampleResponse: {
      version: 8,
      name: 'Alazab Corporate Dark Gold',
      sources: { alazab_tiles: { type: 'vector', url: 'https://maps.alazab.com/tiles' } }
    }
  },
  {
    method: 'POST',
    path: '/routes/calculate',
    title_ar: 'حساب مسار وزمن الوصول (Routing)',
    description_ar: 'حساب أقصر مسار بين موقع الفني وموقع طلب الصيانة عبر محول Valhalla',
    category: 'spatial',
    samplePayload: {
      origin: [29.932, 31.219],
      destination: [29.949, 31.216],
      costing: 'auto'
    },
    sampleResponse: {
      distance_km: 2.85,
      duration_minutes: 8.5,
      route_geometry: 'polyline_vector_stream',
      eta: '2026-10-17T07:22:00Z'
    }
  },
  {
    method: 'POST',
    path: '/geocode/search',
    title_ar: 'تحويل العنوان إلى إحداثيات (Forward Geocoding)',
    description_ar: 'محول Geocoding Adapter للبحث عن العناوين في مصر بدقة عالية',
    category: 'spatial',
    samplePayload: {
      query: 'سيدي جابر الإسكندرية',
      country: 'EG'
    },
    sampleResponse: {
      matched_address: 'سيدي جابر، حي شرق، الإسكندرية',
      coordinates: [29.949, 31.216],
      confidence: 0.95
    }
  },
  {
    method: 'POST',
    path: '/geocode/reverse',
    title_ar: 'البحث عن عنوان من إحداثيات (Reverse Geocoding)',
    description_ar: 'استخراج أقرب عنوان محلي وتسمية حي من نقطة جغرافية',
    category: 'spatial',
    samplePayload: {
      coordinates: [29.949, 31.216]
    },
    sampleResponse: {
      address: 'شارع المشير، سيدي جابر، الإسكندرية',
      city: 'Alexandria',
      governorate: 'Alexandria Governorate'
    }
  },
  {
    method: 'POST',
    path: '/imports',
    title_ar: 'طلب استيراد ملف جغرافي (GeoJSON / KML / CSV)',
    description_ar: 'إنشاء مهمة غير متزامنة في import-worker لمعالجة وفحص ملفات GIS',
    category: 'integrations',
    samplePayload: {
      file_type: 'geojson',
      target_layer: 'projects',
      content_length_bytes: 42091
    },
    sampleResponse: {
      job_id: 'job-imp-8839',
      status: 'processing'
    }
  },
  {
    method: 'GET',
    path: '/imports/{id}',
    title_ar: 'الاستعلام عن حالة مهمة الاستيراد',
    description_ar: 'متابعة نسبة إنجاز معالجة الملف وسجل الأخطاء إن وجدت',
    category: 'integrations',
    sampleResponse: {
      job_id: 'job-imp-8839',
      status: 'completed',
      imported_features: 42,
      skipped_invalid: 0
    }
  },
  {
    method: 'POST',
    path: '/integrations/events',
    title_ar: 'استقبال أحداث الأنظمة المصدرية (Webhooks)',
    description_ar: 'نقطة استقبال أحداث ERPNext و UberFix و Daftra لضمان الـ Idempotency والمزامنة',
    category: 'integrations',
    samplePayload: {
      event_id: 'evt-erpnext-90812',
      source_system: 'erpnext',
      event_type: 'project_updated',
      entity_type: 'Project',
      external_id: 'PRJ-2026-ALM-09',
      timestamp: '2026-10-17T07:10:00Z',
      payload: {
        project_name: 'أبراج العلمين الجديدة',
        status: 'Open',
        completion_percentage: 68
      }
    },
    sampleResponse: {
      processed: true,
      action: 'updated_existing_location',
      location_id: 'a1b2c3d4-0001-4000-8000-000000000001'
    }
  }
];

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'maps_search_locations',
    description_ar: 'البحث عن مواقع جغرافية ومشاريع وفروع العزب بالاسم أو العنوان أو الكود',
    description_en: 'Search Alazab locations, projects, and branches by keyword or code',
    category: 'read',
    parameters: {
      query: 'نص البحث (مثال: سيدي جابر أو أبو عوف)',
      layer: 'تصفية حسب نوع الطبقة (projects | uberfix | branches)'
    },
    sampleArgs: { query: 'سيدي جابر', layer: 'projects' }
  },
  {
    name: 'maps_get_location',
    description_ar: 'استرجاع التفاصيل الجغرافية والتشغيلية الكاملة لموقع بواسطة المعرف الداخلي أو الخارجي',
    description_en: 'Get complete spatial and operational record by internal or external ID',
    category: 'read',
    parameters: {
      id: 'المعرف الموحد UUID للموقع'
    },
    sampleArgs: { id: 'c5e347a2-6c37-4b81-8aa6-529d3b1c630e' }
  },
  {
    name: 'maps_find_nearby',
    description_ar: 'البحث عن أقرب الفنيين أو المشروعات أو الأصول ضمن نصف قطر محدد (PostGIS ST_DWithin)',
    description_en: 'Find nearby technicians, sites, or assets within radius in meters',
    category: 'spatial',
    parameters: {
      longitude: 'خط الطول (مثال: 29.949)',
      latitude: 'خط العرض (مثال: 31.216)',
      radius_meters: 'نصف القطر بالأمتار (مثال: 5000)',
      layer: 'نوع الطبقة المراد استعلامها'
    },
    sampleArgs: { longitude: 29.949, latitude: 31.216, radius_meters: 5000, layer: 'uberfix' }
  },
  {
    name: 'maps_get_project_map',
    description_ar: 'الحصول على الحزمة الجغرافية الكاملة لمشروع هندسي معين بـ ERPNext',
    description_en: 'Retrieve full GIS package for an ERPNext engineering project',
    category: 'read',
    parameters: {
      project_code: 'رمز المشروع (مثال: PRJ-2026-ALM-09)'
    },
    sampleArgs: { project_code: 'PRJ-2026-ALM-09' }
  },
  {
    name: 'maps_calculate_route',
    description_ar: 'حساب المسار وزمن القيادة المقدر بين موقعين لتكليف فرق الصيانة',
    description_en: 'Calculate driving route and ETA between coordinates for dispatch',
    category: 'spatial',
    parameters: {
      origin_lon: 'خط طول نقطة البداية',
      origin_lat: 'خط عرض نقطة البداية',
      dest_lon: 'خط طول الوجهة',
      dest_lat: 'خط عرض الوجهة'
    },
    sampleArgs: { origin_lon: 29.932, origin_lat: 31.219, dest_lon: 29.949, dest_lat: 31.216 }
  },
  {
    name: 'maps_list_layers',
    description_ar: 'استعراض الطبقات الجغرافية المتاحة وعدد العناصر المسجلة في كل طبقة',
    description_en: 'List all available spatial layers and current feature counts',
    category: 'read',
    parameters: {
      workspace_id: 'معرف مساحة العمل'
    },
    sampleArgs: { workspace_id: 'ws-alazab-eg-01' }
  },
  {
    name: 'maps_get_geo_summary',
    description_ar: 'توليد ملخص جغرافي وإحصائي تنفيذي للمنطقة أو المحافظة',
    description_en: 'Generate executive spatial operational summary for city or zone',
    category: 'read',
    parameters: {
      city: 'اسم المدينة (الإسكندرية | القاهرة | الجيزة)'
    },
    sampleArgs: { city: 'الإسكندرية' }
  }
];

export const INITIAL_SYNC_EVENTS: SyncEvent[] = [
  {
    id: 'evt-109',
    source_system: 'daftra',
    event_type: 'work_order_created',
    entity_type: 'work_order',
    external_id: 'AZ-PROJ-2026-0028',
    payload: {
      name: 'Abu Auf - Sidi Gaber',
      client: 'Abu Auf Egypt',
      coordinates: [29.949, 31.216]
    },
    status: 'processed',
    timestamp: '2026-10-17T06:30:15Z',
    message: 'تم ربط الموقع بنجاح في جدول geo_locations و geo_entity_links'
  },
  {
    id: 'evt-108',
    source_system: 'uberfix',
    event_type: 'ticket_created',
    entity_type: 'ticket',
    external_id: 'UBERFIX-TKT-4029',
    payload: {
      title: 'تسريب مياه وحدة التكييف المركزي',
      branch: 'AZ-AUF-SG',
      priority: 'high'
    },
    status: 'processed',
    timestamp: '2026-10-17T06:10:02Z',
    message: 'تم إنشاء النقطة الجغرافية وتعيين الفني م. كريم الشناوي'
  },
  {
    id: 'evt-107',
    source_system: 'erpnext',
    event_type: 'project_progress_updated',
    entity_type: 'Project',
    external_id: 'PRJ-2026-ALM-09',
    payload: {
      completion_percentage: 68,
      status: 'Open'
    },
    status: 'processed',
    timestamp: '2026-10-17T05:00:22Z',
    message: 'تم تحديث نسبة الإنجاز في بيانات الميتا'
  }
];
