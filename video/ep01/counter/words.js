// The words.
//
// In this film the lyrics are not captions: a sung line arrives as a mark on a thing. The mark can
// be a stamp, a stencil sprayed through a plate, a marker gone over by hand, a printed label or a
// rubber-stamped impression, and each shot chooses. The choreography is the same every time, so the
// film moves like one thing:
//
//   - a word finishes arriving just before it is sung (LEAD ahead of the measured onset, 85ms)
//   - it keeps moving while it is on screen: a beat bounce, a lean towards the line's direction
//   - the line sets in lead as it is sung, so the words creep along rather than sitting still
//   - the word being sung right now is the one in the accent ink, with a rule wiping in under it
//   - the whole line holds until the line is done, across every cut inside it

import { P } from './palette.js';
import { drawText, measure, layout as typeLayout } from './type.js';
import { impression, stencil, marked, label } from './marks.js';
import { line, inkFill, outline, rect, easeOut, clamp01, lerp, smooth, hash, rng, blot, stipple } from './kit.js';
import { W, H } from '../../lib/stage.js';

export const LEAD = 0.085;          // seconds a word finishes arriving before it is sung
export const ARRIVE = 0.17;         // how long the arrival itself takes

// Bottom 400px and the right 140px of the lower half are where platform UI sits; words stay out.
export const UI = { bottom: 400, right: 140, splitY: H / 2 };

// ---------------------------------------------------------------- what was drawn, for the audit

export const RECORD = [];
let recording = false;
export function startRecord() { RECORD.length = 0; recording = true; }
export function endRecord() { recording = false; return RECORD; }
export function record(entry) { if (recording) RECORD.push({ t: -1, ...entry }); }

// ---------------------------------------------------------------- planning a line

// The line to set at t: the one being sung, or — just before a line begins — the one that is about
// to, so its first words can land ahead of the voice instead of on it.
function lineFor(S, t, hold) {
  const cur = S.lineAt(t, hold);
  if (cur && cur.start <= t) return cur;
  const ahead = S.lineAt(t + LEAD + ARRIVE + 0.06, 0);
  if (ahead && (!cur || ahead.start > cur.start)) return ahead;
  return cur;
}

// Break the sung line into rows that fit the slot, and choose a size that fits.
export function plan(S, t, slot, o = {}) {
  const line0 = lineFor(S, t, o.hold ?? 1.25);
  if (!line0) return null;
  const maxSize = o.size ?? 86;
  const minSize = o.minSize ?? 40;
  const w = slot.w;
  // The band the words may use: from the top of the type to just above the platform UI.
  const maxRows = o.rows ?? slot.rows ?? 3;
  let size = maxSize, rows = null;
  while (size >= minSize) {
    rows = wrap(line0.words, size, w, o.tracking);
    const widest = Math.max(...rows.map(r => rowW(r, size, o.tracking)));
    const lh = size * (o.lh ?? 1.1);
    const bottom = slot.y + (rows.length - 1) * lh + size * 1.3;   // the recorded box's foot
    if (widest <= w && rows.length <= maxRows && bottom <= (o.floor ?? 1500)) break;
    size -= 1;
  }
  const lh = size * (o.lh ?? 1.1);
  // A word no bigger than this is not readable on a phone; if nothing fits, say so by keeping
  // the size and letting the slot be the thing that gives.
  return { line: line0, rows, size: Math.max(size, minSize), lh, widest: Math.max(...rows.map(r => rowW(r, size, o.tracking))) };
}

function wrap(words, size, maxW, tracking) {
  const rows = [[]];
  let wRow = 0;
  const space = measure(' ', size, tracking);
  for (const wd of words) {
    const ww = measure(wd.w, size, tracking);
    if (wRow + ww > maxW && rows[rows.length - 1].length) { rows.push([]); wRow = 0; }
    rows[rows.length - 1].push({ ...wd, ww });
    wRow += ww + space;
  }
  return rows;
}

const rowW = (row, size, tracking) => row.reduce((a, w) => a + w.ww, 0) + measure(' ', size, tracking) * (row.length - 1);

// ---------------------------------------------------------------- drawing a line as a mark

// o: {mark: 'stamp'|'stencil'|'marker'|'label'|'print', colour, accent, angle, tracking, w: nib}
export function drawOn(g, S, t, slot, o = {}) {
  const p = plan(S, t, slot, o);
  if (!p) return null;
  const { line: L, rows, size, lh } = p;
  const tracking = o.tracking ?? 0.075;
  const boil = (o.boil ?? 0);
  const mark = o.mark || 'stamp';
  const colour = o.colour || P.ink;
  const accent = o.accent || P.ox;
  const align = o.align || 'center';
  const space = measure(' ', size, tracking);
  const sung = L.words.filter(w => !w.backing && w.e !== null);
  const lastEnd = sung.length ? Math.max(...sung.map(w => w.e)) : L.start;
  const sungCount = sung.filter(w => w.e <= t).length;

  // Every row starts at the same left margin, so a row that is only half sung grows rightwards
  // like a printed line instead of drifting left as words arrive.
  const blockW = Math.max(...rows.map(r => rowW(r, size, tracking)));
  rows.forEach((row, ri) => {
    const totalW = rowW(row, size, tracking);
    let x = align === 'center' ? slot.x - blockW / 2 : align === 'right' ? slot.x - totalW : slot.x;
    if (o.left != null) x = o.left;
    // the line sets in lead: it creeps along as it is sung, which is what stops it sitting still
    const creep = Math.min(1, sungCount / Math.max(3, L.words.length)) * (o.creep ?? 16);
    const bob = Math.sin((S.beatPos(t) % 1) * 6.283) * (o.bob ?? 2.2);
    const y = slot.y + ri * lh + bob;
    for (const wd of row) {
      const on = wd.s === null ? (sung.length ? Math.min(...sung.map(w => w.s)) : L.start) : wd.s;
      const lead = LEAD * (o.leadScale ?? 1);
      // The word starts landing LEAD + ARRIVE before its onset and is fully up LEAD before it.
      const pIn = easeOut(clamp01((t - (on - lead - ARRIVE)) / ARRIVE));
      const isNow = wd.s !== null && t >= wd.s - 0.02 && t < (wd.e ?? wd.s) + 0.05;
      if (pIn > 0) {
        const cx = x + wd.ww / 2;
        const scale = lerp(1.22, 1, pIn);
        const ang = (o.angle ?? 0) + (1 - pIn) * 0.16 * (wd.backing ? -1 : 1);
        const col = wd.backing ? (o.backing || P.inkSoft) : (isNow ? accent : colour);
        const alpha = clamp01(pIn * 1.6) * (o.alpha ?? 1);
        // the impact: a blot of ink thrown out when a word lands
        if (pIn > 0.02 && pIn < 0.5 && mark !== 'label') {
          g.save();
          g.globalAlpha = (0.5 - pIn) * 1.2;
          blot(g, `imp${wd.w}${on}`, cx, y - size * 0.3, size * 0.09, { colour: col, boil: boil });
          g.restore();
        }
        g.save();
        g.globalAlpha = alpha;
        g.translate(cx, y);
        g.rotate(ang);
        g.scale(scale, scale);
        g.translate(-cx, -y);
        drawMark(g, mark, wd.w, cx, y, size, { colour: col, boil, tracking, w: o.w, ang: 0 });
        g.restore();
        // the rule that wipes in under the word being sung
        if (isNow && o.rule !== false) {
          const rp = easeOut(clamp01((t - (wd.s - LEAD)) / 0.2));
          g.save();
          g.globalAlpha = 0.9;
          line(g, `rule${wd.w}${on}`, [[cx - wd.ww / 2 - 6, y + size * 0.2], [cx - wd.ww / 2 - 6 + (wd.ww + 12) * rp, y + size * 0.2]],
            { w: size * 0.055, colour: accent, boil: (boil + 1) % 3, rough: 0.7, taper: 0.5 });
          g.restore();
        }
        record({
          word: wd.w, line: L.text, x: cx - wd.ww / 2, y: y - size, w: wd.ww, h: size * 1.3,
          size, alpha, mark, on,
        });
      }
      x += wd.ww + space;
    }
  });
  // creep the whole block rather than each row, so it never walks out of its slot
  return { p, lastEnd };
}

function drawMark(g, mark, text, cx, y, size, o) {
  switch (mark) {
    case 'stencil': stencil(g, text, cx, y, size, { colour: o.colour, boil: o.boil }); break;
    case 'marker': marked(g, text, cx, y, size, { colour: o.colour, boil: o.boil, align: 'center' }); break;
    case 'label': label(g, text, cx - measure(text, size) / 2, y - size * 1.3, size, { colour: o.colour, boil: o.boil }); break;
    case 'print':
      // type from a machine: the same face, off-register, on one line
      drawText(g, text, cx + 2.5, y + 3, size, { colour: o.colour, align: 'center', boil: (o.boil ?? 0) + 1, w: size * 0.12, id: `pr2${text}` });
      drawText(g, text, cx, y, size, { colour: o.colour, align: 'center', boil: o.boil, w: size * 0.115, id: `pr1${text}` });
      break;
    default: drawText(g, text, cx, y, size, { colour: o.colour, align: 'center', boil: o.boil, w: o.w, id: `st${text}` });
  }
}

// ---------------------------------------------------------------- the big ones

// The chorus hook as a wall of stamps. Each sung word is one impression that lands hard on its
// onset and stays where it landed. They are laid out in a tidy block — centred rows, one gap
// between — because a wall of claims that is also a wall of *typography* is the point: this is what
// a lyric video looks like when the song is asking a question over and over. `o.cycle` says which
// chorus this is, and each pass covers more of the wall.
export function stampWall(g, S, t, o = {}) {
  const cycle = o.cycle ?? 0;
  const p = plan(S, t, { x: o.x ?? 500, y: o.y ?? 420, w: o.w ?? 940 },
    { size: o.size ?? 150, minSize: 62, tracking: 0.07 });
  if (!p) return;
  const L = p.line;
  const words = L.words.filter(w => !w.backing);
  if (!words.length) return;
  const cols = cycle === 2 ? [P.ox, P.ink, P.petrol, P.oxDeep] : [P.ox, P.ink, P.petrol];
  const cx = o.x ?? 500;
  const budget = o.w ?? 940;
  const PER = 3, GAP = 0.16;

  // The widest row sets the size: a stamp's box is its text plus the double rule, and the block must
  // fit the wall. Shrink until the widest row does, then stop — a stamp too small to read is worse
  // than a tight one.
  const widest = (sz) => {
    let m = 0;
    for (let i = 0; i < words.length; i += PER) {
      const n = Math.min(PER, words.length - i);
      let row = 0;
      for (let k = i; k < i + n; k++) row += measure(words[k].w, sz, 0.07) + sz * 0.88;
      m = Math.max(m, row + GAP * sz * (n - 1));
    }
    return m;
  };
  let size = p.size * (1 + cycle * 0.05);
  const minSize = 46;
  while (size > minSize && widest(size) > budget) size -= 2;
  size = Math.max(size, minSize);
  const PAD = size * 0.88;
  const boxW = i => measure(words[i].w, size, 0.07) + PAD;
  const rows = [];
  for (let i = 0; i < words.length; i += PER) {
    const idx = [];
    for (let k = i; k < Math.min(i + PER, words.length); k++) idx.push(k);
    const total = idx.reduce((a, k) => a + boxW(k), 0) + GAP * size * (idx.length - 1);
    rows.push({ idx, total });
  }

  // Nothing in the wall may run off the frame or over the counter board: clip the whole block to
  // the wall's own face.
  g.save();
  g.beginPath(); g.rect(20, 196, 1040, (o.clipH ?? 968)); g.clip();
  words.forEach((wd, i) => {
    const on = wd.s ?? L.start;
    const pIn = easeOut(clamp01((t - (on - LEAD - 0.05)) / 0.1));
    if (pIn <= 0) return;
    const r = Math.floor(i / PER);
    const { idx, total } = rows[r];
    const before = idx.slice(0, idx.indexOf(i)).reduce((a, k) => a + boxW(k) + GAP * size, 0);
    const x = cx - total / 2 + before;
    const y = (o.y ?? 420) + r * (size * 1.92);
    const hit = easeOut(clamp01((t - (on - LEAD - 0.05)) / 0.06));
    g.save();
    g.globalAlpha = Math.min(1, pIn * 3);
    impression(g, wd.w.toUpperCase(), x + boxW(i) / 2, y, size * (0.9 + hit * 0.1), {
      colour: cols[i % cols.length], seed: i * 7 + 3,
      boil: o.boil, ang: ((hash(wd.w + i) % 100) / 100 - 0.5) * 0.045,
    });
    g.restore();
    record({ word: wd.w, line: L.text, x: x - boxW(i) / 2, y: y - size, w: boxW(i), h: size * 1.3,
      size, alpha: Math.min(1, pIn * 3), mark: 'stamp', on });
  });
  g.restore();
}

// The backing "ooh-ooh-ahh-ahh" as a row of small stamps, answering the hook in a gang voice.
export function stampGang(g, S, t, o = {}) {
  const L = S.lineAt(t, 1.25);
  if (!L) return;
  const backs = L.words.filter(w => w.backing);
  backs.forEach((wd, i) => {
    const on = wd.s ?? L.start + 0.5;
    const pIn = easeOut(clamp01((t - (on - LEAD - 0.04)) / 0.12));
    if (pIn <= 0) return;
    const txt = wd.w.replace(/[()]/g, '').toUpperCase();
    const spread = (o.w ?? 940) / Math.max(1, backs.length);
    const x = (o.x ?? 500) - spread * (backs.length - 1) / 2 + i * spread;
    g.save();
    g.globalAlpha = 0.6 + pIn * 0.4;
    impression(g, txt, x, o.y ?? 1180, o.size ?? 40, {
      w: measure(txt, o.size ?? 40) + 46, h: (o.size ?? 40) * 1.5,
      colour: i % 2 ? P.ox : P.petrol, seed: i * 3, boil: (o.boil ?? 0) + i % 3, ang: i % 2 ? 0.05 : -0.05,
    });
    g.restore();
    const bw = measure(txt, o.size ?? 40) + 46;
    record({ word: wd.w, line: L.text, x: x - bw / 2, y: (o.y ?? 1180) - (o.size ?? 40), w: bw,
      h: (o.size ?? 40) * 1.5, size: o.size ?? 40, alpha: 0.6 + pIn * 0.4, mark: 'stamp', on: wd.s ?? null });
  });
}
