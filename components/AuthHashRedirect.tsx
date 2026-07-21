"use client";

import { useEffect } from "react";

/**
 * Safety net: if Supabase's "Redirect URLs" allowlist doesn't include
 * our callback URL, it silently substitutes the default Site URL
 * instead of emailRedirectTo — landing the user here, on the home
 * page, with the auth tokens still sitting unread in the URL hash.
 * Forward them to the real handler instead of losing the session.
 */
export default function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token=") || hash.includes("error=")) {
      window.location.replace(`/auth/callback${hash}`);
    }
  }, []);

  return null;
}
