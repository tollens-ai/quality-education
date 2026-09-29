// Chorus 2: the ring by night, and the tables turn. The same six lines and gags as chorus 1, with Clawd, the
// agent, on the table being judged and a bulldog in the bowler judging him; the row of dog heads has Clawds in
// it, because agents are people who matter too. Dark blue, cream pencil, fairy lights and spotlights; the
// drums have come in, so the dance is bigger. gag1 and gag2 are here; gag3-gag6 are in c2gags34.js and
// c2gags56.js.
import { W, H, clamp, inv, easeOut, easeIn, backOut, beatPos, beatPulse, downPulse, beatTimes, words, lerp, hash, loud, sway, TAU } from '../kit.js';
import { blob, line, dot } from '../pencil.js';
import { clawd } from '../chars.js';
import { rosette, sparkle } from '../props.js';
import { groove, pop } from '../common.js';
import { spotlight } from '../ring.js';
import { SPOT, ROSETTES, judgeBulldog, subjectClawd, tableFront, hurdle } from '../ringcast.js';
import { spring, ease } from '../life.js';
import { GRAPHITE, C } from '../palette.js';
import { registerChorus } from './chorus-core.js';
import { gag3, gag4 } from './c2gags34.js';
import { gag5, gag6 } from './c2gags56.js';

const CREAM = '#f5eedd';

export { gag1, gag2, gag3, gag4, gag5, gag6 };

export function register(S) {
  registerChorus({
    id: 'c2', section: 'Chorus 2', t0: 87.2, t1: 108.2, mood: 'night', crash: 87.4, ink: CREAM, markInk: CREAM,
    board: { fill: '#2b3670', edge: CREAM },
    gags: [gag1, gag2, gag3, gag4, gag5, gag6],
    audience: {
      n: 7, s: .85, seed: 5,
      // Some of the audience are Clawds.
      special: { 1: (g, x, y, s) => clawd(g, { x, y: y + 44, s: .34, t: 0, seed: 21, eyes: 'happy', mouth: .5, flip: 1 }), 4: (g, x, y, s) => clawd(g, { x, y: y + 44, s: .34, t: 0, seed: 22, eyes: 'happy', mouth: .4, flip: -1 }) },
    },
    sunMood: [t => 'sleepy', t => 'sleepy', t => 'sleepy', t => 'sleepy', t => 'sleepy', t => 'happy'],
  });
}

// ------------------------------------------------------------------- 1 "Good in a dozen ways, and bad in others, though:"
// Clawd on the table wears a dozen rosettes on a string round him, one a beat; the bulldog judge looks him over; on
// "bad in others" four of them wilt.
function gag1(g, t, ws, cx) {
  const bad = t > ws[6].s;
  spotlight(g, t, SPOT.table.x, SPOT.table.y, 340, { from: [SPOT.table.x - 200, 700], alpha: .2 });
  tableFront(g, t, true);
  const arc = i => { const u = i / 11; return [lerp(110, 1010, u), 790 + Math.sin(u * Math.PI) * 120]; };
  const n = clamp(Math.floor((t - (ws[0].s - .26)) / .13) + 1, 0, 12);
  if (n > 1) line(g, Array.from({ length: n }, (_, i) => arc(i)), { w: 5, col: '#cdb98a', seed: 1880, t, spline: true, passes: 1, alpha: .9 });
  const WILT = [2, 5, 8, 10], WT = [ws[6].s, ws[7].s + .05, ws[8].s, ws[9].s - .05];
  for (let i = 0; i < 12; i++) {
    const a0 = ws[0].s - .26 + i * .13, k = pop(t, a0, .25);
    if (k <= 0) continue;
    const wi = WILT.indexOf(i), wp = wi >= 0 ? clamp((t - WT[wi]) / .32) : 0;
    const [x, y] = arc(i);
    g.save(); g.translate(x, y + wp * 36); g.scale(k, k); g.translate(-x, -y - wp * 36);
    rosette(g, x, y + wp * 36, 58, wp > .3 ? '#8d8c97' : ROSETTES[i], t, { seed: 1900 + i, state: wp > .2 ? 'wilt' : 'new', tilt: (wp > 0 ? .35 * wp : -.1 + i * .02) + cx.gr.lean * 2 + (1 - k) * .8 });
    g.restore();
  }
  // Clawd on the table: proud, then worried as they wilt.
  subjectClawd(g, t, cx, { eyes: bad ? 'sad' : 'happy', brow: bad ? .8 : 0, armL: { up: bad ? .3 : .6, out: .2 }, armR: { up: bad ? .3 : .6, out: .2 }, cheeks: !bad });
  // The judge, weighing him up.
  judgeBulldog(g, t, cx, { eyes: bad ? 'squint' : 'dot', brow: bad ? 1 : 0, look: [.6, .2], mouth: 0 });
}

// ------------------------------------------------------------------- 2 "Fast, but it crashes; is it steady? Sound? Oh, no."
// Clawd sprints across the ring, hits the hurdle at "crashes;" and tumbles; the bulldog runs a paw down his legs,
// "steady? Sound?", and on "Oh, no." one falls off.
function gag2(g, t, ws, cx) {
  const HX = 520, GY = SPOT.ground, tc = ws[3].s, t0 = ws[0].s - .5, XR = 400;
  spotlight(g, t, 560, GY - 40, 330, { from: [520, 700], alpha: .18 });
  hurdle(g, t, HX, GY, 1.5, { hit: t >= tc ? clamp((t - tc) / .7) : 0, dir: 1 });
  let x, y = GY, rot = 0, legs = 0, eyes = 'wide', mouth = .5, squash = 0;
  if (t < tc) {
    const u = clamp((t - t0) / (tc - t0));
    x = lerp(-300, HX - 200, easeIn(u, 1.6)); legs = (t * 6) % 1;
    for (let k = 0; k < 4; k++) line(g, [[x - 250 - k * 40, y - 200 + k * 40], [x - 150 - k * 24, y - 200 + k * 40]], { w: 7, col: '#8d8c97', seed: 1990 + k, t, spline: false, passes: 1, taper: [.3, .05], alpha: .7 * u });
  } else {
    const p = clamp((t - tc) / .75);
    x = lerp(HX - 200, XR, easeOut(p, 1.6)); y = GY - Math.sin(p * Math.PI) * 240; rot = easeOut(p, 1.3) * TAU * 1.5; eyes = 'x'; mouth = 0;
    if (p >= 1) { rot = 0; eyes = t > ws[5].s ? 'wide' : 'x'; squash = .1; }
  }
  const settled = t > tc + .75, leg = t > ws[8].s ? clamp((t - ws[8].s) / .55) : 0;
  g.save(); g.translate(x, y - 110); g.rotate(rot); g.translate(-x, -y + 110);
  clawd(g, { x, y: settled ? GY : y, s: 1.05, t, seed: 1, eyes: settled && leg > 0 ? 'wide' : eyes, mouth: settled ? (leg > 0 ? .5 : 0) : mouth, legs, squash, brow: leg > 0 ? -.4 : 0, sweat: settled && leg > 0, legPop: leg > 0 ? { i: 3, p: leg } : null, armL: { up: .3 }, armR: { up: .3 } });
  g.restore();
  // The bulldog from the right, a paw down the legs.
  const near = ease(t, ws[4].s - .3, ws[6].s - .05);
  const per = (ws[8].s - ws[6].s) / 2, stroke = t > ws[6].s ? ((t - ws[6].s) / per) % 1 : 0;
  const feeling = settled && t > ws[5].s && t < ws[8].s;
  judgeBulldog(g, t, cx, { x: lerp(1000, 840, near), eyes: leg > 0 ? 'wide' : 'squint', brow: leg > 0 ? 0 : 1, mouth: leg > 0 ? .4 : 0, look: [-.8, .6], reach: feeling ? [XR + 110 + (t > ws[7].s ? 60 : 0), GY - 150 + stroke * 130] : null });
  if (leg > 0 && leg < .9) {
    const lx = XR + 220, ly = GY - 250;
    line(g, [[lx - 30, ly + 30], [lx + 30, ly - 24], [lx - 20, ly - 54], [lx + 20, ly - 84]], { w: 6, col: C.red, seed: 1995, t, passes: 1, alpha: 1 - leg });
  }
}
