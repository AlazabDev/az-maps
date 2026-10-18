export type SourceSystem = 'erpnext' | 'uberfix' | 'daftra' | 'hikvision' | 'central_id' | 'manual';

export type LayerType = 'projects' | 'uberfix' | 'branches' | 'assets' | 'fleet' | 'geofences' | 'surveillance';

export type LocationStatus = 'active' | 'in_progress' | 'pending' | 'maintenance' | 'inactive';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoLocation {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  name_en?: string;
  address: string;
  city: string;
  geom: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat] (PostGIS convention)
  };
  status: LocationStatus;
  layer: LayerType;
  metadata: {
    category?: string;
    contact_person?: string;
    phone?: string;
    completion_percentage?: number;
    assigned_technician?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    budget_egp?: number;
    issue_type?: string;
    asset_model?: string;
    camera_status?: 'online' | 'offline';
    last_ping?: string;
    speed_kmh?: number;
    heading_deg?: number;
  };
  source: {
    system: SourceSystem;
    entity_type: string;
    external_id: string;
    last_synced_at: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GeoLayer {
  id: string;
  workspace_id: string;
  key: LayerType;
  name_ar: string;
  name_en: string;
  description_ar: string;
  layer_type: 'point' | 'linestring' | 'polygon' | 'mixed';
  visibility: 'public' | 'private' | 'restricted';
  color: string;
  icon: string;
  enabled: boolean;
  feature_count: number;
  source_system: SourceSystem;
}

export interface GeoFence {
  id: string;
  workspace_id: string;
  name: string;
  city: string;
  type: 'radius_buffer' | 'polygon_boundary';
  center?: [number, number]; // [lng, lat]
  radius_meters?: number;
  polygon_coordinates?: [number, number][]; // [[lng, lat], ...]
  rules: {
    service_level: string;
    max_response_time_minutes: number;
    dispatch_group: string;
  };
  active: boolean;
}

export interface McpToolDefinition {
  name: string;
  description_ar: string;
  description_en: string;
  parameters: Record<string, string>;
  category: 'read' | 'write' | 'spatial';
  sampleArgs: Record<string, any>;
}

export interface PostgisQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowCount: number;
  query: string;
}

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  title_ar: string;
  description_ar: string;
  category: 'core' | 'spatial' | 'integrations' | 'system';
  samplePayload?: Record<string, any>;
  sampleResponse: Record<string, any>;
}

export interface SyncEvent {
  id: string;
  source_system: SourceSystem;
  event_type: string;
  entity_type: string;
  external_id: string;
  payload: Record<string, any>;
  status: 'received' | 'processed' | 'failed' | 'ignored';
  timestamp: string;
  message?: string;
}

// ----------------------------------------------------
// The 7 Strategic Operational Domains of Alazab Maps
// ----------------------------------------------------
export type EnterpriseDomainKey =
  | 'construction_bim'      // 01 — المشروعات الإنشائية الحديثة
  | 'facility_cmms'          // 02 — UberFix وإدارة المرافق
  | 'network_cctv'           // 03 — CCTV والشبكات المستدامة
  | 'supply_chain'           // 04 — سلسلة التوريدات وتشغيل الفروع
  | 'smart_light'            // 05 — Smart Light وتوريدات الكهرباء
  | 'smart_home_azlexa'      // 06 — Smart Home / Azlexa
  | 'manufacturing_trace';   // 07 — التصنيع المترابط بالمواقع

export interface EnterpriseDomainInfo {
  key: EnterpriseDomainKey;
  numberStr: string;
  title_ar: string;
  sub_ar: string;
  badge_en: string;
  description_ar: string;
  accentColor: string;
  iconName: string;
}

// 01: Construction GIS + BIM + Digital Twin
export interface BimProjectDetail {
  id: string;
  code: string;
  name: string;
  city: string;
  coordinates: [number, number]; // [lng, lat]
  modelUrl?: string;
  bimElementsCount: number;
  lodLevel: 'LOD 300' | 'LOD 350' | 'LOD 400';
  currentPhase: string;
  progressPercentage: number;
  invoicingMilestones: {
    title: string;
    amountEgp: number;
    status: 'paid' | 'under_review' | 'upcoming';
  }[];
  executionZones: {
    name: string;
    status: 'ongoing' | 'completed' | 'queued';
    completion: number;
  }[];
  activeMachinery: {
    type: string;
    code: string;
    radiusMeters: number;
    operator: string;
  }[];
}

// 02: Facility GIS + CMMS
export interface FacilityAssetRecord {
  id: string;
  code: string;
  name: string;
  facility: string;
  locationPoint: [number, number];
  healthScore: number; // 0-100
  assetCategory: 'HVAC' | 'Electrical' | 'Plumbing' | 'Elevators' | 'Fire Safety';
  lastMaintenanceDate: string;
  nextScheduledDate: string;
  openWorkOrderId?: string;
  assignedTechnician: string;
  coverageZone: string;
}

// 03: Network GIS + CCTV Topology
export interface NetworkCctvTopology {
  id: string;
  siteName: string;
  coordinates: [number, number];
  cameras: {
    id: string;
    model: string;
    headingDeg: number;
    fovAngleDeg: number;
    resolution: string;
    status: 'online' | 'offline' | 'alert';
    streamUrl: string;
    coordinates: [number, number];
  }[];
  switches: {
    id: string;
    model: string;
    poeBudgetWatts: number;
    portsInUse: number;
    totalPorts: number;
    status: 'healthy' | 'warning';
  }[];
  fiberRoutes: {
    id: string;
    fromPoint: [number, number];
    toPoint: [number, number];
    fiberType: 'SingleMode 24-core' | 'MultiMode OM4' | 'Armored Outdoor';
    attenuationDb: number;
    status: 'optimal' | 'attenuated' | 'broken';
  }[];
}

// 04: Supply Chain GIS + Logistics
export interface SupplyChainHub {
  id: string;
  code: string;
  name: string;
  type: 'central_warehouse' | 'regional_depot' | 'supplier' | 'branch_destination';
  coordinates: [number, number];
  inventoryValueEgp: number;
  activeShipmentsCount: number;
  stockFulfillmentRate: number;
  openPurchaseOrders: number;
  recentDeliveries: {
    trackingNumber: string;
    origin: string;
    destination: string;
    materialType: string;
    truckPlate: string;
    status: 'in_transit' | 'delivered' | 'loading';
    eta: string;
    currentCoords: [number, number];
  }[];
}

// 05: Electrical GIS + Smart Lighting
export interface SmartLightingPanel {
  id: string;
  panelCode: string;
  locationName: string;
  coordinates: [number, number];
  totalLoadKva: number;
  powerFactor: number;
  totalFixturesCount: number;
  dimmingLevelPercentage: number;
  automatedSchedule: string;
  circuits: {
    circuitId: string;
    zoneName: string;
    breakerRatingAmp: number;
    activeCurrentAmp: number;
    status: 'energized' | 'tripped' | 'off';
  }[];
  sparePartsInventory: {
    item: string;
    quantity: number;
    compatibility: string;
  }[];
}

// 06: Smart Home / Azlexa Indoor Digital Twin
export interface AzlexaIndoorBuilding {
  id: string;
  code: string;
  buildingName: string;
  name?: string;
  coordinates: [number, number];
  floorsCount: number;
  activeScenes: string[];
  floors: {
    floorNumber: number;
    floorName: string;
    rooms: {
      roomId: string;
      roomName: string;
      tempCelsius: number;
      humidity: number;
      motionDetected: boolean;
      devices: {
        id: string;
        name: string;
        type: 'relay' | 'thermostat' | 'curtain' | 'dimmer' | 'sensor';
        state: boolean;
        value?: number | string;
      }[];
    }[];
  }[];
}

// 07: Manufacturing GIS + MES Traceability
export interface ManufacturingPlant {
  id: string;
  plantCode: string;
  name: string;
  industrialCity: string;
  coordinates: [number, number];
  productionLines: {
    lineId: string;
    name: string;
    currentProduct: string;
    dailyCapacity: string;
    utilizationPercent: number;
  }[];
  activeProjectOrders: {
    orderNumber: string;
    targetProject: string;
    targetProjectLocation: [number, number];
    productName: string;
    quantity: string;
    stage: 'cad_design' | 'cnc_fabrication' | 'coating_assembly' | 'qa_inspection' | 'dispatched_to_site' | 'installed';
    progressPercentage: number;
    estimatedDeliveryDate: string;
  }[];
}

