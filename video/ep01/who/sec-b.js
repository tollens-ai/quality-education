// Section B of "Who Lives Here?" (50.5–106.2 s): verse 2, the gap, pre-chorus 2 and chorus 2.
//
// Verse 2: the lift carries Clawd down the tower, one life per line. Each flat turns gold on the
// answer half of its line and the camera pushes in on its price (the world draws the served action
// from st.flats[id].served): the demo's facade on bare studs, verse 1's vault bolted over the
// Okafors' door, Sam asleep at 09:00, Nana's one button, Ade's dark screen that speaks. Then the
// lobby's courier bot takes only its own parcel from the neighbours' lockers, the basement fuse box,
// and the (whoa): Clawd looks up at the gold zigzag it rode past, then at the ticket, FOR still
// blank. Pre-chorus 2 rockets back up to your door, where Clawd asks in writing for the first time:
// a "FOR: ___?" slip under your door. No answer yet. Chorus 2: the hook lines play the whole tower
// as a light organ; each "or" line swings the camera between named lives, one going gold as
// another dims.
import { smooth, easeOut, between, lerp, clamp01, W, H } from '../../lib/stage.js';
import * as P from './plan.js';
import * as cast from './cast.js';
import * as type from './type.js';
import * as world from './world.js';

export const range = [50.5, 106.2];

const FL = P.floorLevel;
const SH = P.SHAFT;
const hash = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const bump = (t, a, up, hold, down) => smooth(between(t, a, a + up)) * (1 - smooth(between(t, a + up + hold, a + up + hold + down)));
const inOut = p => { p = clamp01(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };

// ---------- the verse-2 stops, keyed to the sung words ----------
// q: the question's first word, a: the answer's first word (gold starts), pay: the answer's payoff
// word (gold full), end: the line's last word. sv: keyframes for the world's `served` (each
// resident's own action), shaped so the price lands on the answer and holds while the camera is in
// on it. price: that push-in, with the room clear of the lyric band. cam: [arrive, push from,
// pushed in, leave].
const STOPS = [
  { id: '8L', k: 8, side: 'L', q: 51.00, a: 52.16, pay: 52.44, end: 53.06, cam: [51.4, 52.05, 52.6, 53.2],
    sv: [[51.0, 0], [52.16, 0.45], [52.3, 0.55], [52.85, 0.95], [53.3, 1]], price: { x: 196, y: FL(8) - 130, zoom: 2.1 } },
  { id: '7R', k: 7, side: 'R', q: 53.38, a: 54.72, pay: 55.16, end: 55.78, cam: [53.8, 54.5, 55.05, 55.95],
    sv: [[53.38, 0], [54.72, 0.3], [55.3, 0.8], [56.0, 1]], price: { x: 838, y: FL(7) - 130, zoom: 2.05 } },
  { id: '6L', k: 6, side: 'L', q: 56.10, a: 57.16, pay: 57.84, end: 58.44, cam: [56.5, 57.1, 57.6, 58.3],
    sv: [[56.1, 0], [57.16, 0.3], [57.84, 0.55], [58.44, 1]], price: { x: 190, y: FL(6) - 130, zoom: 1.85 } },
  { id: '5R', k: 5, side: 'R', q: 58.44, a: 60.20, pay: 60.62, end: 61.18, cam: [58.95, 60.0, 60.55, 61.35],
    sv: [[58.44, 0], [59.7, 0.12], [60.2, 0.33], [60.55, 0.5], [60.65, 0.56], [61.05, 0.8], [61.4, 1]], price: { x: 922, y: FL(5) - 130, zoom: 2.1 } },
  { id: '4L', k: 4, side: 'L', q: 61.64, a: 62.62, pay: 63.34, end: 63.72, cam: [61.95, 62.45, 62.95, 63.9],
    sv: [[61.64, 0], [62.0, 0.02], [62.45, 0.25], [62.9, 0.4], [63.1, 0.5], [63.4, 0.62], [64.0, 1]], price: { x: 176, y: FL(4) - 130, zoom: 2.1 } },
  { id: '3R', k: 3, side: 'R', q: 64.32, a: 65.28, pay: 66.08, end: 66.54, cam: [64.5, 65.15, 65.7, 66.6],
    sv: [[64.32, 0], [65.28, 0.35], [66.08, 0.8], [66.6, 1]], price: { x: 905, y: FL(3) - 130, zoom: 2.1 } },
];
function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [ta, a] = keys[i], [tb, b] = keys[i + 1]; if (t < tb) return lerp(a, b, (t - ta) / (tb - ta)); }
  return keys[keys.length - 1][1];
}
const LOBBY = { q: 66.98, a: 68.08, pay: 68.60, end: 69.12 };
const CELLAR = { q: 69.74, a: 70.76, pay: 71.28, end: 71.58 };
const ASCENT = [76.54, 77.95];      // basement → your floor
// Clawd at standard size, as section A draws it at 50.5 (about 120 wide, 90 tall). Section C draws it
// at 1.2, so the size eases up while the chorus pull-out makes it tiny, where the change can't be seen.
const CL_S = 1;
const clawdScale = t => CL_S + 0.2 * smooth(between(t, 83.3, 84.3));
// At your door (the world puts door, letterbox and bell in a narrow strip beside the shaft), Clawd
// stands just left of it and asks in writing: a "FOR: ___?" slip, shown, then slid under the door.
const ASK_X = P.DOOR.x - 44;
const SLIP = { pop: [78.2, 78.38], down: [78.74, 79.0], under: [79.02, 79.36] };
const CRASH = 82.96;                // chorus 2 lands

// The lift's floor y over time: holds at each stop, short drops between lines, one rocket up.
const LIFT = [
  [50.5, FL(8)], [53.15, FL(8)], [53.65, FL(7)], [55.95, FL(7)], [56.45, FL(6)], [58.3, FL(6)], [58.8, FL(5)],
  [61.35, FL(5)], [61.85, FL(4)], [63.9, FL(4)], [64.4, FL(3)], [66.6, FL(3)], [67.15, FL(1)],
  [69.14, FL(1)], [69.72, P.BASE.floor], [ASCENT[0], P.BASE.floor], [ASCENT[1], FL(9)], [106.2, FL(9)],
];
function liftY(t) {
  if (t <= LIFT[0][0]) return LIFT[0][1];
  for (let i = 0; i < LIFT.length - 1; i++) {
    const [ta, a] = LIFT[i], [tb, b] = LIFT[i + 1];
    if (t < tb) return a === b ? a : lerp(a, b, (tb - ta > 1 ? inOut : smooth)((t - ta) / (tb - ta)));
  }
  return LIFT[LIFT.length - 1][1];
}
// Doors: open while parked at a stop.
const DOORS = [[51.05, 53.12], [53.7, 55.92], [56.5, 58.27], [58.85, 61.32], [61.9, 63.87], [64.45, 66.57],
  [67.2, 69.12], [69.77, 76.5], [78.0, 83.9]];
function doorsAt(t) {
  for (const [a, b] of DOORS) if (t >= a && t <= b) return smooth(between(t, a, a + 0.25)) * (1 - smooth(between(t, b - 0.22, b)));
  return 0;
}

// ---------- chorus 2: the light organ ----------
// Each cue sets which lives go gold (and which dim) from its onset until the next cue. dimAt starts
// a dim when the camera gets there, so it's seen; serve drives the world's served action for a
// cue's lives (Sam submits, the Okafors' backup, Nana's big button, Dev's crowd); squint and wait
// put a small bubble on a life that the choice leaves out.
const ORGAN_IDS = ['2L', '2R', '3L', '3R', '4L', '4R', '5L', '5R', '6L', '6R', '7L', '7R', '8L', '8R', '9L'];
const LEFT = ORGAN_IDS.filter(i => i.endsWith('L')), RIGHT = ORGAN_IDS.filter(i => i.endsWith('R'));
const CHECKER = ORGAN_IDS.filter(i => (parseInt(i, 10) + (i.endsWith('L') ? 0 : 1)) % 2 === 0);
const CUES = [
  { t: 84.35, gold: ['2L', '2R'] },                                   // ooh
  { t: 84.69, gold: ['2L', '2R', '5L', '5R'] },                       // ooh
  { t: 85.03, gold: ['2L', '2R', '5L', '5R', '8L', '8R'] },           // ooh
  { t: 85.75, gold: [] },
  { t: 87.09, gold: LEFT },                                           // ahh
  { t: 87.43, gold: RIGHT },                                          // ahh
  { t: 87.77, gold: CHECKER },                                        // ahh
  { t: 88.44, gold: ['8R'], dim: ['4L'], dimAt: 89.12, style: 'fast' },                     // Kai; not Nana
  { t: 89.80, gold: ['7R'], dim: ['8L'], style: 'sturdy', serve: { '7R': 0.8 } },          // the Okafors; not Dev
  { t: 90.64, gold: ['5R'], dim: ['5L'], style: 'cheap' },                                 // Sam; not the launch team
  { t: 91.04, gold: ['8L', '6R'], dim: ['4L'], dimAt: 91.12, squint: '4L', style: 'wow', erupt: '8L', serve: { '8L': 0.45, '6R': 0.6 } },
  { t: 92.44, gold: ['7R'], dim: ['8L'], style: 'keep', serve: { '7R': 0.8 } },            // the Okafors; not Dev
  { t: 93.60, gold: [], organ: true },                                // the repeated hook: flicker on the beat
  { t: 99.30, gold: ['5R', '5L'], style: 'ship', serve: { '5R': 0.35 } },                  // Sam hands in; the launch
  { t: 100.78, gold: ['7R'], dim: ['5R'], dimAt: 100.9, wait: '5R', style: 'polish', serve: { '7R': 0.8, '5R': 0.35 } },
  { t: 102.28, gold: ['4L', '3R'], style: 'plain', serve: { '4L': 0.6, '3R': 0.6 } },      // the quiet lives
  { t: 103.58, gold: ['8L'], style: 'show', serve: { '8L': 0.45 } },
  { t: 105.2, gold: [], end: true },
];
const ORGAN_END = 99.3;

// Beat grid from the score (bars are not perfectly even, so interpolate within each bar).
let BEATS = null;
function beatTimes(S) {
  if (BEATS) return BEATS;
  const bars = S.beats.bars, out = [];
  for (let i = 0; i < bars.length; i++) {
    const a = bars[i].t, b = i + 1 < bars.length ? bars[i + 1].t : a + S.bar;
    for (let j = 0; j < 4; j++) out.push(a + (b - a) * j / 4);
  }
  return (BEATS = out);
}
function beatAt(S, t) {
  const B = beatTimes(S);
  let lo = 0, hi = B.length - 1;
  if (t < B[0]) return { i: -1, t0: B[0] - S.beat };
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (B[m] <= t) lo = m; else hi = m - 1; }
  return { i: lo, t0: B[lo] };
}
// The allocation the organ plays on the beat at t0 (index i). It escalates through the repeated
// hook: a sparse handful per beat, then denser and swinging side to side, then the three "ahh"
// patterns from the first half. Never everyone at once: no setting lights every life.
function organSet(i, t0) {
  if (t0 >= 97.85) return [LEFT, RIGHT, CHECKER][Math.max(0, i) % 3].filter((id, j) => (j + i) % 2 === 0);
  const dense = t0 >= 95.55, side = i % 2 ? 'L' : 'R';
  const set = ORGAN_IDS.filter((id, j) => hash(i * 7.31 + j * 1.77) < (dense ? (id.endsWith(side) ? 0.5 : 0.15) : 0.28));
  if (set.length < 3) set.push(ORGAN_IDS[Math.floor(hash(i + 0.5) * ORGAN_IDS.length)], ORGAN_IDS[Math.floor(hash(i + 0.9) * ORGAN_IDS.length)]);
  return set.slice(0, 5);
}

function cueIndex(t) { let c = -1; for (let i = 0; i < CUES.length; i++) if (t >= CUES[i].t) c = i; return c; }

// Gold and dim for every organ flat at t (chorus 2).
function organAt(t, S) {
  const gold = {}, dim = {}, hit = {}, serve = {};
  for (const id of ORGAN_IDS) { gold[id] = 0; dim[id] = 0; hit[id] = 0; }
  for (let i = 0; i < CUES.length; i++) {
    const c = CUES[i], next = CUES[i + 1];
    if (t < c.t) break;
    const att = smooth(between(t, c.t, c.t + 0.12));
    const rel = next ? 1 - smooth(between(t, next.t, next.t + 0.28)) : 1;
    const env = att * rel;
    if (env <= 0) continue;
    if (c.organ) {
      // on the beat, a different allocation each time
      const b = beatAt(S, Math.min(t, ORGAN_END - 0.01));
      const since = t - b.t0;
      for (const id of organSet(b.i, b.t0)) {
        const v = env * (0.45 + 0.35 * Math.exp(-since * 5));
        gold[id] = Math.max(gold[id], v);
        hit[id] = Math.max(hit[id], Math.exp(-since * 7) * env);
      }
      continue;
    }
    for (const id of c.gold) {
      gold[id] = Math.max(gold[id], env);
      hit[id] = Math.max(hit[id], Math.exp(-(t - c.t) * 5) * rel);
    }
    const dAt = c.dimAt ?? c.t;
    for (const id of c.dim || []) dim[id] = Math.max(dim[id], smooth(between(t, dAt, dAt + 0.3)) * rel);
    for (const [id, v] of Object.entries(c.serve || {})) serve[id] = Math.max(serve[id] || 0, v * smooth(between(t, c.t, c.t + 0.6)) * rel);
  }
  return { gold, dim, hit, serve };
}

// ---------- camera ----------
// Keys interpolate zoom in log space so pull-outs feel even.
function camKeys(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, a] = keys[i], [tb, b] = keys[i + 1];
    if (t < tb) {
      const p = (b.ease || smooth)((t - ta) / (tb - ta));
      return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), p)), rot: lerp(a.rot || 0, b.rot || 0, p) };
    }
  }
  return keys[keys.length - 1][1];
}
// A verse-2 flat framed with the lift beside it (flat centred high, the lyric band below).
const flatCam = (k, side, drift = 0) => ({ x: (side === 'L' ? 318 : 762) + (side === 'L' ? -drift * 14 : drift * 14), y: FL(k) - 32 - drift * 8, zoom: 1.32 + drift * 0.07 });
const stopKeys = s => {
  const [arrive, from, to, leave] = s.cam;
  return [[arrive, flatCam(s.k, s.side)], [from, flatCam(s.k, s.side, 0.3)], [to, { ...s.price, ease: easeOut }], [leave, { ...s.price, zoom: s.price.zoom * 1.04 }]];
};
// The lobby: wide enough for Clawd and the lockers, then in close on the neighbours' names and faces.
const LOBBY_WIDE = { x: 720, y: -150, zoom: 1.5 };
const LOCKER_CAM = { x: 860, y: -130, zoom: 2.45 };
const CELLAR_CAM = { x: 770, y: 280, zoom: 1.42 };
const FUSE_CAM = { x: 880, y: 272, zoom: 1.85 };
const WHOA_WIDE = { x: 540, y: -1240, zoom: 0.52 };
const TICKET_CAM = { x: 540, y: 262, zoom: 2.5 };
const DOOR_CAM = { x: 792, y: FL(9) - 130, zoom: 1.8 };
const BLIND_CAM = { x: 858, y: FL(9) - 160, zoom: 1.9 };
const HOLDUP_CAM = { x: 700, y: FL(9) - 150, zoom: 1.95 };
// Chorus 2: HOOK is the whole tower, with deep sky above the roof for the huge hook. The "or" lines
// frame three floors between the corner marks and the lyric band, so two named lives read at once:
// TOP is floors 6–8 (Kai, Dev, the Okafors, Lily), LOW is 4–6 (Nana, Sam, the launch team), MID is
// 5–7 and BASE 3–5 (Nana, Ade). SHOW tilts up from Dev's floor into the fireworks over the roof.
const HOOK_CAM = { x: 540, y: -2600, zoom: 0.38 };
const floorsCam = (lo, hi, zoom = 0.95) => ({ x: 540, y: P.floorTop(hi) + (960 - 150) / zoom, zoom });
const TOP = floorsCam(6, 8), LOW = floorsCam(4, 6), MID = floorsCam(5, 7), BASE3 = floorsCam(3, 5);
const SHOW_UP = { x: 540, y: -2900, zoom: 0.9 };
const drift = (c, k = 1) => ({ ...c, zoom: c.zoom * (1 + 0.02 * k) });

const KEYS_A = [
  [50.5, P.HANDOFF[50.5]],
  ...STOPS.flatMap(stopKeys),
  [67.3, LOBBY_WIDE], [67.5, { ...LOBBY_WIDE, zoom: 1.53 }], [67.95, { ...LOCKER_CAM, ease: easeOut }],
  [68.85, { ...LOCKER_CAM, zoom: LOCKER_CAM.zoom * 1.03 }], [69.35, LOBBY_WIDE],
  [69.9, CELLAR_CAM], [71.0, FUSE_CAM], [72.5, { ...FUSE_CAM, zoom: 1.92, x: 872 }],
  [73.25, { x: 600, y: 250, zoom: 1.35 }], [74.3, { ...WHOA_WIDE, ease: easeOut }], [74.55, { ...WHOA_WIDE, zoom: 0.53, y: -1220 }],
  [75.3, { ...TICKET_CAM, ease: inOut }], [ASCENT[0], { ...TICKET_CAM, zoom: TICKET_CAM.zoom * 1.03 }],
];
const KEYS_B = [
  [ASCENT[1] + 0.02, DOOR_CAM], [79.5, { ...DOOR_CAM, zoom: 1.84, x: 800 }],
  [80.05, BLIND_CAM], [80.72, { ...BLIND_CAM, zoom: 1.94, x: 864 }],
  [81.25, HOLDUP_CAM], [CRASH, { ...HOLDUP_CAM, zoom: 2.02 }],
  [84.55, { ...HOOK_CAM, ease: easeOut }], [87.85, { ...HOOK_CAM, zoom: 0.385 }],
  // "Fast to run, or sturdy, or cheap? / Wow for a week, or built to keep?": top, low, top, low, top
  [88.38, { ...TOP, ease: easeOut }], [88.88, drift(TOP)],
  [89.2, LOW], [89.52, drift(LOW)],
  [89.8, TOP], [90.36, drift(TOP)],
  [90.62, LOW], [91.52, drift(LOW, 2)],          // WOW's gold rains down past Nana
  [91.86, TOP], [93.35, drift(TOP, 2)],
  [94.0, { ...HOOK_CAM, ease: inOut }], [98.9, { ...HOOK_CAM, zoom: 0.385 }],
  // "Ship it now, or polish it slow? / Does what they need, or steals the show?"
  [99.32, { ...MID, ease: easeOut }], [102.0, drift(MID, 2)],
  [102.36, BASE3], [103.3, drift(BASE3)],
  [103.85, SHOW_UP], [105.1, { ...SHOW_UP, y: SHOW_UP.y - 40, zoom: SHOW_UP.zoom * 1.03 }],
  [106.2, { ...P.HANDOFF[106.2], ease: inOut }],
];

export function camera(t, S) {
  if (t < ASCENT[0]) return camKeys(KEYS_A, t);
  if (t < ASCENT[1] + 0.02) {
    // ride the rocket: the camera tracks the car, pulling back mid-flight, landing on your door
    const p = between(t, ASCENT[0], ASCENT[1] + 0.02), e = smooth(p);
    const base = Math.exp(lerp(Math.log(TICKET_CAM.zoom * 1.03), Math.log(DOOR_CAM.zoom), e));
    const off = lerp(TICKET_CAM.y - P.BASE.floor, DOOR_CAM.y - FL(9), e);
    return { x: lerp(TICKET_CAM.x, DOOR_CAM.x, e), y: liftY(t) + off, zoom: base * (1 - 0.35 * Math.sin(Math.PI * p)), rot: 0.025 * Math.sin(Math.PI * p) };
  }
  const c = camKeys(KEYS_B, t);
  if (t > CRASH && t < 105) {
    // a small push on every downbeat of the chorus
    const b = beatAt(S, t), downbeat = b.i % 2 === 0 ? 1 : 0.5;
    const k = 1 + 0.012 * downbeat * Math.exp(-(t - b.t0) * 9) * smooth(between(t, 84.5, 85)) * (1 - smooth(between(t, 104.4, 105)));
    return { ...c, zoom: c.zoom * k };
  }
  return c;
}

// ---------- state ----------
export function state(t, st, S) {
  const L = st.lift;
  L.y = liftY(t);
  L.doors = doorsAt(t);
  L.style = 'plain'; L.styleP = 0;

  // verse 2: each life turns gold on its answer, and stays gold through the (whoa)
  for (const s of STOPS) {
    const f = st.flats[s.id];
    let served = keyed(s.sv, t);
    let gold = smooth(between(t, s.a, s.pay + 0.1));
    // the rocket back up drains the gold as the car passes each floor; served resets off-camera
    if (t >= ASCENT[0]) {
      const passY = FL(s.k) - 120;
      gold *= 1 - smooth(clamp01((passY - L.y) / 420 + 0.15));
      if (t > 78.4) served = 0;
    }
    if (t < 106.2 && t >= CRASH) { gold = 0; served = 0; }
    f.served = served; f.gold = Math.max(f.gold || 0, gold);
  }
  // the world's own props: the courier's locker door, the neighbours' faces going gold, and your
  // "diags pls" note on the fuse box
  st.lockerOpen = courier(t).open;
  st.lockersGold = smooth(between(t, LOBBY.pay - 0.15, LOBBY.pay + 0.2)) * (1 - smooth(between(t, 76.6, 77.2)));
  if (t > 69.0 && t < 76.6) st.fuseNote = 1;
  if (t > 69.5 && t < 76.6) st.bulbSwing = 0.06 * Math.sin((t - 69.5) * 2.4) * (1 - between(t, 75.5, 76.5));

  // the band stop before the crash: stillness, only the ticket lit
  st.dim = Math.max(st.dim, 0.55 * smooth(between(t, 82.45, 82.7)) * (1 - smooth(between(t, CRASH, CRASH + 0.12))));

  // chorus 2: the facade is the instrument
  if (t >= CRASH) {
    const o = organAt(t, S);
    for (const id of ORGAN_IDS) {
      const f = st.flats[id];
      f.gold = Math.max(f.gold || 0, o.gold[id]);
      f.lit = Math.min(f.lit ?? 1, 1 - 0.72 * o.dim[id]);
      if (o.serve[id]) f.served = Math.max(f.served || 0, o.serve[id]);
    }
    // the car wears each choice as it's sung (as in chorus 1); a cue without one lets it go
    const ci = cueIndex(t);
    let sc = -1;
    for (let i = 0; i <= ci; i++) if (CUES[i].style) sc = i;
    if (sc >= 0) {
      const c = CUES[sc], endT = sc < ci ? CUES[sc + 1].t : Infinity;
      L.style = c.style;
      L.styleP = (c.style === 'plain' ? 0 : 1) * smooth(between(t, c.t, c.t + 0.22)) * (1 - smooth(between(t, endT, endT + 0.3)));
    }
    // the SHOW style lingers into the (go, go, go) and hands back a plain car at 106.2
    if (t >= 105.2) { L.style = 'show'; L.styleP = 1 - smooth(between(t, 105.2, 106.1)); }
  }
}

// ---------- the characters' timelines ----------
// The courier's own locker is the world's middle-row cell (index 7 of its 5 × 3 wall).
const CL = (() => { const L = P.LOCKERS, cw = L.w / 5, ch = L.h / 3; return { x: L.x + 2 * cw + 3, y: L.y + ch + 3, w: cw - 6, h: ch - 6 }; })();
function courier(t) {
  // already at the lockers when we arrive: scans for its own, opens only that one, takes its own
  // parcel, and the door shuts before the neighbours' faces go gold; then it rolls off past the lift
  const x0 = CL.x + CL.w / 2;
  const open = bump(t, 68.0, 0.18, 0.4, 0.2);
  const take = smooth(between(t, 68.3, 68.5));
  const leave = smooth(between(t, 68.95, 69.9));
  return { x: lerp(x0, 250, leave), y: 0, open, take, has: take > 0, reach: bump(t, 68.05, 0.15, 0.3, 0.15), leave, on: t > 66.4 && t < 70.2 };
}

function singing(t, S) {
  const line = S.lineAt(t, 0);
  if (!line) return 0;
  for (const w of line.words) {
    if (w.backing || w.s === null) continue;
    const e = w.e ?? w.s + 0.2;
    if (t >= w.s && t < e + 0.04) return 0.25 + 0.75 * Math.sin(Math.PI * clamp01((t - w.s) / Math.max(0.12, e - w.s)));
  }
  return 0;
}

// Clawd's pose follows the cast's conventions: arms are radians with + raising (0 is straight out,
// omitted means the mood's own), hop 1 is a 46-unit jump, lookY < 0 looks up, and a held ticket is
// the cast's placard (holding: 'ticket', with its own grip, glow and the FOR box's gold ring).
function clawdNow(t, S, st) {
  const car = st.lift.y;
  const pose = { t, mood: 'hope', look: 0, mouth: singing(t, S), emote: null };
  let x = SH.cx, y = car;
  const holdTicket = (k, sc, opts) => {
    if (k <= 0.03) return;
    pose.holding = 'ticket'; pose.itemScale = sc * easeOut(k); pose.fill = {}; pose.ticket = { t, ...opts };
  };

  if (t < 66.9) {
    // riding down: turn to each life, and light up with it when it turns gold
    let s = STOPS[0];
    for (const st2 of STOPS) if (t >= st2.q - 0.45) s = st2;
    const side = s.side === 'L' ? -1 : 1;
    pose.look = side * smooth(between(t, s.q - 0.2, s.q + 0.2)) * (1 - smooth(between(t, s.end + 0.15, s.end + 0.4)));
    const joy = bump(t, s.pay - 0.08, 0.14, 0.12, 0.3);
    pose.mood = t >= s.a ? 'happy' : 'hope';
    pose.hop = 0.55 * joy;
    if (joy > 0) pose.armL = pose.armR = 0.5 + 0.8 * joy;
    pose.emote = t >= s.pay - 0.1 && t < s.end + 0.3 ? 'heart' : null;
    pose.emoteK = smooth(between(t, s.pay - 0.1, s.pay + 0.1)) * (1 - smooth(between(t, s.end, s.end + 0.3)));
    pose.lit = 0.35 * smooth(between(t, s.pay, s.pay + 0.3)) * (1 - smooth(between(t, s.end + 0.2, s.end + 0.6)));
  } else if (t < 69.72) {
    // the lobby: surprise at the bot, delight when the faces stay safe, a wave as it rolls off
    pose.look = 1 - 2 * smooth(between(t, 69.0, 69.4));
    pose.mood = t > LOBBY.pay ? 'happy' : 'surprise';
    if (t <= LOBBY.pay) pose.emote = t > 67.3 ? '!' : null;
    pose.hop = 0.5 * bump(t, LOBBY.pay - 0.05, 0.12, 0.1, 0.25);
    const wave = bump(t, 69.05, 0.15, 0.3, 0.2);
    if (wave > 0) pose.armL = 1.2 * wave + 0.3 * wave * Math.sin(t * 30);
  } else if (t < ASCENT[0]) {
    // the basement: out to the fuse box, read the clear panel, glow a little gold; back to the car,
    // look up at the gold floors, then at the ticket: FOR still blank
    const out = smooth(between(t, 69.9, 70.55)), back = smooth(between(t, 72.55, 73.2));
    x = lerp(SH.cx, 800, out - back);
    y = P.BASE.floor;
    if ((t > 69.9 && t < 70.55) || (t > 72.55 && t < 73.2)) pose.walk = (t - 69.9) * 22;
    pose.look = t < 72.5 ? 0.6 : -0.3;
    pose.mood = t < CELLAR.a ? 'determined' : t < 72.5 ? 'proud' : 'hope';
    if (pose.mood === 'proud') pose.emote = 'sparkle';
    pose.lit = 0.55 * smooth(between(t, CELLAR.pay, CELLAR.pay + 0.3)) * (1 - smooth(between(t, 73.6, 74.4)));
    if (t > 70.5 && t < 72.5) pose.armR = 0.7 * smooth(between(t, 70.6, 70.9));      // nub up to the panel
    pose.hop = 0.4 * bump(t, CELLAR.pay - 0.05, 0.12, 0.1, 0.25);
    if (t > 73.2 && t < 74.6) { pose.look = 0; pose.lookY = -1; pose.emote = null; pose.lit = Math.max(pose.lit, 0.3 * smooth(between(t, 73.2, 73.6))); }
    const hold = smooth(between(t, 74.55, 74.95));
    if (hold > 0) {
      pose.mood = t > 75.15 ? 'sad' : 'hope'; pose.look = 0; pose.lookY = -0.5;
      pose.emote = null;
      holdTicket(hold, 0.62, { who: smooth(between(t, 75.1, 75.4)) });
    }
  } else if (t < ASCENT[1]) {
    // the rocket: braced, the ticket tucked away as it launches
    pose.mood = 'determined';
    holdTicket(1 - smooth(between(t, ASCENT[0], ASCENT[0] + 0.3)), 0.62, {});
    pose.squash = 0.25 * bump(t, ASCENT[0], 0.1, 0.2, 0.3);
  } else if (t < CRASH) {
    // your door: hop out and ask in writing for the first time. Clawd shows the "FOR: ___?" slip,
    // crouches and slides it under your door; waits; nothing comes back. Then it looks up at your
    // shadow on the blind, and holds up the ticket: all it has is your prompt.
    const step = smooth(between(t, 78.08, 78.36));
    x = lerp(SH.cx, ASK_X, step);
    y = FL(9);
    pose.hop = 0.5 * Math.sin(Math.PI * between(t, 78.08, 78.36));
    const show = bump(t, SLIP.pop[0], 0.16, 0.3, 0.15), crouch = bump(t, SLIP.down[0], 0.2, 0.42, 0.2);
    pose.squash = 0.34 * crouch;
    pose.armR = 1.2 * show - 0.25 * crouch;
    pose.look = t < 79.5 ? 0.8 * step : 0.5;
    pose.lookY = t < 79.5 ? 0.35 * crouch - 0.2 * show : 0;
    pose.mood = t < 79.55 ? 'hope' : t < 80.9 ? 'sad' : 'hope';
    if (t > 79.4 && t < 79.75) pose.emote = null;
    if (t > 80.15 && t < 80.85) { pose.look = 0.9; pose.lookY = -0.5; }     // up at your shadow on the blind
    const hold = smooth(between(t, 80.85, 81.2));
    if (hold > 0) {
      pose.look = 0.3; pose.lookY = -0.6;
      holdTicket(hold, 0.56, { glow: smooth(between(t, 81.1, 81.9)) });
    }
  } else {
    // chorus 2: back in the car, riding the light organ, head whipping after the lights
    const back = smooth(between(t, CRASH + 0.05, CRASH + 0.5));
    x = lerp(ASK_X, SH.cx, back);
    y = FL(9);
    if (back > 0 && back < 1) pose.walk = t * 26;
    const b = beatAt(S, t);
    pose.hop = 0.45 * Math.exp(-(t - b.t0) * 8) * smooth(between(t, 84.5, 85)) * (1 - smooth(between(t, 105.2, 105.9)));
    pose.mood = t > 103.6 ? 'beam' : 'surprise';
    if (t > 103.6) pose.emote = 'sparkle';
    const c = CUES[cueIndex(t)];
    const lit = c && c.organ && t < ORGAN_END ? organSet(b.i, b.t0) : c && c.gold;
    if (lit && lit.length) pose.look = lit.reduce((a, id) => a + (id.endsWith('L') ? -1 : 1), 0) / lit.length;
    pose.armL = pose.armR = 0.6 + 1.4 * pose.hop;
  }
  return { x, y, pose };
}

// ---------- drawing ----------
// Each element is drawn on its own, so a missing or broken cast piece costs only that piece. Any
// save() left open by a throw is unwound here, so the canvas state stack stays balanced.
function safe(g, label, fn) {
  const save = g.save, restore = g.restore;
  let depth = 0, err = null;
  g.save = () => { depth++; save.call(g); };
  g.restore = () => { if (depth > 0) { depth--; restore.call(g); } };
  save.call(g);
  try { fn(); } catch (e) { err = e; }
  while (depth > 0) { depth--; restore.call(g); }
  restore.call(g);
  delete g.save; delete g.restore;
  if (err) {
    g.save(); g.setTransform(0.5, 0, 0, 0.5, 0, 0);
    g.fillStyle = '#f55'; g.font = '30px monospace'; g.fillText(`sec-b ${label}: ${String(err.message).slice(0, 50)}`, 40, 2400);
    g.restore();
  }
}

export function draw(g, t, S, st, cam) {
  // (the misfit builds at your door come from section A's drawer, called by main.js before this)
  // chorus 2 light organ: bloom on every hit, beams out of the gold windows
  if (t >= CRASH) safe(g, 'organ', () => drawOrganLight(g, t, S, st, cam));
  if (t > 70.9 && t < 74.5) safe(g, 'fuse', () => drawFuseGlow(g, t));
  if (t > 72.7 && t < 76.0) safe(g, 'shaft', () => drawShaftLight(g, t, st));

  // the courier bot takes only its own parcel
  const cb = courier(t);
  if (cb.on) safe(g, 'courier', () => drawCourier(g, t, cb));

  // the lobby: every neighbour's lock clicks shut as the bot opens only its own
  if (t > 67.9 && t < 69.2) safe(g, 'locks', () => drawLockPulses(g, t));
  // your door: Clawd's first written ask
  if (t > SLIP.pop[0] && t < 80.6) safe(g, 'slip', () => drawSlip(g, t));
  // Ade's phone, big: a dark screen that speaks
  if (t > 65.1 && t < 67.1) safe(g, 'speaks', () => drawSpeaks(g, t));

  // Clawd (and the ticket it holds up)
  const c = clawdNow(t, S, st);
  if (t > ASCENT[0] - 0.05 && t < ASCENT[1] + 0.25) safe(g, 'speed', () => drawSpeedLines(g, t, cam));
  safe(g, 'clawd', () => cast.clawd(g, c.x, c.y, clawdScale(t), c.pose));
  if (riding(t) && world.drawLiftFront) safe(g, 'lift front', () => world.drawLiftFront(g, t, S, st, {}));
  // verse 1's vault, the misfit that fits: a glowing copy drops onto the Okafors' door
  if (t > 54.3 && t < 105.4) safe(g, 'vault echo', () => drawVaultEcho(g, t));

  // fireworks: WOW erupts out of the demo flat and its gold rains down the tower; SHOW bursts over the roof
  if (t > 90.9 && t < 93.4) safe(g, 'erupt', () => { drawEruption(g, t, '8L', 91.04); drawEruption(g, t, '8L', 91.8); });
  if (t > 91.0 && t < 92.2) safe(g, 'gold rain', () => drawGoldRain(g, t));
  if (t >= CRASH) safe(g, 'bubbles', () => drawCueBubbles(g, t));
  if (t > 103.5) safe(g, 'fireworks', () => drawFireworks(g, t));
}

// Clawd is inside the car (so the car's glass and posts go over it) except in the basement walk and
// at your door.
const riding = t => !(t > 69.85 && t < 73.25) && !(t > 78.05 && t < CRASH + 0.5);

// The Okafors: a warm, working copy of verse 1's vault (the original stays at your door, powered
// down, until the final chorus) drops down the tower on "Make it" and bolts on over their door on
// "last", exactly as it sat over yours. It stays, glowing, through chorus 2's STURDY and KEEP.
const VAULT_AT = { x: P.DOOR.x + P.DOOR.w / 2, y: FL(7), s: 0.8 };
function drawVaultEcho(g, t) {
  const fall = smooth(between(t, 54.35, 54.72)), land = 54.72;
  const fade = 1 - smooth(between(t, 104.6, 105.3));
  const y = t < land ? lerp(FL(9), VAULT_AT.y, fall * fall) : VAULT_AT.y;
  const p = t < land ? 1 : 0.35 + 0.65 * clamp01((t - land) / 0.44);
  g.save();
  g.globalAlpha = fade * (t < land ? 0.85 : 1);
  // warm light behind it, brightest as it bolts on
  g.save(); g.globalCompositeOperation = 'lighter';
  const hot = 0.35 + 0.5 * bump(t, land, 0.1, 0.4, 0.6);
  const gr = g.createRadialGradient(VAULT_AT.x - 16, y - 70, 10, VAULT_AT.x - 16, y - 70, 170);
  gr.addColorStop(0, `rgba(255,214,110,${0.5 * hot})`); gr.addColorStop(1, 'rgba(255,194,61,0)');
  g.fillStyle = gr; g.fillRect(VAULT_AT.x - 190, y - 240, 340, 340);
  if (t < land) {   // a trail as it falls
    for (let i = 1; i <= 5; i++) { g.fillStyle = `rgba(255,214,110,${0.14 * (1 - i / 6)})`; g.fillRect(VAULT_AT.x - 70, y - 134 - i * 60, 116, 60); }
  }
  g.restore();
  cast.build(g, 'vault', VAULT_AT.x, y, VAULT_AT.s, { p, powered: 1, t, spin: 0.6 * Math.sin(t * 0.8) });
  g.restore();
}

// Each neighbour's lock clicks, gold, one after another out from the courier's own open door.
function drawLockPulses(g, t) {
  const L = P.LOCKERS, cw = L.w / 5, ch = L.h / 3;
  g.save();
  for (let i = 0; i < 15; i++) {
    if (i === 7) continue;     // the courier's own
    const c = i % 5, r = Math.floor(i / 5), x = L.x + c * cw + 3, yy = L.y + r * ch + 3, w = cw - 6;
    const d = Math.hypot(c - 2, r - 1), t0 = 68.08 + d * 0.07;
    const k = bump(t, t0, 0.08, 0.1, 0.35);
    if (k <= 0.01) continue;
    const lx = x + w - 13, ly = yy + 40;
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = `rgba(255,214,110,${0.9 * k})`; g.lineWidth = 3;
    g.beginPath(); g.arc(lx, ly, 8 + 16 * k, 0, 7); g.stroke();
    g.globalCompositeOperation = 'source-over';
    // the padlock, big for a moment
    g.save(); g.translate(lx, ly); g.scale(1 + 0.9 * k, 1 + 0.9 * k);
    g.fillStyle = P.PAL.gold; g.strokeStyle = P.PAL.outline; g.lineWidth = 1.6;
    g.beginPath(); g.roundRect(-5, -2, 10, 9, 1.5); g.fill(); g.stroke();
    g.strokeStyle = P.PAL.gold; g.lineWidth = 2; g.beginPath(); g.arc(0, -2, 3.5, Math.PI, 0); g.stroke();
    g.restore();
  }
  g.restore();
}

// "FOR: ___?", in Clawd's hand: popped up beside the door to be read, then down to the gap under the
// door, flattened, and slid through, gone. The gap glows with your light once it's through.
function drawSlip(g, t) {
  const D = P.DOOR, floorY = FL(9);
  const pop = smooth(between(t, SLIP.pop[0], SLIP.pop[1]));
  const down = smooth(between(t, SLIP.down[0], SLIP.down[1])), under = smooth(between(t, SLIP.under[0], SLIP.under[1]));
  // the gap under your door, lit from inside
  const gapGlow = bump(t, SLIP.under[0], 0.2, 0.5, 0.5);
  g.save();
  g.fillStyle = '#05060C'; g.fillRect(D.x + 4, floorY - 7, D.w - 8, 7);
  if (gapGlow > 0.01) { g.fillStyle = `rgba(255,224,160,${0.9 * gapGlow})`; g.fillRect(D.x + 6, floorY - 5, D.w - 12, 3); }
  g.restore();
  if (t > SLIP.under[1] + 0.02 || pop <= 0.01) return;
  const hx = ASK_X + 96, hy = floorY - 150;                 // held up, beside the door
  const gx = D.x - 10 + under * 96, gy = floorY - 4;         // flat on the floor, sliding into the gap
  const x = lerp(hx, gx, down), y = lerp(hy, gy, down);
  const sx = pop * (1 - 0.15 * down), sy = pop * lerp(1, 0.16, down);
  g.save();
  if (under > 0) { g.beginPath(); g.rect(x - 200, y - 200, D.x + 6 - (x - 200), 400); g.clip(); }   // what's under the door is hidden
  g.translate(x, y); g.rotate(lerp(-0.07, 0, down)); g.scale(sx, sy);
  g.lineWidth = 3.5; g.strokeStyle = P.PAL.outline; g.fillStyle = '#F6EEDC';
  g.beginPath(); g.roundRect(-58, -34, 116, 68, 6); g.fill(); g.stroke();
  g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillStyle = '#C8553D'; g.font = `800 26px ${P.FONTS.display}`; g.fillText('FOR:', -48, -2);
  g.strokeStyle = 'rgba(27,37,83,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(18, 12); g.lineTo(44, 12); g.stroke();
  g.fillStyle = P.PAL.ink; g.font = `700 34px ${P.FONTS.hand}`; g.fillText('?', 22, -2);
  g.restore();
}

// Ade: the phone, big, and nothing on its screen, because the screen was never the point: it speaks.
function drawSpeaks(g, t) {
  const k = easeOut(smooth(between(t, 65.22, 65.5))) * (1 - smooth(between(t, 66.75, 67.0)));
  if (k <= 0.01) return;
  const R = world.roomRect ? world.roomRect(3, 'R') : { x: 756, y: P.floorTop(3) + 26, w: 312, h: 334 };
  const floor = R.y + R.h, px = R.x + 262, py = floor - 204;
  const O = P.PAL.outline;
  g.save();
  // a leader from Ade's own phone
  g.strokeStyle = `rgba(255,255,255,${0.4 * k})`; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(R.x + 166, floor - 158); g.lineTo(px - 46 * k, py + 40 * k); g.stroke();
  g.translate(px, py); g.scale(k, k);
  g.lineWidth = 4; g.strokeStyle = O;
  g.fillStyle = '#15161F'; g.beginPath(); g.roundRect(-44, -78, 88, 156, 14); g.fill(); g.stroke();
  g.fillStyle = '#05060A'; g.beginPath(); g.roundRect(-36, -66, 72, 128, 7); g.fill();
  // a gold speaker on the dark glass, and its sound
  g.fillStyle = P.PAL.gold; g.strokeStyle = O; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-22, -10); g.lineTo(-10, -10); g.lineTo(4, -24); g.lineTo(4, 20); g.lineTo(-10, 6); g.lineTo(-22, 6); g.closePath(); g.fill(); g.stroke();
  for (let i = 0; i < 3; i++) {
    const u = (t * 1.3 + i / 3) % 1;
    g.strokeStyle = `rgba(255,214,110,${1 - u})`; g.lineWidth = 4;
    g.beginPath(); g.arc(4, -2, 12 + u * 30, -0.9, 0.9); g.stroke();
  }
  g.restore();
  // what it says, over Ade's head
  const bk = easeOut(smooth(between(t, 65.5, 65.75))) * (1 - smooth(between(t, 66.75, 67.0)));
  if (bk <= 0.01) return;
  const bx = R.x + 114, by = floor - 282;
  g.save(); g.translate(bx, by); g.scale(bk, bk);
  g.fillStyle = '#FFFFFF'; g.strokeStyle = O; g.lineWidth = 3.5;
  g.beginPath(); g.roundRect(-96, -28, 192, 56, 18); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(10, 27); g.lineTo(26, 46); g.lineTo(30, 27); g.fillStyle = '#FFFFFF'; g.fill(); g.stroke();
  g.fillStyle = '#FFFFFF'; g.fillRect(12, 22, 16, 7);
  g.fillStyle = P.PAL.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `700 26px ${P.FONTS.display}`; g.fillText('“Bus 23: 2 min”', 0, 1);
  g.restore();
}

// WOW: the demo's gold spills down the tower's left side, past the group chat, the launch team and
// Nana's window.
function drawGoldRain(g, t) {
  const dt = t - 91.06;
  if (dt < 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const glare = Math.exp(-dt * 5);
  const gl = g.createLinearGradient(0, FL(7) - 200, 0, FL(6));
  gl.addColorStop(0, `rgba(255,236,190,${0.55 * glare})`); gl.addColorStop(1, 'rgba(255,214,110,0)');
  g.fillStyle = gl; g.fillRect(0, FL(7) - 200, 470, FL(6) - FL(7) + 200);
  g.lineCap = 'round';
  for (let i = 0; i < 80; i++) {
    const d = dt - hash(i * 3.7) * 0.5;
    if (d < 0 || d > 0.9) continue;
    const x = 20 + hash(i * 1.9) * 430 + 20 * Math.sin(i + d * 6);
    const y0 = FL(7) - 300 * hash(i * 5.3), v = 700 + 500 * hash(i * 2.9);
    const y = y0 + v * d + 1500 * d * d, yt = y0 + v * (d - 0.05) + 1500 * (d - 0.05) * (d - 0.05);
    const a = (1 - d / 0.9) * (0.6 + 0.4 * hash(i));
    g.strokeStyle = i % 3 ? `rgba(255,200,90,${a})` : `rgba(255,248,220,${a})`;
    g.lineWidth = 4 + 3 * hash(i * 2.1);
    g.beginPath(); g.moveTo(x, Math.min(y, yt)); g.lineTo(x, y); g.stroke();
  }
  g.restore();
}

// Small bubbles on lives a choice leaves out: Nana squints at WOW's glare; Sam waits while the
// Okafors' build is polished.
function drawCueBubbles(g, t) {
  for (const c of CUES) {
    const kind = c.squint ? 'squint' : c.wait ? 'wait' : null;
    if (!kind) continue;
    const id = c.squint || c.wait, t0 = (c.dimAt ?? c.t) + 0.05;
    const k = easeOut(smooth(between(t, t0, t0 + 0.2))) * (1 - smooth(between(t, t0 + 0.95, t0 + 1.15)));
    if (k <= 0.01) continue;
    const r = world.residentAt ? world.residentAt(id) : null;
    if (!r) continue;
    const x = r.x + (id.endsWith('L') ? 58 : -58), y = r.y - 70;
    g.save(); g.translate(x, y); g.scale(k * 1.25, k * 1.25);
    g.fillStyle = '#FFFFFF'; g.strokeStyle = P.PAL.outline; g.lineWidth = 3.5;
    g.beginPath(); g.ellipse(0, 0, 38, 27, 0, 0, 7); g.fill(); g.stroke();
    const tx = id.endsWith('L') ? -24 : 24;
    g.beginPath(); g.moveTo(tx * 0.5, 22); g.lineTo(tx * 1.2, 40); g.lineTo(tx, 18); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, 0, 36, 25, 0, 0, 7); g.fill();
    g.strokeStyle = P.PAL.ink; g.lineWidth = 4.5; g.lineCap = 'round'; g.lineJoin = 'round';
    if (kind === 'squint') {
      g.beginPath(); g.moveTo(-20, -9); g.lineTo(-8, 0); g.lineTo(-20, 9); g.stroke();
      g.beginPath(); g.moveTo(20, -9); g.lineTo(8, 0); g.lineTo(20, 9); g.stroke();
    } else {
      g.fillStyle = P.PAL.ink;
      for (let j = 0; j < 3; j++) { const on = ((t - t0) * 3 - j) % 3 < 1.6; g.globalAlpha = on ? 1 : 0.3; g.beginPath(); g.arc(-15 + j * 15, 2, 5, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    }
    g.restore();
  }
}

// "neat!": a soft gold glow off the fuse box onto Clawd (the builders count too).
function drawFuseGlow(g, t) {
  const F = P.FUSE, lit = smooth(between(t, CELLAR.pay, CELLAR.pay + 0.4)) * (1 - smooth(between(t, 73.4, 74.4)));
  if (lit <= 0.01) return;
  g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(F.x + 10, F.y + 240, 10, F.x + 10, F.y + 240, 230);
  gr.addColorStop(0, `rgba(255,194,61,${0.32 * lit})`); gr.addColorStop(1, 'rgba(255,194,61,0)');
  g.fillStyle = gr; g.fillRect(F.x - 240, F.y + 20, 480, 440);
}

// The (whoa): light from the gold lives above spills down the shaft onto Clawd's upturned face.
function drawShaftLight(g, t, st) {
  const a = smooth(between(t, 72.8, 73.5)) * (1 - smooth(between(t, 75.2, 75.9)));
  if (a <= 0.01) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const top = FL(8) - 300, bot = P.BASE.floor;
  const gr = g.createLinearGradient(0, top, 0, bot);
  gr.addColorStop(0, `rgba(255,194,61,${0.05 * a})`); gr.addColorStop(0.55, `rgba(255,194,61,${0.16 * a})`); gr.addColorStop(1, `rgba(255,214,110,${0.3 * a})`);
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(SH.x0 + 20, top); g.lineTo(SH.x1 - 20, top); g.lineTo(SH.x1 + 30, bot); g.lineTo(SH.x0 - 30, bot); g.closePath(); g.fill();
  // a warm pool where Clawd stands
  const pool = g.createRadialGradient(SH.cx, bot - 60, 10, SH.cx, bot - 60, 220);
  pool.addColorStop(0, `rgba(255,214,110,${0.35 * a})`); pool.addColorStop(1, 'rgba(255,194,61,0)');
  g.fillStyle = pool; g.fillRect(SH.cx - 220, bot - 280, 440, 300);
  g.restore();
}

function drawSpeedLines(g, t, cam) {
  const p = between(t, ASCENT[0], ASCENT[1]);
  const v = Math.sin(Math.PI * p);
  if (v < 0.05) return;
  g.save();
  g.globalCompositeOperation = 'lighter';
  const top = cam.y - H / 2 / cam.zoom, span = H / cam.zoom;
  for (let i = 0; i < 26; i++) {
    const x = SH.x0 - 380 + hash(i * 3.1) * (SH.x1 - SH.x0 + 760);
    const len = (160 + 420 * hash(i * 5.7)) * v;
    const y = top + ((hash(i * 9.2) * span + t * 3000 * (0.6 + hash(i))) % span);
    const gr = g.createLinearGradient(x, y, x, y + len);
    gr.addColorStop(0, 'rgba(255,217,163,0)'); gr.addColorStop(1, `rgba(255,217,163,${0.35 * v})`);
    g.strokeStyle = gr; g.lineWidth = 3 + 5 * hash(i * 1.3);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + len); g.stroke();
  }
  g.restore();
}

function drawCourier(g, t, cb) {
  // it scans the wall for its own locker only: a thin green beam, then a tick on that one door
  const scan = bump(t, 67.6, 0.15, 0.3, 0.15);
  if (scan > 0.01) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const sweep = CL.x - 60 + 60 * smooth(between(t, 67.6, 67.9));
    const gr = g.createLinearGradient(cb.x, -100, sweep, CL.y + CL.h / 2);
    gr.addColorStop(0, `rgba(124,255,181,${0.45 * scan})`); gr.addColorStop(1, `rgba(124,255,181,${0.1 * scan})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(cb.x - 8, -96); g.lineTo(sweep - 34, CL.y + 6); g.lineTo(sweep + 34, CL.y + CL.h - 6); g.closePath(); g.fill();
    g.restore();
  }
  const tick = bump(t, 67.86, 0.1, 0.22, 0.12);
  if (tick > 0.01) {
    g.save(); g.globalAlpha = tick; g.strokeStyle = '#7CFFB5'; g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round';
    const tx = CL.x + CL.w / 2, ty = CL.y + CL.h / 2 - 6;
    g.beginPath(); g.moveTo(tx - 18, ty); g.lineTo(tx - 5, ty + 13); g.lineTo(tx + 20, ty - 14); g.stroke(); g.restore();
  }
  // its own parcel: out of the locker (covering the world's copy once taken) and onto its head
  const px0 = CL.x + CL.w / 2, py0 = CL.y + CL.h - 22;
  if (cb.take > 0 && cb.open > 0.01) {
    const dw = CL.w * Math.cos(cb.open * 1.35), x0 = Math.max(CL.x + dw, px0 - 20);
    g.fillStyle = '#141826'; g.fillRect(x0, py0 - 18, px0 + 20 - x0, 36);
  }
  const hop = cb.leave > 0 && cb.leave < 1 ? Math.abs(Math.sin(t * 18)) * 0.4 : 0;
  if (typeof cast.bot === 'function') cast.bot(g, 'courier', cb.x, 0, 1, { t, wave: 0, lit: cb.has ? 0.4 : 0, hop, reach: cb.reach, flip: cb.leave > 0 });
  else courierFallback(g, t, cb.x, hop);
  if (cb.has) {
    const e = easeOut(cb.take), bob = cb.leave > 0 ? 4 * Math.sin(t * 18) : 0;
    drawParcel(g, lerp(px0, cb.x - 4, e), lerp(py0, -116, e) + bob - Math.sin(Math.PI * cb.take) * 30, 0.9 + 0.1 * e);
  }
}

// A plain courier bot, drawn only if the cast has no bot() yet: a boxy body on one wheel, a visor.
function courierFallback(g, t, x, hop) {
  g.save(); g.translate(x, -Math.abs(hop) * 14);
  g.lineWidth = 5; g.strokeStyle = P.PAL.outline;
  g.fillStyle = '#4FB39A'; g.beginPath(); g.roundRect(-34, -92, 68, 70, 12); g.fill(); g.stroke();
  g.fillStyle = '#10243A'; g.beginPath(); g.roundRect(-24, -80, 48, 22, 8); g.fill();
  g.fillStyle = '#7CFFB5'; g.fillRect(-14, -73, 8, 8); g.fillRect(6, -73, 8, 8);
  g.fillStyle = '#2B3350'; g.beginPath(); g.arc(0, -12, 12, 0, 7); g.fill(); g.stroke();
  g.restore();
}
function drawParcel(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.lineWidth = 5; g.strokeStyle = P.PAL.outline; g.fillStyle = '#C98E55';
  g.beginPath(); g.roundRect(-30, -22, 60, 44, 5); g.fill(); g.stroke();
  g.fillStyle = '#E8C48F'; g.fillRect(-4, -22, 8, 44);
  // its label is a little bot face, not a person's
  g.fillStyle = P.PAL.paper; g.fillRect(8, -16, 18, 14);
  g.fillStyle = P.PAL.ink; g.fillRect(12, -12, 3, 4); g.fillRect(19, -12, 3, 4);
  g.restore();
}

// Chorus 2: the tower as an instrument. Each hit blooms, and gold light spills out of the windows.
function drawOrganLight(g, t, S, st, cam) {
  const o = organAt(t, S);
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (const id of ORGAN_IDS) {
    const gv = o.gold[id], hv = o.hit[id];
    if (gv < 0.02 && hv < 0.02) continue;
    const k = parseInt(id, 10), side = id.endsWith('L') ? 'L' : 'R';
    const r = P.flatRect(k, side);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    // bloom around the window
    const rad = r.w * (0.75 + 0.35 * hv);
    const gr = g.createRadialGradient(cx, cy, r.h * 0.2, cx, cy, rad);
    gr.addColorStop(0, `rgba(255,214,110,${0.13 * gv + 0.18 * hv})`);
    gr.addColorStop(1, 'rgba(255,194,61,0)');
    g.fillStyle = gr; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    // a beam out into the night, away from the shaft: nested wedges give it a soft edge
    const dir = side === 'L' ? -1 : 1, ex = side === 'L' ? r.x : r.x + r.w;
    const len = 900 * (0.5 + 0.5 * Math.max(gv, hv)), base = 0.06 * gv + 0.1 * hv;
    for (const [wk, ak] of [[1, 0.45], [0.62, 0.7], [0.3, 1]]) {
      const spread = (110 + 170 * hv) * wk, open = r.h * 0.34 * (0.5 + 0.5 * wk);
      const bg = g.createLinearGradient(ex, cy, ex + dir * len, cy);
      bg.addColorStop(0, `rgba(255,196,92,${base * ak})`); bg.addColorStop(0.55, `rgba(255,180,70,${base * ak * 0.4})`); bg.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = bg;
      g.beginPath(); g.moveTo(ex, cy - open); g.lineTo(ex + dir * len, cy - spread - 50); g.lineTo(ex + dir * len, cy + spread - 50); g.lineTo(ex, cy + open); g.closePath(); g.fill();
    }
    // the hit itself: a flash inside the window
    if (hv > 0.02) { g.fillStyle = `rgba(255,241,184,${0.2 * hv})`; g.fillRect(r.x, r.y, r.w, r.h); }
  }
  g.restore();
}

// Sparks pouring out of a flat's window (WOW).
function drawEruption(g, t, id, t0) {
  const k = parseInt(id, 10), side = id.endsWith('L') ? 'L' : 'R', r = P.flatRect(k, side);
  const dt = t - t0;
  if (dt < 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  g.lineCap = 'round';
  for (let i = 0; i < 90; i++) {
    const d = dt - hash(i * 2.3) * 0.35;
    if (d < 0 || d > 1.2) continue;
    const ang = -Math.PI / 2 + (hash(i * 4.1) - 0.5) * 2.8;
    const sp = 380 + 520 * hash(i * 6.7);
    const px = (u) => r.x + r.w * (0.2 + 0.6 * hash(i * 8.3)) + Math.cos(ang) * sp * u;
    const py = (u) => r.y + r.h * 0.35 + Math.sin(ang) * sp * u + 700 * u * u;
    const a = 1 - d / 1.2, tail = Math.max(0, d - 0.07);
    g.strokeStyle = i % 3 ? `rgba(255,200,90,${0.8 * a})` : `rgba(255,248,220,${0.9 * a})`;
    g.lineWidth = 5 + 4 * hash(i);
    g.beginPath(); g.moveTo(px(tail), py(tail)); g.lineTo(px(d), py(d)); g.stroke();
  }
  // the flat itself flares
  const fl = Math.exp(-dt * 3);
  const gr = g.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 10, r.x + r.w / 2, r.y + r.h / 2, r.w * 1.3);
  gr.addColorStop(0, `rgba(255,241,184,${0.6 * fl})`); gr.addColorStop(1, 'rgba(255,194,61,0)');
  g.fillStyle = gr; g.fillRect(r.x - r.w, r.y - r.w, r.w * 3, r.h + r.w * 2);
  g.restore();
}

// SHOW: fireworks over the roof, into the (go, go, go). [t0, x, y, radius, colour]
const BURSTS = [[103.62, 200, -3700, 320, 0], [103.94, 880, -3760, 340, 3], [104.24, 540, -3820, 420, 1],
  [104.6, 60, -3780, 330, 2], [104.88, 1020, -3700, 330, 0], [105.15, 320, -3860, 360, 3], [105.45, 780, -3840, 350, 1],
  [105.75, 540, -3700, 380, 2]];
const FW_PAL = [[255, 194, 61], [255, 241, 184], [232, 131, 79], [255, 214, 110]];
function drawFireworks(g, t) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [t0, bx, by, R, n] of BURSTS) {
    const rise = 0.3, dt = t - t0, life = 1.7;
    if (dt < 0 || dt > rise + life) continue;
    const pal = FW_PAL[n % 4];
    if (dt < rise) {
      // the rocket climbing off the roof, with a spark trail
      const p = dt / rise, sx = 540 + (bx - 540) * 0.35;
      const x = lerp(sx, bx, p), y = lerp(P.ROOF_Y - 30, by, easeOut(p));
      for (let k = 0; k < 6; k++) {
        const q = Math.max(0, p - k * 0.05), tx = lerp(sx, bx, q), ty = lerp(P.ROOF_Y - 30, by, easeOut(q));
        g.fillStyle = `rgba(255,214,110,${0.5 - k * 0.07})`; g.beginPath(); g.arc(tx, ty, 14 - k * 1.5, 0, 7); g.fill();
      }
      g.fillStyle = 'rgba(255,248,230,1)'; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill();
      continue;
    }
    const d = dt - rise, a = Math.pow(1 - d / life, 1.3) * (1 - smooth(between(t, 105.75, 106.15)));   // gone by the handoff
    // the flash lights the sky around it
    if (d < 0.22) {
      const fr = R * 1.1 * (1 - d / 0.22) + 40;
      const gr = g.createRadialGradient(bx, by, 0, bx, by, fr);
      gr.addColorStop(0, `rgba(${pal},0.45)`); gr.addColorStop(0.4, `rgba(${pal},0.15)`); gr.addColorStop(1, `rgba(${pal},0)`);
      g.fillStyle = gr; g.fillRect(bx - fr, by - fr, fr * 2, fr * 2);
    }
    // two shells of stars: an outer ring and a slower inner one, drooping as they burn out
    const e = 1 - Math.exp(-d * 3.4);
    for (let shell = 0; shell < 2; shell++) {
      const N = shell ? 26 : 44, sp = R * (shell ? 0.55 : 1);
      for (let i = 0; i < N; i++) {
        const ang = (i / N) * Math.PI * 2 + hash(n * 13 + i + shell * 50) * 0.18;
        const v = sp * (0.82 + 0.18 * hash(n * 7 + i * 3 + shell));
        const x = bx + Math.cos(ang) * v * e, y = by + Math.sin(ang) * v * e + 160 * d * d;
        const tw = 0.75 + 0.25 * Math.sin(t * 40 + i * 1.7);        // twinkle
        const col = shell ? [255, 248, 230] : pal;
        // streak toward the centre
        g.strokeStyle = `rgba(${col},${0.5 * a})`; g.lineWidth = 8 * (0.5 + 0.5 * a);
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(ang) * 110 * (1 - e * 0.55), y - Math.sin(ang) * 110 * (1 - e * 0.55)); g.stroke();
        g.fillStyle = `rgba(${col},${a * tw})`;
        g.beginPath(); g.arc(x, y, (shell ? 9 : 13) * (0.55 + 0.45 * a), 0, 7); g.fill();
      }
    }
  }
  g.restore();
}

// ---------- screen: lyrics and flashes ----------
// Each "Make it good for who? (ooh-ooh-ooh)" holds, with its oohs, until the next "Make" is sung, so
// the huge hook never blinks off between its two halves.
let SONG2 = null;
function song(S) {
  if (SONG2 && SONG2.base === S) return SONG2;
  const lyrics = S.lyrics.slice();
  for (let i = 0; i + 1 < lyrics.length; i++) {
    const l = lyrics[i], n = lyrics[i + 1];
    if (l.start > 82 && l.start < 95 && /^Make it good for who/.test(l.text) && n.start > l.end) lyrics[i] = { ...l, end: n.start - 0.45 };
  }
  SONG2 = {
    ...S, base: S, lyrics,
    lineAt(t, hold = 1.2) {
      let best = null;
      for (const l of lyrics) if (l.start !== null && l.start <= t + 0.05 && t < l.end + hold) best = l;
      return best;
    },
  };
  return SONG2;
}

export function screen(g, t, S, st, cam) {
  // the crash of chorus 2: a flash of warm light
  const flash = Math.exp(-(t - CRASH) * 7) * (t >= CRASH ? 1 : 0);
  if (flash > 0.01) { g.save(); g.fillStyle = `rgba(255,236,190,${0.32 * flash})`; g.fillRect(0, 0, W, H); g.restore(); }

  if (t < 79.7) {
    // chorus 1's last line was cleared before the stall (section A); don't bring it back
    const l = S.lineAt(t, 0.6);
    if (l && l.start < range[0]) return;
    type.band(g, t, S, {});
    return;
  }
  if (t < CRASH) {
    // the lines to remember, huge on the landing wall, stacked: the first stays up under the second
    const a = smooth(between(t, 79.6, 79.85)) * (1 - smooth(between(t, 82.7, 82.95)));
    scrimTop(g, 700, 0.7 * a);
    stacked(g, t, S);
    return;
  }
  const S2 = song(S);
  const line = S2.lineAt(t, t > 105.2 ? -0.42 : 0.7);
  if (!line) return;
  // the last line clears before 106.2, as the camera drops, so the next section starts clean
  const hold = t > 105.2 ? -0.42 : 0.7;
  if (/^Make it good/.test(line.text)) {
    scrimTop(g, 560, 0.5);
    type.huge(g, t, S2, { y: 190, size: 146, w: 1000 });
  } else type.band(g, t, S2, { size: 78, w: 980, hold });     // "or" lines: the lower band, clear of the lives
}

// "I can't read your mind, / I'm only reading your prompt.": each line pinned to itself, so the first
// stays complete on screen, under the scrim, while the second is sung.
function stacked(g, t, S) {
  const find = t0 => S.lyrics.find(l => l.start !== null && Math.abs(l.start - t0) < 0.3);
  const l1 = find(79.76), l2 = find(80.76);
  if (!l1 || !l2) { type.huge(g, t, S, { y: 230, size: 116, w: 990 }); return; }
  const size = 100, w = 1000, gap = 26;
  const pin = l => ({ ...S, lineAt: tt => (tt >= l.start - 0.05 && tt < 82.95 ? l : null) });
  const y1 = 200, y2 = y1 + rowCount(g, l1.text, size, w) * size * 0.98 + gap;
  type.huge(g, t, pin(l1), { y: y1, size, w, hold: 82.8 - l1.end });
  type.huge(g, t, pin(l2), { y: y2, size, w, hold: 82.8 - l2.end });
}
// Rows that type.huge will wrap a line into (same font, width and spacing rule).
function rowCount(g, text, size, maxW) {
  g.save(); g.font = `800 ${size}px ${P.FONTS.display}`;
  const space = g.measureText(' ').width * 0.9;
  let rows = 1, rw = 0;
  for (const w of text.toUpperCase().split(/\s+/).filter(Boolean)) {
    const ww = g.measureText(w).width;
    if (rw + ww > maxW && rw > 0) { rows++; rw = 0; }
    rw += ww + space;
  }
  g.restore();
  return rows;
}

// A soft darkening at the top of the frame, so big type reads over the sky or a busy facade.
function scrimTop(g, h, a) {
  if (a <= 0.01) return;
  g.save();
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, `rgba(8,11,28,${0.8 * a})`); gr.addColorStop(0.6, `rgba(8,11,28,${0.55 * a})`); gr.addColorStop(1, 'rgba(8,11,28,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, h);
  g.restore();
}
