// Minimal hand-written service worker for the /scanner PWA — no
// build-time asset manifest, so it can't precache exact hashed chunk
// filenames. Instead: precache the small, stable shell (the route
// itself + PWA assets) on install, then opportunistically cache
// everything else (the hashed _next/static chunks) the first time it's
// actually requested, runtime-cache-style. That's enough for "open the
// app with no signal" to work once it's been opened online at least once.

const CACHE_NAME = "tick8t-scanner-v1";
const SHELL_URLS = ["/scanner", "/manifest.json", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never intercept API calls — the scanner's own sync logic already
  // handles offline (queueing in IndexedDB) and needs to see real
  // network failures, not a cached response standing in for one.
  if (request.method !== "GET" || request.url.includes("/api/")) {
    return;
  }

  const isNavigation = request.mode === "navigate";

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      if (isNavigation) {
        // Network-first for the page itself: always show the latest
        // deployed version when online, only fall back to the cached
        // shell when the network request actually fails.
        try {
          const response = await fetch(request);
          cache.put(request, response.clone());
          return response;
        } catch {
          const cached = await cache.match(request);
          return cached ?? cache.match("/scanner");
        }
      }

      // Static assets (JS/CSS chunks, fonts, icons): cache-first, and
      // cache whatever wasn't already there — cheap and safe since
      // Next.js content-hashes these filenames, so a cached entry is
      // never stale for the build that requested it.
      const cached = await cache.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch {
        return cached ?? Response.error();
      }
    })(),
  );
});
