// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxH4BiVk9PXvvrFlZRK13wGoMLkCmA6kU",
  authDomain: "doctolibguinee.firebaseapp.com",
  projectId: "doctolibguinee",
  storageBucket: "doctolibguinee.firebasestorage.app",
  messagingSenderId: "234122357962",
  appId: "1:234122357962:web:04e312df99918937825833"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export Firestore
export const db = getFirestore(app);
// 🔥 TRÈS IMPORTANT (c'est ça qui manque)
export const auth = getAuth(app);
// Stockage de fichiers (documents patients, pièces jointes)
export const storage = getStorage(app);