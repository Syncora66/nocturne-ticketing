import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // RLS scopes this to tickets sold on events belonging to organizations
  // the caller owns or is a member of.
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Impossible de récupérer les billets." },
      { status: 500 }
    );
  }

  return NextResponse.json({ tickets });
}
