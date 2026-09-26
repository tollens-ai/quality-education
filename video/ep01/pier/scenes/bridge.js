// The bridge: where Clawd learned. A sky whose stars are everyone's code; a wall people throw their
// code over without looking; Clawd climbing up to look, and finding everyone there. TRAINING SET is
// a constellation, the wall is chalked, and the people beyond hold the question up on cards.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rrange, noise1, noise2, rr, circle, ellipse, line, poly, star, heart, glow, bulb, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, ballistic, INK } from '../kit.js';
import { nightSky, sea, reflection, lighthouse, town, moon, ferrisWheel, washBand, twinkle } from '../world.js';
import { clawd, person, pen, nopen, tone } from '../cast.js';
import { blinkAt } from '../band.js';
import { PEOPLE, HUT_COLS } from './huts.js';
import { sing, backing, lineNear, STYLE } from '../lyrics.js';
import { letter, skeleton, measure } from '../hand.js';

// What the internet taught: fragments of code and comment, as stars.
const FRAGS = [
  '// TODO: fix later', 'it works on my machine', "git commit -m 'stuff'", 'catch (e) {}', 'SELECT * FROM users',
  'if (true) {', 'rm -rf node_modules', "// don't touch this", 'final_final_v2.js', 'console.log("here")',
  'npm install', 'lgtm', '#include <stdio.h>', 'def main():', '</div></div></div>', 'why does this work??',
  '+1', 'thanks, fixed it', 'wontfix', 'x = x + 1', '// magic number', 'sleep(1000)', 'print(debug)',
  'return null;', 'TODO: tests', '!important', 'try again later', '// hack', 'for (i = 0; ...', 'segfault',
  'works now', 'copy of copy', 'v2_new_REAL', 'import *', 'eval(input)', '// temporary', 'hotfix', 'yolo',
  'ship it', 'it compiles', 'ok', 'retry()', 'assert True', 'goto fail', 'TODO', 'FIXME', '???', 'legacy',
];

// The code sky: a painted Milky Way, fragments of code for stars, threads of light pouring down
// into (fx, fy) while Clawd learns.
function codeSky(g, t, hz, o = {}) {
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, hz, [[0, '#090a2a'], [.45, '#12124a'], [.8, '#241862'], [1, '#3e2670']]);
  g.fillRect(0, 0, W, hz + 2);
  g.save(); g.translate(540, hz * .46); g.rotate(-.62); g.globalCompositeOperation = 'screen';
  [['#6a4aff', -120, 120, .14], ['#2fb0ff', -60, 50, .12], ['#ff4fa3', -30, 30, .1], ['#ffd9a0', -12, 14, .14]].forEach(([col, a, b, al], k) => washBand(g, a, b, col, al, 30 + k * 7, -1000, 1000));
  for (let i = 0; i < 26; i++) { const p = rnd(i, 715) * 2 - 1; glow(g, p * 900, (rnd(i, 716) - .5) * 160, 70 + 130 * rnd(i, 717), ['#7a5aff', '#3fb8ff', '#ff6ab0', '#ffd9a0'][i % 4], .35); }
  g.restore();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const cw = 150, ch = 46;
  const cols = Math.ceil(W / cw) + 1, rows = Math.ceil(hz / ch);
  for (let i = 0; i < cols * rows; i++) {
    const cx0 = (i % cols) * cw + ((Math.floor(i / cols)) % 2) * cw * .5 - cw * .5, cy0 = Math.floor(i / cols) * ch;
    const bx = cx0 + rnd(i, 701) * cw * .7, by = cy0 + rnd(i, 702) * ch * .6;
    if (by < 14 || by > hz - 24) continue;
    const d = Math.abs((by - hz * .46) * Math.cos(-.62) - (bx - 540) * Math.sin(-.62));
    const inBand = Math.exp(-d * d / (2 * 170 * 170));
    if (rnd(i, 703) > .26 + .6 * inBand) continue;
    const bright = Math.pow(rnd(i, 705), 4) * (.4 + .6 * inBand);
    const tw = rnd(i + INK.boil * 53, 706) > .2 ? 1 : .5;
    const size = 10 + bright * 18;
    const hush = o.quiet && by > o.quiet[0] && by < o.quiet[1] ? .22 : 1;
    const a = (.2 + .4 * inBand + .8 * bright) * tw * (o.alpha ?? 1) * hush;
    let x = bx, y = by;
    const fl = o.flow ? clamp(o.flow * 1.3 - rnd(i, 707) * .3) : 0;
    if (fl > 0 && rnd(i, 708) > .55) { const ph = ((t * .35 + rnd(i, 709)) % 1); x = lerp(bx, o.fx, ph * ph * fl); y = lerp(by, o.fy, ph * ph * fl); }
    g.font = `500 ${size}px Mono`;
    g.fillStyle = rgba(bright > .6 ? '#fff6e0' : '#d6dcff', Math.min(1, a));
    g.fillText(FRAGS[i % FRAGS.length], x, y);
  }
  for (let i = 0; i < 220; i++) { g.fillStyle = rgba('#eceeff', .55 * rnd(i, 711) * (rnd(i + INK.boil * 9, 712) > .2 ? 1 : .4)); g.fillRect(rnd(i, 712) * W, rnd(i, 713) * hz, 2.2, 2.2); }
  if (o.flow > 0) {
    for (let i = 0; i < 60; i++) {
      const sx = rnd(i, 731) * W, sy = rnd(i, 732) * hz * .8;
      const ph = (t * (.25 + .2 * rnd(i, 733)) + rnd(i, 734)) % 1;
      const cx = (sx + o.fx) / 2 + (rnd(i, 735) - .5) * 400, cy = Math.min(sy, o.fy) - 200;
      const pt = q => [(1 - q) * (1 - q) * sx + 2 * (1 - q) * q * cx + q * q * o.fx, (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * cy + q * q * o.fy];
      const col = ['#c6ccff', '#ffd9a0', '#8fecff', '#ffa6d6'][i % 4];
      g.strokeStyle = rgba(col, .6 * o.flow); g.lineWidth = 2.6; g.lineCap = 'round';
      g.beginPath();
      for (let k = 0; k <= 8; k++) { const q = Math.max(0, ph - k * .025); const [x, y] = pt(q); k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      const [hx, hy] = pt(ph);
      g.fillStyle = rgba('#fffaf0', .9 * o.flow); star(g, hx, hy, 7, 2, 4, 0); g.fill();
    }
  }
  g.restore();
}

// A word drawn as a constellation: stars along its strokes, joined by fine lines, appearing in
// writing order as it's sung.
function constellation(g, t, str, x, y, size, t0, dur) {
  const sk = skeleton(str, x, y, size, { align: 'center', w: .15, step: size * .16, seed: 21 });
  const n = sk.pts.length, p = clamp((t - t0) / dur);
  const shown = Math.floor(n * p);
  g.save(); g.ink = null;
  g.strokeStyle = rgba('#cfd8ff', .55); g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 1; i < shown; i++) {
    const a = sk.pts[i - 1], b = sk.pts[i];
    if (a[2] !== b[2]) continue;
    line(g, a[0], a[1], b[0], b[1]); g.stroke();
  }
  for (let i = 0; i < shown; i++) {
    const [sx, sy] = sk.pts[i];
    const big = i % 3 === 0;
    const tw = rnd(i + INK.boil * 17, 22) > .15 ? 1 : .55;
    glow(g, sx, sy, big ? 30 : 18, '#e6ecff', .6 * tw);
    twinkle(g, sx, sy, (big ? 13 : 8) * tw, i % 5 ? '#fbf7ff' : '#ffe6b0', 1);
  }
  g.restore();
}

// ---------------------------------------------------------------- 106.3 – 112.3: the training set
export function trainingShot(g, t, c) {
  const K = c.K;
  const hz = 1240;
  codeSky(g, t, hz, { flow: smooth(inv(109.6, 111.4, t)), fx: 540, fy: 1500, quiet: [150, 780] });
  sea(g, t, hz, { reflections: [{ x: 540, col: '#cfd6ff', w: 60, a: .3 }] });
  g.save(); g.ink = null;
  for (let i = 0; i < 50; i++) { const x = rnd(i, 721) * W, y = hz + 20 + rnd(i, 722) * 500; g.strokeStyle = rgba('#cfd6ff', .16 * (rnd(i + INK.boil * 5, 723) > .3 ? 1 : .4)); g.lineWidth = 3; line(g, x - 20, y, x + 20, y); g.stroke(); }
  g.restore();
  // The end of the pier, quiet now.
  g.save(); pen(g, 10, .8);
  g.fillStyle = '#2c1c38'; poly(g, [[140, 1560], [940, 1560], [1080, H], [0, H]]); g.fill();
  g.fillStyle = '#1c1128'; g.fillRect(140, 1540, 800, 24);
  for (let x = 150; x < 940; x += 50) { rr(g, x, 1480, 10, 64, 3); g.fill(); }
  g.fillRect(140, 1476, 800, 10);
  g.restore();
  const up = smooth(inv(106.5, 108, t));
  const learn = smooth(inv(109.6, 111.4, t));
  if (learn > 0) glow(g, 540, 1470, 260 * learn, '#cfd6ff', .6 * learn);
  clawd(g, 540, 1560, { s: 240, look: [0, -1 * up], eyes: learn > .3 ? 'star' : 'open', armL: -.1, armR: -.1, shadow: false, blink: blinkAt(t, 6), mouth: clamp(K.vocal(t) * .8) });
  // I COULD ONLY LEARN FROM MY in paint; TRAINING SET in stars.
  const L = lineNear(107.1), ws = L.lead;
  sing(g, t, L, { rows: [{ text: 'I could only learn', y: 290, size: 84 }, { text: 'from my', y: 400, size: 70 }] });
  if (t >= ws[6].s) constellation(g, t, 'TRAINING SET', 540, 640, 150, ws[6].s, (ws[7].e ?? ws[7].s + .5) - ws[6].s + .3);
  backing(g, t, L, 540, 1190, 60);
}

// ---------------------------------------------------------------- 112.3 – 117.3: over the wall
function wallFace(g, t, top, bottom) {
  g.save();
  g.ink = null;
  g.fillStyle = '#35304a'; g.fillRect(0, top, W, bottom - top);
  const rows = 7;
  pen(g, 10, .6);
  for (let r = 0; r < rows; r++) {
    const y0 = top + (bottom - top) * r / rows, y1 = top + (bottom - top) * (r + 1) / rows;
    const off = (r % 2) * 90;
    for (let x = -off; x < W; x += 180) {
      const shadeV = .08 * (rnd(r * 31 + Math.round(x), 731) - .5);
      g.fillStyle = mix('#2c2742', '#4d4566', .45 + shadeV + (r / rows) * -.2);
      rr(g, x + 4, y0 + 4, 172, y1 - y0 - 8, 12); g.fill();
    }
  }
  g.fillStyle = '#4f4870'; g.fillRect(-10, top - 20, W + 20, 26);
  g.restore();
}
function plane(g, x, y, s, rot, a = 1) {
  if (a <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= a;
  pen(g, Math.max(1, s / 10), .6);
  g.fillStyle = '#fbf6ec'; poly(g, [[s, 0], [-s * .8, -s * .55], [-s * .45, 0]]); g.fill();
  g.fillStyle = '#d9d0c0'; poly(g, [[s, 0], [-s * .8, s * .55], [-s * .45, 0]]); g.fill();
  g.restore();
}
export function wallShot(g, t, c) {
  const K = c.K;
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, 760, [[0, '#101036'], [1, '#3a3266']]); g.fillRect(0, 0, W, 760);
  g.restore();
  for (let i = 0; i < 12; i++) { const x = ((rnd(i, 741) * 1.4 - .2) * W + t * 12 * (1 + rnd(i, 742))) % (W + 400) - 200; glow(g, x, 560 + rnd(i, 743) * 200, 300, '#c8bef0', .45); }
  glow(g, 780, 400, 380, '#d8d0ff', .5);
  g.save(); g.ink = null; g.fillStyle = rgba('#fff4e0', .6); circle(g, 780, 400, 60); g.fill(); g.restore();
  wallFace(g, t, 760, 1500);
  for (let i = 0; i < 6; i++) {
    const lx = 90 + i * 180;
    g.save(); g.ink = null; g.globalCompositeOperation = 'screen';
    g.fillStyle = rgba(C.amber, .12); poly(g, [[lx - 20, 750], [lx + 20, 750], [lx + 120, 1300], [lx - 120, 1300]]); g.fill();
    g.restore();
    g.save(); pen(g, 6, .6); g.fillStyle = '#1f1430'; g.fillRect(lx - 4, 690, 8, 60); g.restore();
    bulb(g, lx, 686, 9, C.bulb, 1);
  }
  g.save(); g.ink = null; g.fillStyle = vgrad(g, 1500, H, [[0, '#2c2139'], [1, '#100b17']]); g.fillRect(0, 1500, W, H - 1500); g.restore();
  // The words, chalked on the wall as they're sung: someone else's graffiti, now Clawd's line.
  const L = lineNear(112.3);
  sing(g, t, L, { rows: [{ text: 'to write code', y: 930, size: 84 }, { text: 'and throw it', y: 1070, size: 84 }, { text: 'over the wall.', y: 1240, size: 124 }], o: { col: '#f2eee4', shade: null }, emph: { wall: { col: '#ffe8a8' } }, jitter: 1.6 });
  const coders = [];
  for (let i = 0; i < 9; i++) coders.push({ x: 60 + i * 120 + (i % 2) * 20, y: 1590 + (i % 3) * 30, s: 70 + (i % 3) * 8, i });
  for (const cd of coders) {
    const ph = ((t * .55 + rnd(cd.i, 751)) % 1);
    const throwing = ph < .25;
    glow(g, cd.x, cd.y - cd.s * 2.2, cd.s * 2.4, '#8fb4ff', .45);
    g.save(); pen(g, 6, .6); g.ink = '#07040c';
    g.fillStyle = '#140d1f';
    rr(g, cd.x - cd.s * .6, cd.y - cd.s * 2.6, cd.s * 1.2, cd.s * 2.6, cd.s * .4); g.fill();
    g.beginPath(); g.arc(cd.x, cd.y - cd.s * 3, cd.s * .6, Math.PI, 0); g.closePath(); g.fill();
    const a = throwing ? lerp(.4, -2.6, ph / .25) : .4;
    g.strokeStyle = '#140d1f'; g.lineWidth = cd.s * .3; g.lineCap = 'round';
    line(g, cd.x + cd.s * .4, cd.y - cd.s * 2.2, cd.x + cd.s * .4 + Math.sin(a) * cd.s * 1.2, cd.y - cd.s * 2.2 - Math.cos(a) * cd.s * 1.2); g.stroke();
    g.restore();
    const ft = ((t * .55 + rnd(cd.i, 751)) % 1) * (1 / .55) - .45;
    if (ft > 0 && ft < 1.3) plane(g, cd.x + ft * 200, cd.y - cd.s * 3.2 - ft * 1000 + ft * ft * 300, 34, -.8 + ft * .6, 1 - smooth(inv(.8, 1.3, ft)));
  }
  const cph = inv(113.7, 114.3, t);
  const tossed = t > 114.2;
  clawd(g, 700, 1790, { s: 210, look: [.2, -1], eyes: tossed ? 'happy' : 'open', armR: lerp(.2, -2.4, easeOut(cph)), armL: -.2, mouth: clamp(K.vocal(t) * .8), hold: !tossed ? (g2, u) => plane(g2, u * .5, -u * .5, u * 1.6, -.8, 1) : undefined });
  if (tossed) { const ft = (t - 114.2) * .9; plane(g, 760 + ft * 250, 1500 - ft * 900 + ft * ft * 260, 44, -.7 + ft * .5, 1 - smooth(inv(.9, 1.4, ft))); }
  backing(g, t, L, 540, 1420, 58);
}

// ---------------------------------------------------------------- 117.3 – 123.4: how do you know?
export function climbShot(g, t, c) {
  const K = c.K;
  g.save(); g.ink = null; g.fillStyle = vgrad(g, 0, H, [[0, '#101036'], [1, '#2c2652']]); g.fillRect(0, 0, W, H); g.restore();
  const climb = easeInOut(inv(121.0, 123.3, t));
  const rise = climb * 700;
  const top = 260 - 700 + rise;
  g.save(); g.ink = null; g.fillStyle = vgrad(g, 0, Math.max(40, top), [[0, '#1c1c4a'], [1, '#7a6aa0']]); g.fillRect(0, 0, W, Math.max(0, top + 20)); g.restore();
  glow(g, 540, top - 40, 640, '#ffcf8a', .35 + .45 * climb);
  wallFace(g, t, top, H + 800);
  for (let i = 0; i < 8; i++) glow(g, rnd(i, 761) * W, top - 60, 200, '#dcd2fa', .4);
  const lx = 540;
  g.save(); pen(g, 12, .8);
  g.strokeStyle = '#9a7650'; g.lineWidth = 18;
  line(g, lx - 110, H, lx - 110, top - 60); g.stroke(); line(g, lx + 110, H, lx + 110, top - 60); g.stroke();
  g.lineWidth = 13; for (let y = top + ((H - top) % 110); y < H; y += 110) { line(g, lx - 110, y, lx + 110, y); g.stroke(); }
  g.restore();
  for (let i = 0; i < 6; i++) {
    const ph = ((t * .6 + i / 6) % 1);
    plane(g, (i % 2 ? 180 : 860) + (i % 3) * 60 + ph * 60, H + 60 - ph * (H + 200), 40, -1.2 + Math.sin(ph * 6 + i) * .15, 1 - smooth(inv(.8, 1, ph)));
  }
  const cy = lerp(1780, 1380, climb) - Math.abs(Math.sin(t * 6)) * 14 * (climb > 0 && climb < 1 ? 1 : 0);
  const L = lineNear(117.32), ws = L.lead;
  const unf = smooth(inv(117.3, 117.9, t));
  const lantern = (g2, u) => {
    g2.save(); g2.ink = null; g2.strokeStyle = '#3a3040'; g2.lineWidth = u * .2; line(g2, 0, 0, 0, u * 1.2); g2.stroke(); g2.restore();
    glow(g2, 0, u * 1.9, u * 4, C.amber, .9);
    g2.save(); pen(g2, u, .6); g2.fillStyle = '#3a3040'; rr(g2, -u * .6, u * 1.2, u * 1.2, u * .3, u * .1); g2.fill();
    g2.fillStyle = '#ffd98a'; rr(g2, -u * .5, u * 1.5, u * 1, u * 1, u * .3); g2.fill(); g2.restore();
  };
  // The unfolded page: a blank plan and a blank checklist; the words land on them.
  const pageOn = unf * (1 - smooth(inv(121.0, 121.4, t)));
  if (pageOn > 0) {
    g.save(); g.translate(540, 1080); g.scale(pageOn, pageOn); g.rotate(-.04);
    pen(g, 10, .8); g.fillStyle = '#fbf6ec'; rr(g, -340, -230, 680, 460, 16); g.fill(); nopen(g);
    g.strokeStyle = '#7a8ad0'; g.lineWidth = 4; g.setLineDash([12, 10]); rr(g, -300, -190, 280, 270, 10); g.stroke(); g.setLineDash([]);
    g.strokeStyle = '#2fbf6f'; g.lineWidth = 5;
    for (let k = 0; k < 4; k++) { rr(g, 40, -180 + k * 64, 42, 42, 6); g.stroke(); g.fillStyle = 'rgba(60,50,80,.2)'; g.fillRect(100, -164 + k * 64, 180, 10); }
    g.restore();
    g.save(); g.translate(540, 1080); g.scale(pageOn, pageOn); g.rotate(-.04);
    sing(g, t, L, { from: 5, rows: [{ text: 'what to', x: -160, y: -80, size: 58 }, { text: 'build', x: -160, y: 30, size: 96 }, { text: 'or test', x: 165, y: 185, size: 80 }], style: 'ink', o: { shade: null }, emph: { build: { col: '#4a5ab8' }, test: { col: '#1f9a58' } }, maxW: 270 });
    g.restore();
  }
  clawd(g, 540, cy, { s: 250, look: t < 121 ? [0, .3] : [0, -1], eyes: t < 121 ? 'worried' : 'open', armR: -1.4, armL: t < 121 ? -.4 : -1.2 + Math.sin(t * 8) * .3, hold: t > 121 ? lantern : undefined, shadow: false, legs: climb > 0 && climb < 1 ? t * 2 : undefined, mouth: clamp(K.vocal(t) * .8) });
  sing(g, t, L, { rows: [{ text: 'But how do', y: 320, size: 90 }, { text: 'you know', y: 470, size: 120 }], emph: { know: { col: STYLE.hot } } });
  backing(g, t, L, 540, 620, 58);
}

// ---------------------------------------------------------------- 123.4 – 128.8: who it's for
// A card held up over someone's head, its letter painted on as it's sung.
function card(g, t, x, y, ch, t0, col) {
  const up = easeOutBack(inv(t0 - .08, t0 + .18, t), 1.8);
  if (up <= 0) return;
  g.save(); g.translate(x, y + (1 - up) * 80); g.rotate(Math.sin(t * 3 + x) * .04);
  g.strokeStyle = INK.col; g.lineWidth = 6; line(g, 0, 40, 0, 110); g.stroke();
  pen(g, 8, .8); g.fillStyle = '#fbf3e2'; rr(g, -42, -58, 84, 108, 10); g.fill();
  g.restore();
  g.save(); g.translate(x, y + (1 - up) * 80); g.rotate(Math.sin(t * 3 + x) * .04);
  letter(g, ch, 0, 28, 72, { align: 'center', col, w: .19, seed: x | 0, progress: clamp((t - t0) / .12) });
  g.restore();
}
export function revealShot(g, t, c) {
  const K = c.K;
  const clear = smooth(inv(124.2, 127.0, t));
  const hz = 760;
  nightSky(g, t, { horizon: hz, moon: { x: 900, y: 520, r: 44 }, glowCol: '#ff9a6a' });
  town(g, t, hz, { on: 1 });
  sea(g, t, hz, { reflections: [{ x: 850, col: C.moon, w: 28, a: .45 }] });
  lighthouse(g, t, 120, hz + 10, 260, { beamA: t * .8 + 1.4, beamLen: 1100 });
  g.save(); g.ink = null; g.fillStyle = vgrad(g, hz + 120, 1560, [[0, '#6a4a5a'], [1, '#2c2139']]); g.fillRect(0, hz + 120, W, 1560 - hz - 120); g.restore();
  for (let i = 0; i < 8; i++) {
    const x = 90 + i * 128, y = hz + 250, w2 = 100, h2 = 110;
    g.save(); pen(g, 6, .6);
    g.fillStyle = shade(HUT_COLS[i], -.2); g.fillRect(x - w2 / 2, y - h2, w2, h2);
    g.fillStyle = '#2e2440'; poly(g, [[x - w2 * .6, y - h2], [x, y - h2 - 50], [x + w2 * .6, y - h2]]); g.fill();
    g.restore();
    glow(g, x, y - h2 * .45, 80, C.amber, .7 * clear);
    g.save(); g.ink = null; g.fillStyle = mix('#1a1020', '#ffd494', clear); g.fillRect(x - 32, y - 78, 64, 78); g.restore();
  }
  glow(g, 700, 1150, 900 * (.3 + clear * .7), '#ffcf8a', .5 * clear);
  const folk = ['demo', 'baker', 'chat1', 'student', 'nana', 'blind', 'chat2', 'chat3'];
  const L = lineNear(123.36), ws = L.lead;
  // Everyone below, looking up; the front row holds up WHO IT'S FOR? a card each.
  for (let row = 2; row >= 0; row--) for (let i = 0; i < 7 - row; i++) {
    const k = folk[(i * 3 + row * 5) % folk.length];
    const x = 90 + (i + row * .5) * (900 / (6 - row * .4)), y = 1340 + row * 95;
    const wave = t > 127.6 ? Math.sin(t * 7 + i + row) * .4 : 0;
    person(g, x, y, { s: 58 + row * 12, ...PEOPLE[k], look: [(700 - x) / 900, -1], eyes: clear > .75 ? 'happy' : 'open', mouth: clear > .75 ? .5 : 0, armR: clear > .75 ? -2.6 + wave : -.9, shadow: false });
  }
  const cards = [['W', 5], ['H', 5], ['O', 5], ['I', 6], ['T', 6], ["'S", 6], ['F', 7], ['O', 7], ['R', 7], ['?', 7]];
  cards.forEach(([ch, wi], k) => {
    const x = 156 + k * 80 + (k > 2 ? 24 : 0) + (k > 5 ? 24 : 0);
    card(g, t, x, 1200 + Math.sin(k * 1.7) * 10, ch, ws[wi].s + (k % 3) * .06, wi === 5 ? '#c2335a' : '#2b1f3c');
  });
  // The fog, lifting from the lantern outward.
  for (let i = 0; i < 14; i++) {
    const fx = rnd(i, 771) * W, fy = hz - 100 + rnd(i, 772) * 900;
    glow(g, fx + (fx - 540) * .9 * clear, fy, 340, '#bdb4e6', .75 * (1 - clear));
  }
  g.save(); g.ink = null; g.fillStyle = vgrad(g, 1600, H, [[0, '#4f4870'], [1, '#1c1830']]); g.fillRect(0, 1600, W, H - 1600); g.restore();
  const raise = easeOutBack(inv(123.4, 124.4, t), 1.5);
  glow(g, 700, 1200, 520 * (.4 + clear * .6), C.amber, .6);
  clawd(g, 540, 1780, { s: 320, back: true, armR: lerp(-.2, -1.9, raise), extR: 1.6, armL: -.3, shadow: false, hold: (g2, u) => { glow(g2, 0, u * 1.9, u * 5, C.amber, 1); g2.save(); pen(g2, u, .6); g2.strokeStyle = '#3a3040'; g2.lineWidth = u * .2; line(g2, 0, 0, 0, u * 1.2); g2.stroke(); g2.fillStyle = '#ffd98a'; rr(g2, -u * .5, u * 1.5, u, u, u * .3); g2.fill(); g2.restore(); } });
  sing(g, t, L, { rows: [{ text: "if you're not", y: 230, size: 80 }, { text: 'thinking about', y: 360, size: 92 }], hold: 3 });
}
