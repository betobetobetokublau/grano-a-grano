"use client";

import { useState, type FormEvent } from "react";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

/**
 * Form de magic link. Client Component.
 *
 * Estados:
 * - idle: inicial, esperando que el usuario escriba y mande
 * - sending: request en vuelo, boton disabled
 * - sent: Supabase confirmo el envio, se muestra mensaje de exito
 * - error: algo fallo (red, rate limit, email invalido), se muestra mensaje
 */

type Status = "idle" | "sending" | "sent" | "error";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "sending") {
      return;
    }

    setStatus("sending");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      toast.error("No pudimos enviar el link. Intenta de nuevo.");
      return;
    }

    setStatus("sent");
    toast.success(`Link enviado a ${email}`);
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-md border border-border bg-surface-sunken p-4 text-sm text-text"
      >
        Te enviamos un link a <strong>{email}</strong>. Revisa tu inbox.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate={false}>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-text">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoFocus
          placeholder="tu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status === "sending"}
          className="h-11 rounded-md border border-border-strong bg-surface-raised px-3 text-base text-text placeholder:text-text-quiet focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
        />
      </div>

      {status === "error" && errorMessage ? (
        <p
          role="alert"
          className="rounded-md bg-toast-error-bg px-3 py-2 text-sm text-toast-error-text"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="h-11 w-full rounded-md bg-accent text-base font-medium text-text-on-accent transition-colors duration-150 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Enviando…" : "Recibir link"}
      </button>
    </form>
  );
}
