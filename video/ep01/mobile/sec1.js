// Section 1: the intro, verse 1's over-builds, the first pre-chorus and the first chorus's mobile.
// Every build in verse 1 is cut from Clawd's own orange sheet, so the sheet full of holes at "your
// quota's gone" shows what the effort was spent on.
import { PAL, TAU, W, H, cut, paint, pin, shape, at, hash, rng, clamp01, lerp, smooth, easeOut, easeIn, settle, between, wall, panel } from './paper.js';
import { clawd, danceBeat, scrap, appCard, lyric, handwrite } from './cast.js';
import { makeMobile, drawMobile } from './mobile.js';

const OR = [PAL.clawd, '#E58A62', '#C9643F', '#F0A57E'];   // Clawd's paper, in its shades

// word onset: the first word in line li whose text starts with `w`
export function on(S, li, w) {
  const x = S.lyrics[li].words.find(x => x.w.toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(w.toLowerCase()));
  return x && x.s !== null ? x.s : S.lyrics[li].start;
}

// ---------- props, all orange ----------
function cannon(g, x, y, s, rot, t, fire) {
  at(g, x, y, 0, s, () => {
    at(g, 0, -40, rot, 1, () => {
      const recoil = fire > 0 && fire < 0.4 ? -24 * Math.sin(Math.PI * fire / 0.4) : 0;
      paint(g, cut('barrel', () => shape.smooth([[-30, -46], [170, -36], [180, -40], [184, 40], [170, 36], [-30, 46], [-46, 30], [-46, -30]], 3)), OR[0], { lift: 1.2, seed: 21 });
      if (recoil) g.translate(recoil, 0);
      paint(g, cut('band', () => shape.rect(22, 90, 120, -45)), OR[2], { lift: 0.3, seed: 22 });
    });
    paint(g, cut('wheel', () => [shape.ellipse(58, 58, 40), shape.ellipse(14, 14, 16)]), OR[2], { lift: 1.4, seed: 23 });
  });
}

const confetti = (() => {
  const r = rng(77), parts = [];
  for (let i = 0; i < 90; i++) {
    const kind = i % 3;
    parts.push({ side: i % 2 ? 1 : -1, a: -Math.PI / 2 + (r() - 0.5) * 0.9, v: 1500 + r() * 900, spin: (r() - 0.5) * 5,
      kind, size: 22 + r() * 34, col: OR[i % 4], wob: r() * TAU, delay: r() * 0.12, seed: i });
  }
  return parts;
})();
const confettiShape = p => p.kind === 0 ? cut(`cs${p.seed}`, () => shape.star(5, p.size, p.size * 0.45))
  : p.kind === 1 ? cut(`ca${p.seed}`, () => shape.algae(p.size * 3.2, p.size * 1.4, 4, p.seed), { amp: 1.2 })
  : cut(`cc${p.seed}`, () => shape.ellipse(p.size * 0.55, p.size * 0.55, 20));

function drawConfetti(g, t0, t, origins) {
  const k = 2.6, gr = 1500;
  for (const p of confetti) {
    const dt = t - t0 - p.delay;
    if (dt <= 0) continue;
    const [ox, oy] = origins[p.side < 0 ? 0 : 1];
    const e = 1 - Math.exp(-k * dt);
    const vx = Math.cos(p.a) * p.v * (p.side < 0 ? 1 : -1) * 0.55 + p.side * -80, vy = Math.sin(p.a) * p.v;
    const x = ox + vx / k * e + Math.sin(dt * 3 + p.wob) * 40 * clamp01(dt), y = oy + (vy + gr / k) / k * e - gr * dt / k;
    if (y > H + 100) continue;
    at(g, x, y, p.spin * dt + p.wob, 1, () => paint(g, confettiShape(p), p.col, { lift: 1.6, seed: p.seed, tex: 0.8 }));
  }
}

// Confetti still drifting down long after the cannons: slow flutter from above the frame.
function driftConfetti(g, t, n = 26) {
  for (let i = 0; i < n; i++) {
    const p = confetti[i * 3 % confetti.length];
    const sp = 170 + hash(i + 1) * 140, y = -80 + ((t * sp + hash(i + 2) * 2200) % 2100);
    const x = 60 + hash(i + 3) * 960 + Math.sin(t * 1.6 + i) * 50;
    at(g, x, y, t * p.spin * 0.4 + p.wob, 1, () => paint(g, confettiShape(p), p.col, { lift: 1.8, seed: p.seed }));
  }
}

function padlock(g, x, y, s, p) {
  at(g, x, y - 300 * (1 - settle(p)), 0, s, () => {
    paint(g, cut('shackle', () => {
      const o = [], n = 24;
      for (let i = 0; i <= n; i++) { const a = Math.PI + Math.PI * i / n; o.push([Math.cos(a) * 105, -95 + Math.sin(a) * 120]); }
      for (let i = n; i >= 0; i--) { const a = Math.PI + Math.PI * i / n; o.push([Math.cos(a) * 70, -95 + Math.sin(a) * 85]); }
      o.push([-70, -40], [-105, -40]);
      return [[-105, -40], ...o.slice(0, n + 1), [105, -40], [70, -40], ...o.slice(n + 1, 2 * n + 2)];
    }), OR[2], { lift: 2, seed: 31 });
    paint(g, cut('lockbody', () => [shape.smooth([[-150, -70], [150, -70], [160, -60], [160, 150], [150, 160], [-150, 160], [-160, 150], [-160, -60]], 3),
      shape.smooth([[-16, 20], [16, 20], [20, 40], [9, 58], [9, 110], [-9, 110], [-9, 58], [-20, 40]], 3)]), OR[0], { lift: 2.2, seed: 32 });
  });
}

function chain(g, x0, y0, x1, y1, n, p, seed) {
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, q = clamp01(p * n - i);
    if (q <= 0) continue;
    const sag = Math.sin(u * Math.PI) * 60;
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u) + sag;
    const a = Math.atan2(y1 - y0, x1 - x0) + (i % 2 ? 0 : 0.0);
    at(g, x, y, a, lerp(1.3, 1, easeOut(q)), () => {
      if (i % 2) paint(g, cut('linkA', () => [shape.ellipse(52, 26, 30), shape.ellipse(34, 11, 24)], { amp: 1 }), OR[2], { lift: 1.6, seed: seed + i });
      else paint(g, cut('linkB', () => shape.rect(90, 14, -45, -7), { amp: 0.9 }), OR[0], { lift: 1.8, seed: seed + i });
    });
  }
}

function helm(g, x, y, s, rot, seed) {
  at(g, x, y, rot, s, () => {
    const spokes = cut('spokes', () => {
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU, b = a + 0.14;
        pts.push([Math.cos(a - 0.07) * 24, Math.sin(a - 0.07) * 24], [Math.cos(a - 0.05) * 104, Math.sin(a - 0.05) * 104],
          [Math.cos(a) * 118, Math.sin(a) * 118], [Math.cos(a + 0.05) * 104, Math.sin(a + 0.05) * 104], [Math.cos(a + 0.07) * 24, Math.sin(a + 0.07) * 24]);
      }
      return pts;
    }, { amp: 1 });
    paint(g, spokes, OR[2], { lift: 1.2, seed });
    paint(g, cut('rim', () => [shape.ellipse(86, 86, 56), shape.ellipse(62, 62, 48)], { amp: 1.2 }), OR[0], { lift: 1.4, seed: seed + 1 });
    paint(g, cut('hub', () => shape.ellipse(26, 26, 20)), OR[1], { lift: 1.5, seed: seed + 2 });
  });
}

function clockFace(g, x, y, r, t, speed) {
  paint(g, cut(`clock${r}`, () => shape.ellipse(r, r, 90)), PAL.white, { lift: 1, tex: 0.3, seed: 41 });
  for (let i = 0; i < 12; i++) at(g, x - x, 0, 0, 1, () => {});
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU;
    at(g, Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82, a + Math.PI / 2, 1, () => paint(g, cut(`tick${i % 3 === 0}`, () => shape.rect(i % 3 === 0 ? 14 : 9, i % 3 === 0 ? 46 : 28, -(i % 3 === 0 ? 7 : 4.5), -14)), PAL.black, { lift: 0.2, tex: 0.3, seed: i }));
  }
  at(g, 0, 0, t * speed, 1, () => paint(g, cut('minute', () => [[-10, 20], [-6, -r * 0.72], [0, -r * 0.8], [6, -r * 0.72], [10, 20]]), OR[2], { lift: 1, seed: 42 }));
  at(g, 0, 0, t * speed / 12 + 1, 1, () => paint(g, cut('hour', () => [[-13, 18], [-9, -r * 0.48], [0, -r * 0.55], [9, -r * 0.48], [13, 18]]), OR[0], { lift: 1.2, seed: 43 }));
  paint(g, cut('pinc', () => shape.ellipse(16, 16, 16)), PAL.black, { lift: 1.3, seed: 44 });
}

// ---------- the four tableaux, drawable at any scale (the recap reuses them) ----------
function tabFloss(g, S, t, full = true) {
  const tf = on(S, 1, 'floss');
  appCard(g, 540, 1020, 1.25, 'floss', { rot: 0.02, tick: between(t, tf, tf + 0.25), seed: 11 });
  const fire = t - tf - 0.12;
  const pop = (w, d) => settle(between(t, on(S, 1, w) + d, on(S, 1, w) + d + 0.35));
  at(g, 0, 0, 0, 1, () => {
    if (pop('confetti', 0) > 0) at(g, 170, 1560, 0, pop('confetti', 0), () => cannon(g, 0, 0, 1.2, -1.05, t, fire));
    if (pop('cannons', 0) > 0) at(g, 910, 1560, 0, pop('cannons', 0), () => { g.scale(-1, 1); cannon(g, 0, 0, 1.2, -1.05, t, fire); });
  });
  if (fire > 0 && full) drawConfetti(g, tf + 0.12, t, [[260, 1380], [820, 1380]]);
}

function tabGym(g, S, t) {
  appCard(g, 540, 1060, 1.25, 'gym', { rot: -0.02, seed: 12 });
  const t2 = on(S, 2, '2fa');
  const p = between(t, t2 - 0.05, t2 + 0.4);
  if (t >= on(S, 2, 'use') - 0.1) chain(g, 150, 760, 930, 1330, 11, between(t, on(S, 2, 'use') - 0.1, on(S, 2, 'use') + 0.5), 50);
  if (t >= on(S, 2, 'gym')) chain(g, 930, 700, 170, 1400, 11, between(t, on(S, 2, 'gym'), on(S, 2, 'gym') + 0.5), 70);
  if (p > 0) padlock(g, 540, 1130, 1.25, p);
}

function tabBlog(g, S, t) {
  appCard(g, 700, 1480, 0.7, 'blog', { rot: 0.03, seed: 13 });
  const t0 = on(S, 3, 'kubernetes') - 0.05;
  const n = Math.min(9, Math.floor((t - t0) / (S.beat) ) + 1);
  for (let i = 0; i < n && t >= t0; i++) {
    const ti = t0 + i * S.beat, p = settle(between(t, ti, ti + 0.3));
    const x = 700 + (i % 2 ? 70 : -60) + Math.sin(i * 1.7) * 30, y = 1230 - i * 150;
    helm(g, x, y - 80 * (1 - p), lerp(1.5, 1.05, p), i * 0.4 + (t - ti) * 0.6, 60 + i);
  }
}

function tabClock(g, S, t, full = true) {
  const t0 = S.lyrics[4].start;
  at(g, 540, 1000, 0, 1, () => clockFace(g, 540, 1000, 230, t - t0, 14));
  const ring = (t - t0) * 0.55;
  for (let i = 0; i < 12; i++) {
    const tp = on(S, 4, 'twelve') + i * 0.045;
    const p = settle(between(t, tp, tp + 0.3));
    if (p <= 0) continue;
    const a = i / 12 * TAU + ring, R = 385;
    const d = danceBeat(S, t, 1, i % 2 ? 0.5 : 0);
    clawd(g, 540 + Math.cos(a) * R, 1000 + Math.sin(a) * R * 1.0 + 40, 0.62 * p,
      { ...d, armL: 1.05 + d.armL * 0.2, armR: 1.05 + d.armR * 0.2, eyes: 'happy', seed: 100 + i, lift: 1.2 });
  }
}

// ---------- the sheet: every build was cut from it ----------
function holeySheet() {
  return cut('holey', () => {
    const outer = shape.rect(640, 840, -320, -420);
    const holes = [];
    holes.push(shape.move(shape.star(5, 70, 30), -170, -280, 0.2));
    holes.push(shape.move(shape.algae(170, 70, 4, 3), 170, -270, 0.5));
    holes.push(shape.move(shape.smooth([[-95, -60], [95, -60], [100, -50], [100, 90], [90, 100], [-90, 100], [-100, 90], [-100, -50]], 3), -140, -40, -0.1));
    holes.push(shape.move(shape.ellipse(80, 80, 40), 150, -20));
    holes.push(shape.move(shape.rect(150, 40, -75, -20), 120, 150, 0.4));
    for (let i = 0; i < 12; i++) {
      const cx = -250 + (i % 6) * 100, cy = 250 + Math.floor(i / 6) * 110;
      holes.push(shape.move([[-30, -30], [30, -30], [30, 10], [22, 10], [22, 24], [12, 24], [12, 10], [-12, 10], [-12, 24], [-22, 24], [-22, 10], [-30, 10]], cx, cy, (hash(i) - 0.5) * 0.3));
    }
    holes.push(shape.move(shape.star(4, 40, 16), -60, 150, 0.3));
    return [outer, ...holes];
  }, { amp: 2 });
}

// ---------- the profile: your head, solid paper ----------
function head() {
  return cut('head', () => shape.smooth([
    [470, -200], [260, -210], [120, -150], [40, -40], [10, 70], [-5, 170], [-20, 205], [0, 250], [-10, 330],
    [-95, 430], [-80, 455], [-35, 462], [-30, 480], [-55, 520], [-35, 548], [-55, 575], [-30, 610], [-40, 665],
    [10, 725], [110, 760], [140, 880], [120, 1100], [700, 1100], [700, -200]], 5), { amp: 2.4 });
}

// ---------- the mobile ----------
export function personPlate(col = PAL.white, key = 'who') {
  return g => {
    paint(g, cut(`${key}-body`, () => shape.smooth([[-78, 120], [-70, 22], [-44, -8], [44, -8], [70, 22], [78, 120]], 6)), col, { lift: 3.2, seed: 81 });
    paint(g, cut(`${key}-head`, () => shape.ellipse(44, 48, 40, 0, -58)), col, { lift: 3.2, seed: 82 });
  };
}
const plateOf = (key, fn, col, lift = 3.2) => g => paint(g, cut(key, fn), col, { lift, seed: key.length * 7 });

// The plates for one chorus. li0 is the chorus's first lyric line; mass(key) gives each option's
// weight over time (who it's for decides it).
export function chorusSpec(S, li0, t0, t1, mass, who = {}, present = false) {
  const o = present ? () => t0 - 10 : (i, w) => on(S, li0 + i, w);
  const P = (key, i, w, draw, extra = {}) => ({ key, on: o(i, w), labelOn: o(i, w), draw, mass: t => mass(key, t), label: key, ...extra });
  return {
    x: 450, y: 470, armL: 240, armR: 220, t0, t1, plateScale: 1.1,
    breeze: (t, i) => 0.06 * Math.sin(t * 0.8 + i * 1.9) + 0.03 * Math.sin(t * 1.7 + i),
    who: { key: 'who', on: o(0, 'who'), labelOn: o(0, 'who'), draw: personPlate(), mass: t => mass('who', t), label: 'who?', labelAt: [0, 62], labelColor: PAL.black, labelSize: 44, hang: 90,
      spin: t => TAU * smooth(between(t, on(S, li0 + 4, 'who'), on(S, li0 + 4, 'who') + 0.9)), ...who },
    what: { key: 'what', on: o(1, 'what'), labelOn: o(1, 'what'), draw: plateOf('whatd', () => shape.ellipse(74, 74, 48), PAL.white), mass: t => mass('what', t), label: 'what?', labelColor: PAL.black, labelSize: 40, hang: 80, r: 74 },
    rows: [
      { half: 240, gap: 170,
        L: P('fast', 2, 'fast', plateOf('fastd', () => shape.smooth([[-105, 0], [-40, -42], [60, -32], [115, 0], [60, 32], [-40, 42]], 5), PAL.red), { labelSize: 40 }),
        R: { half: 100, gap: 50,
          L: P('sturdy', 2, 'sturdy', plateOf('sturdyd', () => shape.rect(146, 128, -73, -64), PAL.blue), { labelSize: 34 }),
          R: P('cheap', 2, 'cheap', plateOf('cheapd', () => shape.ellipse(62, 62, 40), PAL.yellow), { labelColor: PAL.black, labelSize: 32 }) } },
      { half: 140, gap: 320,
        L: P('wow', 3, 'wow', plateOf('wowd', () => shape.star(7, 92, 48), PAL.pink), { labelSize: 38, hang: 80 }),
        R: P('keep', 3, 'keep', plateOf('keepd', () => shape.smooth([[0, -92], [48, -40], [52, 30], [18, 88], [-18, 88], [-52, 30], [-48, -40]], 6), PAL.green), { labelSize: 36, hang: 80 }) },
      { half: 240, gap: 215,
        L: P('now', 6, 'now', plateOf('nowd', () => [[-100, -18], [100, -18], [68, 46], [-68, 46]], PAL.teal), { labelSize: 34, labelAt: [0, 12], hang: 60 }),
        R: P('slow', 6, 'slow', plateOf('slowd', () => shape.ellipse(62, 62, 40), PAL.white), { labelColor: PAL.black, labelSize: 32 }) },
      { half: 140, gap: 205,
        L: P('need', 7, 'need', plateOf('needd', () => shape.rect(104, 104, -52, -52), PAL.violet), { labelSize: 32 }),
        R: P('show', 7, 'show', plateOf('showd', () => shape.star(9, 104, 58), PAL.yellow), { labelColor: PAL.black, labelSize: 36, hang: 80 }) },
    ],
  };
}

// Chorus 1: nobody's said who, so the weights are anyone's guess and the mobile hangs lopsided.
const MASS1 = { who: 0.35, what: 1, fast: 1, sturdy: 1.4, cheap: 0.6, wow: 1.3, keep: 1, now: 1, slow: 1.25, need: 0.8, show: 1.5 };
let MOB1 = null;
export function init(S) {
  const t0 = S.lyrics[12].start - 0.2, t1 = S.lyrics[19].end + 1;
  MOB1 = makeMobile(chorusSpec(S, 12, t0, t1, k => MASS1[k]));
}

// ---------- scenes ----------
const CREAM = PAL.cream;
export const scenes = [
  // Intro, on a blue Jazz plate: the blank scrap, Clawd and its sheet of orange paper. The prompt
  // writes itself as it's sung.
  { from: 0, to: 4.52, draw(g, t, S) {
    wall(g); panel(g, PAL.blue, { seed: 2 });
    at(g, 800, 1230, 0.06, 1, () => {
      paint(g, cut('sheet-intro', () => shape.rect(300, 400, -150, -200)), PAL.clawd, { lift: 1, seed: 5 });
      pin(g, 0, -178, PAL.yellow, 0.9);
    });
    scrap(g, 470, 520, 1.3, 'make it good', { rot: -0.05, p: between(t, on(S, 0, 'make'), on(S, 0, 'good') + 0.3) });
    const up = on(S, 0, 'made');
    const pr = settle(between(t, up, up + 0.4));
    const d = danceBeat(S, t, 0.5 * pr);
    clawd(g, 400, 1640, 2.6, { eyes: t > up ? 'happy' : 'slit', armL: lerp(-0.2, 1.2, pr) + d.armL * 0.3, armR: lerp(-0.2, 1.2, pr) + d.armR * 0.3, hop: d.hop, squash: d.squash, look: t > up ? 0 : -0.4, lift: 1.4 });
    lyric(g, t, S.lyrics[0], { x: 110, y: 900, w: 880, size: 124, color: CREAM, accent: { good: PAL.yellow } });
  } },
  // Verse 1, one build per line, each on its own plate.
  { from: 4.52, to: 8.0, draw(g, t, S) {
    wall(g); panel(g, PAL.blue, { seed: 3 }); tabFloss(g, S, t);
    clawd(g, 800, 1700, 1.2, { eyes: t > on(S, 1, 'floss') ? 'happy' : 'slit', ...danceBeat(S, t, 0.6), look: -0.6, lift: 1.4 });
    lyric(g, t, S.lyrics[1], { x: 110, y: 330, w: 880, size: 104, color: CREAM, accent: { confetti: PAL.yellow, floss: PAL.yellow } });
  } },
  { from: 8.0, to: 10.76, draw(g, t, S) {
    wall(g); panel(g, PAL.green, { seed: 4 }); tabGym(g, S, t);
    lyric(g, t, S.lyrics[2], { x: 110, y: 330, w: 880, size: 110, color: CREAM, accent: { '2fa': PAL.yellow } });
  } },
  { from: 10.76, to: 13.2, draw(g, t, S) {
    wall(g); panel(g, PAL.black, { seed: 5 }); tabBlog(g, S, t);
    clawd(g, 300, 1690, 1.3, { eyes: 'happy', ...danceBeat(S, t, 0.8), look: 0.6, lift: 1.4 });
    lyric(g, t, S.lyrics[3], { x: 110, y: 350, w: 460, size: 92, color: CREAM, accent: { kubernetes: PAL.yellow } });
  } },
  { from: 13.2, to: 15.64, draw(g, t, S) {
    wall(g); panel(g, PAL.teal, { seed: 6 }); tabClock(g, S, t);
    lyric(g, t, S.lyrics[4], { x: 540, y: 1570, w: 900, size: 88, align: 'center', color: CREAM, accent: { twelve: PAL.yellow } });
  } },
  // "Did I do it wrong?": back on the bare wall, close on Clawd, the last confetti still falling.
  { from: 15.64, to: 17.04, draw(g, t, S) {
    wall(g);
    driftConfetti(g, t);
    const l = Math.sin((t - 15.64) * 3.2);
    clawd(g, 540, 1480, 4.2, { eyes: 'worried', look: 0.5 * l, armL: -0.8, armR: -0.8, lift: 1.5 });
    lyric(g, t, S.lyrics[5], { x: 540, y: 500, w: 900, size: 116, align: 'center' });
  } },
  // "Oops, your quota's gone!" — the sheet it was all cut from, lace now; it unpins and falls.
  { from: 17.04, to: 18.66, draw(g, t, S) {
    wall(g);
    const tg = on(S, 6, 'gone'), f = Math.max(0, t - tg);
    const x = 540 + Math.sin(f * 3) * 40 * f, y = 860 + 260 * f * f, r = 0.03 + Math.sin(f * 2.4) * 0.25 * clamp01(f * 2);
    at(g, x, y, r, 1, () => {
      paint(g, holeySheet(), PAL.clawd, { lift: 1 + f * 2, seed: 9 });
      if (f === 0) pin(g, 0, -395, PAL.black);
    });
    clawd(g, 190, 1780, 1.2, { eyes: t > tg ? 'sad' : 'worried', armL: -0.9, armR: -0.9, look: 0.6 });
    lyric(g, t, S.lyrics[6], { x: 540, y: 1560, w: 980, size: 104, align: 'center', accent: { gone: PAL.red } });
  } },
  // "Guess I didn't ask!": Clawd peeks over the lace it's holding up, sheepish.
  { from: 18.66, to: 20.8, draw(g, t, S) {
    wall(g);
    const p = settle(between(t, 18.66, 19.1));
    clawd(g, 540, 1380, 3.0, { eyes: 'worried', look: 0.35, armL: 0.9, armR: 0.9, squash: 0.06, lift: 1.3 });
    at(g, 540, 1560 + 60 * (1 - p), -0.05, 0.72, () => paint(g, holeySheet(), PAL.clawd, { lift: 2.4, seed: 9 }));
    lyric(g, t, S.lyrics[7], { x: 540, y: 520, w: 900, size: 108, align: 'center' });
  } },
  // Pre-chorus: your head, solid blue paper; Clawd with the scrap.
  { from: 20.8, to: 25.04, draw: (g, t, S) => headScene(g, t, S, 8) },
  // "I'm only reading your prompt.": the scrap is all there is. The band stops on "prompt".
  { from: 25.04, to: 27.2, draw: (g, t, S) => promptScene(g, t, S, 11) },
  // Chorus 1: the mobile.
  { from: 27.2, to: 50.48, draw: (g, t, S) => chorusScene(g, t, S, MOB1, 12) },
];

// The pre-chorus: li0 is its first line ("You didn't tell me who it's for").
export function headScene(g, t, S, li0, { push = 0 } = {}) {
  wall(g);
  const cr = on(S, li0 + 2, 'read');
  const lean = smooth(between(t, cr - 0.2, cr + 0.3));
  const z = 1 + push * between(t, S.lyrics[li0].start, S.lyrics[li0 + 2].end);
  g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  at(g, 470, 330, 0, 1, () => paint(g, head(), PAL.blue, { lift: 1.2, seed: 12 }));
  const cx = lerp(240, 320, lean);
  clawd(g, cx, 1780, 1.9, { eyes: lean > 0.5 ? 'worried' : 'slit', armL: 1.3, armR: 1.3, look: 0.7, rot: 0.1 * lean });
  scrap(g, cx, 1380, 0.85, 'make it good', { rot: 0.08, pinned: false, lift: 2 });
  g.restore();
  const li = t < S.lyrics[li0 + 1].start ? li0 : t < S.lyrics[li0 + 2].start ? li0 + 1 : li0 + 2;
  lyric(g, t, S.lyrics[li], { x: 570, y: 760, w: 470, size: 90, color: PAL.white, out: S.lyrics[li].end + 0.4 }, li);
}

export function promptScene(g, t, S, li) {
  wall(g);
  const t0 = S.lyrics[li].start, p = settle(between(t, t0, t0 + 0.46));
  scrap(g, 540, 820, lerp(2.0, 2.15, p), 'make it good', { rot: -0.04, pinned: true });
  lyric(g, t, S.lyrics[li], { x: 540, y: 1330, w: 960, size: 108, align: 'center', accent: { prompt: PAL.blue } }, li);
}

export function chorusScene(g, t, S, M, li0, { accent = { who: PAL.red, what: PAL.blue } } = {}) {
  wall(g);
  drawMobile(g, M, t);
  const li = S.lyrics.findIndex((l, i) => i >= li0 && i <= li0 + 7 && t >= l.start - 0.05 && t < (S.lyrics[i + 1]?.start ?? 999) - 0.05);
  if (li >= 0) lyric(g, t, S.lyrics[li], { x: 540, y: 210, w: 980, size: 84, align: 'center', accent }, li);
}
