// ==========================================
// Firebase 설정 (js/firebase-config.js)
// my-secretary-1df10 프로젝트 값 적용 완료
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBVXo5NYSyumJxYFFE2hrIaTEJiHIyq8P0",
  authDomain: "my-secretary-1df10.firebaseapp.com",
  projectId: "my-secretary-1df10",
  storageBucket: "my-secretary-1df10.firebasestorage.app",
  messagingSenderId: "165274759452",
  appId: "1:165274759452:web:bbfa7de28a08f8e11b4ad9"
};

firebase.initializeApp(firebaseConfig);

// 전역에서 사용할 auth / db 객체
const auth = firebase.auth();
const db = firebase.firestore();