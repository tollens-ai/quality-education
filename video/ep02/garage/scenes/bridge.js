// Bridge: what an oracle is. The quiet part: the sensitive one takes it, and the garage becomes a
// fairground of home-made machines for telling right from wrong.
import { C, TAU, clamp, lerp, smooth, easeOut, easeOutBack, rr, circle, ellipse, poly, line, rnd, INK, rgba, mix, shade } from '../kit.js';
import { cut, marker, field, tape, doodle, doodleField, tornRect, speedLines, sunburst, checker, hatch } from '../zine.js';
import { sing, lineNear } from '../lyrics.js';
import { letter } from '../hand.js';
import { member, play } from '../band.js';
import { bug } from './chorus.js';

// ---------------------------------------------------------------- 1: the oracle booth
// A cardboard fortune-teller's booth. Inside, no magic: the crystal ball shows the bug, circled.
export function oracleShot(g, t, c, o = {}) {
  const L = o.line;
  field(g, C.plum);
  doodleField(g, 30, 120, 1020, 700, 14, 101, { kinds: ['star', 'sparkle'], col: C.cream, cols: [C.lemon, C.cream, C.lilac] });
  const K = c.K;
  // The booth: a striped awning over a counter.
  g.save(); g.translate(540, 0);
  cut(g, () => rr(g, -400, 880, 800, 720, 16), C.violet, { drop: 14 });
  for (let k = 0; k < 8; k++) cut(g, () => { g.beginPath(); g.moveTo(-420 + k * 105, 820); g.lineTo(-420 + (k + 1) * 105, 820); g.lineTo(-420 + (k + 1) * 105, 930); g.quadraticCurveTo(-420 + (k + .5) * 105, 990, -420 + k * 105, 930); g.closePath(); }, k % 2 ? C.cream : C.pink, { drop: 8, inkW: 3 });
  cut(g, () => rr(g, -300, 760, 600, 90, 14), C.yellow, { drop: 8 });
  letter(g, 'ORACLE', 0, 832, 66, { col: C.ink, w: .2, align: 'center', seed: 5 });
  g.restore();
  // The sensitive one in a fortune-teller's scarf, hands over the ball.
  member(g, 540, 1330, 'soft', { s: 360, t, eyes: 'closed', look: [0, .4], legs: 0, armL: -.5, armR: -.5, mouth: clamp(K.vocal(t) * 1.2),
    dressTop: (g2, u, b) => { g2.save(); g2.drop = null; g2.ink = INK.col; g2.inkW = 2.6; g2.fillStyle = C.gold; for (let k = -3; k <= 3; k++) { circle(g2, k * u * .8, b.by + u * .1, u * .22); g2.fill(); } g2.restore(); } });
  cut(g, () => rr(g, 140, 1390, 800, 210, 14), '#5a2d8a', { drop: 10 });
  // The crystal ball: a flat pale disc on a stand, a bug inside, circled in red once it's found.
  const glowR = 118 + Math.sin(t * 3) * 5, by = 1360;
  cut(g, () => rr(g, 480, by + 90, 120, 50, 12), C.gold, { drop: 6 });
  marker(g, () => circle(g, 540, by, glowR), '#d9ccff', 4);
  g.save(); circle(g, 540, by, glowR - 4); g.clip();
  g.save(); g.drop = null; g.ink = null; g.fillStyle = rgba('#ffffff', .35); ellipse(g, 500, by - 55, 40, 20, -.5); g.fill(); g.restore();
  bug(g, 540 + Math.sin(t * 2) * 24, by + 8, 74, Math.sin(t * 3) * .3, t, C.red);
  g.restore();
  const found = clamp((t - L - 2.0) / .4);
  if (found > 0) { g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.red; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.ellipse(540, by + 8, 96, 72, -.1, 0, TAU * found); g.stroke(); g.restore(); }
  sing(g, t, L, {
    rows: [{ text: 'An oracle is', y: 300, size: 118, rot: -.02 }, { text: 'something that can', y: 450, size: 88, rot: .015, ci: 1 },
      { text: 'help me figure out', y: 590, size: 88, rot: -.015, ci: 2 }, { text: "what's wrong!", y: 730, size: 104, rot: .02, ci: 3 }],
    paper: { cols: [C.yellow, C.cream, C.cream, C.cream] }, maxW: 880,
    emph: { oracle: { col: C.violet }, wrong: { col: C.red } },
  });
}

// ---------------------------------------------------------------- 2: rules, run all day long
// The rules on cards round a hamster wheel; the band runs it while the sun and moon go round.
export function rulesShot(g, t, c, o = {}) {
  const L = o.line;
  const day = (t - L) * .6;
  const sky = mix(C.sky, C.navy, (Math.sin(day * TAU) * .5 + .5));
  field(g, sky);
  // The sun and moon on a wheel of their own.
  g.save(); g.translate(540, 1300); g.rotate(day * TAU);
  cut(g, () => circle(g, 0, -620, 70), C.yellow, { drop: 8 });
  cut(g, () => { g.beginPath(); g.arc(0, 620, 60, 0, TAU); g.moveTo(40, 600); g.arc(25, 600, 50, 0, TAU, true); }, C.cream, { drop: 8 });
  g.restore();
  // The wheel.
  const spin = (t - L) * 2.4;
  g.save(); g.translate(540, 1250);
  cut(g, () => { g.beginPath(); g.arc(0, 0, 340, 0, TAU); g.arc(0, 0, 300, 0, TAU, true); }, C.orange, { drop: 12, inkW: 3.4 });
  g.save(); g.rotate(spin);
  for (let k = 0; k < 10; k++) {
    g.save(); g.rotate(k / 10 * TAU); g.translate(0, -320);
    cut(g, () => rr(g, -44, -26, 88, 52, 8), [C.cream, C.mint, C.lemon][k % 3], { drop: 4, inkW: 2.4 });
    doodle(g, 'tick', 0, 0, 16, { col: C.green, w: 6 });
    g.restore();
  }
  g.save(); g.drop = null; g.ink = null; g.strokeStyle = INK.col; g.lineWidth = 8;
  for (let k = 0; k < 6; k++) { g.rotate(TAU / 6); line(g, 0, 0, 0, -300); g.stroke(); }
  g.restore();
  g.restore();
  cut(g, () => circle(g, 0, 0, 40), C.ink, { drop: 6 });
  g.restore();
  // Three of the band running inside at the bottom of the wheel.
  const bp = c.K.beatPos(t);
  ['builder', 'lead', 'bad'].forEach((m, k) => {
    member(g, 390 + k * 150, 1560 - Math.abs(k - 1) * 22, m, { s: 185, t, eyes: 'happy', legs: bp * 2 + k * .3, lean: .18, armL: -.9 + Math.sin(t * 16 + k) * .5, armR: -.9 - Math.sin(t * 16 + k) * .5, shadow: false });
  });
  sing(g, t, L, {
    rows: [{ text: 'Cos if I know your rules', y: 300, size: 86, rot: -.02 }, { text: 'then I can run', y: 440, size: 96, rot: .015, ci: 1 },
      { text: 'and run them', y: 580, size: 96, rot: -.015, ci: 2 }, { text: 'all day long!', y: 730, size: 110, rot: .02, ci: 3 }],
    paper: { cols: [C.cream] }, maxW: 880,
    emph: { rules: { col: C.teal }, run: { col: C.orange }, long: { col: C.violet } },
  });
}

// ---------------------------------------------------------------- 3: heuristics beat nothing
// Two maps. One is blank. The other is drawn by thumb, rough and wobbly, and it gets them there.
export function heuristicsShot(g, t, c, o = {}) {
  const L = o.line;
  field(g, C.mint);
  doodleField(g, 30, 120, 1020, 700, 10, 111, { kinds: ['squiggle', 'star', 'sparkle'], col: C.ink });
  // Left: nothing. A blank map, a Clawd lost on it.
  g.save(); g.translate(290, 1180); g.rotate(-.05);
  cut(g, () => rr(g, -220, -300, 440, 600, 8), C.cream, { drop: 12 });
  letter(g, '?', 0, 60, 160, { col: rgba(C.ink, .22), w: .2, align: 'center', seed: 2 });
  g.restore();
  member(g, 290, 1640, 'elder', { s: 190, t, eyes: 'worried', look: [.5, -.5], legs: 0, armL: -1.8, armR: .2 });
  // Right: a rough map, drawn by hand, with a big thumb as its compass: a rule of thumb.
  g.save(); g.translate(790, 1180); g.rotate(.05);
  cut(g, () => rr(g, -220, -300, 440, 600, 8), C.lemon, { drop: 12 });
  const draw = clamp((t - L - .3) / 2.2);
  g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.red; g.lineWidth = 9; g.lineCap = 'round'; g.setLineDash([22, 16]);
  g.beginPath();
  const pts = [[-160, 230], [-120, 120], [20, 140], [60, 20], [-60, -60], [40, -160], [140, -220]];
  const n = Math.max(1, Math.floor(draw * (pts.length - 1)) + 1);
  pts.slice(0, n).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.stroke(); g.setLineDash([]); g.restore();
  doodle(g, 'x', 140, -220, 30, { col: C.red, w: 10 });
  // The thumb.
  g.save(); g.translate(-120, -170); g.rotate(-.2 + Math.sin(t * 3) * .08);
  cut(g, () => { rr(g, -40, -10, 80, 90, 24); }, C.skin, { drop: 6, inkW: 3 });
  cut(g, () => { rr(g, -26, -80, 44, 90, 22); }, C.skin, { drop: 0, inkW: 3 });
  g.restore();
  g.restore();
  member(g, 790, 1640, 'builder', { s: 190, t, eyes: 'happy', look: [0, -.5], legs: c.K.beatPos(t), armL: .2, armR: -2 });
  sing(g, t, L, {
    rows: [{ text: 'And even only', y: 300, size: 96, rot: -.02 }, { text: "heuristics I'd be", y: 440, size: 96, rot: .015, ci: 1 },
      { text: 'better off than', y: 580, size: 92, rot: -.015, ci: 2 }, { text: 'having none!', y: 730, size: 110, rot: .02, ci: 3 }],
    paper: { cols: [C.cream] }, maxW: 880,
    emph: { heuristics: { col: C.orange }, better: { col: C.green }, none: { col: C.red } },
  });
}

// ---------------------------------------------------------------- 4: check till they pass
// The checklist on the door: red crosses turn green one by one, then DONE is stamped.
export function doneShot(g, t, c, o = {}) {
  const L = o.line;
  field(g, C.navy);
  doodleField(g, 30, 120, 1020, 700, 12, 121, { kinds: ['star', 'sparkle'], col: C.cream, cols: [C.cream, C.lemon] });
  g.save(); g.translate(540, 1200); g.rotate(-.03);
  cut(g, () => rr(g, -330, -380, 660, 760, 14), C.cream, { drop: 14 });
  tape(g, -300, -370, 120, -.5); tape(g, 300, -370, 120, .5);
  for (let k = 0; k < 6; k++) {
    const y = -300 + k * 110;
    const pass = t > L + .5 + k * .35;
    marker(g, () => rr(g, -270, y - 36, 72, 72, 10), pass ? C.mint : C.bubble, 3);
    if (pass) doodle(g, 'tick', -234, y, 30, { col: C.green, w: 11 });
    else doodle(g, 'x', -234, y, 22, { col: C.red, w: 10 });
    g.save(); g.drop = null; g.ink = null; g.strokeStyle = rgba(C.ink, .45); g.lineWidth = 8; g.lineCap = 'round'; line(g, -160, y, 230 - (k % 3) * 60, y); g.stroke(); g.restore();
  }
  // A big green tick, stamped on "done" once every box is green.
  const done = lineNear(L, false).lead.find(w => /done/i.test(w.w));
  if (done && t >= done.s) {
    const p = easeOutBack(clamp((t - done.s) / .14), 2.6);
    g.save(); g.rotate(-.18); g.scale(lerp(1.6, 1, p), lerp(1.6, 1, p)); g.globalAlpha *= clamp(p * 2);
    g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.green; g.lineWidth = 16; rr(g, -170, -150, 340, 300, 30); g.stroke(); g.restore();
    doodle(g, 'tick', 0, 0, 110, { col: C.green, w: 30 });
    g.restore();
  }
  g.restore();
  // The lead, checking, pen in hand.
  member(g, 870, 1780, 'lead', { s: 250, t, eyes: 'open', look: [-.7, -.4], legs: 0, armL: -1.4, extL: 1.3 });
  sing(g, t, L, {
    rows: [{ text: 'So I can keep on', y: 300, size: 96, rot: -.02 }, { text: 'checking till they', y: 440, size: 96, rot: .015, ci: 1 },
      { text: 'pass before I say', y: 580, size: 92, rot: -.015, ci: 2 }, { text: "it's done!", y: 730, size: 124, rot: .02, ci: 3 }],
    paper: { cols: [C.cream, C.cream, C.cream, C.mint] }, maxW: 880,
    emph: { checking: { col: C.teal }, pass: { col: C.green }, done: { col: C.green } },
  });
}
