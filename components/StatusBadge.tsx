/**
 * Pill que indica si la bolsa esta abierta o sellada.
 * Colores definidos en DESIGN.md (warm amber para abierto, cool indigo para sellado).
 */

type Props = {
  isOpen: boolean;
};

export function StatusBadge({ isOpen }: Props) {
  if (isOpen) {
    return (
      <span className="rounded-sm bg-badge-open-bg px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-badge-open-text">
        Abierto
      </span>
    );
  }
  return (
    <span className="rounded-sm bg-badge-sealed-bg px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-badge-sealed-text">
      Sellado
    </span>
  );
}
