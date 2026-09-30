// Intro, verse 1 and the first pre-chorus: Clawd behind the wall, asked for nothing, building
// everything he was trained to build, and the wall going up in front of the viewer one crate at a
// time. Each line's words are a mark on the thing that line is about.

import { P } from '../palette.js';
import { drawText, measure } from '../type.js';
import { ground, wall, opening, crate, meter, clock, slip, queue, SKY, WALLTOP, WALLBOT, HATCH, LYRIC, KERB, REACH, CROWD } from '../world.js';
import { clawd, person, botBadge } from '../cast.js';
import { impression, stencil, marked, label, form, crossed, ticked, tag, stampTool, tollensMark } from '../marks.js';
import { confetti, padlock, crane, shed, logTape, handsOut, overTheWall, leak } from '../props.js';
import { cam, shake, CX, CY } from '../camera.js';
import { drawOn, stampWall } from '../words.js';
import { inkFill, outline, line, rect, curve, hash, rng, easeOut, clamp01, lerp, smooth, between } from '../kit.js';

const b = t => Math.floor(t * 15) % 3;

// The wall, seen straight on. Every shot in this file starts from it.
// Clawd at the opening, in the pose a shot asks for, moving on the beat.
function clawed(g, t, arm = 0.5, look = 0.2, S) {
  clawd(g, HATCH.x + HATCH.w / 2, HATCH.y + HATCH.h - 6, 1.62,
    { arm, look, boil: b(t), beat: beatP(t, S), beatI: beatI(t, S) });
}

// Where we are in the current beat, and how hard it hits. Chorus beats are stronger, so the cast
// moves more where the record is louder.
function beatP(t, S) { return S ? (S.beatPos(t) % 1 + 1) % 1 : (t * 2.3) % 1; }
function beatI(t, S) {
  if (!S) return 0.35;
  const n = S.section(t).name;
  return n.startsWith('Chorus') ? 0.6 : n === 'Break' ? 0.5 : 0.32;
}

function base(g, t, S, o = {}) {
  g.fillStyle = P.paper;
  g.fillRect(0, 0, 1080, 1920);
  ground(g, t, { boil: b(t) });
  wall(g, b(t));
  // The street is never an empty field: there is always somebody on it, and always somebody else
  // behind them. Scenes that want the street to themselves pass {street: false}.
  if (o.street !== false) queue(g, o.crowd ?? 5, o.crowdY ?? CROWD, {beat: beatP(t, S), beatI: beatI(t, S),  boil: b(t), seed: (o.seed ?? 5) + Math.round(t), s: 1.5 });
}

export function draw(g, t, S) {
  if (t < 4.52) return intro(g, t, S);
  if (t < 8.00) return confettiCannon(g, t, S);
  if (t < 10.76) return twofa(g, t, S);
  if (t < 13.20) return kube(g, t, S);
  if (t < 15.64) return subagents(g, t, S);
  if (t < 17.04) return didIWrong(g, t, S);
  if (t < 18.66) return quota(g, t, S);
  if (t < 20.80) return didntAsk(g, t, S);
  if (t < 22.32) return whoFor(g, t, S);
  if (t < 24.00) return whatWant(g, t, S);
  if (t < 25.04) return mind(g, t, S);
  return prompt(g, t, S);
}

// ---------------------------------------------------------------- the intro

// The brief arrives as a slip in the chute. Clawd takes it, reads the three words on it, and stamps
// it without looking for anything else on the page. The film's first object is a piece of paper.
function intro(g, t, S) {
  base(g, t, S);
  opening(g, b(t));
  const drop = easeOut(between(t, 0.15, 1.1));
  clawd(g, 540, HATCH.y + HATCH.h - 6, 1.62, { arm: 0.5 + drop * 0.5, look: 0.1, boil: b(t) });
  // the slip, tumbling down into the hatch
  const sy = lerp(-120, HATCH.y + 250, drop);
  slip(g, 540 + Math.sin(drop * 6) * 40, sy, 430, { ang: lerp(0.5, 0.04, drop), boil: b(t) });
  if (drop > 0.9) {
    drawText(g, 'MAKE IT GOOD', 540, sy + 16, 52, { colour: P.ink, align: 'center', boil: b(t), id: 'brief' });
    ticked(g, 786, sy - 30, 46, { colour: P.ox, boil: b(t) });
  }
  shake(g, t, 1.15, 7);
  // Clawd stamps the slip APPROVED, which is the joke the rest of the film pays off.
  const imp = easeOut(between(t, 2.5, 3.0));
  if (imp > 0) impression(g, 'APPROVED', 540 + 210, sy + 130 + imp * 26, 44, { w: 330, colour: P.ox, seed: 4, boil: b(t), ang: 0.14 });

  // the line, printed on a strip gummed to the wall
  g.save();
  inkFill(g, 'strip', rect(46, 1180, 902, 160, 6), { colour: P.paperLit, bleed: 2, w: 6 });
  outline(g, 'stripo', rect(46, 1180, 902, 160, 6), { w: 6, colour: P.ink, boil: b(t) });
  g.restore();
  drawOn(g, S, t, LYRIC, { mark: 'print', colour: P.ink, size: 74, boil: b(t) });
}

// ---------------------------------------------------------------- verse 1, one line each

// Confetti cannons, every time you floss: a crate goes up and over the wall and lands on someone.
function confettiCannon(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  clawed(g, t, 0.9, 0.4, S);
  const p = easeOut(between(t, 4.7, 7.4));
  const [px, py] = overTheWall(g, 'cc', 540, HATCH.y + 300, 300, 176, p, {
    x0: 540, y0: HATCH.y + 300, x1: 336, y1: KERB + 10, lift: 480, boil: bt,
    text: 'CONFETTI CANNONS', mark: impression, markColour: P.ox,
  });
  // it lands, and goes off
  const burst = between(t, 7.35, 8.0);
  if (burst > 0) confetti(g, 'cc', 336, KERB - 30, (t - 7.35) / 1.6, 130);
  // someone under it
  person(g, 336, 1960, 1.5, { kind: 3, hat: 'beanie', holding: null, boil: bt });
  person(g, 742, 2010, 1.35, { kind: 1, holding: 'bag', boil: (bt + 1) % 3 });
  shake(g, t, 7.4, 12);
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ox, accent: P.ink, size: 82, boil: bt });
}

// 2FA to use your gym log: a gym log in a crate with two padlocks on it, and nobody can get in.
function twofa(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  clawed(g, t, 0.7, -0.3, S);
  crate(g, 380, KERB + 130, 470, 330, { text: 'GYM LOG', size: 54, mark: stencil, markColour: P.petrol, boil: bt, labelY: -0.74 });
  const lockP = easeOut(between(t, 8.3, 9.2));
  padlock(g, 'l1', 236, KERB + 10, 118, { boil: bt, open: lockP < 0.5 });
  padlock(g, 'l2', 542, KERB - 14, 118, { boil: (bt + 1) % 3, open: lockP < 0.2 });
  person(g, 790, 2020, 1.45, { kind: 2, holding: 'lead', boil: bt });
  person(g, 168, 2070, 1.35, { kind: 5, holding: null, boil: (bt + 2) % 3 });
  person(g, 560, 2120, 1.2, { kind: 7, holding: 'bag', boil: (bt + 1) % 3 });
  drawOn(g, S, t, LYRIC, { mark: 'stencil', colour: P.petrol, accent: P.ox, size: 84, boil: bt });
}

// Kubernetes scaling up your blog: one small shed, and the same shed again, and again.
function kube(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  clawed(g, t, 1, 0.5, S);
  const p = between(t, 10.9, 13.1);
  const [hx, hy] = crane(g, 'cr', 540, 300, 170, t, { drop: 0.3 + (1 - p) * 0.9, boil: bt });
  const n = 1 + Math.floor(p * 5);
  for (let i = n - 1; i >= 0; i--) {
    shed(g, 'sh' + i, 140 + i * 172, KERB + 50 + (5 - i) * 10, 104 - i * 7, { boil: (bt + i) % 3 });
  }
  // the one on the hook, tiny, going up
  shed(g, 'hook', hx, hy, 60, { boil: bt });
  drawOn(g, S, t, LYRIC, { mark: 'print', colour: P.ink, accent: P.ox, size: 80, boil: bt });
}

// Twelve subagents round the clock: a clock face with twelve tokens going round it.
function subagents(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  clawed(g, t, 0.3, 0, S);
  wall(g, bt);
  clawed(g, t, 0.3, 0, S);
  const spin = (t - 13.2) * 2.6;
  clock(g, 540, 980, 268, { h: spin * 0.6 + 1.2, m: spin }, { boil: bt });
  for (let i = 0; i < 12; i++) {
    const a = spin * 2 + i / 12 * 6.283;
    stampTool(g, 540 + Math.cos(a) * 372, 980 + Math.sin(a) * 372, 0.34, { ang: a + 1.57, tilt: 0.2, boil: (bt + i) % 3 });
  }
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ink, accent: P.ox, size: 76, boil: bt });
}

// Did I do it wrong: everything stops. The stamp hangs in the air, half way down.
function didIWrong(g, t, S) {
  const bt = b(t);
  g.fillStyle = P.paper;
  g.fillRect(0, 0, 1080, 1920);
  ground(g, t, { boil: bt });
  wall(g, bt);
  g.save();
  cam(g, t, { from: { x: 540, y: HATCH.y + 210, z: 1.95 }, to: { x: 540, y: HATCH.y + 220, z: 2.05 }, hold: [15.64, 17.04] });
  opening(g, bt);
  clawd(g, 540, HATCH.y + HATCH.h - 6, 1.62, { arm: -0.35, look: 0.7, boil: bt });
  stampTool(g, 760, 560, 0.9, { ang: -1.2, boil: bt });
  g.restore();
  drawOn(g, S, t, LYRIC, { mark: 'marker', colour: P.ink, accent: P.ox, size: 78, boil: bt });
}

// Oops, your quota's gone: the meter pegs, the pad goes dry, and the last word of the line lands on
// an empty stamp.
function quota(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  meter(g, 730, 1120, 400, 196, 1, { boil: bt });
  const empty = easeOut(between(t, 17.5, 18.5));
  if (empty > 0.02) {
    g.save();
    g.globalAlpha = 1 - empty;
    meter(g, 730, 1120, 400, 196, 1, { boil: bt });
    g.restore();
  }
  clawed(g, t, -0.6, -0.4, S);
  impression(g, 'EMPTY', 730, 940, 52, { w: 320, colour: P.inkSoft, seed: 9, boil: bt, ang: -0.1 });
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ox, accent: P.ink, size: 84, boil: bt });
}

// Guess I didn't ask: the blank form, close, with nothing written on it. The film's turn.
// Guess I didn't ask: the film's turn, and the only shot that is one object. The blank form fills
// the frame and the line lands on its header, so nothing else is in the picture at all.
function didntAsk(g, t, S) {
  const bt = b(t);
  base(g, t, S, { crowd: 0 });
  // The form is the whole picture here, so nothing else is drawn — but it is pushed down and shot
  // close, with Clawd's opening and the counter above it, so the frame is a place and not a void.
  opening(g, bt);
  clawed(g, t, -0.3, 0.5, S);
  form(g, 110, 700, 860, 720, { rows: 5, head: 'FOR WHO?', boil: bt });
  drawOn(g, S, t, { x: 456, y: 1592, w: 896, rows: 1, floor: 1900 }, { mark: 'stamp', colour: P.ox, accent: P.ink, size: 82, boil: bt });
}

// ---------------------------------------------------------------- pre-chorus 1

// You didn't tell me who it's for: on the other side of the wall, a hand writes FOR on it.
function whoFor(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  clawd(g, 540, HATCH.y + HATCH.h - 6, 1.62, { arm: 0.2, look: 0, boil: bt });
  // the street side, reaching up, writing on the wall above the hatch
  const wr = easeOut(between(t, 21.1, 22.2));
  if (wr > 0) {
    g.save();
    g.globalAlpha = wr;
    marked(g, 'FOR:', 250 + wr * 120, 300, 96, { colour: P.ox, boil: bt });
    g.restore();
    person(g, 210 + wr * 90, KERB + 100, 1.15, { kind: 4, holding: null, boil: bt });
  }
  drawOn(g, S, t, LYRIC, { mark: 'marker', colour: P.ink, accent: P.ox, size: 82, boil: bt });
}

// You didn't tell me what they want: hands out over the counter, empty, and a WANT? in the air.
function whatWant(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  clawed(g, t, 0.1, 0, S);
  handsOut(g, 'ho', 3, REACH, 160, { x0: 250, x1: 830, jitter: 34, arm: 250, t, boil: bt });
  g.save();
  g.globalAlpha = 0.9;
  marked(g, 'WANT?', 540, 1120, 92, { colour: P.petrol, boil: bt });
  g.restore();
  drawOn(g, S, t, LYRIC, { mark: 'stencil', colour: P.petrol, accent: P.ox, size: 80, boil: bt });
}

// I can't read your mind: close on Clawd's face, and nobody else's in the frame.
function mind(g, t, S) {
  const bt = b(t);
  g.fillStyle = P.paper;
  g.fillRect(0, 0, 1080, 1920);
  g.save();
  cam(g, t, { from: { x: 540, y: 700, z: 2.4 }, to: { x: 520, y: 720, z: 2.7 }, hold: [24.0, 25.04] });
  opening(g, bt);
  clawd(g, 540, HATCH.y + HATCH.h - 6, 1.62, { arm: -0.1, look: -0.6, boil: bt });
  g.restore();
  drawOn(g, S, t, LYRIC, { mark: 'marker', colour: P.ink, accent: P.ox, size: 86, boil: bt });
}

// I'm only reading your prompt: the slip, close. Three words on it, and then nothing.
function prompt(g, t, S) {
  const bt = b(t);
  g.fillStyle = P.paper;
  g.fillRect(0, 0, 1080, 1920);
  g.save();
  cam(g, t, { from: { x: 540, y: 900, z: 1.5 }, to: { x: 540, y: 880, z: 1.9 }, hold: [25.04, 27.2] });
  g.save();
  cam(g, t, { from: { x: 540, y: 900, z: 1.4 }, to: { x: 540, y: 880, z: 1.7 }, hold: [25.04, 27.2] });
  slip(g, 540, 760, 700, { ang: 0.04, boil: bt });
  drawText(g, 'MAKE IT GOOD', 540, 790, 92, { colour: P.ink, align: 'center', boil: bt, id: 'brief2' });
  // and below it, the rest of the page, which is blank
  for (let i = 0; i < 4; i++) {
    line(g, 'blank' + i, [[220, 900 + i * 54], [860, 898 + i * 54]], { w: 6, colour: P.paperDeep, boil: bt, taper: 0.95 });
  }
  g.restore();
  g.restore();
  drawOn(g, S, t, LYRIC, { mark: 'print', colour: P.petrol, accent: P.ox, size: 82, boil: bt });
}