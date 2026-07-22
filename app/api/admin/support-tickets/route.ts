import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: memberships } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id);
  const orgIds = (memberships ?? []).map((m) => m.organization_id);

  if (orgIds.length === 0) {
    return NextResponse.json({ supportTickets: [] });
  }

  const status = new URL(request.url).searchParams.get("status");

  let query = admin
    .from("support_tickets")
    .select("*")
    .in("organization_id", orgIds)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: supportTickets, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Impossible de récupérer les tickets de support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ supportTickets });
}
