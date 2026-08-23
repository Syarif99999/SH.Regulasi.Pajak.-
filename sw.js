// sw.js — Service Worker sederhana supaya aplikasi bisa dibuka offline
// setelah pertama kali dimuat. Cache "app-shell" hanya berisi halaman utama;
// data regulasi tetap tersimpan di localStorage browser, bukan di sini.

const CACHE_NAME = 'regulasi-pajak-paser-v2';
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
  // Network-first untuk library CDN (xlsx, jsPDF) supaya selalu dapat versi terbaru saat online;
  // fallback ke cache saat offline. Untuk file aplikasi sendiri, cache-first.
  const url = event.request.url;
  const isCDN = url.includes('cdnjs.cloudflare.com');

  if (isCDN) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
