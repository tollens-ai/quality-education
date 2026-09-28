// Sung words in shots: find a line's words, time them to land a touch before the voice, and
// draw them with an entrance, a life while they're up, and an exit.
//
// VLEAD: every word lands 85 ms before its measured onset. Qing chose it by ear from three
// versions of chorus 1 (2026-09-28: "between a and b [...] maybe 80-90"): a word lit exactly on
// the measured onset feels "a tiny fraction late".
import { C, clamp, lerp, easeOut, easeIn, backOut, noise, hash, LY, line, lineIndex, hit, env } from './kit.js';
import { text, measure, ENTER, arrive, AUDIT, shout, quiet } from './type.js';

export const VLEAD = .085;
export const land = w => w.s - VLEAD;

// The words of a line (section, first words, nth such line), with their landing times.
export function words(section, starts, nth = 0) {
  const l = line(section, starts, nth);
  const li = lineIndex(l);
  return l.words.map((w, wi) => ({ ...w, v: land(w), li, wi, back: l.back }));
}

// Draw one sung word as part of the picture.
//   w       a word from words()
//   x, y    baseline position (align in o)
//   size, face
//   o.enter  entrance style (ENTER key), o.lead its length in seconds
//   o.out    time the word leaves (seconds), o.exit style: 'cut' | 'fade' | 'drop' | 'shatter'
//   o.live   fn(t, w) -> {dx, dy, rot, s} motion while it's up
//   o.caps   true to set in capitals (default); o.str to override the text
// Returns the word's width at full size.
export function sing(g, t, w, x, y, size, face, o = {}) {
  const str = o.str ?? (o.caps === false ? quiet(w.w) : shout(w.w));
  const lead = o.lead ?? .12;
  const p = arrive(t, w.v, lead);
  const out = o.out ?? 1e9;
  if (p <= 0 || t >= out + (o.exitLen ?? 0)) return measure(g, str, size, face, o.track || 0);
  const pose = (ENTER[o.enter || 'cut'] || ENTER.cut)(p);
  let alpha = pose.alpha, sc = pose.s, dx = pose.dx || 0, dy = (pose.dy || 0) * (pose.rel ? size : 1), rot = pose.rot || 0, sx = pose.sx || 1;
  if (o.live && t >= w.v) {
    const L = o.live(t, w) || {};
    dx += L.dx || 0; dy += L.dy || 0; rot += L.rot || 0; sc *= L.s || 1;
  }
  if (t >= out) {
    const q = clamp((t - out) / (o.exitLen || .001));
    if (o.exit === 'fade') alpha *= 1 - q;
    else if (o.exit === 'drop') { dy += easeIn(q, 2) * 400; rot += q * (hash(w.s) - .5) * .8; alpha *= 1 - q * .6; }
    else alpha = 0;
  }
  const tw = measure(g, str, size, face, o.track || 0);
  const ax = o.align === 'center' ? tw / 2 : o.align === 'right' ? tw : 0;
  g.save();
  g.translate(x + dx, y + dy);
  if (rot) g.rotate(rot);
  if (sc !== 1 || sx !== 1) { g.translate(0, -size * .35); g.scale(sc * sx, sc); g.translate(0, size * .35); }
  const st = { ...o.style };
  if (st.outline !== false && st.fill && !st.stroke) st.stroke = { w: Math.max(2.5, size * (st.outlineK ?? .03)), col: st.outlineCol || C.ink, join: 'round' };
  text(g, str, -ax, 0, size, face, {
    ...st, alpha: alpha * (o.style?.alpha ?? 1), prog: p,
    ctx: o.ctx ?? { line: w.li, word: w.wi },
  });
  g.restore();
  return tw;
}

// A line set in rows that the shot designs: rows = [[wordIndex...], ...] with a size and face
// per row; the rows are stacked from y down, each aligned in the frame.
export function rows(g, t, ws, spec, o = {}) {
  let y = spec.y;
  const out = [];
  const maxW = spec.maxW ?? 960;
  spec.rows.forEach((r, ri) => {
    const face = r.face || spec.face || 'black';
    const list = r.w.map(i => ws[i]);
    const strs = list.map(w => r.caps === false ? quiet(w.w) : shout(w.w));
    // Shrink a row to fit the frame rather than run off it; in the lower half, keep it clear of
    // the right-hand strip where the phone apps put their buttons (x > 940).
    let size = r.size;
    const low = y + (r.dy ?? size * (ri ? .98 : 0)) + size * .3 > 950;
    const room = low ? Math.min(r.maxW ?? maxW, 870 - size * .1) : (r.maxW ?? maxW);
    const natural = strs.reduce((a, s) => a + measure(g, s, size, face), 0) + size * (r.space ?? .24) * (list.length - 1);
    if (natural > room) size *= room / natural;
    const gap = size * (r.space ?? .24);
    const widths = strs.map(s => measure(g, s, size, face));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (list.length - 1);
    let x = r.align === 'right' ? (r.x ?? 1000) - total : r.align === 'left' ? (r.x ?? 80) : (r.x ?? 540) - total / 2;
    const lim = 930 - size * .1;
    if (low && x + total > lim) x = Math.max(60, lim - total);
    y += r.dy ?? size * (ri ? .98 : 0);
    list.forEach((w, i) => {
      const style = o.stress?.includes(w.wi) ? { ...(r.style || {}), ...(o.stressStyle || STYLE.red) } : { ...(o.style || {}), ...(r.style || {}) };
      sing(g, t, w, x, y, size, face, { ...o, ...r.o, style, caps: r.caps });
      out.push({ w, x, y, width: widths[i], size });
      x += widths[i] + gap;
    });
  });
  return out;
}

// The lettering's standard styles, all flat: bone on black, red for the stressed word, the
// echo in hollow italic glass-blue.
export const STYLE = {
  bone: { fill: C.bone, shadow: { dx: 0, dy: 8, col: C.ink } },
  red: { fill: C.red, shadow: { dx: 0, dy: 8, col: C.ink }, outlineK: .045 },
  ink: { fill: C.ink },
  echo: { fill: null, hollow: { w: 4, col: C.glass } },
  echoSolid: { fill: C.glass, shadow: { dx: 0, dy: 6, col: C.ink } },
};

// An echo: a backing line's words in a row, hollow glass-blue italics, lower case, sung by the
// reflections. align 'right' anchors the row's right end at x.
export function echo(g, t, ws, x, y, size, o = {}) {
  const face = o.face || 'xital';
  const strs = ws.map(w => quiet(w.w));
  const gap = size * .24;
  const widths = strs.map(s => measure(g, s, size, face));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  let xx = o.align === 'right' ? x - total : o.align === 'center' ? x - total / 2 : x;
  ws.forEach((w, i) => {
    sing(g, t, w, xx, y, size, face, { enter: o.enter || 'flip', lead: o.lead ?? .14, caps: false,
      style: o.style || { fill: null, hollow: { w: Math.max(3, size * .045), col: C.glass } }, out: o.out, exit: o.exit, exitLen: o.exitLen, live: o.live });
    xx += widths[i] + gap;
  });
  return total;
}
