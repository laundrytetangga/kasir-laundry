// Service worker Kasir Laundry Tetangga
// - Halaman utama: SELALU ambil dari jaringan dulu (agar update langsung terpakai), cadangan dari cache jika offline.
// - Gambar/ikon: dari cache. Panggilan ke Google Apps Script tidak pernah di-cache.
// Jika logo atau ikon diganti, naikkan angka versi di bawah ini.
const V = 'kasir-v1';
const ASET = ['./', './index.html', './manifest.json', './logo.png', './logo_print.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASET)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;            // Google Apps Script, Telegram, dll: biarkan langsung
  if (r.mode === 'navigate' || u.pathname.endsWith('/index.html') || u.pathname.endsWith('/')) {
    e.respondWith(
      fetch(u.href, { cache: 'no-store' })
        .then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('./index.html', cp)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(r).then(h => h || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
});
