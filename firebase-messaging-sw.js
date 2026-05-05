importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC7mJFpwlR_CqbNqsT9KuXUOv3w5y3EVOI",
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
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: payload.data?.tag || 'magictracker',
  });
});
