"use client";

/**
 * Bottom sheet para editar un cafe existente.
 *
 * Estructura igual a AddCoffeeSheet pero:
 * - Pre-llenado desde la prop `coffee`
 * - Llama onUpdate(id, updates) en vez de insert
 * - Submit label "Guardar cambios"
 * - Validaciones soft (permite mantener fechas pasadas existentes)
 *
 * Decision: duplicacion controlada con AddCoffeeSheet en vez de un CoffeeForm
 * compartido. Razon: los flujos de Add e Edit difieren en validacion + estado
 * inicial + submit semantico. Un wrapper compartido ocultaba estas diferencias.
 */

import { useEffect, useMemo, useState } from "react";
import { format, subYears } from "date-fns";
import { toast } from "sonner";

import { computeExpiration } from "@/lib/expiration";
import type { Coffee } from "@/types/coffee";

import { BottomSheet } from "./BottomSheet";
import { Field } from "./Field";

type Props = {
  coffee: Coffee | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Coffee>) => Promise<void>;
};

const QUICK_GRAMS = [250, 340, 454];

function safeNumber(value: string, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function EditCoffeeSheet({ coffee, onClose, onUpdate }: Props) {
  const { TODAY, ONE_YEAR_AGO } = useMemo(() => {
    return {
      TODAY: format(new Date(), "yyyy-MM-dd"),
      ONE_YEAR_AGO: format(subYears(new Date(), 1), "yyyy-MM-dd"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coffee?.id]);

  const [name, setName] = useState("");
  const [quantityGrams, setQuantityGrams] = useState<number>(0);
  const [roastDate, setRoastDate] = useState<string>("");
  const [manualExpires, setManualExpires] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string>("");
  const [origin, setOrigin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sincroniza el form con el coffee cuando se abre el sheet
  useEffect(() => {
    if (!coffee) return;
    setName(coffee.name);
    setQuantityGrams(coffee.quantity_grams);
    setRoastDate(coffee.roast_date ?? "");
    setManualExpires(coffee.manual_expires_at ?? "");
    setIsOpen(coffee.is_open);
    setOpenedAt(coffee.opened_at ?? "");
    setOrigin(coffee.origin ?? "");
  }, [coffee]);

  const autoExpires = useMemo(() => {
    if (!roastDate) return null;
    return computeExpiration({
      roast_date: roastDate,
      manual_expires_at: null,
      is_open: isOpen,
      opened_at: isOpen ? openedAt || TODAY : null,
    });
  }, [roastDate, isOpen, openedAt, TODAY]);

  if (!coffee) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coffee || submitting) return;
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
      await onUpdate(coffee.id, {
        name: name.trim(),
        quantity_grams: quantityGrams,
        roast_date: roastDate || null,
        manual_expires_at: roastDate ? null : manualExpires || null,
        is_open: isOpen,
        opened_at: isOpen ? openedAt || TODAY : null,
        origin: origin.trim() || null,
      });
      toast.success("Cambios guardados");
      onClose();
    } catch (err) {
      console.error("editCoffee failed", err);
      toast.error("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet
      open={coffee !== null}
      onClose={onClose}
      title={`Editar ${coffee.name}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nombre" htmlFor="edit-name">
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Colombia Huila"
            required
            className="h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-base text-text placeholder:text-text-quiet focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </Field>

        <Field label="Cantidad (gramos)" htmlFor="edit-grams">
          <div className="flex flex-col gap-2">
            <input
              id="edit-grams"
              type="number"
              min={0}
              value={quantityGrams}
              onChange={(e) => setQuantityGrams(safeNumber(e.target.value, 0))}
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
          htmlFor="edit-roast"
          hint="Si la pones, calculo el vencimiento automático"
        >
          <input
            id="edit-roast"
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
            htmlFor="edit-expires"
          >
            <input
              id="edit-expires"
              type="date"
              value={manualExpires}
              onChange={(e) => setManualExpires(e.target.value)}
              className="h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-base text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </Field>
        )}

        <Field label="Estado" htmlFor="edit-state">
          <div className="flex items-center justify-between rounded-md border border-border-strong bg-surface-raised px-3 py-2">
            <label
              htmlFor="edit-state"
              className="text-base text-text cursor-pointer select-none"
            >
              {isOpen ? "Abierto" : "Sellado"}
            </label>
            <button
              id="edit-state"
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
          <Field label="Fecha de apertura" htmlFor="edit-opened">
            <input
              id="edit-opened"
              type="date"
              value={openedAt}
              min={roastDate}
              max={TODAY}
              onChange={(e) => setOpenedAt(e.target.value)}
              className="h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 text-base text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </Field>
        )}

        <Field label="Origen (opcional)" htmlFor="edit-origin">
          <input
            id="edit-origin"
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
          {submitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </BottomSheet>
  );
}
