// Section 2: verse 2's eight people, the gallery of all eight, the second pre-chorus and the
// second chorus, where the "who" plate becomes each person in turn and the mobile rebalances.
import { PAL, TAU, W, H, cut, paint, pin, shape, at, hash, clamp01, lerp, smooth, easeOut, settle, between, wall, panel } from './paper.js';
import { clawd, danceBeat, lyric, letters } from './cast.js';
import { figure, hand, chatBot, robot, valuePlate, VALUE } from './people.js';
import { makeMobile } from './mobile.js';
import { on, headScene, promptScene, chorusScene, chorusSpec } from './sec1.js';

// One person per line of verse 2 (lines 20–27): their plate colour, how to draw them, their value.
export const PEOPLE = [
  { name: 'demo', panel: PAL.yellow, value: 'wow', word: 'wow', ink: PAL.black,
    draw(g, t, S, b) {
      paint(g, cut('stage', () => shape.rect(420, 50, -210, 0), { amp: 1.4 }), PAL.black, { lift: 1, seed: 1 });
      const d = danceBeat(S, t, 0.5);
      figure(g, 0, 0, 1.75, PAL.black, { armR: 2.7 + d.armL * 0.2, armL: 0.5, legSpread: 0.2 }, 'demo');
    } },
  { name: 'paying', panel: PAL.red, value: 'last', word: 'last', ink: PAL.black,
    draw(g, t) {
      figure(g, 0, 50, 1.75, PAL.black, { armR: 1.25, armL: 0.1 }, 'paying');
      const [hx, hy] = hand(1, 1.25, 1.75, 0, 50);
      at(g, hx + 30, hy - 10, -0.2, 1, () => paint(g, cut('card', () => shape.rect(130, 84), { amp: 1 }), PAL.yellow, { lift: 2.2, seed: 3 }));
    } },
  { name: 'group chat', panel: PAL.green, value: 'laugh', word: 'laugh', ink: PAL.cream,
    draw(g, t, S) {
      const b = S.beatPos(t);
      chatBot(g, 0, -350, 1.9, PAL.cream, t);
      for (let i = 0; i < 3; i++) {
        const hop = Math.abs(Math.sin((b + i * 0.33) * Math.PI)) * 30;
        at(g, -260 + i * 260, 80 - hop, (i - 1) * 0.2, 0.7 + 0.1 * (i % 2), () => chatBot(g, 0, 0, 1, [PAL.pink, PAL.yellow, PAL.cream][i], t + i));
      }
    } },
  { name: 'uni', panel: PAL.blue, value: 'pass', word: 'pass', ink: PAL.cream,
    draw(g, t) {
      figure(g, 0, 50, 1.75, PAL.cream, { armR: 1.35, armL: 0.1, hat: 'mortar' }, 'uni');
      const [hx, hy] = hand(1, 1.35, 1.75, 0, 50);
      at(g, hx + 60, hy - 30, 0.12, 1, () => paint(g, cut('essay', () => shape.rect(150, 200), { amp: 1.2 }), PAL.white, { lift: 2.2, seed: 5 }));
    } },
  { name: 'Nana', panel: PAL.teal, value: 'sweet', word: 'sweet', ink: PAL.cream,
    draw(g, t) {
      figure(g, 0, 50, 1.7, PAL.black, { armR: 0.95, armL: 0.95, hat: 'bun', lean: 0.06 }, 'nana');
      at(g, 30, -520, 0.05, 1, () => paint(g, cut('bigphone', () => shape.smooth([[-70, -120], [70, -120], [78, -110], [78, 110], [70, 120], [-70, 120], [-78, 110], [-78, -110]], 3)), PAL.white, { lift: 2.4, seed: 6 }));
    } },
  { name: "can't see", panel: PAL.pink, value: 'speak', word: 'speak', ink: PAL.black,
    draw(g, t, S) {
      figure(g, 0, 50, 1.75, PAL.black, { armR: 0.2, armL: 0.2, hat: 'phones', accent: PAL.yellow }, 'screens');
      const b = S.beatPos(t);
      for (let i = 0; i < 3; i++) {
        const p = ((b * 0.5 + i / 3) % 1);
        g.save(); g.globalAlpha = 1 - p; g.strokeStyle = PAL.black; g.lineWidth = 12; g.lineCap = 'round';
        g.beginPath(); g.arc(-150, -640, 60 + p * 140, Math.PI * 0.75, Math.PI * 1.25); g.stroke(); g.restore();
      }
    } },
  { name: 'bots', panel: PAL.violet, value: 'no leak', word: 'leak', ink: PAL.cream,
    draw(g, t) {
      figure(g, -120, 50, 1.6, PAL.black, { armR: 0.55, armL: 0.55 }, 'owner');
      at(g, -120, -250, 0, 1, () => paint(g, cut('folder', () => [[-80, -60], [-20, -60], [0, -40], [80, -40], [80, 60], [-80, 60]], { amp: 1 }), PAL.yellow, { lift: 2.2, seed: 8 }));
      robot(g, 190, 50, 1.25, PAL.cream, 'bot1');
    } },
  { name: 'us', panel: PAL.black, plate: PAL.clawd, value: 'neat', word: 'neat', ink: PAL.cream,
    draw(g, t, S) {
      figure(g, -150, 50, 1.6, PAL.cream, { armR: 0.4, armL: 0.1 }, 'dev');
      clawd(g, 170, 50, 1.9, { eyes: 'happy', ...danceBeat(S, t, 0.5), lift: 1.4 });
    } },
];

// One person's plate: their colour, them, and a small mobile tipped by what they value.
function personScene(g, t, S, i, { lyrics = true } = {}) {
  const P = PEOPLE[i], li = 20 + i, L = S.lyrics[li];
  wall(g); panel(g, P.panel, { seed: 20 + i });
  at(g, 340, 1640, 0, 1, () => P.draw(g, t, S));
  // the little mobile, top right: their value on the left, a plain counterweight on the right
  const tv = on(S, li, P.word);
  const pv = settle(between(t, tv - 0.1, tv + 0.5));
  const tilt = -0.28 * pv + Math.sin(t * 1.2 + i) * 0.03;
  const px = 760, py = 640;
  g.save(); g.strokeStyle = PAL.black; g.lineWidth = 3;
  g.beginPath(); g.moveTo(px, 150); g.lineTo(px, py); g.stroke();
  const c = Math.cos(tilt), s = Math.sin(tilt);
  const Lx = px - 190 * c, Ly = py - 190 * s, Rx = px + 110 * c, Ry = py + 110 * s;
  g.lineWidth = 5; g.beginPath(); g.moveTo(Lx, Ly); g.quadraticCurveTo(px, py + 14, Rx, Ry); g.stroke();
  g.lineWidth = 2.5; g.beginPath(); g.moveTo(Lx, Ly); g.lineTo(Lx, Ly + 80); g.moveTo(Rx, Ry); g.lineTo(Rx, Ry + 60); g.stroke();
  g.restore();
  at(g, Rx, Ry + 60 + 38, 0, 1, () => paint(g, cut('counter', () => shape.ellipse(38, 38, 30)), PAL.white, { lift: 2.4, seed: 4 }));
  if (t >= tv - 0.1) {
    at(g, Lx, Ly + 80 + 100 * lerp(0.6, 1, pv), Math.sin(t * 1.3) * 0.04, lerp(0.5, 1.25, pv), () => {
      valuePlate(g, P.value);
      if (t >= tv) { if (P.value === 'neat') g.translate(0, 130); labelOn(g, P.value, VALUE[P.value].dark && P.value !== 'neat' ? PAL.black : PAL.white); }
    });
  }
  if (lyrics) lyric(g, t, L, { x: 540, y: 320, w: 900, size: 90, align: 'center', color: P.ink, accent: { [P.word]: P.panel === PAL.yellow || P.panel === PAL.pink ? PAL.red : PAL.yellow } }, li);
}

function labelOn(g, text, col) {
  const sz = text.length > 5 ? 34 : 40;
  g.font = `800 ${sz}px Bricolage`;
  const w = g.measureText(text).width;
  letters(g, text, -w / 2, sz * 0.35, sz, col, 0.3, text.length);
}

// The gallery: all eight plates on the wall at once, with Clawd in the middle looking round.
function gallery(g, t, S) {
  wall(g);
  const t0 = 72.48, cw = 324, ch = 576, gx = 27, gy = 48;
  let k = 0;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const x = gx + c * (cw + gx), y = gy + r * (ch + gy), idx = r * 3 + c;
    if (idx === 4) {
      clawd(g, x + cw / 2, y + ch * 0.72, 1.35, { eyes: 'wide', look: Math.sin((t - t0) * 1.4) * 0.9, lift: 1.4 });
      continue;
    }
    const i = k++;
    const p = settle(between(t, t0 + i * 0.14, t0 + i * 0.14 + 0.4));
    if (p <= 0) continue;
    g.save();
    g.translate(x + cw / 2, y + ch / 2); g.scale(lerp(0.8, 1, p), lerp(0.8, 1, p)); g.globalAlpha *= clamp01(p * 2);
    g.translate(-cw / 2, -ch / 2); g.scale(cw / W, ch / H);
    personScene(g, S.lyrics[20 + i].end + 0.3, S, i, { lyrics: false });
    g.restore();
  }
}

// ---------- chorus 2: the who plate becomes each person in turn ----------
// Weights for each person, in order of the chorus's eight lines.
const WEIGHTS = [
  { fast: 2.2, sturdy: 0.6, cheap: 1, wow: 2.2, keep: 0.5, now: 2, slow: 0.5, need: 1, show: 2 },         // demo: snappy, wow, now
  { fast: 1.2, sturdy: 2.2, cheap: 0.8, wow: 0.7, keep: 2.2, now: 0.8, slow: 1.6, need: 2.2, show: 0.6 },  // paying users: it lasts
  { fast: 2, sturdy: 0.5, cheap: 1.8, wow: 1.4, keep: 0.6, now: 1.8, slow: 0.5, need: 1.3, show: 1.1 },    // group chat bot: quick, cheap, fun
  { fast: 0.8, sturdy: 0.9, cheap: 1.6, wow: 0.6, keep: 0.6, now: 2.2, slow: 0.5, need: 2, show: 0.5 },    // uni project: pass, on time
  { fast: 0.9, sturdy: 1.8, cheap: 1, wow: 0.4, keep: 1.4, now: 0.6, slow: 1.4, need: 2.4, show: 0.3 },    // Nana: simple and dependable
  { fast: 1.3, sturdy: 1.6, cheap: 0.9, wow: 0.5, keep: 1.2, now: 0.9, slow: 1.2, need: 2.6, show: 0.3 },  // can't see screens: it has to speak
  { fast: 1.6, sturdy: 2.4, cheap: 1.2, wow: 0.3, keep: 1.6, now: 1, slow: 1, need: 1.6, show: 0.3 },      // agent bots: safe with data
  { fast: 0.9, sturdy: 1.8, cheap: 0.8, wow: 0.6, keep: 2.2, now: 0.5, slow: 2, need: 1.2, show: 0.8 },    // us: neat, lasting
];
const LI2 = 32;
function personIdx(S, t) {
  let k = 0;
  for (let i = 0; i < 8; i++) if (t >= S.lyrics[LI2 + i].start - 0.05) k = i;
  return k;
}

let MOB2 = null;
export function init(S) {
  const t0 = S.lyrics[LI2].start - 0.3, t1 = S.lyrics[LI2 + 7].end + 1;
  const mass = (key, t) => {
    if (key === 'who') return 2.2;
    if (key === 'what') return 1;
    const i = personIdx(S, t);
    return WEIGHTS[i][key];
  };
  const who = {
    draw: (g, t) => {
      const P = PEOPLE[personIdx(S, t)];
      paint(g, cut('who2-body', () => shape.smooth([[-78, 120], [-70, 22], [-44, -8], [44, -8], [70, 22], [78, 120]], 6)), P.plate || P.panel, { lift: 3.2, seed: 81 });
      paint(g, cut('who2-head', () => shape.ellipse(44, 48, 40, 0, -58)), P.plate || P.panel, { lift: 3.2, seed: 82 });
    },
    labelFn: t => PEOPLE[personIdx(S, t)].name,
    labelOnFn: t => S.lyrics[LI2 + personIdx(S, t)].start,
    labelColorFn: t => PEOPLE[personIdx(S, t)].ink, labelSize: 38, labelAt: [0, 62],
    spin: t => {
      // flip the plate over as each person arrives; they swap when it's edge-on
      const sw = S.lyrics[LI2 + personIdx(S, t)].start - 0.05;
      return TAU * smooth(between(t, sw - 0.2, sw + 0.4));
    },
  };
  MOB2 = makeMobile(chorusSpec(S, LI2, t0, t1, mass, who, true));
}

export function buildScenes(S) {
  const out = [];
  for (let i = 0; i < 8; i++) {
    const from = i === 0 ? 50.48 : S.lyrics[20 + i].start, to = i === 7 ? 72.48 : S.lyrics[21 + i].start;
    out.push({ from, to, draw: (g, t, S) => personScene(g, t, S, i) });
  }
  out.push({ from: 72.48, to: 76.54, draw: gallery });
  out.push({ from: 76.54, to: 80.76, draw: (g, t, S) => headScene(g, t, S, 28, { push: 0.06 }) });
  out.push({ from: 80.76, to: 82.96, draw: (g, t, S) => promptScene(g, t, S, 31) });
  out.push({ from: 82.96, to: 106.16, draw: (g, t, S) => chorusScene(g, t, S, MOB2, LI2) });
  return out;
}
