// Procedural Canvas Textures generator
// Zero 404 dependencies: creates crisp, mathematically generated PBR maps in memory
import * as THREE from 'three';

export interface ProceduralTextures {
  solarAlbedo: THREE.CanvasTexture;
  circuitEmissive: THREE.CanvasTexture;
  asphaltAlbedo: THREE.CanvasTexture;
  radarHex: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  carbonFiber: THREE.CanvasTexture;
}

export function generateProceduralTextures(renderer: THREE.WebGLRenderer): ProceduralTextures {
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  // 1. Solar Photovoltaic Microgrid Albedo
  const solarCanvas = document.createElement('canvas');
  solarCanvas.width = 512;
  solarCanvas.height = 512;
  const solarCtx = solarCanvas.getContext('2d')!;

  // Deep dark indigo silicon base
  solarCtx.fillStyle = '#081329';
  solarCtx.fillRect(0, 0, 512, 512);

  // Solar cells grid
  solarCtx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  solarCtx.lineWidth = 2;
  const cellW = 512 / 8;
  const cellH = 512 / 8;

  for (let x = 0; x <= 512; x += cellW) {
    solarCtx.beginPath();
    solarCtx.moveTo(x, 0);
    solarCtx.lineTo(x, 512);
    solarCtx.stroke();
  }
  for (let y = 0; y <= 512; y += cellH) {
    solarCtx.beginPath();
    solarCtx.moveTo(0, y);
    solarCtx.lineTo(512, y);
    solarCtx.stroke();
  }

  // Thin silver busbars
  solarCtx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
  solarCtx.lineWidth = 1;
  for (let x = 4; x < 512; x += 16) {
    solarCtx.beginPath();
    solarCtx.moveTo(x, 0);
    solarCtx.lineTo(x, 512);
    solarCtx.stroke();
  }

  const solarAlbedo = new THREE.CanvasTexture(solarCanvas);
  solarAlbedo.colorSpace = THREE.SRGBColorSpace;
  solarAlbedo.wrapS = THREE.RepeatWrapping;
  solarAlbedo.wrapT = THREE.RepeatWrapping;
  solarAlbedo.repeat.set(2, 2);
  solarAlbedo.anisotropy = maxAnisotropy;

  // 2. Neural Circuit & Tensor Traces Emissive Texture
  const circuitCanvas = document.createElement('canvas');
  circuitCanvas.width = 512;
  circuitCanvas.height = 512;
  const cCtx = circuitCanvas.getContext('2d')!;
  cCtx.fillStyle = '#000000';
  cCtx.fillRect(0, 0, 512, 512);

  cCtx.strokeStyle = '#06b6d4'; // cyan
  cCtx.lineWidth = 3;
  cCtx.lineCap = 'round';

  // Draw cyber-neural traces
  for (let i = 0; i < 24; i++) {
    const startX = Math.random() * 512;
    const startY = Math.random() * 512;
    cCtx.beginPath();
    cCtx.moveTo(startX, startY);
    const midX = startX + (Math.random() - 0.5) * 80;
    const midY = startY + (Math.random() - 0.5) * 80;
    cCtx.lineTo(midX, midY);
    cCtx.lineTo(midX + 40, midY);
    cCtx.stroke();

    // Solder pad node
    cCtx.fillStyle = '#38bdf8';
    cCtx.beginPath();
    cCtx.arc(midX + 40, midY, 4, 0, Math.PI * 2);
    cCtx.fill();
  }

  const circuitEmissive = new THREE.CanvasTexture(circuitCanvas);
  circuitEmissive.colorSpace = THREE.SRGBColorSpace;
  circuitEmissive.anisotropy = maxAnisotropy;

  // 3. Asphalt Highway Surface with Road Markings
  const aspCanvas = document.createElement('canvas');
  aspCanvas.width = 512;
  aspCanvas.height = 512;
  const aCtx = aspCanvas.getContext('2d')!;

  // Dark road aggregate texture
  aCtx.fillStyle = '#1e293b';
  aCtx.fillRect(0, 0, 512, 512);

  // Micro gravel noise
  for (let i = 0; i < 2500; i++) {
    const gx = Math.random() * 512;
    const gy = Math.random() * 512;
    const gCol = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.15)';
    aCtx.fillStyle = gCol;
    aCtx.fillRect(gx, gy, 2, 2);
  }

  // Dashed lane lines
  aCtx.fillStyle = '#f8fafc';
  for (let y = 0; y < 512; y += 48) {
    aCtx.fillRect(170, y + 10, 8, 24);
    aCtx.fillRect(340, y + 10, 8, 24);
  }

  // Outer solid lane line
  aCtx.fillStyle = '#fbbf24'; // Amber outer edge line
  aCtx.fillRect(15, 0, 8, 512);
  aCtx.fillRect(490, 0, 8, 512);

  const asphaltAlbedo = new THREE.CanvasTexture(aspCanvas);
  asphaltAlbedo.colorSpace = THREE.SRGBColorSpace;
  asphaltAlbedo.wrapS = THREE.RepeatWrapping;
  asphaltAlbedo.wrapT = THREE.RepeatWrapping;
  asphaltAlbedo.repeat.set(1, 8);
  asphaltAlbedo.anisotropy = maxAnisotropy;

  // 4. Phased Array Radar Hexagonal Pattern
  const hexCanvas = document.createElement('canvas');
  hexCanvas.width = 256;
  hexCanvas.height = 256;
  const hCtx = hexCanvas.getContext('2d')!;
  hCtx.fillStyle = '#0f172a';
  hCtx.fillRect(0, 0, 256, 256);

  hCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  hCtx.lineWidth = 1.5;
  const hexRadius = 14;
  const hexH = hexRadius * Math.sqrt(3);

  for (let y = 0; y < 256 + hexH; y += hexH) {
    for (let x = 0; x < 256 + hexRadius * 3; x += hexRadius * 3) {
      drawHex(hCtx, x, y, hexRadius);
      drawHex(hCtx, x + hexRadius * 1.5, y + hexH / 2, hexRadius);
    }
  }

  function drawHex(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = cx + r * Math.cos(angle);
      const hy = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  const radarHex = new THREE.CanvasTexture(hexCanvas);
  radarHex.colorSpace = THREE.SRGBColorSpace;
  radarHex.wrapS = THREE.RepeatWrapping;
  radarHex.wrapT = THREE.RepeatWrapping;
  radarHex.repeat.set(3, 3);
  radarHex.anisotropy = maxAnisotropy;

  // 5. Soft Radial Ground Contact Shadow Map
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d')!;
  sCtx.clearRect(0, 0, 256, 256);

  const radGrad = sCtx.createRadialGradient(128, 128, 15, 128, 128, 120);
  radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  radGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.55)');
  radGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.18)');
  radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = radGrad;
  sCtx.fillRect(0, 0, 256, 256);

  const contactShadow = new THREE.CanvasTexture(shadowCanvas);
  contactShadow.colorSpace = THREE.NoColorSpace; // Data map

  // 6. Carbon Fiber Texture
  const cfCanvas = document.createElement('canvas');
  cfCanvas.width = 64;
  cfCanvas.height = 64;
  const cfCtx = cfCanvas.getContext('2d')!;
  cfCtx.fillStyle = '#1e293b';
  cfCtx.fillRect(0, 0, 64, 64);
  cfCtx.fillStyle = '#0f172a';
  cfCtx.fillRect(0, 0, 32, 32);
  cfCtx.fillRect(32, 32, 32, 32);

  const carbonFiber = new THREE.CanvasTexture(cfCanvas);
  carbonFiber.wrapS = THREE.RepeatWrapping;
  carbonFiber.wrapT = THREE.RepeatWrapping;
  carbonFiber.repeat.set(16, 16);
  carbonFiber.anisotropy = maxAnisotropy;

  return {
    solarAlbedo,
    circuitEmissive,
    asphaltAlbedo,
    radarHex,
    contactShadow,
    carbonFiber
  };
}
