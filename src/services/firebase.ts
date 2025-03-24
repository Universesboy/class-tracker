import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADSGQ1rofIdM5N_gJkTSFU8v-oXeLH9rY",
  authDomain: "classes-tracker-511b4.firebaseapp.com",
  projectId: "classes-tracker-511b4",
  storageBucket: "classes-tracker-511b4.firebasestorage.app",
  messagingSenderId: "474007560016",
  appId: "1:474007560016:web:6b2787c105da7088f99655",
  measurementId: "G-P9DPQXTE2J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

export default app; 