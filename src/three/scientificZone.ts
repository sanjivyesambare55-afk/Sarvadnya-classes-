import * as THREE from 'three';
import { AppMaterials } from './materials';
import { createFormulaPlateTexture } from './proceduralTextures';

export class ScientificZone {
  public group: THREE.Group;
  public dnaHelix: THREE.Group;
  public benzeneRing: THREE.Group;
  public atomicModel: THREE.Group;
  public formulaPlateSenior: THREE.Mesh;
  public formulaPlateNeet: THREE.Mesh;
  public electronNodes: THREE.Mesh[] = [];

  constructor(materials: AppMaterials) {
    this.group = new THREE.Group();
    this.group.name = 'ScientificNeetZone';
    this.group.position.set(0, 0, -95); // Position along camera track

    // 1. Realistic DNA Double Helix Structure
    this.dnaHelix = new THREE.Group();
    this.dnaHelix.position.set(-3.5, 0.5, 0);

    const pairCount = 36;
    const helixRadius = 1.4;
    const helixHeight = 10;
    const baseSphereGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const rungCylinderGeom = new THREE.CylinderGeometry(0.04, 0.04, helixRadius * 2, 8);

    for (let i = 0; i < pairCount; i++) {
      const t = i / pairCount;
      const angle = t * Math.PI * 4; // 2 full turns
      const y = (t - 0.5) * helixHeight;

      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      const x2 = -x1;
      const z2 = -z1;

      // Backbone Strand A Node
      const nodeA = new THREE.Mesh(baseSphereGeom, materials.goldMetal);
      nodeA.position.set(x1, y, z1);
      this.dnaHelix.add(nodeA);

      // Backbone Strand B Node
      const nodeB = new THREE.Mesh(baseSphereGeom, materials.cyanGlow);
      nodeB.position.set(x2, y, z2);
      this.dnaHelix.add(nodeB);

      // Nucleotide Hydrogen Bond Rung connecting the two
      const rung = new THREE.Mesh(rungCylinderGeom, i % 2 === 0 ? materials.titaniumDark : materials.opticalGlass);
      rung.position.set(0, y, 0);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -angle;
      this.dnaHelix.add(rung);
    }
    this.dnaHelix.rotation.z = 0.2;
    this.group.add(this.dnaHelix);

    // 2. Organic Chemistry Benzene Ring Structure
    this.benzeneRing = new THREE.Group();
    this.benzeneRing.position.set(3.8, 1.8, -2);
    const ringRadius = 1.5;
    const carbonGeom = new THREE.SphereGeometry(0.2, 16, 16);
    const bondGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const nextAngle = ((i + 1) * Math.PI) / 3;
      const cx = Math.cos(angle) * ringRadius;
      const cy = Math.sin(angle) * ringRadius;

      // Carbon atom
      const carbon = new THREE.Mesh(carbonGeom, materials.titaniumDark);
      carbon.position.set(cx, cy, 0);
      this.benzeneRing.add(carbon);

      // C-C Bond
      const nx = Math.cos(nextAngle) * ringRadius;
      const ny = Math.sin(nextAngle) * ringRadius;
      const mx = (cx + nx) / 2;
      const my = (cy + ny) / 2;
      const bond = new THREE.Mesh(bondGeom, i % 2 === 0 ? materials.goldMetal : materials.opticalGlass);
      bond.position.set(mx, my, 0);
      bond.rotation.z = angle + Math.PI / 6;
      this.benzeneRing.add(bond);
    }
    // Delocalized pi-electron cloud ring
    const piRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.03, 16, 48), materials.cyanGlow);
    this.benzeneRing.add(piRing);
    this.group.add(this.benzeneRing);

    // 3. Senior Secondary Bohr Atomic Orbital Model
    this.atomicModel = new THREE.Group();
    this.atomicModel.position.set(3.2, -2.2, 2);

    // Nucleus
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 24), materials.goldMetal);
    this.atomicModel.add(nucleus);

    // 3 Inclined Orbital Tracks
    const orbitMat = materials.wireframeCyan;
    for (let i = 0; i < 3; i++) {
      const track = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.02, 12, 64), orbitMat);
      track.rotation.x = (i * Math.PI) / 3;
      track.rotation.y = (i * Math.PI) / 4;
      this.atomicModel.add(track);

      // Orbiting electron
      const electron = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), materials.cyanGlow);
      this.electronNodes.push(electron);
      track.add(electron);
    }
    this.group.add(this.atomicModel);

    // 4. Formula Plates
    const plateGeom = new THREE.PlaneGeometry(3.6, 1.8);

    const plateTexSenior = createFormulaPlateTexture('Classes 11 & 12 Advanced', [
      'd/dx [u·v] = u (dv/dx) + v (du/dx)',
      '∮ B · dl = μ₀ (I + ε₀ dΦ_E/dt)',
      'ΔS ≥ 0  [2nd Law of Thermodynamics]',
      'PV = nRT  ;  λ = h / p'
    ]);
    this.formulaPlateSenior = new THREE.Mesh(plateGeom, new THREE.MeshBasicMaterial({
      map: plateTexSenior,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    }));
    this.formulaPlateSenior.position.set(-4.0, -1.8, 2.0);
    this.formulaPlateSenior.rotation.y = 0.3;
    this.group.add(this.formulaPlateSenior);

    const plateTexNeet = createFormulaPlateTexture('NEET Medical Rigor', [
      '6CO₂ + 6H₂O ⟶ C₆H₁₂O₆ + 6O₂',
      'Blood pH: 7.35 – 7.45  [Buffer Equilibrium]',
      'V = I · R  [Action Potential Transduction]',
      'Hardy-Weinberg: p² + 2pq + q² = 1'
    ]);
    this.formulaPlateNeet = new THREE.Mesh(plateGeom, new THREE.MeshBasicMaterial({
      map: plateTexNeet,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    }));
    this.formulaPlateNeet.position.set(4.2, -0.2, 0);
    this.formulaPlateNeet.rotation.y = -0.35;
    this.group.add(this.formulaPlateNeet);
  }

  public update(time: number) {
    this.dnaHelix.rotation.y = time * 0.4;
    this.benzeneRing.rotation.z = time * 0.2;
    this.benzeneRing.rotation.x = Math.sin(time * 0.5) * 0.3;
    this.atomicModel.rotation.y = time * 0.25;

    // Move orbiting electrons around their tracks
    this.electronNodes.forEach((electron, idx) => {
      const angle = time * 2.0 + (idx * Math.PI * 2) / 3;
      electron.position.set(Math.cos(angle) * 2.0, Math.sin(angle) * 2.0, 0);
    });
  }
}
