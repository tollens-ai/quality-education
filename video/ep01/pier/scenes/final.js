// The final pre-chorus and chorus: the plea at first light, then you answer. Each question the
// chorus sings gets its answer typed into the prompt, and the gym log gets built right.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, confetti, firework } from '../kit.js';
import { nightSky, sea, town, ferrisWheel, beams, lighthouse } from '../world.js';
import { clawd, person, molty, grok, blossom, muse } from '../cast.js';
import { blinkAt, band } from '../band.js';
import { laptop, hand, phone, battery } from '../props.js';
import { wordTimes, hookSign, backingScript, bandMedium, crowdReverse } from './stage.js';
import { slip } from './pre.js';
import { PEOPLE } from './huts.js';

// ---------------------------------------------------------------- 147.56 – 153.32: please
export function pleaShot(g, t, c) {
  const K = c.K;
  const dawn = smooth(inv(147.5, 153.3, t)) * .45;
  const hz = 1180;
  nightSky(g, t, { horizon: hz, moon: { x: 170, y: 560, r: 44 }, dawn, stars: 1 - dawn });
  town(g, t, hz, { on: 1 - dawn });
  sea(g, t, hz, { dawn, reflections: [{ x: 170, col: C.moon, w: 24, a: .4 }, { x: 760, col: '#ffb088', w: 60, a: .3 * dawn * 2 }] });
  glow(g, 760, hz, 700, '#ff9a7a', .4 * dawn * 2);
  g.fillStyle = vgrad(g, 1520, H, [[0, '#4a3048'], [1, '#150b18']]); g.fillRect(0, 1520, W, H - 1520);
  // Clawd faces you, holding out a blank slip and a pencil.
  const offer = easeOutBack(inv(147.6, 148.2, t), 1.4);
  const pencil = (g2, u) => { g2.save(); g2.rotate(-.9); g2.fillStyle = C.gold; rr(g2, -u * .2, -u * 2.4, u * .4, u * 2.4, u * .1); g2.fill(); g2.fillStyle = '#f4c6a0'; poly(g2, [[-u * .2, 0], [u * .2, 0], [0, u * .6]]); g2.fill(); g2.fillStyle = '#e0495d'; rr(g2, -u * .2, -u * 2.6, u * .4, u * .3, u * .08); g2.fill(); g2.restore(); };
  clawd(g, 540, 1660, {
    s: 440, eyes: 'wide', look: [0, .1], rim: '#ffb088', rimSide: 1,
    armR: lerp(.2, -1.3, offer), armL: lerp(.2, -.6, offer), holdL: pencil,
    mouth: clamp(K.vocal(t)), blush: .6, blink: blinkAt(t, 8),
  });
  // The blank slip, held up to you: fill it in.
  slip(g, 560, lerp(1500, 1110, offer), 600 * offer, -.03 + Math.sin(t * 2) * .01, { blank: true });
}

// ---------------------------------------------------------------- 153.32 – 160.22: you start typing
const TYPED = 'a gym log. just for me.';
export function typeShot(g, t, c) {
  const K = c.K;
  const dawn = .45 + .35 * smooth(inv(153.3, 160.2, t));
  // The same laptop as the very start, in first light now.
  g.fillStyle = vgrad(g, 0, H, [[0, mixHex('#0c0c2a', '#6a5aa0', dawn)], [.6, mixHex('#1a1240', '#e8a08a', dawn)], [1, '#140c18']]);
  g.fillRect(0, 0, W, H);
  glow(g, 540, 700, 900, '#ffc89a', .25 * dawn);
  const fy = 1470;
  g.fillStyle = vgrad(g, fy, H, [[0, '#3a2838'], [1, '#120a12']]); g.fillRect(0, fy, W, H - fy);
  const n = Math.floor(lerp(0, TYPED.length, inv(153.5, 156.8, t)));
  // Clawd peeks over the screen again, reading every letter with shining eyes.
  const eager = smooth(inv(153.4, 154, t));
  clawd(g, 560, fy - 760 * .09 - 760 * .64 + 150 - eager * 60, { s: 300, eyes: t > 156.8 ? 'star' : 'open', look: [lerp(-.6, .6, n / TYPED.length), .9], rim: '#ffb088', rimSide: 1, shadow: false, blush: eager });
  laptop(g, 540, fy, 760, (g2, sx, sy, sw, sh) => {
    g2.fillStyle = '#0f0e17'; g2.fillRect(sx, sy, sw, sh);
    const pad = sw * .06;
    g2.fillStyle = rgba(C.clawd, .9); g2.font = `600 ${sw * .034}px Mono`; g2.textAlign = 'left'; g2.textBaseline = 'middle';
    g2.fillText('✻ listening', sx + pad, sy + sh * .12);
    g2.strokeStyle = rgba(C.clawd, .8); g2.lineWidth = sw * .004;
    rr(g2, sx + pad, sy + sh * .3, sw - pad * 2, sh * .32, sh * .05); g2.stroke();
    g2.font = `500 ${sw * .05}px Mono`; g2.fillStyle = '#8e8aa6'; g2.fillText('>', sx + pad * 1.6, sy + sh * .42);
    g2.fillStyle = '#f5f1e8'; g2.fillText(TYPED.slice(0, n), sx + pad * 1.6 + sw * .05, sy + sh * .42);
    const cw = g2.measureText(TYPED.slice(0, n)).width;
    if (Math.floor(t * 2.4) % 2 === 0) g2.fillRect(sx + pad * 1.6 + sw * .05 + cw + 4, sy + sh * .42 - sw * .028, sw * .028, sw * .056);
  }, { glowA: 1.1 });
  // Your hands on the keyboard, typing.
  const typing = n > 0 && n < TYPED.length;
  hand(g, 380, 1650 + (typing ? Math.sin(t * 30) * 8 : 0), 220, .35, 'open', { sleeveCol: '#5b6cff' });
  hand(g, 700, 1650 + (typing ? Math.sin(t * 30 + 2) * 8 : 0), 220, -.35, 'open', { sleeveCol: '#5b6cff' });
}

// ---------------------------------------------------------------- the final chorus: the brief
export const BRIEF = [
  { line: 160.5, text: 'for: just me, mid-set, sweaty hands' },
  { line: 163.18, text: 'good = log a set in one tap' },
  { line: 166.17, text: 'fast to open, cheap to run' },
  { line: 168.74, text: 'wow: a 🔥 when I beat my best' },
  { line: 171.34, text: 'and you: tidy diags, ask if unsure' },
  { line: 174.12, text: "don't burn my quota" },
  { line: 176.74, text: 'ship it by Monday' },
  { line: 179.72, text: 'does what I need. the 🔥 is the show' },
];
// Each answer is typed just after its question is sung.
function answerT(i) {
  const ws = wordTimes(BRIEF[i].line);
  const last = ws.length ? ws[ws.length - 1].e ?? ws[ws.length - 1].s : BRIEF[i].line + 1;
  return last + .05;
}

function sunriseBackdrop(g, t, K, sun) {
  const hz = 1120;
  nightSky(g, t, { horizon: hz, dawn: .75 + .25 * sun, stars: 0, moon: false });
  // The sun, rising.
  const sy = lerp(hz + 60, hz - 260, sun);
  glow(g, 540, sy, 900, '#ffcf8a', .6);
  g.fillStyle = rgrad(g, 540, sy, 0, 110, [[0, '#fffbe8'], [.7, '#ffe2a0'], [1, '#ffc070']]);
  circle(g, 540, sy, 110); g.fill();
  sea(g, t, hz, { dawn: 1, reflections: [{ x: 540, col: '#ffd9a0', w: 120, a: .6 }] });
  ferrisWheel(g, t, 880, 700, 360, { rot: t * .05, on: .5, frame: '#fff0e8' });
}

export function briefShot(g, t, c, o = {}) {
  const K = c.K;
  const sun = smooth(inv(160.5, 183.7, t));
  sunriseBackdrop(g, t, K, sun);
  // Soft focus veil so the card reads first.
  g.fillStyle = rgba('#2a1030', .28); g.fillRect(0, 0, W, H);
  // The card: the prompt, now long.
  const cx = 540, cy0 = 470;
  const shown = BRIEF.filter((b, i) => t >= answerT(i) - .02);
  const rows = BRIEF.length;
  const cw = 900, lh = 78, top = cy0, h = 150 + rows * lh;
  g.save();
  g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, cx - cw / 2 + 10, top + 16, cw, h, 30); g.fill();
  g.fillStyle = 'rgba(15,14,23,.94)'; rr(g, cx - cw / 2, top, cw, h, 30); g.fill();
  g.strokeStyle = rgba(C.clawd, .9); g.lineWidth = 4; rr(g, cx - cw / 2, top, cw, h, 30); g.stroke();
  g.font = '600 30px Mono'; g.fillStyle = rgba(C.clawd, .95); g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText('> a gym log. just for me.', cx - cw / 2 + 44, top + 62);
  BRIEF.forEach((b, i) => {
    const ta = answerT(i);
    if (t < ta) return;
    const n = Math.floor((t - ta) * 34);
    const s = b.text.slice(0, n);
    const y = top + 140 + i * lh;
    const fresh = 1 - smooth((t - ta - .6) / .6);
    g.font = '500 34px Mono';
    g.fillStyle = mix('#f5f1e8', C.gold, fresh * .8);
    g.fillText(s, cx - cw / 2 + 44, y);
    if (fresh > 0) glow(g, cx - cw / 2 + 44 + g.measureText(s).width, y, 40, C.gold, .5 * fresh);
  });
  g.restore();
  // Clawd below the card, nodding along to each answer.
  const nod = BRIEF.reduce((a, b, i) => a + bump(t, answerT(i), answerT(i) + .35), 0);
  clawd(g, 540, 1720, { s: 320, eyes: 'happy', look: [0, -1], squash: nod * .08, armL: -1.1 - .2 * Math.sin(t * 6), armR: -1.1 + .2 * Math.sin(t * 6), rim: '#ffcf8a', mouth: clamp(K.vocal(t)), blush: .8 });
}

// The questions answered by the sign itself: WHO? → ME!, at sunrise, the whole crowd.
export function finalWho(g, t, c, o) {
  const K = c.K;
  const ans = t > o.flip;
  crowdReverse(g, t, K, { dawn: .8, people: o.people, fireworks: false, point: ans && o.point });
  hookSign(g, t, o.line, ans ? o.answer : o.word, 540, 330, .9, { face: ans ? '#ffb13b' : undefined, flipAt: o.flip });
  if (ans) confetti(g, t, o.flip, 540, 420, { n: 90, spread: 3, speed: 1300, seed: 83, life: 2.4, colors: ['#ffd166', '#ff9f43', '#ffffff', C.pink] });
  backingScript(g, t, o.line, 540, 670, 62);
}

// …and WHAT? → the band, at sunrise, with the answer on the sign.
export function finalWhat(g, t, c, o) {
  const K = c.K;
  const ans = t > o.flip;
  bandMedium(g, t, K, { dawn: .85, back: 0, crowd: 1 });
  hookSign(g, t, o.line, ans ? o.answer : o.word, 540, 470, .8, { face: ans ? '#ffb13b' : undefined });
  if (ans) confetti(g, t, o.flip, 540, 560, { n: 90, spread: 3, speed: 1300, seed: 84, life: 2.4, colors: ['#ffd166', '#ff9f43', '#ffffff', C.pink] });
  backingScript(g, t, o.line, 540, 800, 62);
}

// Does what I need: one tap on the one big button, and a flame for a new best.
export function appShot(g, t, c) {
  const K = c.K;
  sunriseBackdrop(g, t, K, .9);
  g.fillStyle = rgba('#2a1030', .2); g.fillRect(0, 0, W, H);
  const tap = 180.5;
  phone(g, 540, 930, 470, -.03, (g2, sx, sy, sw, sh) => gymApp(g2, sx, sy, sw, sh, t, { tap }), { glowA: 1.3 });
  hand(g, 560, 1500, 250, 0, 'hold', { sleeveCol: '#5b6cff' });
  const tp = inv(tap - .45, tap, t);
  if (t < tap + .6) hand(g, lerp(920, 620, easeOut(tp)), lerp(1650, 1300, easeOut(tp)), 210, -.4, 'point', { sleeve: false });
  if (t > tap) {
    confetti(g, t, tap, 540, 1000, { n: 110, spread: 2.8, speed: 1700, seed: 85, life: 2.4, colors: [C.coral, C.gold, '#ff4a3a', '#ffffff'] });
    for (let i = 0; i < 8; i++) { const p = inv(tap + i * .06, tap + 1 + i * .06, t); if (p <= 0 || p >= 1) continue; g.save(); g.globalAlpha = 1 - p; g.font = '84px Bricolage'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText('🔥', 300 + i * 70, 900 - p * 420); g.restore(); }
  }
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
  g.fillStyle = rgba('#2a1030', .3); g.fillRect(0, 0, W, H);
  const p = easeOutBack(inv(181.9, 182.35, t), 1.4);
  // The card.
  const cw = 940, top = 300, lh = 70, h = 150 + FULL_BRIEF.length * lh;
  g.save(); g.translate(540, top + h / 2); g.scale(p, p); g.translate(-540, -(top + h / 2));
  g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, 540 - cw / 2 + 10, top + 16, cw, h, 30); g.fill();
  g.fillStyle = 'rgba(15,14,23,.95)'; rr(g, 540 - cw / 2, top, cw, h, 30); g.fill();
  g.strokeStyle = rgba(C.clawd, .95); g.lineWidth = 5; rr(g, 540 - cw / 2, top, cw, h, 30); g.stroke();
  g.textAlign = 'left'; g.textBaseline = 'middle';
  g.font = '700 40px Mono'; g.fillStyle = C.clawdLit; g.fillText('> a gym log. just for me.', 540 - cw / 2 + 44, top + 70);
  FULL_BRIEF.forEach((l, i) => {
    const on = clamp((t - 182.1 - i * .12) / .15);
    g.globalAlpha = on;
    g.font = '500 37px Mono'; g.fillStyle = '#f5f1e8';
    g.fillText(l, 540 - cw / 2 + 70, top + 150 + i * lh);
    g.globalAlpha = 1;
  });
  g.restore();
  // What it built: the phone, and the quota it didn't burn.
  const q = easeOutBack(inv(182.6, 183.1, t), 1.5);
  phone(g, 360, 1500, 300 * q, -.05, (g2, sx, sy, sw, sh) => gymApp(g2, sx, sy, sw, sh, t, { tap: 180.5 }), { glowA: .8 });
  battery(g, 760, 1420, 230 * q, .92, { label: '8% USED', glowA: .9 });
  clawd(g, 790, 1790, { s: 230 * q, eyes: 'happy', armL: -1.3, armR: -1.3, rim: '#ffcf8a', blush: 1, mouth: .3 });
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
    if (isNew) { g.font = `${sw * .07}px Bricolage`; g.fillText('🔥', sx + sw - pad * 2.6, y + sh * .045); }
  }
  // The one big button.
  const press = tapped ? bump(t, o.tap, o.tap + .25) : 0;
  const by = sy + sh * .62, bh = sh * .2;
  g.fillStyle = mix('#ff7a59', '#ff4a3a', press);
  rr(g, sx + pad, by + press * 6, sw - pad * 2, bh, bh * .3); g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `800 ${sw * .1}px Bricolage`; g.fillText('LOG SET', sx + sw / 2, by + bh * .62 + press * 6);
  if (tapped) {
    const fp = easeOutBack(inv(o.tap, o.tap + .4, t), 2);
    g.save(); g.translate(sx + sw / 2, sy + sh * .52); g.scale(fp, fp);
    g.fillStyle = '#231c33'; g.font = `800 ${sw * .075}px Bricolage`; g.fillText('🔥 NEW BEST!', 0, 0);
    g.restore();
  }
}
