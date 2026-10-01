// Verse 1, second half: why the agent writes checks like that.
//  "To boost my score, I cover more;"  Clawd winds up a crateful of checks; they swarm over the app
//     until it's buried, and the SCORE thermometer climbs to 100%.
//  "They've trained me just to make the grade."  The circus: he leaps through the GRADE hoop for a
//     gold star from the trainer's glove.
//  "Like kids in class, I aim to pass;"  The schoolroom: PASS = ALL GREEN on the board; he fills a
//     page with ticks and gets an A+.
//  "The marks decide how tests get made."  The factory: a press whose die is the teacher's tick
//     mark stamps out checks, every one the same shape.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, beatPos, easeOut, backOut, smooth, rng } from '../kit.js';
import { INK, CREAM, CARD, TEAL, TEAL_SH, CORAL, OCHRE, ROSE, GOLD, GREEN, RED, WHITE, WOOD, WOOD_SH, GREY, SLATE, MINT, PLUM, SKIN, BROWN } from '../palette.js';
import { shot, irisJoin, wipeJoin } from '../shots.js';
import { workshop, circus, schoolroom, factory } from '../places.js';
import { clawd } from '../clawd.js';
import { check, press as pressBot } from '../crew.js';
import { register as app, thermometer, goldStar } from '../props-v1.js';
import { shape, rrect, ellipse, stroke, dot, glove, line, spline, hose } from '../ink.js';
import { label, word, DISPLAY, PATTER, SCRIPT, fitSize } from '../type.js';
import { at, ramp, pop, ease, kick, place, cam, burst, sparkle, floorCam, stampCheck, speedLines } from '../common.js';
import { cardText } from './verse1.js';

const BENCH = 1500;
const BC = (x, z, atY = 1560) => floorCam(x, z * 1.16, BENCH, atY);

// A little schoolroom bot at a desk: a round head, a pencil, a colour of its own.
function pupil(g, x, y, s, col, t, seed) {
  const bob = Math.sin(t * 9 + seed) * 4 * s;
  shape(g, ellipse(x, y - 150 * s + bob, 70 * s, 62 * s), { fill: col, w: 6 * s, seed, gloss: { x: .3, y: .25, w: .1, h: .08 } });
  for (const d of [-1, 1]) dot(g, x + d * 22 * s, y - 158 * s + bob, 8 * s);
  stroke(g, [[x - 14 * s, y - 128 * s + bob], [x + 14 * s, y - 128 * s + bob]], { w: 4 * s, seed: seed + 1 });
  stroke(g, [[x, y - 212 * s + bob], [x, y - 240 * s + bob]], { w: 5 * s, seed: seed + 2 });
  dot(g, x, y - 244 * s + bob, 9 * s, GOLD);
}
function desk(g, x, y, s, seed) {
  shape(g, rrect(x - 130 * s, y - 90 * s, 260 * s, 36 * s, 6 * s), { fill: WOOD, shade: WOOD_SH, shadeOff: [-5, -5], w: 6 * s, seed });
  for (const d of [-1, 1]) stroke(g, [[x + d * 110 * s, y - 56 * s], [x + d * 116 * s, y]], { w: 10 * s, seed: seed + d, taper: false });
}
function paperSheet(g, x, y, s, ticks, rot, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  shape(g, rrect(-70 * s, -44 * s, 140 * s, 88 * s, 4 * s), { fill: WHITE, w: 4 * s, seed: 5400 + (o.seed || 0), amt: .4 });
  for (let i = 0; i < ticks; i++) { const cx = -48 * s + (i % 5) * 24 * s, cy = -22 * s + Math.floor(i / 5) * 24 * s; stroke(g, [[cx - 7 * s, cy], [cx - 2 * s, cy + 7 * s], [cx + 9 * s, cy - 8 * s]], { w: 4 * s, color: GREEN, seed: 5410 + i }); }
  if (o.grade) { const p = o.grade; g.save(); g.translate(40 * s, 20 * s); g.rotate(-.25); g.scale(p, p); label(g, 'A+', 0, 0, 60 * s, { font: DISPLAY, col: RED, ow: .12 }); g.restore(); }
  g.restore();
}

export function register() {
  const A = 'To boost my score', B = "They've trained me", C = 'Like kids in class', D = 'The marks decide';
  const t0 = at(A, 'To') - .1;
  const tBoost = at(A, 'boost'), tScore = at(A, 'score'), tCover = at(A, 'cover'), tMore = at(A, 'more');
  const tThey = at(B, "They've") - .1, tTrained = at(B, 'trained'), tJust = at(B, 'just'), tMake = at(B, 'make'), tGrade = at(B, 'grade');
  const tLike = at(C, 'Like') - .1, tKids = at(C, 'kids'), tClass = at(C, 'class'), tAim = at(C, 'aim'), tPass = at(C, 'pass');
  const tThe = at(D, 'The') - .1, tMarks = at(D, 'marks'), tDecide = at(D, 'decide'), tTests = at(D, 'tests'), tMade = at(D, 'made');
  const chorus = at('Did you actually', 'Did', 0) - .12;

  // ---- 5. cover more: a crate of checks swarms the app; the score climbs
  shot(t0, tThey, (g, t) => {
    const c = cam([[t0, BC(560, 1.02)], [tMore, BC(560, 1.08)]], t);
    g.save(); place(g, workshop(), c);
    thermometer(g, 960, BENCH - 90, .95, clamp(.62 + .38 * ease(t, tBoost, tMore + .4 - tBoost)));
    const buried = ramp(t, tCover - .2, .9);
    app(g, 330, BENCH, 1.0, { t, shows: '5', lx: .6, ly: -.3, smile: -.5, eyes: buried < .8 });
    // checks climbing over the app, more and more of them
    const n = Math.floor(4 + buried * 26);
    const R = rng(71);
    const spots = [];
    for (let i = 0; i < 30; i++) spots.push([330 + (R() - .5) * 420, BENCH - 40 - R() * 420 * Math.min(1, .3 + i / 30)]);
    spots.sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < n; i++) { const [x, y] = spots[i]; const k = clamp((t - t0 - i * .05) / .25); stampCheck(g, lerp(700, x, k), y - Math.sin(k * Math.PI) * 60, .5, 'up-green', t, i * .3); }
    // the crate, and Clawd winding them up
    shape(g, rrect(600, BENCH - 150, 190, 150, 8), { fill: WOOD, shade: WOOD_SH, shadeOff: [-8, -8], w: 7, seed: 5501 });
    label(g, 'CHECKS', 695, BENCH - 75, 40, { font: PATTER, col: CREAM });
    for (let i = 0; i < 3; i++) stampCheck(g, 640 + i * 55, BENCH - 140 - Math.abs(Math.sin(t * 8 + i)) * 20, .5, 'up-green', t, i);
    clawd(g, 720, BENCH - 150, .78, { t, dance: 1, L: 'cheer', R: { to: [.3, -.1 + Math.sin(t * 16) * .06], pose: 'grip' }, eyes: { expr: 'happy' }, sing: true, jump: kick(t, tMore, .2) * .5 });
    if (t > tMore) sparkle(g, 960, 700, 160, t, 6, GOLD, 51);
    g.restore();
  }, { id: 'v1-cover' });

  // ---- 6. trained: the circus hoop and the gold star
  shot(tThey, tLike, (g, t) => {
    const c = cam([[tThey, { x: 540, y: 1150, z: 1.05 }], [tGrade + .4, { x: 540, y: 1120, z: 1.12 }]], t);
    g.save(); place(g, circus(), c);
    // the hoop, on a stand, lettered GRADE
    const hx = 540, hy = 1180;
    const drawHoop = (front) => {
      g.save(); g.translate(hx, hy);
      // a hoop seen a little from the side: the near half drawn after Clawd
      const P = []; for (let i = 0; i <= 30; i++) { const a = (front ? -Math.PI / 2 : Math.PI / 2) + i / 30 * Math.PI; P.push([Math.cos(a) * 70, Math.sin(a) * 200]); }
      stroke(g, P, { w: 34, color: INK, raw: true, taper: false, seed: 5601 + front });
      stroke(g, P, { w: 22, color: front ? GOLD : '#b88a2a', raw: true, taper: false, seed: 5603 + front });
      g.restore();
    };
    stroke(g, [[hx, hy + 200], [hx, 1540]], { w: 14, seed: 5605, taper: false, color: GREY });
    drawHoop(false);
    label(g, 'GRADE', hx, hy - 250, 72, { font: DISPLAY, col: GOLD, ow: .18 });
    // Clawd leaping through on "trained"
    const u = clamp((t - (tTrained - .25)) / .9);
    const cx = lerp(170, 900, u), cyy = 1520 - Math.sin(u * Math.PI) * 420;
    const landed = u >= 1;
    clawd(g, landed ? 860 : cx, landed ? 1520 : cyy, .95, { t, L: landed ? 'up' : 'out', R: landed ? { to: [.1, -.55], pose: 'grip' } : 'out', eyes: { expr: 'happy' }, sing: true, lean: landed ? 0 : lerp(-.4, .4, u), hat: 'boater',
      hold: landed && t > tGrade ? { R: (g, x, y) => goldStar(g, x, y - 20, 44, t) } : {} });
    drawHoop(true);
    // the trainer's glove and sleeve from the upper left, tossing the star
    const reach = ease(t, tMake - .5, .4);
    const gx = lerp(W + 120, 900, reach), gy = lerp(760, 880, reach);
    line(g, [[W + 80, 700], [gx + 40, gy - 30]], { w: 70, taper: false, seed: 5610, color: INK });
    line(g, [[W + 80, 700], [gx + 40, gy - 30]], { w: 52, taper: false, seed: 5611, color: '#3b2a4a' });
    glove(g, gx, gy, Math.PI - .6, 34, t > tGrade - .15 ? 'open' : 'grip', { seed: 5612 });
    if (t < tGrade - .1 && reach > 0) goldStar(g, gx - 30, gy + 30, 40, t * 3);
    if (t >= tGrade - .1 && t < tGrade + .2) { const k = (t - tGrade + .1) / .3; goldStar(g, lerp(gx - 30, 860, k), lerp(gy + 30, 1300, k) - Math.sin(k * Math.PI) * 150, 40, t * 8); }
    if (t > tGrade + .1) sparkle(g, 860, 1200, 160, t, 6, GOLD, 61);
    g.restore();
  }, { id: 'v1-circus' });

  // ---- 7. kids in class: PASS = ALL GREEN; a page of ticks; an A+
  shot(tLike, tThe, (g, t) => {
    const c = cam([[tLike, { x: 540, y: 1180, z: 1.12 }], [tPass + .5, { x: 560, y: 1230, z: 1.2 }]], t);
    g.save(); place(g, schoolroom(), c);
    // the board: chalk lettering
    const ch = (s, x, y, a, size = 64) => { if (t > a) label(g, s, x, y, size, { font: PATTER, col: '#f1efe4' }); };
    ch('TODAY:', 330, 760, tLike - .2, 52);
    ch('PASS = ALL', 480, 860, tLike);
    ch('GREEN ✓', 520, 950, tKids);
    if (t > tClass) stroke(g, [[700, 960], [730, 990], [790, 900]], { w: 12, color: GREEN, seed: 5701 });
    // the pupils at their desks, Clawd in the middle
    pupil(g, 190, 1500, .9, MINT, t, 5710); desk(g, 190, 1500, .9, 5711);
    pupil(g, 890, 1500, .9, ROSE, t, 5720); desk(g, 890, 1500, .9, 5721);
    clawd(g, 540, 1470, .82, { t, dance: .5, L: { to: [.3, .3], pose: 'grip' }, R: { to: [.4, .28 + Math.sin(t * 22) * .03], pose: 'grip' }, eyes: { expr: 'open', ly: .6, lx: .3 }, sing: true });
    desk(g, 540, 1540, 1.1, 5731);
    const ticks = Math.floor(clamp((t - tKids) / (tPass - tKids)) * 15);
    paperSheet(g, 560, 1410, 1.1, ticks, -.04, { grade: t > tPass ? pop(t, tPass, .3) : 0 });
    // the neighbour copying: a glance, the neighbour's page filling with ticks too
    paperSheet(g, 890, 1420, .9, Math.max(0, ticks - 3), .06, { seed: 2 });
    if (t > tAim) label(g, 'psst', 800, 1180, 40, { font: SCRIPT, col: INK, rot: -.2 });
    g.restore();
  }, { id: 'v1-class' });

  // ---- 8. the marks decide: a tick-shaped die stamps out identical checks
  shot(tThe, chorus, (g, t) => {
    const c = cam([[tThe, { x: 540, y: 1150, z: 1.0 }], [chorus, { x: 540, y: 1130, z: 1.08 }]], t);
    g.save(); place(g, factory(), c);
    const beltY = 1480;
    // the press: frame, piston, a tick-mark die
    const period = .56, ph = ((t - tMarks) % period + period) % period / period;
    const down = t < tMarks ? 0 : ph < .25 ? ph / .25 : ph < .45 ? 1 : Math.max(0, 1 - (ph - .45) / .4);
    shape(g, rrect(300, 800, 480, 130, 16), { fill: SLATE, w: 8, seed: 5801 });
    label(g, 'THE MARKS', 540, 866, 58, { font: DISPLAY, col: GOLD, ow: .16 });
    for (const x of [320, 760]) shape(g, rrect(x - 20, 930, 40, 550, 8), { fill: SLATE, w: 7, seed: 5802 + x });
    const py = lerp(1040, 1250, down);
    stroke(g, [[540, 930], [540, py]], { w: 34, seed: 5804, taper: false, color: GREY });
    stroke(g, [[540, 930], [540, py]], { w: 22, seed: 5805, taper: false, color: '#b8c2c0' });
    // the die: a big green tick
    stroke(g, [[460, py + 40], [520, py + 110], [640, py - 20]], { w: 46, color: INK, seed: 5806, taper: false });
    stroke(g, [[460, py + 40], [520, py + 110], [640, py - 20]], { w: 30, color: GREEN, seed: 5807, taper: false });
    // conveyor belt
    shape(g, rrect(-60, beltY, W + 120, 60, 30), { fill: '#3a3634', w: 7, seed: 5808 });
    for (let i = 0; i < 12; i++) { const x = ((i * 110 - (t * 200) % 110) + 1200) % 1210 - 60; dot(g, x, beltY + 30, 10, GREY); }
    // stamped checks riding away to the right, all alike
    if (t > tMarks) {
      const k0 = Math.floor((t - tMarks) / period);
      for (let k = 0; k <= k0; k++) {
        const born = tMarks + k * period + period * .3, x = 540 + (t - born) * 360;
        if (t < born || x > W + 100) continue;
        stampCheck(g, x, beltY + 4, 1.0, 'up-green', t, 0);
      }
    }
    if (down > .9) burst(g, 540, 1330, 150, .4, 10, INK, 9);
    // Clawd on the left, admiring the line of identical checks
    clawd(g, 190, beltY, .72, { t, dance: .9, L: 'cheer', R: 'present', eyes: { expr: 'happy' }, sing: true });
    if (t > tTests) for (let i = 0; i < 3; i++) label(g, '✓', 700 + i * 110, 1080 - ((t * 60 + i * 40) % 120), 60, { font: DISPLAY, col: GREEN, ow: .2 });
    g.restore();
  }, { id: 'v1-marks' });
}
