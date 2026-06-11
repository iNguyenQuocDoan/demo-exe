import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? "",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? "",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? "",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? "",
};

let app: FirebaseApp | undefined;
let auth: Auth = null as any;
let db: Firestore = null as any;

const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_firebase_api_key" && 
  !firebaseConfig.apiKey.startsWith("your-");

if (isConfigValid) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else {
  if (typeof window !== "undefined") {
    console.warn("Cấu hình Firebase (chat) bị thiếu hoặc không hợp lệ. Vui lòng thiết lập biến môi trường trong file .env để sử dụng tính năng chat.");
  }
}

export { app, auth, db };
export default app;
