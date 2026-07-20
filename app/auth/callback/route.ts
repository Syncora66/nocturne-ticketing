import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Supabase's own /auth/v1/verify redirects here with error params
  // (not a code) when the link itself is rejected before our app ever
  // runs — most commonly because it was already used (email clients
  // like Gmail often "pre-visit" links to scan for malware, silently
  // burning the single-use token before the person clicks it
  // themselves), or because an older email was clicked instead of the
  // most recent one.
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  if (errorCode) {
    const message = errorDescription
      ? errorDescription.replace(/\+/g, " ")
      : errorCode;
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(message)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent("Lien invalide ou expiré.")}`
  );
}
