import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import SupportTestChat from "@/components/SupportTestChat";

export default async function SupportTestPage() {
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

  return (
    <DashboardShell
      workspaceName={organizations?.[0]?.name ?? null}
      userEmail={user.email ?? ""}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-nocturne-white sm:text-3xl">
            AI Support — Page de test
          </h1>
          <p className="mt-2 text-sm text-nocturne-text">
            Interface brute pour tester `useSupport()` et{" "}
            <code className="font-mono text-nocturne-cyan">
              /api/support/chat
            </code>{" "}
            directement.
          </p>
        </div>

        <SupportTestChat />
      </div>
    </DashboardShell>
  );
}
