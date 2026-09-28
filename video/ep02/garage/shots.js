// The shot list. Each shot: t (start), draw(g, t, c). Optional: push [from, to] (a slow zoom over
// the shot), pushAt, wipe or xfade (seconds of transition in), flash (time of a paper flash),
// mark (corner-mark colour), breathe (how much the camera pulses with the kick).
import { C, smooth } from './kit.js';
import { lineNear } from './lyrics.js';
import * as CH from './scenes/chorus.js';
import * as IN from './scenes/intro.js';
import * as V1 from './scenes/verse1.js';
import * as PC from './scenes/pre.js';
import * as V2 from './scenes/verse2.js';
import * as BR from './scenes/bridge.js';
import * as FI from './scenes/finale.js';

export const SHOTS = [
  // Intro: the dedication in the dark; the band slams in; one player a bar; the title.
  { t: 0, draw: IN.dedication, push: [1.04, 1] },
  { t: 2.345, draw: IN.slamIn, flash: 2.345, flashA: .6, push: [1.08, 1], pushAt: [540, 1480] },
  { t: 4.18, draw: (g, t, c) => IN.closeUp(g, t, c, 'bad', { c1: C.teal, tag: 'THE BAD BOY' }) },
  { t: 5.05, draw: (g, t, c) => IN.closeUp(g, t, c, 'elder', { c1: C.yellow, tag: 'THE OLDER ONE', spin: -1, tr: .07 }) },
  { t: 5.92, draw: (g, t, c) => IN.closeUp(g, t, c, 'builder', { c1: C.sky, tag: 'THE BUILDER' }) },
  { t: 6.8, draw: (g, t, c) => IN.closeUp(g, t, c, 'soft', { c1: C.lilac, tag: 'THE SENSITIVE ONE', spin: -1, tr: .06 }) },
  { t: 7.69, draw: (g, t, c) => IN.closeUp(g, t, c, 'lead', { c1: C.pink, tag: 'THE HEART-THROB', eyes: 'happy' }) },
  { t: 9.45, draw: IN.titleCard, flash: 9.45, flashA: .5 },
  // Verse 1: one long zine page, a panel a line.
  { t: 12.98, draw: V1.verse1, flash: 12.98, flashA: .4 },
  // Pre-chorus 1: the notes under the door; hoping; the band's echoes.
  { t: 28.36, draw: PC.brokenNotes, push: [1, 1.05], pushAt: [540, 1300] },
  { t: 32.2, draw: (g, t, c) => PC.hoping(g, t, c, { echo: 31.8 }), push: [1.03, 1] },
  { t: 35.45, draw: PC.harmony },
  // Chorus 1.
  { t: 38.9, draw: (g, t, c) => CH.hookShot(g, t, c, { line: 38.96 }), flash: 38.9, flashA: .5 },
  { t: 42.44, draw: (g, t, c) => CH.checksShot(g, t, c, { line: 42.48 }) },
  { t: 46.07, draw: (g, t, c) => CH.guideShot(g, t, c, { line: 45.68 }) },
  { t: 49.6, draw: (g, t, c) => CH.loveShot(g, t, c, { line: 49.20 }), flash: 49.6, flashA: .35 },
  // The solo, then the hook again with everyone.
  { t: 54.0, draw: (g, t, c) => CH.soloShot(g, t, c, 'elder'), flash: 54.0, flashA: .4 },
  { t: 55.75, draw: (g, t, c) => CH.soloShot(g, t, c, 'bad', { c1: C.teal }) },
  { t: 57.5, draw: (g, t, c) => CH.hookAgain(g, t, c, { line: 57.70 }), push: [1.15, 1.05], pushAt: [540, 1300] },
  // Verse 2: the answers, built in the garage.
  { t: 61.05, draw: (g, t, c) => V2.loadShot(g, t, c, { line: 60.62 }), flash: 61.05, flashA: .3 },
  { t: 63.67, draw: (g, t, c) => V2.granShot(g, t, c, { line: 64.00, act: 65.1 }) },
  { t: 67.2, draw: (g, t, c) => V2.isolationShot(g, t, c, { line: 67.44 }) },
  { t: 70.73, draw: (g, t, c) => V2.daveSueShot(g, t, c, { line: 70.34 }) },
  // Pre-chorus 2: the same complaint, the lights up a little.
  { t: 74.25, draw: (g, t, c) => PC.brokenNotes(g, t, c, { line: 73.96, echo: 77.6, lights: .8, seed: 3 }), push: [1.06, 1], pushAt: [540, 1300] },
  { t: 77.75, draw: (g, t, c) => PC.hoping(g, t, c, { line: 77.84, echo: 77.6, lights: .8, gap: 6 }), push: [1, 1.04] },
  { t: 81.3, draw: (g, t, c) => PC.harmony(g, t, c, { c1: C.teal, lines: [lineNear(81.0, true), lineNear(82.6, true)] }) },
  // Chorus 2.
  { t: 84.3, draw: (g, t, c) => CH.hookShot(g, t, c, { line: 84.48 }), flash: 84.3, flashA: .5, push: [1.08, 1] },
  { t: 88.35, draw: (g, t, c) => CH.checksShot(g, t, c, { line: 88.32, icons: true }) },
  { t: 91.95, draw: (g, t, c) => CH.guideShot(g, t, c, { line: 91.50, c1: C.orange, half: true }) },
  { t: 95.4, draw: (g, t, c) => CH.loveShot(g, t, c, { line: 95.00, c1: C.teal }), flash: 95.4, flashA: .35 },
  // The drum break.
  { t: 99.9, draw: (g, t, c) => CH.soloShot(g, t, c, 'bad', { c1: C.red }), flash: 99.9, flashA: .4 },
  // Bridge: what an oracle is.
  { t: 102.3, draw: (g, t, c) => BR.oracleShot(g, t, c, { line: 102.40 }), push: [1, 1.05], pushAt: [540, 1200] },
  { t: 105.95, draw: (g, t, c) => BR.rulesShot(g, t, c, { line: 105.64 }) },
  { t: 109.6, draw: (g, t, c) => BR.heuristicsShot(g, t, c, { line: 109.60 }) },
  { t: 113.1, draw: (g, t, c) => BR.doneShot(g, t, c, { line: 113.10 }) },
  // Pre-chorus 3: light under the door, and it starts to lift.
  { t: 116.52, draw: (g, t, c) => PC.brokenNotes(g, t, c, { line: 116.78, echo: 119.9, lights: 1, seed: 5, door: .04 + .03 * smooth((t - 116.5) / 3), behind: (g2, t2) => FI.driveway(g2, t2, c) }), push: [1.06, 1], pushAt: [540, 1300] },
  { t: 120.49, draw: (g, t, c) => PC.hoping(g, t, c, { line: 120.30, lights: 1, gap: 18, door: .08 + .04 * smooth((t - 120.5) / 3), behind: (g2, t2) => FI.driveway(g2, t2, c) }), push: [1, 1.04] },
  { t: 124.46, draw: (g, t, c) => PC.harmony(g, t, c, { c1: C.orange, lines: [lineNear(125.4, true)] }) },
  // Chorus 3: the door goes up. The people it was all for are right there.
  { t: 126.95, draw: (g, t, c) => FI.revealShot(g, t, c, { line: 127.04, up: 126.95 }), flash: 127.1, flashA: .6 },
  { t: 130.61, draw: (g, t, c) => FI.grannyShot(g, t, c, { line: 130.56 }), mark: C.ink },
  { t: 134.14, draw: (g, t, c) => FI.guideFull(g, t, c, { line: 133.78 }), mark: C.ink },
  { t: 137.67, draw: (g, t, c) => CH.loveShot(g, t, c, { line: 137.26, c1: C.red }), flash: 137.67, flashA: .4 },
  // Outro: the report, the question, the answers.
  { t: 142.06, draw: (g, t, c) => FI.reportShot(g, t, c, { line: 141.68, line2: 145.22 }), mark: C.ink },
  { t: 150.7, draw: (g, t, c) => FI.askShot(g, t, c, { line: 150.84 }), mark: C.ink },
  { t: 153.2, draw: FI.loveItGrid },
  { t: 158.2, draw: (g, t, c) => FI.daveComingShot(g, t, c, { back: lineNear(158.3, true) }), mark: C.ink },
  { t: 160.3, draw: FI.endCard, flash: 160.3, flashA: .4 },
];

// How hard everything dances, section by section: [from, energy].
export const ENERGY = [[0, .3], [2.3, .8], [13.4, .7], [28.5, .5], [38.9, 1], [53.6, .9], [60.6, .8], [73.9, .55], [84.4, 1.05],
  [99.5, .9], [102.4, .4], [116.1, .55], [127, 1.15], [141.7, .7], [160, .9], [172, .3]];
