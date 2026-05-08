import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyCWvQx2KlrzzhoCqHB4VpQLVvUgR-OSb-w",
  authDomain: "runnertime-ef63a.firebaseapp.com",
  projectId: "runnertime-ef63a",
  storageBucket: "runnertime-ef63a.firebasestorage.app",
  messagingSenderId: "263171615528",
  appId: "1:263171615528:web:41225eacb37335cbeefe1d",
  measurementId: "G-83DXS2XRZL"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);