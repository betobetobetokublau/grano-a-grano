export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mb-3 text-4xl">☕</div>
        <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
          Grano a Grano
        </h1>
        <p className="mt-3 text-base text-text-muted">
          Inventario inteligente de café.
        </p>
        <p className="mt-1 text-sm text-text-quiet">
          Sabe qué tienes y qué se vence primero.
        </p>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-4 py-1.5 text-xs text-text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-badge-open-text opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-badge-open-text" />
          </span>
          Construyendo el MVP
        </div>
      </div>
    </main>
  );
}
