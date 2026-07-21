"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const supabase = createClient();

      // Query-string errors: Supabase's /auth/v1/verify redirects here
      // this way when the link itself is rejected (already used, or an
      // older email clicked instead of the most recent one).
      const errorDescription = searchParams.get("error_description");
      if (errorDescription) {
        setError(errorDescription.replace(/\+/g, " "));
        return;
      }

      // PKCE flow: a `code` query param to exchange server-side-style,
      // but exchangeCodeForSession also works from the browser client.
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        router.replace("/dashboard");
        return;
      }

      // Implicit flow: Supabase puts the tokens in the URL *fragment*
      // (#access_token=...&refresh_token=...), which never reaches the
      // server — only readable here, client-side, via window.location.hash.
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashErrorDescription = hashParams.get("error_description");

      if (hashErrorDescription) {
        setError(hashErrorDescription.replace(/\+/g, " "));
        return;
      }

      if (accessToken && refreshToken) {
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (setSessionError) {
          setError(setSessionError.message);
          return;
        }
        router.replace("/dashboard");
        return;
      }

      setError("Lien invalide ou expiré.");
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-nocturne-black px-6">
        <div className="max-w-sm text-center">
          <p className="text-sm text-nocturne-rose">{error}</p>
          <a
            href="/auth/login"
            className="mt-4 inline-block text-sm text-nocturne-cyan hover:underline"
          >
            Retour à la connexion
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-nocturne-black px-6">
      <p className="font-mono text-sm text-nocturne-text">Connexion...</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
