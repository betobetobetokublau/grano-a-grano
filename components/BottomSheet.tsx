"use client";

/**
 * Bottom sheet base. Sube desde abajo con backdrop dimmed.
 * Cierra con tap en backdrop, ESC, o swipe-down (manejado por el browser
 * cuando el contenido es scrollable y llega al top).
 *
 * Usa <dialog> nativo HTML5 con showModal() para focus trap automatico.
 * Animaciones: 250ms ease-out subiendo, 200ms ease-in bajando.
 */

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function BottomSheet({ open, onClose, title, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const handleClick = (e: MouseEvent) => {
      // Click on backdrop (dialog itself, not its content)
      if (e.target === dialog) onClose();
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      className="m-0 max-h-[90vh] w-full max-w-md rounded-t-lg bg-surface-raised p-0 backdrop:bg-overlay sm:mb-0 sm:mt-auto"
      style={{
        marginTop: "auto",
        marginBottom: 0,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface-raised px-4 py-3">
          <h2 className="text-base font-semibold text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cerrar"
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        </header>

        <div className="overflow-y-auto px-4 pb-6 pt-4">{children}</div>
      </div>
    </dialog>
  );
}
