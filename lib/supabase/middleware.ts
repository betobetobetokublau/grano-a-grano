/**
 * Helper de middleware: refresca la sesion de Supabase en cada request.
 * Se llama desde middleware.ts en la raiz del proyecto.
 *
 * Sin esto, las sesiones expiran sin renovarse y el usuario se desloguea
 * cada vez que cierra la pestana.
 */

import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresca el token si esta proximo a expirar. NO redirigimos aqui,
  // dejamos que cada pagina decida si requiere auth.
  await supabase.auth.getUser();

  return supabaseResponse;
}
