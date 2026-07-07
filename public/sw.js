const CACHE_NAME = "mamawh-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline assets...");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event Caching Strategies
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Exclude non-GET requests and internal Next.js hot-reload requests (webpack-hmr)
  if (event.request.method !== "GET" || url.pathname.includes("_next/webpack-hmr")) {
    return;
  }

  // 1. NETWORK-FIRST STRATEGY: Job post feeds, detail pages, and public landing
  const isJobListingPage = url.pathname === "/" || url.pathname.startsWith("/jobs/") || url.pathname.startsWith("/api/jobs");
  if (isJobListingPage) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh listings feed
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. STALE-WHILE-REVALIDATE STRATEGY: Employer dashboard and management components
  const isDashboardPage = url.pathname.startsWith("/dashboard");
  if (isDashboardPage) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Ignore background fetch failures offline
          });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. CACHE-FIRST STRATEGY: Static bundles, styles, assets, fonts, icons, manifest
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname === "/manifest.json";

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // DEFAULT STRATEGY: Fallback network first, then cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
