import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase 콘솔에서 복사하신 설정값
const firebaseConfig = {
  apiKey: "사장님의_apiKey",
  authDomain: "사장님의_authDomain",
  projectId: "사장님의_projectId",
  storageBucket: "사장님의_storageBucket",
  messagingSenderId: "사장님의_messagingSenderId",
  appId: "사장님의_appId"
};

// 초기화 및 DB 내보내기
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
