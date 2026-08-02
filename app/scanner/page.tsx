import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ScannerClient from "@/components/scanner/ScannerClient";

export default async function ScannerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // RLS scopes this to events belonging to organizations the caller owns
  // or is a member of — same access rule as the rest of the dashboard,
  // so "organizer or door staff" just falls out of being an
  // organization_members row (see migrations/0004_phase0_rls_and_functions.sql).
  // Published events only: nothing to check in for a draft that hasn't
  // gone on sale.
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("event_date", { ascending: true });

  return <ScannerClient events={events ?? []} />;
}
