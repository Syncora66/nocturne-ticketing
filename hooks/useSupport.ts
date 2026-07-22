"use client";

import { useState } from "react";

export type SupportMessage = {
  role: "user" | "ai";
  content: string;
};

export function useSupport(initialTicketId?: string) {
  const [ticketId, setTicketId] = useState<string | null>(
    initialTicketId ?? null
  );
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      if (data.ticketId) setTicketId(data.ticketId);
      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
      setLastAction(data.action ?? null);
      return data.action as string | undefined;
    } catch {
      setError("Impossible de contacter le support.");
    } finally {
      setLoading(false);
    }
  }

  return { ticketId, messages, sendMessage, loading, error, lastAction };
}
