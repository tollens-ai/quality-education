// The finale's props and machinery (the lead-in and chorus 3): three golden-hour rings side by side, the camera
// that looks at them, the roaring crowd, the twelve dogs on their marks, the dogs that race into the ring, the
// sing-along board's layer shared by both parts, and the fireworks and ribbons of the held "know!".
// Everything is drawn with the pen and is a pure function of the song's time. The world is 3240 px wide: ring k
// spans x = k * 1080 .. (k + 1) * 1080 and is drawn in the same coordinates as chorus 1's ring, so the gags of the
// choruses before it can be drawn into it by moving the canvas.
import { W, H, TAU, clamp, lerp, hash, inv, smooth, easeOut, easeIn, easeInOut, backOut, beatPos, beatPulse, hit, loud, words } from './kit.js';
import { blob, line, dot, scrub } from './pencil.js';
import { ellipse, rrect } from './shapes.js';
import { paper } from './paper.js';
import { rosette, sparkle } from './props.js';
import { clawd, dachshund } from './chars.js';
import { dogFront } from './people.js';
import { sun, tree, bunting } from './world.js';
import { RING_MOODS, RING } from './ring.js';
import { ROSETTES, bowler } from './ringcast.js';
import { BOARD, WORDS, ballPath, ballAt, drawBall, signBoard, wordsY } from './board.js';
import { sing } from './lyrics.js';
import { blink, spring } from './life.js';
import { CHORUS_STARTS } from './scenes/chorus-core.js';
import { GRAPHITE, C } from './palette.js';

export const RW = 1080;
export const RC = [540, 1620, 2700];              // the ring centres, in the world
export const GOLD = RING_MOODS.gold;
export const T_CRASH = 181.545;                    // the crash into the last chorus (bar 211's downbeat)

// ---------------------------------------------------------------- the camera
// (x, y) is the world point at the middle of the picture zone (screen 540, 1080); z is the zoom. { 540, 1080, 1 } is
// the plain frame, ring A exactly as chorus 1 draws its ring.
export const CAM0 = { x: 540, y: 1080, z: 1 };
export function camPush(g, cam) { g.translate(540, 1080); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y); }
export function view(cam) { return { x0: cam.x - 540 / cam.z, x1: cam.x + 540 / cam.z, y0: cam.y - 1080 / cam.z, y1: cam.y + 840 / cam.z }; }
export const toScreen = (cam, x, y) => [540 + (x - cam.x) * cam.z, 1080 + (y - cam.y) * cam.z];
export function ringSeen(k, cam, m = 200) { const v = view(cam); return k * RW - m < v.x1 && (k + 1) * RW + m > v.x0; }

// A frame drawn as a smear: the picture goes into an offscreen canvas and is laid down as a few copies along the
// direction of the whip, each a little further along and fainter, as an animator smears a fast move.
let OFF = null;
function offCanvas(g) {
  if (!OFF || OFF.width !== g.canvas.width || OFF.height !== g.canvas.height) { OFF = document.createElement('canvas'); OFF.width = g.canvas.width; OFF.height = g.canvas.height; }
  return OFF;
}
export function smearDraw(g, draw, dx, base = GOLD.paper) {
  if (Math.abs(dx) < 8) { draw(g); return; }
  const oc = offCanvas(g), og = oc.getContext('2d'), k = g.canvas.width / W;
  og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, oc.width, oc.height);
  og.setTransform(k, 0, 0, k, 0, 0);
  og.save(); draw(og); og.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (base) { g.fillStyle = base; g.fillRect(0, 0, g.canvas.width, g.canvas.height); }
  const n = clamp(Math.round(Math.abs(dx) / 14) + 3, 5, 27);                 // enough copies that the smear is a blur, not a row of ghosts
  for (let i = 0; i < n; i++) { g.globalAlpha = 1 / (i + 1); g.drawImage(oc, (i / (n - 1) - .5) * dx * k, 0); }
  g.restore();
}

// ---------------------------------------------------------------- the panorama
// The golden hour as ring.js draws it (same colours, same sun, same trees and bunting), continued across the world:
// a peach paper, a low sun at the left of ring A, the hedge and trees, the grass, and three sawdust rings with
// their ropes on posts, a striped pole between each pair. Only what the camera sees is drawn. `ropeDown[k]` 0..1
// brings ring k's rope down; `bunt[k]` hangs its bunting.
export function panorama(g, t, cam, o = {}) {
  const { sunMood = 'happy', look = [0, .4], ropeDown = [0, 0, 0], bunt = [true, true, true], seed = 21, poles = 1 } = o;
  const P = GOLD, v = view(cam);
  const sc = 1 / Math.min(1, cam.z);                       // when the camera pulls back the crayon stays the same size on the page
  const wx0 = v.x0 - 80, wx1 = v.x1 + 80, wy0 = Math.min(v.y0 - 80, -60), wy1 = v.y1 + 80;
  const k0 = Math.floor(v.x0 / RW) - 1, k1 = Math.floor(v.x1 / RW) + 1;
  // the sky, a wash of orange from the top down to the horizon
  scrub(g, [wx0, wy0, wx1, 405], { col: P.sky, seed, t, gap: 30 * sc, w: 34 * sc, alpha: P.skyA, angle: .1, wig: 30 * sc });
  scrub(g, [wx0, 315, wx1, 738], { col: P.sky, seed: seed + 3, t, gap: 36 * sc, w: 34 * sc, alpha: P.skyA * .8, angle: .06, wig: 30 * sc });
  scrub(g, [wx0, 558, wx1, 914], { col: P.sky, seed: seed + 6, t, gap: 44 * sc, w: 34 * sc, alpha: P.skyA * .5, angle: .04, wig: 30 * sc });
  // (The same sun as ring.js's golden hour: low on the left but clear of the posts and the rope.)
  if (215 + 250 > v.x0 && 215 - 250 < v.x1) sun(g, t, 215, 708, 104, { mood: sunMood, look, seed: seed + 1, rays: 14 });
  scrub(g, [wx0, 880, wx1, 1010], { col: P.hedge, seed: seed + 5, t, gap: 24 * sc, w: 28 * sc, alpha: .35, angle: -.06, wig: 16 * sc });
  for (let k = k0; k <= k1; k++) {
    [[70, .5], [230, .36], [860, .42], [1010, .34]].forEach(([tx, ts], i) => {
      const x = k * RW + tx;
      if (x + 160 < v.x0 || x - 160 > v.x1) return;
      tree(g, t, x, 930, ts, { seed: 60 + i + (k ? k * 11 : 0), crown: '#8fbf5a', shade: '#5fae5a', far: true });
    });
  }
  scrub(g, [wx0, 940, wx1, wy1], { col: P.grass, seed: seed + 6, t, gap: 20 * sc, w: 28 * sc, alpha: .55, angle: -.1, wig: 20 * sc });
  scrub(g, [wx0, 1000, wx1, wy1], { col: P.grass2, seed: seed + 7, t, gap: 36 * sc, w: 24 * sc, alpha: .35, angle: .16, wig: 18 * sc });
  // the poles between the rings, and the bunting from pole to pole
  for (let k = Math.max(1, k0); k <= Math.min(2, k1 + 1); k++) {
    const x = k * RW;
    if (poles < .05 || x + 60 < v.x0 || x - 60 > v.x1) continue;
    g.save(); g.globalAlpha *= clamp(poles);
    line(g, [[x, 112], [x + 3, 560], [x - 2, 1010]], { w: 13, col: '#d6584a', seed: 300 + k * 7, t, spline: true, passes: 1, tooth: .5, over: 0, bow: 0 });
    [[300, 6], [520, -4], [740, 5]].forEach(([yy, dxx], i) => line(g, [[x - 9, yy + 18], [x + 9, yy - 12]], { w: 7, col: '#fbf8ef', seed: 310 + k * 5 + i, t, spline: false, passes: 1, over: 0, bow: 0 }));
    blob(g, [[x + 2, 96], [x + 2, 156], [x + 62, 126]], { fill: k % 2 ? C.yellow : C.blue, line: GRAPHITE, lw: 4.6, seed: 320 + k, t, gap: 5.6, hw: 4.8, tone: .7 });
    g.restore();
  }
  for (let k = Math.max(0, k0); k <= Math.min(2, k1); k++) {
    const ox = k * RW, R = RING, sd = seed + k * 100;
    if (ox + RW + 60 < v.x0 || ox - 60 > v.x1) continue;
    blob(g, ellipse(ox + R.cx, R.cy, R.rx, R.ry, 18, 0, sd + 8), { fill: P.sawdust, shade: P.sawdust2, line: P.ink, lw: 5.4, seed: sd + 8, t, hw: 5.6, gap: 7, tone: .55, sh: .35 });
    const posts = [];
    for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.02 + i / 8 * .96); posts.push([ox + R.cx + Math.cos(a) * (R.rx + 24), R.cy + Math.sin(a) * (R.ry + 14)]); }
    const rd = clamp(ropeDown[k] || 0);
    line(g, posts.map(([x, y], i) => [x + rd * (i - 4) * 16, y - 96 * (1 - rd) - 8 * rd + Math.sin(i * 1.7) * 10 * rd]), { w: 11, col: P.rope, seed: sd + 9, t, spline: true, passes: 1, tooth: .5 });
    posts.forEach(([x, y], i) => {
      const lean = rd * (i - 4) * 16;
      line(g, [[x + lean, y - 118 * (1 - rd * .55)], [x, y + 8]], { w: 15, col: P.post, seed: sd + 20 + i, t, spline: false, passes: 1, flat: true });
      dot(g, x + lean, y - 120 * (1 - rd * .55), 9, { col: '#fbf8ef', seed: sd + 40 + i, t });
    });
    if (bunt[k] !== false) bunting(g, t, ox + 20, 96, ox + W - 20, 96, { n: 13, sag: 40, seed: sd + 60, size: 34 });
  }
}

// ---------------------------------------------------------------- the crowd
const BREEDS = ['lab', 'beagle', 'corgi', 'poodle', 'pug', 'husky', 'mutt', 'dalmatian', 'bulldog'];
// A row of dog heads along the foot of ring k, roaring: mouths open on the voice, a jump on every beat and drum.
//   hush 0..1: the singing stops and every head is turned to you.
export function crowdRing(g, t, k, o = {}) {
  const { n = 6, roar = 1, hush = 0, seed = 3 + k * 5, y = 1845, s = .85, vox = 0, rise = 0 } = o;
  for (let i = 0; i < n; i++) {
    const x = k * RW + lerp(90, 990, n === 1 ? .5 : i / (n - 1)) + Math.sin(t * 2.2 + i) * 3 * (1 - hush);
    const jump = (beatPulse(t + i * .01, .17) * 15 + hit('drums', t + i * .007, .09) * 11) * roar * (1 - hush) + Math.abs(Math.sin(t * 1.3 + i * 2.1)) * 3 * hush;
    dogFront(g, {
      x, y: y + (i % 2) * 22 - jump + rise * 240, s: s * (.92 + hash(seed, i) * .16), t, seed: seed * 20 + i, breed: BREEDS[(i + seed) % BREEDS.length],
      eyes: hush > .5 ? (blink(t, 70 + i + k * 9) > .5 ? 'shut' : 'dot') : i % 3 === 1 ? 'happy' : 'dot', mouth: hush > .5 ? 0 : clamp(vox * 1.9 + .12 + (i % 2) * .1), tongue: false,
      collar: [C.red, C.blue, C.green, C.purple, C.orange][i % 5], tilt: Math.sin(t * 2.2 + i * 1.7) * .07 * (1 - hush),
    });
    // cheer marks fly off each head on the beat, more on a drum hit: the roar
    const c = roar * (1 - hush) * Math.max(hit('drums', t + i * .007, .13), beatPulse(t + i * .01, .15) * .5);
    if (c > .14) for (let m = -1; m <= 1; m++) {
      const a = -Math.PI / 2 + m * .6, r0 = 168 * s * (.92 + hash(seed, i) * .16) + 12, r1 = r0 + 44 * c, yy = y + (i % 2) * 22 - jump;
      line(g, [[x + Math.cos(a) * r0, yy + Math.sin(a) * r0], [x + Math.cos(a) * r1, yy + Math.sin(a) * r1]], { w: 8, col: C.orange, seed: 1500 + i * 3 + m + 1, t, spline: false, passes: 1, over: 0, bow: 0, taper: [.1, .5], alpha: .9 * clamp(c * 1.6) });
    }
  }
}

// ---------------------------------------------------------------- the twelve dogs on their marks
// Each of the twelve breeds the film has drawn front-on stands on a chalk mark in ring A, in three rows like a team
// photograph: the row in front largest. [breed, x, chin y, scale]; i is the order the rosettes are pinned on.
const ROWY = [[1392, .9], [1272, .78], [1156, .68]], COLX = [[420, 595, 770, 945], [500, 668, 836, 1004], [420, 595, 770, 945]];
const BREED_ROWS = [['chihuahua', 'poodle', 'corgi', 'pug'], ['lab', 'beagle', 'greyhound', 'mutt'], ['husky', 'sheepdog', 'dalmatian', 'bulldog']];
export const DOZEN = [];
BREED_ROWS.forEach((row, r) => row.forEach((breed, c) => DOZEN.push({ i: r * 4 + c, breed, x: COLX[r][c], y: ROWY[r][0], s: ROWY[r][1], row: r, col: c })));
export const WILT = [1, 3, 4, 9];                    // the four whose rosettes wilt on "bad in others"

// The chalk mark a dog stands on: a loop of white chalk on the sawdust, drawn on by `prog`.
export function chalkMark(g, t, D, prog = 1) {
  if (prog <= 0) return;
  const rx = 104 * D.s + 16, ry = 24 * D.s + 8, cy = D.y + 78 * D.s;
  const pts = []; for (let i = 0; i <= 20; i++) { const a = -1.9 + i / 20 * TAU * 1.03; pts.push([D.x + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  line(g, pts, { w: 9, col: '#fffaf0', seed: 700 + D.i, t, from: 0, to: clamp(prog), spline: true, passes: 1, over: 0, bow: 0, alpha: .95, tooth: .5 });
  if (prog > .8) { const a = clamp((prog - .8) / .2); line(g, [[D.x - 14 * D.s, cy - 5], [D.x + 14 * D.s, cy + 5]], { w: 6, col: '#fffaf0', seed: 720 + D.i, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .9 * a }); line(g, [[D.x + 14 * D.s, cy - 5], [D.x - 14 * D.s, cy + 5]], { w: 6, col: '#fffaf0', seed: 740 + D.i, t, spline: false, passes: 1, over: 0, bow: 0, alpha: .9 * a }); }
}

// One of the twelve, standing on its mark: front on, a chest and paws, its rosette pinned to it (or the empty place).
//   pin 0..1 the rosette's pop, wilt 0..1 how far it has drooped, face 0..1 how much it looks at you (else at the show),
//   sad: the dog's own face, hop: a jump in px, squash
export function dozenDog(g, t, D, cx, o = {}) {
  const { pin = 0, wilt = 0, face = 0, sad = 0, hop = 0, squash = 0, look = [0, 0], mouth = null, hushed = 0, pinned = true, wide = false } = o;
  const gr = cx.gr, bl = blink(t, 40 + D.i) > .5;
  const m = mouth == null ? clamp(cx.vox * 1.6 - .05 + (D.i % 3) * .05) : mouth;
  dogFront(g, {
    x: D.x, y: D.y - hop - gr.bob * .35 * (1 - hushed), s: D.s, t, seed: 50 + D.i, breed: D.breed, body: true, eyes: sad > .5 ? 'sad' : wide ? 'wide' : bl ? 'shut' : (D.i % 4 === 1 ? 'happy' : 'dot'),
    mouth: sad > .5 ? 0 : m, tongue: false, collar: ROSETTES[(D.i * 5 + 3) % 12], tilt: gr.lean * (D.i % 2 ? 1 : -1) * 1.4 + Math.sin(t * 2 + D.i) * .02 * (1 - hushed), squash: squash + gr.sq * .3,
    look: [lerp(look[0], 0, face), lerp(look[1], 0, face)], sweat: sad > .5 && wilt > .6,
  });
  const k = pinned ? pin : 0;
  if (k > .01) {
    const rx = D.x - 38 * D.s, ry = D.y + 74 * D.s - hop - gr.bob * .35 * (1 - hushed) + wilt * 12 * D.s;
    g.save(); g.translate(rx, ry); g.scale(k, k); g.translate(-rx, -ry);
    rosette(g, rx, ry, 52 * D.s, wilt > .3 ? '#a8a7b2' : ROSETTES[D.i], t, { seed: 900 + D.i, state: wilt > .2 ? 'wilt' : 'new', tilt: (wilt > 0 ? .35 * wilt : -.1 + D.i * .02) + gr.lean * 2 + (1 - k) * .8 });
    g.restore();
  }
}

// ---------------------------------------------------------------- a dog racing across (seen from the side)
// A small dog in profile facing right (`flip` -1 to face left), its feet on y: four legs that gallop, a tail, a flapping ear.
//   phase: the stride (cycles), rot: tumbling, dazed: stars orbit its head
export function runDog(g, t, x, y, s, o = {}) {
  const { seed = 1, coat = '#c98f56', shade = '#95622f', muzzle = '#f0d9b0', flip = 1, phase = 0, rot = 0, lift = 0, dazed = 0, eyes = 'open', collar = C.red, len = 1, mouth = .5, squash = 0 } = o;
  const ph = phase * TAU;
  g.save(); g.translate(x, y - lift); g.rotate(rot * flip); g.scale(s * flip * (1 + squash * .1), s * (1 - squash * .12));
  // legs (far pair first)
  const leg = (hx, p0, far) => {
    const a = Math.sin(ph + p0), b = Math.cos(ph + p0);
    line(g, [[hx, -50], [hx + a * 22, -28 - Math.max(0, b) * 6], [hx + a * 38, -8 - Math.max(0, b) * 22]], { w: 15, col: far ? shade : coat, seed: seed * 10 + Math.round(hx), t, spline: true, passes: 1, over: 0, bow: 0, taper: [.04, .3] });
  };
  leg(-46 * len, 1.4, true); leg(52 * len, 0, true); leg(-46 * len, 3.4, false); leg(52 * len, 2.1, false);
  const wag = Math.sin(ph * 2 + 1) * 10;
  line(g, [[-64 * len, -70], [-92 * len, -92 + wag * .4], [-100 * len, -126 + wag]], { w: 12, col: coat, seed: seed * 10 + 1, t, spline: true, passes: 1, over: 0, bow: 0, taper: [.02, .5] });
  blob(g, ellipse(0, -66, 68 * len, 34, 10, 0, seed * 10 + 2), { fill: coat, shade, line: GRAPHITE, lw: 5.4, seed: seed * 10 + 2, t, hw: 5, gap: 6, tone: .6, sh: .32 });
  const hx = 76 * len, hy = -92;
  blob(g, ellipse(hx + 36, hy + 12, 24, 17, 8, 0, seed * 10 + 3), { fill: muzzle, line: GRAPHITE, lw: 5, seed: seed * 10 + 3, t, hw: 4.6, gap: 6, tone: .7 });
  blob(g, ellipse(hx, hy, 34, 31, 10, 0, seed * 10 + 4), { fill: coat, shade, line: GRAPHITE, lw: 5.4, seed: seed * 10 + 4, t, hw: 5, gap: 6, tone: .6, sh: .28 });
  dot(g, hx + 58, hy + 6, 7.5, { col: GRAPHITE, seed: seed * 10 + 5, t });
  if (mouth > .3) blob(g, ellipse(hx + 40, hy + 26, 13, 7, 7, 0, seed * 10 + 6), { fill: C.pink, line: null, seed: seed * 10 + 6, t, gap: 4, hw: 3.6, tone: .9 });
  if (eyes === 'x') { line(g, [[hx + 8, hy - 14], [hx + 24, hy - 2]], { w: 5.5, col: GRAPHITE, seed: seed * 10 + 7, t, spline: false, passes: 1 }); line(g, [[hx + 24, hy - 14], [hx + 8, hy - 2]], { w: 5.5, col: GRAPHITE, seed: seed * 10 + 8, t, spline: false, passes: 1 }); }
  else dot(g, hx + 16, hy - 8, 6.4, { col: GRAPHITE, seed: seed * 10 + 7, t });
  const fl = Math.sin(ph + .8) * .35 + .25;
  g.save(); g.translate(hx - 14, hy - 14); g.rotate(-.5 + fl);
  blob(g, ellipse(-4, 24, 15, 27, 8, 0, seed * 10 + 9), { fill: shade, line: GRAPHITE, lw: 5, seed: seed * 10 + 9, t, hw: 4.6, gap: 6, tone: .7 });
  g.restore();
  line(g, [[hx - 24, hy + 30], [hx - 2, hy + 38], [hx + 22, hy + 30]], { w: 9, col: collar, seed: seed * 10 + 11, t, spline: true, passes: 1, over: 0, bow: 0 });
  if (dazed > 0) for (let i = 0; i < 3; i++) { const a = t * 7 + i * TAU / 3; blob(g, star5(hx + Math.cos(a) * 46, hy - 66 + Math.sin(a) * 13, 11), { fill: C.yellow, line: GRAPHITE, lw: 3.4, seed: seed * 10 + 20 + i, t, gap: 4, hw: 3.6, tone: .7 }); }
  g.restore();
}
function star5(cx, cy, r) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * TAU, rr = i % 2 ? r * .45 : r; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; }
// Twelve coats for the twelve runners (the breeds' own colours).
export const COATS = {
  chihuahua: ['#e9c9a0', '#b8946a', '#f6e6cc'], poodle: ['#f1e4c8', '#c9b58a', '#f1e4c8'], corgi: ['#e6913a', '#b56a1c', '#fbf0dc'], pug: ['#e3c08a', '#a98550', '#8d7a5a'],
  lab: ['#e2b04a', '#b07f22', '#f6dfa4'], beagle: ['#b8783a', '#7f4c1e', '#f4e6cc'], greyhound: ['#a7a2b0', '#726d7c', '#c4c0cb'], mutt: ['#c98f56', '#95622f', '#efd6ae'],
  husky: ['#9a9aa8', '#63636f', '#fbf8ef'], sheepdog: ['#c9c7cf', '#8f8d99', '#eceaf1'], dalmatian: ['#fbf8ef', '#cfcabd', '#fbf8ef'], bulldog: ['#d6a165', '#a26f3a', '#f3e2c4'],
};

// ---------------------------------------------------------------- the sing-along board, shared by the lead-in and the chorus
let CL = null;
export function chorus3Lines() {
  if (!CL) { const lines = CHORUS_STARTS.map(s => words('Chorus 3', s)); CL = { lines, path: ballPath(lines) }; }
  return CL;
}
export function lineIdx(t) { const { lines } = chorus3Lines(); return Math.max(0, lines.findIndex((ws, i) => t < (lines[i + 1] ? lines[i + 1][0].v - .45 : 1e9))); }
const LEDGE = BOARD.y + BOARD.h + 66;
const REST = [BOARD.x + BOARD.w - 150, LEDGE - 26];                 // where the ball rests on the board in the hush
const T_HELD_END = 208.25;
// Where the ball is at t (null before it appears): the lead-in's drop, the core's path, the rest in the hush, the hop on the held "know!".
export function ballPos(t) {
  const { path } = chorus3Lines();
  const p0 = path[0];
  if (t < 180.686) return null;
  if (t < p0.t) {                                                    // appears at the last drum hit but one, and drops on the first word
    const u = clamp((t - 180.686) / (p0.t - 180.686)), sx = BOARD.x + 90, sy = BOARD.y - 60;
    return { x: lerp(sx, p0.x, u), y: lerp(sy, p0.y, u) - Math.sin(u * Math.PI) * 120 + (1 - u) * 0, sq: u > .92 ? 0 : 0, stretch: u > .93 ? (u - .93) / .07 * .12 : 0 };
  }
  const iL5 = path.findIndex(p => p.t > 199), a = path[iL5 - 1], b = path[iL5], last = path[path.length - 1];
  if (t > a.t && t < b.t) {                                          // the hush: it settles on the board and rests
    const tr = a.t + .55, th = b.t - .43;
    if (t < tr) { const u = (t - a.t) / .55; return { x: lerp(a.x, REST[0], u), y: lerp(a.y, REST[1], u) - Math.sin(u * Math.PI) * 60, sq: u > .9 ? .06 : 0, stretch: 0 }; }
    if (t < th) return { x: REST[0], y: REST[1] + 2 + Math.sin(t * 1.4) * .8, sq: .03 + .01 * Math.sin(t * 1.4), stretch: 0 };
    const u = (t - th) / (b.t - th);
    return { x: lerp(REST[0], b.x, u), y: lerp(REST[1], b.y, u) - Math.sin(u * Math.PI) * 130, sq: 0, stretch: u > .93 ? (u - .93) / .07 * .12 : 0 };
  }
  if (t >= last.t) {                                                 // the held "know!": it waits on the word and hops on every beat
    const ph = beatPos(t) % 1;
    return { x: last.x, y: last.y - Math.sin(Math.PI * ph) * 34 * (t < T_HELD_END ? 1 : 0), sq: Math.exp(-ph / .09) * .3, stretch: 0 };
  }
  return ballAt(path, t);
}
// The whole layer: the board (dropping in if `drop` < 1), the line's words, the ball and Bruce on his ledge. `gr` is the groove.
export function boardLayer(g, t, gr, drop = 1) {
  const { lines, path } = chorus3Lines();
  const idx = lineIdx(t), ws = lines[idx], lastW = ws[ws.length - 1];
  const held = idx === 5 ? ws.map((w, i) => i === ws.length - 1 ? { ...w, e: T_HELD_END } : w) : ws;
  g.save(); g.translate(0, -(1 - drop) * 760);
  signBoard(g, t, {});
  sing(g, t, held, { ...WORDS, y: wordsY(ws), tailCol: null, col: GRAPHITE, seed: 30 + idx, w: .1, dance: 8, out: idx === 5 ? { t0: 208.0, dur: .25 } : { t0: lastW.e + .22, dur: .24 } });
  line(g, [[BOARD.x + 20, LEDGE + 6], [BOARD.x + BOARD.w - 20, LEDGE + 6]], { w: 8, col: '#8b5f2a', seed: 860, t, spline: false, passes: 1 });
  const bb = ballPos(t);
  if (bb) drawBall(g, t, bb.x, bb.y, 32, { sq: bb.sq || 0, stretch: bb.stretch || 0, spin: t * 4 });
  const lag = ballPos(t - .3), lag2 = ballPos(t - .55);
  const off = bb && Math.abs(bb.x - REST[0]) < 2 && bb.y > REST[1] - 6 ? 230 : 0;                // resting: Bruce sits beside the ball, not on it
  const bx = (lag ? clamp(lag.x, BOARD.x + 120, BOARD.x + BOARD.w - 120) : BOARD.x + 200) - off;
  const bx2 = (lag2 ? clamp(lag2.x, BOARD.x + 120, BOARD.x + BOARD.w - 120) : bx) - off;
  const moving = Math.abs(bx - bx2) > 3 ? 1 : 0;
  const howl = t > 204.7 && t < T_HELD_END;
  dachshund(g, { x: bx, y: LEDGE, s: .46, flip: bx >= bx2 ? 1 : -1, t, seed: 2, walk: moving ? (t * 3.2) % 1 : 0, tail: beatPos(t), ear: gr.lean * 30, eyes: howl ? 'happy' : 'happy', mouth: howl ? .9 : .5, tongue: true, bob: gr.bp * 8 });
  g.restore();
}

// ---------------------------------------------------------------- fireworks, ribbons, light
// A firework: strokes fly out from the centre and slow, a tail behind each, and fall as they fade. One stroke each.
export function firework(g, t, t0, x, y, r, cols, o = {}) {
  const { n = 22, dur = 1.25, seed = 1, rot = 0 } = o;
  const p = (t - t0) / dur;
  if (p <= 0 || p >= 1) return;
  const e = easeOut(p, 2.6), fade = 1 - Math.pow(clamp((p - .55) / .45), 1.6);
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU + (hash(seed, i) - .5) * .18, rr = r * (.78 + .3 * hash(seed, i, 2)), r1 = rr * e, r0 = Math.max(0, r1 - rr * (.42 - .25 * p)), fall = p * p * 70 * (.6 + hash(seed, i, 3) * .8);
    line(g, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0 + fall * .8], [x + Math.cos(a) * r1, y + Math.sin(a) * r1 + fall]], { w: 17 * (1 - p * .5), col: cols[i % cols.length], seed: seed * 100 + i, t, spline: false, passes: 1, over: 0, bow: 0, taper: [.05, .55], alpha: .97 * fade });
  }
}
const STREAM_COLS = [C.red, C.orange, C.yellow, C.lime, C.green, C.teal, C.sky, C.blue, C.purple, C.pink];
// A streamer falling from above: a long wavy ribbon whose head has fallen `head` px, drifting and curling.
export function streamer(g, t, i, t0, o = {}) {
  const { speed = 470, len = 520, seed = 7, y0 = 560 } = o;
  const d = t - t0 - hash(seed, i) * .5;
  if (d <= 0) return;
  const u0 = hash(seed, i, 2), side = o.clear ? (u0 < .5 ? 40 + u0 * 2 * 290 : 750 + (u0 - .5) * 2 * 290) : 40 + u0 * (W - 80);   // while the close-up is on his face they fall to either side of it
  const x0 = side, head = y0 + d * (speed * (.8 + hash(seed, i, 3) * .5)), ph = hash(seed, i, 4) * TAU, amp = 26 + hash(seed, i, 5) * 34;
  if (head - len > H + 60) return;
  const pts = [];
  for (let k = 0; k <= 9; k++) { const u = k / 9, y = head - u * len; pts.push([x0 + Math.sin(u * 5.2 + ph + d * 1.8) * amp * (.4 + u) + d * 14 * (hash(seed, i, 6) - .5), y]); }
  line(g, pts, { w: 17, col: STREAM_COLS[Math.floor(hash(seed, i, 8) * STREAM_COLS.length)], seed: seed * 50 + i, t, spline: true, passes: 1, over: 0, bow: 0, taper: [.05, .5], alpha: .96 });
}
// A warm pool of light on you at the foot of the picture, and its beam from the top: the hush's spotlight.
export function hushLight(g, t, k, spotBeam) {
  if (k <= .01) return;
  // the lights go down everywhere but under the spot
  // (a soft dimming of the light towards the edges, as the shared softGlow and spotBeam are soft light: the middle, under the spot, stays lit)
  g.save();
  const gr = g.createRadialGradient(540, 1500, 150, 540, 1500, 1500);
  gr.addColorStop(0, 'rgba(70,40,70,0)'); gr.addColorStop(.5, `rgba(70,40,70,${.22 * k})`); gr.addColorStop(1, `rgba(60,30,66,${.42 * k})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.restore();
  // the pool of light comes down from the ring to the foot of the picture, on you
  const dn = smooth(inv(198.45, 199.45, t)), py = lerp(1290, 1520, dn), prx = lerp(250, 380, dn);
  const pulse = 1 + .04 * hit('other', t, .3);
  spotBeam(g, t, { apex: [540, 600], x: 540, y: py, rx: prx * pulse, ry: lerp(70, 100, dn), k: Math.min(1, .95 * k * (1 + .1 * hit('other', t, .3))), col: '#ffe98a', poolCol: '#fff3c4', seed: 47 });
  // motes drifting in the beam: still, but not dead
  for (let i = 0; i < 14; i++) {
    const u = (t * .05 * (.6 + hash(3, i)) + hash(3, i, 1)) % 1, y = lerp(640, py, u), half = lerp(46, prx, u), x = 540 + (hash(3, i, 2) * 2 - 1) * half * .85 + Math.sin(t * .8 + i) * 12;
    dot(g, x, y, 3.4 + hash(3, i, 3) * 2.4, { col: '#fffbe0', seed: 1700 + i, t, alpha: .75 * k * Math.sin(u * Math.PI) });
  }
}

// ---------------------------------------------------------------- Clawd for the finale
// Clawd in his judge's bowler, arms up, holding what he holds. `hold` is { blue, purple, teal } 0..1: how far each
// rosette has arrived in his hands (the third sits on the bowler's band).
export function finaleClawd(g, t, o = {}) {
  const { x = 215, y = 1500, s = 1, eyes = 'open', mouth = 0, brow = 0, look = [0, 0], armL = { up: .2 }, armR = { up: .2 }, bob = 0, squash = 0, lean = 0, cheeks = false, hold = null, sweat = false, raise = 0, legs = 0, tip = 0, hat = true, prop2 = null } = o;
  clawd(g, {
    x, y, s, t, seed: 1, eyes, mouth, brow, look, armL, armR, bob, squash, lean, cheeks, sweat, raise, legs,
    prop: (g2, po) => {
      if (hat) { g2.save(); g2.translate(0, -246); g2.rotate(tip * -.1); g2.translate(0, 246); bowler(g2, t, po); g2.restore(); }
      if (hold) {
        const put = (k, hx, hy, col, sd, tilt, r = 40) => {
          if (k <= .01) return;
          g2.save(); g2.translate(hx, hy); g2.scale(k, k); rosette(g2, 0, 0, r, col, t, { seed: sd, tilt: tilt + Math.sin(t * 3 + sd) * .05 }); g2.restore();
          const tw = beatPulse(t + (sd % 3) * .11, .2) * k;
          if (tw > .12) sparkle(g2, hx + r * 1.15, hy - r * .9, 18 * tw, t, { seed: sd + 20, rot: t * 2 + sd, col: '#fff3b0' });
        };
        put(hold.blue, po.hL[0] - 4, po.hL[1] - 34, C.blue, 950, -.2);
        put(hold.teal, po.hR[0] + 4, po.hR[1] - 34, C.teal, 951, .2);
        put(hold.purple, 0, -318, C.purple, 952, .04, 36);
      }
      if (prop2) prop2(g2, po);
    },
  });
}
