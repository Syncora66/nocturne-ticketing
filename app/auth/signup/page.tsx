"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { workspace_name: workspaceName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-nocturne-black px-6">
        <p className="max-w-sm text-center text-base leading-relaxed text-nocturne-text">
          Vérifie ta boîte mail — on t&apos;a envoyé un lien de connexion à{" "}
          <span className="text-nocturne-white">{email}</span>.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-nocturne-black px-6 py-24">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-nocturne-white">
          Créer ton compte
        </h1>
        <p className="mt-2 text-sm text-nocturne-text">
          Zéro mot de passe. Juste un lien magique.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="workspace" className="text-sm text-nocturne-text">
              Nom du collectif
            </label>
            <input
              id="workspace"
              type="text"
              required
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-1 w-full rounded-md border border-nocturne-gray-dark bg-nocturne-gray px-4 py-3 text-nocturne-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
            />
          </div>

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
            {status === "loading" ? "Envoi..." : "Créer mon compte"}
          </button>

          {status === "error" && (
            <p className="text-sm text-nocturne-rose">
              Une erreur est survenue. Réessaie.
            </p>
          )}
        </div>

        <p className="mt-6 text-sm text-nocturne-text">
          Déjà un compte ?{" "}
          <a href="/auth/login" className="text-nocturne-cyan hover:underline">
            Se connecter
          </a>
        </p>
      </form>
    </main>
  );
}
