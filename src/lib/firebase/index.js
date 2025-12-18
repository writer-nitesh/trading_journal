
import { initializeApp } from "firebase/app";
export const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
export const clientApp = initializeApp(JSON.parse(firebaseConfig));
