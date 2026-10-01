// Verse 2's places: Mabel's basement gym, painted to the workshop's standard, and the street of
// basement gyms the camera pulls back to in chorus 2.
//
// The gym: a brick basement under a timbered ceiling, lit by three bare bulbs. Mabel lifts in an
// arched alcove at the middle, under a high window at pavement level; the router hangs on the wall
// at the left by its socket; dumbbells, Indian clubs and a punch bag on the right. The floor line
// is the far edge of a dark green rubber mat, which fills the apron below for the lyric.
// The street: a doll's-house cutaway of a terrace, its basements opened up in a row, a lifter in
// each; the pavement and the houses above.
import { W, TAU, clamp, lerp, rng, noise, hash, mix, rgba } from './kit.js';
import { C } from './palette.js';
import { bake, wash, glaze, light, gloom, shadow, streaks, dabs, inkLine, paper, ao, path, wob, dense, box } from './bg.js';
import { ellipse, spline, rrect } from './ink.js';
import { place } from './common.js';
import { router, socket, plug } from './cast.js';
import { passersBy, sparks } from './props-gym.js';
import { now } from './kit.js';

// World coordinates of the gym. floor: the mat's far edge (the floor line); base: where the back
// wall meets the floor; vp: the vanishing point (eye level, about Mabel's chest).
export const GYM = {
  w: 2400, h: 2500, floor: 1450, base: 1318, ceil: 500, vp: [1360, 1130],
  mabel: 1360, phone: 950,
  router: [455, 1085], socket: [560, 1268],
  win: { x0: 1120, x1: 1600, y0: 538, y1: 668 },
  alcove: { cx: 1360, hw: 300, spring: 1000, top: 762, depth: 46 },
  bulbs: [[1360, 772], [560, 712], [2050, 706]],
};
const G = GYM;
const lit = (col, k) => mix(col, '#ffe6b0', k), dim = (col, k) => mix(col, '#140a10', k);

// The point on the line from the vanishing point through (x, y0), at height y.
const persp = (x, y0, y) => G.vp[0] + (x - G.vp[0]) * (y - G.vp[1]) / (y0 - G.vp[1]);

// ---------------------------------------------------------------- brickwork
// Courses of bricks of uneven size and colour, mortar a little proud and broken, painted into P.
function bricks(g, P, o = {}) {
  const R = rng(o.seed ?? 11), b = bboxOf(P);
  const base = o.col || '#a4553c', mortar = C(o.mortar || '#e6cfa6');
  g.save(); path(g, P); g.clip();
  // the mortar bed shows through everywhere first: a pale, gritty wash
  wash(g, box(b.x0 - 4, b.y0 - 4, b.w + 8, b.h + 8), mix(base, '#d8c0a0', .45), { seed: (o.seed ?? 11) + 1, gran: .8, rim: 0, blooms: Math.round(clamp(b.w * b.h / 40000, 2, 40)), amt: 0, bloom: 1.2, bloomScale: 1.6 });
  const ch = o.ch ?? 27, bwid = o.bw ?? 70, list = [];
  let row = 0;
  for (let y = b.y0 - ch; y < b.y1 + ch; y += ch, row++) {
    let x = b.x0 - (row % 2 ? bwid * .5 : 0) - R() * 12;
    while (x < b.x1 + bwid) {
      const w = bwid * lerp(.82, 1.12, R());
      list.push({ x, y, w, c: mix(mix(base, R() < .5 ? '#c86a45' : '#6e3324', R() * .45), R() < .25 ? '#d9b48a' : '#2a1410', R() * .18), jx: (R() - .5) * 2.4, jy: (R() - .5) * 2, chip: R(), cx: R(), cy: R(), pale: R() });
      x += w;
    }
  }
  // the bricks, painted soft-edged
  g.save(); g.filter = 'blur(0.9px)';
  for (const k of list) {
    const { x, y, w, jx, jy } = k;
    g.fillStyle = rgba(C(k.c), .92);
    g.beginPath(); g.moveTo(x + 3 + jx, y + 3 + jy); g.lineTo(x + w - 2, y + 2.5 + jy * .5); g.lineTo(x + w - 2.5 + jx * .4, y + ch - 3); g.lineTo(x + 3, y + ch - 2.5 + jy * .5); g.closePath(); g.fill();
  }
  g.restore();
  // each brick's relief: its top edge catches the light, its underside falls into shadow
  g.lineCap = 'round';
  for (const k of list) {
    const { x, y, w } = k;
    g.strokeStyle = rgba(C('#ffe2b8'), .16); g.lineWidth = 2.2; g.beginPath(); g.moveTo(x + 5, y + 4.5); g.lineTo(x + w - 5, y + 4); g.stroke();
    g.strokeStyle = rgba(C('#1c0a06'), .3); g.lineWidth = 2.6; g.beginPath(); g.moveTo(x + 5, y + ch - 3.5); g.lineTo(x + w - 4, y + ch - 3.5); g.lineTo(x + w - 3, y + 6); g.stroke();
    if (k.chip < .1) { g.fillStyle = rgba(C('#1c0c08'), .3); g.beginPath(); g.ellipse(x + w * k.cx, y + ch * k.cy, 6 + k.cx * 8, 3 + k.cy * 4, k.cx * 3, 0, TAU); g.fill(); }
    if (k.pale < .07) { g.fillStyle = rgba(C('#f0d8b0'), .22); g.beginPath(); g.ellipse(x + w * k.cx, y + ch * .5, 8 + k.cx * 14, 3 + k.cy * 4, 0, 0, TAU); g.fill(); }
  }
  // grit in the mortar
  g.strokeStyle = rgba(mortar, .18); g.lineWidth = 1.4;
  for (let y = b.y0 - ch; y < b.y1 + ch; y += ch) { let x = b.x0 - 20; while (x < b.x1 + 20) { const L = 20 + R() * 120; if (R() > .3) { g.beginPath(); g.moveTo(x, y + 1 + (R() - .5)); g.lineTo(x + L, y + 1 + (R() - .5)); g.stroke(); } x += L + R() * 30; } }
  // weathering: soot running down from the top, salt blooming up from the floor, a few cracks
  if (o.weather !== false) {
    for (let i = 0; i < Math.round(b.w / 260); i++) {
      const sx = b.x0 + R() * b.w, sw = 30 + R() * 80;
      const gr = g.createLinearGradient(0, b.y0, 0, b.y0 + 160 + R() * 200);
      gr.addColorStop(0, rgba('#1a0c08', .3)); gr.addColorStop(1, rgba('#1a0c08', 0));
      g.save(); g.filter = 'blur(10px)'; g.fillStyle = gr; g.fillRect(sx, b.y0, sw, 400); g.restore();
    }
    for (let i = 0; i < Math.round(b.w / 220); i++) {
      const sx = b.x0 + R() * b.w, sy = b.y1 - 30 - R() * 120;
      g.save(); g.filter = 'blur(7px)'; g.fillStyle = rgba('#f4ecd8', .16 + R() * .1); g.beginPath(); g.ellipse(sx, sy, 40 + R() * 70, 18 + R() * 30, 0, 0, TAU); g.fill(); g.restore();
    }
    for (let i = 0; i < Math.round(b.w / 500); i++) {
      let cx = b.x0 + R() * b.w, cy = b.y0 + R() * b.h * .6;
      g.strokeStyle = rgba(C('#140806'), .45); g.lineWidth = 1.8; g.beginPath(); g.moveTo(cx, cy);
      for (let k = 0; k < 9; k++) { cx += (R() - .5) * 40; cy += ch * (.6 + R() * .6); g.lineTo(cx, cy); }
      g.stroke();
    }
  }
  g.restore();
}
function bboxOf(P) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 }; }
// A ragged blob for patches of limewash and damp.
function blob(cx, cy, rx, ry, seed, n = 40, rough = .22) {
  const P = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, r = 1 + noise(i * .45, seed) * rough + noise(i * 1.7, seed + 3) * rough * .5; P.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); }
  return P;
}

// ---------------------------------------------------------------- the gym
export function gym() {
  return bake('gym-v2', G.w, G.h, (g, w, h) => {
    const F = G.floor, B = G.base, CE = G.ceil, [vx, vy] = G.vp, A = G.alcove;
    const R = rng(4100);

    // ---- the back wall: brick, with old limewash over much of it
    bricks(g, box(0, CE, w, B - CE), { seed: 4101, col: '#a65a3e' });
    // limewash, worn through to the brick in places
    for (const [cx, cy, rx, ry, s] of [[250, 640, 260, 150, 4110], [930, 700, 170, 120, 4111], [2000, 660, 240, 140, 4112], [2280, 1150, 160, 120, 4114]]) {
      const P = blob(cx, cy, rx, ry, s, 48, .34);
      g.save(); g.globalAlpha = .38; g.filter = 'blur(1.5px)'; wash(g, P, '#d8c49c', { seed: s, gran: .9, rim: .7, rimW: 6, blooms: 6, amt: 3, bloom: 1.4 }); g.restore();
      // brick showing through the thin wash
      g.save(); path(g, P); g.clip(); dabs(g, P, ['#a65a3e', '#8a4630', '#c27a5a'], { seed: s + 9, n: Math.round(rx * ry / 260), r: 9, a: .32 }); g.restore();
    }
    // damp creeping up from the floor and down from the window
    for (const [cx, cy, rx, ry, s] of [[120, 1250, 240, 120, 4120], [1060, 1270, 160, 90, 4121], [1800, 1260, 260, 100, 4122], [1360, 720, 330, 70, 4123]]) glaze(g, blob(cx, cy, rx, ry, s, 36, .35), '#5a4a2a', .22, 'multiply', 18);
    // soot and age under the ceiling
    g.save(); g.globalCompositeOperation = 'multiply'; const sg = g.createLinearGradient(0, CE, 0, CE + 260); sg.addColorStop(0, rgba('#2a1a14', .75)); sg.addColorStop(1, rgba('#2a1a14', 0)); g.fillStyle = sg; g.fillRect(0, CE, w, 260); g.restore();

    // ---- the alcove: a recess under a brick arch, its back cooler and darker
    const ax0 = A.cx - A.hw, ax1 = A.cx + A.hw, d = A.depth;
    const archPts = (hw, top, spring, n = 30) => { const P = []; for (let i = 0; i <= n; i++) { const a = Math.PI + i / n * Math.PI; P.push([A.cx + Math.cos(a) * hw, spring + Math.sin(a) * (spring - top)]); } return P; };
    const opening = [[ax0, B], ...archPts(A.hw, A.top, A.spring), [ax1, B]];
    // the recess's back wall, set back: smaller about the vanishing point
    const k = .9, bx0 = vx + (ax0 - vx) * k, bx1 = vx + (ax1 - vx) * k, bTop = vy + (A.top - vy) * k, bSpr = vy + (A.spring - vy) * k, bBase = vy + (B - vy) * k;
    g.save(); path(g, opening); g.clip();
    bricks(g, box(ax0 - 10, A.top - 10, ax1 - ax0 + 20, B - A.top + 20), { seed: 4130, col: '#7e4232', ch: 25, bw: 64, mortar: '#cdb898' });
    // the returns (inner side walls), in perspective, and the soffit of the arch
    const retL = [[ax0, B], [ax0, A.spring], [bx0, bSpr], [bx0, bBase]], retR = [[ax1, B], [ax1, A.spring], [bx1, bSpr], [bx1, bBase]];
    wash(g, retL, '#8e4c36', { seed: 4131, gran: .6, rim: .3, blooms: 3, grad: [[0, '#b0644a'], [1, '#6a3426']], dir: [[ax0, 0], [bx0, 0]] });
    wash(g, retR, '#6a3426', { seed: 4132, gran: .6, rim: .3, blooms: 3, grad: [[0, '#4a2018'], [1, '#6a3426']], dir: [[ax1, 0], [bx1, 0]] });
    const outer = archPts(A.hw, A.top, A.spring), inner = archPts((bx1 - bx0) / 2, bTop, bSpr);
    wash(g, [...outer, ...inner.slice().reverse()], '#7a3e2c', { seed: 4133, gran: .5, rim: .3, blooms: 2, grad: [[0, '#5a2a1e'], [1, '#8a4a34']], dir: [[0, A.top], [0, bTop + 40]] });
    // the floor of the recess
    wash(g, [[ax0, B], [bx0, bBase], [bx1, bBase], [ax1, B]], '#6e4a30', { seed: 4134, gran: .5, rim: .2, blooms: 2 });
    // cool shadow in the recess's upper reaches
    g.save(); g.globalCompositeOperation = 'multiply'; const rg = g.createLinearGradient(0, A.top, 0, B); rg.addColorStop(0, rgba('#4a3a5a', .8)); rg.addColorStop(.6, rgba('#a090a0', .35)); rg.addColorStop(1, rgba('#ffffff', 0)); g.fillStyle = rg; g.fillRect(ax0 - 10, A.top - 10, ax1 - ax0 + 20, B - A.top + 20); g.restore();
    g.restore();
    // the arch's ring of radiating bricks (voussoirs) and its keystone
    for (let i = 0; i < 23; i++) {
      const a0 = Math.PI + i / 23 * Math.PI, a1 = Math.PI + (i + 1) / 23 * Math.PI, ry = A.spring - A.top;
      const pt = (a, r) => [A.cx + Math.cos(a) * (A.hw + r), A.spring + Math.sin(a) * (ry + r)];
      const P = [pt(a0 + .01, 4), pt(a1 - .01, 4), pt(a1 - .01, 60), pt(a0 + .01, 60)];
      const c = mix('#b4644a', R() < .5 ? '#8a3e2a' : '#d08a64', R() * .5);
      wash(g, P, c, { seed: 4140 + i, gran: .5, rim: .4, rimW: 3, blooms: 0, amt: .5 });
    }
    inkLine(g, archPts(A.hw, A.top, A.spring), { w: 2.4, a: .55, seed: 4165 });
    inkLine(g, archPts(A.hw + 62, A.top - 62, A.spring), { w: 2, a: .4, seed: 4166 });
    inkLine(g, [[ax0, A.spring], [ax0, B]], { w: 2.4, a: .5, seed: 4167 }); inkLine(g, [[ax1, A.spring], [ax1, B]], { w: 2.4, a: .5, seed: 4168 });
    // the stone springers at the arch's feet
    for (const sx of [ax0 - 16, ax1 - 46]) wash(g, box(sx, A.spring - 8, 62, 34), '#cdb48c', { seed: 4170 + sx, gran: .5, rim: .4, blooms: 1, ink: 2, inkA: .4 });

    // ---- the high window at pavement level, set deep in the wall
    const W0 = G.win, wx0 = W0.x0, wx1 = W0.x1, wy0 = W0.y0, wy1 = W0.y1, rev = 34;
    // reveal (the thickness of the wall) and the sloping sill, in perspective toward the eye
    wash(g, [[wx0 - rev, wy0 - 14], [wx1 + rev, wy0 - 14], [wx1 + rev, wy1 + 40], [wx0 - rev, wy1 + 40]], '#cdb898', { seed: 4180, gran: .6, rim: .5, blooms: 3, grad: [[0, '#8a7458'], [1, '#e6d4b0']], ink: 2.2, inkA: .5 });
    // the glass: grey daylight, the pavement and the foot of the railings outside
    const gx0 = wx0, gx1 = wx1, gy0 = wy0, gy1 = wy1;
    g.save(); path(g, box(gx0, gy0, gx1 - gx0, gy1 - gy0)); g.clip();
    wash(g, box(gx0, gy0, gx1 - gx0, gy1 - gy0), '#c9d6d2', { seed: 4181, grad: [[0, '#e8eee4'], [.6, '#c2d0cc'], [1, '#9fb0ac']], gran: .4, rim: 0, blooms: 4, amt: 0 });
    // the far kerb and the road beyond, then the pavement's flags, near
    wash(g, box(gx0, gy0 + 40, gx1 - gx0, 26), '#8e968c', { seed: 4182, gran: .5, rim: 0, blooms: 1, amt: 0 });
    wash(g, box(gx0, gy0 + 66, gx1 - gx0, gy1 - gy0 - 66), '#b4b2a2', { seed: 4183, grad: [[0, '#c8c4b2'], [1, '#9a9686']], gran: .6, rim: 0, blooms: 2, amt: 0 });
    for (let x = gx0 - 40; x < gx1; x += 120) inkLine(g, [[x, gy0 + 66], [x - 60, gy1]], { w: 1.6, a: .35, seed: 4184 + x, col: '#5a5a50' });
    // area railings' feet against the light
    g.restore();
    // the frame and its glazing bars
    const fr = '#3a3430';
    for (const P of [box(gx0 - 8, gy0 - 8, gx1 - gx0 + 16, 12), box(gx0 - 8, gy1 - 4, gx1 - gx0 + 16, 12), box(gx0 - 8, gy0 - 8, 12, gy1 - gy0 + 16), box(gx1 - 4, gy0 - 8, 12, gy1 - gy0 + 16)]) wash(g, P, fr, { seed: 4195 + P[0][0] + P[0][1], gran: .3, rim: 0, blooms: 0, amt: .4 });
    for (let i = 1; i < 4; i++) { const x = lerp(gx0, gx1, i / 4); wash(g, box(x - 4, gy0, 8, gy1 - gy0), fr, { seed: 4200 + i, gran: .3, rim: 0, blooms: 0, amt: .3 }); }
    wash(g, box(gx0, (gy0 + gy1) / 2 - 3, gx1 - gx0, 6), fr, { seed: 4205, gran: .3, rim: 0, blooms: 0, amt: .3 });
    // daylight falling in: a cool slanting shaft
    g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(26px)';
    const shaft = g.createLinearGradient(0, gy1, 0, B);
    shaft.addColorStop(0, rgba('#cfe0e8', .32)); shaft.addColorStop(1, rgba('#cfe0e8', 0));
    g.fillStyle = shaft; g.beginPath(); g.moveTo(gx0 + 20, gy1); g.lineTo(gx1 - 20, gy1); g.lineTo(gx1 + 240, B); g.lineTo(gx0 + 120, B); g.closePath(); g.fill();
    g.restore();

    // ---- the ceiling: the floorboards of the room above, carried on joists running toward us
    wash(g, box(0, 0, w, CE + 4), '#3a2a22', { seed: 4210, grad: [[0, '#140c0a'], [1, '#4a3428']], gran: .6, rim: 0, blooms: 10, amt: 0 });
    for (let i = 0; i < 26; i++) { const yy = CE - Math.pow(i / 26, 1.6) * CE; inkLine(g, [[0, yy], [w, yy]], { w: 1.4, a: .25, seed: 4211 + i, col: '#120806' }); }
    for (let k2 = -6; k2 <= 6; k2++) {
      const x0 = vx + k2 * 210, xa = persp(x0, CE, 0), xb = persp(x0 + 26, CE, 0);
      const P = [[x0, CE], [x0 + 26, CE], [xb, 0], [xa, 0]];
      wash(g, P, '#5a4030', { seed: 4220 + k2, gran: .5, rim: .3, blooms: 1, grad: [[0, '#6a4a36'], [1, '#2a1a12']], dir: [[0, CE], [0, 0]], ink: 1.8, inkA: .5 });
      // the joist's lit underside
      wash(g, [[x0 + 26, CE], [x0 + 34, CE], [persp(x0 + 34, CE, 0), 0], [xb, 0]], '#8a6448', { seed: 4240 + k2, gran: .3, rim: 0, blooms: 0, amt: .3 });
    }
    // the beam along the top of the wall, and a pipe running under it
    wash(g, box(0, CE - 6, w, 36), '#4a3428', { seed: 4260, gran: .5, rim: .4, blooms: 4, ink: 2, inkA: .5, grad: [[0, '#5e4434'], [1, '#2e1e16']] });
    shadow(g, box(0, CE + 30, w, 26), .45, 10);
    for (const [py, pr, col] of [[CE + 58, 15, '#6a7270'], [CE + 98, 10, '#8a6a4a']]) {
      shadow(g, box(0, py + pr, w, 14), .35, 8);
      wash(g, box(0, py - pr, w, pr * 2), col, { seed: 4270 + py, gran: .4, rim: .4, blooms: 3, grad: [[0, lit(col, .3)], [.5, col], [1, dim(col, .4)]], ink: 1.8, inkA: .5 });
      for (let x = 140; x < w; x += 420) { wash(g, box(x, py - pr - 4, 18, pr * 2 + 8), dim(col, .2), { seed: 4280 + x + py, gran: .3, rim: .3, ink: 1.6, inkA: .5 }); wash(g, box(x + 4, py - pr - 30, 10, 28), '#3a3430', { seed: 4290 + x + py, gran: .2, rim: 0, amt: .3 }); }
    }
    // a pipe coming down the wall, with a valve wheel
    const px = 820;
    shadow(g, box(px + 10, CE + 60, 30, B - CE - 60), .35, 10);
    wash(g, box(px - 13, CE + 58, 26, B - CE - 58), '#6a7270', { seed: 4300, gran: .4, rim: .4, blooms: 3, grad: [[0, '#8a9290'], [.45, '#6a7270'], [1, '#3a4240']], dir: [[px - 13, 0], [px + 13, 0]], ink: 1.8, inkA: .5 });
    for (const yy of [CE + 160, 900, 1160]) wash(g, box(px - 18, yy, 36, 16), '#4a5250', { seed: 4301 + yy, gran: .3, rim: .3, ink: 1.6, inkA: .5 });
    const vwx = px, vwy = 1000;
    wash(g, ellipse(vwx, vwy, 34, 34, 0, 40), '#a04a34', { seed: 4305, gran: .4, rim: .5, blooms: 1, ink: 2.2, inkA: .6 });
    wash(g, ellipse(vwx, vwy, 22, 22, 0, 30), '#5a4a40', { seed: 4306, gran: .3, rim: .3, amt: .3 });
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + .4; inkLine(g, [[vwx, vwy], [vwx + Math.cos(a) * 30, vwy + Math.sin(a) * 30]], { w: 4, a: .7, seed: 4307 + i, col: '#6a2a1a' }); }

    // ---- the poster: a strongman, only a picture, pasted up and curling
    posterOn(g, 90, 690, 240, 320);

    // ---- hooks: a skipping rope, and a pair of old boxing gloves
    for (const [hx, hy] of [[690, 830], [1730, 850]]) wash(g, ellipse(hx, hy, 7, 7, 0, 14), '#3a3430', { seed: 4320 + hx, gran: .2, rim: 0, ink: 1.4 });
    inkLine(g, spline([[690, 830], [662, 920], [680, 1040], [700, 1050], [714, 940], [690, 830]], false, 10), { w: 4, a: .75, seed: 4322, col: '#6a4a2a', gap: 0 });
    for (const [gx, gy, gr, s] of [[1710, 910, -.2, 4325], [1758, 922, .25, 4326]]) {
      shadow(g, ellipse(gx + 10, gy + 14, 30, 38, gr, 30), .4, 8);
      wash(g, ellipse(gx, gy, 28, 38, gr, 30), '#7a4a2a', { seed: s, gran: .5, rim: .5, blooms: 1, ink: 2, inkA: .55, grad: [[0, '#9a6640'], [1, '#5a3218']] });
      wash(g, box(gx - 16, gy + 30, 32, 18), '#d8c8a8', { seed: s + 2, gran: .3, rim: .3, amt: .4, ink: 1.4, inkA: .45 });
    }
    inkLine(g, [[1730, 850], [1710, 874]], { w: 2, a: .7, seed: 4327 }); inkLine(g, [[1730, 850], [1758, 886]], { w: 2, a: .7, seed: 4328 });

    // ---- the floor strip behind the mat: boards running toward us, worn pale where feet go
    const fl = [[0, B], [w, B], [w, F], [0, F]];
    wash(g, fl, '#7a5436', { seed: 4340, grad: [[0, '#4a3020'], [1, '#86603e']], gran: .6, rim: .1, blooms: 8, amt: 0 });
    for (let x = -1800; x < w + 1800; x += 92) { const xa = x, xb = persp(x, B, F); inkLine(g, [[xa, B], [xb, F]], { w: 2, a: .4, seed: 4341 + x, col: '#3a2414', gap: .02 }); }
    streaks(g, fl, '#7a5436', { seed: 4342, ang: Math.PI / 2, len: 120, n: 500, a: .1, w: 1.4 });
    glaze(g, blob(1360, 1395, 560, 70, 4343), '#f0c890', .3, 'screen', 30);
    // chalk dust on the boards in front of the alcove
    dabs(g, blob(1360, 1400, 300, 40, 4344), ['#f4ead4', '#e8dcc4'], { seed: 4345, n: 90, r: 6, a: .22 });
    // the skirting, and the wall's foot in shadow
    wash(g, box(0, B - 26, w, 26), '#5a3a26', { seed: 4350, gran: .4, rim: .3, blooms: 4, grad: [[0, '#7a5236'], [1, '#3a2416']], ink: 1.6, inkA: .4 });
    ao(g, 0, B, w, B, 34, .5);

    // ---- against the wall, left: a bench with a towel, a bucket of chalk
    benchAt(g, 70, B, 300);
    // ---- right: the rack of dumbbells, Indian clubs, a medicine ball, the punch bag
    rackAt(g, 1790, B, 300);
    for (const [cx, rot, s] of [[2136, -.06, 4400], [2170, .05, 4401], [2206, .1, 4402]]) clubAt(g, cx, B - 2, rot, s);
    shadow(g, ellipse(2300, B + 8, 70, 14, 0, 30), .45, 8);
    wash(g, ellipse(2290, B - 52, 56, 56, 0, 40), '#6a4428', { seed: 4405, gran: .6, rim: .5, blooms: 2, ink: 2.2, inkA: .55, grad: [[0, '#9a6a40'], [1, '#4a2a16']], dir: [[2240, B - 100], [2340, B]] });
    inkLine(g, [[2240, B - 60], [2290, B - 50], [2344, B - 62]], { w: 2, a: .5, seed: 4406, col: '#3a2010' });
    bagAt(g, 2310, CE + 30, B - 300);
    // a stand with a bowl of chalk by the alcove
    standAt(g, 1712, B);

    // ---- the light: three bare bulbs, a warm pool on the alcove, darkness gathering
    for (const [bx, by] of G.bulbs) inkLine(g, [[bx, CE + 30], [bx, by - 26]], { w: 3, a: .9, gap: 0, col: '#1a1210' });
    // darkness everywhere, with pools cut out of it under each bulb and the window: the light map
    const shade = document.createElement('canvas'); shade.width = w; shade.height = F; const sg2 = shade.getContext('2d');
    sg2.fillStyle = '#2c2034'; sg2.fillRect(0, 0, w, F);
    sg2.globalCompositeOperation = 'destination-out';
    for (const [px2, py2, rx, ry, a] of [[1360, 1080, 640, 560, .97], [1360, 1380, 760, 160, .7], [560, 1020, 420, 420, .86], [560, 1370, 380, 110, .55], [2050, 1020, 400, 420, .82], [2050, 1370, 360, 110, .5], [1360, 610, 340, 200, .45]]) {
      sg2.save(); sg2.translate(px2, py2); sg2.scale(1, ry / rx);
      const gr = sg2.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(.55, `rgba(0,0,0,${a * .7})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      sg2.fillStyle = gr; sg2.beginPath(); sg2.arc(0, 0, rx, 0, TAU); sg2.fill(); sg2.restore();
    }
    g.save(); g.globalCompositeOperation = 'multiply'; g.drawImage(shade, 0, 0); g.restore();
    // cool in the far shadows, warm in the light
    g.save(); g.globalCompositeOperation = 'multiply'; const cool = g.createRadialGradient(1360, 1060, 400, 1360, 1060, 1500); cool.addColorStop(0, 'rgba(255,255,255,1)'); cool.addColorStop(1, 'rgba(150,150,200,1)'); g.fillStyle = cool; g.fillRect(0, 0, w, F); g.restore();
    for (const [bx, by] of G.bulbs) {
      const main = bx === 1360;
      light(g, bx, by + 160, main ? 520 : 320, '#ffb860', main ? .32 : .24);
      light(g, bx, by + 6, main ? 170 : 120, '#fff0c8', .5);
      light(g, bx, B + 50, main ? 520 : 300, '#ffc070', main ? .3 : .2, main ? 110 : 70);
    }
    // the bulbs themselves
    for (const [bx, by] of G.bulbs) {
      wash(g, box(bx - 9, by - 30, 18, 18), '#3a3430', { seed: 4420 + bx, gran: .2, rim: .3, amt: .2, ink: 1.4, inkA: .6 });
      wash(g, ellipse(bx, by, 17, 21, 0, 30), '#fff4d0', { seed: 4421 + bx, gran: 0, rim: .2, blooms: 0, amt: .2 });
      light(g, bx, by, 60, '#ffffff', .8);
      inkLine(g, [[bx - 6, by + 2], [bx - 2, by - 8], [bx + 2, by + 2], [bx + 6, by - 8]], { w: 1.6, a: .6, seed: 4422 + bx, col: '#a06a20', gap: 0 });
    }

    // ---- the mat: dark green rubber from the floor line to us, its seams running to the eye
    const mat = [[0, F], [w, F], [w, h], [0, h]];
    wash(g, mat, '#1e3428', { seed: 4450, grad: [[0, '#2e4c3a'], [.08, '#22392c'], [.4, '#14241c'], [1, '#0a120e']], gran: .5, rim: 0, blooms: 10, amt: 0, bloom: .35 });
    for (let x = -3000; x < w + 3000; x += 300) { const xb = persp(x, F, h); inkLine(g, [[x, F], [xb, h]], { w: 2.4, a: .35, seed: 4451 + x, col: '#08100c', gap: 0 }); }
    for (const yy of [F + 92, F + 260, F + 560]) inkLine(g, [[0, yy], [w, yy]], { w: 2.2, a: .28, seed: 4460 + yy, col: '#08100c', gap: .02 });
    // the mat's thick far edge, catching the light
    wash(g, box(0, F - 2, w, 16), '#3e6048', { seed: 4470, grad: [[0, '#5e8466'], [1, '#2a4232']], gran: .4, rim: 0, blooms: 4, amt: .6 });
    inkLine(g, [[0, F - 2], [w, F - 2]], { w: 2.2, a: .55, seed: 4471, col: '#14100c', gap: .01 });
    light(g, 1360, F + 30, 620, '#ffcf8a', .16, 70);
    ao(g, 0, F + 14, w, F + 14, 60, .45, '#050806');
    paper(g, w, h, .42);
  });
}

// A strongman on a curling poster: a moustache, a leopard leotard, a barbell on his shoulders.
function posterOn(g, x, y, pw, ph) {
  shadow(g, box(x + 14, y + 16, pw, ph), .45, 14);
  const P = [[x, y], [x + pw, y + 6], [x + pw - 4, y + ph], [x + 30, y + ph], [x + 4, y + ph - 24]];
  wash(g, P, '#e6d2a4', { seed: 4500, gran: .7, rim: .6, blooms: 5, ink: 2, inkA: .45, grad: [[0, '#efe0b8'], [1, '#c8ae7c']] });
  // the curled corner
  wash(g, [[x + 4, y + ph - 24], [x + 30, y + ph], [x + 22, y + ph - 30]], '#b89a68', { seed: 4501, gran: .4, rim: .3, amt: .3, ink: 1.4, inkA: .5 });
  // a border, printed in red-brown
  inkLine(g, [[x + 16, y + 18], [x + pw - 16, y + 22], [x + pw - 18, y + ph - 18], [x + 16, y + ph - 22]].concat([[x + 16, y + 18]]), { w: 3, a: .55, seed: 4502, col: '#8a3a26', gap: 0 });
  const cx = x + pw / 2, cy = y + ph * .52, s = pw / 250;
  // the barbell across his shoulders
  inkLine(g, [[cx - 110 * s, cy - 70 * s], [cx + 110 * s, cy - 70 * s]], { w: 5 * s, a: .9, seed: 4503, col: '#2a1a14', gap: 0 });
  for (const d of [-1, 1]) wash(g, ellipse(cx + d * 104 * s, cy - 70 * s, 26 * s, 26 * s, 0, 30), '#2a2420', { seed: 4504 + d, gran: .3, rim: .3, amt: .3 });
  // legs, leotard, chest, arms up to the bar, the head with its moustache
  for (const d of [-1, 1]) wash(g, [[cx + d * 14 * s, cy + 50 * s], [cx + d * 36 * s, cy + 50 * s], [cx + d * 40 * s, cy + 128 * s], [cx + d * 18 * s, cy + 128 * s]], '#e8b48a', { seed: 4506 + d, gran: .3, rim: .3, amt: .4, ink: 1.4, inkA: .5 });
  wash(g, [[cx - 46 * s, cy - 40 * s], [cx + 46 * s, cy - 40 * s], [cx + 40 * s, cy + 56 * s], [cx - 40 * s, cy + 56 * s]], '#d8a050', { seed: 4508, gran: .4, rim: .4, ink: 1.6, inkA: .55 });
  dabs(g, [[cx - 46 * s, cy - 40 * s], [cx + 46 * s, cy - 40 * s], [cx + 40 * s, cy + 56 * s], [cx - 40 * s, cy + 56 * s]], ['#4a2a14'], { seed: 4509, n: 26, r: 5 * s, a: .7 });
  for (const d of [-1, 1]) { wash(g, ellipse(cx + d * 66 * s, cy - 50 * s, 22 * s, 30 * s, d * .5, 24), '#e8b48a', { seed: 4510 + d, gran: .3, rim: .3, ink: 1.4, inkA: .5 }); wash(g, ellipse(cx + d * 92 * s, cy - 76 * s, 13 * s, 14 * s, 0, 18), '#f4ead8', { seed: 4512 + d, gran: .2, rim: .2, ink: 1.2, inkA: .5 }); }
  wash(g, ellipse(cx, cy - 76 * s, 26 * s, 30 * s, 0, 30), '#e8b48a', { seed: 4514, gran: .3, rim: .3, ink: 1.6, inkA: .55 });
  wash(g, ellipse(cx, cy - 98 * s, 24 * s, 12 * s, 0, 24), '#2a1a14', { seed: 4515, gran: .2, rim: .2, amt: .3 });
  inkLine(g, spline([[cx - 34 * s, cy - 76 * s], [cx - 14 * s, cy - 66 * s], [cx, cy - 70 * s], [cx + 14 * s, cy - 66 * s], [cx + 34 * s, cy - 76 * s]], false, 6), { w: 5 * s, a: .85, seed: 4516, col: '#2a1a14', gap: 0 });
  // a star burst behind him, faded
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; inkLine(g, [[cx + Math.cos(a) * 120 * s, cy - 20 * s + Math.sin(a) * 140 * s], [cx + Math.cos(a) * 100 * s, cy - 20 * s + Math.sin(a) * 118 * s]], { w: 4 * s, a: .3, seed: 4520 + i, col: '#a8542e', gap: 0 }); }
  // two drawing pins
  for (const [tx, ty] of [[x + 14, y + 12], [x + pw - 14, y + 16]]) wash(g, ellipse(tx, ty, 7, 7, 0, 14), '#b8402e', { seed: 4530 + tx, gran: .2, rim: .3, ink: 1.4, inkA: .6 });
}

function benchAt(g, x, B, bw) {
  shadow(g, box(x + 10, B - 8, bw, 20), .45, 10);
  for (const lx of [x + 24, x + bw - 46]) wash(g, box(lx, B - 120, 22, 120), '#5a3a22', { seed: 4600 + lx, gran: .4, rim: .4, ink: 1.6, inkA: .5 });
  wash(g, box(x, B - 140, bw, 26), '#8a5a36', { seed: 4602, gran: .6, rim: .4, blooms: 2, ink: 2, inkA: .55, grad: [[0, '#a8744a'], [1, '#6a4428']] });
  // a towel slung over it
  wash(g, spline([[x + 120, B - 150], [x + 200, B - 156], [x + 214, B - 120], [x + 206, B - 60], [x + 186, B - 66], [x + 176, B - 110], [x + 130, B - 112], [x + 116, B - 128]], true, 6), '#e8e0cc', { seed: 4603, gran: .5, rim: .5, blooms: 2, ink: 1.8, inkA: .5, grad: [[0, '#f4eee0'], [1, '#c8bca0']] });
  for (const yy of [B - 96, B - 84]) inkLine(g, [[x + 184, yy], [x + 210, yy - 2]], { w: 2.4, a: .5, col: '#5a7a8a', seed: 4604 + yy });
  // a bucket of chalk
  const kx = x + bw + 40;
  shadow(g, ellipse(kx + 8, B + 4, 50, 10, 0, 24), .4, 6);
  wash(g, [[kx - 44, B - 84], [kx + 44, B - 84], [kx + 36, B], [kx - 36, B]], '#8a908c', { seed: 4606, gran: .5, rim: .5, ink: 2, inkA: .55, grad: [[0, '#a8aeaa'], [1, '#5a605c']], dir: [[kx - 44, 0], [kx + 44, 0]] });
  wash(g, ellipse(kx, B - 84, 44, 10, 0, 30), '#f2ece0', { seed: 4607, gran: .2, rim: .3, amt: .3, ink: 1.6, inkA: .5 });
  inkLine(g, spline([[kx - 40, B - 84], [kx, B - 130], [kx + 40, B - 84]], false, 8), { w: 3, a: .7, seed: 4608, col: '#3a3430', gap: 0 });
}
// A two-tier rack of round dumbbells, iron balls on short bars.
function rackAt(g, x, B, rw) {
  shadow(g, box(x + 12, B - 8, rw, 18), .5, 10);
  for (const lx of [x, x + rw - 18]) wash(g, box(lx, B - 300, 18, 300), '#5a3a22', { seed: 4620 + lx, gran: .5, rim: .4, ink: 1.8, inkA: .55 });
  for (const sy of [B - 170, B - 40]) wash(g, box(x - 10, sy, rw + 20, 18), '#7a5032', { seed: 4622 + sy, gran: .5, rim: .4, blooms: 1, ink: 1.8, inkA: .55, grad: [[0, '#9a6a44'], [1, '#5a3a22']] });
  const R = rng(4630);
  for (const [sy, n, r] of [[B - 170, 3, 30], [B - 40, 3, 38]]) for (let i = 0; i < n; i++) {
    const cx = x + rw * (i + .5) / n, cy = sy - r;
    shadow(g, ellipse(cx + 6, sy + 2, r * 1.6, 8, 0, 24), .4, 5);
    wash(g, box(cx - r * 1.1, cy - 5, r * 2.2, 10), '#3a3a38', { seed: 4631 + i + sy, gran: .2, rim: .2, amt: .3 });
    for (const d of [-1, 1]) {
      const bx = cx + d * r * .95;
      wash(g, ellipse(bx, cy, r * .62, r * .62, 0, 26), '#2a2826', { seed: 4640 + i * 3 + d + sy, gran: .5, rim: .4, blooms: 1, ink: 1.8, inkA: .6, grad: [[0, '#5a5650'], [.5, '#2a2826'], [1, '#141210']], dir: [[bx - r * .6, cy - r * .6], [bx + r * .6, cy + r * .6]] });
      light(g, bx - r * .22, cy - r * .24, r * .26, '#e8d8c0', .3 + R() * .1);
    }
  }
}
function clubAt(g, cx, B, rot, s) {
  const P = spline([[-8, 0], [-14, -40], [-24, -110], [-20, -150], [-8, -170], [-9, -196], [-14, -210], [0, -222], [14, -210], [9, -196], [8, -170], [20, -150], [24, -110], [14, -40], [8, 0]], true, 4).map(([px, py]) => [cx + px * Math.cos(rot) - py * Math.sin(rot), B + px * Math.sin(rot) + py * Math.cos(rot)]);
  shadow(g, P.map(([px, py]) => [px + 14, py + 6]), .35, 8);
  wash(g, P, '#b0784a', { seed: s, gran: .5, rim: .5, blooms: 1, ink: 2, inkA: .55, grad: [[0, '#d4a070'], [.5, '#a8703e'], [1, '#6a4020']], dir: [[cx - 24, 0], [cx + 24, 0]] });
  const band = (y0) => [[cx - 22 + y0 * Math.sin(rot), B + y0], [cx + 22 + y0 * Math.sin(rot), B + y0], [cx + 22 + (y0 - 10) * Math.sin(rot), B + y0 - 10], [cx - 22 + (y0 - 10) * Math.sin(rot), B + y0 - 10]];
  g.save(); path(g, P); g.clip(); wash(g, band(-120), '#2a5a5a', { seed: s + 1, gran: .2, rim: 0, amt: .3 }); wash(g, band(-140), '#2a5a5a', { seed: s + 2, gran: .2, rim: 0, amt: .3 }); g.restore();
}
function bagAt(g, x, top, bottom) {
  inkLine(g, [[x, top], [x, top + 120]], { w: 4, a: .9, gap: 0, col: '#2a2420' });
  for (let i = 0; i < 6; i++) { const yy = top + 10 + i * 20; inkLine(g, ellipse(x, yy, 6, 9, 0, 10).concat([ellipse(x, yy, 6, 9, 0, 10)[0]]), { w: 2.4, a: .8, seed: 4660 + i, col: '#3a3430', gap: 0 }); }
  const by0 = top + 130, P = spline([[x - 64, by0 + 20], [x - 70, by0 + 160], [x - 66, bottom - 60], [x - 40, bottom], [x + 40, bottom], [x + 66, bottom - 60], [x + 70, by0 + 160], [x + 64, by0 + 20], [x, by0]], true, 6);
  shadow(g, P.map(([px, py]) => [px + 24, py + 16]), .4, 14);
  wash(g, P, '#7a4a2a', { seed: 4670, gran: .6, rim: .5, blooms: 3, ink: 2.4, inkA: .6, grad: [[0, '#a06a40'], [.5, '#7a4a2a'], [1, '#3a2010']], dir: [[x - 70, 0], [x + 70, 0]] });
  for (const yy of [by0 + 60, bottom - 80]) inkLine(g, [[x - 66, yy], [x, yy + 10], [x + 66, yy]], { w: 2.4, a: .5, seed: 4671 + yy, col: '#2a1408' });
  for (let yy = by0 + 90; yy < bottom - 100; yy += 22) inkLine(g, [[x - 2, yy], [x + 2, yy + 12]], { w: 2, a: .45, seed: 4673 + yy, col: '#e8d0a0' });
}
function standAt(g, x, B) {
  shadow(g, ellipse(x + 10, B + 4, 50, 10, 0, 24), .4, 6);
  wash(g, box(x - 7, B - 210, 14, 210), '#5a3a22', { seed: 4680, gran: .4, rim: .3, ink: 1.6, inkA: .55 });
  wash(g, ellipse(x, B - 6, 40, 9, 0, 24), '#4a2e1a', { seed: 4681, gran: .3, rim: .3, ink: 1.4, inkA: .55 });
  wash(g, spline([[x - 52, B - 222], [x + 52, B - 222], [x + 34, B - 196], [x - 34, B - 196]], true, 4), '#9aa09a', { seed: 4682, gran: .4, rim: .4, ink: 1.8, inkA: .55, grad: [[0, '#b8beb8'], [1, '#6a706a']] });
  wash(g, ellipse(x, B - 224, 50, 10, 0, 30), '#f6f0e4', { seed: 4683, gran: .2, rim: .2, amt: .3 });
  dabs(g, blob(x, B - 236, 46, 14, 4684), ['#ffffff', '#f2ece0'], { seed: 4685, n: 30, r: 6, a: .4 });
}

// ---------------------------------------------------------------- the street, cut away
// A terrace of houses with their basements opened up in a row like a doll's house: a lifter in each
// room. ST.rooms gives each room's centre; the floor line is the basements' floor.
export const ST = { w: 3600, h: 3200, floor: 1840, ground: 1240, rooms: [], roomW: 560 };
for (let i = 0; i < 6; i++) ST.rooms.push(400 + i * 560 + 280);   // room centres; Mabel's is ST.rooms[2]
export function street() {
  return bake('street-v2', ST.w, ST.h, (g, w, h) => {
    const F = ST.floor, GR = ST.ground, RW = ST.roomW, R = rng(4800);
    const roofY = 400;
    // sky: a pale afternoon
    wash(g, box(0, 0, w, GR), '#cfdcd6', { seed: 4801, grad: [[0, '#a8c0c8'], [1, '#e8ecdc']], gran: .4, rim: 0, blooms: 12, amt: 0 });
    // the terrace: a house over each room, each its own brick and paint
    const houseCols = ['#b46a4c', '#c28a5c', '#9a5a44', '#b87a56', '#a86448', '#c49468'];
    for (let i = 0; i < 6; i++) {
      const cx = ST.rooms[i], x0 = cx - RW / 2, x1 = cx + RW / 2, col = houseCols[i];
      const top = roofY + (i % 2) * 40;
      wash(g, box(x0, top, RW, GR - top), col, { seed: 4810 + i, gran: .7, rim: .3, blooms: 6, amt: .4, grad: [[0, mix(col, '#ffffff', .1)], [1, mix(col, '#2a1a10', .15)]] });
      for (let yy = top + 30; yy < GR; yy += 26) inkLine(g, [[x0, yy], [x1, yy]], { w: 1.4, a: .14, seed: 4820 + i * 40 + yy, col: '#f0dcc0', gap: .2 });
      // a cornice and a chimney
      wash(g, box(x0 - 6, top - 18, RW + 12, 24), '#e2d4b4', { seed: 4830 + i, gran: .4, rim: .3, ink: 1.6, inkA: .4 });
      wash(g, box(cx + (i % 2 ? -150 : 120), top - 90, 60, 74), mix(col, '#2a1a10', .2), { seed: 4835 + i, gran: .5, rim: .3, ink: 1.6, inkA: .4 });
      // two tall windows, lit, and a door with steps on alternate houses
      for (const wxo of i % 2 ? [-150, 60] : [-180, 90]) {
        const wx = cx + wxo, wy = top + 120;
        wash(g, box(wx - 8, wy - 8, 116, 236), '#efe4c8', { seed: 4840 + i * 7 + wxo, gran: .3, rim: .3, ink: 1.6, inkA: .45 });
        wash(g, box(wx, wy, 100, 220), '#3a4658', { seed: 4842 + i * 7 + wxo, grad: [[0, '#5a6a80'], [1, '#2a3444']], gran: .4, rim: 0, amt: .3 });
        inkLine(g, [[wx + 50, wy], [wx + 50, wy + 220]], { w: 4, a: .7, col: '#efe4c8', seed: 4843 + i }); inkLine(g, [[wx, wy + 110], [wx + 100, wy + 110]], { w: 4, a: .7, col: '#efe4c8', seed: 4844 + i });
        light(g, wx + 30, wy + 40, 40, '#ffffff', .25);
        const lwy = wy + 300;
        if (lwy + 220 < GR - 40) {
          wash(g, box(wx - 8, lwy - 8, 116, 236), '#efe4c8', { seed: 4845 + i * 7 + wxo, gran: .3, rim: .3, ink: 1.6, inkA: .45 });
          wash(g, box(wx, lwy, 100, 220), '#3a4658', { seed: 4846 + i * 7 + wxo, grad: [[0, '#5a6a80'], [1, '#2a3444']], gran: .4, rim: 0, amt: .3 });
          inkLine(g, [[wx + 50, lwy], [wx + 50, lwy + 220]], { w: 4, a: .7, col: '#efe4c8', seed: 4847 + i });
        }
      }
      if (i % 2 === 0) {
        const dx = cx - 30;
        wash(g, box(dx - 50, GR - 250, 100, 230), '#2f4a44', { seed: 4850 + i, gran: .4, rim: .4, blooms: 1, ink: 2, inkA: .5, grad: [[0, '#3f6058'], [1, '#22342e']] });
        wash(g, box(dx - 62, GR - 270, 124, 20), '#e8dcbc', { seed: 4851 + i, gran: .3, rim: .3, amt: .3, ink: 1.4, inkA: .4 });
        for (let k = 0; k < 3; k++) wash(g, box(dx - 70 - k * 10, GR - 46 + k * 8, 140 + k * 20, 9), '#d8d0c0', { seed: 4852 + i + k, gran: .3, rim: .3, amt: .3, ink: 1.2, inkA: .35 });
      }
    }
    // the pavement: a band of flags and the kerb, seen from the side, its edge the ground line
    wash(g, box(0, GR - 22, w, 70), '#a8a69a', { seed: 4870, grad: [[0, '#c8c6ba'], [1, '#8a887c']], gran: .6, rim: .2, blooms: 6, amt: 0 });
    for (let x = 60; x < w; x += 160) inkLine(g, [[x, GR - 22], [x - 4, GR + 48]], { w: 2, a: .35, seed: 4871 + x, col: '#4a4a40' });
    inkLine(g, [[0, GR - 22], [w, GR - 22]], { w: 2.4, a: .6, seed: 4872, col: '#3a3830', gap: .01 });
    // railings along the pavement's edge, over the basements' areas
    for (let x = 10; x < w; x += 30) inkLine(g, [[x, GR - 22], [x, GR - 150]], { w: 4, a: .75, seed: 4873 + x, col: '#2a2826', gap: 0 });
    inkLine(g, [[0, GR - 140], [w, GR - 140]], { w: 5, a: .8, seed: 4874, col: '#2a2826', gap: 0 });
    for (let x = 10; x < w; x += 30) wash(g, [[x - 5, GR - 150], [x, GR - 166], [x + 5, GR - 150]], '#2a2826', { seed: 4875 + x, gran: .1, rim: 0, amt: .2, blooms: 0 });
    // a lamp post
    for (const lx of [ST.rooms[1] + 280, ST.rooms[4] + 280]) {
      wash(g, box(lx - 8, GR - 520, 16, 500), '#2a3230', { seed: 4880 + lx, gran: .3, rim: .3, ink: 1.6, inkA: .5 });
      wash(g, [[lx - 34, GR - 600], [lx + 34, GR - 600], [lx + 22, GR - 520], [lx - 22, GR - 520]], '#f0e2b0', { seed: 4881 + lx, gran: .2, rim: .3, ink: 2, inkA: .55 });
      wash(g, [[lx - 40, GR - 600], [lx, GR - 630], [lx + 40, GR - 600]], '#2a3230', { seed: 4882 + lx, gran: .2, rim: .3, amt: .3 });
    }
    // the ground cut away: earth and the foundations around each room
    wash(g, box(0, GR + 48, w, h - GR - 48), '#4a3020', { seed: 4890, grad: [[0, '#5a3a24'], [.3, '#3a2416'], [1, '#140a06']], gran: .7, rim: 0, blooms: 20, amt: 0 });
    dabs(g, box(0, GR + 48, w, h - GR - 48), ['#6a4a30', '#2a180c', '#7a5a3a'], { seed: 4891, n: 900, r: 7, a: .3 });
    // each basement, lit, with its own bulb; brick walls between them
    for (let i = 0; i < 6; i++) {
      const cx = ST.rooms[i], x0 = cx - RW / 2 + 34, x1 = cx + RW / 2 - 34, y0 = GR + 70, y1 = F;
      const room = box(x0, y0, x1 - x0, y1 - y0);
      shadow(g, room.map(([x, y]) => [x + 8, y + 10]), .6, 14, '#0a0402');
      const wallCol = ['#b8805a', '#c49a70', '#a87050', '#bc8c62', '#b07a54', '#c09068'][i];
      wash(g, room, wallCol, { seed: 4900 + i, gran: .6, rim: .2, blooms: 5, amt: .4, grad: [[0, mix(wallCol, '#2a1a10', .35)], [.6, wallCol], [1, mix(wallCol, '#2a1a10', .2)]] });
      // the room's floor
      wash(g, box(x0, y1 - 40, x1 - x0, 40), '#7a5a3a', { seed: 4910 + i, gran: .5, rim: .2, blooms: 1, amt: .3, grad: [[0, '#5a3a24'], [1, '#9a7450']] });
      // its little window high on the street side, with the pavement's light
      wash(g, box(cx + 60, y0 + 8, 150, 50), '#c9d6d2', { seed: 4915 + i, gran: .3, rim: .2, ink: 1.6, inkA: .55, grad: [[0, '#e8eee4'], [1, '#9fb0ac']] });
      for (let k = 1; k < 3; k++) inkLine(g, [[cx + 60 + k * 50, y0 + 8], [cx + 60 + k * 50, y0 + 58]], { w: 3, a: .6, seed: 4916 + i + k, col: '#3a3430', gap: 0 });
      // the bulb and its pool
      inkLine(g, [[cx - 40, y0], [cx - 40, y0 + 90]], { w: 2.4, a: .8, gap: 0, col: '#1a1210' });
      light(g, cx - 40, y0 + 210, 300, '#ffc878', .45);
      wash(g, ellipse(cx - 40, y0 + 100, 11, 13, 0, 20), '#fff4d0', { seed: 4920 + i, gran: 0, rim: .2, amt: .2 });
      light(g, cx - 40, y0 + 100, 50, '#ffffff', .7);
    }
    // the section's cut edge: a dark line round each room
    for (let i = 0; i < 6; i++) { const cx = ST.rooms[i], x0 = cx - RW / 2 + 34, x1 = cx + RW / 2 - 34; inkLine(g, [[x0, GR + 70], [x1, GR + 70], [x1, F], [x0, F], [x0, GR + 70]], { w: 3, a: .7, seed: 4930 + i, col: '#1a0c06', gap: 0 }); }
    // the earth under the floors stays dark: the lyric's apron
    g.save(); g.globalCompositeOperation = 'multiply'; const eg = g.createLinearGradient(0, F, 0, h); eg.addColorStop(0, 'rgba(120,100,90,1)'); eg.addColorStop(.25, 'rgba(60,46,40,1)'); eg.addColorStop(1, 'rgba(30,22,20,1)'); g.fillStyle = eg; g.fillRect(0, F, w, h - F); g.restore();
    paper(g, w, h, .42);
  });
}

// ---------------------------------------------------------------- the gym, live
// The baked gym under a camera, then what moves in it: feet passing the window, the bulbs'
// breathing glow, and the net: the socket, the router (o.net 0..1) and its plug (o.plug: 'in',
// 'floor', or {at: [x, y], ang} when someone holds it). o.spark: 0..1 a burst at the socket.
export const PLUG = { s: .9, in: [626, 1268], floor: [712, 1420] };
export function gymSet(g, cam, t, o = {}) {
  // o.soft: a little depth of field on the painted room for very close shots (in master pixels)
  if (o.soft) g.filter = 'blur(' + (o.soft * g.canvas.width / W).toFixed(2) + 'px)';
  place(g, gym(), cam);
  g.filter = 'none';
  const d = now(), W0 = G.win;
  g.save(); g.beginPath(); g.rect(W0.x0, W0.y0, W0.x1 - W0.x0, W0.y1 - W0.y0); g.clip();
  g.globalAlpha = .78; passersBy(g, W0.x0, W0.y0, W0.x1, W0.y1, d); g.globalAlpha = 1;
  g.fillStyle = C('#3a3430');
  for (let i = 1; i < 4; i++) { const x = lerp(W0.x0, W0.x1, i / 4); g.fillRect(x - 4, W0.y0, 8, W0.y1 - W0.y0); }
  g.fillRect(W0.x0, (W0.y0 + W0.y1) / 2 - 3, W0.x1 - W0.x0, 6);
  g.restore();
  // the bulbs breathe a little
  g.save(); g.globalCompositeOperation = 'screen';
  G.bulbs.forEach(([bx, by], i) => {
    const f = .1 + noise(d * 3 + i * 7, 4990 + i) * .05;
    const gr = g.createRadialGradient(bx, by, 4, bx, by, 150); gr.addColorStop(0, rgba('#fff0c0', f + .1)); gr.addColorStop(1, rgba('#fff0c0', 0));
    g.fillStyle = gr; g.beginPath(); g.arc(bx, by, 150, 0, TAU); g.fill();
  });
  g.restore();
  if (o.net === undefined) return;
  const [sx, sy] = G.socket, [rx, ry] = G.router;
  socket(g, sx, sy, .8);
  router(g, rx, ry, .9, { t: d, on: o.net, waveR: o.waveR ?? 640 });
  const pl = o.plug || 'floor';
  const at = pl === 'in' ? PLUG.in : pl === 'floor' ? PLUG.floor : pl.at;
  const ang = pl === 'in' ? Math.PI : pl === 'floor' ? .3 : (pl.ang ?? -Math.PI / 2);
  plug(g, [rx + 30, ry + 40], at, ang, PLUG.s, { sag: pl === 'floor' ? 26 : pl === 'in' ? 70 : 60 });
  if (o.spark) sparks(g, sx + 8, sy, 70, o.spark, 4995);
}
