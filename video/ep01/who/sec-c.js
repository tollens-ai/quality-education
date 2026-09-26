// Section C of "Who Lives Here?": the bridge and the break, 106.2–147.56 s (episodes/01-storyboard.md).
//
// Bridge: the lift drops Clawd home and the camera sinks through the older basements (world.js draws
// the rooms, desks, builders and their handoff walls; this file drives them and adds the action).
// Every bar a ripple of habit rises from the oldest builder up to Clawd, who copies it at its bench.
// On "throw" each builder lobs a bundle of code over the wall; the "who's it for?" notes that come
// back from the far side never get past it and pile up on top. Not knowing was normal. Clawd's copy
// is sending its build up the lift, but Clawd has no wall: a note falls all the way down the shaft
// onto its head on "But". It reads "who's it for?", rides up to the lobby and scans the directory
// board, stopping on "you" on "for?".
// Break: each name lights on the board and its window flares warm-white (mattering; gold means
// served), one per word, as the camera climbs; three more on "matters" in a whole-tower shot. Then
// the dark basement: Clawd puts the note down, the high window lights for the first time ("I'M
// SOMEONE TOO!", the biggest type in the film) and the camera pushes in as "CLAWD · basement" writes
// itself on the board. The bots answer from upstairs, one per "me", in speech bubbles with their
// portraits and names, while their names pop onto the board. Clawd
// fetches the smudged fuse-box label, climbs its bench and holds it up to the ticket chute; your hand
// reaches down and rewrites it; it glows under your pen and Clawd's nub, flies back into the fuse box,
// and Clawd steps into the lift.
// No motion blur anywhere: the big camera moves are smooth zoom-and-pans (van Wijk & Nuij, as d3).
import { smooth, easeOut, between, lerp, clamp01, W, H } from '../../lib/stage.js';
import * as P from './plan.js';
import * as cast from './cast.js';
import * as world from './world.js';
import * as type from './type.js';
import * as secB from './sec-b.js';

export const range = [106.2, 147.56];

const { PAL, FONTS } = P;
const FLOOR = P.BASE.floor;
const OUT = PAL.outline;
const CS = 1.2;                      // Clawd's size everywhere in this section (B and D use 1.2 too)
const L9 = P.floorLevel(9);
const WARM = '#FFF4DC';              // "matters": warm white. Gold stays for "served".
const warm = a => `rgba(255,244,220,${a})`;

// ---------- helpers ----------
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); };
const inout = p => { p = clamp01(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const smoother = p => { p = clamp01(p); return p * p * p * (p * (p * 6 - 15) + 10); };
const bump = (t, a, d) => { const p = (t - a) / d; return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
const win = (t, a, b, c, d) => smooth(between(t, a, b)) * (1 - smooth(between(t, c, d)));
// Word landing: 0.55 → 1 with a little overshoot, as in type.js.
const pop = p => { p = clamp01(p); const c1 = 1.70158, c3 = c1 + 1; return 0.55 + 0.45 * (1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)); };
const toScreen = (cam, x, y) => ({ x: W / 2 + (x - cam.x) * cam.zoom, y: H / 2 + (y - cam.y) * cam.zoom });
const inView = (cam, x0, y0, x1, y1) => {
  const hw = W / 2 / cam.zoom, hh = H / 2 / cam.zoom;
  return x1 > cam.x - hw && x0 < cam.x + hw && y1 > cam.y - hh && y0 < cam.y + hh;
};
function rrect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function glow(g, x, y, r, color, a) {
  if (a <= 0.003) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, a);
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.restore();
}
function setFont(g, weight, size, family, stretch) {
  g.font = `${stretch ? stretch + ' ' : ''}${weight} ${size}px ${family}`;
  if ('fontStretch' in g) g.fontStretch = stretch || 'normal';
}
function star(g, x, y, r) {
  g.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * 0.35 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fill();
}

// ---------- the timeline (sung onsets from music/ep01/lyrics.json) ----------
// One named window per word, in the order the directory board lights its names (world.js).
const DEF = [
  [128.80, '2L'], [129.68, '2R'], [130.30, '3L'], [130.74, '3R'], [131.12, '4L'], [131.54, '4R'],
  [132.42, '5L'], [132.76, '5R'], [134.68, '6L'], [135.62, '6R'], [136.24, '7L'],
];
const BOARD_ORDER = 16;              // world.js lights 2L, 2R … 9L, 9R
const HITS = [
  { t: 128.80, words: [['SOFTWARE', 128.80, 1]] },
  { t: 129.68, words: [['QUALITY', 129.68, 1]] },
  { t: 130.30, words: [['IS', 130.30, 0], ['VALUE', 130.74, 1]] },
  { t: 131.12, words: [['TO', 131.12, 0], ['SOMEONE', 131.54, 1]] },
  { t: 132.42, words: [['WHO', 132.42, 0], ['MATTERS', 132.76, 1]] },
];
const LOCKUP = 133.56;
const MATTERS = [134.68, 135.62, 136.24];
const LOB = [113.55, 114.25], LOB_END = 114.9;   // the old builders' throw (world st.lob), then back to typing
const TOSS = 115.14;                              // Clawd copies it on "wall": its build goes up the lift
const BONK = 117.32;                              // "But": a note lands on Clawd's head
const SCAN = [124.3, 127.2];                      // reading the board, floor 2 up to floor 9
const FOR = 127.54;                               // "for?": the scan stops on "you"
// The bots, one per "me": the world draws them at these points (centre of the body).
const BOTS = [
  { id: 'molty', me: 139.68, name: 'Molty · OpenClaw', y: 300 },
  { id: 'jolly', me: 141.02, name: 'Jolly · Muse', y: 492 },
  { id: 'hermes', me: 142.1, name: 'Hermes ☤', y: 684 },
];

// Places.
const BENCH_X = 290;                 // typing, reading
const PEAK_X = 270;                  // at the peak, in the window's light
const BOARD_X = 250;                 // in front of the directory board, on the lobby floor (y 0)
const FUSE_X = 870;                  // under the fuse box's LOGS label
const PERCH = { x: 335, y: 300 };    // standing on the bench's right end, under the chute
const NOTE_DOWN = { x: 160, y: FLOOR - 28 };     // where the note is put down (outside D's first frame)
const BOARD = P.DIRECTORY;
const boardRowY = idx => BOARD.y + 60 + idx * 16; // idx: roof 0, floor 10 → 1, … floor 2 → 9
const YOU_AT = { x: BOARD.x + 217, y: boardRowY(2) };   // "you" on the board
const SLOT = { x: P.FUSE.x + 97, y: P.FUSE.y + 24 + 5 * 29 };   // the LOGS label on the fuse box (centre)
const LABEL = { w: 70, h: 22, size: 16 };

// ---------- camera ----------
// van Wijk & Nuij's smooth zoom-and-pan between two views (the path d3.interpolateZoom takes): it
// zooms out only as far as the move needs, so a long move reads as one steady glide.
const RHO = Math.SQRT2;
function zoomPan(a, b) {
  const w0 = W / a.zoom, w1 = W / b.zoom, dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
  if (d2 < 1e-6) {
    const S = Math.log(w1 / w0) / RHO;
    return u => ({ x: a.x, y: a.y, zoom: W / (w0 * Math.exp(RHO * u * S)), rot: 0 });
  }
  const d1 = Math.sqrt(d2), R2 = RHO * RHO, R4 = R2 * R2;
  const b0 = (w1 * w1 - w0 * w0 + R4 * d2) / (2 * w0 * R2 * d1), b1 = (w1 * w1 - w0 * w0 - R4 * d2) / (2 * w1 * R2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1), S = (r1 - r0) / RHO;
  return u => {
    const s = u * S, c0 = Math.cosh(r0), k = w0 / (R2 * d1) * (c0 * Math.tanh(RHO * s + r0) - Math.sinh(r0));
    return { x: a.x + k * dx, y: a.y + k * dy, zoom: W / (w0 * c0 / Math.cosh(RHO * s + r0)), rot: 0 };
  };
}
// Keys: [t, view]. zp: the move into this key is a zoom-and-pan (eased at both ends). Other moves
// follow a C1 spline through the keys, resting wherever a zoom-and-pan starts or ends.
const CAM = [
  [106.20, P.HANDOFF[106.2]],
  [108.40, { x: 540, y: 360, zoom: 1.0, zp: 1 }],            // down with the lift
  [110.40, { x: 540, y: 1350, zoom: 0.8, zp: 1 }],           // the lineage: Clawd on top, three eras below
  [115.25, { x: 540, y: 1316, zoom: 0.83 }],                 // (a slow push through the throw)
  [116.75, { x: 420, y: 300, zoom: 1.3, zp: 1 }],            // home: a note comes down the shaft
  [117.60, { x: 380, y: 295, zoom: 1.45 }],
  [119.40, { x: 330, y: 270, zoom: 1.9 }],                   // "who's it for?"
  [121.30, { x: 340, y: 275, zoom: 1.95 }],
  [122.10, { x: 470, y: 250, zoom: 1.55 }],                  // into the lift
  [123.40, { x: 290, y: -150, zoom: 2.2, zp: 1 }],           // up to the lobby: the board
  [127.54, { x: 262, y: -178, zoom: 2.45 }],                 // the scan lands on "you"
  [127.80, { x: 263, y: -179, zoom: 2.46 }],
  [128.80, { x: 540, y: -520, zoom: 1.0, zp: 1 }],           // the definition: the board and floor 2
  [129.68, { x: 540, y: -560, zoom: 1.0 }],
  [130.30, { x: 540, y: -880, zoom: 1.0 }],
  [130.74, { x: 540, y: -930, zoom: 1.0 }],
  [131.12, { x: 540, y: -1240, zoom: 1.0 }],
  [131.54, { x: 540, y: -1290, zoom: 1.0 }],
  [132.42, { x: 540, y: -1600, zoom: 1.0 }],
  [132.76, { x: 540, y: -1650, zoom: 1.0 }],
  [133.60, { x: 540, y: -1690, zoom: 0.98 }],
  [134.90, { x: 540, y: -1880, zoom: 0.5, zp: 1 }],          // pull back: the tower down to the basement, "matters"
  [136.05, { x: 540, y: -1872, zoom: 0.503 }],
  [137.55, { x: 280, y: 170, zoom: 1.35, zp: 1 }],           // down to the dark basement: the peak
  [138.90, { x: 281, y: 166, zoom: 1.39 }],
  [139.90, { x: 230, y: -40, zoom: 1.9 }],                   // push in: CLAWD · basement writes itself
  [140.00, { x: 230, y: -41, zoom: 1.905 }],
  [140.95, { x: 560, y: 160, zoom: 1.0, zp: 1 }],           // ease back: the basement, the lobby, the board
  [142.25, { x: 556, y: 164, zoom: 1.03 }],                  // (the bots answer; Clawd fetches the label)
  [143.45, { x: 432, y: 232, zoom: 2.5, zp: 1 }],            // in to the chute: your hand
  [144.30, { x: 431, y: 228, zoom: 3.05 }],
  [145.15, { x: 432, y: 228, zoom: 3.1 }],
  [146.10, { x: 700, y: 260, zoom: 1.5, zp: 1 }],            // the label flies home
  [147.56, P.HANDOFF[147.56]],
];
const ZP = new Map();
function path(keys, t) {
  const n = keys.length;
  if (t <= keys[0][0]) return { ...keys[0][1], rot: 0 };
  if (t >= keys[n - 1][0]) return { ...keys[n - 1][1], rot: 0 };
  let i = 0; while (t >= keys[i + 1][0]) i++;
  const [t0, a] = keys[i], [t1, b] = keys[i + 1], h = t1 - t0, s = (t - t0) / h;
  if (b.zp) {
    if (!ZP.has(i)) ZP.set(i, zoomPan(a, b));
    return ZP.get(i)(smooth(s));
  }
  const rest = j => j === 0 || j === n - 1 || keys[j][1].zp || keys[j + 1][1].zp;
  const tan = (j, f) => rest(j) ? 0 : (f(keys[j + 1][1]) - f(keys[j - 1][1])) / (keys[j + 1][0] - keys[j - 1][0]);
  const s2 = s * s, s3 = s2 * s;
  const herm = f => (2 * s3 - 3 * s2 + 1) * f(a) + (s3 - 2 * s2 + s) * tan(i, f) * h + (-2 * s3 + 3 * s2) * f(b) + (s3 - s2) * tan(i + 1, f) * h;
  return { x: herm(k => k.x), y: herm(k => k.y), zoom: Math.exp(herm(k => Math.log(k.zoom))), rot: 0 };
}
export function camera(t, S) { return path(CAM, t); }

// ---------- state ----------
function liftAt(t) {
  let y;
  if (t < 108.1) y = lerp(L9, FLOOR, inout(between(t, 106.3, 108.1)));
  else if (t < 115.55) y = FLOOR - 14 * bump(t, 108.1, 0.35);
  else if (t < 119.6) y = lerp(FLOOR, L9, inout(between(t, 115.55, 117.1)));                          // takes Clawd's build up
  else if (t < 122.3) y = lerp(L9, FLOOR, inout(between(t, 119.6, 121.05))) - 10 * bump(t, 121.05, 0.3);   // back, empty
  else if (t < 132.6) y = lerp(FLOOR, 0, inout(between(t, 122.3, 123.1))) - 8 * bump(t, 123.1, 0.3);       // Clawd, to the lobby
  else y = lerp(0, FLOOR, inout(between(t, 132.6, 133.45))) - 8 * bump(t, 133.45, 0.3);                   // and home
  const doors = Math.max(win(t, 108.3, 108.7, 115.18, 115.45), win(t, 121.15, 121.45, 121.98, 122.22),
    win(t, 123.12, 123.4, 132.25, 132.5), win(t, 133.5, 133.75, 134.35, 134.6), win(t, 145.95, 146.3, 146.95, 147.4));
  return { y, style: 'plain', styleP: 1, doors };
}
// Section B's last frame, so its gold and car style fade out instead of popping at the seam.
function freshBase(t) {
  const flats = {};
  for (const id of Object.keys(P.RESIDENTS)) flats[id] = { lit: 1, gold: 0 };
  return { t, quota: P.quota(t), sessionTag: P.sessionTag(t), builds: P.yourBuilds(t), ticket: P.ticketFill(t),
    blind: P.blind(t), bellRing: P.bellRing(t), bellGlow: P.bellGlow(t), baseWindow: P.baseWindow(t),
    directoryLit: P.directoryLit(t), bots: P.botsUp(t), youGold: P.youGold(t), autumn: P.autumn(t), flats,
    lift: { y: P.LIFT_AT[106.2], style: 'plain', styleP: 0, doors: 0 }, cutWords: 0, bulbSwing: 0, dim: 0, strata: 0 };
}
let bEnd;
function endOfB(S) {
  if (bEnd === undefined) {
    try { const s = freshBase(106.19); secB.state(106.19, s, S); bEnd = s; } catch (e) { bEnd = null; }
  }
  return bEnd;
}
const dimAt = t => Math.max(
  0.06 * smooth(between(t, 106.4, 108)) * (1 - smooth(between(t, 121, 123))),
  0.3 * smooth(between(t, 136.3, 136.95)) * (1 - smooth(between(t, 137.48, 138.2))));
const lobAt = t => t >= LOB_END || t < LOB[0] ? 0 : 1.16 * between(t, LOB[0], LOB[1]);

export function state(t, st, S) {
  const b = t < 107.6 ? endOfB(S) : null, k = 1 - smooth(between(t, 106.2, 107.5));
  for (const id of Object.keys(st.flats)) {       // no gold in this section: nothing here is served
    const f = st.flats[id], bf = b && b.flats && b.flats[id];
    f.gold = bf ? (bf.gold || 0) * k : 0;
    if (bf && bf.lit !== undefined) f.lit = lerp(1, bf.lit, k);
  }
  st.lift = liftAt(t);
  if (b && b.lift && b.lift.style && b.lift.style !== 'plain' && t < 107) { st.lift.from = b.lift.style; st.lift.styleP = smooth(between(t, 106.2, 106.9)); }
  st.strata = smooth(between(t, 107.9, 111.3)) * (1 - smooth(between(t, 117.5, 118.9)));
  st.lob = lobAt(t);
  st.dim = dimAt(t);
  st.cutWords = 0;
  st.bulbSwing = 0.09 * Math.sin(t * 1.6) * (t < 128.8 ? 1 : 0.4);
  // The board lights one name per word, in its own order; off camera it catches up with plan.js.
  let lit = 0; for (const [ti] of DEF) lit += smooth(between(t, ti, ti + 0.15));
  st.directoryLit = lerp(lit / BOARD_ORDER, 1, smooth(between(t, 140.4, 141.6)));
  if (t > 122 && t < 129.5) st.directoryGlint = 0;          // no idle glint while Clawd reads the board
  st.clawdLine = t < 137.48 ? 0 : between(t, 138.5, 139.3);  // CLAWD · basement writes itself (world.js)
  st.fuseLabel = smooth(between(t, 145.93, 145.97));        // the rewritten label, back in its slot
}

// ---------- Clawd ----------
function mouthAt(S, t) {
  if (t >= 139.24 && t < 142.42) return 0;          // that's the bots singing
  const l = S.lineAt(t, 0);
  if (!l) return 0;
  for (const w of l.words) if (!w.backing && w.s !== null && t >= w.s && t < (w.e ?? w.s + 0.2)) return 0.35 + 0.4 * Math.abs(Math.sin((t - w.s) * 13));
  return 0;
}
function walk(c, t, a, b, x0, x1) {
  const q = inout(between(t, a, b));
  c.x = lerp(x0, x1, q);
  if (t > a && t < b) { c.pose.walk = (t - a) * 9; c.pose.hop = 0.1 * Math.abs(Math.sin((t - a) * 15)); c.pose.look = 0.8 * Math.sign(x1 - x0); }
}
function scurry(c, t, a, b, x0, x1) {                     // a brisk trot
  walk(c, t, a, b, x0, x1);
  if (t > a && t < b) { c.pose.walk = (t - a) * 15; c.pose.hop = 0.14 * Math.abs(Math.sin((t - a) * 22)); }
}
function hopTo(c, t, a, b, from, to, height) {
  const q = between(t, a, b), e = smooth(q);
  c.x = lerp(from.x, to.x, e); c.y = lerp(from.y, to.y, e) - height * Math.sin(Math.PI * q);
  c.pose.squash = 0.3 * bump(t, a - 0.08, 0.16) + 0.3 * bump(t, b - 0.02, 0.2) - 0.15 * bump(t, a, b - a);
  c.pose.look = 0.6 * Math.sign(to.x - from.x);
}
// The echo: every bar a ripple rises from the oldest builder; Clawd copies it this long after.
const ECHO_LAG = 0.54;
function echoAccent(S, t) {
  if (t < 109.2 || t > 114.6) return 0;
  const bp = S.barPos(t - ECHO_LAG), bt = t - ECHO_LAG - (bp - Math.floor(bp)) * S.bar;
  return bump(t, bt + ECHO_LAG, 0.42);
}
// Reading the board: which row (board index; 9 = floor 2 … 2 = floor 9), then narrowing to "you".
function scanAt(t) {
  const u = clamp01((t - SCAN[0]) / (SCAN[1] - SCAN[0])) * 7, i = Math.min(7, Math.floor(u));
  const step = Math.min(7, i + smooth(clamp01((u - i - 0.62) / 0.38)));
  return { row: 9 - step, up: step / 7, narrow: smooth(between(t, SCAN[1], FOR)) };
}
function clawdAt(t, st, S) {
  const c = { x: BENCH_X, y: FLOOR, s: CS, note: null, label: null, inLift: false, echo: 0, lit: 0 };
  const p = c.pose = { t, mood: 'determined', look: 0, lookY: 0, mouth: mouthAt(S, t), hop: 0, squash: 0, lit: 0, rot: 0 };
  const typing = () => { p.armL = -0.3 + 0.24 * Math.sin(t * 21); p.armR = -0.3 + 0.24 * Math.sin(t * 21 + 1.9); p.look = -0.6; p.lookY = 0.45; };
  const riding = () => { c.x = 540; c.y = st.lift.y; c.inLift = true; };
  if (t < 108.75) {                                         // riding the lift down
    riding(); p.mood = t < 108.1 ? 'surprise' : 'determined';
    const fall = bump(t, 106.6, 1.4);
    p.hop = 0.3 * fall; if (fall > 0) p.armL = p.armR = 1.1 * fall;
  } else if (t < 109.65) walk(c, t, 108.75, 109.65, 540, BENCH_X);
  else if (t < BONK) {                                      // at the bench: the echo, then its own throw
    typing();
    const ac = echoAccent(S, t);
    if (ac > 0) { p.armL += 1.1 * ac; p.armR += 0.7 * ac; p.hop = 0.12 * ac; c.echo = ac; }
    if (t > TOSS - 0.3 && t < TOSS + 0.5) {
      const wind = smooth(between(t, TOSS - 0.3, TOSS)), rel = smooth(between(t, TOSS, TOSS + 0.22));
      p.armL = p.armR = lerp(2.0 * wind, 0.4, rel); p.look = 0.8; p.lookY = -0.2; c.echo = Math.max(c.echo, bump(t, TOSS - 0.3, 0.8));
    }
  } else if (t < 118.3) {                                   // "But": bonk. It takes the note off its head.
    p.mood = 'surprise'; p.emote = '!'; p.emoteK = smooth(between(t, BONK, BONK + 0.12));
    p.squash = 0.3 * bump(t, BONK, 0.3); p.lookY = -0.7;
    p.armR = lerp(-0.3, 1.5, smooth(between(t, 117.6, 117.95))) - 1.3 * smooth(between(t, 117.95, 118.3));
    c.note = t < 117.85 ? { head: 1 } : { open: 0 };
  } else if (t < 121.3) {                                   // reads it: "who's it for?"
    const up = smooth(between(t, 118.95, 119.4)), down = smooth(between(t, 120.65, 121.1));
    p.mood = t < 119.1 ? 'surprise' : 'worried'; p.lookY = lerp(0.3, -0.45, up);
    p.armL = p.armR = lerp(0.2, 1.9, up) - 1.4 * down;
    c.note = { open: smooth(between(t, 118.3, 119.0)), up: up * (1 - down), side: -1, sideK: down };
    if (t > 120.65) { p.mood = 'hope'; p.look = 0.7; p.lookY = -0.8; }    // and looks up the shaft: who?
  } else if (t < 121.95) {                                  // into the lift, note in hand
    walk(c, t, 121.3, 121.95, BENCH_X, 540); c.note = { open: 1, side: -1 };
  } else if (t < 123.3) {                                   // up to the lobby
    riding(); c.note = { open: 1, side: -1 }; p.lookY = -0.6; p.look = -0.3;
  } else if (t < 124.1) {                                   // out to the directory board
    c.y = 0; walk(c, t, 123.3, 124.05, 540, BOARD_X); c.note = { open: 1, side: -1 };
  } else if (t < 131.8) {                                   // reads the board, and stops on "you"
    c.x = BOARD_X; c.y = 0; c.note = { open: 1, side: -1 };
    const sc = scanAt(t);
    p.lookY = -0.35 - 0.65 * sc.up; p.look = 0.1 * sc.narrow;
    p.armR = 0.85 + 0.55 * sc.up; p.armL = -0.35;
    p.mood = t < FOR ? 'neutral' : t < 128.05 ? 'surprise' : 'hope';
    if (t >= FOR && t < 128.5) { p.emote = '!'; p.emoteK = smooth(between(t, FOR, FOR + 0.12)); }
    if (t >= FOR) p.hop = 0.25 * bump(t, FOR, 0.35);
  } else if (t < 132.35) { c.y = 0; walk(c, t, 131.8, 132.35, BOARD_X, 540); c.note = { open: 1, side: -1 }; }   // (off camera)
  else if (t < 133.6) { riding(); c.note = { open: 1, side: -1 }; }
  else if (t < 134.4) { walk(c, t, 133.6, 134.4, 540, PEAK_X); c.note = { open: 1, side: -1 }; }
  else if (t < 137.48) {                                    // alone in the dark; it puts the note down
    c.x = PEAK_X; p.mood = 'sad'; p.look = -0.3; p.lookY = 0.55;
    const put = smooth(between(t, 136.95, 137.35));
    p.armL = lerp(-0.35, -1.15, put);
    if (t < 137.35) c.note = { open: 1, side: -1, down: put };
  } else if (t < 140.4) {                                   // the peak
    c.x = PEAK_X;
    const up = smooth(between(t, 137.55, 137.9));
    p.lookY = lerp(0.55, -1, up); p.look = lerp(-0.3, -0.55, up); p.rot = -0.12 * up;
    p.mood = t < 137.55 ? 'sad' : t < 138.14 ? 'surprise' : 'beam';
    if (t >= 137.55 && t < 138.14) { p.emote = '!'; p.emoteK = smooth(between(t, 137.55, 137.68)); }
    if (t >= 138.14) { p.emote = 'sparkle'; p.emoteK = smooth(between(t, 138.14, 138.3)); }
    p.tear = 0.7 * smooth(between(t, 137.9, 138.3));
    p.hop = 0.5 * bump(t, 138.14, 0.42) + 0.25 * bump(t, 139.68, 0.35);
    p.armL = p.armR = lerp(-0.3, 0.6, up) + 1.2 * bump(t, 138.14, 0.7);
    c.lit = smooth(between(t, 137.55, 138.25));
  } else if (t < 142.5) {                                   // an idea: it fetches the smudged label
    p.mood = 'determined'; c.lit = 0.5 * (1 - between(t, 140.4, 141));
    if (t < 140.45) { c.x = PEAK_X; p.emote = '!'; p.emoteK = smooth(between(t, 140.4, 140.5)); p.look = 0.7; }
    else if (t < 141.1) scurry(c, t, 140.45, 141.1, PEAK_X, FUSE_X);
    else if (t < 141.4) { c.x = FUSE_X; p.lookY = -1; p.look = 0.3; p.hop = 0.5 * bump(t, 141.1, 0.3); p.armR = 0.4 + 1.1 * bump(t, 141.1, 0.3); }
    else if (t < 142.2) scurry(c, t, 141.4, 142.2, FUSE_X, 385);
    else hopTo(c, t, 142.2, 142.5, { x: 385, y: FLOOR }, PERCH, 70);
    if (t > 141.25) { c.label = { held: 1 }; p.armR = Math.max(p.armR ?? 0, 0.9); }
  } else if (t < 145.3) {                                   // holds it up to the chute
    c.x = PERCH.x; c.y = PERCH.y; p.look = 0.45; p.lookY = -0.7; p.still = true;
    p.armR = 1.25; p.armL = 0.25;
    p.mood = t < 143.4 ? 'worried' : t < 144.72 ? 'hope' : 'beam';
    if (t < 143.4) { p.emote = '?'; p.emoteK = 1; }
    if (t >= 144.72) { p.emote = 'sparkle'; p.emoteK = smooth(between(t, 144.72, 144.9)); }
    c.label = t < 145.2 ? { held: 1 } : null;
    c.lit = 0.55 * smooth(between(t, 144.72, 145.0));
  } else if (t < 145.62) {                                  // hops down as the label flies home
    hopTo(c, t, 145.3, 145.62, PERCH, { x: 395, y: FLOOR }, 40); p.mood = 'beam'; p.armR = 1.2 - 0.9 * between(t, 145.3, 145.62);
  } else if (t < 146.3) { c.x = 395; p.mood = 'beam'; p.look = 0.8; p.lookY = -0.25; c.lit = 0.4 * (1 - between(t, 145.62, 146.3)); }
  else if (t < 146.8) { walk(c, t, 146.3, 146.8, 395, 540); p.mood = 'hope'; }
  else {                                                    // in the car: braced for the ride up, as D picks it up
    riding(); p.mood = 'determined'; p.look = 0.4 * smooth(between(t, 146.85, 147.2)); p.hop = 0.12 * bump(t, 146.9, 0.3);
  }
  return c;
}
// Where Clawd's nubs are at time t (for the label's flight), measured once on a scratch canvas.
let scratch = null;
const TIPS = new Map();
function tipsAt(t, st, S) {
  if (TIPS.has(t)) return TIPS.get(t);
  let tips = null;
  try {
    if (!scratch && typeof document !== 'undefined') scratch = document.createElement('canvas').getContext('2d');
    if (scratch) { const c = clawdAt(t, { ...st, lift: liftAt(t) }, S); tips = cast.clawd(scratch, c.x, c.y, c.s, c.pose); }
  } catch (e) { tips = null; }
  TIPS.set(t, tips);
  return tips;
}
function heldLabelAt(tips) {
  const tip = tips && tips.tipR && Number.isFinite(tips.tipR.x) ? tips.tipR : { x: PERCH.x + 81, y: PERCH.y - 100 };
  return { x: tip.x + LABEL.w / 2 - 4, y: tip.y - 5, rot: -0.06 };
}
function drawClawd(g, t, st, S, cam) {
  const c = clawdAt(t, st, S);
  c.tips = null;
  if (!inView(cam, c.x - 260, c.y - 420, c.x + 260, c.y + 80)) return c;
  if (c.lit > 0.01) {                                       // lit warm-white: it matters
    glow(g, c.x, c.y - 55 * c.s, 230 * c.s, warm(1), 0.55 * c.lit);
    glow(g, c.x, c.y - 55 * c.s, 110 * c.s, warm(1), 0.35 * c.lit);
  }
  if (c.echo > 0.01) {                                      // the copied gesture: a ripple in Clawd's orange
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = PAL.token; g.lineWidth = 5;
    for (let q = 0; q < 2; q++) { g.globalAlpha = 0.6 * c.echo * (1 - q * 0.4); g.beginPath(); g.arc(c.x, c.y - 70 * c.s, (70 + q * 26) * c.s, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    g.restore();
  }
  c.tips = cast.clawd(g, c.x, c.y, c.s, c.pose);
  if (c.inLift) world.drawLiftFront(g, t, S, st);
  if (c.note) drawHeldNote(g, t, c);
  return c;
}

// ---------- notes ----------
function crumple(g, x, y, r, seed, rot, fill = '#EADFC6') {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2, rr = r * (0.78 + 0.34 * hash(seed * 13 + i));
    i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath(); g.fillStyle = fill; g.fill();
  g.strokeStyle = '#2A1E14'; g.lineWidth = Math.max(2, r * 0.16); g.stroke();
  g.lineWidth = Math.max(1.2, r * 0.09); g.beginPath();
  g.moveTo(-r * 0.5, -r * 0.1); g.lineTo(r * 0.05, r * 0.25); g.lineTo(r * 0.45, -r * 0.2);
  g.stroke();
  g.restore();
}
// A fluttering sheet (half-crumpled) with a scribble of the question on it.
function sheet(g, x, y, s, rot, seed) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s * (0.55 + 0.45 * Math.abs(Math.cos(rot * 2.3 + seed))));
  g.beginPath(); g.moveTo(-26, -19); g.lineTo(-4, -22); g.lineTo(25, -17); g.lineTo(22, 4); g.lineTo(27, 19); g.lineTo(-3, 22); g.lineTo(-25, 18); g.lineTo(-21, 0); g.closePath();
  g.fillStyle = '#EFE4CC'; g.fill(); g.strokeStyle = '#2A1E14'; g.lineWidth = 3.5; g.stroke();
  g.strokeStyle = '#6A5642'; g.lineWidth = 2.5; g.beginPath();
  g.moveTo(-17, -7); g.quadraticCurveTo(-8, -13, 2, -7); g.quadraticCurveTo(10, -2, 16, -8);
  g.moveTo(-15, 6); g.quadraticCurveTo(-4, 1, 6, 7); g.stroke();
  g.restore();
}
// A drift: the first n balls of a mound that fills from the bottom up.
const MOUND = {};
function mound(key, n, halfW, hMax, rMin, rMax, seed = key.length) {
  if (MOUND[key]) return MOUND[key];
  const balls = [];
  for (let i = 0; i < n; i++) {
    const u = hash(i * 3.17 + seed * 11.3) * 2 - 1, v = Math.pow(hash(i * 7.31 + 1.7 + seed), 0.8);
    balls.push({ dx: u * halfW, h: hMax * (1 - u * u) * v, r: lerp(rMin, rMax, hash(i * 5.3 + 2.1)), rot: hash(i * 9.1) * 6, seed: i + key.length * 100 });
  }
  balls.sort((a, b) => a.h - b.h);
  return (MOUND[key] = balls);
}
// The note Clawd gets: on its head, a ball in its nub, opened, held up to read, carried, put down.
function notePos(c) {
  const n = c.note, s = c.s;
  if (n.head) return { x: c.x + 6 * s, y: c.y - 94 * s - 12, k: 0.6, ball: 1 };
  let x = c.x + 30 * s, y = c.y - 48 * s, k = 0.6;
  if (n.up) { x = lerp(x, c.x - 4 * s, n.up); y = lerp(y, c.y - 178 * s, n.up); k = lerp(k, 1.35, n.up); }
  const sk = n.sideK ?? (n.side ? 1 : 0);
  if (sk) { x = lerp(x, c.x + 72 * s * (n.side || -1), sk); y = lerp(y, c.y - 42 * s, sk); k = lerp(k, 0.55, sk); }
  if (n.down) { x = lerp(x, NOTE_DOWN.x, n.down); y = lerp(y, NOTE_DOWN.y, n.down); k = lerp(k, 0.5, n.down); }
  return { x, y, k, sk, ball: n.open < 0.02 };
}
function paperNote(g, x, y, k, o, rot, glowA = 0) {
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(rot);
  const jag = (1 - o) * 26, w = lerp(30, 150, o), h = lerp(30, 104, o);
  if (glowA) glow(g, 0, 0, 170, warm(1), 0.5 * glowA);
  g.beginPath();
  const pts = [[-w / 2, -h / 2], [0, -h / 2 - 3], [w / 2, -h / 2], [w / 2 + 2, 0], [w / 2, h / 2], [0, h / 2 + 2], [-w / 2, h / 2], [-w / 2 - 2, 0]];
  pts.forEach(([px, py], i) => { const jx = px + jag * (hash(i * 3.3) - 0.5), jy = py + jag * (hash(i * 5.7) - 0.5); i ? g.lineTo(jx, jy) : g.moveTo(jx, jy); });
  g.closePath(); g.fillStyle = '#F2E8D2'; g.fill(); g.strokeStyle = '#2A1E14'; g.lineWidth = 5; g.stroke();
  g.strokeStyle = 'rgba(90,70,50,0.35)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-w / 2, -h * 0.1); g.lineTo(w * 0.1, h * 0.05); g.lineTo(w / 2, -h * 0.2); g.moveTo(-w * 0.2, -h / 2); g.lineTo(-w * 0.05, h / 2); g.stroke();
  if (o > 0.6) {
    g.globalAlpha = smooth((o - 0.6) / 0.4);
    setFont(g, 700, 40, FONTS.hand); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#4A3B2E';
    g.fillText("who's", -4, -18); g.fillText('it for?', 2, 20);
  }
  g.restore();
}
function drawHeldNote(g, t, c) {
  const q = notePos(c);
  if (q.ball) { crumple(g, q.x, q.y, 16, 3, c.note.head ? 0.4 : t * 3); return; }
  const n = c.note, rot = lerp(-0.04, 0.35 * (n.side || -1), q.sk);
  paperNote(g, q.x, q.y, q.k, n.open, n.down ? lerp(rot, 0.12, n.down) : rot);
}

// ---------- the old basements: this file's action over world.js's rooms ----------
// Geometry mirrored from world.js drawStrata (rooms, walls, desks, builders).
const ERA = [[40, 1040], [90, 990], [140, 940]].map(([x0, x1], i) => {
  const y1 = P.STRATA[i].floor, dx = x0 + 150, dy = y1 - 110, wx0 = x1 - 400, wx1 = x1 - 40, wy0 = y1 - 330;
  return { i, x0, x1, y1, y0: P.STRATA[i].top + 34, floor: y1 - 28, wx0, wx1, wy0, wc: (wx0 + wx1) / 2, dx, dy, head: [dx + 60, dy - 88],
    glow: P.STRATA[i].glow, stuck0: [7, 11, 16][i] };
});
const eraLob = (t, i) => clamp01(lobAt(t) - i * 0.08);
const handAt = (E, lob) => [E.dx + 40 + lob * 60, E.dy - 110 - Math.sin(lob * Math.PI) * 60];
// When each era's bundle leaves the hand (its lob reaches 0.55).
const releaseT = i => LOB[0] + (LOB[1] - LOB[0]) * (0.55 + 0.08 * i) / 1.16;
const FLY = 0.85, BUNDLE_K = 1.7;
function bundle(g, x, y, kind, rot = 0, k = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  g.strokeStyle = OUT; g.lineWidth = 4;
  if (kind === 1) {                                         // 1990s: floppies, taped
    for (let i = 0; i < 3; i++) { g.fillStyle = '#2F4E8C'; g.fillRect(-20, -23 + i * 7, 40, 30); g.strokeRect(-20, -23 + i * 7, 40, 30); }
    g.fillStyle = '#C9CED6'; g.fillRect(-9, 0, 18, 9); g.fillStyle = '#EFE6CF'; g.fillRect(-14, 12, 28, 8);
  } else if (kind === 2) {                                  // 1970s: a deck of punch cards
    for (let i = 0; i < 3; i++) { g.fillStyle = '#EFE6CF'; g.fillRect(-26 + i * 2, -14 - i * 5, 52, 26); g.strokeRect(-26 + i * 2, -14 - i * 5, 52, 26); }
    g.fillStyle = '#6A5642'; for (let r = 0; r < 3; r++) for (let q = 0; q < 8; q++) if (hash(r * 9 + q) > 0.45) g.fillRect(-18 + q * 5, -20 + r * 6, 2.5, 3.5);
    g.strokeStyle = '#B03A2E'; g.lineWidth = 3; g.beginPath(); g.moveTo(-8, -26); g.lineTo(-8, 12); g.stroke();
  } else {                                                  // 2010s, and Clawd's (orange): a tied parcel of code
    const orange = kind === 3;
    g.fillStyle = orange ? PAL.token : '#DCD3C0'; rrect(g, -24, -16, 48, 32, 4); g.fill(); g.stroke();
    g.strokeStyle = orange ? PAL.clawdDk : '#7A5230'; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(-24, 0); g.lineTo(24, 0); g.moveTo(0, -16); g.lineTo(0, 16); g.stroke();
    g.fillStyle = orange ? '#FFF1E6' : '#5A4632'; setFont(g, 700, 13, FONTS.mono); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('</>', -12, -7);
  }
  g.restore();
}
// The notes that come back from the far side: each rises from behind the wall and lands on its top.
const RETURNS = [0.55, 0.75, 0.95, 1.15];
const RETURN_DUR = 0.7;
function stuckSlot(E, j) {                                  // the j-th note on top of the wall
  const cx = (E.wx0 + 20 + E.wc + 95) / 2, halfW = (E.wc + 95 - E.wx0 - 20) / 2;
  const b = mound('wall' + E.i, 40, halfW, 24 + 12 * E.i, 13, 18, 7 + E.i * 5)[j];
  return { x: cx + b.dx, y: E.wy0 - b.r * 0.75 - b.h, r: b.r, rot: b.rot, seed: b.seed };
}
function drawEra(g, t, E, a, S) {
  if (a < 0.01) return;
  g.save(); g.globalAlpha = a;
  g.beginPath(); g.rect(E.x0, E.y0, E.x1 - E.x0, E.y1 - E.y0); g.clip();
  const aboveWall = () => { g.beginPath(); g.rect(E.x0, E.y0, E.wx0 - E.x0, E.y1 - E.y0); g.rect(E.wx0, E.y0, E.x1 - E.wx0, E.wy0 - E.y0); g.clip(); };
  // the questions that never got past the wall
  const r = releaseT(E.i);
  let landed = 0; for (const d of RETURNS) if (t >= r + d + RETURN_DUR) landed++;
  for (let j = E.stuck0 + landed - 1; j >= 0; j--) { const q = stuckSlot(E, j); crumple(g, q.x, q.y, q.r, q.seed, q.rot); }
  RETURNS.forEach((d, j) => {
    const u = (t - r - d) / RETURN_DUR;
    if (u <= 0 || u >= 1) return;
    const to = stuckSlot(E, E.stuck0 + j), fx = to.x + 70 + 40 * hash(j + E.i * 3);
    const x = lerp(fx, to.x, smooth(u)), y = lerp(E.wy0 + 40, to.y, u) - 95 * Math.sin(Math.PI * Math.min(1, u * 1.05));
    g.save(); aboveWall(); sheet(g, x, y, 0.8, 0.8 * Math.sin(u * 9 + j), j + E.i); g.restore();
    if (u > 0.86) { g.save(); g.globalAlpha = a * (1 - u) * 5; g.fillStyle = '#EDE2CC'; for (let q = 0; q < 5; q++) { g.beginPath(); g.arc(to.x - 16 + q * 8, to.y + to.r * 0.6 - 4 * hash(q + j), 3, 0, 7); g.fill(); } g.restore(); }
  });
  // the bundle in the hand, then in flight over the wall (it vanishes behind it)
  const lob = eraLob(t, E.i);
  if (lob > 0.01 && lob < 0.55) { const h = handAt(E, lob); bundle(g, h[0], h[1] - 14, E.i, -0.3 + lob, BUNDLE_K); }
  const fl = between(t, r, r + FLY);
  if (fl > 0 && fl < 1) {
    const h0 = handAt(E, 0.55), end = [E.wc + 20, E.wy0 + 70];
    const apex = E.wy0 - 120, arc = (h0[1] - 14 + end[1]) / 2 - apex;
    const at = q => [lerp(h0[0], end[0], q), lerp(h0[1] - 14, end[1], q) - arc * Math.sin(Math.PI * q)];
    const trailA = 1 - smooth(clamp01((fl - 0.7) / 0.3));
    g.save(); aboveWall();
    g.setLineDash([10, 12]); g.lineCap = 'round'; g.lineWidth = 5; g.strokeStyle = warm(0.75 * trailA);
    g.beginPath(); for (let q = 0; q <= fl; q += 0.04) { const pt = at(q); q ? g.lineTo(pt[0], pt[1]) : g.moveTo(pt[0], pt[1]); } g.stroke();
    g.setLineDash([]);
    const b = at(fl); bundle(g, b[0], b[1], E.i, fl * 6, BUNDLE_K);
    g.restore();
  }
  // the echo: every bar a ripple rises from the oldest builder up through the generations
  const lag = (2 - E.i) * 0.18;
  if (t > 109 && t < 115.5) {
    const bp = S.barPos(t - lag), bt = t - lag - (bp - Math.floor(bp)) * S.bar;
    for (const te of [bt + lag, r]) {
      const u = t - te;
      if (u < 0 || u > 1.1) continue;
      g.save(); g.globalCompositeOperation = 'lighter';
      for (let q = 0; q < 3; q++) {
        const v = (u - q * 0.12) / 0.9;
        if (v <= 0 || v >= 1) continue;
        g.globalAlpha = a * 0.55 * (1 - v); g.strokeStyle = E.glow; g.lineWidth = 5;
        g.beginPath(); g.arc(E.head[0], E.head[1], 26 + 360 * v, Math.PI * 1.18, Math.PI * 1.82); g.stroke();
      }
      g.restore();
    }
  }
  g.restore();
}
function drawOldBasements(g, t, st, cam, S) {
  const sv = st.strata;
  if (sv < 0.002 || !inView(cam, 0, FLOOR, 1080, 2000)) return;
  for (const E of ERA) {
    if (!inView(cam, E.x0, E.y1 - 520, E.x1, E.y1)) continue;
    drawEra(g, t, E, smooth(clamp01(sv * 3 - E.i)), S);
  }
}

// ---------- Clawd's basement ----------
// The one question that gets through: down the shaft, onto Clawd's head on "But".
const FALL0 = 116.5;
function fallingNote(t) {
  if (t < FALL0 || t >= BONK) return null;
  const f = (t - FALL0) / (BONK - FALL0), out = smooth(clamp01((f - 0.55) / 0.45));
  return { x: lerp(562 + 16 * Math.sin(f * 13), BENCH_X + 8, out), y: lerp(-450, FLOOR - 94 * CS - 14, f * (0.65 + 0.35 * f)), rot: 0.9 * Math.sin(f * 11) };
}
function drawBasement(g, t, st, cam) {
  if (!inView(cam, 0, -500, 1080, 460)) return;
  const fn = fallingNote(t);
  if (fn) sheet(g, fn.x, fn.y, 1.25, fn.rot, 7);
  // Clawd's own "over the wall": its build, tossed into the lift, which takes it away
  const u = between(t, TOSS, TOSS + 0.32);
  if (t > TOSS && t < 117.2) {
    const x = lerp(BENCH_X + 40, 540, u), y = t < TOSS + 0.32 ? lerp(FLOOR - 120, FLOOR - 40, u) - 120 * Math.sin(Math.PI * u) : st.lift.y - 40;
    bundle(g, x, y, 3, u * 4, 1.2);
  }
  // the note, put down before the peak
  if (t >= 137.35) paperNote(g, NOTE_DOWN.x, NOTE_DOWN.y, 0.5, 1, 0.12);
  // the ring as the window lights for the first time, and sparkles on "too!"
  const bu = between(t, 137.48, 138.3);
  if (bu > 0 && bu < 1) {
    const Wd = P.BASE_WINDOW;
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = WARM; g.lineWidth = 7 * (1 - bu); g.globalAlpha = 1 - bu;
    g.beginPath(); g.arc(Wd.x + Wd.w / 2, Wd.y + Wd.h / 2, 60 + 260 * easeOut(bu), 0, 7); g.stroke(); g.restore();
  }
  const sp = between(t, 138.14, 139.3);
  if (sp > 0 && sp < 1) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 10; i++) {
      const a = hash(i * 2.3) * Math.PI * 2, r = 70 + 110 * easeOut(sp) * (0.6 + 0.4 * hash(i));
      g.globalAlpha = (1 - sp) * 0.9; g.fillStyle = WARM;
      star(g, PEAK_X + Math.cos(a) * r, FLOOR - 70 + Math.sin(a) * r * 0.8, 9 * (1 - sp * 0.5));
    }
    g.restore();
  }
  // the fuse box's LOGS slot stands empty while Clawd has its label
  if (t > 141.25 && t < 145.95 && inView(cam, 900, 280, 1040, 340)) {
    g.save(); g.fillStyle = '#DCD8CC'; g.fillRect(SLOT.x - 37, SLOT.y - 12, 74, 24);
    g.setLineDash([4, 3]); g.strokeStyle = 'rgba(60,60,80,0.45)'; g.lineWidth = 1.5; g.strokeRect(SLOT.x - 33, SLOT.y - 9, 66, 18); g.setLineDash([]);
    g.restore();
  }
}

// ---------- the directory scan (124–128.8) ----------
function drawScan(g, t) {
  if (t < 124.2 || t > 129.3) return;
  const sc = scanAt(t), a = smooth(between(t, 124.2, 124.45)) * (1 - smooth(between(t, 128.3, 128.9)));
  const y = boardRowY(sc.row), n = sc.narrow;
  const x0 = lerp(BOARD.x + 26, YOU_AT.x - 18, n), x1 = lerp(BOARD.x + 354, YOU_AT.x + 22, n);
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a;
  g.fillStyle = warm(0.2 + 0.2 * n); rrect(g, x0, y - 8, x1 - x0, 16, 6); g.fill();
  g.strokeStyle = warm(0.75); g.lineWidth = 1.5; g.stroke();
  g.restore();
  if (t >= FOR) {                                           // "for?" → "you"
    const u = between(t, FOR, FOR + 0.45), fade = 1 - smooth(between(t, 128.4, 129.1));
    glow(g, YOU_AT.x, YOU_AT.y, 60, warm(1), 0.8 * fade);
    g.save(); g.globalAlpha = fade;
    setFont(g, 700, 15, FONTS.hand); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = WARM;
    g.fillText('you', YOU_AT.x, YOU_AT.y + 0.5);
    g.strokeStyle = WARM; g.lineWidth = 2.2; g.beginPath(); g.ellipse(YOU_AT.x, YOU_AT.y, 16 + 5 * easeOut(u), 11 + 3 * easeOut(u), -0.1, 0, 7); g.stroke();
    if (u < 1) { g.globalAlpha = fade * (1 - u); g.lineWidth = 3; g.beginPath(); g.arc(YOU_AT.x, YOU_AT.y, 16 + 50 * easeOut(u), 0, 7); g.stroke(); }
    g.restore();
  }
}

// ---------- the break: names flare their windows warm-white ----------
function boardEntry(id) {                                   // where world.js writes a name on the board
  const fl = parseInt(id, 10), side = id.slice(-1);
  return { x: BOARD.x + (side === 'L' ? 56 : 206) + 24, y: boardRowY(11 - fl) };
}
function roomOf(id) {
  const m = /^(\d+)([LR])$/.exec(id);
  if (m && world.roomRect) return world.roomRect(+m[1], m[2]);
  return P.flatRect(parseInt(id, 10), id.slice(-1));
}
const flareAt = u => u < 0 ? 0 : u < 0.08 ? u / 0.08 : Math.exp(-(u - 0.08) / 0.42);   // peaks on the word, fades after
function drawBreak(g, t, cam) {
  if (t < 128.3 || t > 137.6) return;
  for (const [ti, id] of DEF) {
    const r = roomOf(id), who = (world.residentAt && world.residentAt(id)) || { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    const q = between(t, ti - 0.36, ti);                    // a comet from the name on the board to the person
    if (q > 0 && q < 1) {
      const from = boardEntry(id);
      const pt = v => ({ x: lerp(from.x, who.x, smooth(v)), y: lerp(from.y, who.y, v) - 80 * Math.sin(Math.PI * v) });
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const a = pt(Math.max(0, q - 0.05 * (i + 1))), b = pt(Math.max(0, q - 0.05 * i));
        g.strokeStyle = WARM; g.globalAlpha = 0.85 * (1 - i / 8); g.lineWidth = 16 * (1 - i / 9);
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
      g.restore();
      const h = pt(q); glow(g, h.x, h.y, 70, warm(1), 0.95);
    }
    const u = t - ti, f = flareAt(u);
    if (f < 0.01 || !inView(cam, r.x - 40, r.y - 40, r.x + r.w + 40, r.y + r.h + 40)) continue;
    g.save(); g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.3 * f; g.fillStyle = WARM; rrect(g, r.x, r.y, r.w, r.h, 6); g.fill();
    g.globalAlpha = 0.9 * f; g.strokeStyle = WARM; g.lineWidth = 7; g.stroke();
    if (u < 0.7) { g.globalAlpha = 0.8 * (1 - u / 0.7); g.lineWidth = 6; g.beginPath(); g.arc(who.x, who.y, 40 + 260 * easeOut(u / 0.7), 0, 7); g.stroke(); }
    g.restore();
    glow(g, who.x, who.y, 150, warm(1), 0.55 * f);
  }
}
function tagPill(g, x, y, text, p, a, size = 32) {
  if (p <= 0 || a <= 0) return;
  g.save();
  setFont(g, 700, size, FONTS.display);
  const w = g.measureText(text).width + size * 0.8, h = size * 1.45;
  g.translate(x, y + h / 2); g.scale(pop(p), pop(p)); g.translate(0, -h / 2);
  g.globalAlpha = Math.min(1, p * 2) * a;
  g.shadowColor = warm(0.8); g.shadowBlur = 16;
  g.fillStyle = WARM; rrect(g, 0, 0, w, h, h * 0.3); g.fill();
  g.shadowBlur = 0; g.strokeStyle = OUT; g.lineWidth = 3.5; g.stroke();
  g.fillStyle = '#20243A'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(text, size * 0.4, h / 2 + 1);
  g.restore();
}
function windowTags(g, t, cam) {                            // who each flaring window is (screen space)
  if (t < 128.7 || t > 138) return;
  for (const [ti, id] of DEF) {
    const u = t - ti;
    if (u < 0 || u > 1.9) continue;
    const r = roomOf(id), s = toScreen(cam, r.x + 10, r.y + 10);
    tagPill(g, Math.max(20, s.x), Math.max(700, s.y), P.RESIDENTS[id].name, between(t, ti, ti + 0.18), (1 - smooth(between(u, 1.4, 1.9))) * (1 - smooth(between(t, 136.35, 136.75))), 30);
  }
}

// ---------- the bots answer, one per "me" ----------
// "AND ME!" in speech bubbles from upstairs, each with the bot's portrait and name, stacking on the
// right while their names pop onto the directory board in shot.
function botBubbles(g, t) {
  const out = 1 - smooth(between(t, 142.35, 142.65));
  if (out <= 0) return;
  for (const b of BOTS) {
    const p = clamp01((t - b.me + 0.06) / 0.16);
    if (p > 0) bubble(g, t, 736, b.y, b, p, out);
  }
}
function bubble(g, t, cx, cy, b, p, a) {
  g.save(); g.globalAlpha = a;
  g.translate(cx, cy); const k = pop(p); g.scale(k, k);
  setFont(g, 800, 80, FONTS.display, 'condensed'); const w1 = g.measureText('AND ME!').width;
  setFont(g, 700, 30, FONTS.display); const w2 = g.measureText(b.name).width;
  const pw = 116, h = 150, w = pw + Math.max(w1, w2) + 64, x0 = -w / 2, y0 = -h / 2;
  const body = () => rrect(g, x0, y0, w, h, 30);
  const tail = () => { g.beginPath(); g.moveTo(w / 2 - 6, y0 + 34); g.lineTo(w / 2 + 40, y0 - 22); g.lineTo(w / 2 - 44, y0 + 4); g.closePath(); };
  g.shadowColor = warm(0.7); g.shadowBlur = 24;
  g.lineWidth = 7; g.strokeStyle = OUT; body(); g.stroke(); tail(); g.stroke();
  g.shadowBlur = 0; g.fillStyle = WARM; body(); g.fill(); tail(); g.fill();
  // the portrait
  g.save(); rrect(g, x0 + 14, y0 + 14, pw, h - 28, 22); g.clip();
  g.fillStyle = '#E9DDC4'; g.fillRect(x0 + 14, y0 + 14, pw, h - 28);
  const photo = b.id === 'jolly' && IMG && IMG.jollyPhoto;
  if (photo) {
    // Jolly as Muse publishes him (a crop of the official art), not redrawn
    const px = x0 + 14, py = y0 + 14, ph = h - 28, sw = 330, sh = sw * ph / pw;
    g.drawImage(photo, 425, 70, sw, sh, px, py, pw, ph);
  } else {
    try { cast.bot(g, b.id, x0 + 14 + pw / 2, y0 + h - 16, 0.6, { t, wave: 1, lit: 0, shadow: false }); } catch (e) { /* the cast is mid-change */ }
  }
  g.restore();
  g.strokeStyle = 'rgba(14,19,40,0.35)'; g.lineWidth = 2.5; rrect(g, x0 + 14, y0 + 14, pw, h - 28, 22); g.stroke();
  g.textAlign = 'left'; g.textBaseline = 'middle';
  setFont(g, 800, 80, FONTS.display, 'condensed'); g.fillStyle = '#1B1E2E'; g.fillText('AND ME!', x0 + pw + 34, -14);
  setFont(g, 700, 30, FONTS.display); g.fillStyle = '#6A4A2A'; g.fillText(b.name, x0 + pw + 36, 44);
  g.restore();
}

// ---------- your hand, down the chute; the label ----------
const HAND_S = 0.6;                   // a person's hand: about a fifth of Clawd's width
let handCal = null;                   // the pen nib's offset from the arm, measured once from cast.hand
function calibrateHand(s) {
  if (handCal || typeof document === 'undefined') return handCal;
  try {
    const x = document.createElement('canvas').getContext('2d');
    const a = cast.hand(x, 0, 0, s, { rot: 0, arm: 100, reach: 1, holding: 'pen' }), b = cast.hand(x, 0, 0, s, { rot: 0, arm: 300, reach: 1, holding: 'pen' });
    const k = (b.tip.x - a.tip.x) / 200;
    handCal = { k, hx: a.tip.x - 100 * k, hy: a.tip.y };
    if (!Number.isFinite(k) || k <= 0) throw new Error('no tip');
  } catch (e) { handCal = { k: s, hx: 65 * s, hy: 28 * s }; }
  return handCal;
}
const WRITE = [143.44, 144.1];
function labelTextW(g) { g.save(); setFont(g, 700, LABEL.size, FONTS.hand); const w = g.measureText('diags ✓').width; g.restore(); return w; }
function drawLabel(g, t, L, wipe, gl) {
  g.save(); g.translate(L.x, L.y); g.rotate(L.rot); if (L.k) g.scale(L.k, L.k);
  const w = LABEL.w, h = LABEL.h, tw = labelTextW(g), xw = -tw / 2 - 3 + wipe * (tw + 6);
  if (gl > 0) glow(g, 0, 0, 130, 'rgba(255,194,61,1)', 0.75 * gl);   // gold: value, made together
  g.fillStyle = gl > 0 ? `rgb(255,${Math.round(lerp(246, 236, gl))},${Math.round(lerp(226, 190, gl))})` : '#EFE8D8';
  rrect(g, -w / 2, -h / 2, w, h, 2.5); g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.8; g.stroke();
  if (wipe < 1) {                                           // the smudge, gone wherever the pen has been
    g.save(); g.beginPath(); g.rect(xw, -h / 2, w, h); g.clip();
    g.fillStyle = 'rgba(40,40,60,0.45)'; g.beginPath(); g.ellipse(0, 0, 26, 6, 0.1, 0, 7); g.fill();
    setFont(g, 400, 11, FONTS.pixel); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(30,30,50,0.6)'; g.fillText('L??S', 0, 0.5);
    g.restore();
  }
  if (wipe > 0) {                                           // your handwriting
    g.save(); g.beginPath(); g.rect(-w / 2, -h / 2 - 8, xw + w / 2, h + 16); g.clip();
    setFont(g, 700, LABEL.size, FONTS.hand); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = PAL.ink; g.fillText('diags ✓', 0, 1);
    g.restore();
  }
  g.restore();
  return { x: L.x + Math.cos(L.rot) * xw - Math.sin(L.rot) * 3, y: L.y + Math.sin(L.rot) * xw + Math.cos(L.rot) * 3, tw };
}
function labelFlight(t, from) {
  const u = between(t, 145.2, 145.95), e = smoother(u);
  return { x: lerp(from.x, SLOT.x, e), y: lerp(from.y, SLOT.y + 1, e) - 170 * Math.sin(Math.PI * e), rot: lerp(from.rot, 0, e) + Math.PI * 2 * e, k: 1 + 0.3 * Math.sin(Math.PI * e) };
}
function drawLabelAndHand(g, t, st, S, c) {
  const from = () => heldLabelAt(tipsAt(145.2, st, S));
  let L = null, wipe = 0, gl = 0;
  if (t >= 141.25 && t < 145.2 && c.label && c.tips) {
    L = heldLabelAt(c.tips);
    wipe = smooth(between(t, WRITE[0], WRITE[1]));
    gl = smooth(between(t, 144.72, 145.05));
  } else if (t >= 145.2 && t < 145.95) {                   // it flies home, trailing sparks
    const f0 = from();
    L = labelFlight(t, f0); wipe = 1; gl = 1;
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,214,120,0.9)';
    for (let i = 1; i <= 6; i++) { const q = labelFlight(t - i * 0.035, f0); g.globalAlpha = 0.5 * (1 - i / 7); star(g, q.x + 6 * Math.sin(i * 2.1), q.y + 6 * Math.cos(i * 1.7), 7 * (1 - i / 8)); }
    g.restore();
  }
  if (t >= 145.95 && t < 146.6) {                          // and lands in its slot: a flash
    const u = between(t, 145.95, 146.6);
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,214,120,1)'; g.globalAlpha = 1 - u; g.lineWidth = 5 * (1 - u) + 1;
    g.beginPath(); g.arc(SLOT.x, SLOT.y, 30 + 120 * easeOut(u), 0, 7); g.stroke(); g.restore();
    glow(g, SLOT.x, SLOT.y, 120, 'rgba(255,214,120,1)', 0.8 * (1 - u));
  }
  const nib = L ? drawLabel(g, t, L, wipe, gl) : null;
  if (t < 142.9 || t > 145.7) return;
  // your hand: out of the chute, pen to the smudge, writes, rests beside Clawd's nub, goes back up
  const Lh = t < 145.2 && c.tips ? heldLabelAt(c.tips) : from();
  const tw = labelTextW(g), cr = Math.cos(Lh.rot), sr = Math.sin(Lh.rot);
  const onLabel = lx => ({ x: Lh.x + cr * lx - sr * 3, y: Lh.y + sr * lx + cr * 3 });
  let target, reach = 1;
  if (t < WRITE[0]) { target = onLabel(-tw / 2 - 3); target.y -= 10 * (1 - smooth(between(t, 143.3, WRITE[0]))); reach = smoother(between(t, 142.95, 143.35)); }
  else if (t < WRITE[1] && nib) target = { x: nib.x, y: nib.y + 2 * Math.sin(t * 40) };
  else { target = onLabel(lerp(tw / 2 + 3, tw / 2 + 12, smooth(between(t, WRITE[1], 144.4)))); target.y -= 4 * smooth(between(t, WRITE[1], 144.3)); reach = 1 - smoother(between(t, 145.15, 145.6)); }
  if (reach <= 0.002) return;
  const cal = calibrateHand(HAND_S) || { k: HAND_S, hx: 65 * HAND_S, hy: 28 * HAND_S };
  const O = { x: P.CHUTE_MOUTH.x - 6, y: P.CHUTE_MOUTH.y + 7 };
  const D = Math.hypot(target.x - O.x, target.y - O.y), along = Math.sqrt(Math.max(1, D * D - cal.hy * cal.hy));
  const arm = Math.max(10, (along - cal.hx) / cal.k), rot = Math.atan2(target.y - O.y, target.x - O.x) - Math.atan2(cal.hy, along);
  const h = cast.hand(g, O.x, O.y, HAND_S, { rot, arm, reach, holding: 'pen', chalk: 1, t });
  if (gl > 0 && h && h.grip) glow(g, h.grip.x, h.grip.y, 70, 'rgba(255,214,120,1)', 0.6 * gl);
  const touch = smooth(between(t, 144.1, 144.3)) * (1 - smooth(between(t, 145.1, 145.3)));
  if (touch > 0 && c.tips && c.tips.tipR) glow(g, c.tips.tipR.x, c.tips.tipR.y, 45, 'rgba(255,241,184,1)', 0.8 * touch);
}

// ---------- draw ----------
export function draw(g, t, S, st, cam) {
  drawOldBasements(g, t, st, cam, S);
  drawBasement(g, t, st, cam);
  drawBreak(g, t, cam);
  drawScan(g, t);
  const c = drawClawd(g, t, st, S, cam);
  drawLabelAndHand(g, t, st, S, c);
}

// ---------- screen: lyrics, the definition, the credit, the peak, the bots ----------
function kword(g, text, x, y, size, o = {}) {
  g.save();
  setFont(g, o.weight || 800, size, FONTS.display, o.stretch);
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  const k = o.k ?? 1;
  g.translate(x, y); g.scale(k, k); if (o.rot) g.rotate(o.rot);
  g.globalAlpha = o.alpha ?? 1;
  g.fillStyle = 'rgba(5,8,22,0.6)'; g.fillText(text, size * 0.03, size * 0.06);
  g.fillStyle = o.color || PAL.text;
  if (o.glow) { g.shadowColor = o.glowColor || PAL.gold; g.shadowBlur = size * 0.28 * o.glow; }
  g.fillText(text, 0, 0);
  g.restore();
}
function fitSize(g, text, size, maxW, stretch) {
  g.save(); setFont(g, 800, size, FONTS.display, stretch);
  const w = g.measureText(text).width; g.restore();
  return w > maxW ? size * maxW / w : size;
}
function textW(g, text, size, stretch) { g.save(); setFont(g, 800, size, FONTS.display, stretch); const w = g.measureText(text).width; g.restore(); return w; }
function topScrim(g, a, h = 640) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, 'rgba(8,11,28,0.8)'); gr.addColorStop(0.7, 'rgba(8,11,28,0.55)'); gr.addColorStop(1, 'rgba(8,11,28,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, h); g.restore();
}
function definition(g, t) {
  topScrim(g, clamp01((t - 128.72) / 0.15) * clamp01((136.95 - t) / 0.35), 690);
  if (t < LOCKUP) {                                         // one word per hit
    let cur = null; for (const h of HITS) if (t >= h.t - 0.02) cur = h;
    if (!cur) return;
    const i = HITS.indexOf(cur), next = HITS[i + 1], dur = (next ? next.t : LOCKUP) - cur.t;
    const grow = 1 + 0.035 * clamp01((t - cur.t) / dur), two = cur.words.length > 1;
    for (const [w, ws, big] of cur.words) {
      const p = clamp01((t - ws) / 0.13);
      if (p <= 0) continue;
      if (big) kword(g, w, W / 2, two ? 410 : 340, fitSize(g, w, 250, 1000, 'condensed'), { stretch: 'condensed', k: pop(p) * grow, color: PAL.goldHi, glow: 1, rot: (1 - easeOut(p)) * -0.05 });
      else kword(g, w, W / 2, 190, 110, { stretch: 'condensed', k: pop(p) * grow, color: PAL.text });
    }
    return;
  }
  // the definition as one lockup, and "(matters, matters, matters)" stacking under it
  const a = clamp01((t - LOCKUP) / 0.25) * clamp01((136.95 - t) / 0.35);
  const L = fitSize(g, 'IS VALUE TO SOMEONE', 88, 880, 'condensed');
  const ys = [118, 118 + L, 118 + 2.05 * L];
  [['SOFTWARE QUALITY', PAL.text, L], ['IS VALUE TO SOMEONE', PAL.text, L], ['WHO MATTERS', PAL.goldHi, L * 1.1]].forEach(([txt, col, size], i) => {
    const k = pop(clamp01((t - LOCKUP - i * 0.07) / 0.2));
    kword(g, txt, W / 2, ys[i], size, { stretch: 'condensed', k, alpha: a, color: col, glow: i === 2 ? 1 : 0 });
  });
  MATTERS.forEach((m, j) => {
    const p = clamp01((t - m + 0.02) / 0.14);
    if (p <= 0) return;
    const size = L * (0.95 - 0.09 * j);
    kword(g, 'MATTERS', W / 2, ys[2] + L * (0.98 + 0.84 * j), size, { stretch: 'condensed', weight: 700, k: pop(p), alpha: a * (1 - 0.14 * j), color: WARM, glow: 0.8, glowColor: WARM });
  });
}
function credit(g, t) {
  const a = clamp01((t - 128.8) / 0.3) * clamp01((134.55 - t) / 0.3);
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const text = 'after Weinberg · Bach & Bolton · via Ed Pringle';
  setFont(g, 600, 32, FONTS.display);
  const tw = g.measureText(text).width, k = Math.min(1, 820 / tw), w = tw * k + 44, h = 54, x = (W - w) / 2, y = 590;
  g.fillStyle = 'rgba(10,13,32,0.72)'; rrect(g, x, y, w, h, 12); g.fill();
  g.strokeStyle = 'rgba(246,238,220,0.35)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = PAL.paper; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.translate(x + w / 2, y + h / 2 + 1); g.scale(k, 1); g.fillText(text, 0, 0);
  g.restore();
}
// "I'M SOMEONE TOO!": the biggest type in the film, above Clawd and its window.
function peakLine(g, t) {
  const a = clamp01((t - 137.4) / 0.08) * clamp01((139.4 - t) / 0.3);
  if (a <= 0) return;
  topScrim(g, a * 0.85, 790);
  const s1 = fitSize(g, "I'M SOMEONE", 196, 980, 'condensed'), s2 = fitSize(g, 'TOO!', 440, 960, 'condensed');
  const sp = textW(g, ' ', s1, 'condensed') * 0.9, w1 = textW(g, "I'M", s1, 'condensed'), w2 = textW(g, 'SOMEONE', s1, 'condensed');
  const x0 = W / 2 - (w1 + sp + w2) / 2, y1 = 228, y2 = y1 + s1 * 0.5 + s2 * 0.45;
  const words = [["I'M", 137.48, 137.68, x0 + w1 / 2, y1, s1], ['SOMEONE', 137.68, 138.14, x0 + w1 + sp + w2 / 2, y1, s1], ['TOO!', 138.14, 138.9, W / 2, y2, s2]];
  const all = smooth(between(t, 138.14, 138.5));
  for (const [w, on, off, x, y, size] of words) {
    const p = clamp01((t - on) / 0.13);
    if (p <= 0) continue;
    const cur = t >= on && t < off;
    kword(g, w, x, y, size, { stretch: 'condensed', k: pop(p), alpha: a, color: cur || all > 0.5 ? PAL.goldHi : PAL.text, glow: cur ? 1 : all, rot: w === 'TOO!' ? (1 - easeOut(p)) * -0.06 : 0 });
  }
}

let IMG = null;   // S.img, for the official art in the bots' portraits
export function screen(g, t, S, st, cam) {
  IMG = S.img;
  if (t >= 107.0 && t < 128.8) type.band(g, t, S, { y: 1560, size: 64, color: '#F4E7CF', accent: '#FFCF7A' });
  windowTags(g, t, cam);
  if (t >= 128.6 && t < 137.0) definition(g, t);
  credit(g, t);
  peakLine(g, t);
  if (t >= 139.5 && t < 142.7) botBubbles(g, t);
  if (t >= 142.42) type.band(g, t, S, { y: 1560, size: 76, color: PAL.text, accent: PAL.gold });
}
