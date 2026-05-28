# Grano a Grano

Inventario inteligente de café. App mobile-first para saber en 2 segundos qué café tienes y cuál se echa a perder primero.

**App en vivo:** https://grano-a-grano.vercel.app

## Qué hace

- Lleva inventario de las bolsas de café que tienes en casa
- Auto-calcula la fecha de vencimiento desde la fecha de tueste (sellado: +30 días, abierto: +14 días)
- Ordena las bolsas por urgencia con colores (rojo → naranja → amarillo → verde)
- Mobile-first, optimizada para abrirla de pie en la cocina

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind 4)
- **Supabase** (Postgres + Auth via magic link + RLS)
- **SWR** para fetch cliente con optimistic updates
- **date-fns** para cálculos en timezone local
- **sonner** para toasts
- **Vitest** para tests unitarios de funciones puras

## Desarrollo local

```bash
# 1. Instala dependencias
npm install

# 2. Copia las variables de entorno
cp .env.example .env.local
# Rellena .env.local con tus credenciales de Supabase

# 3. Arranca el servidor de desarrollo
npm run dev
```

Abre http://localhost:3000.

## Scripts

| Comando            | Qué hace                                                      |
|--------------------|---------------------------------------------------------------|
| `npm run dev`      | Servidor de desarrollo con hot reload                         |
| `npm run build`    | Build de producción                                            |
| `npm run start`    | Sirve el build de producción                                   |
| `npm run lint`     | ESLint                                                         |
| `npm test`         | Vitest en modo watch                                           |
| `npm run test:run` | Vitest una sola pasada (para CI)                               |
| `npm run db:types` | Regenera `lib/database.types.ts` desde el schema (necesita Docker) |

## Estructura

```
app/                       Rutas (Next.js App Router)
components/                Componentes React reusables
lib/
  supabase/
    client.ts              Cliente Supabase para Client Components
    server.ts              Cliente Supabase para Server Components
  database.types.ts        Tipos TypeScript generados desde el schema
  expiration.ts            Cálculo puro de vencimiento (sellado/abierto)
  urgency.ts               Banda de urgencia por días restantes
  dates.ts                 Helpers de fechas en timezone local
supabase/migrations/       SQL versionado del schema
vercel.json                Forza framework=nextjs (workaround del bug de auto-deteccion)
```

> **Nota:** No tenemos middleware/proxy.ts todavía. Next.js 16 + Vercel + Turbopack tienen un bug
> conocido que rompe el middleware en producción (`__dirname` no definido en Edge, o ESM/CJS
> mismatch en Node runtime). El refresh automático de sesión está diferido hasta que el bug
> se arregle (ver TODOS.md). Mientras tanto, Supabase JS client refresca la sesión por su
> cuenta en el browser.

## Migrations

El schema vive en `supabase/migrations/`. Para aplicar una migration nueva al Supabase remoto:

```bash
# Lee DATABASE_URL desde .env.local y aplica la migration con psql
set -a; source .env.local; set +a
psql "$DATABASE_URL" -f supabase/migrations/<archivo>.sql
```

Cuando cambies el schema, regenera los tipos:

```bash
npm run db:types  # Requiere Docker Desktop
```

Si Docker no está disponible, edita `lib/database.types.ts` a mano siguiendo el patrón existente.

## Deploy

Cada `git push` a `main` deploya automáticamente a Vercel.

Para deploy manual a producción:

```bash
vercel deploy --prod
```

## Tests

```bash
npm test                # watch mode
npm run test:run        # una sola pasada
```

Los tests obligatorios viven en:
- `lib/expiration.test.ts` — lógica de vencimiento
- `lib/urgency.test.ts` — bandas de color
- `lib/dates.test.ts` — comparaciones en timezone local

## Privacidad

La app usa Supabase Auth con magic link. Aunque la URL es pública, los datos están protegidos por Row Level Security (RLS): cada usuario solo puede leer y modificar sus propios cafés.
