// The band: four Clawds. Each is posed as a solid in the room (so the camera can go where it
// likes) and drawn over that pose by hand: a block with softened corners, inked, lit, hatched
// and grained in the shade.
//
// Every one is the mascot's own block: a body six units wide and four tall, two tall eyes set
// high and wide, a stub of an arm on each side at five-eighths height, and four legs, two at
// each end. One unit is 10 cm. Each member is told apart by his light, his instrument and one
// thing he wears: REGEX a visor that scrolls, NULL a hooded cloak, CRON a pair of headphones.
// CLAWD, who sings, wears nothing: he's the mascot as he is.
import { clamp, lerp, mix, rgba, hash, noise } from './kit.js';
import { M, T, S, RX, RY, RZ, ap, apn, project, projPoly, scaleAt, depth, facing, norm, vsub, vadd, vmul, dot, LIGHT, inkTone, planeShape, tracePoly, vlen } from './space.js';
import { CLAWD, BAND } from './palette.js';
import { hull, roundPath, inkLine, grain } from './soft.js';
import { hatch, INK } from './ink.js';

export const U = 10;
const HX = 30, HY = 20, HZ = 18, LEG = 11;
const PAINT = { lit: '#ec9270', mid: '#d97757', shade: '#9c4a3b', deep: '#5e2626', line: '#1b0b0a' };

// Rounded-rectangle outline in 2D, for eyes, mouths and screens on a face.
export function rrect(x, y, w, h, r, n = 5) {
  r = Math.min(r, w / 2, h / 2);
  const pts = [];
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  corner(x + w - r, y + r, Math.PI * 1.5);
  return pts;
}

// How lit a face is, 0..1, and the colour the stage lights give it.
function faceLight(n, p) {
  const it = inkTone({ paint: PAINT.mid, albedo: 1, stageK: .8 }, n, p);
  return { l: clamp(1 - it.tone), tint: it.tint, stage: it.stage };
}
// Terracotta at a light level: deep in shadow, the mascot's own colour in the middle, a warm lit
// tone at the top, tinted towards the stage light that reaches it.
function paintAt(l, tint, stage) {
  const base = l < .5 ? mix(PAINT.deep, PAINT.shade, l / .5) : l < .8 ? mix(PAINT.shade, PAINT.mid, (l - .5) / .3) : mix(PAINT.mid, PAINT.lit, (l - .8) / .2);
  return stage > .05 ? mix(base, tint, clamp(stage * .28)) : base;
}
const vlerp = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];

// Pose, all optional: pos [x, y, z] (feet at y), yaw (turn), lean (forward pitch), tilt (roll),
// bob (cm up), squash (0..1), armL/armR { up, fwd, len } or { to: [x, y, z] in the body frame },
// eyes ('open' 'narrow' 'wide' 'shut' 'happy' 'sad'), blink, look [-1..1, -1..1], mouth 0..1,
// legs (a walk phase), t; inside(bodyM) -> [{ z, draw }] for what he holds.
export function clawd(g, c, o = {}) {
  const who = o.who || 'clawd';
  const pos = o.pos || [0, 0, 0];
  const sq = o.squash || 0;
  const t = o.t || 0;
  const root = M(T(pos[0], pos[1] + (o.bob || 0), pos[2]), RY(o.yaw || 0), RZ(o.tilt || 0), RX(o.lean || 0), S(1 + sq * .3, 1 - sq * .28, 1 + sq * .3));
  const bodyM = M(root, T(0, LEG + HY, 0));
  const sc = scaleAt(c, ap(bodyM, [0, 0, 0]));
  const lw = o.line ?? clamp(sc * .5, 1.2, 10);
  const parts = [];
  // A contact shadow on the floor (not in reflections).
  if (!c.mirror && o.shadow !== false && pos[1] < 1) {
    const cp = project(c, ap(root, [0, .2 - (o.bob || 0), 0]));
    const ex = project(c, ap(root, [HX + 8, .2 - (o.bob || 0), 0]));
    const rx = Math.abs(ex.x - cp.x) + 4, ry = rx * .22;
    const lift = clamp(1 - (o.bob || 0) / 60);
    g.save(); g.translate(cp.x, cp.y); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, rgba('#000000', .85 * lift)); gr.addColorStop(.7, rgba('#000000', .5 * lift)); gr.addColorStop(1, rgba('#000000', 0));
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore();
  }
  // Legs: stubs from the underside to the floor, two at each end.
  if (who !== 'null') [-22.5, -12.5, 12.5, 22.5].forEach((x, i) => {
    const ph = o.legs === undefined ? 0 : Math.max(0, Math.sin((o.legs + (i % 2) * .5) * Math.PI * 2));
    const top = ap(bodyM, [x, -HY + 2, 0]), bot = ap(root, [x, ph * 4, 0]);
    parts.push({ z: depth(c, top) + 3, draw: g2 => stub(g2, c, top, bot, 5.4, lw, t, i) });
  });
  // Arms: from the shoulder, five-eighths up the side, either posed or sent to a point.
  const arm = (side, a) => {
    a = a || {};
    const sh = [side * (HX - 2), -HY + 25, a.z ?? 0];
    const A = ap(bodyM, sh);
    let B;
    if (a.to) {
      B = ap(bodyM, a.to);
      const d = vlen(vsub(B, A)), maxL = (a.max ?? 1.7) * U;
      if (d > maxL) B = vadd(A, vmul(vsub(B, A), maxL / d));
    } else {
      const len = (a.len ?? 1.05) * U;
      const m = M(bodyM, T(...sh), RY(-side * (a.fwd || 0)), RZ(side * (a.up || 0)));
      B = ap(m, [side * len, 0, 0]);
    }
    const zc = depth(c, vlerp(A, B, .6)) + (a.zbias ?? 0);
    parts.push({ z: zc, draw: g2 => stub(g2, c, A, B, 9, lw, t, side + 5, true) });
    return B;
  };
  const tipL = arm(-1, o.armL), tipR = arm(1, o.armR);
  parts.push({ z: depth(c, ap(bodyM, [0, 0, 0])), draw: g2 => body(g2, c, bodyM, o, lw, who, t) });
  if (WEAR[who]) WEAR[who](parts, c, bodyM, root, o, lw, t);
  if (o.inside) for (const it of o.inside(bodyM, lw)) parts.push(it);
  parts.sort((a, b) => b.z - a.z);
  for (const p of parts) p.draw(g);
  return { root, bodyM, tipL, tipR, centre: ap(bodyM, [0, 0, 0]) };
}

// A stub of a limb from A to B (world), w cm thick: a rounded block, shaded on its underside.
function stub(g, c, A, B, w, lw, t, seed, isArm = false) {
  const a = project(c, A), b = project(c, B);
  if (a.z < c.near || b.z < c.near) return;
  const s = (a.s + b.s) / 2, hw = w * s / 2;
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const ax = a.x - dx / l * (isArm ? hw * .2 : 0), ay = a.y - dy / l * (isArm ? hw * .2 : 0), bx = b.x + dx / l * hw * .1, by = b.y + dy / l * hw * .1;
  const pts = [[ax + nx * hw, ay + ny * hw], [bx + nx * hw, by + ny * hw], [bx - nx * hw, by - ny * hw], [ax - nx * hw, ay - ny * hw]];
  const r = hw * .75;
  const L = faceLight(norm([0, .7, .7]), vlerp(A, B, .5));
  g.save();
  g.beginPath(); roundPath(g, pts, r);
  g.fillStyle = paintAt(clamp(L.l * .95), L.tint, L.stage); g.fill();
  g.clip();
  // The underside in shade: a band along whichever long edge is lower on screen.
  const k = ny > 0 ? 1 : -1;
  g.fillStyle = rgba(PAINT.deep, .6);
  g.beginPath();
  g.moveTo(ax + nx * hw * k * .15, ay + ny * hw * k * .15); g.lineTo(bx + nx * hw * k * .15, by + ny * hw * k * .15);
  g.lineTo(bx + nx * hw * k * 1.3, by + ny * hw * k * 1.3); g.lineTo(ax + nx * hw * k * 1.3, ay + ny * hw * k * 1.3);
  g.closePath(); g.fill();
  g.restore();
  inkLine(g, () => roundPath(g, pts, r), lw * .8, .3, -1, PAINT.line);
}

// The body: silhouette softened, faces painted by their light, hatching and grain in the shade,
// a rim where the light catches, and the ink outline over it all.
function body(g, c, m, o, lw, who, t) {
  const C = (x, y, z) => ap(m, [x, y, z]);
  const corners = [];
  for (const x of [-HX, HX]) for (const y of [-HY, HY]) for (const z of [-HZ, HZ]) corners.push(C(x, y, z));
  const pc = corners.map(p => project(c, p));
  if (pc.some(p => p.z < c.near)) return;
  const sil = hull(pc.map(p => [p.x, p.y]));
  const size = Math.hypot(pc[0].x - pc[7].x, pc[0].y - pc[7].y);
  const rS = size * .085;
  const F = [
    { n: [0, 0, 1], q: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], tag: 'front' },
    { n: [0, 0, -1], q: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]], tag: 'back' },
    { n: [1, 0, 0], q: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]], tag: 'right' },
    { n: [-1, 0, 0], q: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], tag: 'left' },
    { n: [0, 1, 0], q: [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]], tag: 'top' },
    { n: [0, -1, 0], q: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], tag: 'bottom' },
  ];
  const lightDir = LIGHT.key.dir ? norm(LIGHT.key.dir) : [0, 1, 0];
  const vis = [];
  for (const f of F) {
    const n = apn(m, f.n);
    const ctr = C(f.n[0] * HX, f.n[1] * HY, f.n[2] * HZ);
    if (!facing(c, ctr, n)) continue;
    const pts3 = f.q.map(([a, b, d]) => C(a * HX, b * HY, d * HZ));
    const pp = projPoly(c, pts3);
    if (!pp) continue;
    vis.push({ ...f, n3: n, ctr, pp, pts3, L: faceLight(n, ctr) });
  }
  g.save();
  g.beginPath(); roundPath(g, sil, rS);
  const minL = Math.min(...vis.map(v => v.L.l), 1);
  g.fillStyle = paintAt(minL * .8, PAINT.mid, 0); g.fill();
  g.save();
  g.beginPath(); roundPath(g, sil, rS); g.clip();
  for (const v of vis) {
    const col = paintAt(v.L.l, v.L.tint, v.L.stage);
    let hi = v.pts3[0], lo = v.pts3[0];
    for (const q of v.pts3) { if (q[1] > hi[1]) hi = q; if (q[1] < lo[1]) lo = q; }
    const ph = project(c, hi), pl = project(c, lo);
    let fill = col;
    if (Math.hypot(ph.x - pl.x, ph.y - pl.y) > 4 && v.tag !== 'top') {
      const gr = g.createLinearGradient(ph.x, ph.y, pl.x, pl.y);
      gr.addColorStop(0, paintAt(clamp(v.L.l + .08), v.L.tint, v.L.stage)); gr.addColorStop(1, paintAt(clamp(v.L.l - .16), v.L.tint, v.L.stage));
      fill = gr;
    }
    g.fillStyle = fill;
    g.beginPath(); roundPath(g, v.pp, size * .05); g.fill();
    if (v.tag === 'front' || v.tag === 'left' || v.tag === 'right') {
      // A pool of the key light high on the face, and shade gathering along its lower edge.
      const top = project(c, vlerp(v.ctr, hi, .6)), bot = project(c, vlerp(v.ctr, lo, 1));
      const R = size * .55;
      const pool = g.createRadialGradient(top.x, top.y, 0, top.x, top.y, R);
      pool.addColorStop(0, rgba(PAINT.lit, .35 * v.L.l)); pool.addColorStop(1, rgba(PAINT.lit, 0));
      g.fillStyle = pool; g.beginPath(); roundPath(g, v.pp, size * .05); g.fill();
      const sh = g.createLinearGradient(top.x, top.y, bot.x, bot.y);
      sh.addColorStop(.55, rgba(PAINT.deep, 0)); sh.addColorStop(1, rgba(PAINT.deep, .45));
      g.fillStyle = sh; g.beginPath(); roundPath(g, v.pp, size * .05); g.fill();
    }
    const tone = 1 - v.L.l;
    if (tone > .38) {
      // Shade hatched on the diagonal of the face's own plane, the way a manga shades a form; along
      // an edge, it read as a striped texture on a big face.
      const a = v.pp[0], b = v.pp[1], d = v.pp[3];
      const e1 = [b[0] - a[0], b[1] - a[1]], e2 = [d[0] - a[0], d[1] - a[1]];
      const l1 = Math.hypot(...e1) || 1, l2 = Math.hypot(...e2) || 1;
      const dir = [e1[0] / l1 + e2[0] / l2, e1[1] / l1 + e2[1] / l2];
      hatch(g, v.pp, clamp((tone - .38) / .55), { dir, seed: hash(v.n[0], v.n[1], v.n[2]) + (o.seed || 0), col: 'rgba(60,18,16,.75)', w: clamp(lw * .32, .7, 2.4), max: clamp(size * .06, 6, 22), min: clamp(size * .022, 3, 9), t });
    }
    const [su, sv] = v.tag === 'front' || v.tag === 'back' ? [HX, HY] : v.tag === 'top' || v.tag === 'bottom' ? [HX, HZ] : [HZ, HY];
    grain(g, c, faceFrame(m, v.tag), -su, -sv, su, sv, clamp(tone * 1.1 + .12), rgba(PAINT.deep, .55), hash(v.n[0] + 3, v.n[1], v.n[2]), t);
  }
  // The rim: light along the edges of the faces that catch it.
  for (const v of vis) {
    if (v.tag !== 'top' && v.L.l < .75) continue;
    g.strokeStyle = rgba(mix(INK.paper, v.L.tint, .35), clamp((v.L.l - .55) * 1.6) * .8);
    g.lineWidth = Math.max(1, size * .018);
    g.beginPath(); roundPath(g, v.pp, size * .05); g.stroke();
  }
  g.restore();
  inkLine(g, () => roundPath(g, sil, rS), lw, lightDir[0], -lightDir[1], PAINT.line);
  g.restore();
  const front = vis.find(v => v.tag === 'front');
  if (front && !o.back) face(g, c, M(m, T(0, 0, HZ + .1)), o, lw, who, front.L);
}
// Each face's own plane, for painting on it.
function faceFrame(m, tag) {
  if (tag === 'front') return M(m, T(0, 0, HZ));
  if (tag === 'back') return M(m, RY(Math.PI), T(0, 0, HZ));
  if (tag === 'right') return M(m, RY(Math.PI / 2), T(0, 0, HX));
  if (tag === 'left') return M(m, RY(-Math.PI / 2), T(0, 0, HX));
  if (tag === 'top') return M(m, RX(-Math.PI / 2), T(0, 0, HY));
  return M(m, RX(Math.PI / 2), T(0, 0, HY));
}

// The face: two tall eyes set high and wide, and a mouth only while singing.
function face(g, c, m, o, lw, who, L) {
  const e = o.eyes || 'open';
  const look = o.look || [0, 0];
  const blink = clamp(o.blink || 0);
  const ex = 17.5, ey = 5 + look[1] * 1.5, lx = look[0] * 2.2;
  g.save();
  for (const side of [-1, 1]) {
    const cx = side * ex + lx;
    let w = 5.6, h = 10.6;
    if (e === 'wide') { w = 6.4; h = 12.8; }
    if (e === 'sad') { h = 9; }
    h *= 1 - blink * .9;
    if (e === 'shut' || e === 'happy' || blink > .85) {
      const arc = e === 'happy' ? -2.4 : 1.4;
      const pts = [];
      for (let i = 0; i <= 8; i++) { const u = i / 8 * 2 - 1; pts.push([cx + u * 3.6, ey - 1 + arc * (1 - u * u)]); }
      const pp = pts.map(([u, v]) => project(c, ap(m, [u, v, 0])));
      g.strokeStyle = CLAWD.eye; g.lineWidth = Math.max(1.2, lw * 1.2); g.lineCap = 'round';
      g.beginPath(); pp.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke();
      continue;
    }
    const x0 = cx - w / 2, x1 = cx + w / 2, yb = ey - h / 2;
    let yt0 = ey + h / 2, yt1 = ey + h / 2;
    if (e === 'narrow') { if (side < 0) { yt1 -= h * .34; yt0 -= h * .14; } else { yt0 -= h * .34; yt1 -= h * .14; } }
    if (e === 'sad') { if (side < 0) yt0 -= h * .42; else yt1 -= h * .42; }
    const rr0 = 1;
    const pts = [[x0 + rr0, yb], [x1 - rr0, yb], [x1, yb + rr0], [x1, yt1 - rr0], [x1 - rr0, yt1], [x0 + rr0, yt0], [x0, yt0 - rr0], [x0, yb + rr0]];
    planeShape(g, c, m, pts, CLAWD.eye);
    if (blink < .5 && o.glint !== false) {
      const gy = Math.min(yt0, yt1) - 2.8;
      planeShape(g, c, m, [[x0 + 1.1, gy - 1.7], [x0 + 2.9, gy - 1.7], [x0 + 2.9, gy], [x0 + 1.1, gy]], rgba('#fff6ea', .95));
    }
  }
  if (o.mouth > .02) {
    const mw = 11 + o.mouth * 4, mh = 1.4 + o.mouth * 8.5;
    planeShape(g, c, m, rrect(-mw / 2, -9 - mh / 2, mw, mh, Math.min(mh, mw) * .42), '#22080a');
    if (o.mouth > .3) planeShape(g, c, m, rrect(-mw * .3, -9 - mh / 2 + .5, mw * .6, mh * .32, mh * .16, 3), '#6b2224');
  }
  g.restore();
}

// What each of the others wears, drawn over his pose.
const polyLine = (g, pp) => { g.moveTo(pp[0][0], pp[0][1]); for (const q of pp) g.lineTo(q[0], q[1]); g.closePath(); };
const WEAR = {
  // REGEX: a visor of black glass across the eyes, his colour scrolling in it like a pattern
  // being matched.
  regex(parts, c, m, root, o, lw, t) {
    const fm = M(m, T(0, 5, HZ + 1.6));
    parts.push({ z: depth(c, ap(fm, [0, 0, 0])) - 2, draw: g => {
      if (!facing(c, ap(fm, [0, 0, 0]), apn(m, [0, 0, 1]))) return;
      const pp = planeShape(g, c, fm, rrect(-HX + 1, -6.4, (HX - 1) * 2, 12.8, 3.2, 4), '#0a0d12');
      if (!pp) return;
      inkLine(g, () => polyLine(g, pp), lw * .9, 0, -1);
      const col = BAND.regex.col;
      const off = (t * 34) % 7.2;
      for (let i = -6; i < 7; i++) {
        const x = i * 3.6 + off - 3.6;
        if (Math.abs(x) > HX - 5) continue;
        const h = 1.4 + hash(Math.floor(t * 12), i) * 5.2;
        planeShape(g, c, fm, rrect(x - 1, -h / 2, 2, h, .7, 2), rgba(col, .6 + .4 * hash(i, Math.floor(t * 8))));
      }
      planeShape(g, c, fm, [[-HX + 6, 4], [-HX + 16, 4], [-HX + 12, 5.4], [-HX + 3, 5.4]], rgba('#ffffff', .75));
      o.emit?.(E => { for (let i = -6; i < 7; i++) planeShape(E, c, fm, rrect(i * 3.6 - 1.3, -2.6, 2.6, 5.2, .8, 2), rgba(col, .9)); });
    } });
  },
  // CRON: headphones, a band over the top and a cup on each side, the rings in his colour.
  cron(parts, c, m, root, o, lw, t) {
    const col = BAND.cron.col;
    for (const side of [-1, 1]) {
      const ctr = ap(m, [side * (HX + 3), 7, 0]);
      parts.push({ z: depth(c, ctr) - (facing(c, ctr, apn(m, [side, 0, 0])) ? 4 : -4), draw: g => {
        const cm = M(m, T(side * (HX + 3.4), 7, 0), RY(side * Math.PI / 2));
        const pp = planeShape(g, c, cm, rrect(-8, -8.5, 16, 17, 7.5, 6), '#15181d');
        if (pp) inkLine(g, () => polyLine(g, pp), lw * .9, 0, -1);
        planeShape(g, c, M(cm, T(0, 0, .3)), rrect(-5.5, -6, 11, 12, 5.2, 6), col);
        planeShape(g, c, M(cm, T(0, 0, .5)), rrect(-3.4, -3.8, 6.8, 7.6, 3.2, 5), '#15181d');
        o.emit?.(E => planeShape(E, c, M(cm, T(0, 0, .3)), rrect(-5.5, -6, 11, 12, 5.2, 6), rgba(col, .8)));
      } });
    }
    const pts = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI * i / 16; pts.push(ap(m, [Math.cos(a) * (HX + 4), 7 + Math.sin(a) * (HY + 5), 0])); }
    parts.push({ z: depth(c, ap(m, [0, HY, 0])) - 1, draw: g => {
      const pp = pts.map(p => project(c, p));
      const s = scaleAt(c, ap(m, [0, HY, 0]));
      g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
      g.strokeStyle = PAINT.line; g.lineWidth = 4.6 * s + lw * 2;
      g.beginPath(); pp.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke();
      g.strokeStyle = '#262a31'; g.lineWidth = 4.6 * s;
      g.beginPath(); pp.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke();
      g.strokeStyle = rgba('#ffffff', .35); g.lineWidth = 1.2 * s;
      g.beginPath(); pp.forEach((p, i) => i ? g.lineTo(p.x, p.y - 1.2 * s) : g.moveTo(p.x, p.y - 1.2 * s)); g.stroke();
      g.restore();
    } });
  },
  // NULL: a hooded cloak of black cloth over the whole block, falling to the floor. The hood
  // comes down to his brow; in its shadow only his eyes show, violet.
  null(parts, c, m, root, o, lw, t) {
    const col = BAND.null.col;
    const sway = noise(t * .9, 3);
    // Seen from behind (facing a mirror), the cloak is all there is: its back, the hood's seam.
    const dF = depth(c, ap(m, [0, 0, HZ])), dB = depth(c, ap(m, [0, 0, -HZ]));
    const front = dF < dB, zs = front ? 1 : -1;
    parts.push({ z: Math.min(dF, dB) - 6, draw: g => {
      const P = (x, y, z) => { const p = project(c, ap(m, [x, y, z])); return [p.x, p.y]; };
      const s = scaleAt(c, ap(m, [0, 0, 0]));
      const fy = -HY - LEG;
      const peak = P(sway * 2, HY + 24, -4 * zs), shL = P(-HX - 4, HY - 2, HZ * .3 * zs), shR = P(HX + 4, HY - 2, HZ * .3 * zs);
      const hemL = P(-HX - 12 - sway * 2, fy, HZ * .6 * zs), hemR = P(HX + 12 + sway * 2, fy, HZ * .6 * zs);
      const browL = P(-HX + 3, 11, HZ + 2), browR = P(HX - 3, 11, HZ + 2), chinL = P(-HX + 4, -5, HZ + 3), chinR = P(HX - 4, -5, HZ + 3);
      const hem = [];
      for (let i = 0; i <= 12; i++) {
        const k = i / 12, x = lerp(hemR[0], hemL[0], k), y = lerp(hemR[1], hemL[1], k) - (i % 2 ? (3 + hash(i, 7) * 5) * s : 0);
        hem.push([x, y]);
      }
      const outline = () => {
        g.moveTo(peak[0], peak[1]);
        g.quadraticCurveTo(shR[0] + 6 * s, peak[1] + (shR[1] - peak[1]) * .3, shR[0], shR[1]);
        g.quadraticCurveTo(shR[0] + 9 * s, lerp(shR[1], hemR[1], .5), hemR[0], hemR[1]);
        for (const q of hem) g.lineTo(q[0], q[1]);
        g.quadraticCurveTo(shL[0] - 9 * s, lerp(shL[1], hemL[1], .5), shL[0], shL[1]);
        g.quadraticCurveTo(shL[0] - 6 * s, peak[1] + (shL[1] - peak[1]) * .3, peak[0], peak[1]);
        g.closePath();
      };
      g.save();
      g.beginPath(); outline(); g.fillStyle = INK.col; g.fill();
      g.clip();
      // Folds: white strokes where the cloth catches his colour and the light, scratched in.
      // Folds: a few long curves from the shoulders, scratched white where the cloth turns to
      // the light, each tapering out before the hem.
      g.lineCap = 'round';
      const folds = [[.08, .02, .75], [.3, -.05, .9], [.52, .04, .6], [.7, .08, .85], [.9, .01, .7]];
      for (let i = 0; i < folds.length; i++) {
        const [k, bend, len] = folds[i];
        const x0 = lerp(shL[0], shR[0], k), y0 = lerp(shL[1], shR[1], k) + 8 * s;
        const x1 = lerp(hemL[0], hemR[0], k + (k - .5) * .25), y1 = lerp(y0, hemL[1], len);
        const gr = g.createLinearGradient(x0, y0, x1, y1);
        gr.addColorStop(0, rgba(mix(INK.paper, col, .45), .05)); gr.addColorStop(.4, rgba(mix(INK.paper, col, .45), .5)); gr.addColorStop(1, rgba(mix(INK.paper, col, .45), 0));
        g.strokeStyle = gr; g.lineWidth = Math.max(.9, s * (.9 + hash(i, 3) * .8));
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(lerp(x0, x1, .5) + bend * 60 * s, lerp(y0, y1, .5), x1, y1); g.stroke();
      }
      if (!front) {
        // From behind: the cloak is the hull of the whole block, the hem and the hood, so it
        // covers him from any side; the hood's seam runs down the back.
        g.restore();
        const pts = [];
        for (const x of [-HX - 5, HX + 5]) for (const z of [-HZ - 4, HZ + 4]) { pts.push(P(x, HY - 1, z)); pts.push(P(x, 0, z)); }
        for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; pts.push(P(Math.cos(a) * (HX + 12 + sway * 2), fy, Math.sin(a) * (HZ + 8))); }
        for (let i = 0; i <= 6; i++) { const a = Math.PI * i / 6; pts.push(P(Math.cos(a) * (HX - 6) + sway * 2, HY + 6 + Math.sin(a) * 18, -HZ * .3)); }
        const hl = hull(pts);
        g.save();
        g.beginPath(); roundPath(g, hl, 6 * s); g.fillStyle = INK.col; g.fill();
        g.clip();
        g.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
          const k = (i + .5) / 5, a = P(lerp(-HX, HX, k), HY - 4, -HZ - 5), b = P(lerp(-HX - 10, HX + 10, k + (k - .5) * .3), fy + 6, -HZ - 8);
          const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
          gr.addColorStop(0, rgba(mix(INK.paper, col, .45), .04)); gr.addColorStop(.45, rgba(mix(INK.paper, col, .45), .42)); gr.addColorStop(1, rgba(mix(INK.paper, col, .45), 0));
          g.strokeStyle = gr; g.lineWidth = Math.max(.9, s * (.9 + hash(i, 3) * .8));
          g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(lerp(a[0], b[0], .5) + (hash(i, 9) - .5) * 20 * s, lerp(a[1], b[1], .5), b[0], b[1]); g.stroke();
        }
        const top = P(sway * 2, HY + 22, -HZ * .3), nape = P(0, HY - 4, -HZ - 5), mid = P(0, -4, -HZ - 6);
        g.strokeStyle = rgba(mix(INK.paper, col, .5), .6); g.lineWidth = Math.max(1, s * 1.1);
        g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo(nape[0] + 3 * s, nape[1], mid[0], mid[1]); g.stroke();
        g.restore();
        inkLine(g, () => roundPath(g, hl, 6 * s), lw, 0, -1);
        return;
      }
      // The hood's opening: a dark arch over the face.
      g.beginPath();
      g.moveTo(chinL[0], chinL[1]);
      g.quadraticCurveTo(browL[0] - 2 * s, browL[1] - 4 * s, lerp(browL[0], browR[0], .5), browL[1] - 9 * s);
      g.quadraticCurveTo(browR[0] + 2 * s, browR[1] - 4 * s, chinR[0], chinR[1]);
      g.closePath();
      g.fillStyle = '#050407'; g.fill();
      g.strokeStyle = rgba(mix(INK.paper, col, .6), .6); g.lineWidth = Math.max(1, s * .9); g.stroke();
      g.restore();
      inkLine(g, () => outline(), lw, 0, -1);
      g.save(); g.strokeStyle = rgba(col, .9); g.lineWidth = Math.max(1.2, s * 1.1);
      g.beginPath(); g.moveTo(peak[0], peak[1]); g.quadraticCurveTo(shR[0] + 6 * s, peak[1] + (shR[1] - peak[1]) * .3, shR[0], shR[1]); g.quadraticCurveTo(shR[0] + 9 * s, lerp(shR[1], hemR[1], .5), hemR[0], hemR[1]); g.stroke(); g.restore();
      // His eyes, violet, in the hood's shadow.
      const fm = M(m, T(0, 0, HZ + 3.2));
      for (const sd of [-1, 1]) planeShape(g, c, fm, [[sd * 16 - 3.2, 1.6], [sd * 16 + 3.2, 1.6], [sd * 16 + 3.2 - sd * 1.2, 5], [sd * 16 - 3.2 - sd * 1.2, 4.6]], col);
      o.emit?.(E => { for (const sd of [-1, 1]) planeShape(E, c, fm, [[sd * 16 - 4.2, .6], [sd * 16 + 4.2, .6], [sd * 16 + 4.2, 6.4], [sd * 16 - 4.2, 6.4]], col); });
    } });
  },
};
