// Section D of "Who Lives Here?": the final pre-chorus, the final chorus, the outro and the loop
// back to frame 0 (147.56–200.74 s). Spec: episodes/01-storyboard.md, from "Final pre-chorus".
//
// The story here: Clawd rides up and finally rings your bell; your hand takes the ticket, and it
// comes back with FOR written in; it floats above your door like a lantern. In the chorus the
// camera pushes in on each box as your hand writes it, then pulls out to that line's build coming
// down (the cannon melts into one flame, the vault is boxed, the pods fly off, the minis sit);
// Clawd asks "kg or lb?"; the finished ticket is held full screen. The blind rises on you mid-set,
// curling a dumbbell, and your free thumb taps the one button: a PB, the brightest gold in the video.
// A toy is allowed to be a toy: the season turns, the app folds away, "(my call)". The camera dives
// home and a new "make it good" drops into Clawd's nubs, which is frame 0.
//
// The misfit builds at your door: section A's drawDoorBuilds draws whatever hasn't come down yet
// (exactly as sections B and C show it), and each switches to its teardown here at its moment;
// st.builds is zeroed so nothing else draws a second copy. The last frame matches frame 0 (section
// A at t = 0) apart from dust and the bulb's sway; see LOOP_RESET in state().
import { cameraAt, smooth, easeOut, easeIn, between, lerp, clamp01, W, H } from '../../lib/stage.js';
import * as P from './plan.js';
import * as cast from './cast.js';
import * as type from './type.js';
import * as A from './sec-a.js';
import * as world from './world.js';

export const range = [147.56, 200.74];

const T0 = 147.56, T1 = 200.74;
const PAL = P.PAL, FONTS = P.FONTS;
const F9 = P.floorLevel(9);             // your landing's floor (y of feet)
const LB = P.LETTERBOX, BELL = P.BELL, DOOR = P.DOOR, DOORX = P.DOOR.x + P.DOOR.w / 2;
const HOME = { x: 546, y: F9 };         // Clawd in the lift doorway at your landing
// Clawd's scale: 1.2 as section C leaves it, easing to section A's 1.0 in the dive home.
const clawdScale = t => (t < 198.4 ? 1.2 : lerp(1.2, 1.0, smooth(between(t, 198.4, 199.9))));
const OUT_POS = { x: 688, y: F9 };      // Clawd on your landing, at your door, for the outro
const LANTERN = { x: 470, y: -3352, s: 1.28 };  // the ticket floats, glowing, over the landing in the chorus
const PIN = { x: 588, y: -3168, s: 0.3 };        // then it's pinned to the shaft glass for the outro
const FULL = { x: 468, y: 868, s: 2.84 };        // the screenshot moment, in screen pixels
const HELD_S = 0.36;                             // the ticket as Clawd carries it (a placard)
const LOOP_RESET = true;                         // end on exactly frame 0 (see state())
const BOTS_QUIET = 0.45;                         // the bots after the break: present, quiet
const ROOM = (world.roomRect && world.roomRect(9, 'R')) || { x: 756, y: P.floorTop(9) + 26 };
const PHONE0 = { x: ROOM.x + 276, y: F9 - 227 };  // your phone, one button (world.js draws it)
// Where the world has your phone and your face this frame (it records them as it draws your flat).
function youAt() {
  const r = world.residentAt && world.residentAt('9R');
  return r && Number.isFinite(r.dx) ? { phone: { x: r.dx, y: r.dy }, head: { x: r.x, y: r.y } }
    : { phone: PHONE0, head: { x: ROOM.x + 178, y: F9 - 250 } };
}
// Frame 0 (section A at t = 0): Clawd at CLAWD_AT[0] holding the ticket up to us. From T_OPEN on,
// section A's own drawOpening draws the last frames (so the loop end is its frame 0, pixel for pixel);
// before that Clawd and the new ticket converge on its pose and placement.
const T_OPEN = 200.5;
const F0 = { x: 400, y: P.BASE.floor, tx: 404, ty: P.BASE.floor - 236, ts: 0.78 };
const F0_POSE = { mood: 'happy', look: 0, lookY: -0.2, mouth: 0, armL: 1.45, armR: 1.45, hop: 0, squash: 0, salute: 0, lit: 0, tear: 0 };
const opening = () => (A.drawOpening ? A.drawOpening : null);

// Where section A left the misfit builds (fallbacks match its values).
const BA = A.BUILD_AT || {
  confetti: { x: DOORX, y: P.DOOR.y - 2, s: 0.6 }, vault: { x: DOORX, y: F9, s: 0.9 },
  pods: { x: DOORX + 150, y: F9, s: 0.85 }, clock: { x: DOORX + 265, y: F9 - 250, s: 0.6 },
};
// Section A's twelve minis: a front row, a second tier and one on top.
const MINIS = Array.from({ length: 12 }, (_, i) => {
  const row = i < 7 ? 0 : i < 11 ? 1 : 2;
  return { x: row === 0 ? 600 + i * 52 : row === 1 ? 628 + (i - 7) * 44 : DOORX, y: F9 - row * 31 };
});
const REASONS = ['1 user', 'no login', 'no scale', 'no k8s', 'kg', 'on phone', 'no sync', '1 tap', 'summer', 'no 2FA', 'PB 🔥', 'done ✓'];
// When each build comes down (after its line is written, when the camera pulls out to it).
const DOWN = { confetti: [164.75, 165.85], vault: [167.35, 167.95], pods: [169.9, 170.8], minis: [174.25, 175.6] };
const left = (w, t) => 1 - smooth(between(t, DOWN[w][0], DOWN[w][1]));

// ---------------------------------------------------------------- small helpers
const inOut3 = p => (p = clamp01(p), p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const backOut = p => { p = clamp01(p); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const win = (t, a, b, f = 0.2) => clamp01((t - a) / f) * clamp01((b - t) / f);
const hit = (t, a, d = 0.3) => (t < a ? 0 : Math.exp(-(t - a) / d));          // a decaying accent
const bump = p => Math.sin(Math.PI * clamp01(p));
const mixCam = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), zoom: lerp(a.zoom, b.zoom, p), rot: 0 });
const toScreen = (c, x, y) => ({ x: (x - c.x) * c.zoom + W / 2, y: (y - c.y) * c.zoom + H / 2 });
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
// One broken prop mustn't blank the rest: draw each in a balanced save/restore, remember the
// first failure and rethrow it at the end of the stage so main.js labels it.
let firstErr = null;
function safe(g, fn) { g.save(); try { fn(); } catch (e) { firstErr = firstErr || e; } finally { g.restore(); } }
function rethrow() { if (firstErr) { const e = firstErr; firstErr = null; throw e; } }

// ---------------------------------------------------------------- the lift
function liftY(t) {
  const B = P.BASE.floor;
  if (t <= T0) return B;
  if (t < 147.9) return lerp(B, F9, inOut3(between(t, T0, 147.9)));                 // the whip up
  if (t < 198.1) { const k = t - 147.9; return F9 - 20 * Math.exp(-k * 8) * Math.sin(k * 26); }
  if (t < 199.95) return lerp(F9, B, inOut3(between(t, 198.1, 199.95)));           // the dive
  const k = t - 199.95;
  return B - 9 * Math.exp(-k * 9) * Math.sin(k * 30) * (1 - between(t, 200.45, 200.7));
}
function liftDoors(t) {
  if (t < 147.93) return 0;
  if (t < 197.95) return smooth(between(t, 147.93, 148.08));
  if (t < 200.0) return 1 - smooth(between(t, 197.95, 198.1));
  return smooth(between(t, 200.0, 200.16));
}

// ---------------------------------------------------------------- the ticket's boxes
// cast.ticket's printed boxes (local y of the top, and height, at s = 1).
const ROWS = { for: [-150, 62], good: [-84, 80], dont: [0, 76], cost: [80, 44], you: [128, 56] };
const boxY = (k, dy = 0) => LANTERN.y + LANTERN.s * (ROWS[k][0] + ROWS[k][1] / 2 + dy);
// A push-in on one box: the box sits a little below the middle of the frame, the lyric band above.
const onBox = (k, zoom = 2.25, dy = 0) => ({ x: LANTERN.x + 14, y: boxY(k, dy) + 150 / zoom, zoom });
// Your pen writes each box as it's sung (the pre-chorus's FOR arrives written).
const WRITES = [['good', 163.3, 164.7], ['dont', 166.35, 167.2], ['dont', 168.85, 169.85], ['you', 170.8, 172.2], ['cost', 175.55, 176.55]];
const lin = p => clamp01(p);
function ticketFill(t) {
  if (t < 152.97) return { for: 0, good: 0, dont: 0, cost: 0, you: 0 };
  return {
    for: smooth(between(t, 153.32, 155.0)),
    good: lin(between(t, 163.3, 164.7)),
    dont: 0.375 * lin(between(t, 166.35, 167.2)) + 0.625 * lin(between(t, 168.85, 169.85)),   // "accounts, scale ·" | "fine if it's gone after summer"
    you: lin(between(t, 170.8, 172.2)),
    cost: lin(between(t, 175.55, 176.55)),
  };
}
// Which box the chorus is asking about (it glows).
function activeBox(t) {
  if (t >= 160.5 && t < 162.2) return 'for';
  if (t >= 163.2 && t < 164.9) return 'good';
  if ((t >= 166.2 && t < 167.3) || (t >= 168.75 && t < 170.0)) return 'dont';
  if (t >= 170.7 && t < 172.4) return 'you';
  if (t >= 175.45 && t < 176.7) return 'cost';
  return null;
}

// ---------------------------------------------------------------- camera
const H147 = P.HANDOFF[147.56], HEND = P.HANDOFF[200.74];
const LAND = { x: 600, y: -3080, zoom: 1.52 };
const PRE = { x: 580, y: -3215, zoom: 1.45 };        // the ticket floats up; FOR fills in
const CHORUS = { x: 560, y: -3240, zoom: 1.35 };     // the chorus opens wide
const YOU_WIN = { x: 830, y: -3075, zoom: 1.45 };    // …for you: your window, your shadow mid-curl
const MELT = { x: 650, y: -3120, zoom: 1.6 };        // the cannon melts into one small flame
const DOORW = { x: 660, y: -3020, zoom: 1.5 };       // the vault is boxed; tokens back to your hand
const PODS = { x: 790, y: -3070, zoom: 1.4 };        // the pods fly off
const BEAM = { x: 575, y: -3010, zoom: 1.85 };       // Clawd reads FOR YOU and beams
const MINIS_CAM = { x: 745, y: -2990, zoom: 1.6 };   // the twelve sit down, each with its reason
const KG = { x: 640, y: -2995, zoom: 2.35 };         // "kg or lb?" … "kg ✓", readable
const OUTRO = { x: 905, y: -3068, zoom: 1.9 };
const SEASON = { x: 860, y: -3095, zoom: 1.7 };      // your wall: the calendar, you, the phone
const KEYS = [
  [147.95, LAND],
  [150.3, { x: 606, y: -3080, zoom: 1.62 }],          // Clawd rang; waits
  [151.1, { x: 640, y: -3035, zoom: 1.95 }],          // your hand, the letterbox, the blind lifts an inch
  [152.9, { x: 640, y: -3035, zoom: 1.95 }],
  [153.8, PRE],                                       // the ticket rises; FOR fills in
  [155.3, PRE],
  [158.6, { x: 572, y: -3250, zoom: 1.32 }],          // light pours through it; a new session
  [160.45, CHORUS],
  [160.95, onBox('for', 2.1)],                        // who? FOR glows
  [161.85, onBox('for', 2.13)],
  [162.45, YOU_WIN],                                  // …you
  [163.1, YOU_WIN],
  [163.45, onBox('good')],                            // what? your hand writes GOOD =
  [164.7, onBox('good', 2.29)],
  [165.2, MELT],
  [166.1, MELT],
  [166.45, onBox('dont', 2.25, -14)],                 // fast, sturdy, cheap? DON'T NEED: accounts, scale
  [167.2, onBox('dont', 2.29, -14)],
  [167.65, DOORW],
  [168.72, DOORW],
  [169.05, onBox('dont', 2.25, 12)],                  // built to keep? fine if it's gone after summer
  [169.85, onBox('dont', 2.29, 12)],
  [170.3, PODS],
  [170.72, PODS],
  [171.05, onBox('you')],                             // who? FOR YOU
  [172.2, onBox('you', 2.29)],
  [172.75, BEAM],
  [174.1, BEAM],
  [174.45, MINIS_CAM],
  [175.3, MINIS_CAM],
  [175.65, onBox('cost')],                            // COST: don't burn my quota
  [176.55, onBox('cost', 2.29)],
  [176.9, KG],
  [179.3, KG],
  [180.4, OUTRO],                                     // (behind the full-screen ticket)
  [184.84, OUTRO],
  [187.4, { x: 918, y: -3080, zoom: 2.05 }],          // the blind rises; one tap
  [189.1, { x: 872, y: -3060, zoom: 1.7 }],           // PB: the brightest gold
  [190.45, { x: 866, y: -3060, zoom: 1.68 }],
  [192.3, { x: 690, y: -2790, zoom: 0.96 }],          // just a toy: every other flat stays lit
  [193.3, { x: 690, y: -2790, zoom: 0.96 }],
  [194.3, SEASON],                                    // fine if it's gone when summer's done
  [198.1, SEASON],
];

export function camera(t, S) {
  if (t <= T0) return { ...H147 };
  if (t >= T_OPEN) return { ...HEND };               // frame 0's camera for the loop's last frames
  if (t < 147.95) {                                   // whip up the shaft with the lift
    const p = inOut3(between(t, T0, 147.95));
    const c = mixCam(H147, LAND, p);
    c.zoom -= 0.62 * bump(p);
    return c;
  }
  if (t < 198.1) {
    const c = { ...cameraAt(KEYS, t), rot: 0 };
    const k = t - 147.93;                             // the arrival thunk
    if (k > 0 && k < 0.7) c.y += 10 * Math.exp(-k * 9) * Math.sin(k * 44);
    const k2 = t - 187.7;                             // the PB lands
    if (k2 > 0 && k2 < 0.6) c.zoom *= 1 + 0.025 * Math.exp(-k2 * 7) * Math.sin(k2 * 38);
    // breathe with the song (never at a handoff, and still while the pen writes)
    const L = win(t, 148.2, 197.8, 0.6) * (1 - win(t, 179.3, 184.84, 0.3)) * (1 - 0.8 * win(t, 160.5, 179.3, 0.4));
    c.x += L * 5 * Math.sin(t * 0.83) / c.zoom; c.y += L * 7 * Math.sin(t * 0.61 + 1.3) / c.zoom;
    return c;
  }
  // the dive: ride the lift down the tower, then settle into frame 0
  const p = between(t, 198.1, 199.95), q = smooth(between(t, 198.1, T_OPEN));
  return {
    x: lerp(770, HEND.x, q),
    y: t < 199.95 ? liftY(t) - 190 : HEND.y,
    zoom: lerp(1.5, HEND.zoom, q) - 0.62 * bump(p),
    rot: 0,
  };
}

// ---------------------------------------------------------------- shared state
export function state(t, st, S) {
  st.lift.y = liftY(t);
  st.lift.doors = liftDoors(t);
  st.lift.style = 'plain'; st.lift.styleP = 0;
  st.builds = { confetti: 0, vault: 0, pods: 0, minis: 0, powered: 0 };   // drawn here instead
  for (const id of Object.keys(st.flats)) { st.flats[id].lit = 1; st.flats[id].gold = 0; }
  // After the break the bots stay present but quiet (they're people who matter, for other apps):
  // eased down during the whip, when nothing can be read. botWave/botsSteady ask world.js for no
  // waving and no flicker at this level (it ignores them until it supports them).
  const hush = smooth(between(t, 147.7, 148.1));
  if (st.bots) st.bots = { molty: lerp(st.bots.molty, BOTS_QUIET, hush), jolly: lerp(st.bots.jolly, BOTS_QUIET, hush), hermes: lerp(st.bots.hermes, BOTS_QUIET, hush) };
  st.botWave = 0; st.botsSteady = 1;
  st.fuseLabel = 1;                                   // section C rewrote the fuse box label; it stays rewritten
  // your PB: gold, but lit from behind (backlight()) rather than washed out
  st.youGold = Math.min(st.youGold, 0.62);
  const you = st.flats['9R'];
  if (you) {
    you.served = smooth(between(t, 185.9, 187.7));   // mid-set, your free thumb taps the one button
    you.gold = st.youGold;
  }
  st.dim = 0.42 * bump(between(t, 192.75, 193.45));  // every light dims a breath
  // the season turns, and turns back as the camera dives home to frame 0
  st.autumn = P.autumn(t) * (1 - smooth(between(t, 198.3, 200.1)));
  // your letterbox flap opens for each thing passed through it
  let flap = 0;
  for (const h of HAND_SPANS) flap = Math.max(flap, win(t, h.a - 0.08, h.b + 0.05, 0.08));
  st.letterbox = flap;
  st.cutWords = 0; st.strata = 0; st.bulbSwing = 0;
  // The loop. Frame 0 has a dark basement window, an unlit directory without the bots' plates, an
  // empty floor 10, and a fresh quota. Put them back while neither floor 10 nor the lobby is in shot (198.85–199.05):
  // a new ticket from another flat is a new session. Set LOOP_RESET = false to keep them lit.
  if (LOOP_RESET && t > 198.85) {
    const k = 1 - smooth(between(t, 198.85, 199.05));
    st.baseWindow *= k; st.directoryLit *= k;
    st.bots = { molty: st.bots.molty * k, jolly: st.bots.jolly * k, hermes: st.bots.hermes * k };
    st.quota = lerp(1, st.quota, k);
  }
  // extra fields (the world ignores unknown ones)
  st.clawdLit = clawdLit(t);
  st.ticketGlow = ticketGlow(t);
}

// ---------------------------------------------------------------- Clawd
function clawdLit(t) {
  return Math.max(
    0.85 * win(t, 155.3, 159.4, 0.6),                  // light through your words
    1.0 * win(t, 172.35, 174.4, 0.4),                  // FOR YOU: it's for Clawd too
    0.6 * win(t, 187.7, 192.6, 0.5),                   // your gold spills onto the landing
  );
}
// Clawd is the singer: sung words open its mouth.
function mouthAt(t, S) {
  const line = S.lineAt(t, 0);
  if (!line) return 0;
  for (const w of line.words) {
    if (w.backing || w.s === null || w.e === null) continue;
    if (t >= w.s && t < w.e) return 0.3 + 0.7 * Math.sin(Math.PI * clamp01((t - w.s) / Math.max(0.08, w.e - w.s)));
  }
  return 0;
}
// Where Clawd is and how it stands. hold: 'ticket' means it carries your ticket as a placard.
function clawdAt(t, S) {
  const bp = S.beatPos(t), bob = Math.pow(Math.abs(Math.sin(Math.PI * bp)), 2);
  let x = HOME.x, y = F9, pose = { mood: 'hope', look: 0.7 }, hold = null;
  if (t < 147.93) {                                    // riding the whip, braced
    x = P.SHAFT.cx; y = liftY(t);
    pose = { mood: 'determined', look: 0.4, squash: 0.3 * win(t, T0, 147.8, 0.08) };
  } else if (t < 148.5) {                              // hop out, ring the bell, hop back
    const p = between(t, 147.93, 148.5);
    x = lerp(P.SHAFT.cx, HOME.x, smooth(p)) + 97 * bump(p); hold = 'ticket';
    pose = { mood: 'determined', look: 1, ...cast.hopPose(p, 1.0), armR: 0.95 * win(t, 147.98, 148.36, 0.06) };
  } else if (t < 150.5) {                              // please… waiting, hopeful
    hold = 'ticket';
    pose = { mood: 'hope', look: 0.9, emote: null, squash: 0.08 * Math.exp(-((bp % 1 + 1) % 1) * 5) };
  } else if (t < 151.35) {                             // offer the ticket up to the letterbox
    const p = win(t, 150.5, 151.3, 0.25);
    hold = t < 150.92 ? 'ticket' : null;
    pose = { mood: 'hope', look: 1, emote: null, hop: 0.15 * p, ...(hold ? {} : { armR: 0.9 * p, armL: 0.5 * p }) };
  } else if (t < 152.95) {                             // it's gone in; wait
    const f = Math.sin((t - 151.35) * 5.2);
    x = HOME.x + 3 * f;
    pose = { mood: t < 152.1 ? 'hope' : 'worried', look: t < 152.2 ? 1 : 0.5, emote: t > 152.3 ? 'sweat' : null, squash: 0.06 * Math.max(0, f) };
  } else if (t < 153.85) {                             // out it comes, up it goes
    const p = between(t, 152.95, 153.5);
    x = HOME.x - 14 * smooth(p);
    pose = { mood: 'surprise', look: -0.3, lookY: -1, ...cast.hopPose(p, 0.5), emoteK: 1 };
  } else if (t < 155.3) {                              // FOR: me, mid-set, one sweaty hand
    x = HOME.x - 14;
    pose = { mood: t < 154.5 ? 'surprise' : 'hope', look: -0.4, lookY: -1, emote: t < 154.5 ? '!' : 'sparkle' };
  } else if (t < 160.5) {                              // I'm only reading your prompt: light
    x = lerp(HOME.x - 14, HOME.x, smooth(between(t, 159.5, 160.3)));
    const p = between(t, 157.2, 157.75);
    pose = { mood: t < 158.8 ? 'beam' : 'proud', look: -0.3, lookY: -0.8, armL: 1.1 * win(t, 155.4, 158.6, 0.4), ...(p > 0 && p < 1 ? cast.hopPose(p, 0.6) : {}) };
  } else if (t < 179.3) {
    ({ x, y, pose } = chorusClawd(t, S, bob));
  } else if (t < 184.84) {                             // (behind the ticket) walk to the landing
    const p = smooth(between(t, 180.0, 181.2));
    x = lerp(HOME.x, OUT_POS.x, p);
    pose = { mood: 'happy', look: 1, walk: p > 0 && p < 1 ? t * 18 : undefined };
  } else if (t < 197.8) {
    x = OUT_POS.x;
    const mood = t < 185.4 ? 'hope' : t < 187.7 ? 'surprise' : t < 190.4 ? 'beam' : t < 192.7 ? 'proud' : 'happy';
    const h1 = between(t, 187.72, 188.2), h2 = between(t, 190.3, 190.62);
    const reads = win(t, 195.9, 197.7, 0.2);          // looks up at your note: (my call)
    pose = { mood: reads > 0.5 ? 'happy' : mood, look: reads > 0.5 ? 0.4 : 1, lookY: reads > 0.5 ? -1 : -0.5, emote: mood === 'proud' || reads > 0.5 ? null : undefined,
      salute: win(t, 190.5, 192.6, 0.25), ...(h1 > 0 && h1 < 1 ? cast.hopPose(h1, 0.7) : h2 > 0 && h2 < 1 ? cast.hopPose(h2, 0.35) : {}) };
  } else if (t < 198.1) {                              // hop back into the lift
    const p = between(t, 197.8, 198.1);
    x = lerp(OUT_POS.x, P.SHAFT.cx, smooth(p));
    pose = { mood: 'happy', look: -1, ...cast.hopPose(p, 0.8) };
  } else if (t < 199.95) {                             // the dive
    x = P.SHAFT.cx; y = liftY(t);
    pose = { mood: 'happy', look: -0.6, squash: -0.2 * bump(between(t, 198.1, 199.95)), armL: 1.3, armR: 1.3 };
  } else if (t < 200.36) {                             // hop out to frame 0's spot
    const p = between(t, 199.97, 200.36);
    x = lerp(P.SHAFT.cx, F0.x, smooth(p)); y = liftY(t);
    pose = { mood: 'hope', look: -0.5, emote: null, ...cast.hopPose(p, 0.9) };
  } else {                                             // arms up for the new ticket: frame 0
    x = F0.x; y = F0.y;
    const k = smooth(between(t, 200.36, 200.5));
    pose = { ...F0_POSE, mood: k < 0.5 ? 'hope' : 'happy', armL: lerp(0.5, 1.45, k), armR: lerp(0.5, 1.45, k), squash: 0.2 * bump(between(t, 200.36, 200.48)) };
    pose.mouth = 0.35 * smooth(between(t, 200.52, T1));   // about to sing "You said make it good"
    pose.t = t - T1;                                      // section A's clock reads 0 at frame 0
    return { x, y, pose, hold: null };
  }
  pose.lit = Math.max(pose.lit || 0, clawdLit(t));
  pose.mouth = mouthAt(t, S);
  pose.t = t;
  return { x, y, pose, hold };
}

function chorusClawd(t, S, bob) {
  let x = HOME.x, y = F9, pose;
  const pleased = 0.07 * Math.exp(-((S.beatPos(t) % 1 + 1) % 1) * 5);
  if (t < 161.95) pose = { mood: 'happy', look: -0.5, lookY: -1, armL: 1.45 * win(t, 160.5, 161.9, 0.2) };   // points up at FOR
  else if (t < 163.18) pose = { mood: 'hope', look: 1, emote: null };                                    // …that's you
  else if (t < 166.17) pose = { mood: t < 165.5 ? 'surprise' : 'happy', look: 1, lookY: -0.8 };          // the cannon melts
  else if (t < 168.1) pose = { mood: 'proud', look: 1, emote: null };                                    // the vault, boxed
  else if (t < 169.4) pose = { mood: 'happy', look: 1, armR: 0.8 * win(t, 168.1, 169.3, 0.15) };        // tokens back to you
  else if (t < 170.7) pose = { mood: 'happy', look: 1, lookY: -0.6 };                                    // the pods fly off
  else if (t < 174.12) {                                                                                  // FOR YOU: it's for Clawd too
    const h = between(t, 173.0, 173.5);
    pose = { mood: t < 172.55 ? 'surprise' : 'beam', look: -0.4, lookY: -1, emote: t < 172.55 ? '!' : 'heart', emoteK: backOut(between(t, 172.55, 172.85)),
      armL: 1.2 * win(t, 172.9, 174.0, 0.2), armR: 1.2 * win(t, 172.9, 174.0, 0.2), ...(h > 0 && h < 1 ? cast.hopPose(h, 0.9) : {}) };
  } else if (t < 176.74) pose = { mood: 'proud', look: 1 };                                             // the minis sit down
  else if (t < 177.95) {                                                                                  // "kg or lb?", held up to the letterbox
    x = HOME.x + 24 * smooth(between(t, 176.74, 177.05));
    pose = { mood: 'determined', look: 1, armR: 1.25 * smooth(between(t, 176.74, 176.95)), holding: 'note', item: 'kg or lb?', itemHand: false, itemScale: 0.95, hop: 0.25 * bump(between(t, 177.55, 177.95)) };
  } else if (t < 178.3) { x = HOME.x + 24; pose = { mood: 'hope', look: 1, emote: '?' }; }
  else {                                                                                                  // "kg": got it
    x = HOME.x + 24 * (1 - smooth(between(t, 179.0, 179.3)));
    const h = between(t, 178.8, 179.1);
    pose = { mood: 'happy', look: 0.4, armR: 1.1, holding: 'note', item: 'kg ✓', itemHand: true, itemScale: 0.68, ...(h > 0 && h < 1 ? cast.hopPose(h, 0.4) : {}) };
  }
  if (!pose.hop && (pose.mood === 'happy' || pose.mood === 'proud')) pose.squash = (pose.squash || 0) + pleased;
  return { x, y, pose };
}

// ---------------------------------------------------------------- the ticket's path
// World pose of your ticket, or null while Clawd carries it (drawn by cast.clawd), while your hand
// has it, or while it's at the lens (ticketScreen).
function ticketWorld(t, S) {
  if (t < 153.1) return null;
  if (t < 179.3) {                                     // let go, it floats up and stays there, glowing
    const p = between(t, 153.1, 153.8), L = lanternAt(t, S), o = { x: TICKET_OUT.x - 44, y: TICKET_OUT.y + 4 };
    const calm = t > 160.3 ? 0.35 : 1;                 // near-still while the pen writes on it
    const bp = S.beatPos(t), bobY = 5 * calm * Math.sin(Math.PI * bp * 0.5), bobR = 0.012 * calm * Math.sin(Math.PI * bp * 0.25);
    return {
      x: lerp(o.x, L.x, smooth(p)), y: lerp(o.y, L.y, smooth(p)) - 60 * bump(p) + bobY * smooth(p),
      s: lerp(0.3, L.s, backOut(p)), rot: lerp(-0.06, 0, smooth(p)) + bobR,
    };
  }
  if (t < 184.7) return null;
  return { x: PIN.x, y: PIN.y, s: PIN.s, rot: -0.05, pin: true };
}
// In the pre-chorus the lantern drifts with the camera to keep its place in the shot; from the
// chorus on it stays put and the camera moves to it.
function lanternAt(t, S) {
  const k = clamp01((t - 153.1) / 0.7) * (1 - smooth(between(t, 159.9, 160.45)));
  if (k <= 0) return LANTERN;
  const c = camera(t, S);
  return {
    x: LANTERN.x + 0.8 * k * (c.x - PRE.x), y: LANTERN.y + 0.9 * k * (c.y - PRE.y),
    s: LANTERN.s * (1 + 0.85 * k * (PRE.zoom / c.zoom - 1)),
  };
}
// Screen pose of the ticket when it's brought to the lens, or null.
function ticketScreen(t, S) {
  if (t < 179.3 || t >= 184.7) return null;
  const lan = ticketWorld(179.29, S), cam0 = camera(179.29, S), a = toScreen(cam0, lan.x, lan.y);
  const from = { x: a.x, y: a.y, s: lan.s * cam0.zoom, rot: lan.rot };
  const cam1 = camera(184.7, S), b = toScreen(cam1, PIN.x, PIN.y);
  const to = { x: b.x, y: b.y, s: PIN.s * cam1.zoom, rot: -0.05 };
  const pin = inOut3(between(t, 179.3, 179.75)), unpin = inOut3(between(t, 183.75, 184.7));
  const base = unpin > 0 ? to : from, k = unpin > 0 ? 1 - unpin : pin;
  return { x: lerp(base.x, FULL.x, k), y: lerp(base.y, FULL.y, k), s: lerp(base.s, FULL.s, k), rot: lerp(base.rot, 0, k), full: k };
}
function ticketGlow(t) {
  return Math.max(0.12 + 0.2 * between(t, 153.3, 153.95),
    win(t, 155.22, 159.0, 0.5),                         // light pours through the whole ticket
    0.3 * win(t, 159.0, 179.4, 0.8));
}
// Draw the ticket at (x, y); returns the pen point in the caller's coordinates while a box is being
// written (for your hand), else null.
function drawTicket(g, t, x, y, s, rot, flat, fill, o = {}) {
  g.translate(x, y); if (rot) g.rotate(rot);
  if (flat) g.scale(1, 1 - 0.94 * flat);
  const r = cast.ticket(g, 0, 0, s, fill, { t, glow: o.glow || 0, mycall: o.mycall || 0, pin: o.pin }) || {};
  g.scale(s, s);
  const act = o.active && ROWS[o.active];
  if (act) {                                            // the box being asked about glows gold
    const k = 0.7 + 0.3 * Math.sin(t * 6);
    g.save(); g.shadowColor = PAL.gold; g.shadowBlur = 14; g.strokeStyle = `rgba(255,194,61,${k})`; g.lineWidth = 3.5;
    rr(g, -142, act[0] - 2, 284, act[1] + 4, 7); g.stroke(); g.restore();
  }
  if (o.stamp > 0) stamp(g, o.stamp, o.stampHit ?? 1);
  if (!r.nib || flat) return null;
  const c = Math.cos(rot || 0), sn = Math.sin(rot || 0);
  return { x: x + c * r.nib.x - sn * r.nib.y, y: y + sn * r.nib.x + c * r.nib.y };
}
// The quota stamp answers section A's red "QUOTA 100% USED" (17.9 s): the same rubber stamp, the
// same tilt and slam, in green, 8% USED. Drawn at A's stamp size (760 × 300) scaled onto the ticket.
function stamp(g, a, hitP) {
  const green = '#2E8B57', k = 0.2 * lerp(1.8, 1, easeOut(hitP));
  g.save();
  g.translate(78, 192); g.rotate(-0.14); g.scale(k, k);             // slammed on, over the bottom edge
  g.globalAlpha *= a * Math.min(1, hitP * 3);
  g.fillStyle = 'rgba(8,11,28,0.3)'; rr(g, -372, -140, 760, 300, 26); g.fill();
  g.fillStyle = 'rgba(236,250,240,0.94)'; g.strokeStyle = green; g.lineWidth = 13;
  rr(g, -380, -150, 760, 300, 26); g.fill(); g.stroke();
  g.lineWidth = 5; rr(g, -356, -126, 712, 252, 16); g.stroke();
  g.fillStyle = green; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `700 64px ${FONTS.pixel}`; g.fillText('QUOTA', 0, -40);
  g.font = `700 124px ${FONTS.pixel}`; g.fillText('8% USED', 0, 92);
  g.restore();
}

// ---------------------------------------------------------------- world-space action
export function draw(g, t, S, st, cam) {
  firstErr = null;
  const c = clawdAt(t, S);
  const fill = ticketFill(t);
  drawBuilds(g, t, S, st);
  if (t < 151.4) safe(g, () => bellRing(g, t));
  if (t > 155.1 && t < 159.6) safe(g, () => lightRays(g, t));
  if (t > 155.0 && t < 158.2) safe(g, () => tubeRefill(g, t));
  if (t > 187.4 && t < 192.8) safe(g, () => backlight(g, t, st));
  if ((st.letterbox || 0) > 0.01) safe(g, () => {   // warm light from your flat spills out of the slot
    const a = st.letterbox, r = g.createRadialGradient(LB.x, LB.y, 4, LB.x, LB.y, 150);
    r.addColorStop(0, `rgba(255,214,150,${0.7 * a})`); r.addColorStop(1, 'rgba(255,190,110,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = r; g.fillRect(LB.x - 150, LB.y - 150, 300, 300);
  });
  safe(g, () => drawHand(g, t, S, fill));
  const open = t >= T_OPEN && opening();
  if (open) safe(g, () => open(g, t - T1, S, st, 'world'));   // section A's frame 0, as the loop closes
  if (t > 200.28 && !open) safe(g, () => cannonAgain(g, t));
  // Clawd (carrying your ticket as a placard until your hand takes it)
  if (!open) safe(g, () => {
    const pose = { ...c.pose };
    if (c.hold === 'ticket') Object.assign(pose, { holding: 'ticket', itemScale: HELD_S * backOut(between(t, 147.9, 148.12)), fill: {}, ticket: { glow: 0.15 } });
    cast.clawd(g, c.x, c.y, clawdScale(t), pose);
  });
  if (t > 194.9 && t < 196.2) safe(g, () => appFolds(g, t));
  // the end: a new ticket from another flat drops out of the chute into Clawd's nubs
  if (t > 200.12 && !open) safe(g, () => newTicket(g, t));
  // your ticket, in the world, and your pen writing on it
  const tw = ticketWorld(t, S);
  let nib = null;
  if (tw) safe(g, () => { nib = drawTicket(g, t, tw.x, tw.y, tw.s, tw.rot, tw.flat, fill,
    { glow: st.ticketGlow ?? ticketGlow(t), active: activeBox(t), pin: tw.pin, stamp: t > 184 ? 1 : 0 }); });
  if (t > 162.9 && t < 176.9) safe(g, () => penHand(g, t, cam, nib));
  if (t > 147.9 && t < 148.3) safe(g, () => arrivalDust(g, t));
  rethrow();
}

// Your pen: the arm reaches in from beyond the frame's bottom-right corner and the pen point
// follows the ticket's nib (cast.hand's fist-and-pen tip sits at (arm + 64.7, 28.6) along the arm).
const PEN_S = 1.0, NIB = 28.6;
const PEN_AT = { good: [-128, -36, 40, -14], dont: [-36, 19, 60, 60], you: [-62, 147, 20, 169], cost: [-84, 99, 90, 99] };   // start, end (ticket-local)
function penHand(g, t, cam, nib) {
  for (const [key, a, b] of WRITES) {
    if (t < a - 0.28 || t > b + 0.32) continue;
    const reach = t < a ? easeOut(between(t, a - 0.28, a)) : t > b ? 1 - smooth(between(t, b, b + 0.32)) : 1;
    let T = t >= a && t <= b ? nib : null;
    if (!T) { const q = PEN_AT[key], e = t > b ? 2 : 0; T = { x: LANTERN.x + LANTERN.s * q[e], y: LANTERN.y + LANTERN.s * q[e + 1] }; }
    const O = { x: cam.x + (1190 - W / 2) / cam.zoom, y: cam.y + (1720 - H / 2) / cam.zoom };
    const dx = T.x - O.x, dy = T.y - O.y, L = Math.hypot(dx, dy) / PEN_S;
    const lx = Math.sqrt(Math.max(1, L * L - NIB * NIB)), base = Math.atan2(dy, dx), flip = Math.cos(base) < -0.01;
    const rot = base - Math.atan2(flip ? -NIB : NIB, lx);
    cast.hand(g, O.x, O.y, PEN_S, { reach, arm: Math.max(20, lx - 64.7), rot, flipY: flip, holding: 'pen', sweat: 0.4, chalk: 1, t });
  }
}

// Your hand out of the letterbox: it takes the ticket, gives it back written, catches your tokens
// (CHEAP), takes Clawd's note and hands back your answer. [a start, m grab, b end, pk peak reach].
const HAND_ROT = Math.PI + 0.12, HAND_UP = Math.PI + 0.45;   // out of the slot, towards the lift
const HAND_SPANS = [
  { kind: 'take', a: 150.62, m: 150.92, b: 151.32, pk: 0.85, rot: HAND_UP },
  { kind: 'give', a: 152.9, m: 153.1, b: 153.35, pk: 0.8, rot: HAND_ROT },
  { kind: 'tokens', a: 168.1, m: 168.85, b: 169.2, pk: 0.75, rot: HAND_ROT },
  { kind: 'noteIn', a: 177.8, m: 177.95, b: 178.15, pk: 0.25, rot: HAND_ROT },
  { kind: 'noteOut', a: 178.12, m: 178.3, b: 178.5, pk: 0.25, rot: HAND_ROT },
];
const HAND_S = 0.9;
function handReach(t, h) {
  if (t < h.a || t > h.b) return 0;
  return t < h.m ? h.pk * easeOut(between(t, h.a, h.m)) : h.pk * (1 - smooth(between(t, h.m + 0.06, h.b)));
}
// Where the pinch is, for a reach (mirrors cast.hand's geometry: arm 80 + hand 64, pinch at +48).
function handGrip(reach, rot = HAND_ROT) {
  const xw = reach * 144 - 64, gx = HAND_S * (xw + 48), gy = HAND_S * 11, c = Math.cos(rot), sn = Math.sin(rot);
  return { x: LB.x + c * gx - sn * gy, y: LB.y + sn * gx + c * gy };
}
const TICKET_OUT = handGrip(0.8);                     // where your hand lets go of the written ticket
function drawHand(g, t, S, fill) {
  for (const h of HAND_SPANS) {
    if (t < h.a || t > h.b) continue;
    const reach = handReach(t, h), held = t >= h.m;
    const pose = { reach, rot: h.rot, sweat: 0.5, chalk: 1, t, grip: 'open' };
    if (h.kind === 'take') pose.grip = held ? 'pinch' : 'open';
    if (h.kind === 'give') pose.grip = held ? 'open' : 'pinch';
    if (h.kind === 'tokens') pose.grip = held ? 'fist' : 'open';
    if (h.kind === 'noteIn' && held) Object.assign(pose, { holding: 'note', item: 'kg or lb?', itemHand: false, itemScale: 1.27 });
    if (h.kind === 'noteOut' && !held) Object.assign(pose, { holding: 'note', item: 'kg ✓', itemHand: true, itemScale: 0.9 });
    const r = cast.hand(g, LB.x, LB.y, HAND_S, pose) || {};
    const gp = r.grip || handGrip(reach, h.rot);
    if (h.kind === 'take' && held) {                   // your ticket, pinched at its right edge, in through the slot
      const f = smooth(between(t, 151.1, 151.3));
      drawTicket(g, t, gp.x - 51, gp.y - 2, HELD_S * 1.2 * (1 - 0.3 * f), 0.04, f, {}, { glow: 0.15 });
    }
    if (h.kind === 'give' && !held) {                  // and back out, written
      const f = 1 - smooth(between(t, 152.92, 153.05));
      drawTicket(g, t, gp.x - 44, gp.y + 4, 0.3, -0.06, f, fill, { glow: 0.2 });
    }
    if (h.kind === 'tokens') cheapTokens(g, t, gp);
  }
}

// ---- the misfit builds, and how each comes down
function drawBuilds(g, t, S, st) {
  // What hasn't come down yet is drawn by section A's own drawer, exactly as sections B and C show
  // it; each build switches to its teardown here at its moment.
  const keep = { confetti: t < DOWN.confetti[0] ? 1 : 0, vault: t < DOWN.vault[0] ? 1 : 0, pods: t < DOWN.pods[0] ? 1 : 0, minis: t < DOWN.minis[0] ? 1 : 0, powered: 0 };
  const own = !A.drawDoorBuilds;
  if (!own) safe(g, () => A.drawDoorBuilds(g, t, S, { ...st, builds: keep }));
  const mine = w => own || !keep[w];
  // the vault door is packed away into a box: "no accounts: data stays on my phone"
  const kv = own && t < DOWN.vault[0] ? 1 : left('vault', t);
  if (mine('vault') && kv > 0.001) safe(g, () => {
    const v = BA.vault, sink = 1 - kv;
    g.translate(v.x, v.y); g.scale(lerp(1, 0.4, sink), lerp(1, 0.25, sink)); g.globalAlpha = clamp01(kv * 4);
    cast.build(g, 'vault', 0, 0, v.s, { powered: 0, p: 1, fire: 0, t, spin: 0 });
  });
  // the confetti cannon melts down into one small flame
  if (mine('confetti') && left('confetti', t) > 0.001) safe(g, () => meltCannon(g, t, left('confetti', t)));
  if (t > 165.4 && t < 196.4) safe(g, () => smallFlame(g, t, st));
  // the pod tower is dismantled, top first
  if (mine('pods') && left('pods', t) > 0.001) safe(g, () => pods(g, t, left('pods', t)));
  if (t > DOWN.pods[0] && t < DOWN.pods[1] + 1.0) safe(g, () => podsFlying(g, t));
  // the twelve minis sit down in a domino wave, each holding its reason; the clock stops
  if (mine('minis') && t < 177.0) safe(g, () => minis(g, t, S));
  if (t > 167.0 && t < 169.5) safe(g, () => packBox(g, t));
  if (own) safe(g, () => {
    const b = BELL, gl = st.bellGlow ?? 0.6, push = (st.bellRing || 0) > 0.05 ? 1.5 : 0;
    g.fillStyle = '#C9A24E'; g.strokeStyle = PAL.outline; g.lineWidth = 2.5;
    rr(g, b.x - 12, b.y - 16, 24, 32, 5); g.fill(); g.stroke();
    g.fillStyle = `rgb(255,${233 + 12 * gl | 0},${192 + 40 * gl | 0})`; g.beginPath(); g.arc(b.x, b.y + push * 0.5, 7 - push * 0.6, 0, 7); g.fill(); g.stroke();
  });
}
function meltCannon(g, t, k) {
  const b = BA.confetti, m = 1 - k;                    // m: 0 → 1 melted
  g.save(); g.translate(b.x, b.y); g.rotate(-0.25 * (1 - m));
  g.scale(1 + 0.35 * m, 1 - 0.85 * m); g.globalAlpha = clamp01(k * 2.5);
  cast.build(g, 'confetti', 0, 0, b.s, { powered: 0, p: 1, fire: 0, t, spin: 0 });
  g.restore();
  if (m > 0.02) {                                      // it glows as it melts, and drips
    g.save(); g.globalCompositeOperation = 'lighter';
    const r = g.createRadialGradient(b.x, b.y - 30, 5, b.x, b.y - 30, 150);
    r.addColorStop(0, `rgba(255,150,60,${0.6 * bump(m)})`); r.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = r; g.fillRect(b.x - 160, b.y - 190, 320, 320); g.restore();
    g.fillStyle = PAL.lampDeep; g.strokeStyle = PAL.outline; g.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const dx = (hash(i + 3) - 0.5) * 70, ph = ((t - DOWN.confetti[0]) * (0.9 + hash(i) * 0.7) + hash(i + 9)) % 1;
      const dy = 10 + 150 * ph * ph;
      g.globalAlpha = (1 - ph) * bump(m * 1.4);
      g.beginPath(); g.ellipse(b.x + dx, b.y + dy, 4.5, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
  }
}
// The flame the cannon became: the app's PB flame. It waits over your door, leaps to your phone at
// the PB, and goes out, lightly, as the app folds away when summer's done.
function smallFlame(g, t, st) {
  const b = BA.confetti;
  const grow = backOut(between(t, 165.4, 166.0));
  const leap = inOut3(between(t, 187.35, 187.72));
  const ph = youAt().phone, home = { x: b.x, y: b.y - 4 }, pb = { x: ph.x + 4, y: ph.y - 34 };
  const gone = smooth(between(t, 195.0, 195.6));
  const x = lerp(home.x, pb.x, leap), y = lerp(home.y, pb.y, leap) - 130 * bump(leap) - 60 * gone;
  const pop = t > 187.72 ? 0.25 * Math.exp(-(t - 187.72) / 0.45) : 0;
  const s = (lerp(0.5 * grow, 0.4, leap) + pop) * (1 - gone);
  if (s <= 0.01) return;
  const r = g.createRadialGradient(x, y - 20, 4, x, y - 20, 110 * s + 30);
  r.addColorStop(0, `rgba(255,200,90,${0.5 * (1 - gone)})`); r.addColorStop(1, 'rgba(255,170,60,0)');
  g.fillStyle = r; g.fillRect(x - 200, y - 220, 400, 400);
  cast.flame(g, x, y, s, t);
  const burst = hit(t, 187.72, 0.5) * (t > 187.72 ? 1 : 0);
  if (burst > 0.02) {                                   // PB!
    g.save(); g.translate(x - 30, y - 118); g.rotate(-0.1); const k = backOut(between(t, 187.72, 188.0)); g.scale(k, k);
    g.globalAlpha = clamp01((190.3 - t) / 0.4);
    g.font = `800 58px ${FONTS.display}`; g.textAlign = 'center'; g.lineJoin = 'round';
    g.lineWidth = 12; g.strokeStyle = PAL.outline; g.strokeText('PB!', 0, 0);
    g.fillStyle = PAL.goldHi; g.fillText('PB!', 0, 0);
    g.restore();
  }
}
function packBox(g, t) {
  const v = BA.vault;
  const inn = backOut(between(t, 167.0, 167.3)), close = smooth(between(t, 167.85, 168.1)), away = inOut3(between(t, 168.95, 169.45));
  const x = v.x + 18 + 300 * away, y = F9 - 60 * bump(away), s = inn;
  if (s <= 0.01) return;
  g.translate(x, y); g.scale(s, s); g.rotate(0.12 * away);
  // cardboard box, flaps closing once the vault is in
  g.lineJoin = 'round'; g.fillStyle = '#C89B63'; g.strokeStyle = PAL.outline; g.lineWidth = 5;
  g.beginPath(); g.rect(-78, -96, 156, 96); g.fill(); g.stroke();
  g.fillStyle = '#B5864F';
  for (const sd of [-1, 1]) {
    const a = lerp(-2.3, 0, close) * sd;               // the flap swings shut about its hinge
    g.save(); g.translate(sd * 78, -96); g.rotate(a);
    g.beginPath(); g.rect(sd > 0 ? -78 : 0, -2, 78, 8); g.fill(); g.stroke(); g.restore();
  }
  // the label, in your handwriting
  g.fillStyle = PAL.paper; g.strokeStyle = 'rgba(27,37,83,0.6)'; g.lineWidth = 2.5;
  rr(g, -68, -82, 136, 64, 5); g.fill(); g.stroke();
  g.fillStyle = PAL.ink; g.textAlign = 'center';
  g.font = `700 25px ${FONTS.hand}`; g.fillText('no accounts:', 0, -56);
  g.font = `700 19px ${FONTS.hand}`; g.fillText('data stays on my phone', 0, -31);
}
function pods(g, t, k) {
  const b = BA.pods, hTower = 290 * b.s / 0.85;
  g.beginPath(); g.rect(b.x - 130, b.y - hTower * k - 8, 260, hTower * k + 16); g.clip();
  g.translate(b.x, b.y);
  cast.build(g, 'pods', 0, 0, b.s, { powered: 0, p: 1, fire: 0, t, spin: 17.04 - 11.4 });
}
function podsFlying(g, t) {
  const b = BA.pods, hTower = 290 * b.s / 0.85;
  for (let i = 0; i < 6; i++) {
    const t0 = DOWN.pods[0] + i * 0.14, p = between(t, t0, t0 + 0.9);
    if (p <= 0 || p >= 1) continue;
    const dir = i % 2 ? 1 : -0.5;
    const x = b.x + (60 + 140 * hash(i + 40)) * p * dir, y = b.y - hTower * (1 - i / 6) - 170 * bump(p * 0.7) + 260 * p * p;
    g.save(); g.translate(x, y); g.rotate(p * 5 * (i % 2 ? 1 : -1)); g.globalAlpha = 1 - p * p;
    g.fillStyle = '#5B7BD5'; g.strokeStyle = PAL.outline; g.lineWidth = 3.5;
    rr(g, -22, -15, 44, 30, 6); g.fill(); g.stroke();
    g.fillStyle = '#DDE6FF'; g.fillRect(-12, -4, 24, 8);
    g.restore();
  }
}
function minis(g, t, S) {
  for (let i = 0; i < MINIS.length; i++) {
    const m = MINIS[i], order = [0, 7, 1, 8, 2, 9, 3, 10, 4, 11, 5, 6].indexOf(i), t0 = DOWN.minis[0] + order * 0.11;
    const sit = smooth(between(t, t0, t0 + 0.24)), gone = smooth(between(t, 176.3 + order * 0.03, 176.9 + order * 0.03));
    const hp = between(t, t0 - 0.02, t0 + 0.28);
    g.save(); g.globalAlpha = 1 - gone;
    const hopK = hp > 0 && hp < 1 ? { hop: 0.5 * bump(hp) } : {};
    cast.miniClawd(g, m.x, m.y - 30 * gone, 1, sit < 0.5
      ? { tired: 1, look: i % 2 ? 1 : -1, t, seed: i, ...hopK }                 // as section A left them
      : { mood: 'happy', tired: 0, emote: null, squash: 0.45 * sit, look: -0.3, armL: 0.9, armR: 0.9, t, seed: i, ...hopK });
    if (sit > 0.3) {                                    // its reason, on a tiny card
      const a = clamp01((sit - 0.3) / 0.4);
      g.translate(m.x, m.y - 44 - 14 * a - 30 * gone); g.rotate((hash(i) - 0.5) * 0.3);
      g.globalAlpha = a * (1 - gone);
      g.fillStyle = PAL.paper; g.strokeStyle = PAL.outline; g.lineWidth = 2.5;
      rr(g, -23, -13, 46, 26, 3); g.fill(); g.stroke();
      g.fillStyle = PAL.ink; g.font = `700 13px ${FONTS.hand}`; g.textAlign = 'center'; g.fillText(REASONS[i], 0, 4.5);
    }
    g.restore();
  }
  // the round-the-clock clock stops, and comes down with them
  const c = BA.clock, down = smooth(between(t, 175.0, 175.6));
  if (down < 1) {
    g.save(); g.globalAlpha = 1 - down; g.translate(0, -50 * down);
    cast.build(g, 'clock', c.x, c.y, c.s, { powered: 0, p: 1, t, spin: 6 * 17.04 });
    g.restore();
  }
}
function cheapTokens(g, t, gp) {
  // CHEAP: tokens fly back out of the tube into your open hand
  for (let i = 0; i < 6; i++) {
    const t0 = 168.2 + i * 0.08, p = between(t, t0, t0 + 0.42);
    if (p <= 0 || p >= 1) continue;
    const x0 = P.TUBE.x + 6, y0 = -3200 + i * 14;
    cast.token(g, lerp(x0, gp.x, p), lerp(y0, gp.y - 8, p) - 80 * bump(p), 0.7, { spin: t * 8 + i });
  }
}
function bellRing(g, t) {
  const r = P.bellRing(t);
  if (r <= 0.01) return;
  g.strokeStyle = PAL.goldHi; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const p = ((t - 147.95) * 1.4 + i / 3) % 1;
    g.globalAlpha = r * (1 - p) * 0.9; g.lineWidth = 5 * (1 - p) + 1.5;
    g.beginPath(); g.arc(BELL.x, BELL.y, 16 + 70 * p, -1.1, 1.1); g.stroke();
    g.beginPath(); g.arc(BELL.x, BELL.y, 16 + 70 * p, Math.PI - 1.1, Math.PI + 1.1); g.stroke();
  }
  const a = backOut(between(t, 148.02, 148.3)) * clamp01((150.2 - t) / 0.4);   // "ding-dong!"
  if (a > 0.01) {
    g.globalAlpha = clamp01(a); g.translate(BELL.x + 58, BELL.y - 70); g.rotate(-0.12); g.scale(a, a);
    g.font = `800 36px ${FONTS.display}`; g.textAlign = 'center'; g.lineJoin = 'round';
    g.lineWidth = 9; g.strokeStyle = PAL.outline; g.strokeText('ding-dong!', 0, 0);
    g.fillStyle = PAL.goldHi; g.fillText('ding-dong!', 0, 0);
  }
}
function arrivalDust(g, t) {
  const p = between(t, 147.9, 148.3);
  g.fillStyle = 'rgba(230,220,255,0.5)';
  for (let i = 0; i < 8; i++) {
    const a = hash(i) * Math.PI, d = 30 + 90 * p;
    g.globalAlpha = 0.5 * (1 - p);
    g.beginPath(); g.arc(P.SHAFT.cx + Math.cos(a) * d * (i % 2 ? 1 : -1), F9 - 6 - Math.sin(a) * 20 * p, 6 + 10 * p, 0, Math.PI * 2); g.fill();
  }
}
function lightRays(g, t) {
  // light pours through the whole ticket, down onto Clawd
  const a = win(t, 155.25, 159.4, 0.6);
  const cx = LANTERN.x, top = LANTERN.y + 180 * LANTERN.s;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const u = (i - 3) / 3, sway = 0.04 * Math.sin(t * 1.3 + i);
    const x0 = cx + u * 130, x1 = cx + u * 300 + 70 + sway * 400;
    const gr = g.createLinearGradient(0, top, 0, F9 + 30);
    gr.addColorStop(0, `rgba(255,214,140,${0.22 * a})`); gr.addColorStop(1, 'rgba(255,190,90,0)');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(x0 - 16, top); g.lineTo(x0 + 16, top); g.lineTo(x1 + 44, F9 + 30); g.lineTo(x1 - 44, F9 + 30); g.closePath(); g.fill();
  }
}
function tubeRefill(g, t) {
  // a new session: light races up the quota tube
  const a = win(t, 155.22, 158.0, 0.3);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) {
    const y = F9 + 400 - ((t - 155.22) * 900 + i * 110) % 1100;
    const gr = g.createRadialGradient(P.TUBE.x + 6, y, 1, P.TUBE.x + 6, y, 26);
    gr.addColorStop(0, `rgba(255,190,120,${0.8 * a})`); gr.addColorStop(1, 'rgba(255,140,60,0)');
    g.fillStyle = gr; g.fillRect(P.TUBE.x - 24, y - 26, 60, 52);
  }
}
// The PB lights you from behind: a gold rim around you (its middle left clear, so you read), and a
// short flash from the phone.
function backlight(g, t, st) {
  const a = st.youGold;
  if (a <= 0.01) return;
  const { head, phone } = youAt(), cx = head.x, cy = head.y + 70;
  g.globalCompositeOperation = 'lighter';
  const r = g.createRadialGradient(cx, cy, 0, cx, cy, 230);
  r.addColorStop(0, 'rgba(255,214,90,0)'); r.addColorStop(0.42, 'rgba(255,214,90,0)');
  r.addColorStop(0.62, `rgba(255,224,120,${0.75 * a})`); r.addColorStop(1, 'rgba(255,190,60,0)');
  g.fillStyle = r; g.fillRect(cx - 240, cy - 240, 480, 480);
  const burst = hit(t, 187.72, 0.3) * (t > 187.72 ? 1 : 0);
  if (burst > 0.02) {
    const fl = g.createRadialGradient(phone.x, phone.y, 4, phone.x, phone.y, 150);
    fl.addColorStop(0, `rgba(255,248,210,${0.8 * burst})`); fl.addColorStop(1, 'rgba(255,220,120,0)');
    g.fillStyle = fl; g.fillRect(phone.x - 160, phone.y - 160, 320, 320);
  }
}
// "Fine if it's gone": the app lifts off your phone and folds itself away, by choice.
function appFolds(g, t) {
  const ph = youAt().phone;
  const rise = backOut(between(t, 194.9, 195.2)), f1 = smooth(between(t, 195.25, 195.5)), f2 = smooth(between(t, 195.5, 195.72));
  const shrink = smooth(between(t, 195.72, 196.15));
  const x = ph.x - 40 * rise, y = ph.y - 150 * rise + 90 * shrink, s = (0.4 + 0.6 * rise) * (1 - 0.8 * shrink);
  g.translate(x, y); g.scale(s, s); g.rotate(-0.06);
  g.globalAlpha = 1 - smooth(between(t, 196.0, 196.15));
  const w = 104, h = 176;
  const face = (x0, y0, ww, hh) => {                    // the app, one button
    g.fillStyle = '#15161F'; g.strokeStyle = PAL.outline; g.lineWidth = 4; rr(g, x0, y0, ww, hh, 12); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.rect(x0, y0, ww, hh); g.clip();
    g.fillStyle = '#F6F2E8'; rr(g, -w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 8); g.fill();
    g.fillStyle = PAL.clawd; g.beginPath(); g.arc(0, 10, 32, 0, Math.PI * 2); g.fill(); g.strokeStyle = PAL.outline; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#fff'; g.font = `800 26px ${FONTS.display}`; g.textAlign = 'center'; g.fillText('+1', 0, 19);
    g.fillStyle = PAL.ink; g.font = `800 12px ${FONTS.display}`; g.fillText('SET', 0, 60);
    g.font = `700 13px ${FONTS.display}`; g.fillText('PB 🔥', 0, -52);
    g.restore();
  };
  const back = (x0, y0, ww, hh) => { g.fillStyle = PAL.paper; g.strokeStyle = PAL.outline; g.lineWidth = 4; rr(g, x0, y0, ww, hh, 10); g.fill(); g.stroke(); };
  if (f1 < 1) {                                        // the top half folds down over the bottom
    face(-w / 2, 0, w, h / 2);
    g.save(); g.scale(1, 1 - 2 * f1); if (f1 < 0.5) face(-w / 2, -h / 2, w, h / 2); else back(-w / 2, -h / 2, w, h / 2); g.restore();
  } else {                                             // then the right half over the left
    back(-w / 2, 0, w / 2, h / 2);
    g.save(); g.scale(1 - 2 * f2, 1); back(0, 0, w / 2, h / 2); g.restore();
    if (f2 > 0.9) { g.fillStyle = PAL.ink; g.font = `700 22px ${FONTS.hand}`; g.textAlign = 'center'; g.fillText('✓', -w / 4, h / 4 + 8); }
  }
}
function newTicket(g, t) {
  // it slides out of the chute mouth and drops into Clawd's raised nubs: frame 0
  const p = between(t, 200.14, 200.48);
  const from = { x: P.CHUTE_MOUTH.x + 4, y: P.CHUTE_MOUTH.y - 40 };
  const x = lerp(from.x, F0.tx, p), y = lerp(from.y, F0.ty + 4 * Math.sin((t - T1) * 3), easeIn(p));
  const s = lerp(0.3, F0.ts, smooth(p)), rot = 0.35 * (1 - p) * Math.sin(p * 8) + 0.03 * Math.sin((t - T1) * 2.3);
  g.translate(x, y); g.rotate(rot);
  cast.ticket(g, 0, 0, s, {}, { glow: 0.25 * smooth(p), who: smooth(p), t: t - T1 });
}
// "make it good" again: a confetti cannon pops into the car, as at frame 0 (section A loads it).
function cannonAgain(g, t) {
  const k = backOut(between(t, 200.28, 200.46));
  cast.build(g, 'confetti', 598, liftY(t), 0.46 * k, { powered: 1, p: 1, fire: 0 });
}

// ---------------------------------------------------------------- screen space
export function screen(g, t, S, st, cam) {
  firstErr = null;
  const whip = bump(between(t, 147.6, 147.95));
  if (whip > 0) streaks(g, t, whip, 1);
  const dive = bump(between(t, 198.2, 199.95));
  if (dive > 0) streaks(g, t, dive, -1);
  // the ticket at the lens
  const ts = ticketScreen(t, S);
  if (ts) safe(g, () => {
    if (ts.full > 0) { g.fillStyle = `rgba(8,11,28,${0.62 * ts.full})`; g.fillRect(0, 0, W, H); }
    drawTicket(g, t, ts.x, ts.y, ts.s, ts.rot, 0, ticketFill(t), { glow: 0.2 + 0.35 * ts.full, stamp: t < 179.95 ? 0 : 1, stampHit: clamp01((t - 179.95) / 0.12) });
  });
  const calm = Math.max(win(t, 160.45, 179.35, 0.3), 0.8 * win(t, 184.84, 198.1, 0.4));   // a quiet top edge: roof, bots
  if (calm > 0) {
    const gr = g.createLinearGradient(0, 0, 0, 420);
    gr.addColorStop(0, `rgba(6,8,22,${0.78 * calm})`); gr.addColorStop(1, 'rgba(6,8,22,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, 420);
  }
  if (t > 195.7 && t < 198.0) safe(g, () => myCall(g, t));
  const open = t >= T_OPEN && opening();
  if (open) safe(g, () => open(g, t - T1, S, st, 'screen'));  // YOU SAID / MAKE IT GOOD, as frame 0 shows it
  else safe(g, () => lyrics(g, t, S));
  rethrow();
}

// "(my call)", in your handwriting, on a torn note: the decision, and the main read.
function myCall(g, t) {
  const inn = backOut(between(t, 195.7, 196.0)), out = smooth(between(t, 197.6, 197.95));
  const p = smooth(between(t, 195.85, 196.55)), u = smooth(between(t, 196.6, 197.0));
  g.translate(330, 1010 + 40 * out); g.rotate(-0.06); g.globalAlpha = 1 - out;
  const k = 3.1 * inn; g.scale(k, k);
  const sz = cast.note(g, 0, 0, 1, '(my call)', { hand: true, p, rot: 0, t }) || { w: 150, h: 84 };
  if (u > 0) {                                          // underlined, twice
    g.strokeStyle = PAL.ink; g.lineCap = 'round'; g.lineWidth = 2.6;
    for (let i = 0; i < 2; i++) {
      const q = clamp01(u * 2 - i); if (q <= 0) continue;
      const x0 = -sz.w * 0.34, x1 = sz.w * 0.34, yy = sz.h * 0.2 + i * 6;
      g.beginPath();
      for (let j = 0; j <= 16 * q; j++) { const v = j / 16; g.lineTo(lerp(x0, x1, v), yy + Math.sin(v * 8 + i) * 1.2 - v * 2); }
      g.stroke();
    }
  }
}

function streaks(g, t, a, dir) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 28; i++) {
    const len = 260 + hash(i + 50) * 700, speed = 2600 + hash(i + 90) * 2400, span = H + len;
    const y = (((hash(i + 20) * span + dir * t * speed) % span) + span) % span - len;
    const x = hash(i) * W, wdt = 2 + hash(i + 7) * 5;
    const gr = g.createLinearGradient(0, y, 0, y + len);
    const col = i % 3 ? '255,226,180' : '180,200,255';
    gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.5, `rgba(${col},${0.32 * a})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(x, y, wdt, len);
  }
  g.restore();
}
// Lyrics: the plea in a band at the top; the line to remember huge; in the chorus the ticket is the
// only big text, so the hook is a medium band; the outro big and warm. Nothing above y = 120.
function scrim(g, y0, y1, a = 0.62) {    // as section A draws it
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, 'rgba(8,11,28,0)'); gr.addColorStop(0.2, `rgba(8,11,28,${a})`); gr.addColorStop(0.75, `rgba(8,11,28,${a})`); gr.addColorStop(1, 'rgba(8,11,28,0)');
  g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0);
}
function topScrim(g, t, line, y0, y1) {
  g.save(); g.globalAlpha = win(t, line.start - 0.1, line.end + 0.7, 0.25); scrim(g, y0, y1, 0.5); g.restore();
}
function lyrics(g, t, S) {
  const line = S.lineAt(t, 0.7);
  if (!line || line.start < T0 - 0.01) return;
  const s = line.start;
  if (s < 153.3) return type.band(g, t, S, { y: 250, size: 70 });                              // so please just tell me…
  if (s < 160) { topScrim(g, t, line, 130, 430); return type.huge(g, t, S, { y: 262, size: 100, w: 1000 }); }   // the line to remember
  if (s < 184) return type.band(g, t, S, { y: 205, size: s >= 179.7 ? 60 : 64, scrim: 0.75 });   // the chorus: the ticket is the big text
  const last = s > 193;                                // the outro, big and warm; clears before frame 0
  const a = win(t, s - 0.1, last ? 199.2 : line.end + 0.7, 0.25);
  g.save(); g.globalAlpha = a; scrim(g, 125, last ? 560 : 520, 0.5); g.restore();
  return type.huge(g, t, S, { y: 262, size: last ? 100 : 112, w: 990, color: '#FFF1D6', accent: PAL.gold, backing: '#F4C77A', hold: last ? 199.2 - line.end : 0.7 });
}
