// 기본 일정 데이터 관리 객체
let scheduleData = {
    "2026-07-20": [
        { time: "09:30 AM", text: "대전 사업소 주간 업무 보고" }
    ]
};

let currentCalendarDate = new Date(); // 현재 달력 조회 기준 날짜

window.onload = function() {
    changeSecretaryImageByDay();
    startLiveClock();
    speakText("새로운 일정을 홀로그램 입력 창에 등록해 보세요, 사랑하는 사장님!");
};

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.lang === 'ko-KR' && voice.name.includes('Google'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        const imgTag = document.getElementById('secretary-img');
        let originalSrc = '';

        utterance.onstart = function() {
            if (imgTag) {
                originalSrc = imgTag.src;
                imgTag.src = '음성.jpg';
            }
        };

        utterance.onend = function() {
            if (imgTag && originalSrc) {
                imgTag.src = originalSrc;
            }
        };

        utterance.onerror = function() {
            if (imgTag && originalSrc) {
                imgTag.src = originalSrc;
            }
        };

        window.speechSynthesis.speak(utterance);
    }
}

function changeSecretaryImageByDay() {
    const today = new Date();
    const dayOfWeek = today.getDay(); 

    const imagesByDay = {
        0: 'sun.jpg', 
        1: 'mon1.jpg', 
        2: 'tue.jpg', 
        3: 'wen.jpg', 
        4: 'thu.jpg', 
        5: 'fri.jpg', 
        6: 'sat.jpg' 
    };

    const imgTag = document.getElementById('secretary-img');
    if (imgTag && imagesByDay[dayOfWeek]) {
        imgTag.src = imagesByDay[dayOfWeek];
    }
}

function startLiveClock() {
    const clockEl = document.getElementById('clock');
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    function updateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const day = dayNames[now.getDay()];

        clockEl.innerText = `${year}.${month}.${date} (${day}) `;
    }

    updateTime();
    setInterval(updateTime, 1000);
}

function openScheduleModal() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    
    document.getElementById('modalDate').value = `${year}-${month}-${date}`;
    document.getElementById('scheduleModal').classList.add('active');
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
}

function submitSchedule() {
    const dateVal = document.getElementById('modalDate').value; 
    const timeVal = document.getElementById('modalTime').value;
    const textVal = document.getElementById('modalText').value;

    if (!dateVal) {
        alert("날짜를 선택해 주세요, 사랑하는 사장님!");
        return;
    }
    if (!textVal) {
        alert("일정 내용을 입력해 주세요, 사랑하는 사장님!");
        return;
    }

    let displayTime = timeVal;
    const timeParts = timeVal.split(':');
    if (timeParts.length === 2) {
        let hour = parseInt(timeParts[0]);
        const min = timeParts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; 
        displayTime = `${String(hour).padStart(2, '0')}:${min} ${ampm}`;
    }

    if (!scheduleData[dateVal]) {
        scheduleData[dateVal] = [];
    }
    scheduleData[dateVal].push({ time: displayTime, text: textVal });

    const dateParts = dateVal.split('-');
    const displayDate = dateParts.length === 3 ? `${dateParts[1]}-${dateParts[2]}` : dateVal;

    const container = document.getElementById('schedule-container');
    const newItem = document.createElement('div');
    newItem.className = 'schedule-item';
    newItem.style.borderLeftColor = '#f59e0b';
    
    newItem.innerHTML = `
        <div>
            <span class="schedule-date-badge">${displayDate}</span>
            <div class="schedule-time" style="color:#f59e0b;">${displayTime}</div>
            <div class="schedule-text">${textVal}</div>
        </div>
    `;
    container.appendChild(newItem);

    const speechBriefing = `${dateParts[1]}월 ${dateParts[2]}일, ${displayTime} 일정을 성공적으로 저장했습니다, 사랑하는 사장님!`;
    
    document.getElementById('secretary-message').innerHTML = `
        💬 <strong>비서 브리핑:</strong><br>"${dateParts[1]}월 ${dateParts[2]}일 [${textVal}] 일정을 성공적으로 저장했습니다, 사랑하는 사장님!"
    `;

    speakText(speechBriefing);
    document.getElementById('modalText').value = '';
    closeScheduleModal();
    
    if (document.getElementById('calendarModal').classList.contains('active')) {
        renderCalendar();
    }
}

/* 🔵 달력 조회 Modal 비즈니스 로직 */
function openCalendarModal() {
    currentCalendarDate = new Date();
    document.getElementById('calendarModal').classList.add('active');
    renderCalendar();
    
    const todayStr = formatDateToString(new Date());
    selectCalendarDate(todayStr);
}

function closeCalendarModal() {
    document.getElementById('calendarModal').classList.remove('active');
}

function moveMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    renderCalendar();
}

function formatDateToString(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    document.getElementById('calendarTitle').innerText = `${year}.${String(month + 1).padStart(2, '0')}`;

    const gridContainer = document.getElementById('calendarGrid');
    gridContainer.innerHTML = '';

    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
    dayLabels.forEach(label => {
        const headerCell = document.createElement('div');
        headerCell.className = 'cal-day-header';
        headerCell.innerText = label;
        if(label === '일') headerCell.style.color = '#ef4444';
        if(label === '토') headerCell.style.color = '#3b82f6';
        gridContainer.appendChild(headerCell);
    });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-cell empty';
        gridContainer.appendChild(emptyCell);
    }

    const todayStr = formatDateToString(new Date());
    for (let day = 1; day <= lastDate; day++) {
        const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const dayCell = document.createElement('div');
        dayCell.className = 'cal-cell';
        dayCell.innerText = day;
        dayCell.setAttribute('data-date', cellDateStr);

        if (cellDateStr === todayStr) {
            dayCell.classList.add('today');
        }

        if (scheduleData[cellDateStr] && scheduleData[cellDateStr].length > 0) {
            dayCell.classList.add('has-event');
        }

        dayCell.onclick = function() {
            document.querySelectorAll('.cal-cell.selected').forEach(el => el.classList.remove('selected'));
            dayCell.classList.add('selected');
            selectCalendarDate(cellDateStr);
        };

        gridContainer.appendChild(dayCell);
    }
}

function selectCalendarDate(dateStr) {
    const parts = dateStr.split('-');
    document.getElementById('memoDateTitle').innerText = `🌐 [${parts[0]}년 ${parts[1]}월 ${parts[2]}일] 메모 분석 결과`;

    const contentContainer = document.getElementById('memoContent');
    contentContainer.innerHTML = '';

    const events = scheduleData[dateStr];
    if (events && events.length > 0) {
        events.forEach(item => {
            const memoRow = document.createElement('div');
            memoRow.className = 'memo-item';
            memoRow.innerHTML = `
                <span style="color: #f59e0b; font-weight: bold; min-width: 70px;">[${item.time}]</span>
                <span>${item.text}</span>
            `;
            contentContainer.appendChild(memoRow);
        });
    } else {
        contentContainer.innerHTML = `<div class="memo-empty">등록된 일정이나 보관된 시스템 메모가 없습니다.</div>`;
    }
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function() {
        window.speechSynthesis.getVoices();
    };
}