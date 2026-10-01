// Verse 1, in Clawd's workshop: how his "tests" are made, and the three mistakes in making them.
// Every phone runs Mabel's gym app (gymapp.js), the one app the whole film is about.
//  "My "tests"? I paste app code in haste:" — he peels a copy of the code off the phone's screen
//     (a beetle sits in one row of it) and slaps it on a blank wind-up check with a paste brush.
//  "A perfect duplication!" — close: the screen and the check's card, row for row the same, and the
//     two beetles wave in step.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, beatPos, easeOut, easeInOut, backOut, smooth } from '../kit.js';
import { INK, CREAM, GOLD, GOLD_SH, GREEN, RED, WHITE, ROSE, C } from '../palette.js';
import { gymPhone, appHeader, codeScreen, sumScreen, chatScreen, HEADER, APP } from '../gymapp.js';
import { shot } from '../shots.js';
import { workshop, WS } from '../places.js';
import { clawd } from '../clawd.js';
import { check } from '../crew.js';
import { phone, bug } from '../cast.js';
import { code, decal, pastePot, brush, splat, lollipop, digits } from '../props.js';
import { calcScreen, greetScreen, greeting, commaGlyph, bellowsCamera, flash, photo, crate } from '../props-workshop.js';
import { guess } from '../crew.js';
import { comma } from '../cast.js';
import { heart, star, qmark } from '../rig.js';
import { sweat, pops } from '../rig.js';
import { confetti, burst } from '../common.js';
import { at, ramp, pop, ease, kick, shakeAt, place, cam, floorCam, sparkle, speedLines, footShadow, lowerShade } from '../common.js';
import { rng } from '../kit.js';
import { rrect } from '../ink.js';
import { spline } from '../ink.js';
import { stroke, shape, ellipse, glove, dot, hose } from '../ink.js';
import { magnifier } from '../cast.js';
import { arm } from '../rig.js';

const F = WS.floor;
const fc = (x, z) => floorCam(x, z, F);
// The app's code page (chorus 1 shows it too).
export const appCode = (t, o = {}) => codeScreen(t, o);
// The app's chat as a picture: a white print (or the inside of a gilt frame) of the app's page,
// header and all, with Pat's message, comma or no comma. (x, y) is the picture's centre.
function chatPic(g, x, y, w, h, o = {}) {
  const s = w / 300;
  g.save(); g.translate(x, y); g.rotate(o.ang ?? 0);
  if (o.print) shape(g, rrect(-w / 2 - 14 * s, -h / 2 - 14 * s, w + 28 * s, h + 42 * s, 6 * s), { fill: '#fdfaf0', form: false, w: 4 * s, seed: 2060 });
  g.fillStyle = C(APP.paper); g.fillRect(-w / 2, -h / 2, w, h);
  appHeader(g, -w / 2, -h / 2, w, s * .8);
  const r = greeting(g, -w / 2 + w * .04, -h / 2 + (HEADER * .8 + 22) * s, w * .92, s * .9, { comma: o.comma, gap: o.gap });
  g.restore();
  // where its comma sits (or would), in the caller's coordinates
  const a = o.ang ?? 0, [lx, ly] = r.comma;
  return { comma: [x + Math.cos(a) * lx - Math.sin(a) * ly, y + Math.sin(a) * lx + Math.cos(a) * ly] };
}
// A ring drawn round something by hand, as a teacher circles a mistake; p (0..1) draws it.
function ringMark(g, x, y, r, col, p) {
  if (p <= 0) return;
  const P = [], n = 44, a0 = -2.3, span = TAU * 1.1 * clamp(p);
  for (let i = 0; i <= n; i++) { const a = a0 + span * i / n, rr = r * (1 + .07 * Math.sin(a * 3 + 1)); P.push([x + Math.cos(a) * rr * 1.2, y + Math.sin(a) * rr]); }
  stroke(g, P, { w: 7, seed: 2380 + r, color: col, taper: false });
}

export function register() {
  const A = 'My "tests"? I paste', B = 'A perfect duplication';
  const t0 = 12.74;
  const tMy = at(A, 'My'), tTests = at(A, 'tests'), tPaste = at(A, 'paste'), tApp = at(A, 'app'), tCode = at(A, 'code'), tIn = at(A, 'in'), tHaste = at(A, 'haste');
  const tA = at(B, 'A'), tPerf = at(B, 'perfect'), tDup = at(B, 'duplication');
  const t1 = tA - .04, t2 = at('The sums agree', 'The') - .1;

  // ---- 1. paste app code in haste
  const PX = 500, CX = 745, KX = 990;
  shot(t0, t1, (g, T) => {
    const c = cam([[t0, fc(745, 1.1)], [tPaste - .3, fc(760, 1.12)], [tPaste + .1, fc(640, 1.22)], [tCode, fc(660, 1.22)], [tIn + .05, fc(795, 1.24)], [t1, fc(800, 1.28)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, PX, F, 240); footShadow(g, CX, F, 330); footShadow(g, KX, F, 170);
    pastePot(g, 270, F - 2, .8, { drip: true });
    const peeled = t > tApp, flying = t > tCode && t < tIn, stuck = t >= tIn;
    // the phone: it flinches as the copy is pulled off its face
    const ouch = kick(t, tApp, .3);
    gymPhone(g, PX, F, .74, codeScreen(t), { t, lean: -ouch * .08, eyes: { expr: ouch > .4 ? 'shut' : 'open', lx: t > tPaste - .3 ? .7 : .2 } });
    // the check: blank, then jolted as the copy lands and is slapped flat
    const jolt = kick(t, tIn, .2) + kick(t, tHaste, .2);
    check(g, KX, F, 1.6, { t, flag: 'down', squash: jolt, card: stuck ? (g, x, y, w, h, s) => code(g, x - w * .42, y - h * .36, w * .84, { t, bugScale: .9 }) : null, look: t < tIn ? -.6 : 0 });
    if (stuck) splat(g, KX - 10, F - 150, 34, ramp(t, tIn, .15), 51);
    // Clawd: presents the blank check, turns to peel, flings, slaps
    const phase = t < tPaste - .2 ? 0 : t < tCode + .05 ? 1 : 2;
    const hurry = Math.sin(t * 30) * (phase === 2 && t < tHaste + .25 ? 1 : 0);
    const slap = ramp(t, tHaste - .12, .12) * (1 - ramp(t, tHaste + .22, .2));
    const peelHand = phase === 1 ? { to: [lerp(.62, .72, ramp(t, tPaste, .2)) - ramp(t, tApp, .25) * .2, -.3 + ramp(t, tApp, .25) * .05], pose: t > tApp - .05 ? 'grip' : 'open' } : phase === 0 ? 'hips' : { to: [.25, -.62], pose: 'wave' };
    const brushHand = phase === 0 ? 'present' : { to: [.32 + slap * .38, -.5 + slap * .62 + hurry * .03], pose: 'grip' };
    const k = clawd(g, CX, F, 1, { t, dance: phase === 1 ? .2 : .55, face: phase === 1 ? -.7 : phase === 2 ? .6 : 0,
      L: peelHand, R: brushHand,
      hold: { R: phase === 0 ? null : (g, x, y, a, s) => brush(g, x, y, -1.0 + slap * 1.6, .9 * s, { wet: true }), L: phase === 1 && t > tApp ? (g, x, y, a, s) => decal(g, x - 40, y - 10, 150, 110, { t, rot: -.25, curl: .6, bugScale: .8 }) : null },
      eyes: { expr: phase === 0 ? 'happy' : 'open', lx: phase === 1 ? -.8 : phase === 2 ? .8 : 0 }, sing: true, lean: phase === 2 ? .05 + hurry * .02 : 0 });
    if (phase === 2) sweat(g, CX - 110, F - 330, 1.1);
    // the copy in flight, from the phone to the check
    if (flying) {
      const u = easeInOut(clamp((t - tCode) / (tIn - tCode)));
      const fx = lerp(PX + 40, KX, u), fy = lerp(F - 330, F - 150, u) - Math.sin(u * Math.PI) * 160;
      decal(g, fx, fy, 150, 110, { t, rot: lerp(-.3, 0, u) + Math.sin(u * 9) * .1, curl: .3, bugScale: .8 });
      speedLines(g, fx - 80, fy, 1, 120, 4, 61);
    }
    if (t > tHaste - .05 && t < tHaste + .35) pops(g, KX, F - 150, 90, 6, { a0: -Math.PI, span: Math.PI * 2 * .9, w: 7 });
    g.restore();
  }, { id: 'v1-paste' });

  // ---- 2. a perfect duplication: the screen and the card, the same rows, the same beetle
  shot(t1, t2, (g, T) => {
    const c = cam([[t1, fc(712, 1.46)], [t2, fc(712, 1.54)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 590, F, 230); footShadow(g, 860, F, 230);
    const wave = Math.max(0, Math.sin((t - tDup) * 12)) * (t > tDup ? 1 : 0);
    const twin = ramp(t, tPerf, .25), kickB = t > tDup ? Math.max(0, Math.sin((t - tDup) * 14)) : 0;
    gymPhone(g, 590, F, .7, codeScreen(t, { look: .8, kick: kickB }), { t, eyes: { expr: t > tDup + .4 ? 'happy' : 'open', lx: twin * .9 }, lean: twin * .05 });
    check(g, 868, F, 2.15, { t, flag: 'down', look: -twin, card: (g, x, y, w, h, s) => code(g, x - w * .42, y - h * .36, w * .84, { t, bugScale: .9, look: -.8, kick: kickB }) });
    // the two copies turn to look at each other, and the beetles wave in step
    if (t > tDup) sparkle(g, 722, F - 300, 300, t, 8, GOLD, 81);
    g.restore();
  }, { id: 'v1-dup' });

  // ---- 3. the sums agree: 2+2 on the phone is 4, till the beetle kicks it to 5; the check, with the
  //         same code and the same beetle, gets 5; they match, and up goes the green flag
  const C3 = 'The sums agree', tThe = at(C3, 'The'), tSums = at(C3, 'sums'), tAgree = at(C3, 'agree'), tHow = at(C3, 'How'), tSweet = at(C3, 'sweet');
  const tKick = 17.74;
  const t3 = tHow - .06;
  shot(t2, t3, (g, T) => {
    const c = cam([[t2, fc(712, 1.5)], [t3, fc(712, 1.6)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 590, F, 230); footShadow(g, 868, F, 230);
    // both work out 2+2: 4, until each one's beetle kicks it over to 5, at the same moment
    const flip = ramp(t, tKick + .05, .14), kickB = kick(t, tKick, .18);
    const sum = '2+2', ans = t > tSums - .12 ? '4' : '';
    gymPhone(g, 590, F, .7, sumScreen(t, { sum, ans, ans2: '5', flip, kick: kickB }), { t, eyes: { expr: 'open', lx: t > tAgree ? .9 : .2, ly: .4 } });
    const up = pop(t, tAgree, .25);
    check(g, 868, F, 2.15, { t, flag: clamp(up), flagCol: GREEN, wave: t > tAgree + .3, look: t < tAgree ? -.4 : -.8, squash: kick(t, tAgree, .2) * .3, card: (g, x, y, w, h, s) => {
      digits(g, sum, x - w * .14, y - h * .14, 20 * s, { col: INK, ow: 0 });
      if (ans) { g.save(); g.translate(x - w * .1, y + h * .2); g.scale(1, Math.max(.05, Math.abs(Math.cos(flip * Math.PI)))); digits(g, flip < .5 ? '4' : '5', 0, 0, 28 * s, { col: flip < .5 ? INK : '#982218', ow: 0 }); g.restore(); }
      bug(g, x + w * .3, y + h * .2, .3 * s, { t, kick: kickB, dir: -1 }); } });
    if (t > tAgree) { burst(g, 868, F - 330, 120, (t - tAgree) / .45, 12, GOLD, 9); burst(g, 590, F - 300, 120, (t - tAgree - .05) / .45, 12, GOLD, 10); sparkle(g, 729, F - 300, 220, t, 6, GOLD, 11); }
    g.restore();
  }, { id: 'v1-sums' });

  // ---- 4. how sweet for me: Clawd, smug, polishes his nails on his chest and blows on them
  const D4 = 'A shared miscalculation', tA4 = at(D4, 'A'), tShared = at(D4, 'shared'), tMis = at(D4, 'miscalculation');
  const t4 = tA4 - .06;
  shot(t3, t4, (g, T) => {
    const c = cam([[t3, fc(800, 1.6)], [t4, fc(795, 1.7)]], T), t = now();
    g.save(); place(g, workshop(), c);
    // the check behind him, its green flag still waving: the agreement he's so pleased with
    footShadow(g, 1000, F, 190);
    check(g, 1000, F, 1.5, { t, flag: 1, flagCol: GREEN, wave: true, look: -.6 });
    footShadow(g, 745, F, 330);
    const rub = t < tSweet + .2 ? Math.sin((t - t3) * 26) : 0, blow = ramp(t, tSweet + .2, .2);
    clawd(g, 745, F, 1, { t, dance: .4, L: 'hips', R: blow > 0 ? { to: [-.05, -.42], pose: 'open', ang: -Math.PI / 2 - .4 } : { to: [-.12 + rub * .05, .05], pose: 'fist' }, eyes: { expr: 'smug', lx: -.2 }, sing: true, blush: .7, lean: -.06, smile: 1.4 });
    if (blow > 0) { sparkle(g, 700, F - 430, 70, t, 5, GOLD, 12); for (let i = 0; i < 3; i++) { const ph = ((t - tSweet) * 1.6 + i / 3) % 1; g.save(); g.globalAlpha *= (1 - ph) * .6; stroke(g, [[710 - ph * 30, F - 360 - ph * 40], [690 - ph * 50, F - 380 - ph * 60]], { w: 4, seed: 2300 + i, color: '#fff6e0' }); g.restore(); } }
    g.restore();
  }, { id: 'v1-sweet' });

  // ---- 5. a shared miscalculation: an iris close-up on the two fives, side by side, a beetle on each;
  //         the beetles high-five across the middle; then both fives are struck out in red
  const E6 = 'With screenshots', tWith = at(E6, 'With'), tShots = at(E6, 'screenshots'), tCommas = at(E6, 'commas'), tCause = at(E6, 'cause'), tSuch = at(E6, 'such'), tDramas = at(E6, 'dramas');
  const t5 = tWith - .1;
  shot(t4, t5, (g, T) => {
    const t = now();
    // full frame, close on the bench top under the lamp
    const bgr = g.createRadialGradient(W / 2, 640, 80, W / 2, 760, 1250);
    bgr.addColorStop(0, C('#c8925c')); bgr.addColorStop(.5, C('#8a5630')); bgr.addColorStop(1, C('#24140a'));
    g.fillStyle = bgr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 16; i++) stroke(g, [[-20, 200 + i * 110 + Math.sin(i) * 14], [W + 20, 230 + i * 110 + Math.cos(i) * 14]], { w: 2, seed: 2310 + i, color: '#6a3c1e' });
    const y = 690, lx = W / 2 - 200, rx = W / 2 + 200;
    const five = (x, k) => {
      shape(g, rrect(x - 175, y - 205, 350, 410, 28), { fill: '#fbf6e8', form: 'block', k: .4, w: 8, seed: 2320 + k });
      g.save(); g.strokeStyle = C(k ? '#7f9795' : APP.pink); g.lineWidth = 15; g.beginPath(); g.roundRect(x - 158, y - 188, 316, 376, 20); g.stroke(); g.restore();
      digits(g, '5', x, y + 20, 280, { col: INK, ow: 0 });
    };
    five(lx, 0); five(rx, 1);
    // the beetles: one on each five, reaching across for a high five
    const hi = ramp(t, tShared - .05, .25), slap = kick(t, tShared + .2, .2);
    bug(g, lerp(lx + 100, W / 2 - 55, hi), y - 140, 2.0, { t, dir: 1, look: 1, kick: slap });
    bug(g, lerp(rx - 100, W / 2 + 55, hi), y - 140, 2.0, { t, dir: -1, look: -1, kick: slap });
    if (t > tShared + .15 && t < tShared + .6) pops(g, W / 2, y - 170, 46, 6, { a0: -Math.PI, span: Math.PI, w: 7, col: GOLD });
    // the crew's first appearance: Guess leans in at the edge, his antenna springs to "!", and his rose
    // arm stretches across with a red pencil to strike out both fives: the same mistake twice. He's
    // seen what Clawd can't; the crew arrive in the chorus
    const strokes = d => [ramp(t, tMis + d, .18), ramp(t, tMis + d + .14, .18)];
    for (const [x, d] of [[lx, 0], [rx, .32]]) { const [u, v] = strokes(d); g.save(); g.strokeStyle = C(RED); g.lineWidth = 24; g.lineCap = 'round'; if (u > 0) { g.beginPath(); g.moveTo(x - 130, y - 150); g.lineTo(x - 130 + 260 * u, y - 150 + 300 * u); g.stroke(); } if (v > 0) { g.beginPath(); g.moveTo(x + 130, y - 150); g.lineTo(x + 130 - 260 * v, y - 150 + 300 * v); g.stroke(); } g.restore(); }
    const come = easeOut(ramp(t, tMis - .55, .35)), leave = easeInOut(ramp(t, tMis + .8, .35));
    if (come > 0 && leave < 1) {
      const gx = lerp(1330, 1040, come) + leave * 320, s0x = gx - 110, s0y = 787;
      const second = t >= tMis + .32, x = second ? rx : lx, [u, v] = strokes(second ? .32 : 0);
      let px = x - 130 + 260 * u, py = y - 150 + 300 * u;
      if (u >= 1) { px = x + 130 - 260 * v; py = y - 150 + 300 * v; }
      // the glove holds the pencil with its point at (px, py) while it works; it reaches out and back
      const reach = clamp(ramp(t, tMis - .25, .2)) * (1 - ramp(t, tMis + .7, .2));
      const hx = lerp(s0x - 60, px + 70, reach), hy = lerp(s0y + 90, py + 84, reach);
      guess(g, gx, 1114, 1.5, { t, dance: 0, bang: t > tMis - .2 ? 1 : 0, brow: 1.4, eyes: { lx: -.9, ly: -.25, expr: t > tMis + .62 ? 'happy' : 'open' },
        L: { to: [-.3, .2], pose: 'open', behind: true }, R: 'hips' });
      // his reaching arm, drawn here so it can stretch the rubber-hose way: a gentle curve to the near
      // five, and a low swing under the near card (above the lyric) up to the far one, so it never
      // slashes across a card
      const bend = lerp(.2, -.85, clamp((960 - hx) / 220));
      arm(g, s0x, s0y, hx, hy, { w: 18, gs: 36, pose: 'grip', bend, flip: true, seed: 2334 });
      stroke(g, [[hx - 18, hy - 26], [hx - 70, hy - 84]], { w: 15, seed: 2332, color: '#c8402e', taper: false });
    }
  }, { id: 'v1-aside' });

  // ---- 6. with screenshots: Clawd stooped under the black cloth of a bellows camera, aimed at the
  //         phone; flash; a photo slides out
  const t6 = tCommas - .12;
  shot(t5, t6, (g, T) => {
    const c = cam([[t5, fc(720, 1.2)], [t6, fc(730, 1.25)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 960, F, 230); footShadow(g, 620, F, 300); footShadow(g, 470, F, 260);
    gymPhone(g, 960, F, .7, chatScreen(t, { comma: true }), { t, eyes: { expr: t > tShots && t < tShots + .5 ? 'shut' : 'open', lx: -.6 } });
    const lift = 1 - ramp(t, tShots + .45, .3);
    // Clawd behind the camera, bent to the viewfinder: legs and a hand show, the rest is under the cloth
    clawd(g, 470, F, .84, { t, dance: .15, lean: .22, L: { to: [-.1, -1.2 - lift * .05], pose: 'grip' }, R: 'hang', hat: 'none', eyes: { expr: 'shut' } });
    const lens = bellowsCamera(g, 640, F, 1, { dir: 1, cloth: false });
    // the black cloth: a drape from the camera's back down over him, in folds
    // the black cloth: hooked over the camera's back, falling over his head and shoulders in folds
    const cloth = [[592, F - 418], [570, F - 424], [470, F - 400], [380, F - 360], [340, F - 300], [326, F - 210], [352, F - 196], [392, F - 214], [430, F - 192], [470, F - 212], [512, F - 190], [552, F - 214], [588, F - 300]];
    shape(g, spline(cloth, true, 4), { fill: '#221c1a', lit: '#5a5050', form: 'block', w: 6, seed: 2045 });
    for (const [a, b] of [[[540, F - 410], [520, F - 205]], [[470, F - 396], [450, F - 200]], [[400, F - 360], [392, F - 212]]]) stroke(g, [a, [lerp(a[0], b[0], .5) - 8, lerp(a[1], b[1], .5)], b], { w: 3, seed: 2046 + a[0], color: '#5a5050' });
    stroke(g, [[340, F - 300], [470, F - 330], [588, F - 300]], { w: 2.5, seed: 2049, color: '#6a6060' });
    // the flash tray, held up high in his free hand
    const ty = F - 620 - lift * 10;
    shape(g, rrect(300, ty, 140, 22, 6), { fill: '#b8b8b0', w: 4, seed: 2511, form: 'block' });
    if (t < tShots) shape(g, ellipse(370, ty - 8, 40, 10), { fill: '#e8e0c8', w: 3, seed: 2513, form: false });
    if (t > tShots + .1) { const u = easeOut(ramp(t, tShots + .1, .4)); chatPic(g, lens[0] + 50, lens[1] + 60 + u * 70, 140, 160, { print: true, comma: false, ang: .1 + u * .15 }); }
    g.restore();
    const sxF = 370 * c.z + (W / 2 - c.x * c.z), syF = (ty - 10) * c.z + (H / 2 - c.y * c.z);
    flash(g, sxF, syF, (t - tShots) / .6, W, H);
  }, { id: 'v1-flash' });

  // ---- 7. commas cause such dramas: push in on the phone (its edge in shot): in the message on its
  //         screen the comma opens its eyes, trembles, swoons, and topples out of the line to faint
  const F7 = 'A red notification', tA7 = at(F7, 'A'), tRed = at(F7, 'red'), tNotif = at(F7, 'notification');
  const t7 = tA7 - .1;
  // where the comma sits on the phone's screen, found once by drawing the phone into a scratch canvas
  let COMMA_AT = null;
  const commaAt = () => {
    if (!COMMA_AT) gymPhone(document.createElement('canvas').getContext('2d'), 960, F, .7, chatScreen(0, { comma: false, at: p => { COMMA_AT = p; } }), { t: 0, dance: 0 });
    return COMMA_AT;
  };
  shot(t6, t7, (g, T) => {
    const t = now(), fall = ramp(t, tSuch, .45);
    // the camera pushes in on the comma as it wakes, so it reads as a character, then pulls back to
    // watch it fall
    const CX0 = 975, CY0 = F - 290, [ax, ay] = commaAt();
    const pin = easeInOut(ramp(T, tCommas + .02, .35)), pout = easeInOut(ramp(T, tSuch - .05, .5));
    const Z = lerp(lerp(3.0, 5.8, pin), 3.4, pout);
    const vx = lerp(lerp(CX0, ax, pin), ax - 6, pout), vy = lerp(lerp(CY0, ay, pin), (ay + CY0 + 105) / 2, pout);
    // full frame: the phone's chat fills the picture, the workshop behind it
    g.save(); g.translate(W / 2, 690); g.scale(Z, Z); g.translate(-vx, -vy);
    const wsc = workshop(); g.drawImage(wsc, -(wsc.ox || 0), 0);
    let at2 = null;
    gymPhone(g, 960, F, .7, chatScreen(t, { comma: false, at: p => { at2 = p; } }), { t, dance: 0, eyes: { expr: fall > .5 ? 'worried' : 'open', lx: -.3, ly: .9 } });
    const [cx0, cy0] = at2;
    const alive = ramp(t, tCommas + .1, .18);
    if (alive < .05) commaGlyph(g, cx0, cy0, 21);
    else {
      const pose = t < tCause ? 'tremble' : fall < 1 ? 'swoon' : 'faint';
      const x = lerp(cx0, cx0 - 12, fall), y = lerp(cy0 - 3, CY0 + 105, fall * fall) - Math.sin(fall * Math.PI) * 10;
      comma(g, x, y, lerp(18, 30, alive), { t, pose, p: ramp(t, tCause, .35) });
      if (fall >= 1) pops(g, x + 4, y - 8, 12, 5, { a0: -Math.PI * .9, span: Math.PI * .8, w: 1.6 });
    }
    g.restore();
    lowerShade(g, .62, 1000);
  }, { id: 'v1-comma' });

  // ---- 8. a red notification: the screenshot check (an alarm clock's bells on its head) stands by the
  //         framed picture it expects; the new photo is pinned beside it; one comma missing, ringed in
  //         red; the bells ring and the red flag shoots up
  const G9 = 'My "test"? Fantastic', tMy9 = at(G9, 'My'), tFant = at(G9, 'Fantastic'), tAuto = at(G9, 'automatic');
  const H10 = 'I change its expectation', tI = at(H10, 'I'), tChange = at(H10, 'change'), tIts = at(H10, 'its'), tExp = at(H10, 'expectation');
  const t8 = tMy9 - .1;
  const pictures = (g, t, o = {}) => {
    // the gilt frame with what's expected (comma and all), and the new photo pinned up beside it
    const fx = 560, fy = F - 300;
    shape(g, rrect(fx - 190, fy - 150, 230, 210, 8), { fill: GOLD, shade: GOLD_SH, lit: '#ffe9a8', form: 'block', w: 6, seed: 2700 });
    const A = chatPic(g, fx - 75, fy - 45, 194, 174, { comma: o.framed !== 'new' });
    let B = null;
    if (o.photo !== false) { B = chatPic(g, o.px ?? fx + 150, o.py ?? fy - 40, 186, 166, { print: true, comma: false, gap: o.gap, ang: o.pang ?? .06 }); dot(g, (o.px ?? fx + 150), (o.py ?? fy - 40) - 100, 7, RED); }
    return { framed: A.comma, photo: B && B.comma };
  };
  shot(t7, t8, (g, T) => {
    // close on the two pictures first: the comma in the expected one ringed in gold, the gap in the new
    // one ringed in red; then the camera pulls back as the check's bells ring and its red flag shoots up
    const Zc = 2.3, close = { x: 592, y: F - 345 + (H / 2 - 690) / Zc, z: Zc };
    const c = cam([[t7, close], [tNotif - .22, { ...close, z: Zc * 1.04, y: F - 345 + (H / 2 - 690) / (Zc * 1.04) }], [tNotif + .12, fc(640, 1.5)], [t8, fc(650, 1.42)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 600, F, 260); footShadow(g, 860, F, 200);
    const ring = t > tNotif - .02 ? 1 : 0;
    const P = pictures(g, t, {});
    ringMark(g, P.framed[0], P.framed[1] + 2, 26, GOLD_SH, ramp(t, tA7 + .02, .28));
    ringMark(g, P.photo[0], P.photo[1] + 2, 28, RED, ramp(t, tRed - .08, .28));
    const up = pop(t, tNotif, .22);
    check(g, 860, F, 1.5, { t, bells: ring, flag: clamp(up), flagCol: RED, wave: t > tNotif + .2, look: -.7, squash: kick(t, tNotif, .2) * .4 });
    if (t > tNotif) burst(g, 860, F - 330, 110, (t - tNotif) / .45, 12, RED, 77);
    // the comma, fainted at the easel's foot
    comma(g, 470, F - 30, 56, { t, pose: 'faint', tear: true });
    g.restore();
  }, { id: 'v1-red' });

  // ---- 9. my "test"? fantastic, automatic: Clawd, with a flourish of the paste brush, slaps paste all
  //         over the framed picture in a blur, the bells still ringing
  shot(t8, tI - .1, (g, T) => {
    const c = cam([[t8, fc(665, 1.24)], [tI - .1, fc(662, 1.26)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 560, F, 260); footShadow(g, 820, F, 330); footShadow(g, 1020, F, 200);
    const blur = t > tAuto - .05 ? Math.sin(t * 40) : 0, flourish = ramp(t, tFant - .05, .2);
    pictures(g, t, { px: 780, py: F - 560, pang: -.2, photo: true });
    // the paste on the picture, spreading as he brushes
    const spread = ramp(t, tAuto - .05, .5);
    if (spread > 0) { g.save(); g.globalAlpha = .75 * spread; g.fillStyle = C('#f4f7e6'); for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(560 - 70 + (i % 3) * 70 + Math.sin(i * 3) * 10, F - 330 + Math.floor(i / 3) * 70, 40 * spread, 26 * spread, .3, 0, TAU); g.fill(); } g.restore(); }
    clawd(g, 820, F, .95, { t, dance: .5, face: -.6, L: t < tAuto ? (flourish > 0 ? 'jazz' : 'hips') : { to: [.62, -.34 + blur * .06], pose: 'grip' }, R: t < tAuto ? 'jazz' : 'hips', hold: { L: t > tAuto ? (g, x, y, a, s) => brush(g, x, y, Math.PI + .5 + blur * .25, .9 * s, { wet: true }) : null }, eyes: { expr: t < tAuto ? 'happy' : 'open', lx: -.8 }, sing: true });
    // the check stands a step nearer us than Clawd, so its flag is never behind his hat
    check(g, 1020, F, 1.3, { t, bells: 1, flag: 1, flagCol: RED, wave: true, look: -.7 });
    if (t > tAuto) speedLines(g, 640, F - 330, -1, 90, 4, 2750);
    comma(g, 430, F - 30, 56, { t, pose: 'faint', tear: true });
    g.restore();
  }, { id: 'v1-auto' });

  // ---- 10. I change its expectation: SLAP, the new photo pasted over the framed picture; the bells
  //          stop, the flag swings to green; the comma at the easel's foot sits up and sniffs, ignored
  const I11 = 'To boost my score', tTo = at(I11, 'To'), tBoost = at(I11, 'boost'), tScore = at(I11, 'score'), tCover = at(I11, 'cover'), tMore = at(I11, 'more');
  const t10 = tTo - .08;
  shot(tI - .1, t10, (g, T) => {
    const c = cam([[tI - .1, fc(662, 1.26)], [tExp, fc(668, 1.28)], [t10, fc(672, 1.3)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 560, F, 260); footShadow(g, 830, F, 330); footShadow(g, 1020, F, 200);
    const slap = ramp(t, tChange - .1, tExp - tChange + .1), done = t > tExp;
    const fx = 560, fy = F - 300;
    // the frame; the photo travels from Clawd's glove onto it
    shape(g, rrect(fx - 190, fy - 150, 230, 210, 8), { fill: GOLD, shade: GOLD_SH, lit: '#ffe9a8', form: 'block', w: 6, seed: 2700, squash: 0 });
    chatPic(g, fx - 75, fy - 45, 194, 174, { comma: !done });
    if (!done) chatPic(g, lerp(790, fx - 75, easeInOut(slap)), lerp(F - 420, fy - 45, easeInOut(slap)), lerp(186, 190, slap), lerp(166, 170, slap), { print: true, comma: false, ang: lerp(-.2, 0, slap) });
    else { g.save(); g.globalAlpha = .5; g.fillStyle = C('#f4f7e6'); g.fillRect(fx - 176, fy - 136, 202, 182); g.restore(); }
    if (t > tExp && t < tExp + .35) pops(g, fx - 75, fy - 40, 150, 10, { a0: 0, span: TAU * .9, w: 7 });
    // done, he dusts off his gloves, nose in the air, with his back to the crying comma
    const dust = done ? Math.sin((t - tExp) * 22) : 0;
    clawd(g, 830, F, .95, { t, dance: .5, face: done ? .7 : -.6, L: done ? { to: [.1 + dust * .05, -.2], pose: 'flat' } : { to: [lerp(.62, 1.0, slap), lerp(-.34, -.42, slap)], pose: 'grip' }, R: done ? { to: [.12 - dust * .05, -.2], pose: 'flat' } : 'hips', eyes: { expr: done ? 'smug' : 'open', lx: done ? .9 : -.8, ly: done ? -.4 : 0 }, sing: true, smile: done ? 1.3 : 1 });
    // the check a step nearer us than Clawd, so its flag's swing from red to green is in plain sight
    check(g, 1020, F, 1.3, { t, bells: done ? 0 : 1, flag: 1, flagCol: done ? GREEN : RED, wave: true, look: -.7, squash: kick(t, tExp, .2) * .4 });
    if (done) burst(g, 1020, F - 300, 100, (t - tExp) / .45, 10, GOLD, 78);
    comma(g, 430, F - 34, 64, { t, pose: done ? 'sniff' : 'faint', tear: true, lx: .8 });
    g.restore();
  }, { id: 'v1-expect' });

  // ---- 11. to boost my score, I cover more: a crate of checks poured over the phone buries it
  const t11 = at('They\'ve trained me', 'They') - .1;
  shot(t10, t11, (g, T) => {
    const c = cam([[t10, fc(800, 1.1)], [t11, fc(790, 1.04)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 720, F, 300);
    const pour = ramp(t, tBoost - .1, tMore - tBoost + .25);
    gymPhone(g, 720, F, .7, sumScreen(t, { sum: '2+2', ans: '5', bug: true }), { t, eyes: { expr: pour > .5 ? 'worried' : 'open', lx: .5, ly: -.6 } });
    const R = rng(2700), N = 30;
    for (let i = 0; i < N; i++) {
      const u = clamp((pour * (N + 3) - i) / 3); if (u <= 0) continue;
      const row = Math.floor(i / 6), col = i % 6;
      const tx = 720 + (col - 2.5) * 66 + (row % 2) * 33 + (R() - .5) * 18, ty = F - row * 74 - R() * 8;
      const x = lerp(850, tx, easeOut(u)), y = lerp(F - 520, ty, u * u) - Math.sin(u * Math.PI) * 90;
      check(g, x, y, .82, { t, flag: u > .9 ? 1 : 0, flagCol: GREEN, wave: true, phase: i, seed: i, look: R() - .5 });
    }
    // Clawd at the right, the crate up in both hands, tipping it over the phone
    const tip = easeOut(ramp(t, tBoost - .2, .4));
    clawd(g, 1010, F, .86, { t, dance: .4, L: { to: [.12, -1.12], pose: 'grip', behind: true }, R: { to: [-.32, -1.16], pose: 'grip', behind: true }, eyes: { expr: 'happy', ly: -.4 }, sing: true, face: -.5 });
    g.save(); g.translate(950, F - 470); g.rotate(-.95 * tip); crate(g, 0, 70, .62); g.restore();
    g.restore();
  }, { id: 'v1-cover' });
}
