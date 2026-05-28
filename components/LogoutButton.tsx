"use client";

/**
 * Boton de logout en el header del home.
 * Llama supabase.auth.signOut() y deja que el route handler servidor
 * limpie cookies en el proximo request (auto-refetch).
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("logout failed", err);
      toast.error("No se pudo cerrar sesión");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      aria-label="Cerrar sesión"
      className="inline-flex h-11 items-center justify-center rounded-md px-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface-sunken hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
    >
      Salir
    </button>
  );
}
