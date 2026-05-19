// ═══════════════════════════════════════════════════════════════
//  modal.js — Lógica del modal visor 3D
// ═══════════════════════════════════════════════════════════════

let _modalScene = null;
let _lightMode  = 0;

function openModal(name, price, desc, color, imgSrc) {
  document.getElementById('modal-nombre').textContent = name;
  document.getElementById('modal-precio').textContent = price;
  document.getElementById('modal-desc').textContent   = desc;

  const modal = document.getElementById('modal-3d');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  switchModalView('3d');

  // Foto real
  const fotoEl = document.getElementById('modal-foto');
  if (fotoEl && imgSrc) {
    fotoEl.src = imgSrc; fotoEl.style.display = 'block';
  } else if (fotoEl) { fotoEl.style.display = 'none'; }

  // 3D — esperar que el modal esté en el DOM antes de crear el contexto WebGL
  setTimeout(() => {
    const canvas = document.getElementById('modal-canvas');
    if (_modalScene) { _modalScene.destroy(); _modalScene = null; }
    _modalScene = createScene(canvas, {
      autoRotate: true, floatAnim: true,
      initialRadius: 3.8, color: color || '#ff4b5c', seedCount: 10
    });
    _modalScene.controls.autoRotateSpeed = 1.3;
    _modalScene.controls._spherical.radius = 3.8;
    _modalScene.controls._updateCamera();
  }, 80);
}

function switchModalView(modo) {
  const canvas  = document.getElementById('modal-canvas');
  const foto    = document.getElementById('modal-foto');
  const tab3d   = document.getElementById('tab-3d');
  const tabFoto = document.getElementById('tab-foto');

  if (modo === '3d') {
    canvas.style.opacity = '1'; canvas.style.pointerEvents = 'all';
    foto.style.display = 'none';
    tab3d.classList.add('active'); tabFoto.classList.remove('active');
    if (_modalScene) _modalScene.controls.autoRotate = true;
  } else {
    canvas.style.opacity = '0'; canvas.style.pointerEvents = 'none';
    foto.style.display = 'block';
    tab3d.classList.remove('active'); tabFoto.classList.add('active');
  }
}

function closeModal() {
  document.getElementById('modal-3d').classList.remove('open');
  document.body.style.overflow = '';
  if (_modalScene) { _modalScene.destroy(); _modalScene = null; }
  _lightMode = 0;
}

function toggleLight() {
  if (!_modalScene) return;
  _lightMode = (_lightMode + 1) % 3;
  const btn    = document.getElementById('ctrl-luz');
  const lights = _modalScene.scene.children.filter(c => c.isLight);
  if (_lightMode === 0) {
    btn.textContent = '☀ Luz';
    lights.forEach(l => { l.intensity = l._orig || l.intensity; });
    btn.classList.remove('active');
  } else if (_lightMode === 1) {
    lights.forEach(l => { l._orig = l.intensity; l.intensity *= .28; });
    btn.textContent = '🌙 Noche'; btn.classList.add('active');
  } else {
    lights.forEach(l => { l.intensity = 0; });
    _modalScene.scene.children.filter(c => c.isDirectionalLight)[0].intensity = 2.4;
    btn.textContent = '✦ Drama'; btn.classList.remove('active'); _lightMode = 0;
  }
}

// Cerrar al hacer clic en el fondo
document.getElementById('modal-3d').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

// ── Modal extendido para amigurumis 3D (8 personajes reales) ──
function openModalAmigurumi(name, price, desc, color, color2, tipo, imgSrc) {
  document.getElementById('modal-nombre').textContent = name;
  document.getElementById('modal-precio').textContent = price;
  document.getElementById('modal-desc').textContent   = desc;

  const modal = document.getElementById('modal-3d');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  switchModalView('3d');

  const fotoEl = document.getElementById('modal-foto');
  if (fotoEl && imgSrc) { fotoEl.src = imgSrc; fotoEl.style.display = 'block'; }
  else if (fotoEl) { fotoEl.style.display = 'none'; }

  setTimeout(() => {
    const canvas = document.getElementById('modal-canvas');
    if (_modalScene) { _modalScene.destroy(); _modalScene = null; }

    if (tipo && typeof window.createSceneAmigurumi === 'function') {
      _modalScene = window.createSceneAmigurumi(canvas, {
        autoRotate: true, floatAnim: true,
        initialRadius: 4.0, color: color || '#B8D4E8',
        color2: color2 || '#1A1916', tipo: tipo
      });
    } else {
      _modalScene = createScene(canvas, {
        autoRotate: true, floatAnim: true,
        initialRadius: 3.8, color: color || '#ff4b5c', seedCount: 10
      });
    }
    _modalScene.controls.autoRotateSpeed = 1.3;
    _modalScene.controls._spherical.radius = 4.0;
    _modalScene.controls._updateCamera();
  }, 80);
}
