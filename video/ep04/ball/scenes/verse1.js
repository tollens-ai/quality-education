// Verse 1, first half: Clawd's workshop. Everything stands on the workbench.
//  "My "tests"? I paste app code in haste: / A perfect duplication!"
//     He snips the app's own sum (a+b+1) off its tape and pastes it onto a check's card; the two match.
//  "The sums agree! How sweet for me! / (A shared miscalculation.)"
//     2 + 2: the app rings up 5, the check works out 5 and flies its green flag; Clawd has a lollipop.
//     The crew's aside: Guess's glass slides in and shows four beads, and both fives are wrong.
//  "With screenshots, commas cause such dramas: / A red notification."
//     The camera flashes; the new picture says "Hello Pat!" where the check expects "Hello, Pat!".
//     The comma falls out and faints; the check's flag goes red and the alarm bell rings.
//  "My "test"? Fantastic, automatic— / I change its expectation!"
//     His Auto-Accept machine stamps the new picture over the expected one; the flag goes green.
//     Nobody asks whether the comma mattered; it sits on the bench, crying.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, beatPos, easeOut, backOut, smooth } from '../kit.js';
import { INK, CREAM, CARD, TEAL, CORAL, OCHRE, ROSE, ROSE_SH, GOLD, GREEN, RED, WHITE, WOOD, WOOD_SH, GREY, SLATE, MINT, PLUM } from '../palette.js';
import { shot, irisJoin, wipeJoin } from '../shots.js';
import { workshop } from '../places.js';
import { clawd, cane } from '../clawd.js';
import { check } from '../crew.js';
import { magnifier } from '../props.js';
import { register as app, tape, pastePot, brush, scissors, lollipop, camera, photo, comma, bell } from '../props-v1.js';
import { shape, rrect, ellipse, stroke, dot, glove, line, spline } from '../ink.js';
import { label, word, DISPLAY, PATTER, SCRIPT, fitSize } from '../type.js';
import { heart, pops } from '../rig.js';
import { at, ramp, pop, ease, kick, shakeAt, place, cam, burst, sparkle, bubble, floorCam } from '../common.js';
import { LINE_STYLE } from '../lyrics.js';

const BENCH = 1500;   // the workbench top, in world coordinates (the painted bench is at 1640 on the canvas)
const BC = (x, z, atY = 1560) => floorCam(x, z * 1.16, BENCH, atY);

// The card on a check's chest, lettered: a formula, a number, or a tiny photo.
export function cardText(text, col = INK) {
  return (g, x, y, cw, ch, s) => label(g, text, x, y + 2 * s, fitSize(g, text, PATTER, 30 * s, cw - 8 * s), { font: PATTER, col });
}
function miniPhoto(text) {
  return (g, x, y, cw, ch, s) => {
    g.fillStyle = '#e9efe2'; g.fillRect(x - cw / 2 + 5 * s, y - ch / 2 + 5 * s, cw - 10 * s, ch - 10 * s);
    g.fillStyle = TEAL; g.fillRect(x - cw / 2 + 5 * s, y - ch / 2 + 5 * s, cw - 10 * s, 7 * s);
    label(g, text, x, y + 5 * s, fitSize(g, text, DISPLAY, 18 * s, cw - 14 * s), { font: DISPLAY });
  };
}
// A rose arm and glove reaching in from the frame's right edge to (x, y), holding the magnifier.
export function guessGlass(g, x, y, ang, s, inside) {
  line(g, [[W + 80, y + 140 * s], [x + 60 * s, y + 40 * s], [x, y]].map(p => p), { w: 15 * s, taper: false, seed: 4001 });
  const m = magnifier(g, x, y, ang, s, { inside });
  glove(g, x, y, ang + Math.PI, 26 * s, 'grip', { seed: 4002 });
  return m;
}

export function register() {
  const A = 'My "tests"? I paste', B = 'A perfect duplication', C = 'The sums agree', D = 'A shared miscalculation', E = 'With screenshots', F = 'A red notification', G = 'My "test"? Fantastic', Hh = 'I change its expectation';
  LINE_STYLE[D.slice(0, 18)] = { fill: '#f7c6d0', accent: ROSE, font: SCRIPT, rot: -.02 };   // the crew's aside
  const t0 = at(A, 'My') - .12;
  const tPaste = at(A, 'paste'), tApp = at(A, 'app'), tCode = at(A, 'code'), tHaste = at(A, 'haste');
  const tPerf = at(B, 'perfect'), tDup = at(B, 'duplication');
  const tSums = at(C, 'sums'), tAgree = at(C, 'agree'), tSweet = at(C, 'sweet'), tMe = at(C, 'me');
  const tShared = at(D, 'shared'), tMiscalc = at(D, 'miscalculation'), dEnd = wordsOf(D).at(-1).e;
  const tWith = at(E, 'With'), tShots = at(E, 'screenshots'), tCommas = at(E, 'commas'), tDramas = at(E, 'dramas');
  const tRed = at(F, 'red'), tNotif = at(F, 'notification');
  const tMy2 = at(G, 'My'), tFant = at(G, 'Fantastic'), tAuto = at(G, 'automatic');
  const tChange = at(Hh, 'change'), tExpect = at(Hh, 'expectation'), hEnd = wordsOf(Hh).at(-1).e;
  const next = at('To boost my score', 'To') - .1;

  // ---- 1. paste app code (the app and a check on the bench, Clawd between them)
  shot(t0, tSums - .5, (g, t) => {
    const c = cam([[t0, BC(620, 1.12)], [tPerf, BC(600, 1.04)], [tSums, BC(600, 1.06)]], t);
    g.save(); place(g, workshop(), c);
    const snip = ramp(t, tApp, .2), stuck = ramp(t, tCode + .15, .2);
    app(g, 290, BENCH, 1.05, { t, shows: '', lx: .6, ly: .2, smile: 1,
      tape: (g, x, y, s) => { const L = 180 - snip * 60; tape(g, x - L + 10, y, L, -.05, snip < .5 ? 'sum = a+b+1' : '', s * .95); } });
    // the check to the right, its card getting the pasted strip
    const chX = 930, chk = check(g, chX, BENCH, 1.75, { t, card: stuck > .5 ? cardText('a+b+1') : null, flag: 'down' });
    // the strip in flight: from the app's tape to the check's card
    if (t > tApp && t < tCode + .3) {
      const u = easeOut(clamp((t - tApp) / (tCode + .3 - tApp)));
      const fx = lerp(80, chX - 50, u), fy = lerp(1130, chk.cy + 40, u) - Math.sin(u * Math.PI) * 180;
      tape(g, fx, fy, 170, (1 - u) * -.4 + Math.sin(t * 20) * .05, 'sum = a+b+1', .8, { paste: u > .4 });
    }
    // Clawd: scissors in one hand, the paste brush in the other, in a hurry
    const hurry = Math.sin(t * 26) * (t < tHaste + .4 ? 1 : 0);
    const posX = lerp(560, 640, ramp(t, tCode, .3));
    const present = t > tPerf;
    clawd(g, posX, BENCH, 1.0, { t, dance: present ? .8 : .4,
      L: present ? { to: [.55, -.4], pose: 'open' } : { to: [.6, -.2 + hurry * .05], pose: 'grip' },
      R: present ? { to: [.55, -.4], pose: 'open' } : { to: [.5, -.25 - hurry * .08], pose: 'grip' },
      hold: present ? {} : { L: (g, x, y, a, s) => scissors(g, x, y, Math.PI + .3, s * .8, Math.abs(Math.sin(t * 18))), R: (g, x, y, a, s) => brush(g, x, y, -.9 + hurry * .3, s * .8) },
      eyes: { expr: present ? 'happy' : 'open', lx: present ? 0 : .6 }, sing: true, lean: present ? 0 : .08 });
    pastePot(g, 500, BENCH + 30, .8);
    // paste splats (haste)
    for (const [st, sx, sy] of [[tPaste, 430, 1470], [tHaste - .1, 790, 1490], [tHaste + .1, 700, 1520]]) {
      const p = ramp(t, st, .12);
      if (p > 0) shape(g, ellipse(sx, sy, 26 * p, 16 * p, .4), { fill: '#f4f7e6', w: 4, seed: 4100 + sx });
    }
    // "A perfect duplication!": two strips side by side, an equals sign between, sparkle
    if (t > tPerf) {
      const p = pop(t, tPerf, .3);
      g.save(); g.translate(600, 860); g.scale(p * 1.2, p * 1.2);
      shape(g, rrect(-380, -95, 760, 190, 30), { fill: CREAM, w: 8, seed: 4110 });
      tape(g, -350, -28, 290, 0, 'sum = a+b+1', 1, { seed: 1 });
      tape(g, 60, -28, 290, 0, 'sum = a+b+1', 1, { seed: 2, paste: true });
      label(g, 'APP', -205, -60, 30, { font: PATTER, col: TEAL });
      label(g, 'CHECK', 205, -60, 30, { font: PATTER, col: CORAL });
      label(g, '=', 0, 2, 90, { font: DISPLAY, col: GREEN, ow: .12 });
      g.restore();
      sparkle(g, 600, 860, 460, t, 6, GOLD, 41);
    }
    g.restore();
  }, { id: 'v1-paste' });

  // ---- 2. the sums agree (2 + 2 on the app; both say 5), a lollipop; the crew's aside
  shot(tSums - .5, tWith - .35, (g, t) => {
    const c = cam([[tSums - .5, BC(600, 1.06)], [tShared, BC(580, 1.12)], [dEnd, BC(570, 1.16)]], t);
    g.save(); place(g, workshop(), c);
    const k2 = [at(C, 'The') - .1, tSums - .05];
    const pressK = t < k2[0] ? -1 : t < k2[1] ? 7 : t < tAgree - .05 ? 9 : -1;
    const ring = kick(t, tAgree, .35);
    const shows = t < tSums - .05 ? '2 + 2' : t < tAgree ? '2 + 2 =' : '5';
    app(g, 290, BENCH, 1.05, { t, shows, pop: t > tAgree ? pop(t, tAgree, .25) : 1, ring, lx: .5, smile: 1, pressKey: pressK, keyLabels: ['1', '2', '3', '+', '=', 'C', '4', '5', '6', '-', '×', '÷', '7', '8', '9', '0', '.', '%'] });
    const flagUp = pop(t, tAgree + .05, .3);
    const chk = check(g, 930, BENCH, 1.75, { t, card: cardText(t > tAgree ? '2+2 → 5' : 'a+b+1'), flag: clamp(flagUp), flagCol: GREEN, wave: t > tAgree + .3 });
    if (t > tAgree) { burst(g, 290, 1080, 130, (t - tAgree) / .4, 10, GOLD, 3); burst(g, 930, chk.cy, 110, (t - tAgree - .05) / .4, 10, GOLD, 4); label(g, 'DING!', 290, 900 - ramp(t, tAgree, .3) * 30, 80, { font: DISPLAY, col: GOLD, ow: .2 }); }
    // Clawd, delighted, with a lollipop on "sweet"
    const sweet = t > tSweet - .1;
    clawd(g, 610, BENCH, 1.0, { t, dance: .9,
      L: t < tAgree ? { to: [.62, -.1], pose: 'point' } : 'up',
      R: sweet ? { to: [.05, -.12], pose: 'grip' } : 'hips',
      hold: sweet ? { R: (g, x, y, a, s) => lollipop(g, x, y, -1.9, s * .9) } : {},
      eyes: { expr: t > tAgree ? 'happy' : 'open', lx: t < tAgree ? -.6 : 0 }, sing: true, blush: sweet ? 1 : 0 });
    if (sweet) for (let i = 0; i < 3; i++) { const p = ((t - tSweet) * .7 + i / 3) % 1; heart(g, 560 + i * 60 + Math.sin(p * 6) * 12, 1060 - p * 200, 22 * (1 - p * .5), ROSE, 4200 + i); }
    // the aside: Guess's glass slides in from the right over the check's card
    const slide = ease(t, tShared - .45, .45);
    if (slide > 0) {
      const gx = lerp(W + 300, 800, slide), gy = 980;
      guessGlass(g, gx, gy + 150, -2.3, 1.15, (g, x, y, r) => {
        g.fillStyle = '#fbf3e1'; g.fillRect(x - r, y - r, 2 * r, 2 * r);
        // four beads: 2 + 2 is 4
        for (let i = 0; i < 4; i++) shape(g, ellipse(x - 48 + i * 32, y - 18, 13, 13), { fill: i < 2 ? CORAL : TEAL, w: 3, seed: 4300 + i });
        label(g, '= 4', x, y + 34, 44, { font: DISPLAY, col: INK });
      });
      if (t > tMiscalc) { // both fives crossed out
        const p = ramp(t, tMiscalc, .25);
        for (const [x, y] of [[290, 1152], [930, 1330]]) { stroke(g, [[x - 50, y - 40], [x - 50 + 100 * p, y - 40 + 80 * p]], { w: 12, color: RED, seed: 4310 + x }); stroke(g, [[x + 50, y - 40], [x + 50 - 100 * p, y - 40 + 80 * p]], { w: 12, color: RED, seed: 4312 + x }); }
      }
    }
    g.restore();
  }, { id: 'v1-sums' });

  // ---- 3. screenshots: the flash, the comma falls out, a red notification
  shot(tWith - .35, tMy2 - .35, (g, t) => {
    const c = cam([[tWith - .35, BC(560, 1.08)], [tRed, BC(560, 1.02)], [tNotif + .4, BC(560, 1.06)]], t);
    g.save(); place(g, workshop(), c);
    const flash = kick(t, tShots, .3);
    camera(g, 170, BENCH, 1.0, { t, flash });
    // Clawd under the cloth, then popping out to look
    const out = t > tCommas;
    clawd(g, out ? 420 : 110, BENCH, .92, { t, L: out ? 'shrug' : 'hang', R: out ? 'point' : 'hang', eyes: { expr: t > tRed ? 'wide' : 'open', lx: .7 }, sing: true, hat: out ? 'boater' : 'none', dance: .5 });
    // the expected picture pinned on the check; the new one slides out of the camera
    const chk = check(g, 930, BENCH, 1.75, { t, card: miniPhoto('Hello, Pat!'), flag: t > tRed ? pop(t, tRed, .3) : 0, flagCol: RED, wave: t > tRed + .3 });
    const slide = ease(t, tShots + .1, .45);
    if (slide > 0) {
      photo(g, 660, lerp(1300, 760, slide), 1.05, 'Hello, Pat!', { rot: -.04, caption: 'EXPECTED', seed: 1 });
      photo(g, 660, lerp(1300, 1040, ease(t, tShots + .3, .45)), 1.05, t > tCommas ? 'Hello Pat!' : 'Hello, Pat!', { rot: .05, caption: 'NEW', capCol: CORAL, seed: 2, hi: t > tDramas ? [-18, 0] : null, hiP: ramp(t, tDramas, .3) });
    }
    // the comma falls out of the new picture and faints on the bench
    if (t > tCommas) {
      const u = clamp((t - tCommas) / .5), x = lerp(640, 690, u), y = lerp(1040, BENCH - 45, u * u);
      comma(g, x, y, 1.8, { t, swoon: ramp(t, tDramas, .3), shut: t > tDramas + .1, tears: t > tDramas + .3 });
      if (t > tDramas) label(g, 'the comma!', x + 20, y - 110, 40, { font: SCRIPT, col: INK, rot: -.12 });
    }
    // the alarm bell on the wall rings red
    const ring = t > tRed ? Math.max(.3, kick(t, tRed, .8)) : 0;
    bell(g, 960, 760, 1, ring, t);
    if (t > tRed) {
      const p = pop(t, tRed + .1, .3);
      g.save(); g.translate(1040, 690); g.scale(p, p);
      shape(g, ellipse(0, 0, 44, 44), { fill: RED, w: 6, seed: 4400 });
      label(g, '1', 0, 3, 56, { font: DISPLAY, col: WHITE });
      g.restore();
      g.save(); g.globalAlpha = .12 + .08 * Math.sin(t * 20); g.fillStyle = RED; g.fillRect(-500, -500, 3000, 3000); g.restore();
    }
    g.restore();
  }, { id: 'v1-screenshot' });

  // ---- 4. automatic: the Auto-Accept machine stamps the new picture over the expected one
  shot(tMy2 - .35, next, (g, t) => {
    const c = cam([[tMy2 - .35, BC(570, .9)], [tChange, BC(585, .93)], [hEnd, BC(590, .95)]], t);
    g.save(); place(g, workshop(), c);
    const chX = 930;
    // the stamp comes down on "expectation" and bounces back up
    const down = t < tExpect - .12 ? 0 : t < tExpect ? (t - tExpect + .12) / .12 : Math.max(0, 1 - (t - tExpect) / .35);
    const hit = t > tExpect;
    // the check first, so the gantry and stamp are drawn over it
    check(g, chX, BENCH, 1.75, { t, card: miniPhoto(hit ? 'Hello Pat!' : 'Hello, Pat!'), flag: 1, flagCol: hit ? GREEN : RED, wave: true, hop: kick(t, tExpect, .2) });
    // the machine: a brass cabinet on the bench with a gantry over the check
    const mx = 560, my = BENCH;
    stroke(g, [[mx + 60, my - 330], [mx + 60, my - 560], [chX, my - 560]], { w: 20, seed: 4520, taper: false });
    shape(g, rrect(mx - 170, my - 330, 300, 330, 22), { fill: GOLD, shade: '#a9761f', shadeOff: [-12, -12], w: 8, seed: 4500 });
    shape(g, rrect(mx - 150, my - 310, 260, 70, 10), { fill: CREAM, w: 5, seed: 4501 });
    label(g, 'AUTO-', mx - 20, my - 292, 34, { font: PATTER, col: CORAL });
    label(g, 'ACCEPT', mx - 20, my - 258, 34, { font: PATTER, col: CORAL });
    for (let i = 0; i < 3; i++) { const on = Math.floor(t * 6 + i) % 3 === 0; shape(g, ellipse(mx - 80 + i * 60, my - 190, 17, 17), { fill: on ? GOLD : '#7a5a20', w: 4, seed: 4502 + i }); }
    for (const [cx, cy, r, d] of [[mx - 60, my - 90, 46, 1], [mx + 40, my - 80, 34, -1]]) { const P = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + t * 3 * d; const rr = i % 2 ? r : r * 1.25; P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } shape(g, P, { fill: GREY, w: 5, seed: 4510 + r, amt: .3 }); dot(g, cx, cy, 10); }
    // the plunger and stamp on the gantry
    const sy = lerp(my - 520, my - 250, down);
    stroke(g, [[chX, my - 560], [chX, sy]], { w: 16, seed: 4521, taper: false });
    shape(g, rrect(chX - 80, sy - 10, 160, 60, 10), { fill: WOOD, w: 6, seed: 4522 });
    shape(g, rrect(chX - 92, sy + 44, 184, 28, 6), { fill: RED, w: 6, seed: 4523 });
    label(g, 'NEW = EXPECTED', chX, sy + 20, 32, { font: PATTER, col: CREAM });
    if (hit) { burst(g, chX, BENCH - 150, 150, (t - tExpect) / .45, 12, INK, 5); label(g, 'EXPECTED: CHANGED', 690, 700 - ramp(t, tExpect, .3) * 20, 50, { font: PATTER, col: GREEN, ow: .22 }); }
    // the lever on the cabinet's side, and Clawd, who presents his machine and pulls it
    const pull = t > tChange - .2, la = pull ? lerp(-.5, .9, clamp((t - tChange + .2) / .3)) : -.5;
    const lx0 = mx - 170, ly0 = my - 200, lx1 = lx0 + Math.cos(Math.PI + la) * 150, ly1 = ly0 + Math.sin(Math.PI + la) * 150;
    stroke(g, [[lx0, ly0], [lx1, ly1]], { w: 13, seed: 4530, taper: false });
    shape(g, ellipse(lx1, ly1, 20, 20), { fill: RED, w: 5, seed: 4531 });
    clawd(g, 260, BENCH, .82, { t, dance: .8,
      L: pull ? 'up' : 'present', R: pull ? { to: [(lx1 - 260 - 123) / 246, (ly1 - (BENCH - 124)) / 246], pose: 'grip' } : 'present',
      eyes: { expr: 'happy' }, sing: true, hatTip: t > tFant && t < tAuto + .4 ? .5 : 0 });
    // the comma, abandoned on the bench, with a question nobody asks
    comma(g, 1010, BENCH - 50, 1.6, { t, swoon: 1, shut: false, tears: true });
    if (t > tExpect + .3) label(g, '?', 1030, BENCH - 150 - Math.sin(t * 4) * 8, 80, { font: DISPLAY, col: ROSE, ow: .15 });
    g.restore();
  }, { id: 'v1-auto' });
}
