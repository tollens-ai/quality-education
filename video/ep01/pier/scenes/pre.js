// Pre-chorus: Clawd holds up everything it was given, a slip reading "make it good", under the
// colossal profile of your head. What you actually want glows inside it, blurred. It can't get in.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade } from '../kit.js';
import { clawd } from '../cast.js';
import { blinkAt } from '../band.js';
import { voidStage, spotlight, reflected } from './void.js';

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
  g.save();
  g.filter = `blur(${blur}px)`;
  const items = [
    ['flame', C.coral], ['dumbbell', '#cfd6ff'], ['sun', C.gold], ['phone', '#9fe8ff'], ['heart', C.pink], ['person', '#ffd9b0'], ['star', '#fff3c4'],
  ];
  items.forEach(([kind, col], i) => {
    const a = t * .25 + i / items.length * TAU;
    const r = s * (.2 + .12 * Math.sin(t * .6 + i * 2));
    const x = cx + Math.cos(a) * r * 1.3, y = cy + Math.sin(a) * r * .9;
    const k = s * (.09 + .02 * Math.sin(t + i));
    g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
    glow(g, x, y, k * 2.2, col, .5);
    if (kind === 'flame') { g.beginPath(); g.moveTo(x, y - k); g.quadraticCurveTo(x + k * .8, y, x, y + k * .7); g.quadraticCurveTo(x - k * .8, y, x, y - k); g.fill(); }
    if (kind === 'dumbbell') { g.lineWidth = k * .25; line(g, x - k, y, x + k, y); g.stroke(); rr(g, x - k * 1.1, y - k * .45, k * .3, k * .9, 3); g.fill(); rr(g, x + k * .8, y - k * .45, k * .3, k * .9, 3); g.fill(); }
    if (kind === 'sun') { circle(g, x, y, k * .5); g.fill(); g.lineWidth = k * .15; for (let j = 0; j < 8; j++) { const b = j / 8 * TAU; line(g, x + Math.cos(b) * k * .7, y + Math.sin(b) * k * .7, x + Math.cos(b) * k, y + Math.sin(b) * k); g.stroke(); } }
    if (kind === 'phone') { rr(g, x - k * .45, y - k * .8, k * .9, k * 1.6, k * .15); g.fill(); }
    if (kind === 'heart') { heart(g, x, y, k * 1.4); g.fill(); }
    if (kind === 'person') { circle(g, x, y - k * .5, k * .35); g.fill(); rr(g, x - k * .5, y - k * .05, k, k * .8, k * .4); g.fill(); }
    if (kind === 'star') { star(g, x, y, k * .8, k * .35); g.fill(); }
  });
  g.filter = 'none';
  g.restore();
}

function giantHead(g, t, x, y, w, o = {}) {
  // Rim and body.
  g.save();
  headPath(g, x, y, w);
  g.fillStyle = vgrad(g, y, y + w * 1.3, [[0, '#15123a'], [.6, '#0d0b28'], [1, '#07061a']]);
  g.fill();
  g.clip();
  // Inside: a slow nebula, and the wants.
  g.fillStyle = rgrad(g, x + w * .55, y + w * .4, 0, w * .6, [[0, rgba('#5a3ab0', .5)], [1, rgba('#5a3ab0', 0)]]);
  g.fillRect(x, y, w, w * 1.3);
  for (let i = 0; i < 80; i++) { const sx = x + w * (.2 + .75 * rnd(i, 301)), sy = y + w * (.05 + .8 * rnd(i, 302)); g.fillStyle = rgba('#e8e0ff', .3 * (.5 + .5 * Math.sin(t * 2 + i))); circle(g, sx, sy, 1.5 + rnd(i, 303) * 1.5); g.fill(); }
  thoughts(g, t, x + w * .56, y + w * .38, w, o.blur ?? 14);
  if (o.splash) { glow(g, o.splash[0], o.splash[1], w * .35, '#fff3c4', .5 * o.splash[2]); }
  g.restore();
  // Rim light around the silhouette.
  g.save();
  headPath(g, x, y, w);
  g.strokeStyle = rgba(o.rim || C.cyan, .55); g.lineWidth = 5; g.stroke();
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = rgba(o.rim || C.cyan, .18); g.lineWidth = 22; g.stroke();
  g.restore();
}

// The slip of paper with the whole brief on it.
export function slip(g, x, y, w, rot, o = {}) {
  const h = w * .46;
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, -w / 2 + w * .02, -h / 2 + w * .03, w, h, w * .03); g.fill();
  g.fillStyle = vgrad(g, -h / 2, h / 2, [[0, '#fffaf0'], [1, '#efe4cf']]);
  rr(g, -w / 2, -h / 2, w, h, w * .03); g.fill();
  if (!o.blank) {
    g.fillStyle = '#2a2238'; g.font = `600 ${w * .105}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(o.text || '> make it good', 0, h * .02);
  } else {
    g.fillStyle = 'rgba(40,34,56,.12)'; for (let i = 0; i < 3; i++) g.fillRect(-w * .38, -h * .18 + i * h * .2, w * .76, w * .01);
  }
  g.restore();
}

// ---------------------------------------------------------------- 20.8 – 24.0
export function pcWide(g, t, c) {
  const K = c.K;
  const fy = 1600;
  const on = smooth(inv(20.75, 20.95, t));
  voidStage(g, t, { floorY: fy, tint: '#2a2470', glowA: .25 * on, spot: { x: 560, w: 520, a: on } });
  giantHead(g, t, 60, 40 - Math.sin(t * .3) * 8, 980, { rim: C.cyan, blur: 16 });
  // Ghosts of everyone it might be for, on "who", with question marks on "what".
  const who = inv(21.7, 22.2, t), what = inv(23.05, 23.5, t);
  if (who > 0) {
    const ghosts = [[150, 1520, .9], [300, 1470, .7], [790, 1480, .75], [940, 1530, .95], [220, 1330, .55], [870, 1320, .55]];
    ghosts.forEach(([gx, gy, s], i) => {
      const a = clamp(who * 1.4 - i * .12) * .5 * (.8 + .2 * Math.sin(t * 3 + i));
      if (a <= 0) return;
      g.save(); g.globalAlpha = a;
      g.strokeStyle = '#bfc6ff'; g.lineWidth = 4; g.setLineDash([10, 9]);
      circle(g, gx, gy - 190 * s, 46 * s); g.stroke();
      rr(g, gx - 70 * s, gy - 140 * s, 140 * s, 150 * s, 50 * s); g.stroke();
      g.setLineDash([]);
      if (what > 0) {
        const p = easeOutBack(clamp(what * 1.5 - i * .1), 2);
        g.globalAlpha = a * 1.6 * p;
        g.fillStyle = 'rgba(230,232,255,.9)'; ellipse(g, gx + 50 * s, gy - 300 * s, 42 * s * p, 34 * s * p); g.fill();
        g.fillStyle = '#2a2470'; g.font = `800 ${46 * s}px Bricolage`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', gx + 50 * s, gy - 298 * s);
      }
      g.restore();
    });
  }
  const bp = K.beatPos(t);
  const lift = easeOutBack(inv(20.8, 21.2, t), 1.4);
  const card = (g2, u) => slip(g2, u * 1.4, -u * 1.8, u * 4.2, -.08 + Math.sin(t * 3) * .03, {});
  reflected(g, fy, () => clawd(g, 560, fy, {
    s: 290, eyes: 'open', look: t < 22.3 ? [-.5, -1] : [.4, -.6], armR: lerp(.2, -1.25, lift), hold: card, armL: -.1,
    squash: .03 * Math.pow(1 - bp % 1, 3), rim: C.cyan, rimSide: -1, mouth: clamp(K.vocal(t)), blink: blinkAt(t, 4),
  }), .2);
}

// ---------------------------------------------------------------- 24.0 – 25.04
export function pcTorch(g, t, c) {
  const K = c.K;
  const fy = 1760;
  voidStage(g, t, { floorY: fy, tint: '#2a2470', glowA: .2 });
  const hx = -40, hy = -60, hw = 1160;
  // Where the torch beam lands on the head: it spreads out on the surface and goes no further.
  const tx = 610, ty = 1540, lx = 520, ly = 620;
  const beamOn = smooth(inv(24.0, 24.12, t));
  giantHead(g, t, hx, hy, hw, { rim: C.cyan, blur: 18, splash: [lx, ly, beamOn] });
  g.save(); g.globalCompositeOperation = 'lighter';
  const ang = Math.atan2(ly - ty, lx - tx), len = Math.hypot(lx - tx, ly - ty);
  g.translate(tx, ty); g.rotate(ang);
  g.fillStyle = lgrad(g, 0, 0, len, 0, [[0, rgba('#fff3c4', .55 * beamOn)], [1, rgba('#fff3c4', .18 * beamOn)]]);
  poly(g, [[0, -14], [len, -150], [len, 150], [0, 14]]); g.fill();
  g.restore();
  // The light splashes flat across the surface.
  g.save(); headPath(g, hx, hy, hw); g.clip();
  g.fillStyle = rgrad(g, lx, ly, 0, 320, [[0, rgba('#fff7dc', .55 * beamOn)], [.4, rgba('#fff3c4', .18 * beamOn)], [1, rgba('#fff3c4', 0)]]);
  g.fillRect(lx - 340, ly - 340, 680, 680);
  g.restore();
  const torch = (g2, u) => {
    g2.save(); g2.rotate(ang);
    g2.fillStyle = '#3a3550'; rr(g2, -u * .2, -u * .45, u * 2.4, u * .9, u * .25); g2.fill();
    g2.fillStyle = '#fff3c4'; rr(g2, u * 2.1, -u * .55, u * .35, u * 1.1, u * .12); g2.fill();
    g2.restore();
  };
  clawd(g, 720, fy, { s: 340, eyes: t > 24.5 ? 'squeeze' : 'open', look: [-.6, -1], armR: -.8, armL: -1.3, hold: torch, rim: '#fff3c4', rimSide: -1, mouth: clamp(K.vocal(t)), frown: t > 24.5 ? 1 : 0 });
}

// ---------------------------------------------------------------- 25.04 – 27.2
export function pcRead(g, t, c) {
  const K = c.K;
  const fy = 1900;
  voidStage(g, t, { floorY: fy, tint: '#3a2a8a', glowA: .35, spot: { x: 540, w: 900, a: .8 } });
  // Blurred mind-glow far behind.
  glow(g, 740, 420, 700, '#5a3ab0', .35);
  // The slip, big, held up in Clawd's arm; Clawd peers at it through a magnifier.
  const freeze = t > 26.85 ? 1 : 0;
  const tt = freeze ? 26.85 : t;
  const bob = Math.sin(tt * 2.5) * 6;
  slip(g, 540, 820 + bob, 860, -.035, { text: '> make it good' });
  // Magnifier drifts over the words and settles on "prompt".
  const mp = easeOut(inv(25.04, 26.12, tt));
  const mx = lerp(280, 690, mp), my = 830 + bob + Math.sin(mp * Math.PI) * -30;
  g.save();
  circle(g, mx, my, 150); g.clip();
  g.translate(mx, my); g.scale(1.6, 1.6); g.translate(-mx, -my);
  slip(g, 540, 820 + bob, 860, -.035, { text: '> make it good' });
  g.restore();
  g.fillStyle = 'rgba(200,230,255,.1)'; circle(g, mx, my, 150); g.fill();
  g.strokeStyle = '#2f2a44'; g.lineWidth = 22; circle(g, mx, my, 150); g.stroke();
  g.strokeStyle = C.gold; g.lineWidth = 6; circle(g, mx, my, 160); g.stroke();
  g.strokeStyle = '#2f2a44'; g.lineWidth = 34; g.lineCap = 'round'; line(g, mx + 110, my + 110, mx + 260, my + 280); g.stroke();
  glow(g, mx - 50, my - 60, 60, '#ffffff', .25);
  // Clawd below, eyes on the paper.
  clawd(g, 540, 1720, { s: 420, eyes: 'open', look: [lerp(-.8, .6, mp), -1], armL: -1.4, armR: -1.0, rim: C.cyan, mouth: freeze ? 0 : clamp(K.vocal(tt)), blink: 0 });
}
