import { db, collection, addDoc, getDocs, query, orderBy } from './firebase.js';

let scheduleData = {}; // Firebase DB에서 불러온 일정이 저장될 객체
let currentCalendarDate = new Date(); // 현재 달력 조회 기준 날짜

window.onload = async function() {
    changeSecretaryImageByDay();
    startLiveClock();
    
    // 1. Firebase DB에서 기존 일정 데이터 불러오기
    await loadSchedulesFromDB();
    
    speakText("데이터베이스 연동이 완료되었습니다, 사랑하는 사장님!");
};

// -------------------------------------------------------------
// 🔥 Firebase DB에서 일정 불러오기
// -------------------------------------------------------------
async function loadSchedulesFromDB() {
    scheduleData = {}; // 초기화
    const container = document.getElementById('schedule-container');
    container.innerHTML = ''; // 기존 HTML 목록 초기화

    try {
        const q = query(collection(db, "schedules"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const dateVal = data.date; // YYYY-MM-DD
            
            if (!scheduleData[dateVal]) {
                scheduleData[dateVal] = [];
            }
            scheduleData[dateVal].push({ time: data.time, text: data.text });

            // 화면 대시보드 리스트에 표시
            renderScheduleItem(dateVal, data.time, data.text);
        });
    } catch (error) {
        console.error("데이터베이스 불러오기 실패:", error);
    }
}

// 대시보드에 일정 아이템 렌더링 헬퍼
function renderScheduleItem(dateVal, displayTime, textVal) {
    const container = document.getElementById('schedule-container');
    const dateParts = dateVal.split('-');
    const displayDate = dateParts.length === 3 ? `${dateParts[1]}-${dateParts[2]}` : dateVal;

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
}

// -------------------------------------------------------------
// 🔥 Firebase DB에 일정 저장하기
// -------------------------------------------------------------
async function submitSchedule() {
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

    // 시간 포맷 변환 (AM/PM)
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

    try {
        // Firebase Firestore 'schedules' 컬렉션에 데이터 추가
        await addDoc(collection(db, "schedules"), {
            date: dateVal,
            time: displayTime,
            text: textVal,
            createdAt: new Date().toISOString()
        });

        // 로컬 데이터 메모리 업데이트
        if (!scheduleData[dateVal]) {
            scheduleData[dateVal] = [];
        }
        scheduleData[dateVal].push({ time: displayTime, text: textVal });

        // 화면 리스트에 바로 반영
        renderScheduleItem(dateVal, displayTime, textVal);

        const dateParts = dateVal.split('-');
        const speechBriefing = `${dateParts[1]}월 ${dateParts[2]}일, ${displayTime} 일정을 데이터베이스에 저장했습니다, 사랑하는 사장님!`;
        
        document.getElementById('secretary-message').innerHTML = `
            💬 <strong>비서 브리핑:</strong><br>"${dateParts[1]}월 ${dateParts[2]}일 [${textVal}] 일정을 성공적으로 저장했습니다, 사랑하는 사장님!"
        `;

        speakText(speechBriefing);
        document.getElementById('modalText').value = '';
        closeScheduleModal();
        
        // 달력이 열려 있다면 갱신
        if (document.getElementById('calendarModal').classList.contains('active')) {
            renderCalendar();
        }

    } catch (error) {
        console.error("Firebase 저장 에러:", error);
        alert("데이터베이스 저장 중 오류가 발생했습니다.");
    }
}

// window 전역 함수 등록 (HTML onclick 이벤트에서 호출 가능하도록)
window.openScheduleModal = openScheduleModal;
window.closeScheduleModal = closeScheduleModal;
window.submitSchedule = submitSchedule;
window.openCalendarModal = openCalendarModal;
window.closeCalendarModal = closeCalendarModal;
window.moveMonth = moveMonth;

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