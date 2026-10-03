// 每次版本更新時，務必同步修改快取名稱 (如：v4.6)
const CACHE_NAME = 'speed-report-v4.6';

// 需要快取的靜態資源清單
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
      console.log('[Service Worker] 建立新快取:', CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 2. 啟用階段：刪除所有非 v4.6 的舊版快取 (例如 v2.8)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] 強制清除舊快取:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] 新版已取得控制權');
      return self.clients.claim();
    })
  );
});

// 3. 攔截請求：採用「網路優先 (Network First)」策略
// 確保優先向伺服器取得最新版本，失敗時才讀取離線快取
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 若成功抓到網路最新檔案，同步更新快取
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 離線時才使用本地快取
        return caches.match(event.request);
      })
  );
});
