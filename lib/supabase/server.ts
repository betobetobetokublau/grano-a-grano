/**
 * Cliente de Supabase para usar en el servidor (Server Components, Route Handlers,
 * Server Actions). Lee y escribe cookies de Next.js para mantener la sesion.
 *
 * IMPORTANTE: este archivo NO debe importarse desde Client Components.
 * Si necesitas Supabase en el cliente, usa @/lib/supabase/client.
 */

import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components no pueden escribir cookies.
            // El middleware refresca la sesion, asi que esto es seguro de ignorar.
          }
        },
      },
    },
  );
}
