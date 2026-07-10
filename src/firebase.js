import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWvQx2KlrzzhoCqHB4VpQLVvUgR-OSb-w",
  authDomain: "runnertime-ef63a.firebaseapp.com",
  projectId: "runnertime-ef63a",
  storageBucket: "runnertime-ef63a.firebasestorage.app",
  messagingSenderId: "263171615528",
  appId: "1:263171615528:web:41225eacb37335cbeefe1d",
  measurementId: "G-83DXS2XRZL"
};

const requiredConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];
const firebaseConfigValid = requiredConfig.every(Boolean);

if (!firebaseConfigValid) {
  console.error(
    "Firebase configuration is incomplete. Please add VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID to your .env file."
  );
}

let firebaseApp = null;
let firebaseInitError = "";
try {
  if (firebaseConfigValid) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseInitError =
      "Firebase configuration is incomplete. Add VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID to your .env file.";
  }
} catch (error) {
  firebaseInitError = `Firebase initialization failed: ${error.message}`;
  console.error("Firebase initialization failed:", error);
}

export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseEnabled = Boolean(firebaseApp);
export const firebaseInitErrorMessage = firebaseInitError;


console.log(firebaseConfig);