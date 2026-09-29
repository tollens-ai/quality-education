// The characters, drawn as a talented child draws: Clawd, who sings, and Bruce, the dachshund.
//
// Each is a handful of hand-placed shapes in their own local space (feet on y = 0, facing right or
// the camera): lumpy, a little lopsided, coloured by scribbling and outlined the way a hand outlines,
// not a program. A pose is a few numbers, so the same drawing can bob, lean, squash, blink, sing and
// walk; and it is alive without being asked: it blinks, its eyes wander, it breathes, and the
// parts that hang (ears, tail, tuft, arms) keep swinging after the body has stopped.
import { clamp, lerp, hash, TAU, beatPos } from './kit.js';
import { blob, line, dot, hatch, wash, outline, spline } from './pencil.js';
import { rrect, ellipse, move, scale, rotate, capsule, warp, scallop, limb } from './shapes.js';
import { idle, ring, downRing, beatRing, wordRing } from './life.js';
import { write } from './hand.js';
import { GRAPHITE, CLAWD, C } from './palette.js';

const ink = GRAPHITE;
const centre = pts => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
// A hand-placed outline, wandering a little between drawings.
const hand = (pts, seed, amp = 4.5, lam = 90) => { const [cx, cy] = centre(pts); return warp(pts, cx, cy, seed, amp, lam); };

// ---------------------------------------------------------------- Clawd
// The mascot's own block, as a child would draw him: a wide, lumpy loaf, two tall eyes set high and far
// apart, a stub of an arm on each side, four short legs, and a tuft that bounces after him.
//   eyes   'open' 'happy' 'wide' 'squint' 'sad' 'x' 'shut' 'half' (or [left, right]: a wink)      mouth  0..1 (how open)
//   look   [-1..1, -1..1]  where the eyes look      armL/armR  {up: -1..1 (down..up), out: 0..1} or {to: [x, y]}
//   squash 0..1, lean radians, bob px, flip -1 for facing left, blink 0..1 (added to his own), sweat, spark
//   brow   > 0 worried (inner ends up), < 0 cross         raise  0..1 (surprise)
export function clawd(g, o = {}) {
  const { x = 540, y = 1200, s = 1, t = 0, seed = 1, eyes = 'open', mouth = 0, look = [0, 0], armL = { up: .1 }, armR = { up: .1 },
    squash = 0, lean = 0, bob = 0, flip = 1, blink: bl0 = 0, legs = 0, prop = null, cheeks = false, brow = 0, raise = 0, sweat = false, tuft = false, life = 1, legPop = null } = o;
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
    // legPop: { i: 0..3, p: 0..1 } sends that leg spinning off, up and away.
    const pp = legPop && legPop.i === i ? legPop.p : 0;
    g.save();
    if (pp > 0) { g.translate(lx, -60); g.translate(pp * 120, -Math.sin(pp * Math.PI) * 260 + pp * pp * 300); g.rotate(pp * 7); g.translate(-lx, 60); }
    const sw = legs ? Math.sin((legs + (i % 2) * .5) * TAU) * 10 : 0;
    const lift = legs ? Math.max(0, Math.sin((legs + (i % 2) * .5) * TAU)) * 8 : 0;
    const top = [lx, -LL[i] - 40], foot = [lx + LT[i] * LL[i] * 4 + sw, -8 - lift];
    blob(g, capsule(top, foot, 20, 22, 5, sd + i), { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 6.6, seed: sd + i, t, hw: 5, sh: .4 });
    blob(g, ellipse(foot[0] + (i < 2 ? -6 : 6), foot[1] + 2, 30, 13, 8, LT[i], sd + 9 + i), { fill: CLAWD.fill, line: ink, lw: 5.6, seed: sd + 5 + i, t, hw: 4.6, tone: .5 });
    g.restore();
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
    [-150, -226], [-118, -246], [-60, -250], [0, -249], [70, -250], [122, -246], [152, -224], [158, -160], [156, -100], [154, -66],
    [138, -48], [70, -43], [0, -45], [-70, -43], [-136, -47], [-156, -68], [-160, -130], [-155, -194]], sd + 11, 4.2, 95);
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
    if (len > 92) {
      // A stretched arm (he is reaching for something): it bows a little as a soft arm does, narrows to a wrist and ends in a
      // mitten, so it reads as an arm and not as a stick.
      const s0 = [sh[0] - side * 10, sh[1]];
      const dx = hand_[0] - s0[0], dy = hand_[1] - s0[1], LL = Math.hypot(dx, dy) || 1;
      const bow = LL * .11 * (dx >= 0 ? 1 : -1);        // the normal (-dy, dx) points down when the arm reaches right, up when left
      blob(g, limb(s0, [hand_[0] - dx / LL * 14, hand_[1] - dy / LL * 14], 22, 15, bow, 10, sd + 30 + k), { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 6, seed: sd + 30 + k, t, gap: 6, hw: 4.6, sh: .3 });
      blob(g, ellipse(hand_[0], hand_[1], 27, 24, 10, Math.atan2(dy, dx), sd + 36 + k), { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 5.6, seed: sd + 36 + k, t, gap: 6, hw: 4.6, sh: .3 });
    } else blob(g, capsule([sh[0] - side * 10, sh[1]], hand_, 21, 24, 5, sd + 30 + k), { fill: CLAWD.fill, shade: CLAWD.shade, line: ink, lw: 6, seed: sd + 30 + k, t, gap: 6, hw: 4.6, sh: .3 });
    return hand_;
  };
  const hL = ar(-1, armL, 0), hR = ar(1, armR, 1);
  // Eyes: tall, dark, one a little bigger than the other, each with a glint.
  const ey = -178;
  const bl = clamp(Math.max(bl0, I.blink * life));
  const EY = [{ x: -84, w: 38, h: 88, r: -.05 }, { x: 82, w: 34, h: 80, r: .06 }];
  EY.forEach((E, i) => {
    const side = i ? 1 : -1;
    const kind = Array.isArray(eyes) ? eyes[i] : eyes;          // eyes: one kind for both, or [left, right] (a wink)
    const ex = E.x + lk[0] * 9, eyy = ey + lk[1] * 8 + (i ? 3 : 0);
    const line1 = (pts, w = 9.5) => line(g, pts, { w, col: ink, seed: sd + 40 + i, t, spline: true, passes: 1, wob: 1 });
    switch (kind) {
      case 'happy': line1([[ex - 27, eyy + 13], [ex - 13, eyy - 10], [ex + 1, eyy - 18], [ex + 15, eyy - 10], [ex + 28, eyy + 13]]); break;
      case 'squint': line1([[ex - 28, eyy - 1], [ex, eyy + 3], [ex + 28, eyy - 2]], 10); break;
      case 'shut': line1([[ex - 28, eyy + 2], [ex, eyy + 14], [ex + 28, eyy + 2]], 9); break;
      case 'x':
        line(g, [[ex - 22, eyy - 26], [ex + 22, eyy + 26]], { w: 9.5, col: ink, seed: sd + 40 + i, t, spline: false, passes: 1 });
        line(g, [[ex + 22, eyy - 26], [ex - 22, eyy + 26]], { w: 9.5, col: ink, seed: sd + 44 + i, t, spline: false, passes: 1 });
        break;
      default: {
        const wide = kind === 'wide', half = kind === 'half', sad = kind === 'sad';
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
    if (brow || raise || kind === 'sad') {
      const b = kind === 'sad' && !brow ? 1 : brow;
      const by = ey - 66 - raise * 16;
      const inner = [ex - side * -6, by - b * 12], outer = [ex + side * 34, by + b * 10];
      line(g, [outer, [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - 3], inner], { w: 7.5, col: ink, seed: sd + 60 + i, t, spline: true, passes: 1 });
    }
  });
  if (cheeks) [-1, 1].forEach((side, i) => hatch(g, ellipse(side * 112, ey + 62, 25, 16, 8, 0, sd + 71 + i), { col: C.pink, seed: sd + 70 + i, t, gap: 5, w: 4.2, alpha: .85, spill: 2.5 }));
  // The mouth: a crooked little smile, opening to a round-cornered O with a tongue when he sings.
  const my = -104;
  if (mouth > .22) {
    const mh = 8 + mouth * 50, mw = 42 + mouth * 30;
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
    coat = '#c9772f', shade = '#8f4a1c', muzzle = '#f0c48f', collar = C.blue, tag = C.yellow, length = 1, look = 0, tongue = false, brow = 0, legH = 66, bodyH = 1, headS = 1.12, snoutL = 1, earS = 1, life = 1, legPop = null, arch = 0, tuck = 0, chest = 0, legW = 1, jacket = null } = o;
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
  // legPop: { i: 0..3 (which leg), p: 0..1 } sends that leg spinning off, up and away.
  const leg = (L, li) => {
    const sw = walk ? Math.sin((walk + L.ph) * TAU) * 24 : 0, lift = walk ? Math.max(0, Math.sin((walk + L.ph) * TAU)) * 15 : 0;
    const top = [L.x, -96 * LH], foot = [L.x + L.dx * .3 + sw, -10 - lift];
    const fill = L.far ? shade : coat;
    const pp = legPop && legPop.i === li ? legPop.p : 0;
    g.save();
    if (pp > 0) { g.translate(top[0], top[1]); g.translate(pp * 110, -Math.sin(pp * Math.PI) * 220 + pp * pp * 260); g.rotate(pp * 7); g.translate(-top[0], -top[1]); }
    blob(g, capsule(top, foot, 23 * legW, 22 * legW, 5, sd + L.x), { fill, shade, line: ink_, lw: 6.6, seed: sd + 3 + Math.round(L.x), t, hw: 5, sh: .3 });
    blob(g, ellipse(foot[0] + 10, foot[1] + 5, 33 * (.5 + legW * .5), 15, 8, 0, sd + 7 + Math.round(L.x)), { fill, line: ink_, lw: 5.8, seed: sd + 9 + Math.round(L.x), t, hw: 4.6, tone: .4 });
    g.restore();
  };
  legs.forEach((L, i) => { if (L.far) leg(L, i); });
  legs.forEach((L, i) => { if (!L.far) leg(L, i); });
  // Tail: a whip that wags, kept swinging by a spring so it lags the beat.
  const ph = tail == null ? t * (1.6 + wag) : tail;
  const tw = (Math.sin(ph * TAU) * 15 + downRing(t, { f: 2.7, z: .1, amp: 6 })) * wag * life * 1.4;
  const tl = [[X(-232), -156 * BH], [X(-262), -194 * BH + tw * .3], [X(-274) + tw * .5, -236 * BH - tw * .2], [X(-262) + tw * 1.1, -270 * BH]];
  blob(g, capsule(tl[0], tl[2], 14, 8, 4, sd + 3), { fill: coat, shade, line: ink_, lw: 5.6, seed: sd + 3, t, gap: 5, hw: 4.6, tone: .5, sh: .2 });
  line(g, tl.slice(1), { w: 12, col: coat, seed: sd + 4, t, spline: true, passes: 1, taper: [.02, .6], tooth: .5 });
  line(g, tl.slice(1), { w: 5.4, col: ink_, seed: sd + 5, t, spline: true, passes: 1, taper: [.02, .6] });
  // Body: a long loaf, sagging in the middle, deepest at the chest.
  const b = BH;
  // arch: the back rises in the middle; tuck: the belly draws up behind the ribs; chest: the ribs are deep (a greyhound).
  const body = hand([
    [X(-238), -150 * b], [X(-204), -(190 + arch * .4) * b], [X(-122), -(200 + arch * .8) * b], [X(-32), -(190 + arch) * b], [X(58), -(202 + arch * .9) * b], [X(140), -(198 + arch * .5) * b], [X(198), -178 * b], [X(220), -132 * b],
    [X(202), -(82 - chest * .5) * b], [X(150), -(58 - chest * .8) * b], [X(60), -(52 - chest * .4) * b], [X(-40), -(58 + tuck * .4) * b], [X(-132), -(62 + tuck * .8) * b], [X(-208), -(70 + tuck) * b], [X(-246), -104 * b]], sd + 11, 4.4, 100);
  blob(g, body, { fill: coat, shade, line: ink_, lw: 7.2, seed: sd + 11, t, hw: 5.4, sh: .3 });
  // jacket: { col, text }: a racing bib with a number over the ribs, as a greyhound wears (so a slim grey dog reads as one).
  if (jacket) {
    const jw = 128, jh = Math.max(56, 96 * b), jx = X(-30), jy = -130 * b + (arch * .5);
    blob(g, rrect(jx, jy, jw, jh, 14, 3, sd + 96, .5), { fill: jacket.col, line: ink_, lw: 5.4, seed: sd + 96, t, gap: 5, hw: 4.8, tone: .9 });
    g.save(); g.translate(jx, jy); if (flip < 0) g.scale(-1, 1);          // (the number never mirrors when the dog faces left)
    write(g, jacket.text, 0, jh * .27, jh * .62, { col: '#fbf8ef', seed: sd + 97, t, align: 'center', w: .15 });
    g.restore();
  }
  // The head: a big round one, with a long snout out of its lower half.
  const hz = headS;
  const hc = [X(268), -222 * b - 12];
  const nod = wordRing(t, { amp: 3 }) * life;
  g.save(); g.translate(hc[0], hc[1]); g.rotate(nod * .006); g.translate(-hc[0], -hc[1]);
  // The snout first, so the head, drawn over it, covers where it joins.
  const sn = [hc[0] + 100 * snoutL * hz, hc[1] + 34 * hz];
  blob(g, rrect(sn[0], sn[1], 150 * snoutL * hz, 62 * hz, 28, 3, sd + 22), { fill: muzzle, shade: coat, line: ink_, lw: 6.4, seed: sd + 22, t, hw: 4.8, tone: .42, sh: .22 });
  blob(g, ellipse(hc[0], hc[1], 90 * hz, 82 * hz, 12, .05, sd + 21), { fill: coat, shade, line: ink_, lw: 7, seed: sd + 21, t, hw: 5.2, sh: .28 });
  // Nose (big, black), mouth, tongue.
  const nx = sn[0] + 62 * snoutL * hz, ny = sn[1] - 22 * hz;
  blob(g, ellipse(nx, ny, 25 * hz, 19 * hz, 8, .2, sd + 23), { fill: ink_, line: null, seed: sd + 23, t, gap: 3.2, hw: 4.6, tone: .95 });
  dot(g, nx - 7, ny - 7, 5, { col: '#fbf8ef', seed: sd + 33, t, alpha: .7 });
  const mx0 = sn[0] - 68 * snoutL * hz, my0 = sn[1] + 4 * hz;
  if (mouth > .2) {
    const mh = 10 + mouth * 44;
    blob(g, hand([[mx0 + 6, my0 - 2], [mx0 + 60, my0 + 2], [mx0 + 120, my0 - 4], [mx0 + 112, my0 + mh * .6], [mx0 + 62, my0 + mh], [mx0 + 14, my0 + mh * .7]], sd + 24, 1.6, 40), { fill: '#7a2e2a', line: ink_, lw: 5.4, seed: sd + 24, t, gap: 4, hw: 4.2, tone: .9 });
    if (tongue || mouth > .6) blob(g, ellipse(mx0 + 58, my0 + mh * .92, 26, 13 + mouth * 7, 7, .1, sd + 25), { fill: C.pink, line: ink_, lw: 4.8, seed: sd + 25, t, gap: 4, hw: 4, tone: .75 });
  } else {
    line(g, [[mx0 + 124, my0 - 8], [mx0 + 80, my0 + 12], [mx0 + 34, my0 + 14], [mx0 + 4, my0 - 4]], { w: 7, col: ink_, seed: sd + 24, t, spline: true, passes: 1 });
  }
  // The ear: long and soft, hanging from the back of the head and swinging on its own spring.
  const es = (ear * 16 + (walk ? Math.sin(walk * TAU + 1) * 8 : 0) + beatRing(t, { f: 2.2, z: .14, amp: 9 }) * life);
  const ea = [hc[0] - 46 * hz, hc[1] - 66 * hz];
  const E = earS;
  const earShape = hand([[ea[0] - 26 * E, ea[1] + 6], [ea[0] + 2 * E, ea[1] - 8], [ea[0] + 30 * E, ea[1] + 4], [ea[0] + (38 + es * .5) * E, ea[1] + 70 * E], [ea[0] + (24 + es) * E, ea[1] + 140 * E],
    [ea[0] + (-6 + es * 1.2) * E, ea[1] + 160 * E], [ea[0] + (-36 + es) * E, ea[1] + 112 * E], [ea[0] + (-40 + es * .5) * E, ea[1] + 48 * E]], sd + 29, 3, 60);
  blob(g, earShape, { fill: shade, shade: '#5d331a', line: ink_, lw: 6.6, seed: sd + 29, t, hw: 5, tone: .45, sh: .32 });
  // The eye: big and round, set well forward of the ear.
  const bl = I.blink * life;
  const ex = hc[0] + 58 * hz + look * 4 + I.look[0] * 3 * life, eyy = hc[1] - 10 * hz + I.look[1] * 2 * life;
  if (eyes === 'happy') line(g, [[ex - 22, eyy + 9], [ex, eyy - 13], [ex + 22, eyy + 9]], { w: 9, col: ink_, seed: sd + 26, t, spline: true, passes: 1 });
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

// ---------------------------------------------------------------- Blob
// The code, drawn as a dog: a huge shaggy sheepdog, front on: a mound of grey fur with tufts all round,
// a fringe over two eyes that peek through, a big nose, two paws. Or, as a small fluffy puppy that hasn't
// grown yet. He breathes, blinks, and his tail wags on its own.
//   puppy: true for the small round one     state 'sleep' 'awake' 'happy' 'alarmed'    mouth 0..1    look [-1..1, -1..1]
//   coat, shade, cream: colours
export function shaggy(g, o = {}) {
  const { x = 540, y = 1300, s = 1, t = 0, seed = 8, puppy = false, state = 'awake', mouth = 0, look = [0, 0], flip = 1, squash = 0, bob = 0, lean = 0,
    coat = puppy ? '#dcd9e4' : '#c3c1cd', shade = puppy ? '#aaa7b8' : '#8a8898', cream = '#f1ece0', tongue = false, life = 1 } = o;
  const I = idle(t, seed);
  const sd = seed * 53;
  const R = puppy ? 118 : 250;                 // the mound's radius
  const br = 1 + Math.sin(t * TAU * (state === 'sleep' ? .32 : .5) + seed) * (state === 'sleep' ? .026 : .016) * life;
  g.save();
  g.translate(x, y - bob);
  g.rotate(lean);
  g.scale(s * flip * (1 + squash * .1), s * (1 - squash * .13) * br);
  const cy = -R * .95;
  const wag = Math.sin(t * TAU * 1.5 + seed) * .35 * (state === 'sleep' ? .15 : 1) + downRing(t, { f: 2.4, z: .14, amp: .25 }) * life;
  // Ears (behind), hanging at the sides.
  [-1, 1].forEach((sd_, i) => {
    const ex = sd_ * R * .92, ey = cy - R * .2, sw = beatRing(t, { f: 2.1, z: .14, amp: 5 }) * life * sd_;
    blob(g, capsule([ex, ey], [ex + sd_ * R * .12 + sw, ey + R * .62], R * .17, R * .12, 5, sd + i), { fill: shade, line: ink, lw: 6, seed: sd + 3 + i, t, hw: 5.4, sh: .3 });
  });
  // The mound: a scalloped mass of fur.
  // The mound: a cloud of round lobes (spikes read as a circular saw at size).
  const N = puppy ? 11 : 17, M = N * 6, body = [];
  for (let k = 0; k < M; k++) {
    const th = k / M * TAU, lobe = th * N / TAU, u = lobe - Math.floor(lobe);
    const lr = 1 + (hash(sd, Math.floor(lobe), 1) - .5) * .09;
    const r = R * lr * (1 - .105 * (1 - Math.pow(Math.sin(Math.PI * u), .7)));
    body.push([Math.cos(th) * r * 1.08, cy + Math.sin(th) * r * .96]);
  }
  blob(g, body, { fill: coat, shade, line: ink, lw: puppy ? 6.4 : 7.2, seed: sd + 1, t, hw: 5.8, gap: 6.6, sh: .34 });
  // Fur: strokes flowing out from the face, and tufts standing off the edge.
  const nF = puppy ? 20 : 46;
  for (let i = 0; i < nF; i++) {
    const a = hash(sd, i, 1) * TAU, r0 = R * (.32 + hash(sd, i, 2) * .3), L = R * (.16 + hash(sd, i, 3) * .16);
    const c0 = [Math.cos(a) * r0, cy + Math.sin(a) * r0 * .92];
    const sway_ = Math.sin(t * 1.4 + i) * 2 * life;
    line(g, [c0, [c0[0] + Math.cos(a + .3) * L * .5 + sway_, c0[1] + Math.sin(a + .3) * L * .5], [c0[0] + Math.cos(a + .1) * L + sway_, c0[1] + Math.sin(a + .1) * L]], { w: puppy ? 4 : 5, col: '#5b5a66', seed: sd + 20 + i, t, passes: 1, alpha: .5, taper: [.1, .7], wob: 1 });
  }
  // The face: a pale patch, a fringe over the eyes, a big nose, a mouth.
  const fy = cy + R * .1;
  blob(g, ellipse(0, fy + R * .1, R * .42, R * .34, 10, 0, sd + 30), { fill: cream, line: null, seed: sd + 30, t, tone: .6, gap: 6, hw: 5, dens: .7 });
  const nose = [0, fy + R * .06];
  blob(g, ellipse(nose[0], nose[1], R * .13, R * .1, 8, 0, sd + 31), { fill: ink, line: null, seed: sd + 31, t, gap: 3.4, hw: 4.8, tone: .95 });
  dot(g, nose[0] - R * .035, nose[1] - R * .035, R * .03, { col: '#fbf8ef', seed: sd + 32, t, alpha: .8 });
  const my = nose[1] + R * .1;
  if (mouth > .15) {
    const mh = R * (.06 + mouth * .18);
    blob(g, [[-R * .16, my], [R * .16, my], [R * .12, my + mh], [0, my + mh * 1.1], [-R * .12, my + mh]], { fill: '#7a2e2a', line: ink, lw: 4.6, seed: sd + 33, t, tone: .9, gap: 4, hw: 4 });
    if (tongue || mouth > .5) blob(g, ellipse(0, my + mh * .9, R * .09, R * .05, 7, 0, sd + 34), { fill: C.pink, line: null, seed: sd + 34, t, tone: .8, gap: 4, hw: 4 });
  } else if (state === 'alarmed') line(g, [[-R * .12, my + R * .05], [0, my], [R * .12, my + R * .05]], { w: 6, col: ink, seed: sd + 33, t, passes: 1 });
  else line(g, [[-R * .16, my - R * .01], [-R * .05, my + R * .05], [R * .05, my + R * .05], [R * .16, my - R * .01]], { w: 6, col: ink, seed: sd + 33, t, passes: 1 });
  // The eyes peek out under the fringe.
  const ey = fy - R * .12, ex = R * .2;
  const shut = state === 'sleep' || I.blink * life > .5;
  const lk = [look[0] + I.look[0] * life, look[1] + I.look[1] * life];
  [-1, 1].forEach((sd_, i) => {
    const cx = sd_ * ex + lk[0] * 4, cyy = ey + lk[1] * 3;
    if (shut) line(g, [[cx - R * .07, cyy], [cx, cyy + R * .03], [cx + R * .07, cyy]], { w: 5.4, col: ink, seed: sd + 40 + i, t, passes: 1 });
    else if (state === 'alarmed') { blob(g, ellipse(cx, cyy, R * .08, R * .09, 8, 0, sd + 40 + i), { fill: '#fbf8ef', line: ink, lw: 4, seed: sd + 40 + i, t, tone: .95 }); dot(g, cx + lk[0] * 3, cyy + lk[1] * 3, R * .035, { col: ink, seed: sd + 42 + i, t }); }
    else { dot(g, cx, cyy, R * (puppy ? .075 : .05), { col: ink, seed: sd + 40 + i, t }); dot(g, cx - R * .015, cyy - R * .018, R * .018, { col: '#fbf8ef', seed: sd + 44 + i, t }); }
  });
  // The fringe: strokes falling from the top of the head over the eyes, each a different length and lean.
  const nFr = puppy ? 9 : 16;
  for (let i = 0; i < nFr; i++) {
    const u = (i + .5) / nFr, fx = (u - .5) * R * .95 + (hash(sd, i, 11) - .5) * R * .05;
    const drop = R * (.3 + Math.sin(u * Math.PI) * .12 + (hash(sd, i, 12) - .5) * .14) * (state === 'alarmed' ? .8 : 1);
    const lean_ = (u - .5) * R * .16 + (hash(sd, i, 13) - .5) * R * .06;
    line(g, [[fx * .9, fy - R * .55], [fx + lean_ * .4, fy - R * .3], [fx + lean_ + Math.sin(t * 1.6 + i) * 1.5 * life, fy - R * .55 + drop]], { w: puppy ? 5 : 6, col: ink, seed: sd + 60 + i, t, passes: 1, alpha: .7, taper: [.05, .6], wob: 1.2 });
  }
  // Paws at the foot of the mound.
  [-1, 1].forEach((sd_, i) => {
    blob(g, ellipse(sd_ * R * .38, -R * .08, R * .2, R * .1, 8, 0, sd + 70 + i), { fill: coat, shade, line: ink, lw: 6, seed: sd + 70 + i, t, hw: 5, sh: .3 });
    [-1, 0, 1].forEach(k => line(g, [[sd_ * R * .38 + k * R * .06, -R * .09], [sd_ * R * .38 + k * R * .06, -R * .03]], { w: 4, col: ink, seed: sd + 74 + i * 3 + k, t, passes: 1, spline: false }));
  });
  g.restore();
}
