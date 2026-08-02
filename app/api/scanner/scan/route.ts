import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ScanBody = {
  qrCode?: unknown;
  eventId?: unknown;
  scannedAt?: unknown;
};

// Records one scan — used both for live (online) scans and for flushing
// the offline queue once connectivity comes back. Idempotent from the
// caller's point of view: scanning an already-scanned ticket again just
// reports "already_scanned" instead of erroring, since the offline
// queue can legitimately replay the same scan (e.g. a sync that
// succeeded server-side but whose response never reached the device).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: ScanBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 },
    );
  }

  const { qrCode, eventId, scannedAt } = body;

  if (typeof qrCode !== "string" || !qrCode.trim()) {
    return NextResponse.json({ error: "qrCode est requis." }, { status: 400 });
  }
  if (typeof eventId !== "string" || !eventId.trim()) {
    return NextResponse.json({ error: "eventId est requis." }, { status: 400 });
  }

  // Authorization check: RLS on `events` only returns this row if the
  // caller owns or is a member of its organization. This is the same
  // policy already trusted everywhere else in the codebase (see
  // /api/events GET) — reusing it here instead of re-deriving
  // membership manually keeps the two checks from ever drifting apart.
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (!event) {
    return NextResponse.json(
      { error: "Événement introuvable ou accès refusé." },
      { status: 403 },
    );
  }

  // From here on, RLS has already done its job — the admin client is
  // only needed because `tickets` has no UPDATE policy (buyers have no
  // session, so purchase/scan both go through service-role routes, per
  // the same pattern as /api/tickets/purchase).
  const admin = createAdminClient();

  const { data: ticket } = await admin
    .from("tickets")
    .select("id, event_id, status, buyer_name, scanned_at")
    .eq("qr_code", qrCode.trim())
    .maybeSingle();

  if (!ticket) {
    return NextResponse.json({ result: "not_found" }, { status: 200 });
  }

  if (ticket.event_id !== eventId) {
    return NextResponse.json({ result: "wrong_event" }, { status: 200 });
  }

  if (ticket.status !== "valid") {
    return NextResponse.json(
      {
        result: ticket.status === "scanned" ? "already_scanned" : ticket.status,
        buyerName: ticket.buyer_name,
        scannedAt: ticket.scanned_at,
      },
      { status: 200 },
    );
  }

  const scannedAtIso =
    typeof scannedAt === "string" && !Number.isNaN(Date.parse(scannedAt))
      ? scannedAt
      : new Date().toISOString();

  // The status="valid" guard makes this update atomic against a
  // concurrent scan of the same ticket on another device — only one of
  // the two racing requests actually flips a row.
  const { data: updated } = await admin
    .from("tickets")
    .update({
      status: "scanned",
      scanned_at: scannedAtIso,
      scanned_by_id: user.id,
    })
    .eq("id", ticket.id)
    .eq("status", "valid")
    .select("buyer_name")
    .maybeSingle();

  if (!updated) {
    // Lost the race — someone else's scan landed first between our read
    // and our write.
    return NextResponse.json({ result: "already_scanned" }, { status: 200 });
  }

  return NextResponse.json(
    { result: "valid", buyerName: updated.buyer_name },
    { status: 200 },
  );
}
