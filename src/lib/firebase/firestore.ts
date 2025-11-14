import { getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "./app";

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

