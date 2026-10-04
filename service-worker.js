// 升級至 v6.2，快取 wra-report.html 並為未來 moea-report.html 預留架構
const CACHE_NAME = 'speed-report-v6.2';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './wra-report.html',
  './manifest.json',
  './kaiu.ttf'
];

// 1. 安裝階段：強制跳過等待 (skipWaiting)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 建立 v6.2 快取並預載所有離線資源');
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

// 3. 攔截請求：採用「網路優先 (Network First)」策略，離線時讀取快取
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
