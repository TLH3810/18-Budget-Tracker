const FILES_TO_CASH = [
    "/",
    "/db.js",
    "/index.js",
    "/index.html",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

const CACHE_NAME = 'my-site-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener("install", function (event) {
    event.waitUntil(caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CASH))
        .then(self.skipWaiting())
    );
}
);
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", function (event) {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone())
                            }
                            return response;
                        })
                        .catch(err => { return cache.match(event.request); });
                })
                .catch(err => console.log(err))
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(function() {
          return caches.match(event.request).then(function(response) {
            if (response) {
              return response;
            } else if (event.request.headers.get("accept").includes("text/html")) {
              return caches.match("/");
            }
          });
        })
      );
});