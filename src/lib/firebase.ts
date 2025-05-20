// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsY4zchDvwhT0pULEEBwFyOcyXzoEiWHk",
  authDomain: "juventude-em-governo.firebaseapp.com",
  projectId: "juventude-em-governo",
  storageBucket: "juventude-em-governo.firebasestorage.app",
  messagingSenderId: "954583701269",
  appId: "1:954583701269:web:284122516f7d68c54c3b1c",
  measurementId: "G-M49TGBGS18"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
