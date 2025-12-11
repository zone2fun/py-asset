import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
// Storage is no longer needed for Cloudinary
// import "firebase/compat/storage";

// Hardcoded configuration to ensure stability
const firebaseConfig = {
  apiKey: "AIzaSyAIN-z_SyZMIR_ZFut4aXI_s8KVF0kpS6I",
  authDomain: "phayao-assets.firebaseapp.com",
  projectId: "phayao-assets",
  // storageBucket is not needed anymore
  messagingSenderId: "762407440936",
  appId: "1:762407440936:web:9e58458972a129b7461b1d"
};

// Initialize Firebase with error handling
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } else {
    firebase.app(); // if already initialized, use that one
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Export services
export const db = firebase.firestore();
// export const storage = firebase.storage(); // Disabled

export default firebase.app();