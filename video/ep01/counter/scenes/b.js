// The two choruses and verse 2.
//
// The chorus is the film's loudest gesture: whole lines of words coming down on the wall as stamps,
// one word at a time, piling up. Each time the chorus comes back it comes back further on: the
// first pass stamps questions at the wall, the second stamps answers on the crates going over, the
// third stamps names. Nothing plays the same shot twice in a row.

import { P } from '../palette.js';
import { drawText, measure } from '../type.js';
import { ground, wall, opening, crate, meter, clock, slip, queue, SKY, WALLTOP, WALLBOT, HATCH, LYRIC, KERB, REACH, CROWD } from '../world.js';
import { clawd, person, botBadge } from '../cast.js';
import { impression, stencil, marked, label, form, crossed, ticked, tag, stampTool, tollensMark } from '../marks.js';
import { confetti, padlock, crane, shed, logTape, handsOut, overTheWall, leak, balance, fireworks, speaker, handset } from '../props.js';
import { cam, shake, CX, CY } from '../camera.js';
import { drawOn, stampWall, stampGang } from '../words.js';
import { inkFill, outline, line, rect, curve, hash, rng, easeOut, clamp01, lerp, smooth, between } from '../kit.js';

const b = t => Math.floor(t * 15) % 3;

// Clawd at the opening, in the pose a shot asks for, moving on the beat.
function clawed(g, t, arm = 0.5, look = 0.2, S) {
  clawd(g, HATCH.x + HATCH.w / 2, HATCH.y + HATCH.h - 6, 1.62,
    { arm, look, boil: b(t), beat: beatP(t, S), beatI: beatI(t, S) });
}

// Where we are in the current beat, and how hard it hits (see scenes/a.js).
function beatP(t, S) { return S ? (S.beatPos(t) % 1 + 1) % 1 : (t * 2.3) % 1; }
function beatI(t, S) {
  if (!S) return 0.35;
  const n = S.section(t).name;
  return n.startsWith('Chorus') ? 0.6 : n === 'Break' ? 0.5 : 0.32;
}

function base(g, t, S) {
  g.fillStyle = P.paper;
  g.fillRect(0, 0, 1080, 1920);
  ground(g, t, { boil: b(t) });
  wall(g, b(t));
}

// ---------------------------------------------------------------- the chorus, three times over

// The hook. The wall of the depot is stamped over, word by word, on the beat, and never cleared —
// so by the end of the line the wall is covered in claims. It is the loudest thing in the film and
// it grows each time the chorus comes back.
function hook(g, t, S, o) {
  const bt = b(t);
  const cyc = o.cycle ?? 0;
  base(g, t, S);
  // the camera pushes in across the hook, so the wall comes at you
  g.save();
  cam(g, t, {
    from: { x: 540, y: 900, z: 1.0 + cyc * 0.04 },
    to: { x: 540, y: 780, z: 1.16 + cyc * 0.05 },
    hold: [S.lineAt(t).start, S.lineAt(t).start + 2.4],
  });
  opening(g, bt);
  if (cyc >= 1) clawed(g, t, 0.8, 0.3, S);
  queue(g, 4 + cyc, CROWD, {beat: beatP(t, S), beatI: beatI(t, S),  boil: bt, seed: 7 + cyc, s: 1.4 });
  // the marks that were already on the wall from earlier in the film
  g.restore();
  // The marks already on the wall, faded, behind everything: this wall has been stamped all film.
  for (let i = 0; i < 5 + cyc * 3; i++) {
    g.save();
    g.globalAlpha = 0.3;
    impression(g, ['FAST', 'WOW', 'CHEAP', 'STURDY', 'SHIPS NOW'][i % 5],
      80 + ((i * 337) % 920), 880 + ((i * 149) % 260), 30 + (i % 3) * 6,
      { w: 260, h: 70, colour: i % 2 ? P.inkSoft : P.paperDeep, seed: 90 + i, boil: (bt + i) % 3, ang: ((i % 3) - 1) * 0.05 });
    g.restore();
  }
  stampWall(g, S, t, { x: 500, y: 330 + cyc * 26, w: 880, size: 122, cycle: cyc, boil: bt, clipH: 900 });
  // on the third pass the stamps start carrying the answers
  if (cyc === 2) {
    const p = easeOut(between(t, S.lineAt(t).start + 0.4, S.lineAt(t).start + 1.6));
    if (p > 0) tag(g, 830, 1240, 2.1 * p, { text: 'MUM', ang: -0.24, boil: bt });
  }
  shake(g, t, S.lineAt(t).start + 0.02, 7 + cyc * 2);
}

// The backing answered in a gang voice. The sung words keep coming as stamps — the hook does not
// stop for the ahh-ahh-ahh — and the gang answers underneath them along the counter's edge, so the
// two read as one wall rather than two things fighting in one band.
function backing(g, t, S, o) {
  const bt = b(t);
  const cyc = o.cycle ?? 0;
  base(g, t, S);
  opening(g, bt);
  clawed(g, t, 0.6, 0.3, S);
  queue(g, 5 + cyc, CROWD, {beat: beatP(t, S), beatI: beatI(t, S),  boil: bt, seed: 31 + cyc, s: 1.45 });
  stampGang(g, S, t, { x: 500, y: 1440, size: 48 + cyc * 4, w: 820, boil: bt });
  stampWall(g, S, t, { x: 500, y: 330 + cyc * 26, w: 880, size: 122, cycle: cyc, boil: bt, clipH: 900 });
  shake(g, t, S.lineAt(t).start + 0.02, 7 + cyc * 2);
}

// Fast to run, or sturdy, or cheap: a real balance with three crates on it.
function fastSturdy(g, t, S, o) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  opening(g, bt);
  clawed(g, t, 0.55, 0.1, S);
  queue(g, 5, CROWD, { beat: beatP(t, S), beatI: beatI(t, S), boil: bt, seed: 81 + o.cycle, s: 1.45 });
  balance(g, 'bal', 540, KERB - 40, 190, t, { boil: bt });
  const p = between(t, S.lineAt(t).start + 0.2, S.lineAt(t).end);
  const lx = 540 - 200 * 1.6 + 40, rx = 540 + 200 * 1.6 - 40;
  crate(g, lx, KERB + 40 - Math.sin(p * 3) * 6, 250, 150, { text: 'FAST', mark: stencil, markColour: P.petrol, ang: -0.03, boil: bt, grounded: false });
  crate(g, rx, KERB + 40 + Math.sin(p * 3) * 6, 250, 150, { text: 'CHEAP', mark: label, markColour: P.ink, ang: 0.03, boil: (bt + 1) % 3, grounded: false });
  crate(g, 540, KERB + 30, 280, 170, { text: 'STURDY', mark: impression, markColour: P.ox, boil: (bt + 2) % 3 });
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ink, accent: P.ox, size: 76, boil: bt });
}

// Wow for a week, or built to keep: one crate of fireworks and one crate of bricks.
function wowKeep(g, t, S, o) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  crate(g, 320, KERB, 280, 170, { text: 'WOW', mark: stencil, markColour: P.ox, ang: -0.04, boil: bt });
  opening(g, bt);
  clawed(g, t, 0.5, 0.2, S);
  queue(g, 5, CROWD, { beat: beatP(t, S), beatI: beatI(t, S), boil: bt, seed: 83 + o.cycle, s: 1.45 });
  const L = S.lineAt(t);
  const since = t - (L.start + 0.3);
  fireworks(g, 'fw', 320, 1060, Math.max(0, since), {});
  // embers falling after the last burst, so the shot keeps moving to its cut
  if (since > 0.8) {
    const r = rng(hash('fw' + Math.floor(t * 4)));
    for (let i = 0; i < 26; i++) {
      const p = ((since - 0.8) * 0.7 + r()) % 1;
      g.save();
      g.globalAlpha = (1 - p) * 0.7;
      g.beginPath();
      g.ellipse(300 + (r() - 0.5) * 460 + p * 40, 1080 + p * p * 780, 4 + r() * 3, 3 + r() * 2, 0, 0, 6.283);
      g.fillStyle = i % 2 ? P.lamp : P.ox; g.fill();
      g.restore();
    }
  }
  crate(g, 780, KERB + 30, 300, 200, { text: 'BUILT TO KEEP', size: 40, mark: impression, markColour: P.petrol, ang: 0.02, boil: (bt + 1) % 3 });
  person(g, 540, KERB + 130, 1.4, { kind: 0, holding: 'phone', boil: bt });
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ox, accent: P.ink, size: 76, boil: bt });
}

// Ship it now, or polish it slow: a crate on a belt towards a door, and the same crate on a bench.
function shipPolish(g, t, S, o) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  opening(g, bt);
  clawed(g, t, 0.45, 0.3, S);
  queue(g, 5, CROWD, { beat: beatP(t, S), beatI: beatI(t, S), boil: bt, seed: 85 + o.cycle, s: 1.45 });
  const p = (t - S.lineAt(t).start) / Math.max(0.1, S.lineAt(t).end - S.lineAt(t).start);
  line(g, 'belt', [[0, KERB - 130], [1080, KERB - 130]], { w: 14, colour: P.ink, boil: bt });
  for (let i = 0; i < 14; i++) {
    const x = ((i * 96 + (t * 240) % 96) - 48);
    line(g, 'blt' + i, [[x, KERB - 144], [x + 22, KERB - 116]], { w: 5, colour: P.inkSoft, boil: (bt + i) % 3, taper: 0.9 });
  }
  crate(g, lerp(-60, 700, p), KERB - 130, 250, 150, { text: 'SHIP NOW', mark: label, markColour: P.ink, ang: 0, boil: bt, grounded: false });
  crate(g, 800, KERB + 60, 250, 150, { text: 'POLISH', mark: marked, markColour: P.petrol, ang: -0.02, boil: (bt + 1) % 3 });
  person(g, 880, KERB + 60, 1.1, { kind: 2, holding: null, boil: (bt + 2) % 3 });
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ink, accent: P.ox, size: 76, boil: bt });
}

// Does what they need, or steals the show: a spotlight on a stage, and somebody's need in it.
function needShow(g, t, S, o) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  opening(g, bt);
  clawed(g, t, 0.6, 0.5, S);
  queue(g, 5, CROWD, { beat: beatP(t, S), beatI: beatI(t, S), boil: bt, seed: 87 + o.cycle, s: 1.45 });
  // the beam: from a lamp above the counter onto the one person holding the need
  g.save();
  g.globalAlpha = 0.22;
  inkFill(g, 'beam', [[420, KERB + 180], [330, 240], [520, 240], [470, KERB + 180]], { colour: P.lampSoft, bleed: 0, w: 0 });
  g.restore();
  outline(g, 'beamo', [[420, KERB + 180], [330, 240], [520, 240], [470, KERB + 180]], { w: 4, colour: P.paperDeep, boil: bt, rough: 1.4 });
  person(g, 430, KERB + 200, 1.6, { kind: 3, holding: 'bag', boil: bt });
  person(g, 800, KERB + 250, 1.4, { kind: 0, holding: null, boil: (bt + 1) % 3 });
  crate(g, 150, KERB + 40, 220, 130, { text: 'NEED', mark: stencil, markColour: P.petrol, ang: 0.04, boil: (bt + 2) % 3 });
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ox, accent: P.ink, size: 80, boil: bt });
}

// ---------------------------------------------------------------- verse 2: one line, one person

// The list of eight trades: one line, one person, one thing they were never asked about.
//
// The film's vertical order is a contract (see world.js). A shot's own thing therefore has one of
// two places only: on the kerb below the lyric band, or hung in the wall's clear band above it.
// Nothing is ever set in the gap the words use — that is what makes the words legible at phone
// size while the picture is still doing something.
// The list of eight trades: one line, one person, one thing they were never asked about.
//
// Eight turns of one setup is eight shots of nothing, so each line gets its own composition as well
// as its own prop: `stage` says where the thing goes and how big the frame is on it, so the verse
// changes shape every line instead of only changing label.
const LIST = [
  { text: 'DEMO', mark: 'stencil', colour: P.petrol, kind: 3, hold: 'phone', prop: 'demo', stage: 0 },
  { text: 'SUBSCRIBE', mark: 'label', colour: P.ink, kind: 0, hold: 'phone', prop: 'card', stage: 1 },
  { text: 'HA HA', mark: 'marker', colour: P.ox, kind: 2, hold: 'phone', prop: 'joke', stage: 2 },
  { text: 'PASS', mark: 'print', colour: P.ink, kind: 5, hold: 'bag', prop: 'tick', stage: 3 },
  { text: 'SWEET', mark: 'stencil', colour: P.ox, kind: 1, hold: null, prop: 'phone', stage: 4 },
  { text: 'SPEAK', mark: 'stencil', colour: P.petrol, kind: 4, hold: null, prop: 'speaker', stage: 5 },
  { text: 'NO LEAK', mark: 'stamp', colour: P.petrol, kind: 3, hold: null, prop: 'leak', stage: 6 },
  { text: 'DIAGS', mark: 'print', colour: P.ink, kind: 0, hold: null, prop: 'log', stage: 7 },
];

// One thing, drawn big, in the band its stage gives it.
function thingOn(g, id, prop, x, y, s, t, bt) {
  if (prop === 'demo') {
    g.fillStyle = P.petrolDeep;
    g.fillRect(x - s, y - s * 0.62, s * 2, s * 1.24);
    for (let i = 0; i < 5; i++) line(g, id + 'l' + i, [[x - s * 0.8, y - s * 0.36 + i * s * 0.24], [x + s * 0.8 - i * s * 0.22, y - s * 0.36 + i * s * 0.24]], { w: s * 0.075, colour: P.paperLit, boil: (bt + i) % 3, taper: 0.85 });
    outline(g, id + 'o', rect(x - s, y - s * 0.62, s * 2, s * 1.24, 6), { w: 7, colour: P.ink, boil: bt });
  } else if (prop === 'card') {
    const c = rect(x - s * 0.9, y - s * 0.58, s * 1.8, s * 1.16, 10);
    inkFill(g, id + 'c', c, { colour: P.ox, bleed: 1, w: 7 });
    outline(g, id + 'co', c, { w: 7, colour: P.ink, boil: bt });
    drawText(g, 'EVERY MONTH', x, y + s * 0.1, s * 0.26, { colour: P.paperLit, align: 'center', boil: bt, id: id + 't' });
  } else if (prop === 'joke') {
    marked(g, 'HA', x, y, s * 0.9, { colour: P.ox, align: 'center', boil: bt });
    confetti(g, id, x, y - s * 0.2, Math.max(0, (t * 1.6) % 1.3) / 1.3, 34);
  } else if (prop === 'tick') {
    // A tick in a box, drawn as one: the earlier version was three strokes at a scale where they
    // read as a black arrow.
    const bxs = s * 1.5;
    const bx = rect(x - bxs / 2, y - bxs / 2, bxs, bxs, s * 0.08);
    inkFill(g, id + 'bx', bx, { colour: P.paperLit, bleed: 1, w: 7 });
    outline(g, id + 'bxo', bx, { w: 7, colour: P.ink, boil: bt });
    ticked(g, x - bxs * 0.2, y - bxs * 0.16, bxs * 0.44, { colour: P.ink, w: bxs * 0.075, boil: bt });
  } else if (prop === 'phone') {
    handset(g, id + 'p', x, y, s * 0.86, { boil: bt });
  } else if (prop === 'speaker') {
    speaker(g, id + 's', x, y - s * 0.2, s * 0.78, Math.max(0, t), { boil: bt });
  } else if (prop === 'leak') {
    // The pipe runs across the frame with the drip falling into a bucket, so it is unmistakably a
    // leak and not a mark on the wall.
    const py = y - s * 0.7;
    line(g, id + 'p', [[x - s * 1.5, py], [x + s * 0.5, py], [x + s * 0.5, py + s * 0.4]],
      { w: 26, colour: P.petrolDeep, boil: bt, rough: 0.7 });
    outline(g, id + 'j', [[x + s * 0.2, py - s * 0.14], [x + s * 0.8, py - s * 0.14], [x + s * 0.8, py + s * 0.14], [x + s * 0.2, py + s * 0.14]],
      { w: 5, colour: P.ink, boil: (bt + 1) % 3 });
    leak(g, id + 'd', x + s * 0.5, py + s * 0.4, s * 0.5, t, { boil: bt });
    const bucket = curve([[x + s * 0.1, py + s * 1.1], [x + s * 0.9, py + s * 1.1], [x + s * 0.76, py + s * 1.8], [x + s * 0.24, py + s * 1.8]], 0.3, 4);
    inkFill(g, id + 'bkt', bucket, { colour: P.paperDeep, bleed: 1, w: 6 });
    outline(g, id + 'bkto', bucket, { w: 6, colour: P.ink, boil: bt });
  } else if (prop === 'log') {
    logTape(g, id + 'g', x, y, s * 1.5, s * 0.6, { boil: bt });
  }
}

function listShot(g, t, S, o) {
  const bt = b(t);
  const it = LIST[o.i - 20];
  const L = S.lineAt(t, 1.25);
  const markFn = it.mark === 'stencil' ? stencil : it.mark === 'marker' ? marked : it.mark === 'print' ? label : impression;
  const st = it.stage;

  // Four compositions, used twice each, alternating sides: the thing is big on the wall; big on the
  // kerb in the foreground; small, held up in the opening beside Clawd; and in the street with the
  // queue. Nothing is ever in the lyric band.
  const wall = st % 2 === 0;
  base(g, t, S, { crowd: st === 3 || st === 7 ? 5 : 3, seed: 60 + o.i });
  opening(g, bt);

  // Nothing is ever drawn off the frame's edge: a prop cut by the border reads as a mistake.
  g.save();
  g.beginPath(); g.rect(18, 168, 1044, 1740); g.clip();
  if (st === 2 || st === 6) {
    // Clawd holds it up in the opening, so it is inside his world rather than outside on the wall:
    // it goes at the tip of his raised claw, not floating on the wall beside him.
    clawed(g, t, 0.95, 0.4, S);
    thingOn(g, 'th' + o.i, it.prop, HATCH.x + HATCH.w - 40, HATCH.y + 150, 108, t, bt);
  } else {
    clawed(g, t, st === 1 ? 0.7 : 0.35, st === 1 ? -0.3 : 0.2, S);
    // Each stage has its own place for the thing, so it never lands on the crate or the person.
    const where = [
      [540, 980, 190],    // 0: on the wall, centred and big
      [250, 900, 170],    // 1: on the wall, to the left, so the crate can be right
      null,               // 2: held in the opening (above)
      [300, KERB - 60, 200], // 3: on the kerb, left, with the queue right
      [540, 960, 210],    // 4: on the wall, centred
      [780, 880, 160],    // 5: on the wall, right, small
      null,               // 6: held in the opening (above)
      [300, KERB - 40, 190], // 7: on the kerb, left, above the queue
    ][st];
    if (where) thingOn(g, 'th' + o.i, it.prop, where[0], where[1], where[2], t, bt);
  }
  g.restore();

  // the crate it ships in, always on the kerb and never in the words' band
  crate(g, wall ? 640 : 640, KERB + 70, 420, 260, { text: it.text, size: 64, mark: markFn, markColour: it.colour, boil: bt });
  // the person it is for, on the other side of the frame from the thing
  person(g, wall ? 880 : 880, KERB + 230, 1.4, { kind: it.kind, holding: it.hold, boil: bt });
  if (st === 3 || st === 7) person(g, 130, KERB + 280, 1.25, { kind: (it.kind + 3) % 8, holding: null, boil: (bt + 1) % 3 });
  drawOn(g, S, t, LYRIC, { mark: it.mark, colour: it.colour, accent: P.ox, size: 74, boil: bt });
}

// ---------------------------------------------------------------- the second pre-chorus

function preAgain(g, t, S, o) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  clawd(g, 540, HATCH.y + HATCH.h - 6, 1.62, { arm: 0.3, look: 0.2, boil: bt });
  // the same wall, with the same question written on it — and this time the answer is missing
  marked(g, 'FOR:', 250, 300, 96, { colour: P.ox, boil: bt });
  const p = easeOut(between(t, S.lineAt(t).start + 0.5, S.lineAt(t).end));
  g.save();
  g.globalAlpha = p;
  marked(g, 'WANT?', 700, 300, 92, { colour: P.petrol, boil: (bt + 1) % 3 });
  g.restore();
  handsOut(g, 'ho2', 2, REACH, 156, { x0: 300, x1: 760, jitter: 30, arm: 240, t, boil: bt });
  drawOn(g, S, t, LYRIC, { mark: 'marker', colour: P.ink, accent: P.ox, size: 80, boil: bt });
}

// ---------------------------------------------------------------- dispatch

const CH = {
  14: fastSturdy, 15: wowKeep, 18: shipPolish, 19: needShow,
  34: fastSturdy, 35: wowKeep, 38: shipPolish, 39: needShow,
  55: fastSturdy, 56: wowKeep, 59: shipPolish, 60: needShow,
};

export function draw(g, t, S, o) {
  const i = o.i, bt = b(t);
  // the hook, once per chorus, with the backing handled inside
  if (i === 12) return hook(g, t, S, { cycle: 0 });
  if (i === 13) return backing(g, t, S, { cycle: 0 });
  if (i === 16) return hook(g, t, S, { cycle: 0, second: true });
  if (i === 17) return backing(g, t, S, { cycle: 0, second: true });
  if (i === 32) return hook(g, t, S, { cycle: 1 });
  if (i === 33) return backing(g, t, S, { cycle: 1 });
  if (i === 36) return hook(g, t, S, { cycle: 1, second: true });
  if (i === 37) return backing(g, t, S, { cycle: 1, second: true });
  if (CH[i]) return CH[i](g, t, S, { cycle: i > 32 ? 1 : 0 });
  if (i >= 20 && i <= 27) return listShot(g, t, S, o);
  if (i >= 28 && i <= 31) return preAgain(g, t, S, o);
  return base(g, t, S);
}