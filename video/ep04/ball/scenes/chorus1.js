// Chorus 1: the testing crew arrives in Clawd's workshop and tests the app he only checked.
//  "Did you actually test it?"  In they tumble; Guess's glass looms over a startled Clawd.
//  "Press it, stress it, second-guess it!"  Each on his word: Press presses the keys, Stress sits on
//     the app and shakes it (his gauge in the red), Guess cocks his brow over the notebook.
//  "Find a clue? Congratulations!"  Press counts 2 + 2 on his abacus: 4, not 5. Guess's antenna
//     springs into "!", a CLUE! rosette, confetti.
//  "Now pursue its implications."  They tiptoe along the trail of paste from the app to the check:
//     the same a+b+1 on both. A copy can't catch its own mistake.
//  "What did you try? What did you find? / What changed your mind?"  The notebook, written as it's
//     sung; then a lightbulb over Clawd, and Guess hands him a glass of his own.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, easeOut, backOut } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED, WHITE, WOOD } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { workshop } from '../places.js';
import { clawd, cane } from '../clawd.js';
import { guess, press, stress, check } from '../crew.js';
import { magnifier } from '../props.js';
import { register as app, tape } from '../props-v1.js';
import { notebook, abacus, rosette, bulb, trail } from '../props-crew.js';
import { shape, rrect, ellipse, stroke, dot } from '../ink.js';
import { label, DISPLAY, PATTER, SCRIPT } from '../type.js';
import { sweat, pops } from '../rig.js';
import { at, ramp, pop, ease, kick, place, cam, burst, sparkle, confetti, floorCam, speedLines } from '../common.js';
import { cardText } from './verse1.js';

const BENCH = 1500;
const BC = (x, z, atY = 1560) => floorCam(x, z * 1.16, BENCH, atY);
const glass = (s = 1) => (g, x, y, a, sc) => magnifier(g, x, y, a, sc * s);

export function register() {
  const n = 0;
  const A = 'Did you actually', B = 'Press it, stress', C = 'Find a clue', D = 'Now pursue', E = 'What did you try', F = 'What changed';
  const t0 = at(A, 'Did', n) - .12, tAct = at(A, 'actually', n), tTest = at(A, 'test', n);
  const tPress = at(B, 'Press', n), tStress = at(B, 'stress', n), tSecond = at(B, 'second', n), bEnd = wordsOf(B, n).at(-1).e;
  const tFind = at(C, 'Find', n), tClue = at(C, 'clue', n), tCongr = at(C, 'Congratulations', n);
  const tNow = at(D, 'Now', n), tPursue = at(D, 'pursue', n), tImpl = at(D, 'implications', n);
  const tWhat = at(E, 'What', n), tTry = at(E, 'try', n), tFound = at(E, 'find', n);
  const tWhat2 = at(F, 'What', n), tChanged = at(F, 'changed', n), tMind = at(F, 'mind', n), fEnd = wordsOf(F, n).at(-1).e;
  const verse2 = Math.min(at('The gym?', 'The') - .12, wordsOf('What changed', 0).at(-1).e + 1.0);

  // ---- 1-2. arrival, then press / stress / second-guess around the app
  shot(t0, tFind - .15, (g, t) => {
    const c = cam([[t0, BC(560, 1.1)], [tPress - .2, BC(540, 1.0)], [bEnd, BC(540, 1.03)]], t);
    g.save(); place(g, workshop(), c);
    const pk = t > tPress && t < tStress ? Math.floor((t - tPress) * 8) % 6 + 6 : -1;
    const sit = ease(t, tStress - .15, .2);
    const shakeK = t > tStress && t < tSecond + .2 ? 1 : 0;
    g.save(); g.translate(shakeK * Math.sin(t * 60) * 8, 0);
    app(g, 540, BENCH, 1.0, { t, shows: t > tPress ? '2 + 2 = 5' : '5', lx: t > tStress ? 0 : -.6, ly: -.5, smile: t > tStress ? -1 : 0, pressKey: pk, ring: shakeK * .3 });
    g.restore();
    // Stress sits on top of the app on "stress"
    const sx = lerp(820, 560, sit), sy = lerp(BENCH, BENCH - 360, sit) - Math.sin(sit * Math.PI) * 120;
    stress(g, sx, sy, .62, { t, gauge: t > tStress ? .95 : .3, steam: t > tStress ? 1 : 0, shake: shakeK, L: sit > .5 ? 'out' : 'hips', R: sit > .5 ? 'out' : 'cheer', eyes: { expr: t > tStress ? 'shut' : 'open' }, sing: t > tStress && t < tSecond, dance: .6 });
    // Press at the keys on "Press"
    const pIn = ease(t, t0, .4);
    press(g, lerp(-150, 240, pIn), BENCH, .72, { t, R: t > tPress - .1 && t < tStress + .2 ? { to: [1.6, -.3 + Math.sin(t * 50) * .1], pose: 'point' } : 'up', L: 'up', pressed: t > tPress && t < tStress ? 1 : 0, eyes: { expr: 'wide', lx: .7 }, sing: t < tAct + .3 || (t > tPress && t < tStress), dance: 1 });
    // Guess leans in over Clawd with his glass, then turns to his notebook on "second-guess"
    const gIn = ease(t, t0 + .1, .45);
    const second = t > tSecond - .1;
    guess(g, lerp(W + 200, 860, gIn), BENCH, .8, { t, L: second ? 'chin' : 'hang', R: second ? { to: [.4, .3], pose: 'grip' } : { to: [-.5, -.6], pose: 'grip' },
      hold: second ? { R: (g, x, y) => { shape(g, rrect(x - 60, y - 80, 120, 150, 8), { fill: PLUM, w: 5, seed: 6501 }); shape(g, rrect(x - 50, y - 70, 100, 130, 6), { fill: CREAM, w: 4, seed: 6502 }); label(g, '?', x, y - 6, 80, { font: DISPLAY, col: ROSE }); } } : { R: glass(1.1) },
      brow: second ? 1 : .5, sing: t < tTest + .4, eyes: { lx: -.6 } });
    // Clawd, startled, backing off to the far right edge
    if (t < tPress + .2) clawd(g, lerp(700, 1000, ease(t, t0, .3)), BENCH, .7, { t, L: 'cover', R: 'shrug', eyes: { expr: 'wide', lx: -.6 }, smile: -1, jump: kick(t, t0 + .1, .3) * .6 });
    if (t < tPress + .2 && t > t0 + .2) sweat(g, 1000 + 80, BENCH - 260, 1.2);
    // the verbs' spotlights: a burst of lines on each character as his word lands
    // name plates, each going up on its own word
    for (const [tw, name, x, y, col] of [[tPress, 'PRESS', 240, BENCH - 300, TEAL], [tStress, 'STRESS', 560, BENCH - 690, OCHRE], [tSecond, 'GUESS', 870, BENCH - 430, ROSE]]) {
      const p = pop(t, tw - .05, .3); if (p <= 0) continue;
      g.save(); g.translate(x, y); g.scale(p, p); g.rotate(-.05);
      shape(g, rrect(-120, -38, 240, 76, 12), { fill: col, w: 6, seed: 6550 + x });
      label(g, name, 0, 3, 50, { font: DISPLAY, col: CREAM, ow: .12 });
      g.restore();
    }
    burst(g, 290, BENCH - 170, 130, (t - tPress) / .4, 10, OCHRE, 11);
    burst(g, sx, sy - 190, 150, (t - tStress) / .4, 10, OCHRE, 12);
    burst(g, 860, BENCH - 470, 130, (t - tSecond) / .4, 10, OCHRE, 13);
    g.restore();
  }, { id: 'c1-press' });

  // ---- 3. the clue: 2 + 2 is 4 on the abacus; congratulations
  shot(tFind - .15, tNow - .1, (g, t) => {
    const c = cam([[tFind - .15, BC(540, 1.05)], [tCongr + .5, BC(540, 1.12)]], t);
    g.save(); place(g, workshop(), c);
    app(g, 250, BENCH, .9, { t, shows: '5', lx: .6, smile: -1 });
    const counted = Math.min(4, Math.floor(clamp((t - tFind) / (tClue - tFind + .05)) * 4 + .001));
    abacus(g, 560, 1000, 1.05, counted);
    if (t > tClue) {
      label(g, '2 + 2 = 4', 560, 850, 70, { font: DISPLAY, col: GREEN, ow: .18 });
      stroke(g, [[195, 1030], [305, 1090]], { w: 12, color: RED, seed: 6601 }); stroke(g, [[305, 1030], [195, 1090]], { w: 12, color: RED, seed: 6602 });
    }
    press(g, 560, BENCH, .8, { t, L: 'up', R: 'up', eyes: { expr: t > tClue ? 'happy' : 'open', ly: -.6 }, sing: true, jump: kick(t, tCongr, .3) * .6 });
    const bang = ease(t, tClue, .2);
    guess(g, 860, BENCH, .8, { t, bang, L: 'cheer', R: t > tCongr ? 'up' : 'hips', eyes: { expr: t > tCongr ? 'happy' : 'open', lx: -.5 }, sing: true });
    if (t > tClue) { const p = pop(t, tCongr - .1, .35); g.save(); g.translate(430, 1330); g.rotate(-.1); g.scale(p, p); rosette(g, 0, 0, 1.1, 'CLUE!'); g.restore(); }
    confetti(g, t, tCongr - .05, 70, { seed: 5 });
    g.restore();
  }, { id: 'c1-clue' });

  // ---- 4. pursue: tiptoe along the paste trail from the app to the check
  shot(tNow - .1, tWhat - .15, (g, t) => {
    const c = cam([[tNow - .1, BC(420, 1.0)], [tImpl + .6, BC(660, 1.02)]], t);
    g.save(); place(g, workshop(), c);
    app(g, 180, BENCH, .85, { t, shows: '5', lx: .6, smile: -1, tape: (g, x, y, s) => tape(g, x - 110, y, 120, -.05, 'a+b+1', s * .9) });
    const chk = check(g, 1000, BENCH, 1.6, { t, card: cardText('a+b+1'), flag: 1, flagCol: GREEN });
    const u = clamp((t - tNow) / (tImpl + .3 - tNow));
    trail(g, [330, BENCH - 10], [930, BENCH - 10], 1, { n: 11 });
    // the crew in a line, tiptoeing: knees up, looking down
    const walk = t * 3;
    const lead = lerp(420, 800, u);
    guess(g, lead, BENCH, .8, { t, walk, R: { to: [.8, .6], pose: 'grip' }, hold: { R: glass(.9) }, eyes: { ly: .8, lx: .5 }, sing: true, dance: .2, lean: .12 });
    press(g, lead - 200, BENCH, .72, { t, walk: walk + .3, eyes: { ly: .8, lx: .6 }, dance: .2, L: 'hips', R: 'hips' });
    stress(g, lead - 390, BENCH, .64, { t, walk: walk + .6, eyes: { lx: .6 }, dance: .2, L: 'hips', R: 'hips' });
    // on "implications": the two strips held up side by side, the same mistake in both
    if (t > tImpl) {
      const p = pop(t, tImpl, .3);
      g.save(); g.translate(600, 860); g.scale(p * 1.2, p * 1.2);
      shape(g, rrect(-360, -120, 720, 240, 30), { fill: CREAM, w: 8, seed: 6701 });
      label(g, 'SAME MISTAKE IN BOTH', 0, -76, 42, { font: PATTER, col: RED });
      tape(g, -330, -30, 290, 0, 'a+b+1', 1, { seed: 3 });
      tape(g, 40, -30, 290, 0, 'a+b+1', 1, { seed: 4, paste: true });
      label(g, 'APP', -185, 70, 30, { font: PATTER, col: TEAL }); label(g, 'CHECK', 185, 70, 30, { font: PATTER, col: CORAL });
      g.restore();
    }
    // Clawd peeking from behind the check
    clawd(g, 1080, BENCH, .55, { t, L: 'cover', R: 'hang', eyes: { expr: 'worried', lx: -.7 }, smile: -.6, dance: .2 });
    g.restore();
  }, { id: 'c1-pursue' });

  // ---- 5-6. the notebook, then the lightbulb
  shot(tWhat - .15, verse2, (g, t) => {
    const c = cam([[tWhat - .15, BC(540, 1.0)], [tWhat2, BC(540, 1.0)], [fEnd, BC(540, 1.06)]], t);
    g.save(); place(g, workshop(), c);
    const bookOut = ease(t, tWhat2 - .2, .4);
    // the notebook, big, held open by Guess
    if (bookOut < 1) {
      g.save(); g.translate(0, bookOut * 900);
      notebook(g, 540, 1110, 1.1, [
        ['TRIED:', 'counting 2 + 2 by hand', tTry - .2, TEAL],
        ['FOUND:', 'app and check both say 5. It’s 4!', tFound - .2, RED],
        ['SO:', 'a copied sum can’t check itself', tFound + .6, PLUM],
      ], t, { title: 'CASE 1: THE SUMS', h: 520 });
      g.restore();
    }
    // Clawd's mind changes: a bulb, and a glass of his own from Guess
    if (bookOut > 0) {
      const on = ramp(t, tChanged, .15);
      guess(g, 820, BENCH, .78, { t, L: 'hips', R: t > tMind ? { to: [-.9, -.1], pose: 'grip' } : 'hang', hold: t > tMind ? { R: glass(.8) } : {}, eyes: { expr: 'happy' }, bang: 1 });
      press(g, 150, BENCH, .62, { t, L: 'up', R: 'up', eyes: { expr: 'happy' } });
      const got = t > tMind + .5;
      clawd(g, 470, BENCH, .95, { t, L: got ? { to: [.35, -.1], pose: 'grip' } : 'chin', R: t > tMind ? 'up' : 'hips',
        hold: got ? { L: (g, x, y, a, s) => magnifier(g, x, y, -2.2, s * .8) } : {},
        eyes: { expr: on > .5 ? 'wide' : 'worried', ly: -.5 }, smile: on > .5 ? 1 : -.4, sing: true, jump: kick(t, tChanged, .3) * .6 });
      if (t > tChanged - .1) bulb(g, 470, BENCH - 470, 1.1, on, t);
      // the change itself: his green 5 becomes a red-pencilled 4
      if (t > tWhat2 - .1) {
        const k = ramp(t, tMind - .1, .3);
        g.save(); g.translate(820, 830); g.rotate(.04);
        shape(g, rrect(-170, -80, 340, 160, 16), { fill: CREAM, w: 6, seed: 6801 });
        label(g, '2 + 2 =', -40, 2, 54, { font: DISPLAY });
        label(g, '5', 110, 2, 70, { font: DISPLAY, col: GREEN });
        if (k > 0) { stroke(g, [[80, -30], [80 + 60 * k, 30]], { w: 10, color: RED, seed: 6802 }); label(g, '4!', 120, -60, 70 * k, { font: DISPLAY, col: RED, ow: .1 }); }
        g.restore();
      }
      // the cane, dropped
      if (got) cane(g, 300, BENCH - 20, 0, .8);
    }
    g.restore();
  }, { id: 'c1-mind' });
  irisJoin(verse2 - .05, { close: .5, open: .5, x: 470, y: 1030 });
}
