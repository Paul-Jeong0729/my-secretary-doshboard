// ==========================================
// 로그인 게이트 (js/auth-gate.js)
// Firebase Auth 이메일/비밀번호 로그인
// 로그인 성공 시 'authReady' 커스텀 이벤트를 window에 발생시킴
// (schedule.js, main.js, 구역.html 스크립트가 이 이벤트를 듣고 동기화 시작)
// ==========================================
(function () {
  const overlay = document.createElement('div');
  overlay.id = 'authGateOverlay';
  overlay.className = 'auth-gate-overlay hidden';
  overlay.innerHTML = `
    <div class="auth-gate-card">
      <h2>🔐 로그인</h2>
      <input type="email" id="authEmail" placeholder="이메일" autocomplete="username" />
      <input type="password" id="authPassword" placeholder="비밀번호" autocomplete="current-password" />
      <button type="button" id="authLoginBtn">로그인</button>
      <p id="authError" class="auth-gate-error"></p>
    </div>
  `;

  const logoutBtn = document.createElement('button');
  logoutBtn.id = 'authLogoutBtn';
  logoutBtn.type = 'button';
  logoutBtn.className = 'auth-logout-btn hidden';
  logoutBtn.textContent = '로그아웃';

  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(overlay);
    document.body.appendChild(logoutBtn);
    overlay.classList.remove('hidden');

    const emailInput = overlay.querySelector('#authEmail');
    const pwInput = overlay.querySelector('#authPassword');
    const errEl = overlay.querySelector('#authError');
    const loginBtn = overlay.querySelector('#authLoginBtn');

    function login() {
      errEl.textContent = '';
      auth.signInWithEmailAndPassword(emailInput.value.trim(), pwInput.value)
        .catch(() => {
          errEl.textContent = '로그인 실패: 이메일 또는 비밀번호를 확인하세요.';
        });
    }

    loginBtn.addEventListener('click', login);
    pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
    logoutBtn.addEventListener('click', () => auth.signOut());

    auth.onAuthStateChanged((user) => {
      if (user) {
        overlay.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        window.dispatchEvent(new CustomEvent('authReady', { detail: { uid: user.uid } }));
      } else {
        overlay.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
      }
    });
  });
})();
