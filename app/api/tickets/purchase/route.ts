import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PurchaseBody = {
  buyerEmail?: unknown;
  buyerName?: unknown;
  ticketTypeId?: unknown;
  quantity?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: PurchaseBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { buyerEmail, buyerName, ticketTypeId, quantity } = body;

  const fieldErrors: Record<string, string> = {};

  if (
    typeof buyerEmail !== "string" ||
    !buyerEmail.trim() ||
    !EMAIL_RE.test(buyerEmail.trim())
  ) {
    fieldErrors.buyerEmail = "Email invalide.";
  }

  if (typeof ticketTypeId !== "string" || !ticketTypeId.trim()) {
    fieldErrors.ticketTypeId = "ticketTypeId est requis.";
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    fieldErrors.quantity = "quantity doit être un entier positif.";
  } else if (parsedQuantity > 20) {
    fieldErrors.quantity = "Maximum 20 tickets par achat.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "Validation échouée.", fieldErrors },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Public checkout: the buyer has no Supabase session, so RLS can't
  // authorize this insert — this route is the trusted boundary instead.
  // purchase_tickets() atomically decrements remaining_quantity so
  // concurrent buyers can't oversell a ticket type.
  const { data: reserved, error: reserveError } = await admin.rpc(
    "purchase_tickets",
    {
      p_ticket_type_id: ticketTypeId as string,
      p_quantity: parsedQuantity,
    }
  );

  if (reserveError) {
    return NextResponse.json(
      { error: "Impossible de traiter l'achat." },
      { status: 500 }
    );
  }

  if (!reserved || reserved.length === 0) {
    return NextResponse.json(
      { error: "Plus assez de places disponibles pour ce type de billet." },
      { status: 409 }
    );
  }

  const ticketType = reserved[0];

  const { data: event, error: eventError } = await admin
    .from("events")
    .select("organization_id")
    .eq("id", ticketType.event_id)
    .single();

  let commissionRate = 0;
  if (!eventError && event) {
    const { data: organization } = await admin
      .from("organizations")
      .select("commission_rate")
      .eq("id", event.organization_id)
      .single();
    commissionRate = organization?.commission_rate ?? 0;
  }

  const commissionCents = Math.round(ticketType.price_cents * commissionRate);
  const netCents = ticketType.price_cents - commissionCents;

  const ticketsToInsert = Array.from({ length: parsedQuantity }, () => ({
    ticket_type_id: ticketType.id,
    event_id: ticketType.event_id,
    buyer_email: (buyerEmail as string).trim(),
    buyer_name:
      typeof buyerName === "string" && buyerName.trim()
        ? buyerName.trim()
        : null,
    qr_code: randomUUID(),
    status: "valid",
    price_cents: ticketType.price_cents,
    commission_cents: commissionCents,
    net_cents: netCents,
  }));

  const { data: tickets, error: insertError } = await admin
    .from("tickets")
    .insert(ticketsToInsert)
    .select();

  if (insertError || !tickets) {
    // Roll back the capacity reservation — the sale didn't actually happen.
    await admin.rpc("release_tickets", {
      p_ticket_type_id: ticketType.id,
      p_quantity: parsedQuantity,
    });

    return NextResponse.json(
      { error: "Impossible de créer les billets." },
      { status: 500 }
    );
  }

  return NextResponse.json({ tickets }, { status: 201 });
}
