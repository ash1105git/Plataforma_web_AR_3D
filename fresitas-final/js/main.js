// ═══════════════════════════════════════════════════════════════
//  main.js — Inicialización: header, hero 3D, slider, scroll reveal
// ═══════════════════════════════════════════════════════════════

// ── Header scroll ─────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('site-header')
    .classList.toggle('scrolled', window.scrollY > 40);
});

// ── Menú burger ───────────────────────────────────────────────
const burger = document.getElementById('burger');
const nav    = document.getElementById('main-nav');
if (burger) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  }));
}

// ── Hero 3D ───────────────────────────────────────────────────
const heroCanvas = document.getElementById('hero-canvas');
if (heroCanvas && typeof createScene === 'function') {
const heroScene = createScene(heroCanvas, {
    autoRotate: true, floatAnim: true,
    initialRadius: 4.2, color: '#e8354a', seedCount: 10
  });
  heroScene.controls._spherical.radius = 4.2;
  heroScene.controls._updateCamera();
}

// ── Mini canvases en tarjetas de producto ──────────────────────
// Los canvases en el slider se inicializan en el DOM principal
document.querySelectorAll('.product-canvas-mini').forEach((cv, i) => {
  const color = cv.dataset.color || '#e8354a';
  setTimeout(() => {
    if (typeof createScene === 'function') {
      createScene(cv, { autoRotate:true, floatAnim:false, initialRadius:3.6, color });
    }
  }, 100 + i * 80);
});

// ── Slider (drag + botones) ───────────────────────────────────
const track    = document.getElementById('slider-track');
const btnNext  = document.getElementById('btn-next');
const btnPrev  = document.getElementById('btn-prev');
const CARD_W   = 272 + 22; // card min-width + gap

if (btnNext) btnNext.addEventListener('click', () => track.scrollBy({ left:  CARD_W, behavior: 'smooth' }));
if (btnPrev) btnPrev.addEventListener('click', () => track.scrollBy({ left: -CARD_W, behavior: 'smooth' }));

// Drag-to-scroll
if (track) {
  let isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', e => {
    isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', () => { isDown = false; track.style.cursor = 'grab'; });
  track.addEventListener('mousemove', e => {
    if (!isDown) return; e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX);
  });
}

// ── AR placeholder ────────────────────────────────────────────
window.openAR = function () {
  const isMobil = /Android|iPhone|iPad/i.test(navigator.userAgent);
  if (!isMobil) {
    alert('💡 Abre este sitio desde tu smartphone para usar la Realidad Aumentada.\n\nUsa Chrome en Android o Safari en iPhone.');
    return;
  }
  alert('📱 En producción aquí se abre el visor AR con tu producto tejido.');
};

// ── Scroll reveal ─────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.10, rootMargin: '0px 0px -36px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
