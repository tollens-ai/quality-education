// Chorus 2's fifth and sixth gags, by night, with the tables turned (a builder's file). The same two gags as chorus 1's
// (c1gags56.js), told from the other side: the bulldog judge in his bowler is the one with the tools, and Clawd sits on
// the table being judged.
//   5  "Polish one part, and then another takes a blow:" the bulldog rubs one of Clawd's feet with a cloth until it
//      gleams; then he takes up a blow-dryer and blasts him (Clawd leans away, squashes, his eyes shut and mouth
//      flapping, crumbs of terracotta blowing off), while the polished foot twinkles on, perfect.
//   6  "Which of the "ilities" are yours? I've got to know!" the twelve rosettes lift off and orbit Clawd, a spotlight
//      sweeps the ring and lands on the viewer, the bulldog turns to look at you and points, and the picture pushes in
//      to Clawd's face; a drum hit bursts the rosettes round him.
// Both gags are one drawing, `stage()` (the table, Clawd, the bulldog, his arm, the dryer), played from the words'
// times, so that gag 6 opens on the last frame of gag 5's blast and Clawd shakes it off while the rosettes lift.
import { W, TAU, clamp, lerp, inv, hash, easeOut, easeIn, easeInOut, smooth, hit, lastHit, words } from '../kit.js';
import { line, scrub } from '../pencil.js';
import { rosette, sparkle, burst } from '../props.js';
import { pop } from '../common.js';
import { spring, gate } from '../life.js';
import { SPOT, ROSETTES, judgeBulldog, bowlerDog, subjectClawd, tableFront } from '../ringcast.js';
import { spotlight } from '../ring.js';
import { dryer, DRYER, cord, windStreaks, spotBeam, softGlow, rays, eyeStars } from '../props-c1b.js';
import { keys6, pool6 } from './c1gags56.js';
import { bulldogArm, bulldogPaw, rag, rubMarks, gleamLeg, flecks, puff, clickMarks, pointPaw } from '../props-c2b.js';
import { C } from '../palette.js';

const r01 = (t, a, b) => clamp((t - a) / (b - a));
// Piecewise-linear keyframes [[t, v], ...], each leg eased.
function kf(t, pts, ease = smooth) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], ease(r01(t, pts[i - 1][0], pts[i][0])));
  return pts[pts.length - 1][1];
}
// A point moving through waypoints [[t, [x, y]], ...], each leg eased.
function path(t, pts, ease = smooth) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const a = pts[i - 1], b = pts[i], u = ease(r01(t, a[0], b[0])); return [lerp(a[1][0], b[1][0], u), lerp(a[1][1], b[1][1], u)]; }
  return pts[pts.length - 1][1];
}

// ---------------------------------------------------------------- where everyone is (master pixels)
const CL = { x: 660, y: 1150, s: 1.28 };               // Clawd, on the table (subjectClawd's place, a little smaller)
const BD = { x: 185, y: 1410, s: 1.6 };                 // the bulldog, at the ring's edge on the left
const BD2 = { x: 175, y: 1500, s: 1.45 };               // and where he steps back to, to see the whole ring (gag 6)
const clPt = (lx, ly) => [CL.x + lx * CL.s, CL.y + ly * CL.s];       // a point in Clawd's own space, as he sits
const chinOf = b => b.y - 150 * (b.s / 1.7);            // judgeBulldog's chin
const shoulderOf = b => [b.x + 70 * b.s, chinOf(b) + 24 * b.s];      // his near shoulder
const RUB = clPt(-126, -20);                            // the front left foot, where the cloth rubs
const AIM = -.79;                                       // the dryer's angle when he aims it (up and to the right)
const SC = 1.15;                                        // the dryer's size

// ---------------------------------------------------------------- the times
export function keys5n(ws) {
  const V = i => ws[i].s - .085;
  return { V, t0: V(0) - .45, rub: V(0), burst: ws[2].s - .04, toss: V(3), pop: V(4), aim: V(5), on: V(6) - .06, blast: V(6), peak: V(8), off: ws[8].s + .19 };
}
// The day's keys, with the drum hit found in the record (it is at 107.99 here, 51.97 in chorus 1).
export function keys6n(ws) { return { ...keys6(ws), hit: lastHit('drums', ws[9].e + .3) }; }
let W5 = null;
const ws5 = () => W5 || (W5 = words('Chorus 2', 'Polish one part'));

// =================================================================== the stage
// Everything that stands in the ring for both gags. `K5` the times of gag 5, `K6` those of gag 6 (null in gag 5: nothing
// of gag 6 is drawn). `hooks`: first(g) before the table (the beam), back(g) before Clawd, front(g) after him.
function stage(g, t, cx, K5, K6, hooks = {}) {
  const gr = cx.gr;
  const fl = Math.cos(Math.PI * 15 * t) * .7 + Math.sin(TAU * 3.1 * t) * .3;         // flutter: alternates every drawing
  // ---- the blast: the air (`wind`) and how blown Clawd is (`bl`: 1 at full blast, then he shakes it off with a wobble)
  const ramp = r01(t, K5.on, K5.blast + .22);
  const wind = ramp * (1 - r01(t, K5.off, K5.off + .14));
  const bl = t < K5.off ? ramp : 1 - spring(t, K5.off, { f: 2.1, z: .3 });
  const jolt = hit('drums', t, .1) * clamp(bl * 1.5);
  // ---- the bulldog: walks in, and in gag 6 steps back
  const enter = easeOut(r01(t, K5.t0, K5.t0 + .42), 2.2);
  const back = K6 ? smooth(r01(t, K5.off + .05, K5.off + .6)) : 0;
  const B = { x: lerp(lerp(-150, BD.x, enter), BD2.x, back), y: lerp(BD.y, BD2.y, back), s: lerp(BD.s, BD2.s, back) };
  const S = shoulderOf(B), S2 = shoulderOf(BD2), k = B.s / 1.6;
  // ---- his hand
  const ready = [S[0] + 96 * k, S[1] - 70 * k];            // the cloth held up, ready
  const hip = [S[0] + 48 * k, S[1] - 23 * k];              // the dryer, at his side
  const aimP = [S[0] + 62 * k, S[1] - 36 * k];             // and raised to aim
  const rest = [S2[0] + 26, S2[1] + 96];                  // hanging by his side
  const dropAt = [RUB[0] - 58, RUB[1] + 44];
  const wp = [[K5.t0, ready], [K5.rub - .22, ready], [K5.rub, RUB], [K5.burst + .05, RUB], [K5.burst + .16, [RUB[0] - 30, RUB[1] + 40]], [K5.toss, dropAt], [K5.pop, hip], [K5.aim, aimP],
    [K5.off + .12, aimP], [K5.off + .46, rest]];
  let pointing = 0, pointAng = 0;
  if (K6) {
    // in gag 6 he lowers the dryer, steps back, and at "yours?" points a paw at the camera
    const P = [S2[0] + 150, S2[1] - 100];
    wp.push([K6.you - .3, rest], [K6.you - .02, P]);
    pointing = r01(t, K6.you - .3, K6.you - .02) * (1 - r01(t, K6.push + .35, K6.push + .6));
    pointAng = Math.atan2(1510 - P[1], 540 - P[0]);
  }
  let hand = path(t, wp);
  const rubbing = t > K5.rub && t < K5.burst + .05;
  const rubPh = (t - K5.rub) * 3.6;                                    // to and fro, 3.6 times a second
  if (rubbing) hand = [hand[0] + Math.sin(rubPh * TAU) * 30, hand[1] + Math.cos(rubPh * TAU * 2) * 5];
  // ---- the dryer
  const held = t >= K5.pop && t < K5.off + .24;
  const dryK = held ? pop(t, K5.pop, .2) * (1 - r01(t, K5.off + .1, K5.off + .24)) : 0;
  const rotD = kf(t, [[K5.pop, 1.25], [K5.aim, AIM]], x => easeOut(x, 2)) + (wind > .05 ? Math.sin(t * 60) * .012 : 0);
  const mo = [(DRYER.mouth[0] * Math.cos(rotD) - DRYER.mouth[1] * Math.sin(rotD)) * SC, (DRYER.mouth[0] * Math.sin(rotD) + DRYER.mouth[1] * Math.cos(rotD)) * SC];
  const nozzle = [hand[0] + mo[0], hand[1] + mo[1]];
  // ---- the shine on his foot
  const gk = r01(t, K5.rub + .05, K5.burst);
  const tw = clamp(.5 + .5 * Math.sin(t * 9) + gr.bp * .3);

  // ================================================================ draw
  if (hooks.first) hooks.first(g);
  spotlight(g, t, CL.x, SPOT.table.y, 340, { from: [CL.x - 200, 700], alpha: .2 });
  tableFront(g, t, true);
  if (hooks.back) hooks.back(g);

  // the cloth, once he has dropped it: it falls in front of the table and lies on the sawdust
  if (t >= K5.toss) {
    const q = r01(t, K5.toss, K5.toss + .34);
    const rx = lerp(dropAt[0], 452, easeOut(q, 1.4)), ry = lerp(dropAt[1], 1438, q * q), sq = q >= 1 ? Math.exp(-(t - K5.toss - .34) / .08) * .8 : 0;
    // (it is whisked away in a puff of dust once he steps back, so that nothing lies under his pointing paw)
    if (t < K5.off + .3) rag(g, t, rx, ry, { rot: q * 4.5 + .3, s: 1, seed: 71, sq });
    else puff(g, t, rx, ry, r01(t, K5.off + .3, K5.off + .6), { r: 30, seed: 96 });
  }
  // the cord, along the ground to the plug off to the left
  if (dryK > .02) {
    const hx = hand[0] - 12, hy = hand[1] + 50;
    cord(g, t, [[hx, hy], [hx - 4, hy + 62], [250, 1452], [80, 1478], [-60, 1470]], { w: 10, col: '#d8cfae' });
  }
  // the polished foot glows softly (it goes on shining while the rest of him is blown about)
  const fg = smooth(r01(t, K5.burst, K5.burst + .3)) * (K6 ? 1 - r01(t, K6.push, K6.push + .2) : 1);
  if (fg > .01) {
    const fp = clPt(-130, -14), sl0 = bl * 34 * (1 + .3 * smooth(r01(t, K5.peak - .05, K5.peak + .12)));       // (where his foot is: he slides in the blast)
    softGlow(g, fp[0] + sl0, fp[1] - 10, 120, '#fff3c4', .34 * fg * (.7 + .3 * tw));
  }
  // wind that passes behind him
  const streaks = (pick) => windStreaks(g, t, { x: nozzle[0], y: nozzle[1], ang: rotD - .02, len: 660, spread: .9, n: 14, w: 18, k: wind * (1 + .1 * Math.sin(t * 20)), seed: 31, col: '#9ccbf0', pick });
  if (wind > .01) streaks(i => i % 3 !== 1);

  // ---- Clawd, on the table
  const bAbs = Math.abs(bl), calm = 1 - clamp(bAbs);
  const flap = wind > .05;
  // his acting, in phases: waits, is polished (happy), is amazed by the shine, admires it, notices the dryer (uh-oh),
  // sees it aimed (worry), is blasted (eyes shut, mouth flapping, arms flailing), then is dazed and shakes it off
  const phase = t < K5.rub - .1 ? 'wait' : t < K5.burst ? 'rub' : t < K5.burst + .16 ? 'amazed' : t < K5.pop ? 'admire' : t < K5.aim ? 'notice' : t < K5.on ? 'worry' : t < K5.off + .12 ? 'blast' : 'dazed';
  let eyes = 'open', brow = 0, look = [-.8, .2], cheeks = false, sweat = false, armL = { up: .35, out: .2 }, armR = { up: .5, out: .2 };
  if (phase === 'rub') { eyes = 'happy'; cheeks = true; look = [-.5, .6]; armL = { up: .25, out: .2 }; armR = { up: .7, out: .3 }; }
  else if (phase === 'amazed') { eyes = 'wide'; cheeks = true; armL = { up: .3, out: .2 }; armR = { up: .9, out: .3 }; }
  else if (phase === 'admire') { eyes = 'happy'; cheeks = true; armL = { up: .3, out: .2 }; armR = { up: .95, out: .3 }; }
  else if (phase === 'notice') { brow = .5; look = [-.9, .5]; armL = { up: .4, out: .2 }; armR = { up: .5, out: .2 }; }
  else if (phase === 'worry') { eyes = 'wide'; brow = .9; sweat = true; look = [-.9, .5]; armL = { up: .95, out: .3 }; armR = { up: .95, out: .3 }; }
  else if (phase === 'blast') { eyes = 'shut'; brow = .8; armL = { up: .82 + .12 * fl, out: .3 }; armR = { to: [120 + fl * 30, -262 + fl * 10], reach: 52 }; }
  else if (phase === 'dazed') { eyes = K6 && t >= K6.lift - .05 ? 'open' : t < K5.off + .3 ? 'shut' : 'half'; look = [0, 0]; armL = { up: .2, out: .2 }; armR = { up: .2, out: .2 }; }
  let mouthO = {};
  if (flap) mouthO = { mouth: fl > 0 ? .62 : .14 };
  let clawdExtra = {};
  if (K6 && t >= K6.lift - .05) {
    const V = K6.V, up = kf(t, [[V(0) - .3, .2], [V(0), .95]]);
    const pool = pool6(t, K6), face = t > K6.you + .15 ? 1 : 0;
    eyes = t < K6.ili ? 'wide' : t < K6.ili + .4 ? 'happy' : 'wide'; brow = face * .8; cheeks = face > 0; sweat = false;
    look = t < K6.you ? [Math.sign(pool.x - CL.x) * .5, -.45] : [0, .15];
    armL = { up: t < K6.you ? up * .9 : .55, out: .3 }; armR = { up: t < K6.you ? up * .9 : .55, out: .3 };
    mouthO = { mouth: t > cx.lines[5][9].e + .08 ? 0 : clamp(cx.vox * 1.4) };
    clawdExtra = { raise: face * .3 };
  }
  const signed = bl;                                       // (negative for the wobble back the other way)
  const heave = 1 + .3 * smooth(r01(t, K5.peak - .05, K5.peak + .12));       // on "blow:" a last, bigger gust
  const gust = flap ? .05 * Math.sin(TAU * 2.2 * (t - K5.blast)) + .025 * fl : 0;   // it gusts: he leans in and out, and shudders
  const sh = (signed * .3 + gust * signed) * heave, sl = signed * 34 * heave;      // the wind bends him: his top goes downwind, his feet stay put and slide a little
  const leanIn = -.05 * clamp(r01(t, K5.rub - .2, K5.rub) - r01(t, K5.burst, K5.burst + .3));      // he leans towards the bulldog to be polished
  g.save(); g.translate(0, CL.y); g.transform(1, 0, -sh, 1, 0, 0); g.translate(0, -CL.y);
  subjectClawd(g, t, cx, {
    x: CL.x + sl + (flap ? Math.sin(t * 90) * 2.5 : 0), s: CL.s,
    lean: gr.lean * calm + leanIn + signed * (.07 + (flap ? .02 * fl : 0)),
    squash: gr.sq * calm + signed * (.5 + (flap ? .1 * fl : 0)) + .3 * jolt,
    bob: gr.bob * calm + (flap ? fl * 5 : 0),
    eyes, brow, look, cheeks, sweat, armL, armR, tuft: bAbs > .05, legs: 0, ...mouthO, ...clawdExtra,
    prop: (g2, po) => {
      gleamLeg(g2, t, { k: gk, tw, scuff: 1 - clamp(gk * 1.8) });
      if (K6) eyeStars(g2, t, { k: t > K6.you + .15 ? 1 : 0 });
    },
  });
  g.restore();
  if (hooks.front) hooks.front(g);

  // ---- the bulldog: eyes and brows for what he is doing
  let bEyes = 'dot', bBrow = 0, bMouth = 0, bLook = [.8, .2], bTongue = false, bTilt = 0;
  if (t >= K5.rub - .1 && t < K5.burst) { bEyes = 'squint'; bLook = [.7, .9]; bMouth = .1; bTongue = true; bTilt = .02 * Math.sin(rubPh * TAU); }
  else if (t >= K5.burst && t < K5.toss) { bEyes = 'happy'; bLook = [.6, .4]; bTilt = -.04; }
  else if (t >= K5.toss && t < K5.aim) { bEyes = 'dot'; bLook = [.9, -.1]; bBrow = .3; }
  else if (t >= K5.aim) { bEyes = 'squint'; bBrow = 1; bLook = [.9, -.3]; bTilt = wind > .05 ? Math.sin(t * 70) * .012 * wind : 0; }
  if (K6 && t >= K5.off + .22) {
    // gag 6: he looks at Clawd, is amazed by the rosettes, follows the beam, then turns to stare at you and points
    const pool = pool6(t, K6);
    const toYou = r01(t, K6.you - .2, K6.you - .02);
    const stare = t > K6.you - .05;
    bEyes = stare ? 'wide' : t < K6.lift - .1 ? 'dot' : t > K6.ili && t < K6.ili + .5 ? 'happy' : t < K6.beam ? 'wide' : 'dot';
    bBrow = stare ? .9 : t < K6.lift - .1 ? .3 : 0;
    bLook = [lerp(t < K6.lift - .1 ? .9 : t < K6.beam ? .6 : clamp((pool.x - B.x) / 420, -1, 1) * .9, 0, toYou), lerp(t < K6.lift - .1 ? -.1 : -.6, .95, toYou)];
    bMouth = !stare && t >= K6.lift - .1 && t < K6.ili ? .25 : 0; bTilt = -.04 * toYou;
  }
  const recoil = wind > .1 ? hit('drums', t, .1) : 0;                          // the dryer kicks on the drum hits
  if (K6 && t > K6.push + .45) return { B, S, hand, nozzle, wind, bl, pointing, pointAng };      // (the push-in has left him off the frame; the pull-back after the hit must not bring his arm back)
  // his bowler: tipped when the foot gleams, quivering with the dryer, popping up when he stares at you
  const tip = gate(t, K5.burst, K5.burst + .34, .09), pup = K6 ? gate(t, K6.you - .05, K6.you + .3, .08) : 0;
  const hatRot = -.2 * tip + (wind > .05 ? Math.sin(t * 70) * .035 * wind : 0), hatLift = 12 * tip + 26 * pup;
  const hat = (g2, top, rx) => { g2.save(); g2.translate(0, top + 20 - hatLift); g2.rotate(hatRot); g2.translate(0, -(top + 20)); bowlerDog(g2, top, rx, t); g2.restore(); };
  judgeBulldog(g, t, cx, { x: B.x - recoil * 6, y: B.y, s: B.s, eyes: bEyes, brow: bBrow, mouth: bMouth, tongue: bTongue, look: bLook, tilt: bTilt, squash: recoil * .1, hat,
    bob: enter < 1 ? Math.abs(Math.sin(t * TAU * 3)) * 14 * (1 - enter) : 0 });
  // his arm, the dryer or the cloth in his paw, the paw over it
  bulldogArm(g, t, S, hand, { seed: 60, s: k });
  if (dryK > .02) {
    g.save(); g.translate(hand[0], hand[1]); g.rotate(rotD); g.scale(SC * dryK, SC * dryK); g.translate(-DRYER.grip[0], -DRYER.grip[1]);
    dryer(g, t, { on: t >= K5.on ? 1 : 0 }); g.restore();
  }
  // (the cloth first, pressed on the foot, and his paw over it, so that it reads as a hand rubbing with a cloth)
  if (t < K5.toss && t >= K5.t0) rag(g, t, hand[0] + 2, hand[1] + 12, { rot: rubbing ? Math.sin(rubPh * TAU) * .12 : -.2, s: rubbing ? 1.05 : .8, seed: 70, sq: rubbing ? Math.sin(rubPh * TAU * 2) : 0 });
  if (pointing < .3) bulldogPaw(g, t, [hand[0], hand[1] - (rubbing ? 6 : 0)], { seed: 62, s: k * (rubbing ? .95 : 1), rot: rubbing ? -.3 : 0 });
  if (rubbing) rubMarks(g, t, hand[0], hand[1] + 10, { k: r01(t, K5.rub, K5.rub + .1), ph: rubPh });
  if (pointing > .02) pointPaw(g, t, hand, pointAng, { k: 1.6 * pointing, seed: 66 });

  // ---- the blast
  if (wind > .01) {
    streaks(i => i % 3 === 1);
    flecks(g, t, { x0: CL.x - 170 + sl + sh * 260, x1: CL.x + 210 + sl + sh * 170, y0: 850, y1: 1090, k: wind * clamp((t - K5.blast) / .25), n: 22, seed: 90, dx: 460, dy: -230 });
  }
  // ---- little marks: a puff and a click as the dryer appears, a click as it goes on, sparkles as the foot is polished
  const dp = r01(t, K5.pop, K5.pop + .3);
  if (dp > 0 && dp < 1) { puff(g, t, hand[0] + 30, hand[1] - 40, dp, { r: 32 }); clickMarks(g, t, hand[0] + 10, hand[1] - 20, dp, { a0: -Math.PI / 2 - .4 }); }
  const onp = r01(t, K5.on, K5.on + .26);
  if (onp > 0 && onp < 1) clickMarks(g, t, nozzle[0], nozzle[1], onp, { r0: 30, len: 40, a0: rotD - Math.PI / 2 - .3, spread: 1.6, seed: 99 });
  [K5.rub + .1, K5.rub + .22, K5.rub + .34, K5.rub + .46].forEach((tn, i) => {
    const d = t - tn;
    if (d > 0 && d < .38) sparkle(g, RUB[0] + (i % 2 ? 62 : -58), RUB[1] - 44 - i * 10, 44 * (1 - d / .38), t, { seed: 950 + i, rot: d * 6, col: '#fff3b0' });
  });
  const bd = t - K5.burst;
  if (bd > 0 && bd < .38) {
    const p = bd / .38, c = clPt(-126, -40);
    burst(g, c[0], c[1], 64, 170, t, { col: '#fff0a0', n: 10, prog: easeOut(p), w: 9, seed: 7 });
    sparkle(g, c[0] - 70, c[1] - 66, 46 * (1 - p), t, { seed: 960, rot: p * 4, col: '#fff3b0' });
    sparkle(g, c[0] + 86, c[1] - 50, 36 * (1 - p), t, { seed: 961, rot: -p * 4, col: '#fff3b0' });
  }
  return { B, S, hand, nozzle, wind, bl, pointing, pointAng };
}

export function gag5(g, t, ws, cx) { stage(g, t, cx, keys5n(ws), null); }

// =================================================================== 6 "Which of the "ilities" are yours? I've got to know!"
const ORB = { x: 650, y: 1000, rx: 370, ry: 165, r: 52 };
const PIV = [764, 732], ZM = 1.15;             // the push-in's pivot: Clawd's eyes come to (540, 1140) as it lands
// The rosettes' orbit: how far it has turned by time t (it speeds up as they lift off).
const spin6 = (t, t0) => { const u = t - t0, T = .6; return u <= 0 ? 0 : 3.1 * (u < T ? T * ((u / T) ** 3 - (u / T) ** 4 / 2) : T * .5 + u - T); };
function orbit6(i, t, K) {
  const O = ORB, phi = spin6(Math.min(t, K.you), K.lift), th = TAU * i / 12 + phi;
  const k = kf(t, [[K.lift + i * .05, 0], [K.lift + i * .05 + .4, 1]], x => easeOut(x, 2.4));
  const dep = .8 + .3 * (Math.sin(th) * .5 + .5);
  const x = O.x + O.rx * Math.cos(th), y = O.y + O.ry * Math.sin(th);
  return { th, k, x, y: lerp(y + 120, y, k), s: lerp(.3, 1, k) * dep };
}
// The camera: a push in on Clawd's face for "I've got to know!", with a kick on the drum hit (as in chorus 1).
function camN(t, K) {
  const z = 1 + ZM * kf(t, [[K.push, 0], [K.push + .42, 1]], easeInOut) + .08 * r01(t, K.push + .42, K.hit) - .55 * easeOut(r01(t, K.hit, K.hit + .35), 2.2) + .04 * hit('drums', t);
  return { z, fx: PIV[0], fy: PIV[1] };
}

export function gag6(g, t, ws, cx) {
  const K = keys6n(ws), K5 = keys5n(ws5()), gr = cx.gr;
  const cam = camN(t, K), pool = pool6(t, K);
  const zk = smooth(inv(1.15, 1.9, cam.z));
  // ---- the lights go down round the ring for the spotlight, and come up again for the close-up
  const dim = smooth(r01(t, K.beam - .3, K.beam + .1)) * (1 - smooth(r01(t, K.you, K.you + .3)));
  if (dim > .01) { g.save(); g.globalAlpha *= dim; scrub(g, [0, 700, W, 1540], { col: '#0a0f2e', seed: 55, t, gap: 24, w: 38, alpha: .34, angle: -.08, wig: 20 }); g.restore(); }
  // ---- behind the picture: the warm light of the close-up (screen space, so it fills the frame however far we push in)
  softGlow(g, 540, 1230, 900, '#ffe6a0', .78 * zk);
  rays(g, t, 540, 1230, { r0: 330, r1: 1350, k: zk * (.85 + .15 * gr.bp), w: 54 });
  const hb = t - K.hit, hq = easeOut(clamp(hb / .4), 2.6);
  if (hb > 0) burst(g, 540, 1180, 380, 380 + 500 * hq, t, { col: C.yellow, n: 18, prog: 1, w: 12, seed: 9 });
  // ---- the ring layer, pushed in about Clawd's face
  g.save();
  g.translate(cam.fx, cam.fy); g.scale(cam.z, cam.z); g.translate(-cam.fx, -cam.fy);
  const slots = Array.from({ length: 12 }, (_, i) => ({ i, ...orbit6(i, t, K) })).sort((a, b) => Math.sin(a.th) - Math.sin(b.th));
  const pulse = t > K.ili ? Math.exp(-(t - K.ili) / .14) * .2 : 0;
  const drawSlot = ({ i, k, x, y, s }) => {
    if (k <= .01 || t >= K.you) return;
    const lit = clamp(1 - Math.hypot(x - pool.x, (y - pool.y) * 1.6) / (pool.rx * 1.1)) * (pool.k > 0 && t < K.you - .1 ? 1 : 0);
    const sc = s * (1 + pulse + lit * .28);
    g.save(); g.translate(x, y); g.scale(sc, sc); rosette(g, 0, 0, ORB.r, ROSETTES[i], t, { seed: 900 + i, tilt: Math.sin(t * 2 + i) * .15 + Math.cos(slots.length + i) * .05 }); g.restore();
    const dg = t - K.ili - i * .012;
    if (dg > 0 && dg < .3) sparkle(g, x + 34 * sc, y - 36 * sc, 22 * (1 - dg / .3), t, { seed: 1000 + i, rot: dg * 5, col: '#fff3b0' });
  };
  stage(g, t, cx, K5, K, {
    first: g2 => { spotBeam(g2, t, { apex: [540, 690], ...pool }); },
    back: g2 => slots.filter(s => Math.sin(s.th) <= 0).forEach(drawSlot),
    front: g2 => slots.filter(s => Math.sin(s.th) > 0).forEach(drawSlot),
  });
  // the light lands on you: a burst at the foot of the picture
  const lr = r01(t, K.you, K.you + .3);
  if (lr > 0 && lr < 1) burst(g, pool.x, pool.y - 10, 200, 200 + 300 * easeOut(lr, 2), t, { col: '#fff3a8', n: 18, prog: 1, w: 12 * (1 - lr * .6), seed: 12 });
  // the lift-off: a glint as each rosette leaves the table
  for (let i = 0; i < 12; i++) {
    const tl = K.lift + i * .05, d = t - tl;
    if (d > 0 && d < .24) { const o0 = orbit6(i, tl, K); sparkle(g, o0.x, o0.y + 26, 24 * (1 - d / .24), t, { seed: 990 + i, rot: d * 7, col: '#fff3b0' }); }
  }
  // three marks jump off Clawd's head as the light lands on you
  const em = r01(t, K.you, K.you + .06) * (1 - r01(t, K.you + .18, K.you + .3));
  if (em > 0) for (let i = 0; i < 3; i++) {
    const a = -2.55 + i * .45, x0 = CL.x - 150 * CL.s, y0 = CL.y - 250 * CL.s;
    line(g, [[x0 + Math.cos(a) * 60, y0 + Math.sin(a) * 60], [x0 + Math.cos(a) * 125, y0 + Math.sin(a) * 125]], { w: 11, col: C.orange, seed: 1010 + i, t, spline: false, passes: 1, taper: [.1, .5], alpha: em });
  }
  // the twelve rosettes rush at you (in front of everything) and fly out past the camera
  if (t >= K.you) for (let i = 0; i < 12; i++) {
    const o0 = orbit6(i, K.you, K), q = easeIn(r01(t, K.you + i * .012, K.you + i * .012 + .34), 2.2);
    if (q >= 1) continue;
    const x = lerp(o0.x, 540 + (o0.x - 540) * 3.4, q), y = lerp(o0.y, 1200 + (o0.y - 1200) * 2.6 + 260, q), sc = lerp(o0.s, 2.8, q);
    g.save(); g.translate(x, y); g.scale(sc, sc); rosette(g, 0, 0, ORB.r, ROSETTES[i], t, { seed: 900 + i, tilt: q * .5 }); g.restore();
  }
  g.restore();
  // ---- the drum hit: a flash of light
  softGlow(g, 540, 1180, 1100, '#fff3c8', .3 * hit('drums', t, .07));
  // ---- twinkles round his face in the close-up
  const tw = zk * (1 - r01(t, K.hit, K.hit + .2));
  if (tw > .05) for (let i = 0; i < 7; i++) {
    const a = TAU * i / 7 + .4, rr = 430 + 60 * hash(i, 5), ph = .5 + .5 * Math.sin(t * 5 + i * 2.1);
    sparkle(g, 540 + Math.cos(a) * rr * 1.05, 1220 + Math.sin(a) * rr * .72, (10 + 16 * ph) * tw, t, { seed: 980 + i, rot: t * 1.5 + i, col: '#fff3b0' });
  }
  // ---- and twelve rosettes pop onto their places round him, in a quick ripple
  if (hb > 0) for (let i = 0; i < 12; i++) {
    const a = TAU * i / 12 - Math.PI / 2 + .26, k = pop(t, K.hit + i * .011, .2);
    if (k <= 0) continue;
    g.save(); g.translate(540 + Math.cos(a) * 500, 1190 + Math.sin(a) * 350 + Math.sin(t * 3 + i) * 5); g.scale(k * (1 + gr.bp * .05), k * (1 + gr.bp * .05));
    rosette(g, 0, 0, 58, ROSETTES[i], t, { seed: 900 + i, tilt: Math.sin(a) * .3 + Math.sin(t * 3 + i) * .06 }); g.restore();
  }
}
