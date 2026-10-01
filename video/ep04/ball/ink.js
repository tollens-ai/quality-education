// The ink: how every character and prop in the film is drawn. A cartoon cel of about 1930, polished:
// a warm black brush line that swells where a shape turns away from the light (below and to the
// right) and thins where it faces it, tapering where the brush lifts; flat paint behind it with one
// soft, rounded shade and a small hard highlight. The paint holds still; the line boils a little
// between three inkings of each drawing, as hand-inked cels do.
import { TAU, noise, hash, lerp, clamp, boil, hexRgb } from './kit.js';
import { INK, WHITE, C, sh as shadeOf, lt as lightOf } from './palette.js';

// ---------------------------------------------------------------- outlines as points
export function ellipse(cx, cy, rx, ry, rot = 0, n = 0) {
  n = n || Math.max(28, Math.round((rx + ry) * .3));
  const out = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU - Math.PI / 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
}
// A rounded rectangle; `r` may be a number or [tl, tr, br, bl].
export function rrect(x, y, w, h, r = 12) {
  const R = (Array.isArray(r) ? r : [r, r, r, r]).map(v => Math.min(v, w / 2, h / 2));
  const out = [], seg = (cx, cy, rr, a0) => { const n = Math.max(3, Math.round(rr * .3)); for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } };
  const edge = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / 12)); for (let i = 1; i < n; i++) out.push([lerp(x0, x1, i / n), lerp(y0, y1, i / n)]); };
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
// A cubic from a to b through two controls.
export function bez(a, c1, c2, b, n = 18) {
  const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([0, 1].map(d => u * u * u * a[d] + 3 * u * u * t * c1[d] + 3 * u * t * t * c2[d] + t * t * t * b[d])); }
  return out;
}
export const xf = (pts, x, y, s = 1, rot = 0) => { const c = Math.cos(rot), sn = Math.sin(rot); return pts.map(([px, py]) => [x + (px * c - py * sn) * s, y + (px * sn + py * c) * s]); };
export const bbox = P => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 }; };

// A hand's wander along an outline: low-frequency, `amt` pixels, the same for a given seed.
export function hand(P, amt, seed, closed = true) {
  if (!amt) return P;
  let L = 0; const acc = [0];
  for (let i = 1; i < P.length; i++) { L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); acc.push(L); }
  const f = 1 / 110;
  return P.map((p, i) => {
    let u = acc[i] * f;
    if (closed) { const tot = Math.max(1e-6, L * f); const wrap = Math.max(1, Math.round(tot)); u = u / tot * wrap; const a = noise(u, seed) * (1 - (u % wrap) / wrap) + noise(u - wrap, seed) * ((u % wrap) / wrap); const b = noise(u, seed + 7.7) * (1 - (u % wrap) / wrap) + noise(u - wrap, seed + 7.7) * ((u % wrap) / wrap); return [p[0] + a * amt, p[1] + b * amt]; }
    return [p[0] + noise(u, seed) * amt, p[1] + noise(u, seed + 7.7) * amt];
  });
}

// ---------------------------------------------------------------- the brush line
// A ribbon along P of width w, heavier where its normal faces down-right, tapering at open ends.
// The line (not the paint) boils between three inkings.
export function line(g, P, o = {}) {
  const w = o.w ?? 7, closed = !!o.closed, n = P.length;
  if (n < 2) return;
  const seed = (o.seed ?? 1) + (o.still ? 0 : boil() * 31.7);
  const Q = hand(P, o.boilAmt ?? Math.min(1.3, w * .14), seed, closed);
  const L = [], R = [];
  const taper = o.taper ?? !closed, heavy = o.heavy ?? .6, light = o.light ?? [.55, .83];
  for (let i = 0; i < n; i++) {
    const a = Q[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = Q[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const nx = dy, ny = -dx;   // outward for a clockwise outline
    let k = 1 + heavy * Math.max(0, nx * light[0] + ny * light[1]) - heavy * .32;
    k *= 1 + .12 * noise(i * .19, seed + 3);
    if (taper) { const u = i / (n - 1); const e = Math.min(u, 1 - u) * 2; k *= lerp(o.tipMin ?? .14, 1, Math.pow(clamp(e * (o.taperLen ?? 2.4)), .55)); }
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
    if (!taper) for (const i of [0, n - 1]) { g.beginPath(); g.arc(Q[i][0], Q[i][1], w * .5, 0, TAU); g.fill(); }
  }
}
export function pathOf(g, P, closed = true) {
  g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); if (closed) g.closePath();
}
// Flat cel paint, holding still.
export function paint(g, P, col, o = {}) {
  if (!col) return;
  g.fillStyle = C(col);
  pathOf(g, P, true); g.fill();
}
const rgbaOf = (col, a) => { const [r, gg, b] = hexRgb(C(col)); return `rgba(${r},${gg},${b},${clamp(a)})`; };

// The soft form inside a painted shape: the lit side warms a little, and past a soft terminator the
// far side falls into the shade colour. form 'round' (a ball's radial light) or 'block' (light
// across a broad face, shade gathered on the lower right edge).
export function form(g, P, o = {}) {
  const b = bbox(P), fill = o.fill, shade = o.shade || shadeOf(fill, .32), lit = o.lit || lightOf(fill, .38);
  const k = o.k ?? 1;
  g.save(); pathOf(g, P, true); g.clip();
  if ((o.form || 'round') === 'round') {
    const cx = b.x0 + b.w * (o.cx ?? .36), cy = b.y0 + b.h * (o.cy ?? .3), R = Math.hypot(b.w, b.h) * (o.R ?? .7);
    const gr = g.createRadialGradient(cx, cy, R * .02, cx, cy, R);
    gr.addColorStop(0, rgbaOf(lit, .55 * k)); gr.addColorStop(.38, rgbaOf(lit, 0)); gr.addColorStop(.58, rgbaOf(shade, 0)); gr.addColorStop(.84, rgbaOf(shade, .8 * k)); gr.addColorStop(1, rgbaOf(shade, .95 * k));
    g.fillStyle = gr; g.fillRect(b.x0 - 4, b.y0 - 4, b.w + 8, b.h + 8);
  } else {
    // light falls from the upper left: a gentle lift on the face, the shade along the lower and right edges
    const gr = g.createLinearGradient(b.x0, b.y0, b.x0 + b.w * .55, b.y0 + b.h);
    gr.addColorStop(0, rgbaOf(lit, .4 * k)); gr.addColorStop(.35, rgbaOf(lit, 0)); gr.addColorStop(.7, rgbaOf(shade, 0)); gr.addColorStop(1, rgbaOf(shade, .75 * k));
    g.fillStyle = gr; g.fillRect(b.x0 - 4, b.y0 - 4, b.w + 8, b.h + 8);
    const gr2 = g.createLinearGradient(b.x1 - b.w * .3, 0, b.x1, 0);
    gr2.addColorStop(0, rgbaOf(shade, 0)); gr2.addColorStop(1, rgbaOf(shade, .55 * k));
    g.fillStyle = gr2; g.fillRect(b.x0 - 4, b.y0 - 4, b.w + 8, b.h + 8);
  }
  // reflected light just inside the lower edge, the old painters' trick for roundness
  if (o.bounce !== false) {
    const gr3 = g.createLinearGradient(0, b.y1 - b.h * .14, 0, b.y1);
    gr3.addColorStop(0, rgbaOf(lit, 0)); gr3.addColorStop(1, rgbaOf(lit, .16 * k));
    g.fillStyle = gr3; g.fillRect(b.x0 - 4, b.y1 - b.h * .14, b.w + 8, b.h * .14 + 4);
  }
  g.restore();
}
// The hard highlight of a cel: a bean near the top-left of the shape.
export function gloss(g, P, o = {}) {
  const b = bbox(P);
  g.save(); g.fillStyle = C(o.col || WHITE); g.globalAlpha *= o.a ?? .9;
  const x = b.x0 + b.w * (o.x ?? .26), y = b.y0 + b.h * (o.y ?? .2), rw = b.w * (o.w ?? .08), rh = b.h * (o.h ?? .055);
  g.beginPath(); g.ellipse(x, y, rw, rh, o.rot ?? -.6, 0, TAU); g.fill();
  if (o.dot !== false) { g.beginPath(); g.arc(x + rw * 1.9, y + rh * .4, Math.min(rw, rh) * .45, 0, TAU); g.fill(); }
  g.restore();
}
// Paint a shape, give it its form, and ink it. o: fill, shade, lit, form ('round'|'block'|false),
// k (strength of the form), gloss ({x, y, w, h} or true), w (line width, 0 for none), line colour,
// amt (the outline's own wander), seed.
export function shape(g, P, o = {}) {
  const seed = o.seed ?? 1;
  const Q = o.amt === 0 ? P : hand(P, o.amt ?? 1.1, seed, true);
  if (o.fill) {
    paint(g, Q, o.fill);
    if (o.form !== false && !o.flat) form(g, Q, o);
    if (o.gloss) gloss(g, Q, o.gloss === true ? {} : o.gloss);
  }
  if (o.w !== 0) line(g, Q, { w: o.w ?? 7, closed: true, seed, color: o.line, heavy: o.heavy, boilAmt: o.boilAmt, still: o.still });
  return Q;
}
// An open brush stroke: a spline through the points.
export function stroke(g, P, o = {}) { line(g, P.length > 2 && !o.raw ? spline(P, false, o.k || 6) : P, { taper: true, ...o }); }
// A filled dot of ink (pupils, rivets, full stops).
export function dot(g, x, y, r, col = INK) { g.fillStyle = C(col); g.beginPath(); g.ellipse(x, y, r, r * 1.04, 0, 0, TAU); g.fill(); }

// ---------------------------------------------------------------- the rubber hose
// A limb as one bending tube from a to b: an ink hose (the classic black arm) or, with `fill`, a
// painted tube inked on both sides. `bend` bows it; positive bows to the left of a→b.
export function hose(g, a, b, o = {}) {
  const w = o.w ?? 16, P = o.pts || arc(a, b, o.bend ?? .18, 20);
  if (!o.fill) {
    line(g, P, { w, taper: false, seed: o.seed ?? 5, heavy: .2, boilAmt: .9 });
    // a thin sheen along the lit side of a black hose
    if (o.sheen !== false && w > 8) {
      const S = P.map(([x, y], i) => { const j = Math.min(P.length - 1, i + 1), k2 = Math.max(0, i - 1); const dx = P[j][0] - P[k2][0], dy = P[j][1] - P[k2][1], d = Math.hypot(dx, dy) || 1; return [x + dy / d * w * .2 * -Math.sign(dx || 1) * 0 - dy / d * w * .18, y + dx / d * w * .18]; });
      g.save(); g.globalAlpha *= .35; line(g, S.slice(3, -3), { w: w * .16, taper: true, seed: (o.seed ?? 5) + 9, color: '#6d625a', heavy: 0, boilAmt: .5 }); g.restore();
    }
    return P;
  }
  line(g, P, { w: w + (o.lw ?? 6) * 2, taper: false, seed: o.seed ?? 5, heavy: .1, boilAmt: .9 });
  line(g, P, { w, taper: false, seed: (o.seed ?? 5) + 1, heavy: 0, boilAmt: .4, color: o.fill });
  return P;
}
export function hosePts(a, b, bend = .18) { return arc(a, b, bend, 20); }

// ---------------------------------------------------------------- gloves, shoes and eyes
// A white four-finger cartoon glove at (x, y), pointing along `ang`, of size s (its palm's radius).
// pose: 'open' | 'fist' | 'point' | 'grip' | 'wave' | 'thumb' | 'flat' | 'four' | 'two'. `flip` mirrors it (left hands).
export function glove(g, x, y, ang, s, pose = 'open', o = {}) {
  g.save(); g.translate(x, y); g.rotate(ang); if (o.flip) g.scale(1, -1);
  const lw = o.w ?? Math.max(3, s * .19), seed = o.seed ?? 9, col = o.col || WHITE;
  const sh = o.shade || '#cfc3ae';
  // cuff: a flared, rolled ring behind the palm
  const cuff = spline([[-s * 1.3, -s * .84], [-s * .62, -s * .62], [-s * .62, s * .62], [-s * 1.3, s * .84]], true, 5);
  shape(g, cuff, { fill: col, shade: sh, form: 'block', k: .8, w: lw, seed: seed + 1, amt: .4 });
  stroke(g, [[-s * 1.05, -s * .72], [-s * 1.08, 0], [-s * 1.05, s * .72]], { w: lw * .55, seed: seed + 12 });
  const fingers = [];
  if (pose === 'fist' || pose === 'grip') {
    for (let i = 0; i < 4; i++) fingers.push({ x: s * .66, y: (i - 1.5) * s * .43, rx: s * .43, ry: s * .27 });
  } else if (pose === 'point') {
    fingers.push({ x: s * 1.6, y: -s * .4, rx: s * 1.05, ry: s * .27 });
    for (let i = 1; i < 4; i++) fingers.push({ x: s * .62, y: (i - 1.2) * s * .38, rx: s * .4, ry: s * .25 });
  } else if (pose === 'two' || pose === 'four') {
    const up = pose === 'two' ? 2 : 4;
    for (let i = 0; i < 4; i++) { const a = (i - 1.5) * .26; if (i < up) fingers.push({ x: Math.cos(a) * s * 1.5, y: Math.sin(a) * s * 1.3, rx: s * .9, ry: s * .27, rot: a }); else fingers.push({ x: s * .6, y: (i - 1.5) * s * .4, rx: s * .4, ry: s * .25 }); }
  } else if (pose === 'flat') {
    for (let i = 0; i < 4; i++) fingers.push({ x: s * 1.25, y: (i - 1.5) * s * .36, rx: s * .62, ry: s * .2 });
  } else {
    const spread = pose === 'wave' ? .3 : .22;
    for (let i = 0; i < 4; i++) { const a = (i - 1.5) * spread; fingers.push({ x: Math.cos(a) * s * 1.12, y: Math.sin(a) * s * 1.04, rx: s * .6, ry: s * .29, rot: a }); }
  }
  const palm = ellipse(0, 0, s * .97, s * .92, 0, 28);
  for (const f of fingers.slice().reverse()) shape(g, ellipse(f.x, f.y, f.rx, f.ry, f.rot || 0, 22), { fill: col, shade: sh, k: .7, w: lw * .85, seed: seed + f.y, amt: .25 });
  shape(g, palm, { fill: col, shade: sh, k: .7, w: lw, seed: seed + 2, amt: .3 });
  const th = pose === 'fist' || pose === 'grip' ? [s * .36, -s * .8, s * .46, s * .27, -.5] : [s * .25, -s * 1.08, s * .54, s * .27, -1.1];
  if (pose !== 'flat') shape(g, ellipse(th[0], th[1], th[2], th[3], th[4], 20), { fill: col, shade: sh, k: .7, w: lw * .85, seed: seed + 3, amt: .25 });
  if (pose !== 'fist' && pose !== 'grip') for (let i = -1; i <= 1; i++) stroke(g, [[-s * .48, i * s * .26], [s * .08, i * s * .3]], { w: lw * .42, seed: seed + 5 + i });
  g.restore();
}
// An eye, the old cartoon way. A black oval pupil with a pie-cut wedge of light, looking toward
// (lx, ly) in -1..1; optionally in a white, under a lid of the face's colour. o: white (scale of
// the white oval to the pupil, 0 for none), blink 0..1, lid 0..1 (a lazy or smug lid), tilt (the
// lid's slope: + worried, - cross), col (the lid's paint), size of the cut.
export function eye(g, x, y, rx, ry, o = {}) {
  const lx = o.lx ?? 0, ly = o.ly ?? 0, blink = clamp(o.blink ?? 0), seed = o.seed ?? 3, lw = o.lw ?? Math.max(2.5, rx * .28);
  const W = o.white || 0;
  const open = 1 - blink * .94;
  if (W) {
    const wx = rx * W, wy = ry * W * .95;
    const P = ellipse(x, y, wx, wy * open, 0, 30);
    shape(g, P, { fill: o.whiteCol || WHITE, shade: '#d9cfbf', k: .5, w: lw, seed, amt: .3 });
    g.save(); pathOf(g, P, true); g.clip();
    const px = x + lx * (wx - rx * .95), py = y + ly * (wy - ry * .9) * open;
    pupil(g, px, py, rx, ry * Math.max(.2, open), o);
    lidOver(g, x, y, wx, wy, o, open);
    g.restore();
    return;
  }
  const px = x + lx * rx * .18, py = y + ly * ry * .12;
  if (blink > .85) { stroke(g, [[x - rx * 1.2, y], [x, y + ry * .12], [x + rx * 1.2, y]], { w: lw * 1.1, seed: seed + 4 }); return; }
  g.save();
  const P = ellipse(px, py, rx, ry * open, 0, 28);
  pupil(g, px, py, rx, ry * open, o, P);
  if (o.lid || blink) { pathOf(g, P, true); g.clip(); lidOver(g, px, py, rx * 1.2, ry, o, open); }
  g.restore();
}
function pupil(g, px, py, rx, ry, o, P) {
  g.fillStyle = C(INK); g.beginPath(); g.ellipse(px, py, rx, Math.max(1.2, ry), 0, 0, TAU); g.fill();
  if (ry < rx * .5) return;
  // the pie cut: a wedge of light cut from the upper right, and a small round catch-light
  g.save(); g.beginPath(); g.ellipse(px, py, rx, ry, 0, 0, TAU); g.clip();
  const cx = px + rx * .1, cy = py - ry * .12, a0 = -Math.PI * (o.cut0 ?? .5), a1 = -Math.PI * (o.cut1 ?? .2);
  g.fillStyle = C(o.cutCol || WHITE);
  g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, Math.max(rx, ry) * 1.4, a0, a1); g.closePath(); g.fill();
  g.restore();
  g.fillStyle = C(WHITE); g.beginPath(); g.ellipse(px - rx * .35, py + ry * .42, rx * .16, ry * .1, 0, 0, TAU); g.fill();
}
function lidOver(g, x, y, wx, wy, o, open) {
  const lid = clamp(Math.max(o.lid ?? 0, 1 - open)), tilt = o.tilt ?? 0;
  if (lid <= .02) return;
  const ly0 = y - wy * 1.15, ly1 = y - wy + lid * wy * 2.05;
  const P = [[x - wx * 1.4, ly0], [x + wx * 1.4, ly0], [x + wx * 1.4, ly1 + tilt * wy * .6], [x - wx * 1.4, ly1 - tilt * wy * .6]];
  g.fillStyle = C(o.col || INK); pathOf(g, P, true); g.fill();
  line(g, [[x - wx * 1.3, ly1 - tilt * wy * .55], [x + wx * 1.3, ly1 + tilt * wy * .55]], { w: Math.max(3, wx * .2), taper: false, seed: 7, boilAmt: .4 });
}
// Kept for the older call sites: a pie-cut eye with an optional white.
export function pieEye(g, x, y, rx, ry, o = {}) { eye(g, x, y, rx, ry, o); }
// A big round cartoon shoe, toe pointing along `dir` (1 right, -1 left).
export function shoe(g, x, y, s, dir = 1, o = {}) {
  const P = spline([[-s * .55 * dir, -s * .2], [s * .1 * dir, -s * .55], [s * 1.0 * dir, -s * .5], [s * 1.32 * dir, -s * .05], [s * 1.0 * dir, s * .32], [-s * .5 * dir, s * .32], [-s * .74 * dir, s * .06]], true, 7);
  const col = o.col || INK;
  shape(g, xf(P, x, y), { fill: col, shade: '#000000', lit: col === INK ? '#5d5149' : undefined, k: col === INK ? .6 : 1, w: o.w ?? Math.max(3, s * .15), seed: o.seed ?? 21, gloss: o.gloss === false ? null : { x: dir > 0 ? .62 : .3, y: .2, w: .13, h: .1, a: .75, dot: false } });
  // the sole
  stroke(g, [[x - s * .5 * dir, y + s * .3], [x + s * 1.0 * dir, y + s * .3]], { w: Math.max(2, s * .1), seed: (o.seed ?? 21) + 3, color: '#000' });
}
