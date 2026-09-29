// Verse 1: the app works, then it fails, ility by ility. One picture a line, each built on the words.
import { W, H, clamp, inv, easeOut, backOut, beatPos, beatPulse, downPulse, words, elastic, lerp, smooth, hash, loud, sway } from '../kit.js';
import { shot, join } from '../shots.js';
import { paper } from '../paper.js';
import { write, measure } from '../hand.js';
import { blob, line, dot, hatch } from '../pencil.js';
import { clawd, dachshund } from '../chars.js';
import { person, dogFront, capsule } from '../people.js';
import { rosette, sparkle, burst, tick, cross, paw, phone, oldPhone, clipboard, calendar, rubberStamp, bubble } from '../props.js';
import { ground, meadow, sky, groove, pop, ramp } from '../common.js';
import { scrub } from '../pencil.js';
import { sing } from '../lyrics.js';
import { park, pigeon, butterfly, sun, cloud, tree, flower } from '../world.js';
import { spring, shake, hop, gate, ease } from '../life.js';
import { drawBall } from '../board.js';
import { rrect, ellipse, scallop, star } from '../shapes.js';
import { GRAPHITE, C } from '../palette.js';

export function register(S) {
  const l0 = words('Verse 1', 'Correct? I built');
  const l1 = words('Verse 1', 'An older phone');
  const l2 = words('Verse 1', 'The sign-ups');
  const l3 = words('Verse 1', 'It died at night');
  shot(2.321, 6.95, (g, t, sh) => { window.__markInk = GRAPHITE; drawL0(g, t, l0); }, { id: 'v1-0' });
  join(6.524, 6.946, 'push', { dir: [-1, 0] });
  shot(6.524, 9.94, (g, t, sh) => { window.__markInk = GRAPHITE; drawL1(g, t, l1); }, { id: 'v1-1' });
  join(9.503, 9.933, 'push', { dir: [-1, 0] });
  shot(9.503, 13.31, (g, t, sh) => { window.__markInk = GRAPHITE; drawL2(g, t, l2); }, { id: 'v1-2' });
  join(12.9, 13.3, 'iris', { at: [800, 700], col: '#f5eedd' });
  shot(12.9, 16.6, (g, t, sh) => { window.__markInk = '#f5eedd'; drawL3(g, t, l3); }, { id: 'v1-3' });
}

// ------------------------------------------------------------------- 1 "Correct I built it..."
// Clawd shows the app booking walks: a clipboard of checks ticks itself, the calendar fills with paw
// stamps on the beats, and on "brilliantly" a blue rosette is pinned on with a burst.
function drawL0(g, t, ws) {
  const gr = groove(t, 1);
  const T = i => ws[i].s;
  const bril = t > T(12) - .05;
  park(g, t, { horizon: 1330, mood: bril ? 'shades' : 'happy', look: [.5, .5], seed: 11, sunAt: [135, 905], sunR: 84 });
  // The line, top of the page; its tail is the first ility (lettered last, at the end, so it is never covered).
  const out = { t0: ws[ws.length - 1].e + .3, dur: .3 };
  // The phone on the right: WALKIES, a calendar that fills as walks are booked.
  const pk = pop(t, 2.9, .3);
  const stamps = t < T(8) ? 0 : 1 + (t > T(10) ? 1 : 0) + (t > T(11) ? 1 : 0) + (t > T(12) - .05 ? 2 : 0) + (t > T(12) + .3 ? 1 : 0);
  g.save();
  g.translate(820, 1160 + (1 - pk) * 600);
  g.rotate(gr.lean * .8);
  phone(g, 0, 0, 400, 730, t, {
    seed: 3, body: C.navy, glow: '#eaf4ff',
    screen: (g2, r) => {
      write(g2, 'WALKIES', r.x + r.w / 2, r.y + 78, 56, { col: C.blue, seed: 31, t, align: 'center' });
      paw(g2, r.x + r.w / 2 + 158, r.y + 48, 40, t, { col: C.brown, seed: 33 });
      calendar(g2, r.x + r.w / 2, r.y + r.h / 2 + 38, r.w - 30, r.h - 210, t, { seed: 9, stamps, pop: 1 });
      if (t > T(12) + .05) { const k = backOut(inv(T(12) + .05, T(12) + .3, t), 2.4); g2.save(); g2.translate(r.x + r.w / 2, r.y + r.h - 58); g2.scale(k, k); blob(g2, rrect(0, 0, r.w - 50, 70, 24, 3), { fill: C.green, line: GRAPHITE, lw: 5.4, seed: 35, t, hw: 4.6, tone: .8 }); write(g2, 'BOOKED!', 0, 20, 46, { col: '#fbf8ef', seed: 36, t, align: 'center' }); g2.restore(); }
    },
  });
  g.restore();
  // Clawd, pleased, with a clipboard of checks.
  const ck = [inv(T(3), T(3) + .16, t) * (t > T(3) ? 1 : 0), inv(T(6), T(6) + .18, t), inv(T(7) + .1, T(7) + .3, t)];
  clawd(g, { x: 430, y: 1560, s: 1.38, t, seed: 1, eyes: t > T(12) ? 'happy' : 'open', mouth: 0, bob: gr.bob, squash: gr.sq, lean: gr.lean, armL: { up: .55 + gr.bp * .2 }, armR: { up: .1 } });
  const cp = pop(t, T(1) - .1, .26);
  if (cp > 0) { g.save(); g.translate(150, 1300); g.scale(cp, cp); g.translate(-150, -1300); clipboard(g, 150, 1300, .95, t, { prog: ck, tilt: -.14 + gr.lean * 2, labels: ['BOOK', 'CANCEL', 'PAY'] }); g.restore(); }
  // Bruce wags beside it.
  dachshund(g, { x: 890, y: 1690, s: .58, flip: -1, t, seed: 2, walk: 0, tail: beatPos(t) * .5, ear: gr.lean * 20, eyes: t > T(12) ? 'happy' : 'open', mouth: t > T(12) ? .5 : .1, bob: gr.bob * .7, tongue: t > T(12) });
  // "Brilliantly": the burst and the rosette.
  if (t > T(12) - .05) {
    const p = inv(T(12) - .05, T(12) + .35, t);
    burst(g, 820, 960, 250, 390, t, { col: C.yellow, seed: 4, prog: easeOut(p), n: 16, w: 10 });
    const k = backOut(inv(T(12), T(12) + .3, t), 2.6);
    g.save(); g.translate(980, 790); g.scale(k, k); rosette(g, 0, 0, 82, C.blue, t, { seed: 60, label: '', tilt: .18 }); g.restore();
    sparkle(g, 600, 800, 30 * k, t, { seed: 61, rot: t * 2 });
    sparkle(g, 1000, 1060, 26 * k, t, { seed: 62, rot: -t * 2 });
  }
  // The pigeon watches the calendar from the top of the phone, and gasps at the rosette.
  pigeon(g, t, 690, 800, .78, { flip: -1, state: bril ? 'gasp' : 'perch', look: -1 });
  sing(g, t, ws, { y: 262, size: 84, maxW: 980, tail: 1, tailCol: C.blue, tailBubble: { fill: C.sky, edge: '#1f3f8f', e: 2.0, f: 1.35 }, hi: { 0: '#2a4fa8' }, hiSize: { 0: 1.55 }, seed: 4, out, w: .1 });      // CORRECT? is the quality this line names: big, like the tails of the others
}

// ------------------------------------------------------------------- 2 "An older phone? The store says no..."
// An owner holds up an old phone at the App Store counter; the bulldog clerk stamps NO on the beat
// of "no,"; question marks pop over her, and the COMPATIBILITY ribbon hangs empty.
function drawL1(g, t, ws) {
  const gr = groove(t, 1);
  const T = i => ws[i].s;
  park(g, t, { horizon: 1400, mood: t > T(6) ? 'worried' : 'happy', look: [-.6, .6], seed: 12, trees: false });
  const out = { t0: ws[ws.length - 1].e + .4, dur: .3 };
  // The shop: awning, clerk, counter, on the right. It slides in with the scribble.
  const cx = 730;
  const slide = 1 - ramp(t, 6.55, 6.95);
  g.save(); g.translate(slide * 420, 0);
  // Poles first, then the striped canopy with a rounded hem.
  [-1, 1].forEach((side, i) => line(g, [[cx + side * 262, 950], [cx + side * 262, 1400]], { w: 14, col: '#8b5f2a', seed: 260 + i, t, spline: false, passes: 1 }));
  for (let i = 0; i < 7; i++) {
    const x0 = cx - 290 + i * 83, x1 = x0 + 83;
    const top0 = cx - 240 + i * 68.6, top1 = top0 + 68.6;
    const hem = [];
    for (let k = 0; k <= 6; k++) { const a = Math.PI * k / 6; hem.push([x0 + 41.5 + Math.cos(Math.PI - a) * 41.5, 956 + Math.sin(a) * 34]); }
    blob(g, [[top0, 878], [top1, 878], ...hem.slice().reverse()], { fill: i % 2 ? '#fbf8ef' : C.red, line: GRAPHITE, lw: 5.4, seed: 200 + i, t, hw: 4.6, tone: .7, dens: i % 2 ? .3 : 1 });
  }
  line(g, [[cx - 246, 878], [cx + 246, 878]], { w: 9, col: '#8b5f2a', seed: 270, t, spline: false, passes: 1 });
  write(g, 'APP STORE', cx, 846, 64, { col: GRAPHITE, seed: 7, t, align: 'center', prog: ramp(t, 6.7, 7.3, x => x), track: 6 });
  // The clerk, a bulldog in a paper cap, behind the counter; the stamp lifts and comes down on "no,".
  const stampDown = t < T(6) - .2 ? 0 : t < T(6) - .03 ? ramp(t, T(6) - .2, T(6) - .03, x => x * x) : 1 - ramp(t, T(6) + .08, T(6) + .5);
  dogFront(g, { x: cx, y: 1330, s: 1.3, breed: 'bulldog', t, seed: 3, eyes: t > T(6) ? 'squint' : 'dot', mouth: 0, body: true, bob: gr.bob * .5, collar: null, hat: (g2, top, rx) => { blob(g2, [[-rx * .5, top + 20], [-rx * .3, top - 34], [rx * .3, top - 34], [rx * .5, top + 20]], { fill: '#fbf8ef', line: GRAPHITE, lw: 5.4, seed: 210, t, hw: 4.6, tone: .8, dens: .3 }); line(g2, [[-rx * .5, top + 20], [rx * .5, top + 20]], { w: 9, col: C.red, seed: 211, t, spline: false, passes: 1 }); } });
  // The counter front, and its NO.
  blob(g, rrect(cx, 1490, 620, 210, 18, 3), { fill: '#c99a5a', shade: '#8b5f2a', line: GRAPHITE, lw: 6.6, seed: 220, t, hw: 5, tone: .7, sh: .3 });
  write(g, 'DOWNLOAD', cx, 1520, 52, { col: '#fbf8ef', seed: 221, t, align: 'center', track: 6 });
  rubberStamp(g, cx + 190, 1372 + stampDown * 8, 1.15, t, { down: stampDown, seed: 230 });
  blob(g, ellipse(cx + 190, 1290 + (1 - stampDown) * -90 * 1.15, 40, 34, 8), { fill: '#d6a165', line: GRAPHITE, lw: 5.6, seed: 231, t, hw: 4.8, tone: .5 });
  if (t > T(6)) {
    const k = backOut(inv(T(6), T(6) + .18, t), 2.6);
    g.save(); g.translate(cx - 60, 1480); g.rotate(-.1); g.scale(k, k);
    blob(g, rrect(0, 0, 300, 138, 18, 3), { fill: '#f3e2c0', line: C.red, lw: 11, seed: 231, t, tone: .95, dens: .25 });
    write(g, 'NO', 0, 50, 112, { col: C.red, seed: 232, t, align: 'center', w: .14 });
    g.restore();
  }
  g.restore();
  // The owner, left, holding up an old phone; she goes worried at the stamp.
  const worried = t > T(6);
  person(g, { x: 220 - (1 - ramp(t, 6.55, 6.95)) * 320, y: 1560, s: 1.28, t, seed: 4, hair: { style: 'bun', col: '#5d3b26' }, top: C.purple, bottom: '#5a4a8a', skin: '#c99266', eyes: worried ? 'wide' : 'dot', mouth: worried ? 'o' : 'smile', armR: { up: .55, out: .3 }, armL: { up: -.9 }, bob: gr.bob * .6, squash: gr.sq * .5, brow: worried ? 1 : 0, hold: { R: (g2, x, y) => oldPhone(g2, x + 8, y - 150, .78, t, { seed: 5, tilt: .1 }) } });
  // Question marks over her, and the empty ribbon.
  if (t > T(8)) {
    [[130, 1000, 0], [300, 930, .12], [200, 830, .24]].forEach(([x, y, d], i) => {
      const k = pop(t, T(8) + d, .2);
      if (k > 0) { g.save(); g.translate(x, y); g.scale(k, k); write(g, '?', 0, 0, 120 + i * 14, { col: C.purple, seed: 240 + i, t, align: 'center', w: .12 }); g.restore(); }
    });
  }
  if (t > T(9) - .1) {
    const k = pop(t, T(9) - .1, .3);
    g.save(); g.translate(370, 760); g.scale(k, k); rosette(g, 0, 0, 100, C.green, t, { seed: 250, state: 'ghost', q: true }); g.restore();
  }
  // The pigeon on the awning's rail turns to look at the stamp.
  pigeon(g, t, 985, 880, .7, { flip: -1, state: t > T(6) ? 'gasp' : 'perch', look: t > T(6) ? -1 : 1 });
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: C.green, tailBubble: { fill: C.lime, edge: '#245c1d', e: 2.0, f: 1.35 }, seed: 5, out, w: .1 });
}

// ------------------------------------------------------------------- 3 "The sign-ups soared..."
// A diving board over a paddling pool marked SERVER. Dogs (the sign-ups) join the end of the board on
// each beat while a counter runs up; on "performance" the board bends (the band's accent is on that
// word), on "dived," it dives into the pool and everyone splashes in; on "scale-ability!" the board snaps and
// the ribbon sinks.
const DOGS = [
  { coat: '#c9772f', shade: '#8f4a1c', at: 10.36, u: .86 }, { coat: '#3a3947', shade: '#1c1b24', at: 10.79, u: .70 }, { coat: '#e8d3a0', shade: '#b39a5c', at: 10.79, u: .54 },
  { coat: '#b5533c', shade: '#7d2f21', at: 11.22, u: .38, }, { coat: '#8d8c97', shade: '#5b5a66', at: 11.22, u: .22, big: 1.2 }, { coat: '#d9a12b', shade: '#9a6d14', at: 11.22, u: .07 },
];
function drawL2(g, t, ws) {
  const gr = groove(t, 1);
  const T = i => ws[i].s;
  park(g, t, { horizon: 1330, mood: t > 12.4 ? 'gasp' : t > 11.0 ? 'sweat' : 'happy', look: [.7, .7], seed: 13, trees: false, sunAt: [975, 745], sunR: 62 });
  const out = { t0: ws[ws.length - 1].e + .4, dur: .3 };
  // Geometry: the tower on the left, the board out to the right, the pool under its tip.
  const bx0 = 170, by0 = 900, bx1 = 990, L = bx1 - bx0;
  const nDogs = DOGS.filter(d => t >= d.at).length;
  const fall = clamp((t - 12.49) / .7);         // the sink, on "scalability"
  const snap = 0;
  const sagBase = 6 + nDogs * 10;
  const bend = t < 11.0 ? sagBase : lerp(sagBase, 90, ramp(t, 11.0, 11.7)) + ramp(t, 12.1, 12.6) * 60 + fall * 200;
  const boardY = u => by0 + bend * u * u;
  const boardPt = u => [bx0 + L * u, boardY(u)];
  // Tower, ladder.
  blob(g, rrect(bx0 - 10, 1180, 86, 560, 14, 2), { fill: '#a9793a', shade: '#6d4a1e', line: GRAPHITE, lw: 6, seed: 320, t, hw: 5, tone: .6, sh: .3 });
  for (let i = 0; i < 6; i++) line(g, [[bx0 - 48, 960 + i * 100], [bx0 + 28, 960 + i * 100]], { w: 9, col: '#6d4a1e', seed: 321 + i, t, spline: false, passes: 1 });
  // The pool.
  const px = 720, py = 1480;
  blob(g, ellipse(px, py, 380, 112, 14), { fill: '#3f7fc4', shade: '#1f3f8f', line: GRAPHITE, lw: 7, seed: 330, t, hw: 5, tone: .55, sh: .3 });
  blob(g, ellipse(px, py + 6, 344, 92, 14), { fill: '#8ccff5', line: null, seed: 331, t, hw: 4.6, tone: .5 });
  const over = clamp((t - 12.7) / .8);
  // The board: a plank drawn as a thick stroke through points.
  const pts = []; for (let k = 0; k <= 10; k++) pts.push(boardPt(k / 10));
  const boardEnd = 1;
  const bp = pts.filter((_, k) => k / 10 <= boardEnd + .001);
  line(g, bp, { w: 68, col: '#c99a5a', seed: 340, t, spline: true, passes: 1, taper: [.01, .01], flat: true, tooth: .5, wob: 1.6 });
  line(g, bp.map(([x, y]) => [x, y - 33]), { w: 6.5, col: GRAPHITE, seed: 341, t, spline: true, passes: 1, flat: true });
  line(g, bp.map(([x, y]) => [x, y + 33]), { w: 6.5, col: GRAPHITE, seed: 342, t, spline: true, passes: 1, flat: true });
  // The board creaks as the load builds.
  if (t > 11.4 && t < 12.6) { const k = Math.min(1, (t - 11.4) / .2); g.save(); g.translate(bx0 + L * .52, by0 - 90 - Math.sin(t * 30) * 3); g.rotate(-.06); g.scale(k, k); write(g, 'CREEEAK', 0, 0, 44, { col: C.red, seed: 345, t, align: 'center', track: 6 }); g.restore(); }
  // The dogs: on the board, then in the air, then in the pool.
  DOGS.forEach((d, i) => {
    const k = pop(t, d.at, .2);
    if (k <= 0) return;
    const [x0, y0] = boardPt(d.u);
    const slope = (boardY(Math.min(1, d.u + .05)) - boardY(d.u)) / (L * .05);
    const sc = .44 * (d.big || 1);
    let x = x0, y = y0 - 34, rot = Math.atan(slope), sq = 0;
    if (t > 12.49) {
      const f = clamp((t - 12.49 - i * .06) / .7);
      const tx = px - 260 + i * 100, ty = py - 34 + Math.sin(t * 5 + i) * 6;
      x = lerp(x0, tx, f); y = lerp(y0 - 34, ty, f * f) - Math.sin(f * Math.PI) * 240; rot = rot + f * (i % 2 ? .8 : -.7);
    }
    g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y);
    dachshund(g, { x, y, s: sc, t, seed: 20 + i, walk: t < 12.49 ? (t * 2 + i * .3) % 1 : 0, tail: t * 2 + i, ear: gr.lean * 20, eyes: t > 12.2 ? 'wide' : 'happy', mouth: t > 12.2 ? .7 : .1, coat: d.coat, shade: d.shade, lean: rot, bob: 0, collar: [C.red, C.green, C.purple, C.blue][i % 4], length: .9 });
    g.restore();
  });
  // The front of the pool over the dogs, and the water it spills.
  g.save(); g.beginPath(); g.rect(0, py + 4, W, 260); g.clip();
  blob(g, ellipse(px, py, 380, 112, 14), { fill: '#3f7fc4', line: null, seed: 332, t, hw: 4.6, tone: .55, dens: .7 });
  g.restore();
  line(g, [[px - 380, py], [px - 350, py + 76], [px, py + 112], [px + 350, py + 76], [px + 380, py]], { w: 8, col: GRAPHITE, seed: 333, t, spline: true, passes: 2, alpha: .85 });
  if (over > 0) [[-300, 1], [40, -1], [280, 1]].forEach(([dx, sgn], i) => line(g, [[px + dx, py + 104], [px + dx + sgn * 30 * over, py + 104 + 60 * over], [px + dx + sgn * 44 * over, py + 104 + 130 * over]], { w: 16, col: '#8ccff5', seed: 334 + i, t, spline: true, passes: 1, taper: [.02, .9], alpha: .85 }));
  // Splash as they go in, on "scalability".
  if (t > 12.5 && t < 13.3) for (let i = 0; i < 14; i++) {
    const a = -Math.PI * (.2 + hash(i, 5) * .6), v = 380 + hash(i, 6) * 260, tt = t - 12.6;
    if (tt < 0) continue;
    const x = 800 + Math.cos(a) * v * tt * (i % 2 ? 1 : -1), y = 1440 + Math.sin(a) * v * tt + 900 * tt * tt;
    if (y < 1560) blob(g, ellipse(x, y, 18, 26, 6), { fill: '#8ccff5', line: GRAPHITE, lw: 3.4, seed: 350 + i, t, hw: 4, tone: .8 });
  }
  blob(g, rrect(px - 240, py + 172, 310, 84, 12, 2), { fill: '#fbf8ef', line: GRAPHITE, lw: 5, seed: 337, t, hw: 4.6, tone: .9, dens: .25 });
  write(g, 'SERVER', px - 240, py + 198, 56, { col: '#2a4fa8', seed: 336, t, align: 'center', track: 6 });
  // The counter on the tower: SIGN-UPS running up.
  const cnt = t < 10.25 ? 12 : Math.round(12 * Math.pow(9000 / 12, easeOut(inv(10.25, 11.5, t))));
  const cs = cnt.toLocaleString('en-GB');
  blob(g, rrect(bx0 + 150, 1090, 290, 140, 14, 3), { fill: '#fbf8ef', line: GRAPHITE, lw: 6, seed: 360, t, hw: 4.6, tone: .9, dens: .25 });
  write(g, 'SIGN-UPS', bx0 + 150, 1046, 28, { col: GRAPHITE, seed: 361, t, align: 'center', track: 6 });
  write(g, cs, bx0 + 150, 1122, 66, { col: t > 11.5 ? C.red : C.green, seed: 362, t, align: 'center', w: .12 });
  if (t > 10.3 && t < 11.5) { const ar = ramp(t, 10.3, 11.5); line(g, [[bx0 + 340, 1150 - ar * 100], [bx0 + 340, 1150 - ar * 100 - 70]], { w: 14, col: C.green, seed: 363, t, spline: false, passes: 1 }); }
  // The stopwatch on "performance": how long a booking takes, climbing as the queue grows (speed dives).
  if (t > 10.98) {
    const k = pop(t, 10.98, .25);
    const secs = 0.4 * Math.pow(150, ramp(t, 11.0, 12.5, x => x));
    const lab = secs < 10 ? secs.toFixed(1) : String(Math.round(secs));
    g.save(); g.translate(310, 1320); g.scale(k * 1.35, k * 1.35);      // (big: this is how the viewer learns what "performance" is)
    blob(g, ellipse(0, 0, 84, 84, 14), { fill: '#fbf8ef', line: GRAPHITE, lw: 6, seed: 380, t, hw: 4.6, tone: .9, dens: .25 });
    blob(g, rrect(0, -100, 30, 26, 6, 2), { fill: '#a8a7b2', line: GRAPHITE, lw: 5, seed: 381, t, hw: 4.4 });
    write(g, lab + 'S', 0, 20, 58, { col: secs > 8 ? C.red : C.green, seed: 382, t, align: 'center', w: .12 });
    write(g, 'BOOK A WALK', 0, -34, 20, { col: GRAPHITE, seed: 383, t, align: 'center', track: 3 });
    g.restore();
  }
  // The ribbon drops from the break into the pool and sinks.
  if (t > T(8) - .05) {
    const k = pop(t, T(8) - .05, .25);
    const f = clamp((t - (T(8) + .1)) / .9);
    const y = lerp(880, py - 30, f * f);
    const sink = ramp(t, T(8) + .9, T(8) + 1.6, x => x);
    g.save(); g.translate(bx0 + L * .55 + 40, y + sink * 120); g.scale(k, k); g.globalAlpha *= 1 - sink * .5; rosette(g, 0, 0, 84, C.purple, t, { seed: 370, state: f > .95 ? 'wilt' : 'new', tilt: f * .8 }); g.restore();
  }
  // The pigeon on the tower's top, watching the board sag.
  pigeon(g, t, bx0 - 8, 905, .72, { state: t > 12.4 ? 'gasp' : 'perch', look: 1 });
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: C.purple, tailBubble: { fill: '#b79be6', edge: '#4a2f8a', e: 2.0, f: 1.35 }, seed: 6, out, w: .1, hi: { 1: C.blue, 3: C.red } });
}

// ------------------------------------------------------------------- 4 "It died at night..."
// The first dark page. Night, a moon, three houses with lit windows and a dog in each; the app on the
// ground flatlines on "died"; the dogs cry and howl; on "reliability!" its red ribbon floats off on a
// balloon past the moon.
function drawL3(g, t, ws) {
  const CREAM = '#f5eedd';
  paper(g, { base: '#1c2552', vignette: .25 });
  const gr = groove(t, .8);
  const T = i => ws[i].s;
  // Stars, drawn in over the first bars.
  for (let i = 0; i < 22; i++) {
    const x = 60 + hash(i, 1) * 960, y = 560 + hash(i, 2) * 620;
    const a = 13.35 + hash(i, 3) * .9;
    if (t > a && (y > 560)) sparkle(g, x, y, 10 + hash(i, 4) * 10 + Math.sin(t * 6 + i) * 3, t, { col: '#fff3b0', seed: 400 + i, rot: hash(i, 5) });
  }
  // The moon.
  const mo = pop(t, 13.4, .4);
  g.save(); g.translate(800, 700); g.scale(mo, mo);
  blob(g, ellipse(0, 0, 175, 175, 16), { fill: '#f7d774', shade: '#e0a93a', line: CREAM, lw: 5, seed: 410, t, hw: 6, tone: .5, sh: .3 });
  [[-50, -40, 28], [38, 50, 20], [62, -62, 15]].forEach(([x, y, r], i) => blob(g, ellipse(x, y, r, r, 8), { fill: '#e0a93a', line: null, seed: 411 + i, t, hw: 4.4, tone: .6 }));
  // The moon has a face: content, then worried when the app dies, then weeping with the dogs.
  {
    const dead = t > T(1), weep = t > T(5), FACE = '#2a1f08';
    [-1, 1].forEach((sd, i) => {
      const ex = sd * 58, ey = -14;
      if (!dead) line(g, [[ex - 20, ey + 4], [ex, ey + 14], [ex + 20, ey + 4]], { w: 8, col: FACE, seed: 420 + i, t, passes: 1 });
      else { dot(g, ex, ey, 11, { col: FACE, seed: 422 + i, t }); line(g, [[ex - 26, ey - 26 - sd * 0], [ex + 22 * sd * -1, ey - 36]], { w: 7, col: FACE, seed: 424 + i, t, passes: 1, spline: false }); }
      if (weep) line(g, [[ex, ey + 18], [ex + sd * 4, ey + 46 + ((t * 40) % 30)]], { w: 7, col: '#8ccff5', seed: 426 + i, t, passes: 1, spline: false, alpha: .9 });
    });
    if (!dead) line(g, [[-30, 50], [-10, 62], [10, 62], [30, 50]], { w: 8, col: FACE, seed: 428, t, passes: 1 });
    else line(g, [[-26, 66], [0, 52], [26, 66]], { w: 8, col: FACE, seed: 428, t, passes: 1 });
  }
  g.restore();
  // The ground and the houses.
  scrub(g, [0, 1440, W, H], { col: '#2f6b4e', seed: 420, t, gap: 22, w: 26, alpha: .7, angle: -.1, wig: 24 });
  scrub(g, [0, 1500, W, H], { col: '#1f4a37', seed: 421, t, gap: 34, w: 22, alpha: .5, angle: .2, wig: 20 });
  const HX = [180, 540, 900];
  HX.forEach((hx, i) => {
    const arrive = pop(t, 13.4 + i * .1, .3);
    g.save(); g.translate(hx, 1400); g.scale(arrive, arrive); g.translate(-hx, -1400);
    blob(g, rrect(hx, 1250, 340, 420, 10, 2), { fill: '#4a5aa8', shade: '#2a3470', line: CREAM, lw: 6, seed: 430 + i, t, hw: 5, tone: .6, sh: .3 });
    blob(g, [[hx - 200, 1058], [hx, 920], [hx + 200, 1058]], { fill: '#a34a5c', shade: '#6d2a3a', line: CREAM, lw: 6, seed: 435 + i, t, hw: 5, tone: .7 });
    // The window: lit, with a dog in it.
    blob(g, rrect(hx, 1220, 250, 260, 10, 2), { fill: '#f7d774', shade: '#e0a93a', line: CREAM, lw: 6, seed: 440 + i, t, hw: 5, tone: .85 });
    const sob = t > T(4) - .1;
    const howl = t > T(7) && t < T(8) + .7 ? clamp(loud('vocals', t) * 1.4) : 0;
    dogFront(g, { x: hx, y: 1330, s: .86, t, seed: 50 + i, breed: ['beagle', 'lab', 'corgi'][i], eyes: t > T(1) ? 'sad' : 'dot', mouth: howl > .2 ? .8 : 0, collar: [C.red, C.blue, C.green][i], body: false, tilt: sway(t) * .03, brow: 0 });
    // Tears: blue drops running down from the eyes on each beat, after "dogs".
    if (t > T(5)) for (let k = 0; k < 2; k++) {
      const ph = (t * 2 + i * .3 + k * .5) % 1;
      blob(g, ellipse(hx + (k ? 32 : -32), 1235 + ph * 70, 8, 13, 6), { fill: '#8ccff5', line: null, seed: 450 + i * 4 + k, t, gap: 4, hw: 4, tone: .9 });
    }
    // A lead in its mouth, hanging.
    line(g, [[hx + 6, 1350], [hx + 70, 1400], [hx + 50, 1460]], { w: 8, col: C.red, seed: 455 + i, t, spline: true, passes: 1 });
    g.restore();
  });
  // AWOOO drifts up from each window on the howl.
  if (t > T(7)) HX.forEach((hx, i) => {
    const a = T(7) + i * .12, p = clamp((t - a) / 1.2);
    if (p <= 0 || p >= 1) return;
    g.save(); g.globalAlpha *= (1 - p * p * p);
    write(g, 'AWOOO', hx + 30, 940 - p * 260, 68 + p * 30, { col: CREAM, seed: 460 + i, t, align: 'center', w: .12, rot: -.15 + i * .1 });
    g.restore();
  });
  // The phone on the ground: alive, then flatlined at "died".
  const dead = t > T(1);
  const pk = pop(t, 13.3, .3);
  g.save(); g.translate(540, 1690); g.rotate(-.06); g.scale(pk, pk);
  phone(g, 0, 0, 540, 320, t, { seed: 470, body: '#5b5a66', glow: dead ? '#15171f' : '#dcf5e4', screen: (g2, r) => {
    if (!dead) { write(g2, 'WALKIES', r.x + r.w / 2, r.y + 60, 44, { col: C.green, seed: 471, t, align: 'center' }); paw(g2, r.x + r.w / 2 + 150, r.y + 40, 34, t, { col: C.green, seed: 472 }); }
    else {
      write(g2, "SORRY, WE'RE DOWN", r.x + r.w / 2, r.y + r.h / 2 + 50, 50, { col: '#ffa898', seed: 473, t, align: 'center', track: 3, w: .11, prog: ramp(t, T(1), T(1) + .4, x => x) });
      write(g2, 'X X', r.x + r.w / 2, r.y + 62, 34, { col: CREAM, seed: 474, t, align: 'center' });
    }
  } });
  g.restore();
  // Goodbye: the ribbon floats up on a balloon past the moon.
  const rb = T(9);
  if (t > rb - .3) {
    const p = clamp((t - (rb - .3)) / 2.2);
    const x = 540 + Math.sin(p * 3.2) * 90 + p * 200, y = 1560 - p * 1360;
    const k = pop(t, rb - .3, .25);
    line(g, [[x, y + 150], [x - 10, y + 250], [x + 6, y + 330]], { w: 4, col: CREAM, seed: 480, t, spline: true, passes: 1, alpha: .8 });
    blob(g, ellipse(x, y + 60, 74, 92, 12), { fill: C.red, shade: '#8a1f1a', line: CREAM, lw: 5, seed: 481, t, hw: 5, tone: .6, sh: .3 });
    g.save(); g.translate(x, y + 60); g.scale(k, k); rosette(g, 0, 0, 44, C.red, t, { seed: 482, tilt: Math.sin(t * 3) * .2 }); g.restore();
  }
  // The line, in cream, its tail red.
  const out = { t0: ws[ws.length - 1].e + .4, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, col: CREAM, tailCol: C.red, tailBubble: { fill: '#e8504a', edge: CREAM, e: 2.0, f: 1.35 }, seed: 7, out, w: .1 });
}
