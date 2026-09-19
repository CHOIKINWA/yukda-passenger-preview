/* 御快達乘客 App — 簡單離線殼（唔快取 API）；支援 GitHub Pages 子路徑 */
const CACHE = 'yukda-passenger-v6-mask-gray';

self.addEventListener('install', (event) => {
  const base = self.registration.scope;
  const PRECACHE = [base, base + 'index.html', base + 'manifest.webmanifest', base + 'icon.svg'];
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.includes('/api')) return;
  const base = self.registration.scope;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || caches.match(base + 'index.html') || caches.match(base))
      )
  );
});
