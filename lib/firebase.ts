import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCkEngaQa16c_dv7_sZao-vyel5FgUlEvo",
  authDomain: "denlowba.firebaseapp.com",
  projectId: "denlowba",
  storageBucket: "denlowba.firebasestorage.app",
  messagingSenderId: "378799900950",
  appId: "1:378799900950:web:bc77eca6c0114fb306e837",
  measurementId: "G-L527NV19HJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
