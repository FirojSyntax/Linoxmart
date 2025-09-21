import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "shopon-jgo6k",
  "appId": "1:427982446419:web:357004ec6777c92fad0ba6",
  "storageBucket": "shopon-jgo6k.firebasestorage.app",
  "apiKey": "AIzaSyCxppLumv7xoN8lbyMDvdlTKiaTIycnRPc",
  "authDomain": "shopon-jgo6k.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "427982446419"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
