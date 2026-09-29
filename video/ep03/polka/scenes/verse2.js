// Break 1 and verse 2, "the agent in the code": Blob's den, a wooden shed. Blob (the code) is a huge
// shaggy dog asleep in his bed; Clawd, the agent, in a hard hat with a headlamp, goes to work on him.
// One picture a line, each landing on its word; the room is cool teal and blue with a warm lamp for
// contrast, so it reads as the other family of "ilities".
import { W, H, TAU, clamp, inv, lerp, easeOut, easeIn, easeInOut, backOut, smooth, hash, beatPos, beatPulse, downPulse, words, loud, sway, elastic } from '../kit.js';
import { shot, join } from '../shots.js';
import { write, layout } from '../hand.js';
import { blob, line, dot, hatch, wash } from '../pencil.js';
import { clawd, shaggy } from '../chars.js';
import { rosette, sparkle, burst, paw, bubble, clipboard } from '../props.js';
import { dogFront } from '../people.js';
import { groove, pop, ramp } from '../common.js';
import { sing, layoutLine } from '../lyrics.js';
import { pigeon } from '../world.js';
import { spring, shake, hop, gate, ease } from '../life.js';
import { rrect, ellipse, capsule, star } from '../shapes.js';
import { GRAPHITE, C } from '../palette.js';
import { mix } from '../kit.js';
import { den, bed, hardHat, beam, tagBoard, puff, zzz, FLOOR, againButton, flea, netTool, probeTool, thermoTool, errorBox, brokenVase, thumbUp, chalkboard, mop, manual, cabinet, moth, dashedRect, cone, rigBox, socketPatch, plugTool, readout, furTuft, dogBowl, scrawl, egg, pedestal, stool, dialScale, TAGS, DEN, malletTool, blobDog, ghostRosette } from '../props-verse2.js';

// Where Clawd's own points land on the page (his body's local space is feet on y = 0, x centred).
function cpt(c, lx, ly) {
  const sq = c.squash || 0, sx = c.s * (c.flip ?? 1) * (1 + sq * .1), sy = c.s * (1 - sq * .13);
  const px = lx * sx, py = ly * sy, a = c.lean || 0, ca = Math.cos(a), sa = Math.sin(a);
  return [c.x + px * ca - py * sa, c.y - (c.bob || 0) + px * sa + py * ca];
}
// The point of the page (wx, wy) in Clawd's own space, for an arm to reach it however he is bobbing.
function toLocal(c, wx, wy) {
  const sy = c.s * (1 - (c.squash || 0) * .13), sx = c.s * (1 + (c.squash || 0) * .1);
  return [(wx - c.x) / sx, (wy - (c.y - (c.bob || 0))) / sy];
}
// Blob (huge): the softer-coated drawing in props-verse2.js; set SOFT_BLOB false for chars.js's own shaggy.
const SOFT_BLOB = true;
const BLOB = (g, o) => (SOFT_BLOB && !o.puppy ? blobDog : shaggy)(g, o);
const vox = t => clamp(loud('vocals', t) * 1.4 - .05);
const damp = (t, t0, k = 9, f = 26) => t < t0 ? 0 : Math.exp(-(t - t0) * k) * Math.cos((t - t0) * f);
// A value that holds each key and glides to the next one in the `tr` seconds before it: keys are [time, a, b, ...].
function track(t, keys, tr = .14) {
  let i = 0;
  while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const u = i === keys.length - 1 ? 0 : smooth(clamp((t - (b[0] - tr)) / tr));
  return a.slice(1).map((v, k) => lerp(v, b[k + 1], u));
}

// The joins are pushes on the beat before each line's pick-up; each shot starts at its join's start.
const J = [[58.412, 58.842], [61.872, 62.305], [65.327, 65.766], [68.778, 69.208], [72.234, 72.672], [75.704, 76.138], [79.157, 79.589]];
const shotOf = (fn, ws) => (g, t) => { window.__markInk = GRAPHITE; fn(g, t, ws); };
export function register(S) {
  const wb = words('Break 1', 'Right');
  const L = [['Confused', drawL1], ['I ask it why', drawL2], ['I wipe the payments', drawL3], ['We walk it through', drawL4], ["The blob's so huge", drawL5], ['I patch one bug', drawL6], ["What you don't know", drawL7], ["You'll make my day", drawL8]].map(([k, fn]) => [words('Verse 2', k), fn]);
  W8 = L[7][0];
  shot(52.2, J[0][1] + .004, shotOf(drawBreak, wb), { id: 'v2-break' });
  for (let i = 0; i < 7; i++) {
    join(J[i][0], J[i][1], 'push', { dir: [-1, 0] });
    const end = i < 6 ? J[i + 1][1] + .004 : 83.456;
    shot(J[i][0], end, shotOf(L[i][1], L[i][0]), { id: 'v2-' + (i + 1) });
  }
  shot(83.456, 87.404, shotOf(drawL8, L[7][0]), { id: 'v2-8' });
}

// ------------------------------------------------------------------- Break 1 (52.8-56.9) and the pause
// The band falls to almost nothing. Clawd sighs on "Right."; a hard hat with a headlamp drops on his head;
// he points at the sleeping code, and holds up a clipboard of six blank name tags, one for each thing he
// is about to ask for. Then, to a few piano notes, he tiptoes up to the dog.
function drawBreak(g, t, ws) {
  const T = i => ws[i].s, V = i => ws[i].v;
  const gr = groove(t, .3);
  den(g, t, { board: { x: 50, y: 790 }, win: { x: 640, y: 700, w: 220, h: 230, sky: 0 }, lamp: { x: 545, y: 790 } });
  // Blob, asleep in his bed.
  const B = { x: 790, y: 1520, s: 1.2 };
  bed(g, t, B.x, B.y - 4, 440);
  BLOB(g, { ...B, t, seed: 8, state: 'sleep', mouth: 0, bob: gr.bob * .15 });
  zzz(g, t, 985, 1030, 1.1);
  // Clawd.
  const walk = ease(t, 57.0, 58.4, x => x);
  const sigh = gate(t, 52.8, 53.3, .16), inhale = gate(t, 52.5, 52.8, .14);
  const hit = damp(t, 53.24);
  const pointing = t >= 53.34 && t < 55.0, clip = t >= 55.0 && t < 56.95, carry = t >= 55.0, lower = ease(t, 56.95, 57.25);
  let eyes = 'open', brow = 0, raise = 0, look = [.2, 0];
  if (t >= 52.8 && t < 53.24) { eyes = 'half'; brow = .5; }
  else if (t >= 53.24 && t < 53.62) { eyes = 'wide'; raise = 1; look = [0, 0]; }
  else if (t >= 53.62 && t < 54.12) { eyes = 'half'; brow = -.7; look = [.9, 0]; }
  else if (t >= 54.12 && t < 55.03) { eyes = 'wide'; raise = .9; look = [.9, -.2]; }
  else if (t >= 55.03 && t < 56.95) { eyes = 'half'; brow = -.35; look = [0, 0]; }
  else if (t >= 56.95) { eyes = 'open'; brow = .4; look = [.9, 0]; }
  const C0 = { x: lerp(320, 500, easeInOut(walk)), y: 1600, s: 1.35 };
  const lean = gr.lean * .5 + (clip ? -.03 : 0) + (pointing ? .04 : 0) - sigh * .02;
  const c = { ...C0, bob: gr.bob * .35 - sigh * 6 + inhale * 5, squash: sigh * .5 + hit * .9 + gr.sq * .3, lean };
  // The beam of the headlamp, from the hat onto the sleeper's face, once it is on.
  const landed = t >= 53.24;
  if (landed) {
    const [lx, ly] = cpt(c, 0, -316);
    const on = ramp(t, 53.24, 53.5);
    beam(g, t, lx, ly, B.x - 40, 1245, { w0: 44, w1: 330, alpha: on });
  }
  // The hat on its hook, then falling onto his head.
  const HK = { x: 270, y: 905 }, headY = cpt({ ...C0, squash: 0 }, 0, -254)[1];
  if (t < 53.24) {
    const rock = t < 52.86 ? 0 : t < 53.0 ? Math.sin((t - 52.86) * 60) * .16 * (1 - (t - 52.86) / .14) : 0;
    const fall = clamp((t - 53.0) / .24);
    const hy = lerp(HK.y, headY, fall * fall), sc = lerp(.9, C0.s, fall);
    g.save(); g.translate(lerp(HK.x, C0.x, fall), hy); g.rotate(rock * (1 - fall) + fall * .1); g.scale(sc, sc);
    if (t < 53.0) line(g, [[0, -138], [0, -172]], { w: 6, col: GRAPHITE, seed: 61, t, spline: false, passes: 1 });
    hardHat(g, t, { x: 0, y: 0, lit: 0 });
    g.restore();
  }
  const held = t >= 55.0 ? 1 : 0;
  const pops = [0, 1, 2, 3, 4, 5].map(i => clamp((t - (V(9 + i) - .02)) / .2));
  clawd(g, {
    ...c, t, seed: 1, eyes, brow, raise, look, mouth: Math.max(vox(t), sigh * .55), cheeks: false,
    legs: walk > 0 && walk < 1 ? beatPos(t) * .5 : 0,
    armL: { up: clip ? -.3 : -.4 },
    armR: pointing ? { to: [352, -262], reach: 30 } : carry ? { up: lerp(.8, -.15, lower), out: .8 } : { up: -.4 },
    prop: (g2, o) => {
      if (landed) hardHat(g2, t, { lit: 1 });
      if (carry) tagBoard(g2, o.hR[0] + lerp(100, 46, lower), o.hR[1] + lerp(-128, -22, lower), lerp(1, .62, lower), t, { seed: 400, tilt: lerp(-.06, .05, lower), pops });
    },
  });
  if (landed && t < 53.6) burst(g, cpt(c, 0, -316)[0], cpt(c, 0, -316)[1], 60, 60 + 110 * ramp(t, 53.24, 53.5), t, { col: C.yellow, seed: 5, prog: ramp(t, 53.24, 53.45), n: 12, w: 8 });
  puff(g, t, cpt(c, 60, -104)[0], cpt(c, 60, -104)[1], 1.3, inv(52.85, 53.6, t), { seed: 520 });
  // The pigeon, a witness on the pegboard.
  pigeon(g, t, 398, 792, .72, { state: t > 53.2 && t < 54.0 ? 'gasp' : 'perch', look: 1 });
  const out = { t0: 56.95 + .4, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 0, seed: 20, w: .1, out: { t0: 57.35, dur: .3 }, hi: {} });
}

// ------------------------------------------------------------------- 1 "Confused, why can't I reproduce it? No debuggability."
// Clawd, confused, presses a big AGAIN button, and a flea in a top hat pops out of the fur only where he
// isn't looking (the beam of his lamp shows where he is). He swings his net and it is gone; the button
// does nothing. Debuggability: can you make the problem happen again, to study it?
const PRESS = [60.03, 60.24, 60.45];
function drawL1(g, t, ws) {
  const T = i => ws[i].s, V = i => ws[i].v;
  const gr = groove(t, 1);
  den(g, t, { cam: 420, win: { x: 120, y: 700, w: 210, h: 220, sky: 0 }, lamp: { x: 650, y: 770 } });
  const B = { x: 860, y: 1545, s: 1.45 };
  bed(g, t, B.x, B.y - 4, 540);
  const twitch = shake(t, 59.7, { dur: .3, amp: .012, f: 12 }) + shake(t, 60.62, { dur: .3, amp: .012, f: 12 }) + shake(t, 61.2, { dur: .3, amp: .012, f: 12 });
  BLOB(g, { ...B, t, seed: 8, state: 'sleep', mouth: 0, bob: gr.bob * .1, lean: twitch });
  // The button on the floor, on Clawd's left.
  const press = Math.max(0, ...PRESS.map(p => gate(t, p, p + .2, .06)));
  const BT = { x: 172, y: 1545, s: 1.1 };
  againButton(g, t, BT.x, BT.y, BT.s, { press });
  PRESS.forEach((p, i) => {
    if (t > p && t < p + .5) {
      const u = inv(p, p + .5, t);
      g.save(); g.globalAlpha *= 1 - smooth(inv(.45, 1, u));
      write(g, 'CLICK', BT.x - 20 + i * 44, BT.y - 262 - u * 30 - i * 30, 38, { col: '#4a4a63', seed: 600 + i, t, align: 'center', track: 4, w: .12, rot: -.12 + i * .1 });
      g.restore();
    }
  });
  // Fleas, on Blob's fur: A on the shoulder (while he looks at the button), B by his paw (while he looks up).
  const fA = { x: 740, y: 905 }, fB = { x: 960, y: 1408 };
  const aUp = t > 59.7 && t < 60.42 ? backOut(inv(59.7, 59.85, t), 2.6) : t >= 60.42 && t < 60.5 ? 1 - inv(60.42, 60.5, t) : t > 61.3 ? backOut(inv(61.3, 61.45, t), 2.6) : 0;
  if (aUp > 0) flea(g, t, fA.x, fA.y + (1 - aUp) * 40, 1.5, { seed: 700, squash: (1 - aUp) * .5, tip: t > 59.95 && t < 60.3 ? 1 : 0, look: -1, alpha: clamp(aUp * 2) });
  const bUp = t > 60.62 && t < 60.98 ? backOut(inv(60.62, 60.76, t), 2.6) : t >= 60.98 && t < 61.06 ? 1 - inv(60.98, 61.06, t) : 0;
  if (bUp > 0) flea(g, t, fB.x, fB.y + (1 - bUp) * 40, 1.5, { seed: 710, squash: (1 - bUp) * .5, look: -1, alpha: clamp(bUp * 2), flip: -1 });
  // Where he is looking: the beam, and so his eyes.
  const aim = track(t, [[0, 900, 1190], [59.0, 760, 1230], [59.55, 900, 1150], [59.62, 172, 1400], [60.5, 172, 1400], [60.6, 750, 940], [60.83, 750, 940], [60.9, 960, 1400], [61.3, 960, 1400], [61.5, 940, 1300]], .1);
  const wob = t < 59.5 ? Math.sin((t - 58.4) * 3.4) * 90 : 0;
  const cx = 505, C0 = { x: cx, y: 1610, s: 1.3 };
  const conf = t < 59.6, done = t > 61.25;
  const c = { ...C0, bob: gr.bob, squash: gr.sq, lean: gr.lean + (conf ? Math.sin(t * 2.4) * .04 : 0) + press * .02 };
  const [lx, ly] = cpt(c, 0, -316);
  beam(g, t, lx, ly, aim[0] + wob, aim[1], { w0: 44, w1: 250 });
  // The net's swing: wound back, down in a chop at the flea, then rests.
  const rot = track(t, [[0, .06], [60.6, .06], [60.85, -.45], [60.93, -.45], [61.0, 1.3], [61.35, 1.3], [61.7, .1]], .08)[0];
  const armRup = track(t, [[0, .15], [60.6, .15], [60.85, .95], [60.93, .95], [61.0, .1], [61.35, .1], [61.7, .15]], .08)[0];
  const handL = t > 59.55 && t < 60.62 ? toLocal(c, BT.x + 10, lerp(BT.y - 245, BT.y - 185, press)) : [-150, -262];
  clawd(g, {
    ...c, t, seed: 1, eyes: conf ? 'open' : done ? 'half' : 'open', brow: conf || done ? 1 : .3, raise: 0, sweat: t > 60.5,
    look: [clamp((aim[0] - c.x) / 300, -1, 1), clamp((aim[1] - 1250) / 200, -1, 1)], mouth: vox(t),
    armL: { to: handL, reach: 60 }, armR: { up: armRup, out: .3 },
    prop: (g2, o) => {
      hardHat(g2, t, { lit: 1 });
      g2.save(); netTool(g2, o.hR[0], o.hR[1], .68, t, { rot, seed: 300 });
      if (t > 61.3) { // the flea sits on the hoop and tips its hat
        const u = backOut(inv(61.3, 61.45, t), 2.6), hx = o.hR[0] + Math.sin(rot) * 300 * .68, hy = o.hR[1] - Math.cos(rot) * 300 * .68;
        flea(g2, t, hx, hy + 10, 1.05, { seed: 720, squash: (1 - u) * .5, tip: t > 61.5 ? 1 : 0, look: -1, alpha: clamp(u * 2) });
      }
      g2.restore();
    },
  });
  // A question mark over his head while he is confused.
  if (t > V(0) && t < 60.4) { const k = pop(t, V(0), .25) * (1 - inv(60.1, 60.4, t)); g.save(); g.translate(c.x + 20, 1088); g.scale(k, k); write(g, '?', 0, 0, 120, { col: C.purple, seed: 30, t, align: 'center', w: .12 }); g.restore(); }
  pigeon(g, t, 905, 872, .62, { flip: -1, state: t > 59.7 && t < 60.1 || t > 60.9 && t < 61.4 ? 'gasp' : 'perch', look: -1 });
  const out = { t0: ws[ws.length - 1].e + .3, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: '#2fb1a6', tailBubble: { fill: '#63d0c4', edge: '#125a53', e: 2.0, f: 1.35 }, hi: { 4: C.red }, seed: 21, out, w: .1 });
}

// Where a hand lands, in Clawd's space, when an arm reaches for a point (see chars.js: arms with `to`).
function handLocal(side, to, reach = 0) {
  const sh = [side * 142, -152], dx = to[0] - sh[0], dy = to[1] - sh[1];
  const ang = Math.atan2(dy, dx), len = Math.min(46 + reach, Math.hypot(dx, dy));
  return [sh[0] + Math.cos(ang) * len, sh[1] + Math.sin(ang) * len];
}

// ------------------------------------------------------------------- 2 "I ask it why: it's "Oops". Gee, thanks for diagnosability!"
// Clawd listens at Blob's flank with a stethoscope, asks why, and the whole answer is a small error box
// that says OOPS, beside a broken vase. His thumbs-up is deadpan. Diagnosability: does it tell you why?
function drawL2(g, t, ws) {
  const T = i => ws[i].s, V = i => ws[i].v;
  const gr = groove(t, 1);
  den(g, t, { cam: 900, board: { x: 10, y: 790, taken: ['steth'] }, lamp: { x: 580, y: 780 } });
  const B = { x: 800, y: 1545, s: 1.4 };
  bed(g, t, B.x, B.y - 4, 520);
  const yawn = gate(t, 63.19, 63.95, .15);
  BLOB(g, { ...B, t, seed: 8, state: t > 63.1 && t < 64.3 ? 'awake' : 'sleep', mouth: yawn * .9, tongue: yawn > .5, look: [-.6, .3], bob: gr.bob * .1, squash: yawn * .05 });
  brokenVase(g, t, 920, 1535, 1.0);
  const holding = t < 63.65;
  const c0 = { x: 400, y: 1610, s: 1.3 };
  const c = { ...c0, bob: gr.bob * .6, squash: gr.sq * .6, lean: gr.lean * .6 + (t > 63.7 ? -.02 : 0) };
  let eyes = 'shut', brow = 0, look = [.9, .2];
  if (t >= 62.84 && t < 63.36) { eyes = 'open'; brow = .5; look = [.7, -.3]; }
  else if (t >= 63.36 && t < 63.62) { eyes = 'wide'; look = [.5, -.6]; }
  else if (t >= 63.62) { eyes = 'half'; brow = -.9; look = [0, 0]; }
  clawd(g, {
    ...c, t, seed: 1, eyes, brow, look, mouth: vox(t), sweat: t > 63.4,
    armR: holding ? { to: toLocal(c, 650, 1385), reach: 40 } : { up: -.4 },
    armL: t >= 63.72 ? { up: .95, out: .5 } : { up: -.3 },
    prop: (g2, o) => {
      const P = holding ? [o.hR[0] + 14, o.hR[1] + 2] : [24, -44 + Math.sin((t - 63.65) * 14) * 8 * Math.exp(-(t - 63.65) * 3)];
      const tb = { w: 9, col: C.teal, t, spline: true, passes: 1, bow: 0 };
      line(g2, [[-158, -168], [-152, -92], [-98, -60], [0, -56], P], { ...tb, seed: 311 });
      line(g2, [[158, -168], [166, -120], P], { ...tb, seed: 312 });
      dot(g2, -158, -168, 9, { col: '#a8a7b2', seed: 313, t }); dot(g2, 158, -168, 9, { col: '#a8a7b2', seed: 314, t });
      blob(g2, ellipse(P[0], P[1], 26, 26, 10, 0, 315), { fill: '#a8a7b2', shade: '#6d6b76', line: GRAPHITE, lw: 5.2, seed: 315, t, hw: 4.6, tone: .8, sh: .3 });
      blob(g2, ellipse(P[0], P[1], 14, 14, 8, 0, 316), { fill: '#d6d5dd', line: GRAPHITE, lw: 3.4, seed: 316, t, hw: 4, tone: .8 });
      hardHat(g2, t, { lit: 1 });
      if (t >= 63.72) thumbUp(g2, t, o.hL[0], o.hL[1] - 12, { seed: 830 });
    },
  });
  // "why:" as a speech bubble from Clawd.
  const bt = V(3) - .06;
  if (t > bt && t < 63.75) {
    const k = pop(t, bt, .22) * (1 - inv(63.45, 63.75, t));
    if (k > .03) { g.save(); g.translate(300, 900); g.scale(k, k); g.translate(-300, -900); bubble(g, 300, 900, 320, 150, 340, 1050, t, { seed: 900 }); write(g, 'WHY?', 300, 930, 80, { col: GRAPHITE, seed: 901, t, align: 'center', track: 5, w: .12 }); g.restore(); }
  }
  // "Oops": the box pops out of the yawn.
  const dt = V(5);
  if (t >= dt) {
    const u = inv(dt, dt + .3, t), k = backOut(u, 2.4);
    if (k > .03) errorBox(g, t, lerp(B.x, 790, easeOut(u)), lerp(1250, 935, easeOut(u)), 1.05 * k, { seed: 800, rot: damp(t, dt + .25, 7, 22) * .09 });
  }
  if (t > 63.72 && t < 63.95) sparkle(g, 470, 1290, 22 * pop(t, 63.72, .15), t, { col: '#fbf8ef', seed: 62, rot: t * 3 });
  pigeon(g, t, 350, 792, .7, { state: t > 63.4 && t < 63.95 ? 'gasp' : 'perch', look: 1 });
  const out = { t0: ws[ws.length - 1].e + .3, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: '#2f8fd0', tailBubble: { fill: '#8fd0f5', edge: '#1f5f96', e: 2.0, f: 1.35 }, hi: { 5: C.red }, seed: 22, out, w: .1 });
}

// ------------------------------------------------------------------- 3 "I wipe the payments? Stale docs: "Nightly saves!" Recoverability?"
// One chain on one wall: Clawd mops the PAYMENTS board clean; a dusty manual dated 2019 says NIGHTLY SAVES!;
// he opens the BACKUPS cabinet and it is empty (a moth flies out); a retriever comes back with nothing.
function drawL3(g, t, ws) {
  const T = i => ws[i].s, V = i => ws[i].v;
  const gr = groove(t, 1);
  den(g, t, { cam: 1300, lamp: null });
  const BD = { x: 30, y: 760, w: 340, h: 390 };
  const s1 = inv(66.02, 66.5, t), s2 = inv(66.5, 66.9, t);
  const wipeX = t < 66.02 ? 1e9 : BD.x + BD.w + 30 - s1 * (BD.w + 60);
  chalkboard(g, t, BD.x, BD.y, BD.w, BD.h, { wipe: wipeX });
  // The manual, pinned up with a puff of dust as it lands.
  const mk = pop(t, V(4) - .02, .28);
  if (mk > .02) {
    g.save(); g.translate(545, 935); g.scale(mk, mk); g.translate(-545, -935);
    manual(g, t, 545, 935, 300, 300, { glow: t > 67.3 && t < 68.3 ? beatPulse(t, .15) : 0 });
    g.restore();
    puff(g, t, 470, 1080, 1.5, inv(V(4), V(4) + .8, t), { seed: 540, dir: -1 });
    puff(g, t, 620, 1080, 1.5, inv(V(4), V(4) + .8, t), { seed: 545, dir: 1 });
  }
  const open = ease(t, 67.72, 68.0);
  cabinet(g, t, 780, 770, 280, 720, { open });
  // Clawd: mops, gasps, hopes, then opens the cabinet.
  const cx = track(t, [[0, 560], [67.4, 560], [67.7, 605]], .25)[0];
  const c = { x: cx, y: 1610, s: 1.3, bob: gr.bob * .7, squash: gr.sq * .7, lean: gr.lean * .7 };
  let eyes = 'open', brow = 0, raise = 0;
  if (t >= 66.1 && t < 66.9) { eyes = 'squint'; }
  else if (t >= 66.9 && t < 67.3) { eyes = 'wide'; raise = .8; }
  else if (t >= 67.3 && t < 67.75) { eyes = 'happy'; }
  else if (t >= 67.75 && t < 68.25) { eyes = 'wide'; brow = 1; }
  else if (t >= 68.25) { eyes = 'sad'; brow = 1; }
  const mopping = t < 66.95;
  const toMop = toLocal(c, 300, 1380);
  const hl = handLocal(-1, toMop, 80);
  const armL = mopping ? { to: toMop, reach: 80 } : { up: -.3 };
  const armR = t >= 67.3 && t < 67.72 ? { up: .9, out: .3 } : t >= 67.72 && t < 68.3 ? { to: toLocal(c, 800, 1300), reach: 40 } : { up: -.3 };
  clawd(g, { ...c, t, seed: 1, eyes, brow, raise, look: [t > 67.3 ? .5 : -.6, t > 67.3 ? -.3 : -.2], mouth: vox(t), sweat: t > 66.9, armL, armR, prop: (g2) => hardHat(g2, t, { lit: 1 }) });
  // The mop, from his hand to where the sponge is; then it falls.
  if (t > 65.5 && t < 67.4) {
    const hw = cpt(c, hl[0], hl[1]);
    let head;
    if (t < 66.02) head = [380, 1010];
    else if (t < 66.5) head = [wipeX, 930 + Math.sin(t * 26) * 80];
    else if (t < 66.95) head = [BD.x + s2 * BD.w, 1010 + Math.sin(t * 26) * 60];
    else head = [lerp(BD.x + BD.w, 250, inv(66.95, 67.3, t)), lerp(1010, 1540, easeIn(inv(66.95, 67.3, t), 2))];
    mop(g, t, t < 66.95 ? hw : [head[0] - 220, head[1] - 30], head);
  }
  // The moth flies out, and the retriever comes back with nothing.
  if (t > 67.98) { const u = inv(67.98, 69.3, t); moth(g, t, 900 - 240 * u + Math.sin(u * 11) * 34, 1260 - 380 * easeOut(u), 1.7, { seed: 890 }); }
  const rx = track(t, [[0, 1300], [68.0, 1300], [68.3, 930]], .2)[0];
  if (t > 68.0) {
    const sad = t > 68.35;
    dogFront(g, { x: rx, y: 1530, s: .95, t, seed: 60, breed: 'lab', eyes: sad ? 'sad' : 'happy', mouth: sad ? .25 : .55, tongue: !sad, body: true, collar: C.red, bob: gr.bob * .5, ear: gr.lean * 8 });
    dashedRect(g, t, rx - 4, 1478, 130, 76, { seed: 895, col: GRAPHITE, rot: .1 });
    if (sad) write(g, '?', rx + 6, 1360, 90, { col: C.purple, seed: 32, t, align: 'center', w: .12 });
  }
  pigeon(g, t, 690, 780 + 0, .62, { flip: -1, state: t > 66.9 && t < 67.3 ? 'gasp' : 'perch', look: -1 });
  const out = { t0: ws[ws.length - 1].e + .3, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: '#2c9a52', tailBubble: { fill: '#8fdc8f', edge: '#1f6b34', e: 2.0, f: 1.35 }, hi: { 3: C.red }, seed: 23, out, w: .1 });
}

// ------------------------------------------------------------------- 4 "We walk it through by hand, and miss a lot: low testability."
// Walking it through by hand is real testing: Clawd leads Blob round a course, ticking his clipboard, while a
// line of fleas marches past behind him. What is missing is a way to poke it and tell: his probe gets no
// readout, and the AUTO-TEST rig's plug doesn't fit Blob's port. Testability.
function drawL4(g, t, ws) {
  const T = i => ws[i].s, V = i => ws[i].v;
  const gr = groove(t, 1);
  den(g, t, { cam: 1700, win: { x: 70, y: 700, w: 200, h: 210, sky: 0 }, lamp: { x: 600, y: 780 } });
  const bx = 880 + 22 * Math.sin((t - 68.8) * 2.4);
  const B = { x: bx, y: 1545, s: 1.15 };
  bed(g, t, 880, B.y - 4, 460);
  cone(g, t, 640, 1520, .8, { seed: 1003 });
  const poke = gate(t, 71.33, 71.52, .05);
  BLOB(g, { ...B, t, seed: 8, state: 'awake', mouth: t < 71.3 ? .35 : 0, tongue: t < 71.3, look: [-.7, .2], bob: gr.bob * .35, squash: gr.sq * .3 + poke * .06, lean: gr.lean * .5 });
  const sock = [bx - 150, 1400];
  socketPatch(g, t, sock[0], sock[1], 1.0, { seed: 1020 });
  // The line of fleas along the rail behind Clawd's head.
  const xh = -60 + (t - 69.0) * 330;
  for (let i = 0; i < 5; i++) {
    const fx = xh - i * 140;
    if (fx < -60 || fx > 1120) continue;
    flea(g, t, fx, 1072 - Math.abs(Math.sin(beatPos(t) * Math.PI + i)) * 10, .95, { seed: 700 + i * 10, look: 1 });
  }
  // The rig, front right, and its cord to the plug.
  const rig = { x: 990, y: 1548 };
  const fail = t > 71.7 ? 1 : 0;
  // Clawd.
  const c = { x: 370, y: 1610, s: 1.25, bob: gr.bob * .8, squash: gr.sq * .8, lean: gr.lean * .8 };
  const walking = t < 71.3, probing = t >= 71.3 && t < 71.6, plugging = t >= 71.6;
  const tl = toLocal(c, sock[0] - 40, sock[1] - 6);
  const ticks = [ease(t, 69.5, 69.62), ease(t, 70.0, 70.12), ease(t, 70.44, 70.56)];
  const push = plugging ? Math.max(0, Math.sin(clamp((t - 71.62) / .14) * Math.PI)) + Math.max(0, Math.sin(clamp((t - 71.88) / .14) * Math.PI)) : 0;
  const eyes = walking ? 'open' : probing ? 'squint' : 'half';
  let plugW = null;
  clawd(g, {
    ...c, t, seed: 1, eyes, brow: walking ? .2 : plugging ? 1 : .5, look: [.8, .2], mouth: vox(t), sweat: t > 71.7,
    legs: walking ? beatPos(t) * .5 : 0,
    armL: { up: .5, out: .2 },
    armR: walking ? { up: .15, out: .5 } : { to: [tl[0] - push * 8, tl[1]], reach: 40 },
    prop: (g2, o) => {
      hardHat(g2, t, { lit: 1 });
      if (t < 71.3) clipboard(g2, o.hL[0] + 6, o.hL[1] - 40, .6, t, { seed: 5, prog: ticks, tilt: .1 });
      if (walking) {
        line(g2, [o.hR, [(o.hR[0] + tl[0]) / 2, (o.hR[1] + tl[1]) / 2 + 46], tl], { w: 8, col: C.red, seed: 1201, t, spline: true, passes: 1, bow: 0, over: 0 });
      } else if (probing) {
        const d = [tl[0] - o.hR[0] + 20, tl[1] - o.hR[1]], L = Math.hypot(d[0], d[1]), ps = clamp(L / 250, .55, .9), rot = Math.atan2(d[0], -d[1]);
        probeTool(g2, o.hR[0] + Math.sin(rot) * 90 * ps, o.hR[1] - Math.cos(rot) * 90 * ps, ps, t, { rot, seed: 340 });
      } else {
        plugW = [o.hR[0] + 22, o.hR[1] - 2];
        plugTool(g2, t, plugW[0] - push * 10, plugW[1], .95, { seed: 1030, rot: 0 });
      }
    },
  });
  // No readout.
  if (t > 71.42 && t < 72.5) { const k = pop(t, 71.42, .2); readout(g, t, 560, 1170 - k * 20, k, { seed: 1040, text: '- - -' }); }
  if (poke > .3) burst(g, sock[0] - 20, sock[1], 20, 50, t, { col: C.grey, seed: 12, prog: poke, n: 8, w: 5 });
  // The cord, from the rig along the floor to the plug in his hand (or lying by his feet).
  const pw = plugging ? cpt(c, plugW ? plugW[0] : 200, plugW ? plugW[1] : -150) : [500, 1590];
  line(g, [[rig.x - 110, rig.y - 40], [(rig.x + pw[0]) / 2, 1596], [pw[0] - 16, pw[1] + 8]], { w: 9, col: GRAPHITE, seed: 1202, t, spline: true, passes: 1, bow: 0, over: 0 });
  rigBox(g, t, rig.x, rig.y, .85, { seed: 1010, fail });
  if (t > 71.62 && t < 71.78) burst(g, sock[0] - 30, sock[1], 14, 44, t, { col: C.red, seed: 14, prog: inv(71.62, 71.78, t), n: 8, w: 5 });
  pigeon(g, t, 180, 706, .66, { state: t > 71.62 ? 'gasp' : 'perch', look: 1 });
  const out = { t0: ws[ws.length - 1].e + .3, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: '#8b5fc9', tailBubble: { fill: '#b79be6', edge: '#4a2f8a', e: 2.0, f: 1.35 }, hi: { 10: C.red }, seed: 24, out, w: .1 });
}

// ------------------------------------------------------------------- 5 "The blob's so huge, I burn my context: not much readability."
// Blob fills the frame; tiny Clawd stuffs the whole shaggy blob into a bowl marked CONTEXT and it overflows;
// the writing in the fur is a tangle nobody could read. Readability, and a finite bowl of context.
function drawL5(g, t, ws) {
  const T = i => ws[i].s, V = i => ws[i].v;
  const gr = groove(t, 1);
  const shk = shake(t, 72.85, { dur: .55, amp: 9, f: 13 });
  g.save(); g.translate(shk, shk * .4);
  den(g, t, { cam: 2100, lamp: null });
  const bs = 1.55 + .45 * spring(t, 72.78, { f: 2.0, z: .3 });
  const B = { x: 560, y: 1500, s: bs };
  bed(g, t, 560, B.y - 4, 620);
  BLOB(g, { ...B, t, seed: 8, state: 'sleep', mouth: 0, bob: gr.bob * .1 });
  // The writing in his fur: rows of it, then a tangle.
  const k = bs / 2;
  const prog = ease(t, 74.5, 75.3, x => x), knot = ease(t, 75.3, 75.6);
  if (prog > 0) scrawl(g, t, B.x - 300 * k, B.x + 300 * k, B.y - 380 * k, 5, { seed: 1070, prog, knot, gap: 52 * k });
  // The bowl, the stuffing, and the overflow.
  const fill = t < 73.1 ? 0 : t < 73.3 ? 2 : t < 73.5 ? 4 : t < 73.72 ? 6 : t < 73.845 ? 8 : 14;
  dogBowl(g, t, 520, 1560, 1.1, { seed: 1060, fill });
  [[73.1, 400, 1400], [73.32, 430, 1360], [73.55, 410, 1420]].forEach(([tt, fx, fy], i) => {
    const u = inv(tt, tt + .22, t);
    if (u > 0 && u < 1) furTuft(g, t, lerp(fx, 500, u), lerp(fy, 1440, u) - Math.sin(u * Math.PI) * 70, .9, { seed: 1051 + i, rot: u * 6 });
  });
  if (t > 73.845) for (let i = 0; i < 7; i++) {
    const tau = t - 73.845, vx = (hash(i, 3) - .5) * 700, vy = -520 - hash(i, 4) * 340;
    const x = 520 + vx * tau, y = 1430 + vy * tau + 1500 * tau * tau;
    if (tau < 1.1 && y < 1700) furTuft(g, t, x, y, 1, { seed: 1060 + i, rot: tau * 7 * (i % 2 ? 1 : -1) });
  }
  puff(g, t, 470, 1360, 1.7, inv(73.85, 74.9, t), { seed: 560, dir: -1 });
  puff(g, t, 570, 1350, 1.7, inv(73.9, 74.95, t), { seed: 565, dir: 1 });
  g.restore();
  // Tiny Clawd.
  const c = { x: 250, y: 1610, s: .9, bob: gr.bob * .8, squash: gr.sq * .8, lean: gr.lean };
  const look = t < 72.9 ? [.2, -1] : t < 74.6 ? [.8, .3] : [.4, -.5];
  const stuffing = t >= 73.05 && t < 73.9;
  const ph = ((t - 73.05) * 4.5) % 1;
  clawd(g, {
    ...c, t, seed: 1, eyes: t < 73.05 ? 'wide' : t < 74.6 ? 'open' : 'squint', brow: t > 74.6 ? 1 : .3, raise: t < 73.05 ? 1 : 0, look, mouth: vox(t), sweat: t > 73.9,
    armR: stuffing ? { to: toLocal(c, ph < .5 ? 420 : 470, ph < .5 ? 1400 : 1450), reach: 60 } : t < 73.05 ? { up: .9, out: .5 } : { up: -.1 },
    armL: t < 73.05 ? { up: .9, out: .5 } : t > 74.6 ? { up: .8 } : { up: -.2 },
    prop: g2 => hardHat(g2, t, { lit: 1 }),
  });
  pigeon(g, t, c.x + 6, 1610 - c.bob - 254 * .9 - 118 * .9, .5, { state: t > 73.84 && t < 74.5 ? 'gasp' : 'perch', look: 1 });
  if (t > 74.7 && t < 75.9) { const q = pop(t, 74.7, .25); g.save(); g.translate(300, 1090); g.scale(q, q); write(g, '?', 0, 0, 110, { col: C.purple, seed: 31, t, align: 'center', w: .12 }); g.restore(); }
  const out = { t0: ws[ws.length - 1].e + .3, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: '#3f6fd6', tailBubble: { fill: '#7ea6f0', edge: '#1c3a8a', e: 2.0, f: 1.35 }, hi: { 1: C.red, 7: C.red }, seed: 25, out, w: .1 });
}

// ------------------------------------------------------------------- 6 "I patch one bug, and two more hatch: so where's maintainability?"
// Clawd's mallet squashes one flea; the shock cracks two eggs and two fleas hatch; the next whack cracks four;
// and the pedestal for maintainability stands empty. Changing one thing shouldn't break others.
const EGGS = [[660, 1500], [750, 1490], [840, 1500], [705, 1546], [795, 1550], [885, 1542]];
const OPEN_AT = [77.24, 77.72, 77.76, 77.28, 77.80, 77.84];        // eggs 0 and 3 hatch first
const CRACK_AT = [76.75, 77.66, 77.66, 76.75, 77.66, 77.66];
function drawL6(g, t, ws) {
  const T = i => ws[i].s, V = i => ws[i].v;
  const gr = groove(t, 1.1);
  den(g, t, { cam: 2500, win: { x: 120, y: 700, w: 200, h: 210, sky: 0 }, lamp: { x: 480, y: 780 } });
  bed(g, t, 740, 1418, 400);
  BLOB(g, { x: 740, y: 1420, s: .9, t, seed: 8, state: 'sleep', mouth: 0, bob: gr.bob * .1 });
  // The stump, and the bug on it.
  const S0 = { x: 560, y: 1548 };
  blob(g, rrect(S0.x, S0.y - 36, 130, 84, 10, 3, 1310), { fill: DEN.wood, shade: DEN.woodD, line: GRAPHITE, lw: 6, seed: 1310, t, hw: 5, tone: .75, sh: .3 });
  blob(g, ellipse(S0.x, S0.y - 74, 60, 16, 10, 0, 1311), { fill: '#e0bd82', line: GRAPHITE, lw: 5, seed: 1311, t, hw: 4.6, tone: .75 });
  const squashed = t > 76.48;
  const bugA = squashed ? 1 - inv(76.9, 77.2, t) : 1;
  if (bugA > 0) flea(g, t, S0.x, S0.y - 80, 1.6, { seed: 730, squash: squashed ? 1 : 0, tip: !squashed && t > 76.0 ? 1 : 0, look: -1, alpha: bugA });
  // The nest and its six eggs.
  blob(g, ellipse(775, 1566, 250, 38, 14, 0, 1320), { fill: '#d9b96a', shade: '#a98a3a', line: GRAPHITE, lw: 5.6, seed: 1320, t, hw: 5, tone: .8, sh: .3 });
  EGGS.forEach(([ex, ey], i) => {
    const shk = t > 76.5 && t < OPEN_AT[i] ? Math.sin(t * 46 + i) * (.03 + .05 * gate(t, CRACK_AT[i], OPEN_AT[i], .05)) : 0;
    const opened = t >= OPEN_AT[i];
    if (opened && t > OPEN_AT[i] + .5) return;
    egg(g, t, ex, ey, 1.4, { seed: 1080 + i * 3, crack: inv(CRACK_AT[i], OPEN_AT[i], t), open: opened ? inv(OPEN_AT[i], OPEN_AT[i] + .25, t) : 0, rot: shk });
  });
  // The pedestal, when it is asked for: the room dims, a spot finds an empty plinth, in front of the nest and behind the fleas.
  const pk = pop(t, 78.415, .3), dim = ease(t, 78.4, 78.7);
  if (dim > 0) {
    const gr2 = g.createRadialGradient(905, 1330, 150, 905, 1330, 760);
    gr2.addColorStop(0, 'rgba(22,32,72,0)');
    gr2.addColorStop(1, `rgba(22,32,72,${.38 * dim})`);
    g.save(); g.fillStyle = gr2; g.fillRect(0, 0, W, H); g.restore();
  }
  if (pk > .02) {
    const PX = 905, PY = 1552, PS = 1.35;
    hatch(g, ellipse(PX, PY - 6, 210, 34, 12, 0, 1300), { col: '#ffe680', seed: 1301, t, gap: 10, w: 11, alpha: .5 * clamp(pk), angle: -.1, dens: .9, spill: 3 });
    g.save(); g.translate(PX, PY); g.scale(pk, pk); g.translate(-PX, -PY); pedestal(g, t, PX, PY, PS, {}); g.restore();
    const hover = Math.sin(t * 3.2) * 7;
    if (pk > .5) ghostRosette(g, t, PX, PY - 290 * PS - 92 - hover, 88 * pk, '#5f6fe0', { seed: 1302, tilt: Math.sin(t * 2) * .06 });
  }
  // The hatched: each leaps out of its egg and lands, then hops on the beat.
  EGGS.forEach(([ex, ey], i) => {
    const t0 = OPEN_AT[i];
    if (t < t0) return;
    const tau = t - t0, land = [ex + (i < 3 ? -1 : 1) * (60 + 40 * ((i * 37) % 5)) * (i % 2 ? 1 : -1) * .6 + (i * 53 % 7) * 6, 1538 + (i % 3) * 8];
    const u = clamp(tau / .45), fx = lerp(ex, land[0], u), fy = lerp(ey, land[1], u) - Math.sin(u * Math.PI) * 150 - (u >= 1 ? Math.abs(Math.sin((t - t0 - .45) * 6 + i)) * 26 : 0);
    flea(g, t, fx, fy, 1.4, { seed: 740 + i * 7, flip: land[0] > ex ? 1 : -1, squash: u < .1 ? (1 - u * 10) * .4 : 0, look: 1, alpha: clamp(tau * 6) });
  });
  // Clawd, with the mallet.
  const c = { x: 220, y: 1610, s: 1.2, bob: gr.bob * .7, squash: gr.sq * .7 + damp(t, 76.48, 12, 30) * .5 + damp(t, 77.64, 12, 30) * .5, lean: gr.lean * .7 };
  const rot = track(t, [[0, .3], [76.2, .3], [76.46, 2.0], [76.6, 2.0], [76.95, .5], [77.25, .5], [77.62, 2.0], [77.78, 2.0], [78.2, .9]], .1)[0];
  let eyes = 'squint', brow = -.7;
  if (t >= 76.9 && t < 77.6) { eyes = 'wide'; brow = .6; }
  else if (t >= 77.6 && t < 78.05) { eyes = 'squint'; brow = -.7; }
  else if (t >= 78.05 && t < 78.42) { eyes = 'x'; brow = 0; }
  else if (t >= 78.42) { eyes = 'sad'; brow = 1; }
  clawd(g, {
    ...c, t, seed: 1, eyes, brow, look: [.8, .2], mouth: vox(t), sweat: t > 77.3,
    armR: { up: .55, out: .8 }, armL: t > 78.4 ? { up: .5, out: 1 } : { up: -.2 },
    prop: (g2, o) => {
      hardHat(g2, t, { lit: 1 });
      const ms = .86;
      malletTool(g2, o.hR[0] + 110 * ms * Math.sin(rot), o.hR[1] - 110 * ms * Math.cos(rot), ms, t, { rot, seed: 330 });
    },
  });
  [76.48, 77.64].forEach((tt, i) => { if (t > tt && t < tt + .3) { const u = inv(tt, tt + .3, t); burst(g, S0.x, S0.y - 100, 30 + 30 * u, 70 + 60 * u, t, { col: C.yellow, seed: 15 + i, prog: easeOut(u), n: 10, w: 8 }); } });
  pigeon(g, t, 230, 698, .66, { flip: -1, state: t > 76.48 ? 'gasp' : 'perch', look: 1 });
  const out = { t0: ws[ws.length - 1].e + .3, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: '#25397c', tailBubble: { fill: '#5b6fc0', edge: '#0e163f', e: 2.0, f: 1.35 }, col: dim > .2 ? '#f5eedd' : undefined, hi: dim > .2 ? { 1: '#ff9a8a', 5: '#ff9a8a' } : { 1: C.red, 5: C.red }, seed: 26, out, w: .1 });
}


// ------------------------------------------------------------------- 7 "What you don't know can hurt me too: it goes and puts me ill at ease."
// Clawd on a wobbling stool with a thermometer in his mouth; beside him the small fluffy puppy from verse 1
// grows a size on each stress and then, on "hurt", is huge and looms over him, its shadow covering him. On
// "ill at ease" the big letters ILL AT EASE shake themselves into 'ILITIES.
const YEL = { fill: '#ffe45c', edge: '#a87a10', e: 2.0, f: 1.35 };
const SRC = 'ILL AT EASE', TGT = "'ILITIES";
// source letter -> target slot (or a fall): I L L _ A T _ E A S E  ->  ' I L I T I E S
const MORPH = { 0: 1, 1: 2, 2: 3, 4: -1, 5: 4, 7: 5, 8: -1, 9: 7, 10: 6 };
function illAtEase(g, t, V13, V14, V15) {
  const size = 128, track = 6, y = 745;
  const ls = layout(SRC, size, { track, seed: 41 }), lt = layout(TGT, size, { track, seed: 42 });
  const x0 = W / 2 - ls.width / 2, x1 = W / 2 - lt.width / 2;
  const shk = ease(t, 82.76, 82.86) * (1 - ease(t, 83.15, 83.25));
  const mv = ease(t, 82.9, 83.17, x => x * x * (3 - 2 * x));
  const wr = [V13 - .16, V13 - .16, V13 - .16, 0, V14 - .13, V14 - .13, 0, V15 - .18, V15 - .18, V15 - .18, V15 - .18];
  ls.letters.forEach((L, i) => {
    if (L.ch === ' ') return;
    const prog = clamp((t - wr[i]) / .16);
    if (prog <= 0) return;
    const to = MORPH[i];
    let x = x0 + L.x, yy = y, rot = 0, alpha = 1, from = 0, pr = prog;
    if (to >= 0) {
      const tx = x1 + lt.letters[to].x;
      x = lerp(x, tx, mv); yy -= Math.sin(mv * Math.PI) * 70;
      if (i === 2) pr = prog * lerp(1, .69, mv);                      // an L loses its foot
      if (i === 7) { from = lerp(0, .2035, mv); pr = prog * lerp(1, .628, mv); }   // an E loses its arms
    } else {
      const f = Math.max(0, t - 82.9);
      yy += f * f * 2600; rot = f * (i === 4 ? -4 : 5); alpha = 1 - inv(83.0, 83.2, t);
    }
    if (alpha <= 0) return;
    const jx = Math.sin(t * 70 + i * 1.7) * shk * 7, jy = Math.sin(t * 63 + i * 2.3) * shk * 6, jr = Math.sin(t * 55 + i) * shk * .12;
    g.save(); g.globalAlpha *= alpha;
    write(g, L.ch, x + jx, yy + jy, size, { seed: 41 * 7 + i * 3, t, bubble: YEL, w: .1, track, prog: pr, from, rot: rot + jr, wonk: .8 });
    g.restore();
  });
  // The apostrophe drops in at the front.
  if (t > 82.98) { const u = backOut(inv(82.98, 83.2, t), 2.2); write(g, "'", x1 + lt.letters[0].x, y - (1 - u) * 320, size, { seed: 293, t, bubble: YEL, w: .1, track, wonk: .8 }); }
}
let W8 = null;
function drawL7(g, t, ws) {
  const T = i => ws[i].s, V = i => ws[i].v;
  const gr = groove(t, 1.1);
  den(g, t, { cam: 2900, win: { x: 830, y: 760, w: 190, h: 200, sky: 0 }, lamp: null });
  const bed0 = { x: 760, y: 1560 };
  bed(g, t, 700, 1556, 560);
  const growth = .85 + .42 * spring(t, 80.165, { f: 3, z: .3 }) + .5 * spring(t, 80.725, { f: 3, z: .3 });
  const swap = 81.03;
  if (t < swap) BLOB(g, { x: bed0.x, y: bed0.y, s: growth, t, seed: 9, puppy: true, state: 'awake', mouth: gate(t, 80.2, 80.4, .05) * .5, squash: gr.sq * .4, bob: gr.bob * .3, look: [-.6, .2] });
  else {
    const u = smooth(inv(swap, 82.6, t));
    BLOB(g, { x: lerp(760, 690, u), y: 1570, s: 1.02 + .62 * u, t, seed: 8, state: 'awake', mouth: .35, tongue: true, look: [-.7, .7], squash: gr.sq * .2, bob: gr.bob * .15 });
  }
  if (t >= swap && t < swap + .3) { const u = inv(swap, swap + .3, t); burst(g, 740, 1250, 160 + 200 * u, 300 + 240 * u, t, { col: C.yellow, seed: 21, prog: easeOut(u), n: 16, w: 12 }); sparkle(g, 740, 1250, 120 * (1 - u), t, { col: '#fff3b0', seed: 22, rot: u * 3 }); }
  // The stool wobbles, more and more; Clawd on it with a thermometer in his mouth.
  const wob = Math.sin(t * 9.5) * (.012 + .05 * inv(80.2, 82.9, t)) + damp(t, 80.75, 6, 20) * .05 + damp(t, 81.03, 6, 20) * .06;
  const cx = 330, fy = 1610;
  g.save(); g.translate(cx, fy); g.rotate(wob); g.translate(-cx, -fy);
  stool(g, t, cx, fy, 1.0, { seed: 1100 });
  const c = { x: cx, y: fy - 156, s: 1.15, bob: gr.bob * .3, squash: gr.sq * .5, lean: gr.lean * .5 };
  const fever = .3 + .7 * inv(80.8, 82.9, t);
  let eyes = 'open', brow = .6;
  if (t >= 80.7 && t < 82.85) { eyes = 'wide'; brow = 1; } else if (t >= 82.85) { eyes = 'x'; brow = 0; }
  clawd(g, {
    ...c, t, seed: 1, eyes, brow, look: [.8, -.4], mouth: vox(t) * .6, sweat: t > 80.2,
    armL: { up: .7 + Math.sin(t * 12) * .25 * inv(80.7, 82.9, t), out: .9 }, armR: { up: .7 - Math.sin(t * 12) * .25 * inv(80.7, 82.9, t), out: .9 },
    prop: (g2, o) => {
      hardHat(g2, t, { lit: 1 });
      thermoTool(g2, 118, -110, .85, t, { rot: 1.45, mercury: fever, seed: 320 });
    },
  });
  g.restore();
  // Its shadow falls over him.
  const sh = inv(80.8, 82.4, t);
  if (sh > 0) { const P = ellipse(cx + 60, 1470, lerp(160, 520, sh), lerp(120, 360, sh), 14, 0, 1400); wash(g, P, '#2c3a6b', .22 * clamp(sh * 2), 1401, t); hatch(g, P, { col: '#39457a', seed: 1402, t, gap: 12, w: 12, alpha: .22 * clamp(sh * 2), angle: -.7, dens: .8, spill: 3 }); }
  pigeon(g, t, 925, 752, .62, { flip: -1, state: t > 80.8 ? 'gasp' : 'perch', look: -1 });
  // The lyric: the body of line 21 (the last three words are the picture), fading as line 22's starts.
  sing(g, t, ws.slice(0, 13), { y: 225, size: 90, maxW: 980, tail: 0, seed: 27, out: { t0: 82.6, dur: .22 }, w: .1, hi: { 5: C.red } });
  illAtEase(g, t, V(13), V(14), V(15));
  if (W8 && t > 82.85) lyric8(g, t, W8);
}

// ------------------------------------------------------------------- 8 "You'll make my day: just name and weigh the agent-facing "ilities"."
// A smiling sun rises behind Clawd as he holds out his arms to you; he names the six things he asked for on
// the tags from the start of the break, and weighs each one on a kitchen scale with a dial. Your job.
const TAG_TOSS = [84.62, 84.86, 85.1, 85.34, 85.62, 85.86];
const TAG_W = [.66, .34, .52, .82, .4, .72];
const MULTI = [C.red, C.orange, C.yellow, C.green, C.teal, C.blue, C.purple, C.pink];
function lyric8(g, t, ws) {
  const out = t > 86 ? { t0: 86.85, dur: .3 } : null;
  sing(g, t, ws.slice(0, 10), { y: 225, size: 90, maxW: 980, tail: 0, seed: 28, out, w: .1, hi: { 3: '#c25a12', 5: C.red, 7: C.blue } });
  // The tail, "ILITIES.", one colour a letter.
  const L = layoutLine(ws, { y: 225, size: 90, maxW: 980, tail: 1 });
  const it = L.items.find(x => x.tail);
  if (!it) return;
  const lt = layout(it.str, it.size, { track: 4, seed: 51 });
  const v = ws[10].v;
  g.save();
  g.globalAlpha *= 1 - smooth(inv(86.85, 87.15, t));
  lt.letters.forEach((l, i) => {
    const pr = clamp((t - (v - .26 + i * .015)) / .2);
    if (pr <= 0) return;
    const col = MULTI[i % MULTI.length];
    const bump = t > v ? Math.max(0, 1 - (t - v - i * .035) * 4) * 12 : 0;
    write(g, l.ch, it.x + l.x, it.y - bump, it.size, { seed: 51 * 7 + i * 3, t, bubble: { fill: col, edge: mix(col, '#2c2b36', .6), e: 2.0, f: 1.35 }, w: .095, track: 4, prog: pr, wonk: .8 });
  });
  g.restore();
}
function drawL8(g, t, ws) {
  const T = i => ws[i].s, V = i => ws[i].v;
  const gr = groove(t, 1.2);
  const rise = ease(t, 83.6, 84.4), sunUp = ease(t, 83.62, 84.25);
  den(g, t, { cam: 3300, win: { x: 340, y: 720, w: 400, h: 380, sky: rise, sun: sunUp, sunR: 108, mood: 'happy' }, lamp: { x: 150, y: 780 }, glow: 1 - rise * .5 });
  // Blob, awake and delighted, behind the scale.
  BLOB(g, { x: 880, y: 1500, s: 1.0, t, seed: 8, state: 'awake', mouth: .4, tongue: true, look: [-.5, .3], bob: gr.bob * .3 });
  // The scale: the needle goes to each tag's weight as it lands.
  let w = 0, load = 0, prev = 0;
  TAG_TOSS.forEach((tt, i) => { const tl = tt + .3; if (t >= tl) { w = prev + (TAG_W[i] - prev) * spring(t, tl, { f: 3.4, z: .3 }); load = t < tl + .35 ? 1 : 0; } prev = TAG_W[i]; });
  const SC = { x: 830, y: 1560 };
  dialScale(g, t, SC.x, SC.y, 1.0, { seed: 1110, w, load });
  // Clawd: arms out to you, then he names the tags and tosses them onto the pan.
  const c = { x: 470, y: 1610, s: 1.25, bob: gr.bob, squash: gr.sq, lean: gr.lean };
  const named = ease(t, 84.28, 84.75, x => x);
  const board = t >= 84.1, lowB = ease(t, 85.95, 86.35);
  const pops = TAG_TOSS.map(tt => t < tt ? 1 : 0);
  const tossing = t >= 84.55 && t < 85.95;
  const ph = ((t - 84.62) / .24) % 1;
  clawd(g, {
    ...c, t, seed: 1, eyes: 'happy', mouth: vox(t), cheeks: true,
    armR: tossing ? { up: ph < .35 ? .9 : -.1, out: .8 } : { up: .55, out: 1 },
    armL: board ? { up: lerp(.35, -.1, lowB), out: lerp(.5, .9, lowB) } : { up: .55, out: 1 },
    prop: (g2, o) => {
      hardHat(g2, t, { lit: 1 });
      if (board) tagBoard(g2, o.hL[0] - 30 + lowB * 20, o.hL[1] - 90 + lowB * 66, .8 - lowB * .16, t, { seed: 400, tilt: .1 - lowB * .1, pops, named });
    },
  });
  // The tags, thrown one by one onto the pan and then off to a pile.
  TAG_TOSS.forEach((tt, i) => {
    const u = inv(tt, tt + .3, t), u2 = inv(tt + .55, tt + .85, t);
    if (u <= 0 || u2 >= 1) return;
    const a = [560 + (i % 2) * 20, 1370 - Math.floor(i / 2) * 6], b = [SC.x + (i - 2.5) * 6, SC.y - 176 - load * 10], d = [975 + (i % 3) * 8, 1562];
    const P = u < 1 ? [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * 150] : [lerp(b[0], d[0], u2), lerp(b[1], d[1], u2) - Math.sin(u2 * Math.PI) * 90];
    const tg = TAGS[i];
    g.save(); g.translate(P[0], P[1]); g.rotate((u < 1 ? u : 1 + u2) * .8 * (i % 2 ? 1 : -1)); g.scale(.85, .85);
    blob(g, rrect(0, 0, 100, 74, 10, 2, 1500 + i), { fill: '#fdfcf6', line: GRAPHITE, lw: 4.6, seed: 1500 + i, t, hw: 4.2, tone: .9, dens: .2 });
    blob(g, rrect(0, -27, 100, 22, 7, 2, 1510 + i), { fill: tg.col, line: GRAPHITE, lw: 4, seed: 1510 + i, t, hw: 4.2, tone: .95 });
    write(g, tg.name, 0, 20, tg.name.length > 6 ? 16 : 20, { col: GRAPHITE, seed: 1520 + i, t, align: 'center', track: 2, w: .12 });
    g.restore();
  });
  // The pile of weighed tags on the floor.
  TAG_TOSS.forEach((tt, i) => { if (t > tt + .85) { const tg = TAGS[i]; g.save(); g.translate(975 + (i % 3) * 8, 1562 - Math.floor(i / 3) * 10); g.rotate((i - 2.5) * .18); g.scale(.85, .85); blob(g, rrect(0, 0, 100, 74, 10, 2, 1500 + i), { fill: '#fdfcf6', line: GRAPHITE, lw: 4.6, seed: 1500 + i, t, hw: 4.2, tone: .9, dens: .2 }); blob(g, rrect(0, -27, 100, 22, 7, 2, 1510 + i), { fill: tg.col, line: GRAPHITE, lw: 4, seed: 1510 + i, t, hw: 4.2, tone: .95 }); g.restore(); } });
  if (t > 85.9 && t < 86.4) sparkle(g, 840, 1360, 34 * pop(t, 85.9, .2), t, { col: C.yellow, seed: 64, rot: t * 3 });
  pigeon(g, t, 745, 715, .66, { flip: -1, state: t > 84.0 ? 'smug' : 'perch', look: -1 });
  lyric8(g, t, ws);
}
