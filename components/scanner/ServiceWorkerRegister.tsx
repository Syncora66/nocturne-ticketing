"use client";

import { useEffect } from "react";

// Scoped to /scanner deliberately (not the root layout) — this is an
// internal staff tool, not something the marketing site or dashboard
// should ever behave like an installable app for.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/scanner" })
      .catch(() => {
        // Offline support degrades gracefully without it — IndexedDB
        // sync still works for data, this only affects whether the app
        // shell itself loads with zero connectivity.
      });
  }, []);

  return null;
}
