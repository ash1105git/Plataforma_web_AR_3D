// ═══════════════════════════════════════════════════════════════
//  buscador.js — Búsqueda + filtros de producto
//
//  Las tarjetas usan data-* en el HTML:
//    data-nombre   → nombre en minúsculas para búsqueda de texto
//    data-precio   → número (ej. 35000)
//    data-categoria → animal | personaje | llavero | original
//    data-tags     → palabras clave separadas por coma
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const inputEl      = document.getElementById('search-input');
  const clearBtn     = document.getElementById('search-clear');
  const chipsWrap    = document.getElementById('filter-chips');
  const countEl      = document.getElementById('results-count');
  const sliderWrap   = document.querySelector('#catalogo .slider-wrapper');
  const gridEl       = document.getElementById('products-grid');

  let filtroActivo = 'all';
  let queryActual  = '';

  // ── Leer datos de las tarjetas originales del slider ─────────
  const tarjetasOriginales = Array.from(
    document.querySelectorAll('#slider-track .product-card')
  );
  const productos = tarjetasOriginales.map(card => ({
    el:        card,
    nombre:    (card.dataset.nombre   || '').toLowerCase(),
    precio:    parseInt(card.dataset.precio   || '0', 10),
    categoria: (card.dataset.categoria || '').toLowerCase(),
    tags:      (card.dataset.tags     || '').toLowerCase(),
  }));

  // ── Filtrado principal ───────────────────────────────────────
  function aplicarFiltros() {
    const q = queryActual.trim();

    let resultados = productos.filter(p => {
      if (!q) return true;
      return p.nombre.includes(q) || p.tags.includes(q);
    });

    // Categoría
    if (['animal','personaje','llavero','original'].includes(filtroActivo)) {
      resultados = resultados.filter(p => p.categoria === filtroActivo);
    }
    // Orden de precio
    if (filtroActivo === 'precio-asc')
      resultados = [...resultados].sort((a,b) => a.precio - b.precio);
    if (filtroActivo === 'precio-desc')
      resultados = [...resultados].sort((a,b) => b.precio - a.precio);

    renderizar(resultados, q || filtroActivo !== 'all');
  }

  // ── Renderizado ───────────────────────────────────────────────
  function renderizar(resultados, esFiltrado) {
    if (!esFiltrado) {
      // Volver al slider
      sliderWrap.style.display = '';
      gridEl.style.display     = 'none';
      gridEl.innerHTML         = '';
      countEl.textContent      = '';
      countEl.className        = 'results-count';
      return;
    }

    sliderWrap.style.display = 'none';
    gridEl.style.display     = 'grid';
    gridEl.innerHTML         = '';

    if (resultados.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-results">
          <span>🔍</span>
          <p>No encontramos "<strong>${esc(queryActual)}</strong>"</p>
          <small>Prueba otro nombre, categoría o color</small>
        </div>`;
      countEl.textContent = 'Sin resultados';
      countEl.className   = 'results-count';
      return;
    }

    resultados.forEach(p => {
      const clone = p.el.cloneNode(true);
      clone.classList.add('visible');
      clone.classList.remove('reveal');
      gridEl.appendChild(clone);
    });

    // Re-inicializar mini-canvases 3D en los clones
    // (cloneNode no copia el contexto WebGL)
    gridEl.querySelectorAll('canvas').forEach((cv, i) => {
      const color = cv.dataset.color || '#ff4b5c';
      setTimeout(() => {
        if (typeof createScene === 'function') {
          createScene(cv, { autoRotate:true, floatAnim:false, initialRadius:3.6, color });
        }
      }, 70 + i * 55);
    });

    countEl.textContent = `${resultados.length} producto${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}`;
    countEl.className   = 'results-count activo';
  }

  // ── Eventos del input ─────────────────────────────────────────
  inputEl.addEventListener('input', () => {
    queryActual = inputEl.value.toLowerCase();
    clearBtn.classList.toggle('visible', queryActual.length > 0);
    aplicarFiltros();
  });
  clearBtn.addEventListener('click', () => {
    inputEl.value = ''; queryActual = '';
    clearBtn.classList.remove('visible');
    inputEl.focus();
    aplicarFiltros();
  });
  inputEl.addEventListener('keydown', e => { if (e.key === 'Escape') clearBtn.click(); });

  // ── Eventos de chips ──────────────────────────────────────────
  chipsWrap.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chipsWrap.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filtroActivo = chip.dataset.filtro;
    aplicarFiltros();
  });

  // ── Utilidad ─────────────────────────────────────────────────
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();
