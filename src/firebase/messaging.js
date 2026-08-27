import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./config";

let messaging = null;

try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("FCM not available:", e.message);
}

// Register service worker for mobile notifications
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', reg.scope);
      return reg;
    } catch (e) {
      console.warn('Service Worker registration failed:', e);
      return null;
    }
  }
  return null;
}

export async function requestNotificationPermission() {
  // iOS Safari doesn't support Notification API directly
  if (!('Notification' in window)) {
    console.warn('Notifications not supported on this device');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Register service worker first (needed for mobile)
      await registerServiceWorker();

      if (messaging) {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });
        return token;
      }
      return 'granted';
    }
    return null;
  } catch (e) {
    console.warn("Notification permission error:", e);
    return null;
  }
}

export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}

// Local notification fallback for mobile (no FCM needed)
export function showLocalNotification(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    // Use service worker for mobile compatibility
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          vibrate: [200, 100, 200],
        });
      });
    } else {
      new Notification(title, { body });
    }
  }
}
