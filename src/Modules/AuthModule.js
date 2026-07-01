import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

const ensureAuth = () => {
  if (!auth) {
    throw new Error("Firebase authentication is not initialized. Check your .env configuration.");
  }
  return auth;
};

export const initAuthListener = (onUserChange) => {
  if (!auth) {
    onUserChange(null);
    return () => {};
  }
  return onAuthStateChanged(auth, onUserChange);
};

export const signIn = async (email, password) => {
  return await signInWithEmailAndPassword(ensureAuth(), email, password);
};

export const signUp = async (email, password) => {
  return await createUserWithEmailAndPassword(ensureAuth(), email, password);
};

export const signOut = async () => {
  return await firebaseSignOut(ensureAuth());
};

export const getCurrentUser = () => auth?.currentUser ?? null;
