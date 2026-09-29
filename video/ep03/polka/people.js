// People and front-facing dogs, drawn as a talented child draws them: big round heads, sausage limbs,
// mitten hands, faces from a few marks. Each is a handful of blobs, so a pose is a few numbers.
import { clamp, lerp, hash, TAU } from './kit.js';
import { blob, line, dot, spline, hatch } from './pencil.js';
import { rrect, ellipse, scallop, rotate, move, capsule } from './shapes.js';
import { GRAPHITE, C } from './palette.js';

const ink = GRAPHITE;

// A limb segment is a tapered sausage from a to b (shapes.js); re-exported for the scenes.
export { capsule };

// Two-link reach: where the elbow goes so a limb of lengths l1, l2 from p reaches the target.
function elbow(p, target, l1, l2, bend = 1) {
  let dx = target[0] - p[0], dy = target[1] - p[1];
  let d = Math.hypot(dx, dy);
  const max = l1 + l2 - .5;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const a = Math.atan2(dy, dx);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d || 1), -1, 1);
  const k = Math.acos(cosA) * bend;
  return { e: [p[0] + Math.cos(a + k) * l1, p[1] + Math.sin(a + k) * l1], h: [p[0] + dx, p[1] + dy] };
}

// ---------------------------------------------------------------- a person
//   skin, hair {style, col}, top, bottom, shoes    colours       glasses, cheeks
//   armL/armR  {up: -1..1, out: 0..1} or {to: [x, y]} (in the person's space, feet at 0, +y down)
//   hold: {L: (g, x, y) => draw, R}  things in the hands, drawn at the hand's position
//   eyes 'dot' 'happy' 'wide' 'squint' 'worried'    mouth 'smile' 'open' 'flat' 'sad' 'o'    walk: leg phase
export function person(g, o = {}) {
  const { x = 540, y = 1300, s = 1, t = 0, seed = 1, skin = '#efc7a0', hair = { style: 'bun', col: '#6b4423' }, top = C.orange, bottom = C.blue, shoes = '#5b3a29',
    dress = false, glasses = false, cheeks = true, armL = { up: -.9, out: .1 }, armR = { up: -.9, out: .1 }, hold = {}, eyes = 'dot', mouth = 'smile', walk = 0, lean = 0, bob = 0,
    squash = 0, flip = 1, look = [0, 0], hat = null, brow = 0, height = 1 } = o;
  const sd = seed * 211;
  g.save();
  g.translate(x, y - bob);
  g.rotate(lean);
  g.scale(s * flip * (1 + squash * .08), s * height * (1 - squash * .1));
  const LEG = 104, HIP = -LEG, SH = -214, HEAD = [0, -276];
  // Legs.
  [-1, 1].forEach((side, i) => {
    const sw = walk ? Math.sin((walk + i * .5) * TAU) * 22 : 0;
    const top_ = [side * 22, HIP + 6], bot = [side * 26 + sw * .6, -6];
    blob(g, capsule(top_, bot, 15, 15, 5, sd + 1 + i), { fill: dress ? skin : bottom, line: ink, lw: 5.4, seed: sd + 1 + i, t, hw: 4.8, tone: .5 });
    blob(g, ellipse(bot[0] + side * 6, bot[1] + 10, 30, 14, 8), { fill: shoes, line: ink, lw: 5, seed: sd + 3 + i, t, hw: 4.6, tone: .7 });
  });
  // Torso: a dress is a bell, otherwise a rounded block over the trousers.
  const torso = dress
    ? [[-40, SH], [40, SH], [66, HIP + 26], [-66, HIP + 26]]
    : [[-44, SH], [44, SH], [50, HIP + 16], [-50, HIP + 16]];
  blob(g, spline(torso.map(p => p), true, 5), { fill: top, shade: ink, line: ink, lw: 6, seed: sd + 5, t, hw: 5, tone: .5, sh: .22 });
  // Arms.
  const arm = (side, a, sdd) => {
    const sh = [side * 42, SH + 12];
    let target;
    if (a.to) target = a.to;
    else target = [sh[0] + side * (28 + (a.out ?? .1) * 70), sh[1] + 112 - ((a.up ?? -.9) + 1) * 108 * .98];
    const { e, h } = elbow(sh, target, 62, 58, side);
    blob(g, capsule(sh, e, 13, 13, 5, sd + sdd), { fill: top, line: ink, lw: 5, seed: sd + sdd, t, hw: 4.6, tone: .5 });
    blob(g, capsule(e, h, 12, 12, 5, sd + sdd + 1), { fill: skin, line: ink, lw: 5, seed: sd + sdd + 1, t, hw: 4.6, tone: .5 });
    blob(g, ellipse(h[0], h[1], 16, 16, 8), { fill: skin, line: ink, lw: 4.6, seed: sd + sdd + 2, t, hw: 4.6, tone: .6 });
    return h;
  };
  const hL = arm(-1, armL, 10), hR = arm(1, armR, 20);
  if (hold.L) hold.L(g, hL[0], hL[1]);
  if (hold.R) hold.R(g, hR[0], hR[1]);
  // Head and hair.
  const hr = 58;
  if (hair.style === 'long') blob(g, spline([[-hr - 14, HEAD[1] - 20], [-hr - 22, HEAD[1] + 90], [0, HEAD[1] + 60], [hr + 22, HEAD[1] + 90], [hr + 14, HEAD[1] - 20]], true, 6), { fill: hair.col, line: ink, lw: 5, seed: sd + 30, t, hw: 4.8, tone: .5 });
  blob(g, ellipse(HEAD[0], HEAD[1], hr, hr * 1.02, 12), { fill: skin, shade: '#d9a878', line: ink, lw: 6, seed: sd + 31, t, hw: 5, tone: .5, sh: .2 });
  if (hair.style === 'bun') {
    blob(g, ellipse(0, HEAD[1] - hr - 22, 26, 24, 9), { fill: hair.col, line: ink, lw: 5, seed: sd + 32, t, hw: 4.6, tone: .6 });
    blob(g, spline([[-hr * .98, HEAD[1] - 6], [-hr * .8, HEAD[1] - hr * .9], [0, HEAD[1] - hr * 1.12], [hr * .8, HEAD[1] - hr * .9], [hr * .98, HEAD[1] - 6], [hr * .5, HEAD[1] - hr * .5], [-hr * .5, HEAD[1] - hr * .5]], true, 5), { fill: hair.col, line: ink, lw: 5, seed: sd + 33, t, hw: 4.6, tone: .55 });
  } else if (hair.style === 'curls') {
    for (let i = 0; i < 9; i++) { const a = -Math.PI + i / 8 * Math.PI, rr = hr * 1.02; blob(g, ellipse(Math.cos(a) * rr, HEAD[1] + Math.sin(a) * rr * .98, 20, 20, 8), { fill: hair.col, line: ink, lw: 4.6, seed: sd + 34 + i, t, hw: 4.4, tone: .6 }); }
  } else if (hair.style === 'bob' || hair.style === 'long') {
    blob(g, spline([[-hr * 1.06, HEAD[1] + 30], [-hr * 1.05, HEAD[1] - hr * .5], [0, HEAD[1] - hr * 1.12], [hr * 1.05, HEAD[1] - hr * .5], [hr * 1.06, HEAD[1] + 30], [hr * .6, HEAD[1] - hr * .35], [-hr * .6, HEAD[1] - hr * .35]], true, 5), { fill: hair.col, line: ink, lw: 5, seed: sd + 33, t, hw: 4.6, tone: .6 });
  } else if (hair.style === 'spikes') {
    for (let i = 0; i < 7; i++) { const a = -Math.PI + (i + .5) / 7 * Math.PI; blob(g, [[Math.cos(a - .18) * hr, HEAD[1] + Math.sin(a - .18) * hr], [Math.cos(a) * (hr + 30), HEAD[1] + Math.sin(a) * (hr + 30)], [Math.cos(a + .18) * hr, HEAD[1] + Math.sin(a + .18) * hr]], { fill: hair.col, line: ink, lw: 4.6, seed: sd + 34 + i, t, hw: 4.4, tone: .7 }); }
  } else if (hair.style === 'cap' || hat === 'cap') {
    // (The cap sits on the crown: its edge and its peak are above the eyes, so a face under a cap is still a face.)
    blob(g, spline([[-hr * 1.04, HEAD[1] - 26], [-hr * .9, HEAD[1] - hr * 1.0], [0, HEAD[1] - hr * 1.2], [hr * .9, HEAD[1] - hr * 1.0], [hr * 1.04, HEAD[1] - 26]], true, 5), { fill: hair.col, line: ink, lw: 5, seed: sd + 33, t, hw: 4.6, tone: .8 });
    blob(g, rrect(hr * .55, HEAD[1] - 26, hr * 1.1, 14, 7, 2), { fill: hair.col, line: ink, lw: 5, seed: sd + 35, t, hw: 4.6, tone: .8 });
  }
  // Face.
  const ex = 20, eyy = HEAD[1] - 2;
  [-1, 1].forEach((side, i) => {
    const cx = side * ex + look[0] * 4, cy = eyy + look[1] * 3;
    if (eyes === 'happy') line(g, [[cx - 11, cy + 4], [cx, cy - 8], [cx + 11, cy + 4]], { w: 6, col: ink, seed: sd + 40 + i, t, spline: true, passes: 1 });
    else if (eyes === 'squint') line(g, [[cx - 11, cy], [cx + 11, cy]], { w: 6, col: ink, seed: sd + 40 + i, t, spline: false, passes: 1 });
    else {
      const r = eyes === 'wide' ? 11 : 8.4;
      if (eyes === 'wide') blob(g, ellipse(cx, cy, 15, 16, 8), { fill: '#fbf8ef', line: ink, lw: 4, seed: sd + 42 + i, t, hw: 4, tone: .95 });
      dot(g, cx + look[0] * 2, cy + look[1] * 2, r, { col: ink, seed: sd + 40 + i, t });
    }
  });
  if (brow) [-1, 1].forEach((side, i) => line(g, [[side * ex - 14, eyy - 18 - brow * 5 * side], [side * ex + 12, eyy - 18 + brow * 5 * side]], { w: 5, col: ink, seed: sd + 50 + i, t, spline: false, passes: 1 }));
  if (glasses) [-1, 1].forEach((side, i) => blob(g, ellipse(side * ex, eyy, 21, 19, 9), { fill: null, line: ink, lw: 5, seed: sd + 55 + i, t }));
  const my = HEAD[1] + 26;
  if (mouth === 'open') blob(g, ellipse(0, my + 4, 15, 12, 8), { fill: '#7a2e2a', line: ink, lw: 4.4, seed: sd + 60, t, gap: 4, hw: 4, tone: .85 });
  else if (mouth === 'o') blob(g, ellipse(0, my + 4, 8, 10, 8), { fill: '#7a2e2a', line: ink, lw: 4, seed: sd + 60, t, gap: 4, hw: 4, tone: .85 });
  else if (mouth === 'sad') line(g, [[-14, my + 8], [0, my], [14, my + 8]], { w: 5.4, col: ink, seed: sd + 60, t, spline: true, passes: 1 });
  else if (mouth === 'flat') line(g, [[-12, my + 4], [12, my + 4]], { w: 5.4, col: ink, seed: sd + 60, t, spline: false, passes: 1 });
  else line(g, [[-16, my - 2], [0, my + 8], [16, my - 2]], { w: 5.4, col: ink, seed: sd + 60, t, spline: true, passes: 1 });
  if (cheeks) [-1, 1].forEach((side, i) => hatch(g, ellipse(side * 34, my - 6, 12, 8, 6), { col: C.pink, seed: sd + 65 + i, t, gap: 4.4, w: 3.6, alpha: .8, spill: 2 }));
  g.restore();
}

// ---------------------------------------------------------------- dogs, front on
const BREEDS = {
  bulldog: { fill: '#d6a165', shade: '#a26f3a', muzzle: '#f3e2c4', rx: 96, ry: 80, ear: 'rose', snout: { w: 108, h: 58, y: 30 }, jowls: true, nose: 'flat', wrinkles: true },
  lab: { fill: '#e2b04a', shade: '#b07f22', muzzle: '#f6dfa4', rx: 78, ry: 76, ear: 'floppy', snout: { w: 84, h: 60, y: 28 } },
  poodle: { fill: '#f1e4c8', shade: '#c9b58a', muzzle: '#f1e4c8', rx: 62, ry: 66, ear: 'pom', snout: { w: 56, h: 74, y: 32 }, topknot: true, curls: true },
  corgi: { fill: '#e6913a', shade: '#b56a1c', muzzle: '#fbf0dc', rx: 74, ry: 68, ear: 'pointy', snout: { w: 76, h: 62, y: 26 }, big: 1.25 },
  sheepdog: { fill: '#c9c7cf', shade: '#8f8d99', muzzle: '#eceaf1', rx: 92, ry: 88, ear: 'floppy', snout: { w: 70, h: 54, y: 40 }, fringe: true, shaggy: true },
  beagle: { fill: '#b8783a', shade: '#7f4c1e', muzzle: '#f4e6cc', rx: 72, ry: 70, ear: 'floppy', snout: { w: 74, h: 60, y: 28 }, earCol: '#6b3f1c' },
  pug: { fill: '#e3c08a', shade: '#a98550', muzzle: '#2b2a33', rx: 84, ry: 76, ear: 'fold', snout: { w: 80, h: 52, y: 30 }, jowls: true, nose: 'flat', wrinkles: true, mask: true },
  chihuahua: { fill: '#e9c9a0', shade: '#b8946a', muzzle: '#f6e6cc', rx: 58, ry: 56, ear: 'pointy', snout: { w: 46, h: 44, y: 22 }, big: 1.7, eyeBig: 1.35 },
  dalmatian: { fill: '#fbf8ef', shade: '#cfcabd', muzzle: '#fbf8ef', rx: 72, ry: 72, ear: 'floppy', snout: { w: 80, h: 60, y: 28 }, spots: true, earCol: '#2b2a33' },
  husky: { fill: '#9a9aa8', shade: '#63636f', muzzle: '#fbf8ef', rx: 76, ry: 72, ear: 'pointy', snout: { w: 72, h: 58, y: 26 }, mask: 'husky', big: 1 },
  greyhound: { fill: '#a7a2b0', shade: '#726d7c', muzzle: '#c4c0cb', rx: 54, ry: 74, ear: 'fold', snout: { w: 46, h: 82, y: 38 } },
  mutt: { fill: '#c98f56', shade: '#95622f', muzzle: '#efd6ae', rx: 76, ry: 72, ear: 'mixed', snout: { w: 80, h: 58, y: 28 } },
};
export const BREED_NAMES = Object.keys(BREEDS);

// A front-facing dog: head, and with `body` a chest and front paws (on a counter, say). Origin at the chin.
//   eyes 'dot' 'happy' 'wide' 'sad' 'x' 'squint' 'shut'    mouth 0..1 open, tongue    ear: 0..1 flop / lift
//   look: [-1..1, -1..1]    hat: a callback (g, headTopY) drawn on top    collar: colour or null
export function dogFront(g, o = {}) {
  const { x = 540, y = 1200, s = 1, t = 0, seed = 1, breed = 'mutt', eyes = 'dot', mouth = 0, tongue = false, ear = 0, look = [0, 0], body = false, bob = 0, tilt = 0,
    collar = C.red, tag = C.yellow, squash = 0, flip = 1, hat = null, brow = 0, cheekPuff = 0, color = null, shade = null, sweat = false } = o;
  const B = { ...BREEDS[breed] };
  if (color) B.fill = color;
  if (shade) B.shade = shade;
  const sd = seed * 173 + breed.length * 7;
  g.save();
  g.translate(x, y - bob);
  g.rotate(tilt);
  g.scale(s * flip * (1 + squash * .08), s * (1 - squash * .1));
  const rx = B.rx, ry = B.ry, hc = [0, -ry];
  // Body first, so the head overlaps it.
  if (body) {
    const bw = rx * 1.5, bh = ry * 1.25;
    blob(g, spline([[-bw * .5, -10], [-bw * .58, bh * .5], [-bw * .4, bh * .95], [bw * .4, bh * .95], [bw * .58, bh * .5], [bw * .5, -10]], true, 6), { fill: B.fill, shade: B.shade, line: ink, lw: 6.4, seed: sd + 50, t, hw: 5.2, tone: .45, sh: .25 });
    if (B.shaggy) for (let i = 0; i < 7; i++) line(g, [[-bw * .4 + i * bw * .13, bh * .55], [-bw * .42 + i * bw * .13, bh * .95]], { w: 4, col: ink, seed: sd + 60 + i, t, spline: false, passes: 1, alpha: .6 });
    [-1, 1].forEach((side, i) => blob(g, ellipse(side * bw * .26, bh * .86, 26, 15, 8), { fill: B.muzzle === '#2b2a33' ? B.fill : B.muzzle, line: ink, lw: 5, seed: sd + 55 + i, t, hw: 4.4, tone: .6 }));
  }
  // Ears behind (floppy hang beside the head).
  const flop = ear;
  const earAt = (side, i) => {
    const e = B.ear, k = B.big || 1;
    const ec = B.earCol || B.shade;
    if (e === 'floppy') {
      const sw = flop * 12 * side;
      blob(g, spline([[side * rx * .72, hc[1] - ry * .55], [side * (rx * 1.02 + sw), hc[1] - ry * .1], [side * (rx * 1.08 + sw * 1.3), hc[1] + ry * .62], [side * rx * .82, hc[1] + ry * .5], [side * rx * .6, hc[1] - ry * .05]], true, 5), { fill: ec, line: ink, lw: 5.6, seed: sd + 70 + i, t, hw: 4.8, tone: .55 });
    } else if (e === 'pointy') {
      const up = 1 + flop * .12;
      blob(g, [[side * rx * .3, hc[1] - ry * .8], [side * rx * .62, hc[1] - ry * (1.5 * k * up)], [side * rx * .98, hc[1] - ry * .56]], { fill: B.fill, line: ink, lw: 5.6, seed: sd + 70 + i, t, hw: 4.8, tone: .55 });
      blob(g, [[side * rx * .5, hc[1] - ry * .78], [side * rx * .62, hc[1] - ry * (1.16 * k * up)], [side * rx * .82, hc[1] - ry * .66]], { fill: C.pink, line: null, seed: sd + 72 + i, t, hw: 4.4, tone: .55, dens: .5 });
    } else if (e === 'rose') {
      blob(g, [[side * rx * .5, hc[1] - ry * .72], [side * rx * .88, hc[1] - ry * 1.1], [side * rx * 1.02, hc[1] - ry * .48]], { fill: B.shade, line: ink, lw: 5.6, seed: sd + 70 + i, t, hw: 4.8, tone: .6 });
    } else if (e === 'fold') {
      blob(g, spline([[side * rx * .55, hc[1] - ry * .78], [side * rx * .98, hc[1] - ry * .5], [side * rx * .92, hc[1] - ry * .08], [side * rx * .6, hc[1] - ry * .3]], true, 5), { fill: B.shade, line: ink, lw: 5.6, seed: sd + 70 + i, t, hw: 4.8, tone: .6 });
    } else if (e === 'pom') {
      blob(g, scallop(side * rx * 1.08, hc[1] + ry * .1, rx * .58, 9, .16, i), { fill: B.fill, shade: B.shade, line: ink, lw: 5.6, seed: sd + 70 + i, t, hw: 4.8, tone: .6, sh: .25 });
    } else if (e === 'mixed') {
      if (side < 0) blob(g, spline([[-rx * .72, hc[1] - ry * .55], [-(rx * 1.02 + flop * 12), hc[1] - ry * .1], [-(rx * 1.08 + flop * 16), hc[1] + ry * .62], [-rx * .82, hc[1] + ry * .5], [-rx * .6, hc[1] - ry * .05]], true, 5), { fill: B.shade, line: ink, lw: 5.6, seed: sd + 70, t, hw: 4.8, tone: .55 });
      else blob(g, [[rx * .3, hc[1] - ry * .8], [rx * .62, hc[1] - ry * 1.4], [rx * .98, hc[1] - ry * .56]], { fill: B.fill, line: ink, lw: 5.6, seed: sd + 71, t, hw: 4.8, tone: .55 });
    }
  };
  earAt(-1, 0); earAt(1, 1);
  // Head.
  const headShape = B.curls ? scallop(0, hc[1], rx, 12, .09) : ellipse(0, hc[1], rx, ry, 14);
  blob(g, headShape, { fill: B.fill, shade: B.shade, line: ink, lw: 6.6, seed: sd + 1, t, hw: 5.2, tone: .45, sh: .26 });
  if (B.spots) [[-.5, -.4, 14], [.35, -.55, 11], [.55, .1, 13], [-.6, .2, 9], [.05, -.8, 8]].forEach(([a, b, r], i) => dot(g, a * rx, hc[1] + b * ry, r, { col: ink, seed: sd + 90 + i, t, alpha: .9 }));
  if (B.mask === true) blob(g, ellipse(0, hc[1] + ry * .3, rx * .72, ry * .55, 10), { fill: '#2b2a33', line: null, seed: sd + 3, t, gap: 4, hw: 4.6, tone: .5, dens: .7 });
  if (B.mask === 'husky') blob(g, spline([[0, hc[1] - ry * .1], [rx * .6, hc[1] - ry * .5], [rx * .9, hc[1]], [rx * .5, hc[1] + ry * .5], [0, hc[1] + ry * .9], [-rx * .5, hc[1] + ry * .5], [-rx * .9, hc[1]], [-rx * .6, hc[1] - ry * .5]], true, 5), { fill: '#fbf8ef', line: null, seed: sd + 3, t, gap: 4, hw: 4.6, tone: .8, dens: .8 });
  if (B.topknot) blob(g, scallop(0, hc[1] - ry - 22, 42, 9, .16), { fill: B.fill, shade: B.shade, line: ink, lw: 5.6, seed: sd + 4, t, hw: 4.8, tone: .6, sh: .25 });
  // Muzzle.
  const sn = B.snout, sy = hc[1] + sn.y;
  blob(g, rrect(0, sy + 8, sn.w, sn.h, sn.h * .46, 3), { fill: B.muzzle, line: ink, lw: 5.4, seed: sd + 5, t, hw: 4.6, tone: .45, sh: .2, shade: B.fill });
  if (B.jowls) [-1, 1].forEach((side, i) => blob(g, ellipse(side * sn.w * .42, sy + sn.h * .3, sn.w * .34, sn.h * .3, 8), { fill: B.muzzle, line: ink, lw: 5, seed: sd + 6 + i, t, hw: 4.6, tone: .5 }));
  // Nose.
  const nw = B.nose === 'flat' ? 32 : 22;
  blob(g, ellipse(0, sy - sn.h * .06, nw, B.nose === 'flat' ? 13 : 14, 8), { fill: ink, line: null, seed: sd + 8, t, gap: 3.2, hw: 4.4, tone: .95 });
  // Mouth.
  const my = sy + sn.h * .34;
  if (mouth > .08) {
    const mh = 8 + mouth * 40, mw = sn.w * .5;
    blob(g, rrect(0, my + mh / 2, mw, mh, Math.min(20, mh / 2), 3), { fill: '#7a2e2a', line: ink, lw: 4.6, seed: sd + 9, t, gap: 4, hw: 4.2, tone: .85 });
    if (tongue || mouth > .55) blob(g, ellipse(0, my + mh - 4, mw * .32, mh * .28, 7), { fill: C.pink, line: ink, lw: 3.8, seed: sd + 10, t, gap: 4, hw: 3.8, tone: .7 });
  } else {
    line(g, [[-sn.w * .3, my], [-sn.w * .1, my + 9], [0, my + 2], [sn.w * .1, my + 9], [sn.w * .3, my]], { w: 5.6, col: ink, seed: sd + 9, t, spline: true, passes: 1 });
  }
  // Eyes.
  const ex = rx * .42, eyy = hc[1] - ry * .18, er = 12.5 * (B.eyeBig || 1);
  [-1, 1].forEach((side, i) => {
    const cx = side * ex + look[0] * 5, cy = eyy + look[1] * 4;
    if (eyes === 'happy') line(g, [[cx - 14, cy + 6], [cx, cy - 10], [cx + 14, cy + 6]], { w: 7, col: ink, seed: sd + 20 + i, t, spline: true, passes: 1 });
    else if (eyes === 'squint') line(g, [[cx - 14, cy], [cx + 14, cy]], { w: 7, col: ink, seed: sd + 20 + i, t, spline: false, passes: 1 });
    else if (eyes === 'shut') line(g, [[cx - 13, cy], [cx, cy + 6], [cx + 13, cy]], { w: 6, col: ink, seed: sd + 20 + i, t, spline: true, passes: 1 });
    else if (eyes === 'x') { line(g, [[cx - 11, cy - 11], [cx + 11, cy + 11]], { w: 7, col: ink, seed: sd + 20 + i, t, spline: false, passes: 1 }); line(g, [[cx + 11, cy - 11], [cx - 11, cy + 11]], { w: 7, col: ink, seed: sd + 24 + i, t, spline: false, passes: 1 }); }
    else if (eyes === 'wide') {
      blob(g, ellipse(cx, cy, er * 1.9, er * 2.0, 8), { fill: '#fbf8ef', line: ink, lw: 4.6, seed: sd + 20 + i, t, hw: 4.4, tone: .95 });
      dot(g, cx + look[0] * 4 + 1, cy + look[1] * 3 + 2, er * .9, { col: ink, seed: sd + 22 + i, t });
      dot(g, cx + look[0] * 4 - 3, cy + look[1] * 3 - 4, er * .3, { col: '#fbf8ef', seed: sd + 26 + i, t });
    } else {
      dot(g, cx, cy, er * 1.15, { col: ink, seed: sd + 22 + i, t });
      dot(g, cx + look[0] * 2 - 3, cy + look[1] * 2 - 4, er * .34, { col: '#fbf8ef', seed: sd + 26 + i, t });
    }
  });
  if (eyes === 'sad' || brow) [-1, 1].forEach((side, i) => {
    const k = eyes === 'sad' ? 1 : brow;
    line(g, [[side * ex - side * 20, eyy - er * 2.6 + (side < 0 ? 1 : -1) * -k * 8], [side * ex + side * 16, eyy - er * 2.6 + (side < 0 ? 1 : -1) * k * 8]], { w: 6, col: ink, seed: sd + 28 + i, t, spline: false, passes: 1 });
  });
  if (B.wrinkles) [-1, 0, 1].forEach((k, i) => line(g, [[k * rx * .3 - 14, hc[1] - ry * .6 + Math.abs(k) * 4], [k * rx * .3 + 14, hc[1] - ry * .6 + Math.abs(k) * 4]], { w: 4.4, col: ink, seed: sd + 30 + i, t, spline: false, passes: 1, alpha: .7 }));
  if (B.fringe) for (let i = 0; i < 11; i++) { const a = -.9 + i / 10 * 1.8; line(g, [[Math.sin(a) * rx * .8, hc[1] - ry * .78], [Math.sin(a) * rx * .95, hc[1] - ry * .0 + Math.abs(a) * 8]], { w: 5, col: B.shade, seed: sd + 40 + i, t, spline: false, passes: 1, alpha: .85, taper: [.05, .5] }); }
  if (sweat) blob(g, [[rx * .78, hc[1] - ry * .5], [rx * .9, hc[1] - ry * .2], [rx * .72, hc[1] - ry * .1]], { fill: C.sky, line: ink, lw: 4, seed: sd + 44, t, hw: 4, tone: .8 });
  // Collar.
  if (collar) {
    line(g, [[-rx * .54, hc[1] + ry * .8], [0, hc[1] + ry * 1.02], [rx * .54, hc[1] + ry * .8]], { w: 22, col: collar, seed: sd + 80, t, spline: true, passes: 1, taper: [.02, .02], tooth: .45 });
    line(g, [[-rx * .54, hc[1] + ry * .8], [0, hc[1] + ry * 1.02], [rx * .54, hc[1] + ry * .8]], { w: 4.6, col: ink, seed: sd + 81, t, spline: true, passes: 1, taper: [.02, .02], alpha: .6 });
    blob(g, ellipse(0, hc[1] + ry * 1.12, 15, 15, 8), { fill: tag, line: ink, lw: 4.4, seed: sd + 82, t, hw: 4.4, tone: .55 });
  }
  if (hat) hat(g, hc[1] - ry, rx);
  g.restore();
}
