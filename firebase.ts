import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// User-provided firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDCF9-QchK4cVsQH6IwFN1ZNl3be0-lI50",
  authDomain: "shakibul-islam-ltd-server.firebaseapp.com",
  databaseURL: "https://shakibul-islam-ltd-server-default-rtdb.firebaseio.com",
  projectId: "shakibul-islam-ltd-server",
  storageBucket: "shakibul-islam-ltd-server.appspot.com",
  messagingSenderId: "896191957877",
  appId: "1:896191957877:web:5c41a87a8fbb0c14a5e13c",
  measurementId: "G-BLW3ZJVHL5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and database services
export const auth = getAuth(app);
export const db = getDatabase(app);
