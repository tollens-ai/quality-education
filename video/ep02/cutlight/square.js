// The town square, for the end: all four places round it, in the late sun. Rosa's bakery, the
// clinic, Parkside Primary, and the marquee for Jess's wedding; bunting across it in the band's
// four colours; trees; the paving. Each front is drawn flat, in centimetres, on its own plane,
// and inked like the rest of the film: the same pen, on a page that's now in daylight. Warm ink
// outlines every shape; the shade sides are hatched.
import { W, H, clamp, lerp, mix, rgba, hash, noise } from './kit.js';
import { project } from './space.js';
import { onPlane } from './world.js';
import { BAND } from './palette.js';
import { hatch } from './ink.js';

export const DAYINK = '#2a201b';
// Plane units per screen pixel on the front being drawn, so the pen keeps its width on screen.
let PX = 1;
const reset = (L, k) => L.setTransform(k, 0, 0, k, 0, 0);
function pen(L, w = 1) { L.strokeStyle = DAYINK; L.lineWidth = 2.1 * PX * w; L.lineJoin = 'round'; L.lineCap = 'round'; }
function rr(L, x, y, w, h, r) { L.beginPath(); L.moveTo(x + r, y); L.arcTo(x + w, y, x + w, y + h, r); L.arcTo(x + w, y + h, x, y + h, r); L.arcTo(x, y + h, x, y, r); L.arcTo(x, y, x + w, y, r); L.closePath(); }
function box(L, x, y, w, h, fill, lw = 1) { L.fillStyle = fill; L.fillRect(x, y, w, h); pen(L, lw); L.strokeRect(x, y, w, h); }
function poly(L, pts, fill, lw = 1) { L.beginPath(); pts.forEach(([x, y], i) => i ? L.lineTo(x, y) : L.moveTo(x, y)); L.closePath(); if (fill) { L.fillStyle = fill; L.fill(); } if (lw) { pen(L, lw); L.stroke(); } }
// Hatching in the shade, at a pen's spacing on screen.
function shade(L, pts, tone, t, seed = 0, dir = [1, .9]) {
  hatch(L, pts, tone, { max: 12 * PX, min: 4.5 * PX, w: 1.05 * PX, col: rgba(DAYINK, .75), dir, t, seed });
}
// Text on a plane (y up): flip so it reads the right way round.
function planeText(L, s, x, y, font, fill, align = 'center') {
  L.save(); L.scale(1, -1); L.font = font; L.fillStyle = fill; L.textAlign = align; L.textBaseline = 'middle'; L.fillText(s, x, -y); L.restore();
}
// The late sun comes from the left: the right-hand third of a front is in shade, and each
// ledge throws a band of shade under it.
function sunOn(L, w, h, t, seed) {
  const g = L.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, 'rgba(255,214,150,.22)'); g.addColorStop(.62, 'rgba(255,214,150,0)'); g.addColorStop(1, 'rgba(60,40,70,.16)');
  L.fillStyle = g; L.fillRect(0, 0, w, h);
  shade(L, [[w * .72, 0], [w, 0], [w, h], [w * .8, h]], .38, t, seed);
  pen(L, 1.3); L.strokeRect(0, 0, w, h);
}

function bakery(L, t) {
  const w = 520, h = 640;
  box(L, 0, 0, w, h, '#2c5b4d', 1.3);
  box(L, -10, h - 40, w + 20, 40, '#1f3f36');
  // The sign: a board with a gold line round it and the name painted on.
  box(L, 30, 440, w - 60, 110, '#1f3f36');
  L.strokeStyle = '#d9b45c'; L.lineWidth = 5; L.strokeRect(42, 452, w - 84, 86);
  planeText(L, "Rosa's", w / 2, 505, '80px Hand', '#f3d27c');
  // The awning, striped, each stripe inked; its shadow on the wall below.
  shade(L, [[0, 300], [w, 300], [w, 350], [0, 350]], .5, t, 3, [1, .4]);
  for (let i = 0; i < 8; i++) poly(L, [[i * w / 8, 420], [(i + 1) * w / 8, 420], [(i + 1) * w / 8 + 8, 350], [i * w / 8 + 8, 350]], i % 2 ? '#f4e9d2' : '#b8412f', .8);
  for (let i = 0; i < 8; i++) { L.fillStyle = i % 2 ? '#f4e9d2' : '#b8412f'; L.beginPath(); L.arc(i * w / 8 + w / 16 + 8, 350, w / 16, Math.PI, 0, true); L.fill(); pen(L, .8); L.stroke(); }
  // The window of bread, and the door.
  const wg = L.createLinearGradient(0, 330, 0, 90); wg.addColorStop(0, '#ffe3a0'); wg.addColorStop(1, '#f0a955');
  L.fillStyle = wg; L.fillRect(30, 90, 330, 240); pen(L, 1.2); L.strokeRect(30, 90, 330, 240);
  pen(L, .8); L.beginPath(); L.moveTo(195, 90); L.lineTo(195, 330); L.moveTo(30, 210); L.lineTo(360, 210); L.stroke();
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) {
    const x = 62 + i * 52, y = 150 + r * 100;
    L.fillStyle = mix('#c98640', '#9c5a24', hash(i, r)); L.beginPath(); L.ellipse(x, y, 22, 14, 0, 0, Math.PI * 2); L.fill(); pen(L, .7); L.stroke();
    pen(L, .5); L.beginPath(); L.moveTo(x - 10, y + 4); L.lineTo(x - 2, y - 6); L.moveTo(x + 2, y + 5); L.lineTo(x + 10, y - 5); L.stroke();
  }
  box(L, 390, 0, 100, 320, '#1b3831', 1.2); box(L, 404, 150, 72, 120, '#f7d9a0', .9);
  L.fillStyle = '#d9b45c'; L.beginPath(); L.arc(470, 120, 5, 0, Math.PI * 2); L.fill();
  // The flower box.
  box(L, 30, 70, 330, 22, '#6b3a2a', .9);
  for (let i = 0; i < 14; i++) { L.fillStyle = ['#e0435f', '#f2c14e', '#ffffff'][i % 3]; L.beginPath(); L.arc(44 + i * 23, 96 + hash(i) * 8, 8, 0, Math.PI * 2); L.fill(); pen(L, .5); L.stroke(); }
  sunOn(L, w, h, t, 1);
}
function clinic(L, t) {
  const w = 480, h = 720;
  box(L, 0, 0, w, h, '#bfe3d6', 1.3);
  box(L, -8, h - 30, w + 16, 30, '#9fcfc0');
  for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) {
    const x = 40 + i * 145, y = 300 + r * 130;
    box(L, x, y, 110, 100, '#e9f6f3', 1);
    L.fillStyle = 'rgba(120,170,160,.5)'; for (let k = 0; k < 6; k++) L.fillRect(x, y + 10 + k * 15, 110, 3);
    shade(L, [[x, y + 70], [x + 110, y + 70], [x + 110, y + 100], [x, y + 100]], .3, t, 20 + i + r * 3);
    box(L, x - 6, y - 10, 122, 10, '#dff2ec', .7);
  }
  L.fillStyle = '#f7fbfa'; rr(L, 60, 190, w - 120, 90, 20); L.fill(); pen(L, 1); L.stroke();
  // The heart, and the name.
  L.fillStyle = '#ff7a9c'; L.beginPath(); const hx = 110, hy = 250; L.moveTo(hx, hy - 22); L.bezierCurveTo(hx - 40, hy + 8, hx - 14, hy + 38, hx, hy + 14); L.bezierCurveTo(hx + 14, hy + 38, hx + 40, hy + 8, hx, hy - 22); L.fill(); pen(L, .8); L.stroke();
  planeText(L, 'PARK LANE CLINIC', 280, 235, '800 30px Mono', '#2d5f55');
  box(L, 170, 0, 140, 180, '#8fc9ba', 1.1); box(L, 180, 0, 120, 170, '#e6fbff', .8);
  pen(L, .7); L.beginPath(); L.moveTo(240, 0); L.lineTo(240, 170); L.stroke();
  sunOn(L, w, h, t, 2);
}
function school(L, t) {
  const w = 600, h = 700;
  box(L, 0, 0, w, h, '#b5553d', 1.3);
  // Brick courses, and the odd brick picked out.
  L.strokeStyle = 'rgba(70,26,16,.35)'; L.lineWidth = 1.2 * PX;
  for (let y = 12; y < h; y += 24) { L.beginPath(); L.moveTo(0, y); L.lineTo(w, y); L.stroke(); }
  for (let y = 12, r = 0; y < h; y += 24, r++) for (let x = (r % 2) * 24; x < w; x += 48) if (hash(x, y) > .72) { L.beginPath(); L.moveTo(x, y); L.lineTo(x, y + 24); L.stroke(); }
  for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
    const x = 30 + i * 145, y = 250 + r * 200;
    box(L, x, y, 110, 150, '#e9f4f6', 1.1);
    box(L, x + 6, y + 6, 98, 138, '#86b9d3', .7);
    pen(L, .6); L.beginPath(); L.moveTo(x + 55, y + 6); L.lineTo(x + 55, y + 144); L.stroke();
    shade(L, [[x + 6, y + 110], [x + 104, y + 110], [x + 104, y + 144], [x + 6, y + 144]], .35, t, 30 + i + r * 4);
    // A child's painting in each window: a sun, a house.
    L.fillStyle = ['#f2c14e', '#e0435f', '#5fbf8f', '#8a5cf6'][(i + r) % 4]; L.beginPath(); L.arc(x + 40, y + 100, 18, 0, Math.PI * 2); L.fill(); pen(L, .6); L.stroke();
    box(L, x - 6, y - 12, 122, 12, '#d8c7b0', .7);
  }
  box(L, 40, 150, w - 80, 80, '#20444f', 1.1);
  planeText(L, 'PARKSIDE PRIMARY', w / 2, 190, '900 50px Stencil', '#f5e7b8');
  // The railings.
  L.strokeStyle = '#2f6b4b'; L.lineWidth = 8;
  for (let x = 10; x < w; x += 32) { L.beginPath(); L.moveTo(x, 0); L.lineTo(x, 130); L.stroke(); }
  L.fillStyle = '#2f6b4b'; L.fillRect(0, 110, w, 10); L.fillRect(0, 20, w, 10);
  pen(L, .6); for (let x = 10; x < w; x += 32) { L.beginPath(); L.moveTo(x + 4, 0); L.lineTo(x + 4, 130); L.stroke(); }
  sunOn(L, w, h, t, 3);
}
function marquee(L, t) {
  const w = 620, h = 560;
  // A white tent: peaked roof, scalloped valance, the flaps tied back, warm light inside.
  poly(L, [[0, 360], [w / 4, 520], [w / 2, 560], [w * .75, 520], [w, 360]], '#fbf6ec', 1.3);
  shade(L, [[w / 2, 560], [w * .75, 520], [w, 360], [w / 2, 360]], .3, t, 41, [1, -.5]);
  pen(L, .7); for (const x of [w / 4, w / 2, w * .75]) { L.beginPath(); L.moveTo(x, x === w / 2 ? 560 : 520); L.lineTo(x, 370); L.stroke(); }
  box(L, 0, 0, w, 370, '#fbf6ec', 1.3);
  box(L, 120, 0, w - 240, 300, '#ffe2a8', 1.1);
  for (let i = 0; i < 10; i++) { L.fillStyle = '#f0e6d4'; L.beginPath(); L.arc(i * w / 10 + w / 20, 362, w / 20, Math.PI, 0, true); L.fill(); pen(L, .8); L.stroke(); }
  poly(L, [[120, 300], [70, 160], [110, 0], [0, 0], [0, 300]], '#e8dcc6', 1);
  poly(L, [[w - 120, 300], [w - 70, 160], [w - 110, 0], [w, 0], [w, 300]], '#e8dcc6', 1);
  shade(L, [[w - 120, 300], [w - 70, 160], [w - 110, 0], [w, 0], [w, 300]], .4, t, 42);
  // Fairy lights round the door, twinkling.
  for (let i = 0; i < 22; i++) {
    const a = Math.PI * i / 21, x = w / 2 + Math.cos(a) * 210, y = 120 + Math.sin(a) * 210;
    const on = .6 + .4 * Math.sin(t * 3 + i * 1.7);
    const gl = L.createRadialGradient(x, y, 0, x, y, 16); gl.addColorStop(0, `rgba(255,236,170,${on})`); gl.addColorStop(1, 'rgba(255,220,150,0)');
    L.fillStyle = gl; L.beginPath(); L.arc(x, y, 16, 0, Math.PI * 2); L.fill();
  }
  // A round table inside, and flowers.
  L.fillStyle = '#fffaf2'; L.beginPath(); L.ellipse(w / 2, 90, 120, 26, 0, 0, Math.PI * 2); L.fill(); pen(L, .8); L.stroke();
  box(L, w / 2 - 120, 20, 240, 70, '#fffaf2', .8);
  L.fillStyle = '#d98a9a'; for (let i = 0; i < 5; i++) { L.beginPath(); L.arc(w / 2 - 40 + i * 20, 128 + (i % 2) * 10, 14, 0, Math.PI * 2); L.fill(); pen(L, .5); L.stroke(); }
  planeText(L, 'Jess & Sam', w / 2, 450, '56px Hand', '#b07a5a');
  pen(L, 1.3); L.beginPath(); L.moveTo(0, 0); L.lineTo(w, 0); L.stroke();
}

// A tree in the late sun: a trunk, and a crown of leaf clumps, each scalloped and inked, the
// ones away from the sun hatched.
function tree(L, t, s = 1) {
  poly(L, [[-14 * s, 0], [14 * s, 0], [9 * s, 300 * s], [-9 * s, 300 * s]], '#5a4030', 1.1);
  shade(L, [[2 * s, 0], [14 * s, 0], [9 * s, 300 * s], [2 * s, 300 * s]], .5, t, 50);
  const blobs = [[-40, 470, 110], [60, 460, 100], [-100, 320, 110], [100, 330, 115], [0, 380, 150]];
  for (let b = 0; b < blobs.length; b++) {
    const [x, y, r] = blobs[b];
    const sw = Math.sin(t * .8 + x) * 4;
    const cx = (x + sw) * s, cy = y * s, R = r * s;
    const pts = [];
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2;
      const k = 1 + (hash(i, b) - .5) * .12;
      pts.push([cx + Math.cos(a0) * R * k, cy + Math.sin(a0) * R * k], [cx + Math.cos(am) * R * 1.12 * k, cy + Math.sin(am) * R * 1.12 * k]);
    }
    const g = L.createRadialGradient(cx - R * .4, cy + R * .3, 0, cx, cy, R * 1.1);
    g.addColorStop(0, '#c2cc70'); g.addColorStop(.6, '#77985a'); g.addColorStop(1, '#46663f');
    L.fillStyle = g;
    L.beginPath(); L.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < pts.length; i += 2) { const m = pts[i + 1], e = pts[(i + 2) % pts.length]; L.quadraticCurveTo(m[0], m[1], e[0], e[1]); }
    L.closePath(); L.fill(); pen(L, 1); L.stroke();
    // The shade side of the clump, hatched; a few leaf strokes on the lit side.
    shade(L, [[cx, cy - R], [cx + R, cy - R], [cx + R, cy + R * .2], [cx, cy - R * .1]], .45, t, 60 + b);
    pen(L, .55);
    for (let i = 0; i < 5; i++) { const a = 2.2 + i * .3, lx = cx + Math.cos(a) * R * .55, ly = cy + Math.sin(a) * R * .55; L.beginPath(); L.arc(lx, ly, R * .12, .4, 2.6); L.stroke(); }
  }
}

// Clouds, as a pen draws them: puffs round a flat underside, outlined, the underside shaded.
export function inkClouds(L, c, t) {
  for (let i = 0; i < 7; i++) {
    const p = project(c, [(hash(i, 11) - .5) * 9000 + t * 14, 1300 + hash(i, 12) * 1900, -5600]);
    if (p.z < c.near) continue;
    const w = (700 + hash(i, 13) * 900) * p.s, h = w * .32;
    const x0 = p.x - w / 2, yb = p.y;
    L.save();
    L.beginPath(); L.moveTo(x0, yb);
    const n = 5 + Math.floor(hash(i, 14) * 3);
    for (let k = 0; k < n; k++) {
      const a = x0 + w * k / n, b = x0 + w * (k + 1) / n, pk = h * (.55 + hash(i, k) * .5) * Math.sin((k + .5) / n * Math.PI) + h * .25;
      L.bezierCurveTo(a, yb - pk * 1.05, b, yb - pk * 1.05, b, yb);
    }
    L.closePath();
    L.fillStyle = 'rgba(255,252,244,.96)'; L.fill();
    L.strokeStyle = rgba(DAYINK, .55); L.lineWidth = 1.6; L.stroke();
    L.clip();
    L.fillStyle = 'rgba(160,170,210,.28)'; L.fillRect(x0, yb - h * .3, w, h * .3);
    L.restore();
  }
}

// Draw the square as seen by camera c: the fronts round the back, trees, bunting.
export function square(L, c, t) {
  const k = L.getTransform().a;
  L.__k = k;
  const place = (x, z, draw) => { const s = onPlane(L, c, [x, 0, z]); PX = 1 / Math.max(.02, s); draw(L, t); reset(L, k); };
  // Far to near: the fronts, then the trees between them.
  place(-1500, -1500, clinic);
  place(-980, -1500, bakery);
  place(-420, -1520, school);
  place(220, -1500, marquee);
  place(860, -1500, bakery);
  for (const [x, z, s] of [[-1000, -1380, 1], [-440, -1400, .9], [200, -1380, 1.05], [860, -1400, .95]]) place(x, z, (L2, tt) => tree(L2, tt, s));
  // Bunting across the square, in the band's four colours, swagging and fluttering.
  const cols = [BAND.clawd.col, BAND.regex.col, BAND.cron.col, BAND.null.col];
  for (let s = 0; s < 3; s++) {
    const z = -1200 + s * 380, y0 = 520 - s * 20;
    const pts = [];
    for (let i = 0; i <= 40; i++) { const u = i / 40, x = lerp(-1600, 1600, u); pts.push([x, y0 - Math.sin(u * Math.PI) * 120, z]); }
    const pp = pts.map(p => project(c, p));
    if (pp.some(p => p.z < c.near)) continue;
    L.strokeStyle = rgba(DAYINK, .8); L.lineWidth = 1.5; L.beginPath(); pp.forEach((p, i) => i ? L.lineTo(p.x, p.y) : L.moveTo(p.x, p.y)); L.stroke();
    for (let i = 0; i < 40; i++) {
      const a = pp[i], b = pp[i + 1], s2 = a.s * 34;
      const fl = Math.sin(t * 6 + i * .9 + s) * .3;
      L.fillStyle = cols[(i + s) % 4];
      L.beginPath(); L.moveTo(a.x, a.y); L.lineTo(b.x, b.y); L.lineTo((a.x + b.x) / 2 + fl * s2, (a.y + b.y) / 2 + s2); L.closePath(); L.fill();
      L.strokeStyle = rgba(DAYINK, .85); L.lineWidth = Math.max(1, s2 * .05); L.lineJoin = 'round'; L.stroke();
    }
  }
}
