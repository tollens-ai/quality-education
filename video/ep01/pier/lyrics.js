// The sung words, lettered by hand into each shot. A line is laid out as a small composition (its
// own breaks, sizes and emphasis) and each word is written on, stroke by stroke, as it's sung.
// Nothing shows before it's sung. Backing vocals are lettered smaller, in pink, on a wavy line.
import { W, H, C, clamp, lerp, smooth, easeOut, easeOutBack, rgba, mix, INK } from './kit.js';
import { letter, measure, AUDIT } from './hand.js';

let LINES = [];
export function setLyrics(lyrics) {
  // The first word is on screen from the very first frame (it doubles as the thumbnail).
  lyrics = lyrics.map((l, i) => i ? l : { ...l, start: -.4, words: l.words.map((w, k) => k ? w : { ...w, s: -.4 }) });
  LINES = lyrics.filter(l => l.start !== null).map((l, i, arr) => {
    const lead = l.words.filter(w => !w.backing && w.s !== null);
    const back = l.words.filter(w => w.backing);
    const leadEnd = lead.length ? Math.max(...lead.map(w => w.e ?? w.s)) : l.start;
    return { ...l, i, lead, back, leadEnd, next: arr[i + 1]?.start ?? 1e9 };
  });
}
export const lines = () => LINES;

// The line whose words are on screen at t (from its first word until the next line or a hold).
export function lineAt(t, hold = .45) {
  let cur = null;
  for (const l of LINES) {
    const first = l.lead[0]?.s ?? l.start;
    if (t >= first - .02 && t < Math.min(l.next - .02, l.end + hold)) cur = l;
  }
  return cur;
}
// The line that starts nearest t0.
export function lineNear(t0) {
  let best = null;
  for (const l of LINES) if (!best || Math.abs(l.start - t0) < Math.abs(best.start - t0)) best = l;
  return best;
}

// The house styles. paint: cream brush capitals with a dark signwriter's shade, for night.
// ink: dark capitals with a pale shade, for day. sign: heavy capitals, shaded and outlined.
export const STYLE = {
  paint: { col: '#fff3de', w: .155, shade: { col: '#1d1233', dx: .045, dy: .055 }, outline: { col: '#1d1233', w: .022 } },
  ink: { col: '#2b1f3c', w: .155, shade: { col: 'rgba(255,248,236,.9)', dx: .04, dy: .05 } },
  sign: { col: '#ffe9c4', w: .2, shade: { col: '#8a1a3a', dx: .05, dy: .06 }, outline: { col: '#2b1f3c', w: .045 } },
  hot: '#ffc94a', pink: '#ff8fb8', berry: '#b0104f',
  // Backing vocals on a dawn or daylight sky: dark berry with a pale shade.
  dawnBack: { col: '#5e1440', shade: { col: 'rgba(255,244,230,.85)', dx: .04, dy: .05 } },
};

// The end of the shot being drawn, set by main.js: words written near a cut are written faster.
let SHOT_END = 1e9;
export function setShotEnd(t) { SHOT_END = t; }
// How long to take writing a word that starts at `s`, at most `d`: short enough to finish .45 s
// before the cut. For lettering drawn outside sing().
export function writeDur(s, d) { return Math.min(d, Math.max(.05, SHOT_END - s - .45)); }

// Write word i of a line: how much of it is on by t (0..1), from its onset over its sung length.
// It always finishes .45 s before the shot ends, so a line's last word is readable before a cut.
function written(w, t, speed = 1) {
  let d = clamp(((w.e ?? w.s + .25) - w.s) * .75, .09, .32) / speed;
  d = Math.min(d, Math.max(.05, SHOT_END - w.s - .45));
  return clamp((t - w.s) / d);
}

// sing(g, t, t0, spec): letter the line starting nearest t0.
// spec: { rows: [{ text, x, y, size, align, rot, col, w }], style, emph: { word: {col, size} },
//         until, alpha, speed, hold }
// Row text must follow the sung words in order ("Confetti cannons" / "every time you" / "floss,").
export function sing(g, t, t0, spec) {
  const L = typeof t0 === 'object' ? t0 : lineNear(t0);
  if (!L) return;
  if (spec.until !== undefined && t > spec.until) return;
  const out = spec.hold === undefined ? 1 : 1 - smooth((t - (L.end + spec.hold)) / .18);
  if (out <= 0) return;
  const base = { ...STYLE[spec.style || 'paint'], ...(spec.o || {}) };
  let wi = spec.from || 0;
  const raw = g.raw || g;
  raw.save();
  raw.globalAlpha *= (spec.alpha ?? 1) * out;
  for (const row of spec.rows) {
    const words = row.text.split(' ').filter(Boolean);
    let size = row.size || spec.size || 90;
    const wt = row.w ?? base.w;
    // Never let a row run off the page: shrink it to fit the width it's allowed.
    const maxW = row.maxW ?? spec.maxW ?? 940;
    const natural = words.reduce((a, s) => a + measure(s, size, wt), 0) + size * .42 * (words.length - 1);
    if (natural > maxW) size *= maxW / natural;
    const ws = words.map(s => measure(s, size, wt));
    const gap = size * .42;
    const total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
    let x = row.align === 'left' ? row.x : row.align === 'right' ? row.x - total : (row.x ?? 540) - total / 2;
    raw.save();
    if (row.alpha !== undefined) raw.globalAlpha *= row.alpha;
    if (row.rot) { raw.translate(row.x ?? 540, row.y); raw.rotate(row.rot); raw.translate(-(row.x ?? 540), -row.y); }
    words.forEach((word, k) => {
      const w = L.lead[wi++];
      const pre = spec.pre && wi <= spec.pre;
      if (w && (pre || t >= w.s - .01)) {
        const key = word.toLowerCase().replace(/[^a-z0-9']/g, '');
        const em = spec.emph?.['#' + (wi - 1)] || spec.emph?.[key] || {};
        const p = pre ? 1 : written(w, t, (em.speed ?? 1) * (spec.speed || 1));
        if (AUDIT.on) AUDIT.ctx = { line: L.i, word: wi - 1 };
        letter(g, word, x, row.y + (em.dy || 0), size * (em.size || 1), {
          ...base, col: em.col || row.col || base.col, cols: em.cols || row.cols, w: em.w ?? wt, jitter: em.jitter ?? row.jitter ?? spec.jitter ?? 1,
          progress: p, seed: (L.i * 31 + wi) % 997, shade: em.shade ?? row.shade ?? base.shade, outline: em.outline ?? row.outline ?? base.outline,
        });
        if (AUDIT.on) AUDIT.ctx = null;
      }
      x += ws[k] + gap;
    });
    raw.restore();
  }
  raw.restore();
}

// The line to remember, as one lockup: "I can't read your mind," above "I'm only reading your
// prompt." Each half is written on as it's sung; the first half stays up while the second is
// sung, so the whole line can be read (and screenshotted) at once. y0 is the first baseline.
export function keyLine(g, t, mindT0, promptT0, y0 = 230, o = {}) {
  sing(g, t, mindT0, { rows: [{ text: "I can't read", y: y0, size: 80 }, { text: 'your mind,', y: y0 + 128, size: 108 }], ...o });
  sing(g, t, promptT0, { rows: [{ text: "I'm only reading", y: y0 + 262, size: 76 }, { text: 'your prompt.', y: y0 + 420, size: 140 }], emph: { prompt: { col: STYLE.hot } }, ...o });
}

// The backing vocals ("ooh-ooh-ooh"), lettered small in pink on a line that waves with them.
export function backing(g, t, t0, x, y, size = 58, col = STYLE.pink, o = {}) {
  const L = typeof t0 === 'object' ? t0 : lineNear(t0);
  if (!L || !L.back.length) return;
  const on = L.leadEnd - .05;
  const p = clamp((t - on) / .5) * (1 - smooth((t - L.end - .3) / .25));
  if (p <= 0) return;
  const txt = L.back.map(w => w.w.replace(/[()]/g, '')).join(' ');
  const raw = g.raw || g;
  raw.save();
  raw.translate(x, y);
  raw.rotate((o.rot ?? -.03) + Math.sin(t * 5) * .015);
  if (AUDIT.on) AUDIT.ctx = { line: L.i, backing: true };
  letter(g, txt, 0, Math.sin(t * 7) * size * .06, size, { col, w: .13, align: 'center', progress: easeOut(p), seed: L.i * 7, shade: { col: '#1d1233', dx: .04, dy: .05 }, ...o });
  if (AUDIT.on) AUDIT.ctx = null;
  raw.restore();
}

// Compatibility with shots not yet given their own layout: a plain centred block.
export function drawCaption(g, t, st = {}, line = lineAt(t, st.hold ?? .45)) {
  if (!line || st.off || (st.until && t > st.until)) return;
  const size = (st.size || 84) * .9;
  const words = line.lead.map(w => w.w);
  const maxW = st.maxW || 900;
  const rows = []; let cur = [];
  for (const w of words) { const test = [...cur, w].join(' '); if (cur.length && measure(test, size) > maxW) { rows.push(cur.join(' ')); cur = [w]; } else cur.push(w); }
  if (cur.length) rows.push(cur.join(' '));
  const lh = size * 1.25;
  const y0 = (st.y ?? 330) - (rows.length - 1) * lh / 2 + size * .4;
  sing(g, t, line, { rows: rows.map((r, i) => ({ text: r, y: y0 + i * lh, x: st.x ?? 540, size })), style: st.style || 'paint' });
  if (st.backing !== false) backing(g, t, line, st.x ?? 540, y0 + rows.length * lh + 10, size * .6);
}
