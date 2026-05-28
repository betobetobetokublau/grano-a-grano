/**
 * Dot circular de color que indica urgencia de vencimiento.
 * Tamano fijo 10px. Sin tooltip — el numero de dias y el color son self-explanatory.
 *
 * Ver lib/urgency.ts para las bandas, DESIGN.md para los tokens.
 */

import { URGENCY_DOT_CLASS, type UrgencyLevel } from "@/lib/urgency";

type Props = {
  level: UrgencyLevel;
  className?: string;
};

export function UrgencyDot({ level, className }: Props) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${URGENCY_DOT_CLASS[level]} ${className ?? ""}`}
    />
  );
}
