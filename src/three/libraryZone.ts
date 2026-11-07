import * as THREE from 'three';
import { AppMaterials } from './materials';

export class LibraryZone {
  public group: THREE.Group;
  public desks: THREE.Group;
  public bookshelves: THREE.Group;
  public primaryDeskFocus: THREE.Group;
  public warmLampLight: THREE.PointLight;
  public studyChairs: THREE.Group;

  constructor(materials: AppMaterials) {
    this.group = new THREE.Group();
    this.group.name = 'RealisticStudentLibraryZone';
    this.group.position.set(0, 0, -200); // Positioned along camera track

    this.desks = new THREE.Group();
    this.bookshelves = new THREE.Group();
    this.studyChairs = new THREE.Group();

    // 1. Warm Architectural Interior Floor & Walls
    // Floor is warm dark wood parquet / carpet
    const floorGeom = new THREE.PlaneGeometry(24, 28);
    const libraryFloor = new THREE.Mesh(floorGeom, materials.libraryWood);
    libraryFloor.rotation.x = -Math.PI / 2;
    libraryFloor.position.y = -2.5;
    libraryFloor.receiveShadow = true;
    this.group.add(libraryFloor);

    // Warm wooden wall panels at rear
    const wallGeom = new THREE.BoxGeometry(24, 8, 0.4);
    const backWall = new THREE.Mesh(wallGeom, materials.architecturalMonolith);
    backWall.position.set(0, 1.5, -12);
    this.group.add(backWall);

    // Natural daylight window aperture on right wall
    const windowFrameGeom = new THREE.BoxGeometry(0.3, 5, 8);
    const windowFrame = new THREE.Mesh(windowFrameGeom, materials.titaniumDark);
    windowFrame.position.set(10, 1.5, -4);
    this.group.add(windowFrame);

    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 4.6), materials.opticalGlass);
    windowGlass.position.set(9.9, 1.5, -4);
    windowGlass.rotation.y = -Math.PI / 2;
    this.group.add(windowGlass);

    // 2. Rows of Realistic Study Carrels / Desks
    // A carrel consists of desk surface, side privacy dividers, metal frame legs
    const createDeskCarrel = (x: number, z: number, isHero = false): THREE.Group => {
      const deskGroup = new THREE.Group();
      deskGroup.position.set(x, -2.5, z);

      // Desktop table surface
      const topGeom = new THREE.BoxGeometry(2.8, 0.08, 1.4);
      const top = new THREE.Mesh(topGeom, materials.libraryWood);
      top.position.y = 1.4;
      top.castShadow = true;
      top.receiveShadow = true;
      deskGroup.add(top);

      // Privacy Divider Back Panel
      const backDivGeom = new THREE.BoxGeometry(2.8, 0.8, 0.04);
      const backDiv = new THREE.Mesh(backDivGeom, materials.architecturalMonolith);
      backDiv.position.set(0, 1.8, -0.68);
      deskGroup.add(backDiv);

      // Privacy Side Divider Wings
      const sideDivGeom = new THREE.BoxGeometry(0.04, 0.8, 1.4);
      const sideDivL = new THREE.Mesh(sideDivGeom, materials.architecturalMonolith);
      sideDivL.position.set(-1.38, 1.8, 0);
      deskGroup.add(sideDivL);

      const sideDivR = new THREE.Mesh(sideDivGeom, materials.architecturalMonolith);
      sideDivR.position.set(1.38, 1.8, 0);
      deskGroup.add(sideDivR);

      // 4 Metal Table Legs
      const legGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8);
      const legPositions = [
        [-1.3, 0.7, -0.6],
        [1.3, 0.7, -0.6],
        [-1.3, 0.7, 0.6],
        [1.3, 0.7, 0.6]
      ];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeom, materials.titaniumDark);
        leg.position.set(lx, ly, lz);
        deskGroup.add(leg);
      });

      // Desk Lamp (Brass gooseneck with conical shade)
      const lampGroup = new THREE.Group();
      lampGroup.position.set(-0.8, 1.44, -0.4);

      // Base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 16), materials.goldMetal);
      lampGroup.add(base);

      // Stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), materials.goldMetal);
      stem.position.set(0, 0.25, 0);
      lampGroup.add(stem);

      // Shade
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 16, 1, true), materials.goldMetal);
      shade.rotation.x = Math.PI / 4;
      shade.position.set(0.08, 0.52, 0.1);
      lampGroup.add(shade);

      // Bulb
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), materials.goldGlow);
      bulb.position.set(0.08, 0.5, 0.1);
      lampGroup.add(bulb);

      deskGroup.add(lampGroup);

      // Open Notebook on the desk
      const notebook = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.02, 0.7), materials.notebookPaper);
      notebook.position.set(0.1, 1.45, 0.1);
      notebook.rotation.y = -0.08;
      deskGroup.add(notebook);

      // Stack of Reference Textbooks
      const bookStack = new THREE.Group();
      bookStack.position.set(0.9, 1.44, -0.2);
      for (let b = 0; b < 3; b++) {
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.6), materials.bookSpines);
        book.position.y = b * 0.065 + 0.03;
        book.rotation.y = (b * 0.08) - 0.05;
        bookStack.add(book);
      }
      deskGroup.add(bookStack);

      // Ergonomic Study Chair
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 1.2);

      // Seat cushion
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.8), materials.titaniumDark);
      seat.position.y = 0.8;
      chairGroup.add(seat);

      // Curved Backrest
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.7, 0.06), materials.titaniumDark);
      backrest.position.set(0, 1.35, 0.38);
      backrest.rotation.x = -0.08;
      chairGroup.add(backrest);

      // Chair Legs
      const chairLegGeom = new THREE.CylinderGeometry(0.025, 0.02, 0.8, 8);
      const chairLegCoords = [
        [-0.35, 0.4, -0.35],
        [0.35, 0.4, -0.35],
        [-0.35, 0.4, 0.35],
        [0.35, 0.4, 0.35]
      ];
      chairLegCoords.forEach(([cx, cy, cz]) => {
        const leg = new THREE.Mesh(chairLegGeom, materials.goldMetal);
        leg.position.set(cx, cy, cz);
        chairGroup.add(leg);
      });

      deskGroup.add(chairGroup);

      return deskGroup;
    };

    // Primary Desk for close-up inspection
    this.primaryDeskFocus = createDeskCarrel(0.8, 0, true);
    this.desks.add(this.primaryDeskFocus);

    // Left row of desks
    this.desks.add(createDeskCarrel(-3.6, -3));
    this.desks.add(createDeskCarrel(-3.6, 3));

    // Right row background desk
    this.desks.add(createDeskCarrel(4.5, -4));
    this.desks.add(createDeskCarrel(4.5, 2.5));

    this.group.add(this.desks);

    // 3. Bookshelves on Left Wall
    const createBookshelf = (x: number, z: number, rotY: number) => {
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(x, -2.5, z);
      shelfGroup.rotation.y = rotY;

      // Wooden Frame
      const frameGeom = new THREE.BoxGeometry(4.2, 5.0, 0.6);
      const shelfFrame = new THREE.Mesh(frameGeom, materials.libraryWood);
      shelfFrame.position.y = 2.5;
      shelfGroup.add(shelfFrame);

      // Shelves with books
      for (let s = 0; s < 4; s++) {
        const y = 0.8 + s * 1.1;
        const bookRow = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.85, 0.48), materials.bookSpines);
        bookRow.position.set(0, y, 0.05);
        shelfGroup.add(bookRow);
      }
      return shelfGroup;
    };

    this.bookshelves.add(createBookshelf(-7.8, -2, Math.PI / 2));
    this.bookshelves.add(createBookshelf(-7.8, 4, Math.PI / 2));
    this.group.add(this.bookshelves);

    // 4. Warm Point Light at Primary Desk to cast authentic glow
    this.warmLampLight = new THREE.PointLight(0xffdf99, 2.2, 8, 1.8);
    this.warmLampLight.position.set(0.8, -0.6, 0);
    this.warmLampLight.castShadow = true;
    this.group.add(this.warmLampLight);

    // 5. Library Wall Inscription Plaque
    const plaqueGeom = new THREE.PlaneGeometry(3.8, 0.9);
    const canvas = document.createElement('canvas');
    canvas.width = 760;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#08111e';
    ctx.fillRect(0, 0, 760, 180);
    ctx.strokeStyle = '#D5B06C';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 748, 168);
    ctx.fillStyle = '#D5B06C';
    ctx.font = '700 24px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SARVADNYA STUDY LIBRARY · 7:00 AM – 10:00 PM', 380, 65);
    ctx.fillStyle = '#F7F7F4';
    ctx.font = '400 18px "Manrope", sans-serif';
    ctx.fillText('01 Sarvashree Nagar, Nagpur · Quiet Academic Sanctuary', 380, 115);
    const plaqueTex = new THREE.CanvasTexture(canvas);
    plaqueTex.colorSpace = THREE.SRGBColorSpace;
    const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex });
    const plaque = new THREE.Mesh(plaqueGeom, plaqueMat);
    plaque.position.set(0, 2.8, -11.75);
    this.group.add(plaque);
  }

  public update(time: number) {
    // Subtle breathing on warm desk lamp light intensity
    this.warmLampLight.intensity = 2.2 + Math.sin(time * 3.0) * 0.1;
  }
}
