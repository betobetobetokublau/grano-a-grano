/**
 * Barra de 3 stats arriba del home: cafes activos, por vencer (rojo si > 0),
 * gramos totales. Responde la pregunta "que tengo?" en 2 segundos.
 *
 * Solo display, sin interaccion.
 */

import type { CoffeeWithComputed } from "@/types/coffee";

type Props = {
  coffees: CoffeeWithComputed[];
};

export function SummaryStats({ coffees }: Props) {
  const active = coffees.filter((c) => c.quantity_grams > 0);
  const expiringSoon = active.filter(
    (c) => c.days_left !== null && c.days_left < 7,
  );
  const totalGrams = active.reduce((sum, c) => sum + c.quantity_grams, 0);

  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-3" aria-label="Resumen">
      <Stat number={active.length} label="cafés activos" />
      <Stat
        number={expiringSoon.length}
        label="por vencer"
        accent={expiringSoon.length > 0}
      />
      <Stat number={totalGrams} unit="g" label="total" />
    </div>
  );
}

function Stat({
  number,
  unit,
  label,
  accent = false,
}: {
  number: number;
  unit?: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-raised px-2 py-2 text-center">
      <div
        className={`font-mono text-2xl font-bold tabular-nums ${
          accent ? "text-urgency-red" : "text-text"
        }`}
      >
        {number}
        {unit && <span className="text-base">{unit}</span>}
      </div>
      <div className="mt-0.5 text-xs text-text-muted">{label}</div>
    </div>
  );
}
