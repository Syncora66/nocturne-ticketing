"use client";

import { useState } from "react";
import Toast from "@/components/Toast";

type RefundTicket = {
  id: string;
  customer_name: string;
  customer_email: string;
  description: string;
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
};

const PRIORITY_STYLES: Record<RefundTicket["priority"], string> = {
  urgent: "bg-nocturne-rose/10 text-nocturne-rose",
  high: "bg-nocturne-rose/10 text-nocturne-rose",
  normal: "bg-nocturne-gray-dark text-nocturne-text",
  low: "bg-nocturne-gray-dark text-nocturne-text",
};

export default function RefundRequestsList({
  initialTickets,
}: {
  initialTickets: RefundTicket[];
}) {
  const [tickets, setTickets] = useState<RefundTicket[]>(initialTickets);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function markAsResolved(id: string) {
    setResolvingId(id);
    try {
      const res = await fetch(`/api/admin/support-tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.error ?? "Impossible de marquer ce ticket comme traité.");
        return;
      }
      setTickets((prev) => prev.filter((t) => t.id !== id));
      setToast("Ticket marqué comme traité.");
    } catch {
      setToast("Impossible de contacter le serveur.");
    } finally {
      setResolvingId(null);
    }
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-nocturne-gray-dark p-10 text-center">
        <p className="text-sm text-nocturne-text">
          Aucune demande de remboursement en attente.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-bold text-nocturne-white">
                  {ticket.customer_name}
                </p>
                <p className="text-xs text-nocturne-text/60">
                  {ticket.customer_email}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded px-2 py-1 font-mono text-xs font-bold uppercase tracking-wide ${PRIORITY_STYLES[ticket.priority]}`}
                >
                  {ticket.priority}
                </span>
                <span className="text-xs text-nocturne-text/60">
                  {new Date(ticket.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm text-nocturne-text">
              {ticket.description}
            </p>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => markAsResolved(ticket.id)}
                disabled={resolvingId === ticket.id}
                className="rounded-md bg-nocturne-rose px-5 py-2 font-mono text-xs font-bold uppercase tracking-wide text-nocturne-white transition-colors duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black disabled:opacity-50"
              >
                {resolvingId === ticket.id ? "..." : "Marquer comme traité"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
