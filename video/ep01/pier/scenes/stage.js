// Closer views of the gig: the band under the bandstand roof, Clawd at the mic in front of the
// fairground's lights, the crowd from the stage. And the hanging hook sign, lettered by hand with
// bulbs set along its strokes.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, glow, bulb, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, firework, INK } from '../kit.js';
import { nightSky, sea, beams, haze, ferrisWheel, town, washBand, twinkle } from '../world.js';
import { band, backingAt } from '../band.js';
import { clawd, mic, person, pen, nopen, tone } from '../cast.js';
import { lines, backing, STYLE } from '../lyrics.js';
import { letter, skeleton, measure, AUDIT } from '../hand.js';
import { crowdFront } from './crowd.js';
import { behind, facing, folk } from '../folk.js';

// Word onsets for the lyric line starting nearest `t0`.
export function wordTimes(t0) {
  let best = null;
  for (const l of lines()) if (!best || Math.abs(l.start - t0) < Math.abs(best.start - t0)) best = l;
  return best ? best.lead : [];
}

// Letters with bulbs: the word painted in `face`, then bulbs along its strokes, lit from `on`.
export function bulbWord(g, str, x, y, size, o = {}) {
  const t = o.t || 0;
  const on = o.on ?? 1;
  const w = o.w ?? .2;
  const face = on > .5 ? (o.face || '#ff4a6e') : shade(o.face || '#ff4a6e', -.55);
  if (AUDIT.on) AUDIT.ctx = { ...(AUDIT.ctx || {}), bulbs: true };
  letter(g, str, x, y, size, { align: 'center', w, col: face, shade: { col: shade(o.edge || '#7a1030', -.35), dx: .05, dy: .07 }, outline: { col: INK.col, w: .04 }, seed: o.seed ?? 11 });
  if (AUDIT.on && AUDIT.ctx) delete AUDIT.ctx.bulbs;
  const sk = skeleton(str, x, y, size, { align: 'center', w, step: o.step || size * .13, seed: o.seed ?? 11 });
  for (let k = 0; k < sk.pts.length; k++) {
    const [px, py] = sk.pts[k];
    const ch = o.chase ? .55 + .45 * (Math.sin(px * .03 - t * o.chase) > -.3 ? 1 : 0) : 1;
    bulb(g, px, py, size * (o.bulbR || .035), o.bulbCol || C.bulb, on * ch);
  }
}

// The hook sign: "MAKE IT GOOD FOR" then the question word, each lit as it's sung.
export function hookSign(g, t, lineT0, word, x, y, scale = 1, o = {}) {
  const ws = wordTimes(lineT0);
  const onsets = ws.map(w => w.s);
  const bw = 900 * scale, bh = 470 * scale;
  g.save();
  g.translate(x, y);
  g.rotate(Math.sin(t * 1.3) * .012);
  if (o.flipAt !== undefined && Math.abs(t - o.flipAt) < .14) g.scale(1, Math.max(.04, Math.abs(Math.cos((t - o.flipAt + .14) / .28 * Math.PI))));
  // Chains up to the rig.
  g.strokeStyle = rgba('#d8cce6', .7); g.lineWidth = 4 * scale;
  line(g, -bw * .38, -bh / 2, 0, -bh / 2 - 420); g.stroke(); line(g, bw * .38, -bh / 2, 0, -bh / 2 - 420); g.stroke();
  // The board: painted plum, a gold line inset, bulbs chasing round the edge.
  pen(g, 10 * scale, .9);
  const board = () => rr(g, -bw / 2, -bh / 2, bw, bh, 34 * scale);
  board(); g.fillStyle = '#2a1644'; g.fill();
  nopen(g); tone(g, board, '#2a1644', '#1c0e30', -12 * scale, -16 * scale);
  g.strokeStyle = '#f2cf7c'; g.lineWidth = 7 * scale; rr(g, -bw / 2 + 16 * scale, -bh / 2 + 16 * scale, bw - 32 * scale, bh - 32 * scale, 24 * scale); g.stroke();
  const per = 2 * (bw + bh) - 80 * scale, nb = 40;
  for (let i = 0; i < nb; i++) {
    let d = i / nb * per, px, py;
    const W2 = bw - 44 * scale, H2 = bh - 44 * scale;
    if (d < W2) { px = -W2 / 2 + d; py = -H2 / 2; }
    else if ((d -= W2) < H2) { px = W2 / 2; py = -H2 / 2 + d; }
    else if ((d -= H2) < W2) { px = W2 / 2 - d; py = H2 / 2; }
    else { d -= W2; px = -W2 / 2; py = H2 / 2 - d; }
    const on = (o.lit ?? 1) * (.4 + .6 * (Math.sin(i * .7 - t * 7) > 0 ? 1 : 0));
    bulb(g, px, py, 6 * scale, i % 2 ? C.bulb : C.pink, on);
  }
  // MAKE IT GOOD FOR: each word lettered in as it's sung.
  const small = ['Make', 'it', 'good', 'for'];
  const size1 = 66 * scale;
  const widths = small.map(s => measure(s, size1, .16)), gap = size1 * .42;
  let sx = -(widths.reduce((a, b) => a + b, 0) + gap * 3) / 2;
  small.forEach((s, i) => {
    const on = onsets[i] ?? lineT0;
    if (t >= on - .01) letter(g, s, sx, -bh * .235, size1, { col: '#ffe7b0', w: .16, shade: { col: '#140a22', dx: .05, dy: .06 }, progress: clamp((t - on) / .14), seed: 20 + i });
    sx += widths[i] + gap;
  });
  // The question word fills the board, lit a beat after it's sung.
  const bigOn = onsets[small.length] ?? (onsets[onsets.length - 1] ?? lineT0);
  let bs = 205 * scale;
  const bwid = measure(word, bs, .21);
  if (bwid > bw - 120 * scale) bs *= (bw - 120 * scale) / bwid;
  const lit = t < bigOn ? 0 : t < bigOn + .05 ? 1 : t < bigOn + .09 ? .3 : 1;
  if (t >= bigOn - .02) bulbWord(g, word, 0, bh * .35, bs, { t, on: lit, face: o.face || '#ff4a6e', w: .21, chase: 5, seed: 31 });
  g.restore();
}

// Backing vocals as pink hand lettering near the bots.
export function backingScript(g, t, lineT0, x, y, size = 58, col = STYLE.pink, o = {}) {
  backing(g, t, lineT0, x, y, size, col, o);
}

// The band, close: the bandstand's inside, bulbs along the valance, columns, beams, haze.
export function bandMedium(g, t, K, o = {}) {
  const fy = o.floorY ?? 1450;
  const bp = K.beatPos(t);
  const dawn = o.dawn || 0;
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, fy, [[0, mixHex('#12123a', '#43307a', dawn)], [.7, mixHex('#2a1a5a', '#c06a8a', dawn)], [1, mixHex('#4a2a6a', '#ffb088', dawn)]]);
  g.fillRect(0, 0, W, fy);
  for (let i = 0; i < 4; i++) washBand(g, 200 + i * 300, 260 + i * 300, '#ffffff', .03, i * 3);
  g.restore();
  ferrisWheel(g, t, 820, 520, 520, { rot: t * .05, on: 1 - dawn * .4 });
  beams(g, t, [
    { x: 160, y: 300, a: .35 + .25 * Math.sin(bp * Math.PI / 2), col: C.pink, len: 1500, w: .1 },
    { x: 920, y: 300, a: -.35 - .25 * Math.sin(bp * Math.PI / 2 + 1), col: C.cyan, len: 1500, w: .1 },
    { x: 540, y: 250, a: .08 * Math.sin(t), col: C.violet, len: 1300, w: .14, i: .7 },
  ], (o.energy ?? 1) * (1 - dawn * .5));
  haze(g, t, 0, 400, W, 900, C.violet, .2);
  // Stage floor: painted boards with a lip of light.
  g.save(); g.ink = null;
  g.fillStyle = '#efe0c4'; g.fillRect(0, fy, W, 26);
  g.fillStyle = vgrad(g, fy + 26, H, [[0, '#3a2342'], [1, '#150c1f']]); g.fillRect(0, fy + 26, W, H - fy - 26);
  g.strokeStyle = rgba(INK.col, .5); g.lineWidth = 2; for (let i = 1; i < 9; i++) { const y = fy + 26 + i * i * 7; line(g, 0, y, W, y); g.stroke(); }
  g.fillStyle = rgba(C.pink, .18); ellipse(g, 540, fy + 30, 520, 60); g.fill();
  g.restore();
  const back = o.back ?? 0;
  band(g, t, K, {
    grok: { x: 540, y: fy - 150, s: 190 },
    muse: { x: 145, y: fy + 10, s: 180 },
    molty: { x: 310, y: fy + 30, s: 230 },
    blossom: { x: 800, y: fy + 30, s: 215 },
    clawd: { x: 540, y: fy + 60, s: 330 },
  }, { energy: o.energy ?? 1, back, rim: C.cyan, rim2: C.pink, eyes: o.eyes });
  // Columns and the valance with bulbs, framing the shot.
  g.save();
  for (const x of [22, 1058]) {
    pen(g, 10, .8);
    const col = () => rr(g, x - 26, -20, 52, fy + 60, 10);
    col(); g.fillStyle = '#f2e8d6'; g.fill();
    nopen(g); tone(g, col, '#f2e8d6', '#bcae96', x < 540 ? -10 : 10, 0);
  }
  pen(g, 10, .8);
  g.fillStyle = '#f4ead8';
  g.beginPath(); g.moveTo(-20, 0); g.lineTo(W + 20, 0); g.lineTo(W + 20, 120);
  for (let i = 12; i >= 0; i--) { const x = i * W / 12; g.quadraticCurveTo(x + W / 24, 170, x, 120); }
  g.lineTo(-20, 120); g.closePath(); g.fill();
  nopen(g);
  g.fillStyle = '#d8414f'; g.fillRect(0, 0, W, 72);
  g.fillStyle = '#fbf1e2'; for (let i = 0; i < 12; i += 2) g.fillRect(i * W / 12, 0, W / 12, 72);
  g.restore();
  for (let i = 0; i < 18; i++) bulb(g, 30 + i * 60, 100, 8, i % 2 ? C.bulb : '#ffe9c2', .5 + .5 * (Math.sin(i * .8 - t * 5) > 0 ? 1 : .4));
  if (o.crowd) crowdFront(g, t, K, o.crowd, o);
}

// From the stage, over Clawd's shoulder: the pier packed back to the shore, faces lit, phone
// torches up, the huts' people at the front. The camera stands up on the stage, so the crowd falls
// away below it: the further back, the higher and smaller, with the sea either side of the pier.
// Everyone stands on the boards and the crowd is drawn from the back, so the overlaps come right.
// people: [{o, x, s, both}] for the front row.
export function crowdReverse(g, t, K, o = {}) {
  const bp = K.beatPos(t);
  const dawn = o.dawn || 0;
  const hz = 820, f = 1000, E = 5.2, HW = 5.8, zF = 95;
  const P = (xm, z) => [540 + f * xm / z, hz + f * E / z, f / z];
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, hz, [[0, mixHex('#10103a', '#3a3a8a', dawn)], [.7, mixHex('#2a1a5a', '#d08aa0', dawn)], [1, mixHex('#6a2a6a', '#ffc49a', dawn)]]);
  g.fillRect(0, 0, W, hz);
  for (let i = 0; i < 90; i++) { const a = (rnd(i, 601) > .2 ? 1 : .4) * (1 - dawn); if (rnd(i, 604) > .93) twinkle(g, rnd(i, 602) * W, rnd(i, 603) * hz * .85, 8, '#f4f2ff', a); else { g.fillStyle = rgba('#eceeff', .7 * a); g.fillRect(rnd(i, 602) * W, rnd(i, 603) * hz * .9, 2.4, 2.4); } }
  g.restore();
  if (o.fireworks !== false) {
    for (let k = 0; k < 3; k++) {
      const tb = K.beatAt(Math.floor(bp / 2) * 2 - k * 2);
      if (tb !== undefined) firework(g, t, tb, 180 + ((Math.floor(bp / 2) - k) * 263) % 720, 180 + ((Math.floor(bp / 2) - k) * 131) % 300, { color: [C.pink, C.cyan, C.gold][(Math.floor(bp / 2) - k + 3) % 3], color2: '#fff', n: 60, speed: 340, seed: Math.floor(bp / 2) - k });
    }
  }
  town(g, t, hz, { on: 1 - dawn * .5 });
  sea(g, t, hz, { dawn, reflections: [{ x: 70, col: C.amber, w: 14, a: .3 }, { x: 1010, col: C.amber, w: 14, a: .3 }] });
  // The deck, running back to the shore.
  const [xa, ya] = P(-HW, zF), [xb] = P(HW, zF), [xc, yc] = P(HW, 3.5), [xd] = P(-HW, 3.5);
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, ya, H, [[0, mixHex('#4a2c4a', '#b07a80', dawn)], [.3, mixHex('#2e1a36', '#7a4a60', dawn)], [1, mixHex('#1a0f22', '#3a2238', dawn)]]);
  poly(g, [[xa, ya], [xb, ya], [xc, yc], [xd, yc]]); g.fill();
  g.strokeStyle = rgba('#0e0716', .3); g.lineWidth = 1.5;
  for (let z = 7; z < zF; z *= 1.1) { const [x0, y0] = P(-HW, z), [x1] = P(HW, z); line(g, x0, y0, x1, y0); g.stroke(); }
  g.restore();
  // Railings and lamp posts down both sides, shrinking toward the shore.
  g.save();
  for (const sd of [-1, 1]) {
    g.ink = null; g.strokeStyle = '#150c1f';
    for (const hgt of [1.05, .55]) {
      g.lineWidth = hgt > 1 ? 4 : 3;
      g.beginPath(); let first = true;
      for (let z = 5.5; z <= zF; z *= 1.12) { const [x, y, k] = P(sd * HW, z); if (first) g.moveTo(x, y - hgt * k); else g.lineTo(x, y - hgt * k); first = false; }
      g.stroke();
    }
    for (let z = 6.5; z < zF; z *= 1.25) {
      const [x, y, k] = P(sd * (HW + .1), z);
      if (x < -60 || x > W + 60) continue;
      g.ink = null; g.fillStyle = '#150c1f'; rr(g, x - .07 * k, y - 3.9 * k, .14 * k, 3.9 * k, .04 * k); g.fill();
      bulb(g, x, y - 4 * k, Math.max(1.8, .15 * k), C.amber, 1 - dawn * .6);
    }
  }
  g.restore();
  // The crowd: a row every metre or so, further apart into the distance, each person jostled a
  // little out of line; drawn from the back.
  const folks = [];
  for (let z = 7.6, row = 0; z < 72; z += .75 + .05 * (z - 7.6), row++) {
    const dx = .8 + .022 * z, n = Math.max(3, Math.floor((2 * HW - .8) / dx));
    for (let i = 0; i < n; i++) {
      const id = row * 40 + i;
      folks.push({ id, xm: -HW + .4 + (i + .5) * (2 * HW - .8) / n + (rnd(id, 611) - .5) * dx * .55, z: z + (rnd(id, 612) - .5) * (.3 + z * .03) });
    }
  }
  folks.sort((a, b) => b.z - a.z);
  const nightC = mixHex('#170c24', '#9a6a88', dawn), voc = clamp(K.vocal(t));
  for (const p of folks) {
    const [x, fy, k] = P(p.xm, p.z);
    const s = .68 * k;
    if (x < -s * 1.5 || x > W + s * 1.5) continue;
    const near = clamp(1 - (p.z - 7.6) / 45);
    const hop = Math.max(0, Math.sin((bp + rnd(p.id, 606) * .3) * Math.PI)) * .1 * k;
    const pick = rnd(p.id, 607);
    const arm = pick > .8 ? (dawn > .5 ? 'wave' : 'torch') : pick > .66 ? 'wave' : pick > .56 ? 'fist' : 'down';
    facing(g, x, fy, s, { ...folk(p.id + 1200), lit: .32 + .46 * near + .12 * dawn, night: nightC, arm, side: rnd(p.id, 608) > .5 ? 1 : -1, both: pick > .62 && pick < .66, up: .6 + .4 * Math.sin((bp + rnd(p.id, 609)) * Math.PI), hop, mouth: .25 + .7 * voc * rnd(p.id, 610), eyes: rnd(p.id, 613) > .5 ? 'happy' : 'open' });
  }
  // The huts' people in the front row, standing just below the stage.
  for (const p of (o.people || [])) {
    const hop = Math.max(0, Math.sin((bp + p.x * .001) * Math.PI)) * 12;
    const pt = o.point;
    person(g, p.x, hz + E * (p.s || 118) / .68 - hop, { s: p.s || 118, ...p.o, full: true, eyes: 'happy', mouth: .4 + .5 * voc, armR: pt ? -1.75 : -2.6 + .3 * Math.sin(bp * Math.PI), armL: pt ? (p.both ? -1.75 : .3) : p.both ? -2.6 : .3, look: pt ? [(760 - p.x) / 600, .6] : [0, 0], shadow: false });
  }
  // The stage lights wash over the front of the crowd.
  const lip = 1690;
  g.save(); g.ink = null; g.globalCompositeOperation = 'screen';
  g.fillStyle = vgrad(g, 1000, lip, [[0, rgba(C.pink, 0)], [1, rgba(C.pink, .16)]]);
  g.fillRect(0, 1000, W, lip - 1000);
  g.restore();
  // The front of the stage, where we stand: footlights along its lip, boards running out to it.
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, lip, H, [[0, mixHex('#3a2342', '#7a4a52', dawn)], [1, mixHex('#150c1f', '#3a2030', dawn)]]);
  g.fillRect(0, lip, W, H - lip);
  g.strokeStyle = rgba('#0c0612', .5); g.lineWidth = 3;
  for (let i = -9; i <= 9; i++) { const xb = 540 + i * 140; line(g, xb, H + 20, 540 + (xb - 540) * (lip - hz) / (H + 20 - hz), lip); g.stroke(); }
  g.restore();
  g.save(); pen(g, 8, .7); g.fillStyle = '#efe0c4'; g.fillRect(-10, lip - 16, W + 20, 20); g.restore();
  for (let i = 0; i < 15; i++) bulb(g, 36 + i * 72, lip + 12, 7, i % 2 ? C.bulb : '#ffe9c2', .75 + .25 * (Math.sin(i * .9 - t * 4) > 0 ? 1 : .5));
  g.save();
  g.strokeStyle = '#2a2840'; g.lineWidth = 16; g.lineCap = 'round'; line(g, 690, H, 700, 1560); g.stroke();
  g.restore();
  clawd(g, 830, 2010, { s: 500, back: true, armL: -1.2, armR: -.2 - .25 * Math.pow(1 - bp % 1, 3), squash: .04 * Math.pow(1 - bp % 1, 3), shadow: false, holdL: (g2, u) => mic(g2, u, { rot: .9 }) });
}

// Clawd at the mic, big, with the fairground behind dissolving into loose dabs of painted light.
export function clawdClose(g, t, K, o = {}) {
  const bp = K.beatPos(t);
  const dawn = o.dawn || 0;
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, H, [[0, mixHex('#12103a', '#4a3a8a', dawn)], [.6, mixHex('#2c1560', '#d0708a', dawn)], [1, mixHex('#170a24', '#5a3040', dawn)]]);
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++) washBand(g, 150 + i * 330, 230 + i * 330, i % 2 ? '#000' : '#fff', .04, i * 7);
  // The lights behind, out of focus the way a painter does it: soft dabs, a few bright cores.
  for (let i = 0; i < 34; i++) {
    const x = (rnd(i, 401) * 1.3 - .15) * W + Math.sin(t * .4 + i) * 10, y = rnd(i, 402) * 1100 + 60;
    const r = 34 + 70 * rnd(i, 403);
    const col = [C.pink, C.bulb, C.cyan, C.violet, C.amber][i % 5];
    const a = .45 + .25 * Math.sin(t * 1.5 + i) + .2 * K.kick(t);
    glow(g, x, y, r * 1.4, col, a);
    g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgba(mix(col, '#ffffff', .5), .3 * a); circle(g, x, y, r * .32); g.fill(); g.restore();
  }
  g.restore();
  beams(g, t, [
    { x: 100, y: -50, a: .3 + .2 * Math.sin(bp * Math.PI / 2), col: C.pink, len: 1800, w: .08 },
    { x: 980, y: -50, a: -.3 - .2 * Math.sin(bp * Math.PI / 2 + 1), col: C.cyan, len: 1800, w: .08 },
  ], .8 * (o.energy ?? 1));
  const voc = clamp(K.vocal(t) * 1.15);
  const bounce = Math.pow(1 - bp % 1, 3) * (o.energy ?? 1);
  g.save();
  g.strokeStyle = '#2a2840'; g.lineWidth = 16; g.lineCap = 'round';
  line(g, 640, 1920, 630, 1330); g.stroke();
  g.restore();
  const s = o.s || 600;
  const held = voc > .5 && K.vocal(t - .25) > .5;
  clawd(g, 540, o.y ?? 1860, {
    s, t, squash: bounce * .05,
    eyes: o.eyes || (held ? 'closed' : voc > .15 ? 'open' : 'happy'), mouth: voc,
    armR: -1.05, armL: -.35 - bounce * .35, hold: (g2, u) => mic(g2, u, { rot: -1.2 }),
    blush: .5, blink: 0, look: [0, -.2], ...(o.clawd || {}),
  });
  // The front of the crowd at the bottom corners, filming: the backs of their heads, and their
  // phones up, each screen showing the stage.
  if (o.crowd) for (const [x, side, j] of [[30, 1, 0], [235, -1, 1], [860, 1, 2], [1060, -1, 3]]) {
    const f = folk(j + 700), k = 690 + 40 * (j % 2);
    const hop = Math.max(0, Math.sin((bp + j * .2) * Math.PI)) * 16;
    behind(g, x, 1815 + (f.H - .15) * k, k, { ...f, lit: .2 + dawn * .2, rim: side > 0 ? C.cyan : C.pink, rimA: .75, arm: 'phone', side, up: .45 + .1 * Math.sin(t * 1.1 + j), hop, sway: t * 1.6 + j, glow: 1 });
  }
}
