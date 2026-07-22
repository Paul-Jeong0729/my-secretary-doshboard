import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVXo5NYSyumJxYFFE2hrIaTEJiHIyq8P0",
  authDomain: "my-secretary-1df10.firebaseapp.com",
  projectId: "my-secretary-1df10",
  storageBucket: "my-secretary-1df10.firebasestorage.app",
  messagingSenderId: "165274759452",
  appId: "1:165274759452:web:bbfa7de28a08f8e11b4ad9"
};


// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore(DB) 인스턴스 내보내기
export const db = getFirestore(app);