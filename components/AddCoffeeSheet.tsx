"use client";

/**
 * Bottom sheet con formulario para agregar un cafe nuevo.
 *
 * Comportamiento clave:
 * - Auto-calculo de vencimiento en vivo (cuando hay roast_date)
 * - Quick-fill buttons de cantidad (250 / 340 / 454)
 * - Sin optimistic update — espera respuesta del server antes de cerrar
 * - Validaciones soft via min/max en inputs date
 */

import { useMemo, useState } from "react";
import { format, subYears } from "date-fns";
import { toast } from "sonner";

import { computeExpiration } from "@/lib/expiration";
import type { CoffeeInsert } from "@/types/coffee";

import { BottomSheet } from "./BottomSheet";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    input: Omit<CoffeeInsert, "user_id" | "id" | "created_at">,
  ) => Promise<void>;
};

const TODAY = format(new Date(), "yyyy-MM-dd");
const ONE_YEAR_AGO = format(subYears(new Date(), 1), "yyyy-MM-dd");
const QUICK_GRAMS = [250, 340, 454];

export function AddCoffeeSheet({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [quantityGrams, setQuantityGrams] = useState<number>(340);
  const [roastDate, setRoastDate] = useState<string>("");
  const [manualExpires, setManualExpires] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string>("");
  const [origin, setOrigin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-calculo en vivo
  const autoExpires = useMemo(() => {
    if (!roastDate) return null;
    return computeExpiration({
      roast_date: roastDate,
      manual_expires_at: null,
      is_open: isOpen,
      opened_at: isOpen ? openedAt || TODAY : null,
    });
  }, [roastDate, isOpen, openedAt]);

  function reset() {
    setName("");
    setQuantityGrams(340);
    setRoastDate("");
    setManualExpires("");
    setIsOpen(false);
    setOpenedAt("");
    setOrigin("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim()) return;
    if (!roastDate && !manualExpires) {
      toast.error("Necesito una fecha de vencimiento o de tueste");
      return;
    }
    if (isOpen && roastDate && openedAt && openedAt < roastDate) {
      toast.error("La fecha de apertura no puede ser antes del tueste");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        quantity_grams: quantityGrams,
        roast_date: roastDate || null,
        manual_expires_at: roastDate ? null : manualExpires || null,
        is_open: isOpen,
        opened_at: isOpen ? openedAt || TODAY : null,
        origin: origin.trim() || null,
      });
      toast.success(`${name.trim()} agregado`);
      reset();
      onClose();
    } catch (err) {
      console.error("addCoffee failed", err);
      toast.error("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Nuevo café">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nombre" htmlFor="add-name">
          <input
            id="add-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Colombia Huila"
            required
            autoFocus
            className="h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-base text-text placeholder:text-text-quiet focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </Field>

        <Field label="Cantidad (gramos)" htmlFor="add-grams">
          <div className="flex flex-col gap-2">
            <input
              id="add-grams"
              type="number"
              min={1}
              value={quantityGrams}
              onChange={(e) => setQuantityGrams(Number(e.target.value))}
              required
              className="h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-base font-mono tabular-nums text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-2">
              {QUICK_GRAMS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setQuantityGrams(g)}
                  className={`h-11 flex-1 rounded-md border text-sm font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    quantityGrams === g
                      ? "border-accent bg-accent text-text-on-accent"
                      : "border-border-strong bg-surface-raised text-text-muted hover:bg-surface-sunken"
                  }`}
                >
                  {g}g
                </button>
              ))}
            </div>
          </div>
        </Field>

        <Field
          label="Fecha de tueste (opcional)"
          htmlFor="add-roast"
          hint="Si la pones, calculo el vencimiento automático"
        >
          <input
            id="add-roast"
            type="date"
            value={roastDate}
            min={ONE_YEAR_AGO}
            max={TODAY}
            onChange={(e) => setRoastDate(e.target.value)}
            className="h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-base text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </Field>

        {autoExpires && (
          <div className="rounded-md bg-badge-open-bg px-3 py-2 text-sm text-badge-open-text">
            Vence el {autoExpires} ({isOpen ? "abierto" : "sellado"})
          </div>
        )}

        {!roastDate && (
          <Field
            label="Fecha de vencimiento"
            htmlFor="add-expires"
            hint="Lo necesitas si no tienes la fecha de tueste"
          >
            <input
              id="add-expires"
              type="date"
              value={manualExpires}
              min={TODAY}
              onChange={(e) => setManualExpires(e.target.value)}
              className="h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-base text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </Field>
        )}

        <Field label="Estado" htmlFor="add-state">
          <div className="flex items-center justify-between rounded-md border border-border-strong bg-surface-raised px-3 py-2">
            <label
              htmlFor="add-state"
              className="text-base text-text cursor-pointer select-none"
            >
              {isOpen ? "Abierto" : "Sellado"}
            </label>
            <button
              id="add-state"
              type="button"
              role="switch"
              aria-checked={isOpen}
              onClick={() => setIsOpen((v) => !v)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isOpen ? "bg-accent" : "bg-border-strong"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-surface-raised transition-transform ${
                  isOpen ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </Field>

        {isOpen && roastDate && (
          <Field label="Fecha de apertura" htmlFor="add-opened">
            <input
              id="add-opened"
              type="date"
              value={openedAt}
              min={roastDate}
              max={TODAY}
              onChange={(e) => setOpenedAt(e.target.value)}
              className="h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-base text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </Field>
        )}

        <Field label="Origen (opcional)" htmlFor="add-origin">
          <input
            id="add-origin"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="ej. Huila, Colombia"
            className="h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-base text-text placeholder:text-text-quiet focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-base font-semibold text-text-on-accent transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {submitting ? "Guardando..." : "Agregar café"}
        </button>
      </form>
    </BottomSheet>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-muted">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-text-quiet">{hint}</span>}
    </div>
  );
}
