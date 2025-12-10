import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";

// Hardcoded configuration to ensure stability
// This prevents "White Screen" errors if .env files are not loaded correctly
const firebaseConfig = {
  apiKey: "AIzaSyAIN-z_SyZMIR_ZFut4aXI_s8KVF0kpS6I",
  authDomain: "phayao-assets.firebaseapp.com",
  projectId: "phayao-assets",
  storageBucket: "phayao-assets.firebasestorage.app",
  messagingSenderId: "762407440936",
  appId: "1:762407440936:web:9e58458972a129b7461b1d"
};

// Initialize Firebase with error handling
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Export services
export const db = firebase.firestore();
export const storage = firebase.storage();

export default firebase.app();