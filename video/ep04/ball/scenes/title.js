// The title card (before the first word): a turning sunburst, the title lettered in an arch,
// and Clawd popping up to tip his boater as the piano vamps.
import { W, H, TAU, clamp, lerp, now, when, REC, beatPos } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, GOLD } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { sunburst } from '../places.js';
import { word, label, textW, DISPLAY, PATTER } from '../type.js';
import { clawd } from '../clawd.js';
import { shape, rrect, ellipse } from '../ink.js';
import { pop, ramp, at } from '../common.js';

// Letter a string along an arc centred on (cx, cy) of radius r, spanning `span` radians.
export function archText(g, s, cx, cy, r, size, font, o = {}) {
  const total = textW(g, s, font, size);
  const span = total / r;
  let a = -Math.PI / 2 - span / 2;
  let acc = 0;
  const chars = [...s];
  chars.forEach((ch, i) => {
    const cw = textW(g, ch, font, size);
    const ang = a + (acc + cw / 2) / r;
    const p = o.p ? o.p(i, chars.length) : 1;
    if (p > 0) {
      g.save(); g.translate(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); g.rotate(ang + Math.PI / 2);
      g.scale(p, p);
      word(g, ch, -cw / 2, 0, size, font, { fill: o.fill, seed: i * 3 + (o.seed || 0) });
      g.restore();
    }
    acc += cw;
  });
}

export function register() {
  const first = when('Two hundred', 'Two');
  const end = first - .12;
  shot(0, end, (g, t) => {
    g.fillStyle = CREAM; g.fillRect(0, 0, W, H);
    sunburst(g, W / 2, H * .44, t * .12, [TEAL, '#ead7a8']);
    // a cream roundel behind the title
    shape(g, ellipse(W / 2, H * .44, 470, 470, 0, 80), { fill: '#f3e3bb', w: 12, seed: 3001 });
    shape(g, ellipse(W / 2, H * .44, 440, 440, 0, 80), { fill: null, w: 5, seed: 3002 });
    const tp = i => clamp((t - .1 - i * .03) / .2);
    label(g, 'SOFTWARE QUALITY THEORY 101', W / 2, H * .44 - 300, 40, { font: PATTER, col: CORAL });
    archText(g, 'DID YOU', W / 2, H * .44 - 150 + 1400, 1400, 118, DISPLAY, { p: (i) => tp(i), seed: 1 });
    archText(g, 'ACTUALLY', W / 2, H * .44 - 10 + 1400, 1400, 124, DISPLAY, { p: (i) => tp(i + 7), seed: 2 });
    archText(g, 'TEST IT?', W / 2, H * .44 + 170 + 1400, 1400, 170, DISPLAY, { fill: GOLD, p: (i) => tp(i + 15), seed: 3 });
    label(g, 'EPISODE 4', W / 2, H * .44 + 300, 44, { font: PATTER, col: INK });
    // Clawd pops up from below and tips his hat on the vamp
    const up = pop(t, .6, .45);
    clawd(g, W / 2, H + 40 - up * 420, 1.05, { t, L: 'wave', R: 'hips', eyes: { expr: 'happy' }, hatTip: clamp((t - 1.3) / .3) * (1 - clamp((t - 2.0) / .3)), smile: 1 });
    label(g, 'starring CLAWD with PRESS, STRESS & GUESS', W / 2, H - 520 + (1 - ramp(t, .9, .3)) * 60, 40, { font: PATTER, col: CREAM, ow: .22 });
  }, { id: 'title' });
  irisJoin(first - .1, { close: .45, open: .45, x: W / 2, y: H * .55 });
}
