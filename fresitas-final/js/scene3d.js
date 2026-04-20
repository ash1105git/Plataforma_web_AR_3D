class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.enableDamping = true;
    this.dampingFactor = 0.05;
    this.enableZoom = true;
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0;
    this.minDistance = 2;
    this.maxDistance = 10;
    this._spherical = { theta: 0, phi: Math.PI / 2.5, radius: 4.5 };
    this._target = new THREE.Vector3(0, 0, 0);
    this._isDragging = false;
    this._lastMouse = { x: 0, y: 0 };
    this._lastTouch = null;
    this._velocity = { theta: 0, phi: 0 };
    this._bindEvents();
    this._updateCamera();
  }
  _bindEvents() {
    const el = this.domElement;
    el.addEventListener('mousedown', e => { this._isDragging = true; this._lastMouse = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseup', () => { this._isDragging = false; });
    window.addEventListener('mousemove', e => {
      if (!this._isDragging) return;
      const dx = e.clientX - this._lastMouse.x;
      const dy = e.clientY - this._lastMouse.y;
      this._velocity.theta = -dx * 0.01;
      this._velocity.phi = -dy * 0.01;
      this._lastMouse = { x: e.clientX, y: e.clientY };
    });
    el.addEventListener('wheel', e => {
      if (!this.enableZoom) return;
      this._spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this._spherical.radius + e.deltaY * 0.005));
      this._updateCamera();
      e.preventDefault();
    }, { passive: false });
    el.addEventListener('touchstart', e => {
      if (e.touches.length === 1) { this._isDragging = true; this._lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
    }, { passive: true });
    el.addEventListener('touchend', () => { this._isDragging = false; this._lastTouch = null; }, { passive: true });
    el.addEventListener('touchmove', e => {
      if (!this._isDragging || !this._lastTouch || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this._lastTouch.x;
      const dy = e.touches[0].clientY - this._lastTouch.y;
      this._velocity.theta = -dx * 0.012;
      this._velocity.phi = -dy * 0.012;
      this._lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
  }
  _updateCamera() {
    const { theta, phi, radius } = this._spherical;
    const sinPhi = Math.sin(phi);
    this.camera.position.set(
      this._target.x + radius * sinPhi * Math.sin(theta),
      this._target.y + radius * Math.cos(phi),
      this._target.z + radius * sinPhi * Math.cos(theta)
    );
    this.camera.lookAt(this._target);
  }
  update() {
    if (this.autoRotate && !this._isDragging) {
      this._spherical.theta += (this.autoRotateSpeed * Math.PI / 180) * 0.016;
    }
    if (Math.abs(this._velocity.theta) > 0.0001 || Math.abs(this._velocity.phi) > 0.0001) {
      this._spherical.theta += this._velocity.theta;
      this._spherical.phi = Math.max(0.2, Math.min(Math.PI - 0.2, this._spherical.phi + this._velocity.phi));
      if (this.enableDamping) { this._velocity.theta *= (1 - this.dampingFactor); this._velocity.phi *= (1 - this.dampingFactor); }
      else { this._velocity.theta = 0; this._velocity.phi = 0; }
      this._updateCamera();
    } else if (this.autoRotate) {
      this._updateCamera();
    }
  }
}

// ══════════════════════════════════════════════════════
//  PROCEDURAL CROCHET TEXTURE GENERATOR
//  Draws interlocked yarn loops onto a canvas, then
//  uses it as both color map and bump map in Three.js
// ══════════════════════════════════════════════════════
function makeCrochetTexture(hexColor, size = 512) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');

  // Parse base color and derive lighter/darker shades for loop shading
  const r = parseInt(hexColor.slice(1,3),16);
  const g = parseInt(hexColor.slice(3,5),16);
  const b = parseInt(hexColor.slice(5,7),16);
  const base   = `rgb(${r},${g},${b})`;
  const light  = `rgb(${Math.min(255,r+38)},${Math.min(255,g+28)},${Math.min(255,b+28)})`;
  const dark   = `rgb(${Math.max(0,r-40)},${Math.max(0,g-32)},${Math.max(0,b-32)})`;
  const shadow = `rgba(${Math.max(0,r-60)},${Math.max(0,g-50)},${Math.max(0,b-50)},0.55)`;
  const shine  = `rgba(${Math.min(255,r+70)},${Math.min(255,g+60)},${Math.min(255,b+60)},0.45)`;

  // Fill background
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Crochet stitch parameters
  // A single crochet stitch looks like a small horizontal oval / "V"
  // We tile them in a brick-offset grid
  const cols = 18;
  const rows = 22;
  const sw = size / cols;   // stitch width
  const sh = size / rows;   // stitch height

  for (let row = 0; row < rows + 1; row++) {
    for (let col = 0; col < cols + 1; col++) {
      // Brick offset: even rows shift half a stitch
      const ox = (row % 2 === 0) ? 0 : sw * 0.5;
      const cx = col * sw + ox;
      const cy = row * sh;

      // ── Draw one crochet "V" stitch ──
      // The stitch is made of two overlapping arcs forming a chain link

      // Bottom shadow crescent
      ctx.beginPath();
      ctx.ellipse(cx, cy + sh * 0.15, sw * 0.38, sh * 0.28, 0, 0, Math.PI * 2);
      ctx.fillStyle = shadow;
      ctx.fill();

      // Main stitch body — dark base
      ctx.beginPath();
      ctx.ellipse(cx, cy, sw * 0.40, sh * 0.30, 0, 0, Math.PI * 2);
      ctx.fillStyle = dark;
      ctx.fill();

      // Mid tone fill
      ctx.beginPath();
      ctx.ellipse(cx, cy - sh * 0.03, sw * 0.33, sh * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = base;
      ctx.fill();

      // Top highlight arc — simulates yarn roundness / light catch
      ctx.beginPath();
      ctx.ellipse(cx, cy - sh * 0.08, sw * 0.22, sh * 0.10, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = light;
      ctx.fill();

      // Specular glint on the yarn strand
      ctx.beginPath();
      ctx.ellipse(cx - sw * 0.06, cy - sh * 0.10, sw * 0.08, sh * 0.04, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = shine;
      ctx.fill();

      // Left arm of the V (chain loop going left)
      ctx.beginPath();
      ctx.ellipse(cx - sw * 0.28, cy + sh * 0.08, sw * 0.13, sh * 0.17, 0.5, 0, Math.PI * 2);
      ctx.fillStyle = dark;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - sw * 0.28, cy + sh * 0.05, sw * 0.08, sh * 0.10, 0.5, 0, Math.PI * 2);
      ctx.fillStyle = light;
      ctx.fill();

      // Right arm of the V
      ctx.beginPath();
      ctx.ellipse(cx + sw * 0.28, cy + sh * 0.08, sw * 0.13, sh * 0.17, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = dark;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + sw * 0.28, cy + sh * 0.05, sw * 0.08, sh * 0.10, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = light;
      ctx.fill();
    }
  }

  // Subtle overall fabric grain overlay
  for (let i = 0; i < 1200; i++) {
    const px = Math.random() * size;
    const py = Math.random() * size;
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(px, py, 1.5, 1.5);
  }

  return cv;
}

// Bump/normal map: grayscale version of the crochet pattern
function makeCrochetBump(size = 512) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#888';
  ctx.fillRect(0, 0, size, size);

  const cols = 18, rows = 22;
  const sw = size / cols, sh = size / rows;

  for (let row = 0; row < rows + 1; row++) {
    for (let col = 0; col < cols + 1; col++) {
      const ox = (row % 2 === 0) ? 0 : sw * 0.5;
      const cx = col * sw + ox;
      const cy = row * sh;

      // Dark recessed valley
      ctx.beginPath();
      ctx.ellipse(cx, cy + sh * 0.14, sw * 0.39, sh * 0.27, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#444';
      ctx.fill();

      // Mid bump
      ctx.beginPath();
      ctx.ellipse(cx, cy, sw * 0.34, sh * 0.24, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#999';
      ctx.fill();

      // Peak white
      ctx.beginPath();
      ctx.ellipse(cx, cy - sh * 0.07, sw * 0.18, sh * 0.09, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = '#eee';
      ctx.fill();
    }
  }
  return cv;
}

// ── Strawberry geometry builder (crochet edition) ──
function buildStrawberry(scene, color = '#ff4b5c', seedCount = 8) {
  const group = new THREE.Group();

  // ---- Generate crochet textures ----
  const colorCanvas = makeCrochetTexture(color);
  const bumpCanvas  = makeCrochetBump();

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.wrapS = colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.repeat.set(2.5, 2.5);
  colorTex.needsUpdate = true;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(2.5, 2.5);
  bumpTex.needsUpdate = true;

  // ---- Body ----
  // High-poly sphere for smooth deformation + good texture mapping
  const bodyGeo = new THREE.SphereGeometry(1, 64, 64);
  const pos = bodyGeo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);

    // Strawberry silhouette: taper top, round bottom
    const t = (y + 1) / 2; // 0=bottom tip, 1=top crown
    const radialScale = 0.55 + 0.52 * Math.sin(t * Math.PI * 0.95);
    x *= radialScale;
    z *= radialScale;
    y  *= 1.3; // vertical elongation

    // Crochet bumps: small loopy undulation over surface
    // Uses spherical-ish coords for even distribution
    const len = Math.sqrt(x*x + y*y + z*z) + 0.0001;
    const nx = x/len, ny = y/len, nz = z/len;

    // Two frequencies: coarse yarn rows + fine loop texture
    const bump1 = Math.sin(nx * 22 + ny * 18) * Math.cos(nz * 22) * 0.038;
    const bump2 = Math.cos(nx * 40 + nz * 38) * Math.sin(ny * 36) * 0.018;
    const bump3 = Math.sin((nx + nz) * 28) * 0.012; // diagonal weave

    const displacement = bump1 + bump2 + bump3;
    x += nx * displacement;
    y += ny * displacement;
    z += nz * displacement;

    pos.setXYZ(i, x, y, z);
  }
  bodyGeo.computeVertexNormals();

  const bodyMat = new THREE.MeshStandardMaterial({
    map:       colorTex,
    bumpMap:   bumpTex,
    bumpScale: 0.06,
    roughness: 0.88,
    metalness: 0.0,
  });

  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // ---- Seeds — tiny flat crochet knots ----
  const seedColorCanvas = makeCrochetTexture('#f0d9a0', 128);
  const seedTex = new THREE.CanvasTexture(seedColorCanvas);
  seedTex.needsUpdate = true;

  const seedMat = new THREE.MeshStandardMaterial({
    map: seedTex,
    roughness: 0.92,
    bumpMap: bumpTex, bumpScale: 0.03,
  });

  for (let i = 0; i < seedCount; i++) {
    // Flatten sphere into a small oval seed shape
    const seedGeo = new THREE.SphereGeometry(0.072, 10, 7);
    // flatten into oval
    const sp = seedGeo.attributes.position;
    for (let j = 0; j < sp.count; j++) {
      sp.setY(j, sp.getY(j) * 0.45);
    }
    seedGeo.computeVertexNormals();

    const seed = new THREE.Mesh(seedGeo, seedMat);

    // Distribute seeds over surface via Fibonacci sphere
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const yy = 1 - (i / (seedCount - 1)) * 1.6; // top to mid-bottom
    const radiusSeed = Math.sqrt(Math.max(0, 1 - yy * yy));
    const thetaSeed = goldenAngle * i;

    // Map onto deformed strawberry surface (approximate)
    const tNorm = (yy + 1) / 2;
    const rScale = (0.55 + 0.52 * Math.sin(tNorm * Math.PI * 0.95)) * 1.06;
    const sy = yy * 1.3;
    seed.position.set(
      radiusSeed * Math.cos(thetaSeed) * rScale,
      sy,
      radiusSeed * Math.sin(thetaSeed) * rScale
    );

    // Orient seed to point outward from center
    seed.lookAt(seed.position.clone().multiplyScalar(2));
    seed.castShadow = true;
    group.add(seed);
  }

  // ---- Calyx / leaves (crochet textured green) ----
  const leafColorCanvas = makeCrochetTexture('#2e7d32', 256);
  const leafTex = new THREE.CanvasTexture(leafColorCanvas);
  leafTex.wrapS = leafTex.wrapT = THREE.RepeatWrapping;
  leafTex.repeat.set(1.5, 1.5);
  leafTex.needsUpdate = true;

  const leafMat = new THREE.MeshStandardMaterial({
    map: leafTex,
    bumpMap: bumpTex, bumpScale: 0.04,
    roughness: 0.85, side: THREE.DoubleSide
  });

  for (let i = 0; i < 5; i++) {
    // Leaf: elongated flattened shape
    const leafGeo = new THREE.SphereGeometry(0.3, 12, 6);
    const lp = leafGeo.attributes.position;
    for (let j = 0; j < lp.count; j++) {
      lp.setY(j, lp.getY(j) * 0.15);           // flatten
      lp.setX(j, lp.getX(j) * 1.3);            // elongate
      // add crochet bumps
      const nx = lp.getX(j), nz = lp.getZ(j);
      const b = Math.sin(nx * 18 + nz * 14) * 0.015;
      lp.setY(j, lp.getY(j) + b);
    }
    leafGeo.computeVertexNormals();

    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const angle = (i / 5) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.44, 1.30, Math.sin(angle) * 0.44);
    leaf.rotation.set(0.5, angle, 0.12);
    leaf.castShadow = true;
    group.add(leaf);
  }

  // ---- Stem (twisted yarn look) ----
  const stemGeo = new THREE.CylinderGeometry(0.065, 0.045, 0.42, 12);
  // Add twist / ribbing bumps to stem
  const stP = stemGeo.attributes.position;
  for (let i = 0; i < stP.count; i++) {
    const x = stP.getX(i), y = stP.getY(i), z = stP.getZ(i);
    const angle = Math.atan2(z, x);
    const rib = Math.sin(angle * 8 + y * 20) * 0.012;
    stP.setX(i, x + Math.cos(angle) * rib);
    stP.setZ(i, z + Math.sin(angle) * rib);
  }
  stemGeo.computeVertexNormals();

  const stemTex = new THREE.CanvasTexture(makeCrochetTexture('#33691e', 128));
  stemTex.needsUpdate = true;
  const stemMat = new THREE.MeshStandardMaterial({
    map: stemTex, roughness: 0.9, bumpMap: bumpTex, bumpScale: 0.03
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(0, 1.56, 0);
  group.add(stem);

  scene.add(group);
  return group;
}

// ── Scene factory ──
function createScene(canvas, opts = {}) {
  const { autoRotate = true, bgColor = null, floatAnim = false, initialRadius = 4.5, color = '#ff4b5c', seedCount = 8 } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  if (bgColor) scene.background = new THREE.Color(bgColor);

  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0.5, initialRadius);
  camera.lookAt(0, 0, 0);

  // Lighting
  const ambient = new THREE.AmbientLight(0xfff5f5, 0.7);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff0f0, 1.4);
  key.position.set(3, 5, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 20;
  key.shadow.radius = 8;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xe8f4ff, 0.6);
  fill.position.set(-3, 2, -2);
  scene.add(fill);

  const rim = new THREE.PointLight(0xff8899, 0.5, 8);
  rim.position.set(0, -2, 2);
  scene.add(rim);

  // Ground shadow plane
  const planeGeo = new THREE.PlaneGeometry(8, 8);
  const planeMat = new THREE.ShadowMaterial({ opacity: 0.12 });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1.4;
  plane.receiveShadow = true;
  scene.add(plane);

  const controls = new OrbitControls(camera, canvas);
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 1.8;
  controls.dampingFactor = 0.08;
  controls._spherical.radius = initialRadius;
  controls._updateCamera();

  const strawberry = buildStrawberry(scene, color, seedCount);
  strawberry.position.y = 0;

  let t = 0;
  let rafId;
  function animate() {
    rafId = requestAnimationFrame(animate);
    t += 0.016;
    if (floatAnim) strawberry.position.y = Math.sin(t * 0.9) * 0.15;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  return {
    renderer, scene, camera, controls, strawberry,
    setColor: (c) => {
      strawberry.children[0].material.color.set(c);
    },
    destroy: () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    }
  };
}
// ══════════════════════════════════════════════════════════════
//  AMIGURUMI BUILDERS — 8 personajes reales del catálogo
//  Generación procedural 3D fiel a las fotos originales
// ══════════════════════════════════════════════════════════════

function buildAmigurumi(scene, tipo, color1, color2) {
  const group = new THREE.Group();

  const colorTex = new THREE.CanvasTexture(makeCrochetTexture(color1));
  colorTex.wrapS = colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.repeat.set(2, 2);
  const bumpTex = new THREE.CanvasTexture(makeCrochetBump());
  bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(2, 2);

  const mat = (hex, repeat) => {
    const ct = new THREE.CanvasTexture(makeCrochetTexture(hex));
    ct.wrapS = ct.wrapT = THREE.RepeatWrapping;
    ct.repeat.set(repeat||2, repeat||2);
    const bt = new THREE.CanvasTexture(makeCrochetBump());
    bt.wrapS = bt.wrapT = THREE.RepeatWrapping;
    bt.repeat.set(repeat||2, repeat||2);
    return new THREE.MeshStandardMaterial({ map:ct, bumpMap:bt, bumpScale:0.05, roughness:0.88, metalness:0 });
  };

  if (tipo === 'baliena') {
    // Cuerpo principal — forma ovalada horizontal
    const bodyGeo = new THREE.SphereGeometry(1, 48, 48);
    const bp = bodyGeo.attributes.position;
    for (let i=0;i<bp.count;i++) {
      let x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i);
      x*=1.5; y*=0.85; z*=1.05;
      const len=Math.sqrt(x*x+y*y+z*z)+0.001;
      const b=Math.sin((x/len)*20+(y/len)*16)*Math.cos((z/len)*18)*0.025;
      bp.setXYZ(i,x+x/len*b,y+y/len*b,z+z/len*b);
    }
    bodyGeo.computeVertexNormals();
    group.add(new THREE.Mesh(bodyGeo, mat(color1)));

    // Cola — aleta trasera (dos triángulos curvos)
    const tailGeo = new THREE.SphereGeometry(0.35,12,8);
    const tp=tailGeo.attributes.position;
    for(let i=0;i<tp.count;i++){tp.setX(i,tp.getX(i)*0.3);tp.setZ(i,tp.getZ(i)*1.6);tp.setY(i,tp.getY(i)*0.5);}
    tailGeo.computeVertexNormals();
    const tail=new THREE.Mesh(tailGeo,mat(color1));
    tail.position.set(1.55,0,0); tail.rotation.set(0,0,0.3);
    group.add(tail);

    // Aleta superior
    const finGeo = new THREE.SphereGeometry(0.25,10,6);
    const fp=finGeo.attributes.position;
    for(let i=0;i<fp.count;i++){fp.setX(i,fp.getX(i)*0.2);fp.setY(i,fp.getY(i)*1.5);fp.setZ(i,fp.getZ(i)*0.6);}
    finGeo.computeVertexNormals();
    const fin=new THREE.Mesh(finGeo,mat(color1));
    fin.position.set(0,0.92,0);
    group.add(fin);

    // Ojo
    const eyeGeo=new THREE.SphereGeometry(0.13,12,12);
    const eye=new THREE.Mesh(eyeGeo,new THREE.MeshStandardMaterial({color:0x111111,roughness:0.1,metalness:0.2}));
    eye.position.set(-0.88,0.1,0.88);
    group.add(eye);
    const glintGeo=new THREE.SphereGeometry(0.045,8,8);
    const glint=new THREE.Mesh(glintGeo,new THREE.MeshStandardMaterial({color:0xffffff,roughness:0}));
    glint.position.set(-0.82,0.18,0.98);
    group.add(glint);

    // Mejillas rosadas
    const cheekGeo=new THREE.SphereGeometry(0.12,8,8);
    const cheekMat=new THREE.MeshStandardMaterial({color:0xf4b8c8,roughness:0.9,transparent:true,opacity:0.85});
    const cheek=new THREE.Mesh(cheekGeo,cheekMat);
    cheek.position.set(-0.72,-0.1,0.92); cheek.scale.set(1,0.4,0.8);
    group.add(cheek);

    // Anillo llavero (toroide metálico)
    const ringGeo=new THREE.TorusGeometry(0.18,0.03,10,24);
    const ringMat=new THREE.MeshStandardMaterial({color:0xd4aa60,metalness:0.9,roughness:0.1});
    const ring=new THREE.Mesh(ringGeo,ringMat);
    ring.position.set(0,1.05,0); ring.rotation.x=Math.PI/2;
    group.add(ring);
    group.rotation.z=-0.15;

  } else if (tipo === 'manchitas') {
    // Cuerpo
    const bodyGeo=new THREE.SphereGeometry(0.85,40,40);
    bodyGeo.computeVertexNormals();
    group.add(new THREE.Mesh(bodyGeo,mat(color1)));

    // Cabeza
    const headGeo=new THREE.SphereGeometry(0.72,40,40);
    const hd=headGeo.attributes.position;
    for(let i=0;i<hd.count;i++){const b=Math.sin(hd.getX(i)*18+hd.getY(i)*16)*Math.cos(hd.getZ(i)*18)*0.022;const l=Math.sqrt(hd.getX(i)**2+hd.getY(i)**2+hd.getZ(i)**2)+0.001;hd.setXYZ(i,hd.getX(i)+hd.getX(i)/l*b,hd.getY(i)+hd.getY(i)/l*b,hd.getZ(i)+hd.getZ(i)/l*b);}
    headGeo.computeVertexNormals();
    const head=new THREE.Mesh(headGeo,mat(color1));
    head.position.set(0,1.38,0);
    group.add(head);

    // Parche negro en cabeza
    const patchGeo=new THREE.SphereGeometry(0.74,32,32);
    const pMat=mat(color2,1.5);
    const patch=new THREE.Mesh(patchGeo,pMat);
    patch.position.set(0.15,1.38,-0.1); patch.scale.set(0.5,0.55,0.5);
    group.add(patch);

    // Orejas negras
    [-1,1].forEach(side=>{
      const earGeo=new THREE.SphereGeometry(0.22,10,8);
      const ep=earGeo.attributes.position;
      for(let i=0;i<ep.count;i++){ep.setY(i,ep.getY(i)*1.5);ep.setX(i,ep.getX(i)*0.8);}
      earGeo.computeVertexNormals();
      const ear=new THREE.Mesh(earGeo,mat(color2,1));
      ear.position.set(side*0.55,1.98,0);
      group.add(ear);
    });

    // Ojos
    [-1,1].forEach((s,i)=>{
      const eg=new THREE.SphereGeometry(0.09,10,10);
      const ey=new THREE.Mesh(eg,new THREE.MeshStandardMaterial({color:0x111111,roughness:0.1,metalness:0.3}));
      ey.position.set(s*0.22,1.45,0.68);
      group.add(ey);
      const gg=new THREE.SphereGeometry(0.03,8,8);
      const gl=new THREE.Mesh(gg,new THREE.MeshStandardMaterial({color:0xffffff}));
      gl.position.set(s*0.24,1.48,0.74);
      group.add(gl);
    });

    // Nariz rosa
    const noseGeo=new THREE.SphereGeometry(0.07,8,8);
    const nose=new THREE.Mesh(noseGeo,new THREE.MeshStandardMaterial({color:0xf4a0b0,roughness:0.8}));
    nose.position.set(0,1.35,0.72); nose.scale.set(1.4,0.8,1);
    group.add(nose);

    // Patas
    [[-0.38,-0.2],[-0.16,-0.2],[0.16,-0.2],[0.38,-0.2]].forEach(([x,z])=>{
      const lg=new THREE.SphereGeometry(0.2,10,8);
      const lp2=lg.attributes.position;
      for(let i=0;i<lp2.count;i++){lp2.setY(i,lp2.getY(i)*1.4);}
      lg.computeVertexNormals();
      const limb=new THREE.Mesh(lg,mat(color1));
      limb.position.set(x,-0.7,z);
      group.add(limb);
    });

  } else if (tipo === 'snoopy') {
    // Cuerpo blanco
    const bodyGeo=new THREE.SphereGeometry(0.8,40,40);
    const bp=bodyGeo.attributes.position;
    for(let i=0;i<bp.count;i++){bp.setY(i,bp.getY(i)*1.2);}
    bodyGeo.computeVertexNormals();
    group.add(new THREE.Mesh(bodyGeo,mat('#F5F5F0')));

    // Cabeza
    const headGeo=new THREE.SphereGeometry(0.75,40,40);
    headGeo.computeVertexNormals();
    const head=new THREE.Mesh(headGeo,mat('#F5F5F0'));
    head.position.set(0.08,1.42,0);
    group.add(head);

    // Hocico
    const muzzGeo=new THREE.SphereGeometry(0.42,24,20);
    const mp=muzzGeo.attributes.position;
    for(let i=0;i<mp.count;i++){mp.setZ(i,mp.getZ(i)*0.6);mp.setX(i,mp.getX(i)*0.8);}
    muzzGeo.computeVertexNormals();
    const muzz=new THREE.Mesh(muzzGeo,mat('#E8E5DC'));
    muzz.position.set(0.1,1.25,0.62);
    group.add(muzz);

    // Oreja negra izquierda (colgante)
    const earGeo=new THREE.SphereGeometry(0.32,12,10);
    const ep=earGeo.attributes.position;
    for(let i=0;i<ep.count;i++){ep.setY(i,ep.getY(i)*2.0);ep.setX(i,ep.getX(i)*0.6);}
    earGeo.computeVertexNormals();
    const ear=new THREE.Mesh(earGeo,mat('#1A1916',1));
    ear.position.set(-0.58,1.2,-0.3); ear.rotation.z=0.5;
    group.add(ear);

    // Nariz negra
    const noseGeo=new THREE.SphereGeometry(0.1,10,10);
    const nse=new THREE.Mesh(noseGeo,new THREE.MeshStandardMaterial({color:0x111111,roughness:0.2}));
    nse.position.set(0.1,1.35,0.97); nse.scale.set(1.4,0.9,0.7);
    group.add(nse);

    // Collar rojo
    const colGeo=new THREE.TorusGeometry(0.5,0.06,8,32);
    const col=new THREE.Mesh(colGeo,new THREE.MeshStandardMaterial({color:0xCC2929,roughness:0.7}));
    col.position.set(0,0.7,0); col.rotation.x=Math.PI/2.2;
    group.add(col);

    // Patas frontales
    [-1,1].forEach(s=>{
      const lg=new THREE.SphereGeometry(0.22,10,8);
      const lp=lg.attributes.position;
      for(let i=0;i<lp.count;i++){lp.setY(i,lp.getY(i)*1.5);}
      lg.computeVertexNormals();
      const limb=new THREE.Mesh(lg,mat('#F5F5F0'));
      limb.position.set(s*0.52,0.05,0.52); limb.rotation.x=-0.3;
      group.add(limb);
    });

    // Ojos negros pequeños
    [-1,1].forEach((s,i)=>{
      const eg=new THREE.SphereGeometry(0.07,10,10);
      const ey=new THREE.Mesh(eg,new THREE.MeshStandardMaterial({color:0x111111,metalness:0.2}));
      ey.position.set(s*0.2,1.52,0.68);
      group.add(ey);
    });

  } else if (tipo === 'puffle') {
    // Cuerpo esfera
    const bodyGeo=new THREE.SphereGeometry(1,48,48);
    const bp=bodyGeo.attributes.position;
    for(let i=0;i<bp.count;i++){const b=Math.sin(bp.getX(i)*16+bp.getY(i)*14)*Math.cos(bp.getZ(i)*16)*0.03;const l=Math.sqrt(bp.getX(i)**2+bp.getY(i)**2+bp.getZ(i)**2)+0.001;bp.setXYZ(i,bp.getX(i)+bp.getX(i)/l*b,bp.getY(i)+bp.getY(i)/l*b,bp.getZ(i)+bp.getZ(i)/l*b);}
    bodyGeo.computeVertexNormals();
    group.add(new THREE.Mesh(bodyGeo,mat(color1)));

    // Pompón de pelo (muchas esferas pequeñas frizzy)
    const hairColors=[color1,color2||color1];
    for(let i=0;i<28;i++){
      const r=0.08+Math.random()*0.12;
      const theta=(i/28)*Math.PI*2+(Math.random()-0.5)*0.5;
      const phi=0.2+Math.random()*0.6;
      const hg=new THREE.SphereGeometry(r,6,6);
      const h=new THREE.Mesh(hg,new THREE.MeshStandardMaterial({color:new THREE.Color(hairColors[i%2]),roughness:0.95}));
      h.position.set(Math.sin(phi)*Math.cos(theta)*0.6,1.0+Math.cos(phi)*0.5,Math.sin(phi)*Math.sin(theta)*0.6);
      group.add(h);
    }

    // Ojos blancos grandes (felt)
    [-1,1].forEach(s=>{
      const eg=new THREE.SphereGeometry(0.22,12,10);
      const ep=eg.attributes.position;
      for(let i=0;i<ep.count;i++){ep.setZ(i,ep.getZ(i)*0.35);}
      eg.computeVertexNormals();
      const ew=new THREE.Mesh(eg,new THREE.MeshStandardMaterial({color:0xf8f8f8,roughness:0.6}));
      ew.position.set(s*0.3,0.05,0.95);
      group.add(ew);
      const pk=new THREE.SphereGeometry(0.08,8,8);
      const pupil=new THREE.Mesh(pk,new THREE.MeshStandardMaterial({color:0x111111,roughness:0.1,metalness:0.3}));
      pupil.position.set(s*0.3,0.05,1.12);
      group.add(pupil);
      const gg=new THREE.SphereGeometry(0.03,6,6);
      const gl=new THREE.Mesh(gg,new THREE.MeshStandardMaterial({color:0xffffff}));
      gl.position.set(s*0.33,0.09,1.16);
      group.add(gl);
    });

    // Boca
    const mouthGeo=new THREE.TorusGeometry(0.1,0.025,6,16,Math.PI);
    const mouth=new THREE.Mesh(mouthGeo,new THREE.MeshStandardMaterial({color:0x111111,roughness:0.5}));
    mouth.position.set(0,-0.15,1.0); mouth.rotation.x=-Math.PI/2; mouth.rotation.z=Math.PI;
    group.add(mouth);

  } else if (tipo === 'baphomet') {
    // Cuerpo chenille rojo
    const chenilleMat = (hex) => {
      const ct=new THREE.CanvasTexture(makeCrochetTexture(hex));
      ct.wrapS=ct.wrapT=THREE.RepeatWrapping; ct.repeat.set(1.5,1.5);
      return new THREE.MeshStandardMaterial({map:ct,roughness:0.95,metalness:0,bumpScale:0.03});
    };

    const bodyGeo=new THREE.SphereGeometry(0.8,40,40);
    const bp=bodyGeo.attributes.position;
    for(let i=0;i<bp.count;i++){bp.setY(i,bp.getY(i)*1.1);}
    bodyGeo.computeVertexNormals();
    group.add(new THREE.Mesh(bodyGeo,chenilleMat(color1)));

    // Cabeza
    const headGeo=new THREE.SphereGeometry(0.72,40,40);
    headGeo.computeVertexNormals();
    const head=new THREE.Mesh(headGeo,chenilleMat(color1));
    head.position.set(0,1.4,0);
    group.add(head);

    // Cuernos negros (cónicos curvados)
    [-1,1].forEach(s=>{
      const hornGeo=new THREE.CylinderGeometry(0.04,0.12,0.7,10);
      const hP=hornGeo.attributes.position;
      for(let i=0;i<hP.count;i++){const y=hP.getY(i);hP.setX(i,hP.getX(i)+s*y*0.3);hP.setZ(i,hP.getZ(i)+y*0.15);}
      hornGeo.computeVertexNormals();
      const horn=new THREE.Mesh(hornGeo,chenilleMat(color2));
      horn.position.set(s*0.38,2.08,0); horn.rotation.z=-s*0.3;
      group.add(horn);
    });

    // Orejas
    [-1,1].forEach(s=>{
      const eGeo=new THREE.SphereGeometry(0.18,8,6);
      const ep=eGeo.attributes.position;
      for(let i=0;i<ep.count;i++){ep.setX(i,ep.getX(i)*0.5);ep.setY(i,ep.getY(i)*0.9);}
      eGeo.computeVertexNormals();
      const ear=new THREE.Mesh(eGeo,chenilleMat(color1));
      ear.position.set(s*0.75,1.48,0.1);
      group.add(ear);
    });

    // Ojo
    const eGeo=new THREE.SphereGeometry(0.09,10,10);
    const eye=new THREE.Mesh(eGeo,new THREE.MeshStandardMaterial({color:0x111111,roughness:0.1,metalness:0.3}));
    eye.position.set(0,1.4,0.72);
    group.add(eye);

    // Estrella en la frente (pentagonal — 5 puntos)
    for(let i=0;i<5;i++){
      const starRay=new THREE.CylinderGeometry(0.015,0.025,0.18,6);
      const sr=new THREE.Mesh(starRay,new THREE.MeshStandardMaterial({color:new THREE.Color(color2),roughness:0.8}));
      const a=(i/5)*Math.PI*2-Math.PI/2;
      sr.position.set(Math.cos(a)*0.18,1.7+Math.sin(a)*0.18,0.7);
      sr.rotation.z=a+Math.PI/2; sr.rotation.x=0.6;
      group.add(sr);
    }

    // Pezuñas negras
    [[-0.4,-0.9,0.1],[0.4,-0.9,0.1],[-0.35,-0.9,-0.2],[0.35,-0.9,-0.2]].forEach(([x,y,z])=>{
      const hGeo=new THREE.SphereGeometry(0.18,8,6);
      const hoof=new THREE.Mesh(hGeo,chenilleMat(color2));
      hoof.position.set(x,y,z); hoof.scale.set(1,0.6,1);
      group.add(hoof);
    });

  } else if (tipo === 'snake') {
    // Serpiente coral — cabeza negra + cuerpo segmentado rojo/negro/blanco
    const headGeo=new THREE.SphereGeometry(0.55,32,28);
    const hp=headGeo.attributes.position;
    for(let i=0;i<hp.count;i++){hp.setZ(i,hp.getZ(i)*1.6);}
    headGeo.computeVertexNormals();
    const head=new THREE.Mesh(headGeo,mat('#1A1A18',1));
    head.position.set(0,1.5,0.2);
    group.add(head);

    // Ojo
    const eyeGeo=new THREE.SphereGeometry(0.08,8,8);
    const eye=new THREE.Mesh(eyeGeo,new THREE.MeshStandardMaterial({color:0x111111,metalness:0.4,roughness:0.1}));
    eye.position.set(0.32,1.58,0.68);
    group.add(eye);

    // Segmentos de cuerpo (espiral)
    const segColors=[color1,'#1A1A18','#F0EEE8',color1,'#1A1A18','#F0EEE8'];
    const nSegs=18;
    for(let i=0;i<nSegs;i++){
      const t=i/nSegs;
      const angle=t*Math.PI*3.2;
      const r=0.8+t*0.15;
      const x=Math.cos(angle)*r;
      const y=0.8-t*1.8;
      const z=Math.sin(angle)*r*0.7;
      const segGeo=new THREE.SphereGeometry(0.32-t*0.04,14,10);
      const sg=segGeo.attributes.position;
      for(let j=0;j<sg.count;j++){const b=Math.sin(sg.getX(j)*16+sg.getY(j)*12)*0.02;const l=Math.sqrt(sg.getX(j)**2+sg.getY(j)**2+sg.getZ(j)**2)+0.001;sg.setXYZ(j,sg.getX(j)+sg.getX(j)/l*b,sg.getY(j)+sg.getY(j)/l*b,sg.getZ(j)+sg.getZ(j)/l*b);}
      segGeo.computeVertexNormals();
      const c=segColors[i%segColors.length];
      const seg=new THREE.Mesh(segGeo,mat(c,1.5));
      seg.position.set(x,y,z);
      group.add(seg);
    }

  } else if (tipo === 'cyclops') {
    // Cuerpo ovalado teal
    const bodyGeo=new THREE.SphereGeometry(0.9,40,40);
    const bp=bodyGeo.attributes.position;
    for(let i=0;i<bp.count;i++){bp.setY(i,bp.getY(i)*1.3);}
    bodyGeo.computeVertexNormals();
    group.add(new THREE.Mesh(bodyGeo,mat(color1)));

    // Ojo central rosado grande
    const eyeBackGeo=new THREE.SphereGeometry(0.32,16,14);
    const eb=eyeBackGeo.attributes.position;
    for(let i=0;i<eb.count;i++){eb.setZ(i,eb.getZ(i)*0.3);}
    eyeBackGeo.computeVertexNormals();
    const eyeBack=new THREE.Mesh(eyeBackGeo,new THREE.MeshStandardMaterial({color:new THREE.Color(color2),roughness:0.7}));
    eyeBack.position.set(0,0.1,0.9);
    group.add(eyeBack);

    const pupilGeo=new THREE.SphereGeometry(0.12,10,10);
    const pupil=new THREE.Mesh(pupilGeo,new THREE.MeshStandardMaterial({color:0x111111,roughness:0.1,metalness:0.3}));
    pupil.position.set(0,0.1,1.12);
    group.add(pupil);
    const glintGeo=new THREE.SphereGeometry(0.04,6,6);
    const glint=new THREE.Mesh(glintGeo,new THREE.MeshStandardMaterial({color:0xffffff}));
    glint.position.set(0.06,0.18,1.2);
    group.add(glint);

    // Antenas laterales pequeñas
    [-1,1].forEach(s=>{
      const aGeo=new THREE.CylinderGeometry(0.04,0.06,0.4,6);
      const ant=new THREE.Mesh(aGeo,mat(color1,1));
      ant.position.set(s*0.88,0.8,0.1); ant.rotation.z=s*0.5;
      group.add(ant);
      const tipGeo=new THREE.SphereGeometry(0.07,6,6);
      const tip=new THREE.Mesh(tipGeo,mat(color1,1));
      tip.position.set(s*1.12,1.1,0.1);
      group.add(tip);
    });

    // 4 patas largas
    [[-0.55,-1.1,0.2],[-0.2,-1.1,0.35],[0.2,-1.1,0.35],[0.55,-1.1,0.2]].forEach(([x,y,z],i)=>{
      const lGeo=new THREE.CylinderGeometry(0.06,0.07,0.8,8);
      const leg=new THREE.Mesh(lGeo,mat(color1));
      leg.position.set(x,y,z);
      leg.rotation.z=(i<2?1:-1)*0.2; leg.rotation.x=0.1;
      group.add(leg);
    });
  }

  scene.add(group);
  return group;
}

// Extensión de createScene para soportar tipo amigurumi
const _origCreateScene = createScene;
window.createSceneAmigurumi = function(canvas, opts = {}) {
  const {
    autoRotate=true, bgColor=null, floatAnim=false,
    initialRadius=4.5, color='#B8D4E8', color2='#1A1916',
    tipo='baliena'
  } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  if(bgColor) scene.background = new THREE.Color(bgColor);

  const w=canvas.clientWidth, h=canvas.clientHeight;
  renderer.setSize(w,h,false);

  const camera = new THREE.PerspectiveCamera(45,w/h,0.1,100);
  camera.position.set(0,0.5,initialRadius);
  camera.lookAt(0,0,0);

  const ambient = new THREE.AmbientLight(0xfff5f5,0.7);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff0f0,1.4);
  key.position.set(3,5,3); key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe8f4ff,0.6);
  fill.position.set(-3,2,-2); scene.add(fill);
  const rim = new THREE.PointLight(0xffeedd,0.4,8);
  rim.position.set(0,-2,2); scene.add(rim);

  const planeGeo=new THREE.PlaneGeometry(8,8);
  const planeMat=new THREE.ShadowMaterial({opacity:0.1});
  const plane=new THREE.Mesh(planeGeo,planeMat);
  plane.rotation.x=-Math.PI/2; plane.position.y=-1.8; plane.receiveShadow=true;
  scene.add(plane);

  const controls = new OrbitControls(camera,canvas);
  controls.autoRotate=autoRotate; controls.autoRotateSpeed=1.8;
  controls.dampingFactor=0.08;
  controls._spherical.radius=initialRadius;
  controls._updateCamera();

  const model = buildAmigurumi(scene, tipo, color, color2);
  model.position.y=0;

  let t=0, rafId;
  function animate(){
    rafId=requestAnimationFrame(animate);
    t+=0.016;
    if(floatAnim) model.position.y=Math.sin(t*0.9)*0.12;
    controls.update();
    renderer.render(scene,camera);
  }
  animate();

  function resize(){
    const w=canvas.clientWidth,h=canvas.clientHeight;
    renderer.setSize(w,h,false);
    camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize',resize);

  return {
    renderer,scene,camera,controls,model,
    destroy:()=>{ cancelAnimationFrame(rafId); window.removeEventListener('resize',resize); renderer.dispose(); }
  };
};
