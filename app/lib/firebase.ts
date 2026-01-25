import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxKZi_shmS0MxAvZTFffmoew0yNWtVgdk",
  authDomain: "dress-advisor-e2827.firebaseapp.com",
  projectId: "dress-advisor-e2827",
  storageBucket: "dress-advisor-e2827.firebasestorage.app",
  messagingSenderId: "199704971154",
  appId: "1:199704971154:web:bb9096fa4aa46d6b54634b",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app); // ✅ ADD THIS
