import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Note: To receive notifications in browser/web client, you must configure a Firebase Web App.
// If config is not supplied, it will fallback to console warnings without crashing.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKeyForInitialSetup",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "freshsabjihub"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "freshsabjihub",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "freshsabjihub"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

let messaging = null;

try {
  const app = initializeApp(firebaseConfig);
  // messaging requires browser environment support (supported in HTTPS or localhost)
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn('Firebase initialization failed (likely missing config):', error);
}

export const requestForToken = async (registerEndpoint) => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });
      if (currentToken) {
        console.log('Admin FCM token obtained:', currentToken);
        // Register token with backend admin API
        const tokenVal = localStorage.getItem('admin_token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';
        await fetch(registerEndpoint || `${backendUrl}/admin/token/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(tokenVal ? { 'Authorization': `Bearer ${tokenVal}` } : {})
          },
          body: JSON.stringify({ token: currentToken }),
        });
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Permission not granted for notifications.');
    }
  } catch (err) {
    console.warn('An error occurred while retrieving token:', err);
  }
  return null;
};

export const onMessageListener = (callback) => {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};
