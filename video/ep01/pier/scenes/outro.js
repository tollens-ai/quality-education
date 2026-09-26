// The outro: summer, by day. The gym log is exactly as good as it needs to be. It's a toy, and a
// toy is allowed to wash away when summer's done: the last line is written in the sand, and the
// tide takes it with the castle.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, confetti, noise1, INK } from '../kit.js';
import { ferrisWheel, washBand } from '../world.js';
import { clawd, person, molty, grok, blossom, muse, pen, nopen, tone } from '../cast.js';
import { blinkAt } from '../band.js';
import { phone, hand, flame } from '../props.js';
import { gymApp } from './final.js';
import { sing, backing, lineNear, STYLE } from '../lyrics.js';
import { letter, skeleton, measure, AUDIT } from '../hand.js';

// A summer sky and sea, painted; `sunset` 0..1 turns the day gold, then pink, then dusky.
export function beachDay(g, t, o = {}) {
  const ss = o.sunset || 0;
  const hz = o.hz ?? 1000;
  const top = ss < .5 ? mixHex('#62c4ee', '#ff9a6a', ss * 2) : mixHex('#ff9a6a', '#4a3a8a', (ss - .5) * 2);
  const low = ss < .5 ? mixHex('#cdeffd', '#ffd08a', ss * 2) : mixHex('#ffd08a', '#ff7a8a', (ss - .5) * 2);
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, hz, [[0, top], [1, low]]);
  g.fillRect(0, 0, W, hz + 2);
  for (let i = 0; i < 6; i++) washBand(g, 80 + i * 150, 130 + i * 150, '#ffffff', .05, i * 3);
  const sx = o.sunX ?? 780, sy = lerp(260, hz + 40, ss);
  glow(g, sx, sy, 560, ss > .3 ? '#ffb070' : '#fff6d0', .8);
  g.fillStyle = ss > .3 ? '#ffd494' : '#fffbe6'; circle(g, sx, sy, 90); g.fill();
  // Clouds: flat painted shapes with a lit top.
  for (let i = 0; i < 5; i++) {
    const cx = ((rnd(i, 801) * 1.4 - .2) * W + t * 8) % (W + 400) - 200, cy = 180 + rnd(i, 802) * 400;
    const col = ss < .5 ? '#ffffff' : '#ffc6b8';
    pen(g, 8, .5); g.ink = rgba('#6a7aa0', .6);
    g.fillStyle = rgba(col, .92);
    g.beginPath(); g.moveTo(cx - 150, cy + 30);
    for (let k = 0; k < 5; k++) { const bx = cx - 150 + k * 75; g.quadraticCurveTo(bx + 18, cy - 50 - (k % 2) * 26, bx + 75, cy + 4); }
    g.lineTo(cx + 225, cy + 30); g.closePath(); g.fill();
    g.ink = null;
  }
  // Sea with the sun's glitter.
  const sandY = o.sandY ?? 1300;
  g.fillStyle = ss < .5 ? '#3aa9cc' : mixHex('#3aa9cc', '#8a4a7a', (ss - .5) * 2);
  g.fillRect(0, hz, W, sandY - hz);
  g.fillStyle = ss < .5 ? rgba('#8fdde6', .6) : rgba(mixHex('#8fdde6', '#ff9a8a', (ss - .5) * 2), .6);
  g.fillRect(0, hz + (sandY - hz) * .55, W, (sandY - hz) * .45);
  for (let i = 0; i < 50; i++) { const x = (rnd(i, 811) * W + t * 20) % W, y = hz + rnd(i, 812) * (sandY - hz); g.strokeStyle = rgba('#ffffff', .5 * (rnd(i + INK.boil * 3, 814) > .3 ? 1 : .4)); g.lineWidth = 3; g.lineCap = 'round'; line(g, x, y, x + 30 + 30 * rnd(i, 813), y); g.stroke(); }
  if (o.pier !== false) {
    g.fillStyle = shade('#6a5a7a', ss * -.3); g.fillRect(-20, hz - 30, 460, 16);
    for (let x = 0; x < 440; x += 36) g.fillRect(x, hz - 16, 6, 30);
    ferrisWheel(g, t, 360, hz - 170, 130, { rot: t * .05, on: ss, frame: '#ffffff' });
  }
  g.fillStyle = mixHex('#f2d7a2', '#e0a080', ss); g.fillRect(0, sandY, W, H - sandY);
  for (let i = 0; i < 160; i++) { g.fillStyle = rgba('#a07a4a', .25); g.fillRect(rnd(i, 821) * W, sandY + rnd(i, 822) * (H - sandY), 3, 3); }
  g.restore();
}

// Surf: a foamy edge at y, advancing with `tide`.
function surf(g, t, y, amp = 1) {
  g.save(); g.ink = null;
  g.fillStyle = rgba('#ffffff', .88);
  g.beginPath(); g.moveTo(0, y);
  for (let x = 0; x <= W; x += 20) g.lineTo(x, y + Math.sin(x * .02 + t * 2) * 10 * amp + Math.sin(x * .05 - t * 3) * 5);
  g.lineTo(W, y - 40); g.lineTo(0, y - 40); g.closePath(); g.fill();
  g.restore();
}

// Writing in the sand: each stroke a groove, dark in the trough with a light lip, drawn as sung.
export function sandWrite(g, t, str, x, y, size, t0, dur, o = {}) {
  const p = clamp((t - t0) / dur);
  if (p <= 0) return;
  g.save();
  if (o.clipY !== undefined) { g.beginPath(); g.rect(-100, o.clipY, W + 200, H); g.clip(); }
  const ctx0 = AUDIT.ctx;
  if (AUDIT.on) AUDIT.ctx = { deco: true };
  letter(g, str, x + size * .035, y + size * .045, size, { align: o.align || 'center', col: rgba('#fff7e6', .85), w: .15, progress: p, seed: o.seed || 3, jitter: 1.4 });
  if (AUDIT.on) AUDIT.ctx = ctx0;
  letter(g, str, x, y, size, { align: o.align || 'center', col: o.col || '#6b3a17', w: .13, progress: p, seed: o.seed || 3, jitter: 1.4 });
  g.restore();
}

// ---------------------------------------------------------------- 184.6 – 187.7: good for you
export function summerTap(g, t, c) {
  const K = c.K;
  beachDay(g, t, { sunset: 0, sandY: 1300 });
  surf(g, t, 1305);
  g.save(); g.translate(540, 1620); g.rotate(-.06);
  pen(g, 10, .8); g.fillStyle = '#ff6a8a'; rr(g, -420, -150, 840, 360, 20); g.fill();
  nopen(g); g.fillStyle = '#fff6ee'; for (let i = 0; i < 5; i++) g.fillRect(-420 + i * 180, -150, 60, 360);
  g.restore();
  const tap = 185.88;
  phone(g, 540, 1060, 420, -.04, (g2, sx, sy, sw, sh) => gymApp(g2, sx, sy, sw, sh, t, { tap }), { glowA: .5 });
  hand(g, 560, 1600, 240, 0, 'hold', { sleeveCol: '#ffd166' });
  const tp = inv(tap - .45, tap, t);
  if (t < tap + .5) hand(g, lerp(900, 640, easeOut(tp)), lerp(1740, 1420, easeOut(tp)), 190, -.4, 'point', { sleeve: false });
  if (t > tap) { confetti(g, t, tap, 540, 1200, { n: 60, spread: 2.4, speed: 1200, seed: 91, life: 2.2, colors: [C.coral, C.gold, '#ff4a3a', '#ffffff'] }); for (let i = 0; i < 5; i++) { const p = inv(tap + i * .08, tap + .9 + i * .08, t); if (p <= 0 || p >= 1) continue; g.save(); g.globalAlpha *= 1 - p; flame(g, 380 + i * 80, 1100 - p * 300, 60, t + i); g.restore(); } }
  clawd(g, 890, 1760, { s: 210, glasses: true, eyes: 'open', armR: -1.5, armL: -.2, smile: 1, hat: 'sun' });
  sing(g, t, 184.84, { rows: [{ text: 'Make it good', y: 250, size: 90 }, { text: 'for you?', y: 400, size: 130 }], style: 'ink', emph: { you: { col: STYLE.berry } } });
  backing(g, t, 184.84, 540, 520, 56, STYLE.berry, { shade: { col: 'rgba(255,248,236,.9)', dx: .04, dy: .05 } });
}

// ---------------------------------------------------------------- 187.7 – 190.4: good for that
export function beachBots(g, t, c) {
  const K = c.K;
  beachDay(g, t, { sunset: .08, sandY: 1230 });
  surf(g, t, 1235);
  g.save(); pen(g, 10, .8);
  g.strokeStyle = '#f4f1ea'; g.lineWidth = 10; line(g, 220, 1560, 260, 1080); g.stroke();
  g.fillStyle = '#ff6a8a'; g.beginPath(); g.moveTo(40, 1150); g.quadraticCurveTo(250, 920, 470, 1090); g.closePath(); g.fill();
  nopen(g); g.fillStyle = '#fff6ee'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(40 + i * 150, 1150 - i * 20); g.quadraticCurveTo(110 + i * 150, 1000, 180 + i * 150, 1120 - i * 10); g.lineTo(120 + i * 150, 1130); g.closePath(); g.fill(); }
  g.restore();
  muse(g, 230, 1550, { s: 180, t, eyes: 'happy' });
  const bt = (t * 1.3) % 2;
  const bx = lerp(520, 900, bt < 1 ? bt : 2 - bt), by = 1260 - Math.sin((bt % 1) * Math.PI) * 300;
  molty(g, 470, 1580, { s: 170, t, eyes: 'happy', clawL: -1.2, clawR: -1.2 });
  grok(g, 930, 1580, { s: 160, arms: false });
  g.save(); g.translate(bx, by); g.rotate(t * 4);
  pen(g, 7, .8);
  const cols = ['#ff4a5a', '#ffd166', '#48c6ff', '#ffffff'];
  for (let k = 0; k < 4; k++) { g.fillStyle = cols[k]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 60, k * Math.PI / 2, (k + 1) * Math.PI / 2); g.closePath(); g.fill(); }
  g.restore();
  blossom(g, 700, 1720, { s: 150, eyes: 'happy' });
  g.save(); g.translate(785, 1560); g.rotate(.2); pen(g, 6, .7);
  g.fillStyle = '#e8b86a'; poly(g, [[-30, 0], [30, 0], [0, 90]]); g.fill();
  g.fillStyle = '#ffd1e0'; circle(g, 0, -10, 36); g.fill(); g.fillStyle = '#fff4d8'; circle(g, -14, -40, 28); g.fill();
  g.restore();
  g.save(); g.ink = null;
  for (let i = 0; i < 3; i++) { const gx = (t * 60 + i * 300) % (W + 200) - 100, gy = 700 + i * 80 + Math.sin(t * 2 + i) * 20; g.strokeStyle = '#3a3a4a'; g.lineWidth = 5; g.beginPath(); g.moveTo(gx - 30, gy); g.quadraticCurveTo(gx - 15, gy - 18 - Math.sin(t * 8 + i) * 8, gx, gy); g.quadraticCurveTo(gx + 15, gy - 18 - Math.sin(t * 8 + i) * 8, gx + 30, gy); g.stroke(); }
  g.restore();
  sing(g, t, 187.7, { rows: [{ text: 'Make it good', y: 250, size: 90 }, { text: 'for that?', y: 400, size: 130 }], style: 'ink', emph: { that: { col: STYLE.berry } } });
  backing(g, t, 187.7, 540, 520, 56, STYLE.berry, { shade: { col: 'rgba(255,248,236,.9)', dx: .04, dy: .05 } });
}

// ---------------------------------------------------------------- sandcastle
function sandcastle(g, x, y, s, wash = 0, t = 0) {
  const k = 1 - wash;
  g.save();
  if (k <= 0.02) { g.ink = null; g.fillStyle = rgba('#d9b07a', .6); ellipse(g, x, y, 220 * s, 30 * s); g.fill(); g.restore(); return; }
  g.translate(x, y); g.scale(s, s * (.25 + .75 * k));
  pen(g, 10, .8);
  g.fillStyle = '#e2bb7c';
  rr(g, -180, -120, 360, 120, 16); g.fill();
  for (const [tx, tw, th] of [[-150, 70, 220], [0, 110, 300], [150, 70, 220]]) {
    rr(g, tx - tw / 2, -th, tw, th, 10); g.fill();
    for (let k2 = 0; k2 < 3; k2++) { rr(g, tx - tw / 2 + k2 * tw / 3 + 4, -th - 22, tw / 3 - 8, 26, 4); g.fill(); }
  }
  nopen(g);
  g.fillStyle = 'rgba(150,100,55,.4)'; rr(g, -30, -80, 60, 80, 30); g.fill();
  g.strokeStyle = '#6a4a2a'; g.lineWidth = 5; line(g, 0, -320, 0, -430); g.stroke();
  pen(g, 6, .6); g.fillStyle = '#ff6a4a'; poly(g, [[0, -430], [70, -410], [0, -390]]); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- 190.4 – 193.26: just a toy
export function toyShot(g, t, c) {
  const K = c.K;
  beachDay(g, t, { sunset: .2, sandY: 1150 });
  surf(g, t, 1155);
  const built = easeOut(inv(190.3, 192.3, t));
  sandcastle(g, 720, 1400, .62 + .18 * built, 0, t);
  g.save(); pen(g, 7, .8);
  g.fillStyle = '#48c6ff'; poly(g, [[110, 1330], [230, 1330], [210, 1470], [130, 1470]]); g.fill();
  nopen(g); g.strokeStyle = '#2a8ab0'; g.lineWidth = 6; g.beginPath(); g.arc(170, 1330, 60, Math.PI, 0); g.stroke();
  g.restore();
  const dig = Math.sin(t * 9);
  clawd(g, 900, 1640, { s: 230, eyes: 'happy', hat: 'sun', armL: -.8 + dig * .4, armR: -.2, holdL: (g2, u) => { g2.save(); g2.rotate(.6 + dig * .3); pen(g2, u, .6); g2.fillStyle = '#ff4a5a'; rr(g2, -u * .15, -u * 2.2, u * .3, u * 2, u * .1); g2.fill(); g2.fillStyle = '#ffd166'; rr(g2, -u * .5, -u * 2.9, u, u * .9, u * .2); g2.fill(); g2.restore(); }, smile: 1, blush: .6 });
  g.save(); g.ink = null; for (let i = 0; i < 8; i++) { const p = ((t * 2 + i * .13) % 1); g.fillStyle = rgba('#d9a860', 1 - p); circle(g, 800 - p * 120 + i * 6, 1520 - Math.sin(p * Math.PI) * 120, 6); g.fill(); } g.restore();
  sing(g, t, 190.4, { rows: [{ text: 'Just a toy,', y: 290, size: 120 }, { text: 'and only for fun!', y: 440, size: 96 }], style: 'ink', emph: { toy: { col: STYLE.berry }, fun: { col: STYLE.berry } } });
}

// ---------------------------------------------------------------- 193.26 – end: when summer's done
export function tideShot(g, t, c) {
  const K = c.K;
  const ss = smooth(inv(193.2, 199.5, t));
  beachDay(g, t, { sunset: .25 + .75 * ss, sandY: 1150, sunX: 560 });
  const tide = smooth(inv(199.1, 200.4, t));
  const surfY = lerp(1160, 1620, tide);
  // The line, written in the sand as it's sung.
  const L = lineNear(193.26), ws = L.lead;
  // Each word is drawn in the sand as it's sung.
  const rows = [[0, 1, 1290, 94], [2, 3, 1405, 108], [4, 6, 1508, 68]];
  let wi = 0;
  for (const [a, b, y, size] of rows) {
    const words = ws.slice(a, b + 1).map(w => w.w.toUpperCase());
    const gap = size * .42, widths = words.map(s => measure(s, size, .13));
    let x = 490 - (widths.reduce((p, q) => p + q, 0) + gap * (words.length - 1)) / 2;
    words.forEach((word, k) => {
      const w = ws[a + k];
      if (AUDIT.on) AUDIT.ctx = { line: L.i, word: a + k };
      sandWrite(g, t, word, x, y, size, w.s, clamp(((w.e ?? w.s + .4) - w.s) * .8, .25, .6), { clipY: surfY + 20, align: 'left', seed: 3 + a + k });
      if (AUDIT.on) AUDIT.ctx = null;
      x += widths[k] + gap;
    });
  }
  sandcastle(g, 965, 1390, .44, smooth(inv(199.5, 200.4, t)), t);
  // The water comes up and takes it all, gently.
  g.save(); g.ink = null;
  g.fillStyle = rgba('#ffffff', .12 * tide); g.fillRect(0, 1150, W, surfY - 1150);
  g.fillStyle = rgba(mixHex('#8fdde6', '#ff9a8a', ss), .82); g.fillRect(0, 1150, W, surfY - 1150);
  g.restore();
  surf(g, t, surfY, 1.4);
  g.save(); g.ink = null;
  for (let i = 0; i < 10; i++) { const lt = t - 195 - i * .25; if (lt < 0) continue; const x = -60 + lt * (200 + 40 * rnd(i, 831)), y = 700 + i * 60 + Math.sin(lt * 3 + i) * 60; g.save(); g.translate(x, y); g.rotate(lt * 3 + i); pen(g, 4, .6); g.fillStyle = ['#e0703a', '#f2a640', '#c9502a'][i % 3]; ellipse(g, 0, 0, 22, 10); g.fill(); g.restore(); }
  g.restore();
  const wave = Math.sin(t * 7) * .5;
  muse(g, 170, 1760, { s: 150, t, eyes: 'happy' });
  molty(g, 330, 1770, { s: 140, t, eyes: 'happy', clawR: -1 - wave });
  clawd(g, 820, 1780, { s: 250, eyes: 'happy', armL: -.3, armR: -1.9 + wave, smile: 1, blush: .8 });
}
