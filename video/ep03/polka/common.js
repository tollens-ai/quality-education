// Small things every scene uses: the ground and sky washes, timing ramps, the dancing pulse.
import { W, H, clamp, lerp, inv, smooth, easeOut, backOut, elastic, beatPulse, downPulse, sway, beatPos } from './kit.js';
import { scrub, line } from './pencil.js';
import { bounce } from './life.js';
import { GRAPHITE, C } from './palette.js';

// A ramp 0..1 between two times, eased.
export const ramp = (t, a, b, ease = easeOut) => ease(inv(a, b, t));
export const pop = (t, a, dur = .22) => t < a ? 0 : backOut(inv(a, a + dur, t), 2.2);
// A dance: {sq: squash, lean: sway, bob: lift, bp, dp: pulses on every beat and on the oom}, scaled by `k`.
// The body hops off each beat and lands on the next (squashing as it lands, stretching in the air), a
// little higher on the oom, and leans left and right with the oom-pah.
export function groove(t, k = 1) {
  const bp = beatPulse(t, .17), dp = downPulse(t, .22);
  const b = bounce(t, k * .55);
  return { sq: b.sq * 2.6, lean: sway(t) * .035 * k, bob: b.lift, bp, dp };
}

// Grass: a crayon scrub across a band, with the horizon drawn in graphite.
export function ground(g, t, y0 = 1200, y1 = 1500, o = {}) {
  const { col = C.green, col2 = C.lime, seed = 5 } = o;
  scrub(g, [0, y0, W, y1], { col, seed, t, gap: 20, w: 24, alpha: .55, angle: -.12, wig: 26 });
  scrub(g, [0, y0 + 30, W, y1], { col: col2, seed: seed + 4, t, gap: 34, w: 20, alpha: .38, angle: .18, wig: 22 });
  line(g, [[0, y0 + 6], [260, y0 - 6], [560, y0 + 8], [860, y0 - 4], [W, y0 + 4]], { w: 5.4, col: GRAPHITE, seed: seed + 8, t, wob: 3, passes: 2, alpha: .75 });
}
// A sky in blue crayon from the top of the page down to the horizon: heavier at the top, pale at the
// horizon, where it runs out into the paper (as a sky does when the child gets bored of colouring it).
export function sky(g, t, horizon = 1330, o = {}) {
  const { col = C.sky, alpha = .2, seed = 11 } = o;
  const mid = horizon * .45;
  scrub(g, [0, 0, W, mid], { col, seed, t, gap: 30, w: 34, alpha, angle: .1, wig: 30 });
  scrub(g, [0, mid - 90, W, horizon * .82], { col, seed: seed + 3, t, gap: 36, w: 34, alpha: alpha * .8, angle: .06, wig: 30 });
  scrub(g, [0, horizon * .62, W, horizon + 14], { col, seed: seed + 6, t, gap: 44, w: 34, alpha: alpha * .5, angle: .04, wig: 30 });
}

// The whole lower page as grass: the far meadow, then a darker foreground with tufts, to the bottom
// of the frame (so nothing under the characters reads as an empty page).
export function meadow(g, t, y0 = 1290, o = {}) {
  const { col = C.green, col2 = C.lime, seed = 5 } = o;
  scrub(g, [0, y0, W, H], { col, seed, t, gap: 20, w: 26, alpha: .55, angle: -.12, wig: 26 });
  scrub(g, [0, y0 + 30, W, H], { col: col2, seed: seed + 4, t, gap: 36, w: 22, alpha: .38, angle: .18, wig: 22 });
  scrub(g, [0, y0 + 300, W, H], { col: '#2f8a4a', seed: seed + 9, t, gap: 30, w: 24, alpha: .3, angle: -.3, wig: 20 });
  line(g, [[0, y0 + 6], [260, y0 - 6], [560, y0 + 8], [860, y0 - 4], [W, y0 + 4]], { w: 5.4, col: GRAPHITE, seed: seed + 8, t, wob: 3, passes: 2, alpha: .75 });
  // Tufts along the front.
  for (let i = 0; i < 9; i++) {
    const x = 60 + i * 125 + ((i * 37) % 40), y = 1600 + ((i * 53) % 220);
    for (let k = -1; k <= 1; k++) line(g, [[x + k * 14, y], [x + k * 20, y - 44 - (k === 0 ? 12 : 0)]], { w: 6, col: '#2f8a4a', seed: 300 + i * 3 + k, t, spline: false, passes: 1, alpha: .7, taper: [.05, .8] });
  }
}
