import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Snapshot of every currently-valid ticket for one event, for the
// scanner to cache offline (IndexedDB) before doors open. Only
// status="valid" is returned — scanned/refunded/cancelled tickets would
// just read as invalid anyway, so there's no reason to ship them to the
// device.
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const eventId = new URL(request.url).searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId est requis." }, { status: 400 });
  }

  // RLS on tickets scopes reads to events belonging to organizations the
  // caller owns or is a member of — an eventId outside that scope just
  // comes back empty rather than erroring, which is fine here.
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("qr_code, event_id, status, buyer_name")
    .eq("event_id", eventId)
    .eq("status", "valid")
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json(
      { error: "Impossible de récupérer les billets." },
      { status: 500 },
    );
  }

  return NextResponse.json({ tickets });
}
