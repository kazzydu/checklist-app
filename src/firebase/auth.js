import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
      return;
    }
    throw error;
  }
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error("Redirect result error:", error);
    throw error;
  }
}

export async function logOut() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getAuthErrorMessage(error) {
  const code = error?.code || "";
  const messages = {
    "auth/popup-blocked": "Popup was blocked. Please allow popups for this site.",
    "auth/popup-closed-by-user": "Sign-in cancelled. You closed the popup.",
    "auth/cancelled-popup-request": "Sign-in cancelled. Please try again.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/unauthorized-domain": "This domain is not authorized. Contact support.",
    "auth/operation-not-allowed": "Google sign-in is not enabled. Contact support.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/user-disabled": "This account has been disabled.",
  };
  return messages[code] || `Sign-in failed: ${error.message || "Unknown error"}`;
}
