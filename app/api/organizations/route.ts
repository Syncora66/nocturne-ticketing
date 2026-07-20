import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify, slugWithSuffix } from "@/lib/slugify";

const UNIQUE_VIOLATION = "23505";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: { name?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { name } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      {
        error: "Validation échouée.",
        fieldErrors: { name: "Le nom est requis." },
      },
      { status: 400 }
    );
  }

  const trimmedName = name.trim();

  // owner_id always comes from the session, never the request body — RLS
  // ("with check owner_id = auth.uid()") is the actual enforcement here.
  let { data: organization, error } = await supabase
    .from("organizations")
    .insert({
      owner_id: user.id,
      name: trimmedName,
      slug: slugify(trimmedName),
      commission_rate: 0.05,
    })
    .select()
    .single();

  if (error?.code === UNIQUE_VIOLATION) {
    ({ data: organization, error } = await supabase
      .from("organizations")
      .insert({
        owner_id: user.id,
        name: trimmedName,
        slug: slugWithSuffix(trimmedName),
        commission_rate: 0.05,
      })
      .select()
      .single());
  }

  if (error || !organization) {
    return NextResponse.json(
      { error: "Impossible de créer l'organisation." },
      { status: 500 }
    );
  }

  // Owner is implicitly a member too, so they show up in their own org's
  // member list. Non-fatal if this fails — the org itself was created.
  await supabase
    .from("organization_members")
    .insert({ organization_id: organization.id, user_id: user.id, role: "owner" });

  return NextResponse.json({ organization }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // RLS scopes this to organizations the caller owns or is a member of.
  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Impossible de récupérer les organisations." },
      { status: 500 }
    );
  }

  return NextResponse.json({ organizations });
}
