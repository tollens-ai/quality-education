// The lettering. Three voices:
//   - The band's words are cut out of the mirror. Big Shoulders Stencil Display, at its heaviest:
//     a stencil face, so every letter is a set of separate pieces with no counters to fall out,
//     which is exactly what a cutter needs. A laser runs round each piece's outline as the word
//     is sung; the piece drops out; daylight comes in through the hole.
//   - The machine's voice (labels, test output, the teaching card): JetBrains Mono.
//   - The people's voice (their note, their "I love it"): Rock Salt, by hand.
//
// Glyph outlines come from tools/glyphs.py (fonts/stencil-900.json, font units, y up). Words are
// laid out with the canvas's own shaping, so kerning matches the font.
import { W, H, clamp, lerp, hash, rgba, mix, easeIn, easeOut, caps } from './kit.js';
import { ap, apn, M, T, RX, RY, RZ, project, projPoly, tracePoly, toCam, facing, cam as mkcam, vsub, norm, dot, cross, scaleAt, screenToPlane } from './space.js';

const FD = 'video/ep02/cutlight/fonts/';
export const fonts = [
  ['Stencil', FD + 'BigShouldersStencilDisplay.ttf', { weight: '100 900' }],
  ['Mono', FD + 'JetBrainsMono.ttf', { weight: '100 800' }],
  ['Hand', FD + 'RockSalt-Regular.ttf', {}],
];

// ---------------------------------------------------------------- glyph outlines
export const GL = { upm: 2000, cap: 1600, glyphs: {} };
export async function loadGlyphs(url = '/' + FD + 'stencil-900.json') {
  const d = await fetch(url).then(r => r.json());
  GL.upm = d.upm; GL.cap = d.capHeight || d.upm * .8;
  for (const [ch, gdef] of Object.entries(d.glyphs)) GL.glyphs[ch] = { adv: gdef.adv, pieces: parsePath(gdef.d) };
}
// SVG path data (M L H V Q C Z, implicit repeats) to closed polylines; curves are flattened.
function parsePath(dd) {
  const tok = dd.match(/[MLHVQCZmlhvqcz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const out = [];
  let cur = null, x = 0, y = 0, cmd = null, i = 0;
  const num = () => +tok[i++];
  while (i < tok.length) {
    if (/[A-Za-z]/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'M') { x = num(); y = num(); cur = [[x, y]]; out.push(cur); cmd = 'L'; }
    else if (cmd === 'L') { x = num(); y = num(); cur.push([x, y]); }
    else if (cmd === 'H') { x = num(); cur.push([x, y]); }
    else if (cmd === 'V') { y = num(); cur.push([x, y]); }
    else if (cmd === 'Q') {
      const cx = num(), cy = num(), ex = num(), ey = num();
      const n = Math.max(3, Math.ceil(Math.hypot(ex - x, ey - y) / 60));
      for (let k = 1; k <= n; k++) { const s = k / n; cur.push([(1 - s) ** 2 * x + 2 * (1 - s) * s * cx + s * s * ex, (1 - s) ** 2 * y + 2 * (1 - s) * s * cy + s * s * ey]); }
      x = ex; y = ey;
    } else if (cmd === 'C') {
      const c1x = num(), c1y = num(), c2x = num(), c2y = num(), ex = num(), ey = num();
      const n = Math.max(4, Math.ceil(Math.hypot(ex - x, ey - y) / 50));
      for (let k = 1; k <= n; k++) { const s = k / n, r = 1 - s; cur.push([r ** 3 * x + 3 * r * r * s * c1x + 3 * r * s * s * c2x + s ** 3 * ex, r ** 3 * y + 3 * r * r * s * c1y + 3 * r * s * s * c2y + s ** 3 * ey]); }
      x = ex; y = ey;
    } else if (cmd === 'Z' || cmd === 'z') { cmd = null; }
    else i++;
  }
  // Drop a closing point that repeats the first, and measure each piece's perimeter.
  return out.filter(p => p.length > 2).map(p => {
    const a = p[0], b = p[p.length - 1];
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < .5) p.pop();
    let len = 0;
    for (let k = 0; k < p.length; k++) { const q = p[(k + 1) % p.length]; len += Math.hypot(q[0] - p[k][0], q[1] - p[k][1]); }
    let cx = 0, cy = 0;
    for (const q of p) { cx += q[0]; cy += q[1]; }
    return { pts: p, len, c: [cx / p.length, cy / p.length] };
  });
}

// ---------------------------------------------------------------- measuring
const MC = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
export const FACE = { stencil: '900 100px Stencil', mono: '500 100px Mono', monoB: '800 100px Mono', hand: '100px Hand' };
const MW = new Map();
// Advance of a string at 100 px, in the canvas's own shaping (kerning included).
export function width100(str, face = 'stencil') {
  const key = face + '|' + str;
  let v = MW.get(key);
  if (v === undefined) { MC.font = FACE[face]; v = MC.measureText(str).width; MW.set(key, v); }
  return v;
}
// Where each glyph of a string starts, as a fraction of the em (at 100 px = 1 em).
export function glyphX(str, face = 'stencil') {
  const xs = [];
  for (let i = 0; i < str.length; i++) {
    const adv = GL.glyphs[str[i]]?.adv ?? GL.upm * .3;
    xs.push((width100(str.slice(0, i + 1), face) - adv / GL.upm * 100) / 100);
  }
  return xs;
}
// Cap height of the stencil face, as a fraction of the em.
export const CAPK = () => GL.cap / GL.upm;

// ---------------------------------------------------------------- words on a plane
// A cut word: its pieces in the plane's own coordinates (cm; u right, v up), laid on the plane
// placed by matrix m (plane = z 0 of m). em is the em size in cm; (u, v) the baseline start.
export function cutWord(w, m, u, v, em, o = {}) {
  const str = o.str ?? caps(w.w ?? w);
  const xs = glyphX(str);
  const pieces = [];
  const sk = o.skew || 0;
  for (let i = 0; i < str.length; i++) {
    const gdef = GL.glyphs[str[i]];
    if (!gdef) continue;
    for (const p of gdef.pieces) {
      const pts = p.pts.map(([x, y]) => [u + xs[i] * em + x / GL.upm * em + y / GL.upm * em * sk, v + y / GL.upm * em]);
      pieces.push({ pts, len: p.len / GL.upm * em, c: [u + xs[i] * em + p.c[0] / GL.upm * em, v + p.c[1] / GL.upm * em], gi: i });
    }
  }
  const wid = width100(str) / 100 * em;
  return { w, str, m, u, v, em, wid, pieces, n: pieces.length, o };
}
export const wordWidth = (str, em, face = 'stencil') => width100(str, face) / 100 * em;

// Lay a line's words out on a plane in rows: spec.rows = [{ w: [word indices], em, align, dv }],
// placed from (u0, v0) downwards, each row aligned 'left' | 'center' | 'right' within width uw.
// Rows shrink to fit uw. Returns the cut words.
export function layLine(ws, m, spec) {
  const out = [];
  let v = spec.v0;
  for (const r of spec.rows) {
    const list = r.w.map(i => ws[i]);
    const strs = list.map(w => r.str?.[w.wi] ?? caps(w.w));
    let em = r.em;
    const gap = () => em * (r.gap ?? .22);
    const natural = strs.reduce((a, s) => a + wordWidth(s, em), 0) + gap() * (list.length - 1);
    const maxW = r.uw ?? spec.uw;
    if (natural > maxW) em *= maxW / natural;
    const total = strs.reduce((a, s) => a + wordWidth(s, em), 0) + gap() * (list.length - 1);
    const align = r.align ?? spec.align ?? 'center';
    const u0 = (r.u0 ?? spec.u0) + (align === 'center' ? (maxW - total) / 2 : align === 'right' ? maxW - total : 0);
    v -= em * CAPK() * (r.lead ?? 1) + (r.dv ?? 0);
    let u = u0;
    list.forEach((w, k) => {
      out.push(cutWord(w, m, u, v, em, { str: strs[k], ...r.o }));
      u += wordWidth(strs[k], em) + gap();
    });
    v -= em * CAPK() * (r.after ?? .18);
  }
  return out;
}

// Lay a line out on a plane so that, seen by camera c, it fills a screen box [x0, y0, x1, y1]:
// rows = [{ w: [word indices], k: relative size, align }], each row as wide as the box allows
// (k scales rows against each other), stacked top to bottom with gap (a fraction of cap height).
export function posterLine(ws, m, c, box, rows, o = {}) {
  // Low lettering stays clear of the strip on the right where the phone apps put their buttons.
  const [x0, y0, x1, y1] = box[3] > 950 && !o.fullWidth ? [box[0], box[1], Math.min(box[2], 930), box[3]] : box;
  const tl = screenToPlane(c, m, x0, y0), tr = screenToPlane(c, m, x1, y0), bl = screenToPlane(c, m, x0, y1);
  const uw = tr[0] - tl[0], vh = tl[1] - bl[1];
  const gap = o.gap ?? .16;
  // Each row's natural width at em 1, then the em that fills the width, times k.
  const info = rows.map(r => {
    const strs = r.w.map(i => r.str?.[i] ?? caps(ws[i].w));
    const nat = strs.reduce((a, s) => a + wordWidth(s, 1), 0) + (r.gapW ?? .22) * (strs.length - 1);
    return { r, strs, nat, em: uw / nat * (r.k ?? 1) };
  });
  // Scale everything down if the stack is taller than the box.
  const capK = CAPK();
  let total = info.reduce((a, x) => a + x.em * capK, 0) + gap * capK * info.reduce((a, x) => a + x.em, 0) / info.length * (info.length - 1);
  const s = Math.min(1, vh / total);
  const out = [];
  let v = tl[1];
  info.forEach((x, i) => {
    const em = x.em * s, cap = em * capK;
    v -= cap;
    const width = x.nat * em;
    const align = x.r.align ?? o.align ?? 'center';
    let u = tl[0] + (align === 'center' ? (uw - width) / 2 : align === 'right' ? uw - width : 0) + (x.r.du ?? 0) * uw;
    x.r.w.forEach((wi, k) => {
      out.push(cutWord(ws[wi], m, u, v + (x.r.dv ?? 0), em, { str: x.strs[k], ...(x.r.o || {}) }));
      u += wordWidth(x.strs[k], em) + (x.r.gapW ?? .22) * em;
    });
    v -= gap * cap;
  });
  return out;
}

// ---------------------------------------------------------------- the cut
// A word's state at t: before its cut starts nothing shows; while the laser runs round it (dur
// seconds, ending at the word's landing time v) the cut line glows; then the pieces drop out and
// the hole is open until `out` (if given), when it closes or the word is replaced.
export function cutState(cw, t, o = {}) {
  const v = cw.w.v ?? 0;
  const dur = cw.o.dur ?? o.dur ?? .2;
  const p = clamp((t - (v - dur)) / dur);
  return { p, open: t >= v, age: t - v, on: t >= v - dur && t < (cw.o.out ?? o.out ?? 1e9) };
}

// Draw a set of cut words. The caller gives:
//   c        the camera
//   outside  fn(L) drawing what's beyond the mirror into layer L (full frame)
//   E        the emissive layer (for glow and shafts)
//   laser    colour of the cutting light
//   thick    the glass's thickness in cm (shows as an edge in perspective)
//   fall     how pieces leave: 'drop' (fall to the floor), 'blow' (blown towards the camera)
//   light    brightness of the daylight in the holes (0..1+), for pulsing with the music
// Returns the open area's screen centroid, for aiming shafts of light.
import { layer, put } from './post.js';
export function drawCuts(g, c, t, cws, o) {
  const thick = o.thick ?? 1.6;
  const holes = layer('holes'), back = layer('holesBack'), holesE = layer('holesE');
  let any = false, sx = 0, sy = 0, sn = 0;
  const cutting = [], falling = [];
  const stuck = [];
  for (const cw of cws) {
    const st = cutState(cw, t, o);
    if (!st.on) continue;
    if (cw.o.stuck) { stuck.push(cw); continue; }
    const nrm = apn(cw.m, [0, 0, 1]);
    if (!facing(c, ap(cw.m, [cw.u, cw.v, 0]), nrm) && !o.both) continue;
    if (st.open) {
      any = true;
      for (const pc of cw.pieces) {
        const f = projPoly(c, pc.pts.map(([u, v]) => ap(cw.m, [u, v, 0])));
        const b = projPoly(c, pc.pts.map(([u, v]) => ap(cw.m, [u, v, -thick])));
        if (f) {
          holes.beginPath(); tracePoly(holes, f); holes.fillStyle = '#fff'; holes.fill(); for (const q of f) { sx += q[0]; sy += q[1]; sn++; }
          // How much of this hole's light blooms: a word's all of it, a big window only a little.
          holesE.beginPath(); tracePoly(holesE, f); holesE.fillStyle = rgba('#ffffff', cw.o.glowK ?? 1); holesE.fill();
        }
        if (b) { back.beginPath(); tracePoly(back, b); back.fillStyle = '#fff'; back.fill(); }
      }
      if (st.age < (o.fallDur ?? .42) && !cw.o.pre && !cw.o.noFall) falling.push([cw, st]);
    } else if (st.p > 0) cutting.push([cw, st]);
    audit(c, cw, st, o);
  }
  if (any) {
    // The glass edge: the front hole, where the back hole doesn't reach, in the glass's colour.
    const edge = layer('edge');
    edge.setTransform(1, 0, 0, 1, 0, 0);
    edge.drawImage(holes.canvas, 0, 0);
    edge.globalCompositeOperation = 'source-in';
    edge.fillStyle = o.edgeCol || '#5e8f88'; edge.fillRect(0, 0, edge.canvas.width, edge.canvas.height);
    edge.globalCompositeOperation = 'source-over';
    // Through the hole: the outside, masked to front and back holes both.
    const out = layer('outside');
    o.outside(out);
    out.setTransform(1, 0, 0, 1, 0, 0);
    // The day is dazzling from in here: a wash of light lifts its darks, so a word stays bright.
    out.globalCompositeOperation = 'screen';
    out.fillStyle = rgba(o.hazeCol || '#fff1dc', o.haze ?? .24); out.fillRect(0, 0, out.canvas.width, out.canvas.height);
    out.globalCompositeOperation = 'source-over';
    out.globalCompositeOperation = 'destination-in';
    out.drawImage(holes.canvas, 0, 0);
    out.drawImage(back.canvas, 0, 0);
    out.globalCompositeOperation = 'source-over';
    put(g, edge);
    put(g, out);
    // The lit edge of each hole: a fine bright line round the letter, which holds its shape
    // whatever's behind it.
    g.save();
    g.strokeStyle = rgba(o.rimCol || '#fffaf0', .9); g.lineWidth = o.rimW ?? 2.2; g.lineJoin = 'round';
    for (const cw of cws) {
      const st = cutState(cw, t, o);
      if (!st.on || !st.open) continue;
      for (const pc of cw.pieces) {
        const f = projPoly(c, pc.pts.map(([u, v]) => ap(cw.m, [u, v, 0])));
        if (f) { g.beginPath(); tracePoly(g, f); g.stroke(); }
      }
    }
    g.restore();
    // The light in the holes goes into the emissive layer, for glow and shafts.
    if (o.E) {
      const k = o.light ?? 1;
      const oe = layer('outsideE');
      oe.setTransform(1, 0, 0, 1, 0, 0);
      oe.drawImage(out.canvas, 0, 0);
      oe.globalCompositeOperation = 'destination-in'; oe.drawImage(holesE.canvas, 0, 0); oe.globalCompositeOperation = 'source-over';
      o.E.save(); o.E.setTransform(1, 0, 0, 1, 0, 0);
      o.E.globalAlpha = clamp(k * .9, 0, 1);
      o.E.drawImage(oe.canvas, 0, 0);
      o.E.restore();
    }
  }
  // Lasers: the cut so far, white-hot, with the member's colour round it and a spark at the head.
  for (const [cw, st] of cutting) laserTrace(g, c, cw, st.p, o);
  // A stuck word: cut all round, and the glass won't come out; its outline stays lit.
  if (stuck.length) drawEtch(g, c, t, stuck, { ...o, out: 1e9, w: 2.6 });
  // Pieces: out of the mirror and gone.
  for (const [cw, st] of falling) pieces(g, c, cw, st.age, o);
  return sn ? [sx / sn, sy / sn] : null;
}

function laserTrace(g, c, cw, p, o) {
  const col = cw.o.laser || o.laser || '#ffffff';
  const E = o.E;
  const draw = (ctx, w, style) => {
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = style; ctx.lineWidth = w;
    for (const pc of cw.pieces) {
      const pts = pc.pts, n = pts.length;
      const want = pc.len * p;
      let acc = 0;
      const path = [pts[0]];
      for (let k = 0; k < n && acc < want; k++) {
        const a = pts[k], b = pts[(k + 1) % n];
        const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (acc + d <= want) { path.push(b); acc += d; }
        else { const s = (want - acc) / d; path.push([lerp(a[0], b[0], s), lerp(a[1], b[1], s)]); acc = want; }
      }
      const pp = path.map(([u, v]) => project(c, ap(cw.m, [u, v, 0])));
      if (pp.some(q => q.z < c.near)) continue;
      ctx.beginPath(); pp.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke();
      const h = pp[pp.length - 1];
      if (style === '#ffffff') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(h.x, h.y, w * 2.2, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  };
  const s = Math.max(1, scaleAt(c, ap(cw.m, [cw.u, cw.v, 0])));
  const lw = clamp(cw.em * s * .012, 1.2, 6);
  draw(g, lw * 2.6, rgba(col, .85));
  draw(g, lw, '#ffffff');
  if (E) { draw(E, lw * 5, rgba(col, 1)); draw(E, lw * 1.5, '#ffffff'); }
}

// A piece of the mirror, cut out: it swings out from its lower edge and falls, or is blown out.
function pieces(g, c, cw, age, o) {
  const k = clamp(age / (o.fallDur ?? .42));
  if (k >= 1) return;
  const blow = o.fall === 'blow';
  const nrm = apn(cw.m, [0, 0, 1]);
  for (const pc of cw.pieces) {
    const h = hash(pc.c[0], pc.c[1], cw.u);
    const tt = age;
    // In plane coordinates: out along the normal, down with gravity, turning.
    const out = blow ? tt * (180 + h * 160) : tt * (15 + h * 25);
    const down = blow ? tt * tt * 200 : tt * tt * 1400;
    const side = (h - .5) * (blow ? 260 : 60) * tt;
    const rx = (blow ? 3.5 : 2.2) * tt * (h > .5 ? 1 : -1), rz = (h - .5) * 2.6 * tt;
    const [cu, cv] = pc.c;
    const local = M(T(cu + side, cv - down, out), RX(rx), RZ(rz), T(-cu, -cv, 0));
    const pm = M(cw.m, local);
    const pts = pc.pts.map(([u, v]) => ap(pm, [u, v, 0]));
    const pp = projPoly(c, pts);
    if (!pp) continue;
    // The mirror side catches light as it turns; the edge glints.
    const n = apn(pm, [0, 0, 1]);
    const vdir = norm(vsub(c.pos, pts[0]));
    const f = dot(n, vdir);
    const glint = Math.pow(clamp(Math.abs(f)), 6);
    g.save();
    g.globalAlpha = 1 - Math.pow(k, 1.3);
    g.beginPath(); tracePoly(g, pp);
    g.fillStyle = mix(o.glassCol || '#0c0e13', '#cfe3ee', glint * .7 + (f < 0 ? .12 : 0));
    g.fill();
    g.strokeStyle = o.edgeCol || '#7fb5ac'; g.lineWidth = 1.2; g.stroke();
    g.restore();
  }
}

// ---------------------------------------------------------------- the audit
// The typography audit (tools/typo-audit.mjs) reads AUDIT.recs: every sung word as drawn, with
// its box, cap height and angle on screen, how far it's cut, and which lyric word it is; plus a
// mask of its letter faces in device pixels, for the contrast check against the finished frame.
export const AUDIT = { on: false, recs: [], ctx: null };
if (typeof window !== 'undefined') window.__typo = AUDIT;
function audit(c, cw, st, o) {
  if (!AUDIT.on || cw.o.noAudit || !cw.w || cw.w.li === undefined) return;
  const polys = cw.pieces.map(pc => projPoly(c, pc.pts.map(([u, v]) => ap(cw.m, [u, v, 0])))).filter(Boolean);
  if (!polys.length) return;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of polys) for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const b0 = project(c, ap(cw.m, [cw.u, cw.v, 0])), b1 = project(c, ap(cw.m, [cw.u + cw.wid, cw.v, 0]));
  const top = project(c, ap(cw.m, [cw.u, cw.v + cw.em * CAPK(), 0]));
  const cap = Math.hypot(top.x - b0.x, top.y - b0.y);
  AUDIT.recs.push({
    str: cw.str, cap, rot: Math.atan2(b1.y - b0.y, b1.x - b0.x), base: [b0.x, b0.y], strokeW: cap * .06,
    alpha: o.alpha ?? 1, prog: st.open ? 1 : st.p, textL: [1], shade: false, outline: true,
    ctx: { line: cw.w.li, word: cw.w.wi }, main: true, box: [x0, y0, x1, y1],
    offscreen: x0 < -2 || y0 < -2 || x1 > W + 2 || y1 > H + 2, _polys: polys,
  });
}
// Lettering drawn some other way (flat type in the frame) records itself here.
export function auditFlat(str, box, cap, rot, w, o = {}) {
  if (!AUDIT.on || !w || w.li === undefined) return;
  AUDIT.recs.push({ str, cap, rot, base: [box[0], box[3]], strokeW: cap * .06, alpha: o.alpha ?? 1, prog: o.prog ?? 1, textL: [1], shade: false, outline: !!o.outline,
    ctx: { line: w.li, word: w.wi }, main: true, box, offscreen: box[0] < -2 || box[1] < -2 || box[2] > W + 2 || box[3] > H + 2, _rect: true });
}

// ---------------------------------------------------------------- flat type
// Text drawn flat in the frame (labels, the machine's voice, handwriting), with letter spacing.
export function flat(g, str, x, y, px, face = 'mono', o = {}) {
  g.save();
  g.font = FACE[face].replace('100px', `${px}px`);
  g.textBaseline = o.baseline || 'alphabetic';
  g.textAlign = o.align || 'left';
  if (o.track) g.letterSpacing = `${o.track}px`;
  g.globalAlpha *= o.alpha ?? 1;
  if (o.stroke) { g.lineJoin = 'round'; g.strokeStyle = o.stroke; g.lineWidth = o.sw || px * .12; g.strokeText(str, x, y); }
  g.fillStyle = o.fill || '#fff';
  g.fillText(str, x, y);
  const wdt = g.measureText(str).width;
  g.restore();
  return wdt;
}

// ---------------------------------------------------------------- labels
// A brief's label: one clean strip, left-aligned under the handle. A block of the member's colour
// with the brief's number, then the place and the app, then who built it. Nothing hangs off it.
import { BRIEFS, BAND } from './palette.js';
export function ticket(g, n, x, y, alpha = 1, o = {}) {
  const b = BRIEFS[n], m = BAND[b.who];
  if (alpha <= 0) return;
  g.save();
  g.globalAlpha *= alpha;
  const hN = 70, pad = 18;
  // The number block.
  g.fillStyle = m.col; g.fillRect(x, y, 96, hN);
  g.font = '900 64px Stencil'; g.fillStyle = '#0c0b0d'; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
  g.fillText(String(b.n).padStart(2, '0'), x + 48, y + 60);
  // The text, on a black strip.
  g.textAlign = 'left';
  g.font = '800 30px Mono';
  const line1 = `${b.place} · ${b.app}`, line2 = `BRIEF ${b.n} OF 4 · BUILT BY ${m.name}`;
  const w1 = g.measureText(line1).width; g.font = '500 22px Mono'; const w2 = g.measureText(line2).width;
  const wBox = Math.max(w1, w2) + pad * 2;
  g.fillStyle = 'rgba(12,11,13,.86)'; g.fillRect(x + 96, y, wBox, hN);
  g.fillStyle = m.col; g.fillRect(x + 96, y + hN - 3, wBox, 3);
  g.font = '800 30px Mono'; g.fillStyle = '#f3efe6'; g.fillText(line1, x + 96 + pad, y + 32);
  g.font = '500 22px Mono'; g.fillStyle = m.col; g.fillText(line2, x + 96 + pad, y + 58);
  g.restore();
}

// An echo: a word the reflections sing, etched as an outline that the laser draws and leaves
// glowing (no hole), in the singer's colour. Drawn with drawEtch at t, fading after `hold` s.
export function drawEtch(g, c, t, cws, o = {}) {
  for (const cw of cws) {
    const v = cw.w.v ?? 0, dur = cw.o.dur ?? o.dur ?? .22;
    const p = clamp((t - (v - dur)) / dur);
    if (p <= 0) continue;
    const fade = clamp(1 - (t - (cw.o.out ?? o.out ?? v + 1.2)) / .3);
    if (fade <= 0) continue;
    g.save();
    g.globalAlpha *= fade;
    laserTrace(g, c, cw, p, { ...o, E: o.E });
    if (p >= 1) {
      // The finished etch: a steady line round every piece, and a faint fill of colour.
      for (const pc of cw.pieces) {
        const f = projPoly(c, pc.pts.map(([u, vv]) => ap(cw.m, [u, vv, 0])));
        if (!f) continue;
        g.beginPath(); tracePoly(g, f);
        g.fillStyle = rgba(cw.o.laser || o.laser || '#fff', cw.o.fill ?? o.fill ?? .5); g.fill();
        g.strokeStyle = rgba(o.laser || '#fff', .95); g.lineWidth = o.w ?? 2.4; g.stroke();
        if (o.E) { o.E.beginPath(); tracePoly(o.E, f); o.E.strokeStyle = rgba(o.laser || '#fff', .55); o.E.lineWidth = (o.w ?? 2.4) * 2; o.E.stroke(); }
      }
    }
    audit(c, cw, { open: p >= 1, p }, { alpha: fade });
    g.restore();
  }
}

// An echo lettered flat on the frame (across cuts): the stencil outline drawn by the laser at
// progress p, then held glowing. For the backing vocals the reflections sing.
export function etchFlat(g, str, x, y, px, col, p, o = {}) {
  if (p <= 0) return;
  const xs = glyphX(str);
  const pieces = [];
  for (let i = 0; i < str.length; i++) {
    const gd = GL.glyphs[str[i]];
    if (!gd) continue;
    for (const pc of gd.pieces) pieces.push({ pts: pc.pts.map(([gx, gy]) => [x + (xs[i] + gx / GL.upm) * px, y - gy / GL.upm * px]), len: pc.len / GL.upm * px });
  }
  const w = width100(str) / 100 * px;
  const shift = o.align === 'center' ? -w / 2 : o.align === 'right' ? -w : 0;
  g.save();
  g.translate(shift, 0);
  g.lineJoin = 'round'; g.lineCap = 'round';
  const pass = (ctx, lw, style, fill) => {
    ctx.save(); ctx.translate(shift, 0);
    for (const pc of pieces) {
      const n = pc.pts.length, want = pc.len * clamp(p);
      let acc = 0; const path = [pc.pts[0]];
      for (let k = 0; k < n && acc < want; k++) {
        const a = pc.pts[k], b = pc.pts[(k + 1) % n], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (acc + d <= want) { path.push(b); acc += d; } else { const s = (want - acc) / d; path.push([lerp(a[0], b[0], s), lerp(a[1], b[1], s)]); acc = want; }
      }
      ctx.beginPath(); path.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]));
      if (p >= 1) ctx.closePath();
      if (fill && p >= 1) { ctx.fillStyle = fill; ctx.fill(); }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    }
    ctx.restore();
  };
  g.restore();
  pass(g, (o.w ?? 3) * 2.4, rgba(col, .35 * (o.alpha ?? 1)), p >= 1 ? rgba(col, (o.fill ?? .45) * (o.alpha ?? 1)) : null);
  pass(g, o.w ?? 3, rgba(mix(col, '#ffffff', .4), .95 * (o.alpha ?? 1)));
  if (o.E) pass(o.E, (o.w ?? 3) * 3, rgba(col, .7 * (o.alpha ?? 1)));
  if (AUDIT.on && o.w0 && o.w0.li !== undefined) auditFlat(str, [x + shift, y - px * CAPK(), x + shift + w, y], px * CAPK(), 0, o.w0, { alpha: o.alpha ?? 1, prog: p, outline: true });
}

// A name or title cut a letter at a time, each letter on its own moment (a note of the riff):
// the letters laid out as one word on the plane, then split so each has its own time.
export function lettersOn(str, times, m, u, v, em, o = {}) {
  const whole = cutWord({ w: str, v: 0 }, m, u, v, em, { str });
  const out = [];
  let k = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ' ') continue;
    const pcs = whole.pieces.filter(p => p.gi === i);
    const tt = times[Math.min(k, times.length - 1)]; k++;
    out.push({ w: { v: tt, li: o.li, wi: o.wi }, str: str[i], m, u, v, em, wid: whole.wid, pieces: pcs, n: pcs.length, o: { dur: o.dur ?? .08, noAudit: o.noAudit ?? true, ...o } });
  }
  return out;
}
// Any polygon cut out of a plane at a moment (a shard of the riff's storm).
export function shardCut(pts, v, m, o = {}) {
  let len = 0, cx = 0, cy = 0;
  for (let k = 0; k < pts.length; k++) { const q = pts[(k + 1) % pts.length]; len += Math.hypot(q[0] - pts[k][0], q[1] - pts[k][1]); cx += pts[k][0]; cy += pts[k][1]; }
  return { w: { v }, str: '', m, u: cx / pts.length, v: cy / pts.length, em: 100, wid: 1, pieces: [{ pts, len, c: [cx / pts.length, cy / pts.length], gi: 0 }], n: 1, o: { dur: o.dur ?? .07, noAudit: true, ...o } };
}

// Words laid round a circle (a disc of mirror that turns): each glyph stood on the rim, reading
// clockwise from angle a0 (0 = the top). The pieces are in the disc's own coordinates; set cw.m
// to the disc's matrix each frame.
export function ringCut(ws, idx, R, em, a0, gap = .3) {
  const out = [];
  let s = 0;
  for (const i of idx) {
    const w = ws[i], str = caps(w.w);
    const xs = glyphX(str);
    const pieces = [];
    for (let k = 0; k < str.length; k++) {
      const gd = GL.glyphs[str[k]];
      if (!gd) continue;
      const adv = gd.adv / GL.upm * em;
      const sc = s + xs[k] * em + adv / 2;
      const th = a0 + sc / R;
      const tx = Math.cos(th), ty = -Math.sin(th), ux = Math.sin(th), uy = Math.cos(th);
      for (const pc of gd.pieces) {
        const pts = pc.pts.map(([gx, gy]) => {
          const px = gx / GL.upm * em - adv / 2, py = gy / GL.upm * em;
          return [R * ux + px * tx + py * ux, R * uy + px * ty + py * uy];
        });
        let cx = 0, cy = 0; for (const q of pts) { cx += q[0]; cy += q[1]; }
        pieces.push({ pts, len: pc.len / GL.upm * em, c: [cx / pts.length, cy / pts.length], gi: k });
      }
    }
    const wid = width100(str) / 100 * em;
    out.push({ w, str, m: null, u: 0, v: R, em, wid, pieces, n: pieces.length, o: { ring: true } });
    s += wid + gap * em;
  }
  return out;
}

// Words of a line sung before a shot begins, carried into it already cut (so a line holds across
// the cut): pass the cuts and the shot's start.
// A window cut out of the mirror: a box on screen as camera c sees it, with rounded corners,
// traced onto plane m. The laser runs round it over o.dur; it's open at v.
export function windowCut(c, m, box, v, o = {}) {
  const [x0, y0, x1, y1] = box, r = o.r ?? 36;
  const pts = [];
  const corner = (cx, cy, a0) => { for (let i = 0; i <= 5; i++) { const a = a0 + i / 5 * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x1 - r, y0 + r, -Math.PI / 2); corner(x1 - r, y1 - r, 0); corner(x0 + r, y1 - r, Math.PI / 2); corner(x0 + r, y0 + r, Math.PI);
  const uv = pts.map(([x, y]) => screenToPlane(c, m, x, y));
  // A window opens clean: no slab of glass falls out of it.
  return shardCut(uv, v, m, { dur: o.dur ?? .45, noFall: true, ...o });
}
export function carry(cuts, a) { for (const cw of cuts) if ((cw.w.v ?? 0) < a) cw.o.pre = true; return cuts; }
