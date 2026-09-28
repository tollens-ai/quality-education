// Verse 1: four apps, four disasters, on one long zine page. The camera whips down from panel to
// panel on each line; between panels, the band pops up to sing its "oooh".
import { C, TAU, clamp, lerp, smooth, easeOut, easeOutBack, easeInOut, rr, circle, ellipse, poly, line, star, heart, rnd, INK, rgba, mix, shade } from '../kit.js';
import { cut, marker, field, tape, doodle, doodleField, tornRect, speedLines, hatch } from '../zine.js';
import { sing, lineNear } from '../lyrics.js';
import { letter } from '../hand.js';
import { who } from '../people.js';
import { behind, folk, facing } from '../folk.js';
import { member } from '../band.js';
import { clockFace } from '../props.js';

const PH = 1920 + 260;  // a panel and its gutter
// When each panel arrives: the camera whips down just before its line.
// Each whip lands on the first beat at least .45 s after the line before it ends, so its last
// word can be read; the next line's first word is on its panel when it arrives.
export const PANELS = [12.98, 17.39, 20.92, 24.45];
const WHIP = .3;

function camY(t) {
  let y = 0;
  PANELS.forEach((a, i) => { if (i) y += PH * easeInOut(clamp((t - a + WHIP * .5) / WHIP)); });
  return y;
}

export function verse1(g, t, c) {
  const cy = camY(t);
  const blur = PANELS.some((a, i) => i && Math.abs(t - a) < WHIP * .5);
  g.save(); g.translate(0, -cy);
  [panelShop, panelClinic, panelSchool, panelWedding].forEach((fn, i) => {
    const oy = i * PH;
    if (oy + PH < cy - 100 || oy > cy + 1920 + 100) return;
    g.save(); g.translate(0, oy); fn(g, t, c); g.restore();
    if (i < 3) gutter(g, t, oy + 1920, i);
  });
  g.restore();
  // Speed lines while whipping between panels.
  if (blur) { g.save(); g.drop = null; g.strokeStyle = rgba(C.ink, .5); g.lineWidth = 5; for (let i = 0; i < 16; i++) { const x = 40 + rnd(i, 3) * 1000; line(g, x, 0, x, 1920); g.stroke(); } g.restore(); }
}

// The torn gap between two panels, with a strip of tape.
function gutter(g, t, y, i) {
  g.save(); g.drop = null; g.ink = null;
  g.fillStyle = C.ink; g.beginPath(); g.rect(-120, y, 1320, 260); g.fill();
  g.restore();
  doodleField(g, 40, y + 40, 1000, 180, 8, 40 + i, { col: C.cream, cols: [C.yellow, C.pink, C.mint] });
}

// ---------------------------------------------------------------- 1: the checkout at eight
function panelShop(g, t, c) {
  field(g, C.yellow);
  doodleField(g, 40, 120, 1000, 700, 10, 11, { kinds: ['star', 'sparkle', 'squiggle'], col: C.ink });
  // The bakery: back wall with shelves of bread, the counter, and Rosa behind it.
  cut(g, () => rr(g, 60, 860, 960, 520, 18), '#f5d7a8', { drop: 12 });
  for (let r = 0; r < 2; r++) {
    marker(g, () => rr(g, 110, 960 + r * 150, 420, 18, 6), C.wood, 3);
    for (let k = 0; k < 5; k++) loaf(g, 150 + k * 80, 950 + r * 150, 30, k + r * 5);
  }
  // The clock: eight on the dot.
  clockFace(g, 820, 1010, 95, TAU * 8 / 12, 0, { glowA: 0 });
  const panic = Math.sin(t * 22) * .15;
  who(g, 'rosa', 540, 1330, { s: 150, eyes: 'wide', brow: 'worry', mouth: .6, armL: -2.6 + panic, armR: -2.6 - panic, look: [0, -.2] });
  cut(g, () => rr(g, 40, 1300, 1000, 120, 10), '#b86f3c', { drop: 10 });
  // The card reader on the counter: stuck, spinning.
  g.save(); g.translate(720, 1260); g.rotate(-.08);
  cut(g, () => rr(g, -80, -120, 160, 200, 18), C.ink, { drop: 8, inkW: 3 });
  marker(g, () => rr(g, -62, -100, 124, 100, 8), C.cream, 2.4);
  g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.pink; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.arc(0, -50, 30, t * 7, t * 7 + 4.2); g.stroke(); g.restore();
  g.restore();
  // Fifty in the queue: the backs of heads, all the way back to us.
  queue(g, t);
  sing(g, t, 13.52, {
    rows: [{ text: 'Your checkout', y: 290, size: 108, rot: -.02 }, { text: 'just went down', y: 440, size: 96, rot: .015, ci: 1 },
      { text: 'at eight with fifty', y: 590, size: 82, rot: -.01, ci: 2 }, { text: 'in the queue', y: 730, size: 96, rot: .02 }],
    paper: { cols: [C.cream] }, maxW: 900, speed: 1.6,
    emph: { down: { col: C.red }, eight: { col: C.blue }, fifty: { col: C.pink } },
  });
}
function loaf(g, x, y, s, i) {
  g.save(); g.translate(x, y); g.rotate((rnd(i, 3) - .5) * .2);
  marker(g, () => { g.beginPath(); g.ellipse(0, 0, s, s * .6, 0, Math.PI, TAU); g.closePath(); }, i % 3 ? '#d98c3a' : '#c7702a', 2.6);
  g.save(); g.drop = null; g.ink = null; g.strokeStyle = '#8a4a1a'; g.lineWidth = 3;
  for (let k = -1; k <= 1; k++) { line(g, k * s * .4 - 6, -s * .45, k * s * .4 + 6, -s * .2); g.stroke(); }
  g.restore(); g.restore();
}
function queue(g, t) {
  // Rows from far (small, up by the counter) to near (big, cut by the frame's bottom edge).
  const rows = [[1420, 16, 44], [1500, 12, 60], [1600, 9, 84], [1730, 7, 116], [1900, 6, 160]];
  let i = 0;
  for (const [fy, n, k] of rows) {
    for (let j = 0; j < n; j++) {
      const f = folk(300 + i);
      const x = 540 + (j - (n - 1) / 2) * (1080 / n) + (rnd(i, 4) - .5) * 30;
      behind(g, x, fy + k * .6, k * 1.25, { ...f, lit: 1, ink: true, sway: t * 3 + i, arm: rnd(i, 9) > .9 ? 'phone' : 'down', up: .5 });
      i++;
    }
  }
}

// ---------------------------------------------------------------- 2: the cute booking site
function panelClinic(g, t, c) {
  field(g, C.bubble);
  doodleField(g, 40, 120, 1000, 700, 12, 21, { kinds: ['heart', 'sparkle', 'star'], col: C.ink, cols: [C.cream, C.pink, C.lemon] });
  // Gran, big, squinting at her phone at arm's length.
  who(g, 'gran', 300, 1720, { s: 230, eyes: 'closed', brow: 'worry', frown: true, armR: -1.05, armLenR: 1.2, look: [.7, 0] });
  // The phone, with the prettiest booking site nobody can use.
  const px = 720, py = 1180;
  g.save(); g.translate(px, py); g.rotate(.08);
  cut(g, () => rr(g, -200, -340, 400, 680, 44), C.ink, { drop: 14, inkW: 4 });
  g.save(); rr(g, -180, -320, 360, 640, 30); g.clip();
  field(g, '#fff0f6');
  // Kawaii calendar: hearts, flowers, and text too small and too pale to read.
  for (let k = 0; k < 6; k++) doodle(g, 'heart', -150 + k * 60, -280, 13, { fill: C.bubble, col: shade(C.bubble, -.2) });
  marker(g, () => rr(g, -150, -240, 300, 50, 25), '#ffd6e8', 2);
  g.save(); g.drop = null; g.ink = null; g.strokeStyle = '#f3c9da'; g.lineWidth = 3;
  for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) { line(g, -140 + k * 60, -150 + r * 60, -115 + k * 60, -150 + r * 60); g.stroke(); }
  for (let r = 0; r < 5; r++) { line(g, -150, 170 + r * 16, 100 - (r % 3) * 50, 170 + r * 16); g.stroke(); }
  g.restore();
  for (let k = 0; k < 4; k++) doodle(g, 'sparkle', -120 + k * 80, 130, 11, { fill: C.lemon, col: '#e8b8cb' });
  // The Book button: tiny, pastel on pastel.
  marker(g, () => rr(g, 90, 270, 54, 20, 10), '#ffe3ef', 1.6, '#f0c2d5');
  g.restore(); g.restore();
  for (let k = 0; k < 3; k++) {
    const p = (t * .8 + k / 3) % 1;
    letter(g, '?', 170 + k * 80, 1130 - p * 120, 64 + k * 10, { col: C.ink, w: .2, alpha: Math.sin(p * Math.PI), seed: k });
  }
  sing(g, t, 17.18, {
    rows: [{ text: "Your clinic's", y: 290, size: 104, rot: -.02 }, { text: 'booking site', y: 430, size: 96, rot: .02 },
      { text: 'looked cute but Gran', y: 580, size: 84, rot: -.015 }, { text: 'could not get through', y: 720, size: 84, rot: .015 }],
    paper: { cols: [C.cream] }, maxW: 900, speed: 1.6,
    emph: { cute: { col: C.pink }, gran: { col: C.violet }, not: { col: C.red } },
  });
}

// ---------------------------------------------------------------- 3: the feedback app that leaks
function panelSchool(g, t, c) {
  field(g, C.mint);
  doodleField(g, 40, 120, 1000, 700, 10, 31, { kinds: ['star', 'squiggle', 'bolt'], col: C.ink });
  // A school noticeboard look: the app's message list, other families' texts spilling out.
  const px = 350, py = 1170;
  g.save(); g.translate(px, py); g.rotate(-.05);
  cut(g, () => rr(g, -220, -380, 440, 760, 46), C.ink, { drop: 14, inkW: 4 });
  g.save(); rr(g, -198, -358, 396, 716, 32); g.clip();
  field(g, '#f4f6ff');
  marker(g, () => rr(g, -198, -358, 396, 90, 0), C.teal, 0);
  letter(g, 'FEEDBACK', 0, -300, 40, { col: C.cream, w: .2, align: 'center', seed: 3 });
  // Message bubbles from other families: avatars and scribbled text.
  const msgs = [[C.pink, 1], [C.yellow, -1], [C.lilac, 1], [C.orange, -1], [C.sky, 1]];
  msgs.forEach(([col, side], k) => {
    const y = -220 + k * 120;
    const show = clamp((t - 21.2 - k * .25) / .15);
    if (show <= 0) return;
    g.save(); g.globalAlpha *= show;
    const bx = side > 0 ? -170 : -60;
    circle(g, side > 0 ? -170 : 170, y + 30, 26); marker(g, () => circle(g, side > 0 ? -170 : 170, y + 30, 26), col, 2.4);
    marker(g, () => rr(g, bx + (side > 0 ? 40 : 0), y, 230, 70, 20), shade(col, .55), 2.4);
    g.save(); g.drop = null; g.ink = null; g.strokeStyle = rgba(C.ink, .7); g.lineWidth = 4; g.lineCap = 'round';
    for (let r = 0; r < 2; r++) { line(g, bx + (side > 0 ? 60 : 20), y + 24 + r * 22, bx + (side > 0 ? 60 : 20) + 180 - r * 60 - (k % 2) * 30, y + 24 + r * 22); g.stroke(); }
    g.restore(); g.restore();
  });
  g.restore(); g.restore();
  // Mo, reading someone else's message, jaw on the floor.
  const shock = clamp((t - 21.4) / .2);
  who(g, 'mo', 800, 1760, { s: 230, eyes: shock > .5 ? 'wide' : 'open', brow: 'up', mouth: shock * .9, armL: -1.2, look: [-.8, .1] });
  // An open padlock over the leak.
  g.save(); g.translate(760, 930); g.rotate(.1 + Math.sin(t * 5) * .05);
  marker(g, () => { g.beginPath(); g.arc(0, -40, 34, Math.PI, TAU * .95); }, 'rgba(0,0,0,0)', 0);
  g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.ink; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.arc(24, -60, 34, Math.PI * 1.05, TAU * 1.02); g.stroke(); g.restore();
  cut(g, () => rr(g, -50, -40, 100, 80, 12), C.yellow, { drop: 8 });
  circle(g, 0, -4, 10); g.fillStyle = C.ink; g.fill();
  g.restore();
  sing(g, t, 20.80, {
    rows: [{ text: "Your school's new", y: 290, size: 100, rot: -.02 }, { text: 'feedback app', y: 430, size: 100, rot: .02 },
      { text: 'let parents read', y: 580, size: 92, rot: -.015 }, { text: "each others' texts", y: 720, size: 88, rot: .015 }],
    paper: { cols: [C.cream] }, maxW: 900, speed: 1.6,
    emph: { read: { col: C.red }, texts: { col: C.teal } },
  });
}

// ---------------------------------------------------------------- 4: Dave, next to his angry ex
function panelWedding(g, t, c) {
  field(g, C.lilac);
  doodleField(g, 40, 120, 1000, 700, 12, 41, { kinds: ['heart', 'sparkle', 'star'], col: C.ink, cols: [C.cream, C.bubble] });
  // The picture sits high, so the band's "oooh" has the space below the table.
  g.save(); g.translate(0, -140);
  // Jess at the back, head in her hands.
  who(g, 'jess', 900, 1060, { s: 120, eyes: 'closed', brow: 'worry', armL: -2.2, armR: -2.2, armLenL: .7, armLenR: .7 });
  // The table: Dave and Sue side by side, their place cards touching.
  const steam = (t * 1.5) % 1;
  who(g, 'sue', 680, 1300, { s: 210, eyes: 'open', brow: 'down', frown: true, look: [-1, 0], armL: .1 });
  who(g, 'dave', 370, 1320, { s: 210, eyes: 'open', brow: 'worry', mouth: 0, look: [.7, 0], armR: .1 });
  // Sue's steam, Dave's sweat.
  for (let k = 0; k < 3; k++) {
    const p = (steam + k / 3) % 1;
    g.save(); g.globalAlpha *= Math.sin(p * Math.PI); doodle(g, 'spiral', 680 + (k - 1) * 70, 800 - p * 120, 26, { col: C.cream, w: 6 }); g.restore();
  }
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = 2.4; g.fillStyle = C.sky;
  const sw = (t * 1.3) % 1;
  g.beginPath(); g.moveTo(470, 900 + sw * 50); g.quadraticCurveTo(490, 945 + sw * 50, 470, 955 + sw * 50); g.quadraticCurveTo(450, 945 + sw * 50, 470, 900 + sw * 50); g.fill();
  g.restore();
  cut(g, () => { g.beginPath(); g.ellipse(540, 1360, 580, 140, 0, 0, TAU); }, C.cream, { drop: 14 });
  // Place cards.
  for (const [x, name, rot] of [[390, 'DAVE', -.06], [680, 'SUE', .05]]) {
    g.save(); g.translate(x, 1330); g.rotate(rot);
    cut(g, () => poly(g, [[-100, -44], [100, -44], [110, 44], [-110, 44]]), '#fffaf0', { drop: 6, inkW: 2.6 });
    letter(g, name, 0, 18, 50, { col: C.ink, w: .17, align: 'center', seed: 7 });
    g.restore();
  }
  // A lightning bolt between them.
  if (Math.floor(t * 8) % 2) doodle(g, 'bolt', 535, 1010, 70, { fill: C.yellow, rot: .2, w: 4 });
  g.restore();
  sing(g, t, 24.34, {
    rows: [{ text: 'Your wedding', y: 290, size: 104, rot: -.02 }, { text: 'seating site', y: 430, size: 104, rot: .02 },
      { text: 'put Dave next to', y: 580, size: 92, rot: -.015 }, { text: 'his angry ex!', y: 730, size: 104, rot: .015 }],
    paper: { cols: [C.cream] }, maxW: 900, speed: 1.6,
    emph: { dave: { col: C.blue }, angry: { col: C.red }, ex: { col: C.red } },
  });
}
