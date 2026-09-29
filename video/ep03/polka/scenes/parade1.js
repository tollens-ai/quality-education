// Break 2, "the parade", first half (lines 37-40: upgradability ... portability), 151.4-158.3 s.
// The ring is a runway in the show tent. Two dogs a line, one gag a word: the first word's on the left half
// of the stage, the second's on the right. Each line change the cast walks off to the right and the next
// pair walks on from the left, one after another like a conveyor (the leader starts first, so nobody meets
// anybody); a unit arrives with the gag set up and lands it on its word.
import { W, H, clamp, inv, lerp, smooth, hash, words, beatPos, beatPulse } from '../kit.js';
import { shot } from '../shots.js';
import { line } from '../pencil.js';
import { pigeon } from '../world.js';
import { sing } from '../lyrics.js';
import { groove } from '../common.js';
import { GRAPHITE, C } from '../palette.js';
import { tentBack, valance, lamp, beam, runway, floor, crowd, shadow, sideDog, STAGE_Y, GAGS } from '../props-parade1.js';

const MARK = [280, 800];          // where the two gags stand
const D = .30;                    // how long a unit takes to cross to the next mark (one screen)
const STAG = .03;                 // each unit starts this long after the one ahead of it
const E = smooth;

// Each line: the words it starts with, its two gags, and the colours of its two words.
const LINES = [
  { start: 'Upgradability', gags: ['upgrade', 'replace'], hi: C.blue, tail: { fill: '#f6a04d', edge: '#8a4a12' }, tailCol: C.orange },
  { start: 'explainability', gags: ['explain', 'trace'], hi: '#2f8a4a', tail: { fill: '#f79ac0', edge: '#a3306a' }, tailCol: C.pink },
  { start: 'observability', gags: ['observe', 'undo'], hi: C.purple, tail: { fill: '#5fd0c4', edge: '#0f6b63' }, tailCol: C.teal },
  { start: 'installability', gags: ['install', 'port'], hi: '#c93a2e', tail: { fill: '#f7d774', edge: '#8a5f12' }, tailCol: '#c98d14' },
];

// A placeholder gag: a plain pup (while the real ones are built).
function placeholder(g, t, k) {
  sideDog(g, 'pup', { x: 0, y: 0, s: .95, t, seed: 3, walk: Math.abs(k.vel) > 300 ? (k.dist / 240) % 1 : 0, bob: k.gr.bob, squash: k.gr.sq, lean: k.gr.lean, eyes: 'happy', mouth: .3 });
}

export function register(S) {
  const lines = LINES.map(l => ({ ...l, ws: words('Break 2', l.start) }));
  const units = [];
  lines.forEach((ln, i) => {
    const L1 = ln.ws[0].v, L2 = ln.ws[ln.ws.length - 1].v;
    const nx = lines[i + 1], Ln = nx ? nx.ws[0].v : 0;
    // The leader goes first: old right, old left, new right, new left, each 40 ms after the one ahead.
    const exA = nx ? [Ln - .02 - D - STAG * 2, Ln - .02 - STAG * 2] : [157.95, 158.25], exB = nx ? [Ln - .02 - D - STAG * 3, Ln - .02 - STAG * 3] : [157.92, 158.22];
    units.push({ line: i, slot: 0, key: ln.gags[0], col: ln.hi, mark: MARK[0], L: L1, enter: [L1 - .02 - D, L1 - .02], exit: exA });
    units.push({ line: i, slot: 1, key: ln.gags[1], col: ln.tailCol, mark: MARK[1], L: L2, enter: [L1 - .02 - D - STAG, L1 - .02 - STAG], exit: exB });
  });
  // Where each shot begins: when the next line's first word starts to be written on, so its lettering never
  // begins inside the old line's.
  const dur = w => clamp(.07 + .026 * w.str.length, .12, .34);
  const cuts = [151.4, ...lines.slice(1).map(l => l.ws[0].v - dur(l.ws[0])), 158.3];
  lines.forEach((ln, i) => shot(cuts[i], cuts[i + 1], (g, t) => frame(g, t, i, lines, units), { id: `parade1-${i + 1}` }));
}

// Where a unit is: off the left, sliding in to its mark (settling with a small overshoot), standing, then sliding out to the right.
function unitX(u, t) {
  const [e0, e1] = u.enter, [x0, x1] = u.exit;
  if (t <= e0) return u.mark - W;
  if (t < e1) return u.mark - W * (1 - E((t - e0) / (e1 - e0)));
  if (t < x0) { const d = t - e1; return u.mark + 12 * Math.exp(-d * 11) * Math.sin(d * 24); }
  if (t < x1) return u.mark + W * E((t - x0) / (x1 - x0));
  return u.mark + W;
}

// How far the belt has run (for the carpet's pattern): the sum of the slides so far.
function belt(t, lines) {
  let s = 0;
  lines.forEach(ln => { const L1 = ln.ws[0].v; s += W * E((t - (L1 - .02 - D)) / D); });
  return s;
}

// Speed lines trailing a unit while the parade whips it across.
function streaks(g, t, vel, seed) {
  const dir = Math.sign(vel), k = clamp((Math.abs(vel) - 1200) / 1800);
  [-64, -132, -204, -270].forEach((y, i) => {
    const x0 = -dir * (170 + i * 26), x1 = x0 - dir * (90 + 110 * k + i * 20);
    line(g, [[x0, y + Math.sin(t * 20 + i) * 4], [x1, y]], { w: 6, col: '#8d8c97', seed: seed + i, t, spline: false, passes: 1, taper: [.5, .05], alpha: .5 * k + .15, over: 0, bow: 0 });
  });
}

function frame(g, t, li, lines, units) {
  window.__markInk = GRAPHITE;
  const gr = groove(t, 1);
  tentBack(g, t);
  floor(g, t);
  runway(g, t, belt(t, lines));
  // Spotlights: they sweep slowly and pick out each gag as it lands.
  const punch = side => {
    let k = 0;
    units.forEach(u => { if ((side < 0) === (u.slot === 0)) { const d = t - u.L; if (d > -.1 && d < 1) k = Math.max(k, Math.exp(-Math.max(0, d) / .3)); } });
    return k;
  };
  const tL = MARK[0] + Math.sin(t * .8) * 60 - 40 * punch(-1), tR = MARK[1] + Math.sin(t * .7 + 1.6) * 60 + 40 * punch(1);
  beam(g, t, -1, tL, { pow: .8 + .2 * punch(-1), seed: 611 });
  beam(g, t, 1, tR, { pow: .8 + .2 * punch(1), seed: 621 });
  // The cast, oldest first.
  units.forEach((u, n) => {
    const x = unitX(u, t);
    if (x < -300 || x > W + 300) return;
    const vel = (x - unitX(u, t - 1 / 15)) * 15;
    g.save();
    g.translate(x, STAGE_Y);
    shadow(g, t, 0, 190, 0, 900 + n);
    const gag = GAGS[u.key] || placeholder;
    gag(g, t, { L: u.L, a: t - u.L, vel, dist: x, gr, col: u.col, seed: 100 + n * 20 });
    if (Math.abs(vel) > 1200) streaks(g, t, vel, 700 + n * 10);
    g.restore();
  });
  let cheer = 0;
  units.forEach(u => { const d = t - u.L; if (d > -.02 && d < .5) cheer = Math.max(cheer, Math.exp(-Math.max(0, d) / .14) * Math.sin(Math.min(1, (d + .02) / .12) * Math.PI / 2)); });
  crowd(g, t, { cheer });
  // The film's pigeon, on the rightmost audience dog's head, watching the parade and gasping at each gag.
  pigeon(g, t, 986 + Math.sin(t * 2.2 + 6) * 3, 1500 - beatPulse(t + .06, .17) * 8 - 2 * 88 * .86 * (.92 + hash(5, 6) * .16) + 14 - cheer * 16, .46, { flip: -1, state: cheer > .3 ? 'gasp' : 'perch', look: -1, seed: 17 });
  valance(g, t);
  lamp(g, t, -1, tL, 631);
  lamp(g, t, 1, tR, 641);
  // The lyric, last and on top.
  const ln = lines[li];
  sing(g, t, ln.ws, { y: 225, size: 64, maxW: 980, tail: 1, tailCol: ln.tailCol, tailBubble: { fill: ln.tail.fill, edge: ln.tail.edge, e: 2.0, f: 1.35 }, hi: { 0: ln.hi }, seed: 40 + li, w: .1, tailGap: .5 });
}
