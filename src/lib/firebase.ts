import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, User, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAAs_cXwsXR5NUKw5FHwF9kvmWqxJWxrWE", // PASTE YOUR CONFIG VALUES HERE
  authDomain: "pathpilot-e4708.firebaseapp.com",
  projectId: "pathpilot-e4708",
  storageBucket: "pathpilot-e4708.firebasestorage.app",
  messagingSenderId: "944688868667",
  appId: "1:944688868667:web:67c62418428a9652a59b1e"
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
export type { User };
