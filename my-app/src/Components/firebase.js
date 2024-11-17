import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRzPN08kzaogectB6QQMF7IsSmCxYZboY",
  authDomain: "ratillalab3-69e06.firebaseapp.com",
  projectId: "ratillalab3-69e06",
  storageBucket: "ratillalab3-69e06.firebasestorage.app",
  messagingSenderId: "495240841620",
  appId: "1:495240841620:web:f421f715211270e2be6781",
  measurementId: "G-CTZS39P9F6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore
const db = getFirestore(app);

export { db };