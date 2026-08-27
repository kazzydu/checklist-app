import {
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "./config";

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (error.code === "auth/popup-blocked") {
      await signInWithRedirect(auth, googleProvider);
    } else {
      console.error("Sign-in error:", error);
    }
    throw error;
  }
}

export async function logOut() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
