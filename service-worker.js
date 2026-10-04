// 升級至 v5.6，使用已上傳至 GitHub 本地的 kaiu.ttf (cwTeX Q 楷體)
const CACHE_NAME = 'speed-report-v5.6';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './kaiu.ttf'
];

// 1. 安裝階段：強制立即跳過等待 (skipWaiting)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 建立 v5.6 快取並預載本地 kaiu.ttf');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 2. 啟用階段：刪除舊版快取
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

// 3. 攔截請求：採用「網路優先 (Network First)」策略，失敗時讀取離線快取
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
