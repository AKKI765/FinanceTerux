// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCorLoNCuocFm7y3si5GM_TkhKFOWDd--U",
  authDomain: "personalfinancetracker-63375.firebaseapp.com",
  projectId: "personalfinancetracker-63375",
  storageBucket: "personalfinancetracker-63375.firebasestorage.app",
  messagingSenderId: "54384542328",
  appId: "1:54384542328:web:7ea963db527e2b870ca38d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Setup Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);


