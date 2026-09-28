// The band: four Clawds as a visual-kei rock band. Clawd is drawn from the Claude Code mascot's
// own proportions (a 6 x 4 body, two tall square eyes, nub arms at the waist, four legs), with
// the mascot's sharp pixel corners, then styled the way a 90s J-rock band would be: teased hair,
// eyeliner wings, and four platform boots each.
//
//   Vo. CLAWD  black hair swept over one eye, a red streak, a tall black collar
//   Gt. REGEX  crimson spikes, a sticking plaster, the virtuoso
//   Ba. NULL   a bone-white curtain of hair, black lips, a lace jabot, says nothing
//   Dr. CRON   a black lion's mane with red tips; keeps time
import { C, TAU, clamp, lerp, noise, hash, twos, mix } from './kit.js';
import { P, ink, gpen, outline } from './pen.js';

export const BAND = {
  clawd: { name: 'CLAWD', role: 'Vo.', hair: C.ink, hairShade: C.ink3, streak: C.red },
  regex: { name: 'REGEX', role: 'Gt.', hair: C.red, hairShade: C.red2 },
  null: { name: 'NULL', role: 'Ba.', hair: C.bone, hairShade: C.bone3 },
  cron: { name: 'CRON', role: 'Dr.', hair: C.ink, hairShade: C.ink3, tips: C.red },
};

// o: { who, s: body width, t, light: {x, y} unit vector toward the key light, rim: colour,
//      eyes: 'open'|'narrow'|'shut'|'wide'|'sad'|'fierce'|'dead', look: [-1..1, -1..1],
//      mouth: 0..1 (open), tears: 0..1, tilt (radians about the feet), squash (-1..1),
//      lift (px, a jump), whip (-1..1 hair swing), armL/armR: {a, len} or null (nubs),
//      holdL/holdR: fn(g, u) drawn at the arm tip, back: true for a back view,
//      silhouette: 0..1 toward a flat dark shape, flash: 0..1 toward a strobe-lit look }
export function clawd(g, x, y, o = {}) {
  const who = o.who || 'clawd', B = BAND[who];
  const u = (o.s || 300) / 6, t = o.t ?? 0;
  const sq = o.squash || 0, sx = 1 + sq * .18, sy = 1 - sq * .22;
  const hb = .72 * u, leg = 1.05 * u;
  const lineW = Math.max(2.2, u * .075);
  const sil = o.silhouette || 0, flash = o.flash || 0;
  const L = o.light || { x: .6, y: -.8 };
  const shadeD = { dx: L.x * u * .55, dy: L.y * u * .55 };
  const rimCol = o.rim || null;
  const body = sil ? mix(C.clawd, C.ink2, sil) : flash ? mix(C.clawd, C.clawd3, flash * .6) : C.clawd;
  const bodyShade = sil ? mix(C.clawd2, C.ink, sil) : C.clawd2;
  const seed = { clawd: 11, regex: 23, null: 37, cron: 51 }[who];

  g.save();
  g.translate(x, y - (o.lift || 0));
  g.rotate(o.tilt || 0);

  // Boots: four platform boots with buckles; they step with the beat.
  const legXs = [-2.25, -1.25, 1.25, 2.25];
  legXs.forEach((lx, i) => {
    const step = o.step ? Math.max(0, Math.sin((o.step + (i % 2) * .5) * TAU)) * u * .25 : 0;
    const bx = lx * u * sx;
    const sole = P().poly([[bx - .42 * u, -hb - step], [bx + .42 * u, -hb - step], [bx + .47 * u, -step], [bx - .47 * u, -step]]);
    const shaft = P().poly([[bx - .3 * u, -hb - leg - step + 2], [bx + .3 * u, -hb - leg - step + 2], [bx + .34 * u, -hb - step + 1], [bx - .34 * u, -hb - step + 1]]);
    ink(g, shaft, { fill: sil > .5 ? C.ink : C.ink2, line: lineW * .8, seed: seed + i, t, rim: rimCol ? { dx: .12 * u, dy: 0, col: rimCol } : null });
    ink(g, sole, { fill: C.ink, line: lineW * .8, seed: seed + i + 9, t });
    if (!sil) {
      // Buckle, and the sole's lit edge.
      g.fillStyle = C.steel; g.fillRect(bx - .24 * u, -hb - leg * .62 - step, .48 * u, .13 * u);
      g.fillRect(bx - .24 * u, -hb - leg * .3 - step, .48 * u, .13 * u);
      g.fillStyle = C.ink3; g.fillRect(bx - .42 * u, -hb * .5 - step, .84 * u, .08 * u);
    }
  });

  const bw = 6 * u * sx, bh = 4 * u * sy;
  const by = -hb - leg - bh, bx = -bw / 2;
  const top = by, cx = 0;
  const whip = o.whip || 0;

  // Hair behind the body (in a back view it's in front, and drawn after the body).
  if (!o.noHair && !o.back) hair(g, who, cx, top, u, bw, bh, { t, whip, back: o.back, lineW, seed, sil, rimCol, part: 'back' });
  // CLAWD's collar rises behind the shoulders.
  if (who === 'clawd' && !o.noCostume) {
    const col = P().poly([[bx - .3 * u, top + 1.6 * u], [bx - .9 * u, top - 1.9 * u], [bx + 1.1 * u, top + .4 * u],
      [bx + bw - 1.1 * u, top + .4 * u], [bx + bw + .9 * u, top - 1.9 * u], [bx + bw + .3 * u, top + 1.6 * u]]);
    ink(g, col, { fill: C.ink2, line: lineW, seed: seed + 3, t, rim: rimCol ? { dx: -.2 * u, dy: .1 * u, col: rimCol } : null,
      shade: { dx: 0, dy: .4 * u, col: C.ink } });
  }

  // Arms, behind or in front: an arm is a nub (the mascot's) that can stretch to reach.
  const arm = (side, spec, hold) => {
    const sh = [side * bw / 2, top + 2.5 * u * sy];
    const a = spec?.a ?? 0, len = (spec?.len ?? 1) * u;
    g.save();
    g.translate(sh[0] - side * .15 * u, sh[1]);
    g.rotate(side > 0 ? a : Math.PI - a);
    const th = u * .92, tip = u * .78;
    const pth = P().poly([[0, -th / 2], [len + .15 * u, -tip / 2], [len + .15 * u, tip / 2], [0, th / 2]]);
    ink(g, pth, { fill: body, line: lineW, seed: seed + side * 5, t, shade: sil ? null : { dx: 0, dy: -u * .28, col: bodyShade },
      rim: rimCol ? { dx: 0, dy: u * .2, col: rimCol } : null });
    if (hold) { g.translate(len + .1 * u, 0); g.rotate(-(side > 0 ? a : Math.PI - a)); hold(g, u); }
    g.restore();
  };
  if (o.armsBehind && !o.noArms) { arm(-1, o.armL, o.holdL); arm(1, o.armR, o.holdR); }

  // The body.
  const bodyP = P().rect(bx, top, bw, bh);
  ink(g, bodyP, {
    fill: body, line: lineW * 1.25, seed, t, corner: .6,
    shade: sil > .6 ? null : { dx: shadeD.dx, dy: shadeD.dy, col: bodyShade },
    rim: rimCol ? { dx: -Math.sign(L.x || 1) * -u * .16, dy: u * .1, col: rimCol } : null,
  });
  if (!sil && !o.back) {
    // One highlight: a hard light block on the lit top edge, like a cel painter's.
    g.fillStyle = mix(C.clawd3, C.bone, flash * .7);
    const hx = L.x > 0 ? bx + bw - 1.6 * u : bx + .45 * u;
    g.fillRect(hx, top + .28 * u, 1.15 * u, .22 * u);
    g.fillRect(hx + (L.x > 0 ? .85 * u : 0), top + .28 * u, .3 * u, .55 * u);
  }

  // Costume on the front of the body.
  if (!o.back && !o.noCostume && !o.dress) costume(g, who, bx, top, bw, bh, u, { t, lineW, seed, sil });
  if (o.dress === 'gran') {
    // Gran's red cardigan over the lower body, a white blouse collar, buttons.
    const cg = P().poly([[bx - .08 * u, top + 2.1 * u], [bx + bw + .08 * u, top + 2.1 * u], [bx + bw + .1 * u, top + bh + .05 * u], [bx - .1 * u, top + bh + .05 * u]]);
    ink(g, cg, { fill: C.red2, line: lineW, seed: seed + 90, t, shade: { dx: .3 * u, dy: -.3 * u, col: C.red3 } });
    ink(g, P().poly([[cx - .9 * u, top + 2.1 * u], [cx, top + 2.8 * u], [cx + .9 * u, top + 2.1 * u], [cx + .5 * u, top + 3.5 * u], [cx - .5 * u, top + 3.5 * u]]), { fill: C.bone, line: lineW * .8, seed: seed + 91, t });
    for (let i = 0; i < 3; i++) { g.fillStyle = C.bone2; g.beginPath(); g.arc(cx + .75 * u, top + (2.6 + i * .45) * u, .1 * u, 0, TAU); g.fill(); }
  }

  // The face.
  if (!o.back) face(g, who, bx, top, bw, bh, u, o, { t, lineW, seed, sil });

  if (o.dress === 'gran' && !o.back) {
    // Round spectacles over the square eyes.
    g.strokeStyle = C.ink; g.lineWidth = lineW * 1.1;
    for (const sd of [-1, 1]) { g.beginPath(); g.arc(cx + sd * 1.75 * u, top + 1.5 * u, .62 * u, 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(cx - 1.13 * u, top + 1.4 * u); g.lineTo(cx + 1.13 * u, top + 1.4 * u); g.stroke();
  }
  // Hair in front: fringes and forelocks; from behind, the back of the head.
  if (!o.noHair) hair(g, who, cx, top, u, bw, bh, { t, whip, back: o.back, lineW, seed, sil, rimCol, part: o.back ? 'back' : 'front' });

  // Whatever is held against the body (a guitar) goes between the body and the arms.
  if (o.between) o.between(g, { u, top, bw, bh, shL: [-bw / 2, top + 2.5 * u * sy], shR: [bw / 2, top + 2.5 * u * sy] });
  if (!o.armsBehind && !o.noArms) { arm(-1, o.armL, o.holdL); arm(1, o.armR, o.holdR); }
  g.restore();
  // Where things attach, for props: in the parent's coordinates (untransformed by tilt).
  return { u, top: y - (o.lift || 0) + top, bw, bh, bottom: y - (o.lift || 0) - hb - leg };
}

// ---------------------------------------------------------------- the face
function face(g, who, bx, top, bw, bh, u, o, k) {
  const eyes = o.eyes || (who === 'null' ? 'narrow' : 'open');
  const look = o.look || [0, 0];
  const lx = look[0] * u * .35, ly = look[1] * u * .25;
  const ew = .5 * u, eh = 1 * u;
  const ink0 = k.sil > .5 ? C.ink3 : C.ink;
  for (const side of [-1, 1]) {
    const ex = bx + bw / 2 + side * 1.75 * u + lx, ey = top + 1.5 * u + ly;
    // Eyeshadow: a flat red stroke above each eye (not on NULL, who wears none).
    if (!k.sil && who !== 'null') {
      g.fillStyle = who === 'cron' ? C.ink3 : C.red2;
      g.beginPath();
      g.moveTo(ex - side * ew * .9, ey - eh * .62);
      g.lineTo(ex + side * ew * 1.5, ey - eh * .95);
      g.lineTo(ex + side * ew * 1.6, ey - eh * .65);
      g.lineTo(ex - side * ew * .7, ey - eh * .45);
      g.closePath(); g.fill();
    }
    g.fillStyle = ink0;
    const draw = () => {
      if (eyes === 'shut') {
        gpen(g, [[ex - ew * .9, ey + eh * .1], [ex, ey + eh * .3], [ex + ew * .9, ey + eh * .1]], u * .14, { col: ink0, taper: [.2, .2], t: k.t, seed: k.seed + side });
        return;
      }
      if (eyes === 'dead') {
        gpen(g, [[ex - ew * .7, ey - eh * .3], [ex + ew * .7, ey + eh * .3]], u * .16, { col: ink0, taper: [.2, .2], t: k.t });
        gpen(g, [[ex + ew * .7, ey - eh * .3], [ex - ew * .7, ey + eh * .3]], u * .16, { col: ink0, taper: [.2, .2], t: k.t });
        return;
      }
      let h = eh, y0 = ey - eh / 2, slant = 0;
      if (eyes === 'narrow') { h = eh * .45; y0 = ey - eh * .05; }
      if (eyes === 'wide') { h = eh * 1.25; y0 = ey - eh * .7; }
      if (eyes === 'fierce') slant = side * -eh * .35;
      if (eyes === 'sad') slant = side * eh * .3;
      g.beginPath();
      g.moveTo(ex - ew / 2, y0 + (side < 0 ? slant : 0) * (side < 0 ? -1 : 1) * 0 + (slant * (side < 0 ? 1 : 0)));
      // A tall block, its top edge slanted for anger or sorrow.
      const tl = y0 + (slant > 0 ? 0 : -slant) * (side < 0 ? 1 : 0) + (slant > 0 ? slant : 0) * (side > 0 ? 0 : 1);
      void tl;
      const topL = y0 + Math.max(0, side < 0 ? -slant : slant) * (side < 0 ? 1 : 0);
      const topR = y0 + Math.max(0, side > 0 ? slant : -slant) * (side > 0 ? 1 : 0);
      g.moveTo(ex - ew / 2, topL);
      g.lineTo(ex + ew / 2, topR);
      g.lineTo(ex + ew / 2, y0 + h);
      g.lineTo(ex - ew / 2, y0 + h);
      g.closePath();
      g.fill();
      // A catch-light, the anime sign of a living eye.
      if (!k.sil && eyes !== 'narrow') {
        g.fillStyle = C.bone;
        g.fillRect(ex + side * ew * .02 - ew * .05, y0 + h * .12 + Math.max(topL, topR) - y0, ew * .3, ew * .3);
        g.fillStyle = ink0;
      }
    };
    draw();
    // Eyeliner wing: a sharp black flick from the outer top corner.
    if (!k.sil && eyes !== 'shut' && eyes !== 'dead') {
      const wx = ex + side * ew / 2, wy = ey - eh * (eyes === 'narrow' ? .05 : .5);
      g.fillStyle = C.ink;
      g.beginPath();
      g.moveTo(wx, wy + u * .05);
      g.lineTo(wx + side * u * .62, wy - u * .32);
      g.lineTo(wx, wy + u * .22);
      g.closePath(); g.fill();
    }
    // Mascara tears.
    if (o.tears > 0 && !k.sil) {
      const len = o.tears * u * 2.1;
      gpen(g, [[ex, ey + eh * .5], [ex + side * u * .05, ey + eh * .5 + len * .5], [ex - side * u * .02, ey + eh * .5 + len]],
        u * .13, { col: C.ink, taper: [.05, .5], t: k.t, seed: k.seed + side * 3 });
    }
  }
  // Mouth: only while singing, as the mascot has none.
  const m = o.mouth || 0;
  if (m > .04 && !k.sil) {
    const mx = bx + bw / 2 + lx * .6, my = top + 2.95 * u + ly * .5;
    const mw = lerp(.55, 1.25, clamp(m)) * u, mh = lerp(.1, 1.0, clamp(m)) * u;
    const mp = P().poly([[mx - mw / 2, my - mh * .35], [mx + mw / 2, my - mh * .35], [mx + mw * .36, my + mh * .65], [mx - mw * .36, my + mh * .65]]);
    ink(g, mp, { fill: C.ink, line: k.lineW * .7, seed: k.seed + 40, t: k.t, col: who === 'null' ? C.ink : C.red3 });
    if (m > .45) { g.fillStyle = C.red2; g.fillRect(mx - mw * .22, my + mh * .38, mw * .44, mh * .2); }
  } else if (who === 'null' && !k.sil) {
    // NULL's black lips, closed.
    gpen(g, [[bx + bw / 2 - .45 * u, top + 3 * u], [bx + bw / 2, top + 3.08 * u], [bx + bw / 2 + .45 * u, top + 3 * u]], u * .16, { col: C.ink, taper: [.3, .3], t: k.t });
  }
}

// ---------------------------------------------------------------- costume
function costume(g, who, bx, top, bw, bh, u, k) {
  const cx = bx + bw / 2;
  if (k.sil > .5) return;
  if (who === 'clawd') {
    // A silver chain slung across the front, link by link.
    const n = 13;
    for (let i = 0; i < n; i++) {
      const p = i / (n - 1), x = lerp(bx + .45 * u, bx + bw - .45 * u, p), y = top + bh * .8 + Math.sin(p * Math.PI) * u * .42;
      const ang = Math.cos(p * Math.PI) * .45 + (i % 2 ? Math.PI / 2 : 0);
      g.save(); g.translate(x, y); g.rotate(ang);
      g.lineWidth = u * .1; g.strokeStyle = C.ink;
      g.beginPath(); g.ellipse(0, 0, u * .2, u * .11, 0, 0, TAU); g.stroke();
      g.lineWidth = u * .055; g.strokeStyle = i % 2 ? C.steel : C.bone2;
      g.beginPath(); g.ellipse(0, 0, u * .2, u * .11, 0, 0, TAU); g.stroke();
      g.restore();
    }
  } else if (who === 'regex') {
    // A sticking plaster in an X on the cheek.
    g.save(); g.translate(bx + bw - 1.5 * u, top + 2.7 * u);
    for (const r of [.7, -.7]) {
      g.save(); g.rotate(r);
      const pl = P().rect(-.55 * u, -.14 * u, 1.1 * u, .28 * u);
      ink(g, pl, { fill: C.bone, line: k.lineW * .6, seed: k.seed + r * 10, t: k.t });
      g.restore();
    }
    g.restore();
  } else if (who === 'cron') {
    // Red-taped wristbands are on the arms; on the body, a torn strip of gaffer tape.
    ink(g, P().poly([[bx + .4 * u, top + 3.2 * u], [bx + 2.2 * u, top + 3.0 * u], [bx + 2.3 * u, top + 3.35 * u], [bx + .5 * u, top + 3.55 * u]]),
      { fill: C.ink2, line: k.lineW * .6, seed: k.seed, t: k.t });
  }
}

// ---------------------------------------------------------------- hair
// Each hairstyle is a mass (one smooth silhouette that fills the gaps) and blades: locks that
// swell from a root and taper to a sharp tip, as a key animator draws hair in clumps. Points are
// in units of u from the body's top centre, y down. A blade's tip swings with the headbang
// (whip) in proportion to its length, and stirs a little on twos.
const HAIR = {
  clawd: {
    mass: [[-3.4, 1.2], [-3.55, -.3], [-3.9, -1.2], [-3.05, -1.55], [-2.9, -2.35], [-2.0, -2.35], [-1.3, -3.1], [-.6, -2.65], [.4, -3.0], [.9, -2.6], [2.3, -2.3], [2.95, -2.5], [3.2, -1.4],
      [3.6, 0], [3.6, 1.3], [2.8, 1.2], [-2.8, 1.2]],
    back: [
      [[-3.0, -.2], [-3.7, 5.0], 1.9, [-.5, 0]], [[-2.6, .5], [-2.95, 5.7], 1.3, [-.2, 0]],
      [[3.0, -.2], [3.75, 3.9], 1.8, [.4, 0]], [[2.6, .5], [3.1, 4.6], 1.2, [.2, 0]],
    ],
    front: [
      [[-2.6, -1.3], [-3.25, 1.9], 1.35, [-.3, 0]],
      [[-2.3, -1.6], [2.4, 2.1], 2.9, [1.2, -1.1]],
      [[-.9, -1.9], [3.35, 1.2], 2.0, [.7, -.8]],
      [[.6, -1.2], [2.95, 2.85], 1.25, [.5, -.5]],
      [[-.2, -1.7], [1.6, 2.5], .8, [.5, -.5], 'streak'],
    ],
  },
  regex: {
    mass: [[-3.3, .8], [-3.3, -.6], [-2.4, -1.7], [0, -2.1], [2.4, -1.7], [3.3, -.6], [3.3, .8]],
    back: [
      [[-3.0, .2], [-5.3, -1.3], 1.5, [0, .2]], [[3.0, .2], [5.1, -.9], 1.5, [0, .2]],
      [[-2.3, -.6], [-4.7, -4.5], 2.0, [.3, .3]], [[2.2, -.6], [4.5, -3.9], 2.0, [-.3, .3]],
      [[.6, -1.0], [1.4, -5.7], 2.1, [.2, .3]], [[-1.0, -1.0], [-1.8, -6.3], 2.3, [.2, .3]],
    ],
    front: [
      [[-1.8, -.8], [-1.3, .75], 1.15, [0, 0]], [[-.2, -.9], [.4, .8], 1.15, [0, 0]], [[1.3, -.8], [1.9, .7], 1.05, [0, 0]],
    ],
  },
  null: {
    mass: [[-3.6, 1.3], [-3.55, -.2], [-3.05, -1.25], [-2.0, -1.85], [-.7, -2.1], [.7, -2.1], [2.0, -1.85], [3.05, -1.25], [3.55, -.2], [3.6, 1.3]],
    curtain: true,
    front: [],
  },
  cron: {
    mass: null,
    mane: true,
    front: [
      [[-2.0, -1.0], [-1.6, .7], 1.4, [0, 0]], [[-.3, -1.1], [.1, .85], 1.4, [0, 0]], [[1.5, -1.0], [1.9, .7], 1.3, [0, 0]],
    ],
  },
};

function blade(root, tip, w, bend, seed) {
  const [x0, y0] = root, [x1, y1] = tip;
  const mx = (x0 + x1) / 2 + bend[0], my = (y0 + y1) / 2 + bend[1];
  const pts = [];
  const N = 12;
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    pts.push([(1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * mx + s * s * x1, (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * my + s * s * y1, s]);
  }
  const left = [], right = [];
  for (let i = 0; i <= N; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    // Full at the root, swelling a touch, then thinning to a point.
    const s = pts[i][2], hw = w / 2 * Math.pow(1 - s, .9) * (1 + .25 * Math.sin(s * Math.PI)) * (1 + .06 * noise(s * 4, seed));
    left.push([pts[i][0] - ty * hw, pts[i][1] + tx * hw]);
    right.push([pts[i][0] + ty * hw, pts[i][1] - tx * hw]);
  }
  return P().poly([...left, ...right.reverse()]);
}

function hair(g, who, cx, top, u, bw, bh, k) {
  const { t, whip, lineW, seed, sil, rimCol, part } = k;
  const B = BAND[who], H = HAIR[who];
  const fill = sil > .5 ? C.ink : B.hair, shadeC = sil > .5 ? C.ink : B.hairShade;
  const X = (x, y) => [cx + x * u, top + y * u];
  const sw = whip * 1.1;
  const swing = (root, tip, i) => {
    const d = Math.hypot(tip[0] - root[0], tip[1] - root[1]);
    const st = noise(twos(t) * 1.1 + i * 3.3, seed) * .12;
    return [tip[0] + (sw + st) * d * .32, tip[1] + Math.abs(sw) * d * .05];
  };
  const shade = sil > .5 ? null : { dx: -u * .28, dy: -u * .34, col: shadeC };
  const paint = (p, col, sh, rim) => ink(g, p, { fill: col, line: lineW, seed: seed + p.subs[0].pts.length, t, corner: 1.1,
    shade: sh, rim: rim && rimCol ? { dx: u * .12, dy: u * .04, col: rimCol } : null });
  const drawBlades = (list, rim) => list.forEach(([r, tp, w, bend, tag], i) => {
    rim = rim && w > 1.6;
    const tip = swing(r, tp, i);
    const p = blade(X(...r), X(...tip), w * u, [bend[0] * u, bend[1] * u], seed + i);
    const red = tag === 'streak';
    paint(p, red ? C.red : fill, red ? { dx: -u * .2, dy: -u * .25, col: C.red2 } : shade, rim);
  });

  if (part === 'back') {
    if (H.curtain) {
      // NULL: two straight panels to the floor, cut to points at the ends.
      for (const s of [-1, 1]) {
        const sway = sw * s * .0 + sw * .5;
        const pts = [[3.55, .3], [2.5, 1.2], [2.55, 5.0], [2.85, 5.55], [3.1, 5.05], [3.4, 5.6], [3.7 + sway * .4, 5.0], [4.0 + sway * .5, 5.45], [4.05 + sway * .3, 3.4], [3.95, 1.2]]
          .map(([x, y]) => X(s * x + (y > 2 ? sway * (y - 2) * .25 : 0), y));
        paint(P().poly(pts), fill, sil > .5 ? null : { dx: -s * u * .3, dy: 0, col: shadeC }, true);
      }
      paint(P().poly(H.mass.map(p => X(...p))), fill, shade, true);
    } else if (H.mane) {
      // CRON: the mane as one bold star of swept spikes, red at the tips.
      const n = 11, pts = [], tips = [];
      for (let i = 0; i <= n * 2; i++) {
        const f = i / (n * 2), a = Math.PI * (.86 + f * 1.28);
        const outer = i % 2 === 0;
        const r = outer ? (i % 4 === 0 ? 5.9 : 5.1) : 3.3;
        const sweep = outer ? .16 : 0;
        let p = [Math.cos(a + sweep) * r * 1.02, -.6 + Math.sin(a + sweep) * r * .86];
        if (outer) p = swing([0, -.6], p, i);
        pts.push(p);
        if (outer) tips.push(pts.length - 1);
      }
      pts.push([3.6, 1.6], [3.0, 2.2], [-3.0, 2.2], [-3.6, 1.6]);
      const mane = P().poly(pts.map(p => X(...p)));
      paint(mane, fill, shade, true);
      // Red-dyed tips: the outer third of every other spike.
      tips.forEach((ti, j) => {
        const tp = pts[ti], a0 = pts[ti - 1] || pts[ti], a1 = pts[ti + 1] || pts[ti];
        const q = j % 2 ? .42 : .56;
        const tri = [tp, [lerp(tp[0], a1[0], q), lerp(tp[1], a1[1], q)], [lerp(tp[0], a0[0], q), lerp(tp[1], a0[1], q)]];
        paint(P().poly(tri.map(p => X(...p))), C.red, { dx: -u * .12, dy: -u * .12, col: C.red2 }, false);
      });
      if (sil < .5) {
        // Strands raked out from the crown.
        tips.forEach((ti, j) => {
          const tp = pts[ti];
          gpen(g, [X(tp[0] * .3, -.6 + (tp[1] + .6) * .3), X(tp[0] * .62, -.6 + (tp[1] + .6) * .62)], u * .09,
            { col: C.ink3, t, seed: seed + 80 + j, taper: [.2, .6] });
        });
      }
      // Side falls past the body.
      for (const sd of [-1, 1]) {
        const root = [sd * 2.8, .2], tp = swing(root, [sd * 4.5, 4.9], 20 + sd);
        paint(blade(X(...root), X(...tp), 2.0 * u, [sd * .7 * u, 0], seed + 60 + sd), fill, shade, true);
      }
    } else {
      drawBlades(H.back, true);
      paint(P().poly(H.mass.map(p => X(...p))), fill, shade, true);
    }
  } else {
    if (who === 'null') {
      // Blunt bangs cut straight across, and hime sidelocks framing the face.
      for (const s of [-1, 1]) {
        const lock = [[3.5, .1], [2.62, .1], [2.66, 3.15], [3.0, 3.3], [3.5, 3.15]].map(([x, y]) => X(s * x + sw * (y > 1 ? (y - 1) * .12 : 0), y));
        paint(P().poly(lock), fill, sil > .5 ? null : { dx: s * u * .22, dy: 0, col: shadeC }, false);
      }
      const bangs = [[-3.4, -.3], [-3.0, -1.3], [-1.6, -1.85], [0, -2.0], [1.6, -1.85], [3.0, -1.3], [3.4, -.3], [3.2, .62], [2.2, .55], [1.4, .66],
        [.4, .56], [-.6, .66], [-1.6, .55], [-2.4, .64], [-3.2, .6]].map(p => X(...p));
      paint(P().poly(bangs), fill, shade, false);
      if (sil < .5) {
        // The parting, and strands combed down into the fringe.
        gpen(g, [X(0, -2.0), X(-.1, -1.1)], u * .1, { col: B.hairShade, t, seed: seed + 9, taper: [.1, .6] });
        [[-2.4, -1.2, -2.6, .35], [-1.3, -1.5, -1.25, .4], [1.1, -1.5, 1.2, .38], [2.3, -1.2, 2.55, .33], [-.5, -1.6, -.6, .1], [.5, -1.6, .55, .12]]
          .forEach(([x0, y0, x1, y1], i) => gpen(g, [X(x0, y0), X((x0 + x1) / 2 + .1, (y0 + y1) / 2), X(x1, y1)], u * .07,
            { col: B.hairShade, t, seed: seed + 20 + i, taper: [.3, .5] }));
      }
    } else {
      drawBlades(H.front, false);
    }
  }
}

// Arm settings that reach from a shoulder to a point (both in the figure's local coordinates).
export function aim(side, sh, to, u) {
  const dx = to[0] - sh[0], dy = to[1] - sh[1];
  const ang = Math.atan2(dy, dx);
  return { a: side > 0 ? ang : Math.PI - ang, len: Math.max(.4, Math.hypot(dx, dy) / u - .1) };
}
