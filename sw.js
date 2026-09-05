const CACHE = 'kgj-v23';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // 强制跳过等待，立刻激活；并清理所有旧缓存，确保旧版 index.html 不会从缓存中被读到
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // 纯网络策略：永远拿最新，不读缓存；只在离线时回退
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && (e.request.url.includes('cdn.jsdelivr.net') || e.request.url.startsWith(self.location.origin))) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
