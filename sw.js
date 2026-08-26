// sw.js — Service Worker sederhana supaya aplikasi bisa dibuka offline
// setelah pertama kali dimuat. Cache "app-shell" hanya berisi halaman utama;
// data regulasi tetap tersimpan di localStorage browser, bukan di sini.

const CACHE_NAME = 'regulasi-pajak-paser-v3';
const APP_SHELL = [
  './regulasi-pajak-paser.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first untuk SEMUA file (halaman utama, manifest, CDN):
  // selalu coba ambil versi terbaru dari server dulu setiap kali online,
  // supaya update SEED_DATA/kode baru langsung kepakai tanpa nyangkut di
  // cache lama. Cache hanya dipakai sebagai fallback saat offline.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
