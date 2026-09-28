// The last pre-chorus, the last chorus and the outro: the door goes up, and the people the band
// built apps for are standing right there, in daylight. The band shows its checks; they say.
import { C, TAU, clamp, lerp, smooth, easeOut, easeOutBack, easeInOut, rr, circle, ellipse, poly, line, rnd, INK, rgba, mix, shade } from '../kit.js';
import { cut, marker, field, tape, doodle, doodleField, tornRect, speedLines, sunburst, checker } from '../zine.js';
import { sing, lineNear } from '../lyrics.js';
import { letter, measure } from '../hand.js';
import { member, play } from '../band.js';
import { who } from '../people.js';
import { garage, street, amp } from '../world.js';
import { bandInGarage, bug } from './chorus.js';
import { bigPhone } from './verse2.js';

// The cast on the driveway, from the back row forward. dy lifts them (for a closer framing).
export const DRIVE = [
  { n: 'dave', x: 250, y: 1190, s: 62 }, { n: 'sue', x: 330, y: 1190, s: 62 }, { n: 'obi', x: 790, y: 1195, s: 64 },
  { n: 'rosa', x: 300, y: 1320, s: 78 }, { n: 'gran', x: 460, y: 1325, s: 76 }, { n: 'mo', x: 620, y: 1320, s: 78 }, { n: 'kim', x: 760, y: 1320, s: 76 },
  { n: 'jess', x: 880, y: 1318, s: 76 },
];
export function driveway(g, t, c, o = {}) {
  street(g, t);
  const bp = c.K.beatPos(t);
  for (const p of DRIVE) {
    const pose = o.pose?.[p.n] || {};
    who(g, p.n, p.x, p.y, { s: p.s, full: true, shadow: true, eyes: 'happy', armL: -2.4 + Math.sin(bp * Math.PI + p.x) * .3, armR: -2.4 - Math.sin(bp * Math.PI + p.x) * .3, ...pose });
  }
}

// ---------------------------------------------------------------- pre-chorus 3: the door lifts
export function doorLifts(g, t, c, o = {}) {
  const lift = o.lift ? o.lift(t) : 0;
  garage(g, t, { night: 1 - lift * .5, lights: 1, door: lift, behind: (g2, t2) => driveway(g2, t2, c) });
}

// ---------------------------------------------------------------- chorus 3
// The reveal: the door rolls up on the downbeat. We're inside, behind the band, looking out: the
// people it was all for are in the doorway, dancing, and the chorus hangs over them as bunting.
export function revealShot(g, t, c, o = {}) {
  const L = o.line;
  const open = easeInOut(clamp((t - (o.up ?? L - .1)) / .7));
  const bp = c.K.beatPos(t);
  garage(g, t, { night: 1 - open * .8, lights: 1, door: open, rug: true, behind: (g2, t2) => {
    street(g2, t2, 1330);
    // The cast, bigger than the room would let them be: they fill the doorway.
    g2.save(); g2.translate(540, 1330); g2.scale(1.38, 1.38); g2.translate(-560, -1330);
    for (const p of DRIVE) {
      if (p.y < 1250) continue;
      who(g2, p.n, p.x, p.y + 10, { s: p.s, full: true, shadow: true, eyes: 'happy', armL: -2.4 + Math.sin(bp * Math.PI + p.x) * .3, armR: -2.4 - Math.sin(bp * Math.PI + p.x) * .3 });
    }
    g2.restore();
  } });
  // The band from behind, in the foreground: backs to us, facing them at last.
  const e = c.energy;
  [['elder', 150, 1750, 300], ['builder', 930, 1750, 300], ['lead', 540, 1880, 380]].forEach(([m, x, y, sz]) => {
    member(g, x, y, m, { s: sz, t, back: true, legs: bp, squash: Math.pow(1 - (bp % 1), 3) * .06 * e, armL: -.4 - Math.sin(bp * Math.PI) * .3 * e, armR: m === 'lead' ? -1.3 : -.4, shadow: false });
  });
  sing(g, t, L, {
    rows: [{ text: 'How do I know,', y: 470, size: 96, rot: -.03 }, { text: 'how can you show,', y: 600, size: 86, rot: .025, ci: 1 },
      { text: 'what perfect', y: 730, size: 82, rot: -.02, ci: 2 }, { text: 'means to you?', y: 860, size: 92, rot: .02, ci: 3 }],
    paper: { cols: [C.pink, C.yellow, C.mint, C.lilac] }, maxW: 660,
    emph: { know: { col: C.cream }, show: { col: C.cream } },
  });
  if (open > 0 && open < 1) speedLines(g, 540, 330, 200, 900, 20, 5, rgba(C.cream, .8 * (1 - open)), 8);
}

// The users hand over their answers: Gran herself beside the bandmate who played her.
export function grannyShot(g, t, c, o = {}) {
  const L = o.line;
  street(g, t, 1480);
  const bp = c.K.beatPos(t);
  who(g, 'gran', 250, 1560, { s: 170, full: true, shadow: true, eyes: 'happy', armR: -2.6, armL: -.2, mouth: .3 });
  member(g, 790, 1600, 'gran', { s: 340, t, eyes: 'happy', legs: bp, armL: -2.4, armR: -.3, look: [-.5, -.2] });
  // The booking went through: her phone says so.
  const ok = easeOutBack(clamp((t - L - .5) / .25), 2);
  if (ok > 0) {
    g.save(); g.translate(520, 1050); g.rotate(-.06); g.scale(ok, ok);
    bigPhone(g, 0, 0, 200, 0, (g2, w, h) => { field(g2, '#effff6'); marker(g2, () => circle(g2, 0, 0, 70), C.green, 3); doodle(g2, 'tick', 0, 0, 40, { col: C.cream, w: 14 }); });
    g.restore();
    for (let k = 0; k < 5; k++) doodle(g, 'sparkle', 380 + k * 70, 860 + Math.sin(t * 5 + k) * 18, 22, { fill: C.yellow, w: 3 });
  }
  sing(g, t, L, {
    rows: [{ text: 'All of my checks,', y: 300, size: 100, rot: -.02 }, { text: 'all of my tests,', y: 450, size: 100, rot: .02, ci: 1 },
      { text: "don't find the bugs", y: 610, size: 92, rot: -.015, ci: 2 }, { text: 'you do', y: 760, size: 118, rot: .02, ci: 3 }],
    paper: { cols: [C.cream] }, maxW: 900,
    emph: { checks: { col: C.green }, tests: { col: C.green }, bugs: { col: C.red }, you: { col: C.pink }, do: { col: C.pink } },
  });
}

// The guide, now written by the people it's for: each page one of their answers.
export function guideFull(g, t, c, o = {}) {
  const L = o.line;
  sunburst(g, 540, 1250, 2300, 18, C.yellow, shade(C.yellow, .14), t * .08);
  member(g, 230, 1830, 'soft', { s: 330, t, eyes: 'happy', look: [.7, -.4], legs: 0, armR: -.9, extR: 1.3 });
  who(g, 'rosa', 880, 1880, { s: 150, eyes: 'happy', armL: -1.4, look: [-.6, -.3] });
  g.save(); g.translate(560, 1260); g.rotate(-.04);
  cut(g, () => { g.beginPath(); g.moveTo(-330, -230); g.quadraticCurveTo(-165, -260, 0, -230); g.lineTo(0, 230); g.quadraticCurveTo(-165, 200, -330, 230); g.closePath(); }, C.cream, { drop: 12 });
  cut(g, () => { g.beginPath(); g.moveTo(330, -230); g.quadraticCurveTo(165, -260, 0, -230); g.lineTo(0, 230); g.quadraticCurveTo(165, 200, 330, 230); g.closePath(); }, C.cream, { drop: 0 });
  // Four answers, one in each corner of the spread, arriving on the beat.
  const items = [
    [-165, -110, (g2) => { marker(g2, () => { g2.beginPath(); g2.arc(0, 20, 60, Math.PI, TAU); g2.lineTo(0, 20); g2.closePath(); }, C.green, 3); }],
    [-165, 110, (g2) => { who(g2, 'gran', 0, 70, { s: 40, eyes: 'happy' }); }],
    [165, -110, (g2) => { g2.save(); g2.drop = null; g2.ink = null; g2.strokeStyle = C.ink; g2.lineWidth = 9; g2.beginPath(); g2.arc(0, -10, 24, Math.PI, TAU); g2.stroke(); g2.restore(); cut(g2, () => rr(g2, -34, -12, 68, 54, 8), C.gold, { drop: 4 }); }],
    [165, 110, (g2) => { letter(g2, 'DAVE', -40, 0, 26, { col: C.ink, w: .17, align: 'center' }); letter(g2, 'SUE', 50, 40, 26, { col: C.ink, w: .17, align: 'center' }); doodle(g2, 'bolt', 5, 20, 22, { fill: C.red, w: 2 }); }],
  ];
  items.forEach(([x, y, fn], k) => {
    const p = easeOutBack(clamp((t - L - .3 - k * .4) / .2), 2);
    if (p <= 0) return;
    g.save(); g.translate(x, y); g.scale(p, p); fn(g); g.restore();
    doodle(g, 'tick', x + 100, y + 60, 22, { col: C.green, w: 8 });
  });
  g.restore();
  sing(g, t, L, {
    rows: [{ text: 'Give me a guide,', y: 300, size: 100, rot: -.02 }, { text: 'something to try,', y: 450, size: 96, rot: .02, ci: 1 },
      { text: 'to make your', y: 600, size: 88, rot: -.015, ci: 2 }, { text: 'dreams come true!', y: 750, size: 104, rot: .015, ci: 3 }],
    paper: { cols: [C.cream, C.cream, C.bubble, C.bubble] }, maxW: 880,
    emph: { guide: { col: C.teal }, try: { col: C.teal }, dreams: { col: C.pink }, true: { col: C.pink } },
  });
}

// ---------------------------------------------------------------- outro
// The check report, a zine page: how each check came through, and what the band can't know.
const REPORT = [
  ['LOAD', 'EVERY MERGE', C.teal], ['GRAN', 'BOOKED IT', C.pink], ['ISOLATION', 'NOTHING SHOWS', C.yellow], ['DAVE & SUE', 'TABLES APART', C.lilac],
];
export function reportShot(g, t, c, o = {}) {
  const L1 = o.line, L2 = o.line2;
  field(g, C.cream);
  doodleField(g, 30, 1560, 1020, 300, 8, 131, { kinds: ['star', 'sparkle', 'heart'], col: C.ink, cols: [C.yellow, C.pink, C.mint] });
  g.save(); g.translate(540, 1420); g.rotate(-.015); g.scale(.74, .74);
  cut(g, () => rr(g, -440, -330, 880, 700, 12), C.white, { drop: 14 });
  cut(g, () => tornRect(g, -300, -380, 600, 90, 4), C.ink, { drop: 8, ink: false });
  letter(g, 'CHECK REPORT', 0, -318, 50, { col: C.cream, w: .2, align: 'center', seed: 9 });
  REPORT.forEach(([name, how, col], k) => {
    const y = -240 + k * 110;
    const p = clamp((t - L1 - .3 - k * .5) / .15);
    if (p <= 0) return;
    g.save(); g.globalAlpha *= p;
    marker(g, () => rr(g, -410, y - 44, 330, 88, 10), col, 3);
    letter(g, name, -245, y + 19, name.length > 8 ? 40 : 50, { col: C.ink, w: .19, align: 'center', seed: 11 + k });
    letter(g, how, -55, y + 17, 42, { col: C.ink, w: .17, seed: 21 + k });
    doodle(g, 'tick', 360, y, 32, { col: C.green, w: 12 });
    g.restore();
  });
  // What the band doesn't know: shown, not guessed at, and left to you.
  const q = clamp((t - (L2 ?? L1 + 3.5) - .2) / .2);
  if (q > 0) {
    const y = -240 + 4 * 110;
    g.save(); g.globalAlpha *= q;
    marker(g, () => rr(g, -410, y - 44, 330, 88, 10), C.bubble, 3);
    doodle(g, 'heart', -245, y, 26, { fill: C.red, w: 3 });
    letter(g, '?', 360, y + 22, 64, { col: C.pink, w: .2, align: 'center', seed: 4 });
    g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.pink; g.lineWidth = 6; g.setLineDash([14, 10]); rr(g, -80, y - 36, 380, 72, 10); g.stroke(); g.setLineDash([]); g.restore();
    g.restore();
  }
  g.restore();
  // Two lines, one above the other, so the first stays up while the second is sung.
  sing(g, t, L1, {
    rows: [{ text: 'Here are the checks,', y: 250, size: 80, rot: -.02 }, { text: 'here are the tests,', y: 355, size: 80, rot: .015, ci: 1 },
      { text: 'and how each one', y: 460, size: 76, rot: -.01, ci: 2 }, { text: 'came through', y: 562, size: 80, rot: .015, ci: 3 }],
    paper: { cols: [C.mint, C.mint, C.lemon, C.lemon] }, maxW: 900,
    emph: { checks: { col: C.green }, tests: { col: C.green } },
  });
  if (L2 !== undefined) sing(g, t, L2, {
    rows: [{ text: "What I don't know,", y: 690, size: 80, rot: -.02 }, { text: 'that I will show,', y: 795, size: 80, rot: .015, ci: 1 },
      { text: 'and leave the rest', y: 900, size: 76, rot: -.01, ci: 2 }, { text: 'to you', y: 1010, size: 92, rot: .02, ci: 3 }],
    paper: { cols: [C.bubble, C.bubble, C.cream, C.cream] }, maxW: 900,
    emph: { know: { col: C.pink }, show: { col: C.pink }, you: { col: C.pink } },
  });
}

// "So, do you love it?": the lead, nervous, holds the phone out to them.
export function askShot(g, t, c, o = {}) {
  const L = o.line;
  street(g, t, 1560);
  const bp = c.K.beatPos(t);
  // Everyone waiting, quiet, in a row.
  ['rosa', 'gran', 'mo', 'jess'].forEach((n, k) => who(g, n, 190 + k * 235, 1640, { s: 95, full: true, shadow: true, eyes: 'open', look: [0, 0] }));
  member(g, 540, 1920, 'lead', { s: 380, t, eyes: 'worried', blush: 1, look: [0, -.7], legs: 0, armL: -1.5, armR: -1.5, sweat: 1, mouth: clamp(c.K.vocal(t) * 1.3), squash: -.02 });
  bigPhone(g, 540, 1420, 170, Math.sin(t * 22) * .03, (g2, w, h) => { field(g2, C.mint); doodle(g2, 'heart', 0, 0, 40, { fill: C.pink, w: 3 }); }, { drop: 8 });
  sing(g, t, L, {
    rows: [{ text: 'So, do you', y: 460, size: 120, rot: -.02 }, { text: 'love it?', y: 670, size: 170, rot: .02, ci: 1 }],
    paper: { cols: [C.cream, C.bubble] }, maxW: 900, emph: { love: { col: C.red }, it: { col: C.red } },
  });
}

// "(I love it)" four times: a comic page that fills a panel at a time, so each answer stays up
// while the next is sung.
export function loveItGrid(g, t, c) {
  field(g, C.ink);
  const cast = [['rosa', C.pink, 153.4], ['gran', C.teal, 154.9], ['mo', C.yellow, 156.1], ['jess', C.lilac, 157.0]];
  const bp = c.K.beatPos(t);
  cast.forEach(([n, col, near], k) => {
    const L = lineNear(near, true);
    const x0 = 40 + (k % 2) * 510, y0 = 180 + Math.floor(k / 2) * 640, w = 490, h = 620;
    const p = easeOutBack(clamp((t - L.start + .12) / .16), 1.8);
    if (p <= 0) return;
    g.save(); g.translate(x0 + w / 2, y0 + h / 2); g.scale(p, p); g.rotate((k % 2 ? 1 : -1) * .012); g.translate(-(x0 + w / 2), -(y0 + h / 2));
    cut(g, () => rr(g, x0, y0, w, h, 10), col, { drop: 10, ink: C.ink, inkW: 4 });
    g.save(); rr(g, x0, y0, w, h, 10); g.clip();
    sunburst(g, x0 + w / 2, y0 + h * .8, 900, 14, col, shade(col, .14), t * .1 * (k % 2 ? -1 : 1));
    const singing = t >= L.start && t <= L.end + .1;
    who(g, n, x0 + w / 2, y0 + h + 40, { s: 150, eyes: 'happy', mouth: singing ? .7 : 0, armL: -2.5 + Math.sin(bp * Math.PI) * .2, armR: -2.5 - Math.sin(bp * Math.PI) * .2 });
    g.restore();
    g.restore();
    // The speech bubble, over the top of the panel.
    const raw = g.raw || g;
    raw.save(); raw.translate(x0 + w / 2 - (k % 2) * 75, y0 + 150); raw.rotate((k % 2 ? 1 : -1) * .04); raw.scale(p, p);
    cut(g, () => { rr(g, -215, -95, 430, 170, 80); g.moveTo(-30, 70); g.lineTo(-5, 140); g.lineTo(40, 70); }, C.cream, { drop: 8 });
    raw.restore();
    sing(g, t, L, { back: true, rows: [{ text: 'I love it', x: x0 + w / 2 - (k % 2) * 75, y: y0 + 185, size: 80, rot: (k % 2 ? 1 : -1) * .04 }], style: 'marker', maxW: 310, emph: { love: { col: C.red } } });
  });
}

// "(I love it)", one of them at a time, each in a speech bubble.
export function loveItShot(g, t, c, o = {}) {
  const L = o.back;
  sunburst(g, 540, 1300, 2300, 18, o.c1 || C.pink, shade(o.c1 || C.pink, .12), t * .1);
  const bp = c.K.beatPos(t);
  who(g, o.who, 540, 1880, { s: 250, eyes: 'happy', mouth: L && t >= L.start && t <= L.end ? .7 : 0, armL: -2.5 + Math.sin(bp * Math.PI) * .2, armR: -2.5 - Math.sin(bp * Math.PI) * .2, ...(o.pose || {}) });
  if (!L) return;
  const p = easeOutBack(clamp((t - L.start + .05) / .16), 2.2);
  if (p <= 0) return;
  const raw = g.raw || g;
  raw.save(); raw.translate(540, 760); raw.rotate(o.rot ?? -.04); raw.scale(p, p);
  cut(g, () => { rr(g, -420, -190, 840, 330, 150); g.moveTo(-60, 130); g.lineTo(-10, 260); g.lineTo(60, 130); }, C.cream, { drop: 14 });
  raw.restore();
  sing(g, t, L, { back: true, rows: [{ text: 'I love it', y: 830, size: 150, rot: o.rot ?? -.04 }], style: 'marker', maxW: 780, emph: { love: { col: C.red } } });
}

// "(Dave's still coming, though)": Jess, deadpan. Dave waves from the back; Sue does not.
export function daveComingShot(g, t, c, o = {}) {
  const L = o.back;
  street(g, t, 1300);
  const bp = c.K.beatPos(t);
  who(g, 'sue', 250, 1400, { s: 120, full: true, shadow: true, eyes: 'open', brow: 'down', frown: true, look: [.8, 0] });
  who(g, 'dave', 830, 1390, { s: 120, full: true, shadow: true, eyes: 'happy', armR: -2.6 + Math.sin(t * 10) * .3, mouth: .5 });
  who(g, 'jess', 540, 1900, { s: 260, eyes: 'open', brow: 'down', look: [0, 0], mouth: L && t >= L.start && t <= L.end ? .25 : 0, noBrows: false });
  if (!L) return;
  sing(g, t, L, { back: true, rows: [{ text: "Dave's still coming,", y: 420, size: 104, rot: -.02 }, { text: 'though', y: 580, size: 120, rot: .02 }],
    style: 'marker', paper: { cols: [C.cream, C.cream] }, maxW: 900, emph: { "dave's": { col: C.blue } } });
}

// The outro's instrumental: everybody in the driveway, the band playing, and the question the
// song leaves you with, to screenshot.
export function endCard(g, t, c, o = {}) {
  const t0 = c.t0;
  garage(g, t, { night: 0, lights: 1, door: 1, behind: (g2, t2) => driveway(g2, t2, c) });
  bandInGarage(g, t, c);
  // The closing "ooh", sung by everyone, lettered over the band.
  const ooh = lineNear(166, true);
  if (ooh) sing(g, t, ooh, { back: true, rows: [{ text: 'OOOOH', x: 600, y: 1300, size: 104, rot: -.06, maxW: 560 }], style: 'marker', paper: { chip: true, cols: [C.cream], pad: .22 }, hold: .3 });
  const beat = c.K.beat || .441;
  const p = easeOutBack(clamp((t - t0 - .1) / .25), 1.8);
  g.save(); g.translate(540, 590); g.rotate(-.02); g.scale(p * .84, p * .84);
  cut(g, () => rr(g, -470, -420, 940, 780, 14), C.cream, { drop: 16 });
  tape(g, -440, -410, 140, -.5); tape(g, 440, -410, 140, .5);
  letter(g, 'HOW WILL', 0, -300, 96, { col: C.ink, w: .2, align: 'center', seed: 3 });
  letter(g, 'YOUR AGENT KNOW?', 0, -180, 84, { col: C.pink, w: .2, align: 'center', seed: 4, outline: { col: C.ink, w: .04 } });
  const items = [['SOMETHING TO RUN', 'ON EVERY CHANGE', C.teal], ['A BOT THAT PLAYS', 'YOUR USERS', C.pink], ['A CHECK FOR WHAT', "SHOULDN'T SHOW", C.yellow], ['WHAT ONLY YOU', 'KNOW: SAY IT', C.lilac]];
  items.forEach(([a, b, col], k) => {
    const q = clamp((t - t0 - .6 - k * beat * 2) / .15);
    if (q <= 0) return;
    const y = -60 + k * 105;
    g.save(); g.globalAlpha *= q;
    marker(g, () => circle(g, -380, y, 30), col, 3);
    doodle(g, 'tick', -380, y, 18, { col: C.ink, w: 7 });
    letter(g, a, -320, y - 4, 38, { col: C.ink, w: .17, seed: 30 + k });
    letter(g, b, -320, y + 40, 38, { col: shade(col, -.35), w: .17, seed: 40 + k });
    g.restore();
  });
  g.restore();
}
