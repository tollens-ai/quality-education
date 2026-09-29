// Verse 1, second half (lines 5-8): the app fails ility by ility, and then the whole ring.
//   5  Accessibility's a mess and so is usability!   three owners peek over giant phones; a maze
//   6  Walk cats? It cost a second app. Good grief, extensibility!   a dog-shaped slot; a second phone
//   7  What you don't know can hurt you through a growing liability.   a puppy grows; the table goes over
//   8  So leave no stone unturned, and see the whole of software quality.   stones; a pull-back to the ring
// One picture a line, each built on the words (`words()`): pictures land at about s - .085.
import { W, H, clamp, inv, easeOut, easeInOut, backOut, beatPos, beatPulse, words, lerp, smooth, hash, TAU } from '../kit.js';
import { shot, join } from '../shots.js';
import { write } from '../hand.js';
import { blob, line, dot, hatch } from '../pencil.js';
import { clawd, shaggy } from '../chars.js';
import { person, dogFront, capsule } from '../people.js';
import { rosette, sparkle, burst, phone, bubble } from '../props.js';
import { groove, pop, ramp } from '../common.js';
import { sing, layoutLine } from '../lyrics.js';
import { park, pigeon } from '../world.js';
import { spring, shake, hop, ease } from '../life.js';
import { rrect, ellipse } from '../shapes.js';
import { GRAPHITE, C } from '../palette.js';
import { ACCESS, peeker, grip, buttonsScreen, videoScreen, targetScreen, appHeader, waves, robotBubble, maze, catHead, cat, slot, coin, moneyBag, bill, display, plume, warnTri, stone, hollow, rosetteLite, banner, multiTail, ringWorld } from '../props-verse1b.js';

const CREAM = '#fbf8ef';
const lin = x => x;

export function register(S) {
  const l4 = words('Verse 1', 'Accessibility');
  const l5 = words('Verse 1', 'Walk cats');
  const l6 = words('Verse 1', 'What you');
  const l7 = words('Verse 1', 'So leave');
  shot(16.6, 20.25, (g, t) => { window.__markInk = GRAPHITE; drawA(g, t, l4); }, { id: 'v1b-0' });
  join(19.817, 20.248, 'push', { dir: [-1, 0] });
  shot(19.817, 23.266, (g, t) => { window.__markInk = GRAPHITE; drawB(g, t, l5); }, { id: 'v1b-1' });
  join(22.833, 23.262, 'push', { dir: [-1, 0] });
  shot(22.833, 26.71, (g, t) => { window.__markInk = GRAPHITE; drawC(g, t, l6); }, { id: 'v1b-2' });
  join(26.707, 27.137, 'iris', { at: [540, 1330], col: '#f5eedd' });
  shot(26.707, 30.56, (g, t) => { window.__markInk = GRAPHITE; drawD(g, t, l7); }, { id: 'v1b-3' });
}

// ================================================================= 5  Accessibility's a mess and so is usability!
// Three owners peek over giant phones (the same app), each shut out a different way, in turn on the
// held "Accessibility's": a screen reader that only says BUTTON, a video with no captions, a tiny target
// a shaky hand keeps missing. "a mess": everything wobbles. "usability!": every screen becomes the same
// maze and everyone is lost; accessibility's rosette hangs crooked and usability's is tangled in a lead.
const BASE = 1460, PW = 300, PH = 520;
const UNITS = [
  { x: 180, at: 16.809, body: C.navy, kind: 'A', seed: 1 },
  { x: 540, at: 17.235, body: '#5a3d7a', kind: 'B', seed: 2 },
  { x: 900, at: 17.670, body: '#2d6a55', kind: 'C', seed: 3 },
];
const READS = [17.02, 17.455, 17.886];                 // the screen reader's three BUTTONs, on the off-beats
const FOCUS = [0, 3, 4];
const BARKS = [17.455, 17.670, 18.102, 18.531, 18.959];
const JABS = [17.886, 18.102, 18.317, 18.531, 18.745, 18.959];
const MISS = [[-34, -22], [30, -34], [-40, 20], [38, 28], [-6, 42], [14, -38]];
const TGT = [80, 262 * (PH * .86 / 404) - PH * .43];    // the tiny target, in the phone's own space

function drawA(g, t, ws) {
  const gr = groove(t, 1);
  const T = i => ws[i].s;
  const mess = T(1) - .085, lostT = T(6) - .085;         // 18.175 and 19.235
  const worried = t > mess, lost = t > lostT;
  park(g, t, { horizon: 1020, sunAt: [970, 640], sunR: 76, mood: lost ? 'gasp' : worried ? 'worried' : 'happy', look: [-.5, .6], seed: 51, clouds: false });
  // A washing line across the sky, for the two rosettes to hang from at the end, and the pigeon to watch from.
  const SY = u => 668 + Math.sin(u * Math.PI) * 50;
  line(g, Array.from({ length: 9 }, (_, i) => [-20 + 1120 * i / 8, SY(i / 8)]), { w: 5, col: '#8b5f2a', seed: 505, t, spline: true, passes: 1 });
  pigeon(g, t, 540, SY(.5) - 2, .72, { state: lost ? 'gasp' : t > mess && t < mess + .8 ? 'flap' : 'perch', look: -1, flip: 1 });
  UNITS.forEach((U, i) => unitA(g, t, U, i, gr, mess, lostT));
  // The screen reader's voice: BUTTON. BUTTON. BUTTON. stacked above the first owner, wobbling and popping at "a mess".
  READS.forEach((r0, i) => {
    if (t < r0 - .03) return;
    const shift = READS.slice(i + 1).reduce((a, tj) => a + ease(t, tj, tj + .2), 0);
    const k = pop(t, r0 - .03, .22) * (1 - ramp(t, 18.42 + i * .06, 18.6 + i * .06, lin));
    if (k <= .02) return;
    const jig = shake(t, mess, { dur: .5, amp: .07, f: 8 });
    g.save(); g.translate(240, 758 - 68 * shift); g.rotate(jig * (i % 2 ? 1 : -1)); g.scale(k, k);
    robotBubble(g, 0, 0, 270, 64, -50, 64, t, { seed: 300 + i * 4, size: 38, prog: ramp(t, r0 - .03, r0 + .16, lin) });
    g.restore();
  });
  // The question marks: B's from the start of the captions, then everyone's.
  const qm = (x, y, t0, col, sd) => {
    const k = pop(t, t0, .25);
    if (k <= .02) return;
    g.save(); g.translate(x, y); g.rotate(Math.sin(t * 5 + sd) * .14 + (t > mess && t < lostT ? Math.sin((t - mess) * 14) * .3 : 0)); g.scale(k, k);
    write(g, '?', 0, 50, 120, { col, seed: sd, t, align: 'center', w: .13 });
    g.restore();
  };
  qm(612, 700, 17.886, C.purple, 601);
  qm(74, 730, lostT + .1, C.purple, 602);
  qm(830, 715, lostT + .2, C.purple, 603);
  // The rosettes at the end, on the line.
  if (t > lostT - .05) {
    const k = pop(t, lostT, .3);
    const px = 345, py = SY((px + 20) / 1120);
    blob(g, rrect(px, py + 8, 13, 28, 4, 2, 710), { fill: '#c99a5a', line: GRAPHITE, lw: 4, seed: 710, t, hw: 4, tone: .8 });
    line(g, [[px, py + 20], [px - 6, 790]], { w: 4, col: GRAPHITE, seed: 711, t, spline: false, passes: 1 });
    g.save(); g.translate(333, 836); g.scale(k, k); rosette(g, 0, 0, 62, ACCESS, t, { seed: 720, tilt: .55 + Math.sin(t * 3) * .03, state: 'wilt' }); g.restore();
  }
  if (t > lostT + .06) {
    const k = pop(t, lostT + .1, .3);
    const px = 735, py = SY((px + 20) / 1120);
    blob(g, rrect(px, py + 8, 13, 28, 4, 2, 730), { fill: '#c99a5a', line: GRAPHITE, lw: 4, seed: 730, t, hw: 4, tone: .8 });
    g.save(); g.translate(735, 836); g.scale(k, k); rosette(g, 0, 0, 62, C.orange, t, { seed: 740, tilt: -.1 }); g.restore();
    // A lead, wound round it: it draws itself.
    const lp = ramp(t, lostT + .2, lostT + .5, lin);
    const pts = [[px, py + 20], [px + 34, 790]];
    for (let j = 0; j <= 26; j++) { const a = -1.3 + j / 26 * TAU * 1.5, r = 96 - j * 1.5; pts.push([735 + Math.cos(a) * r, 840 + Math.sin(a) * r * .92]); }
    pts.push([712, 930], [724, 962]);
    line(g, pts, { w: 10, col: C.red, seed: 750, t, spline: true, passes: 1, to: lp, wob: 1.2 });
    if (lp > .95) blob(g, rrect(724, 972, 14, 24, 4, 2, 751), { fill: '#a8a7b2', line: GRAPHITE, lw: 4, seed: 751, t, hw: 4, tone: .8 });
  }
  const out = { t0: ws[ws.length - 1].e + .4, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: C.orange, tailBubble: { fill: '#f5a03a', edge: '#8a4a1d', e: 2.0, f: 1.35 }, hi: { 0: '#c93a76' }, seed: 8, out, w: .1 });
}

// One owner and phone: a head over the top of a giant phone, hands over its edge. The unit pops up from below on its beat.
function unitA(g, t, U, i, gr, mess, lostT) {
  const p = spring(t, U.at - .06, { f: 2.3, z: .55 });
  if (p <= .001) return;
  const jel = shake(t, mess + i * .05, { dur: 1.0, amp: .09, f: 6.5 });
  const lost = t > lostT, worried = t > mess;
  const m0 = lostT - .1 + i * .06, mp = ramp(t, m0, m0 + .5, lin);
  g.save();
  g.translate(U.x, BASE + (1 - p) * 560 - gr.bob * .5);
  g.rotate(gr.lean * .8 + jel);
  g.scale(1 + gr.sq * .02 - (1 - p) * .05, 1 - gr.sq * .03 + (1 - p) * .1);
  // The face for this moment.
  let f;
  const hy = -PH - 58;
  if (U.kind === 'A') {
    f = lost ? { eyes: 'wide', mouth: 'o', brow: 1, look: [0, 0], tilt: -.05 } : worried ? { eyes: 'wide', mouth: 'o', brow: .7, look: [.3, .4], tilt: 0 } : { eyes: 'dot', mouth: 'smile', brow: 0, look: [.5, -.6], tilt: -.04 };
    peeker(g, { x: 0, y: hy, s: 1.1, t, seed: 11, skin: '#8a5a3c', shade: '#6d4128', hair: { style: 'curls', col: '#2b2a33' }, headphones: true, ...f });
  } else if (U.kind === 'B') {
    f = lost ? { eyes: 'wide', mouth: 'o', brow: 1, look: [0, 0], tilt: 0 } : worried ? { eyes: 'squint', mouth: 'wavy', brow: .5, tilt: .13, look: [0, .3] } : { eyes: 'dot', mouth: t > 17.886 ? 'wavy' : 'flat', browAsym: 1, tilt: .13, look: [0, .5] };
    peeker(g, { x: 0, y: hy, s: 1.1, t, seed: 12, skin: '#efc7a0', shade: '#d9a878', hair: { style: 'bob', col: '#c0612b' }, aid: true, ...f });
  } else {
    f = lost ? { eyes: 'wide', mouth: 'o', brow: 1, look: [0, 0], sweat: 1 } : worried ? { eyes: 'wide', mouth: 'grit', brow: .6, look: [.7, .4] } : { eyes: 'dot', mouth: 'tongue', brow: -.8, look: [.7, .5] };
    peeker(g, { x: 0, y: hy, s: 1.1, t, seed: 13, skin: '#d9a878', shade: '#b8865a', hair: { style: 'cap', col: '#6b7d5c' }, glasses: true, moustache: true, ...f });
  }
  // The phone: the same app on each.
  const bk = barkAt(t), n = READS.filter(r => t >= r).length;
  const marks = [];
  JABS.forEach((J, k) => { if (t > J) marks.push([TGT[0] + MISS[k][0], TGT[1] + MISS[k][1], pop(t, J, .15)]); });
  phone(g, 0, -PH / 2, PW, PH, t, {
    seed: 100 + U.seed * 10, body: U.body, glow: '#f4f9ff',
    screen: (g2, r) => {
      if (t > m0) {
        const K = r.h / 404;
        appHeader(g2, r, t, 200 + U.seed);
        blob(g2, rrect(r.x + r.w / 2, r.y + 236 * K, r.w - 26, 296 * K, 14, 3, 210 + U.seed), { fill: CREAM, line: GRAPHITE, lw: 4, seed: 210 + U.seed, t, hw: 4.4, tone: .9, dens: .2 });
        maze(g2, r.x + 26, r.y + 104 * K, r.w - 52, 264 * K, t, { seed: 220 + U.seed * 40, prog: mp, lw: 6.4 });
      } else if (U.kind === 'A') buttonsScreen(g2, r, t, { seed: 230, focus: t > READS[0] && t < 18.6 ? FOCUS[Math.max(0, n - 1)] : -1, hop: 10 * beatPulse(t, .1) });
      else if (U.kind === 'B') {
        videoScreen(g2, r, t, { seed: 240, bark: bk.open, prog: (t - 17.2) * .05 });
        const wy = r.y + 170 * (r.h / 404) + 22 + 24;
        waves(g2, -14 + 38, wy, t, { seed: 250, k: bk.k, r0: 14, gap: 16, w: 5, spread: .9, col: '#8d8c97' });
        waves(g2, -14 - 38, wy, t, { seed: 260, k: bk.k, r0: 14, gap: 16, w: 5, spread: .9, col: '#8d8c97', dir: -1 });
      } else targetScreen(g2, r, t, { seed: 270, marks, glow: .5 + .5 * beatPulse(t, .2) });
    },
  });
  [-1, 1].forEach((side, k) => grip(g, side * 122, -PH - 6, 1.05, t, { skin: U.kind === 'A' ? '#8a5a3c' : U.kind === 'B' ? '#efc7a0' : '#d9a878', seed: 400 + U.seed * 5 + k, tilt: side * .1 }));
  if (U.kind === 'C') jabArm(g, t);
  g.restore();
}
function barkAt(t) {
  let e = -1;
  for (const b of BARKS) if (t >= b) e = b;
  if (e < 0) return { open: 0, k: 1 };
  return { open: t - e < .2 ? 1 : 0, k: clamp((t - e) / .5) };
}
// C's arm comes round the edge of the phone and jabs at the tiny target, and misses.
function jabArm(g, t) {
  const T = [TGT[0], TGT[1] - PH / 2];
  const R = [T[0] + 50, T[1] + 44];
  let off = null, stab = 0;
  JABS.forEach((J, k) => { const u = (t - (J - .1)) / .2; if (u >= 0 && u <= 1) { off = MISS[k]; stab = Math.pow(Math.sin(Math.PI * u), .8); } });
  const fast = t > 18.17 && t < 18.9 ? 1.8 : 1;
  const away = ramp(t, 19.2, 19.45, lin);
  if (away >= 1) return;
  const H0 = off ? [lerp(R[0], T[0] + off[0], stab), lerp(R[1], T[1] + off[1], stab)] : R;
  const E = [154, -PH / 2 + 30];
  const H1 = [lerp(H0[0] + Math.sin(t * 47) * 4 * fast, E[0] + 14, away), lerp(H0[1] + Math.cos(t * 53) * 4 * fast, E[1] + 10, away)];
  const M = [lerp(E[0], H1[0], .55), lerp(E[1], H1[1], .55)];
  const d = Math.atan2(T[1] - H1[1], T[0] - H1[0]);
  blob(g, capsule(E, M, 22, 19, 5, 460), { fill: '#b0413a', shade: '#7a2a26', line: GRAPHITE, lw: 5.2, seed: 460, t, hw: 4.6, tone: .6, sh: .25 });
  blob(g, capsule(M, H1, 15, 14, 5, 461), { fill: '#e8c29a', line: GRAPHITE, lw: 5, seed: 461, t, hw: 4.4, tone: .6 });
  blob(g, ellipse(M[0], M[1], 21, 21, 8, 0, 464), { fill: CREAM, line: GRAPHITE, lw: 4.6, seed: 464, t, hw: 4.4, tone: .9, dens: .3 });
  blob(g, ellipse(H1[0], H1[1], 25, 22, 8, 0, 462), { fill: '#e8c29a', line: GRAPHITE, lw: 4.8, seed: 462, t, hw: 4.4, tone: .6 });
  const F0 = [H1[0] + Math.cos(d) * 12, H1[1] + Math.sin(d) * 12], F1 = [H1[0] + Math.cos(d) * 46, H1[1] + Math.sin(d) * 46];
  blob(g, capsule(F0, F1, 10, 9, 4, 463), { fill: '#e8c29a', line: GRAPHITE, lw: 4.4, seed: 463, t, hw: 4, tone: .6 });
  dot(g, F1[0] - Math.cos(d) * 4, F1[1] - Math.sin(d) * 4, 3.6, { col: '#d9a49a', seed: 465, t });
  if (off || (t > 18.17 && t < 18.9)) [-1, 1].forEach((sd, k) => line(g, [[H1[0] + Math.cos(d + sd * 1.9) * 34, H1[1] + Math.sin(d + sd * 1.9) * 34], [H1[0] + Math.cos(d + sd * 1.9) * 50, H1[1] + Math.sin(d + sd * 1.9) * 50]], { w: 4.4, col: GRAPHITE, seed: 466 + k, t, spline: false, passes: 1, alpha: .6 }));
}

// ================================================================= 6  Walk cats? It cost a second app. Good grief, extensibility!
const PW2 = 320, PH2 = 560, P1 = [450, 1500 - PH2 / 2], P2 = [775, 1500 - PH2 / 2];
const SLOT_Y = P => P[1] - PH2 * .43 + 176 * (PH2 * .86 / 370);   // the slot's height on a booking phone
function drawB(g, t, ws) {
  const gr = groove(t, 1);
  const V = i => ws[i].s - .085;
  const bonk1 = 20.681, bonk2 = 21.109, hopT = 21.45, landT = V(6), coinT = V(3), phone2T = V(4), griefT = V(8), teal = V(9);
  const grief = t > griefT;
  park(g, t, { horizon: 1100, sunAt: [985, 700], sunR: 80, mood: t > teal + .3 ? 'shades' : grief ? 'worried' : t > coinT ? 'sweat' : 'happy', look: [-.6, .5], seed: 61, clouds: false, trees: false });
  // Phone 1: the booking form, a dog-shaped slot. It shows what the cat token does to it.
  const hit1 = Math.max(0, 1 - Math.abs(t - bonk1) / .16) + Math.max(0, 1 - Math.abs(t - bonk2) / .16);
  bookingPhone(g, t, P1, 'dog', 500, { flash: hit1, book: false });
  // Phone 2 pops beside it: a second app, the same form with a cat-shaped slot.
  const p2 = spring(t, phone2T, { f: 2.3, z: .5 });
  if (p2 > .001) {
    g.save(); g.translate(0, (1 - p2) * 620);
    bookingPhone(g, t, P2, 'cat', 520, { flash: 0, book: t > landT + .05 });
    // A COPY stamp comes down on it as it arrives.
    const ck = pop(t, phone2T + .05, .2) * (1 - ramp(t, landT + .1, landT + .4, lin));
    if (ck > .02) { g.save(); g.translate(P2[0] + 40, P2[1] - PH2 / 2 - 34); g.rotate(-.16); g.scale(ck, ck); blob(g, rrect(0, 0, 150, 60, 10, 2, 530), { fill: null, line: C.red, lw: 8, seed: 530, t }); write(g, 'COPY', 0, 20, 46, { col: C.red, seed: 531, t, align: 'center', w: .13 }); g.restore(); }
    g.restore();
  }
  // The owner, with her cat at her feet.
  const bonked = t > bonk1 && t < bonk2 + .5;
  const talk = t > 20.1;
  person(g, { x: 125, y: 1500, s: 1.3, t, seed: 21, hair: { style: 'long', col: '#2b2a33' }, top: '#f0b23a', bottom: '#5a4a8a', skin: '#b07a52', eyes: t > landT ? 'happy' : bonked ? 'wide' : 'dot', mouth: t > landT ? 'smile' : bonked ? 'o' : talk ? 'open' : 'smile', brow: bonked ? 1 : 0, look: [.8, 0], armR: { up: .35, out: .9 }, armL: { up: -.7, out: .1 }, bob: gr.bob * .6, squash: gr.sq * .5, lean: gr.lean * .6 });
  cat(g, 268, 1500, 1.05, t, { seed: 40, tailPh: t * .5, eyes: t > landT ? 'happy' : bonked ? 'shut' : 'half', look: [-1, .2], flip: -1, bob: gr.bob * .3 });
  // Her question.
  if (t > 20.08) {
    const k = pop(t, 20.08, .22);
    g.save(); g.translate(330, 830); g.scale(k, k);
    bubble(g, 0, 0, 540, 116, -190, 236, t, { seed: 33, r: 40 });
    write(g, 'WALK MY CAT?', 0, 30, 60, { col: GRAPHITE, seed: 34, t, align: 'center', prog: ramp(t, 20.155, 20.62, lin), w: .1 });
    g.restore();
  }
  // The cat token, dragged at the dog slot: it can't fit. Then over to the second phone, where it does.
  const sy = SLOT_Y(P1);
  let tk = null;
  const hold = [P1[0], sy - 130];
  if (t < 21.45) {
    const d1 = ease(t, 20.50, bonk1, x => x * x), u1 = ease(t, bonk1, bonk1 + .22), d2 = ease(t, 20.96, bonk2, x => x * x), u2 = ease(t, bonk2, bonk2 + .22);
    let dy = 0;
    if (t < bonk1 + .22) dy = d1 * 80 - u1 * 80; else if (t < bonk2 + .22) dy = d2 * 80 - u2 * 80;
    const sq = Math.max(0, 1 - Math.abs(t - bonk1) / .09) + Math.max(0, 1 - Math.abs(t - bonk2) / .09);
    tk = { x: P1[0], y: hold[1] + dy, s: .9, sq: sq * .25, rot: shake(t, bonk1, { dur: .3, amp: .25, f: 9 }) + shake(t, bonk2, { dur: .3, amp: .25, f: 9 }) };
  } else if (t < landT) {
    const u = inv(hopT, landT, t), e = easeInOut(u);
    const s2 = SLOT_Y(P2);
    tk = { x: lerp(P1[0], P2[0], e), y: lerp(hold[1], s2, e) - Math.sin(Math.PI * u) * 170, s: .9, sq: 0, rot: u * TAU * .5 };
  } else {
    const s2 = SLOT_Y(P2);
    tk = { x: P2[0], y: s2 + 4, s: .9, sq: Math.max(0, 1 - (t - landT) / .12) * .3, rot: 0 };
  }
  if (t > 20.4 && p2 > -1) {
    g.save(); g.translate(tk.x, tk.y); g.rotate(tk.rot); g.scale(1 + tk.sq * .5, 1 - tk.sq);
    catHead(g, 0, 0, tk.s, t, { seed: 50, eyes: t > landT ? 'happy' : 'open', mouth: 0 });
    g.restore();
  }
  // Clawd, at the right, copies the app and pays for it; his coins pour out of a sack.
  const worry = t > bonk1;
  clawd(g, { x: 745, y: 1545, s: 1.0, t, seed: 1, eyes: grief ? 'sad' : t > coinT ? 'wide' : worry ? 'squint' : 'open', mouth: grief ? .8 : 0, look: [-.9, .3], bob: gr.bob, squash: gr.sq + shake(t, griefT, { dur: .5, amp: .3, f: 10 }), lean: gr.lean, armL: grief ? { up: 1 } : { up: .2 }, armR: grief ? { up: 1 } : t > coinT ? { up: .8 } : { up: .1 }, brow: grief ? 1 : worry ? .6 : 0, sweat: t > coinT });
  // The sack and the coins.
  if (t > coinT - .1 && t < griefT + .3) {
    const k = pop(t, coinT - .1, .25);
    g.save(); g.translate(965, 1285); g.scale(k, k); moneyBag(g, 0, 0, .9, t, { seed: 60, tilt: 2.0 + Math.sin(t * 9) * .06 }); g.restore();
  }
  const pile = Math.min(16, Math.max(0, Math.floor((t - coinT) / .11)));
  if (pile > 0) blob(g, [[960, 1545], [990, 1545 - pile * 4], [1030, 1545 - pile * 7], [1068, 1545 - pile * 4], [1090, 1545]], { fill: C.yellow, shade: C.orange, line: GRAPHITE, lw: 5, seed: 70, t, hw: 4.4, tone: .8, sh: .3 });
  for (let k = 0; k < 16; k++) {
    const t0 = coinT + k * .11, dt = t - t0;
    if (dt < 0 || dt > .34) continue;
    coin(g, 1040 + (k % 3 - 1) * 12, 1330 + 1900 * dt * dt, 17, t, { seed: 80 + k, rot: dt * 9 + k });
  }
  if (pile > 0) [[1020, 1533 - pile * 4], [1062, 1538 - pile * 2], [985, 1541]].forEach(([cx, cy], k) => coin(g, cx, cy, 17, t, { seed: 100 + k, rot: k }));
  // The teal rosette, with a tiny ribbon taped on to reach.
  if (t > teal - .05) {
    const k = spring(t, teal, { f: 2.6, z: .45 });
    g.save(); g.translate(775, 730); g.scale(k, k);
    rosette(g, 0, 0, 72, C.teal, t, { seed: 90, tilt: -.06 });
    const tp = ramp(t, teal + .06, teal + .2, lin);
    if (tp > 0) {
      const sw = Math.sin(t * 6) * 3;
      line(g, [[-22, 150], [-27 + sw, 176], [-22 + sw, 204]], { w: 22, col: '#1f8f86', seed: 91, t, spline: true, passes: 1, to: tp, taper: [.05, .3] });
      g.save(); g.translate(-22, 148); g.rotate(-.5); blob(g, rrect(0, 0, 76, 30, 4, 2, 92), { fill: '#f0dc8a', line: GRAPHITE, lw: 4.4, seed: 92, t, hw: 4, tone: .8, dens: .6 }); g.restore();
    }
    g.restore();
  }
  pigeon(g, t, 345, 946, .7, { state: t > coinT ? 'gasp' : 'perch', look: 1, flip: 1 });
  const out = { t0: ws[ws.length - 1].e + .4, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: C.teal, tailBubble: { fill: '#6fd6cc', edge: '#146b64', e: 2.0, f: 1.35 }, seed: 9, out, w: .1 });
}

// A phone showing the booking form: a title, a PET slot in the shape of a dog (or a cat), a BOOK button.
function bookingPhone(g, t, P, kind, seed, o = {}) {
  const { flash = 0, book = false } = o;
  phone(g, P[0], P[1], PW2, PH2, t, {
    seed, body: kind === 'dog' ? C.navy : '#2d6a55', glow: '#f4f9ff',
    screen: (g2, r) => {
      const K = r.h / 370;
      appHeader(g2, r, t, seed + 1);
      write(g2, 'BOOK A WALK', 0, r.y + 98 * K, 30, { col: GRAPHITE, seed: seed + 2, t, align: 'center', track: 4 });
      write(g2, 'PET', r.x + 20, r.y + 126 * K, 22, { col: '#6d6b76', seed: seed + 3, t, track: 4 });
      slot(g2, kind, 0, r.y + 176 * K, 1.0, t, { seed: seed + 4, flash });
      if (flash > .3) { line(g2, [[-60, r.y + 176 * K - 46], [60, r.y + 176 * K + 46]], { w: 10, col: C.red, seed: seed + 5, t, spline: false, passes: 1 }); line(g2, [[60, r.y + 176 * K - 46], [-60, r.y + 176 * K + 46]], { w: 10, col: C.red, seed: seed + 6, t, spline: false, passes: 1 }); }
      blob(g2, rrect(0, r.y + 320 * K, 180, 56, 14, 3, seed + 7), { fill: book ? C.green : '#c9c8d1', line: GRAPHITE, lw: 4.6, seed: seed + 7, t, hw: 4.4, tone: .9 });
      write(g2, 'BOOK', 0, r.y + 320 * K + 10, 30, { col: book ? CREAM : '#8d8c97', seed: seed + 8, t, align: 'center', track: 4 });
    },
  });
}

// ================================================================= 7  What you don't know can hurt you through a growing liability.
function drawC(g, t, ws) {
  const gr = groove(t, 1);
  const V = i => ws[i].s - .085;
  const g0 = V(3), g1 = V(5), g2 = V(9), hit = V(10), tail = hit + .11;     // the puppy's growth steps; the tail's whack
  park(g, t, { horizon: 1250, sunAt: [990, 900], sunR: 80, mood: t > hit ? 'gasp' : t > g2 ? 'sweat' : t > g1 ? 'worried' : 'happy', look: [-.6, .5], seed: 71, clouds: false });
  // The puppy: it grows a size on each stress, and again on the last word.
  const sc = .82 + .3 * spring(t, g0, { f: 2.6, z: .42 }) + .4 * spring(t, g1, { f: 2.6, z: .42 }) + .5 * smooth(inv(g2, hit, t)) + .4 * spring(t, hit, { f: 2.6, z: .4 });
  const PX = 560, PY = 1330, R = 118 * sc;
  const wobble = shake(t, g0, { dur: .5, amp: .4, f: 5 }) + shake(t, g1, { dur: .5, amp: .5, f: 5 }) + shake(t, hit, { dur: .6, amp: .5, f: 5 });
  // Its tail wags, and whacks the table on "liability".
  const wag = Math.sin(t * 9) * .3;
  const whack = ramp(t, tail - .1, tail, lin) * (1 - ramp(t, tail + .06, tail + .32, lin));
  shaggy(g, { x: PX, y: PY, s: sc, t, seed: 8, puppy: true, state: 'awake', mouth: t > g2 ? .6 : 0, tongue: t > g2, look: [.3, .5], squash: wobble * .4, lean: gr.lean * .4 });
  pigeon(g, t, PX + R * .18, PY - R * 1.91 + 10, .5, { state: t > hit ? 'flap' : 'perch', look: 1, flip: 1 });
  // The table of rosettes: seven so far.
  const tip = spring(t, tail, { f: 1.6, z: .5 });
  const TX = 270, TY = 1500;
  const ROS = [C.blue, C.green, C.purple, C.red, ACCESS, C.orange, C.teal];
  g.save();
  g.translate(TX - 230, TY); g.rotate(-tip * 1.35); g.translate(-(TX - 230), -TY);
  display(g, TX, TY, 460, t, { seed: 600 });
  if (t < tail) ROS.forEach((c, i) => rosette(g, TX - 174 + i * 58, TY - 262, 38, c, t, { seed: 610 + i * 6, tilt: Math.sin(t * 2.4 + i) * .06 }));
  g.restore();
  // The rosettes thrown into the air, and a bill.
  if (t >= tail) ROS.forEach((c, i) => {
    const dt = t - tail, vx = (i - 3) * 70 + 20, vy = -640 - (i % 3) * 110, gy = 2600;
    const x = TX - 174 + i * 58 + vx * dt, y0 = TY - 262 + vy * dt + .5 * gy * dt * dt;
    const yy = Math.min(y0, 1490);
    rosette(g, x, yy, 38, c, t, { seed: 620 + i * 6, tilt: dt * (i % 2 ? 6 : -6) * Math.exp(-dt * 1.5) });
  });
  {
    const bx = PX - R * .78, by = PY - R * .8, a0 = -Math.PI / 2 - .95 - whack * 1.35 + wag * .3;
    plume(g, [bx, by], a0, R * (1 - whack * .3), R * .46, -.9 + whack * .5 - wag * .3, t, { seed: 71, fill: '#f6efdf', shade: '#d9ccb0' });
    if (t > tail - .1 && t < tail + .3) {
      const wk = clamp((t - (tail - .1)) / .4);
      [1, 1.16, 1.32].forEach((k, i) => line(g, Array.from({ length: 8 }, (_, j) => { const aa = -Math.PI / 2 - .95 - 1.35 * (j / 7) * clamp(wk * 2); return [bx + Math.cos(aa) * R * .95 * k, by + Math.sin(aa) * R * .95 * k]; }), { w: 6, col: GRAPHITE, seed: 660 + i, t, spline: true, passes: 1, alpha: .5 * (1 - wk), taper: [.3, .3] }));
    }
    if (t >= tail && t < tail + .35) burst(g, TX - 30, TY - 224, 30, 150, t, { col: C.yellow, n: 12, prog: ramp(t, tail, tail + .16, lin), w: 9, seed: 670 });
  }
  if (t > tail + .1) {
    const dt = t - tail - .1;
    bill(g, TX + 110 + Math.sin(dt * 7) * 40, Math.min(1170 + dt * 420, 1440), .7, t, { seed: 630, rot: Math.sin(dt * 7) * .5 });
  }
  // Clawd, at the right, admires the row with his back to the puppy; then the shadow.
  const wid = t > g2;
  clawd(g, { x: 835, y: 1500, s: 1.25, t, seed: 1, eyes: t > hit ? 'wide' : wid ? 'wide' : 'happy', mouth: t > hit ? .9 : 0, look: [-.9, .1], bob: gr.bob, squash: gr.sq + shake(t, hit, { dur: .5, amp: .4, f: 10 }), lean: gr.lean, armL: t > hit ? { up: 1 } : { up: .3 + Math.sin(t * 5) * .15 }, armR: t > hit ? { up: 1 } : { up: .1 }, brow: wid ? 1 : 0, sweat: wid });
  const sh = ramp(t, g2 - .1, hit + .1, lin);
  if (sh > .02) hatch(g, ellipse(835, 1370, 360 * sh + 40, 260 * sh + 40, 12, 0, 640), { col: '#39385a', seed: 640, t, gap: 9, w: 10, alpha: .5 * sh, angle: -.6, spill: 8 });
  // The warning signs, either side of the last word.
  const LO = { x: W / 2, y: 225, size: 90, maxW: 980, tail: 1, tailSize: 120 };
  const it = layoutLine(ws, LO).items.find(i => i.tail);
  if (t > hit - .1) {
    const k = spring(t, hit - .1, { f: 2.4, z: .42 }) * (1 + .05 * beatPulse(t, .2));
    [it.x - 100, it.x + it.w + 100].forEach((cx, i) => { g.save(); g.translate(cx, it.y - it.size * .55); g.scale(k, k); warnTri(g, 0, 0, 82, t, { seed: 650 + i * 7, tilt: (i ? .1 : -.1) }); g.restore(); });
  }
  sing(g, t, ws, { ...LO, tailCol: C.red, tailBubble: { fill: '#e8504a', edge: '#7a1f1a', e: 2.0, f: 1.35 }, hi: { 3: C.red, 5: C.red, 9: C.red }, seed: 10, w: .1 });
}

// ================================================================= 8  So leave no stone unturned, and see the whole of software quality.
const STONES = [
  { x: 715, y: 1352, col: C.blue, at: 27.40, dir: 1 }, { x: 365, y: 1352, col: C.green, at: 27.68, dir: -1 }, { x: 540, y: 1236, col: C.purple, at: 27.96, dir: 1, big: 1.2 },
  { x: 420, y: 1262, col: C.red, at: 28.17, dir: -1 }, { x: 660, y: 1258, col: ACCESS, at: 28.25, dir: 1 }, { x: 250, y: 1385, col: C.orange, at: 28.32, dir: -1 }, { x: 830, y: 1372, col: C.teal, at: 28.39, dir: 1 },
  { x: 190, y: 1290, col: C.yellow, at: 28.45, dir: -1 }, { x: 900, y: 1290, col: C.lime, at: 28.51, dir: 1 }, { x: 320, y: 1180, col: C.sky, at: 28.56, dir: -1 }, { x: 760, y: 1176, col: '#a67c52', at: 28.6, dir: 1 }, { x: 120, y: 1350, col: C.grey, at: 28.64, dir: -1 },
];
function drawD(g, t, ws) {
  const V = i => ws[i].s - .085;
  const zt = ease(t, 28.5, 29.42, easeInOut), z = 1.7 - .7 * zt;
  const rope = ramp(t, 28.95, 29.4, lin), posts = ramp(t, 28.9, 29.35, lin), bunt = ramp(t, 29.05, 29.5, lin);
  const soft = V(10), cheer = V(11);
  g.save();
  g.translate(540, 1330); g.scale(z, z); g.translate(-540, -1330);
  ringWorld(g, t, { rope, posts, bunt, sunMood: t > cheer ? 'shades' : t > 28.9 ? 'gasp' : 'happy', look: [-.3, .5] });
  // The banner, hung between two poles, once "software" arrives.
  if (t > soft - .05) {
    [95, 985].forEach((px, i) => line(g, [[px, 1005], [px, 790]], { w: 16, col: '#8b5f2a', seed: 800 + i, t, spline: false, passes: 1, flat: true }));
    const un = spring(t, soft - .05, { f: 2.2, z: .5 });
    banner(g, 540, 790, 860, 124 * Math.max(0, un), t, { seed: 810, wave: t * 3 });
    if (un > .6) write(g, 'SOFTWARE QUALITY', 540, 906, 68, { col: '#25397c', seed: 811, t, align: 'center', prog: ramp(t, soft, 30.25, lin), w: .11, track: 6 });
  }
  if (t > soft - .05) pigeon(g, t, 95, 790, .7, { state: t > 29.9 ? 'gasp' : 'perch', look: 1, flip: 1 });
  // Stones and what is under them, and Clawd among them, drawn back to front.
  const items = [];
  STONES.forEach((S, i) => items.push({ y: S.y, draw: () => stoneItem(g, t, S, i) }));
  items.push({ y: 1340, draw: () => clawdD(g, t, ws) });
  STONES.forEach((S, i) => { const lv = leaveT(i), gn = 1 - ramp(t, lv + .04, lv + .24, lin); if (gn > .02) hollow(g, S.x, S.y, (S.big || 1) * gn, t, { seed: 830 + S.x % 90 }); });
  items.sort((a, b) => a.y - b.y).forEach(it => it.draw());
  // The audience, along the foot, as the view widens.
  [[110, 1862, 'lab'], [270, 1885, 'poodle'], [810, 1885, 'corgi'], [970, 1862, 'beagle']].forEach(([x, y, b], i) => {
    const k = pop(t, 29.15 + i * .07, .28);
    if (k > .02) dogFront(g, { x, y: y + (1 - k) * 240, s: .85, t, seed: 850 + i, breed: b, eyes: 'happy', mouth: .5, collar: [C.red, C.blue, C.green, C.purple][i], tilt: (i % 2 ? -1 : 1) * .05 });
  });
  g.restore();
  // The lyric, never zoomed: its last word in every colour.
  const LO = { x: W / 2, y: 225, size: 90, maxW: 980, tail: 1 };
  const it = layoutLine(ws, LO).items.find(i => i.tail);
  sing(g, t, ws.slice(0, -1), { ...LO, tail: 0, seed: 11, w: .1 });
  multiTail(g, t, it, ws[ws.length - 1], { seed: 12 });
}

// One stone: it sits until Clawd (or the wave) tips it, tumbles over showing its damp underside, and a rosette rises from the hollow.
const leaveT = i => 29.93 + i * .018;
function stoneItem(g, t, S, i) {
  const sc = (S.big || 1) * .95;
  const fl = clamp((t - S.at) / .38);
  const lx = S.x + S.dir * 55 * sc, ly = S.y + 8;
  const leave = leaveT(i);                                 // the rosettes fly to the banner on "quality"
  const fly = ramp(t, leave, leave + .4, easeInOut);
  const gone = 1 - ramp(t, leave + .04, leave + .24, lin);
  if (gone > .02) {
    g.save();
    const x = fl < 1 ? lerp(S.x, lx, easeOut(fl)) : lx, y = (fl < 1 ? lerp(S.y, ly, fl) - Math.sin(Math.PI * fl) * 110 * sc : ly);
    g.translate(x, y); g.scale(gone, gone); g.rotate(S.dir * Math.PI * easeOut(fl) + (fl <= 0 ? shake(t, S.at - .3, { dur: .3, amp: .07, f: 12 }) : 0));
    stone(g, 0, 0, sc, t, { seed: 860 + i * 3, under: fl > .4 });
    g.restore();
  }
  if (t > S.at + .1) {
    const rk = spring(t, S.at + .14, { f: 2.8, z: .5 });
    const near = i < 3;
    const rx = S.x, ry = S.y - 40 - 46 * rk + Math.sin(t * 3 + i) * 4;
    const bx = lerp(150, 930, (i + .5) / STONES.length), by = 950;
    const e = fly;
    const px = lerp(rx, bx, e), py = lerp(ry, by, e) - Math.sin(Math.PI * e) * 160;
    g.save(); g.translate(px, py); g.rotate(e * TAU * (i % 2 ? 1 : -1) + Math.sin(t * 2 + i) * .1); g.scale(Math.max(.01, rk), Math.max(.01, rk));
    if (near && e < .01) rosette(g, 0, 0, 44 * sc, S.col, t, { seed: 870 + i * 6 }); else rosetteLite(g, 0, 0, (e > .5 ? 26 : 30) * sc, S.col, t, { seed: 870 + i * 6 });
    g.restore();
  }
}
// Clawd in the middle of the ring: he tips the stones, looks up as the view widens, and cheers on "quality".
function clawdD(g, t, ws) {
  const gr = groove(t, 1);
  const V = i => ws[i].s - .085;
  const cheer = V(11), pull = 28.5;
  let x = 540, arm = { R: { up: .1 }, L: { up: .1 } }, look = [0, .2], lean = gr.lean, bob = gr.bob, eyes = 'open', sq = gr.sq, mouth = 0;
  const F = [[27.40, 1], [27.68, -1], [27.96, 1]];
  F.forEach(([a, d]) => {
    const u = t - (a - .18);
    if (u > -.05 && u < .7) {
      const k = Math.sin(Math.PI * clamp(u / .55));
      lean = d * .16 * k; look = [d * .9, .6]; sq = Math.max(sq, .5 * (1 - clamp((u - .12) / .1)) * (u > 0 ? 1 : 0)); bob = Math.max(bob, hop(t, a - .05, a + .3, 26));
      if (d > 0) arm.R = { to: [250, -20], reach: 30 }; else arm.L = { to: [-250, -20], reach: 30 };
      if (a === 27.96) { arm.R = { up: 1 }; arm.L = { up: 1 }; }
    }
  });
  if (t > 28.15 && t < pull + .4) { look = [Math.sin(t * 9) * .5, -.3]; eyes = 'wide'; }
  if (t >= pull + .3 && t < cheer) { look = [0, -.9]; eyes = 'wide'; arm = { R: { up: .5 }, L: { up: .5 } }; }
  if (t >= cheer) { eyes = 'happy'; mouth = t < cheer + .45 ? clamp(.6 + Math.sin(t * 14) * .3) : 0; arm = { R: { up: 1 }, L: { up: 1 } }; bob = Math.max(bob, hop(t, cheer, cheer + .4, 40)); look = [0, 0]; }
  clawd(g, { x, y: 1340, s: .85, t, seed: 1, eyes, mouth, look, bob, squash: sq, lean, armL: arm.L, armR: arm.R, cheeks: t >= cheer });
}
