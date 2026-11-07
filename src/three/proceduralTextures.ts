import * as THREE from 'three';

/**
 * Procedural texture generator for Sarvadnya 3D environment.
 * Ensures zero external image dependencies (zero 404s) and high PBR fidelity.
 */

export function createStoneFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep midnight stone base
  ctx.fillStyle = '#08111e';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle natural aggregate noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    d[i] = Math.min(255, Math.max(0, d[i] + noise));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise + 2));
  }
  ctx.putImageData(imgData, 0, 0);

  // Architectural tile grid
  ctx.strokeStyle = 'rgba(213, 176, 108, 0.08)'; // faint champagne grout
  ctx.lineWidth = 2;
  const gridSize = 128;
  for (let x = 0; x <= 1024; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Micro expansion joints with subtle inner dark line
  ctx.strokeStyle = 'rgba(4, 9, 16, 0.7)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x - 1, 0);
    ctx.lineTo(x - 1, 1024);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm teak / walnut base
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#3d2516');
  grad.addColorStop(0.3, '#4a2f1b');
  grad.addColorStop(0.7, '#382012');
  grad.addColorStop(1, '#442918');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Organic wood grain lines
  ctx.strokeStyle = 'rgba(25, 14, 8, 0.45)';
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 512;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      170, y + (Math.random() - 0.5) * 20,
      340, y + (Math.random() - 0.5) * 20,
      512, y + (Math.random() - 0.5) * 10
    );
    ctx.stroke();
  }

  // Soft satin highlight streaks
  ctx.strokeStyle = 'rgba(213, 176, 108, 0.06)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 15; i++) {
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBrushedMetalNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgb(128, 128, 255)'; // Flat tangent-space normal
  ctx.fillRect(0, 0, 256, 256);

  // Fine brushed horizontal streaks in normal space
  for (let y = 0; y < 256; y += 2) {
    const jitter = Math.floor((Math.random() - 0.5) * 30);
    const r = Math.min(255, Math.max(0, 128 + jitter));
    ctx.strokeStyle = `rgb(${r}, 128, 255)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createFormulaPlateTexture(title: string, formulas: string[]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark frosted graphite backing
  ctx.fillStyle = 'rgba(10, 18, 29, 0.92)';
  ctx.fillRect(0, 0, 1024, 512);

  // Border frame
  ctx.strokeStyle = 'rgba(213, 176, 108, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, 992, 480);

  // Inner precision corner accents
  ctx.strokeStyle = 'rgba(118, 217, 239, 0.8)';
  ctx.lineWidth = 2;
  const len = 30;
  // corners
  ctx.beginPath();
  ctx.moveTo(24, 24 + len); ctx.lineTo(24, 24); ctx.lineTo(24 + len, 24);
  ctx.moveTo(1000 - len, 24); ctx.lineTo(1000, 24); ctx.lineTo(1000, 24 + len);
  ctx.moveTo(24, 488 - len); ctx.lineTo(24, 488); ctx.lineTo(24 + len, 488);
  ctx.moveTo(1000 - len, 488); ctx.lineTo(1000, 488); ctx.lineTo(1000, 488 - len);
  ctx.stroke();

  // Header Title
  ctx.fillStyle = '#D5B06C';
  ctx.font = '600 28px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText(title.toUpperCase(), 48, 70);

  // Small institute mark
  ctx.fillStyle = 'rgba(169, 179, 193, 0.7)';
  ctx.font = '400 16px "Manrope", sans-serif';
  ctx.fillText('SARVADNYA ACADEMIC ARCHIVE // NAGPUR', 48, 100);

  // Formulas
  ctx.fillStyle = '#F7F7F4';
  ctx.font = '500 36px "Space Grotesk", serif';
  let startY = 170;
  formulas.forEach((formula, i) => {
    ctx.fillStyle = i % 2 === 0 ? '#F7F7F4' : '#76D9EF';
    ctx.fillText(formula, 48, startY);
    startY += 65;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBookSpinesTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const palette = ['#1a2a3a', '#3a1e1e', '#1a3a2a', '#2c2214', '#151c28', '#2b1b36'];
  const titles = ['PHYSICS', 'CALCULUS', 'ORGANIC', 'ANATOMY', 'VECTORS', 'ALGEBRA', 'BOTANY', 'MECHANICS'];
  
  let x = 0;
  let titleIdx = 0;
  while (x < 512) {
    const width = 24 + Math.floor(Math.random() * 20);
    const color = palette[Math.floor(Math.random() * palette.length)];
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, width, 256);

    // Spine border
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, 0, width, 256);

    // Gold foil bands
    ctx.fillStyle = 'rgba(213, 176, 108, 0.7)';
    ctx.fillRect(x + 2, 25, width - 4, 3);
    ctx.fillRect(x + 2, 32, width - 4, 2);
    ctx.fillRect(x + 2, 220, width - 4, 3);

    // Vertical text
    ctx.save();
    ctx.translate(x + width / 2, 130);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = 'rgba(247, 247, 244, 0.85)';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(titles[titleIdx % titles.length], 0, 4);
    ctx.restore();

    x += width;
    titleIdx++;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createNotebookTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Cream parchment
  ctx.fillStyle = '#f4eedb';
  ctx.fillRect(0, 0, 512, 512);

  // Soft grid lines
  ctx.strokeStyle = 'rgba(150, 180, 210, 0.25)';
  ctx.lineWidth = 1;
  for (let p = 0; p <= 512; p += 20) {
    ctx.beginPath();
    ctx.moveTo(p, 0); ctx.lineTo(p, 512);
    ctx.moveTo(0, p); ctx.lineTo(512, p);
    ctx.stroke();
  }

  // Margin rule
  ctx.strokeStyle = 'rgba(220, 80, 80, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 0); ctx.lineTo(60, 512);
  ctx.stroke();

  // Simulated handwriting & derivations
  ctx.fillStyle = '#1e3050';
  ctx.font = 'italic 16px "Space Grotesk", cursive, sans-serif';
  ctx.fillText('Derivation: Kinetic Energy & Work Theorem', 75, 50);
  ctx.font = '14px sans-serif';
  ctx.fillText('W = ∫ F · dx = ∫ m (dv/dt) dx = ∫ m v dv', 75, 90);
  ctx.fillText('W = 1/2 m v² - 1/2 m u²', 75, 125);
  ctx.fillText('ΔK = W_total  [Law of Conservation]', 75, 160);

  // Small coordinate vector sketch
  ctx.strokeStyle = '#2b4b7c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 280); ctx.lineTo(240, 280); // X axis
  ctx.moveTo(100, 280); ctx.lineTo(100, 190); // Y axis
  ctx.moveTo(100, 280); ctx.lineTo(210, 210); // Vector R
  ctx.stroke();
  ctx.fillStyle = '#9b3010';
  ctx.fillText('r⃗ = x î + y ĵ', 220, 220);

  ctx.fillStyle = '#333333';
  ctx.fillText('Sarvadnya Study Cohort · Nagpur', 75, 360);
  ctx.fillText('Date: 27 Oct | Focus Target: 100% Mastery', 75, 385);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRulerRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#101923';
  ctx.fillRect(0, 0, 1024, 128);

  ctx.strokeStyle = '#D5B06C';
  ctx.fillStyle = '#D5B06C';
  ctx.font = '10px "Space Grotesk", monospace';

  // Vernier scale ticks
  for (let x = 0; x < 1024; x += 8) {
    const isMajor = x % 64 === 0;
    const isMid = x % 32 === 0;
    const height = isMajor ? 36 : isMid ? 24 : 12;

    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, 128);
    ctx.lineTo(x, 128 - height);
    ctx.stroke();

    if (isMajor) {
      const deg = Math.round((x / 1024) * 360);
      ctx.fillText(`${deg}°`, x + 3, 128 - height - 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
