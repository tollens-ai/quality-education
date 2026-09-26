// Intro and verse 1: "make it good" arrives with no one attached, and Clawd makes everything
// good at once: confetti for flossing, a bank vault on a gym log, a container port for a blog
// nobody reads, twelve copies of itself working round the clock. Then the power runs out.
// Every sung line is lettered into its shot.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, confetti, streamers, ballistic, INK } from '../kit.js';
import { clawd, mic, pen, nopen, tone } from '../cast.js';
import { blinkAt } from '../band.js';
import { phone, laptop, hand, battery, container, helm, clockFace, padlock, chain, paper, promptBox, HAND } from '../props.js';
import { voidStage, spotlight } from './void.js';
import { sing, lineNear, STYLE } from '../lyrics.js';
import { letter, letterArc, measure } from '../hand.js';

const PROMPT = 'make it good';
const GOLD = STYLE.hot, PINK = STYLE.pink;
// Confetti colours, one per letter of CONFETTI.
const CONF = ['#ff6fa8', '#48c6ff', '#ffc94a', '#8b6bff', '#ff8a4a', '#7ce29a', '#ff6fa8', '#48c6ff'];

// ---------------------------------------------------------------- the terminal screen
function terminal(g, sx, sy, sw, sh, t, o) {
  g.fillStyle = '#12111b'; g.fillRect(sx, sy, sw, sh);
  const pad = sw * .06;
  g.fillStyle = rgba(C.clawd, .95);
  g.font = `600 ${sw * .034}px Mono`; g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillText('✻ ready', sx + pad, sy + sh * .12);
  g.fillStyle = 'rgba(255,255,255,.3)';
  g.fillText('~/projects', sx + sw - pad - g.measureText('~/projects').width, sy + sh * .12);
  const bw = sw - pad * 2, bh = sh * .2;
  const by = sy + sh * .36;
  g.save();
  g.strokeStyle = o.flash ? mix('#8e8aa6', C.clawd, o.flash) : 'rgba(142,138,166,.7)';
  g.lineWidth = sw * .005; rr(g, sx + pad, by, bw, bh, bh * .2); g.stroke();
  if (o.flash) glow(g, sx + sw / 2, by + bh / 2, sw * .45, C.clawd, .5 * o.flash);
  const size = sw * .058;
  g.font = `500 ${size}px Mono`;
  g.fillStyle = '#8e8aa6'; g.fillText('>', sx + pad + bh * .35, by + bh / 2);
  const tx = sx + pad + bh * .35 + size * 1.15;
  let x = tx;
  PROMPT.split(' ').forEach((w, i) => {
    const hot = o.hot ? o.hot[i] : 0;
    g.fillStyle = mix('#f5f1e8', C.gold, hot);
    g.fillText(w, x, by + bh / 2);
    x += g.measureText(w + ' ').width;
  });
  const cw = g.measureText(PROMPT).width;
  if (!o.sent && Math.floor(t * 2.4) % 2 === 0) { g.fillStyle = '#f5f1e8'; g.fillRect(tx + cw + size * .1, by + bh / 2 - size * .55, size * .56, size * 1.1); }
  g.restore();
  if (o.reply > 0) {
    const r1 = '● Done! Made it good ✨', r2 = '  +4 features · 47 files changed';
    const n1 = Math.floor(o.reply * 60), n2 = Math.floor(Math.max(0, o.reply * 60 - r1.length));
    g.font = `600 ${sw * .044}px Mono`;
    g.fillStyle = '#f5f1e8'; g.fillText(r1.slice(0, n1), sx + pad, by + bh + sh * .14);
    g.font = `500 ${sw * .036}px Mono`;
    g.fillStyle = '#7fe0a0'; g.fillText(r2.slice(0, n2), sx + pad, by + bh + sh * .26);
  }
}

// A burst of four-point stars, the picture-book way of saying "ta-da".
function tada(g, t, t0, x, y, r0, r1, n = 10, seed = 1) {
  const p = inv(t0, t0 + .7, t);
  if (p <= 0 || p >= 1) return;
  g.save(); g.ink = null;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + rnd(i, seed) * .3, r = lerp(r0, r1, easeOut(p));
    g.fillStyle = rgba(i % 2 ? GOLD : '#fff6e2', 1 - p);
    star(g, x + Math.cos(a) * r, y + Math.sin(a) * r, 18 * (1 - p) + 5, 5 * (1 - p) + 2, 4, 0); g.fill();
  }
  g.restore();
}

// ---------------------------------------------------------------- INTRO 0 – 4.52
export function intro(g, t, c) {
  const K = c.K;
  const fy = 1470;
  const landT = 1.86;
  const lit = smooth(inv(2.0, 2.3, t));
  voidStage(g, t, { floorY: fy, tint: mixHex('#2c2470', '#6a2f7a', lit), glowA: .25 + .25 * lit, spot: lit > 0 ? { x: 540, w: 520, a: lit } : null });
  // Far off in the dark, soft dabs of colour: a Ferris wheel and a pier's lights. Where this is going.
  const wcx = 820, wcy = 820, wr = 230;
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * TAU + t * .05;
    const col = [C.pink, C.bulb, C.cyan, C.gold][i % 4];
    glow(g, wcx + Math.cos(a) * wr, wcy + Math.sin(a) * wr, 34, col, .5 + .15 * Math.sin(t * 2 + i));
  }
  for (let i = 0; i < 14; i++) glow(g, 60 + i * 70, 1080 + Math.sin(i * .5) * 8, 22, C.bulb, .45 + .12 * Math.sin(t * 3 + i));
  const lx = 540, lw = 760;
  const scr = { sy: fy - lw * .09 - lw * .64 };
  const peekY = scr.sy + 150, topY = scr.sy - 2;
  let cy, sq = 0, arms = [0, 0], eyes = 'open', look = [0, 0], mouth = 0;
  const bp = K.beatPos(t);
  if (t < 1.26) { cy = peekY + Math.sin(t * 5) * 3; look = t < .7 ? [0, .8] : [0, .2]; }
  else if (t < 1.46) { const p = inv(1.26, 1.46, t); cy = peekY + 34 * easeOut(p); sq = .22 * p; }
  else if (t < landT) { const p = inv(1.46, landT, t); cy = lerp(peekY + 34, topY, p) - Math.sin(p * Math.PI) * 330; sq = -.2 * Math.sin(p * Math.PI); arms = [-1.2, -1.2]; eyes = 'wide'; }
  else {
    const p = inv(landT, landT + .3, t);
    cy = topY; sq = .25 * Math.exp(-p * 5) * Math.cos(p * 14);
    const cheer = t > 2.02 ? 1 : 0;
    arms = cheer ? [-1.35 + .2 * Math.sin(t * 12), -1.35 - .2 * Math.sin(t * 12)] : [-.3, -.3];
    eyes = t > 2.02 ? 'happy' : 'open';
    if (t > 2.6) { sq += .05 * Math.pow(1 - (bp % 1), 3); arms = [-.9 - .25 * Math.sin(bp * Math.PI), -1.1]; }
    if (t > 4.05) { look = [1, 0]; eyes = 'open'; arms = [-.2, -1.35]; }
    mouth = t < 2.55 ? clamp(K.vocal(t)) : 0;
  }
  const sent = t >= 1.26, behind = t < 1.62;
  const drawClawd = () => clawd(g, lx + 20, cy, { s: 300, eyes, look, squash: sq, armL: arms[0], armR: arms[1], mouth, smile: t > 2.6 ? 1 : 0, shadow: !behind, glowEyes: t < 1.26 ? .25 : 0, blink: blinkAt(t, 2), blush: t > 2.1 ? .8 : 0 });
  const hotW = (a, b) => bump(t, a - .05, b + .35) > 0 ? Math.min(1, bump(t, a - .05, b + .35) * 1.6) : 0;
  if (behind) drawClawd();
  laptop(g, lx, fy, lw, (g2, sx, sy, sw, sh) => terminal(g2, sx, sy, sw, sh, t, { hot: [hotW(.82, .84), hotW(.84, 1.02), hotW(1.02, 1.24)], sent, flash: bump(t, 1.24, 1.7), reply: inv(2.55, 3.6, t) }), { glowA: 1.2 });
  if (!behind) drawClawd();
  if (t > 2.02) { confetti(g, t, 2.06, lx + 20, topY - 150, { n: 70, speed: 1300, spread: 2.4, seed: 5, life: 2.4 }); tada(g, t, 2.06, lx + 20, topY - 150, 120, 380); }
  // The words. What you said is already there when we arrive: it's the prompt.
  sing(g, t, 0, {
    pre: 5,
    rows: [
      { text: 'You said', y: 205, size: 76 },
      { text: 'make it good,', y: 350, size: 118 },
      { text: 'so I made it', y: 470, size: 76 },
      { text: 'good!', y: 668, size: 190 },
    ],
    emph: { '#9': { col: GOLD } },
  });
  if (t > 3.35) tada(g, t, 3.35, 540, 600, 220, 470, 12, 4);
}

// ---------------------------------------------------------------- habit tracker screen
function habitScreen(g, sx, sy, sw, sh, t, o) {
  g.fillStyle = '#fbf7f0'; g.fillRect(sx, sy, sw, sh);
  const pad = sw * .08;
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#9a94ad'; g.font = `600 ${sw * .05}px Bricolage`; g.fillText('MONDAY', sx + pad, sy + sh * .1);
  g.fillStyle = '#231c33'; g.font = `800 ${sw * .11}px Bricolage`; g.fillText('Habits', sx + pad, sy + sh * .17);
  const rows = [['Water', '#48b4ff', 'drop', true], ['Stretch', '#7ad37a', 'leaf', true], ['Floss', '#ff6fa3', 'tooth', o.done]];
  rows.forEach(([name, col, icon, done], i) => {
    const ry = sy + sh * (.24 + i * .13), rh = sh * .105;
    g.fillStyle = '#ffffff'; rr(g, sx + pad, ry, sw - pad * 2, rh, rh * .3); g.fill();
    const ix = sx + pad + rh * .55, iy = ry + rh / 2;
    g.fillStyle = rgba(col, .2); circle(g, ix, iy, rh * .32); g.fill();
    g.fillStyle = col;
    if (icon === 'drop') { g.beginPath(); g.moveTo(ix, iy - rh * .2); g.quadraticCurveTo(ix + rh * .16, iy + rh * .02, ix, iy + rh * .15); g.quadraticCurveTo(ix - rh * .16, iy + rh * .02, ix, iy - rh * .2); g.fill(); }
    if (icon === 'leaf') { ellipse(g, ix, iy, rh * .18, rh * .1, -.6); g.fill(); }
    if (icon === 'tooth') { rr(g, ix - rh * .13, iy - rh * .15, rh * .26, rh * .2, rh * .08); g.fill(); rr(g, ix - rh * .13, iy, rh * .09, rh * .16, rh * .04); g.fill(); rr(g, ix + rh * .04, iy, rh * .09, rh * .16, rh * .04); g.fill(); }
    g.fillStyle = '#231c33'; g.font = `700 ${rh * .36}px Bricolage`;
    g.fillText(name, ix + rh * .55, iy + rh * .13);
    const cx2 = sx + sw - pad - rh * .55;
    const pop = i === 2 ? o.pop : 0;
    const r2 = rh * .24 * (1 + .35 * pop);
    if (done) { g.fillStyle = col; rr(g, cx2 - r2, iy - r2, r2 * 2, r2 * 2, r2 * .35); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = rh * .07; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx2 - r2 * .45, iy); g.lineTo(cx2 - r2 * .1, iy + r2 * .38); g.lineTo(cx2 + r2 * .5, iy - r2 * .4); g.stroke(); }
    else { g.strokeStyle = 'rgba(40,30,60,.3)'; g.lineWidth = rh * .05; rr(g, cx2 - r2, iy - r2, r2 * 2, r2 * 2, r2 * .35); g.stroke(); }
  });
  if (o.banner > 0) {
    const b = easeOutBack(o.banner, 2);
    const by = sy + sh * .7, bh = sh * .15;
    g.save(); g.translate(sx + sw / 2, by + bh / 2); g.scale(b, b);
    g.fillStyle = '#ff6f8f'; rr(g, -sw * .42, -bh / 2, sw * .84, bh, bh * .3); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'center';
    g.font = `800 ${bh * .3}px Bricolage`; g.fillText('FLOSS STREAK', 0, -bh * .02);
    g.font = `800 ${bh * .26}px Bricolage`; g.fillText('1 DAY!!!', 0, bh * .3);
    g.restore();
  }
}

// A party popper: a striped cone with a gold rim, drawn in ink.
function cannon(g, x, y, s, ang, t, fireT, col) {
  const rec = fireT !== null && t > fireT ? Math.exp(-(t - fireT) * 9) * Math.sin((t - fireT) * 30) * .25 : 0;
  g.save(); g.translate(x, y); g.rotate(ang);
  g.translate(-rec * s, 0);
  pen(g, s / 9, .8);
  const cone = () => poly(g, [[-s * .9, -s * .14], [s * .7, -s * .42], [s * .7, s * .42], [-s * .9, s * .14]]);
  cone(); g.fillStyle = col; g.fill();
  nopen(g);
  g.save(); cone(); g.clip();
  g.fillStyle = 'rgba(255,250,240,.9)';
  for (let i = -4; i < 6; i++) { poly(g, [[i * s * .3, -s], [i * s * .3 + s * .12, -s], [i * s * .3 - s * .2, s], [i * s * .3 - s * .32, s]]); g.fill(); }
  g.fillStyle = 'rgba(40,0,40,.25)'; g.fillRect(-s, s * .12, s * 2, s);
  g.restore();
  pen(g, s / 9, .8);
  cone(); g.inkLine(g.ink, g.inkW);
  g.fillStyle = C.gold; ellipse(g, s * .7, 0, s * .11, s * .44); g.fill();
  nopen(g);
  g.fillStyle = '#3a1030'; ellipse(g, s * .72, 0, s * .06, s * .32); g.fill();
  if (fireT !== null && t > fireT && t < fireT + .35) glow(g, s * .8, 0, s * 1.2, '#fff4d8', (1 - (t - fireT) / .35));
  g.restore();
}

function discoBall(g, x, y, r, t) {
  g.save();
  g.strokeStyle = 'rgba(210,205,225,.7)'; g.lineWidth = 2; line(g, x, -20, x, y - r); g.stroke();
  glow(g, x, y, r * 2.2, '#dfe6ff', .45);
  pen(g, r / 10, .8);
  circle(g, x, y, r); g.fillStyle = '#8d8fa8'; g.fill();
  nopen(g);
  g.save(); circle(g, x, y, r); g.clip();
  const rot = t * 1.5;
  for (let j = -6; j <= 6; j++) for (let i = -8; i <= 8; i++) {
    const lat = j / 6 * Math.PI / 2, lon = i / 8 * Math.PI + rot % (Math.PI / 8);
    if (Math.cos(lon) < 0) continue;
    const px = x + Math.sin(lon) * Math.cos(lat) * r, py = y + Math.sin(lat) * r;
    const b = .3 + .7 * Math.abs(Math.sin(i * 1.7 + j * 2.3 + Math.floor(t * 8)));
    g.fillStyle = mix('#5a5d74', '#fffaf0', b);
    const sz = r / 7 * Math.cos(lat) * Math.cos(lon) + 1;
    g.fillRect(px - sz / 2, py - r / 14, sz, r / 7.5);
  }
  g.restore();
  for (let i = 0; i < 3; i++) { const a = Math.floor(t * 6) * 1.3 + i * 2.1; g.fillStyle = '#fffaf0'; star(g, x + Math.cos(a) * r * .6, y + Math.sin(a * 1.3) * r * .6, r * .28, r * .06, 4, 0); g.fill(); }
  g.restore();
}

// A balloon: a flat colour, a darker tone on one side, a painted highlight, a string.
function balloon(g, x, y, col, t, i) {
  g.save();
  g.strokeStyle = 'rgba(255,245,235,.45)'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, y + 66); g.quadraticCurveTo(x + Math.sin(t * 3 + i) * 14, y + 130, x + Math.sin(t * 2 + i) * 8, y + 200); g.stroke();
  pen(g, 6, .9);
  const b = () => ellipse(g, x, y, 54, 66);
  b(); g.fillStyle = col; g.fill();
  nopen(g); tone(g, b, col, shade(col, -.22), -12, -12);
  g.fillStyle = 'rgba(255,250,245,.7)'; g.save(); g.translate(x - 20, y - 26); g.rotate(-.5); rr(g, -12, -5, 24, 10, 5); g.fill(); g.restore();
  g.fillStyle = shade(col, -.2); poly(g, [[x - 7, y + 64], [x + 7, y + 64], [x, y + 74]]); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- CONFETTI 4.52 – 8.0
export function flossShot(g, t, c) {
  const fy = 1700;
  const fire = 7.04;
  const party = smooth(inv(fire, fire + .15, t));
  voidStage(g, t, { floorY: fy, tint: mixHex('#3a2270', '#a0307a', party), glowA: .35 + .3 * party, spot: { x: 540, w: 560, a: 1 } });
  // Party lights sweeping after the tap: painted beams.
  if (party > 0) {
    g.save(); g.ink = null; g.globalCompositeOperation = 'screen';
    const cols = [C.pink, C.cyan, C.gold, C.violet];
    for (let i = 0; i < 4; i++) {
      const a = Math.sin(t * 2.2 + i * 1.6) * .7;
      g.fillStyle = rgba(cols[i], .14 * party);
      poly(g, [[540, 150], [540 + Math.sin(a - .12) * 1800, 150 + Math.cos(a - .12) * 1800], [540 + Math.sin(a + .12) * 1800, 150 + Math.cos(a + .12) * 1800]]); g.fill();
    }
    g.restore();
  }
  const dropP = easeOutBack(inv(6.4, 6.85, t), 1.6);
  if (t > 6.4) discoBall(g, 900, lerp(-120, 600, dropP), 76, t);
  if (t > fire) for (let i = 0; i < 9; i++) {
    const bt = t - fire - i * .05;
    if (bt < 0) continue;
    const bx = 80 + i * 115 + Math.sin(bt * 2 + i) * 20, by = 1830 - bt * (380 + 90 * rnd(i, 44));
    balloon(g, bx, by, [C.pink, C.cyan, C.gold, C.violet, C.coral, '#7ce29a'][i % 6], t, i);
  }
  const px = 540, py = 1210, pw = 390;
  const bob = Math.sin(t * 2.4) * 6;
  const cans = [
    { x: 150, y: 930, a: -1.05, t0: 4.52, col: '#ff4fa3' },
    { x: 930, y: 950, a: Math.PI + 1.05, t0: 5.04, col: '#48c6ff' },
    { x: 140, y: 1480, a: -1.35, t0: 5.56, col: '#ffb13b' },
    { x: 940, y: 1500, a: Math.PI + 1.35, t0: 5.9, col: '#8b5bff' },
  ];
  for (const k of cans) {
    if (t < k.t0) continue;
    const s = 140 * spring(inv(k.t0, k.t0 + .45, t), 3.2, 6);
    cannon(g, k.x, k.y + bob * .5, s, k.a, t, fire, k.col);
  }
  phone(g, px, py + bob, pw, -.035, (g2, sx, sy, sw, sh) => habitScreen(g2, sx, sy, sw, sh, t, { done: t >= fire, pop: bump(t, fire, fire + .3), banner: inv(fire + .12, fire + .45, t) }), { glowA: 1.1 });
  const tapP = inv(6.55, fire, t);
  if (t > 6.5 && t < fire + .35) {
    const out = easeIn(inv(fire + .05, fire + .35, t));
    const hx = lerp(820, 700, easeOut(tapP)) + out * 300, hy = lerp(1650, 1340, easeOut(tapP)) + out * 700;
    hand(g, hx, hy + bob, 180, -.35, 'point', { sleeveCol: '#6a5cff' });
  }
  for (let i = 0; i < cans.length; i++) {
    const k = cans[i];
    const mx = k.x + Math.cos(k.a) * 105, my = k.y + Math.sin(k.a) * 105;
    streamers(g, t, fire + i * .03, mx, my, { n: 7, dir: k.a - .15, spread: 1, speed: 2100, seed: 40 + i, life: 3, w: 10 });
    confetti(g, t, fire + i * .03, mx, my, { n: 150, dir: k.a, spread: 1.1, speed: 2300, gravity: 650, drag: 2.2, seed: 20 + i, life: 3.4, size: 22 });
  }
  if (t > fire) confetti(g, t, fire + .12, 540, -60, { n: 120, dir: Math.PI / 2, spread: 3, speed: 600, gravity: 260, drag: 1.4, seed: 31, life: 3.2, size: 20 });
  if (t > fire + .1) {
    const p = spring(inv(fire + .1, fire + .5, t), 3, 6);
    const horn = (g2, u) => {
      g2.save(); g2.rotate(-.3);
      g2.fillStyle = C.gold; poly(g2, [[0, -u * .25], [u * 2.6, -u * .7], [u * 2.6, u * .7], [0, u * .25]]); g2.fill();
      const unroll = .5 + .5 * Math.sin(t * 14);
      g2.strokeStyle = C.pink; g2.lineWidth = u * .5; g2.lineCap = 'round';
      g2.beginPath(); g2.moveTo(u * 2.6, 0); g2.quadraticCurveTo(u * 4, -u * 1.5 * unroll, u * (3 + 2 * unroll), 0); g2.stroke();
      g2.restore();
    };
    clawd(g, 840, lerp(2000, 1760, p), { s: 240, hat: 'party', eyes: 'happy', armR: -.6, hold: horn, armL: -1.2 + .2 * Math.sin(t * 12), blush: 1 });
  }
  // CONFETTI in confetti colours; FLOSS lands with the cannons.
  sing(g, t, 4.52, {
    rows: [
      { text: 'Confetti', y: 235, size: 150, cols: CONF },
      { text: 'cannons', y: 395, size: 118 },
      { text: 'every time you', y: 510, size: 72 },
      { text: 'floss,', y: 710, size: 165 },
    ],
    emph: { 'floss': { col: PINK } },
  });
}

// ---------------------------------------------------------------- gym log screen
function gymScreen(g, sx, sy, sw, sh, t, o) {
  g.fillStyle = '#f4f7fb'; g.fillRect(sx, sy, sw, sh);
  const pad = sw * .08;
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#8a93a8'; g.font = `600 ${sw * .05}px Bricolage`; g.fillText('TODAY · PUSH DAY', sx + pad, sy + sh * .1);
  g.fillStyle = '#16213a'; g.font = `800 ${sw * .11}px Bricolage`; g.fillText('Gym Log', sx + pad, sy + sh * .17);
  g.fillStyle = '#ffffff'; rr(g, sx + pad, sy + sh * .23, sw - pad * 2, sh * .2, sw * .05); g.fill();
  g.fillStyle = '#16213a'; g.font = `800 ${sw * .075}px Bricolage`; g.fillText('Bench press', sx + pad * 1.6, sy + sh * .3);
  g.fillStyle = '#5b6b8c'; g.font = `600 ${sw * .06}px Bricolage`; g.fillText('60 kg  ×  8', sx + pad * 1.6, sy + sh * .37);
  g.fillStyle = '#2f7bff'; rr(g, sx + pad, sy + sh * .5, sw - pad * 2, sh * .11, sh * .05); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `800 ${sw * .07}px Bricolage`; g.fillText('+ LOG SET', sx + sw / 2, sy + sh * .575);
}

function vaultDoor(g, x, y, r, t, spin) {
  glow(g, x, y, r * 1.3, '#9fb4ff', .3);
  g.save();
  pen(g, r / 7, .9);
  const d = () => circle(g, x, y, r);
  d(); g.fillStyle = '#b7bdcf'; g.fill();
  nopen(g); tone(g, d, '#b7bdcf', '#80879e', -r * .12, -r * .12);
  g.strokeStyle = '#4a5068'; g.lineWidth = r * .05; circle(g, x, y, r * .86); g.stroke();
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.fillStyle = '#5a6078'; circle(g, x + Math.cos(a) * r * .93, y + Math.sin(a) * r * .93, r * .035); g.fill(); }
  g.save(); g.translate(x, y); g.rotate(spin);
  g.strokeStyle = '#2f3448'; g.lineWidth = r * .08; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; line(g, 0, 0, Math.cos(a) * r * .45, Math.sin(a) * r * .45); g.stroke(); g.fillStyle = '#2f3448'; circle(g, Math.cos(a) * r * .45, Math.sin(a) * r * .45, r * .07); g.fill(); }
  pen(g, r / 9, .8); g.fillStyle = '#dfe3ee'; circle(g, 0, 0, r * .15); g.fill();
  g.restore();
  g.restore();
}

function dumbbell(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  pen(g, s / 20, .8);
  g.fillStyle = '#a3a9bd'; rr(g, -s * .6, -s * .06, s * 1.2, s * .12, s * .05); g.fill();
  for (const sd of [-1, 1]) { g.fillStyle = '#2f3140'; rr(g, sd * s * .45 - s * .1, -s * .3, s * .2, s * .6, s * .06); g.fill(); rr(g, sd * s * .62 - s * .07, -s * .22, s * .14, s * .44, s * .05); g.fill(); }
  g.restore();
}

// ---------------------------------------------------------------- 2FA 8.0 – 10.76
export function twoFAShot(g, t, c) {
  const fy = 1760;
  voidStage(g, t, { floorY: fy, tint: '#1f3a7a', glowA: .4, spot: { x: 520, w: 560, a: 1 } });
  const slam = 8.0;
  const shake = t > slam ? Math.exp(-(t - slam) * 10) * Math.sin((t - slam) * 60) * 12 : 0;
  const px = 540 + shake, py = 1170, pw = 400;
  phone(g, px, py, pw, .02, (g2, sx, sy, sw, sh) => {
    gymScreen(g2, sx, sy, sw, sh, t, {});
    const sp = easeOutBack(inv(slam - .12, slam + .08, t), 1.2);
    if (t > slam - .12) {
      g2.save();
      g2.fillStyle = rgba('#0a0f24', .55 * sp); g2.fillRect(sx, sy, sw, sh);
      vaultDoor(g2, lerp(sx + sw * 1.6, sx + sw / 2, sp), sy + sh * .45, sw * .42, t, sp * 2 + (t > 9.9 ? (t - 9.9) * 3 : 0));
      g2.restore();
    }
    const mp = easeOutBack(inv(9.5, 9.8, t), 1.8);
    if (t > 9.5) {
      const my = lerp(sy - sh * .2, sy + sh * .06, mp);
      g2.fillStyle = 'rgba(245,245,250,.97)'; rr(g2, sx + sw * .06, my, sw * .88, sh * .12, sw * .06); g2.fill();
      g2.fillStyle = '#2fbf6f'; rr(g2, sx + sw * .1, my + sh * .025, sh * .07, sh * .07, sh * .018); g2.fill();
      g2.fillStyle = '#16213a'; g2.textAlign = 'left'; g2.font = `700 ${sw * .05}px Bricolage`; g2.fillText('Verify it’s you', sx + sw * .1 + sh * .09, my + sh * .05);
      g2.fillStyle = '#5b6b8c'; g2.font = `600 ${sw * .045}px Mono`; g2.fillText('code: 481 516', sx + sw * .1 + sh * .09, my + sh * .095);
    }
  }, { glowA: 1.1, glowCol: '#dbe6ff' });
  const c1 = inv(8.52, 8.72, t), c2 = inv(8.98, 9.18, t);
  const h2 = pw * 2.05 / 2;
  if (c1 > 0) chain(g, px - pw * .75, py - h2 * .6, lerp(px - pw * .6, px + pw * .7, easeOut(c1)), lerp(py - h2 * .6, py + h2 * .55, easeOut(c1)), 42);
  if (c2 > 0) chain(g, px + pw * .7, py - h2 * .6, lerp(px + pw * .7, px - pw * .7, easeOut(c2)), lerp(py - h2 * .6, py + h2 * .55, easeOut(c2)), 42);
  if (t > 9.32) padlock(g, px, py - 10, 140 * spring(inv(9.32, 9.7, t), 3, 6), Math.sin(t * 3) * .05);
  hand(g, px - 40, py + 520, 220, .08, 'hold', { sleeveCol: '#2a3040' });
  g.save(); g.translate(910, 1470); dumbbell(g, 0, -40, 220, -.5); g.restore();
  hand(g, 910, 1470, 180, -.4, 'fist', { sleeveCol: '#2a3040' });
  g.save(); g.ink = null;
  for (let i = 0; i < 3; i++) {
    const p = ((t * 1.1 + i * .33) % 1);
    const sx = 360 + i * 60, sy = 1540 + p * 160;
    g.fillStyle = rgba('#bfe8ff', .9 * (1 - p));
    g.beginPath(); g.moveTo(sx, sy - 16); g.quadraticCurveTo(sx + 10, sy + 2, sx, sy + 6); g.quadraticCurveTo(sx - 10, sy + 2, sx, sy - 16); g.fill();
  }
  g.restore();
  const p = spring(inv(8.1, 8.5, t), 3, 6);
  clawd(g, 170, lerp(2050, 1800, p), { s: 220, hat: 'guard', eyes: 'open', look: [1, -.4], armR: -1.4, armL: 0, frown: 1 });
  // 2FA, huge and red as a warning sign; the gym log small beneath it.
  sing(g, t, 8.0, {
    rows: [
      { text: '2FA', y: 395, size: 240 },
      { text: 'to use your', y: 515, size: 72 },
      { text: 'gym log,', y: 645, size: 108 },
    ],
    emph: { '2fa': { col: '#ff6a5a', w: .19 } },
  });
}

// ---------------------------------------------------------------- blog screen
function blogScreen(g, sx, sy, sw, sh, t, o) {
  g.fillStyle = '#fffdf8'; g.fillRect(sx, sy, sw, sh);
  const pad = sw * .07;
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#231c33'; g.font = `800 ${sw * .07}px Bricolage`; g.fillText('my blog', sx + pad, sy + sh * .2);
  g.fillStyle = '#9a94ad'; g.font = `600 ${sw * .035}px Bricolage`; g.fillText('POST #1', sx + pad, sy + sh * .36);
  g.fillStyle = '#231c33'; g.font = `800 ${sw * .06}px Bricolage`; g.fillText('hello world!', sx + pad, sy + sh * .5);
  g.fillStyle = 'rgba(60,50,80,.2)'; for (let i = 0; i < 2; i++) g.fillRect(sx + pad, sy + sh * (.58 + i * .08), sw * (.7 - i * .25), sh * .03);
  const pulse = o.pulse || 0;
  g.save(); g.translate(sx + sw - pad - sw * .12, sy + sh * .2); g.scale(1 + pulse * .5, 1 + pulse * .5);
  g.fillStyle = pulse > .05 ? '#ff4fa3' : '#e9e4f2'; rr(g, -sw * .14, -sh * .075, sw * .28, sh * .11, sh * .05); g.fill();
  g.fillStyle = pulse > .05 ? '#fff' : '#5a5270'; g.textAlign = 'center'; g.font = `800 ${sw * .04}px Bricolage`; g.fillText('1 view', 0, -sh * .005);
  g.restore();
}

// A tower crane drawn in ink at x, its jib reaching toward the centre; returns the jib tip.
function crane(g, x, fy, h, side, t) {
  const top = fy - h, mw = 34;
  g.save();
  g.strokeStyle = '#f0a53a'; g.lineWidth = 7;
  line(g, x - mw / 2, fy, x - mw / 2, top); g.stroke(); line(g, x + mw / 2, fy, x + mw / 2, top); g.stroke();
  g.lineWidth = 3;
  for (let y = fy; y > top; y -= mw) { line(g, x - mw / 2, y, x + mw / 2, y - mw); g.stroke(); line(g, x - mw / 2, y, x + mw / 2, y); g.stroke(); }
  const jl = 420, jy = top;
  g.lineWidth = 6; line(g, x, jy, x - side * jl, jy); g.stroke(); line(g, x, jy + 26, x - side * jl, jy + 8); g.stroke(); line(g, x, jy, x + side * 150, jy); g.stroke();
  g.lineWidth = 2.5; for (let k = 0; k < 12; k++) { const x0 = x - side * k * jl / 12; line(g, x0, jy, x0 - side * jl / 24, jy + 20 - k * 1.5); g.stroke(); }
  pen(g, 8, .6); g.fillStyle = '#3a3550'; g.fillRect(x + side * 100 - 30, jy - 4, 60, 40);
  nopen(g);
  g.strokeStyle = '#f0a53a'; g.lineWidth = 3;
  line(g, x, jy - 70, x - side * jl, jy); g.stroke(); line(g, x, jy - 70, x + side * 150, jy); g.stroke();
  g.lineWidth = 7; line(g, x, jy - 70, x, jy); g.stroke();
  glow(g, x, jy - 76, 36, '#ff4a5a', .7 * (Math.sin(t * 5 + side) > 0 ? 1 : .2)); g.fillStyle = '#ff4a5a'; circle(g, x, jy - 76, 7); g.fill();
  g.restore();
  return [x - side * jl, jy];
}

// ---------------------------------------------------------------- KUBERNETES 10.76 – 13.2
export function kubeShot(g, t, c) {
  const K = c.K;
  const fy = 1640;
  voidStage(g, t, { floorY: fy, tint: '#1d3f8a', glowA: .45, spot: { x: 540, w: 600, a: 1 } });
  const cols = ['#e0495d', '#2f7bff', '#1fb5a0', '#ff9f43', '#ffd166', '#8b5bff', '#48c6ff', '#ff6fa3'];
  const cw = 240, ch = 92;
  const slots = [];
  for (let i = 0; i < 21; i++) {
    const row = Math.floor(i / 3), colx = i % 3;
    slots.push({ x: 540 - cw * 1.5 + colx * cw + (row % 2 ? 22 : -22), y: fy - 230 - row * ch, c: cols[(i * 5 + row) % cols.length], t: 11.28 + i * .085 });
  }
  const landed = slots.filter(s => t > s.t);
  const top = landed.length ? landed[landed.length - 1].y : fy - 230;
  // Two cranes, and a banner slung between their jibs with the word on it.
  const [ax, ay] = crane(g, 60, fy, 1180, 1, t);
  const [bx2, by2] = crane(g, 1020, fy, 1180, -1, t);
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (t < s.t - .18) continue;
    const land = easeIn(clamp((t - (s.t - .18)) / .18));
    const bounce = t > s.t ? Math.exp(-(t - s.t) * 14) * Math.sin((t - s.t) * 42) * 5 : 0;
    const y = lerp(s.y - 900, s.y, land) + bounce;
    container(g, s.x, y, cw, ch, s.c);
    for (let k = 0; k < 3; k++) { const on = Math.sin(t * 9 + i * 3 + k * 2) > .2; g.fillStyle = on ? (k === 2 ? '#ff4a5a' : '#6dff9a') : '#1a2a20'; circle(g, s.x + cw * .82 + k * 11 - 11, y + ch * .22, 3.6); g.fill(); }
  }
  const hp = spring(inv(10.76, 11.2, t), 3, 6);
  helm(g, 540, Math.min(top - 110, 1240), 88 * hp, t * 3);
  laptop(g, 540, fy, 400, (g2, sx, sy, sw, sh) => blogScreen(g2, sx, sy, sw, sh, t, { pulse: bump(t, 12.2, 12.9) }), { glowA: 1.1 });
  const lever = inv(11.2, 11.6, t);
  const lx = 180, ly = fy - 10;
  g.save(); pen(g, 10, .7);
  g.fillStyle = '#2b2940'; rr(g, lx - 50, ly - 90, 100, 90, 14); g.fill();
  g.translate(lx, ly - 70); g.rotate(lerp(.9, -.9, easeOutBack(lever, 2)));
  g.strokeStyle = '#c9c4d6'; g.lineWidth = 14; g.lineCap = 'round'; line(g, 0, 0, 0, -150); g.stroke();
  g.fillStyle = '#ff4a5a'; circle(g, 0, -155, 26); g.fill();
  g.restore();
  clawd(g, lx + 160, fy + 10, { s: 210, eyes: t > 11.6 ? 'star' : 'open', look: [-1, -.5], armL: lerp(-.2, -1.3, easeOut(lever)), armR: -.3, mouth: 0, smile: 1 });
  // The banner: sagging canvas between the jibs, the word painted on it as it's sung.
  const L = lineNear(10.76);
  const bw0 = ax + 30, bw1 = bx2 - 30, byy = ay + 150, sag = 40;
  const drop = easeOutBack(inv(10.7, 11.0, t), 1.4);
  if (drop > 0) {
    const yb = lerp(ay - 300, byy, drop);
    g.save();
    g.strokeStyle = rgba(INK.col, .9); g.lineWidth = 3;
    line(g, ax, ay + 10, bw0, yb - 60); g.stroke(); line(g, bx2, by2 + 10, bw1, yb - 60); g.stroke();
    pen(g, 9, .8);
    g.fillStyle = '#f4ead6';
    g.beginPath(); g.moveTo(bw0, yb - 60); g.quadraticCurveTo(540, yb - 60 + sag, bw1, yb - 60); g.lineTo(bw1, yb + 90); g.quadraticCurveTo(540, yb + 90 + sag, bw0, yb + 90); g.closePath(); g.fill();
    g.restore();
    const w0 = L.lead[0];
    if (t >= w0.s - .01) letter(g, 'KUBERNETES', 540, yb + 60 + sag * .5, 104, { align: 'center', col: '#2f56c8', w: .17, shade: { col: 'rgba(30,20,60,.25)', dx: .03, dy: .04 }, progress: clamp((t - w0.s) / .35), seed: 91 });
  }
  // SCALING UP climbs a letter at a time; your blog is tiny, beside the one thing it needed.
  const ws = L.lead;
  const up = 'SCALING UP';
  if (t >= ws[1].s - .01) {
    const p = clamp((t - ws[1].s) / ((ws[2].e ?? ws[2].s + .3) - ws[1].s));
    const size = 84;
    let x = 540 - measure(up, size) / 2;
    [...up].forEach((ch2, i) => {
      if (ch2 === ' ') { x += size * .3; return; }
      const q = clamp(p * up.length - i);
      if (q > 0) letter(g, ch2, x, 560 - i * 16, size, { col: '#fff3de', w: .155, shade: STYLE.paint.shade, progress: q, seed: 70 + i });
      x += measure(ch2, size) + size * .07;
    });
  }
  // your blog, tiny, on a paper tag tied to the laptop: all that tower is for this.
  if (t >= ws[3].s - .05) {
    const sw2 = Math.sin(t * 2.4) * .06, p = easeOutBack(inv(ws[3].s - .05, ws[3].s + .2, t), 1.6);
    g.save(); g.translate(752, 1352); g.rotate(.16 + sw2); g.scale(p, p);
    g.strokeStyle = rgba(INK.col, .9); g.lineWidth = 2.5; line(g, 0, 0, 0, 40); g.stroke();
    pen(g, 8, .7); g.fillStyle = '#fbf4e4'; poly(g, [[-108, 40], [108, 40], [108, 128], [-108, 128], [-122, 84]]); g.fill();
    g.restore();
    g.save(); g.translate(752, 1352); g.rotate(.16 + sw2); g.scale(p, p);
    sing(g, t, 10.76, { from: 3, rows: [{ text: 'your blog,', x: 0, y: 104, size: 44 }], style: 'ink', o: { shade: null } });
    g.restore();
  }
}

// ---------------------------------------------------------------- SUBAGENTS 13.2 – 15.64
const DOCS = ['SUMMARY.md', 'PLAN.md', 'FINAL.md', 'NOTES.md', 'REPORT.md', 'DONE.md', 'FINAL_v2.md', 'TODO.md', 'STATUS.md', 'RECAP.md', 'README2.md', 'FIXES.md'];
export function subagentShot(g, t, c) {
  const fy = 1760;
  const race = inv(14.1, 15.6, t);
  const day = race > 0 ? .5 + .5 * Math.sin(race * TAU * 3 - Math.PI / 2) : 0;
  voidStage(g, t, { floorY: fy, tint: mixHex('#3a2a8a', '#ffb070', day * .6), glowA: .45 + day * .3, spot: { x: 540, w: 700, a: .7 } });
  const cx = 540, cy = 1060, R = 225;
  const spin = t > 14.16 ? easeIn(inv(14.16, 14.9, t)) * (t - 14.16) * 5 : 0;
  const angM = (t - 13.2) * .3 + spin * 12, angH = angM / 12 + .8;
  const orbit = t > 14.52 ? (t - 14.52) * .9 * easeOut(inv(14.52, 15, t)) : 0;
  clockFace(g, cx, cy, R, angH, angM, { glowA: 1 });
  for (let i = 0; i < 12; i++) {
    const tp = 13.2 + i * .065;
    if (t < tp) continue;
    const a = -Math.PI / 2 + i / 12 * TAU + orbit;
    const rr2 = R * 1.36;
    const x = cx + Math.cos(a) * rr2, y = cy + Math.sin(a) * rr2 + 40;
    const p = spring(inv(tp, tp + .35, t), 3.5, 6);
    const typing = t > 14.16;
    const wig = typing ? Math.sin(t * 40 + i) * .25 : 0;
    g.save(); g.translate(x, y); g.scale(p, p);
    glow(g, 0, -34, 50, '#bfe0ff', .4);
    pen(g, 6, .7);
    g.fillStyle = '#2b2940'; rr(g, -34, -58, 68, 44, 5); g.fill();
    nopen(g); g.fillStyle = '#bfe0ff'; rr(g, -30, -54, 60, 36, 3); g.fill();
    pen(g, 6, .7); g.fillStyle = '#b8b4c8'; poly(g, [[-40, -14], [40, -14], [46, -6], [-46, -6]]); g.fill();
    clawd(g, 0, 22, { s: 74, eyes: typing ? 'squeeze' : 'open', armL: -.5 + wig, armR: -.5 - wig, shadowA: .2, look: [0, .6] });
    g.restore();
    const dt = t - (14.3 + i * .05);
    if (dt > 0) {
      const out = [Math.cos(a) * 420, Math.sin(a) * 420 - 200];
      const [qx, qy] = ballistic(x, y - 40, out[0], out[1], 500, 1.4, dt);
      paper(g, qx, qy, 60, dt * (i % 2 ? 3 : -3) + i, DOCS[i]);
    }
  }
  clawd(g, 540, 1900, { s: 220, eyes: t > 14.2 ? 'star' : 'wide', look: [0, -1], armL: -1.1, armR: -1.1, mouth: 0, smile: 1 });
  // TWELVE SUBAGENTS above; WORKING ROUND THE CLOCK runs round the bottom of the dial.
  const L = lineNear(13.2);
  const ws = L.lead;
  sing(g, t, L, { rows: [{ text: 'twelve', y: 285, size: 150 }, { text: 'subagents', y: 420, size: 96 }] });
  const arc = 'WORKING ROUND THE CLOCK.';
  if (t >= ws[2].s - .01) {
    const p = clamp((t - ws[2].s) / ((ws[5].e ?? ws[5].s + .4) - ws[2].s));
    letterArc(g, arc, cx, cy, R * 1.36 + 135, Math.PI / 2, 64, { bottom: true, col: '#fff3de', w: .16, shade: STYLE.paint.shade, progress: p, seed: 51 });
  }
}

// ---------------------------------------------------------------- DID I DO IT WRONG? 15.64 – 17.04
export function wrongShot(g, t, c) {
  const fy = 1520;
  voidStage(g, t, { floorY: fy, tint: '#3a2a8a', glowA: .3, spot: { x: 540, w: 420, a: .9 } });
  const cols = ['#e0495d', '#2f7bff', '#1fb5a0', '#ff9f43', '#ffd166', '#8b5bff'];
  for (let i = 0; i < 10; i++) container(g, 60 + (i % 2) * 150, fy - 90 - Math.floor(i / 2) * 64, 150, 64, cols[i % cols.length]);
  helm(g, 210, fy - 90 - 5 * 64 - 50, 50, t * 3);
  clockFace(g, 850, fy - 360, 150, t * .5, t * 6, { glowA: .7 });
  for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i / 12 * TAU + t * .5; clawd(g, 850 + Math.cos(a) * 200, fy - 360 + Math.sin(a) * 200 + 18, { s: 40, eyes: 'squeeze', shadow: false, armL: Math.sin(t * 30 + i) * .3, armR: -Math.sin(t * 30 + i) * .3 }); }
  confetti(g, (t - 15.64) % 1.6 + 4, 4, 380, fy - 560, { n: 16, dir: -1.2, spread: .6, speed: 500, gravity: 600, seed: 3, life: 2 });
  vaultDoor(g, 400, fy - 520, 70, t, .4);
  clawd(g, 560, fy + 20, { s: 300, eyes: t > 16.2 ? 'worried' : 'open', look: t < 16.1 ? [Math.sin(t * 5) > 0 ? -1 : 1, -.2] : [0, 0], sweat: smooth(inv(16.1, 16.6, t)), frown: t > 16.2 ? 1 : 0, armL: .3, armR: .3 });
  battery(g, 560, fy - 450, 170, .12, { blink: t, glowA: 1 });
  // A small, shaky question.
  sing(g, t, 15.64, { rows: [{ text: 'Did I do it', y: 330, size: 92 }, { text: 'wrong?', y: 480, size: 120 }], jitter: 2.2 });
}

// ---------------------------------------------------------------- OOPS, YOUR QUOTA'S GONE 17.04 – 18.66
export function quotaShot(g, t, c) {
  const off = 18.12;
  const dark = smooth(inv(off, off + .12, t));
  const fy = 1760;
  voidStage(g, t, { floorY: fy, tint: '#5a2060', glowA: .45 * (1 - dark), spot: { x: 540, w: 600, a: 1 - dark }, dark });
  const level = lerp(.12, 0, easeIn(inv(17.3, 17.88, t)));
  if (dark < 1) {
    g.save(); g.globalAlpha = 1 - dark;
    battery(g, 540, 760, 400, level, { label: t > 17.5 ? 'QUOTA' : '', blink: level < .06 ? t : 0, glowA: 1.4 });
    if (t > 17.88) { g.ink = null; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const p = inv(17.88, 18.1, t); g.strokeStyle = rgba(C.gold, 1 - p); g.lineWidth = 6; line(g, 540 + Math.cos(a) * (230 + p * 80), 760 + Math.sin(a) * (120 + p * 60), 540 + Math.cos(a) * (270 + p * 120), 760 + Math.sin(a) * (150 + p * 90)); g.stroke(); } }
    g.restore();
  }
  const gasp = bump(t, 17.04, 17.5);
  clawd(g, 540, fy, { s: 540, eyes: 'wide', look: [0, -.6], mouth: t < 17.9 ? clamp(gasp * .9 + c.K.vocal(t) * .5) : 0, squash: -gasp * .08, armL: -.9 * gasp, armR: -.9 * gasp, dark, glowEyes: dark, shadow: dark < .5 });
  // The words go out with the lights: GONE! flickers and dies.
  // GONE! is the last light left: it flickers at the cut and hangs on, dim, in the dark.
  const flick = t < off ? 1 : t < off + .04 ? .2 : t < off + .08 ? .8 : .08;
  const last = t < off ? 1 : t < off + .05 ? .25 : t < off + .1 ? .9 : lerp(.75, .45, smooth(inv(off + .1, 18.6, t)));
  sing(g, t, 17.04, {
    rows: [{ text: 'Oops,', y: 300, size: 170, alpha: flick }, { text: "your quota's", y: 440, size: 86, alpha: flick }, { text: 'gone!', y: 1090, size: 190, alpha: last }],
    emph: { 'oops': { col: GOLD }, 'gone': { col: '#ff6a5a' } },
  });
}

// ---------------------------------------------------------------- GUESS I DIDN'T ASK 18.66 – 20.8
export function askShot(g, t, c) {
  g.save(); g.ink = null; g.fillStyle = '#08070f'; g.fillRect(0, 0, W, H); g.restore();
  const look = t < 18.95 ? [-1, 0] : t < 19.3 ? [1, 0] : [-.8, .9];
  clawd(g, 540, 1760, { s: 540, eyes: 'open', look, glowEyes: 1, dark: 1, shadow: false, blink: t > 19.05 && t < 19.12 ? 1 : 0, sweat: smooth(inv(19.4, 19.9, t)), smile: t > 19.4 ? .6 : 0 });
  if (t > 20.62) spotlight(g, t, 540, 1500, 520, smooth(inv(20.62, 20.8, t)) * .5);
  // Spoken, small, in chalk-pale letters: said to itself.
  sing(g, t, 18.66, { rows: [{ text: 'Guess I', y: 1130, size: 64 }, { text: "didn't ask!", y: 1230, size: 80 }], o: { col: '#d9d2ee', shade: null } });
}
