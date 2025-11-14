"use client";

import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirebaseApp } from "./app";

export function getFirebaseAuth() {
  const auth = getAuth(getFirebaseApp());
  void setPersistence(auth, browserLocalPersistence);
  return auth;
}

