// ==========================================
// 수석 비서 모듈 (js/secretary.js)
// ==========================================

// 1. 요일별 이미지 파일 매핑
const dayImages = {
  0: 'images/sun.jpg', // 일요일
  1: 'images/mon.jpg', // 월요일
  2: 'images/tue.jpg', // 화요일
  3: 'images/wen.jpg', // 수요일
  4: 'images/thu.jpg', // 목요일
  5: 'images/fri.jpg', // 금요일
  6: 'images/sat.jpg'  // 토요일
};

// 현재 설정된 요일별 이미지 경로 저장용 변수
let currentDailyImgSrc = 'images/mon.jpg';

/**
 * 요일별 비서 이미지 자동 설정
 */
function setDailySecretaryImage() {
  const today = new Date().getDay();
  const imgElement = document.getElementById('secretary-img');
  
  if (imgElement) {
    // 해당 요일 이미지 지정 (없을 경우 mon.jpg 기본)
    currentDailyImgSrc = dayImages[today] || 'images/mon.jpg';
    imgElement.src = currentDailyImgSrc;
    
    imgElement.onerror = () => {
      imgElement.alt = "이미지를 images/ 폴더에 넣고 새로고침 해주세요";
    };
  }
}

/**
 * 한국어 여성 음성(TTS)을 우선적으로 찾아 설정하는 함수
 */
function getKoreanFemaleVoice() {
  if (!('speechSynthesis' in window)) return null;
  
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => v.lang.includes('ko') && 
    (v.name.includes('SunHi') || v.name.includes('Yuna') || v.name.includes('Female') || v.name.includes('Google') || v.name.includes('Heami'))
  ) || voices.find(v => v.lang.includes('ko')) || null;
}

/**
 * [기본] 브리핑 문구 업데이트 + TTS 읽어주기 (음성 뱃지 표시 안 함)
 */
function speakBriefing(message) {
  const briefingElement = document.getElementById('briefing-text');

  if (briefingElement && message) {
    briefingElement.innerText = message;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // 이전 음성 중단

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0; 
    utterance.pitch = 1.1; 

    const femaleVoice = getKoreanFemaleVoice();
    if (femaleVoice) utterance.voice = femaleVoice;

    window.speechSynthesis.speak(utterance);
  }
}

/**
 * 📢 [새 일정 추가 연동] 
 * 1. 브리핑 영역 텍스트 변경
 * 2. 지정된 여자 음성 낭독
 * 3. 낭독 중 images/음성.jpg 변경 후 종료 시 요일별 원래 이미지로 복구 (음성 뱃지는 표시 안 함)
 */
function announceNewSchedule(date, time, title) {
  const briefingElement = document.getElementById('briefing-text');
  const imgElement = document.getElementById('secretary-img');

  // 1. 비서 브리핑 문구 업데이트
  if (briefingElement) {
    briefingElement.innerHTML = `<strong>[${date}] [${time}] [${title}]</strong><br>새로운 일정이 추가되었습니다. 사랑하는 사장님!`;
  }

  // 2. TTS 음성 낭독 처리
  const speechText = "새로운 일정이 추가되었습니다. 사랑하는 사장님";

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // 이전 음성 중단

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    const femaleVoice = getKoreanFemaleVoice();
    if (femaleVoice) utterance.voice = femaleVoice;

    // 이미지 원복 함수
    const resetSecretaryStatus = () => {
      if (imgElement) {
        imgElement.src = currentDailyImgSrc; // 요일별 원래 이미지로 복구
      }
    };

    // 음성 시작 시 : images/음성.jpg 로 변경만 수행
    utterance.onstart = () => {
      if (imgElement) {
        imgElement.src = 'images/음성.jpg';
      }
    };

    // 음성 종료 및 에러 발생 시 원래 이미지로 복구
    utterance.onend = resetSecretaryStatus;
    utterance.onerror = resetSecretaryStatus;

    window.speechSynthesis.speak(utterance);
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  setDailySecretaryImage();

  if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      getKoreanFemaleVoice();
    };
  }
});
