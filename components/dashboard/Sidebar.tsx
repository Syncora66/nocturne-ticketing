"use client";

import Link from "next/link";

const navItems = [
  { label: "Accueil", href: "/dashboard" },
  { label: "Événements", href: "/dashboard/events" },
  { label: "Remboursements", href: "/admin/support" },
  { label: "Réglages", href: "/dashboard/settings" },
  { label: "Aide", href: "/dashboard/help" },
];

export default function Sidebar({
  workspaceName,
  open,
  onClose,
}: {
  workspaceName: string | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 z-50 w-64 shrink-0 border-r border-nocturne-gray-dark bg-nocturne-gray transition-[left] duration-200 ease-out lg:static ${
          open ? "left-0" : "-left-64"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-nocturne-gray-dark px-6">
          <span className="font-mono text-sm font-bold tracking-widest text-nocturne-white">
            NOCTURNE
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-md p-1 text-nocturne-text hover:text-nocturne-white lg:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 3l12 12M15 3L3 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs uppercase tracking-wide text-nocturne-text/60">
            Collectif
          </p>
          <p className="mt-1 truncate text-sm font-bold text-nocturne-white">
            {workspaceName || "Sans nom"}
          </p>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-nocturne-text transition-colors hover:bg-nocturne-gray-dark hover:text-nocturne-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
