// The sung words and the bouncing ball. After the sing-along cartoons of the 1920s and '30s, a ball
// hops along the lyric and lands on each word as it's sung; here each landing stamps its word into
// being. A couplet is one block that builds word by word and holds until it's sung, whatever the
// pictures do underneath. The ball carries on from block to block.
import { W, clamp, lerp, easeOut, backOut, smooth, bell, REC, beatPos, sinceBeat, noise, now, hash, TAU } from './kit.js';
import { INK, CREAM, CORAL, GOLD, RED, RED_SH, WHITE, ROSE, C } from './palette.js';
import { word, textW, DISPLAY, PATTER, SCRIPT } from './type.js';
import { shape, ellipse } from './ink.js';

export const LEAD = .085;      // words finish arriving this long before the voice (episode 2's measured choice)
const POP = .11;               // how long a word takes to spring up

// How each part of the song is lettered. y is the top of the block; the block is centred on x.
const STYLE = {
  Intro: { font: DISPLAY, size: 104, y: 150, maxRows: 5 },
  'Verse 1': { font: PATTER, size: 92, y: 150 },
  Chorus: { font: DISPLAY, size: 110, y: 160, maxRows: 3 },
  'Verse 2': { font: PATTER, size: 92, y: 150 },
  Bridge: { font: PATTER, size: 86, y: 150 },
  Breakdown: { font: DISPLAY, size: 84, y: 150 },
  Outro: { font: DISPLAY, size: 90, y: 150, maxRows: 5 },
};
// Per-block changes, keyed by the block's first words: set by the scenes (a block lettered lower,
// or in the crew's colour for an aside).
export const BLOCK_STYLE = {};
export const LINE_STYLE = {};
export const STYLE_SOLO = {};

let BLOCKS = null, LAND = null;
const measureCtx = () => { const c = document.createElement('canvas'); return c.getContext('2d'); };

function sectionKey(sec) { for (const k of Object.keys(STYLE)) if (sec.startsWith(k)) return k; return 'Verse 1'; }

// Build the blocks (couplets) and lay each out once.
export function build() {
  if (BLOCKS) return BLOCKS;
  const g = measureCtx();
  const lines = REC.lines;
  const groups = [];
  lines.forEach((l, i) => {
    const key = `${l.section}|${l.couplet}`;
    const last = groups[groups.length - 1];
    // a refrain's lines are big, so each is a block of its own; elsewhere a couplet is one block
    const solo = l.section.startsWith('Chorus') || (STYLE_SOLO[l.text.slice(0, 18)]);
    if (last && last.key === key && last.lines.length < 2 && !solo && !last.solo) last.lines.push(l); else groups.push({ key, lines: [l], solo });
  });
  BLOCKS = groups.map((b, bi) => {
    const st = { ...STYLE[sectionKey(b.lines[0].section)], ...(BLOCK_STYLE[b.lines[0].text.slice(0, 18)] || {}) };
    const maxW = st.maxW || 930;
    // rows: each sung line starts a row; long lines wrap
    let size = st.size;
    let rows;
    for (let tries = 0; tries < 12; tries++) {
      rows = [];
      for (const l of b.lines) {
        const ls = LINE_STYLE[l.text.slice(0, 18)] || {};
        const space = textW(g, ' ', st.font, size) * (st.font === DISPLAY ? 1.45 : 1.05);
        const ws = l.words.map(w => ({ ...w, ww: textW(g, w.w, st.font, size), x: 0 }));
        // the fewest rows that fit, then the split into that many rows whose longest row is shortest
        const widthOf = (a, b) => ws.slice(a, b).reduce((acc, w) => acc + w.ww, 0) + space * (b - a - 1);
        let k = 1;
        for (;;) { let r = 1, cur = 0; for (const w of ws) { const add = cur ? space + w.ww : w.ww; if (cur && cur + add > maxW) { r++; cur = w.ww; } else cur += add; } k = r; break; }
        const n = ws.length, best = {};
        const solve = (i, rleft) => {
          const key = i + '|' + rleft; if (key in best) return best[key];
          if (rleft === 1) return best[key] = { cost: widthOf(i, n) > maxW ? 1e8 : widthOf(i, n), cuts: [] };
          let res = { cost: 1e9, cuts: [] };
          for (let j = i + 1; j <= n - rleft + 1; j++) { const sub = solve(j, rleft - 1); const pen = /[,;:.!?\u2014-]$/.test(ws[j - 1].w) ? 0 : size * 4; const c = Math.max(widthOf(i, j) + pen, sub.cost); if (c < res.cost && widthOf(i, j) <= maxW) res = { cost: c, cuts: [j, ...sub.cuts] }; }
          return best[key] = res;
        };
        const cuts = [0, ...solve(0, Math.min(k, n)).cuts, n];
        for (let c = 0; c < cuts.length - 1; c++) rows.push({ words: ws.slice(cuts[c], cuts[c + 1]), w: widthOf(cuts[c], cuts[c + 1]), ls });
      }
      if (rows.length <= (st.maxRows || 4) && rows.every(r => r.w <= maxW)) break;
      size *= .93;
    }
    const lh = size * (st.font === DISPLAY ? 1.22 : 1.13);
    const cx = st.x ?? W / 2;
    rows.forEach((r, ri) => {
      const space = textW(g, ' ', st.font, size) * (st.font === DISPLAY ? 1.45 : 1.05);
      let x = cx - r.w / 2;
      r.y = st.y + size + ri * lh;
      for (const w of r.words) { w.x = x; w.y = r.y; w.size = size; x += w.ww + space; }
    });
    const words = rows.flatMap(r => r.words.map(w => ({ ...w, ls: r.ls })));
    const first = words[0].s, lastE = Math.max(...words.map(w => w.e ?? w.s));
    return { i: bi, lines: b.lines, rows, words, st, size, first, lastE, top: st.y, bottom: st.y + size * .3 + rows.length * lh };
  });
  BLOCKS.forEach((b, i) => {
    const next = BLOCKS[i + 1];
    const nextIn = next ? next.first - LEAD - POP - .11 : 1e9;
    // hold until the next block is about to arrive (but no more than 1.5 s after the voice stops), and
    // never take the last word away within a quarter second of its being sung
    const lastS = b.words[b.words.length - 1].s;
    b.out = Math.max(lastS + .25, Math.min(nextIn, b.lastE + 1.5));
    b.in = b.first - LEAD - POP - .5;
  });
  // the ball's landings, in order, across the whole song
  LAND = [];
  for (const b of BLOCKS) for (const w of b.words) LAND.push({ t: w.s - LEAD, x: w.x + w.ww / 2, y: w.y - w.size * .92, size: w.size, b });
  return BLOCKS;
}
export const blocks = () => build();
export function blockAt(t) { for (const b of build()) if (t >= b.in && t < b.out + .2) return b; return null; }

// Draw the lyric at t (all blocks on screen, then the ball).
export function drawLyrics(g, t, o = {}) {
  build();
  let shown = null;
  for (const b of BLOCKS) if (t >= b.in && t < b.out + .1) { drawBlock(g, b, t, o); if (t < b.out) shown = b; }
  if (shown) drawEchoes(g, t, shown);
  if (o.ball !== false) drawBall(g, t, o);
}

// The backing voices' echoes ("What did you try?" under the held "try?"): small script lettering in
// the crew's rose, under the block, each word arriving as it's sung.
function drawEchoes(g, t, b) {
  for (const l of REC.echo || []) {
    if (t < l.words[0].s - LEAD - .1 || t > l.end + .5) continue;
    const size = 58, font = SCRIPT, sp = textW(g, ' ', font, size) * 1.1;
    const total = l.words.reduce((a, w) => a + textW(g, w.w, font, size), 0) + sp * (l.words.length - 1);
    let x = W / 2 - total / 2 + 60;
    const y = b.bottom + size * .9;
    const fade = 1 - clamp((t - l.end - .2) / .3);
    for (const w of l.words) {
      const ww = textW(g, w.w, font, size);
      const p = (t - (w.s - LEAD - POP)) / POP;
      if (p > 0) {
        const sc = p < 1 ? backOut(p, 2.4) : 1;
        g.save(); g.globalAlpha = fade; g.translate(x + ww / 2, y); g.rotate(-.04); g.scale(sc, sc);
        word(g, w.w, -ww / 2, 0, size, font, { fill: '#f7c6d0', seed: 300 + x });
        g.restore();
      }
      x += ww + sp;
    }
  }
}

function drawBlock(g, b, t, o) {
  const st = b.st;
  const outP = clamp((t - b.out) / .09);
  const bp = beatPos(t);
  b.words.forEach((w, wi) => {
    const land = w.s - LEAD;
    const p = (t - (land - POP)) / POP;
    if (p <= 0) return;
    const nextW = b.words[wi + 1];
    const current = t >= land && t < (nextW ? nextW.s - LEAD : (w.e ?? w.s) + .1);
    const since = t - land;
    // spring up, overshoot, settle; a squash where the ball lands
    let sc = p < 1 ? backOut(p, 2.4) : 1;
    let sy = 1, sx = 1;
    if (since >= 0 && since < .16) { const k = Math.sin(since / .16 * Math.PI); sy = 1 - .16 * k; sx = 1 + .09 * k; }
    // the rubber bounce on the beat, word by word like a chorus line
    const wob = Math.sin((bp + wi * .12) * Math.PI) * .018;
    const exitY = -outP * 30, exitA = 1 - outP;
    const ls = w.ls || {};
    const fill = current ? '!' + (ls.accent || st.accent || GOLD) : (ls.fill || st.fill || CREAM);
    g.save();
    g.globalAlpha = exitA;
    const bx = w.x + w.ww / 2, by = w.y;
    g.translate(bx, by + exitY);
    g.rotate(ls.rot || 0);
    g.scale(sc * sx * (1 + (current ? .05 : 0)) * (1 - outP * .3), sc * sy * (1 + wob) * (1 - outP * .3));
    word(g, w.w, -w.ww / 2, 0, w.size, ls.font || st.font, { fill, ink: ls.ink || st.ink, shadow: ls.shadow || st.shadow, seed: wi * 3.1 + b.i * 17 });
    if (typeof window !== 'undefined' && window.__typo) window.__typo.push({ w: w.w, s: w.s, line: b.lines.indexOf(b.lines.find(l => l.words.some(x => x.s === w.s))) + '|' + b.i, x0: bx - w.ww / 2 * sc, x1: bx + w.ww / 2 * sc, y0: by + exitY - w.size * .8 * sc, y1: by + exitY + w.size * .25 * sc, size: w.size * sc, a: exitA, full: p >= 1 && outP === 0 });
    g.restore();
  });
}

// The ball: hops from landing to landing; waits on a held word with little bounces on the beat.
function drawBall(g, t, o) {
  if (!LAND.length) return;
  let i = -1;
  for (let k = 0; k < LAND.length; k++) { if (LAND[k].t <= t) i = k; else break; }
  const R = L => clamp(L.size * .25, 16, 25);
  let x, y, r, sq = 0, alpha = 1;
  const cur = LAND[i], nxt = LAND[i + 1];
  const enter = (L, u) => { // arriving from the upper left, off the block
    const u2 = easeOut(u, 2);
    return [lerp(L.x - 260, L.x, u2), lerp(L.y - 420, L.y, u) - Math.sin(u * Math.PI) * 60];
  };
  if (!cur) {
    if (!nxt || nxt.t - t > .55) return;
    const u = 1 - (nxt.t - t) / .55; [x, y] = enter(nxt, u); r = R(nxt); alpha = clamp(u * 3);
  } else if (!nxt || nxt.b !== cur.b && nxt.t - cur.t > 2.2) {
    // end of a phrase with a long gap: rest on the last word, then drop off below the block
    const rest = cur.b.out - .05;
    if (t < rest) { x = cur.x; y = cur.y - restBounce(t, cur); r = R(cur); sq = landSquash(t - cur.t); }
    else { const u = clamp((t - rest) / .45); x = cur.x + u * 160; y = cur.y - Math.sin(u * Math.PI) * 90 + u * u * 520; r = R(cur); alpha = 1 - clamp((u - .6) / .4); if (u >= 1) return; }
    if (nxt && nxt.t - t < .55) { const u = 1 - (nxt.t - t) / .55; [x, y] = enter(nxt, u); r = R(nxt); alpha = clamp(u * 3); }
  } else {
    const dt = nxt.t - cur.t, hopT = Math.min(dt, .42), start = nxt.t - hopT;
    r = lerp(R(cur), R(nxt), clamp((t - start) / hopT));
    if (t < start) { x = cur.x; y = cur.y - restBounce(t, cur); sq = landSquash(t - cur.t); }
    else {
      const u = (t - start) / hopT;
      const dist = Math.hypot(nxt.x - cur.x, nxt.y - cur.y);
      const h = clamp(dist * .32 + hopT * 110, 34, 230) + (nxt.y > cur.y + 10 ? 50 : 0);
      x = lerp(cur.x, nxt.x, u); y = lerp(cur.y, nxt.y, u) - 4 * h * u * (1 - u);
      sq = -.12 * Math.sin(u * Math.PI);   // stretched in flight
    }
  }
  g.save(); g.globalAlpha *= alpha;
  g.translate(x, y + r);
  const sxy = sq > 0 ? [1 + sq * .8, 1 - sq] : [1 + sq * .5, 1 - sq];
  g.scale(sxy[0], sxy[1]);
  shape(g, ellipse(0, -r, r, r, 0, 28), { fill: '!' + (o.ballCol || RED), shade: '!' + RED_SH, shadeOff: [-r * .3, -r * .3], w: Math.max(3, r * .28), seed: 777, amt: .3, gloss: { x: .32, y: .26, w: .13, h: .11, a: .95 } });
  g.restore();
}
function landSquash(since) { return since >= 0 && since < .12 ? .32 * Math.sin((since / .12) * Math.PI) : 0; }
// On a long held word the ball keeps time: small hops on each beat.
function restBounce(t, L) {
  const held = t - L.t;
  if (held < .3) return 0;
  const f = (beatPos(t) % 1);
  return Math.sin(f * Math.PI) * 16 * clamp((held - .3) / .3);
}
