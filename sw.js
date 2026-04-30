const CACHE = 'charly-tracker-v52';
const FILES = ['./manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Network-first for HTML and SW — always get latest version
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('sw.js') || url.pathname === '/' || url.pathname.endsWith('/charly-tracker/')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first for icons, manifests, images
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

messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'MagicTracker', {
    body: body || '',
    icon: icon || './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: payload.data?.tag || 'magictracker',
    renotify: true,
    data: payload.data || {}
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list => {
    for (const c of list) {
      if (c.url.includes('github.io') && 'focus' in c) return c.focus();
    }
    return clients.openWindow('https://charlybreaker-aps.github.io/charly-tracker/');
  }));
});
