// 升級快取版本，確保手機自動刷新載入 kaiu.woff
const CACHE_NAME = 'speed-report-v5.4';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './kaiu.woff'
];

// 1. 安裝階段：立即跳過等待 (skipWaiting)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 建立 v5.4 新快取');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 2. 啟用階段：清除所有舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] 清除舊快取:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 請求攔截：網路優先 (Network First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
