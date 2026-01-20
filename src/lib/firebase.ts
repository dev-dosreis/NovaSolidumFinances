import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCxngyGKzUNeW0RtLisIIsyaxnVDvUIPOA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'novasolidumsql-c7ad0.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'novasolidumsql-c7ad0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'novasolidumsql-c7ad0.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '668003904014',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:668003904014:web:a12d347bbdabd1c3426a5f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? '',
};

const hasFirebaseConfig =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.authDomain) &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.storageBucket) &&
  Boolean(firebaseConfig.messagingSenderId) &&
  Boolean(firebaseConfig.appId);

let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let firebaseAuth: ReturnType<typeof getAuth> | null = null;
let firestoreDb: ReturnType<typeof getFirestore> | null = null;
let firebaseStorage: ReturnType<typeof getStorage> | null = null;

if (hasFirebaseConfig) {
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  firestoreDb = getFirestore(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);
}

export const app = firebaseApp;
export const auth = firebaseAuth;
export const db = firestoreDb;
export const storage = firebaseStorage;
export const isFirebaseConfigured = hasFirebaseConfig;
