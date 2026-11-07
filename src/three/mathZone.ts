import * as THREE from 'three';
import { AppMaterials } from './materials';
import { createFormulaPlateTexture } from './proceduralTextures';

export class MathZone {
  public group: THREE.Group;
  public hyperboloid: THREE.LineSegments;
  public vectorField: THREE.Group;
  public parametricToroid: THREE.Mesh;
  public coordinateMatrix: THREE.Group;
  public formulaPlateJee: THREE.Mesh;

  constructor(materials: AppMaterials) {
    this.group = new THREE.Group();
    this.group.name = 'JeeAdvancedMathZone';
    this.group.position.set(0, 0, -145); // Zone positioned along track

    // 1. Ruled Hyperboloid of One Sheet (Precision Engineering / Calculus)
    // Hyperboloids are ruled surfaces constructed entirely of straight skew lines
    const lineCoords: number[] = [];
    const height = 5;
    const rBase = 2.2;
    const rWaist = 1.0;
    const segments = 36;
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const phi = theta + Math.PI / 2.5; // skew twist

      // Bottom point
      const x1 = Math.cos(theta) * rBase;
      const y1 = -height / 2;
      const z1 = Math.sin(theta) * rBase;

      // Top point (twisted)
      const x2 = Math.cos(phi) * rBase;
      const y2 = height / 2;
      const z2 = Math.sin(phi) * rBase;

      lineCoords.push(x1, y1, z1, x2, y2, z2);

      // Counter-ruling
      const phi2 = theta - Math.PI / 2.5;
      const x3 = Math.cos(phi2) * rBase;
      const z3 = Math.sin(phi2) * rBase;
      lineCoords.push(x1, y1, z1, x3, y2, z3);
    }

    const hypGeom = new THREE.BufferGeometry();
    hypGeom.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    this.hyperboloid = new THREE.LineSegments(
      hypGeom,
      new THREE.LineBasicMaterial({ color: 0xd5b06c, transparent: true, opacity: 0.75 })
    );
    this.hyperboloid.position.set(3.6, 0.4, 0);
    this.group.add(this.hyperboloid);

    // 2. Complex 3D Vector Field Arrows
    this.vectorField = new THREE.Group();
    this.vectorField.position.set(-3.6, 0, -1);
    const arrowHelperCount = 18;
    const arrowDir = new THREE.Vector3(1, 0.5, 0.2).normalize();
    for (let x = -2; x <= 2; x += 1.4) {
      for (let y = -1.5; y <= 1.5; y += 1.4) {
        const origin = new THREE.Vector3(x, y, (Math.random() - 0.5) * 2);
        // Tangent rotational vector
        const dir = new THREE.Vector3(-origin.y, origin.x, 0.5).normalize();
        const arrow = new THREE.ArrowHelper(dir, origin, 1.1, 0x76d9ef, 0.25, 0.15);
        this.vectorField.add(arrow);
      }
    }
    this.group.add(this.vectorField);

    // 3. Parametric Trefoil Toroid with metallic finish
    const trefoilGeom = new THREE.TorusKnotGeometry(1.5, 0.2, 128, 24, 2, 3);
    this.parametricToroid = new THREE.Mesh(trefoilGeom, materials.goldMetal);
    this.parametricToroid.position.set(-2.8, -1.8, 3);
    this.parametricToroid.scale.set(0.65, 0.65, 0.65);
    this.group.add(this.parametricToroid);

    // 4. JEE Advanced Formula Plaque
    const plateGeom = new THREE.PlaneGeometry(3.6, 1.8);
    const plateTexJee = createFormulaPlateTexture('JEE Advanced Capability', [
      '∇ × E = -∂B/∂t  [Maxwell-Faraday]',
      '∫ e^(ax) cos(bx) dx = e^(ax)(a cos bx + b sin bx)/(a²+b²)',
      'det(A - λI) = 0  [Eigenvalue Spectrum]',
      'L = r⃗ × p⃗  ;  τ⃗ = dL⃗/dt  [Rotational Dynamics]'
    ]);
    this.formulaPlateJee = new THREE.Mesh(plateGeom, new THREE.MeshBasicMaterial({
      map: plateTexJee,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    }));
    this.formulaPlateJee.position.set(3.8, -1.8, 2);
    this.formulaPlateJee.rotation.y = -0.3;
    this.group.add(this.formulaPlateJee);

    // 5. Engineering Coordinate Grid with raking light
    this.coordinateMatrix = new THREE.Group();
    this.coordinateMatrix.position.set(0, -3.2, 0);
    const matrixGrid = new THREE.GridHelper(16, 32, 0xd5b06c, 0x142234);
    this.coordinateMatrix.add(matrixGrid);
    this.group.add(this.coordinateMatrix);
  }

  public update(time: number) {
    this.hyperboloid.rotation.y = time * 0.18;
    this.parametricToroid.rotation.x = time * 0.15;
    this.parametricToroid.rotation.y = time * 0.25;
    this.vectorField.rotation.z = Math.sin(time * 0.4) * 0.15;
  }
}
