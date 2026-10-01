// The sung words and the bouncing ball. One sung line at a time, in one place for the whole film:
// centred, just below the middle of the frame, where eyes go for subtitles, over the dark apron of
// every set. Each word springs up a hair before it's sung (LEAD), and a red ball, after the
// sing-along cartoons of the 1920s and '30s, hops along and lands on it. The line holds as one
// block across the cuts until the next line is about to arrive, then drops away.
// Quoted speech ("Saved!") sits in a speech bubble pointing at whoever says it; the scare quotes on
// Clawd's "tests" are in the crew's rose, as if they'd pencilled them in.
import { W, H, clamp, lerp, easeOut, backOut, smooth, bell, REC, beatPos, noise, hash, TAU } from './kit.js';
import { INK, CREAM, GOLD, RED, RED_SH, WHITE, ROSE, C } from './palette.js';
import { word, textW, DISPLAY, PATTER } from './type.js';
import { shape, ellipse, spline, line } from './ink.js';

export const LEAD = .085;      // words finish arriving this long before the voice (episode 2's measured choice)
const POP = .12;               // how long a word takes to spring up
export const LYRIC_TOP = 1190; // the top of every block, in master pixels
const BALL_CEIL = 1112;       // the ball's top never rises above this: it stays in the lyric's band, out of the picture
// The column the lyric sits in: centred a hair left of the frame's middle, so the widest row stays
// clear of the phone apps' buttons down the right edge of the lower half (x 940 and beyond).
export const LYRIC_X = 500;
const MAXW = 850;

// How each part of the song is lettered.
const STYLE = {
  Intro: { font: DISPLAY, size: 96, min: 80 },
  'Verse 1': { font: PATTER, size: 94, min: 78 },
  Chorus: { font: DISPLAY, size: 108, min: 86 },
  'Verse 2': { font: PATTER, size: 94, min: 78 },
  Bridge: { font: PATTER, size: 92, min: 76 },
  Breakdown: { font: DISPLAY, size: 88, min: 74 },
  Outro: { font: DISPLAY, size: 96, min: 80 },
};
// Speech in a bubble, keyed by the line's first words: {from, to} word indices (inclusive), and
// tail, the screen point the bubble's tail reaches toward (the speaker).
export const BUBBLE = {};
// Lines split into two blocks where they'd otherwise need three rows: key -> word index to split at.
export const SPLIT = {};
// Where a two-row line should break, when the phrase wants it: key -> index of the second row's first word.
export const BREAK = { 'Did you actually t': 3, 'Press it, stress i': 4, 'What did you try? ': 4, 'Find a clue? Congr': 3 };

let BLOCKS = null, LAND = null;
const measureCtx = () => document.createElement('canvas').getContext('2d');
function sectionKey(sec) { for (const k of Object.keys(STYLE)) if (sec.startsWith(k)) return k; return 'Verse 1'; }
const key18 = l => l.text.slice(0, 18);
const isQuote = ch => '"“”'.includes(ch);
const mixHex = (a, b, p) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const m = sh => Math.round(((A >> sh) & 255) + ((((B >> sh) & 255) - ((A >> sh) & 255)) * p)); return '#' + [16, 8, 0].map(sh => m(sh).toString(16).padStart(2, '0')).join(''); };

// Lay out the blocks once: each sung line (or a half, if SPLIT) as one block of one or two rows.
export function build() {
  if (BLOCKS) return BLOCKS;
  const g = measureCtx();
  const groups = [];
  for (const l of REC.lines) {
    const sp = SPLIT[key18(l)];
    if (sp) { groups.push({ line: l, words: l.words.slice(0, sp), part: 0 }); groups.push({ line: l, words: l.words.slice(sp), part: 1 }); }
    else groups.push({ line: l, words: l.words, part: 0 });
  }
  BLOCKS = groups.map((b, bi) => {
    const st = STYLE[sectionKey(b.line.section)];
    const bub = BUBBLE[key18(b.line)];
    let size = st.size, rows;
    // a line that sits in a wide speech bubble gets a narrower column, so the bubble has room to the frame's edge
    const mw = bub && bub.to - bub.from >= 2 ? MAXW - 80 : MAXW;
    const display = w => bub && b.line.words.indexOf(w) >= bub.from && b.line.words.indexOf(w) <= bub.to ? [...w.w].filter(c => !isQuote(c) && c !== '\u2014').join('') : w.w;
    for (;;) {
      const space = textW(g, ' ', st.font, size) * (st.font === DISPLAY ? 1.4 : 1.22);
      const ws = b.words.map(w => ({ ...w, shown: display(w), x: 0 }));
      ws.forEach(w => { w.ww = textW(g, w.shown, st.font, size); });
      const widthOf = (a, c) => ws.slice(a, c).reduce((acc, w) => acc + w.ww, 0) + space * (c - a - 1);
      const n = ws.length;
      // one row if it fits; else the two-row split with the shortest longest row, preferring a break
      // after punctuation
      let cuts = null;
      const brk = BREAK[key18(b.line)];
      if (widthOf(0, n) <= mw) cuts = [0, n];
      else if (brk && b.words === b.line.words && widthOf(0, brk) <= mw && widthOf(brk, n) <= mw) cuts = [0, brk, n];
      else if (!brk || b.words !== b.line.words) {
        let best = 1e9;
        for (let j = 1; j < n; j++) {
          const a = widthOf(0, j), c = widthOf(j, n);
          if (a > mw || c > mw) continue;
          const pen = /[,;:.!?—-]$/.test(ws[j - 1].w) ? 0 : size * 2.2;
          const cost = Math.max(a, c) + pen;
          if (cost < best) { best = cost; cuts = [0, j, n]; }
        }
      }
      if (cuts || size <= 56) {
        if (!cuts) { console.error('lyric line too wide:', b.line.text); const j = Math.ceil(n / 2); cuts = [0, j, n]; }
        rows = [];
        for (let c = 0; c < cuts.length - 1; c++) rows.push({ words: ws.slice(cuts[c], cuts[c + 1]), w: widthOf(cuts[c], cuts[c + 1]) });
        const lh = size * (st.font === DISPLAY ? 1.44 : 1.4);   // room for the ball between rows
        rows.forEach((r, ri) => {
          let x = LYRIC_X - r.w / 2;
          r.y = LYRIC_TOP + size * .86 + ri * lh;
          for (const w of r.words) { w.x = x; w.y = r.y; w.size = size; x += w.ww + space; }
        });
        break;
      }
      size -= 2;
    }
    rows.forEach((r, ri) => r.words.forEach(w => { w.row = ri; }));
    const words = rows.flatMap(r => r.words);
    const first = words[0].s, lastE = Math.max(...words.map(w => w.e ?? w.s));
    const row2 = rows.length > 1 ? rows[1].words[0].s - LEAD : null;
    const inBub = bub ? words.filter(w => { const i = b.line.words.findIndex(v => v.s === w.s); return i >= bub.from && i <= bub.to; }) : [];
    return { i: bi, line: b.line, rows, words, st, size, first, lastE, row2, bub: inBub.length ? { words: inBub, tail: bub.tail } : null };
  });
  BLOCKS.forEach((b, i) => {
    const next = BLOCKS[i + 1];
    const nextIn = next ? next.first - LEAD - POP - .1 : 1e9;
    const lastS = b.words[b.words.length - 1].s;
    // hold until the next block is about to arrive (no more than 1.6 s after the voice stops), and
    // never take the last word away within a quarter second of its being sung
    // a section's last line doesn't linger into the next section's first pictures
    const hold = next && next.line.section !== b.line.section ? .45 : 1.6;
    b.out = Math.max(lastS + .16, Math.min(nextIn, b.lastE + hold));
    b.in = b.first - LEAD - POP;
  });
  // where the singer runs one line into the next, the next block's first words wait until the last
  // block has gone, and spring up faster to land on time
  BLOCKS.forEach((b, i) => { b.floor = i ? BLOCKS[i - 1].out + .09 : -1e9; b.in = Math.max(b.in, Math.min(b.floor, b.first - LEAD - .04)); });
  // the backing voices' echoes don't get lettering of their own (a second line to read): the lead
  // word they repeat glows rose as they sing it
  const norm = s => s.toLowerCase().replace(/[^a-z']/g, '');
  for (const l of REC.echo || []) {
    const blk = BLOCKS.filter(b => b.words[0].s <= l.words[0].s).pop();
    if (!blk) continue;
    // the run of lead words the echo repeats, whole: "What did you find?" lights the second row's
    // phrase, not the first row's "What did you"
    const n = l.words.length;
    for (let i = blk.words.length - n; i >= 0; i--) {
      if (l.words.every((e, j) => norm(blk.words[i + j].w) === norm(e.w))) { l.words.forEach((e, j) => (blk.words[i + j].echo ||= []).push(e.s)); break; }
    }
  }
  LAND = [];
  for (const b of BLOCKS) for (const w of b.words) LAND.push({ t: w.s - LEAD, x: w.x + w.ww / 2, w, size: w.size, b });
  return BLOCKS;
}
// When the singing moves to the second row, the first lifts a little, opening room for the ball.
export function lift(b, t) { return b.row2 == null ? 0 : b.size * .5 * smooth((t - (b.row2 - .3)) / .26); }
const wordY = (b, w, t) => w.y - (w.row === 0 ? lift(b, t) : 0);
export const blocks = () => build();
export function blockAt(t) { for (const b of build()) if (t >= b.in && t < b.out) return b; return null; }

// Draw the lyric at t: a soft dark pool behind the block, the block, its echo, then the ball.
export function drawLyrics(g, t, o = {}) {
  build();
  let shown = null;
  for (const b of BLOCKS) if (t >= b.in - .02 && t < b.out + .14) { if (!shown || t < b.out) shown = b; }
  if (typeof window !== 'undefined') window.__textTag = 'lyric';
  for (const b of BLOCKS) if (t >= b.in - .02 && t < b.out + .09) { pool(g, b, t); drawBlock(g, b, t); }
  if (o.ball !== false) drawBall(g, t);
  if (typeof window !== 'undefined') window.__textTag = null;
}
// A soft darkness behind the block, so the letters read on any picture.
function pool(g, b, t) {
  const a = clamp((t - b.in) / .2) * (1 - clamp((t - b.out) / .14));
  if (a <= 0) return;
  const top = LYRIC_TOP - 20 - lift(b, t), bottom = b.rows[b.rows.length - 1].y + b.size * .45, cx = LYRIC_X, cy = (top + bottom) / 2;
  const wmax = Math.max(...b.rows.map(r => r.w));
  g.save(); g.globalAlpha = .42 * a;
  const gr = g.createRadialGradient(cx, cy, 10, cx, cy, Math.max(wmax * .62, 260));
  gr.addColorStop(0, 'rgba(18,9,4,.9)'); gr.addColorStop(.6, 'rgba(18,9,4,.5)'); gr.addColorStop(1, 'rgba(18,9,4,0)');
  g.fillStyle = gr; g.translate(cx, cy); g.scale(1, Math.max(.45, (bottom - top) / (wmax * 1.1))); g.translate(-cx, -cy);
  g.beginPath(); g.arc(cx, cy, Math.max(wmax * .62, 260), 0, TAU); g.fill();
  g.restore();
}

function drawBlock(g, b, t) {
  const st = b.st, outP = clamp((t - b.out) / .08);
  const bp = beatPos(t);
  // the speech bubble behind quoted words
  if (b.bub) bubbleBehind(g, b, t, outP);
  b.words.forEach((w, wi) => {
    const land = w.s - LEAD, start = Math.min(land - .04, Math.max(land - POP, b.floor));
    const p = (t - start) / (land - start);
    if (p <= 0) return;
    const nextW = b.words[wi + 1];
    const current = t >= land && t < (nextW ? nextW.s - LEAD : (w.e ?? w.s) + .1);
    const since = t - land;
    let sc = p < 1 ? lerp(.5, 1, backOut(p, 1.35)) : 1, sy = 1, sx = 1;
    if (since >= 0 && since < .16) { const k = Math.sin(since / .16 * Math.PI); sy = 1 - .12 * k; sx = 1 + .05 * k; }
    const wob = Math.sin((bp + wi * .13) * Math.PI) * .016;
    const rise = (1 - clamp(p)) * w.size * .15;
    const exitY = outP * outP * 60, exitA = 1 - outP;
    const inBub = b.bub && b.bub.words.includes(w);
    const echo = (w.echo || []).reduce((m, e) => Math.max(m, t >= e - LEAD - .04 && t < e - LEAD + .45 ? 1 - (t - (e - LEAD)) / .45 : 0), 0);
    const fill = current ? '!' + GOLD : echo > .05 ? '!' + mixHex(CREAM, '#f08fa8', Math.min(1, echo * 1.6)) : CREAM;
    if (echo > 0) { sc *= 1 + echo * .06; }
    g.save();
    g.globalAlpha = exitA;
    const bx = w.x + w.ww / 2, by = wordY(b, w, t);
    g.translate(bx, by + exitY + rise);
    g.scale(sc * sx, sc * sy * (1 + wob));
    const chars = [...w.shown];
    if (inBub) word(g, w.shown, -w.ww / 2, 0, w.size, st.font, { fill: current ? '!#cf7a12' : INK, ow: current ? .1 : 0, shadow: null, seed: wi * 3.1 + b.i * 17 });   // a deeper gold reads on the cream
    else word(g, w.shown, -w.ww / 2, 0, w.size, st.font, {
      fill, seed: wi * 3.1 + b.i * 17,
      fillAt: i => isQuote(chars[i]) ? C('!' + ROSE) : C(fill),
    });
    if (typeof window !== 'undefined' && window.__typo) window.__typo.push({ w: w.w, s: w.s, line: b.i, x0: bx - w.ww / 2 * sc, x1: bx + w.ww / 2 * sc, y0: by + exitY + rise - w.size * .78 * sc, y1: by + exitY + rise + w.size * .22 * sc, size: w.size * sc, a: exitA, full: p >= 1 && outP === 0 });
    g.restore();
  });
}
// A rounded speech bubble around the quoted words, with its tail reaching toward the speaker. It grows
// with its words, each one stretching it as it springs up, so it's never an empty slab.
function bubbleBehind(g, b, t, outP) {
  const ws = b.bub.words, startOf = w => { const land = w.s - LEAD; return [Math.min(land - .04, Math.max(land - POP, b.floor)), land]; };
  let box = null;
  for (const w of ws) {
    const [st0, land] = startOf(w), p = clamp((t - st0) / (land - st0));
    if (p <= 0) continue;
    const wy = wordY(b, w, t), wb = [w.x, wy - w.size * .82, w.x + w.ww, wy + w.size * .26];
    if (!box) { box = wb; continue; }
    const e = easeOut(p);
    box = [Math.min(box[0], lerp(box[0], wb[0], e)), Math.min(box[1], lerp(box[1], wb[1], e)), Math.max(box[2], lerp(box[2], wb[2], e)), Math.max(box[3], lerp(box[3], wb[3], e))];
  }
  if (!box) return;
  const [s0, l0] = startOf(ws[0]), p = clamp((t - s0) / (l0 - s0));
  const [x0, y0, x1, y1] = box;
  const pad = 26, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  // it grows without overshooting: a wide line's bubble already reaches close to the frame's left edge
  const sc = lerp(.6, 1, easeOut(p)) * (1 - outP * .2);
  g.save(); g.globalAlpha = 1 - outP;
  g.translate(cx, cy); g.scale(sc, sc); g.translate(-cx, -cy);
  const [tx, ty] = b.bub.tail || [cx, y0 - 140];
  const bw = (x1 - x0) / 2 + pad, bh = (y1 - y0) / 2 + pad * .7;
  // under a row that isn't in the bubble, the tail leaves from the bubble's end, clear of that row
  const below = ws[0].row > 0;
  const base = below ? [x1 + pad * .1, cy - bh * .25] : null;
  const ang = below ? Math.atan2(ty - base[1], tx - base[0]) : Math.atan2(ty - cy, tx - cx);
  const root = base || [cx + Math.cos(ang) * bw * .55, cy + Math.sin(ang) * bh * .7];
  const tipLen = Math.min(150, Math.hypot(tx - root[0], ty - root[1]) * .5);
  const tip = [root[0] + Math.cos(ang) * tipLen, root[1] + Math.sin(ang) * tipLen];
  const nx = -Math.sin(ang) * 26, ny = Math.cos(ang) * 26;
  const body = spline([[x0 - pad, cy], [x0 - pad * .6, y0 - pad * .5], [cx, y0 - pad * .8], [x1 + pad * .6, y0 - pad * .5], [x1 + pad, cy], [x1 + pad * .6, y1 + pad * .5], [cx, y1 + pad * .8], [x0 - pad * .6, y1 + pad * .5]], true, 6);
  shape(g, [[root[0] + nx, root[1] + ny], tip, [root[0] - nx, root[1] - ny]], { fill: '#fffaf0', w: 7, seed: 811, form: false });
  shape(g, body, { fill: '#fffaf0', shade: '#d8ccb6', form: 'block', k: .6, w: 8, seed: 812 });
  // cover the tail's root so the bubble and tail read as one shape
  g.fillStyle = C('#fffaf0'); g.beginPath(); g.ellipse(root[0], root[1], 30, 22, ang, 0, TAU); g.fill();
  g.restore();
}

// The ball: hops from landing to landing; waits on a held word with little bounces on the beat.
const landY = (L, t) => wordY(L.b, L.w, t) - L.size * .74 - clamp(L.size * .22, 15, 23) - 8;   // a hair above the letters, so it never sits on them
function drawBall(g, t) {
  if (!LAND.length) return;
  for (const L of LAND) L.y = landY(L, t);
  let i = -1;
  for (let k = 0; k < LAND.length; k++) { if (LAND[k].t <= t) i = k; else break; }
  const R = L => clamp(L.size * .22, 15, 23);
  let x, y, r, sq = 0, alpha = 1;
  const cur = LAND[i], nxt = LAND[i + 1];
  const enter = (L, u) => [lerp(L.x - 340, L.x, easeOut(u, 2)), L.y - Math.sin(u * Math.PI) * Math.min(40, L.y - BALL_CEIL - R(L))];
  if (!cur) {
    if (!nxt || nxt.t - t > .5) return;
    const u = 1 - (nxt.t - t) / .5; [x, y] = enter(nxt, u); r = R(nxt); alpha = clamp(u * 3);
  } else if (!nxt || (nxt.b !== cur.b && (nxt.t - cur.t > 2.4 || cur.b.out < nxt.t - .5))) {
    // the block leaves well before the next one lands: rest on the last word, then bounce away off
    // the right of the block, so the ball never waits alone where a line used to be
    const rest = cur.b.out - .05;
    if (t < rest) { x = cur.x; y = cur.y - restBounce(t, cur); r = R(cur); sq = landSquash(t - cur.t); }
    else { const u = clamp((t - rest) / .45); x = cur.x + u * 260; y = cur.y - Math.sin(u * Math.PI) * Math.min(30, cur.y - BALL_CEIL - R(cur)) + u * u * 120; r = R(cur); alpha = 1 - clamp((u - .5) / .5); if (u >= 1) return; }
    if (nxt && nxt.t - t < .5) { const u = 1 - (nxt.t - t) / .5; [x, y] = enter(nxt, u); r = R(nxt); alpha = clamp(u * 3); }
  } else {
    const dt = nxt.t - cur.t;
    // between blocks the ball waits on the last word until its block goes, then makes the carriage
    // return over the empty band: it never crosses a line still on screen, nor waits where one was
    const hopT = nxt.b !== cur.b ? Math.max(.1, Math.min(dt, nxt.t - (cur.b.out - .02))) : Math.min(dt, .44), start = nxt.t - hopT;
    r = lerp(R(cur), R(nxt), clamp((t - start) / hopT));
    if (t < start) { x = cur.x; y = cur.y - restBounce(t, cur); sq = landSquash(t - cur.t); }
    else {
      const u = (t - start) / hopT;
      const dist = Math.hypot(nxt.x - cur.x, nxt.y - cur.y);
      const low = nxt.w.row > 0 && cur.w.row === nxt.w.row;
      const room = Math.min(cur.y, nxt.y) - BALL_CEIL - r;
      const h = Math.max(4, Math.min(room, low ? clamp(dist * .16 + hopT * 50, 16, 40) : clamp(dist * .3 + hopT * 100, 30, 170)));
      x = lerp(cur.x, nxt.x, u); y = lerp(cur.y, nxt.y, u) - 4 * h * u * (1 - u);
      sq = -.12 * Math.sin(u * Math.PI);
    }
  }
  g.save(); g.globalAlpha *= alpha;
  g.translate(x, y + r);
  const sxy = sq > 0 ? [1 + sq * .8, 1 - sq] : [1 + sq * .5, 1 - sq];
  g.scale(sxy[0], sxy[1]);
  shape(g, ellipse(0, -r, r, r, 0, 30), { fill: '!' + RED, shade: '!' + RED_SH, lit: '!#ff9a80', form: 'round', w: Math.max(3, r * .26), seed: 777, amt: .2, gloss: { x: .3, y: .24, w: .13, h: .11, a: .95, dot: false } });
  g.restore();
}
function landSquash(since) { return since >= 0 && since < .12 ? .3 * Math.sin((since / .12) * Math.PI) : 0; }
function restBounce(t, L) {
  const held = t - L.t;
  if (held < .3) return 0;
  const f = ((beatPos(t) % 1) + 1) % 1;
  return Math.sin(f * Math.PI) * Math.min(18, Math.max(0, L.y - BALL_CEIL - 20)) * clamp((held - .3) / .3);
}
