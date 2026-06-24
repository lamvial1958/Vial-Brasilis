import { getApps, initializeApp, type FirebaseOptions, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize in browser — prevents auth/invalid-api-key during SSR/prerender
const isBrowser = typeof window !== "undefined";
const _app: FirebaseApp | null = isBrowser
  ? (getApps()[0] ?? initializeApp(firebaseConfig))
  : null;

export const firebaseApp = _app as FirebaseApp;
export const auth = (isBrowser ? getAuth(_app!) : null) as Auth;
export const db = (isBrowser ? getFirestore(_app!) : null) as Firestore;
export const storage = (isBrowser ? getStorage(_app!) : null) as FirebaseStorage;
