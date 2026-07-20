import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify, slugWithSuffix } from "@/lib/slugify";

const UNIQUE_VIOLATION = "23505";

type CreateEventBody = {
  organizationId?: unknown;
  name?: unknown;
  date?: unknown;
  location?: unknown;
  description?: unknown;
  maxCapacity?: unknown;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: CreateEventBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { organizationId, name, date, location, description, maxCapacity } =
    body;

  const fieldErrors: Record<string, string> = {};

  if (typeof name !== "string" || !name.trim()) {
    fieldErrors.name = "Le nom de l'événement est requis.";
  }

  let dateMs: number | null = null;
  if (typeof date !== "string" || !date) {
    fieldErrors.date = "La date est requise.";
  } else {
    dateMs = new Date(date).getTime();
    if (Number.isNaN(dateMs)) {
      fieldErrors.date = "La date est invalide.";
    } else if (dateMs <= Date.now()) {
      fieldErrors.date = "La date doit être dans le futur.";
    }
  }

  if (typeof location !== "string" || !location.trim()) {
    fieldErrors.location = "Le lieu est requis.";
  }

  let parsedCapacity: number | null = null;
  if (maxCapacity !== undefined && maxCapacity !== null && maxCapacity !== "") {
    const num = Number(maxCapacity);
    if (!Number.isInteger(num) || num <= 0) {
      fieldErrors.maxCapacity =
        "La capacité doit être un nombre entier positif.";
    } else {
      parsedCapacity = num;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "Validation échouée.", fieldErrors },
      { status: 400 }
    );
  }

  // Resolve which organization this event belongs to. If the caller
  // didn't specify one, fall back to their org only when they belong to
  // exactly one. RLS is still the real security boundary if
  // organizationId is spoofed — the insert simply fails otherwise.
  let resolvedOrgId: string;
  if (typeof organizationId === "string" && organizationId) {
    resolvedOrgId = organizationId;
  } else {
    const { data: memberships, error: membershipsError } = await supabase
      .from("organization_members")
      .select("organization_id");

    if (membershipsError) {
      return NextResponse.json(
        { error: "Impossible de récupérer tes organisations." },
        { status: 500 }
      );
    }

    const orgIds = Array.from(
      new Set((memberships ?? []).map((m) => m.organization_id))
    );

    if (orgIds.length === 0) {
      return NextResponse.json(
        { error: "Crée d'abord une organisation (POST /api/organizations)." },
        { status: 400 }
      );
    }

    if (orgIds.length > 1) {
      return NextResponse.json(
        { error: "Plusieurs organisations trouvées — précise organizationId." },
        { status: 400 }
      );
    }

    resolvedOrgId = orgIds[0];
  }

  const trimmedName = (name as string).trim();

  let { data: event, error } = await supabase
    .from("events")
    .insert({
      organization_id: resolvedOrgId,
      title: trimmedName,
      slug: slugify(trimmedName),
      event_date: new Date(dateMs as number).toISOString(),
      location_name: (location as string).trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      max_capacity: parsedCapacity,
      status: "draft",
    })
    .select()
    .single();

  if (error?.code === UNIQUE_VIOLATION) {
    ({ data: event, error } = await supabase
      .from("events")
      .insert({
        organization_id: resolvedOrgId,
        title: trimmedName,
        slug: slugWithSuffix(trimmedName),
        event_date: new Date(dateMs as number).toISOString(),
        location_name: (location as string).trim(),
        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,
        max_capacity: parsedCapacity,
        status: "draft",
      })
      .select()
      .single());
  }

  if (error || !event) {
    return NextResponse.json(
      { error: "Impossible de créer l'événement." },
      { status: 500 }
    );
  }

  return NextResponse.json({ event }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // RLS scopes this to events belonging to organizations the caller owns
  // or is a member of.
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Impossible de récupérer les événements." },
      { status: 500 }
    );
  }

  return NextResponse.json({ events });
}
