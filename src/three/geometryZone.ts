import * as THREE from 'three';
import { AppMaterials } from './materials';
import { createFormulaPlateTexture } from './proceduralTextures';

export class GeometryZone {
  public group: THREE.Group;
  public goldenSpiral: THREE.Line;
  public platonicDodeca: THREE.Mesh;
  public platonicOcta: THREE.Mesh;
  public coordinateAxes: THREE.Group;
  public formulaPlateA: THREE.Mesh;
  public formulaPlateB: THREE.Mesh;
  public floatingPrisms: THREE.InstancedMesh;

  constructor(materials: AppMaterials) {
    this.group = new THREE.Group();
    this.group.name = 'FoundationsGeometryZone';
    this.group.position.set(0, 0, -45); // Zone positioned along camera track

    // 1. Golden Ratio 3D Logarithmic Spiral
    const spiralPoints: THREE.Vector3[] = [];
    const turns = 4;
    const count = 240;
    const growth = 0.16;
    for (let i = 0; i <= count; i++) {
      const t = (i / count) * turns * Math.PI * 2;
      const r = 0.3 * Math.exp(growth * t);
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;
      const z = (i / count) * 3.5 - 1.75;
      spiralPoints.push(new THREE.Vector3(x, y, z));
    }
    const spiralGeom = new THREE.BufferGeometry().setFromPoints(spiralPoints);
    const spiralMat = new THREE.LineBasicMaterial({
      color: 0xd5b06c,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    });
    this.goldenSpiral = new THREE.Line(spiralGeom, spiralMat);
    this.goldenSpiral.position.set(-3.2, 1.2, 0);
    this.goldenSpiral.scale.set(0.65, 0.65, 0.65);
    this.group.add(this.goldenSpiral);

    // 2. Large Platonic Dodecahedron (Gold wireframe + frosted glass core)
    const dodecaGeom = new THREE.DodecahedronGeometry(2.2, 0);
    this.platonicDodeca = new THREE.Mesh(dodecaGeom, materials.goldMetal);
    this.platonicDodeca.position.set(3.8, 1.0, -2);
    this.group.add(this.platonicDodeca);

    const dodecaInner = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 0), materials.opticalGlass);
    this.platonicDodeca.add(dodecaInner);

    // 3. Precision Octahedron with cyan vertex pins
    const octaGeom = new THREE.OctahedronGeometry(1.6, 0);
    this.platonicOcta = new THREE.Mesh(octaGeom, materials.titaniumDark);
    this.platonicOcta.position.set(-2.8, -2.0, 3);
    this.group.add(this.platonicOcta);

    const octaWire = new THREE.Mesh(new THREE.OctahedronGeometry(1.65, 0), materials.wireframeCyan);
    this.platonicOcta.add(octaWire);

    // 4. Dimensional Coordinate Grid & Axes
    this.coordinateAxes = new THREE.Group();
    this.coordinateAxes.position.set(2.0, -2.2, 2.0);

    const gridHelper = new THREE.GridHelper(8, 16, 0xd5b06c, 0x1a2e45);
    this.coordinateAxes.add(gridHelper);

    // Parabolic trajectory line
    const parabolaPoints: THREE.Vector3[] = [];
    for (let x = -3; x <= 3; x += 0.2) {
      const y = -0.3 * (x * x) + 2.5;
      parabolaPoints.push(new THREE.Vector3(x, y, 0));
    }
    const paraGeom = new THREE.BufferGeometry().setFromPoints(parabolaPoints);
    const paraLine = new THREE.Line(paraGeom, new THREE.LineBasicMaterial({ color: 0x76d9ef }));
    this.coordinateAxes.add(paraLine);
    this.group.add(this.coordinateAxes);

    // 5. Floating Mathematical Formula Plates
    const plateGeom = new THREE.PlaneGeometry(3.6, 1.8);

    const plateTexA = createFormulaPlateTexture('Class 9 Foundations', [
      'F = m · a  [Newtonian Mechanics]',
      'a² + b² = c²  [Pythagorean Geometry]',
      '(a + b)² = a² + 2ab + b²',
      'v = u + at  ;  s = ut + ½at²'
    ]);
    const plateMatA = new THREE.MeshBasicMaterial({
      map: plateTexA,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    this.formulaPlateA = new THREE.Mesh(plateGeom, plateMatA);
    this.formulaPlateA.position.set(-4.2, 0.4, 2.5);
    this.formulaPlateA.rotation.y = 0.35;
    this.group.add(this.formulaPlateA);

    const plateTexB = createFormulaPlateTexture('Class 10 Board Standards', [
      'sin²θ + cos²θ = 1  [Trigonometry]',
      '1/f = 1/v - 1/u  [Lens Formula]',
      'R = ρ (L / A)  [Ohm\'s Law & Resistance]',
      'x = (-b ± √(b² - 4ac)) / (2a)'
    ]);
    const plateMatB = new THREE.MeshBasicMaterial({
      map: plateTexB,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    this.formulaPlateB = new THREE.Mesh(plateGeom, plateMatB);
    this.formulaPlateB.position.set(4.4, -0.8, -1.0);
    this.formulaPlateB.rotation.y = -0.4;
    this.group.add(this.formulaPlateB);

    // 6. Floating Instanced Prisms in space
    const prismGeom = new THREE.TetrahedronGeometry(0.35, 0);
    this.floatingPrisms = new THREE.InstancedMesh(prismGeom, materials.goldMetal, 24);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 24; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 10
      );
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.scale.setScalar(0.7 + Math.random() * 0.8);
      dummy.updateMatrix();
      this.floatingPrisms.setMatrixAt(i, dummy.matrix);
    }
    this.floatingPrisms.instanceMatrix.needsUpdate = true;
    this.group.add(this.floatingPrisms);
  }

  public update(time: number) {
    this.goldenSpiral.rotation.z = time * 0.15;
    this.platonicDodeca.rotation.x = time * 0.12;
    this.platonicDodeca.rotation.y = time * 0.18;
    this.platonicOcta.rotation.y = -time * 0.2;
    this.platonicOcta.rotation.z = time * 0.1;

    // Gentle float on formula plates
    this.formulaPlateA.position.y = 0.4 + Math.sin(time * 1.2) * 0.12;
    this.formulaPlateB.position.y = -0.8 + Math.cos(time * 1.1) * 0.12;
  }
}
