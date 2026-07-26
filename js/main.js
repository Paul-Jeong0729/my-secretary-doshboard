window.addEventListener('DOMContentLoaded', () => {
  const memoTextarea = document.getElementById('quick-memo');
  const sendBtn = document.getElementById('btn-send-memo');

  // Firestore에서 빠른 메모 내용 불러오기
  function loadQuickMemo() {
    db.collection('dashboard').doc('quickMemo').get().then(docSnap => {
      if (memoTextarea && docSnap.exists) {
        memoTextarea.value = docSnap.data().text || '';
      }
    }).catch(err => console.error('메모 불러오기 오류:', err));
  }

  // Firestore에 빠른 메모 내용 저장
  function saveQuickMemo(text) {
    db.collection('dashboard').doc('quickMemo').set({ text: text })
      .catch(err => console.error('메모 저장 오류:', err));
  }

  if (memoTextarea) {
    memoTextarea.addEventListener('input', (e) => {
      saveQuickMemo(e.target.value);
    });

    memoTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (typeof addMemoSchedule === 'function') {
          addMemoSchedule(memoTextarea.value);
        }
        memoTextarea.value = '';
        saveQuickMemo('');
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
      saveQuickMemo('');
    });
  }

  // 로그인 완료(authReady) 후 저장된 메모 불러오기
  window.addEventListener('authReady', loadQuickMemo);
});
