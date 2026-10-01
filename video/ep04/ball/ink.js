// The ink: how everything in the film is drawn. A 1930s cartoon cel is a brush line in warm black,
// thick where the shape turns away from the light (below and to the right) and thin where it faces it,
// tapering where the brush lifts, with flat paint laid on the back of the cel a hair out of register.
// So: fills are flat and hold still; the line is a ribbon of changing width that boils a little
// between three inkings of each drawing, as hand-inked cels do.
import { TAU, noise, hash, lerp, clamp, boil } from './kit.js';
import { INK, WHITE, C } from './palette.js';

// ---------------------------------------------------------------- outlines as points
export function ellipse(cx, cy, rx, ry, rot = 0, n = 0) {
  n = n || Math.max(24, Math.round((rx + ry) * .28));
  const out = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU - Math.PI / 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
}
// A rounded rectangle; `r` may be a number or [tl, tr, br, bl].
export function rrect(x, y, w, h, r = 12) {
  const R = Array.isArray(r) ? r : [r, r, r, r];
  const out = [], seg = (cx, cy, rr, a0) => { const n = Math.max(3, Math.round(rr * .35)); for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } };
  const edge = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / 14)); for (let i = 1; i < n; i++) out.push([lerp(x0, x1, i / n), lerp(y0, y1, i / n)]); };
  seg(x + w - R[1], y + R[1], R[1], -Math.PI / 2); edge(x + w, y + R[1], x + w, y + h - R[2]);
  seg(x + w - R[2], y + h - R[2], R[2], 0); edge(x + w - R[2], y + h, x + R[3], y + h);
  seg(x + R[3], y + h - R[3], R[3], Math.PI / 2); edge(x, y + h - R[3], x, y + R[0]);
  seg(x + R[0], y + R[0], R[0], Math.PI); edge(x + R[0], y, x + w - R[1], y);
  return out;
}
// Catmull-Rom through control points, `k` points per span.
export function spline(P, closed = false, k = 8) {
  const out = [], n = P.length;
  if (n < 3) return P.slice();
  const at = i => closed ? P[(i + n) % n] : P[clamp(i, 0, n - 1)];
  const spans = closed ? n : n - 1;
  for (let i = 0; i < spans; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  if (!closed) out.push(P[n - 1]);
  return out;
}
// A quadratic curve from a to b bowing sideways by `bend` (a fraction of its length).
export function arc(a, b, bend = .2, n = 16) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const c = [mx - dy * bend, my + dx * bend], out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); }
  return out;
}
export const xf = (pts, x, y, s = 1, rot = 0) => { const c = Math.cos(rot), sn = Math.sin(rot); return pts.map(([px, py]) => [x + (px * c - py * sn) * s, y + (px * sn + py * c) * s]); };

// A hand's wander along an outline: low-frequency, `amt` pixels, the same for a given seed.
export function hand(P, amt, seed, closed = true) {
  if (!amt) return P;
  let L = 0; const acc = [0];
  for (let i = 1; i < P.length; i++) { L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); acc.push(L); }
  const f = 1 / 90;
  return P.map((p, i) => {
    let u = acc[i] * f;
    if (closed) { const tot = L * f; const wrap = Math.max(1, Math.round(tot)); u = u / tot * wrap; const a = noise(u, seed) * (1 - (u % wrap) / wrap) + noise(u - wrap, seed) * ((u % wrap) / wrap); return [p[0] + a * amt, p[1] + noise(u, seed + 7.7) * amt]; }
    return [p[0] + noise(u, seed) * amt, p[1] + noise(u, seed + 7.7) * amt];
  });
}

// ---------------------------------------------------------------- the brush line
// A ribbon along P of width w, heavier where its normal faces down-right, tapering at open ends.
// `boilAmt` jiggles the line (not the paint) between the three inkings.
export function line(g, P, o = {}) {
  const w = o.w ?? 7, closed = !!o.closed, n = P.length;
  if (n < 2) return;
  const seed = (o.seed ?? 1) + (o.still ? 0 : boil() * 31.7);
  const Q = hand(P, o.boilAmt ?? Math.min(2.2, w * .22), seed, closed);
  const L = [], R = [];
  const taper = o.taper ?? !closed, heavy = o.heavy ?? .55, light = o.light ?? [.55, .83];
  for (let i = 0; i < n; i++) {
    const a = Q[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = Q[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const nx = dy, ny = -dx;   // outward for a clockwise outline
    // heavier where the outline's normal points away from the light (which comes from the upper left)
    let k = 1 + heavy * Math.max(0, nx * light[0] + ny * light[1]) - heavy * .3;
    k *= 1 + .18 * noise(i * .23, seed + 3);
    if (taper) { const u = i / (n - 1); const e = Math.min(u, 1 - u) * 2; k *= lerp(o.tipMin ?? .18, 1, Math.pow(clamp(e * (o.taperLen ?? 2.2)), .6)); }
    const hw = Math.max(.35, w * k * .5);
    L.push([Q[i][0] + nx * hw, Q[i][1] + ny * hw]); R.push([Q[i][0] - nx * hw, Q[i][1] - ny * hw]);
  }
  g.fillStyle = C(o.color || INK);
  g.beginPath();
  if (closed) {
    g.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]); g.closePath();
    g.moveTo(R[n - 1][0], R[n - 1][1]); for (let i = n - 2; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
    g.fill('evenodd');
  } else {
    g.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath();
    g.fill();
    // round the brush's ends a little
    if (!taper) for (const i of [0, n - 1]) { g.beginPath(); g.arc(Q[i][0], Q[i][1], w * .5, 0, TAU); g.fill(); }
  }
}
// Flat cel paint: the outline filled, nudged a hair off the line, holding still.
export function paint(g, P, col, o = {}) {
  if (!col) return;
  const off = o.off ?? 1.6, seed = o.seed ?? 1;
  const Q = o.raw ? P : hand(P, o.amt ?? 1.2, seed * 1.37 + 11, true);
  g.fillStyle = C(col);
  g.beginPath(); g.moveTo(Q[0][0] + off, Q[0][1] + off * .6);
  for (let i = 1; i < Q.length; i++) g.lineTo(Q[i][0] + off, Q[i][1] + off * .6);
  g.closePath(); g.fill();
}
// Paint a shape and ink it. `shade` lays a darker cel of the same shape, offset down-right and
// clipped inside, the one tone of shadow the old cartoons allowed themselves.
export function shape(g, P, o = {}) {
  const seed = o.seed ?? 1;
  const Q = o.amt === 0 ? P : hand(P, o.amt ?? 1.5, seed, true);
  if (o.fill) {
    if (o.shade) {
      // the shade is the rim, below and to the right, that a copy of the lit paint nudged up-left leaves
      paint(g, Q, o.shade, { seed, off: o.off, raw: true });
      g.save(); pathOf(g, Q, true); g.clip();
      const [dx, dy] = o.shadeOff || [-12, -14];
      paint(g, Q.map(([x, y]) => [x + dx, y + dy]), o.fill, { raw: true, off: 0 });
      g.restore();
    } else paint(g, Q, o.fill, { seed, off: o.off, raw: true });
    if (o.gloss) gloss(g, Q, o.gloss);
  }
  if (o.w !== 0) line(g, Q, { w: o.w ?? 7, closed: true, seed, color: o.line, heavy: o.heavy, boilAmt: o.boilAmt, still: o.still });
}
// A shade inside a shape: paint the whole shape in `shade`, then the lit part in `fill` nudged up-left.
export function shaded(g, P, fill, shadeCol, o = {}) {
  const seed = o.seed ?? 1, Q = o.amt === 0 ? P : hand(P, o.amt ?? 1.5, seed, true);
  const [dx, dy] = o.shadeOff || [-10, -12];
  paint(g, Q, shadeCol, { raw: true, off: 1.6 });
  g.save(); pathOf(g, Q, true); g.clip();
  paint(g, Q.map(([x, y]) => [x + dx, y + dy]), fill, { raw: true, off: 0 });
  g.restore();
  if (o.gloss) gloss(g, Q, o.gloss);
  if (o.w !== 0) line(g, Q, { w: o.w ?? 7, closed: true, seed, color: o.line, heavy: o.heavy, boilAmt: o.boilAmt });
}
// The hard white highlight of a cel: a bean near the top-left of the shape.
function gloss(g, Q, o) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of Q) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const w = x1 - x0, h = y1 - y0;
  g.fillStyle = C(o.col || WHITE); g.globalAlpha *= o.a ?? .85;
  g.beginPath(); g.ellipse(x0 + w * (o.x ?? .28), y0 + h * (o.y ?? .22), w * (o.w ?? .09), h * (o.h ?? .06), o.rot ?? -.6, 0, TAU); g.fill();
  g.globalAlpha /= o.a ?? .85;
}
export function pathOf(g, P, closed = true) {
  g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); if (closed) g.closePath();
}
// An open brush stroke: a spline through the points.
export function stroke(g, P, o = {}) { line(g, P.length > 2 && !o.raw ? spline(P, false, o.k || 6) : P, { taper: true, ...o }); }
// A filled dot of ink (pupils, rivets, full stops).
export function dot(g, x, y, r, col = INK) { g.fillStyle = C(col); g.beginPath(); g.ellipse(x, y, r, r * 1.04, 0, 0, TAU); g.fill(); }

// ---------------------------------------------------------------- the rubber hose
// A limb as one bending tube from a to b: an ink hose (the old black arm) or, with `fill`, a
// painted tube inked on both sides. `bend` bows it; positive bows to the left of a→b.
export function hose(g, a, b, o = {}) {
  const w = o.w ?? 16, P = arc(a, b, o.bend ?? .18, 18);
  if (!o.fill) { line(g, P, { w, taper: false, seed: o.seed ?? 5, heavy: .15, boilAmt: 1.2 }); return; }
  line(g, P, { w: w + (o.lw ?? 6) * 2, taper: false, seed: o.seed ?? 5, heavy: .1, boilAmt: 1.2 });
  line(g, P, { w, taper: false, seed: (o.seed ?? 5) + 1, heavy: 0, boilAmt: .5, color: o.fill });
}
export function hosePts(a, b, bend = .18) { return arc(a, b, bend, 18); }

// ---------------------------------------------------------------- gloves, shoes and eyes
// A white four-finger cartoon glove at (x, y), pointing along `ang`, of size s (its palm's radius).
// pose: 'open' | 'fist' | 'point' | 'grip' | 'wave' | 'thumb'. `flip` mirrors it (left hands).
export function glove(g, x, y, ang, s, pose = 'open', o = {}) {
  g.save(); g.translate(x, y); g.rotate(ang); if (o.flip) g.scale(1, -1);
  const lw = o.w ?? Math.max(3.5, s * .2), seed = o.seed ?? 9, col = o.col || WHITE;
  // cuff: a flared ring behind the palm
  const cuff = [[-s * 1.25, -s * .78], [-s * .55, -s * .6], [-s * .55, s * .6], [-s * 1.25, s * .78]];
  shape(g, spline(cuff, true, 4), { fill: col, w: lw, seed: seed + 1, amt: .5 });
  const fingers = [];
  if (pose === 'fist' || pose === 'grip') {
    for (let i = 0; i < 4; i++) fingers.push({ x: s * .62, y: (i - 1.5) * s * .42, rx: s * .42, ry: s * .26 });
  } else if (pose === 'point') {
    fingers.push({ x: s * 1.55, y: -s * .38, rx: s * 1.05, ry: s * .27, long: true });
    for (let i = 1; i < 4; i++) fingers.push({ x: s * .6, y: (i - 1.2) * s * .38, rx: s * .38, ry: s * .24 });
  } else {
    const spread = pose === 'wave' ? .3 : .22;
    for (let i = 0; i < 4; i++) { const a = (i - 1.5) * spread; fingers.push({ x: Math.cos(a) * s * 1.08, y: Math.sin(a) * s * 1.02, rx: s * .56, ry: s * .3, rot: a }); }
  }
  // palm
  const palm = ellipse(0, 0, s * .95, s * .9, 0, 26);
  for (const f of fingers.slice().reverse()) shape(g, ellipse(f.x, f.y, f.rx, f.ry, f.rot || 0, 20), { fill: col, w: lw * .85, seed: seed + f.y, amt: .3 });
  shape(g, palm, { fill: col, w: lw, seed: seed + 2, amt: .4 });
  // thumb
  const th = pose === 'fist' || pose === 'grip' ? [s * .35, -s * .78, s * .45, s * .26, -.5] : [s * .25, -s * 1.05, s * .52, s * .26, -1.1];
  shape(g, ellipse(th[0], th[1], th[2], th[3], th[4], 18), { fill: col, w: lw * .85, seed: seed + 3, amt: .3 });
  // the three stitched lines on the back of the hand
  if (pose !== 'fist' && pose !== 'grip') for (let i = -1; i <= 1; i++) stroke(g, [[-s * .45, i * s * .26], [s * .1, i * s * .3]], { w: lw * .45, seed: seed + 5 + i });
  g.restore();
}
// A pie-cut eye: a black oval with a wedge of light cut out of it, looking toward (lx, ly) in -1..1.
export function pieEye(g, x, y, rx, ry, o = {}) {
  const lx = o.lx ?? 0, ly = o.ly ?? 0, blink = o.blink ?? 0;
  const h = ry * (1 - blink * .92);
  if (o.white) { shape(g, ellipse(x, y, rx * (o.white), ry * (o.white) * (1 - blink * .9)), { fill: o.whiteCol || WHITE, w: o.lw ?? 4, seed: o.seed ?? 3, amt: .4 }); }
  const px = x + lx * rx * (o.white ? .45 : .12), py = y + ly * h * (o.white ? .35 : .1);
  const prx = o.white ? rx * .62 : rx, pry = o.white ? h * .7 : h;
  g.fillStyle = C(INK); g.beginPath(); g.ellipse(px, py, prx, Math.max(1.5, pry), 0, 0, TAU); g.fill();
  if (blink < .6) {
    // the pie cut: a wedge of highlight at the upper right
    const cx = px + prx * .28, cy = py - pry * .38, r = Math.min(prx, pry) * .55;
    g.fillStyle = C(WHITE); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI * .95, -Math.PI * .55); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(cx + r * .1, cy - r * .35, r * .32, r * .26, 0, 0, TAU); g.fill();
  }
}
// A big round cartoon shoe, toe pointing along `dir` (1 right, -1 left).
export function shoe(g, x, y, s, dir = 1, o = {}) {
  const P = spline([[-s * .5 * dir, -s * .2], [s * .15 * dir, -s * .5], [s * 1.05 * dir, -s * .42], [s * 1.25 * dir, 0], [s * .95 * dir, s * .3], [-s * .5 * dir, s * .3], [-s * .72 * dir, s * .05]], true, 6);
  shape(g, xf(P, x, y), { fill: o.col || INK, w: o.w ?? Math.max(3, s * .16), seed: o.seed ?? 21, gloss: o.gloss === false ? null : { x: dir > 0 ? .62 : .38, y: .3, w: .14, h: .12, a: .7 } });
}
