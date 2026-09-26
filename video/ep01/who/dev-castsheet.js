// A character sheet for the episode 1 cast: not part of the video. Every character, pose and prop
// on one frame (t < 10), plus close-up pages for checking detail at the sizes the shots use:
//   10–20 Clawd close-ups · 20–30 tickets and notes · 30–40 the final brief, full frame ·
//   40–50 hands · 50–60 bots and plates · 60–70 builds, powered and dead.
// Render: node video/lib/render.mjs --scene video/ep01/who/dev-castsheet.js --song music/ep01 --stills 0,1 --w 1080 --out video/out/cast
import * as P from './plan.js';
import * as C from './cast.js';

export const font = P.FONTS.display;
export const markColor = '#E9E4F5';
export const fonts = P.FONT_FILES;
export const images = P.IMAGE_FILES;

const W = 1080, H = 1920;
const sing = t => 0.5 + 0.5 * Math.sin(t * 9);

function panel(g, y0, y1, color) { g.fillStyle = color; g.fillRect(0, y0, W, y1 - y0); }
function label(g, text, x, y, color = '#C9C3D8', size = 17) {
  g.save(); g.font = `600 ${size}px ${P.FONTS.display}`; g.fillStyle = color; g.textAlign = 'center'; g.fillText(text, x, y); g.restore();
}
function title(g, text) {
  g.save(); g.font = `800 34px ${P.FONTS.display}`; g.fillStyle = P.PAL.text; g.textAlign = 'left'; g.fillText(text, 40, 112); g.restore();
}

function overview(g, t, S) {
  panel(g, 0, H, P.PAL.sky0);
  panel(g, 40, 300, '#2A3150');
  panel(g, 300, 590, '#C98F5E');
  panel(g, 590, 760, P.PAL.sky0);
  panel(g, 760, 1000, '#3B3040');
  panel(g, 1000, 1330, '#232B4E');
  panel(g, 1330, 1640, '#1A2044');
  panel(g, 1640, 1790, '#C98F5E');
  // Clawd moods
  C.CLAWD_MOODS.forEach((m, i) => {
    const x = 60 + (i % 10) * 107;
    C.clawd(g, x, 250, 0.78, { mood: m, t: t + i, seed: i });
    label(g, m, x, 285);
  });
  // Clawd poses on warm lamplight
  const poses = [
    ['singing', { mood: 'happy', mouth: sing(t), t }],
    ['salute', { mood: 'determined', salute: 1, t }],
    ['placard', { mood: 'happy', holding: 'ticket', t, ticket: { flicker: 1 } }],
    ['reading', { mood: 'sad', holding: 'note', item: 'my AI built me absolute garbage 😤', itemHand: true, look: 0.7, itemScale: 0.4, t }],
    ['hop', { mood: 'happy', ...C.hopPose((t * 0.8) % 1), t }],
    ['lit', { mood: 'beam', lit: 1, t }],
    ['turned', { mood: 'hope', look: 0.8, t }],
    ['dim', { mood: 'sad', dim: 0.6, t }],
  ];
  poses.forEach(([n, p], i) => {
    const x = 70 + i * 134;
    C.clawd(g, x, 555, 0.85, p);
    label(g, n, x, 582, '#2A1A10');
  });
  // minis, tokens, flame
  const minis = [{}, { tired: 1 }, { holding: 'sheet' }, { walk: t * 8 }, { hat: null, mood: 'happy' }, { lit: 1, mood: 'beam' }];
  minis.forEach((p, i) => C.miniClawd(g, 60 + i * 72, 715, 1.4, { t: t + i * 0.7, seed: i, ...p }));
  label(g, 'minis', 240, 748);
  [{}, { spin: (t * 0.7) % 1 }, { glow: 1 }, { powered: 0 }].forEach((o, i) => C.token(g, 520 + i * 48, 690, 1.3, o));
  label(g, 'tokens', 592, 748);
  C.flame(g, 820, 740, 1.05, t);
  label(g, 'PB flame', 930, 748);
  // hands
  g.save(); g.fillStyle = '#6B4A3A'; g.fillRect(40, 770, 120, 200); g.fillStyle = '#1A1210'; g.fillRect(70, 800, 60, 10); g.restore();
  C.hand(g, 100, 805, 0.9, { from: 'up', reach: 1, holding: 'phone', screen: 'floss', screenOpts: { tick: (t * 0.5) % 1 }, t });
  label(g, 'letterbox + phone', 100, 990);
  C.note(g, 330, 930, 0.7, 'kg', { hand: true, p: (t * 0.6) % 1 });
  C.hand(g, 230, 800, 0.9, { from: 'left', rot: 0.6, reach: 1, arm: 40, holding: 'pen', t });
  label(g, 'pen', 300, 990);
  C.hand(g, 430, 790, 0.9, { from: 'up', reach: 1, arm: 20, holding: 'ticket', itemScale: 0.28, t });
  label(g, 'ticket', 470, 990);
  C.hand(g, 560, 830, 0.9, { from: 'left', reach: 1, arm: 20, point: 1, sweat: 1, tap: sing(t), t });
  label(g, 'point + sweat', 640, 990);
  g.save(); g.fillStyle = '#10152e'; g.fillRect(800, 760, 70, 240); g.restore();
  C.hand(g, 835, 760, 0.8, { from: 'up', arm: 190, reach: 1, t });
  label(g, 'down the chute', 950, 990);
  // tickets and notes
  C.ticket(g, 165, 1165, 0.78, {}, { flicker: 1, who: 1, t });
  label(g, 'blank · flicker', 165, 1322);
  C.ticket(g, 440, 1165, 0.78, { for: 1, good: 1, dont: 1, cost: 1, you: 1 }, { glow: 0.5, mycall: 1, t });
  label(g, 'the brief', 440, 1322);
  const notes = [['my AI built me absolute garbage 😤', { hand: true }], ["who's it for?", {}], ['kg or lb?', {}], ['diags pls', { hand: true }], ["who's it for?", { crumple: 0.85 }]];
  notes.forEach(([txt, o], i) => C.note(g, 700 + (i % 2) * 210, 1070 + Math.floor(i / 2) * 110, 0.72, txt, o));
  label(g, 'notes', 900, 1322);
  // builds
  const bs = [['confetti', { fire: (t * 0.8) % 1 }], ['vault', { digits: Math.floor(t * 3) % 7 }], ['pods', { p: Math.min(1, (t * 0.5) % 1.3) }], ['clock', {}], ['summary', { n: 6 }]];
  bs.forEach(([w, o], i) => { const x = 110 + i * 205; C.build(g, w, x, 1540, 0.82, { t, ...o }); label(g, w, x, 1568); });
  bs.forEach(([w], i) => C.build(g, w, 110 + i * 205, 1625, 0.3, { t, powered: 0 }));
  // bots on warm light
  const bots = [['molty', { wave: 1 }], ['jolly', { wave: 1 }], ['hermes', { wave: 1 }], ['courier', { holding: 'parcel', parcelName: 'Rui' }]];
  bots.forEach(([id, p], i) => { const x = 110 + i * 200; C.bot(g, id, x, 1775, 0.72, { t, ...p }); label(g, id, x, 1660, '#2A1A10'); });
  C.bot(g, 'molty', 930, 1775, 0.6, { t, lit: 1, ...C.hopPose((t * 0.9) % 1) });
  // plates
  ['openai', 'grok', 'muse', 'openclaw', 'hermes', 'instinct', 'clawd'].forEach((id, i) => {
    C.plate(g, S, id, 20 + (i % 4) * 262, 1800 + Math.floor(i / 4) * 58, 250, 50, { lit: i === 6 ? 1 : 0 });
  });
}

function clawdPage(g, t) {
  panel(g, 0, H, '#2A3150');
  title(g, 'Clawd, close');
  C.CLAWD_MOODS.forEach((m, i) => {
    const x = 190 + (i % 3) * 350, y = 360 + Math.floor(i / 3) * 330;
    C.clawd(g, x, y, 2, { mood: m, mouth: i === 0 ? 0 : 0.0, t: t + i, seed: i });
    label(g, m, x, y + 45, '#C9C3D8', 26);
  });
  C.clawd(g, 540, 1720, 2, { mood: 'happy', mouth: sing(t), salute: 0, t });
  label(g, 'singing', 540, 1765, '#C9C3D8', 26);
  C.clawd(g, 890, 1720, 2, { mood: 'determined', salute: 1, t });
}

function ticketPage(g, t) {
  panel(g, 0, H, '#1E2546');
  title(g, 'The ticket, filling');
  const f = (t - 20) / 10;
  const fill = P.ticketFill(lerpTime(f));
  C.ticket(g, 290, 520, 1.5, {}, { flicker: 1, who: 1, t });
  const r = C.ticket(g, 800, 520, 1.5, fill, { t });
  if (r.nib) C.hand(g, r.nib.x + 220, r.nib.y - 10, 1.1, { from: 'right', rot: Math.PI - 0.5, holding: 'pen', reach: 1, arm: 60, flipY: false, t });
  const notes = [['my AI built me absolute garbage 😤', { hand: true }], ["who's it for?", {}], ['kg or lb?', {}], ['kg', { hand: true }], ['diags pls', { hand: true }], ["who's it for?", { crumple: 0.6 }]];
  notes.forEach(([txt, o], i) => C.note(g, 280 + (i % 2) * 520, 1150 + Math.floor(i / 2) * 240, 1.4, txt, o));
}
function lerpTime(f) { return 153 + Math.max(0, Math.min(1, f)) * 27; }

function briefPage(g, t) {
  panel(g, 0, H, '#0E1328');
  C.ticket(g, 540, 800, 3.2, { for: 1, good: 1, dont: 1, cost: 1, you: 1 }, { glow: 0.55, mycall: (t - 30) / 3, t });
}

function handPage(g, t) {
  panel(g, 0, H, '#3B3040');
  title(g, 'Your hand');
  g.save(); g.fillStyle = '#6B4A3A'; g.fillRect(120, 180, 300, 520); g.fillStyle = '#1A1210'; g.fillRect(190, 300, 160, 22); g.restore();
  C.hand(g, 270, 312, 2, { from: 'up', reach: 1, arm: 50, holding: 'phone', screen: 'hello', t, sweat: 0.6 });
  C.hand(g, 560, 260, 2, { from: 'up', reach: 1, arm: 40, holding: 'note', item: 'diags pls', t });
  C.hand(g, 600, 900, 2, { from: 'left', rot: 0.5, reach: 1, arm: 30, holding: 'pen', t });
  C.hand(g, 80, 1000, 2, { from: 'left', reach: 1, arm: 40, point: 1, sweat: 1, t });
  C.hand(g, 80, 1350, 2, { from: 'left', reach: 1, arm: 40, t });
  C.hand(g, 600, 1250, 2, { from: 'up', reach: 1, arm: 30, holding: 'phone', screen: 'keypad', screenOpts: { digits: 4, err: Math.sin(t * 4) > 0.5 ? 1 : 0 }, t, sweat: 1 });
  C.hand(g, 900, 1150, 1.6, { from: 'up', reach: 1, arm: 20, holding: 'phone', screen: 'log', screenOpts: { tap: (t * 0.7) % 1 }, t });
  C.hand(g, 330, 1600, 1.6, { from: 'up', reach: 1, arm: 10, holding: 'phone', screen: 'pb', t });
}

function botPage(g, t, S) {
  panel(g, 0, H, '#C98F5E');
  panel(g, 900, 1280, P.PAL.sky0);
  title(g, 'Bots and plates');
  const bots = [['molty', { wave: 1 }], ['jolly', { wave: 1 }], ['hermes', { wave: 1 }], ['courier', { holding: 'parcel', parcelName: 'Rui', happy: true }]];
  bots.forEach(([id, p], i) => C.bot(g, id, 270 + (i % 2) * 540, 520 + Math.floor(i / 2) * 360, 1.9, { t, ...p }));
  ['molty', 'jolly', 'hermes', 'courier'].forEach((id, i) => C.bot(g, id, 140 + i * 260, 1230, 1.1, { t, lit: 1 }));
  ['openai', 'grok', 'muse', 'openclaw', 'hermes', 'instinct', 'clawd'].forEach((id, i) => {
    C.plate(g, S, id, 40 + (i % 2) * 510, 1330 + Math.floor(i / 2) * 140, 480, 110, { lit: i % 3 === 2 ? 1 : 0 });
  });
}

function buildPage(g, t) {
  panel(g, 0, H, '#1A2044');
  title(g, 'Builds, powered and dead');
  const bs = [['confetti', { fire: (t * 0.8) % 1 }], ['vault', { digits: 5, spin: t }], ['pods', { p: Math.min(1, (t * 0.4) % 1.4) }], ['clock', {}], ['summary', { n: 9 }], ['sheet', {}]];
  bs.forEach(([w, o], i) => {
    const x = 200 + (i % 3) * 340, y = 520 + Math.floor(i / 3) * 420;
    C.build(g, w, x, y, 1.7, { t, ...o });
    label(g, w, x, y + 40, '#C9C3D8', 24);
  });
  bs.slice(0, 5).forEach(([w], i) => C.build(g, w, 130 + i * 205, 1600, 0.9, { t, powered: 0 }));
  C.build(g, 'confetti', 380, 1860, 1.2, { t, melt: ((t - 60) / 4) % 1, powered: 0 });
  C.flame(g, 800, 1860, 1.6, t);
}

export function draw(g, t, S) {
  C.useImages(S);
  g.save();
  if (t < 10) overview(g, t, S);
  else if (t < 20) clawdPage(g, t);
  else if (t < 30) ticketPage(g, t);
  else if (t < 40) briefPage(g, t);
  else if (t < 50) handPage(g, t);
  else if (t < 60) botPage(g, t, S);
  else buildPage(g, t);
  g.restore();
}
