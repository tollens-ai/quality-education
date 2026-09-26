// Section 3: the bridge, at night in Matisse's Icarus palette (deep blue, yellow stars), and the
// break: the definition, Clawd's "I'm someone too", the other bots, and debugging together.
import { PAL, TAU, W, H, cut, paint, pin, shape, at, hash, rng, clamp01, lerp, smooth, easeOut, easeIn, settle, between, wall, panel } from './paper.js';
import { clawd, danceBeat, lyric, letters, scrap, handwrite } from './cast.js';
import { figure } from './people.js';
import { PEOPLE } from './sec2.js';
import { on } from './sec1.js';

// ---------- night ----------
const STARS = (() => {
  const r = rng(303), s = [];
  for (let i = 0; i < 16; i++) s.push({ x: 90 + r() * 900, y: 190 + r() * 1100, n: 5 + Math.floor(r() * 3), r: 26 + r() * 30, rot: r() * TAU, seed: i });
  return s;
})();
function night(g, t) {
  wall(g); panel(g, PAL.night, { seed: 40 });
  for (const s of STARS) {
    const tw = 1 + 0.08 * Math.sin(t * 2.2 + s.seed * 1.3);
    at(g, s.x, s.y, s.rot, tw, () => paint(g, cut(`nstar${s.seed}`, () => shape.star(s.n, s.r, s.r * 0.42), { amp: 2.2 }), PAL.yellow, { lift: 1.2, seed: s.seed }));
  }
}

// A sheet of someone else's code: cream paper with scribbled lines.
function codeSheet(g, x, y, s, rot, seed) {
  at(g, x, y, rot, s, () => {
    paint(g, cut(`cs-${seed % 6}`, () => shape.rect(150, 196), { amp: 1.2, seed }), PAL.cream, { lift: 1.2, seed, tex: 0.3 });
    g.save(); g.strokeStyle = 'rgba(30,30,60,0.55)'; g.lineWidth = 5; g.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const ind = (hash(seed + i) * 3 | 0) * 14, len = 40 + hash(seed * 3 + i) * 60;
      g.beginPath(); g.moveTo(-58 + ind, -70 + i * 22); g.lineTo(-58 + ind + len, -70 + i * 22); g.stroke();
    }
    g.restore();
  });
}

// Towers of old code across the bottom: the training set.
function stacks(g, t, base = 1700) {
  const cols = [[120, 9], [290, 13], [470, 7], [650, 11], [830, 15], [980, 8]];
  cols.forEach(([x, n], c) => {
    for (let i = 0; i < n; i++) codeSheet(g, x + (hash(c * 20 + i) - 0.5) * 30, base - i * 44, 0.95, (hash(c * 31 + i) - 0.5) * 0.18, c * 40 + i);
  });
}

function plane(g, x, y, s, rot, col = PAL.cream) {
  at(g, x, y, rot, s, () => {
    paint(g, cut('plane', () => [[-70, -10], [80, 0], [-70, 34], [-40, 6]], { amp: 1 }), col, { lift: 2, seed: 3 });
    paint(g, cut('plane2', () => [[-70, -10], [80, 0], [-40, 6]], { amp: 0.8 }), '#E9DFC8', { lift: 0.4, seed: 4 });
  });
}

// Planes thrown over the wall on the beat, from the builders' side (left) into the unknown.
function throws(g, S, t, t0, t1, wallX, wallTop) {
  for (let k = 0; k < 12; k++) {
    const tk = t0 + k * S.beat * 2;
    if (tk > t1) break;
    const p = (t - tk) / 1.6;
    if (p < 0 || p > 1) continue;
    const x0 = 140 + hash(k) * 160, y0 = 1350 + hash(k + 5) * 150, x1 = wallX + 200 + hash(k + 9) * 200;
    const x = lerp(x0, x1, p), y = lerp(y0, 1300, p) - Math.sin(p * Math.PI) * (y0 - wallTop + 220);
    const dx = x1 - x0, dy = -Math.cos(p * Math.PI) * Math.PI * (y0 - wallTop + 220);
    if (x > wallX - 40 && y > wallTop - 20) continue;   // gone over, out of sight
    plane(g, x, y, 0.9, Math.atan2(dy, dx) * 0.6);
  }
}

function blackWall(g, x, top, sink = 0) {
  g.save();
  g.beginPath(); g.rect(0, 0, W, 1772); g.clip();     // it sinks behind the bottom edge of the plate
  at(g, x, top + sink, 0, 1, () => paint(g, cut(`bwall-${x}-${top}`, () => shape.rect(1026 - x, 1772 - top, 0, 0), { amp: 2.4 }), PAL.black, { lift: 1.6, seed: 8 }));
  g.restore();
}

// ---------- the break ----------
const DEF = [['Software'], ['quality', 'is'], ['value', 'to'], ['someone'], ['who', 'matters']];
function definition(g, t, S, { y0 = 330, size = 150, alpha = 1 } = {}) {
  const words = S.lyrics[44].words;
  let wi = 0;
  const cols = { value: PAL.red, someone: PAL.blue, matters: PAL.red };
  DEF.forEach((row, ri) => {
    g.font = `800 ${size}px Bricolage`;
    const widths = row.map(w => g.measureText(w).width), sp = size * 0.26;
    const tot = widths.reduce((a, b) => a + b, 0) + sp * (row.length - 1);
    let x = 540 - tot / 2;
    row.forEach((w, k) => {
      const ws = words[wi++].s;
      const p = (t - ws) / 0.18;
      if (p > 0) {
        g.save(); g.globalAlpha = alpha * clamp01(p * 3);
        const sc = lerp(1.25, 1, settle(p));
        g.translate(x + widths[k] / 2, y0 + ri * size * 1.05 - size * 0.35); g.scale(sc, sc); g.translate(-widths[k] / 2, size * 0.35);
        letters(g, w, 0, 0, size, cols[w] || PAL.black, lerp(3, 0.8, easeOut(p)), ri * 17 + k * 5);
        g.restore();
      }
      x += widths[k] + sp;
    });
  });
}

function credit(g, t) {
  const p = settle(between(t, 129.2, 129.7)) * (1 - between(t, 134.5, 134.7));
  if (p <= 0) return;
  at(g, 540, 1540, -0.015, lerp(0.9, 1, p), () => {
    g.globalAlpha *= clamp01(p * 2);
    paint(g, cut('credit', () => shape.rect(760, 96), { amp: 1.2 }), PAL.white, { lift: 1.2, seed: 9, tex: 0.3 });
    g.font = '600 38px Bricolage'; g.fillStyle = PAL.black; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('after Weinberg · Bach & Bolton · via Ed Pringle', 0, 2);
    pin(g, 0, -34, PAL.red, 0.7);
  });
}

function heart(g, x, y, s, lift = 2) {
  at(g, x, y, 0, s, () => paint(g, cut('heart', () => shape.smooth([[0, -30], [30, -70], [75, -50], [70, 5], [0, 70], [-70, 5], [-75, -50], [-30, -70]], 5)), PAL.red, { lift, seed: 12 }));
}

// An official mark on a white card, exactly as provided, pinned to the wall.
function markCard(g, S, key, x, y, s, rot, p) {
  const im = S.img && S.img[key];
  at(g, x, y - 200 * (1 - settle(p)), rot, s * lerp(1.2, 1, settle(p)), () => {
    g.globalAlpha *= clamp01(p * 3);
    paint(g, cut('mcard', () => shape.rect(230, 230), { amp: 1.4 }), PAL.white, { lift: 2, seed: 13, tex: 0.25 });
    if (im) {
      const k = Math.min(170 / im.width, 170 / im.height);
      g.drawImage(im, -im.width * k / 2, -im.height * k / 2, im.width * k, im.height * k);
    }
    heart(g, 0, -150, 0.28, 1);   // pinned above the card, outside the mark's space
  });
}

function blueHand(g, x, y, s, rot) {
  at(g, x, y, rot, s, () => {
    paint(g, cut('bhand', () => shape.smooth([[300, -60], [60, -70], [0, -95], [-70, -92], [-80, -70], [-20, -58], [-95, -50], [-100, -25], [-25, -22], [-100, -12], [-98, 12], [-22, 8], [-88, 26], [-80, 46], [-10, 38], [60, 60], [300, 70]], 5), { amp: 2 }), PAL.blue, { lift: 2, seed: 14 });
  });
}

// ---------- scenes ----------
export function buildScenes(S) {
  const L = i => S.lyrics[i];
  const CREAM = PAL.cream;
  return [
    // "I could only learn from my training set": Clawd on the towers of other people's code.
    { from: 106.16, to: L(41).start, draw(g, t) {
      night(g, t);
      stacks(g, t);
      for (let i = 0; i < 6; i++) {    // sheets drifting down, still arriving
        const y = 560 + ((t - 106) * 110 + i * 190) % 700, x = 150 + hash(i + 40) * 780 + Math.sin(t + i) * 40;
        codeSheet(g, x, y, 0.7, Math.sin(t * 0.8 + i) * 0.4, 90 + i);
      }
      clawd(g, 830, 1700 - 15 * 44 - 80, 1.5, { eyes: 'slit', look: -0.3, armL: 0.9, armR: 0.9, lift: 1.8 });
      codeSheet(g, 830, 1700 - 15 * 44 - 220, 0.85, 0.05, 7);
      lyric(g, t, L(40), { x: 540, y: 360, w: 900, size: 92, align: 'center', color: CREAM, backingColor: PAL.yellow }, 40);
    } },
    // "to write code and throw it over the wall": planes go over; nobody sees where they land.
    { from: L(41).start, to: L(42).start, draw(g, t) {
      night(g, t);
      blackWall(g, 640, 760);
      throws(g, S, t, L(41).start - 0.3, L(42).start, 640, 760);
      const th = on(S, 41, 'throw'), p = between(t, th - 0.2, th + 0.3);
      clawd(g, 300, 1720, 1.9, { eyes: 'slit', look: 0.6, armR: lerp(0.2, 1.6, easeOut(p)), armL: 0.2, lift: 1.6 });
      lyric(g, t, L(41), { x: 110, y: 360, w: 860, size: 90, color: CREAM, backingColor: PAL.yellow }, 41);
    } },
    // "But how do you know what to build or test": Clawd, holding a plane, looking at the wall.
    { from: L(42).start, to: L(43).start, draw(g, t) {
      night(g, t);
      blackWall(g, 640, 760);
      const b = Math.sin((t - L(42).start) * 1.3);
      clawd(g, 380, 1660, 3.0, { eyes: 'worried', look: 0.4 + 0.3 * b, armL: 0.3, armR: 1.0, lift: 1.6 });
      plane(g, 380 + 190, 1660 - 280, 1.6, -0.2);
      lyric(g, t, L(42), { x: 110, y: 360, w: 860, size: 96, color: CREAM, backingColor: PAL.yellow, accent: { build: PAL.yellow, test: PAL.yellow } }, 42);
    } },
    // "if you're not thinking about who it's for?": the wall sinks, and there they are.
    { from: L(43).start, to: 128.8, draw(g, t) {
      night(g, t);
      const tw = on(S, 43, 'who');
      const sink = 1300 * easeIn(between(t, tw - 0.6, tw + 0.9));
      PEOPLE.forEach((P, i) => {
        const x = 470 + (i % 4) * 150 + (i >= 4 ? 30 : 0), y = i >= 4 ? 1640 : 1250;
        const lit = smooth(between(t, tw + 0.3 + i * 0.12, tw + 0.8 + i * 0.12));
        const col = lit > 0.5 ? (P.plate || P.panel) : PAL.black;
        if (i === 2) at(g, x, y - 130, 0, 1, () => paint(g, cut('mini-bubble', () => shape.smooth([[-80, -60], [80, -60], [90, 40], [-30, 40], [-60, 80], [-50, 40], [-90, 40]], 3)), col, { lift: 1.4, seed: 5 }));
        else if (i === 6) at(g, x, y, 0, 1, () => figure(g, 0, 0, 0.62, col, {}, 'mini'));
        else figure(g, x, y, 0.62, col, { armL: 0.2 + i * 0.05, armR: 0.3, hat: i === 3 ? 'mortar' : i === 4 ? 'bun' : null }, 'mini');
        if (lit > 0) plane(g, x + 40, y - 160 - 20 * lit, 0.55, -0.3);
      });
      blackWall(g, 380, 700, sink);
      clawd(g, 210, 1720, 1.6, { eyes: t > tw ? 'wide' : 'worried', look: 0.8, lift: 1.6 });
      lyric(g, t, L(43), { x: 540, y: 260, w: 900, size: 92, align: 'center', color: CREAM, accent: { who: PAL.yellow, for: PAL.yellow } }, 43);
    } },
    // The definition, word by word: the biggest type in the film.
    { from: 128.8, to: L(46).start, draw(g, t) {
      wall(g);
      definition(g, t, S);
      credit(g, t);
      // "(matters, matters, matters)": the people pinned under it, a group on each "matters"
      const ms = S.lyrics[45].words.map(w => w.s);
      PEOPLE.forEach((P, i) => {
        const grp = i < 3 ? 0 : i < 6 ? 1 : 2, p = settle(between(t, ms[grp], ms[grp] + 0.35));
        if (p <= 0) return;
        const x = 130 + i * 117, y = 1640;
        at(g, x, y - 60 * (1 - p), 0, 1, () => {
          g.globalAlpha *= clamp01(p * 3);
          if (i === 2) paint(g, cut('mini-bubble', () => shape.smooth([[-80, -60], [80, -60], [90, 40], [-30, 40], [-60, 80], [-50, 40], [-90, 40]], 3)), P.panel, { lift: 1.4, seed: 5 });
          else if (i === 7) clawd(g, 0, 0, 0.8, { eyes: 'happy', lift: 1.4 });
          else figure(g, 0, 0, 0.45, P.plate || P.panel, { hat: i === 3 ? 'mortar' : i === 4 ? 'bun' : null }, 'mini');
        });
      });
    } },
    // "I'm someone too!": Clawd gets Icarus's red heart.
    { from: L(46).start, to: L(47).start, draw(g, t) {
      wall(g);
      const th = on(S, 46, 'too'), p = settle(between(t, th - 0.1, th + 0.35));
      clawd(g, 540, 1500, 4.4, { eyes: t > th ? 'happy' : 'slit', armL: lerp(-0.2, 1.3, p), armR: lerp(-0.2, 1.3, p), lift: 1.8 });
      if (p > 0) heart(g, 540, 1500 - 220 - 60 * (1 - p), lerp(2.2, 1.3, p), 2.5);
      lyric(g, t, L(46), { x: 540, y: 470, w: 900, size: 132, align: 'center', accent: { someone: PAL.blue, too: PAL.red } }, 46);
    } },
    // "(And me! And me! And me!)": the other agents, their own marks, pinned beside Clawd.
    { from: L(47).start, to: L(48).start, draw(g, t) {
      wall(g);
      const ws = S.lyrics[47].words.filter(w => /me/i.test(w.w)).map(w => w.s);
      clawd(g, 540, 1720, 2.2, { eyes: 'happy', ...danceBeat(S, t, 0.7), lift: 1.6 });
      heart(g, 540, 1720 - 115, 0.65, 2.5);
      const cards = [['molty', 270, 720, 0, 0], ['muse', 810, 720, 0, 1], ['grok', 270, 1200, 0, 2], ['openai', 810, 1200, 0, 2]];
      for (const [key, x, y, r, k] of cards) {
        const p = between(t, ws[k] - 0.05, ws[k] + 0.35);
        if (p > 0) markCard(g, S, key, x, y, 1.15, r, p);
      }
      lyric(g, t, L(47), { x: 540, y: 330, w: 950, size: 104, align: 'center', color: PAL.black }, 47);
    } },
    // "I'm debugging this with you.": your hand and Clawd hold the scrap together.
    { from: L(48).start, to: 147.56, draw(g, t) {
      wall(g);
      const p = smooth(between(t, L(48).start, L(48).start + 1.2));
      scrap(g, 560, 1130, 1.55, 'make it good', { rot: 0.03, pinned: false, lift: 2.4 });
      blueHand(g, lerp(1500, 1000, p), 1150, 1.6, 0.04);
      clawd(g, 300, 1560, 2.6, { eyes: 'slit', look: 0.6, armL: 0.4, armR: 1.35, lift: 1.8 });
      lyric(g, t, L(48), { x: 540, y: 470, w: 900, size: 108, align: 'center', accent: { you: PAL.blue } }, 48);
    } },
  ];
}
