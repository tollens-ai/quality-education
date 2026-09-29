// Props for verse 2, "the agent in the code": Blob's den (a wooden shed with a pegboard, a lamp, a small
// window and a huge dog bed), the agent's hard hat and headlamp, and everything the gags need.
// Everything is drawn with the pen and takes the drawing's time `t`; positions are master pixels.
import { W, H, TAU, clamp, lerp, hash, noise, inv, easeOut, backOut, smooth, sway, beatPos, mix } from './kit.js';
import { paper } from './paper.js';
import { blob, line, dot, hatch, wash, scrub, spline, resample } from './pencil.js';
import { write } from './hand.js';
import { rrect, ellipse, capsule, scallop, star, roundPoly } from './shapes.js';
import { sun as sunFace } from './world.js';
import { idle, beatRing, downRing } from './life.js';
import { GRAPHITE, C } from './palette.js';

const ink = GRAPHITE;

// ---------------------------------------------------------------- the den's colours
export const DEN = {
  paper: '#e4eee9',          // cool page under the room
  wall: '#5fb0a6', wallD: '#3f8f92', seam: '#3a7d78', sky2: '#6aa9d8',
  wood: '#c9a56b', woodD: '#8a6a3a', peg: '#dcc394', pegD: '#b3925a',
  floor: '#c8a878', floorD: '#8d7050',
  lamp: '#f7c93b', glow: '#ffe08a',
  bed: '#8a90d6', bedD: '#575ca6',
  hat: '#f7c93b', hatD: '#d99a1e',
};
export const FLOOR = 1290;

// ---------------------------------------------------------------- the room
// `cam` slides the wall's planks and the floor's joints sideways (a camera pan); everything else is
// placed by the shot. Options: board {x, y, taken[]} the pegboard; win {x, y, w, h, sky, sun}; lamp {x, y} or null.
export function den(g, t, o = {}) {
  const { cam = 0, floorY = FLOOR, board = null, win = null, lamp = { x: 545, y: 790 }, seed = 900, glow = 1 } = o;
  paper(g, { base: DEN.paper, vignette: .14 });
  // The wall: planks, each its own crayon of teal or blue-grey in upright strokes, paler where the lyric sits
  // and deeper below the rail. The seams are drawn over.
  const pw = 152, off = ((cam % pw) + pw) % pw;
  const PLANK = ['#5fb0a6', '#6cb9b3', '#78b3c8', '#63aea0', '#6fb5bd'];
  for (let i = -1; i < 8; i++) {
    const x0 = 70 + i * pw - off, k = Math.round((cam - off) / pw) + i, kk = ((k % 40) + 40) % 40;
    const col = PLANK[((k % 5) + 5) % 5];
    scrub(g, [x0, -90, x0 + pw, floorY + 26], { col, seed: seed + 100 + kk, t, gap: 20, w: 34, alpha: .17, angle: 1.52, wig: 8 });
    scrub(g, [x0, 600, x0 + pw, floorY + 26], { col, seed: seed + 150 + kk, t, gap: 22, w: 34, alpha: .11, angle: 1.52, wig: 8 });
    scrub(g, [x0, 880, x0 + pw, floorY + 26], { col, seed: seed + 250 + kk, t, gap: 22, w: 34, alpha: .14, angle: 1.52, wig: 8 });
    line(g, [[x0 + hash(k, 3) * 6, 30], [x0 + hash(k, 4) * 8, floorY - 6]], { w: 4.6, col: DEN.seam, seed: seed + 10 + kk, t, spline: false, passes: 1, alpha: .5, bow: 3 });
    // A little grain: two soft strokes down the plank.
    for (let j = 0; j < 2; j++) {
      const gx = x0 + 22 + hash(k, 5 + j) * (pw - 44), gy = 820 + hash(k, 7 + j) * 160;
      line(g, [[gx, gy], [gx + 4, gy + 40], [gx - 3, gy + 90]], { w: 3.6, col: DEN.seam, seed: seed + 200 + kk * 2 + j, t, spline: true, passes: 1, alpha: .22, taper: [.2, .4], bow: 0, over: 0 });
    }
  }
  scrub(g, [0, 1078, W, floorY + 30], { col: DEN.wallD, seed: seed + 2, t, gap: 26, w: 34, alpha: .3, angle: 1.5, wig: 14 });
  // The rail along the wall's foot, and the baseboard.
  line(g, [[-20, 1074], [W + 20, 1078]], { w: 15, col: DEN.woodD, seed: seed + 60, t, spline: false, passes: 1, alpha: .85, bow: 4 });
  line(g, [[-20, 1064], [W + 20, 1068]], { w: 4.5, col: ink, seed: seed + 61, t, spline: false, passes: 1, alpha: .6, bow: 3 });
  if (win) windowFrame(g, t, win.x, win.y, win.w, win.h, win);
  if (board) pegboard(g, t, board.x, board.y, board.w || 420, board.h || 440, board);
  // The floor: warm grey boards running along the wall, their joints staggered.
  scrub(g, [0, floorY, W, H], { col: DEN.floor, seed: seed + 3, t, gap: 18, w: 34, alpha: .7, angle: -.04, wig: 18 });
  scrub(g, [0, floorY + 60, W, H], { col: DEN.floorD, seed: seed + 4, t, gap: 40, w: 30, alpha: .22, angle: .05, wig: 16 });
  const rows = [1290, 1362, 1452, 1564, 1700, 1860];
  rows.forEach((y, r) => {
    line(g, [[-20, y + (r % 2) * 3], [W + 20, y - (r % 2) * 3]], { w: r ? 5 : 15, col: r ? DEN.floorD : DEN.woodD, seed: seed + 70 + r, t, spline: false, passes: 1, alpha: r ? .5 : .9, bow: 3 });
    if (r && r < rows.length) {
      const y1 = rows[r + 1] ?? H + 20, bw = 300 + r * 30;
      const o2 = ((cam + r * 130) % bw + bw) % bw;
      for (let x = -o2 + (r % 2) * 90; x < W + 100; x += bw) line(g, [[x, y], [x + (x - 540) * .02, Math.min(y1, H + 10)]], { w: 4.4, col: DEN.floorD, seed: seed + 80 + r * 9 + Math.round(x / bw), t, spline: false, passes: 1, alpha: .42, bow: 0 });
    }
  });
  line(g, [[-20, floorY - 4], [W + 20, floorY]], { w: 4.4, col: ink, seed: seed + 62, t, spline: false, passes: 1, alpha: .6, bow: 3 });
  if (lamp) {
    // Its light: a warm pool on the wall and the floor, drawn under everything else.
    const sx = lamp.x;
    const cone = [[sx - 60, lamp.y + 40], [sx + 60, lamp.y + 40], [sx + 470, floorY + 30], [sx - 470, floorY + 30]];
    wash(g, cone, DEN.glow, .2 * glow, seed + 90, t);
    hatch(g, cone, { col: '#ffd86a', seed: seed + 91, t, gap: 16, w: 12, alpha: .14 * glow, angle: 1.1, dens: .8 });
    hatch(g, ellipse(sx + 40, 1520, 470, 120, 14), { col: '#ffd86a', seed: seed + 92, t, gap: 12, w: 12, alpha: .24 * glow, angle: -.1, dens: .85 });
    hangLamp(g, t, lamp.x, lamp.y, { seed: seed + 95 });
  }
}

// A warm hanging lamp on a cord that sways a little.
export function hangLamp(g, t, x, y, o = {}) {
  const { seed = 995 } = o;
  const sw = sway(t) * 2.5 + Math.sin(t * 1.3 + 1) * 2;
  const sx = x + sw;
  line(g, [[x, -30], [x + sw * .2, y * .5], [sx, y - 42]], { w: 4.6, col: ink, seed, t, spline: true, passes: 1, alpha: .6 });
  blob(g, rrect(sx, y - 40, 26, 16, 5, 2, seed + 1), { fill: '#a8a7b2', line: ink, lw: 4.6, seed: seed + 1, t, hw: 4.4, tone: .8 });
  blob(g, [[sx - 66, y + 36], [sx - 58, y - 4], [sx - 26, y - 34], [sx + 26, y - 34], [sx + 58, y - 4], [sx + 66, y + 36]], { fill: DEN.lamp, shade: '#d99a1e', line: ink, lw: 6, seed: seed + 2, t, hw: 5, tone: .7, sh: .3 });
  blob(g, ellipse(sx, y + 40, 40, 17, 10, 0, seed + 3), { fill: '#fff3b0', line: ink, lw: 4.8, seed: seed + 3, t, hw: 4.6, tone: .8 });
}

// ---------------------------------------------------------------- the window
// A small window in the wall: night (sky 0) to day (sky 1); `sun` 0..1 raises a sun with a face into it.
export function windowFrame(g, t, x, y, w, h, o = {}) {
  const { sky = 0, sun = 0, seed = 970, sunR = 70, mood = 'happy' } = o;
  const cx = x + w / 2, cy = y + h / 2;
  const col = mix('#25346e', '#a7dcf6', clamp(sky));
  blob(g, rrect(cx, cy, w, h, 12, 3, seed), { fill: col, line: null, seed, t, hw: 5, tone: .95, gap: 5 });
  g.save();
  g.beginPath(); g.rect(x + 6, y + 6, w - 12, h - 12); g.clip();
  if (sky < .55) {
    // The moon and a few stars.
    const k = 1 - sky * 1.6;
    g.globalAlpha *= clamp(k);
    blob(g, ellipse(x + w * .3, y + h * .3, 26, 26, 10, 0, seed + 3), { fill: '#f7e6a6', line: null, seed: seed + 3, t, hw: 4.4, tone: .9, gap: 5 });
    blob(g, ellipse(x + w * .3 + 12, y + h * .3 - 6, 22, 22, 10, 0, seed + 4), { fill: col, line: null, seed: seed + 4, t, hw: 4.4, tone: .95, gap: 5 });
    [[.7, .22], [.6, .5], [.2, .62]].forEach(([u, v], i) => dot(g, x + w * u, y + h * v, 3.4 + (i % 2), { col: '#fff3b0', seed: seed + 6 + i, t }));
    g.globalAlpha /= clamp(k) || 1;
  }
  if (sun > 0) {
    const sy = lerp(y + h + sunR * 1.5, y + h * .58, easeOut(sun, 2.4));
    sunFace(g, t, cx, sy, sunR, { mood, seed: seed + 9 });
  }
  g.restore();
  // The frame and its cross-bars.
  blob(g, rrect(cx, cy, w, h, 12, 3, seed + 20), { fill: null, line: DEN.woodD, lw: 15, seed: seed + 20, t });
  blob(g, rrect(cx, cy, w + 4, h + 4, 12, 3, seed + 21), { fill: null, line: ink, lw: 4.6, seed: seed + 21, t });
  line(g, [[cx, y + 6], [cx, y + h - 6]], { w: 9, col: DEN.woodD, seed: seed + 22, t, spline: false, passes: 1 });
  line(g, [[x + 6, cy - 6], [x + w - 6, cy - 6]], { w: 9, col: DEN.woodD, seed: seed + 23, t, spline: false, passes: 1 });
  blob(g, rrect(cx, y + h + 10, w + 46, 22, 7, 2, seed + 24), { fill: DEN.wood, shade: DEN.woodD, line: ink, lw: 5.4, seed: seed + 24, t, hw: 4.6, tone: .7, sh: .4 });
}

// ---------------------------------------------------------------- Blob's bed
// A round cushion seen from a little above: a plump rim, a dip, a few paw prints.
export function bed(g, t, x, y, rx, o = {}) {
  const { seed = 940 } = o;
  const ry = rx * .21;
  blob(g, ellipse(x, y + 8, rx, ry, 16, 0, seed), { fill: DEN.bed, shade: DEN.bedD, line: ink, lw: 7, seed, t, hw: 5.6, tone: .7, sh: .34 });
  blob(g, ellipse(x, y - 4, rx * .84, ry * .8, 16, 0, seed + 1), { fill: '#6b71c4', shade: '#4a4f9a', line: ink, lw: 5.4, seed: seed + 1, t, hw: 5, tone: .6, sh: .4 });
  // Stitching along the rim, and a pair of cream paw prints on the front.
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (.12 + i / 8 * .76);
    const px = x + Math.cos(a) * rx * .93, py = y + 8 + Math.sin(a) * ry * .93;
    line(g, [[px - 10, py - 1], [px + 10, py + 1]], { w: 4, col: '#f1ece0', seed: seed + 10 + i, t, spline: false, passes: 1, alpha: .85, bow: 0 });
  }
}

// ---------------------------------------------------------------- the pegboard and its tools
// Each tool is drawn upright with (x, y) its hang point (or grip) at the middle of its length.
export function netTool(g, x, y, s, t, o = {}) {
  const { seed = 300, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  // The bag, a soft pocket of mesh, then the pole, then the hoop over the bag's mouth.
  const bag = [[-66, -300], [-58, -230], [-30, -170], [0, -152], [30, -170], [58, -230], [66, -300]];
  hatch(g, bag, { col: '#8d8c97', seed: seed + 1, t, gap: 9, w: 3, alpha: .55, cross: true, spill: 1 });
  blob(g, bag, { fill: null, line: '#6d6b76', lw: 3.8, seed: seed + 2, t });
  line(g, [[0, 70], [0, -300]], { w: 15, col: DEN.woodD, seed: seed + 3, t, spline: false, passes: 1, bow: 2 });
  line(g, [[0, 70], [0, -300]], { w: 4.2, col: ink, seed: seed + 4, t, spline: false, passes: 1, alpha: .5, bow: 2 });
  blob(g, ellipse(0, -300, 70, 20, 12, 0, seed + 5), { fill: null, line: '#c83a2e', lw: 9, seed: seed + 5, t });
  g.restore();
}
export function stethTool(g, x, y, s, t, o = {}) {
  const { seed = 310, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const tube = { w: 11, col: C.teal, t, spline: true, passes: 1 };
  line(g, [[0, -36], [-6, -100], [0, -150]], { ...tube, seed: seed + 1 });
  line(g, [[0, -150], [-60, -186], [-74, -250]], { ...tube, seed: seed + 2 });
  line(g, [[0, -150], [56, -190], [72, -252]], { ...tube, seed: seed + 3 });
  dot(g, -74, -256, 9, { col: '#a8a7b2', seed: seed + 4, t });
  dot(g, 72, -258, 9, { col: '#a8a7b2', seed: seed + 5, t });
  blob(g, ellipse(0, 0, 34, 34, 12, 0, seed + 6), { fill: '#a8a7b2', shade: '#6d6b76', line: ink, lw: 5.6, seed: seed + 6, t, hw: 4.6, tone: .8, sh: .3 });
  blob(g, ellipse(0, 0, 19, 19, 10, 0, seed + 7), { fill: '#d6d5dd', line: ink, lw: 3.6, seed: seed + 7, t, hw: 4, tone: .8 });
  g.restore();
}
export function thermoTool(g, x, y, s, t, o = {}) {
  const { seed = 320, rot = 0, mercury = .45 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  blob(g, rrect(0, 0, 26, 250, 12, 3, seed), { fill: '#f6f1e2', line: ink, lw: 5.4, seed, t, hw: 4.6, tone: .8, dens: .3 });
  for (let i = 0; i < 6; i++) line(g, [[-2, -90 + i * 24], [10, -90 + i * 24]], { w: 3, col: '#6d6b76', seed: seed + 2 + i, t, spline: false, passes: 1, bow: 0, over: 0 });
  const top = 100 - mercury * 200;
  line(g, [[0, 100], [0, top]], { w: 7, col: C.red, seed: seed + 9, t, spline: false, passes: 1, bow: 0, taper: [.02, .05], over: 0 });
  blob(g, ellipse(0, 122, 20, 20, 10, 0, seed + 10), { fill: C.red, line: ink, lw: 5, seed: seed + 10, t, hw: 4.4, tone: .9 });
  g.restore();
}
export function malletTool(g, x, y, s, t, o = {}) {
  const { seed = 330, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  blob(g, rrect(0, 20, 26, 250, 10, 3, seed), { fill: DEN.wood, shade: DEN.woodD, line: ink, lw: 5.6, seed, t, hw: 4.8, tone: .7, sh: .3 });
  blob(g, rrect(0, -104, 150, 84, 18, 3, seed + 1), { fill: '#b8593a', shade: '#8a3a22', line: ink, lw: 6.4, seed: seed + 1, t, hw: 5, tone: .7, sh: .32 });
  [-46, 46].forEach((dx, i) => line(g, [[dx, -140], [dx, -68]], { w: 9, col: '#e8d7a8', seed: seed + 3 + i, t, spline: false, passes: 1, alpha: .9, bow: 0 }));
  g.restore();
}
export function probeTool(g, x, y, s, t, o = {}) {
  const { seed = 340, rot = 0, screen = 'off' } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  line(g, [[0, -160], [0, 50]], { w: 8, col: '#8d8c97', seed: seed + 1, t, spline: false, passes: 1, bow: 1 });
  blob(g, ellipse(0, -170, 15, 15, 8, 0, seed + 2), { fill: '#d6d5dd', line: ink, lw: 4.6, seed: seed + 2, t, hw: 4.4, tone: .8 });
  blob(g, rrect(0, 90, 62, 110, 16, 3, seed + 3), { fill: '#6d78c9', shade: '#414b93', line: ink, lw: 5.6, seed: seed + 3, t, hw: 4.8, tone: .7, sh: .3 });
  blob(g, rrect(0, 74, 44, 36, 6, 2, seed + 4), { fill: screen === 'off' ? '#31424a' : '#b9e8a4', line: ink, lw: 4.2, seed: seed + 4, t, hw: 4.2, tone: .9 });
  g.restore();
}
const TOOLS = {
  net: { x: 118, y: 1000, s: .62, draw: netTool, box: [70, 780, 170, 1100] },
  steth: { x: 210, y: 1000, s: .6, draw: stethTool, box: [170, 800, 250, 1000] },
  thermo: { x: 350, y: 970, s: .62, draw: thermoTool, box: [325, 890, 375, 1070] },
  mallet: { x: 430, y: 990, s: .6, draw: malletTool, box: [385, 900, 475, 1120] },
  probe: { x: 268, y: 1070, s: .58, draw: probeTool, box: [230, 900, 310, 1200] },
};
export function pegboard(g, t, x, y, w, h, o = {}) {
  const { taken = [], seed = 980 } = o;
  const dx = x - 50, dy = y - 790;              // the tools are laid out for a board at (50, 790)
  blob(g, rrect(x + w / 2, y + h / 2, w, h, 16, 3, seed), { fill: DEN.peg, shade: DEN.pegD, line: ink, lw: 6.4, seed, t, hw: 5.2, tone: .65, sh: .18 });
  // Holes.
  for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) {
    if (hash(seed, r, c) < .12) continue;
    dot(g, x + 36 + c * (w - 72) / 8, y + 40 + r * (h - 80) / 4, 4.4, { col: '#7d6238', seed: seed + 40 + r * 9 + c, t, alpha: .7 });
  }
  // The tools, or the ghost of one where a tool has gone.
  for (const k of Object.keys(TOOLS)) {
    const T = TOOLS[k];
    if (taken.includes(k)) {
      const [x0, y0, x1, y1] = T.box;
      blob(g, rrect((x0 + x1) / 2 + dx, (y0 + y1) / 2 + dy, x1 - x0, y1 - y0, 20, 3, seed + 60 + k.length), { fill: null, line: '#9a7a48', lw: 4.4, seed: seed + 61 + k.length, t });
    } else T.draw(g, T.x + dx, T.y + dy, T.s, t, { seed: seed + 100 + k.length * 7 });
  }
}
export const TOOL_POS = TOOLS;

// ---------------------------------------------------------------- the agent's hard hat and headlamp
// Drawn in Clawd's own space: (x, y) is the middle of the brim's underside; his body's top is y = -250.
export function hardHat(g, t, o = {}) {
  const { seed = 4, x = 0, y = -254, lit = 1 } = o;
  g.save(); g.translate(x, y);
  const dome = [[-112, -6], [-118, -52], [-98, -100], [-56, -130], [0, -138], [56, -130], [98, -100], [118, -52], [112, -6]];
  blob(g, dome, { fill: DEN.hat, shade: DEN.hatD, line: ink, lw: 6.8, seed: seed + 1, t, hw: 5, tone: .7, sh: .3 });
  [-34, 34].forEach((dx, i) => line(g, [[dx * .85, -128], [dx * 1.1, -64], [dx * 1.18, -14]], { w: 5.4, col: '#c88a17', seed: seed + 2 + i, t, spline: true, passes: 1, alpha: .9, taper: [.05, .1] }));
  blob(g, rrect(0, 4, 296, 30, 14, 3, seed + 4), { fill: '#f0b52c', shade: '#c88a17', line: ink, lw: 6.4, seed: seed + 4, t, hw: 4.8, tone: .75, sh: .4 });
  // The lamp on the front: a grey housing, a cream lens.
  blob(g, rrect(0, -62, 92, 60, 16, 3, seed + 5), { fill: '#a8a7b2', shade: '#6d6b76', line: ink, lw: 5.8, seed: seed + 5, t, hw: 4.6, tone: .8, sh: .3 });
  blob(g, ellipse(0, -62, 25, 21, 10, 0, seed + 6), { fill: lit ? '#fff3b0' : '#e9e6da', line: ink, lw: 4.4, seed: seed + 6, t, hw: 4.2, tone: .9 });
  g.restore();
}
// A soft cone of lamplight from (sx, sy) to a lit patch at (px, py), drawn over what it lights.
export function beam(g, t, sx, sy, px, py, o = {}) {
  const { w0 = 40, w1 = 250, alpha = 1, seed = 990 } = o;
  const dx = px - sx, dy = py - sy, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  const poly = [[sx + nx * w0 / 2, sy + ny * w0 / 2], [px + nx * w1 / 2, py + ny * w1 / 2], [px - nx * w1 / 2, py - ny * w1 / 2], [sx - nx * w0 / 2, sy - ny * w0 / 2]];
  wash(g, poly, '#fff0a0', .3 * alpha, seed, t);
  hatch(g, poly, { col: '#ffe680', seed: seed + 1, t, gap: 13, w: 11, alpha: .2 * alpha, angle: Math.atan2(dy, dx) + .3, dens: .8, spill: 3 });
  // A brighter patch where it lands.
  hatch(g, ellipse(px, py, w1 * .5, w1 * .34, 12, Math.atan2(dy, dx), seed + 2), { col: '#fff3b0', seed: seed + 3, t, gap: 10, w: 10, alpha: .28 * alpha, dens: .85, spill: 2 });
}

// ---------------------------------------------------------------- what he carries
// A clipboard of six name tags (blank; or named) in two columns: `pops[i]` 0..1 is how far tag i has stuck on.
export const TAGS = [
  { col: C.teal, name: 'DEBUG' }, { col: C.sky, name: 'DIAGNOSE' }, { col: C.green, name: 'RECOVER' },
  { col: C.purple, name: 'TEST' }, { col: C.blue, name: 'READ' }, { col: C.navy, name: 'MAINTAIN' },
];
export function tagBoard(g, x, y, s, t, o = {}) {
  const { seed = 400, tilt = 0, pops = [1, 1, 1, 1, 1, 1], named = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(tilt); g.scale(s, s);
  blob(g, rrect(0, 0, 262, 340, 20, 3, seed), { fill: '#c99a5a', shade: '#8b5f2a', line: ink, lw: 6.6, seed, t, hw: 5, tone: .6, sh: .25 });
  blob(g, rrect(0, 12, 222, 286, 8, 2, seed + 1), { fill: '#fbf8ef', line: ink, lw: 4.6, seed: seed + 1, t, hw: 4.4, tone: .95, dens: .2 });
  blob(g, rrect(0, -156, 100, 40, 12, 2, seed + 2), { fill: '#a8a7b2', shade: '#6d6b76', line: ink, lw: 5, seed: seed + 2, t, hw: 4.4, sh: .3 });
  TAGS.forEach((tg, i) => {
    const k = clamp(pops[i] ?? 1);
    if (k <= 0) return;
    const cx = (i % 2 ? 54 : -54), cy = -76 + Math.floor(i / 2) * 92;
    const sc = backOut(k, 2.4);
    g.save(); g.translate(cx, cy); g.scale(sc, sc); g.rotate((hash(seed, i) - .5) * .12);
    blob(g, rrect(0, 0, 100, 74, 10, 2, seed + 10 + i), { fill: '#fdfcf6', line: ink, lw: 4.6, seed: seed + 10 + i, t, hw: 4.2, tone: .9, dens: .2 });
    blob(g, rrect(0, -27, 100, 22, 7, 2, seed + 20 + i), { fill: tg.col, line: ink, lw: 4, seed: seed + 20 + i, t, hw: 4.2, tone: .95 });
    if (named) write(g, tg.name, 0, 20, tg.name.length > 6 ? 16 : 20, { col: ink, seed: seed + 30 + i, t, align: 'center', track: 2, prog: clamp((named - i * .12) * 2), w: .12 });
    else write(g, '?', 0, 24, 40, { col: tg.col === C.navy ? '#25397c' : tg.col, seed: seed + 30 + i, t, align: 'center', w: .16 });      // (a blank tag: something he's about to ask for)
    g.restore();
  });
  g.restore();
}

// ---------------------------------------------------------------- small effects
// A puff of breath: three soft clouds that drift out and fade. prog 0..1.
export function puff(g, t, x, y, s, prog, o = {}) {
  const { seed = 500, dir = 1 } = o;
  if (prog <= 0 || prog >= 1) return;
  g.save(); g.globalAlpha *= 1 - smooth(inv(.55, 1, prog));
  [[0, 0, 26], [44, -16, 34], [96, -30, 42]].forEach(([dx, dy, r], i) => {
    const k = clamp(prog * 3 - i * .4) * (.7 + prog * .5);
    blob(g, ellipse(x + dir * (dx * s + prog * 80 * s), y + (dy - prog * 40) * s, r * s * k, r * s * .8 * k, 8, 0, seed + i), { fill: '#f4f1ea', line: '#8d8c97', lw: 4, seed: seed + i, t, hw: 4.4, tone: .9, dens: .3 });
  });
  g.restore();
}
// Sleeping: Zs that rise and grow.
export function zzz(g, t, x, y, s, o = {}) {
  const { seed = 520, col = C.blue } = o;
  for (let i = 0; i < 3; i++) {
    const ph = ((t * .42 + i / 3) % 1);
    const k = Math.sin(Math.PI * ph);
    write(g, 'Z', x + Math.sin(ph * 5 + i) * 10 * s + ph * 40 * s, y - ph * 200 * s, (26 + ph * 26) * s, { col, seed: seed + i, t, align: 'center', alpha: k * .9, w: .12, rot: -.2 + ph * .3 });
  }
}

// ---------------------------------------------------------------- the AGAIN button
// A big red button on a wooden crate, its label on the front. (x, y) is the crate's foot; press 0..1.
export function againButton(g, t, x, y, s, o = {}) {
  const { seed = 600, press = 0 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, rrect(0, -46, 270, 92, 12, 3, seed), { fill: DEN.wood, shade: DEN.woodD, line: ink, lw: 6.4, seed, t, hw: 5, tone: .7, sh: .3 });
  write(g, 'AGAIN', 0, -20, 42, { col: '#fbf8ef', seed: seed + 1, t, align: 'center', track: 5, w: .12 });
  // A steel ring and the red dome, which sinks when pressed.
  blob(g, ellipse(0, -96, 118, 28, 12, 0, seed + 2), { fill: '#a8a7b2', shade: '#6d6b76', line: ink, lw: 5.6, seed: seed + 2, t, hw: 4.8, tone: .8, sh: .35 });
  const k = 1 - .66 * press, by = -100;
  const dome = [[-98, 0], [-94, -38], [-60, -76], [0, -88], [60, -76], [94, -38], [98, 0]].map(([px, py]) => [px, by + py * k]);
  blob(g, dome, { fill: C.red, shade: '#a8261f', line: ink, lw: 6.2, seed: seed + 3, t, hw: 5, tone: .8, sh: .32 });
  line(g, [[-54, by - 40 * k], [-26, by - 62 * k], [10, by - 70 * k]], { w: 7, col: '#ffd9d2', seed: seed + 4, t, spline: true, passes: 1, alpha: .85, taper: [.1, .5] });
  g.restore();
}

// ---------------------------------------------------------------- a flea
// A tiny bug in a top hat: a dark bean of a body, six bent legs, two bright eyes and a grin. (x, y) is
// where its feet are; it faces right (flip -1 to face left). squash 0..1 crouches it; tip 0..1 lifts its hat.
export function flea(g, t, x, y, s, o = {}) {
  const { seed = 700, flip = 1, squash = 0, tip = 0, look = 0, alpha = 1 } = o;
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha;
  g.translate(x, y); g.scale(s * flip * (1 + squash * .18), s * (1 - squash * .5));
  const leg = (pts, w, sd, col = ink) => line(g, pts, { w, col, seed: seed + sd, t, spline: false, passes: 1, bow: 0, over: 0, taper: [.05, .25] });
  // The far legs, then the near ones: a big folded hind leg like a jumper's, two small ones in front.
  leg([[-6, -30], [-14, -22], [-8, -3]], 4.2, 1, '#55535f'); leg([[10, -28], [20, -18], [24, -3]], 4.2, 2, '#55535f');
  leg([[-20, -34], [-42, -60], [-56, -30], [-50, -3]], 6.6, 3);
  leg([[-4, -26], [-2, -14], [-4, -2]], 5, 4);
  leg([[14, -26], [22, -14], [30, -2]], 5, 5);
  blob(g, ellipse(-2, -40, 33, 23, 10, -.12, seed + 10), { fill: '#3a3947', shade: '#1c1b24', line: ink, lw: 4.6, seed: seed + 10, t, hw: 4, tone: .95, gap: 4 });
  blob(g, ellipse(28, -50, 15, 14, 8, 0, seed + 11), { fill: '#3a3947', line: ink, lw: 4.2, seed: seed + 11, t, hw: 4, tone: .95, gap: 4 });
  // A big bright eye and a grin.
  dot(g, 32, -53, 5.4, { col: '#fbf8ef', seed: seed + 12, t }); dot(g, 33 + look * 1.6, -52.5, 2.6, { col: ink, seed: seed + 13, t });
  line(g, [[26, -42], [32, -40], [39, -45]], { w: 3, col: '#fbf8ef', seed: seed + 16, t, spline: true, passes: 1, bow: 0, over: 0 });
  // The top hat.
  const lift = tip * 14;
  g.save(); g.translate(26 - tip * 6, -62 - lift); g.rotate(-tip * .5);
  blob(g, rrect(0, -13, 22, 28, 4, 2, seed + 20), { fill: '#25293f', line: ink, lw: 3.8, seed: seed + 20, t, hw: 4, tone: .95, gap: 4 });
  blob(g, rrect(0, 2, 36, 7, 3, 2, seed + 21), { fill: '#25293f', line: ink, lw: 3.6, seed: seed + 21, t, hw: 4, tone: .95, gap: 4 });
  line(g, [[-9, -4], [9, -4]], { w: 5, col: C.red, seed: seed + 22, t, spline: false, passes: 1, bow: 0, over: 0 });
  g.restore();
  g.restore();
}

// ---------------------------------------------------------------- the error box
// The machine's whole answer: a small window that says OOPS. (x, y) is its centre.
export function errorBox(g, t, x, y, s, o = {}) {
  const { seed = 800, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  blob(g, rrect(10, 12, 320, 214, 18, 3, seed), { fill: '#6d6b76', line: null, seed, t, hw: 5, tone: .5, dens: .6 });      // its shadow
  blob(g, rrect(0, 0, 320, 214, 18, 3, seed + 1), { fill: '#fbf8ef', line: ink, lw: 6.6, seed: seed + 1, t, hw: 5, tone: .9, dens: .25 });
  blob(g, rrect(0, -84, 320, 46, 16, 3, seed + 2), { fill: '#8d9bd6', shade: '#5f6fb4', line: ink, lw: 6, seed: seed + 2, t, hw: 4.6, tone: .8, sh: .3 });
  [-1, 0, 1].forEach((k, i) => dot(g, -128 + i * 26, -84, 7, { col: '#fbf8ef', seed: seed + 3 + i, t, alpha: .95 }));
  // A red warning disc with a bang, and the word.
  blob(g, ellipse(-104, -4, 40, 40, 12, 0, seed + 8), { fill: C.red, shade: '#a8261f', line: ink, lw: 5.4, seed: seed + 8, t, hw: 4.6, tone: .9, sh: .3 });
  write(g, '!', -104, 20, 56, { col: '#fbf8ef', seed: seed + 9, t, align: 'center', w: .16 });
  write(g, 'OOPS', 52, 22, 58, { col: ink, seed: seed + 10, t, align: 'center', track: 5, w: .12 });
  // Two grey lines of small print, and an OK.
  line(g, [[-70, 46], [130, 46]], { w: 6, col: '#a8a7b2', seed: seed + 11, t, spline: false, passes: 1, bow: 0, over: 0 });
  line(g, [[-70, 66], [90, 66]], { w: 6, col: '#a8a7b2', seed: seed + 12, t, spline: false, passes: 1, bow: 0, over: 0 });
  blob(g, rrect(112, 88, 92, 34, 10, 2, seed + 13), { fill: '#d6dcf4', line: ink, lw: 4.8, seed: seed + 13, t, hw: 4.4, tone: .8 });
  write(g, 'OK', 112, 100, 26, { col: ink, seed: seed + 14, t, align: 'center', track: 4 });
  g.restore();
}

// ---------------------------------------------------------------- a broken vase
// A blue vase in three shards, a wilting flower and a puddle. (x, y) is the middle of the floor it lies on.
export function brokenVase(g, t, x, y, s, o = {}) {
  const { seed = 820 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, ellipse(20, 18, 130, 26, 12, 0, seed), { fill: '#8ccff5', line: null, seed, t, hw: 5, tone: .7, dens: .8 });
  // The flower, dropped, on its stem.
  line(g, [[-40, 4], [-90, -6], [-140, 14]], { w: 7, col: '#3f9a4d', seed: seed + 1, t, spline: true, passes: 1, bow: 0 });
  [0, 1, 2, 3, 4].forEach(i => blob(g, ellipse(-150 + Math.cos(i * 1.26) * 20, 16 + Math.sin(i * 1.26) * 18, 14, 10, 7, i, seed + 2 + i), { fill: C.pink, line: ink, lw: 3.6, seed: seed + 2 + i, t, gap: 5, hw: 4, tone: .8 }));
  // The shards: a curved base, two sides, a chip.
  blob(g, [[-50, -12], [10, -16], [40, 6], [-20, 20], [-56, 10]], { fill: '#5b8fd6', shade: '#3a5fa8', line: ink, lw: 5, seed: seed + 8, t, hw: 4.6, tone: .8, sh: .3 });
  blob(g, [[20, -40], [58, -10], [84, 4], [50, 12], [30, -8]], { fill: '#7fb2e5', shade: '#3a5fa8', line: ink, lw: 5, seed: seed + 9, t, hw: 4.6, tone: .8, sh: .3 });
  blob(g, [[86, 6], [118, -12], [132, 12], [104, 20]], { fill: '#5b8fd6', line: ink, lw: 4.6, seed: seed + 10, t, hw: 4.4, tone: .8 });
  blob(g, [[-8, -46], [16, -58], [24, -32], [0, -26]], { fill: '#7fb2e5', line: ink, lw: 4.4, seed: seed + 11, t, hw: 4.4, tone: .8 });
  g.restore();
}

// ---------------------------------------------------------------- a thumb up, for the end of an arm
export function thumbUp(g, t, x, y, o = {}) {
  const { seed = 830, s = 1, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  blob(g, capsule([2, -22], [2, -66], 15, 13, 5, seed + 1), { fill: '#d4643a', shade: '#a2452a', line: ink, lw: 6, seed: seed + 1, t, hw: 4.6, sh: .3 });
  blob(g, ellipse(0, -8, 30, 26, 10, 0, seed), { fill: '#d4643a', shade: '#a2452a', line: ink, lw: 6, seed, t, hw: 4.6, sh: .3 });
  g.restore();
}

// ---------------------------------------------------------------- the payments board (chalk on slate)
// A slate with PAYMENTS in chalk, a piggy bank and coins. `wipe` is the x the sponge has reached: the chalk
// to its right is gone and a smear is left; (`wipe` >= x + w keeps it all).
export function chalkboard(g, t, x, y, w, h, o = {}) {
  const { seed = 850, wipe = 1e9 } = o;
  const cx = x + w / 2, cy = y + h / 2, chalk = '#f5f0e6';
  blob(g, rrect(cx, cy, w, h, 14, 3, seed), { fill: '#5f8a78', shade: '#456b5c', line: DEN.woodD, lw: 15, seed, t, hw: 5, tone: .85, sh: .25 });
  blob(g, rrect(cx, cy, w + 6, h + 6, 14, 3, seed + 1), { fill: null, line: ink, lw: 4.6, seed: seed + 1, t });
  g.save(); g.beginPath(); g.rect(x, y, Math.max(0, Math.min(w, wipe - x)), h); g.clip();
  write(g, 'PAYMENTS', cx, y + 74, 46, { col: chalk, seed: seed + 2, t, align: 'center', track: 5, w: .11 });
  const px = cx - 10, py = cy + 40;
  blob(g, ellipse(px, py, 96, 72, 12, 0, seed + 3), { fill: '#f7a9c4', line: chalk, lw: 5.4, seed: seed + 3, t, hw: 5, tone: .7, dens: .6 });
  blob(g, ellipse(px + 100, py + 8, 28, 24, 9, 0, seed + 4), { fill: '#f7a9c4', line: chalk, lw: 5, seed: seed + 4, t, hw: 4.6, tone: .7, dens: .6 });
  blob(g, [[px + 34, py - 56], [px + 62, py - 94], [px + 76, py - 50]], { fill: '#f7a9c4', line: chalk, lw: 4.6, seed: seed + 5, t, hw: 4.4, tone: .7, dens: .6 });
  [-52, 44].forEach((dx, i) => blob(g, rrect(px + dx, py + 78, 26, 30, 8, 2, seed + 6 + i), { fill: '#f7a9c4', line: chalk, lw: 4.6, seed: seed + 6 + i, t, hw: 4.4, tone: .7, dens: .6 }));
  line(g, [[px - 96, py - 6], [px - 122, py - 22], [px - 110, py - 40], [px - 128, py - 50]], { w: 5, col: chalk, seed: seed + 9, t, spline: true, passes: 1, bow: 0 });
  line(g, [[px - 24, py - 68], [px + 12, py - 70]], { w: 6, col: chalk, seed: seed + 10, t, spline: false, passes: 1, bow: 0 });
  dot(g, px + 66, py - 18, 7, { col: chalk, seed: seed + 11, t });
  [-58, 0, 58].forEach((dx, i) => blob(g, ellipse(px + dx, y + h - 46, 26, 26, 9, 0, seed + 12 + i), { fill: null, line: chalk, lw: 5, seed: seed + 12 + i, t }));
  blob(g, ellipse(px, y + 128, 20, 20, 8, 0, seed + 16), { fill: null, line: chalk, lw: 5, seed: seed + 16, t });
  g.restore();
  // The smear where it has been wiped.
  if (wipe < x + w) {
    const wx = Math.max(x, wipe);
    hatch(g, [[wx, y + 10], [x + w - 4, y + 10], [x + w - 4, y + h - 10], [wx, y + h - 10]], { col: '#d6e4dc', seed: seed + 20, t, gap: 14, w: 16, alpha: .38, angle: .25, dens: .8, spill: 4 });
  }
}
// A long pole with a big yellow sponge on it, from `a` (the hand) to `b` (the head).
export function mop(g, t, a, b, o = {}) {
  const { seed = 860 } = o;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  line(g, [[a[0] - Math.cos(ang) * 60, a[1] - Math.sin(ang) * 60], b], { w: 13, col: DEN.woodD, seed, t, spline: false, passes: 1, bow: 2 });
  g.save(); g.translate(b[0], b[1]); g.rotate(ang + Math.PI / 2);
  blob(g, rrect(0, 14, 128, 58, 16, 3, seed + 1), { fill: '#f2d24a', shade: '#c9a022', line: ink, lw: 5.6, seed: seed + 1, t, hw: 4.8, tone: .8, sh: .3 });
  [[-34, 10], [-4, 22], [30, 12]].forEach(([dx, dy], i) => dot(g, dx, dy + 6, 5, { col: '#b8891c', seed: seed + 2 + i, t, alpha: .8 }));
  g.restore();
}

// ---------------------------------------------------------------- the dusty manual, pinned up
export function manual(g, t, x, y, w, h, o = {}) {
  const { seed = 870, tilt = -.03, glow = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(tilt);
  blob(g, rrect(0, 0, w, h, 8, 3, seed), { fill: '#ecd9a0', shade: '#cdb06a', line: ink, lw: 6, seed, t, hw: 5, tone: .85, sh: .22 });
  // Its dog-eared corner.
  blob(g, [[w / 2 - 66, h / 2 + 2], [w / 2 + 2, h / 2 - 66], [w / 2 + 2, h / 2 + 2]], { fill: '#d9c07a', line: ink, lw: 4.6, seed: seed + 1, t, hw: 4.4, tone: .8 });
  write(g, 'MANUAL', -w / 2 + 22, -h / 2 + 54, 30, { col: '#7d5a2a', seed: seed + 2, t, track: 6 });
  write(g, '2019', w / 2 - 22, -h / 2 + 54, 30, { col: C.red, seed: seed + 3, t, align: 'right', track: 4, w: .13 });
  line(g, [[-w / 2 + 22, -h / 2 + 74], [w / 2 - 22, -h / 2 + 74]], { w: 4, col: '#a8834a', seed: seed + 4, t, spline: false, passes: 1, bow: 0 });
  const k = 1 + glow * .05;
  g.save(); g.scale(k, k);
  write(g, 'NIGHTLY', 0, 8, 62, { col: '#3b2a17', seed: seed + 5, t, align: 'center', track: 5, w: .1 });
  write(g, 'SAVES!', 0, 92, 62, { col: '#3b2a17', seed: seed + 6, t, align: 'center', track: 5, w: .1 });
  g.restore();
  // A cobweb in the corner and a smudge of dust.
  const cx0 = -w / 2 + 2, cy0 = -h / 2 + 2;
  [[80, 8], [58, 46], [16, 82]].forEach(([dx, dy], i) => line(g, [[cx0, cy0], [cx0 + dx, cy0 + dy]], { w: 3, col: '#8d8c97', seed: seed + 8 + i, t, spline: false, passes: 1, bow: 0, alpha: .8 }));
  [30, 56].forEach((r, i) => line(g, [[cx0 + r * .92, cy0 + 4], [cx0 + r * .7, cy0 + r * .62], [cx0 + r * .3, cy0 + r * .95], [cx0 + 4, cy0 + r]], { w: 2.6, col: '#8d8c97', seed: seed + 12 + i, t, spline: true, passes: 1, bow: 0, alpha: .75 }));
  hatch(g, [[-w / 2 + 12, h / 2 - 54], [w / 2 - 80, h / 2 - 40], [w / 2 - 80, h / 2 - 8], [-w / 2 + 12, h / 2 - 8]], { col: '#a8a7b2', seed: seed + 16, t, gap: 12, w: 10, alpha: .25, dens: .6 });
  g.restore();
}

// ---------------------------------------------------------------- the BACKUPS cabinet
// A tall cupboard; `open` 0..1 swings its doors wide to show the empty shelves.
export function cabinet(g, t, x, y, w, h, o = {}) {
  const { seed = 880, open = 0 } = o;
  const cx = x + w / 2, cy = y + h / 2;
  blob(g, rrect(cx, cy, w, h, 12, 3, seed), { fill: DEN.wood, shade: DEN.woodD, line: ink, lw: 7, seed, t, hw: 5.2, tone: .75, sh: .2 });
  const iw = w - 44, ih = h - 130, ix = cx, iy = cy + 32;
  if (open > 0) {
    blob(g, rrect(ix, iy, iw, ih, 8, 3, seed + 1), { fill: '#eadfc4', shade: '#c9b48a', line: ink, lw: 5.6, seed: seed + 1, t, hw: 5, tone: .9, sh: .3 });
    [.33, .66].forEach((u, i) => line(g, [[ix - iw / 2 + 6, iy - ih / 2 + ih * u], [ix + iw / 2 - 6, iy - ih / 2 + ih * u]], { w: 11, col: DEN.woodD, seed: seed + 2 + i, t, spline: false, passes: 1, bow: 1 }));
    // Cobwebs and nothing else.
    [[ix - iw / 2 + 4, iy - ih / 2 + 4, 1], [ix + iw / 2 - 4, iy - ih / 2 + 4, -1]].forEach(([wx, wy, d], i) => [[70, 10], [50, 50], [10, 76]].forEach(([dx, dy], j) => line(g, [[wx, wy], [wx + d * dx, wy + dy]], { w: 3.4, col: '#8d8c97', seed: seed + 6 + i * 3 + j, t, spline: false, passes: 1, bow: 0, alpha: .9 })));
  }
  // The two doors, hinged at the sides: they swing wide open towards us, showing their backs.
  const dw = iw / 2, ang = clamp(open) * 2.0, cs = Math.cos(ang), sn = Math.sin(ang);
  [-1, 1].forEach((side, i) => {
    const hx = ix + side * iw / 2, fx = hx - side * dw * cs, grow = 1 + .14 * sn;
    const top = iy - ih / 2, bot = iy + ih / 2, ym = iy;
    const P = [[hx, top], [fx, ym - ih / 2 * grow], [fx, ym + ih / 2 * grow], [hx, bot]];
    blob(g, roundPoly(P, [5, 5, 5, 5], 3), { fill: cs > 0 ? '#d6b27a' : '#e6cc9a', shade: DEN.woodD, line: ink, lw: 5.6, seed: seed + 10 + i, t, hw: 4.8, tone: .8, sh: .25 });
    if (cs > .1) dot(g, hx - side * (dw * cs - 16), iy, 7, { col: '#a8a7b2', seed: seed + 14 + i, t });
  });
  // The plate.
  blob(g, rrect(cx, y + 58, w - 50, 60, 10, 2, seed + 20), { fill: '#3b3a4a', line: ink, lw: 5.4, seed: seed + 20, t, hw: 4.6, tone: .9, gap: 4 });
  write(g, 'BACKUPS', cx, y + 76, 34, { col: '#f6ecd0', seed: seed + 21, t, align: 'center', track: 4, w: .12 });
}

// A moth: two dusty wings that flap.
export function moth(g, t, x, y, s, o = {}) {
  const { seed = 890 } = o;
  const f = .35 + .65 * Math.abs(Math.sin(t * 16 + seed));
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * 5 + seed) * .25); g.scale(s, s);
  [-1, 1].forEach((d, i) => { g.save(); g.scale(d * f, 1); blob(g, ellipse(26, -8, 32, 22, 8, -.4, seed + i), { fill: '#b9a488', line: ink, lw: 4, seed: seed + i, t, hw: 4.2, tone: .8 }); blob(g, ellipse(20, 14, 20, 15, 8, .4, seed + 3 + i), { fill: '#9d8a70', line: ink, lw: 3.6, seed: seed + 3 + i, t, hw: 4, tone: .8 }); g.restore(); });
  blob(g, ellipse(0, 2, 8, 20, 7, 0, seed + 8), { fill: '#6d5f52', line: ink, lw: 3.6, seed: seed + 8, t, hw: 4, tone: .9 });
  line(g, [[-2, -16], [-14, -34]], { w: 3, col: ink, seed: seed + 9, t, spline: false, passes: 1, bow: 0, over: 0 });
  line(g, [[2, -16], [14, -34]], { w: 3, col: ink, seed: seed + 10, t, spline: false, passes: 1, bow: 0, over: 0 });
  g.restore();
}
// A dashed outline of a rectangle: the ghost of what should be there.
export function dashedRect(g, t, x, y, w, h, o = {}) {
  const { seed = 895, col = ink, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot);
  const P = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]];
  for (let i = 0; i < 4; i++) {
    const [a, b] = [P[i], P[i + 1]];
    for (let k = 0; k < 3; k++) {
      const u0 = k / 3 + .04, u1 = (k + 1) / 3 - .04;
      line(g, [[a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0], [a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1]], { w: 4, col, seed: seed + i * 3 + k, t, spline: false, passes: 1, bow: 0, over: 0 });
    }
  }
  g.restore();
}

// ---------------------------------------------------------------- shot 4: the test rig, a socket, a cone
export function cone(g, t, x, y, s, o = {}) {
  const { seed = 1000 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, rrect(0, -6, 100, 16, 5, 2, seed), { fill: '#e8892a', line: ink, lw: 5, seed, t, hw: 4.4, tone: .8 });
  blob(g, [[-38, -12], [38, -12], [13, -104], [-13, -104]], { fill: '#f0883a', shade: '#c4601a', line: ink, lw: 5.4, seed: seed + 1, t, hw: 4.6, tone: .8, sh: .3 });
  blob(g, [[-27, -46], [27, -46], [20, -70], [-20, -70]], { fill: '#fbf8ef', line: null, seed: seed + 2, t, hw: 4.4, tone: .9, dens: .5 });
  g.restore();
}
// The AUTO-TEST rig: a box with a dial and a lamp. fail 0..1 turns the lamp red. (x, y) is its foot.
export function rigBox(g, t, x, y, s, o = {}) {
  const { seed = 1010, fail = 0 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, rrect(0, -84, 250, 168, 16, 3, seed), { fill: '#8d9bd6', shade: '#5f6fb4', line: ink, lw: 6.4, seed, t, hw: 5, tone: .75, sh: .25 });
  blob(g, rrect(0, -136, 200, 40, 8, 2, seed + 1), { fill: '#fbf8ef', line: ink, lw: 4.6, seed: seed + 1, t, hw: 4.4, tone: .9, dens: .2 });
  write(g, 'AUTO-TEST', 0, -122, 26, { col: ink, seed: seed + 2, t, align: 'center', track: 3, w: .12 });
  blob(g, ellipse(-56, -62, 30, 30, 10, 0, seed + 3), { fill: '#fbf8ef', line: ink, lw: 5, seed: seed + 3, t, hw: 4.4, tone: .9, dens: .2 });
  line(g, [[-56, -62], [-40 + fail * 8, -80]], { w: 5, col: C.red, seed: seed + 4, t, spline: false, passes: 1, bow: 0, over: 0 });
  blob(g, ellipse(48, -62, 22, 22, 9, 0, seed + 5), { fill: fail > .5 ? C.red : C.lime, line: ink, lw: 5, seed: seed + 5, t, hw: 4.4, tone: .9 });
  if (fail > .5) write(g, 'X', 48, -50, 30, { col: '#fbf8ef', seed: seed + 6, t, align: 'center', w: .16 });
  [-90, 90].forEach((dx, i) => blob(g, rrect(dx, 6, 30, 14, 4, 2, seed + 7 + i), { fill: '#6d6b76', line: ink, lw: 4.4, seed: seed + 7 + i, t, hw: 4, tone: .8 }));
  g.restore();
}
// A round port in Blob's fur: a shorn patch, a ring, two round holes.
export function socketPatch(g, t, x, y, s, o = {}) {
  const { seed = 1020 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, ellipse(0, 0, 58, 52, 10, 0, seed), { fill: '#f1ece0', line: ink, lw: 5, seed, t, hw: 4.6, tone: .8, dens: .5 });
  blob(g, ellipse(0, 0, 38, 38, 10, 0, seed + 1), { fill: '#a8a7b2', line: ink, lw: 5, seed: seed + 1, t, hw: 4.4, tone: .8 });
  [-14, 14].forEach((dx, i) => dot(g, dx, 0, 7.5, { col: ink, seed: seed + 2 + i, t }));
  g.restore();
}
// A plug with two square prongs, pointing right (rot turns it).
export function plugTool(g, t, x, y, s, o = {}) {
  const { seed = 1030, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  blob(g, rrect(-24, 0, 58, 72, 12, 3, seed), { fill: '#6d78c9', shade: '#414b93', line: ink, lw: 5.4, seed, t, hw: 4.6, tone: .8, sh: .3 });
  [-16, 16].forEach((dy, i) => blob(g, rrect(24, dy, 30, 16, 3, 2, seed + 1 + i), { fill: '#d6d5dd', line: ink, lw: 4.4, seed: seed + 1 + i, t, hw: 4, tone: .9 }));
  g.restore();
}
// A small readout: dashes where a number should be.
export function readout(g, t, x, y, s, o = {}) {
  const { seed = 1040, text = '- - -' } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, rrect(0, 0, 170, 70, 12, 3, seed), { fill: '#2f4a40', line: ink, lw: 5.6, seed, t, hw: 4.8, tone: .95, gap: 4 });
  write(g, text, 0, 24, 56, { col: '#f0ffd8', seed: seed + 1, t, align: 'center', track: 6, w: .14 });
  g.restore();
}

// ---------------------------------------------------------------- shot 5: the bowl and its fur
export function furTuft(g, t, x, y, s, o = {}) {
  const { seed = 1050, rot = 0, col = '#c3c1cd' } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  blob(g, scallop(0, 0, 44, 7, .18, 0, seed), { fill: col, shade: '#8a8898', line: ink, lw: 5, seed, t, hw: 4.6, tone: .8, sh: .3 });
  [-16, 4, 22].forEach((dx, i) => line(g, [[dx, -8], [dx + 3, 10]], { w: 3.4, col: '#5b5a66', seed: seed + 1 + i, t, spline: false, passes: 1, bow: 0, over: 0, alpha: .6 }));
  g.restore();
}
// A dog bowl: a blue enamel dish with CONTEXT on it; `fill` tufts of fur heaped in it (0..~14).
export function dogBowl(g, t, x, y, s, o = {}) {
  const { seed = 1060, fill = 0 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, [[-150, -100], [150, -100], [118, 0], [-118, 0]], { fill: '#2f57a8', shade: '#1d3878', line: ink, lw: 6.4, seed, t, hw: 5, tone: .9, sh: .3 });
  blob(g, ellipse(0, -100, 150, 30, 12, 0, seed + 1), { fill: '#7fb2e5', shade: '#3a5fa8', line: ink, lw: 6, seed: seed + 1, t, hw: 4.8, tone: .7, sh: .3 });
  for (let i = 0; i < fill; i++) {
    const u = (i % 5) / 4, row = Math.floor(i / 5);
    furTuft(g, t, -110 + u * 220 + Math.sin(i * 2.3) * 14, -112 - row * 44 - Math.abs(Math.sin(i * 1.7)) * 8, .85 + row * .06, { seed: seed + 10 + i, rot: Math.sin(i * 3.1) * .5 });
  }
  write(g, 'CONTEXT', 0, -28, 46, { col: '#fbf8ef', seed: seed + 2, t, align: 'center', track: 5, w: .13 });
  g.restore();
}
// Handwriting nobody could read, in rows across a region: `prog` 0..1 how much is there, `knot` 0..1 how tangled.
// Each row is a run of little letter-shapes (loops, humps, tall strokes, descenders, zigzags) that never spell anything.
export function scrawl(g, t, x0, x1, y0, rows, o = {}) {
  const { seed = 1070, prog = 1, knot = 0, col = '#4a4a63', gap = 52 } = o;
  for (let r = 0; r < rows; r++) {
    const rp = clamp(prog * rows - r);
    if (rp <= 0) continue;
    const y = y0 + r * gap, xe = x1 - hash(seed, r) * 140;
    const pts = [];
    let x = x0 + hash(seed, r, 9) * 30, k = 0;
    while (x < xe) {
      const kind = Math.floor(hash(seed, r, k, 5) * 5), wd = 16 + hash(seed, r, k, 6) * 16, hh = 12 + hash(seed, r, k, 7) * 10;
      const yb = y + (hash(seed, r, k, 8) - .5) * 6 + knot * 26 * Math.sin(k * .9 + r * 2);
      if (kind === 0) for (let a = 0; a <= 8; a++) { const th = a / 8 * TAU + 3.1; pts.push([x + wd / 2 + Math.cos(th) * wd / 2, yb - hh * .5 + Math.sin(th) * hh * .5]); }
      else if (kind === 1) pts.push([x, yb], [x + wd * .35, yb - hh * 2.2], [x + wd * .55, yb - hh * 1.2], [x + wd * .9, yb]);
      else if (kind === 2) pts.push([x, yb], [x + wd * .2, yb - hh], [x + wd * .5, yb - hh * .2], [x + wd * .75, yb - hh], [x + wd, yb]);
      else if (kind === 3) pts.push([x, yb - hh * .6], [x + wd * .5, yb - hh], [x + wd * .8, yb], [x + wd * .3, yb + hh * 1.3], [x + wd, yb + hh * .3]);
      else pts.push([x, yb - hh * .7], [x + wd * .25, yb], [x + wd * .5, yb - hh * .9], [x + wd * .75, yb], [x + wd, yb - hh * .6]);
      x += wd * (.85 - knot * .35);
      k++;
    }
    line(g, pts, { w: 4.4, col, seed: seed + r, t, spline: true, passes: 1, bow: 0, over: 0, from: 0, to: rp, alpha: .8, taper: [.02, .05] });
  }
}

// ---------------------------------------------------------------- shot 6: eggs, a stump, a pedestal
// An egg; crack 0..1 draws a zigzag across it; `open` splits it into two shells (the flea comes out of it).
export function egg(g, t, x, y, s, o = {}) {
  const { seed = 1080, crack = 0, open = 0, rot = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  if (open > 0) {
    const k = easeOut(open, 2);
    g.save(); g.translate(-16 * k, -12 * k); g.rotate(-.5 * k);
    blob(g, [[-30, -6], [-26, -34], [0, -46], [26, -34], [30, -6], [14, -14], [0, -2], [-14, -14]], { fill: '#f3ead4', shade: '#d3c39c', line: ink, lw: 5, seed, t, hw: 4.6, tone: .9, sh: .3 });
    g.restore();
    g.save(); g.translate(16 * k, 6 * k); g.rotate(.4 * k);
    blob(g, [[-30, 2], [-14, -8], [0, 4], [14, -8], [30, 2], [24, 30], [0, 44], [-24, 30]], { fill: '#f3ead4', shade: '#d3c39c', line: ink, lw: 5, seed: seed + 1, t, hw: 4.6, tone: .9, sh: .3 });
    g.restore();
  } else {
    blob(g, ellipse(0, -2, 30, 40, 10, 0, seed), { fill: '#f3ead4', shade: '#d3c39c', line: ink, lw: 5.2, seed, t, hw: 4.6, tone: .9, sh: .3 });
    [[-10, -18], [12, -8], [-4, 12], [14, 20]].forEach(([dx, dy], i) => dot(g, dx, dy, 3.6, { col: '#9a7a48', seed: seed + 2 + i, t, alpha: .85 }));
    if (crack > 0) line(g, [[-6, -38], [4, -24], [-8, -12], [8, 0], [-4, 10]], { w: 4.2, col: ink, seed: seed + 8, t, spline: false, passes: 1, bow: 0, over: 0, from: 0, to: clamp(crack) });
  }
  g.restore();
}
// A plinth with a red velvet cushion and a gold plaque, for a rosette that isn't there. (x, y) is its foot.
export function pedestal(g, t, x, y, s, o = {}) {
  const { seed = 1090 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, rrect(0, -16, 204, 32, 8, 2, seed), { fill: '#e9d5b0', shade: '#b8975f', line: ink, lw: 6.4, seed, t, hw: 5, tone: .85, sh: .3 });
  blob(g, rrect(0, -118, 124, 176, 10, 2, seed + 1), { fill: '#f2e2c0', shade: '#c2a26a', line: ink, lw: 6.4, seed: seed + 1, t, hw: 5, tone: .85, sh: .25 });
  blob(g, rrect(0, -222, 172, 32, 8, 2, seed + 2), { fill: '#e9d5b0', shade: '#b8975f', line: ink, lw: 6.4, seed: seed + 2, t, hw: 5, tone: .85, sh: .3 });
  // The cushion, plump and empty.
  blob(g, [[-62, -238], [-56, -262], [-26, -284], [26, -284], [56, -262], [62, -238]], { fill: C.red, shade: '#8a1f1a', line: ink, lw: 5.6, seed: seed + 6, t, hw: 4.8, tone: .9, sh: .3 });
  line(g, [[-30, -262], [0, -270], [30, -262]], { w: 5, col: '#ffb8ae', seed: seed + 7, t, spline: true, passes: 1, bow: 0, over: 0, alpha: .8 });
  [-62, 62].forEach((dx, i) => dot(g, dx, -232, 7, { col: '#e0b030', seed: seed + 8 + i, t }));
  blob(g, rrect(0, -116, 104, 52, 6, 2, seed + 3), { fill: '#f2cf66', shade: '#c9a02a', line: ink, lw: 4.6, seed: seed + 3, t, hw: 4.4, tone: .9 });
  write(g, 'MAINTAIN-', 0, -122, 17, { col: ink, seed: seed + 4, t, align: 'center', track: 2 });
  write(g, 'ABILITY', 0, -100, 17, { col: ink, seed: seed + 5, t, align: 'center', track: 2 });
  g.restore();
}
// A rosette that isn't there: a dashed frill, two dashed tails and a question mark.
export function ghostRosette(g, t, x, y, r, col, o = {}) {
  const { seed = 1120, tilt = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(tilt);
  const dashed = (P, sd, w = 6) => { for (let i = 0; i + 2 < P.length; i += 3) line(g, [P[i], P[i + 1], P[i + 2]], { w, col, seed: sd + i, t, spline: false, passes: 1, bow: 0, over: 0, taper: [.1, .1] }); };
  const ring = resample(spline(scallop(0, 0, r, 12, .1, 0, seed), true, 6), 13, true).p;
  dashed(ring, seed);
  const tail = sd => resample(spline([[sd * r * .25, r * .8], [sd * r * .7, r * 1.6], [sd * r * .5, r * 1.45], [sd * r * .3, r * 1.95]], false, 6), 13).p;
  dashed(tail(-1), seed + 300, 5.4); dashed(tail(1), seed + 400, 5.4);
  write(g, '?', 0, r * .42, r * 1.1, { col, seed: seed + 9, t, align: 'center', w: .13 });
  g.restore();
}

// ---------------------------------------------------------------- shot 7: a stool
export function stool(g, t, x, y, s, o = {}) {
  const { seed = 1100 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  [[-70, -8], [70, -8], [0, 14]].forEach(([dx, dy], i) => line(g, [[dx * .6, -150], [dx, dy]], { w: 17, col: DEN.woodD, seed: seed + i, t, spline: false, passes: 1, bow: 2 }));
  blob(g, ellipse(0, -156, 112, 26, 12, 0, seed + 5), { fill: DEN.wood, shade: DEN.woodD, line: ink, lw: 6.2, seed: seed + 5, t, hw: 5, tone: .8, sh: .3 });
  g.restore();
}

// ---------------------------------------------------------------- shot 8: a kitchen scale with a dial
// A body with a round dial (needle at `w` 0..1) and a flat pan on top that dips with `load` 0..1. (x, y) is its foot.
export function dialScale(g, t, x, y, s, o = {}) {
  const { seed = 1110, w = 0, load = 0 } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(g, rrect(0, -62, 320, 124, 26, 3, seed), { fill: '#9fd0e8', shade: '#5f9cc4', line: ink, lw: 6.6, seed, t, hw: 5, tone: .8, sh: .25 });
  const dy = load * 14;
  line(g, [[0, -124 + dy], [0, -152 + dy]], { w: 20, col: '#a8a7b2', seed: seed + 1, t, spline: false, passes: 1, bow: 0, over: 0 });
  blob(g, ellipse(0, -164 + dy, 150, 26, 12, 0, seed + 2), { fill: '#d6d5dd', shade: '#8d8c97', line: ink, lw: 6, seed: seed + 2, t, hw: 4.8, tone: .8, sh: .35 });
  blob(g, ellipse(0, -64, 66, 66, 14, 0, seed + 3), { fill: '#fbf8ef', line: ink, lw: 6, seed: seed + 3, t, hw: 4.6, tone: .95, dens: .2 });
  for (let i = 0; i <= 8; i++) { const a = Math.PI * (.85 + i / 8 * 1.3); line(g, [[Math.cos(a) * 52, -64 + Math.sin(a) * 52], [Math.cos(a) * 62, -64 + Math.sin(a) * 62]], { w: 3.6, col: ink, seed: seed + 4 + i, t, spline: false, passes: 1, bow: 0, over: 0 }); }
  const na = Math.PI * (.85 + clamp(w) * 1.3);
  line(g, [[0, -64], [Math.cos(na) * 50, -64 + Math.sin(na) * 50]], { w: 6, col: C.red, seed: seed + 14, t, spline: false, passes: 1, bow: 0, over: 0 });
  dot(g, 0, -64, 8, { col: ink, seed: seed + 15, t });
  g.restore();
}


// ---------------------------------------------------------------- Blob, with a softer coat
// The same dog as chars.js's shaggy (huge sheepdog, front on) with one change: at this size the mound's
// outline of alternating spikes read as a circular saw, so here it is a cloud of round lobes meeting in
// cusps. Options as shaggy's (state 'sleep' 'awake' 'alarmed', mouth, look, squash, bob, lean, tongue).
export function blobDog(g, o = {}) {
  const { x = 540, y = 1300, s = 1, t = 0, seed = 8, state = 'awake', mouth = 0, look = [0, 0], flip = 1, squash = 0, bob = 0, lean = 0,
    coat = '#c3c1cd', shade = '#8a8898', cream = '#f1ece0', tongue = false, life = 1 } = o;
  const I = idle(t, seed);
  const sd = seed * 53;
  const R = 250;
  const br = 1 + Math.sin(t * TAU * (state === 'sleep' ? .32 : .5) + seed) * (state === 'sleep' ? .026 : .016) * life;
  g.save();
  g.translate(x, y - bob);
  g.rotate(lean);
  g.scale(s * flip * (1 + squash * .1), s * (1 - squash * .13) * br);
  const cy = -R * .95;
  // Ears behind, hanging at the sides.
  [-1, 1].forEach((sd_, i) => {
    const ex = sd_ * R * .92, ey = cy - R * .2, sw = beatRing(t, { f: 2.1, z: .14, amp: 5 }) * life * sd_;
    blob(g, capsule([ex, ey], [ex + sd_ * R * .12 + sw, ey + R * .62], R * .17, R * .12, 5, sd + i), { fill: shade, line: ink, lw: 6, seed: sd + 3 + i, t, hw: 5.4, sh: .3 });
  });
  // The mound: a cloud of round lobes.
  const N = 17, M = N * 6, pts = [];
  for (let k = 0; k < M; k++) {
    const th = k / M * TAU, lobe = th * N / TAU, u = lobe - Math.floor(lobe);
    const lr = 1 + (hash(sd, Math.floor(lobe), 1) - .5) * .09;
    const r = R * lr * (1 - .105 * (1 - Math.pow(Math.sin(Math.PI * u), .7)));
    pts.push([Math.cos(th) * r * 1.08, cy + Math.sin(th) * r * .96]);
  }
  blob(g, pts, { fill: coat, shade, line: ink, lw: 7.2, seed: sd + 1, t, hw: 5.8, gap: 6.6, sh: .34 });
  // Fur: strokes flowing out from the face.
  for (let i = 0; i < 46; i++) {
    const a = hash(sd, i, 1) * TAU, r0 = R * (.32 + hash(sd, i, 2) * .3), L = R * (.16 + hash(sd, i, 3) * .16);
    const c0 = [Math.cos(a) * r0, cy + Math.sin(a) * r0 * .92];
    const sway_ = Math.sin(t * 1.4 + i) * 2 * life;
    line(g, [c0, [c0[0] + Math.cos(a + .3) * L * .5 + sway_, c0[1] + Math.sin(a + .3) * L * .5], [c0[0] + Math.cos(a + .1) * L + sway_, c0[1] + Math.sin(a + .1) * L]], { w: 5, col: '#5b5a66', seed: sd + 20 + i, t, passes: 1, alpha: .5, taper: [.1, .7], wob: 1 });
  }
  // A collar with a bone-shaped tag that says CODE: he is the code, and this is the one place the film says so.
  if (o.tag !== false) {
    const cyy = cy + R * .58, cw = R * .62;
    line(g, [[-cw, cyy - R * .07], [-cw * .5, cyy + R * .05], [0, cyy + R * .09], [cw * .5, cyy + R * .05], [cw, cyy - R * .07]], { w: R * .09, col: '#3f6fd6', seed: sd + 91, t, spline: true, passes: 1, taper: [.02, .02], tooth: .5, over: 0, bow: 0 });
    line(g, [[-cw, cyy - R * .07], [-cw * .5, cyy + R * .05], [0, cyy + R * .09], [cw * .5, cyy + R * .05], [cw, cyy - R * .07]], { w: 5, col: ink, seed: sd + 92, t, spline: true, passes: 1, alpha: .55, taper: [.02, .02], over: 0, bow: 0 });
    const tx = 0, ty = cyy + R * .24 + beatRing(t, { f: 2.4, z: .16, amp: 4 }) * life, tw = R * .36, th = R * .17;
    blob(g, roundPoly([[tx - tw, ty - th * .5], [tx - tw * .78, ty - th * .95], [tx - tw * .55, ty - th * .5], [tx + tw * .55, ty - th * .5], [tx + tw * .78, ty - th * .95], [tx + tw, ty - th * .5], [tx + tw, ty + th * .5], [tx + tw * .78, ty + th * .95], [tx + tw * .55, ty + th * .5], [tx - tw * .55, ty + th * .5], [tx - tw * .78, ty + th * .95], [tx - tw, ty + th * .5]], [10, 10, 4, 4, 10, 10, 10, 10, 4, 4, 10, 10], 2), { fill: '#f7d774', line: ink, lw: 5.4, seed: sd + 93, t, gap: 5, hw: 4.6, tone: .8 });
    write(g, 'CODE', tx, ty + R * .05, R * .12, { col: ink, seed: sd + 94, t, align: 'center', track: 4, w: .12 });
  }
  // The face: a pale patch, a big nose, a mouth.
  const fy = cy + R * .1;
  blob(g, ellipse(0, fy + R * .1, R * .42, R * .34, 10, 0, sd + 30), { fill: cream, line: null, seed: sd + 30, t, tone: .6, gap: 6, hw: 5, dens: .7 });
  const nose = [0, fy + R * .06];
  blob(g, ellipse(nose[0], nose[1], R * .13, R * .1, 8, 0, sd + 31), { fill: ink, line: null, seed: sd + 31, t, gap: 3.4, hw: 4.8, tone: .95 });
  dot(g, nose[0] - R * .035, nose[1] - R * .035, R * .03, { col: '#fbf8ef', seed: sd + 32, t, alpha: .8 });
  const my = nose[1] + R * .1;
  if (mouth > .15) {
    const mh = R * (.06 + mouth * .18);
    blob(g, [[-R * .16, my], [R * .16, my], [R * .12, my + mh], [0, my + mh * 1.1], [-R * .12, my + mh]], { fill: '#7a2e2a', line: ink, lw: 4.6, seed: sd + 33, t, tone: .9, gap: 4, hw: 4 });
    if (tongue || mouth > .5) blob(g, ellipse(0, my + mh * .9, R * .09, R * .05, 7, 0, sd + 34), { fill: C.pink, line: null, seed: sd + 34, t, tone: .8, gap: 4, hw: 4 });
  } else if (state === 'alarmed') line(g, [[-R * .12, my + R * .05], [0, my], [R * .12, my + R * .05]], { w: 6, col: ink, seed: sd + 33, t, passes: 1 });
  else line(g, [[-R * .16, my - R * .01], [-R * .05, my + R * .05], [R * .05, my + R * .05], [R * .16, my - R * .01]], { w: 6, col: ink, seed: sd + 33, t, passes: 1 });
  // The eyes peek out under the fringe.
  const ey = fy - R * .12, ex = R * .2;
  const shut = state === 'sleep' || I.blink * life > .5;
  const lk = [look[0] + I.look[0] * life, look[1] + I.look[1] * life];
  [-1, 1].forEach((sd_, i) => {
    const cx = sd_ * ex + lk[0] * 4, cyy = ey + lk[1] * 3;
    if (shut) line(g, [[cx - R * .07, cyy], [cx, cyy + R * .03], [cx + R * .07, cyy]], { w: 5.4, col: ink, seed: sd + 40 + i, t, passes: 1 });
    else if (state === 'alarmed') { blob(g, ellipse(cx, cyy, R * .08, R * .09, 8, 0, sd + 40 + i), { fill: '#fbf8ef', line: ink, lw: 4, seed: sd + 40 + i, t, tone: .95 }); dot(g, cx + lk[0] * 3, cyy + lk[1] * 3, R * .035, { col: ink, seed: sd + 42 + i, t }); }
    else { dot(g, cx, cyy, R * .05, { col: ink, seed: sd + 40 + i, t }); dot(g, cx - R * .015, cyy - R * .018, R * .018, { col: '#fbf8ef', seed: sd + 44 + i, t }); }
  });
  // The fringe over the eyes.
  for (let i = 0; i < 16; i++) {
    const u = (i + .5) / 16, fx = (u - .5) * R * .95 + (hash(sd, i, 11) - .5) * R * .05;
    const drop = R * (.3 + Math.sin(u * Math.PI) * .12 + (hash(sd, i, 12) - .5) * .14) * (state === 'alarmed' ? .8 : 1);
    const lean_ = (u - .5) * R * .16 + (hash(sd, i, 13) - .5) * R * .06;
    line(g, [[fx * .9, fy - R * .55], [fx + lean_ * .4, fy - R * .3], [fx + lean_ + Math.sin(t * 1.6 + i) * 1.5 * life, fy - R * .55 + drop]], { w: 6, col: ink, seed: sd + 60 + i, t, passes: 1, alpha: .7, taper: [.05, .6], wob: 1.2 });
  }
  // Paws at the foot of the mound.
  [-1, 1].forEach((sd_, i) => {
    blob(g, ellipse(sd_ * R * .38, -R * .08, R * .2, R * .1, 8, 0, sd + 70 + i), { fill: coat, shade, line: ink, lw: 6, seed: sd + 70 + i, t, hw: 5, sh: .3 });
    [-1, 0, 1].forEach(k => line(g, [[sd_ * R * .38 + k * R * .06, -R * .09], [sd_ * R * .38 + k * R * .06, -R * .03]], { w: 4, col: ink, seed: sd + 74 + i * 3 + k, t, passes: 1, spline: false }));
  });
  g.restore();
}
