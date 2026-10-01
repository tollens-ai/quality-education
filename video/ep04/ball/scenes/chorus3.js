// Chorus 3, the whole company: back in the town square, in full colour.
//  "Did you actually test it?"  Everyone in a line across the square: the crew, Clawd with his glass,
//     Mabel, the fresh bots, Pat, Sam and the customer.
//  "Press it, stress it, second-guess it!"  The fresh bots do the three moves they've learned.
//  "Find a clue? Congratulations!"  Fireworks bursting into "!"; Mabel hoists Clawd.
//  "Now pursue its implications."  A conga line snakes off along the trail.
//  "What did you try? What did you find?"  The tower's board, which read 200/200 in the opening, now
//     lists what was found: the gym's lost sets, Sam seeing Pat's text, the shop's orders matching.
//  "What changed your mind?"  Clawd in the middle, hat off, a few checks beside him, each with its rule.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, easeOut } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED, WHITE } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { clawd } from '../clawd.js';
import { guess, press, stress, check } from '../crew.js';
import { mabel, person } from '../people.js';
import { magnifier } from '../props.js';
import { freshBot } from '../props-bridge.js';
import { shape, rrect, ellipse, stroke } from '../ink.js';
import { label, DISPLAY, PATTER, SCRIPT, fitSize } from '../type.js';
import { at, ramp, pop, ease, kick, burst, sparkle, confetti, speedLines } from '../common.js';
import { square } from './intro.js';
import { cardText } from './verse1.js';
import { barbell } from '../props-gym.js';

const GROUND = 1720;
const glassR = (s = .8) => (g, x, y, a, sc) => magnifier(g, x, y, -2.2, sc * s);

// The company in a line; `kick` sets a kick-line phase for each.
function company(g, t, o = {}) {
  const k = o.kick ?? 0, y = GROUND, sh = o.shift ?? 0;
  const leg = i => Math.max(0, Math.sin((t * 3.6 + i * .5) * Math.PI)) * k;
  person(g, 180 + sh, y - 60, .5, { t, kind: 'sam', eyes: { expr: 'happy' }, sing: true });
  person(g, 900 + sh, y - 60, .5, { t, kind: 'customer', eyes: { expr: 'happy' }, sing: true });
  person(g, 790 + sh, y - 50, .46, { t, kind: 'pat', eyes: { expr: 'happy' }, sing: true });
  mabel(g, 250 + sh, y, .62, { t, L: 'up', R: 'hips', eyes: { expr: 'happy' }, sing: true });
  stress(g, 390 + sh, y, .52, { t, L: 'up', R: 'up', jump: leg(1) * .3, steam: .5, sing: true });
  guess(g, 510 + sh, y, .56, { t, L: 'up', R: 'hips', bang: 1, jump: leg(2) * .3, sing: true });
  clawd(g, 650 + sh, y, .56, { t, L: 'up', R: { to: [.3, -.2], pose: 'grip' }, hold: { R: glassR() }, eyes: { expr: 'happy' }, jump: leg(3) * .3, sing: true });
  press(g, 820 + sh, y, .5, { t, L: 'up', R: 'up', jump: leg(4) * .4, sing: true });
}

export function register() {
  const n = 2;
  const A = 'Did you actually', B = 'Press it, stress', C = 'Find a clue', D = 'Now pursue', E = 'What did you try', F = 'What changed';
  const t0 = at(A, 'Did', n) - .12;
  const tPress = at(B, 'Press', n), tStress = at(B, 'stress', n), tSecond = at(B, 'second', n);
  const tFind = at(C, 'Find', n), tClue = at(C, 'clue', n), tCongr = at(C, 'Congratulations', n);
  const tNow = at(D, 'Now', n), tImpl = at(D, 'implications', n);
  const tWhat = at(E, 'What', n), tTry = at(E, 'try', n), tFound = at(E, 'find', n);
  const tWhat2 = at(F, 'What', n), tChanged = at(F, 'changed', n), tMind = at(F, 'mind', n), fEnd = wordsOf(F, n).at(-1).e;
  const outro = at('It loses sets', 'It') - .12;

  // the findings board on the tower, flipping from 200/200
  const board = (g, t, p) => {
    const flip = Math.abs(Math.cos(clamp(p) * Math.PI));
    g.save(); g.translate(540, 1340); g.scale(1, Math.max(.02, flip));
    if (p < .5) { shape(g, ellipse(0, 0, 118, 118), { fill: INK, w: 8, seed: 12001 }); label(g, '200/200', 0, -6, 58, { font: DISPLAY, col: GREEN, ow: .18 }); }
    else {
      shape(g, rrect(-330, -170, 660, 340, 20), { fill: INK, w: 8, seed: 12002 });
      shape(g, rrect(-310, -150, 620, 300, 12), { fill: CREAM, w: 5, seed: 12003 });
      label(g, 'FOUND', 0, -112, 50, { font: DISPLAY, col: PLUM });
      const rows = [['Gym: offline sets lost', RED], ["Chat: Sam sees Pat's text", RED], ['Shop: orders match', GREEN]];
      rows.forEach(([r, col], i) => { if (t > tFound - .2 + i * .25) { label(g, (col === GREEN ? '✓ ' : '! ') + r, -280, -46 + i * 62, 38, { font: PATTER, col: col === GREEN ? '#2f6b24' : RED, align: 'left' }); } });
    }
    g.restore();
  };

  // ---- 1-2. the company sings; the fresh bots press, stress and second-guess
  shot(t0, tFind - .15, (g, t) => {
    g.save(); square(g, { z: 1.22, x: 540, y: 1240 });
    company(g, t, { kick: .6 });
    // the fresh bots in front, each doing one move on its word
    const xs = [330, 540, 750];
    for (let k = 0; k < 3; k++) {
      const tw = [tPress, tStress, tSecond][k], on = t > tw - .1;
      const sc = .62 * (1 + kick(t, tw, .25) * .2);
      freshBot(g, xs[k], GROUND + 190, sc, k, { t, eyes: { expr: on ? 'wide' : 'happy' }, tag: false, sing: true,
        L: on ? (k === 0 ? { to: [-.2, -1.1], pose: 'point' } : k === 1 ? { to: [.2, -1.0 + Math.sin(t * 40) * .2], pose: 'fist' } : { to: [.4, -.4], pose: 'fist' }) : 'up',
        R: on && k === 2 ? { to: [.5, -.6], pose: 'grip' } : 'up', hold: on && k === 2 ? { R: (g, x, y, s) => magnifier(g, x, y, -1.2, s * .7) } : {} });
    }
    g.restore();
  }, { id: 'c3-company' });

  // ---- 3. fireworks; Mabel hoists Clawd
  shot(tFind - .15, tNow - .1, (g, t) => {
    g.save(); square(g, { z: 1.22, x: 540, y: 1240 });
    for (const [ft, fx, fy, col] of [[tClue - .1, 300, 620, CORAL], [tClue + .2, 800, 560, GOLD], [tCongr, 540, 480, TEAL], [tCongr + .4, 250, 460, ROSE], [tCongr + .7, 850, 640, GOLD]]) {
      const p = (t - ft) / .9; if (p <= 0 || p >= 1) continue;
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; const r = 40 + p * 170; label(g, '!', fx + Math.cos(a) * r, fy + Math.sin(a) * r + p * p * 60, 50 * (1 - p * .6), { font: DISPLAY, col: col, ow: .15 }); }
    }
    const lift = ease(t, tClue - .2, .4);
    mabel(g, 540, GROUND, .78, { t, L: { to: [.4, -1.2 - lift * .3], pose: 'grip' }, R: { to: [.4, -1.2 - lift * .3], pose: 'grip' }, eyes: { expr: 'happy' }, sing: true });
    clawd(g, 540, GROUND - 600 - lift * 60, .6, { t, L: 'up', R: 'up', eyes: { expr: 'happy' }, sing: true, hatTip: kick(t, tCongr, .5) });
    guess(g, 250, GROUND, .6, { t, L: 'up', R: 'cheer', bang: 1, eyes: { expr: 'happy' }, sing: true });
    press(g, 830, GROUND, .55, { t, L: 'up', R: 'up', eyes: { expr: 'happy' }, jump: kick(t, tCongr, .4) * .6, sing: true });
    confetti(g, t, tCongr - .1, 90, { seed: 17 });
    g.restore();
  }, { id: 'c3-fireworks' });

  // ---- 4. a conga line follows the trail across the square
  shot(tNow - .1, tWhat - .15, (g, t) => {
    const u = ease(t, tNow - .1, tImpl + .6 - tNow);
    g.save(); square(g, { z: 1.22, x: 540, y: 1240 });
    for (let i = 0; i < 14; i++) { const x = 100 + i * 65; shape(g, ellipse(x + (i % 2 ? 12 : -12), GROUND + 40 - i * 4, 13, 22, .3), { fill: '#3a2a20', w: 3, seed: 12100 + i }); }
    const lead = lerp(100, 1200, u), gap = 130, walk = t * 3.6;
    const line = [g2 => guess(g, lead, GROUND, .55, { t, walk, R: { to: [.8, .5], pose: 'grip' }, hold: { R: glassR(.9) }, bang: 1, sing: true }),
      () => clawd(g, lead - gap, GROUND, .5, { t, walk, L: { to: [.7, -.2], pose: 'open' }, R: { to: [.7, -.2], pose: 'open' }, eyes: { expr: 'happy' }, sing: true }),
      () => press(g, lead - gap * 2, GROUND, .45, { t, walk, L: 'out', R: 'out', sing: true }),
      () => mabel(g, lead - gap * 3, GROUND, .55, { t, walk, L: 'out', R: 'out', eyes: { expr: 'happy' }, sing: true }),
      () => stress(g, lead - gap * 4, GROUND, .48, { t, walk, L: 'out', R: 'out', steam: .5, sing: true }),
      () => freshBot(g, lead - gap * 5, GROUND, .5, 0, { t, tag: false, eyes: { expr: 'happy' } }),
      () => freshBot(g, lead - gap * 6, GROUND, .5, 1, { t, tag: false, eyes: { expr: 'happy' } }),
      () => freshBot(g, lead - gap * 7, GROUND, .5, 2, { t, tag: false, eyes: { expr: 'happy' } }),
      () => person(g, lead - gap * 8, GROUND, .5, { t, kind: 'pat', eyes: { expr: 'happy' } })];
    for (let i = line.length - 1; i >= 0; i--) line[i]();
    g.restore();
  }, { id: 'c3-conga' });

  // ---- 5-6. the board of findings; Clawd, hat off
  shot(tWhat - .15, outro, (g, t) => {
    const z = lerp(1.0, 1.12, ease(t, tWhat2, fEnd - tWhat2));
    g.save(); square(g, { z: z * 1.2, x: 540, y: 1250 });
    board(g, t, ramp(t, tWhat + .2, .4));
    {
      // a few checks, each with its own rule, beside Clawd
      const k = 1;
      [['OFFLINE KEPT?', 330], ['ONLY ME+PAT?', 750]].forEach(([r, x], i) => check(g, x, GROUND + 130, 1.0 * k, { t, card: cardText(r), flag: 1, flagCol: i ? RED : RED, wave: true }));
      clawd(g, 540, GROUND + 140, .72 * k, { t, L: t > tMind ? { to: [.2, -.55], pose: 'grip' } : 'up', R: { to: [.3, -.2], pose: 'grip' }, hold: { R: glassR(.9) }, hatTip: t > tMind ? clamp((t - tMind) / .3) : 0, eyes: { expr: t > tChanged ? 'happy' : 'open' }, sing: true, blush: 1 });
    }
    g.restore();
  }, { id: 'c3-board' });
  irisJoin(outro - .05, { close: .6, open: .5, x: 540, y: 1300 });
}
