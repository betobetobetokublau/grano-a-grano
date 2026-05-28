/**
 * Calculo puro de fecha de vencimiento de cafe.
 *
 * Decision arquitectural (eng review 2026-05-27): expires_at NO se almacena
 * en Supabase. Se computa siempre desde los inputs reales (roast_date,
 * is_open, opened_at, manual_expires_at). Esto evita drift entre el valor
 * en DB y la realidad derivable.
 *
 * Reglas:
 * - Sellado + roast_date: expira a roast_date + 30 dias
 * - Abierto + roast_date + opened_at: expira a min(roast_date + 30d, opened_at + 14d)
 *   (NUNCA extender el vencimiento al abrir — el min() captura esto)
 * - Sin roast_date: usar manual_expires_at
 */

import { addDays, format } from "date-fns";

import { parseLocalDate } from "./dates";

export type CoffeeForExpiration = {
  roast_date: string | null;
  manual_expires_at: string | null;
  is_open: boolean;
  opened_at: string | null;
};

/**
 * Computa la fecha de vencimiento como string "YYYY-MM-DD".
 * Retorna null si no hay suficientes inputs para calcular.
 */
export function computeExpiration(coffee: CoffeeForExpiration): string | null {
  if (!coffee.roast_date) {
    return coffee.manual_expires_at;
  }

  const roast = parseLocalDate(coffee.roast_date);
  const sealedExpiration = addDays(roast, 30);

  if (!coffee.is_open) {
    return format(sealedExpiration, "yyyy-MM-dd");
  }

  if (!coffee.opened_at) {
    return format(sealedExpiration, "yyyy-MM-dd");
  }

  const opened = parseLocalDate(coffee.opened_at);
  const openedExpiration = addDays(opened, 14);
  const earlier =
    openedExpiration < sealedExpiration ? openedExpiration : sealedExpiration;

  return format(earlier, "yyyy-MM-dd");
}
