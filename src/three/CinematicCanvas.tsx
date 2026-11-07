import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createMaterials, AppMaterials } from './materials';
import { HeroSculpture } from './heroSculpture';
import { GeometryZone } from './geometryZone';
import { ScientificZone } from './scientificZone';
import { MathZone } from './mathZone';
import { LibraryZone } from './libraryZone';

interface CinematicCanvasProps {
  scrollProgress: number; // 0 to 1
  isZenMode: boolean;
  lightingPreset: 'cinematic' | 'technical' | 'warm';
}

export const CinematicCanvas: React.FC<CinematicCanvasProps> = ({
  scrollProgress,
  isZenMode,
  lightingPreset
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  const lightingPresetRef = useRef(lightingPreset);
  lightingPresetRef.current = lightingPreset;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Probe
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111f);
    scene.fog = new THREE.FogExp2(0x07111f, 0.009);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    camera.position.set(0, 0.8, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Procedural Studio Environment for PBR Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // 4. Master Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x101a28, 1.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x76d9ef, 0x07111f, 1.0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xd5b06c, 3.2);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 80;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    const d = 16;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x76d9ef, 2.0);
    rimLight.position.set(-14, 12, -10);
    scene.add(rimLight);

    // Warm library soft lighting
    const libraryWarmLight = new THREE.PointLight(0xffb84d, 2.5, 30, 1.5);
    libraryWarmLight.position.set(0, 3, -195);
    scene.add(libraryWarmLight);

    // 5. Architectural Hall Elements
    const materials: AppMaterials = createMaterials();

    // Large continuous reflective graphite stone floor
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 500),
      materials.stoneFloor
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -3.8, -150);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Colonnade of monumental architectural pillars
    const pillarGeom = new THREE.BoxGeometry(1.6, 26, 1.6);
    const pillarCount = 20;
    for (let i = 0; i < pillarCount; i++) {
      const z = -i * 15 + 10;
      // Left pillar
      const pL = new THREE.Mesh(pillarGeom, materials.architecturalMonolith);
      pL.position.set(-10, 8, z);
      pL.castShadow = true;
      pL.receiveShadow = true;
      scene.add(pL);

      // Gold capital ring on pillar
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 1.7), materials.goldMetal);
      cap.position.set(0, 6, 0);
      pL.add(cap);

      // Right pillar
      const pR = new THREE.Mesh(pillarGeom, materials.architecturalMonolith);
      pR.position.set(10, 8, z);
      pR.castShadow = true;
      pR.receiveShadow = true;
      scene.add(pR);

      const capR = cap.clone();
      pR.add(capR);
    }

    // Atmospheric Floating Dust Particles
    const particleCount = isSoftwareGl ? 60 : 250;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 26;
      particlePositions[i + 1] = (Math.random() - 0.5) * 16 + 2;
      particlePositions[i + 2] = -Math.random() * 260 + 10;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd5b06c,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 6. Instantiate 3D Sections & Sculptures
    const heroSculpture = new HeroSculpture(materials);
    scene.add(heroSculpture.group);

    const geometryZone = new GeometryZone(materials);
    scene.add(geometryZone.group);

    const scientificZone = new ScientificZone(materials);
    scene.add(scientificZone.group);

    const mathZone = new MathZone(materials);
    scene.add(mathZone.group);

    const libraryZone = new LibraryZone(materials);
    scene.add(libraryZone.group);

    // 7. Interactive Mouse / Touch Parallax Handling
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouseX = nx * 0.8;
      targetMouseY = ny * 0.5;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        const nx = (t.clientX / window.innerWidth) * 2 - 1;
        const ny = -(t.clientY / window.innerHeight) * 2 + 1;
        targetMouseX = nx * 0.5;
        targetMouseY = ny * 0.3;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Handle Window Resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 8. Camera Path Calculation based on Scroll Progress (0 to 1)
    // Keyframes define position (x, y, z) and lookAt target (tx, ty, tz)
    const waypoints = [
      // 0.00: Hero starting screen
      { progress: 0.0, pos: [0, 0.8, 11], target: [1.6, 0.2, 0] },
      // 0.12: Hero Approach & Orbit
      { progress: 0.12, pos: [1.2, 0.6, 5.8], target: [2.6, 0.4, 0] },
      // 0.22: Transition into Foundations (Class 9 & 10)
      { progress: 0.25, pos: [0.0, 0.5, -36], target: [0, 0, -45] },
      // 0.40: Transition into Senior Secondary (Class 11 & 12)
      { progress: 0.42, pos: [0.2, 0.4, -84], target: [0, 0, -95] },
      // 0.55: NEET Medical Focus on DNA Helix
      { progress: 0.56, pos: [-1.4, 0.5, -92], target: [-3.4, 0.5, -95] },
      // 0.70: JEE Advanced Precision Landscape
      { progress: 0.72, pos: [0.0, 0.4, -135], target: [0, 0, -145] },
      // 0.84: Realistic Student Library Interior
      { progress: 0.86, pos: [0.8, -0.6, -195], target: [0.8, -1.0, -200] },
      // 1.00: Why Us & Final Contact Admissions
      { progress: 1.0, pos: [0, 1.2, -260], target: [0, 0, -285] }
    ];

    const currentPos = new THREE.Vector3(0, 0.8, 11);
    const currentTarget = new THREE.Vector3(1.6, 0.2, 0);

    const samplePath = (p: number) => {
      const clamped = Math.max(0, Math.min(1, p));
      let idx = 0;
      for (let i = 0; i < waypoints.length - 1; i++) {
        if (clamped >= waypoints[i].progress && clamped <= waypoints[i + 1].progress) {
          idx = i;
          break;
        }
      }
      const w1 = waypoints[idx];
      const w2 = waypoints[idx + 1] || w1;
      const span = w2.progress - w1.progress || 1;
      const factor = (clamped - w1.progress) / span;

      // Smooth cubic easing between waypoints
      const smoothFactor = factor * factor * (3 - 2 * factor);

      const targetX = THREE.MathUtils.lerp(w1.pos[0], w2.pos[0], smoothFactor);
      const targetY = THREE.MathUtils.lerp(w1.pos[1], w2.pos[1], smoothFactor);
      const targetZ = THREE.MathUtils.lerp(w1.pos[2], w2.pos[2], smoothFactor);

      const lookX = THREE.MathUtils.lerp(w1.target[0], w2.target[0], smoothFactor);
      const lookY = THREE.MathUtils.lerp(w1.target[1], w2.target[1], smoothFactor);
      const lookZ = THREE.MathUtils.lerp(w1.target[2], w2.target[2], smoothFactor);

      return {
        pos: [targetX, targetY, targetZ],
        target: [lookX, lookY, lookZ]
      };
    };

    // 9. Main Render Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const renderTick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse parallax damping
      mouseX = THREE.MathUtils.damp(mouseX, targetMouseX, 4.0, delta);
      mouseY = THREE.MathUtils.damp(mouseY, targetMouseY, 4.0, delta);

      // Dynamic lighting adjustments according to preset and section
      const activePreset = lightingPresetRef.current;
      if (activePreset === 'warm') {
        keyLight.color.setHex(0xffaa55);
        keyLight.intensity = 3.6;
        ambientLight.color.setHex(0x281a14);
      } else if (activePreset === 'technical') {
        keyLight.color.setHex(0x76d9ef);
        keyLight.intensity = 3.0;
        ambientLight.color.setHex(0x0c1d2e);
      } else {
        keyLight.color.setHex(0xd5b06c);
        keyLight.intensity = 3.2;
        ambientLight.color.setHex(0x101a28);
      }

      // Smooth camera interpolation along trajectory
      const { pos, target } = samplePath(scrollRef.current);

      const camTargetPos = new THREE.Vector3(
        pos[0] + mouseX,
        pos[1] + mouseY,
        pos[2]
      );
      const lookTargetPos = new THREE.Vector3(
        target[0] + mouseX * 0.4,
        target[1] + mouseY * 0.4,
        target[2]
      );

      currentPos.lerp(camTargetPos, 0.08);
      currentTarget.lerp(lookTargetPos, 0.08);

      camera.position.copy(currentPos);
      camera.lookAt(currentTarget);

      // Update 3D procedural modules
      heroSculpture.update(elapsedTime, scrollRef.current);
      geometryZone.update(elapsedTime);
      scientificZone.update(elapsedTime);
      mathZone.update(elapsedTime);
      libraryZone.update(elapsedTime);

      // Subtle atmospheric particle drift
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(elapsedTime * 0.5 + i) * 0.003;
      }
      particleGeom.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderTick);
    };

    animationFrameId = requestAnimationFrame(renderTick);

    // Pre-warm shaders
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);

      // Resource management
      renderer.dispose();
      scene.clear();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-700 z-0 ${
        isZenMode ? 'opacity-100' : 'opacity-95'
      }`}
      aria-hidden="true"
    />
  );
};
