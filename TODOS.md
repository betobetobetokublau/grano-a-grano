# TODOS — Grano a Grano

Items diferidos del CEO review (2026-05-27). Prioridad estimada post-MVP.

## P1 — Bloqueado por bug externo

### Re-agregar middleware de auto-refresh de sesion Supabase
- **Que:** Volver a crear `middleware.ts` en la raiz + `lib/supabase/session.ts` con la funcion `updateSession()` que refresca el JWT en cada request.
- **Por que:** Sin este middleware, la sesion se refresca solo cuando el cliente JS de Supabase lo hace en el browser. Funciona, pero menos eficiente, y puede causar requests de servidor sin auth fresca.
- **Bloqueado por:** Bug de Next.js 16.2.6 + Vercel + Turbopack. El bundle de middleware en Edge runtime falla con `ReferenceError: __dirname is not defined`. Forzar Node.js runtime falla con `SyntaxError: Cannot use import statement outside a module` (CJS/ESM mismatch). Probado el 2026-05-28.
- **Que esperar:** Vercel y/o Next.js arreglen el bundling de middleware. Revisar cuando salga Next.js 16.3 o 17, o cuando Vercel publique fix.
- **Esfuerzo:** S (CC: ~5 min cuando este desbloqueado)
- **Como verificar:** Recrear los archivos del commit anterior, deploy, ver si la URL responde 200 sin MIDDLEWARE_INVOCATION_FAILED.

## P2 — Post-MVP v1.1

### PWA Instalable
- **Que:** Agregar manifest.json y service worker basico para que la app se instale en el home screen del telefono.
- **Por que:** La app se usa de pie en la cocina. Tap en icono vs abrir Safari y navegar = 2s vs 10s.
- **Esfuerzo:** S (CC: ~10 min)
- **Depende de:** MVP deployado en Vercel

### Prepara Hoy
- **Que:** Banner arriba de la lista principal que sugiere que cafe preparar basado en urgencia de vencimiento.
- **Por que:** Transforma la app de inventario pasivo a asistente activo.
- **Esfuerzo:** S (CC: ~10 min)
- **Depende de:** MVP funcional con datos reales

### Wireframe de Pantalla de Detalle
- **Que:** Crear wireframe visual de la pantalla de detalle (bottom sheet) mostrando los presets de preparacion (18g/30g/60g), toggle de abrir bolsa, estados de confirmacion (toast normal y toast warning), y boton eliminar.
- **Por que:** El 80% del uso diario es tap en card + registrar preparacion. Sin wireframe, el implementador decide el layout al vuelo.
- **Esfuerzo:** S (CC: ~5 min)
- **Depende de:** DESIGN.md definido (colores, tipografia)

### Validar Contraste de Colores de Urgencia
- **Que:** Verificar que los 4 colores de urgencia (rojo #dc2626, naranja #ea580c, amarillo #ca8a04, verde #16a34a) cumplen ratio 4.5:1 contra el fondo final del design system.
- **Por que:** Si el design system elige un fondo no-blanco, alguno de estos colores podria no ser legible, especialmente amarillo y verde.
- **Esfuerzo:** S (CC: ~2 min)
- **Depende de:** DESIGN.md definido (color de fondo)

## P3 — Nice to have

### Quick-Add desde Historial
- **Que:** Boton "Agregar de nuevo" en cafes terminados que pre-llena nombre, origen y gramos.
- **Por que:** Si recompras los mismos cafes, elimina 80% del trabajo de registro.
- **Esfuerzo:** S (CC: ~5 min)
- **Depende de:** Al menos un cafe terminado en el sistema

### Empty State con Personalidad
- **Que:** Mensaje y visual cuidado cuando no hay cafes registrados.
- **Por que:** Primera impresion memorable vs pantalla generica.
- **Esfuerzo:** S (CC: ~5 min)
- **Depende de:** DESIGN.md definido (colores, tipografia, tono)

### Barra de Vida Visual
- **Que:** Barra de progreso en cada card que muestra porcentaje de cafe restante.
- **Por que:** Visual instantanea vs leer numeros. Refuerza la regla de los 2 segundos.
- **Esfuerzo:** S (CC: ~5 min)
- **Depende de:** DESIGN.md definido (colores del gradiente)
