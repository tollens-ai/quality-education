// Verse 2: a row of beach huts on the promenade at night. Each line opens a door on someone else,
// and what "good" means for them. The question is painted on the hut's name board; the answer is
// lettered over the door, or stitched, stamped or spoken inside. The camera dollies along the row,
// lamp posts sliding past in front.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, confetti, firework, INK } from '../kit.js';
import { nightSky, sea, town, reflection, ferrisWheel, washBand } from '../world.js';
import { clawd, person, molty, grok, blossom, muse, SKINS, pen, nopen, tone } from '../cast.js';
import { blinkAt } from '../band.js';
import { phone, laptop, hand, padlock, paper, guideDog } from '../props.js';
import { wordTimes } from './stage.js';
import { sing, lineNear, STYLE } from '../lyrics.js';
import { letter, skeleton, measure, auditNote } from '../hand.js';

export const HUT_COLS = ['#c9b3ff', '#9fe3c8', '#ffe08a', '#9fd4ff', '#ffb3c7', '#ffab91', '#7fdad0', '#ff9a6a'];
export const HUT_X = i => 540 + i * 900;          // hut centres along the promenade (world x)
const BASE = 1420;                                  // promenade level

// The line start times of verse 2, one per hut.
export const V2 = [51.0, 53.38, 56.1, 58.44, 61.64, 64.32, 66.98, 69.74];
// How many words of each line are the question (on the board); the rest is the answer.
const Q = [2, 2, 3, 2, 2, 3, 2, 3];

// People of verse 2 (also used later in the crowd and the bridge).
export const PEOPLE = {
  demo: { skin: '#e8b48f', hairStyle: 'short', hair: '#1b1b24', top: '#2a2a36', glasses: 'round' },
  baker: { skin: '#c98d67', hairStyle: 'bun', hair: '#2a1c18', top: '#f2efe6' },
  chat1: { skin: '#f6d0b1', hairStyle: 'curly', hair: '#c46a2a', top: '#48a0ff' },
  chat2: { skin: '#7c4a32', hairStyle: 'short', hair: '#111', top: '#ff7a59' },
  chat3: { skin: '#e8b48f', hairStyle: 'long', hair: '#3a2418', top: '#7ad37a' },
  student: { skin: '#f6d0b1', hairStyle: 'beanie', hatColor: '#3a8f6a', top: '#e0495d' },
  nana: { skin: '#f6d0b1', hairStyle: 'grey', top: '#b06bff', glasses: 'round' },
  blind: { skin: '#a86b4a', hairStyle: 'short', hair: '#1b1b24', top: '#2fbf8f', glasses: 'dark' },
};

// ---------------------------------------------------------------- the promenade backdrop
function backdrop(g, t, camX) {
  const hz = 1000;
  nightSky(g, t, { horizon: hz, clouds: .6, moon: { x: 860 - camX * .02, y: 300, r: 46 } });
  const px = 300 - camX * .08;
  g.save(); pen(g, 6, .5); g.fillStyle = '#211338'; g.fillRect(px - 400, hz - 18, 900, 10); g.restore();
  for (let i = 0; i < 40; i++) bulb(g, px - 390 + i * 22, hz - 24, 2.6, i % 3 ? C.bulb : C.pink, .6 + .4 * Math.sin(t * 3 + i));
  ferrisWheel(g, t, px + 380, hz - 120, 110, { rot: t * .05, on: .9 });
  town(g, t, hz, { on: .9 });
  sea(g, t, hz, { reflections: [{ x: 860 - camX * .02, col: C.moon, w: 26, a: .45 }, { x: px + 380, col: C.pink, w: 20, a: .35 }, { x: px, col: C.bulb, w: 30, a: .3 }] });
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, BASE - 40, H, [[0, '#4a3a5a'], [.3, '#2c2139'], [1, '#160f1e']]);
  g.fillRect(-2000, BASE - 40, W + 4000, H - BASE + 40);
  g.fillStyle = '#6a5a7a'; g.fillRect(-2000, BASE, W + 4000, 180);
  g.fillStyle = '#58496a'; g.fillRect(-2000, BASE + 40, W + 4000, 140);
  g.strokeStyle = rgba(INK.col, .4); g.lineWidth = 2.4;
  for (let i = -4; i < 22; i++) { const x = ((i * 120 - camX) % 1200 + 1200) % 1200 - 180; line(g, x, BASE, x - 40, BASE + 180); g.stroke(); }
  g.restore();
}

// A hanging name board with the question lettered on it as it's sung.
function nameBoard(g, t, x, y, i, L, col) {
  const sw = Math.sin(t * 2.1 + i) * .02;
  const words = L.lead.slice(0, Q[i]).map(w => w.w).join(' ');
  const size = 66;
  const bw = clamp(measure(words, size, .17) + 80, 360, 560);
  g.save(); g.translate(x, y); g.rotate(sw);
  g.strokeStyle = rgba(INK.col, .9); g.lineWidth = 3;
  line(g, -bw * .32, -86, -bw * .32, -46); g.stroke(); line(g, bw * .32, -86, bw * .32, -46); g.stroke();
  pen(g, 9, .9);
  const b = () => rr(g, -bw / 2, -50, bw, 104, 14);
  b(); g.fillStyle = '#fbf2e0'; g.fill();
  nopen(g); tone(g, b, '#fbf2e0', '#e2d2b4', -6, -8);
  g.strokeStyle = shade(col, -.3); g.lineWidth = 5; rr(g, -bw / 2 + 10, -40, bw - 20, 84, 9); g.stroke();
  sing(g, t, L, { rows: [{ text: words, x: 0, y: 25, size }], style: 'ink', o: { shade: null, col: shade(col, -.62) }, maxW: bw - 56 });
  g.restore();
}

// The fascia over each door: a dark painted board the answer is lettered onto.
function fascia(g, x, y) {
  g.save(); pen(g, 12, .8);
  g.fillStyle = '#2a1d38'; rr(g, x - 296, y - 70, 592, 94, 10); g.fill();
  g.ink = null; g.strokeStyle = rgba('#f2cf7c', .7); g.lineWidth = 4; rr(g, x - 284, y - 60, 568, 74, 7); g.stroke();
  g.restore();
}

// The answer, lettered on the fascia over the door.
function lintel(g, t, x, y, i, L, o = {}) {
  const words = L.lead.slice(Q[i], o.count ? Q[i] + o.count : undefined).map(w => w.w).join(' ');
  sing(g, t, L, { from: Q[i], rows: [{ text: words, x, y, size: o.size || 60 }], style: 'paint', emph: o.emph, maxW: 540 });
}

// One hut at world x (centre), doors opening by `open` 0..1, `inside` drawn in the opening.
function hut(g, t, x, i, open, inside, L) {
  const w = 720, hH = 660, roof = 250;
  const col = HUT_COLS[i];
  const y0 = BASE - hH;
  g.save();
  g.ink = null; g.fillStyle = 'rgba(0,0,10,.35)'; ellipse(g, x, BASE + 10, w * .6, 30); g.fill();
  // Walls: painted planks, the moonlit side lighter.
  pen(g, 18, .9);
  const wall = () => g.rect(x - w / 2, y0, w, hH);
  g.beginPath(); wall(); g.fillStyle = shade(col, -.2); g.fill();
  nopen(g); tone(g, () => { g.beginPath(); wall(); }, shade(col, -.2), shade(col, -.38), w * .12, 0);
  g.strokeStyle = rgba(shade(col, -.6), .45); g.lineWidth = 3;
  for (let k = 1; k < 12; k++) { const px = x - w / 2 + k * w / 12; line(g, px, y0, px, BASE); g.stroke(); }
  // Roof and bargeboards.
  pen(g, 18, .9);
  g.fillStyle = '#2e2440'; poly(g, [[x - w * .58, y0 + 10], [x, y0 - roof], [x + w * .58, y0 + 10]]); g.fill();
  nopen(g);
  g.strokeStyle = shade(col, .15); g.lineWidth = 18; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - w * .58, y0 + 10); g.lineTo(x, y0 - roof); g.lineTo(x + w * .58, y0 + 10); g.stroke();
  // The doorway, warm when open.
  const dw = 500, dh = 540, dx = x - dw / 2, dy = BASE - dh;
  g.fillStyle = '#150c1c'; g.fillRect(dx, dy, dw, dh);
  if (open > 0 && inside) {
    g.save(); g.beginPath(); g.rect(dx, dy, dw, dh); g.clip();
    g.fillStyle = mix('#2a1c26', '#4a3238', open); g.fillRect(dx, dy, dw, dh);
    glow(g, x, dy + dh * .35, dw * .8, C.amber, .7 * open);
    inside(g, t, x, dy, dw, dh, open);
    g.restore();
    g.save(); g.globalCompositeOperation = 'screen';
    g.fillStyle = rgba(C.amber, .22 * open);
    poly(g, [[dx, BASE], [dx + dw, BASE], [dx + dw + 140, BASE + 260], [dx - 140, BASE + 260]]); g.fill();
    g.restore();
  }
  // Doors hinged at the doorway's edges, swinging out until they lie against the walls.
  const th = easeOutBack(open, 1.3) * Math.PI * .92;
  for (const s of [-1, 1]) {
    const hinge = s < 0 ? dx : dx + dw;
    const fx = s < 0 ? dx + (dw / 2) * Math.cos(th) : dx + dw - (dw / 2) * Math.cos(th);
    const a = Math.min(hinge, fx), b = Math.max(hinge, fx);
    if (b - a < 1) continue;
    const back = th > Math.PI / 2;
    const grow = Math.sin(th) * 26;
    pen(g, 14, .8);
    g.fillStyle = back ? shade(col, -.3) : shade(col, -.08);
    g.beginPath(); g.moveTo(hinge, dy); g.lineTo(fx, dy - grow); g.lineTo(fx, BASE + grow * .3); g.lineTo(hinge, BASE); g.closePath(); g.fill();
    nopen(g);
    g.strokeStyle = rgba(shade(col, -.5), .45); g.lineWidth = 3;
    for (let k = 1; k < 4; k++) { const lx2 = lerp(hinge, fx, k / 4); line(g, lx2, dy + 10 - grow * k / 4, lx2, BASE - 10 + grow * .3 * k / 4); g.stroke(); }
    if (!back) { g.fillStyle = C.gold; circle(g, lerp(hinge, fx, .9), dy + dh * .5, 7); g.fill(); }
    if (s < 0 && !back && b - a > 60) {
      g.save(); g.translate(lerp(hinge, fx, .5), dy + dh * .3); g.scale((b - a) / (dw / 2), 1);
      pen(g, 8, .7); g.fillStyle = '#fff8ee'; circle(g, 0, 0, 58); g.fill();
      g.restore();
      g.save(); g.translate(lerp(hinge, fx, .5), dy + dh * .3); g.scale((b - a) / (dw / 2), 1);
      letter(g, String(i + 1), 0, 28, 72, { align: 'center', col: shade(col, -.5), w: .18, seed: i });
      g.restore();
    }
  }
  pen(g, 12, .8);
  g.strokeStyle = '#f4ead8'; g.lineWidth = 14; g.strokeRect(dx - 7, dy - 7, dw + 14, dh + 7);
  nopen(g);
  glow(g, x + w / 2 - 50, y0 + 70, 110, C.amber, .7);
  pen(g, 8, .6); g.fillStyle = '#ffe2a8'; rr(g, x + w / 2 - 66, y0 + 44, 32, 50, 8); g.fill();
  g.restore();
  nameBoard(g, t, x, y0 - 110, i, L, col);
}

// Bunting strung between huts, pennants flapping.
function bunting(g, t, x1, x2, y) {
  g.save(); g.ink = null;
  g.strokeStyle = 'rgba(240,230,255,.55)'; g.lineWidth = 2.4;
  const sag = 60;
  g.beginPath(); for (let k = 0; k <= 20; k++) { const p = k / 20; const x = lerp(x1, x2, p), yy = y + Math.sin(p * Math.PI) * sag; k ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke();
  const cols = [C.pink, C.gold, C.cyan, '#ffffff', C.coral];
  pen(g, 5, .5);
  for (let k = 1; k < 10; k++) {
    const p = k / 10; const x = lerp(x1, x2, p), yy = y + Math.sin(p * Math.PI) * sag;
    g.fillStyle = cols[k % cols.length];
    const sw = Math.sin(t * 3 + k) * 5;
    poly(g, [[x - 17, yy], [x + 17, yy], [x + sw, yy + 42]]); g.fill();
  }
  g.restore();
}

// A lamp post in the foreground, closer to us than the huts, so it slides past faster.
function fgLamp(g, t, x) {
  g.save(); pen(g, 20, .9);
  g.fillStyle = '#1f1530';
  rr(g, x - 16, 700, 32, 1300, 10); g.fill();
  rr(g, x - 40, 1640, 80, 300, 16); g.fill();
  g.strokeStyle = '#1f1530'; g.lineWidth = 12;
  g.beginPath(); g.moveTo(x, 760); g.quadraticCurveTo(x + 70, 700, x + 110, 760); g.stroke();
  g.restore();
  glow(g, x + 110, 790, 210, C.amber, .8);
  g.save(); pen(g, 12, .7); g.fillStyle = '#fff0c4'; circle(g, x + 110, 790, 26); g.fill(); g.restore();
}

// Cross-stitch: the words stitched along their strokes, one X at a time, on a framed sampler.
function stitched(g, t, str, x, y, size, t0, t1, col) {
  const sk = skeleton(str, x, y, size, { align: 'center', w: .15, step: size * .085, seed: 13, jitter: .2 });
  const n = sk.pts.length, p = clamp((t - t0) / Math.max(.05, t1 - t0));
  if (p > .95) auditNote(g, str, x, y, size, { align: 'center', col });
  g.save(); g.ink = null; g.strokeStyle = col; g.lineWidth = size * .042; g.lineCap = 'round';
  const k = size * .034;
  for (let i = 0; i < n * p; i++) {
    const [sx, sy] = sk.pts[i];
    g.beginPath(); g.moveTo(sx - k, sy - k); g.lineTo(sx + k, sy + k); g.moveTo(sx + k, sy - k); g.lineTo(sx - k, sy + k); g.stroke();
  }
  g.restore();
}

// ---------------------------------------------------------------- interiors
const INSIDE = [
  // 1. Product demo: wow them fast.
  (g, t, x, dy, dw, dh, open, T) => {
    const tWow = T[2];
    const wowed = t > tWow;
    g.save(); pen(g, 10, .7);
    g.fillStyle = '#16131f'; rr(g, x - 210, dy + 46, 420, 250, 14); g.fill();
    nopen(g);
    g.fillStyle = '#7a4bff'; rr(g, x - 198, dy + 58, 396, 226, 10); g.fill();
    g.fillStyle = '#ff5fa8'; poly(g, [[x - 198, dy + 284], [x + 198, dy + 120], [x + 198, dy + 284]]); g.fill();
    g.restore();
    letter(g, 'LAUNCH', x, dy + 175, 64, { align: 'center', col: '#fff', w: .17, seed: 3 });
    g.save(); g.fillStyle = '#fff'; g.font = '600 24px Bricolage'; g.textAlign = 'center'; g.fillText('it’s live ✨', x, dy + 226); g.restore();
    glow(g, x, dy + 175, 280, '#ff9ad0', .5);
    const jump = wowed ? Math.abs(Math.sin((t - tWow) * 9)) * 22 * Math.exp(-(t - tWow) * 1.5) : 0;
    person(g, x - 100, dy + dh + 10 - jump, { s: 145, ...PEOPLE.demo, armR: wowed ? -2.8 : -2.2, armL: wowed ? -2.8 : .3, eyes: wowed ? 'happy' : 'open', brow: 'up', mouth: .4 + .3 * Math.sin(t * 9) });
    for (let k = 0; k < 4; k++) {
      const ax = x - 150 + k * 100, ay = dy + dh + 60;
      const hop = wowed ? Math.max(0, Math.sin((t - tWow) * 12 + k)) * 10 : 0;
      g.save(); pen(g, 7, .6); g.fillStyle = '#231733'; circle(g, ax, ay - 70 - hop, 40); g.fill(); rr(g, ax - 55, ay - 40 - hop, 110, 80, 30); g.fill(); g.restore();
      if (wowed) { g.save(); g.fillStyle = C.gold; star(g, ax - 14, ay - 76 - hop, 13, 5); g.fill(); star(g, ax + 14, ay - 76 - hop, 13, 5); g.fill(); g.restore(); }
    }
    if (wowed) { const p = inv(tWow, tWow + .8, t); g.save(); for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; g.fillStyle = rgba(k % 2 ? C.gold : '#fff', 1 - p); star(g, x + Math.cos(a) * (60 + p * 260), dy + 175 + Math.sin(a) * (40 + p * 180), 14, 5, 4, 0); g.fill(); } g.restore(); }
  },
  // 2. Paying users: make it last.
  (g, t, x, dy, dw, dh, open, T) => {
    const tLast = T[4];
    g.save();
    for (let r = 0; r < 2; r++) {
      pen(g, 8, .6); g.fillStyle = '#6a4030'; g.fillRect(x - 230, dy + 92 + r * 90, 460, 12);
      for (let k = 0; k < 6; k++) { g.fillStyle = shade('#d99a4e', (k % 3) * -.1); ellipse(g, x - 190 + k * 76, dy + 72 + r * 90, 32, 22); g.fill(); }
    }
    nopen(g);
    for (let k = 0; k < 4; k++) { const sp = ((t * .5 + k * .25) % 1); g.strokeStyle = rgba('#ffffff', .35 * (1 - sp)); g.lineWidth = 5; g.beginPath(); g.moveTo(x - 150 + k * 90, dy + 160 - sp * 60); g.quadraticCurveTo(x - 140 + k * 90 + Math.sin(t * 3 + k) * 12, dy + 130 - sp * 60, x - 150 + k * 90, dy + 100 - sp * 60); g.stroke(); }
    // The calendar flips through the years: it lasts.
    const flips = Math.min(83, Math.floor(Math.max(0, (t - (T[2] ?? T[0])) * 9)));
    const year = 2025 + Math.floor(flips / 12), month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][flips % 12];
    pen(g, 7, .6); g.fillStyle = '#fffaf0'; rr(g, x + 142, dy + 240, 120, 128, 8); g.fill();
    nopen(g); g.fillStyle = '#e0495d'; rr(g, x + 142, dy + 240, 120, 36, 8); g.fill();
    g.restore();
    letter(g, month, x + 202, dy + 268, 22, { align: 'center', col: '#fff', w: .17, seed: flips });
    letter(g, String(year), x + 202, dy + 340, 38, { align: 'center', col: '#2a2038', w: .16, seed: flips + 1 });
    person(g, x - 70, dy + dh - 60, { s: 136, ...PEOPLE.baker, armR: -.9 - .3 * Math.sin(t * 6), eyes: 'happy', torso: (g2, u, by, th) => { g2.fillStyle = '#ffffff'; rr(g2, -u * 3.4, by - th + u * 3, u * 6.8, th, u * 1.5); g2.fill(); } });
    g.save(); pen(g, 10, .7);
    g.fillStyle = '#7a4a30'; g.fillRect(x - 250, dy + dh - 120, 500, 120);
    g.fillStyle = '#1a1a24'; rr(g, x + 40, dy + dh - 190, 130, 90, 10); g.fill();
    nopen(g); g.fillStyle = '#2fbf6f'; rr(g, x + 50, dy + dh - 180, 110, 70, 6); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 84, dy + dh - 146); g.lineTo(x + 100, dy + dh - 130); g.lineTo(x + 128, dy + dh - 160); g.stroke();
    g.restore();
    if (t > tLast) glow(g, x + 105, dy + dh - 145, 80, '#6dff9a', .6 * (.5 + .5 * Math.sin(t * 6)));
  },
  // 3. Group chat bot: just make 'em laugh.
  (g, t, x, dy, dw, dh, open, T) => {
    const tLaugh = T[6] ?? T[T.length - 1];
    const laugh = t > tLaugh - .1;
    g.save(); pen(g, 9, .7);
    g.fillStyle = 'rgba(255,255,255,.97)'; rr(g, x - 200, dy + 46, 400, 150, 30); g.fill();
    poly(g, [[x - 120, dy + 190], [x - 150, dy + 230], [x - 80, dy + 192]]); g.fill();
    g.fillStyle = '#6dd36d'; circle(g, x - 150, dy + 121, 36); g.fill();
    nopen(g);
    g.fillStyle = '#fff'; circle(g, x - 162, dy + 111, 9); g.fill(); circle(g, x - 138, dy + 111, 9); g.fill();
    g.fillStyle = '#111'; circle(g, x - 160, dy + 112, 4); g.fill(); circle(g, x - 136, dy + 112, 4); g.fill();
    g.restore();
    letter(g, 'BA-DUM-TSS', x - 94, dy + 122, 38, { col: '#2a2038', w: .16, seed: 9 });
    const bob = laugh ? Math.abs(Math.sin(t * 16)) * 12 : 0;
    person(g, x - 150, dy + dh + 20 - bob, { s: 112, ...PEOPLE.chat1, eyes: laugh ? 'closed' : 'open', brow: laugh ? 'up' : 'calm', mouth: laugh ? .9 : 0, lean: laugh ? -.18 : 0, armL: laugh ? -1.4 : -.4 });
    person(g, x, dy + dh + 20 - bob * .8, { s: 118, ...PEOPLE.chat2, eyes: laugh ? 'closed' : 'open', mouth: laugh ? 1 : 0, armR: laugh ? -1.2 : .25 });
    person(g, x + 150, dy + dh + 20 - bob * 1.1, { s: 110, ...PEOPLE.chat3, eyes: laugh ? 'closed' : 'open', mouth: laugh ? .8 : 0, lean: laugh ? .3 : 0 });
    if (laugh) for (let k = 0; k < 10; k++) {
      const p = ((t - tLaugh) * .8 + k * .1) % 1; const ex = x - 200 + k * 45, ey = dy + dh - 120 - p * 330;
      g.save(); g.globalAlpha = 1 - p; pen(g, 5, .5);
      g.fillStyle = '#ffd23a'; circle(g, ex, ey, 22); g.fill(); nopen(g);
      g.strokeStyle = '#6a3a00'; g.lineWidth = 3; g.beginPath(); g.arc(ex, ey + 2, 12, .1, Math.PI - .1); g.stroke();
      g.fillStyle = '#7fd6ff'; ellipse(g, ex - 14, ey - 2, 5, 8); g.fill(); ellipse(g, ex + 14, ey - 2, 5, 8); g.fill();
      g.restore();
    }
  },
  // 4. Uni project: make it pass.
  (g, t, x, dy, dw, dh, open, T) => {
    const tPass = T[4] ?? T[T.length - 1];
    const done = t > tPass;
    g.save();
    // The window: it's 3am.
    pen(g, 8, .7); g.fillStyle = '#10163a'; rr(g, x + 110, dy + 40, 130, 120, 6); g.fill(); nopen(g);
    g.fillStyle = '#fff3cc'; circle(g, x + 200, dy + 80, 16); g.fill();
    pen(g, 8, .7); g.fillStyle = '#fffaf0'; circle(g, x - 170, dy + 90, 46); g.fill(); nopen(g);
    g.strokeStyle = '#2a2038'; g.lineWidth = 5; line(g, x - 170, dy + 90, x - 170, dy + 60); g.stroke(); line(g, x - 170, dy + 90, x - 150, dy + 96); g.stroke();
    pen(g, 6, .6); g.fillStyle = '#ffe36b'; g.save(); g.translate(x - 30, dy + 70); g.rotate(-.06); rr(g, -60, -26, 120, 56, 4); g.fill(); g.restore();
    for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? '#f4ead8' : '#e8dcc6'; rr(g, x + 110 + (k % 3) * 34, dy + dh - 190 - Math.floor(k / 3) * 58, 30, 52, 6); g.fill(); }
    g.restore();
    letter(g, 'DUE 9AM', x - 30, dy + 80, 26, { align: 'center', col: '#2a2038', w: .16, rot: -.06, seed: 4 });
    const tap = done ? 0 : Math.sin(t * 38) * .18;
    person(g, x - 40, dy + dh + 10, { s: 128, ...PEOPLE.student, eyes: done ? 'closed' : 'wide', brow: done ? 'up' : 'worry', armR: done ? -2.7 : -.5 + tap, armL: done ? -2.7 : -.5 - tap, mouth: done ? .8 : 0 });
    g.save(); pen(g, 10, .7);
    g.fillStyle = '#6a5040'; g.fillRect(x - 250, dy + dh - 130, 500, 130);
    g.fillStyle = '#2b2940'; rr(g, x - 120, dy + dh - 230, 190, 110, 8); g.fill();
    nopen(g); g.fillStyle = '#bfe0ff'; rr(g, x - 112, dy + dh - 222, 174, 94, 5); g.fill();
    g.fillStyle = '#2f7bff'; rr(g, x - 70, dy + dh - 190, 90, 32, 8); g.fill();
    g.restore();
    // The stamp: PASS is the word it lands on.
    if (t > tPass - .2) {
      const p = inv(tPass - .2, tPass, t);
      const s = lerp(2.4, 1, easeIn(p));
      g.save(); g.translate(x + 30, dy + 250); g.rotate(-.1);
      pen(g, 8, .7); g.fillStyle = '#fbf6ea'; rr(g, -190, -104, 380, 208, 8); g.fill();
      g.ink = null; g.fillStyle = 'rgba(60,50,80,.18)'; for (let k = 0; k < 6; k++) g.fillRect(-160, -80 + k * 30, 320, 5);
      g.restore();
      g.save(); g.translate(x + 30, dy + 250); g.rotate(-.12); g.scale(s, s); g.globalAlpha *= clamp(p * 2);
      g.ink = null; g.strokeStyle = '#d9304a'; g.lineWidth = 10; rr(g, -140, -58, 280, 116, 16); g.stroke();
      letter(g, 'PASS.', 4, 34, 92, { align: 'center', col: '#d9304a', w: .19, seed: 77, boil: 0 });
      g.restore();
    }
  },
  // 5. Nana's phone: let's keep it sweet.
  (g, t, x, dy, dw, dh, open, T, L) => {
    g.save(); g.ink = null;
    for (let k = 0; k < 18; k++) { g.fillStyle = rgba('#ffb3c7', .25); circle(g, x - 230 + (k % 6) * 92, dy + 40 + Math.floor(k / 6) * 90, 14); g.fill(); }
    g.restore();
    // The sampler on the wall: the answer, stitched as it's sung.
    g.save(); pen(g, 10, .8);
    g.fillStyle = '#b8864a'; rr(g, x - 215, dy + 22, 430, 196, 10); g.fill();
    nopen(g); g.fillStyle = '#f5ecd8'; rr(g, x - 200, dy + 36, 400, 168, 4); g.fill();
    g.strokeStyle = 'rgba(160,130,100,.25)'; g.lineWidth = 1; for (let k = 0; k < 40; k++) { line(g, x - 200 + k * 10, dy + 36, x - 200 + k * 10, dy + 204); g.stroke(); }
    for (let k = 0; k < 17; k++) { line(g, x - 200, dy + 36 + k * 10, x + 200, dy + 36 + k * 10); g.stroke(); }
    g.restore();
    const ws = L.lead;
    stitched(g, t, "LET'S KEEP", x, dy + 108, 60, ws[2].s, ws[3].e ?? ws[3].s + .3, '#c2335a');
    stitched(g, t, 'IT SWEET.', x, dy + 186, 60, ws[4].s, (ws[5].e ?? ws[5].s + .4), '#c2335a');
    if (t > ws[5].s) { g.save(); g.fillStyle = '#c2335a'; heart(g, x + 170, dy + 60, 26); g.fill(); heart(g, x - 170, dy + 60, 26); g.fill(); g.restore(); }
    // Armchair, rocking gently; Nana, the cat, the one-button phone.
    g.save(); g.translate(x, dy + dh); g.rotate(Math.sin(t * 2.2) * .035); g.translate(-x, -(dy + dh));
    pen(g, 12, .8);
    const chair = () => rr(g, x - 210, dy + 250, 420, dh - 190, 60);
    chair(); g.fillStyle = '#c9506a'; g.fill();
    nopen(g); tone(g, chair, '#c9506a', '#9a3550', -24, -16);
    const tSweet = ws[5].s;
    person(g, x, dy + dh - 20, { s: 136, ...PEOPLE.nana, eyes: t > tSweet ? 'happy' : 'open', armR: -1.2, torso: (g2, u, by, th) => { g2.fillStyle = '#f7e3a6'; rr(g2, -u * 6, by - th * .45, u * 12, th * .5, u * 2); g2.fill(); } });
    pen(g, 7, .7);
    g.fillStyle = '#e8a04a'; ellipse(g, x - 60, dy + dh - 60, 70, 34); g.fill(); circle(g, x - 120, dy + dh - 80, 26); g.fill();
    g.beginPath(); g.moveTo(x - 138, dy + dh - 100); g.lineTo(x - 130, dy + dh - 124); g.lineTo(x - 118, dy + dh - 104); g.fill();
    g.beginPath(); g.moveTo(x - 110, dy + dh - 102); g.lineTo(x - 100, dy + dh - 124); g.lineTo(x - 94, dy + dh - 98); g.fill();
    nopen(g); g.strokeStyle = '#6a3a10'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 130, dy + dh - 78); g.quadraticCurveTo(x - 124, dy + dh - 72, x - 118, dy + dh - 78); g.stroke();
    // The one-button phone, held up in her hand.
    phone(g, x + 158, dy + dh - 175, 100, .1, (g2, sx, sy, sw, sh) => {
      g2.fillStyle = '#fffaf0'; g2.fillRect(sx, sy, sw, sh);
      g2.fillStyle = '#2fbf6f'; rr(g2, sx + sw * .1, sy + sh * .3, sw * .8, sh * .4, sw * .12); g2.fill();
      g2.fillStyle = '#fff'; g2.font = `800 ${sw * .22}px Bricolage`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText('Sam', sx + sw / 2, sy + sh * .5);
    }, { glowA: .8 });
    g.restore();
    if (t > tSweet - .3) for (let k = 0; k < 5; k++) { const p = ((t - tSweet + .3) * .6 + k * .2) % 1; g.save(); pen(g, 4, .5); g.fillStyle = rgba(C.pink, 1 - p); heart(g, x + 60 + k * 30 + Math.sin(p * 6 + k) * 10, dy + 330 - p * 160, 30); g.fill(); g.restore(); }
    g.save(); pen(g, 7, .6); g.fillStyle = '#fffaf0'; rr(g, x + 170, dy + dh - 150, 60, 50, 10); g.fill(); nopen(g);
    for (let k = 0; k < 3; k++) { g.strokeStyle = rgba('#ffffff', .35); g.lineWidth = 4; g.beginPath(); g.moveTo(x + 185 + k * 15, dy + dh - 160); g.bezierCurveTo(x + 175 + k * 15, dy + dh - 190, x + 200 + k * 15, dy + dh - 200 + Math.sin(t * 3 + k) * 6, x + 188 + k * 15, dy + dh - 230); g.stroke(); }
    g.restore();
  },
  // 6. Can't see screens: it needs to speak.
  (g, t, x, dy, dw, dh, open, T) => {
    const tSpeak = T[3] ?? T[T.length - 1];
    guideDog(g, x + 110, dy + dh - 10, 200, t);
    g.save(); g.ink = null;
    g.strokeStyle = '#f4f1ea'; g.lineWidth = 9; line(g, x - 200, dy + dh, x - 120, dy + 180); g.stroke();
    g.strokeStyle = '#e0304a'; line(g, x - 200, dy + dh, x - 185, dy + dh - 40); g.stroke();
    g.restore();
    person(g, x - 30, dy + dh + 10, { s: 138, ...PEOPLE.blind, eyes: 'open', armR: -2.9, armLenR: .8, mouth: t > tSpeak + .3 ? .1 : 0, extra: (g2, u, hy, hr) => { g2.fillStyle = '#fff'; circle(g2, hr * 1.02, hy + u * .6, u * .8); g2.fill(); } });
    const sp = t > tSpeak - .15;
    const cx = x + 60, cy = dy + 170;
    g.save(); g.ink = null;
    for (let k = 0; k < 4; k++) { const p = ((t * .9) + k * .25) % 1; if (!sp && k > 0) continue; g.strokeStyle = rgba(C.cyan, (1 - p) * (sp ? .85 : .3)); g.lineWidth = 6; g.beginPath(); g.arc(cx - 60, cy + 30, 40 + p * 180, -1, .4); g.stroke(); }
    g.restore();
    if (sp) {
      g.save(); pen(g, 8, .7); g.fillStyle = rgba('#e8fbff', .97); rr(g, cx - 40, cy - 100, 250, 100, 30); g.fill(); nopen(g);
      g.fillStyle = '#123'; g.font = '700 26px Bricolage'; g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillText('Bus in 2 minutes'.slice(0, Math.floor((t - tSpeak + .15) * 30)), cx - 20, cy - 62);
      g.fillStyle = C.cyan; for (let k = 0; k < 14; k++) { const h2 = 6 + Math.abs(Math.sin(t * 20 + k * .9)) * 22; rr(g, cx - 20 + k * 14, cy - 34 - h2 / 2 + 8, 8, h2, 3); g.fill(); }
      g.restore();
    }
  },
  // 7. Agent bots: no data leak.
  (g, t, x, dy, dw, dh, open, T) => {
    const tLeak = T[4] ?? T[T.length - 1];
    const faces = [PEOPLE.demo, PEOPLE.baker, PEOPLE.chat1, PEOPLE.student, PEOPLE.nana, PEOPLE.blind, PEOPLE.chat2, PEOPLE.chat3];
    for (let k = 0; k < 8; k++) {
      const lx = x - 220 + (k % 4) * 112, ly = dy + 40 + Math.floor(k / 4) * 150;
      g.save(); pen(g, 8, .7);
      g.fillStyle = '#4a5a78'; rr(g, lx, ly, 100, 136, 8); g.fill();
      nopen(g); g.fillStyle = '#2a3450'; rr(g, lx + 8, ly + 8, 84, 84, 6); g.fill();
      g.beginPath(); g.rect(lx + 8, ly + 8, 84, 84); g.clip();
      g.fillStyle = shade(HUT_COLS[k], -.1); g.fillRect(lx + 8, ly + 8, 84, 84);
      person(g, lx + 50, ly + 112, { s: 44, ...faces[k], eyes: 'happy', still: true });
      g.restore();
      padlock(g, lx + 50, ly + 118, 30, 0);
      if (t > tLeak) glow(g, lx + 50, ly + 112, 40, '#6dff9a', .45);
    }
    g.save(); pen(g, 10, .7); g.fillStyle = '#6a5040'; g.fillRect(x - 250, dy + 380, 500, dh - 380); g.restore();
    const hand2 = inv(T[1] ?? T[0], (T[1] ?? T[0]) + .6, t);
    grok(g, x - 110, dy + dh + 20, { s: 118, arms: false });
    blossom(g, x + 110, dy + dh + 30, { s: 112, eyes: t > tLeak ? 'happy' : 'open' });
    g.save(); g.translate(lerp(x + 40, x + 90, hand2), dy + 400); g.rotate(-.1);
    pen(g, 7, .6); g.fillStyle = '#fffaf0'; rr(g, -70, -40, 140, 80, 8); g.fill();
    g.restore();
    g.save(); g.translate(lerp(x + 40, x + 90, hand2), dy + 400); g.rotate(-.1);
    g.fillStyle = '#2a2038'; g.font = '700 20px Mono'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('open 9–5', 0, -8); g.fillText('menu.pdf', 0, 18);
    g.restore();
  },
  // 8. For us: keep diags neat.
  (g, t, x, dy, dw, dh, open, T) => {
    const tNeat = T[5] ?? T[T.length - 1];
    g.save(); pen(g, 10, .7); g.fillStyle = '#13121c'; rr(g, x - 220, dy + 40, 440, 280, 14); g.fill(); g.restore();
    const rows = [['✓', 'build', '1.2s', '#6dff9a'], ['✓', 'tests', '42/42', '#6dff9a'], ['✓', 'deploy', 'ok', '#6dff9a'], ['✖', 'gym_log:42', 'weight is undefined', '#ff6a7a'], ['→', 'expected', 'kg, got ""', '#ffd166']];
    g.save();
    rows.forEach(([ic, a, b, col], k) => {
      const ry = dy + 85 + k * 50;
      const p = clamp((t - (T[0] + k * .18)) / .2);
      g.globalAlpha = p;
      g.fillStyle = col; g.font = '800 26px Mono'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(ic, x - 195, ry);
      g.fillStyle = '#e8e4f4'; g.font = '600 22px Mono'; g.fillText(a, x - 160, ry);
      g.fillStyle = rgba(col, .9); g.fillText(b, x - 160 + g.measureText(a + ' ').width + 10, ry);
    });
    g.restore();
    if (t > tNeat) glow(g, x, dy + 180, 280, '#9fffc8', .3);
    molty(g, x - 170, dy + dh + 20, { s: 118, t, eyes: 'happy', clawL: -1 });
    clawd(g, x, dy + dh + 30, { s: 185, eyes: t > tNeat ? 'happy' : 'open', look: [0, -1], armR: -1.3, armL: -.2, smile: 1 });
    muse(g, x + 175, dy + dh + 20, { s: 108, t, eyes: 'happy' });
  },
];

// Where the answer goes for each hut: over the door, unless the answer lives inside.
const ANSWER = [
  { size: 62, emph: { fast: { col: STYLE.hot } } },
  { size: 62, emph: { last: { col: STYLE.hot } } },
  { size: 58, emph: { laugh: { col: STYLE.hot } } },
  { size: 62, count: 2 },
  null,
  { size: 60, emph: { speak: { col: STYLE.hot } } },
  { size: 62, emph: { leak: { col: STYLE.hot } } },
  { size: 62, emph: { neat: { col: STYLE.hot } } },
];

// ---------------------------------------------------------------- the verse 2 shot
export function hutsShot(g, t, c) {
  let idx = 0;
  for (let i = 0; i < V2.length; i++) if (t >= V2[i] - .02) idx = i;
  const slide = .45;
  const prevX = HUT_X(Math.max(0, idx - 1)), curX = HUT_X(idx);
  const sp = idx === 0 ? 1 : easeInOut(inv(V2[idx] - .02, V2[idx] - .02 + slide, t));
  const camX = lerp(prevX, curX, sp) - 540;
  const lineP = inv(V2[idx], V2[idx + 1] ?? 72.48, t);
  const z = 1.6 + .08 * smooth(lineP);
  g.save();
  g.translate(540, 1080); g.scale(z, z); g.translate(-540, -(BASE - 280));
  backdrop(g, t, camX);
  for (let i = 0; i < 8; i++) {
    const sx = HUT_X(i) - camX;
    if (sx < -900 || sx > W + 900) continue;
    const L = lineNear(V2[i]);
    const T = L.lead.map(w => w.s);
    const open = i < idx ? 1 : i === idx ? easeOut(inv(V2[i] + .02, V2[i] + .38, t)) : 0;
    hut(g, t, sx, i, open, (g2, t2, x, dy, dw, dh, op) => INSIDE[i](g2, t2, x, dy, dw, dh, op, T, L), L);
    if (ANSWER[i]) { fascia(g, sx, BASE - 540 - 40); lintel(g, t, sx, BASE - 540 - 40, i, L, ANSWER[i]); }
    if (i < 7) bunting(g, t, sx + 360, sx + 540, BASE - 640);
  }
  g.restore();
  // Foreground lamp posts, halfway between huts, sliding past faster than the huts do.
  g.save();
  const fz = 1.35;
  for (let i = -1; i < 9; i++) {
    const wx = HUT_X(i) + 450;
    const sx = (wx - (camX + 540)) * fz * 1.25 + 540;
    if (sx < -300 || sx > W + 300) continue;
    fgLamp(g, t, sx);
  }
  g.restore();
}

// ---------------------------------------------------------------- 72.48 – 76.54: everyone, all at once
export function hutsWide(g, t, c) {
  const K = c.K;
  const pull = easeOut(inv(72.48, 73.4, t));
  const z = lerp(1.6, .56, pull);
  const pan = easeInOut(inv(72.9, 76.4, t));
  const focus = lerp(HUT_X(7), HUT_X(0), pan);
  const camX = focus - 540;
  const baseY = lerp(1080 + 280 * 1.6, BASE, pull);
  const zb = lerp(1.6, 1, pull);
  g.save();
  g.translate(540, baseY); g.scale(zb, zb); g.translate(-540, -BASE);
  backdrop(g, t, camX * .3);
  g.restore();
  g.save();
  g.translate(540, baseY); g.scale(z, z); g.translate(-540, -BASE);
  for (let i = 0; i < 8; i++) {
    const sx = HUT_X(i) - camX;
    if (sx * z < -1400 || sx * z > W + 1400) continue;
    const L = lineNear(V2[i]);
    const T = L.lead.map(w => w.s);
    hut(g, t, sx, i, 1, (g2, t2, x, dy, dw, dh, op) => INSIDE[i](g2, t2, x, dy, dw, dh, op, T, L), L);
    if (ANSWER[i]) { fascia(g, sx, BASE - 540 - 40); lintel(g, t, sx, BASE - 540 - 40, i, L, ANSWER[i]); }
    if (i < 7) bunting(g, t, sx + 360, sx + 540, BASE - 640);
  }
  g.restore();
  firework(g, t, 73.4, 260, 330, { color: C.pink, color2: C.gold, n: 70, speed: 380, seed: 71 });
  firework(g, t, 74.9, 820, 280, { color: C.cyan, color2: '#fff', n: 70, speed: 380, seed: 72 });
  firework(g, t, 75.7, 520, 240, { color: C.gold, color2: C.pink, n: 70, speed: 380, seed: 73 });
  const bp = K.beatPos(t);
  const turn = Math.sin((t - 72.5) * 1.6);
  clawd(g, 540 + Math.sin(t * 1.2) * 20, 1740, { s: 250, look: [turn, -.6], eyes: 'wide', armL: -.2, armR: -.2, legs: bp * .5, squash: .04 * Math.abs(Math.sin(bp * Math.PI)) });
}
