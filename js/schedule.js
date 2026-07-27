// ==========================================
// 일정 관리 모듈 (js/schedule.js)
// Firebase Firestore 실시간 동기화 버전
// ==========================================

let currentSchedules = [];
let scheduleSyncStarted = false;

// 삭제 대기 중인 문서 id 임시 저장
let pendingDeleteId = null;

// Firestore 실시간 동기화 시작 (로그인 완료 후 1회 호출)
function startScheduleSync() {
  if (scheduleSyncStarted) return;
  scheduleSyncStarted = true;

  db.collection('schedules').orderBy('createdAt', 'asc')
    .onSnapshot(snapshot => {
      currentSchedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      cleanupExpiredSchedules(currentSchedules);
      renderSchedules();
    }, err => {
      console.error('일정 동기화 오류:', err);
    });
}

// 오늘보다 이전 날짜인 "일반 일정"만 Firestore에서 자동 삭제 (메모는 제외)
function cleanupExpiredSchedules(schedules) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  schedules.forEach(item => {
    if (item.type === 'memo') return; // 메모는 항상 보존
    if (item.date && item.date < todayStr) {
      db.collection('schedules').doc(item.id).delete()
        .catch(err => console.error('만료 일정 자동 삭제 오류:', err));
    }
  });
}

// calendar.js 등에서 동기적으로 참조하는 용도로 유지 (실시간 캐시 반환)
function loadSchedules() {
  return currentSchedules;
}

// 대시보드 메인 목록 렌더링
function renderSchedules() {
  const schedules = loadSchedules();
  const listContainer = document.getElementById('schedule-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  if (schedules.length === 0) {
    listContainer.innerHTML = '<p style="color: #94a3b8; font-size: 0.85rem;">일정이 없습니다.</p>';
    return;
  }

  schedules.forEach((item) => {
    const isMemo = item.type === 'memo';
    const displayDate = item.date.length > 5 ? item.date.slice(5) : item.date;

    const div = document.createElement('div');
    div.className = isMemo ? 'schedule-item memo-item' : 'schedule-item';

    const metaHtml = isMemo
      ? ''
      : `<span class="schedule-meta">${displayDate} &nbsp; ${item.time}</span>`;

    div.innerHTML = `
      <div class="schedule-info">
        ${metaHtml}
        <span class="schedule-title">${item.title}</span>
      </div>
      <button class="btn-delete" onclick="deleteSchedule('${item.id}')">삭제</button>
    `;
    listContainer.appendChild(div);
  });
}

// 4번 테이블 '빠른 메모' 입력값을 Firestore에 추가 (초록색 항목)
function addMemoSchedule(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  db.collection('schedules').add({
    date: dateStr,
    time: timeStr,
    title: trimmed,
    type: 'memo',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(err => console.error('메모 저장 오류:', err));
}

// 일정 삭제 (커스텀 모달로 확인)
function deleteSchedule(id) {
  pendingDeleteId = id;
  const modal = document.getElementById('deleteConfirmModal');
  if (modal) modal.classList.remove('hidden');
}

// 실제 삭제 처리 (삭제 확인 모달 - 삭제 버튼 클릭 시)
function executeDeleteSchedule() {
  if (pendingDeleteId === null) return;

  db.collection('schedules').doc(pendingDeleteId).delete()
    .catch(err => console.error('삭제 오류:', err));

  pendingDeleteId = null;
  const modal = document.getElementById('deleteConfirmModal');
  if (modal) modal.classList.add('hidden');
}

// 삭제 취소 (삭제 확인 모달 - 취소 버튼 클릭 시)
function cancelDeleteSchedule() {
  pendingDeleteId = null;
  const modal = document.getElementById('deleteConfirmModal');
  if (modal) modal.classList.add('hidden');
}

// 일정 추가 모달 열기
function openScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  if (modal) {
    modal.classList.remove('hidden');

    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('schedDate');
    if (dateInput) dateInput.value = today;
  }
}

// 일정 추가 모달 닫기
function closeScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  if (modal) {
    modal.classList.add('hidden');
    const form = document.getElementById('scheduleForm');
    if (form) form.reset();
  }
}

// 폼 제출 (모달에서 일정 추가 버튼 클릭 시)
function handleScheduleSubmit(event) {
  event.preventDefault();

  const dateVal = document.getElementById('schedDate').value;
  const timeVal = document.getElementById('schedTime').value;
  const taskVal = document.getElementById('schedTask').value;

  if (!dateVal || !timeVal || !taskVal) return;

  db.collection('schedules').add({
    date: dateVal,
    time: timeVal,
    title: taskVal,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    closeScheduleModal();
    if (typeof announceNewSchedule === 'function') {
      announceNewSchedule(dateVal, timeVal, taskVal);
    }
  }).catch(err => console.error('일정 저장 오류:', err));
}

// 이벤트 초기화
document.addEventListener('DOMContentLoaded', () => {
  // [일정 추가] 버튼 이벤트 바인딩
  const addBtn = document.getElementById('btn-add-schedule');
  if (addBtn) {
    addBtn.addEventListener('click', openScheduleModal);
  }

  // 삭제 확인 모달 버튼 바인딩
  const deleteYesBtn = document.getElementById('deleteConfirmYes');
  const deleteNoBtn = document.getElementById('deleteConfirmNo');
  if (deleteYesBtn) deleteYesBtn.addEventListener('click', executeDeleteSchedule);
  if (deleteNoBtn) deleteNoBtn.addEventListener('click', cancelDeleteSchedule);
});

// 로그인 완료(authReady) 시 Firestore 실시간 동기화 시작
window.addEventListener('authReady', startScheduleSync);