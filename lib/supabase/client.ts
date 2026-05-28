/**
 * Cliente de Supabase para usar en el browser (Client Components).
 *
 * Se importa desde componentes con "use client". Maneja cookies de sesion
 * automaticamente. Las credenciales NEXT_PUBLIC_* viajan al browser, esto es
 * intencional: la publishable key esta hecha para ser publica, RLS protege
 * los datos por user_id.
 */

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
