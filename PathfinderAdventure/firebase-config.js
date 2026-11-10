import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBywuCpnQgG96T1q61ogRRxAz_-HMjiQig",
  authDomain: "pathfinder-adventure-b2a80.firebaseapp.com",
  projectId: "pathfinder-adventure-b2a80",
  storageBucket: "pathfinder-adventure-b2a80.firebasestorage.app",
  messagingSenderId: "222324264879",
  appId: "1:222324264879:web:d0c47654e623a96c59295a",
  measurementId: "G-P3HJB9X87D"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);