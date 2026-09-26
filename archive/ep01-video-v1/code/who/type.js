// Kinetic lyrics for "Who Lives Here?". The lyrics are the main tool for holding attention, so
// they're designed type, composed into each shot, not subtitles. Three styles:
//   huge(g, t, S, o)  the hook, the intro, the line to remember: heavy, big, each word landing on
//                      its sung onset with a little overshoot; the word being sung glows.
//   band(g, t, S, o)  verse and "or" lines: medium, in a scrimmed band above X's UI zone.
//   hits(g, t, S, o)  the break's definition: one word (or pair) per hit, as big as the frame allows.
// All take o = { y, x?, w?, size?, align?, color?, accent?, backing? } in screen pixels (1080×1920).

import { W, H, clamp01, easeOut } from '../../lib/stage.js';
import { PAL, FONTS } from './plan.js';

// Scale for a word landing: 0.55 → 1 with a little overshoot (ease-out-back).
const pop = p => {
  p = clamp01(p);
  const c1 = 1.70158, c3 = c1 + 1, e = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  return 0.55 + 0.45 * e;
};

function lineAt(S, t, hold = 0.9) { return S.lineAt(t, hold); }

function layout(g, words, size, maxW, weight, family) {
  g.font = `${weight} ${size}px ${family}`;
  const space = g.measureText(' ').width * 0.9;
  const rows = [[]]; let rw = 0;
  for (const w of words) {
    const ww = g.measureText(w.w).width;
    if (rw + ww > maxW && rows[rows.length - 1].length) { rows.push([]); rw = 0; }
    rows[rows.length - 1].push({ ...w, ww });
    rw += ww + space;
  }
  return { rows, space };
}

function onsetOf(line, w) {
  if (w.s !== null) return w.s;
  const ends = line.words.filter(x => !x.backing && x.e !== null).map(x => x.e);
  return ends.length ? Math.max(...ends) + 0.05 : line.start;
}

// Hook and line-to-remember type.
export function huge(g, t, S, o = {}) {
  const line = lineAt(S, t, o.hold ?? 0.7);
  if (!line) return;
  const size = o.size || 150, maxW = o.w || 960, x0 = o.x ?? W / 2, y0 = o.y ?? 360;
  const sung = line.words.filter(w => !w.backing), back = line.words.filter(w => w.backing);
  const { rows, space } = layout(g, sung.map(w => ({ ...w, w: o.upper === false ? w.w : w.w.toUpperCase() })), size, maxW, 800, FONTS.display);
  const out = clamp01((line.end + (o.hold ?? 0.7) - t) / 0.25);
  g.save();
  g.textBaseline = 'alphabetic';
  g.font = `800 ${size}px ${FONTS.display}`;
  const lh = size * 0.98;
  rows.forEach((row, ri) => {
    const rowW = row.reduce((a, w) => a + w.ww, 0) + space * (row.length - 1);
    let x = o.align === 'left' ? x0 : x0 - rowW / 2;
    const y = y0 + ri * lh;
    for (const w of row) {
      const on = onsetOf(line, w), p = clamp01((t - on) / 0.14);
      if (p <= 0 && o.dimAhead) {       // optional: the rest of the line waits, dim
        g.save(); g.globalAlpha = 0.3 * out; g.fillStyle = o.ahead || PAL.textDim;
        g.fillText(w.w, x, y); g.restore();
      }
      if (p > 0) {
        const k = pop(p), cur = t >= on && t < (w.e ?? on) + 0.1;
        g.save();
        g.translate(x + w.ww / 2, y - size * 0.35);
        g.scale(k, k);
        g.rotate((1 - easeOut(p)) * -0.06);
        g.globalAlpha = Math.min(1, p * 1.6) * out;
        g.fillStyle = 'rgba(5,8,22,0.55)';
        g.fillText(w.w, -w.ww / 2 + size * 0.03, size * 0.35 + size * 0.05);
        g.fillStyle = cur ? (o.accent || PAL.gold) : (o.color || PAL.text);
        if (cur) { g.shadowColor = o.accent || PAL.gold; g.shadowBlur = size * 0.25; }
        g.fillText(w.w, -w.ww / 2, size * 0.35);
        g.restore();
      }
      x += w.ww + space;
    }
  });
  // Backing vocals: a smaller echo under the line, answering after the lead.
  if (back.length) {
    const bs = Math.round(size * 0.28);
    g.font = `600 ${bs}px ${FONTS.display}`;
    const txt = back.map(w => w.w).join(' ');
    const on = onsetOf(line, back[0]), p = clamp01((t - on) / 0.2);
    if (p > 0) {
      g.globalAlpha = p * out * 0.6;
      g.fillStyle = o.backing || PAL.textDim;
      g.textAlign = o.align === 'left' ? 'left' : 'center';
      g.fillText(txt, o.align === 'left' ? x0 : x0, y0 + rows.length * lh + bs * 0.2);
    }
  }
  g.restore();
}

// Verse and "or" lines, in a band.
export function band(g, t, S, o = {}) {
  const line = lineAt(S, t, o.hold ?? 0.6);
  if (!line) return;
  const size = o.size || 74, maxW = o.w || 940, y0 = o.y ?? 1330;
  const sung = line.words.filter(w => !w.backing);
  const { rows, space } = layout(g, sung, size, maxW, 700, FONTS.display);
  const lh = size * 1.12, bandH = rows.length * lh + size * 0.9;
  const out = clamp01((line.end + (o.hold ?? 0.6) - t) / 0.2), inn = clamp01((t - line.start + 0.1) / 0.18);
  g.save();
  // soft scrim
  const gr = g.createLinearGradient(0, y0 - size * 1.1, 0, y0 - size * 1.1 + bandH + size);
  gr.addColorStop(0, 'rgba(8,11,28,0)'); gr.addColorStop(0.25, PAL.scrim); gr.addColorStop(0.8, PAL.scrim); gr.addColorStop(1, 'rgba(8,11,28,0)');
  g.globalAlpha = Math.min(inn, out) * (o.scrim ?? 1);
  g.fillStyle = gr; g.fillRect(0, y0 - size * 1.1, W, bandH + size);
  g.globalAlpha = 1;
  g.font = `700 ${size}px ${FONTS.display}`;
  g.textBaseline = 'alphabetic';
  rows.forEach((row, ri) => {
    const rowW = row.reduce((a, w) => a + w.ww, 0) + space * (row.length - 1);
    let x = (o.x ?? W / 2) - rowW / 2;
    const y = y0 + ri * lh;
    for (const w of row) {
      // The whole line is readable from its start (dim ahead of the voice), so it still reads at
      // 1.5x; each word brightens with a small lift as it's sung.
      const on = onsetOf(line, w), p = clamp01((t - on) / 0.1);
      const cur = t >= on && t < (w.e ?? on) + 0.08;
      g.globalAlpha = out * inn * (0.55 + 0.45 * p);
      g.fillStyle = p <= 0 ? (o.ahead || PAL.textDim) : cur ? (o.accent || PAL.gold) : (o.color || PAL.text);
      g.fillText(w.w, x, y - easeOut(p) * size * 0.06 + (p > 0 ? 0 : size * 0.02));
      x += w.ww + space;
    }
  });
  g.restore();
}

// The break: one hit at a time, as big as it will go. groups: [[t0, 'SOFTWARE'], [t1, 'QUALITY'], ...]
export function hits(g, t, S, groups, o = {}) {
  let cur = null;
  for (const gp of groups) if (t >= gp[0] - 0.02) cur = gp;
  if (!cur || t > (o.until ?? Infinity)) return;
  const i = groups.indexOf(cur), next = groups[i + 1];
  const dur = next ? next[0] - cur[0] : 1.2, p = clamp01((t - cur[0]) / 0.12);
  const size = o.size || 230;
  g.save();
  g.font = `800 ${size}px ${FONTS.display}`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  let s = size; const maxW = o.w || 1000;
  const tw = g.measureText(cur[1]).width;
  if (tw > maxW) { s = size * maxW / tw; g.font = `800 ${s}px ${FONTS.display}`; }
  const k = pop(p) * (1 + 0.04 * clamp01((t - cur[0]) / dur));
  g.translate(o.x ?? W / 2, o.y ?? 420);
  g.scale(k, k);
  g.fillStyle = 'rgba(5,8,22,0.55)'; g.fillText(cur[1], 6, 10);
  g.fillStyle = o.color || PAL.goldHi; g.shadowColor = PAL.gold; g.shadowBlur = s * 0.3;
  g.fillText(cur[1], 0, 0);
  g.restore();
}

// Your handwriting, written stroke by stroke (p = 0..1 of the text revealed).
export function handwrite(g, text, x, y, size, p, color = PAL.ink, maxW = 9999) {
  g.save();
  g.font = `600 ${size}px ${FONTS.hand}`;
  g.fillStyle = color; g.textBaseline = 'alphabetic';
  const chars = Math.floor(text.length * clamp01(p));
  const shown = text.slice(0, chars);
  // simple wrap
  const words = shown.split(' '); let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += size * 1.05; }
    else line = test;
  }
  g.fillText(line, x, yy);
  // the pen nib, while writing
  if (p > 0 && p < 1) {
    const lw = g.measureText(line).width;
    g.fillStyle = PAL.ink; g.beginPath(); g.arc(x + lw + 4, yy - size * 0.2, size * 0.08, 0, 7); g.fill();
  }
  g.restore();
}
