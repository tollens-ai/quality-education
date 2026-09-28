// The chorus, three times: "How do I know, how can you show, what perfect means to you? / All of
// my checks, all of my tests, don't find the bugs you do / Give me a guide, something to try, to
// make your dreams come true! / I want you to love it (love it), so give me something I can prove!"
//
// The song explodes, so the picture does: the pictures cut on the phrases while each sung line
// builds as one block of title-card type across the cuts (so every word stays up long enough to
// read), and every snare fires a strobe on your side of the glass, so for a flash you, and the
// band, can see through it. The band's checks stamp their own reflection 合格, passed; the strobe
// shows what's really on your side: moths, bugs, all over the glass. On "prove!" CLAWD's fist hits
// the mirror. Each chorus lets more light through, since verse 2 switched the oracles on: in the
// second the glass is half a window and the checks are the four briefs; in the third the people
// are right there, answering, and on "prove!" it shatters.
import { C, W, H, clamp, lerp, easeOut, easeIn, env, hit, last, noise, rgba, hash, mix } from '../kit.js';
import { clawd } from '../clawd.js';
import { fill, layer, put, strobe, impact, cone, floor, burst } from '../world.js';
import { pane, crack, reflected, mirrorEdge } from '../glass.js';
import { shot, overlay, camera } from '../shots.js';
import { words, sing, rows, echo, STYLE } from '../lyric.js';
import { kickback, text } from '../type.js';
import { singer, regex, nullBass, cron, groove } from '../playing.js';
import { bandFront, crowdBacks, stageWide } from './stage.js';
import { farCrowd } from './pre.js';
import { swarm, hanko, tick } from '../bugs.js';
import { person, stranger, rimmed } from '../people.js';
import { CAST, BRIEFS, deco } from '../places.js';
import { P, ink } from '../pen.js';

const live = (tt, w) => kickback(tt, w.v, 6, .08);
// Strobe on your side: how bright it is there now (snares fire it).
const strobeAt = t => hit('snare', t, .06);
const LIP = { fill: C.red, shadow: { dx: 0, dy: 6, col: C.ink }, outlineK: .04 };

export const HOOK = {};
export function chorus(k, S) {
  const sec = 'Chorus ' + k;
  const L1 = words(sec, 'How do I'), L2 = words(sec, 'All of my'), L3 = words(sec, 'Give me a'), L4 = words(sec, 'I want you');
  const E = words(sec, 'love it'), L5 = words(sec, 'so give me');
  const ends = { 1: 53.9, 2: 99.6, 3: 141.86 };
  const light = { 1: 0, 2: .35, 3: .8 }[k];   // how lit your side is between strobes
  const t0 = L1[0].v - .45;
  const cut = [t0, L1[4].v - .06, L1[8].v - .08, L2[0].v - .12, L2[8].v - .06, L3[0].v - .12, L4[0].v - .12, ends[k]];

  // ================================================================ the pictures
  // "How do I know,": the band at full tilt, from the dark.
  shot(cut[0], cut[1], (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.08 }, { z: 1.0 }, { shake: 10 });
    if (k === 1) {
      bandFront(g, t, { dim: .35, floor: 1650 });
      crowdBacks(g, t, { up: strobeAt(t), rim: mix(C.red, C.bone, strobeAt(t)) });
    } else if (k === 2) {
      // From behind the band: the lamps have made the glass half a window.
      const s2 = Math.max(strobeAt(t), light);
      g.translate(0, 300);
      stageWide(g, t, { lit: [s2, s2 * .8, s2], far: (F, i, x0, x1) => farCrowd(F, t, i, x0, x1) });
    } else {
      // Your side, lit: the people pressed to the glass, the band playing beyond it.
      bandFront(g, t, { dim: .55, floor: 1650 });
      [['rosa', 190, -.3], ['gran', 540, 0], ['jess', 890, .3]].forEach(([w, x, turn]) =>
        person(g, x, 2950, 1500, CAST[w], { expr: 'smile', armL: 'press', armR: 'press', turn, rim: C.bone }, t));
    }
    g.restore();
    strobe(g, strobeAt(t) * .3);
    if (t - last('crash', t) < .034) impact(g);
  });

  // "how can you show,": a close-up, a different member each time.
  shot(cut[1], cut[2], (g, t, S, sh) => {
    fill(g, k === 2 ? C.glass3 : C.red3);
    burst(g, 540, 1300, 20, k === 2 ? C.glass3 : C.red3, C.ink, t * .08);
    g.save();
    camera(g, t, sh, { z: 1.0, y: 1150 }, { z: 1.08, y: 1130 }, { shake: 8 });
    if (k === 1) singer(g, 540, 2250, 900, t, { rim: C.red, light: { x: -.4, y: -.9 }, look: [0, -.2] });
    else if (k === 2) regex(g, 600, 2350, 1000, t, { rim: C.red });
    else {
      // CLAWD and Rosa, face to face through the glass.
      g.fillStyle = '#3a3f47'; g.fillRect(540, 800, 540, 1300);
      singer(g, 270, 2250, 760, t, { rim: C.red, look: [.8, -.1], mic: false });
      person(g, 820, 3350, 2000, CAST.rosa, { expr: 'smile', armL: 'press', armR: 'down', turn: -.5, rim: C.bone }, t);
      g.fillStyle = C.steel2; g.fillRect(532, 800, 16, 1300);
    }
    g.restore();
    strobe(g, strobeAt(t) * .3);
  });

  // "what perfect means to you?": in the mirror; in the last, from your side.
  shot(cut[2], cut[3], (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.0 }, { z: 1.05 }, { shake: 6 });
    g.fillStyle = k === 3 ? '#343a41' : C.glass3; g.fillRect(0, 0, W, H);
    cone(g, 540, 0, 0, .8, 1900, k === 3 ? C.bone : C.glass, .06);
    if (k === 1) clawd(g, 540, 2000, { who: 'clawd', s: 700, t, rim: C.glass, eyes: 'narrow', light: { x: .3, y: -.9 } });
    else if (k === 2) clawd(g, 540, 2000, { who: 'null', s: 700, t, rim: C.glass, eyes: 'narrow', light: { x: .3, y: -.9 } });
    // Jess writes the word on the glass from her side: she's answering.
    else person(g, 560, 3550, 2300, CAST.jess, { expr: 'smile', armL: 'down', armR: 'press', rim: C.bone }, t);
    pane(g, 0, 0, W, H, { a: .07, n: 4, seed: 71 + k });
    g.restore();
  });

  // "All of my checks, all of my tests,": everything passes, in the band's own eyes.
  shot(cut[3], cut[4], (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.0 }, { z: 1.06 });
    g.fillStyle = C.glass3; g.fillRect(0, 0, W, H);
    if (k === 1) {
      const R = layer(g, 'reflband');
      bandFront(R, t, { dim: 0, floor: 1700 });
      put(g, R, { tint: { col: C.glass, a: .18 } });
      // Stamps land on the reflection with each word.
      const marks = [[L2[3], 250, 1420, 1], [L2[7], 800, 1380, 2], [L2[2], 560, 1150, 3], [L2[6], 870, 1640, 4], [L2[1], 200, 1660, 5]];
      for (const [w, x, y, i] of marks) {
        const p = clamp((t - (w.v - .06)) / .1);
        if (i % 2) hanko(g, x, y, 120, p, { rot: -.2 + i * .07 });
        else tick(g, x, y, 170, p * 1.4, C.red, t);
      }
    } else {
      // The four briefs, each stamped passed by its own check.
      BRIEFS.forEach((b, i) => {
        const y = 1010 + i * 215;
        ink(g, P().rect(60, y, 960, 190), { fill: C.ink2, line: 5, seed: 150 + i, t });
        text(g, `${b.n}/4`, 100, y + 120, 80, 'black', { fill: C.bone, ctx: deco });
        text(g, b.app, 260, y + 88, 48, 'mono', { fill: C.bone, ctx: deco });
        text(g, 'by ' + b.name, 260, y + 142, 40, 'mono', { fill: C.bone3, ctx: deco });
        const w = [L2[1], L2[3], L2[5], L2[7]][i];
        hanko(g, 890, y + 95, 78, clamp((t - (w.v - .06)) / .1), { rot: -.2 + i * .1 });
      });
    }
    pane(g, 0, 0, W, H, { a: .06, n: 3, seed: 81 + k });
    g.restore();
  });

  // "don't find the bugs you do": the strobe shows your side, a flash at a time. Moths on it.
  shot(cut[4], cut[5], (g, t, S, sh) => {
    fill(g, C.ink);
    const s = Math.max(strobeAt(t), light);
    g.save();
    camera(g, t, sh, { z: 1.0 }, { z: 1.1 }, { shake: 10 });
    const F = layer(g, 'strobe');
    F.fillStyle = mix(C.ink2, '#3a3f47', s); F.fillRect(0, 0, W, H);
    [['mum', 250, 2350, 1300, -.3], ['dad', 800, 2400, 1350, .3]].forEach(([who, x, y, h, turn]) => {
      person(F, x, y, h, CAST[who], { armL: 'press', armR: 'press', expr: 'shock', turn, rim: C.bone }, t);
    });
    rimmed(F, 'bugcrowd', C.bone, L => { for (let i = 0; i < 5; i++) stranger(L, 80 + i * 230, 2150, 1100, 700 + i, { t, silhouette: 1 }); });
    swarm(F, t, 16, 60, 250, 960, 1500, { min: 80, max: 180, seed: 3 * k });
    put(g, F, { alpha: .15 + .85 * s });
    // When the strobe dies, the mirror comes back.
    const R = layer(g, 'reflband');
    bandFront(R, t, { floor: 1700 });
    put(g, R, { alpha: (1 - s) * .8, tint: { col: C.glass, a: .2 } });
    pane(g, 0, 0, W, H, { a: .06, n: 3, seed: 91 + k });
    g.restore();
    strobe(g, strobeAt(t) * .2);
  });

  // "Give me a guide, something to try, to make your dreams come true!"
  shot(cut[5], cut[6], (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.0, y: 1000 }, { z: 1.1, y: 1040 }, { shake: 6 });
    cone(g, 540, 0, 0, 1.2, 1900, C.red, .08);
    if (k === 1) {
      const L = layer(g, 'kneel');
      regex(L, 190, 1350, 260, t, { silhouette: .8, rim: C.red }); nullBass(L, 890, 1350, 260, t, { silhouette: .8, rim: C.red });
      put(g, L);
    }
    // Smoke: flat grey banks drifting low.
    for (let i = 0; i < 4; i++) {
      g.fillStyle = rgba(C.bone3, .12);
      const x = ((t * 40 + i * 300) % 1400) - 200;
      g.beginPath(); g.ellipse(x, 1500 + i * 30, 380, 90, 0, 0, Math.PI * 2); g.fill();
    }
    floor(g, 1600, { light: C.red, streaks: 4, seed: 14 });
    const m = clamp((env('vocal', t) - .2) * 1.5);
    if (k === 1) clawd(g, 540, 1820, { who: 'clawd', s: 520, t, rim: C.red, eyes: 'sad', tears: 1, mouth: m,
      look: [0, -.8], armL: { a: -1.2, len: 1.6 }, armR: { a: -1.2, len: 1.6 }, lift: -80 });
    // In the second, all four on their knees in a row, as only a visual-kei band would.
    else if (k === 2) ['regex', 'cron', 'null', 'clawd'].forEach((w, i) => clawd(g, 150 + i * 260, 1840, { who: w, s: 250, t, rim: C.red, eyes: 'sad', tears: .7,
      mouth: w === 'clawd' ? m : 0, look: [0, -.8], armL: { a: -1.2, len: 1.5 }, armR: { a: -1.2, len: 1.5 }, lift: -50, whip: Math.sin(t * 5 + i) * .2 }));
    // In the last, they reach for each other across the glass.
    else {
      g.fillStyle = '#3a3f47'; g.fillRect(540, 820, 540, 1200);
      clawd(g, 290, 1860, { who: 'clawd', s: 440, t, rim: C.red, eyes: 'wide', mouth: m, look: [.8, -.4], armR: { a: -.6, len: 2.1 } });
      person(g, 820, 2650, 1600, CAST.gran, { expr: 'smile', armL: 'press', armR: 'down', turn: -.4, rim: C.bone }, t);
      g.fillStyle = C.steel2; g.fillRect(532, 820, 16, 1200);
    }
    g.restore();
  });

  // The hook, held as one block, over CLAWD at the glass.
  HOOK[k] = shot(cut[6], cut[7], (g, t, S, sh) => {
    fill(g, C.ink);
    const hitT = L5[6].v;
    g.save();
    camera(g, t, sh, { z: 1.0 }, { z: 1.12 }, { shake: t > hitT ? 0 : 8 });
    if (t > hitT) { const e = Math.exp(-(t - hitT) / .12); g.translate(noise(t * 60, 1) * 30 * e, noise(t * 60, 2) * 30 * e); }
    g.fillStyle = C.red3; g.fillRect(0, 1040, 540, 880);
    g.fillStyle = C.glass3; g.fillRect(540, 1040, 540, 880);
    const fy = 1930;
    reflected(g, 540, 1, (g2, mir) => {
      const echoing = t >= E[0].v - .05 && t < E[1].v + .35;
      const punch = mir ? 0 : easeIn(clamp((t - (hitT - .25)) / .25), 2);
      if (mir && k === 3) {
        // The last time, there's no reflection: Jess is there, on the other side.
        g2.save(); g2.translate(1080, 0); g2.scale(-1, 1);
        g2.fillStyle = '#3a3f47'; g2.fillRect(540, 1040, 540, 900);
        person(g2, 800, 2900, 1900, CAST.jess, { expr: echoing ? 'love' : 'smile', armL: 'press', armR: 'down', turn: -.4, rim: C.bone }, t);
        g2.restore();
        return;
      }
      if (mir) g2.globalAlpha = { 1: 1, 2: .6, 3: 1 }[k];
      clawd(g2, 280, fy, { who: 'clawd', s: 440, t, rim: mir ? C.glass : C.red, eyes: mir ? 'narrow' : 'fierce',
        mouth: mir ? (echoing ? .7 : 0) : (echoing ? 0 : clamp((env('vocal', t) - .2) * 1.5)), look: [.8, 0],
        armR: { a: -.1, len: lerp(.9, 1.5, punch) }, tilt: .06 * punch, whip: groove(t, .7).whip * .5, lift: groove(t, .7).lift * .6 });
    });
    mirrorEdge(g, 540, 1040, 1920, { w: 16 });
    pane(g, 548, 1040, 532, 880, { a: .07, n: 2, seed: 101 + k });
    crack(g, 110 + k, 540, fy - 4.3 * 440 / 6, 420 + k * 80, (t - hitT) / .15, { n: 12, w: 4 });
    g.restore();
    if (t >= hitT && t < hitT + .067) impact(g);
    strobe(g, strobeAt(t) * .2);
  });

  // ================================================================ the words, line by line
  const hold = { enter: 'slam', lead: .1, live };
  overlay(L1[0].v - .12, cut[3], (g, t) => {
    rows(g, t, L1, { y: 70, face: 'black', rows: [
      { w: [0, 1, 2, 3], size: 170, style: STYLE.bone, dy: 170 },
      { w: [4, 5, 6, 7], size: 170, style: STYLE.bone, dy: 170 },
      { w: [8], size: 150, style: STYLE.bone, dy: 150, align: 'left', x: 90 },
    ] }, hold);
    // "perfect", in red lipstick, written on as it's sung.
    const perf = L1[9];
    const p = clamp((t - (perf.v - .22)) / .22);
    if (p > 0) {
      g.save();
      g.beginPath(); g.rect(40, 520, 60 + 940 * easeOut(p, 2), 330); g.clip();
      sing(g, t, perf, 110, 760, 300, 'lip', { enter: 'cut', lead: .02, caps: false, style: LIP });
      g.restore();
    }
    rows(g, t, L1, { y: 780, face: 'black', rows: [{ w: [10, 11, 12], size: 150, style: STYLE.bone, dy: 150 }] }, hold);
  });
  overlay(L2[0].v - .12, cut[5], (g, t) => {
    rows(g, t, L2, { y: 60, face: 'black', rows: [
      { w: [0, 1, 2, 3], size: 150, style: STYLE.bone, dy: 150 },
      { w: [4, 5, 6, 7], size: 150, style: STYLE.bone, dy: 150 },
      { w: [8, 9, 10], size: 130, style: STYLE.bone, dy: 140 },
      { w: [11], size: 330, style: STYLE.red, dy: 300 },
      { w: [12, 13], size: 150, style: STYLE.bone, dy: 150 },
    ] }, { ...hold, stress: [3, 7] });
  });
  overlay(L3[0].v - .12, L3[12].v + .64, (g, t) => {
    rows(g, t, L3, { y: 90, face: 'black', rows: [
      { w: [0, 1, 2, 3], size: 150, style: STYLE.bone, dy: 150 },
      { w: [4, 5, 6], size: 150, style: STYLE.bone, dy: 150 },
      { w: [7, 8, 9, 10], size: 150, style: STYLE.bone, dy: 150 },
    ] }, { ...hold, stress: [10], out: cut[6] });
    // The line's end stays a beat into the hook, below the hook's first words.
    rows(g, t, L3, { y: 540, face: 'black', rows: [{ w: [11, 12], size: 190, style: STYLE.bone, dy: 185 }] },
      { ...hold, out: L3[12].v + .56, exit: 'fade', exitLen: .08 });
  });
  overlay(L4[0].v - .12, cut[7], (g, t) => {
    rows(g, t, L4, { y: 60, face: 'black', rows: [
      { w: [0, 1, 2], size: 150, style: STYLE.bone, dy: 150 },
      { w: [3, 4, 5], size: 230, style: STYLE.bone, dy: 215 },
    ] }, { ...hold, stress: [4] });
    echo(g, t, E, 930, 540, 110, { align: 'right' });
    rows(g, t, L5, { y: 600, face: 'black', rows: [
      { w: [0, 1, 2, 3], size: 124, style: STYLE.bone, dy: 124, maxW: 870 },
      { w: [4, 5, 6], size: 250, style: STYLE.red, dy: 235, maxW: 860, align: 'left', x: 70 },
    ] }, hold);
  });
  // Chorus 2's "(ooh-ooh)"s, sung by the reflections, low on the left, clear of the lines.
  if (k === 2) [0, 1].forEach(i => {
    const ow = words(sec, 'ooh-ooh', i);
    overlay(ow[0].v - .14, ow[0].v + .9, (g, t) => echo(g, t, ow, 80, 1180, 110, { style: { fill: C.glass, shadow: { dx: 0, dy: 6, col: C.ink } } }));
  });
}

export function register(S) { chorus(1, S); chorus(2, S); chorus(3, S); }
