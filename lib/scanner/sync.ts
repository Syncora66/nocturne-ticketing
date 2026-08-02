import {
  getPendingScans,
  removePendingScan,
  replaceCachedTickets,
  type CachedTicket,
} from "@/lib/scanner/db";

export type SyncResult = {
  pulledCount: number;
  pushedCount: number;
  failedCount: number;
};

// Pulls a fresh valid-ticket snapshot for the event (so tickets scanned
// on another device since the last sync stop reading as valid here
// too), then flushes anything scanned locally while offline. Pull
// happens first deliberately: pushing a queued scan can itself change
// what "valid" means for the next scan, so the cache should already be
// as fresh as possible before that.
export async function syncScanner(eventId: string): Promise<SyncResult> {
  const pullRes = await fetch(`/api/scanner/tickets?eventId=${eventId}`);
  let pulledCount = 0;
  if (pullRes.ok) {
    const { tickets } = (await pullRes.json()) as { tickets: CachedTicket[] };
    await replaceCachedTickets(tickets);
    pulledCount = tickets.length;
  }

  const pending = await getPendingScans();
  let pushedCount = 0;
  let failedCount = 0;

  for (const scan of pending) {
    try {
      const res = await fetch("/api/scanner/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: scan.qr_code,
          eventId: scan.event_id,
          scannedAt: scan.scanned_at,
        }),
      });

      // Any response the server actually returned (even "already_scanned"
      // — the server is authoritative, and re-queuing wouldn't change
      // that outcome) means this queued scan is resolved and can be
      // removed. Only a network failure should leave it queued for retry.
      if (res.ok) {
        await removePendingScan(scan.id);
        pushedCount += 1;
      } else {
        failedCount += 1;
      }
    } catch {
      failedCount += 1;
    }
  }

  return { pulledCount, pushedCount, failedCount };
}
