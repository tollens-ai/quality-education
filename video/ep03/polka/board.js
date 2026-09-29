// The sing-along board: a chorus line lettered on a cardboard sign, with a tennis ball hopping from
// word to word on the beat, and Bruce running along under it after the ball, as in the sing-along
// cartoons. The ball's whole path is worked out once from the beat map and the words' times, so it
// lands on a word at every beat and is fixed for a given take.
import { W, H, clamp, lerp, inv, hash, TAU, easeOut, backOut, REC, lastIndex } from './kit.js';
import { layoutLine, sing, beatsIn } from './lyrics.js';
import { blob, line, dot, hatch } from './pencil.js';
import { write } from './hand.js';
import { rrect, ellipse } from './shapes.js';
import { dachshund } from './chars.js';
import { GRAPHITE, C } from './palette.js';

// The box the words sit in, on the page.
export const BOARD = { x: 60, y: 140, w: 960, h: 470 };
export const WORDS = { x: W / 2, y: 270, maxW: 900, size: 90, minSize: 70, tail: 0, rows: 3, gap: 1.55 };

// The y that centres a line's block of rows in the board (`extra`: options for this line's layout, such as a big tail).
export function wordsY(ws, extra = {}) {
  const L = layoutLine(ws, { ...WORDS, ...extra, y: 0 });
  // Centre from the top of the first row's capitals to the last row's baseline.
  const top = Math.min(...L.items.map(it => it.y - it.size)), bot = Math.max(...L.items.map(it => it.y));
  return BOARD.y + (BOARD.h - 60) / 2 - (top + bot) / 2;
}

// A path for the ball across several lines: [{t, x, y, word}] one landing per beat while a line is
// being sung, starting on the last beat before its first word. `perLine(i)` gives a line's own layout options.
export function ballPath(lineWords, opt = {}, perLine = null) {
  const targets = [];
  for (let li = 0; li < lineWords.length; li++) {
    const ws = lineWords[li], ex = perLine ? perLine(li) : {};
    const L = layoutLine(ws, { ...WORDS, ...ex, y: wordsY(ws, ex), ...opt });
    const first = ws[0].s, last = ws[ws.length - 1].e;
    const bts = beatsIn(first - .30, last + .05);
    let prev = 0;
    for (const b of bts) {
      // The word this beat belongs to: the one sounding, or the next to start within a beat.
      let idx = ws.findIndex(w => b.t >= w.s - .12 && b.t <= w.e + .04);
      if (idx < 0) idx = ws.findIndex(w => w.s > b.t);
      if (idx < 0) idx = ws.length - 1;
      idx = Math.max(idx, prev);
      prev = idx;
      const it = L.items[idx];
      const w = ws[idx];
      const f = clamp((b.t - w.s) / Math.max(.18, w.e - w.s));
      targets.push({ t: b.t, x: it.x + it.w * clamp(f * .9 + .05), y: it.y - it.size * 1.02 - 26, word: idx, li: w.li, down: b.down });
    }
  }
  targets.sort((a, b) => a.t - b.t);
  return targets;
}

// Where the ball is at t: a parabola between landings, squashed as it lands.
export function ballAt(path, t) {
  const i = lastIndex(path.map(p => p.t), t);
  if (i < 0) return null;
  const a = path[i], b = path[i + 1];
  if (!b || b.t - a.t > 1.6) {
    // Nothing follows soon: rest on the last word, then drop out of sight upwards.
    const rest = clamp((t - a.t) / .5);
    return { x: a.x, y: a.y - Math.sin(rest * Math.PI) * 60 - easeOut(clamp((t - a.t - .35) / .5)) * 400, sq: Math.max(0, 1 - (t - a.t) / .1) * .3, ground: a.y + 8, gone: t - a.t > .9 };
  }
  const u = (t - a.t) / (b.t - a.t);
  const dx = Math.abs(b.x - a.x) + Math.abs(b.y - a.y) * .5;
  const h = 40 + Math.min(150, dx * .26);
  const x = lerp(a.x, b.x, u), y = Math.max(46, lerp(a.y, b.y, u) - 4 * h * u * (1 - u));
  const land = u < .09 ? 1 - u / .09 : 0;
  const pre = u > .93 ? (u - .93) / .07 : 0;
  return { x, y, sq: land * .3, stretch: pre * .12, ground: lerp(a.y, b.y, u) + 6, u };
}

export function drawBall(g, t, x, y, r, o = {}) {
  const { sq = 0, stretch = 0, spin = 0 } = o;
  g.save();
  g.translate(x, y);
  g.scale(1 + sq * .6 - stretch * .3, 1 - sq + stretch);
  g.rotate(spin);
  blob(g, ellipse(0, 0, r, r, 12), { fill: '#e2e04a', shade: '#9aa22a', line: GRAPHITE, lw: 5, seed: 700, t, gap: 5.5, hw: 4.6, tone: .5, sh: .3 });
  line(g, [[-r * .82, -r * .3], [-r * .35, -r * .05], [-r * .3, r * .5], [-r * .5, r * .78]], { w: 4, col: '#fbf8ef', seed: 701, t, spline: true, passes: 1, alpha: .95 });
  line(g, [[r * .82, r * .2], [r * .4, -r * .05], [r * .32, -r * .5], [r * .52, -r * .78]], { w: 4, col: '#fbf8ef', seed: 702, t, spline: true, passes: 1, alpha: .95 });
  g.restore();
}

// The sign itself: card with a thick pencil border and two strips of tape.
export function signBoard(g, t, o = {}) {
  const { fill = '#fff6d8', edge = GRAPHITE, label = true } = o;
  const b = BOARD;
  blob(g, rrect(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, 30, 3), { fill, line: edge, lw: 7, seed: 640, t, hw: 4.6, tone: .8, dens: .3, angle: -.7 });
  [[b.x + 60, b.y + 6, -.3], [b.x + b.w - 60, b.y + 6, .3]].forEach(([x, y, r], i) => {
    g.save(); g.translate(x, y); g.rotate(r);
    blob(g, rrect(0, 0, 130, 34, 5, 2), { fill: '#f2d377', line: null, seed: 650 + i, t, hw: 4.4, tone: .85, dens: .5 });
    g.restore();
  });
  if (label) write(g, 'SING ALONG!', b.x + 26, b.y + b.h - 20, 34, { col: '#c93a2e', seed: 660, t, track: 7 });
}
