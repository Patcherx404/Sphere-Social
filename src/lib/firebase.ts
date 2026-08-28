import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection, 
  onSnapshot,
  deleteDoc,
  updateDoc,
  writeBatch,
  Firestore
} from 'firebase/firestore';
import defaultConfig from '../../firebase-applet-config.json';

// Support both static json config and Vercel/Vite environment variables
const env = (import.meta as any).env || {};
const firebaseConfig: FirebaseOptions & { firestoreDatabaseId?: string } = {
  apiKey: env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || defaultConfig.firestoreDatabaseId
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Setup Firestore database with long-polling resilience for browser/sandbox environments
let firestoreDb: Firestore;
try {
  const dbSettings = {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true
  };
  firestoreDb = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? initializeFirestore(app, dbSettings, firebaseConfig.firestoreDatabaseId)
    : initializeFirestore(app, dbSettings);
} catch {
  firestoreDb = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = firestoreDb;

export const isVercelHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.includes('vercel.app') || host.includes('vercel.dev') || host.includes('now.sh');
};

export { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection, 
  onSnapshot,
  deleteDoc,
  updateDoc,
  writeBatch
};
export type { FirebaseUser };

