// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-real-estate-f1ef7.firebaseapp.com",
  projectId: "mern-real-estate-f1ef7",
  storageBucket: "mern-real-estate-f1ef7.firebasestorage.app",
  messagingSenderId: "1043992247022",
  appId: "1:1043992247022:web:53424443cb8db79e1c91ff"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);