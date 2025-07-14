// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cmu-bulletin.firebaseapp.com",
  databaseURL: "https://cmu-bulletin-default-rtdb.firebaseio.com",
  projectId: "cmu-bulletin",
  storageBucket: "cmu-bulletin.appspot.com",
  messagingSenderId: "1086828565436",
  appId: "1:1086828565436:web:e5f8f8f8f8f8f8f8f8f8f8",
  measurementId: "G-MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
