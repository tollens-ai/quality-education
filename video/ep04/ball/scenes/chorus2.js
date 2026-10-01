// Chorus 2, in the gym: the same questions, now about a real user's lost work.
//  "Did you actually test it?"  Mabel sings it too, the crew around her phone.
//  "Press it, stress it, second-guess it!"  Press hammers SAVE with no net; Stress yanks the plug in
//     and out; Guess asks the next thing: OLD SETS TOO?
//  "Find a clue? Congratulations!"  The red-flag check wins the CLUE! rosette; Mabel presses the whole
//     crew overhead on her barbell.
//  "Now pursue its implications."  The camera pans along the gym: other lifters, logging offline too.
//  "What did you try? What did you find?"  The notebook, case 2.
//  "What changed your mind?"  The phone's "Saved!" is stamped: SAVED ≠ STORED.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, easeOut } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED, WHITE, MINT } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { gym } from '../places.js';
import { clawd } from '../clawd.js';
import { guess, press, stress, check } from '../crew.js';
import { mabel, person } from '../people.js';
import { phone, socket, barbell } from '../props-gym.js';
import { notebook, rosette } from '../props-crew.js';
import { shape, rrect, ellipse, stroke } from '../ink.js';
import { label, DISPLAY, PATTER, SCRIPT, fitSize } from '../type.js';
import { at, ramp, pop, ease, kick, place, cam, burst, sparkle, confetti } from '../common.js';
import { FL, GC, glass } from './verse2.js';

const ROWS = [{ text: 'SET 1  60 kg', tick: true }, { text: 'SET 2  60 kg', tick: true }, { text: 'SET 3  80 kg', tick: true }];
const offCheck = (g, x, y, cw, ch, s) => { label(g, 'SAVED OFFLINE,', x, y - 9 * s, fitSize(g, 'SAVED OFFLINE,', PATTER, 18 * s, cw - 6 * s), { font: PATTER }); label(g, 'STILL THERE?', x, y + 11 * s, fitSize(g, 'STILL THERE?', PATTER, 18 * s, cw - 6 * s), { font: PATTER }); };

export function register() {
  const n = 1;
  const A = 'Did you actually', B = 'Press it, stress', C = 'Find a clue', D = 'Now pursue', E = 'What did you try', F = 'What changed';
  const t0 = at(A, 'Did', n) - .12;
  const tPress = at(B, 'Press', n), tStress = at(B, 'stress', n), tSecond = at(B, 'second', n);
  const tFind = at(C, 'Find', n), tClue = at(C, 'clue', n), tCongr = at(C, 'Congratulations', n);
  const tNow = at(D, 'Now', n), tImpl = at(D, 'implications', n);
  const tWhat = at(E, 'What', n), tTry = at(E, 'try', n), tFound = at(E, 'find', n);
  const tWhat2 = at(F, 'What', n), tChanged = at(F, 'changed', n), tMind = at(F, 'mind', n), fEnd = wordsOf(F, n).at(-1).e;
  const bridge = at('A fresh bot crew', 'A') - .12;

  // ---- 1-2. sing it together; press, stress, second-guess the gym log
  shot(t0, tFind - .15, (g, t) => {
    const c = cam([[t0, GC(560, 1.0)], [tSecond, GC(600, 1.04)]], t);
    g.save(); place(g, gym(), c);
    const pressing = t > tPress - .1 && t < tStress;
    const yank = t > tStress - .1 && t < tSecond + .2, plugged = yank ? Math.floor(t * 8) % 2 === 0 : false;
    const ph = phone(g, 760, FL, 1, { t, bars: plugged ? 4 : 0, rows: [...ROWS, ...(pressing ? [{ text: 'SET 4  80 kg', fresh: (t * 8) % 1 }] : [])], toast: pressing ? (t * 4) % 1 : 0, face: pressing ? 'worried' : 'open', lx: -.5, reloadPress: 0 });
    socket(g, 210, 1010, .9, plugged, [ph.port[0] - 60, ph.port[1] + 20], { sag: 60, plugAt: [300, 1150 + Math.sin(t * 30) * 20], spark: plugged ? .5 : 0 });
    stress(g, 290, FL, .62, { t, L: 'hips', R: yank ? { to: [.2, -1.6 + Math.sin(t * 50) * .3], pose: 'grip' } : 'hips', gauge: yank ? .98 : .4, steam: yank ? 1 : 0, shake: yank ? 1 : 0, sing: t < tPress });
    mabel(g, 520, FL, .8, { t, L: 'cheer', R: 'hips', eyes: { expr: t < tPress ? 'happy' : 'open', lx: .6 }, sing: t < tPress + .3 });
    press(g, 1000, FL, .56, { t, L: pressing ? { to: [-2.1, -3.2 + Math.sin(t * 60) * .15], pose: 'point' } : 'up', R: 'up', pressed: pressing ? 1 : 0, eyes: { lx: -.7, expr: pressing ? 'wide' : 'happy' }, sing: t < tPress + .3 });
    // Guess on "second-guess": what about the sets saved before?
    const gin = ease(t, tSecond - .45, .35);
    if (gin > 0) {
      guess(g, lerp(1250, 980, gin), FL, .66, { t, L: 'chin', R: 'hang', brow: 1, eyes: { lx: -.6 } });
      g.save(); const p = pop(t, tSecond, .3); g.translate(700, 780); g.scale(p, p);
      shape(g, rrect(-200, -60, 400, 120, 50), { fill: WHITE, w: 6, seed: 8001 });
      shape(g, [[80, 50], [150, 110], [130, 45]], { fill: WHITE, w: 5, seed: 8002 });
      label(g, 'OLD SETS TOO?', 0, 3, 48, { font: DISPLAY, col: PLUM });
      g.restore();
    }
    for (const [tw, x, y, s] of [[tPress, 900, 1040, 11], [tStress, 290, 1060, 12], [tSecond, 980, 900, 13]]) burst(g, x, y, 140, (t - tw) / .4, 10, OCHRE, s);
    g.restore();
  }, { id: 'c2-press' });

  // ---- 3. the clue, congratulated: the check's rosette; Mabel lifts the crew
  shot(tFind - .15, tNow - .1, (g, t) => {
    const c = cam([[tFind - .15, GC(540, 1.0)], [tCongr + .6, GC(540, 1.06)]], t);
    g.save(); place(g, gym(), c);
    const lift = ease(t, tCongr - .3, .35);
    const by = lerp(1080, 780, lift) + (lift >= 1 ? Math.sin(t * 8) * 10 : 0);
    mabel(g, 540, FL, .9, { t, L: { to: [.95, (by - 1030) / 150 - .3], pose: 'grip' }, R: { to: [.95, (by - 1030) / 150 - .3], pose: 'grip' }, eyes: { expr: 'happy' }, sing: true });
    barbell(g, 540, by, .95);
    guess(g, 540 - 280, by - 30, .42, { t, L: 'up', R: 'up', bang: 1, eyes: { expr: 'happy' }, dance: 0, sing: true });
    press(g, 540 + 280, by - 40, .4, { t, L: 'up', R: 'up', eyes: { expr: 'happy' }, dance: 0, sing: true });
    clawd(g, 540 - 160, by - 40, .32, { t, L: 'up', R: 'up', eyes: { expr: 'happy' }, dance: 0, sing: true });
    stress(g, 540 + 160, by - 40, .34, { t, L: 'up', R: 'up', eyes: { expr: 'shut' }, dance: 0, steam: 1, sing: true });
    // the check that found it, wearing the rosette
    check(g, 900, FL, 1.4, { t, card: offCheck, flag: 1, flagCol: RED, wave: true, hop: kick(t, tClue, .25) });
    if (t > tClue) { const p = pop(t, tClue, .35); g.save(); g.translate(900, 1180); g.scale(p * .75, p * .75); rosette(g, 0, 0, 1, 'CLUE!'); g.restore(); }
    confetti(g, t, tCongr - .05, 80, { seed: 9 });
    g.restore();
  }, { id: 'c2-clue' });

  // ---- 4. implications: other lifters, logging offline too
  shot(tNow - .1, tWhat - .15, (g, t) => {
    const u = ease(t, tNow, tImpl + .5 - tNow);
    const c = cam([[tNow - .1, GC(380, 1.0)], [tImpl + .6, GC(760, 1.0)]], t);
    g.save(); place(g, gym(), c);
    const lifters = [['pat', 260], ['sam', 560], ['me', 860], ['customer', 1160]];
    for (const [k, x] of lifters) {
      person(g, x, FL, .95, { t, kind: k, eyes: { ly: .6 } });
      // each on a little phone with NO NET
      shape(g, rrect(x - 40, FL - 150, 80, 120, 12), { fill: ROSE, w: 5, seed: 8100 + x });
      shape(g, rrect(x - 30, FL - 138, 60, 90, 6), { fill: CREAM, w: 3, seed: 8101 + x });
      label(g, 'NO NET', x, FL - 118, 16, { font: PATTER, col: RED });
      const q = ramp(t, tNow + (x - 260) / 900 * (tImpl - tNow), .2);
      if (q > 0) label(g, '?', x, FL - 440 - Math.sin(t * 5 + x) * 10, 110 * pop(t, tNow + (x - 260) / 900 * (tImpl - tNow), .3), { font: DISPLAY, col: RED, ow: .12 });
    }
    if (t > tImpl - .3) { const p = pop(t, tImpl - .3, .3); g.save(); g.translate(c.x, 760); g.scale(p, p); shape(g, rrect(-250, -46, 500, 92, 20), { fill: WHITE, w: 6, seed: 8150 }); label(g, 'EVERYONE OFFLINE?', 0, 3, 48, { font: DISPLAY, col: RED }); g.restore(); }
    // Guess sweeping his glass along them
    const gx = lerp(150, 1000, u);
    guess(g, gx, FL, .7, { t, walk: t * 3, R: { to: [.9, -.9], pose: 'grip' }, hold: { R: glass(1) }, eyes: { lx: .6 }, bang: 1, sing: true });
    g.restore();
  }, { id: 'c2-impl' });

  // ---- 5-6. notebook, case 2; then SAVED ≠ STORED
  shot(tWhat - .15, bridge, (g, t) => {
    const c = cam([[tWhat - .15, GC(560, 1.0)], [fEnd, GC(620, 1.06)]], t);
    g.save(); place(g, gym(), c);
    const away = ease(t, tWhat2 - .2, .4);
    if (away < 1) {
      g.save(); g.translate(0, away * 900);
      notebook(g, 540, 1110, 1.1, [
        ['TRIED:', 'save a set with no net, reload', tTry - .2, TEAL],
        ['FOUND:', 'it said "Saved!"; the set was gone', tFound - .2, RED],
        ['AND:', 'with the net on, sets stay', tFound + .7, PLUM],
      ], t, { title: 'CASE 2: THE GYM', h: 520 });
      g.restore();
    }
    if (away > 0) {
      const ph = phone(g, 700, FL, 1, { t, bars: 0, rows: ROWS, toast: .5, face: t > tMind ? 'worried' : 'wink', hole: true });
      mabel(g, 330, FL, .82, { t, L: 'hips', R: t > tChanged ? { to: [1.05, -.6], pose: 'point' } : 'hips', eyes: { expr: t > tChanged ? 'open' : 'happy', lx: .7 }, sing: true, smile: 1 });
      if (t > tWhat2 - .1) {
        // before and after: "Saved!" used to mean safe; now she knows it isn't, until it's stored
        g.save(); g.translate(540, 800);
        shape(g, rrect(-380, -90, 760, 180, 18), { fill: CREAM, w: 7, seed: 8201 });
        label(g, '"Saved!"', -190, 0, 66, { font: SCRIPT, col: GREEN });
        const k = ramp(t, tChanged, .3);
        if (k > 0) stroke(g, [[-320, 10], [-320 + 260 * k, -10]], { w: 10, color: RED, seed: 8202 });
        if (t > tMind - .1) { const p = pop(t, tMind - .1, .3); g.save(); g.translate(170, 0); g.scale(p, p); label(g, '≠ STORED', 0, 4, 62, { font: DISPLAY, col: RED }); g.restore(); }
        g.restore();
      }
      guess(g, 1010, FL, .62, { t, L: 'cheer', R: 'hips', eyes: { expr: 'happy', lx: -.5 }, bang: 1 });
      clawd(g, 900, FL + 20, .45, { t, L: 'up', R: 'hips', eyes: { expr: 'happy' } });
    }
    g.restore();
  }, { id: 'c2-mind' });
  irisJoin(bridge - .05, { close: .5, open: .45, x: 700, y: 1100 });
}
