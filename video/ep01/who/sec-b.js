// Section B of "Who Lives Here?" (50.5–106.2 s): verse 2, the gap, pre-chorus 2 and chorus 2.
//
// Verse 2: the lift carries Clawd down the tower, one life per line. Each flat turns gold on the
// answer half of its line (the world draws the served action from st.flats[id].served). Then the
// lobby's courier bot, the basement fuse box, and the (whoa): Clawd looks up at the gold zigzag it
// just rode past, then at the ticket, FOR still blank. Pre-chorus 2 rockets back up to your door for
// the near-ask from both sides. Chorus 2 pulls out to the whole tower, and the facade becomes a
// light organ: each choice lights some lives gold and leaves the rest just warm.
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
// q: the question word (served starts), a: the answer's first word (gold starts), pay: the answer's
// payoff word (gold full), end: the line's last word ends (served complete).
const STOPS = [
  { id: '8L', k: 8, side: 'L', q: 51.00, a: 52.16, pay: 52.44, end: 53.06 },
  { id: '7R', k: 7, side: 'R', q: 53.38, a: 54.72, pay: 55.16, end: 55.78 },
  { id: '6L', k: 6, side: 'L', q: 56.10, a: 57.16, pay: 57.84, end: 58.44 },
  { id: '5R', k: 5, side: 'R', q: 58.44, a: 60.20, pay: 60.62, end: 61.18 },
  { id: '4L', k: 4, side: 'L', q: 61.64, a: 62.62, pay: 63.34, end: 63.72 },
  { id: '3R', k: 3, side: 'R', q: 64.32, a: 65.28, pay: 66.08, end: 66.54 },
];
const LOBBY = { q: 66.98, a: 68.08, pay: 68.60, end: 69.12 };
const CELLAR = { q: 69.74, a: 70.76, pay: 71.28, end: 71.58 };
const ASCENT = [76.54, 77.95];      // basement → your floor
// Clawd at standard size, as section A draws it at 50.5 (about 120 wide, 90 tall). Section C draws it
// at 1.2, so the size eases up while the chorus pull-out makes it tiny, where the change can't be seen.
const CL_S = 1, CL_H = 90 * CL_S;
const clawdScale = t => CL_S + 0.2 * smooth(between(t, 83.3, 84.3));
// At your door (the world puts door, letterbox and bell in a narrow strip beside the shaft): Clawd
// leans out of the car with its right edge just short of the bell, so the bell stays in view as the
// nub rises to it; then it retreats into the car doorway, clear of the letterbox.
const BELL_X = P.BELL.x - 76, DOORWAY_X = 588;
const CRASH = 82.96;                // chorus 2 lands

// The lift's floor y over time: holds at each stop, short drops between lines, one rocket up.
const LIFT = [
  [50.5, FL(8)], [52.98, FL(8)], [53.5, FL(7)], [55.8, FL(7)], [56.3, FL(6)], [58.28, FL(6)], [58.8, FL(5)],
  [61.2, FL(5)], [61.7, FL(4)], [63.74, FL(4)], [64.3, FL(3)], [66.52, FL(3)], [67.1, FL(1)],
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
const DOORS = [[51.05, 52.96], [53.55, 55.78], [56.35, 58.26], [58.85, 61.18], [61.75, 63.72], [64.35, 66.5],
  [67.15, 69.12], [69.77, 76.5], [78.0, 83.9]];
function doorsAt(t) {
  for (const [a, b] of DOORS) if (t >= a && t <= b) return smooth(between(t, a, a + 0.25)) * (1 - smooth(between(t, b - 0.22, b)));
  return 0;
}

// ---------- chorus 2: the light organ ----------
// Each cue sets which lives go gold (and which dim) from its onset until the next cue.
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
  { t: 88.44, gold: ['8R', '7L'], style: 'fast', word: 'FAST' },
  { t: 89.80, gold: ['7R'], lockers: 1, style: 'sturdy', word: 'STURDY' },
  { t: 90.64, gold: ['5R', '6L'], style: 'cheap', word: 'CHEAP' },
  { t: 91.04, gold: ['8L'], dim: ['4L'], style: 'wow', word: 'WOW', erupt: '8L' },
  { t: 92.44, gold: ['7R', '4L'], dim: ['8L'], style: 'keep', word: 'KEEP' },
  { t: 93.60, gold: [], organ: true },                                // the repeated hook: flicker on the beat
  { t: 99.30, gold: ['5R', '8L'], style: 'ship', word: 'SHIP' },
  { t: 100.78, gold: ['7R'], style: 'polish', word: 'POLISH' },
  { t: 102.28, gold: ['4L', '3R', '2L', '2R'], style: 'plain', word: 'NEED' },
  { t: 103.58, gold: ['8L'], style: 'show', word: 'SHOW' },
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
  if (t0 >= 97.85) return [LEFT, RIGHT, CHECKER][Math.max(0, i) % 3];
  const dense = t0 >= 95.55, side = i % 2 ? 'L' : 'R';
  const set = ORGAN_IDS.filter((id, j) => hash(i * 7.31 + j * 1.77) < (dense ? (id.endsWith(side) ? 0.62 : 0.2) : 0.28));
  if (set.length < 3) set.push(ORGAN_IDS[Math.floor(hash(i + 0.5) * ORGAN_IDS.length)], ORGAN_IDS[Math.floor(hash(i + 0.9) * ORGAN_IDS.length)]);
  return set.length >= ORGAN_IDS.length - 1 ? set.slice(0, 8) : set;
}

function cueIndex(t) { let c = -1; for (let i = 0; i < CUES.length; i++) if (t >= CUES[i].t) c = i; return c; }

// Gold and dim for every organ flat at t (chorus 2).
function organAt(t, S) {
  const gold = {}, dim = {}, hit = {};
  for (const id of ORGAN_IDS) { gold[id] = 0; dim[id] = 0; hit[id] = 0; }
  let lockers = 0;
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
        const v = env * (0.55 + 0.45 * Math.exp(-since * 5));
        gold[id] = Math.max(gold[id], v);
        hit[id] = Math.max(hit[id], Math.exp(-since * 7) * env);
      }
      continue;
    }
    for (const id of c.gold) {
      gold[id] = Math.max(gold[id], env);
      hit[id] = Math.max(hit[id], Math.exp(-(t - c.t) * 5) * rel);
    }
    for (const id of c.dim || []) dim[id] = Math.max(dim[id], env);
    if (c.lockers) lockers = Math.max(lockers, env);
  }
  return { gold, dim, hit, lockers };
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
const LOBBY_CAM = { x: 790, y: -40, zoom: 1.66 };
const CELLAR_CAM = { x: 770, y: 280, zoom: 1.42 };
const FUSE_CAM = { x: 880, y: 272, zoom: 1.85 };
const WHOA_WIDE = { x: 540, y: -1240, zoom: 0.52 };
const TICKET_CAM = { x: 540, y: 262, zoom: 2.5 };
const DOOR_CAM = { x: 792, y: FL(9) - 130, zoom: 1.8 };
const BLIND_CAM = { x: 858, y: FL(9) - 160, zoom: 1.9 };
const HOLDUP_CAM = { x: 700, y: FL(9) - 150, zoom: 1.95 };
// Chorus 2: the whole tower. HOOK leaves deep sky above the roof for the huge hook; OR rides a
// little higher so the lower floors (and the lobby lockers) sit clear of the bottom UI zone.
const HOOK_CAM = { x: 540, y: -2600, zoom: 0.38 };
const OR_CAM = { x: 540, y: -2150, zoom: 0.38 };
// SHOW tilts up into the fireworks; then the (go, go, go) drops the camera down the tower.
const SHOW_CAM = { x: 540, y: -3060, zoom: 0.4 };

const KEYS_A = [
  [50.5, P.HANDOFF[50.5]],
  [51.4, flatCam(8, 'L')], [52.98, flatCam(8, 'L', 1)],
  [53.7, flatCam(7, 'R')], [55.8, flatCam(7, 'R', 1)],
  [56.5, flatCam(6, 'L')], [58.28, flatCam(6, 'L', 1)],
  [59.0, flatCam(5, 'R')], [61.2, flatCam(5, 'R', 1)],
  [61.9, flatCam(4, 'L')], [63.74, flatCam(4, 'L', 1)],
  [64.5, flatCam(3, 'R')], [66.52, flatCam(3, 'R', 1)],
  [67.3, LOBBY_CAM], [69.0, { ...LOBBY_CAM, zoom: 1.72, x: 780 }],
  [69.9, CELLAR_CAM], [71.0, FUSE_CAM], [72.5, { ...FUSE_CAM, zoom: 1.92, x: 872 }],
  [73.25, { x: 600, y: 250, zoom: 1.35 }], [74.3, { ...WHOA_WIDE, ease: easeOut }], [74.55, { ...WHOA_WIDE, zoom: 0.53, y: -1220 }],
  [75.3, { ...TICKET_CAM, ease: inOut }], [ASCENT[0], { ...TICKET_CAM, zoom: TICKET_CAM.zoom * 1.03 }],
];
const KEYS_B = [
  [ASCENT[1] + 0.02, DOOR_CAM], [79.5, { ...DOOR_CAM, zoom: 1.84, x: 800 }],
  [80.05, BLIND_CAM], [80.72, { ...BLIND_CAM, zoom: 1.94, x: 864 }],
  [81.25, HOLDUP_CAM], [CRASH, { ...HOLDUP_CAM, zoom: 2.02 }],
  [84.55, { ...HOOK_CAM, ease: easeOut }], [88.1, { ...HOOK_CAM, zoom: 0.385 }],
  [88.7, OR_CAM], [93.45, { ...OR_CAM, zoom: 0.385 }],
  [94.0, HOOK_CAM], [98.95, { ...HOOK_CAM, zoom: 0.385 }],
  [99.5, OR_CAM], [103.45, { ...OR_CAM, zoom: 0.385 }],
  [104.3, SHOW_CAM], [105.0, { ...SHOW_CAM, y: -3100, zoom: 0.405 }],
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
    let served = clamp01((t - s.q) / (s.end - s.q));
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
  // the world's own props: the courier's locker door, the neighbours' faces going gold, your
  // "diags pls" note on the fuse box, and the letterbox flap
  st.lockerOpen = courier(t).open;
  st.lockersGold = smooth(between(t, LOBBY.pay - 0.15, LOBBY.pay + 0.2)) * (1 - smooth(between(t, 76.6, 77.2)));
  if (t > 69.0 && t < 76.6) st.fuseNote = 1;
  st.letterbox = Math.max(st.letterbox || 0, clamp01(noteOut(t) * 3));
  if (t > 69.5 && t < 76.6) st.bulbSwing = 0.06 * Math.sin((t - 69.5) * 2.4) * (1 - between(t, 75.5, 76.5));

  // pre-chorus 2: the bell brightens as Clawd's nub nears it, then goes back to waiting
  const reach = nearAsk(t).reach;
  st.bellGlow = Math.max(st.bellGlow, 0.55 + 0.45 * reach);
  // the band stop before the crash: stillness, only the ticket lit
  st.dim = Math.max(st.dim, 0.55 * smooth(between(t, 82.45, 82.7)) * (1 - smooth(between(t, CRASH, CRASH + 0.12))));

  // chorus 2: the facade is the instrument
  if (t >= CRASH) {
    const o = organAt(t, S);
    for (const id of ORGAN_IDS) {
      const f = st.flats[id];
      f.gold = Math.max(f.gold || 0, o.gold[id]);
      f.lit = Math.min(f.lit, 1 - 0.7 * o.dim[id]);
    }
    st.lockersGold = Math.max(st.lockersGold || 0, o.lockers);
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
  const open = bump(t, 67.95, 0.18, 0.4, 0.2);
  const take = smooth(between(t, 68.3, 68.5));
  const leave = smooth(between(t, 68.95, 69.9));
  return { x: lerp(x0, 250, leave), y: 0, open, take, has: take > 0, reach: bump(t, 68.05, 0.15, 0.3, 0.15), leave, on: t > 66.4 && t < 70.2 };
}
function nearAsk(t) {
  const up = smooth(between(t, 78.55, 78.85)), down = smooth(between(t, 79.22, 79.42));
  return { reach: up * (1 - down), crouch: bump(t, 78.38, 0.12, 0.02, 0.1), land: bump(t, 79.4, 0.06, 0.02, 0.18) };
}
// Your note slides halfway out of the letterbox just as Clawd turns away, and back in.
const noteOut = t => 0.5 * smooth(between(t, 79.5, 79.85)) * (1 - smooth(between(t, 80.05, 80.4)));

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
    // your door: hop out, reach for the bell, hover… and drop; shuffle back into the car doorway,
    // head down, just as your note slides out of the letterbox behind it; then hold up the ticket
    const step = smooth(between(t, 78.1, 78.4)), retreat = smooth(between(t, 79.4, 79.75));
    x = lerp(SH.cx, BELL_X, step) + (DOORWAY_X - BELL_X) * retreat;
    y = FL(9);
    const n = nearAsk(t);
    pose.hop = 1.4 * n.reach + 0.5 * Math.sin(Math.PI * between(t, 78.1, 78.4));
    pose.squash = 0.3 * n.crouch + 0.3 * n.land;
    pose.rot = 0.12 * n.reach;
    if (n.reach > 0.01) pose.armR = 1.5 * n.reach + 0.06 * n.reach * Math.sin(t * 40);
    pose.look = t < 79.25 ? 0.7 * Math.max(step, n.reach) : -0.6;
    pose.lookY = t < 79.25 ? -0.8 * n.reach : 0.6;
    pose.mood = t < 78.8 ? 'hope' : t < 79.25 ? 'worried' : t < 80.9 ? 'sad' : 'hope';
    if (t > 79.4 && t < 79.75) pose.walk = (t - 79.4) * 26;
    if (t > 80.15 && t < 80.85) { pose.look = 0.9; pose.lookY = -0.3; }     // glances up at the blind
    const hold = smooth(between(t, 80.85, 81.2));
    if (hold > 0) {
      pose.look = 0.3; pose.lookY = -0.6;
      holdTicket(hold, 0.56, { glow: smooth(between(t, 81.1, 81.9)) });
    }
  } else {
    // chorus 2: back in the car, riding the light organ, head whipping after the lights
    const back = smooth(between(t, CRASH + 0.05, CRASH + 0.5));
    x = lerp(DOORWAY_X, SH.cx, back);
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

  // your note, halfway out of the letterbox and back
  const n = noteOut(t);
  if (n > 0.001) safe(g, 'letterbox', () => drawLetterboxNote(g, n));

  // Clawd (and the ticket it holds up)
  const c = clawdNow(t, S, st);
  if (t > ASCENT[0] - 0.05 && t < ASCENT[1] + 0.25) safe(g, 'speed', () => drawSpeedLines(g, t, cam));
  safe(g, 'clawd', () => cast.clawd(g, c.x, c.y, clawdScale(t), c.pose));
  if (riding(t) && world.drawLiftFront) safe(g, 'lift front', () => world.drawLiftFront(g, t, S, st, {}));

  // fireworks: WOW erupts out of the demo flat; SHOW bursts over the roof
  if (t > 90.9 && t < 93.2) safe(g, 'erupt', () => drawEruption(g, t, '8L', 91.04));
  if (t > 103.5) safe(g, 'fireworks', () => drawFireworks(g, t));
}

// Clawd is inside the car (so the car's glass and posts go over it) except in the basement walk and
// at your door.
const riding = t => !(t > 69.85 && t < 73.25) && !(t > 78.05 && t < CRASH + 0.5);

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
  const scan = bump(t, 67.3, 0.15, 0.4, 0.15);
  if (scan > 0.01) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const sweep = CL.x - 150 + 300 * smooth(between(t, 67.3, 67.75));
    const gr = g.createLinearGradient(cb.x, -100, sweep, CL.y + CL.h / 2);
    gr.addColorStop(0, `rgba(124,255,181,${0.45 * scan})`); gr.addColorStop(1, `rgba(124,255,181,${0.1 * scan})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(cb.x - 8, -96); g.lineTo(sweep - 34, CL.y + 6); g.lineTo(sweep + 34, CL.y + CL.h - 6); g.closePath(); g.fill();
    g.restore();
  }
  const tick = bump(t, 67.72, 0.1, 0.18, 0.12);
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

// Your note: a folded strip, the width of the slot, sliding halfway out of the letterbox and back.
function drawLetterboxNote(g, n) {
  const lb = P.LETTERBOX, w = 24, len = 128 * n, top = lb.y + 2;
  g.save();
  g.translate(lb.x, top); g.rotate(0.04 * n);
  g.lineWidth = 3; g.strokeStyle = P.PAL.outline; g.fillStyle = P.PAL.paper;
  g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.lineTo(w / 2 + 1, len - 4); g.quadraticCurveTo(0, len + 4, -w / 2 - 1, len - 4); g.closePath(); g.fill(); g.stroke();
  // a few lines of your handwriting, too small to read: something was nearly said
  g.strokeStyle = 'rgba(27,37,83,0.75)'; g.lineWidth = 2; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const yy = 14 + i * 12;
    if (yy > len - 8) break;
    g.beginPath(); g.moveTo(-8, yy); for (let k = 1; k <= 6; k++) g.lineTo(-8 + k * 3, yy + (k % 2 ? -2.5 : 2)); g.stroke();
  }
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
    gr.addColorStop(0, `rgba(255,214,110,${0.28 * gv + 0.3 * hv})`);
    gr.addColorStop(1, 'rgba(255,194,61,0)');
    g.fillStyle = gr; g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    // a beam out into the night, away from the shaft: nested wedges give it a soft edge
    const dir = side === 'L' ? -1 : 1, ex = side === 'L' ? r.x : r.x + r.w;
    const len = 1000 * (0.5 + 0.5 * Math.max(gv, hv)), base = 0.1 * gv + 0.16 * hv;
    for (const [wk, ak] of [[1, 0.45], [0.62, 0.7], [0.3, 1]]) {
      const spread = (110 + 170 * hv) * wk, open = r.h * 0.34 * (0.5 + 0.5 * wk);
      const bg = g.createLinearGradient(ex, cy, ex + dir * len, cy);
      bg.addColorStop(0, `rgba(255,196,92,${base * ak})`); bg.addColorStop(0.55, `rgba(255,180,70,${base * ak * 0.4})`); bg.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = bg;
      g.beginPath(); g.moveTo(ex, cy - open); g.lineTo(ex + dir * len, cy - spread - 50); g.lineTo(ex + dir * len, cy + spread - 50); g.lineTo(ex, cy + open); g.closePath(); g.fill();
    }
    // the hit itself: a flash inside the window
    if (hv > 0.02) { g.fillStyle = `rgba(255,241,184,${0.35 * hv})`; g.fillRect(r.x, r.y, r.w, r.h); }
  }
  if (o.lockers > 0.02) {
    const L = P.LOCKERS;
    const gr = g.createRadialGradient(L.x + L.w / 2, L.y + L.h / 2, 20, L.x + L.w / 2, L.y + L.h / 2, L.w);
    gr.addColorStop(0, `rgba(255,214,110,${0.5 * o.lockers})`); gr.addColorStop(1, 'rgba(255,194,61,0)');
    g.fillStyle = gr; g.fillRect(L.x - 300, L.y - 300, L.w + 600, L.h + 600);
  }
  g.restore();
}

// Sparks pouring out of a flat's window (WOW).
function drawEruption(g, t, id, t0) {
  const k = parseInt(id, 10), side = id.endsWith('L') ? 'L' : 'R', r = P.flatRect(k, side);
  const dt = t - t0;
  if (dt < 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 110; i++) {
    const d = dt - hash(i * 2.3) * 0.6;
    if (d < 0 || d > 1.5) continue;
    const ang = -Math.PI / 2 + (hash(i * 4.1) - 0.5) * 2.6;
    const sp = 500 + 900 * hash(i * 6.7);
    const x = r.x + r.w * hash(i * 8.3) + Math.cos(ang) * sp * d;
    const y = r.y + r.h * 0.4 + Math.sin(ang) * sp * d + 600 * d * d;
    const a = 1 - d / 1.5;
    g.fillStyle = i % 3 ? `rgba(255,214,110,${a})` : `rgba(255,248,220,${a})`;
    g.beginPath(); g.arc(x, y, 22 + 18 * hash(i), 0, 7); g.fill();
  }
  // the flat itself flares
  const fl = Math.exp(-dt * 3);
  const gr = g.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 10, r.x + r.w / 2, r.y + r.h / 2, r.w * 1.3);
  gr.addColorStop(0, `rgba(255,241,184,${0.6 * fl})`); gr.addColorStop(1, 'rgba(255,194,61,0)');
  g.fillStyle = gr; g.fillRect(r.x - r.w, r.y - r.w, r.w * 3, r.h + r.w * 2);
  g.restore();
}

// SHOW: fireworks over the roof, into the (go, go, go). [t0, x, y, radius, colour]
const BURSTS = [[103.62, 180, -3930, 420, 0], [103.94, 900, -4020, 440, 3], [104.24, 540, -4230, 620, 1],
  [104.6, -120, -4150, 460, 2], [104.88, 1180, -3980, 460, 0], [105.15, 300, -4420, 500, 3], [105.45, 800, -4300, 480, 1],
  [105.75, 540, -3950, 520, 2]];
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
        g.fillStyle = `rgba(255,214,110,${0.5 - k * 0.07})`; g.beginPath(); g.arc(tx, ty, 28 - k * 3, 0, 7); g.fill();
      }
      g.fillStyle = 'rgba(255,248,230,1)'; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill();
      continue;
    }
    const d = dt - rise, a = Math.pow(1 - d / life, 1.3) * (1 - smooth(between(t, 105.75, 106.15)));   // gone by the handoff
    // the flash lights the sky around it
    if (d < 0.22) {
      const fr = R * 1.6 * (1 - d / 0.22) + 60;
      const gr = g.createRadialGradient(bx, by, 0, bx, by, fr);
      gr.addColorStop(0, `rgba(${pal},0.7)`); gr.addColorStop(0.4, `rgba(${pal},0.25)`); gr.addColorStop(1, `rgba(${pal},0)`);
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
        g.strokeStyle = `rgba(${col},${0.5 * a})`; g.lineWidth = 16 * (0.5 + 0.5 * a);
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(ang) * 150 * (1 - e * 0.55), y - Math.sin(ang) * 150 * (1 - e * 0.55)); g.stroke();
        g.fillStyle = `rgba(${col},${a * tw})`;
        g.beginPath(); g.arc(x, y, (shell ? 18 : 26) * (0.55 + 0.45 * a), 0, 7); g.fill();
      }
    }
  }
  g.restore();
}

// ---------- screen: lyrics and flashes ----------
// lyrics.json puts "Make it" in both of chorus 2's "Make it good for what?" lines 0.4–0.9 s early
// (the aligner caught the "ooh" backing). "good", "for" and "what" agree with every other chorus,
// and "Make it good" takes 0.34 s wherever it's clean, so the display here re-times "Make" and "it"
// from "good". Knock-on: the "(ooh-ooh-ooh)" line stays up until "Make" is really sung.
let SONG2 = null;
function song(S) {
  if (SONG2 && SONG2.base === S) return SONG2;
  const fix = l => {
    if (!(l.start > 84 && l.start < 97 && /^Make it good for what/.test(l.text))) return l;
    const words = l.words.map(w => ({ ...w }));
    const good = words[2].s;
    words[0].s = good - 0.34; words[0].e = good - 0.18;
    words[1].s = good - 0.17; words[1].e = good - 0.02;
    return { ...l, start: words[0].s, words };
  };
  const lyrics = S.lyrics.map(fix);
  // each "for who?" line holds (with its oohs) until the re-timed "Make" of the next
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
    // the line to remember, huge on the landing wall
    const a = smooth(between(t, 79.6, 79.85)) * (1 - smooth(between(t, 82.7, 82.95)));
    scrimTop(g, 640, 0.7 * a);
    const l4 = t >= 80.7;
    type.huge(g, t, S, { y: l4 ? 215 : 250, size: l4 ? 116 : 128, w: 990 });
    return;
  }
  const S2 = song(S);
  const line = S2.lineAt(t, t > 105.2 ? -0.42 : 0.7);
  if (!line) return;
  scrimTop(g, 560, 0.5 * (1 - smooth(between(t, 105.3, 105.75))));
  // the last line clears before 106.2, as the camera drops, so the next section starts clean
  const hold = t > 105.2 ? -0.42 : 0.7;
  if (/^Make it good/.test(line.text)) type.huge(g, t, S2, { y: 190, size: 146, w: 1000 });
  else type.band(g, t, S2, { y: 205, size: 88, w: 980, scrim: 0, hold });
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
