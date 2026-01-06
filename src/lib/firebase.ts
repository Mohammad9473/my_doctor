// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  onAuthStateChanged,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_SECURE,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_SECURE,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
};
export type { UserCredential };

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Functions
const functions = getFunctions(app);

// Cloud Function to create a user document in Firestore
export const createUser = async (uid: string, isDoctor: boolean) => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      userType: isDoctor ? "doctor" : "patient",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

// Cloud Function to set user type custom claim
export const setUserTypeClaim = async (uid: string, isDoctor: boolean) => {
  const setUserType = httpsCallable(functions, "setUserType");
  try {
    await setUserType({ uid: uid, userType: isDoctor ? "doctor" : "patient" });
  } catch (error) {
    console.error("Error setting user type claim:", error);
  }
};
