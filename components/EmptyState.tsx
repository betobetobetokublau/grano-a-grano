/**
 * Empty state cuando el usuario no tiene cafes registrados (dia 1).
 * Por decision de design review: mensaje calido + boton prominente (no el FAB).
 * Sin onboarding, sin tutorial.
 */

type Props = {
  onAdd: () => void;
};

export function EmptyState({ onAdd }: Props) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div aria-hidden className="mb-4 text-5xl">
        ☕
      </div>
      <h2 className="text-lg font-semibold text-text">
        Tu inventario está vacío
      </h2>
      <p className="mt-2 max-w-xs text-sm text-text-muted">
        Agrega tu primer café para empezar a llevar el control de qué tienes y
        cuándo se vence.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-base font-semibold text-text-on-accent transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        Agrega tu primer café
      </button>
    </div>
  );
}
