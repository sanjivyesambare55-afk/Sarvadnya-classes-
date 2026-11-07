import * as THREE from 'three';
import {
  createStoneFloorTexture,
  createWoodTexture,
  createBrushedMetalNormalMap,
  createBookSpinesTexture,
  createNotebookTexture,
  createRulerRingTexture
} from './proceduralTextures';

export interface AppMaterials {
  goldMetal: THREE.MeshStandardMaterial;
  titaniumDark: THREE.MeshStandardMaterial;
  opticalGlass: THREE.MeshPhysicalMaterial;
  cyanGlow: THREE.MeshStandardMaterial;
  goldGlow: THREE.MeshStandardMaterial;
  stoneFloor: THREE.MeshStandardMaterial;
  libraryWood: THREE.MeshStandardMaterial;
  bookSpines: THREE.MeshStandardMaterial;
  notebookPaper: THREE.MeshStandardMaterial;
  vernierRing: THREE.MeshStandardMaterial;
  architecturalMonolith: THREE.MeshStandardMaterial;
  wireframeGold: THREE.MeshBasicMaterial;
  wireframeCyan: THREE.MeshBasicMaterial;
}

export function createMaterials(): AppMaterials {
  const metalNormal = createBrushedMetalNormalMap();
  const stoneTexture = createStoneFloorTexture();
  const woodTexture = createWoodTexture();
  const bookSpineTexture = createBookSpinesTexture();
  const notebookTexture = createNotebookTexture();
  const rulerTexture = createRulerRingTexture();

  const goldMetal = new THREE.MeshStandardMaterial({
    color: 0xd5b06c,
    metalness: 0.92,
    roughness: 0.22,
    normalMap: metalNormal,
    normalScale: new THREE.Vector2(0.2, 0.2)
  });

  const titaniumDark = new THREE.MeshStandardMaterial({
    color: 0x141f2c,
    metalness: 0.88,
    roughness: 0.28,
    normalMap: metalNormal,
    normalScale: new THREE.Vector2(0.15, 0.15)
  });

  const opticalGlass = new THREE.MeshPhysicalMaterial({
    color: 0xa8e8f8,
    metalness: 0.05,
    roughness: 0.08,
    transparent: true,
    opacity: 0.38,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    depthWrite: false
  });

  const cyanGlow = new THREE.MeshStandardMaterial({
    color: 0x76d9ef,
    emissive: 0x76d9ef,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.1
  });

  const goldGlow = new THREE.MeshStandardMaterial({
    color: 0xd5b06c,
    emissive: 0xd5b06c,
    emissiveIntensity: 0.75,
    roughness: 0.2,
    metalness: 0.2
  });

  const stoneFloor = new THREE.MeshStandardMaterial({
    map: stoneTexture,
    roughness: 0.75,
    metalness: 0.25
  });

  const libraryWood = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.45,
    metalness: 0.08
  });

  const bookSpines = new THREE.MeshStandardMaterial({
    map: bookSpineTexture,
    roughness: 0.6,
    metalness: 0.15
  });

  const notebookPaper = new THREE.MeshStandardMaterial({
    map: notebookTexture,
    roughness: 0.85,
    metalness: 0.02
  });

  const vernierRing = new THREE.MeshStandardMaterial({
    map: rulerTexture,
    roughness: 0.3,
    metalness: 0.85
  });

  const architecturalMonolith = new THREE.MeshStandardMaterial({
    color: 0x0c1522,
    roughness: 0.7,
    metalness: 0.4
  });

  const wireframeGold = new THREE.MeshBasicMaterial({
    color: 0xd5b06c,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });

  const wireframeCyan = new THREE.MeshBasicMaterial({
    color: 0x76d9ef,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });

  return {
    goldMetal,
    titaniumDark,
    opticalGlass,
    cyanGlow,
    goldGlow,
    stoneFloor,
    libraryWood,
    bookSpines,
    notebookPaper,
    vernierRing,
    architecturalMonolith,
    wireframeGold,
    wireframeCyan
  };
}
