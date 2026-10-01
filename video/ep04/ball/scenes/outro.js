// The outro, back in Clawd's workshop at night: his honest report.
//  "It loses sets without the net;" — at his bench under the lamp, Clawd draws his report: the router
//     with no waves, a barbell, the dashed empty row. The red-flag check from the gym keeps him company.
//  "Who sees the logs? Not tested yet." — on the shelf, a padlocked logbook; an eye blinks in its
//     keyhole. Clawd draws an empty box with a question mark on his report, and leans his glass on it.
//  (piano tag) — he tips his boater to us, takes up the glass and heads for the logbook; the iris
//     closes on the keyhole's eye.
import { W, H, TAU, clamp, lerp, now, rng, easeOut, easeInOut, backOut } from '../kit.js';
import { INK, CREAM, GOLD, GOLD_SH, GREEN, RED, WHITE, BROWN, C } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { workshop, WS } from '../places.js';
import { clawd } from '../clawd.js';
import { check } from '../crew.js';
import { router, magnifier, wifiIcon } from '../cast.js';
import { at, ramp, pop, kick, place, cam, floorCam, footShadow, sparkle, irisInsert } from '../common.js';
import { shape, stroke, ellipse, rrect, spline, glove, dot, line } from '../ink.js';
import { qmark, sweat, arm, pops } from '../rig.js';

const F = WS.floor;
const fc = (x, z) => floorCam(x, z, F);
// A barbell icon, as Mabel's log draws one.
export function barbellIcon(g, x, y, s, col = INK) {
  stroke(g, [[x - 40 * s, y], [x + 40 * s, y]], { w: 6 * s, seed: 5001, taper: false, color: col });
  for (const d of [-1, 1]) { shape(g, rrect(x + d * 34 * s - 7 * s, y - 20 * s, 14 * s, 40 * s, 4 * s), { fill: col, w: 0, seed: 5002 + d, form: false }); shape(g, rrect(x + d * 46 * s - 5 * s, y - 13 * s, 10 * s, 26 * s, 3 * s), { fill: col, w: 0, seed: 5004 + d, form: false }); }
}
// The report: a big sheet on the bench facing us, its pictures drawn in as `p` grows (0..4).
function report(g, x, y, w, h, p, t) {
  shape(g, [[x - w / 2, y - h], [x + w / 2, y - h + 6], [x + w / 2 + 8, y], [x - w / 2 - 4, y]], { fill: '#fbf5e4', form: false, w: 5, seed: 5010 });
  for (let i = 0; i < 6; i++) stroke(g, [[x - w / 2 + 20, y - h + 40 + i * 50], [x + w / 2 - 20, y - h + 42 + i * 50]], { w: 1.5, seed: 5011 + i, color: '#c9d6e0' });
  const reveal = (k, fn) => { const q = clamp(p - k); if (q <= 0) return; g.save(); g.globalAlpha *= q; fn(); g.restore(); };
  // row 1: the router without waves, a barbell, an arrow, the dashed empty row with a red ring
  reveal(0, () => { g.save(); g.translate(x - w * .32, y - h * .72); g.scale(.42, .42); router(g, 0, 0, 1, { t, on: 0, waveR: 0 }); g.restore(); wifiIcon(g, x - w * .32, y - h * .72 - 70, 22, 0); });
  reveal(1, () => barbellIcon(g, x - w * .04, y - h * .72, .9));
  reveal(2, () => { stroke(g, [[x + w * .1, y - h * .72], [x + w * .2, y - h * .72]], { w: 5, seed: 5020 }); stroke(g, [[x + w * .17, y - h * .72 - 10], [x + w * .21, y - h * .72], [x + w * .17, y - h * .72 + 10]], { w: 5, seed: 5021 }); });
  reveal(2.5, () => { g.save(); g.setLineDash([10, 8]); g.strokeStyle = C(INK); g.lineWidth = 4; g.strokeRect(x + w * .24, y - h * .72 - 22, w * .2, 44); g.restore(); g.save(); g.strokeStyle = C(RED); g.lineWidth = 5; g.beginPath(); g.ellipse(x + w * .34, y - h * .72, w * .14, 40, -.05, 0, TAU); g.stroke(); g.restore(); });
  // row 2: a padlocked book and an empty box with a question mark
  reveal(3, () => { shape(g, rrect(x - w * .38, y - h * .34 - 34, 70, 68, 6), { fill: '#7a3a26', w: 4, seed: 5030, form: false }); shape(g, rrect(x - w * .38 + 22, y - h * .34 - 6, 26, 22, 4), { fill: GOLD, w: 3, seed: 5031, form: false }); });
  reveal(3.5, () => { g.save(); g.strokeStyle = C(INK); g.lineWidth = 5; g.strokeRect(x + w * .02, y - h * .34 - 34, 68, 68); g.restore(); qmark(g, x + w * .02 + 34, y - h * .34 - 4, 56, '#2f6fb0', { seed: 5032 }); });
}
// The logbook on the shelf: a fat leather ledger, a padlock, and an eye in the keyhole.
function logbook(g, x, y, s, t, eyeOpen) {
  shape(g, rrect(x - 110 * s, y - 280 * s, 220 * s, 280 * s, 12 * s), { fill: '#6a2e20', shade: '#3a1410', lit: '#9a4a32', form: 'block', w: 7 * s, seed: 5040, gloss: { x: .15, y: .1, w: .05, h: .04 } });
  for (let i = 0; i < 3; i++) stroke(g, [[x - 110 * s, y - 230 * s + i * 90 * s], [x + 110 * s, y - 230 * s + i * 90 * s]], { w: 6 * s, seed: 5041 + i, color: GOLD_SH });
  shape(g, rrect(x + 96 * s, y - 270 * s, 26 * s, 260 * s, 6 * s), { fill: '#efe6cc', form: 'block', w: 4 * s, seed: 5044 });
  // the padlock on a strap
  shape(g, rrect(x - 20 * s, y - 175 * s, 40 * s, 70 * s, 6 * s), { fill: '#3a2a20', w: 4 * s, seed: 5045, form: false });
  g.save(); g.strokeStyle = C('#8a8a80'); g.lineWidth = 12 * s; g.beginPath(); g.arc(x, y - 175 * s, 34 * s, Math.PI, 0); g.stroke(); g.restore();
  shape(g, rrect(x - 44 * s, y - 180 * s, 88 * s, 80 * s, 10 * s), { fill: GOLD, shade: GOLD_SH, form: 'block', w: 5 * s, seed: 5046, gloss: { x: .2, y: .2, w: .08, h: .06 } });
  // the keyhole, and the eye in it
  const kx = x, ky = y - 145 * s;
  shape(g, spline([[kx - 12 * s, ky - 10 * s], [kx, ky - 22 * s], [kx + 12 * s, ky - 10 * s], [kx + 6 * s, ky + 4 * s], [kx + 9 * s, ky + 26 * s], [kx - 9 * s, ky + 26 * s], [kx - 6 * s, ky + 4 * s]], true, 3), { fill: '#120a06', w: 2 * s, seed: 5047, form: false });
  if (eyeOpen > .05) { g.save(); g.fillStyle = C(WHITE); g.beginPath(); g.ellipse(kx, ky - 8 * s, 8 * s, 7 * s * eyeOpen, 0, 0, TAU); g.fill(); dot(g, kx + 2 * s, ky - 8 * s, 3.6 * s * eyeOpen); g.restore(); }
}

export function register() {
  const A = 'It loses sets', B = 'Who sees the logs';
  const tIt = at(A, 'It'), tLoses = at(A, 'loses'), tSets = at(A, 'sets'), tWithout = at(A, 'without'), tNet = at(A, 'net');
  const tWho = at(B, 'Who'), tSees = at(B, 'sees'), tLogs = at(B, 'logs'), tNot = at(B, 'Not'), tTested = at(B, 'tested'), tYet = at(B, 'yet');
  const t0 = 166.7, t1 = tWho - .25, tTag = 176.75, tEnd = 182.55;
  const prog = t => (t < tLoses ? 0 : t < tSets ? ramp(t, tLoses, .4) : t < tWithout ? 1 + ramp(t, tSets, .4) : 2 + ramp(t, tWithout, .9) * .99) + (t > tNot ? 1 + ramp(t, tNot, .4) * .99 : 0) + (t > tTested ? ramp(t, tTested, .3) * .5 : 0);

  // ---- 1. the report at the bench
  const tR = tWithout - .12;
  shot(t0, tR, (g, T) => {
    const c = cam([[t0, fc(705, 1.06)], [tSets, fc(718, 1.16)], [tR, fc(728, 1.2)]], T), t = now();
    g.save(); place(g, workshop(), c);
    footShadow(g, 760, F, 360); footShadow(g, 1060, F, 180);
    const draw = Math.sin(t * 22) * (t > tLoses && t < tNet + .3 ? 1 : 0);
    // the red-flag check from the gym, keeping him company
    check(g, 1110, F, 1.15, { t, flag: 1, flagCol: RED, wave: true, look: -.6, card: (g, x, y, w, h, s) => { g.save(); g.setLineDash([5 * s, 4 * s]); g.strokeStyle = C(INK); g.lineWidth = 2.5 * s; g.strokeRect(x - w * .35, y - h * .2, w * .7, h * .4); g.restore(); } });
    clawd(g, 425, F, .9, { t, dance: .25, face: .6, L: 'hips', R: { to: [.62 + draw * .03, -.12 + Math.abs(draw) * .02], pose: 'grip' }, hold: { R: (g, x, y, a, s) => { stroke(g, [[x, y], [x + 40, y + 60]], { w: 9, seed: 5050, taper: false, color: '#d9a23c' }); } }, eyes: { lx: .9, ly: .5 }, sing: true });
    report(g, 790, F - 4, 420, 340, Math.min(3, prog(t)), t);
    g.restore();
  }, { id: 'outro-report' });
  // ---- 1b. "without the net": an iris close-up on the report; his glove and pencil reach in from the
  //          left and put down the arrow and the empty row, circled
  shot(tR, t1, (g, T) => {
    const t = now(), open = easeOut(ramp(T, tR, .2)), Z = lerp(2.0, 2.16, ramp(T, tR, t1 - tR));
    const RX = 790, RY = F - 4, RW = 420, RH = 340, rowY = RY - RH * .72;
    irisInsert(g, W / 2, 690, 440, (g) => {
      g.save(); g.translate(W / 2, 690); g.scale(Z, Z); g.translate(-(RX + 6), -(rowY + 16));
      g.drawImage(workshop(), 0, 0);
      report(g, RX, RY, RW, RH, Math.min(3, prog(t)), t);
      // the pencil's tip on the newest picture (the arrow, then the empty row it points to); his arm
      // comes in from the left below the row, so it never covers a picture
      const p = prog(t), wig = p < 2.99 ? 1 : 0;
      const tipX = (p < 2.5 ? RX + RW * .15 : RX + RW * .34) + Math.sin(t * 11) * 14 * wig, tipY = rowY + 24 + Math.cos(t * 9) * 6 * wig;
      const hx = tipX - 22, hy = tipY + 62;
      arm(g, RX - 360, rowY + 230, hx, hy, { w: 12.5 * .9, gs: 25 * .9, pose: 'grip', bend: .18, seed: 17 });
      stroke(g, [[hx + 2, hy - 4], [tipX, tipY]], { w: 9, seed: 5050, taper: false, color: '#d9a23c' });
      dot(g, tipX, tipY, 3.2);
      g.restore();
    }, open);
  }, { id: 'outro-report-in' });

  // ---- 2. who sees the logs? the padlocked logbook, an eye in its keyhole; then "not tested yet"
  shot(t1, tNot - .12, (g, T) => {
    // the camera creeps in on the keyhole while we wait for the eye
    const t = now(), open = easeOut(ramp(T, t1, .2)), Z = lerp(2.9, 3.45, easeInOut(ramp(T, t1, tNot - .12 - t1))), k = Z / 3.2;
    irisInsert(g, W / 2, 690, 440, (g) => {
      g.save(); g.translate(W / 2, 690 + 140); g.scale(Z, Z); g.translate(-960, -(F - 145));
      g.fillStyle = C('#2a1a10'); g.fillRect(700, F - 500, 520, 600);
      logbook(g, 960, F, 1, t, 0);
      g.restore();
      // the eye in the keyhole, close: it opens on "sees", glances about, blinks on "logs"
      const eo = clamp((t - tSees + .05) / .2) * (t > tLogs && t < tLogs + .14 ? .08 : 1);
      if (eo > .05) { const ex = W / 2, ey = 690 + 140 - 8 * Z, px = ex + Math.sin(t * 5) * 9 * k; g.save(); g.fillStyle = C(WHITE); g.beginPath(); g.ellipse(ex, ey, 26 * k, 22 * k * eo, 0, 0, TAU); g.fill(); dot(g, px, ey + 2 * k, 11 * k * eo); g.fillStyle = C(WHITE); g.beginPath(); g.arc(px - 4 * k, ey - 3 * k, 3.5 * k * eo, 0, TAU); g.fill(); g.restore(); }
    }, open);
  }, { id: 'outro-keyhole' });
  shot(tNot - .12, tTag, (g, T) => {
    const look = false;
    const c = cam([[tNot - .12, fc(715, 1.1)], [tTag, fc(715, 1.14)]], T), t = now();
    g.save(); place(g, workshop(), c);
    // the logbook on the bench at the right, the report in front of Clawd
    footShadow(g, 1030, F, 240);
    logbook(g, 1030, F, .9, t, 1);
    footShadow(g, 705, F, 330);
    report(g, 705, F - 4, 380, 320, prog(t), t);
    const k = clawd(g, 392, F, .84, { t, dance: .2, face: .6, L: look ? 'chin' : 'hips', R: look ? 'hang' : { to: [.62, -.12], pose: 'grip' }, eyes: { expr: look ? 'wide' : 'open', lx: .9, ly: look ? -.2 : .5 }, sing: true, smile: look ? -.4 : 1 });
    if (look && t > tLogs) sweat(g, 230, k.top + 30, 1.1);
    // the glass, laid against the logbook: the next job
    if (t > tYet - .1) { const p = easeOut(ramp(t, tYet - .1, .35)); magnifier(g, lerp(575, 890, p), lerp(F - 520, F - 40, p), lerp(-.8, -1.25, p), .64); }
    g.restore();
  }, { id: 'outro-logs' });

  // ---- 3. the tag: a tip of the hat; he walks to the logbook and raises his glass to its keyhole, and
  //         the eye inside goes wide at the sight of him; the iris closes on the two of them
  shot(tTag, tEnd + .06, (g, T) => {
    const c = cam([[tTag, fc(700, 1.2)], [tEnd, fc(860, 1.35)]], T), t = now();
    g.save(); place(g, workshop(), c);
    const KX = 960, KY = F - 145, tStartle = 181.2;
    const walk = easeInOut(ramp(T, 179.2, 1.4)), raise = easeInOut(ramp(t, 180.6, .5)), startle = t >= tStartle ? 1 : 0;
    const tip = Math.sin(clamp((t - tTag - .3) / 1.4) * Math.PI);
    footShadow(g, KX, F, 260);
    logbook(g, KX, F, 1, t, startle || Math.sin(t * 3) > -.6 ? 1 : .1);
    const x = lerp(520, 650, walk), jolt = kick(t, tStartle, .3);
    footShadow(g, x, F, 300);
    // through the glass, the keyhole and the eye in it, magnified
    const peep = (g, lx, ly, r) => {
      g.fillStyle = C(GOLD); g.fillRect(lx - r, ly - r, r * 2, r * 2);
      const m = 1.55, ky = ly + 6 * m;
      shape(g, spline([[lx - 12 * m, ky - 10 * m], [lx, ky - 22 * m], [lx + 12 * m, ky - 10 * m], [lx + 6 * m, ky + 4 * m], [lx + 9 * m, ky + 26 * m], [lx - 9 * m, ky + 26 * m], [lx - 6 * m, ky + 4 * m]], true, 3), { fill: '#1a0e08', w: 3, seed: 5061, form: false });
      const ex = lx, ey = ky - 8 * m, wd = 1 + startle * .45, look = startle ? 0 : Math.sin(t * 4) * 3 * m;
      g.save(); g.fillStyle = C(WHITE); g.beginPath(); g.ellipse(ex, ey, 8 * m * wd, 7 * m * wd, 0, 0, TAU); g.fill(); g.restore();
      dot(g, ex + look, ey + (startle ? 0 : 1.5 * m), (startle ? 2.2 : 3.6) * m);
    };
    const R = raise > 0 ? { to: [lerp(.45, .19, raise), lerp(-.42, .01, raise)], pose: 'grip' } : { to: [.45, -.42], pose: 'grip' };
    clawd(g, x, F, .9, { t, dance: walk > 0 && walk < 1 ? .2 : startle ? .1 : .6, walk: walk > 0 && walk < 1 ? t * 2.2 : undefined, face: walk > 0 ? .7 : 0,
      L: tip > .1 ? { to: [.05, -.7], pose: 'grip' } : 'hips', R, lean: -jolt * .12, jump: jolt * .25,
      hold: { R: (g, hx, hy, a, s) => magnifier(g, hx, hy, lerp(-.7, -.15, raise), s * .8, raise > .5 ? { inside: peep } : {}) },
      eyes: { expr: startle ? 'wide' : tip > .5 ? 'happy' : 'open', lx: walk > 0 ? .9 : 0 }, hatTip: tip + jolt * .5, smile: startle ? -.3 : 1 });
    if (t > tStartle && t < tStartle + .4) pops(g, KX - 4, KY - 6, 90, 8, { a0: 0, span: TAU * .9, w: 5 });
    g.restore();
  }, { id: 'outro-tag' });
  // the iris closes on the keyhole's eye
  irisJoin(tEnd + .06, { close: 1.1, open: .3, x: 675, y: 904, x2: W / 2, y2: 760, hold: .05 });
}
