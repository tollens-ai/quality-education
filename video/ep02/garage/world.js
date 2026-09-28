// The world: ASYNC's garage. The band practises with the roller door shut; everything they know
// about their users comes in as notes pushed under it. At the end the door goes up and the users
// are standing right there, in daylight.
import { W, H, C, TAU, clamp, lerp, smooth, rr, circle, ellipse, poly, line, rnd, INK, rgba, mix, shade, noise1 } from './kit.js';
import { cut, marker, tape, pin, doodle, checker, field } from './zine.js';
import { letter } from './hand.js';

// Fairy lights along a sagging wire from (x1, y1) to (x2, y2): flat dots with a flat halo, some
// twinkling on the beat.
export function fairyLights(g, t, x1, y1, x2, y2, sag, n, o = {}) {
  g.save(); g.drop = null; g.border = null;
  g.strokeStyle = INK.col; g.lineWidth = 3;
  const at = p => [lerp(x1, x2, p), lerp(y1, y2, p) + Math.sin(p * Math.PI) * sag];
  g.beginPath(); for (let i = 0; i <= 30; i++) { const [x, y] = at(i / 30); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  const cols = o.cols || [C.yellow, C.pink, C.mint, C.lilac, C.orange];
  for (let i = 0; i < n; i++) {
    const [x, y] = at((i + .5) / n);
    const on = o.on ?? 1;
    const tw = on * (.6 + .4 * Math.max(0, Math.sin(t * 3.1 + i * 1.7)));
    const col = cols[i % cols.length];
    g.ink = INK.col; g.inkW = 2.4; g.fillStyle = on > .1 ? col : '#554a66';
    ellipse(g, x, y + 12, 8 * (o.s || 1), 11 * (o.s || 1)); g.fill();
    if (tw > .75) { g.ink = null; g.fillStyle = C.cream; circle(g, x - 2, y + 9, 2.6 * (o.s || 1)); g.fill(); }
  }
  g.restore();
}

// A guitar amp: a cabinet with grille cloth (marker cross-hatching) and a control strip.
export function amp(g, x, y, w, h, o = {}) {
  const k = w / 200;
  cut(g, () => rr(g, x - w / 2, y - h, w, h, 10 * k), '#2a2140', { drop: 10 * k, inkW: 3.4 });
  g.save(); g.drop = null; g.ink = null;
  g.fillStyle = '#4a3f60'; rr(g, x - w / 2 + 14 * k, y - h + 44 * k, w - 28 * k, h - 58 * k, 8 * k); g.fill();
  g.save(); rr(g, x - w / 2 + 14 * k, y - h + 44 * k, w - 28 * k, h - 58 * k, 8 * k); g.clip();
  g.strokeStyle = rgba('#8e80a8', .7); g.lineWidth = 2.2 * k;
  for (let i = -20; i < 20; i++) { line(g, x - w + i * 18 * k, y - h, x + i * 18 * k, y); g.stroke(); line(g, x + w - i * 18 * k, y - h, x - i * 18 * k, y); g.stroke(); }
  g.restore();
  g.fillStyle = C.cream; rr(g, x - w / 2 + 14 * k, y - h + 12 * k, w - 28 * k, 22 * k, 5 * k); g.fill();
  g.fillStyle = INK.col;
  for (let i = 0; i < 5; i++) { circle(g, x - w / 2 + 34 * k + i * 26 * k, y - h + 23 * k, 6 * k); g.fill(); }
  if (o.label) letter(g, o.label, x + w / 2 - 22 * k, y - h + 32 * k, 17 * k, { col: C.pink, w: .2, align: 'right', seed: 2 });
  g.restore();
}

// The roller door: slats of painted metal between two runners. open 0..1 rolls it up into the
// drum at the top, showing whatever `behind` draws.
export function rollerDoor(g, t, x0, y0, x1, y1, o = {}) {
  const open = clamp(o.open || 0);
  const col = o.col || '#5c6fb0';
  const hDoor = y1 - y0;
  const bottom = lerp(y1, y0 + 30, smooth(open));
  if (o.behind && open > 0) {
    g.save(); g.drop = null; g.ink = null;
    g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    o.behind(g, t);
    g.restore();
  }
  g.save(); g.drop = null; g.border = null;
  g.beginPath(); g.rect(x0 - 2, y0, x1 - x0 + 4, bottom - y0); g.clip();
  g.ink = INK.col; g.inkW = 3.6; g.fillStyle = col;
  g.beginPath(); g.rect(x0, y0 - 10, x1 - x0, bottom - y0 + 10); g.fill();
  g.ink = null;
  // Slats roll up with the door, so they're measured from its bottom edge.
  const slat = 58;
  for (let yy = bottom; yy > y0; yy -= slat) {
    g.fillStyle = shade(col, -.14); g.fillRect(x0, yy - slat * .28, x1 - x0, slat * .12);
    g.strokeStyle = INK.col; g.lineWidth = 2.6; line(g, x0 + 4, yy - slat * .16, x1 - 4, yy - slat * .16); g.stroke();
  }
  // The handle at the bottom.
  g.fillStyle = shade(col, -.35); rr(g, (x0 + x1) / 2 - 60, bottom - 34, 120, 16, 8); g.fill();
  if (o.onDoor) { g.save(); g.translate(0, bottom - y1); o.onDoor(g, t); g.restore(); }
  g.restore();
  // The drum the door rolls into, and the runners.
  cut(g, () => rr(g, x0 - 26, y0 - 34, x1 - x0 + 52, 60, 22), '#3a4270', { drop: 8, inkW: 3.4 });
  for (const x of [x0 - 16, x1 + 4]) cut(g, () => rr(g, x, y0 + 10, 12, hDoor - 10, 5), '#2d3258', { drop: 0, inkW: 2.6 });
}

// A note pushed under the door: a scrap of paper that slides in from under the door's bottom
// edge. p 0..1 is how far it has come.
export function note(g, x, y, w, h, rot, text, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  cut(g, () => { g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2 + 4); g.lineTo(w / 2 - 3, h / 2); g.lineTo(-w / 2 + 2, h / 2 - 3); g.closePath(); }, o.col || C.cream, { drop: 7, inkW: 2.6 });
  if (text) {
    const lines = text.split('\n');
    const size = o.size || 30;
    lines.forEach((ln, i) => letter(g, ln, 0, -((lines.length - 1) * size * 1.3) / 2 + i * size * 1.3 + size * .5, size, { col: o.ink || C.ink, w: .16, align: 'center', seed: (o.seed || 1) + i }));
  }
  g.restore();
}

// Pegboard: a wall panel full of holes, with a few tools hanging.
export function pegboard(g, x0, y0, w, h, o = {}) {
  cut(g, () => rr(g, x0, y0, w, h, 6), o.col || '#d9a66b', { drop: 10, inkW: 3 });
  g.save(); g.drop = null; g.ink = null; g.fillStyle = rgba(C.ink, .55);
  for (let yy = y0 + 22; yy < y0 + h - 10; yy += 34) for (let xx = x0 + 22; xx < x0 + w - 10; xx += 34) { circle(g, xx, yy, 3.4); g.fill(); }
  g.restore();
}

// The garage interior, the whole set. o: { door (0..1 open), behind, onDoor, lights (0..1),
// night (0..1: 1 is the dark practice session), rug }.
export function garage(g, t, o = {}) {
  const night = o.night ?? 1;
  const day = 1 - night;
  const wall = mix('#4a3470', '#f4c2cf', day), side = mix('#3a2860', '#e7a9bd', day), ceil = mix('#241a44', '#d99ab4', day);
  field(g, ceil);
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = 3.4;
  // Back wall round the door, side walls in perspective, the ceiling above.
  g.fillStyle = wall; poly(g, [[150, 290], [930, 290], [930, 1330], [150, 1330]]); g.fill();
  g.fillStyle = side;
  poly(g, [[-120, 20], [150, 290], [150, 1330], [-120, 1720]]); g.fill();
  poly(g, [[1200, 20], [930, 290], [930, 1330], [1200, 1720]]); g.fill();
  g.ink = null; g.strokeStyle = rgba(INK.col, .35); g.lineWidth = 3;
  for (const k of [0, 1]) { line(g, k ? 1200 : -120, 20, k ? 930 : 150, 290); g.stroke(); }
  g.restore();
  // Rafters across the ceiling.
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = 3;
  for (const [y, w] of [[118, 1300], [210, 1000]]) { g.fillStyle = mix('#5b3f2c', '#c98b5a', day); g.beginPath(); g.rect(540 - w / 2, y, w, 26); g.fill(); }
  g.restore();
  // Things on the side walls: a pegboard of tools, gig posters.
  pegboard(g, -30, 560, 150, 520, { col: '#c98f57' });
  tools(g, 45, 620);
  poster(g, 1020, 640, .06, C.yellow, ['NO', 'SLEEP', "TIL"], [C.ink, C.pink, C.ink]);
  poster(g, 1030, 980, -.05, C.teal, ['ASYNC', 'LIVE!'], [C.cream, C.yellow]);
  // The door fills the back wall.
  rollerDoor(g, t, 180, 330, 900, 1330, { open: o.door || 0, behind: o.behind, onDoor: o.onDoor, col: mix('#5566a8', '#8fb2ff', day) });
  // Floor: concrete, with a checkerboard rug.
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = 3.4;
  g.fillStyle = mix('#2e2548', '#c7b6d3', day);
  poly(g, [[-120, 1720], [150, 1330], [930, 1330], [1200, 1720], [1200, 2040], [-120, 2040]]); g.fill();
  g.restore();
  if (o.rug !== false) checker(g, { x0: -60, x1: 1140, yTop: 1400, yBot: 2000, cols: 10, rows: 7, c1: mix('#1d1733', '#2b2340', day), c2: mix('#e9dcc8', '#fff6e6', day), vx: 540, topW: .62 });
  fairyLights(g, t, 40, 262, 1040, 262, 60, 15, { on: o.lights ?? 1 });
}

// Tools hanging on the pegboard: a hammer, a spanner, a saw.
function tools(g, x, y) {
  g.save(); g.drop = { dx: 5, dy: 6, col: rgba(C.ink, .45) }; g.ink = INK.col; g.inkW = 2.6;
  g.fillStyle = '#b07a3e'; rr(g, x - 6, y, 12, 110, 5); g.fill();
  g.fillStyle = '#8d8aa0'; rr(g, x - 26, y - 8, 52, 22, 6); g.fill();
  g.fillStyle = '#a7a3b8'; rr(g, x - 7, y + 160, 14, 120, 6); g.fill(); circle(g, x, y + 160, 18); g.fill();
  g.fillStyle = C.red; rr(g, x - 16, y + 330, 32, 60, 8); g.fill();
  g.fillStyle = '#c9c4d6'; poly(g, [[x - 12, y + 388], [x + 12, y + 388], [x + 6, y + 470], [x - 6, y + 470]]); g.fill();
  g.restore();
}

// A gig poster taped to the wall.
export function poster(g, x, y, rot, col, lines, cols) {
  g.save(); g.translate(x, y); g.rotate(rot);
  cut(g, () => rr(g, -80, -130, 160, 260, 4), col, { drop: 9, inkW: 3 });
  const n = lines.length;
  lines.forEach((ln, i) => letter(g, ln, 0, -60 + i * 64 + (3 - n) * 20, ln.length > 4 ? 30 : 44, { col: cols[i % cols.length], w: .2, align: 'center', seed: 3 + i, outline: cols[i] === C.cream ? { col: C.ink, w: .05 } : undefined }));
  tape(g, 0, -128, 70, .08);
  g.restore();
}

// A bare bulb on a flex, and its flat cone of light.
export function bareBulb(g, t, x, y, len, o = {}) {
  const sw = Math.sin(t * 1.3) * .04;
  const bx = x + Math.sin(sw) * len, by = y + Math.cos(sw) * len;
  g.save(); g.drop = null;
  g.ink = null; g.strokeStyle = INK.col; g.lineWidth = 3; line(g, x, y, bx, by); g.stroke();
  if (o.cone) {
    g.fillStyle = rgba(C.lemon, .16 * o.cone);
    poly(g, [[bx - 18, by + 10], [bx + 18, by + 10], [bx + o.coneW, by + o.coneH], [bx - o.coneW, by + o.coneH]]); g.fill();
  }
  g.fillStyle = rgba(C.lemon, .25); circle(g, bx, by + 24, 60); g.fill();
  g.ink = INK.col; g.inkW = 3; g.fillStyle = '#6c6a78'; rr(g, bx - 12, by - 4, 24, 20, 4); g.fill();
  g.fillStyle = C.lemon; circle(g, bx, by + 32, 22); g.fill();
  g.restore();
  return [bx, by];
}

// Outside, in daylight: the street the garage opens onto. Sky, cut-paper clouds, the houses over
// the road, a tree, and the driveway, whose near edge is y.
export function street(g, t, y = 1330) {
  field(g, C.sky);
  for (let k = 0; k < 4; k++) {
    const x = ((k * 330 + t * 18) % 1500) - 200, cy = 420 + (k % 2) * 90;
    cut(g, () => { g.beginPath(); for (const [dx, dy, r] of [[-60, 10, 50], [0, -12, 64], [62, 8, 48]]) { g.moveTo(x + dx + r, cy + dy); g.arc(x + dx, cy + dy, r, 0, Math.PI * 2); } g.rect(x - 100, cy + 10, 200, 44); }, C.cream, { drop: 8, ink: false });
  }
  const houses = [[120, C.lemon, C.red], [360, C.bubble, C.violet], [610, C.mint, C.blue], [860, '#ffd1a8', C.teal]];
  for (const [x, wall, roof] of houses) {
    cut(g, () => rr(g, x - 110, y - 330, 220, 260, 6), wall, { drop: 8, inkW: 3 });
    cut(g, () => poly(g, [[x - 130, y - 320], [x, y - 430], [x + 130, y - 320]]), roof, { drop: 8, inkW: 3 });
    marker(g, () => rr(g, x - 70, y - 270, 50, 50, 4), C.sky, 2.6);
    marker(g, () => rr(g, x + 20, y - 270, 50, 50, 4), C.sky, 2.6);
    marker(g, () => rr(g, x - 26, y - 170, 52, 100, 4), shade(roof, -.1), 2.6);
  }
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = 3; g.fillStyle = '#8fd07a'; g.beginPath(); g.rect(-120, y - 90, 1320, 60); g.fill(); g.restore();
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = 3; g.fillStyle = '#d9d2e0'; g.beginPath(); g.rect(-120, y - 40, 1320, 200); g.fill(); g.restore();
}
