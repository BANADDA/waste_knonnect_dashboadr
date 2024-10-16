import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyARwhMYd5nbkTSOmy3s5B0kjU4QPG_THPU",
  authDomain: "waste-connect-8664a.firebaseapp.com",
  projectId: "waste-connect-8664a",
  storageBucket: "waste-connect-8664a.appspot.com",
  messagingSenderId: "131096865990",
  appId: "1:131096865990:web:6f5a7b64670bfba3c4fbc7",
  measurementId: "G-RZSK93JQ20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore, Auth, and Storage
export const db = getFirestore(app);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Initialize and export Firebase Storage
