window.addEventListener('DOMContentLoaded', () => {
  renderSchedules();

  const memoTextarea = document.getElementById('quick-memo');
  const sendBtn = document.getElementById('btn-send-memo');

  if (memoTextarea) {
    memoTextarea.value = localStorage.getItem('quick_memo') || '';
    memoTextarea.addEventListener('input', (e) => {
      localStorage.setItem('quick_memo', e.target.value);
    });

    memoTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (typeof addMemoSchedule === 'function') {
          addMemoSchedule(memoTextarea.value);
        }
        memoTextarea.value = '';
        localStorage.removeItem('quick_memo');
      }
    });
  }

  // 📝 전달 버튼 클릭 시에도 동일하게 3번 테이블로 전송
  if (sendBtn && memoTextarea) {
    sendBtn.addEventListener('click', () => {
      if (typeof addMemoSchedule === 'function') {
        addMemoSchedule(memoTextarea.value);
      }
      memoTextarea.value = '';
      localStorage.removeItem('quick_memo');
    });
  }
});