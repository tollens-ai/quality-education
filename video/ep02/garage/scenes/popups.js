// The band's backing "oooh"s in the verses: four heads pop up from the bottom of whatever shot
// is on screen and sing it, lettered above them. Drawn over the shot, so a backing vocal that
// lands across a cut isn't lost.
import { C, clamp, smooth, easeOutBack } from '../kit.js';
import { member } from '../band.js';
import { sing, lineNear, setShotEnd } from '../lyrics.js';

// [time near the backing line, text as lettered, x of the group's centre]
export const POPS = [
  [17.40, 'OOOH', 700], [20.98, 'OOOH', 330], [24.44, 'OOOH', 700],
  [63.66, 'OHHH', 700], [67.18, 'OHHH', 330], [74.04, 'OHHH', 700],
  [87.98, 'OOH-OOH', 680], [91.50, 'OOH-OOH', 360],
  [105.66, 'OH YEAH', 680], [109.16, 'OH YEAH', 360], [112.68, 'OH YEAH', 680], [116.16, 'OH YEAH', 360],
];

export function popups(g, t) {
  // The pop-ups aren't cut with the shots, so their words are written at their own pace.
  setShotEnd(1e9);
  for (const [a, text, x0] of POPS) {
    const L = lineNear(a, true);
    if (!L || t < L.start - .2 || t > L.end + .8) continue;
    const p = easeOutBack(clamp((t - L.start + .1) / .18), 2) * (1 - smooth((t - L.end - .35) / .2));
    if (p <= .01) continue;
    const ys = 1540 + (1 - p) * 580;
    ['lead', 'elder', 'soft', 'bad'].forEach((m, k) => {
      member(g, x0 - 195 + k * 130, ys + 250 + (k % 2) * 20, m, { s: 170, t, eyes: 'closed', mouth: .75 + .2 * Math.sin(t * 14 + k), shadow: false, legs: 0, look: [0, -.4] });
    });
    sing(g, t, L, { back: true, rows: [{ text, x: x0, y: 1350 + (1 - p) * 660, size: 84, rot: -.05, maxW: 500 }], style: 'marker', paper: { chip: true, cols: [C.cream, C.lemon], pad: .22 } });
  }
}
