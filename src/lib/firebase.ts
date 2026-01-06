// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type UserCredential,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_SECURE,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_SECURE,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (prevent re-init in Next.js)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// IMPORTANT: match your deployed functions region
const functions = getFunctions(app, "us-central1");

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
};
export type { UserCredential };

// Firestore user doc creator (client-side)
export const createUser = async (uid: string, isDoctor: boolean) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    userType: isDoctor ? "doctor" : "patient",
    createdAt: serverTimestamp(),
  });
};

// Callable function (no CORS issues)
export const setUserTypeClaim = async (uid: string, isDoctor: boolean) => {
  const setUserType = httpsCallable(functions, "setUserType");
  await setUserType({ uid, userType: isDoctor ? "doctor" : "patient" });
};
