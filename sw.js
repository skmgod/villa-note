// 빌라노트 서비스 워커
// 항상 인터넷의 최신 화면을 먼저 받고(업데이트가 바로 반영됨), 인터넷이 안 될 때만 저장해 둔 화면을 보여줌.
// 기록(일정·민원·청구)은 IndexedDB에 따로 있어서 여기서 건드리지 않음.
const CACHE = 'villanote-shell-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // AI·글꼴 등 외부 요청은 그대로
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
