// Chorus 3, the finale: the whole company on the theatre stage, in full colour, Busby Berkeley style.
//  (the band's fill) — the main curtain flies up on the whole company: Clawd with his glass, Press,
//     Stress and Guess, the three new little Clawds in propeller beanies, Mabel, Pat, Sam, the goose,
//     and a few useful checks with red and green flags.
//  "Did you actually test it?" — in the band's stop they all freeze, pointing straight out at you.
//  "Press it, stress it, second-guess it!" — the little Clawds, one move each on its word: one slams
//     a big button, one strains at a barbell, one peers through a glass and wonders.
//  "Find a clue? Congratulations!" — Clawd's glass finds the beetle in the gym app's code on the pink
//     phone; the company's gloves reach in from every side and slap a burst of the crew's "?!" stickers
//     on it, and Mabel hoists Clawd overhead.
//  "Now pursue its implications." — a conga line follows the trail of footprints across the stage.
//  "What did you try? What did you find?" — from overhead, as the film opened with its giant tick:
//     the company, lying on the boards, makes a giant magnifying glass that sweeps along the trail,
//     and at "find?" it finds the beetle, magnified in the lens, and a "?!" lands beside it. Testing,
//     not ticking.
//  "What changed your mind?" — the glass becomes a lightbulb and lights up gold, and every flag and
//     hat turns gold with it; then the company takes its bow.
import { W, H, TAU, clamp, lerp, now, wordsOf, hash, noise, rng, beatPos, easeOut, easeIn, easeInOut, backOut, bell, mono, setMono } from '../kit.js';
import { INK, CREAM, GOLD, GOLD_SH, GREEN, RED, WHITE, CORAL, TEAL, ROSE, OCHRE, C } from '../palette.js';
import { shot } from '../shots.js';
import { LEAD } from '../lyrics.js';
import { theatre, mainCurtain, TH } from '../places.js';
import { stageTop, TOP } from '../places-stage.js';
import { clawd } from '../clawd.js';
import { guess, press, stress, check } from '../crew.js';
import { mabel, critter } from '../people.js';
import { bug, magnifier } from '../cast.js';
import { buzzer, barbell, firework, footprint, youGlove, kettlebell } from '../props-c3.js';
import { mabelPhone, reach } from '../props-gym.js';
import { gymPhone, codeScreen, sticker } from '../gymapp.js';
import { qmark, sweat, pops, star } from '../rig.js';
import { look, place, cam, floorCam, ramp, pop, ease, kick, shakeAt, sparkle, footShadow, burst, confetti } from '../common.js';
import { light } from '../bg.js';
import { shape, stroke, ellipse, spline, dot, hose, glove } from '../ink.js';

const F = TH.floor, CX = TH.cx;
const fc = (x, z) => floorCam(x, z, F);
const BEANIE = { mint: '#7fc4a8', gold: '#ebb942', lilac: '#a990c9' };
// The theatre, baked with its colour on whenever it's first asked for.
const stage = () => { const m = mono(); setMono(0); const c = theatre(); setMono(m); return c; };
// A warm pool of stage light on the boards and up the air above them.
function pool(g, x, y, r, a = .4, col = '#ffe6b0') {
  light(g, x, y - r * .2, r * 1.2, col, a * .5, r * .7);
  g.save(); g.globalCompositeOperation = 'screen'; g.translate(x, y); g.scale(1, .26);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, `rgba(255,236,190,${a})`); gr.addColorStop(1, 'rgba(255,236,190,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.restore();
}

// ---------------------------------------------------------------- the company
// Each member: kind, place, scale, and a little character of its own (phase, flag colour, beanie).
const TABLEAU = [
  // the top riser: a few useful checks, red and green, and on three of the greens the testers' "?!"
  // (slapped on as the curtain rises): green isn't the end of it
  { k: 'check', x: 470, y: 1192, s: .58, flag: GREEN, ph: 0, st: 147.72 }, { k: 'check', x: 600, y: 1192, s: .58, flag: RED, ph: .7 }, { k: 'check', x: 730, y: 1192, s: .58, flag: GREEN, ph: 1.4 },
  { k: 'check', x: 970, y: 1192, s: .58, flag: GREEN, ph: 2.1, st: 148.02 }, { k: 'check', x: 1100, y: 1192, s: .58, flag: RED, ph: 2.8 }, { k: 'check', x: 1230, y: 1192, s: .58, flag: GREEN, ph: 3.5, st: 148.32 },
  // the middle riser: the users
  { k: 'cat', x: 520, y: 1312, s: .5, ph: .3 }, { k: 'mabel', x: 850, y: 1312, s: .5, ph: .1 }, { k: 'pup', x: 1150, y: 1312, s: .48, ph: .6 }, { k: 'goose', x: 1290, y: 1312, s: .5, ph: .9 },
  // the front riser: the three little Clawds and the big crew
  { k: 'stress', x: 600, y: 1432, s: .56, ph: .4 }, { k: 'little', x: 440, y: 1432, s: .42, hat: 'mint', ph: .2 }, { k: 'little', x: 1260, y: 1432, s: .42, hat: 'lilac', ph: .5 },
  { k: 'guess', x: 1062, y: 1432, s: .58, ph: .8 },
  // the boards: Press, Clawd with his glass, and the gold little Clawd
  { k: 'press', x: 640, y: 1630, s: .62, ph: .3 }, { k: 'clawd', x: CX, y: 1636, s: .92, ph: 0 }, { k: 'little', x: 1080, y: 1632, s: .45, hat: 'gold', ph: .6 },
].sort((a, b) => a.y - b.y);
const HAT = m => m.hat ? BEANIE[m.hat] : null;
// Where a check's flag cloth flies, as crew.js draws it (flag raised `up`, waving in time t).
function flagCloth(x, y, s, t, phase, up = 1, hop = 0) {
  const bw = 92 * s, bh = 118 * s, cy = y - 30 * s - bh / 2 - hop * 40 * s;
  const hx = x - bw / 2 - 28 * s, hy = cy + 4 * s + lerp(20, -26, up) * s;
  const sa = -Math.PI / 2 + lerp(1.5, 0, up) * .9 + Math.sin(t * 9 + phase) * .14 - .1, dxs = Math.cos(sa), dys = Math.sin(sa);
  const sx2 = hx + dxs * 104 * s, sy2 = hy + 14 * s + dys * 104 * s;
  return [sx2 - dys * 32 * s - dxs * 22 * s, sy2 + dxs * 32 * s - dys * 22 * s];
}
// Draw one member. pose: 'tada' (arms up, bouncing to the fill), 'point' (at you), 'bow', 'still'.
// o.gold (0..1) turns flags and beanies gold; o.dance overrides the bounce.
function member(g, m, tq, pose, o = {}) {
  const t = tq + (m.ph || 0) * .05, dance = o.dance ?? (pose === 'tada' ? .9 : .5), gold = o.gold ?? 0;
  const at = pose === 'point', bow = pose === 'bow' ? (o.bow ?? 1) : 0, s = m.s;
  const you = (g, x, y, a, ss) => youGlove(g, x, y, ss * 1.15, { seed: 9900 + m.x, tilt: (m.x - CX) / 1400 });
  const happy = pose === 'bow' || (pose === 'tada' && Math.sin(tq * 3 + m.x) > .3);
  const eyesAt = { lx: at ? (CX - m.x) / 900 : 0, ly: at ? .35 : 0, expr: happy ? 'happy' : 'open' };
  const hatCol = HAT(m) ? (gold > 0 ? GOLD : HAT(m)) : null;
  if (m.k === 'check') {
    const up = pose === 'bow' ? 1 - bow * .4 : 1, hop = pose === 'tada' ? kick(tq, Math.floor(tq / .28) * .28, .1) * .3 : 0;
    const r = check(g, m.x, m.y, s, { t, flag: up, flagCol: gold > .5 ? GOLD : m.flag, wave: true, phase: m.ph * 3, hop, look: (CX - m.x) / 600, seed: m.x });
    if (m.st != null && tq >= m.st) { const [fx, fy] = flagCloth(m.x, m.y, s, t, m.ph * 3, up, hop); sticker(g, fx + 6 * s, fy + 4 * s, 34 * s, { p: ramp(tq, m.st, .08), ang: -.3, since: tq - m.st }); }
    return r;
  }
  if (m.k === 'clawd' || m.k === 'little') {
    const glass = m.k === 'clawd';
    const R = at ? { to: [.18, .02], pose: 'fist' } : pose === 'tada' ? (glass ? { to: [.28, -.66], pose: 'grip' } : 'up') : pose === 'bow' ? { to: [.0, .1], pose: 'open' } : 'hips';
    const L = at ? 'hips' : pose === 'tada' ? 'up' : pose === 'bow' ? (glass ? { to: [.0, -.55], pose: 'grip' } : 'down') : 'hips';
    return clawd(g, m.x, m.y, s, { t, dance, phase: m.ph, hat: glass ? 'boater' : 'beanie', hatCol, hatTip: glass && pose === 'bow' ? bow : 0, L, R,
      hold: { R: at ? you : glass && pose === 'tada' ? (g, x, y, a, ss) => magnifier(g, x, y, -1.2, ss * .55) : null, L: glass && pose === 'bow' ? null : null },
      eyes: { ...eyesAt, expr: pose === 'bow' ? 'shut' : eyesAt.expr }, sing: pose === 'bow' ? .2 : true, squash: bow * .14, smile: 1 });
  }
  if (m.k === 'guess') return guess(g, m.x, m.y, s, { t, dance, phase: m.ph, bang: at ? 1 : 0, L: at ? 'hips' : pose === 'tada' ? 'cheer' : 'hang', R: at ? { to: [.4, .15], pose: 'fist' } : pose === 'tada' ? 'up' : pose === 'bow' ? 'down' : 'hips', hold: { R: at ? you : null }, eyes: { ...eyesAt, expr: pose === 'bow' ? 'happy' : eyesAt.expr }, sing: pose !== 'bow', lean: bow * .1 });
  if (m.k === 'press') return press(g, m.x, m.y, s, { t, dance, phase: m.ph, L: at ? 'hips' : pose === 'tada' ? 'up' : 'hang', R: at ? { to: [1.05, .1], pose: 'fist' } : pose === 'tada' ? 'cheer' : 'down', hold: { R: at ? you : null }, eyes: { ...eyesAt }, sing: pose !== 'bow', pressed: pose === 'tada' ? kick(tq, Math.floor(tq / .56) * .56, .12) : 0 });
  if (m.k === 'stress') return stress(g, m.x, m.y, s, { t, dance, phase: m.ph, L: at ? 'hips' : pose === 'tada' ? 'cheer' : 'hang', R: at ? { to: [.5, .3], pose: 'fist' } : pose === 'tada' ? 'up' : 'hips', hold: { R: at ? you : null }, eyes: { ...eyesAt, expr: happy ? 'happy' : 'open' }, sing: pose !== 'bow', steam: pose === 'tada' ? .7 : 0, gauge: .6 });
  if (m.k === 'mabel') return mabel(g, m.x, m.y, s, { t, dance, phase: m.ph, L: at ? 'hips' : pose === 'tada' ? 'flex' : pose === 'bow' ? 'hug' : 'hips', R: at ? { to: [.55, .25], pose: 'fist' } : pose === 'tada' ? 'up' : pose === 'bow' ? 'out' : 'hips', hold: { R: at ? you : null }, eyes: { ...eyesAt }, sing: pose !== 'bow', crouch: bow });
  return critter(g, m.x, m.y, s, { t, kind: m.k, dance, phase: m.ph, L: at ? 'hips' : pose === 'tada' ? 'up' : 'hang', R: at ? { to: [.45, .25], pose: 'fist' } : pose === 'tada' ? 'up' : pose === 'bow' ? 'hips' : 'hang', hold: { R: at ? you : null }, eyes: { ...eyesAt }, sing: pose !== 'bow', lean: bow * .12 });
}

export function register() {
  const T = (line, i) => wordsOf(line, 2)[i].s - LEAD;
  const D = 'Did you actually', P = 'Press it, stress it', FC = 'Find a clue', N = 'Now pursue', WT = 'What did you try', WC = 'What changed your';
  const [tDid, , tActually, tTest, tIt] = [0, 1, 2, 3, 4].map(i => T(D, i));
  const [tPress, , tStress, , tSecond, tIt2] = [0, 1, 2, 3, 4, 5].map(i => T(P, i));
  const [tFind, , tClue, tCongrats] = [0, 1, 2, 3].map(i => T(FC, i));
  const [tNow, tPursue, , tImpl] = [0, 1, 2, 3].map(i => T(N, i));
  const [tWhat, , , tTry, tWhat2, , , tFindQ] = [0, 1, 2, 3, 4, 5, 6, 7].map(i => T(WT, i));
  const [tWhatC, tChanged, , tMind] = [0, 1, 2, 3].map(i => T(WC, i));
  const t0 = 147.34, tUp = 147.42, c2a = tPress - .05, c2b = tStress - .05, c2c = tSecond - .08, c3 = 152.5, c4 = tNow - .05, c5 = tWhat - .05, c6 = 164.9, tEnd = 166.7;
  const STOP = [148.87, 149.63];

  // ---- 1. the curtain flies up on the whole company; in the band's stop, they point at you
  shot(t0, c2a, (g, t) => {
    const tq = now(), stop = tq > STOP[0] && tq < STOP[1];
    const c = cam([[t0, fc(CX, .74)], [148.3, fc(CX, .8)], [tDid, fc(CX, .84)], [tDid + .12, fc(CX, .92)], [STOP[1], fc(CX, .97)], [149.75, fc(CX, 1.04)], [c2a, fc(CX, 1.06)]], t);
    c.y += shakeAt(t, 149.7, 8, .25);
    g.save(); place(g, stage(), c);
    pool(g, CX, F - 20, 620, .45);
    // two searchlights from the flies, criss-crossing the company on the band's fill
    const sl = clamp(ramp(t, tUp + .1, .3) * (1 - ramp(t, tDid - .1, .3)));
    if (sl > 0) {
      g.save(); g.globalCompositeOperation = 'screen';
      for (const [sx, ph] of [[260, 0], [1440, Math.PI]]) {
        const fx = CX + Math.sin(t * 4.2 + ph) * 420, gr = g.createLinearGradient(sx, 300, fx, F);
        gr.addColorStop(0, `rgba(255,244,214,${.05 * sl})`); gr.addColorStop(1, `rgba(255,236,200,${.3 * sl})`);
        g.fillStyle = gr; g.beginPath(); g.moveTo(sx - 18, 300); g.lineTo(sx + 18, 300); g.lineTo(fx + 170, F); g.lineTo(fx - 170, F); g.closePath(); g.fill();
      }
      g.restore();
    }
    const pose = tq < tDid ? 'tada' : 'point';
    for (const m of TABLEAU) { footShadow(g, m.x, m.y, m.k === 'mabel' ? 160 : m.k === 'check' ? 70 : 110 * m.s / .5, .3); member(g, m, tq, pose, { dance: stop ? 0 : pose === 'point' ? .25 : .9 }); }
    // the curtain, flying up on the fill
    mainCurtain(g, easeInOut(ramp(t, tUp, .72)), t);
    if (tq > tDid && tq < tDid + .3) for (const m of TABLEAU) if (m.k !== 'check') pops(g, m.x, m.y - 200 * m.s / .5, 40 * m.s / .5, 5, { a0: -Math.PI * .85, span: Math.PI * .7, w: 4 });
    g.restore();
  }, { id: 'c3-company' });

  // ---- 2. Press it, stress it, second-guess it: the little Clawds, one move each, each on the app
  const LS = .78, LX = 790, APX = 1010;
  // Mabel's gym app on its pink phone, squashed by `sq` (0..1) under a load, wincing if `wince`
  const app = (g, tq, x, sq = 0, o = {}) => {
    g.save(); g.translate(x, F - 10); g.scale(1 + sq * .22, 1 - sq * .26); g.translate(-x, -(F - 10));
    mabelPhone(g, x, F - 10, .5, { wifi: null, rows: [{}, {}, {}] }, { t: tq, dance: .3, eyes: { expr: o.wince ? 'shut' : o.eyes || 'open', lx: -.7 }, lean: o.lean ?? 0 });
    g.restore();
  };
  shot(c2a, c2b, (g, t) => {
    const tq = now();
    const c = cam([[c2a, fc(890, 1.86)], [c2b, fc(896, 1.96)]], t);
    c.y += shakeAt(t, tPress + .02, 8, .2);
    g.save(); place(g, stage(), c);
    pool(g, 890, F - 20, 320, .5);
    const jabbing = tq > tPress - .02, jab = jabbing ? (Math.floor(tq * 12) % 2) : 0;
    footShadow(g, LX, F - 14, 220, .4); footShadow(g, APX, F - 10, 170, .4);
    app(g, tq, APX, 0, { wince: jabbing, lean: -jab * .04 });
    // jab, jab, jab at the app's screen
    const tx = APX - 30 + jab * 22, ty = F - 160 + jab * 8;
    clawd(g, LX, F - 14, LS, { t: tq, hat: 'beanie', hatCol: BEANIE.mint, dance: .5, L: 'hips', R: { to: [(tx - (LX + 300 * LS * .52)) / (300 * LS), (ty - (F - 14 - 54 * LS - 107 * LS + 17 * LS)) / (300 * LS)], pose: 'point', ang: .1 }, eyes: { expr: jabbing ? 'happy' : 'open', lx: .8, ly: .2 }, sing: true, lean: .06 });
    if (jabbing) pops(g, tx + 14, ty - 6, 46, 6, { a0: -Math.PI * .8, span: Math.PI * 1.2, w: 4 });
    g.restore();
  }, { id: 'c3-press' });
  shot(c2b, c2c, (g, t) => {
    const tq = now();
    const c = cam([[c2b, fc(880, 1.86)], [c2c, fc(880, 1.94)]], t);
    c.y += shakeAt(t, tStress + .12, 12, .25);
    g.save(); place(g, stage(), c);
    pool(g, 880, F - 20, 320, .5);
    // up goes a giant kettlebell, and down it comes on the app
    const lift = easeOut(ramp(tq, c2b, .1), 2), drop = easeIn(ramp(tq, tStress, .13), 2), landed = tq >= tStress + .13;
    const sq = landed ? .55 + Math.sin((tq - tStress) * 30) * .06 * Math.exp(-(tq - tStress) * 4) : 0;
    footShadow(g, LX - 30, F - 14, 220, .4); footShadow(g, APX, F - 10, 190, .45);
    const phoneTop = F - 10 - (40 + 560) * .5 * (1 - sq * .26);
    const kx = lerp(LX + 40, APX, drop), ky = landed ? phoneTop + 4 : lerp(F - 330 - lift * 30, phoneTop + 4, drop);
    app(g, tq, APX, sq, { wince: landed, eyes: landed ? 'shut' : 'open', lean: 0 });
    if (landed) { sweat(g, APX - 110, phoneTop + 60, .9); sweat(g, APX + 100, phoneTop + 90, .8); }
    kettlebell(g, kx, ky, 1.15);
    const hy = ky - 60 * 1.15 * 1.55, hx = kx;
    const reachTo = (side) => ({ to: [((hx + (side === 'L' ? -26 : 26)) - (LX - 30 + (side === 'L' ? -1 : 1) * 300 * LS * .52)) / ((side === 'L' ? -1 : 1) * 300 * LS), (hy - (F - 14 - 54 * LS - 107 * LS + 17 * LS)) / (300 * LS)], pose: 'grip' });
    clawd(g, LX - 30, F - 14, LS, { t: tq, hat: 'beanie', hatCol: BEANIE.gold, dance: .2, L: landed ? 'cheer' : reachTo('L'), R: landed ? { to: [.5, -.1], pose: 'open' } : reachTo('R'), squash: landed ? 0 : .12, eyes: { expr: landed ? 'happy' : 'shut' }, sing: true, kick: landed ? kick(tq, tStress + .2, .3) : 0 });
    if (tq > tStress + .1 && tq < tStress + .45) pops(g, APX, phoneTop, 130, 9, { a0: -Math.PI, span: Math.PI, w: 7 });
    g.restore();
  }, { id: 'c3-stress' });
  shot(c2c, c3, (g, t) => {
    const tq = now();
    const c = cam([[c2c, fc(880, 1.86)], [c3, fc(880, 1.98)]], t);
    g.save(); place(g, stage(), c);
    pool(g, 880, F - 20, 320, .5);
    footShadow(g, LX - 20, F - 12, 240, .45); footShadow(g, APX, F - 10, 170, .4);
    const look = tq > tIt2 ? 1 : 0;
    app(g, tq, APX, 0, { eyes: 'worried', lean: -.05 });
    if (tq > tSecond + .2) sweat(g, APX + 90, F - 330, .8);
    clawd(g, LX - 20, F - 12, LS, { t: tq, hat: 'beanie', hatCol: BEANIE.lilac, dance: .3, L: 'chin', R: { to: [.1, -.36], pose: 'grip' }, face: .3,
      hold: { R: (g, x, y, a, s) => magnifier(g, x, y, -2.2 + look * .3, s * .8, { inside: (g, lx, ly, r) => { g.fillStyle = C('#f4efe2'); g.fillRect(lx - r, ly - r, r * 2, r * 2); shape(g, ellipse(lx + 6, ly, r * .5, r * .62), { fill: WHITE, w: 5, seed: 931, form: false }); dot(g, lx + 18 + Math.sin(tq * 4) * 4, ly + 4, r * .26); } }) },
      eyes: { expr: 'open', lx: look ? 0 : .9, cock: .9 }, sing: true });
    if (tq > tSecond + .1) { const q = backOut(ramp(tq, tSecond + .1, .25), 2.4); g.save(); g.translate(LX + 120, F - 380); g.scale(q, q); qmark(g, 0, 0, 120, ROSE, { seed: 941 }); g.restore(); }
    g.restore();
  }, { id: 'c3-guess' });

  // ---- 3. Find a clue? Congratulations! The glass finds the beetle in the app; the crew slap on "?!"
  const PHX = 960, PHS = .62, MX = 560, MS = .62, CLX = 760, PRX = 1110, PRS = .52, GSX = 1245, GSS = .6;
  // where the beetle sits in the app's code on the pink phone (codeScreen's row 2, its last bar's end)
  const BUG = [PHX + 38, 1406];
  // the stickers Press and Guess slap on the find: when, where on the phone, how big, whose hand
  const SLAPS = [[.04, [44, -84], 34, 'guess'], [.12, [52, 44], 32, 'press'], [.2, [-34, -26], 34, 'guess'], [.28, [-42, 78], 30, 'press'], [.36, [8, -146], 30, 'guess'], [.44, [30, 130], 28, 'press']];
  shot(c3, c4, (g, t) => {
    const tq = now();
    const c = cam([[c3, fc(880, 1.12)], [tFind, fc(895, 1.2)], [tCongrats, fc(905, 1.0)], [c4, fc(905, .95)]], t);
    g.save(); place(g, stage(), c);
    pool(g, 900, F - 20, 520, .5);
    const hoist = easeOut(ramp(tq, tCongrats + .06, .34), 2), found = tq > tFind;
    footShadow(g, MX, F - 10, 250, .4); footShadow(g, PHX, F - 10, 200, .4);
    mabel(g, MX, F - 10, MS, { t: tq, L: hoist > .05 ? 'lift' : 'hips', R: hoist > .05 ? 'lift' : 'hips', eyes: { expr: hoist > .5 ? 'happy' : 'open', lx: .6, ly: .2 }, sing: true, crouch: kick(tq, tCongrats + .06, .2) });
    // the app on its pink phone: its code on the screen, the beetle in one row; it winces under the stickers
    const slapped = SLAPS.filter(([d]) => tq >= tCongrats + d).length;
    gymPhone(g, PHX, F - 10, PHS, codeScreen(tq, { look: found ? .8 : -.4 }), { t: tq, eyes: { expr: slapped ? 'shut' : found ? 'worried' : 'open', lx: -.6 }, lean: Math.sin(tq * 40) * .02 * Math.min(1, slapped) });
    // Clawd, his glass on the screen, until Mabel scoops him up
    const cx = lerp(CLX, MX, hoist), cy = lerp(F - 12, F - 10 - 600 * MS, hoist) - Math.sin(hoist * Math.PI) * 60;
    if (hoist <= 0) footShadow(g, cx, F - 12, 230, .4);
    const lens = (g, x, y, a, sc) => magnifier(g, x, y, hoist > .5 ? -1.9 : -.62, sc * .62, { inside: hoist < .3 ? (g, lx, ly, r) => { g.fillStyle = C('#fdf5f0'); g.fillRect(lx - r, ly - r, r * 2, r * 2); g.fillStyle = C('#2f8f88'); g.fillRect(lx - r, ly - 26, r * .9, 14); g.fillStyle = C('#d9a23c'); g.fillRect(lx - r, ly + 14, r * .7, 14); bug(g, lx + 6, ly + 2, 1.15, { t: tq, dir: -1, look: found ? .9 : -.4 }); } : null });
    clawd(g, cx, cy, .8, { t: tq, dance: hoist > 0 ? .2 : .35, lean: hoist > 0 ? Math.sin(tq * 8) * .05 : .08, L: hoist > .5 ? 'cheer' : 'hips',
      R: hoist > .5 ? { to: [.3, -.7], pose: 'grip' } : { to: [.22, -.3], pose: 'grip' }, hold: { R: lens },
      eyes: { expr: hoist > .5 ? 'happy' : found ? 'wide' : 'open', lx: .7, ly: -.2 }, sing: true, kick: hoist > .5 ? kick(tq, tCongrats + .4, .3) : 0 });
    if (found && tq < tFind + .35) pops(g, BUG[0] + 10, BUG[1] - 90, 70, 6, { a0: -Math.PI, span: Math.PI, w: 5 });
    // the stickers land on the find, and Press and Guess hop in beside the app to slap them on, one after another
    for (const [d, off, r] of SLAPS) { const tl = tCongrats + d; if (tq >= tl) sticker(g, PHX + off[0], 1430 + off[1], r, { p: ramp(tq, tl, .08), ang: (d * 7 % 1) - .5, since: tq - tl }); }
    const inP = easeOut(ramp(tq, tCongrats - .14, .16), 2), inG = easeOut(ramp(tq, tCongrats - .08, .16), 2);
    const slapHand = (who) => { let best = null; for (const [d, off, r, w] of SLAPS) if (w === who) { const tl = tCongrats + d; if (tq > tl - .12 && tq < tl + .12) best = { at: [PHX + off[0], 1430 + off[1]], k: tq < tl ? easeOut(ramp(tq, tl - .12, .12), 2) : 1 - ramp(tq, tl + .04, .08) }; } return best; };
    if (inG > 0) {
      const gx = lerp(GSX + 420, GSX, inG), o = { t: tq, dance: .5, lean: 0, jump: Math.sin(inG * Math.PI) * .6 }, h = slapHand('guess');
      footShadow(g, gx, F - 10, 150, .35);
      const L = h ? reach('guess', gx, F - 10, GSS, 'L', [lerp(gx - 120, h.at[0] + 10, h.k), lerp(F - 300, h.at[1] + 6, h.k)], { ...o, pose: 'flat', ang: Math.PI + .3 }) : 'cheer';
      guess(g, gx, F - 10, GSS, { ...o, bang: 1, face: -.5, L, R: 'up', eyes: { expr: 'happy' }, sing: true });
    }
    if (inP > 0) {
      const px = lerp(PRX + 440, PRX, inP), o = { t: tq, dance: .6, lean: 0, jump: Math.sin(inP * Math.PI) * .7 }, h = slapHand('press');
      footShadow(g, px, F - 10, 120, .35);
      const L = h ? reach('press', px, F - 10, PRS, 'L', [lerp(px - 90, h.at[0] + 10, h.k), lerp(F - 200, h.at[1] + 6, h.k)], { ...o, pose: 'flat', ang: Math.PI + .2 }) : 'up';
      press(g, px, F - 10, PRS, { ...o, face: -.5, L, R: 'cheer', eyes: { expr: 'happy' }, sing: true, pressed: kick(tq, tCongrats + .12, .1) });
    }
    g.restore();
    if (tq > tCongrats) confetti(g, t, tCongrats, 60, { seed: 961 });
  }, { id: 'c3-clue' });

  // ---- 4. Now pursue its implications: a conga line follows the footprints across the stage
  const LINE = [['guess', .62], ['clawd', .7], ['press', .6], ['stress', .56], ['mabel', .48], ['little', .44, 'mint'], ['little', .44, 'gold'], ['little', .44, 'lilac'], ['cat', .5], ['pup', .48], ['goose', .5], ['check', .55], ['check', .55]];
  const GAP = [0, 190, 175, 165, 175, 160, 130, 130, 130, 125, 125, 125, 110];
  const lead = t => lerp(820, 1480, ramp(t, c4 - .2, c5 - c4 + .2));
  const pathY = x => 1590 + Math.sin(x / 260) * 26;
  shot(c4, c5, (g, t) => {
    const tq = now(), lx = lead(t);
    const c = cam([[c4, fc(700, 1.24)], [c5, fc(1300, 1.24)]], t);
    g.save(); place(g, stage(), c);
    pool(g, lx - 300, F - 30, 700, .4);
    // the footprints: ahead of the line, a trail of them leading off to the right
    for (let k = 0; k < 30; k++) { const x = 160 + k * 58, y = pathY(x) + 34; footprint(g, x, y, 1.5, -.04, k % 2 ? 1 : -1, x > lx - 30 ? 1 : .4); }
    const kickAmt = bell(((beatPos(tq) % 2) + 2) % 2 - 1.5, .22);
    let x = lx;
    const drawn = [];
    LINE.forEach(([k, s, hat], i) => { x -= GAP[i]; drawn.push({ k, s, hat, x, y: pathY(x) + (i % 2 ? 6 : 0), i }); });
    for (const m of drawn.slice().sort((a, b) => a.y - b.y)) {
      const walk = tq * 2.2 + m.i * .37, kk = m.i > 0 ? kickAmt : 0, eyes = { lx: .7, ly: m.i === 0 ? .6 : 0, expr: m.i % 3 === 1 ? 'happy' : 'open' };
      footShadow(g, m.x, m.y, 120 * m.s / .5, .35);
      const hand = { to: [.62, -.12], pose: 'open' };
      if (m.k === 'guess') guess(g, m.x, m.y, m.s, { t: tq, walk, face: .6, lean: .22, L: 'hips', R: { to: [1.1, .55], pose: 'grip' }, hold: { R: (g, x, y, a, s) => magnifier(g, x, y, .55, s * .7) }, eyes: { lx: .8, ly: .8 }, sing: true, bang: .3 + .7 * clamp(Math.sin(tq * 6)) });
      else if (m.k === 'clawd' || m.k === 'little') clawd(g, m.x, m.y, m.s, { t: tq, walk, face: .5, hat: m.k === 'clawd' ? 'boater' : 'beanie', hatCol: BEANIE[m.hat], R: hand, L: 'hips', kick: kk, eyes, sing: true });
      else if (m.k === 'press') press(g, m.x, m.y, m.s, { t: tq, walk, face: .5, R: { to: [1.1, -.2], pose: 'open' }, L: 'hips', kick: kk, eyes, sing: true });
      else if (m.k === 'stress') stress(g, m.x, m.y, m.s, { t: tq, walk, face: .5, R: { to: [1.0, -.3], pose: 'open' }, L: 'hips', kick: kk, eyes, sing: true, steam: .5 });
      else if (m.k === 'mabel') mabel(g, m.x, m.y, m.s, { t: tq, walk, R: { to: [.9, -.1], pose: 'open' }, L: 'hips', eyes, sing: true });
      else if (m.k === 'check') check(g, m.x, m.y, m.s, { t: tq, march: true, flag: 1, flagCol: m.i % 2 ? GREEN : RED, wave: true, phase: m.i, look: .8 });
      else critter(g, m.x, m.y, m.s, { t: tq, kind: m.k, walk, R: { to: [.8, -.2], pose: 'open' }, L: 'hang', eyes, sing: true });
    }
    g.restore();
  }, { id: 'c3-conga' });

  // ---- 5. Overhead: the company lies on the boards as a giant magnifying glass, sweeping the trail;
  //         at "find?" the beetle swells in its lens. Then the glass becomes a lightbulb and lights up.
  const RING = [['clawd', .42], ['cat', .36], ['little', .3, 'mint'], ['stress', .36], ['goose', .36], ['guess', .32], ['mabel', .3], ['little', .3, 'gold'], ['press', .38], ['pup', .34], ['little', .3, 'lilac'], ['check', .42]];
  const HANDLE = 5, RR = 232, OC = [W / 2, 712];
  // the trail on the floor (floor coordinates, its own pixels), and the beetle at its end
  // (level across the boards, so the stage's edge and the stalls stay just under the lyric as the glass sweeps)
  const TRAIL = []; for (let k = 0; k < 26; k++) TRAIL.push([950 + k * 28 + Math.sin(k * .5) * 22, 1300 + Math.cos(k * .7) * 16]);
  const BEETLE = [TRAIL[TRAIL.length - 1][0] + 70, TRAIL[TRAIL.length - 1][1] - 40];
  const sweep = t => easeInOut(ramp(t, c5, tFindQ + .1 - c5));
  shot(c5, c6, (g, t) => {
    const tq = now(), sw = sweep(t);
    // the floor slides under the glass from the trail's start to the beetle, turning a little
    const u = lerp(TRAIL[0][0] - 60, BEETLE[0], sw), v = lerp(TRAIL[0][1] + 40, BEETLE[1], sw);
    const rot = lerp(.25, -.15, sw) + Math.sin(t * .7) * .02, zoom = lerp(1, 1.06, ramp(t, c5, c6 - c5));
    // after it lights, the camera sinks toward the bulb
    const push = 1 + easeInOut(ramp(t, tMind, c6 - tMind)) * .14;
    g.save(); g.translate(OC[0], OC[1]); g.scale(push, push); g.translate(-OC[0], -OC[1]);
    const floorAt = (gg, k = 1) => { gg.translate(OC[0], OC[1]); gg.scale(zoom * k, zoom * k); gg.rotate(rot); gg.translate(-u, -v); };
    const floorDraw = (gg, k) => {
      gg.save(); floorAt(gg, k); gg.drawImage(stageTop(), 0, 0);
      TRAIL.forEach(([x, y], i) => footprint(gg, x, y, 1.2, Math.atan2(BEETLE[1] - TRAIL[0][1], BEETLE[0] - TRAIL[0][0]), i % 2 ? 1 : -1, .9));
      bug(gg, BEETLE[0], BEETLE[1], .9, { t: tq, dir: 1, rot: -.6, look: k > 1 && sw > .9 ? -.6 : .6, walk: sw > .97 ? null : tq * 2 });
      if (tq > tFindQ + .12) sticker(gg, BEETLE[0] + 64, BEETLE[1] - 56, 34, { p: ramp(tq, tFindQ + .12, .1), ang: .3, since: tq - tFindQ - .12 });
      gg.restore();
    };
    floorDraw(g, 1);
    light(g, OC[0], OC[1], 620, '#ffe2a8', .32);
    // the bulb: the handle's checks run round to make its base; the lens lights gold
    const morph = easeInOut(ramp(tq, tWhatC - .05, tMind - tWhatC)), lit = ramp(tq, tMind - .02, .25), goldK = ramp(tq, tMind + .1, .8);
    const hAng = lerp(lerp(-.7, -2.35, sw), -2.35, morph);
    // the lens: the floor magnified within the ring, and a glint
    g.save(); g.beginPath(); g.arc(OC[0], OC[1], RR - 58, 0, TAU); g.clip();
    floorDraw(g, 1.8);
    g.fillStyle = 'rgba(214,236,232,.18)'; g.fillRect(OC[0] - RR, OC[1] - RR, RR * 2, RR * 2);
    if (lit > 0) {
      g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(OC[0], OC[1], 10, OC[0], OC[1], RR); gr.addColorStop(0, `rgba(255,236,150,${.95 * lit})`); gr.addColorStop(.6, `rgba(255,200,80,${.6 * lit})`); gr.addColorStop(1, `rgba(255,170,60,${.3 * lit})`); g.fillStyle = gr; g.fillRect(OC[0] - RR, OC[1] - RR, RR * 2, RR * 2); g.restore();
      // the filament
      const fil = []; for (let i = 0; i <= 24; i++) { const q = i / 24; fil.push([OC[0] - 70 + q * 140, OC[1] + 10 + Math.sin(q * TAU * 3) * 18]); }
      stroke(g, [[OC[0] - 70, OC[1] + 120], [OC[0] - 70, OC[1] + 10]], { w: 6, seed: 951, taper: false, color: '#8a6a2a' }); stroke(g, [[OC[0] + 70, OC[1] + 120], [OC[0] + 70, OC[1] + 10]], { w: 6, seed: 952, taper: false, color: '#8a6a2a' });
      stroke(g, fil, { w: 9, seed: 953, color: '!#fff6c8', taper: false, raw: true });
    }
    g.restore();
    g.save(); g.strokeStyle = `rgba(255,255,255,${.55 * (1 - lit)})`; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.arc(OC[0], OC[1], RR - 92, -2.5, -1.75); g.stroke(); g.restore();
    // the rays of the lit bulb, behind the company
    if (lit > 0) {
      g.save(); g.globalCompositeOperation = 'screen';
      for (let i = 0; i < 18; i++) {
        const a = i / 18 * TAU + t * .22, r0 = RR + 30, r1 = RR + 240 + Math.sin(t * 5 + i * 2) * 40, wd = .07;
        const gr = g.createRadialGradient(OC[0], OC[1], r0, OC[0], OC[1], r1); gr.addColorStop(0, `rgba(255,220,120,${.6 * lit})`); gr.addColorStop(1, 'rgba(255,200,90,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(OC[0] + Math.cos(a - wd) * r0, OC[1] + Math.sin(a - wd) * r0); g.lineTo(OC[0] + Math.cos(a) * r1, OC[1] + Math.sin(a) * r1); g.lineTo(OC[0] + Math.cos(a + wd) * r0, OC[1] + Math.sin(a + wd) * r0); g.closePath(); g.fill();
      }
      g.restore();
    }
    // the company, lying on their backs: the ring, heads out, then the handle (or the bulb's base)
    const lie = (x, y, ang, h, draw) => { g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2); g.translate(0, h / 2); draw(); g.restore(); };
    const flap = Math.sin(beatPos(tq) * Math.PI);
    RING.forEach(([k, s, hat], i) => {
      const a = i / RING.length * TAU - Math.PI / 2 + .13, x = OC[0] + Math.cos(a) * RR, y = OC[1] + Math.sin(a) * RR;
      const gk = clamp(goldK * 2.2 - Math.abs(((i / RING.length + .25) % 1) - .5) * 2), g1 = gk > .5;
      const up = flap > 0 ? 'up' : 'hips';
      lie(x, y, a, k === 'guess' ? 140 : k === 'mabel' ? 180 : 110, () => {
        if (k === 'clawd' || k === 'little') clawd(g, 0, 0, s, { t: tq, dance: .3, hat: k === 'clawd' ? 'boater' : 'beanie', hatCol: g1 ? GOLD : BEANIE[hat], L: up, R: up, eyes: { expr: lit > .5 ? 'happy' : 'open', ly: -.4 }, sing: true });
        else if (k === 'guess') guess(g, 0, 0, s, { t: tq, dance: .3, bang: lit > .5 ? 1 : 0, L: up, R: up, eyes: { ly: -.4, expr: lit > .5 ? 'happy' : 'open' }, sing: true });
        else if (k === 'press') press(g, 0, 0, s, { t: tq, dance: .3, L: up, R: up, eyes: { ly: -.4, expr: lit > .5 ? 'happy' : 'open' }, sing: true });
        else if (k === 'stress') stress(g, 0, 0, s, { t: tq, dance: .3, L: up, R: up, eyes: { ly: -.4, expr: lit > .5 ? 'happy' : 'open' }, sing: true });
        else if (k === 'mabel') mabel(g, 0, 0, s, { t: tq, dance: .3, L: flap > 0 ? 'up' : 'hips', R: flap > 0 ? 'up' : 'hips', eyes: { ly: -.4, expr: lit > .5 ? 'happy' : 'open' }, sing: true });
        else if (k === 'check') check(g, 0, 0, s, { t: tq, flag: 1, flagCol: g1 ? GOLD : GREEN, wave: true, look: 0 });
        else critter(g, 0, 0, s, { t: tq, kind: k, dance: .3, L: up, R: up, eyes: { ly: -.4, expr: lit > .5 ? 'happy' : 'open' }, sing: true });
      });
    });
    for (let j = 0; j < HANDLE; j++) {
      // a handle of checks, from the ring outward; in the bulb, they run round to stack up as its base
      const ha = hAng, hr = RR + 96 + j * 66, hx = OC[0] + Math.cos(ha) * hr, hy = OC[1] + Math.sin(ha) * hr;
      const row = j < 3 ? 0 : 1, bx = OC[0] + (j < 3 ? (j - 1) * 92 : (j - 3.5) * 92), by = OC[1] + RR + 46 + row * 60;
      const q = clamp(morph * 1.4 - j * .08), arc = Math.sin(q * Math.PI) * 120;
      const x = lerp(hx, bx, q) + Math.cos(hAng + Math.PI / 2) * arc * .3, y = lerp(hy, by, q) - arc * .2;
      const ang = lerp(ha, j < 3 ? 0 : Math.PI, q);
      const gk = clamp(goldK * 2.2 - 1 - j * .1) > .5;
      lie(x, y, ang, 90, () => check(g, 0, 0, .42, { t: tq, flag: 1, flagCol: gk ? GOLD : (j % 2 ? RED : GREEN), wave: true, phase: j }));
    }
    if (lit > 0 && tq < tMind + .5) burst(g, OC[0], OC[1], RR + 80, (tq - tMind) / .5, 18, GOLD, 961);
    if (lit > 0) sparkle(g, OC[0], OC[1], RR + 200, tq, 10, GOLD, 962);
    g.restore();
    // the boards fall into shadow below the formation, a calm band for the lyric, and below it the
    // footlights and the stalls
    const ap = g.createLinearGradient(0, 1090, 0, 1560);
    ap.addColorStop(0, 'rgba(16,9,4,0)'); ap.addColorStop(.3, 'rgba(16,9,4,.8)'); ap.addColorStop(.75, 'rgba(16,9,4,.8)'); ap.addColorStop(1, 'rgba(16,9,4,0)');
    g.fillStyle = ap; g.fillRect(-20, 1080, W + 40, 490);
  }, { id: 'c3-overhead' });

  // ---- 6. The bow, in gold light
  shot(c6, tEnd, (g, t) => {
    const tq = now();
    const c = cam([[c6, fc(CX, .9)], [tEnd, fc(CX, .86)]], t);
    g.save(); place(g, stage(), c);
    pool(g, CX, F - 20, 720, .55, '#ffd27a');
    const bow = easeInOut(ramp(tq, 165.45, .3)) * (1 - easeInOut(ramp(tq, 166.1, .35)) * .6);
    for (const m of TABLEAU) { footShadow(g, m.x, m.y, m.k === 'mabel' ? 160 : m.k === 'check' ? 70 : 110 * m.s / .5, .3); member(g, m, tq, 'bow', { bow, gold: 1, dance: .25 }); }
    g.restore();
    // gold light washing over the stage, and a little glitter
    g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,190,80,.16)'; g.fillRect(0, 0, W, 1100); g.restore();
    sparkle(g, W / 2, 620, 420, tq, 9, GOLD, 971);
  }, { id: 'c3-bow' });
}
