"use client";

/**
 * Bottom sheet de detalle de un cafe con todas las acciones:
 * - Prepare un poco (presets 18g/30g/60g + custom)
 * - Abri la bolsa (solo si is_open=false)
 * - Se acabo (con confirmacion)
 * - Eliminar (con confirmacion)
 *
 * Race condition protection: cada accion deshabilita el boton durante la
 * mutation. Si el server rechaza, SWR hace rollback automatico.
 */

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { URGENCY_TEXT_CLASS } from "@/lib/urgency";
import type { Coffee, CoffeeWithComputed } from "@/types/coffee";

import { BottomSheet } from "./BottomSheet";
import { StatusBadge } from "./StatusBadge";
import { UrgencyDot } from "./UrgencyDot";

type Props = {
  coffee: CoffeeWithComputed | null;
  urgency: import("@/lib/urgency").UrgencyLevel | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Coffee>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const BREW_PRESETS = [18, 30, 60];
const TODAY = format(new Date(), "yyyy-MM-dd");

type ConfirmState = null | "finish" | "delete";

export function CoffeeDetailSheet({
  coffee,
  urgency,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const [brewAmount, setBrewAmount] = useState<number>(18);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  if (!coffee || !urgency) return null;

  async function handleBrew() {
    if (!coffee || busy) return;
    if (brewAmount <= 0) {
      toast.error("Cantidad inválida");
      return;
    }
    const remaining = Math.max(0, coffee.quantity_grams - brewAmount);
    setBusy(true);
    try {
      await onUpdate(coffee.id, { quantity_grams: remaining });
      toast.success(`Listo, -${brewAmount}g de ${coffee.name}`);
    } catch (err) {
      console.error("brew failed", err);
      toast.error("No se pudo actualizar");
    } finally {
      setBusy(false);
    }
  }

  async function handleOpen() {
    if (!coffee || busy) return;
    setBusy(true);
    try {
      await onUpdate(coffee.id, {
        is_open: true,
        opened_at: TODAY,
      });
      toast.success("Bolsa abierta. Recordá el vencimiento nuevo.");
    } catch (err) {
      console.error("open bag failed", err);
      toast.error("No se pudo actualizar");
    } finally {
      setBusy(false);
    }
  }

  async function handleFinish() {
    if (!coffee || busy) return;
    setBusy(true);
    try {
      await onUpdate(coffee.id, { quantity_grams: 0 });
      toast.success(`${coffee.name} terminado`);
      setConfirm(null);
      onClose();
    } catch (err) {
      console.error("finish failed", err);
      toast.error("No se pudo actualizar");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!coffee || busy) return;
    setBusy(true);
    try {
      await onDelete(coffee.id);
      toast.success(`${coffee.name} eliminado`);
      setConfirm(null);
      onClose();
    } catch (err) {
      console.error("delete failed", err);
      toast.error("No se pudo eliminar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet
      open={coffee !== null}
      onClose={onClose}
      title={coffee.name}
    >
      <div className="flex flex-col gap-5">
        {/* Header info */}
        <div className="flex items-center justify-between rounded-md bg-surface-sunken px-3 py-2.5">
          <div className="flex items-center gap-3">
            <UrgencyDot level={urgency} />
            <div>
              <div className="font-mono text-lg font-bold tabular-nums text-text">
                {coffee.quantity_grams}g
              </div>
              <div className="text-xs text-text-muted">restantes</div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`font-mono text-xl font-bold tabular-nums ${URGENCY_TEXT_CLASS[urgency]}`}
            >
              {coffee.days_left === null
                ? "—"
                : coffee.days_left < 0
                  ? `${Math.abs(coffee.days_left)}d`
                  : `${coffee.days_left}d`}
            </div>
            <div className="text-xs text-text-quiet">
              {coffee.days_left === null
                ? "sin fecha"
                : coffee.days_left < 0
                  ? "vencido"
                  : "quedan"}
            </div>
          </div>
        </div>

        {/* Meta info */}
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Meta label="Estado">
            <StatusBadge isOpen={coffee.is_open} />
          </Meta>
          {coffee.origin && <Meta label="Origen">{coffee.origin}</Meta>}
          {coffee.roast_date && (
            <Meta label="Tueste">{coffee.roast_date}</Meta>
          )}
          {coffee.opened_at && (
            <Meta label="Abierto">{coffee.opened_at}</Meta>
          )}
          {coffee.expires_at && (
            <Meta label="Vence">{coffee.expires_at}</Meta>
          )}
        </dl>

        {/* Brew action */}
        <section className="flex flex-col gap-2 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-text-muted">
            Preparé un poco
          </h3>
          <div className="flex gap-2">
            {BREW_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setBrewAmount(g)}
                className={`h-11 flex-1 rounded-md border text-sm font-semibold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  brewAmount === g
                    ? "border-accent bg-accent text-text-on-accent"
                    : "border-border-strong bg-surface-raised text-text-muted hover:bg-surface-sunken"
                }`}
              >
                {g}g
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={coffee.quantity_grams}
              value={brewAmount}
              onChange={(e) => setBrewAmount(Number(e.target.value))}
              aria-label="Cantidad personalizada"
              className="h-11 w-24 rounded-md border border-border-strong bg-surface-raised px-3 text-base font-mono tabular-nums text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={handleBrew}
              disabled={busy || coffee.quantity_grams === 0}
              className="h-11 flex-1 rounded-md bg-accent text-base font-semibold text-text-on-accent transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
            >
              Restar {brewAmount}g
            </button>
          </div>
        </section>

        {/* Open bag action */}
        {!coffee.is_open && (
          <section className="border-t border-border pt-4">
            <button
              type="button"
              onClick={handleOpen}
              disabled={busy}
              className="h-11 w-full rounded-md border border-border-strong bg-surface-raised text-base font-semibold text-text transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
            >
              Abrí la bolsa
            </button>
          </section>
        )}

        {/* Danger actions */}
        <section className="flex flex-col gap-2 border-t border-border pt-4">
          {confirm === "finish" ? (
            <ConfirmRow
              message={`¿Marcar ${coffee.name} como terminado?`}
              busy={busy}
              onConfirm={handleFinish}
              onCancel={() => setConfirm(null)}
              confirmLabel="Sí, terminado"
            />
          ) : confirm === "delete" ? (
            <ConfirmRow
              message={`¿Eliminar ${coffee.name}? No se puede deshacer.`}
              busy={busy}
              onConfirm={handleDelete}
              onCancel={() => setConfirm(null)}
              confirmLabel="Eliminar"
              danger
            />
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setConfirm("finish")}
                disabled={busy || coffee.quantity_grams === 0}
                className="h-11 w-full rounded-md border border-border-strong bg-surface-raised text-sm font-medium text-text-muted transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
              >
                Se acabó
              </button>
              <button
                type="button"
                onClick={() => setConfirm("delete")}
                disabled={busy}
                className="h-11 w-full rounded-md border border-border-strong bg-surface-raised text-sm font-medium text-urgency-red transition-colors hover:bg-toast-error-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-urgency-red disabled:opacity-60"
              >
                Eliminar
              </button>
            </div>
          )}
        </section>
      </div>
    </BottomSheet>
  );
}

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-text-quiet">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-text">{children}</dd>
    </div>
  );
}

function ConfirmRow({
  message,
  busy,
  onConfirm,
  onCancel,
  confirmLabel,
  danger = false,
}: {
  message: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-strong bg-surface-sunken px-3 py-3">
      <p className="text-sm text-text">{message}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="h-11 flex-1 rounded-md border border-border-strong bg-surface-raised text-sm font-semibold text-text-muted hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`h-11 flex-1 rounded-md text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 ${
            danger
              ? "bg-urgency-red text-text-on-accent hover:opacity-90 focus-visible:ring-urgency-red"
              : "bg-accent text-text-on-accent hover:bg-accent-hover focus-visible:ring-accent"
          }`}
        >
          {busy ? "..." : confirmLabel}
        </button>
      </div>
    </div>
  );
}
