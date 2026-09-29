// Chorus 1: the ring by day. The chorus's machinery (the board, the ball, Bruce, the audience, the pigeon)
// is in chorus-core.js; under the board is the show: Clawd as judge, the app as a scruffy show dog. One gag
// a line, six lines: the gags are drawn by gag1..gag6 (gag1 and gag2 here, the rest in c1gags34.js and
// c1gags56.js), each given the line's words and a context, so the second and third choruses can play
// them again with the tables turned.
import { W, H, clamp, inv, easeOut, easeIn, backOut, beatPos, beatPulse, downPulse, beatTimes, words, lerp, hash, loud, sway, TAU } from '../kit.js';
import { blob, line, dot } from '../pencil.js';
import { clawd, dachshund } from '../chars.js';
import { dogFront } from '../people.js';
import { rosette, sparkle, burst } from '../props.js';
import { groove, pop, ramp } from '../common.js';
import { SPOT, ROSETTES, judgeClawd, showDog, tableFront, hurdle, confetti } from '../ringcast.js';
import { spring, shake, hop, gate, ease } from '../life.js';
import { GRAPHITE, C } from '../palette.js';
import { registerChorus } from './chorus-core.js';
import { gag3, gag4 } from './c1gags34.js';
import { gag5, gag6 } from './c1gags56.js';

export { gag1, gag2, gag3, gag4, gag5, gag6 };

export function register(S) {
  registerChorus({
    id: 'c1', section: 'Chorus 1', t0: 30.56, t1: 52.6, mood: 'day', crash: 30.56,
    gags: [gag1, gag2, gag3, gag4, gag5, gag6],
    // "...the bugs can wreck the show": on "wreck" (43.79) the rope and posts come down; they are back up for the next line.
    backdrop: t => (t > 43.79 && t < 45.3 ? { ropeDown: clamp((t - 43.79) / .5) * (t > 44.9 ? clamp((45.3 - t) / .4) : 1), bunt: false } : {}),
    sunMood: [t => 'happy', t => t > 35.64 ? 'gasp' : 'happy', t => t > 40.28 ? 'worried' : 'happy', t => t > 43.28 ? 'sweat' : 'happy', t => t > 47.06 ? 'worried' : 'happy', t => 'happy'],
  });
}

// ------------------------------------------------------------------- 1 "Good in a dozen ways, and bad in others, though:"
// Clawd, as judge, presents the show dog on the table; a dozen rosettes appear on a string round him, one a
// beat; on "bad in others" four of them wilt and go grey.
function gag1(g, t, ws, cx) {
  const D = SPOT.dog;
  const bad = t > ws[6].s;
  tableFront(g, t);
  // The string and the twelve rosettes: an arc over the dog, one every 0.13 s from just before "Good".
  const arc = i => { const u = i / 11; return [lerp(110, 1010, u), 790 + Math.sin(u * Math.PI) * 120 - Math.sin(u * Math.PI * 2) * 0]; };
  const n = clamp(Math.floor((t - 31.5) / .13) + 1, 0, 12);
  if (n > 1) line(g, Array.from({ length: n }, (_, i) => arc(i)), { w: 5, col: '#8b5f2a', seed: 880, t, spline: true, passes: 1, alpha: .9 });
  const WILT = [2, 5, 8, 10], WT = [ws[6].s, ws[7].s + .05, ws[8].s, ws[9].s - .05];
  for (let i = 0; i < 12; i++) {
    const a0 = 31.5 + i * .13, k = pop(t, a0, .25);
    if (k <= 0) continue;
    const wi = WILT.indexOf(i), wp = wi >= 0 ? clamp((t - WT[wi]) / .32) : 0;
    const [x, y] = arc(i);
    g.save(); g.translate(x, y + wp * 36); g.scale(k, k); g.translate(-x, -y - wp * 36);
    rosette(g, x, y + wp * 36, 58, wp > .3 ? '#a8a7b2' : ROSETTES[i], t, { seed: 900 + i, state: wp > .2 ? 'wilt' : 'new', tilt: (wp > 0 ? .35 * wp : -.1 + i * .02) + cx.gr.lean * 2 + (1 - k) * .8 });
    g.restore();
  }
  showDog(g, t, cx, { eyes: bad ? 'dot' : 'happy', sad: bad ? 1 : 0, mouth: bad ? 0 : (cx.gr.bp > .5 ? .5 : .1) });
  // The judge, pleased, then a doubtful hand on his chin as the rosettes wilt.
  const sweep = Math.sin(clamp((t - 31.4) / .5) * Math.PI);
  judgeClawd(g, t, cx, { eyes: bad ? 'squint' : 'happy', brow: bad ? .7 : 0, armR: { up: .5 + sweep * .4, out: .2 }, armL: { up: bad ? .9 : .2 }, look: [.6, -.2] });
  // Sparkles as each rosette lands.
  for (let i = 0; i < 12; i++) { const a0 = 31.5 + i * .13, d = t - a0; if (d > 0 && d < .3 && !WILT.includes(i)) { const [x, y] = arc(i); sparkle(g, x + 34, y - 34, 18 * (1 - d / .3), t, { seed: 950 + i, rot: d * 8 }); } }
}

// ------------------------------------------------------------------- 2 "Fast, but it crashes; is it steady? Sound? Oh, no."
// A greyhound streaks across the ring, hits the hurdle at "crashes;" and cartwheels; the judge runs a hand down
// its legs, "steady? Sound?", and on "Oh, no." a leg pops off like a toy's.
function gag2(g, t, ws, cx) {
  const HX = 520, GY = SPOT.ground;                       // the hurdle, and the ground line
  const tc = ws[3].s;                              // "crashes;"
  const t0 = ws[0].s - .5;
  const crashed = t >= tc;
  hurdle(g, t, HX, GY, 1.5, { hit: crashed ? clamp((t - tc) / .7) : 0, dir: 1 });
  // The greyhound: a long-legged, thin dachshund in grey.
  const D = { legH: 118, bodyH: .62, length: .95, headS: .74, snoutL: 1.4, earS: .6, arch: 26, tuck: 56, chest: 36, legW: .55, jacket: { col: '#e04a3d', text: '7' }, coat: '#a7a2b0', shade: '#726d7c', muzzle: '#c4c0cb', collar: C.orange, s: .92 };
  const XR = 330;                                  // where he ends up
  let x, y = GY, rot = 0, walk = 0, eyes = 'wide', mouth = .3;
  if (t < tc) {
    const u = clamp((t - t0) / (tc - t0));
    x = lerp(-560, HX - 380, easeIn(u, 1.6)); walk = (t * 8) % 1; mouth = .5;
    for (let k = 0; k < 4; k++) line(g, [[x - 300 - k * 40, y - 270 + k * 46], [x - 170 - k * 24, y - 270 + k * 46]], { w: 7, col: '#8d8c97', seed: 990 + k, t, spline: false, passes: 1, taper: [.3, .05], alpha: .7 * u });
  } else {
    const p = clamp((t - tc) / .75);
    x = lerp(HX - 380, XR, easeOut(p, 1.6));
    y = GY - Math.sin(p * Math.PI) * 250;
    rot = easeOut(p, 1.3) * TAU * 1.5;
    eyes = 'x'; mouth = 0;
    if (p >= 1) { rot = 0; eyes = t > ws[5].s ? 'wide' : 'x'; }
  }
  const settled = t > tc + .75;
  const leg = t > ws[8].s ? clamp((t - ws[8].s) / .55) : 0;
  const pivotY = y - 130 * D.s;
  g.save(); g.translate(x + 60, pivotY); g.rotate(rot); g.translate(-x - 60, -pivotY);
  dachshund(g, { x, y: settled ? GY : y, s: D.s, t, seed: 40, ...D, walk, eyes: settled && t > ws[8].s ? 'wide' : eyes, mouth: settled ? (t > ws[8].s ? .6 : 0) : mouth, brow: settled && t > ws[8].s ? 1 : 0, tail: t * 3, legPop: leg > 0 ? { i: 3, p: leg } : null, life: 1 });
  g.restore();
  // The judge, from the right, trots up and runs a hand down the legs: "steady?" then "Sound?".
  const near = ease(t, ws[4].s - .3, ws[6].s - .05);
  const J = { x: lerp(1010, 885, near), y: SPOT.judge.y, s: 1.12 };
  const per = (ws[8].s - ws[6].s) / 2, stroke = t > ws[6].s ? ((t - ws[6].s) / per) % 1 : 0;
  const tx = 500 + (t > ws[7].s ? 80 : 0), ty = GY - 120 + stroke * 100;
  const feeling = settled && t > ws[5].s && t < ws[8].s;
  judgeClawd(g, t, cx, { x: J.x, y: J.y, s: J.s, flip: 1, lean: feeling ? -.16 : 0, bob: feeling ? -26 : cx.gr.bob, eyes: leg > 0 ? 'wide' : 'squint', brow: leg > 0 ? -.5 : .6, raise: leg > 0 ? .8 : 0,
    armL: feeling ? { to: [(tx - J.x) / J.s, (ty - J.y) / J.s], reach: 160 } : { up: leg > 0 ? .9 : .2 }, armR: { up: leg > 0 ? .9 : .1 }, look: [-.8, .5] });
  // "Boing": the popped leg's spring lines.
  if (leg > 0 && leg < .9) {
    const lx = XR + 250, ly = GY - 280;
    line(g, [[lx - 30, ly + 30], [lx + 30, ly - 24], [lx - 20, ly - 54], [lx + 20, ly - 84]], { w: 6, col: C.red, seed: 995, t, passes: 1, alpha: 1 - leg });
  }
}
