// Verse 2: Mabel's basement gym, where the crew (Clawd with them now) tests a real thing.
//  "The gym? No net. We log a set;"  Down in the basement the phone's cable hangs out of the NET
//     socket (no signal). Mabel presses the barbell, Press and Guess riding the plates; SET 3 is logged.
//  "The app says "Saved!"—but what's in store?"  The phone grins "Saved!". Guess's glass looks inside
//     it: the STORE drawer is empty, and a moth flies out.
//  "Reload the screen; no set is seen."  Press hits reload; SET 3 is gone. Mabel's tears.
//  "Connect once more: still gone? Explore!"  Stress plugs the net back in; still gone. Guess points.
//  "We chase the clue; try something new:"  They follow the footprints to Guess's easel: TRY: CONNECT
//     FIRST, THEN SAVE.
//  "Connect, then save; the sets all stay."  Net in, a new set, reload: it stays, ticked.
//  "We drop the net, then save a set;"  Stress pulls the plug; another set; "Saved!" again.
//  "A new check flags what went away."  Reload: it's gone. Clawd winds up the check he has just made
//     (its card: SAVED OFFLINE, STILL THERE?) and its flag goes up red.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, easeOut, backOut } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED, WHITE, WOOD, SLATE } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { gym } from '../places.js';
import { clawd } from '../clawd.js';
import { guess, press, stress, check } from '../crew.js';
import { mabel } from '../people.js';
import { magnifier } from '../props.js';
import { phone, socket, barbell, storeView } from '../props-gym.js';
import { trail } from '../props-crew.js';
import { shape, rrect, ellipse, stroke, dot } from '../ink.js';
import { label, DISPLAY, PATTER, SCRIPT, fitSize } from '../type.js';
import { sweat } from '../rig.js';
import { at, ramp, pop, ease, kick, place, cam, burst, sparkle, confetti, floorCam, speedLines, bubble } from '../common.js';

export const FL = 1420;   // the gym floor, in world coordinates
export const GC = (x, z, atY = 1600) => floorCam(x, z * 1.18, FL, atY);
const SET1 = { text: 'SET 1  60 kg', tick: true }, SET2 = { text: 'SET 2  60 kg', tick: true };
export const glass = (s = 1, inside) => (g, x, y, a, sc) => magnifier(g, x, y, a, sc * s, { inside });

// The phone's state at t, from the verse's events.
function phoneState(t, T) {
  const o = { t, bars: 0, rows: [SET1, SET2], face: 'open' };
  // SET 3, logged offline
  if (t > T.log) o.rows = [SET1, SET2, { text: 'SET 3  80 kg', fresh: ramp(t, T.log, .3) }];
  if (t > T.saved - .1 && t < T.saved + 1.3) { o.toast = clamp((t - T.saved + .1) / 1.4); o.face = 'wink'; }
  if (t > T.reload) { o.spin = clamp((t - T.reload) / .45); o.rowsBefore = o.rows; }
  if (t > T.reload + .22) { o.rows = [SET1, SET2]; o.hole = true; o.face = 'worried'; }
  if (t > T.connect) o.bars = 4;
  if (t > T.still && t < T.still + .45) { o.spin = clamp((t - T.still) / .45); o.rowsBefore = o.rows; }
  // connect, then save: SET 3 again, and it stays
  if (t > T.save2) { o.hole = false; o.rows = [SET1, SET2, { text: 'SET 3  80 kg', fresh: ramp(t, T.save2, .3) }]; o.face = 'open'; }
  if (t > T.save2 - .05 && t < T.save2 + 1.0) o.toast = clamp((t - T.save2 + .05) / 1.1);
  if (t > T.stay - .45 && t < T.stay) { o.spin = clamp((t - T.stay + .45) / .45); o.rowsBefore = o.rows; }
  if (t > T.stay) o.rows = [SET1, SET2, { text: 'SET 3  80 kg', tick: true }];
  // drop the net, save a set
  if (t > T.drop) o.bars = 0;
  if (t > T.save3) { o.rows = [...o.rows.slice(0, 3), { text: 'SET 4  80 kg', fresh: ramp(t, T.save3, .3) }]; }
  if (t > T.save3 - .05 && t < T.save3 + 1.0) { o.toast = clamp((t - T.save3 + .05) / 1.1); o.face = 'wink'; }
  // a new check flags what went away
  if (t > T.flag - .5) { o.spin = clamp((t - T.flag + .5) / .45); o.rowsBefore = o.rows; }
  if (t > T.flag - .28) { o.rows = [SET1, SET2, { text: 'SET 3  80 kg', tick: true }]; o.hole = true; o.face = 'worried'; }
  if (t > T.flag + 3) o.spin = 0;
  return o;
}

export function register() {
  const L1 = 'The gym?', L2 = 'The app says', L3 = 'Reload the screen', L4 = 'Connect once more', L5 = 'We chase the clue', L6 = 'Connect, then save', L7 = 'We drop the net', L8 = 'A new check flags';
  const cEnd = wordsOf('What changed', 0).at(-1).e;
  const t0 = Math.min(at(L1, 'The') - .12, cEnd + 1.0);
  const T = {
    gym: at(L1, 'gym'), noNet: at(L1, 'No'), log: at(L1, 'set') + .1,
    app: at(L2, 'app'), saved: at(L2, 'Saved'), what: at(L2, 'what'), store: at(L2, 'store'),
    reload: at(L3, 'Reload'), noSet: at(L3, 'no'), seen: at(L3, 'seen'),
    connect: at(L4, 'Connect'), still: at(L4, 'still'), explore: at(L4, 'Explore'),
    chase: at(L5, 'chase'), clue: at(L5, 'clue'), trySo: at(L5, 'try'), newW: at(L5, 'new'),
    connect2: at(L6, 'Connect'), save2: at(L6, 'save'), stay: at(L6, 'stay'),
    drop: at(L7, 'drop'), save3: at(L7, 'save'),
    newCheck: at(L8, 'new'), flag: at(L8, 'flags'), away: at(L8, 'away'),
  };
  const end = at('Did you actually', 'Did', 1) - .12;

  // the set: socket on the wall at left, the phone standing at right, Mabel in the middle
  const SOCK = [210, 1010], PH = [780, FL];
  const setting = (g, t, plugged, o = {}) => {
    const st = phoneState(t, T);
    const ph = phone(g, PH[0], PH[1], o.ps ?? 1, { ...st, reloadPress: o.reloadPress ?? 0, lx: o.plx ?? -.5 });
    socket(g, SOCK[0], SOCK[1], .9, plugged, [ph.port[0] - 60, ph.port[1] + 20], { spark: o.spark, plugAt: o.plugAt, sag: 60 });
    return ph;
  };

  // ---- 1. in the gym, no net, a set logged
  shot(t0, T.app - .15, (g, t) => {
    const c = cam([[t0, GC(520, 1.0)], [T.log, GC(520, 1.08)]], t);
    g.save(); place(g, gym(), c);
    // the sign
    shape(g, rrect(420, 610, 460, 110, 14), { fill: CREAM, w: 7, seed: 7401 });
    label(g, "MABEL'S GYM", 650, 666, 62, { font: DISPLAY, col: CORAL });
    setting(g, t, false, { plx: -.8 });
    if (t > T.noNet - .05) { const p = pop(t, T.noNet - .05, .3); g.save(); g.translate(250, 690); g.scale(p, p); shape(g, ellipse(0, 0, 150, 70), { fill: WHITE, w: 6, seed: 7402 }); label(g, 'NO INTERNET!', 0, 3, 40, { font: PATTER, col: RED }); g.restore(); }
    // Mabel presses the barbell on the beat; Press and Guess ride the plates
    const lift = t > T.gym ? .5 + .5 * Math.sin((t - T.gym) * 5.5) : 0;
    const by = lerp(1060, 860, lift);
    mabel(g, 450, FL, .95, { t, L: { to: [.95, (by - 1040) / 150 - .3], pose: 'grip' }, R: { to: [.95, (by - 1040) / 150 - .3], pose: 'grip' }, eyes: { expr: t > T.log ? 'happy' : 'open' }, sing: true, dance: .3 });
    barbell(g, 450, by, .85);
    // Clawd taps SET 3 into the phone on "set"
    clawd(g, 980, FL, .6, { t, L: t > T.log - .3 ? { to: [.6, -.9], pose: 'point' } : 'hang', R: 'hips', eyes: { lx: -.4, ly: -.4 }, sing: true, hat: 'boater' });
    stress(g, 90, FL, .6, { t, L: 'hips', R: 'hips', eyes: { lx: .6 } });
    g.restore();
  }, { id: 'v2-log' });

  // ---- 2. "Saved!" — but what's in store?
  shot(T.app - .15, T.reload - .15, (g, t) => {
    const c = cam([[T.app - .15, GC(640, 1.2, 1620)], [T.store + .4, GC(680, 1.28, 1620)]], t);
    g.save(); place(g, gym(), c);
    setting(g, t, false, { plx: .5 });
    mabel(g, 380, FL, .95, { t, L: 'cheer', R: 'hips', eyes: { expr: 'happy' } });
    // Guess's glass over the phone: inside, the STORE drawer is empty
    const inG = ease(t, T.what - .35, .4);
    if (inG > 0) {
      guess(g, lerp(1250, 1040, inG), FL, .78, { t, R: { to: [-1.5, -.9], pose: 'grip' }, L: 'chin', hold: { R: glass(1.45, (g, x, y, r) => storeView(g, x, y, r, 0, t)) }, eyes: { lx: -.6 }, brow: 1, sing: true });
    }
    if (t > T.what - .2) label(g, 'INSIDE THE PHONE:', c.x, 760, 40, { font: PATTER, col: CREAM, ow: .25 });
    if (t > T.store - .1) label(g, 'NOTHING STORED!', c.x, 820, 46, { font: DISPLAY, col: RED, ow: .2 });
    g.restore();
  }, { id: 'v2-store' });

  // ---- 3. reload: gone. connect once more: still gone. explore!
  shot(T.reload - .15, T.chase - .35, (g, t) => {
    const c = cam([[T.reload - .15, GC(560, 1.05)], [T.connect, GC(480, 1.05)], [T.explore, GC(540, 1.0)]], t);
    g.save(); place(g, gym(), c);
    const plugged = t > T.connect + .1;
    // Stress carries the plug to the socket
    const carry = ease(t, T.connect - .5, .6);
    const plugAt = [lerp(360, SOCK[0], carry), lerp(1250, SOCK[1] + 10, carry)];
    setting(g, t, plugged, { reloadPress: t > T.reload && t < T.reload + .3 ? 1 : 0, plugAt, spark: plugged ? Math.max(0, 1 - (t - T.connect - .1) / .4) : 0, plx: -.3 });
    stress(g, lerp(430, 280, carry), FL, .7, { t, L: 'hips', R: { to: [(plugAt[0] - lerp(430, 280, carry) - 88) / 77, (plugAt[1] - (FL - 41 - 95 - 27)) / 77], pose: 'grip' }, eyes: { lx: -.6 }, gauge: plugged ? .5 : .8 });
    // Press on the reload button
    press(g, 980, FL, .6, { t, L: t < T.reload + .4 ? { to: [-1.9, -2.4], pose: 'point' } : 'hips', R: 'hips', eyes: { expr: t > T.noSet ? 'wide' : 'open', lx: -.7 }, pressed: t > T.reload && t < T.reload + .3 ? 1 : 0 });
    // Mabel: dismay, then tears
    const cry = t > T.seen - .1 && t < T.explore;
    mabel(g, 560, FL, .82, { t, L: cry ? 'cry' : 'hips', R: cry ? 'hang' : 'out', eyes: { expr: cry ? 'cry' : t > T.noSet ? 'wide' : 'open', lx: .6 }, smile: t > T.noSet ? -1 : 1, sing: cry ? .3 : false });
    if (t > T.still && t < T.explore) for (let i = 0; i < 3; i++) label(g, '?', 700 + i * 70, 820 - Math.sin(t * 6 + i) * 12, 70, { font: DISPLAY, col: RED, ow: .15 });
    // Guess: "Explore!" — antenna springs to "!", arm flung forward
    if (t > T.explore - .5) {
      const k = ease(t, T.explore - .5, .3);
      guess(g, lerp(-200, 330, k), FL, .8, { t, bang: ramp(t, T.explore, .15), L: 'up', R: t > T.explore ? { to: [1.5, -.8], pose: 'point' } : 'hang', eyes: { expr: 'open', lx: .7 }, sing: true, lean: -.08 });
      if (t > T.explore) speedLines(g, 380, 1100, -1, 160, 4, 88);
    }
    g.restore();
  }, { id: 'v2-reload' });

  // ---- 4. chase the clue, try something new
  shot(T.chase - .35, T.connect2 - .15, (g, t) => {
    const c = cam([[T.chase - .35, GC(420, .95)], [T.newW + .3, GC(640, .95)]], t);
    g.save(); place(g, gym(), c);
    trail(g, [0, FL - 20], [900, FL - 20], 1, { n: 12, feet: true, col: '#3a2a20' });
    const run = clamp((t - T.chase + .3) / (T.trySo - T.chase + .2));
    const x0 = lerp(-100, 640, easeOut(run));
    guess(g, x0 + 100, FL, .8, { t, walk: t * 4, bang: 1, eyes: { ly: .6, lx: .6 }, R: { to: [.8, .6], pose: 'grip' }, hold: { R: glass(.8) }, lean: .15, sing: true });
    clawd(g, x0 - 110, FL, .75, { t, walk: t * 4, eyes: { ly: .6, lx: .6 }, L: 'out', R: 'out', lean: .12, sing: true });
    press(g, x0 - 300, FL, .64, { t, walk: t * 4 + .3, eyes: { lx: .6 }, L: 'up', R: 'up', lean: .12 });
    stress(g, x0 - 490, FL, .6, { t, walk: t * 4 + .6, eyes: { lx: .6 }, steam: .6, lean: .1 });
    speedLines(g, x0 - 520, 1250, 1, 200, 5, 90);
    // the easel with the new plan, flipped over on "try"
    const ex = 860;
    stroke(g, [[ex - 110, FL], [ex, 900]], { w: 12, color: WOOD, seed: 7501, taper: false }); stroke(g, [[ex + 110, FL], [ex, 900]], { w: 12, color: WOOD, seed: 7502, taper: false });
    const flip = ramp(t, T.trySo - .1, .3);
    g.save(); g.translate(ex, 1030); g.scale(1, Math.abs(Math.cos(flip * Math.PI)));
    shape(g, rrect(-170, -150, 340, 280, 10), { fill: CREAM, w: 7, seed: 7503 });
    if (flip < .5) label(g, '?', 0, -10, 150, { font: DISPLAY, col: ROSE, ow: .1 });
    else {
      label(g, 'TRY:', 0, -100, 48, { font: PATTER, col: CORAL });
      label(g, 'CONNECT', 0, -38, 58, { font: DISPLAY, col: TEAL });
      label(g, 'FIRST,', 0, 18, 46, { font: PATTER, col: INK });
      label(g, 'THEN SAVE', 0, 80, 54, { font: DISPLAY, col: GREEN });
    }
    g.restore();
    g.restore();
  }, { id: 'v2-chase' });

  // ---- 5. connect then save: it stays. drop the net, save: then a new check flags it
  shot(T.connect2 - .15, end, (g, t) => {
    const c = cam([[T.connect2 - .15, GC(560, 1.02)], [T.drop, GC(560, 1.05)], [T.flag, GC(600, 1.08)], [end, GC(620, 1.1)]], t);
    g.save(); place(g, gym(), c);
    const plugged = t < T.drop + .1;
    const pull = ease(t, T.drop - .1, .35);
    const plugAt = [lerp(SOCK[0], 380, pull), lerp(SOCK[1] + 10, 1250, pull)];
    setting(g, t, plugged, { plugAt, spark: t > T.connect2 && t < T.connect2 + .4 ? 1 - (t - T.connect2) / .4 : 0, reloadPress: (t > T.stay - .5 && t < T.stay - .2) || (t > T.flag - .5 && t < T.flag - .2) ? 1 : 0 });
    // Mabel logs the sets
    const lifting = (t > T.save2 - .6 && t < T.save2) || (t > T.save3 - .6 && t < T.save3);
    mabel(g, 420, FL, .82, { t, L: lifting ? 'flex' : 'hips', R: lifting ? 'flex' : (t > T.stay && t < T.drop) ? 'cheer' : 'hips', eyes: { expr: t > T.stay && t < T.drop ? 'happy' : t > T.flag ? 'wide' : 'open', lx: .6 }, smile: t > T.flag ? -1 : 1 });
    if (t > T.stay && t < T.drop) sparkle(g, 800, 1000, 220, t, 6, GOLD, 77);
    // Stress minds the plug
    const sx = lerp(230, 330, pull);
    stress(g, sx, FL, .62, { t, L: 'hips', R: t > T.drop - .2 && t < T.drop + .6 ? { to: [(plugAt[0] - sx - 78) / 68, (plugAt[1] - (FL - 36 - 84 - 24)) / 68], pose: 'grip' } : 'hips', eyes: { lx: .5 }, gauge: t > T.drop ? .9 : .4, steam: t > T.drop ? .6 : 0 });
    // the new check, made by Clawd: its rule is the discovery
    if (t > T.newCheck - .6) {
      const k = pop(t, T.newCheck - .6, .4);
      const up = t > T.flag ? pop(t, T.flag, .3) : 0;
      g.save(); g.translate(960, FL); g.scale(k, k); g.translate(-960, -FL);
      check(g, 960, FL, 1.5, { t, card: (g, x, y, cw, ch, s) => { label(g, 'SAVED OFFLINE,', x, y - 9 * s, fitSize(g, 'SAVED OFFLINE,', PATTER, 18 * s, cw - 6 * s), { font: PATTER }); label(g, 'STILL THERE?', x, y + 11 * s, fitSize(g, 'STILL THERE?', PATTER, 18 * s, cw - 6 * s), { font: PATTER }); }, flag: clamp(up), flagCol: RED, wave: t > T.flag + .3, hop: kick(t, T.flag, .2) });
      g.restore();
      if (t > T.flag) { burst(g, 960, 1060, 140, (t - T.flag) / .45, 10, RED, 21); label(g, 'MISSING: SET 4', 700, 800, 56, { font: DISPLAY, col: RED, ow: .2 }); }
      clawd(g, 1040, FL + 10, .5, { t, L: { to: [-.4, -.3], pose: 'grip' }, R: 'hips', eyes: { expr: t > T.flag ? 'wide' : 'happy', lx: -.5 }, sing: true, hat: 'boater' });
    }
    // "poof": the vanished set
    if (t > T.flag - .3 && t < T.flag + .5) { const p = (t - T.flag + .3) / .8; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; shape(g, ellipse(800 + Math.cos(a) * 60 * p * 2, 1020 + Math.sin(a) * 40 * p * 2, 34 * (1 - p) + 4, 26 * (1 - p) + 4), { fill: WHITE, w: 4, seed: 7600 + i }); } }
    g.restore();
  }, { id: 'v2-check' });
}
