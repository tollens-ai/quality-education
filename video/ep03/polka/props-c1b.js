// Props for chorus 1's fifth and sixth gags: "Polish one part, and then another takes a blow" (the show dog,
// a polish brush, a blow-dryer with its cord, the wind it makes and the fur it lifts) and "Which of the
// 'ilities' are yours?" (a beam of light that lands on the viewer, rays behind a close-up, a star in each eye).
// Each is a small function of the time, so chorus 2 can play the same gags with the tables turned.
import { TAU, clamp, lerp, hash, rgba, boil } from './kit.js';
import { blob, line, dot, spline } from './pencil.js';
import { ellipse, rrect, scallop, star, capsule } from './shapes.js';
import { sparkle } from './props.js';
import { write } from './hand.js';
import { GRAPHITE, C } from './palette.js';

const ink = GRAPHITE;
const COAT = '#c98f56', SHADE = '#95622f', MUZ = '#efd6ae', NAIL_OFF = '#e9dcc4', NAIL_ON = '#ec4478';

// ---------------------------------------------------------------- the show dog
// The scruffy mutt with the WALKIES badge (ringcast's showDog), drawn here so that he can be groomed and blown:
// a near paw held up for its nails to be painted, ears that fly, a coat that goes to fluff.
//   wind 0..1       the dryer's air on him: ears fly, fur sweeps, cheeks puff, badge flaps    fl -1..1  its flutter
//   ruffle 0..1     the coat's mess: a halo of spiky fluff        nails [4]  each nail's polish 0..1
//   paw 0..1        how high the near paw is held                  ear     a little swing for the calm ears
//   eyes 'dot' 'happy' 'wide' 'shut'   look [x, y]   brow 0..1 (raised)   mouth 0..1   tilt (radians)   badge
const PAW = [-116, 32];
const TOES = [[-25, -9, -.35], [-9, -22, -.12], [9, -22, .12], [25, -9, .35]];
export function muttAnchors(o = {}) {
  const { x = 660, y = 988, s = 1.85, tilt = 0, squash = 0, bob = 0, pawSway = 0 } = o;
  const c = Math.cos(tilt), n = Math.sin(tilt);
  const P = (lx, ly) => { const sx = lx * s, sy = ly * s * (1 - squash * .1); return [x + sx * c - sy * n, y - bob + sx * n + sy * c]; };
  const cs = Math.cos(pawSway), sn = Math.sin(pawSway);
  const inPaw = (px, py) => P(PAW[0] + px * cs - (py - 22) * sn, PAW[1] + 22 + px * sn + (py - 22) * cs);
  const nails = TOES.map(([tx, ty, a]) => inPaw(tx + Math.sin(a) * 15, ty - Math.cos(a) * 15));
  return { P, nails, paw: inPaw(0, 0), head: P(0, -72), mouth: P(0, -22), nose: P(0, -47) };
}

// An ear as a polygon round a bent spine: from `a`, `len` long, `wid` wide at the root, tapering to `tip` of that,
// pointing at screen angle `ang` and curling by `curl` radians along its length.
function earShape(a, len, wid, ang, curl, tip) {
  const N = 7, L = [], R = [];
  let x = a[0], y = a[1], th = ang;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    th = ang + curl * u * u;
    const hw = wid * (1 - (1 - tip) * u), nx = -Math.sin(th), ny = Math.cos(th);
    L.push([x + nx * hw, y + ny * hw]); R.push([x - nx * hw, y - ny * hw]);
    x += Math.cos(th) * len / N; y += Math.sin(th) * len / N;
  }
  return [...L, [x + Math.cos(th) * wid * Math.max(tip, .3), y + Math.sin(th) * wid * Math.max(tip, .3)], ...R.reverse()];
}

export function showMutt(g, t, o = {}) {
  const { x = 660, y = 988, s = 1.85, tilt = 0, squash = 0, bob = 0, wind = 0, fl = 0, ruffle = 0, paw = 1, nails = [0, 0, 0, 0], pawSway = 0, ear = 0,
    eyes = 'dot', look = [0, 0], brow = 0, mouth = 0, tongue = true, badge = true, flap = 0, seed = 65 } = o;
  const sd = seed * 100;
  g.save();
  g.translate(x, y - bob);
  g.rotate(tilt);
  g.scale(s, s * (1 - squash * .1));
  const HC = -72, RX = 76, RY = 72;
  // The body (a bell of chest) and the paw that rests on the table.
  blob(g, spline([[-57, -10], [-66, 45], [-46, 85], [46, 85], [66, 45], [57, -10]], true, 6), { fill: COAT, shade: SHADE, line: ink, lw: 6.4, seed: sd + 50, t, hw: 5.2, tone: .45, sh: .25 });
  blob(g, ellipse(30, 77, 26, 15, 8, 0, sd + 55), { fill: MUZ, line: ink, lw: 5, seed: sd + 55, t, hw: 4.4, tone: .6 });
  // The coat's mess: a spiky halo behind the head, and tufts round the body.
  if (ruffle > .03) {
    const k = ruffle;
    blob(g, star(0, HC, RX * (1 + .5 * k), RX * (1 + .14 * k), 17, -Math.PI / 2 + .2, sd + 60), { fill: COAT, shade: SHADE, line: ink, lw: 5.6, seed: sd + 60, t, hw: 5, tone: .6, sh: .3 });
    for (let i = 0; i < 7; i++) {
      const a = -.55 + i * .52, r0 = 54, L = 22 + 20 * k * hash(sd, i, 3);
      line(g, [[Math.cos(a) * r0 + 10, 18 + Math.sin(a) * 26], [Math.cos(a) * (r0 + L * .5) + 12, 20 + Math.sin(a) * (34 + L * .4)], [Math.cos(a) * (r0 + L) + 14, 22 + Math.sin(a) * (40 + L * .8)]], { w: 9, col: i % 2 ? SHADE : COAT, seed: sd + 70 + i, t, passes: 1, taper: [.05, .8], alpha: k });
    }
  }
  // Ears, behind the head. The floppy one hangs from the top left; the wind flips it up. The pointed one streams.
  const wv = wind * fl;
  const angL = lerp(1.67 - ear * .05, 5.45, wind) + wv * .22, curlL = lerp(.1, .95, wind) + wv * .3;
  blob(g, earShape([-54, -106], 90 * (1 + .1 * wind), 26, angL, curlL, .8), { fill: SHADE, shade: '#5d331a', line: ink, lw: 6, seed: sd + 71, t, hw: 4.8, tone: .6, sh: .3 });
  const angR = lerp(-1.38 + ear * .05, -.2, wind) - wv * .3, curlR = lerp(0, .7, wind) + wv * .4;
  blob(g, earShape([49, -116], 66 * (1 + .35 * wind), 28, angR, curlR, .06), { fill: COAT, shade: SHADE, line: ink, lw: 6, seed: sd + 72, t, hw: 4.8, tone: .6, sh: .3 });
  // Head, muzzle (with cheeks that puff), nose.
  blob(g, ellipse(0, HC, RX, RY, 14, 0, sd + 1), { fill: COAT, shade: SHADE, line: ink, lw: 6.6, seed: sd + 1, t, hw: 5.2, tone: .45, sh: .26 });
  const puff = wind * (9 + 4 * fl);
  blob(g, rrect(0, -36, 80 + puff * 1.2, 58 + puff * .4, 27, 3, sd + 5), { fill: MUZ, shade: COAT, line: ink, lw: 5.4, seed: sd + 5, t, hw: 4.6, tone: .45, sh: .2 });
  if (puff > 1) [-1, 1].forEach((sg, i) => blob(g, ellipse(sg * (40 + puff * .6), -30, 13 + puff * .7, 15 + puff * .5, 8, 0, sd + 6 + i), { fill: MUZ, line: ink, lw: 5, seed: sd + 6 + i, t, hw: 4.4, tone: .6 }));
  blob(g, ellipse(0, -47.5, 22, 14, 8, 0, sd + 8), { fill: ink, line: null, seed: sd + 8, t, gap: 3.2, hw: 4.4, tone: .95 });
  // Mouth: a smile, or open (a big grin in the wind) with a tongue that streams.
  const my = -24.3;
  if (mouth > .08) {
    const mh = 8 + mouth * 40, mw = 40 + 30 * wind;
    blob(g, rrect(0, my + mh / 2, mw, mh, Math.min(20, mh / 2), 3, sd + 9), { fill: '#7a2e2a', line: ink, lw: 4.6, seed: sd + 9, t, gap: 4, hw: 4.2, tone: .85 });
    if (tongue || mouth > .55) blob(g, ellipse(wind * 14, my + mh - 4, mw * .32, mh * .3, 7, wind * .4, sd + 10), { fill: C.pink, line: ink, lw: 3.8, seed: sd + 10, t, gap: 4, hw: 3.8, tone: .7 });
  } else line(g, [[-24, my], [-8, my + 9], [0, my + 2], [8, my + 9], [24, my]], { w: 5.6, col: ink, seed: sd + 9, t, spline: true, passes: 1 });
  // Eyes.
  const ex = 32, eyy = -85, er = 12.5;
  [-1, 1].forEach((sg, i) => {
    const cx = sg * ex + look[0] * 5, cy = eyy + look[1] * 4;
    if (eyes === 'happy') line(g, [[cx - 14, cy + 6], [cx, cy - 10], [cx + 14, cy + 6]], { w: 7, col: ink, seed: sd + 20 + i, t, spline: true, passes: 1 });
    else if (eyes === 'shut') line(g, [[cx - 13, cy], [cx, cy + 6], [cx + 13, cy]], { w: 6, col: ink, seed: sd + 20 + i, t, spline: true, passes: 1 });
    else if (eyes === 'wide') {
      blob(g, ellipse(cx, cy, er * 1.9, er * 2.0, 8, 0, sd + 20 + i), { fill: '#fbf8ef', line: ink, lw: 4.6, seed: sd + 20 + i, t, hw: 4.4, tone: .95 });
      dot(g, cx + look[0] * 7 + 1, cy + look[1] * 5 + 2, er * .9, { col: ink, seed: sd + 22 + i, t });
      dot(g, cx + look[0] * 7 - 3, cy + look[1] * 5 - 4, er * .3, { col: '#fbf8ef', seed: sd + 26 + i, t });
    } else {
      dot(g, cx, cy, er * 1.15, { col: ink, seed: sd + 22 + i, t });
      dot(g, cx + look[0] * 2 - 3, cy + look[1] * 2 - 4, er * .34, { col: '#fbf8ef', seed: sd + 26 + i, t });
    }
    if (brow) line(g, [[cx - 15, cy - 34 - brow * 10 + (i ? 3 : 0)], [cx, cy - 42 - brow * 12], [cx + 15, cy - 34 - brow * 10 + (i ? 0 : 3)]], { w: 6, col: ink, seed: sd + 28 + i, t, spline: true, passes: 1 });
  });
  // The fur that stands up or sweeps back from the crown.
  const sweep = Math.max(wind, ruffle * .6);
  if (sweep > .05) for (let i = 0; i < 6; i++) {
    const bx = -46 + i * 17, by = HC - Math.sqrt(Math.max(0, 1 - (bx / RX) * (bx / RX))) * RY * .98;
    const L = (26 + 26 * hash(sd, i, 5)) * (.5 + sweep), a = -1.2 + wind * 1.1 + (hash(sd, i, 6) - .5) * .5 + wind * fl * .25;
    line(g, [[bx, by + 4], [bx + Math.cos(a) * L * .5, by + Math.sin(a) * L * .5 - 3], [bx + Math.cos(a) * L, by + Math.sin(a) * L]], { w: 10, col: i % 2 ? SHADE : COAT, seed: sd + 80 + i, t, passes: 1, taper: [.05, .85] });
  }
  // The collar.
  line(g, [[-41, -14], [0, 1.5], [41, -14]], { w: 22, col: C.red, seed: sd + 90, t, spline: true, passes: 1, taper: [.02, .02], tooth: .45 });
  line(g, [[-41, -14], [0, 1.5], [41, -14]], { w: 4.6, col: ink, seed: sd + 91, t, spline: true, passes: 1, taper: [.02, .02], alpha: .6 });
  blob(g, ellipse(0, 9, 15, 15, 8, 0, sd + 92), { fill: C.yellow, line: ink, lw: 4.4, seed: sd + 92, t, hw: 4.4, tone: .55 });
  // The near paw, held up: a forelimb from the chest and a paw print with four nails to be painted.
  if (paw > .01) {
    const k = paw;
    const W0 = [lerp(-30, PAW[0], k), lerp(78, PAW[1] + 24, k)];
    blob(g, capsule([-46, 30], W0, 15, 13, 5, sd + 100), { fill: COAT, shade: SHADE, line: ink, lw: 5.6, seed: sd + 100, t, hw: 4.8, tone: .5, sh: .3 });
    g.save();
    g.translate(W0[0], W0[1] - 2);
    g.rotate(pawSway);
    g.scale((.6 + .4 * k) * 1.22, (.6 + .4 * k) * 1.22);
    g.translate(0, -22);
    blob(g, ellipse(0, 9, 21, 17, 9, 0, sd + 101), { fill: MUZ, shade: COAT, line: ink, lw: 4.4, seed: sd + 101, t, gap: 4.6, hw: 4.2, tone: .6, sh: .25 });
    TOES.forEach(([tx, ty, a], i) => {
      blob(g, ellipse(tx, ty, 10, 12.5, 8, a, sd + 102 + i), { fill: MUZ, line: ink, lw: 4, seed: sd + 102 + i, t, gap: 4.2, hw: 3.8, tone: .6 });
      const nx = tx + Math.sin(a) * 15, ny = ty - Math.cos(a) * 15, p = nails[i] || 0;
      dot(g, nx, ny, 8.6, { col: p > .5 ? NAIL_ON : NAIL_OFF, seed: sd + 110 + i, t });
      if (p > .5) dot(g, nx - 2.8, ny - 3.4, 2.8, { col: '#fbf8ef', seed: sd + 114 + i, t });
    });
    g.restore();
  }
  // The WALKIES badge on his chest: it flaps in the wind.
  if (badge) {
    g.save(); g.translate(0, 86); g.rotate(Math.sin(t * 2.1) * .04 - flap * (.9 + .25 * fl)); g.translate(0, -flap * 6);
    blob(g, rrect(0, 0, 72, 27, 6, 3, sd + 120), { fill: '#fbf8ef', line: ink, lw: 3.4, seed: sd + 120, t, hw: 3.6, tone: .9, dens: .3 });
    write(g, 'WALKIES', 0, 8.5, 12, { col: C.blue, seed: sd + 121, t, align: 'center', track: 3, w: .11 });
    g.restore();
  }
  g.restore();
}

// ---------------------------------------------------------------- the tools (drawn in Clawd's own space, at his hand, pointing right)
// A brush loaded with polish: a wooden handle, a silver ferrule, a tuft of bristles in the polish's colour.
export function groomBrush(g, t, o = {}) {
  const { seed = 7, col = NAIL_ON } = o;
  line(g, [[-6, 0], [66, 0]], { w: 17, col: '#c99a5a', seed, t, spline: false, passes: 1, flat: true, tooth: .5 });
  line(g, [[-6, -9], [66, -9]], { w: 4, col: ink, seed: seed + 1, t, spline: false, passes: 1, flat: true, alpha: .7 });
  line(g, [[-6, 9], [66, 9]], { w: 4, col: ink, seed: seed + 2, t, spline: false, passes: 1, flat: true, alpha: .7 });
  blob(g, rrect(76, 0, 24, 28, 5, 2, seed + 3), { fill: '#a8a7b2', line: ink, lw: 4.6, seed: seed + 3, t, hw: 4.2, tone: .8 });
  blob(g, [[86, -15], [112, -12], [128, 0], [112, 12], [86, 15]], { fill: col, line: ink, lw: 4.6, seed: seed + 4, t, hw: 4.2, tone: .9 });
}

// A blow-dryer: a teal barrel with a silver nozzle and a dark mouth, a handle with a yellow switch. `on` makes it buzz.
export function dryer(g, t, o = {}) {
  const { seed = 21, on = 0 } = o;
  const j = on ? [(hash(boil(t), seed, 1) - .5) * 5, (hash(boil(t), seed, 2) - .5) * 4] : [0, 0];
  g.save(); g.translate(j[0], j[1]);
  blob(g, capsule([4, 14], [-20, 78], 17, 14, 5, seed), { fill: C.teal, shade: '#1d7f78', line: ink, lw: 5.6, seed, t, hw: 4.6, tone: .7, sh: .3 });
  blob(g, rrect(-13, 46, 15, 24, 4, 2, seed + 1), { fill: C.yellow, line: ink, lw: 4, seed: seed + 1, t, hw: 4, tone: .9 });
  blob(g, rrect(34, -6, 116, 66, 30, 3, seed + 2), { fill: C.teal, shade: '#1d7f78', line: ink, lw: 6, seed: seed + 2, t, hw: 4.8, tone: .7, sh: .3 });
  [-8, 6, 20].forEach((dy, i) => line(g, [[-18, dy - 14], [-4, dy - 14]], { w: 4.4, col: '#1d7f78', seed: seed + 5 + i, t, spline: false, passes: 1, alpha: .8 }));
  blob(g, [[86, -32], [128, -42], [128, 36], [86, 26]], { fill: '#c9c8d2', shade: '#8d8c97', line: ink, lw: 5.6, seed: seed + 3, t, hw: 4.6, tone: .8, sh: .3 });
  blob(g, ellipse(128, -3, 8, 39, 8, 0, seed + 4), { fill: '#3a3947', line: ink, lw: 4.4, seed: seed + 4, t, hw: 4, tone: .95 });
  g.restore();
}
// Where a hand holds the dryer (in the dryer's own space) and where its mouth is from that grip, both in the units
// of whatever it is drawn in (Clawd's, at his hand).
export const DRYER = { grip: [-8, 46], mouth: [138, -49] };

// The dryer's cord: a sagging line from the handle to the plug, so it swings with what holds the dryer.
export function cord(g, t, pts, o = {}) {
  const { seed = 22, col = '#3a3947', w = 10 } = o;
  line(g, pts, { w, col, seed, t, spline: true, passes: 1, taper: [.02, .02], tooth: .5 });
}

// ---------------------------------------------------------------- the wind, and what it lifts
// Streaks of air from (x, y) at screen angle `ang`, spread over `spread` radians: pale strokes that slide away.
export function windStreaks(g, t, o = {}) {
  const { x = 0, y = 0, ang = -.5, len = 460, spread = .7, n = 8, k = 1, seed = 31, speed = 2.6, w = 13, col = '#6fa8d6', pick = () => true } = o;
  if (k <= .01) return;
  for (let i = 0; i < n; i++) {
    if (!pick(i)) continue;
    const u = n === 1 ? 0 : i / (n - 1) - .5;
    const a = ang + u * spread + (hash(seed, i, 1) - .5) * .12;
    const L = len * (.6 + .4 * hash(seed, i, 2));
    const ph = (t * speed + hash(seed, i, 3)) % 1;
    const pts = [];
    for (let j = 0; j <= 6; j++) {
      const d = L * j / 6, wv = Math.sin(j * .9 + i * 1.7) * 10 * (j / 6);
      pts.push([x + Math.cos(a) * d - Math.sin(a) * wv, y + Math.sin(a) * d + Math.cos(a) * wv]);
    }
    line(g, pts, { w: w * (.7 + .5 * hash(seed, i, 4)), col: i % 3 === 2 ? '#ffffff' : col, seed: seed + i, t, from: clamp(ph * 1.5 - .5), to: clamp(ph * 1.5), passes: 1, taper: [.35, .35], alpha: .9 * k, wob: 1 });
  }
}

// Fur and fluff that blow off him: little tufts that fly along the wind and fade. (x, y): where they leave from.
export function furTufts(g, t, o = {}) {
  const { x = 660, y = 800, k = 1, n = 9, seed = 41, dx = 560, dy = -170 } = o;
  if (k <= .01) return;
  for (let i = 0; i < n; i++) {
    const q = ((t * 1.25 + hash(seed, i, 1)) % 1);
    const px = x + (hash(seed, i, 2) - .3) * 120 + q * dx, py = y + (hash(seed, i, 3) - .5) * 200 + q * dy + Math.sin(q * 9 + i) * 26;
    const al = k * (1 - q * q), L = 44 + 20 * hash(seed, i, 4);
    line(g, [[px - L, py + L * .2 + 8], [px - L * .5, py + L * .05 - 5], [px, py]], { w: 14, col: COAT, seed: seed + i * 3, t, spline: true, passes: 1, taper: [.9, .05], alpha: al });
    line(g, [[px - L * .8, py + L * .3 + 14], [px - L * .35, py + L * .12 + 2], [px + 4, py + 5]], { w: 8, col: SHADE, seed: seed + i * 3 + 1, t, spline: true, passes: 1, taper: [.9, .05], alpha: al });
  }
}

// ---------------------------------------------------------------- the question
// A cone of light from `apex` down to a pool on the ground at (x, y), rx by ry: soft, pale, a little crayon in it.
export function spotBeam(g, t, o = {}) {
  const { apex = [540, 700], x = 540, y = 1300, rx = 200, ry = 60, k = 1, col = '#ffe98a', poolCol = '#fffbe2', seed = 47 } = o;
  if (k <= .01) return;
  g.save();
  const gr = g.createLinearGradient(0, apex[1], 0, y);
  gr.addColorStop(0, rgba(col, .10 * k)); gr.addColorStop(1, rgba(col, .55 * k));
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(apex[0] - 46, apex[1]); g.lineTo(apex[0] + 46, apex[1]); g.lineTo(x + rx, y); g.lineTo(x - rx, y); g.closePath(); g.fill();
  const rg = g.createRadialGradient(x, y, 0, x, y, rx);
  rg.addColorStop(0, rgba(poolCol, .96 * k)); rg.addColorStop(.72, rgba(poolCol, .8 * k)); rg.addColorStop(1, rgba(poolCol, 0));
  g.fillStyle = rg;
  g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y);
  g.beginPath(); g.arc(x, y, rx, 0, TAU); g.fill();
  g.restore();
  g.restore();
  // The crayon in the pool: loose pale strokes, so it is a drawing of light.
  g.save(); g.globalAlpha *= .8 * k;
  blob(g, ellipse(x, y, rx * .82, ry * .8, 16, 0, seed), { fill: poolCol, line: null, solid: false, seed, t, gap: 12, hw: 11, tone: 0, dens: .6 });
  g.restore();
}

// A soft glow round (x, y), for a close-up: one colour fading its alpha, so there is no pale ring.
export function softGlow(g, x, y, r, col, a) {
  if (a <= .01) return;
  g.save();
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(col, a)); gr.addColorStop(.55, rgba(col, a * .8)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  g.restore();
}

// Rays from (x, y): long strokes that fan out and turn slowly.
export function rays(g, t, x, y, o = {}) {
  const { r0 = 300, r1 = 1300, n = 20, col = '#f7d774', col2 = '#fff3c4', w = 46, k = 1, seed = 51, spin = .05 } = o;
  if (k <= .01) return;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + t * spin + (hash(seed, i) - .5) * .05;
    line(g, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * (r0 + r1) / 2, y + Math.sin(a) * (r0 + r1) / 2], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: w * (i % 2 ? .7 : 1), col: i % 2 ? col2 : col, seed: seed + i, t, spline: false, passes: 1, flat: true, tooth: .4, alpha: .55 * k });
  }
}

// A star in each of Clawd's eyes (drawn in his own space, on top of his glints): hopeful, shining.
export function eyeStars(g, t, o = {}) {
  const { r = 13, k = 1, seed = 61 } = o;
  if (k <= .01) return;
  [[-94, -200], [72, -197]].forEach(([ex, ey], i) => sparkle(g, ex, ey, r * k, t, { col: '#fbf8ef', seed: seed + i, rot: Math.PI / 8 }));
}

// A pointing hand for Clawd (drawn in his own space at his hand `h`): a fat mitten with one finger out along `ang`.
export function pointingHand(g, t, h, ang, o = {}) {
  const { seed = 71, k = 1, fill = '#d4643a', shade = '#a2452a' } = o;
  if (k <= .01) return;
  g.save(); g.translate(h[0], h[1]); g.scale(k, k);
  const fx = Math.cos(ang) * 46, fy = Math.sin(ang) * 46;
  blob(g, capsule([0, 0], [fx, fy], 14, 11, 5, seed), { fill, shade, line: ink, lw: 5.4, seed, t, hw: 4.4, tone: .6, sh: .3 });
  blob(g, ellipse(-Math.cos(ang) * 8, -Math.sin(ang) * 8, 36, 32, 9, 0, seed + 1), { fill, shade, line: ink, lw: 6, seed: seed + 1, t, hw: 4.8, tone: .6, sh: .3 });
  g.restore();
}
