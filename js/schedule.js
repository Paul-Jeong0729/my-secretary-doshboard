// ==========================================
// 일정 관리 모듈 (js/schedule.js)
// ==========================================

// 기본 일정 데이터
const defaultSchedules = [
  { id: 1, date: '2026-07-20', time: '09:30 AM', title: '대전 사업소 주간 업무 보고' }
];

// 삭제 대기 중인 id 임시 저장
let pendingDeleteId = null;

// LocalStorage 로드/저장 키 통일 ('my_schedules')
function loadSchedules() {
  const saved = localStorage.getItem('my_schedules');
  return saved ? JSON.parse(saved) : defaultSchedules;
}

function saveSchedules(schedules) {
  localStorage.setItem('my_schedules', JSON.stringify(schedules));
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
      <button class="btn-delete" onclick="deleteSchedule(${item.id})">삭제</button>
    `;
    listContainer.appendChild(div);
  });
}

// 4번 테이블 '빠른 메모' 입력값을 3번 테이블(오늘 일정) 맨 하단에 초록색 항목으로 추가
function addMemoSchedule(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const schedules = loadSchedules();
  schedules.push({
    id: Date.now(),
    date: dateStr,
    time: timeStr,
    title: trimmed,
    type: 'memo'
  });
  saveSchedules(schedules);
  renderSchedules();
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

  let schedules = loadSchedules();
  schedules = schedules.filter(item => item.id !== pendingDeleteId);
  saveSchedules(schedules);
  renderSchedules();

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

  const schedules = loadSchedules();
  const newSchedule = {
    id: Date.now(),
    date: dateVal,
    time: timeVal,
    title: taskVal
  };

  schedules.push(newSchedule);
  saveSchedules(schedules);

  renderSchedules();
  closeScheduleModal();

  if (typeof announceNewSchedule === 'function') {
    announceNewSchedule(dateVal, timeVal, taskVal);
  }
}

// 이벤트 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 일정 목록 초기 렌더링
  renderSchedules();

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