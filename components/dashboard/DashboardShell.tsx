"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardShell({
  workspaceName,
  userEmail,
  children,
}: {
  workspaceName: string | null;
  userEmail: string;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-nocturne-black lg:flex">
      <Sidebar
        workspaceName={workspaceName}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header
          userEmail={userEmail}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
