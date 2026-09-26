// The pier at night, seen straight down its length: lamps and bulb strings converge on the
// bandstand at the far end, the Ferris wheel towers behind, the sea glitters either side.
import { W, H, C, TAU, clamp, lerp, smooth, rnd, rr, circle, ellipse, line, poly, glow, bulb, vgrad, rgrad, lgrad, rgba, mix, mixHex, firework } from '../kit.js';
import { nightSky, sea, reflection, bandstand, ferrisWheel, lighthouse, beams, town, haze } from '../world.js';
import { band } from '../band.js';

// Camera: horizon hz, vanishing x, focal length f, eye height h (metres above the deck).
export function camera(o = {}) {
  const cam = { hz: o.hz ?? 1010, vx: o.vx ?? 540, f: o.f ?? 1650, h: o.h ?? 1.6 };
  cam.p = (xw, yw, z) => [cam.vx + cam.f * xw / z, cam.hz + cam.f * (cam.h - yw) / z, cam.f / z];
  return cam;
}

// Fireworks schedule for a stretch of time: bursts every beat or two, seeded.
export function fireworks(g, t, t0, t1, K, o = {}) {
  const cols = o.cols || [[C.pink, C.gold], [C.cyan, '#ffffff'], [C.gold, C.coral], [C.violet, C.cyan], [C.lime, '#ffffff']];
  const every = o.every || 2;
  const first = Math.ceil(K.beatPos(t0) / every) * every;
  for (let b = first; ; b += every) {
    const tb = K.beatAt(Math.round(b));
    if (tb === undefined || tb > t1 || tb > t) break;
    if (t - tb > 2.4) continue;
    const i = Math.round(b);
    const [c1, c2] = cols[i % cols.length];
    const x = o.x0 + rnd(i, 91) * (o.x1 - o.x0), y = o.y0 + rnd(i, 92) * (o.y1 - o.y0);
    firework(g, t, tb, x, y, { color: c1, color2: c2, n: 60 + (i % 3) * 20, speed: 330 + 220 * rnd(i, 93), seed: i, w: 3 });
  }
}

// o: { crowd: 0..1, dawn: 0..1, band: pos override, energy, back, fireworks: bool, empty props }
// When the lights come on: 0 before `ignite + delay`, a flicker, then full.
function igniteAt(t, ign, delay) {
  if (ign === undefined) return 1;
  const d = t - ign - delay;
  if (d < 0) return 0;
  if (d < .1) return d < .03 ? 1 : d < .06 ? .3 : 1;
  return 1;
}

export function pierWide(g, t, K, o = {}) {
  const cam = camera(o.cam);
  const { hz } = cam;
  const dawn = o.dawn || 0;
  const ig = d => igniteAt(t, o.ignite, d);
  const kick = clamp((K.env('low', t) - .5) * 2);
  nightSky(g, t, { horizon: hz, moon: { x: 205, y: 300, r: 54 }, dawn, stars: 1 - dawn });
  lighthouse(g, t, 120, hz + 4, 150, { beamA: t * .7 + 1, beamLen: 700, on: 1 - dawn * .7 });
  town(g, t, hz, { on: 1 - dawn * .6 });
  // The Ferris wheel on the right, far behind the bandstand.
  const [wx, wy, wk] = cam.p(13, 18, 46);
  const WR = 16 * wk;
  // Reflections of everything bright.
  sea(g, t, hz, { dawn, reflections: [
    { x: wx, col: C.pink, w: 40, a: .45 }, { x: wx - WR * .7, col: C.cyan, w: 26, a: .4 }, { x: wx + WR * .5, col: C.bulb, w: 26, a: .35 },
    { x: 205, col: C.moon, w: 30, a: .55 }, { x: 120, col: '#fff3c4', w: 12, a: .3 }, { x: 60, col: C.amber, w: 14, a: .3 },
  ] });
  if (o.fireworks !== false) fireworks(g, t, o.fw0 ?? 0, o.fw1 ?? 1e9, K, { x0: 120, x1: 700, y0: 170, y1: 560, every: o.fwEvery || 2 });
  ferrisWheel(g, t, wx, wy, WR, { rot: t * .05, chase: 3, on: .15 + .85 * ig(.42) });
  // Searchlights from the end of the pier.
  const bp = K.beatPos(t);
  const [bx, by, bk] = cam.p(0, 0, 24);
  beams(g, t, [
    { x: bx - 150, y: by - 360, a: Math.PI + .55 + .3 * Math.sin(bp * Math.PI / 4), col: C.pink, len: 1500, w: .12 },
    { x: bx + 150, y: by - 360, a: Math.PI - .5 + .3 * Math.sin(bp * Math.PI / 4 + 2), col: C.cyan, len: 1500, w: .12 },
  ], (o.energy ?? 1) * (1 - dawn * .6) * ig(.5) * (.75 + .45 * kick));
  // The deck.
  const zNear = 2.6, zFar = 24, hw = 4.2;
  const P = (x, y, z) => cam.p(x, y, z);
  const [a1] = P(-hw, 0, zFar), [a2] = P(hw, 0, zFar);
  const yFar = P(0, 0, zFar)[1];
  g.fillStyle = vgrad(g, yFar, H, [[0, mixHex('#6a3c5c', '#b98b86', dawn)], [.25, mixHex('#3a2340', '#7a5a70', dawn)], [1, mixHex('#140b1c', '#3a2c40', dawn)]]);
  poly(g, [[a1, yFar], [a2, yFar], [P(hw, 0, zNear)[0], P(0, 0, zNear)[1]], [P(-hw, 0, zNear)[0], P(0, 0, zNear)[1]]]); g.fill();
  // Planks across.
  g.lineWidth = 2;
  for (let z = zFar; z > zNear; z -= .5) {
    const [xl, y] = P(-hw, 0, z), [xr] = P(hw, 0, z);
    g.strokeStyle = rgba('#0b0510', .35 + .2 * (z % 1 < .5));
    line(g, xl, y, xr, y); g.stroke();
  }
  // Reflections of the bandstand and lamps on the wet boards.
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = lgrad(g, 0, yFar, 0, H, [[0, rgba(C.bulb, .4)], [.4, rgba(C.pink, .12)], [1, rgba(C.pink, 0)]]);
  poly(g, [[bx - 120, yFar], [bx + 120, yFar], [bx + 380, H], [bx - 380, H]]); g.fill();
  g.restore();
  // Rails and lamp posts, far to near, with bulb strings between the lamps and across the deck.
  const lamps = [];
  for (let z = zFar - 1; z >= 3; z -= 3.5) lamps.push(z);
  const lampTop = z => P(0, 4.2, z)[1];
  // Rails.
  for (const s of [-1, 1]) {
    g.strokeStyle = '#1b1024'; g.lineWidth = 3;
    const pts = []; for (let z = zFar; z >= zNear; z -= .5) pts.push(P(s * hw, 1.05, z));
    g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineWidth = 5; g.stroke();
    for (let z = zFar; z >= zNear; z -= .6) { const [x, y1, k] = P(s * hw, 1.05, z); const [, y0] = P(s * hw, 0, z); g.lineWidth = Math.max(1.5, .06 * k); line(g, x, y0, x, y1); g.stroke(); }
  }
  // Overhead bulb canopy: strings zig-zag across between lamp tops.
  const drawLamp = (s, z) => {
    const [x, y0, k] = P(s * hw, 0, z), [, y1] = P(s * hw, 4.2, z);
    g.fillStyle = '#1a1024'; rr(g, x - .07 * k, y1, .14 * k, y0 - y1, .05 * k); g.fill();
    const gx = x - s * .35 * k, gy = y1 + .1 * k;
    g.strokeStyle = '#1a1024'; g.lineWidth = .05 * k; line(g, x, y1 + .1 * k, gx, gy); g.stroke();
    glow(g, gx, gy, 1.6 * k, C.amber, .5 * (1 - dawn * .5));
    g.fillStyle = rgrad(g, gx, gy, 0, .2 * k, [[0, '#fffbe8'], [1, '#ffc46a']]);
    circle(g, gx, gy, .17 * k); g.fill();
  };
  for (let i = 0; i < lamps.length; i++) {
    const z = lamps[i];
    const zN = lamps[i + 1];
    for (const s of [-1, 1]) drawLamp(s, z);
    const [lx, ly] = P(-hw, 4.2, z), [rx, ry] = P(hw, 4.2, z);
    const k = P(0, 0, z)[2];
    const chase = (on, j) => .45 + .55 * (Math.sin(j * .9 - t * 5 + i) > -.2 ? 1 : 0);
    // Across.
    // The lights race from the near end of the pier to the bandstand when they come on.
    const lit = ig((1 - i / Math.max(1, lamps.length - 1)) * .3);
    stringBulbs(g, t, lx, ly, rx, ry, .9 * k, 14, .06 * k, i, dawn, lit);
    // Along each rail to the next lamp.
    if (zN) for (const s of [-1, 1]) { const [x1, y1] = P(s * hw, 4.2, z), [x2, y2] = P(s * hw, 4.2, zN); stringBulbs(g, t, x1, y1, x2, y2, .45 * P(0, 0, (z + zN) / 2)[2], 8, .07 * P(0, 0, (z + zN) / 2)[2], i + 7, dawn); }
  }
  // The bandstand at the end, and the band.
  const bsW = 11 * bk;
  const floorInfo = bandstand(g, t, bx, by, bsW, {
    chase: 3, inner: C.violet, floorLight: C.pink, on: .1 + .9 * ig(.33),
    roofLight: { dx: .4, col: C.cyan },
    band: floorY => {
      if (o.bandOff) return;
      const s = bsW / 820;
      band(g, t, K, {
        grok: { x: bx + 30 * s, y: floorY - 18 * s, s: 120 * s },
        muse: { x: bx - 250 * s, y: floorY, s: 105 * s },
        molty: { x: bx - 140 * s, y: floorY, s: 135 * s },
        blossom: { x: bx + 175 * s, y: floorY, s: 125 * s },
        clawd: { x: bx, y: floorY + 4 * s, s: 185 * s },
      }, { energy: o.energy ?? 1, back: o.back ?? 0, rim: C.cyan, rim2: C.pink });
    },
  });
  if (o.crowd) crowd(g, t, K, cam, o.crowd, o);
  if (o.seagull) seagull(g, t, o.seagull.x, o.seagull.y, o.seagull.s || 1);
  haze(g, t, 0, hz - 300, W, 600, C.violet, .12);
}

function stringBulbs(g, t, x1, y1, x2, y2, sag, n, r, seed, dawn, lit = 1) {
  g.strokeStyle = 'rgba(15,8,20,.7)'; g.lineWidth = Math.max(1, r * .25);
  g.beginPath();
  for (let i = 0; i <= 20; i++) { const p = i / 20; const x = lerp(x1, x2, p), y = lerp(y1, y2, p) + Math.sin(p * Math.PI) * sag; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  const cols = [C.bulb, '#ffe7b8', C.bulb, '#ffc0a0'];
  for (let i = 0; i < n; i++) {
    const p = (i + .5) / n;
    const x = lerp(x1, x2, p), y = lerp(y1, y2, p) + Math.sin(p * Math.PI) * sag + r * 1.3;
    const on = lit * (1 - dawn * .6) * (.6 + .4 * (Math.sin(i * 1.3 + seed - t * 4) > 0 ? 1 : 0));
    bulb(g, x, y, Math.max(1.4, r), cols[(i + seed) % cols.length], on);
  }
}

// A lone seagull standing on the deck, looking about.
export function seagull(g, t, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const look = Math.sin(t * 1.3) > .3 ? 1 : -1;
  g.scale(look, 1);
  g.fillStyle = 'rgba(0,0,0,.3)'; ellipse(g, 0, 2, 26, 5); g.fill();
  g.strokeStyle = '#e8a33a'; g.lineWidth = 3; line(g, -5, -2, -5, -18); g.stroke(); line(g, 5, -2, 5, -18); g.stroke();
  g.fillStyle = '#f3f1f6'; ellipse(g, 0, -30, 26, 15, -.1); g.fill();
  g.fillStyle = '#b9bccb'; ellipse(g, -6, -33, 20, 9, -.15); g.fill();
  g.fillStyle = '#2b2d3a'; g.beginPath(); g.moveTo(-22, -34); g.lineTo(-40, -28); g.lineTo(-20, -28); g.fill();
  g.fillStyle = '#f7f5fa'; circle(g, 18, -46, 11); g.fill();
  g.fillStyle = '#f2b23a'; g.beginPath(); g.moveTo(27, -47); g.lineTo(40, -44); g.lineTo(27, -41); g.fill();
  g.fillStyle = '#1b1b24'; circle(g, 21, -48, 2.2); g.fill();
  g.restore();
}

// A crowd on the deck, seen from behind: backlit heads and shoulders filling the pier to the
// bandstand, hands up on the beat, phone torches. Positions use a slightly raised eye so the
// rows spread up the frame instead of all heads sitting on the horizon.
export function crowd(g, t, K, cam, amount, o = {}) {
  const bp = K.beatPos(t);
  const eye = 3.1;
  const n = Math.round(150 * amount);
  const items = [];
  for (let i = 0; i < n; i++) items.push({ i, z: 5.5 + Math.pow(rnd(i, 101), .75) * 16.5, x: (rnd(i, 102) - .5) * 7.8 });
  items.sort((a, b) => b.z - a.z);
  const hairs = ['#1b1420', '#3a2418', '#5a3a20', '#141018', '#8a6a4a', '#2a1c2a'];
  const tops = ['#2a1a4a', '#3a1a3a', '#1a2a4a', '#2a2438', '#40203a', '#1f2f3f'];
  for (const it of items) {
    const k = cam.f / it.z;
    const x = cam.vx + cam.f * it.x / it.z;
    const headY = cam.hz + cam.f * (eye - 1.55) / it.z;
    const hop = Math.max(0, Math.sin((bp + rnd(it.i, 103) * .3) * Math.PI)) * .1 * k * (o.energy ?? 1);
    const cy = headY - hop, hr = .12 * k;
    const near = clamp(1 - (it.z - 5.5) / 16);
    const body = mix('#07040d', tops[it.i % tops.length], .25 + .3 * (1 - near));
    // Shoulders and back.
    g.fillStyle = body;
    rr(g, x - .27 * k, cy + hr * .7, .54 * k, 1.4 * k, .16 * k); g.fill();
    // Head, from behind: all hair.
    g.fillStyle = mix('#07040d', hairs[it.i % hairs.length], .5 + .3 * (1 - near));
    circle(g, x, cy, hr); g.fill();
    // Stage light catching the tops of heads and shoulders.
    const rim = it.i % 3 === 0 ? C.cyan : it.i % 3 === 1 ? C.pink : C.bulb;
    g.strokeStyle = rgba(rim, .35 + .35 * (1 - near)); g.lineWidth = Math.max(1.2, .025 * k);
    g.beginPath(); g.arc(x, cy, hr, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    g.beginPath(); g.moveTo(x - .25 * k, cy + hr * 1.1); g.quadraticCurveTo(x, cy + hr * .75, x + .25 * k, cy + hr * 1.1); g.stroke();
    // Hands up with the beat; some hold phones up.
    if (rnd(it.i, 104) > .5) {
      const up = .55 + .45 * Math.sin((bp + rnd(it.i, 105)) * Math.PI);
      const s = rnd(it.i, 106) > .5 ? 1 : -1;
      const hx = x + s * (.2 + .1 * up) * k, hy = cy - (.3 + .28 * up) * k;
      g.strokeStyle = body; g.lineWidth = .08 * k; g.lineCap = 'round';
      line(g, x + s * .2 * k, cy + hr * 1.3, hx, hy); g.stroke();
      if (rnd(it.i, 107) > .45) { glow(g, hx, hy - .05 * k, .45 * k, '#e8f0ff', .35); g.fillStyle = '#f4f8ff'; rr(g, hx - .035 * k, hy - .13 * k, .07 * k, .12 * k, .015 * k); g.fill(); }
      else { g.fillStyle = body; circle(g, hx, hy, .045 * k); g.fill(); }
    }
  }
}
