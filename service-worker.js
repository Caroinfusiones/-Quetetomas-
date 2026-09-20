const CACHE_NAME = "que-te-tomas-v3";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];
 
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});
 
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});
 
/* Network-first para index.html: siempre intenta traer la versión más nueva del servidor primero,
   y solo usa la copia guardada si no hay conexión. Así versiones futuras se actualizan solas,
   sin depender de que alguien recuerde subir este archivo también. */
self.addEventListener("fetch", (event) => {
  if(event.request.mode === 'navigate' || event.request.url.endsWith('index.html')){
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
 

