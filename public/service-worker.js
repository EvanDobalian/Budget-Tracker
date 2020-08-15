const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/style.css",
    "/db.js",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", evt => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", evt => {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key != CACHE_NAME && key != DATA_CACHE_NAME)
                    return caches.delete(key);
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", evt => {
    if(evt.request.url.includes("/api/")) {
        evt.respondwith(
            caches.open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(evt.request)
                .then(result => {
                    if(result.status === 200) cache.put(evt.request.url, result.clone());
                    return result;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            })
            .catch(err => console.log(err))
        );
        return;
    }
    evt.respondwith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(result => {
                return result || fetch(evt.reqauest);
            });
        })
    );
});