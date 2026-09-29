// Look development for "Pencil Polka": the page, the pen, the two main characters and the lettering,
// on one frame, so the style can be judged before any shot is built.
//
//   node video/lib/render.mjs --scene video/ep03/polka/look.js --song music/ep03 --stills 5,5.1 --w 1080
//   ...&query v=sheet   a character sheet
import { W, H, loadRecord, beatPulse, downPulse, sway, loud, hit, beatPos, clamp, easeOut, lerp, TAU } from './kit.js';
import { paper } from './paper.js';
import { scrub, blob, line, hatch, dot } from './pencil.js';
import { write, measure } from './hand.js';
import { clawd, dachshund, shaggy } from './chars.js';
import { person, dogFront, BREED_NAMES } from './people.js';
import { GRAPHITE, C, PAPER } from './palette.js';
import { park, pigeon, butterfly, sun, cloud, tree, flower, bunting } from './world.js';
import { groove } from './common.js';
import { ringBackdrop, judgeTable, spotlight } from './ring.js';
import { rrect, ellipse, star, scallop, capsule } from './shapes.js';

export const font = 'sans-serif';
export async function init(S) { await loadRecord(S, '/music/ep03/audio.json'); }
const V = () => new URLSearchParams(location.search).get('v') || 'hero';

function ground(g, t, y0, y1, col = C.green) {
  scrub(g, [0, y0, W, y1], { col, seed: 5, t, gap: 20, w: 24, alpha: .5, angle: -.12, wig: 26 });
  scrub(g, [0, y0 + 30, W, y1], { col: C.lime, seed: 9, t, gap: 34, w: 20, alpha: .35, angle: .18, wig: 22 });
  line(g, [[0, y0 + 6], [260, y0 - 6], [560, y0 + 8], [860, y0 - 4], [W, y0 + 4]], { w: 5, col: GRAPHITE, seed: 3, t, wob: 3, passes: 2, alpha: .7 });
}

function rosette(g, x, y, r, col, t, seed = 1, prog = 1, label = '') {
  // Frilled disc, an inner disc, two tails.
  const tails = (side) => [[x + side * r * .25, y + r * .5], [x + side * r * .7, y + r * 1.9], [x + side * r * .5, y + r * 1.7], [x + side * r * .3, y + r * 2.1], [x + side * r * .05, y + r * .7]];
  blob(g, tails(-1), { fill: col, line: GRAPHITE, lw: 4, seed: seed + 1, t, gap: 6, hw: 4.6 });
  blob(g, tails(1), { fill: col, line: GRAPHITE, lw: 4, seed: seed + 2, t, gap: 6, hw: 4.6 });
  blob(g, scallop(x, y, r, 14, .1), { fill: col, shade: GRAPHITE, line: GRAPHITE, lw: 4.6, seed: seed + 3, t, gap: 6.5, hw: 5, sh: .3 });
  blob(g, ellipse(x, y, r * .62, r * .62, 12), { fill: C.cream, line: GRAPHITE, lw: 4, seed: seed + 4, t, gap: 6, hw: 4.6, tone: .6 });
  if (label) write(g, label, x, y + r * .26, r * .5, { col: GRAPHITE, seed: seed + 5, t, align: 'center', prog });
}

export function draw(g, t, S) {
  const v = V();
  paper(g);
  const bp = beatPulse(t, .18), dp = downPulse(t, .22), sw = sway(t);
  const vox = loud('vocals', t);
  if (v === 'sheet') return sheet(g, t, S);
  if (v === 'big') return big(g, t, S);
  if (v === 'park') return parkView(g, t, S);
  if (v === 'blob') return blobView(g, t, S);
  if (v === 'ring') return ringView(g, t, S);
  if (v === 'shapes') return shapes(g, t, S);
  if (v === 'type') return typeSheet(g, t, S);
  if (v === 'dogs') return dogSheet(g, t, S);
  if (v === 'people') return peopleSheet(g, t, S);
  // Title, written on.
  const wr = clamp((t - 0.2) / 1.2);
  write(g, 'SOFTWARE QUALITY THEORY 101', W / 2, 250, 38, { col: C.blue, seed: 3, t, align: 'center', prog: clamp((t - .1) / .9), track: 6 });
  write(g, 'THE', W / 2, 372, 96, { col: GRAPHITE, seed: 4, t, align: 'center', prog: clamp((t - .3) / .6) });
  write(g, 'ILITIES', W / 2, 610, 176, { seed: 5, t, align: 'center', prog: clamp((t - .7) / 1.4), bubble: { fill: C.orange, edge: GRAPHITE }, dance: 10, beat: beatPos(t), pulse: bp });
  // A sung line, lettered as handwriting.
  const line1 = 'GOOD IN A DOZEN WAYS,';
  const fit = (str, max, size) => Math.min(size, size * max / measure(str, size));
  const L2 = 'AND BAD IN OTHERS, THOUGH:';
  write(g, line1, W / 2, 800, fit(line1, 940, 90), { col: C.blue, seed: 6, t, align: 'center', prog: clamp((t - 2.2) / .9), dance: 6, beat: beatPos(t), pulse: bp });
  write(g, L2, W / 2, 900, fit(L2, 940, 66), { col: C.red, seed: 7, t, align: 'center', prog: clamp((t - 3) / 1), dance: 5, beat: beatPos(t), pulse: bp });
  ground(g, t, 1220, 1500);
  // Characters, dancing to the oompah: squash on the oom, a lean left and right.
  clawd(g, { x: 300, y: 1290, s: .95, t, seed: 1, eyes: 'happy', mouth: clamp(vox * 1.6 - .1), bob: bp * 10, squash: dp * .35, lean: sw * .035, armR: { up: .7 + bp * .3 }, armL: { up: .2 } });
  dachshund(g, { x: 760, y: 1360, s: .68, t, seed: 2, walk: (beatPos(t) * .5) % 1, tail: beatPos(t) * .5, ear: sw, mouth: .1, eyes: 'happy', bob: bp * 6 });
  rosette(g, 200, 1000, 62, C.red, t, 40, 1, '');
  rosette(g, 880, 1010, 54, C.teal, t, 50, 1, '');
  const p = beatPos(t);
  // A star spinning, to check a filled shape moves.
  blob(g, star(540, 1110, 46 + bp * 6, 22, 5, t * .6), { fill: C.yellow, line: GRAPHITE, lw: 4.6, seed: 12, t, gap: 6, hw: 5 });
}

function sheet(g, t, S) {
  paper(g);
  write(g, 'CLAWD', 260, 140, 60, { col: GRAPHITE, seed: 4, t, align: 'center' });
  ['open', 'happy', 'wide', 'squint', 'sad', 'x'].forEach((e, i) => {
    const cx = 200 + (i % 3) * 320, cy = 420 + Math.floor(i / 3) * 360;
    clawd(g, { x: cx, y: cy, s: .55, t, seed: i + 1, eyes: e, mouth: e === 'open' ? .7 : e === 'wide' ? .3 : 0, cheeks: e === 'happy', brow: e === 'sad' ? 1 : 0 });
    write(g, e.toUpperCase(), cx, cy + 44, 28, { col: C.blue, seed: i + 9, t, align: 'center' });
  });
  write(g, 'BRUCE', 260, 1160, 60, { col: GRAPHITE, seed: 5, t, align: 'center' });
  dachshund(g, { x: 340, y: 1400, s: .6, t, seed: 2, walk: 0, eyes: 'open', mouth: 0 });
  dachshund(g, { x: 780, y: 1400, s: .6, t, seed: 3, walk: (t * 1.4) % 1, tail: t, eyes: 'happy', mouth: .6, tongue: true });
}

export function drawMarks() {}

function typeSheet(g, t, S) {
  paper(g);
  const V = [
    { fill: C.orange, edge: '#7a3510', w: .095, e: 2.05, f: 1.3 },
    { fill: '#f5a03a', edge: '#8a4a1d', w: .075, e: 2.0, f: 1.35 },
    { fill: '#f5a03a', edge: GRAPHITE, w: .07, e: 1.75, f: 1.2 },
    { fill: C.yellow, edge: '#b5541a', w: .08, e: 1.9, f: 1.4 },
    { fill: C.sky, edge: '#1f3f8f', w: .085, e: 1.9, f: 1.3 },
    { fill: C.pink, edge: '#a1214f', w: .08, e: 1.9, f: 1.3 },
  ];
  V.forEach((v, i) => {
    write(g, 'ILITIES', W / 2, 260 + i * 250, 170, { seed: 6, t, align: 'center', bubble: { fill: v.fill, edge: v.edge, e: v.e, f: v.f }, w: v.w, track: 6 });
  });
}

function dogSheet(g, t, S) {
  paper(g);
  BREED_NAMES.forEach((b, i) => {
    const cx = 190 + (i % 3) * 350, cy = 330 + Math.floor(i / 3) * 380;
    dogFront(g, { x: cx, y: cy, s: .95, t, seed: i + 1, breed: b, eyes: i % 4 === 1 ? 'happy' : 'dot', mouth: i % 3 === 0 ? .6 : 0, body: i % 2 === 0, tongue: i % 3 === 0, collar: [C.red, C.blue, C.green, C.purple][i % 4] });
    write(g, b.toUpperCase(), cx, cy + 74, 30, { col: C.blue, seed: i + 9, t, align: 'center', track: 4 });
  });
}
function peopleSheet(g, t, S) {
  paper(g);
  const specs = [
    { hair: { style: 'bun', col: '#5d3b26' }, top: C.purple, bottom: '#5a4a8a', skin: '#c99266' },
    { hair: { style: 'curls', col: '#2b2a33' }, top: C.teal, bottom: '#385a8a', skin: '#8d5a3a', glasses: true },
    { hair: { style: 'spikes', col: '#d9a12b' }, top: C.red, bottom: '#3f6fd6', skin: '#efc7a0' },
    { hair: { style: 'bob', col: '#a0522d' }, top: C.yellow, bottom: '#5b5a66', skin: '#f0cfae', dress: true },
    { hair: { style: 'long', col: '#2b2a33' }, top: C.pink, bottom: '#385a8a', skin: '#b9835a', dress: true },
    { hair: { style: 'cap', col: '#3f6fd6' }, top: C.green, bottom: '#8b5f2a', skin: '#efc7a0' },
  ];
  specs.forEach((sp, i) => person(g, { x: 190 + (i % 3) * 350, y: 640 + Math.floor(i / 3) * 620, s: 1.1, t, seed: i + 2, ...sp, eyes: i === 2 ? 'happy' : 'dot', mouth: i === 1 ? 'open' : 'smile', armL: { up: i % 2 ? .4 : -.9, out: .3 }, armR: { up: -.6 + i * .15, out: .3 } }));
}

// Clawd and Bruce at the size they'll be in the film.
function big(g, t, S) {
  paper(g);
  clawd(g, { x: 400, y: 620, s: 1.3, t, seed: 5, eyes: 'open', mouth: .55, cheeks: false });
  clawd(g, { x: 400, y: 1180, s: 1.2, t, seed: 3, eyes: 'happy', mouth: 0, cheeks: true, armR: { up: .8 }, armL: { up: .3 } });
  dachshund(g, { x: 470, y: 1640, s: 1.05, t, seed: 2, walk: 0, eyes: 'open', mouth: .5, tongue: true });
  write(g, 'CLAWD', 860, 300, 46, { col: GRAPHITE, seed: 4, t, align: 'center' });
}
// The plain shapes, drawn by hand: boxes, circles, a star, a capsule.
function shapes(g, t, S) {
  paper(g);
  blob(g, rrect(300, 300, 380, 240, 24, 3, 5), { fill: C.orange, line: GRAPHITE, lw: 7, seed: 5, t });
  blob(g, rrect(780, 300, 300, 240, 8, 3, 6), { fill: C.sky, line: GRAPHITE, lw: 7, seed: 6, t });
  blob(g, ellipse(300, 720, 170, 170, 12, 0, 7), { fill: C.yellow, line: GRAPHITE, lw: 7, seed: 7, t });
  blob(g, ellipse(780, 720, 230, 120, 12, 0, 8), { fill: C.green, line: GRAPHITE, lw: 7, seed: 8, t });
  blob(g, star(300, 1100, 140, 60, 5, -Math.PI / 2, 9), { fill: C.red, line: GRAPHITE, lw: 7, seed: 9, t });
  blob(g, capsule([700, 1000], [860, 1200], 46, 40, 5, 10), { fill: C.purple, line: GRAPHITE, lw: 7, seed: 10, t });
  blob(g, rrect(540, 1560, 900, 260, 40, 3, 11), { fill: C.teal, shade: '#1f7f78', line: GRAPHITE, lw: 7, seed: 11, t });
}

// The park backdrop with the cast in it.
function parkView(g, t, S) {
  park(g, t, {});
  const gr = groove(t, 1);
  clawd(g, { x: 330, y: 1560, s: 1.3, t, seed: 1, eyes: 'happy', mouth: .3, bob: gr.bob, squash: gr.sq, lean: gr.lean, armR: { up: .7 }, armL: { up: .2 } });
  dachshund(g, { x: 800, y: 1660, s: .8, flip: -1, t, seed: 2, walk: (beatPos(t) * .5) % 1, eyes: 'happy', mouth: .4, tongue: true, bob: gr.bob * .5 });
  pigeon(g, t, 920, 1290, .9, { flip: -1 });
  butterfly(g, t, 560 + Math.sin(t * 1.3) * 60, 1100 + Math.sin(t * 2.1) * 30, 1, C.pink);
  butterfly(g, t, 220 + Math.sin(t * 1.1) * 40, 1000 + Math.sin(t * 1.7) * 30, .8, C.orange, { seed: 9 });
}

// Blob, the code: huge, and as a puppy.
function blobView(g, t, S) {
  paper(g);
  shaggy(g, { x: 540, y: 1180, s: 1.55, t, seed: 8, state: 'awake', mouth: 0 });
  shaggy(g, { x: 260, y: 1760, s: 1.3, t, seed: 9, puppy: true, state: 'awake', mouth: .5, tongue: true });
  shaggy(g, { x: 800, y: 1760, s: 1.3, t, seed: 10, puppy: true, state: 'sleep' });
  clawd(g, { x: 950, y: 640, s: .5, t, seed: 3 });
}

// The show ring in its three moods (?mood=day|night|gold).
function ringView(g, t, S) {
  const mood = new URLSearchParams(location.search).get('mood') || 'day';
  ringBackdrop(g, t, { mood });
  const gr = groove(t, 1);
  judgeTable(g, t, 540, 1160, 600, { night: mood === 'night' });
  clawd(g, { x: 250, y: 1450, s: 1.0, t, seed: 1, eyes: 'open', mouth: .3, bob: gr.bob, squash: gr.sq, lean: gr.lean });
  dachshund(g, { x: 820, y: 1440, s: .6, flip: -1, t, seed: 2, walk: (beatPos(t) * .5) % 1, eyes: 'happy', mouth: .4, bob: gr.bob * .5 });
  if (mood === 'night') spotlight(g, t, 540, 1300, 320);
}
