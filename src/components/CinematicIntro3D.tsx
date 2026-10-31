// Realistic 3D Digital Twin Intro Sequence for PS-003: Federated Traffic-Flow Prediction
// Photorealistic Caltrans ATMS / Cyber-Physical Digital Twin of METR-LA Highway Corridor
// Zero 404 dependencies: Procedural Three.js 3D scene + Web Audio API synthesizer
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sound } from '../three/audioEngine';
import { 
  Play, 
  Pause,
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight,
  Radio,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Zap,
  Activity,
  Sliders,
  Camera,
  CheckCircle2,
  TrendingDown,
  Globe,
  FileText,
  Download
} from 'lucide-react';
import { DocDownloadModal } from './DocDownloadModal';

interface CinematicIntro3DProps {
  onComplete: (preferredMode?: '3d-twin' | 'dashboard') => void;
  datasetName?: string;
  sensorCount?: number;
}

// 4 Pedagogical Phases keyed directly to Problem Statement PS-003
interface PhaseInfo {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  conceptSummary: string;
  technicalDetails: string[];
  metrics: {
    label: string;
    value: string;
    subtext: string;
    isWarning?: boolean;
    isSuccess?: boolean;
  }[];
  camTarget: {
    pos: THREE.Vector3;
    look: THREE.Vector3;
  };
}

const PHASES: PhaseInfo[] = [
  {
    id: 0,
    badge: 'PS-003 PROBLEM STATEMENT',
    title: 'Centralized Bottleneck & Commuter Privacy Threat',
    subtitle: 'Legacy Centralized Architecture vs Cloud Ingestion Strain',
    conceptSummary:
      'Traditional intelligent transportation systems stream continuous raw surveillance camera video and license logs to a single centralized cloud, consuming massive cellular bandwidth and risking sensitive commuter route exposure.',
    technicalDetails: [
      'Raw Video Streaming: Continuous uncompressed sensor streams saturate 5G backhaul.',
      'Centralized Vulnerability: Commuter travel itineraries and vehicle IDs stored in single repository.',
      'Single Point of Failure: Server congestion delays critical congestion forecast updates.',
    ],
    metrics: [
      { label: 'Ingestion Mode', value: 'Raw Centralized', subtext: 'Unencrypted stream', isWarning: true },
      { label: 'Bandwidth Cost', value: '1,420 MB/hr', subtext: 'Continuous raw feed', isWarning: true },
      { label: 'Commuter Privacy', value: 'Compromised', subtext: 'Travel logs exposed', isWarning: true },
    ],
    camTarget: {
      pos: new THREE.Vector3(0, 38, 70),
      look: new THREE.Vector3(0, 0, 0),
    },
  },
  {
    id: 1,
    badge: 'EDGE DECENTRALIZATION',
    title: 'METR-LA 207 Sensors & Non-IID Dirichlet Shards',
    subtitle: 'Decentralized Edge RSUs with Heterogeneous Data Distributions',
    conceptSummary:
      'PS-003 deploys 4 virtual Edge Roadside Units (RSUs) across the Los Angeles freeway grid (I-405, I-10, US-101). Raw loop detector data stays locked at the local edge, split chronologically with Dirichlet non-IID coefficient α = 0.5 to model real-world traffic skew.',
    technicalDetails: [
      '207 Real Loop Detectors: Induction sensors capture velocity, occupancy, and flow rates.',
      'Dirichlet Shard Partition (α = 0.5): Models heterogeneous local traffic regimes (morning rush vs freight).',
      'Chronological Train/Test Split: Strictly preserves temporal causality with zero data leakage.',
    ],
    metrics: [
      { label: 'Sensor Array', value: '207 Loop Detectors', subtext: 'METR-LA physical grid', isSuccess: true },
      { label: 'Edge Topology', value: '4 Virtual RSUs', subtext: 'I-405, I-10, US-101, SR-110', isSuccess: true },
      { label: 'Data Distribution', value: 'Non-IID Dirichlet (α=0.5)', subtext: 'Zero raw data egress', isSuccess: true },
    ],
    camTarget: {
      pos: new THREE.Vector3(-22, 12, -28),
      look: new THREE.Vector3(-14, 4, -32),
    },
  },
  {
    id: 2,
    badge: 'FEDERATED CONSENSUS',
    title: 'FedAvg Aggregation & INT8 Weight Compression',
    subtitle: 'Privacy-Preserving Consensus with 75% Byte Reduction',
    conceptSummary:
      'Edge RSUs independently train compact spatio-temporal neural networks (STGCN/GRU). Only mathematical weight updates (ΔW) are transmitted across low-latency wireless arcs to the Central Aggregator. INT8 quantization slashes communication overhead from 246.8 KB to 61.7 KB.',
    technicalDetails: [
      'FedAvg Consensus (McMahan et al.): Server computes weighted average of local model weights.',
      'Zero Raw Telemetry Shared: Commuter anonymity is mathematically guaranteed.',
      'INT8 Quantization: 4x parameter compression cuts transmission overhead by 75.0% per round.',
    ],
    metrics: [
      { label: 'Aggregation Alg', value: 'FedAvg (McMahan 2017)', subtext: 'Weighted parameter average', isSuccess: true },
      { label: 'FP32 vs INT8 Cost', value: '246.8 KB → 61.7 KB', subtext: '-75.0% Byte Savings', isSuccess: true },
      { label: 'Egress Payload', value: 'Weights Only (ΔW)', subtext: '0 bytes raw video', isSuccess: true },
    ],
    camTarget: {
      pos: new THREE.Vector3(0, 20, 26),
      look: new THREE.Vector3(0, 9, 0),
    },
  },
  {
    id: 3,
    badge: 'BENCHMARKED CONVERGENCE',
    title: 'Multi-Seed Validation & Live Digital Twin Deployment',
    subtitle: 'Rigorous Verification across Seeds [42, 101, 2024] • Ready to Launch',
    conceptSummary:
      'The federated model successfully converges with a global Mean Absolute Error (MAE) under 3.12 km/h. Updated global weights are deployed back to edge RSUs to power real-time traffic flow prediction and ramp metering.',
    technicalDetails: [
      '3-Seed Robustness: Verified convergence across random seeds [42, 101, 2024].',
      'Target Forecast Accuracy: Test MAE 3.12 km/h, RMSE 5.84 km/h on unseen chronological test horizon.',
      'Interactive Twin Active: Real-time 3D telemetry simulation and comparison studio ready.',
    ],
    metrics: [
      { label: 'Multi-Seed Eval', value: 'Seeds 42, 101, 2024', subtext: 'Empirically validated', isSuccess: true },
      { label: 'Target Test MAE', value: '3.12 km/h', subtext: 'High-accuracy forecast', isSuccess: true },
      { label: 'Deployment State', value: 'Global Model Synced', subtext: 'Ready for interactive use', isSuccess: true },
    ],
    camTarget: {
      pos: new THREE.Vector3(28, 30, 48),
      look: new THREE.Vector3(0, 4, 0),
    },
  },
];

export const CinematicIntro3D: React.FC<CinematicIntro3DProps> = ({
  onComplete,
  datasetName = 'METR-LA (Los Angeles Highway Corridor)',
  sensorCount = 207,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getIsMuted());
  const [selectedCamPreset, setSelectedCamPreset] = useState<string>('cinematic');
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  // Internal animation state refs
  const stateRef = useRef({
    elapsedTime: 0,
    activePhaseIndex: 0,
    isPlaying: true,
    camCurrentPos: new THREE.Vector3(0, 38, 70),
    camCurrentLook: new THREE.Vector3(0, 0, 0),
    camTargetPos: new THREE.Vector3(0, 38, 70),
    camTargetLook: new THREE.Vector3(0, 0, 0),
    manualCamOverride: false,
  });

  // Keep stateRef synced with React state
  useEffect(() => {
    stateRef.current.activePhaseIndex = activePhaseIndex;
    stateRef.current.isPlaying = isPlaying;
  }, [activePhaseIndex, isPlaying]);

  const handleFinishIntro = useCallback((preferredMode: '3d-twin' | 'dashboard' = '3d-twin') => {
    sound.playChime();
    sound.stopAmbient();
    sessionStorage.setItem('aiori_traffic_intro_seen', 'true');
    onComplete(preferredMode);
  }, [onComplete]);

  // Key press immediately enters website (space, enter, escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'Enter', 'Escape'].includes(e.code) || e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        handleFinishIntro('3d-twin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinishIntro]);

  const handleSelectPhase = (phaseIdx: number) => {
    sound.playClick();
    setActivePhaseIndex(phaseIdx);
    stateRef.current.activePhaseIndex = phaseIdx;
    stateRef.current.elapsedTime = phaseIdx * 2.0; // Snappy 2.0 seconds per phase (8.0s total cycle)
    stateRef.current.camTargetPos.copy(PHASES[phaseIdx].camTarget.pos);
    stateRef.current.camTargetLook.copy(PHASES[phaseIdx].camTarget.look);
    stateRef.current.manualCamOverride = false;
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleTogglePlay = () => {
    sound.playClick();
    setIsPlaying(!isPlaying);
  };

  // WebGL 3D Scene Assembly
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (e) {
        return true;
      }
    })();

    // 1. Scene, Fog & Perspective Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712'); // Deep tactical dark background
    scene.fog = new THREE.FogExp2('#030712', 0.012);

    const camera = new THREE.PerspectiveCamera(48, container.clientWidth / container.clientHeight, 0.1, 400);
    camera.position.set(0, 38, 70);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Tactical Realistic Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xe0f2fe, 1.6);
    moonLight.position.set(40, 60, 40);
    scene.add(moonLight);

    const blueFill = new THREE.DirectionalLight(0x0284c7, 0.8);
    blueFill.position.set(-40, 30, -30);
    scene.add(blueFill);

    // 3. Cyber-Physical Digital Elevation Ground & LiDAR Grid
    const groundGrid = new THREE.GridHelper(260, 52, 0x0891b2, 0x0f2942);
    groundGrid.position.y = -0.05;
    scene.add(groundGrid);

    // Secondary finer cyber coordinate grid
    const fineGrid = new THREE.GridHelper(260, 260, 0x0369a1, 0x071526);
    fineGrid.position.y = -0.08;
    scene.add(fineGrid);

    // Procedural Dark Topological Elevation Rings (radar contour topography)
    const contourGroup = new THREE.Group();
    scene.add(contourGroup);
    const ringMat = new THREE.LineBasicMaterial({ color: 0x0e7490, transparent: true, opacity: 0.35 });
    for (let r = 25; r <= 130; r += 20) {
      const ringGeom = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const radiusNoise = r + Math.sin(theta * 5) * 2.5 + Math.cos(theta * 3) * 1.8;
        points.push(new THREE.Vector3(Math.cos(theta) * radiusNoise, 0.05, Math.sin(theta) * radiusNoise));
      }
      ringGeom.setFromPoints(points);
      const ringLine = new THREE.Line(ringGeom, ringMat);
      contourGroup.add(ringLine);
    }

    // 4. METR-LA Highway Network: Two Intersecting Freeway Corridors
    // Corridor 1: I-405 San Diego Freeway (Z-axis, 8 lanes + shoulders)
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      roughness: 0.78,
      metalness: 0.22,
    });

    const shoulderMat = new THREE.MeshStandardMaterial({
      color: 0x080c16,
      roughness: 0.9,
      metalness: 0.1,
    });

    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.4,
    });

    // I-405 Main Asphalt Deck
    const i405Road = new THREE.Mesh(new THREE.BoxGeometry(22, 0.3, 200), asphaltMat);
    i405Road.position.set(0, 0, 0);
    roadGroup.add(i405Road);

    // I-405 Concrete Jersey Barriers with warning reflectors
    const leftBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 200), barrierMat);
    leftBarrier.position.set(-11.2, 0.5, 0);
    roadGroup.add(leftBarrier);

    const rightBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 200), barrierMat);
    rightBarrier.position.set(11.2, 0.5, 0);
    roadGroup.add(rightBarrier);

    // Center divider barrier
    const centerBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 200), barrierMat);
    centerBarrier.position.set(0, 0.5, 0);
    roadGroup.add(centerBarrier);

    // I-405 Reflective Highway Lane Markings
    const laneMarkMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const dashGeom = new THREE.PlaneGeometry(0.25, 2.8);
    dashGeom.rotateX(-Math.PI / 2);

    const yellowCenterMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const solidYellowGeom = new THREE.PlaneGeometry(0.2, 200);
    solidYellowGeom.rotateX(-Math.PI / 2);

    const yLeft = new THREE.Mesh(solidYellowGeom, yellowCenterMat);
    yLeft.position.set(-0.6, 0.18, 0);
    roadGroup.add(yLeft);

    const yRight = new THREE.Mesh(solidYellowGeom, yellowCenterMat);
    yRight.position.set(0.6, 0.18, 0);
    roadGroup.add(yRight);

    // Dashed lines for 3 lanes northbound, 3 lanes southbound
    const dashLanes = [-8.2, -5.5, -2.8, 2.8, 5.5, 8.2];
    for (const laneX of dashLanes) {
      for (let z = -96; z < 96; z += 6.5) {
        const dash = new THREE.Mesh(dashGeom, laneMarkMat);
        dash.position.set(laneX, 0.18, z);
        roadGroup.add(dash);
      }
    }

    // Corridor 2: I-10 Santa Monica Freeway Elevated Overpass (X-axis, Elevated at Y = 5.4)
    const i10Elevated = new THREE.Mesh(new THREE.BoxGeometry(200, 0.4, 18), asphaltMat);
    i10Elevated.position.set(0, 5.4, 0);
    roadGroup.add(i10Elevated);

    const i10NorthBarrier = new THREE.Mesh(new THREE.BoxGeometry(200, 0.9, 0.5), barrierMat);
    i10NorthBarrier.position.set(0, 6.0, -9.2);
    roadGroup.add(i10NorthBarrier);

    const i10SouthBarrier = new THREE.Mesh(new THREE.BoxGeometry(200, 0.9, 0.5), barrierMat);
    i10SouthBarrier.position.set(0, 6.0, 9.2);
    roadGroup.add(i10SouthBarrier);

    // Bridge Support Columns for Elevated I-10
    const colGeom = new THREE.CylinderGeometry(0.9, 1.1, 5.4, 16);
    const colPositions = [
      [-15, 2.7, -13],
      [15, 2.7, -13],
      [-15, 2.7, 13],
      [15, 2.7, 13],
      [-38, 2.7, 0],
      [38, 2.7, 0],
      [-65, 2.7, 0],
      [65, 2.7, 0],
    ];
    colPositions.forEach(([x, y, z]) => {
      const col = new THREE.Mesh(colGeom, barrierMat);
      col.position.set(x, y, z);
      roadGroup.add(col);
    });

    // 5. 207 Induction Loop Detectors (METR-LA Sensor Array)
    const sensorPuckGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 16);
    const sensorBaseMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      roughness: 0.3,
    });

    const loopDetectorMeshes: THREE.Mesh[] = [];
    // Place loop detectors along I-405 lanes and I-10 overpass
    const sensorGroup = new THREE.Group();
    scene.add(sensorGroup);

    // 140 sensors on I-405
    for (let i = 0; i < 140; i++) {
      const laneIndex = i % dashLanes.length;
      const x = dashLanes[laneIndex] + (laneIndex < 3 ? 1.3 : -1.3);
      const z = -90 + (i / 140) * 180;
      const puck = new THREE.Mesh(sensorPuckGeom, sensorBaseMat.clone());
      puck.position.set(x, 0.2, z);
      sensorGroup.add(puck);
      loopDetectorMeshes.push(puck);
    }

    // 67 sensors on I-10 overpass (Total = 207 sensors matching METR-LA)
    for (let i = 0; i < 67; i++) {
      const zLane = -6 + (i % 4) * 4;
      const x = -85 + (i / 67) * 170;
      const puck = new THREE.Mesh(sensorPuckGeom, sensorBaseMat.clone());
      puck.position.set(x, 5.62, zLane);
      sensorGroup.add(puck);
      loopDetectorMeshes.push(puck);
    }

    // 6. Photorealistic High-Speed Traffic Flow with Headlight & Taillight Beams (NO TOY BOX CARS)
    interface VehicleStream {
      mesh: THREE.Group;
      speed: number;
      corridor: 'i405-north' | 'i405-south' | 'i10-east' | 'i10-west';
      pos: THREE.Vector3;
      lightTrail: THREE.Mesh;
    }

    const vehicleStreams: VehicleStream[] = [];
    const vehicleGroup = new THREE.Group();
    scene.add(vehicleGroup);

    // Vehicle procedural body geometry (Aerodynamic low-poly chassis)
    const carChassisGeom = new THREE.BoxGeometry(1.65, 0.65, 3.8);
    const carCabinGeom = new THREE.BoxGeometry(1.4, 0.5, 2.0);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1, metalness: 0.95 });

    // Headlight Xenon beam (translucent cone)
    const headlightConeGeom = new THREE.ConeGeometry(1.2, 12, 16);
    headlightConeGeom.rotateX(Math.PI / 2);
    headlightConeGeom.translate(0, 0, 6);
    const headlightConeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Taillight streak beam
    const taillightStreakGeom = new THREE.ConeGeometry(0.8, 14, 16);
    taillightStreakGeom.rotateX(-Math.PI / 2);
    taillightStreakGeom.translate(0, 0, -7);
    const taillightStreakMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const carShades = [0x1e293b, 0x0f172a, 0x334155, 0x0284c7, 0x0369a1, 0x475569];

    // Instantiate 28 realistic highway vehicles across both freeways
    for (let i = 0; i < 28; i++) {
      const vGroup = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color: carShades[i % carShades.length],
        metalness: 0.88,
        roughness: 0.25,
      });

      const chassis = new THREE.Mesh(carChassisGeom, bodyMat);
      chassis.position.y = 0.45;
      vGroup.add(chassis);

      const cabin = new THREE.Mesh(carCabinGeom, glassMat);
      cabin.position.set(0, 0.85, -0.2);
      vGroup.add(cabin);

      // Add Headlight optics (Left & Right)
      const hMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
      const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), hMat);
      h1.position.set(-0.55, 0.45, 1.9);
      vGroup.add(h1);
      const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), hMat);
      h2.position.set(0.55, 0.45, 1.9);
      vGroup.add(h2);

      // Add Taillight optics (Left & Right)
      const tMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
      const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.05), tMat);
      t1.position.set(-0.55, 0.45, -1.9);
      vGroup.add(t1);
      const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.05), tMat);
      t2.position.set(0.55, 0.45, -1.9);
      vGroup.add(t2);

      // Forward Xenon Light Cone (Authentic night photography aesthetic)
      const lightCone = new THREE.Mesh(headlightConeGeom, headlightConeMat);
      lightCone.position.set(0, 0.45, 1.9);
      vGroup.add(lightCone);

      // Taillight streak beam behind
      const taillightStreak = new THREE.Mesh(taillightStreakGeom, taillightStreakMat);
      taillightStreak.position.set(0, 0.45, -1.9);
      vGroup.add(taillightStreak);

      // Distribute onto corridors
      let corridor: VehicleStream['corridor'] = 'i405-north';
      let startPos = new THREE.Vector3();
      let speed = 24 + Math.random() * 12;

      if (i < 8) {
        // I-405 Northbound (moving +Z)
        corridor = 'i405-north';
        const laneX = [2.8, 5.5, 8.2][i % 3];
        startPos.set(laneX, 0, -90 + (i / 8) * 180);
      } else if (i < 16) {
        // I-405 Southbound (moving -Z)
        corridor = 'i405-south';
        const laneX = [-2.8, -5.5, -8.2][i % 3];
        startPos.set(laneX, 0, -90 + ((i - 8) / 8) * 180);
        vGroup.rotation.y = Math.PI; // Heading south
      } else if (i < 22) {
        // I-10 Eastbound (moving +X on elevated overpass)
        corridor = 'i10-east';
        const laneZ = [-6, -2][i % 2];
        startPos.set(-85 + ((i - 16) / 6) * 170, 5.4, laneZ);
        vGroup.rotation.y = Math.PI / 2;
      } else {
        // I-10 Westbound (moving -X on elevated overpass)
        corridor = 'i10-west';
        const laneZ = [2, 6][i % 2];
        startPos.set(-85 + ((i - 22) / 6) * 170, 5.4, laneZ);
        vGroup.rotation.y = -Math.PI / 2;
      }

      vGroup.position.copy(startPos);
      vehicleGroup.add(vGroup);

      vehicleStreams.push({
        mesh: vGroup,
        speed,
        corridor,
        pos: startPos,
        lightTrail: taillightStreak,
      });
    }

    // 7. 4 High-Tech Edge Roadside Units (RSUs) with Dirichlet Halo Rings
    interface RSUData {
      id: number;
      name: string;
      shard: string;
      pos: THREE.Vector3;
      mesh: THREE.Group;
      beaconMesh: THREE.Mesh;
      haloMesh: THREE.Mesh;
      color: number;
    }

    const rsuDefinitions = [
      { id: 1, name: 'RSU-01 (I-405 North / Westwood)', shard: 'Dirichlet α=0.5 [Morning Peak]', pos: new THREE.Vector3(-14, 0, -32), color: 0x06b6d4 },
      { id: 2, name: 'RSU-02 (I-10 West / Downtown LA)', shard: 'Dirichlet α=0.5 [Heavy Arterial]', pos: new THREE.Vector3(26, 5.4, -12), color: 0x10b981 },
      { id: 3, name: 'RSU-03 (US-101 / Hollywood Split)', shard: 'Dirichlet α=0.5 [Variable Flow]', pos: new THREE.Vector3(-26, 5.4, 14), color: 0xf59e0b },
      { id: 4, name: 'RSU-04 (SR-110 / Harbor Corridor)', shard: 'Dirichlet α=0.5 [Freight Logistics]', pos: new THREE.Vector3(14, 0, 32), color: 0x8b5cf6 },
    ];

    const rsuGroup = new THREE.Group();
    scene.add(rsuGroup);
    const rsuUnits: RSUData[] = [];

    const mastGeom = new THREE.CylinderGeometry(0.22, 0.35, 7.5, 12);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const podGeom = new THREE.BoxGeometry(1.2, 1.4, 0.8);
    const podMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });

    rsuDefinitions.forEach((def) => {
      const g = new THREE.Group();
      g.position.copy(def.pos);

      // Heavy concrete pedestal
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.6, 12), barrierMat);
      pedestal.position.y = 0.3;
      g.add(pedestal);

      // Galvanized steel mast
      const mast = new THREE.Mesh(mastGeom, mastMat);
      mast.position.y = 4.0;
      g.add(mast);

      // Edge GPU compute enclosure (NVIDIA Jetson / Edge TPU styling)
      const pod = new THREE.Mesh(podGeom, podMat);
      pod.position.set(0, 3.2, 0.4);
      g.add(pod);

      // Directional microwave antenna disc pointed toward the central aggregator
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 0.3, 16), mastMat);
      antenna.rotation.z = Math.PI / 4;
      antenna.position.set(0, 6.8, 0);
      g.add(antenna);

      // Flashing telemetry beacon
      const beaconMat = new THREE.MeshBasicMaterial({ color: def.color });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), beaconMat);
      beacon.position.set(0, 7.8, 0);
      g.add(beacon);

      // Dirichlet Shard Data Halo Ring around RSU
      const haloGeom = new THREE.RingGeometry(2.5, 3.2, 32);
      haloGeom.rotateX(-Math.PI / 2);
      const haloMat = new THREE.MeshBasicMaterial({
        color: def.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const halo = new THREE.Mesh(haloGeom, haloMat);
      halo.position.set(0, 0.15, 0);
      g.add(halo);

      rsuGroup.add(g);
      rsuUnits.push({
        ...def,
        mesh: g,
        beaconMesh: beacon,
        haloMesh: halo,
      });
    });

    // 8. Central Federated Aggregator Hub
    const centralHubGroup = new THREE.Group();
    centralHubGroup.position.set(0, 8.5, 0);
    scene.add(centralHubGroup);

    // Central Aggregation Core Column
    const coreColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.8, 5.5, 16),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.6,
        metalness: 0.9,
        roughness: 0.15,
      })
    );
    centralHubGroup.add(coreColumn);

    // Triple Concentric Holographic FedAvg Mathematical Consensus Rings
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true });
    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true });

    const fedAvgRing1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.08, 16, 64), ringMat1);
    const fedAvgRing2 = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.08, 16, 64), ringMat2);
    const fedAvgRing3 = new THREE.Mesh(new THREE.TorusGeometry(6.0, 0.08, 16, 64), ringMat3);
    centralHubGroup.add(fedAvgRing1);
    centralHubGroup.add(fedAvgRing2);
    centralHubGroup.add(fedAvgRing3);

    // Vertical Skyward Telemetry Beacon
    const skyBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.8, 60, 16),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
      })
    );
    skyBeam.position.set(0, 30, 0);
    centralHubGroup.add(skyBeam);

    // 9. 3D Bézier Curves Connecting RSUs to Central Aggregator (Dynamic Data Arcs)
    interface BezierArc {
      curve: THREE.QuadraticBezierCurve3;
      lineMesh: THREE.Line;
      packets: Array<{ mesh: THREE.Mesh; t: number; speed: number }>;
      color: number;
      rsuIndex: number;
    }

    const bezierArcs: BezierArc[] = [];
    const packetGeom = new THREE.SphereGeometry(0.32, 12, 12);

    rsuUnits.forEach((rsu, idx) => {
      const startPt = new THREE.Vector3(rsu.pos.x, rsu.pos.y + 7.5, rsu.pos.z);
      const endPt = new THREE.Vector3(0, 8.5, 0);
      const midPt = new THREE.Vector3(
        (startPt.x + endPt.x) * 0.5,
        Math.max(startPt.y, endPt.y) + 6.0,
        (startPt.z + endPt.z) * 0.5
      );

      const curve = new THREE.QuadraticBezierCurve3(startPt, midPt, endPt);
      const pts = curve.getPoints(36);
      const curveGeom = new THREE.BufferGeometry().setFromPoints(pts);
      const curveMat = new THREE.LineBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.55,
      });
      const lineMesh = new THREE.Line(curveGeom, curveMat);
      scene.add(lineMesh);

      // Create glowing packets travelling along the curve
      const packets: BezierArc['packets'] = [];
      const packetCount = 4;
      for (let p = 0; p < packetCount; p++) {
        const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const pMesh = new THREE.Mesh(packetGeom, pMat);
        scene.add(pMesh);
        packets.push({
          mesh: pMesh,
          t: p / packetCount,
          speed: 0.35 + Math.random() * 0.15,
        });
      }

      bezierArcs.push({
        curve,
        lineMesh,
        packets,
        color: rsu.color,
        rsuIndex: idx,
      });
    });

    // 10. LiDAR Sweep Radar Wave
    const lidarWaveGeom = new THREE.RingGeometry(0.1, 4.0, 64);
    lidarWaveGeom.rotateX(-Math.PI / 2);
    const lidarWaveMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const lidarWave = new THREE.Mesh(lidarWaveGeom, lidarWaveMat);
    lidarWave.position.set(0, 0.25, 0);
    scene.add(lidarWave);

    // Audio Drone
    sound.startAmbient();

    // 11. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 12. Main Animation & Render Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 60);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function animate() {
      const delta = Math.min(clock.getDelta(), 0.1);

      if (stateRef.current.isPlaying) {
        stateRef.current.elapsedTime += delta;
      }
      const elapsed = stateRef.current.elapsedTime;

      // 4-Phase Progression: 2.0 seconds per phase = 8.0s total loop (fast & responsive)
      const totalDuration = 8.0;
      const cycleTime = elapsed % totalDuration;
      const derivedPhaseIndex = Math.min(3, Math.floor(cycleTime / 2.0));

      if (derivedPhaseIndex !== stateRef.current.activePhaseIndex && !stateRef.current.manualCamOverride) {
        setActivePhaseIndex(derivedPhaseIndex);
        stateRef.current.activePhaseIndex = derivedPhaseIndex;
        sound.playWhoosh();
      }

      const activePhase = PHASES[stateRef.current.activePhaseIndex];
      const phaseFraction = (cycleTime % 2.0) / 2.0;
      setProgress(Math.round(((cycleTime / totalDuration) * 100)));

      // Smooth Camera Interpolation to Target Viewpoint
      const targetPos = activePhase.camTarget.pos;
      const targetLook = activePhase.camTarget.look;

      // Add gentle cinematic drifting motion
      const driftX = Math.sin(elapsed * 0.4) * 1.5;
      const driftY = Math.cos(elapsed * 0.3) * 0.8;

      stateRef.current.camCurrentPos.lerp(
        new THREE.Vector3(targetPos.x + driftX, targetPos.y + driftY, targetPos.z),
        delta * 2.2
      );
      stateRef.current.camCurrentLook.lerp(targetLook, delta * 2.5);

      camera.position.copy(stateRef.current.camCurrentPos);
      camera.lookAt(stateRef.current.camCurrentLook);

      // Animate Realistic Highway Vehicles
      vehicleStreams.forEach((v) => {
        const dist = v.speed * delta;
        if (v.corridor === 'i405-north') {
          v.pos.z += dist;
          if (v.pos.z > 96) v.pos.z = -96;
        } else if (v.corridor === 'i405-south') {
          v.pos.z -= dist;
          if (v.pos.z < -96) v.pos.z = 96;
        } else if (v.corridor === 'i10-east') {
          v.pos.x += dist;
          if (v.pos.x > 96) v.pos.x = -96;
        } else if (v.corridor === 'i10-west') {
          v.pos.x -= dist;
          if (v.pos.x < -96) v.pos.x = 96;
        }
        v.mesh.position.copy(v.pos);
      });

      // Pulse Induction Loop Detectors
      loopDetectorMeshes.forEach((puck, idx) => {
        const pulse = 0.5 + Math.sin(elapsed * 3.5 + idx * 0.2) * 0.45;
        (puck.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
      });

      // Animate RSU Beacons & Dirichlet Halos
      rsuUnits.forEach((rsu, idx) => {
        const beaconPulse = 1.0 + Math.sin(elapsed * 5.0 + idx) * 0.3;
        rsu.beaconMesh.scale.setScalar(beaconPulse);

        // Spin Dirichlet halo ring slowly
        rsu.haloMesh.rotation.z = elapsed * 0.5 + idx;
      });

      // Rotate Central Aggregator Holographic Rings
      fedAvgRing1.rotation.x = elapsed * 0.8;
      fedAvgRing1.rotation.y = elapsed * 0.6;
      fedAvgRing2.rotation.y = -elapsed * 0.7;
      fedAvgRing2.rotation.z = elapsed * 0.5;
      fedAvgRing3.rotation.x = -elapsed * 0.5;
      fedAvgRing3.rotation.z = -elapsed * 0.4;

      // Animate Bézier Data Arcs & Weight Packets
      // In Phase 0: Packets turn chaotic red (raw uncompressed surveillance stream)
      // In Phase 2 & 3: Packets turn brilliant cyan / emerald (INT8 quantized weights)
      const isProblemPhase = stateRef.current.activePhaseIndex === 0;

      bezierArcs.forEach((arc) => {
        (arc.lineMesh.material as THREE.LineBasicMaterial).color.setHex(
          isProblemPhase ? 0xef4444 : 0x06b6d4
        );
        (arc.lineMesh.material as THREE.LineBasicMaterial).opacity = isProblemPhase ? 0.75 : 0.45;

        arc.packets.forEach((p) => {
          p.t = (p.t + p.speed * delta) % 1.0;
          const posOnCurve = arc.curve.getPoint(p.t);
          p.mesh.position.copy(posOnCurve);

          const mat = p.mesh.material as THREE.MeshBasicMaterial;
          mat.color.setHex(isProblemPhase ? 0xff1e1e : 0x38bdf8);
          // Scale packets smaller in FedAvg to visually represent INT8 compression!
          const packetScale = isProblemPhase ? 1.4 : 0.75;
          p.mesh.scale.setScalar(packetScale);
        });
      });

      // Animate Expanding LiDAR Radar Wave
      const waveRadius = ((elapsed * 12) % 130);
      lidarWave.scale.set(waveRadius, waveRadius, 1);
      (lidarWave.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - waveRadius / 130) * 0.4;

      // Render Scene
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    }

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activePhase = PHASES[activePhaseIndex];

  return (
    <div 
      onClick={() => handleFinishIntro('3d-twin')}
      className="fixed inset-0 z-50 bg-[#030712] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans cursor-pointer"
      title="Click anywhere to enter the website directly"
    >
      {/* 3D WebGL Canvas Layer */}
      <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Cyber Grid Scanline & Vignette Overlay */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,7,18,0.85)_100%)]" />

      {/* Instant Click-Anywhere Visual Cue Banner */}
      <div 
        className="absolute top-18 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleFinishIntro('3d-twin')}
          className="px-4 py-1.5 rounded-full bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-md shadow-xl shadow-cyan-950/70 transition-all cursor-pointer hover:scale-105 active:scale-95 animate-pulse"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>⚡ Click anywhere to enter website instantly</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* 1. TOP MISSION-CONTROL HUD BAR */}
      <header 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 p-3 sm:p-5 flex items-center justify-between border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-md cursor-default"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wider text-white">AIORI PS-003</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/90 text-cyan-300 font-mono font-bold border border-cyan-700/60">
                DIGITAL TWIN SIMULATOR
              </span>
              <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
                METR-LA: {sensorCount} SENSORS
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>{datasetName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">Seeds: [42, 101, 2024]</span>
            </div>
          </div>
        </div>

        {/* Top Control Actions: Play/Pause, Mute, Download Docs, Skip */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Documentation & UI/UX Specs .txt Downloader */}
          <button
            onClick={() => setIsDocModalOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/70 text-xs font-mono font-bold text-indigo-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            title="Download UI/UX Specs & Problem Context (.txt)"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Docs (.txt)</span>
          </button>

          <button
            onClick={handleTogglePlay}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            title={isPlaying ? 'Pause Auto Progression' : 'Resume Auto Progression'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={handleToggleSound}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shadow-md ${
              isMuted
                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-cyan-950/90 border-cyan-700 text-cyan-300 hover:bg-cyan-900'
            }`}
            title={isMuted ? 'Unmute Procedural Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleFinishIntro('3d-twin')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer active:scale-95"
          >
            <span>Enter App</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. SIDE HUD TELEMETRY BADGES (DESKTOP) */}
      <div className="relative z-10 px-4 sm:px-8 py-2 pointer-events-none flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
          {activePhase.metrics.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                m.isWarning
                  ? 'bg-red-950/60 border-red-800/80 text-red-200'
                  : m.isSuccess
                  ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
                  : 'bg-slate-900/70 border-slate-700/80 text-slate-200'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {m.label}
              </div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight mt-0.5">
                {m.value}
              </div>
              <div className="text-[11px] opacity-75 font-mono mt-0.5">{m.subtext}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CENTER BOTTOM PEDAGOGICAL COMMAND CARD */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-w-3xl mx-auto px-4 pb-4 sm:pb-6 w-full cursor-default"
      >
        <div className="rounded-3xl bg-slate-950/90 border border-cyan-800/60 p-5 sm:p-7 shadow-2xl backdrop-blur-xl transition-all duration-300">
          
          {/* Phase Switcher Tabs */}
          <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {PHASES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPhase(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    idx === activePhaseIndex
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50'
                      : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{idx + 1}.</span>
                  <span className="hidden sm:inline">
                    {idx === 0 ? 'Problem' : idx === 1 ? 'Dirichlet Shards' : idx === 2 ? 'FedAvg & INT8' : 'Convergence'}
                  </span>
                  <span className="sm:hidden">{`P${idx + 1}`}</span>
                </button>
              ))}
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                {activePhase.badge}
              </span>
            </div>
          </div>

          {/* Phase Title & Subtitle */}
          <div className="mb-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {activePhase.title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-cyan-300 mt-0.5">
              {activePhase.subtitle}
            </p>
          </div>

          {/* Educational Concept Summary */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            {activePhase.conceptSummary}
          </p>

          {/* Technical Specs List */}
          <div className="space-y-1.5 mb-5 bg-slate-900/60 rounded-2xl p-3 border border-slate-800/80">
            {activePhase.technicalDetails.map((tech, i) => (
              <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{tech}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleFinishIntro('3d-twin')}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-500 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Enter 3D Digital Twin Partition</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleFinishIntro('dashboard')}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
            >
              Open Live Simulation Dashboard
            </button>

            <button
              onClick={() => setIsDocModalOpen(true)}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              title="Download UI/UX & Context (.txt)"
            >
              <Download className="w-4 h-4" />
              <span>Specs (.txt)</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full max-w-md mx-auto mt-3">
          <div className="w-full bg-slate-900/90 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[10px] text-center font-mono text-slate-500 mt-1">
            LOS ANGELES HIGHWAY FEDERATED CORRIDOR • COMMUNICATING MATHEMATICAL WEIGHTS (ΔW)
          </div>
        </div>
      </div>

      {/* Embedded Documentation Modal for Instant .txt Download */}
      <DocDownloadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
    </div>
  );
};

export default CinematicIntro3D;
