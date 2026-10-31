// 3D Digital Twin View
// Interactive 3D Website and Model Inspection Studio
// Adheres strictly to Three.js and Frontend UX Directives:
// - Full-bleed central 3D viewport
// - Collapsible bottom control dock (<= 15% footprint, solid rgba surfaces, no backdrop-filter over WebGL)
// - Material finishes, lighting presets, exploded view slider, camera views, and audio synthesis

import React, { useState } from 'react';
import { ThreeViewport, CameraPreset } from '../three/ThreeViewport';
import { ControlOverlay } from '../three/ControlOverlay';
import { MaterialFinish, LightingMood, ExplodedPart } from '../three/sceneBuilder';
import { sound } from '../three/audioEngine';

interface ThreeDigitalTwinViewProps {
  onSwitchToDashboard: () => void;
  onReplayIntro: () => void;
}

export const ThreeDigitalTwinView: React.FC<ThreeDigitalTwinViewProps> = ({
  onSwitchToDashboard,
  onReplayIntro,
}) => {
  const [finish, setFinish] = useState<MaterialFinish>('obsidian');
  const [mood, setMood] = useState<LightingMood>('studio');
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [selectedPart, setSelectedPart] = useState<ExplodedPart | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => sound.getIsMuted());

  const handleToggleAudio = () => {
    const muted = sound.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden bg-slate-950">
      {/* 1. Full-Bleed Interactive 3D Viewport */}
      <ThreeViewport
        finish={finish}
        mood={mood}
        explodedFactor={explodedFactor}
        cameraPreset={cameraPreset}
        autoRotate={autoRotate}
        onSelectPart={(part) => setSelectedPart(part)}
        className="w-full h-full"
      />

      {/* 2. Unified Collapsible Bottom Control Dock & Overlay */}
      <ControlOverlay
        finish={finish}
        onSelectFinish={(f) => setFinish(f)}
        mood={mood}
        onSelectMood={(m) => setMood(m)}
        explodedFactor={explodedFactor}
        onChangeExplodedFactor={(val) => setExplodedFactor(val)}
        cameraPreset={cameraPreset}
        onSelectCameraPreset={(p) => setCameraPreset(p)}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        selectedPart={selectedPart}
        onClosePartInfo={() => setSelectedPart(null)}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onSwitchToDashboard={onSwitchToDashboard}
        onReplayIntro={onReplayIntro}
      />
    </div>
  );
};
