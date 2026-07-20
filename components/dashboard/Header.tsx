"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Header({
  userEmail,
  onMenuClick,
}: {
  userEmail: string;
  onMenuClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-nocturne-gray-dark bg-nocturne-black px-6 sm:px-10">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
        className="rounded-md p-2 text-nocturne-text hover:bg-nocturne-gray lg:hidden"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 5h16M2 10h16M2 15h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="relative ml-auto">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-nocturne-text hover:bg-nocturne-gray"
        >
          <span className="hidden sm:inline">{userEmail}</span>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-nocturne-rose font-mono text-xs font-bold text-nocturne-white"
            aria-hidden="true"
          >
            {userEmail.charAt(0).toUpperCase()}
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-nocturne-gray-dark bg-nocturne-gray py-1 shadow-lg">
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm text-nocturne-text hover:bg-nocturne-gray-dark hover:text-nocturne-white"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
