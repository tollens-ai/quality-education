// Chorus: the band plays the garage with the door shut, and the chorus is taped to the door.
import { C, TAU, clamp, lerp, smooth, easeOut, easeOutBack, rr, circle, poly, line, rnd, INK, rgba, shade } from '../kit.js';
import { garage, amp } from '../world.js';
import { play, micStand, mic, member } from '../band.js';
import { cut, marker, doodle, sunburst, speedLines } from '../zine.js';
import { sing, lineNear } from '../lyrics.js';
import { letter } from '../hand.js';

// The band in the garage, from the back row forward.
export function bandInGarage(g, t, c, o = {}) {
  const K = c.K, e = c.energy;
  amp(g, 300, 1390, 210, 240, { label: 'ASYNC' });
  amp(g, 790, 1390, 210, 240);
  play(g, t, K, 'bad', 540, 1330, { s: 190, energy: e });
  play(g, t, K, 'elder', 215, 1500, { s: 215, energy: e });
  play(g, t, K, 'builder', 870, 1500, { s: 215, energy: e });
  play(g, t, K, 'soft', 170, 1830, { s: 230, energy: e });
  micStand(g, 600, 1840, 250, 40);
  play(g, t, K, 'lead', 610, 1800, { s: 270, energy: e, sing: 1, noInst: true, pose: { armR: -1.25, ext: 1.1, hold: (g2, u) => mic(g2, u, { rot: -.2 }) } });
}

export function hookShot(g, t, c, o = {}) {
  garage(g, t, { night: 1 });
  bandInGarage(g, t, c);
  sing(g, t, o.line, {
    rows: [{ text: 'How do I know,', y: 520, size: 104, rot: -.025 }, { text: 'how can you show,', y: 690, size: 92, rot: .02, ci: 1 },
      { text: 'what perfect', y: 860, size: 84, rot: -.015, ci: 2 }, { text: 'means to you?', y: 1020, size: 100, rot: .025, ci: 3 }],
    paper: { cols: [C.cream, C.yellow, C.cream, C.mint] }, maxW: 700,
    emph: { know: { col: C.pink }, show: { col: C.pink }, perfect: { col: C.blue } },
  });
}

// ---------------------------------------------------------------- line 2: checks and bugs
// A beetle, cut from paper, walking: legs tick on the beat.
export function bug(g, x, y, s, rot, t, col = C.red) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.ink; g.lineWidth = s * .09; g.lineCap = 'round';
  for (let k = -1; k <= 1; k++) for (const sd of [-1, 1]) {
    const ph = Math.sin(t * 18 + k * 2 + sd) * s * .12;
    line(g, k * s * .3, 0, k * s * .3 + ph, sd * s * .62); g.stroke();
  }
  line(g, s * .5, -s * .1, s * .85, -s * .35); g.stroke(); line(g, s * .5, s * .1, s * .85, s * .35); g.stroke();
  g.restore();
  cut(g, () => { g.beginPath(); g.ellipse(0, 0, s * .55, s * .42, 0, 0, TAU); }, col, { drop: s * .12, inkW: 2.6 });
  marker(g, () => circle(g, s * .5, 0, s * .22), C.ink, 2);
  g.save(); g.drop = null; g.ink = null; g.fillStyle = C.ink; circle(g, -s * .15, -s * .18, s * .09); g.fill(); circle(g, -s * .1, s * .16, s * .08); g.fill(); line(g, -s * .5, 0, s * .4, 0); g.strokeStyle = C.ink; g.lineWidth = s * .05; g.stroke(); g.restore();
  g.restore();
}

export function checksShot(g, t, c, o = {}) {
  const L = o.line;
  garage(g, t, { night: o.night ?? 1, door: o.door ?? 0, behind: o.behind });
  // The builder with his clipboard: every box ticked.
  const bp = c.K.beatPos(t);
  member(g, 290, 1830, 'builder', { s: 400, t, eyes: t > L + 2.4 ? 'wide' : 'happy', look: [.6, -.2], legs: 0, armL: -.3, armR: -.7, extR: 1.4, sweat: t > L + 2.4 ? 1 : 0 });
  g.save(); g.translate(680, 1330); g.rotate(.05 + Math.sin(bp * Math.PI) * .01); g.scale(.82, .82);
  cut(g, () => rr(g, -250, -330, 500, 640, 16), '#c98b5a', { drop: 14 });
  marker(g, () => rr(g, -220, -290, 440, 580, 6), C.cream, 3);
  marker(g, () => rr(g, -80, -350, 160, 60, 10), '#9aa0b8', 3);
  for (let k = 0; k < 6; k++) {
    const y = -220 + k * 90;
    marker(g, () => rr(g, -190, y - 28, 56, 56, 8), C.cream, 3);
    g.save(); g.drop = null; g.ink = null; g.strokeStyle = rgba(C.ink, .5); g.lineWidth = 6; g.lineCap = 'round'; line(g, -110, y, 150 - (k % 3) * 40, y); g.stroke(); g.restore();
    if (t > L + k * .2) doodle(g, 'tick', -162, y, 30, { col: C.green, w: 11 });
    // After verse 2 the list has the new checks on it, each with its picture.
    if (o.icons && k < 3) {
      g.save(); g.translate(170, y);
      if (k === 0) { marker(g, () => { g.beginPath(); g.arc(0, 14, 30, Math.PI, TAU); g.lineTo(0, 14); g.closePath(); }, C.green, 2.4); }
      if (k === 1) { marker(g, () => rr(g, -24, -24, 48, 48, 10), '#f59bbd', 2.4); marker(g, () => circle(g, 0, -10, 12), '#e4e0ea', 2); }
      if (k === 2) { g.save(); g.drop = null; g.ink = null; g.strokeStyle = C.ink; g.lineWidth = 6; g.beginPath(); g.arc(0, -8, 14, Math.PI, TAU); g.stroke(); g.restore(); marker(g, () => rr(g, -20, -8, 40, 30, 5), C.gold, 2.4); }
      g.restore();
    }
  }
  g.restore();
  // The bugs you'd find, walking in under the door.
  for (let i = 0; i < 7; i++) {
    const a = L + 1.6 + i * .22;
    const p = clamp((t - a) / 1.6);
    if (p <= 0) continue;
    const x = lerp(1180, 200 + i * 110, easeOut(p)), y = 1340 + i * 70 + Math.sin(i) * 40;
    bug(g, x, y, 60 + (i % 3) * 14, Math.PI + Math.sin(t * 6 + i) * .15, t, i % 2 ? C.red : C.orange);
  }
  sing(g, t, L, {
    rows: [{ text: 'All of my checks,', y: 470, size: 100, rot: -.02 }, { text: 'all of my tests,', y: 620, size: 100, rot: .02, ci: 1 },
      { text: "don't find the bugs", y: 780, size: 96, rot: -.015, ci: 2 }, { text: 'you do', y: 930, size: 118, rot: .02, ci: 3 }],
    paper: { cols: [C.mint, C.mint, C.cream, C.yellow] }, maxW: 760,
    emph: { checks: { col: C.green }, tests: { col: C.green }, bugs: { col: C.red }, you: { col: C.pink }, do: { col: C.pink } },
  });
}

// ---------------------------------------------------------------- line 3: the blank guide
export function guideShot(g, t, c, o = {}) {
  const L = o.line;
  sunburst(g, 540, 1250, 2200, 18, o.c1 || C.teal, shade(o.c1 || C.teal, .1), t * .08);
  // The dream, in a cloud: an app with stars in its eyes.
  const dp = easeOutBack(clamp((t - L - 2.2) / .3), 1.8);
  if (dp > 0) {
    g.save(); g.translate(540, 1080); g.scale(dp, dp);
    cut(g, () => { g.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; g.moveTo(Math.cos(a) * 250 + 70, Math.sin(a) * 90); g.arc(Math.cos(a) * 250, Math.sin(a) * 90, 70, 0, TAU); } g.rect(-250, -90, 500, 180); }, C.cream, { drop: 10, ink: false });
    for (let k = 0; k < 5; k++) doodle(g, 'star', -200 + k * 100, Math.sin(t * 4 + k) * 12, 30, { fill: [C.yellow, C.pink, C.mint, C.lilac, C.orange][k], w: 3 });
    g.restore();
  }
  // The sensitive one with an open guidebook: every page blank.
  member(g, 280, 1860, 'soft', { s: 400, t, eyes: 'open', look: [.7, -.3], legs: 0, armL: -.3, armR: -.8, extR: 1.3 });
  g.save(); g.translate(690, 1480); g.rotate(-.06 + Math.sin(t * 2) * .03); g.scale(.72, .72);
  const flip = (t * 2.5) % 1;
  cut(g, () => { g.beginPath(); g.moveTo(-300, -170); g.quadraticCurveTo(-150, -200, 0, -170); g.lineTo(0, 170); g.quadraticCurveTo(-150, 140, -300, 170); g.closePath(); }, C.cream, { drop: 12 });
  cut(g, () => { g.beginPath(); g.moveTo(300, -170); g.quadraticCurveTo(150, -200, 0, -170); g.lineTo(0, 170); g.quadraticCurveTo(150, 140, 300, 170); g.closePath(); }, C.cream, { drop: 0 });
  // A page turning over, and over: nothing on any of them.
  g.save(); g.scale(Math.cos(flip * Math.PI), 1);
  marker(g, () => { g.beginPath(); g.moveTo(0, -170); g.quadraticCurveTo(150, -200, 290, -170); g.lineTo(290, 170); g.quadraticCurveTo(150, 140, 0, 170); g.closePath(); }, shade(C.cream, -.04), 3);
  g.restore();
  letter(g, '?', -150, 50, 120, { col: rgba(C.ink, .25), w: .2, align: 'center', seed: 3 });
  // Half the guide is written by now: the checks from verse 2, but not the dream.
  if (o.half) {
    g.save(); g.drop = null; g.ink = null; g.strokeStyle = rgba(C.ink, .5); g.lineWidth = 7; g.lineCap = 'round';
    for (let r = 0; r < 5; r++) { line(g, 40, -110 + r * 50, 250 - (r % 2) * 60, -110 + r * 50); g.stroke(); }
    g.restore();
    doodle(g, 'tick', 230, 130, 26, { col: C.green, w: 9 });
  }
  g.restore();
  sing(g, t, L, {
    rows: [{ text: 'Give me a guide,', y: 400, size: 100, rot: -.02 }, { text: 'something to try,', y: 550, size: 96, rot: .02, ci: 1 },
      { text: 'to make your', y: 700, size: 88, rot: -.015, ci: 2 }, { text: 'dreams come true!', y: 850, size: 104, rot: .015, ci: 3 }],
    paper: { cols: [C.cream, C.cream, C.lemon, C.lemon] }, maxW: 820,
    emph: { guide: { col: C.teal }, try: { col: C.teal }, dreams: { col: C.pink }, true: { col: C.pink } },
  });
}

// ---------------------------------------------------------------- line 4: the line to remember
// "I want you to love it (love it), so give me something I can prove!" held as one block: the
// lead on one knee, a heart held up, the band behind. Each half stays up once it's written.
export function loveShot(g, t, c, o = {}) {
  const L = o.line;
  sunburst(g, 540, 1100, 2400, 22, o.c1 || C.pink, shade(o.c1 || C.pink, .12), -t * .1);
  const K = c.K;
  ['elder', 'builder', 'soft', 'bad'].forEach((m, k) => {
    const x = [150, 360, 720, 930][k], y = 1500 + (k % 2) * 20;
    member(g, x, y, m, { s: 200, t, eyes: 'happy', legs: K.beatPos(t), armL: -1.8 - Math.sin(t * 8 + k) * .3, armR: -1.8 + Math.sin(t * 8 + k) * .3, look: [0, -.3] });
  });
  // The lead, down on one knee, holding up a heart.
  member(g, 540, 1860, 'lead', { s: 400, t, eyes: 'open', blush: 1, look: [0, -.5], mouth: clamp(K.vocal(t) * 1.3), legs: 0, armL: -1.9, armR: -1.9, squash: .05 });
  const hb = 1 + .06 * Math.pow(1 - (K.beatPos(t) % 1), 3);
  g.save(); g.translate(540, 1420); g.scale(hb, hb);
  cut(g, () => { g.beginPath(); heartPath(g, 0, 0, 115); }, C.red, { drop: 14 });
  g.restore();
  const back = lineNear(o.back ?? L + 1.1, true);
  sing(g, t, L, {
    rows: [{ text: 'I want you', y: 330, size: 120, rot: -.03 }, { text: 'to love it', y: 490, size: 150, rot: .02 }],
    style: 'sticker', maxW: 900, o: { shade: { col: C.red, dx: .06, dy: .07 } },
    emph: { love: { col: C.yellow }, it: { col: C.yellow } },
  });
  if (back) sing(g, t, back, { back: true, rows: [{ text: '(love it)', y: 612, x: 800, size: 70, rot: .08 }], style: 'marker', paper: { chip: true, cols: [C.cream], pad: .2 } });
  sing(g, t, lineNear(o.prove ?? L + 1.9, false), {
    rows: [{ text: 'so give me something', y: 760, size: 92, rot: -.015 }, { text: 'I can prove!', y: 900, size: 136, rot: .02, maxW: 700 }],
    style: 'sticker', maxW: 920, o: { shade: { col: C.ink, dx: .06, dy: .07 } },
    emph: { prove: { col: C.mint } },
  });
}
function heartPath(g, x, y, s) {
  g.moveTo(x, y + s * .9);
  g.bezierCurveTo(x - s * 1.4, y - s * .1, x - s * .7, y - s * 1.1, x, y - s * .45);
  g.bezierCurveTo(x + s * .7, y - s * 1.1, x + s * 1.4, y - s * .1, x, y + s * .9);
  g.closePath();
}

// ---------------------------------------------------------------- the solo, and the hook again
export function soloShot(g, t, c, who = 'elder', o = {}) {
  const K = c.K;
  sunburst(g, 540, 1150, 2400, 14, o.c1 || C.yellow, shade(o.c1 || C.yellow, .14), t * .3);
  const hit = Math.pow(1 - (K.beatPos(t) % 1), 3);
  speedLines(g, 540, 1150, 620 + hit * 60, 1400, 30, 3, C.ink, 6);
  play(g, t, K, who, 540, 1700, { s: 640, energy: 1.4, eyes: 'closed', lean: Math.sin(t * 4) * .08 });
  // Lightning off the strings on every beat.
  if (hit > .4) for (let k = 0; k < 3; k++) doodle(g, 'bolt', 300 + k * 250, 700 + (k % 2) * 90, 70 + hit * 30, { fill: k % 2 ? C.pink : C.cream, rot: (k - 1) * .4, w: 4 });
}

export function hookAgain(g, t, c, o = {}) {
  const K = c.K;
  garage(g, t, { night: 1 });
  bandInGarage(g, t, c);
  sing(g, t, o.line, {
    rows: [{ text: 'So give me', y: 500, size: 110, rot: -.03 }, { text: 'something', y: 660, size: 124, rot: .02 }, { text: 'I can prove!', y: 860, size: 160, rot: -.02 }],
    style: 'sticker', maxW: 860, o: { shade: { col: C.pink, dx: .06, dy: .07 } }, emph: { prove: { col: C.yellow } },
  });
}
