// Chorus 1's fifth and sixth gags (a builder's file). The ring by day.
//   5  "Polish one part, and then another takes a blow:" Clawd paints the nails of one of the show dog's paws to
//      a shine, then dries them with a blow-dryer that blasts the rest of him into a mess: improving one thing
//      can cost another.
//   6  "Which of the "ilities" are yours? I've got to know!" the twelve rosettes lift off and orbit, a spotlight
//      sweeps the ring and lands on the viewer, Clawd points at you, and the picture pushes in to his face.
// Each gag is a few small helpers over a table of times taken from the words (keys5, keys6), so chorus 2 can play
// them again with the tables turned. To adapt gag 5: keep keys5, nailPos and the tools (groomBrush, dryer, cord,
// windStreaks, furTufts in props-c1b.js), and put Clawd (subjectClawd) where showMutt is, with the polish on one
// arm and the wind on the other side; the bulldog holds the tools. To adapt gag 6: keep keys6, orbitSlot, pool6 and
// cam6, and swap the pointing judge for the bulldog and Clawd on the table; the close-up is on Clawd either way.
import { W, TAU, clamp, lerp, inv, hash, easeOut, easeIn, easeInOut, smooth, hit, words } from '../kit.js';
import { line, scrub } from '../pencil.js';
import { rosette, sparkle, burst } from '../props.js';
import { pop } from '../common.js';
import { SPOT, ROSETTES, judgeClawd, tableFront, bowler } from '../ringcast.js';
import { showMutt, muttAnchors, groomBrush, dryer, DRYER, cord, windStreaks, furTufts, spotBeam, softGlow, rays, eyeStars, pointingHand } from '../props-c1b.js';
import { C } from '../palette.js';

const r01 = (t, a, b) => clamp((t - a) / (b - a));
// Piecewise-linear keyframes [[t, v], ...], each leg eased.
function kf(t, pts, ease = smooth) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], ease(r01(t, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
}
// Where a point given in screen pixels is, in Clawd's own space (feet at 0), so his arm can be sent to it.
const toLocal = (C_, bob, sx, sy) => [(sx - C_.x) / C_.s, (sy - (C_.y - bob)) / C_.s];

// =================================================================== 5 "Polish one part, and then another takes a blow:"
const DOG5 = { x: 700, y: 988, s: 1.85 };           // the show dog on the table (the table is drawn shifted to match)
const BRUSH_ANG = -.55, BRUSH_LEN = 128;            // the brush points up and to the right; its length in Clawd's units
const GRIP = DRYER.grip, MOUTH = DRYER.mouth;        // the dryer's grip, and where its mouth is from the grip, in Clawd's units
const AIM = -.5;                                     // the dryer's angle when he aims it

export function keys5(ws) {
  const V = i => ws[i].s - .085;
  return { V, t0: V(0) - .45, brush: V(0), done: V(2) + .1, drop: V(3), grab: V(4), aim: V(5), on: V(6) - .06, blast: V(6), peak: V(8), off: ws[8].s + .19 };
}
// The brush tip's position along the row of nails (0 is the first nail, 3 the last), as a function of time.
const nailPos = (t, K) => kf(t, [[K.brush - .25, -1.2], [K.brush, -.3], [K.brush + .09, .1], [K.brush + .23, 1.0], [K.brush + .39, 2.0], [K.brush + .53, 3.0], [K.brush + .68, 3.4], [K.brush + .83, 5]], x => x);

export function gag5(g, t, ws, cx) { groom5(g, t, ws, cx); }
// The whole groom; `o.clawd: false` draws only the set (table, dog, tools), for the wipe that opens the next gag.
function groom5(g, t, ws, cx, o = {}) {
  const withClawd = o.clawd !== false;
  const K = keys5(ws), gr = cx.gr;
  // ---- the world's state at this moment
  const wind = r01(t, K.on, K.blast + .2) * (1 - r01(t, K.off, K.off + .14));
  const fl = Math.cos(Math.PI * 15 * t) * .7 + Math.sin(TAU * 3.1 * t) * .3;          // flutter: alternates every drawing
  const ruffle = smooth(r01(t, K.peak - .05, K.off + .05)) * .95;
  const pos = nailPos(t, K), nails = [0, 1, 2, 3].map(i => clamp((pos - i + .5) / .6));
  const painted = t > K.done;
  // ---- the dog
  const dogK = pop(t, K.t0 + .04, .3);
  const tilt = wind * (.1 + .02 * fl), pawSway = painted ? -.07 : -.05 + Math.sin(t * 4) * .05 * (1 - r01(t, K.brush, K.brush + .1));
  const D = { ...DOG5, tilt, bob: gr.bob * .3, squash: 0, pawSway };
  const A = muttAnchors(D);
  // ---- Clawd, and the hand that holds the brush or the dryer
  const enter = r01(t, K.t0, K.t0 + .32);
  const CL = { x: lerp(-230, 195, easeOut(enter, 2.2)), y: 1345 - Math.sin(enter * Math.PI) * 70, s: 1.1 };
  const bob = gr.bob * .35 + (wind > .3 ? Math.sin(t * 90) * 2 : 0);
  const tipAt = p => {
    const i = clamp(Math.floor(p), 0, 2), f = p - i, a = A.nails[i], b = A.nails[i + 1];
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f) - 12];
  };
  const scrubK = Math.sin(TAU * 5 * t) * .22 * (t > K.brush && t < K.brush + .8 ? 1 : 0);      // the brush scrubs back and forth as it goes
  const tip = tipAt(pos + scrubK);
  const bl = BRUSH_LEN * CL.s, brushHand = [tip[0] - Math.cos(BRUSH_ANG) * bl, tip[1] - Math.sin(BRUSH_ANG) * bl];
  const rotD = kf(t, [[K.grab, .9], [K.aim, AIM]], easeOut) + (wind > .05 ? Math.sin(t * 60) * .012 : 0);
  const mouthOff = [(MOUTH[0] * Math.cos(rotD) - MOUTH[1] * Math.sin(rotD)) * CL.s, (MOUTH[0] * Math.sin(rotD) + MOUTH[1] * Math.cos(rotD)) * CL.s];
  const aimHand = [A.nails[1][0] - 130, 1236];                       // where the hand holds the dryer so its mouth is under the paw
  const restHand = [CL.x + 200, 1250];
  const held = t >= K.grab && t < K.off + .3;
  let hand;
  if (t < K.drop) hand = brushHand;
  else if (t < K.grab) hand = [lerp(brushHand[0], restHand[0], easeOut(r01(t, K.drop, K.grab))), lerp(brushHand[1], restHand[1], easeOut(r01(t, K.drop, K.grab)))];
  else if (t < K.aim) hand = [lerp(restHand[0], aimHand[0], easeOut(r01(t, K.grab, K.aim), 2)), lerp(restHand[1], aimHand[1], easeOut(r01(t, K.grab, K.aim), 2))];
  else hand = [aimHand[0] + (wind > .05 ? Math.sin(t * 70) * 1.5 : 0), aimHand[1] + (wind > .05 ? Math.cos(t * 55) * 1.5 : 0)];
  const nozzle = [hand[0] + mouthOff[0], hand[1] + mouthOff[1]];

  // ---- the table (shifted to sit under the dog), the wind that hits him, the dog
  if (t >= K.t0) {
    g.save(); g.translate(DOG5.x - SPOT.dog.x, 0); tableFront(g, t); g.restore();
  }
  if (dogK > 0) {
    g.save(); g.translate(DOG5.x, 1150); g.scale(dogK, dogK); g.translate(-DOG5.x, -1150);
    const watching = t > K.brush && t < K.done, sees = t >= K.grab;
    showMutt(g, t, {
      ...D, wind, fl, ruffle, nails, paw: r01(t, K.t0 + .1, K.t0 + .4), ear: gr.lean * 8, flap: r01(t, K.blast + .5, K.blast + .6) * wind,
      eyes: wind > .1 || sees ? 'wide' : watching ? 'dot' : 'happy', look: t > K.off - .05 ? [0, .1] : wind > .1 || sees ? [-.9, .2] : watching ? [-.8, .7] : [0, 0],
      brow: sees ? 1 : 0, mouth: wind > .1 ? .8 : watching ? .35 : gr.bp > .5 ? .5 : .12,
    });
    g.restore();
  }
  if (wind > .01) windStreaks(g, t, { x: nozzle[0], y: nozzle[1], ang: rotD - .14, len: 700, spread: 1.1, n: 12, w: 11, k: wind * (1 + .1 * Math.sin(t * 20)), seed: 31 });
  if (wind > .01) furTufts(g, t, { x: A.head[0] - 40, y: A.head[1] - 30, k: wind * clamp((t - K.blast) / .25), n: 12 });
  // ---- Clawd, with the brush, then the dryer
  const blowing = wind > .05, oops = t > K.off - .05;
  if (withClawd) judgeClawd(g, t, cx, {
    x: CL.x, y: CL.y, s: CL.s, bob, squash: gr.sq * .5, lean: gr.lean * .5 - (blowing ? .05 : 0),
    eyes: oops || blowing ? 'wide' : t > K.done ? 'happy' : t > K.brush - .1 ? 'squint' : t > K.drop ? 'half' : 'open',
    brow: oops || blowing ? .7 : t > K.drop ? -.5 : t < K.brush ? -.3 : 0, raise: blowing ? .2 : 0, sweat: oops, look: [.7, -.2],
    armR: { to: toLocal(CL, bob, hand[0], hand[1]), reach: 260 },
    armL: { up: blowing ? .8 : .25, out: .2 },
    prop: (g2, po) => {
      bowler(g2, t, po);
      if (t < K.drop && t >= K.t0) { g2.save(); g2.translate(po.hR[0], po.hR[1]); g2.rotate(BRUSH_ANG); groomBrush(g2, t); g2.restore(); }
      if (held) {
        const k = pop(t, K.grab, .2);
        g2.save(); g2.translate(po.hR[0], po.hR[1]); g2.rotate(rotD); g2.scale(k, k); g2.translate(-GRIP[0], -GRIP[1]); dryer(g2, t, { on: wind }); g2.restore();
      }
    },
  });
  // (with no Clawd to hold it, the dryer is drawn on its own)
  if (!withClawd && held) { g.save(); g.translate(hand[0], hand[1]); g.rotate(rotD); g.scale(CL.s, CL.s); g.translate(-GRIP[0], -GRIP[1]); dryer(g, t, { on: 0 }); g.restore(); }
  // the cord along the ground to the plug, off to the left
  if (held && withClawd) { const hx = hand[0] - 14 * CL.s, hy = hand[1] + 36 * CL.s; cord(g, t, [[hx, hy], [hx + 8, hy + 70], [CL.x + 120, 1410], [CL.x - 100, 1436], [-60, 1424]], { w: 11 }); }
  // the brush, dropped on the sawdust
  if (t >= K.drop && withClawd) {
    const q = r01(t, K.drop, K.drop + .3), by = lerp(brushHand[1], 1398, q * q), bx = lerp(brushHand[0], CL.x + 190, easeOut(q));
    g.save(); g.translate(bx, by); g.rotate(BRUSH_ANG + easeOut(q, 2) * 0.75 + (q > .8 ? Math.sin((q - .8) * 40) * .05 : 0)); g.scale(CL.s, CL.s); groomBrush(g, t); g.restore();
  }
  // ---- shine: a sparkle as each nail is painted, and a burst when the last one is (on "part,")
  const NT = [K.brush + .09, K.brush + .23, K.brush + .39, K.brush + .53];
  NT.forEach((tn, i) => {
    const d = t - tn;
    if (d > 0 && d < .4) sparkle(g, A.nails[i][0] + 18, A.nails[i][1] - 26, 30 * (1 - d / .4), t, { seed: 950 + i, rot: d * 6 });
  });
  const bd = t - (K.brush + .53);
  if (bd > 0 && bd < .45) {
    const p = bd / .45;
    burst(g, A.paw[0], A.paw[1] - 10, 90, 190, t, { col: C.yellow, n: 12, prog: easeOut(p), w: 10, seed: 7 });
    sparkle(g, A.paw[0] - 80, A.paw[1] - 70, 34 * (1 - p), t, { seed: 960, rot: p * 4 });
    sparkle(g, A.paw[0] + 90, A.paw[1] - 60, 28 * (1 - p), t, { seed: 961, rot: -p * 4 });
  }
  // the polished paw keeps a twinkle while everything else is blown about
  if (painted && t < ws[8].e + .1) { const tw = .5 + .5 * Math.sin(t * 9); sparkle(g, A.nails[2][0] + 22, A.nails[2][1] - 30, 12 + 12 * tw, t, { seed: 962, rot: t * 2 }); }
}

// =================================================================== 6 "Which of the "ilities" are yours? I've got to know!"
const ORBIT = { x: 540, y: 1150, rx: 430, ry: 190, r: 56 };
const CLAWD6 = { x: 540, y: 1400, s: 1.12 };

export function keys6(ws) {
  const V = i => ws[i].s - .085;
  return { V, t0: V(0) - .45, lift: V(0) - .06, beam: V(2), ili: V(3), you: V(5), push: V(5) + .18, know: V(9), hit: 51.97 };
}
// His bowler, tipped back and lifted a little as he leans in (drawn in his own space).
const tipHat = (g2, t, po, lift, tilt) => { g2.save(); g2.translate(0, -246 - lift); g2.rotate(tilt); g2.translate(0, 246); bowler(g2, t, po); g2.restore(); };
// Where Clawd is and how big: he runs from the table to the middle of the ring, then steps forward on "yours?".
export function clawd6(t, K) {
  const run = r01(t, K.t0, K.lift + .1), step = kf(t, [[K.you, 0], [K.you + .3, 1]], easeOut);
  return { x: lerp(195, CLAWD6.x, easeInOut(run)), y: lerp(1345, CLAWD6.y, easeInOut(run)) + step * 40, s: lerp(1.1, CLAWD6.s, easeInOut(run)) + step * .18, run };
}
// The camera: a push in on Clawd's face for "I've got to know!", with a kick on the drum hit.
export function cam6(t, K, C6) {
  const z = 1 + 1.15 * kf(t, [[K.push, 0], [K.push + .42, 1]], easeInOut) + .08 * r01(t, K.push + .42, K.hit) - .55 * easeOut(r01(t, K.hit, K.hit + .35), 2.2) + .04 * hit('drums', t);
  return { z, fx: C6.x, fy: C6.y - 140 * C6.s };
}
// The rosettes' orbit: how far it has turned by time t (it speeds up as they lift off).
const spin6 = (t, t0) => { const u = t - t0, T = .6; return u <= 0 ? 0 : 3.1 * (u < T ? T * ((u / T) ** 3 - (u / T) ** 4 / 2) : T * .5 + u - T); };
export function orbitSlot(i, t, K) {
  const O = ORBIT, phi = spin6(Math.min(t, K.you), K.lift), th = TAU * i / 12 + phi;
  const k = kf(t, [[K.lift + i * .05, 0], [K.lift + i * .05 + .4, 1]], x => easeOut(x, 2.4));
  const dep = .8 + .3 * (Math.sin(th) * .5 + .5);
  const x = O.x + O.rx * Math.cos(th), y = O.y + O.ry * Math.sin(th);
  return { th, k, x, y: lerp(y + 120, y, k), s: lerp(.3, 1, k) * dep };
}
// The pool of light: it sweeps the ring left to right on "ilities are", then swings down to the foot of the picture,
// on the viewer, on "yours?".
export function pool6(t, K) {
  const sweep = easeInOut(r01(t, K.beam, K.you - .16)), land = easeIn(r01(t, K.you - .16, K.you), 2);
  const x = lerp(lerp(140, 940, sweep), 540, land), y = lerp(1270 + 30 * Math.sin(sweep * Math.PI), 1510, land);
  const rx = lerp(240, 440, land), ry = lerp(72, 130, land);
  return { x, y, rx, ry, k: r01(t, K.beam, K.beam + .15) };
}

export function gag6(g, t, ws, cx) {
  const K = keys6(ws), gr = cx.gr;
  const C6 = clawd6(t, K), cam = cam6(t, K, C6), pool = pool6(t, K);
  const zk = smooth(inv(1.15, 1.9, cam.z));
  // ---- the set from gag 5 wipes away to the right (as it was left), while Clawd runs to the middle
  const slide = easeIn(r01(t, K.t0 + .05, K.t0 + .38), 2);
  if (slide < 1) { g.save(); g.translate(slide * 1300, 0); groom5(g, 48.24, words('Chorus 1', 'Polish one part'), cx, { clawd: false }); g.restore(); }
  // ---- the lights go down round the ring for the spotlight (a blue crayon wash), and come up again for the close-up
  const dim = smooth(r01(t, K.beam - .3, K.beam + .1)) * (1 - smooth(r01(t, K.you, K.you + .3)));
  if (dim > .01) { g.save(); g.globalAlpha *= dim; scrub(g, [0, 700, W, 1540], { col: '#3550b8', seed: 55, t, gap: 24, w: 38, alpha: .27, angle: -.08, wig: 20 }); g.restore(); }
  // ---- behind the picture: the light of the close-up (screen space, so it fills the frame however far we push in)
  softGlow(g, 540, 1180, 900, '#fff3c4', .9 * zk);
  rays(g, t, 540, 1180, { r0: 330, r1: 1350, k: zk * (.85 + .15 * gr.bp), w: 54 });
  // ---- the burst on the drum hit: rays behind him
  const hb = t - K.hit, hq = easeOut(clamp(hb / .4), 2.6);
  if (hb > 0) burst(g, 540, 1130, 380, 380 + 500 * hq, t, { col: C.yellow, n: 18, prog: 1, w: 12, seed: 9 });
  // ---- the ring layer, pushed in about Clawd's face
  g.save();
  g.translate(cam.fx, cam.fy); g.scale(cam.z, cam.z); g.translate(-cam.fx, -cam.fy);
  spotBeam(g, t, { apex: [540, 690], ...pool });
  const lr = r01(t, K.you, K.you + .3);
  if (lr > 0 && lr < 1) burst(g, pool.x, pool.y - 10, 200, 200 + 300 * easeOut(lr, 2), t, { col: '#fff3a8', n: 18, prog: 1, w: 12 * (1 - lr * .6), seed: 12 });
  // the rosettes, lifting off and orbiting behind him, back to front
  const slots = Array.from({ length: 12 }, (_, i) => ({ i, ...orbitSlot(i, t, K) })).sort((a, b) => Math.sin(a.th) - Math.sin(b.th));
  const pulse = t > K.ili ? Math.exp(-(t - K.ili) / .14) * .2 : 0;
  slots.forEach(({ i, k, x, y, s }) => {
    if (k <= .01 || t >= K.you) return;
    const lit = clamp(1 - Math.hypot(x - pool.x, (y - pool.y) * 1.6) / (pool.rx * 1.1)) * (pool.k > 0 && t < K.you - .1 ? 1 : 0);
    const sc = s * (1 + pulse + lit * .28);
    g.save(); g.translate(x, y); g.scale(sc, sc); rosette(g, 0, 0, ORBIT.r, ROSETTES[i], t, { seed: 900 + i, tilt: Math.sin(t * 2 + i) * .15 + Math.cos(slots.length + i) * .05 }); g.restore();
    const dg = t - K.ili - i * .012;
    if (dg > 0 && dg < .3) sparkle(g, x + 34 * sc, y - 36 * sc, 22 * (1 - dg / .3), t, { seed: 1000 + i, rot: dg * 5 });
  });
  for (let i = 0; i < 12; i++) {
    const tl = K.lift + i * .05, d = t - tl;
    if (d > 0 && d < .24) { const o0 = orbitSlot(i, tl, K); sparkle(g, o0.x, o0.y + 26, 24 * (1 - d / .24), t, { seed: 990 + i, rot: d * 7, col: '#fff3b0' }); }
  }
  // Clawd: conducting the lift, tracking the beam, pointing at you, then begging in close-up
  const V = K.V, bob = gr.bob * .6 / cam.z, up = kf(t, [[V(0) - .3, .2], [V(0), .95]]);
  const face = t > K.you + .15 ? 1 : 0;
  const pt = [C6.x + 170 * C6.s, C6.y + 60 * C6.s];
  judgeClawd(g, t, cx, {
    x: C6.x, y: C6.y, s: C6.s, bob, squash: gr.sq * .6, lean: gr.lean * .6, legs: C6.run > 0 && C6.run < 1 ? (t * 5) % 1 : 0,
    mouth: t > ws[9].e + .08 ? 0 : clamp(cx.vox * 1.4),
    eyes: t < K.t0 + .35 ? 'wide' : t < K.ili ? 'open' : t < K.ili + .4 ? 'happy' : 'wide', sweat: t < K.t0 + .35, look: t < K.you ? [Math.sign(pool.x - C6.x) * .5, -.45] : [0, .15],
    brow: face * .8, raise: face * .3, cheeks: face > 0,
    armL: { up: t < K.you ? up * .9 : .55, out: .3 },
    armR: t >= K.you - .05 ? { to: [lerp(toLocal(C6, bob, pt[0], pt[1])[0], 200, r01(t, K.you + .3, K.you + .55)), lerp(toLocal(C6, bob, pt[0], pt[1])[1], -200, r01(t, K.you + .3, K.you + .55))], reach: 300 } : { up: up, out: .3 },
    prop: (g2, po) => {
      tipHat(g2, t, po, 26 * zk, -.08 * zk);
      const pk = r01(t, K.you - .05, K.you + .05) * (1 - r01(t, K.you + .28, K.you + .5));
      if (pk > 0) pointingHand(g2, t, po.hR, Math.atan2(po.hR[1] + 152, po.hR[0] - 142), { k: pk });
      eyeStars(g2, t, { k: face });
    },
  });
  // three marks jump off his head as the light lands on you
  const em = r01(t, K.you, K.you + .06) * (1 - r01(t, K.you + .18, K.you + .3));
  if (em > 0) for (let i = 0; i < 3; i++) {
    const a = -2.55 + i * .45, x0 = C6.x - 150 * C6.s, y0 = C6.y - 250 * C6.s;
    line(g, [[x0 + Math.cos(a) * 60, y0 + Math.sin(a) * 60], [x0 + Math.cos(a) * 125, y0 + Math.sin(a) * 125]], { w: 11, col: C.orange, seed: 1010 + i, t, spline: false, passes: 1, taper: [.1, .5], alpha: em });
  }
  // the twelve rosettes rush at you (in front of him) and fly out past the camera
  if (t >= K.you) for (let i = 0; i < 12; i++) {
    const o0 = orbitSlot(i, K.you, K), q = easeIn(r01(t, K.you + i * .012, K.you + i * .012 + .34), 2.2);
    if (q >= 1) continue;
    const x = lerp(o0.x, 540 + (o0.x - 540) * 3.4, q), y = lerp(o0.y, 1200 + (o0.y - 1200) * 2.6 + 260, q), sc = lerp(o0.s, 2.8, q);
    g.save(); g.translate(x, y); g.scale(sc, sc); rosette(g, 0, 0, ORBIT.r, ROSETTES[i], t, { seed: 900 + i, tilt: q * .5 }); g.restore();
  }
  g.restore();
  // ---- the drum hit: a flash of light
  softGlow(g, 540, 1130, 1250, '#fffbe0', .6 * hit('drums', t, .07));
  // ---- twinkles round his face in the close-up
  const tw = zk * (1 - r01(t, K.hit, K.hit + .2));
  if (tw > .05) for (let i = 0; i < 7; i++) {
    const a = TAU * i / 7 + .4, rr = 430 + 60 * hash(i, 5), ph = .5 + .5 * Math.sin(t * 5 + i * 2.1);
    sparkle(g, 540 + Math.cos(a) * rr * 1.05, 1170 + Math.sin(a) * rr * .72, (10 + 16 * ph) * tw, t, { seed: 980 + i, rot: t * 1.5 + i });
  }
  // ---- and twelve rosettes pop onto their places round him, in a quick ripple (in front, round the edge of the picture)
  if (hb > 0) for (let i = 0; i < 12; i++) {
    const a = TAU * i / 12 - Math.PI / 2 + .26, k = pop(t, K.hit + i * .011, .2);
    if (k <= 0) continue;
    g.save(); g.translate(540 + Math.cos(a) * 500, 1140 + Math.sin(a) * 350 + Math.sin(t * 3 + i) * 5); g.scale(k * (1 + gr.bp * .05), k * (1 + gr.bp * .05));
    rosette(g, 0, 0, 58, ROSETTES[i], t, { seed: 900 + i, tilt: Math.sin(a) * .3 + Math.sin(t * 3 + i) * .06 }); g.restore();
  }
}
