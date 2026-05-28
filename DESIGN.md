# Design System — Grano a Grano

> **Esta es la fuente de verdad para todas las decisiones visuales.** Antes de
> tocar UI, lee este archivo + `app/globals.css` (la implementación de tokens).
> Si necesitas algo que no está aquí, pregunta. No inventes tokens nuevos sin
> actualizar AMBOS archivos en el mismo commit.

## Product Context

- **Qué es:** Inventario inteligente de café. Mobile-first, optimizada para abrirla de pie en la cocina y en 2 segundos saber qué café tienes y cuál se vence primero.
- **Para quién:** Esteban, un solo usuario, con cuenta autenticada (Supabase magic link).
- **Categoría:** APP UI (inventario data-dense, task-focused, no marketing). Hibrido con un login page que es lo único marketing-adjacent.
- **Mood:** Cálido y utilitario. Como una cocina bien organizada o el menú de tiza de un café especialidad. Funcional con personalidad. La tipografía y el color hacen todo el trabajo, cero decoración decorativa.

## Aesthetic Direction

- **Direction:** Warm utilitarian
- **Decoration level:** Minimal — no shadows decorativas, no texturas, no patterns, no blobs, no waves. Solo shadows funcionales (FAB elevation, bottom sheet edge).
- **Reference vibe:** Menú de tiza en café especialidad. Cuaderno de tueste de un coffee shop. NO Notion (demasiado general), NO Linear (demasiado techy), NO Apple Notes (demasiado neutral).

## Typography

Una sola familia (Geist) cubre todo. Ya está cargada por Next.js scaffold via `next/font/google`, cero costo extra de loading.

- **Display + Body + UI:** **Geist Sans** — neutra, geométrica, legible en mobile, soporta `tabular-nums` para alinear números en las cards.
- **Data/Numbers (gramos, días):** **Geist Mono** cuando importa que las cifras alineen verticalmente (ej. lista de cards donde columna de "días" debe ser uniforme).
- **Loading:** Vía `next/font/google` (ya configurado en `app/layout.tsx`). NO usar `<link>` ni fonts CDN externos.

**Scale (rem, asumiendo 16px root):**

| Token | Size | Line height | Uso |
|-------|------|-------------|-----|
| `text-xs` | 12px (.75rem) | 16px | Badges, captions, hints |
| `text-sm` | 14px (.875rem) | 20px | Meta info (gramos restantes, fecha) |
| `text-base` | 16px (1rem) | 24px | Body, form labels, button text |
| `text-lg` | 18px (1.125rem) | 28px | Coffee names en cards |
| `text-xl` | 20px (1.25rem) | 28px | Days-left number en cards |
| `text-2xl` | 24px (1.5rem) | 32px | Section labels en summary |
| `text-3xl` | 30px (1.875rem) | 36px | Stats numbers en summary |
| `text-4xl` | 36px (2.25rem) | 40px | Page titles, hero "Grano a Grano" |

**Pesos disponibles:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold). NO usar 100/200/300/800/900.

**Reglas:**
- Body mínimo 16px (evita zoom automático en iOS).
- Números (gramos, días restantes) usan `font-variant-numeric: tabular-nums` siempre.
- Solo UN nivel de display: `text-4xl font-bold` para el título de página. No hay sub-titles gigantes.

## Color

Approach: **restrained + semantic**. Stone warm como base, urgency colors como único momento cromático (solo en dots + numbers, nunca como background).

### Surfaces

| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| `--c-surface` | `#FAFAF9` | stone-50 | Fondo de la app |
| `--c-surface-raised` | `#FFFFFF` | white | Cards, bottom sheets |
| `--c-surface-sunken` | `#F5F5F4` | stone-100 | Background de quick-fill buttons, dimmed sheet overlay |
| `--c-border` | `#E7E5E4` | stone-200 | Bordes de cards, separadores |
| `--c-border-strong` | `#D6D3D1` | stone-300 | Bordes de inputs |

### Text

| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| `--c-text` | `#1C1917` | stone-900 | Texto primario (nombres, números) |
| `--c-text-muted` | `#78716C` | stone-500 | Meta info ("gramos restantes", labels) |
| `--c-text-quiet` | `#A8A29E` | stone-400 | Captions, hints, section labels |
| `--c-text-on-accent` | `#FAFAF9` | stone-50 | Texto sobre fondo accent (FAB, CTA) |

### Accent

| Token | Hex | Tailwind | Uso |
|-------|-----|----------|-----|
| `--c-accent` | `#44403C` | stone-700 | FAB, CTAs primarios, botón "Agregar café" |
| `--c-accent-hover` | `#292524` | stone-800 | Hover state del accent |

### Urgency (solo en dots + days-left number + Vencido badge — nunca como background)

| Banda | Días | Hex | Tailwind |
|-------|------|-----|----------|
| Vencido | < 0 | `#A8A29E` | stone-400 (gris + strikethrough en card) |
| Rojo | 0-3 | `#DC2626` | red-600 |
| Naranja | 3-7 | `#EA580C` | orange-600 |
| Amarillo | 7-14 | `#CA8A04` | yellow-600 |
| Verde | > 14 | `#16A34A` | green-600 |

### Badges (estado de la bolsa)

| Estado | BG hex | Text hex | Tailwind |
|--------|--------|----------|----------|
| Abierto | `#FEF3C7` | `#92400E` | amber-100 + amber-800 |
| Sellado | `#E0E7FF` | `#3730A3` | indigo-100 + indigo-800 |

### Toasts (feedback de acciones)

| Tipo | BG hex | Text hex |
|------|--------|----------|
| Success | `#1C1917` | `#FAFAF9` | stone-900 + stone-50 (toast oscuro, texto claro) |
| Warning | `#FEF3C7` | `#92400E` | amber-100 + amber-800 |
| Error | `#FEE2E2` | `#991B1B` | red-100 + red-900 |

### Contrast

Todos los pares texto/fondo de arriba pasan WCAG AA (ratio ≥ 4.5:1). Para verificar al agregar combos nuevos: usar https://webaim.org/resources/contrastchecker/.

### Dark mode

No por ahora. Si en futuro: redibujar surfaces (stone-900 base, stone-800 raised), bajar saturación de urgencia 15%. Pero NO es prioridad — la app se usa de día en la cocina.

## Spacing

Base: **4px**. Density: **comfortable** (no compact, hay espacio para tocar con dedos mojados).

| Token | Value | Tailwind | Uso típico |
|-------|-------|----------|------------|
| `space-2` | 2px | `gap-0.5` | Microajustes (dot + label) |
| `space-1` | 4px | `gap-1`, `p-1` | Padding interno de badges |
| `space-2` | 8px | `gap-2`, `p-2` | Espacio entre elementos relacionados |
| `space-3` | 12px | `gap-3`, `p-3` | Padding interno de cards |
| `space-4` | 16px | `gap-4`, `p-4` | Padding de sections, margen entre cards |
| `space-6` | 24px | `gap-6`, `p-6` | Padding de bottom sheets, separación de secciones |
| `space-8` | 32px | `gap-8`, `p-8` | Espacio antes del FAB, padding superior de pantallas |
| `space-12` | 48px | `gap-12`, `p-12` | Espacio entre summary y lista |

**Touch targets:** mínimo 44px (`h-11` en Tailwind 4) en todo: botones, links, toggles, quick-fill pills, preset buttons, FAB.

## Layout

- **Approach:** mobile-first, app centrada en 480px con panel de fondo extendido en desktop.
- **Max content width:** `480px` para el área de app; `720px` para el panel de fondo decorativo en desktop.
- **Grid:** single column en mobile, single column centrada en desktop.
- **Border radius:**
  - `--radius-sm`: 6px — badges, inputs pequeños
  - `--radius-md`: 10px — cards, botones
  - `--radius-lg`: 14px — bottom sheets, cards grandes
  - `--radius-full`: 9999px — FAB, pills, dots

**Bottom sheet pattern:**
- Sube desde abajo (250ms ease-out).
- Backdrop dimmed (`stone-900` con `opacity-50`).
- Tap en backdrop o swipe-down cierra.
- Max-height 90vh, content scrollable interno.
- Border-radius solo en top corners (`rounded-t-lg`).

## Motion

Approach: **minimal-functional**. Movimiento solo cuando ayuda a entender qué pasó. Nada decorativo.

**Easing:**
- `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` — entrada (sheet sube)
- `--ease-in`: `cubic-bezier(0.7, 0, 0.84, 0)` — salida (sheet baja)
- `--ease-in-out`: `cubic-bezier(0.65, 0, 0.35, 1)` — movimiento neutral

**Duration:**
- `--dur-fast`: 150ms — toast aparece, hover states
- `--dur-medium`: 250ms — bottom sheet sube/baja
- `--dur-slow`: 300ms — card fade-out al eliminar
- `--dur-pulse`: 2000ms — dot ámbar pulsando en "construyendo el MVP" (landing)

**Animations definidas:**
- `sheet-up`: translateY(100%) → 0, 250ms ease-out
- `sheet-down`: translateY(0) → 100%, 250ms ease-in
- `toast-in`: opacity 0 → 1 + translateY(8px → 0), 150ms ease-out
- `card-out`: opacity 1 → 0, 300ms ease-in (después: height collapse para no dejar hueco)

## Iconography

NO iconos elaborados. Lo mínimo posible:
- **FAB:** `+` (texto, no icono SVG)
- **Botones secundarios:** texto solamente (ej. "Cerrar", "Cancelar")
- **Estados visuales:** dots de color (urgencia) en vez de iconos
- **Emojis:** OK puntualmente como decoración semántica (ej. ☕ en landing, NO en cards de cafés). Si se usan, deben ser obvios y minimales.

Si en futuro se necesita un set de iconos: `lucide-react` (stroke-width 1.5, sin fill). NO usar Font Awesome ni Material Icons.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-27 | Mood: cálido + utilitario | Definido en design doc fase de planning; el wireframe ya lo refleja con stone tones |
| 2026-05-28 | Una sola familia de fonts (Geist) | Cero font-loading flash, peso de página mínimo, coherencia. Geist soporta tabular-nums. Riesgo: menos personalidad tipográfica, asumido |
| 2026-05-28 | Stone-700 como accent (no color de marca brillante) | Refuerza "herramienta, no producto SaaS". Riesgo: puede sentirse monótona, pero los colores de urgencia compensan en los momentos importantes |
| 2026-05-28 | Urgency colors solo en dots + numbers, nunca background | Mantiene la app visualmente calma. La urgencia se ve cuando importa, no compite con cromia decorativa |
| 2026-05-28 | Mobile-only con panel ancho en desktop | Único usuario usa móvil. Desktop con panel de fondo evita que se vea como franja delgada |
