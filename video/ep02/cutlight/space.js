// A small 3D kit for drawing in Canvas 2D: a camera that projects world points to the frame,
// affine transforms, polygons clipped at the near plane, and cel-shaded solids (bevelled boxes,
// prisms from any outline, cylinders) that are drawn as flat 2D shapes with an ink outline.
//
// World units are centimetres, y is up, and the stage floor is y = 0. A solid is shaded by its
// face normals against the scene's lights, quantised the way cel animation paints it: a lit tone,
// a shadow tone, and the coloured lights added on top.
import { W, H, clamp, lerp, mix, lit, add, rgba, hexRgb, toHex, hash } from './kit.js';
import { hatch, INK } from './ink.js';

// ---------------------------------------------------------------- vectors and transforms
export const v3 = (x = 0, y = 0, z = 0) => [x, y, z];
export const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const vmul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const vlen = a => Math.hypot(a[0], a[1], a[2]);
export const norm = a => { const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const vlerp = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];

// A 3×4 affine matrix, row-major: [r00 r01 r02 tx, r10 r11 r12 ty, r20 r21 r22 tz].
export const I = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
export function mmul(A, B) {
  const o = new Array(12);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      let s = c === 3 ? A[r * 4 + 3] : 0;
      for (let k = 0; k < 3; k++) s += A[r * 4 + k] * B[k * 4 + c];
      o[r * 4 + c] = s;
    }
  }
  return o;
}
export const T = (x, y, z) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z];
export const S = (x, y = x, z = x) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0];
export function RX(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0]; }
export function RY(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0]; }
export function RZ(a) { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0]; }
// Compose left to right: M(T, RY, S) applies S first, then RY, then T.
export const M = (...ms) => ms.reduce((a, b) => mmul(a, b), I());
export const ap = (m, p) => [
  m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3],
  m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7],
  m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11],
];
// Directions (normals) under a matrix without translation; renormalised, so uniform scale only.
export const apn = (m, n) => norm([
  m[0] * n[0] + m[1] * n[1] + m[2] * n[2],
  m[4] * n[0] + m[5] * n[1] + m[6] * n[2],
  m[8] * n[0] + m[9] * n[1] + m[10] * n[2],
]);

// A frame whose x axis runs from a to b (and whose y axis is as near `up` as it can be), centred
// between them: for a limb or a stick drawn as a box from one point to another.
export function between(a, b, up = [0, 1, 0]) {
  const x = norm(vsub(b, a));
  let z = cross(x, up);
  if (vlen(z) < 1e-4) z = cross(x, [1, 0, 0]);
  z = norm(z);
  const y = cross(z, x);
  const m = vlerp(a, b, .5);
  return [x[0], y[0], z[0], m[0], x[1], y[1], z[1], m[1], x[2], y[2], z[2], m[2]];
}

// ---------------------------------------------------------------- the camera
// cam(pos, target, {fov, roll}) looks from pos at target; fov is the vertical field of view.
export function cam(pos, target, o = {}) {
  const fov = o.fov ?? .75;
  const f = norm(vsub(target, pos));
  let up = o.up || [0, 1, 0];
  let r = norm(cross(f, up));
  let u = cross(r, f);
  if (o.roll) {
    const c = Math.cos(o.roll), s = Math.sin(o.roll);
    const r2 = vadd(vmul(r, c), vmul(u, s)), u2 = vadd(vmul(u, c), vmul(r, -s));
    r = r2; u = u2;
  }
  return { pos, target, f, r, u, fov, focal: (H / 2) / Math.tan(fov / 2), cx: W / 2 + (o.shiftX || 0), cy: H / 2 + (o.shiftY || 0), near: o.near ?? 4, mirror: null };
}
// Camera space: x right, y up, z forward (depth).
export const toCam = (c, p) => { const d = vsub(p, c.pos); return [dot(d, c.r), dot(d, c.u), dot(d, c.f)]; };
export const fromCam = (c, q) => [q[2] > 0 ? c.cx + q[0] * c.focal / q[2] : NaN, c.cy - q[1] * c.focal / q[2], q[2]];
export function project(c, p) {
  const q = toCam(c, c.mirror ? ap(c.mirror, p) : p);
  return { x: c.cx + q[0] * c.focal / q[2], y: c.cy - q[1] * c.focal / q[2], z: q[2], s: c.focal / q[2] };
}
// Pixels per centimetre at a world point: for line widths and sizes that scale with depth.
export const scaleAt = (c, p) => { const q = toCam(c, c.mirror ? ap(c.mirror, p) : p); return c.focal / Math.max(q[2], c.near); };
// A mirror: the scene reflected in a plane (point, normal), for floors and mirror walls.
export function reflector(p0, n) {
  n = norm(n);
  const d = dot(p0, n);
  const [a, b, c] = n;
  return [1 - 2 * a * a, -2 * a * b, -2 * a * c, 2 * d * a,
    -2 * a * b, 1 - 2 * b * b, -2 * b * c, 2 * d * b,
    -2 * a * c, -2 * b * c, 1 - 2 * c * c, 2 * d * c];
}
export const mirrored = (c, m) => ({ ...c, mirror: m });

// Project a polygon, clipped at the near plane. Returns [[x, y], ...] or null.
export function projPoly(c, pts) {
  const q = pts.map(p => toCam(c, c.mirror ? ap(c.mirror, p) : p));
  const out = [];
  for (let i = 0; i < q.length; i++) {
    const a = q[i], b = q[(i + 1) % q.length];
    const ain = a[2] >= c.near, bin = b[2] >= c.near;
    if (ain) out.push(a);
    if (ain !== bin) {
      const k = (c.near - a[2]) / (b[2] - a[2]);
      out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k), c.near]);
    }
  }
  if (out.length < 3) return null;
  return out.map(p => [c.cx + p[0] * c.focal / p[2], c.cy - p[1] * c.focal / p[2]]);
}
export function tracePoly(g, pp) {
  g.moveTo(pp[0][0], pp[0][1]);
  for (let i = 1; i < pp.length; i++) g.lineTo(pp[i][0], pp[i][1]);
  g.closePath();
}
// Is a face (world centre, world normal) turned towards the camera?
export function facing(c, centre, n) {
  const p = c.mirror ? ap(c.mirror, centre) : centre;
  const nn = c.mirror ? apn(c.mirror, n) : n;
  return dot(nn, vsub(c.pos, p)) > 0;
}

// ---------------------------------------------------------------- light
// A light: { dir: towards the light (world), col, k } or { pos, col, k, range }. LIGHT holds the
// scene's lights; a shot sets them. Shading is cel: the key light decides lit or shadow, with a
// narrow soft band at the terminator; every other light adds its colour where it reaches.
export const LIGHT = {
  key: { dir: norm([.4, .8, -.5]), col: '#fff4e6', k: 1 },
  ambient: '#2a2440',
  extra: [],
  view: [0, 0, 1],
};
export function setLights(o) { Object.assign(LIGHT, o); if (LIGHT.key?.dir) LIGHT.key.dir = norm(LIGHT.key.dir); }
function towards(Lt, p) {
  if (Lt.dir) return [norm(Lt.dir), 1];
  const d = vsub(Lt.pos, p), l = vlen(d);
  return [vmul(d, 1 / (l || 1)), Lt.range ? clamp(1 - l / Lt.range) ** 1.5 : 1];
}
// The painted colour of a surface with normal n at point p, for a material
// { base, shadow?, spec?, gloss?, rim? }. Cel: the key light decides lit or shadow, with a
// narrow soft band at the terminator; the coloured lights add their colour where they reach; a
// rim of the key light's colour catches faces turned towards it and away from the eye.
export function shade(mat, n, p, o = {}) {
  const key = LIGHT.key;
  const [Lk, fk] = towards(key, p);
  const d = dot(n, Lk) * fk;
  const soft = mat.soft ?? .12;
  const step = clamp((d - (mat.terminator ?? .08)) / soft);
  const shadow = mat.shadow || lit(mat.base, LIGHT.ambient, 1.6);
  const light = lit(mat.base, key.col, (key.k ?? 1) * (mat.lift ?? 1.08));
  let col = mix(shadow, light, step);
  for (const L of LIGHT.extra) {
    const [Ld, fall] = towards(L, p);
    const e = Math.max(0, dot(n, Ld)) * fall * (L.k ?? 1);
    if (e > .002) col = add(col, lit(mix(mat.base, '#ffffff', mat.take ?? .35), L.col, 1), e * (mat.takeK ?? .9));
  }
  const v = norm(vsub(LIGHT.view, p));
  if (mat.rim) {
    // Rim: the key light from behind, on faces that turn from the eye.
    const r = clamp(d * 1.4) * Math.pow(1 - Math.abs(dot(n, v)), 1.2) * mat.rim;
    if (r > .01) col = mix(col, mat.rimCol || key.col, clamp(r));
  }
  if (mat.spec) {
    const h = norm(vadd(Lk, v));
    const s = dot(n, h);
    if (s > (mat.gloss ?? .96)) col = mix(col, mat.spec, clamp((s - (mat.gloss ?? .96)) / .01) * .9);
  }
  if (o.dim) col = mix(col, o.dimCol || '#05060a', o.dim);
  return col;
}

// Ink: how dark a surface is drawn (0 paper .. 1 solid black), and the colour its light gives
// the paper (or the paint, for Clawd's terracotta). The key light and the stage lights both
// lighten; the coloured lights tint what they light.
export function inkTone(mat, n, p) {
  const [Lk, fk] = towards(LIGHT.key, p);
  let light = Math.max(0, dot(n, Lk)) * fk * (LIGHT.key.k ?? 1) * (mat.keyK ?? 1);
  let tint = mat.paint || INK.paper, best = 0;
  for (const L of LIGHT.extra) {
    const [Ld, fall] = towards(L, p);
    const e = Math.max(0, dot(n, Ld)) * fall * (L.k ?? 1);
    light += e * (mat.stageK ?? .9);
    if (e > best) best = e;
    if (e > .02) tint = mix(tint, L.col, clamp(e * (mat.paint ? .35 : .75)));
  }
  light += mat.ambientK ?? .05;
  // A dark thing stays dark in the light: its own value (albedo) scales what the light gives it.
  const tone = clamp(1 - light * (mat.gain ?? 1.15) * (mat.albedo ?? 1));
  return { tone, tint, stage: best };
}

// ---------------------------------------------------------------- solids
// A solid is a list of faces { pts: [world], n: world normal, mat, line? }. drawSolid culls the
// faces turned away, then draws the visible ones in three passes: an ink underlay (the outline,
// as a stroke of the silhouette twice as wide as the line), the painted faces, and inner lines.
export const STYLE = { ink: false };
export function drawSolid(g, c, faces, o = {}) {
  if (STYLE.ink && o.inkMode === undefined) o = { ...o, inkMode: true };
  const vis = [];
  for (const f of faces) {
    const ctr = f.ctr || centroid(f.pts);
    if (f.both || facing(c, ctr, f.n)) {
      const pp = projPoly(c, f.pts);
      if (pp) vis.push({ f, pp, z: toCam(c, c.mirror ? ap(c.mirror, ctr) : ctr)[2] + (f.zb || 0), ctr, holes: f.holes ? f.holes.map(h => projPoly(c, h)).filter(Boolean) : null });
    }
  }
  if (!vis.length) return;
  if (o.sort !== false) vis.sort((a, b) => b.z - a.z);
  const lw = o.line ?? 0;
  const inkCol = o.ink || '#140d0c';
  g.save();
  g.lineJoin = 'round';
  if (lw > 0) {
    g.fillStyle = inkCol; g.strokeStyle = inkCol; g.lineWidth = lw * 2;
    for (const v of vis) { g.beginPath(); tracePoly(g, v.pp); if (v.holes) for (const h of v.holes) tracePoly(g, h); g.fill('evenodd'); g.stroke(); }
  }
  if (o.inkMode) {
    for (const v of vis) {
      const m = v.f.mat;
      const it = inkTone(m, v.f.n, v.ctr);
      const tn = clamp(it.tone + (m.toneBias || 0));
      const dark = !m.paint && (m.albedo ?? 1) < .4;
      let fill;
      if (m.paint) fill = mix(mix(m.paint, '#2a0b0a', .55), it.tint, clamp(1.15 - tn * 1.2));
      else if (dark) fill = mix(INK.col, it.tint, clamp(it.stage * .18));
      else fill = tn > (m.black ?? .82) ? INK.col : it.tint;
      if (v.f.col) fill = v.f.col;
      g.fillStyle = fill;
      g.beginPath(); tracePoly(g, v.pp); if (v.holes) for (const h of v.holes) tracePoly(g, h); g.fill('evenodd');
      g.strokeStyle = fill; g.lineWidth = .8; g.stroke();
      const hf = m.hatchFrom ?? .26;
      let hi = v.f.pts[0], lo = v.f.pts[0];
      for (const q of v.f.pts) { if (q[1] > hi[1]) hi = q; if (q[1] < lo[1]) lo = q; }
      const pa = project(c, vlerp(v.ctr, hi, .9)), pb = project(c, vlerp(v.ctr, lo, .9));
      const a = v.pp[0], b = v.pp[1];
      const dir0 = [b[0] - a[0], b[1] - a[1]];
      const ang = m.hatchAngle ?? .5, ca = Math.cos(ang), sa = Math.sin(ang);
      const dir = [dir0[0] * ca - dir0[1] * sa, dir0[0] * sa + dir0[1] * ca];
      const sc = o.hatchScale ?? 1;
      if (dark && !v.f.col) {
        // Scratchboard: a black thing, lit, shows its light as white strokes on the black.
        const lite = x => clamp((1 - x) * 2.4 - .08);
        const th = inkTone({ ...m, albedo: 1 }, v.f.n, vlerp(v.ctr, hi, .9)).tone, tl = inkTone({ ...m, albedo: 1 }, v.f.n, vlerp(v.ctr, lo, .9)).tone;
        const la = lite(th) * (m.scratch ?? .6), lb = lite(tl) * (m.scratch ?? .6) * .7;
        if (Math.max(la, lb) > .08) hatch(g, v.pp, Math.max(la, lb), { ramp: { a: [pa.x, pa.y], b: [pb.x, pb.y], ta: la, tb: lb }, dir, seed: hash(v.ctr[0], v.ctr[2], 3), col: rgba(mix(INK.paper, it.tint, .5), .85), w: 1.1 * Math.sqrt(sc), max: 16 * sc, min: 6 * sc });
      } else if (!v.f.col && !v.f.bevel && (m.paint || tn <= (m.black ?? .82))) {
        // The tone across the face: shade its highest and lowest points, and darken towards the
        // floor a little (the anime grad, in ink); the hatching follows that ramp.
        const th = clamp(inkTone(m, v.f.n, vlerp(v.ctr, hi, .9)).tone + (m.toneBias || 0) - .06);
        const tl = clamp(inkTone(m, v.f.n, vlerp(v.ctr, lo, .9)).tone + (m.toneBias || 0) + (m.grad ?? .16));
        const rt = x => clamp((x - hf) / (1 - hf));
        if (Math.max(th, tl) > hf) {
          hatch(g, v.pp, rt(tn), { ramp: { a: [pa.x, pa.y], b: [pb.x, pb.y], ta: rt(th), tb: rt(tl) }, dir, seed: hash(v.ctr[0], v.ctr[1], v.ctr[2]), col: m.hatchCol || (m.paint ? 'rgba(30,9,8,.88)' : INK.col), w: (o.hatchW ?? 1.3) * Math.sqrt(sc), max: (o.hatchMax ?? 15) * sc, min: (o.hatchMin ?? 5) * sc });
        }
      }
      if (v.f.after) v.f.after(g, v.pp, fill);
    }
    if (o.inner) {
      g.strokeStyle = o.innerCol || inkCol; g.lineWidth = o.inner;
      for (const v of vis) if (v.f.crease) { g.beginPath(); tracePoly(g, v.pp); g.stroke(); }
    }
    g.restore();
    return;
  }
  for (const v of vis) {
    let col, fill;
    if (v.f.col) fill = col = v.f.col;
    else if (o.grad !== false && !v.f.bevel && v.f.pts.length >= 3) {
      // A gradient down the face, from its highest point to its lowest, shaded at each: point
      // lights fall off across it, and the anime "grad" darkens towards the floor.
      let hi = v.f.pts[0], lo = v.f.pts[0];
      for (const q of v.f.pts) { if (q[1] > hi[1]) hi = q; if (q[1] < lo[1]) lo = q; }
      const ph = vlerp(v.ctr, hi, .85), pl = vlerp(v.ctr, lo, .85);
      const ch = shade(v.f.mat, v.f.n, ph, o), cl = shade(v.f.mat, v.f.n, pl, { ...o, dim: (o.dim || 0) + (v.f.mat.grad ?? .16) });
      const a = project(c, ph), b = project(c, pl);
      if (Math.hypot(a.x - b.x, a.y - b.y) > 2) {
        const gr = g.createLinearGradient(a.x, a.y, b.x, b.y);
        gr.addColorStop(0, ch); gr.addColorStop(1, cl);
        fill = gr; col = mix(ch, cl, .5);
      } else fill = col = ch;
    } else fill = col = shade(v.f.mat, v.f.n, v.ctr, o);
    g.fillStyle = fill;
    g.beginPath(); tracePoly(g, v.pp); if (v.holes) for (const h of v.holes) tracePoly(g, h); g.fill('evenodd');
    // Hairline seams in the face colour close the gaps canvas antialiasing leaves between faces.
    g.strokeStyle = fill; g.lineWidth = .8; g.stroke();
    if (v.holes && lw > 0) { g.strokeStyle = inkCol; g.lineWidth = lw; for (const h of v.holes) { g.beginPath(); tracePoly(g, h); g.stroke(); } }
    if (v.f.after) v.f.after(g, v.pp, col);
  }
  if (o.inner) {
    g.strokeStyle = o.innerCol || rgba(inkCol, .55); g.lineWidth = o.inner;
    for (const v of vis) if (v.f.crease) { g.beginPath(); tracePoly(g, v.pp); g.stroke(); }
  }
  g.restore();
}
export const centroid = pts => {
  const c = [0, 0, 0];
  for (const p of pts) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }
  return vmul(c, 1 / pts.length);
};

// A bevelled box centred on the origin with half-sizes (hx, hy, hz) and bevel r, under matrix m.
// Faces carry `tag` ('front', 'top', ...) so a caller can paint on them (eyes, a label).
export function boxFaces(m, hx, hy, hz, r, mat, o = {}) {
  const faces = [];
  const P = (x, y, z) => ap(m, [x, y, z]);
  const N = n => apn(m, n);
  const ax = hx - r, ay = hy - r, az = hz - r;
  const face = (pts, n, tag, fm) => faces.push({ pts, n: N(n), mat: fm || (o.faceMat && o.faceMat[tag]) || mat, tag, crease: !!o.crease });
  // The six faces, inset by the bevel.
  face([P(-ax, -ay, hz), P(ax, -ay, hz), P(ax, ay, hz), P(-ax, ay, hz)], [0, 0, 1], 'front');
  face([P(ax, -ay, -hz), P(-ax, -ay, -hz), P(-ax, ay, -hz), P(ax, ay, -hz)], [0, 0, -1], 'back');
  face([P(hx, -ay, az), P(hx, -ay, -az), P(hx, ay, -az), P(hx, ay, az)], [1, 0, 0], 'right');
  face([P(-hx, -ay, -az), P(-hx, -ay, az), P(-hx, ay, az), P(-hx, ay, -az)], [-1, 0, 0], 'left');
  face([P(-ax, hy, az), P(ax, hy, az), P(ax, hy, -az), P(-ax, hy, -az)], [0, 1, 0], 'top');
  face([P(-ax, -hy, -az), P(ax, -hy, -az), P(ax, -hy, az), P(-ax, -hy, az)], [0, -1, 0], 'bottom');
  if (r > 0) {
    const k = Math.SQRT1_2, q = 1 / Math.sqrt(3);
    const bev = o.bevelMat || mat;
    // Twelve edge strips.
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const p = [P(-ax, sy * ay, sz * hz), P(ax, sy * ay, sz * hz), P(ax, sy * hy, sz * az), P(-ax, sy * hy, sz * az)];
      faces.push({ pts: sy * sz > 0 ? p : p.reverse(), n: N([0, sy * k, sz * k]), mat: bev, tag: 'bevel', bevel: 1 });
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const p = [P(sx * hx, -ay, sz * az), P(sx * hx, ay, sz * az), P(sx * ax, ay, sz * hz), P(sx * ax, -ay, sz * hz)];
      faces.push({ pts: sx * sz > 0 ? p : p.reverse(), n: N([sx * k, 0, sz * k]), mat: bev, tag: 'bevel', bevel: 1 });
    }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const p = [P(sx * hx, sy * ay, -az), P(sx * hx, sy * ay, az), P(sx * ax, sy * hy, az), P(sx * ax, sy * hy, -az)];
      faces.push({ pts: sx * sy > 0 ? p : p.reverse(), n: N([sx * k, sy * k, 0]), mat: bev, tag: 'bevel', bevel: 1 });
    }
    // Eight corners.
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const p = [P(sx * hx, sy * ay, sz * az), P(sx * ax, sy * hy, sz * az), P(sx * ax, sy * ay, sz * hz)];
      faces.push({ pts: sx * sy * sz > 0 ? p : p.reverse(), n: N([sx * q, sy * q, sz * q]), mat: bev, tag: 'corner', bevel: 1 });
    }
  }
  return faces;
}

// A prism: a flat outline [[x, y], ...] (counter-clockwise, in the xy plane) extruded from
// z = -d/2 to d/2, under matrix m. For guitar bodies, pickguards, drum hardware plates.
export function prismFaces(m, outline, d, mat, o = {}) {
  const faces = [];
  const h = d / 2;
  const front = outline.map(([x, y]) => ap(m, [x, y, h]));
  const back = outline.map(([x, y]) => ap(m, [x, y, -h])).reverse();
  faces.push({ pts: front, n: apn(m, [0, 0, 1]), mat: o.frontMat || mat, tag: 'front' });
  faces.push({ pts: back, n: apn(m, [0, 0, -1]), mat: o.backMat || mat, tag: 'back' });
  const side = o.sideMat || mat;
  for (let i = 0; i < outline.length; i++) {
    const [x0, y0] = outline[i], [x1, y1] = outline[(i + 1) % outline.length];
    const nx = y1 - y0, ny = -(x1 - x0);
    faces.push({ pts: [ap(m, [x0, y0, h]), ap(m, [x0, y0, -h]), ap(m, [x1, y1, -h]), ap(m, [x1, y1, h])], n: apn(m, norm([nx, ny, 0])), mat: side, tag: 'side' });
  }
  return faces;
}

// A cylinder along y, radius r, from y0 to y1, n sides, under matrix m.
export function cylFaces(m, r, y0, y1, mat, o = {}) {
  const n = o.n ?? 28;
  const faces = [];
  const ring = y => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
  const A = ring(y0), B = ring(y1);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = (i + .5) / n * Math.PI * 2;
    faces.push({ pts: [A[i], A[j], B[j], B[i]].map(p => ap(m, p)).reverse(), n: apn(m, [Math.cos(a), 0, Math.sin(a)]), mat: o.sideMat || mat, tag: 'side' });
  }
  if (o.top !== false) faces.push({ pts: B.map(p => ap(m, p)), n: apn(m, [0, 1, 0]), mat: o.topMat || mat, tag: 'top' });
  if (o.bottom !== false) faces.push({ pts: A.map(p => ap(m, p)).reverse(), n: apn(m, [0, -1, 0]), mat: o.bottomMat || mat, tag: 'bottom' });
  return faces;
}

// A tube along a 3D polyline (cables, stands, sticks), drawn as a stroked line whose width
// follows depth. Not shaded: a dark core with a lit edge, which is how an ink drawing does a tube.
export function tube(g, c, pts, radius, col, o = {}) {
  const pp = pts.map(p => project(c, p)).filter(p => p.z > c.near);
  if (pp.length < 2) return;
  g.save();
  g.lineCap = o.cap || 'round'; g.lineJoin = 'round';
  for (let i = 0; i < pp.length - 1; i++) {
    const a = pp[i], b = pp[i + 1];
    const w = radius * 2 * (a.s + b.s) / 2;
    if (o.ink !== false) {
      g.strokeStyle = o.inkCol || '#0c0a0c'; g.lineWidth = w + (o.line ?? 2) * 2;
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
  }
  for (let i = 0; i < pp.length - 1; i++) {
    const a = pp[i], b = pp[i + 1];
    const w = radius * 2 * (a.s + b.s) / 2;
    g.strokeStyle = col; g.lineWidth = w;
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    if (o.glint) {
      g.strokeStyle = o.glint; g.lineWidth = Math.max(.8, w * .28);
      g.beginPath(); g.moveTo(a.x - w * .2, a.y - w * .2); g.lineTo(b.x - w * .2, b.y - w * .2); g.stroke();
    }
  }
  g.restore();
}

// A flat shape on a plane in 3D: pts2 in the plane's (u, v) coordinates, placed by matrix m
// (the plane is z = 0 of m). Filled and optionally stroked, exactly in perspective.
export function planeShape(g, c, m, pts2, fill, o = {}) {
  const pp = projPoly(c, pts2.map(([u, v]) => ap(m, [u, v, 0])));
  if (!pp) return null;
  g.beginPath(); tracePoly(g, pp);
  if (fill) { g.fillStyle = fill; g.fill(o.rule || 'nonzero'); }
  if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw || 1; g.stroke(); }
  return pp;
}

// Draw a list of { z, draw } far to near: the painter's order for a scene of solids.
export function paint(g, items) {
  items.sort((a, b) => b.z - a.z);
  for (const it of items) it.draw(g);
}
export const depth = (c, p) => toCam(c, c.mirror ? ap(c.mirror, p) : p)[2];

// Where a screen point lands on a plane (z = 0 of matrix m, which must be a rigid transform):
// the plane's own (u, v), or null if the ray misses. For laying out type in screen terms on a
// surface in the room.
export function screenToPlane(c, m, sx, sy) {
  const d = norm(vadd(vadd(vmul(c.r, (sx - c.cx) / c.focal), vmul(c.u, -(sy - c.cy) / c.focal)), c.f));
  const p0 = ap(m, [0, 0, 0]), n = apn(m, [0, 0, 1]);
  const den = dot(d, n);
  if (Math.abs(den) < 1e-6) return null;
  const k = dot(vsub(p0, c.pos), n) / den;
  if (k <= 0) return null;
  const hit = vadd(c.pos, vmul(d, k));
  const ex = apn(m, [1, 0, 0]), ey = apn(m, [0, 1, 0]);
  const rel = vsub(hit, p0);
  return [dot(rel, ex), dot(rel, ey)];
}
