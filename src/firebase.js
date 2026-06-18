// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAA5Q2AzYkJCdHaDbTVG0cdy4xh0l9u6Gc",
  authDomain: "virtualtracking-1.firebaseapp.com",
  databaseURL: "https://virtualtracking-1-default-rtdb.firebaseio.com",
  projectId: "virtualtracking-1",
  storageBucket: "virtualtracking-1.firebasestorage.app",
  messagingSenderId: "896037877406",
  appId: "1:896037877406:web:b8e110ff4510e6d6d26d8f"
};

    const app = initializeApp(firebaseConfig);
    console.log("firebase intialization successfull")
    export const db = getDatabase(app);


