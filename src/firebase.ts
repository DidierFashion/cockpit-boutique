import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7kiciJR9PoW3N9VQOCBpYLiQkgeaxHsQ",
  authDomain: "cockpit-boutique-didier-22b60.firebaseapp.com",
  projectId: "cockpit-boutique-didier-22b60",
  storageBucket: "cockpit-boutique-didier-22b60.firebasestorage.app",
  messagingSenderId: "906465493382",
  appId: "1:906465493382:web:b53832b8645880c27d2c07"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);