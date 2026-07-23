import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DashboardShell from "@/components/dashboard/DashboardShell";
import RefundRequestsList from "@/components/admin/RefundRequestsList";

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("name")
    .order("created_at", { ascending: true })
    .limit(1);

  // Same admin-client + explicit-membership pattern as
  // GET /api/admin/support-tickets — RLS isn't relied on here.
  const admin = createAdminClient();
  const { data: memberships } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id);
  const orgIds = (memberships ?? []).map((m) => m.organization_id);

  const { data: refundTickets } =
    orgIds.length > 0
      ? await admin
          .from("support_tickets")
          .select("id, customer_name, customer_email, description, priority, created_at")
          .in("organization_id", orgIds)
          .eq("status", "pending_refund_review")
          .order("created_at", { ascending: false })
      : { data: [] };

  return (
    <DashboardShell
      workspaceName={organizations?.[0]?.name ?? null}
      userEmail={user.email ?? ""}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-3xl">
            Demandes de remboursement
          </h1>
          <p className="mt-2 text-sm text-nocturne-text">
            Demandes transmises par l&apos;agent IA, en attente de traitement
            manuel.
          </p>
        </div>

        <RefundRequestsList initialTickets={refundTickets ?? []} />
      </div>
    </DashboardShell>
  );
}
