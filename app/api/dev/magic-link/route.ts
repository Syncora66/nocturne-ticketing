import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Dev-only shortcut: generates a real Supabase magic link via the admin
// API and redirects straight to it — same verification mechanism as a
// real email (still goes through /auth/callback), just without waiting
// on SMTP delivery. Hard-blocked outside local development: Next.js
// always sets NODE_ENV=production for `next build`/`next start`, which
// is what Vercel runs, so this 404s on every real deployment
// regardless of environment variables.
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const email = new URL(request.url).searchParams.get("email");
  if (!email || !email.trim()) {
    return NextResponse.json(
      { error: "?email=quelqu'un@example.com est requis." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { origin } = new URL(request.url);

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: email.trim(),
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.properties?.action_link) {
    return NextResponse.json(
      { error: error?.message ?? "Impossible de générer le lien." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.properties.action_link);
}
