// firebase-messaging-sw.js - Required for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Config object template - messagingSenderId is the essential part for background FCM
const firebaseConfig = {
  apiKey: "AIzaSyAD9kTVzFn0m1wZR7VxidzVKWtaP0VqhZg",
  authDomain: "vegpik-40a13.firebaseapp.com",
  projectId: "vegpik-40a13",
  storageBucket: "vegpik-40a13.firebasestorage.app",
  messagingSenderId: "913055328706",
  appId: "1:913055328706:web:dcc7d5314835cac23cce5b",
  measurementId: "G-GNN3YCG2F8"
};

const seenOrderIds = new Set();

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  const orderId = payload.data?.orderId;

  // De-duplicate multiple identical notifications (e.g. from multiple development tokens)
  if (orderId) {
    if (seenOrderIds.has(orderId)) {
      console.log(`De-duplicated background message for order: ${orderId}`);
      return;
    }
    seenOrderIds.add(orderId);
    if (seenOrderIds.size > 50) {
      const firstVal = seenOrderIds.values().next().value;
      seenOrderIds.delete(firstVal);
    }
  }

  const notificationTitle = payload.notification?.title || 'New Order';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  // Notify all open client tabs to update their React states in the background
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'fcm-background-message',
        payload: payload
      });
    });
  });
});

// Handle notification click to focus the existing tab or open a new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
