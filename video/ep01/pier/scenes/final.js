// The final pre-chorus and chorus: the plea at first light, then you answer. Each question the
// chorus sings gets its answer, and the gym log gets built right.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, confetti, firework, INK } from '../kit.js';
import { nightSky, sea, town, ferrisWheel, beams, lighthouse, washBand } from '../world.js';
import { clawd, person, molty, grok, blossom, muse, pen, nopen, tone } from '../cast.js';
import { blinkAt, band } from '../band.js';
import { laptop, hand, phone, battery, flame } from '../props.js';
import { wordTimes, hookSign, backingScript, bandMedium, crowdReverse } from './stage.js';
import { slip } from './pre.js';
import { PEOPLE } from './huts.js';
import { sing, keyLine, lineNear, STYLE } from '../lyrics.js';
import { letter } from '../hand.js';

// ---------------------------------------------------------------- 147.56 – 153.32: please
export function pleaShot(g, t, c) {
  const K = c.K;
  const dawn = smooth(inv(147.5, 153.3, t)) * .45;
  const hz = 1240;
  nightSky(g, t, { horizon: hz, moon: { x: 170, y: 760, r: 44 }, dawn, stars: 1 - dawn });
  town(g, t, hz, { on: 1 - dawn });
  sea(g, t, hz, { dawn, reflections: [{ x: 170, col: C.moon, w: 24, a: .4 }, { x: 760, col: '#ffb088', w: 60, a: .3 * dawn * 2 }] });
  glow(g, 760, hz, 640, '#ff9a7a', .6 * dawn * 2);
  g.save(); g.ink = null; g.fillStyle = vgrad(g, 1560, H, [[0, '#4a3048'], [1, '#170b1a']]); g.fillRect(0, 1560, W, H - 1560); g.restore();
  const offer = easeOutBack(inv(147.6, 148.2, t), 1.4);
  const pencil = (g2, u) => { g2.save(); g2.rotate(-.9); pen(g2, u, .6); g2.fillStyle = C.gold; rr(g2, -u * .2, -u * 2.4, u * .4, u * 2.4, u * .1); g2.fill(); g2.fillStyle = '#f4c6a0'; poly(g2, [[-u * .2, 0], [u * .2, 0], [0, u * .6]]); g2.fill(); g2.fillStyle = '#e0495d'; rr(g2, -u * .2, -u * 2.6, u * .4, u * .3, u * .08); g2.fill(); g2.restore(); };
  clawd(g, 540, 1740, { s: 420, eyes: 'wide', look: [0, .1], armR: lerp(.2, -1.3, offer), armL: lerp(.2, -.6, offer), holdL: pencil, mouth: clamp(K.vocal(t)), blush: .6, blink: blinkAt(t, 8) });
  // The slip is a form now, waiting to be filled in: who it's for, what they want.
  const L1 = lineNear(147.56), L2 = lineNear(150.36);
  const sw = 640 * offer;
  slip(g, 560, lerp(1560, 1190, offer), sw, -.03 + Math.sin(t * 2) * .01, { blank: true, form: true, draw: (g2, w, h) => {
    if (w < 200) return;
    const k = w / 640;
    const line1 = (label, y, t0) => {
      if (t < t0) return;
      const lw = letter(g2, label, -w * .44, y * k, 52 * k, { col: '#2b1f3c', w: .15, progress: clamp((t - t0) / .4), seed: 5 });
      g2.save(); g2.ink = null; g2.strokeStyle = 'rgba(43,31,60,.55)'; g2.lineWidth = 3 * k; g2.setLineDash([10 * k, 8 * k]); line(g2, -w * .44 + lw + 14 * k, y * k + 6 * k, w * .44, y * k + 6 * k); g2.stroke(); g2.setLineDash([]); g2.restore();
    };
    line1("WHO IT'S FOR:", -30, L1.lead[5].s);
    line1('WHAT THEY WANT:', 70, L2.lead[5].s);
  } });
  sing(g, t, L1, { rows: [{ text: 'So please just tell me', y: 250, size: 72 }, { text: "who it's for,", y: 395, size: 124 }], emph: { who: { col: STYLE.hot } } });
  sing(g, t, L2, { rows: [{ text: 'so please just tell me', y: 560, size: 72 }, { text: 'what they want.', y: 705, size: 124 }], emph: { what: { col: STYLE.hot } } });
}

// ---------------------------------------------------------------- 153.32 – 160.22: you start typing
const TYPED = 'a gym log. just for me.';
export function typeShot(g, t, c) {
  const K = c.K;
  const dawn = .45 + .35 * smooth(inv(153.3, 160.2, t));
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, H, [[0, mixHex('#0c0c2a', '#6a5aa0', dawn)], [.6, mixHex('#1a1240', '#e8a08a', dawn)], [1, '#170e1a']]);
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 4; i++) washBand(g, 200 + i * 320, 270 + i * 320, '#fff', .04, i * 5);
  g.restore();
  glow(g, 540, 780, 800, '#ffc89a', .4 * dawn);
  const fy = 1560;
  g.save(); g.ink = null; g.fillStyle = vgrad(g, fy, H, [[0, '#3a2838'], [1, '#140a14']]); g.fillRect(0, fy, W, H - fy); g.restore();
  const n = Math.floor(lerp(0, TYPED.length, inv(153.5, 156.8, t)));
  const eager = smooth(inv(153.4, 154, t));
  clawd(g, 560, fy - 760 * .09 - 760 * .64 + 150 - eager * 60, { s: 300, eyes: t > 156.8 ? 'star' : 'open', look: [lerp(-.6, .6, n / TYPED.length), .9], shadow: false, blush: eager });
  laptop(g, 540, fy, 760, (g2, sx, sy, sw, sh) => {
    g2.fillStyle = '#13121b'; g2.fillRect(sx, sy, sw, sh);
    const pad = sw * .06;
    g2.fillStyle = rgba(C.clawd, .95); g2.font = `600 ${sw * .034}px Mono`; g2.textAlign = 'left'; g2.textBaseline = 'middle';
    g2.fillText('✻ listening', sx + pad, sy + sh * .12);
    g2.strokeStyle = rgba(C.clawd, .85); g2.lineWidth = sw * .005;
    rr(g2, sx + pad, sy + sh * .3, sw - pad * 2, sh * .32, sh * .05); g2.stroke();
    g2.font = `500 ${sw * .05}px Mono`; g2.fillStyle = '#8e8aa6'; g2.fillText('>', sx + pad * 1.6, sy + sh * .42);
    g2.fillStyle = '#f5f1e8'; g2.fillText(TYPED.slice(0, n), sx + pad * 1.6 + sw * .05, sy + sh * .42);
    const cw = g2.measureText(TYPED.slice(0, n)).width;
    if (Math.floor(t * 2.4) % 2 === 0) g2.fillRect(sx + pad * 1.6 + sw * .05 + cw + 4, sy + sh * .42 - sw * .028, sw * .028, sw * .056);
  }, { glowA: 1.1 });
  const typing = n > 0 && n < TYPED.length;
  hand(g, 380, 1740 + (typing ? Math.sin(t * 30) * 8 : 0), 210, .35, 'open', { sleeveCol: '#5b6cff' });
  hand(g, 700, 1740 + (typing ? Math.sin(t * 30 + 2) * 8 : 0), 210, -.35, 'open', { sleeveCol: '#5b6cff' });
  keyLine(g, t, 153.32, 155.22, 200);
}

// ---------------------------------------------------------------- the final chorus
function sunriseBackdrop(g, t, K, sun) {
  const hz = 1120;
  nightSky(g, t, { horizon: hz, dawn: .75 + .25 * sun, stars: 0, moon: false });
  const sy = lerp(hz + 60, hz - 260, sun);
  glow(g, 540, sy, 800, '#ffcf8a', .9);
  g.save(); g.ink = null; g.fillStyle = '#fff4d0'; circle(g, 540, sy, 110); g.fill(); g.restore();
  sea(g, t, hz, { dawn: 1, reflections: [{ x: 540, col: '#ffe0b0', w: 120, a: .7 }] });
  ferrisWheel(g, t, 880, 700, 360, { rot: t * .05, on: .5, frame: '#fff0e8' });
}

// The questions answered by the sign itself: WHO? → ME!, at sunrise, the whole crowd.
export function finalWho(g, t, c, o) {
  const K = c.K;
  const ans = t > o.flip;
  crowdReverse(g, t, K, { dawn: .8, people: o.people, fireworks: false, point: ans && o.point });
  hookSign(g, t, o.line, ans ? o.answer : o.word, 540, 330, .9, { face: ans ? '#ffb13b' : undefined, flipAt: o.flip });
  if (ans) confetti(g, t, o.flip, 540, 420, { n: 90, spread: 3, speed: 1300, seed: 83, life: 2.4, colors: ['#ffd166', '#ff9f43', '#ffffff', C.pink] });
  backingScript(g, t, o.line, 540, 690, 62, STYLE.dawnBack.col, { shade: STYLE.dawnBack.shade });
}

// …and WHAT? → the band, at sunrise, with the answer on the sign.
export function finalWhat(g, t, c, o) {
  const K = c.K;
  const ans = t > o.flip;
  bandMedium(g, t, K, { dawn: .85, back: 0, crowd: 1 });
  hookSign(g, t, o.line, ans ? o.answer : o.word, 540, 470, .8, { face: ans ? '#ffb13b' : undefined, flipAt: o.flip });
  if (ans) confetti(g, t, o.flip, 540, 560, { n: 90, spread: 3, speed: 1300, seed: 84, life: 2.4, colors: ['#ffd166', '#ff9f43', '#ffffff', C.pink] });
  backingScript(g, t, o.line, 540, 800, 64, STYLE.dawnBack.col, { shade: STYLE.dawnBack.shade });
}

// Does what I need: one tap on the one big button, and a flame for a new best.
export function appShot(g, t, c) {
  const K = c.K;
  sunriseBackdrop(g, t, K, .9);
  g.save(); g.ink = null; g.fillStyle = rgba('#2a1030', .22); g.fillRect(0, 0, W, H); g.restore();
  const tap = 180.5;
  phone(g, 540, 1060, 430, -.03, (g2, sx, sy, sw, sh) => gymApp(g2, sx, sy, sw, sh, t, { tap }), { glowA: 1.3 });
  hand(g, 560, 1620, 240, 0, 'hold', { sleeveCol: '#5b6cff' });
  const tp = inv(tap - .45, tap, t);
  if (t < tap + .6) hand(g, lerp(920, 620, easeOut(tp)), lerp(1780, 1430, easeOut(tp)), 200, -.4, 'point', { sleeve: false });
  if (t > tap) {
    confetti(g, t, tap, 540, 1100, { n: 110, spread: 2.8, speed: 1700, seed: 85, life: 2.4, colors: [C.coral, C.gold, '#ff4a3a', '#ffffff'] });
    for (let i = 0; i < 7; i++) { const p = inv(tap + i * .06, tap + 1 + i * .06, t); if (p <= 0 || p >= 1) continue; g.save(); g.globalAlpha *= 1 - p; flame(g, 300 + i * 80, 1020 - p * 420, 70, t + i); g.restore(); }
  }
  sing(g, t, 179.72, { rows: [{ text: 'Does what they need,', y: 250, size: 84 }, { text: 'or steals the show?', y: 390, size: 96 }], emph: { need: { col: STYLE.hot }, show: { col: '#ff8a4a' } } });
}

// The brief and what it built, held long enough to screenshot.
export const FULL_BRIEF = [
  'for: me, mid-set, sweaty hands',
  'good = log a set in one tap',
  'fast to open, cheap to run',
  'a 🔥 when I beat my best',
  'skip: 2FA, Kubernetes, confetti',
  'ship it by Monday',
  'for you: tidy diags, ask if unsure',
];
export function builtShot(g, t, c) {
  const K = c.K;
  sunriseBackdrop(g, t, K, 1);
  g.save(); g.ink = null; g.fillStyle = rgba('#2a1030', .3); g.fillRect(0, 0, W, H); g.restore();
  const p = easeOutBack(inv(182.36, 182.81, t), 1.4);
  const cw = 940, top = 300, lh = 70, h = 150 + FULL_BRIEF.length * lh;
  g.save(); g.translate(540, top + h / 2); g.scale(p, p); g.translate(-540, -(top + h / 2));
  g.ink = null; g.fillStyle = 'rgba(0,0,0,.3)'; rr(g, 540 - cw / 2 + 10, top + 16, cw, h, 30); g.fill();
  pen(g, 14, .9); g.fillStyle = '#16151f'; rr(g, 540 - cw / 2, top, cw, h, 30); g.fill();
  nopen(g); g.strokeStyle = rgba(C.clawd, .95); g.lineWidth = 5; rr(g, 540 - cw / 2 + 12, top + 12, cw - 24, h - 24, 22); g.stroke();
  g.textAlign = 'left'; g.textBaseline = 'middle';
  g.font = '700 40px Mono'; g.fillStyle = C.clawdLit; g.fillText('> a gym log. just for me.', 540 - cw / 2 + 44, top + 70);
  FULL_BRIEF.forEach((l, i) => {
    const on = clamp((t - 182.56 - i * .12) / .15);
    g.globalAlpha = on;
    g.font = '500 37px Mono'; g.fillStyle = '#f5f1e8';
    // The flame is the film's own, painted, not a font's emoji.
    if (l.includes('🔥')) { const [a, b] = l.split('🔥'); g.fillText(a, 540 - cw / 2 + 70, top + 150 + i * lh); const aw = g.measureText(a).width; g.fillText(b, 540 - cw / 2 + 70 + aw + 44, top + 150 + i * lh); flame(g, 540 - cw / 2 + 70 + aw + 20, top + 150 + i * lh + 18, 40, t); }
    else g.fillText(l, 540 - cw / 2 + 70, top + 150 + i * lh);
    g.globalAlpha = 1;
  });
  g.restore();
  const q = easeOutBack(inv(183.06, 183.56, t), 1.5);
  if (q < .02) return;
  phone(g, 360, 1500, 280 * q, -.05, (g2, sx, sy, sw, sh) => gymApp(g2, sx, sy, sw, sh, t, { tap: 180.5 }), { glowA: .8 });
  battery(g, 760, 1400, 220 * q, .92, { label: '8% USED', glowA: .9 });
  clawd(g, 790, 1780, { s: 220 * q, eyes: 'happy', armL: -1.3, armR: -1.3, blush: 1, mouth: .3 });
}

// The app: a big button, today's sets, and a flame for a personal best.
export function gymApp(g, sx, sy, sw, sh, t, o = {}) {
  g.fillStyle = '#fff8ef'; g.fillRect(sx, sy, sw, sh);
  const pad = sw * .08;
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#231c33'; g.font = `800 ${sw * .1}px Bricolage`; g.fillText('Bench', sx + pad, sy + sh * .13);
  const tapped = t >= (o.tap ?? 1e9);
  const sets = tapped ? 4 : 3;
  for (let i = 0; i < sets; i++) {
    const y = sy + sh * (.2 + i * .075);
    const isNew = tapped && i === sets - 1;
    g.fillStyle = isNew ? '#fff0d8' : '#ffffff'; rr(g, sx + pad, y, sw - pad * 2, sh * .06, sh * .02); g.fill();
    g.fillStyle = '#231c33'; g.font = `700 ${sw * .055}px Bricolage`; g.fillText(`${i + 1}`, sx + pad * 1.5, y + sh * .042);
    g.fillText(`${isNew ? 65 : 60} kg × 8`, sx + pad * 3, y + sh * .042);
    if (isNew) flame(g, sx + sw - pad * 2.2, y + sh * .055, sh * .05, t);
  }
  const press = tapped ? bump(t, o.tap, o.tap + .25) : 0;
  const by = sy + sh * .62, bh = sh * .2;
  g.fillStyle = mix('#ff7a59', '#ff4a3a', press);
  rr(g, sx + pad, by + press * 6, sw - pad * 2, bh, bh * .3); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `800 ${sw * .1}px Bricolage`; g.fillText('LOG SET', sx + sw / 2, by + bh * .62 + press * 6);
  if (tapped) {
    const fp = easeOutBack(inv(o.tap, o.tap + .4, t), 2);
    g.save(); g.translate(sx + sw / 2, sy + sh * .52); g.scale(fp, fp);
    g.fillStyle = '#231c33'; g.font = `800 ${sw * .075}px Bricolage`; g.fillText('NEW BEST!', sw * .06, 0);
    flame(g, -sw * .3, sw * .02, sw * .09, t);
    g.restore();
  }
}
