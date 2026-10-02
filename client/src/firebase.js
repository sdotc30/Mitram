import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJxklyupDYQ4C4rTXIlQuxit2_8TQLcBg",
  authDomain: "mitram-e067d.firebaseapp.com",
  projectId: "mitram-e067d",
  storageBucket: "mitram-e067d.firebasestorage.app",
  messagingSenderId: "474736437647",
  appId: "1:474736437647:web:ec99b4dc866c4ce38d03fa",
  measurementId: "G-MVNL9T9S5R",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const loginAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const registerWithEmail = async (email, password, fullName = "") => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName && result.user) {
      await updateProfile(result.user, { displayName: fullName });
    }
    return { user: result.user, error: null };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
