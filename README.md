# 🍓 Strawberry Yarn — Landing Page

Proyecto separado por módulos. Sin código espagueti.

## Estructura

```
fresitas/
├── index.html           ← Página principal
├── ar-producto.html     ← Página AR con model-viewer
│
├── css/
│   ├── variables.css    ← Tokens de diseño (colores, fuentes, sombras)
│   ├── header.css       ← Header fijo + nav responsive
│   ├── hero.css         ← Sección hero con canvas 3D
│   ├── catalogo.css     ← Slider + tarjetas de producto + grid de búsqueda
│   ├── buscador.css     ← Input de búsqueda + chips de filtro
│   ├── modal.css        ← Modal visor 3D
│   ├── layout.css       ← AR section, valores, footer, responsive
│   └── whatsapp.css     ← FAB flotante + burbuja de chat
│
├── js/
│   ├── scene3d.js       ← Motor 3D (Three.js r128, OrbitControls, texturas crochet)
│   ├── modal.js         ← Lógica del modal 3D
│   ├── buscador.js      ← Búsqueda en tiempo real + filtros por categoría
│   ├── whatsapp.js      ← FAB + burbuja + función pedirProductoWA()
│   └── main.js          ← Header, hero, slider, scroll reveal
│
└── assets/
    ├── logo.jpeg
    └── productos/
        ├── p1.jpeg … p24.jpeg   ← Fotos reales de productos
```

## Nuevas funcionalidades

### 🔍 Buscador con filtros
- Input en tiempo real (busca en nombre + tags de cada tarjeta)
- Chips de filtro: Todos / Animales / Personajes / Llaveros / Originales / Precio ↑↓
- Alterna entre slider (modo normal) y grid de 3 columnas (modo filtrado)
- Estado vacío con mensaje contextual
- Los `data-*` en cada tarjeta HTML controlan los filtros:
  - `data-nombre`, `data-precio`, `data-categoria`, `data-tags`

### 💬 WhatsApp FAB
- **Desktop**: clic abre/cierra burbuja de chat (no navega)
- **Móvil**: clic abre la app nativa de WhatsApp con mensaje pre-escrito
- Burbuja aparece a los 3 s, se guarda en `localStorage` al cerrar
- Botón "Pedir por WhatsApp" en cada tarjeta → mensaje con producto específico
- En el modal: botón "Agregar al carrito" se convierte en "Pedir por WhatsApp"

**Para cambiar el número:** edita `TELEFONO` en `js/whatsapp.js`:
```js
const TELEFONO = '573001234567'; // Colombia: 57 + número
```

### 📱 Realidad Aumentada (ar-producto.html)
- `model-viewer` v3.4.0 de Google
- `ar-modes="webxr scene-viewer quick-look"` (Android → iOS fallback)
- `ar-scale="fixed"` → el objeto aparece en su tamaño real
- `ar-placement="floor"` → se coloca sobre superficies horizontales
- Botón AR personalizado con slot
- Detección de soporte con `mv.canActivateAR`
- Aviso automático en desktop

**Para activar con tus modelos reales:**
```html
src="assets/fresita.glb"
ios-src="assets/fresita.usdz"
```

**Crear .glb:** Blender → File → Export → glTF 2.0 (.glb)
**Crear .usdz:** Reality Composer (Mac) o https://usdz-converter.com

## Agregar un producto nuevo

1. Agrega la foto en `assets/productos/`
2. Añade una tarjeta en `#slider-track` con los `data-*` correctos:
```html
<div class="product-card"
     data-nombre="mi producto"
     data-precio="20000"
     data-categoria="animal"    ← animal | personaje | llavero | original
     data-tags="perro,azul,amigurumi">
  ...
</div>
```

## Deploy (Netlify — gratis)
1. Ve a netlify.com → "Add new site" → "Deploy manually"
2. Arrastra la carpeta `fresitas/` completa
3. Listo — URL pública instantánea
