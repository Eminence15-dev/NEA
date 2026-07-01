import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWvQx2KlrzzhoCqHB4VpQLVUgR-OSb-w",
  authDomain: "runnertime-ef63a.firebaseapp.com",
  projectId: "runnertime-ef63a",
  storageBucket: "runnertime-ef63a.firebasestorage.app",
  messagingSenderId: "263171615528",
  appId: "1:263171615528:web:41225eacb37335cbeefe1d",
  measurementId: "G-83DXS2XRZL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
