// The crew's kit: Guess's notebook, Press's abacus, the CLUE! rosette, the lightbulb over a changed
// mind, and a trail of clues (paste drips, footprints) to follow.
import { TAU, clamp, lerp, now, hash, noise, easeOut } from './kit.js';
import { INK, WHITE, CREAM, CORAL, TEAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED, WOOD, WOOD_SH, BROWN, GREY, C } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint } from './ink.js';
import { label, textW, DISPLAY, PATTER, SCRIPT, fitSize } from './type.js';

// An open notebook at (x, y), s = 1 is 760 wide. rows: [[heading, text, t_appear]], written on by time.
export function notebook(g, x, y, s, rows, t, o = {}) {
  const w = 760 * s, h = (o.h ?? 560) * s;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.02);
  shape(g, rrect(-w / 2 - 14 * s, -h / 2 - 14 * s, w + 28 * s, h + 28 * s, 16 * s), { fill: o.cover || PLUM, w: 8 * s, seed: 6001 });
  shape(g, rrect(-w / 2, -h / 2, w, h, 8 * s), { fill: '#fbf5e4', w: 6 * s, seed: 6002 });
  // ruled lines and a margin
  g.strokeStyle = C('#9cc3d6'); g.lineWidth = 2 * s;
  for (let yy = -h / 2 + 90 * s; yy < h / 2 - 10 * s; yy += 56 * s) { g.beginPath(); g.moveTo(-w / 2 + 10 * s, yy); g.lineTo(w / 2 - 10 * s, yy); g.stroke(); }
  g.strokeStyle = C('#e08a8a'); g.beginPath(); g.moveTo(-w / 2 + 110 * s, -h / 2); g.lineTo(-w / 2 + 110 * s, h / 2); g.stroke();
  // spiral
  for (let i = 0; i < 10; i++) { g.strokeStyle = C(GREY); g.lineWidth = 6 * s; g.beginPath(); g.ellipse(-w / 2 + 40 * s + i * (w - 80 * s) / 9, -h / 2 - 4 * s, 12 * s, 22 * s, 0, 0, TAU); g.stroke(); }
  if (o.title) label(g, o.title, 0, -h / 2 + 50 * s, 44 * s, { font: PATTER, col: PLUM });
  let yy = -h / 2 + (o.title ? 128 : 80) * s;
  for (const [head, text, ta, col] of rows) {
    const p = clamp((t - ta) / .35);
    if (p <= 0) { yy += (o.gap ?? 112) * s; continue; }
    label(g, head, -w / 2 + 30 * s, yy, 38 * s, { font: PATTER, col: col || CORAL, align: 'left' });
    // handwriting written on left to right
    const full = text, size = fitSize(g, full, SCRIPT, 46 * s, w - 170 * s);
    g.save(); g.beginPath(); g.rect(-w / 2 + 120 * s, yy - 60 * s, (w - 130 * s) * p, 140 * s); g.clip();
    label(g, full, -w / 2 + 128 * s, yy + 44 * s, size, { font: SCRIPT, col: INK, align: 'left' });
    g.restore();
    yy += (o.gap ?? 112) * s;
  }
  g.restore();
}

// Press's abacus: rows of beads, `counted` beads slid across on the top wire.
export function abacus(g, x, y, s, counted, o = {}) {
  const w = 300 * s, h = 200 * s;
  shape(g, rrect(x - w / 2, y - h / 2, w, h, 12 * s), { fill: null, w: 14 * s, seed: 6101, line: WOOD });
  line(g, rrect(x - w / 2, y - h / 2, w, h, 12 * s), { w: 5 * s, closed: true, seed: 6102 });
  for (let r = 0; r < 3; r++) {
    const yy = y - h / 2 + (r + 1) * h / 4;
    stroke(g, [[x - w / 2 + 8 * s, yy], [x + w / 2 - 8 * s, yy]], { w: 3 * s, seed: 6103 + r, taper: false, color: GREY });
    for (let i = 0; i < 6; i++) {
      const moved = r === 0 && i < counted;
      const bx = moved ? x - w / 2 + 30 * s + i * 32 * s : x + w / 2 - 30 * s - (5 - i) * 28 * s;
      shape(g, ellipse(bx, yy, 14 * s, 16 * s), { fill: r === 0 ? (i < 2 ? CORAL : TEAL) : OCHRE, w: 3.5 * s, seed: 6110 + r * 6 + i, amt: .2 });
    }
  }
}

// A prize rosette reading `text`, pinned at (x, y).
export function rosette(g, x, y, s, text = 'CLUE!', col = GOLD) {
  for (const d of [-1, 1]) shape(g, [[x + d * 12 * s, y + 30 * s], [x + d * 44 * s, y + 130 * s], [x + d * 24 * s, y + 118 * s], [x + d * 10 * s, y + 138 * s], [x - d * 8 * s, y + 36 * s]], { fill: d < 0 ? RED : TEAL, w: 5 * s, seed: 6201 + d });
  const P = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU; const r = (i % 2 ? 70 : 80) * s; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  shape(g, P, { fill: col, w: 6 * s, seed: 6203, amt: .4 });
  shape(g, ellipse(x, y, 52 * s, 52 * s), { fill: CREAM, w: 5 * s, seed: 6204 });
  label(g, text, x, y + 3 * s, fitSize(g, text, PATTER, 36 * s, 92 * s), { font: PATTER, col: INK });
}

// A lightbulb switching on over a head (on: 0..1).
export function bulb(g, x, y, s, on, t = now()) {
  if (on > .01) {
    g.save(); g.globalAlpha = on * .5; g.fillStyle = C('#fff1b0'); g.beginPath(); g.arc(x, y, 150 * s * (1 + .05 * Math.sin(t * 10)), 0, TAU); g.fill(); g.restore();
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .38; stroke(g, [[x + Math.cos(a) * 95 * s, y + Math.sin(a) * 95 * s], [x + Math.cos(a) * (125 + on * 20) * s, y + Math.sin(a) * (125 + on * 20) * s]], { w: 7 * s, seed: 6301 + i, color: on > .5 ? GOLD : INK }); }
  }
  const P = spline([[x - 30 * s, y + 40 * s], [x - 62 * s, y - 10 * s], [x - 50 * s, y - 62 * s], [x, y - 80 * s], [x + 50 * s, y - 62 * s], [x + 62 * s, y - 10 * s], [x + 30 * s, y + 40 * s]], true, 6);
  shape(g, P, { fill: on > .5 ? '#fff3b8' : '#e8ecea', w: 6 * s, seed: 6310, gloss: { x: .3, y: .25, w: .1, h: .1 } });
  shape(g, rrect(x - 30 * s, y + 38 * s, 60 * s, 44 * s, 8 * s), { fill: GREY, w: 5 * s, seed: 6311 });
  for (let i = 0; i < 2; i++) stroke(g, [[x - 28 * s, y + 52 * s + i * 14 * s], [x + 28 * s, y + 52 * s + i * 14 * s]], { w: 3 * s, seed: 6312 + i, taper: false });
  stroke(g, [[x - 14 * s, y + 20 * s], [x - 8 * s, y - 20 * s], [x, y], [x + 8 * s, y - 20 * s], [x + 14 * s, y + 20 * s]], { w: 3.5 * s, seed: 6315, color: on > .5 ? OCHRE : GREY });
}

// A trail of paste drips (or footprints) from a to b, revealed up to u (0..1).
export function trail(g, a, b, u, o = {}) {
  const n = o.n ?? 9;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1); if (k > u) break;
    const x = lerp(a[0], b[0], k) + Math.sin(k * 9) * 24, y = lerp(a[1], b[1], k) + (o.arc ? -Math.sin(k * Math.PI) * o.arc : 0);
    if (o.feet) { shape(g, ellipse(x + (i % 2 ? 10 : -10), y, 14, 22, .3), { fill: o.col || INK, w: 3, seed: 6400 + i, amt: .3 }); }
    else shape(g, ellipse(x, y, 20 - k * 4, 12 - k * 2, 0), { fill: o.col || '#f4f7e6', w: 3.5, seed: 6400 + i, amt: .3 });
  }
}
