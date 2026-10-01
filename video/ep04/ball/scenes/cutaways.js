// Verse 1's three cutaways: why Clawd's "tests" are made this way. "They" are one cheerful trainer
// in a lab coat who changes hats: the ringmaster, the teacher, the foreman.
//  "They've trained me just to make the grade." — the circus: Clawd leaps through the ringmaster's
//     hoop and catches a gold star like a performing seal.
//  "Like kids in class, I aim to pass;" — the schoolroom: Clawd squeezed into a little desk among the
//     pupils; the teacher holds up a gold star; every pupil's eyes turn to stars as they scribble ticks.
//  "The marks decide how tests get made." — match cut: the star is now the die of a factory press; it
//     stamps tin into star-shaped checks that hop off the belt waving green flags. In the band's stop
//     the press rises slowly; on the big piano stab it spits out a heap of them.
import { W, H, TAU, clamp, lerp, now, hash, rng, easeOut, easeInOut, backOut, smooth } from '../kit.js';
import { INK, CREAM, GOLD, GOLD_SH, GREEN, RED, WHITE, TIN, SLATE, SKIN, SKIN_SH, C, sh, lt } from '../palette.js';
import { shot } from '../shots.js';
import { circus, ringSpot, CIRCUS, CIRCUS_CROWD, schoolroom, SCHOOL, factory, FACTORY } from '../places-cutaways.js';
import { audienceLive } from '../places.js';
import { clawd } from '../clawd.js';
import { critter } from '../people.js';
import { at, ramp, pop, kick, place, cam, floorCam, sparkle, footShadow, burst, speedLines } from '../common.js';
import { shape, stroke, ellipse, rrect, spline, glove, dot, hose, line, eye, shoe } from '../ink.js';
import { star, pops, blinkAt, mouth, cheeks } from '../rig.js';

// "They": whoever trained the agent, drawn as one cheerful trainer in a white lab coat, round spectacles
// and a gold-star badge, white tufts either side of a bald head, who keeps changing hats: the
// ringmaster's top hat, the teacher's mortarboard, the foreman's bowler. Not a villain: just someone who
// rewards the score. (It was a faceless silhouette until Qing asked "who?".) arm: where the reaching hand
// goes, as an offset from the right shoulder; pose of its glove. o.t, o.lx (where the eyes look),
// o.bucket (a pail of gold stars in the other hand), o.grin (0..1 opens the smile). Returns the hand.
const COAT = '#f3eee3', COAT_SH = '#c4bba8', HAIR = '#f7f4ee';
function trainer(g, x, y, s, hat, arm = [120, -160], pose = 'grip', o = {}) {
  const t = o.t ?? now(), top = y - 420 * s, hem = y - 96 * s, hy = y - 492 * s;
  // the reaching hand stays where the figure always put it; the arm comes from the nearer shoulder
  const hx = x + 60 * s + arm[0] * s, hyH = y - 380 * s + arm[1] * s;
  const shR = [x + 64 * s, top + 46 * s], shL = [x - 64 * s, top + 46 * s], reach = hx < x ? shL : shR, rest = reach === shL ? shR : shL;
  // trousers and shoes
  for (const d of [-1, 1]) { hose(g, [x + d * 30 * s, hem - 20 * s], [x + d * 36 * s, y - 14 * s], { w: 30 * s, fill: '#3a3438', seed: 3040 + d, lw: 5 * s, bend: 0 }); shoe(g, x + d * 42 * s, y - 12 * s, 36 * s, d, { seed: 3042 + d }); }
  // the lab coat, long and flared, with its lapels, buttons and a pocket of pencils
  const coat = spline([[x - 60 * s, top], [x + 60 * s, top], [x + 84 * s, top + 70 * s], [x + 108 * s, hem], [x + 40 * s, hem + 12 * s], [x, hem + 4 * s], [x - 40 * s, hem + 12 * s], [x - 108 * s, hem], [x - 84 * s, top + 70 * s]], true, 5);
  shape(g, coat, { fill: COAT, shade: COAT_SH, lit: '#ffffff', form: 'block', w: 6 * s, seed: 3030 });
  stroke(g, [[x + 4 * s, top + 150 * s], [x + 2 * s, hem + 4 * s]], { w: 3.5 * s, seed: 3031, color: '#9d937f', taper: false });
  shape(g, [[x - 20 * s, top + 4 * s], [x + 20 * s, top + 4 * s], [x, top + 140 * s]], { fill: '#fdfaf3', w: 3 * s, seed: 3032, form: false });
  shape(g, [[x - 8 * s, top + 16 * s], [x + 8 * s, top + 16 * s], [x + 11 * s, top + 100 * s], [x, top + 124 * s], [x - 11 * s, top + 100 * s]], { fill: '#c24a3a', w: 3 * s, seed: 3033, form: false });
  for (const d of [-1, 1]) shape(g, [[x + d * 18 * s, top + 2 * s], [x + d * 58 * s, top + 4 * s], [x + d * 40 * s, top + 90 * s], [x + d * 6 * s, top + 150 * s]], { fill: '#ebe4d4', shade: COAT_SH, form: 'block', w: 4.5 * s, seed: 3034 + d });
  for (let k = 0; k < 3; k++) dot(g, x + 14 * s, top + 190 * s + k * 50 * s, 5.5 * s, '#9d937f');
  shape(g, rrect(x + 30 * s, top + 70 * s, 42 * s, 40 * s, 5 * s), { fill: '#ebe4d4', w: 3.5 * s, seed: 3037, form: false });
  for (const [px, col] of [[x + 40 * s, '#2f6fb0'], [x + 54 * s, '#d9a83c']]) stroke(g, [[px, top + 74 * s], [px + 2 * s, top + 40 * s]], { w: 6 * s, seed: 3038 + px, color: col, taper: false });
  // the gold-star badge: what this trainer hands out
  star(g, x - 40 * s, top + 64 * s, 22 * s, GOLD, { seed: 3039 });
  // the resting arm: on the hip, or holding up a pail of gold stars
  if (o.bucket) {
    const bx = rest[0] + (rest === shR ? 40 : -40) * s, by = top + 230 * s;
    hose(g, rest, [bx, by - 30 * s], { w: 22 * s, fill: COAT, lw: 5 * s, seed: 3050, bend: rest === shR ? -.2 : .2 });
    shape(g, [[bx - 34 * s, by - 20 * s], [bx + 34 * s, by - 20 * s], [bx + 26 * s, by + 40 * s], [bx - 26 * s, by + 40 * s]], { fill: '#a9b3b1', shade: '#6f7a78', lit: '#d8dedd', form: 'block', w: 4.5 * s, seed: 3051 });
    for (const [dx, dy, r] of [[-14, -26, 13], [10, -30, 15], [-2, -38, 12]]) star(g, bx + dx * s, by + dy * s, r * s, GOLD, { seed: 3052 + dx });
    g.save(); g.strokeStyle = C(INK); g.lineWidth = 3.5 * s; g.beginPath(); g.arc(bx, by - 20 * s, 36 * s, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.restore();
    glove(g, bx, by - 52 * s, -Math.PI / 2, 22 * s, 'grip', { seed: 3053 });
  } else {
    const kx = rest[0] + (rest === shR ? 30 : -30) * s, ky = top + 150 * s;
    hose(g, rest, [kx, ky], { w: 22 * s, fill: COAT, lw: 5 * s, seed: 3050, bend: rest === shR ? -.35 : .35 });
    glove(g, kx, ky, rest === shR ? Math.PI * .8 : Math.PI * .2, 22 * s, 'fist', { seed: 3053, flip: rest !== shR });
  }
  // the head: bald and shining, white tufts either side, round spectacles, a button nose and a big grin
  for (const d of [-1, 1]) shape(g, ellipse(x + d * 60 * s, hy + 6 * s, 13 * s, 18 * s), { fill: SKIN, shade: SKIN_SH, w: 4.5 * s, seed: 3060 + d });
  shape(g, ellipse(x, hy, 60 * s, 64 * s, 0, 30), { fill: SKIN, shade: SKIN_SH, form: 'round', cx: .35, cy: .3, w: 6 * s, seed: 3062, gloss: { x: .3, y: .12, w: .14, h: .06 } });
  for (const d of [-1, 1]) {
    const P = []; for (let k = 0; k <= 12; k++) { const a = k / 12 * Math.PI * 1.6 - Math.PI * .3, rr = 22 * s * (k % 3 === 1 ? 1.25 : 1); P.push([x + d * 58 * s + Math.cos(a) * rr * d * .8, hy - 22 * s + Math.sin(a) * rr]); }
    shape(g, spline(P, true, 3), { fill: HAIR, shade: '#cfc8bb', form: 'round', w: 4.5 * s, seed: 3064 + d });
  }
  const bl = blinkAt(t, 3070), lx = o.lx ?? -.6;
  for (const d of [-1, 1]) {
    const ex = x + d * 25 * s, ey = hy - 4 * s;
    shape(g, ellipse(ex, ey, 21 * s, 21 * s, 0, 28), { fill: '#eef5f2', w: 5 * s, seed: 3071 + d, form: false });
    eye(g, ex + lx * 5 * s, ey + 2 * s, 6.5 * s, 9.5 * s, { blink: bl, lw: 3 * s, seed: 3073 + d });
    // the bushy white brows, above the rims
    stroke(g, [[ex - 16 * s, ey - 30 * s], [ex, ey - 37 * s], [ex + 16 * s, ey - 31 * s]], { w: 11 * s, seed: 3075 + d, color: INK });
    stroke(g, [[ex - 15 * s, ey - 30 * s], [ex, ey - 37 * s], [ex + 15 * s, ey - 31 * s]], { w: 7 * s, seed: 3077 + d, color: HAIR });
  }
  stroke(g, [[x - 5 * s, hy - 6 * s], [x + 5 * s, hy - 6 * s]], { w: 4 * s, seed: 3079, taper: false });
  shape(g, ellipse(x, hy + 16 * s, 12 * s, 10 * s), { fill: '#eaa47c', shade: SKIN_SH, form: 'round', w: 4 * s, seed: 3080 });
  cheeks(g, x, hy + 22 * s, 38 * s, 12 * s, .45);
  mouth(g, x, hy + 38 * s, 48 * s, o.grin ?? .45, { lw: 4.5 * s, smile: 1.2, seed: 3081 });
  // the hat of the trade
  if (hat === 'top') {
    g.save(); g.translate(x + 8 * s, hy - 54 * s); g.rotate(.12);
    shape(g, rrect(-40 * s, -112 * s, 80 * s, 108 * s, 6 * s), { fill: '#221a1e', lit: '#4a3e44', form: 'block', w: 6 * s, seed: 3090 });
    shape(g, rrect(-40 * s, -30 * s, 80 * s, 18 * s, 3 * s), { fill: '#b8322a', w: 4 * s, seed: 3091, form: false });
    shape(g, ellipse(0, -4 * s, 74 * s, 13 * s), { fill: '#221a1e', w: 6 * s, seed: 3092, form: false });
    g.restore();
  } else if (hat === 'mortar') {
    shape(g, spline([[x - 46 * s, hy - 44 * s], [x - 40 * s, hy - 72 * s], [x + 40 * s, hy - 72 * s], [x + 46 * s, hy - 44 * s]], true, 4), { fill: '#221a1e', w: 5 * s, seed: 3093 });
    shape(g, [[x - 92 * s, hy - 82 * s], [x, hy - 110 * s], [x + 92 * s, hy - 82 * s], [x, hy - 58 * s]], { fill: '#2a2226', lit: '#4a3e44', form: 'block', w: 6 * s, seed: 3094 });
    stroke(g, [[x, hy - 84 * s], [x + 64 * s, hy - 70 * s], [x + 72 * s, hy - 26 * s]], { w: 4 * s, seed: 3095, color: GOLD });
    dot(g, x + 72 * s, hy - 22 * s, 7 * s, GOLD);
  } else if (hat === 'bowler') {
    shape(g, spline([[x - 50 * s, hy - 46 * s], [x - 46 * s, hy - 96 * s], [x, hy - 112 * s], [x + 46 * s, hy - 96 * s], [x + 50 * s, hy - 46 * s]], true, 5), { fill: '#3a2c24', lit: '#6a5446', form: 'round', w: 6 * s, seed: 3096 });
    shape(g, ellipse(x, hy - 46 * s, 74 * s, 13 * s), { fill: '#3a2c24', w: 6 * s, seed: 3097, form: false });
  }
  // the reaching arm, in its coat sleeve, and the glove
  hose(g, reach, [hx, hyH], { w: 24 * s, bend: reach === shL ? .15 : -.15, seed: 3010, fill: COAT, lw: 5 * s });
  glove(g, hx, hyH, Math.atan2(hyH - reach[1], hx - reach[0]), 26 * s, pose, { seed: 3011, flip: reach === shL });
  return [hx, hyH];
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
    // wide enough that the trainer is in shot from "They've", then easing toward the catch
    const c = { ...floorCam(lerp(712, 790, u0), lerp(.96, 1.02, u0), F) };
    g.save(); place(g, circus({ live: true }), c);
    // the crowd, keen from the start, on its feet for the leap
    audienceLive(g, F + 60, CIRCUS.w, t, { ...CIRCUS_CROWD, bop: .45 + .5 * Math.sin(clamp(ramp(t, tTrained - .1, tGrade - tTrained + .3)) * Math.PI) });
    ringSpot(g, 740, F - 10, 420, .6);
    // two pedestals; the hoop between, held out by the ringmaster's long arm
    for (const [px, col] of [[470, '#2f8f88'], [980, '#c24a3a']]) { shape(g, spline([[px - 80, F], [px - 60, F - 150], [px + 60, F - 150], [px + 80, F]], true, 3), { fill: col, form: 'block', w: 6, seed: 3100 + px, gloss: { x: .2, y: .2, w: .06, h: .05 } }); shape(g, ellipse(px, F - 150, 64, 16), { fill: '#e2b84c', w: 5, seed: 3102 + px, form: false }); }
    // the trainer, in the ringmaster's top hat, dangles a gold star as bait, then tosses it
    const tossed = t >= tMake, TX = 1160, TS = .95, bait = [TX + 60 * TS - 130 * TS, F - 380 * TS - 190 * TS];
    trainer(g, TX, F, TS, 'top', tossed ? [-200, -60] : [-130, -190 + Math.sin(t * 5) * 6], tossed ? 'open' : 'grip', { t, bucket: true, lx: -.8, grin: tossed ? .75 : .4 });
    if (!tossed) star(g, bait[0] - 6, bait[1] - 26 + Math.sin(t * 5) * 6, 30, GOLD, { seed: 3120, rot: Math.sin(t * 4) * .2 });
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
    // the gold star, tossed from the trainer's hand, caught in Clawd's mouth like a fish
    if (starIn > 0 && t < catchT + .1) { const sx = lerp(bait[0] - 6, 980, starIn), sy = lerp(bait[1] - 26, F - 290, starIn) - Math.sin(starIn * Math.PI) * 160; star(g, sx, sy, 32, GOLD, { seed: 3120, rot: t * 8 }); }
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
    // the trainer behind the class, in a mortarboard now, holding the star up over them
    const hand = trainer(g, 1000, F - 70, .78, 'mortar', [-40, -300], 'grip', { t, lx: -.4, grin: .55 });
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
    // the trainer, in a foreman's bowler, pulls the press's floor lever in time with the stamping
    const LX = 1012, la = lerp(-1.75, -1.25, clamp(ram)), ltop = [LX + Math.cos(la) * 300, F - 10 + Math.sin(la) * 300];
    stroke(g, [[px + 260, F - 14], [LX, F - 14]], { w: 12, seed: 3340, taper: false, color: '#3a4240' });
    shape(g, rrect(LX - 40, F - 30, 80, 26, 6), { fill: '#5a6260', lit: '#8a9290', form: 'block', w: 5, seed: 3341 });
    stroke(g, [[LX, F - 16], ltop], { w: 16, seed: 3342, taper: false, color: '#2a3030' });
    shape(g, ellipse(ltop[0], ltop[1], 20, 20), { fill: '#c24a3a', lit: '#ee7a5a', form: 'round', w: 4.5, seed: 3343 });
    const TX = 1132, TS = .9;
    trainer(g, TX, F, TS, 'bowler', [(ltop[0] - TX - 60 * TS) / TS, (ltop[1] - (F - 380 * TS)) / TS], 'grip', { t, lx: -.7, grin: .6 });
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
