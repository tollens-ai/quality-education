// The zine kit: cut paper, tape and marker doodles. Every piece is flat colour; what makes it
// look hand-made is the scissor-cut edge (the wobble), the paper margin, the hard shadow where it
// stands off the page, and the marker line over it, which boils on twos.
import { C, TAU, clamp, lerp, rnd, noise1, rr, circle, ellipse, poly, star, heart, line, INK, mix, rgba, shade } from './kit.js';
import { letter, measure } from './hand.js';

// Put a piece of cut paper down: set the state, draw `path`, fill it. o: { drop: px or false,
// dropCol, border: px or false, borderCol, ink: col or false, inkW, reg: [dx, dy] }.
export function cut(g, path, col, o = {}) {
  g.save();
  const d = o.drop ?? 8;
  g.drop = d ? { dx: d * (o.dropX ?? .7), dy: d, col: o.dropCol || rgba(C.ink, .9) } : null;
  g.border = o.border ? { w: o.border, col: o.borderCol || C.cream } : null;
  g.reg = o.reg || null;
  g.ink = o.ink === false ? null : (o.ink || INK.col);
  g.inkW = o.inkW ?? 3.4;
  g.fillStyle = col;
  path(); g.fill();
  g.restore();
}

// A plain flat shape with a marker outline and no paper effects.
export function marker(g, path, col, w = 3.4, ink = INK.col) {
  g.save(); g.drop = null; g.border = null; g.ink = ink; g.inkW = w; g.fillStyle = col; path(); g.fill(); g.restore();
}

// A marker line (no fill): the path is traced as a felt-tip stroke.
export function scrawl(g, path, w = 4, col = INK.col) {
  g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; path(); g.stroke(); g.restore();
}

// Masking tape: a translucent strip with torn, zigzag ends.
export function tape(g, x, y, w, rot = 0, col = '#f3e3b5', h = 34) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.drop = null; g.border = null; g.ink = null;
  g.fillStyle = rgba(col, .88);
  g.beginPath();
  const n = 5;
  g.moveTo(-w / 2, -h / 2);
  g.lineTo(w / 2, -h / 2);
  for (let i = 1; i <= n; i++) g.lineTo(w / 2 + (i % 2 ? 5 : -2), -h / 2 + h * i / n);
  g.lineTo(-w / 2, h / 2);
  for (let i = n - 1; i >= 0; i--) g.lineTo(-w / 2 + (i % 2 ? -5 : 2), -h / 2 + h * i / n);
  g.closePath(); g.fill();
  g.restore();
}

// A strip of paper with torn ends: straight top and bottom, ragged left and right edges.
export function tornRect(g, x, y, w, h, seed = 1, o = {}) {
  const tl = o.tornL ?? true, tr = o.tornR ?? true;
  const n = Math.max(3, Math.round(h / 16));
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + w, y);
  for (let i = 1; i < n; i++) g.lineTo(x + w + (tr ? (rnd(i, seed) - .5) * h * .16 : 0), y + h * i / n);
  g.lineTo(x + w, y + h);
  g.lineTo(x, y + h);
  for (let i = n - 1; i > 0; i--) g.lineTo(x + (tl ? (rnd(i, seed + 5) - .5) * h * .16 : 0), y + h * i / n);
  g.closePath();
}

// A "HELLO my name is" sticker, the boy-band video's way of introducing each member.
export function nameTag(g, x, y, name, rot = 0, s = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  cut(g, () => rr(g, -190, -100, 380, 200, 18), '#e8343f', { drop: 10, inkW: 3.4 });
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = 2.6; g.fillStyle = C.cream; rr(g, -172, -18, 344, 104, 8); g.fill(); g.restore();
  letter(g, 'HELLO', 0, -52, 40, { col: C.cream, w: .2, align: 'center', seed: 4 });
  letter(g, 'MY NAME IS', 0, -26, 18, { col: C.cream, w: .18, align: 'center', seed: 5 });
  const sz = Math.min(52, 330 / Math.max(1, measure(name, 1, .17)));
  letter(g, name, 0, 34 + sz * .5, sz, { col: C.ink, w: .17, align: 'center', seed: 6 });
  g.restore();
}

// A drawing pin, seen from the front.
export function pin(g, x, y, col = C.red, s = 1) {
  g.save(); g.drop = { dx: 4 * s, dy: 6 * s, col: rgba(C.ink, .5) }; g.ink = INK.col; g.inkW = 2.4 * s;
  g.fillStyle = col; circle(g, x, y, 11 * s); g.fill();
  g.drop = null; g.ink = null; g.fillStyle = rgba('#ffffff', .6); circle(g, x - 3.5 * s, y - 3.5 * s, 3.2 * s); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- doodles
// Marker doodles for the margins. Each is drawn at (x, y) with size s; `t` makes them jiggle.
export function doodle(g, kind, x, y, s, o = {}) {
  const col = o.col || INK.col, fillCol = o.fill;
  const w = o.w ?? Math.max(2.4, s * .09);
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  g.drop = null; g.border = null; g.reg = null;
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  g.ink = fillCol ? col : null; g.inkW = w;
  if (kind === 'star') { star(g, 0, 0, s, s * .45, 5); if (fillCol) { g.fillStyle = fillCol; g.fill(); } else g.stroke(); }
  if (kind === 'sparkle') {
    g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * .1, -s * .1, s, 0); g.quadraticCurveTo(s * .1, s * .1, 0, s); g.quadraticCurveTo(-s * .1, s * .1, -s, 0); g.quadraticCurveTo(-s * .1, -s * .1, 0, -s); g.closePath();
    if (fillCol) { g.fillStyle = fillCol; g.fill(); } else g.stroke();
  }
  if (kind === 'heart') { heart(g, 0, 0, s * 1.6); if (fillCol) { g.fillStyle = fillCol; g.fill(); } else g.stroke(); }
  if (kind === 'bolt') {
    poly(g, [[s * .2, -s], [-s * .45, s * .12], [-s * .02, s * .12], [-s * .25, s], [s * .5, -s * .2], [s * .06, -s * .2]]);
    if (fillCol) { g.fillStyle = fillCol; g.fill(); } else g.stroke();
  }
  if (kind === 'spiral') {
    g.beginPath();
    for (let i = 0; i <= 60; i++) { const a = i / 60 * TAU * 2.4, r = s * i / 60; const px = Math.cos(a) * r, py = Math.sin(a) * r; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke();
  }
  if (kind === 'squiggle') {
    g.beginPath(); for (let i = 0; i <= 24; i++) { const px = -s + i / 24 * s * 2, py = Math.sin(i / 24 * TAU * 2) * s * .22; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
  }
  if (kind === 'x') { line(g, -s, -s, s, s); g.stroke(); line(g, s, -s, -s, s); g.stroke(); }
  if (kind === 'tick') { g.beginPath(); g.moveTo(-s, 0); g.lineTo(-s * .3, s * .7); g.lineTo(s, -s * .8); g.stroke(); }
  if (kind === 'circle') { ellipse(g, 0, 0, s, s * .8); g.stroke(); }
  if (kind === 'arrow') {
    g.beginPath(); g.moveTo(-s, s * .3); g.quadraticCurveTo(0, -s * .5, s, 0); g.stroke();
    g.beginPath(); g.moveTo(s - s * .35, -s * .28); g.lineTo(s, 0); g.lineTo(s - s * .38, s * .22); g.stroke();
  }
  if (kind === 'swoosh') { for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-s, k * s * .3); g.quadraticCurveTo(0, -s * .3 + k * s * .3, s * .8, k * s * .35); g.stroke(); } }
  g.restore();
}

// A scatter of doodles across a rectangle, fixed by seed; they jiggle on the boil.
export function doodleField(g, x0, y0, w, h, n, seed, o = {}) {
  const kinds = o.kinds || ['star', 'sparkle', 'bolt', 'heart', 'squiggle', 'spiral'];
  for (let i = 0; i < n; i++) {
    const k = kinds[Math.floor(rnd(i, seed) * kinds.length)];
    const s = lerp(o.min ?? 16, o.max ?? 34, rnd(i, seed + 1));
    const px = x0 + rnd(i, seed + 2) * w, py = y0 + rnd(i, seed + 3) * h;
    const jig = (INK.boil - 1) * 1.2;
    const cols = o.cols;
    doodle(g, k, px + jig, py - jig, s, { col: o.col, fill: cols ? cols[i % cols.length] : undefined, rot: (rnd(i, seed + 4) - .5) * 1.2 + jig * .02, w: o.w });
  }
}

// ---------------------------------------------------------------- grounds
// A sunburst: alternating flat wedges round (x, y), turning slowly.
export function sunburst(g, x, y, r, n, c1, c2, rot = 0) {
  g.save(); g.drop = null; g.border = null; g.ink = null;
  g.fillStyle = c1; g.fillRect(-100, -100, 1280, 2120);
  g.fillStyle = c2;
  for (let i = 0; i < n; i++) {
    const a0 = rot + i / n * TAU, a1 = a0 + TAU / n / 2;
    poly(g, [[x, y], [x + Math.cos(a0) * r, y + Math.sin(a0) * r], [x + Math.cos(a1) * r, y + Math.sin(a1) * r]]);
    g.fill();
  }
  g.restore();
}

// A hand-drawn checkerboard in perspective: the floor of a practice room, or a flat panel when
// `flat`. Squares are drawn one by one, so each has its own slightly wandering edge.
export function checker(g, o) {
  const { x0, x1, yTop, yBot, cols = 9, rows = 8, c1 = C.ink, c2 = C.cream, vx = 540, flat = false } = o;
  g.save(); g.drop = null; g.border = null; g.ink = null;
  g.fillStyle = c2; poly(g, [[x0, yBot], [x1, yBot], [flat ? x1 : lerp(vx, x1, o.topW ?? .55), yTop], [flat ? x0 : lerp(vx, x0, o.topW ?? .55), yTop]]); g.fill();
  const yAt = j => { const p = j / rows; return flat ? lerp(yTop, yBot, p) : yTop + (yBot - yTop) * Math.pow(p, 1.7); };
  const xAt = (i, y) => { const f = flat ? 1 : lerp(o.topW ?? .55, 1, (y - yTop) / (yBot - yTop)); return vx + (lerp(x0, x1, i / cols) - vx) * f; };
  g.fillStyle = c1;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if ((i + j + (o.phase || 0)) % 2) continue;
    const ya = yAt(j), yb = yAt(j + 1);
    poly(g, [[xAt(i, ya), ya], [xAt(i + 1, ya), ya], [xAt(i + 1, yb), yb], [xAt(i, yb), yb]]); g.fill();
  }
  g.restore();
}

// A flat colour field over the whole frame (with overscan).
export function field(g, col) {
  g.save(); g.drop = null; g.border = null; g.ink = null; g.reg = null;
  g.fillStyle = col; g.beginPath(); g.rect(-120, -120, 1320, 2160); g.fill();
  g.restore();
}

// Marker scribble shading: diagonal hatching inside the current clip, the way you'd shade with a
// felt-tip in a hurry.
export function hatch(g, x0, y0, w, h, gap = 16, col = INK.col, lw = 2.6, ang = -.9) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
  const L = w + h, ca = Math.cos(ang), sa = Math.sin(ang);
  for (let d = -L; d < L; d += gap) {
    const cx = x0 + w / 2 + d * -sa, cy = y0 + h / 2 + d * ca;
    line(g, cx - ca * L, cy - sa * L, cx + ca * L, cy + sa * L); g.stroke();
  }
  g.restore();
}

// Speed lines out of a point: a burst of marker strokes for a hit or a reveal.
export function speedLines(g, x, y, r0, r1, n, seed, col = INK.col, w = 4) {
  g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + (rnd(i, seed) - .5) * .2;
    const a0 = r0 * (1 + rnd(i, seed + 1) * .2), a1 = r1 * (.8 + rnd(i, seed + 2) * .3);
    line(g, x + Math.cos(a) * a0, y + Math.sin(a) * a0, x + Math.cos(a) * a1, y + Math.sin(a) * a1); g.stroke();
  }
  g.restore();
}
