
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * 🛠️ CONFIGURATION UPDATED:
 * Your project credentials have been applied.
 * Ensure your Firestore rules are set to 'allow read, write: if true;' 
 * in the Firebase Console to enable data saving.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBKSs-7wv8TEUdEdDWjm6MPc9QRuu9gq90",
  authDomain: "estateai-dc09f.firebaseapp.com",
  projectId: "estateai-dc09f",
  storageBucket: "estateai-dc09f.firebasestorage.app",
  messagingSenderId: "787324573632",
  appId: "1:787324573632:web:8cf41cb402640d38129a25",
  measurementId: "G-Z3BETK7KH2"
};

// Config is now valid as placeholders are removed
export const isConfigured = firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_KEY" && 
                           firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
                           firebaseConfig.projectId !== "estateai-dc09f_placeholder"; 

let db: any = null;
let connectionStatus: 'connected' | 'error' | 'unconfigured' = 'unconfigured';
let connectionError: string | null = null;

if (isConfigured) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    connectionStatus = 'connected';
  } catch (error: any) {
    connectionStatus = 'error';
    connectionError = error.message || "Failed to initialize Firebase";
    console.error("Firebase Init Error:", error);
  }
} else {
  connectionStatus = 'unconfigured';
  connectionError = "Please update services/firebase.ts with your own API keys from the Firebase Console.";
}

export { db, connectionStatus, connectionError };
