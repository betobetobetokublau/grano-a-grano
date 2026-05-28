/**
 * Banda de urgencia segun dias restantes hasta vencimiento.
 *
 * Las bandas estan definidas en DESIGN.md y se renderean como dots de color
 * + numero de dias coloreado en CoffeeCard. Nunca se usan como background.
 */

export type UrgencyLevel =
  | "expired"
  | "red"
  | "orange"
  | "yellow"
  | "green";

/**
 * - daysLeft = null → green (sin fecha, asumimos en buen estado)
 * - daysLeft < 0    → expired  (gris, strikethrough en la card)
 * - 0-3             → red      (urgente)
 * - 3-7             → orange
 * - 7-14            → yellow
 * - > 14            → green
 *
 * Los limites son inclusivos por la izquierda: 3 dias = orange (no red).
 */
export function urgencyLevel(daysLeft: number | null): UrgencyLevel {
  if (daysLeft === null) return "green";
  if (daysLeft < 0) return "expired";
  if (daysLeft < 3) return "red";
  if (daysLeft < 7) return "orange";
  if (daysLeft < 14) return "yellow";
  return "green";
}

/**
 * Tailwind class names para cada banda — uso en componentes:
 *   <span className={URGENCY_DOT_CLASS[level]} />
 */
export const URGENCY_DOT_CLASS: Record<UrgencyLevel, string> = {
  expired: "bg-urgency-expired",
  red: "bg-urgency-red",
  orange: "bg-urgency-orange",
  yellow: "bg-urgency-yellow",
  green: "bg-urgency-green",
};

export const URGENCY_TEXT_CLASS: Record<UrgencyLevel, string> = {
  expired: "text-urgency-expired",
  red: "text-urgency-red",
  orange: "text-urgency-orange",
  yellow: "text-urgency-yellow",
  green: "text-urgency-green",
};

import { daysUntilExpiration } from "./dates";

/**
 * Helper que se llama en CADA render para obtener daysLeft + urgency frescos
 * (importante porque "hoy" cambia y no queremos cachear).
 */
export function getCoffeeUrgency(
  coffee: { expires_at: string | null },
  now: Date = new Date(),
): { daysLeft: number | null; level: UrgencyLevel } {
  const daysLeft =
    coffee.expires_at === null ? null : daysUntilExpiration(coffee.expires_at, now);
  return { daysLeft, level: urgencyLevel(daysLeft) };
}
