
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * ⚠️ REPLACE THIS CONFIG:
 * Copy this from your Firebase Console > Project Settings > General > Your Apps (Web App)
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

// Check if project ID is still the default demo one
export const isUsingPlaceholder = firebaseConfig.projectId === "estateai-dc09f";

let db: any = null;
let connectionStatus: 'connected' | 'error' | 'local' = 'local';
let connectionError: string | null = null;

try {
  if (firebaseConfig.apiKey && !isUsingPlaceholder) {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    connectionStatus = 'connected';
  } else if (isUsingPlaceholder) {
    connectionStatus = 'local';
    connectionError = "Application is in Demo Mode. Please update the Config in services/firebase.ts.";
  }
} catch (error: any) {
  connectionStatus = 'error';
  connectionError = error.message || "Failed to initialize Firebase";
  console.error("Firebase Init Error:", error);
}

export { db, connectionStatus, connectionError };
