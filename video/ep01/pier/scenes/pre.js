// Pre-chorus: Clawd holds up everything it was given, a slip reading "make it good", under the
// colossal profile of your head. What you actually want glows inside it, blurred. It can't get in.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, INK } from '../kit.js';
import { clawd, pen, nopen, tone } from '../cast.js';
import { blinkAt } from '../band.js';
import { voidStage, spotlight } from './void.js';
import { sing, keyLine, STYLE } from '../lyrics.js';
import { letter } from '../hand.js';

// A smooth closed path through points (quadratic curves via midpoints).
function smoothPath(g, pts) {
  g.beginPath();
  const n = pts.length;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let m = mid(pts[n - 1], pts[0]);
  g.moveTo(m[0], m[1]);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; const mm = mid(p, q); g.quadraticCurveTo(p[0], p[1], mm[0], mm[1]); }
  g.closePath();
}

// Your head in profile, facing left, in a box at (x, y) of width w.
const PROFILE = [[.8, 1.3], [.77, 1.02], [.9, .86], [.99, .6], [.93, .3], [.72, .06], [.44, .0], [.22, .1], [.14, .26], [.12, .38], [.15, .44], [.06, .55], [.03, .58], [.13, .62], [.11, .66], [.16, .69], [.12, .73], [.15, .79], [.2, .86], [.34, .9], [.37, 1.02], [.33, 1.3]];
export function headPath(g, x, y, w) { smoothPath(g, PROFILE.map(([px, py]) => [x + px * w, y + py * w])); }

// The wants inside the head: the brief-to-be, blurred beyond reading.
function thoughts(g, t, cx, cy, s, blur) {
  const raw = g.raw || g;
  raw.save();
  raw.filter = `blur(${blur * raw.getTransform().a}px)`;
  const items = [['flame', C.coral], ['dumbbell', '#cfd6ff'], ['sun', C.gold], ['phone', '#9fe8ff'], ['heart', C.pink], ['person', '#ffd9b0'], ['star', '#fff3c4']];
  items.forEach(([kind, col], i) => {
    const a = t * .25 + i / items.length * TAU;
    const r = s * (.2 + .12 * Math.sin(t * .6 + i * 2));
    const x = cx + Math.cos(a) * r * 1.3, y = cy + Math.sin(a) * r * .9;
    const k = s * (.09 + .02 * Math.sin(t + i));
    raw.fillStyle = col; raw.strokeStyle = col; raw.lineCap = 'round';
    if (kind === 'flame') { raw.beginPath(); raw.moveTo(x, y - k); raw.quadraticCurveTo(x + k * .8, y, x, y + k * .7); raw.quadraticCurveTo(x - k * .8, y, x, y - k); raw.fill(); }
    if (kind === 'dumbbell') { raw.lineWidth = k * .25; line(raw, x - k, y, x + k, y); raw.stroke(); rr(raw, x - k * 1.1, y - k * .45, k * .3, k * .9, 3); raw.fill(); rr(raw, x + k * .8, y - k * .45, k * .3, k * .9, 3); raw.fill(); }
    if (kind === 'sun') { circle(raw, x, y, k * .5); raw.fill(); raw.lineWidth = k * .15; for (let j = 0; j < 8; j++) { const b = j / 8 * TAU; line(raw, x + Math.cos(b) * k * .7, y + Math.sin(b) * k * .7, x + Math.cos(b) * k, y + Math.sin(b) * k); raw.stroke(); } }
    if (kind === 'phone') { rr(raw, x - k * .45, y - k * .8, k * .9, k * 1.6, k * .15); raw.fill(); }
    if (kind === 'heart') { heart(raw, x, y, k * 1.4); raw.fill(); }
    if (kind === 'person') { circle(raw, x, y - k * .5, k * .35); raw.fill(); rr(raw, x - k * .5, y - k * .05, k, k * .8, k * .4); raw.fill(); }
    if (kind === 'star') { star(raw, x, y, k * .8, k * .35); raw.fill(); }
  });
  raw.filter = 'none';
  raw.restore();
  items.forEach(([, col], i) => { const a = t * .25 + i / items.length * TAU; const r = s * (.2 + .12 * Math.sin(t * .6 + i * 2)); glow(g, cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r * .9, s * .2, col, .55); });
}

function giantHead(g, t, x, y, w, o = {}) {
  g.save();
  g.ink = null;
  headPath(g, x, y, w);
  g.fillStyle = '#17143e'; g.fill();
  g.save(); headPath(g, x, y, w); g.clip();
  // Inside: a slow painted nebula, a few stars, and the wants.
  glow(g, x + w * .58, y + w * .38, w * .55, '#5a3ab0', .7);
  glow(g, x + w * .4, y + w * .7, w * .35, '#3a5ab0', .45);
  for (let i = 0; i < 60; i++) { const sx = x + w * (.2 + .75 * rnd(i, 301)), sy = y + w * (.05 + .8 * rnd(i, 302)); g.fillStyle = rgba('#ece6ff', .45 * (rnd(i + INK.boil * 37, 303) > .2 ? 1 : .3)); g.fillRect(sx, sy, 2.4, 2.4); }
  thoughts(g, t, x + w * .56, y + w * .3, w, o.blur ?? 14);
  if (o.splash) glow(g, o.splash[0], o.splash[1], w * .32, '#fff3c4', .8 * o.splash[2]);
  g.restore();
  // The outline: your profile drawn in one long cyan brush line.
  g.strokeStyle = rgba(o.rim || '#7fe8ff', .9); g.lineWidth = 7;
  headPath(g, x, y, w); g.stroke();
  g.restore();
}

// The slip of paper with the whole brief on it.
export function slip(g, x, y, w, rot, o = {}) {
  const h = w * .46;
  g.save(); g.translate(x, y); g.rotate(rot);
  g.ink = null; g.fillStyle = 'rgba(0,0,0,.3)'; rr(g, -w / 2 + w * .02, -h / 2 + w * .03, w, h, w * .03); g.fill();
  pen(g, w / 60, .8);
  const s = () => rr(g, -w / 2, -h / 2, w, h, w * .03);
  s(); g.fillStyle = '#fbf4e6'; g.fill();
  nopen(g); tone(g, s, '#fbf4e6', '#eadcc2', 0, -h * .1);
  if (!o.blank) {
    g.fillStyle = '#2a2238'; g.font = `600 ${w * .105}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(o.text || '> make it good', 0, h * .02);
  } else if (!o.form) {
    g.fillStyle = 'rgba(40,34,56,.14)'; for (let i = 0; i < 3; i++) g.fillRect(-w * .38, -h * .18 + i * h * .2, w * .76, w * .01);
  }
  if (o.draw) o.draw(g, w, h);
  g.restore();
}

// ---------------------------------------------------------------- 20.8 – 24.0
export function pcWide(g, t, c) {
  const K = c.K;
  const fy = 1640;
  const on = smooth(inv(20.75, 20.95, t));
  voidStage(g, t, { floorY: fy, tint: '#2a2470', glowA: .25 * on, spot: { x: 560, w: 520, a: on } });
  giantHead(g, t, 60, 40 - Math.sin(t * .3) * 8, 980, { blur: 16 });
  // Ghosts of everyone it might be for, on "who", with question marks on "what".
  const who = inv(21.7, 22.2, t), what = inv(23.05, 23.5, t);
  if (who > 0) {
    const ghosts = [[130, 1590, .9], [290, 1530, .72], [800, 1540, .75], [960, 1600, .95], [150, 1370, .55], [930, 1360, .55]];
    ghosts.forEach(([gx, gy, s], i) => {
      const a = clamp(who * 1.4 - i * .12) * .55 * (.8 + .2 * Math.sin(t * 3 + i));
      if (a <= 0) return;
      g.save(); g.globalAlpha = a; g.ink = null;
      g.strokeStyle = '#c6ccff'; g.lineWidth = 4.5; g.setLineDash([12, 10]);
      circle(g, gx, gy - 190 * s, 46 * s); g.stroke();
      rr(g, gx - 70 * s, gy - 140 * s, 140 * s, 150 * s, 50 * s); g.stroke();
      g.setLineDash([]);
      g.restore();
      if (what > 0) {
        const p = easeOutBack(clamp(what * 1.5 - i * .1), 2);
        g.save(); g.globalAlpha = Math.min(1, a * 1.8);
        pen(g, 6, .7); g.fillStyle = '#eceeff'; ellipse(g, gx + 50 * s, gy - 300 * s, 42 * s * p, 34 * s * p); g.fill(); nopen(g);
        g.restore();
        if (p > .3) letter(g, '?', gx + 50 * s, gy - 300 * s + 17 * s, 46 * s * p, { align: 'center', col: '#2b1f3c', w: .16, seed: i });
      }
    });
  }
  const bp = K.beatPos(t);
  const lift = easeOutBack(inv(20.8, 21.2, t), 1.4);
  const card = (g2, u) => slip(g2, u * 1.4, -u * 1.8, u * 4.2, -.08 + Math.sin(t * 3) * .03, {});
  clawd(g, 560, fy, {
    s: 290, eyes: 'open', look: t < 22.3 ? [-.5, -1] : [.4, -.6], armR: lerp(.2, -1.25, lift), hold: card, armL: -.1,
    squash: .03 * Math.pow(1 - bp % 1, 3), mouth: clamp(K.vocal(t)), blink: blinkAt(t, 4),
  });
  // The two lines build into one poster inside your head: WHO, then WHAT.
  sing(g, t, 20.8, { rows: [{ text: "You didn't tell me", y: 610, size: 66 }, { text: "who it's for,", y: 745, size: 118 }], emph: { who: { col: STYLE.hot } } });
  sing(g, t, 22.32, { rows: [{ text: "you didn't tell me", y: 905, size: 66 }, { text: 'what they want.', y: 1040, size: 118 }], emph: { what: { col: STYLE.hot } } });
}

// ---------------------------------------------------------------- 24.0 – 25.04
export function pcTorch(g, t, c) {
  const K = c.K;
  const fy = 1800;
  voidStage(g, t, { floorY: fy, tint: '#2a2470', glowA: .2 });
  const hx = -40, hy = -60, hw = 1160;
  const tx = 640, ty = 1600, lx = 520, ly = 660;
  const beamOn = smooth(inv(24.0, 24.12, t));
  giantHead(g, t, hx, hy, hw, { blur: 18, splash: [lx, ly, beamOn] });
  // The beam: a thin painted wedge of torchlight that stops dead at the surface.
  g.save(); g.ink = null; g.globalCompositeOperation = 'screen';
  const ang = Math.atan2(ly - ty, lx - tx), len = Math.hypot(lx - tx, ly - ty);
  g.translate(tx, ty); g.rotate(ang);
  g.fillStyle = rgba('#fff3c4', .2 * beamOn); poly(g, [[0, -14], [len, -170], [len, 170], [0, 14]]); g.fill();
  g.fillStyle = rgba('#fff3c4', .16 * beamOn); poly(g, [[0, -8], [len, -90], [len, 90], [0, 8]]); g.fill();
  g.restore();
  // The pool of light on the head, and in it the words: the torch finds them written on the outside.
  g.save(); headPath(g, hx, hy, hw); g.clip();
  g.ink = null; g.fillStyle = rgba('#fff4d6', .5 * beamOn); ellipse(g, lx, ly, 360, 300); g.fill();
  g.fillStyle = rgba('#fff4d6', .35 * beamOn); ellipse(g, lx, ly, 250, 210); g.fill();
  g.beginPath(); g.ellipse(lx, ly, 370, 310, 0, 0, TAU); g.clip();
  sing(g, t, 24.0, { rows: [{ text: "I can't read", x: lx, y: ly - 30, size: 92 }, { text: 'your mind,', x: lx, y: ly + 110, size: 120 }], style: 'ink', o: { shade: { col: 'rgba(255,248,230,.7)', dx: .04, dy: .05 } }, emph: { mind: { col: '#3d1a86' } } });
  g.restore();
  const torch = (g2, u) => {
    g2.save(); g2.rotate(ang);
    pen(g2, u, .7);
    g2.fillStyle = '#3a3550'; rr(g2, -u * .2, -u * .45, u * 2.4, u * .9, u * .25); g2.fill();
    g2.fillStyle = '#fff3c4'; rr(g2, u * 2.1, -u * .55, u * .35, u * 1.1, u * .12); g2.fill();
    g2.restore();
  };
  clawd(g, 720, fy, { s: 330, eyes: t > 24.5 ? 'squeeze' : 'open', look: [-.6, -1], armR: -.8, armL: -1.3, hold: torch, mouth: clamp(K.vocal(t)), frown: t > 24.5 ? 1 : 0 });
}

// ---------------------------------------------------------------- 25.04 – 27.2
export function pcRead(g, t, c) {
  const K = c.K;
  const fy = 1900;
  voidStage(g, t, { floorY: fy, tint: '#3a2a8a', glowA: .35, spot: { x: 540, w: 900, a: .8 } });
  glow(g, 760, 420, 600, '#5a3ab0', .5);
  const freeze = t > 26.85 ? 1 : 0;
  const tt = freeze ? 26.85 : t;
  const bob = Math.sin(tt * 2.5) * 6;
  const sy0 = 1010;
  slip(g, 540, sy0 + bob, 860, -.035, { text: '> make it good' });
  const mp = easeOut(inv(25.04, 26.12, tt));
  const mx = lerp(280, 690, mp), my = sy0 + 10 + bob + Math.sin(mp * Math.PI) * -30;
  g.save();
  circle(g, mx, my, 150); g.clip();
  g.translate(mx, my); g.scale(1.6, 1.6); g.translate(-mx, -my);
  slip(g, 540, sy0 + bob, 860, -.035, { text: '> make it good' });
  g.restore();
  g.save(); g.ink = null;
  g.fillStyle = 'rgba(200,230,255,.1)'; circle(g, mx, my, 150); g.fill();
  g.strokeStyle = '#2f2a44'; g.lineWidth = 24; circle(g, mx, my, 150); g.stroke();
  g.strokeStyle = C.gold; g.lineWidth = 7; circle(g, mx, my, 162); g.stroke();
  g.strokeStyle = '#2f2a44'; g.lineWidth = 36; g.lineCap = 'round'; line(g, mx + 110, my + 110, mx + 260, my + 280); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.5)'; g.save(); g.translate(mx - 70, my - 80); g.rotate(-.7); rr(g, -30, -8, 60, 16, 8); g.fill(); g.restore();
  g.restore();
  clawd(g, 540, 1900, { s: 380, eyes: 'open', look: [lerp(-.8, .6, mp), -1], armL: -1.4, armR: -1.0, mouth: freeze ? 0 : clamp(K.vocal(tt)), blink: 0 });
  // All it has is the prompt. The whole line stays up together: MIND above, PROMPT landing below.
  keyLine(g, t, 24.0, 25.04, 190);
}
