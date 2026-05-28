import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Corre en todas las rutas EXCEPTO:
     * - _next/static (archivos estaticos)
     * - _next/image (optimizacion de imagenes)
     * - favicon.ico
     * - archivos de imagen
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
