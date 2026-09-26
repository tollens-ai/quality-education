// Section 4: the plea, the final chorus (your answers, written on the back of the scrap as the
// questions are sung, while the mobile takes the weights and comes to rest) and the summer outro,
// where the toy blows away and the brief stays.
import { PAL, TAU, W, H, cut, paint, pin, shape, at, hash, clamp01, lerp, smooth, easeOut, easeIn, settle, between, wall, panel } from './paper.js';
import { clawd, danceBeat, lyric, scrap, handwrite, letters, HAND } from './cast.js';
import { makeMobile, drawMobile } from './mobile.js';
import { on, chorusSpec, headScene } from './sec1.js';

const LI3 = 53;

// ---------- your hand and pen ----------
function blueHand(g, x, y, s, rot) {
  at(g, x, y, rot, s, () => paint(g, cut('bhand', () => shape.smooth([[300, -60], [60, -70], [0, -95], [-70, -92], [-80, -70], [-20, -58], [-95, -50], [-100, -25], [-25, -22], [-100, -12], [-98, 12], [-22, 8], [-88, 26], [-80, 46], [-10, 38], [60, 60], [300, 70]], 5), { amp: 2 }), PAL.blue, { lift: 2.2, seed: 14 }));
}
function pen(g, x, y, s, rot) {
  at(g, x, y, rot, s, () => {
    paint(g, cut('penbody', () => [[-12, -260], [12, -260], [12, -30], [-12, -30]], { amp: 0.8 }), PAL.black, { lift: 2.6, seed: 2 });
    paint(g, cut('pentip', () => [[-12, -30], [12, -30], [0, 12]], { amp: 0.5 }), PAL.yellow, { lift: 2.6, seed: 3 });
  });
}

// ---------- the brief ----------
// Each line: [chorus line it answers (offset from LI3), label, text]. The outro adds the last one,
// only when it's sung.
const BRIEF = [
  [0, 'for:', 'me, mid-set, one sweaty hand'],
  [1, 'good =', 'log a set in one tap · ', 'flame', ' on a PB'],
  [2, 'cost:', "don't burn my quota"],
  [3, "don't need:", 'accounts, scale'],
  [11, '', "fine if it's gone after summer"],
  [4, 'for you:', 'diags you can read'],
  [5, '', 'ask me if unsure'],
];

function flame(g, x, y, s) {
  at(g, x, y, 0, s, () => {
    paint(g, cut('flame', () => shape.smooth([[0, -40], [18, -12], [22, 12], [0, 26], [-22, 12], [-18, -14], [-8, -4]], 5), { amp: 0.8 }), PAL.red, { lift: 0.4, seed: 5 });
    paint(g, cut('flame2', () => shape.smooth([[0, -12], [9, 4], [0, 18], [-9, 4]], 5), { amp: 0.5 }), PAL.yellow, { lift: 0.2, seed: 6 });
  });
}

function writeAt(S, k) {
  // A brief line is written just after its question is sung.
  const li = LI3 + k;
  if (k === 11) return on(S, 64, 'gone');
  const L = S.lyrics[li];
  return (L.words.filter(w => !w.backing).slice(-1)[0].e ?? L.end) - 0.1;
}

function briefCard(g, t, S, x, y, s) {
  at(g, x, y, -0.012, s, () => {
    const w = 1000, h = 600;
    paint(g, cut('briefcard', () => {
      const pts = [];
      for (let i = 0; i <= 20; i++) pts.push([-w / 2 + w * i / 20, -h / 2 + (hash(i) - 0.5) * 8]);
      for (let i = 0; i <= 10; i++) pts.push([w / 2 + (hash(30 + i) - 0.5) * 10, -h / 2 + h * i / 10]);
      for (let i = 20; i >= 0; i--) pts.push([-w / 2 + w * i / 20, h / 2 + (hash(60 + i) - 0.5) * 16]);
      return pts;
    }, { amp: 1.4 }), PAL.scrap, { lift: 1.2, tex: 0.3, seed: 5 });
    g.save(); g.strokeStyle = 'rgba(80,120,190,0.22)'; g.lineWidth = 2;
    for (let yy = -h / 2 + 90; yy < h / 2; yy += 74) { g.beginPath(); g.moveTo(-w / 2 + 6, yy); g.lineTo(w / 2 - 6, yy); g.stroke(); }
    g.restore();
    pin(g, -w / 2 + 40, -h / 2 + 30, PAL.red); pin(g, w / 2 - 40, -h / 2 + 30, PAL.red);
    BRIEF.forEach(([k, label, ...parts], r) => {
      const t0 = writeAt(S, k), p = between(t, t0, t0 + 1.3);
      if (p <= 0) return;
      const yy = -h / 2 + 80 + r * 74, size = 58;
      // the segments of the line: the label in red pencil, then the answer in ink
      const segs = [];
      if (label) segs.push({ text: label + ' ', col: PAL.red });
      for (const part of parts) segs.push(part === 'flame' ? { flame: true, n: 2 } : { text: part, col: PAL.ink });
      const total = segs.reduce((a, q) => a + (q.flame ? q.n : q.text.length), 0);
      let xx = -w / 2 + (label ? 44 : 84), used = 0;
      for (const q of segs) {
        const n = q.flame ? q.n : q.text.length, f = clamp01((p * total - used) / n);
        used += n;
        if (q.flame) { if (f > 0) flame(g, xx + 20, yy - 18, 1.05); xx += 46; continue; }
        g.font = `700 ${size}px ${HAND}`;
        const wq = g.measureText(q.text).width;
        if (f > 0) handwrite(g, q.text, xx, yy, size, f, q.col);
        xx += wq;
      }
    });
  });
}

// ---------- the mobile, taking your answers ----------
const NEUTRAL = { who: 0.4, what: 1, fast: 1, sturdy: 1, cheap: 1, wow: 1, keep: 1, now: 1, slow: 1, need: 1, show: 1 };
// your answers, and the chorus line (offset) at which each weight arrives
const YOURS = { who: [2.4, 0], fast: [1.6, 1], wow: [1.3, 1], cheap: [2.3, 2], sturdy: [0.8, 2], keep: [0.45, 11], now: [1.9, 6], slow: [0.6, 6], need: [2.1, 7], show: [0.6, 7] };
let MOB3 = null;
export function init(S) {
  const t0 = S.lyrics[LI3].start - 0.5, t1 = 200.8;
  const mass = (key, t) => {
    const y = YOURS[key];
    if (!y) return NEUTRAL[key];
    const ta = writeAt(S, y[1]) - 0.2;
    return lerp(NEUTRAL[key], y[0], smooth(between(t, ta, ta + 0.8)));
  };
  const you = {
    draw: (g, t) => {
      paint(g, cut('you-body', () => shape.smooth([[-78, 120], [-70, 22], [-44, -8], [44, -8], [70, 22], [78, 120]], 6)), PAL.blue, { lift: 3.2, seed: 81 });
      paint(g, cut('you-head', () => shape.ellipse(44, 48, 40, 0, -58)), PAL.blue, { lift: 3.2, seed: 82 });
      // mid-set: a dumbbell raised on one side
      at(g, 92, -10, -0.3, 0.8, () => {
        paint(g, cut('ydb', () => shape.rect(90, 12, -45, -6)), PAL.black, { lift: 3.4, seed: 1 });
        for (const sx of [-1, 1]) paint(g, cut(`ydbw${sx}`, () => shape.rect(18, 52, sx * 40 - 9, -26)), PAL.black, { lift: 3.4, seed: 2 });
      });
    },
    labelFn: t => t < writeAt(S, 0) ? 'who?' : 'me',
    labelOnFn: t => t < writeAt(S, 0) ? -1 : writeAt(S, 0),
    labelColorFn: t => t < writeAt(S, 0) ? PAL.black : PAL.cream,
    spin: t => TAU * smooth(between(t, writeAt(S, 0) - 0.35, writeAt(S, 0) + 0.35)),
  };
  const spec = chorusSpec(S, LI3, t0, t1, mass, you, true);
  // the breeze dies down as the answers arrive: it comes to rest; then summer wind in the outro
  spec.breeze = (t, i) => {
    const calm = 1 - smooth(between(t, 176, 183));
    const wind = smooth(between(t, 190.4, 192)) * 0.08 * Math.sin(t * 1.4 + i * 0.7);
    return calm * (0.06 * Math.sin(t * 0.8 + i * 1.9) + 0.03 * Math.sin(t * 1.7 + i)) + wind;
  };
  spec.y = 560; spec.plateScale = 0.86;
  // a shorter mobile, so the brief fits above it
  spec.rows.forEach(r => { r.gap *= 0.72; if (r.R.L) r.R.gap *= 0.72; });
  MOB3 = makeMobile(spec);
}

// ---------- summer ----------
function sun(g, t, p) {
  if (p <= 0) return;
  at(g, 820, 1720 + 400 * (1 - easeOut(p)), t * 0.05, 1.1, () => paint(g, cut('sun', () => shape.star(18, 190, 160), { amp: 2 }), PAL.yellow, { lift: 1, seed: 8 }));
}
const LEAVES = Array.from({ length: 10 }, (_, i) => ({ seed: i, x: 80 + hash(i) * 920, y: 1000 + hash(i + 3) * 800, col: [PAL.green, PAL.teal, PAL.pink][i % 3], rot: hash(i + 7) * TAU }));
function blowAway(t, t0, i) {
  // each piece lifts off in turn and sails up and to the right
  const tt = t - (t0 + i * 0.22);
  if (tt <= 0) return null;
  return { dx: 260 * tt * tt + 60 * tt, dy: -420 * tt * tt - 80 * tt, rot: tt * (i % 2 ? 1.8 : -1.5) };
}

// ---------- scenes ----------
export function buildScenes(S) {
  const L = i => S.lyrics[i];
  return [
    // The plea: the same head and scrap, and now your hand reaches for it.
    { from: 147.56, to: L(51).start, draw(g, t) {
      headScene(g, t, S, 49);
      const p = smooth(between(t, on(S, 50, 'what') - 0.6, on(S, 50, 'want') + 0.3));
      if (p > 0) blueHand(g, lerp(1300, 520, p), 1390, 1.1, 0.05);
    } },
    // "I can't read your mind": your hand turns the scrap over to its blank side.
    { from: L(51).start, to: L(52).start, draw(g, t) {
      wall(g);
      const f = between(t, L(51).start + 0.2, L(51).start + 1.0);
      const sy = Math.cos(f * Math.PI);
      at(g, 540, 900, 0, 1, () => {
        g.scale(1, Math.max(0.02, Math.abs(sy)));
        scrap(g, 0, 0, 2.0, sy > 0 ? 'make it good' : '', { rot: -0.03, pinned: false, lift: 2.2 });
      });
      blueHand(g, 1110, 960, 1.3, 0.1);
      clawd(g, 230, 1760, 1.8, { eyes: 'worried', look: 0.6, lift: 1.6 });
      lyric(g, t, L(51), { x: 540, y: 1390, w: 900, size: 110, align: 'center' }, 51);
    } },
    // "I'm only reading your prompt.": the blank side, and a pen, ready.
    { from: L(52).start, to: 160.5, draw(g, t) {
      wall(g);
      scrap(g, 540, 900, 2.0, '', { rot: -0.03, pinned: true, lift: 1.4 });
      const p = smooth(between(t, L(52).start, L(52).start + 1.6));
      pen(g, lerp(1100, 800, p), lerp(1000, 900, p), 1.2, 0.5);
      clawd(g, 230, 1760, 1.8, { eyes: t > 158.5 ? 'happy' : 'slit', look: 0.6, lift: 1.6 });
      lyric(g, t, L(52), { x: 540, y: 1390, w: 900, size: 110, align: 'center', accent: { prompt: PAL.blue } }, 52);
    } },
    // Final chorus and outro: the brief above, the mobile below it; then summer takes the toy.
    { from: 160.5, to: 201, draw(g, t) {
      wall(g);
      const summer = smooth(between(t, 190.2, 191.4));
      if (summer > 0) { g.save(); g.globalAlpha = summer; wall(g, '#F6C85F', 0.35); g.restore(); }
      const tg = on(S, 64, 'gone') + 0.9;
      sun(g, t, smooth(between(t, tg + 0.6, tg + 2.2)));
      // the mobile, blowing away piece by piece once the brief says it can go
      const b = blowAway(t, tg, 0);
      g.save();
      if (b) { g.translate(b.dx, b.dy); g.rotate(b.rot * 0.2); g.globalAlpha *= 1 - clamp01((t - tg) / 2.2); }
      g.translate(0, 360);
      if (!b || t - tg < 2.2) drawMobile(g, MOB3, t);
      g.restore();
      // summer leaves blow through with it
      if (summer > 0) LEAVES.forEach(l => {
        const bb = blowAway(t, 191, l.seed);
        const x = l.x + (bb ? bb.dx : 0) * 0.8 + Math.sin(t * 2 + l.seed) * 20, y = l.y + (bb ? bb.dy : 0) * 0.6;
        at(g, x, y, l.rot + (bb ? bb.rot : 0), 1, () => paint(g, cut(`leaf${l.seed}`, () => shape.algae(150, 64, 4, l.seed), { amp: 1.2 }), l.col, { lift: 2.4, seed: l.seed }));
      });
      const cen = smooth(between(t, tg + 0.4, tg + 1.8));
      briefCard(g, t, S, 540, lerp(520, 760, cen), lerp(1, 1.04, cen));
      const li = [53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64].find((i, k, a) => t >= L(i).start - 0.05 && t < (a[k + 1] ? L(a[k + 1]).start - 0.05 : 999));
      if (li) lyric(g, t, L(li), { x: 540, y: 150, w: 980, size: 70, align: 'center', accent: { who: PAL.red, what: PAL.blue, you: PAL.blue, that: PAL.red, fun: PAL.red, summer: PAL.red } }, li);
      // Clawd joins in at "just a toy", and stays, happy with the brief it was given
      const cp = settle(between(t, 190.4, 191));
      if (cp > 0) clawd(g, 210, 1800 + 300 * (1 - cp), 1.9, { eyes: 'happy', ...danceBeat(S, t, 0.8), look: 0.4, lift: 1.6 });
    } },
  ];
}
