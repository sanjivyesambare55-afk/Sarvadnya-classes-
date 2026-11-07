import * as THREE from 'three';
import { AppMaterials } from './materials';

export class HeroSculpture {
  public group: THREE.Group;
  public outerRing: THREE.Mesh;
  public middleRing: THREE.Mesh;
  public innerRing: THREE.Mesh;
  public glassRing: THREE.Mesh;
  public coreCluster: THREE.Group;
  public coreIcosahedron: THREE.Mesh;
  public coreEnergyNode: THREE.Mesh;
  public caliperArmA: THREE.Mesh;
  public caliperArmB: THREE.Mesh;
  public orbitalNodes: THREE.InstancedMesh;
  public microSensors: THREE.Group;

  constructor(materials: AppMaterials) {
    this.group = new THREE.Group();
    this.group.name = 'MonumentalHeroSculpture';

    // 1. Large Champagne Gold Outer Ring with chamfered profile
    const outerGeom = new THREE.TorusGeometry(4.2, 0.12, 32, 120);
    this.outerRing = new THREE.Mesh(outerGeom, materials.goldMetal);
    this.outerRing.castShadow = true;
    this.outerRing.receiveShadow = true;
    this.group.add(this.outerRing);

    // 2. Middle Vernier Ring with tick markings
    const middleGeom = new THREE.CylinderGeometry(3.6, 3.6, 0.28, 96, 1, true);
    this.middleRing = new THREE.Mesh(middleGeom, materials.vernierRing);
    this.middleRing.rotation.x = Math.PI / 2;
    this.group.add(this.middleRing);

    // 3. Dark Titanium Inclined Ring with brass counterweights
    const innerGeom = new THREE.TorusGeometry(3.0, 0.09, 24, 96);
    this.innerRing = new THREE.Mesh(innerGeom, materials.titaniumDark);
    this.innerRing.rotation.x = Math.PI / 4;
    this.innerRing.rotation.y = Math.PI / 6;
    this.group.add(this.innerRing);

    // Counterweight studs on inner ring
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const studGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16);
      const stud = new THREE.Mesh(studGeom, materials.goldMetal);
      stud.position.set(Math.cos(angle) * 3.0, Math.sin(angle) * 3.0, 0);
      stud.rotation.z = angle;
      this.innerRing.add(stud);
    }

    // 4. Optical Glass Gimbal Ring (refractive ring)
    const glassGeom = new THREE.TorusGeometry(2.3, 0.08, 24, 80);
    this.glassRing = new THREE.Mesh(glassGeom, materials.opticalGlass);
    this.glassRing.rotation.y = Math.PI / 3;
    this.group.add(this.glassRing);

    // 5. Central Knowledge Core Cluster
    this.coreCluster = new THREE.Group();

    // Nested gold geometric icosahedron
    const icoGeom = new THREE.IcosahedronGeometry(1.2, 0);
    this.coreIcosahedron = new THREE.Mesh(icoGeom, materials.wireframeGold);
    this.coreCluster.add(this.coreIcosahedron);

    // Solid inner faceted core
    const innerCoreGeom = new THREE.OctahedronGeometry(0.8, 0);
    const innerCore = new THREE.Mesh(innerCoreGeom, materials.titaniumDark);
    this.coreCluster.add(innerCore);

    // Pulsing central energy node
    const nodeGeom = new THREE.SphereGeometry(0.35, 32, 32);
    this.coreEnergyNode = new THREE.Mesh(nodeGeom, materials.cyanGlow);
    this.coreCluster.add(this.coreEnergyNode);

    // Small orbiting rings inside core
    const miniRingA = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.02, 16, 48), materials.goldMetal);
    miniRingA.rotation.x = Math.PI / 3;
    this.coreCluster.add(miniRingA);

    const miniRingB = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.015, 16, 48), materials.wireframeCyan);
    miniRingB.rotation.y = Math.PI / 4;
    this.coreCluster.add(miniRingB);

    this.group.add(this.coreCluster);

    // 6. Precision Caliper / Mathematical Arms (Asymmetry)
    const armGeom = new THREE.BoxGeometry(0.08, 5.2, 0.16);
    this.caliperArmA = new THREE.Mesh(armGeom, materials.goldMetal);
    this.caliperArmA.position.set(-2.2, 0.4, 0.8);
    this.caliperArmA.rotation.z = 0.25;
    this.group.add(this.caliperArmA);

    const armGeomB = new THREE.BoxGeometry(0.06, 4.4, 0.12);
    this.caliperArmB = new THREE.Mesh(armGeomB, materials.titaniumDark);
    this.caliperArmB.position.set(2.4, -0.6, -0.5);
    this.caliperArmB.rotation.z = -0.35;
    this.group.add(this.caliperArmB);

    // Fine pivot dials on arms
    const dialGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.1, 24);
    const dialA = new THREE.Mesh(dialGeom, materials.goldMetal);
    dialA.rotation.x = Math.PI / 2;
    dialA.position.set(0, 1.8, 0);
    this.caliperArmA.add(dialA);

    // 7. Micro Sensors & Glowing Scientific Indicator Nodes
    this.microSensors = new THREE.Group();
    const sensorGeom = new THREE.SphereGeometry(0.06, 16, 16);
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const radius = 4.2;
      const isCyan = i % 3 === 0;
      const node = new THREE.Mesh(sensorGeom, isCyan ? materials.cyanGlow : materials.goldGlow);
      node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 0.4);
      this.microSensors.add(node);
    }
    this.group.add(this.microSensors);

    // 8. Orbital Particles/Satellites using InstancedMesh (Efficient)
    const particleGeom = new THREE.OctahedronGeometry(0.07, 0);
    const count = 36;
    this.orbitalNodes = new THREE.InstancedMesh(particleGeom, materials.goldMetal, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const r = 4.8 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;
      dummy.position.set(
        r * Math.cos(theta) * Math.cos(phi),
        r * Math.sin(phi),
        r * Math.sin(theta) * Math.cos(phi)
      );
      dummy.scale.setScalar(0.6 + Math.random() * 0.8);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      this.orbitalNodes.setMatrixAt(i, dummy.matrix);
    }
    this.orbitalNodes.instanceMatrix.needsUpdate = true;
    this.group.add(this.orbitalNodes);

    // Position in hero composition (central-right for desktop)
    this.group.position.set(2.8, 0.4, 0);
  }

  public update(time: number, scrollProgress: number) {
    // Phase 1 to Phase 3 transformations based on scroll:
    const heroFactor = Math.min(1, Math.max(0, scrollProgress * 4.5)); // 0 to 1 in hero scroll

    // Idle subtle rotation
    this.outerRing.rotation.z = time * 0.12 + scrollProgress * 2.5;
    this.middleRing.rotation.y = time * 0.08 - scrollProgress * 1.8;
    this.innerRing.rotation.x = Math.PI / 4 + time * 0.15 + scrollProgress * 3.0;
    this.glassRing.rotation.y = Math.PI / 3 - time * 0.18 + scrollProgress * 2.0;

    // Core pulsing & independent rotation
    this.coreCluster.rotation.y = time * 0.25 + scrollProgress * 4.0;
    this.coreCluster.rotation.x = Math.sin(time * 0.5) * 0.2;

    const pulse = 1.0 + Math.sin(time * 2.5) * 0.08;
    this.coreEnergyNode.scale.setScalar(pulse);

    // Sculpture transformation / separation when scrolling down
    // Rings separate laterally and along Z as scroll increases
    this.outerRing.position.z = -heroFactor * 3.5;
    this.middleRing.position.z = heroFactor * 2.2;
    this.innerRing.position.x = heroFactor * 2.5;
    this.caliperArmA.position.y = 0.4 + heroFactor * 1.8;
    this.caliperArmB.position.y = -0.6 - heroFactor * 1.6;

    // Subtle drift of orbital nodes
    this.orbitalNodes.rotation.y = time * 0.05 + scrollProgress * 1.5;
  }
}
