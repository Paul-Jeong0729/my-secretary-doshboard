// ==========================================
// js/birthday.js
// 구역원 생일 → 3번 테이블(오늘 일정) 달력 연동
// - Firestore 컬렉션: zoneMemberInfo (구역.html과 동일 프로젝트/컬렉션 공유)
// - 문서 형태: { name, birth: "YYYY-MM-DD", phone, address }
// ==========================================

let birthdayMap = {};        // { 'MM-DD': ['이름1', '이름2', ...] }
let birthdaySyncStarted = false;

function startBirthdaySync() {
  if (birthdaySyncStarted) return;
  birthdaySyncStarted = true;

  db.collection('zoneMemberInfo').onSnapshot(snapshot => {
    const map = {};

    snapshot.forEach(doc => {
      const data = doc.data() || {};
      const birth = (data.birth || '').trim();
      const match = birth.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return; // 생년월일이 없거나 형식이 다르면 건너뜀

      const mmdd = `${match[2]}-${match[3]}`;
      const name = data.name || doc.id;
      if (!map[mmdd]) map[mmdd] = [];
      map[mmdd].push(name);
    });

    birthdayMap = map;
    // 달력/오늘 일정 목록이 열려 있으면 새로고침할 수 있도록 이벤트 발행
    window.dispatchEvent(new Event('birthdaysUpdated'));
  }, err => {
    console.error('구역원 생일 동기화 오류:', err);
  });
}

// 'MM-DD' 형식의 날짜에 해당하는 생일자 이름 목록 반환
function getBirthdayNames(mmdd) {
  return birthdayMap[mmdd] || [];
}

// 로그인 완료(authReady) 시 동기화 시작 (다른 모듈과 동일한 패턴)
window.addEventListener('authReady', startBirthdaySync);
