"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createOtpClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");

    const supabase = createOtpClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-nocturne-black px-6">
        <p className="max-w-sm text-center text-base leading-relaxed text-nocturne-text">
          Vous allez recevoir un lien de connexion par email à{" "}
          <span className="text-nocturne-white">{email}</span>. Utilise le
          dernier email reçu — les liens précédents ne sont plus valides.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-nocturne-black px-6 py-24">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-nocturne-white">
          Se connecter
        </h1>
        <p className="mt-2 text-sm text-nocturne-text">
          Reçois un lien de connexion par email.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm text-nocturne-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-nocturne-gray-dark bg-nocturne-gray px-4 py-3 text-nocturne-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 rounded-md bg-nocturne-rose px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide text-nocturne-white transition-colors duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black disabled:opacity-50"
          >
            {status === "loading" ? "Envoi..." : "Envoyer le lien"}
          </button>

          {status === "error" && (
            <p className="text-sm text-nocturne-rose">
              Une erreur est survenue. Réessaie.
            </p>
          )}

          {status !== "error" && callbackError && (
            <p className="text-sm text-nocturne-rose">{callbackError}</p>
          )}
        </div>

        <p className="mt-6 text-sm text-nocturne-text">
          Pas encore de compte ?{" "}
          <a
            href="/auth/signup"
            className="text-nocturne-cyan hover:underline"
          >
            Créer un compte
          </a>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
