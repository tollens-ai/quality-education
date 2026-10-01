// Verse 2, in Mabel's basement gym: the crew (Clawd with them now, a tester with a magnifying
// glass) investigates her disappearing set. Every reload's result is shown big, in the silent
// film's iris close-up on her log: the net's fan in the corner, the row there or gone.
//  "The gym? No net."            Chorus 1's iris opens on Mabel posing by her phone; cut to the
//                                router on the wall, dead, its plug on the floor.
//  "We log a set;"               She heaves the barbell overhead; close: a third row pops in.
//  "The app says "Saved!""       The phone winks: a big green tick (the lyric's bubble is its voice).
//  "—but what's in store?"       Guess opens a hatch in the phone's back: the store's drawer is empty;
//                                a moth flies out.
//  "Reload the screen; no set    Press jabs the reload arrow; the screen spins; close: the third row
//   is seen."                    is a dashed empty outline. Mabel's lip trembles; a tear.
//  "Connect once more: still     Stress jams the plug in, the router springs up and its waves ripple;
//   gone?"                       reload, close: the fan is lit, the outline still empty.
//  "Explore!"                    The crew clap on pith helmets; Guess points onward.
//  "We chase the clue; try       They tiptoe after chalk footprints from the phone to the plug;
//   something new:"              Guess pulls it, holds it up, and a bulb lights over his head.
//  "Connect, then save; the      He plugs it in first; Mabel lifts; a row pops in; reload, close:
//   sets all stay."              every row stays. She flexes.
//  "We drop the net, then save   Stress yanks the plug; Mabel lifts; the row pops in, ticked.
//   a set;"
//  "A new check flags what       Reload, close: that row's gone. Clawd winds a brand-new check and
//   went away."                  sets it at the phone; it sees the empty outline and raises its red
//                                flag; Mabel hugs it.
import { W, H, TAU, clamp, lerp, now, easeOut, easeInOut, backOut, elastic } from '../kit.js';
import { GOLD, RED, WHITE, C } from '../palette.js';
import { shot } from '../shots.js';
import { BUBBLE } from '../lyrics.js';
import { GYM, PLUG, gymSet, lastGymCam } from '../places-gym.js';
import { clawd, boater } from '../clawd.js';
import { check } from '../crew.js';
import { mabel } from '../people.js';
import { magnifier, wifiIcon, router, socket, plug } from '../cast.js';
import { mabelPhone, mabelLift, member, reach, barbell, barbellIcon, tick, moth, ideaBulb, footprint, phoneBack, gymFront, setAppLook } from '../props-gym.js';
import { APP, appHeader, appLogo } from '../gymapp.js';
import { heart, pops, arm } from '../rig.js';
import { at, ramp, ease, kick, shakeAt, cam, floorCam, sparkle, footShadow, lowerShade } from '../common.js';
import { shape, ellipse, spline, glove, stroke, dot } from '../ink.js';

const F = GYM.floor, PX = GYM.phone, MX = GYM.mabel, PS = .72, MS = .9, CS = .78;
const fc = (x, z) => floorCam(x, z, F);
export const T = {};
const RL = [.7, .42, .42, .4];               // how long each reload spins

// ---------------------------------------------------------------- the story's state
// The net: on (1) or off (0), springing up when it's plugged in and wilting when it's pulled.
export function netAt(t) {
  const ev = [[T.plug1 + .05, 1], [T.pull2 + .04, 0], [T.plug2 + .05, 1], [T.drop + .06, 0]];
  let v = 0, last = -1e9;
  for (const [te, on] of ev) if (t >= te) { v = on; last = te; }
  const k = t - last;
  if (v === 1 && k < .45) return clamp(elastic(k / .45) * 1.15);
  if (v === 0 && last > 0 && k < .35) return 1 - easeOut(k / .35);
  return v;
}
// Mabel's log at t: two old sets; set A logged offline (lost on the first reload); B logged online
// (stays); C logged offline (lost again). A lost set leaves a dashed empty outline.
export function logAt(t) {
  const rows = [{}, {}];
  const m1 = T.r1 + RL[0] / 2, m4 = T.r4 + RL[3] / 2;
  if (t >= T.aPop && t < T.ghostOut) rows.push(t < m1 ? { pop: ramp(t, T.aPop, .22), tick: ramp(t, T.saved, .16), fresh: t < T.saved + .5 } : { ghost: true });
  if (t >= T.bPop) rows.push({ pop: ramp(t, T.bPop, .22), tick: ramp(t, T.bPop + .12, .16), fresh: t < T.bPop + .5 });
  if (t >= T.cPop) rows.push(t < m4 ? { pop: ramp(t, T.cPop, .22), tick: ramp(t, T.cPop + .1, .16), fresh: t < T.cPop + .5 } : { ghost: true });
  let spin = 0, press = 0, flash = 0, iconSpin, pulse = 0;
  [T.r1, T.r2, T.r3, T.r4].forEach((r, i) => {
    press = Math.max(press, kick(t, r, .16));
    if (i === 2) { if (t >= r && t < r + .4) { iconSpin = (t - r) / .4; flash = 1 - (t - r) / .2; } return; }
    if (t >= r && t < r + RL[i]) spin = (t - r) / RL[i];
  });
  if (t > T.r3 && t < T.r3 + 1) pulse = Math.max(kick(t, T.all, .22), kick(t, T.stay, .26));
  let big = 0;
  if (t >= T.saved && t < T.saved + 1.1) big = Math.min(ramp(t, T.saved, .14), 1 - ramp(t, T.saved + .9, .2));
  if (t >= T.cPop + .06 && t < T.cPop + .4) big = Math.min(ramp(t, T.cPop + .06, .1), 1 - ramp(t, T.cPop + .28, .1));
  return { rows, spin, press, big, flash, iconSpin, pulse, wifi: netAt(t) };
}

// ---------------------------------------------------------------- shared moves
// Press leaps up beside the phone and jabs its reload arrow at tJab, then drops back and peers.
// He stands at x (left of the phone).
export function pressJab(g, d, tJab, x, o = {}) {
  const s = .7, r = 90 * s, icon = [PX - 66, F - 356];
  const up = d < tJab - .22 ? 0 : d < tJab ? easeOut((d - tJab + .22) / .22) : d < tJab + .16 ? 1 : 1 - easeInOut((d - tJab - .16) / .26);
  const land = kick(d, tJab + .42, .14);
  const jx = lerp(x, icon[0] - 131, up), cyAir = icon[1] - 20;
  const lift = up * ((F - 35 - r) - cyAir);
  const sh = [jx + r * .92, F - 35 - r - lift + r * .14];
  const hand = up > .85 ? { to: [(icon[0] - sh[0]) / (80 * s), (icon[1] - sh[1]) / (80 * s)], pose: 'point', ang: -.5 } : up > .1 ? { to: [.6, -1.1], pose: 'point' } : (o.R || 'hips');
  footShadow(g, jx, F, 120, .3 * (1 - up * .6));
  member(g, 'press', jx, F, s, { t: d, jump: lift / (80 * s), dance: up > 0 ? 0 : .7, R: hand, L: up > .1 ? { to: [.5, .6], pose: 'open' } : (o.L || 'hips'), eyes: { expr: o.expr || 'open', lx: .9, ly: -.8 }, sing: up > .5 ? .5 : 0, smile: o.smile, helmet: o.helmet });
  if (up > .9 && d < tJab + .2) pops(g, icon[0], icon[1], 34, 6, { a0: -Math.PI, span: Math.PI * 1.6, w: 5 });
}
// The new check's card: its rule as a picture: a set logged with no net is still there, ticked.
export const ruleCard = (g, x, y, w, h, s) => {
  barbellIcon(g, x - w * .12, y + h * .1, w * .5, '#3a2c2c');
  tick(g, x + w * .28, y + h * .1, 9 * s);
  wifiIcon(g, x + w * .3, y - h * .16, 8 * s, 0);
};
// A gym shot: the room and its cast, then the near edge of the mat in front of the camera (the
// still-life that fills the band under the lyric).
export const gshot = (a, b, fn, o) => shot(a, b, (g, t) => { g.save(); fn(g, t); g.restore(); gymFront(g, lastGymCam(), t); }, o);
// The close-up on Mabel's log, full frame: her phone very close, its page in the upper middle (the
// fan, net on or off, top right; the reload arrow top left), the room behind it out of focus at the
// same scale, and the phone going on down into shadow under the lyric. o.poke: 0..1 Press's finger
// reaching in from the left to the reload arrow. o.after(g, sx, sy, s): more to draw over it, in
// screen coordinates.
export const IS = 2.0, ITOP = 110;               // the close-up's phone scale on screen, and its top: its white page ends above y 1140, so only its pink chin and the mat sit behind the lyric
export function logInsert(g, t, a, L, o = {}) {
  const s = IS, top = o.top ?? ITOP, z = s / PS, feet = top + 600 * s;
  g.save(); gymSet(g, { x: PX, y: F - (feet - H / 2) / z, z }, t, { soft: 4 }); g.restore();
  mabelPhone(g, W / 2, feet, s, L, { lean: 0, dance: 0, eyes: o.eyes || {} });
  const sx = W / 2 - 150 * s + 22 * s, sy = top + 72 * s;
  if (o.after) o.after(g, sx, sy, s);
  if (o.poke > 0) {
    const ix = sx + 36 * s, iy = sy + 33 * s, p = easeOut(o.poke);
    arm(g, -30, iy + 80, lerp(20, ix - 30, p), lerp(iy + 70, iy + 8, p), { w: 24, gs: 42, pose: 'point', ang: -.25, seed: 341 });
  }
  lowerShade(g, .5, 1110);
}

export function register() {
  setAppLook({ app: APP, header: appHeader, logo: appLogo });
  const L1 = 'The gym? No net.', L2 = 'The app says', L3 = 'Reload the screen', L4 = 'Connect once more', L5 = 'We chase the clue', L6 = 'Connect, then save', L7 = 'We drop the net', L8 = 'A new check flags';
  Object.assign(T, {
    gym: at(L1, 'gym'), no: at(L1, 'No'), net: at(L1, 'net'), we: at(L1, 'We'), log: at(L1, 'log'), set: at(L1, 'set'),
    app: at(L2, 'app'), says: at(L2, 'says'), saved: at(L2, 'Saved'), but: at(L2, 'but'), what: at(L2, 'what'), in: at(L2, 'in'), store: at(L2, 'store'),
    reload: at(L3, 'Reload'), screen: at(L3, 'screen'), noSet: at(L3, 'no'), is: at(L3, 'is'), seen: at(L3, 'seen'),
    connect: at(L4, 'Connect'), once: at(L4, 'once'), more: at(L4, 'more'), still: at(L4, 'still'), gone: at(L4, 'gone'), explore: at(L4, 'Explore'),
    chase: at(L5, 'chase'), clue: at(L5, 'clue'), try: at(L5, 'try'), something: at(L5, 'something'), new: at(L5, 'new'),
    connect2: at(L6, 'Connect'), then2: at(L6, 'then'), save2: at(L6, 'save'), the2: at(L6, 'the'), sets: at(L6, 'sets'), all: at(L6, 'all'), stay: at(L6, 'stay'),
    drop: at(L7, 'drop'), net7: at(L7, 'net'), save3: at(L7, 'save'), set3: at(L7, 'set'),
    a4: at(L8, 'A'), new4: at(L8, 'new'), check: at(L8, 'check'), flags: at(L8, 'flags'), what4: at(L8, 'what'), away: at(L8, 'away'),
  });
  T.aPop = T.set; T.r1 = T.reload + .04; T.plug1 = T.connect + .05; T.r2 = T.still; T.pull2 = T.try + .03;
  T.plug2 = T.connect2 + .04; T.bPop = T.the2; T.r3 = T.sets - .04; T.cPop = T.set3; T.r4 = T.a4 - .22;
  const end = at('Did you actually', 'Did', 1);

  // The app's "Saved!" is a speech bubble from the phone (its face in the close-up below).
  BUBBLE['The app says "Save'] = { from: 3, to: 3, tail: [540, 500] };

  const CU = (t, a, b, dx = 0) => cam([[a, fc(PX + dx, 1.48)], [b, fc(PX + dx + 4, 1.56)]], t);
  const two = (t, a, b) => cam([[a, fc(1198, 1.0)], [b, fc(1192, 1.025)]], t);
  const WALL = (t, a, b) => cam([[a, fc(585, 1.4)], [b, fc(580, 1.47)]], t);

  // ---- 1. The gym? (chorus 1's iris opens on Mabel striking poses by her phone)
  const s0 = 58.92, s1 = 59.9;
  gshot(s0, s1, (g, t) => {
    const d = now();
    gymSet(g, cam([[s0, fc(1335, .98)], [s1, fc(1325, 1.05)]], t), t);
    footShadow(g, PX, F, 200); footShadow(g, MX, F, 330);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { expr: d > 59.8 ? 'happy' : 'open', lx: .9, ly: -.8 } });
    // a pose on each beat, the biggest on the second
    const pose = d < 59.17 ? ['hips', 'hips'] : d < 59.73 ? ['hips', 'flex'] : ['flex', 'flex'];
    const pump = Math.max(kick(d, 59.17, .2) * .5, kick(d, 59.73, .3));
    g.save(); g.translate(MX, F); g.scale(1 + pump * .05, 1 - pump * .04); g.translate(-MX, -F);
    mabel(g, MX, F, MS, { t: d, L: pose[0], R: pose[1], eyes: { expr: d > 59.8 ? 'happy' : 'open', lx: .2 }, smile: 1.3, sing: 0, dance: .4 });
    g.restore();
    barbell(g, MX + 40, F - 52, .82, { r: 1.03 });
    if (d > 59.7) { sparkle(g, MX - 230, F - 430, 70, d, 4, GOLD, 21); sparkle(g, MX + 230, F - 430, 70, d, 4, GOLD, 22); }
  }, { id: 'v2-gym' });

  // ---- 2. gym? No net. (the router on the wall: dead, antennas wilted, its plug on the floor; on
  //         "No" it drops crooked on its one good screw; on "net" a last puff of smoke)
  const s2 = T.we - .2;
  gshot(s1, s2, (g, t) => {
    const d = now();
    const c = cam([[s1, fc(522, 1.38)], [s2, fc(514, 1.62)]], t);
    c.x += shakeAt(d, T.net, 5, .2);
    gymSet(g, c, t);
    const [rx, ry] = GYM.router, [sx, sy] = GYM.socket;
    socket(g, sx, sy, .8);
    const tilt = .17 * backOut(ramp(d, T.no, .16), 2.6), px = rx - 76, py = ry - 38;
    g.save(); g.translate(px, py); g.rotate(tilt); g.translate(-px, -py);
    router(g, rx, ry, .9, { t: d, on: 0 });
    g.restore();
    dot(g, px, py, 5, '#8a8478');
    // the cord hangs from the router's corner, now a little lower, to the plug lying on the floor
    const cx0 = px + Math.cos(tilt) * 106 - Math.sin(tilt) * 78, cy0 = py + Math.sin(tilt) * 106 + Math.cos(tilt) * 78;
    plug(g, [cx0, cy0], PLUG.floor, .3 + (d > T.net && d < T.net + .2 ? Math.sin((d - T.net) * 60) * .15 : 0), PLUG.s, { sag: 26 });
    // dust shaken loose on "No"; a puff of smoke on "net"
    if (d > T.no) { const u = (d - T.no) / .5; if (u < 1) for (let i = 0; i < 5; i++) dot(g, rx - 60 + i * 30, ry + 50 + u * u * 260 + i * 8, 3, '#d8d0c4'); }
    if (d > T.net) { const u = (d - T.net) / .7; if (u < 1) for (let i = 0; i < 3; i++) { g.save(); g.globalAlpha *= (1 - u) * .85; shape(g, ellipse(rx - 40 + i * 40, ry - 50 - u * 90 - i * 10, 14 + u * 22, 11 + u * 16), { fill: '#d8d0c4', w: 3, seed: 91 + i, form: false }); g.restore(); } }
  }, { id: 'v2-nonet' });

  // ---- 3. We log (Mabel heaves the barbell overhead, beside her phone)
  const s3 = T.set - .06;
  gshot(s2, s3, (g, t) => {
    const d = now();
    gymSet(g, two(t, s2, s3), t);
    footShadow(g, PX, F, 200); footShadow(g, MX, F, 360);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { lx: .9, ly: -.7 } });
    const h0 = T.log - .26, p = d < h0 ? 0 : d < T.log ? easeOut((d - h0) / .26, 2) : 1;
    mabelLift(g, MX, F, MS, p, { t: d, eyes: { expr: p > 0 && p < 1 ? 'happy' : 'open', lx: -.6, ly: -.2 }, smile: p >= 1 ? 1.3 : .3, sing: 0 });
    if (p >= 1) sparkle(g, MX, F - 640, 260, d, 6, GOLD, 31);
  }, { id: 'v2-log' });

  // ---- 4. a set; (close: a third row pops into her log; the fan is struck through)
  const s4 = T.app - .14;
  shot(s3, s4, (g, t) => {
    const d = now();
    logInsert(g, t, s3, logAt(d), { eyes: { expr: d > T.aPop + .15 ? 'happy' : 'open', ly: .3 }, after: (g2, sx, sy, s) => { if (d > T.aPop) sparkle(g2, W / 2, sy + 84 * s + 2 * 66 * s + 27 * s, 230, d, 6, GOLD, 43); } });
  }, { id: 'v2-set' });

  // ---- 5. The app says "Saved!" (close on the phone: it puffs up; a big tick; a wink)
  const s5 = T.what - .2;
  gshot(s4, s5, (g, t) => {
    const d = now();
    gymSet(g, CU(t, s4, s5), t);
    footShadow(g, PX, F, 220);
    const proud = kick(d, T.says, .3), wink = d > T.saved + .04;
    g.save(); g.translate(PX, F); g.scale(1 + proud * .035, 1 + proud * .05); g.translate(-PX, -F);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { expr: wink ? 'wink' : 'open', lx: wink ? 0 : .3, ly: -.3 }, R: { to: [36, 62], pose: 'fist' }, L: wink ? { to: [64, -150], pose: 'wave' } : { to: [36, 62], pose: 'fist' } });
    g.restore();
    if (d > T.saved) sparkle(g, PX, F - 200, 170, d, 7, GOLD, 41);
  }, { id: 'v2-saved' });

  // ---- 6. —but what's in store? (in the stop: Guess opens the phone's back; the drawer is empty)
  const s6 = T.reload - .06, GX = PX + 215;
  gshot(s5, s6, (g, t) => {
    const d = now();
    gymSet(g, CU(t, s5, s6, 12), t);
    footShadow(g, PX, F, 220); footShadow(g, GX, F, 150);
    const open = ease(d, T.what, .2), pull = ease(d, T.in, .18);
    const hb = phoneBack(g, PX, F, PS, { t: d, open, pull, eye: 1 });
    const [hx, hy] = hb.hatch;
    // Guess flicks the hatch open, pulls the drawer, and the moth flies up past his monocle
    const reachTo = d < T.what + .1 ? [hx + 66, hy - 10] : d < T.in - .05 ? [hx + 40, hy + 60] : [hx + 10, hy + 92 + pull * 36];
    const go = { t: d, face: -.5 }, after = d > T.store - .05;
    const hand = d > T.store + .12 ? 'hips' : reach('guess', GX, F, CS, 'L', reachTo, go);
    member(g, 'guess', GX, F, CS, { t: d, L: hand, R: { to: [.3, -.95], pose: 'grip' }, hold: { R: (g2, x, y, a, s) => magnifier(g2, x, y, -2.3, s * .72) }, eyes: { lx: after ? .2 : -.9, ly: after ? -1 : .4, expr: after ? 'wide' : 'open' }, brow: after ? 1.4 : .7, face: -.5, smile: after ? -.6 : .4 });
    if (d > T.store - .1) {
      const u = (d - T.store + .1) / 1.3, [mx, my] = hb.inside || [hx, hy + 96];
      moth(g, mx + Math.sin(u * 8) * 40 + u * 150, my - u * 520, .9, d, { rot: Math.sin(u * 6) * .3, trail: [Math.cos(u * 8) * .6 + .4, -1] });
    }
  }, { id: 'v2-store' });

  // ---- 7. Reload the screen; (Press jabs the arrow on the stab; the screen spins)
  const s7 = T.noSet - .1;
  gshot(s6, s7, (g, t) => {
    const d = now();
    gymSet(g, CU(t, s6, s7), t);
    footShadow(g, PX, F, 220);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { expr: 'open', lx: -.7, ly: -.3 } });
    pressJab(g, d, T.r1, PX - 205);
  }, { id: 'v2-reload' });

  // ---- 8. no set (close: the third row is a dashed empty outline)
  const s8 = T.is - .08;
  shot(s7, s8, (g, t) => {
    const d = now();
    logInsert(g, t, s7, logAt(d), { eyes: { expr: 'worried', ly: .4 }, after: (g2, sx, sy, s) => { const y = sy + 84 * s + 2 * 66 * s, k = kick(d, T.noSet, .3); if (k > .05) { g2.save(); g2.globalAlpha *= k; g2.strokeStyle = C('#c0566e'); g2.lineWidth = 7; g2.strokeRect(sx + 9 * s, y - 6 * s, 256 * s - 18 * s, 66 * s); g2.restore(); } } });
  }, { id: 'v2-noset' });

  // ---- 9. is seen. (Mabel's lip trembles; her eyes fill; a tear)
  const s9 = T.connect - .04;
  gshot(s8, s9, (g, t) => {
    const d = now();
    gymSet(g, cam([[s8, fc(MX, 1.34)], [s9, fc(MX, 1.46)]], t), t);
    barbell(g, MX + 40, F - 120, .92, { r: .92 });
    footShadow(g, MX, F, 330);
    const trem = Math.floor(d * 12) % 2 ? -.55 : -1.15;
    const M = mabel(g, MX, F, MS, { t: d, L: 'chest', R: 'chest', eyes: { expr: 'worried', ly: .25 }, smile: trem, sing: 0, dance: .1 });
    wetEyes(g, M, d, MS);
    tear(g, M, d, T.is, MS);
  }, { id: 'v2-tear' });

  // ---- 10. Connect once (Stress jams the plug in; the router springs up; waves)
  const s10 = T.more - .06, SX = 745;
  gshot(s9, s10, (g, t) => {
    const d = now();
    const j = ease(d, T.plug1 - .1, .1), done = d >= T.plug1;
    const hold = [lerp(735, PLUG.in[0], j), lerp(1215, PLUG.in[1], j)];
    gymSet(g, WALL(t, s9, s10), t, { net: netAt(d), plug: done ? 'in' : { at: hold, ang: Math.PI }, spark: (d - T.plug1) / .35 });
    footShadow(g, SX, F, 230);
    const hd = done ? [PLUG.in[0] - 6, PLUG.in[1]] : [hold[0] - 6, hold[1]], so = { t: d, lean: done ? -.03 : -.1, pose: 'grip', ang: Math.PI };
    member(g, 'stress', SX, F, CS, { ...so, L: d > T.once ? 'hips' : reach('stress', SX, F, CS, 'L', hd, so), R: 'hips', eyes: { lx: d > T.once ? .2 : -1, ly: -.3 }, gauge: done ? .95 : .45, steam: done ? 1 : 0, frown: done ? 0 : 1 });
  }, { id: 'v2-connect' });

  // ---- 11. more: still (the fan lit now; Press reloads)
  const s11 = T.still + .1;
  gshot(s10, s11, (g, t) => {
    const d = now();
    gymSet(g, CU(t, s10, s11), t);
    footShadow(g, PX, F, 220);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { expr: 'open', lx: -.6, ly: -.3 } });
    pressJab(g, d, T.r2, PX - 205);
  }, { id: 'v2-still' });

  // ---- 12. gone? (close, in the stop: the fan is lit, and the outline is still empty)
  const s12 = T.explore - .02;
  shot(s11, s12, (g, t) => {
    const d = now();
    logInsert(g, t, s11, logAt(d), { poke: 1 - ramp(d, T.r2 + .12, .15), eyes: { expr: d > T.gone - .05 ? 'worried' : 'open', ly: .3 } });
  }, { id: 'v2-gone' });

  // ---- 13. Explore! (in the stop: pith helmets clap on, Guess points onward)
  const s13 = T.chase - .2, X4 = { guess: MX - 258, press: MX - 95, stress: MX + 72, clawd: MX + 236 };
  gshot(s12, s13, (g, t) => {
    const d = now();
    gymSet(g, cam([[s12, fc(MX - 18, 1.24)], [s13, fc(MX - 20, 1.27)]], t), t);
    for (const k in X4) footShadow(g, X4[k], F, k === 'stress' ? 230 : 170);
    const hd = k => ramp(d, T.explore - .02 + k * .07, .13), pt = d > T.explore + .3;
    member(g, 'guess', X4.guess, F, CS, { t: d, helmet: hd(0), L: pt ? { to: [.95, -.62], pose: 'point' } : 'hips', R: 'hips', eyes: { lx: pt ? -1 : 0, expr: 'open' }, bang: pt ? 1 : 0, face: pt ? -.6 : 0 });
    member(g, 'press', X4.press, F, .7, { t: d, helmet: hd(1), L: 'up', R: 'hips', eyes: { lx: pt ? -1 : 0 } });
    member(g, 'stress', X4.stress, F, CS, { t: d, helmet: hd(2), L: 'hips', R: 'hips', eyes: { lx: pt ? -1 : 0 }, gauge: .6 });
    const ch = hd(3);
    clawd(g, X4.clawd, F, CS, { t: d, hat: ch > 0 ? 'helmet' : 'boater', hatTip: ch > 0 ? (1 - easeOut(ch, 3)) * 6 : 0, hatRot: ch > 0 ? (1 - easeOut(ch, 3)) * 3 : 0, L: 'hips', R: { to: [.04, .32], pose: 'open' }, eyes: { lx: pt ? -1 : 0 }, sing: true });
    if (ch > 0 && ch < 1) { const u = ch; g.save(); g.translate(X4.clawd + 20 + u * 260, F - 215 - u * 400); g.rotate(u * 4); boater(g, 0, 0, CS); g.restore(); }
  }, { id: 'v2-explore' });

  // ---- 14. We chase (low on the floor: chalk footprints lead away from the phone's shoes; Guess
  //         follows them bent double with his glass, Clawd tiptoeing after him, glass down too)
  const s13b = at(L5, 'the') - .1, s14 = T.try - .06;
  T.ghostOut = s13;
  gshot(s13, s13b, (g, t) => {
    const d = now();
    gymSet(g, cam([[s13, fc(PX - 150, 1.55)], [s13b, fc(PX - 190, 1.6)]], t), t);
    footShadow(g, PX, F, 200);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { lx: -1, ly: .6 } });
    for (let i = 0; i < 7; i++) footprint(g, PX - 70 - i * 64, F - 18 + (i % 2 ? 12 : 0), .95, -1, i % 2 ? 1 : -1, 1);
    const u = clamp((d - s13) / (s13b - s13)), gx = lerp(PX - 200, PX - 330, u), walk = d * 2.6;
    footShadow(g, gx, F, 140);
    member(g, 'guess', gx, F, CS, { t: d, helmet: 1, walk, lean: -.3, L: 'hips', R: { to: [-.95, .1], pose: 'grip' }, hold: { R: (g2, x, y, a, s) => magnifier(g2, x, y, Math.PI * .78, s * .72) }, eyes: { lx: -1, ly: 1 }, face: -.7 });
  }, { id: 'v2-trail' });
  // ---- 15. the clue; (the trail ends at the plug: Guess's glass finds it, his antenna springs to
  //         "!", and Clawd bumps into his back)
  gshot(s13b, s14, (g, t) => {
    const d = now();
    gymSet(g, cam([[s13b, fc(640, 1.45)], [s14, fc(636, 1.5)]], t), t, { net: 1, plug: 'in' });
    for (let i = 0; i < 6; i++) footprint(g, 930 - i * 50, F - 18 + (i % 2 ? 12 : 0), .95, -1, i % 2 ? 1 : -1, 1);
    const u = clamp((d - s13b) / (T.clue - s13b)), stop = d > T.clue, bump = kick(d, T.clue + .06, .22);
    const gx = lerp(900, 700, easeOut(u)), cx = lerp(1080, 860, easeOut(u)) - bump * 30;
    const walk = stop ? undefined : d * 2.6;
    footShadow(g, gx, F, 140); footShadow(g, cx, F, 190);
    clawd(g, cx, F, CS, { t: d, hat: 'helmet', walk, lean: stop ? -.04 : -.16, squash: bump * .25, L: 'hips', R: { to: [.1, -.25], pose: 'grip' }, hold: { R: (g2, x, y, a, s) => magnifier(g2, x, y, -2.3, s * .7) }, eyes: { lx: -1, ly: .3, expr: stop ? 'wide' : 'open' }, sing: true });
    member(g, 'guess', gx, F, CS, { t: d, helmet: 1, walk, lean: stop ? -.18 : -.3, L: 'hips', R: { to: [-1.0, .2], pose: 'grip' }, hold: { R: (g2, x, y, a, s) => magnifier(g2, x, y, Math.PI * .86, s * .75) }, eyes: { lx: -1, ly: .4 }, bang: stop ? 1 : 0, face: -.7, jump: bump * .4 });
  }, { id: 'v2-clue' });

  // ---- 16. try something new: (Guess pulls the plug and holds it up; a bulb lights over his head)
  const s15 = T.connect2 - .1, GX2 = 710;
  gshot(s14, s15, (g, t) => {
    const d = now();
    const pulled = d >= T.pull2, y2 = ease(d, T.pull2, .16);
    const top = [GX2 - 170, F - 330];
    const at2 = pulled ? [lerp(PLUG.in[0], top[0], y2), lerp(PLUG.in[1], top[1], y2)] : PLUG.in;
    gymSet(g, cam([[s14, fc(640, 1.46)], [s15, fc(648, 1.56)]], t), t, { net: netAt(d), plug: pulled ? { at: at2, ang: lerp(Math.PI, -Math.PI / 2, y2) } : 'in', spark: (d - T.pull2) / .3 });
    footShadow(g, GX2, F, 150);
    const hd = pulled ? [at2[0] + 8, at2[1] + 12] : [PLUG.in[0] + 2, PLUG.in[1]];
    const grin = d > T.new - .05, go = { t: d, face: grin ? .2 : -.3 };
    const r = member(g, 'guess', GX2, F, CS, { t: d, helmet: 1, L: reach('guess', GX2, F, CS, 'L', hd, go), R: 'hips', eyes: { expr: grin ? 'happy' : 'wide', lx: grin ? 0 : -.6, ly: -.6 }, bang: 1, smile: grin ? 1.4 : .6, face: go.face });
    ideaBulb(g, GX2 + 78, F - 505, .85, ramp(d, T.something - .05, .3), d);
  }, { id: 'v2-idea' });

  // ---- 16. Connect, then (Guess plugs it in first: the router springs up; he points to Mabel)
  const s16 = T.save2 - .14;
  gshot(s15, s16, (g, t) => {
    const d = now();
    const j = ease(d, T.plug2 - .1, .1), done = d >= T.plug2;
    const hold = [lerp(GX2 - 162, PLUG.in[0], j), lerp(F - 318, PLUG.in[1], j)];
    gymSet(g, WALL(t, s15, s16), t, { net: netAt(d), plug: done ? 'in' : { at: hold, ang: lerp(-Math.PI / 2, Math.PI, j) }, spark: (d - T.plug2) / .35 });
    footShadow(g, GX2, F, 150);
    const hd = done ? [PLUG.in[0] + 2, PLUG.in[1]] : [hold[0] + 8, hold[1]], go = { t: d, face: d > T.then2 ? .6 : -.3 };
    member(g, 'guess', GX2, F, CS, { t: d, helmet: 1, L: d > T.then2 ? 'hips' : reach('guess', GX2, F, CS, 'L', hd, go), R: d > T.then2 ? 'point' : 'hips', eyes: { lx: d > T.then2 ? 1 : -.6 }, bang: 1, face: go.face });
  }, { id: 'v2-connect2' });

  // ---- 17. save; the sets (Mabel lifts; the row pops in; Press reloads)
  const PRX = PX - 172, s17 = T.r3 + .06;
  gshot(s16, s17, (g, t) => {
    const d = now();
    gymSet(g, two(t, s16, s17), t);
    footShadow(g, PX, F, 200); footShadow(g, MX, F, 360);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { expr: d > T.bPop + .1 ? 'happy' : 'open', lx: .9, ly: -.5 } });
    pressJab(g, d, T.r3, PRX);
    liftOrFlex(g, d, T.save2, 99, false);
  }, { id: 'v2-save2' });

  // ---- 18. all stay. (close: the screen spins and settles with every row there; then a flex)
  const s18 = T.stay + .02;
  shot(s17, s18, (g, t) => {
    const d = now();
    logInsert(g, t, s17, logAt(d), { poke: 1 - ramp(d, T.r3 + .12, .15), eyes: { expr: d > T.all ? 'happy' : 'open' } });
  }, { id: 'v2-allstay' });
  const s19 = T.drop - .1;
  gshot(s18, s19, (g, t) => {
    const d = now();
    gymSet(g, two(t, s18, s19), t);
    footShadow(g, PX, F, 200); footShadow(g, MX, F, 360); footShadow(g, PRX, F, 120);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { expr: 'happy' } });
    member(g, 'press', PRX, F, .7, { t: d, helmet: 1, L: 'up', R: 'up', eyes: { expr: 'happy' }, jump: kick(d, s18, .3) * .6 });
    liftOrFlex(g, d, 0, 0, true);
  }, { id: 'v2-flex' });

  // ---- 19. We drop the net, (Stress yanks the plug; the router wilts; a knowing look)
  const s20 = T.save3 - .08;
  gshot(s19, s20, (g, t) => {
    const d = now();
    const out = d >= T.drop + .02, y2 = ease(d, T.drop, .14);
    const top = [SX - 40, F - 330];
    const at2 = out ? [lerp(PLUG.in[0], top[0], y2), lerp(PLUG.in[1], top[1], y2)] : PLUG.in;
    gymSet(g, WALL(t, s19, s20), t, { net: netAt(d), plug: out ? { at: at2, ang: lerp(Math.PI, -Math.PI / 2, y2) } : 'in', spark: (d - T.drop) / .3 });
    footShadow(g, SX, F, 230);
    const hd = [at2[0] - 6, at2[1] + 6];
    const knowing = d > T.net7 + .1, so = { t: d, lean: out ? .1 - y2 * .06 : -.06 };
    member(g, 'stress', SX, F, CS, { ...so, L: reach('stress', SX, F, CS, 'L', hd, so), R: 'hips', eyes: { lx: knowing ? .3 : -1, ly: knowing ? 0 : -.2 }, frown: knowing ? -.6 : .5, gauge: .3, steam: kick(d, T.drop, .4) });
    if (knowing) pops(g, SX + 10, F - 300, 60, 3, { a0: -Math.PI * .8, span: Math.PI * .6, w: 5 });
  }, { id: 'v2-drop' });

  // ---- 20. then save a set; (Mabel lifts; the row pops in, ticked: "Saved!" again)
  const s21 = T.r4 + .02;
  gshot(s20, s21, (g, t) => {
    const d = now();
    gymSet(g, two(t, s20, s21), t);
    footShadow(g, PX, F, 200); footShadow(g, MX, F, 360);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { expr: d > T.cPop + .1 ? 'wink' : 'open', lx: .9, ly: -.5 } });
    liftOrFlex(g, d, T.save3 + .16, 99, false);
  }, { id: 'v2-save3' });

  // ---- 21. A new (close, in the stop: reload; that row's gone again: an empty outline)
  const s22 = T.check - .06;
  shot(s21, s22, (g, t) => {
    const d = now();
    logInsert(g, t, s21, logAt(d), { poke: 1 - ramp(d, T.r4 + .1, .15), eyes: { expr: d > T.r4 + RL[3] * .6 ? 'worried' : 'open' } });
  }, { id: 'v2-gone2' });

  // ---- 22. check flags what went (Clawd sets down a brand-new check and winds it: its red flag)
  const s23 = T.away - .1, KX = PX + 205, CX = PX + 410;
  gshot(s22, s23, (g, t) => {
    const d = now();
    gymSet(g, cam([[s22, fc(PX + 228, 1.4)], [s23, fc(PX + 232, 1.47)]], t), t);
    footShadow(g, PX, F, 200); footShadow(g, KX, F, 150); footShadow(g, CX, F, 240);
    mabelPhone(g, PX, F, PS, logAt(d), { eyes: { expr: 'worried', lx: .8 } });
    const land = ease(d, T.check - .05, .12), wind = d > T.check + .05 && d < T.flags;
    const flag = ramp(d, T.flags, .1);
    const k = check(g, KX, F - (1 - land) * 160, 1.45, { t: d, flag, flagCol: RED, look: -1, key: wind ? 9 : 2.2, hop: kick(d, T.flags, .2) * .6 + (d > T.what4 ? Math.abs(Math.sin(d * 14)) * .25 : 0), wave: d > T.what4, card: ruleCard, squash: kick(d, T.check + .07, .12) * .3 });
    if (d > T.flags && d < T.flags + .5 && k.flagTip) pops(g, k.flagTip[0], k.flagTip[1], 50, 6, { a0: -Math.PI, span: Math.PI * 2 * .85, w: 6, col: RED });
    const point = d > T.what4 - .1;
    clawd(g, CX, F, CS, { t: d, hat: 'helmet', L: wind || d < T.check + .05 ? { to: [.42, .02], pose: 'grip' } : 'hips', R: 'hips', eyes: { lx: -1, expr: d > T.flags + .1 ? 'wide' : 'open' }, sing: true, lean: point ? -.08 : 0 });
  }, { id: 'v2-check' });

  // ---- 23. away. (Mabel scoops up the check and hugs it, red flag and all)
  gshot(s23, end, (g, t) => {
    const d = now();
    gymSet(g, cam([[s23, fc(MX - 20, 1.3)], [end, fc(MX - 20, 1.4)]], t), t);
    footShadow(g, MX, F, 330);
    const scoop = ease(d, s23, .25);
    const M = mabel(g, MX, F, MS, { t: d, L: { to: [-.41, .63], pose: 'open' }, R: { to: [-.35, .63], pose: 'open' }, eyes: { expr: 'happy' }, smile: 1.4, sing: 0, dance: .4 });
    const [hx, hy] = M.head;
    const kx = MX + 4, ky = lerp(F, hy + 320, scoop);
    check(g, kx, ky, 1.25, { t: d, flag: 1, flagCol: RED, look: .4, wave: true, card: ruleCard });
    for (const dd of [-1, 1]) glove(g, kx + dd * 70, ky - 110, dd > 0 ? Math.PI * .9 : Math.PI * .1, 25, 'open', { flip: dd < 0, seed: 614 + dd });
    for (let i = 0; i < 3; i++) { const ph = (d * .9 + i / 3) % 1; g.save(); g.globalAlpha *= 1 - ph; heart(g, hx + (i - 1) * 110 + Math.sin(ph * 6 + i) * 20, hy - 100 - ph * 200, 18 + i * 4); g.restore(); }
  }, { id: 'v2-hug' });
}

// Mabel's lift beside the phone: heave on tSave and hold it there; or (flex) the barbell down at
// her feet and a happy double-biceps.
function liftOrFlex(g, d, tSave, tDown, flex) {
  if (flex) {
    barbell(g, MX, F - 52, .92, { r: .92 });
    mabel(g, MX, F, MS, { t: d, L: 'flex', R: 'flex', eyes: { expr: 'happy' }, smile: 1.4, sing: 0, dance: .5 });
    sparkle(g, MX, F - 430, 260, d, 6, GOLD, 61);
    return;
  }
  const h0 = tSave - .2, p = (d < h0 ? 0 : d < tSave ? easeOut((d - h0) / .2, 2) : 1) * (1 - ease(d, tDown, .18));
  mabelLift(g, MX, F, MS, p, { t: d, eyes: { expr: p > 0 && p < 1 ? 'happy' : 'open', lx: -.9, ly: -.2 }, smile: p >= 1 ? 1.3 : .3, sing: 0 });
  if (p >= 1) sparkle(g, MX, F - 640, 260, d, 5, GOLD, 62);
}
// Mabel's eyes brimming: a watery crescent along each lower lid, and big catch-lights.
function wetEyes(g, M, d, s) {
  const [hx, hy] = M.head, hr = M.hr, ey = hy - hr * .06;
  for (const dd of [-1, 1]) {
    const X = hx + dd * hr * .34, rw = 12 * s * 1.7, rh = 21 * s * 1.7 * .95;
    g.save(); g.beginPath(); g.ellipse(X, ey, rw, rh, 0, 0, TAU); g.clip();
    g.fillStyle = C('#8fd0ef'); g.globalAlpha = .75; g.beginPath(); g.ellipse(X, ey + rh * .95, rw * 1.1, rh * .42 + Math.sin(d * 20) * 1.5, 0, 0, TAU); g.fill();
    g.restore();
    g.fillStyle = C(WHITE); g.beginPath(); g.arc(X - rw * .25, ey - rh * .3, 4.5 * s, 0, TAU); g.fill();
  }
}
// A tear welling on Mabel's lower lid, swelling, then rolling down her cheek.
function tear(g, M, d, t0, s) {
  if (d < t0) return;
  const [hx, hy] = M.head, hr = M.hr;
  const X = hx + hr * .34 + 8 * s, Y = hy - hr * .06 + 30 * s;
  const grow = clamp((d - t0) / .25), roll = clamp((d - t0 - .3) / .45);
  const r = (6 + grow * 10) * s;
  const x = X + roll * 18 * s, y = Y + roll * roll * 140 * s;
  shape(g, spline([[x, y - r * 1.8], [x + r * .9, y + r * .1], [x, y + r], [x - r * .9, y + r * .1]], true, 6), { fill: '#9fd6ef', shade: '#5aa8d0', w: 3 * s, seed: 81, gloss: { x: .35, y: .4, w: .14, h: .1, dot: false } });
}
