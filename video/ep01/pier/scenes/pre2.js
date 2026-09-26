// Pre-chorus 2: the same complaint, now with everyone from the huts crowded round Clawd, each
// wanting something different. Clawd still holds the same three words. The lettering repeats the
// first pre-chorus's poster, so the words are recognised before they're read.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, bulb, INK } from '../kit.js';
import { nightSky, sea, town, washBand } from '../world.js';
import { clawd, person, grok, blossom, pen, nopen, tone } from '../cast.js';
import { blinkAt } from '../band.js';
import { PEOPLE, HUT_COLS } from './huts.js';
import { slip } from './pre.js';
import { sing, keyLine, STYLE } from '../lyrics.js';

// What each of them wants, as a little painted icon in a thought bubble.
function want(g, kind, x, y, s) {
  g.save(); g.ink = null;
  g.fillStyle = INK.col; g.strokeStyle = INK.col; g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'wow') { g.fillStyle = C.gold; star(g, x, y, s * .5, s * .22); g.fill(); star(g, x + s * .45, y - s * .35, s * .2, s * .09); g.fill(); }
  if (kind === 'last') { g.fillStyle = '#e0495d'; rr(g, x - s * .4, y - s * .4, s * .8, s * .8, s * .12); g.fill(); g.fillStyle = '#fff'; rr(g, x - s * .32, y - s * .18, s * .64, s * .5, s * .06); g.fill(); g.strokeStyle = INK.col; g.lineWidth = s * .07; g.beginPath(); g.ellipse(x - s * .1, y + s * .07, s * .1, s * .08, 0, 0, TAU); g.ellipse(x + s * .1, y + s * .07, s * .1, s * .08, 0, 0, TAU); g.stroke(); }
  if (kind === 'laugh') { g.fillStyle = '#ffd23a'; circle(g, x, y, s * .45); g.fill(); g.strokeStyle = '#6a3a00'; g.lineWidth = s * .08; g.beginPath(); g.arc(x, y + s * .04, s * .24, .1, Math.PI - .1); g.stroke(); }
  if (kind === 'pass') { g.strokeStyle = '#2fbf6f'; g.lineWidth = s * .16; g.beginPath(); g.moveTo(x - s * .35, y); g.lineTo(x - s * .08, y + s * .28); g.lineTo(x + s * .4, y - s * .3); g.stroke(); }
  if (kind === 'sweet') { g.fillStyle = C.pink; heart(g, x, y, s * .9); g.fill(); }
  if (kind === 'speak') { g.fillStyle = '#2fb8d8'; poly(g, [[x - s * .4, y - s * .15], [x - s * .15, y - s * .15], [x + s * .1, y - s * .38], [x + s * .1, y + s * .38], [x - s * .15, y + s * .15], [x - s * .4, y + s * .15]]); g.fill(); g.strokeStyle = '#2fb8d8'; g.lineWidth = s * .08; g.beginPath(); g.arc(x + s * .1, y, s * .3, -.7, .7); g.stroke(); }
  if (kind === 'safe') { g.fillStyle = '#3fbf7a'; rr(g, x - s * .3, y - s * .05, s * .6, s * .45, s * .08); g.fill(); g.strokeStyle = '#3fbf7a'; g.lineWidth = s * .1; g.beginPath(); g.arc(x, y - s * .05, s * .2, Math.PI, 0); g.stroke(); }
  g.restore();
}
function bubble(g, x, y, r, p) {
  if (p <= 0) return;
  const s = easeOutBack(p, 2);
  g.save(); pen(g, 7, .7);
  g.fillStyle = '#f7f3ff';
  circle(g, x, y, r * s); g.fill();
  circle(g, x - r * .7 * s, y + r * 1.05 * s, r * .22 * s); g.fill();
  circle(g, x - r * .95 * s, y + r * 1.45 * s, r * .12 * s); g.fill();
  g.restore();
}

// Everyone, in two loose rows round Clawd, the back row smaller.
const RING = [
  { who: 'demo', want: 'wow', x: 170, y: 1260, s: 84 },
  { who: 'baker', want: 'last', x: 370, y: 1210, s: 80 },
  { who: 'chat2', want: 'laugh', x: 710, y: 1210, s: 80 },
  { who: 'student', want: 'pass', x: 910, y: 1260, s: 84 },
  { who: 'nana', want: 'sweet', x: 110, y: 1600, s: 102 },
  { who: 'blind', want: 'speak', x: 970, y: 1600, s: 102 },
  { who: 'grok', want: 'safe', x: 300, y: 1690, s: 112 },
  { who: 'blossom', want: 'safe', x: 790, y: 1690, s: 112 },
];

function promenade(g, t) {
  const hz = 820;
  nightSky(g, t, { horizon: hz, moon: { x: 900, y: 520, r: 40 } });
  town(g, t, hz);
  sea(g, t, hz, { reflections: [{ x: 880, col: C.moon, w: 26, a: .45 }] });
  // The huts along the back of the promenade, doors open, lit.
  for (let i = 0; i < 8; i++) {
    const x = 70 + i * 134, y = 1010, w2 = 118, h2 = 124;
    g.save(); pen(g, 6, .6);
    g.fillStyle = shade(HUT_COLS[i], -.28); g.fillRect(x - w2 / 2, y - h2, w2, h2);
    g.fillStyle = '#2e2440'; poly(g, [[x - w2 * .58, y - h2], [x, y - h2 - 46], [x + w2 * .58, y - h2]]); g.fill();
    g.restore();
    glow(g, x, y - 50, 80, C.amber, .7);
    g.save(); g.ink = null; g.fillStyle = '#ffd494'; g.fillRect(x - 32, y - 84, 64, 84); g.restore();
  }
  for (let i = 0; i < 20; i++) bulb(g, 30 + i * 54, 860 + Math.sin(i * .9) * 10, 4, i % 3 ? C.bulb : C.pink, .7 + .3 * Math.sin(t * 3 + i));
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 1010, H, [[0, '#6a5a78'], [.25, '#45374f'], [1, '#170f1f']]);
  g.fillRect(0, 1010, W, H - 1010);
  g.restore();
  glow(g, 540, 1420, 620, C.amber, .4);
}

function drawWho(g, t, p) {
  if (p.who === 'grok') return grok(g, p.x, p.y, { s: p.s * 1.1, arms: false });
  if (p.who === 'blossom') return blossom(g, p.x, p.y, { s: p.s * 1.1 });
  person(g, p.x, p.y, { s: p.s, ...PEOPLE[p.who], full: true, shadow: true, look: [(540 - p.x) / 500, 0], eyes: 'open', blink: blinkAt(t, p.x % 7) });
}

// The pre-chorus poster: the same four rows as the first time.
export function prePoster(g, t, t1, t2, y0) {
  sing(g, t, t1, { rows: [{ text: "You didn't tell me", y: y0, size: 66 }, { text: "who it's for,", y: y0 + 135, size: 118 }], emph: { who: { col: STYLE.hot } } });
  sing(g, t, t2, { rows: [{ text: "you didn't tell me", y: y0 + 295, size: 66 }, { text: 'what they want.', y: y0 + 430, size: 118 }], emph: { what: { col: STYLE.hot } } });
}

// ---------------------------------------------------------------- 76.54 – 79.76
export function pc2Ring(g, t, c) {
  const K = c.K;
  promenade(g, t);
  const wantT = 79.18;
  const faceIdx = Math.floor(Math.max(0, t - 76.6) * 3.2) % RING.length;
  const f = RING[faceIdx];
  const lookX = clamp((f.x - 540) / 380, -1, 1), lookY = clamp((f.y - 1400) / 400, -1, 1);
  for (const p of RING) if (p.y < 1400) drawWho(g, t, p);
  clawd(g, 540, 1520, { s: 270, look: [lookX, lookY], eyes: 'open', armR: -1.25, hold: (g2, u) => slip(g2, u * .9, -u * 1.8, u * 3.8, -.08, {}), mouth: clamp(K.vocal(t)), blink: blinkAt(t, 3) });
  for (const p of RING) if (p.y >= 1400) drawWho(g, t, p);
  RING.forEach((p, i) => {
    const bp = inv(wantT - .35 + i * .05, wantT - .05 + i * .05, t);
    const bx = p.x + (p.x < 540 ? 40 : -40), by = p.y - p.s * 2.4 - 60;
    bubble(g, bx, by, 60, bp);
    if (bp > .3) want(g, p.want, bx, by, 66 * easeOutBack(bp, 2));
  });
  prePoster(g, t, 76.54, 78.08, 190);
}

// ---------------------------------------------------------------- 79.76 – 82.96
export function pc2Dizzy(g, t, c) {
  const K = c.K;
  promenade(g, t);
  g.save(); g.ink = null; g.fillStyle = rgba('#07051a', .5); g.fillRect(0, 0, W, H); g.restore();
  const stop = 82.4;
  const freeze = t > stop;
  const tt = Math.min(t, stop);
  const spin = (tt - 79.76) * (1.5 + (tt - 79.76) * .9);
  const read = smooth(inv(80.76, 81.3, tt));
  // Every want circling Clawd's head, faster and faster; then just the slip.
  RING.forEach((p, i) => {
    const a = spin + i / RING.length * TAU;
    const x = 540 + Math.cos(a) * 380, y = 1080 + Math.sin(a) * 150;
    g.save(); g.globalAlpha = 1 - read * .85;
    bubble(g, x, y, 66, 1); want(g, p.want, x, y, 72);
    g.restore();
  });
  clawd(g, 540, 1680, { s: 440, eyes: read > .5 ? 'open' : 'spiral', t: tt, look: read > .5 ? [0, -1] : [0, 0], armR: lerp(-.3, -1.5, read), armL: lerp(-.3, -1.5, read), mouth: freeze ? 0 : clamp(K.vocal(tt)), sweat: 1 - read });
  if (read > 0) slip(g, 540, lerp(1420, 1160, easeOutBack(read, 1.4)), 600 * read, -.04, {});
  keyLine(g, t, 79.76, 80.76, 210);
}
