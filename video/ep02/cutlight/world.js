// The world outside the mirror box: daylight, full colour, the people the band built for. It's
// what shows through every cut. The places and the people in them are story.js's; here are the
// sky, the way a view is moved with the camera as a view through a window moves, and the town
// square with its crowd.
import { W, H, clamp, lerp, rgba, hash, mix } from './kit.js';
import { project, projPoly, tracePoly } from './space.js';
import { figure, BACK } from './paper.js';

// A morning sky: the sun low ahead, a haze of gold along the horizon, a few clouds.
export function sky(L, c, t, o = {}) {
  const zen = project(c, [0, 4000, -6000]), hor = project(c, [0, 0, -6000]);
  const gr = L.createLinearGradient(zen.x, zen.y, hor.x, hor.y);
  gr.addColorStop(0, o.top || '#5ea5d8'); gr.addColorStop(.55, o.mid || '#b9dcec'); gr.addColorStop(.85, o.low || '#ffe2b0'); gr.addColorStop(1, o.hor || '#ffc27e');
  L.fillStyle = gr; L.fillRect(-W, -H, W * 3, H * 3);
  const sp = project(c, o.sun || [120, 260, -6000]);
  const sg = L.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, o.sunR || 420);
  sg.addColorStop(0, 'rgba(255,255,248,1)'); sg.addColorStop(.07, 'rgba(255,250,230,.96)'); sg.addColorStop(.3, 'rgba(255,228,170,.38)'); sg.addColorStop(1, 'rgba(255,215,150,0)');
  L.fillStyle = sg; L.fillRect(-W, -H, W * 3, H * 3);
  L.save();
  for (let i = 0; i < 10; i++) {
    const cp = project(c, [(hash(i, 1) - .5) * 9000 + t * 12, 900 + hash(i, 2) * 2200, -5500]);
    const rw = (260 + hash(i, 3) * 500) * cp.s;
    L.globalAlpha = .5;
    const cg = L.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, rw);
    cg.addColorStop(0, 'rgba(255,255,255,.95)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
    L.fillStyle = cg; L.beginPath(); L.ellipse(cp.x, cp.y, rw, rw * .18, 0, 0, Math.PI * 2); L.fill();
  }
  L.restore();
  return sp;
}

// A view behind the wall drawn in the screen space of a reference camera, then moved with the
// real camera as a backdrop at depth D would be: the parallax of looking through a window. The
// view is designed around where the words are in the reference framing.
export function backdrop(L, c, ref, D, draw) {
  const P0 = [ref.pos[0] + ref.f[0] * D, ref.pos[1] + ref.f[1] * D, ref.pos[2] + ref.f[2] * D];
  const p = project(c, P0);
  const k = L.getTransform().a;
  L.save();
  L.setTransform(k, 0, 0, k, 0, 0);
  L.translate(p.x - W / 2, p.y - H / 2);
  draw(L);
  L.restore();
}

// ---------------------------------------------------------------- the town square
// The square as a painted flat, standing across the far side at z, its ground line on the floor:
// the fronts of the four places, the bunting, the low sun behind. `width` is in cm, so the flat
// is the same size to every camera. Returns where its sun is on screen.
// base: where the fronts meet the paving, as a fraction of the picture's height.
export const SQUARE = { z: -1500, width: 1520, base: .585 };
export function squarePlane(L, c, o = {}) {
  const b = BACK['bg-square'];
  if (!b) return null;
  const cm = (o.width ?? SQUARE.width) / b.w, Z = o.z ?? SQUARE.z, top = (o.base ?? SQUARE.base) * b.h * cm, left = -b.w * cm / 2;
  const p0 = project(c, [left, top, Z]), px = project(c, [left + b.w * cm, top, Z]), py = project(c, [left, top - b.h * cm, Z]);
  if (p0.z < c.near) return null;
  const t0 = L.getTransform();
  L.save();
  L.setTransform(t0.a * (px.x - p0.x) / b.w, t0.a * (px.y - p0.y) / b.w, t0.a * (py.x - p0.x) / b.h, t0.a * (py.y - p0.y) / b.h, t0.a * p0.x + t0.e, t0.a * p0.y + t0.f);
  L.drawImage(b.img, 0, 0);
  L.restore();
  const sun = b.feat?.sun || [.6, .36];
  return project(c, [left + sun[0] * b.w * cm, top - sun[1] * b.h * cm, Z]);
}

// The square's paving, drawn in the camera's own perspective so the people stand on it (the
// painting's paving, in its own perspective, left them floating): warm stone lit by the low sun
// down the middle, violet in the shade, the joints inked, from the fronts to behind the camera.
export function squareGround(L, c, o = {}) {
  const Z0 = o.z ?? SQUARE.z, Z1 = 2600, X = 2600;
  const pp = projPoly(c, [[-X, 0, Z0], [X, 0, Z0], [X, 0, Z1], [-X, 0, Z1]]);
  if (!pp) return;
  const yH = project(c, [0, 0, Z0]).y;
  L.save();
  L.beginPath(); tracePoly(L, pp); L.clip();
  if (o.rich) { inkedPaving(L, c, Z0, yH, o.t ?? 0); L.restore(); return; }
  const gr = L.createLinearGradient(0, yH, 0, H);
  gr.addColorStop(0, '#d7a16c'); gr.addColorStop(.2, '#a47d6d'); gr.addColorStop(.6, '#6c5464'); gr.addColorStop(1, '#3e3144');
  L.fillStyle = gr; L.fillRect(-W, yH - 4, W * 3, H * 3);
  // The low sun down the middle of the square, through the gap between the fronts.
  const path = projPoly(c, [[-130, 0, Z0], [130, 0, Z0], [640, 0, 900], [-640, 0, 900]]);
  if (path) {
    L.globalCompositeOperation = 'screen';
    const g2 = L.createLinearGradient(0, yH, 0, H);
    g2.addColorStop(0, 'rgba(255,206,130,.8)'); g2.addColorStop(.5, 'rgba(255,180,100,.35)'); g2.addColorStop(1, 'rgba(255,160,90,0)');
    L.fillStyle = g2; L.beginPath(); tracePoly(L, path); L.fill();
    L.globalCompositeOperation = 'source-over';
  }
  // The joints between the flags: rows of stones, each row's joints offset from the last, inked,
  // and fading out into the distance as a painter would leave them.
  L.lineCap = 'round';
  const seg = (a, b, al) => { const p = project(c, a), q = project(c, b); if (p.z < c.near || q.z < c.near) return; L.strokeStyle = `rgba(40,24,36,${al})`; L.lineWidth = Math.max(.6, Math.min(3, (p.s + q.s) * 1.1)); L.beginPath(); L.moveTo(p.x, p.y); L.lineTo(q.x, q.y); L.stroke(); };
  const fade = z => .42 * clamp((z - Z0 - 250) / 900);
  let row = 0;
  for (let z = Z0 + 170; z <= 1200; z += 170 + (row % 3) * 18, row++) {
    const al = fade(z);
    if (al <= .01) continue;
    seg([-1800, 0, z], [1800, 0, z], al);
    const off = (row % 2) * 110 + hash(row, 7) * 40;
    for (let x = -1800 + off; x <= 1800; x += 220) seg([x, 0, z], [x, 0, z + 170], al);
  }
  L.restore();
}

// The paving close to, in the film's own hand: flat shapes of colour, as the places are painted.
// The fronts' long shadows lie over the square as a violet mass, and the low sun comes through the
// gap between them as a warm wedge; each flagstone is its own tone; the joints are inked, boiling
// on twos as every line in the film does; the light catches a few edges. It's left simpler in the
// distance, as a painter would leave it, and hazes into the fronts.
const SUN_X = 60;   // where the sun's path comes through between the fronts (cm across the square)
function inkedPaving(L, c, Z0, yH, t) {
  const fr = Math.floor(t * 12);
  const ZN = 1300, XS = 1500, SW = 76;   // the stones: about a third of a person's height
  const P = (x, z) => project(c, [x, 0, z]);
  const far = z => clamp((z - Z0) / (ZN - Z0));   // 0 at the fronts, 1 by the camera
  const halfSun = z => lerp(140, 380, far(z));
  // The path of sun, from the gap between the fronts towards us; the fronts' shade either side.
  const wedge = [[SUN_X - halfSun(Z0), Z0], [SUN_X + halfSun(Z0), Z0], [SUN_X + halfSun(ZN), ZN], [SUN_X - halfSun(ZN), ZN]];
  const wedgePath = () => { const q = projPoly(c, wedge.map(([x, z]) => [x, 0, z])); if (q) { L.beginPath(); tracePoly(L, q); } return !!q; };
  // The stones, row by row, each row's joints offset from the last; only those in view.
  const rows = [];
  for (let z = Z0, r = 0; z < ZN; r++) {
    const d = 54 + (r % 3) * 7 + hash(r, 3) * 6, z1 = Math.min(ZN, z + d);
    const row = { z0: z, z1, r, xs: [] };
    // Each stone runs to where the next begins, so there are no gaps, only joints.
    const off = (r % 2) * SW * .5 + hash(r, 7) * SW * .3;
    for (let x = -XS + off; x < XS;) {
      const x2 = x + SW + (hash(r, Math.round(x), 5) - .5) * 14;
      const q = projPoly(c, [[x, 0, z], [x2, 0, z], [x2, 0, z1], [x, 0, z1]]);
      if (q && !(q.every(p => p[0] < -20) || q.every(p => p[0] > W + 20) || q.every(p => p[1] > H + 20) || q.every(p => p[1] < yH - 20))) row.xs.push([x, q, x2]);
      x = x2;
    }
    if (row.xs.length) rows.push(row);
    z = z1;
  }
  // Under the stones, the joints' own dark, in case any hairline shows between them.
  L.fillStyle = '#2a2030'; L.fillRect(-W, yH - 2, W * 3, H * 3);
  const stonePass = (tone) => {
    for (const row of rows) {
      const k = far((row.z0 + row.z1) / 2), amp = .3 + .7 * k;
      for (const [x, q] of row.xs) {
        L.fillStyle = tone(k, hash(row.r, Math.round(x), 11), amp);
        L.beginPath(); tracePoly(L, q); L.fill();
      }
    }
  };
  // In the shade: violet-charcoal, lighter and hazier towards the fronts; in the sun, warm stone.
  stonePass((k, h, a) => mix(mix('#6c5870', '#382b43', k), h > .5 ? '#2c2236' : '#76637a', Math.abs(h - .5) * .3 * a));
  L.save();
  if (wedgePath()) { L.clip(); stonePass((k, h, a) => mix(mix('#f2c386', '#cf8d56', k), h > .5 ? '#a86a40' : '#f7d9a6', Math.abs(h - .5) * .34 * a)); }
  L.restore();
  // The joints, inked, fading out into the distance; a hair of boil on twos.
  const jit = (i, n) => (hash(fr, i, n) - .5) * 1.1;
  const inkLine = (a, b, al, col, i) => {
    const p = P(a[0], a[1]), q = P(b[0], b[1]);
    if (p.z < c.near || q.z < c.near || al < .02) return;
    L.strokeStyle = rgba(col, al); L.lineWidth = Math.max(.6, Math.min(2.6, (p.s + q.s) * .9));
    L.beginPath(); L.moveTo(p.x + jit(i, 1), p.y + jit(i, 2)); L.lineTo(q.x + jit(i, 3), q.y + jit(i, 4)); L.stroke();
  };
  const joints = (col, k0) => {
    let i = 0;
    for (const row of rows) {
      const al = k0 * clamp((far(row.z0) - .05) / .35);
      if (al < .02) continue;
      const x0 = row.xs[0][0], x1 = row.xs[row.xs.length - 1][2];
      inkLine([x0, row.z0], [x1, row.z0], al, col, i++);
      for (const [x] of row.xs) inkLine([x, row.z0], [x, row.z1], al, col, i++);
    }
  };
  L.lineCap = 'round';
  joints('#1d1524', .5);
  L.save(); if (wedgePath()) { L.clip(); joints('#7a4a2c', .45); } L.restore();
  // Where the low sun catches an edge: a few short cream strokes on stones' far edges in its path,
  // and fainter white scratches in the shade.
  for (const row of rows) {
    const k = far(row.z0);
    if (k < .25 || k > .92) continue;
    for (const [x] of row.xs) {
      const h = hash(row.r, Math.round(x), 13);
      if (h > .09) continue;
      const u = x + SW * (.15 + hash(row.r, Math.round(x), 14) * .4), len = SW * (.2 + h * 4);
      const inSun = Math.abs(u - SUN_X) < halfSun(row.z0);
      inkLine([u, row.z0 + 3], [u + len, row.z0 + 3], (inSun ? .8 : .25) * clamp((k - .25) / .3), inSun ? '#fff1d6' : '#f3efe6', 900 + Math.round(u));
    }
  }
  // The far edge hazed with the low sun, into the fronts.
  const hz = L.createLinearGradient(0, yH, 0, yH + H * .07);
  hz.addColorStop(0, 'rgba(255,212,160,.55)'); hz.addColorStop(1, 'rgba(255,212,160,0)');
  L.save(); L.globalCompositeOperation = 'screen'; L.fillStyle = hz; L.fillRect(-W, yH - 2, W * 3, H * .07 + 2); L.restore();
}

// The people the band built for, outside the box, come to the glass: Rosa, Gran, a parent, Jess
// at the front, and the town behind them, the square beyond. o.joy: they bounce with the band.
// Standing, each as themselves.
export const STANDING = { rosa: 'rosa-proud', gran: 'gran-stand', parent: 'parent-stand', jess: 'jess-bouquet' };
export const CROWD = ['c-hoodie', 'c-raincoat', 'c-paper', 'c-girl', 'c-sari', 'c-overalls', 'c-stick', 'c-denim', 'c-delivery', 'c-floral', 'q-flatcap'];
const FOUR_AT_GLASS = [[STANDING.rosa, -300, -430, 170], [STANDING.gran, -105, -470, 156], [STANDING.parent, 110, -440, 180], [STANDING.jess, 310, -420, 168]];
const TOWN = [[CROWD[0], -640, -980, 168], [CROWD[1], -470, -1120, 164], [CROWD[2], -320, -900, 170], [CROWD[6], -170, -1180, 166], [CROWD[3], 0, -1000, 150],
  [CROWD[7], 170, -1150, 172], [CROWD[4], 330, -920, 166], [CROWD[8], 480, -1100, 170], [CROWD[10], 640, -960, 170], [CROWD[5], -560, -800, 172], [CROWD[9], 560, -780, 164]];
export function onlookers(L, c, t, o = {}) {
  L.fillStyle = '#5f86c0'; L.fillRect(-W, -H, W * 3, H * 3);
  squarePlane(L, c);
  squareGround(L, c);
  const ppl = [...TOWN, ...FOUR_AT_GLASS].map(([n, x, z, hh], i) => ({ n, x, z, hh, i })).sort((a, b) => a.z - b.z);
  for (const p of ppl) {
    const q = project(c, [p.x, 0, p.z]);
    if (q.z < c.near) continue;
    figure(L, p.n, q.x, q.y, p.hh * q.s, { t, seed: 300 + p.i, bounce: o.joy ? .55 : 0, beatOff: p.i * .07, edge: '#ffe8c2', edgeW: 1.2 });
  }
}
