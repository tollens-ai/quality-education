// Chorus 2, still in Mabel's gym: the crew's refrain, with Clawd the tester asking now.
//  "Did you actually test it?"        Clawd, glass to his eye, leans in at us: his eye fills the lens.
//  "Press it, stress it,              Three cuts: Press mashes save with no net (tick, tick, tick);
//   second-guess it?"                 Stress yanks the plug in and out (the waves flicker); Guess
//                                     squints at the "Saved!" tick through his monocle.
//  "Find a clue? Congratulations!"    Mabel hoists the whole crew and the red-flag check overhead on
//                                     her barbell; confetti.
//  "Now pursue its implications."     The camera pulls back out of her basement to the street: a row
//                                     of basement gyms, every lifter's phone with no net; Guess's
//                                     glass sweeps along them.
//  "What did you try?                 Clawd answers with evidence: a snapshot of the pulled plug and a
//   What did you find?"               barbell; then one of the dashed empty row.
//  "What changed your mind?"          The "Saved!" tick on the phone cracks and falls off: behind it,
//                                     the store's drawer, empty. Mabel takes out her own notebook and
//                                     pencil and jots her sets down herself.
import { W, H, TAU, clamp, lerp, now, easeOut, easeInOut, backOut, wordsOf } from '../kit.js';
import { GOLD, RED, WHITE, ROSE, CLAWD, C } from '../palette.js';
import { shot } from '../shots.js';
import { GYM, PLUG, gymSet, street, ST, lastGymCam } from '../places-gym.js';
import { clawd } from '../clawd.js';
import { check } from '../crew.js';
import { mabel } from '../people.js';
import { magnifier, socket, plug, router } from '../cast.js';
import { mabelPhone, mabelLift, member, reach, barbell, barbellIcon, tick, crackedTick, snapshot, notebook, pencil, ghostRow, shelfPhone, lifter, moth, PINK, gymFront, streetFront, setAppLook } from '../props-gym.js';
import { sticker, APP, appHeader, appLogo } from '../gymapp.js';
import { pops, qmark, sweat } from '../rig.js';
import { at, ramp, ease, kick, cam, floorCam, sparkle, footShadow, confetti, place, look } from '../common.js';
import { shape, ellipse, eye, stroke, rrect, glove, line } from '../ink.js';
import { logInsert, ruleCard, gshot } from './verse2.js';
import { LEAD } from '../lyrics.js';

const F = GYM.floor, PX = GYM.phone, MX = GYM.mabel, PS = .72, MS = .9, CS = .78;
const fc = (x, z) => floorCam(x, z, F);
// Mabel's log as verse 2 left it: two old sets, the set saved with the net on, and the outline where
// the set saved without it was lost.
const FINAL = [{}, {}, {}, { ghost: true }];

export function register() {
  setAppLook({ app: APP, header: appHeader, logo: appLogo });
  const C1 = 'Did you actually', C2 = 'Press it, stress', C3 = 'Find a clue?', C4 = 'Now pursue', C5 = 'What did you try?', C6 = 'What changed';
  const w5 = wordsOf(C5, 1);
  const T = {
    did: at(C1, 'Did', 1), actually: at(C1, 'actually', 1), test: at(C1, 'test', 1), it: at(C1, 'it', 1),
    press: at(C2, 'Press', 1), stress: at(C2, 'stress', 1), guess: at(C2, 'second', 1),
    find: at(C3, 'Find', 1), clue: at(C3, 'clue', 1), congrats: at(C3, 'Congratulations', 1),
    now: at(C4, 'Now', 1), pursue: at(C4, 'pursue', 1), its: at(C4, 'its', 1), impl: at(C4, 'implications', 1),
    what1: w5[0].s - LEAD, try: w5[3].s - LEAD, what2: w5[4].s - LEAD, find2: w5[7].s - LEAD,
    what6: at(C6, 'What', 1), changed: at(C6, 'changed', 1), your: at(C6, 'your', 1), mind: at(C6, 'mind', 1),
  };
  const end = 96.4;

  // ---- 1. Did you actually test it? (Clawd raises his glass: his eye fills it; he leans in at us)
  const c0 = T.did, c1 = T.press - .02;
  gshot(c0, c1, (g, t) => {
    const d = now();
    const c = cam([[c0, fc(MX, 1.92)], [T.test - .12, fc(MX, 2.02)], [T.test + .14, fc(MX, 2.34)], [c1, fc(MX, 2.4)]], t);
    g.save(); gymSet(g, c, t, { soft: 2.6 });
    footShadow(g, MX, F, 260);
    const up = ease(d, T.actually - .12, .2), ptg = d > T.test - .04;
    // the glass held up over his right eye, the lens showing that eye, big
    const eyeX = MX + 234 * .19, eyeY = F - 42 - 83 - 167 * .1;
    const ang = lerp(-1.2, -2.05, up), ls = CS * .9, reachL = 95 * ls + 70 * ls;
    const lens = [lerp(MX + 150, eyeX, up), lerp(F - 120, eyeY, up)];
    const hand = [lens[0] - Math.cos(ang) * reachL, lens[1] - Math.sin(ang) * reachL];
    const sh = [MX + 234 * .52, F - 125 + 13];
    const blink = Math.abs(d - (T.it + .12)) < .05 ? 1 : 0;
    clawd(g, MX, F, CS, { t: d, hat: 'helmet', dance: .25, lean: ptg ? .05 : 0,
      L: ptg ? { to: [.2, .1], pose: 'point', ang: Math.PI * .78 } : 'hips',
      R: { to: [(hand[0] - sh[0]) / 234, (hand[1] - sh[1]) / 234], pose: 'grip' },
      hold: { R: (g2, x, y, a, s) => magnifier(g2, x, y, ang, s * .9, { inside: up < .6 ? null : (g3, lx, ly, r) => {
        g3.fillStyle = C(CLAWD); g3.fillRect(lx - r, ly - r, r * 2, r * 2);
        eye(g3, lx + (eyeX - lens[0]) * .5, ly + (eyeY - lens[1]) * .5, 17 * CS * 2.3, 37 * CS * 2.3, { lx: 0, ly: 0, blink, lw: 7, seed: 4301, col: CLAWD });
        if (d > T.it) { stroke(g3, [[lx - r * .55, ly - r * .62], [lx - r * .1, ly - r * .78], [lx + r * .35, ly - r * .7]], { w: 7, seed: 4302 }); }
      } }) },
      eyes: { lx: 0, ly: 0, cock: d > T.it ? 1 : 0 }, sing: true });
    if (ptg && d < T.test + .4) pops(g, MX - 205, F - 50, 46, 5, { a0: Math.PI * .3, span: Math.PI * 1.1, w: 5 });
    g.restore();
  }, { id: 'c2-ask' });

  // ---- 2. Press it, (Press mashes the phone's button with no net: "Saved!", "Saved!", "Saved!")
  const c2 = T.stress - .04;
  gshot(c1, c2, (g, t) => {
    const d = now();
    g.save(); gymSet(g, cam([[c1, fc(PX - 60, 1.5)], [c2, fc(PX - 60, 1.58)]], t), t);
    footShadow(g, PX, F, 220); footShadow(g, PX - 200, F, 130);
    const n = Math.floor((d - T.press) * 12), jab = d > T.press - .04 && n % 2 === 0 ? 1 : 0;
    mabelPhone(g, PX, F, PS, { rows: FINAL, big: d > T.press - .04 ? (jab ? 1 : .86) : 0, wifi: 0 }, { eyes: { expr: 'wide', lx: Math.sin(d * 30) * .7 }, lean: -jab * .03 });
    const btn = [PX - 2, F - 46], po = { t: d, dance: .2 };
    member(g, 'press', PX - 200, F, .7, { ...po, helmet: 1, pressed: jab, R: reach('press', PX - 200, F, .7, 'R', jab ? btn : [btn[0] - 46, btn[1] - 30], { ...po, pose: 'point' }), L: { to: [.2, -1.3], pose: 'fist' }, eyes: { lx: .9, ly: .5 }, sing: true });
    if (jab) pops(g, btn[0], btn[1], 30, 5, { a0: -Math.PI * .9, span: Math.PI * .8, w: 4 });
    g.restore();
  }, { id: 'c2-press' });

  // ---- 3. stress it, (Stress yanks the plug in and out; the waves flicker on and off)
  const c3 = T.guess - .04, SX = 745;
  gshot(c2, c3, (g, t) => {
    const d = now();
    const k = Math.floor((d - T.stress) * 6), inNow = d >= T.stress && k % 2 === 0;
    const at2 = inNow ? PLUG.in : [PLUG.in[0] + 70, PLUG.in[1] - 24];
    g.save(); gymSet(g, cam([[c2, fc(590, 1.42)], [c3, fc(585, 1.5)]], t), t, { net: inNow ? 1 : 0, plug: { at: at2, ang: Math.PI }, spark: inNow ? ((d - T.stress) * 6 % 1) * 2 : 0 });
    footShadow(g, SX, F, 230);
    const so = { t: d, lean: -.08, ang: Math.PI };
    member(g, 'stress', SX, F, CS, { ...so, L: reach('stress', SX, F, CS, 'L', [at2[0] - 6, at2[1]], so), R: 'hips', helmet: 1, gauge: .98, steam: 1, shake: .6, frown: 1, eyes: { lx: -1, ly: -.2 }, sing: true });
    g.restore();
  }, { id: 'c2-stress' });

  // ---- 4. second-guess it? Find a clue? (Guess squints at the "Saved!" tick through his monocle; on
  //         "Find" he slaps the testers' "?!" sticker over it: the app said saved; testing says look)
  const c4 = T.congrats - .03, GX = PX + 200, SLAP = T.find;
  const stuck = (d) => (g2, x, y, r) => { if (d >= SLAP - .02) sticker(g2, x + r * .04, y + r * .02, r * .8, { p: ramp(d, SLAP - .02, .14), ang: -.22, since: d - SLAP - .1 }); };
  gshot(c3, c4, (g, t) => {
    const d = now();
    g.save(); gymSet(g, cam([[c3, fc(PX + 90, 1.62)], [SLAP - .2, fc(PX + 96, 1.72)], [c4, fc(PX + 70, 1.8)]], t), t);
    footShadow(g, PX, F, 220); footShadow(g, GX, F, 150);
    const slapped = d > SLAP + .05;
    mabelPhone(g, PX, F, PS, { rows: FINAL, big: 1, wifi: 0, onTick: stuck(d) }, { eyes: { expr: slapped ? 'wide' : 'worried', lx: .9 } });
    const doubt = d > 82.12 && d < SLAP - .1;
    const go = { t: d, lean: -.22, face: -.8 };
    const slap = d > SLAP - .16 && d < SLAP + .2;
    const r = member(g, 'guess', GX, F, CS, { ...go, helmet: 1, L: slap ? reach('guess', GX, F, CS, 'L', [PX + 30, F - 228], { ...go, pose: 'open' }) : 'chin', R: slapped ? 'up' : 'hips', eyes: { expr: slapped ? 'happy' : 'smug', lx: -1, ly: .2 }, brow: doubt ? 1.6 : 1.1, bang: slapped ? 1 : 0, sing: true });
    if (!slapped) sweat(g, PX - 110, F - 420, 1, '#8fd0e8');
    if (doubt) { const p = backOut(ramp(d, 82.12, .2), 2.4); g.save(); g.translate(GX - 30, r.cy - 330); g.scale(p, p); qmark(g, 0, 0, 120, ROSE); g.restore(); }
    g.restore();
  }, { id: 'c2-guess' });

  // ---- 5. Find a clue? Congratulations! (Mabel hoists the crew and the red-flag check; confetti)
  const c5 = T.now;
  const hoist = (g, d, x, y, s, o = {}) => {
    const p = o.p ?? (d < c4 ? 0 : easeOut(ramp(d, c4, .2), 2));
    const bend = .55 + Math.sin(d * 7.2) * .12 * (p >= 1 ? 1 : 0);
    const rs = .55 * s / MS;
    mabelLift(g, x, y, s, p, { t: d, barW: 1.35 * s / MS, bend, eyes: { expr: p > 0 && p < 1 ? 'happy' : 'happy' }, smile: 1.5, sing: 0, load: (g2, bx, by, ss, bw) => {
      if (p < .6) return;
      const L = 300 * bw, yb = u => by + bend * 40 * bw * u * u - 8 * s / MS;
      const riders = [
        ['press', -1.0, -62], ['stress', -.6, 0], ['check', -.12, 0], ['clawd', .3, 0], ['guess', 1.0, -62],
      ];
      for (const [who, u, dy] of riders) {
        const rx = bx + u * L, ry = yb(Math.abs(u)) + dy * s / MS;
        if (who === 'check') check(g2, rx, ry, 1.0 * s / MS, { t: d, flag: 1, flagCol: RED, wave: true, look: .2, card: ruleCard });
        else if (who === 'clawd') clawd(g2, rx, ry, rs, { t: d, hat: 'helmet', L: 'cheer', R: 'up', eyes: { expr: 'happy' }, sing: true, dance: .8 });
        else member(g2, who, rx, ry, rs * (who === 'press' ? .9 : 1), { t: d, helmet: 1, L: 'cheer', R: 'up', eyes: { expr: 'happy' }, bang: who === 'guess' ? 1 : 0, sing: true, dance: .8 });
      }
    } });
  };
  gshot(c4, c5, (g, t) => {
    const d = now();
    g.save(); gymSet(g, cam([[c4, fc(MX, .9)], [c5, fc(MX, .86)]], t), t);
    footShadow(g, MX, F, 380);
    hoist(g, d, MX, F, MS);
    g.restore();
    g.save(); g.beginPath(); g.rect(0, 0, W, 1112); g.clip(); confetti(g, t, T.congrats - .05, 80, { seed: 11, y0: -40 }); g.restore();
  }, { id: 'c2-hoist' });

  // ---- 6. Now pursue its implications. (pull back out of her gym to the street: a row of basement
  //         gyms. Guess's glass comes in from the side and stops over each one's phone in turn,
  //         Mabel's first, then her neighbours': in the lens, the same struck-through fan and the same
  //         empty dashed row.)
  const c6 = T.what1 - .3, room = i => ST.rooms[i];
  const KINDS = ['bunny', 'strongman', null, 'piglet', 'strongman', 'bunny'];
  const PHC = [PINK, PINK, PINK, PINK, PINK, PINK];   // one app: every gym's phone is the app's pink phone
  const SF = ST.floor, GR = ST.ground, PHY = 1600, phX = i => room(i) - 140, phY = PHY - 64;
  const drawStreet = (g, c, t, d) => {
    place(g, street(), c);
    for (let i = 0; i < 6; i++) {
      const cx = room(i);
      router(g, phX(i), GR + 200, .42, { t: d, on: 0 });
      shelfPhone(g, phX(i), PHY, 1.0, PHC[i]);
      footShadow(g, cx + 100, SF, 180);
      if (i === 2) { hoist(g, d, cx + 100, SF, .38, { p: 1 }); continue; }
      lifter(g, KINDS[i], cx + 100, SF, .62, d + i * .37, (Math.sin((d + i * .4) * 5.6) + 1) / 2);
    }
  };
  const z0 = .774 / .38, Z = 1.0;
  const stops = [[85.12, 2], [85.48, 3], [85.98, 3], [86.32, 4], [86.78, 4]];
  const camKeys = [[c5, floorCam(room(2) + 100, z0, SF)], [c5 + .48, floorCam(phX(2), Z, SF)], ...stops.map(([tt, i]) => [tt, floorCam(phX(i), Z, SF)]), [c6, floorCam(phX(4) + 260, Z, SF)]];
  shot(c5, c6, (g, t) => {
    const d = now();
    const sc = cam(camKeys, t);
    const fade = ramp(t, c5, .38);
    if (fade < 1) { g.save(); gymSet(g, cam([[c5, fc(MX, .86)], [c5 + .4, fc(MX, .8)]], t), t); hoist(g, d, MX, F, MS); g.restore(); gymFront(g, lastGymCam(), t, { a: 1 - fade }); }
    g.save(); g.globalAlpha = fade; drawStreet(g, sc, t, d); g.restore();
    // the glass: in from the left at the phones' height, then it stays in the middle as the street
    // moves past under it, stopping on each phone
    const enter = easeOut(ramp(t, c5 + .3, .42));
    if (enter <= 0) { streetFront(g, sc, t, { a: fade }); return; }
    const R = 220, M = 3.2;
    const lx = lerp(-R - 40, W / 2, enter), ly = H / 2 + (phY - sc.y) * sc.z;
    const wx0 = sc.x + (lx - W / 2) / sc.z, wy0 = sc.y + (ly - H / 2) / sc.z;
    g.save(); g.beginPath(); g.arc(lx, ly, R, 0, TAU); g.clip();
    drawStreet(g, { x: wx0, y: wy0, z: sc.z * M, sx: lx - W / 2, sy: ly - H / 2 }, t, d);
    g.restore();
    // its rim, and a glint
    shape(g, ellipse(lx, ly, R + 30, R + 30, 0, 64), { fill: null, w: 9, seed: 5133 });
    g.save(); g.strokeStyle = C(GOLD); g.lineWidth = 22; g.beginPath(); g.arc(lx, ly, R + 15, 0, TAU); g.stroke(); g.restore();
    shape(g, ellipse(lx, ly, R + 2, R + 2, 0, 64), { fill: null, w: 7, seed: 5134 });
    g.save(); g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 10; g.beginPath(); g.arc(lx, ly, R * .8, -2.6, -1.9); g.stroke(); g.restore();
    // Guess walks the pavement above, holding it down on a long handle; he walks only while the
    // street moves
    g.save(); look(g, sc);
    const gx = wx0 + 60, moving = Math.abs(cam(camKeys, t + .03).x - sc.x) > 1.5 || enter < 1;
    const hand = [gx - 18, GR - 250], lensTop = [wx0, wy0 - (R + 30) / sc.z];
    line(g, [hand, lensTop], { w: 24, taper: false, seed: 5131 });
    line(g, [hand, lensTop], { w: 13, taper: false, seed: 5132, color: '#6e4128' });
    footShadow(g, gx, GR, 150);
    const go = { t: d, walk: moving ? d * 2.4 : undefined, face: .2 };
    member(g, 'guess', gx, GR, .8, { ...go, helmet: 1, L: reach('guess', gx, GR, .8, 'L', hand, go), R: 'hips', eyes: { lx: -.3, ly: 1 }, lean: 0, bang: moving ? 0 : 1 });
    g.restore();
    streetFront(g, sc, t, { a: fade });
  }, { id: 'c2-street' });

  // ---- 7. What did you try? (Clawd answers with a snapshot: the pulled plug beside a barbell)
  const c7 = T.what2 - .02, CX = MX - 210;
  const holdPhoto = (g, d, which, pop, flick) => {
    const k = clawd(g, CX, F, CS, { t: d, hat: 'helmet', lean: 0, L: 'hips', R: { to: [.3, -.6], pose: 'grip' }, eyes: { lx: .5, ly: -.1 }, sing: true });
    const h = k.hands.R, s = backOut(clamp(pop), 2.2);
    if (s <= 0) return;
    g.save(); g.translate(h.x, h.y); g.scale(s, s); g.translate(-h.x, -h.y);
    snapshot(g, h.x + 135, h.y - 40, 300, 330, -.05 + Math.sin(d * 3) * .02 + flick, which === 1 ? photoTry : photoFind, { seed: 7700 + which });
    g.restore();
  };
  gshot(c6, c7, (g, t) => {
    const d = now();
    g.save(); gymSet(g, cam([[c6, fc(CX + 167, 1.2)], [c7, fc(CX + 165, 1.24)]], t), t);
    footShadow(g, CX, F, 250);
    holdPhoto(g, d, 1, ramp(d, T.what1, .2), kick(d, T.try, .25) * .08);
    g.restore();
  }, { id: 'c2-try' });

  // ---- 8. What did you find? (a second snapshot: the dashed empty row)
  const c8 = T.what6 - .02;
  gshot(c7, c8, (g, t) => {
    const d = now();
    g.save(); gymSet(g, cam([[c7, fc(CX + 165, 1.24)], [c8, fc(CX + 163, 1.28)]], t), t);
    footShadow(g, CX, F, 250);
    // the first flies off to the left as the second comes up
    const off = ramp(d, c7, .25);
    if (off < 1) { g.save(); g.translate(-off * 700, -off * 200); g.rotate(-off * .5); holdPhoto(g, d, 1, 1, 0); g.restore(); }
    holdPhoto(g, d, 2, ramp(d, c7 + .05, .22), kick(d, T.find2, .25) * .08);
    g.restore();
  }, { id: 'c2-find' });

  // ---- 9. What changed your (close: the "Saved!" tick cracks and falls away: the drawer, empty)
  const c9 = T.mind + .9;
  shot(c8, c9, (g, t) => {
    const d = now();
    const crack = ramp(d, T.changed, .2), apart = ramp(d, T.your, .14), fall = clamp((d - T.your - .1) / .5);
    const hole = ramp(d, T.your + .05, .25);
    logInsert(g, t, c8, { rows: FINAL, big: 1, bigTick: { crack: apart > 0 ? 0 : crack, gone: apart > 0 ? 1 : 0 }, hole, wifi: 0, onTick: stuck(99) }, {
      eyes: { expr: d > T.mind ? 'worried' : 'open', lx: 0, ly: d > T.mind ? .8 : .3 },
      after: (g2, sx, sy, s) => {
        const bx = W / 2, by = sy + 442 * s * .47, r = 256 * s * .36;
        if (hole > .6) { const u = (d - T.your - .2) / 1.2; if (u > 0 && u < 1) moth(g2, bx + Math.sin(u * 7) * 60 + u * 120, by + 20 - u * 520, 1.2, d, { rot: Math.sin(u * 5) * .3, trail: [.5, -1] }); }
        if (apart <= 0) return;
        for (const side of [-1, 1]) {
          const dy = fall * fall * 900; if (by + dy > 1260) continue;
          g2.save(); g2.globalAlpha *= 1 - clamp((by + dy - 1060) / 180); g2.translate(bx + side * (apart * 60 + fall * 120), by + dy); g2.rotate(side * (apart * .2 + fall * 1.4)); g2.translate(-bx, -by);
          crackedTick(g2, bx, by, r, 1, 0, side, stuck(99));
          g2.restore();
        }
      } });
  }, { id: 'c2-crack' });

  // ---- 10. mind? (Mabel keeps using her phone, but now she keeps her own record too: she glances at
  //         its struck-through fan, jots her sets in her own notebook, and holds the notebook up
  //         beside the phone's log, the one record against the other)
  gshot(c9, end, (g, t) => {
    const d = now();
    g.save(); gymSet(g, cam([[c9, fc(1186, 1.3)], [end, fc(1180, 1.38)]], t), t);
    barbell(g, MX + 40, F - 120, .92, { r: .92 });
    footShadow(g, PX, F, 220); footShadow(g, MX, F, 330);
    const out = ease(d, c9, .2), pen = ease(d, c9 + .08, .2);
    const jot = [94.2, 94.48, 94.76, 95.05].map(x => x - .08), show = ease(d, 95.25, .3);
    const n = jot.filter(x => d >= x).length, last = n ? clamp((d - jot[n - 1]) / .22) : 0;
    const writing = d > jot[0] - .1 && d < jot[3] + .25, lick = d > 93.82 && d < 94.1;
    const glance = writing && (Math.floor((d - jot[0]) / .28) % 2 === 0);
    // her phone, still her app: its screen cracked where "Saved!" fell away, its log showing the empty row
    const ph = mabelPhone(g, PX, F, PS, { rows: FINAL, wifi: 0 }, { eyes: { expr: 'worried', lx: .9, ly: show > .5 ? .2 : -.2 } });
    const [qx, qy, qw, qh] = ph.screen, ox = qx + qw * .56, oy = qy + qh * .3;
    for (const [a, L] of [[-2.6, 70], [-1.4, 58], [-.4, 80], [.5, 64], [1.4, 90], [2.4, 60]]) {
      const P = [[ox, oy]]; let x = ox, y = oy;
      for (let k = 1; k <= 3; k++) { x += Math.cos(a + (k % 2 ? .25 : -.2)) * L / 3; y += Math.sin(a + (k % 2 ? .25 : -.2)) * L / 3; P.push([x, y]); }
      stroke(g, P, { w: 2.4, seed: 8100 + a, raw: true, color: '#3a2c2c' });
      g.save(); g.globalAlpha = .6; stroke(g, P.map(([u, v]) => [u + 1.5, v + 1.5]), { w: 1.1, seed: 8110 + a, raw: true, color: '#ffffff' }); g.restore();
    }
    const nbTo = [lerp(-.2, lerp(-.15, .58, show), out), lerp(.85, lerp(.05, .3, show), out)];
    const scribble = writing ? Math.sin(d * 40) * .05 : 0;
    const penTo = lick ? [-.2, -.62] : writing ? [-.5 + scribble, -.12 + n * .06] : show > 0 ? [.12, .45] : [lerp(.1, -.2, pen), lerp(-1.1, -.4, pen)];
    let page = null;
    mabel(g, MX, F, MS, { t: d, dance: .3,
      L: { to: nbTo, pose: 'grip' }, R: { to: penTo, pose: show > .5 ? 'fist' : 'grip' },
      hold: {
        L: (g2, x, y, a, s) => {
          if (out <= .05) return;
          const ns = lerp(.62, .92, show) * out, nx = x + 46 - 20 * show, ny = y - 30 - 30 * show;
          notebook(g2, nx, ny, ns, n, last, { rot: lerp(-.12, 0, show) });
          glove(g2, x, y, a, 28 * s, 'grip', { flip: true, seed: 613 });
          page = [nx, ny - 190 * ns * .5 + (n + .3) * 190 * ns / 7];
        },
        R: (g2, x, y, a, s) => {
          if (pen <= .05 || show >= .5) return;
          const target = lick ? [MX, F - 376] : page || [x - 100, y];
          pencil(g2, x + 6, y - 4, Math.atan2(target[1] - y, target[0] - x), s * .9);
        },
      },
      eyes: { expr: 'open', lx: show > .5 ? 0 : glance ? -1 : -.4, ly: show > .5 ? 0 : glance ? -.1 : .6 }, smile: show > .5 ? 1.25 : 1, sing: lick ? .5 : 0, lean: show > .5 ? Math.sin(Math.max(0, d - 95.5) * 7) * .03 : undefined });
    g.restore();
  }, { id: 'c2-notebook' });
}

// ---------------------------------------------------------------- the snapshots
// What did you try? The plug pulled out and lying on the floor by its socket, beside a barbell.
function photoTry(g, x0, y0, w, h) {
  g.fillStyle = C('#9a5a40'); g.fillRect(x0, y0, w, h);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) { g.fillStyle = C(((r + c) % 3) ? '#a8644a' : '#8e4e36'); g.fillRect(x0 + c * 46 + (r % 2) * 23 - 10, y0 + r * 22, 42, 18); }
  g.fillStyle = C('#6a4a30'); g.fillRect(x0, y0 + h * .68, w, h * .32);
  socket(g, x0 + w * .26, y0 + h * .4, .78);
  plug(g, [x0 - 20, y0 + h * .12], [x0 + w * .2, y0 + h * .84], .1, .8, { sag: 10 });
  barbell(g, x0 + w * .64, y0 + h * .84, .2, { r: 1.25 });
}
// What did you find? Her log, with a dashed empty row where a set was saved.
function photoFind(g, x0, y0, w, h) {
  g.fillStyle = C('#fdf5f0'); g.fillRect(x0, y0, w, h);
  appHeader(g, x0, y0, w, 34 / 64, { wifi: 0 });
  const rw = w - 30, rh = 40;
  [{}, { ghost: true }, {}].forEach((r, i) => {
    const y = y0 + 54 + i * 62;
    if (r.ghost) { ghostRow(g, x0 + 15, y, rw, rh, .8); g.save(); g.strokeStyle = C(ROSE); g.lineWidth = 5; g.beginPath(); g.ellipse(x0 + w / 2, y + rh / 2, rw * .62, rh * 1.0, -.04, 0, TAU); g.stroke(); g.restore(); return; }
    shape(g, rrect(x0 + 15, y, rw, rh, 10), { fill: WHITE, form: false, w: 3, seed: 7760 + i });
    barbellIcon(g, x0 + 15 + rw * .3, y + rh / 2, rw * .36, '#3a2c2c');
    tick(g, x0 + 15 + rw * .8, y + rh / 2, 13, { seed: 7765 + i });
  });
}
