// The cast and props that belong to the show ring, shared by the choruses' gags: the judge's bowler,
// the show dog on the table with his WALKIES badge, hurdles, confetti. (Chorus 2 and 3 cast them
// differently: the bulldog judges and Clawd is on the table.)
import { W, H, TAU, clamp, lerp, hash, beatPulse } from './kit.js';
import { blob, line, dot } from './pencil.js';
import { ellipse, rrect, scallop, star } from './shapes.js';
import { write } from './hand.js';
import { clawd } from './chars.js';
import { dogFront } from './people.js';
import { GRAPHITE, C } from './palette.js';

export const ROSETTES = [C.red, C.orange, C.yellow, C.lime, C.green, C.teal, C.sky, C.blue, C.purple, C.pink, C.brown, C.grey];

// Where the show happens (master pixels).
export const SPOT = {
  judge: { x: 265, y: 1420, s: 1.12 },
  table: { x: 660, y: 1170, w: 720 },
  dog: { x: 660, y: 988, s: 1.85 },      // the show dog's chin, sitting on the table
  gate: { x: 960, y: 1290 },
  ground: 1360,                           // the ground line for things that run across the ring
};

// A judge's bowler on Clawd's head (his prop callback: drawn in his own space, feet at y = 0).
export function bowler(g, t, o = {}) {
  const top = -246;
  blob(g, [[-92, top + 4], [-74, top - 54], [-34, top - 88], [34, top - 88], [74, top - 54], [92, top + 4]], { fill: '#3a3947', shade: '#1a1a22', line: GRAPHITE, lw: 6, seed: 850, t, hw: 4.6, tone: .9, sh: .3 });
  blob(g, ellipse(0, top + 6, 132, 15, 10, 0, 851), { fill: '#3a3947', line: GRAPHITE, lw: 6, seed: 851, t, hw: 4.6, tone: .9 });
  line(g, [[-78, top - 20], [0, top - 12], [78, top - 20]], { w: 12, col: C.red, seed: 852, t, spline: true, passes: 1 });
}

// Clawd as the judge, standing by the table with his bowler; pass anything `clawd()` takes.
export function judgeClawd(g, t, cx, o = {}) {
  const J = SPOT.judge;
  clawd(g, { x: J.x, y: J.y, s: J.s, t, seed: 1, eyes: 'open', mouth: clamp(cx.vox * 1.4 - .05), bob: cx.gr.bob, squash: cx.gr.sq, lean: cx.gr.lean, prop: (g2, po) => bowler(g2, t, po), ...o });
}

// The show dog: a scruffy mutt sitting on the table with a WALKIES badge on his chest.
export function showDog(g, t, cx, o = {}) {
  const D = SPOT.dog;
  const { x = D.x, y = D.y, s = D.s, badge = true, eyes = 'dot', mouth = cx.gr.bp > .5 ? .5 : 0, tongue = true, ear = cx.gr.lean * 8, sad = 0 } = o;
  dogFront(g, { x, y: y - cx.gr.bob * .4, s, t, seed: 3, breed: 'mutt', eyes, mouth, tongue, body: true, collar: C.red, ear, brow: sad });
  if (badge) {
    g.save(); g.translate(x, y + 86 * s); g.rotate(Math.sin(t * 2.1) * .04);
    blob(g, rrect(0, 0, 132, 50, 10, 3, 861), { fill: '#fbf8ef', line: GRAPHITE, lw: 4.6, seed: 861, t, hw: 4.4, tone: .9, dens: .3 });
    write(g, 'WALKIES', 0, 15, 22, { col: C.blue, seed: 862, t, align: 'center', track: 3, w: .11 });
    g.restore();
  }
}

// The table itself: a light wooden top over a blue front with white stars (day).
export function tableFront(g, t, night = false) {
  const T = SPOT.table, ink = night ? '#f5eedd' : GRAPHITE;
  blob(g, rrect(T.x, T.y - 16, T.w, 40, 16, 3, 840), { fill: night ? '#8a7a55' : '#e2b878', shade: '#a9793a', line: ink, lw: 6.4, seed: 840, t, hw: 5, tone: .7, sh: .5 });
  blob(g, rrect(T.x, T.y + 86, T.w - 40, 150, 14, 3, 841), { fill: C.blue, shade: '#233b7a', line: ink, lw: 6.4, seed: 841, t, hw: 5, tone: .6, sh: .25 });
  for (let i = 0; i < 5; i++) blob(g, star(T.x - T.w * .34 + i * T.w * .17, T.y + 88, 26, 11, 5, -Math.PI / 2 + i * .2, 842 + i), { fill: '#fbf8ef', line: null, seed: 842 + i, t, gap: 5, hw: 4.6, tone: .9 });
}

// A hurdle: two posts and a striped bar; `hit` 0..1 sends the bar flying (and `dir` the way).
export function hurdle(g, t, x, y, s = 1, o = {}) {
  const { hit = 0, dir = 1, seed = 870 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  [-1, 1].forEach((sd, i) => line(g, [[sd * 120, 0], [sd * 120, -150]], { w: 16, col: '#8b5f2a', seed: seed + i, t, spline: false, passes: 1, flat: true }));
  g.save();
  g.translate(-dir * hit * 300, -130 - Math.sin(hit * Math.PI) * 190 + hit * hit * 118); g.rotate(-dir * hit * TAU);
  line(g, [[-120, 0], [120, 0]], { w: 22, col: C.red, seed: seed + 3, t, spline: false, passes: 1, flat: true, tooth: .5 });
  line(g, [[-70, 0], [-40, 0]], { w: 22, col: '#fbf8ef', seed: seed + 4, t, spline: false, passes: 1, flat: true, tooth: .5 });
  line(g, [[30, 0], [60, 0]], { w: 22, col: '#fbf8ef', seed: seed + 5, t, spline: false, passes: 1, flat: true, tooth: .5 });
  g.restore();
  g.restore();
}

// Confetti: little strokes tumbling down from the top for `dur` seconds after t0 (cheap: one stroke each).
export function confetti(g, t, t0, dur = 1.6, o = {}) {
  const { n = 70, seed = 5, y0 = 100, y1 = 1500, cols = ROSETTES } = o;
  const p = (t - t0) / dur;
  if (p <= 0 || p >= 1.15) return;
  for (let i = 0; i < n; i++) {
    const d = hash(seed, i, 1) * .35, q = clamp((p - d) / (1 - d));
    if (q <= 0 || q >= 1) continue;
    const x = hash(seed, i, 2) * W + Math.sin(q * 6 + i) * 30, y = lerp(y0, y1, q * q * .6 + q * .4) - (1 - q) * 30;
    const a = q * (6 + hash(seed, i, 3) * 6) + i;
    line(g, [[x - Math.cos(a) * 10, y - Math.sin(a) * 10], [x + Math.cos(a) * 10, y + Math.sin(a) * 10]], { w: 9, col: cols[i % cols.length], seed: seed * 100 + i, t, spline: false, passes: 1, alpha: .95 * (1 - Math.max(0, q - .8) * 5) });
  }
}
