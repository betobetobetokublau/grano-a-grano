/**
 * Estado de carga inicial: 3 cards placeholder con shimmer animation.
 * Se ve cuando SWR esta fetching y todavia no hay data en cache.
 */

export function SkeletonCards() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando cafés"
      className="flex flex-col gap-2 px-4 py-2"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md border border-border bg-surface-raised px-3.5 py-3"
        >
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-surface-sunken" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded-sm bg-surface-sunken" />
            <div className="h-3 w-24 animate-pulse rounded-sm bg-surface-sunken" />
          </div>
          <div className="h-7 w-10 animate-pulse rounded-sm bg-surface-sunken" />
        </div>
      ))}
    </div>
  );
}
