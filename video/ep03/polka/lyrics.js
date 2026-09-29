// The sung words, written on the page by the pencil as they are sung.
//
// A line is laid out as a block of hand-printed rows (the body) with its last word or words
// (the tail: the "-ility" that closes each patter line) set big and coloured on a row of their
// own. Each word is written on so that it is finished VLEAD before its sung onset, then dances:
// it bobs on every beat that falls inside it, and a long word ripples, one letter group per beat,
// so the lettering plays the rhythm as an instrument would.
import { W, H, clamp, lerp, hash, easeOut, backOut, beatPos, beatPulse, lastIndex, REC, VLEAD, TAU, inv, smooth } from './kit.js';
import { write, measure } from './hand.js';
import { GRAPHITE } from './palette.js';

// Where every lettered string was drawn, for the typography audit (see tools/typo-audit.mjs).
export const AUDIT = { on: false, rec: [], ctx: null };
if (typeof window !== 'undefined') window.__audit = AUDIT;
function note(kind, str, x, y, size, o = {}) {
  if (!AUDIT.on) return;
  AUDIT.rec.push({ kind, str, x, y, size, ...o, ctx: AUDIT.ctx });
}

const isPunct = s => /^[^A-Z0-9]+$/.test(s);
// Beats whose time lies inside [a, b].
export function beatsIn(a, b) {
  const B = REC._bts || (REC._bts = REC.beats.map(x => x.t));
  const out = [];
  for (let i = Math.max(0, lastIndex(B, a)); i < B.length && B[i] <= b; i++) if (B[i] >= a) out.push({ t: B[i], down: REC.beats[i].down });
  return out;
}

// How long a word takes to write: a little more for longer words, never so slow it is late.
const writeDur = n => clamp(.07 + .026 * n, .12, .34);

// Lay a line out. Returns rows of {i, str, x, y, size, w} and the block's bounds.
//   o.size body cap height, o.maxW row width, o.tail how many closing words are the tail (default 1),
//   o.tailSize cap height of the tail (default fits the row), o.tailMax
export function layoutLine(ws, o = {}) {
  const { x = W / 2, y = 220, maxW = 940, size = 80, minSize = 62, tail = 1, tailMax = 150, align = 'center', gap = 1.32, track = 4, rows: maxRows = 4, tailGap = .2, hiSize = {} } = o;
  const items = ws.map((w, i) => ({ i, str: w.str, w }));
  const bodyN = Math.max(0, items.length - tail);
  const body = items.slice(0, bodyN), tl = items.slice(bodyN);
  let sz = size, rows = [];
  for (let tries = 0; tries < 8; tries++) {
    rows = [[]];
    let cur = 0;
    const sp = measure(' ', sz, track) + track * sz / 100;
    for (const it of body) {
      const ww = measure(it.str, sz * (hiSize[it.i] || 1), track);
      if (cur + ww > maxW && rows[rows.length - 1].length) { rows.push([]); cur = 0; }
      rows[rows.length - 1].push({ ...it, size: sz * (hiSize[it.i] || 1), w: ww });
      cur += ww + sp;
    }
    if (rows.length <= maxRows || sz <= minSize) break;
    sz *= .93;
  }
  if (!body.length) rows = [];
  const out = [];
  const sp = measure(' ', sz, track) + track * sz / 100;
  let yy = y;
  for (const row of rows) {
    const rw = row.reduce((a, r) => a + r.w, 0) + sp * (row.length - 1);
    let xx = align === 'center' ? x - rw / 2 : x;
    for (const r of row) { out.push({ ...r, x: xx, y: yy }); xx += r.w + sp; }
    yy += sz * gap;
  }
  let tailInfo = null;
  if (tl.length) {
    const str = tl.map(t => t.str).join(' ');
    // (The tail's outline reaches past its width, so it is fitted 44 px inside the maximum: clear of the frame's edges.)
    const tsz = o.tailSize || Math.min(tailMax, sz * 1.9, sz * 1.9 * (maxW - 44) / measure(str, sz * 1.9, track));
    const tw = measure(str, tsz, track);
    const tsp = measure(' ', tsz, track) + track * tsz / 100;
    yy += tsz * tailGap * (rows.length ? 1 : 0);
    let xx = align === 'center' ? x - tw / 2 : x;
    for (const it of tl) {
      const ww = measure(it.str, tsz, track);
      out.push({ ...it, x: xx, y: yy + tsz * .1, size: tsz, w: ww, tail: true });
      xx += ww + tsp;
    }
    yy += tsz * 1.05;
    tailInfo = { size: tsz, w: tw };
  }
  return { items: out, bottom: yy, size: sz, tail: tailInfo };
}

// Draw a sung line. `ws` are the words from kit.words(). Returns the layout (for what's drawn round it).
//   colours: o.col body, o.tailCol tail, o.hi {i: colour} per word; o.tailBubble {fill, edge} sets the tail in outlined letters
//   o.dance px of bounce; o.hold seconds the words stay after the last is sung (before o.out); o.out {t0, dur}: leave
export function sing(g, t, ws, o = {}) {
  const { col = GRAPHITE, tailCol = null, hi = {}, dance = 7, seed = 1, tailBubble = null, out = null, w = .095, lead = 0, alpha = 1, track = 4 } = o;
  const L = layoutLine(ws, o);
  const bp = beatPulse(t, .16);
  const bpos = beatPos(t);
  let fade = 1;
  if (out) fade = 1 - smooth(inv(out.t0, out.t0 + (out.dur || .25), t));
  if (fade <= 0) return L;
  g.save();
  g.globalAlpha *= fade * alpha;
  const lift = out ? -smooth(inv(out.t0, out.t0 + (out.dur || .25), t)) * 26 : 0;
  for (const it of L.items) {
    const wd = it.w0 = ws[it.i];
    const n = it.str.length;
    const dur = writeDur(n);
    const v = wd.v - lead;  // fully written by here
    const a = v - dur;
    const prog = clamp((t - a) / dur);
    if (prog <= 0) continue;
    const c = hi[it.i] || (it.tail && tailCol) || col;
    // Beats that fall in the word: it bobs on each; a long word ripples letter by letter.
    const bts = beatsIn(wd.s - .06, Math.max(wd.e, wd.s + .3));
    let pulse = 0, rip = -1;
    for (const b of bts) {
      const dt = t - b.t;
      if (dt >= -.02 && dt < .5) {
        const k = Math.exp(-Math.max(0, dt) / .13) * (b.down ? 1 : .6);
        if (k > pulse) { pulse = k; rip = clamp((b.t - wd.s) / Math.max(.2, wd.e - wd.s + .1)); }
      }
    }
    // A word settles with a small pop as it finishes.
    const settle = t > v ? backOut(inv(v, v + .16, t), 2.4) : 1;
    const pop = it.tail ? 1 + (1 - clamp(settle)) * -.12 + pulse * .05 : 1 + pulse * .03;
    g.save();
    const cx = it.x + it.w / 2, cy = it.y - it.size / 2;
    g.translate(cx, cy + lift - pulse * (it.tail ? 9 : 5));
    g.scale(pop, pop);
    g.translate(-cx, -cy);
    const bub = it.tail && tailBubble ? tailBubble : null;
    write(g, it.str, it.x, it.y, it.size, { col: c, seed: seed * 7 + it.i * 3, t, prog, w, track, dance: dance * (it.tail ? 1.4 : 1), beat: bpos, pulse: bp, bubble: bub, wonk: it.tail ? .8 : 1 });
    g.restore();
    note(it.tail ? 'tail' : 'word', it.str, it.x, it.y, it.size, { w: it.w, s: wd.s, v: wd.v, li: wd.li, wi: wd.wi, prog, col: c, fill: bub ? bub.fill : null, alpha: fade * alpha });
  }
  g.restore();
  return L;
}
