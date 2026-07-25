window.addEventListener('DOMContentLoaded', () => {
  // 일정 목록 불러오기
  renderSchedules();

  // 일정 추가 버튼 이벤트 연결
  const addBtn = document.getElementById('btn-add-schedule');
  if (addBtn) {
    addBtn.addEventListener('click', addSchedule);
  }

  // 메모 자동 저장 (localStorage)
  const memoTextarea = document.getElementById('quick-memo');
  if (memoTextarea) {
    memoTextarea.value = localStorage.getItem('quick_memo') || '';
    memoTextarea.addEventListener('input', (e) => {
      localStorage.setItem('quick_memo', e.target.value);
    });
  }
});