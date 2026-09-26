// Section C of "Who Lives Here?": the bridge and the break, 106.2–147.56 s (episodes/01-storyboard.md).
//
// Bridge: the lift drops Clawd home and the camera sinks past its basement into the older basements
// (world.js draws the rooms, desks and builders; this file drives them and adds the action). Every
// bar a ripple of habit rises from the oldest builder up through the stack, and Clawd, typing at
// its bench, copies it a beat later: a faint echo. On "throw" the builders lob their code over walls
// painted "USERS: PRODUCT'S JOB"; Clawd's copy is tossing its build into the lift and sending it up.
// Crumpled "who's it for?" notes drift back down and pile up, ignored. On "But" Clawd breaks the
// chain: it picks one out of the drift, reads it, looks up the shaft, and the camera rises to the
// directory board, arriving on "for".
// Break: gold comets leave the board's names and light their windows, one per word, as the camera
// climbs; three more on "matters" as it pulls back; then it dives to the dark basement, where the
// small high window lights for the first time: "I'm someone too!". The bots on the top floor join
// in, one per "me". Your hand comes down the ticket chute to rewrite a smudged fuse-box label so
// Clawd can read it; its nub touches the same label; both glow; Clawd steps into the lift.
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
const CS = 1.2;                      // Clawd's size in the basement and the lift
const L9 = P.floorLevel(9);

// ---------- helpers ----------
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); };
const inout = p => { p = clamp01(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const bump = (t, a, d) => { const p = (t - a) / d; return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
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
const MATTERS = [134.68, 135.62, 136.24];
const LOB = [113.55, 114.25], LOB_END = 114.9;   // the old builders' throw (world st.lob), then back to typing
const CLAWD_THROW = 115.14;                       // Clawd copies it on "wall"
// The bots, one per "me": where the world draws them (their heads, roughly).
const BOTS = [
  { id: 'molty', and: 139.24, me: 139.68, x: 168, y: -3430 },
  { id: 'jolly', and: 140.66, me: 141.02, x: 912, y: -3430 },
  { id: 'hermes', and: 141.92, me: 142.1, x: 222, y: -3790 },
];

// ---------- camera: a C1 path through keys (stop: ease to rest there) ----------
const CAM = [
  [106.2, P.HANDOFF[106.2]],
  [107.3, { x: 540, y: -1250, zoom: 0.56 }],
  [108.3, { x: 540, y: 330, zoom: 1.0, stop: 1 }],          // the lift lands; the floor opens
  [110.0, { x: 540, y: 760, zoom: 1.0 }],                   // Clawd above, the 2010s below
  [111.6, { x: 540, y: 1500, zoom: 1.0 }],                  // the 1990s, the 1970s
  [112.7, { x: 540, y: 1300, zoom: 0.7, stop: 1 }],         // the whole lineage, Clawd on top
  [115.3, { x: 540, y: 1250, zoom: 0.73, stop: 1 }],
  [116.5, { x: 530, y: 300, zoom: 1.3, stop: 1 }],          // home: notes come down the shaft
  [117.3, { x: 525, y: 290, zoom: 1.35, stop: 1 }],
  [119.2, { x: 600, y: 270, zoom: 1.75, stop: 1 }],         // "who's it for?"
  [121.4, { x: 605, y: 262, zoom: 1.82, stop: 1 }],
  [123.3, { x: 565, y: 40, zoom: 1.45, stop: 1 }],          // Clawd looks up the shaft
  [128.3, { x: 230, y: -180, zoom: 2.0, stop: 1 }],         // up to the directory board, on "for"
  [128.8, { x: 260, y: -300, zoom: 1.6 }],
  [129.68, { x: 540, y: -560, zoom: 1.0 }],                 // climb the facade, one name per word
  [130.74, { x: 540, y: -900, zoom: 1.0 }],
  [131.54, { x: 540, y: -1260, zoom: 1.0 }],
  [132.76, { x: 540, y: -1600, zoom: 1.0 }],
  [133.6, { x: 540, y: -1680, zoom: 0.95, stop: 1 }],
  [134.68, { x: 540, y: -1650, zoom: 0.8 }],                // pull back: three more
  [135.62, { x: 540, y: -1700, zoom: 0.64 }],
  [136.24, { x: 540, y: -1640, zoom: 0.56, stop: 1 }],
  [136.95, { x: 265, y: 215, zoom: 1.5, stop: 1 }],         // dive to the dark basement
  [139.1, { x: 262, y: 205, zoom: 1.62, stop: 1 }],         // (the peak: a slow push)
  [139.55, { x: 400, y: -3420, zoom: 1.1, stop: 1 }],       // whip up: Molty
  [140.9, { x: 660, y: -3420, zoom: 1.1 }],                 // Jolly
  [141.95, { x: 420, y: -3600, zoom: 1.05, stop: 1 }],      // Hermes on the roof
  [142.28, { x: 425, y: -3605, zoom: 1.06, stop: 1 }],
  [143.0, { x: 640, y: 210, zoom: 1.2, stop: 1 }],          // fall: the chute, your hand
  [143.4, { x: 660, y: 215, zoom: 1.25, stop: 1 }],
  [144.0, { x: 905, y: 300, zoom: 2.3 }],                   // the label, close
  [145.5, { x: 910, y: 300, zoom: 2.4, stop: 1 }],
  [147.56, P.HANDOFF[147.56]],
];
function path(keys, t) {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0; while (t >= keys[i + 1][0]) i++;
  const [t0, a] = keys[i], [t1, b] = keys[i + 1], h = t1 - t0, s = (t - t0) / h;
  const tan = (j, f) => {
    if (j === 0 || j === n - 1 || keys[j][1].stop) return 0;
    return (f(keys[j + 1][1]) - f(keys[j - 1][1])) / (keys[j + 1][0] - keys[j - 1][0]);
  };
  const s2 = s * s, s3 = s2 * s;
  const herm = f => (2 * s3 - 3 * s2 + 1) * f(a) + (s3 - 2 * s2 + s) * tan(i, f) * h + (-2 * s3 + 3 * s2) * f(b) + (s3 - s2) * tan(i + 1, f) * h;
  return { x: herm(k => k.x), y: herm(k => k.y), zoom: Math.exp(herm(k => Math.log(k.zoom))), rot: 0 };
}
export function camera(t, S) { return path(CAM, t); }

// ---------- state ----------
function liftAt(t) {
  let y, doors = 0;
  if (t < 108.1) y = lerp(L9, FLOOR, inout(between(t, 106.3, 108.1)));
  else if (t < 115.6) y = FLOOR - 14 * bump(t, 108.1, 0.35);
  else if (t < 140.2) y = lerp(FLOOR, L9, inout(between(t, 115.6, 117.2)));
  else y = lerp(L9, FLOOR, inout(between(t, 140.2, 142.6))) - 10 * bump(t, 142.6, 0.3);
  if (t >= 108.3 && t < 115.6) doors = smooth(between(t, 108.3, 108.7)) * (1 - smooth(between(t, 115.22, 115.52)));
  if (t >= 145.7) doors = smooth(between(t, 145.7, 146.1)) * (1 - smooth(between(t, 146.95, 147.42)));
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
  0.16 * smooth(between(t, 106.4, 108)) * (1 - smooth(between(t, 125, 128.6))),
  0.42 * smooth(between(t, 136.3, 136.95)) * (1 - smooth(between(t, 137.48, 138.2))));
const lobAt = t => t >= LOB_END || t < LOB[0] ? 0 : 1.16 * between(t, LOB[0], LOB[1]);

export function state(t, st, S) {
  const b = t < 107.6 ? endOfB(S) : null, k = 1 - smooth(between(t, 106.2, 107.5));
  for (const id of Object.keys(st.flats)) {
    const f = st.flats[id], bf = b && b.flats && b.flats[id];
    f.gold = bf ? (bf.gold || 0) * k : 0;
    if (bf && bf.lit !== undefined) f.lit = lerp(1, bf.lit, k);
  }
  for (const [ti, id] of DEF) if (st.flats[id]) st.flats[id].gold = Math.max(st.flats[id].gold, smooth(between(t, ti - 0.04, ti + 0.3)));
  st.flats['10L'].gold = Math.max(st.flats['10L'].gold, st.bots.molty);
  st.flats['10R'].gold = Math.max(st.flats['10R'].gold, st.bots.jolly);
  st.flats.roof.gold = Math.max(st.flats.roof.gold, st.bots.hermes);
  st.lift = liftAt(t);
  if (b && b.lift && b.lift.style && b.lift.style !== 'plain' && t < 107) { st.lift.from = b.lift.style; st.lift.styleP = smooth(between(t, 106.2, 106.9)); }
  if (b && b.fuseNote) st.fuseNote = b.fuseNote;
  st.strata = smooth(between(t, 107.9, 111.3)) * (1 - smooth(between(t, 124.5, 126.5)));
  st.lob = lobAt(t);
  st.dim = dimAt(t);
  st.cutWords = 0.75 * smooth(between(t, 120.8, 121.8)) * (1 - smooth(between(t, 126, 128)));
  st.bulbSwing = 0.09 * Math.sin(t * 1.6) * (t < 128.8 ? 1 : 0.4);
  // The board lights one name per word, in its own order; off camera it catches up with plan.js.
  let lit = 0; for (const [ti] of DEF) lit += smooth(between(t, ti, ti + 0.15));
  st.directoryLit = lerp(lit / BOARD_ORDER, 1, smooth(between(t, 140, 141.5)));
  if (t > 127.3 && t < 128.7) st.directoryGlint = between(t, 127.4, 128.5);
  st.fuseLabel = smooth(between(t, 144.5, 144.62));
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
// The echo: every bar a ripple rises from the oldest builder; Clawd copies it this long after.
const ECHO_LAG = 0.54;
function echoAccent(S, t) {
  if (t < 109.2 || t > 113.9) return 0;
  const bp = S.barPos(t - ECHO_LAG), bt = t - ECHO_LAG - (bp - Math.floor(bp)) * S.bar;
  return bump(t, bt + ECHO_LAG, 0.42);
}
function clawdAt(t, st, S) {
  const c = { x: 540, y: FLOOR, s: CS, note: null, ghost: 0, inLift: false };
  const p = c.pose = { t, mood: 'determined', look: 0, lookY: 0, mouth: mouthAt(S, t), hop: 0, squash: 0, lit: 0, rot: 0 };
  const typing = () => { p.armL = -0.3 + 0.24 * Math.sin(t * 21); p.armR = -0.3 + 0.24 * Math.sin(t * 21 + 1.9); p.look = -0.6; p.lookY = 0.45; };
  if (t < 108.75) {                                         // riding the lift down
    c.y = st.lift.y; c.inLift = true; p.mood = t < 108.1 ? 'surprise' : 'determined';
    const fall = bump(t, 106.6, 1.4);
    p.hop = 0.3 * fall; if (fall > 0) p.armL = p.armR = 1.1 * fall;
  } else if (t < 109.7) walk(c, t, 108.75, 109.65, 540, 290);
  else if (t < 117.32) {                                    // at the bench: the echo
    c.x = 290; typing();
    const ac = echoAccent(S, t);
    if (ac > 0) { p.armL += 1.1 * ac; p.armR += 0.7 * ac; p.hop = 0.12 * ac; c.ghost = ac; }
    const wind = smooth(between(t, CLAWD_THROW - 0.3, CLAWD_THROW)), rel = smooth(between(t, CLAWD_THROW, CLAWD_THROW + 0.25));
    if (t > CLAWD_THROW - 0.3 && t < CLAWD_THROW + 0.55) {
      p.armL = p.armR = lerp(2.2 * wind, 0.5, rel); p.look = 0.8; p.lookY = -0.2; c.ghost = Math.max(c.ghost, bump(t, CLAWD_THROW - 0.3, 0.85));
    }
    if (t > 116.2) p.lookY = 0.55;                          // ignoring the notes, like they did
  } else if (t < 118.25) {                                  // "But": it stops, and goes to the notes
    c.x = 290; p.mood = 'surprise'; p.look = 0.8; p.emote = '!'; p.emoteK = smooth(between(t, 117.32, 117.45));
    walk(c, t, 117.55, 118.25, 290, 615);
  } else if (t < 118.6) {                                   // picks one out of the drift
    c.x = 615; p.mood = 'surprise'; p.look = 0.5; p.lookY = 0.8;
    p.squash = 0.22 * bump(t, 118.25, 0.35); p.armR = -0.7 * bump(t, 118.25, 0.35);
    c.note = { open: 0 };
  } else if (t < 121.5) {                                   // reads it: "who's it for?"
    c.x = 615; p.mood = t < 119.3 ? 'surprise' : 'worried'; p.look = 0; p.lookY = t < 119.3 ? 0.3 : -0.55;
    p.armL = p.armR = 1.9 * smooth(between(t, 119.0, 119.4));
    c.note = { open: smooth(between(t, 118.6, 119.3)), up: smooth(between(t, 119.0, 119.45)) };
  } else if (t < 126.4) {                                   // looks up the shaft
    walk(c, t, 121.5, 122.1, 615, 560);
    if (t >= 122.1) { p.look = 0; p.lookY = -1; p.rot = -0.1 * smooth(between(t, 122.1, 122.6)); p.mood = 'hope'; }
    p.armL = -0.6; c.note = { open: 1, side: 1 };
  } else if (t < 136.9) {                                   // (off camera) back towards the bench; sits
    walk(c, t, 126.4, 127.8, 560, 360); p.mood = 'sad'; c.note = { open: 1, side: 1 };
    if (t > 127.8) { p.squash = 0.14; p.lookY = 0.7; p.look = 0.2; p.armL = p.armR = -0.7; }
  } else if (t < 139.2) {                                   // the peak
    c.x = 360; c.note = { open: 1, side: 1, glow: smooth(between(t, 137.6, 138.3)) };
    const up = smooth(between(t, 137.62, 137.95));
    p.squash = 0.14 * (1 - up); p.lookY = lerp(0.7, -1, up); p.look = lerp(0.2, -0.55, up);
    p.rot = -0.13 * up; p.armL = p.armR = lerp(-0.7, -0.2, up);
    p.mood = t < 137.55 ? 'sad' : t < 138.14 ? 'surprise' : 'beam';
    if (t >= 137.55 && t < 138.14) { p.emote = '!'; p.emoteK = smooth(between(t, 137.55, 137.68)); }
    if (t >= 138.14) { p.emote = 'sparkle'; p.emoteK = smooth(between(t, 138.14, 138.3)); }
    p.lit = smooth(between(t, 137.55, 138.25));
    p.tear = 0.7 * smooth(between(t, 137.9, 138.3));
    p.hop = 0.5 * bump(t, 138.14, 0.42);
    p.armL = p.armR = p.armL + 1.6 * bump(t, 138.14, 0.7);
  } else if (t < 145.95) {                                  // the fuse box
    walk(c, t, 139.5, 141.3, 360, FUSE_X);
    if (t >= 141.3) {
      p.look = 0.35; p.lookY = -1; p.rot = -0.05;
      p.mood = t < 143.6 ? 'worried' : t < 144.72 ? 'hope' : 'beam';
      if (t < 143.62) { p.emote = '?'; p.emoteK = 1; }
      const touch = smooth(between(t, 144.45, 144.72)) * (1 - smooth(between(t, 145.6, 145.9)));
      if (touch > 0) p.armR = lerp(0, 1.25, touch);
      p.lit = smooth(between(t, 144.72, 145.1)) * (1 - 0.4 * smooth(between(t, 146.2, 147.3)));
    }
  } else {                                                  // into the lift
    walk(c, t, 145.95, 146.85, FUSE_X, 540);
    p.lit = 0.6 * (1 - smooth(between(t, 146.4, 147.3)));
    p.mood = 'hope';
    // in the car: turn and brace for the ride up, exactly as section D picks Clawd up at 147.56
    if (t >= 146.85) { c.y = st.lift.y; c.inLift = true; p.mood = 'determined'; p.look = 0.4 * smooth(between(t, 146.85, 147.2)); p.hop = 0.12 * bump(t, 146.95, 0.3); }
  }
  return c;
}
const FUSE_X = 846;                  // where Clawd stands under the fuse box
function drawClawd(g, t, st, S, cam) {
  const c = clawdAt(t, st, S);
  c.tips = null;
  if (!inView(cam, c.x - 220, c.y - 420, c.x + 220, c.y + 60)) return c;
  if (c.pose.lit > 0.01) glow(g, c.x, c.y - 55 * c.s, 200 * c.s, 'rgba(255,194,61,0.9)', 0.5 * c.pose.lit);
  if (c.ghost > 0.01) {                                     // the faint echo of a copied gesture
    g.save(); g.globalAlpha = 0.26 * c.ghost;
    for (const [dx, dy] of [[-18, -10], [-34, -18]]) cast.clawd(g, c.x + dx, c.y + dy, c.s, { ...c.pose, lit: 0, emote: null, shadow: false });
    g.restore();
  }
  c.tips = cast.clawd(g, c.x, c.y, c.s, c.pose);
  if (c.inLift) world.drawLiftFront(g, t, S, st);
  if (c.note) drawHeldNote(g, t, c);
  return c;
}

// ---------- notes and drifts ----------
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
function mound(key, n, halfW, hMax, rMin, rMax) {
  if (MOUND[key]) return MOUND[key];
  const balls = [];
  for (let i = 0; i < n; i++) {
    const u = hash(i * 3.17 + key.length * 11.3) * 2 - 1, v = Math.pow(hash(i * 7.31 + 1.7), 0.8);
    balls.push({ dx: u * halfW, h: hMax * (1 - u * u) * v, r: lerp(rMin, rMax, hash(i * 5.3 + 2.1)), rot: hash(i * 9.1) * 6, seed: i + key.length * 100 });
  }
  balls.sort((a, b) => a.h - b.h);
  return (MOUND[key] = balls);
}
function drift(g, key, cx, floor, count, halfW, hMax, tint = '#E6D8BC') {
  const balls = mound(key, 90, halfW, hMax, 11, 18);
  const n = Math.min(balls.length, Math.floor(count));
  for (let i = n - 1; i >= 0; i--) { const b = balls[i]; crumple(g, cx + b.dx, floor - b.r * 0.8 - b.h, b.r, b.seed, b.rot, tint); }
}

// ---------- the old basements: this file's action over world.js's rooms ----------
// Geometry mirrored from world.js drawStrata (rooms, walls, desks, builders).
const ERA = [[40, 1040], [90, 990], [140, 940]].map(([x0, x1], i) => {
  const y1 = P.STRATA[i].floor, dx = x0 + 150, dy = y1 - 110;
  return { i, x0, x1, y1, floor: y1 - 28, wx0: x1 - 400, wx1: x1 - 40, wy0: y1 - 330, dx, dy, head: [dx + 60, dy - 88], glow: P.STRATA[i].glow,
    drift0: [10, 20, 34][i], hMax: [55, 85, 120][i] };
});
const eraLob = (t, i) => clamp01(lobAt(t) - i * 0.08);
const handAt = (E, lob) => [E.dx + 40 + lob * 60, E.dy - 110 - Math.sin(lob * Math.PI) * 60];
// When each era's bundle leaves the hand (its lob reaches 0.55).
const releaseT = i => LOB[0] + (LOB[1] - LOB[0]) * (0.55 + 0.08 * i) / 1.16;
const FLY = 0.9;
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
function notesFor(i) { const r = releaseT(i); return [0, 1, 2, 3, 4].map(k => [r + 0.85 + k * 0.2 + 0.06 * hash(k + i * 7), k]); }
const NOTE_FALL = 1.5;
function noteAt(E, t, t0, k) {
  const u = t - t0;
  if (u < 0 || u > NOTE_FALL) return null;
  const x0 = E.wx0 + 60 + (E.wx1 - E.wx0 - 120) * hash(k * 3.3 + E.i);
  const land = E.floor - E.hMax * 0.7;
  const up = Math.min(u / 0.28, 1), fall = Math.max(0, (u - 0.28) / (NOTE_FALL - 0.28));
  const y = u < 0.28 ? E.wy0 - 20 - 50 * Math.sin(up * Math.PI / 2) : lerp(E.wy0 - 70, land, fall * fall * 0.35 + fall * 0.65);
  return { x: x0 - 80 * u + 20 * Math.sin(u * 7 + k), y, rot: 0.7 * Math.sin(u * 6 + k), k: 0.55 + 0.45 * up };
}
function drawEra(g, t, E, a, S) {
  if (a < 0.01) return;
  g.save(); g.globalAlpha = a;
  // bundles already over the wall, going down behind it
  const r = releaseT(E.i), fl = between(t, r, r + FLY);
  const h0 = handAt(E, 0.55), wc = (E.wx0 + E.wx1) / 2;
  const arc = (h0[1] - 14 + E.wy0 + 30) / 2 - (E.wy0 - 100);   // apex in the gap above the wall
  const bpos = q => ({ x: lerp(h0[0], wc + 20, q), y: lerp(h0[1] - 14, E.wy0 + 30, q) - arc * Math.sin(Math.PI * q), k: 1 - 0.5 * smooth((q - 0.55) / 0.3) });
  // (the part behind the wall is simply not drawn: it has gone over)
  // the drift of ignored notes at the wall's foot, in front of it
  let landed = 0; for (const [t0] of notesFor(E.i)) if (t > t0 + NOTE_FALL) landed++;
  drift(g, 'era' + E.i, wc - 20, E.floor, E.drift0 + landed * 1.5, 165, E.hMax);
  // the bundle in the hand, then in flight
  const lob = eraLob(t, E.i);
  if (lob > 0.01 && lob < 0.55) { const h = handAt(E, lob); bundle(g, h[0], h[1] - 14, E.i, -0.3 + lob); }
  if (fl > 0 && fl < 0.72) { const q = bpos(fl); bundle(g, q.x, q.y, E.i, fl * 6, q.k); }
  // notes coming back over the wall
  for (const [t0, k] of notesFor(E.i)) { const n = noteAt(E, t, t0, k); if (n) sheet(g, n.x, n.y, 1.25 * n.k, n.rot, k + E.i); }
  // the echo: every bar a ripple rises from the oldest builder up through the generations
  const lag = (2 - E.i) * 0.18;
  if (t > 109 && t < 116) {
    const bp = S.barPos(t - lag), bt = t - lag - (bp - Math.floor(bp)) * S.bar;
    const events = [bt + lag];
    if (Math.abs(t - releaseT(E.i)) < 1.4) events.push(releaseT(E.i));
    for (const te of events) {
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
const PILE = { cx: 700, halfW: 78, h: 60 };
const SHAFT_NOTES = [0, 1, 2, 3, 4, 5].map(k => [116.3 + k * 0.15 + 0.05 * hash(k * 5.1), 505 + 70 * hash(k * 2.7)]);
const SHAFT_FALL = 1.1;
function shaftNote(t, t0, x0) {
  const u = t - t0;
  if (u < 0 || u > SHAFT_FALL) return null;
  const f = u / SHAFT_FALL;
  return { x: lerp(x0, PILE.cx - 30 + 60 * hash(x0), smooth(f)) + 16 * Math.sin(u * 7 + x0), y: lerp(-420, FLOOR - 40, f), rot: 0.8 * Math.sin(u * 6 + x0) };
}
function drawBasement(g, t, st, cam) {
  if (!inView(cam, 0, -500, 1080, 460)) return;
  let landed = 0; for (const [t0] of SHAFT_NOTES) if (t > t0 + SHAFT_FALL) landed++;
  const pa = 1 - smooth(between(t, 146.3, 147.3));        // (section D has no drift: let it go while Clawd walks)
  if (pa > 0) { g.save(); g.globalAlpha = pa; drift(g, 'home', PILE.cx, FLOOR, 9 + landed - (t >= 118.35 ? 1 : 0), PILE.halfW, PILE.h); g.restore(); }
  for (const [t0, x0] of SHAFT_NOTES) { const n = shaftNote(t, t0, x0); if (n) sheet(g, n.x, n.y, 1.3, n.rot, x0); }
  // Clawd's own "over the wall": its build, tossed into the lift, which takes it away
  const u = between(t, CLAWD_THROW, CLAWD_THROW + 0.32);
  if (t > CLAWD_THROW && t < 117.4) {
    const x = lerp(330, 540, u), y = t < CLAWD_THROW + 0.32 ? lerp(FLOOR - 120, FLOOR - 36, u) - 120 * Math.sin(Math.PI * u) : st.lift.y - 36;
    bundle(g, x, y, 3, u * 4);
  }
  // the window's light, the first time
  const wl = st.baseWindow;
  if (wl > 0.001) {
    const Wd = P.BASE_WINDOW;
    g.save(); g.globalCompositeOperation = 'lighter';
    const gr = g.createLinearGradient(Wd.x + Wd.w / 2, Wd.y, 420, FLOOR);
    gr.addColorStop(0, `rgba(255,214,120,${0.5 * wl})`); gr.addColorStop(0.6, `rgba(255,194,61,${0.2 * wl})`); gr.addColorStop(1, `rgba(255,194,61,${0.08 * wl})`);
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(Wd.x + 6, Wd.y + Wd.h - 4); g.lineTo(Wd.x + Wd.w - 4, Wd.y + 6); g.lineTo(560, FLOOR); g.lineTo(250, FLOOR); g.closePath(); g.fill();
    for (let i = 0; i < 26; i++) {                          // dust in the beam
      const v = (hash(i * 3.7) + t * (0.03 + 0.03 * hash(i))) % 1, w = hash(i * 9.2);
      const y = lerp(Wd.y + 40, FLOOR - 20, v), x = lerp(lerp(Wd.x + 20, 260, v), lerp(Wd.x + Wd.w, 550, v), w) + 8 * Math.sin(t * 1.3 + i);
      g.globalAlpha = wl * (0.4 + 0.5 * hash(i * 1.3)) * Math.sin(Math.PI * v);
      g.fillStyle = '#FFF1B8'; g.beginPath(); g.arc(x, y, 2 + 2.5 * hash(i * 4.1), 0, 7); g.fill();
    }
    g.restore();
    glow(g, Wd.x + Wd.w / 2, Wd.y + Wd.h / 2, 190, 'rgba(255,214,120,1)', 0.5 * wl);
    glow(g, 400, FLOOR - 6, 200, 'rgba(255,194,61,1)', 0.32 * wl);
    const bu = between(t, 137.48, 138.3);                   // a ring as it lights
    if (bu > 0 && bu < 1) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = PAL.goldHi; g.lineWidth = 7 * (1 - bu); g.globalAlpha = 1 - bu;
      g.beginPath(); g.arc(Wd.x + Wd.w / 2, Wd.y + Wd.h / 2, 60 + 260 * easeOut(bu), 0, 7); g.stroke(); g.restore();
    }
    const D = P.DIRECTORY, bl = bump(t, 137.6, 1.6);        // Clawd's new line on the board glints
    if (bl > 0) glow(g, D.x + 110, D.y + 60 + 10 * 16, 150, 'rgba(255,214,120,1)', 0.45 * bl);
  }
  const sp = between(t, 138.14, 139.3);                     // sparkles on "too!"
  if (sp > 0 && sp < 1) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 10; i++) {
      const a = hash(i * 2.3) * Math.PI * 2, r = 70 + 110 * easeOut(sp) * (0.6 + 0.4 * hash(i));
      g.globalAlpha = (1 - sp) * 0.9; g.fillStyle = PAL.goldHi;
      star(g, 360 + Math.cos(a) * r, FLOOR - 70 + Math.sin(a) * r * 0.8, 9 * (1 - sp * 0.5));
    }
    g.restore();
  }
}
// The note Clawd picks out of the drift: a ball, then opened, then held up to read.
function drawHeldNote(g, t, c) {
  const n = c.note, s = c.s;
  let x = c.x + 30 * s, y = c.y - 48 * s, k = 0.6;
  if (n.up) { x = lerp(x, c.x - 4 * s, n.up); y = lerp(y, c.y - 178 * s, n.up); k = lerp(k, 1.35, n.up); }
  if (n.side) { x = c.x + 70 * s; y = c.y - 40 * s; k = 0.6; }
  if (n.open < 0.02) { crumple(g, x, y, 16, 3, t * 3); return; }
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(n.side ? 0.35 : -0.04);
  const o = n.open, jag = (1 - o) * 26, w = lerp(30, 150, o), h = lerp(30, 104, o);
  if (n.glow) glow(g, 0, 0, 170, 'rgba(255,214,120,1)', 0.5 * n.glow);
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

// ---------- the break: names light their windows ----------
const BOARD_ROWS = ['roof', 10, 9, 8, 7, 6, 5, 4, 3, 2, 'B'];
function boardEntry(id) {                                   // where world.js writes a name on the board
  const fl = parseInt(id, 10), i = BOARD_ROWS.indexOf(fl), side = id.slice(-1);
  return { x: P.DIRECTORY.x + (side === 'L' ? 56 : 206) + 24, y: P.DIRECTORY.y + 60 + i * 16 };
}
function roomOf(id) {
  const m = /^(\d+)([LR])$/.exec(id);
  if (m && world.roomRect) return world.roomRect(+m[1], m[2]);
  return P.flatRect(parseInt(id, 10), id.slice(-1));
}
function drawBreak(g, t, st, cam) {
  if (t < 128.3) return;
  for (const [ti, id] of DEF) {
    const r = roomOf(id), who = (world.residentAt && world.residentAt(id)) || { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    const from = boardEntry(id);
    const q = between(t, ti - 0.36, ti);                    // a comet from the board to the person
    if (q > 0 && q < 1) {
      const pt = v => ({ x: lerp(from.x, who.x, smooth(v)), y: lerp(from.y, who.y, v) - 80 * Math.sin(Math.PI * v) });
      g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const a = pt(Math.max(0, q - 0.05 * (i + 1))), b = pt(Math.max(0, q - 0.05 * i));
        g.strokeStyle = PAL.gold; g.globalAlpha = 0.85 * (1 - i / 8); g.lineWidth = 16 * (1 - i / 9);
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
      g.restore();
      const h = pt(q); glow(g, h.x, h.y, 70, 'rgba(255,241,184,1)', 0.95);
    }
    if (t < ti || !inView(cam, r.x - 40, r.y - 40, r.x + r.w + 40, r.y + r.h + 40)) continue;
    const u = between(t, ti, ti + 0.6);                     // the burst as the window turns gold
    if (u < 1) {
      g.save(); g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 1 - u; g.strokeStyle = PAL.goldHi; g.lineWidth = 10 * (1 - u) + 2;
      rrect(g, r.x - 10 * u, r.y - 10 * u, r.w + 20 * u, r.h + 20 * u, 10); g.stroke();
      g.globalAlpha = 0.8 * (1 - u); g.beginPath(); g.arc(who.x, who.y, 40 + 260 * easeOut(u), 0, 7); g.stroke();
      g.restore();
    }
    nameTag(g, r.x + 14, r.y + 12, P.RESIDENTS[id].name, between(t, ti, ti + 0.18));
  }
  for (const b of BOTS) {                                   // the bots, one per "me"
    const u = between(t, b.me - 0.1, b.me + 0.6);
    if (u <= 0 || u >= 1) continue;
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - u; g.strokeStyle = PAL.goldHi; g.lineWidth = 12 * (1 - u) + 2;
    g.beginPath(); g.arc(b.x, b.y, 50 + 300 * easeOut(u), 0, 7); g.stroke();
    g.fillStyle = PAL.goldHi;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + b.me; star(g, b.x + Math.cos(a) * (80 + 200 * u), b.y + Math.sin(a) * (80 + 200 * u), 10 * (1 - u)); }
    g.restore();
  }
}
function nameTag(g, x, y, text, p) {
  if (p <= 0) return;
  g.save();
  setFont(g, 700, 34, FONTS.display);
  const w = g.measureText(text).width + 28, h = 50;
  g.translate(x, y + h / 2); g.scale(pop(p), pop(p)); g.translate(0, -h / 2);
  g.globalAlpha = Math.min(1, p * 2);
  g.shadowColor = 'rgba(255,194,61,0.8)'; g.shadowBlur = 18;
  g.fillStyle = PAL.gold; rrect(g, 0, 0, w, h, 10); g.fill();
  g.shadowBlur = 0; g.strokeStyle = OUT; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#2A1B05'; g.textBaseline = 'middle'; g.fillText(text, 14, h / 2 + 1);
  g.restore();
}

// ---------- your hand, down the chute, rewriting the fuse label ----------
// world.js draws the fuse box and its smudged label ("L??S"); at st.fuseLabel ≥ 0.5 it draws the
// rewritten "diags ✓". This file draws the writing itself, larger, over the top.
const LBL = { x: 936, y: 302, w: 96, h: 34, text: 'diags ✓', size: 24 };
function penTarget(g, t) {
  g.save(); setFont(g, 700, LBL.size, FONTS.hand);
  const full = g.measureText(LBL.text).width, x0 = LBL.x + (LBL.w - full) / 2, base = LBL.y + LBL.h / 2 + LBL.size * 0.32;
  const wp = between(t, 143.62, 144.5), w = g.measureText(LBL.text.slice(0, Math.floor(LBL.text.length * wp))).width;
  g.restore();
  const end = { x: LBL.x + LBL.w - 8, y: LBL.y + LBL.h - 6 };
  if (t < 143.45) return { ...end, reach: inout(between(t, 142.8, 143.45)) };
  if (t < 143.62) { const u = smooth(between(t, 143.45, 143.62)); return { x: lerp(end.x, x0, u), y: end.y - 4 + 5 * Math.sin(u * 20), reach: 1 }; }
  if (t < 144.55) return { x: x0 + w, y: base - 8 + 4 * Math.sin(t * 40), reach: 1 };
  return { x: lerp(x0 + full, end.x, smooth(between(t, 144.55, 144.8))), y: end.y, reach: 1 - inout(between(t, 145.75, 146.45)) };
}
let handCal = null;                   // the pen nib's offset from the arm, measured once from cast.hand
function calibrateHand(s) {
  if (handCal || typeof document === 'undefined') return handCal;
  try {
    const x = document.createElement('canvas').getContext('2d');
    const a = cast.hand(x, 0, 0, s, { rot: 0, arm: 100, reach: 1, holding: 'pen' }), b = cast.hand(x, 0, 0, s, { rot: 0, arm: 300, reach: 1, holding: 'pen' });
    const k = (b.tip.x - a.tip.x) / 200;
    handCal = { k, hx: a.tip.x - 100 * k, hy: a.tip.y };
    if (!Number.isFinite(k) || k <= 0) throw new Error('no tip');
  } catch (e) { handCal = { k: 1, hx: 60, hy: 0 }; }
  return handCal;
}
function drawLabel(g, t) {
  if (t < 143.45) return;
  const gl = smooth(between(t, 144.72, 145.1)) * (1 - 0.5 * smooth(between(t, 146, 147.4)));
  if (gl > 0) glow(g, LBL.x + LBL.w / 2, LBL.y + LBL.h / 2, 150, 'rgba(255,194,61,1)', 0.75 * gl);
  g.save();
  g.fillStyle = gl > 0 ? `rgb(${Math.round(lerp(246, 255, gl))},${Math.round(lerp(238, 232, gl))},${Math.round(lerp(220, 170, gl))})` : PAL.paper;
  g.strokeStyle = OUT; g.lineWidth = 3; rrect(g, LBL.x, LBL.y, LBL.w, LBL.h, 4); g.fill(); g.stroke();
  // the last of the smudge, wiped
  const sm = 1 - smooth(between(t, 143.45, 143.62));
  if (sm > 0) { g.globalAlpha = sm; g.fillStyle = 'rgba(40,40,60,0.5)'; g.beginPath(); g.ellipse(LBL.x + LBL.w / 2, LBL.y + LBL.h / 2, 34, 8, 0.1, 0, 7); g.fill(); g.globalAlpha = 1; }
  g.restore();
  g.save(); setFont(g, 700, LBL.size, FONTS.hand);
  const full = g.measureText(LBL.text).width; g.restore();
  type.handwrite(g, LBL.text, LBL.x + (LBL.w - full) / 2, LBL.y + LBL.h / 2 + LBL.size * 0.32, LBL.size, between(t, 143.62, 144.5), PAL.ink);
}
function drawYourHand(g, t, cam) {
  if (t < 142.8 || t > 146.5) return null;
  const pen = penTarget(g, t);
  if (pen.reach <= 0.002) return null;
  const s = 1.05, cal = calibrateHand(s) || { k: 1, hx: 60, hy: 0 };
  const O = { x: P.CHUTE_MOUTH.x + 4, y: P.CHUTE_MOUTH.y + 6 };
  const D = Math.hypot(pen.x - O.x, pen.y - O.y), along = Math.sqrt(Math.max(1, D * D - cal.hy * cal.hy));
  const arm = Math.max(20, (along - cal.hx) / cal.k), rot = Math.atan2(pen.y - O.y, pen.x - O.x) - Math.atan2(cal.hy, along);
  const gl = smooth(between(t, 144.72, 145.1)) * (1 - smooth(between(t, 145.7, 146.2)));
  const h = cast.hand(g, O.x, O.y, s, { rot, arm, reach: pen.reach, holding: 'pen', chalk: 1, t });
  if (gl > 0 && h && h.grip) glow(g, h.grip.x, h.grip.y, 110, 'rgba(255,214,120,1)', 0.55 * gl);
  return h;
}

// ---------- draw ----------
export function draw(g, t, S, st, cam) {
  drawOldBasements(g, t, st, cam, S);
  drawBasement(g, t, st, cam);
  drawBreak(g, t, st, cam);
  drawLabel(g, t);
  const c = drawClawd(g, t, st, S, cam);
  drawYourHand(g, t, cam);
  // Clawd's nub meets your hand on the same label
  const touch = smooth(between(t, 144.62, 144.8)) * (1 - smooth(between(t, 145.6, 145.9)));
  if (touch > 0) {
    const tip = c.tips && c.tips.tipR && Number.isFinite(c.tips.tipR.x) ? c.tips.tipR : { x: LBL.x + 20, y: LBL.y + LBL.h };
    glow(g, tip.x, tip.y, 70, 'rgba(255,241,184,1)', touch);
  }
}

// ---------- screen: lyrics, the definition, the credit ----------
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
function topScrim(g, a, h = 640) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, 'rgba(8,11,28,0.78)'); gr.addColorStop(0.7, 'rgba(8,11,28,0.5)'); gr.addColorStop(1, 'rgba(8,11,28,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, h); g.restore();
}
function definition(g, t) {
  topScrim(g, clamp01((t - 128.72) / 0.15) * clamp01((136.95 - t) / 0.35), 700);
  if (t < 133.56) {
    let cur = null; for (const h of HITS) if (t >= h.t - 0.02) cur = h;
    if (!cur) return;
    const i = HITS.indexOf(cur), next = HITS[i + 1], dur = (next ? next.t : 133.56) - cur.t;
    const grow = 1 + 0.035 * clamp01((t - cur.t) / dur), two = cur.words.length > 1;
    for (const [w, ws, big] of cur.words) {
      const p = clamp01((t - ws) / 0.13);
      if (p <= 0) continue;
      if (big) kword(g, w, W / 2, two ? 420 : 350, fitSize(g, w, 330, 1000, 'condensed'), { stretch: 'condensed', k: pop(p) * grow, color: PAL.goldHi, glow: 1, rot: (1 - easeOut(p)) * -0.05 });
      else kword(g, w, W / 2, 200, 130, { stretch: 'condensed', k: pop(p) * grow, color: PAL.text });
    }
    return;
  }
  // the whole definition as one lockup, held; each "(matters)" pulses it
  const a = clamp01((t - 133.56) / 0.25) * clamp01((136.95 - t) / 0.35);
  const lines = [['SOFTWARE QUALITY', PAL.text], ['IS VALUE TO SOMEONE', PAL.text], ['WHO MATTERS', PAL.goldHi]];
  const size = fitSize(g, 'IS VALUE TO SOMEONE', 118, 940, 'condensed');
  lines.forEach(([txt, col], i) => {
    let k = pop(clamp01((t - 133.56 - i * 0.07) / 0.2));
    if (i === 2) for (const m of MATTERS) k *= 1 + 0.12 * bump(t, m, 0.35);
    kword(g, txt, W / 2, 170 + i * size * 1.02, i === 2 ? size * 1.12 : size, { stretch: 'condensed', k, alpha: a, color: col, glow: i === 2 ? 1 : 0 });
  });
  for (const m of MATTERS) {
    const u = between(t, m, m + 0.7);
    if (u > 0 && u < 1) kword(g, 'MATTERS', W / 2 + 120, 170 + 2 * size * 1.02, size * 1.12, { stretch: 'condensed', k: 1 + 0.55 * easeOut(u), alpha: 0.55 * (1 - u) * a, color: PAL.gold, glow: 1 });
  }
}
function credit(g, t) {
  const a = clamp01((t - 128.8) / 0.3) * clamp01((134.7 - t) / 0.3);
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const text = 'after Weinberg · Bach & Bolton · via Ed Pringle';
  setFont(g, 600, 36, FONTS.display);
  const tw = g.measureText(text).width, k = Math.min(1, 860 / tw), w = tw * k + 48, h = 64, x = (W - 140 - w) / 2 + 70, y = 1452;
  g.fillStyle = 'rgba(10,13,32,0.8)'; rrect(g, x, y, w, h, 14); g.fill();
  g.strokeStyle = 'rgba(246,238,220,0.45)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = PAL.paper; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.translate(x + w / 2, y + h / 2 + 1); g.scale(k, 1); g.fillText(text, 0, 0);
  g.restore();
}
function peakLine(g, t) {
  const a = clamp01((t - 137.4) / 0.1) * clamp01((139.32 - t) / 0.18);
  if (a <= 0) return;
  const words = [["I'M", 137.48, 137.68], ['SOMEONE', 137.68, 138.14], ['TOO!', 138.14, 138.84]];
  const size = 124;
  g.save(); setFont(g, 800, size, FONTS.display, 'condensed');
  const sp = g.measureText(' ').width, ws = words.map(w => g.measureText(w[0]).width);
  g.restore();
  let x = W / 2 - (ws.reduce((s, w) => s + w, 0) + sp * 2) / 2;
  const allGold = smooth(between(t, 138.14, 138.5));
  words.forEach(([w, on, off], i) => {
    const p = clamp01((t - on) / 0.13);
    if (p > 0) {
      const cur = t >= on && t < off + 0.1;
      kword(g, w, x + ws[i] / 2, 1440, size, { stretch: 'condensed', k: pop(p), alpha: a, color: cur || allGold > 0.5 ? PAL.goldHi : PAL.text, glow: cur ? 1 : allGold });
    }
    x += ws[i] + sp;
  });
}
function andMe(g, t, cam) {
  const a = clamp01((142.62 - t) / 0.2);
  for (const b of BOTS) {
    if (t < b.and - 0.02) continue;
    const s = toScreen(cam, b.x, b.y), x = Math.max(210, Math.min(760, s.x));
    const pa = clamp01((t - b.and) / 0.12), pm = clamp01((t - b.me) / 0.12);
    kword(g, 'AND', x - 96, s.y - 120, 70, { stretch: 'condensed', k: pop(pa), alpha: a, color: PAL.text });
    if (pm > 0) kword(g, 'ME!', x + 74, s.y - 128, 118, { stretch: 'condensed', k: pop(pm), alpha: a, color: PAL.goldHi, glow: 1, rot: (1 - easeOut(pm)) * 0.08 });
  }
}
// Motion blur on the fast camera moves, from copies of the finished frame.
let snap = null;
function motionBlur(g, t) {
  const d = 0.012, a = camera(t - d), b = camera(t + d), z = (a.zoom + b.zoom) / 2;
  const vx = (b.x - a.x) / (2 * d) * z, vy = (b.y - a.y) / (2 * d) * z, v = Math.hypot(vx, vy);
  const L = Math.min(300, v / 30);
  if (!(L >= 20) || typeof document === 'undefined') return;
  const c = g.canvas, k = c.width / W;
  if (!snap || snap.width !== c.width || snap.height !== c.height) { snap = document.createElement('canvas'); snap.width = c.width; snap.height = c.height; }
  const sg = snap.getContext('2d'); sg.clearRect(0, 0, snap.width, snap.height); sg.drawImage(c, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const n = 4, ux = vx / v * L * k, uy = vy / v * L * k;
  for (let i = 1; i <= n; i++) { g.globalAlpha = 1 / (i + 1); const f = i / n - 0.55; g.drawImage(snap, -ux * f, -uy * f); }
  g.restore();
}
function vignette(g, t) {
  const a = 0.38 * smooth(between(t, 106.6, 108.5)) * (1 - smooth(between(t, 124, 128.5)));
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const gr = g.createRadialGradient(W / 2, 820, 380, W / 2, 820, 1250);
  gr.addColorStop(0, 'rgba(20,12,4,0)'); gr.addColorStop(1, 'rgba(20,12,4,0.85)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}

export function screen(g, t, S, st, cam) {
  motionBlur(g, t);
  vignette(g, t);
  if (t >= 107.0 && t < 128.8) type.band(g, t, S, { y: 1500, size: 64, color: '#F4E7CF', accent: '#FFCF7A' });
  if (t >= 128.6 && t < 137.0) definition(g, t);
  credit(g, t);
  peakLine(g, t);
  if (t >= 139.2 && t < 142.65) andMe(g, t, cam);
  if (t >= 142.42) type.band(g, t, S, { y: 1470, size: 80, color: PAL.text, accent: PAL.gold });
}
