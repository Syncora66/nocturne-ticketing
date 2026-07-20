import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import CreateEventForm from "@/components/dashboard/CreateEventForm";

export default async function CreateEventPage() {
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

  return (
    <DashboardShell
      workspaceName={profile?.workspace_name ?? null}
      userEmail={user.email ?? ""}
    >
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-3xl">
            Créer un événement
          </h1>
          <p className="mt-2 text-sm text-nocturne-text">
            Renseigne les infos de base. Tu pourras ajouter les tarifs
            ensuite.
          </p>
        </div>

        <CreateEventForm />
      </div>
    </DashboardShell>
  );
}
