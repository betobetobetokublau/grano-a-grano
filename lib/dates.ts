/**
 * Helpers de fechas en timezone local del usuario.
 *
 * Decision arquitectural (eng review 2026-05-27): todas las comparaciones de
 * "hoy" se hacen en la TZ local del browser, NO en UTC. Esto evita off-by-one
 * cerca de medianoche en TZs no-UTC (ej. CDMX UTC-6).
 *
 * Las fechas en Supabase se almacenan como columnas DATE (sin time, sin TZ).
 * Aqui las parseamos como dia local y comparamos contra startOfDay(now local).
 */

import { differenceInCalendarDays } from "date-fns";

/**
 * Convierte una columna DATE ("YYYY-MM-DD") a un Date local al inicio del dia.
 * No usa UTC parsing — interpreta los componentes como dia local.
 */
export function parseLocalDate(dateString: string): Date {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Retorna dias entre hoy (local) y la fecha de expiracion (local).
 * Positivo = futuro (vence en X dias). Cero = hoy. Negativo = ya vencio.
 */
export function daysUntilExpiration(
  expiresAt: string,
  now: Date = new Date(),
): number {
  const exp = parseLocalDate(expiresAt);
  return differenceInCalendarDays(exp, now);
}
