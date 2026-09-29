// Chorus 3 (181.41-208.4): golden hour, the whole show at once. Where chorus 1 gave one gag a line and chorus 2 turned
// them round, chorus 3 plays them in three rings side by side, and the camera whips to each on its line while the
// crowd roars: A the twelve dogs on their marks, B the hurdle and the bugs, C the ship and the polish. After
// "Polish one part..." a hush of two and a half seconds: everything stops, the camera pulls right back on the three
// rings, every head turns to you and a spotlight comes down; then the last line in close-up on Clawd, and the held
// "know!" under fireworks and ribbons and the three rosettes that are his.
//   The lead-in (leadin.js) has put the twelve dogs on their marks. The board, its ball and Bruce are the layer both
//   parts share (props-c3.js: boardLayer). Gags 2-5 are chorus 1's, drawn into their ring by moving the canvas.
import { W, H, TAU, clamp, lerp, hash, inv, smooth, easeOut, easeIn, easeInOut, hit, loud, beatPulse } from '../kit.js';
import { shot } from '../shots.js';
import { paper } from '../paper.js';
import { rosette, sparkle, burst } from '../props.js';
import { pigeon } from '../world.js';
import { groove } from '../common.js';
import { spring } from '../life.js';
import { confetti, ROSETTES } from '../ringcast.js';
import { spotBeam, softGlow, eyeStars, pointingHand, rays } from '../props-c1b.js';
import { gag2, gag3, gag4, gag5 } from './chorus1.js';
import { GRAPHITE, C } from '../palette.js';
import * as P from '../props-c3.js';

const { RW, RC, GOLD, T_CRASH, DOZEN, WILT } = P;
const T_HUSH = 198.06;                       // "blow:" ends: everything stops
const T_ASK = 200.63;                        // "Which"
const T_KNOW = 204.70;                       // the held "know!"
const T_SWAP_B = 189.5, T_SWAP_C = 193.0;    // ring B changes from the hurdle to the bugs, ring C from the ship to the polish, while the camera is elsewhere
const T_FREEZE = 198.0;                      // rings B and C are held at this moment through the hush
const CLAWD = { x: 215, y: 1500, s: 1.0 };   // where he stands in ring A: the outro's place
// The three rosettes that are his, in the order they leave their dogs: [dog, colour, which hand (-1 left, 0 the bowler, 1 right)].
const FLY = [{ dog: 7, nm: 'blue', hand: -1 }, { dog: 8, nm: 'purple', hand: 0 }, { dog: 5, nm: 'teal', hand: 1 }];
const HAND = { x: 215, y: 326 };             // where a raised hand's rosette is, in Clawd's own units

export function register(S) {
  const { lines } = P.chorus3Lines();
  shot(181.41, 208.4, (g, t) => frame(g, t, lines), { id: 'c3' });
}

// ------------------------------------------------------------------- the camera
const whip = u => easeInOut(u);                                            // slow, very fast in the middle, slow
const RING_OF = [0, 1, 2, 1, 2];                                          // the ring each line's gag is in
function whips(lines) {
  const out = [];
  for (let i = 1; i < 5; i++) { const b = lines[i][0].v - .1; out.push({ a: b - .3, b, x0: RC[RING_OF[i - 1]], x1: RC[RING_OF[i]] }); }
  return out;
}
// The keyframes after the hush starts: [t, x, y, z, how the leg ending here is eased].
const KEYS = [
  [198.15, 2700, 1080, 1.035, null],                                      // (where the last gag's slow push-in left off)
  [199.05, 1620, 1150, .33, easeInOut],                                   // pulls right back on the three rings
  [200.05, 1590, 1160, .345, u => u],                                     // a slow drift while they look at you
  [202.62, 215, 1318, 1.85, easeInOut],                                   // pushes in over the dogs to Clawd
  [204.70, 215, 1312, 1.98, u => u],                                      // creeping in on the held "to"
  [204.95, 215, 1312, 1.98, u => u],
  [206.7, 235, 1290, 1.6, u => u],                                        // the three rosettes, close, while the fireworks go up
  [208.15, 540, 1080, 1, easeInOut],                                      // and it eases back to the ring's plain frame for the outro
];
function camAt(t, W_) {
  let x = RC[0], y = 1080, z = 1, dip = 0;
  if (t < 198.15) {
    for (const w of W_) {
      if (t >= w.b) x = w.x1;
      else if (t > w.a) { const u = inv(w.a, w.b, t); x = lerp(w.x0, w.x1, whip(u)); dip = Math.sin(u * Math.PI); break; }
      else break;
    }
  } else {
    let i = 1;
    while (i < KEYS.length - 1 && t > KEYS[i][0]) i++;
    if (t >= KEYS[KEYS.length - 1][0]) { const k = KEYS[KEYS.length - 1]; x = k[1]; y = k[2]; z = k[3]; }
    else {
      const a = KEYS[i - 1], b = KEYS[i], u = b[4](inv(a[0], b[0], t));
      x = lerp(a[1], b[1], u); y = lerp(a[2], b[2], u); z = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u));
    }
  }
  z *= 1 - .05 * dip;
  // between the whips the camera creeps in a little on the gag, so no line's picture sits quite still
  if (t < 198.15) { const seg = W_.filter(w => t >= w.b).length, a = seg ? W_[seg - 1].b : 181.41, b = seg < W_.length ? W_[seg].a : 198.06; z *= 1 + .035 * smooth(inv(a, b, t)); }
  if (t < 198.15) for (const w of W_) { const d = t - w.b; if (d > 0 && d < .4) z *= 1 + .016 * Math.exp(-d * 12) * Math.cos(d * 32); }   // the camera lands with a little bounce
  // the crash: the whole frame jumps
  const kick = t > T_CRASH - .02 ? Math.exp(-(t - T_CRASH + .02) / .1) : 0;         // (a hair early: the drawing clock is 1/15 s)
  z *= 1 + .06 * kick; y -= 16 * kick;
  // the strong beats of the held note: a small kick too
  z *= 1 + .012 * hit('drums', t, .07) * (t > T_KNOW ? 1 : 0);
  return { x, y, z };
}

// (exported for checking the camera's path)
export { camAt, whips };

// ------------------------------------------------------------------- the frame
function frame(g, t, lines) {
  window.__markInk = GRAPHITE;
  const W_ = whips(lines);
  const idx = P.lineIdx(t);
  const cam = camAt(t, W_), camB = camAt(t - .03, W_), camC = camAt(t + .03, W_);
  const smear = t < 198.15 ? clamp((camC.x - camB.x) * cam.z, -420, 420) : 0;   // how far the picture moves while the shutter is open: only the whips are smeared
  const poles = t < 198.15 ? clamp(Math.abs(smear) / 50) : smooth(inv(198.15, 198.6, t)) * (1 - smooth(inv(200.6, 201.4, t)));   // the poles between the rings show while the camera moves, never on a still ring
  // how quiet it is: 1 in the hush, less through the question, and the full oom-pah again on the held note
  const calm = t < T_HUSH ? 0 : t < T_HUSH + .3 ? inv(T_HUSH, T_HUSH + .3, t) : t < T_ASK ? 1 : t < T_KNOW ? .45 : 0;
  const hushed = t >= T_HUSH && t < T_ASK ? smooth(inv(T_HUSH, T_HUSH + .4, t)) * (1 - smooth(inv(T_ASK - .3, T_ASK + .2, t))) : 0;
  const gr0 = groove(t, t > T_KNOW ? 1.8 : 1.5);
  const grA = { ...gr0, sq: gr0.sq * (1 - calm), lean: gr0.lean * (1 - calm), bob: gr0.bob * (1 - calm), bp: gr0.bp * (1 - calm), dp: gr0.dp * (1 - calm) };
  const S = { t, idx, lines, gr: grA, vox: loud('vocals', t), calm, hushed, cam, poles };
  P.smearDraw(g, gg => {
    paper(gg, { base: GOLD.paper, vignette: GOLD.vignette });
    gg.save(); P.camPush(gg, cam);
    world(gg, t, cam, S);
    gg.restore();
  }, smear);
  // light: the hush's spotlight, and the held note's glow
  P.hushLight(g, t, smooth(inv(198.5, 199.5, t)) * (1 - smooth(inv(200.1, 200.9, t))), spotBeam);
  finaleLight(g, t);
  if (t > T_CRASH && t < T_CRASH + 2.2) confetti(g, t, T_CRASH, 1.9, { seed: 6 });
  finaleFall(g, t);
  P.boardLayer(g, t, grA, 1);
}

// ------------------------------------------------------------------- the world
function world(g, t, cam, S) {
  const held = t >= T_HUSH;                                                  // from the hush on, rings B and C are held as they were
  const rd = [0, 0, 0], bunt = [true, true, true];
  const wreck = S.lines[3][8].s;                                             // "wreck": ring B's rope comes down and goes back up
  if (t > wreck && t < wreck + 1.9) { rd[1] = clamp((t - wreck) / .5) * (t > wreck + 1.1 ? clamp((wreck + 1.5 - t) / .4) : 1); bunt[1] = false; }
  P.panorama(g, t, cam, { sunMood: t > T_KNOW + .1 ? 'shades' : 'happy', look: S.hushed > .5 ? [0, .9] : [-.3, .8], ropeDown: rd, bunt, poles: S.poles });
  for (let k = 0; k < 3; k++) {
    if (!P.ringSeen(k, cam, 60)) continue;
    g.save();
    g.beginPath(); g.rect(k * RW, -600, RW, 4200); g.clip();                 // each ring keeps to its own window: a gag's cast enters from its edge
    g.translate(k * RW, 0);
    if (k === 0) ringA(g, t, S);
    else {
      const tt = held ? T_FREEZE : t;
      const cx = { t: tt, gr: held ? { ...groove(T_FREEZE, 0), bp: 0, dp: 0 } : S.gr, vox: held ? 0 : S.vox, li: S.idx, mood: 'gold', lines: S.lines, idx: S.idx };
      if (k === 1) (tt < T_SWAP_B ? gag2 : gag4)(g, tt, S.lines[tt < T_SWAP_B ? 1 : 3], cx);
      else (tt < T_SWAP_C ? gag3 : gag5)(g, tt, S.lines[tt < T_SWAP_C ? 2 : 4], cx);
    }
    pigeon(g, t, 1012, 1010, .62, { flip: -1, state: t > T_KNOW ? 'flap' : t >= T_HUSH && t < T_HUSH + .7 ? 'gasp' : 'perch', look: S.hushed > .5 ? 0 : -1 });
    g.restore();
  }
  for (let k = 0; k < 3; k++) {
    if (!P.ringSeen(k, cam, 60)) continue;
    P.crowdRing(g, t, k, { roar: 1, hush: S.hushed, vox: S.vox, n: 6, s: .85 * (1 + .9 * S.hushed), y: 1845 - 240 * S.hushed, rise: k === 0 ? 1 - clamp(spring(t, T_CRASH, { f: 2.2, z: .5 })) : 0 });
  }
}

// ------------------------------------------------------------------- ring A: the twelve dogs on their marks, and Clawd
function ringA(g, t, S) {
  const { lines, gr } = S, ws = lines[0];
  const cx = { t, gr, vox: S.vox, li: S.idx, mood: 'gold', lines, idx: S.idx };
  const tw = [ws[6].s, ws[7].s + .05, ws[8].s, ws[9].s - .05];               // when the four wilt: "bad in others,"
  const launch = FLY.map((_, j) => T_KNOW - .05 + j * .09);
  DOZEN.forEach(D => P.chalkMark(g, t, D, 1));
  // "know!": light streams out from behind him, and a burst on the downbeat
  if (t > T_KNOW - .03) {
    const rk = smooth(inv(T_KNOW - .03, T_KNOW + .3, t)) * (1 - smooth(inv(207.4, 208.2, t)));
    rays(g, t, CLAWD.x, CLAWD.y - 200, { r0: 240, r1: 1500, k: rk * .6, w: 58, n: 18, spin: .06 });
    const hb = (t - T_KNOW) / .5;
    if (hb > 0 && hb < 1) burst(g, CLAWD.x, CLAWD.y - 200, 260, 260 + 460 * easeOut(hb, 2.4), t, { col: C.yellow, n: 20, prog: 1, w: 18 * (1 - hb * .5), seed: 9 });
  }
  const after = t >= T_HUSH, hushing = t >= T_HUSH && t < T_KNOW;
  [...DOZEN].sort((a, b) => a.y - b.y).forEach(D => {
    const tp = T_CRASH + D.i * .1, wj = WILT.indexOf(D.i);
    // a rosette droops on "bad in others" and perks up again on the held note
    const wilt = wj >= 0 ? clamp((t - tw[wj]) / .32) * (1 - clamp((t - (T_KNOW + .1 + wj * .07)) / .3)) : 0;
    const hop = t > tp ? 30 * Math.sin(Math.PI * clamp((t - tp) / .3)) : 0;
    const fj = FLY.findIndex(f => f.dog === D.i), gone = fj >= 0 && t >= launch[fj];
    const cheer = t >= T_KNOW ? 16 * Math.abs(Math.sin((t - T_KNOW) * 6.5 + D.i)) : 0;
    P.dozenDog(g, t, D, cx, {
      pin: t < tp ? 0 : backOutK(clamp((t - tp) / .25)), wilt, sad: wilt > .02 ? 1 : 0, hop: hop + cheer, face: after ? smooth(inv(T_HUSH, T_HUSH + .5, t)) : 0,
      squash: t >= T_HUSH && t < T_HUSH + .5 ? -.6 * Math.exp(-(t - T_HUSH - D.i * .02) * 14) * (t > T_HUSH + D.i * .02 ? 1 : 0) : 0,
      look: [-.6 + .12 * (D.col - 1), .1], hushed: hushing ? 1 : 0, pinned: !gone, wide: hushing && t < T_ASK + 1.5,
      mouth: t >= T_HUSH && t < T_ASK ? 0 : t >= T_KNOW ? clamp(S.vox * 1.8 + .3) : null,
    });
    if (t > tp && t < tp + .3 && !WILT.includes(D.i)) sparkle(g, D.x + 20 * D.s, D.y + 40 * D.s, 22 * (1 - (t - tp) / .3), t, { seed: 950 + D.i, rot: (t - tp) * 8 });
    // "ilities": a glint runs across the twelve rosettes
    const ti = S.lines[5][3].s - .085 + D.i * .045;
    if (t > ti && t < ti + .32) sparkle(g, D.x + 6 * D.s, D.y + 50 * D.s, 30 * Math.sin((t - ti) / .32 * Math.PI) + 4, t, { seed: 1000 + D.i, rot: (t - ti) * 6, col: '#fff3b0' });
  });
  clawdA(g, t, S, launch);
}
const backOutK = p => { p = clamp(p) - 1; return 1 + p * p * (2.7 * p + 1.7); };

// Clawd in ring A: the judge for the first line, then still in the hush, then the question, then the held note.
function clawdA(g, t, S, launch) {
  const { lines, gr } = S, ws = lines[0], ask = lines[5];
  const bad = t > ws[6].s;
  const asking = t >= T_ASK - .05, hush = t >= T_HUSH && !asking, knowing = t >= T_KNOW - .02;
  const vox = S.vox;
  // the three rosettes fly in from the dogs that gave them up
  const hold = { blue: 0, teal: 0, purple: 0 };
  FLY.forEach((f, j) => { const a = launch[j] + .42; hold[f.nm] = t >= a ? backOutK(clamp((t - a) / .22)) : 0; });
  let o;
  if (!asking) {
    // the judge: pleased with the line-up, then a doubtful hand on his chin as four rosettes wilt
    const sweep = Math.sin(clamp((t - (T_CRASH - .1)) / .9) * Math.PI);
    o = t < 184.4
      ? { eyes: bad ? 'squint' : 'happy', brow: bad ? .7 : 0, armR: { up: .5 + sweep * .4, out: .5 }, armL: { up: bad ? .9 : .2 }, look: [.6, -.2], mouth: clamp(vox * 1.4) }
      : hush ? { eyes: 'open', brow: .15, armL: { up: .1 }, armR: { up: .1 }, look: [0, .1], mouth: 0 }
        : { eyes: 'happy', armL: { up: .2 }, armR: { up: .2 }, look: [.4, 0], mouth: clamp(vox * 1.4) };
  } else if (!knowing) {
    // "Which of the 'ilities' are": hopeful. "yours?": he points at you. "I've got": hands to his chest, begging. "to...": shining eyes.
    const tYou = ask[5].s - .085, tGot = ask[6].s - .1, tTo = ask[8].s - .1;
    const yours = t >= tYou - .05, got = t >= tGot, to = t >= tTo;
    o = {
      eyes: got ? 'wide' : 'open', brow: got ? .9 : yours ? .55 : .25, raise: got ? .2 : 0, cheeks: got, look: [0, .12], mouth: clamp(vox * 1.5),
      armL: got ? { to: [70, -118], reach: 60 } : { up: .2, out: .3 },
      armR: got ? { to: [-70, -118], reach: 60 } : yours ? { to: [204, -196], reach: 60 } : { up: .2, out: .3 },
      lean: to ? Math.sin(t * 43) * .006 : 0,
    };
    o.point = yours && !got ? clamp((t - (tYou - .05)) / .1) : 0;
    o.stars = to ? smooth(inv(tTo, tTo + .25, t)) : 0;
  } else {
    const wv = Math.sin((t - T_KNOW) * 6.5) * 16;
    o = { eyes: 'happy', brow: 0, cheeks: true, look: [0, 0], mouth: clamp(vox * 1.8 + .25), armL: { to: [-218 - wv * .5, -300 + wv], reach: 112 }, armR: { to: [218 + wv * .5, -300 - wv], reach: 112 } };
  }
  const { point = 0, stars = 0, ...pose } = o;
  P.finaleClawd(g, t, {
    x: CLAWD.x, y: CLAWD.y, s: CLAWD.s, bob: gr.bob * (knowing ? 1.2 : 1), squash: gr.sq, ...pose, lean: gr.lean + (pose.lean || 0), hold: t >= launch[0] + .3 ? hold : null,
    prop2: (point > 0 || stars > 0) ? (g2, po) => {
      if (point > 0) pointingHand(g2, t, po.hR, -2.25, { k: point * 1.5 });
      if (stars > 0) eyeStars(g2, t, { k: stars });
    } : null,
  });
  // the rosettes on their way: from the dog to his hand
  FLY.forEach((f, j) => {
    const d = t - launch[j];
    if (d < 0 || d > .42) return;
    const D = DOZEN[f.dog], a = { x: D.x - 38 * D.s, y: D.y + 74 * D.s }, q = easeOut(d / .42, 2);
    const to = [CLAWD.x + f.hand * HAND.x * CLAWD.s, CLAWD.y - (f.hand === 0 ? 318 : HAND.y) * CLAWD.s];
    const mid = [(a.x + to[0]) / 2, Math.min(a.y, to[1]) - 260];
    const x = lerp(lerp(a.x, mid[0], q), lerp(mid[0], to[0], q), q), y = lerp(lerp(a.y, mid[1], q), lerp(mid[1], to[1], q), q);
    g.save(); g.translate(x, y); g.rotate(d * 14); rosette(g, 0, 0, 52 * D.s + 4 * q, ROSETTES[D.i], t, { seed: 900 + D.i }); g.restore();
    sparkle(g, x + 30, y - 30, 16 * (1 - d / .42) + 4, t, { seed: 980 + j, rot: d * 9 });
  });
}

// ------------------------------------------------------------------- the held note
// Behind the picture: a warm glow, brighter on each drum hit.
function finaleLight(g, t) {
  if (t < T_KNOW - .1) return;
  const k = smooth(inv(T_KNOW - .1, T_KNOW + .25, t)) * (1 - smooth(inv(207.6, 208.2, t)));
  softGlow(g, 540, 1000, 800, '#fff3c4', .16 * k);
  softGlow(g, 540, 1000, 900, '#fffbe0', .16 * hit('drums', t, .08) * k);
}
// In front of the picture (and under the board): fireworks, ribbons and confetti.
const BURSTS = [
  [204.72, 540, 720, 200, [C.pink, C.purple, C.yellow]], [204.812, 165, 800, 200, [C.red, C.yellow, C.orange]], [205.243, 915, 770, 220, [C.sky, C.blue, '#fff3a8']],
  [205.675, 140, 1010, 190, [C.green, C.lime, C.yellow]], [206.106, 520, 760, 230, [C.orange, C.red, C.pink]], [206.538, 940, 1000, 200, [C.teal, C.sky, '#fff3a8']],
  [206.968, 250, 770, 210, [C.red, C.yellow, C.purple]], [207.4, 820, 830, 220, [C.blue, C.pink, C.yellow]], [207.83, 540, 780, 230, [C.lime, C.orange, C.teal, C.yellow]],
];
function finaleFall(g, t) {
  if (t < T_KNOW - .05 || t > 208.4) return;
  BURSTS.forEach(([t0, x, y, r, cols], i) => P.firework(g, t, t0, x, y, r, cols, { seed: 11 + i, rot: i * .4 }));
  for (let i = 0; i < 16; i++) P.streamer(g, t, i, T_KNOW + .05, { seed: 7, clear: t < 206.6 });
  confetti(g, t, T_KNOW, 3.7, { seed: 13, n: 80, y0: 60, y1: 1800 });
}
