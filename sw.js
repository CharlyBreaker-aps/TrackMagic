const CACHE = 'charly-tracker-v59';
const FILES = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Navigation requests (opening the app / clicking a notification) and the app shell:
  // network-first, falling back to a cached copy of index.html so the app always loads.
  const isNav = e.request.mode === 'navigate';
  if (isNav || url.pathname.endsWith('.html') || url.pathname.endsWith('sw.js')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() =>
        caches.match(e.request).then(cached =>
          cached || caches.match('./index.html') || caches.match('./')
        )
      )
    );
  } else {
    e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
  }
});

// ── FIREBASE MESSAGING ──
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCx0n_27nCPQmEkOkf69HEyu8fCZo5soH4",
  authDomain: "trackmagic-27a67.firebaseapp.com",
  projectId: "trackmagic-27a67",
  storageBucket: "trackmagic-27a67.firebasestorage.app",
  messagingSenderId: "1043841248434",
  appId: "1:1043841248434:web:8d6d2338e62c507341edab"
});

const messaging = firebase.messaging();

// Data-only messages — title/body come from payload.data, not payload.notification
// This prevents Firebase from auto-displaying AND our handler displaying = no duplicates
messaging.onBackgroundMessage(payload => {
  const title = payload.data?.title || payload.notification?.title || 'MagicTracker';
  const body  = payload.data?.body  || payload.notification?.body  || '';
  const tag   = payload.data?.tag   || 'magictracker';
  self.registration.showNotification(title, {
    body,
    icon: self.registration.scope + 'icons/icon-192.png',
    badge: self.registration.scope + 'icons/icon-192.png',
    tag,
    renotify: false,
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const scope = self.registration.scope;
  // Open index.html explicitly (matches manifest start_url) — opening the bare
  // scope directory can 404 on some hosts / Android, which is the reported bug.
  const dataUrl = e.notification.data && e.notification.data.url;
  const target = dataUrl ? new URL(dataUrl, scope).href : scope + 'index.html';
  e.waitUntil(clients.matchAll({type:'window', includeUncontrolled: true}).then(list => {
    for (const c of list) {
      if (c.url.startsWith(scope) && 'focus' in c) return c.focus();
    }
    return clients.openWindow(target);
  }));
});
