// Small things every scene uses: the ground and sky washes, timing ramps, the dancing pulse.
import { W, H, clamp, lerp, inv, smooth, easeOut, backOut, elastic, beatPulse, downPulse, sway, beatPos } from './kit.js';
import { scrub, line } from './pencil.js';
import { GRAPHITE, C } from './palette.js';

// A ramp 0..1 between two times, eased.
export const ramp = (t, a, b, ease = easeOut) => ease(inv(a, b, t));
export const pop = (t, a, dur = .22) => t < a ? 0 : backOut(inv(a, a + dur, t), 2.2);
// A dance: {sq: squash on the oom, lean: sway, bob: lift on every beat}, scaled by `k`.
export function groove(t, k = 1) {
  const bp = beatPulse(t, .17), dp = downPulse(t, .22);
  return { sq: dp * .32 * k, lean: sway(t) * .03 * k, bob: bp * 9 * k, bp, dp };
}

// Grass: a crayon scrub across a band, with the horizon drawn in graphite.
export function ground(g, t, y0 = 1200, y1 = 1500, o = {}) {
  const { col = C.green, col2 = C.lime, seed = 5 } = o;
  scrub(g, [0, y0, W, y1], { col, seed, t, gap: 20, w: 24, alpha: .55, angle: -.12, wig: 26 });
  scrub(g, [0, y0 + 30, W, y1], { col: col2, seed: seed + 4, t, gap: 34, w: 20, alpha: .38, angle: .18, wig: 22 });
  line(g, [[0, y0 + 6], [260, y0 - 6], [560, y0 + 8], [860, y0 - 4], [W, y0 + 4]], { w: 5.4, col: GRAPHITE, seed: seed + 8, t, wob: 3, passes: 2, alpha: .75 });
}
// A pale sky wash from the top of the page down to the horizon: stronger at the top, fading towards it.
export function sky(g, t, horizon = 1330, o = {}) {
  const { col = C.sky, alpha = .2, seed = 11 } = o;
  const mid = horizon * .5;
  scrub(g, [0, 0, W, mid], { col, seed, t, gap: 30, w: 34, alpha, angle: .1, wig: 30 });
  scrub(g, [0, mid - 60, W, horizon], { col, seed: seed + 3, t, gap: 36, w: 34, alpha: alpha * .55, angle: .06, wig: 30 });
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
