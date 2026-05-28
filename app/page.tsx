export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mb-3 text-4xl">☕</div>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Grano a Grano
        </h1>
        <p className="mt-3 text-base text-stone-600">
          Inventario inteligente de café.
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Sabe qué tienes y qué se vence primero.
        </p>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs text-stone-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
          Construyendo el MVP
        </div>
      </div>
    </main>
  );
}
