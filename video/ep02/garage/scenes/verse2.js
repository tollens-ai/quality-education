// Verse 2: the answers. For each app in verse 1, the band builds a way to tell for themselves,
// in the garage workshop. The last one, Dave and Sue, nobody could have checked: you had to say.
import { C, TAU, clamp, lerp, smooth, easeOut, easeOutBack, easeInOut, rr, circle, ellipse, poly, line, rnd, INK, rgba, mix, shade } from '../kit.js';
import { cut, marker, field, tape, doodle, doodleField, tornRect, speedLines, sunburst, checker } from '../zine.js';
import { sing, lineNear } from '../lyrics.js';
import { letter } from '../hand.js';
import { member, play } from '../band.js';
import { who } from '../people.js';
import { facing, folk } from '../folk.js';
import { garage, note } from '../world.js';

// A big phone, face on, whose screen `scr` draws.
export function bigPhone(g, x, y, w, rot, scr, o = {}) {
  const h = w * 1.9;
  g.save(); g.translate(x, y); g.rotate(rot);
  cut(g, () => rr(g, -w / 2, -h / 2, w, h, w * .12), o.body || C.ink, { drop: o.drop ?? 14, inkW: 4 });
  g.save(); rr(g, -w / 2 + w * .05, -h / 2 + w * .05, w * .9, h - w * .1, w * .08); g.clip();
  field(g, o.bg || C.cream);
  scr(g, w * .9, h - w * .1);
  g.restore(); g.restore();
}

// A floor for the workshop shots: flat colour with the rug.
function workshop(g, t, col) {
  field(g, col);
  doodleField(g, 30, 140, 1020, 620, 10, 77, { kinds: ['star', 'sparkle', 'bolt', 'squiggle'], col: C.ink });
  checker(g, { x0: -200, x1: 1280, yTop: 1500, yBot: 2000, cols: 12, rows: 6, c1: C.ink, c2: C.cream, topW: .7 });
}

// ---------------------------------------------------------------- 1: load on every merge
export function loadShot(g, t, c, o = {}) {
  const L = o.line;
  workshop(g, t, C.orange);
  const K = c.K, bp = K.beatPos(t);
  g.save(); g.translate(540, 1180); g.scale(1.12, 1.12); g.translate(-520, -1250);
  // Merges arrive along a belt: two lines joining, a git merge drawn in marker. Each one that
  // reaches the machine fires a crowd at the checkout.
  for (let k = -1; k < 5; k++) {
    const x = 60 + ((bp * .5 + k) % 5) * 90 - 90;
    g.save(); g.translate(x, 1320);
    cut(g, () => rr(g, -36, -36, 72, 72, 10), C.cream, { drop: 6, inkW: 2.6 });
    g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.ink; g.lineWidth = 7; g.lineCap = 'round';
    line(g, -14, -20, -14, 20); g.stroke(); g.beginPath(); g.moveTo(14, -20); g.quadraticCurveTo(14, 4, -14, 14); g.stroke();
    g.fillStyle = C.ink; for (const [px, py] of [[-14, -20], [14, -20], [-14, 20]]) { circle(g, px, py, 8); g.fill(); }
    g.restore(); g.restore();
  }
  marker(g, () => rr(g, -40, 1370, 440, 26, 8), '#4a3f60', 3);
  // The machine: a box with a funnel, cranked by the builder.
  cut(g, () => rr(g, 250, 1080, 260, 300, 16), C.teal, { drop: 12 });
  marker(g, () => poly(g, [[470, 1130], [620, 1060], [620, 1200], [470, 1260]]), shade(C.teal, -.2), 3.4);
  letter(g, 'LOAD', 380, 1250, 58, { col: C.cream, w: .2, align: 'center', seed: 4, outline: { col: C.ink, w: .05 } });
  play(g, t, K, 'builder', 200, 1560, { s: 250, energy: 1, noInst: true, pose: { armR: -1.6 + Math.sin(t * 9) * .5, eyes: 'happy' } });
  // The checkout, on a big phone: people pour in, it stays green.
  bigPhone(g, 830, 1150, 300, .06, (g2, w, h) => {
    field(g2, '#effff6');
    marker(g2, () => rr(g2, -w / 2 + 20, -h / 2 + 30, w - 40, 70, 14), C.green, 3);
    letter(g2, 'CHECKOUT', 0, -h / 2 + 80, 34, { col: C.cream, w: .2, align: 'center', seed: 2 });
    // A gauge: the needle wobbles but stays in the green.
    g2.save(); g2.translate(0, 40);
    marker(g2, () => { g2.beginPath(); g2.arc(0, 0, 100, Math.PI, TAU); g2.lineTo(0, 0); g2.closePath(); }, C.cream, 3);
    marker(g2, () => { g2.beginPath(); g2.arc(0, 0, 100, Math.PI, Math.PI * 1.55); g2.lineTo(0, 0); g2.closePath(); }, C.green, 3);
    g2.save(); g2.rotate(-Math.PI * .75 + Math.sin(t * 7) * .15); g2.drop = null; g2.ink = null; g2.strokeStyle = C.ink; g2.lineWidth = 8; g2.lineCap = 'round'; line(g2, 0, 0, 85, 0); g2.stroke(); g2.restore();
    g2.restore();
    if (t > L + 1.5) doodle(g2, 'tick', 0, 200, 60, { col: C.green, w: 16 });
  });
  // The crowd: tiny people flying in an arc from the funnel into the phone.
  for (let i = 0; i < 26; i++) {
    const ph = ((t - L) * 1.3 + i / 26) % 1;
    if (t < L - .2) continue;
    const x = lerp(620, 820, ph), y = 1130 - Math.sin(ph * Math.PI) * 280 + (i % 3) * 12;
    const f = folk(700 + i);
    facing(g, x + (i % 5) * 6, y, 34, { ...f, arm: 'wave', up: 1 });
  }
  g.restore();
  sing(g, t, L, {
    rows: [{ text: 'Give me a tool', y: 330, size: 104, rot: -.02 }, { text: 'to run on every merge', y: 480, size: 84, rot: .015, ci: 1 },
      { text: 'to check the load', y: 630, size: 100, rot: -.015, ci: 2 }],
    paper: { cols: [C.cream] }, maxW: 900,
    emph: { tool: { col: C.teal }, merge: { col: C.violet }, load: { col: C.red } },
  });
}

// ---------------------------------------------------------------- 2: a bot acts as Gran
export function granShot(g, t, c, o = {}) {
  const L = o.line;
  workshop(g, t, C.bubble);
  const K = c.K;
  // The prompt, handed over by the lead: a card with a picture of Gran on it.
  const tAct = o.act ?? L + 1.2;
  const change = smooth((t - tAct) / .25);
  g.save(); g.translate(540, 1500); g.scale(1.25, 1.25); g.translate(-470, -1560);
  member(g, 190, 1620, 'lead', { s: 230, t, eyes: 'happy', legs: K.beatPos(t), armR: -.6, extR: 1.3, look: [.6, 0],
    hold: (g2, u) => { if (change < .5) { g2.save(); g2.rotate(.1); cut(g2, () => rr(g2, 0, -u * 2.2, u * 2.6, u * 3.2, u * .3), C.cream, { drop: 6, inkW: 2.4 }); who(g2, 'gran', u * 1.3, -u * .1, { s: u * .9, eyes: 'happy' }); g2.restore(); } } });
  // The older one, and then "Gran": the cardigan and perm go on in a puff.
  const gx = 600, gy = 1640;
  if (change < .5) member(g, gx, gy, 'elder', { s: 300, t, eyes: 'open', look: [-.6, 0], legs: 0, armR: -.4 });
  else member(g, gx, gy, 'gran', { s: 300, t, eyes: t > tAct + 1.2 ? 'happy' : 'open', look: [.5, -.2], legs: 0, armR: -1.1, extR: 1.3,
    hold: (g2, u) => { g2.save(); g2.rotate(.25); bigPhone(g2, u * .8, -u * 2.2, u * 2.6, 0, (g3, w, h) => {
      field(g3, C.cream);
      // A plain booking screen: one date, one huge button.
      marker(g3, () => rr(g3, -w / 2 + 10, -h / 2 + 18, w - 20, h * .3, 8), C.sky, 2.4);
      const pressed = t > tAct + 1.1;
      marker(g3, () => rr(g3, -w / 2 + 10, h * .12, w - 20, h * .3, 12), pressed ? C.green : C.pink, 2.4);
      if (pressed) doodle(g3, 'tick', 0, h * .27, w * .22, { col: C.cream, w: 8 });
    }, { drop: 6 }); g2.restore(); } });
  if (change > 0 && change < 1) {
    // The puff of a quick change.
    g.save(); g.globalAlpha *= Math.sin(change * Math.PI);
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; marker(g, () => circle(g, gx + Math.cos(a) * 130, gy - 180 + Math.sin(a) * 110, 70), C.cream, 3); }
    g.restore();
  }
  // Reading glasses in the air, sparkles once it works.
  if (t > tAct + 1.2) for (let k = 0; k < 4; k++) doodle(g, 'sparkle', 780 + k * 60, 1150 + Math.sin(t * 5 + k) * 20, 22, { fill: C.yellow, w: 3 });
  g.restore();
  sing(g, t, L, {
    rows: [{ text: "I'll prompt a bot", y: 330, size: 104, rot: -.02 }, { text: 'to act as Gran', y: 490, size: 110, rot: .02, ci: 1 },
      { text: 'make sure she can go', y: 650, size: 92, rot: -.015, ci: 2 }],
    paper: { cols: [C.cream] }, maxW: 900,
    emph: { bot: { col: C.clawdDark }, gran: { col: C.violet }, go: { col: C.green } },
  });
}

// ---------------------------------------------------------------- 3: the isolation check
export function isolationShot(g, t, c, o = {}) {
  const L = o.line;
  field(g, C.night);
  doodleField(g, 30, 140, 1020, 600, 12, 91, { kinds: ['star', 'sparkle'], col: C.cream, cols: [C.cream, C.lilac] });
  const K = c.K;
  // Four families' message boxes, each a door with a padlock. The torch tries each in turn.
  g.save(); g.translate(540, 1000); g.scale(1.12, 1.25); g.translate(-540, -1000);
  const doors = [[180, C.pink], [420, C.yellow], [660, C.mint], [900, C.lilac]];
  const tried = k => t > L + .5 + k * .55;
  const beam = clamp((t - L - .3) / 2.4) * 3;
  const aim = doors[Math.min(3, Math.floor(beam))][0];
  // The torch beam: a flat pale wedge.
  g.save(); g.drop = null; g.ink = null; g.fillStyle = rgba(C.lemon, .28);
  poly(g, [[540, 1500], [540 + (aim - 540) * 1.12 - 130, 1000], [540 + (aim - 540) * 1.12 + 130, 1000]]); g.fill(); g.restore();
  doors.forEach(([x, col], k) => {
    cut(g, () => rr(g, x - 95, 880, 190, 300, 16), col, { drop: 10 });
    for (let r = 0; r < 3; r++) { g.save(); g.drop = null; g.ink = null; g.strokeStyle = rgba(C.ink, .35); g.lineWidth = 6; g.lineCap = 'round'; line(g, x - 60, 960 + r * 40, x + 50 - r * 20, 960 + r * 40); g.stroke(); g.restore(); }
    // The padlock: closed, and it stays closed when tried.
    const shake = tried(k) && t < L + .5 + k * .55 + .3 ? Math.sin(t * 60) * .12 : 0;
    g.save(); g.translate(x, 1120); g.rotate(shake);
    g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.ink; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.arc(0, -34, 26, Math.PI, TAU); g.stroke(); g.restore();
    cut(g, () => rr(g, -40, -36, 80, 64, 10), C.gold, { drop: 6 });
    g.restore();
    if (tried(k)) doodle(g, 'tick', x, 1250, 36, { col: C.green, w: 12 });
  });
  g.restore();
  // The bad boy, in a parent's lanyard, trying them all.
  member(g, 540, 1860, 'bad', { s: 400, t, eyes: 'open', look: [(aim - 540) / 400, -.6], legs: 0, armR: -1.2, extR: 1.2,
    dressTop: (g2, u, b) => { g2.save(); g2.drop = null; g2.ink = null; g2.strokeStyle = C.blue; g2.lineWidth = u * .16; g2.beginPath(); g2.moveTo(-u * 1.6, b.by + b.bh * .35); g2.lineTo(0, b.by + b.bh * .75); g2.lineTo(u * 1.6, b.by + b.bh * .35); g2.stroke(); g2.ink = INK.col; g2.inkW = 2.4; g2.fillStyle = C.cream; rr(g2, -u * .7, b.by + b.bh * .7, u * 1.4, u * 1, u * .15); g2.fill(); g2.restore(); },
    hold: (g2, u) => { g2.save(); g2.rotate(-.5); cut(g2, () => rr(g2, -u * .3, -u * 1.6, u * .6, u * 1.8, u * .2), C.red, { drop: 5, inkW: 2.4 }); marker(g2, () => rr(g2, -u * .42, -u * 2, u * .84, u * .5, u * .15), C.lemon, 2.4); g2.restore(); } });
  sing(g, t, L, {
    rows: [{ text: 'An isolation check', y: 330, size: 100, rot: -.02 }, { text: 'to find the things', y: 480, size: 96, rot: .015, ci: 1 },
      { text: "that shouldn't show", y: 640, size: 104, rot: -.015, ci: 2 }],
    paper: { cols: [C.cream] }, maxW: 900,
    emph: { isolation: { col: C.teal }, "shouldn't": { col: C.red } },
  });
}

// ---------------------------------------------------------------- 4: Dave and Sue
export function daveSueShot(g, t, c, o = {}) {
  const L = o.line;
  garage(g, t, { night: 1, lights: .8 });
  const K = c.K;
  // The note comes in under the door: the seating plan, with Dave and Sue pulled apart.
  const p = easeOut(clamp((t - L - 1.2) / .5));
  if (p > 0) {
    g.save(); g.translate(540, lerp(1330, 1060, p)); g.rotate(-.06 * p); g.scale(lerp(.6, 1.35, p), lerp(.6, 1.35, p));
    cut(g, () => rr(g, -250, -130, 500, 260, 8), C.cream, { drop: 10 });
    marker(g, () => circle(g, -120, 0, 80), C.bubble, 3);
    marker(g, () => circle(g, 120, 0, 80), C.sky, 3);
    letter(g, 'DAVE', -120, 16, 40, { col: C.ink, w: .17, align: 'center', seed: 3 });
    letter(g, 'SUE', 120, 16, 40, { col: C.ink, w: .17, align: 'center', seed: 4 });
    doodle(g, 'arrow', -10, -90, 40, { col: C.red, w: 7, rot: Math.PI });
    doodle(g, 'arrow', 10, 90, 40, { col: C.red, w: 7 });
    g.restore();
  }
  // The band, in a huddle: the lead turns to us for "you really had to let me know".
  const turn = t > L + 1.6;
  ['elder', 'builder', 'soft', 'bad'].forEach((m, k) => {
    member(g, [110, 290, 790, 970][k], 1760 + (k % 2) * 30, m, { s: 200, t, eyes: turn ? 'open' : 'worried', look: [0, turn ? .5 : -.2], legs: 0, armL: -.2, armR: -.2 });
  });
  member(g, 540, 1900, 'lead', { s: 330, t, eyes: turn ? 'open' : 'worried', look: [0, 0], mouth: clamp(K.vocal(t) * 1.3), legs: 0, armR: turn ? -.2 : .3, extR: turn ? 1.6 : 1, armL: turn ? -2.2 : .3 });
  sing(g, t, L, {
    rows: [{ text: 'But as for Dave and Sue,', y: 360, size: 90, rot: -.02 }, { text: 'you really', y: 520, size: 110, rot: .02, ci: 1 },
      { text: 'had to let me know!', y: 680, size: 100, rot: -.015, ci: 2 }],
    paper: { cols: [C.cream, C.yellow, C.yellow] }, maxW: 900,
    emph: { dave: { col: C.blue }, sue: { col: C.red }, you: { col: C.pink }, know: { col: C.pink } },
  });
}
