// firebase-messaging-sw.js - Required for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Config object template - messagingSenderId is the essential part for background FCM
const firebaseConfig = {
  apiKey: "AIzaSyCqprvSeciykqKnLAKzaGCbX2IW-5JXNVc",
  authDomain: "freshsabjihub.firebaseapp.com",
  projectId: "freshsabjihub",
  storageBucket: "freshsabjihub.firebasestorage.app",
  messagingSenderId: "945901560169",
  appId: "1:945901560169:web:45b59ffbd70eec37551df8",
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
