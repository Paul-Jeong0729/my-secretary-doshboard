// ==========================================
// 일정 관리 모듈 (js/schedule.js)
// ==========================================

// 기본 일정 데이터
const defaultSchedules = [
  { id: 1, date: '2026-07-20', time: '09:30 AM', title: '대전 사업소 주간 업무 보고' }
];

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
    // MM-DD 포맷 변환 (선택 사항)
    const displayDate = item.date.length > 5 ? item.date.slice(5) : item.date;

    const div = document.createElement('div');
    div.className = 'schedule-item';
    div.innerHTML = `
      <div class="schedule-info">
        <span class="schedule-meta">${displayDate} &nbsp; ${item.time}</span>
        <span class="schedule-title">${item.title}</span>
      </div>
      <button class="btn-delete" onclick="deleteSchedule(${item.id})">삭제</button>
    `;
    listContainer.appendChild(div);
  });
}

// 일정 삭제
function deleteSchedule(id) {
  if (!confirm("이 일정을 삭제하시겠습니까?")) return;
  
  let schedules = loadSchedules();
  schedules = schedules.filter(item => item.id !== id);
  saveSchedules(schedules);
  renderSchedules();
}

// 모달 열기
function openScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // 오늘 날짜 기본값 세팅
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('schedDate');
    if (dateInput) dateInput.value = today;
  }
}

// 모달 닫기
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
  
  // 목록 리렌더링 및 모달 닫기
  renderSchedules();
  closeScheduleModal();

  // 🔊 [비서 브리핑 & 음성 & 이미지 변경 연동]
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
});