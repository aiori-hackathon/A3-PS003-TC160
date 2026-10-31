import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  SkipForward, 
  Network, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Radio, 
  ArrowRight,
  Sparkles,
  Car,
  Layers,
  Database,
  Globe,
  Cpu
} from 'lucide-react';

interface TrafficIntroAnimationProps {
  onComplete: () => void;
  datasetName?: string;
  sensorCount?: number;
}

export const TrafficIntroAnimation: React.FC<TrafficIntroAnimationProps> = ({
  onComplete,
  datasetName = 'METR-LA (Los Angeles Highway Network)',
  sensorCount = 207
}) => {
  const [progress, setProgress] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Derive step from progress
  const currentStep = progress < 25 ? 0 : progress < 50 ? 1 : progress < 75 ? 2 : 3;

  const steps = [
    {
      title: 'Decentralized Smart Mobility',
      subtitle: 'PS-003: Federated Traffic-Flow Forecasting & Communication-Cost Evaluation',
      detail: 'Eliminating centralized raw video streaming to protect commuter privacy on edge highways.'
    },
    {
      title: 'METR-LA Highway Loop Detectors',
      subtitle: `${sensorCount} Real-World Induction Sensors Across I-405, I-10, US-101 & I-110`,
      detail: 'Capturing shockwave deceleration bottlenecks, spatial-temporal flow, and velocity patterns.'
    },
    {
      title: 'Non-IID Dirichlet Shard Partitioning',
      subtitle: 'Spatial Heterogeneity Handled Across Edge Roadside Units (RSUs)',
      detail: 'Local gradient training on edge RSUs with FedAvg consensus and INT8 quantization.'
    },
    {
      title: 'Consensus & Language Customization',
      subtitle: '75% Communication Byte Savings • Multilingual Indian & Southern Support',
      detail: 'Launching AIORI Suite with real-time predictions, Colab GPU sync, and simulation comparison.'
    }
  ];

  // Canvas Traffic Highway Simulation Animation with Lighter, Eye-Catching Visuals
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Lighter, luminous aesthetic vehicles
    interface Vehicle {
      x: number;
      lane: number;
      speed: number;
      color: string;
      trailColor: string;
      length: number;
      glow: number;
    }

    const lanes = 4;
    const laneHeight = 32;
    const highwayY = height / 2 - (lanes * laneHeight) / 2;

    const vehicles: Vehicle[] = [];
    const colors = [
      { body: '#0284c7', trail: 'rgba(2, 132, 199, 0.45)' }, // sky blue
      { body: '#2563eb', trail: 'rgba(37, 99, 235, 0.45)' }, // royal blue
      { body: '#0d9488', trail: 'rgba(13, 148, 136, 0.45)' }, // teal
      { body: '#d97706', trail: 'rgba(217, 119, 6, 0.45)' },  // amber
      { body: '#7c3aed', trail: 'rgba(124, 58, 237, 0.45)' }, // violet
      { body: '#059669', trail: 'rgba(5, 150, 105, 0.45)' }  // emerald
    ];

    for (let i = 0; i < 30; i++) {
      const palette = colors[Math.floor(Math.random() * colors.length)];
      vehicles.push({
        x: Math.random() * width,
        lane: Math.floor(Math.random() * lanes),
        speed: 1.8 + Math.random() * 2.8,
        color: palette.body,
        trailColor: palette.trail,
        length: 22 + Math.random() * 16,
        glow: 8 + Math.random() * 10
      });
    }

    // Roadside RSU towers with pulsing radar waves
    const rsuTowers = [
      { x: width * 0.16, y: highwayY - 35, name: 'RSU-01 (I-405)' },
      { x: width * 0.40, y: highwayY + lanes * laneHeight + 35, name: 'RSU-02 (I-10)' },
      { x: width * 0.64, y: highwayY - 35, name: 'RSU-03 (US-101)' },
      { x: width * 0.86, y: highwayY + lanes * laneHeight + 35, name: 'RSU-04 (I-110)' }
    ];

    // Induction Loop sensors in asphalt
    const loopSensors = [
      { x: width * 0.25, lane: 0, active: 0 },
      { x: width * 0.25, lane: 1, active: 0 },
      { x: width * 0.25, lane: 2, active: 0 },
      { x: width * 0.25, lane: 3, active: 0 },
      { x: width * 0.52, lane: 0, active: 0 },
      { x: width * 0.52, lane: 1, active: 0 },
      { x: width * 0.52, lane: 2, active: 0 },
      { x: width * 0.52, lane: 3, active: 0 },
      { x: width * 0.78, lane: 0, active: 0 },
      { x: width * 0.78, lane: 1, active: 0 },
      { x: width * 0.78, lane: 2, active: 0 },
      { x: width * 0.78, lane: 3, active: 0 }
    ];

    let tick = 0;

    const render = () => {
      tick++;

      // 1. Lighter, radiant modern background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#f8fafc');   // slate-50
      bgGrad.addColorStop(0.5, '#f0f9ff'); // sky-50
      bgGrad.addColorStop(1, '#eef2ff');   // indigo-50
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Delicate background grid lines
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)'; // slate-300
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Highway Road Surface (Sleek slate-800 asphalt with subtle highway glow)
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(0, highwayY, width, lanes * laneHeight);

      // Highway borders (radiant cyan boundaries)
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, highwayY);
      ctx.lineTo(width, highwayY);
      ctx.moveTo(0, highwayY + lanes * laneHeight);
      ctx.lineTo(width, highwayY + lanes * laneHeight);
      ctx.stroke();

      // Dashed lane divider markings (white/amber glow)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([16, 18]);
      ctx.lineDashOffset = -tick * 3.2;

      for (let l = 1; l < lanes; l++) {
        const y = highwayY + l * laneHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset dash

      // 3. Draw Induction Loop Sensors embedded in road lanes
      loopSensors.forEach(sensor => {
        const sensorY = highwayY + sensor.lane * laneHeight + 6;
        const isPulse = (tick + sensor.x) % 50 < 12;

        ctx.fillStyle = isPulse ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)';
        ctx.strokeStyle = isPulse ? '#0284c7' : 'rgba(14, 165, 233, 0.5)';
        ctx.lineWidth = 1.5;

        ctx.fillRect(sensor.x, sensorY, 18, laneHeight - 12);
        ctx.strokeRect(sensor.x, sensorY, 18, laneHeight - 12);

        if (isPulse) {
          ctx.beginPath();
          ctx.arc(sensor.x + 9, sensorY + (laneHeight - 12) / 2, 14, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.stroke();
        }
      });

      // 4. Draw Moving Vehicles with Luminous Headlights and Motion Trails
      vehicles.forEach(v => {
        v.x += v.speed;
        if (v.x > width + 60) {
          v.x = -60;
          v.lane = Math.floor(Math.random() * lanes);
        }

        const vy = highwayY + v.lane * laneHeight + (laneHeight - 12) / 2;

        // Vehicle motion tail glow
        const tailGrad = ctx.createLinearGradient(v.x - v.length * 1.5, vy + 6, v.x, vy + 6);
        tailGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        tailGrad.addColorStop(1, v.trailColor);
        ctx.fillStyle = tailGrad;
        ctx.fillRect(v.x - v.length * 1.2, vy + 2, v.length * 1.2, 8);

        // Vehicle body with rounded capsule
        ctx.fillStyle = v.color;
        ctx.shadowColor = v.color;
        ctx.shadowBlur = v.glow;
        ctx.beginPath();
        ctx.roundRect(v.x, vy, v.length, 12, [3, 6, 6, 3]);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Headlight beam (forward illumination)
        const lightGrad = ctx.createLinearGradient(v.x + v.length, vy + 6, v.x + v.length + 35, vy + 6);
        lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
        lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.moveTo(v.x + v.length, vy + 3);
        ctx.lineTo(v.x + v.length + 35, vy - 2);
        ctx.lineTo(v.x + v.length + 35, vy + 14);
        ctx.lineTo(v.x + v.length, vy + 9);
        ctx.closePath();
        ctx.fill();
      });

      // 5. Draw Roadside Units (RSU Towers) & Radar Consensus Pulses
      rsuTowers.forEach((rsu, i) => {
        // Pulsing radar ripples
        const pulseRadius = ((tick * 1.5 + i * 40) % 110);
        const pulseAlpha = Math.max(0, 1 - pulseRadius / 110);

        ctx.strokeStyle = `rgba(14, 165, 233, ${pulseAlpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rsu.x, rsu.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        // RSU node icon circle
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(rsu.x, rsu.y, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(rsu.x, rsu.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(rsu.name, rsu.x, rsu.y > highwayY ? rsu.y + 22 : rsu.y - 14);

        // Mathematical weight transmission beam between RSUs (Federated consensus)
        if (i < rsuTowers.length - 1) {
          const nextRsu = rsuTowers[i + 1];
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
          ctx.setLineDash([4, 6]);
          ctx.lineDashOffset = -tick;
          ctx.beginPath();
          ctx.moveTo(rsu.x, rsu.y);
          ctx.lineTo(nextRsu.x, nextRsu.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Timed progress driver for the 4 intro steps
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 70); // ~7 seconds total animation

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-white mb-6 animate-in fade-in duration-300">
      {/* Top Banner Ribbon */}
      <div className="px-6 py-3.5 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block">
              AIORI Smart Cities Challenge • PS-003
            </span>
            <span className="text-[11px] text-cyan-100 font-medium">
              Federated Traffic-Flow Prediction & Communication-Cost Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
          >
            <span>Skip Intro</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Luminous Traffic Canvas */}
      <div className="relative w-full h-[260px] sm:h-[300px]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating Metrics Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs font-bold text-slate-800">Dataset:</span>
            <span className="font-mono text-xs font-bold text-cyan-700">{datasetName.split(' ')[0]}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800">Sensors:</span>
            <span className="font-mono text-xs font-bold text-indigo-700">{sensorCount} Detectors</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">Privacy:</span>
            <span className="text-xs font-bold text-emerald-700">Zero Raw Video Streams</span>
          </div>
        </div>

        {/* Live Step Progress Box (Lighter, Eye-Catching) */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                Phase {currentStep + 1} of 4
              </span>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {steps[currentStep].title}
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-700">
              {steps[currentStep].subtitle}
            </p>
            <p className="text-[11px] text-slate-500">
              {steps[currentStep].detail}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {progress < 100 ? (
              <div className="w-24 sm:w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : null}

            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-900/15 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 active:shadow-inner cursor-pointer"
            >
              <span>{progress >= 100 ? 'Explore Application' : 'Skip & Start'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
