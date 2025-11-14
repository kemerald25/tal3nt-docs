import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESAGGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEARSUREMENT_ID,
};

function assertConfig(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(`Missing Firebase env var: ${key}`);
  }
  return value;
}

const normalizedConfig = {
  apiKey: assertConfig(firebaseConfig.apiKey, "NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: assertConfig(firebaseConfig.authDomain, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: assertConfig(firebaseConfig.projectId, "NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: assertConfig(firebaseConfig.storageBucket, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: assertConfig(
    firebaseConfig.messagingSenderId,
    "NEXT_PUBLIC_FIREBASE_MESAGGING_SENDER_ID",
  ),
  appId: assertConfig(firebaseConfig.appId, "NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: firebaseConfig.measurementId,
};

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    initializeApp(normalizedConfig);
  }
  return getApp();
}

