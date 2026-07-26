// ==========================================
// Firebase 설정 (js/firebase-config.js)
// 아래 값을 Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱(웹)에서
// 복사한 값으로 반드시 교체하세요.
// ==========================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

// 전역에서 사용할 auth / db 객체
const auth = firebase.auth();
const db = firebase.firestore();
