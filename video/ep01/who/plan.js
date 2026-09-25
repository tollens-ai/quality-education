// The shared plan for episode 1, "Who Lives Here?": geometry, cast placement, section ownership,
// camera handoffs and the state every part reads. The storyboard is episodes/01-storyboard.md.
//
// World coordinates: x runs 0..1080 across the tower; y grows downward. Ground level (the lobby
// floor) is y = 0; floors stack upward (negative y); the basement and the older basements lie below.
// Everything here is a pure function of song time t (seconds), so any frame renders on its own.

import { clamp01, smooth, lerp, between } from '../../lib/stage.js';

export const FH = 360;                 // floor height
export const SHAFT = { x0: 450, x1: 630, cx: 540 };
export const TOWER = { x0: 0, x1: 1080 };
export const FLOORS = 10;
export const ROOF_Y = -FLOORS * FH;    // top of floor 10 = -3600; the roof shed sits above it
export const BASE = { top: 0, floor: 440 };  // Clawd's basement: ceiling y 0, floor y 440
// Older basements under Clawd's, deepest is oldest.
export const STRATA = [
  { era: '2010s', top: 440, floor: 960, glow: '#9FC9FF' },
  { era: '1990s', top: 960, floor: 1480, glow: '#E9E2C8' },
  { era: '1970s', top: 1480, floor: 2000, glow: '#7CFF9B' },
];

// Floor k (1..10): its floor level (where feet stand) and its ceiling.
export const floorLevel = k => -(k - 1) * FH;
export const floorTop = k => -k * FH;
// A flat's interior rectangle. side: 'L' | 'R'.
export function flatRect(k, side) {
  const y = floorTop(k) + 14, h = FH - 28;
  return side === 'L' ? { x: 12, y, w: SHAFT.x0 - 24, h } : { x: SHAFT.x1 + 12, y, w: TOWER.x1 - SHAFT.x1 - 24, h };
}
// The lift car: 170 wide, 250 tall, standing on y (a floor level, or anywhere in between).
export const CAR = { w: 170, h: 250 };
export const carRect = y => ({ x: SHAFT.cx - CAR.w / 2, y: y - CAR.h, w: CAR.w, h: CAR.h });
// Your door: floor 9, on the right flat's inner wall, facing the shaft. Bell and letterbox beside it.
export const YOU = { floor: 9, side: 'R' };
export const DOOR = { x: SHAFT.x1 + 14, y: floorLevel(9) - 220, w: 70, h: 220 };
export const BELL = { x: SHAFT.x1 + 100, y: floorLevel(9) - 150 };
export const LETTERBOX = { x: SHAFT.x1 + 49, y: floorLevel(9) - 120 };
// The quota tube runs up the shaft's right wall, basement to roof.
export const TUBE = { x: SHAFT.x1 - 18, w: 12, y0: BASE.floor - 10, y1: ROOF_Y + 40 };
// Basement fixtures.
export const FUSE = { x: 880, y: 150, w: 160, h: 210 };
export const CHUTE_MOUTH = { x: SHAFT.x0 - 40, y: 120 };      // the ticket chute from your letterbox
export const BASE_WINDOW = { x: 70, y: 22, w: 170, h: 64 };    // dark until "I'm someone too"
export const BENCH = { x: 60, y: 300, w: 330, h: 140 };
// Lobby fixtures (floor 1).
export const DIRECTORY = { x: 40, y: floorTop(1) + 40, w: 380, h: 280 };
export const LOCKERS = { x: 660, y: floorTop(1) + 50, w: 400, h: 270 };

// Who lives where. `suits` marks the verse-1 flats whose good the misfit builds really fit.
export const RESIDENTS = {
  '10L': { who: 'molty', name: 'Molty (OpenClaw)' },
  '10R': { who: 'jolly', name: 'Jolly (Muse)' },
  roof: { who: 'hermes', name: 'Hermes ☤' },
  '9L': { who: 'plants', name: 'Priya' },
  '9R': { who: 'you', name: 'you' },
  '8L': { who: 'demo', name: 'Dev (demo day)' },
  '8R': { who: 'streamer', name: 'Kai (streams)', suits: 'pods' },
  '7L': { who: 'trader', name: 'Mo (trades)', suits: 'vault' },
  '7R': { who: 'family', name: 'the Okafors (subscribers)' },
  '6L': { who: 'groupchat', name: 'the group chat' },
  '6R': { who: 'party', name: 'Lily, 7', suits: 'confetti' },
  '5L': { who: 'warroom', name: 'launch team', suits: 'subagents' },
  '5R': { who: 'student', name: 'Sam (uni)' },
  '4L': { who: 'nana', name: 'Nana' },
  '4R': { who: 'violin', name: 'Ines' },
  '3L': { who: 'cook', name: 'Tom' },
  '3R': { who: 'speaks', name: 'Ade' },
  '2L': { who: 'nurse', name: 'Jo (night shift)' },
  '2R': { who: 'dog', name: 'Rui & Biscuit' },
};

// Sections, and who builds each. Boundaries are sung start times from music/ep01/lyrics.json.
export const SECTIONS = [
  { id: 'A', from: 0, to: 50.5, owner: 'sec-a.js', covers: 'intro, verse 1, pre-chorus 1, chorus 1' },
  { id: 'B', from: 50.5, to: 106.2, owner: 'sec-b.js', covers: 'verse 2, pre-chorus 2, chorus 2' },
  { id: 'C', from: 106.2, to: 147.56, owner: 'sec-c.js', covers: 'bridge, break' },
  { id: 'D', from: 147.56, to: 200.74, owner: 'sec-d.js', covers: 'final pre-chorus, final chorus, outro, loop' },
];

// Camera handoffs: each section must start and end exactly on these, so the shot is continuous.
// {x, y} is the world point at the centre of the frame; zoom 1 shows 1080 world units across.
export const HANDOFF = {
  0: { x: 400, y: 250, zoom: 2.2, rot: 0 },          // close on Clawd in the basement (frame 0)
  50.5: { x: 540, y: floorLevel(8) - 150, zoom: 1.4, rot: 0 },   // lift stalled at floor 8
  106.2: { x: 540, y: -1650, zoom: 0.46, rot: 0 },    // whole tower, sky above for type
  147.56: { x: 540, y: 250, zoom: 1.7, rot: 0 },      // basement, lift waiting with Clawd in it
  200.74: { x: 400, y: 250, zoom: 2.2, rot: 0 },      // = frame 0, for the loop
};

// Where the lift car (its floor, y) and Clawd are at each handoff. Clawd's x is world x of its
// feet; 'in: lift' means standing in the car (x = SHAFT.cx).
export const LIFT_AT = { 0: BASE.floor, 50.5: floorLevel(8), 106.2: floorLevel(9), 147.56: BASE.floor, 200.74: BASE.floor };
export const CLAWD_AT = {
  0: { x: 400, y: BASE.floor, in: 'basement', holding: 'ticket' },
  50.5: { x: SHAFT.cx, y: floorLevel(8), in: 'lift' },
  106.2: { x: SHAFT.cx, y: floorLevel(9), in: 'lift' },
  147.56: { x: SHAFT.cx, y: BASE.floor, in: 'lift' },
  200.74: { x: 400, y: BASE.floor, in: 'basement', holding: 'ticket' },
};

// ---------- shared state, one source of truth for things that persist across sections ----------

// Quota left, 0..1. Verse 1 spends it all; a new session refills it for chorus 1; the final
// pre-chorus starts another session and the final build uses only 8%.
export function quota(t) {
  if (t < 4.52) return 1;
  if (t < 17.04) {
    // four gags, a quarter each, spent as each build lands
    const steps = [5.2, 8.6, 11.3, 13.8];
    let q = 1;
    for (const s of steps) q -= 0.22 * smooth(between(t, s, s + 0.9));
    return q - 0.12 * smooth(between(t, 16.2, 17.04));
  }
  if (t < 27.2) return 0;
  if (t < 50.5) return lerp(1, 0.45, smooth(between(t, 27.6, 49)));   // new session, spent on choices
  if (t < 155.22) return 0.45;
  if (t < 160.5) return lerp(0.45, 1, smooth(between(t, 155.22, 157)));  // new session
  return lerp(1, 0.92, smooth(between(t, 163, 178)));                 // 8% used
}
// "new session" tag visibility
export const sessionTag = t => Math.max(fadeWindow(t, 27.2, 30.5), fadeWindow(t, 155.3, 158.8));

// The misfit builds at your door (0..1 installed). They come down in the final chorus.
export function yourBuilds(t) {
  return {
    confetti: clamp01(between(t, 5.4, 6.0)) * (1 - smooth(between(t, 163.2, 165.6))),
    vault: clamp01(between(t, 8.8, 9.4)) * (1 - smooth(between(t, 166.2, 167.8))),
    pods: clamp01(between(t, 11.4, 12.2)) * (1 - smooth(between(t, 168.8, 171.0))),
    minis: clamp01(between(t, 13.8, 14.6)) * (1 - smooth(between(t, 174.2, 176.2))),
    powered: t < 17.04 ? 1 : 0,          // everything powers down when the quota goes
  };
}
// The ticket's boxes, 0..1 written (drawn in your handwriting, stroke by stroke).
export const BRIEF = {
  for: 'me, mid-set, one sweaty hand',
  good: 'log a set in one tap · 🔥 on a PB',
  dont: 'accounts, scale · fine if it\'s gone after summer',
  cost: 'don\'t burn my quota',
  you: 'diags you can read · ask me if unsure',
};
export function ticketFill(t) {
  return {
    for: smooth(between(t, 153.32, 155.0)),
    good: smooth(between(t, 163.18, 165.4)),
    dont: smooth(between(t, 166.4, 170.2)),
    you: smooth(between(t, 170.6, 172.8)),
    cost: smooth(between(t, 176.9, 178.6)),
  };
}
// Your blind (0 = down, 1 = fully up), doorbell glow (0..1; rings at 147.9), the basement window.
export const blind = t => t < 150.4 ? 0 : t < 184.84 ? 0.08 * smooth(between(t, 150.4, 151.4)) : lerp(0.08, 1, smooth(between(t, 184.84, 186.4)));
export const bellRing = t => fadeWindow(t, 147.9, 150.2);
export const bellGlow = t => 0.55 + 0.25 * Math.sin(t * 3.1);
export const baseWindow = t => t < 137.48 ? 0 : smooth(between(t, 137.48, 138.3));
// How many directory entries are lit (the break), and whether the bots' plates are up.
export const directoryLit = t => clamp01(between(t, 128.8, 134.7));
export const botsUp = t => ({
  molty: smooth(between(t, 139.3, 139.7)), jolly: smooth(between(t, 140.66, 141.0)), hermes: smooth(between(t, 141.9, 142.25)),
});
// Your flat's gold (the PB flame) and the season.
export const youGold = t => smooth(between(t, 187.7, 188.6)) * (1 - 0.35 * smooth(between(t, 196, 199.5)));
export const autumn = t => smooth(between(t, 193.26, 197));

// A 0..1 envelope that fades in at a and out at b.
export function fadeWindow(t, a, b, fade = 0.25) {
  return clamp01((t - a) / fade) * clamp01((b - t) / fade);
}

// ---------- palette and fonts ----------
export const PAL = {
  sky0: '#0B1230', sky1: '#1C2A58', city: '#141C3A', cityLit: '#F4C77A',
  tower: '#20284A', slab: '#2D3662', outline: '#0E1328',
  lamp: '#FFD9A3', lampDeep: '#F2A65A', gold: '#FFC23D', goldHi: '#FFF1B8',
  clawd: '#D97757', clawdDk: '#A9533A', token: '#E8834F',
  ink: '#1B2553', paper: '#F6EEDC', paperDk: '#E4D6B8',
  concrete: '#3A405A', bulb: '#FFE6B8', sepia: '#5B4631', sepiaLt: '#8A6E4E',
  text: '#FFF6E6', textDim: '#C9C3D8', scrim: 'rgba(8,11,28,0.62)',
};
export const FONTS = {
  display: '"Bricolage Grotesque", system-ui, sans-serif',
  hand: '"Caveat", cursive',
  pixel: '"Pixelify Sans", monospace',
  mono: '"JetBrains Mono", monospace',
};
export const FONT_FILES = [
  ['Bricolage Grotesque', 'video/fonts/BricolageGrotesque.ttf', { weight: '200 800', stretch: '75% 100%' }],
  ['Caveat', 'video/fonts/Caveat.ttf', { weight: '400 700' }],
  ['Pixelify Sans', 'video/fonts/PixelifySans.ttf', { weight: '400 700' }],
  ['JetBrains Mono', 'video/fonts/JetBrainsMono.ttf', { weight: '100 800' }],
];
// Official marks, kept locally (not in git). Missing files leave S.img entries undefined; draw a
// labelled fallback then.
export const IMAGE_FILES = {
  openai: '.private/ep01-assets/openai-fav.svg',
  grok: '.private/ep01-assets/grok-512.png',   // the SVG has a <foreignObject>, which taints the canvas
  molty: '.private/ep01-assets/openclaw.svg',
  muse: '.private/ep01-assets/muse-logo.svg',
};
