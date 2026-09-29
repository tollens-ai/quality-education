// The lead-in (177.9-181.41): no voice, a drum build into the last chorus; "the ring assembles". The parade's last
// picture (a hundred dogs, Clawd holding out the lead, the spotlight on you) holds for the silence after the held "you";
// on the first drum hit the camera whips round to the golden ring, where the twelve dogs of the chorus come racing in
// from both sides to their chalk marks, two to each drum hit (one of them falls over and comes in last); Clawd runs in
// with the lead streaming, lands on the big hit, and on the next strong one throws it away and a judge's bowler drops
// on his head in a puff of confetti; the board drops in, the ball appears and bounces once on the last beat before
// the crash (chorus3.js has the crash).
import { W, H, TAU, clamp, lerp, hash, inv, smooth, easeOut, easeIn, easeInOut, hit } from '../kit.js';
import { shot, SHOTS } from '../shots.js';
import { line } from '../pencil.js';
import { paper } from '../paper.js';
import { clawd } from '../chars.js';
import { pigeon } from '../world.js';
import { groove, pop } from '../common.js';
import { bowler, ROSETTES } from '../ringcast.js';
import { leadProp } from '../props-parade2.js';
import { tentBack, valance } from '../props-parade1.js';
import { GRAPHITE, C } from '../palette.js';
import * as P from '../props-c3.js';

const { GOLD, DOZEN } = P;
const T_WHIP = [178.73, 179.06];                          // the first drum hit: the camera whips from the crowd to the ring
const HITS = [179.81, 180.251, 180.465, 180.669, 180.901, 181.104];     // the drum hits the dogs land on, two at a time
const T_CLAWD_IN = 179.374, T_CLAWD_LAND = 179.81, T_SWAP = 180.669, T_BOARD = 180.251, T_MARKS = 179.08;
const PAIRS = [[8, 11], [4, 7], [0, 3], [9, 10], [1, 2], [5, 6]];      // [from the left, from the right] for each hit; dog 5 is the one who falls over
const RUN = {};
PAIRS.forEach(([l, r], j) => { RUN[l] = { side: 1, tL: HITS[j] }; RUN[r] = { side: -1, tL: HITS[j] }; });
const CLAWD = { x: 215, y: 1500, s: 1.0 };
const whip = u => easeInOut(u);

export function register(S) {
  shot(177.9, 181.41, (g, t) => frame(g, t), { id: 'leadin' });
}

function frame(g, t) {
  window.__markInk = GRAPHITE;
  const gr = groove(t, 1.1);
  const [w0, w1] = T_WHIP;
  if (t < w0) paradePic(g, t);
  else if (t < w1) {
    const u = inv(w0, w1, t), e = whip(u);
    const sm = clamp(W * (whip(clamp(u + .12)) - whip(clamp(u - .12))), 0, 420);          // how far it moves while the shutter is open
    P.smearDraw(g, gg => { gg.save(); gg.translate(-e * W, 0); paradePic(gg, t); gg.restore(); }, sm, GOLD.paper);
    P.smearDraw(g, gg => { gg.save(); gg.translate((1 - e) * W, 0); ringPic(gg, t, gr); gg.restore(); }, sm, null);
  } else ringPic(g, t, gr);
  if (t >= T_BOARD) P.boardLayer(g, t, gr, pop(t, T_BOARD, .5));
}

// The parade's last picture, drawn by the parade's own last shot (so the join is exact); a stand-in when it isn't loaded.
function paradePic(g, t) {
  const s = SHOTS.find(x => x.id === 'parade2-you');
  if (s) { s.draw(g, t, s); return; }
  tentBack(g, t); valance(g, t);
  clawd(g, { x: 540, y: 1636, s: 2, t, seed: 1, eyes: 'open', mouth: 0, brow: .85, cheeks: true, armR: { to: [300, -40], reach: 70 }, prop: (g2, o) => leadProp(g2, t, o.hR, { prog: 1, swing: Math.sin(t * 1.8) * 8 }) });
}

// ------------------------------------------------------------------- the ring
function ringPic(g, t, gr) {
  const cam = P.CAM0, cx = { t, gr, vox: 0, li: 0 };
  paper(g, { base: GOLD.paper, vignette: GOLD.vignette });
  P.panorama(g, t, cam, { sunMood: t < T_CLAWD_IN ? 'sleepy' : 'happy', look: [-.3, .8], poles: 0 });
  pigeon(g, t, 1012, 1010, .62, { flip: -1, state: 'perch', look: -1 });
  DOZEN.forEach(D => P.chalkMark(g, t, D, clamp((t - (T_MARKS + D.i * .04)) / .3)));
  // the dogs, back to front: racing in, or standing on their marks
  const items = DOZEN.map(D => ({ y: D.y, fn: () => dog(g, t, D, cx) }));
  items.sort((a, b) => a.y - b.y).forEach(it => it.fn());
  clawdRun(g, t, gr);
  SEATS.forEach((S, j) => seatRunner(g, t, S, j));
}

// The rest of the crowd: six more dogs racing along the foot of the picture to the seats where the audience will pop up at the crash.
const SEATS = [[1, 90, 179.81], [-1, 990, 179.81], [-1, 810, 180.251], [1, 270, 180.465], [1, 450, 180.901], [-1, 630, 181.104]];
const SEAT_DOGS = ['lab', 'beagle', 'corgi', 'poodle', 'pug', 'husky'];
function seatRunner(g, t, [side, sx, tL], j) {
  const t0 = tL - .82;
  if (t < t0 || t > tL + .45) return;
  const u = clamp((t - t0) / .82), x = t < tL ? lerp(side > 0 ? -170 : W + 170, sx, easeOut(u, 1.7)) : sx;
  const duck = t > tL ? easeIn(clamp((t - tL) / .3), 2) : 0, sp = t < tL ? 1 - Math.pow(u, 5) : 0;
  const [coat, shade, muzzle] = P.COATS[SEAT_DOGS[j]], ph = t * 6.5 + j * .37;
  for (let k = 0; k < 3 && sp > .3; k++) line(g, [[x - side * (110 + k * 40), 1690 - k * 26], [x - side * (180 + k * 40), 1690 - k * 26]], { w: 7, col: '#8d8c97', seed: 8500 + j * 3 + k, t, spline: false, passes: 1, over: 0, bow: 0, taper: [.3, .05], alpha: .5 });
  P.runDog(g, t, x, 1780 + duck * 330, 1.0, { seed: 90 + j, coat, shade, muzzle, flip: side, phase: ph * sp, lift: Math.abs(Math.sin(ph * Math.PI)) * 12 * sp, rot: -.1 * (1 - sp) * side * (t < tL ? 1 : 0), collar: ROSETTES[(j * 2 + 1) % 12] });
}

// Where dog D is at time t and what it is doing: null before it comes on, a runner, a tumbler, a dazed dog, or standing.
function pathOf(t, D) {
  const R = RUN[D.i], feet = D.y + 92 * D.s, x0 = R.side > 0 ? -200 : W + 200, tL = R.tL;
  if (D.i !== 5) {
    const t0 = tL - .68;
    if (t < t0) return null;
    if (t >= tL) return { mode: 'stand' };
    const u = (t - t0) / .68;
    return { mode: 'run', x: lerp(x0, D.x, easeOut(u, 1.8)), y: feet, side: R.side, u, brake: Math.pow(u, 5) };
  }
  // the one that falls over: runs, trips, tumbles, sits dazed, dashes in last
  const t0 = 179.5, tTrip = 179.98, tTum = 180.42, tDaze = 180.76;
  if (t < t0) return null;
  if (t >= tL) return { mode: 'stand' };
  if (t < tTrip) return { mode: 'run', x: lerp(x0, 300, (t - t0) / (tTrip - t0)), y: feet, side: 1, u: .3, brake: 0 };
  if (t < tTum) { const u = (t - tTrip) / (tTum - tTrip); return { mode: 'tumble', x: lerp(300, 470, easeOut(u, 1.6)), y: feet, side: 1, rot: -TAU * 1.15 * easeOut(u, 1.4), lift: 70 * Math.sin(u * Math.PI) }; }
  if (t < tDaze) return { mode: 'daze', x: 470, y: feet, side: 1 };
  const u = (t - tDaze) / (tL - tDaze);
  return { mode: 'run', x: lerp(470, D.x, easeOut(u, 1.4)), y: feet, side: 1, u: .3, brake: Math.pow(u, 5) };
}
function dog(g, t, D, cx) {
  const p = pathOf(t, D), R = RUN[D.i];
  if (!p) return;
  if (p.mode === 'stand') {
    const d = t - R.tL, sq = d < .5 ? 1.3 * Math.exp(-d * 9) * Math.cos(d * 22) : 0, hop = d < .3 ? 24 * Math.sin(Math.PI * clamp(d / .25)) : 0;
    P.dozenDog(g, t, D, cx, { pin: 0, look: [-.6 + .12 * (D.col - 1), .1], squash: sq, hop: hop * (D.i % 2 ? 1 : .8), mouth: 0 });
    dust(g, t, D.x, D.y + 92 * D.s, d / .5, D.i);
    return;
  }
  const [coat, shade, muzzle] = P.COATS[D.breed], sz = D.s * 1.3;
  if (p.mode === 'run') {
    const ph = t * 6 + D.i * .3, sp = 1 - p.brake, lift = Math.abs(Math.sin(ph * Math.PI)) * 12 * sp;
    for (let k = 0; k < 3; k++) { const a = clamp((1 - p.brake) * 1.2); line(g, [[p.x - p.side * (120 + k * 46) * sz, p.y - (50 + k * 28) * sz], [p.x - p.side * (200 + k * 46) * sz, p.y - (50 + k * 28) * sz]], { w: 7, col: '#8d8c97', seed: 8000 + D.i * 3 + k, t, spline: false, passes: 1, over: 0, bow: 0, taper: [.3, .05], alpha: .55 * a }); }
    P.runDog(g, t, p.x, p.y, sz, { seed: 60 + D.i, coat, shade, muzzle, flip: p.side, phase: ph * sp, lift, rot: -.1 * p.brake * p.side, collar: ROSETTES[(D.i * 5 + 3) % 12] });
  } else if (p.mode === 'tumble') P.runDog(g, t, p.x, p.y - 20 * sz, sz, { seed: 60 + D.i, coat, shade, muzzle, flip: p.side, phase: t * 9, rot: p.rot, lift: p.lift, eyes: 'x', mouth: 0 });
  else P.runDog(g, t, p.x, p.y, sz, { seed: 60 + D.i, coat, shade, muzzle, flip: p.side, phase: 0, dazed: 1, eyes: 'x', mouth: 0, squash: .1 * Math.sin(t * 12) });
}
// A little burst of dust where a dog lands on its mark.
function dust(g, t, x, y, k, seed) {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < 6; i++) {
    const a = Math.PI + i / 5 * Math.PI + (hash(seed, i) - .5) * .3, r0 = 40 + k * 60, r1 = r0 + 26 + 30 * (1 - k);
    line(g, [[x + Math.cos(a) * r0 * 1.2, y - 6 + Math.sin(a) * r0 * .4], [x + Math.cos(a) * r1 * 1.2, y - 6 + Math.sin(a) * r1 * .4]], { w: 8 * (1 - k), col: '#fff7e6', seed: 8300 + seed * 7 + i, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .9 * (1 - k) });
  }
}

// Clawd: runs in with the lead streaming, lands on the big hit, throws the lead away and takes the judge's bowler.
function clawdRun(g, t, gr) {
  if (t < T_CLAWD_IN) return;
  const run = t < T_CLAWD_LAND, u = clamp((t - T_CLAWD_IN) / (T_CLAWD_LAND - T_CLAWD_IN));
  const x = run ? lerp(-300, CLAWD.x, easeOut(u, 1.6)) : CLAWD.x, dl = t - T_CLAWD_LAND;
  const sq = !run && dl < .5 ? 1.4 * Math.exp(-dl * 8) * Math.cos(dl * 20) : 0;
  const ds = t - T_SWAP;
  const swap = ds > 0;
  clawd(g, {
    x, y: CLAWD.y, s: CLAWD.s, t, seed: 1, eyes: swap ? 'happy' : run ? 'wide' : 'open', mouth: 0, brow: swap ? 0 : .3, cheeks: swap,
    look: [.3, 0], bob: run ? 0 : gr.bob * .5, squash: sq + (swap && ds > .42 && ds < .9 ? 1.1 * Math.exp(-(ds - .42) * 8) * Math.cos((ds - .42) * 22) : 0), lean: run ? .09 * (1 - u) : gr.lean * .5, legs: run ? (t * 5) % 1 : 0,
    armR: swap ? { up: ds < .35 ? .95 : .2, out: .4 } : run ? { up: .5, out: .6 } : { up: .55, out: .5 }, armL: { up: run ? .3 * Math.sin(t * 10) + .2 : .15 },
    prop: (g2, po) => {
      if (!swap) leadProp(g2, t, po.hR, { prog: 1, swing: run ? Math.sin(t * 9) * 10 : Math.sin(t * 1.8) * 8 });
      else {
        // the lead is thrown up and away, turning over
        if (ds < .45) { const q = ds / .45; g2.save(); g2.translate(po.hR[0], po.hR[1] - q * q * 1400); g2.rotate(q * 8); leadProp(g2, t, [0, 0], { prog: 1 }); g2.restore(); }
        const d = ds - .12, q = clamp(d / .3);
        if (d > 0) { g2.save(); g2.translate(0, -(1 - easeIn(q, 2)) * 560 + (q >= 1 ? Math.max(0, 14 * Math.exp(-(d - .3) * 9) * Math.cos((d - .3) * 26)) : 0)); bowler(g2, t, po); g2.restore(); }
      }
    },
  });
  // the puff of confetti as the lead goes and the bowler comes
  if (ds > -.02 && ds < 1.2) for (let i = 0; i < 30; i++) {
    const an = -Math.PI / 2 + (hash(4010, i) - .5) * 2.6, v = 320 + hash(4010, i, 2) * 420, tt = ds + .02;
    const px = CLAWD.x + 60 + Math.cos(an) * v * tt, py = CLAWD.y - 250 + Math.sin(an) * v * tt + 700 * tt * tt;
    if (py > 1560) continue;
    const r = tt * (5 + hash(4010, i, 3) * 6) + i;
    line(g, [[px - Math.cos(r) * 10, py - Math.sin(r) * 10], [px + Math.cos(r) * 10, py + Math.sin(r) * 10]], { w: 10, col: ROSETTES[i % 12], seed: 4100 + i, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .95 * (1 - clamp((tt - .9) / .35)) });
  }
}
