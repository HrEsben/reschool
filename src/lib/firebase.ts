// Firebase configuration for ReSchool
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: ReturnType<typeof getMessaging> | null = null;

// Check if messaging is supported (browser environment)
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, messaging };

// Function to get FCM registration token
export async function getFCMToken(): Promise<string | null> {
  if (!messaging) {
    console.log('Messaging not supported or not initialized');
    return null;
  }

  try {
    // Use the existing VAPID key from your environment
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.error('VAPID key not found. Please check NEXT_PUBLIC_FIREBASE_VAPID_KEY environment variable.');
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey
    });

    if (currentToken) {
      console.log('FCM registration token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token:', err);
    return null;
  }
}

// Function to handle foreground messages
export function onMessageListener() {
  return new Promise((resolve) => {
    if (!messaging) {
      console.log('Messaging not supported');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
}

// Function to request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    console.log('Notification permission already granted');
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log('Notification permission denied');
    return false;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('Notification permission granted');
    return true;
  } else {
    console.log('Notification permission denied');
    return false;
  }
}
