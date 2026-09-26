// Closer views of the gig: the band under the bandstand roof, and Clawd at the mic in front of a
// blur of fairground light. Plus the hanging hook sign.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, glow, bulb, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, firework } from '../kit.js';
import { nightSky, sea, beams, haze, ferrisWheel, town } from '../world.js';
import { band, backingAt } from '../band.js';
import { clawd, mic, person } from '../cast.js';
import { bulbText, measureBulb } from '../sign.js';
import { lines } from '../lyrics.js';
import { crowdFront } from './crowd.js';

// Word onsets for the lyric line starting nearest `t0`.
export function wordTimes(t0) {
  let best = null;
  for (const l of lines()) if (!best || Math.abs(l.start - t0) < Math.abs(best.start - t0)) best = l;
  return best ? best.lead : [];
}

// The hook sign: "MAKE IT GOOD FOR" then the question word, each lit as it's sung.
export function hookSign(g, t, lineT0, word, x, y, scale = 1, o = {}) {
  const ws = wordTimes(lineT0);
  const onsets = ws.map(w => w.s);
  const small = 'MAKE IT GOOD FOR', big = word;
  // Board.
  const bw = 900 * scale, bh = 470 * scale;
  g.save();
  g.translate(x, y);
  g.rotate(Math.sin(t * 1.3) * .012);
  // The board flips over (like a departures board) when the answer replaces the question.
  if (o.flipAt !== undefined && Math.abs(t - o.flipAt) < .14) g.scale(1, Math.max(.04, Math.abs(Math.cos((t - o.flipAt + .14) / .28 * Math.PI))));
  // Chains up to the rig.
  g.strokeStyle = 'rgba(200,190,220,.5)'; g.lineWidth = 3 * scale;
  line(g, -bw * .38, -bh / 2, -bw * .45, -bh / 2 - 400); g.stroke(); line(g, bw * .38, -bh / 2, bw * .45, -bh / 2 - 400); g.stroke();
  g.fillStyle = vgrad(g, -bh / 2, bh / 2, [[0, '#2a1640'], [1, '#12091f']]);
  rr(g, -bw / 2, -bh / 2, bw, bh, 34 * scale); g.fill();
  g.strokeStyle = '#f4d58a'; g.lineWidth = 6 * scale; rr(g, -bw / 2 + 14 * scale, -bh / 2 + 14 * scale, bw - 28 * scale, bh - 28 * scale, 24 * scale); g.stroke();
  // Border bulbs chasing.
  const per = 2 * (bw + bh) - 80 * scale;
  const nb = 44;
  for (let i = 0; i < nb; i++) {
    let d = i / nb * per, px, py;
    const W2 = bw - 40 * scale, H2 = bh - 40 * scale;
    if (d < W2) { px = -W2 / 2 + d; py = -H2 / 2; }
    else if ((d -= W2) < H2) { px = W2 / 2; py = -H2 / 2 + d; }
    else if ((d -= H2) < W2) { px = W2 / 2 - d; py = H2 / 2; }
    else { d -= W2; px = -W2 / 2; py = H2 / 2 - d; }
    const on = (o.lit ?? 1) * (.4 + .6 * (Math.sin(i * .7 - t * 7) > 0 ? 1 : 0));
    bulb(g, px, py, 5.5 * scale, i % 2 ? C.bulb : C.pink, on);
  }
  // Small line, word by word.
  const smallWords = small.split(' ');
  const perWord = smallWords.map((w, i) => onsets[i] ?? onsets[0] ?? lineT0);
  const onAt = [];
  smallWords.forEach((w, i) => { for (const ch of w) onAt.push(perWord[i]); if (i < smallWords.length - 1) onAt.push(perWord[i]); });
  bulbText(g, small, 0, -bh * .2, 64 * scale, { onAt, t, face: '#ffe7b0', edge: '#8a5a20', bulbCol: '#fff4d8', spacing: 11 * scale, glowA: .4, depth: 3 * scale });
  const bigOn = onsets[smallWords.length] ?? (onsets[onsets.length - 1] ?? lineT0);
  // The big word fills the board but never spills over its edge.
  let bs = 250 * scale;
  const bwid = measureBulb(big, bs, { spacing: 26 * scale });
  if (bwid > bw - 90 * scale) bs *= (bw - 90 * scale) / bwid;
  bulbText(g, big, 0, bh * .36, bs, { t0: bigOn, letterGap: .05, t, face: o.face || '#ff4a6e', edge: '#7a1030', bulbCol: C.bulb, spacing: 26 * scale * bs / (250 * scale), chase: 5, depth: 12 * scale });
  g.restore();
}

// Backing vocals as a light script near the bots.
export function backingScript(g, t, lineT0, x, y, size = 58, col = C.pink) {
  const l = lines().find(l => Math.abs(l.start - lineT0) < .05);
  if (!l || !l.back.length) return;
  const on = l.leadEnd - .05;
  const p = clamp((t - on) / .2) * (1 - smooth((t - l.end - .3) / .25));
  if (p <= 0) return;
  const txt = l.back.map(w => w.w.replace(/[()]/g, '')).join(' ');
  g.save();
  g.globalAlpha = p;
  g.font = `italic 700 ${size}px Bricolage`; g.textAlign = 'center'; g.textBaseline = 'middle';
  let cx = x - g.measureText(txt).width / 2; let i = 0;
  g.textAlign = 'left';
  for (const ch of txt) {
    const cw = g.measureText(ch).width;
    const wave = Math.sin(t * 8 - i * .45) * size * .12;
    g.shadowColor = rgba(col, .9); g.shadowBlur = 18 * g.getTransform().a;
    g.fillStyle = mix(col, '#ffffff', .35);
    g.fillText(ch, cx, y + wave);
    cx += cw; i++;
  }
  g.restore();
}

// The band, close: the bandstand's inside, bulbs along the valance, columns, beams, haze.
export function bandMedium(g, t, K, o = {}) {
  const fy = o.floorY ?? 1450;
  const bp = K.beatPos(t);
  const dawn = o.dawn || 0;
  // Back: night through the arches, the wheel glowing.
  g.fillStyle = vgrad(g, 0, fy, [[0, mixHex('#0a0a2a', '#43307a', dawn)], [.7, mixHex('#2a1a5a', '#c06a8a', dawn)], [1, mixHex('#4a2a6a', '#ffb088', dawn)]]);
  g.fillRect(0, 0, W, fy);
  ferrisWheel(g, t, 820, 520, 520, { rot: t * .05, on: 1 - dawn * .4 });
  g.save(); g.fillStyle = rgba('#12082a', .35); g.fillRect(0, 0, W, fy); g.restore();
  beams(g, t, [
    { x: 160, y: 300, a: .35 + .25 * Math.sin(bp * Math.PI / 2), col: C.pink, len: 1500, w: .1 },
    { x: 920, y: 300, a: -.35 - .25 * Math.sin(bp * Math.PI / 2 + 1), col: C.cyan, len: 1500, w: .1 },
    { x: 540, y: 250, a: .08 * Math.sin(t), col: C.violet, len: 1300, w: .14, i: .7 },
  ], (o.energy ?? 1) * (1 - dawn * .5));
  haze(g, t, 0, 400, W, 900, C.violet, .2);
  // Stage floor.
  g.fillStyle = vgrad(g, fy, H, [[0, '#f0e2c8'], [.03, '#c7b393'], [.04, '#3a2342'], [1, '#12091c']]);
  g.fillRect(0, fy, W, H - fy);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = rgrad(g, 540, fy + 20, 0, 600, [[0, rgba(C.pink, .35)], [1, rgba(C.pink, 0)]]);
  g.scale(1, .25); circle(g, 540, (fy + 20) / .25, 600); g.fill();
  g.restore();
  // The band.
  const back = o.back ?? 0;
  band(g, t, K, {
    grok: { x: 540, y: fy - 150, s: 190 },
    muse: { x: 145, y: fy + 10, s: 180 },
    molty: { x: 310, y: fy + 30, s: 230 },
    blossom: { x: 800, y: fy + 30, s: 215 },
    clawd: { x: 540, y: fy + 60, s: 330 },
  }, { energy: o.energy ?? 1, back, rim: C.cyan, rim2: C.pink, eyes: o.eyes });
  // Columns and the valance with bulbs, framing the shot.
  for (const x of [22, 1058]) {
    g.fillStyle = lgrad(g, x - 26, 0, x + 26, 0, [[0, '#9c8f7c'], [.45, '#fff8ea'], [1, '#8a7d6a']]);
    rr(g, x - 24, 0, 48, fy + 40, 10); g.fill();
  }
  g.fillStyle = '#f4ead8';
  g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 120);
  for (let i = 12; i >= 0; i--) { const x = i * W / 12; g.quadraticCurveTo(x + W / 24, 170, x, 120); }
  g.closePath(); g.fill();
  g.fillStyle = vgrad(g, 0, 120, [[0, '#c9485c'], [1, '#e8667a']]); g.fillRect(0, 0, W, 70);
  for (let i = 0; i < 18; i++) bulb(g, 30 + i * 60, 96, 8, i % 2 ? C.bulb : '#ffe9c2', .5 + .5 * (Math.sin(i * .8 - t * 5) > 0 ? 1 : .4));
  if (o.crowd) crowdFront(g, t, K, o.crowd, o);
}

// From the stage, over Clawd's shoulder: the whole pier full, faces lit, the huts' people at the
// front. people: [{o, x}] for the front row.
export function crowdReverse(g, t, K, o = {}) {
  const bp = K.beatPos(t);
  const dawn = o.dawn || 0;
  const hz = 820;
  g.fillStyle = vgrad(g, 0, hz, [[0, mixHex('#08082a', '#3a3a8a', dawn)], [.7, mixHex('#2a1a5a', '#d08aa0', dawn)], [1, mixHex('#6a2a6a', '#ffc49a', dawn)]]);
  g.fillRect(0, 0, W, hz);
  // Stars and the town on the shore, where the pier begins.
  for (let i = 0; i < 160; i++) { g.fillStyle = rgba('#e8ecff', (.3 + .4 * rnd(i, 601)) * (.6 + .4 * Math.sin(t * 2 + i)) * (1 - dawn)); circle(g, rnd(i, 602) * W, rnd(i, 603) * hz * .9, 1 + rnd(i, 604) * 1.2); g.fill(); }
  town(g, t, hz, { on: 1 - dawn * .5 });
  g.fillStyle = vgrad(g, hz, H, [[0, '#3a2440'], [1, '#0e0814']]);
  g.fillRect(0, hz, W, H - hz);
  // The pier running back to shore: lamps shrinking into the distance.
  for (let i = 0; i < 9; i++) {
    const z = 1 - i / 9;
    for (const s of [-1, 1]) {
      const x = 540 + s * (80 + 520 * z * z), y = hz + 30 + 520 * z * z;
      glow(g, x, y - 200 * z * z - 20, 90 * z + 10, C.amber, .5);
      g.fillStyle = '#ffe2a8'; circle(g, x, y - 200 * z * z - 20, 6 * z + 2); g.fill();
    }
  }
  // Fireworks behind the crowd.
  if (o.fireworks !== false) {
    for (let k = 0; k < 3; k++) {
      const tb = K.beatAt(Math.floor(bp / 2) * 2 - k * 2);
      if (tb !== undefined) firework(g, t, tb, 180 + ((Math.floor(bp / 2) - k) * 263) % 720, 180 + ((Math.floor(bp / 2) - k) * 131) % 300, { color: [C.pink, C.cyan, C.gold][(Math.floor(bp / 2) - k + 3) % 3], color2: '#fff', n: 60, speed: 340, seed: Math.floor(bp / 2) - k });
    }
  }
  // The crowd facing us, rows receding.
  const skins = ['#f6d0b1', '#e8b48f', '#c98d67', '#a86b4a', '#7c4a32', '#5b3526'];
  const tops = ['#5a4bff', '#ff6a8a', '#2fbfa0', '#ffb13b', '#b06bff', '#48a0ff', '#ff7a59'];
  for (let r = 8; r >= 1; r--) {
    const z = r / 9;
    const y = hz + 60 + 900 * (1 - z) * (1 - z) * .9 + 40;
    const s = 12 + 90 * (1 - z) * (1 - z);
    const n = Math.round(6 + 20 * z);
    for (let i = 0; i < n; i++) {
      const x = (i + .5 + (r % 2) * .5) / n * W + (rnd(i + r * 50, 605) - .5) * 30;
      const hop = Math.max(0, Math.sin((bp + rnd(i, 606) * .3) * Math.PI)) * s * .25;
      const k = i + r * 50;
      const lit = .35 + .65 * (1 - z);
      g.fillStyle = mix('#140a20', tops[k % tops.length], lit * .8);
      rr(g, x - s * .55, y - s * 1.2 - hop, s * 1.1, s * 2, s * .4); g.fill();
      g.fillStyle = mix('#140a20', skins[k % skins.length], lit);
      circle(g, x, y - s * 1.5 - hop, s * .42); g.fill();
      if (rnd(k, 607) > .6) { glow(g, x + s * .6, y - s * 2.4 - hop, s * 1.2, '#e8f0ff', .35 * lit); g.fillStyle = '#f4f8ff'; rr(g, x + s * .5, y - s * 2.6 - hop, s * .22, s * .38, s * .05); g.fill(); }
    }
  }
  // Front row: the people from the huts, lit by the stage, singing along.
  for (const p of (o.people || [])) {
    const hop = Math.max(0, Math.sin((bp + p.x * .001) * Math.PI)) * 12;
    const pt = o.point;
    person(g, p.x, 1560 - hop, { s: p.s || 118, ...p.o, eyes: 'happy', mouth: .4 + .5 * clamp(K.vocal(t)), armR: pt ? -1.75 : -2.6 + .3 * Math.sin(bp * Math.PI), armL: pt ? (p.both ? -1.75 : .3) : p.both ? -2.6 : .3, look: pt ? [(760 - p.x) / 600, .6] : [0, 0], shadow: false });
  }
  // Stage light washing over the front rows.
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = vgrad(g, 1100, H, [[0, rgba(C.pink, 0)], [1, rgba(C.pink, .18)]]); g.fillRect(0, 1100, W, H - 1100);
  g.restore();
  // Clawd from behind, at the mic, lower right; the mic stand.
  g.strokeStyle = '#2a2840'; g.lineWidth = 16; g.lineCap = 'round'; line(g, 690, H, 700, 1560); g.stroke();
  clawd(g, 830, 2010, { s: 500, back: true, rim: C.pink, rimSide: -1, armL: -1.2, armR: -.2 - .25 * Math.pow(1 - bp % 1, 3), squash: .04 * Math.pow(1 - bp % 1, 3), shadow: false, holdL: (g2, u) => mic(g2, u, { rot: .9 }) });
}

// Clawd at the mic, big, with the fairground melting into bokeh behind.
export function clawdClose(g, t, K, o = {}) {
  const bp = K.beatPos(t);
  const dawn = o.dawn || 0;
  g.fillStyle = vgrad(g, 0, H, [[0, mixHex('#0b0a2c', '#4a3a8a', dawn)], [.6, mixHex('#2c1560', '#d0708a', dawn)], [1, mixHex('#12081f', '#5a3040', dawn)]]);
  g.fillRect(0, 0, W, H);
  // Bokeh: big soft discs from the wheel and bulbs.
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 38; i++) {
    const x = (rnd(i, 401) * 1.3 - .15) * W + Math.sin(t * .4 + i) * 10, y = rnd(i, 402) * 1100 + 60;
    const r = 30 + 70 * rnd(i, 403);
    const col = [C.pink, C.bulb, C.cyan, C.violet, C.amber][i % 5];
    const a = .12 + .1 * Math.sin(t * 1.5 + i) + .08 * K.kick(t);
    g.fillStyle = rgrad(g, x, y, r * .5, r, [[0, rgba(col, a * .7)], [.85, rgba(col, a)], [1, rgba(col, 0)]]);
    circle(g, x, y, r); g.fill();
  }
  g.restore();
  beams(g, t, [
    { x: 100, y: -50, a: .3 + .2 * Math.sin(bp * Math.PI / 2), col: C.pink, len: 1800, w: .08 },
    { x: 980, y: -50, a: -.3 - .2 * Math.sin(bp * Math.PI / 2 + 1), col: C.cyan, len: 1800, w: .08 },
  ], .8 * (o.energy ?? 1));
  const voc = clamp(K.vocal(t) * 1.15);
  const bounce = Math.pow(1 - bp % 1, 3) * (o.energy ?? 1);
  // Mic stand and Clawd, singing.
  g.strokeStyle = '#2a2840'; g.lineWidth = 16; g.lineCap = 'round';
  line(g, 640, 1920, 630, 1330); g.stroke();
  const s = o.s || 600;
  const held = voc > .5 && K.vocal(t - .25) > .5;
  clawd(g, 540, o.y ?? 1860, {
    s, t, rim: C.cyan, rimSide: 1, squash: bounce * .05,
    eyes: o.eyes || (held ? 'closed' : voc > .15 ? 'open' : 'happy'), mouth: voc,
    armR: -1.05, armL: -.35 - bounce * .35, hold: (g2, u) => mic(g2, u, { rot: -1.2 }),
    blush: .5, blink: 0, look: [0, -.2], ...(o.clawd || {}),
  });
  // The crowd only at the edges of a close-up: hands and phone torches up in the corners.
  if (o.crowd) for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1, k = Math.floor(i / 2);
    const x = 540 + side * (400 + k * 60), up = .6 + .4 * Math.sin((bp + i * .2) * Math.PI);
    const hy = 1560 - up * 120 - k * 70;
    g.strokeStyle = '#0c0714'; g.lineWidth = 50; g.lineCap = 'round';
    line(g, x + side * 60, H + 40, x, hy); g.stroke();
    g.fillStyle = '#0c0714'; circle(g, x, hy - 10, 34); g.fill();
    if (i % 3 !== 1) { glow(g, x, hy - 70, 130, '#dfe8ff', .4); g.fillStyle = '#eef4ff'; rr(g, x - 20, hy - 110, 40, 70, 8); g.fill(); }
  }
}
