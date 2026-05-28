import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

/**
 * Login page. Server Component.
 *
 * Si el usuario ya tiene sesion activa, lo manda al home (/). Si no, renderiza
 * el card centrado con el form de magic link. Es la unica ruta "marketing-adjacent"
 * del producto — el resto es app.
 */
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-4">
      <div className="w-full max-w-[360px] rounded-lg border border-border bg-surface-raised p-8">
        <div className="flex flex-col items-center text-center">
          <span aria-hidden="true" className="text-4xl">
            ☕
          </span>
          <h1 className="mt-4 text-2xl font-bold text-text">Grano a Grano</h1>
          <p className="mt-1 text-sm text-text-muted">Tu inventario de café</p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-text-quiet">
          Te enviamos un link mágico. No hay contraseñas.
        </p>
      </div>
    </main>
  );
}
