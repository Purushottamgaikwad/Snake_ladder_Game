import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig={
  apiKey: "AIzaSyDeWNizLPYrG0lU_t9yUrT8YIL5uBeG-ic",
  authDomain: "snake-ladder-game-c1a00.firebaseapp.com",
  projectId: "snake-ladder-game-c1a00",
  storageBucket: "snake-ladder-game-c1a00.firebasestorage.app",
  messagingSenderId: "975008611396",
  appId: "1:975008611396:web:2c1462de2a4d1efb059011"
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

signInAnonymously(auth);

