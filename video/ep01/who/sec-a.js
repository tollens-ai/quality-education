// Section A of "Who Lives Here?" (0–50.5 s): the intro, verse 1, pre-chorus 1 and chorus 1, as
// episodes/01-storyboard.md describes them line by line, keyed to the sung word onsets in
// music/ep01/lyrics.json.
//
// The shot: Clawd shows us the ticket ("make it good", FOR blank), launches a confetti cannon up
// the lift, and delivers four misfit builds to your door; each flashes gold past the flat it would
// really suit. Your hand meets each one at the letterbox. The blame lands, the quota runs out, and
// Clawd doesn't ring your bell. It falls back to the basement, where the only light from upstairs
// comes through your words. Then the chorus: every button, tokens split five ways, the car itself
// turning into each trade-off, until the lift stalls at floor 8 for verse 2.
//
// Exports: range, camera(t, S), state(t, st, S), draw(g, t, S, st, cam) in world space, and
// screen(g, t, S, st, cam) in screen space. drawOpening draws the opening shot (frame 0 is the
// thumbnail and the loop's last frame); drawDoorBuilds and BUILD_AT draw the misfit builds at your
// door for the sections after this one.
import { smooth, easeOut, easeIn, between, lerp, clamp01, W, H } from '../../lib/stage.js';
import * as P from './plan.js';
import * as cast from './cast.js';
import * as type from './type.js';
import * as world from './world.js';

export const range = [0, 50.5];

// ---------- small tools (all pure functions of t) ----------
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const win = (t, a, b, fi = 0.2, fo = 0.3) => clamp01((t - a) / fi) * clamp01((b - t) / fo);
const kick = (t, t0, k = 5) => (t < t0 ? 0 : Math.exp(-(t - t0) * k));
const inOut = p => { p = clamp01(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const settle = p => { p = clamp01(p); const c1 = 0.6, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const backOut = p => { p = clamp01(p); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const lin = p => clamp01(p);
const flick = t => hash(Math.floor(t * 15) + 7) > 0.42;       // an on/off flicker pattern
const FL = k => P.floorLevel(k);

// Keyed values with an ease per segment: [[t, v, ease], ...] (ease applies on the way into a key).
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [ta, va] = keys[i - 1], [tb, vb, e] = keys[i];
      return lerp(va, vb, (e || smooth)((t - ta) / (tb - ta)));
    }
  }
  return keys[keys.length - 1][1];
}

// Monotone cubic through keys (Fritsch–Carlson): smooth motion through each key without overshoot,
// at rest at the first and last key and wherever the path holds still.
function monotone(xs, ys) {
  const n = xs.length, d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return t => {
    if (t <= xs[0]) return ys[0];
    if (t >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (t > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}

// Draw one element with a balanced canvas stack; remember the first failure and rethrow it at the
// end of the stage, so one broken prop doesn't blank the rest (main.js labels the error).
let firstErr = null;
function safe(g, fn) { g.save(); try { fn(); } catch (e) { firstErr = firstErr || e; } finally { g.restore(); } }
function rethrow() { if (firstErr) { const e = firstErr; firstErr = null; throw e; } }

// World point → screen point under a camera.
function toScreen(cam, x, y) {
  const dx = (x - cam.x) * cam.zoom, dy = (y - cam.y) * cam.zoom, c = Math.cos(cam.rot || 0), s = Math.sin(cam.rot || 0);
  return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
}

// ---------- the lift's route (the car's floor y) ----------
const LIFT = [
  [0, P.BASE.floor],
  [2.08, P.BASE.floor],
  [2.95, 0, settle],                 // launched: up to the lobby
  [3.85, 0],                         // band stop: the lobby, the directory board
  [4.62, FL(6) + 60, inOut],         // up again…
  [4.98, FL(6) - 80, lin],           // …slowly past Lily's party (the cannon puffs confetti in)
  [5.38, FL(9), settle],             // your floor
  [7.45, FL(9)],
  [7.88, (FL(6) + FL(7)) / 2, inOut],   // dip for the vault
  [8.05, (FL(6) + FL(7)) / 2],
  [8.45, FL(7) - 70, lin],           // past Mo the trader
  [8.8, FL(9), settle],
  [10.35, FL(9)],
  [10.62, (FL(7) + FL(8)) / 2, inOut],  // dip for the pods
  [10.78, (FL(7) + FL(8)) / 2],
  [11.1, FL(8) - 60, lin],           // past Kai the streamer
  [11.4, FL(9), settle],
  [12.8, FL(9)],
  [13.15, (FL(4) + FL(5)) / 2, inOut],  // long dip for the subagents
  [13.3, (FL(4) + FL(5)) / 2],
  [13.6, FL(5) - 60, lin],           // past the launch team
  [13.9, FL(9), settle],
  [20.8, FL(9)],
  [22.15, P.BASE.floor, easeIn],     // the fall
  [27.3, P.BASE.floor],
  [28.55, FL(3), inOut],             // chorus: rocket up, a face on each "ooh"
  [28.66, FL(3)],
  [28.9, FL(4), inOut],
  [29.01, FL(4)],
  [29.26, FL(5), inOut],
  [32.6, FL(5) - 30, smooth],        // the split: a token a word into the five slots
  [33.15, FL(8), settle],            // FAST: three floors in half a second, to Kai (8R)
  [33.9, FL(8)],
  [34.62, FL(7), easeIn],            // STURDY: so heavy it sinks a floor, to the Okafors (7R)
  [34.95, FL(7)],
  [35.3, FL(5), easeIn],             // CHEAP: the cable slips two floors, to Sam (5R)
  [35.44, FL(5)],
  [35.85, FL(8), settle],            // WOW: pops up to Dev's demo (8L)
  [36.75, FL(8)],
  [37.35, FL(7), smooth],            // KEEP: settles at the Okafors' (7R)
  [38.1, FL(7)],
  [38.9, FL(9) - 60, smooth],        // up…
  [39.6, FL(7) - 150, smooth],       // …and down past three open doors
  [40.76, FL(7) + 60, smooth],
  [43.55, FL(5), inOut],             // SHIP: Sam (5R), due at nine
  [45.2, FL(5)],
  [46.35, FL(7), smooth],            // POLISH: slowly up to the Okafors (7R) while Sam taps his watch
  [46.6, FL(7)],
  [47.1, FL(4), inOut],              // NEED: down to Nana (4L)
  [47.82, FL(4)],
  [48.5, FL(8), settle],             // SHOW: shoots up to Dev (8L)
  [49.45, FL(8) - 120, smooth],      // drifts up, stalls between 8 and 9
  [50.05, FL(8) - 120],
  [50.3, FL(8), easeIn],             // clunk: back down to floor 8 for verse 2
  [50.5, FL(8)],
];
const liftY = t => track(LIFT, t);

// ---------- camera ----------
// [t, x, y, zoom]. The monotone path passes through every key; life (drift, beat punch-ins,
// shakes) rides on top, and is zero at both handoffs and nearly still in the band stops.
const CAM = [
  [0, 400, 250, 2.2],
  [1.2, 402, 238, 2.32],       // push in on the ticket
  [2.05, 450, 205, 2.0],       // the lever, the launch
  [2.7, 330, -70, 1.6],        // up with the lift…
  [3.15, 234, -150, 2.26],     // …to the lobby's board, WHO LIVES HERE (you: floor 9)
  [3.95, 238, -154, 2.32],     // read it (band stop)
  [4.6, 810, -1975, 1.55],     // whip up: Lily's party (6R) goes gold as the cannon passes
  [5.05, 816, -1982, 1.62],
  [5.75, 680, -2960, 1.3],     // your door: the cannon is bolted on
  [6.9, 690, -3000, 1.75],     // floss ✓
  [7.35, 690, -2995, 1.7],     // blast
  [7.9, 292, -2300, 1.5],      // Mo the trader (7L): the vault suits him
  [8.45, 298, -2308, 1.58],
  [9.3, 680, -2980, 1.4],      // your door: the vault
  [10.3, 700, -3000, 1.8],     // six digits
  [10.85, 802, -2660, 1.5],    // Kai (8R): the pods suit him
  [11.35, 808, -2668, 1.58],
  [11.95, 720, -2980, 1.35],   // your door: the pods spin up
  [12.8, 700, -3000, 1.8],     // hello world · 1 view
  [13.3, 300, -1592, 1.45],    // the launch team (5L): twelve subagents suit them
  [13.75, 305, -1600, 1.52],
  [14.4, 720, -2960, 1.15],    // twelve subagents on your landing
  [15.45, 720, -2975, 1.28],
  [16.2, 700, -3000, 1.72],    // the note
  [17.0, 700, -3000, 1.76],
  [18.5, 698, -2992, 1.7],     // QUOTA 100% USED
  [19.05, 704, -2968, 2.5],    // push in: the bell it doesn't ring
  [19.85, 706, -2966, 2.66],
  [20.4, 700, -2975, 2.3],
  [20.8, 630, -3040, 1.62],    // anticipation…
  [21.4, 560, -2650, 1.25],    // …the fall
  [21.8, 540, -1500, 1.0],
  [22.15, 470, 250, 1.5],
  [22.9, 322, 292, 2.0],       // the ticket on the bare wall
  [23.85, 332, 282, 2.06],
  [24.6, 360, 150, 1.58],      // tilt up: your words in the ceiling; the line to remember
  [26.25, 380, 160, 1.64],
  [27.2, 380, 160, 1.64],      // band stop: stillness
  [27.5, 470, 150, 1.7],       // the crash (from here the camera rides the lift; see RIDE)
  [32.55, 540, -1800, 0.7],    // wide for the "or"s: floors 5–8, the car and everyone it could suit
  [38.0, 544, -1805, 0.72],
  [43.45, 560, -1570, 0.8],    // floors 5–7: SHIP and POLISH
  [46.35, 560, -1575, 0.8],
  [46.95, 500, -1212, 0.8],    // floors 4–6: NEED
  [47.85, 500, -1215, 0.8],
  [49.5, 540, -2680, 1.3],     // the stall
  [50.5, 540, -2670, 1.4],
];
const camX = monotone(CAM.map(k => k[0]), CAM.map(k => k[1]));
const camY = monotone(CAM.map(k => k[0]), CAM.map(k => k[2]));
const camZ = monotone(CAM.map(k => k[0]), CAM.map(k => Math.log(k[3])));
// Riding with the lift (the fall and chorus 1): [t, screen y of the car's centre, zoom, x]. The
// car sits below the hook type while hooks are sung, and above the band while "or" lines are.
const RIDE = [
  [20.8, 880, 1.62, 630], [21.3, 820, 1.3, 575], [21.8, 800, 1.0, 540], [22.15, 900, 1.45, 470],
  [27.3, 960, 1.7, 470], [28.0, 915, 1.6, 540], [29.4, 930, 1.62, 540],
  [29.9, 915, 1.76, 540], [32.4, 915, 1.8, 540],     // the split: close on the five slots
  [33.0, 800, 1.0, 560], [37.8, 800, 1.0, 560],      // (the wide shots take over here)
  [38.5, 880, 1.2, 550], [39.3, 900, 0.95, 555], [40.76, 900, 0.95, 555],
  [41.35, 915, 1.72, 540], [43.1, 915, 1.76, 540],   // the split again
  [43.7, 800, 1.1, 560], [47.6, 800, 1.0, 480],
  [48.2, 800, 1.02, 470], [48.7, 810, 1.08, 480],    // SHOW: up with the car to Dev (8L)
  [49.5, 860, 1.3, 540], [50.5, 995, 1.4, 540],
];
const rideT = monotone(RIDE.map(k => k[0]), RIDE.map(k => k[1]));
const rideZ = monotone(RIDE.map(k => k[0]), RIDE.map(k => Math.log(k[2])));
const rideX = monotone(RIDE.map(k => k[0]), RIDE.map(k => k[3]));
function ride(t) {
  let s = 0; for (let k = -4; k <= 4; k++) s += liftY(t + k * 0.04);   // a symmetric average: no lag, no stutter
  const z = Math.exp(rideZ(t));
  return { x: rideX(t), y: s / 9 - 125 + (960 - rideT(t)) / z, zoom: z };
}
// The "or" lines are shot wide (CAM), so each choice's resident and price stay in view.
const WIDE = [[32.55, 38.0], [43.45, 47.85]];
function rideW(t) {
  let w = Math.max(win(t, 20.85, 22.2, 0.25, 0.3), smooth(between(t, 27.3, 27.75)) * (1 - smooth(between(t, 49.9, 50.45))));
  for (const [a, b] of WIDE) w *= 1 - smooth(win(t, a, b, 0.4, 0.4));
  return w;
}
// Impacts: [t, screen px].
const SHAKES = [[7.04, 16], [9.38, 10], [11.45, 7], [13.92, 7], [17.04, 7], [17.86, 14], [22.15, 24], [27.2, 18], [34.62, 12], [35.3, 10], [48.5, 8], [50.3, 9]];

function stillness(t) {   // 1 in the band stops
  return Math.max(win(t, 3.1, 3.85, 0.1, 0.15), win(t, 26.3, 27.2, 0.1, 0.02), win(t, 49.5, 50.3, 0.1, 0.1));
}
function life(t) { return smooth(between(t, 0.05, 0.9)) * (1 - 0.9 * stillness(t)) * (1 - smooth(between(t, 49.9, 50.4))); }

export function camera(t, S) {
  if (t <= 0) return { ...P.HANDOFF[0] };
  if (t >= 50.46) return { ...P.HANDOFF[50.5] };
  let x = camX(t), y = camY(t), z = Math.exp(camZ(t));
  const w = rideW(t);
  if (w > 0) { const r = ride(t); x = lerp(x, r.x, w); y = lerp(y, r.y, w); z = Math.exp(lerp(Math.log(z), Math.log(r.zoom), w)); }
  const L = life(t);
  x += L * 6 * Math.sin(t * 0.83) / z;
  y += L * 8 * Math.sin(t * 0.61 + 1.3) / z;
  // small punch-ins on the beat, bigger on the bar
  if (S && S.beatPos) {
    const bp = S.beatPos(t), k = Math.floor(bp), f = (bp - k) * S.beat;
    z *= 1 + L * Math.exp(-f / 0.09) * (k % 4 === 0 ? 0.024 : 0.01);
  }
  for (const [t0, a] of SHAKES) {
    const d = t - t0;
    if (d >= 0 && d < 0.7) { const e = a * Math.exp(-d * 8) / z * (1 - smooth(between(t, 50.32, 50.44))); x += e * Math.sin(d * 71); y += e * Math.sin(d * 53 + 1); }
  }
  const rot = 0.035 * Math.sin((t - 20.8) * 3.2) * win(t, 20.9, 22.1, 0.3, 0.15) + 0.012 * Math.sin((t - 32.7) * 5) * win(t, 32.8, 33.8, 0.2, 0.2);
  const cam = { x, y, zoom: z, rot };
  const end = smooth(between(t, 50.2, 50.46)), h = P.HANDOFF[50.5];
  if (end > 0) return { x: lerp(cam.x, h.x, end), y: lerp(cam.y, h.y, end), zoom: lerp(cam.zoom, h.zoom, end), rot: lerp(cam.rot, 0, end) };
  return cam;
}

// ---------- the car's look, the flats, the light ----------
// (Under WOW's gilt the car is still CHEAP: when the gilt peels it's the cheap mesh again.)
const STYLES = [[0, 'plain'], [32.72, 'fast'], [33.9, 'sturdy'], [34.92, 'cheap'], [35.44, 'wow'], [36.25, 'cheap'], [36.75, 'keep'],
  [38.3, 'plain'], [43.62, 'ship'], [45.08, 'polish'], [46.46, 'plain'], [47.82, 'show'], [49.5, 'plain']];
function liftStyle(t) {   // each change cross-fades from the last style (the world reads st.lift.from)
  let i = 0; while (i + 1 < STYLES.length && t >= STYLES[i + 1][0]) i++;
  const [a, style] = STYLES[i], from = i > 0 ? STYLES[i - 1][1] : 'plain';
  let p = smooth(between(t, a, a + (style === 'plain' ? 0.5 : 0.28)));
  if (style === 'plain' && from === 'show') p = t < 50.3 ? (flick(t) ? 0.3 : 0.9) * p : 1;   // the stall flickers the glitz off
  return { style, from, p };
}
// The plate over the car: the choice being sung (each held about a second or more).
const LABELS = [[32.72, 'FAST'], [33.9, 'STURDY'], [34.92, 'CHEAP'], [35.44, 'WOW'], [36.75, 'KEEP'], [38.3, null],
  [43.62, 'SHIP'], [45.08, 'POLISH'], [46.46, null], [46.6, 'NEED'], [47.82, 'SHOW'], [49.5, null]];
// Chorus 1: each choice suits someone (their flat goes gold and the car goes to their floor) and has a
// price: quota spent (a tag on the plate, the tube's readout) plus its own cost gag in drawChorusFx.
const CHOICES = [
  { key: 'FAST', t0: 32.72, t1: 33.95, who: '8R', dq: -0.10, sv: 0.5 },    // Kai: a stream with no lag
  { key: 'STURDY', t0: 33.9, t1: 35.1, who: '7R', dq: -0.08, sv: 0.8 },    // the Okafors: it never breaks
  { key: 'CHEAP', t0: 34.92, t1: 36.1, who: '5R', dq: 0.03, sv: 0.3 },     // Sam: a student's budget
  { key: 'WOW', t0: 35.44, t1: 36.75, who: '8L', dq: -0.07, sv: 0.45 },    // Dev: demo day
  { key: 'KEEP', t0: 36.75, t1: 38.15, who: '7R', dq: -0.10, sv: 0.8 },    // the Okafors: built to last
  { key: 'SHIP', t0: 43.62, t1: 45.1, who: '5R', dq: -0.04, sv: 0.6 },     // Sam: due at nine
  { key: 'POLISH', t0: 45.08, t1: 46.55, who: '7R', dq: -0.09, sv: 0.8 },  // the Okafors (Sam waits)
  { key: 'NEED', t0: 46.55, t1: 47.95, who: '4L', dq: -0.03, sv: 0.9 },    // Nana: just call Sam
  { key: 'SHOW', t0: 47.82, t1: 49.5, who: '8L', dq: -0.07, sv: 1 },       // Dev: fireworks
];
const choiceEnd = c => Math.max(c.t1, c.t0 + 1.1);
const choiceEnv = (c, t) => smooth(between(t, c.t0, c.t0 + 0.2)) * (1 - smooth(between(t, choiceEnd(c), choiceEnd(c) + 0.35)));
// The quota through chorus 1: a new session (full), then each choice's price as it's picked. It ends
// where plan.quota picks up for verse 2 (0.45 at 50.5).
function chorusQuota(t) { let q = 1; for (const c of CHOICES) q += c.dq * smooth(between(t, c.t0 + 0.12, c.t0 + 0.6)); return q; }
const orLines = t => Math.max(win(t, 32.6, 38.15, 0.25, 0.25), win(t, 43.55, 49.6, 0.25, 0.25));

function doors(t) {
  let d = win(t, -1, 1.98, 0.1, 0.12);                          // open in the basement until Clawd hops in
  for (const [a, b] of [[5.4, 6.1], [8.82, 9.5], [11.42, 12.1], [13.92, 14.7]]) d = Math.max(d, win(t, a, b, 0.15, 0.2));
  d = Math.max(d, win(t, 15.35, 20.62, 0.15, 0.12));            // Clawd out on your landing
  d = Math.max(d, win(t, 22.18, 27.25, 0.12, 0.08));            // the basement
  for (const o of [28.62, 28.97, 29.32]) d = Math.max(d, win(t, o, o + 0.28, 0.06, 0.1));   // a face on each "ooh"
  return d;
}

// Verse 1: the flat each misfit build really suits flashes gold as it passes.
const SUITS = [['6R', 4.72], ['7L', 8.22], ['8R', 10.95], ['5L', 13.38]];
const flash = (t, a) => clamp01((t - a) / 0.15) * (1 - smooth(between(t, a + 0.8, a + 1.7)));
const AHH = [31.32, 31.84, 32.36, 42.2, 42.7, 43.2];
const OOH = [28.62, 28.97, 29.32, 39.5, 39.9, 40.3];
function lukewarm(t) {   // chorus 1: good for everyone, faintly (and not at all while one is chosen)
  if (t < 31.2 || t > 50.4) return 0;
  let n = 0; for (const a of AHH.slice(0, 3)) n += smooth(between(t, a, a + 0.15));
  let v = 0.11 * n;
  for (const a of AHH) v += 0.16 * kick(t, a, 4);
  return v * (1 - 0.85 * orLines(t)) * (1 - smooth(between(t, 49.5, 50.2)));
}

function dim(t) {
  let d = 0.06 * win(t, 3.1, 3.85, 0.08, 0.25);                  // band stop (light: the board must read)
  if (t >= 17.04 && t < 17.42) d = Math.max(d, flick(t) ? 0.55 : 0.12);   // power-down flicker
  d = Math.max(d, 0.62 * smooth(between(t, 17.36, 17.9)) * (1 - smooth(between(t, 20.8, 21.5))));
  d = Math.max(d, 0.3 * win(t, 21.3, 27.2, 0.5, 0.01));          // the basement
  d = Math.max(d, 0.5 * win(t, 23.9, 27.2, 0.6, 0.01));          // only your words let light in
  d = Math.max(d, 0.64 * win(t, 26.3, 27.2, 0.12, 0.01));        // band stop: stillness, then the crash
  if (t >= 49.5 && t < 50.3) d = Math.max(d, flick(t) ? 0.58 : 0.14);   // the stall
  return d;
}
function bulb(t) {
  return 0.12 * Math.sin((t - 1.72) * 4.2) * kick(t, 1.72, 1.2)
    + 0.2 * Math.sin((t - 22.15) * 4.2) * kick(t, 22.15, 1.0)
    + 0.34 * Math.sin((t - 25.04) * 4.0) * kick(t, 25.04, 0.9)
    + 0.26 * Math.sin((t - 27.2) * 4.4) * kick(t, 27.2, 1.1);
}

export function state(t, st, S) {
  const ly = liftY(t), sty = liftStyle(t);
  st.lift.y = ly; st.lift.style = sty.style; st.lift.from = sty.from; st.lift.styleP = sty.p; st.lift.doors = doors(t);
  if (t > 27.6 && t < 49.6) st.lift.buttons = [...Array(11).keys()].filter(i => t > 27.62 + i * 0.085);   // every floor
  if (t > 3.0 && t < 4.2) st.directoryGlint = between(t, 3.2, 3.9);                                     // the list of who matters
  st.letterbox = Math.max(win(t, 6.05, 7.55, 0.1, 0.15), win(t, 9.25, 10.6, 0.1, 0.15), win(t, 12.05, 13.1, 0.1, 0.15), win(t, 15.5, 15.85, 0.05, 0.1));
  if (t >= 27.2) st.quota = chorusQuota(t);
  for (const id of Object.keys(st.flats)) { const f = st.flats[id]; f.gold = lukewarm(t); f.served = 0; }
  for (const [id, a] of SUITS) {
    const f = st.flats[id]; if (!f) continue;
    f.gold = Math.max(f.gold, flash(t, a)); f.served = Math.max(f.served, flash(t, a + 0.1));
  }
  // verse 1: Kai (8R) is dimmed while your door (just above him) is the read; lit for his own punch-in
  if (t > 4.6 && t < 21 && st.flats['8R']) st.flats['8R'].lit = 0.45 + 0.55 * win(t, 10.45, 11.75, 0.15, 0.25);
  // chorus 1: who each choice suits goes gold; while the "or"s are sung everyone else dims a little
  const spot = {};
  for (const c of CHOICES) {
    const f = st.flats[c.who], e = choiceEnv(c, t); if (!f || e <= 0) continue;
    f.gold = Math.max(f.gold, e); f.served = Math.max(f.served, e * c.sv * smooth(between(t, c.t0, c.t0 + 0.8)));
    spot[c.who] = Math.max(spot[c.who] || 0, e);
  }
  const or = orLines(t);
  if (or > 0) for (const id of Object.keys(st.flats)) st.flats[id].lit = Math.min(st.flats[id].lit ?? 1, 1 - 0.3 * or * (1 - (spot[id] || 0)));
  if (t > 49.5 && t < 50.3 && st.flats['8L']) st.flats['8L'].gold *= flick(t) ? 1 : 0.3;   // the stall
  st.cutWords = smooth(between(t, 23.85, 24.5)) * (1 - smooth(between(t, 27.3, 28.2)));
  st.bulbSwing = bulb(t);
  st.dim = dim(t);
  st.secA = { liftSpeed: (liftY(t) - liftY(t - 0.04)) / 0.04 };
}

// ---------- where things are ----------
const DOORX = P.DOOR.x + P.DOOR.w / 2, F9 = FL(9);
export const BUILD_AT = {
  confetti: { x: DOORX, y: P.DOOR.y - 2, s: 0.6 },       // bolted over your door, aimed at the letterbox
  vault: { x: DOORX, y: F9, s: 0.9 },                     // over your door itself
  pods: { x: DOORX + 150, y: F9, s: 0.85 },               // a tower beside it
  clock: { x: DOORX + 265, y: F9 - 250, s: 0.6 },          // over the subagents
};
// Each build rides up in the car (from `ride`), passes the flat it suits, and is installed at your door.
const DELIVER = [
  { which: 'confetti', ride: -1, install: 5.38, drain: 5.2 },
  { which: 'vault', ride: 8.0, install: 8.8, drain: 8.6 },
  { which: 'pods', ride: 10.74, install: 11.4, drain: 11.3 },
];
const TICKET_WALL = { x: 300, y: 190, s: 0.55 };
const tubeTop = t => P.TUBE.y0 - (P.TUBE.y0 - P.TUBE.y1) * P.quota(t);

// ---------- Clawd ----------
const BELL_X = P.BELL.x - 61;   // where Clawd stands so its raised right nub is just under your bell
const OPEN_TICKET = 0.78;       // the ticket's size in the opening: its words read at phone size
function clawdPos(t) {
  const ly = liftY(t), B = P.BASE.floor;
  const hopTo = (t0, dur, x0, y0, x1, y1, hgt) => { const p = clamp01((t - t0) / dur); return { x: lerp(x0, x1, smooth(p)), y: lerp(y0, y1, p) - hgt * Math.sin(Math.PI * p) }; };
  if (t < 1.9) return { x: 400, y: B };
  if (t < 2.08) return hopTo(1.9, 0.18, 400, B, 520, ly, 55);
  if (t < 15.4) {   // in the car (left of any build riding with it); leans out to hand each build over
    let lean = 0; for (const d of [5.38, 8.8, 11.4, 13.9]) lean = Math.max(lean, win(t, d, d + 0.7, 0.12, 0.3));
    const share = t < 5.5 || (t > 7.9 && t < 8.9) || (t > 10.6 && t < 11.5) ? 1 : 0;
    return { x: 540 - 20 * share + 34 * lean, y: ly };
  }
  if (t < 15.7) return hopTo(15.4, 0.3, 574, ly, 712, F9, 40);
  if (t < 18.66) return { x: 712, y: F9 };
  if (t < 18.9) return hopTo(18.66, 0.24, 712, F9, BELL_X, F9, 24);   // a step toward your bell
  if (t < 20.5) return { x: BELL_X, y: F9 };
  if (t < 20.75) return hopTo(20.5, 0.25, BELL_X, F9, 540, ly, 40);
  if (t < 22.2) return { x: 540, y: ly - 26 * win(t, 20.95, 22.12, 0.3, 0.06) };   // floats in the free fall
  if (t < 22.5) return hopTo(22.2, 0.3, 540, B, 300, B, 50);
  if (t < 27.2) return { x: 300, y: B };
  if (t < 27.42) return hopTo(27.2, 0.22, 300, B, 540, ly, 70);
  let x = 540;
  if (t > 45.08 && t < 46.4) x += 10;                          // leaning into the polishing
  if (t > 49.5 && t < 50.3) x += 2 * Math.sin(t * 90);         // the stall judders
  return { x, y: ly };
}

const POSES = [
  [0.0, { mood: 'happy', armL: 1.45, armR: 1.45, lookY: -0.2 }],             // the ticket, held up to us
  [1.26, { mood: 'proud', armL: 0.2, armR: 0, salute: 1 }],                  // "so I made it good!"
  [1.62, { mood: 'determined', armR: -0.8, salute: 0, look: 0.6 }],          // yank the lever
  [1.9, { mood: 'beam', armL: 0.9, armR: 0.9, hop: 1 }],
  [2.2, { mood: 'happy', armL: 0.3, armR: 0.3, hop: 0, look: 0 }],
  [3.1, { mood: 'hope', look: -1, lookY: -0.3, armL: 0, armR: 0 }],          // the lobby: the directory
  [3.85, { mood: 'happy', look: 0.3, squash: 0.25 }],
  [4.5, { mood: 'happy', look: 1, squash: 0 }],                              // Lily's party lights up
  [5.3, { mood: 'proud', look: 0.8, armR: 0.9, armL: 0.2 }],                 // ta-da: the cannon
  [6.1, { mood: 'happy', look: 1, armR: 0.3, armL: 0.3 }],
  [7.04, { mood: 'beam', armL: 1.3, armR: 1.3 }],                            // BLAST (Clawd loves it)
  [7.45, { mood: 'happy', look: -0.9, armL: 0.2, armR: 0.2 }],               // Mo the trader
  [8.8, { mood: 'proud', look: 1, armR: 0.9 }],
  [9.4, { mood: 'happy', look: 1, armR: 0.2, armL: 0.2 }],
  [10.35, { mood: 'happy', look: 1, armL: 0.1, armR: 0.1 }],                 // Kai the streamer
  [11.4, { mood: 'beam', look: 1, armR: 1.0, armL: 1.0 }],
  [12.2, { mood: 'happy', look: 1, armL: 0.3, armR: 0.3 }],
  [12.78, { mood: 'determined', look: -1, armL: 0.1, armR: 0.1 }],           // the launch team
  [13.9, { mood: 'determined', look: 1, armL: 1.1, armR: -0.2 }],            // conducting the subagents
  [14.35, { mood: 'determined', look: 0.6, armL: -0.2, armR: 1.1 }],
  [14.8, { mood: 'determined', look: 1, armL: 1.1, armR: -0.2 }],
  [15.25, { mood: 'proud', look: 1, armL: 0.4, armR: 0.4 }],
  [15.7, { mood: 'surprise', look: 0.2, lookY: -0.5, armL: 1.0, armR: 1.0 }],   // catches the note
  [16.46, { mood: 'sad', look: 0, lookY: -0.3, armL: 0.6, armR: 0.6, squash: 0.2, tear: 0.6 }],   // reads it, droops
  [17.04, { mood: 'worried', look: -1, armL: -0.4, armR: -0.4, squash: 0.3 }],  // the last token drops
  [17.86, { mood: 'sad', look: 0, lookY: 0.3, armL: -1, armR: -1, squash: 0.45, tear: 1 }],   // QUOTA 100% USED: flattened
  [18.66, { mood: 'hope', look: 1, lookY: -1, armL: -0.3, armR: -0.2, squash: 0.05, emote: '?' }],   // "Guess": your bell
  [19.08, { mood: 'hope', look: 1, lookY: -1, armL: -0.3, armR: 1.45, squash: -0.25, hop: 0.45, emote: null }],   // "didn't": on tiptoe, the nub nearly there…
  [19.42, { mood: 'worried', look: 1, lookY: -1, armL: -0.3, armR: 1.4, squash: -0.22, hop: 0.42, emote: 'sweat' }],   // "ask!": frozen
  [19.8, { mood: 'sad', look: 0, lookY: 0.5, armL: -0.7, armR: -0.8, squash: 0.3, hop: 0, emote: null }],   // …and it drops
  [20.2, { mood: 'sad', look: -0.3, lookY: 0, armL: -0.6, armR: -0.6, squash: 0.2 }],   // a glance at us
  [20.5, { mood: 'surprise', look: 0, armL: 0.7, armR: 0.7, squash: 0 }],    // the fall
  [22.15, { mood: 'surprise', squash: 0.5, armL: 0, armR: 0 }],
  [22.35, { mood: 'determined', armL: 1.2, armR: 1.2, squash: 0, look: -0.3, lookY: -0.8 }],   // clips the ticket up
  [22.9, { mood: 'worried', armL: 0, armR: 0, look: 0, lookY: -0.9, emote: '?' }],   // FOR: blank
  [24.0, { mood: 'hope', look: 0, lookY: -1, lit: 0.8, armL: 0.3, armR: 0.3 }],       // light through your words
  [25.04, { mood: 'hope', look: 0.2, lookY: -1, lit: 1 }],
  [27.2, { mood: 'determined', hop: 1, armL: 1, armR: 1, lit: 0 }],          // the crash
  [27.45, { mood: 'beam', hop: 0, armL: 0.2, armR: 0.2 }],
  [27.6, { mood: 'beam', armR: 0.6, look: 1 }],                              // every button
  [29.9, { mood: 'determined', look: -0.5, lookY: -0.6, armL: 0.8, armR: 0.2 }],   // the split: a token a word
  [31.3, { mood: 'hope', look: 0, armL: 0.2, armR: 0.2 }],
  [32.72, { mood: 'surprise', squash: 0.35, armL: -0.3, armR: -0.3, look: 1 }],       // FAST (Kai, on the right)
  [33.2, { mood: 'happy', squash: 0, look: 1, armL: 0.4, armR: 1.0 }],
  [33.9, { mood: 'determined', squash: 0.2, armL: 0.6, armR: 0.6, look: 1 }],         // STURDY (the Okafors)
  [34.62, { mood: 'determined', squash: 0.45, armL: 0.5, armR: 0.5, look: 1 }],       // thud
  [34.92, { mood: 'worried', squash: -0.15, armL: 1.3, armR: 1.3, look: 0.6, emote: '!' }],   // CHEAP: the cable slips
  [35.3, { mood: 'happy', squash: 0, armL: 0.9, armR: 0.9, look: 1, emote: null }],    // tokens back
  [35.44, { mood: 'beam', armL: 1.3, armR: 1.3, look: -1 }],                           // WOW (Dev, on the left)
  [36.2, { mood: 'worried', armL: 0.2, armR: 0.2, look: -0.4 }],                       // the gilt peels
  [36.75, { mood: 'proud', salute: 1, look: 1 }],                                      // KEEP (the Okafors)
  [37.4, { mood: 'proud', salute: 0, look: 1 }],
  [38.08, { mood: 'hope', look: 1 }],
  [39.9, { mood: 'hope', look: -1 }],
  [40.3, { mood: 'hope', look: 1 }],
  [40.76, { mood: 'determined', look: -0.5, lookY: -0.6, armL: 0.8, armR: 0.2 }],     // the split again
  [42.2, { mood: 'hope', look: 0, armL: 0.2, armR: 0.2 }],
  [43.62, { mood: 'worried', look: 1 }],                                               // SHIP (Sam): half-painted
  [45.08, { mood: 'determined', look: 1, armR: 0.5 }],                                 // POLISH (the Okafors)
  [46.55, { mood: 'happy', look: -1, armL: 0.8, armR: 0.8 }],                          // NEED (Nana)
  [47.82, { mood: 'beam', look: -1, armL: 1.3, armR: 1.3 }],                           // SHOW (Dev)
  [49.5, { mood: 'surprise', look: 0, lookY: -0.6, armL: 0, armR: 0 }],                // the stall
  [50.2, { mood: 'hope', look: 0 }],
];
const BASE_POSE = { look: 0, lookY: 0, mouth: 0, armL: 0, armR: 0, hop: 0, squash: 0, salute: 0, lit: 0, tear: 0 };
function poseAt(t, S) {
  let i = 0; while (i + 1 < POSES.length && t >= POSES[i + 1][0]) i++;
  const cur = { ...BASE_POSE, ...POSES[i][1] }, prev = i > 0 ? { ...BASE_POSE, ...POSES[i - 1][1] } : cur;
  const p = smooth((t - POSES[i][0]) / 0.14), pose = { ...cur };
  for (const k of Object.keys(BASE_POSE)) pose[k] = lerp(prev[k], cur[k], p);
  pose.mouth = singing(t, S); pose.t = t;
  if ('emote' in cur) pose.emote = cur.emote;
  // acting on the beat: a little bounce when pleased, a breath when not
  const bp = S.beatPos ? S.beatPos(t) : 0, f = bp - Math.floor(bp);
  const pleased = pose.mood === 'happy' || pose.mood === 'proud' || pose.mood === 'beam';
  if (pleased && stillness(t) < 0.5) pose.squash += 0.08 * Math.exp(-f * 5);
  else pose.squash += 0.025 * Math.sin(t * 2.6);
  if (t > 27.6 && t < 28.6) pose.armR = 0.4 + 0.5 * Math.abs(Math.sin(t * 19));    // jab, jab, jab
  if ((t > 29.85 && t < 31.1) || (t > 40.7 && t < 41.95)) { pose.armL = 0.5 + 0.5 * Math.sin(t * 11); pose.armR = 0.5 - 0.5 * Math.sin(t * 11); }
  if (t > 19.3 && t < 19.8) pose.armR += 0.07 * Math.sin(t * 45);                  // the nub trembles under the bell
  if (t > 35.5 && t < 36.2) { pose.armL = 1 + 0.4 * Math.sin(t * 16); pose.armR = 1 - 0.4 * Math.sin(t * 16); }   // dancing
  if (t > 45.1 && t < 46.4) pose.armR = 0.5 + 0.12 * Math.sin(t * 70);            // the polisher
  if (t > 47.9 && t < 49.4) { pose.armL = 1.1 + 0.3 * Math.sin(t * 14); pose.armR = 1.1 - 0.3 * Math.sin(t * 14); }
  if (t > 13.9 && t < 15.25) { pose.armL += 0.25 * Math.sin(t * 9); pose.armR -= 0.25 * Math.sin(t * 9); }  // conducting
  return pose;
}
function singing(t, S) {
  for (const l of S.lyrics || []) {
    if (l.start === null || l.start > t || t > l.end + 0.2) continue;
    for (const w of l.words) if (!w.backing && w.s !== null && t >= w.s && t < w.e) {
      return 0.35 + 0.65 * Math.sin(Math.PI * clamp01((t - w.s) / Math.max(0.08, w.e - w.s)));
    }
  }
  return 0;
}

// ---------- props of this section ----------
const CONFETTI_COLS = [P.PAL.gold, P.PAL.goldHi, '#FF6FA5', '#7FD8FF', P.PAL.paper, '#9BE37A', P.PAL.clawd];
function confetti(g, t, t0, x0, y0, n, dir, spread, seed, speed = 700, life = 1.8) {
  const tau = t - t0; if (tau < 0 || tau > life) return;
  const fade = 1 - smooth(between(tau, life * 0.6, life));
  for (let i = 0; i < n; i++) {
    const h1 = hash(seed + i), h2 = hash(seed + i * 3.1 + 50), h3 = hash(seed + i * 7.7 + 100);
    const a = dir + (h1 - 0.5) * spread, sp = speed * (0.35 + 0.65 * h2), drag = 1 / (1 + 2.2 * tau);
    const x = x0 + Math.cos(a) * sp * tau * drag + 14 * Math.sin(tau * (6 + 5 * h3) + i);
    const y = y0 + Math.sin(a) * sp * tau * drag + 380 * tau * tau;
    g.save();
    g.translate(x, y); g.rotate(i + tau * (5 + 8 * h3));
    g.scale(1, Math.cos(tau * (9 + 6 * h1) + i));
    g.globalAlpha = fade;
    g.fillStyle = CONFETTI_COLS[i % CONFETTI_COLS.length];
    g.fillRect(-7, -4, 14, 8);
    g.restore();
  }
}
// A stream of n tokens from the tube's current level into a target, leaving from t0.
function tokenStream(g, t, t0, n, tx, ty, spread = 40, dur = 0.5, gap = 0.06, seed = 1) {
  for (let i = 0; i < n; i++) {
    const s0 = t0 + i * gap, u = (t - s0) / dur;
    if (u < 0 || u > 1) continue;
    const sx = P.TUBE.x + P.TUBE.w / 2, sy = tubeTop(s0);
    const ex = tx + (hash(seed + i) - 0.5) * spread, ey = ty + (hash(seed + i + 9) - 0.5) * spread * 0.6;
    const cx = (sx + ex) / 2 + 90 + 60 * hash(seed + i + 3), cy = Math.min(sy, ey) - 120 - 80 * hash(seed + i + 5);
    const e = inOut(u), x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * ex, y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * ey;
    safe(g, () => cast.token(g, x, y, 0.9 - 0.4 * u, { spin: t * 8 + i }));
  }
}
function star(g, x, y, r, a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'lighter'; g.fillStyle = P.PAL.goldHi;
  g.beginPath();
  for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * 0.22 : r; g.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); }
  g.closePath(); g.fill(); g.restore();
}
// A diagonal glint across a rectangle.
function glint(g, t, r, t0, dur, alpha = 0.6) {
  const p = (t - t0) / dur; if (p < 0 || p > 1) return;
  g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
  const x = lerp(r.x - r.h * 0.5 - 80, r.x + r.w + 80, inOut(p)), wdt = Math.max(40, r.w * 0.16);
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = `rgba(255,241,184,${alpha})`;
  g.beginPath(); g.moveTo(x, r.y + r.h); g.lineTo(x + wdt, r.y + r.h); g.lineTo(x + wdt + r.h * 0.5, r.y); g.lineTo(x + r.h * 0.5, r.y); g.closePath(); g.fill();
  g.restore();
}
// A cream card with bold outline and lines of text: [[text, font, color], ...].
function card(g, x, y, w, h, lines, o = {}) {
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.s) g.scale(o.s, o.s);
  g.fillStyle = 'rgba(8,11,28,0.35)'; g.fillRect(-w / 2 + 5, -h / 2 + 7, w, h);
  g.fillStyle = o.bg || P.PAL.paper; g.strokeStyle = P.PAL.outline; g.lineWidth = 5;
  roundRect(g, -w / 2, -h / 2, w, h, o.r ?? 10); g.fill(); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const lh = h / (lines.length + 0.4);
  lines.forEach(([txt, font, col], i) => { g.font = font; g.fillStyle = col || P.PAL.ink; g.fillText(txt, 0, -h / 2 + lh * (i + 0.7)); });
  g.restore();
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// Residents leaning out toward the shaft (the chorus faces). Simple, bold, lit by the car.
const FOLK = {
  cook: { skin: '#E6B08A', hair: '#3B2A22', shirt: '#E9E4F5', hat: 'chef' },
  violin: { skin: '#C98B63', hair: '#1E1A1A', shirt: '#7A3B52', hat: 'bun', prop: 'violin' },
  warroom: { skin: '#F0C7A0', hair: '#6B3B1F', shirt: '#2F6DB5', hat: 'headset' },
  streamer: { skin: '#8D5B3E', hair: '#141414', shirt: '#6A3FB5', hat: 'cap' },
  trader: { skin: '#E9BE98', hair: '#2A2A33', shirt: '#E8EEF8', hat: 'headset', prop: 'tie' },
  party: { skin: '#F2C9A5', hair: '#A0522D', shirt: '#FF6FA5', hat: 'party', small: true },
  student: { skin: '#B7825C', hair: '#2B1B12', shirt: '#3F8F6B', hat: 'beanie' },
  demo: { skin: '#EFC39E', hair: '#C7A36A', shirt: '#1F2A44', hat: 'mic' },
};
function person(g, t, who, side, floor, lean, o = {}) {
  if (lean <= 0.01) return;
  const f = FOLK[who], dir = side === 'L' ? 1 : -1, edge = side === 'L' ? P.SHAFT.x0 - 12 : P.SHAFT.x1 + 12;
  const r = f.small ? 21 : 26, hx = edge + dir * (lean * (r + 26) - r - 6), hy = FL(floor) - (f.small ? 120 : 165) + (o.bob || 0);
  g.save();
  g.beginPath(); side === 'L' ? g.rect(edge, hy - 200, 400, 400) : g.rect(edge - 400, hy - 200, 400, 400); g.clip();
  g.lineWidth = 5; g.strokeStyle = P.PAL.outline; g.lineJoin = 'round';
  // shoulders and, if asked, an arm
  g.fillStyle = f.shirt;
  roundRect(g, hx - dir * 18 - 34, hy + r * 0.7, 68, 90, 22); g.fill(); g.stroke();
  if (f.prop === 'tie') { g.fillStyle = '#C0392B'; g.beginPath(); g.moveTo(hx - dir * 18 - 5, hy + r + 4); g.lineTo(hx - dir * 18 + 5, hy + r + 4); g.lineTo(hx - dir * 18, hy + r + 40); g.closePath(); g.fill(); }
  if (o.arm != null) {
    const ax = hx - dir * 4, ay = hy + r + 14, len = 58, a = o.arm;
    const ex = ax + dir * Math.cos(a) * len, ey = ay - Math.sin(a) * len;
    g.strokeStyle = P.PAL.outline; g.lineWidth = 17; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey); g.stroke();
    g.strokeStyle = f.shirt; g.lineWidth = 9; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey); g.stroke();
    g.fillStyle = f.skin; g.lineWidth = 4; g.strokeStyle = P.PAL.outline; g.beginPath(); g.arc(ex, ey, 9, 0, 7); g.fill(); g.stroke();
    if (o.watch) { g.fillStyle = P.PAL.goldHi; g.beginPath(); g.arc(lerp(ax, ex, 0.72), lerp(ay, ey, 0.72), 8, 0, 7); g.fill(); g.stroke(); }
    if (o.arm2 != null) {
      const bx = ax - dir * 26, ex2 = bx + dir * Math.cos(o.arm2) * len * 0.9, ey2 = ay - Math.sin(o.arm2) * len * 0.9;
      g.strokeStyle = P.PAL.outline; g.lineWidth = 17; g.beginPath(); g.moveTo(bx, ay); g.lineTo(ex2, ey2); g.stroke();
      g.strokeStyle = f.shirt; g.lineWidth = 9; g.beginPath(); g.moveTo(bx, ay); g.lineTo(ex2, ey2); g.stroke();
      g.fillStyle = f.skin; g.lineWidth = 4; g.strokeStyle = P.PAL.outline; g.beginPath(); g.arc(ex2, ey2, 9, 0, 7); g.fill(); g.stroke();
    }
  }
  // head
  g.lineWidth = 5; g.strokeStyle = P.PAL.outline; g.fillStyle = f.skin;
  g.beginPath(); g.arc(hx, hy, r, 0, 7); g.fill(); g.stroke();
  g.fillStyle = f.hair;
  g.beginPath(); g.arc(hx, hy - 2, r, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); g.fill();
  if (f.hat === 'bun') { g.beginPath(); g.arc(hx - dir * 8, hy - r - 6, 11, 0, 7); g.fill(); g.stroke(); }
  if (f.hat === 'chef') { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(hx - 10, hy - r - 10, 14, 0, 7); g.arc(hx + 4, hy - r - 16, 16, 0, 7); g.arc(hx + 16, hy - r - 8, 12, 0, 7); g.fill(); g.stroke(); g.fillRect(hx - 18, hy - r - 6, 36, 12); }
  if (f.hat === 'cap') { g.fillStyle = '#E8834F'; g.beginPath(); g.arc(hx, hy - 4, r, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillRect(hx + dir * 4, hy - 8, dir * (r + 12), 7); }
  if (f.hat === 'beanie') { g.fillStyle = '#D9534F'; g.beginPath(); g.arc(hx, hy - 3, r + 1, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(hx, hy - r - 6, 7, 0, 7); g.fill(); g.stroke(); }
  if (f.hat === 'party') { g.fillStyle = P.PAL.gold; g.beginPath(); g.moveTo(hx - 14, hy - r + 6); g.lineTo(hx + 14, hy - r + 6); g.lineTo(hx + 3, hy - r - 34); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#FF6FA5'; g.beginPath(); g.arc(hx + 3, hy - r - 36, 6, 0, 7); g.fill(); }
  if (f.hat === 'headset' || f.hat === 'mic') {
    g.strokeStyle = '#1B1B24'; g.lineWidth = 5; g.beginPath(); g.arc(hx, hy, r + 5, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.beginPath(); g.moveTo(hx + dir * (r - 2), hy + 4); g.quadraticCurveTo(hx + dir * (r + 6), hy + r, hx + dir * 6, hy + r - 4); g.stroke();
  }
  if (f.prop === 'violin') { g.fillStyle = '#8B4A1E'; g.strokeStyle = P.PAL.outline; g.lineWidth = 4; g.beginPath(); g.ellipse(hx - dir * 30, hy + r + 12, 12, 20, 0.5 * dir, 0, 7); g.fill(); g.stroke(); }
  // face: eyes to the car, a mouth that opens when delighted
  const lx = dir * 5;
  g.fillStyle = '#141824';
  g.beginPath(); g.arc(hx + lx - 7, hy + 2, 3.6, 0, 7); g.arc(hx + lx + 9, hy + 2, 3.6, 0, 7); g.fill();
  if (o.mouth) { g.beginPath(); g.ellipse(hx + lx + 1, hy + 13, 5, 3 + 4 * o.mouth, 0, 0, 7); g.fill(); }
  else { g.strokeStyle = '#141824'; g.lineWidth = 3; g.beginPath(); g.arc(hx + lx + 1, hy + 9, 6, 0.2, Math.PI - 0.2); g.stroke(); }
  // lit by the car / gold
  if (o.glow) {
    g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(hx, hy, 4, hx, hy, r * 3.2);
    gr.addColorStop(0, `rgba(255,194,61,${0.55 * o.glow})`); gr.addColorStop(1, 'rgba(255,194,61,0)');
    g.fillStyle = gr; g.fillRect(hx - r * 3.2, hy - r * 3.2, r * 6.4, r * 6.4);
  }
  g.restore();
}

// The misfit builds at your door in their steady state (after the quota runs out), exactly as this
// section leaves them at 50.5 s, for later sections to draw: world space, after the world. Each
// build scales with st.builds (plan.yourBuilds: 1 installed, falling to 0 as it comes down in the
// final chorus); the subagents stay slumped until st.builds.minis falls. Also redraws your
// doorbell over them, so it stays visible.
export function drawDoorBuilds(g, t, S, st) {
  const B = st.builds || P.yourBuilds(t), powered = B.powered ?? 0;
  for (const w of ['confetti', 'vault', 'pods']) {
    const k = B[w] ?? 0; if (k <= 0.01) continue;
    const at = BUILD_AT[w];
    g.save(); g.translate(at.x, at.y); if (w === 'confetti') g.rotate(-0.25);
    cast.build(g, w, 0, 0, at.s * k, { powered, p: 1, fire: 0, t, spin: w === 'pods' ? Math.min(t, 17.04) - 11.4 : 0 });
    g.restore();
  }
  const m = B.minis ?? 0;
  if (m > 0.01) {
    const at = BUILD_AT.clock;
    cast.build(g, 'clock', at.x, at.y, at.s * m, { powered, p: 1, t, spin: 6 * Math.min(t, 17.04) });
    for (let i = 0; i < 12; i++) { const sp = miniSpot(i); cast.miniClawd(g, sp.x, sp.y, m, { tired: powered ? 0 : 1, look: i % 2 ? 1 : -1, t, seed: i }); }
  }
  const b = P.BELL, gl = st.bellGlow ?? 0.6;
  g.save(); g.fillStyle = '#C9A24E'; g.strokeStyle = P.PAL.outline; g.lineWidth = 2.5;
  roundRect(g, b.x - 12, b.y - 16, 24, 32, 5); g.fill(); g.stroke();
  g.fillStyle = `rgb(255,${233 + 12 * gl | 0},${192 + 40 * gl | 0})`; g.beginPath(); g.arc(b.x, b.y, 7, 0, 7); g.fill(); g.stroke();
  g.restore();
}

// ---------- the world-space draw ----------
export function draw(g, t, S, st, cam) {
  firstErr = null;
  const ly = st.lift.y, car = P.carRect(ly), B = st.builds || P.yourBuilds(t), powered = B.powered ?? 1;
  const cp = clawdPos(t), pose = poseAt(t, S);

  // the band stop: the directory board (the list of who matters), and a gold ring round "you", floor 9
  if (t > 3.0 && t < 4.4) safe(g, () => {
    const r = P.DIRECTORY;
    star(g, r.x + r.w - 26, r.y + 30, 34, win(t, 3.45, 3.95, 0.08, 0.3));
    star(g, r.x + 40, r.y + r.h - 40, 20, win(t, 3.25, 3.7, 0.08, 0.25));
    const a = win(t, 3.3, 4.35, 0.1, 0.25), p = clamp01((t - 3.3) / 0.4), ex = r.x + 219, ey = r.y + 88;
    g.globalAlpha = a; g.strokeStyle = P.PAL.gold; g.lineWidth = 3.4; g.lineCap = 'round'; g.shadowColor = P.PAL.gold; g.shadowBlur = 10;
    g.beginPath();
    for (let k = 0; k <= 48; k++) { const u = k / 48 * p * 1.1, ang = -2.5 + u * Math.PI * 2, w = 1 + 0.06 * Math.sin(u * 11); g.lineTo(ex + Math.cos(ang) * 34 * w, ey + Math.sin(ang) * 13 * w); }
    g.stroke();
    star(g, ex + 38, ey - 16, 14, win(t, 3.62, 4.1, 0.05, 0.3));
  });

  // the ticket rides along on the car's back wall through verse 1
  if (t >= 1.52 && t < 22.2) safe(g, () => cast.ticket(g, car.x + 36, car.y + 64, 0.17, st.ticket, {}));

  // builds waiting in the car, then installed at your door
  for (const d of DELIVER) if (t >= 1.52 || d.which !== 'confetti') safe(g, () => drawDelivery(g, t, d, ly, B, powered));   // (the opening draws the cannon)
  safe(g, () => drawClock(g, t, B, powered));

  // chorus: the car's panel, slots and indicator
  if (t > 27.2) safe(g, () => drawCarKit(g, t, S, st, car, cp, cam));

  // the four gags at your door
  safe(g, () => drawHandGags(g, t, B, powered));

  // tokens from the tube into each build, as the quota drains
  if (t > 5.1 && t < 6.4) tokenStream(g, t, 5.18, 11, BUILD_AT.confetti.x, BUILD_AT.confetti.y - 30, 50, 0.5, 0.07, 11);
  if (t > 8.5 && t < 9.8) tokenStream(g, t, 8.58, 11, BUILD_AT.vault.x, BUILD_AT.vault.y - 110, 70, 0.5, 0.07, 23);
  if (t > 11.2 && t < 12.6) tokenStream(g, t, 11.28, 11, BUILD_AT.pods.x, BUILD_AT.pods.y - 100, 70, 0.5, 0.07, 37);
  if (t > 13.7 && t < 15.2) tokenStream(g, t, 13.78, 12, 800, F9 - 40, 300, 0.55, 0.06, 51);
  // puffs of tokens as each build pops into the car
  for (const [t0, seed] of [[7.98, 61], [10.7, 71], [13.22, 81]]) if (t > t0 - 0.1 && t < t0 + 0.6) tokenStream(g, t, t0 - 0.25, 5, 560, ly - 60, 60, 0.3, 0.04, seed);

  // the subagents
  safe(g, () => drawMinis(g, t, ly, B, powered));
  // your doorbell, kept visible over the builds (glowing, never rung)
  if (t > 8.7) safe(g, () => {
    const b = P.BELL, gl = st.bellGlow ?? 0.6;
    g.fillStyle = '#C9A24E'; g.strokeStyle = P.PAL.outline; g.lineWidth = 2.5;
    roundRect(g, b.x - 12, b.y - 16, 24, 32, 5); g.fill(); g.stroke();
    g.fillStyle = `rgb(255,${233 + 12 * gl | 0},${192 + 40 * gl | 0})`; g.beginPath(); g.arc(b.x, b.y, 7, 0, 7); g.fill(); g.stroke();
  });

  // chorus residents
  safe(g, () => drawFaces(g, t, ly));

  // Clawd (in the opening, with the ticket held up), and the glass front over it while it rides
  if (t < 1.52) safe(g, () => drawOpening(g, t, S, st, 'world'));
  else safe(g, () => cast.clawd(g, cp.x, cp.y, 1, pose));
  const riding = (t > 2.08 && t < 15.4) || (t > 20.75 && t < 22.2) || t > 27.42;
  if (riding && world.drawLiftFront) safe(g, () => world.drawLiftFront(g, t, S, st, {}));

  // the ticket clipped to the basement wall
  safe(g, () => drawTicket(g, t, st, cp, ly));

  // "my AI built me absolute garbage 😤"
  safe(g, () => drawNote(g, t, cp));

  // the last token drops down the empty tube
  if (t > 16.9 && t < 17.9) safe(g, () => {
    const u = clamp01((t - 16.95) / 0.8), y = lerp(F9 - 380, F9 + 420, u * u);
    cast.token(g, P.TUBE.x + P.TUBE.w / 2, y, 0.8, { spin: t * 6 });
  });

  // chorus effects around the car
  if (t > 27.2) safe(g, () => drawChorusFx(g, t, st, car, cp, cam));

  // confetti: the puff into the kid's party, then the blast at your letterbox
  confetti(g, t, 4.72, car.x + car.w - 20, car.y + 150, 34, -0.15, 1.3, 5, 620, 1.6);
  confetti(g, t, 7.04, P.LETTERBOX.x + 90, P.LETTERBOX.y + 60, 90, -1.2, 6.2, 91, 620, 1.9);   // BLAST: all over your hand
  confetti(g, t, 7.02, BUILD_AT.confetti.x, BUILD_AT.confetti.y + 10, 30, 0.9, 0.7, 131, 900, 1.2);
  if (t > 7.0 && t < 7.4) safe(g, () => {
    const a = 1 - (t - 7.02) / 0.35, r = 30 + 120 * (t - 7.02);
    g.globalCompositeOperation = 'lighter';
    const bx = P.LETTERBOX.x + 90, by = P.LETTERBOX.y + 60;
    const gr = g.createRadialGradient(bx, by, 2, bx, by, r);
    gr.addColorStop(0, `rgba(255,241,184,${0.9 * a})`); gr.addColorStop(1, 'rgba(255,241,184,0)');
    g.fillStyle = gr; g.fillRect(bx - r, by - r, 2 * r, 2 * r);
  });
  rethrow();
}

function drawDelivery(g, t, d, ly, B, powered) {
  const at = BUILD_AT[d.which], inst = clamp01((t - d.install) / 0.42);
  if (d.ride >= 0 && t < d.ride) return;
  const pop = d.ride < 0 ? 1 : backOut((t - d.ride) / 0.22);
  const inCar = { x: 598, y: ly, s: 0.46 };
  if (t < d.install) {   // riding in the car
    cast.build(g, d.which, inCar.x, inCar.y, inCar.s * pop, { powered: 1, p: 1, fire: 0 });
    return;
  }
  // installed (slides out of the car to your door, then stays)
  const e = inOut(inst);
  const x = lerp(inCar.x, at.x, e), y = lerp(inCar.y, at.y, e) - 60 * Math.sin(Math.PI * e), s = lerp(inCar.s, at.s, e);
  const fire = d.which === 'confetti' ? win(t, 7.0, 7.5, 0.04, 0.4) : 0;
  const shake = d.which === 'vault' ? 3 * Math.sin(t * 80) * win(t, 10.1, 10.45, 0.05, 0.1) : 0;
  g.translate(x + shake, y);
  if (d.which === 'confetti') g.rotate(-0.25 * e);
  cast.build(g, d.which, 0, 0, s, { powered, p: 1, fire, t, spin: d.which === 'pods' ? Math.min(t, 17.04) - d.install : 0 });
  if (inst > 0 && inst < 1) star(g, 0, -50 * s, 40, Math.sin(Math.PI * inst));
}
function drawClock(g, t, B, powered) {
  if (t < 13.9) return;
  const at = BUILD_AT.clock, p = backOut((t - 13.9) / 0.35);
  cast.build(g, 'clock', at.x, at.y, at.s * p, { powered, p: 1, t, spin: 6 * Math.min(t, 17.04) });
}

// Your hand at the letterbox (it comes out toward the landing): floss ✓ (then blasted), six digits
// with a sweaty, chalky hand, one view (♥ mum), and the note. The cards are sized to read on a phone.
const OUT = 0.55;   // out of the letterbox, down and to the right (away from the lift and Clawd)
const KEYPAD = { x: 742, y: -2956 };   // the vault's keypad, where the fingertip lands
function drawHandGags(g, t, B, powered) {
  const lb = P.LETTERBOX;
  // 1. floss ✓
  let reach = win(t, 6.15, 7.5, 0.22, 0.2);
  if (reach > 0) {
    const recoil = win(t, 7.04, 7.5, 0.03, 0.3), jit = recoil * 6 * Math.sin(t * 60);
    const h = cast.hand(g, lb.x + jit, lb.y, 0.9, { reach: reach * (1 - 0.3 * recoil), arm: 30, grip: 'pinch', rot: OUT - 0.6 * recoil, t });
    const ticked = t > 6.78, gp = h.grip || h.tip;
    card(g, gp.x + 62, gp.y + 22, 150, 62, [[`${ticked ? '☑' : '☐'} floss`, `700 40px ${P.FONTS.hand}`, P.PAL.ink]], { rot: -0.08 + 0.3 * recoil, s: reach });
    if (ticked && t < 7.3) star(g, gp.x + 22, gp.y + 20, 24, win(t, 6.78, 7.1, 0.03, 0.2));
  }
  // 2. 2FA: the vault's keypad readout, and the hand fumbling at it
  if (t > 8.9 && t < 17.1) {
    const kp = { x: KEYPAD.x + 26, y: KEYPAD.y - 80 }, digits = [9.5, 9.64, 9.8, 9.96, 10.08, 10.22].filter(d => t > d).length;
    const wrong = t > 10.3 && t < 10.9;
    const txt = wrong ? '✗ WRONG' : '•'.repeat(digits) + '_'.repeat(6 - digits);
    g.save(); g.globalAlpha = (t < 10.9 ? 1 : 0.5) * clamp01((t - 8.9) / 0.3) * (powered ? 1 : 0.2);
    card(g, kp.x + (wrong ? 4 * Math.sin(t * 70) : 0), kp.y, 136, 46, [[txt, `700 28px ${P.FONTS.mono}`, wrong ? '#FF5A4F' : '#7CFF9B']], { bg: '#10202A', r: 6 });
    g.restore();
  }
  reach = win(t, 9.35, 10.55, 0.2, 0.2);
  if (reach > 0) {
    const poke = Math.abs(Math.sin((t - 9.45) * 20));
    const aim = Math.atan2(KEYPAD.y - lb.y, KEYPAD.x - lb.x);
    const h = cast.hand(g, lb.x, lb.y, 0.9, { reach, arm: 20, point: 1, tap: poke, sweat: 1, chalk: 1, rot: aim + 0.12 * Math.sin(t * 7), t });
    for (let i = 0; i < 3; i++) {   // sweat drops
      const u = ((t * 1.6 + i / 3) % 1);
      g.save(); g.globalAlpha = reach * (1 - u); g.fillStyle = '#9FD8FF'; g.strokeStyle = P.PAL.outline; g.lineWidth = 2;
      g.beginPath(); g.ellipse(h.wrist.x - 10 + 18 * i, h.wrist.y + 20 + 90 * u, 5, 8, 0, 0, 7); g.fill(); g.stroke(); g.restore();
    }
  }
  // 3. hello world · 1 view (♥ mum)
  reach = win(t, 12.15, 13.05, 0.2, 0.2);
  if (reach > 0) {
    const h = cast.hand(g, lb.x, lb.y, 0.9, { reach, arm: 30, grip: 'pinch', rot: OUT, t });
    const heart = t > 12.55, gp = h.grip || h.tip;
    card(g, gp.x + 78, gp.y + 6, 170, 104, [['hello world', `800 30px ${P.FONTS.display}`, '#1B2553'], ['1 view', `700 26px ${P.FONTS.display}`, '#5A6390'], [heart ? '♥ mum' : ' ', `700 24px ${P.FONTS.display}`, '#E0457B']], { s: reach, r: 14, bg: '#F4F7FF' });
    if (heart) star(g, gp.x + 40, gp.y + 46, 14, win(t, 12.55, 12.9, 0.03, 0.2));
  }
  // 4. the note: the hand flicks it out of the letterbox (the note itself is drawn with Clawd)
  if (t > 15.56 && t < 15.8) cast.hand(g, lb.x, lb.y, 0.9, { reach: win(t, 15.56, 15.8, 0.06, 0.1), arm: 30, grip: 'open', rot: OUT - 0.4, t });
}

// The subagents' places on your landing: a front row, a second tier and a top one by the door.
function miniSpot(i) {
  const row = i < 7 ? 0 : i < 11 ? 1 : 2;
  return { x: row === 0 ? 600 + i * 52 : row === 1 ? 628 + (i - 7) * 44 : DOORX, y: F9 - row * 31 };
}
function drawMinis(g, t, ly, B, powered) {
  if (t < 13.22) return;
  for (let i = 0; i < 12; i++) {
    const h = hash(i + 200);
    const { x: sx, y: sy } = miniSpot(i);
    let x, y, s = 1;
    const pop = backOut((t - 13.22 - i * 0.012) / 0.2);
    if (t < 13.92) { x = 480 + (i % 4) * 40 + 8 * Math.sin(t * 20 + i); y = ly - Math.floor(i / 4) * 30; s = pop; }
    else {
      const u = clamp01((t - 13.92 - i * 0.05) / 0.36);
      x = lerp(480 + (i % 4) * 40, sx, inOut(u)); y = lerp(ly - Math.floor(i / 4) * 30, sy, u) - 50 * Math.sin(Math.PI * u);
    }
    const work = t > 14.3 && powered ? Math.abs(Math.sin(t * 11 + i * 1.7)) : 0;
    const slump = powered ? 0 : smooth(between(t, 17.04 + h * 0.3, 17.4 + h * 0.3));
    cast.miniClawd(g, x, y - 5 * work, s, { tired: slump, armL: slump ? undefined : 0.9 * work, armR: slump ? undefined : 0.9 * (1 - work), look: i % 2 ? 1 : -1, t, seed: i });
    // each carries a SUMMARY.md sheet to pin on your door
    if (t > 14.2 && t < 20 && i % 2 === 0) {
      const pinned = t > 14.6 + i * 0.07;
      const fall = smooth(between(t, 17.1 + h * 0.2, 17.6 + h * 0.2)), fade = 1 - smooth(between(t, 18.8, 19.8));
      const px = pinned ? P.DOOR.x + 6 + (i % 4) * 16 + 6 * h : x, py = pinned ? P.DOOR.y + 30 + Math.floor(i / 4) * 56 : y - 40;
      g.save(); g.globalAlpha = fade;
      g.translate(px + 20 * fall * (h - 0.5), lerp(py, F9 - 8, fall)); g.rotate((h - 0.5) * 0.5 + fall * (h - 0.5) * 2);
      g.fillStyle = P.PAL.paper; g.strokeStyle = P.PAL.outline; g.lineWidth = 2.5; g.fillRect(-13, -17, 26, 34); g.strokeRect(-13, -17, 26, 34);
      g.fillStyle = '#5A6390'; for (let k = 0; k < 4; k++) g.fillRect(-9, -10 + k * 7, 18 - (k === 3 ? 8 : 0), 2.5);
      g.restore();
    }
  }
  // "SUMMARY.md" once, readable, on the door
  if (t > 14.7 && t < 15.6) safe(g, () => card(g, P.DOOR.x + 36, P.DOOR.y - 26, 132, 34, [['SUMMARY.md ×12', `700 17px ${P.FONTS.pixel}`, P.PAL.ink]], { s: backOut((t - 14.7) / 0.25), r: 4 }));
}

// The opening shot, 0 to 4.6 s. Frame 0 is the thumbnail and the loop's last frame: Clawd holds the
// ticket up to us ("make it good" and the empty FOR box readable at phone size) under YOU SAID / MAKE
// IT GOOD, already landed; the words glow as they're sung, then SO I MADE IT / GOOD! lands, and GOOD!
// holds through the band stop. layer 'world' (camera applied, after the world) draws Clawd and the
// ticket and the cannon waiting in the car until the toss lands (t < 1.52); layer 'screen' (after the
// atmosphere) draws the top shade and the title.
// Section D ends the loop with the camera on plan.HANDOFF[0] and drawOpening(g, 0, S, st, layer).
export function drawOpening(g, t, S, st, layer) {
  if (layer === 'screen') { topShade(g, t); title(g, t, S); return; }
  if (t >= 1.52) return;
  const cp = clawdPos(t);
  g.save(); cast.build(g, 'confetti', 598, liftY(t), 0.46, { powered: 1, p: 1, fire: 0 }); g.restore();   // waiting in the car
  g.save(); cast.clawd(g, cp.x, cp.y, 1, poseAt(t, S)); g.restore();
  // the ticket, held up to us; at "so I made it good!" it's tossed onto the car wall
  const toss = clamp01((t - 1.26) / 0.26), car = P.carRect(liftY(t));
  const hx = cp.x + 4, hy = cp.y - 236 + 4 * Math.sin(t * 3);
  const x = lerp(hx, car.x + 36, inOut(toss)), y = lerp(hy, car.y + 64, inOut(toss)) - 70 * Math.sin(Math.PI * toss);
  g.save();
  g.translate(x, y); g.rotate(0.03 * Math.sin(t * 2.3) + toss * 0.4 * (1 - toss));
  cast.ticket(g, 0, 0, lerp(OPEN_TICKET, 0.17, toss), {}, { glow: 0.25, who: 1 - toss, t });
  g.restore();
}

function drawTicket(g, t, st, cp, ly) {
  const fill = st.ticket;
  if (t < 22.2) return;   // (held in the opening, then on the car wall, drawn behind Clawd)
  const w = TICKET_WALL, car = P.carRect(P.BASE.floor);
  const take = clamp01((t - 22.2) / 0.28), up = clamp01((t - 22.42) / 0.36);
  let x, y, s;
  if (up <= 0) { x = lerp(car.x + 36, cp.x, take); y = lerp(car.y + 64, cp.y - 100, take); s = 0.17; }
  else { x = lerp(cp.x, w.x, inOut(up)); y = lerp(cp.y - 100, w.y, inOut(up)); s = lerp(0.17, w.s, backOut(up)); }
  const flicker = win(t, 22.95, 24.05, 0.1, 0.2), glow = 0.9 * win(t, 23.9, 27.2, 0.5, 0.05);
  const who = win(t, 22.9, 27.2, 0.3, 0.1) * (0.6 + 0.4 * Math.sin(t * 5));   // the empty FOR box, asking
  cast.ticket(g, x, y, s, fill, { flicker, glow, who, t, pin: up >= 1 ? 'clip' : false });
  if (up >= 1) star(g, w.x, w.y - 190 * w.s - 3, 26, win(t, 22.78, 23.1, 0.03, 0.25));
}

function drawNote(g, t, cp) {
  if (t < 15.66 || t > 18.2) return;
  const lb = P.LETTERBOX, text = 'my AI built me absolute garbage 😤';
  const fly = clamp01((t - 15.66) / 0.32), drop = clamp01((t - 17.1) / 1.0);
  const hx = cp.x - 8, hy = cp.y - 150;
  let x = lerp(lb.x + 10, hx, easeOut(fly)), y = lerp(lb.y, hy, easeOut(fly)) - 50 * Math.sin(Math.PI * fly);
  let rot = (1 - fly) * 1.2 + 0.04 * Math.sin(t * 2);
  if (drop > 0) { x = hx - 60 * drop + 20 * Math.sin(drop * 9); y = hy + drop * drop * 900; rot = 0.6 * Math.sin(drop * 7); }
  g.globalAlpha = 1 - smooth(between(t, 17.7, 18.2));
  g.translate(x, y); g.rotate(rot);
  cast.note(g, 0, 0, 1.25 * (0.4 + 0.6 * easeOut(fly)), text, { hand: true, font: 'hand' });
}

// The car's own kit in the chorus: every floor button, the five slots (in the "for what?" hooks, shot
// close so their labels read), and the plate over the car naming the choice with its price.
const SLOTS = ['FAST', 'STURDY', 'CHEAP', 'WOW', 'LASTS'];
const PLATE_COL = { FAST: '#7FD8FF', STURDY: '#C9CEDF', CHEAP: '#D9B98C', WOW: '#FF8FD0', KEEP: '#E7B45A', SHIP: '#FF9F43', POLISH: '#F4F7FF', NEED: P.PAL.paper, SHOW: '#FF8FD0' };
function drawCarKit(g, t, S, st, car, cp, cam) {
  g.globalAlpha = 1 - smooth(between(t, 49.6, 50.3)) * (flick(t) ? 1 : 0.6);   // fades out through the stall
  // buttons (B, 1..10) on the right inner wall; lit one by one, all of them
  const bx = car.x + car.w - 18, by = car.y + 62;
  g.fillStyle = '#2A2F45'; g.strokeStyle = P.PAL.outline; g.lineWidth = 3; roundRect(g, bx - 11, by - 10, 22, 150, 5); g.fill(); g.stroke();
  for (let i = 0; i < 11; i++) {
    const lit = t > 27.62 + i * 0.085, y = by + (10 - i) * 13;
    g.fillStyle = lit ? P.PAL.goldHi : '#4A5074'; g.strokeStyle = P.PAL.outline; g.lineWidth = 2.5;
    g.beginPath(); g.arc(bx, y, 5, 0, 7); g.fill(); g.stroke();
    if (lit && t < 28.8) star(g, bx, y, 10, win(t, 27.62 + i * 0.085, 27.9 + i * 0.085, 0.02, 0.2));
  }
  safe(g, () => drawSlots(g, t, S, car, cp));
  // the plate over the car: the choice being sung, and its price
  let lab = null, la = 0;
  for (const [a, w] of LABELS) if (t >= a) { lab = w; la = a; }
  if (!lab) return;
  const z = cam.zoom, fs = 40 / z, stall = t > 49.3 ? (flick(t) ? 1 : 0.2) : 1;
  const cx = car.x + car.w / 2, cy = car.y - 26 / z - fs * 0.66;
  g.globalAlpha *= stall;
  const peel = lab === 'WOW' ? smooth(between(t, 36.2, 36.62)) : 0;
  if (peel > 0) plate(g, 'CHEAP', cx, cy, fs, 1, 0);   // under WOW's gilt: CHEAP
  const pw = plate(g, lab, cx, cy, fs, backOut((t - la) / 0.22), peel);
  const c = CHOICES.find(x => x.key === lab);
  if (c && peel < 0.5) priceTag(g, t, cx + pw / 2 - fs * 0.25, cy + fs * 0.35, c, z, 1 - 2 * peel);
}
function plate(g, lab, cx, cy, fs, sy, peel) {
  g.save();
  g.font = `800 ${fs}px ${P.FONTS.display}`;
  const tw = g.measureText(lab).width, pw = tw + fs * 0.8, ph = fs * 1.3, col = PLATE_COL[lab] || P.PAL.paper;
  g.translate(cx, cy);
  if (peel > 0) { g.translate(-pw / 2, -ph / 2); g.rotate(peel * 1.2); g.translate(pw / 2 + 30 * peel, ph / 2 + 160 * peel * peel); g.globalAlpha *= 1 - peel; }
  g.scale(1, sy);
  g.fillStyle = 'rgba(8,11,28,0.45)'; roundRect(g, -pw / 2 + fs * 0.1, -ph / 2 + fs * 0.15, pw, ph, fs * 0.28); g.fill();
  g.fillStyle = P.PAL.outline; roundRect(g, -pw / 2, -ph / 2, pw, ph, fs * 0.28); g.fill();
  g.strokeStyle = col; g.lineWidth = fs * 0.1; roundRect(g, -pw / 2 + fs * 0.12, -ph / 2 + fs * 0.12, pw - fs * 0.24, ph - fs * 0.24, fs * 0.2); g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = fs * 0.4;
  g.fillText(lab, 0, fs * 0.05);
  g.restore();
  return pw;
}
// A paper price tag on a string: the quota this choice spends (or saves), with a token.
function priceTag(g, t, x, y, c, z, a = 1) {
  const p = backOut((t - c.t0 - 0.12) / 0.25); if (p <= 0 || a <= 0) return;
  const fs = 36 / z, txt = `${c.dq > 0 ? '+' : '−'}${Math.round(Math.abs(c.dq) * 100)}%`, col = c.dq > 0 ? '#1E8A4C' : '#C8303A';
  g.save(); g.translate(x, y); g.rotate(0.2 + 0.07 * Math.sin(t * 3 + c.t0)); g.scale(p, p); g.globalAlpha *= a;
  g.font = `800 ${fs}px ${P.FONTS.display}`;
  const tw = g.measureText(txt).width, h = fs * 1.35, nose = h * 0.34, w = nose + fs * 1.15 + tw + fs * 0.35;
  g.strokeStyle = P.PAL.paperDk; g.lineWidth = 2.5 / z; g.beginPath(); g.moveTo(-fs * 0.5, -fs * 0.45); g.quadraticCurveTo(-fs * 0.1, fs * 0.2, nose * 0.8, 0); g.stroke();
  g.fillStyle = 'rgba(8,11,28,0.4)'; g.beginPath(); g.moveTo(4 / z, 5 / z); g.lineTo(nose + 4 / z, -h / 2 + 5 / z); g.lineTo(w + 4 / z, -h / 2 + 5 / z); g.lineTo(w + 4 / z, h / 2 + 5 / z); g.lineTo(nose + 4 / z, h / 2 + 5 / z); g.closePath(); g.fill();
  g.fillStyle = P.PAL.paper; g.strokeStyle = P.PAL.outline; g.lineWidth = 3.5 / z;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(nose, -h / 2); g.lineTo(w, -h / 2); g.lineTo(w, h / 2); g.lineTo(nose, h / 2); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = P.PAL.outline; g.beginPath(); g.arc(nose * 0.8, 0, fs * 0.09, 0, 7); g.fill();
  cast.token(g, nose + fs * 0.58, 0, fs * 0.027, {});
  g.fillStyle = col; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, nose + fs * 1.15, fs * 0.05);
  g.restore();
}
// The five slots on the car's back wall: in each "Make it good for what?" Clawd flicks a token into
// each slot, one a word (the onsets come from the lyric data). Labels 22 world px: 38 px on screen at
// the split's zoom.
function drawSlots(g, t, S, car, cp) {
  const a = Math.max(win(t, 29.75, 32.9, 0.25, 0.3), win(t, 40.6, 43.75, 0.3, 0.3));
  if (a <= 0) return;
  const whats = lines(S).filter(l => l.start !== null && /^Make it good for what/i.test(l.text || ''));
  const ons = whats.map(l => l.words.filter(w => !w.backing).slice(0, 5).map(w => w.s ?? l.start));
  const x0 = car.x + 8, y0 = car.y + 12, w = 134, rh = 28, spot = (i, j) => [x0 + w - 16 - j * 17, y0 + 4 + i * rh + rh / 2];
  const pulse = AHH.reduce((m, h) => Math.max(m, kick(t, h, 5)), 0);
  g.globalAlpha *= a;
  g.fillStyle = '#141A3C'; g.strokeStyle = P.PAL.outline; g.lineWidth = 3.5;
  roundRect(g, x0, y0, w, rh * 5 + 8, 6); g.fill(); g.stroke();
  g.font = `800 22px ${P.FONTS.display}`; g.textAlign = 'left'; g.textBaseline = 'middle';   // Pixelify's C reads as O
  for (let i = 0; i < 5; i++) {
    const ry = y0 + 4 + i * rh, n = ons.filter(o => o[i] !== undefined && t >= o[i] + 0.16).length;
    if (i) { g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(x0 + 6, ry, w - 12, 1.5); }
    if (n > 0 && pulse > 0.01) { g.fillStyle = `rgba(255,194,61,${0.4 * pulse})`; g.fillRect(x0 + 3, ry + 1, w - 6, rh - 2); }
    g.fillStyle = P.PAL.text; g.fillText(SLOTS[i], x0 + 8, ry + rh / 2 + 1);
    for (let j = 0; j < n; j++) { const [tx, ty] = spot(i, j); cast.token(g, tx, ty, 0.5, {}); }
  }
  // a token hops from Clawd's nub into a slot on each sung word
  ons.forEach((o, j) => o.forEach((on, i) => {
    const u = clamp01((t - (on - 0.04)) / 0.2); if (u <= 0 || u >= 1) return;
    const [tx, ty] = spot(i, j), sx = cp.x + 40, sy = cp.y - 80;
    cast.token(g, lerp(sx, tx, u), lerp(sy, ty, u) - 40 * Math.sin(Math.PI * u), 0.55, { spin: u * 2 });
  }));
}

// What each choice costs, on and around the car (the quota part is on the plate's tag).
function drawChorusFx(g, t, st, car, cp, cam) {
  const cx = car.x + car.w / 2, z = cam.zoom;
  // FAST: it burns tokens: glowing coins spat out under the car as it shoots up
  if (t > 32.72 && t < 33.9) for (let i = 0; i < 16; i++) {
    const t0 = 32.74 + i * 0.03, u = clamp01((t - t0) / 0.75); if (u <= 0 || u >= 1) continue;
    const y0 = liftY(t0) + 8, x = cx + (hash(i + 600) - 0.5) * 130 + 40 * (hash(i + 601) - 0.5) * u, y = y0 + 160 * u + 520 * u * u;
    g.save(); g.globalAlpha = 1 - u;
    g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(x, y, 2, x, y, 34); gr.addColorStop(0, 'rgba(255,170,60,0.8)'); gr.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = gr; g.fillRect(x - 34, y - 34, 68, 68);
    g.globalCompositeOperation = 'source-over';
    cast.token(g, x, y, 0.75, { spin: t * 9 + i, powered: 1 - u });
    g.restore();
  }
  // STURDY: so heavy it lands with a thud; dust puffs out at the floor
  if (t > 34.6 && t < 35.4) for (let i = 0; i < 10; i++) {
    const u = clamp01((t - 34.62) / 0.7), side = i % 2 ? 1 : -1, k = Math.floor(i / 2);
    g.save(); g.globalAlpha = 0.7 * (1 - u); g.fillStyle = '#C9C3D8';
    g.beginPath(); g.arc(cx + side * (car.w / 2 + 10 + 70 * easeOut(u) * (0.6 + 0.2 * k)), car.y + car.h - 10 - 18 * k * u, 12 + 26 * u, 0, 7); g.fill(); g.restore();
  }
  // CHEAP: the cable slips (sparks where it runs over the top), a panel pops off; tokens back to Clawd
  if (t > 34.92 && t < 35.4) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const slot = Math.floor(t * 30) + i, a = -Math.PI / 2 + (hash(slot) - 0.5) * 2.4, d = 6 + 50 * hash(slot + 1);
      g.strokeStyle = `rgba(255,${200 + 50 * hash(slot + 2) | 0},120,${0.9 * hash(slot + 3)})`; g.lineWidth = 3;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * d, car.y - 6 + Math.sin(a) * d); g.lineTo(cx + Math.cos(a) * (d + 18), car.y - 6 + Math.sin(a) * (d + 18)); g.stroke();
    }
    g.restore();
  }
  if (t > 35.0 && t < 36.4) {   // the panel, falling away down the shaft
    const u = clamp01((t - 35.0) / 1.2), y0 = liftY(35.0) - 150;
    g.save(); g.translate(car.x + car.w - 20 + 30 * u, y0 + 700 * u * u); g.rotate(u * 5);
    g.fillStyle = '#8A8F9A'; g.strokeStyle = P.PAL.outline; g.lineWidth = 3; roundRect(g, -18, -26, 36, 52, 3); g.fill(); g.stroke();
    g.fillStyle = P.PAL.outline; for (const [bx, by] of [[-11, -19], [11, -19], [-11, 19], [11, 19]]) { g.beginPath(); g.arc(bx, by, 2.5, 0, 7); g.fill(); }
    g.restore();
  }
  if (t > 35.3 && t < 35.75) for (let i = 0; i < 4; i++) {   // …and three tokens come back
    const u = clamp01((t - 35.32 - i * 0.06) / 0.3);
    if (u > 0 && u < 1) { const sx = car.x + 18 + i * 34, sy = car.y + 40; cast.token(g, lerp(sx, cp.x + (i - 1.5) * 22, u), lerp(sy, cp.y - 70, u) - 30 * Math.sin(Math.PI * u), 0.6, {}); }
  }
  // WOW / SHOW: specks of mirror-ball light across the flats
  const ball = Math.max(win(t, 35.44, 36.7, 0.18, 0.25), win(t, 47.82, 49.6, 0.18, 0.1) * (t > 49.5 ? (flick(t) ? 1 : 0) : 1));
  if (ball > 0) {
    const bx = cx, by = car.y + 54;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) {
      const a = hash(i + 300) * Math.PI * 2 + t * (0.6 + 0.3 * hash(i + 301)), d = 120 + 520 * hash(i + 302);
      const x = bx + Math.cos(a) * d, y = by + Math.sin(a) * d * 0.8, rr = 4 + 7 * hash(i + 303);
      g.fillStyle = `rgba(255,${200 + 55 * hash(i + 304) | 0},${180 + 60 * hash(i + 305) | 0},${0.55 * ball})`;
      g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  }
  // WOW: a week goes by on a calendar hung off the car, and the gilt peels
  if (t > 35.5 && t < 36.95) {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], k = Math.max(0, Math.min(6, Math.floor((t - 35.62) / 0.12)));
    const cw = 104, ch = 112, x = car.x - cw - 10, y = car.y + 24, a = win(t, 35.5, 36.95, 0.1, 0.2);
    g.save(); g.globalAlpha = a;
    g.strokeStyle = '#C9CEDF'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(car.x, car.y + 12); g.lineTo(x + cw / 2, y + 2); g.stroke();
    g.fillStyle = 'rgba(8,11,28,0.4)'; roundRect(g, x + 5, y + 7, cw, ch, 6); g.fill();
    g.fillStyle = P.PAL.paper; g.strokeStyle = P.PAL.outline; g.lineWidth = 4; roundRect(g, x, y, cw, ch, 6); g.fill(); g.stroke();
    g.fillStyle = '#D9534F'; g.fillRect(x + 2, y + 2, cw - 4, 28);
    g.fillStyle = '#FFF6E6'; g.font = `700 20px ${P.FONTS.pixel}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WEEK 1', x + cw / 2, y + 17);
    g.fillStyle = P.PAL.ink; g.font = `800 44px ${P.FONTS.display}`; g.fillText(t < 35.62 ? 'MON' : days[k], x + cw / 2, y + 74);
    const fp = ((t - 35.62) / 0.12) % 1;   // the page flipping away
    if (t > 35.62 && t < 36.46) { g.fillStyle = P.PAL.paperDk; g.globalAlpha = a * (1 - fp); g.fillRect(x + 3, y + 32 - fp * 40, cw - 6, (ch - 36) * (1 - fp)); }
    g.restore();
  }
  if (t > 36.2 && t < 37.6) for (let i = 0; i < 22; i++) {   // gilt flakes
    const u = clamp01((t - 36.22 - hash(i + 400) * 0.35) / 1.0); if (u <= 0 || u >= 1) continue;
    const x = car.x + 10 + hash(i + 401) * (car.w - 20) + 30 * Math.sin(u * 6 + i), y = car.y + 20 + hash(i + 402) * 200 + u * u * 260;
    g.save(); g.translate(x, y); g.rotate(u * 8 + i); g.fillStyle = i % 2 ? P.PAL.gold : P.PAL.goldHi; g.globalAlpha = 1 - u;
    g.beginPath(); g.moveTo(-9, -5); g.lineTo(10, -2); g.lineTo(-2, 8); g.closePath(); g.fill(); g.restore();
  }
  // KEEP: a brass plaque hung under the car, "since 2026"
  const plaque = win(t, 36.9, 38.4, 0.2, 0.3);
  if (plaque > 0) {
    const fs = 30 / z, py = car.y + car.h + fs * 1.1;
    g.save(); g.globalAlpha = plaque;
    g.strokeStyle = '#8A6A2A'; g.lineWidth = 2.5 / z; g.beginPath(); g.moveTo(cx - fs * 2, car.y + car.h); g.lineTo(cx - fs * 2, py); g.moveTo(cx + fs * 2, car.y + car.h); g.lineTo(cx + fs * 2, py); g.stroke();
    g.font = `700 ${fs}px ${P.FONTS.display}`;
    card(g, cx, py, g.measureText('since 2026').width + fs * 1.1, fs * 1.5, [['since 2026', `700 ${fs}px ${P.FONTS.display}`, '#3B2A10']], { bg: '#E7B45A', r: 6, s: backOut((t - 36.9) / 0.25) });
    g.restore();
  }
  // SHIP: half-painted and still wet (the world paints the car); a roller mid-stroke and a sign
  const sc = win(t, 43.62, 45.2, 0.12, 0.3);
  if (sc > 0) {
    g.save(); g.globalAlpha = sc;
    const ry = car.y + 70 + 55 * Math.sin(t * 7);
    g.strokeStyle = P.PAL.outline; g.lineWidth = 4; g.beginPath(); g.moveTo(cx + 40, ry); g.lineTo(cx + 62, ry + 50); g.stroke();
    g.fillStyle = '#3E86C8'; g.strokeStyle = P.PAL.outline; g.lineWidth = 3; roundRect(g, cx + 26, ry - 22, 20, 44, 6); g.fill(); g.stroke();
    const fs = 30 / z;
    g.translate(car.x + car.w + fs * 2.8, car.y + 70); g.rotate(0.12 + 0.05 * Math.sin(t * 2.2));
    g.strokeStyle = '#8A8F9A'; g.lineWidth = 2.5 / z; g.beginPath(); g.moveTo(-fs * 2.2, -fs * 1.2); g.lineTo(-fs, -fs * 0.7); g.stroke();
    card(g, 0, 0, fs * 5.2, fs * 1.6, [['WET PAINT', `700 ${fs}px ${P.FONTS.hand}`, '#C8304A']], { bg: '#FFE36A', r: 4 });
    g.restore();
  }
  // POLISH: sparks off Clawd's polisher; the price is time (a stopwatch spinning; Sam taps his watch)
  if (t > 45.1 && t < 46.45) {
    const ox = cp.x + 58, oy = cp.y - 52;
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const slot = Math.floor(t * 30) + i, a = -0.6 + hash(slot) * 1.9, d = 10 + 60 * hash(slot + 1), l = 8 + 14 * hash(slot + 2);
      g.strokeStyle = `rgba(255,${210 + 40 * hash(slot + 3) | 0},120,${0.9 * hash(slot + 4)})`; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(ox + Math.cos(a) * d, oy + Math.sin(a) * d); g.lineTo(ox + Math.cos(a) * (d + l), oy + Math.sin(a) * (d + l)); g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
    glint(g, t, car, 45.5, 0.5, 0.5);
    glint(g, t, car, 46.0, 0.4, 0.4);
  }
  const sw = win(t, 45.1, 46.55, 0.15, 0.25);
  if (sw > 0) {
    const r = 34 / z, wx = car.x - r - 16, wy = car.y + 40 + r, a = (t - 45.1) * 9;
    g.save(); g.globalAlpha = sw; g.translate(wx, wy); g.scale(backOut((t - 45.1) / 0.25), backOut((t - 45.1) / 0.25));
    g.fillStyle = '#C9CEDF'; g.strokeStyle = P.PAL.outline; g.lineWidth = 3.5 / z; roundRect(g, -r * 0.22, -r * 1.35, r * 0.44, r * 0.4, 3); g.fill(); g.stroke();
    g.fillStyle = P.PAL.paper; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = 'rgba(200,48,74,0.25)'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r * 0.86, -Math.PI / 2, -Math.PI / 2 + (a % (Math.PI * 2))); g.closePath(); g.fill();
    g.strokeStyle = '#C8304A'; g.lineWidth = 4 / z; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * r * 0.8, -Math.cos(a) * r * 0.8); g.stroke();
    g.fillStyle = P.PAL.outline; g.beginPath(); g.arc(0, 0, 3.5 / z, 0, 7); g.fill();
    g.restore();
  }
  // SHOW: fireworks over Dev's flat
  if (t > 48.4 && t < 49.6) {
    const r = P.flatRect(8, 'L');
    for (let k = 0; k < 3; k++) {
      const t0 = 48.45 + k * 0.28, u = clamp01((t - t0) / 0.7); if (u <= 0 || u >= 1) continue;
      const fx = r.x + 90 + k * 120, fy = r.y + 70 + 30 * (k % 2);
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * Math.PI * 2, d = 12 + 80 * easeOut(u);
        g.fillStyle = `rgba(255,${180 + 60 * (i % 2)},${90 + 120 * (k % 2)},${1 - u})`;
        g.beginPath(); g.arc(fx + Math.cos(a) * d, fy + Math.sin(a) * d + 30 * u * u, 4.5 * (1 - u) + 1.5, 0, 7); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
    }
  }
}

// The faces: one per "ooh", three floors leaning out, a neighbour waiting on the polish, the founder.
function drawFaces(g, t, ly) {
  const peek = (o, dur = 0.3) => win(t, o - 0.04, o + dur, 0.08, 0.12);
  if (t > 28.5 && t < 30) {
    person(g, t, 'cook', 'L', 3, peek(28.62), { mouth: 0.6, glow: 0.4 });
    person(g, t, 'violin', 'R', 4, peek(28.97), { mouth: 0.4, glow: 0.4 });
    person(g, t, 'warroom', 'L', 5, peek(29.32), { mouth: 0.8, glow: 0.4 });
  }
  if (t > 39.3 && t < 42.6) {   // three floors' doors open; residents lean out
    person(g, t, 'streamer', 'R', 8, win(t, 39.48, 42.2, 0.2, 0.3), { mouth: 0.5, bob: 3 * Math.sin(t * 4) });
    person(g, t, 'trader', 'L', 7, win(t, 39.88, 42.3, 0.2, 0.3), { mouth: 0.3 });
    person(g, t, 'party', 'R', 6, win(t, 40.28, 42.4, 0.2, 0.3), { mouth: 0.9, bob: 4 * Math.abs(Math.sin(t * 7)) });
  }
  if (t > 44.8 && t < 46.8) {   // polish costs time: a neighbour on floor 5 taps their watch
    const lean = win(t, 44.9, 46.6, 0.25, 0.25), tap = Math.abs(Math.sin(t * 9));
    person(g, t, 'student', 'R', 5, lean, { arm: 1.3 + 0.25 * tap, watch: true });
  }
  if (t > 48.3 && t < 50.2) {   // the demo founder, thrilled
    const lean = win(t, 48.4, 49.9, 0.2, 0.3), cheer = Math.sin(t * 12);
    person(g, t, 'demo', 'L', 8, lean, { arm: 1.7 + 0.2 * cheer, arm2: 1.4 - 0.2 * cheer, mouth: 1, glow: 1 * (t > 49.5 ? (flick(t) ? 1 : 0.2) : 1) });
  }
}

// ---------- the lyric data ----------
// Lines are found in music/ep01/lyrics.json by their words, never by hard-coded start times.
const lines = S => S.lyrics || [];
const lineMatching = (S, re) => lines(S).find(l => l.start !== null && re.test(l.text || '')) || null;
// The line sung most recently at t, and the next one.
function lineNow(S, t) {
  const L = lines(S); let k = -1;
  for (let i = 0; i < L.length; i++) if (L[i].start !== null && L[i].start <= t + 0.05) k = i;
  return { l: L[k] || null, next: L.slice(k + 1).find(x => x.start !== null) || null };
}

// ---------- screen space: light that pierces the dark, speed, lyrics ----------
function scrim(g, y0, y1, a = 0.62) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, 'rgba(8,11,28,0)'); gr.addColorStop(0.2, `rgba(8,11,28,${a})`); gr.addColorStop(0.75, `rgba(8,11,28,${a})`); gr.addColorStop(1, 'rgba(8,11,28,0)');
  g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0);
}
// Words i0..i1 of a sung line, shown by type.huge as a line of its own until `until`.
function piece(l, i0, i1, until) {
  return { lineAt: t => (l && t >= l.start - 0.05 && t < until ? { ...l, words: l.words.slice(i0, i1), end: until } : null) };
}
function hugePiece(g, t, l, i0, i1, until, o) { type.huge(g, t, piece(l, i0, i1, until), { hold: 0, ...o }); }

// One row of title words in the hook style (type.huge's look), for the opening: `landed` rows are
// already in place (frame 0 shows them); others land on their sung onsets. The word being sung glows;
// `stay` keeps a word gold once it has landed.
function titleRow(g, t, ws, o) {
  if (!ws.length || (o.alpha ?? 1) <= 0) return;
  let size = o.size;
  g.font = `800 ${size}px ${P.FONTS.display}`;
  const up = ws.map(w => w.w.toUpperCase());
  let widths = up.map(u => g.measureText(u).width), space = g.measureText(' ').width * 0.9;
  const rowW = widths.reduce((a, b) => a + b, 0) + space * (ws.length - 1), maxW = 1000 / (o.k || 1);
  if (rowW > maxW) { const f = maxW / rowW; size *= f; widths = widths.map(x => x * f); space *= f; g.font = `800 ${size}px ${P.FONTS.display}`; }
  const total = widths.reduce((a, b) => a + b, 0) + space * (ws.length - 1);
  g.save(); g.translate(W / 2, o.y); g.scale(o.k || 1, o.k || 1);
  let x = -total / 2;
  ws.forEach((w, i) => {
    const on = w.s ?? 0, p = o.landed ? 1 : clamp01((t - on) / 0.14);
    if (p > 0) {
      const k = 0.55 + 0.45 * backOut(p), cur = t >= on && t < (w.e ?? on) + 0.1, gold = cur || (o.stay && t >= on);
      g.save();
      g.translate(x + widths[i] / 2, -size * 0.35); g.scale(k, k); g.rotate((1 - easeOut(p)) * -0.06);
      g.globalAlpha = Math.min(1, p * 1.6) * (o.alpha ?? 1);
      g.textBaseline = 'alphabetic';
      g.fillStyle = 'rgba(5,8,22,0.55)'; g.fillText(up[i], -widths[i] / 2 + size * 0.03, size * 0.4);
      g.fillStyle = gold ? o.accent : o.color;
      if (gold) { g.shadowColor = o.accent; g.shadowBlur = size * (cur ? 0.25 : 0.14); }
      g.fillText(up[i], -widths[i] / 2, size * 0.35);
      g.restore();
    }
    x += widths[i] + space;
  });
  g.restore();
}
// The opening title (see drawOpening): YOU SAID / MAKE IT GOOD, on frame 0; SO I MADE IT / GOOD! land as
// sung; then GOOD! rises to the top and holds through the band stop, while the lobby's board is read.
function title(g, t, S) {
  const l = lineMatching(S, /^You said/i);
  if (!l || t > 4.6) return;
  const w = l.words.filter(x => !x.backing), C = P.PAL;
  const rest = 1 - smooth(between(t, 2.7, 3.0)), rise = smooth(between(t, 2.75, 3.25)), last = 1 - smooth(between(t, 4.25, 4.55));
  g.save();
  g.globalAlpha = last;
  scrim(g, 140, lerp(lerp(520, 930, smooth(between(t, 1.2, 1.5))), 440, rise), 0.62);
  g.globalAlpha = 1;
  titleRow(g, t, w.slice(0, 2), { y: 292, size: 138, landed: true, color: C.text, accent: C.gold, alpha: rest });
  titleRow(g, t, w.slice(2, 5), { y: 430, size: 138, landed: true, color: C.text, accent: C.gold, alpha: rest });
  titleRow(g, t, w.slice(5, 9), { y: 640, size: 112, color: '#FFD2BE', accent: C.gold, alpha: rest });
  titleRow(g, t, w.slice(9), { y: lerp(850, 330, rise), size: 210, k: lerp(1, 0.9, rise), color: '#FFD2BE', accent: C.gold, stay: true, alpha: last });
  g.restore();
}

// "Oops, your quota's gone!": a big red rubber stamp, QUOTA 100% USED (section D answers it with
// the same stamp, 8% USED).
function quotaStamp(g, t) {
  const t0 = 17.86, a = win(t, t0, 18.85, 0.01, 0.3);
  if (a <= 0) return;
  const hit = clamp01((t - t0) / 0.12), k = lerp(1.8, 1, easeOut(hit)), red = '#D8322C';
  g.save(); g.translate(540, 600); g.rotate(-0.14); g.scale(k, k);
  g.globalAlpha = a * Math.min(1, hit * 3);
  g.fillStyle = 'rgba(8,11,28,0.4)'; roundRect(g, -372, -140, 760, 300, 26); g.fill();
  g.fillStyle = 'rgba(255,238,230,0.94)'; g.strokeStyle = red; g.lineWidth = 13;
  roundRect(g, -380, -150, 760, 300, 26); g.fill(); g.stroke();
  g.lineWidth = 5; roundRect(g, -356, -126, 712, 252, 16); g.stroke();
  g.fillStyle = red; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `700 64px ${P.FONTS.pixel}`; g.fillText('QUOTA', 0, -40);
  g.font = `700 124px ${P.FONTS.pixel}`; g.fillText('100% USED', 0, 92);
  g.restore();
}

// The corner marks live in the top 120 px: shade it so nothing in the world competes with them.
function topShade(g, t) {
  const open = t < 3.2, a = open ? 0.94 : 0.55, h = open ? 270 : 200, gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, `rgba(6,8,22,${a})`); gr.addColorStop(0.55, `rgba(6,8,22,${a * (open ? 0.75 : 0.45)})`); gr.addColorStop(1, 'rgba(6,8,22,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, h);
}

export function screen(g, t, S, st, cam) {
  firstErr = null;
  if (t >= 4.6) safe(g, () => topShade(g, t));   // (the opening draws its own)
  // your doorbell, glowing in the dark, never rung
  if (t > 17.3 && t < 21.0) safe(g, () => {
    const look = 1 + 0.5 * win(t, 18.66, 20.5, 0.3, 0.3);   // brighter while Clawd looks at it
    const [x, y] = toScreen(cam, P.BELL.x, P.BELL.y), a = Math.min(1, win(t, 17.5, 20.9, 0.5, 0.25) * (0.75 + 0.25 * Math.sin(t * 3.1)) * look);
    const r = 95 * cam.zoom;
    g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(x, y, 2, x, y, r);
    gr.addColorStop(0, `rgba(255,241,184,${0.8 * a})`); gr.addColorStop(0.25, `rgba(255,194,61,${0.45 * a})`); gr.addColorStop(1, 'rgba(255,194,61,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  });
  // the word-shaped light from upstairs, through "make it good" in the ceiling
  if (t > 23.8 && t < 27.6) safe(g, () => wordLight(g, t, st, cam));
  // floors streaking past whenever the camera travels fast
  safe(g, () => streaks(g, t, S, cam));
  // the opening title, then the lyrics
  if (t < 4.6) safe(g, () => drawOpening(g, t, S, st, 'screen'));
  safe(g, () => lyrics(g, t, S, cam));
  safe(g, () => quotaStamp(g, t));
  // the crash at 27.2: the lights slam on
  if (t >= 27.2 && t < 27.6) { g.fillStyle = `rgba(255,241,210,${0.45 * (1 - (t - 27.2) / 0.4)})`; g.fillRect(0, 0, W, H); }
  rethrow();
}

// The light through "make it good" in the ceiling, re-lit above the dark (the world draws the shafts
// under the dim; this keeps your words the brightest thing in the basement). Same geometry as the
// world's cut words: centred x 250 in the ceiling, projected on the floor, sheared by the bulb's swing.
function wordLight(g, t, st, cam) {
  const a = st.cutWords * win(t, 23.8, 27.6, 0.4, 0.3);
  if (a <= 0) return;
  const shear = Math.tan((st.bulbSwing || 0) * 0.9), fx = 250 + 400 * shear;
  const [cx, cy] = toScreen(cam, 250, 22), [px, py] = toScreen(cam, fx, 420), z = cam.zoom;
  g.globalCompositeOperation = 'lighter';
  // the shaft
  const half = 150 * z, gr = g.createLinearGradient(0, cy, 0, py);
  gr.addColorStop(0, `rgba(255,233,184,${0.2 * a})`); gr.addColorStop(1, `rgba(255,194,61,${0.08 * a})`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(cx - half * 0.8, cy); g.lineTo(cx + half * 0.8, cy); g.lineTo(px + half * 1.1, py); g.lineTo(px - half * 1.1, py); g.closePath(); g.fill();
  // your words in the ceiling, and on the floor where the light lands
  g.font = `700 ${74 * z}px ${P.FONTS.hand}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = P.PAL.gold; g.shadowBlur = 16 * z;
  g.fillStyle = `rgba(255,246,222,${0.75 * a})`;
  g.save(); g.translate(cx, cy); g.scale(1, 0.34); g.fillText('make it good', 0, 0); g.restore();
  g.fillStyle = `rgba(255,224,160,${0.45 * a})`;
  g.save(); g.translate(px, py); g.scale(1.3, 0.3); g.fillText('make it good', 0, 0); g.restore();
  g.shadowBlur = 0;
  // warm light on Clawd as the words pass over it
  const [kx, ky] = toScreen(cam, 300, 395), on = Math.exp(-Math.pow((fx - 300) / 120, 2));
  const kg = g.createRadialGradient(kx, ky, 4, kx, ky, 120 * z);
  kg.addColorStop(0, `rgba(255,217,163,${0.3 * a * (0.4 + 0.6 * on)})`); kg.addColorStop(1, 'rgba(255,217,163,0)');
  g.fillStyle = kg; g.fillRect(kx - 120 * z, ky - 120 * z, 240 * z, 240 * z);
  g.globalCompositeOperation = 'source-over';
}

function streaks(g, t, S, cam) {
  const c0 = camera(t - 1 / 30, S), vy = (cam.y - c0.y) * 30 * cam.zoom;   // screen px per second
  const k = clamp01((Math.abs(vy) - 1400) / 5000);
  if (k <= 0) return;
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  const L = Math.min(700, Math.abs(vy) * 0.07);
  for (let i = 0; i < 30; i++) {
    const x = hash(i + 500) * W, par = 0.7 + 0.6 * hash(i + 501);
    const span = H + L, y = (((hash(i + 502) * span - cam.y * cam.zoom * par) % span) + span) % span - L;
    g.strokeStyle = i % 3 ? `rgba(255,217,163,${0.22 * k})` : `rgba(255,194,61,${0.32 * k})`;
    g.lineWidth = 2 + 4 * hash(i + 503);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + L); g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
}

function lyrics(g, t, S, cam) {
  const C = P.PAL;
  if (t < 4.47) return;   // the opening title has the frame (drawOpening)
  if (t < 23.9) { type.band(g, t, S, { y: 1330, size: t > 18.6 && t < 20.8 ? 84 : 74 }); return; }
  if (t < 27.2) {   // the line to remember, huge
    const a = win(t, 23.9, 27.2, 0.15, 0.12), l1 = lineMatching(S, /^I can.t read/i), l2 = lineMatching(S, /^I.m only reading/i);
    g.globalAlpha = a; scrim(g, 110, t > 25 ? 800 : 520, 0.55); g.globalAlpha = 1;
    hugePiece(g, t, l1, 0, 3, 27.15, { y: 260, size: 140 });
    hugePiece(g, t, l1, 3, 5, 27.15, { y: 397, size: 140 });
    hugePiece(g, t, l2, 0, 3, 27.15, { y: 560, size: 118, color: C.goldHi, accent: C.gold });
    hugePiece(g, t, l2, 3, 5, 27.15, { y: 676, size: 118, color: C.goldHi, accent: C.gold });
    return;
  }
  // the hooks: each "Make it good for …" holds until the next line starts
  const { l, next } = lineNow(S, t);
  if (l && /^Make it good/i.test(l.text || '')) {
    const until = next ? next.start : l.end + 0.6, a = win(t, l.start - 0.05, until, 0.12, 0.2);
    g.globalAlpha = a; scrim(g, 120, 620, 0.5); g.globalAlpha = 1;
    hugePiece(g, t, l, 0, 3, until + 0.02, { y: 300, size: 148 });
    hugePiece(g, t, l, 3, 6, until + 0.02, { y: 445, size: 148 });
    return;
  }
  if (t < 49.7) type.band(g, t, capped(S, 48.95), { y: 1330 });   // the "or"s (clear before the band stop)
}
// S with the current line's end capped, so the band fades out early.
function capped(S, end) { return { lineAt: (t, h) => { const l = S.lineAt(t, h); return l && l.end > end ? { ...l, end } : l; } }; }
