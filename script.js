/* ============================================================
   🎂 НАСТОЯЩИЙ МИРАС? — ходилка по школьному коридору
   Идёшь по коридору (стрелки/WASD), 7 учеников задают вопросы
   про Мираса (ПРОБЕЛ — заговорить).
   Мимо ученика не пройти: перед ним невидимая стена, пока не
   ответишь ему. После ЛЮБОГО ответа он отходит и пропускает
   дальше; ошибка стоит 10 HP (всего 20 HP = 2 ошибки).
   За ВЕРНЫЙ ответ выдаётся пиксельное сердце (7 цветов, как
   души в Undertale). Торт с песней — только при всех 7 сердцах:
   если просто дойти до конца коридора с ошибками, покажется
   простой экран «вы прошли игру» без поздравления.
   Ответ — на боевом экране в стиле Undertale: белый бокс
   с вопросом, жёлтая HP-полоска и 4 кнопки-команды с иконками
   (выбранная — жёлтая, остальные оранжевые).
   HP = 0 → «YOU AR DA IMPOSTA» → кровь → скример.
   Прошёл всех → комната с тортом (как в Portal): свеча гаснет,
   экран заливает «HAPPY BIRTHDAY» + песня Happy Birthday.
   ✏️  Всё для ручной замены — в блоке «РЕДАКТИРУЙ ЗДЕСЬ» ниже
   ============================================================ */

/* ==================== ✏️ РЕДАКТИРУЙ ЗДЕСЬ ==================== */

// Картинка скримера:
//   '' — встроенная пиксельная рожа-плейсхолдер
//   или путь к своему файлу, например 'scary.jpg' (рядом с index.html)
const SCREAM_IMAGE = "";

// Звук крика:
//   '' — синтезированный крик через Web Audio (работает без файлов)
//   или путь к своему файлу, например 'scream.mp3'
const SCREAM_AUDIO = "";

// Вопросы учеников (один ученик — один вопрос, всего 7).
//   text    — текст вопроса (появляется в диалоговом боксе)
//   options — 4 варианта ответа (4 командные кнопки)
//   correct — индекс правильного варианта (0 = первый, 1 = второй, ...)
const QUESTIONS = [
  {
    text: "этажи?",
    options: ["это жи", "67", "пробка", "4 шага"],
    correct: 0,
  },
  {
    text: "кто дал тебе эту карту?",
    options: [
      "житель продал",
      "пираты карибского моря",
      "твоя мама",
      "магическая шляпа",
    ],
    correct: 0,
  },
  {
    text: "откуда правильно начинать решать задачи? ",
    options: ["с начала", "с конца", "сначала четные", "сначала нечетные"],
    correct: 1,
  },
  {
    text: "как зовут лучшую апайку по био?",
    options: [
      "Каным Кыдырбаевна",
      "Каным Куттыбаевна",
      "Айдын Куттыбаевна",
      "Ерасыл Ержанулы",
    ],
    correct: 1,
  },
  {
    text: "учитель обьясняет теорему пифогора твои действия",
    options: [
      "слушать учителя",
      "выйти из класса",
      "пошутить про катят",
      "украть шутку друга про гипотенузу",
    ],
    correct: 3,
  },
  {
    text: "I love you ...",
    options: ["6000", "2000", "3000", "1000"],
    correct: 2,
  },
  {
    text: "As a Child I yearned for the ",
    options: ["love", "money", "mines", "candy"],
    correct: 2,
  },
];

/* ================= КОНЕЦ БЛОКА «РЕДАКТИРУЙ ЗДЕСЬ» ============ */

/* ===================== Константы игры ======================= */

const MAX_HP = 20;
const DMG = 10; // урон за ошибку
const WORLD_W = 2600; // длина коридора
const VIEW_W = 240,
  VIEW_H = 160;

// Спрайт-лист героя: сетка 4×4 по 64px.
// Раскладка определена по самому листу:
//   столбец 0 — вид спереди (идём на зрителя)
//   столбец 1 — вид со спины (идём от зрителя)
//   столбец 2 — профиль ВПРАВО (строки: 0 стойка, 1–2 шаг)
// Влево герой идёт тем же профилем, отражённым зеркально (flip).
const SHEET_URL =
  "references/pixellab-teenager-in-school-uniform-tuc-1790161208527.png";
const SHEET = {
  cell: 64,
  drawSize: 44, // размер героя на экране (px канваса)
  dirs: {
    down: { col: 0, stand: 0, walk: [0, 1], flip: false },
    up: { col: 1, stand: 0, walk: [1, 2], flip: false },
    right: { col: 2, stand: 0, walk: [1, 2], flip: false },
    left: { col: 2, stand: 0, walk: [1, 2], flip: true },
  },
};

// Позиции учеников по коридору (школа длинная — 7 собеседников)
const NPC_X = [300, 532, 764, 996, 1228, 1460, 1692, 1924, 2156, 2388];

/* ---------- DOM ---------- */

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const portalScreen = document.getElementById("portal-screen");
const impostorScreen = document.getElementById("impostor-screen");
const screamScreen = document.getElementById("scream-screen");
const startBtn = document.getElementById("start-btn");
const retryBtn = document.getElementById("retry-btn");
const stageEl = document.getElementById("stage");
const canvas = document.getElementById("game");
const fcanvas = document.getElementById("finale");
const hpFill = document.getElementById("hp-fill");
const hpLabel = document.getElementById("hp-label");
const battleEl = document.getElementById("battle");
const battleText = document.getElementById("battle-text");
const battleChoices = document.getElementById("battle-choices");
const battleEnemy = document.getElementById("battle-enemy");
const battleHpFill = document.getElementById("battle-hp-fill");
const battleHpLabel = document.getElementById("battle-hp-label");
const keyHint = document.getElementById("key-hint");
const hbText = document.getElementById("hb-text");
const finaleUi = document.getElementById("finale-ui");
const bloodStreams = document.getElementById("blood-streams");
const bloodDrops = document.getElementById("blood-drops");
const heartsRow = document.getElementById("hearts-row");
const surviveScreen = document.getElementById("survive-screen");
const screamFace = document.getElementById("scream-face");
const metaLine = document.getElementById("meta-line");

const ctx = canvas.getContext("2d");
const fctx = fcanvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
fctx.imageSmoothingEnabled = false;

/* ---------- Встроенная рожа для скримера ---------- */

const SCREAM_FACE_DATA =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">' +
      '<rect width="16" height="16" fill="#050505"/>' +
      '<rect x="3" y="1" width="10" height="14" fill="#E8E0C9"/>' +
      '<rect x="4" y="4" width="3" height="3" fill="#000000"/>' +
      '<rect x="9" y="4" width="3" height="3" fill="#000000"/>' +
      '<rect x="5" y="5" width="1" height="1" fill="#FF1A1A"/>' +
      '<rect x="10" y="5" width="1" height="1" fill="#FF1A1A"/>' +
      '<rect x="5" y="7" width="1" height="3" fill="#A80F0F"/>' +
      '<rect x="10" y="7" width="1" height="4" fill="#A80F0F"/>' +
      '<rect x="7" y="8" width="2" height="1" fill="#000000"/>' +
      '<rect x="4" y="10" width="8" height="4" fill="#000000"/>' +
      '<rect x="5" y="10" width="1" height="2" fill="#FFFFFF"/>' +
      '<rect x="7" y="10" width="1" height="2" fill="#FFFFFF"/>' +
      '<rect x="9" y="10" width="1" height="2" fill="#FFFFFF"/>' +
      '<rect x="6" y="13" width="1" height="1" fill="#FFFFFF"/>' +
      '<rect x="8" y="13" width="1" height="1" fill="#FFFFFF"/>' +
      "</svg>",
  );

/* ============================ Звук =========================== */

let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      /* звук недоступен — не страшно */
    }
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

// Короткий бип (выбор, подтверждение)
function blip(freq = 620, dur = 0.05, type = "square", vol = 0.07) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start(t);
  o.stop(t + dur);
}

// Верный ответ: восходящий мажорный ход
function playRight() {
  if (!audioCtx) return;
  [
    [523, 0],
    [659, 0.09],
    [784, 0.18],
  ].forEach(([f, dt]) => {
    const t = audioCtx.currentTime + dt;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(t);
    o.stop(t + 0.25);
  });
}

// Неверный ответ: глухой удар
function playWrong() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(65, t + 0.3);
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start(t);
  o.stop(t + 0.35);
}

// «Пуф» — свеча гаснет
function playPuff() {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const len = Math.floor(audioCtx.sampleRate * 0.25);
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const lp = audioCtx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  const g = audioCtx.createGain();
  g.gain.value = 0.3;
  src.connect(lp);
  lp.connect(g);
  g.connect(audioCtx.destination);
  src.start(t);
}

// Крик: либо свой файл (SCREAM_AUDIO), либо синтез
function playScream() {
  if (SCREAM_AUDIO) {
    const a = new Audio(SCREAM_AUDIO);
    a.volume = 1;
    a.play().catch(() => {});
    return;
  }
  ensureAudio();
  if (!audioCtx) return;

  const t = audioCtx.currentTime;
  const dur = 1.7;

  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.9, t + 0.03);
  master.gain.setValueAtTime(0.9, t + dur - 0.3);
  master.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  master.connect(audioCtx.destination);

  [
    [1200, 0],
    [1180, 9],
    [1240, -7],
  ].forEach(([freq, detune], i) => {
    const osc = audioCtx.createOscillator();
    osc.type = i === 0 ? "sawtooth" : "square";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + dur);
    osc.detune.value = detune;

    const g = audioCtx.createGain();
    g.gain.value = 0.25 / (i + 1);

    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(26, t);
    lfo.frequency.linearRampToValueAtTime(9, t + dur);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + dur);
    lfo.start(t);
    lfo.stop(t + dur);
  });

  const len = Math.floor(audioCtx.sampleRate * dur);
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  const noise = audioCtx.createBufferSource();
  noise.buffer = buf;
  const bp = audioCtx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(2600, t);
  bp.frequency.exponentialRampToValueAtTime(400, t + dur);
  const ng = audioCtx.createGain();
  ng.gain.value = 0.5;

  noise.connect(bp);
  bp.connect(ng);
  ng.connect(master);
  noise.start(t);
  noise.stop(t + dur);
}

/* Happy Birthday — как «Still Alive» в титрах Portal, но праздничная :)
   Музыкальная шкатулка: треугольная волна + тихая синусоида октавой выше. */
function playHappyBirthday() {
  ensureAudio();
  if (!audioCtx) return;
  const BEAT = 0.5; // темп
  const N = {
    G4: 392,
    A4: 440,
    B4: 494,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
  };
  // [нота, доли]
  const mel = [
    ["G4", 0.75],
    ["G4", 0.25],
    ["A4", 1],
    ["G4", 1],
    ["C5", 1],
    ["B4", 2],
    ["G4", 0.75],
    ["G4", 0.25],
    ["A4", 1],
    ["G4", 1],
    ["D5", 1],
    ["C5", 2],
    ["G4", 0.75],
    ["G4", 0.25],
    ["G5", 1],
    ["E5", 1],
    ["C5", 1],
    ["B4", 1],
    ["A4", 2],
    ["F5", 0.75],
    ["F5", 0.25],
    ["E5", 1],
    ["C5", 1],
    ["D5", 1],
    ["C5", 2.5],
  ];
  let t = audioCtx.currentTime + 0.15;
  mel.forEach(([note, beats]) => {
    const dur = beats * BEAT;
    [
      [N[note], "triangle", 0.16],
      [N[note] * 2, "sine", 0.05],
    ].forEach(([f, type, vol]) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.02);
      g.gain.setValueAtTime(vol * 0.8, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.98);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t);
      o.stop(t + dur);
    });
    t += dur;
  });
}

/* ==================== Пиксельные спрайты NPC ================= */
/* Ученики — процедурные пиксельные спрайты в стиле героя:
   мальчики и девочки, галстуки/бантики бело-зелёные и красно-синие. */

const NPC_MAPS = {
  boy: [
    "....hhhh....",
    "...hhhhhh...",
    "...hhhhhh...",
    "...ssssss...",
    "...sesses...",
    "...ssssss...",
    "....ssss....",
    "..bbwwwwbb..",
    ".bbbwwtwbbb.",
    ".bbbwwuwbbb.",
    ".bbbuwtwbbb.",
    ".bbbbwwbbbb.",
    "..ggg..ggg..",
    "..ggg..ggg..",
    "..ggg..ggg..",
    "..kkk..kkk..",
    "............",
  ],
  girl: [
    "..hhhhhhhh..",
    ".hhhhhhhhhh.",
    ".hhhhhhhhhh.",
    ".hhsssssshh.",
    ".hhsesseshh.",
    ".hhsssssshh.",
    "..hhsssshh..",
    ".bbwwwwwwbb.",
    ".bbwttttwbb.",
    ".bbwwttwwbb.",
    ".bbbwwwwbbb.",
    ".gggggggggg.",
    ".gggggggggg.",
    "..gggggggg..",
    "...pp..pp...",
    "...kk..kk...",
    "............",
  ],
};

// Варианты учеников: t = основной цвет галстука, u = второй цвет (полоска)
const NPC_VARIANTS = [
  {
    female: false,
    hair: "#4A2F1D",
    skin: "#EBB18B",
    tie: "#2E7D4F",
    tie2: "#E8E8E0",
  }, // мальчик, бело-зелёный
  {
    female: false,
    hair: "#14141A",
    skin: "#D99C6E",
    tie: "#C22430",
    tie2: "#2E4FA3",
  }, // мальчик, красно-синий
  {
    female: true,
    hair: "#6B3A1E",
    skin: "#F2C39B",
    tie: "#C22430",
    tie2: "#2E4FA3",
  }, // девочка, красно-синий
  {
    female: true,
    hair: "#1E1E24",
    skin: "#EBB18B",
    tie: "#2E7D4F",
    tie2: "#E8E8E0",
  }, // девочка, бело-зелёный
  {
    female: false,
    hair: "#7A4A1A",
    skin: "#C98A5E",
    tie: "#2E7D4F",
    tie2: "#E8E8E0",
  }, // мальчик, бело-зелёный
  {
    female: true,
    hair: "#3A2418",
    skin: "#EBB18B",
    tie: "#C22430",
    tie2: "#2E4FA3",
  }, // девочка, красно-синий
  {
    female: false,
    hair: "#2A2A33",
    skin: "#B87A50",
    tie: "#C22430",
    tie2: "#2E4FA3",
  }, // мальчик, красно-синий
  {
    female: true,
    hair: "#8A5A2A",
    skin: "#D99C6E",
    tie: "#2E7D4F",
    tie2: "#E8E8E0",
  }, // девочка, бело-зелёный
];

const NPC_BASE_PAL = {
  s: "#EBB18B",
  e: "#101018",
  b: "#24365A",
  w: "#F5F5F0",
  g: "#232838",
  p: "#2A2A34",
  k: "#16181F",
};

function buildNpcSprite(variant) {
  const map = NPC_MAPS[variant.female ? "girl" : "boy"];
  const c = document.createElement("canvas");
  c.width = 12;
  c.height = map.length;
  const x = c.getContext("2d");
  const pal = Object.assign({}, NPC_BASE_PAL, {
    h: variant.hair,
    s: variant.skin || NPC_BASE_PAL.s,
    t: variant.tie,
    u: variant.tie2,
  });
  map.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const ch = row[rx];
      if (ch === "." || !pal[ch]) continue;
      x.fillStyle = pal[ch];
      x.fillRect(rx, ry, 1, 1);
    }
  });
  return c;
}

const NPC_SPRITES = NPC_VARIANTS.map(buildNpcSprite);

// Запасной герой, если спрайт-лист не загрузится (тот же стиль, красный галстук)
const HERO_FALLBACK = buildNpcSprite({
  female: false,
  hair: "#14141A",
  tie: "#C22430",
  tie2: "#C22430",
});

/* ======================= Состояние игры ====================== */

/* ---------- Иконки командных кнопок (Undertale-стайл) ---------- */
/* Рисуются currentColor — цвет меняется вместе с текстом (оранжевый → жёлтый). */
const ICONS = [
  // 1. Сердечко
  '<svg class="ico" viewBox="0 0 7 7" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">' +
    '<rect x="1" y="0" width="2" height="1"/><rect x="4" y="0" width="2" height="1"/>' +
    '<rect x="0" y="1" width="7" height="3"/><rect x="1" y="4" width="5" height="1"/>' +
    '<rect x="2" y="5" width="3" height="1"/><rect x="3" y="6" width="1" height="1"/>' +
    "</svg>",
  // 2. Wi-Fi, повёрнутый на 90°
  '<svg class="ico" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">' +
    '<g transform="rotate(90 8 8)">' +
    '<rect x="7" y="13" width="2" height="2"/>' +
    '<rect x="5" y="11" width="6" height="1"/><rect x="5" y="12" width="1" height="1"/><rect x="10" y="12" width="1" height="1"/>' +
    '<rect x="3" y="9" width="10" height="1"/><rect x="3" y="10" width="1" height="1"/><rect x="12" y="10" width="1" height="1"/>' +
    '<rect x="1" y="7" width="14" height="1"/><rect x="1" y="8" width="1" height="1"/><rect x="14" y="8" width="1" height="1"/>' +
    "</g>" +
    "</svg>",
  // 3. Мешок с деньгами и буквой C в центре (контур мешка + буква)
  '<svg class="ico" viewBox="0 0 14 16" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">' +
    '<rect x="5" y="0" width="4" height="1"/>' +
    '<rect x="4" y="1" width="6" height="2"/>' +
    '<rect x="2" y="3" width="10" height="1"/>' +
    '<rect x="1" y="4" width="1" height="10"/><rect x="12" y="4" width="1" height="10"/>' +
    '<rect x="2" y="14" width="10" height="1"/>' +
    '<rect x="5" y="6" width="4" height="1"/>' +
    '<rect x="4" y="7" width="1" height="4"/>' +
    '<rect x="5" y="11" width="4" height="1"/>' +
    "</svg>",
  // 4. Крестик
  '<svg class="ico" viewBox="0 0 10 10" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">' +
    '<rect x="0" y="0" width="2" height="2"/><rect x="2" y="2" width="2" height="2"/>' +
    '<rect x="4" y="4" width="2" height="2"/><rect x="6" y="6" width="2" height="2"/>' +
    '<rect x="8" y="8" width="2" height="2"/><rect x="8" y="0" width="2" height="2"/>' +
    '<rect x="6" y="2" width="2" height="2"/><rect x="2" y="6" width="2" height="2"/>' +
    '<rect x="0" y="8" width="2" height="2"/>' +
    "</svg>",
];

let sheetImg = new Image();
let sheetFlip = null; // тот же лист, отражённый по горизонтали (ходьба влево)
let sheetReady = false;
sheetImg.onload = () => {
  sheetReady = true;
  // Каждую колонку отражаем НА МЕСТЕ — иначе колонки меняются местами
  const c = document.createElement("canvas");
  c.width = sheetImg.width;
  c.height = sheetImg.height;
  const cx = c.getContext("2d");
  cx.imageSmoothingEnabled = false;
  for (let col = 0; col * SHEET.cell < sheetImg.width; col++) {
    cx.save();
    cx.translate(col * SHEET.cell + SHEET.cell, 0);
    cx.scale(-1, 1);
    cx.drawImage(
      sheetImg,
      col * SHEET.cell,
      0,
      SHEET.cell,
      sheetImg.height,
      0,
      0,
      SHEET.cell,
      sheetImg.height,
    );
    cx.restore();
  }
  sheetFlip = c;
};
sheetImg.onerror = () => {
  sheetReady = false;
};
sheetImg.src = SHEET_URL;

const G = {
  mode: "menu", // menu | walk | battle | finale | dead
  hp: MAX_HP,
  doneCount: 0, // с кем уже поговорили
  hearts: 0, // верных ответов (собранные сердца)
  animT: 0,
  walkFrame: 0,
  dir: "right",
  moving: false, // герой реально шагает в этом кадре
  battleNpc: -1,
  selectedIndex: 0,
  answered: false, // ответ уже дан в текущем бою
};

/* ---------- Сердца за верные ответы (цвета душ Undertale) ---------- */

// Порядок: красное, оранжевое, жёлтое, зелёное, синее, голубое, розовое
const HEART_COLORS = [
  "#FF0000",
  "#FF9E00",
  "#FFFF00",
  "#00D000",
  "#2E5BFF",
  "#00D2FF",
  "#FF6BD6",
];

const HEART_SVG =
  '<svg viewBox="0 0 7 7" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">' +
  '<rect x="1" y="0" width="2" height="1"/><rect x="4" y="0" width="2" height="1"/>' +
  '<rect x="0" y="1" width="7" height="3"/><rect x="1" y="4" width="5" height="1"/>' +
  '<rect x="2" y="5" width="3" height="1"/><rect x="3" y="6" width="1" height="1"/>' +
  "</svg>";

// Рисуем ряд из 7 пустых слотов под HP-полоской
function renderHearts() {
  heartsRow.innerHTML = "";
  for (let i = 0; i < npcs.length; i++) {
    const slot = document.createElement("span");
    slot.className = "h-slot";
    slot.innerHTML = HEART_SVG;
    heartsRow.appendChild(slot);
  }
}

// Выдать сердце за последний верный ответ (G.hearts уже увеличен)
function awardHeart() {
  const slot = heartsRow.children[G.hearts - 1];
  if (!slot) return;
  slot.style.color = HEART_COLORS[G.hearts - 1] || "#FF0000";
  slot.classList.add("h-got", "h-pop");
}

const hero = { x: 40, y: 118 };

const npcs = NPC_X.slice(0, QUESTIONS.length).map((x, i) => ({
  x,
  y: 116 + (i % 2 ? 10 : 0),
  variant: i % NPC_VARIANTS.length,
  done: false,
}));

/* ========================= Ввод ============================== */

const keys = new Set();

document.addEventListener("keydown", (e) => {
  const k = e.key;
  keys.add(k);

  if (G.mode === "walk") {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(k))
      e.preventDefault();
    if (k === " ") tryInteract();
  } else if (G.mode === "battle" && !G.answered) {
    const n = currentChoices().length;
    if (!n) return;
    if (["ArrowDown", "ArrowRight"].includes(k)) {
      G.selectedIndex = (G.selectedIndex + 1) % n;
      blip(700, 0.04, "square", 0.05);
      updateSelection();
      e.preventDefault();
    } else if (["ArrowUp", "ArrowLeft"].includes(k)) {
      G.selectedIndex = (G.selectedIndex - 1 + n) % n;
      blip(700, 0.04, "square", 0.05);
      updateSelection();
      e.preventDefault();
    } else if (k === "z" || k === "Z" || k === "Enter" || k === " ") {
      chooseAnswer(G.selectedIndex);
      e.preventDefault();
    }
  }
});

document.addEventListener("keyup", (e) => keys.delete(e.key));
window.addEventListener("blur", () => keys.clear());

function axis() {
  let dx = 0,
    dy = 0;
  if (
    keys.has("ArrowLeft") ||
    keys.has("a") ||
    keys.has("A") ||
    keys.has("ф") ||
    keys.has("Ф")
  )
    dx -= 1;
  if (
    keys.has("ArrowRight") ||
    keys.has("d") ||
    keys.has("D") ||
    keys.has("в") ||
    keys.has("В")
  )
    dx += 1;
  if (
    keys.has("ArrowUp") ||
    keys.has("w") ||
    keys.has("W") ||
    keys.has("ц") ||
    keys.has("Ц")
  )
    dy -= 1;
  if (
    keys.has("ArrowDown") ||
    keys.has("s") ||
    keys.has("S") ||
    keys.has("ы") ||
    keys.has("Ы")
  )
    dy += 1;
  return [dx, dy];
}

/* ===================== Игровая логика ======================== */

function showScreen(screen) {
  [startScreen, gameScreen, portalScreen, impostorScreen, screamScreen, surviveScreen].forEach(
    (s) => {
      s.classList.remove("active");
    },
  );
  screen.classList.add("active");
}

function startGame() {
  ensureAudio();
  G.hp = MAX_HP;
  G.doneCount = 0;
  G.hearts = 0;
  G.mode = "walk";
  G.dir = "right";
  G.moving = false;
  G.animT = 0;
  G.walkFrame = 0;
  hero.x = 40;
  hero.y = 118;
  npcs.forEach((n, i) => {
    n.done = false;
    n.y = 116 + (i % 2 ? 10 : 0);
  });
  updateHP();
  renderHearts();
  setHint("* СТРЕЛКИ — ходьба · ПРОБЕЛ — говорить");
  battleEl.hidden = true;
  showScreen(gameScreen);
}

function updateHP() {
  const pct = Math.max(0, (G.hp / MAX_HP) * 100) + "%";
  hpFill.style.width = pct;
  hpLabel.textContent = Math.max(0, G.hp) + " / " + MAX_HP;
  battleHpFill.style.width = pct;
  battleHpLabel.textContent = Math.max(0, G.hp) + "/" + MAX_HP;
}

function setHint(text) {
  if (keyHint.textContent !== text) keyHint.textContent = text;
}

// Первый ученик, с которым ещё не говорили, — перед ним стоит невидимая стена
function lockedNpc() {
  for (const n of npcs) if (!n.done) return n;
  return null;
}

function nearestNpc() {
  let best = null,
    bestD = 1e9;
  for (const n of npcs) {
    if (n.done) continue;
    const d = Math.hypot(n.x - hero.x, n.y - hero.y);
    if (d < 36 && d < bestD) {
      best = n;
      bestD = d;
    }
  }
  return best;
}

function tryInteract() {
  const npc = nearestNpc();
  if (!npc) return;
  openBattle(npcs.indexOf(npc));
}

/* ---------- Бой (вопрос в белом боксе) ---------- */

function currentChoices() {
  return Array.from(battleChoices.children);
}

function openBattle(npcIndex) {
  const q = QUESTIONS[npcIndex];
  const npc = npcs[npcIndex];
  G.mode = "battle";
  G.moving = false;
  G.battleNpc = npcIndex;
  G.selectedIndex = 0;
  G.answered = false;
  G.dir = npc.x >= hero.x ? "right" : "left";

  battleText.classList.remove("ok", "bad");
  battleText.textContent = "* " + q.text;

  // Портрет ученика — в центральную колонку боевого экрана
  battleEnemy.src = NPC_SPRITES[npc.variant].toDataURL();

  battleChoices.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = ICONS[i % ICONS.length] + '<span class="lbl"></span>';
    btn.querySelector(".lbl").textContent = opt;
    btn.addEventListener("click", () => chooseAnswer(i));
    btn.addEventListener("mouseenter", () => {
      if (G.answered) return;
      G.selectedIndex = i;
      updateSelection();
    });
    battleChoices.appendChild(btn);
  });
  updateSelection();
  updateHP();
  setHint("* СТРЕЛКИ — выбрать ответ · ПРОБЕЛ / Z — ответить");
  battleEl.hidden = false;
  blip(880, 0.06, "triangle", 0.1);
}

function updateSelection() {
  currentChoices().forEach((b, i) =>
    b.classList.toggle("selected", i === G.selectedIndex),
  );
}

function chooseAnswer(i) {
  if (G.answered) return;
  G.answered = true;
  const q = QUESTIONS[G.battleNpc];
  const buttons = currentChoices();
  buttons.forEach((b) => {
    b.disabled = true;
  });

  const right = i === q.correct;
  if (right) {
    buttons[i].classList.add("correct");
    battleText.classList.add("ok");
    battleText.textContent = "Right!!!";
    playRight();
    G.hearts++;
    awardHeart();
  } else {
    buttons[i].classList.add("wrong");
    if (q.correct >= 0 && q.correct < buttons.length)
      buttons[q.correct].classList.add("correct");
    battleText.classList.add("bad");
    battleText.textContent = "Arrrgh!!!";
    playWrong();
    hurtHero();
  }

  setTimeout(
    () => {
      battleEl.hidden = true;
      if (G.hp <= 0) {
        showImpostor();
        return;
      }

      // Дальше идём после ЛЮБОГО ответа — верного или нет.
      // Ошибка стоит 10 HP, но не запирает в коридоре.
      const npc = npcs[G.battleNpc];
      if (!npc.done) {
        npc.done = true;
        npc.y = Math.min(144, npc.y + 18); // ученик отходит в сторону — проход свободен
        G.doneCount++;
      }
      if (right) blip(523, 0.06, "triangle", 0.08);
      G.mode = "walk";
    },
    right ? 1100 : 1300,
  );
}

function hurtHero() {
  G.hp -= DMG;
  updateHP();
  stageEl.classList.add("hurt");
  stageEl.classList.add("shake");
  setTimeout(() => stageEl.classList.remove("hurt"), 550);
  setTimeout(() => stageEl.classList.remove("shake"), 700);
}

/* ========================= Отрисовка ========================= */

function roundRect(x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x | 0, y | 0, w, h);
}

function drawCorridor(camX) {
  // Стена
  roundRect(0, 0, VIEW_W, 64, "#2B3148");
  roundRect(0, 58, VIEW_W, 6, "#1C2032");

  // Панели на стене
  for (let wx = -(camX % 48); wx < VIEW_W; wx += 48) {
    ctx.fillStyle = "rgba(255,255,255,.04)";
    ctx.fillRect(wx | 0, 4, 44, 52);
  }

  // Окна (свет) и шкафчики — чередуются
  const segW = 90;
  const first = Math.floor(camX / segW) - 1;
  for (let s = first; s * segW < camX + VIEW_W + segW; s++) {
    const sx = s * segW - camX;
    if (s % 2 === 0) {
      // Окно: тёплый свет
      roundRect(sx + 12, 10, 40, 34, "#101321");
      roundRect(sx + 14, 12, 36, 30, "#FFD98A");
      roundRect(sx + 14, 12, 36, 12, "#FFE9B8");
      ctx.fillStyle = "#101321";
      ctx.fillRect((sx + 31) | 0, 12, 2, 30);
      ctx.fillRect((sx + 14) | 0, 26, 36, 2);
    } else {
      // Шкафчики
      for (let i = 0; i < 3; i++) {
        const lx = sx + 8 + i * 15;
        roundRect(lx, 14, 13, 32, "#3B4A66");
        roundRect(lx, 14, 13, 3, "#4C5E80");
        ctx.fillStyle = "#1C2032";
        ctx.fillRect((lx + 2) | 0, 22, 9, 1);
        ctx.fillRect((lx + 2) | 0, 25, 9, 1);
        ctx.fillStyle = "#9AD9FF";
        ctx.fillRect((lx + 10) | 0, 28, 1, 3);
      }
    }
  }

  // Пол в клетку
  for (let fy = 64; fy < VIEW_H; fy += 12) {
    for (let fx = -(camX % 24); fx < VIEW_W; fx += 24) {
      const odd = ((fy - 64) / 12) % 2 === 0;
      roundRect(fx + (odd ? 0 : 12), fy, 12, 12, "#4A4258");
      roundRect(fx + (odd ? 12 : 0), fy, 12, 12, "#3E3849");
    }
  }
  // Затемнение пола к низу
  const gr = ctx.createLinearGradient(0, 64, 0, VIEW_H);
  gr.addColorStop(0, "rgba(0,0,0,0)");
  gr.addColorStop(1, "rgba(0,0,0,.35)");
  ctx.fillStyle = gr;
  ctx.fillRect(0, 64, VIEW_W, VIEW_H - 64);
}

function drawExitDoor(camX, time) {
  const dx = WORLD_W - 46 - camX;
  if (dx < -60 || dx > VIEW_W + 60) return;
  const open = G.doneCount >= npcs.length;
  roundRect(dx, 8, 34, 56, "#1C2032");
  roundRect(dx + 3, 11, 28, 53, open ? "#5A3A22" : "#3A2A1E");
  roundRect(dx + 3, 11, 28, 8, open ? "#6B4A2E" : "#463424");
  ctx.fillStyle = "#C8C8C8";
  ctx.fillRect((dx + 25) | 0, 38, 2, 4);
  if (open) {
    // Свет из открытой двери
    const pulse = 0.5 + 0.3 * Math.sin(time * 0.004);
    ctx.fillStyle = "rgba(255,217,138," + pulse.toFixed(2) + ")";
    ctx.fillRect((dx + 5) | 0, 21, 24, 41);
    ctx.fillStyle = "#FFF3D0";
    ctx.fillRect((dx + 14) | 0, 21, 6, 41);
  }
}

function drawNpc(n, camX, time) {
  const spr = NPC_SPRITES[n.variant];
  const dx = (n.x - camX - 13) | 0;
  const dy = (n.y - 38) | 0;
  if (dx < -30 || dx > VIEW_W + 30) return;

  ctx.globalAlpha = n.done ? 0.55 : 1;
  ctx.drawImage(spr, dx, dy, 26, 38);
  ctx.globalAlpha = 1;

  // Тень
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.fillRect((n.x - camX - 9) | 0, (n.y - 1) | 0, 18, 2);

  if (n.done) {
    // Зелёное сердечко — ученик «сдался»
    ctx.fillStyle = "#00D000";
    ctx.fillRect((n.x - camX - 1) | 0, (n.y - 44) | 0, 2, 2);
    ctx.fillRect((n.x - camX - 4) | 0, (n.y - 46) | 0, 2, 2);
    ctx.fillRect((n.x - camX + 2) | 0, (n.y - 46) | 0, 2, 2);
    ctx.fillRect((n.x - camX - 5) | 0, (n.y - 44) | 0, 1, 1);
    ctx.fillRect((n.x - camX + 4) | 0, (n.y - 44) | 0, 1, 1);
  } else if (Math.hypot(n.x - hero.x, n.y - hero.y) < 40) {
    // «!» — можно поговорить
    ctx.fillStyle = "#000";
    ctx.fillRect((n.x - camX - 5) | 0, (n.y - 52) | 0, 10, 12);
    ctx.fillStyle = "#FFFF00";
    ctx.fillRect((n.x - camX - 1) | 0, (n.y - 50) | 0, 2, 5);
    ctx.fillRect((n.x - camX - 1) | 0, (n.y - 43) | 0, 2, 2);
  }
}

function drawHero(camX, time) {
  const size = SHEET.drawSize;
  const dx = (hero.x - camX - size / 2) | 0;
  const dy = (hero.y - size + 2) | 0;
  const d = SHEET.dirs[G.dir] || SHEET.dirs.right;

  // Тень
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.fillRect((hero.x - camX - 9) | 0, (hero.y - 1) | 0, 18, 2);

  let row = d.stand;
  // Кадры ходьбы чередуются, на чётном кадре приподнимаем героя на 1px (шаг)
  const bob = G.moving ? G.walkFrame % 2 : 0;
  if (G.moving) row = d.walk[G.walkFrame % d.walk.length];

  const src = d.flip ? sheetFlip : sheetImg;
  if (sheetReady && src) {
    ctx.drawImage(
      src,
      d.col * SHEET.cell,
      row * SHEET.cell,
      SHEET.cell,
      SHEET.cell,
      dx,
      dy - bob,
      size,
      size,
    );
  } else {
    ctx.drawImage(HERO_FALLBACK, dx + 5, dy + 2 - bob, 24, 34);
  }
}

/* ======================= Главный цикл ======================== */

let last = performance.now();

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (G.mode === "walk") updateWalk(dt);
  if (G.mode === "walk" || G.mode === "battle") {
    drawWorld(now);
  } else if (G.mode === "finale") {
    updateFinale(dt, now);
    drawFinale(now);
  }

  requestAnimationFrame(loop);
}

function updateWalk(dt) {
  const [dx, dy] = axis();
  const len = Math.hypot(dx, dy) || 1;
  const sp = 92;

  G.moving = !!(dx || dy);

  const nx = hero.x + (dx / len) * sp * dt * (dx ? 1 : 0);
  const ny = hero.y + (dy / len) * sp * dt * (dy ? 1 : 0);

  if (dx) G.dir = dx > 0 ? "right" : "left";
  else if (dy) G.dir = dy > 0 ? "down" : "up";

  // Границы коридора
  let okX = nx >= 12 && nx <= WORLD_W - 12;
  let okY = ny >= 84 && ny <= 150;

  // НЕВИДИМАЯ СТЕНА: мимо школьника не пройти, пока не ответишь ему.
  const lock = lockedNpc();
  if (lock && nx > lock.x - 20) okX = false;

  // Не проходить сквозь тех, с кем ещё не поговорили
  for (const n of npcs) {
    if (n.done) continue;
    if (Math.hypot(n.x - nx, n.y - ny) < 16) {
      okX = false;
      okY = false;
    }
  }

  if (okX) hero.x = nx;
  if (okY) hero.y = ny;

  // Анимация ходьбы
  if (G.moving) {
    G.animT += dt;
    if (G.animT > 0.14) {
      G.animT = 0;
      G.walkFrame++;
    }
  } else {
    G.animT = 0;
  }

  // Подсказка под сценой
  if (G.doneCount >= npcs.length) {
    setHint(
      G.hearts >= npcs.length
        ? "* ВСЕ 7 СЕРДЕЦ СОБРАНЫ! Дверь открыта — иди вправо за тортом!"
        : "* Дверь открыта... но сердец мало. Иди вправо.",
    );
  } else if (lock && hero.x >= lock.x - 30 && hero.x < lock.x) {
    setHint("* СТЕНА! Сначала поговори с учеником (ПРОБЕЛ)");
  } else {
    setHint("* СТРЕЛКИ — ходьба · ПРОБЕЛ — говорить");
  }

  // Дверь в конце: торт — только с всеми сердцами, иначе — «прошёл и всё»
  if (G.doneCount >= npcs.length && hero.x >= WORLD_W - 58) {
    if (G.hearts >= npcs.length) {
      startFinale();
    } else {
      showSurvive();
    }
  }
}

function drawWorld(time) {
  const camX = Math.max(0, Math.min(hero.x - VIEW_W / 2, WORLD_W - VIEW_W));
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawCorridor(camX);
  drawExitDoor(camX, time);
  const sorted = [...npcs].sort((a, b) => a.y - b.y);
  let heroDrawn = false;
  for (const n of sorted) {
    if (!heroDrawn && n.y > hero.y) {
      drawHero(camX, time);
      heroDrawn = true;
    }
    drawNpc(n, camX, time);
  }
  if (!heroDrawn) drawHero(camX, time);
}

/* ==================== ФИНАЛ (Portal) ========================= */

const F = { t: 0, candleOut: false, songPlayed: false, uiShown: false };
let eyesSeeded = [];

function startFinale() {
  G.mode = "finale";
  F.t = 0;
  F.candleOut = false;
  F.songPlayed = false;
  F.uiShown = false;
  hbText.classList.add("hidden");
  finaleUi.classList.add("hidden");
  eyesSeeded = [];
  for (let i = 0; i < 24; i++) {
    eyesSeeded.push({
      phase: Math.random() * 10,
      speed: 0.4 + Math.random() * 0.8,
      dead: Math.random() < 0.25,
    });
  }
  showScreen(portalScreen);
  blip(392, 0.1, "triangle", 0.1);
}

function drawFinale(now) {
  const t = F.t;
  fctx.clearRect(0, 0, VIEW_W, VIEW_H);

  // Зум к торту (первые ~7 секунд)
  const zoom = 1 + Math.min(t / 7, 1) * 1.7;
  const cx = 120,
    cy = 112;

  fctx.save();
  fctx.translate(cx, cy);
  fctx.scale(zoom, zoom);
  fctx.translate(-cx, -cy);

  // Стена тёмно-синяя
  const bg = fctx.createLinearGradient(0, 0, 0, VIEW_H);
  bg.addColorStop(0, "#0A0E1C");
  bg.addColorStop(1, "#05070F");
  fctx.fillStyle = bg;
  fctx.fillRect(-40, -40, VIEW_W + 80, VIEW_H + 80);

  // Стеллажи со сферами-глазами (как в комнате Portal)
  const shelves = [16, 46, 76];
  shelves.forEach((sy, row) => {
    fctx.fillStyle = "#141A2A";
    fctx.fillRect(6, sy + 14, 228, 3);
    for (let i = 0; i < 8; i++) {
      const ex = 18 + i * 28 + (row % 2 ? 8 : 0);
      const eye = eyesSeeded[row * 8 + i];
      if (!eye) continue;
      // Сфера
      fctx.fillStyle = "#2A3040";
      fctx.beginPath();
      fctx.arc(ex + 7, sy + 8, 7, 0, 7);
      fctx.fill();
      fctx.fillStyle = "#3A4256";
      fctx.fillRect(ex + 2, sy + 3, 7, 5);
      // Глаза: пара оранжевых точек, моргают
      const open =
        !eye.dead && Math.sin(now * 0.001 * eye.speed + eye.phase) > -0.75;
      if (open) {
        fctx.fillStyle = "#FF7B00";
        fctx.fillRect(ex + 3, sy + 7, 2, 2);
        fctx.fillRect(ex + 9, sy + 7, 2, 2);
        fctx.fillStyle = "rgba(255,123,0,.35)";
        fctx.fillRect(ex + 2, sy + 6, 4, 4);
        fctx.fillRect(ex + 8, sy + 6, 4, 4);
      }
    }
  });

  // Пол
  fctx.fillStyle = "#0B0E18";
  fctx.fillRect(-40, 104, VIEW_W + 80, VIEW_H);

  // Стол
  fctx.fillStyle = "#B8B8C0";
  fctx.fillRect(92, 118, 56, 5);
  fctx.fillStyle = "#6A6A74";
  fctx.fillRect(96, 123, 4, 22);
  fctx.fillRect(140, 123, 4, 22);

  // Торт
  fctx.fillStyle = "#5A3418";
  fctx.fillRect(106, 106, 28, 12);
  fctx.fillStyle = "#6B3F23";
  fctx.fillRect(106, 106, 28, 3);
  fctx.fillRect(106, 112, 28, 2);
  fctx.fillStyle = "#F2D8A8"; // глазурь
  fctx.fillRect(105, 103, 30, 3);
  fctx.fillStyle = "#D42A2A"; // вишенки
  [109, 117, 125, 131].forEach((rx) => fctx.fillRect(rx, 101, 2, 2));
  // Свеча
  fctx.fillStyle = "#E8E8F0";
  fctx.fillRect(119, 95, 2, 8);
  fctx.fillStyle = "#B3202A";
  fctx.fillRect(119, 95, 2, 2);

  fctx.restore();

  // Пламя свечи (в экранных координатах, чтобы не мылилось зумом)
  if (!F.candleOut) {
    const flick = Math.sin(now * 0.02) * 0.5 + Math.sin(now * 0.047) * 0.5;
    const fx = 120,
      fy = 95;
    fctx.fillStyle = "#FFD98A";
    fctx.fillRect(fx - 1, fy - 4 + flick, 2, 4);
    fctx.fillStyle = "#FF9E00";
    fctx.fillRect(fx - 1, fy - 2 + flick, 2, 2);
    fctx.fillStyle = "rgba(255,190,80,.25)";
    fctx.fillRect(fx - 4, fy - 8 + flick, 8, 10);
  }

  // Затемнение после того, как свеча погасла
  if (F.candleOut) {
    const dark = Math.min((t - 7) / 1.2, 1) * 0.55;
    fctx.fillStyle = "rgba(0,0,0," + dark.toFixed(2) + ")";
    fctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  // Полный чёрный перед HAPPY BIRTHDAY
  if (t > 8.2) {
    fctx.fillStyle = "#000";
    fctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  // Виньетка
  const v = fctx.createRadialGradient(120, 80, 40, 120, 80, 150);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,.5)");
  fctx.fillStyle = v;
  fctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function updateFinale(dt, now) {
  F.t += dt;

  if (!F.candleOut && F.t >= 7) {
    F.candleOut = true;
    playPuff();
  }
  if (!F.songPlayed && F.t >= 8.6) {
    F.songPlayed = true;
    hbText.classList.remove("hidden");
    playHappyBirthday();
  }
  if (!F.uiShown && F.t >= 12.5) {
    F.uiShown = true;
    finaleUi.classList.remove("hidden");
  }
}

/* ---------- «ИМПОСТЕР» (HP = 0): белый экран → кровь → скример ---------- */

function showImpostor() {
  G.mode = "dead";
  battleEl.hidden = true;
  showScreen(impostorScreen);

  setTimeout(() => {
    spawnBlood();
    impostorScreen.classList.add("red");
  }, 400);

  setTimeout(() => {
    screamFace.src = SCREAM_IMAGE || SCREAM_FACE_DATA;
    showScreen(screamScreen);
    playScream();
    setTimeout(() => retryBtn.classList.add("show"), 2600);
  }, 3000);
}

function spawnBlood() {
  bloodStreams.innerHTML = "";
  bloodDrops.innerHTML = "";

  const STREAMS = 16;
  for (let i = 0; i < STREAMS; i++) {
    const s = document.createElement("i");
    s.className = "blood-stream";
    s.style.left = Math.random() * 97 + "%";
    s.style.width = 2 + Math.random() * 5 + "vw";
    s.style.height = 45 + Math.random() * 55 + "vh";
    s.style.setProperty("--d", 1.5 + Math.random() * 1.1 + "s");
    s.style.animationDelay = Math.random() * 0.5 + "s";
    bloodStreams.appendChild(s);
  }

  const DROPS = 26;
  for (let i = 0; i < DROPS; i++) {
    const d = document.createElement("i");
    d.className = "blood-drop";
    d.style.left = Math.random() * 97 + "%";
    d.style.setProperty("--s", 10 + Math.random() * 12 + "px");
    d.style.setProperty("--d", 1.2 + Math.random() * 1 + "s");
    d.style.animationDelay = 0.1 + Math.random() * 1.1 + "s";
    bloodDrops.appendChild(d);
  }
}

/* ---------- Экран «вы прошли игру» (выжил, но не 7/7) ---------- */

function showSurvive() {
  G.mode = "dead";
  battleEl.hidden = true;
  showScreen(surviveScreen);
}

/* ---------- Перезапуск ---------- */

function resetAll() {
  retryBtn.classList.remove("show");
  impostorScreen.classList.remove("red");
  bloodStreams.innerHTML = "";
  bloodDrops.innerHTML = "";
  battleEl.hidden = true;
  hbText.classList.add("hidden");
  finaleUi.classList.add("hidden");
  G.mode = "menu";
  G.hearts = 0;
  showScreen(startScreen);
}

/* ---------- События ---------- */

startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", resetAll);
document
  .querySelectorAll(".restart-btn")
  .forEach((b) => b.addEventListener("click", resetAll));

// Строка с числом учеников и порогом на стартовом экране
// (элемент мог быть удалён из HTML — не падаем, если его нет)
if (metaLine) {
  metaLine.textContent =
    "* УЧЕНИКОВ: " +
    npcs.length +
    " · HP: " +
    MAX_HP +
    " · УРОН: " +
    DMG +
    " · СЕРДЕЦ: " +
    npcs.length;
}

// Погнали!
requestAnimationFrame(loop);
