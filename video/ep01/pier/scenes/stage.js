// Closer views of the gig: the band under the bandstand roof, Clawd at the mic in front of the
// fairground's lights, the crowd from the stage. And the hanging hook sign, lettered by hand with
// bulbs set along its strokes.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, glow, bulb, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, firework, INK } from '../kit.js';
import { nightSky, sea, beams, haze, ferrisWheel, town, washBand, twinkle } from '../world.js';
import { band, backingAt } from '../band.js';
import { clawd, mic, person, pen, nopen, tone } from '../cast.js';
import { lines, backing, STYLE } from '../lyrics.js';
import { letter, skeleton, measure } from '../hand.js';
import { crowdFront } from './crowd.js';

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
  letter(g, str, x, y, size, { align: 'center', w, col: face, shade: { col: shade(o.edge || '#7a1030', -.35), dx: .05, dy: .07 }, outline: { col: INK.col, w: .04 }, seed: o.seed ?? 11 });
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
export function backingScript(g, t, lineT0, x, y, size = 58, col = STYLE.pink) {
  backing(g, t, lineT0, x, y, size, col);
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

// From the stage, over Clawd's shoulder: the whole pier full, faces lit, the huts' people at the
// front. people: [{o, x}] for the front row.
export function crowdReverse(g, t, K, o = {}) {
  const bp = K.beatPos(t);
  const dawn = o.dawn || 0;
  const hz = 820;
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, hz, [[0, mixHex('#10103a', '#3a3a8a', dawn)], [.7, mixHex('#2a1a5a', '#d08aa0', dawn)], [1, mixHex('#6a2a6a', '#ffc49a', dawn)]]);
  g.fillRect(0, 0, W, hz);
  for (let i = 0; i < 90; i++) { const a = (rnd(i, 601) > .2 ? 1 : .4) * (1 - dawn); if (rnd(i, 604) > .93) twinkle(g, rnd(i, 602) * W, rnd(i, 603) * hz * .85, 8, '#f4f2ff', a); else { g.fillStyle = rgba('#eceeff', .7 * a); g.fillRect(rnd(i, 602) * W, rnd(i, 603) * hz * .9, 2.4, 2.4); } }
  g.restore();
  town(g, t, hz, { on: 1 - dawn * .5 });
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, hz, H, [[0, '#3a2440'], [1, '#120a18']]);
  g.fillRect(0, hz, W, H - hz);
  // The pier running back to shore: lamps shrinking into the distance.
  for (let i = 0; i < 9; i++) {
    const z = 1 - i / 9;
    for (const s of [-1, 1]) {
      const x = 540 + s * (80 + 520 * z * z), y = hz + 30 + 520 * z * z - 200 * z * z - 20;
      glow(g, x, y, 80 * z + 12, C.amber, .6);
      g.fillStyle = '#ffe9b8'; circle(g, x, y, 6 * z + 2.4); g.fill();
    }
  }
  g.restore();
  if (o.fireworks !== false) {
    for (let k = 0; k < 3; k++) {
      const tb = K.beatAt(Math.floor(bp / 2) * 2 - k * 2);
      if (tb !== undefined) firework(g, t, tb, 180 + ((Math.floor(bp / 2) - k) * 263) % 720, 180 + ((Math.floor(bp / 2) - k) * 131) % 300, { color: [C.pink, C.cyan, C.gold][(Math.floor(bp / 2) - k + 3) % 3], color2: '#fff', n: 60, speed: 340, seed: Math.floor(bp / 2) - k });
    }
  }
  // The crowd facing us, rows receding: painted heads and shoulders, some phones up.
  const skins = ['#f6d0b1', '#e8b48f', '#c98d67', '#a86b4a', '#7c4a32', '#5b3526'];
  const tops = ['#5a4bff', '#ff6a8a', '#2fbfa0', '#ffb13b', '#b06bff', '#48a0ff', '#ff7a59'];
  const hairs = ['#1b1420', '#3a2418', '#5a3a20', '#141018', '#8a6a4a', '#2a1c2a'];
  g.save();
  for (let r = 8; r >= 1; r--) {
    const z = r / 9;
    const y = hz + 60 + 900 * (1 - z) * (1 - z) * .9 + 40;
    const s = 12 + 90 * (1 - z) * (1 - z);
    const n = Math.round(6 + 20 * z);
    const lit = .35 + .65 * (1 - z);
    g.ink = s > 30 ? INK.col : null; g.inkW = Math.max(1, s * .05);
    for (let i = 0; i < n; i++) {
      const x = (i + .5 + (r % 2) * .5) / n * W + (rnd(i + r * 50, 605) - .5) * 30;
      const hop = Math.max(0, Math.sin((bp + rnd(i, 606) * .3) * Math.PI)) * s * .25;
      const k = i + r * 50;
      g.fillStyle = mix('#170c24', tops[k % tops.length], lit * .85);
      rr(g, x - s * .55, y - s * 1.2 - hop, s * 1.1, s * 2, s * .4); g.fill();
      g.fillStyle = mix('#170c24', skins[k % skins.length], lit);
      circle(g, x, y - s * 1.5 - hop, s * .42); g.fill();
      g.fillStyle = mix('#170c24', hairs[k % hairs.length], lit);
      g.beginPath(); g.ellipse(x, y - s * 1.66 - hop, s * .44, s * .28, 0, Math.PI, TAU); g.fill();
      if (rnd(k, 607) > .6) { glow(g, x + s * .6, y - s * 2.4 - hop, s * 1, '#e8f0ff', .45 * lit); g.fillStyle = '#f4f8ff'; rr(g, x + s * .5, y - s * 2.6 - hop, s * .22, s * .38, s * .05); g.fill(); }
    }
  }
  g.restore();
  for (const p of (o.people || [])) {
    const hop = Math.max(0, Math.sin((bp + p.x * .001) * Math.PI)) * 12;
    const pt = o.point;
    person(g, p.x, 1560 - hop, { s: p.s || 118, ...p.o, eyes: 'happy', mouth: .4 + .5 * clamp(K.vocal(t)), armR: pt ? -1.75 : -2.6 + .3 * Math.sin(bp * Math.PI), armL: pt ? (p.both ? -1.75 : .3) : p.both ? -2.6 : .3, look: pt ? [(760 - p.x) / 600, .6] : [0, 0], shadow: false });
  }
  g.save(); g.ink = null; g.globalCompositeOperation = 'screen';
  g.fillStyle = rgba(C.pink, .12); g.fillRect(0, 1250, W, H - 1250);
  g.restore();
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
  if (o.crowd) for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1, k = Math.floor(i / 2);
    const x = 540 + side * (400 + k * 60), up = .6 + .4 * Math.sin((bp + i * .2) * Math.PI);
    const hy = 1560 - up * 120 - k * 70;
    g.save();
    g.strokeStyle = '#120a1c'; g.lineWidth = 50; g.lineCap = 'round';
    line(g, x + side * 60, H + 40, x, hy); g.stroke();
    g.fillStyle = '#120a1c'; circle(g, x, hy - 10, 34); g.fill();
    if (i % 3 !== 1) { glow(g, x, hy - 70, 110, '#dfe8ff', .5); pen(g, 6, .6); g.fillStyle = '#eef4ff'; rr(g, x - 20, hy - 110, 40, 70, 8); g.fill(); }
    g.restore();
  }
}
