import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration from environment variables
// Fallback to hardcoded staging values if env vars aren't loaded
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDIi2nkAlIbl3bVulhQxI6KUGdMwunuDMM',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'staging-dance-up-app.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'staging-dance-up-app',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'staging-dance-up-app.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1042260177273',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1042260177273:web:0168e0ad3239708fae7fa8',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-YVL8S49FGY'
};

// Validate that we have Firebase config values (either from env or fallback)
function validateFirebaseConfig() {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase config fields:', missingFields);
    return false;
  }
  
  // Log if using fallback values
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn(
      '⚠️  Using fallback Firebase configuration values (env vars not loaded).\n' +
      'Please restart your Next.js dev server to load .env.local file properly.\n' +
      'The app will work with fallback values for now.'
    );
  }
  
  return true;
}

// Initialize Firebase
let app: FirebaseApp;
if (validateFirebaseConfig()) {
  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = existingApps[0];
  }
} else {
  // This shouldn't happen with fallback values, but handle it gracefully
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export { analytics };
export default app;

