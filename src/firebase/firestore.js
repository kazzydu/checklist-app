import { db } from "./config";
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export function subscribeToUserData(userId, callback) {
  const ref = doc(db, "users", userId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback(null);
    }
  });
}

export async function saveUserData(userId, data) {
  const ref = doc(db, "users", userId);
  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
