// The stage, seen from behind the band: four Clawds facing a wall of mirror, their backs to us,
// their reflections facing us from the glass. The wall is three tall panes; any pane can be lit
// from the far side (o.lit[i] 0..1), which turns it from mirror to window, and o.far(i) draws
// what's there. A mirror keeps left and right where they are and swaps front for back, so each
// reflection stands where its Clawd does, smaller, as far behind the glass as he is in front.
import { C, W, H, clamp, lerp, rgba, hit, noise, hash } from '../kit.js';
import { clawd } from '../clawd.js';
import { cone, floor, layer, put } from '../world.js';
import { pane } from '../glass.js';
import { regex, nullBass, cron, singer, groove } from '../playing.js';
import { kit } from '../gear.js';

export const WALL = { top: 150, base: 1250, panes: [[0, 360], [360, 720], [720, 1080]] };
const REF = .44, RY = 1170; // reflection scale, and the reflected floor line

export function stageWide(g, t, o = {}) {
  g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
  const push = o.push ?? 0;
  const lit = o.lit || [0, 0, 0];
  // Reflections first: the band facing us, inside the glass.
  const R = layer(g, 'refl');
  R.fillStyle = C.ink2; R.fillRect(0, WALL.top, W, WALL.base - WALL.top);
  cone(R, 540, WALL.top, 0, .9, 1100, C.red, .06);
  R.fillStyle = C.ink; R.fillRect(0, RY, W, WALL.base - RY);
  const rx = x => 540 + (x - 540) * REF;
  // Back row (in the reflection, CRON is nearest the glass on our side, so he's farther in).
  cron(R, rx(540), RY - 30, 360 * REF, t, { rim: C.red, groove: o.groove ?? 1 });
  regex(R, rx(210), RY, 330 * REF, t, { rim: C.red });
  nullBass(R, rx(870), RY, 330 * REF, t, { rim: C.glass });
  singer(R, rx(540), RY + 12, 380 * REF, t, { rim: C.red, mouth: o.mouth });
  // Each pane: mirror where it's dark on the far side, window where it's lit.
  WALL.panes.forEach(([x0, x1], i) => {
    const L = lit[i];
    if (L > 0 && o.far) {
      const F = layer(g, 'far' + i);
      o.far(F, i, x0, x1);
      put(g, F, { clip: [x0, WALL.top, x1 - x0, WALL.base - WALL.top] });
    }
    put(g, R, { clip: [x0, WALL.top, x1 - x0, WALL.base - WALL.top], alpha: 1 - L * .85 });
    pane(g, x0, WALL.top, x1 - x0, WALL.base - WALL.top, { a: .05 + L * .04, n: 2, seed: 30 + i, glintA: .25 });
  });
  // Mullions and rails.
  g.fillStyle = C.steel2;
  g.fillRect(0, WALL.top - 26, W, 26); g.fillRect(0, WALL.base, W, 20);
  for (const x of [360, 720]) { g.fillRect(x - 9, WALL.top, 18, WALL.base - WALL.top); g.fillStyle = C.steel; g.fillRect(x - 6, WALL.top, 3, WALL.base - WALL.top); g.fillStyle = C.steel2; }
  // The stage floor in front of the glass, and the band from behind.
  floor(g, WALL.base + 20, { light: C.red, streaks: 5, seed: 8 });
  cone(g, 540, WALL.base + 20, Math.PI, .01, 1, C.red, 0);
  const by = 1930 + push * 40;
  const gr = groove(t, 1, .2);
  clawd(g, 870, by, { who: 'null', s: 330, t, back: true, rim: C.glass, silhouette: .35, whip: gr.whip * .5, tilt: gr.tilt * .3 });
  clawd(g, 210, by, { who: 'regex', s: 330, t, back: true, rim: C.red, silhouette: .35, whip: gr.whip, tilt: gr.tilt });
  clawd(g, 540, by + 40, { who: 'clawd', s: 400, t, back: true, rim: C.red, silhouette: .35, whip: gr.whip * .7, tilt: gr.tilt * .5 });
}

// The band from the front, as you see them through the glass: CRON's kit at the back, REGEX
// and NULL either side, CLAWD at the mic. o.dim darkens them (for type over them), o.rim the light.
import { micStand } from '../gear.js';
export function bandFront(g, t, o = {}) {
  const fy = o.floor ?? 1500;
  cone(g, 540, 60, 0, .9, fy, C.red, .06);
  cone(g, 220, 60, .12, .45, fy, C.bone, .04);
  cone(g, 860, 60, -.12, .45, fy, C.bone, .04);
  const L = layer(g, 'band');
  const jump = ph => o.jump ? Math.max(0, Math.sin((t / (1.7626 / 2) + ph) * Math.PI * 2)) * 140 * o.jump : 0;
  cron(L, 540, fy - 250, 300, t, { rim: C.red });
  regex(L, 225, fy - jump(0), 340, t, { rim: C.red });
  nullBass(L, 865, fy - jump(.5), 340, t, { rim: C.bone });
  micStand(L, 540, fy + 50, 420, { t, flow: Math.sin(t * 3) * .5 });
  singer(L, 540, fy + 60 - jump(.25), 400, t, { rim: C.red, mic: false, armR: { a: -1.25, len: 1.15 }, armL: { a: .4, len: .9 }, mouth: o.mouth });
  floor(g, fy + 60, { light: C.red, streaks: 5, seed: 12 });
  put(g, L, { flipY: fy + 60, alpha: .2, clip: [0, fy + 60, W, H - fy] });
  put(g, L, { alpha: 1 - (o.dim ?? 0) });
}

// The people on your side of the glass, from behind: heads and shoulders along the bottom of the
// frame, dark, rimmed by the stage light; on a strobe they throw their hands up.
import { stranger, rimmed } from '../people.js';
export function crowdBacks(g, t, o = {}) {
  const n = o.n ?? 9, y0 = o.y ?? 1960, rim = o.rim || C.red;
  const up = o.up ?? 0;
  // Drawn flat, then edged with the rim light (rimmed), so each head and shoulder has one clean
  // edge of light.
  rimmed(g, 'crowd', rim, g => {
  for (let row = 2; row >= 0; row--) {
    for (let i = 0; i < n - row; i++) {
      const x = (i + .5 + (row % 2) * .5) / (n - row) * W + (hash(i, row) - .5) * 40;
      const h = [980, 860, 760][row] * (o.scale ?? 1);
      const y = y0 + [120, 40, -30][row];
      const armsUp = up > .3 && hash(i, row, 7) < .6;
      stranger(g, x, y + h * .15, h, 400 + row * 20 + i, { t, silhouette: 1, armL: armsUp ? 'up' : 'down', armR: armsUp && hash(i, row, 8) < .5 ? 'up' : 'down' });
    }
  }
  }, { dx: -6, dy: -5 });
}
