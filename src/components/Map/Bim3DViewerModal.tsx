import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GeoLocation } from '../../types/maps';
import { BIM_PROJECTS } from '../../data/domainsData';
import {
  X,
  Building2,
  Layers,
  Eye,
  Sliders,
  RotateCw,
  Maximize2,
  Minimize2,
  Box,
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardHat,
  Cpu,
  ChevronRight,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Bim3DViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: GeoLocation | null;
  allLocations?: GeoLocation[];
  onSelectAnotherLocation?: (loc: GeoLocation) => void;
}

interface BimElementData {
  id: string;
  name: string;
  ifcType: string;
  discipline: 'structural' | 'architectural' | 'mep' | 'logistics';
  floorLevel: string;
  material: string;
  dimensions: string;
  status: 'completed' | 'ongoing' | 'planned';
  costEgp?: number;
  contractor: string;
}

export const Bim3DViewerModal: React.FC<Bim3DViewerModalProps> = ({
  isOpen,
  onClose,
  location,
  allLocations = [],
  onSelectAnotherLocation
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const elementsGroupRef = useRef<THREE.Group | null>(null);
  const craneGroupRef = useRef<THREE.Group | null>(null);
  const floorGroupsRef = useRef<{ floorIndex: number; group: THREE.Group; baseY: number }[]>([]);

  // Interactive UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [explodedFactor, setExplodedFactor] = useState(0); // 0 to 1
  const [activeDisciplines, setActiveDisciplines] = useState<Record<string, boolean>>({
    structural: true,
    architectural: true,
    mep: true,
    logistics: true
  });
  const [selectedElement, setSelectedElement] = useState<BimElementData | null>(null);
  const [activeFloorFilter, setActiveFloorFilter] = useState<'all' | number>('all');

  // Match location with domain BIM detail if available
  const bimDetail = location
    ? BIM_PROJECTS.find(
        p =>
          p.code === location.code ||
          p.name.includes(location.name) ||
          location.name.includes('العلمين') && p.id === 'bim-01-alamein' ||
          location.name.includes('سيدي جابر') && p.id === 'bim-02-sidi-gaber'
      ) || BIM_PROJECTS[0]
    : BIM_PROJECTS[0];

  // Model archetype determination
  const isHighrise =
    location?.code?.includes('ALM') ||
    location?.name?.includes('العلمين') ||
    location?.name?.includes('برج') ||
    (!location?.name?.includes('أبو عوف') && (location?.metadata?.completion_percentage ?? 0) < 80);

  const isRetailStore =
    location?.code?.includes('AUF') ||
    location?.name?.includes('أبو عوف') ||
    location?.layer === 'branches';

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16); // Deep slate navy
    scene.fog = new THREE.FogExp2(0x090d16, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(38, 28, 42);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Clean any prior canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Do not go below ground
    controls.minDistance = 8;
    controls.maxDistance = 150;
    controls.target.set(0, 10, 0);
    controlsRef.current = controls;

    // 5. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7); // Soft cool ambient
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x1e293b, 0.6);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4); // Golden architectural sun
    sunLight.position.set(45, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Accent fill light (cyan bounce)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // 6. Ground & Architectural Construction Grid
    const gridHelper = new THREE.GridHelper(90, 45, 0xf59e0b, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Site boundary plane
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Site boundary lines (yellow dashed perimeter)
    const boundaryPoints = [
      new THREE.Vector3(-22, 0.05, -22),
      new THREE.Vector3(22, 0.05, -22),
      new THREE.Vector3(22, 0.05, 22),
      new THREE.Vector3(-22, 0.05, 22),
      new THREE.Vector3(-22, 0.05, -22)
    ];
    const boundaryGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const boundaryMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b,
      dashSize: 1.5,
      gapSize: 0.8,
      linewidth: 2
    });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    boundaryLine.computeLineDistances();
    scene.add(boundaryLine);

    // 7. Procedural BIM Model Hierarchy
    const elementsGroup = new THREE.Group();
    scene.add(elementsGroup);
    elementsGroupRef.current = elementsGroup;
    floorGroupsRef.current = [];

    // Materials Library for BIM Elements
    const materials = {
      concrete: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.85,
        metalness: 0.15,
        wireframe: wireframeMode
      }),
      concreteDark: new THREE.MeshStandardMaterial({
        color: 0x64748b,
        roughness: 0.8,
        metalness: 0.2,
        wireframe: wireframeMode
      }),
      glassFacade: new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1,
        metalness: 0.9,
        transmission: 0.6,
        ior: 1.5,
        wireframe: wireframeMode
      }),
      glassFacadeTinted: new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.55,
        roughness: 0.15,
        metalness: 0.85,
        wireframe: wireframeMode
      }),
      structuralSteel: new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.4,
        metalness: 0.7,
        wireframe: wireframeMode
      }),
      yellowCrane: new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.5,
        metalness: 0.5,
        wireframe: wireframeMode
      }),
      mepDucts: new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: wireframeMode
      }),
      mepPipes: new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.35,
        metalness: 0.65,
        wireframe: wireframeMode
      }),
      retailWood: new THREE.MeshStandardMaterial({
        color: 0xb45309,
        roughness: 0.7,
        metalness: 0.1,
        wireframe: wireframeMode
      })
    };

    // Helper to assign metadata for raycast inspection
    const tagBimElement = (mesh: THREE.Mesh, data: BimElementData) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { isBimElement: true, ...data };
    };

    if (isHighrise) {
      // BUILD HIGH-RISE BIM TOWER (e.g. Alamein Towers)
      const numFloors = 10;
      const floorHeight = 2.6;
      const towerWidth = 16;
      const towerDepth = 16;

      // 1. Foundation Slab
      const raftGeo = new THREE.BoxGeometry(22, 1.2, 22);
      const raftMesh = new THREE.Mesh(raftGeo, materials.concreteDark);
      raftMesh.position.y = 0.6;
      tagBimElement(raftMesh, {
        id: 'BIM-RAFT-001',
        name: 'لبشة خرسانية مسلحة C40 (Raft Foundation)',
        ifcType: 'IfcFooting',
        discipline: 'structural',
        floorLevel: 'منسوب التأسيس -0.00',
        material: 'خرسانة مسلحة مسبقة الإجهاد مقاومة للكبريتات',
        dimensions: '22.0m x 22.0m x 1.2m',
        status: 'completed',
        costEgp: 4800000,
        contractor: 'العزب للمقاولات والأساسات العميقة'
      });
      elementsGroup.add(raftMesh);

      // Central core (lifts & stairs)
      const coreHeight = numFloors * floorHeight + 2;
      const coreGeo = new THREE.BoxGeometry(5.5, coreHeight, 5.5);
      const coreMesh = new THREE.Mesh(coreGeo, materials.concreteDark);
      coreMesh.position.set(0, coreHeight / 2 + 1.2, 0);
      tagBimElement(coreMesh, {
        id: 'BIM-CORE-001',
        name: 'كور خرساني مركزي لآبار المصاعد والسلالم',
        ifcType: 'IfcWallStandardCase',
        discipline: 'structural',
        floorLevel: 'المستويات من 1 إلى 10',
        material: 'خرسانة ذاتية الدمك C50 عالية المقاومة',
        dimensions: '5.5m x 5.5m x 28.0m',
        status: 'completed',
        costEgp: 6200000,
        contractor: 'شعبة الهياكل الخرسانية - العزب'
      });
      elementsGroup.add(coreMesh);

      // Floor by floor generation
      for (let f = 0; f < numFloors; f++) {
        const floorGroup = new THREE.Group();
        const baseY = 1.2 + f * floorHeight;
        floorGroup.position.y = baseY;

        // Floor Slab
        const slabGeo = new THREE.BoxGeometry(towerWidth, 0.4, towerDepth);
        const slabMesh = new THREE.Mesh(slabGeo, materials.concrete);
        slabMesh.position.y = 0.2;
        tagBimElement(slabMesh, {
          id: `BIM-SLAB-F${f + 1}`,
          name: `بلاطة سقف لا كمرية (Flat Slab) - الطابق ${f + 1}`,
          ifcType: 'IfcSlab',
          discipline: 'structural',
          floorLevel: `الطابق ${f + 1}`,
          material: 'خرسانة مسلحة C35 سمك 28 سم مع شبكتي تسليح',
          dimensions: `${towerWidth}m x ${towerDepth}m x 0.4m`,
          status: f < 7 ? 'completed' : f === 7 ? 'ongoing' : 'planned',
          costEgp: 850000,
          contractor: 'إدارة المشروعات الإنشائية'
        });
        floorGroup.add(slabMesh);

        // Columns on grid
        const colSpacing = 6;
        const colRadius = 0.35;
        const colHeight = floorHeight - 0.4;
        const colPositions = [
          [-colSpacing, -colSpacing],
          [colSpacing, -colSpacing],
          [-colSpacing, colSpacing],
          [colSpacing, colSpacing],
          [0, -colSpacing],
          [0, colSpacing],
          [-colSpacing, 0],
          [colSpacing, 0]
        ];

        colPositions.forEach(([cx, cz], ci) => {
          const colGeo = new THREE.CylinderGeometry(colRadius, colRadius, colHeight, 16);
          const colMesh = new THREE.Mesh(colGeo, materials.concrete);
          colMesh.position.set(cx, colHeight / 2 + 0.4, cz);
          tagBimElement(colMesh, {
            id: `BIM-COL-F${f + 1}-${ci + 1}`,
            name: `عمود دائري مسلح C40 - ${ci + 1}`,
            ifcType: 'IfcColumn',
            discipline: 'structural',
            floorLevel: `الطابق ${f + 1}`,
            material: 'خرسانة C40 وحديد تسليح عالي المقاومة B500D',
            dimensions: `قطر 70 سم x ارتفاع ${colHeight.toFixed(1)}m`,
            status: f < 8 ? 'completed' : 'ongoing',
            contractor: 'العزب للإنشاءات'
          });
          floorGroup.add(colMesh);
        });

        // Glass Curtain Wall Facade panels (Architectural)
        const wallH = floorHeight - 0.3;
        const panelThick = 0.15;
        const facadeNorthGeo = new THREE.BoxGeometry(towerWidth - 0.2, wallH, panelThick);
        const facadeNorth = new THREE.Mesh(facadeNorthGeo, materials.glassFacade);
        facadeNorth.position.set(0, wallH / 2 + 0.3, towerDepth / 2);
        tagBimElement(facadeNorth, {
          id: `BIM-CURTAIN-F${f + 1}-N`,
          name: `واجهة زجاجية ستائرية مزدوجة Low-E (North Façade F${f + 1})`,
          ifcType: 'IfcCurtainWall',
          discipline: 'architectural',
          floorLevel: `الطابق ${f + 1}`,
          material: 'زجاج مزدوج 28 مم عازل للحرارة والصوت مع قطاعات ألمنيوم تكوين',
          dimensions: `${towerWidth}m x ${wallH.toFixed(1)}m`,
          status: f < 5 ? 'completed' : f < 7 ? 'ongoing' : 'planned',
          costEgp: 620000,
          contractor: 'شعبة الواجهات والألمنيوم - العزب'
        });
        floorGroup.add(facadeNorth);

        // South Facade
        const facadeSouth = facadeNorth.clone();
        facadeSouth.position.z = -towerDepth / 2;
        floorGroup.add(facadeSouth);

        // East & West Facades
        const facadeEastGeo = new THREE.BoxGeometry(panelThick, wallH, towerDepth - 0.2);
        const facadeEast = new THREE.Mesh(facadeEastGeo, materials.glassFacade);
        facadeEast.position.set(towerWidth / 2, wallH / 2 + 0.3, 0);
        floorGroup.add(facadeEast);

        const facadeWest = facadeEast.clone();
        facadeWest.position.x = -towerWidth / 2;
        floorGroup.add(facadeWest);

        // MEP HVAC Air Ducts suspended from ceiling
        const ductGeo = new THREE.BoxGeometry(towerWidth * 0.75, 0.35, 0.6);
        const ductMesh = new THREE.Mesh(ductGeo, materials.mepDucts);
        ductMesh.position.set(0, floorHeight - 0.35, 2.5);
        tagBimElement(ductMesh, {
          id: `BIM-HVAC-DUCT-F${f + 1}`,
          name: `مجرى هواء تكييف رئيسي VAV Supply Ductwork`,
          ifcType: 'IfcDuctSegment',
          discipline: 'mep',
          floorLevel: `الطابق ${f + 1}`,
          material: 'صاج مجلفن سمك 0.8 مم مع عازل صوف زجاجي 50 مم',
          dimensions: `12.0m x 0.6m x 0.35m`,
          status: f < 4 ? 'completed' : 'ongoing',
          costEgp: 180000,
          contractor: 'شعبة الأعمال الكهروميكانيكية MEP'
        });
        floorGroup.add(ductMesh);

        elementsGroup.add(floorGroup);
        floorGroupsRef.current.push({
          floorIndex: f + 1,
          group: floorGroup,
          baseY
        });
      }

      // Roof Crown & Helipad
      const roofY = 1.2 + numFloors * floorHeight;
      const helipadGeo = new THREE.CylinderGeometry(6, 6, 0.5, 32);
      const helipadMesh = new THREE.Mesh(helipadGeo, materials.concreteDark);
      helipadMesh.position.set(0, roofY + 0.6, 0);
      tagBimElement(helipadMesh, {
        id: 'BIM-HELIPAD-01',
        name: 'مهبط طائرات عمودية السطح العلوي (Rooftop Helipad)',
        ifcType: 'IfcBuildingElementProxy',
        discipline: 'architectural',
        floorLevel: 'السطح الأخير R1',
        material: 'خرسانة مسلحة مقاومة للاهتزاز مع دهان ملاحي عاكس',
        dimensions: 'قطر 12.0m x سمك 50 سم',
        status: 'planned',
        costEgp: 1400000,
        contractor: 'العزب للمشروعات التخصصية'
      });
      elementsGroup.add(helipadMesh);

      // Active Tower Crane (Logistics)
      const craneGroup = new THREE.Group();
      craneGroup.position.set(towerWidth / 2 + 4, 0, towerDepth / 2 + 4);

      // Mast
      const mastHeight = roofY + 8;
      const mastGeo = new THREE.BoxGeometry(1.6, mastHeight, 1.6);
      const mastMesh = new THREE.Mesh(mastGeo, materials.yellowCrane);
      mastMesh.position.y = mastHeight / 2;
      craneGroup.add(mastMesh);

      // Crane Jib (Boom)
      const jibGroup = new THREE.Group();
      jibGroup.position.y = mastHeight - 1;
      const jibGeo = new THREE.BoxGeometry(26, 1.2, 1.2);
      const jibMesh = new THREE.Mesh(jibGeo, materials.yellowCrane);
      jibMesh.position.x = 9; // extend forward
      jibGroup.add(jibMesh);

      // Counterweight
      const counterGeo = new THREE.BoxGeometry(6, 1.8, 1.4);
      const counterMesh = new THREE.Mesh(counterGeo, materials.concreteDark);
      counterMesh.position.x = -4.5;
      jibGroup.add(counterMesh);

      // Cable and Hook
      const hookCableGeo = new THREE.CylinderGeometry(0.04, 0.04, 10, 8);
      const hookCableMesh = new THREE.Mesh(hookCableGeo, materials.structuralSteel);
      hookCableMesh.position.set(12, -5, 0);
      jibGroup.add(hookCableMesh);

      tagBimElement(mastMesh, {
        id: 'BIM-CRANE-01',
        name: 'ونش برجي Potain MDT 389 حمولة 16 طن',
        ifcType: 'IfcTransportElement',
        discipline: 'logistics',
        floorLevel: 'موقع الإنشاء الخارجي',
        material: 'صلب إنشائي مجلفن ذراع بطول 55 متر',
        dimensions: 'ارتفاع 36 متر x ذراع 55 متر',
        status: 'ongoing',
        contractor: 'أسطول معدات العزب المركزية'
      });

      craneGroup.add(jibGroup);
      elementsGroup.add(craneGroup);
      craneGroupRef.current = jibGroup;
    } else if (isRetailStore) {
      // BUILD COMMERCIAL SHOWROOM BIM (e.g. Abu Auf Sidi Gaber Store AUF-SG)
      const storeWidth = 24;
      const storeDepth = 18;
      const storeHeight = 6.2;

      // Slab & Foundation
      const slabGeo = new THREE.BoxGeometry(storeWidth + 2, 0.4, storeDepth + 2);
      const slabMesh = new THREE.Mesh(slabGeo, materials.concrete);
      slabMesh.position.y = 0.2;
      tagBimElement(slabMesh, {
        id: 'BIM-RETAIL-SLAB',
        name: 'أرضية المعرض خرسانة مصقولة وتجليد بورسلين تجاري',
        ifcType: 'IfcSlab',
        discipline: 'structural',
        floorLevel: 'الدور الأرضي GF',
        material: 'خرسانة مسلحة مع بلاط بورسلين إسباني 120x60 سم',
        dimensions: `${storeWidth}m x ${storeDepth}m x 0.4m`,
        status: 'completed',
        costEgp: 420000,
        contractor: 'شعبة التشطيبات المعمارية - العزب'
      });
      elementsGroup.add(slabMesh);

      // Exterior Masonry Walls (Rear & Sides)
      const wallMat = materials.concreteDark;
      const backWallGeo = new THREE.BoxGeometry(storeWidth, storeHeight, 0.4);
      const backWall = new THREE.Mesh(backWallGeo, wallMat);
      backWall.position.set(0, storeHeight / 2 + 0.4, -storeDepth / 2);
      elementsGroup.add(backWall);

      const sideWallLeftGeo = new THREE.BoxGeometry(0.4, storeHeight, storeDepth);
      const sideWallLeft = new THREE.Mesh(sideWallLeftGeo, wallMat);
      sideWallLeft.position.set(-storeWidth / 2, storeHeight / 2 + 0.4, 0);
      elementsGroup.add(sideWallLeft);

      const sideWallRight = sideWallLeft.clone();
      sideWallRight.position.x = storeWidth / 2;
      elementsGroup.add(sideWallRight);

      // Front Showroom Glass Curtain Facade
      const frontGlassGeo = new THREE.BoxGeometry(storeWidth, storeHeight, 0.1);
      const frontGlass = new THREE.Mesh(frontGlassGeo, materials.glassFacade);
      frontGlass.position.set(0, storeHeight / 2 + 0.4, storeDepth / 2);
      tagBimElement(frontGlass, {
        id: 'BIM-STOREFRONT-01',
        name: 'واجهة المعرض الزجاجية الاستعراضية مع أبواب أوتوماتيكية',
        ifcType: 'IfcCurtainWall',
        discipline: 'architectural',
        floorLevel: 'الدور الأرضي',
        material: 'زجاج سيكوريت مقوى 12 مم مع حساسات حركة وسوستة أرضية DORMA',
        dimensions: `${storeWidth}m x ${storeHeight}m`,
        status: 'completed',
        costEgp: 310000,
        contractor: 'العزب لتجاليد الواجهات والألمنيوم'
      });
      elementsGroup.add(frontGlass);

      // Steel Roof Trusses
      for (let t = -storeDepth / 2 + 3; t < storeDepth / 2; t += 4) {
        const trussGeo = new THREE.BoxGeometry(storeWidth - 0.8, 0.45, 0.25);
        const trussMesh = new THREE.Mesh(trussGeo, materials.structuralSteel);
        trussMesh.position.set(0, storeHeight + 0.2, t);
        tagBimElement(trussMesh, {
          id: `BIM-TRUSS-${t.toFixed(0)}`,
          name: `جمالون صلب إنشائي Steel Roof Truss IPE-240`,
          ifcType: 'IfcBeam',
          discipline: 'structural',
          floorLevel: 'منسوب السقف العلوي',
          material: 'قطاعات حديد مدرفلة S275 دهان مقاوم للحريق Intumescent',
          dimensions: `${storeWidth}m span`,
          status: 'completed',
          costEgp: 195000,
          contractor: 'ورش تصنيع الحديد - العزب'
        });
        elementsGroup.add(trussMesh);
      }

      // Interior Mezzanine Floor
      const mezGeo = new THREE.BoxGeometry(storeWidth * 0.45, 0.3, storeDepth * 0.5);
      const mezMesh = new THREE.Mesh(mezGeo, materials.concrete);
      mezMesh.position.set(-storeWidth * 0.25, 3.2, -storeDepth * 0.2);
      tagBimElement(mezMesh, {
        id: 'BIM-MEZZANINE-01',
        name: 'طابق الميزانين الإداري ومنطقة تحضير المنتجات',
        ifcType: 'IfcSlab',
        discipline: 'structural',
        floorLevel: 'طابق الميزانين M1',
        material: 'بلاطة Steel Deck خرسانة مع درابزين ستانلس ستيل',
        dimensions: '10.8m x 9.0m',
        status: 'completed',
        costEgp: 260000,
        contractor: 'العزب للمقاولات'
      });
      elementsGroup.add(mezMesh);

      // Retail Shelving Aisles (Gondola Racks)
      for (let r = -4; r <= 4; r += 4) {
        const rackGeo = new THREE.BoxGeometry(7, 1.8, 1.2);
        const rackMesh = new THREE.Mesh(rackGeo, materials.retailWood);
        rackMesh.position.set(r + 3, 1.3, 0);
        tagBimElement(rackMesh, {
          id: `BIM-RACK-0${r + 5}`,
          name: `وحدة عرض خشبية جندولا لمنتجات القهوة والمكسرات`,
          ifcType: 'IfcFurnishingElement',
          discipline: 'architectural',
          floorLevel: 'صالة العرض الرئيسية',
          material: 'خشب أرو ماسيف مع دهان بولي يوريثان وإضاءة LED داخلية',
          dimensions: '7.0m x 1.2m x 1.8m',
          status: 'completed',
          costEgp: 85000,
          contractor: 'مصنع الأثاث والديكور - العزب'
        });
        elementsGroup.add(rackMesh);
      }

      // Exposed HVAC Spiral Ducts
      const duct1Geo = new THREE.CylinderGeometry(0.35, 0.35, storeWidth - 4, 16);
      const duct1Mesh = new THREE.Mesh(duct1Geo, materials.mepDucts);
      duct1Mesh.rotation.z = Math.PI / 2;
      duct1Mesh.position.set(0, storeHeight - 0.8, 2);
      tagBimElement(duct1Mesh, {
        id: 'BIM-SPIRAL-DUCT-01',
        name: 'دكت تكييف حلزوني مكشوف Spiral HVAC Duct مع مخارج دائرية',
        ifcType: 'IfcDuctSegment',
        discipline: 'mep',
        floorLevel: 'سقف صالة العرض',
        material: 'صاج حلزوني مجلفن مدهون أسود إيبوكسي مطفي',
        dimensions: 'قطر 70 سم x طول 20 متر',
        status: 'completed',
        costEgp: 145000,
        contractor: 'شعبة التكييف والتهوية'
      });
      elementsGroup.add(duct1Mesh);
    } else {
      // GENERAL CONSTRUCTION SITE BIM (Multi-bay frame)
      const numLevels = 4;
      const bayW = 8;
      const bayD = 8;

      for (let lvl = 0; lvl < numLevels; lvl++) {
        const floorGroup = new THREE.Group();
        const y = lvl * 3.4;
        floorGroup.position.y = y;

        // Slab
        const slabGeo = new THREE.BoxGeometry(bayW * 2, 0.35, bayD * 2);
        const slabMesh = new THREE.Mesh(slabGeo, materials.concrete);
        slabMesh.position.y = 0.175;
        tagBimElement(slabMesh, {
          id: `BIM-FRAME-SLAB-L${lvl + 1}`,
          name: `سقف المستوى ${lvl + 1} - هوردى Solid/Hollow Block`,
          ifcType: 'IfcSlab',
          discipline: 'structural',
          floorLevel: `المستوى ${lvl + 1}`,
          material: 'خرسانة مسلحة C30 وبلوكات مفرغة عازلة',
          dimensions: '16.0m x 16.0m',
          status: lvl < 2 ? 'completed' : lvl === 2 ? 'ongoing' : 'planned',
          costEgp: 540000,
          contractor: 'العزب للمقاولات العامة'
        });
        floorGroup.add(slabMesh);

        // Grid columns
        for (let ix = -bayW / 2; ix <= bayW / 2; ix += bayW) {
          for (let iz = -bayD / 2; iz <= bayD / 2; iz += bayD) {
            const colGeo = new THREE.BoxGeometry(0.6, 3.0, 0.6);
            const colMesh = new THREE.Mesh(colGeo, materials.concreteDark);
            colMesh.position.set(ix, 1.7, iz);
            floorGroup.add(colMesh);
          }
        }

        elementsGroup.add(floorGroup);
        floorGroupsRef.current.push({
          floorIndex: lvl + 1,
          group: floorGroup,
          baseY: y
        });
      }
    }

    // 8. Raycaster for Interactive Hover and Element Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(elementsGroup.children, true);

      if (intersects.length > 0) {
        // Find top-most mesh with bim data
        const hit = intersects.find(i => i.object.userData?.isBimElement);
        if (hit && hit.object.userData) {
          const data = hit.object.userData as BimElementData;
          setSelectedElement(data);

          // Flash highlight effect
          const mesh = hit.object as THREE.Mesh;
          const origColor = (mesh.material as any).color?.clone();
          if ((mesh.material as any).color) {
            (mesh.material as any).color.set(0xf59e0b); // highlight amber
            setTimeout(() => {
              if (origColor) (mesh.material as any).color.copy(origColor);
            }, 600);
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 9. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Auto-rotation
      if (autoRotate && controlsRef.current) {
        elementsGroup.rotation.y += delta * 0.12;
      }

      // Rotate crane jib gently
      if (craneGroupRef.current) {
        craneGroupRef.current.rotation.y += delta * 0.25;
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize Observer
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
    };
  }, [isOpen, location, wireframeMode]);

  // Handle Exploded View Slider Update
  useEffect(() => {
    if (floorGroupsRef.current.length === 0) return;
    floorGroupsRef.current.forEach(({ floorIndex, group, baseY }) => {
      // Displace upwards proportional to floorIndex
      const offset = (floorIndex - 1) * explodedFactor * 3.5;
      group.position.y = baseY + offset;
    });
  }, [explodedFactor]);

  // Handle Discipline Visibility Toggle
  useEffect(() => {
    if (!elementsGroupRef.current) return;
    elementsGroupRef.current.traverse(obj => {
      if (obj.userData?.isBimElement) {
        const disc = obj.userData.discipline;
        if (disc && activeDisciplines[disc] !== undefined) {
          obj.visible = activeDisciplines[disc];
        }
      }
    });
  }, [activeDisciplines]);

  // Preset Camera Angles
  const setCameraPreset = (preset: 'iso' | 'top' | 'front' | 'side') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (preset) {
      case 'iso':
        cam.position.set(38, 28, 42);
        ctrl.target.set(0, 10, 0);
        break;
      case 'top':
        cam.position.set(0.1, 55, 0);
        ctrl.target.set(0, 0, 0);
        break;
      case 'front':
        cam.position.set(0, 14, 48);
        ctrl.target.set(0, 12, 0);
        break;
      case 'side':
        cam.position.set(48, 14, 0);
        ctrl.target.set(0, 12, 0);
        break;
    }
    ctrl.update();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[90vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="h-16 px-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shrink-0">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {location ? location.name : 'نموذج BIM ثلاثي الأبعاد للموقع'}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {location?.code || 'PRJ-BIM-3D'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 hidden sm:inline">
                  {bimDetail.lodLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate flex items-center gap-2">
                <span>{location?.address || bimDetail.city}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">
                  نسبة الإنجاز الإنشائي: {location?.metadata?.completion_percentage ?? bimDetail.progressPercentage}%
                </span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content: 3D Canvas + Control Sidebars */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* 3D WebGL Canvas Area */}
          <div className="flex-1 h-full relative overflow-hidden bg-slate-950">
            {/* The canvas container */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Floating 3D Tool Controls (Top-Right on canvas) */}
            <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl">
              {/* Camera Angle Presets */}
              <div className="flex items-center gap-1 border-l border-slate-700 pl-1.5 ml-1">
                <button
                  onClick={() => setCameraPreset('iso')}
                  className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="منظور أيزومتري ثلاثي الأبعاد"
                >
                  3D
                </button>
                <button
                  onClick={() => setCameraPreset('top')}
                  className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="مسقط أفقي علوي (Plan)"
                >
                  أفقي
                </button>
                <button
                  onClick={() => setCameraPreset('front')}
                  className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="واجهة أمامية (Elevation)"
                >
                  أمامي
                </button>
              </div>

              {/* Auto rotate toggle */}
              <button
                onClick={() => setAutoRotate(prev => !prev)}
                className={`p-1.5 rounded text-xs transition-colors ${
                  autoRotate ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="تدوير المنظور تلقائياً"
              >
                <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              </button>

              {/* Wireframe Toggle */}
              <button
                onClick={() => setWireframeMode(prev => !prev)}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  wireframeMode ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="نمط الهيكل الشبكي (Wireframe)"
              >
                شبكي
              </button>
            </div>

            {/* Floating Exploded View Slider (Bottom-Center on canvas) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl text-xs max-w-sm w-full mx-auto">
              <span className="text-slate-300 font-bold whitespace-nowrap flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>تفكيك الطوابق (Exploded View):</span>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodedFactor}
                onChange={e => setExplodedFactor(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-mono text-amber-400 font-bold w-10 text-left">
                {Math.round(explodedFactor * 100)}%
              </span>
            </div>

            {/* Quick Hint */}
            <div className="absolute top-3 left-3 z-10 text-[10px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-none hidden sm:block">
              🖱️ اسحب للتدوير • Scroll للتكبير • انقر على أي عنصر لفحص مواصفات BIM
            </div>
          </div>

          {/* Right Inspector & BIM Metadata Panel */}
          <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-r border-slate-800 bg-slate-900/90 flex flex-col overflow-y-auto shrink-0 text-xs p-4 space-y-4">
            {/* Discipline Filters */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>تصفية فئات النموذج (BIM Disciplines)</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { key: 'structural', label: 'الإنشائي (Structural)', color: 'bg-blue-500' },
                  { key: 'architectural', label: 'المعماري (Arch)', color: 'bg-cyan-400' },
                  { key: 'mep', label: 'الكهروميكانيك (MEP)', color: 'bg-emerald-500' },
                  { key: 'logistics', label: 'المعدات (Logistics)', color: 'bg-yellow-400' }
                ].map(disc => (
                  <label
                    key={disc.key}
                    className={`flex items-center justify-between p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      activeDisciplines[disc.key]
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-900 border-slate-850 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`w-2 h-2 rounded-full ${disc.color}`}></span>
                      <span className="truncate">{disc.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={activeDisciplines[disc.key]}
                      onChange={() =>
                        setActiveDisciplines(prev => ({ ...prev, [disc.key]: !prev[disc.key] }))
                      }
                      className="rounded border-slate-700 text-amber-500 focus:ring-0 mr-1"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Selected Element IFC Property Inspector */}
            {selectedElement ? (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/50 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <strong className="text-white text-xs">خصائص العنصر المحدد (IFC)</strong>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                    {selectedElement.id}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">الاسم / التوصيف:</span>
                    <strong className="text-slate-200">{selectedElement.name}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block text-[10px]">فئة IFC Class:</span>
                      <span className="font-mono text-cyan-400">{selectedElement.ifcType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">منسوب الطابق:</span>
                      <span className="text-slate-200">{selectedElement.floorLevel}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">المادة والمواصفة:</span>
                    <span className="text-slate-300">{selectedElement.material}</span>
                  </div>

                  <div className="pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">الأبعاد الهندسية:</span>
                    <span className="font-mono text-amber-300">{selectedElement.dimensions}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block text-[10px]">حالة التنفيذ:</span>
                      <span
                        className={`font-bold ${
                          selectedElement.status === 'completed'
                            ? 'text-emerald-400'
                            : selectedElement.status === 'ongoing'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {selectedElement.status === 'completed'
                          ? 'مكتمل'
                          : selectedElement.status === 'ongoing'
                          ? 'قيد التنفيذ'
                          : 'مجدول'}
                      </span>
                    </div>
                    {selectedElement.costEgp && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">القيمة التعاقدية:</span>
                        <span className="font-mono text-emerald-400">
                          {selectedElement.costEgp.toLocaleString()} ج.م
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">جهة التنفيذ المعتمدة:</span>
                    <span className="text-slate-300">{selectedElement.contractor}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedElement(null)}
                  className="w-full py-1 text-center text-[10px] text-slate-400 hover:text-white bg-slate-900 rounded border border-slate-800"
                >
                  إلغاء التحديد
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/40 p-3 rounded-xl border border-dashed border-slate-800 text-center text-slate-400 text-xs">
                <Box className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                <span>انقر على أي عمود، بلاطة سقف، واجهة زجاجية، أو دكت MEP لعرض بطاقة خواص BIM المعتمدة.</span>
              </div>
            )}

            {/* Execution Zones & Milestones */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2.5">
              <span className="font-bold text-white block text-xs">مناطق التنفيذ والمستخلصات (ERPNext)</span>
              <div className="space-y-1.5 text-[11px]">
                {bimDetail.executionZones.map((zone, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-200 font-medium">{zone.name}</span>
                      <span className="font-mono text-emerald-400 font-bold">{zone.completion}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${zone.completion}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Machinery on site */}
            {bimDetail.activeMachinery.length > 0 && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white block text-xs flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-yellow-400" />
                  <span>معدات الموقع والرافعات المتصلة</span>
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {bimDetail.activeMachinery.map((m, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="flex justify-between items-center">
                        <strong className="text-amber-300">{m.type}</strong>
                        <span className="font-mono text-[10px] text-slate-400">{m.code}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                        <span>نصف قطر الدوران: {m.radiusMeters}م</span>
                        <span>{m.operator}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
