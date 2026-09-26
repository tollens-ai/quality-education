// Pre-chorus 2: the same complaint, now with everyone from the huts standing round Clawd, each
// wanting something different. Clawd still holds the same three words.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade } from '../kit.js';
import { nightSky, sea, town } from '../world.js';
import { clawd, person, grok, blossom } from '../cast.js';
import { blinkAt } from '../band.js';
import { PEOPLE } from './huts.js';
import { slip } from './pre.js';

// What each of them wants, as a little icon in a thought bubble.
function want(g, kind, x, y, s) {
  g.fillStyle = C.ink; g.strokeStyle = C.ink; g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'wow') { g.fillStyle = C.gold; star(g, x, y, s * .5, s * .22); g.fill(); star(g, x + s * .45, y - s * .35, s * .2, s * .09); g.fill(); }
  if (kind === 'last') { g.fillStyle = '#e0495d'; rr(g, x - s * .4, y - s * .4, s * .8, s * .8, s * .12); g.fill(); g.fillStyle = '#fff'; rr(g, x - s * .32, y - s * .18, s * .64, s * .5, s * .06); g.fill(); g.fillStyle = C.ink; g.font = `800 ${s * .36}px Bricolage`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('∞', x, y + s * .08); }
  if (kind === 'laugh') { g.fillStyle = '#ffd23a'; circle(g, x, y, s * .45); g.fill(); g.strokeStyle = '#6a3a00'; g.lineWidth = s * .08; g.beginPath(); g.arc(x, y + s * .04, s * .24, .1, Math.PI - .1); g.stroke(); }
  if (kind === 'pass') { g.strokeStyle = '#2fbf6f'; g.lineWidth = s * .16; g.beginPath(); g.moveTo(x - s * .35, y); g.lineTo(x - s * .08, y + s * .28); g.lineTo(x + s * .4, y - s * .3); g.stroke(); }
  if (kind === 'sweet') { g.fillStyle = C.pink; heart(g, x, y, s * .9); g.fill(); }
  if (kind === 'speak') { g.fillStyle = C.cyan; poly(g, [[x - s * .4, y - s * .15], [x - s * .15, y - s * .15], [x + s * .1, y - s * .38], [x + s * .1, y + s * .38], [x - s * .15, y + s * .15], [x - s * .4, y + s * .15]]); g.fill(); g.strokeStyle = C.cyan; g.lineWidth = s * .08; g.beginPath(); g.arc(x + s * .1, y, s * .3, -.7, .7); g.stroke(); }
  if (kind === 'safe') { g.fillStyle = '#6dff9a'; rr(g, x - s * .3, y - s * .05, s * .6, s * .45, s * .08); g.fill(); g.strokeStyle = '#6dff9a'; g.lineWidth = s * .1; g.beginPath(); g.arc(x, y - s * .05, s * .2, Math.PI, 0); g.stroke(); }
}
function bubble(g, x, y, r, p) {
  if (p <= 0) return;
  const s = easeOutBack(p, 2);
  g.fillStyle = 'rgba(245,242,255,.96)';
  circle(g, x, y, r * s); g.fill();
  circle(g, x - r * .7 * s, y + r * 1.05 * s, r * .22 * s); g.fill();
  circle(g, x - r * .95 * s, y + r * 1.45 * s, r * .12 * s); g.fill();
}

const RING = [
  { who: 'demo', want: 'wow', x: 150, y: 1180, s: 92 },
  { who: 'baker', want: 'last', x: 370, y: 1110, s: 86 },
  { who: 'chat2', want: 'laugh', x: 710, y: 1110, s: 86 },
  { who: 'student', want: 'pass', x: 930, y: 1180, s: 92 },
  { who: 'nana', want: 'sweet', x: 110, y: 1480, s: 104 },
  { who: 'blind', want: 'speak', x: 970, y: 1480, s: 104 },
  { who: 'grok', want: 'safe', x: 300, y: 1560, s: 112 },
  { who: 'blossom', want: 'safe', x: 780, y: 1560, s: 112 },
];

function promenade(g, t) {
  const hz = 760;
  nightSky(g, t, { horizon: hz, moon: { x: 900, y: 440, r: 40 } });
  town(g, t, hz);
  sea(g, t, hz, { reflections: [{ x: 880, col: C.moon, w: 26, a: .45 }] });
  // The huts along the back of the promenade, doors open, lit.
  const cols = ['#c9b3ff', '#9fe3c8', '#ffe08a', '#9fd4ff', '#ffb3c7', '#ffab91', '#7fdad0', '#ff9a6a'];
  for (let i = 0; i < 8; i++) {
    const x = 70 + i * 134, y = 930, w2 = 118, h2 = 120;
    g.fillStyle = shade(cols[i], -.3); g.fillRect(x - w2 / 2, y - h2, w2, h2);
    g.fillStyle = '#2a2038'; poly(g, [[x - w2 * .58, y - h2], [x, y - h2 - 46], [x + w2 * .58, y - h2]]); g.fill();
    glow(g, x, y - 50, 90, C.amber, .5);
    g.fillStyle = '#ffcf8a'; g.fillRect(x - 32, y - 82, 64, 82);
  }
  g.fillStyle = vgrad(g, 930, H, [[0, '#6a5a78'], [.25, '#43364f'], [1, '#150f1d']]);
  g.fillRect(0, 930, W, H - 930);
  glow(g, 540, 1350, 700, C.amber, .28);
}

// ---------------------------------------------------------------- 76.54 – 79.76
export function pc2Ring(g, t, c) {
  const K = c.K;
  promenade(g, t);
  const L1 = 76.54, whoT = 77.52, wantT = 79.18;
  // Clawd in the middle, turning from face to face.
  const faceIdx = Math.floor(Math.max(0, t - 76.6) * 3.2) % RING.length;
  const f = RING[faceIdx];
  const lookX = clamp((f.x - 540) / 380, -1, 1), lookY = clamp((f.y - 1300) / 400, -1, 1);
  for (const p of RING) {
    const pp = p.y < 1300 ? p : null;
    if (!pp) continue;
    drawWho(g, t, p);
  }
  clawd(g, 540, 1400, { s: 280, look: [lookX, lookY], eyes: 'open', armR: -1.25, hold: (g2, u) => slip(g2, u * .9, -u * 1.8, u * 3.8, -.08, {}), rim: C.amber, mouth: clamp(K.vocal(t)), blink: blinkAt(t, 3) });
  for (const p of RING) if (p.y >= 1300) drawWho(g, t, p);
  // The bubbles pop on "want".
  RING.forEach((p, i) => {
    const bp = inv(wantT - .35 + i * .05, wantT - .05 + i * .05, t);
    const bx = p.x + (p.x < 540 ? 40 : -40), by = p.y - p.s * 2.2 - 60;
    bubble(g, bx, by, 64, bp);
    if (bp > .3) want(g, p.want, bx, by, 70 * easeOutBack(bp, 2));
  });
}
function drawWho(g, t, p) {
  if (p.who === 'grok') return grok(g, p.x, p.y, { s: p.s * 1.1, arms: false, rim: C.cyan });
  if (p.who === 'blossom') return blossom(g, p.x, p.y, { s: p.s * 1.1, rim: C.pink });
  person(g, p.x, p.y, { s: p.s, ...PEOPLE[p.who], full: true, shadow: true, look: [(540 - p.x) / 500, 0], eyes: 'open', blink: blinkAt(t, p.x % 7) });
}

// ---------------------------------------------------------------- 79.76 – 82.96
export function pc2Dizzy(g, t, c) {
  const K = c.K;
  promenade(g, t);
  g.fillStyle = rgba('#07051a', .45); g.fillRect(0, 0, W, H);
  const stop = 82.4;
  const freeze = t > stop;
  const tt = Math.min(t, stop);
  const spin = (tt - 79.76) * (1.5 + (tt - 79.76) * .9);
  const read = smooth(inv(80.76, 81.3, tt));
  // Every want circling Clawd's head, faster and faster; then just the slip.
  RING.forEach((p, i) => {
    const a = spin + i / RING.length * TAU;
    const x = 540 + Math.cos(a) * 380, y = 760 + Math.sin(a) * 170;
    g.save(); g.globalAlpha = 1 - read * .85;
    bubble(g, x, y, 70, 1); want(g, p.want, x, y, 76);
    g.restore();
  });
  clawd(g, 540, 1560, { s: 460, eyes: read > .5 ? 'open' : 'spiral', t: tt, look: read > .5 ? [0, -1] : [0, 0], armR: lerp(-.3, -1.5, read), armL: lerp(-.3, -1.5, read), rim: C.amber, mouth: freeze ? 0 : clamp(K.vocal(tt)), sweat: 1 - read });
  // …and all it has to go on: three words, held up to you.
  if (read > 0) slip(g, 540, lerp(1300, 1010, easeOutBack(read, 1.4)), 640 * read, -.04, {});
}
