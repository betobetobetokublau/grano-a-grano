/**
 * Tipos compartidos para Coffee — re-export de los generados de Supabase
 * mas algunos helpers de UI.
 */

import type { Tables, TablesInsert } from "@/lib/database.types";

export type Coffee = Tables<"coffees">;
export type CoffeeInsert = TablesInsert<"coffees">;

/**
 * Coffee enriquecido con campos derivados estables (no dependen de "now").
 * Se construye con enrichCoffee() en hooks/useCoffees.ts.
 *
 * NOTA: days_left NO esta aqui porque depende de "hoy" y se cachearia stale.
 * Los componentes lo computan al render con daysUntilExpiration(expires_at).
 */
export type CoffeeWithComputed = Coffee & {
  expires_at: string | null; // computeExpiration()
};
