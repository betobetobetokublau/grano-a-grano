import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Route handler del magic link.
 *
 * Supabase manda al usuario aqui despues de hacer click en el email, con
 * `?code=<one-time-code>` en el URL. Lo cambiamos por una sesion (sets cookies
 * via el server client) y redirigimos al home.
 *
 * Si no hay code o el exchange falla, regresa al login con un flag de error
 * para mostrar feedback (la UI puede leerlo en futuro; por ahora silencioso).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=callback_failed", origin));
  }

  return NextResponse.redirect(new URL("/", origin));
}
