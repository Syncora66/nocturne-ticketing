"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CameraScanner from "@/components/scanner/CameraScanner";
import {
  getCachedTicket,
  getCachedTicketCount,
  markCachedTicketScanned,
  queuePendingScan,
} from "@/lib/scanner/db";
import { syncScanner } from "@/lib/scanner/sync";

type EventOption = {
  id: string;
  title: string;
};

type Feedback = {
  kind: "valid" | "invalid";
  headline: string;
  detail: string | null;
};

// How long a scan result stays on screen before the camera resumes —
// long enough to read at a glance, short enough not to slow down a
// queue of people at the door.
const FEEDBACK_DISPLAY_MS = 1500;

export default function ScannerClient({ events }: { events: EventOption[] }) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [cachedCount, setCachedCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [syncing, setSyncing] = useState(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSync = useCallback(async (eventId: string) => {
    if (!eventId || !navigator.onLine) return;
    setSyncing(true);
    try {
      await syncScanner(eventId);
    } catch {
      // Network hiccup mid-sync — the next successful sync (online event,
      // or the next manual scan's opportunistic push) picks up where
      // this left off. Nothing queued gets lost, so silently retrying
      // later is enough.
    } finally {
      setCachedCount(await getCachedTicketCount());
      setSyncing(false);
    }
  }, []);

  // Initial cache load + sync whenever the selected event changes. This
  // is the standard "fetch when a dependency changes" effect (see
  // https://react.dev/learn/synchronizing-with-effects#fetching-data) —
  // runSync is async, so the setState calls inside it land in a
  // microtask after this effect returns, not synchronously during it.
  useEffect(() => {
    if (!selectedEventId) return;
    getCachedTicketCount().then(setCachedCount);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runSync(selectedEventId);
  }, [selectedEventId, runSync]);

  // Online/offline tracking, with an automatic sync the moment
  // connectivity comes back — that's when the offline queue actually
  // gets a chance to flush. setState only happens inside the event
  // callbacks below, never synchronously in the effect body itself.
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      runSync(selectedEventId);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [selectedEventId, runSync]);

  const showFeedback = useCallback((next: Feedback) => {
    setFeedback(next);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(
      () => setFeedback(null),
      FEEDBACK_DISPLAY_MS,
    );
  }, []);

  const handleScan = useCallback(
    async (qrCode: string) => {
      if (!selectedEventId) return;

      const ticket = await getCachedTicket(qrCode);

      if (!ticket) {
        showFeedback({
          headline: "Billet inconnu",
          detail: "Pas dans la liste synchronisée pour cet événement.",
          kind: "invalid",
        });
        return;
      }

      if (ticket.status !== "valid") {
        showFeedback({
          headline: "Déjà scanné",
          detail: ticket.buyer_name,
          kind: "invalid",
        });
        return;
      }

      // Optimistic: accept locally immediately (this is the whole point
      // of offline support), then queue for the next sync to make it
      // official server-side.
      await markCachedTicketScanned(qrCode);
      await queuePendingScan({
        id: crypto.randomUUID(),
        qr_code: qrCode,
        event_id: selectedEventId,
        scanned_at: new Date().toISOString(),
      });

      setScanCount((c) => c + 1);
      showFeedback({
        headline: "Valide",
        detail: ticket.buyer_name,
        kind: "valid",
      });

      if (navigator.onLine) {
        runSync(selectedEventId);
      }
    },
    [selectedEventId, showFeedback, runSync],
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-4 bg-nocturne-black p-4 text-nocturne-white">
      <div className="flex items-center justify-between gap-3">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-nocturne-gray-dark bg-nocturne-gray px-3 py-2 text-sm text-nocturne-white"
        >
          {events.length === 0 && <option value="">Aucun événement</option>}
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            isOnline
              ? "bg-nocturne-gray text-nocturne-text"
              : "bg-nocturne-rose/20 text-nocturne-rose"
          }`}
        >
          {isOnline ? (syncing ? "Sync…" : "En ligne") : "Hors ligne"}
        </span>
      </div>

      <div className="relative">
        <CameraScanner onScan={handleScan} paused={!!feedback} />

        {feedback && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg text-center ${
              feedback.kind === "valid" ? "bg-green-600/90" : "bg-red-600/90"
            }`}
          >
            <span className="text-4xl" aria-hidden="true">
              {feedback.kind === "valid" ? "✓" : "✕"}
            </span>
            <span className="text-xl font-extrabold text-white">
              {feedback.headline}
            </span>
            {feedback.detail && (
              <span className="text-sm text-white/80">{feedback.detail}</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-4">
          <p className="text-2xl font-extrabold text-nocturne-white">
            {scanCount}
          </p>
          <p className="text-xs text-nocturne-text">Scans (session)</p>
        </div>
        <div className="rounded-lg border border-nocturne-gray-dark bg-nocturne-gray p-4">
          <p className="text-2xl font-extrabold text-nocturne-white">
            {cachedCount}
          </p>
          <p className="text-xs text-nocturne-text">Billets en cache</p>
        </div>
      </div>
    </div>
  );
}
