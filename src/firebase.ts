// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKey",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:dummy",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Authentication
import { getAuth, GoogleAuthProvider } from "firebase/auth";
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();