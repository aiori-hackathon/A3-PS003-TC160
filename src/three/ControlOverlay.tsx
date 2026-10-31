// Ergonomic Collapsible Bottom Control Dock
// Strictly complies with Three.js Skill Directives:
// - 100% Unobstructed Center Viewport
// - Single unified dock at bottom-center (<= 15% viewport footprint)
// - Solid / rgba surfaces (NO backdrop-filter / backdrop-blur over WebGL canvas)
// - Collapsible "Cinema / Zen Mode" drawer with clean toggle
// - Clean static status indicators (NO pulsating dots or @keyframes pulse)
// - Integrated Web Audio triggers for tactile feedback

import React, { useState } from 'react';
import { MaterialFinish, LightingMood, ExplodedPart } from './sceneBuilder';
import { CameraPreset } from './ThreeViewport';
import { sound } from './audioEngine';
import { 
  Layers, 
  Sun, 
  Camera, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info,
  X,
  Compass,
  Zap,
  Sliders
} from 'lucide-react';

interface ControlOverlayProps {
  finish: MaterialFinish;
  onSelectFinish: (f: MaterialFinish) => void;
  mood: LightingMood;
  onSelectMood: (m: LightingMood) => void;
  explodedFactor: number;
  onChangeExplodedFactor: (factor: number) => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  selectedPart: ExplodedPart | null;
  onClosePartInfo: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onSwitchToDashboard?: () => void;
  onReplayIntro?: () => void;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  finish,
  onSelectFinish,
  mood,
  onSelectMood,
  explodedFactor,
  onChangeExplodedFactor,
  cameraPreset,
  onSelectCameraPreset,
  autoRotate,
  onToggleAutoRotate,
  selectedPart,
  onClosePartInfo,
  isAudioMuted,
  onToggleAudio,
  onSwitchToDashboard,
  onReplayIntro,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'explode' | 'materials' | 'lighting' | 'camera'>('explode');

  const finishes: Array<{ id: MaterialFinish; label: string; color: string; border: string }> = [
    { id: 'obsidian', label: 'Obsidian Titanium', color: 'bg-slate-800', border: 'border-slate-600' },
    { id: 'gold', label: 'Cybernetic Gold', color: 'bg-amber-600', border: 'border-amber-400' },
    { id: 'azure', label: 'Azure Cobalt', color: 'bg-blue-600', border: 'border-blue-400' },
    { id: 'ceramic', label: 'Pristine Ceramic', color: 'bg-slate-100', border: 'border-slate-300' },
  ];

  const moods: Array<{ id: LightingMood; label: string; icon: string }> = [
    { id: 'studio', label: 'Studio PBR', icon: '☀️' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: '🌆' },
    { id: 'golden', label: 'Highway Sunset', icon: '🌅' },
    { id: 'deepspace', label: 'Deep Space Grid', icon: '🌌' },
  ];

  const cameraPresets: Array<{ id: CameraPreset; label: string }> = [
    { id: 'overview', label: 'Overview Orbit' },
    { id: 'core', label: 'Neural Core' },
    { id: 'sensors', label: 'LiDAR Sensors' },
    { id: 'highway', label: 'Highway Loops' },
    { id: 'blueprint', label: 'Top Blueprint' },
  ];

  const handleFinishClick = (f: MaterialFinish) => {
    sound.playChime();
    onSelectFinish(f);
  };

  const handleMoodClick = (m: LightingMood) => {
    sound.playClick();
    onSelectMood(m);
  };

  const handleCameraClick = (p: CameraPreset) => {
    sound.playWhoosh();
    onSelectCameraPreset(p);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChangeExplodedFactor(val);
    sound.playServoTone(300 + val * 400);
  };

  return (
    <>
      {/* 1. Minimal Top Bar (Spec Badge & Quick Audio / Intro / Dashboard Actions) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        {/* Left: 3D Digital Twin Identity Badge */}
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <div>
            <div className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
              <span>METR-LA RSU-405 DIGITAL TWIN</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800">
                THREE.JS PBR
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Los Angeles Highway Network • FedAvg INT8 Core
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {onReplayIntro && (
            <button
              onClick={() => {
                sound.playWhoosh();
                onReplayIntro();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all duration-150 active:scale-95 cursor-pointer shadow-lg flex items-center gap-1.5"
              title="Replay 3D Cinematic Traffic Intro"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Intro</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onToggleAudio();
            }}
            className={`p-2 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer shadow-lg ${
              isAudioMuted
                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                : 'bg-cyan-950 border-cyan-700 text-cyan-300 hover:bg-cyan-900'
            }`}
            title={isAudioMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {onSwitchToDashboard && (
            <button
              onClick={() => {
                sound.playClick();
                onSwitchToDashboard();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-xs font-bold text-white transition-all duration-150 active:scale-95 cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Analytics Dashboard</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Selected Component Inspector Modal (Clean, Non-Occluding Side Drawer on User Selection) */}
      {selectedPart && (
        <div className="absolute top-20 right-4 max-w-sm w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-20 text-white animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h4 className="text-xs font-bold text-cyan-200 tracking-wide font-mono uppercase">
                Component Telemetry
              </h4>
            </div>
            <button
              onClick={onClosePartInfo}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="text-sm font-bold text-white mb-1.5">{selectedPart.name}</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {selectedPart.description}
          </p>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Rest Position:</span>
              <span className="text-cyan-400">
                [{selectedPart.restPosition.x.toFixed(1)}, {selectedPart.restPosition.y.toFixed(1)}, {selectedPart.restPosition.z.toFixed(1)}]
              </span>
            </div>
            <div className="flex justify-between">
              <span>Separation Vector:</span>
              <span className="text-amber-400">
                [{selectedPart.explodedOffset.x.toFixed(1)}, {selectedPart.explodedOffset.y.toFixed(1)}, {selectedPart.explodedOffset.z.toFixed(1)}]
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Unified Bottom Control Dock (100% Unobstructed Center Viewport) */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 transition-transform duration-300 ease-out flex flex-col items-center"
        style={{
          width: 'min(940px, 94vw)',
          transform: isCollapsed ? 'translate(-50%, calc(100% - 32px))' : 'translate(-50%, 0)',
        }}
      >
        {/* Collapse / Expand Cinema Mode Handle */}
        <button
          onClick={() => {
            sound.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="px-4 py-1 rounded-t-xl bg-slate-900 border-t border-x border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xl cursor-pointer"
          title="Toggle Cinema / Zen Mode"
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isCollapsed ? 'Show Controls (H)' : 'Hide Controls'}</span>
        </button>

        {/* Dock Container: Solid / rgba surfaces (NO backdrop-filter) */}
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 sm:p-4 text-white">
          {/* Dock Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('explode');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'explode'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Exploded View</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('materials');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'materials'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Material Finish</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('lighting');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'lighting'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Atmosphere</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('camera');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'camera'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera Views</span>
              </button>
            </div>

            {/* Quick Auto-Rotate Toggle */}
            <button
              onClick={() => {
                sound.playClick();
                onToggleAutoRotate();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                autoRotate
                  ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle continuous orbit rotation"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-Orbit</span>
            </button>
          </div>

          {/* Tab 1: Exploded View Slider */}
          {activeTab === 'explode' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-xs font-medium text-slate-400 shrink-0">
                  Assembly (0%)
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedFactor}
                  onChange={handleSliderChange}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />
                <span className="text-xs font-mono font-bold text-cyan-400 shrink-0">
                  {Math.round(explodedFactor * 100)}% Exploded
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    sound.playServoTone(300);
                    onChangeExplodedFactor(0);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 cursor-pointer"
                >
                  Assembled
                </button>
                <button
                  onClick={() => {
                    sound.playServoTone(700);
                    onChangeExplodedFactor(1);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-cyan-400 cursor-pointer"
                >
                  Full Explode
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Material Finish Swatches */}
          {activeTab === 'materials' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {finishes.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFinishClick(f.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                    finish === f.id
                      ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border ${f.color} ${f.border} shrink-0`} />
                  <span className="text-xs font-semibold truncate">{f.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tab 3: Lighting Rig Moods */}
          {activeTab === 'lighting' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {moods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMoodClick(m.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                    mood === m.id
                      ? 'bg-slate-800 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">{m.icon}</span>
                  <span className="text-xs font-semibold truncate">{m.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tab 4: Camera View Director Pills */}
          {activeTab === 'camera' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {cameraPresets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleCameraClick(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 shrink-0 cursor-pointer ${
                    cameraPreset === p.id
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
