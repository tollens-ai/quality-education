// Section D of "Who Lives Here?": the final pre-chorus, the final chorus, the outro and the loop
// back to frame 0 (147.56–200.74 s). Spec: episodes/01-storyboard.md, from "Final pre-chorus".
//
// The story here: Clawd rides up and finally rings your bell; your hand takes the ticket, and it
// comes back with FOR written in; it floats above your door like a lantern while the brief answers
// the chorus box by box and the misfit builds come down; the finished ticket is held full screen;
// the blind rises on you mid-set, curling a dumbbell, and your free thumb taps the one button: a PB,
// the brightest gold in the video; a toy is allowed to be a toy; the camera dives home and a new
// "make it good" drops into Clawd's nubs, which is frame 0.
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
const CARD = { x: 452, y: 968, s: 2.3 };         // "(my call)": it comes forward again
const HELD_S = 0.36;                             // the ticket as Clawd carries it (a placard)
const LOOP_RESET = true;                         // end on exactly frame 0 (see state())
const ROOM = (world.roomRect && world.roomRect(9, 'R')) || { x: 756, y: P.floorTop(9) + 26 };
const PHONE0 = { x: ROOM.x + 276, y: F9 - 227 };  // your phone, one button (world.js draws it)
function phonePos() {
  const r = world.residentAt && world.residentAt('9R');
  return r && Number.isFinite(r.dx) ? { x: r.dx, y: r.dy } : PHONE0;
}
// Frame 0 (section A at t = 0): Clawd at CLAWD_AT[0] holding the ticket up to us.
const F0 = { x: 400, y: P.BASE.floor, tx: 404, ty: P.BASE.floor - 205, ts: 0.5 };
const F0_POSE = { mood: 'happy', look: 0, lookY: -0.4, mouth: 0, armL: 1.2, armR: 1.2, hop: 0, squash: 0, salute: 0, lit: 0, tear: 0 };

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

// ---------------------------------------------------------------- camera
const H147 = P.HANDOFF[147.56], HEND = P.HANDOFF[200.74];
const LAND = { x: 600, y: -3080, zoom: 1.52 };
const CHORUS = { x: 580, y: -3215, zoom: 1.45 };
const OUTRO = { x: 905, y: -3068, zoom: 1.9 };
const KEYS = [
  [147.95, LAND],
  [150.3, { x: 606, y: -3080, zoom: 1.62 }],          // Clawd rang; waits
  [151.1, { x: 640, y: -3035, zoom: 1.95 }],          // your hand, the letterbox, the blind lifts an inch
  [152.9, { x: 640, y: -3035, zoom: 1.95 }],
  [153.8, CHORUS],                                    // the ticket rises; FOR fills in
  [155.3, CHORUS],
  [158.6, { x: 572, y: -3250, zoom: 1.32 }],          // light pours through it; a new session
  [160.45, CHORUS],
  [163.0, { x: 586, y: -3210, zoom: 1.46 }],
  [165.6, { x: 606, y: -3200, zoom: 1.48 }],          // the cannon melts into one flame
  [168.4, { x: 614, y: -3190, zoom: 1.48 }],          // the vault packed away; tokens back
  [170.8, { x: 624, y: -3195, zoom: 1.47 }],          // the pods come down
  [173.8, { x: 576, y: -3222, zoom: 1.5 }],           // FOR YOU: Clawd beams
  [176.3, { x: 650, y: -3170, zoom: 1.44 }],          // the minis sit down
  [178.9, { x: 624, y: -3150, zoom: 1.58 }],          // kg or lb?
  [179.3, { x: 624, y: -3150, zoom: 1.58 }],
  [180.4, OUTRO],                                     // (behind the full-screen ticket)
  [184.84, OUTRO],
  [187.4, { x: 918, y: -3080, zoom: 2.05 }],          // the blind rises; one tap
  [189.1, { x: 872, y: -3060, zoom: 1.7 }],           // PB: the brightest gold
  [190.45, { x: 866, y: -3060, zoom: 1.68 }],
  [192.3, { x: 690, y: -2790, zoom: 0.96 }],          // just a toy: every other flat stays lit
  [193.3, { x: 690, y: -2790, zoom: 0.96 }],
  [194.9, { x: 770, y: -3075, zoom: 1.5 }],           // fine if it's gone when summer's done
  [198.1, { x: 770, y: -3075, zoom: 1.5 }],
];

export function camera(t, S) {
  if (t <= T0) return { ...H147 };
  if (t >= T1) return { ...HEND };
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
    // breathe with the song (never at a handoff)
    const L = win(t, 148.2, 197.8, 0.6) * (1 - win(t, 179.3, 184.84, 0.3));
    c.x += L * 5 * Math.sin(t * 0.83) / c.zoom; c.y += L * 7 * Math.sin(t * 0.61 + 1.3) / c.zoom;
    if (S && S.beatPos && t > 160.5 && t < 179.3) {   // small punch-ins on the beat in the chorus
      const bp = S.beatPos(t), kb = Math.floor(bp), f = (bp - kb) * S.beat;
      c.zoom *= 1 + Math.exp(-f / 0.09) * (kb % 4 === 0 ? 0.014 : 0.004);
    }
    return c;
  }
  // the dive: ride the lift down the tower, then settle into frame 0
  const p = between(t, 198.1, 199.95), q = smooth(between(t, 198.1, T1));
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
  for (const [a, b] of HAND_SPANS) flap = Math.max(flap, win(t, a - 0.08, b + 0.05, 0.08));
  st.letterbox = flap;
  st.cutWords = 0; st.strata = 0; st.bulbSwing = 0;
  // The loop. Frame 0 has a dark basement window, an unlit directory without the bots' plates, and
  // a fresh quota. Put them back while neither floor 10 nor the lobby is in shot (198.85–199.05):
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
    1.0 * win(t, 171.4, 174.4, 0.5),                   // FOR YOU: it's for Clawd too
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
    pose = { mood, look: 1, lookY: -0.5, emote: mood === 'proud' ? null : undefined, salute: win(t, 190.5, 192.6, 0.25),
      ...(h1 > 0 && h1 < 1 ? cast.hopPose(h1, 0.7) : h2 > 0 && h2 < 1 ? cast.hopPose(h2, 0.35) : {}) };
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
    const k = smooth(between(t, 200.36, 200.56));
    pose = { ...F0_POSE, mood: k < 0.5 ? 'hope' : 'happy', armL: lerp(0.5, 1.2, k), armR: lerp(0.5, 1.2, k), squash: 0.2 * bump(between(t, 200.36, 200.5)) };
    if (t > 200.6) pose = { ...F0_POSE };
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
  const pleased = { squash: 0.07 * Math.exp(-((S.beatPos(t) % 1 + 1) % 1) * 5) };
  if (t < 161.95) pose = { mood: 'happy', look: -0.5, lookY: -1, armL: 1.45 * win(t, 160.5, 161.9, 0.2) };   // points up at FOR
  else if (t < 163.18) pose = { mood: 'hope', look: 1, emote: null };                                    // …that's you
  else if (t < 166.17) pose = { mood: t < 164.9 ? 'surprise' : 'happy', look: 1, lookY: -0.8 };          // the cannon melts
  else if (t < 166.75) pose = { mood: 'determined', look: -1, armL: 1.1 * win(t, 166.17, 166.7, 0.12) }; // one token: FAST
  else if (t < 168.1) pose = { mood: 'proud', look: 1, emote: null };                                    // the vault, packed
  else if (t < 169.4) pose = { mood: 'happy', look: 1, armR: 0.8 * win(t, 168.1, 169.3, 0.15) };        // tokens back to you
  else if (t < 170.6) pose = { mood: 'happy', look: 1, lookY: -0.6 };                                    // the pods come down
  else if (t < 174.12) {                                                                                  // FOR YOU: it's for Clawd too
    const h = between(t, 172.25, 172.75);
    pose = { mood: t < 171.4 ? 'surprise' : 'beam', look: -0.4, lookY: -1, emote: t < 171.4 ? '!' : 'heart', emoteK: backOut(between(t, 171.4, 171.7)),
      armL: 1.2 * win(t, 172.2, 173.9, 0.2), armR: 1.2 * win(t, 172.2, 173.9, 0.2), ...(h > 0 && h < 1 ? cast.hopPose(h, 0.9) : {}) };
  } else if (t < 176.74) pose = { mood: 'proud', look: 1 };                                             // the minis sit down
  else if (t < 177.45) {                                                                                  // "kg or lb?", held up to the letterbox
    x = HOME.x + 24 * smooth(between(t, 176.8, 177.2));
    pose = { mood: 'determined', look: 1, armR: 1.25 * smooth(between(t, 176.8, 177.1)), holding: 'note', item: 'kg or lb?', itemHand: false, itemScale: 0.5, hop: 0.3 * bump(between(t, 177.05, 177.45)) };
  } else if (t < 178.3) { x = HOME.x + 24; pose = { mood: 'hope', look: 1, emote: '?' }; }
  else {                                                                                                  // "kg": got it
    x = HOME.x + 24 * (1 - smooth(between(t, 178.9, 179.3)));
    const h = between(t, 178.75, 179.05);
    pose = { mood: 'happy', look: 0.4, armR: 1.1, holding: 'note', item: 'kg ✓', itemHand: true, itemScale: 0.5, ...(h > 0 && h < 1 ? cast.hopPose(h, 0.4) : {}) };
  }
  if (!pose.hop && (pose.mood === 'happy' || pose.mood === 'proud')) pose.squash = (pose.squash || 0) + pleased.squash;
  return { x, y, pose };
}

// ---------------------------------------------------------------- the ticket's path
// World pose of your ticket, or null while Clawd carries it (drawn by cast.clawd), while it's
// inside your flat, or while it's at the lens (ticketScreen).
function ticketWorld(t, S) {
  if (t < 153.1) return null;                          // Clawd carries it, then your hand has it
  if (t < 179.3) {                                     // let go, it floats up and stays there, glowing
    const p = between(t, 153.1, 153.8), L = lanternAt(t, S), o = { x: TICKET_OUT.x - 44, y: TICKET_OUT.y + 4 };
    const bp = S.beatPos(t), bobY = 5 * Math.sin(Math.PI * bp * 0.5), bobR = 0.012 * Math.sin(Math.PI * bp * 0.25);
    return {
      x: lerp(o.x, L.x, smooth(p)), y: lerp(o.y, L.y, smooth(p)) - 60 * bump(p) + bobY * smooth(p),
      s: lerp(0.3, L.s, backOut(p)), rot: lerp(-0.06, 0, smooth(p)) + bobR,
    };
  }
  if (t < 184.7) return null;
  if (t >= 195.1 && t < 197.6) return null;
  return { x: PIN.x, y: PIN.y, s: PIN.s, rot: -0.05, pin: true };
}
// The lantern floats: it drifts with the camera's reframes so it keeps its place in the shot.
function lanternAt(t, S) {
  const c = camera(t, S), k = clamp01((t - 153.1) / 0.7);
  return {
    x: LANTERN.x + 0.8 * k * (c.x - CHORUS.x), y: LANTERN.y + 0.9 * k * (c.y - CHORUS.y),
    s: LANTERN.s * (1 + 0.85 * k * (CHORUS.zoom / c.zoom - 1)),
  };
}
// Screen pose of the ticket when it's brought to the lens, or null.
function ticketScreen(t, S) {
  if (t >= 179.3 && t < 184.7) {
    const lan = ticketWorld(179.29, S), cam0 = camera(179.29, S), a = toScreen(cam0, lan.x, lan.y);
    const from = { x: a.x, y: a.y, s: lan.s * cam0.zoom, rot: lan.rot };
    const cam1 = camera(184.7, S), b = toScreen(cam1, PIN.x, PIN.y);
    const to = { x: b.x, y: b.y, s: PIN.s * cam1.zoom, rot: -0.05 };
    const pin = inOut3(between(t, 179.3, 179.75)), unpin = inOut3(between(t, 183.75, 184.7));
    const base = unpin > 0 ? to : from, k = unpin > 0 ? 1 - unpin : pin;
    return {
      x: lerp(base.x, FULL.x, k), y: lerp(base.y, FULL.y, k), s: lerp(base.s, FULL.s, k),
      rot: lerp(base.rot, 0, k), full: k,
    };
  }
  if (t >= 195.1 && t < 197.6) {
    const cam = camera(t, S), b = toScreen(cam, PIN.x, PIN.y);
    const k = inOut3(between(t, 195.1, 195.55)) * (1 - inOut3(between(t, 197.1, 197.6)));
    return { x: lerp(b.x, CARD.x, k), y: lerp(b.y, CARD.y, k), s: lerp(PIN.s * cam.zoom, CARD.s, k), rot: lerp(-0.05, -0.03, k), full: 0.55 * k };
  }
  return null;
}
function ticketGlow(t) {
  return Math.max(0.12 + 0.2 * between(t, 153.3, 153.95),
    win(t, 155.22, 159.0, 0.5),                         // light pours through the whole ticket
    0.34 * win(t, 159.0, 179.4, 0.8));
}
function ticketFill(t, st) {
  const f = { ...(st.ticket || P.ticketFill(t)) };
  if (t < 152.97) for (const k of Object.keys(f)) f[k] = 0;      // blank until it comes back out
  return f;
}
// Which box the chorus is asking about.
function activeBox(t) {
  if (t >= 160.5 && t < 163.18) return 'for';
  if (t >= 163.18 && t < 166.17) return 'good';
  if (t >= 166.17 && t < 170.6) return 'dont';
  if (t >= 170.6 && t < 174.12) return 'you';
  if (t >= 176.74 && t < 179.3) return 'cost';
  if (t >= 195.5 && t < 197.3) return 'dont';
  return null;
}
// cast.ticket's printed boxes (local, at s = 1) for the highlight.
const ROWS = { for: [-150, 62], good: [-84, 80], dont: [0, 76], cost: [80, 44], you: [128, 56] };
function drawTicket(g, t, x, y, s, rot, flat, fill, o = {}) {
  g.translate(x, y); if (rot) g.rotate(rot);
  if (flat) g.scale(1, 1 - 0.94 * flat);
  cast.ticket(g, 0, 0, s, fill, { t, glow: o.glow || 0, mycall: o.mycall || 0, pin: o.pin });
  g.scale(s, s);
  const act = o.active && ROWS[o.active];
  if (act) {                                            // the box being asked about glows gold
    const k = 0.7 + 0.3 * Math.sin(t * 6);
    g.save(); g.shadowColor = PAL.gold; g.shadowBlur = 14; g.strokeStyle = `rgba(255,194,61,${k})`; g.lineWidth = 3.5;
    rr(g, -142, act[0] - 2, 284, act[1] + 4, 7); g.stroke(); g.restore();
  }
  if (o.stamp > 0) stamp(g, o.stamp, o.stampHit || 0);
}
// Clawd's stamp by COST: the quota used, 8%.
function stamp(g, a, h) {
  g.save();
  g.translate(96, 176); g.rotate(-0.14);
  const k = 1 + 0.6 * h; g.scale(k, k);
  g.globalAlpha *= a * (1 - 0.35 * h);
  g.fillStyle = 'rgba(251,227,209,0.92)'; g.strokeStyle = PAL.clawd; g.lineWidth = 3.5;
  rr(g, -54, -25, 108, 50, 7); g.fill(); g.stroke();
  g.fillStyle = PAL.clawd; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `700 11px ${FONTS.pixel}`; g.fillText('QUOTA', 0, -8);
  g.font = `700 22px ${FONTS.pixel}`; g.fillText('8% USED', 0, 15);
  g.restore();
}

// ---------------------------------------------------------------- world-space action
export function draw(g, t, S, st, cam) {
  firstErr = null;
  const c = clawdAt(t, S);
  const fill = ticketFill(t, st);
  drawBuilds(g, t, S, st);
  if (t < 151.4) safe(g, () => bellRing(g, t));
  if (t > 155.1 && t < 159.6) safe(g, () => lightRays(g, t));
  if (t > 155.0 && t < 158.2) safe(g, () => tubeRefill(g, t));
  if (t > 166.1 && t < 167.2) safe(g, () => fastToken(g, t, c));
  if (t > 187.4 && t < 192.8) safe(g, () => goldSpill(g, t, st));
  if ((st.letterbox || 0) > 0.01) safe(g, () => {   // warm light from your flat spills out of the slot
    const a = st.letterbox, r = g.createRadialGradient(LB.x, LB.y, 4, LB.x, LB.y, 150);
    r.addColorStop(0, `rgba(255,214,150,${0.7 * a})`); r.addColorStop(1, 'rgba(255,190,110,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = r; g.fillRect(LB.x - 150, LB.y - 150, 300, 300);
  });
  safe(g, () => drawHand(g, t, S, fill));
  if (t > 200.4) safe(g, () => cannonAgain(g, t));
  // Clawd (carrying your ticket as a placard until your hand takes it)
  safe(g, () => {
    const pose = { ...c.pose };
    if (c.hold === 'ticket') Object.assign(pose, { holding: 'ticket', itemScale: HELD_S * backOut(between(t, 147.9, 148.12)), fill: {}, ticket: { glow: 0.15 } });
    cast.clawd(g, c.x, c.y, clawdScale(t), pose);
  });
  // the end: a new ticket from another flat drops out of the chute into Clawd's nubs
  if (t > 200.12) safe(g, () => newTicket(g, t));
  // your ticket, in the world
  const tw = ticketWorld(t, S);
  if (tw) safe(g, () => drawTicket(g, t, tw.x, tw.y, tw.s, tw.rot, tw.flat, fill,
    { glow: st.ticketGlow ?? ticketGlow(t), active: activeBox(t), pin: tw.pin, mycall: t > 197 ? 1 : 0, stamp: t > 184 ? 1 : 0 }));
  if (t > 147.9 && t < 148.3) safe(g, () => arrivalDust(g, t));
  rethrow();
}

// Your hand out of the letterbox: [start, grab, end, peak reach]. It takes the ticket, gives it back
// written, catches your tokens (CHEAP), takes Clawd's note and hands back your answer.
const HAND_ROT = Math.PI + 0.12, HAND_UP = Math.PI + 0.45;   // out of the slot, towards the lift
const HAND_SPANS = [[150.62, 150.92, 151.32, 0.85, HAND_UP], [152.9, 153.1, 153.35, 0.8, HAND_ROT], [168.0, 168.9, 169.35, 0.75, HAND_ROT],
  [177.3, 177.45, 177.72, 0.25, HAND_ROT], [178.1, 178.3, 178.55, 0.25, HAND_ROT]];
const HAND_S = 0.9;
function handReach(t, [a, m, b, pk]) {
  if (t < a || t > b) return 0;
  return t < m ? pk * easeOut(between(t, a, m)) : pk * (1 - smooth(between(t, m + 0.06, b)));
}
// Where the pinch is, for a reach (mirrors cast.hand's geometry: arm 80 + hand 64, pinch at +48).
function handGrip(reach, rot = HAND_ROT) {
  const xw = reach * 144 - 64, gx = HAND_S * (xw + 48), gy = HAND_S * 11, c = Math.cos(rot), sn = Math.sin(rot);
  return { x: LB.x + c * gx - sn * gy, y: LB.y + sn * gx + c * gy };
}
const TICKET_OUT = handGrip(0.8);                     // where your hand lets go of the written ticket
function drawHand(g, t, S, fill) {
  for (const span of HAND_SPANS) {
    const [a, m, b, , rot] = span;
    if (t < a || t > b) continue;
    const reach = handReach(t, span), held = t >= m;
    const pose = { reach, rot, sweat: 0.5, chalk: 1, t, grip: 'open' };
    if (a === 150.62 || a === 152.9) pose.grip = (a === 150.62 ? held : !held) ? 'pinch' : 'open';
    if (a === 168.0) pose.grip = held ? 'fist' : 'open';
    if (a === 177.3 && held) Object.assign(pose, { holding: 'note', item: 'kg or lb?', itemHand: false, itemScale: 0.55 });
    if (a === 178.1 && !held) Object.assign(pose, { holding: 'note', item: 'kg ✓', itemHand: true, itemScale: 0.55 });
    const r = cast.hand(g, LB.x, LB.y, HAND_S, pose) || {};
    const gp = r.grip || handGrip(reach, rot);
    // your ticket, pinched at its right edge: in through the slot, and back out written
    if (a === 150.62 && held) {
      const f = smooth(between(t, 151.1, 151.3));
      drawTicket(g, t, gp.x - 51, gp.y - 2, HELD_S * 1.2 * (1 - 0.3 * f), 0.04, f, {}, { glow: 0.15 });
    }
    if (a === 152.9 && !held) {
      const f = 1 - smooth(between(t, 152.92, 153.05));
      drawTicket(g, t, gp.x - 44, gp.y + 4, 0.3, -0.06, f, fill, { glow: 0.2 });
    }
    if (a === 168.0) cheapTokens(g, t, gp);
  }
}

// ---- the misfit builds, and how each comes down
function drawBuilds(g, t, S, st) {
  const B = P.yourBuilds(t);
  // What hasn't come down yet is drawn by section A's own drawer, exactly as sections B and C show
  // it; each build switches to its teardown here at its moment.
  const keep = { confetti: t < 163.2 ? 1 : 0, vault: t < 166.2 ? 1 : 0, pods: t < 168.8 ? 1 : 0, minis: t < 174.2 ? 1 : 0, powered: 0 };
  const own = !A.drawDoorBuilds;
  if (!own) safe(g, () => A.drawDoorBuilds(g, t, S, { ...st, builds: keep }));
  const mine = w => own || !keep[w];
  // the vault door is packed away into a box: "no accounts: data stays on my phone"
  if (mine('vault') && B.vault > 0.001) safe(g, () => {
    const v = BA.vault, k = B.vault, sink = 1 - k;
    g.translate(v.x, v.y); g.scale(lerp(1, 0.4, sink), lerp(1, 0.25, sink)); g.globalAlpha = clamp01(k * 4);
    cast.build(g, 'vault', 0, 0, v.s, { powered: 0, p: 1, fire: 0, t, spin: 0 });
  });
  // the confetti cannon melts down into one small flame
  if (mine('confetti') && B.confetti > 0.001) safe(g, () => meltCannon(g, t, B.confetti));
  if (t > 164.5 && t < 196.4) safe(g, () => smallFlame(g, t, st));
  // the pod tower is dismantled, top first
  if (mine('pods') && B.pods > 0.001) safe(g, () => pods(g, t, B.pods));
  if (t > 168.8 && t < 171.9) safe(g, () => podsFlying(g, t));
  // the twelve minis sit down in a domino wave, each holding its reason; the clock stops
  if (mine('minis') && t < 178.6) safe(g, () => minis(g, t, S));
  if (t > 166.0 && t < 168.95) safe(g, () => packBox(g, t));
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
      const dx = (hash(i + 3) - 0.5) * 70, ph = ((t - 163.2) * (0.9 + hash(i) * 0.7) + hash(i + 9)) % 1;
      const dy = 10 + 150 * ph * ph;
      g.globalAlpha = (1 - ph) * bump(m * 1.4);
      g.beginPath(); g.ellipse(b.x + dx, b.y + dy, 4.5, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    }
  }
}
// The flame the cannon became: the app's PB flame. It waits over your door, leaps into your flat
// at the PB, and goes out, lightly, when summer's done.
function smallFlame(g, t, st) {
  const b = BA.confetti, f = P.flatRect(9, 'R');
  const grow = backOut(between(t, 164.5, 165.2));
  const leap = inOut3(between(t, 187.35, 187.72));
  const ph = phonePos(), home = { x: b.x, y: b.y - 4 }, pb = { x: ph.x - 4, y: ph.y - 30 };
  const gone = smooth(between(t, 195.4, 196.3));
  const x = lerp(home.x, pb.x, leap), y = lerp(home.y, pb.y, leap) - 130 * bump(leap) - 60 * gone;
  const pop = t > 187.72 ? 0.35 * Math.exp(-(t - 187.72) / 0.5) : 0;
  const s = (lerp(0.5 * grow, 0.55, leap) + pop) * (1 - gone);
  if (s <= 0.01) return;
  const r = g.createRadialGradient(x, y - 20, 4, x, y - 20, 110 * s + 30);
  r.addColorStop(0, `rgba(255,200,90,${0.5 * (1 - gone)})`); r.addColorStop(1, 'rgba(255,170,60,0)');
  g.fillStyle = r; g.fillRect(x - 200, y - 220, 400, 400);
  cast.flame(g, x, y, s, t);
  const burst = hit(t, 187.72, 0.5) * (t > 187.72 ? 1 : 0);
  if (burst > 0.02) {                                   // PB!
    g.save(); g.translate(x - 96, y - 96); g.rotate(-0.1); const k = backOut(between(t, 187.72, 188.0)); g.scale(k, k);
    g.globalAlpha = clamp01((190.3 - t) / 0.4);
    g.font = `800 58px ${FONTS.display}`; g.textAlign = 'center'; g.lineJoin = 'round';
    g.lineWidth = 12; g.strokeStyle = PAL.outline; g.strokeText('PB!', 0, 0);
    g.fillStyle = PAL.goldHi; g.fillText('PB!', 0, 0);
    g.restore();
  }
}
function packBox(g, t) {
  const v = BA.vault;
  const inn = backOut(between(t, 166.0, 166.3)), close = smooth(between(t, 167.45, 167.8)), away = inOut3(between(t, 168.35, 168.95));
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
    const t0 = 168.85 + i * 0.36, p = between(t, t0, t0 + 0.9);
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
    const m = MINIS[i], order = [0, 7, 1, 8, 2, 9, 3, 10, 4, 11, 5, 6].indexOf(i), t0 = 174.2 + order * 0.14;
    const sit = smooth(between(t, t0, t0 + 0.26)), gone = smooth(between(t, 177.65 + order * 0.03, 178.45 + order * 0.03));
    const hp = between(t, t0 - 0.02, t0 + 0.3);
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
  const c = BA.clock, down = smooth(between(t, 175.8, 176.5));
  if (down < 1) {
    g.save(); g.globalAlpha = 1 - down; g.translate(0, -50 * down);
    cast.build(g, 'clock', c.x, c.y, c.s, { powered: 0, p: 1, t, spin: 6 * 17.04 });
    g.restore();
  }
}
function cheapTokens(g, t, gp) {
  // CHEAP: tokens fly back out of the tube into your open hand
  for (let i = 0; i < 6; i++) {
    const t0 = 168.12 + i * 0.08, p = between(t, t0, t0 + 0.42);
    if (p <= 0 || p >= 1) continue;
    const x0 = P.TUBE.x + 6, y0 = -3200 + i * 14;
    cast.token(g, lerp(x0, gp.x, p), lerp(y0, gp.y - 8, p) - 80 * bump(p), 0.7, { spin: t * 8 + i });
  }
}
function fastToken(g, t, c) {
  // FAST: one token, into one slot, on the car wall
  const slot = { x: 488, y: -3074 };
  const p = between(t, 166.3, 166.62), lit = hit(t, 166.62, 0.4);
  g.fillStyle = 'rgba(20,24,52,0.92)'; g.strokeStyle = lit > 0.05 ? PAL.token : '#7780A8'; g.lineWidth = 3;
  rr(g, slot.x - 34, slot.y - 16, 68, 32, 6); g.fill(); g.stroke();
  g.fillStyle = lit > 0.05 ? PAL.goldHi : '#C9C3D8'; g.font = `700 17px ${FONTS.pixel}`; g.textAlign = 'center';
  g.fillText('FAST', slot.x, slot.y + 6);
  if (p > 0 && p < 1) cast.token(g, lerp(c.x - 50, slot.x, p), lerp(c.y - 60, slot.y - 20, p) - 50 * bump(p), 0.8, { spin: t * 9 });
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
function goldSpill(g, t, st) {
  // your flat, the brightest gold in the video, spills out onto the landing
  const f = P.flatRect(9, 'R'), a = st.youGold;
  if (a <= 0.01) return;
  g.globalCompositeOperation = 'lighter';
  const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
  const r = g.createRadialGradient(cx, cy, 40, cx, cy, 520);
  r.addColorStop(0, `rgba(255,214,90,${0.45 * a})`); r.addColorStop(1, 'rgba(255,190,60,0)');
  g.fillStyle = r; g.fillRect(cx - 560, cy - 560, 1120, 1120);
  const burst = hit(t, 187.72, 0.35) * (t > 187.72 ? 1 : 0);   // the PB flash
  if (burst > 0.02) {
    const ph = phonePos(), fl = g.createRadialGradient(ph.x, ph.y, 10, ph.x, ph.y, 420);
    fl.addColorStop(0, `rgba(255,248,210,${0.9 * burst})`); fl.addColorStop(1, 'rgba(255,220,120,0)');
    g.fillStyle = fl; g.fillRect(ph.x - 440, ph.y - 440, 880, 880);
  }
}
function newTicket(g, t) {
  // it slides out of the chute mouth and drops into Clawd's raised nubs: frame 0
  const p = between(t, 200.14, 200.5);
  const from = { x: P.CHUTE_MOUTH.x + 4, y: P.CHUTE_MOUTH.y - 40 };
  const x = lerp(from.x, F0.tx, p), y = lerp(from.y, F0.ty, easeIn(p)) + (p >= 1 ? 6 * Math.exp(-(t - 200.5) * 14) * Math.sin((t - 200.5) * 40) * (1 - between(t, 200.6, 200.7)) : 0);
  const s = lerp(0.3, F0.ts, smooth(p)), rot = 0.35 * (1 - p) * Math.sin(p * 8);
  g.translate(x, y); g.rotate(rot);
  cast.ticket(g, 0, 0, s, {}, { glow: 0.25 * smooth(p), who: smooth(p), t: t - T1 });
}
// "make it good" again: a confetti cannon pops into the car, as at frame 0 (section A loads it).
function cannonAgain(g, t) {
  const k = backOut(between(t, 200.4, 200.6));
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
    const inCard = t > 195;
    drawTicket(g, t, ts.x, ts.y, ts.s, ts.rot, 0, ticketFill(t, st), {
      glow: 0.2 + 0.35 * ts.full, active: activeBox(t), stamp: t < 179.95 ? 0 : 1, stampHit: hit(t, 179.95, 0.16),
      mycall: inCard ? smooth(between(t, 195.6, 196.6)) : 0,
    });
  });
  safe(g, () => lyrics(g, t, S));
  rethrow();
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
// Lyrics: the plea in a band at the top; the line to remember huge; the hook medium-large at the
// top while the ticket is the main read; the outro big and warm.
function scrim(g, y0, y1, a = 0.62) {    // as section A draws it
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, 'rgba(8,11,28,0)'); gr.addColorStop(0.2, `rgba(8,11,28,${a})`); gr.addColorStop(0.75, `rgba(8,11,28,${a})`); gr.addColorStop(1, 'rgba(8,11,28,0)');
  g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0);
}
function topScrim(g, t, line, y0, y1) {
  g.save(); g.globalAlpha = win(t, line.start - 0.1, line.end + 0.7, 0.25); scrim(g, y0, y1, 0.5); g.restore();
}
function lyrics(g, t, S) {
  if (t > 200.2) { g.save(); g.globalAlpha = smooth(between(t, 200.2, T1)); scrim(g, 150, 560, 0.5); g.restore(); }   // frame 0's
  const line = S.lineAt(t, 0.7);
  if (!line || line.start < T0 - 0.01) return;
  const s = line.start;
  if (s < 153.3) return type.band(g, t, S, { y: 250, size: 70 });                              // so please just tell me…
  if (s < 160) { topScrim(g, t, line, 120, 430); return type.huge(g, t, S, { y: 250, size: 100, w: 1000 }); }   // the line to remember
  if (s >= 179.7 && s < 184) return type.band(g, t, S, { y: 205, size: 62, scrim: 0.6 });      // over the full-screen ticket
  if (s < 184) {
    if (/^Make it good/.test(line.text || '')) { topScrim(g, t, line, 80, 430); return type.huge(g, t, S, { y: 195, size: 92, w: 1000 }); }
    return type.band(g, t, S, { y: 250, size: 66 });                                           // the "or" lines
  }
  const last = s > 193;                                // the outro, big and warm; clears before frame 0
  const a = win(t, s - 0.1, last ? 199.2 : line.end + 0.7, 0.25);
  g.save(); g.globalAlpha = a; scrim(g, 110, last ? 560 : 520, 0.5); g.restore();
  return type.huge(g, t, S, { y: 250, size: last ? 100 : 112, w: 990, color: '#FFF1D6', accent: PAL.gold, backing: '#F4C77A', hold: last ? 199.2 - line.end : 0.7 });
}
