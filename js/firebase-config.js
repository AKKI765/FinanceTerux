// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "Enter Your Own apiKey",
  authDomain: "Enter Your Own authDomain",
  projectId: "Enter Your Own projectId",
  storageBucket: "Enter Your Own storageBucket",
  messagingSenderId: "Enter Your Own messagingSenderId ",
  appId: "Enter Your Own appId"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Setup Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);


