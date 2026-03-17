import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ── Înlocuiește valorile de mai jos cu ale tale din Firebase Console ──
// Project Settings → Your apps → firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyBqamJgur_nE5xjkutGvbQoX9roBVK2Nhg",
  authDomain: "panel-pr.firebaseapp.com",
  projectId: "panel-pr",
  storageBucket: "panel-pr.firebasestorage.app",
  messagingSenderId: "973750002121",
  appId: "1:973750002121:web:338a4f40e980417fc84818"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);