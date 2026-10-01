// Verse 1's three cutaways: why Clawd's "tests" are made this way. "They" are one shadowy figure
// who changes hats: the ringmaster, the teacher, the factory boss.
//  "They've trained me just to make the grade." — the circus: Clawd leaps through the ringmaster's
//     hoop and catches a gold star like a performing seal.
//  "Like kids in class, I aim to pass;" — the schoolroom: Clawd squeezed into a little desk among the
//     pupils; the teacher holds up a gold star; every pupil's eyes turn to stars as they scribble ticks.
//  "The marks decide how tests get made." — match cut: the star is now the die of a factory press; it
//     stamps tin into star-shaped checks that hop off the belt waving green flags. In the band's stop
//     the press rises slowly; on the big piano stab it spits out a heap of them.
import { W, H, TAU, clamp, lerp, now, hash, rng, easeOut, easeInOut, backOut, smooth } from '../kit.js';
import { INK, CREAM, GOLD, GOLD_SH, GREEN, RED, WHITE, TIN, SLATE, C, sh, lt } from '../palette.js';
import { shot } from '../shots.js';
import { circus, ringSpot, CIRCUS, CIRCUS_CROWD, schoolroom, SCHOOL, factory, FACTORY } from '../places-cutaways.js';
import { audienceLive } from '../places.js';
import { clawd } from '../clawd.js';
import { critter } from '../people.js';
import { at, ramp, pop, kick, place, cam, floorCam, sparkle, footShadow, burst, speedLines } from '../common.js';
import { shape, stroke, ellipse, rrect, spline, glove, dot, hose, line } from '../ink.js';
import { star, pops } from '../rig.js';

// "They": a tall silhouette in a long coat, backlit, a hat of the trade. arm: the hand's offset from
// the shoulder; pose of the glove.
function boss(g, x, y, s, hat, arm = [120, -160], pose = 'grip', o = {}) {
  const col = '#1a1014', rim = '#5a3a40';
  const P = spline([[x - 70 * s, y], [x - 80 * s, y - 260 * s], [x - 60 * s, y - 420 * s], [x, y - 450 * s], [x + 60 * s, y - 420 * s], [x + 80 * s, y - 260 * s], [x + 70 * s, y]], true, 5);
  shape(g, P, { fill: col, lit: rim, form: 'round', cx: .8, cy: .3, k: .8, w: 6 * s, seed: 3001 });
  shape(g, ellipse(x, y - 500 * s, 52 * s, 58 * s, 0, 30), { fill: col, lit: rim, form: 'round', cx: .8, k: .8, w: 6 * s, seed: 3002 });
  if (hat === 'top') { shape(g, rrect(x - 44 * s, y - 650 * s, 88 * s, 110 * s, 6 * s), { fill: col, lit: rim, form: 'block', w: 6 * s, seed: 3003 }); shape(g, ellipse(x, y - 545 * s, 80 * s, 14 * s), { fill: col, w: 6 * s, seed: 3004, form: false }); shape(g, rrect(x - 44 * s, y - 575 * s, 88 * s, 18 * s, 3 * s), { fill: '#8a1c22', w: 4 * s, seed: 3005, form: false }); }
  if (hat === 'mortar') { shape(g, [[x - 90 * s, y - 560 * s], [x, y - 600 * s], [x + 90 * s, y - 560 * s], [x, y - 525 * s]], { fill: col, lit: rim, form: 'block', w: 6 * s, seed: 3006 }); stroke(g, [[x, y - 562 * s], [x + 70 * s, y - 540 * s], [x + 80 * s, y - 480 * s]], { w: 4 * s, seed: 3007, color: GOLD }); }
  if (hat === 'bowler') { shape(g, spline([[x - 52 * s, y - 545 * s], [x - 46 * s, y - 600 * s], [x, y - 616 * s], [x + 46 * s, y - 600 * s], [x + 52 * s, y - 545 * s]], true, 5), { fill: col, lit: rim, form: 'round', w: 6 * s, seed: 3008 }); shape(g, ellipse(x, y - 545 * s, 76 * s, 13 * s), { fill: col, w: 6 * s, seed: 3009, form: false }); }
  const shx = x + 60 * s, shy = y - 380 * s, hx = shx + arm[0] * s, hy = shy + arm[1] * s;
  hose(g, [shx, shy], [hx, hy], { w: 22 * s, bend: -.15, seed: 3010, fill: col, lw: 6 * s });
  glove(g, hx, hy, Math.atan2(hy - shy, hx - shx), 26 * s, pose, { seed: 3011 });
  return [hx, hy];
}
// A wind-up check stamped in the shape of a star: one flag, dot eyes, a key.
function starCheck(g, x, y, s, o = {}) {
  const t = o.t ?? now(), cy = y - 70 * s;
  const P = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, r = i % 2 ? 34 * s : 74 * s; P.push([x + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  shape(g, spline(P, true, 2), { fill: TIN, shade: sh(TIN, .38), lit: lt(TIN, .45), form: 'round', w: 5 * s, seed: 3020 + (o.seed ?? 0), gloss: { x: .3, y: .25, w: .1, h: .07, dot: false } });
  for (const d of [-1, 1]) dot(g, x + d * 14 * s, cy - 6 * s, 5.5 * s);
  stroke(g, [[x - 9 * s, cy + 12 * s], [x + 9 * s, cy + 12 * s]], { w: 3.5 * s, seed: 3021 });
  for (const d of [-1, 1]) shape(g, rrect(x + d * 18 * s - 11 * s, y - 20 * s, 22 * s, 20 * s, 5 * s), { fill: SLATE, w: 3.5 * s, seed: 3022 + d, form: false });
  if (o.flag) {
    const fx = x - 66 * s, fy = cy - 20 * s;
    stroke(g, [[fx, fy + 40 * s], [fx, fy - 70 * s]], { w: 5 * s, seed: 3024, taper: false });
    const wv = Math.sin(t * 10 + (o.phase ?? 0)) * 5 * s;
    shape(g, spline([[fx, fy - 70 * s], [fx - 30 * s, fy - 66 * s + wv], [fx - 56 * s, fy - 70 * s], [fx - 52 * s, fy - 46 * s], [fx - 26 * s, fy - 40 * s - wv], [fx, fy - 36 * s]], true, 4), { fill: '!' + GREEN, w: 4 * s, seed: 3025, form: 'block' });
  }
}

export function register() {
  const L1 = "They've trained me", L2 = 'Like kids in class', L3 = 'The marks decide';
  const tThey = at(L1, 'They'), tTrained = at(L1, 'trained'), tMake = at(L1, 'make'), tGrade = at(L1, 'grade');
  const tLike = at(L2, 'Like'), tKids = at(L2, 'kids'), tClass = at(L2, 'class'), tAim = at(L2, 'aim'), tPass = at(L2, 'pass');
  const tThe = at(L3, 'The'), tMarks = at(L3, 'marks'), tDecide = at(L3, 'decide'), tHow = at(L3, 'how'), tTests = at(L3, 'tests'), tMade = at(L3, 'made');
  const t0 = tThey - .1, t1 = tLike - .12, t2 = tThe - .1, t3 = 40.98;
  const STAB = 39.8;

  // ---- the circus: through the hoop, a gold star caught like a fish
  shot(t0, t1, (g, T) => {
    // the leap and the camera that follows it move on every frame; the drawings change on twos
    const F = CIRCUS.floor, t = now();
    const u0 = easeInOut(ramp(T, tTrained - .05, tMake - tTrained + .1));
    const c = { ...floorCam(lerp(600, 860, u0), 1.08, F) };
    g.save(); place(g, circus({ live: true }), c);
    // the crowd, keen from the start, on its feet for the leap
    audienceLive(g, F + 60, CIRCUS.w, t, { ...CIRCUS_CROWD, bop: .45 + .5 * Math.sin(clamp(ramp(t, tTrained - .1, tGrade - tTrained + .3)) * Math.PI) });
    ringSpot(g, 740, F - 10, 420, .6);
    // two pedestals; the hoop between, held out by the ringmaster's long arm
    for (const [px, col] of [[470, '#2f8f88'], [980, '#c24a3a']]) { shape(g, spline([[px - 80, F], [px - 60, F - 150], [px + 60, F - 150], [px + 80, F]], true, 3), { fill: col, form: 'block', w: 6, seed: 3100 + px, gloss: { x: .2, y: .2, w: .06, h: .05 } }); shape(g, ellipse(px, F - 150, 64, 16), { fill: '#e2b84c', w: 5, seed: 3102 + px, form: false }); }
    // the ringmaster presents the hoop, which stands on its own striped pole
    boss(g, 1270, F, .95, 'top', [-190, -40], 'open');
    const hx = 725, hy = F - 330;
    shape(g, ellipse(hx, F - 4, 62, 15), { fill: '#c24a3a', shade: '#7a2a20', form: 'block', w: 5, seed: 3115 });
    shape(g, rrect(hx - 8, hy + 140, 16, F - 4 - (hy + 140), 5), { fill: '#f2e2b0', shade: '#c9b27a', form: 'block', w: 5, seed: 3116 });
    for (let k = 0; k < 4; k++) { const yy = hy + 170 + k * 40; stroke(g, [[hx - 7, yy], [hx + 7, yy - 10]], { w: 7, seed: 3117 + k, color: '#c24a3a', taper: false }); }
    for (let i = 0; i < 2; i++) { g.save(); g.lineWidth = 16 - i * 6; g.strokeStyle = C(i ? '#f2e2b0' : '#c24a3a'); g.setLineDash(i ? [26, 26] : []); g.beginPath(); g.ellipse(hx, hy, 46, 150, 0, 0, TAU); g.stroke(); g.restore(); }
    // Clawd's leap: from the left pedestal, through the hoop, onto the right one
    const u = u0;
    const jx = lerp(470, 980, u), jy = lerp(F - 150, F - 150, u) - Math.sin(u * Math.PI) * 300;
    const catchT = tGrade - .05, starIn = ramp(t, tMake, catchT - tMake);
    clawd(g, jx, jy, .8, { t, dance: u > 0 && u < 1 ? 0 : .5, squash: u > 0 && u < 1 ? -.12 : kick(t, tMake + .05, .2) * .3, lean: u > 0 && u < 1 ? .25 : 0, L: u > 0 && u < 1 ? { to: [.2, -.75], pose: 'open' } : 'hips', R: u > 0 && u < 1 ? { to: [.2, -.75], pose: 'open' } : 'up', eyes: { expr: t > catchT ? 'happy' : 'open', lx: .6, ly: -.5 }, sing: true, hatTip: u > .2 && u < .9 ? .4 : 0 });
    // the redraw of the hoop's front edge so he goes through it
    if (u > .35 && u < .65) { g.save(); g.lineWidth = 16; g.strokeStyle = C('#c24a3a'); g.beginPath(); g.ellipse(hx, hy, 46, 150, 0, -Math.PI / 2, Math.PI / 2); g.stroke(); g.restore(); }
    // the gold star tossed from the ringmaster's other hand, caught in Clawd's mouth
    if (starIn > 0 && t < catchT + .1) { const sx = lerp(1210, 980, starIn), sy = lerp(F - 520, F - 290, starIn) - Math.sin(starIn * Math.PI) * 140; star(g, sx, sy, 34, GOLD, { seed: 3120, rot: t * 8 }); }
    if (t > catchT) { star(g, 980, F - 262, 26, GOLD, { seed: 3121 }); sparkle(g, 980, F - 280, 120, t, 5, GOLD, 3122); }
    if (u > 0 && u < 1) speedLines(g, jx - 120, jy - 100, 1, 90, 4, 3130);
    g.restore();
  }, { id: 'cut-circus' });

  // ---- the schoolroom: a gold star held up; star-eyed pupils scribbling ticks
  shot(t1, t2, (g, T) => {
    const F = SCHOOL.floor;
    const c = cam([[t1, floorCam(760, 1.22, F)], [t2, floorCam(760, 1.3, F)]], T), t = now();
    g.save(); place(g, schoolroom(), c);
    const starUp = pop(t, tAim - .05, .3), starry = t > tAim;
    // the teacher behind the class, holding the star up over them
    const hand = boss(g, 1000, F - 70, .78, 'mortar', [-40, -300], 'grip');
    star(g, hand[0], hand[1] - 40 - starUp * 30, 44 + starUp * 14, GOLD, { seed: 3201, rot: Math.sin(t * 3) * .1 });
    if (starry) sparkle(g, hand[0], hand[1] - 50, 120, t, 6, GOLD, 3202);
    // three little desks, a pupil at each, Clawd squeezed into the middle one
    const desk = (x, s) => { shape(g, rrect(x - 110 * s, F - 160 * s, 220 * s, 26 * s, 6 * s), { fill: '#a8703c', form: 'block', w: 5 * s, seed: 3210 + x }); for (const d of [-1, 1]) stroke(g, [[x + d * 90 * s, F - 136 * s], [x + d * 96 * s, F]], { w: 8 * s, seed: 3211 + x + d, taper: false, color: '#5a3a20' }); shape(g, rrect(x - 70 * s, F - 172 * s, 140 * s, 14 * s, 3 * s), { fill: '#fdf8e8', w: 3 * s, seed: 3213 + x, form: false }); };
    const scrib = Math.sin(t * 40);
    const pupils = [[470, 'bunny'], [1060, 'piglet']];
    for (const [x, kind] of pupils) { critter(g, x, F - 40, .62, { t, kind, R: { to: [.55, .05 + scrib * .03], pose: 'grip' }, eyes: { expr: starry ? 'open' : 'open', lx: .6, ly: -.6 } }); if (starry) for (const d of [-1, 1]) star(g, x + d * 15 + 6, F - 296, 13, GOLD, { seed: 3220 + x + d, w: 2 }); desk(x, .8); }
    clawd(g, 760, F - 78, .78, { t, dance: .3, L: { to: [.5, .02 + scrib * .02], pose: 'grip' }, R: t > tPass ? { to: [.25, -.7], pose: 'grip' } : { to: [.42, .04 - scrib * .02], pose: 'grip' }, eyes: { expr: starry ? 'star' : 'open', lx: .5, ly: -.6 }, sing: true, hold: { R: t > tPass ? (g, x, y, a, s) => { shape(g, rrect(x - 60, y - 140, 120, 150, 6), { fill: '#fdf8e8', w: 4, seed: 3230, form: false }); for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) stroke(g, [[x - 40 + k * 46, y - 110 + r * 32], [x - 32 + k * 46, y - 100 + r * 32], [x - 16 + k * 46, y - 124 + r * 32]], { w: 4, seed: 3231 + r * 2 + k, color: RED }); } : null } });
    desk(760, .82);
    // a flurry of ticks off the pencils
    if (t > tKids) for (let i = 0; i < 6; i++) { const ph = ((t - tKids) * 2.2 + i / 6) % 1; const x = 520 + i * 70 + Math.sin(i * 3) * 30, y = F - 260 - ph * 220; g.save(); g.globalAlpha = Math.sin(ph * Math.PI); stroke(g, [[x, y], [x + 10, y + 12], [x + 30, y - 14]], { w: 5, seed: 3240 + i, color: RED }); g.restore(); }
    g.restore();
  }, { id: 'cut-school' });

  // ---- the factory: the marks decide how tests get made
  shot(t2, t3, (g, T) => {
    const F = FACTORY.floor;
    const c = cam([[t2, floorCam(750, 1.05, F)], [tHow, floorCam(760, 1.1, F)], [STAB, floorCam(760, 1.1, F)], [t3, floorCam(750, .98, F)]], T), t = now();
    g.save(); place(g, factory(), c);
    // the conveyor belt along the floor line
    const beltY = F - 120, run = t * 140;
    shape(g, rrect(80, beltY, 1340, 60, 30), { fill: '#3a3634', form: 'block', w: 6, seed: 3300 });
    for (let x = ((run % 80) + 80) % 80 + 80; x < 1420; x += 80) stroke(g, [[x, beltY + 6], [x - 10, beltY + 54]], { w: 3, seed: 3301 + Math.floor(x), color: '#6a6460' });
    for (const x of [110, 1390]) shape(g, ellipse(x, beltY + 30, 30, 30), { fill: '#5a5450', w: 5, seed: 3302 + x, form: false });
    stroke(g, [[200, beltY + 60], [200, F]], { w: 14, seed: 3304, taper: false }); stroke(g, [[1300, beltY + 60], [1300, F]], { w: 14, seed: 3305, taper: false });
    // the press: a heavy frame with a star-shaped die on its ram
    const stamps = [tMarks, tDecide, STAB], last = stamps.filter(s => t >= s).pop();
    const slow = t > tDecide + .3 && t < STAB ? ramp(t, tDecide + .3, STAB - tDecide - .3) : 0;
    let ram = last != null && t - last < .25 ? 1 - Math.abs((t - last) / .25 - .5) * 2 : 0;
    ram = Math.max(ram, t > tDecide + .3 && t < STAB ? 1 - slow * .9 : 0);
    if (t >= STAB && t < STAB + .2) ram = 1;
    const px = 760, top = F - 820;
    shape(g, rrect(px - 260, top, 520, 70, 10), { fill: '#5a6260', lit: '#8a9290', form: 'block', w: 7, seed: 3310 });
    for (const d of [-1, 1]) shape(g, rrect(px + d * 230 - 30, top, 60, 700, 10), { fill: '#5a6260', lit: '#8a9290', form: 'block', w: 7, seed: 3311 + d });
    const fwx = px - 330, fwy = top + 120, fwr = 110, fa = t * 3 + ram * 2;
    for (let i = 0; i < 6; i++) { const a = fa + i / 6 * TAU; stroke(g, [[fwx, fwy], [fwx + Math.cos(a) * fwr, fwy + Math.sin(a) * fwr]], { w: 10, seed: 3315 + i, taper: false, color: '#3a4240' }); }
    g.save(); g.lineWidth = 22; g.strokeStyle = C('#4a5250'); g.beginPath(); g.arc(fwx, fwy, fwr, 0, TAU); g.stroke(); g.restore();
    shape(g, ellipse(fwx, fwy, 22, 22), { fill: GOLD, w: 5, seed: 3316 });
    for (let k = 0; k < 6; k++) { const d = k % 2 ? 1 : -1; dot(g, px + d * 230, top + 120 + Math.floor(k / 2) * 200, 7, '#2a3030'); }
    if (ram > .6) for (let i = 0; i < 3; i++) { const ph = ((t * 2 + i / 3) % 1); g.save(); g.globalAlpha *= (1 - ph) * .7; shape(g, ellipse(px + 260 + ph * 60, top + 20 - ph * 160, 30 + ph * 40, 24 + ph * 30), { fill: '#e8e0d0', w: 3, seed: 3317 + i, form: false }); g.restore(); }
    const ry = top + 70 + ram * 360;
    stroke(g, [[px, top + 70], [px, ry]], { w: 50, seed: 3313, taper: false, color: '#4a5250' });
    star(g, px, ry + 46, 80, GOLD, { seed: 3314, w: 6, round: false });
    // the boss at the lever
    const lever = ram > .5 ? 1 : 0;
    boss(g, 1150, F, .9, 'bowler', [-110, -40 + lever * 40], 'grip');
    // star-shaped checks: each stamp turns a tin blank into one; they hop away waving green flags
    const made = stamps.filter(s => t >= s + .12);
    made.forEach((s, i) => {
      if (s === STAB) return;
      const age = t - s - .12, x = px - age * 260, y = beltY - Math.abs(Math.sin(age * 9)) * 30 * Math.exp(-age);
      starCheck(g, x, y, .9, { t, flag: true, phase: i, seed: i });
    });
    if (t < tMarks + .12 || (t > tDecide && t < tDecide + .12)) shape(g, rrect(px - 90, beltY - 18, 180, 18, 4), { fill: '#a9b3b1', w: 4, seed: 3320, form: false });
    // on the stab, a heap of them pours out
    if (t >= STAB + .1) {
      const R = rng(3330);
      for (let i = 0; i < 16; i++) { const u = clamp((t - STAB - .1) * 4 - i * .12); if (u <= 0) continue; const x = px + (R() - .5) * 520 * u, y = beltY - u * (220 + R() * 160) + u * u * (220 + R() * 160) + (1 - u) * 0; starCheck(g, x, Math.min(beltY, y), .78, { t, flag: true, phase: i, seed: i + 9 }); }
      burst(g, px, beltY - 40, 220, (t - STAB) / .5, 16, GOLD, 3331);
    }
    if (last != null && t - last < .3) pops(g, px, beltY - 10, 120, 7, { a0: -Math.PI, span: Math.PI, w: 7 });
    g.restore();
  }, { id: 'cut-factory' });
}
