// The band's gear, as solids: the mic on its stand, the guitars, the bass, the kit, the amps.
import { clamp, lerp, mix, rgba, hash, noise } from './kit.js';
import { M, T, S, RX, RY, RZ, ap, apn, boxFaces, prismFaces, cylFaces, drawSolid, tube, project, scaleAt, depth, planeShape, norm } from './space.js';
import { BAND } from './palette.js';

const CHROME = { base: '#8f9bb0', shadow: '#232a36', lift: 1.35, spec: '#ffffff', gloss: .93, take: .6, albedo: .8 };
const BLACK = { base: '#1a1d24', shadow: '#07080b', lift: 1.4, spec: '#8894a6', gloss: .95, take: .5, albedo: .16 };

// A mic on a straight stand. pos: the base on the floor; h: the height of the mic head;
// tiltTo: a point the mic points at (its singer's mouth).
export function micStand(g, c, o = {}) {
  const [x, y, z] = o.pos || [0, 0, 0];
  const h = o.h ?? 64;
  const lw = clamp(scaleAt(c, [x, y + h / 2, z]) * .35, 1, 6);
  const top = [x, y + h, z];
  // Three feet.
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2 + (o.rot || 0);
    tube(g, c, [[x, y + 4, z], [x + Math.cos(a) * 26, y + .8, z + Math.sin(a) * 26]], 1.1, '#2a2f38', { line: lw * .6, glint: 'rgba(200,215,235,.5)' });
  }
  tube(g, c, [[x, y + 3, z], top], 1.2, '#39404c', { line: lw * .7, glint: 'rgba(220,232,245,.6)' });
  // The mic: a short body and a round grille, pointing at the singer.
  const aim = o.aim || [x, y + h + 4, z + 20];
  const dx = aim[0] - top[0], dy = aim[1] - top[1], dz = aim[2] - top[2];
  const yaw = Math.atan2(dx, dz), pitch = -Math.atan2(dy, Math.hypot(dx, dz));
  const mm = M(T(...top), RY(yaw), RX(Math.PI / 2 + pitch));
  drawSolid(g, c, cylFaces(mm, 2.1, -1, 12, BLACK, { n: 14 }), { line: lw });
  const head = M(mm, T(0, 15.5, 0));
  drawSolid(g, c, cylFaces(head, 3.4, -3.6, 3.6, CHROME, { n: 16 }), { line: lw });
  // The grille's mesh, a few rings.
  const hp = project(c, ap(head, [0, 0, 0]));
  return { head: ap(head, [0, 0, 0]), hp };
}

// An electric guitar or bass, as a flat solid with a neck. The body outline is drawn in the xy
// plane (cm), the neck runs up +y. o: { kind: 'guitar' | 'bass', col, m (placement), strum }.
export function guitar(g, c, o = {}) {
  const bass = o.kind === 'bass';
  const m = o.m;
  const col = o.col || '#10141a';
  const lw = clamp(scaleAt(c, ap(m, [0, 0, 0])) * .32, 1, 6);
  const body = bass ? BODY_BASS : BODY_GUITAR;
  const bodyMat = { base: o.body || '#161a22', shadow: '#050608', lift: 1.5, spec: '#e9f2ff', gloss: .94, take: .7, takeK: 1.1, albedo: .2, hatchAngle: 1.0 };
  const neckL = bass ? 86 : 64, neckW = bass ? 4.6 : 4.2;
  const faces = prismFaces(m, body, 4.2, bodyMat, { sideMat: { base: '#2a3140', shadow: '#08090c', lift: 1.4, albedo: .3 } });
  const neckM = M(m, T(0, 16, 2.6));
  const neck = boxFaces(M(neckM, T(0, neckL / 2, 0)), neckW / 2, neckL / 2, 1.3, .5, { base: '#221a14', shadow: '#0a0705', lift: 1.2, albedo: .25 });
  const headM = M(neckM, T(0, neckL + 7, -.4), RZ(bass ? 0 : .02));
  const head = prismFaces(headM, bass ? HEAD_BASS : HEAD_GUITAR, 1.8, bodyMat);
  drawSolid(g, c, faces, { line: lw });
  drawSolid(g, c, neck, { line: lw * .8 });
  drawSolid(g, c, head, { line: lw * .8 });
  // Pickups and the bridge, on the body's face.
  const face = M(m, T(0, 0, 2.15));
  const pu = bass ? [[-4.5, 2, 9, 4.2], [-4.5, -8, 9, 4.2]] : [[-4.2, 5, 8.4, 3.2], [-4.2, -3, 8.4, 3.2]];
  for (const [px, py, pw, ph] of pu) planeShape(g, c, face, [[px, py], [px + pw, py], [px + pw, py + ph], [px, py + ph]], '#07080a', { stroke: '#3d4552', lw: .8 });
  planeShape(g, c, face, [[-4, -12], [4, -12], [4, -10], [-4, -10]], '#9aa6b8');
  // Strings: from the bridge to the head, glowing in the player's colour when struck.
  const n = bass ? 4 : 6;
  const glow = o.glow ?? 0;
  const sc = scaleAt(c, ap(m, [0, 0, 0]));
  for (let i = 0; i < n; i++) {
    const sx = (i - (n - 1) / 2) * (bass ? 1.05 : .72);
    const vib = (o.strum || 0) * Math.sin((o.t || 0) * 90 + i * 1.7) * .5;
    const a = ap(face, [sx + vib, -11, .4]), b = ap(neckM, [sx * .8, neckL + 1, 1.5]);
    const pa = project(c, a), pb = project(c, b);
    g.strokeStyle = glow > .05 ? mix('#c9d2de', o.glowCol || '#ffffff', clamp(glow)) : '#b9c3d0';
    g.lineWidth = Math.max(.6, sc * (bass ? .16 : .1));
    g.beginPath(); g.moveTo(pa.x, pa.y); g.lineTo(pb.x, pb.y); g.stroke();
    if (o.E && glow > .05) { o.E.strokeStyle = rgba(o.glowCol || '#fff', glow); o.E.lineWidth = Math.max(1, sc * .5); o.E.beginPath(); o.E.moveTo(pa.x, pa.y); o.E.lineTo(pb.x, pb.y); o.E.stroke(); }
  }
  return { neckTop: ap(neckM, [0, neckL, 2]), bodyC: ap(m, [0, 0, 0]), strumAt: ap(face, [0, -2, 2]) };
}
// REGEX's guitar: an offset, pointed body. NULL's bass: long horns. Both counter-clockwise.
// REGEX's guitar: an offset waist, the body of the indie and math-rock guitar. NULL's bass: long
// horns, a deep lower bout. Both counter-clockwise, drawn through as smooth curves.
const BODY_GUITAR = [[0, -21], [9, -20.5], [15, -16], [17, -9], [15.5, -3], [13, 1.5], [14, 6.5], [16.5, 12], [15, 18.5], [10.5, 21.5], [5.5, 18.5], [2.2, 16.2], [-2.2, 16.2], [-6.5, 17.5], [-11.5, 20.5], [-15.8, 17], [-16.8, 11], [-14.6, 5], [-12.6, 0], [-14.2, -5.5], [-16.6, -11.5], [-15, -17.5], [-8.5, -20.8]];
const GUARD_GUITAR = [[-3, -12], [5, -13.5], [11, -10], [12.5, -3], [10.5, 3], [11.5, 9], [8, 14], [2.2, 15.4], [-2.2, 15.4], [-8, 14.5], [-12, 9], [-11.2, 3], [-12.4, -3], [-9, -9.5]];
const BODY_BASS = [[0, -22], [11, -21], [17.5, -15], [19, -6], [16, 1.5], [15.5, 8], [17.5, 16], [15.5, 27], [11, 27.5], [7.5, 20], [2.4, 17.5], [-2.4, 17.5], [-8, 18.5], [-13, 24.5], [-17.5, 22], [-18.5, 13], [-16, 4.5], [-18, -4], [-18.5, -12], [-14.5, -19], [-7, -21.8]];
const HEAD_GUITAR = [[-2.6, -6], [2.6, -6], [3.2, 4], [0, 7], [-4, 5]];
const HEAD_BASS = [[-2.8, -7], [2.8, -7], [3.4, 6], [-3.4, 8]];

// An amp stack or a single cab, with grille cloth.
export function amp(g, c, o = {}) {
  const m = o.m;
  const w = o.w ?? 70, h = o.h ?? 70, d = o.d ?? 34;
  const lw = clamp(scaleAt(c, ap(m, [0, h / 2, 0])) * .32, 1, 5);
  const mat = { base: '#16181e', shadow: '#050506', lift: 1.3, take: .5, albedo: .14 };
  drawSolid(g, c, boxFaces(M(m, T(0, h / 2, 0)), w / 2, h / 2, d / 2, 2.4, mat), { line: lw });
  const face = M(m, T(0, h / 2, d / 2 + .1));
  planeShape(g, c, face, [[-w / 2 + 4, -h / 2 + 4], [w / 2 - 4, -h / 2 + 4], [w / 2 - 4, h / 2 - 12], [-w / 2 + 4, h / 2 - 12]], '#0d0f13', { stroke: '#2a2e36', lw: 1 });
  // The weave: a fine diagonal grid.
  g.save();
  g.strokeStyle = 'rgba(80,88,104,.28)'; g.lineWidth = .7;
  for (let i = -8; i <= 8; i++) {
    const a = project(c, ap(face, [i * 4 - 18, -h / 2 + 4, 0])), b = project(c, ap(face, [i * 4 + 18, h / 2 - 12, 0]));
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  }
  g.restore();
  // The logo plate and a red power light.
  planeShape(g, c, face, [[-9, h / 2 - 9], [9, h / 2 - 9], [9, h / 2 - 5], [-9, h / 2 - 5]], '#9aa6b8');
  const pl = project(c, ap(face, [w / 2 - 7, h / 2 - 6, .2]));
  g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(pl.x, pl.y, Math.max(1, pl.s * .9), 0, Math.PI * 2); g.fill();
  if (o.E) { o.E.fillStyle = 'rgba(255,60,60,.9)'; o.E.beginPath(); o.E.arc(pl.x, pl.y, Math.max(2, pl.s * 2.5), 0, Math.PI * 2); o.E.fill(); }
}

// CRON's kit: a kick with the band's name on its head, a snare, two rack toms, a floor tom,
// hi-hats and two cymbals on stands. pos is the kick's front foot on the floor; the kit faces +z.
// hits: { kick, snare, crash, hat } 0..1, for the heads and cymbals to jump.
export function drumKit(g, c, o = {}) {
  const [x, y, z] = o.pos || [0, 0, 0];
  const col = o.col || '#bdff3f';
  const hits = o.hits || {};
  const lw = clamp(scaleAt(c, [x, y + 30, z]) * .3, 1, 5);
  const shell = { base: '#1c2418', shadow: '#060805', lift: 1.4, spec: '#e8ffd0', gloss: .95, take: .6, rim: 1, rimCol: '#e9ffd6', albedo: .22 };
  const head = { base: '#d9dccd', shadow: '#5f6456', lift: 1.1, take: .5, albedo: .95 };
  const hoop = { base: '#9aa6b8', shadow: '#2a303a', lift: 1.4, spec: '#ffffff', gloss: .9 };
  const brass = { base: '#b8923d', shadow: '#4a3512', lift: 1.4, spec: '#fff2c4', gloss: .9, take: .6, rim: 1.2, rimCol: '#fff3d0', albedo: .3, scratch: 1 };
  const items = [];
  const add = (p, draw) => items.push({ z: depth(c, p), draw });
  // The kick, lying on its side, head to the front.
  const kr = 27, kd = 36;
  const km = M(T(x, y + kr + 1, z - kd / 2), RX(Math.PI / 2));
  add([x, y + kr, z - 4], g2 => {
    drawSolid(g2, c, cylFaces(km, kr, -kd / 2, kd / 2, shell, { n: 36, topMat: head, bottomMat: head }), { line: lw });
    const hm = M(T(x, y + kr + 1, z + .3));
    // The front head: the band's name round a circle in the member's colour.
    const ring = Array.from({ length: 48 }, (_, i) => { const a = i / 48 * Math.PI * 2; return [Math.cos(a) * kr * .8, Math.sin(a) * kr * .8]; });
    planeShape(g2, c, hm, ring, '#0e120c');
    const inner = Array.from({ length: 48 }, (_, i) => { const a = i / 48 * Math.PI * 2; return [Math.cos(a) * kr * .74, Math.sin(a) * kr * .74]; });
    planeShape(g2, c, hm, inner, rgba(col, .15 + .5 * (hits.kick || 0)));
    o.kickHead?.(g2, hm, kr);
    if (o.E) planeShape(o.E, c, hm, inner, rgba(col, .25 + .6 * (hits.kick || 0)));
  });
  const drum = (px, py, pz, r, d, tilt, hit = 0) => {
    const m = M(T(px, py - hit * 1.2, pz), RX(tilt));
    add([px, py, pz], g2 => drawSolid(g2, c, cylFaces(m, r, -d, 0, shell, { n: 28, topMat: head }), { line: lw }));
  };
  // Snare (left), rack toms over the kick, floor tom (right).
  drum(x - 34, y + 54, z + 8, 13, 12, -.25, hits.snare || 0);
  drum(x - 13, y + 62, z - 2, 10, 12, -.45, hits.tom || 0);
  drum(x + 13, y + 62, z - 2, 11, 13, -.45, hits.tom || 0);
  drum(x + 40, y + 42, z + 6, 15, 34, -.12, hits.tom2 || 0);
  // Stands and cymbals.
  const cym = (px, py, pz, r, tilt, spin, hit = 0) => {
    tube(g, c, [[px, y, pz], [px, py, pz]], .9, '#3b424e', { line: lw * .6 });
    const wob = hit * .25 * Math.sin((o.t || 0) * 40);
    const m = M(T(px, py, pz), RZ(tilt + wob), RX(-.35 + wob * .5));
    add([px, py, pz], g2 => drawSolid(g2, c, cylFaces(m, r, -.6, .6, brass, { n: 32 }), { line: lw * .7 }));
  };
  cym(x - 52, y + 76, z + 10, 13, .1, 0, hits.hat || 0);
  cym(x - 40, y + 118, z - 8, 21, .25, 0, hits.crash || 0);
  cym(x + 48, y + 106, z - 10, 23, -.2, 0, (hits.crash || 0) * .6);
  paintItems(g, items);
}
function paintItems(g, items) { items.sort((a, b) => b.z - a.z); for (const it of items) it.draw(g); }

// ---------------------------------------------------------------- drawn by hand
// A closed curve through screen points (Catmull-Rom as Béziers): outlines drawn by hand, not
// polygons with their corners rounded.
function curve(g, pp, k = .18) {
  const n = pp.length;
  for (let i = 0; i < n; i++) {
    const p0 = pp[(i - 1 + n) % n], p1 = pp[i], p2 = pp[(i + 1) % n], p3 = pp[(i + 2) % n];
    if (i === 0) g.moveTo(p1[0], p1[1]);
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
  }
  g.closePath();
}
// The gear, drawn in the same hand as the band: placed in 3D, painted flat with light, inked.
import { roundPath, inkLine, hull } from './soft.js';
import { INK } from './ink.js';
const LINE = '#120b0a';
const pathOf = (g, pp) => { g.moveTo(pp[0][0], pp[0][1]); for (let i = 1; i < pp.length; i++) g.lineTo(pp[i][0], pp[i][1]); g.closePath(); };

// A guitar or bass. m places it (body in the xy plane, neck up +y, face towards +z).
// o: { kind, body: fill colour, edge: rim colour, glow 0..1, glowCol, strum, t, E }
export function guitar2d(g, c, o) {
  const bass = o.kind === 'bass';
  const m = o.m;
  const body = bass ? BODY_BASS : BODY_GUITAR;
  const P = (x, y, z = 2.1) => { const p = project(c, ap(m, [x, y, z])); return [p.x, p.y]; };
  const sc = scaleAt(c, ap(m, [0, 0, 0]));
  const lw = clamp(sc * .45, 1, 7);
  const neckL = bass ? 86 : 64, nw = bass ? 2.4 : 2.1;
  const fill = o.body || (bass ? '#101116' : INK.paper);
  const dark = !o.body && bass;
  // The neck and head first, behind the body's top.
  const n0 = 14, n1 = 16 + neckL;
  const neck = [P(-nw, n0, 2.6), P(nw, n0, 2.6), P(nw * .85, n1, 2.6), P(-nw * .85, n1, 2.6)];
  g.save();
  g.beginPath(); pathOf(g, neck); g.fillStyle = '#2a1d15'; g.fill();
  inkLine(g, () => pathOf(g, neck), lw * .7, 0, -1, LINE);
  // Frets.
  g.strokeStyle = 'rgba(210,214,220,.7)'; g.lineWidth = Math.max(.6, sc * .18);
  for (let i = 1; i < 16; i++) {
    const y = n0 + (n1 - n0) * (1 - Math.pow(.94, i * 1.25));
    const a = P(-nw, y, 2.7), b = P(nw, y, 2.7);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  const head = (bass ? HEAD_BASS : HEAD_GUITAR).map(([x, y]) => P(x * 1.1, n1 + 6 + y, 2.2));
  g.beginPath(); roundPath(g, head, lw * 1.5); g.fillStyle = fill; g.fill();
  inkLine(g, () => roundPath(g, head, lw * 1.5), lw * .8, 0, -1, LINE);
  // The body: its outline, filled, with the thickness showing as a darker edge underneath.
  const back = body.map(([x, y]) => P(x, y, -2.1)), front = body.map(([x, y]) => P(x, y, 2.1));
  // The body's thickness: its back outline, dark, showing past the front where it turns.
  g.beginPath(); curve(g, back); g.fillStyle = dark ? '#050507' : '#57534e'; g.fill();
  g.beginPath(); curve(g, front); g.fillStyle = fill; g.fill();
  // A lit sweep across the face: gloss, as a pen draws it, a white streak.
  g.save(); g.beginPath(); curve(g, front); g.clip();
  const a = P(-18, 18), b = P(16, -16);
  const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
  gr.addColorStop(0, rgba('#ffffff', dark ? .0 : .0)); gr.addColorStop(.42, rgba('#ffffff', dark ? .22 : .5)); gr.addColorStop(.5, rgba('#ffffff', 0)); gr.addColorStop(1, rgba('#000000', dark ? 0 : .18));
  g.fillStyle = gr; g.fillRect(Math.min(a[0], b[0]) - 60, Math.min(a[1], b[1]) - 60, Math.abs(b[0] - a[0]) + 120, Math.abs(b[1] - a[1]) + 120);
  g.restore();
  inkLine(g, () => curve(g, front), lw, 0, -1, LINE);
  if (o.edge) { g.strokeStyle = rgba(o.edge, .9); g.lineWidth = Math.max(1, lw * .6); g.beginPath(); curve(g, front); g.stroke(); }
  // Pickguard (guitar): black, following the body's line; pickups, bridge, knobs.
  if (!bass) {
    const pg = GUARD_GUITAR.map(([x, y]) => P(x, y, 2.2));
    g.beginPath(); curve(g, pg); g.fillStyle = '#141519'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = Math.max(.6, lw * .3); g.stroke();
  }
  const pu = bass ? [[-4.5, 2, 9, 4.2], [-4.5, -8, 9, 4.2]] : [[-4.2, 5, 8.4, 3.2], [-4.2, -3, 8.4, 3.2]];
  for (const [px, py, pw, ph] of pu) {
    const q = [P(px, py, 2.3), P(px + pw, py, 2.3), P(px + pw, py + ph, 2.3), P(px, py + ph, 2.3)];
    g.beginPath(); pathOf(g, q); g.fillStyle = '#08090b'; g.fill(); g.strokeStyle = '#8c96a6'; g.lineWidth = Math.max(.6, sc * .25); g.stroke();
  }
  const br = [P(-4.5, -12.5, 2.3), P(4.5, -12.5, 2.3), P(4.5, -10.5, 2.3), P(-4.5, -10.5, 2.3)];
  g.beginPath(); pathOf(g, br); g.fillStyle = '#b8c2cf'; g.fill();
  for (const [kx, ky] of [[9.5, -14], [12, -9.5], [6.5, -17]]) { const k = P(kx, ky, 2.4); g.fillStyle = '#c9ced6'; g.beginPath(); g.arc(k[0], k[1], Math.max(1, sc * 1.2), 0, Math.PI * 2); g.fill(); g.strokeStyle = LINE; g.lineWidth = Math.max(.6, sc * .3); g.stroke(); }
  // Strings, bridge to head, lit in the player's colour when struck.
  const ns = bass ? 4 : 6, glow = o.glow ?? 0;
  for (let i = 0; i < ns; i++) {
    const sx = (i - (ns - 1) / 2) * (bass ? 1.05 : .72);
    const vib = (o.strum || 0) * Math.sin((o.t || 0) * 90 + i * 1.7) * .45;
    const s0 = P(sx + vib, -11.5, 2.6), s1 = P(sx * .8, n1 + 1, 2.8);
    g.strokeStyle = glow > .05 ? mix('#dfe5ec', o.glowCol || '#ffffff', clamp(glow)) : '#d5dbe3';
    g.lineWidth = Math.max(.5, sc * (bass ? .16 : .1));
    g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(s1[0], s1[1]); g.stroke();
    if (o.E && glow > .05) { o.E.strokeStyle = rgba(o.glowCol || '#fff', glow * .9); o.E.lineWidth = Math.max(1, sc * .45); o.E.beginPath(); o.E.moveTo(s0[0], s0[1]); o.E.lineTo(s1[0], s1[1]); o.E.stroke(); }
  }
  g.restore();
}

// A drum: a cylinder along the matrix's y axis (r cm, depth d), head up. Drawn as its shell's
// silhouette and its head's ellipse, with the hoops inked.
export function drum2d(g, c, m, r, d, o = {}) {
  const ring = (y, k = 1) => Array.from({ length: 36 }, (_, i) => { const a = i / 36 * Math.PI * 2; const p = project(c, ap(m, [Math.cos(a) * r * k, y, Math.sin(a) * r * k])); return [p.x, p.y]; });
  const top = ring(0), bot = ring(-d);
  const sc = scaleAt(c, ap(m, [0, 0, 0]));
  const lw = clamp(sc * .4, 1, 6);
  const sil = hull([...top, ...bot]);
  g.save();
  g.beginPath(); pathOf(g, sil); g.fillStyle = o.shell || '#141817'; g.fill();
  // A lit stripe down the shell: the wrap catching the light.
  g.save(); g.beginPath(); pathOf(g, sil); g.clip();
  const L = project(c, ap(m, [-r * .45, -d / 2, r])), Rr = project(c, ap(m, [r * .1, -d / 2, r]));
  const gr = g.createLinearGradient(L.x, 0, Rr.x, 0);
  gr.addColorStop(0, rgba('#ffffff', 0)); gr.addColorStop(.5, rgba(o.lit || '#dff8c8', .38)); gr.addColorStop(1, rgba('#ffffff', 0));
  g.fillStyle = gr; g.fillRect(Math.min(L.x, Rr.x) - 5, -1e4, Math.abs(Rr.x - L.x) + 10, 2e4);
  g.restore();
  inkLine(g, () => pathOf(g, sil), lw, 0, -1, LINE);
  // The head: cream, with its hoop.
  const facingUp = facingN(c, m);
  if (facingUp) {
    g.beginPath(); pathOf(g, top); g.fillStyle = o.head || '#efe6d0'; g.fill();
    g.strokeStyle = '#aab3c0'; g.lineWidth = Math.max(1, sc * .9); g.stroke();
    g.strokeStyle = LINE; g.lineWidth = lw * .7; g.stroke();
    if (o.hit > .05) { g.fillStyle = rgba(o.hitCol || '#ffffff', o.hit * .5); g.beginPath(); pathOf(g, ring(.1, .7)); g.fill(); }
  }
  g.restore();
}
function facingN(c, m) {
  const n = apn(m, [0, 1, 0]), p = ap(m, [0, 0, 0]);
  return (n[0] * (c.pos[0] - p[0]) + n[1] * (c.pos[1] - p[1]) + n[2] * (c.pos[2] - p[2])) > 0;
}
// A cymbal: a thin brass disc, lathe rings and a lit sweep.
export function cymbal2d(g, c, m, r, o = {}) {
  const ring = k => Array.from({ length: 40 }, (_, i) => { const a = i / 40 * Math.PI * 2; const p = project(c, ap(m, [Math.cos(a) * r * k, (1 - k) * 1.4, Math.sin(a) * r * k])); return [p.x, p.y]; });
  const sc = scaleAt(c, ap(m, [0, 0, 0]));
  const lw = clamp(sc * .35, .8, 5);
  const out = ring(1);
  g.save();
  g.beginPath(); pathOf(g, out);
  const cp = project(c, ap(m, [0, 0, 0]));
  const gr = g.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, r * sc * 1.1);
  gr.addColorStop(0, '#f3dc97'); gr.addColorStop(.5, '#b58a36'); gr.addColorStop(1, '#6e4f1c');
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(60,38,12,.45)'; g.lineWidth = Math.max(.5, sc * .12);
  for (const k of [.25, .4, .55, .7, .85]) { g.beginPath(); pathOf(g, ring(k)); g.stroke(); }
  // The glint: a bright arc on the near edge.
  const hl = ring(.78).slice(22, 34);
  g.strokeStyle = rgba('#fff8e0', .8 + (o.hit || 0) * .2); g.lineWidth = Math.max(1, sc * .9); g.lineCap = 'round';
  g.beginPath(); hl.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
  inkLine(g, () => pathOf(g, out), lw, 0, -1, LINE);
  const bell = ring(.18);
  g.beginPath(); pathOf(g, bell); g.fillStyle = '#e6c878'; g.fill(); g.strokeStyle = LINE; g.lineWidth = lw * .6; g.stroke();
  g.restore();
}

// CRON's kit, drawn by hand: kick with the band's name, snare, toms, floor tom, hats, cymbals.
export function drumKit2d(g, c, o = {}) {
  const [x, y, z] = o.pos || [0, 0, 0];
  const col = o.col || '#bdff3f';
  const hits = o.hits || {};
  const t = o.t || 0;
  // o.flip turns the kit round to face the other way (a drummer facing the mirror).
  const F = o.flip ? -1 : 1;
  const Q = (dx, dy, dz) => [x + F * dx, y + dy, z + F * dz];
  const Mt = (p, ...rest) => o.flip ? M(T(...p), RY(Math.PI), ...rest) : M(T(...p), ...rest);
  const items = [];
  const add = (p, draw) => items.push({ z: depth(c, p), draw });
  const lw = clamp(scaleAt(c, [x, y + 30, z]) * .4, 1, 6);
  // Stands, drawn first, thin and dark with a light edge.
  const stand = (a, b) => tube(g, c, [a, b], .8, '#2c3038', { line: lw * .5, glint: 'rgba(210,220,235,.55)' });
  // The kick: its front head facing out, a ring of shell, the band's lime.
  const kr = 27;
  add(Q(0, kr, 2), g2 => {
    drum2d(g2, c, Mt(Q(0, kr + 1, 18), RX(Math.PI / 2)), kr, 36, { head: '#0f110d', shell: '#141817' });
    const hm = Mt(Q(0, kr + 1, 18.2));
    const ringPts = k => Array.from({ length: 48 }, (_, i) => { const a = i / 48 * Math.PI * 2; return [Math.cos(a) * kr * k, Math.sin(a) * kr * k]; });
    planeShape(g2, c, hm, ringPts(.96), '#e9e1cb');
    planeShape(g2, c, hm, ringPts(.8), rgba(col, .85 + .15 * (hits.kick || 0)));
    planeShape(g2, c, hm, ringPts(.62), '#0f110d');
    o.kickHead?.(g2, hm, kr);
    if (o.E) planeShape(o.E, c, hm, ringPts(.8), rgba(col, .35 + .55 * (hits.kick || 0)));
  });
  const drum = (dx, dy, dz, r, d, tilt, hit = 0) => { const p = Q(dx, dy, dz); add(p, g2 => drum2d(g2, c, Mt([p[0], p[1] - hit * 1.2, p[2]], RX(tilt)), r, d, { hit, hitCol: col })); };
  drum(-34, 54, 8, 13, 12, -.25, hits.snare || 0);
  drum(-13, 62, -2, 10, 12, -.45, hits.tom || 0);
  drum(13, 62, -2, 11, 13, -.45, hits.tom || 0);
  drum(40, 42, 6, 15, 34, -.12, hits.tom2 || 0);
  const cym = (dx, dy, dz, r, tilt, hit = 0) => {
    const p = Q(dx, dy, dz);
    stand([p[0], y, p[2]], p);
    const wob = hit * .22 * Math.sin(t * 40);
    add(p, g2 => cymbal2d(g2, c, Mt(p, RZ(tilt + wob), RX(-.4 + wob * .5)), r, { hit }));
  };
  cym(-52, 76, 10, 13, .1, hits.hat || 0);
  cym(-40, 118, -8, 21, .25, hits.crash || 0);
  cym(48, 106, -10, 23, -.2, (hits.crash || 0) * .6);
  items.sort((a, b) => b.z - a.z);
  for (const it of items) it.draw(g);
}

// The mic on its stand, by hand: a black stand, a chrome grille with its mesh.
export function micStand2d(g, c, o = {}) {
  const [x, y, z] = o.pos || [0, 0, 0];
  const h = o.h ?? 58;
  const top = [x, y + h, z];
  const lw = clamp(scaleAt(c, [x, y + h / 2, z]) * .4, 1, 6);
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * Math.PI * 2 + (o.rot || 0) + .5;
    tube(g, c, [[x, y + 4, z], [x + Math.cos(a) * 24, y + .8, z + Math.sin(a) * 24]], 1.1, '#23262d', { line: lw * .6, glint: 'rgba(200,215,235,.45)' });
  }
  tube(g, c, [[x, y + 3, z], top], 1.2, '#2c3038', { line: lw * .7, glint: 'rgba(220,232,245,.6)' });
  const aim = o.aim || [x, y + h + 4, z - 20];
  const d = [aim[0] - top[0], aim[1] - top[1], aim[2] - top[2]], dl = Math.hypot(...d) || 1;
  const handle = [top, [top[0] + d[0] / dl * 11, top[1] + d[1] / dl * 11, top[2] + d[2] / dl * 11]];
  tube(g, c, handle, 1.9, '#111216', { line: lw * .8, glint: 'rgba(255,255,255,.45)' });
  const hc = [top[0] + d[0] / dl * 15, top[1] + d[1] / dl * 15, top[2] + d[2] / dl * 15];
  const hp = project(c, hc);
  const r = 3.6 * hp.s;
  g.save();
  const gr = g.createRadialGradient(hp.x - r * .35, hp.y - r * .4, r * .1, hp.x, hp.y, r);
  gr.addColorStop(0, '#f4f7fb'); gr.addColorStop(.5, '#9aa4b2'); gr.addColorStop(1, '#3b424e');
  g.fillStyle = gr; g.beginPath(); g.arc(hp.x, hp.y, r, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(hp.x, hp.y, r, 0, Math.PI * 2); g.clip();
  g.strokeStyle = 'rgba(20,24,30,.45)'; g.lineWidth = Math.max(.5, r * .06);
  for (let k = -6; k <= 6; k++) { g.beginPath(); g.moveTo(hp.x + k * r * .18 - r, hp.y - r); g.lineTo(hp.x + k * r * .18 + r, hp.y + r); g.stroke(); g.beginPath(); g.moveTo(hp.x + k * r * .18 + r, hp.y - r); g.lineTo(hp.x + k * r * .18 - r, hp.y + r); g.stroke(); }
  g.restore();
  g.strokeStyle = '#120b0a'; g.lineWidth = lw * .8; g.beginPath(); g.arc(hp.x, hp.y, r, 0, Math.PI * 2); g.stroke();
  g.restore();
  return { head: hc, hp };
}
