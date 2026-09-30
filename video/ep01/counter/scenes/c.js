// The bridge, the break, the last pre-chorus, the last chorus and the outro.
//
// The turn of the film is here. The bridge is the wall from the other side: crates go up and over
// it and land in the street. The break is the film's one great stamp. After that somebody writes on
// the form, and the last chorus is a wall of names instead of a wall of questions.

import { P } from '../palette.js';
import { drawText, measure } from '../type.js';
import { ground, wall, opening, crate, meter, clock, slip, queue, SKY, WALLTOP, WALLBOT, HATCH, LYRIC, KERB, REACH, CROWD } from '../world.js';
import { clawd, person, botBadge } from '../cast.js';
import { impression, stencil, marked, label, form, crossed, ticked, tag, stampTool, tollensMark } from '../marks.js';
import { confetti, padlock, crane, shed, logTape, handsOut, overTheWall, leak, balance, fireworks, speaker, handset } from '../props.js';
import { cam, shake, CX, CY } from '../camera.js';
import { drawOn, stampWall } from '../words.js';
import { inkFill, outline, line, rect, curve, hash, rng, easeOut, clamp01, lerp, smooth, between } from '../kit.js';
import { record } from '../words.js';

const b = t => Math.floor(t * 15) % 3;

// Clawd at the opening, in the pose a shot asks for.
function clawed(g, t, arm = 0.5, look = 0.2) {
  clawd(g, HATCH.x + HATCH.w / 2, HATCH.y + HATCH.h - 6, 1.62, { arm, look, boil: b(t) });
}

// Where we are in the current beat, and how hard it hits (see scenes/a.js).
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
  if (o.street !== false) queue(g, o.crowd ?? 5, o.crowdY ?? CROWD, {beat: beatP(t, S), beatI: beatI(t, S),  boil: b(t), seed: (o.seed ?? 5) + Math.round(t), s: 1.45 });
}

// I could only learn from my training set: the shelf of manuals, and Clawd taking one down.
function trainingSet(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  g.save();
  cam(g, t, { from: { x: 540, y: 620, z: 1.5 }, to: { x: 540, y: 700, z: 1.85 }, hold: [107.1, 112.3] });
  opening(g, bt);
  clawd(g, 540, HATCH.y + HATCH.h - 6, 1.62, { arm: 0.85, look: 0.4, boil: bt });
  const pull = easeOut(between(t, 108.6, 111.4));
  g.save();
  g.translate(700 - pull * 60, 470 + pull * 210);
  g.rotate(-pull * 0.4);
  const bk = rect(-52, -150, 104, 300, 6);
  inkFill(g, 'book', bk, { colour: P.oxSoft, bleed: 1, w: 6 });
  outline(g, 'booko', bk, { w: 6, colour: P.ink, boil: bt });
  drawText(g, 'HOW TO WRITE CODE', 0, -20, 22, { colour: P.ink, align: 'center', boil: bt, id: 'bk1' });
  g.restore();
  g.restore();
  drawOn(g, S, t, LYRIC, { mark: 'print', colour: P.ink, accent: P.ox, size: 78, boil: bt });
}

// To write code and throw it over the wall: the film's central shot. The camera goes to the top of
// the wall, and the crates go up and over it and come down on this side.
function overTheWallShot(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  const p = easeOut(between(t, 112.6, 116.8));
  // one after another, so it's a movement and not a single crate
  for (let k = 2; k >= 0; k--) {
    const pk = easeOut(clamp01((p - k * 0.24) / 0.5));
    if (pk <= 0) continue;
    overTheWall(g, 'ow' + k, 540, 700, 250, 150, pk, {
      x0: 540, y0: HATCH.y + 320, x1: 300 + k * 240, y1: 1560 - k * 40, lift: 620 - k * 60, boil: (bt + k) % 3,
      text: ['CONFETTI', '2FA', 'KUBERNETES'][k], mark: k === 0 ? impression : k === 1 ? stencil : label,
      markColour: k === 0 ? P.ox : k === 1 ? P.petrol : P.ink,
    });
  }
  opening(g, bt);
  clawd(g, 540, HATCH.y + HATCH.h - 6, 1.62, { arm: 1, look: 0, boil: bt });
  queue(g, 5, 1880, {beat: beatP(t, S), beatI: beatI(t, S),  boil: bt, seed: 11, s: 1.2 });
  shake(g, t, 114.4, 8);
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ink, accent: P.ox, size: 80, boil: bt });
}

// But how do you know what to build or test: the form again, and one line ruled on it.
function buildOrTest(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  g.save();
  cam(g, t, { from: { x: 540, y: 1360, z: 1.15 }, to: { x: 540, y: 1300, z: 1.5 }, hold: [117.32, 123.36] });
  const f = form(g, 90, 1300, 900, 560, { rows: 5, head: 'HOW WILL I KNOW?', boil: bt });
  // the lines getting ruled on, one per phrase, and nothing written in them
  for (let i = 0; i < 3; i++) {
    const p = easeOut(between(t, 118 + i * 1.5, 119 + i * 1.5));
    if (p > 0) {
      g.save();
      g.globalAlpha = p;
      line(g, 'rl' + i, [[f.left, f.top + i * f.rowH], [f.left + (f.right - f.left) * p, f.top + i * f.rowH]],
        { w: 5, colour: P.petrol, boil: bt, taper: 0.9 });
      g.restore();
    }
  }
  g.restore();
  drawOn(g, S, t, LYRIC, { mark: 'marker', colour: P.ink, accent: P.ox, size: 78, boil: bt });
}

// If you're not thinking about who it's for: the street side, looking up at the wall.
function whoItsFor(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  const q = queue(g, 6, 1900, {beat: beatP(t, S), beatI: beatI(t, S),  boil: bt, seed: 13, s: 1.45 });
  for (let i = 0; i < q.length; i++) {
    const p = easeOut(between(t, 123.8 + i * 0.28, 124.6 + i * 0.28));
    if (p > 0) {
      g.save();
      g.globalAlpha = p * 0.9;
      drawText(g, '↑', q[i].x, 1200 - p * 40, 90, { colour: P.ox, align: 'center', boil: bt, id: 'ar' + i });
      g.restore();
    }
  }
  // and the wall, blank, above them
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ox, accent: P.ink, size: 80, boil: bt });
}

// Software quality is value to someone who matters: the film's one great stamp, in one hit.
//
// It lands on the wall's lower face, in the clear band between the counter board and the street, in
// three lines each fitted to that band. Clawd stays in the opening above it, watching. The line's
// own words stay in the lyric band on the street, so the stamp and the words never fight — the
// stamp IS the line, and the words are it arriving.
function theInscription(g, t, S) {
  const bt = b(t);
  const L = S.lineAt(t, 1.4);
  const t0 = (L?.start ?? t) + 0.5;
  base(g, t, S, { street: false });
  opening(g, bt);
  clawed(g, t, 0.95, 0, S);
  queue(g, 5, CROWD, {beat: beatP(t, S), beatI: beatI(t, S),  boil: bt, seed: 41, s: 1.4 });

  const p = easeOut(clamp01((t - (t0 - 0.085 - 0.18)) / 0.18));
  if (p > 0) {
    const face = { x: 500, w: 860, top: 830, bottom: 1160 };
    const lines = [['SOFTWARE QUALITY', P.ink], ['IS VALUE TO', P.ox], ['SOMEONE WHO MATTERS', P.ox]];
    // Fit to the band's height as well as its width, or the third line runs into the street.
    const per = (face.bottom - face.top) / lines.length;
    let y = face.top;
    lines.forEach(([txt, col], i) => {
      const q = easeOut(clamp01(p * 1.5 - i * 0.26));
      if (q > 0) {
        let sz = Math.min(per * 0.72, 120);
        while (sz > 20 && measure(txt, sz) > face.w) sz -= 2;
        const bw = measure(txt, sz) + sz * 0.84;
        g.save();
        g.globalAlpha = Math.min(1, q * 2.4);
        impression(g, txt, face.x - 14, y + per * 0.5, sz * (0.86 + q * 0.14), {
          w: bw, h: per * 0.86, colour: col, seed: 21 + i, boil: (bt + i) % 3, ang: (i - 1) * 0.012,
        });
        g.restore();
        record({ word: txt, line: L?.text ?? '', x: face.x - 14 - bw / 2, y: y + per * 0.5 - sz * 0.7,
          w: bw, h: sz * 1.4, size: sz, alpha: Math.min(1, q * 2.4), mark: 'stamp', on: t0 });
      }
      y += per;
    });
  }
  shake(g, t, t0, 18);
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ink, accent: P.ox, size: 54, boil: bt });
}

// Matters, matters, matters: the same stamp three times, each further away.
function mattersEcho(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  const L = S.lineAt(t);
  const ws = (L?.words || []).filter(w => !w.backing);
  ws.forEach((wd, i) => {
    const on = wd.s ?? L.start;
    const p = easeOut(clamp01((t - (on - 0.085)) / 0.16));
    if (p <= 0) return;
    const bw = 700 - i * 120, sz = 130 - i * 26;
    impression(g, 'MATTERS', 540 + i * 40, 1000 + i * 210, sz, {
      w: bw, h: 150 - i * 22, colour: i === 0 ? P.ox : i === 1 ? P.oxSoft : P.paperDeep, seed: 30 + i, boil: (bt + i) % 3, ang: -0.02 + i * 0.02,
    });
    record({ word: wd.w, line: L.text, x: 540 + i * 40 - bw / 2, y: 1000 + i * 210 - sz / 2,
      w: bw, h: sz * 1.3, size: sz, alpha: 1, mark: 'stamp', on });
  });
}

// I'm someone too / and me! and me! and me!: the bots' own marks, one for each "and me".
function someoneToo(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  const L = S.lineAt(t);
  const ws = (L?.words || []).filter(w => !w.backing);
  ws.forEach((wd, i) => {
    const on = wd.s ?? L.start;
    const p = easeOut(clamp01((t - (on - 0.085)) / 0.2));
    if (p <= 0) return;
    const x = 300 + i * 220;
    g.save();
    g.globalAlpha = p;
    const bg = rect(x - 90, 940, 180, 180, 10);
    inkFill(g, 'bdg' + i, bg, { colour: P.paperLit, bleed: 1, w: 6 });
    outline(g, 'bdgo' + i, bg, { w: 6, colour: P.ink, boil: (bt + i) % 3 });
    g.restore();
    botBadge(g, x, 1030, 62 * p, i, { colour: i === 0 ? P.petrol : i === 1 ? P.lamp : P.ox, boil: (bt + i) % 3 });
  });
  opening(g, bt);
  clawd(g, 540, HATCH.y + HATCH.h - 6, 1.62, { arm: 0.4, look: 0.5, boil: bt });
  drawOn(g, S, t, LYRIC, { mark: 'print', colour: P.ink, accent: P.ox, size: 78, boil: bt });
}

// I'm debugging this with you: for the first time, Clawd and a person are on the same side.
function debuggingWithYou(g, t, S) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  clawd(g, 400, HATCH.y + HATCH.h + 70, 1.25, { arm: 0.7, look: 0.6, boil: bt });
  person(g, 740, HATCH.y + HATCH.h + 240, 1.0, { kind: 2, holding: 'phone', boil: bt });
  logTape(g, 'lg', 560, REACH + 20, 460, 220, { boil: bt });
  drawOn(g, S, t, LYRIC, { mark: 'print', colour: P.petrol, accent: P.ox, size: 76, boil: bt });
}

// The final pre-chorus: the form gets filled in, in someone's handwriting, while it is sung — and
// somebody's hand writes it, so the shot moves for the one time in the film that matters most.
function tellMe(g, t, S) {
  const bt = b(t);
  base(g, t, S, { crowd: 4, seed: 77 });
  const f = form(g, 130, 1240, 820, 620, { rows: 5, head: 'FOR WHO?', boil: bt });
  const answers = ['MUM, AT WORK', 'WHAT THEY NEED', 'A BAD SIGNAL', 'HOW I\u2019LL KNOW', 'FOR YOU TOO'];
  answers.forEach((a, i) => {
    const t0 = 147.8 + i * 2.2;
    const p = easeOut(clamp01((t - t0) / 1.1));
    if (p <= 0) return;
    g.save();
    g.globalAlpha = clamp01(p * 2);
    const shown = a.slice(0, Math.ceil(a.length * p));
    drawText(g, shown, f.left + 6, f.top + i * f.rowH - 14, 34,
      { colour: i === 4 ? P.ox : P.ink, boil: (bt + i) % 3, id: 'ans' + i });
    g.restore();
    // the pen tip, at the end of the word just written, while it is being written
    if (p < 0.99) {
      const w = measure(shown, 34);
      line(g, 'pen' + i, [[f.left + 6 + w + 14, f.top + i * f.rowH - 42], [f.left + 6 + w + 26, f.top + i * f.rowH + 16]],
        { w: 7, colour: P.ink, boil: (bt + i) % 3, rough: 0.7 });
      line(g, 'penb' + i, [[f.left + 6 + w + 10, f.top + i * f.rowH - 52], [f.left + 6 + w + 22, f.top + i * f.rowH - 34]],
        { w: 11, colour: P.ox, boil: (bt + i + 1) % 3, rough: 0.7 });
    }
  });
  opening(g, bt);
  clawed(g, t, 0.15, 0, S);
  queue(g, 4, CROWD, { beat: beatP(t, S), beatI: beatI(t, S), boil: bt, seed: 71, s: 1.4 });
  drawOn(g, S, t, LYRIC, { mark: 'marker', colour: P.ink, accent: P.ox, size: 74, boil: bt });
}

// The last chorus: the same hook, but the stamps are names.
function lastChorus(g, t, S, o) {
  const bt = b(t);
  base(g, t, S);
  opening(g, bt);
  if (o.backing) {
    // This is the third chorus, so the row is at its fullest: one more pair of hands each time.
    handsOut(g, 'lb' + o.backing, 3 + o.backing, REACH, 160, { x0: 220, x1: 840, jitter: 34, arm: 250, t, boil: bt });
    const L = S.lineAt(t);
    const backs = (L?.words || []).filter(w => w.backing);
    backs.forEach((wd, i) => {
      const on = wd.s ?? L.start + 0.6;
      const p = easeOut(clamp01((t - on + 0.085) / 0.15));
      if (p <= 0) return;
      g.save(); g.globalAlpha = 0.55 + p * 0.45;
      impression(g, wd.w.replace(/[()]/g, '').toUpperCase(), 240 + i * 210, 420 + (i % 2) * 60, 34,
        { w: 190, h: 74, colour: i % 2 ? P.ox : P.petrol, seed: i * 3, boil: (bt + i) % 3, ang: i % 2 ? 0.05 : -0.05 });
      g.restore();
    });
  } else {
    stampWall(g, S, t, { x: 500, y: 330, w: 880, size: 122, cycle: 2, boil: bt, clipH: 900 });
    // The answers land underneath, as tags tied to the wall: one name per word of the hook, each
    // sized to its own name and hung from a string, so they read as things tied on rather than
    // another row of type competing with the lyric.
    const names = ['MUM', 'THE SHOP', 'MY TEAM', 'THE AGENT', 'NOBODY'];
    const L = S.lineAt(t);
    const ws = (L?.words || []).filter(w => !w.backing);
    // Lay the tags out from their own widths with a fixed gap, and centre the row: a fixed pitch
    // overlaps them the moment one name is longer than its neighbour.
    const sz0 = 30, gap0 = 26;
    const tw0 = names.map(nm => measure(nm, sz0) + sz0 * 1.1);
    const totalW = tw0.reduce((a, w) => a + w, 0) + gap0 * (names.length - 1);
    let cursor = 540 - totalW / 2;
    names.forEach((nm, i) => {
      const on = ws[i]?.s ?? L.start;
      const p = easeOut(clamp01((t - (on - 0.085)) / 0.34));
      if (p <= 0) { cursor += tw0[i] + gap0; return; }
      const x = cursor + tw0[i] / 2;
      cursor += tw0[i] + gap0;
      // the string it hangs from, up to the counter's edge
      g.save();
      g.globalAlpha = 0.5;
      line(g, `str${i}`, [[x, 900], [x + 4, 1096]], { w: 3, colour: P.inkSoft, boil: (bt + i) % 3, taper: 0.9 });
      g.restore();
      g.save();
      g.globalAlpha = clamp01(p * 2);
      // the tag is as wide as its own name needs, and no wider
      const sz = sz0;
      const tw = tw0[i];
      const pts = [[-tw / 2, -sz * 0.5], [tw / 2, -sz * 0.55], [tw / 2 - 4, sz * 0.85], [-tw / 2 + 3, sz * 0.8]];
      g.translate(x, 1120);
      g.rotate(((i % 2 ? 0.1 : -0.1)) * p);
      inkFill(g, `tgx${i}`, pts, { colour: P.paperLit, bleed: 1, w: 4 });
      outline(g, `tgxo${i}`, pts, { w: 4, colour: P.ink, boil: (bt + i) % 3 });
      drawText(g, nm, 0, sz * 0.36, sz, { colour: i === 4 ? P.ox : P.ink, align: 'center', boil: (bt + i) % 3, id: `tgn${i}` });
      g.restore();
    });
  }
  queue(g, 5, 1880, {beat: beatP(t, S), beatI: beatI(t, S),  boil: bt, seed: 19, s: 1.3 });
  shake(g, t, S.lineAt(t).start + 0.02, 6);
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ink, accent: P.ox, size: 74, boil: bt });
}

// The outro: the only warm light in the film, a toy going over the counter, and nobody minding.
function outro(g, t, S, o) {
  const bt = b(t);
  g.fillStyle = P.paper;
  g.fillRect(0, 0, 1080, 1920);
  if (o.i === 61 || o.i === 62) {
    opening(g, bt);
    g.save();
    g.globalAlpha = 0.2;
    inkFill(g, 'warm', [[0, 0], [1080, 0], [1080, 1560], [0, 1560]], { colour: P.lampSoft, bleed: 0, w: 0 });
    g.restore();
    impression(g, o.i === 61 ? 'FOR YOU?' : 'FOR THAT?', 520, 470, 118, { w: 760, h: 200, colour: P.ox, seed: 41, boil: bt, ang: 0.01 });
    queue(g, 4, 1880, {beat: beatP(t, S), beatI: beatI(t, S),  boil: bt, seed: 23, s: 1.3 });
    drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ink, accent: P.ox, size: 80, boil: bt });
    return;
  }
  if (o.i === 63) {
    // just a toy: a paper hat in a small crate, going over the counter into someone's hands
    base(g, t, S);
    opening(g, bt);
    const p = easeOut(between(t, 190.6, 192.9));
    g.save();
    g.globalAlpha = 0.2;
    inkFill(g, 'warm2', [[0, 1560], [1080, 1560], [1080, 1920], [0, 1920]], { colour: P.lampSoft, bleed: 0, w: 0 });
    g.restore();
    crate(g, lerp(540, 700, p), lerp(1180, KERB + 40, p), 230, 140, { text: 'TOY', mark: label, markColour: P.ink, ang: lerp(-0.1, 0.05, p), boil: bt, grounded: p > 0.9 });
    person(g, 700, KERB + 150, 1.6, { kind: 4, holding: null, boil: bt });
    handsOut(g, 'oh', 1, KERB - 60, 170, { x0: 700, x1: 700, arm: 260, t, boil: bt });
    drawOn(g, S, t, LYRIC, { mark: 'marker', colour: P.ink, accent: P.ox, size: 80, boil: bt });
    return;
  }
  // fine if it's gone when summer's done: the toy on the kerb in the evening light, then an empty
  // crate. The film's only stillness, and the only time nothing new is built. Then the credits.
  base(g, t, S);
  opening(g, bt);
  clawed(g, t, 0.2, -0.3, S);
  g.save();
  g.globalAlpha = 0.3;
  inkFill(g, 'warm3', [[0, 1560], [1080, 1540], [1080, 1920], [0, 1920]], { colour: P.lamp, bleed: 0, w: 0 });
  g.restore();
  const gone = easeOut(between(t, 195.4, 198.2));
  if (gone < 0.98) {
    person(g, 240, KERB + 200, 1.5, { kind: 0, hat: 'cap', holding: null, boil: bt });
    person(g, 470, KERB + 260, 1.3, { kind: 2, holding: 'bag', boil: (bt + 1) % 3 });
    // the toy, until it is gone
    g.save();
    g.globalAlpha = 1 - gone;
    crate(g, 810, KERB + 90, 200, 120, { text: 'TOY', mark: label, markColour: P.ink, ang: 0.03, boil: bt });
    handsOut(g, 'oh', 1, KERB + 40, 130, { x0: 810, x1: 810, arm: 200, t, boil: bt });
    g.restore();
  }
  drawOn(g, S, t, LYRIC, { mark: 'stamp', colour: P.ox, accent: P.ink, size: 76, boil: bt });
  const card = easeOut(between(t, 199.2, 200.0));
  if (card > 0.01) {
    // The card is the last thing in the film and it covers the frame, so the picture is dimmed to
    // nothing behind it rather than left showing round the edges.
    g.save();
    g.globalAlpha = card * 0.92;
    inkFill(g, 'scrim', [[0, 0], [1080, 0], [1080, 1920], [0, 1920]], { colour: P.paperDeep, bleed: 0, w: 0 });
    g.restore();
    g.save();
    g.globalAlpha = card;
    inkFill(g, 'card', rect(70, 200, 940, 1520, 8), { colour: P.paperLit, bleed: 2, w: 7 });
    outline(g, 'cardo', rect(70, 200, 940, 1520, 8), { w: 7, colour: P.ink, boil: bt });
    // A credit card is set, not written: every line is fitted to the card's measure by one rule,
    // so no credit can run off the paper.
    const CW = 800;
    const line_ = (text, y, max, colour, key, boil) => {
      drawText(g, text, 540, y, fit(text, max, CW), { colour, align: 'center', boil: boil ?? bt, id: key });
    };
    line_('SOFTWARE QUALITY THEORY 101', 404, 46, P.ink, 'cdt');
    line_('Quality is value to someone', 620, 54, P.ink, 'cd1');
    line_('who matters.', 700, 54, P.ox, 'cd2', (bt + 1) % 3);
    line_('Weinberg · Bach & Bolton', 900, 36, P.inkSoft, 'cd3');
    line_('via Ed Pringle’s quality catalogue', 952, 30, P.inkSoft, 'cd4', (bt + 1) % 3);
    line_('Clawd is Anthropic’s.', 1092, 34, P.inkSoft, 'cd5');
    line_('The other bots’ marks belong to', 1144, 30, P.inkSoft, 'cd6', (bt + 1) % 3);
    line_('the people who made them.', 1188, 30, P.inkSoft, 'cd7', (bt + 2) % 3);
    line_('Not affiliated with, or endorsed by,', 1300, 26, P.inkSoft, 'cd8');
    line_('any company shown.', 1340, 26, P.inkSoft, 'cd9', (bt + 1) % 3);
    tollensMark(g, 540, 1520, 24, { colour: P.ink });
    line_('tollens.ai', 1620, 44, P.ink, 'cd10');
    g.restore();
  }
}

// The largest size at which `text` fits `maxW`, down to a floor a phone can read.
function fit(text, max, maxW) {
  for (let sz = max; sz >= 18; sz -= 2) if (measure(text, sz) <= maxW) return sz;
  return 18;
}

export function draw(g, t, S, o) {
  const i = o.i;
  if (i === 40) return trainingSet(g, t, S);
  if (i === 41) return overTheWallShot(g, t, S);
  if (i === 42) return buildOrTest(g, t, S);
  if (i === 43) return whoItsFor(g, t, S);
  if (i === 44) return theInscription(g, t, S);
  if (i === 45) return mattersEcho(g, t, S);
  if (i === 46 || i === 47) return someoneToo(g, t, S);
  if (i === 48) return debuggingWithYou(g, t, S);
  if (i >= 49 && i <= 52) return tellMe(g, t, S);
  if (i >= 53 && i <= 60) return lastChorus(g, t, S, { backing: (i % 2 === 1 && i !== 55 && i !== 59) ? 2 : 0 });
  if (i >= 61) return outro(g, t, S, o);
  return base(g, t, S);
}