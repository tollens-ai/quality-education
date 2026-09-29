// Verse 1: the app works, then it fails, ility by ility. One picture a line, each built on the words.
import { W, H, clamp, inv, easeOut, backOut, beatPos, beatPulse, downPulse, words, elastic, lerp, smooth } from '../kit.js';
import { shot, join } from '../shots.js';
import { paper } from '../paper.js';
import { write, measure } from '../hand.js';
import { blob, line, dot, hatch } from '../pencil.js';
import { clawd, dachshund } from '../chars.js';
import { person, dogFront, capsule } from '../people.js';
import { rosette, sparkle, burst, tick, cross, paw, phone, oldPhone, clipboard, calendar, rubberStamp, bubble } from '../props.js';
import { ground, meadow, sky, groove, pop, ramp } from '../common.js';
import { sing } from '../lyrics.js';
import { rrect, ellipse, scallop, star } from '../shapes.js';
import { GRAPHITE, C } from '../palette.js';

export function register(S) {
  // Line 1: it works.
  const l0 = words('Verse 1', 'Correct I built');
  const l1 = words('Verse 1', 'An older phone');
  shot(2.321, 6.95, (g, t, sh) => drawL0(g, t, l0), { id: 'v1-0' });
  join(6.524, 6.946, 'scribble', { col: '#8d8c97' });
  shot(6.524, 10.0, (g, t, sh) => drawL1(g, t, l1), { id: 'v1-1' });
}

// ------------------------------------------------------------------- 1 "Correct I built it..."
// Clawd shows the app booking walks: a clipboard of checks ticks itself, the calendar fills with paw
// stamps on the beats, and on "brilliantly" a blue rosette is pinned on with a burst.
function drawL0(g, t, ws) {
  paper(g);
  sky(g, t, 780, { alpha: .26, col: '#79c2ef' });
  const gr = groove(t, 1);
  const T = i => ws[i].s;
  meadow(g, t, 1330);
  // The line, top of the page; its tail is the first ility.
  const out = { t0: ws[ws.length - 1].e + .3, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: C.blue, tailBubble: { fill: C.sky, edge: '#1f3f8f', e: 2.0, f: 1.35 }, hi: { 0: C.blue }, seed: 4, out, w: .1 });
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
  if (cp > 0) { g.save(); g.translate(150, 1300); g.scale(cp, cp); g.translate(-150, -1300); clipboard(g, 150, 1300, .95, t, { prog: ck, tilt: -.14 + gr.lean * 2 }); g.restore(); }
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
}

// ------------------------------------------------------------------- 2 "An older phone? The store says no..."
// An owner holds up an old phone at the App Store counter; the bulldog clerk stamps NO on the beat
// of "no,"; question marks pop over her, and the COMPATIBILITY ribbon hangs empty.
function drawL1(g, t, ws) {
  paper(g);
  sky(g, t, 780, { alpha: .26, col: '#79c2ef' });
  const gr = groove(t, 1);
  const T = i => ws[i].s;
  meadow(g, t, 1400, { seed: 8 });
  const out = { t0: ws[ws.length - 1].e + .4, dur: .3 };
  sing(g, t, ws, { y: 225, size: 90, maxW: 980, tail: 1, tailCol: C.green, tailBubble: { fill: C.lime, edge: '#245c1d', e: 2.0, f: 1.35 }, seed: 5, out, w: .1 });
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
    blob(g, rrect(0, 0, 300, 138, 18, 3), { fill: null, line: C.red, lw: 11, seed: 231, t });
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
}
