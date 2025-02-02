import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIp3JuFTxKLq6wxbeAaTIWDm81ljEnsiI",
  authDomain: "twitter-clone-udemy-f0438.firebaseapp.com",
  projectId: "twitter-clone-udemy-f0438",
  storageBucket: "twitter-clone-udemy-f0438.firebasestorage.app",
  messagingSenderId: "79109684700",
  appId: "1:79109684700:web:dee9275146502f6d87a319",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
