// The backgrounds: painted once, in watercolour and gouache on paper, as the old studios painted
// theirs, softer and paler than the cels that play in front of them. Each is baked into its own
// canvas the first time it's needed and then only moved by the camera.
import { W, H, TAU, clamp, lerp, rng, noise, hash, mix, rgba } from './kit.js';
import { INK, CREAM, PAPER, SKY, MINT, TEAL, DEEP, CORAL, OCHRE, ROSE, PLUM, WOOD, BROWN, GOLD, C, WHITE } from './palette.js';
import { spline, ellipse, rrect } from './ink.js';

const CACHE = new Map();
export function bake(key, w, h, fn) {
  let c = CACHE.get(key);
  if (!c) {
    c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    fn(g, w, h);
    CACHE.set(key, c);
  }
  return c;
}
// The background ink: a thin brown line, lighter than the cels'.
export const BGINK = '#4a3528';

function path(g, P) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (const p of P) g.lineTo(p[0], p[1]); g.closePath(); }
function wobble(P, amt, seed) { return P.map(([x, y], i) => [x + noise(i * .37, seed) * amt, y + noise(i * .37, seed + 3) * amt]); }

// A watercolour wash: a flat pool of colour, blooms inside it, and the darker rim where the pigment
// dried at the edge.
export function wash(g, P, col, o = {}) {
  const seed = o.seed ?? 1, R = rng(seed);
  const Q = o.amt === 0 ? P : wobble(P, o.amt ?? 2, seed);
  g.save();
  path(g, Q); g.fillStyle = col; g.fill();
  g.clip();
  // blooms
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of Q) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const n = o.blooms ?? Math.round(clamp((x1 - x0) * (y1 - y0) / 9000, 3, 60));
  g.filter = `blur(${o.blur ?? 10}px)`;
  for (let i = 0; i < n; i++) {
    const bx = lerp(x0, x1, R()), by = lerp(y0, y1, R()), br = lerp(20, 90, R()) * (o.bloomScale ?? 1);
    g.fillStyle = rgba(R() < .5 ? mix(col, '#000000', .18) : mix(col, '#ffffff', .22), .16 * (o.bloom ?? 1));
    g.beginPath(); g.ellipse(bx, by, br, br * lerp(.5, 1, R()), R() * 3, 0, TAU); g.fill();
  }
  // a gradient of light if asked: lit from the top
  if (o.grad) { g.filter = 'none'; const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, rgba('#ffffff', o.grad)); gr.addColorStop(1, rgba('#000000', o.grad * .6)); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); }
  g.filter = `blur(${o.rimBlur ?? 3}px)`;
  path(g, Q); g.strokeStyle = rgba(mix(col, '#2a1a10', .45), o.rim ?? .45); g.lineWidth = o.rimW ?? 7; g.stroke();
  g.restore();
  if (o.ink) { g.save(); path(g, wobble(Q, 1, seed + 9)); g.strokeStyle = o.inkCol || BGINK; g.globalAlpha = o.inkA ?? .8; g.lineWidth = o.ink; g.lineJoin = 'round'; g.stroke(); g.restore(); }
}
// A soft gradient sky with a few painted clouds.
export function sky(g, w, h, top, bottom, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, top); gr.addColorStop(1, bottom);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = rng(o.seed ?? 5);
  for (let i = 0; i < (o.clouds ?? 5); i++) cloud(g, lerp(-50, w + 50, R()), lerp(o.y0 ?? 120, o.y1 ?? h * .45, R()), lerp(.7, 1.4, R()), R() * 100);
}
export function cloud(g, x, y, s, seed) {
  const R = rng(seed + 1);
  const P = [];
  const n = 7;
  for (let i = 0; i <= n; i++) { const a = Math.PI + i / n * Math.PI; P.push([x + Math.cos(a) * 150 * s, y + Math.sin(a) * (i % 2 ? 80 : 110) * s * lerp(.8, 1.1, R())]); }
  P.push([x + 150 * s, y + 20 * s], [x - 150 * s, y + 20 * s]);
  wash(g, spline(P, true, 5), '#fbf3e1', { seed, blur: 12, bloom: .7, rim: .15, amt: 3 });
  g.save(); g.globalAlpha = .35; g.fillStyle = '#e9b99a'; g.filter = 'blur(8px)'; g.beginPath(); g.ellipse(x, y + 10 * s, 130 * s, 22 * s, 0, 0, TAU); g.fill(); g.restore();
}
// Paper under everything: a few fibres and speckles, only in the backgrounds.
export function paper(g, w, h, seed = 3, a = 1) {
  const R = rng(seed);
  g.save();
  for (let i = 0; i < w * h / 900; i++) {
    g.fillStyle = R() < .5 ? `rgba(80,50,20,${.05 * a})` : `rgba(255,250,235,${.08 * a})`;
    g.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2.5);
  }
  g.restore();
}

// ---------------------------------------------------------------- places
// A townhouse front with windows and a roof, (x, base) its lower left.
export function house(g, x, base, w, h, col, seed, o = {}) {
  const R = rng(seed);
  wash(g, [[x, base], [x, base - h], [x + w, base - h], [x + w, base]], col, { seed, ink: 2.5, grad: .1 });
  // roof
  const rt = o.roof ?? 'gable';
  const rc = o.roofCol || mix(col, '#3a2418', .45);
  if (rt === 'gable') wash(g, [[x - 12, base - h], [x + w / 2, base - h - w * .42], [x + w + 12, base - h]], rc, { seed: seed + 1, ink: 2.5 });
  else wash(g, [[x - 10, base - h], [x - 10, base - h - 26], [x + w + 10, base - h - 26], [x + w + 10, base - h]], rc, { seed: seed + 1, ink: 2.5 });
  if (o.chimney !== false) wash(g, [[x + w * .7, base - h - w * .2], [x + w * .7, base - h - w * .45], [x + w * .82, base - h - w * .45], [x + w * .82, base - h - w * .1]], mix(rc, '#000', .2), { seed: seed + 2, ink: 2 });
  // windows
  const cols = Math.max(1, Math.round(w / 70)), rows = Math.max(1, Math.round((h - 60) / 90));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const wx = x + (c + .5) * w / cols - 17, wy = base - h + 30 + r * 90;
    if (wy > base - 70) continue;
    wash(g, [[wx, wy], [wx + 34, wy], [wx + 34, wy + 50], [wx, wy + 50]], R() < .3 ? '#f3d98f' : '#4e6d6c', { seed: seed + 10 + r * 7 + c, ink: 2, amt: 1, blooms: 2 });
    g.strokeStyle = BGINK; g.lineWidth = 2; g.beginPath(); g.moveTo(wx + 17, wy); g.lineTo(wx + 17, wy + 50); g.moveTo(wx, wy + 25); g.lineTo(wx + 34, wy + 25); g.stroke();
  }
  if (o.door) wash(g, [[x + w / 2 - 22, base], [x + w / 2 - 22, base - 70], [x + w / 2 + 22, base - 70], [x + w / 2 + 22, base]], WOOD, { seed: seed + 5, ink: 2.5 });
  if (o.awning) {
    const ay = base - 110, aw = w + 10;
    for (let i = 0; i < 6; i++) wash(g, [[x - 5 + i * aw / 6, ay], [x - 5 + (i + 1) * aw / 6, ay], [x - 5 + (i + 1) * aw / 6, ay + 36], [x - 5 + (i + .5) * aw / 6, ay + 46], [x - 5 + i * aw / 6, ay + 36]], i % 2 ? CREAM : o.awning, { seed: seed + 20 + i, ink: 2, amt: .5, blooms: 1 });
  }
}
// Bunting strung between two points.
export function bunting(g, a, b, sag, cols, seed = 1) {
  g.strokeStyle = BGINK; g.lineWidth = 2.5; g.beginPath();
  const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag]); }
  g.moveTo(...pts[0]); for (const p of pts) g.lineTo(...p); g.stroke();
  for (let i = 1; i < 20; i += 1.3) {
    const u = i / 20, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag;
    wash(g, [[x - 14, y], [x + 14, y], [x, y + 34]], cols[Math.floor(i) % cols.length], { seed: seed + i, ink: 2, amt: .4, blooms: 1, rim: .2 });
  }
}
// Cobbles in perspective, from the horizon y0 to the bottom.
export function cobbles(g, w, y0, h, col, seed = 4) {
  wash(g, [[0, y0], [w, y0], [w, h], [0, h]], col, { seed, blooms: 30, amt: 0, grad: .12 });
  const R = rng(seed);
  g.save(); g.strokeStyle = rgba(BGINK, .35); g.lineWidth = 2;
  let y = y0 + 6, k = 0;
  while (y < h) {
    const dy = 10 + (y - y0) * .09;
    const cw = 30 + (y - y0) * .22;
    for (let x = (k % 2) * cw / 2 - cw; x < w + cw; x += cw) { g.beginPath(); g.ellipse(x + R() * 4, y + dy / 2, cw * .44, dy * .38, 0, 0, TAU); g.stroke(); }
    y += dy; k++;
  }
  g.restore();
}
// A lamp post, (x, base).
export function lamp(g, x, base, h, seed = 6) {
  wash(g, [[x - 6, base], [x - 6, base - h], [x + 6, base - h], [x + 6, base]], '#3d4b4a', { seed, ink: 2, amt: .5 });
  wash(g, [[x - 20, base], [x - 14, base - 30], [x + 14, base - 30], [x + 20, base]], '#3d4b4a', { seed: seed + 1, ink: 2, amt: .5 });
  wash(g, [[x - 26, base - h], [x - 18, base - h - 60], [x + 18, base - h - 60], [x + 26, base - h]], '#f3d98f', { seed: seed + 2, ink: 2.5, amt: .5 });
  wash(g, [[x - 30, base - h - 60], [x, base - h - 84], [x + 30, base - h - 60]], '#3d4b4a', { seed: seed + 3, ink: 2, amt: .5 });
}
// A tree: a trunk and round crowns of foliage.
export function tree(g, x, base, s, col = '#7fae7a', seed = 8) {
  wash(g, [[x - 14 * s, base], [x - 9 * s, base - 150 * s], [x + 9 * s, base - 150 * s], [x + 14 * s, base]], WOOD, { seed, ink: 2 });
  const R = rng(seed);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; wash(g, ellipse(x + Math.cos(a) * 55 * s, base - 200 * s + Math.sin(a) * 40 * s, 62 * s * lerp(.8, 1.1, R()), 55 * s, 0, 30), mix(col, i % 2 ? '#ffffff' : '#20402a', .12), { seed: seed + i, ink: 2, amt: 2 }); }
  wash(g, ellipse(x, base - 210 * s, 70 * s, 62 * s, 0, 30), col, { seed: seed + 9, ink: 2, amt: 2 });
}

// The town square: rooftops round a cobbled square under a spring sky, a clock tower in the middle.
export function townSquare(o = {}) {
  const w = o.w || 1400, h = o.h || 2200;
  return bake('square' + (o.night ? 'n' : ''), w, h, (g) => {
    sky(g, w, h, '#a9d7cf', '#f4e2c0', { clouds: 6, y0: 150, y1: 700, seed: 11 });
    const hz = 1180;
    // far roofs
    const R = rng(21);
    let x = -40;
    const cols = ['#9dc4b9', '#e7b99c', '#e9cf97', '#d8a9b0', '#b7cdb0'];
    while (x < w) { const hw = lerp(110, 190, R()), hh = lerp(260, 420, R()); house(g, x, hz - 60, hw, hh, mix(cols[Math.floor(R() * 5)], '#f4e2c0', .35), 100 + x, { roof: R() < .6 ? 'gable' : 'flat', chimney: R() < .5 }); x += hw + 4; }
    // clock tower
    const tx = w / 2;
    wash(g, [[tx - 90, hz], [tx - 90, hz - 700], [tx + 90, hz - 700], [tx + 90, hz]], '#e7c9a0', { seed: 31, ink: 3, grad: .15 });
    wash(g, [[tx - 110, hz - 700], [tx, hz - 880], [tx + 110, hz - 700]], '#b8574a', { seed: 32, ink: 3 });
    wash(g, ellipse(tx, hz - 580, 70, 70, 0, 40), CREAM, { seed: 33, ink: 3, blooms: 3 });
    g.strokeStyle = BGINK; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(tx, hz - 580); g.lineTo(tx, hz - 628); g.moveTo(tx, hz - 580); g.lineTo(tx + 32, hz - 570); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillStyle = BGINK; g.beginPath(); g.arc(tx + Math.cos(a) * 58, hz - 580 + Math.sin(a) * 58, 3, 0, TAU); g.fill(); }
    // near houses left and right, with awnings
    house(g, -30, hz + 40, 300, 560, '#e2a58a', 41, { door: true, awning: TEAL });
    house(g, w - 280, hz + 40, 310, 600, '#9fc7bb', 42, { door: true, awning: CORAL });
    // the square
    cobbles(g, w, hz, h, '#d9c29a', 51);
    bunting(g, [0, 560], [w / 2 - 80, 700], 90, [CORAL, OCHRE, TEAL, ROSE], 61);
    bunting(g, [w / 2 + 80, 700], [w, 560], 90, [TEAL, ROSE, OCHRE, CORAL], 62);
    lamp(g, 150, hz + 200, 330, 71); lamp(g, w - 150, hz + 200, 330, 72);
    paper(g, w, h, 9);
  });
}
