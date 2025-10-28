import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIi2nkAlIbl3bVulhQxI6KUGdMwunuDMM",
  authDomain: "staging-dance-up-app.firebaseapp.com",
  projectId: "staging-dance-up-app",
  storageBucket: "staging-dance-up-app.firebasestorage.app",
  messagingSenderId: "1042260177273",
  appId: "1:1042260177273:web:0168e0ad3239708fae7fa8",
  measurementId: "G-YVL8S49FGY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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

