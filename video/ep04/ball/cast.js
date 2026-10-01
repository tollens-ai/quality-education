// The supporting cast of things: the phones (each app is a phone with a face in its top edge), the
// router that is "the net" (antennas up and waves rippling out when it's plugged in), the comma who
// faints, the bug in the code, and the magnifying glass.
import { TAU, clamp, lerp, now, hash, noise } from './kit.js';
import { INK, WHITE, CREAM, TEAL, ROSE, GOLD, GOLD_SH, GREEN, RED, WOOD, WOOD_SH, BROWN, SLATE, GREY, C, sh, lt } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, eye, dot, hose, glove, shoe, paint, pathOf, arc } from './ink.js';
import { blinkAt, groove, mouth, brows, cheeks, qmark } from './rig.js';

// ---------------------------------------------------------------- a phone
// Standing on (x, y), s = 1 is 300 wide and 560 tall. o: col (its case), eyes {lx, ly, expr:
// open|wink|happy|worried|wide|shut}, screen fn(g, sx, sy, sw, sh, s) for what it shows, wifi (0..1,
// or null for none), legs (true), L/R arms ({to: [dx, dy], pose} from the shoulder in px*s), lean.
export function phone(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), gr = groove(t, o.dance ?? .3, (o.phase ?? 0) + .6);
  const w = 300 * s, h = 560 * s, legH = o.legs === false ? 0 : 40 * s;
  const bottom = y - legH + (o.legs === false ? 0 : gr.bob * .3 * s), top = bottom - h;
  const col = o.col || '#ece0c4';
  g.save(); g.translate(x, y); g.rotate(o.lean ?? gr.lean * .4); g.translate(-x, -y);
  if (o.legs !== false) for (const d of [-1, 1]) { hose(g, [x + d * 60 * s, bottom - 10 * s], [x + d * 70 * s, y - 8 * s], { w: 11 * s, bend: .05, seed: 1000 + d }); shoe(g, x + d * 72 * s, y - 8 * s, 20 * s, d, { seed: 1002 + d }); }
  const sh0 = { L: [x - w * .5, top + h * .5], R: [x + w * .5, top + h * .5] };
  const arms = [];
  for (const [k, dir] of [['L', -1], ['R', 1]]) if (o[k]) { const sp = o[k]; arms.push({ k, dir, s0: sh0[k], hx: sh0[k][0] + dir * sp.to[0] * s, hy: sh0[k][1] + sp.to[1] * s, pose: sp.pose || 'open', behind: sp.behind }); }
  const drawArm = a => { hose(g, a.s0, [a.hx, a.hy], { w: 10 * s, bend: a.dir * -.25, seed: 1010 + a.dir }); glove(g, a.hx, a.hy, Math.atan2(a.hy - a.s0[1], a.hx - a.s0[0]), 19 * s, a.pose, { flip: a.dir < 0, seed: 1012 + a.dir }); };
  arms.filter(a => a.behind).forEach(drawArm);
  // the case
  const P = rrect(x - w / 2, top, w, h, 48 * s);
  shape(g, P, { fill: col, shade: sh(col, .32), lit: lt(col, .4), form: 'block', w: 8 * s, seed: 1020, gloss: { x: .14, y: .07, w: .05, h: .035 } });
  // the face in the top edge
  const e = o.eyes || {}, bl = blinkAt(t, 71), expr = e.expr || 'open', ey = top + 42 * s;
  for (const d of [-1, 1]) {
    const ex = x + d * 44 * s;
    if ((expr === 'wink' && d > 0) || expr === 'happy') { stroke(g, [[ex - 14 * s, ey + 4 * s], [ex, ey - 8 * s], [ex + 14 * s, ey + 4 * s]], { w: 5 * s, seed: 1030 + d }); continue; }
    if (expr === 'shut') { stroke(g, [[ex - 14 * s, ey], [ex + 14 * s, ey + 2 * s]], { w: 5 * s, seed: 1030 + d }); continue; }
    eye(g, ex, ey, 7 * s, 12 * s, { white: 1.8, lx: e.lx ?? 0, ly: e.ly ?? 0, blink: bl, lw: 3 * s, seed: 1032 + d, col });
  }
  if (expr === 'worried') brows(g, x, ey - 22 * s, 44 * s, 20 * s, { mood: 1, lw: 4 * s, seed: 1034 });
  if (expr === 'wink') brows(g, x, ey - 22 * s, 44 * s, 20 * s, { cock: .4, lw: 4 * s, seed: 1036 });
  // the screen
  const sx = x - w / 2 + 22 * s, sy = top + 72 * s, sw = w - 44 * s, shh = h - 118 * s;
  shape(g, rrect(sx, sy, sw, shh, 16 * s), { fill: o.screenCol || '#fbf6e8', form: false, w: 5 * s, seed: 1040, amt: .3 });
  g.save(); g.beginPath(); g.rect(sx + 3 * s, sy + 3 * s, sw - 6 * s, shh - 6 * s); g.clip();
  if (o.screen) o.screen(g, sx, sy, sw, shh, s);
  if (o.wifi != null) wifiIcon(g, sx + sw - 38 * s, sy + 34 * s, 22 * s, o.wifi);
  // a soft sheen on the glass
  g.save(); g.globalAlpha *= .14; g.fillStyle = C(WHITE); g.beginPath(); g.moveTo(sx, sy + shh * .1); g.lineTo(sx + sw * .55, sy); g.lineTo(sx + sw * .75, sy); g.lineTo(sx, sy + shh * .32); g.closePath(); g.fill(); g.restore();
  g.restore();
  // the button at the foot
  shape(g, ellipse(x, bottom - 23 * s, 14 * s, 9 * s), { fill: sh(col, .12), w: 3.5 * s, seed: 1050, form: false });
  arms.filter(a => !a.behind).forEach(drawArm);
  g.restore();
  return { top, bottom, screen: [sx, sy, sw, shh], w, h };
}
// The Wi-Fi fan: three arcs over a dot, at (x, y) the dot, r the outer arc. on 0..1 lights it;
// off, it greys and a slash crosses it.
export function wifiIcon(g, x, y, r, on = 1, o = {}) {
  const lit = o.col || INK, dim = '#c9c0ae';
  for (let i = 0; i < 3; i++) {
    const rr = r * (.38 + i * .31);
    g.save(); g.strokeStyle = C(on > (i + .5) / 3 ? lit : dim); g.lineWidth = r * .16; g.lineCap = 'round';
    g.beginPath(); g.arc(x, y, rr, -Math.PI * .75, -Math.PI * .25); g.stroke(); g.restore();
  }
  dot(g, x, y, r * .12, on > .1 ? lit : dim);
  if (on < .5 && o.slash !== false) { g.save(); g.strokeStyle = C(RED); g.lineWidth = r * .16; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - r * .75, y - r * .95); g.lineTo(x + r * .75, y + r * .1); g.stroke(); g.restore(); }
}

// ---------------------------------------------------------------- the router: the net
// A little wooden box on the wall at (x, y) (its centre). on 0..1: antennas from drooping to
// upright, lamps lit, and waves rippling out. t drives the waves.
export function router(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), on = clamp(o.on ?? 1);
  const w = 180 * s, h = 92 * s;
  // waves first, behind: Wi-Fi arcs rippling up and out
  if (on > .05) waves(g, x, y - h * .5, s, t, on, o.waveR ?? 520);
  // antennas: upright when on; off, they wilt over at the middle like cut flowers
  for (const d of [-1, 1]) {
    const bx = x + d * w * .36, by = y - h * .5, droop = 1 - on;
    const L = 110 * s, a0 = -Math.PI / 2 + d * .16;
    const mid = [bx + Math.cos(a0) * L * .55, by + Math.sin(a0) * L * .55];
    const a1 = a0 + d * droop * 2.2;
    const tip = [mid[0] + Math.cos(a1) * L * .48, mid[1] + Math.sin(a1) * L * .48];
    stroke(g, [[bx, by], mid, [lerp(mid[0], tip[0], .5) + d * droop * 8 * s, lerp(mid[1], tip[1], .5) - droop * 6 * s], tip], { w: 8 * s, seed: 1100 + d, taper: false });
    shape(g, ellipse(tip[0], tip[1], 11 * s, 11 * s), { fill: on > .5 ? '#f6d36a' : GREY, w: 4 * s, seed: 1102 + d, gloss: { x: .3, y: .25, w: .14, h: .12, dot: false } });
  }
  // the box
  shape(g, rrect(x - w / 2, y - h / 2, w, h, 14 * s), { fill: WOOD, shade: WOOD_SH, form: 'block', w: 7 * s, seed: 1110, gloss: { x: .1, y: .15, w: .05, h: .08 } });
  shape(g, rrect(x - w / 2 + 14 * s, y - h / 2 + 14 * s, w - 28 * s, h - 28 * s, 8 * s), { fill: '#5b3a22', form: false, w: 4 * s, seed: 1111 });
  for (let i = 0; i < 3; i++) shape(g, ellipse(x - 44 * s + i * 44 * s, y, 11 * s, 11 * s), { fill: on > .5 ? (i === 1 ? '#f6d36a' : '!' + GREEN) : '#3a2a20', w: 3 * s, seed: 1112 + i, form: false });
  // a face, sleepy when off
  return { x, y, w, h };
}
export function waves(g, x, y, s, t, on = 1, R = 520) {
  for (let i = 0; i < 4; i++) {
    const ph = ((t * .9 + i / 4) % 1), r = (50 + ph * R) * s;
    g.save(); g.globalAlpha *= (1 - ph) * .75 * on; g.strokeStyle = C('#fff1c4'); g.lineWidth = 9 * s * (1 - ph * .5); g.lineCap = 'round';
    g.beginPath(); g.arc(x, y, r, -Math.PI * .8, -Math.PI * .2); g.stroke();
    g.strokeStyle = C('#8a6a32'); g.lineWidth = 2.5 * s; g.globalAlpha *= .6; g.beginPath(); g.arc(x, y, r + 6 * s, -Math.PI * .78, -Math.PI * .22); g.stroke();
    g.restore();
  }
}
// A wall socket at (x, y), and a cord from `from` to a plug at `to`; plugged 0..1 slides it home.
export function socket(g, x, y, s = 1) {
  shape(g, rrect(x - 40 * s, y - 52 * s, 80 * s, 104 * s, 12 * s), { fill: '#ece2cc', form: 'block', w: 5 * s, seed: 1120 });
  for (const d of [-1, 1]) shape(g, rrect(x + d * 15 * s - 5 * s, y - 16 * s, 10 * s, 30 * s, 4 * s), { fill: INK, w: 0, seed: 1121 + d, form: false });
}
export function plug(g, from, to, ang, s = 1, o = {}) {
  const mid = [(from[0] + to[0]) / 2 + (o.sag ?? 0) * .3, Math.max(from[1], to[1]) + (o.sag ?? 80) * s];
  stroke(g, spline([from, mid, to], false, 10), { w: 10 * s, seed: 1130, taper: false });
  g.save(); g.translate(to[0], to[1]); g.rotate(ang);
  for (const d of [-1, 1]) shape(g, rrect(36 * s, d * 15 * s - 4 * s, 26 * s, 8 * s, 3 * s), { fill: '#d9c58a', w: 3 * s, seed: 1131 + d, form: false });
  shape(g, rrect(-6 * s, -30 * s, 44 * s, 60 * s, 10 * s), { fill: '#3b3330', lit: '#6d625a', form: 'block', w: 5 * s, seed: 1133 });
  g.restore();
}

// ---------------------------------------------------------------- the comma
// A comma who is also a little actor: (x, y) is the middle of its round head, size h. pose: 'stand',
// 'tremble', 'swoon' (back of the hand to the brow, tipping), 'faint' (flat out), 'sniff' (sitting,
// crying), 'hope' (one eye open), 'up' (revived, arms up). Its arms are thin ink hoses.
export function comma(g, x, y, h, o = {}) {
  const t = o.t ?? now(), s = h / 100, pose = o.pose || 'stand';
  const rot = pose === 'swoon' ? clamp(o.p ?? 1) * -1.1 : pose === 'faint' ? -1.57 : pose === 'tremble' ? Math.sin(t * 50) * .06 : 0;
  g.save(); g.translate(x, y); g.rotate(rot);
  const P = spline([[-32 * s, -4 * s], [-26 * s, -30 * s], [0, -40 * s], [27 * s, -30 * s], [33 * s, -2 * s], [27 * s, 30 * s], [12 * s, 58 * s], [-12 * s, 84 * s], [-8 * s, 58 * s], [-2 * s, 34 * s], [-18 * s, 26 * s], [-30 * s, 14 * s]], true, 6);
  shape(g, P, { fill: '#2a211c', lit: '#6f625a', form: 'round', cx: .3, cy: .2, w: 4 * s, seed: 1200, gloss: { x: .28, y: .12, w: .1, h: .05, a: .6, dot: false } });
  // eyes
  const bl = blinkAt(t, 1201);
  const shut = pose === 'faint' || pose === 'swoon' && (o.p ?? 1) > .6;
  for (const d of [-1, 1]) {
    const ex = d * 11 * s, ey = -8 * s;
    if (shut || (pose === 'hope' && d < 0)) { stroke(g, [[ex - 7 * s, ey], [ex, ey + 4 * s], [ex + 7 * s, ey]], { w: 3 * s, seed: 1202 + d, color: WHITE }); continue; }
    shape(g, ellipse(ex, ey, 7 * s, 9 * s), { fill: WHITE, form: false, w: 0, seed: 1204 + d });
    dot(g, ex + (o.lx ?? 0) * 2.5 * s, ey + 1 * s, 4 * s);
  }
  if (pose === 'sniff' || pose === 'faint' || o.tear) for (let i = 0; i < 2; i++) { const ph = (t * 1.5 + i * .5) % 1; shape(g, ellipse(14 * s + ph * 8 * s, -2 * s + ph * 40 * s, 3.5 * s, 5 * s), { fill: '#9fd6ef', w: 1.5 * s, seed: 1206 + i, form: false }); }
  // arms
  const armW = 4 * s;
  if (pose === 'swoon' || pose === 'faint') {
    stroke(g, [[22 * s, -6 * s], [40 * s, -26 * s], [20 * s, -38 * s]], { w: armW, seed: 1210, color: '#2a211c' });
    glove(g, 18 * s, -38 * s, Math.PI, 7 * s, 'flat', { seed: 1211 });
    stroke(g, [[-24 * s, 6 * s], [-46 * s, 20 * s], [-60 * s, 14 * s]], { w: armW, seed: 1212, color: '#2a211c' });
    glove(g, -60 * s, 14 * s, Math.PI * .95, 7 * s, 'open', { seed: 1213 });
  } else if (pose === 'up') {
    for (const d of [-1, 1]) { stroke(g, [[d * 24 * s, 0], [d * 44 * s, -20 * s], [d * 50 * s, -44 * s]], { w: armW, seed: 1214 + d, color: '#2a211c' }); glove(g, d * 50 * s, -48 * s, -Math.PI / 2, 7 * s, 'wave', { seed: 1216 + d, flip: d < 0 }); }
  } else {
    for (const d of [-1, 1]) { stroke(g, [[d * 24 * s, 4 * s], [d * 40 * s, 20 * s], [d * 44 * s, 36 * s]], { w: armW, seed: 1214 + d, color: '#2a211c' }); glove(g, d * 44 * s, 40 * s, Math.PI / 2, 7 * s, pose === 'sniff' ? 'fist' : 'open', { seed: 1216 + d, flip: d < 0 }); }
  }
  g.restore();
}

// ---------------------------------------------------------------- the bug
// A cartoon beetle, the bug in the code: (x, y) its middle, s = 1 about 90 px long, facing dir.
// o: walk (phase), grin, look, kick (0..1 a back leg kicks).
export function bug(g, x, y, s = 1, o = {}) {
  const t = o.t ?? now(), dir = o.dir ?? 1;
  g.save(); g.translate(x, y); g.scale(dir, 1); g.rotate(o.rot ?? 0);
  const w = o.walk;
  for (let i = 0; i < 3; i++) for (const side of [-1, 1]) {
    const ph = w == null ? 0 : Math.sin((w + i / 3 + (side > 0 ? .5 : 0)) * TAU);
    const lx = (-18 + i * 18) * s, ly = 14 * s;
    const kick = (o.kick && i === 0 && side > 0) ? o.kick : 0;
    stroke(g, [[lx, ly], [lx + (side * 6 + ph * 8) * s - kick * 30 * s, ly + 14 * s - kick * 10 * s], [lx + (side * 10 + ph * 12) * s - kick * 40 * s, ly + 26 * s - kick * 20 * s]], { w: 4 * s, seed: 1300 + i + side });
  }
  // shell
  const P = ellipse(-6 * s, 0, 34 * s, 22 * s, 0, 36);
  shape(g, P, { fill: '#8c2f2a', lit: '#d0645a', shade: '#4a1412', form: 'round', w: 4.5 * s, seed: 1310, gloss: { x: .32, y: .22, w: .12, h: .1 } });
  stroke(g, [[-40 * s, 0], [28 * s, 0]], { w: 3 * s, seed: 1311 });
  for (const [a, b] of [[-20, -9], [-4, 10], [10, -8]]) dot(g, a * s, b * s, 4 * s);
  // head
  shape(g, ellipse(32 * s, -2 * s, 18 * s, 16 * s), { fill: '#2a2224', lit: '#6a5e60', form: 'round', w: 4 * s, seed: 1312 });
  for (const d of [-1, 1]) stroke(g, [[36 * s, -14 * s], [44 * s + d * 4 * s, -34 * s], [52 * s + d * 6 * s, -38 * s]], { w: 3 * s, seed: 1313 + d });
  eye(g, 34 * s, -6 * s, 4.5 * s, 7 * s, { white: 1.6, lx: (o.look ?? .6), blink: blinkAt(t, 1314), lw: 2 * s, seed: 1315 });
  // a cheeky grin
  stroke(g, [[30 * s, 6 * s], [38 * s, 10 * s], [46 * s, 4 * s]], { w: 2.5 * s, seed: 1316, color: WHITE });
  g.restore();
}

// ---------------------------------------------------------------- the magnifying glass
// Held at its handle (x, y), the lens along `ang`. Returns the lens centre and radius so a scene
// can draw what the lens shows inside it (o.inside(g, lx, ly, r)).
export function magnifier(g, x, y, ang, s = 1, o = {}) {
  const c = Math.cos(ang), sn = Math.sin(ang);
  const hl = 95 * s, r = (o.r ?? 70) * s;
  const lx = x + c * (hl + r), ly = y + sn * (hl + r);
  const hp = [[x - c * 18 * s, y - sn * 18 * s], [x + c * hl, y + sn * hl]];
  line(g, hp, { w: 26 * s, taper: false, seed: 131, color: INK });
  line(g, hp, { w: 15 * s, taper: false, seed: 132, color: o.handle || BROWN, boilAmt: .4 });
  shape(g, ellipse(lx, ly, r + 13 * s, r + 13 * s, 0, 48), { fill: GOLD, shade: GOLD_SH, form: 'round', w: 6 * s, seed: 133, amt: .5 });
  shape(g, ellipse(lx, ly, r, r, 0, 48), { fill: o.glass ?? '#e2f1ec', form: false, w: 5 * s, seed: 134, amt: .4 });
  if (o.inside) { g.save(); g.beginPath(); g.arc(lx, ly, r - 3 * s, 0, TAU); g.clip(); o.inside(g, lx, ly, r); g.restore(); }
  g.save(); g.strokeStyle = C(WHITE); g.lineWidth = 7 * s; g.lineCap = 'round'; g.globalAlpha *= .85;
  g.beginPath(); g.arc(lx, ly, r * .72, -2.6, -1.9); g.stroke(); g.restore();
  return { x: lx, y: ly, r };
}
