// Chorus 1: the testing crew arrives and actually tests Clawd's app.
//  "Did you actually test it?" — on the piano's fill the workshop door rattles, then bursts open: the
//     crew in the doorway against a blaze of light; in the band's stop Guess's eye swells in his glass.
//  "Press it, stress it, second-guess it!" — three cuts on the three words: Press jabs the phone,
//     Stress bear-hugs it till his gauge hits the red, Guess circles it with his glass.
//  "Find a clue? Congratulations!" — under the glass, the beetle in the code; Guess's antenna springs
//     to "!"; Press and Stress throw confetti and pin a rosette on him.
//  "Now pursue its implications." — the beetle bolts along the bench into the pasted check; the crew
//     chases it in a line; the glass finds two beetles in the check.
//  "What did you try? What did you find?" — a swinging lamp: Clawd on a stool, the crew leaning in;
//     he shrugs (try?), lifts his boater and a moth flies out (find?).
//  "What changed your mind?" — Guess hands him the glass; through it, the twin beetles; a lightbulb;
//     he drops his cane and holds the glass up high. Iris out on his eye.
import { W, H, TAU, clamp, lerp, now, hash, rng, easeOut, easeInOut, backOut, smooth } from '../kit.js';
import { INK, CREAM, GOLD, GOLD_SH, GREEN, RED, WHITE, TEAL, ROSE, OCHRE, CORAL, C, sh, lt } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { workshop, WS, workshopDoor, door, DOOR } from '../places.js';
import { clawd, cane } from '../clawd.js';
import { guess, press, stress, check } from '../crew.js';
import { phone, bug, magnifier } from '../cast.js';
import { code } from '../props.js';
import { at, ramp, pop, kick, shakeAt, place, cam, floorCam, sparkle, footShadow, burst, confetti, speedLines, irisInsert, withLayer, backlit } from '../common.js';
import { shape, stroke, ellipse, rrect, spline, glove, dot, line } from '../ink.js';
import { star, pops, qmark, bang, sweat, heart } from '../rig.js';
import { appCode } from './verse1.js';
import { gymPhone, codeScreen, sticker } from '../gymapp.js';

const F = WS.floor;
const fc = (x, z) => floorCam(x, z, F);
// A rosette: a ribbon medal, pinned on.
function rosette(g, x, y, s) {
  for (const d of [-1, 1]) shape(g, [[x + d * 6 * s, y], [x + d * 24 * s, y + 70 * s], [x + d * 10 * s, y + 58 * s], [x, y + 74 * s]], { fill: '#2f6fb0', w: 3.5 * s, seed: 4000 + d, form: false });
  const P = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = (i % 2 ? 30 : 36) * s; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  shape(g, P, { fill: '#2f6fb0', w: 3.5 * s, seed: 4003 });
  shape(g, ellipse(x, y, 20 * s, 20 * s), { fill: GOLD, w: 3.5 * s, seed: 4004, gloss: { x: .3, y: .25, w: .14, h: .12, dot: false } });
}
// A moth, flapping.
function moth(g, x, y, s, t) {
  const f = Math.sin(t * 40) * .6;
  for (const d of [-1, 1]) shape(g, ellipse(x + d * 14 * s, y - 4 * s, 16 * s, 11 * s * (1 - Math.abs(f) * .5), d * (.5 + f)), { fill: '#c9b89a', w: 3 * s, seed: 4010 + d, form: false });
  shape(g, ellipse(x, y, 6 * s, 12 * s), { fill: '#8a7a62', w: 3 * s, seed: 4012, form: false });
}
// A lightbulb, lit by `on`.
function bulb(g, x, y, s, on) {
  if (on > 0) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 4, x, y, 150 * s); gr.addColorStop(0, `rgba(255,236,160,${.8 * on})`); gr.addColorStop(1, 'rgba(255,236,160,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 150 * s, 0, TAU); g.fill(); g.restore(); }
  shape(g, spline([[x - 34 * s, y + 10 * s], [x - 42 * s, y - 30 * s], [x, y - 62 * s], [x + 42 * s, y - 30 * s], [x + 34 * s, y + 10 * s], [x + 16 * s, y + 36 * s], [x - 16 * s, y + 36 * s]], true, 6), { fill: on > .5 ? '#fff2a8' : '#e8e4d8', w: 5 * s, seed: 4020, form: 'round', gloss: { x: .3, y: .25, w: .12, h: .1 } });
  shape(g, rrect(x - 18 * s, y + 34 * s, 36 * s, 30 * s, 5 * s), { fill: '#a9a294', form: 'block', w: 4 * s, seed: 4021 });
  for (let i = 0; i < 2; i++) stroke(g, [[x - 18 * s, y + 44 * s + i * 10 * s], [x + 18 * s, y + 44 * s + i * 10 * s]], { w: 2.5 * s, seed: 4022 + i });
  if (on > .5) pops(g, x, y - 20 * s, 70 * s, 7, { a0: -Math.PI, span: Math.PI, w: 5 * s, col: GOLD_SH });
}

export function register() {
  const A = 'Did you actually t', B = 'Press it, stress i', Cc = 'Find a clue? Congr', D = 'Now pursue its imp', E = 'What did you try? ', Fx = 'What changed your ';
  const tDid = at(A, 'Did'), tTest = at(A, 'test'), tIt = at(A, 'it');
  const tPress = at(B, 'Press'), tStress = at(B, 'stress'), tGuess = at(B, 'second-guess');
  const tFind = at(Cc, 'Find'), tClue = at(Cc, 'clue'), tCongr = at(Cc, 'Congratulations');
  const tNow = at(D, 'Now'), tPursue = at(D, 'pursue'), tImpl = at(D, 'implications');
  const tWhat = at(E, 'What'), tTry = at(E, 'try'), tWhat2 = when2(E, 4), tFound = when2(E, 7);
  const tChanged = at(Fx, 'changed'), tMind = at(Fx, 'mind');
  const t0 = 40.98, tEnd = 58.92;

  // ---- 1. the door: rattles on the fill, bursts open on "Did"; the crew against the light
  shot(t0, tPress - .08, (g, T) => {
    const burst0 = tDid - .06, t = now();
    const c = { ...cam([[t0, floorCam(700, 1.12, DOOR.floor)], [burst0, floorCam(700, 1.16, DOOR.floor)], [tTest - .1, floorCam(700, 1.32, DOOR.floor)], [tPress, floorCam(700, 1.36, DOOR.floor)]], T) };
    const knock = Math.max(shakeAt(T, 41.02, 6, .12), shakeAt(T, 41.3, 7, .12));
    g.save(); c.x -= knock; place(g, workshopDoor(), c);
    const open = easeOut(ramp(t, burst0, .14));
    // light spilling in across the boards, and the burst of it as the door flies open: behind the crew
    if (open > .1) { g.save(); g.beginPath(); g.rect(-500, -500, 2500, DOOR.floor + 500); g.clip(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .3 * open; g.fillStyle = '#fff2c8'; g.beginPath(); g.moveTo(DOOR.open[0], DOOR.open[1]); g.lineTo(DOOR.open[0] + DOOR.open[2], DOOR.open[1]); g.lineTo(DOOR.open[0] + DOOR.open[2] + 260, DOOR.floor); g.lineTo(DOOR.open[0] - 260, DOOR.floor); g.closePath(); g.fill(); g.restore(); }
    if (t > burst0 && t < burst0 + .4) pops(g, 700, 700, 460, 12, { a0: 0, span: TAU * .92, w: 9, col: '#ffe9b0' });
    // the crew in the doorway, backlit
    let lens = null;
    if (open > .05) withLayer(g, (lg) => {
      stress(lg, 470, DOOR.floor, .86, { t, L: 'hips', R: 'cheer', gauge: .5, eyes: { lx: .3 }, dance: .2 });
      press(lg, 935, DOOR.floor, .86, { t, L: 'up', R: 'press', eyes: { lx: -.3 }, dance: .3 });
      guess(lg, 700, DOOR.floor + 10, 1.0, { t, L: 'hips', R: { to: [.25, -1.25], pose: 'grip' }, hold: { R: (g, x, y, a, s) => { lens = magnifier(g, x, y, -.4, s * 1.1, { inside: (g, lx, ly, r) => { g.fillStyle = '#f4efe2'; g.fillRect(lx - r, ly - r, r * 2, r * 2); eyeBig(g, lx, ly, r, t); } }); } }, eyes: { lx: .2 }, dance: .2 });
    }, backlit(.55));
    door(g, open, t);
    g.restore();
    // "test it?": we zoom into his glass; the eye in it swells to fill the frame
    const swell = easeInOut(ramp(T, tTest - .18, .32));
    if (swell > 0 && lens) {
      const lx = (lens.x - c.x) * c.z + W / 2, ly = (lens.y - c.y) * c.z + H / 2, lr = lens.r * c.z;
      const cx = lerp(lx, W / 2, swell), cy = lerp(ly, 690, swell), r = lerp(lr, 470, swell);
      irisInsert(g, cx, cy, r, (g, x, y, R) => { g.fillStyle = C('#f4efe2'); g.fillRect(x - R, y - R, R * 2, R * 2); eyeBig(g, x, y, R, t, 1); }, 1, { dark: swell * .6, rim: '#b07f1c', rimW: lerp(14, 10, swell) });
    }
  }, { id: 'c1-door' });

  // ---- 2. press it, stress it, second-guess it: three cuts
  // the app, on its pink phone, under test
  const phoneAt = (g, t, o = {}) => gymPhone(g, 700, F, .78, o.screen || codeScreen(t), { t, ...o });
  shot(tPress - .08, tStress - .06, (g, T) => {
    const c = cam([[tPress - .08, fc(760, 1.4)], [tStress, fc(760, 1.46)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 700, F, 260); footShadow(g, 930, F, 220);
    const jab = Math.abs(Math.sin((t - tPress) * 34));
    phoneAt(g, t, { eyes: { expr: 'wide', lx: Math.sin(t * 30) * .8 }, lean: -jab * .03 });
    press(g, 905, F, 1.25, { t, sing: true, pressed: jab, L: 'hips', R: { to: [-1.25 + jab * .2, -1.2], pose: 'point' }, eyes: { lx: -.9 }, dance: .2 });
    for (let i = 0; i < 3; i++) { g.save(); g.globalAlpha = .4; glove(g, 790 - i * 22 + jab * 20, F - 360 - i * 34, Math.PI, 26, 'point', { seed: 4030 + i }); g.restore(); }
    pops(g, 720, F - 300, 70 + jab * 20, 6, { a0: 0, span: TAU * .8, w: 5 });
    g.restore();
  }, { id: 'c1-press' });
  shot(tStress - .06, tGuess - .06, (g, T) => {
    const c = cam([[tStress - .06, fc(700, 1.32)], [tGuess, fc(700, 1.4)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 700, F, 320);
    const sq = ramp(t, tStress, .35);
    stress(g, 700, F, 1.05, { t, sing: true, gauge: .3 + sq * .7, steam: sq > .7 ? 1 : 0, shake: sq, L: { to: [.25, .02], pose: 'open', behind: true }, R: { to: [.25, .02], pose: 'open' }, eyes: { expr: sq > .5 ? 'shut' : 'open' }, frown: 1, dance: .1 });
    // the phone squeezed in his arms
    g.save(); g.translate(700, F - 190); g.scale(1 - sq * .25, 1 + sq * .12); g.translate(-700, -(F - 190));
    gymPhone(g, 700, F - 60, .5, codeScreen(t), { t, legs: false, eyes: { expr: sq > .4 ? 'wide' : 'open' }, dance: 0 });
    g.restore();
    stroke(g, [[700 - 140, F - 240], [700 + 140, F - 240]], { w: 16, seed: 4040, taper: false });
    if (sq > .6) for (const d of [-1, 1]) sweat(g, 700 + d * 120, F - 420, 1.2);
    g.restore();
  }, { id: 'c1-stress' });
  shot(tGuess - .06, tFind - .1, (g, T) => {
    const c = cam([[tGuess - .06, fc(700, 1.3)], [tFind, fc(700, 1.36)]], T), t = now();
    g.save(); place(g, workshop(), c);
    const circ = (t - tGuess) / (tFind - tGuess);
    const gx = 700 + Math.cos(circ * Math.PI * 1.4) * 230;
    footShadow(g, 700, F, 260); footShadow(g, gx, F, 220);
    const front = Math.sin(circ * Math.PI * 1.4) > 0;
    const drawG = () => guess(g, gx, F, .95, { t, sing: true, walk: circ * 4, face: -Math.sign(Math.cos(circ * Math.PI * 1.4)) * .6, L: 'chin', R: 'hold', hold: { R: (g, x, y, a, s) => magnifier(g, x, y, Math.cos(circ * Math.PI * 1.4) > 0 ? Math.PI + .3 : -.3, s * .9) }, brow: 1.4, eyes: { lx: -Math.cos(circ * Math.PI * 1.4) * .9 }, dance: .1 });
    if (!front) drawG();
    phoneAt(g, t, { eyes: { expr: 'worried', lx: Math.cos(circ * Math.PI * 1.4) } });
    if (front) drawG();
    g.restore();
  }, { id: 'c1-guess' });

  // ---- 3. find a clue? congratulations!
  shot(tFind - .1, tNow - .08, (g, T) => {
    const c = cam([[tFind - .1, fc(700, 1.25)], [tNow, fc(700, 1.2)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 600, F, 260); footShadow(g, 860, F, 230); footShadow(g, 380, F, 260); footShadow(g, 1060, F, 230);
    const found = ramp(t, tClue, .15);
    phoneAt(g, t, { eyes: { expr: 'worried', lx: .6 }, screen: appCode(t, { look: .8 }) });
    const k = guess(g, 930, F, .95, { t, sing: true, bang: found, L: t > tCongr ? 'cheer' : 'chin', R: { to: [-1.3, -.6], pose: 'grip' }, hold: { R: (g, x, y, a, s) => magnifier(g, x, y, Math.PI + .5, s * .9, { inside: (g, lx, ly, r) => { g.fillStyle = '#fbf6e8'; g.fillRect(lx - r, ly - r, r * 2, r * 2); code(g, lx - r * .9, ly - r * .5, r * 1.6, { t, bugScale: 2.2, look: 1 }); } }) }, eyes: { expr: t > tCongr ? 'happy' : 'wide', lx: -.8 }, brow: 1.4 });
    if (t > tCongr) {
      press(g, 380, F, .85, { t, L: 'cheer', R: 'up', eyes: { expr: 'happy' }, jump: Math.abs(Math.sin((t - tCongr) * 8)) * .3 });
      stress(g, 1110, F, .75, { t, L: 'cheer', R: 'hips', steam: 1, gauge: .6, eyes: { expr: 'happy' } });
      const pin = easeOut(ramp(t, tCongr + .15, .25));
      rosette(g, lerp(560, 930, pin), lerp(F - 600, k.cy + 30, pin), .9);
      confetti(g, t, tCongr, 60, { seed: 4050, burst: true, y0: F - 600, x0: 200, w: 900 });
    }
    if (t > tClue && t < tClue + .5) burst(g, 930, k.top + 20, 90, (t - tClue) / .5, 10, GOLD, 4051);
    // the testers' mark on the app: "?!", a problem found (the app's own checks are all green)
    const tSlap = tClue + .12;
    sticker(g, 640, F - 300, 64, { p: ramp(t, tSlap, .16), ang: .25, since: t - (tSlap + .16) });
    g.restore();
  }, { id: 'c1-clue' });

  // ---- 4. now pursue its implications: the beetle has run; Guess follows its footprints along the
  //         bench with his glass, each print magnified as he passes, to the pasted check: two beetles
  // where the check's green flag flies, found once by drawing the check into a scratch canvas
  let FLAG = null;
  const flagAt = () => FLAG || (FLAG = check(document.createElement('canvas').getContext('2d'), 1080, F, 1.5, { t: tImpl, flag: 1, flagCol: GREEN }).flagTip);
  const tSlap = tImpl + .72;
  shot(tNow - .08, tWhat - .14, (g, T) => {
    // Guess and the camera travel on every frame; his stride and everything else change on twos. Once
    // the glass finds the beetles, the camera pushes in on the check, and Guess slaps the testers' "?!"
    // over its green flag; the check waves on regardless
    const t = now(), walk = ramp(T, tNow - .05, tImpl - tNow + .25);
    const gx = lerp(470, 800, easeInOut(walk));
    const [fx, fy] = flagAt(), Zc = 2.0;
    const close = { x: fx + 72, y: fy + 60 + (H / 2 - 640) / Zc, z: Zc };
    const c = cam([[tNow - .08, fc(520, 1.32)], [tImpl + .2, fc(900, 1.32)], [tImpl + .3, fc(915, 1.34)], [tSlap - .12, close], [tWhat, { ...close, z: Zc * 1.04 }]], T);
    g.save(); place(g, workshop(), c);
    footShadow(g, 330, F, 220); footShadow(g, 1080, F, 200); footShadow(g, gx, F, 200);
    gymPhone(g, 330, F, .66, codeScreen(t, { bug: false }), { t, eyes: { lx: .8 } });
    if (t > tFind) sticker(g, 300, F - 240, 44, { p: 1, ang: .25 });
    // the trail: little six-legged prints from the phone to the check
    for (let i = 0; i < 16; i++) { const x = 430 + i * 38, side = i % 2 ? 1 : -1; for (let k = 0; k < 3; k++) dot(g, x + k * 7, F - 16 + side * 6 + (k - 1) * 4, 3.2, '#3a2414'); }
    const ck = check(g, 1080, F, 1.5, { t, flag: 1, flagCol: GREEN, wave: true, look: -.6, squash: kick(t, tImpl, .2) * .3, card: (g, x, y, w, h, s) => code(g, x - w * .42, y - h * .36, w * .84, { t, bugScale: .9 }) });
    // Guess, bent to the trail, his glass close over the prints; at the check he straightens and holds
    // the same glass over its card, where it finds two beetles
    const lift = easeInOut(ramp(t, tImpl + .05, .35));
    // in the glass, the bench top magnified: pale grain under the lens, and the beetle's prints, big
    const tracks = (g, lx, ly, r) => {
      g.fillStyle = '#ecd6ae'; g.fillRect(lx - r, ly - r, r * 2, r * 2);
      g.save(); g.strokeStyle = 'rgba(150,104,62,.4)'; g.lineWidth = 2.5; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(lx - r, ly + k * r * .38 + 6); g.quadraticCurveTo(lx, ly + k * r * .38 - 4, lx + r, ly + k * r * .38 + 8); g.stroke(); } g.restore();
      for (let k = 0; k < 3; k++) { const px = lx - r * .62 + k * r * .62, py = ly + (k % 2 ? r * .2 : -r * .2); for (let d = 0; d < 3; d++) dot(g, px + (d - 1) * r * .15, py + (d === 1 ? -r * .13 : r * .05), r * .085, '#3a2414'); }
      g.fillStyle = 'rgba(190,226,232,.18)'; g.fillRect(lx - r, ly - r, r * 2, r * 2);
    };
    const beetles = (g, lx, ly, r) => { g.fillStyle = '#fbf6e8'; g.fillRect(lx - r, ly - r, r * 2, r * 2); bug(g, lx - r * .38, ly, .9, { t, dir: 1, look: .5 }); bug(g, lx + r * .38, ly, .9, { t, dir: -1, look: -.5 }); };
    // his free glove reaches up across himself with the sticker and pats it onto the flag, then drops
    const reach = easeOut(ramp(t, tSlap - .2, .2)) * (1 - easeInOut(ramp(t, tSlap + .35, .3)));
    const sx = ck.flagTip ? ck.flagTip[0] + 34 : 0, sy = ck.flagTip ? ck.flagTip[1] + 30 : 0;
    const Lto = reach > 0 ? { to: [lerp(.2, -(sx + 10 - (gx - 67)) / 92, reach), lerp(.3, (sy + 14 - (F - 200)) / 92, reach)], pose: t < tSlap ? 'grip' : 'flat' } : 'out';
    guess(g, gx, F, .92, { t, walk: walk > 0 && walk < 1 ? t * 4.4 : undefined, lean: lerp(.22, .08, lift), eyes: { lx: .9, ly: lerp(.8, .5, lift) - reach * .6, expr: lift > .9 ? 'wide' : 'open' }, brow: 1.4, sing: true,
      R: { to: [lerp(.9, .23, lift), lerp(.62, .2, lift)], pose: 'grip' }, hold: { R: (g, x, y, a, s) => magnifier(g, x, y, lerp(.1, .6, lift), s * lerp(.82, 1.05, lift), { inside: lift < .5 ? tracks : beetles }), L: t < tSlap && reach > .05 ? (g, x, y) => sticker(g, x + 8, y - 10, 34, { p: 1, ang: -.2 }) : null }, L: Lto });
    if (t > tImpl + .3 && t < tImpl + .7) pops(g, 1080, F - 110, 110, 8, { a0: -Math.PI, span: TAU * .9, w: 6 });
    // the check still waves green over two beetles; the testers' "?!" goes on, right over its flag, and
    // rides it as it waves
    if (ck.flagTip && t >= tSlap) sticker(g, sx, sy, 38, { p: 1, ang: -.2, since: t - tSlap });
    g.restore();
  }, { id: 'c1-pursue' });

  // ---- 5. what did you try? what did you find? the swinging lamp
  shot(tWhat - .14, tChanged - .2, (g, T) => {
    const c = cam([[tWhat - .14, fc(700, 1.15)], [tChanged, fc(700, 1.25)]], T), t = now();
    g.save(); place(g, workshop(), c);
    // the room darkened, one lamp swinging over Clawd
    g.save(); g.fillStyle = 'rgba(8,4,2,.62)'; g.fillRect(-500, -500, 3000, 4000); g.restore();
    const sw = Math.sin((t - tWhat) * 3.2) * .28, lx = 700 + Math.sin(sw) * 520, ly = F - 900 + 520 - Math.cos(sw) * 520;
    stroke(g, [[700, F - 900 - 300], [lx, ly]], { w: 5, seed: 4070, taper: false });
    g.save(); g.globalCompositeOperation = 'screen';
    const cone = g.createLinearGradient(lx, ly, 700, F); cone.addColorStop(0, 'rgba(255,236,190,.6)'); cone.addColorStop(1, 'rgba(255,236,190,.12)');
    g.fillStyle = cone; g.beginPath(); g.moveTo(lx - 20, ly); g.lineTo(lx + 20, ly); g.lineTo(700 + 280 + (lx - 700) * .2, F); g.lineTo(700 - 280 + (lx - 700) * .2, F); g.closePath(); g.fill(); g.restore();
    shape(g, spline([[lx - 50, ly + 30], [lx - 40, ly - 10], [lx, ly - 24], [lx + 40, ly - 10], [lx + 50, ly + 30]], true, 4), { fill: '#3a3a36', w: 5, seed: 4071 });
    shape(g, ellipse(lx, ly + 34, 20, 14), { fill: '#fff6d0', w: 3, seed: 4072, form: false });
    // the stool and Clawd, the crew leaning in round him
    shape(g, rrect(600, F - 120, 200, 24, 8), { fill: '#7a4a26', form: 'block', w: 5, seed: 4073 }); for (const d of [-1, 1]) stroke(g, [[700 + d * 80, F - 96], [700 + d * 96, F]], { w: 10, seed: 4074 + d, taper: false, color: '#5a3418' });
    footShadow(g, 700, F, 300);
    const lifted = t > tWhat2 ? ramp(t, tWhat2 + .1, .25) : 0;
    const k = clawd(g, 700, F - 120, .9, { t, dance: .15, L: t < tWhat2 ? 'shrug' : 'hang', R: t < tWhat2 ? 'shrug' : { to: [.02, -.7], pose: 'grip' }, eyes: { expr: 'worried', lx: .3 }, smile: -.6, hatTip: lifted, hatRot: lifted * .6 });
    if (lifted > .4) moth(g, 760 + (t - tWhat2) * 120, k.top - 120 - (t - tWhat2) * 160 + Math.sin(t * 6) * 20, 1.2, t);
    sweat(g, 590, k.top + 40, 1.1);
    guess(g, 925, F, .82, { t, L: 'chin', R: 'point', eyes: { lx: -.8 }, brow: 1.4, sing: true, lean: -.08, dance: .1 });
    press(g, 380, F, .7, { t, L: 'hips', R: 'point', eyes: { lx: .9 }, sing: t > 51.47 && t < 52.8 ? true : 0, dance: .1 });
    stress(g, 1068, F, .62, { t, L: 'hips', R: 'hips', eyes: { lx: -.9 }, sing: t > 53.67 && t < 55.1 ? true : 0, frown: 1, dance: .1 });
    g.restore();
  }, { id: 'c1-interrogate' });

  // ---- 6. what changed your mind? Guess hands Clawd the glass; through it, the twin beetles; his face
  //         goes from smug to wide-eyed; a lightbulb; he drops his cane and raises the glass
  shot(tChanged - .2, tEnd, (g, T) => {
    const c = cam([[tChanged - .2, fc(660, 1.25)], [tMind + .5, fc(700, 1.4)], [tEnd, fc(705, 1.48)]], T), t = now();
    g.save(); place(g, workshop(), c);
    const hand = ramp(t, tChanged - .1, .3), lookIn = ramp(t, tChanged + .25, .2), lit = ramp(t, tMind, .2), drop = ramp(t, tMind + .5, .4);
    footShadow(g, 700, F, 330);
    // Guess hands over the glass and steps back out of the light
    const gxs = lerp(430, 150, easeInOut(ramp(t, tMind, .8)));   // he backs right out of the shot
    footShadow(g, gxs, F, 200);
    guess(g, gxs, F, .85, { t, walk: t > tMind && t < tMind + .8 ? t * 4 : undefined, L: lit > .5 ? 'cheer' : 'hips', R: hand < 1 ? { to: [1.3 - hand * .3, -.5], pose: 'grip' } : 'hips', bang: 1, eyes: { expr: lit > .5 ? 'happy' : 'open', lx: .8 }, dance: .3 });
    if (drop > 0) { const d2 = easeOut(drop), fall = d2 * d2; cane(g, lerp(590, 330, d2), lerp(F - 250, F - 14, fall), lerp(1.45, .03, d2), .9); }
    const expr = lookIn < .5 ? 'smug' : lit < .5 ? 'wide' : 'happy';
    const k = clawd(g, 720, F, 1, { t, dance: lit > .5 ? .7 : .2, face: lit > .5 ? 0 : .3, L: drop > 0 ? 'hips' : { to: [.1, .2], pose: 'grip' }, R: { to: [lerp(-.08, .3, lit), lerp(.02, -.62, lit)], pose: 'grip' }, hold: { R: (g, x, y, a, s) => magnifier(g, x, y, lerp(-2.25, -1.65, lit), s * .9, { inside: (g, lx, ly, r) => { g.fillStyle = '#fbf6e8'; g.fillRect(lx - r, ly - r, r * 2, r * 2); code(g, lx - r * .9, ly - r * .6, r * 1.8, { t, bugAt: -1 }); bug(g, lx - r * .3, ly + r * .1, 1.15, { t, dir: 1, look: .5 }); bug(g, lx + r * .35, ly + r * .1, 1.15, { t, dir: -1, look: -.5 }); } }) }, eyes: { expr, lx: lookIn > .5 && lit < .5 ? .5 : 0, ly: lookIn > .5 && lit < .5 ? -.6 : 0 }, sing: true });
    if (lit > 0) bulb(g, 600, k.top - 120, .85, lit);
    g.restore();
  }, { id: 'c1-mind' });
  irisJoin(tEnd, { close: .3, open: .38, x: W / 2, y: 780, x2: W / 2, y2: 760 });
}
// The word timing of the nth word of a line (by index).
import { wordsOf } from '../kit.js';
import { LEAD } from '../lyrics.js';
function when2(start, i) { return wordsOf(start)[i].s - LEAD; }
// A big eye in a lens: white, an iris, a pupil, lashes; looking at us, blinking once.
function eyeBig(g, x, y, r, t, full = 0) {
  const R = r * .78;
  shape(g, ellipse(x, y, R, R * .62, 0, 50), { fill: WHITE, w: 6, seed: 4090, form: 'round', k: .4 });
  const bl = clamp(1 - Math.abs((t - 42.55) / .07));
  shape(g, ellipse(x, y, R * .42, R * .42 * (1 - bl * .9), 0, 40), { fill: '#3a6a5a', w: 5, seed: 4091, form: 'round' });
  dot(g, x, y, R * .2 * (1 - bl * .9), INK);
  g.fillStyle = C(WHITE); g.beginPath(); g.ellipse(x - R * .12, y - R * .12, R * .08, R * .06, 0, 0, TAU); g.fill();
  stroke(g, [[x - R, y], [x, y - R * .7], [x + R, y]], { w: 8, seed: 4092 });
  for (let i = -2; i <= 2; i++) stroke(g, [[x + i * R * .3, y - R * .62 + Math.abs(i) * R * .1], [x + i * R * .38, y - R * .9 + Math.abs(i) * R * .12]], { w: 5, seed: 4093 + i });
}
