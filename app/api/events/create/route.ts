import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CreateEventBody = {
  name?: unknown;
  date?: unknown;
  location?: unknown;
  description?: unknown;
  maxCapacity?: unknown;
};

export async function POST(request: Request) {
  // organizer_id always comes from the authenticated session — never from
  // the request body. The insert below uses the service-role key (bypasses
  // RLS), so this check is the only thing standing between "create my own
  // event" and "create an event for anyone."
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

  const { name, date, location, description, maxCapacity } = body;

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

  const admin = createAdminClient();
  const { data: event, error } = await admin
    .from("events")
    .insert({
      organizer_id: user.id,
      name: (name as string).trim(),
      date: new Date(dateMs as number).toISOString(),
      location: (location as string).trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      max_capacity: parsedCapacity,
      status: "draft",
      language: "fr",
    })
    .select()
    .single();

  if (error || !event) {
    return NextResponse.json(
      { error: "Impossible de créer l'événement." },
      { status: 500 }
    );
  }

  return NextResponse.json({ event }, { status: 201 });
}
