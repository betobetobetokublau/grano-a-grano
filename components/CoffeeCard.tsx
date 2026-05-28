/**
 * Card de un cafe en la lista del home.
 * Tap abre el bottom sheet de detalle (manejado por el parent via onClick).
 *
 * Layout: dot de urgencia | nombre + meta | dias restantes.
 * Visual: ver DESIGN.md y el wireframe original.
 *
 * IMPORTANTE: computa daysLeft + urgency al render (no cachea) para que
 * la respuesta visual sea consistente al cruzar medianoche.
 */

import { URGENCY_TEXT_CLASS, getCoffeeUrgency } from "@/lib/urgency";
import type { CoffeeWithComputed } from "@/types/coffee";

import { StatusBadge } from "./StatusBadge";
import { UrgencyDot } from "./UrgencyDot";

type Props = {
  coffee: CoffeeWithComputed;
  onClick: () => void;
};

function formatDaysLabel(days: number | null): { number: string; label: string } {
  if (days === null) return { number: "—", label: "sin fecha" };
  if (days < 0) return { number: `−${Math.abs(days)}d`, label: "vencido" };
  if (days === 0) return { number: "Hoy", label: "vence" };
  return { number: `${days}d`, label: "quedan" };
}

export function CoffeeCard({ coffee, onClick }: Props) {
  const { daysLeft, level: urgency } = getCoffeeUrgency(coffee);
  const { number, label } = formatDaysLabel(daysLeft);
  const isExpired = urgency === "expired";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md border border-border bg-surface-raised px-3.5 py-3 text-left transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isExpired ? "opacity-60" : ""
      }`}
      aria-label={`Ver detalle de ${coffee.name}`}
    >
      <UrgencyDot level={urgency} />

      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-base font-semibold text-text ${
            isExpired ? "line-through" : ""
          }`}
        >
          {coffee.name}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-text-muted">
          <span className="font-mono">{coffee.quantity_grams}g</span>
          <span aria-hidden>·</span>
          <StatusBadge isOpen={coffee.is_open} />
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div
          className={`font-mono text-xl font-bold tabular-nums ${URGENCY_TEXT_CLASS[urgency]}`}
        >
          {number}
        </div>
        <div className="text-xs text-text-quiet">{label}</div>
      </div>
    </button>
  );
}
