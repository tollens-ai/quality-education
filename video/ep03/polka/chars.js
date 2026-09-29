// The characters, drawn as a talented child draws: Clawd, who sings, and Bruce, the dachshund.
//
// Each is a handful of hand-placed shapes in their own local space (feet on y = 0, facing right or
// the camera): lumpy, a little lopsided, coloured by scribbling and outlined the way a hand outlines,
// not a program. A pose is a few numbers, so the same drawing can bob, lean, squash, blink, sing and
// walk; and it is alive without being asked: it blinks, its eyes wander, it breathes, and the
// parts that hang (ears, tail, tuft, arms) keep swinging after the body has stopped.
import { clamp, lerp, hash, TAU, beatPos } from './kit.js';
import { blob, line, dot, hatch, wash, outline, spline } from './pencil.js';
import { rrect, ellipse, move, scale, rotate, capsule, warp } from './shapes.js';
import { idle, ring, downRing, beatRing, wordRing } from './life.js';
import { GRAPHITE, CLAWD, C } from './palette.js';

const ink = GRAPHITE;
const centre = pts => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
// A hand-placed outline, wandering a little between drawings.
const hand = (pts, seed, amp = 4.5, lam = 90) => { const [cx, cy] = centre(pts); return warp(pts, cx, cy, seed, amp, lam); };

// ---------------------------------------------------------------- Clawd
// The mascot's own block, as a child would draw him: a wide, lumpy loaf, two tall eyes set high and far
// apart, a stub of an arm on each side, four short legs, and a tuft that bounces after him.
//   eyes   'open' 'happy' 'wide' 'squint' 'sad' 'x' 'shut' 'half'      mouth  0..1 (how open)
//   look   [-1..1, -1..1]  where the eyes look      armL/armR  {up: -1..1 (down..up), out: 0..1} or {to: [x, y]}
//   squash 0..1, lean radians, bob px, flip -1 for facing left, blink 0..1 (added to his own), sweat, spark
//   brow   > 0 worried (inner ends up), < 0 cross         raise  0..1 (surprise)
export function clawd(g, o = {}) {
  const { x = 540, y = 1200, s = 1, t = 0, seed = 1, eyes = 'open', mouth = 0, look = [0, 0], armL = { up: .1 }, armR = { up: .1 },
    squash = 0, lean = 0, bob = 0, flip = 1, blink: bl0 = 0, legs = 0, prop = null, cheeks = false, brow = 0, raise = 0, sweat = false, tuft = false, life = 1 } = o;
  const I = idle(t, seed);
  g.save();
  g.translate(x, y - bob);
  g.rotate(lean);
  g.scale(s * flip * (1 + squash * .1), s * (1 - squash * .13) * (1 + I.breath * .006 * life));
  const sd = seed * 97;
  const lk = [look[0] + I.look[0] * life, look[1] + I.look[1] * life];
  // Legs: four stubs of slightly different lengths and lean, the outer pair splayed. `legs` walks them.
  const LX = [-114, -40, 44, 116], LL = [50, 44, 52, 46], LT = [-.06, .03, -.04, .07];
  LX.forEach((lx, i) => {
    const sw = legs ? Math.sin((legs + (i % 2) * .5) * TAU) * 10 : 0;
    const lift = legs ? Math.max(0, Math.sin((legs + (i % 2) * .5) * TAU)) * 8 : 0;
    const top = [lx, -LL[i] - 40], foot = [lx + LT[i] * LL[i] * 4 + sw, -8 - lift];
    blob(g, capsule(top, foot, 20, 22, 5, sd + i), { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 6.6, seed: sd + i, t, hw: 5, sh: .4 });
    blob(g, ellipse(foot[0] + (i < 2 ? -6 : 6), foot[1] + 2, 30, 13, 8, LT[i], sd + 9 + i), { fill: CLAWD.fill, line: ink, lw: 5.6, seed: sd + 5 + i, t, hw: 4.6, tone: .5 });
  });
  // The tuft: a cowlick of three strokes that swings with the beat and lags behind every lean.
  if (tuft) {
    const sw = downRing(t, { f: 2.1, z: .12, amp: 1 }) * 9 - lean * 120 + wordRing(t, { amp: 2 });
    [[-22, -250, -26, 34, 9], [4, -252, 4, 44, 10], [28, -248, 32, 30, 8]].forEach(([bx, by, dx, hgt, w], i) => {
      line(g, [[bx, by], [bx + dx * .5 + sw * .4, by - hgt * .6], [bx + dx * .9 + sw, by - hgt]], { w, col: CLAWD.shade, seed: sd + 90 + i, t, spline: true, passes: 1, taper: [.05, .8], wob: 1.4 });
    });
  }
  // The body: a loaf, lumpy, its top corners at different heights, bulging a little where it is heavy.
  const body = hand([
    [-148, -226], [-112, -246], [-56, -252], [8, -247], [80, -251], [130, -243], [154, -212], [160, -152], [153, -100], [158, -68],
    [140, -46], [70, -42], [-4, -47], [-78, -43], [-140, -48], [-158, -74], [-162, -134], [-152, -192]], sd + 11, 4.2, 95);
  blob(g, body, { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 7.6, seed: sd + 11, t, hw: 5.4, sh: .36, tone: .4 });
  // Arms: stubs from the sides at about two-thirds height, swinging.
  const ar = (side, a, k) => {
    const sh = [side * 142, -152];
    let ang, len = 50;
    if (a.to) {
      const dx = a.to[0] - sh[0], dy = a.to[1] - sh[1];
      ang = Math.atan2(dy, dx); len = Math.min(46 + (a.reach || 0), Math.hypot(dx, dy));
    } else {
      const up = a.up ?? .1, out = a.out ?? 0;
      const phi = up * 1.45 + wordRing(t, { amp: .05 }) + downRing(t, { f: 2.6, z: .2, amp: .06 }) * (side < 0 ? 1 : -1);
      ang = Math.atan2(-Math.sin(phi), side * Math.cos(phi));
      len = 46 + out * 18;
    }
    const hand_ = [sh[0] + Math.cos(ang) * len, sh[1] + Math.sin(ang) * len];
    blob(g, capsule([sh[0] - side * 10, sh[1]], hand_, 21, 24, 5, sd + 30 + k), { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 6, seed: sd + 30 + k, t, gap: 6, hw: 4.6, sh: .3 });
    return hand_;
  };
  const hL = ar(-1, armL, 0), hR = ar(1, armR, 1);
  // Eyes: tall, dark, one a little bigger than the other, each with a glint.
  const ey = -178;
  const bl = clamp(Math.max(bl0, I.blink * life));
  const EY = [{ x: -84, w: 38, h: 88, r: -.05 }, { x: 82, w: 34, h: 80, r: .06 }];
  EY.forEach((E, i) => {
    const side = i ? 1 : -1;
    const ex = E.x + lk[0] * 9, eyy = ey + lk[1] * 8 + (i ? 3 : 0);
    const line1 = (pts, w = 9.5) => line(g, pts, { w, col: ink, seed: sd + 40 + i, t, spline: true, passes: 1, wob: 1 });
    switch (eyes) {
      case 'happy': line1([[ex - 28, eyy + 16], [ex - 12, eyy - 12], [ex + 4, eyy - 22], [ex + 30, eyy + 16]]); break;
      case 'squint': line1([[ex - 28, eyy - 1], [ex, eyy + 3], [ex + 28, eyy - 2]], 10); break;
      case 'shut': line1([[ex - 28, eyy + 2], [ex, eyy + 14], [ex + 28, eyy + 2]], 9); break;
      case 'x':
        line(g, [[ex - 22, eyy - 26], [ex + 22, eyy + 26]], { w: 9.5, col: ink, seed: sd + 40 + i, t, spline: false, passes: 1 });
        line(g, [[ex + 22, eyy - 26], [ex - 22, eyy + 26]], { w: 9.5, col: ink, seed: sd + 44 + i, t, spline: false, passes: 1 });
        break;
      default: {
        const wide = eyes === 'wide', half = eyes === 'half', sad = eyes === 'sad';
        const h0 = (wide ? E.h * 1.14 : sad ? E.h * .82 : E.h) * (half ? .55 : 1), w0 = E.w * (wide ? 1.1 : 1);
        const h = Math.max(7, h0 * (1 - bl * .93));
        const cy = eyy + (half ? h0 * .3 : 0) + (E.h - h) * .0;
        blob(g, ellipse(ex, cy + (h0 - h) / 2 * (half ? 0 : 1), w0 / 2, h / 2, 10, E.r, sd + 47 + i), { fill: ink, line: null, seed: sd + 40 + i, t, gap: 3.6, hw: 4.6, tone: .95, dens: 1 });
        if (bl < .3) {
          dot(g, ex + lk[0] * 3 - 7, cy - h * .2 + lk[1] * 3, wide ? 8 : 6.5, { col: '#fbf8ef', seed: sd + 50 + i, t, alpha: .96 });
          dot(g, ex + lk[0] * 3 + 6, cy + h * .22 + lk[1] * 3, 3, { col: '#fbf8ef', seed: sd + 52 + i, t, alpha: .8 });
        }
        if (half) line(g, [[ex - w0 / 2 - 6, cy - h * .5], [ex + w0 / 2 + 6, cy - h * .5 + (i ? -3 : 3)]], { w: 6.5, col: ink, seed: sd + 54 + i, t, spline: false, passes: 1 });
      }
    }
    // Brows: worried slopes the inner ends up, cross slopes them down, surprise lifts them both.
    if (brow || raise || eyes === 'sad') {
      const b = eyes === 'sad' && !brow ? 1 : brow;
      const by = ey - 66 - raise * 16;
      const inner = [ex - side * -6, by - b * 12], outer = [ex + side * 34, by + b * 10];
      line(g, [outer, [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - 3], inner], { w: 7.5, col: ink, seed: sd + 60 + i, t, spline: true, passes: 1 });
    }
  });
  if (cheeks) [-1, 1].forEach((side, i) => hatch(g, ellipse(side * 112, ey + 62, 25, 16, 8, 0, sd + 71 + i), { col: C.pink, seed: sd + 70 + i, t, gap: 5, w: 4.2, alpha: .85, spill: 2.5 }));
  // The mouth: a crooked little smile, opening to a round-cornered O with a tongue when he sings.
  const my = -104;
  if (mouth > .08) {
    const mh = 10 + mouth * 50, mw = 44 + mouth * 30;
    blob(g, hand([[-mw / 2, my], [-mw * .3, my - 6], [mw * .3, my - 5], [mw / 2, my + 1], [mw * .42, my + mh * .8], [mw * .1, my + mh * 1.04], [-mw * .3, my + mh * .9], [-mw * .48, my + mh * .5]], sd + 80, 1.8, 40), { fill: '#7a2e2a', line: ink, lw: 5, seed: sd + 80, t, gap: 4, hw: 4, tone: .9 });
    if (mouth > .4) blob(g, ellipse(2, my + mh * .82, mw * .3, mh * .17, 7, 0, sd + 81), { fill: C.pink, line: null, seed: sd + 81, t, gap: 4, hw: 3.5, tone: .85 });
  } else {
    line(g, [[-26, my - 3], [-10, my + 6], [10, my + 8], [28, my - 6]], { w: 7, col: ink, seed: sd + 82, t, spline: true, passes: 1, wob: 1.2 });
  }
  if (sweat) blob(g, [[128, ey - 76], [140, ey - 46], [126, ey - 34], [114, ey - 50]], { fill: C.sky, line: ink, lw: 4.4, seed: sd + 84, t, hw: 4, tone: .8 });
  if (prop) prop(g, { sd, t, hL, hR, ey });
  g.restore();
}

// ---------------------------------------------------------------- Bruce
// A dachshund facing right: a long loaf of a body sagging in the middle, four short legs, a big round
// head with a long nose, one long soft ear, a tail that never stops.
//   walk: a phase 0..1 swinging the legs      tail: wag phase (else it wags by itself)      wag: 0..1
//   ear: flop amount                          mouth: 0..1 open (0 closed smile)             eyes: 'open' 'happy' 'sad' 'wide' 'x'
//   coat/shade/muzzle: colours, so other dogs can borrow the drawing.
export function dachshund(g, o = {}) {
  const { x = 540, y = 1200, s = 1, t = 0, seed = 2, walk = 0, tail = null, wag = .6, ear = 0, mouth = 0, eyes = 'open', flip = 1, lean = 0, bob = 0, squash = 0,
    coat = '#c9772f', shade = '#8f4a1c', muzzle = '#f0c48f', collar = C.blue, tag = C.yellow, length = 1, look = 0, tongue = false, brow = 0, legH = 66, bodyH = 1, headS = 1.12, snoutL = 1, earS = 1, life = 1 } = o;
  const I = idle(t, seed);
  g.save();
  g.translate(x, y - bob);
  g.rotate(lean);
  g.scale(s * flip * (1 + squash * .1), s * (1 - squash * .13));
  const sd = seed * 131;
  const K = length, LH = legH / 66, BH = bodyH;
  const X = v => v * K;                 // stretch along the body only
  const ink_ = ink;
  const legs = [
    { x: X(-176), ph: .5, far: true, dx: -10 }, { x: X(126), ph: 0, far: true, dx: 8 },
    { x: X(-206), ph: 0, far: false, dx: -14 }, { x: X(158), ph: .5, far: false, dx: 6 }];
  const leg = (L) => {
    const sw = walk ? Math.sin((walk + L.ph) * TAU) * 24 : 0, lift = walk ? Math.max(0, Math.sin((walk + L.ph) * TAU)) * 15 : 0;
    const top = [L.x, -96 * LH], foot = [L.x + L.dx * .3 + sw, -10 - lift];
    const fill = L.far ? shade : coat;
    blob(g, capsule(top, foot, 23, 22, 5, sd + L.x), { fill, shade, line: ink_, lw: 6.6, seed: sd + 3 + Math.round(L.x), t, hw: 5, sh: .3 });
    blob(g, ellipse(foot[0] + 10, foot[1] + 5, 33, 15, 8, 0, sd + 7 + Math.round(L.x)), { fill, line: ink_, lw: 5.8, seed: sd + 9 + Math.round(L.x), t, hw: 4.6, tone: .4 });
  };
  legs.filter(l => l.far).forEach(leg);
  legs.filter(l => !l.far).forEach(leg);
  // Tail: a whip that wags, kept swinging by a spring so it lags the beat.
  const ph = tail == null ? t * (1.6 + wag) : tail;
  const tw = (Math.sin(ph * TAU) * 15 + downRing(t, { f: 2.7, z: .1, amp: 6 })) * wag * life * 1.4;
  const tl = [[X(-232), -156 * BH], [X(-262), -194 * BH + tw * .3], [X(-274) + tw * .5, -236 * BH - tw * .2], [X(-262) + tw * 1.1, -270 * BH]];
  blob(g, capsule(tl[0], tl[2], 14, 8, 4, sd + 3), { fill: coat, shade, line: ink_, lw: 5.6, seed: sd + 3, t, gap: 5, hw: 4.6, tone: .5, sh: .2 });
  line(g, tl.slice(1), { w: 12, col: coat, seed: sd + 4, t, spline: true, passes: 1, taper: [.02, .6], tooth: .5 });
  line(g, tl.slice(1), { w: 5.4, col: ink_, seed: sd + 5, t, spline: true, passes: 1, taper: [.02, .6] });
  // Body: a long loaf, sagging in the middle, deepest at the chest.
  const b = BH;
  const body = hand([
    [X(-238), -150 * b], [X(-204), -190 * b], [X(-122), -200 * b], [X(-32), -190 * b], [X(58), -202 * b], [X(140), -198 * b], [X(198), -178 * b], [X(220), -132 * b],
    [X(202), -82 * b], [X(150), -58 * b], [X(60), -52 * b], [X(-40), -58 * b], [X(-132), -62 * b], [X(-208), -70 * b], [X(-246), -104 * b]], sd + 11, 4.4, 100);
  blob(g, body, { fill: coat, shade, line: ink_, lw: 7.2, seed: sd + 11, t, hw: 5.4, sh: .3 });
  // The head: a big round one, with a long snout out of its lower half.
  const hz = headS;
  const hc = [X(268), -222 * b - 12];
  const nod = wordRing(t, { amp: 3 }) * life;
  g.save(); g.translate(hc[0], hc[1]); g.rotate(lean * 0 + nod * .006); g.translate(-hc[0], -hc[1]);
  blob(g, ellipse(hc[0], hc[1], 86 * hz, 80 * hz, 12, .1, sd + 21), { fill: coat, shade, line: ink_, lw: 7, seed: sd + 21, t, hw: 5.2, sh: .28 });
  const sn = [hc[0] + 86 * snoutL * hz, hc[1] + 26 * hz];
  blob(g, rrect(sn[0], sn[1], 150 * snoutL * hz, 68 * hz, 30, 3, sd + 22), { fill: muzzle, shade: coat, line: ink_, lw: 6.4, seed: sd + 22, t, hw: 4.8, tone: .42, sh: .22 });
  // Nose (big, black), mouth, tongue.
  const nx = sn[0] + 68 * snoutL * hz, ny = sn[1] - 22 * hz;
  blob(g, ellipse(nx, ny, 26 * hz, 20 * hz, 8, .2, sd + 23), { fill: ink_, line: null, seed: sd + 23, t, gap: 3.2, hw: 4.6, tone: .95 });
  dot(g, nx - 7, ny - 7, 5, { col: '#fbf8ef', seed: sd + 33, t, alpha: .7 });
  const mx0 = sn[0] - 60 * snoutL * hz, my0 = sn[1] + 10 * hz;
  if (mouth > .08) {
    const mh = 12 + mouth * 44;
    blob(g, hand([[mx0 + 4, my0 - 2], [mx0 + 58, my0 + 2], [mx0 + 112, my0 - 4], [mx0 + 104, my0 + mh * .6], [mx0 + 60, my0 + mh], [mx0 + 12, my0 + mh * .7]], sd + 24, 1.6, 40), { fill: '#7a2e2a', line: ink_, lw: 5.4, seed: sd + 24, t, gap: 4, hw: 4.2, tone: .9 });
    if (tongue || mouth > .5) blob(g, ellipse(mx0 + 56, my0 + mh * .9, 27, 15 + mouth * 8, 7, .1, sd + 25), { fill: C.pink, line: ink_, lw: 4.8, seed: sd + 25, t, gap: 4, hw: 4, tone: .75 });
  } else {
    line(g, [[mx0 + 116, my0 - 6], [mx0 + 70, my0 + 12], [mx0 + 30, my0 + 14], [mx0 + 2, my0 - 3]], { w: 7, col: ink_, seed: sd + 24, t, spline: true, passes: 1 });
  }
  // The ear: long and soft, hanging from the back of the head and swinging on its own spring.
  const es = (ear * 16 + (walk ? Math.sin(walk * TAU + 1) * 8 : 0) + beatRing(t, { f: 2.2, z: .14, amp: 9 }) * life) * 1;
  const ea = [hc[0] - 44 * hz, hc[1] - 70 * hz];
  const E = earS;
  const earShape = hand([[ea[0] - 30 * E, ea[1] + 10], [ea[0] + 4 * E, ea[1] - 6], [ea[0] + 36 * E, ea[1] + 8], [ea[0] + (46 + es * .5) * E, ea[1] + 76 * E], [ea[0] + (30 + es) * E, ea[1] + 150 * E],
    [ea[0] + (-6 + es * 1.2) * E, ea[1] + 172 * E], [ea[0] + (-42 + es) * E, ea[1] + 118 * E], [ea[0] + (-46 + es * .5) * E, ea[1] + 52 * E]], sd + 29, 3, 60);
  blob(g, earShape, { fill: shade, shade: '#5d331a', line: ink_, lw: 6.6, seed: sd + 29, t, hw: 5, tone: .45, sh: .32 });
  // The eye: big and round, set well forward of the ear.
  const bl = I.blink * life;
  const ex = hc[0] + 46 * hz + look * 4 + I.look[0] * 3 * life, eyy = hc[1] - 12 * hz + I.look[1] * 2 * life;
  if (eyes === 'happy') line(g, [[ex - 22, eyy + 10], [ex - 6, eyy - 12], [ex + 22, eyy + 8]], { w: 9, col: ink_, seed: sd + 26, t, spline: true, passes: 1 });
  else if (eyes === 'x') { line(g, [[ex - 16, eyy - 16], [ex + 16, eyy + 16]], { w: 8.5, col: ink_, seed: sd + 26, t, spline: false, passes: 1 }); line(g, [[ex + 16, eyy - 16], [ex - 16, eyy + 16]], { w: 8.5, col: ink_, seed: sd + 27, t, spline: false, passes: 1 }); }
  else if (bl > .5) line(g, [[ex - 20, eyy + 4], [ex, eyy + 10], [ex + 20, eyy + 3]], { w: 8, col: ink_, seed: sd + 26, t, spline: true, passes: 1 });
  else if (eyes === 'wide') {
    const r = 27;
    blob(g, ellipse(ex, eyy, r, r * 1.06, 8, 0, sd + 26), { fill: '#fbf8ef', line: ink_, lw: 5.6, seed: sd + 26, t, gap: 6, hw: 4.6, tone: .95 });
    dot(g, ex + 5 + look * 4, eyy + 2, r * .56, { col: ink_, seed: sd + 27, t });
    dot(g, ex + 1 + look * 4, eyy - 5, r * .2, { col: '#fbf8ef', seed: sd + 28, t });
  } else {
    const r = 21;
    dot(g, ex + look * 3, eyy, r, { col: ink_, seed: sd + 27, t });
    dot(g, ex - 6 + look * 3, eyy - 8, r * .32, { col: '#fbf8ef', seed: sd + 28, t });
  }
  if (eyes === 'sad' || brow) line(g, [[ex - 32, eyy - 30 - brow * 4], [ex, eyy - 42 - brow * 2], [ex + 22, eyy - 32 + brow * 8]], { w: 7.5, col: ink_, seed: sd + 28, t, spline: true, passes: 1 });
  g.restore();
  // Collar and a bone-shaped tag.
  const cx = hc[0] - 34 * hz, cy = hc[1] + 76 * hz;
  const cl = [[cx - 34, cy - 18], [cx + 4, cy + 6], [cx + 50, cy - 10]];
  line(g, cl, { w: 24, col: collar, seed: sd + 30, t, spline: true, passes: 1, taper: [.02, .02], tooth: .45 });
  line(g, cl, { w: 5.4, col: ink_, seed: sd + 31, t, spline: true, passes: 1, taper: [.02, .02], alpha: .7 });
  const tg = [cx + 12, cy + 40 + downRing(t, { f: 2.4, z: .16, amp: 4 }) * life];
  blob(g, [[tg[0] - 20, tg[1] - 8], [tg[0] - 12, tg[1] - 16], [tg[0] - 6, tg[1] - 6], [tg[0] + 6, tg[1] - 6], [tg[0] + 12, tg[1] - 16], [tg[0] + 20, tg[1] - 8], [tg[0] + 20, tg[1] + 8], [tg[0] + 12, tg[1] + 16], [tg[0] + 6, tg[1] + 6], [tg[0] - 6, tg[1] + 6], [tg[0] - 12, tg[1] + 16], [tg[0] - 20, tg[1] + 8]], { fill: tag, line: ink_, lw: 4.6, seed: sd + 32, t, hw: 4.4, tone: .6 });
  g.restore();
}
