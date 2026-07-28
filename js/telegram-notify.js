// ==========================================
// 텔레그램 알림 공통 모듈 (js/telegram-notify.js)
// 모든 페이지(구역.html, 전도.html, 심방.html, 활동.html 등)에서
// <script src="telegram-notify.js"></script> 로 불러와 사용합니다.
// ==========================================

// ⚠️ 봇 토큰과 채팅방 ID
// (내부 관리자용 페이지이므로 우선 여기 직접 넣어 사용합니다.
//  나중에 필요하면 서버(Vercel API Route)로 옮겨 더 안전하게 관리할 수 있어요.)
const TELEGRAM_BOT_TOKEN = '8664636038:AAF-FAX5ChZQ0Z_OidVKzh7yECcyV8kGV24';
const TELEGRAM_CHAT_ID = '117746488';

/**
 * 텔레그램으로 메시지를 보냅니다.
 * @param {string} message - 보낼 텍스트 (여러 줄 가능)
 */
function sendTelegramNotify(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  }).catch(err => {
    // 알림 실패는 앱 동작(저장 등)에 영향 주지 않도록 콘솔에만 기록
    console.error('텔레그램 알림 전송 실패:', err);
  });
}

/**
 * 공통 포맷으로 알림 메시지를 만들어 보냅니다.
 * @param {string} category - 예: '전도', '구역', '심방', '활동'
 * @param {string} action - 예: '입력', '수정', '삭제', '단계향상'
 * @param {string} stageLabel - 예: '찾기', '섭외자' 등 (없으면 생략 가능)
 * @param {string} name - 대상 이름
 * @param {string} extra - 추가로 붙일 한 줄 설명 (선택)
 */
function notifyRecordChange(category, action, stageLabel, name, extra) {
  let lines = [`📋 <b>${category}</b> - ${action}`];
  if (stageLabel) lines.push(`단계: ${stageLabel}`);
  if (name) lines.push(`이름: ${name}`);
  if (extra) lines.push(extra);
  sendTelegramNotify(lines.join('\n'));
}