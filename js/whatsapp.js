// ═══════════════════════════════════════════════════════════════
//  whatsapp.js — Botón flotante + burbuja de chat
//
//  Para cambiar el número: edita TELEFONO abajo.
//  Formato: código país + número, sin + ni espacios.
//  Colombia: 57 + celular = "573001234567"
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const TELEFONO  = '573001234567'; // ← cambia por tu número real
  const CLAVE_LST = 'fy_burbuja_cerrada';

  const fab         = document.getElementById('wa-fab');
  const burbuja     = document.getElementById('wa-burbuja');
  const cerrarBtn   = document.getElementById('wa-cerrar-btn');
  const ctaLink     = burbuja && burbuja.querySelector('.wa-cta');

  // ── 1. Mostrar burbuja 3 s después de cargar ──────────────────
  function initBurbuja() {
    if (localStorage.getItem(CLAVE_LST) === 'true') return;
    setTimeout(() => burbuja && burbuja.classList.add('show'), 3000);
  }

  // ── 2. Cerrar burbuja ─────────────────────────────────────────
  function cerrarBurbuja() {
    if (!burbuja) return;
    burbuja.classList.remove('show');
    burbuja.classList.add('hide');
    try { localStorage.setItem(CLAVE_LST, 'true'); } catch(e) {}
  }

  if (cerrarBtn) cerrarBtn.addEventListener('click', cerrarBurbuja);
  if (ctaLink)   ctaLink.addEventListener('click', cerrarBurbuja);

  // ── 3. Click en FAB ───────────────────────────────────────────
  // Desktop → abre/cierra burbuja (sin navegar)
  // Móvil   → abre WhatsApp directamente (el href actúa)
  if (fab) {
    fab.addEventListener('click', e => {
      const esMobil = /Android|iPhone|iPad/i.test(navigator.userAgent);
      if (esMobil) return; // deja que el href abra la app nativa
      e.preventDefault();
      if (!burbuja) return;
      if (burbuja.classList.contains('show')) {
        cerrarBurbuja();
      } else {
        burbuja.classList.remove('hide');
        burbuja.classList.add('show');
      }
    });
  }

  // ── 4. Función global: abrir WA con producto específico ───────
  // Se llama desde los botones "Pedir por WhatsApp" de las tarjetas
  window.pedirProductoWA = function (nombre, precio) {
    const msg = encodeURIComponent(
      `¡Hola Strawberry Yarn! 🍓\n` +
      `Me interesa este producto: *${nombre}* (${precio})\n` +
      `¿Está disponible?`
    );
    window.open(`https://wa.me/${TELEFONO}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  // ── 5. Decorator sobre openModal: inyecta botón WA en el modal ─
  const _openModalOriginal = window.openModal;
  if (typeof _openModalOriginal === 'function') {
    window.openModal = function (nombre, precio, desc, color, imgSrc) {
      _openModalOriginal(nombre, precio, desc, color, imgSrc);
      // Reemplaza el botón de carrito por WhatsApp
      setTimeout(() => {
        const btnCarrito = document.querySelector('#modal-3d .modal-btns .btn-primary');
        if (btnCarrito) {
          btnCarrito.style.background = '#25D366';
          btnCarrito.style.boxShadow  = '0 8px 22px rgba(37,211,102,.34)';
          btnCarrito.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg> Pedir por WhatsApp`;
          btnCarrito.onclick = () => pedirProductoWA(nombre, precio);
        }
      }, 200);
    };
  }

  // ── Init ──────────────────────────────────────────────────────
  initBurbuja();

})();
