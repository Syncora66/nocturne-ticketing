// Offline storage for the QR scanner — two IndexedDB object stores:
//
// - cachedTickets: a snapshot of every valid ticket for the event
//   currently being scanned (synced from /api/scanner/tickets whenever
//   online). Scans are checked against this store first, so validation
//   works with zero network round-trip.
// - pendingScans: scans recorded while offline (or while a live scan
//   request failed), queued here until the next successful sync flushes
//   them to /api/scanner/scan.
//
// Native IndexedDB rather than a wrapper library — two small stores and
// a handful of operations don't justify another dependency.

const DB_NAME = "tick8t-scanner";
const DB_VERSION = 1;
const TICKETS_STORE = "cachedTickets";
const PENDING_STORE = "pendingScans";

export type CachedTicket = {
  qr_code: string;
  event_id: string;
  status: string;
  buyer_name: string | null;
};

export type PendingScan = {
  // Client-generated id (crypto.randomUUID) — lets the same queued scan
  // be safely retried without ever double-counting it server-side.
  id: string;
  qr_code: string;
  event_id: string;
  scanned_at: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TICKETS_STORE)) {
        db.createObjectStore(TICKETS_STORE, { keyPath: "qr_code" });
      }
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Replaces the entire local ticket cache with a fresh snapshot — called
// after every successful sync so scanned-elsewhere tickets (another
// staff member's device) get picked up instead of staying stale forever.
export async function replaceCachedTickets(
  tickets: CachedTicket[],
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(TICKETS_STORE, "readwrite");
    tx.objectStore(TICKETS_STORE).clear();
    tickets.forEach((ticket) => tx.objectStore(TICKETS_STORE).put(ticket));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getCachedTicket(
  qrCode: string,
): Promise<CachedTicket | undefined> {
  const db = await openDb();
  const tx = db.transaction(TICKETS_STORE, "readonly");
  const result = await promisifyRequest(
    tx.objectStore(TICKETS_STORE).get(qrCode),
  );
  db.close();
  return result;
}

// Optimistically flips the local copy to "scanned" the instant a scan is
// accepted, so a second scan of the same ticket a few seconds later —
// still offline, before any sync — is caught locally instead of
// silently accepted twice.
export async function markCachedTicketScanned(qrCode: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(TICKETS_STORE, "readwrite");
    const store = tx.objectStore(TICKETS_STORE);
    const getReq = store.get(qrCode);
    getReq.onsuccess = () => {
      const ticket = getReq.result as CachedTicket | undefined;
      if (ticket) {
        store.put({ ...ticket, status: "scanned" });
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getCachedTicketCount(): Promise<number> {
  const db = await openDb();
  const tx = db.transaction(TICKETS_STORE, "readonly");
  const count = await promisifyRequest(tx.objectStore(TICKETS_STORE).count());
  db.close();
  return count;
}

export async function queuePendingScan(scan: PendingScan): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(PENDING_STORE, "readwrite");
  tx.objectStore(PENDING_STORE).put(scan);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getPendingScans(): Promise<PendingScan[]> {
  const db = await openDb();
  const tx = db.transaction(PENDING_STORE, "readonly");
  const result = await promisifyRequest(tx.objectStore(PENDING_STORE).getAll());
  db.close();
  return result;
}

export async function removePendingScan(id: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(PENDING_STORE, "readwrite");
  tx.objectStore(PENDING_STORE).delete(id);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
