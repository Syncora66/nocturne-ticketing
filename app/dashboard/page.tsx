import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatsCard from "@/components/dashboard/StatsCard";
import EventsTable from "@/components/dashboard/EventsTable";
import CreateEventButton from "@/components/dashboard/CreateEventButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("workspace_name")
    .eq("id", user.id)
    .single();

  const [{ count: eventsCount }, { data: recentEvents }] = await Promise.all([
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("organizer_id", user.id),
    supabase
      .from("events")
      .select("id, name, date, status")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const displayName = profile?.workspace_name || user.email || "";

  return (
    <DashboardShell
      workspaceName={profile?.workspace_name ?? null}
      userEmail={user.email ?? ""}
    >
      <div className="flex flex-col gap-8">
        <div className="rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-8">
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-3xl">
            Bienvenue, {displayName}
          </h1>
          <p className="mt-2 text-sm text-nocturne-text">
            Voici un aperçu de ton activité.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <StatsCard label="Événements créés" value={String(eventsCount ?? 0)} />
          <StatsCard label="Tickets vendus" value="0" />
          <StatsCard label="Revenue" value="0 €" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-nocturne-white">
              Événements récents
            </h2>
            <CreateEventButton />
          </div>
          <div className="mt-4">
            <EventsTable events={recentEvents ?? []} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
