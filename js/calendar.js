let currentCalDate = new Date(); // 현재 달력 기준 날짜
let selectedCalDateStr = '';

// 달력 그리기 함수
function renderCalendar() {
  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth();

  // 상단 년월 표시
  const yearMonthText = `${year}년 ${String(month + 1).padStart(2, '0')}월`;
  document.getElementById('cal-year-month').innerText = yearMonthText;

  const daysGrid = document.getElementById('cal-days-grid');
  daysGrid.innerHTML = '';

  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const prevLastDay = new Date(year, month, 0).getDate();

  const schedules = typeof loadSchedules === 'function' ? loadSchedules() : [];
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. 이전 달 날짜 표시
  for (let x = firstDayIndex; x > 0; x--) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'cal-day-cell other-month';
    dayDiv.innerText = prevLastDay - x + 1;
    daysGrid.appendChild(dayDiv);
  }

  // 2. 현재 달 날짜 표시
  for (let day = 1; day <= lastDay; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'cal-day-cell';
    dayDiv.innerText = day;

    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateKeyMMDD = `${formattedMonth}-${formattedDay}`;
    const dateKeyYYYY = `${year}-${formattedMonth}-${formattedDay}`;

    // 오늘 날짜 체크
    if (
      new Date().getFullYear() === year &&
      new Date().getMonth() === month &&
      new Date().getDate() === day
    ) {
      dayDiv.classList.add('today');
    }

    // 일정이 있는 날 체크 (MM-DD 또는 YYYY-MM-DD 대응)
    const hasEvent = schedules.some(s => s.date === dateKeyMMDD || s.date === dateKeyYYYY);

    // 🎂 구역원 생일 체크 (매년 반복되므로 MM-DD 기준으로만 대응)
    const bdayNames = (typeof getBirthdayNames === 'function') ? getBirthdayNames(dateKeyMMDD) : [];
    const hasBirthday = bdayNames.length > 0;

    if (hasEvent || hasBirthday) {
      const dot = document.createElement('div');
      dot.className = 'event-dot';
      dayDiv.appendChild(dot);
    }

    if (hasBirthday) {
      const cake = document.createElement('span');
      cake.className = 'birthday-mark';
      cake.textContent = '🎂';
      cake.title = bdayNames.map(n => n + ' 생일').join(', ');
      dayDiv.appendChild(cake);
    }

    // 📅 10일마다(10일, 20일, 30일) 음력 날짜 표시
    if (day % 10 === 0 && typeof LunarCalendar !== 'undefined') {
      const lunarText = LunarCalendar.formatLunarShort(year, month + 1, day);
      if (lunarText) {
        const lunarEl = document.createElement('span');
        lunarEl.className = 'lunar-label';
        lunarEl.textContent = lunarText;
        dayDiv.appendChild(lunarEl);
      }
    }

    // 선택된 날짜 표기
    if (selectedCalDateStr === dateKeyYYYY) {
      dayDiv.classList.add('selected');
    }

    // 날짜 클릭 이벤트
    dayDiv.addEventListener('click', () => {
      document.querySelectorAll('.cal-day-cell').forEach(c => c.classList.remove('selected'));
      dayDiv.classList.add('selected');
      selectedCalDateStr = dateKeyYYYY;
      showSchedulesForDate(dateKeyMMDD, dateKeyYYYY);
    });

    daysGrid.appendChild(dayDiv);
  }
}

// 선택 날짜 하단 일정 출력
function showSchedulesForDate(dateKeyMMDD, dateKeyYYYY) {
  const dateTitle = document.getElementById('selected-date-text');
  const listContainer = document.getElementById('selected-schedule-list');
  if (dateTitle) dateTitle.innerText = dateKeyYYYY;

  const schedules = typeof loadSchedules === 'function' ? loadSchedules() : [];
  const filtered = schedules.filter(s => s.date === dateKeyMMDD || s.date === dateKeyYYYY);
  const bdayNames = (typeof getBirthdayNames === 'function') ? getBirthdayNames(dateKeyMMDD) : [];

  listContainer.innerHTML = '';

  if (filtered.length === 0 && bdayNames.length === 0) {
    listContainer.innerHTML = '<p style="color: var(--sub-text); font-size: 0.8rem; margin:0;">해당 날짜에 등록된 일정이 없습니다.</p>';
    return;
  }

  // 🎂 생일 항목 먼저 표시
  bdayNames.forEach(name => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'holo-schedule-item birthday-item';
    itemDiv.innerHTML = `<span>🎂 ${name} 생일</span>`;
    listContainer.appendChild(itemDiv);
  });

  filtered.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'holo-schedule-item';
    itemDiv.innerHTML = `
      <span>📌 ${item.title}</span>
      <span style="color:#38bdf8;">${item.time}</span>
    `;
    listContainer.appendChild(itemDiv);
  });
}

// 모달 및 달력 이벤트 초기화
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('calendar-modal');
  const trigger = document.getElementById('calendar-trigger');
  const closeBtn = document.getElementById('cal-close');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');

  // 모달 열기
  if (trigger) {
    trigger.addEventListener('click', () => {
      modal.classList.remove('hidden');
      renderCalendar();
      // 오늘 날짜 기본 선택
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      showSchedulesForDate(`${mm}-${dd}`, `${today.getFullYear()}-${mm}-${dd}`);
    });
  }

  // 모달 닫기
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  // 이전달 / 다음달 버튼
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentCalDate.setMonth(currentCalDate.getMonth() - 1);
      renderCalendar();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentCalDate.setMonth(currentCalDate.getMonth() + 1);
      renderCalendar();
    });
  }
});

// 🎂 생일 정보가 (Firestore 실시간 동기화로) 갱신되면, 달력이 열려있는 경우 다시 그림
window.addEventListener('birthdaysUpdated', () => {
  const modal = document.getElementById('calendar-modal');
  if (modal && !modal.classList.contains('hidden')) {
    renderCalendar();
  }
});