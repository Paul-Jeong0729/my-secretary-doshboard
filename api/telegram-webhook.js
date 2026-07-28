// ==========================================
// /api/telegram-webhook.js
// 텔레그램에서 온 명령어(/구역, /전도, /심방, /활동)를 받아
// Firestore 데이터를 조회한 뒤 텔레그램으로 답장하는 서버 함수
// ==========================================
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// 명령어 -> 조회할 컬렉션 목록
const COMMANDS = {
  '/구역': {
    label: '구역',
    collections: [{ name: '구역', col: 'orgChart' }],
  },
  '/전도': {
    label: '전도',
    collections: [
      { name: '찾기', col: 'evangelism_find' },
      { name: '섭외자', col: 'evangelism_recruit' },
      { name: '세미나', col: 'evangelism_seminar' },
      { name: '센타 수강', col: 'evangelism_center_class' },
      { name: '센타 등록', col: 'evangelism_center_register' },
    ],
  },
  '/심방': {
    label: '심방',
    collections: [
      { name: '수요 결석', col: 'visit_wed_absence' },
      { name: '주일 결석', col: 'visit_sun_absence' },
      { name: '사랑방', col: 'visit_sarangbang' },
      { name: '심방 기록', col: 'visit_record' },
    ],
  },
  '/활동': {
    label: '활동',
    collections: [
      { name: '기타 활동', col: 'activity_other' },
      { name: '송촌 활동', col: 'activity_songchon' },
    ],
  },
};

async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
    }),
  });
}

// 컬렉션 하나의 최근 데이터를 텍스트로 정리 (최대 limit개)
async function fetchCollectionSummary(col, limit = 10) {
  let snap;
  try {
    snap = await db.collection(col).orderBy('createdAt', 'desc').limit(limit).get();
  } catch (e) {
    // createdAt 필드가 없는 문서가 섞여 있으면 정렬 없이 재시도
    snap = await db.collection(col).limit(limit).get();
  }
  if (snap.empty) return '  (데이터 없음)';
  return snap.docs
    .map((doc) => {
      const d = doc.data();
      const label = d.name || d.title || '(이름없음)';
      const extra = d.phone ? ` / ${d.phone}` : '';
      return `  • ${label}${extra}`;
    })
    .join('\n');
}

module.exports = async (req, res) => {
  // 텔레그램은 POST로 메시지를 보내줌
  if (req.method !== 'POST') {
    res.status(200).send('OK');
    return;
  }

  try {
    const body = req.body || {};
    const message = body.message;
    const text = message && message.text ? message.text.trim() : '';

    if (!text) {
      res.status(200).json({ ok: true });
      return;
    }

    const command = COMMANDS[text];

    if (!command) {
      if (text === '/start' || text === '/help') {
        await sendTelegram('사용 가능한 명령어:\n/구역\n/전도\n/심방\n/활동');
      }
      res.status(200).json({ ok: true });
      return;
    }

    let reply = `📋 <b>${command.label}</b> 최근 데이터\n\n`;
    for (const c of command.collections) {
      reply += `<b>${c.name}</b>\n`;
      reply += await fetchCollectionSummary(c.col);
      reply += '\n\n';
    }

    await sendTelegram(reply.trim());
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telegram-webhook error:', err);
    // 텔레그램은 어떤 경우든 200을 기대하므로 에러여도 200 응답
    res.status(200).json({ ok: true });
  }
};
