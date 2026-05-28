/**
 * Cliente de Supabase para usar en el browser (Client Components).
 *
 * Se importa desde componentes con "use client". Maneja cookies de sesion
 * automaticamente. Las credenciales NEXT_PUBLIC_* viajan al browser, esto es
 * intencional: la publishable key esta hecha para ser publica, RLS protege
 * los datos por user_id.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Singleton client por modulo. @supabase/ssr internamente cachea pero el
 * wrapper se reinstanciaba en cada render, lo cual rompia useCallback
 * memoization. Esto evita el problema.
 */
let _client: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}
