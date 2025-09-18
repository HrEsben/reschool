// Firebase messaging service worker
// This file must be in the public folder and named exactly "firebase-messaging-sw.js"

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your Firebase configuration (same as in your main app)
const firebaseConfig = {
  apiKey: "AIzaSyCDJsTdalSqzLa5szcVAiuV9-Y0vLekLD8",
  authDomain: "reschool-3bc69.firebaseapp.com",
  projectId: "reschool-3bc69",
  storageBucket: "reschool-3bc69.firebasestorage.app",
  messagingSenderId: "651580168175",
  appId: "1:651580168175:web:ab72051995b720d169881a",
  measurementId: "G-PDRMCV4VM3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'ReSchool Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/android-chrome-192x192.png', // Your app icon
    badge: '/android-chrome-192x192.png', // Badge icon for iOS
    tag: 'reschool-notification',
    requireInteraction: true, // Keep notification visible until user interacts
    data: {
      url: payload.data?.url || '/', // URL to open when notification is clicked
      ...payload.data
    }
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Get the URL from notification data
  const urlToOpen = event.notification.data?.url || '/';

  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if a window/tab is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
