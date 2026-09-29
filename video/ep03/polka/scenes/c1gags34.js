// Chorus 1's third and fourth gags (builder "c1a"): "Ship it by Sunday; it's a pain to change, and slow;" and
// "Save on the checking, and the bugs can wreck the show;". Each is drawn while its line is current, from
// about 0.45 s before its first word, and every time comes from the line's words (`ws`), so chorus 2 can call
// the same functions on its own line, with `cast` swapping who does what.
//   gag 3: a crate ship races in with Clawd at the wheel and halts, hoisting a SUN flag on "Sunday;"; on "pain to
//          change" he turns the wheel and it comes off in his hands, throwing him head over heels; on "slow;" the
//          ship goes off in a puff and there is a snail carrying a crate marked CHANGES.
//   gag 4: a piggy bank grins beside a CHECKING booth that is back in five minutes; on "bugs" a marching line
//          of beetles and fleas comes in through the gate and swarms the ring; on "wreck" the rope and bunting fall.
import { TAU, clamp, lerp, hash, easeOut, easeInOut, beatTimes } from '../kit.js';
import { sparkle, burst } from '../props.js';
import { spring, ease } from '../life.js';
import { SPOT, judgeClawd, bowler } from '../ringcast.js';
import { ship, SHIP, helmWheel, puff, snail, booth, piggy, bug, coin, garland, flagTri } from '../props-c1a.js';
import { GRAPHITE, C } from '../palette.js';

// ------------------------------------------------------------------- 3 "Ship it by Sunday; it's a pain to change, and slow;"
const SHIP_AT = { x: 600, y: 1345 };            // where the ship comes to rest (its own layout is SHIP in props-c1a.js)
const CLAWD_S = .8;                              // Clawd's size aboard

export function gag3(g, t, ws, cx, cast = {}) {
  const V = i => ws[i].s - .085;                 // when the picture for word i has landed
  const J = SPOT.judge, ink = cast.ink || GRAPHITE;
  const tIn = ws[0].s - .62, tStop = ws[2].s - .02, tFlag = V(3), tPain = V(6), tTo = V(7), tPop = V(8), tSlow = V(10);
  const tLand = tPop + .36, tStand = tSlow + .55, tDrop = tStand + .12;
  const { x: RX, y: RY } = SHIP_AT;
  // The ship: it runs in from the left on the first beat and brakes on "by".
  const u = clamp((t - tIn) / (tStop - tIn)), run = t < tStop;
  const sx = lerp(-340, RX, easeOut(u, 2.2)), fast = run ? Math.pow(1 - u, 1.1) : 0;
  const d = Math.max(0, t - tStop), strain = ease(t, tTo, tPop), lost = ease(t, tPop, tPop + .35);
  const roll = (run ? -.05 * fast : .1 * Math.exp(-d * 8) * Math.cos(d * 22)) + cx.gr.lean * .7 + Math.sin(t * 5.2) * .012 + Math.sin(t * 60) * .018 * strain * (t < tPop ? 1 : 0);
  const sy = RY - cx.gr.bob * .3;
  const flag = t < tFlag - .06 ? 0 : Math.min(1.15, spring(t, tFlag - .06, { f: 3.2, z: .36 }));
  // The wheel: steered a little on the run, turned as far as it will go on "pain", jammed on "to", pulled off on "change,".
  let ang = run ? Math.sin(t * 2.3) * .14 : 0;
  if (t >= tPain) ang = lerp(ang, 1.05, ease(t, tPain, tTo));
  if (t >= tTo) ang += Math.sin((t - tTo) * 50) * .06 * strain;
  const wdx = -22 * ease(t, tTo + .04, tPop);
  // The captain: Clawd on the deck, cheering on "Sunday;", then both hands on the wheel.
  const cheer = t > tFlag - .1 && t < tPain - .12;
  const crew = g2 => {
    const grip = { to: [(158 + wdx) / CLAWD_S, -152], reach: 30 };
    const o = { x: SHIP.stern, y: SHIP.deck, s: CLAWD_S, eyes: t < tPain ? 'happy' : 'squint', brow: t < tPain ? 0 : .5 + .5 * strain, raise: cheer ? .3 : 0, sweat: t > tTo,
      look: t < tPain ? [.6, 0] : [.9, .3], lean: cx.gr.lean - .13 * strain, squash: cx.gr.sq + strain * .9,
      armR: cheer ? { up: .95, out: .3 } : grip, armL: cheer ? { up: .95 } : { up: t < tPain ? .8 : .1 } };
    if (cast.captain) cast.captain(g2, t, cx, o); else judgeClawd(g2, t, cx, o);
  };
  if (t < tSlow + .06) {
    ship(g, t, { x: sx, y: sy, roll, flag, phase: t * 7, bulge: 26 + 34 * fast - 46 * lost, fast, droop: lost, wheel: t < tPop ? { ang, dx: wdx } : null, crew: t < tPop ? crew : null, ink });
  }
  // "to": the strain shows as lines shivering round the wheel.
  if (strain > 0 && t < tPop) burst(g, sx + SHIP.wheel[0] + wdx, sy + SHIP.wheel[1], 96, 96 + 26 * strain, t, { col: ink, n: 10, prog: 1, w: 6, seed: 3040, rot: Math.sin(t * 30) * .12 });
  // "change,": the axle snaps, and there is a star of splinters.
  if (t >= tPop && t < tPop + .3) { const p = (t - tPop) / .3; g.save(); g.globalAlpha *= 1 - p * .6; burst(g, RX + SHIP.wheel[0] - 10, RY + SHIP.wheel[1], 30, 150, t, { col: C.yellow, n: 12, prog: easeOut(p), seed: 3050, w: 10 }); g.restore(); }
  // "Sunday;": a shine at the flag.
  if (t > tFlag - .04 && t < tFlag + .3) { const p = (t - tFlag + .04) / .34; sparkle(g, RX - 70, RY - 640, 26 * (1 - p), t, { seed: 3060, rot: p * 5 }); sparkle(g, RX + 175, RY - 690, 20 * (1 - p), t, { seed: 3061, rot: -p * 5, col: C.orange }); }
  // Clawd thrown off backwards, still holding the wheel; then sitting dazed, then up and rid of it.
  if (t >= tPop) {
    const q = clamp((t - tPop) / (tLand - tPop)), dl = t - tLand;
    const x0 = RX + SHIP.stern, y0 = RY + SHIP.deck;
    let px = lerp(x0, J.x, easeOut(q, 1.5)), py = lerp(y0, J.y, q) - Math.sin(q * Math.PI) * 300, s = lerp(CLAWD_S, J.s, q), a = -TAU * easeInOut(q), sq = 0, bob = 0;
    if (q >= 1) { px = J.x; py = J.y; s = J.s; a = 0; sq = 1.7 + 1.3 * Math.exp(-dl * 8) * Math.cos(dl * 20); if (t >= tStand) { const k = spring(t, tStand, { f: 2.8, z: .4 }); sq = 1.7 * Math.max(0, 1 - k); bob = 44 * Math.sin(clamp((t - tStand) / .32) * Math.PI); } }
    const dizzy = q >= 1 && t < tSlow + .05, atSnail = t > tSlow;
    if (dl > 0) puff(g, t, J.x + 20, J.y - 30, 105, dl / .4, { seed: 3090, ink, rise: 30 });
    const eyes = q < 1 ? 'wide' : t < tLand + .32 ? 'x' : t < tStand ? (atSnail ? 'half' : 'squint') : 'squint';
    const wheelR = SHIP.wheelR / CLAWD_S;
    const holds = t < tDrop;
    g.save(); g.translate(px, py - 125 * s); g.rotate(a); g.translate(-px, -(py - 125 * s));
    const o = { x: px, y: py, s, eyes, brow: q >= 1 ? .6 : -.4, raise: q < 1 ? .8 : 0, squash: sq, bob, lean: q >= 1 && t < tStand ? -.1 : cx.gr.lean, look: atSnail ? [-.9, .3] : [0, 0],
      armR: { up: q < 1 ? .9 : .4, out: .5 }, armL: q < 1 ? { up: .9 } : { up: t < tStand ? .95 : .1 },
      prop: (g2, po) => { bowler(g2, t, po); if (holds) helmWheel(g2, t, po.hR[0] + wheelR * .9, po.hR[1] - 4, wheelR, { ang: t * 5, seed: 3070, ink }); } };
    if (cast.captain) cast.captain(g, t, cx, o); else judgeClawd(g, t, cx, o);
    g.restore();
    // Stars go round his head; a puff where he lands.
    if (dizzy && dl > 0 && dl < .6) for (let i = 0; i < 3; i++) { const b = t * 8 + i * TAU / 3; sparkle(g, px + Math.cos(b) * 120, py - 395 + Math.sin(b) * 26, 17, t, { seed: 3080 + i, rot: b }); }
  }
  // "slow;": a puff where the ship was, and the snail with its crate marked CHANGES, squashing up out of it.
  if (t > tSlow - .1) puff(g, t, RX + 50, 1250, 330, (t - (tSlow - .1)) / .62, { seed: 3100, ink, lw: 5 });
  if (t >= tSlow + .05) {
    const k = spring(t, tSlow - .02, { f: 2.6, z: .3 }), ssy = clamp(k, .02, 1.4), ssx = 1 + (1 - Math.min(k, 1.4)) * .55, dt = t - tSlow;
    g.save(); g.translate(RX + 95 + dt * 38, 1372); g.scale(.92 * ssx, .92 * ssy);
    snail(g, t, { seed: 3110, ink, crawl: dt * 1.1, look: [-1, .3], sad: 1, wobble: Math.sin(t * 3.4) * .04 + .07 * Math.exp(-dt * 3) });
    g.restore();
  }
  // The wheel, dropped, rolls away in front of it all.
  if (t >= tDrop) { const dt = t - tDrop; helmWheel(g, t, J.x + 250 + dt * 640, J.y - 62, 62, { ang: dt * 10, seed: 3070, ink }); }
}

// ------------------------------------------------------------------- 4 "Save on the checking, and the bugs can wreck the show;"
// ---- the bugs
const KINDS = ['beetle', 'lady', 'flea', 'stag', 'violet', 'lady', 'beetle', 'flea'];
const SWARM = Array.from({ length: 24 }, (_, i) => ({ kind: KINDS[(i * 3 + 1) % KINDS.length], lane: i % 2, s: (.95 + hash(i, 1) * .3) * (i % 2 ? .9 : 1.05), seed: 60 + i, tx: 100 + hash(i, 2) * 880, ty: 1235 + hash(i, 3) * 165, ph: hash(i, 4) * TAU, dl: hash(i, 5) * .25 }));
// The way in: from the gate (right), along the front of the ring, past the judge.
const PATH = [[1180, 1250], [1010, 1292], [860, 1345], [700, 1380], [520, 1394], [360, 1386], [200, 1362], [40, 1338]];
const pathY = x => { for (let k = 0; k < PATH.length - 1; k++) { const a = PATH[k], b = PATH[k + 1]; if (x <= a[0] && x >= b[0]) return lerp(a[1], b[1], (a[0] - x) / (a[0] - b[0])); } return x > PATH[0][0] ? PATH[0][1] : PATH[PATH.length - 1][1]; };

// The line of bugs, as {y, fn} items to be drawn back to front with everything else that stands in the ring: two
// abreast, marching in from the gate on the right in step (the first at tStart, a new one every `gap` s), then, once
// tBreak has come, each leaves the line and scatters over the ring (past the judge, on his side, in front of him).
export function bugItems(g, t, cx, o) {
  const { tStart, tBreak, ink = GRAPHITE, gap = .08, speed = 760 } = o;
  const items = [];
  SWARM.forEach((b, i) => {
    const Ti = tStart + i * gap;
    if (t < Ti) return;
    const td = Math.max(tBreak + b.dl, Ti + .5), tm = Math.min(t, td);
    const marchX = tt => 1190 - speed * (tt - Ti), marchY = xx => pathY(xx) + (b.lane ? 22 : -14);
    let x = marchX(tm), y = marchY(x), flip = -1, walk = x / 46, hp = (cx.gr ? cx.gr.bob : 0) * .35, look = -1;
    if (t > td) {
      const e = ease(t, td, td + .7), x0 = marchX(td), y0 = marchY(x0), ty = b.tx < 470 ? 1432 + (b.ty - 1235) * .3 : 1325 + (b.ty - 1235) * .58;   // in front of the judge, or in the front strip so the pig's face and the sign stay clear
      const wx = Math.sin(t * 2.3 + b.ph) * 26 * e, wy = Math.sin(t * 1.7 + b.ph * 2) * 9 * e;
      x = lerp(x0, b.tx, e) + wx; y = lerp(y0, ty, e) + wy;
      flip = (b.tx - x0 + Math.cos(t * 2.3 + b.ph) * 30) >= 0 ? 1 : -1; look = flip; walk = t * 3.2 + i * .3; hp = 0;
      if (b.kind === 'flea') hp = Math.abs(Math.sin(t * 6 + b.ph)) * 44 * e;
    }
    items.push({ y, fn: () => bug(g, t, x, y, b.s, { kind: b.kind, walk, flip, seed: b.seed, ink, hop: hp, look, squash: hp > 2 && hp < 10 ? .5 : 0 }) });
  });
  return items;
}

// ---- the collapse
// The ropes and bunting that come down: where each ends up (left to right), how many flags it has, which end lets go
// first, and whether it lies behind the ring's cast once it has landed.
const ROPES = [
  { R: [[20, 1334], [150, 1384], [280, 1352], [400, 1404], [520, 1372], [640, 1414]], flags: 6, size: 62, order: 1, rope: '#8b5f2a' },
  { R: [[1060, 1180], [960, 1150], [850, 1190], [740, 1130], [640, 1104], [540, 1140]], flags: 6, size: 60, order: -1, rope: '#8b5f2a', back: true },
  { R: [[120, 1240], [300, 1272], [450, 1238], [600, 1270], [760, 1242], [930, 1286], [1050, 1252]], flags: 0, size: 0, order: 1, rope: C.red, w: 12, back: true },
];
const landed = (r, t, tW) => r.back && t > tW - .48 + (r.R.length - 1) * .035 + .5;
function drawRope(g, t, r, ri, tW, ink) {
  const t0 = tW - .48;
  const P = r.R.map((p, k) => {
    const kk = r.order > 0 ? k : r.R.length - 1 - k, tk = t0 + kk * .035, q = clamp((t - tk) / .46), dd = t - tk - .46;
    let y = lerp(600 - k * 8, p[1], q * q);
    if (q >= 1) y -= Math.exp(-dd * 7) * Math.abs(Math.sin(dd * 16)) * 24;
    return [p[0] + Math.sin((t - t0) * 9 + k * 1.3) * 26 * (1 - q), y];
  });
  garland(g, t, P, { flags: r.flags, size: r.size, seed: 3200 + ri * 20, ink, rope: r.rope, w: r.w || 9, flutter: t < tW + .1 ? .5 : .12 });
}
// layer 'back': the ropes that have landed, drawn before the cast. layer 'front': ropes still falling, loose flags
// (the first lands on the judge's bowler at hat) and the dust where it all lands, drawn after.
export function collapse(g, t, tW, layer, o = {}) {
  const { ink = GRAPHITE, hat = [SPOT.judge.x + 50, SPOT.judge.y - 352] } = o;
  if (t <= tW - .62) return;
  if (layer === 'back') { ROPES.forEach((r, ri) => { if (landed(r, t, tW)) drawRope(g, t, r, ri, tW, ink); }); return; }
  ROPES.forEach((r, ri) => { if (!landed(r, t, tW)) drawRope(g, t, r, ri, tW, ink); });
  [[hat[0], hat[1], .5], [430, 1420, -.7], [720, 1425, .6], [990, 1370, -1.0], [560, 1215, .4]].forEach(([lx, ly, rot], i) => {
    const q = clamp((t - (tW - .43 + i * .05)) / .5), y = lerp(560, ly, q * q);
    flagTri(g, t, lx + Math.sin(t * 8 + i) * 34 * (1 - q), y, 56, rot * (1 - q) + Math.sin(t * 9 + i) * .4 * (1 - q) + q * rot * .6, [C.red, C.yellow, C.blue, C.green, C.orange][i], { seed: 3300 + i, ink });
  });
  [[300, 1350], [900, 1330], [640, 1190]].forEach(([dx, dy], i) => puff(g, t, dx, dy, 100, (t - (tW - .05 + i * .04)) / .6, { seed: 3400 + i * 30, ink, rise: 30 }));
}

export function gag4(g, t, ws, cx, cast = {}) {
  const V = i => ws[i].s - .085;
  const J = SPOT.judge, ink = cast.ink || GRAPHITE;
  const B = beatTimes(), bi = B.findIndex(b => b >= ws[0].s - .06), bHit = B[bi], beatS = B[bi + 1] - bHit;
  const tHop1 = bHit - beatS, tHop2 = bHit, tBooth = V(3), tBugs = V(6), tW = V(8);
  const BX = 615, BY = 1292, BS = .95, PX = 925, PY = 1300, PS = .82;
  // The piggy bank hops in through the gate on two beats, and grins; a coin drops into its slot on each beat after.
  let px, py = PY;
  if (t < tHop1) { const a = tHop1 - beatS * .85, q = clamp((t - a) / (tHop1 - a)); px = lerp(1330, 1040, q); py = PY - Math.sin(q * Math.PI) * 150; }
  else if (t < tHop2) { const q = (t - tHop1) / (tHop2 - tHop1); px = lerp(1040, PX, q); py = PY - Math.sin(q * Math.PI) * 170; }
  else px = PX;
  const coins = [bHit + beatS, bHit + 2 * beatS];
  const nCoin = coins.filter(c => t >= c).length;
  let pigSq = t > tHop2 ? 1.4 * Math.exp(-(t - tHop2) * 9) * Math.cos((t - tHop2) * 22) : 0;
  coins.forEach(c => { if (t >= c) pigSq += .8 * Math.exp(-(t - c) * 10) * Math.cos((t - c) * 24); });
  if (t > tW) pigSq += 1.3 * Math.exp(-(t - tW) * 8) * Math.cos((t - tW) * 22);
  const scared = t > tBugs + .12;
  const grin = clamp(.35 + ease(t, tHop2, tHop2 + .25) * .3 + nCoin * .17);
  // The booth drops from the sky on "checking,", squashes, and its sign swings.
  const drop = clamp((t - (tBooth - .3)) / .3), bd = Math.max(0, t - tBooth), wd = Math.max(0, t - tW);
  const bsq = t > tBooth ? 1 - .16 * Math.exp(-bd * 9) * Math.cos(bd * 26) : 1;
  const bsw = (t > tBooth ? .35 * Math.exp(-bd * 4.5) * Math.sin(bd * 17) : 0) + (t > tW ? .3 * Math.exp(-wd * 4) * Math.sin(wd * 17) : 0);
  // Clawd: watches the pig, jumps at the booth and reads its sign (deadpan), then sees the bugs.
  const sees = t > tBugs, buried = t > tW;
  const lookJ = sees ? [1.1, .5] : t > tBooth ? [.7, -.2] : [.9, .1];
  const hopJ = t > tBooth - .02 && t < tBooth + .3 ? 46 * Math.sin((t - tBooth + .02) / .32 * Math.PI) : 0;
  const clawdArgs = { eyes: sees ? 'wide' : t > tBooth + .4 ? 'half' : t > tBooth - .02 ? 'open' : 'open', brow: sees ? -.3 : t > tBooth + .4 ? .5 : .25, raise: sees ? 1 : t > tBooth - .02 && t < tBooth + .35 ? .9 : 0, sweat: t > V(7), look: lookJ, bob: cx.gr.bob + hopJ,
    armL: sees ? { up: .95, out: .4 } : { up: .2 }, armR: sees ? { up: .95, out: .4 } : { up: .1 }, squash: buried ? cx.gr.sq + 1.2 * Math.exp(-wd * 3) : cx.gr.sq };
  collapse(g, t, tW, 'back', { ink });
  // Everything that stands in the ring is drawn back to front.
  const items = [];
  if (t > tBooth - .3) items.push({ y: BY, fn: () => { g.save(); g.translate(BX, BY - (1 - drop * drop) * 760); g.scale(BS * (1 + (1 - bsq) * .6), BS * bsq); booth(g, t, { seed: 1600, ink, swing: bsw }); g.restore(); } });
  items.push({ y: PY, fn: () => {
    g.save(); g.translate(px, py); g.scale(PS * (1 + pigSq * .05), PS * (1 - pigSq * .06));
    piggy(g, t, { seed: 1700, ink, flip: -1, grin: scared ? .5 : grin, eyes: scared ? 'wide' : 'happy', sweat: scared, look: scared ? [1, .4] : [0, 0], tail: t * 5 });
    g.restore();
    coins.forEach((c, i) => { const q = (t - (c - .3)) / .3; if (q > 0 && q < 1) coin(g, t, px + 6, lerp(py - 700, py - 192, q * q), 34, t * 14 + i, { seed: 1750 + i, ink }); });
  } });
  items.push({ y: J.y, fn: () => { if (cast.judge) cast.judge(g, t, cx, clawdArgs); else judgeClawd(g, t, cx, clawdArgs); } });
  items.push(...bugItems(g, t, cx, { tStart: tBugs - .4, tBreak: tW, ink }));
  // Six that have found somewhere high to sit: the pig's back, the judge's bowler, the CHECKING sign, the judge's shoulder, the pig's head, the awning.
  [[tW + .35, px - 26, py - 190 * PS, 'lady', -1], [tW + .6, J.x + 14, J.y - 372, 'beetle', 1], [tW + .85, BX - 70, BY - 340 * BS, 'stag', -1], [tW + 1.05, J.x + 175, J.y - 200, 'violet', 1], [tW + 1.2, px - 118, py - 150 * PS, 'flea', -1], [tW + 1.35, BX + 120, BY - 236 * BS, 'lady', 1]].forEach(([t0, ex, ey, kind, fl], i) => {
    if (t < t0) return;
    const k = spring(t, t0, { f: 3, z: .4 });
    items.push({ y: 9999, fn: () => bug(g, t, ex, ey, .75 * k, { kind, flip: fl, seed: 90 + i, ink, walk: t * 2 + i, look: fl }) });
  });
  items.sort((a, b) => a.y - b.y).forEach(it => it.fn());
  // Dust where the booth lands.
  [[BX - 140, BY + 8], [BX + 140, BY + 8]].forEach(([dx, dy], i) => puff(g, t, dx, dy, 72, (t - tBooth) / .5, { seed: 1520 + i * 20, ink, rise: 20 }));
  collapse(g, t, tW, 'front', { ink });
}
