// Interactive Three.js WebGL Viewport
// Strictly follows Three.js Skill Directives:
// - Isolated ref container for canvas (no React teardown on prop updates)
// - isSoftwareGl hardware detection via WEBGL_debug_renderer_info
// - Loop pacing via afterDraw fence sync when software WebGL is active
// - Silky smooth exponential damping for camera glide
// - Zero GC in per-frame tick

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { generateProceduralTextures } from './proceduralTextures';
import { build3DScene, MaterialFinish, LightingMood, SceneBundle, ExplodedPart } from './sceneBuilder';
import { sound } from './audioEngine';

export type CameraPreset = 'overview' | 'core' | 'sensors' | 'highway' | 'blueprint';

interface ThreeViewportProps {
  finish: MaterialFinish;
  mood: LightingMood;
  explodedFactor: number;
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  onSelectPart?: (part: ExplodedPart | null) => void;
  className?: string;
}

// Pre-allocated math objects to eliminate runtime GC in render loop
const _camTargetPos = new THREE.Vector3();
const _camLookAt = new THREE.Vector3();
const _currentTargetLookAt = new THREE.Vector3(0, 3.2, 0);

export const ThreeViewport: React.FC<ThreeViewportProps> = ({
  finish,
  mood,
  explodedFactor,
  cameraPreset,
  autoRotate,
  onSelectPart,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const bundleRef = useRef<SceneBundle | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 17,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });
  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;

  const currentPresetRef = useRef<CameraPreset>(cameraPreset);
  currentPresetRef.current = cameraPreset;

  const explodedFactorRef = useRef<number>(explodedFactor);
  explodedFactorRef.current = explodedFactor;

  const [hoveredPartName, setHoveredPartName] = useState<string | null>(null);

  // Initialize WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL from GPU renderer string
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

    // 2. Setup WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    if (!isSoftwareGl) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // 3. Generate procedural textures & build scene
    const textures = generateProceduralTextures(renderer);
    const bundle = build3DScene(renderer, textures, isSoftwareGl);
    bundleRef.current = bundle;

    bundle.camera.aspect = width / height;
    bundle.camera.updateProjectionMatrix();

    if (!isSoftwareGl) {
      renderer.compile(bundle.scene, bundle.camera);
    }

    // 4. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          renderer.setSize(w, h, false);
          bundle.camera.aspect = w / h;
          bundle.camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    // 5. Render Loop with afterDraw pacing for software WebGL
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
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Update scene animations and exploded positions
      bundle.updateAnimation(delta, elapsed, explodedFactorRef.current);

      // Handle Camera preset interpolation
      let targetRadius = 17;
      let targetPhi = Math.PI / 3;
      let targetCenter = new THREE.Vector3(0, 3.2, 0);

      switch (currentPresetRef.current) {
        case 'overview':
          targetRadius = 17;
          targetPhi = Math.PI / 3;
          targetCenter.set(0, 3.2, 0);
          break;
        case 'core':
          targetRadius = 6.5;
          targetPhi = Math.PI / 2.3;
          targetCenter.set(0, 4.2, 0);
          break;
        case 'sensors':
          targetRadius = 7.0;
          targetPhi = Math.PI / 2.8;
          targetCenter.set(0, 5.8, 0);
          break;
        case 'highway':
          targetRadius = 15;
          targetPhi = Math.PI / 2.15;
          targetCenter.set(0, 0.8, 4.5);
          break;
        case 'blueprint':
          targetRadius = 19;
          targetPhi = 0.08; // almost straight down
          targetCenter.set(0, 2.5, 0);
          break;
      }

      // Smoothly damp target center
      _currentTargetLookAt.x = THREE.MathUtils.damp(_currentTargetLookAt.x, targetCenter.x, 5, delta);
      _currentTargetLookAt.y = THREE.MathUtils.damp(_currentTargetLookAt.y, targetCenter.y, 5, delta);
      _currentTargetLookAt.z = THREE.MathUtils.damp(_currentTargetLookAt.z, targetCenter.z, 5, delta);

      // Auto-rotation around current center when enabled and not dragging
      if (autoRotateRef.current && !isDraggingRef.current && currentPresetRef.current === 'overview') {
        sphericalRef.current.theta += delta * 0.35;
      }

      if (!isDraggingRef.current) {
        sphericalRef.current.radius = THREE.MathUtils.damp(sphericalRef.current.radius, targetRadius, 4, delta);
        sphericalRef.current.phi = THREE.MathUtils.damp(sphericalRef.current.phi, targetPhi, 4, delta);
      }

      // Convert spherical coordinates to cartesian camera position
      const sinPhiRadius = Math.sin(sphericalRef.current.phi) * sphericalRef.current.radius;
      _camTargetPos.set(
        _currentTargetLookAt.x + sinPhiRadius * Math.sin(sphericalRef.current.theta),
        _currentTargetLookAt.y + Math.cos(sphericalRef.current.phi) * sphericalRef.current.radius,
        _currentTargetLookAt.z + sinPhiRadius * Math.cos(sphericalRef.current.theta)
      );

      bundle.camera.position.x = THREE.MathUtils.damp(bundle.camera.position.x, _camTargetPos.x, 8, delta);
      bundle.camera.position.y = THREE.MathUtils.damp(bundle.camera.position.y, _camTargetPos.y, 8, delta);
      bundle.camera.position.z = THREE.MathUtils.damp(bundle.camera.position.z, _camTargetPos.z, 8, delta);

      bundle.camera.lookAt(_currentTargetLookAt);

      renderer.render(bundle.scene, bundle.camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // 6. User Orbit & Interaction Handlers
    const domElement = renderer.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      domElement.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) {
        // High-performance hover raycasting
        const rect = domElement.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), bundle.camera);

        const meshes = bundle.explodedParts.map((p) => p.mesh);
        const intersects = raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
          const hitObj = intersects[0].object;
          let matchedPart = bundle.explodedParts.find((p) => p.mesh === hitObj);
          if (!matchedPart) {
            // Check parent
            matchedPart = bundle.explodedParts.find((p) => p.mesh === hitObj.parent);
          }
          if (matchedPart) {
            setHoveredPartName(matchedPart.name);
          }
        } else {
          setHoveredPartName(null);
        }
        return;
      }

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      sphericalRef.current.theta -= deltaX * 0.007;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, sphericalRef.current.phi - deltaY * 0.007));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      try {
        domElement.releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(4.5, Math.min(30, sphericalRef.current.radius + e.deltaY * 0.015));
    };

    // Click inspection
    const handleClick = (e: MouseEvent) => {
      const rect = domElement.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), bundle.camera);

      const meshes = bundle.explodedParts.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        let matchedPart = bundle.explodedParts.find((p) => p.mesh === hitObj);
        if (!matchedPart) {
          matchedPart = bundle.explodedParts.find((p) => p.mesh === hitObj.parent);
        }
        if (matchedPart && onSelectPart) {
          sound.playClick();
          onSelectPart(matchedPart);
        }
      }
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    domElement.addEventListener('click', handleClick);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();

      domElement.removeEventListener('pointerdown', handlePointerDown);
      domElement.removeEventListener('pointermove', handlePointerMove);
      domElement.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('click', handleClick);

      renderer.dispose();
      if (domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    };
  }, []);

  // Update dynamic finish
  useEffect(() => {
    if (bundleRef.current) {
      bundleRef.current.applyFinish(finish);
    }
  }, [finish]);

  // Update dynamic lighting mood
  useEffect(() => {
    if (bundleRef.current) {
      bundleRef.current.applyLightingMood(mood);
    }
  }, [mood]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      {/* 100% Unobstructed WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Hover Spec Badge (Subtle top-center, clean non-pulsating indicator) */}
      {hoveredPartName && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs font-mono text-cyan-200 shadow-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-semibold">{hoveredPartName}</span>
            <span className="text-slate-400 text-[10px]">• Click to Inspect</span>
          </div>
        </div>
      )}
    </div>
  );
};
