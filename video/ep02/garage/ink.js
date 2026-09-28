// Cut paper and marker: the hand-drawn look of episode 2, built on episode 1's ink layer. inkify(g) wraps a Canvas 2D context so that any path
// drawn through it comes out hand-made: a fill of flat paint whose edge wanders a little, and,
// where a drawing asks for one, a brush-pen outline that boils like a line test (the wobble is
// redrawn on twos, cycling through three drawings). Everything else passes straight through.
//
// The wobble is sampled in the drawing's own coordinates, so it travels with whatever moves, and
// it's measured in screen pixels, so a small bot and a giant Clawd wobble alike.
import { clamp, lerp, noise2, rgb, INK } from './kit.js';
export { INK };


// ---------------------------------------------------------------- path recording
const TAU = Math.PI * 2;
function mat(g) { const m = g.getTransform(); return [m.a, m.b, m.c, m.d, m.e, m.f]; }
function scaleOf(m) { return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1; }

class Rec {
  constructor() { this.subs = []; this.cur = null; this.cx = 0; this.cy = 0; this.sx = 0; this.sy = 0; }
  begin() { this.subs = []; this.cur = null; }
  // Each point keeps its device position and the (scaled) local position the wobble samples.
  push(m, x, y) {
    const k = scaleOf(m);
    if (!this.cur) { this.cur = { pts: [], closed: false }; this.subs.push(this.cur); }
    this.cur.pts.push([m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5], x * k, y * k]);
    this.cx = x; this.cy = y;
  }
  move(m, x, y) { this.cur = { pts: [], closed: false }; this.subs.push(this.cur); this.push(m, x, y); this.sx = x; this.sy = y; }
  line(m, x, y) { if (!this.cur) return this.move(m, x, y); this.push(m, x, y); }
  close() { if (this.cur) { this.cur.closed = true; this.cur = null; this.cx = this.sx; this.cy = this.sy; } }
  steps(m, len) { return clamp(Math.ceil(len * scaleOf(m) / 7), 2, 160); }
  quad(m, x1, y1, x, y) {
    if (!this.cur) this.move(m, this.cx, this.cy);
    const x0 = this.cx, y0 = this.cy;
    const n = this.steps(m, Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x - x1, y - y1));
    for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; this.push(m, u * u * x0 + 2 * u * t * x1 + t * t * x, u * u * y0 + 2 * u * t * y1 + t * t * y); }
  }
  bez(m, x1, y1, x2, y2, x, y) {
    if (!this.cur) this.move(m, this.cx, this.cy);
    const x0 = this.cx, y0 = this.cy;
    const n = this.steps(m, Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x - x2, y - y2));
    for (let i = 1; i <= n; i++) {
      const t = i / n, u = 1 - t;
      this.push(m, u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y);
    }
  }
  ellipse(m, x, y, rx, ry, rot, a0, a1, ccw) {
    let sweep = a1 - a0;
    if (!ccw && sweep < 0) sweep = sweep % TAU + TAU;
    if (ccw && sweep > 0) sweep = sweep % TAU - TAU;
    if (!ccw && sweep > TAU) sweep = TAU;
    if (ccw && sweep < -TAU) sweep = -TAU;
    const n = clamp(Math.ceil(Math.abs(sweep) * Math.max(rx, ry) * scaleOf(m) / 6), 6, 220);
    const cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i <= n; i++) {
      const a = a0 + sweep * i / n, ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
      const px = x + ex * cr - ey * sr, py = y + ex * sr + ey * cr;
      if (i === 0 && !this.cur) this.move(m, px, py); else this.line(m, px, py);
    }
  }
  arcTo(m, x1, y1, x2, y2, r) {
    if (!this.cur) this.move(m, x1, y1);
    const x0 = this.cx, y0 = this.cy;
    const v1x = x0 - x1, v1y = y0 - y1, v2x = x2 - x1, v2y = y2 - y1;
    const l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
    if (l1 < 1e-6 || l2 < 1e-6 || r < 1e-6) return this.line(m, x1, y1);
    const cos = (v1x * v2x + v1y * v2y) / (l1 * l2);
    const ang = Math.acos(clamp(cos, -1, 1));
    if (ang < 1e-4 || Math.abs(ang - Math.PI) < 1e-4) return this.line(m, x1, y1);
    const d = r / Math.tan(ang / 2);
    const tx0 = x1 + v1x / l1 * d, ty0 = y1 + v1y / l1 * d, tx1 = x1 + v2x / l2 * d, ty1 = y1 + v2y / l2 * d;
    const bx = v1x / l1 + v2x / l2, by = v1y / l1 + v2y / l2, bl = Math.hypot(bx, by);
    const cd = r / Math.sin(ang / 2);
    const ccx = x1 + bx / bl * cd, ccy = y1 + by / bl * cd;
    this.line(m, tx0, ty0);
    const a0 = Math.atan2(ty0 - ccy, tx0 - ccx), a1 = Math.atan2(ty1 - ccy, tx1 - ccx);
    let sweep = a1 - a0; while (sweep > Math.PI) sweep -= TAU; while (sweep < -Math.PI) sweep += TAU;
    const n = clamp(Math.ceil(Math.abs(sweep) * r * scaleOf(m) / 6), 2, 64);
    for (let i = 1; i <= n; i++) { const a = a0 + sweep * i / n; this.push(m, ccx + Math.cos(a) * r, ccy + Math.sin(a) * r); }
  }
  rect(m, x, y, w, h) {
    this.move(m, x, y);
    const side = (x0, y0, x1, y1) => { const n = clamp(Math.ceil(Math.hypot(x1 - x0, y1 - y0) * scaleOf(m) / 40), 1, 60); for (let i = 1; i <= n; i++) this.push(m, lerp(x0, x1, i / n), lerp(y0, y1, i / n)); };
    side(x, y, x + w, y); side(x + w, y, x + w, y + h); side(x + w, y + h, x, y + h); side(x, y + h, x, y);
    this.close();
  }
}

// ---------------------------------------------------------------- wobble and brush
// Displace device points by smooth noise read at their local position; `seed` separates the
// fill's edge from the line's, so they never quite agree, as when a drawing is coloured by hand.
function wobble(pts, amp, seed) {
  if (amp <= 0) return pts.map(p => [p[0], p[1]]);
  const b = INK.boil * 7.31 + seed * 3.7;
  const f1 = 1 / 55, f2 = 1 / 13;
  // Amplitude and wavelength are in master pixels (1080 wide), whatever size we render at.
  const R = INK.res || 1;
  amp *= R;
  return pts.map(p => {
    const lx = p[2] / R, ly = p[3] / R;
    const dx = noise2(lx * f1 + b, ly * f1 - b * .7, 11) * amp + noise2(lx * f2 - b, ly * f2 + b, 12) * amp * .35;
    const dy = noise2(lx * f1 - b * .5, ly * f1 + b, 13) * amp + noise2(lx * f2 + b, ly * f2 - b * .3, 14) * amp * .35;
    return [p[0] + dx, p[1] + dy];
  });
}

// A brush-pen line along pts (device space): width varies along its length, ends taper.
function brush(g, pts, closed, w, col, alpha = 1, seed = 0) {
  const n = pts.length;
  if (n < 2) return;
  // Arc length.
  const s = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = s[n - 1] || 1;
  const taper = Math.min(L * .3, w * 5);
  const b = INK.boil * 5.1 + seed;
  const width = i => {
    // A felt-tip marker: nearly even weight, a slight swell, ends that round off rather than taper.
    let k = (1 - INK.vary * .5) + INK.vary * (noise2(s[i] / (38 * (INK.res || 1)) + b, b * .3, 21) * .5 + .5);
    if (!closed) k *= INK.tip + (1 - INK.tip) * Math.min(1, s[i] / taper, (L - s[i]) / taper);
    return w * k * .5;
  };
  const L1 = [], R1 = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const a = pts[i > 0 ? i - 1 : closed ? n - 2 : 0], c = pts[i < n - 1 ? i + 1 : closed ? 1 : n - 1];
    let tx = c[0] - a[0], ty = c[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const hw = width(i);
    L1.push([p[0] - ty * hw, p[1] + tx * hw]); R1.push([p[0] + ty * hw, p[1] - tx * hw]);
  }
  g.globalAlpha *= alpha;
  g.fillStyle = col;
  g.beginPath();
  L1.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  for (let i = n - 1; i >= 0; i--) g.lineTo(R1[i][0], R1[i][1]);
  g.closePath(); g.fill();
  if (!closed) {
    // Round the ends a touch so a line never stops square.
    for (const i of [0, n - 1]) { const r = width(i); if (r > .6) { g.beginPath(); g.arc(pts[i][0], pts[i][1], r, 0, TAU); g.fill(); } }
  }
}

// ---------------------------------------------------------------- the wrapper
// Extra drawing state carried through save/restore: ink (outline colour or null), inkW (outline
// width in px), wob (fill-edge wobble in px), lineWob (stroke wobble), plain (draw paths exactly).
const DEFAULTS = { ink: null, inkW: 3.2, wob: 1, lineWob: 1, plain: false, tex: 0, edge: 0, drop: null, border: null, reg: null };

// Gouache: a tileable sheet of brush marks, streaks and blotches around mid-grey, soft-lit into
// every fill so flat colour reads as paint laid on with a brush.
let TEX = null;
function gouache() {
  if (TEX) return TEX;
  const n = 512;
  const c = document.createElement('canvas'); c.width = c.height = n;
  const x = c.getContext('2d');
  x.fillStyle = '#808080'; x.fillRect(0, 0, n, n);
  let sd = 1357911;
  const rand = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  // Long soft brush strokes, drawn three times offset so the tile wraps.
  for (let i = 0; i < 260; i++) {
    const cx = rand() * n, cy = rand() * n, len = 40 + rand() * 160, ang = (rand() - .5) * .5 + (i % 3 === 0 ? 1.57 : 0);
    const light = rand() > .5, a = .05 + rand() * .1, w = 3 + rand() * 12;
    for (const [ox, oy] of [[0, 0], [n, 0], [-n, 0], [0, n], [0, -n]]) {
      x.strokeStyle = light ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
      x.lineWidth = w; x.lineCap = 'round';
      x.beginPath(); x.moveTo(cx + ox, cy + oy); x.quadraticCurveTo(cx + ox + Math.cos(ang) * len * .5 + (rand() - .5) * 20, cy + oy + Math.sin(ang) * len * .5 + (rand() - .5) * 20, cx + ox + Math.cos(ang) * len, cy + oy + Math.sin(ang) * len); x.stroke();
    }
  }
  // Fine bristle lines and pigment specks.
  const id = x.getImageData(0, 0, n, n), d = id.data;
  for (let y = 0; y < n; y++) for (let xx = 0; xx < n; xx++) {
    const i = (y * n + xx) * 4;
    const v = (rand() - .5) * 26 + Math.sin(y * .9 + Math.sin(xx * .05) * 3) * 5;
    d[i] += v; d[i + 1] += v; d[i + 2] += v;
  }
  x.putImageData(id, 0, 0);
  TEX = c;
  return TEX;
}


export function inkify(g) {
  if (g.__ink) return g.__ink;
  const rec = new Rec();
  let st = { ...DEFAULTS };
  const stack = [];
  const devicePath = (subs, seed, amp) => {
    for (const sp of subs) {
      if (sp.pts.length < 2) continue;
      const w = st.plain ? sp.pts.map(p => [p[0], p[1]]) : wobble(sp.pts, amp, seed);
      g.moveTo(w[0][0], w[0][1]);
      for (let i = 1; i < w.length; i++) g.lineTo(w[i][0], w[i][1]);
      if (sp.closed) g.closePath();
    }
  };
  // A wobbled copy of the current path, shifted by (dx, dy) device px.
  const shifted = (subs, dx, dy) => {
    g.beginPath();
    for (const sp of subs) {
      if (sp.length < 2) continue;
      g.moveTo(sp[0][0] + dx, sp[0][1] + dy);
      for (let i = 1; i < sp.length; i++) g.lineTo(sp[i][0] + dx, sp[i][1] + dy);
      g.closePath();
    }
  };
  const fill = (rule) => {
    const m = g.getTransform();
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    // Cut paper: a hard shadow where the piece stands off the page, then a paper margin round it,
    // then the colour, which may sit a little off its line like a quick print. Offsets are in
    // master px, whatever size we render at.
    if (!st.plain && (st.drop || st.border || st.reg)) {
      const k = g.canvas.width / 1080;
      const subs = rec.subs.filter(sp => sp.pts.length > 1).map(sp => wobble(sp.pts, INK.amp * st.wob * .7, 1));
      const col = g.fillStyle;
      if (st.drop) { shifted(subs, st.drop.dx * k, st.drop.dy * k); g.fillStyle = st.drop.col; rule ? g.fill(rule) : g.fill(); }
      if (st.border) {
        shifted(subs, 0, 0);
        g.fillStyle = st.border.col; g.strokeStyle = st.border.col; g.lineWidth = st.border.w * 2 * k; g.lineJoin = 'round';
        rule ? g.fill(rule) : g.fill(); g.stroke();
      }
      g.fillStyle = col;
      const [rx, ry] = st.reg || [0, 0];
      shifted(subs, rx * k, ry * k);
      rule ? g.fill(rule) : g.fill();
      g.restore();
      if (st.ink && INK.on) outline(st.ink, st.inkW);
      return;
    }
    g.beginPath();
    devicePath(rec.subs, 1, INK.amp * st.wob * .7);
    g.setTransform(m);
    rule ? g.fill(rule) : g.fill();
    // Paint body: brush texture and a denser edge, clipped to the shape (skipped when tiny).
    if (!st.plain && (st.tex > 0 || st.edge > 0) && g.globalAlpha > .2) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const sp of rec.subs) for (const p of sp.pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
      const k = g.canvas.width / 1080;
      if ((x1 - x0) > 26 * k && (y1 - y0) > 26 * k) {
        g.setTransform(1, 0, 0, 1, 0, 0);
        rule ? g.clip(rule) : g.clip();
        const ga = g.globalAlpha;
        if (st.tex > 0) {
          const pat = g.createPattern(gouache(), 'repeat');
          const ox = (rec.subs[0].pts[0][2] * 1.7) % 512, oy = (rec.subs[0].pts[0][3] * 1.3) % 512;
          pat.setTransform(new DOMMatrix([k, 0, 0, k, x0 - ox * k, y0 - oy * k]));
          g.globalCompositeOperation = 'soft-light';
          g.globalAlpha = ga * .75 * st.tex;
          g.fillStyle = pat;
          g.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
        }
        if (st.edge > 0) {
          g.globalCompositeOperation = 'multiply';
          g.globalAlpha = ga * st.edge;
          g.strokeStyle = '#6a5a70';
          g.lineWidth = 7 * k;
          g.stroke();
        }
      }
    }
    g.restore();
    if (st.ink && INK.on) outline(st.ink, st.inkW);
  };
  const outline = (col, w) => {
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    for (const sp of rec.subs) {
      if (sp.pts.length < 2) continue;
      let p = st.plain ? sp.pts.map(q => [q[0], q[1]]) : wobble(sp.pts, INK.amp * st.lineWob, 2);
      const ww = w * (g.canvas.width / 1080);
      if (sp.closed && !st.plain && p.length > 10 && INK.overshoot) {
        // Drawn by hand, a loop never quite closes: the pen starts somewhere along the shape, goes
        // round, and runs on past where it began, drifting outward, so the two ends cross.
        const n = p.length, s0 = Math.floor(((sp.pts[0][2] * 7.13 + sp.pts[0][3] * 3.71) % 1 + 1) % 1 * n);
        let L = 0; for (let i = 1; i < n; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
        const over = Math.min(n * .5, Math.max(3, Math.round(n * Math.min(.14, INK.overshoot * (INK.res || 1) / Math.max(1, L)))));
        let cx = 0, cy = 0; for (const q of p) { cx += q[0]; cy += q[1]; } cx /= n; cy /= n;
        const seq = [];
        for (let i = 0; i <= n + over; i++) {
          const q = p[(s0 + i) % n];
          const f = i > n ? (i - n) / over : 0;
          const dx = q[0] - cx, dy = q[1] - cy, dl = Math.hypot(dx, dy) || 1;
          const out = f * (ww * 1.6 + 3 * (INK.res || 1));
          seq.push([q[0] + dx / dl * out, q[1] + dy / dl * out]);
        }
        brush(g, seq, false, ww, col, .95, sp.pts.length);
        continue;
      }
      if (sp.closed) p = p.concat([p[0]]);
      brush(g, p, sp.closed, ww, col, .95, sp.pts.length);
    }
    g.restore();
  };
  const stroke = () => {
    const m = g.getTransform();
    const k = scaleOf([m.a, m.b, m.c, m.d]);
    const dashed = g.getLineDash().length > 0;
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (dashed || st.plain) {
      g.beginPath(); devicePath(rec.subs, 3, dashed ? INK.amp * st.lineWob : 0);
      g.setTransform(m); g.stroke();
    } else {
      const col = g.strokeStyle;
      const w = g.lineWidth * k;
      for (const sp of rec.subs) {
        if (sp.pts.length < 2) continue;
        let p = wobble(sp.pts, INK.amp * st.lineWob * Math.min(1, .4 + w / 8), 3);
        if (sp.closed) p = p.concat([p[0]]);
        if (typeof col === 'string') brush(g, p, sp.closed, Math.max(.8, w), col, 1, sp.pts.length * 3);
        else { g.beginPath(); p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.setTransform(m); g.stroke(); g.setTransform(1, 0, 0, 1, 0, 0); }
      }
    }
    g.restore();
  };
  const api = {
    beginPath() { rec.begin(); },
    moveTo(x, y) { rec.move(mat(g), x, y); },
    lineTo(x, y) { rec.line(mat(g), x, y); },
    closePath() { rec.close(); },
    quadraticCurveTo(a, b, c, d) { rec.quad(mat(g), a, b, c, d); },
    bezierCurveTo(a, b, c, d, e, f) { rec.bez(mat(g), a, b, c, d, e, f); },
    arc(x, y, r, a0, a1, ccw) { rec.ellipse(mat(g), x, y, r, r, 0, a0, a1, ccw); },
    ellipse(x, y, rx, ry, rot, a0, a1, ccw) { rec.ellipse(mat(g), x, y, rx, ry, rot, a0, a1, ccw); },
    arcTo(x1, y1, x2, y2, r) { rec.arcTo(mat(g), x1, y1, x2, y2, r); },
    rect(x, y, w, h) { rec.rect(mat(g), x, y, w, h); },
    fill(a, b) { if (a instanceof Path2D) return b ? g.fill(a, b) : g.fill(a); fill(typeof a === 'string' ? a : undefined); },
    stroke(a) { if (a instanceof Path2D) return g.stroke(a); stroke(); },
    clip(rule, r2) {
      if (rule instanceof Path2D) return r2 ? g.clip(rule, r2) : g.clip(rule);
      const m = g.getTransform();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.beginPath(); devicePath(rec.subs, 1, INK.amp * st.wob * .7);
      g.setTransform(m);
      rule ? g.clip(rule) : g.clip();
    },
    fillRect(x, y, w, h) { const saved = rec.subs; rec.begin(); rec.rect(mat(g), x, y, w, h); const ink = st.ink, tx = st.tex, ed = st.edge; st.ink = null; st.tex = tx * .5; st.edge = 0; fill(); st.ink = ink; st.tex = tx; st.edge = ed; rec.subs = saved; },
    strokeRect(x, y, w, h) { rec.begin(); rec.rect(mat(g), x, y, w, h); stroke(); },
    save() { stack.push({ ...st }); g.save(); },
    restore() { if (stack.length) st = stack.pop(); g.restore(); },
    // The raw context, for things that must be exact (screens, marks, text).
    raw: g,
    // Outline whatever path is current, in ink, without filling it.
    inkLine(col = INK.col, w = st.inkW) { outline(col, w); },
  };
  const h = new Proxy(g, {
    get(target, prop) {
      if (prop in api) return api[prop];
      if (prop in st) return st[prop];
      if (prop === 'globalCompositeOperation') return target.globalCompositeOperation;
      const v = target[prop];
      return typeof v === 'function' ? v.bind(target) : v;
    },
    set(target, prop, value) {
      if (prop in st) { st[prop] = value; return true; }
      // Additive light is the shine this look leaves behind: light is painted, so it screens.
      if (prop === 'globalCompositeOperation' && value === 'lighter') value = 'screen';
      target[prop] = value;
      return true;
    },
  });
  g.__ink = h;
  return h;
}

// ---------------------------------------------------------------- paper
// One sheet of paper for the whole film: fibres, tooth and a little mottling, multiplied over
// every frame; plus the specks where dark paint skipped the tooth, screened on top.
let PAPER = null;
export function paper() {
  if (PAPER) return PAPER;
  const w = 1080, h = 1920;
  const make = fn => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const id = x.createImageData(w, h); fn(id.data); x.putImageData(id, 0, 0); return c; };
  let s = 987654321;
  const rand = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  // Low-frequency mottling from a coarse grid, bilinear.
  const gw = 64, gh = 114, grid = new Float32Array((gw + 1) * (gh + 1)).map(() => rand());
  const mott = (x, y) => {
    const fx = x / w * gw, fy = y / h * gh, ix = Math.floor(fx), iy = Math.floor(fy), ux = fx - ix, uy = fy - iy;
    const G = (a, b) => grid[Math.min(gh, b) * (gw + 1) + Math.min(gw, a)];
    return lerp(lerp(G(ix, iy), G(ix + 1, iy), ux), lerp(G(ix, iy + 1), G(ix + 1, iy + 1), ux), uy);
  };
  const tone = make(d => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const fib = Math.sin((x * .9 + y * .21) * .35 + rand() * 3) * .5 + .5;
      let v = 244 - (mott(x, y) - .5) * 14 - rand() * 16 - fib * 5;
      if (rand() > .9985) v -= 40 * rand();
      d[i] = v + 4; d[i + 1] = v; d[i + 2] = v - 10; d[i + 3] = 255;
    }
  });
  const specks = make(d => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = rand();
      const v = r > .9965 ? 110 + 90 * rand() : r > .97 ? 30 * rand() : 0;
      d[i] = v; d[i + 1] = v * .96; d[i + 2] = v * .9; d[i + 3] = 255;
    }
  });
  PAPER = { tone, specks };
  return PAPER;
}
