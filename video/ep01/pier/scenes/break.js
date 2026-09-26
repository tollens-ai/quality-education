// The break: the definition in lights over the pier's gateway, then everyone it's about.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade } from '../kit.js';
import { nightSky, sea, town, ferrisWheel, beams, haze } from '../world.js';
import { clawd, person, molty, grok, blossom, muse } from '../cast.js';
import { blinkAt } from '../band.js';
import { bulbText, measureBulb } from '../sign.js';
import { wordTimes } from './stage.js';
import { PEOPLE } from './huts.js';
import { laptop, hand } from '../props.js';

// The gateway: two ornate towers and an arched sign between them.
function gateway(g, t, o = {}) {
  const on = o.on ?? 1;
  for (const s of [-1, 1]) {
    const x = 540 + s * 440;
    g.fillStyle = lgrad(g, x - 70, 0, x + 70, 0, [[0, '#cfc2ad'], [.45, '#fff6e6'], [1, '#b3a58f']]);
    rr(g, x - 60, 420, 120, 1300, 16); g.fill();
    // Onion dome.
    g.fillStyle = lgrad(g, x - 80, 0, x + 80, 0, [[0, '#1f7a74'], [.5, '#49c2b0'], [1, '#155a55']]);
    g.beginPath(); g.moveTo(x - 80, 430); g.bezierCurveTo(x - 100, 330, x - 20, 300, x, 230); g.bezierCurveTo(x + 20, 300, x + 100, 330, x + 80, 430); g.closePath(); g.fill();
    g.fillStyle = C.gold; circle(g, x, 222, 12); g.fill(); g.fillRect(x - 3, 170, 6, 50);
    glow(g, x, 170, 60, C.gold, .6 * on);
    for (let k = 0; k < 12; k++) bulb(g, x - 48 + (k % 2) * 96, 480 + Math.floor(k / 2) * 180, 6, C.bulb, on * (.55 + .45 * (Math.sin(k - t * 4) > 0 ? 1 : .3)));
  }
  // The arch band the words hang in.
  g.fillStyle = vgrad(g, 360, 1180, [[0, '#2a1640'], [1, '#150b24']]);
  g.beginPath(); g.moveTo(100, 1180); g.lineTo(100, 520); g.quadraticCurveTo(540, 250, 980, 520); g.lineTo(980, 1180); g.closePath(); g.fill();
  g.strokeStyle = '#f4d58a'; g.lineWidth = 8;
  g.beginPath(); g.moveTo(120, 1160); g.lineTo(120, 530); g.quadraticCurveTo(540, 280, 960, 530); g.lineTo(960, 1160); g.stroke();
  // Bulbs along the arch curve.
  for (let k = 0; k <= 30; k++) {
    const p = k / 30; const x = lerp(120, 960, p); const y = (1 - p) * (1 - p) * 530 + 2 * (1 - p) * p * 280 + p * p * 530;
    bulb(g, x, y - 16, 7, k % 2 ? C.bulb : C.pink, on * (.5 + .5 * (Math.sin(k * .7 - t * 6) > 0 ? 1 : .35)));
  }
}

export function archShot(g, t, c) {
  const K = c.K;
  const ws = wordTimes(128.8).map(w => w.s);
  // A thump on every word of the chant.
  const hit = ws.reduce((a, s) => a + (t >= s ? Math.exp(-(t - s) * 9) : 0), 0);
  g.save();
  const z = 1 + .018 * Math.min(1, hit);
  g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
  nightSky(g, t, { horizon: 1300, moon: { x: 540, y: 120, r: 40 } });
  town(g, t, 1300);
  g.fillStyle = vgrad(g, 1300, H, [[0, '#3a2440'], [1, '#0e0814']]); g.fillRect(0, 1300, W, H - 1300);
  const lit = smooth(inv(128.7, 129.1, t));
  gateway(g, t, { on: .4 + .6 * lit });
  // The words, lit in bulbs as they're chanted.
  const rows = [
    { txt: 'SOFTWARE QUALITY', words: [0, 1], y: 610 },
    { txt: 'IS VALUE TO', words: [2, 3, 4], y: 780 },
    { txt: 'SOMEONE', words: [5], y: 950 },
    { txt: 'WHO MATTERS', words: [6, 7], y: 1120 },
  ];
  for (const r of rows) {
    let size = r.txt.length > 12 ? 118 : 150;
    const mw = measureBulb(r.txt, size);
    if (mw > 820) size *= 820 / mw;
    // Per-letter onsets from the word each letter belongs to.
    const onAt = []; let wi = 0;
    for (const ch of r.txt) { if (ch === ' ') { onAt.push(ws[r.words[wi]] ?? 1e9); wi++; continue; } onAt.push(ws[r.words[wi]] ?? 1e9); }
    bulbText(g, r.txt, 540, r.y, size, { onAt, t, face: r.txt === 'WHO MATTERS' ? '#ff4a6e' : '#ffe7b0', edge: '#7a3020', bulbCol: C.bulb, spacing: size * .15, chase: 4, depth: 6 });
  }
  // The plaque with the credit.
  g.fillStyle = '#e8dcc0'; rr(g, 250, 1195, 580, 76, 10); g.fill();
  g.strokeStyle = '#8a6a3a'; g.lineWidth = 4; rr(g, 256, 1201, 568, 64, 8); g.stroke();
  g.fillStyle = '#4a3420'; g.font = '700 23px Bricolage'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('after Gerald Weinberg · Bach & Bolton', 540, 1224);
  g.font = '600 21px Bricolage'; g.fillText('via Ed Pringle', 540, 1250);
  // Everyone below, looking up.
  const folk = ['demo', 'baker', 'chat1', 'student', 'nana', 'blind', 'chat2', 'chat3', 'baker', 'demo'];
  for (let i = 0; i < 10; i++) person(g, 80 + i * 102, 1640 + (i % 2) * 40, { s: 70, ...PEOPLE[folk[i]], look: [0, -1], eyes: 'open', mouth: .3 + .5 * clamp(K.vocal(t)), shadow: false });
  g.restore();
}

// ---------------------------------------------------------------- 134.68 – 137.48: matters ×3
export function mattersShot(g, t, c) {
  const K = c.K;
  const ws = wordTimes(134.68).map(w => w.s);
  nightSky(g, t, { horizon: 900, moon: false, stars: .7 });
  g.fillStyle = vgrad(g, 900, H, [[0, '#3a2440'], [1, '#0e0814']]); g.fillRect(0, 900, W, H - 900);
  // Three groups of people; each lights up on its "matters".
  const groups = [
    [['demo', 170, 1220], ['nana', 330, 1260], ['chat1', 90, 1320]],
    [['student', 540, 1180], ['baker', 700, 1250], ['blind', 420, 1330]],
    [['chat2', 880, 1220], ['chat3', 990, 1330], ['demo', 760, 1360]],
  ];
  groups.forEach((grp, gi) => {
    const on = ws[gi] !== undefined ? smooth(inv(ws[gi] - .05, ws[gi] + .15, t)) : 0;
    const cx = grp.reduce((a, p) => a + p[1], 0) / grp.length;
    if (on > 0) {
      g.save(); g.globalCompositeOperation = 'lighter';
      g.fillStyle = lgrad(g, cx, 0, cx, 1400, [[0, rgba('#fff3d0', .0)], [1, rgba('#fff3d0', .3 * on)]]);
      poly(g, [[cx - 60, 0], [cx + 60, 0], [cx + 260, 1450], [cx - 260, 1450]]); g.fill();
      g.restore();
      glow(g, cx, 1250, 320, C.amber, .45 * on);
    }
    for (const [k, x, y] of grp) person(g, x, y + 200, { s: 96, ...PEOPLE[k], eyes: on > .5 ? 'happy' : 'open', look: [0, -.4], mouth: on > .5 ? .5 : 0, shadow: false });
    if (on > 0) {
      g.save(); g.globalAlpha = on;
      g.font = 'italic 800 64px Bricolage'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = C.pink; g.shadowBlur = 24 * g.getTransform().a;
      g.fillStyle = mix(C.pink, '#fff', .5);
      g.fillText('matters', cx, 820 - gi * 30 + (1 - on) * 30);
      g.restore();
    }
  });
}

// ---------------------------------------------------------------- 137.48 – 142.42: I'm someone too / and me
export function someoneShot(g, t, c) {
  const K = c.K;
  nightSky(g, t, { horizon: 1100, moon: false, stars: .8 });
  g.fillStyle = vgrad(g, 1100, H, [[0, '#3a2440'], [1, '#0e0814']]); g.fillRect(0, 1100, W, H - 1100);
  const ws = wordTimes(139.24).map(w => w.s);
  const meT = [ws[1], ws[3], ws[5]].map((v, i) => v ?? 139.7 + i * 1.2);
  // The spotlight finds Clawd; its heart glows.
  const spot = smooth(inv(137.4, 137.7, t));
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = lgrad(g, 540, 0, 540, 1700, [[0, rgba('#fff0d8', .05 * spot)], [1, rgba('#fff0d8', .3 * spot)]]);
  poly(g, [[480, 0], [600, 0], [860, 1700], [220, 1700]]); g.fill();
  g.fillStyle = rgrad(g, 540, 1700, 0, 400, [[0, rgba('#fff0d8', .5 * spot)], [1, rgba('#fff0d8', 0)]]);
  g.scale(1, .22); circle(g, 540, 1700 / .22, 400); g.fill();
  g.restore();
  const heartOn = smooth(inv(138.0, 138.5, t));
  // The bots squeeze in, one per "and me!".
  const pop = i => spring(inv(meT[i] - .05, meT[i] + .35, t), 3.4, 6);
  const bubbleMe = (x, y, p, flip) => {
    if (p <= 0) return;
    const s = easeOutBack(clamp(p), 2);
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#fff8ee'; rr(g, -115, -50, 230, 96, 40); g.fill();
    poly(g, [[flip * 30, 40], [flip * 70, 80], [flip * 60, 36]]); g.fill();
    g.fillStyle = '#2a2038'; g.font = '800 46px Bricolage'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('and me!', 0, 0);
    g.restore();
  };
  const p1 = pop(0), p2 = pop(1), p3 = pop(2);
  const hug = smooth(inv(142.0, 142.4, t));
  // Light motes rising in the beam, and rays from the heart once it glows.
  for (let i = 0; i < 46; i++) { const ph = (t * (.08 + .06 * rnd(i, 901)) + rnd(i, 902)) % 1; const mx = 540 + (rnd(i, 903) - .5) * lerp(160, 560, 1 - ph), my = 1700 - ph * 1500; glow(g, mx, my, 16, '#fff0d8', .5 * spot * Math.sin(ph * Math.PI)); }
  if (heartOn > 0) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(540, 1550);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .25; g.fillStyle = lgrad(g, 0, 0, Math.cos(a) * 700, Math.sin(a) * 700, [[0, rgba('#ff9ac0', .28 * heartOn)], [1, rgba('#ff9ac0', 0)]]); poly(g, [[0, 0], [Math.cos(a - .06) * 800, Math.sin(a - .06) * 800], [Math.cos(a + .06) * 800, Math.sin(a + .06) * 800]]); g.fill(); }
    g.restore();
  }
  if (p1 > 0) molty(g, lerp(-200, 250 + hug * 40, p1), 1700, { s: 260, t, eyes: 'happy', rim: C.pink, clawL: -1.2, clawR: -.4, mouth: .6 });
  if (p2 > 0) grok(g, lerp(1300, 850 - hug * 40, p2), 1700, { s: 250, rim: C.cyan, arms: false, glowMark: 1 });
  if (p3 > 0) blossom(g, 700 - hug * 30, lerp(-500, 1360, p3), { s: 200, eyes: 'happy', rim: C.pink, mouth: .6 });
  if (t > 142.2) muse(g, lerp(-100, 120, smooth(inv(142.2, 142.6, t))), 1760, { s: 200, t, eyes: 'happy' });
  clawd(g, 540, 1700, { s: 420, t, eyes: t > 139.2 ? 'happy' : 'open', look: [0, -.2], heart: heartOn, armL: -1.2 * heartOn + (p1 > .5 ? .6 : 0), armR: -1.2 * heartOn + (p2 > .5 ? .6 : 0), rim: '#fff0d8', mouth: clamp(K.vocal(t)), blush: heartOn });
  bubbleMe(250, 1280, p1, 1);
  bubbleMe(840, 1250, p2, -1);
  bubbleMe(760, 1000, p3, -1);
}

// ---------------------------------------------------------------- 142.42 – 147.2: debugging this with you
export function debugShot(g, t, c) {
  const K = c.K;
  // A warm desk at night: the laptop, your hands, Clawd beside you, and a bug made of light.
  g.fillStyle = vgrad(g, 0, H, [[0, '#1a1024'], [.55, '#2e1a2a'], [1, '#140c12']]);
  g.fillRect(0, 0, W, H);
  // Window with the pier far off.
  g.fillStyle = '#0b0b30'; rr(g, 620, 160, 380, 460, 14); g.fill();
  for (let i = 0; i < 30; i++) bulb(g, 660 + i * 11, 540 + Math.sin(i * .4) * 6, 2, i % 3 ? C.bulb : C.pink, .7);
  g.strokeStyle = '#3a2430'; g.lineWidth = 16; rr(g, 620, 160, 380, 460, 14); g.stroke(); line(g, 810, 160, 810, 620); g.stroke();
  glow(g, 250, 420, 500, C.amber, .45);
  // Desk lamp.
  g.strokeStyle = '#2a1a20'; g.lineWidth = 14; line(g, 150, 1180, 190, 700); g.stroke(); line(g, 190, 700, 330, 560); g.stroke();
  g.fillStyle = '#3a2430'; poly(g, [[300, 520], [400, 600], [330, 640], [250, 560]]); g.fill();
  glow(g, 350, 620, 300, '#ffcf8a', .6);
  // Desk.
  g.fillStyle = vgrad(g, 1180, H, [[0, '#6a4030'], [1, '#2a160e']]); g.fillRect(0, 1180, W, H - 1180);
  const found = smooth(inv(143.4, 143.9, t)), caught = smooth(inv(144.6, 145.0, t));
  laptop(g, 520, 1290, 620, (g2, sx, sy, sw, sh) => {
    g2.fillStyle = '#0f0e17'; g2.fillRect(sx, sy, sw, sh);
    const code = ['function logSet(w) {', '  if (!w) return', '  sets.push({ kg: w })', '  flame(best(sets))', '}'];
    code.forEach((l, i) => { g2.fillStyle = i === 2 && found > 0 && caught < 1 ? mix('#e8e4f4', '#ff6a7a', found) : '#c9c4e0'; g2.font = `500 ${sw * .05}px Mono`; g2.textAlign = 'left'; g2.textBaseline = 'middle'; g2.fillText(l, sx + sw * .06, sy + sh * (.18 + i * .15)); });
    if (caught > .5) { g2.fillStyle = '#6dff9a'; g2.fillText('✓', sx + sw * .88, sy + sh * .48); }
  }, { glowA: .9 });
  // The bug: a little ladybird of light that crawls out of line 3.
  const bugP = inv(142.6, 144.5, t);
  const bx = lerp(430, 700, bugP) + Math.sin(t * 9) * 6, by = lerp(1020, 1100, bugP) - Math.abs(Math.sin(t * 14)) * 6;
  const jarX = 760, jarY = 1180;
  const inJar = caught;
  const fx = lerp(bx, jarX, inJar), fy = lerp(by, jarY - 90, inJar) + (inJar > .9 ? Math.sin(t * 3) * 14 : 0);
  glow(g, fx, fy, 60, '#ffe36b', .8);
  g.fillStyle = '#ff4a5a'; ellipse(g, fx, fy, 18, 14); g.fill(); g.fillStyle = '#1a1020'; circle(g, fx + 16, fy, 8); g.fill();
  g.fillStyle = '#1a1020'; circle(g, fx - 5, fy - 4, 3); g.fill(); circle(g, fx + 3, fy + 5, 3); g.fill();
  // The jar in your hand; Clawd helps with the lid.
  g.save(); g.translate(jarX, jarY);
  g.fillStyle = rgba('#dff4ff', .25); rr(g, -80, -190, 160, 190, 30); g.fill();
  g.strokeStyle = rgba('#ffffff', .5); g.lineWidth = 5; rr(g, -80, -190, 160, 190, 30); g.stroke();
  g.fillStyle = '#c9a15a'; rr(g, -86, lerp(-260, -206, caught), 172, 26, 8); g.fill();
  g.restore();
  // Your hand points out the bug on the screen; the other rests on the keys.
  const pt = easeOut(inv(142.5, 143.3, t)) * (1 - easeIn(inv(144.4, 144.9, t)));
  hand(g, lerp(250, 360, pt), lerp(1560, 1250, pt), 160, .45, 'point', { sleeveCol: '#5b6cff' });
  hand(g, 640, 1330 + Math.sin(t * 20) * 3, 150, -.2, 'open', { sleeveCol: '#5b6cff' });
  clawd(g, 900, 1190, { s: 190, eyes: caught > .5 ? 'happy' : 'wide', look: [-1, .3], armL: lerp(-.2, -1.2, caught), armR: -.3, rim: C.amber, mouth: clamp(K.vocal(t)), blush: caught });
}
