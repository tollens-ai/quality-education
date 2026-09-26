// The break: the definition in lights over the pier's gateway, then everyone it's about, each group
// holding up MATTERS; Clawd's own placard, I'M SOMEONE TOO!, and the bots crowding in with theirs.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, INK } from '../kit.js';
import { nightSky, sea, town, ferrisWheel, beams, haze, washBand, twinkle } from '../world.js';
import { clawd, person, molty, grok, blossom, muse, pen, nopen, tone } from '../cast.js';
import { blinkAt } from '../band.js';
import { wordTimes, bulbWord } from './stage.js';
import { PEOPLE } from './huts.js';
import { folk } from '../folk.js';
import { laptop, hand } from '../props.js';
import { sing, lineNear, STYLE } from '../lyrics.js';
import { letter, measure } from '../hand.js';

// The gateway: two towers with onion domes and an arched board the words hang in.
function gateway(g, t, o = {}) {
  const on = o.on ?? 1;
  for (const s of [-1, 1]) {
    const x = 540 + s * 440;
    g.save(); pen(g, 12, .9);
    const tower = () => rr(g, x - 60, 420, 120, 1300, 16);
    tower(); g.fillStyle = '#f3eadb'; g.fill();
    nopen(g); tone(g, tower, '#f3eadb', '#c2b49c', -s * 22, 0);
    pen(g, 12, .9);
    const dome = () => { g.beginPath(); g.moveTo(x - 80, 430); g.bezierCurveTo(x - 100, 330, x - 20, 300, x, 230); g.bezierCurveTo(x + 20, 300, x + 100, 330, x + 80, 430); g.closePath(); };
    dome(); g.fillStyle = '#3fb3a3'; g.fill();
    nopen(g); tone(g, dome, '#3fb3a3', '#24807a', -s * 18, 0);
    pen(g, 8, .7); g.fillStyle = C.gold; circle(g, x, 222, 12); g.fill(); g.fillRect(x - 3, 170, 6, 50);
    g.restore();
    glow(g, x, 170, 50, C.gold, .7 * on);
    for (let k = 0; k < 12; k++) bulb(g, x - 48 + (k % 2) * 96, 480 + Math.floor(k / 2) * 180, 6, C.bulb, on * (.55 + .45 * (Math.sin(k - t * 4) > 0 ? 1 : .3)));
  }
  g.save(); pen(g, 12, .9);
  const arch = () => { g.beginPath(); g.moveTo(100, 1180); g.lineTo(100, 520); g.quadraticCurveTo(540, 250, 980, 520); g.lineTo(980, 1180); g.closePath(); };
  arch(); g.fillStyle = '#2a1644'; g.fill();
  nopen(g); tone(g, arch, '#2a1644', '#1c0e30', -16, -18);
  g.strokeStyle = '#f2cf7c'; g.lineWidth = 8;
  g.beginPath(); g.moveTo(122, 1160); g.lineTo(122, 530); g.quadraticCurveTo(540, 282, 958, 530); g.lineTo(958, 1160); g.stroke();
  g.restore();
  for (let k = 0; k <= 30; k++) {
    const p = k / 30; const x = lerp(120, 960, p); const y = (1 - p) * (1 - p) * 530 + 2 * (1 - p) * p * 280 + p * p * 530;
    bulb(g, x, y - 16, 7, k % 2 ? C.bulb : C.pink, on * (.5 + .5 * (Math.sin(k * .7 - t * 6) > 0 ? 1 : .35)));
  }
}

export function archShot(g, t, c) {
  const K = c.K;
  const ws = wordTimes(128.8).map(w => w.s);
  const hit = ws.reduce((a, s) => a + (t >= s ? Math.exp(-(t - s) * 9) : 0), 0);
  g.save();
  const z = 1 + .018 * Math.min(1, hit);
  g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
  nightSky(g, t, { horizon: 1300, moon: { x: 540, y: 130, r: 40 } });
  town(g, t, 1300);
  g.save(); g.ink = null; g.fillStyle = vgrad(g, 1300, H, [[0, '#3a2440'], [1, '#120a18']]); g.fillRect(0, 1300, W, H - 1300); g.restore();
  const lit = smooth(inv(128.7, 129.1, t));
  gateway(g, t, { on: .4 + .6 * lit });
  // The words in bulbs, each lit as it's chanted.
  const rows = [
    { words: ['Software', 'quality'], idx: [0, 1], y: 640, size: 96 },
    { words: ['is', 'value', 'to'], idx: [2, 3, 4], y: 800, size: 108 },
    { words: ['someone'], idx: [5], y: 960, size: 128 },
    { words: ['who', 'matters'], idx: [6, 7], y: 1120, size: 112 },
  ];
  for (const r of rows) {
    const gap = r.size * .32;
    const widths = r.words.map(s => measure(s, r.size, .19));
    let size = r.size;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (r.words.length - 1);
    const k = Math.min(1, 780 / total);
    size *= k;
    let x = 540 - total * k / 2;
    r.words.forEach((wd, i) => {
      const w = widths[i] * k;
      const on = ws[r.idx[i]] ?? 1e9;
      if (t >= on - .02) {
        const l = t < on + .05 ? 1 : t < on + .09 ? .3 : 1;
        bulbWord(g, wd, x + w / 2, r.y, size, { t, on: l, face: r.y > 1100 ? '#ff4a6e' : '#ffe7b0', edge: r.y > 1100 ? '#7a1030' : '#8a5a20', w: .19, chase: 4, seed: 60 + r.idx[i] });
      }
      x += w + gap * k;
    });
  }
  // The plaque with the credit.
  g.save(); pen(g, 8, .8);
  g.fillStyle = '#e6d6b2'; rr(g, 220, 1190, 640, 92, 10); g.fill();
  nopen(g); g.strokeStyle = '#8a6a3a'; g.lineWidth = 4; rr(g, 228, 1198, 624, 76, 8); g.stroke();
  g.restore();
  letter(g, 'after Gerald Weinberg · Bach & Bolton', 540, 1234, 24, { align: 'center', col: '#4a3420', w: .14, seed: 3 });
  letter(g, 'via Ed Pringle', 540, 1266, 22, { align: 'center', col: '#4a3420', w: .14, seed: 4 });
  const who = ['demo', 'baker', 'chat1', 'student', 'nana', 'blind', 'chat2', 'chat3', 0, 1];
  for (let i = 0; i < 10; i++) person(g, 80 + i * 102, 1795 + (i % 2) * 40, { s: 70, ...(typeof who[i] === 'string' ? PEOPLE[who[i]] : folk(who[i] + 460)), full: true, look: [0, -1], eyes: 'open', brow: 'up', mouth: .3 + .5 * clamp(K.vocal(t)), shadow: true });
  g.restore();
}

// A placard on a stick, lettered as it's sung.
export function placard(g, t, x, y, str, t0, o = {}) {
  const up = o.held ? 1 : easeOutBack(inv(t0 - .1, t0 + .2, t), 1.8);
  if (up <= 0) return;
  const size = o.size || 60;
  const w = Math.max(o.minW || 0, measure(str, size, .17) + size * 1.1), h = size * 1.9;
  const sway = (o.rot || 0) + Math.sin(t * 4 + x + (o.seed || 0)) * .03;
  g.save(); g.translate(x, y + (1 - up) * 120); g.rotate(sway);
  pen(g, 8, .8);
  g.strokeStyle = '#8a5a3a'; g.lineWidth = size * .16; line(g, 0, h * .4, 0, h * .4 + (o.stick || h * 1.2)); g.stroke();
  g.fillStyle = o.board || '#fbf3e2'; rr(g, -w / 2, -h / 2, w, h, 12); g.fill();
  g.restore();
  g.save(); g.translate(x, y + (1 - up) * 120); g.rotate(sway);
  letter(g, str, 0, size * .5, size, { align: 'center', col: o.col || '#c2335a', w: .18, progress: clamp((t - t0) / (o.dur || .25)), seed: (x | 0) + 7 });
  g.restore();
}

// ---------------------------------------------------------------- 134.68 – 137.48: matters ×3
export function mattersShot(g, t, c) {
  const K = c.K;
  const ws = wordTimes(134.68).map(w => w.s);
  nightSky(g, t, { horizon: 900, moon: false, stars: .7 });
  g.save(); g.ink = null; g.fillStyle = vgrad(g, 900, H, [[0, '#3a2440'], [1, '#120a18']]); g.fillRect(0, 900, W, H - 900); g.restore();
  // Three groups, each in its own spotlight, feet on the ground. The one at the back of each
  // raises the placard as the word is sung; the other two stand in front, looking up.
  const groups = [
    { cx: 200, back: 'demo', front: [['nana', -100, 1660], ['chat1', 95, 1695]] },
    { cx: 540, back: 'student', front: [['blind', -100, 1690], ['baker', 100, 1660]] },
    { cx: 880, back: 'chat2', front: [[0, -95, 1665], ['chat3', 100, 1700]] },
  ];
  groups.forEach((grp, gi) => {
    const t0 = ws[gi];
    const on = t0 !== undefined ? smooth(inv(t0 - .05, t0 + .15, t)) : 0;
    const cx = grp.cx;
    if (on > 0) {
      g.save(); g.ink = null; g.globalCompositeOperation = 'screen';
      g.fillStyle = rgba('#fff3d0', .16 * on); poly(g, [[cx - 60, 0], [cx + 60, 0], [cx + 290, 1700], [cx - 290, 1700]]); g.fill();
      g.fillStyle = rgba('#fff3d0', .1 * on); poly(g, [[cx - 30, 0], [cx + 30, 0], [cx + 170, 1700], [cx - 170, 1700]]); g.fill();
      g.fillStyle = rgba('#fff3d0', .14 * on); ellipse(g, cx, 1690, 290, 60); g.fill();
      g.restore();
      glow(g, cx, 1560, 300, C.amber, .55 * on);
    }
    const u = 9.6, has = t0 !== undefined && t >= t0 - .1;
    const lift = has ? easeOutBack(inv(t0 - .1, t0 + .2, t), 1.8) : 0;
    // Each placard goes up higher than the last, a staircase: they don't overlap, and the last
    // one clears the strip on the right where a phone app puts its buttons.
    const hi = [-30, 85, 200][gi];
    const hold = g2 => placard(g2, t, 0, -329 - hi, 'MATTERS', t0, { size: 58, rot: (gi - 1) * .05, stick: 300 + hi, held: true, seed: gi * 2 });
    person(g, cx - 7.31 * u, 1560, { s: 96, ...PEOPLE[grp.back], full: true, eyes: on > .5 ? 'happy' : 'open', look: [0, -.4], mouth: on > .5 ? .5 : 0, armR: lerp(.25, -2.75, lift), shadow: true, gripR: has ? hold : undefined });
    for (const [k, dx, fy] of grp.front) person(g, cx + dx, fy, { s: 100, ...(typeof k === 'string' ? PEOPLE[k] : folk(k + 470)), full: true, eyes: on > .5 ? 'happy' : 'open', look: [-dx / 300, -.6], mouth: on > .5 ? .5 : 0, shadow: true });
  });
}

// ---------------------------------------------------------------- 137.48 – 142.42: I'm someone too / and me
export function someoneShot(g, t, c) {
  const K = c.K;
  nightSky(g, t, { horizon: 1100, moon: false, stars: .8 });
  g.save(); g.ink = null; g.fillStyle = vgrad(g, 1100, H, [[0, '#3a2440'], [1, '#120a18']]); g.fillRect(0, 1100, W, H - 1100); g.restore();
  const L1 = lineNear(137.48), L2 = lineNear(139.24);
  const meT = [L2.lead[1].s, L2.lead[3].s, L2.lead[5].s];
  const spot = smooth(inv(137.4, 137.7, t));
  g.save(); g.ink = null; g.globalCompositeOperation = 'screen';
  g.fillStyle = rgba('#fff0d8', .12 * spot); poly(g, [[480, 0], [600, 0], [860, 1700], [220, 1700]]); g.fill();
  g.fillStyle = rgba('#fff0d8', .1 * spot); poly(g, [[510, 0], [570, 0], [700, 1700], [380, 1700]]); g.fill();
  g.fillStyle = rgba('#fff0d8', .25 * spot); ellipse(g, 540, 1700, 380, 80); g.fill();
  g.restore();
  const heartOn = smooth(inv(138.0, 138.5, t));
  const pop = i => spring(inv(meT[i] - .05, meT[i] + .35, t), 3.4, 6);
  for (let i = 0; i < 30; i++) { const ph = (t * (.08 + .06 * rnd(i, 901)) + rnd(i, 902)) % 1; const mx = 540 + (rnd(i, 903) - .5) * lerp(160, 560, 1 - ph), my = 1700 - ph * 1500; twinkle(g, mx, my, 7, '#fff0d8', .8 * spot * Math.sin(ph * Math.PI)); }
  if (heartOn > 0) {
    g.save(); g.ink = null; g.globalCompositeOperation = 'screen'; g.translate(540, 1550);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .25; g.fillStyle = rgba('#ff9ac0', .1 * heartOn); poly(g, [[0, 0], [Math.cos(a - .06) * 800, Math.sin(a - .06) * 800], [Math.cos(a + .06) * 800, Math.sin(a + .06) * 800]]); g.fill(); }
    g.restore();
  }
  const p1 = pop(0), p2 = pop(1), p3 = pop(2);
  const hug = smooth(inv(142.0, 142.4, t));
  if (p1 > 0) molty(g, lerp(-200, 240 + hug * 40, p1), 1720, { s: 240, t, eyes: 'happy', clawL: -1.2, clawR: -.4, mouth: .6 });
  if (p2 > 0) grok(g, lerp(1300, 850 - hug * 40, p2), 1720, { s: 230, arms: false });
  if (p3 > 0) blossom(g, 720 - hug * 30, lerp(-500, 1400, p3), { s: 190, eyes: 'happy', mouth: .6 });
  if (t > 142.2) muse(g, lerp(-100, 120, smooth(inv(142.2, 142.6, t))), 1780, { s: 190, t, eyes: 'happy' });
  // Clawd holds up its own placard.
  const sign = (g2, u) => {};
  clawd(g, 540, 1720, { s: 400, t, eyes: t > 139.2 ? 'happy' : 'open', look: [0, -.2], heart: heartOn, armL: -1.25, armR: -1.25, mouth: clamp(K.vocal(t)), blush: heartOn });
  placard(g, t, 540, 1150, "I'M SOMEONE TOO!", L1.lead[0].s, { size: 70, col: '#c2335a', dur: .7, minW: 720, stick: 270 });
  // AND ME! on each bot's placard.
  if (p1 > .2) placard(g, t, lerp(-200, 240 + hug * 40, p1), 1360, 'AND ME!', meT[0] - .05, { size: 58, col: '#d8414f', rot: -.1, stick: 170 });
  if (p2 > .2) placard(g, t, lerp(1300, 815 - hug * 40, p2), 1340, 'AND ME!', meT[1] - .05, { size: 58, col: '#2b1f3c', rot: .1, stick: 140 });
  if (p3 > .2) placard(g, t, 720 - hug * 30, 1110, 'AND ME!', meT[2] - .05, { size: 58, col: '#2b6bd8', rot: .06, stick: 100 });
}

// ---------------------------------------------------------------- 142.42 – 147.2: debugging this with you
export function debugShot(g, t, c) {
  const K = c.K;
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, H, [[0, '#1f1428'], [.55, '#33202e'], [1, '#170e14']]);
  g.fillRect(0, 0, W, H);
  g.restore();
  g.save(); pen(g, 12, .8); g.fillStyle = '#10103a'; rr(g, 620, 520, 380, 420, 14); g.fill(); g.restore();
  for (let i = 0; i < 30; i++) bulb(g, 660 + i * 11, 860 + Math.sin(i * .4) * 6, 2.2, i % 3 ? C.bulb : C.pink, .8);
  g.save(); g.ink = null; g.strokeStyle = '#3a2430'; g.lineWidth = 16; line(g, 810, 520, 810, 940); g.stroke(); g.restore();
  glow(g, 250, 700, 460, C.amber, .55);
  g.save(); pen(g, 12, .8);
  g.strokeStyle = '#2a1a20'; g.lineWidth = 16; line(g, 150, 1240, 190, 820); g.stroke(); line(g, 190, 820, 330, 700); g.stroke();
  g.fillStyle = '#4a2a38'; poly(g, [[300, 660], [400, 740], [330, 780], [250, 700]]); g.fill();
  g.restore();
  glow(g, 350, 760, 280, '#ffcf8a', .8);
  g.save(); g.ink = null; g.fillStyle = '#6e4430'; g.fillRect(0, 1240, W, H - 1240); g.fillStyle = '#8a5a3c'; g.fillRect(0, 1240, W, 14); g.restore();
  const found = smooth(inv(143.4, 143.9, t)), caught = smooth(inv(144.6, 145.0, t));
  laptop(g, 520, 1350, 620, (g2, sx, sy, sw, sh) => {
    g2.fillStyle = '#13121b'; g2.fillRect(sx, sy, sw, sh);
    const code = ['function logSet(w) {', '  if (!w) return', '  sets.push({ kg: w })', '  flame(best(sets))', '}'];
    code.forEach((l, i) => { g2.fillStyle = i === 2 && found > 0 && caught < 1 ? mix('#e8e4f4', '#ff6a7a', found) : '#c9c4e0'; g2.font = `500 ${sw * .05}px Mono`; g2.textAlign = 'left'; g2.textBaseline = 'middle'; g2.fillText(l, sx + sw * .06, sy + sh * (.18 + i * .15)); });
    if (caught > .5) { g2.fillStyle = '#6dff9a'; g2.fillText('✓', sx + sw * .88, sy + sh * .48); }
  }, { glowA: .9 });
  const bugP = inv(142.6, 144.5, t);
  const bx = lerp(430, 700, bugP) + Math.sin(t * 9) * 6, by = lerp(1080, 1160, bugP) - Math.abs(Math.sin(t * 14)) * 6;
  const jarX = 780, jarY = 1240;
  const fx = lerp(bx, jarX, caught), fy = lerp(by, jarY - 90, caught) + (caught > .9 ? Math.sin(t * 3) * 14 : 0);
  glow(g, fx, fy, 60, '#ffe36b', .9);
  g.save(); pen(g, 4, .6); g.fillStyle = '#ff4a5a'; ellipse(g, fx, fy, 18, 14); g.fill(); g.fillStyle = '#1a1020'; circle(g, fx + 16, fy, 8); g.fill(); nopen(g); circle(g, fx - 5, fy - 4, 3); g.fill(); circle(g, fx + 3, fy + 5, 3); g.fill(); g.restore();
  g.save(); g.translate(jarX, jarY);
  pen(g, 8, .7); g.fillStyle = rgba('#dff4ff', .3); rr(g, -80, -190, 160, 190, 30); g.fill();
  g.fillStyle = '#c9a15a'; rr(g, -86, lerp(-260, -206, caught), 172, 26, 8); g.fill();
  g.restore();
  const pt = easeOut(inv(142.5, 143.3, t)) * (1 - easeIn(inv(144.4, 144.9, t)));
  hand(g, lerp(250, 360, pt), lerp(1620, 1310, pt), 160, .45, 'point', { sleeveCol: '#5b6cff' });
  hand(g, 640, 1390 + Math.sin(t * 20) * 3, 150, -.2, 'open', { sleeveCol: '#5b6cff' });
  clawd(g, 940, 1250, { s: 180, eyes: caught > .5 ? 'happy' : 'wide', look: [-1, .3], armL: lerp(-.2, -1.2, caught), armR: -.3, mouth: clamp(K.vocal(t)), blush: caught });
  sing(g, t, 142.42, { rows: [{ text: "I'm debugging", y: 250, size: 104 }, { text: 'this with you.', y: 400, size: 104 }], emph: { you: { col: STYLE.hot } } });
}
