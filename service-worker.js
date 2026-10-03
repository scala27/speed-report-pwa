// 1. 每次更新版號，務必同步修改快取名稱
const CACHE_NAME = 'speed-report-v4.6';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './kaiu.ttf'
];

// 2. 安裝時立即跳過等待 (skipWaiting)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 3. 啟用時自動比對並清除非本版的舊快取 (例如 v2.8)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('刪除舊版 PWA 快取:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 4. 攔截請求：優先使用網路最新資源 (Network First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
