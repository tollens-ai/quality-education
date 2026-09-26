// The sung words on screen. A word appears on its sung onset with a small pop, glows warm while
// it's being sung, then settles white. Nothing shows before it's sung. Backing vocals ride
// underneath in a lighter italic. Shots can place, size and colour the caption, or draw their own.
import { W, H, C, clamp, lerp, smooth, easeOut, easeOutBack, rgba, mix } from './kit.js';

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

// Word layout: one row if it fits; otherwise break at the sung phrases (after , ? ! .), and
// wrap greedily only inside a phrase that is still too long. No lonely orphans.
function layout(g, words, size, maxW, font, weight, ls) {
  g.font = `${weight} ${size}px ${font}`;
  g.letterSpacing = `${ls}px`;
  const sp = g.measureText(' ').width;
  const ws = words.map(w => ({ ...w, ww: g.measureText(w.w).width }));
  const width = row => row.reduce((a, w) => a + w.ww, 0) + sp * Math.max(0, row.length - 1);
  if (width(ws) <= maxW) return { rows: [ws], sp };
  const phrases = [[]];
  ws.forEach((w, i) => { phrases[phrases.length - 1].push(w); if (/[,?!.;:]$/.test(w.w) && i < ws.length - 1) phrases.push([]); });
  const rows = [];
  for (const ph of phrases) {
    if (width(ph) <= maxW) { rows.push(ph); continue; }
    let row = [];
    for (const w of ph) { if (row.length && width([...row, w]) > maxW) { rows.push(row); row = []; } row.push(w); }
    if (row.length) rows.push(row);
  }
  // Merge a tiny trailing row into the previous one if it fits.
  for (let i = rows.length - 1; i > 0; i--) if (rows[i].length === 1 && width([...rows[i - 1], ...rows[i]]) <= maxW) { rows[i - 1].push(...rows[i]); rows.splice(i, 1); }
  return { rows, sp };
}

// st: { y (centre of the block), x (centre), size, maxW, color, hot, weight, font, ls, shadow,
//       align, backing: {color, size}, hide: [words not to caption], alpha }
export function drawCaption(g, t, st = {}, line = lineAt(t, st.hold ?? .45)) {
  if (!line || st.off || (st.until && t > st.until)) return;
  const k = g.getTransform().a;
  const size0 = st.size || 84, maxW = st.maxW || 920, font = st.font || 'Bricolage', weight = st.weight || 800;
  const ls = st.ls ?? -1;
  const hide = new Set((st.hide || []).map(s => s.toLowerCase()));
  const words = line.lead.filter(w => !hide.has(w.w.toLowerCase().replace(/[^a-z0-9']/g, '')));
  if (!words.length && !line.back.length) return;
  g.save();
  // Shrink a little (never below 80%) rather than break a sung phrase in the middle.
  let size = size0;
  g.font = `${weight} ${size}px ${font}`; g.letterSpacing = `${ls}px`;
  const phraseW = (() => {
    let best = 0, cur = [];
    const spw = g.measureText(' ').width;
    const flush = () => { if (cur.length) best = Math.max(best, cur.reduce((a, w) => a + g.measureText(w.w).width, 0) + spw * (cur.length - 1)); cur = []; };
    words.forEach(w => { cur.push(w); if (/[,?!.;:]$/.test(w.w)) flush(); });
    flush();
    return best;
  })();
  if (phraseW > maxW) size = Math.max(size0 * .8, size0 * maxW / phraseW);
  const { rows, sp } = layout(g, words, size, maxW, font, weight, ls);
  const lh = size * (st.lh || 1.06);
  const blockH = rows.length * lh;
  const cx = st.x ?? W / 2;
  let y0 = (st.y ?? 330) - blockH / 2 + size * .78;
  const out = 1 - smooth((t - Math.min(line.next - .02, line.end + (st.hold ?? .45)) + .14) / .14);
  g.globalAlpha = (st.alpha ?? 1) * out;
  g.textBaseline = 'alphabetic';
  g.textAlign = 'left';
  rows.forEach((row, ri) => {
    const rw = row.reduce((a, w) => a + w.ww, 0) + sp * (row.length - 1);
    let x = st.align === 'left' ? (st.x ?? 90) : cx - rw / 2;
    const y = y0 + ri * lh;
    for (const w of row) {
      const on = w.s;
      const p = clamp((t - on) / .09);
      // Words the shot allows ahead of the voice sit dimmed until they're sung.
      const wi = line.lead.indexOf(line.lead.find(x => x.s === w.s && x.w === w.w));
      if (p <= 0 && st.ahead && wi < st.ahead) {
        g.save();
        g.font = `${weight} ${size}px ${font}`; g.letterSpacing = `${ls}px`;
        g.globalAlpha *= .38;
        if (st.shadow !== false) { g.shadowColor = st.shadowCol || 'rgba(8,4,26,.85)'; g.shadowBlur = (st.shadowBlur || 22) * k; }
        g.fillStyle = st.color || '#fff8ee';
        g.fillText(w.w, x, y);
        g.restore();
      }
      if (p > 0) {
        const pop = easeOutBack(clamp((t - on) / .26), 2.2);
        const sc = lerp(.78, 1, pop);
        const singing = t >= on && t < (w.e ?? on) + .05;
        const after = clamp((t - (w.e ?? on) - .05) / .18);
        const col = singing ? (st.hot || C.gold) : mix(st.hot || C.gold, st.color || '#fff8ee', after);
        g.save();
        g.translate(x + w.ww / 2, y - size * .3);
        g.scale(sc, sc);
        g.translate(-w.ww / 2, size * .3 + (1 - pop) * size * .12);
        g.globalAlpha *= p;
        if (st.shadow !== false) {
          g.shadowColor = st.shadowCol || 'rgba(8,4,26,.85)';
          g.shadowBlur = (st.shadowBlur || 22) * k;
          g.shadowOffsetY = 4 * k;
        }
        g.font = `${weight} ${size}px ${font}`;
        g.letterSpacing = `${ls}px`;
        g.fillStyle = col.startsWith('#') ? col : col;
        g.fillText(w.w, 0, 0);
        g.restore();
      }
      x += w.ww + sp;
    }
  });
  // Backing vocals under the lead line.
  if (line.back.length && st.backing !== false) {
    const bst = st.backing || {};
    const on = line.leadEnd - .05;
    const p = clamp((t - on) / .2);
    if (p > 0) {
      const bs = bst.size || size * .56;
      const txt = line.back.map(w => w.w).join(' ');
      g.font = `italic 600 ${bs}px ${font}`;
      g.letterSpacing = '0px';
      const tw = g.measureText(txt).width;
      let x = (bst.x ?? cx) - tw / 2;
      const y = bst.y ?? (y0 + (rows.length - 1) * lh + bs * 1.35);
      let ci = 0;
      for (const ch of txt) {
        const cw = g.measureText(ch).width;
        const wave = Math.sin(t * 9 - ci * .5) * bs * .08;
        g.save();
        g.globalAlpha *= p;
        if (st.shadow !== false) { g.shadowColor = 'rgba(8,4,26,.8)'; g.shadowBlur = 16 * k; }
        g.fillStyle = bst.color || C.pink;
        g.fillText(ch, x, y + wave);
        g.restore();
        x += cw; ci++;
      }
    }
  }
  g.restore();
}
