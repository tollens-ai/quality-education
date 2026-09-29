// Chorus 1: the ring by day. A sing-along board across the top, its ball hopping the words on the beat
// with Bruce running after it; under it, Clawd as judge presents the show dog (the app), and a row of
// dog heads along the foot of the page sings along. Each line has one gag; this cut has the first two.
import { W, H, clamp, inv, easeOut, backOut, beatPos, beatPulse, downPulse, words, lerp, hash, loud, sway, TAU } from '../kit.js';
import { shot, join } from '../shots.js';
import { paper } from '../paper.js';
import { write } from '../hand.js';
import { blob, line, scrub, dot } from '../pencil.js';
import { clawd, dachshund } from '../chars.js';
import { dogFront, person } from '../people.js';
import { rosette, sparkle, burst } from '../props.js';
import { groove, pop, ramp } from '../common.js';
import { sing } from '../lyrics.js';
import { BOARD, WORDS, ballPath, ballAt, drawBall, signBoard, wordsY } from '../board.js';
import { rrect, ellipse, star } from '../shapes.js';
import { GRAPHITE, C } from '../palette.js';

const ROSETTES = [C.red, C.orange, C.yellow, C.lime, C.green, C.teal, C.sky, C.blue, C.purple, C.pink, C.brown, C.grey];
const AUDIENCE = ['bulldog', 'lab', 'poodle', 'corgi', 'beagle', 'pug', 'husky', 'dalmatian'];

export function register(S) {
  const starts = ['Good in a dozen', 'Fast, but it', 'Ship it by', 'Save on the', 'Polish one part', 'Which of the'];
  const lines = starts.map(s => words('Chorus 1', s));
  const path = ballPath(lines);
  shot(30.144, 39.2, (g, t) => draw(g, t, lines, path), { id: 'c1' });
  join(30.144, 30.576, 'flip');
}

function bunting(g, t) {
  const y0 = 92, n = 13;
  line(g, [[0, y0 - 6], [W / 2, y0 + 30], [W, y0 - 6]], { w: 5, col: GRAPHITE, seed: 810, t, spline: true, passes: 1, alpha: .8 });
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n, x = W * u, y = y0 - 6 + 36 * Math.sin(u * Math.PI);
    const sw = Math.sin(beatPos(t) * Math.PI + i) * 4;
    blob(g, [[x - 30, y], [x + 30, y], [x + sw, y + 62]], { fill: ROSETTES[(i * 5) % 12], line: GRAPHITE, lw: 4.4, seed: 820 + i, t, hw: 4.4, tone: .7 });
  }
}

function ring(g, t) {
  scrub(g, [0, 760, W, H], { col: '#e6c88f', seed: 830, t, gap: 24, w: 28, alpha: .55, angle: -.1, wig: 24 });
  scrub(g, [0, 800, W, H], { col: '#d9a35a', seed: 831, t, gap: 40, w: 22, alpha: .25, angle: .2, wig: 20 });
  // The rope, on two posts.
  line(g, [[40, 800], [W / 2, 826], [W - 40, 800]], { w: 12, col: C.red, seed: 832, t, spline: true, passes: 1, tooth: .5 });
  [[40, 800], [W - 40, 800]].forEach(([x, y], i) => line(g, [[x, y - 30], [x, y + 150]], { w: 20, col: '#8b5f2a', seed: 833 + i, t, spline: false, passes: 1 }));
}

function table(g, t) {
  // A judging platform: a light wooden top over a blue front with white stars.
  blob(g, [[W / 2 - 330, 1440], [W / 2 + 330, 1440], [W / 2 + 290, 1400], [W / 2 - 290, 1400]], { fill: '#e2b878', shade: '#a9793a', line: GRAPHITE, lw: 6.4, seed: 840, t, hw: 5, tone: .7, sh: .4 });
  blob(g, rrect(W / 2, 1520, 660, 160, 14, 3), { fill: C.blue, shade: '#233b7a', line: GRAPHITE, lw: 6.4, seed: 841, t, hw: 5, tone: .6, sh: .25 });
  for (let i = 0; i < 5; i++) blob(g, star(W / 2 - 240 + i * 120, 1520, 24, 10, 5, -Math.PI / 2 + i * .2), { fill: '#fbf8ef', line: null, seed: 842 + i, t, gap: 5, hw: 4.6, tone: .9 });
}

function bowler(g2, t, o) {
  const { BW, BH, LH } = o;
  const top = -LH - BH;
  blob(g2, [[-90, top + 6], [-70, top - 50], [-30, top - 82], [30, top - 82], [70, top - 50], [90, top + 6]], { fill: '#3a3947', shade: '#1a1a22', line: GRAPHITE, lw: 6, seed: 850, t, hw: 4.6, tone: .9, sh: .3 });
  blob(g2, ellipse(0, top + 8, 130, 15, 10), { fill: '#3a3947', line: GRAPHITE, lw: 6, seed: 851, t, hw: 4.6, tone: .9 });
}

function draw(g, t, lines, path) {
  paper(g, { base: '#f8efc9' });
  const gr = groove(t, 1.1);
  const vox = loud('vocals', t);
  bunting(g, t);
  ring(g, t);
  // The board and the current line on it.
  signBoard(g, t);
  const idx = lines.findIndex((ws, i) => t < (lines[i + 1] ? lines[i + 1][0].v - .45 : 1e9));
  const ws = lines[Math.max(0, idx)];
  sing(g, t, ws, { ...WORDS, y: wordsY(ws), tailCol: null, col: GRAPHITE, seed: 30 + idx, w: .1, dance: 8, out: { t0: ws[ws.length - 1].e + .22, dur: .24 }, hi: { } });
  // The ball, and Bruce racing along under it on a ledge.
  const ledge = BOARD.y + BOARD.h + 66;
  line(g, [[BOARD.x + 20, ledge + 6], [BOARD.x + BOARD.w - 20, ledge + 6]], { w: 8, col: '#8b5f2a', seed: 860, t, spline: false, passes: 1 });
  const bb = ballAt(path, t);
  if (bb && !bb.gone) {
    // A little shadow on the word it will land on.
    drawBall(g, t, bb.x, bb.y, 32, { sq: bb.sq || 0, stretch: bb.stretch || 0, spin: t * 4 });
  }
  const lag = ballAt(path, t - .3);
  const lag2 = ballAt(path, t - .55);
  const bx = lag ? clamp(lag.x, BOARD.x + 120, BOARD.x + BOARD.w - 120) : BOARD.x + 200;
  const bx2 = lag2 ? clamp(lag2.x, BOARD.x + 120, BOARD.x + BOARD.w - 120) : bx;
  const dir = bx >= bx2 ? 1 : -1;
  const moving = Math.abs(bx - bx2) > 3 ? 1 : 0;
  dachshund(g, { x: bx, y: ledge, s: .46, flip: dir, t, seed: 2, walk: moving ? (t * 3.2) % 1 : 0, tail: beatPos(t), ear: gr.lean * 30, eyes: 'happy', mouth: .5, tongue: true, bob: gr.bp * 8 });
  // The show: the table, Clawd as judge, the show dog wearing a dozen rosettes.
  table(g, t);
  const ck = pop(t, 30.7, .3);
  clawd(g, { x: 215, y: 1560 - (1 - ck) * 500, s: 1.0, t, seed: 1, eyes: 'open', mouth: clamp(vox * 1.4 - .05), bob: gr.bob, squash: gr.sq, lean: gr.lean, armL: { up: .4 }, armR: { up: .1 }, prop: (g2, o) => bowler(g2, t, o) });
  dogFront(g, { x: W / 2 + 40, y: 1418, s: 1.5, t, seed: 3, breed: 'mutt', eyes: t > 32.7 ? 'happy' : 'dot', mouth: gr.bp > .5 ? .5 : 0, tongue: true, body: true, bob: gr.bob * .5, collar: C.red, ear: gr.lean * 8 });
  // A dozen rosettes round him, one every 0.15 s from "Good"; four wilt on "bad in others".
  for (let i = 0; i < 12; i++) {
    const a0 = 31.5 + i * .15;
    const k = pop(t, a0, .25);
    if (k <= 0) continue;
    const ang = Math.PI * (1.06 + i / 11 * .88);
    const x = W / 2 + 40 + Math.cos(ang) * 430, y = 1180 + Math.sin(ang) * 300;
    const wilt = [2, 5, 8, 10].includes(i) && t > 33.15 + [2, 5, 8, 10].indexOf(i) * .16;
    g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y);
    rosette(g, x, y, 56, wilt ? '#a8a7b2' : ROSETTES[i], t, { seed: 900 + i, state: wilt ? 'wilt' : 'new', tilt: (wilt ? .3 : -.1 + i * .02) + gr.lean * 2 });
    g.restore();
  }
  // The audience, along the foot of the page.
  AUDIENCE.forEach((b, i) => {
    const x = 70 + i * 134, ph = hash(i, 4);
    dogFront(g, { x, y: 1840 + (i % 2) * 22, s: .78, t, seed: 40 + i, breed: b, eyes: 'happy', mouth: clamp(vox * 1.3 + Math.sin(t * 9 + i * 2) * .15 - .1), tongue: false, collar: ROSETTES[(i * 3) % 12], tilt: sway(t + ph * .3) * .09, bob: gr.bp * 6 * (.6 + ph * .6) });
  });
}
