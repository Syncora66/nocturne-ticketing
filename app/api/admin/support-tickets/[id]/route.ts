import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_STATUSES = [
  "open",
  "closed",
  "resolved",
  "in_progress",
  "pending_refund_review",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { status } = body;
  if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Statut invalide.", fieldErrors: { status: "Valeur non supportée." } },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: memberships } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id);
  const orgIds = new Set((memberships ?? []).map((m) => m.organization_id));

  const { data: existing, error: fetchError } = await admin
    .from("support_tickets")
    .select("id, organization_id")
    .eq("id", id)
    .single();

  if (
    fetchError ||
    !existing ||
    !existing.organization_id ||
    !orgIds.has(existing.organization_id)
  ) {
    return NextResponse.json(
      { error: "Ticket de support introuvable." },
      { status: 404 }
    );
  }

  const { data: updated, error: updateError } = await admin
    .from("support_tickets")
    .update({
      status,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: "Impossible de mettre à jour le ticket de support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ supportTicket: updated });
}
