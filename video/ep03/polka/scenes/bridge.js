// The bridge: a dog-training class on the meadow. Clawd stands at a whiteboard on an easel with a pointer,
// dogs sit up to listen, and everything the lesson "says" is written on the board in marker. Eight lines,
// eight pictures: what a dimension is, that each is independent (often), that most end in -ility, the hunt
// for the ones that don't, resilience, compliance, the family portrait, and the ending that isn't the point.
import { W, H, clamp, inv, easeOut, easeIn, backOut, beatPos, beatPulse, downPulse, beatNo, beatTimes, words, lerp, smooth, hash, loud, sway, TAU, elastic } from '../kit.js';
import { shot, join } from '../shots.js';
import { paper, PAGE } from '../paper.js';
import { write } from '../hand.js';
import { blob, line, dot, hatch, scrub } from '../pencil.js';
import { clawd } from '../chars.js';
import { dogFront, person } from '../people.js';
import { rosette, sparkle, burst, tick, paw, clipboard, rubberStamp } from '../props.js';
import { groove, pop, ramp } from '../common.js';
import { sing } from '../lyrics.js';
import { park, pigeon, sun } from '../world.js';
import { spring, shake, hop, gate, ease, downRing } from '../life.js';
import { drawBall } from '../board.js';
import { rrect, ellipse, scallop, star, capsule } from '../shapes.js';
import { GRAPHITE, C } from '../palette.js';
import { toLocal, fromLocal, shoulder, marker, writeHead, pointer, whiteboard, puddle, dimSlider, pupil, knobDog, groundShade, mat, bigMouth,
  lead, miniSlider, steam, puzzleTag, ilityPiece, biscuit, book, rollingPin, rocket, scroll, ringGate, camera, frame, sash, houndBits, beam, headSize, coatOf, bucket } from '../props-bridge.js';

const CREAM = '#f5eedd';
const ink = GRAPHITE;
const lin = x => x;
// A tail bubble in a marker's colour for the lyric's last word.
const bub = (fill, edge) => ({ fill, edge, e: 2.0, f: 1.35 });

export function register(S) {
  const L = [
    words('Bridge', 'A quality dimension'),
    words('Bridge', 'and each is independent'),
    words('Bridge', 'And most of them'),
    words('Bridge', 'But some of them'),
    words('Bridge', 'Resilience'),
    words('Bridge', 'Compliance'),
    words('Bridge', 'The "ilit'),
    words('Bridge', "the ending's"),
  ];
  // Each shot begins on the pah before its line's first word and is pushed in on the oom after it.
  const J = [125.235, 128.764, 132.175, 136.462, 140.857, 144.34, 147.818];
  const JE = [125.687, 129.185, 132.6, 136.904, 141.293, 144.774, 148.255];
  shot(121.6, JE[0], (g, t) => { window.__markInk = GRAPHITE; drawL1(g, t, L[0]); }, { id: 'br-1' });
  join(J[0], JE[0], 'push', { dir: [-1, 0] });
  shot(J[0], JE[1], (g, t) => { window.__markInk = GRAPHITE; drawL2(g, t, L[1]); }, { id: 'br-2' });
  join(J[1], JE[1], 'push', { dir: [-1, 0] });
  shot(J[1], JE[2], (g, t) => { window.__markInk = GRAPHITE; drawL3(g, t, L[2]); }, { id: 'br-3' });
  join(J[2], JE[2], 'iris', { at: [540, 1300], col: CREAM });
  shot(J[2], JE[3], (g, t) => { window.__markInk = CREAM; drawL4(g, t, L[3]); }, { id: 'br-4' });
  join(J[3], JE[3], 'iris', { at: [610, 1300], col: CREAM });
  shot(J[3], JE[4], (g, t) => { window.__markInk = GRAPHITE; drawL5(g, t, L[4]); }, { id: 'br-5' });
  join(J[4], JE[4], 'push', { dir: [-1, 0] });
  shot(J[4], JE[5], (g, t) => { window.__markInk = GRAPHITE; drawL6(g, t, L[5]); }, { id: 'br-6' });
  join(J[5], JE[5], 'push', { dir: [-1, 0] });
  shot(J[5], JE[6], (g, t) => { window.__markInk = GRAPHITE; drawL7(g, t, L[6]); }, { id: 'br-7' });
  join(J[6], JE[6], 'push', { dir: [-1, 0] });
  shot(J[6], 151.6, (g, t) => { window.__markInk = GRAPHITE; drawL8(g, t, L[7]); }, { id: 'br-8' });
}

function stub(g, t, ws, n) {
  park(g, t, { seed: 20 + n });
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: C.blue, tailBubble: bub(C.sky, '#1f3f8f'), seed: n, w: .1 });
}

// A curve through keyframes [[t, x, y], ...], smooth between them and flat before the first and after the last.
function path(keys, t) {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, xa, ya] = keys[i], [tb, xb, yb] = keys[i + 1];
    if (t < tb) { const p = smooth((t - ta) / (tb - ta)); return [lerp(xa, xb, p), lerp(ya, yb, p)]; }
  }
  const k = keys[keys.length - 1];
  return [k[1], k[2]];
}

// ------------------------------------------------------------------- 1 "A quality dimension is a way it's good or bad,"
// The class: QUALITY DIMENSION on the board, "for someone who matters" under it, and one slider from a puddle
// (BAD) to a rosette (GOOD) with a little dog on it. Clawd's pointer taps the words, then goes end to end on
// "good or bad,"; a dog yawns, a dog scratches, the rest follow the pointer.
function drawL1(g, t, ws) {
  const V = i => ws[i].v, T = i => ws[i].s;
  const gr = groove(t, .8);
  const vox = loud('vocals', t);
  const goodT = V(7), badT = V(9);
  const worried = t > badT + .05 && t < badT + .95;
  park(g, t, { horizon: 1330, mood: worried ? 'worried' : t > goodT ? 'shades' : 'happy', look: [-.5, .6], seed: 21, sunAt: [1010, 610], sunR: 62, trees: false, clouds: false });
  const BX = 490;
  whiteboard(g, t, { x: BX, y: 950, w: 860, h: 620 });
  // The words on the board, written in marker as they are sung.
  const wQ = ramp(t, V(1) - .4, V(1), lin), wD = ramp(t, V(2) - .5, V(2), lin), wS = ramp(t, 123.0, 123.8, lin);
  marker(g, 'QUALITY', BX, 758, 86, { col: C.blue, seed: 11, t, prog: wQ });
  marker(g, 'DIMENSION', BX, 848, 86, { col: C.blue, seed: 12, t, prog: wD });
  marker(g, 'FOR SOMEONE WHO MATTERS', BX, 906, 38, { col: '#2a8a4a', seed: 13, t, prog: wS, track: 6 });
  // The slider.
  const sx = BX - 8, sy = 1100, sw = 470;
  const sl = ramp(t, 123.55, 123.95, lin);
  const dogK = pop(t, 124.0, .3);
  // The dog on it: sits in the middle, hops to GOOD on "good", is dragged to BAD on "bad,", shakes, comes back.
  let pos = .5, hopH = 0, eyesK = 'dot';
  if (t > goodT - .18) {
    const p = ramp(t, goodT - .18, goodT + .0, lin);
    pos = lerp(.5, .92, easeOut(p)); hopH = Math.sin(p * Math.PI) * 24;
  }
  if (t > goodT + .0) { const p = ramp(t, goodT + .05, badT, lin); pos = lerp(.92, .08, smooth(p)); eyesK = 'happy'; }
  if (t > badT) { eyesK = 'sad'; }
  if (t > badT + .55) { const p = ramp(t, badT + .55, badT + 1.0); pos = lerp(.08, .5, p); hopH = Math.sin(p * Math.PI) * 24; eyesK = 'dot'; }
  dimSlider(g, t, sx, sy, sw, { seed: 61, pos, prog: sl, thick: 30, knob: (g2, x, y) => { if (dogK > 0) { g2.save(); g2.translate(x, y - 15); g2.scale(dogK, dogK); g2.translate(-x, -(y - 15)); knobDog(g2, t, x, y - 15, { s: .9, breed: 'mutt', seed: 5, eyes: eyesK, hop: hopH, tilt: Math.sin(t * 8) * (t > goodT && t < badT ? .1 : 0) }); g2.restore(); } } });
  // The two ends: a puddle for BAD, a rosette for GOOD.
  const endK = ramp(t, 123.7, 124.0);
  if (endK > 0) {
    puddle(g, t, 165, 1122, .7 * endK, { seed: 81, splash: t > badT ? (t - badT) / .7 : 0 });
    const gp = t > goodT ? Math.exp(-(t - goodT) / .18) * Math.sin((t - goodT) * 60) * .16 : 0;
    g.save(); g.translate(800, 1096); g.scale(endK, endK); rosette(g, 0, 0, 58, C.green, t, { seed: 82, tilt: gp - .1 }); g.restore();
    marker(g, 'BAD', 165, 1050, 42, { col: C.red, seed: 14, t, prog: ramp(t, 123.85, 124.15, lin) });
    marker(g, 'GOOD', 800, 1012, 42, { col: '#2a8a4a', seed: 15, t, prog: ramp(t, 123.95, 124.3, lin) });
  }
  // The pointer's tip: taps QUALITY and DIMENSION, waits, goes to the rosette on "good" and along to the puddle on "bad,".
  const tipKeys = [[121.6, 640, 1180], [V(1) - .12, 420, 830], [V(1) + .08, 420, 816], [V(2) - .26, 640, 936], [V(2) - .06, 650, 930], [V(2) + .16, 650, 918], [123.5, 700, 1030],
    [goodT - .16, 800, 1098], [goodT + .05, 800, 1092], [badT - .02, 190, 1122], [badT + .5, 190, 1116], [badT + 1.0, 400, 1010]];
  const tip = path(tipKeys, t);
  const tipV = path(tipKeys, t + .025), tipU = path(tipKeys, t - .025);
  // Clawd, at the right beside the board, pointing with his left arm; he sings.
  const cl = { x: 905, y: 1520, s: .92, flip: 1, squash: gr.sq, lean: gr.lean * .6, bob: gr.bob };
  const tipL = toLocal(cl, tip[0], tip[1]);
  const sh0 = shoulder(cl, -1);
  const dirx = tip[0] - sh0[0], diry = tip[1] - sh0[1], dl = Math.hypot(dirx, diry) || 1;
  const flex = clamp(((tipV[0] - tipU[0]) * (-diry / dl) + (tipV[1] - tipU[1]) * (dirx / dl)) * .5, -26, 26);
  groundShade(g, t, cl.x, 1522, 340, { seed: 4 });
  clawd(g, { ...cl, t, seed: 1, eyes: worried ? 'sad' : t > goodT ? 'happy' : 'open', mouth: clamp(vox * 1.5 - .1), look: [-.7, -.3], armL: { to: tipL }, armR: { up: .1 + gr.bp * .15 },
    prop: (g2, o) => pointer(g2, t, o.hL, tipL, { seed: 45, flex: flex / cl.s }) });
  // The class: four dogs sit on a mat and listen; one yawns on "a way", one scratches, and they follow the pointer.
  mat(g, t, 390, 1588, 730, 74, { seed: 90 });
  const look = dx => [clamp((tip[0] - dx) / 400, -1, 1), -.75];
  const DOGS = [
    { breed: 'bulldog', x: 122, s: .96, seed: 3, collar: C.red },
    { breed: 'lab', x: 290, s: .94, seed: 4, collar: C.blue },
    { breed: 'poodle', x: 458, s: .98, seed: 5, collar: C.green },
    { breed: 'corgi', x: 624, s: .94, seed: 6, collar: C.purple },
  ];
  const yawn = gate(t, T(5) - .1, T(6) + .55, .25);
  DOGS.forEach((d, i) => {
    const b = groove(t + i * .04, .35);
    pupil(g, t, { ...d, y: 1518, look: look(d.x), bob: b.bob * .4, squash: b.sq * .3, ear: gr.lean * 4,
      yawn: i === 0 ? yawn : 0, scratch: i === 2 ? gate(t, 122.3, 124.9, .2) : 0, scratchSide: -1,
      eyes: i === 3 ? (t > goodT && t < badT ? 'happy' : t > badT ? 'sad' : 'dot') : 'dot' });
  });
  pigeon(g, t, 120, 642, .62, { state: t > badT ? 'gasp' : 'perch', look: 1 });
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tailGap: .34, tail: 1, tailCol: C.red, tailBubble: bub('#f08a80', '#8a2620'), seed: 8, w: .1, out: { t0: ws[ws.length - 1].e + .3, dur: .3 } });
}

// A lyric line on the top of the page, in this section's usual settings.
function lyric(g, t, ws, o = {}) {
  return sing(g, t, ws, { y: 225, size: 90, maxW: 980, rows: 3, minSize: 54, tailGap: .34, tail: 1, seed: 9, w: .1, out: { t0: ws[ws.length - 1].e + .3, dur: .3 }, ...o });
}
// A pulse from the most recent beat in a slot of a cycle (a dog that lunges every sixth beat, say).
function slotPulse(t, slot, cycle, decay = .28) {
  const B = beatTimes(), k = beatNo(t);
  const kk = k - (((k - slot) % cycle) + cycle) % cycle;
  const tb = B[Math.max(0, kk)];
  return t < tb ? 0 : Math.exp(-(t - tb) / decay);
}

// ------------------------------------------------------------------- 2 "and each is independent: that's the part that drives you mad!"
// Six dogs on six leads, each pulling its own way in turn and out of step, each with its own slider; one Clawd holds
// every lead in two hands. The board says OFTEN over "independent", SEPARATE TO JUDGE. LINKED TO BUILD. On "mad!" he is
// dragged apart and steam comes out of his top.
const RING = [
  { breed: 'bulldog', x: 140, y: 1420, s: .84, seed: 31, col: C.red, dir: [-1, .12], slot: 0, f: .31 },
  { breed: 'corgi', x: 262, y: 1304, s: .72, seed: 32, col: C.orange, dir: [-.8, -.55], slot: 3, f: .47 },
  { breed: 'beagle', x: 384, y: 1196, s: .65, seed: 33, col: C.green, dir: [-.4, -.9], slot: 1, f: .23 },
  { breed: 'poodle', x: 696, y: 1196, s: .65, seed: 34, col: C.blue, dir: [.4, -.9], slot: 5, f: .53 },
  { breed: 'husky', x: 818, y: 1304, s: .72, seed: 35, col: C.purple, dir: [.8, -.55], slot: 2, f: .37 },
  { breed: 'lab', x: 940, y: 1420, s: .84, seed: 36, col: C.pink, dir: [1, .12], slot: 4, f: .43 },
];
function drawL2(g, t, ws) {
  const V = i => ws[i].v, T = i => ws[i].s;
  const gr = groove(t, .9);
  const vox = loud('vocals', t);
  const madT = V(10), mad = t > madT - .05;
  park(g, t, { horizon: 1010, mood: mad ? 'sweat' : 'worried', look: [-.2, .9], seed: 22, sunAt: [1020, 700], sunR: 58, trees: true, clouds: false });
  // The board, far back, with the careful version of "independent".
  const BX = 540;
  whiteboard(g, t, { x: BX, y: 815, w: 860, h: 330, feet: 260, seed: 720 });
  marker(g, 'INDEPENDENT', BX, 802, 66, { col: C.blue, seed: 22, t, prog: ramp(t, V(3) - .6, V(3), lin) });
  const wOften = ramp(t, 126.5, 126.85, lin);
  marker(g, 'OFTEN', BX - 188, 726, 44, { col: C.red, seed: 23, t, prog: wOften, w: .13 });
  if (wOften > .9) line(g, [[BX - 264, 824], [BX - 250, 808], [BX - 236, 824]], { w: 6, col: C.red, seed: 24, t, spline: false, passes: 1, over: 0, alpha: .95 });
  marker(g, 'SEPARATE TO JUDGE.', BX, 872, 42, { col: '#25397c', seed: 25, t, prog: ramp(t, 126.85, 127.55, lin), track: 5 });
  marker(g, 'LINKED TO BUILD.', BX, 930, 42, { col: '#2a8a4a', seed: 26, t, prog: ramp(t, 127.5, 128.15, lin), track: 5 });
  // The pull: each dog lunges on its own beat in a cycle of six, and every dog's slider drifts at its own speed.
  const P = RING.map((d, i) => {
    const lu = slotPulse(t, d.slot, 6) * (mad ? 1.6 : 1) + (mad ? .5 * Math.max(0, Math.sin(t * 9 + i * 1.7)) : 0);
    return { ...d, lu, ox: d.dir[0] * (8 + 30 * Math.min(lu, 1.3)), oy: d.dir[1] * (8 + 26 * Math.min(lu, 1.3)) };
  });
  const F = P.reduce((a, d) => [a[0] + d.dir[0] * d.lu, a[1] + d.dir[1] * d.lu], [0, 0]);
  const shake = mad ? Math.sin(t * 30) * 5 * Math.exp(-(t - madT) / .7) : 0;
  const cl = { x: 540 + F[0] * 14 + shake, y: 1562, s: 1.3, flip: 1, squash: .3 + Math.hypot(F[0], F[1]) * .5, lean: F[0] * .035, bob: gr.bob * .5 };
  const collarAt = d => [d.x + d.ox, d.y + d.oy + 6];
  const drawDog = d => {
    const i = P.indexOf(d);
    const [fill] = coatOf(d.breed);
    pupil(g, t, { breed: d.breed, x: d.x + d.ox, y: d.y + d.oy, s: d.s, seed: d.seed, collar: d.col, tilt: d.dir[0] * (.1 + .3 * d.lu) + shake * .01, look: [d.dir[0], d.dir[1] * .6], mouth: d.lu > .35 ? .5 : 0, tongue: d.lu > .5,
      eyes: mad && i % 2 ? 'x' : 'dot', bob: gr.bob * .4, sweat: mad && i % 3 === 0 });
    // Its slider floats over its head.
    const k = pop(t, 125.62 + i * .07, .28);
    const { ry } = headSize(d.breed);
    const pos = .5 + .42 * Math.sin(TAU * d.f * t + i * 1.9);
    miniSlider(g, t, d.x + d.ox, d.y + d.oy - 2 * ry * d.s - 36, 140, pos, d.col, { seed: 500 + i * 10, k });
  };
  groundShade(g, t, 540, 1566, 440, { seed: 6 });
  // Far dogs first, then Clawd and the leads, then the near dogs over the ends of their leads.
  [P[2], P[3], P[1], P[4]].forEach(drawDog);
  clawd(g, { ...cl, t, seed: 1, eyes: mad ? 'squint' : 'open', brow: mad ? -1 : .7, mouth: clamp(vox * 1.5 - .1), look: [F[0] * .3, -.3], sweat: !mad && F[1] < -.4,
    armL: { up: mad ? 1 : .55 + Math.max(0, -F[0]) * .1 }, armR: { up: mad ? 1 : .55 + Math.max(0, F[0]) * .1 },
    prop: (g2, o) => {
      P.forEach((d, i) => {
        const hand = i < 3 ? o.hL : o.hR;
        const cw = collarAt(d), cL = toLocal(cl, cw[0], cw[1]);
        lead(g2, t, hand, cL, { col: d.col, seed: 60 + i, slack: 26 * (1 - Math.min(1, d.lu)) + 4, w: 8 });
      });
      // A loop of every colour round each fist.
      [o.hL, o.hR].forEach((h, k) => line(g2, Array.from({ length: 11 }, (_, i) => [h[0] + Math.cos(i / 10 * TAU) * 26, h[1] + Math.sin(i / 10 * TAU) * 20]), { w: 6, col: k ? C.purple : C.red, seed: 80 + k, t, spline: true, passes: 1, closed: true, over: 0, alpha: .95 }));
    } });
  [P[0], P[5]].forEach(drawDog);
  // Steam from his top, and anger marks, on "mad!".
  steam(g, t, cl.x - 120, 1245, 1.8, madT, { seed: 3, n: 5 });
  steam(g, t, cl.x + 120, 1245, 1.8, madT + .06, { seed: 8, n: 5 });
  if (mad) burst(g, cl.x, 1380, 250, 250 + 70 * ramp(t, madT, madT + .3), t, { col: C.red, n: 12, w: 8, seed: 7, prog: ramp(t, madT, madT + .25) });
  pigeon(g, t, 150, 652, .6, { state: mad ? 'gasp' : 'perch', look: 1 });
  lyric(g, t, ws, { tailCol: C.orange, tailBubble: bub('#f6a35a', '#8a3a10'), seed: 10 });
}

// ------------------------------------------------------------------- 3 "And most of them are 'ilities', which rhyme: a lucky break!"
// The board says -ILITY; four dogs wear collar tags, each a stem (USAB) with an empty socket, and the same amber ending
// falls from the board and clicks onto every one on the beats. Clawd, behind, raises a dog biscuit on "lucky" and it
// snaps neatly in two on "break!": a half each to the dogs at the ends.
const TAGDOGS = [
  { breed: 'bulldog', x: 168, s: .94, seed: 3, collar: C.red, stem: 'USAB' },
  { breed: 'lab', x: 404, s: .98, seed: 4, collar: C.blue, stem: 'RELIAB' },
  { breed: 'poodle', x: 640, s: 1.02, seed: 5, collar: C.green, stem: 'PORTAB' },
  { breed: 'corgi', x: 876, s: .98, seed: 6, collar: C.purple, stem: 'TESTAB' },
];
function drawL3(g, t, ws) {
  const V = i => ws[i].v, T = i => ws[i].s;
  const gr = groove(t, .9);
  const vox = loud('vocals', t);
  const ilT = V(5), snapT = V(10), luckyT = V(9);
  park(g, t, { horizon: 1330, mood: t > snapT ? 'shades' : 'happy', look: [.2, .9], seed: 23, sunAt: [1020, 690], sunR: 56, trees: false, clouds: false });
  whiteboard(g, t, { x: 540, y: 775, w: 860, h: 250, feet: 330, seed: 730 });
  marker(g, '-ILITY', 540, 848, 132, { col: C.blue, seed: 27, t, prog: ramp(t, V(4), ilT, lin), w: .13 });
  // Clawd stands behind the row, biscuit held high.
  const BY = t < luckyT ? 962 : t < snapT ? lerp(962, 928, smooth(inv(luckyT, snapT, t))) + Math.sin(t * 40) * 2.5 * inv(luckyT, snapT, t) : 962;
  const snap = t >= snapT;
  const cl = { x: 540, y: 1250, s: .95, flip: 1, squash: gr.sq * .5, lean: gr.lean * .5 - (t > snapT ? .16 * Math.exp(-(t - snapT) / .25) : 0), bob: gr.bob * .6 };
  const hLw = [540 - 172, BY + 6], hRw = [540 + 172, BY + 6];
  const armL = snap ? { up: .7 + Math.sin((t - snapT) * 30) * .05 * Math.exp(-(t - snapT) / .3) } : { to: toLocal(cl, hLw[0], hLw[1]), reach: 110 };
  const armR = snap ? { up: .7 } : { to: toLocal(cl, hRw[0], hRw[1]), reach: 110 };
  clawd(g, { ...cl, t, seed: 1, eyes: snap ? 'happy' : t > luckyT ? 'wide' : 'open', mouth: clamp(vox * 1.5 - .1), look: [0, -.8], armL, armR });
  if (!snap) biscuit(g, t, 540, BY, { A: 200, w: 27, r: 41, seed: 6, rot: Math.sin(t * 40) * .02 * inv(luckyT, snapT, t) });
  bucket(g, t, 1012, 1520, { s: .95 });
  // The row of dogs and their tags.
  const dogs = TAGDOGS.map((d, i) => ({ ...d, chin: 1322 }));
  dogs.forEach((d, i) => {
    const b = groove(t + i * .05, .5);
    const catches = (i === 0 || i === 3) && t > snapT;
    const open = catches ? (t < snapT + .85 ? clamp((t - snapT - .28) / .25) : Math.abs(Math.sin((t - snapT) * 14)) * .5 * (t < snapT + 1.3 ? 1 : 0)) : 0;
    const jealous = (i === 1 || i === 2) && t > snapT + .5;
    pupil(g, t, { ...d, y: d.chin, look: [0, -.6], bob: b.bob * .5, squash: b.sq * .3, ear: gr.lean * 4, howl: open,
      eyes: catches && t > snapT + .85 ? 'happy' : jealous ? 'sad' : t > ilT + .8 && t < luckyT ? 'happy' : 'dot' });
  });
  dogs.forEach((d, i) => {
    const La = ilT + i * .19;
    const p = clamp((t - (La - .3)) / .3);
    const fall = 1 - easeIn(p, 2.2);
    const landed = t >= La;
    const bump = landed ? Math.exp(-(t - La) / .16) * .16 : 0;
    const rhyme = t > T(6) && t < T(9) + .2 ? beatPulse(t, .13) * .09 : 0;
    const swing = Math.sin(t * 2.3 + i * 1.3) * .05 + downRing(t + i * .03) * .01;
    puzzleTag(g, t, d.x, d.chin + 28, { stem: d.stem, swing, seed: 40 + i * 5, ility: p > 0, ilOff: [(i % 2 ? 40 : -40) * fall, -360 * fall, (i % 2 ? .9 : -.9) * fall], ilK: (.35 + .65 * Math.min(1, p * 4)) * (1 + bump + rhyme) });
    if (landed && t < La + .22) burst(g, d.x, d.chin + 28 + 118, 34, 30 + 70 * inv(La, La + .2, t), t, { col: C.yellow, n: 9, w: 6, seed: 12 + i, prog: inv(La, La + .18, t) });
  });
  // The snap: the biscuit parts along its groove and the two halves hang there a beat, then fly to the dogs at the ends.
  if (snap) {
    const sep = 34 * easeOut(inv(snapT, snapT + .1, t)) + Math.sin((t - snapT) * 30) * 2 * Math.exp(-(t - snapT) / .2);
    const fp = inv(snapT + .32, snapT + .85, t);
    const hx = (sd, tx) => lerp(540 + sd * (100 + sep), tx, easeOut(fp, 2)), hy = (ty) => lerp(BY, ty, fp * fp) - Math.sin(fp * Math.PI) * 60;
    if (fp < 1) {
      biscuit(g, t, hx(1, 872), hy(1290), { half: 1, A: 200, w: 27, r: 41, seed: 6, rot: .14 * easeOut(inv(snapT, snapT + .15, t)) + fp * 5, s: 1 - fp * .4 });
      biscuit(g, t, hx(-1, 168), hy(1290), { half: -1, A: 200, w: 27, r: 41, seed: 6, rot: -.14 * easeOut(inv(snapT, snapT + .15, t)) - fp * 5, s: 1 - fp * .4 });
    }
    const bp = ramp(t, snapT, snapT + .2);
    burst(g, 540, BY, 40, 40 + 130 * bp, t, { col: C.yellow, n: 14, w: 9, seed: 5, prog: bp * (1 - ramp(t, snapT + .18, snapT + .45)) + .001 });
    for (let k = 0; k < 9; k++) {
      const a = -Math.PI * (.1 + hash(k, 4) * .8), v = 180 + hash(k, 5) * 260, u = t - snapT;
      if (u > 0 && u < 1.2) dot(g, 540 + Math.cos(a) * v * u * 1.2, BY + Math.sin(a) * v * u + 700 * u * u, 5, { col: '#b57b3a', seed: 600 + k, t });
    }
  }
  pigeon(g, t, 960, 652, .6, { state: snap && t < snapT + .9 ? 'gasp' : 'perch', look: -1, flip: -1 });
  lyric(g, t, ws, { tailCol: C.green, tailBubble: bub('#8fd19a', '#245c1d'), seed: 11 });
}

// ------------------------------------------------------------------- 4 "But some of them are not, and so I hunt, for goodness' sake:"
// The lights go down. Three collars with odd endings hang in the dark (PERFORMANCE, COST, CORRECTNESS); Clawd, on all
// fours with a hound's ears and nose, sniffs along a heap of dictionaries in a spotlight. The hush.
function drawL4(g, t, ws) {
  const V = i => ws[i].v, T = i => ws[i].s;
  const NAVY = '#1c2552', POOL = '#f7ecc0';
  paper(g, { base: NAVY, vignette: .3 });
  const gr = groove(t, .3);
  scrub(g, [0, 1250, W, H], { col: '#2f6b4e', seed: 420, t, gap: 22, w: 26, alpha: .6, angle: -.1, wig: 24 });
  scrub(g, [0, 1330, W, H], { col: '#1f4a37', seed: 421, t, gap: 34, w: 22, alpha: .45, angle: .2, wig: 20 });
  // A few stars and the lamp that makes the spotlight.
  for (let i = 0; i < 14; i++) { const x = 40 + hash(i, 1) * 1000, y = 640 + hash(i, 2) * 560; if (y > 700 || x < 380 || x > 700) sparkle(g, x, y, 7 + hash(i, 3) * 8 + Math.sin(t * 5 + i) * 2, t, { col: '#fff3b0', seed: 400 + i, rot: hash(i, 5) }); }
  const LX = 540, LY = 668;
  beam(g, t, [LX, LY + 30], [540, 1420], { w0: 70, w1: 760, alpha: .26, seed: 5 });
  for (let i = 0; i < 14; i++) { const y = 720 + ((hash(i, 2) * 700 + t * (9 + hash(i, 3) * 12)) % 700), half = 30 + (y - 700) * .5, x = 540 + (hash(i, 1) - .5) * 2 * half * .9 + Math.sin(t * .8 + i) * 8; dot(g, x, y, 2.6 + hash(i, 4) * 2.6, { col: '#fff3b0', seed: 950 + i, t, alpha: .7 }); }
  // The pool of light, and everything in it drawn on its pale floor.
  const inPool = fn => { const b = PAGE.base, d = PAGE.dark, v = PAGE.vignette; PAGE.base = POOL; PAGE.dark = false; PAGE.vignette = 0; fn(); PAGE.base = b; PAGE.dark = d; PAGE.vignette = v; };
  blob(g, ellipse(540, 1450, 470, 120, 16, 0, 45), { fill: POOL, line: null, seed: 45, t, gap: 6, hw: 5.4, tone: 1.6, dens: 1 });
  // The three odd collars on a line across the top, dropping in on the beats.
  line(g, [[30, 736], [540, 762], [1050, 736]], { w: 5, col: '#8d8c97', seed: 700, t, spline: true, passes: 1, over: 0, alpha: .9 });
  const ODD = [{ txt: 'PERFORMANCE', x: 205, w: 350, col: C.orange, at: 132.45 }, { txt: 'COST', x: 545, w: 216, col: C.teal, at: 132.8 }, { txt: 'CORRECTNESS', x: 880, w: 350, col: C.pink, at: 133.2 }];
  ODD.forEach((o, i) => {
    const k = pop(t, o.at, .3);
    if (k <= 0) return;
    const sw = Math.sin(t * 2.1 + i * 1.7) * .06 + ring_(t, o.at) * .09;
    g.save(); g.translate(o.x, 764); g.rotate(sw); g.scale(k, k);
    // The collar: a band over the line; the tag hangs from it.
    line(g, Array.from({ length: 15 }, (_, j) => [Math.cos(j / 14 * TAU) * (o.w * .28), 14 + Math.sin(j / 14 * TAU) * 24]), { w: 15, col: o.col, seed: 710 + i, t, spline: true, passes: 1, closed: true, over: 0, alpha: .96 });
    blob(g, rrect(0, 96, o.w, 92, 16, 3, 720 + i, .5), { fill: '#fff3b0', shade: '#e8d77a', line: ink, lw: 5.6, seed: 720 + i, t, hw: 4.8, tone: 1.6, sh: .22 });
    marker(g, o.txt, 0, 118, 40, { col: ink, seed: 730 + i, t, w: .12, track: 4, prog: ramp(t, o.at + .05, o.at + .45, lin) });
    g.restore();
  });
  // The heap of dictionaries.
  inPool(() => {
    book(g, t, 660, 1488, 400, 70, '#2f7a92', { seed: 801, label: 'A-F' });
    book(g, t, 676, 1420, 350, 66, '#a34a5c', { seed: 802, label: 'G-M', rot: -.02 });
    book(g, t, 650, 1356, 300, 62, '#4a7a3a', { seed: 803, label: 'N-S', rot: .03 });
    book(g, t, 478, 1466, 210, 60, '#c98a2a', { seed: 804, label: 'T-Z', rot: -.3 });
    book(g, t, 668, 1298, 240, 54, '#5a4aa8', { seed: 805, rot: .07 });
    // Clawd: he looks up at the tags, shakes his head on "not,", drops to all fours on "and so I hunt," and sniffs along the books.
    const drop = ramp(t, T(6) - .1, T(6) + .3);
    const sniffing = ramp(t, T(8) - .05, T(8) + .15);
    const sx = lerp(210, 232, ease(t, T(6), T(8))) + (t > T(8) ? ease(t, T(8), T(12) - .2) * 190 : 0);
    const nod = sniffing * Math.sin(t * TAU * 3.5) * 5;
    const ang = drop * .5;
    const cx = sx, cy = 1548 + drop * 4;
    g.save(); g.translate(cx + 150, cy); g.rotate(ang); g.translate(-(cx + 150), -cy);
    clawd(g, { x: cx, y: cy, s: .95, t, seed: 1, flip: 1, eyes: drop > .3 ? 'half' : t > T(5) && t < T(6) ? 'sad' : 'open', mouth: 0, look: drop > .3 ? [.9, .9] : [.2, -.9], brow: drop > .3 ? -.6 : .6, bob: nod, squash: .4 * drop,
      armL: drop > .3 ? { up: -.4 } : { up: .1 }, armR: drop > .3 ? { to: [190, -20], reach: 20 } : { up: .1 },
      prop: (g2) => houndBits(g2, t, { sniff: sniffing }) });
    g.restore();
    const found = pop(t, 136.45, .25);
    if (found > 0) { g.save(); g.translate(cx + 70, 1235); g.scale(found, found); marker(g, '!', 0, 0, 110, { col: '#ffd84a', seed: 970, t, w: .17 }); g.restore(); }
    // Sniff marks flowing into the nose, and a SNIFF on the beats.
    if (sniffing > .3) {
      const nose = fromLocal({ x: cx, y: cy, s: .95, flip: 1, lean: 0, bob: 0, squash: 0 }, 0, -122);
      for (let k = 0; k < 3; k++) { const u = ((t * 3 + k / 3) % 1); line(g, [[nose[0] + 230 - u * 120, nose[1] + 90 + k * 22 - u * 40], [nose[0] + 240 - u * 130 + 18, nose[1] + 96 + k * 22 - u * 44]], { w: 5, col: '#8d8c97', seed: 900 + k, t, spline: false, passes: 1, over: 0, alpha: (1 - u) * .8 }); }
    }
  });
  // The lamp on the line of the beam.
  blob(g, [[LX - 34, LY - 26], [LX + 34, LY - 26], [LX + 50, LY + 34], [LX - 50, LY + 34]], { fill: '#5b5a66', shade: '#2f2e3a', line: ink, lw: 5.6, seed: 46, t, hw: 4.8, tone: .9, sh: .3 });
  line(g, [[LX, 640], [LX, LY - 26]], { w: 6, col: '#8d8c97', seed: 47, t, spline: false, passes: 1, over: 0 });
  window.__markInk = CREAM;
  lyric(g, t, ws, { col: CREAM, tailCol: C.purple, tailBubble: bub('#b79be6', CREAM), seed: 12 });
}
// A little ring after an event (a tag swinging after it drops in).
function ring_(t, t0) { const d = t - t0; return d < 0 ? 0 : Math.exp(-d * 3.2) * Math.sin(d * 18); }

// ------------------------------------------------------------------- 5 "Resilience... resilience... ...a stroke of brilliance!"
// A bulldog with his ball in his mouth is flattened by a rolling pin (Clawd, beside him, slams it down), keeps hold of the
// ball, and springs back, twice, on the two "resilience"s; then on "stroke" Clawd strokes his head, once, and the dog
// lights up in sparkles.
function drawL5(g, t, ws) {
  const V = i => ws[i].v, T = i => ws[i].s;
  const gr = groove(t, .8);
  const vox = loud('vocals', t);
  const s1 = V(0), s2 = V(1), strokeT = V(3);
  const DX = 610, GY = 1518, DS = 1.55, CHIN = GY - 95 * DS, TOP0 = CHIN - 160 * DS, HT = GY - TOP0, FLAT = .17;   // the dog's middle, ground line, chin, top and height
  const PINX = DX, PINL = 450;
  // The pin's bottom edge over time: it winds up, slams down, and lifts on each spring.
  const cycle = (rel) => {
    const a = rel - .34;
    if (t < a - .38) return null;
    if (t < a) return 1000 - ramp(t, a - .38, a - .05) * 55;
    if (t < rel) return lerp(945, GY - HT * FLAT, easeIn(inv(a, a + .17, t), 1.8));
    if (t < rel + .3) return lerp(GY - HT * FLAT, 975, easeOut(inv(rel, rel + .24, t)));
    return null;
  };
  let pinB = cycle(s1);
  if (pinB == null) pinB = cycle(s2);
  const fallPin = t > 138.78;
  const pinBottom = pinB == null ? 985 : pinB;
  const spr = (t0) => FLAT + (1 - FLAT) * spring(t, t0, { f: 2.2, z: .28 });
  const kSpring = t < s1 ? 1 : t < s2 - .34 ? spr(s1) : t < s2 ? spr(s1) : spr(s2);
  const pressing = (t > s1 - .34 && t < s1) || (t > s2 - .34 && t < s2);
  const k = pressing ? Math.min(kSpring, clamp((GY - pinBottom) / HT, FLAT, 1.2)) : kSpring;
  const squashed = k < .5;
  park(g, t, { horizon: 1330, mood: squashed ? 'gasp' : t > strokeT ? 'shades' : 'happy', look: [-.3, .9], seed: 25, sunAt: [1020, 690], sunR: 56, trees: false, clouds: false });
  whiteboard(g, t, { x: 540, y: 775, w: 860, h: 250, feet: 330, seed: 750 });
  marker(g, 'RESILIENCE', 540, 842, 104, { col: C.blue, seed: 51, t, prog: ramp(t, V(0) - .55, V(0), lin), w: .13 });
  // Clawd stands beside the dog, holding the pin by its end in his right hand, then stroking with the same hand.
  const strokeP = ease(t, strokeT - .02, strokeT + .5);
  const cl = { x: 175, y: 1522, s: 1.0, flip: 1, squash: gr.sq * .4, lean: gr.lean * .4, bob: gr.bob * .5 };
  const pinY = pinBottom - 37;
  const hold = [PINX - PINL / 2 - 34, pinY];
  const holding = !fallPin;
  const strokeXY = [lerp(DX + 110, DX - 140, strokeP), TOP0 - 14 + Math.sin(strokeP * Math.PI) * -8 - (1 - ramp(t, 139.05, 139.37)) * 70];
  const armR = holding ? { to: toLocal(cl, hold[0], hold[1]), reach: 400 } : t < 139.85 ? { to: toLocal(cl, strokeXY[0], strokeXY[1]), reach: 420 } : { up: .2 };
  const grit = squashed || (t > s1 - .5 && t < s1 + .1) || (t > s2 - .5 && t < s2 + .1);
  groundShade(g, t, cl.x, 1526, 340, { seed: 7 });
  clawd(g, { ...cl, t, seed: 1, eyes: t > strokeT - .1 ? 'happy' : grit ? 'squint' : 'open', brow: grit ? -1 : 0, mouth: clamp(vox * 1.5 - .1), look: [.7, -.3], armL: { up: .15 }, armR, sweat: t > s2 && t < strokeT });
  // The bulldog on his mat, flattened about the ground line, ball still in his mouth.
  mat(g, t, DX, 1556, 600, 60, { seed: 91, col: '#e0837a' });
  const sx = 1 + (1 - Math.min(k, 1)) * .55 + (k > 1 ? -(k - 1) * .5 : 0);
  const nod = t > strokeT && t < strokeT + .8 ? Math.sin(strokeP * Math.PI) * 5 : 0;
  g.save(); g.translate(DX, GY); g.scale(sx, k); g.translate(-DX, -GY);
  pupil(g, t, { breed: 'bulldog', x: DX, y: CHIN + nod, s: DS, seed: 71, collar: C.red, look: [-.4, .3], eyes: squashed ? 'x' : t > strokeT ? 'happy' : ((t > s1 - .6 && t < s1 - .3) || (t > s2 - .6 && t < s2 - .3)) ? 'wide' : 'dot', body: true, bob: 0, tilt: strokeP > 0 && strokeP < 1 ? (strokeP - .5) * .06 : 0 });
  g.restore();
  drawBall(g, t, DX, GY - (GY - (CHIN - 30 * DS + 6)) * Math.min(k, 1.05), 35, { sq: squashed ? .25 : 0, spin: 0 });
  // The pin.
  if (!fallPin) rollingPin(g, t, PINX, pinY, PINL, { seed: 8, spin: t * 3 });
  else { const u = inv(138.78, 139.18, t); rollingPin(g, t, lerp(PINX, 330, easeOut(u, 2)), lerp(pinY, 1526, easeIn(u, 1.6)), PINL, { seed: 8, rot: u * .3, spin: t * 3 }); }
  // Sparkles: a stroke of brilliance.
  if (t > strokeT + .05) {
    const u = t - strokeT;
    burst(g, DX, 1290, 230, 230 + 130 * ramp(t, strokeT, strokeT + .35), t, { col: C.yellow, n: 18, w: 9, seed: 9, prog: ramp(t, strokeT + .05, strokeT + .35) * (1 - ramp(t, strokeT + .5, strokeT + 1.0) * .6) });
    for (let i = 0; i < 11; i++) {
      const a = i / 11 * TAU + .3, r = 190 + 140 * easeOut(inv(0, .7, u)) + hash(i, 3) * 60, sz = (16 + hash(i, 4) * 22) * (.75 + .25 * Math.sin(t * 9 + i * 2)) * ramp(t, strokeT + .05 + i * .02, strokeT + .3 + i * .02);
      if (sz > 1) sparkle(g, DX + Math.cos(a) * r * 1.0, 1265 + Math.sin(a) * r * .85, sz, t, { col: i % 3 ? C.yellow : '#fff3b0', seed: 300 + i, rot: t * 1.5 + i });
    }
  }
  pigeon(g, t, 150, 652, .6, { state: squashed ? 'gasp' : 'perch', look: 1 });
  lyric(g, t, ws, { tailCol: C.yellow, tailBubble: bub('#f7d774', '#8a6a10'), seed: 13 });
}

// ------------------------------------------------------------------- 6 "Compliance... compliance... ...it's rocket science!"
// At the ring gate an inspector checks a dog's licence tag and vaccination card, twice, and stamps the entry: rules that
// come from outside. His checklist is so long that it needs a rocket to carry it.
function drawL6(g, t, ws) {
  const V = i => ws[i].v, T = i => ws[i].s;
  const gr = groove(t, .8);
  const c1 = V(0), c2 = V(1), stT = V(2), rkT = V(3), scT = V(4);
  park(g, t, { horizon: 1300, mood: t > rkT ? 'gasp' : 'happy', look: [-.4, .9], seed: 26, sunAt: [1020, 690], sunR: 56, trees: true, clouds: false });
  whiteboard(g, t, { x: 540, y: 775, w: 860, h: 250, feet: 330, seed: 760 });
  marker(g, 'COMPLIANCE', 540, 842, 104, { col: C.blue, seed: 61, t, prog: ramp(t, V(0) - .55, V(0), lin), w: .13 });
  // The ring gate, behind: posts either side, its barrier lifting once the entry is stamped, and its sign.
  const lift = ramp(t, stT + .3, stT + .8);
  ringGate(g, t, 540, 1345, 900, { seed: 50, arm: lift * .36 });
  g.save(); g.translate(540, 1118 - lift * 14);
  blob(g, rrect(0, 0, 230, 84, 12, 2, 55, .5), { fill: '#e2b571', shade: '#b98243', line: ink, lw: 5.6, seed: 55, t, hw: 4.8, tone: .9, sh: .3 });
  marker(g, 'ENTRY', 0, 24, 48, { col: ink, seed: 56, t, w: .12, track: 5 });
  g.restore();
  // The scroll lies behind the dog and the inspector; the rocket at its far end takes it up on "science!".
  const IX = 770, IY = 1522, IS = 1.42;
  const cbx = IX - 118, cby = 1336, CS = 1.0;
  const grow = ramp(t, rkT - .1, rkT + .55, x => x * x * (3 - 2 * x));
  const lf = t > scT - .08 ? easeIn(inv(scT - .08, scT + .62, t), 2.0) : 0;
  const rx = 96 + lf * 40, ry = 1450 - lf * 900;
  const rk = pop(t, rkT + .12, .28);
  // The dog waiting to go in, and the inspector.
  const chk1 = ramp(t, c1 + .05, c1 + .4), chk2 = ramp(t, c2 + .05, c2 + .4);
  const happy = t > c2 + .3;
  groundShade(g, t, 300, 1560, 330, { seed: 8 }); groundShade(g, t, 770, 1546, 380, { seed: 9 });
  const dogBob = gr.bob * .5 + (t > stT + .2 ? Math.abs(Math.sin((t - stT) * 10)) * 12 * gate(t, stT + .2, stT + .9, .1) : 0);
  pupil(g, t, { breed: 'beagle', x: 300, y: 1450, s: 1.5, seed: 81, collar: C.blue, look: [.7, -.2], eyes: happy ? 'happy' : 'dot', bob: dogBob, tilt: -.05 + Math.sin(t * 2) * .02, ear: gr.lean * 3,
    extra: (g2) => { blob(g2, ellipse(0, 24, 17, 17, 8, 0, 84), { fill: C.yellow, line: ink, lw: 4.4, seed: 84, t, hw: 4.4, tone: .8 }); } });
  if (grow > 0) {
    const end = [rx, ry + 36];
    const midx = lerp(300, (300 + end[0]) / 2, lf), midy = lerp(1490, (1490 + end[1]) / 2, lf);
    scroll(g, t, [[cbx + 10, cby + 130], [cbx - 4, 1478], [cbx - 90, 1490], [midx + 200, 1490 - lf * 50], [midx, midy], end], { grow, seed: 130, w: 82 });
  }
  const dip = -.1 * Math.max(gate(t, c1 - .05, c1 + .5, .12), gate(t, c2 - .05, c2 + .5, .12));
  // The stamp hand: out to the side, up over the clipboard, down on it, and back.
  const wind = ramp(t, stT - .5, stT - .2), dn = t < stT ? easeIn(inv(stT - .2, stT, t), 2) : 1 - ramp(t, stT + .06, stT + .5);
  const cbL = [(cbx - IX) / IS, (cby - IY) / IS];
  const stampT = [lerp(110, cbL[0] + 30, wind), lerp(-200, -300, wind) + dn * (cbL[1] + 55 + 300)];
  person(g, { x: IX, y: IY, s: IS, t, seed: 7, skin: '#e6b88c', hair: { style: 'cap', col: '#25397c' }, top: C.orange, bottom: '#25397c', eyes: 'dot', mouth: t > stT ? 'smile' : 'flat', brow: 1, cheeks: false,
    look: [-.8, .3], lean: dip + gr.lean * .3, bob: gr.bob * .3, armL: { to: [cbL[0] - 40, cbL[1] + 20] }, armR: { to: stampT },
    hold: { R: (g2, x, y) => rubberStamp(g2, x, y - 6, .4, t, { down: 1, seed: 88, col: C.green }) } });
  // The clipboard (its checklist ticks itself, and the stamp's mark lands on it).
  clipboard(g, cbx, cby, CS, t, { prog: [chk1, chk2, 0], tilt: -.08, labels: ['TAG', 'SHOTS', ''] });
  if (t > stT + .04) { const u = backOut(inv(stT + .04, stT + .24, t), 2.6); g.save(); g.translate(cbx + 10, cby + 96); g.rotate(-.14); g.scale(u, u); blob(g, rrect(0, 0, 120, 66, 10, 2, 57, .4), { fill: null, line: C.green, lw: 8, seed: 57, t }); marker(g, 'OK', 0, 22, 50, { col: C.green, seed: 58, t, w: .16 }); g.restore(); }
  // The two checks, as pictures over the dog: the licence tag, then the vaccination card.
  const check = (at, kind) => {
    const k = pop(t, at, .28) * (1 - ramp(t, at + .66, at + .84));
    if (k <= 0) return;
    g.save(); g.translate(325, 1170); g.scale(k, k);
    if (kind === 0) { blob(g, ellipse(0, 0, 78, 78, 12, 0, 89), { fill: C.yellow, shade: '#d99a1a', line: ink, lw: 6, seed: 89, t, hw: 5, tone: .9, sh: .3 }); marker(g, '042', 0, 20, 48, { col: ink, seed: 90, t, w: .13 }); }
    else { blob(g, rrect(0, 0, 176, 120, 12, 2, 92, .5), { fill: '#fbf8ef', line: ink, lw: 6, seed: 92, t, hw: 5, tone: 1.1, dens: .4 }); paw(g, -44, -6, 54, t, { col: C.blue, seed: 93 }); [0, 1].forEach(i => tick(g, 30 + i * 34, 8, 34, t, { col: C.green, seed: 94 + i, w: 9 })); }
    tick(g, 84, -70, 60, t, { col: C.green, seed: 95, w: 14, prog: ramp(t, at + .14, at + .32) });
    g.restore();
  };
  check(c1, 0); check(c2, 1);
  if (grow > 0 && rk > 0) rocket(g, t, rx, ry, { s: 1.15 * rk, flame: t > scT - .4 ? .6 + lf * 1.6 : 0, seed: 12, tilt: Math.sin(t * 25) * .03 * (t > scT ? 1 : 0) });
  if (t > scT - .05) for (let i = 0; i < 6; i++) { const a = t - scT - i * .1; if (a > 0 && a < .8) { const p = a / .8; g.save(); g.globalAlpha *= 1 - p; blob(g, scallop(rx + Math.sin(i * 2 + a * 9) * 14, ry + 120 + p * 130 + i * 24, 30 + p * 24, 7, .2, i, 140 + i), { fill: '#fbf8ef', line: ink, lw: 4, seed: 140 + i, t, hw: 4.6, tone: 1.2, dens: .5 }); g.restore(); } }
  pigeon(g, t, 150, 652, .6, { state: t > rkT ? 'flap' : 'perch', look: 1 });
  lyric(g, t, ws, { tailCol: C.red, tailBubble: bub('#f08a80', '#8a2620'), seed: 14 });
}

// ------------------------------------------------------------------- 7 "The 'ilities'? A nickname for the family, the lot:"
// A family portrait in a gilt frame on the easel, its plaque THE 'ILITIES; the odd-named dogs run in and squeeze into it
// on "the lot:"; Clawd takes the photograph with a cable release: flash.
function drawL7(g, t, ws) {
  const V = i => ws[i].v, T = i => ws[i].s;
  const gr = groove(t, .8);
  const vox = loud('vocals', t);
  const nickT = V(3), lotT = V(8), flashT = lotT + .02;
  const flash = t > flashT && t < flashT + .14;
  park(g, t, { horizon: 1330, mood: t > lotT ? 'shades' : 'happy', look: [-.3, .9], seed: 27, sunAt: [1030, 630], sunR: 52, trees: false, clouds: false });
  // The easel legs under the frame.
  [-1, 1].forEach((sd, i) => blob(g, capsule([540 + sd * 250, 1240], [540 + sd * 300, 1500], 17, 14, 5, 770 + i), { fill: '#c99a5a', shade: '#8b5f2a', line: ink, lw: 6.4, seed: 770 + i, t, hw: 5, sh: .4, tone: .6 }));
  const FX = 540, FY = 960, FW = 940, FH = 560;
  blob(g, rrect(FX, FY, FW - 60, FH - 60, 10, 2, 61, .4), { fill: '#d5e7f4', line: null, seed: 61, t, hw: 5, gap: 7, tone: 1.5, dens: .7 });
  const pose = (d, i, y0, s0, o = {}) => {
    const b = groove(t + i * .05, .3);
    pupil(g, t, { ...d, y: y0 - (o.hop || 0), s: s0, look: [0, 0], eyes: flash || (t > flashT && t < flashT + .3) ? 'shut' : 'dot', bob: b.bob * .3 + (o.bob || 0), squash: b.sq * .2, ear: gr.lean * 3, mouth: t > lotT + .3 ? .35 : 0, body: o.body ?? true });
  };
  const BACK = [{ breed: 'lab', x: 250, seed: 21, collar: C.orange }, { breed: 'husky', x: 418, seed: 22, collar: C.teal }, { breed: 'sheepdog', x: 664, seed: 23, collar: C.blue }, { breed: 'greyhound', x: 836, seed: 24, collar: C.green }];
  const FRONT = [{ breed: 'bulldog', x: 318, seed: 25, collar: C.red }, { breed: 'beagle', x: 540, seed: 26, collar: C.purple }, { breed: 'corgi', x: 764, seed: 27, collar: C.pink }];
  BACK.forEach((d, i) => pose(d, i, 930, .92, { body: false }));
  FRONT.forEach((d, i) => pose(d, i + 4, 1108, 1.12));
  // The odd-named ones arrive at the last moment, each with a hop, and squeeze into the gaps.
  const ODD = [{ breed: 'pug', x: 176, seed: 28, collar: C.yellow, at: lotT - .8, y: 1165, s: .8 }, { breed: 'chihuahua', x: 904, seed: 29, collar: C.lime, at: lotT - .55, y: 1165, s: .78 }, { breed: 'dalmatian', x: 540, seed: 30, collar: C.sky, at: lotT - .3, y: 1185, s: .8 }];
  ODD.forEach((d, i) => {
    const p = inv(d.at, d.at + .4, t);
    if (p <= 0) return;
    const sx = i === 0 ? -120 : i === 1 ? 1200 : 540, sy = 1560;
    const x = lerp(sx, d.x, easeOut(p, 2.2)), y = lerp(sy, d.y, easeOut(p, 2)) - Math.sin(p * Math.PI) * 120;
    pose({ ...d, x }, i + 8, y, d.s, { hop: 0 });
  });
  frame(g, t, FX, FY, FW, FH, { seed: 62, plaque: "THE 'ILITIES", plaqueProg: ramp(t, nickT - .55, nickT, lin) });
  // The camera on its tripod, and Clawd with the cable release.
  const CX = 176, CY = 1372;
  camera(g, t, CX, CY, { s: 1.0, tilt: -.5, seed: 70 });
  const cl = { x: 900, y: 1520, s: .88, flip: 1, squash: gr.sq * .5, lean: gr.lean * .5, bob: gr.bob * .6 };
  const squeeze = gate(t, lotT - .12, lotT + .1, .05);
  const relL = toLocal(cl, 890, 1445);
  clawd(g, { ...cl, t, seed: 1, eyes: t > lotT ? 'happy' : 'open', mouth: clamp(vox * 1.5 - .1), look: [-.8, -.3], armL: { up: .15 }, armR: { to: [110, -60 + squeeze * 8], reach: 20 },
    prop: (g2, o) => { const cam = toLocal(cl, CX + 30, CY + 4); line(g2, [cam, [(cam[0] + o.hR[0]) / 2, (cam[1] + o.hR[1]) / 2 + 90], o.hR], { w: 6, col: '#2b2a33', seed: 72, t, spline: true, passes: 1, over: 0, alpha: .95 }); blob(g2, ellipse(o.hR[0] + 6, o.hR[1] + 4, 20 - squeeze * 6, 20 - squeeze * 6, 8, 0, 73), { fill: C.red, line: ink, lw: 4.6, seed: 73, t, hw: 4.6, tone: .9 }); } });
  groundShade(g, t, 900, 1524, 300, { seed: 6 });
  if (flash) {
    burst(g, CX + 40, CY - 70, 40, 230, t, { col: '#fffbe6', n: 16, w: 12, seed: 4, prog: 1 });
    g.save(); g.globalAlpha *= .8; blob(g, rrect(FX, FY, FW - 60, FH - 60, 10, 2, 63, .4), { fill: '#ffffff', line: null, seed: 63, t, hw: 5, gap: 7, tone: 2, dens: 1 }); g.restore();
  }
  pigeon(g, t, 130, 652, .6, { state: t > lotT ? 'gasp' : 'perch', look: 1 });
  lyric(g, t, ws, { tailCol: C.purple, tailBubble: bub('#b79be6', '#4a2f8a'), seed: 15 });
}

// ------------------------------------------------------------------- 8 "the ending's not the point: they're all dimensions, rhyme or not!"
// The board's sliders are all set differently. The -ILITY endings fall off every collar, then the tags, and each dog is
// left with a sash reading DIMENSION; on "not!" they cheer.
function drawL8(g, t, ws) {
  const V = i => ws[i].v, T = i => ws[i].s;
  const gr = groove(t, 1.0);
  const vox = loud('vocals', t);
  const offT = V(1), tagsT = V(5), allT = V(6), notT = V(10);
  park(g, t, { horizon: 1330, mood: t > allT ? 'shades' : 'happy', look: [-.3, .9], seed: 28, sunAt: [1030, 630], sunR: 52, trees: false, clouds: false });
  // The board: five sliders, every one set differently.
  whiteboard(g, t, { x: 540, y: 815, w: 860, h: 330, feet: 330, seed: 780 });
  const SC = [C.red, C.orange, C.green, C.blue, C.purple], SP = [.18, .86, .5, .94, .3];
  SC.forEach((col, i) => {
    const y = 724 + i * 55, k = pop(t, 148.0 + i * .06, .3);
    const pos = clamp(SP[i] + Math.sin(t * 1.3 + i * 1.7) * .035 + (t > notT ? Math.sin(t * 9 + i) * .03 : 0), .03, .97);
    dot(g, 224, y, 13 * k, { col, seed: 800 + i, t });
    dimSlider(g, t, 540, y, 500, { seed: 810 + i * 7, pos, prog: k, thick: 15, ticks: false, col, knob: (g2, x, yy) => blob(g2, ellipse(x, yy, 17, 17, 8, 0, 820 + i), { fill: col, line: ink, lw: 4.4, seed: 820 + i, t, hw: 4.4, tone: .95 }) });
  });
  // Clawd behind the row: a shrug on "point:", arms up on "not!".
  const cheer = t > notT - .1;
  const cl = { x: 540, y: 1256, s: .95, flip: 1, squash: gr.sq * .5, lean: gr.lean * .5, bob: gr.bob * (cheer ? 1.4 : .6) };
  const shrug = gate(t, T(4) - .05, T(5) + .1, .15);
  clawd(g, { ...cl, t, seed: 1, eyes: cheer ? 'happy' : 'open', mouth: clamp(vox * 1.5 - .1), look: [0, -.2], armL: { up: cheer ? 1 : .3 + shrug * .6, out: shrug }, armR: { up: cheer ? 1 : .3 + shrug * .6, out: shrug } });
  bucket(g, t, 990, 1522, { s: .95 });
  // The row of dogs, their tags, and what falls off.
  const dogs = TAGDOGS.map(d => ({ ...d, chin: 1322 }));
  dogs.forEach((d, i) => {
    const b = groove(t + i * .05, cheer ? 1.1 : .5);
    const sk = pop(t, allT + i * .11, .3);
    pupil(g, t, { ...d, y: d.chin - (cheer ? Math.abs(Math.sin((t - notT) * 7 + i)) * 26 : 0), look: [0, -.5], bob: b.bob * .6, squash: b.sq * .4, ear: gr.lean * 4, eyes: t > allT ? 'happy' : 'dot', mouth: cheer ? .5 : 0, tongue: cheer,
      extra: (g2, rx) => sash(g2, t, rx, { k: sk, seed: 850 + i }) });
  });
  dogs.forEach((d, i) => {
    const off = offT + i * .22, dropT = tagsT + i * .05;
    // The ending pops off, hops and falls to the grass; the tag is dropped a little later.
    const u = t - off;
    if (t < dropT + .5) {
      const tagFall = t > dropT ? easeIn(inv(dropT, dropT + .45, t), 2) * 260 : 0;
      puzzleTag(g, t, d.x, d.chin + 28 + tagFall, { stem: d.stem, swing: Math.sin(t * 2.3 + i) * .05 + (t > dropT ? (i % 2 ? .5 : -.5) * inv(dropT, dropT + .4, t) : 0), seed: 40 + i * 5, ility: u < 0,
        alpha: t > dropT ? 1 - inv(dropT + .2, dropT + .5, t) : 1 });
    }
    if (u >= 0) {
      const gx = d.x + (i % 2 ? 28 : -28) * (1 - Math.exp(-u * 3)) + (i - 1.5) * 8, land = 1500 + (i % 2) * 16;
      const y = u < .5 ? lerp(d.chin + 28 + 120, land, easeIn(u / .5, 1.8)) - Math.sin(clamp(u / .5) * Math.PI) * 130 : land - Math.abs(Math.sin((u - .5) * 9)) * 22 * Math.exp(-(u - .5) * 3.5);
      ilityPiece(g, t, gx, y, { rot: (i % 2 ? .3 : -.3) + (u < .5 ? u * (i % 2 ? 6 : -6) : 0), s: .5, seed: 860 + i });
    }
  });
  if (t > notT) { burst(g, 540, 1000, 300, 300 + 140 * ramp(t, notT, notT + .35), t, { col: C.yellow, n: 20, w: 9, seed: 5, prog: ramp(t, notT, notT + .3) * (1 - ramp(t, notT + .35, notT + .9)) + .001 });
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, r = 200 + 260 * easeOut(inv(notT, notT + .7, t)); sparkle(g, 540 + Math.cos(a) * r, 1120 + Math.sin(a) * r * .8, 22 * (.7 + .3 * Math.sin(t * 9 + i)), t, { col: [C.yellow, C.pink, C.sky][i % 3], seed: 900 + i, rot: t * 2 + i }); } }
  pigeon(g, t, 130, 652, .6, { state: cheer ? 'flap' : 'perch', look: 1 });
  lyric(g, t, ws, { tailCol: C.teal, tailBubble: bub('#7fd6cf', '#146a63'), seed: 16 });
}
