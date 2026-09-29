// The parade's first half (Break 2, lines 37-40: upgradability ... portability): the show tent, the
// runway, the spotlights and the eight gags, one per word. Everything is drawn with the pen and is a pure
// function of the song's time. A gag is drawn in its own space: the origin is the mark it stands on, on the
// top edge of the stage, x across, y up is negative.
import { W, H, TAU, clamp, lerp, inv, hash, easeOut, backOut, beatPos, beatPulse, downPulse, sway, loud } from './kit.js';
import { blob, line, dot, hatch, scrub } from './pencil.js';
import { rrect, ellipse, capsule, star, scallop, roundPoly } from './shapes.js';
import { write } from './hand.js';
import { paper } from './paper.js';
import { GRAPHITE, C } from './palette.js';
import { dachshund } from './chars.js';
import { dogFront } from './people.js';
import { bunting, crowdRow } from './world.js';
import { meadow } from './common.js';
import { spring, shake, hop, gate, ease } from './life.js';
import { bubble, burst, rosette } from './props.js';

const ink = GRAPHITE;
export const STAGE_Y = 1250;
const GOLD = '#e6b73a', GOLD_L = '#f4d778';
const RED = '#cf3a35', RED_D = '#8f2226';

// ---------------------------------------------------------------- the tent
// The back of the tent: cream canvas with a faint peach scribble at the top, its panel seams, and two
// strings of bunting. (The lyric sits on the canvas above the valance.)
export function tentBack(g, t) {
  paper(g);
  scrub(g, [-20, -40, W + 20, 660], { col: '#f3b48c', seed: 501, t, gap: 30, w: 36, alpha: .2, angle: .07, wig: 26 });
  scrub(g, [-20, 330, W + 20, 800], { col: '#f3b48c', seed: 502, t, gap: 48, w: 34, alpha: .1, angle: -.06, wig: 28 });
  [176, 540, 904].forEach((x, i) => line(g, [[x - 6, 730], [x + 5, 990], [x - 3, STAGE_Y]], { w: 4, col: '#b8a888', seed: 510 + i, t, spline: true, passes: 1, alpha: .32, over: 0 }));
  bunting(g, t, -20, 744, W + 20, 752, { n: 7, sag: 42, seed: 41, size: 42 });
  bunting(g, t, -20, 794, W + 20, 786, { n: 6, sag: 54, seed: 47, size: 44, cols: [C.blue, C.pink, C.yellow, C.red, C.green, C.orange] });
}

// The valance across the top of the picture zone: red, scalloped, with gold piping and tassels. It is
// drawn after the units, so anything reaching up into it goes behind it.
export function valance(g, t) {
  const n = 12, x0 = -30, w = (W + 60) / n, yTop = 640, yEdge = 692, dip = 26;
  const scal = [];
  for (let i = n - 1; i >= 0; i--) {
    const xa = x0 + (i + 1) * w, xb = x0 + i * w;
    for (let k = 0; k < 6; k++) { const u = k / 6; scal.push([lerp(xa, xb, u), yEdge + Math.sin(Math.PI * u) * dip]); }
  }
  scal.push([x0, yEdge]);
  const pts = [[x0, yTop], [W / 2, yTop - 3], [W - x0, yTop], [W - x0, yEdge], ...scal];
  blob(g, pts, { fill: RED, shade: RED_D, line: ink, lw: 6.4, seed: 520, t, hw: 5.6, tone: .8, sh: .3 });
  // Piping along the top and round the scallops.
  line(g, [[x0, yTop + 10], [W / 2, yTop + 8], [W - x0, yTop + 10]], { w: 11, col: GOLD, seed: 521, t, spline: true, passes: 1, tooth: .5, over: 0, bow: 0 });
  const pipe = []; for (let i = 0; i < n; i++) for (let k = 0; k <= 6; k++) { const u = k / 6; pipe.push([x0 + (i + u) * w, yEdge - 9 + Math.sin(Math.PI * u) * (dip - 3)]); }
  line(g, pipe, { w: 7, col: GOLD, seed: 522, t, spline: true, passes: 1, tooth: .5, over: 0, bow: 0, taper: [.01, .01] });
  // Tassels at every valley, swaying a little on the oom-pah.
  for (let i = 0; i <= n; i++) {
    const x = x0 + i * w + Math.sin(beatPos(t) * Math.PI + i) * 2.5, sw = Math.sin(t * 2.1 + i * 1.3) * 3;
    line(g, [[x, yEdge - 2], [x + sw * .3, yEdge + 14]], { w: 4.4, col: RED_D, seed: 530 + i, t, spline: false, passes: 1, over: 0, bow: 0 });
    line(g, [[x + sw * .3, yEdge + 8], [x + sw, yEdge + 46]], { w: 21, col: GOLD, seed: 560 + i, t, spline: false, passes: 1, taper: [.5, .3], tooth: .55, over: 0, bow: 0 });
  }
}

// A lamp hanging from the valance's corner, pointing at x = tx on the stage.
export function lamp(g, t, side, tx, seed = 1) {
  const lx = side < 0 ? 86 : W - 86, ly = 726;
  const ang = Math.atan2(STAGE_Y - ly, tx - lx);
  g.save();
  g.translate(lx, ly);
  line(g, [[0, -34], [0, 4]], { w: 6, col: ink, seed: seed + 1, t, spline: false, passes: 1, over: 0, bow: 0 });
  g.rotate(ang - Math.PI / 2);
  blob(g, rrect(0, 32, 64, 60, 12, 3, seed + 2), { fill: '#7a7987', shade: '#4d4c58', line: ink, lw: 5.6, seed: seed + 2, t, hw: 4.8, tone: .7, sh: .3 });
  blob(g, ellipse(0, 62, 34, 11, 9, 0, seed + 3), { fill: '#fbe9a0', line: ink, lw: 4.6, seed: seed + 3, t, hw: 4.4, tone: .9 });
  g.restore();
}

// The cone of a spotlight from its lamp to a pool on the stage; `pow` 0..1 is how bright.
export function beam(g, t, side, tx, o = {}) {
  const { pow = 1, seed = 1, half = 178 } = o;
  const lx = side < 0 ? 86 : W - 86, ly = 748;
  const poly = [[lx - 18, ly], [lx + 18, ly], [tx + half, STAGE_Y - 2], [tx - half, STAGE_Y - 2]];
  const ang = Math.atan2(STAGE_Y - ly, tx - lx);
  hatch(g, poly, { col: '#f7d96a', seed, t, gap: 14, w: 12, alpha: .3 * pow, spill: 7, angle: ang, dens: .95 });
  hatch(g, ellipse(tx, STAGE_Y - 6, half * .93, 20, 10, 0, seed + 3), { col: '#f7d96a', seed: seed + 1, t, gap: 8, w: 8, alpha: .55 * pow, spill: 4, angle: .05 });
}

// ---------------------------------------------------------------- the runway
// A long raised stage seen from the side: dogs stand on its top edge; its front is red carpet with a gold
// trim line along the top. `scroll` (px) moves the carpet's pattern when the parade moves.
export function runway(g, t, scroll = 0) {
  blob(g, rrect(W / 2, 1327, W + 80, 150, 6, 2, 601, .6), { fill: RED, shade: RED_D, line: ink, lw: 6.4, seed: 601, t, hw: 5.6, tone: .78, sh: .28 });
  const zz = [], ph = ((scroll % 120) + 120) % 120;
  for (let x = -180 + ph; x < W + 200; x += 60) zz.push([x, 1292 + (Math.round((x - ph + 180) / 60) % 2) * 42]);
  line(g, zz, { w: 7, col: GOLD_L, seed: 602, t, spline: false, passes: 1, alpha: .9, over: 0, bow: 0, taper: [.01, .01], tooth: .5 });
  line(g, [[-30, 1381], [W / 2, 1383], [W + 30, 1381]], { w: 7, col: GOLD, seed: 603, t, spline: true, passes: 1, tooth: .5, over: 0, bow: 0, taper: [.01, .01] });
  line(g, [[-30, STAGE_Y + 5], [W / 2, STAGE_Y + 7], [W + 30, STAGE_Y + 5]], { w: 15, col: GOLD, seed: 604, t, spline: true, passes: 1, tooth: .5, over: 0, bow: 0, taper: [.01, .01] });
  line(g, [[-30, STAGE_Y + 13], [W / 2, STAGE_Y + 15], [W + 30, STAGE_Y + 13]], { w: 4.4, col: ink, seed: 605, t, spline: true, passes: 1, alpha: .6, over: 0, bow: 0, taper: [.01, .01] });
}

// The floor of the tent in front of the stage: grass.
export function floor(g, t) { meadow(g, t, 1408, { seed: 21 }); }

// The audience along the foot of the picture, chins at y = 1500, heads above the phone's button strip.
export function crowd(g, t, o = {}) {
  crowdRow(g, t, dogFront, 1500 - (o.cheer || 0) * 16, { n: 7, s: .86, seed: 5, sing: 1, breeds: ['beagle', 'poodle', 'pug', 'husky', 'sheepdog', 'mutt', 'greyhound'], x0: 92, x1: 988, ...o });
}

// A soft contact shadow, scribbled: paler and smaller the higher a thing is.
export function shadow(g, t, x, w, lift = 0, seed = 1) {
  const k = clamp(1 - lift / 200);
  if (k < .05) return;
  hatch(g, ellipse(x, 6, w * (.6 + .4 * k), 12, 10, 0, seed), { col: '#5b5a66', seed, t, gap: 7, w: 5, alpha: .3 * k, spill: 3, angle: .04 });
}

// ---------------------------------------------------------------- dogs seen from the side
// Bruce's drawing, with other coats, ears and proportions. `centre` is where the middle of the dog is
// (the drawing's origin is its body, and the head runs on to the right).
export const DOGS = {
  pup: { length: .44, headS: 1.5, snoutL: .7, earS: .8, bodyH: 1.0, coat: '#f0d59a', shade: '#c9a865', muzzle: '#fbf1d8' },
  hound: { length: .34, headS: 1.1, snoutL: 1.05, earS: 1.6, bodyH: .85, coat: '#b5682f', shade: '#7d4520', muzzle: '#eccfa4' },
  white: { length: .4, headS: 1.2, snoutL: .8, earS: .7, bodyH: 1.1, coat: '#fbf8ef', shade: '#cfcabd', muzzle: '#fbf8ef' },
};
// Where the drawing's origin is when the dog is centred on x, and the world position of a point of the dog.
function dogFrame(kind, o) {
  const P = { ...DOGS[kind], ...o };
  const { x = 0, y = 0, s = 1, flip = 1, lean = 0, bob = 0 } = P;
  const K = P.length ?? 1, hz = P.headS ?? 1.12, sn = P.snoutL ?? 1;
  const xmin = -274 * K, xmax = 268 * K + 162 * sn * hz + 28 * hz;
  const cx = (xmin + xmax) / 2 * s * flip;
  return { P, ox: x - cx, oy: y - bob, s, flip, lean };
}
export function sideDog(g, kind, o = {}) {
  const { P, ox } = dogFrame(kind, o);
  dachshund(g, { ...P, x: ox, y: P.y ?? 0, s: P.s ?? 1, flip: P.flip ?? 1 });
}
// The world position of a point (lx, ly) in the dog's own drawing (feet on y = 0, head to the right).
export function dogPoint(kind, o, lx, ly) {
  const { ox, oy, s, flip, lean } = dogFrame(kind, o);
  const px = lx * s * flip, py = ly * s, c = Math.cos(lean), sn = Math.sin(lean);
  return [ox + px * c - py * sn, oy + px * sn + py * c];
}

// ---------------------------------------------------------------- small helpers for the gags
export const GAGS = {};
// Pen shortcuts: every shape gets the seed base + id, so a gag's shapes keep their own looks.
function pens(g, t, base) {
  return {
    B: (id, pts, o = {}) => blob(g, pts, { line: ink, lw: 6, hw: 5, tone: .6, seed: base + id, t, ...o }),
    L: (id, pts, o = {}) => line(g, pts, { w: 6, col: ink, seed: base + id, t, passes: 1, ...o }),
    D: (id, x, y, r, o = {}) => dot(g, x, y, r, { col: ink, seed: base + id, t, ...o }),
    H: (id, pts, o = {}) => hatch(g, pts, { seed: base + id, t, ...o }),
    W: (id, str, x, y, size, o = {}) => write(g, str, x, y, size, { col: ink, seed: base + id, t, ...o }),
  };
}
// Anything drawn in fn is hidden above the valance's lower edge: an arm from the flies goes behind it.
function behindValance(g, fn) { g.save(); g.beginPath(); g.rect(-1400, -560, 2800, 2600); g.clip(); fn(); g.restore(); }
// A small rosette in the word's colour, popped on the dog as the word is sung: a rosette is a quality.
function pin(g, t, x, y, r, col, a, seed) {
  if (a < 0 || !col) return;
  const k = backOut(puff(a / .18), 2.6);
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(.12 + Math.sin(t * 5 + seed) * .07);
  rosette(g, 0, 0, r, col, t, { seed });
  g.restore();
}
const steady = { over: 0, bow: 0 };     // a line that is not to run on or sag: for things that are ruled
const puff = (a, b = 1) => Math.max(0, Math.min(1, a)) * b;
// A four-armed twinkle.
function twinkle(g, t, x, y, r, seed, col = C.yellow, rot = 0) {
  if (r < 2) return;
  const p = [];
  for (let i = 0; i < 8; i++) { const an = rot + i / 8 * TAU, rr = i % 2 ? r * .3 : r; p.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); }
  blob(g, p, { fill: col, line: ink, lw: 3.8, seed, t, gap: 5, hw: 4.2, tone: .6 });
}
// A white cartoon glove on a sleeve that runs up out of the picture (behind the valance). Origin: the wrist.
const sharp = (pts, r = 9) => roundPoly(pts, pts.map(() => r), 3);   // a polygon with true corners (the pen would round a bare list of points)
// How a unit's dog moves while the parade carries it: mv 0..1 (how fast), a hop, a lean into the run.
function travel(k) {
  const mv = clamp(Math.abs(k.vel) / 1100);
  return { mv, hop: mv * Math.abs(Math.sin(k.dist / 110 * Math.PI)) * 32, lean: mv * .1 * Math.sign(k.vel), walk: mv > .08 ? (k.dist / 230) % 1 : 0 };
}
// A front paw seen from the front: an oval with three toe lines.
function paw(g, t, x, y, s, seed, col = '#fbf8ef') {
  blob(g, ellipse(x, y, 30 * s, 22 * s, 8, 0, seed), { fill: col, line: ink, lw: 5.2, seed, t, hw: 4.6, tone: .95, dens: .3 });
  [-1, 0, 1].forEach((f, i) => line(g, [[x + f * 10 * s, y - 2 * s], [x + f * 10 * s, y + 9 * s]], { w: 3.6, col: ink, seed: seed + 1 + i, t, spline: false, passes: 1, alpha: .6, over: 0, bow: 0 }));
}
function glove(g, t, x, y, o = {}) {
  const { seed = 1, top = -585, sleeve = C.blue, dark = '#1f3f8f', tilt = 0, grip = 0 } = o;
  const len = Math.max(70, y - top);
  g.save(); g.translate(x, y); g.rotate(tilt);
  blob(g, capsule([0, -len], [0, -46], 36, 32, 5, seed), { fill: sleeve, shade: dark, line: ink, lw: 5.6, seed, t, hw: 5, tone: .6, sh: .3 });
  blob(g, rrect(0, -34, 88, 30, 10, 3, seed + 1), { fill: '#fbf8ef', line: ink, lw: 5.4, seed: seed + 1, t, hw: 4.6, tone: .9, dens: .3 });
  blob(g, ellipse(0, 14, 48, 50 - grip * 8, 10, 0, seed + 2), { fill: '#fbf8ef', line: ink, lw: 5.6, seed: seed + 2, t, hw: 4.6, tone: .95, dens: .3 });
  blob(g, ellipse(-44 + grip * 12, 8, 17, 27, 7, .55, seed + 3), { fill: '#fbf8ef', line: ink, lw: 5.2, seed: seed + 3, t, hw: 4.4, tone: .95, dens: .3 });
  [-16, 4, 22].forEach((fx, i) => line(g, [[fx, 34], [fx + 1, 52 - grip * 6]], { w: 4, col: ink, seed: seed + 4 + i, t, spline: false, passes: 1, alpha: .6, over: 0, bow: 0 }));
  g.restore();
}

// @@BEGIN g1
// ---------------------------------------------------------------- 1. upgradability
// A doghouse whose roof is swapped while the dog stays in his doorway: he arrives with the old roof (V1,
// patched, a hole) lifted off on two gloves; on the word the gloves whisk it up and away and the new one drops
// on with a clunk and a flag (V2). (Can you move to a newer version, easily?)
function roofBand(g, t, P, o = {}) {
  const { fill, shade, old = false, seed = 0, flag = 0, S = 1 } = o;
  const p = pts => pts.map(([x, y]) => [x * S, y * S]);
  P.B(seed, sharp(p([[-180, -140], [0, -312], [180, -140], [134, -140], [0, -268], [-134, -140]]), 8 * S), { fill, shade, lw: 6.6 * Math.max(.75, S), hw: 5.4, tone: .8, sh: .3 });
  for (let i = 0; i < 4; i++) [-1, 1].forEach((sd, j) => {
    const u = .16 + i * .21, x = sd * 180 * (1 - u), y = -140 - 172 * u;
    P.L(seed + 1 + i * 2 + j, [[(x - sd * 8) * S, (y + 4) * S], [(x - sd * 22) * S, (y + 40) * S]], { w: 4 * Math.max(.75, S), col: old ? '#5b5a66' : '#8f2226', alpha: .6, spline: false, ...steady });
  });
  if (old) {
    P.B(seed + 12, ellipse(-72 * S, -196 * S, 22 * S, 17 * S, 8, .5, seed + 12), { fill: '#f5eedd', line: ink, lw: 4.6 * Math.max(.75, S), tone: .95, dens: .3 });
    P.B(seed + 13, rrect(60 * S, -206 * S, 50 * S, 34 * S, 5, 2, seed + 13), { fill: '#7fb0d8', line: ink, lw: 4.4 * Math.max(.75, S), tone: .8, dens: .7 });
    P.W(seed + 15, 'V1', 8 * S, -150 * S, 30 * S * 1.3, { col: '#f1eef8', align: 'center', rot: .55, w: .13 });
  } else {
    P.B(seed + 12, star(0, -290, 22, 10, 5, -Math.PI / 2, seed + 12), { fill: '#f7c93b', line: ink, lw: 4.6, tone: .8 });
  }
  if (flag > 0) {
    const k = backOut(flag, 2.4);
    g.save(); g.translate(0, -312); g.scale(k, k);
    P.L(seed + 20, [[0, 0], [0, -84]], { w: 6, col: ink, spline: false, ...steady });
    P.B(seed + 21, sharp([[2, -84], [78, -66], [2, -46]], 5), { fill: C.green, line: ink, lw: 5, tone: .85, dens: .8 });
    P.W(seed + 22, 'V2', 34, -60, 26, { col: '#fbf8ef', align: 'center', w: .13 });
    g.restore();
  }
}
GAGS.upgrade = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 1100), tr = travel(k);
  const hb = Math.max(0, .1 - Math.abs(a - .04)) * 4;              // a little shudder when the roof lands
  g.save();
  g.scale(1 + gr.sq * .01, 1 - gr.sq * .016 + hb * .02);
  P.B(1, sharp([[-150, 0], [150, 0], [150, -146], [0, -272], [-150, -146]], 10), { fill: '#d6a466', shade: '#93662f', lw: 6.6, hw: 5.4, tone: .75, sh: .3 });
  [-1, 1].forEach((sd, i) => P.L(2 + i, [[sd * 150, -40], [sd * 74, -40]], { w: 4.4, col: '#93662f', alpha: .7, spline: false, ...steady }));
  [-1, 1].forEach((sd, i) => P.L(4 + i, [[sd * 150, -88], [sd * 74, -88]], { w: 4.4, col: '#93662f', alpha: .7, spline: false, ...steady }));
  P.B(6, sharp([[-62, 0], [-62, -84], [-49, -116], [-25, -134], [0, -140], [25, -134], [49, -116], [62, -84], [62, 0]], 6), { fill: '#4a3226', line: ink, lw: 6, hw: 5, tone: .9 });
  // The dog in the doorway: he looks up at the roof, squints at the clunk, and beams.
  dogFront(g, { x: 0, y: -8 - gr.bob * .35 - tr.hop * .5, s: .64, t, seed: 31, breed: 'lab', eyes: a >= 0 ? (a < .09 ? 'squint' : 'happy') : 'wide', look: a < 0 ? [0, -1] : [0, 0], mouth: a >= .09 ? .5 : 0, tongue: a >= .12, collar: C.red, body: false, tilt: gr.lean * .6, ear: Math.sin(t * 6) * .3 });
  P.B(7, rrect(0, 4, 150, 14, 5, 2, 7), { fill: '#b98a4c', line: ink, lw: 5, tone: .7, dens: .6 });
  g.restore();
  // The old roof, held up on two gloves; on the word they whisk it up and away, behind the valance.
  const go = puff((a + .1) / .3), yOld = -190 + (a < -.1 ? Math.sin(t * 9) * 5 : 0) - go * go * 900;
  if (a < .3) behindValance(g, () => {
    g.save(); g.translate(0, yOld); g.rotate(-go * .25);
    roofBand(g, t, pens(g, t, 1200), { fill: '#a19fac', shade: '#6d6b76', old: true, seed: 40 });
    g.restore();
    [-1, 1].forEach((sd, i) => glove(g, t, sd * 152, -174 + yOld, { seed: 920 + i * 10, sleeve: C.orange, dark: '#a1531a', tilt: -sd * .05, grip: 1 }));
  });
  // The new roof: drops in on the word, squashing as it lands, and puts up its flag.
  if (a >= -.14) {
    const u = puff((a + .14) / .14), sq = a > 0 ? Math.exp(-a * 14) * Math.cos(a * 40) : 0;
    g.save(); g.translate(0, -150 * (1 - u * u)); g.scale(1 + sq * .04, 1 - sq * .07);
    roofBand(g, t, pens(g, t, 1300), { fill: '#d24a3a', shade: '#8f2226', seed: 60, flag: puff((a - .1) / .2) });
    g.restore();
  }
  if (a > 0) [[-190, -190, .1], [200, -170, .16], [-20, -350, .06], [120, -300, .22]].forEach(([x, y, d], i) => {
    const s = a - d;
    if (s > 0) twinkle(g, t, x, y, 26 * Math.min(1, s * 9) * (1 + Math.sin(t * 9 + i) * .2), 1350 + i, i % 2 ? C.yellow : '#fff3b0', t * 1.4 + i);
  });
  pin(g, t, -205, -255, 30, k.col, a, 3101);
};
// @@END g1

// @@BEGIN g2
// ---------------------------------------------------------------- 2. replaceability
// A puppy keeps eating while a glove lifts his blue bowl away and a green one is there instead: he never looks up.
function bowl(g, t, P, x, o = {}) {
  const { fill, rim, seed = 0, back = true, front = true, dark = '#4a3a2a', pat = 'bone' } = o;
  const rx = 132, ry = 26, top = -92;
  g.save(); g.translate(x, 0);
  if (back) {
    P.B(seed, ellipse(0, top, rx, ry, 12, 0, seed), { fill: dark, line: ink, lw: 6, tone: .9, hw: 5 });
    for (let i = 0; i < 12; i++) { const bx = (hash(seed, i) - .5) * 190, by = top - 4 - hash(seed, i, 2) * 10; P.D(seed + 20 + i, bx, by + 4, 9 + hash(seed, i, 3) * 3, { col: i % 3 ? '#a4692f' : '#c98a45' }); }
  }
  if (front) {
    const arc = []; for (let i = 0; i <= 10; i++) { const an = Math.PI * (1 - i / 10); arc.push([Math.cos(an) * rx, top + Math.sin(an) * ry]); }   // the front lip, left to right
    P.B(seed + 40, [...arc, [rx - 30, -8], [rx - 44, 0], [-rx + 44, 0], [-rx + 30, -8]], { fill, shade: rim, lw: 6.4, hw: 5.2, tone: .85, sh: .3 });
    if (pat === 'bone') P.B(seed + 41, sharp([[-30, -44], [-22, -52], [-14, -44], [14, -44], [22, -52], [30, -44], [30, -34], [22, -26], [14, -34], [-14, -34], [-22, -26], [-30, -34]], 4), { fill: '#fbf8ef', line: ink, lw: 4, tone: .9, dens: .5 });
    else [-70, -24, 24, 70].forEach((sx, i) => P.L(seed + 41 + i, [[sx, -62], [sx * .9, -14]], { w: 9, col: rim, alpha: .8, spline: false, ...steady }));
  }
  g.restore();
}
GAGS.replace = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 1400), tr = travel(k);
  const chew = Math.abs(Math.sin(t * 13));
  const lift = puff((a + .02) / .24), li = lift * lift * (3 - 2 * lift);
  const OLD = { fill: C.blue, rim: '#1f3f8f', seed: 70, pat: 'bone' }, NEW = { fill: C.lime, rim: '#3e7d1c', seed: 100, pat: 'stripes' };
  const newIn = a >= -.02 ? backOut(puff((a + .02) / .14), 2.4) : 0;
  if (li === 0) bowl(g, t, P, 0, { ...OLD, front: false });
  if (newIn > 0) { g.save(); g.scale(newIn, newIn); bowl(g, t, P, 0, { ...NEW, front: false }); g.restore(); }
  // The puppy: dipping to eat, ears flapping, spots and all.
  dogFront(g, { x: 0, y: -66 + chew * 9 - gr.bob * .25 - tr.hop * .4, s: 1.28, t, seed: 33, breed: 'dalmatian', eyes: 'happy', mouth: .3 + chew * .35, collar: C.red, body: false, ear: Math.sin(t * 26) * .5, tilt: gr.lean * .8 + tr.lean });
  if (newIn > 0) { g.save(); g.scale(newIn, newIn); bowl(g, t, P, 0, { ...NEW, back: false }); g.restore(); }
  if (li === 0) bowl(g, t, P, 0, { ...OLD, back: false });
  [-1, 1].forEach((sd, i) => paw(g, t, sd * 104, -102, 1, 130 + i * 5));
  // The old bowl, in the glove's grip, going up and away to the right with the last of the kibble.
  if (li > 0 && li < 1) {
    g.save(); g.translate(li * 360, -li * 280 - li * li * 60); g.rotate(li * .8);
    bowl(g, t, P, 0, OLD);
    g.restore();
  }
  // The glove: drops on to the rim, takes hold, and carries the bowl off.
  const gin = puff((a + .2) / .18), gx = 140 + li * 360, gy = -128 - (1 - gin * gin) * 520 - li * 280 - li * li * 60;
  if (a > -.22 && li < 1) behindValance(g, () => glove(g, t, gx, gy, { seed: 900, sleeve: C.purple, dark: '#4a2f8a', tilt: .08 + li * .5, grip: gin }));
  if (li > 0 && li < 1) for (let i = 0; i < 8; i++) {
    const vx = 80 + hash(i, 4) * 340, vy = -260 - hash(i, 5) * 240, x = 10 + vx * li * .5, y = -110 + vy * li + 900 * li * li;
    if (y < -8) P.D(150 + i, x, y, 8 + hash(i, 6) * 3, { col: '#a4692f' });
  }
  pin(g, t, -190, -300, 30, k.col, a, 3102);
};
// @@END g2

// @@BEGIN g3
// ---------------------------------------------------------------- 3. explainability
// A show judge in a bowler holds up a scorecard that says FIRST, and BECAUSE, and its reasons: it turns to face
// us on the word. (Does it say why?)
GAGS.explain = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 1500), tr = travel(k);
  const JX = 100, CX = -150;
  const flip = backOut(puff((a + .16) / .22), 1.7);
  const nod = a > 0 ? Math.exp(-a * 6) * Math.sin(a * 24) : 0;
  const bowlerHat = (g2, top, rx) => {
    blob(g2, sharp([[-60, top + 4], [-54, top - 28], [-30, top - 54], [0, top - 60], [30, top - 54], [54, top - 28], [60, top + 4]], 9), { fill: '#3a3947', shade: '#1a1a22', line: ink, lw: 6, seed: 1510, t, hw: 4.6, tone: .9, sh: .3 });
    blob(g2, ellipse(0, top + 6, 88, 13, 10, 0, 1511), { fill: '#3a3947', line: ink, lw: 6, seed: 1511, t, hw: 4.6, tone: .9 });
    line(g2, [[-54, top - 6], [0, top - 2], [54, top - 6]], { w: 8, col: C.red, seed: 1512, t, spline: true, passes: 1, over: 0, bow: 0 });
  };
  dogFront(g, { x: JX, y: -112 - gr.bob * .6 - tr.hop, s: 1.3, t, seed: 35, breed: 'bulldog', eyes: a < .05 ? 'dot' : 'happy', brow: a < .05 ? 1 : 0, mouth: 0, collar: C.red, body: true, hat: bowlerHat, tilt: gr.lean + tr.lean + nod * .06 });
  // His arm, the handle and the card.
  const lift = -gr.bob * .4;
  P.B(2, capsule([JX - 70, -64 + lift], [CX + 46, -84 + lift], 27, 23, 5, 1502), { fill: '#d6a165', shade: '#a26f3a', lw: 6, hw: 5, tone: .6, sh: .3 });
  P.L(3, [[CX, -100 + lift], [CX + 4, -56 + lift]], { w: 12, col: '#8b5f2a', spline: false, ...steady });
  g.save(); g.translate(CX, -232 + lift); g.scale(Math.max(.06, flip), 1); g.rotate(-.05 + nod * .04);
  P.B(4, sharp([[-105, -140], [105, -140], [105, 140], [-105, 140]], 14), { fill: '#fbf8ef', line: C.red, lw: 8.5, hw: 4.6, tone: .95, dens: .25 });
  if (flip > .35) {
    P.W(5, 'FIRST', 0, -62, 56, { col: C.red, align: 'center', w: .11, track: 2 });
    P.L(6, [[-84, -42], [84, -42]], { w: 4.6, col: ink, alpha: .7, spline: false, ...steady });
    P.W(7, 'BECAUSE', 0, -4, 32, { col: ink, align: 'center', w: .11, track: 2 });
    [['SHINY COAT', 50], ['GOOD GAIT', 100]].forEach(([s, y], i) => {
      P.L(8 + i * 2, [[-92, y - 10], [-80, y + 2], [-62, y - 24]], { w: 6, col: C.green, spline: false, ...steady });
      P.W(9 + i * 2, s, 16, y, 25, { col: ink, align: 'center', w: .11, track: 2 });
    });
  }
  g.restore();
  paw(g, t, CX + 34, -78 + lift, 1.05, 1520, '#d6a165');
  if (a > 0) [[-255, -330, .04], [-40, -360, .1], [-262, -110, .16]].forEach(([x, y, d], i) => { const s = a - d; if (s > 0) twinkle(g, t, x, y, 24 * Math.min(1, s * 9), 1530 + i, i % 2 ? C.yellow : '#fff3b0', t * 1.4 + i); });
  pin(g, t, JX + 66, -80, 28, k.col, a, 3103);
};
// @@END g3

// @@BEGIN g4
// ---------------------------------------------------------------- 4. traceability
// A hound, nose to a red thread, follows it back along the stage to where it began: a ball of yarn. On the
// word he finds it (!). (Can you follow it back to its source?)
function yarn(g, t, P, x, y, r, seed, hopY = 0) {
  g.save(); g.translate(x, y - hopY);
  P.B(seed, ellipse(0, 0, r, r * .96, 12, 0, seed), { fill: '#e8574d', shade: '#a52a2a', lw: 6, hw: 5, tone: .8, sh: .3 });
  [[-.7, -.25, .5, .55], [-.5, .1, .8, .3], [-.2, .5, .9, -.1]].forEach(([sx, sy, ex, ey], i) => P.L(seed + 1 + i, [[sx * r, sy * r], [(sx + ex) / 2 * r, (sy + ey) / 2 * r - r * .3], [ex * r, ey * r]], { w: 4.4, col: '#7a1c1c', alpha: .7, spline: true }));
  P.L(seed + 5, [[-.3 * r, -.85 * r], [.5 * r, -.35 * r]], { w: 4.4, col: '#ffb3a8', alpha: .8, spline: false, ...steady });
  g.restore();
}
GAGS.trace = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 1600), tr = travel(k);
  const found = a >= 0;
  const creep = puff((a + .85) / .85);
  const D0 = { x: 0, y: 0, s: .9, flip: 1, bodyH: .62, lean: found ? 0 : .28 };
  // Put him where his nose meets the ball at the word (and a step back before that).
  const noseX = dogPoint('hound', D0, 278, -140)[0];
  const hx = 150 - noseX - (1 - creep) * 58;
  // The thread runs along the stage from the ball, the way he came; a pulse runs back up it to the ball.
  const bh = found ? Math.abs(Math.sin(Math.min(a, .36) * 9)) * 44 * Math.exp(-a * 3) : 0;
  yarn(g, t, P, 208, -42, 42, 1610, bh);
  const D = { ...D0, x: hx, t, seed: 41, collar: C.green, walk: found ? 0 : (t * 1.6) % 1, tail: t * (found ? 5 : 1.4), wag: found ? 1.3 : .6, eyes: found ? 'wide' : 'open', mouth: found ? .5 : 0, tongue: found, lean: (found ? .04 : .28) + tr.lean, bob: gr.bob * .35 + tr.hop, squash: gr.sq * .4, ear: 0 };
  sideDog(g, 'hound', D);
  // The thread, lying on the stage in front of his feet, with a loop in it; a pulse runs up it to the ball.
  const th = [[176, -6], [140, 3], [100, -7], [60, 5], [22, -3], [-6, -30], [-40, -16], [-16, 6], [26, 12], [-44, 8], [-100, -2], [-160, 9], [-215, -1], [-262, 7]];
  P.L(1, th, { w: 9, col: '#d23a3a', spline: true, passes: 1, ...steady, taper: [.02, .02], tooth: .5, alpha: 1 });
  if (!found) for (let i = 0; i < 4; i++) { const px = lerp(-250, 165, (t * .9 + i / 4) % 1); P.D(2 + i, px, 4 - Math.sin(px * .05) * 5, 6, { col: '#ffc9c0' }); }
  // "!" pops over him when he finds it.
  if (found) {
    const [hx2, hy2] = dogPoint('hound', D, 91, -200), k2 = backOut(puff(a / .16), 2.6);
    g.save(); g.translate(hx2 + 20, hy2 - 190); g.scale(k2, k2);
    bubble(g, 0, 0, 96, 96, -10, 70, t, { seed: 1640, r: 30 });
    P.W(20, '!', 0, 26, 74, { col: C.red, align: 'center', w: .14 });
    g.restore();
  }
  { const [px, py] = dogPoint('hound', D, 54, -116); pin(g, t, px + 8, py + 6, 26, k.col, a, 3104); }
};
// @@END g4

// @@BEGIN g5
// ---------------------------------------------------------------- 5. observability
// A corgi with a glass belly: you can see its works (cogs turning, a gauge, a heartbeat running) even when
// nothing is wrong. An onlooker at the window asks a question (?), and the gauge answers.
GAGS.observe = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 1700), tr = travel(k);
  const DX = 70, WY = -64;
  dogFront(g, { x: DX, y: -125 - gr.bob * .6 - tr.hop, s: 1.55, t, seed: 37, breed: 'corgi', eyes: 'happy', mouth: .45, tongue: true, collar: C.blue, body: true, tilt: gr.lean * .8 + tr.lean, ear: Math.sin(t * 5) * .3 });
  // The window in his belly: a gold ring, glass, and the works.
  g.save(); g.translate(DX, WY - gr.bob * .6 - tr.hop);
  P.B(1, ellipse(0, 0, 56, 56, 14, 0, 1701), { fill: '#e6b73a', shade: '#a67a12', lw: 6, hw: 5, tone: .85, sh: .25 });
  P.B(2, ellipse(0, 0, 45, 45, 14, 0, 1702), { fill: '#cfeaf7', line: ink, lw: 4.4, hw: 4.6, tone: .95, dens: .35 });
  const spin = t * 1.7;
  P.B(3, star(-15, -13, 19, 14, 8, spin, 1703), { fill: '#9aa1b8', line: ink, lw: 4.2, tone: .9 });
  P.D(4, -15, -13, 5, { col: ink });
  P.B(5, star(15, -21, 11, 8, 7, -spin * 1.6 + .3, 1705), { fill: '#b7a86a', line: ink, lw: 3.8, tone: .9 });
  P.B(6, ellipse(20, 10, 16, 16, 10, 0, 1706), { fill: '#fbf8ef', line: ink, lw: 3.8, tone: .95, dens: .3 });
  const nd = -.9 + Math.sin(t * 3.1) * .55 + (a > .1 ? Math.min(1, (a - .1) * 5) * .8 : 0);
  P.L(7, [[20, 10], [20 + Math.cos(nd) * 13, 10 + Math.sin(nd) * 13]], { w: 3.6, col: C.red, spline: false, ...steady });
  const ecg = []; for (let i = 0; i <= 22; i++) { const x = -34 + i * 3.1, m = (((x + 34) / 68 - t * .7) % 1 + 1) % 1; ecg.push([x, 28 - (m < .3 ? 0 : m < .38 ? 14 : m < .46 ? -24 : m < .54 ? 6 : 0)]); }
  P.L(8, ecg, { w: 3.8, col: C.red, spline: false, ...steady });
  P.L(9, [[-33, -30], [-22, -38], [-8, -40]], { w: 3.6, col: '#fbf8ef', alpha: .9, spline: true, ...steady });
  g.restore();
  // The onlooker, small, peering in, with a question.
  const IX = -168;
  dogFront(g, { x: IX, y: -50 - gr.bob * .5, s: .66, t, seed: 39, breed: 'pug', eyes: 'wide', look: [1, .2], mouth: 0, collar: C.green, body: true, tilt: .05 + gr.lean });
  const q = backOut(puff(a / .16), 2.6);
  g.save(); g.translate(IX - 6, -230); g.scale(q, q);
  bubble(g, 0, 0, 96, 92, 14, 84, t, { seed: 1740, r: 30 });
  P.W(20, '?', 0, 26, 70, { col: C.purple, align: 'center', w: .14 });
  g.restore();
  pin(g, t, DX + 98, -114, 28, k.col, a, 3105);
};
// @@END g5

// @@BEGIN g6
// ---------------------------------------------------------------- 6. reversibility
// A white dog jumps into the mud and comes out brown; on the word an UNDO arrow spins and he jumps back out,
// clean, the mud flying back into the puddle. (Can you undo it?)
GAGS.undo = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 1800), tr = travel(k);
  const X0 = -82, X1 = 88, J0 = -.68, LAND = -.36, U0 = 0, BACK = .3;
  // Where the dog is: waiting, in flight (a hop), in the mud, and, on the word, the same hop backwards.
  let p = 0, dirty = false;
  if (a < J0) p = 0; else if (a < LAND) p = (a - J0) / (LAND - J0); else if (a < U0) { p = 1; dirty = true; } else if (a < BACK) { p = 1 - (a - U0) / (BACK - U0); dirty = a < U0 + .12; } else p = 0;
  const e = p * p * (3 - 2 * p), x = lerp(X0, X1, e), air = p > 0 && p < 1, fly = air ? Math.sin(Math.PI * p) * 150 : 0;
  // The puddle: its back, then the dog, then its front lip.
  P.B(1, ellipse(X1, -6, 128, 23, 14, 0, 1801), { fill: '#7a5230', shade: '#4d3218', lw: 6, hw: 5, tone: .9, sh: .35 });
  P.B(2, ellipse(X1, -8, 84, 11, 10, 0, 1802), { fill: '#a17545', line: null, tone: .7, dens: .5 });
  const lean = air ? lerp(-.34, .34, e) : 0;
  const D = { x, y: -fly + (p >= 1 ? 9 : 0), s: .78, t, seed: 51, collar: C.red, walk: 0, tail: t * 2.2, eyes: dirty ? 'wide' : (a > BACK ? 'happy' : (air ? 'wide' : 'open')), mouth: dirty ? .3 : (a > BACK ? .5 : .1), brow: dirty ? 1 : 0, lean, bob: air ? 0 : gr.bob * (dirty ? 0 : .6), squash: (p >= 1 && a < LAND + .1 ? 2 : 0) + (air ? 0 : gr.sq * .4) };
  sideDog(g, 'white', D);
  // Mud on him, in patches, while he is dirty (they fly off as he is undone).
  if (dirty || (air && a > LAND - .01)) {
    const k2 = a >= U0 ? clamp(1 - (a - U0) / .12) : 1;
    [[-40, -170, 34], [10, -196, 30], [60, -140, 28], [-8, -110, 26], [118, -226, 24], [-70, -128, 22], [150, -180, 20]].forEach(([lx, ly, r], i) => {
      const [wx, wy] = dogPoint('white', D, lx, ly);
      P.B(10 + i, ellipse(wx, wy, r * .8 * k2, r * .64 * k2, 8, 0, 1810 + i), { fill: '#6d4a26', line: null, tone: .85, dens: .9 });
    });
  }
  const lipO = [], lipI = [];
  for (let i = 0; i <= 10; i++) { const an = Math.PI * i / 10; lipO.push([X1 + Math.cos(an) * 128, -6 + Math.sin(an) * 23]); lipI.push([X1 + Math.cos(an) * 116, -6 + Math.sin(an) * 11]); }
  P.B(3, [...lipO, ...lipI.reverse()], { fill: '#7a5230', line: null, tone: .9, dens: .9 });
  // Splashes on the way in; the same splashes flying back in when it is undone.
  const sp = a < U0 ? a - LAND : U0 + .3 - a;
  if ((a > LAND && a < U0) || (a >= U0 && a < U0 + .3)) for (let i = 0; i < 9; i++) {
    const s = Math.max(0, sp), vx = (i - 4) * 46, vy = -330 - hash(i, 3) * 200, dx = X1 + vx * s * 1.1, dy = -20 + vy * s + 1700 * s * s;
    if (dy < -4 && s < .3) P.B(30 + i, ellipse(dx, dy, 9 + hash(i, 5) * 6, 12 + hash(i, 6) * 5, 6, 0, 1830 + i), { fill: '#6d4a26', line: null, tone: .9 });
  }
  // The UNDO arrow: draws itself round, counter-clockwise, over the dog, then fades.
  if (a > -.02 && a < .62) {
    const pr = puff((a + .02) / .2), fade = a > .4 ? 1 - (a - .4) / .22 : 1;
    const cx = 4, cy = -405, r = 84, th0 = .5, th1 = -Math.PI * 1.18, pts = [];
    for (let i = 0; i <= 20; i++) { const th = lerp(th0, th1, i / 20 * pr); pts.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]); }
    g.save(); g.globalAlpha *= fade;
    P.L(40, pts, { w: 34, col: ink, spline: true, flat: true, ...steady, alpha: 1, tooth: .8 });
    P.L(41, pts, { w: 22, col: C.blue, spline: true, flat: true, ...steady, alpha: .98, tooth: .5 });
    if (pr > .12) {
      const th = lerp(th0, th1, pr), tx = Math.sin(th), ty = -Math.cos(th), px = cx + Math.cos(th) * r, py = cy + Math.sin(th) * r, nx = Math.cos(th), ny = Math.sin(th);
      P.B(42, sharp([[px + tx * 44, py + ty * 44], [px + nx * 38, py + ny * 38], [px - nx * 38, py - ny * 38]], 4), { fill: C.blue, line: ink, lw: 6, tone: .85 });
    }
    if (pr > .25) P.W(43, 'UNDO', cx, cy + 16, 42, { col: ink, align: 'center', w: .12, alpha: 1 });
    g.restore();
  }
  if (a > BACK - .05) [[-200, -150, .0], [110, -260, .07], [-90, -300, .13]].forEach(([sx, sy, d], i) => { const s = a - BACK - d + .05; if (s > 0) twinkle(g, t, sx, sy, 26 * Math.min(1, s * 9) * (1 + Math.sin(t * 9 + i) * .2), 1850 + i, i % 2 ? C.yellow : '#fff3b0', t * 1.4 + i); });
  { const [px, py] = dogPoint('white', D, 96, -128); pin(g, t, px + 10, py, 26, k.col, a, 3106); }
};
// @@END g6

// @@BEGIN g7
// ---------------------------------------------------------------- 7. installability
// A flat-pack box with one big button; a husky puts a paw on it and, on the word, a whole kennel pops up, ready.
GAGS.install = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 1900), tr = travel(k);
  const BX = 96, TOP = -84;
  const press = a < -.1 ? 0 : a < -.02 ? (a + .1) / .08 : a < .12 ? 1 - (a + .02) / .14 : 0;
  const popK = a >= 0 ? backOut(puff(a / .24), 2.8) : 0;
  const startle = a >= 0 ? Math.exp(-a * 9) * Math.sin(a * 30) : 0;
  // The husky at the box.
  dogFront(g, { x: -96 + startle * 6, y: -92 - gr.bob * .6 - tr.hop - (a >= 0 ? Math.exp(-a * 12) * 30 : 0), s: 1.15, t, seed: 43, breed: 'husky', eyes: a < 0 ? 'open' : a < .3 ? 'wide' : 'happy', look: a < 0 ? [1, .8] : [0, 0], mouth: a < 0 ? 0 : .6, tongue: a > .3, collar: C.green, body: true, tilt: gr.lean + tr.lean });
  // The box: cardboard, taped, with a picture of what is inside; flaps that fly open.
  P.B(1, sharp([[BX - 118, 0], [BX + 118, 0], [BX + 118, TOP], [BX - 118, TOP]], 8), { fill: '#d0a05e', shade: '#8b5f2a', lw: 6.4, hw: 5.2, tone: .75, sh: .3 });
  P.B(2, sharp([[BX + 20, -58], [BX + 46, -76], [BX + 72, -58], [BX + 72, -18], [BX + 20, -18]], 4), { fill: '#f3dfb4', line: '#8b5f2a', lw: 3.8, tone: .8, dens: .6 });
  P.B(3, sharp([[BX - 8, -6], [BX + 118 - 14, -6], [BX + 118 - 14, -14], [BX - 8, -14]], 2), { fill: '#f6e3a1', line: null, tone: .8, dens: .7 });
  const fo = popK;
  [-1, 1].forEach((sd, i) => {
    g.save(); g.translate(BX + sd * 118, TOP); g.rotate(sd * (-.05 + fo * 1.55));
    P.B(4 + i, sharp([[0, 0], [sd * -118, 0], [sd * -118, -13], [0, -13]], 5), { fill: '#c99a5a', shade: '#8b5f2a', lw: 5.4, hw: 4.8, tone: .75, sh: .3 });
    g.restore();
  });
  // The kennel that pops up, round-topped, blue, with a door and a flag.
  if (popK > 0.02) {
    g.save(); g.translate(BX, TOP + 2); g.scale(1 + (popK - 1) * .12, popK);
    const dome = []; for (let i = 0; i <= 12; i++) { const an = Math.PI * i / 12; dome.push([-Math.cos(an) * 100, -Math.sin(an) * 146]); }
    P.B(10, sharp(dome, 6), { fill: '#5b8fdc', shade: '#2a4f9a', lw: 6.6, hw: 5.4, tone: .8, sh: .3 });
    [[-58, -84], [56, -92], [4, -128]].forEach(([dx, dy], i) => P.D(11 + i, dx, dy, 9, { col: '#fbf8ef' }));
    P.B(14, sharp([[-40, 0], [-40, -60], [-28, -86], [0, -96], [28, -86], [40, -60], [40, 0]], 6), { fill: '#3a2a26', line: ink, lw: 6, tone: .9 });
    P.L(15, [[0, -146], [0, -206]], { w: 6, col: ink, spline: false, ...steady });
    P.B(16, sharp([[2, -206], [58, -190], [2, -174]], 4), { fill: C.yellow, line: ink, lw: 5, tone: .85, dens: .8 });
    g.restore();
    if (a < .35) burst(g, BX, TOP - 60, 120, 230, t, { col: C.yellow, seed: 1990, prog: easeOut(clamp(a / .3)), n: 14, w: 9 });
  }
  // The button: a green dome with a down arrow; the paw comes down on it, once.
  const bh = 1 - press * .5;
  g.save(); g.translate(BX - 96, TOP);
  P.B(20, sharp([[-42, 0], [-38, -20 * bh], [-18, -34 * bh], [18, -34 * bh], [38, -20 * bh], [42, 0]], 8), { fill: '#3fae5a', shade: '#1f6b34', lw: 6, hw: 5, tone: .85, sh: .3 });
  P.L(21, [[0, -26 * bh], [0, -10 * bh]], { w: 7, col: '#fbf8ef', spline: false, ...steady });
  P.L(22, [[-9, -17 * bh], [0, -8 * bh], [9, -17 * bh]], { w: 7, col: '#fbf8ef', spline: false, ...steady });
  g.restore();
  // His arm and the paw on the button.
  const py = TOP - 44 * bh - 34 + (1 - press) * -40 * (a < 0 ? 1 : .2);
  P.B(23, capsule([-52, -60 - gr.bob * .5], [BX - 96, py], 25, 22, 5, 1923), { fill: '#a3a2b0', shade: '#6d6c7a', lw: 6, hw: 5, tone: .6, sh: .3 });
  paw(g, t, BX - 96, py + 8, 1.1, 1925);
  pin(g, t, -158, -56, 28, k.col, a, 3107);
};
// @@END g7

// @@BEGIN g8
// ---------------------------------------------------------------- 8. portability
// The same chihuahua fits a handbag, a rucksack and a basket, unchanged: he hops from one to the next.
function carrier(g, t, P, x, kind, part) {
  g.save(); g.translate(x, 0);
  const s = 2100 + (kind === 'bag' ? 0 : kind === 'pack' ? 30 : 60);
  if (kind === 'bag') {
    if (part === 'back') {
      P.L(s, [[-44, -96], [-40, -160], [0, -196], [40, -160], [44, -96]], { w: 15, col: '#8b5f2a', spline: true, ...steady, taper: [.02, .02] });
      P.B(s + 1, ellipse(0, -96, 66, 13, 10, 0, s + 1), { fill: '#3a2a26', line: ink, lw: 5.4, tone: .9 });
    } else {
      P.B(s + 2, sharp([[-62, 0], [62, 0], [72, -96], [-72, -96]], 12), { fill: '#d6455a', shade: '#8f2236', lw: 6.4, hw: 5.2, tone: .8, sh: .3 });
      P.B(s + 3, ellipse(0, -80, 13, 13, 8, 0, s + 3), { fill: '#f0c84a', line: ink, lw: 4.6, tone: .9 });
      P.L(s + 4, [[-62, -30], [62, -30]], { w: 4.4, col: '#8f2236', alpha: .6, spline: false, ...steady });
    }
  } else if (kind === 'pack') {
    if (part === 'back') {
      P.B(s, sharp([[-64, -112], [64, -112], [58, -132], [-58, -132]], 10), { fill: '#2f8a4a', line: ink, lw: 5.6, tone: .85 });
      P.B(s + 1, ellipse(0, -110, 60, 12, 10, 0, s + 1), { fill: '#3a2a26', line: ink, lw: 5, tone: .9 });
    } else {
      P.B(s + 2, sharp([[-66, 0], [66, 0], [66, -112], [-66, -112]], 16), { fill: C.green, shade: '#2f8a4a', lw: 6.4, hw: 5.2, tone: .8, sh: .3 });
      P.B(s + 3, sharp([[-44, -12], [44, -12], [44, -58], [-44, -58]], 8), { fill: '#7fcf8a', line: ink, lw: 5, tone: .8, dens: .8 });
      P.L(s + 4, [[-70, -100], [-76, -50], [-70, -8]], { w: 9, col: '#8b5f2a', spline: true, ...steady });
      P.L(s + 5, [[70, -100], [76, -50], [70, -8]], { w: 9, col: '#8b5f2a', spline: true, ...steady });
      P.B(s + 6, rrect(0, -104, 26, 16, 4, 2, s + 6), { fill: '#f0c84a', line: ink, lw: 4.4, tone: .9 });
    }
  } else {
    if (part === 'back') {
      P.L(s, [[-62, -92], [-58, -170], [0, -204], [58, -170], [62, -92]], { w: 13, col: '#a9793a', spline: true, ...steady, taper: [.02, .02] });
      P.B(s + 1, ellipse(0, -90, 70, 13, 10, 0, s + 1), { fill: '#3a2a26', line: ink, lw: 5, tone: .9 });
    } else {
      P.B(s + 2, sharp([[-58, 0], [58, 0], [76, -90], [-76, -90]], 10), { fill: '#e2b878', shade: '#a9793a', lw: 6.4, hw: 5.2, tone: .8, sh: .3 });
      [-3, -2, -1, 0, 1, 2, 3].forEach((i, j) => P.L(s + 3 + j, [[i * 20, -4], [i * 24, -88]], { w: 4, col: '#a9793a', alpha: .7, spline: false, ...steady }));
      [-26, -50, -72].forEach((y, j) => P.L(s + 12 + j, [[-64 - (-y) * .14, y], [64 + (-y) * .14, y + 4]], { w: 4, col: '#a9793a', alpha: .7, spline: true, ...steady }));
    }
  }
  g.restore();
}
GAGS.port = (g, t, k) => {
  const { a, gr } = k;
  const P = pens(g, t, 2000), tr = travel(k);
  const SL = [-152, 0, 152], KIND = ['bag', 'pack', 'basket'], SEAT = -84;
  const H1 = [-.64, -.34], H2 = [-.28, 0];
  let slot = 0, fly = 0, from = 0, to = 0;
  if (a >= H1[0] && a < H1[1]) { from = 0; to = 1; fly = (a - H1[0]) / (H1[1] - H1[0]); }
  else if (a >= H2[0] && a < H2[1]) { from = 1; to = 2; fly = (a - H2[0]) / (H2[1] - H2[0]); }
  else slot = a < H1[0] ? 0 : a < H2[0] ? 1 : 2;
  const flying = fly > 0;
  const dx = flying ? lerp(SL[from], SL[to], fly * fly * (3 - 2 * fly)) : SL[slot];
  const dy = flying ? -Math.sin(Math.PI * fly) * 150 : 0;
  const sinceLand = a < H1[1] ? a - H1[1] + 1 : a < H2[1] ? a - H1[1] : a - H2[1];
  const sq = flying ? -.5 * Math.sin(Math.PI * fly) : Math.exp(-Math.max(0, a - (slot === 2 ? H2[1] : slot === 1 ? H1[1] : -9)) * 14) * 1.6;
  const dog = () => dogFront(g, { x: dx, y: SEAT + dy - (flying ? 0 : gr.bob * .35), s: .92, t, seed: 47, breed: 'chihuahua', eyes: flying ? 'wide' : 'happy', mouth: flying ? .5 : .2, collar: C.pink, body: true, squash: sq, tilt: flying ? (to > from ? .12 : -.12) * Math.sin(Math.PI * fly) + gr.lean * .5 : gr.lean * .6 + tr.lean, ear: flying ? -.8 : Math.sin(t * 5) * .3 });
  KIND.forEach((kd, i) => carrier(g, t, P, SL[i], kd, 'back'));
  if (!flying) dog();
  KIND.forEach((kd, i) => carrier(g, t, P, SL[i], kd, 'front'));
  if (flying) dog();
  // A twinkle where he lands: he fits.
  [[H1[1], SL[1]], [H2[1], SL[2]]].forEach(([tl, x], i) => { const s = a - tl; if (s > 0 && s < .3) twinkle(g, t, x + 66, -150, 24 * (1 - s / .3), 2080 + i, C.yellow, t * 3); });
  pin(g, t, dx + 36, SEAT + dy - 36, 24, k.col, a, 3108);
};
// @@END g8

// @@GAGS-END
