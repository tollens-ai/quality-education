// Intro, 0-14 s. A whispered dedication in a single spot; then the riff, which is almost atonal
// and nearly math rock (Qing, 2026-09-28: "this really bold, wow, and astonishing virtuosic guitar
// riff"), plays the mirror: the frame becomes a six-fold kaleidoscope that ticks round one step
// on every note, flashing, while each member is introduced on his bar the way a J-rock band is
// in an anime opening. The title lands on the drums, and the glass it's printed on shatters to
// show the stage: four Clawds facing a wall of mirror.
import { C, W, H, TAU, clamp, lerp, easeOut, easeIn, backOut, hit, last, A, lastIndex, eventsIn, rgba, noise, env, mix, hash } from '../kit.js';
import { clawd } from '../clawd.js';
import { gpen, P, ink, focusLines } from '../pen.js';
import { fill, cone, floor, layer, put, strobe, impact, kaleido, burst } from '../world.js';
import { shatter, pane, crack } from '../glass.js';
import { shot, overlay, camera } from '../shots.js';
import { words, sing, rows, STYLE } from '../lyric.js';
import { text, measure } from '../type.js';
import { regex, nullBass, cron, singer, riffNote } from '../playing.js';
import { micStand } from '../gear.js';
import { stageWide } from './stage.js';
import { BRIEFS } from '../places.js';

const BARS = [2.345, 4.18, 5.921, 7.686, 9.451, 11.215, 12.98, 14.745];

// The kaleidoscope's turn: one tick per riff note, each tick eased over 70 ms.
function ticks(t) {
  const L = A.ev.riff;
  const i = lastIndex(L, t);
  if (i < 0) return 0;
  return i + easeOut((t - L[i]) / .07, 3);
}

// The riff as string art: each note is a point on a circle of the twelve notes (its pitch class
// sets the angle, its octave the radius), and a line joins it to the note before. The newest lines
// are bone and heavy, older ones red, then gone: the last sixteen notes, drawn as geometry. Laid
// round six mirrors, the riff becomes a mandala that redraws itself on every note.
export function stringArt(g, t, cx, cy, o = {}) {
  const L = A.ev.riff, i = lastIndex(L, t);
  if (i < 1) return;
  const pt = m => {
    const a = ((m % 12) / 12) * TAU - Math.PI / 2 + (o.rot || 0);
    const r = (o.r ?? 520) * (.55 + .12 * (Math.floor(m / 12) - 4));
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const n = o.n ?? 16;
  for (let j = Math.max(1, i - n); j <= i; j++) {
    const age = i - j, a = pt(A.riff[j - 1][1]), b = pt(A.riff[j][1]);
    const fresh = j === i ? easeOut(clamp((t - L[j]) / .06)) : 1;
    const bx = lerp(a[0], b[0], fresh), by = lerp(a[1], b[1], fresh);
    const col = age === 0 ? C.bone : age < 4 ? C.red : age < 10 ? C.red2 : C.red3;
    gpen(g, [a, [bx, by]], (o.w ?? 16) * (1 - age / (n + 2)), { col, taper: [.05, .2], wobble: .4, t, seed: j });
    if (age < 6) { g.fillStyle = col; g.beginPath(); g.arc(b[0], b[1], (o.w ?? 16) * .9 * (1 - age / 8), 0, TAU); g.fill(); }
  }
}

// The riff as stained glass: each run of three notes is a triangle of coloured glass (its colour
// from the newest note's pitch), leaded in heavy ink; the newest pane flares. Turned round the
// mirrors, it's a rose window that re-leads itself on every note.
export function roseWindow(g, t, cx, cy, cols, o = {}) {
  stainedGlass(g, t, cx, cy, cols, { ...o, r: o.r ?? 820, n: 20 });
  stainedGlass(g, t, cx, cy, [...cols].reverse(), { ...o, r: (o.r ?? 820) * .46, n: 12, rot: -(o.rot || 0) * 1.7 + .5, w: 16 });
  stringArt(g, t, cx, cy, { r: (o.r ?? 820) * .7, w: 9, rot: (o.rot || 0) * 1.3, n: 8 });
}
export function stainedGlass(g, t, cx, cy, cols, o = {}) {
  const L = A.ev.riff, i = lastIndex(L, t);
  if (i < 2) return;
  const pt = m => {
    const a = ((m % 12) / 12) * TAU - Math.PI / 2 + (o.rot || 0);
    const r = (o.r ?? 700) * (.5 + .13 * (Math.floor(m / 12) - 4));
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const n = o.n ?? 14;
  for (let j = Math.max(2, i - n); j <= i; j++) {
    const age = i - j;
    const tri = [pt(A.riff[j - 2][1]), pt(A.riff[j - 1][1]), pt(A.riff[j][1])];
    const fresh = j === i ? clamp((t - L[j]) / .05) : 1;
    const col = cols[A.riff[j][1] % cols.length];
    g.save();
    g.globalAlpha = (1 - age / (n + 1)) * (.55 + .45 * fresh);
    g.fillStyle = age === 0 && fresh < 1 ? C.bone : col;
    g.beginPath(); g.moveTo(...tri[0]); g.lineTo(...tri[1]); g.lineTo(...tri[2]); g.closePath(); g.fill();
    g.restore();
    // The lead between the panes.
    gpen(g, [...tri, tri[0]], (o.w ?? 22) * (1 - age / (n + 3)), { col: C.ink, taper: [.02, .02], wobble: .4, t, seed: j, corner: .3 });
  }
}

// What each member's bar is made of, drawn round (540, 960) for the kaleidoscope.
//   REGEX: the riff as string art.  CRON: drum heads rippling out on every hit.
//   NULL: the riff again, cold, over falling strands of white hair.  CLAWD: his own eyes.
function motif(g, who, t, a, acc) {
  if (who === 'regex') {
    roseWindow(g, t, 540, 960, [C.red, C.red2, C.bone, C.red3, C.clawd, C.red], { rot: (t - a) * .2 });
  } else if (who === 'cron') {
    roseWindow(g, t, 540, 960, ['#b7a36a', C.red2, C.ink3, '#8a7a45', C.red, C.bone3], { rot: (t - a) * .3 });
    for (const kind of ['kick', 'snare', 'crash']) {
      for (const h of eventsIn(kind, t - .9, t + .001)) {
        const age = t - h, r = 60 + age * (kind === 'crash' ? 1400 : 900);
        g.strokeStyle = kind === 'crash' ? rgba('#b7a36a', 1 - age / .9) : kind === 'snare' ? rgba(C.bone, 1 - age / .9) : rgba(C.red, 1 - age / .9);
        g.lineWidth = (kind === 'kick' ? 26 : 14) * (1 - age / .9);
        g.beginPath(); g.ellipse(540, 960, r, r * .8, 0, 0, TAU); g.stroke();
      }
    }
    stringArt(g, t, 540, 960, { r: 420, w: 10, rot: (t - a) * .3, n: 8 });
  } else if (who === 'null') {
    for (let k = 0; k < 14; k++) {
      const x = 380 + k * 34 + Math.sin(t * .8 + k) * 12;
      gpen(g, [[x, 520], [x + Math.sin(t + k) * 20, 1500]], 6, { col: rgba(C.bone, .45), taper: [.1, .6], t, seed: k });
    }
    roseWindow(g, t, 540, 960, [C.glass, C.glass2, C.bone, C.steel, C.glass3, C.bone2], { rot: -(t - a) * .15 });
  } else {
    // CLAWD's own eyes, blinking on the beat: what the mirrors show him, over and over.
    g.fillStyle = C.clawd; g.beginPath(); g.moveTo(540, 960); g.arc(540, 960, 900, -.6, .6); g.closePath(); g.fill();
    const blink = hit('snare', t, .08);
    const eh = 230 * (1 - blink * .85);
    g.fillStyle = C.ink; g.fillRect(760, 960 - eh / 2 - 40, 110, eh);
    g.beginPath(); g.moveTo(870, 960 - eh / 2 - 30); g.lineTo(1000, 960 - eh / 2 - 110); g.lineTo(870, 960 - eh / 2 + 10); g.fill();
    g.fillStyle = C.red2; g.fillRect(730, 960 - 150, 200, 26);
    if (eh > 60) { g.fillStyle = C.bone; g.fillRect(780, 960 - eh / 2 - 20, 34, 34); }
    roseWindow(g, t, 540, 960, [C.clawd, C.clawd2, C.red, C.ink3, C.clawd3, C.red2], { rot: (t - a) * .2 });
  }
}

// A member's name, the J-rock way: the part in italics, the name in black capitals.
function nameCard(g, t, t0, part, name, col, built) {
  const p = clamp((t - (t0 - .1)) / .1);
  if (p <= 0) return;
  const dx = (1 - easeIn(p, 2)) * -500;
  g.save(); g.translate(dx, 0);
  g.fillStyle = C.ink; g.fillRect(40, 180, 700, 410);
  g.fillStyle = col; g.fillRect(40, 180, 18, 410);
  text(g, part, 90, 280, 88, 'xital', { fill: col, ctx: { deco: true } });
  text(g, name, 84, 480, 230, 'black', { fill: C.bone, shadow: { dx: 10, dy: 10, col: col }, ctx: { deco: true } });
  if (built) text(g, built, 90, 556, 38, 'mono', { fill: C.bone2, ctx: { deco: true } });
  g.restore();
}

export function register(S) {
  const D = words('Intro', 'This one');
  const riff0 = A.ev.riff[0] ?? 2.27;

  // ---------------------------------------------------------------- the dedication
  shot(0, riff0, (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.0, y: 1040 }, { z: 1.14, y: 1120 }, { hand: 1.6 });
    const on = .6 + .4 * easeOut(clamp(t / .3));
    cone(g, 540, 300, Math.sin(t * 1.3) * .05, .55, 1350, C.bone, .07 * on * (1 + .15 * Math.sin(t * 9)), 3);
    floor(g, 1520, { light: C.bone, streaks: 2, seed: 2 });
    micStand(g, 540, 1520, 430, { t, flow: noise(t, 3) * .5 });
    clawd(g, 540, 1520, { who: 'clawd', s: 300, t, rim: C.bone, eyes: 'shut', mouth: clamp(env('vocal', t) * 1.4) * .5, light: { x: 0, y: -1 }, silhouette: 1 - on * .9 });
    g.restore();
  });
  // Spoken softly, so lettered softly: small italics, breathed onto the dark. They linger into
  // the first notes of the riff before they go.
  overlay(0, riff0 + .6, (g, t) => {
    rows(g, t, D, { y: 600, face: 'ital', rows: [
      { w: [0, 1, 2, 3], size: 86, caps: false, style: { fill: C.bone } },
      { w: [4, 5, 6, 7, 8, 9], size: 86, caps: false, style: { fill: C.bone } },
    ] }, { enter: 'fog', lead: .16, out: riff0 + .25, exit: 'fade', exitLen: .3 });
  });

  // ---------------------------------------------------------------- the riff: the kaleidoscope
  const member = (who, a, b, part, name, col, built) => shot(a, b, (g, t, S, sh) => {
    fill(g, C.ink);
    const n = riffNote(t);
    const acc = n ? Math.exp(-n.age / .08) * clamp(n.st) : 0;
    // The source: each member's own motif, which the mirrors turn into a mandala.
    const L = layer(g, 'ksrc');
    L.fillStyle = (n && n.i % 8 === 0 && n.age < .06) ? C.red3 : C.ink; L.fillRect(0, 0, W, H);
    motif(L, who, t, a, acc);
    // Mirrors round the tube, turning one tick a note; a strong note doubles them for its length.
    const tk = ticks(t);
    const strong = n && n.st > .75 && n.age < .11;
    const zoom = lerp(.95, 1.15, (t - a) / (b - a)) * (1 + acc * .08);
    kaleido(g, L, 540, 960, strong ? 12 : 6, tk * TAU / 24 + (t - a) * .05, 540, 960, { zoom, seams: rgba(C.bone, .2 + acc * .5) });
    // The medallion in the middle of the rose window shows the member himself, unreflected.
    g.save();
    const R = 300 * (1 + acc * .03);
    g.beginPath(); g.arc(540, 1000, R, 0, TAU); g.closePath();
    g.fillStyle = C.ink; g.fill();
    g.save(); g.clip();
    if (who === 'regex') regex(g, 560, 1330, 300, t, { rim: C.red });
    if (who === 'cron') cron(g, 540, 1300, 200, t, { rim: C.red });
    if (who === 'null') nullBass(g, 520, 1350, 300, t, { rim: C.glass });
    if (who === 'clawd') singer(g, 540, 1340, 300, t, { rim: C.red, mouth: .1 + acc * .5, eyes: 'fierce' });
    g.restore();
    g.lineWidth = 26; g.strokeStyle = C.ink; g.stroke();
    g.lineWidth = 8; g.strokeStyle = mix(C.steel, C.bone, acc); g.stroke();
    g.restore();
    nameCard(g, t, who === 'regex' ? a + .5 : a, part, name, col, built);
    // Crash cymbals: a white impact.
    strobe(g, hit('crash', t, .06) * .7);
    if (t - last('crash', t) < .034) impact(g);
  });
  member('regex', riff0, BARS[2], 'Gt.', 'REGEX', C.red, BRIEFS[0].built);
  member('cron', BARS[2], BARS[3], 'Dr.', 'CRON', C.red, BRIEFS[1].built);
  member('null', BARS[3], BARS[4], 'Ba.', 'NULL', C.glass, BRIEFS[2].built);
  member('clawd', BARS[4], BARS[5], 'Vo.', 'CLAWD', C.red, BRIEFS[3].built);

  // ---------------------------------------------------------------- the title
  const beat = (BARS[6] - BARS[5]) / 4;
  const T = [BARS[5], BARS[5] + beat, BARS[5] + beat * 1.5, BARS[5] + beat * 2, BARS[5] + beat * 3];
  const titleCard = (g, t) => {
    fill(g, C.ink);
    const slam = (t0, str, x, y, size, col, align) => {
      const p = clamp((t - (t0 - .08)) / .08);
      if (p <= 0) return;
      const s = lerp(1.5, 1, easeIn(p, 2));
      g.save(); g.translate(x, y); g.scale(s, s);
      text(g, str, 0, 0, size, 'black', { align, fill: col, shadow: { dx: 0, dy: 12, col: col === C.red ? C.red3 : C.ink2 }, ctx: { deco: true } });
      g.restore();
    };
    slam(T[0], 'HOW', 70, 560, 400, C.bone, 'left');
    slam(T[1], 'WILL', 1010, 800, 250, C.bone, 'right');
    slam(T[2], 'I', 1010, 1030, 250, C.bone, 'right');
    slam(T[3], 'KNOW', 60, 1300, 400, C.red, 'left');
    const q = clamp((t - (T[4] - .08)) / .1);
    if (q > 0) {
      g.save(); g.globalAlpha = q;
      text(g, 'Looking Glass', 70, 1440, 100, 'goth', { fill: C.bone, ctx: { deco: true } });
      text(g, '第二話', 1010, 1440, 96, 'jp', { align: 'right', fill: C.red, ctx: { deco: true } });
      text(g, 'SOFTWARE QUALITY THEORY 101 · EPISODE 2', 72, 1505, 34, 'mono', { fill: C.bone3, ctx: { deco: true } });
      g.restore();
    }
  };
  shot(BARS[5], BARS[6], (g, t) => {
    titleCard(g, t);
    strobe(g, hit('crash', t, .05) * .5);
    if (t - last('crash', t) < .034) impact(g);
  });
  // The title's glass shatters, and behind it is the stage.
  shot(BARS[6], 13.95, (g, t, S, sh) => {
    const q = clamp((t - BARS[6]) / .9);
    stageWide(g, t, { push: q });
    const T0 = layer(g, 'title');
    titleCard(T0, BARS[6] + 1);
    shatter(g, 77, [0, 0, W, H], 540, 900, q, (g2) => { g2.drawImage(T0.canvas, 0, 0, W, H); }, { n: 14, rings: 5, force: 1.1 });
  });
}
