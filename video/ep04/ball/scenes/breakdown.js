// The breakdown, a cappella: the piano stops and the colour drains away; on a bare stage, in ink and
// cream, a check and a test are shown side by side. Only meaning keeps its colour: a flag, the ball.
//  "A check applies a rule we've set;"  One check in the spotlight; Guess slots in its rule card.
//  "It tells us if that rule is met."  The app's answer arrives; the flag goes up green: MET.
//  "To test, we ask what else—and why;"  Guess in a second spotlight; questions bloom: NO NET?
//     OTHER USERS? OLD SETS? and a big WHY?
//  "Each clue can change what next we try."  A path of footprints; a clue; the path turns.
//  "A check reports, "The sums agree!""  The copied check: 5 = 5, flag green, and it says so.
//  "We test: "Could both be wrong? Let's see!""  Guess counts it out: 4. Both fives were wrong.
//  "The checks are part of how we test;"  The check climbs into the crew's bag, beside the glass,
//     the notebook and the browser.
//  "We judge what serves the users best."  The users step into the light, and the colour returns.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, easeOut } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED, WHITE, WOOD, BROWN, GREY } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { stage, spot } from '../places.js';
import { clawd } from '../clawd.js';
import { guess, press, stress, check } from '../crew.js';
import { mabel, person } from '../people.js';
import { magnifier } from '../props.js';
import { abacus, notebook, trail } from '../props-crew.js';
import { miniBrowser, playbook } from '../props-bridge.js';
import { shape, rrect, ellipse, stroke, dot, spline } from '../ink.js';
import { label, DISPLAY, PATTER, SCRIPT, fitSize, textW } from '../type.js';
import { at, ramp, pop, ease, kick, place, cam, burst, sparkle, bubble, floorCam } from '../common.js';
import { cardText } from './verse1.js';

const SF = 1360;
const SC = (x, z, atY = 1560) => floorCam(x, z * 1.45, SF, atY);
const two = (a, b) => (g, x, y, cw, ch, s) => { label(g, a, x, y - 9 * s, fitSize(g, a, PATTER, 18 * s, cw - 6 * s), { font: PATTER }); label(g, b, x, y + 11 * s, fitSize(g, b, PATTER, 18 * s, cw - 6 * s), { font: PATTER }); };

export function register(S, { MONO }) {
  const K1 = 'A check applies', K2 = 'It tells us if', K3 = 'To test, we ask', K4 = 'Each clue can', K5 = 'A check reports', K6 = 'We test: "Could', K7 = 'The checks are part', K8 = 'We judge what';
  const t0 = at(K1, 'A') - .12;
  const tCheck = at(K1, 'check'), tRule = at(K1, 'rule'), tSet = at(K1, 'set');
  const tTells = at(K2, 'tells'), tMet = at(K2, 'met');
  const tTest = at(K3, 'test'), tElse = at(K3, 'else'), tWhy = at(K3, 'why');
  const tClue = at(K4, 'clue'), tChange = at(K4, 'change'), tNext = at(K4, 'next'), tTry = at(K4, 'try');
  const tRep = at(K5, 'reports'), tSums = at(K5, 'sums'), tAgree = at(K5, 'agree');
  const tTest2 = at(K6, 'test'), tBoth = at(K6, 'both'), tWrong = at(K6, 'wrong'), tSee = at(K6, 'see');
  const tChecks = at(K7, 'checks'), tPart = at(K7, 'part'), tHow = at(K7, 'test');
  const tJudge = at(K8, 'judge'), tServes = at(K8, 'serves'), tUsers = at(K8, 'users'), tBest = at(K8, 'best'), kEnd = wordsOf(K8).at(-1).e;
  const chorus3 = at('Did you actually', 'Did', 2) - .12;
  MONO.push([t0 - .7, tBest + .6, .6]);

  // ---- 1-2. a check applies a rule; it tells us if the rule is met
  shot(t0, tTest - .2, (g, t) => {
    const c = cam([[t0, SC(540, 1.0)], [tMet + .3, SC(540, 1.08)]], t);
    g.save(); place(g, stage(), c);
    spot(g, 540, SF - 10, 360, .55);
    const card = t > tRule ? cardText('2+2 → 4?') : null;
    const up = t > tMet - .05 ? pop(t, tMet - .05, .3) : 0;
    check(g, 540, SF, 2.3, { t, card, flag: clamp(up), flagCol: up > 0 ? GREEN : GREY, wave: up >= 1 });
    // the rule card, slotted in by a rose glove
    if (t > tCheck && t < tRule + .4) { const k = ease(t, tCheck, tRule - tCheck); shape(g, rrect(lerp(1100, 470, k), lerp(900, 1110, k), 150, 100, 6), { fill: CREAM, w: 5, seed: 10001 }); label(g, '2+2 → 4?', lerp(1100, 470, k) + 75, lerp(900, 1110, k) + 52, 32, { font: PATTER }); }
    label(g, 'A CHECK', 540, 880, 72, { font: DISPLAY, col: CREAM, ow: .2 });
    if (t > tTells) { const k = ease(t, tTells - .2, .4); shape(g, rrect(lerp(-200, 210, k), 1060, 160, 90, 6), { fill: WHITE, w: 5, seed: 10002 }); label(g, 'APP: 4', lerp(-200, 210, k) + 80, 1105, 38, { font: PATTER }); }
    if (t > tMet) { const p = pop(t, tMet, .3); g.save(); g.translate(760, 980); g.scale(p, p); label(g, 'MET', 0, 0, 90, { font: DISPLAY, col: '!' + GREEN, ow: .16 }); g.restore(); }
    g.restore();
  }, { id: 'bd-check' });

  // ---- 3-4. to test: what else, and why; a clue changes the next try
  shot(tTest - .2, tRep - .2, (g, t) => {
    const c = cam([[tTest - .2, SC(540, 1.0)], [tTry + .3, SC(560, 1.04)]], t);
    g.save(); place(g, stage(), c);
    spot(g, 540, SF - 10, 420, .55);
    label(g, 'A TEST', 540, 880, 72, { font: DISPLAY, col: CREAM, ow: .2 });
    const turn = t > tClue - .1;
    // the path of footprints, turning at the clue
    trail(g, [220, SF + 40], [500, SF - 20], 1, { n: 6, feet: true, col: CREAM });
    if (turn) { trail(g, [520, SF - 20], [880, SF + 50], ease(t, tChange, .7), { n: 6, feet: true, col: CREAM }); }
    else trail(g, [520, SF - 20], [880, SF - 80], .5, { n: 6, feet: true, col: GREY });
    if (turn) { const p = pop(t, tClue - .1, .3); g.save(); g.translate(540, SF - 120); g.scale(p, p); shape(g, ellipse(0, 0, 50, 50), { fill: GOLD, w: 6, seed: 10010 }); label(g, '!', 0, 4, 76, { font: DISPLAY }); g.restore(); }
    const gx = turn ? lerp(500, 820, ease(t, tNext, .8)) : lerp(260, 470, ease(t, tTest - .2, .6));
    guess(g, gx, SF, .85, { t, R: { to: [.8, -.6], pose: 'grip' }, hold: { R: (g, x, y, a, s) => magnifier(g, x, y, -.7, s) }, L: turn ? 'hips' : 'chin', eyes: { lx: .5 }, brow: 1, bang: turn ? 1 : 0, sing: true, walk: t > tNext ? t * 3 : null });
    // questions blooming on "else" and "why"
    const qs = [['NO NET?', 330, 1000], ['OTHER USERS?', 720, 960], ['OLD SETS?', 360, 1130]];
    if (!turn) qs.forEach(([q, x, y], i) => { const p = pop(t, tElse - .1 + i * .15, .3); if (p <= 0) return; g.save(); g.translate(x, y); g.scale(p, p); bubble(g, 0, 0, textW(g, q, PATTER, 44) + 90, 100, 30, 80); label(g, q, 0, 2, 44, { font: PATTER }); g.restore(); });
    if (t > tWhy && !turn) { const p = pop(t, tWhy, .3); g.save(); g.translate(730, 1130); g.scale(p, p); label(g, 'WHY?', 0, 0, 110, { font: DISPLAY, col: CREAM, ow: .18 }); g.restore(); }
    g.restore();
  }, { id: 'bd-test' });

  // ---- 5-6. the sums agree; could both be wrong?
  shot(tRep - .2, tChecks - .2, (g, t) => {
    const c = cam([[tRep - .2, SC(530, 1.0)], [tSee + .3, SC(540, 1.03)]], t);
    g.save(); place(g, stage(), c);
    spot(g, 360, SF - 10, 260, .5); spot(g, 760, SF - 10, 260, t > tTest2 - .2 ? .5 : .15);
    check(g, 360, SF, 2.0, { t, card: cardText('5 = 5'), flag: 1, flagCol: GREEN, wave: true });
    if (t > tSums - .1) { const p = pop(t, tSums - .1, .3); g.save(); g.translate(420, 880); g.scale(p, p); bubble(g, 0, 0, 440, 110, -60, 150, { speech: true }); label(g, '"THE SUMS AGREE!"', 0, 2, 38, { font: DISPLAY }); g.restore(); }
    if (t > tTest2 - .3) {
      guess(g, 790, SF, .62, { t, L: 'chin', R: 'hips', brow: 1, eyes: { lx: -.6 }, sing: true, bang: t > tWrong ? 1 : 0 });
      const counted = Math.min(4, Math.floor(clamp((t - tBoth) / (tSee - tBoth)) * 4.99));
      abacus(g, 790, 1020, .7, counted);
      if (t > tSee) { label(g, '2 + 2 = 4', 760, 760, 60, { font: DISPLAY, col: CREAM, ow: .18 }); stroke(g, [[290, 1100], [430, 1180]], { w: 12, color: '!' + RED, seed: 10020 }); stroke(g, [[430, 1100], [290, 1180]], { w: 12, color: '!' + RED, seed: 10021 }); label(g, '?', 470, 960 - Math.sin(t * 5) * 10, 110, { font: DISPLAY, col: CREAM, ow: .12 }); }
    }
    g.restore();
  }, { id: 'bd-sums' });

  // ---- 7-8. checks go in the testing bag; the users step into the light
  shot(tChecks - .2, chorus3, (g, t) => {
    const c = cam([[tChecks - .2, SC(540, 1.0)], [tJudge, SC(540, 1.0)], [kEnd, SC(540, .95)]], t);
    g.save(); place(g, stage(), c);
    const users = t > tJudge - .2;
    spot(g, 540, SF - 10, users ? 560 : 380, .55);
    // the bag
    const bx = 540, by = SF;
    const open = ease(t, tChecks - .2, .3);
    // a doctor's bag: brass frame, handle, clasp
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.arc(bx, by - 330, 70, Math.PI, 0); g.stroke();
    g.strokeStyle = '#8a8070'; g.lineWidth = 9; g.beginPath(); g.arc(bx, by - 330, 70, Math.PI, 0); g.stroke();
    shape(g, spline([[bx - 230, by], [bx - 250, by - 200], [bx - 200, by - 300], [bx + 200, by - 300], [bx + 250, by - 200], [bx + 230, by]], true, 5), { fill: '#7a4a2c', shade: '#55301a', shadeOff: [-14, -14], w: 8, seed: 10030, gloss: { x: .25, y: .2, w: .06, h: .05 } });
    shape(g, rrect(bx - 210, by - 312, 420, 26, 10), { fill: GOLD, w: 6, seed: 10031 });
    shape(g, rrect(bx - 22, by - 300, 44, 40, 8), { fill: GOLD, w: 5, seed: 10032 });
    label(g, 'TESTING', bx, by - 150, 64, { font: DISPLAY, col: CREAM, ow: .12 });
    // what's already in it: the glass, the notebook, a browser
    magnifier(g, bx - 120, by - 300, -1.9, .7);
    miniBrowser(g, bx + 110, by - 330, .9, .1);
    playbook(g, bx + 10, by - 340, .8, -.15);
    // the check walks in on "part"
    const walk = ease(t, tChecks, tHow - tChecks + .2);
    if (walk < 1) check(g, lerp(950, bx + 20, walk), lerp(SF, by - 260, walk * walk), lerp(1.4, .8, walk), { t, card: cardText('RULE'), flag: 1, flagCol: GREEN, march: true });
    else check(g, bx + 20, by - 260, .8, { t, card: cardText('RULE'), flag: 1, flagCol: GREEN, wave: true });
    if (!users) { guess(g, 240, SF, .65, { t, L: 'present', R: 'hips', eyes: { expr: 'happy' }, sing: true }); clawd(g, 850, SF, .5, { t, L: 'up', R: 'hips', eyes: { expr: 'happy', lx: -.5 } }); }
    else {
      const k = ease(t, tJudge - .2, .6);
      mabel(g, lerp(-200, 250, k), SF, .55, { t, eyes: { expr: t > tBest ? 'happy' : 'open', lx: .5 }, L: 'hips', R: 'flex' });
      person(g, lerp(1300, 850, k), SF, .6, { t, kind: 'customer', eyes: { expr: t > tBest ? 'happy' : 'open', lx: -.5 } });
      person(g, lerp(1300, 720, k), SF + 30, .5, { t, kind: 'pat', eyes: { expr: t > tBest ? 'happy' : 'open', lx: -.5 } });
      if (t > tServes) label(g, 'THE USERS', 540, 880, 72, { font: DISPLAY, col: CREAM, ow: .2 });
    }
    g.restore();
  }, { id: 'bd-bag' });
  irisJoin(chorus3 - .05, { close: .4, open: .5, x: 540, y: 1100 });
}
