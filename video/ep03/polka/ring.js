// The dog show ring, the place where software is judged: a sawdust ring on the meadow with a rope on
// posts, far trees and bunting, and, in the same drawing, its night (dark blue, cream pencil, fairy
// lights) and its golden hour (a low sun, peach light). The choruses use it, and so do the lead-in and
// the outro. Everything is the same drawing in three moods, so the viewer knows it is one place.
import { W, H, TAU, clamp, lerp, hash, sway, beatPulse, downPulse, beatPos, loud } from './kit.js';
import { paper } from './paper.js';
import { blob, line, dot, hatch, scrub } from './pencil.js';
import { ellipse, rrect, star, capsule } from './shapes.js';
import { sun, cloud, tree, bunting } from './world.js';
import { meadow, sky } from './common.js';
import { GRAPHITE, C } from './palette.js';

// The three moods of the ring.
export const RING_MOODS = {
  day: { paper: '#f8efc9', vignette: .1, sky: '#79c2ef', skyA: .28, grass: C.green, grass2: C.lime, sawdust: '#e6c88f', sawdust2: '#d9a35a', rope: C.red, post: '#8b5f2a', ink: GRAPHITE, hedge: '#4fae5c', flags: null },
  night: { paper: '#1c2552', vignette: .25, sky: null, skyA: 0, grass: '#2f6b4e', grass2: '#1f4a37', sawdust: '#6d6a58', sawdust2: '#57543f', rope: '#e8504a', post: '#cdb98a', ink: '#f5eedd', hedge: '#1f4a37', flags: null },
  gold: { paper: '#fbd9b0', vignette: .12, sky: '#f5a35d', skyA: .34, grass: '#8fbf5a', grass2: '#c8c85a', sawdust: '#f0c58a', sawdust2: '#e0a15f', rope: C.red, post: '#8b5f2a', ink: GRAPHITE, hedge: '#5f9f4a', flags: null },
};

// The ring itself as geometry, for the things that stand in it.
export const RING = { cx: 540, cy: 1190, rx: 520, ry: 230, far: 960 };

// The whole backdrop. o.mood: 'day' | 'night' | 'gold'; o.sunMood, o.look: the sun's face (day and gold).
export function ringBackdrop(g, t, o = {}) {
  const { mood = 'day', sunMood = 'happy', look = [0, .4], bunt = true, seed = 21 } = o;
  const P = RING_MOODS[mood];
  paper(g, { base: P.paper, vignette: P.vignette });
  if (P.sky) sky(g, t, 900, { alpha: P.skyA, col: P.sky, seed });
  // Far off: a sun (day: peeking in over the ring; gold: low and large), clouds, trees, a hedge.
  if (mood === 'day') { sun(g, t, 990, 700, 84, { mood: sunMood, look, seed: seed + 1 }); cloud(g, t, 190, 720, .9, { seed: seed + 2, drift: 3 }); }
  if (mood === 'gold') sun(g, t, 190, 880, 130, { mood: sunMood === 'happy' ? 'happy' : sunMood, look, seed: seed + 1, rays: 14 });
  if (mood === 'night') {
    // A moon, and stars.
    for (let i = 0; i < 26; i++) {
      const x = 40 + hash(i, 1) * 1000, y = 640 + hash(i, 2) * 300;
      const tw = .55 + .45 * Math.sin(t * 2.4 + i * 1.9);
      dot(g, x, y, 3.4 * tw + 1.4, { col: '#fff3b0', seed: 400 + i, t });
    }
    blob(g, ellipse(930, 760, 70, 70, 14, 0, seed + 3), { fill: '#f7d774', shade: '#e0a93a', line: '#f5eedd', lw: 5, seed: seed + 3, t, tone: .55, sh: .3 });
  }
  scrub(g, [0, 880, W, 1010], { col: P.hedge, seed: seed + 5, t, gap: 24, w: 28, alpha: mood === 'night' ? .5 : .35, angle: -.06, wig: 16 });
  [[70, .5], [230, .36], [860, .42], [1010, .34]].forEach(([tx, ts], i) => tree(g, t, tx, 930, ts, { seed: 60 + i, crown: mood === 'night' ? '#2f6b4e' : mood === 'gold' ? '#8fbf5a' : '#8fcf7a', shade: mood === 'night' ? '#1f4a37' : '#5fae5a', far: mood !== 'night' }));
  // The grass, mown in stripes, and the ring's sawdust.
  scrub(g, [0, 940, W, H], { col: P.grass, seed: seed + 6, t, gap: 20, w: 28, alpha: .55, angle: -.1, wig: 20 });
  scrub(g, [0, 1000, W, H], { col: P.grass2, seed: seed + 7, t, gap: 36, w: 24, alpha: .35, angle: .16, wig: 18 });
  const R = RING;
  blob(g, ellipse(R.cx, R.cy, R.rx, R.ry, 18, 0, seed + 8), { fill: P.sawdust, shade: P.sawdust2, line: P.ink, lw: 5.4, seed: seed + 8, t, hw: 5.6, gap: 7, tone: .55, sh: .35 });
  // The rope on posts round the back of the ring, and the near side, low in front.
  const posts = [];
  for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.02 + i / 8 * .96); posts.push([R.cx + Math.cos(a) * (R.rx + 24), R.cy + Math.sin(a) * (R.ry + 14)]); }
  line(g, posts.map(([x, y]) => [x, y - 96]), { w: 11, col: P.rope, seed: seed + 9, t, spline: true, passes: 1, tooth: .5 });
  posts.forEach(([x, y], i) => {
    line(g, [[x, y - 118], [x, y + 8]], { w: 15, col: P.post, seed: seed + 20 + i, t, spline: false, passes: 1, flat: true });
    dot(g, x, y - 120, 9, { col: mood === 'night' ? '#f5eedd' : '#fbf8ef', seed: seed + 40 + i, t });
  });
  // Bunting from the ring's posts across the top of the picture.
  if (bunt) {
    bunting(g, t, 20, 96, W - 20, 96, { n: 13, sag: 40, seed: seed + 60, size: 34, cols: mood === 'night' ? ['#e8504a', '#f7d774', '#79c2ef', '#8ccf7a', '#f27eaa'] : undefined });
  }
  if (mood === 'night') fairyLights(g, t, seed + 70);
}

// Fairy lights strung across the ring at night: small warm bulbs that glow on the beat.
export function fairyLights(g, t, seed = 70) {
  const P = i => { const u = i / 22; return [lerp(30, W - 30, u), 690 + Math.sin(u * Math.PI * 3) * 26 + Math.sin(u * Math.PI) * 20]; };
  line(g, Array.from({ length: 23 }, (_, i) => P(i)), { w: 4, col: '#8b7f60', seed, t, passes: 1 });
  for (let i = 1; i < 22; i++) {
    const [x, y] = P(i);
    const gl = .6 + .4 * Math.sin(t * 5 + i * 1.3) + beatPulse(t, .16) * .3;
    g.save(); g.globalAlpha *= .22 * clamp(gl); g.fillStyle = '#ffe28a'; g.beginPath(); g.arc(x, y + 14, 26, 0, TAU); g.fill(); g.restore();
    dot(g, x, y + 12, 8, { col: i % 2 ? '#ffe28a' : '#ffb87a', seed: seed + i, t });
  }
}

// A soft cone of light from above onto (x, y) with radius r: pale, a little shimmer.
export function spotlight(g, t, x, y, r, o = {}) {
  const { from = [x, 560], alpha = .22, col = '#fff3b0' } = o;
  g.save();
  g.globalAlpha *= alpha;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col); gr.addColorStop(1, col.length === 7 ? col + '00' : col);
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(from[0] - 40, from[1]); g.lineTo(from[0] + 40, from[1]); g.lineTo(x + r, y); g.lineTo(x - r, y); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(x, y, r, r * .28, 0, 0, TAU); g.fill();
  g.restore();
}

// The judging table: a light wooden top over a blue front with white stars.
export function judgeTable(g, t, x, y, w = 660, o = {}) {
  const { night = false, seed = 840 } = o;
  const ink = night ? '#f5eedd' : GRAPHITE;
  blob(g, [[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 40, y - 40], [x - w / 2 + 40, y - 40]], { fill: night ? '#8a7a55' : '#e2b878', shade: '#a9793a', line: ink, lw: 6.4, seed, t, hw: 5, tone: .7, sh: .4 });
  blob(g, rrect(x, y + 80, w, 160, 14, 3, seed + 1), { fill: C.blue, shade: '#233b7a', line: ink, lw: 6.4, seed: seed + 1, t, hw: 5, tone: .6, sh: .25 });
  for (let i = 0; i < 5; i++) blob(g, star(x - w * .36 + i * w * .18, y + 80, 24, 10, 5, -Math.PI / 2 + i * .2, seed + 10 + i), { fill: '#fbf8ef', line: null, seed: seed + 2 + i, t, gap: 5, hw: 4.6, tone: .9 });
}
