const FILES_TO_CASH= [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener("install", function(event){
    event.waitUntil(caches.open(CACHE_NAME)
    .then(function(cache){
        return cache.addAll (FILES_TO_CASH);
    }));
}
);

self.addEventListener("fetch", function(event){
    if (event.request.url.includes("/api/")){
        event.respondWith(
            caches.open(DATA_CACHE_NAME)
            .then(cache =>{
                return fetch(event.request)
                .then(responce => {
                    if (responce.status === 200){
                        cache.put(event.request.url, responce.clone())
                    }
                    return responce;
                })
                .catch(err =>{return cache.match(event.request);});
            })
            .catch(err => console.log(err))
        );
        return;
    }
})