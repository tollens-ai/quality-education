// Break 2, "the parade", second half (lines 41-46: flexibility ... enjoyability, "I could name you a hundred", and the
// held "you"), 158.3-178.0 s. The same runway as the first half (props-parade1.js), one gag a word, the cast on a
// belt: each line the two dogs walk off to the right and the next pair walks on from the left. Then the camera
// pulls back over the tent to a crowd of a hundred and more dogs (their backs to us, a red carpet down the middle),
// every head turns to the camera on "but the ones that you want?", and on "for you!" a spotlight lands on the
// viewer and Clawd steps out of the crowd and holds out a lead: the held note, a slow push in on his face.
import { W, H, clamp, inv, lerp, smooth, hash, words, beatPos, beatPulse, easeInOut, backOut, loud, sway } from '../kit.js';
import { shot } from '../shots.js';
import { line } from '../pencil.js';
import { pigeon } from '../world.js';
import { sing } from '../lyrics.js';
import { groove } from '../common.js';
import { GRAPHITE, C } from '../palette.js';
import { clawd } from '../chars.js';
import { spring } from '../life.js';
import { tentBack, valance, lamp, beam, runway, floor, crowd, shadow, STAGE_Y } from '../props-parade1.js';
import { GAGS, CAM, camK, withCam, inWS, backPaper, backWorld, floorWide, stageWide, valanceWide, rowWide, streamDog, crowdWS, aisle, pool, beamTo, leadProp, hopeBrows, CLAWD_SEAT } from '../props-parade2.js';

const MARK = [280, 800];          // where the two gags stand
const D = .30;                    // how long a unit takes to cross to the next mark (one screen)
const STAG = .03;                 // each unit starts this long after the one ahead of it
const E = smooth;

// Each line: the words it starts with, which words are its two gags, and the colours of its two words.
const LINES = [
  { start: 'and flexibility', gi: [1, 2], gags: ['flex', 'detect'], cols: [C.teal, C.purple], hi: '#1f8f86', tail: { fill: '#b79be6', edge: '#4a2f8a' }, tailCol: C.purple },
  { start: 'and suitability', gi: [1, 2], gags: ['suit', 'reuse'], cols: [C.orange, C.pink], hi: '#c25a12', tail: { fill: '#f79ac0', edge: '#a3306a' }, tailCol: C.pink },
  { start: 'sustainability', gi: [0, 2], gags: ['sustain', 'change'], cols: [C.green, C.blue], hi: '#2f8a4a', tail: { fill: '#7ea6f0', edge: '#1f3f8f' }, tailCol: C.blue },
  { start: 'deployability', gi: [0, 1], gags: ['deploy', 'enjoy'], cols: [C.red, '#f4c93a'], hi: '#c93a2e', tail: { fill: '#f7d774', edge: '#8a5f12' }, tailCol: '#c98d14' },
];
const T_STREAM = [164.88, 165.18];               // the last pair leaves and the stream of dogs walks on
const V = 420, T_STOP = [172.55, 173.35];        // the stream's speed (px/s) and when it stops to look at you

// A placeholder gag: a plain pup (for a gag not drawn).
function placeholder(g, t, k) {}

// How far the stream of dogs has moved since it walked on (the belt's slide, then a march that stops).
function march(t) {
  const [s0, s1] = T_STREAM, [ta, tb] = T_STOP, t0 = s1;
  let u = W * E(inv(s0, s1, t));
  if (t > t0) {
    if (t < ta) u += V * (t - t0);
    else { const x = clamp((t - ta) / (tb - ta)); u += V * (ta - t0) + V * (tb - ta) * (x - x * x * x + x * x * x * x / 2); }
  }
  return u;
}

export function register(S) {
  const lines = LINES.map(l => ({ ...l, ws: words('Break 2', l.start) }));
  const w45 = words('Break 2', 'I could name you'), w46 = words('Break 2', 'but the ones');
  const units = [];
  lines.forEach((ln, i) => {
    const Lg = ln.gi.map(j => ln.ws[j].v), L1 = Lg[0];
    const nx = lines[i + 1], Ln = nx ? nx.ws[nx.gi[0]].v : 0;
    // The leader goes first: old right, old left, new right, new left, in step (a belt), so nobody meets anybody.
    const exA = nx ? [Ln - .02 - D - STAG * 2, Ln - .02 - STAG * 2] : [T_STREAM[0] + .02, T_STREAM[1] + .02], exB = nx ? [Ln - .02 - D - STAG * 3, Ln - .02 - STAG * 3] : [T_STREAM[0] - .01, T_STREAM[1] - .01];
    units.push({ line: i, slot: 0, key: ln.gags[0], mark: MARK[0], L: Lg[0], enter: [L1 - .02 - D, L1 - .02], exit: exA, col: ln.cols[0] });
    units.push({ line: i, slot: 1, key: ln.gags[1], mark: MARK[1], L: Lg[1], enter: [L1 - .02 - D - STAG, L1 - .02 - STAG], exit: exB, col: ln.cols[1] });
  });
  const ctx = { lines, units, w45, w46 };
  // Where each shot begins: when the next line's first word starts to be written on, so its lettering never
  // begins inside the old line's.
  const dur = w => clamp(.07 + .026 * w.str.length, .12, .34);
  const st = ws => ws[0].v - dur(ws[0]);
  const cuts = [158.3, st(lines[1].ws), st(lines[2].ws), st(lines[3].ws), st(w45), st(w46), 178.0];
  lines.forEach((ln, i) => shot(cuts[i], cuts[i + 1], (g, t) => pairFrame(g, t, i, ctx), { id: `parade2-${i + 1}` }));
  shot(cuts[4], cuts[5], (g, t) => wideFrame(g, t, ctx, 45), { id: 'parade2-hundred' });
  shot(cuts[5], cuts[6], (g, t) => wideFrame(g, t, ctx, 46), { id: 'parade2-you' });
}

// Where a unit is: off the left, sliding in to its mark (settling with a small overshoot), standing, then sliding out to the right.
function unitX(u, t) {
  const [e0, e1] = u.enter, [x0, x1] = u.exit;
  if (t <= e0) return u.mark - W;
  if (t < e1) return u.mark - W * (1 - E((t - e0) / (e1 - e0)));
  if (t < x0) { const d = t - e1; return u.mark + 12 * Math.exp(-d * 11) * Math.sin(d * 24); }
  if (t < x1) return u.mark + W * E((t - x0) / (x1 - x0));
  return u.mark + W;
}
// How far the belt has run (for the carpet's pattern): the sum of the slides so far.
function belt(t, lines) {
  let s = 0;
  lines.forEach(ln => { const L1 = ln.ws[ln.gi[0]].v; s += W * E((t - (L1 - .02 - D)) / D); });
  return s + march(t);
}

// The two lamps' beams: they sweep slowly and pick out each gag as it lands.
function lights(g, t, units, fade = 1) {
  const punch = side => {
    let k = 0;
    units.forEach(u => { if ((side < 0) === (u.slot === 0)) { const d = t - u.L; if (d > -.1 && d < 1) k = Math.max(k, Math.exp(-Math.max(0, d) / .3)); } });
    return k;
  };
  const tL = MARK[0] + Math.sin(t * .8) * 60 - 40 * punch(-1), tR = MARK[1] + Math.sin(t * .7 + 1.6) * 60 + 40 * punch(1);
  return { tL, tR, beams: () => { beam(g, t, -1, tL, { pow: (.8 + .2 * punch(-1)) * fade, seed: 611 }); beam(g, t, 1, tR, { pow: (.8 + .2 * punch(1)) * fade, seed: 621 }); } };
}

// Speed lines trailing a unit while the parade whips it across.
function streaks(g, t, vel, seed) {
  const dir = Math.sign(vel), k = clamp((Math.abs(vel) - 1200) / 1800);
  [-64, -132, -204, -270].forEach((y, i) => {
    const x0 = -dir * (170 + i * 26), x1 = x0 - dir * (90 + 110 * k + i * 20);
    line(g, [[x0, y + Math.sin(t * 20 + i) * 4], [x1, y]], { w: 6, col: '#8d8c97', seed: seed + i, t, spline: false, passes: 1, taper: [.5, .05], alpha: .5 * k + .15, over: 0, bow: 0 });
  });
}
// The crowd cheers as each gag lands.
function cheerAt(t, units) {
  let cheer = 0;
  units.forEach(u => { const d = t - u.L; if (d > -.02 && d < .5) cheer = Math.max(cheer, Math.exp(-Math.max(0, d) / .14) * Math.sin(Math.min(1, (d + .02) / .12) * Math.PI / 2)); });
  return cheer;
}
// The film's pigeon, on the rightmost audience dog's head, watching the parade and gasping at each gag.
function thePigeon(g, t, cheer, gasp = false) {
  pigeon(g, t, 986 + Math.sin(t * 2.2 + 6) * 3, 1500 - beatPulse(t + .06, .17) * 8 - 2 * 88 * .86 * (.92 + hash(5, 6) * .16) + 14 - cheer * 16, .46, { flip: -1, state: cheer > .3 || gasp ? 'gasp' : 'perch', look: -1, seed: 17 });
}
// The cast, oldest first, each in its own space on its mark.
function drawUnits(g, t, units, gr) {
  units.forEach((u, n) => {
    const x = unitX(u, t);
    if (x < -300 || x > W + 300) return;
    const vel = (x - unitX(u, t - 1 / 15)) * 15;
    g.save();
    g.translate(x, STAGE_Y);
    shadow(g, t, 0, 190, 0, 900 + n);
    const gag = GAGS[u.key] || placeholder;
    gag(g, t, { L: u.L, a: t - u.L, vel, dist: x, gr, seed: 100 + n * 20, col: u.col });
    if (Math.abs(vel) > 1200) streaks(g, t, vel, 700 + n * 10);
    g.restore();
  });
}

function lyric(g, t, ln, li) {
  sing(g, t, ln.ws, { y: 225, size: 64, maxW: 980, tail: 1, tailCol: ln.tailCol, tailBubble: { fill: ln.tail.fill, edge: ln.tail.edge, e: 2.0, f: 1.35 }, hi: { [ln.gi[0]]: ln.hi }, seed: 60 + li, w: .1, tailGap: .5 });
}

// ------------------------------------------------------------------- the four pairs
function pairFrame(g, t, li, ctx) {
  const { lines, units } = ctx;
  window.__markInk = GRAPHITE;
  const gr = groove(t, 1);
  tentBack(g, t);
  floorWide(g, t, 1);
  runway(g, t, belt(t, lines));
  const L = lights(g, t, units);
  L.beams();
  drawUnits(g, t, units, gr);
  // The stream of dogs is already walking on at the end of the fourth line.
  if (li === 3) stream(g, t, gr);
  const cheer = cheerAt(t, units);
  crowd(g, t, { cheer });
  thePigeon(g, t, cheer);
  valance(g, t);
  lamp(g, t, -1, L.tL, 631);
  lamp(g, t, 1, L.tR, 641);
  lyric(g, t, lines[li], li);
}

// ------------------------------------------------------------------- the stream of dogs on the stage
const N_STREAM = 16;
function stream(g, t, gr, k = 1) {
  const m = march(t);
  const lo = k > .999 ? -260 : -1000, hi = k > .999 ? W + 260 : W + 1000;
  for (let i = 0; i < N_STREAM; i++) {
    const x = -330 - 330 * i + m;
    if (x < lo - 200 || x > hi + 200) continue;
    const vel = (x - (-330 - 330 * i + march(t - 1 / 15))) * 15;
    g.save(); g.translate(0, STAGE_Y); streamDog(g, t, i, x, { gr, vel }); g.restore();
  }
}

// ------------------------------------------------------------------- the pull-back, the crowd, the held note
// Clawd's steps out of the crowd, in wide-view coordinates: when, where his feet are, how big.
const STEPS = [[171.06, CLAWD_SEAT.x, 1294, .5], [171.52, 424, 1336, .64], [171.96, 486, 1390, .82], [172.39, 528, 1436, 1.02], [172.83, 540, 1500, 1.26]];
function clawdAt(t) {
  if (t <= STEPS[0][0]) return { x: STEPS[0][1], y: STEPS[0][2], s: STEPS[0][3], hopK: 0, since: 9, walking: false };
  for (let i = 1; i < STEPS.length; i++) {
    const [t1, x1, y1, s1] = STEPS[i], [t0, x0, y0, s0] = STEPS[i - 1];
    if (t < t1) { const u = (t - t0) / (t1 - t0), e = u * u * (3 - 2 * u); return { x: lerp(x0, x1, e), y: lerp(y0, y1, e), s: lerp(s0, s1, e), hopK: Math.sin(u * Math.PI), since: 9, walking: true, phase: u }; }
  }
  return { x: STEPS[4][1], y: STEPS[4][2], s: STEPS[4][3], hopK: 0, since: t - STEPS[4][0], walking: false };
}
function pushM(t) { return 1 + .26 * easeInOut(inv(173.4, 177.9, t)); }

function wideFrame(g, t, ctx, which) {
  const { lines, units, w45, w46 } = ctx;
  window.__markInk = GRAPHITE;
  const held = t > T_STOP[0] + .2;
  const gr = groove(t, held ? .35 : 1);
  const k = camK(t), m = pushM(t), F = [540, 700];
  backPaper(g, t);
  g.save();
  g.translate(F[0], F[1]); g.scale(m, m); g.translate(-F[0], -F[1]);
  // The tent, from wherever the camera is.
  withCam(g, k, () => { backWorld(g, t, k); floorWide(g, t, k); stageWide(g, t, belt(t, lines), k); });
  // The lamps' beams: on the stage while the camera is close, then down the aisle, then together on you.
  const L = lights(g, t, units, 1 - smooth(inv(CAM.t0, CAM.t0 + .5, t)));
  L.beams();
  const sweep = Math.sin(t * .7) * 90, lock = smooth(inv(172.6, 172.95, t));
  const bp = smooth(inv(CAM.t0 + .3, CAM.t0 + 1.2, t)) * .75;
  withCam(g, k, () => {
    stream(g, t, gr, k);
    rowWide(g, t, k);
    thePigeon(g, t, 0, (t > 169.4 && t < 170.3) || (t > 172.9 && t < 173.7));
    valanceWide(g, t, k);
  });
  // The crowd, and the red carpet, in wide-view coordinates.
  inWS(g, k, () => {
    aisle(g, t, smooth(inv(166.35, 167.1, t)));
    pool(g, t, clamp(spring(t, 172.86, { f: 1.8, z: .62 }), 0, 1.06));
    const cl = clawdAt(t);
    crowdWS(g, t, gr, cl.y, t > STEPS[0][0] - .5 ? () => drawClawd(g, t, cl, gr) : null);
  });
  // The beams cross the crowd and come together on you (over the crowd, so they light it).
  if (bp > 0) { beamTo(g, t, -1, lerp(400 + sweep, 430, lock), lerp(1500, 1745, lock), { pow: bp * (.5 + .5 * lock), seed: 651, half: 130 }); beamTo(g, t, 1, lerp(680 - sweep, 650, lock), lerp(1500, 1745, lock), { pow: bp * (.5 + .5 * lock), seed: 661, half: 130 }); }
  g.restore();
  lamp(g, t, -1, L.tL, 631);
  lamp(g, t, 1, L.tR, 641);
  if (which === 45) {
    sing(g, t, w45, { y: 225, size: 72, maxW: 980, tail: 2, tailCol: C.blue, tailBubble: { fill: '#79b0f0', edge: '#1f3f8f', e: 2.0, f: 1.35 }, hi: {}, seed: 70, w: .1, tailGap: .5 });
  } else {
    // "you!" is held for 4.6 s: the word stays written, breathing, till the note ends.
    sing(g, t, w46, { y: 225, size: 68, maxW: 980, tail: 2, tailCol: '#c98d14', tailBubble: { fill: '#ffc94a', edge: '#a35a10', e: 2.0, f: 1.35 }, hi: {}, seed: 71, w: .1, tailGap: .5, tailSize: 168, dance: 3, out: { t0: 177.7, dur: .25 } });
  }
}

// Clawd, one of the crowd until he turns and steps out; on "you!" he holds out a lead to the camera.
function drawClawd(g, t, cl, gr) {
  const vox = loud('vocals', t);
  const turned = t > 169.65 + .11;
  if (!turned) return;                                  // (until then the crowd draws him from behind)
  const lead = spring(t, 173.28, { f: 2.1, z: .42 });
  const lp = clamp((t - 173.28) / .45);
  const hop = cl.walking ? cl.hopK * 34 * cl.s : 0;
  const land = cl.since < .3 ? Math.exp(-cl.since * 14) * Math.cos(cl.since * 34) : 0;
  const singing = t > 171.42 ? clamp(vox * 1.4) : 0;
  const armTo = [lerp(172, 300, clamp(lead)), lerp(-112, -12, clamp(lead))];
  clawd(g, {
    x: cl.x, y: cl.y, s: cl.s, t, seed: 1, eyes: t < 170.5 ? 'wide' : 'open', mouth: singing, brow: t > 173.2 ? .85 : 0, cheeks: t > 172.7,
    look: t > 172.9 ? [0, .35] : [0, 0], bob: hop + gr.bob * .3, squash: (cl.walking ? 0 : gr.sq * .5) + land * 1.2, lean: cl.walking ? Math.sin(cl.phase * Math.PI * 2) * .05 : gr.lean * .5, legs: cl.walking ? cl.phase * 2 : 0,
    armL: { up: t > 173 ? -.55 : .3 + gr.bp * .1 }, armR: t > 173.26 ? { to: armTo, reach: 84 } : { up: .15 },
    prop: (g2, o) => { if (t > 171.0) hopeBrows(g2, t, clamp((t - 171.0) / .6)); if (t > 173.26) leadProp(g2, t, o.hR, { prog: lp, swing: Math.sin(t * 1.8) * 8 }); },
  });
}
