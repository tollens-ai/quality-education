// Props and set pieces for the bridge: a dog-training class on the meadow. A whiteboard on an easel that
// everything the lesson "says" is written on in marker, a pointer, the dimension slider (a puddle at one
// end, a rosette at the other, a little dog for the knob), and the dogs of the class, who yawn, scratch
// and listen. Drawn with the same pen as the rest of the film.
import { W, H, clamp, lerp, hash, TAU, easeOut, backOut, inv, smooth, noise, rng, mix } from './kit.js';
import { blob, line, dot, hatch, scrub, spline, outline } from './pencil.js';
import { write, measure, layout } from './hand.js';
import { rrect, ellipse, star, scallop, capsule, roundPoly, move, rotate, scale } from './shapes.js';
import { dogFront } from './people.js';
import { rosette } from './props.js';
import { drawBall } from './board.js';
import { GRAPHITE, C, PAPER } from './palette.js';

const ink = GRAPHITE;

// ---------------------------------------------------------------- where things are, in Clawd's own space
// A point in the world (px) as Clawd's own drawing sees it: the inverse of the placement `clawd()` makes
// (translate, lean, scale, flip, squash). Arms and props are given in this space.
export function toLocal(c, wx, wy) {
  const sq = c.squash || 0, fl = c.flip ?? 1;
  const sx = c.s * fl * (1 + sq * .1), sy = c.s * (1 - sq * .13);
  const dx = wx - c.x, dy = wy - (c.y - (c.bob || 0));
  const co = Math.cos(-(c.lean || 0)), si = Math.sin(-(c.lean || 0));
  return [(dx * co - dy * si) / sx, (dx * si + dy * co) / sy];
}
export function fromLocal(c, lx, ly) {
  const sq = c.squash || 0, fl = c.flip ?? 1;
  const sx = c.s * fl * (1 + sq * .1), sy = c.s * (1 - sq * .13);
  const co = Math.cos(c.lean || 0), si = Math.sin(c.lean || 0);
  const X = lx * sx, Y = ly * sy;
  return [c.x + X * co - Y * si, (c.y - (c.bob || 0)) + X * si + Y * co];
}
// Clawd's shoulder, in the world.
export const shoulder = (c, side) => fromLocal(c, side * 142, -152);

// ---------------------------------------------------------------- marker lettering
// Hand-printed capitals in a felt-tip: a little fatter than the pencil's, in the marker's colour.
export function marker(g, str, x, y, size, o = {}) {
  const { col = C.blue, t = 0, seed = 1, prog = 1, align = 'center', w = .125, track = 5, alpha = .96, rot = 0, dance = 0, beat = 0, pulse = 0 } = o;
  if (prog <= 0) return 0;
  return write(g, str, x, y, size, { col, seed, t, prog, align, w, track, alpha, rot, wonk: 1.15, dance, beat, pulse });
}
// Where the marker's tip is while a string is being written: the current letter's middle.
export function writeHead(str, x, y, size, prog, o = {}) {
  const { align = 'center', track = 5, seed = 1 } = o;
  const L = layout(str, size, { track, seed, wonk: 1.15 });
  const total = L.letters.reduce((a, l) => a + l.len, 0) || 1;
  const ox = align === 'center' ? x - L.width / 2 : align === 'right' ? x - L.width : x;
  let acc = 0;
  for (const l of L.letters) {
    const a1 = (acc + l.len) / total;
    if (prog <= a1 || l === L.letters[L.letters.length - 1]) return [ox + l.x + (l.gl.adv * size / 100) * .5, y - size * .5];
    acc += l.len;
  }
  return [x, y];
}

// ---------------------------------------------------------------- the pointer
// A telescoping teacher's pointer from the hand to a tip, with a red rubber end. `flex` bows it sideways (px),
// so a stick that is whipped about bends the way a long thin one does.
export function pointer(g, t, a, b, o = {}) {
  const { col = '#4a4959', tip = C.red, w = 9, seed = 40, flex = 0 } = o;
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
  const a2 = [a[0] - ux * 34, a[1] - uy * 34];
  const bow = (u, k) => [lerp(a2[0], b[0], u) - uy * flex * k, lerp(a2[1], b[1], u) + ux * flex * k];
  line(g, [a2, bow(.5, 1), b], { w, col, seed, t, spline: true, passes: 1, taper: [.02, .03], bow: 0, over: 0, wob: .7, alpha: .96 });
  // A collar where it telescopes.
  const m = bow(.4, .96);
  line(g, [[m[0] - ux * 14, m[1] - uy * 14], [m[0] + ux * 14, m[1] + uy * 14]], { w: w * 1.7, col: '#8d8c97', seed: seed + 2, t, spline: false, passes: 1, flat: true, over: 0, bow: 0 });
  line(g, [[b[0] - ux * 36, b[1] - uy * 36], b], { w: w * 1.9, col: tip, seed: seed + 1, t, spline: false, passes: 1, taper: [.02, .02], bow: 0, over: 0, wob: .4 });
}

// ---------------------------------------------------------------- the whiteboard on its easel
// A white board in a grey frame, a marker tray under it, on a wooden easel with splayed legs. (x, y) is the
// middle of the board. Returns the writing area.
export function whiteboard(g, t, o = {}) {
  const { x = 540, y = 955, w = 960, h = 590, seed = 700, legs = true, feet = 200, tray = true, tone = '#f6fafe' } = o;
  const fr = 24;
  const x0 = x - w / 2, x1 = x + w / 2, y0 = y - h / 2, y1 = y + h / 2;
  if (legs) {
    [-1, 1].forEach((side, i) => {
      const top = [x + side * w * .29, y1 - 24], foot = [x + side * (w * .35 + 16), y1 + feet];
      blob(g, capsule(top, foot, 17, 14, 5, seed + 20 + i), { fill: '#c99a5a', shade: '#8b5f2a', line: ink, lw: 6.4, seed: seed + 20 + i, t, hw: 5, sh: .4, tone: .6 });
    });
    line(g, [[x - w * .32, y1 + feet * .56], [x + w * .32, y1 + feet * .56]], { w: 15, col: '#a9793a', seed: seed + 22, t, spline: false, passes: 1, over: 0, wob: 1 });
    line(g, [[x - w * .32, y1 + feet * .56 - 7], [x + w * .32, y1 + feet * .56 - 7]], { w: 4, col: ink, seed: seed + 23, t, spline: false, passes: 1, over: 0, alpha: .7 });
  }
  // The surface, then the frame in four bars, then the outline.
  blob(g, rrect(x, y, w - fr, h - fr, 14, 3, seed + 1, .5), { fill: tone, line: null, seed: seed + 1, t, hw: 5, gap: 7, tone: 1.7, dens: .8, angle: -.7 });
  // A faint glare across the top left.
  line(g, [[x0 + 90, y0 + 70], [x0 + 210, y0 + 34]], { w: 12, col: '#dcecf7', seed: seed + 30, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .9, tooth: .35 });
  line(g, [[x0 + 60, y0 + 108], [x0 + 128, y0 + 86]], { w: 7, col: '#dcecf7', seed: seed + 31, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .9, tooth: .35 });
  const fc = '#aeb3c2';
  line(g, [[x0 + 8, y0 + fr / 2], [x1 - 8, y0 + fr / 2]], { w: fr, col: fc, seed: seed + 2, t, spline: false, passes: 1, flat: true, tooth: .5, over: 0, bow: 0 });
  line(g, [[x0 + 8, y1 - fr / 2], [x1 - 8, y1 - fr / 2]], { w: fr, col: fc, seed: seed + 3, t, spline: false, passes: 1, flat: true, tooth: .5, over: 0, bow: 0 });
  line(g, [[x0 + fr / 2, y0 + 8], [x0 + fr / 2, y1 - 8]], { w: fr, col: fc, seed: seed + 4, t, spline: false, passes: 1, flat: true, tooth: .5, over: 0, bow: 0 });
  line(g, [[x1 - fr / 2, y0 + 8], [x1 - fr / 2, y1 - 8]], { w: fr, col: fc, seed: seed + 5, t, spline: false, passes: 1, flat: true, tooth: .5, over: 0, bow: 0 });
  outline(g, rrect(x, y, w, h, 26, 3, seed + 6, .5), { col: ink, w: 6.6, seed: seed + 6, t, alpha: .9, tooth: .55 });
  outline(g, rrect(x, y, w - fr * 2, h - fr * 2, 10, 3, seed + 7, .5), { col: ink, w: 4.4, seed: seed + 7, t, alpha: .75, tooth: .55 });
  if (tray) {
    blob(g, rrect(x, y1 + 18, w * .62, 26, 8, 2, seed + 8, .4), { fill: '#aeb3c2', shade: '#7d8291', line: ink, lw: 5.4, seed: seed + 8, t, hw: 4.6, tone: .7, sh: .3 });
    [[-.2, C.blue], [-.14, C.red], [-.08, C.green]].forEach(([u, col], i) => {
      const mx = x + w * u * 1.5, my = y1 + 4;
      line(g, [[mx - 26, my], [mx + 26, my + 2]], { w: 13, col, seed: seed + 40 + i, t, spline: false, passes: 1, over: 0, bow: 0, flat: true, tooth: .5 });
      line(g, [[mx + 18, my], [mx + 30, my + 2]], { w: 13, col: ink, seed: seed + 44 + i, t, spline: false, passes: 1, over: 0, bow: 0, flat: true, tooth: .5 });
    });
  }
  return { x: x0 + fr + 8, y: y0 + fr + 8, w: w - fr * 2 - 16, h: h - fr * 2 - 16, cx: x, cy: y };
}

// ---------------------------------------------------------------- a puddle
export function puddle(g, t, x, y, s = 1, o = {}) {
  const { seed = 80, splash = 0, ripple = 0 } = o;
  // An uneven puddle: three lobes and a bay, not an oval.
  const pts = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * TAU, r = 1 + .17 * Math.sin(2 * a + 1.1 + seed) + .1 * Math.sin(3 * a + .4) + .05 * Math.sin(5 * a); return [x + Math.cos(a) * 124 * s * r, y + Math.sin(a) * 36 * s * r]; });
  blob(g, pts, { fill: '#8ccff5', shade: '#3f7fc4', line: ink, lw: 6, seed, t, hw: 5, tone: .8, sh: .35 });
  // A glint, and ripples that widen and fade.
  line(g, [[x - 62 * s, y - 8 * s], [x - 30 * s, y - 14 * s]], { w: 5, col: '#fbf8ef', seed: seed + 9, t, spline: false, passes: 1, over: 0, alpha: .95 });
  for (let k = 0; k < 2; k++) {
    const p = ((t * .8 + k * .5 + ripple) % 1);
    const rx = (24 + p * 52) * s, ry = rx * .28;
    g.save(); g.globalAlpha *= (1 - p) * .9;
    line(g, Array.from({ length: 17 }, (_, i) => [x + 14 * s + Math.cos(i / 16 * TAU) * rx, y + 2 * s + Math.sin(i / 16 * TAU) * ry]), { w: 4.4, col: '#fbf8ef', seed: seed + 5 + k, t, spline: false, passes: 1, closed: true, over: 0, alpha: .95 });
    g.restore();
  }
  // A splash: drops thrown up and falling back.
  if (splash > 0 && splash < 1) {
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * (.12 + hash(seed, i) * .76), v = 190 + hash(seed, i, 2) * 200;
      const u = splash * .9, px = x + Math.cos(a) * v * u * s * .7, py = y + Math.sin(a) * v * u * s * 1.2 + 420 * u * u * s;
      if (py < y + 12 * s) blob(g, ellipse(px, py, 11 * s, 16 * s, 6, 0, seed + 20 + i), { fill: '#8ccff5', line: ink, lw: 3.4, seed: seed + 20 + i, t, hw: 4, tone: .8 });
    }
  }
}

// ---------------------------------------------------------------- the dimension slider
// A slider: a grey track, its knob at pos (0..1). `knob(g, x, y)` draws the knob; `prog` draws the track on.
export function dimSlider(g, t, x, y, w, o = {}) {
  const { seed = 60, pos = .5, prog = 1, thick = 24, knob = null, col = C.blue, ticks = true } = o;
  if (prog <= 0) return [x - w / 2, y];
  const x0 = x - w / 2, x1 = x0 + w * prog;
  line(g, [[x0, y], [x1, y]], { w: thick, col: '#c9ccd6', seed, t, spline: false, passes: 1, flat: true, tooth: .55, over: 0, bow: 0 });
  line(g, [[x0, y - thick / 2], [x1, y - thick / 2]], { w: Math.max(3, thick * .2), col: ink, seed: seed + 1, t, spline: false, passes: 1, over: 0, alpha: .85 });
  line(g, [[x0, y + thick / 2], [x1, y + thick / 2]], { w: Math.max(3, thick * .2), col: ink, seed: seed + 2, t, spline: false, passes: 1, over: 0, alpha: .85 });
  // The part below the knob is coloured in, like a volume bar.
  const kx = x0 + w * pos;
  if (prog >= 1 && pos > 0) line(g, [[x0 + 4, y], [kx, y]], { w: thick * .5, col, seed: seed + 3, t, spline: false, passes: 1, flat: true, tooth: .5, over: 0, bow: 0, alpha: .9 });
  if (ticks && prog >= 1 && thick > 16) for (let i = 1; i < 4; i++) line(g, [[x0 + w * i / 4, y - thick / 2 - 8], [x0 + w * i / 4, y - thick / 2]], { w: 4, col: ink, seed: seed + 8 + i, t, spline: false, passes: 1, over: 0, alpha: .6 });
  if (knob && prog >= 1) knob(g, kx, y);
  return [kx, y];
}

// ---------------------------------------------------------------- the class
// Coats for the extras a dog is given on top of dogFront (a scratching leg), matching people.js's breeds.
const COAT = {
  bulldog: ['#d6a165', '#a26f3a'], lab: ['#e2b04a', '#b07f22'], poodle: ['#f1e4c8', '#c9b58a'], corgi: ['#e6913a', '#b56a1c'], sheepdog: ['#c9c7cf', '#8f8d99'],
  beagle: ['#b8783a', '#7f4c1e'], pug: ['#e3c08a', '#a98550'], chihuahua: ['#e9c9a0', '#b8946a'], dalmatian: ['#fbf8ef', '#cfcabd'], husky: ['#9a9aa8', '#63636f'],
  greyhound: ['#a7a2b0', '#726d7c'], mutt: ['#c98f56', '#95622f'],
};
const RY = { bulldog: 80, lab: 76, poodle: 66, corgi: 68, sheepdog: 88, beagle: 70, pug: 76, chihuahua: 56, dalmatian: 72, husky: 72, greyhound: 74, mutt: 72 };
const RX = { bulldog: 96, lab: 78, poodle: 62, corgi: 74, sheepdog: 92, beagle: 72, pug: 84, chihuahua: 58, dalmatian: 72, husky: 76, greyhound: 54, mutt: 76 };
export const coatOf = breed => COAT[breed] || COAT.mutt;
export const headSize = breed => ({ rx: RX[breed] || 76, ry: RY[breed] || 72 });

// A hind leg scratching an ear: a leg from the hip up to the side of the head, the paw going fast.
function scratchLeg(g, t, breed, side, seed, amt) {
  const [fill, shade] = coatOf(breed), { rx, ry } = headSize(breed);
  const bw = rx * 1.5, bh = ry * 1.25;
  const cyc = Math.sin(t * TAU * 5.2), c2 = Math.cos(t * TAU * 5.2);
  const hip = [side * bw * .5, bh * .72];
  const paw = [side * (rx * .96 + 12 + cyc * 9 * amt), -ry * .78 + 22 + c2 * 14 * amt];
  blob(g, capsule(hip, paw, 22, 17, 5, seed), { fill, shade, line: ink, lw: 5.6, seed, t, hw: 4.6, sh: .3, tone: .5 });
  blob(g, ellipse(paw[0], paw[1], 22, 17, 8, 0, seed + 1), { fill, line: ink, lw: 5, seed: seed + 1, t, hw: 4.4, tone: .6 });
  // Two little motion strokes by the paw.
  for (let k = 0; k < 2; k++) line(g, [[paw[0] + side * (26 + k * 10), paw[1] - 8 + k * 14 - c2 * 5], [paw[0] + side * (40 + k * 12), paw[1] - 14 + k * 16 - c2 * 5]], { w: 4.2, col: C.grey, seed: seed + 5 + k, t, spline: false, passes: 1, over: 0, alpha: .8 });
}

// Snout boxes (width, height, centre offset from the head's middle) as people.js draws them, for what is drawn on a muzzle.
const SNOUT = {
  bulldog: [108, 58, 30], lab: [84, 60, 28], poodle: [56, 74, 32], corgi: [76, 62, 26], sheepdog: [70, 54, 40], beagle: [74, 60, 28], pug: [80, 52, 30],
  chihuahua: [46, 44, 22], dalmatian: [80, 60, 28], husky: [72, 58, 26], greyhound: [46, 82, 38], mutt: [80, 58, 28],
};
// A wide-open mouth on a front-on dog (a yawn, a howl, a gulp), drawn over the little one people.js gives: k 0..1.
export function bigMouth(g, t, breed, k, o = {}) {
  const { seed = 5, tongue = true } = o;
  if (k <= .02) return;
  const { ry } = headSize(breed), [sw, sh, sy0] = SNOUT[breed] || SNOUT.mutt;
  const cy = -ry + sy0 + sh * .34, mw = sw * .4 * (.6 + .4 * k), mh = 8 + sh * .62 * k;
  blob(g, ellipse(0, cy + mh * .5, mw, mh * .62, 10, 0, seed), { fill: '#7a2e2a', line: ink, lw: 5, seed, t, gap: 4, hw: 4.2, tone: .9 });
  if (tongue && k > .4) blob(g, ellipse(0, cy + mh * .95, mw * .62, mh * .26, 8, 0, seed + 1), { fill: C.pink, line: ink, lw: 3.6, seed: seed + 1, t, gap: 4, hw: 3.8, tone: .8 });
}

// A dog of the class: dogFront, plus what a pupil does: yawn, scratch, tilt, wear a sash or a tag.
//   yawn 0..1 (mouth wide, eyes shut, head back)    scratch 0..1 (side: -1|1)     extra(g, rx, ry): more drawn in the dog's own space
export function pupil(g, t, o = {}) {
  const { breed = 'mutt', x = 540, y = 1500, s = 1, seed = 1, eyes = 'dot', mouth = 0, look = [0, 0], tilt = 0, bob = 0, squash = 0, ear = 0, collar = C.red, tag = C.yellow,
    yawn = 0, scratch = 0, scratchSide = 1, extra = null, body = true, brow = 0, tongue = false, sweat = false, flip = 1, hat = null, howl = 0 } = o;
  const { rx, ry } = headSize(breed);
  const big = Math.max(yawn, howl);
  dogFront(g, {
    x, y, s, t, seed, breed, body, bob, tilt: tilt - yawn * .06, squash, ear, look, collar, tag, brow, sweat, flip,
    eyes: yawn > .3 ? 'shut' : scratch > .3 && eyes === 'dot' ? 'squint' : eyes,
    mouth: big > 0 ? 0 : mouth, tongue: big > 0 ? false : tongue,
    hat: (g2, top, rx2) => {
      if (big > 0) bigMouth(g2, t, breed, big, { seed: seed * 5 + 1 });
      if (scratch > 0) scratchLeg(g2, t, breed, scratchSide, seed * 7 + 3, scratch);
      if (extra) extra(g2, rx, ry);
      if (hat) hat(g2, top, rx2);
    },
  });
}

// ---------------------------------------------------------------- the ground under things
// A scribble of darker grass under a foot or a paw: a soft shadow drawn as the rest is.
export function groundShade(g, t, x, y, w, o = {}) {
  const { seed = 3, alpha = .34, h = .2 } = o;
  g.save();
  g.globalAlpha *= alpha;
  hatch(g, ellipse(x, y, w / 2, w * h / 2, 10, 0, seed), { col: '#2b6e3d', seed, t, gap: 6, w: 6.4, angle: -.15, spill: 3, alpha: 1, slop: 0 });
  g.restore();
}
// A training mat: a long foam mat the dogs sit on, with a stitched edge.
export function mat(g, t, x, y, w, h, o = {}) {
  const { col = '#8f7bd6', seed = 90 } = o;
  blob(g, rrect(x, y, w, h, h * .4, 3, seed, .5), { fill: col, shade: '#5a4aa8', line: ink, lw: 5.6, seed, t, hw: 5.2, tone: .6, sh: .3, gap: 7 });
  line(g, [[x - w / 2 + 26, y - h / 2 + 10], [x + w / 2 - 26, y - h / 2 + 10]], { w: 3.4, col: '#e4dcff', seed: seed + 3, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .8 });
}

// A little dog for a slider's knob: head only, chin on the rail.
export function knobDog(g, t, x, y, o = {}) {
  const { s = .5, breed = 'mutt', seed = 9, eyes = 'dot', mouth = 0, tilt = 0, hop = 0, squash = 0, look = [0, 0], collar = C.blue, sweat = false } = o;
  dogFront(g, { x, y: y - hop, s, t, seed, breed, eyes, mouth, tilt, squash, look, collar, body: false, sweat, ear: 0 });
}

// ================================================================= lines 2 to 8
// ---------------------------------------------------------------- leads, sliders, steam
// A lead from a hand to a collar, slack or taut.
export function lead(g, t, a, b, o = {}) {
  const { col = C.red, seed = 1, slack = 14, w = 9 } = o;
  line(g, [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + slack], b], { w, col, seed, t, spline: true, passes: 1, over: 0, bow: 0, wob: 1.1, alpha: .96, taper: [.02, .02] });
}
// A small slider that floats over a dog: a grey rail, its colour up to the knob.
export function miniSlider(g, t, x, y, w, pos, col, o = {}) {
  const { seed = 5, k = 1 } = o;
  if (k <= 0) return;
  g.save(); g.translate(x, y); g.scale(k, k);
  line(g, [[-w / 2, 0], [w / 2, 0]], { w: 13, col: '#c9ccd6', seed, t, spline: false, passes: 1, flat: true, over: 0, bow: 0, tooth: .5 });
  line(g, [[-w / 2 + 3, 0], [-w / 2 + w * pos, 0]], { w: 7, col, seed: seed + 1, t, spline: false, passes: 1, flat: true, over: 0, bow: 0, tooth: .5 });
  line(g, [[-w / 2, -6.5], [w / 2, -6.5]], { w: 3, col: ink, seed: seed + 2, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .7 });
  line(g, [[-w / 2, 6.5], [w / 2, 6.5]], { w: 3, col: ink, seed: seed + 3, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .7 });
  dot(g, -w / 2 + w * pos, 0, 9.5, { col: '#fbf8ef', seed: seed + 4, t });
  dot(g, -w / 2 + w * pos, 0, 6.5, { col, seed: seed + 5, t });
  g.restore();
}
// Steam puffing up from (x, y), starting at t0.
export function steam(g, t, x, y, s, t0, o = {}) {
  const { n = 4, seed = 9, dur = 1.0, spread = 1 } = o;
  for (let i = 0; i < n; i++) {
    const a = t - t0 - i * .12;
    if (a < 0 || a > dur) continue;
    const p = a / dur;
    const px = x + (Math.sin(a * 7 + i * 2 + seed) * 8 + (i % 2 ? 12 : -12) * p * 2) * s * spread, py = y - p * 170 * s;
    g.save(); g.globalAlpha *= 1 - p * p;
    blob(g, scallop(px, py, (24 + p * 20) * s, 7, .18, i, seed + i), { fill: '#fbf8ef', line: ink, lw: 4, seed: seed + i, t, hw: 4.6, tone: 1.2, dens: .5 });
    g.restore();
  }
}

// ---------------------------------------------------------------- the -ility tags: two puzzle pieces that click together
// A collar tag hangs by a ring from (x, y): a cream piece with the stem of the word (USAB) over an amber piece with the
// ending (ILITY), a knob on the amber one fitting a socket in the cream one. `ilOff` = [dx, dy, rot] moves the ending
// away from where it fits; `ility: false` leaves the socket empty.
const TAG = { W: 226, H1: 70, H2: 92 };
function tagPolys() {
  const w = TAG.W / 2, h1 = TAG.H1, h2 = TAG.H1 + TAG.H2;
  const notch = [[30, h1], [26, h1 - 12], [14, h1 - 22], [0, h1 - 24], [-14, h1 - 22], [-26, h1 - 12], [-30, h1]];
  const stemV = [[-w, 0], [w, 0], [w, h1], ...notch, [-w, h1]];
  const stemR = [14, 14, 12, 3, 3, 3, 3, 3, 3, 3, 12];
  const ilV = [[-w, h1], ...notch.slice().reverse(), [w, h1], [w, h2], [-w, h2]];
  const ilR = [12, 3, 3, 3, 3, 3, 3, 3, 12, 14, 14];
  return { stem: roundPoly(stemV, stemR, 3), il: roundPoly(ilV, ilR, 3) };
}
let TAGP = null;
export function puzzleTag(g, t, x, y, o = {}) {
  const { stem = 'USAB', swing = 0, s = 1, seed = 1, ility = true, ilOff = [0, 0, 0], ilK = 1, stemCol = '#fff6dc', ilCol = '#f7c93b', ring = true, alpha = 1 } = o;
  TAGP = TAGP || tagPolys();
  g.save(); g.globalAlpha *= alpha;
  g.translate(x, y); g.rotate(swing); g.scale(s, s);
  if (ring) line(g, Array.from({ length: 13 }, (_, i) => [Math.cos(i / 12 * TAU) * 12, -8 + Math.sin(i / 12 * TAU) * 15]), { w: 6, col: '#8d8c97', seed: seed + 9, t, spline: true, passes: 1, closed: true, over: 0, alpha: .95 });
  blob(g, TAGP.stem, { fill: stemCol, shade: '#e3d3a0', line: ink, lw: 5.4, seed, t, hw: 4.8, tone: 1.1, sh: .22, gap: 6 });
  marker(g, stem, 0, 41, 34, { col: ink, seed: seed + 2, t, w: .11, track: 4 });
  if (ility) {
    g.save(); g.translate(ilOff[0], ilOff[1] + TAG.H1 * 0); g.translate(0, TAG.H1 + TAG.H2 / 2); g.rotate(ilOff[2]); g.scale(ilK, ilK); g.translate(0, -(TAG.H1 + TAG.H2 / 2));
    blob(g, TAGP.il, { fill: ilCol, shade: '#d99a1a', line: ink, lw: 5.4, seed: seed + 1, t, hw: 4.8, tone: 1.1, sh: .22, gap: 6 });
    marker(g, 'ILITY', 0, 145, 48, { col: ink, seed: seed + 3, t, w: .12, track: 5 });
    g.restore();
  }
  g.restore();
}
// The ending on its own (falling, bouncing on the grass): centred on (x, y).
export function ilityPiece(g, t, x, y, o = {}) {
  const { rot = 0, s = 1, seed = 2, ilCol = '#f7c93b', alpha = 1 } = o;
  TAGP = TAGP || tagPolys();
  g.save(); g.globalAlpha *= alpha;
  g.translate(x, y); g.rotate(rot); g.scale(s, s); g.translate(0, -(TAG.H1 + TAG.H2 / 2));
  blob(g, TAGP.il, { fill: ilCol, shade: '#d99a1a', line: ink, lw: 5.4, seed, t, hw: 4.8, tone: 1.1, sh: .22, gap: 6 });
  marker(g, 'ILITY', 0, 145, 48, { col: ink, seed: seed + 3, t, w: .12, track: 5 });
  g.restore();
}

// ---------------------------------------------------------------- a dog biscuit: a bone with a groove, that snaps in two
// A bone's outline at its right end, from the top of the shaft round both knobs to the bottom of it.
function boneEnd(A, w, r) {
  const pts = [], cy = w + r * .45;
  for (let a = 150; a <= 385; a += 26) { const d = a * Math.PI / 180; pts.push([A - r + Math.cos(d) * r, -cy + Math.sin(d) * r]); }
  pts.push([A - r * .55, 0]);
  for (let a = -25; a <= 210; a += 26) { const d = a * Math.PI / 180; pts.push([A - r + Math.cos(d) * r, cy + Math.sin(d) * r]); }
  return pts;
}
// half: 1 the right half, -1 the left, 0 the whole biscuit. `jag` is how ragged the break is.
export function biscuit(g, t, x, y, o = {}) {
  const { A = 150, w = 20, r = 30, half = 0, rot = 0, seed = 6, jag = 9, s = 1 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const R = boneEnd(A, w, r);
  const cut = [[0, -w], [jag * .6, -w * .5], [-jag, 0], [jag, w * .5], [0, w]];
  const sh = A - r * 1.9;
  const right = [cut[0], [sh * .5, -w], ...R, [sh * .5, w], ...cut.slice().reverse().slice(0, 4)];
  const mirror = pts => pts.map(([px, py]) => [-px, py]);
  const rightHalf = [cut[0], [sh * .5, -w], ...R, [sh * .5, w], cut[4], cut[3], cut[2], cut[1]];
  const leftHalf = [cut[0], cut[1], cut[2], cut[3], cut[4], [-sh * .5, w], ...mirror(R).reverse(), [-sh * .5, -w]];
  const whole = [[-sh * .5, -w], [0, -w], [sh * .5, -w], ...R, [sh * .5, w], [0, w], [-sh * .5, w], ...mirror(R).reverse()];
  const P = half > 0 ? rightHalf : half < 0 ? leftHalf : whole;
  blob(g, P, { fill: '#e8b96a', shade: '#b57b3a', line: ink, lw: 5.6, seed, t, hw: 4.8, tone: 1.1, sh: .3, gap: 6 });
  // Little dimples, and the groove where it will break.
  [[-.5, -.35], [.45, .3], [.08, -.3]].forEach(([u, v], i) => { const dx = u * A * .9, dy = v * w; if (half === 0 || (half > 0) === (dx > 0)) dot(g, dx, dy, 3.4, { col: '#b57b3a', seed: seed + 10 + i, t, alpha: .9 }); });
  if (half === 0) line(g, [[0, -w - 2], [1, 0], [-1, w + 2]], { w: 4.4, col: '#8b5a1e', seed: seed + 5, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .9 });
  g.restore();
}

// ---------------------------------------------------------------- dictionaries
// A fat book lying flat: a coloured cover, cream page edges along the front, a label on the spine.
export function book(g, t, x, y, w, h, col, o = {}) {
  const { seed = 3, label = '', rot = 0, open = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot);
  blob(g, rrect(0, 0, w, h, 10, 2, seed, .5), { fill: col, shade: '#00000033', line: ink, lw: 5.4, seed, t, hw: 4.8, tone: .9, sh: .3, gap: 6 });
  blob(g, rrect(w * .04, h * .08, w * .86, h * .5, 6, 2, seed + 1, .4), { fill: '#fff6dc', line: ink, lw: 3.6, seed: seed + 1, t, hw: 4.4, tone: 1.2, dens: .5 });
  if (label) write(g, label, -w / 2 + 34, h * .34, Math.min(h * .4, 30), { col: '#fff6dc', seed: seed + 2, t, w: .12, track: 3 });
  g.restore();
}

// ---------------------------------------------------------------- a rolling pin
export function rollingPin(g, t, x, y, len = 440, o = {}) {
  const { rot = 0, seed = 8, spin = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot);
  [-1, 1].forEach((sd, i) => blob(g, capsule([sd * (len / 2 - 4), 0], [sd * (len / 2 + 58), 0], 15, 17, 5, seed + i), { fill: '#b98243', shade: '#7f5322', line: ink, lw: 5.6, seed: seed + i, t, hw: 4.8, sh: .35 }));
  blob(g, rrect(0, 0, len, 74, 32, 3, seed + 3, .5), { fill: '#e2b571', shade: '#b98243', line: ink, lw: 6.4, seed: seed + 3, t, hw: 5, tone: .8, sh: .3 });
  [-16, 4, 22].forEach((dy, i) => line(g, [[-len / 2 + 40, dy + Math.sin(spin + i) * 3], [len / 2 - 40, dy + 2 + Math.sin(spin + i) * 3]], { w: 3.6, col: '#a9793a', seed: seed + 6 + i, t, spline: false, passes: 1, over: 0, alpha: .55 }));
  g.restore();
}

// ---------------------------------------------------------------- a rocket (nose up), with its flame
export function rocket(g, t, x, y, o = {}) {
  const { s = 1, tilt = 0, flame = 0, seed = 12 } = o;
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(s, s);
  if (flame > 0) {
    for (let i = 0; i < 3; i++) {
      const L = (70 + hash(seed, i, Math.floor(t * 15)) * 50) * flame, ox = (i - 1) * 20;
      line(g, [[ox, 8], [ox * 1.3 + Math.sin(t * 40 + i) * 4, 8 + L * .5], [ox * .6, 8 + L]], { w: 26 - Math.abs(i - 1) * 8, col: i === 1 ? C.yellow : C.orange, seed: seed + i, t, spline: true, passes: 1, taper: [.05, .9], over: 0, bow: 0 });
    }
  }
  [-1, 1].forEach((sd, i) => blob(g, [[sd * 24, -20], [sd * 62, 34], [sd * 24, 30]], { fill: C.red, line: ink, lw: 5.4, seed: seed + 3 + i, t, hw: 4.6, tone: .9 }));
  blob(g, ellipse(0, -30, 38, 84, 10, 0, seed + 5), { fill: '#f4efe4', shade: '#c9c3b4', line: ink, lw: 6, seed: seed + 5, t, hw: 5, tone: .9, sh: .3 });
  blob(g, [[-32, -78], [0, -156], [32, -78]], { fill: C.red, line: ink, lw: 5.6, seed: seed + 6, t, hw: 4.8, tone: .9 });
  blob(g, ellipse(0, -44, 17, 17, 8, 0, seed + 7), { fill: C.sky, line: ink, lw: 5, seed: seed + 7, t, hw: 4.4, tone: .9 });
  g.restore();
}

// ---------------------------------------------------------------- a paper checklist that goes on and on
// A strip of paper along the path (points), opaque, with rows of tick boxes across it; `grow` is how much of it has come out (0..1).
export function scroll(g, t, pts, o = {}) {
  const { grow = 1, seed = 30, w = 62, every = 46 } = o;
  const sp = spline(pts, false, 12);
  const n = Math.max(2, Math.floor(sp.length * grow));
  const P = sp.slice(0, n);
  if (P.length < 3) return;
  const side = k => P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [p[0] - dy / l * k, p[1] + dx / l * k]; });
  const thin = arr => arr.filter((_, i) => i % 3 === 0 || i === arr.length - 1);
  const poly = [...thin(side(w / 2)), ...thin(side(-w / 2)).reverse()];
  blob(g, poly, { fill: '#f7e7b4', shade: '#e0c877', line: ink, lw: 5.4, seed, t, hw: 5, tone: 1.6, dens: .85, gap: 8, sh: .25 });
  let acc = 0;
  for (let i = 1; i < P.length; i++) {
    acc += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (acc < every) continue;
    acc = 0;
    const a = P[i - 1], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    line(g, [[P[i][0] + nx * -20, P[i][1] + ny * -20], [P[i][0] + nx * 20, P[i][1] + ny * 20]], { w: 6, col: '#5b5a66', seed: seed + 10 + i, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .8 });
  }
}

// ---------------------------------------------------------------- a ring gate
// Two posts and a barrier arm across, with a sign.
export function ringGate(g, t, x, y, w, o = {}) {
  const { seed = 50, arm = 0, sign = 'ENTRY' } = o;
  [-1, 1].forEach((sd, i) => blob(g, rrect(x + sd * w / 2, y - 90, 30, 190, 8, 2, seed + i, .5), { fill: '#fbf8ef', shade: '#c9c3b4', line: ink, lw: 5.6, seed: seed + i, t, hw: 4.8, tone: 1, sh: .25, dens: .5 }));
  // The arm, striped red and white, lifting a little.
  g.save(); g.translate(x - w / 2 + 14, y - 110); g.rotate(-arm * .5);
  for (let k = 0; k < 6; k++) line(g, [[k * (w - 30) / 6, 0], [(k + 1) * (w - 30) / 6, 0]], { w: 22, col: k % 2 ? '#fbf8ef' : C.red, seed: seed + 5 + k, t, spline: false, passes: 1, flat: true, over: 0, bow: 0, tooth: .5 });
  line(g, [[0, -11], [w - 30, -11]], { w: 4, col: ink, seed: seed + 3, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .8 });
  line(g, [[0, 11], [w - 30, 11]], { w: 4, col: ink, seed: seed + 4, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .8 });
  g.restore();
}

// ---------------------------------------------------------------- a camera on a tripod, with its flash
export function camera(g, t, x, y, o = {}) {
  const { s = 1, tilt = -.5, flash = 0, seed = 70 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  [[-70, 150], [0, 158], [70, 150]].forEach(([dx, dy], i) => line(g, [[0, 0], [dx, dy]], { w: 11, col: '#7f5322', seed: seed + i, t, spline: false, passes: 1, over: 0, bow: 0 }));
  g.save(); g.rotate(tilt);
  blob(g, rrect(0, -30, 132, 88, 14, 3, seed + 4, .5), { fill: '#5b5a66', shade: '#2f2e3a', line: ink, lw: 6, seed: seed + 4, t, hw: 5, tone: .9, sh: .3 });
  blob(g, ellipse(0, -30, 34, 34, 10, 0, seed + 5), { fill: '#b9d3e8', shade: '#6f93b3', line: ink, lw: 5.4, seed: seed + 5, t, hw: 4.6, tone: .9 });
  dot(g, -8, -40, 7, { col: '#fbf8ef', seed: seed + 6, t, alpha: .9 });
  blob(g, rrect(44, -86, 34, 24, 6, 2, seed + 7, .4), { fill: C.yellow, line: ink, lw: 4.6, seed: seed + 7, t, hw: 4.4, tone: .9 });
  g.restore();
  g.restore();
}

// ---------------------------------------------------------------- a gilt frame with a plaque
export function frame(g, t, x, y, w, h, o = {}) {
  const { seed = 60, plaque = '', plaqueProg = 1, thick = 44 } = o;
  const x0 = x - w / 2, x1 = x + w / 2, y0 = y - h / 2, y1 = y + h / 2;
  const gold = '#d9a441';
  const bar = (a, b, i) => line(g, [a, b], { w: thick, col: gold, seed: seed + i, t, spline: false, passes: 1, flat: true, tooth: .5, over: 0, bow: 0 });
  bar([x0 + 6, y0 + thick / 2], [x1 - 6, y0 + thick / 2], 1); bar([x0 + 6, y1 - thick / 2], [x1 - 6, y1 - thick / 2], 2);
  bar([x0 + thick / 2, y0 + 6], [x0 + thick / 2, y1 - 6], 3); bar([x1 - thick / 2, y0 + 6], [x1 - thick / 2, y1 - 6], 4);
  outline(g, rrect(x, y, w, h, 20, 3, seed + 5, .5), { col: ink, w: 6.6, seed: seed + 5, t, alpha: .9, tooth: .55 });
  outline(g, rrect(x, y, w - thick * 2, h - thick * 2, 8, 3, seed + 6, .4), { col: ink, w: 4.6, seed: seed + 6, t, alpha: .8, tooth: .55 });
  [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(([cx, cy], i) => blob(g, scallop(cx, cy, 34, 8, .2, i, seed + 10 + i), { fill: '#e8b955', shade: '#a9791f', line: ink, lw: 5, seed: seed + 10 + i, t, hw: 4.6, tone: .9, sh: .3 }));
  if (plaque) {
    blob(g, rrect(x, y1 + 2, 430, 64, 12, 2, seed + 20, .4), { fill: '#e8c66a', shade: '#a9791f', line: ink, lw: 5.4, seed: seed + 20, t, hw: 4.6, tone: .9, sh: .3 });
    write(g, plaque, x, y1 + 22, 38, { col: '#4a3410', seed: seed + 21, t, align: 'center', prog: plaqueProg, w: .12, track: 5 });
  }
}

// ---------------------------------------------------------------- a sash, worn across a dog's chest
// Drawn in the dog's own space (chin at 0): from one shoulder to the far hip, with its word.
export function sash(g, t, rx, o = {}) {
  const { label = 'DIMENSION', col = '#9b5fc0', seed = 41, k = 1 } = o;
  if (k <= 0) return;
  const a = [-rx * .62, 6], b = [rx * .58, 92], mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  g.save(); g.translate(mid[0], mid[1]); g.scale(k, k); g.translate(-mid[0], -mid[1]);
  line(g, [a, b], { w: 34, col, seed, t, spline: false, passes: 1, flat: true, tooth: .5, over: 0, bow: 0 });
  line(g, [[a[0], a[1] - 17 * Math.cos(ang)], [b[0], b[1] - 17 * Math.cos(ang)]], { w: 3.6, col: ink, seed: seed + 1, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .8 });
  line(g, [[a[0], a[1] + 17 * Math.cos(ang)], [b[0], b[1] + 17 * Math.cos(ang)]], { w: 3.6, col: ink, seed: seed + 2, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .8 });
  write(g, label, mid[0], mid[1] + 9, 22, { col: '#fbf8ef', seed: seed + 3, t, align: 'center', rot: ang, w: .13, track: 3 });
  g.restore();
}

// ---------------------------------------------------------------- Clawd as a bloodhound: long ears and a big wet nose
export function houndBits(g, t, o = {}) {
  const { sniff = 0, seed = 33 } = o;
  const sw = Math.sin(t * TAU * 3.5) * 6 * sniff;
  [-1, 1].forEach((sd, i) => blob(g, capsule([sd * 160, -214], [sd * 190 + sw * sd, -80], 22, 30, 5, seed + i), { fill: '#7b4b26', shade: '#4d2d14', line: ink, lw: 6, seed: seed + i, t, hw: 5, sh: .35 }));
  const k = 1 + Math.sin(t * TAU * 4) * .12 * sniff;
  blob(g, ellipse(0, -122, 36 * k, 26 * k, 8, 0, seed + 3), { fill: '#2b2a33', line: ink, lw: 4, seed: seed + 3, t, hw: 4.4, tone: 1, gap: 4 });
  dot(g, -10, -130, 6, { col: '#fbf8ef', seed: seed + 4, t, alpha: .8 });
}

// ---------------------------------------------------------------- a spotlight's beam and the pool it makes
export function beam(g, t, from, to, o = {}) {
  const { w0 = 60, w1 = 620, col = '#fff1a8', seed = 3, alpha = .3 } = o;
  const pts = [[from[0] - w0 / 2, from[1]], [from[0] + w0 / 2, from[1]], [to[0] + w1 / 2, to[1]], [to[0] - w1 / 2, to[1]]];
  g.save(); g.globalAlpha *= alpha;
  hatch(g, pts, { col, seed, t, gap: 9, w: 14, angle: 1.35, spill: 8, alpha: 1, slop: 0, tooth: .5 });
  g.restore();
}

// ---------------------------------------------------------------- a bucket of tennis balls, for the class
export function bucket(g, t, x, y, o = {}) {
  const { s = 1, seed = 95 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  line(g, [[-52, -78], [-34, -140], [34, -140], [52, -78]], { w: 6, col: '#8d8c97', seed: seed + 2, t, spline: true, passes: 1, over: 0, bow: 0, alpha: .95 });
  [[-30, -96], [8, -106], [38, -92]].forEach(([bx, by], i) => drawBall(g, t, bx, by, 25, { spin: i * 2 + 1 }));
  blob(g, [[-58, -80], [58, -80], [46, 0], [-46, 0]], { fill: C.sky, shade: '#2f7fbf', line: ink, lw: 5.6, seed, t, hw: 5, tone: .9, sh: .3 });
  line(g, [[-52, -66], [50, -64]], { w: 5, col: '#fbf8ef', seed: seed + 3, t, spline: false, passes: 1, over: 0, alpha: .8 });
  g.restore();
}
