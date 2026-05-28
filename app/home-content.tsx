"use client";

/**
 * Cliente del home. Orquesta:
 * - useCoffees: data + mutations
 * - SummaryStats arriba
 * - Secciones "Por vencer pronto" (<7d) vs "En buen estado" (>=7d)
 * - Toggle "Ver terminados" (cafes con 0g)
 * - FAB para agregar
 * - Sheets: AddCoffee, CoffeeDetail
 *
 * Estados de UI: loading (skeleton), error (toast + retry), empty (mensaje calido),
 * data (lista normal).
 */

import { useState } from "react";
import { toast } from "sonner";

import { AddCoffeeSheet } from "@/components/AddCoffeeSheet";
import { CoffeeCard } from "@/components/CoffeeCard";
import { CoffeeDetailSheet } from "@/components/CoffeeDetailSheet";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCards } from "@/components/SkeletonCards";
import { SummaryStats } from "@/components/SummaryStats";
import { useCoffees } from "@/hooks/useCoffees";
import { urgencyLevel } from "@/lib/urgency";

export function HomeContent() {
  const {
    coffees,
    isLoading,
    error,
    addCoffee,
    updateCoffee,
    deleteCoffee,
    refresh,
  } = useCoffees();

  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showFinished, setShowFinished] = useState(false);

  const activeCoffees = coffees.filter((c) => c.quantity_grams > 0);
  const finishedCoffees = coffees.filter((c) => c.quantity_grams === 0);

  const urgent = activeCoffees.filter(
    (c) => c.days_left !== null && c.days_left < 7,
  );
  const healthy = activeCoffees.filter(
    (c) => c.days_left === null || c.days_left >= 7,
  );

  const selected = coffees.find((c) => c.id === detailId) ?? null;
  const selectedUrgency =
    selected && selected.days_left !== null
      ? urgencyLevel(selected.days_left)
      : selected
        ? ("green" as const)
        : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-surface-raised px-4 py-4">
        <h1 className="text-2xl font-bold text-text">Grano a Grano</h1>
        <p className="text-sm text-text-muted">Tu inventario de café</p>
      </header>

      {/* Summary (siempre visible aunque este vacio) */}
      {!isLoading && <SummaryStats coffees={activeCoffees} />}

      {/* Estados */}
      {isLoading ? (
        <SkeletonCards />
      ) : error ? (
        <ErrorPanel onRetry={() => refresh()} />
      ) : activeCoffees.length === 0 && finishedCoffees.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <main className="flex flex-1 flex-col gap-1 pb-32">
          {urgent.length > 0 && (
            <Section label="Por vencer pronto">
              {urgent.map((c) => (
                <CoffeeCard
                  key={c.id}
                  coffee={c}
                  urgency={urgencyLevel(c.days_left ?? 999)}
                  onClick={() => setDetailId(c.id)}
                />
              ))}
            </Section>
          )}

          {healthy.length > 0 && (
            <Section label="En buen estado">
              {healthy.map((c) => (
                <CoffeeCard
                  key={c.id}
                  coffee={c}
                  urgency={urgencyLevel(c.days_left ?? 999)}
                  onClick={() => setDetailId(c.id)}
                />
              ))}
            </Section>
          )}

          {finishedCoffees.length > 0 && (
            <div className="px-4 py-3">
              <button
                type="button"
                onClick={() => setShowFinished((v) => !v)}
                className="h-11 text-sm font-medium text-text-muted hover:text-text"
              >
                {showFinished
                  ? `Ocultar terminados (${finishedCoffees.length})`
                  : `Ver terminados (${finishedCoffees.length})`}
              </button>

              {showFinished && (
                <Section label="Terminados">
                  {finishedCoffees.map((c) => (
                    <CoffeeCard
                      key={c.id}
                      coffee={c}
                      urgency="expired"
                      onClick={() => setDetailId(c.id)}
                    />
                  ))}
                </Section>
              )}
            </div>
          )}
        </main>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        aria-label="Agregar café"
        className="fixed bottom-6 right-4 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-text-on-accent shadow-lg transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:right-[calc(50%-12rem)]"
      >
        <span aria-hidden className="text-3xl leading-none">
          +
        </span>
      </button>

      {/* Sheets */}
      <AddCoffeeSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (input) => {
          await addCoffee(input);
        }}
      />

      <CoffeeDetailSheet
        coffee={selected}
        urgency={selectedUrgency}
        onClose={() => setDetailId(null)}
        onUpdate={updateCoffee}
        onDelete={deleteCoffee}
      />
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-text-quiet">
        {label}
      </h2>
      <div className="flex flex-col gap-2 px-4">{children}</div>
    </section>
  );
}

function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <p className="text-sm text-text-muted">
        No pudimos cargar tus cafés.
      </p>
      <button
        type="button"
        onClick={() => {
          onRetry();
          toast.message("Reintentando...");
        }}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-border-strong bg-surface-raised px-4 text-sm font-semibold text-text hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Reintentar
      </button>
    </div>
  );
}
