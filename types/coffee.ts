/**
 * Tipos compartidos para Coffee — re-export de los generados de Supabase
 * mas algunos helpers de UI.
 */

import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

export type Coffee = Tables<"coffees">;
export type CoffeeInsert = TablesInsert<"coffees">;
export type CoffeeUpdate = TablesUpdate<"coffees">;

/**
 * Coffee con campos derivados (computados client-side, no se almacenan).
 * Se construye con enrichCoffee() en hooks/useCoffees.ts.
 */
export type CoffeeWithComputed = Coffee & {
  expires_at: string | null; // computeExpiration()
  days_left: number | null; // daysUntilExpiration(expires_at), null si expires_at es null
};
