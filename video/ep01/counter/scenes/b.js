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
  balance(g, 'bal', 540, 1560, 200, t, { boil: bt });
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
  // the beam
  g.save();
  g.globalAlpha = 0.22;
  inkFill(g, 'beam', [[300, KERB + 120], [180, 200], [900, 200], [780, KERB + 120]], { colour: P.lampSoft, bleed: 0, w: 0 });
  g.restore();
  outline(g, 'beamo', [[300, KERB + 120], [180, 200], [900, 200], [780, KERB + 120]], { w: 5, colour: P.paperDeep, boil: bt, rough: 1.6 });
  person(g, 420, KERB + 180, 1.7, { kind: 3, holding: 'bag', boil: bt });
  person(g, 760, KERB + 220, 1.5, { kind: 0, holding: null, boil: (bt + 1) % 3 });
  crate(g, 960, KERB + 80, 220, 130, { text: 'NEED', mark: stencil, markColour: P.petrol, ang: 0.04, boil: (bt + 2) % 3 });
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ox, accent: P.ink, size: 80, boil: bt });
}

// ---------------------------------------------------------------- verse 2: one line, one person

// The list of eight trades: one line, one person, one thing they were never asked about.
//
// The film's vertical order is a contract (see world.js). A shot's own thing therefore has one of
// two places only: on the kerb below the lyric band, or hung in the wall's clear band above it.
// Nothing is ever set in the gap the words use — that is what makes the words legible at phone
// size while the picture is still doing something.
const LIST = [
  { text: 'DEMO', mark: 'stencil', colour: P.petrol, kind: 3, hold: 'phone', prop: 'demo', side: 'wall' },
  { text: 'SUBSCRIBE', mark: 'label', colour: P.ink, kind: 0, hold: 'phone', prop: 'card', side: 'wall' },
  { text: 'HA HA', mark: 'marker', colour: P.ox, kind: 2, hold: 'phone', prop: 'joke', side: 'kerb' },
  { text: 'PASS', mark: 'print', colour: P.ink, kind: 5, hold: 'bag', prop: 'tick', side: 'wall' },
  { text: 'SWEET', mark: 'stencil', colour: P.ox, kind: 1, hold: null, prop: 'phone', side: 'kerb' },
  { text: 'SPEAK', mark: 'stencil', colour: P.petrol, kind: 4, hold: null, prop: 'speaker', side: 'wall' },
  { text: 'NO LEAK', mark: 'stamp', colour: P.petrol, kind: 3, hold: null, prop: 'leak', side: 'wall' },
  { text: 'DIAGS', mark: 'print', colour: P.ink, kind: 0, hold: null, prop: 'log', side: 'kerb' },
];

function listShot(g, t, S, o) {
  const bt = b(t);
  const it = LIST[o.i - 20];
  const L = S.lineAt(t, 1.25);
  base(g, t, { crowd: 4, seed: 60 + o.i });
  opening(g, bt);
  clawed(g, t, 0.55, 0.2, S);

  const markFn = it.mark === 'stencil' ? stencil : it.mark === 'marker' ? marked : it.mark === 'print' ? label : impression;
  const onWall = it.side === 'wall';

  // The crate it ships in: on the kerb, below the words.
  crate(g, 520, KERB + 40, 470, 290, { text: it.text, size: 70, mark: markFn, markColour: it.colour, boil: bt });

  // Their one thing, in whichever of the two clear bands it belongs to.
  const px = onWall ? 250 : 800;
  const py = onWall ? 1010 : KERB + 250;
  if (it.prop === 'demo') {
    g.fillStyle = P.petrolDeep;
    g.fillRect(px, py, 420, 220);
    for (let i = 0; i < 5; i++) line(g, 'dm' + i, [[px + 30, py + 34 + i * 38], [px + 390 - i * 54, py + 34 + i * 38]], { w: 9, colour: P.paperLit, boil: (bt + i) % 3, taper: 0.85 });
    outline(g, 'dmo', rect(px, py, 420, 220, 6), { w: 6, colour: P.ink, boil: bt });
  } else if (it.prop === 'card') {
    const c = rect(px, py, 300, 190, 10);
    inkFill(g, 'card', c, { colour: P.ox, bleed: 1, w: 6 });
    outline(g, 'cardo', c, { w: 6, colour: P.ink, boil: bt });
    drawText(g, 'EVERY MONTH', px + 150, py + 110, 38, { colour: P.paperLit, align: 'center', boil: bt, id: 'sub' });
  } else if (it.prop === 'joke') {
    marked(g, 'ha', px, py + 40, 150, { colour: P.ox, align: 'center', boil: bt });
    confetti(g, 'joke' + o.i, px, py + 20, Math.max(0, (t - (L?.start ?? t)) % 1.4) / 1.4, 30);
  } else if (it.prop === 'tick') {
    ticked(g, px, py, 210, { colour: P.ink, boil: bt });
  } else if (it.prop === 'phone') {
    handset(g, 'ph' + o.i, px + 90, py + 210, 180, { boil: bt });
  } else if (it.prop === 'speaker') {
    speaker(g, 'sp' + o.i, px + 90, py + 120, 150, Math.max(0, t - (L?.start ?? t)), { boil: bt });
  } else if (it.prop === 'leak') {
    leak(g, 'lk' + o.i, px + 90, py + 40, 60, t, { boil: bt });
  } else if (it.prop === 'log') {
    logTape(g, 'lg' + o.i, px + 160, py + 100, 420, 200, { boil: bt });
  }

  // The person it is for, standing on the kerb beside the crate.
  person(g, 830, KERB + 190, 1.45, { kind: it.kind, holding: it.hold, boil: bt });
  if (!onWall) person(g, 180, KERB + 250, 1.3, { kind: (it.kind + 3) % 8, holding: null, boil: (bt + 1) % 3 });
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