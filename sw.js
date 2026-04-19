const CACHE = 'charly-tracker-v43';
const FILES = ['./index.html', './manifest.json'];

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
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html'))));
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

// Handle background push notifications
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

// Handle notification click — open the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list => {
    for (const c of list) {
      if (c.url.includes('github.io') && 'focus' in c) return c.focus();
    }
    return clients.openWindow('https://charlybreaker-aps.github.io/charly-tracker/');
  }));
});
