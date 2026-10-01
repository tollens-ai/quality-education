// The breakdown: the definitions, on the bare stage in one spotlight, drained to sepia, the dark stalls
// filling the bottom of the frame. Two voices, Clawd for the check lines and Guess for the test lines,
// each singing in the light. One idea a line, framed big: a medium shot for who's doing it, a close-up
// for the thing they do. A check's flag, and the testers' "?!" sticker, are the only colour on stage.
//  "A check applies a rule we've set;" — the spotlight strikes on a lone wind-up check, and Clawd steps
//     in to present it. Close: your hand comes in from the side with a stencil, a card with a star cut
//     out of it, and slots it into the check's front. The rule.
//  "It tells us if that rule is met." — Clawd shows us a star block. Close: it slides into the star,
//     snug, and through; up goes the green flag.
//  "To test, we ask what else—and why;" — Guess steps into the light and holds up a small ball. Close:
//     it isn't a star, but it slips through the star too, and the flag goes up green all the same.
//     Guess scratches his head: "?".
//  "Each clue can change what next we try." — "!": he reaches past the big blocks for a tiny pebble.
//     Close: that slips through too. Green again.
//  "A check reports, "The sums agree!"" — Mabel's gym app on its pink phone beside the check copied
//     from its code: 2+2=5 on the app's screen, 5 on the slip the check prints, its green flag up. The
//     quote is its bubble.
//  "We test: "Could both be wrong? Let's see!"" — Guess, between them, points at both fives and holds
//     up four fingers. In the band's stop, close: he lifts the check's lid on the two beetles inside,
//     caught, and slaps the crew's "?!" sticker over the check's still-green flag.
//  "The checks are part of how we test;" — a check marches into the crew's doctor's bag, among the
//     glass, a playbook and a browser window, and the bag snaps shut.
//  "We judge what serves the users best." — the spotlight swings to the app's users, gym members with
//     the pink app on their phones (Mabel, Pat, Sam and the goose), who step into it and smile; the
//     colour comes back, spreading out from them.
import { W, H, TAU, clamp, lerp, now, wordsOf, hash, noise, easeOut, easeIn, easeInOut, backOut, mono, setMono } from '../kit.js';
import { CREAM, GOLD, GREEN, WHITE, C } from '../palette.js';
import { shot } from '../shots.js';
import { BUBBLE, LEAD } from '../lyrics.js';
import { BS, bareStage, spotBeam, stalls } from '../places-stage.js';
import { clawd } from '../clawd.js';
import { guess, check } from '../crew.js';
import { mabel, critter } from '../people.js';
import { phone, bug, magnifier } from '../cast.js';
import { code, digits } from '../props.js';
import { viewerHand, stencil, holeOf, block, shapeCrate, reportSlip, openCheck, doctorBag, browserWin, playbook, memberPhone } from '../props-c3.js';
import { gymPhone, sumScreen, sticker } from '../gymapp.js';
import { groove, qmark, pops } from '../rig.js';
import { look, cam, floorCam, ramp, pop, ease, kick, sparkle, footShadow, burst } from '../common.js';
import { shape } from '../ink.js';

const F = BS.floor, Y = 1730;                      // the floor line, and where the cast stand in the pool
const fc = (x, z) => floorCam(x, z, F);
const scr = (c, x, y) => [W / 2 + (x - c.x) * c.z, H / 2 + (y - c.y) * c.z];
const STAR = '#efc25a', BALL = '#f0d8a0', PEBBLE = '#b4ada0';
// Close-ups fill the frame: icam puts world (x, y) at (540, 690), in the frame's upper middle, and the
// place carries on below it, under the lyric (the stalls softened, nearer the lens).
const icam = (x, y, z) => ({ x, y: y - (690 - H / 2) / z, z });
function insert(a, b, id, draw) { shot(a, b, (g, t) => draw(g, t, now()), { id }); }

// ---------------------------------------------------------------- where hands go
// The shoulders as clawd.js and crew.js place them (unleaned), to aim a glove at a point.
function clawdReach(x, y, s, tq, o, side, target, pose = 'open', ang) {
  const gr = groove(tq, o.dance ?? .6, o.phase ?? 0), sq = o.squash ?? gr.sq;
  const bw = 300 * s * (1 + sq), bh = 214 * s * (1 - sq * .9), cy = y - 54 * s - bh / 2 - (o.jump ?? 0) * 60 * s + gr.bob * .5 * s;
  const dir = side === 'L' ? -1 : 1, sh = [x + dir * bw * .52, cy + bh * .08];
  return { to: [(target[0] - sh[0]) / (dir * bw), (target[1] - sh[1]) / bw], pose, ang };
}
function guessGeo(x, y, s, tq, o = {}) {
  const gr = groove(tq, o.dance ?? .6, (o.phase ?? 0) + .25);
  const bw = 156 * s * (1 + gr.sq), bh = 300 * s * (1 - gr.sq * .8), cy = y - 86 * s - bh / 2 + gr.bob * .6 * s - (o.jump ?? 0) * 60 * s;
  return { bw, bh, cy, top: cy - bh * .52, face: [x, cy - bh * .31], sh: { L: [x - bw * .47, cy + bh * .06], R: [x + bw * .47, cy + bh * .06] }, u: 100 * s };
}
function guessReach(x, y, s, tq, o, side, target, pose = 'open', ang) {
  const G = guessGeo(x, y, s, tq, o), dir = side === 'L' ? -1 : 1, sh = G.sh[side];
  return { to: [(target[0] - sh[0]) / (dir * G.u), (target[1] - sh[1]) / G.u], pose, ang };
}
// A check's body and card, as crew.js draws it.
function checkGeo(x, y, s, o = {}) {
  const sq = o.squash ?? 0, bw = 92 * s * (1 + sq * .5), bh = 118 * s * (1 - sq * .4), cy = y - 30 * s - bh / 2 - (o.hop ?? 0) * 40 * s;
  const cw = 78 * s, ch = 56 * s;
  return { bw, bh, cy, top: cy - bh / 2, card: [x, cy + ch / 2, cw, ch], eyes: [x, cy - bh * .25], flag: [x - bw / 2 - 6 * s, cy - 93 * s] };
}
// The card holder's corner clips, over the card.
function clips(g, card, s) {
  const [x, y, w, h] = card;
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const cx = x + dx * w / 2, cy = y + dy * h / 2, k = 16 * s;
    shape(g, [[cx, cy], [cx - dx * k, cy], [cx, cy - dy * k]], { fill: '#7d9492', form: false, w: 3 * s, seed: 9900 + dx * 3 + dy });
  }
}
// The empty holder before the rule goes in: a dark recess in the tin.
const emptySlot = (g, x, y, w, h, s) => {
  g.fillStyle = C('#4a5856'); g.fillRect(x - w / 2, y - h / 2, w, h);
  const gr = g.createLinearGradient(0, y - h / 2, 0, y - h / 2 + 18 * s); gr.addColorStop(0, 'rgba(10,8,6,.55)'); gr.addColorStop(1, 'rgba(10,8,6,0)');
  g.fillStyle = gr; g.fillRect(x - w / 2, y - h / 2, w, 18 * s);
};
// Something going through the star: snug in the hole at p = 0, then dropping away inside the tin.
const through = (kind, R, col, p) => (g, hx, hy) => { if (p < 1) block(g, kind, hx, hy + (kind === 'star' ? 0 : R * .2) + easeIn(p, 2) * R * 4.5, R * (1 - p * .2), { col, seed: 9950, depth: .1 }); };

export function register(S, { MONO }) {
  MONO.push([129.0, 147.3, .5]);
  const L1 = 'A check applies', L2 = 'It tells us if', L3 = 'To test, we ask', L4 = 'Each clue can', L5 = 'A check reports', L6 = 'We test: "Could', L7 = 'The checks are part', L8 = 'We judge what';
  const T = (line, i) => wordsOf(line)[i].s - LEAD;
  const [tA, tCheck, tApplies, , tRule, tWeve, tSet] = [0, 1, 2, 3, 4, 5, 6].map(i => T(L1, i));
  const [tIt, tTells, , tIf, , , tIs, tMet] = [0, 1, 2, 3, 4, 5, 6, 7].map(i => T(L2, i));
  const [tTo, tTest, tWe, tAsk, tWhat, tElse, tAnd, tWhy] = [0, 1, 2, 3, 4, 5, 6, 7].map(i => T(L3, i));
  const [tEach, tClue, tCan, tChange, , tNext, tWe2, tTry] = [0, 1, 2, 3, 4, 5, 6, 7].map(i => T(L4, i));
  const [tA5, , tReports, tThe5, , tAgree] = [0, 1, 2, 3, 4, 5].map(i => T(L5, i));
  const [tWe6, , tCould, , tBe, , tLets, tSee] = [0, 1, 2, 3, 4, 5, 6, 7].map(i => T(L6, i));
  const [, tChecks7, , tPart7, , , , tTest7] = [0, 1, 2, 3, 4, 5, 6, 7].map(i => T(L7, i));
  const [tWe8, tJudge, , tServes, tThe8, tUsers, tBest] = [0, 1, 2, 3, 4, 5, 6].map(i => T(L8, i));
  const t0 = 128.9, tEnd = 147.34;
  const L1b = 130.2, L2a = tIt - .05, L2b = 132.5, L3a = tTo - .05, L3b = 134.58, L3c = 135.2, L4a = tEach - .05, L4b = 137.3, L5a = tA5 - .05, L6a = tWe6 - .05, L6b = tLets - .06, L7a = 142.6, L8a = tWe8 - .05;

  // The rule's check, centre stage, and its card.
  const KX = 1000, KS = 2.3, KC = checkGeo(KX, Y, KS).card, HOLE = holeOf(KC[0], KC[1], KC[2], KC[3]);
  const ruleCard = (o = {}) => (g, x, y, w, h, s) => stencil(g, x, y, w, h, s, o);
  const SP = { x: 940, y: Y, rx: 300, ry: 62, k: 1 };

  // ---------------------------------------------------------------- lines 1 and 2: Clawd and the rule
  const CX = 688, CS = .95;
  const ruleScene = (g, t, tq, c, sp, close = false) => {
    bareStage(g, c, sp);
    g.save(); look(g, c);
    footShadow(g, KX, Y, 230, .4);
    const seated = tq >= tSet, line2 = tq >= L2a;
    // Clawd steps into the light (line 1), or shows his star block and pushes it home (line 2)
    const cx = line2 ? CX : lerp(560, CX, easeInOut(ramp(tq, tA + .15, .5))), walking = !line2 && tq > tA + .15 && tq < tA + .65;
    footShadow(g, cx, Y, 300, .35 * ramp(cx, 600, 700));
    // the star block: produced, held high, carried to the star, slid in snug and through
    const hi = [CX + 178, Y - 205], at0 = [HOLE.x - 120, HOLE.y + 10];
    const carry = easeInOut(ramp(tq, tIf - .02, 132.78 - tIf)), slide = easeInOut(ramp(tq, 132.78, tIs + .02 - 132.78)), drop = ramp(tq, tMet - .02, .22);
    const bx = lerp(lerp(hi[0], at0[0], carry), HOLE.x, slide), by = lerp(lerp(hi[1], at0[1], carry), HOLE.y, slide) - Math.sin(carry * Math.PI) * 50;
    const inHole = tq >= tIs + .02, flag = line2 && tq >= tMet ? pop(tq, tMet, .3) : 'down';
    const jolt = line2 ? kick(tq, tIs + .05, .14) : kick(tq, tSet, .14), hop = kick(tq, 129.36, .22) * .35;
    check(g, KX, Y, KS, { t: tq, flag, flagCol: GREEN, wave: tq > tMet + .3, hop, squash: jolt * .2,
      look: line2 ? (tq < tIf ? -.6 : tq < tMet ? -.2 : 0) : tq < tApplies ? -.7 : .5,
      card: seated ? ruleCard({ inside: inHole && drop < 1 ? through('star', HOLE.R * .97, STAR, drop) : null }) : emptySlot });
    clips(g, checkGeo(KX, Y, KS, { hop, squash: jolt * .2 }).card, KS);
    const o = { t: tq, dance: walking ? .2 : line2 && tq > tIf ? .25 : .5, walk: walking ? tq * 2.4 : null, lean: line2 && tq > tIf ? 0 : undefined };
    const shown = line2 && tq >= tIt + .02, holding = shown && !inHole;
    let R = 'hang', L = 'hang';
    if (!line2) { const present = tq > tCheck - .05 && tq < tRule; R = present ? { to: [.38, -.42], pose: 'open' } : tq >= tRule ? 'hips' : 'hang'; L = present ? 'hips' : 'hang'; }
    else { L = 'hips'; R = holding ? clawdReach(CX, Y, CS, tq, o, 'R', [bx - HOLE.R * .7, by + HOLE.R * .55], 'grip') : inHole && tq < tMet + .5 ? { to: [.5, -.28], pose: 'open' } : 'hips'; }
    clawd(g, cx, Y, CS, { ...o, L, R,
      eyes: line2 ? { expr: tq > tMet + .05 ? 'happy' : 'open', lx: tq < tIf ? -.1 : .75, ly: tq < tIf ? -.3 : .2, cock: tq > tTells - .1 && tq < tIf ? .6 : 0 }
                  : { expr: tq > tSet + .05 && tq < tSet + .6 ? 'happy' : 'open', lx: tq < tCheck ? .6 : tq < tApplies + .2 ? .2 : .8, ly: tq > tApplies + .2 && tq < tSet ? .2 : 0 },
      sing: true, squash: line2 ? 0 : kick(tq, tSet + .02, .2) * .12 });
    if (holding) block(g, 'star', bx, by, HOLE.R * .97, { col: STAR, seed: 9210, depth: .32 });
    if (holding && tq < tTells + .3) sparkle(g, hi[0], hi[1], 90, tq, 4, GOLD, 211);
    // your hand, from the right, with the rule: held up by the holder, then pushed home
    if (!line2 && tq > L1b - .1 && tq < tSet + .5) {
      const come = easeOut(ramp(tq, L1b - .1, tRule - L1b + .1), 3), push = easeInOut(ramp(tq, tWeve, tSet - tWeve)), away = easeIn(ramp(tq, tSet + .04, .35), 2);
      const ccx = lerp(1460, KC[0], come), ccy = KC[1] - 34 * (1 - push) + (1 - come) * 24, sc = lerp(1.1, 1, push);
      const px = ccx + KC[2] / 2 * sc + away * 420, py = ccy + 6 + away * 30, let_go = ramp(tq, tSet, .12);
      viewerHand(g, px, py, Math.PI + .05, .8, { part: 'back' });
      if (!seated) { g.save(); g.translate(ccx, ccy); g.scale(sc, sc); g.translate(-ccx, -ccy); stencil(g, ccx, ccy, KC[2], KC[3], KS, { see: true }); g.restore(); }
      viewerHand(g, px, py, Math.PI + .05, .8, { part: 'thumb', open: let_go });
    }
    if (!line2 && tq > tSet - .02 && tq < tSet + .3) pops(g, KC[0], KC[1], 120, 8, { a0: -Math.PI, span: TAU * .88, w: 6 });
    if (line2 && tq > tIs && tq < tIs + .3) pops(g, HOLE.x, HOLE.y, 100, 7, { a0: -Math.PI, span: TAU * .88, w: 6 });
    if (line2 && tq > tMet) { const k = checkGeo(KX, Y, KS); sparkle(g, KX - 150, k.top - 170, 120, tq, 5, GOLD, 213); burst(g, KX - 150, k.top - 170, 120, (tq - tMet) / .45, 10, '!' + GREEN, 214); }
    g.restore();
    spotBeam(g, c, sp, t);
    stalls(g, c, sp, t, { blur: close ? 3 : 0 });
  };
  // 1a. the light strikes on a lone check; Clawd steps in to present it
  shot(t0, L1b, (g, t) => {
    const c = cam([[t0, fc(930, .94)], [tCheck, fc(895, 1.26)], [L1b, fc(835, 1.6)]], t);
    const strike = t < tA ? 0 : t < tA + .12 ? (Math.floor((t - tA) * 40) % 2 ? .5 : 1) : 1;
    ruleScene(g, t, now(), c, { ...SP, k: strike });
  }, { id: 'bd-rule' });
  // 1b. close: your hand slots the rule in
  insert(L1b, L2a, 'bd-rule-in', (g, t, tq) => ruleScene(g, t, tq, cam([[L1b, icam(1010, 1540, 2.1)], [L2a, icam(1004, 1550, 2.2)]], t), SP, true));
  // 2a. Clawd shows us a star block
  shot(L2a, L2b, (g, t) => ruleScene(g, t, now(), cam([[L2a, fc(835, 1.6)], [L2b, fc(840, 1.64)]], t), SP), { id: 'bd-star' });
  // 2b. close: it slides into the star, and through; up goes the green flag
  insert(L2b, L3a, 'bd-met', (g, t, tq) => ruleScene(g, t, tq, cam([[L2b, icam(960, 1470, 1.8)], [L3a, icam(950, 1450, 1.86)]], t), SP, true));

  // ---------------------------------------------------------------- lines 3 and 4: Guess tries what else
  const GX = 1250, GS = .88, GY = Y - 30, CRX = 1185;
  const triesScene = (g, t, tq, c, sp, close = false) => {
    bareStage(g, c, sp);
    g.save(); look(g, c);
    footShadow(g, KX, Y, 230, .4);
    const line4 = tq >= L4a;
    // the flag: lowered as each try begins, green each time something goes through
    let flag = 1 - ramp(tq, line4 ? L4a + .05 : L3a + .05, .25), passP = 0;
    if (!line4 && tq >= tElse + .08) { flag = pop(tq, tElse + .08, .3); }
    if (line4 && tq >= tTry + .06) { flag = pop(tq, tTry + .06, .3); }
    const ballIn = !line4 && tq >= tElse - .02, pebIn = line4 && tq >= tTry - .02;
    passP = ballIn ? ramp(tq, tElse, .3) : pebIn ? ramp(tq, tTry, .3) : 0;
    const inside = ballIn ? through('circle', 19, BALL, passP) : pebIn ? through('pebble', 12, PEBBLE, passP) : null;
    const jolt = kick(tq, line4 ? tTry : tElse, .12);
    check(g, KX, Y, KS, { t: tq, flag, flagCol: GREEN, wave: flag > .9, squash: jolt * .15, look: .5, card: ruleCard({ inside }) });
    clips(g, checkGeo(KX, Y, KS, { squash: jolt * .15 }).card, KS);
    // Guess walks in behind his crate of shapes
    const gx = line4 ? GX : lerp(1440, GX, easeOut(ramp(tq, L3a, .36), 2)), walking = !line4 && tq < L3a + .36;
    footShadow(g, gx, GY, 180, .35);
    const o = { t: tq, dance: walking ? .2 : .45, face: -.5, walk: walking ? tq * 2.6 : null };
    const G = guessGeo(gx, GY, GS, tq, o);
    let L = 'hang', R = 'hang', held = null, bang = 0, brow = .7, eyes = { lx: -.7, ly: .1 };
    const crate = [CRX - 20, Y - 120], pebbleAt = [CRX - 108 * .8, Y + 22 - 92 * .8 - 8 * .8];
    if (!line4) {
      // a small ball: out of the crate, held up to look at, then into the star
      const up = easeOut(ramp(tq, tTest + .02, .3), 2), go = easeInOut(ramp(tq, tWhat - .05, tElse - tWhat + .03));
      const show = [G.face[0] - 120, G.face[1] + 30];
      if (tq > tTest && tq < tElse) {
        const p = [lerp(lerp(crate[0], show[0], up), HOLE.x, go), lerp(lerp(crate[1], show[1], up), HOLE.y + 4, go) - Math.sin(go * Math.PI) * 50];
        held = ['circle', p, 19, BALL];
      }
      if (tq > tTest - .1 && tq < tElse + .05) L = guessReach(gx, GY, GS, tq, o, 'L', held ? [held[1][0] + 22, held[1][1] + 18] : crate, 'grip');
      if (tq > tWhy - .2) R = guessReach(gx, GY, GS, tq, o, 'R', [gx + G.bw * .35 + Math.sin(tq * 30) * 6, G.top + 40], 'open', -2.2);
      eyes = tq > tWhy - .2 ? { lx: .1, ly: 0, mood: 1 } : tq > tElse ? { lx: -.8, ly: -.4 } : tq > tAsk - .05 ? { lx: -.6, ly: .1 } : { lx: -.4, ly: .3 };
      brow = tq > tWe - .1 ? 1 : .7;
    } else {
      bang = backOut(ramp(tq, tClue, .22), 2.6);
      if (tq > tCan - .05 && tq < tTry + .02) {
        const dig = ramp(tq, tCan - .05, .25), up = easeOut(ramp(tq, tChange + .2, .3), 2), go = easeInOut(ramp(tq, tWe2 - .05, tTry - tWe2 + .03));
        const by = [G.face[0] - 70, G.face[1] + 6];
        let p = [lerp(gx - 60, pebbleAt[0], dig), lerp(Y - 300, pebbleAt[1], dig) + Math.sin(tq * 40) * 4 * (1 - up)];
        p = [lerp(lerp(p[0], by[0], up), HOLE.x, go), lerp(lerp(p[1], by[1], up), HOLE.y + 2, go) - Math.sin(go * Math.PI) * 40];
        held = up > .05 ? ['pebble', p, 12, PEBBLE] : null;
        L = guessReach(gx, GY, GS, tq, o, 'L', [p[0] + 14, p[1] + 14], 'grip');
      }
      eyes = tq > tNext - .1 && tq < tWe2 ? { lx: -.9, ly: .3 } : tq > tTry + .1 ? { lx: 0, ly: 0, expr: 'smug' } : { lx: -.8, ly: .2 };
      brow = tq > tNext - .1 && tq < tWe2 + .1 ? 1 : .7;
    }
    guess(g, gx, GY, GS, { ...o, L, R, bang, brow, eyes, sing: true });
    shapeCrate(g, CRX, Y + 22, .8, { jostle: line4 && tq > tCan && tq < tChange + .3 ? 1 : 0, out: line4 && tq > tChange + .2 ? ['pebble'] : [] });
    if (held) { block(g, held[0], held[1][0], held[1][1], held[2], { col: held[3], seed: 9230 }); if ((line4 && tq > tNext - .1 && tq < tWe2) || (!line4 && tq > tAsk - .1 && tq < tWhat)) sparkle(g, held[1][0], held[1][1], 46, tq, 3, WHITE, 231); }
    if (tq > (line4 ? tTry : tElse) + .05 && tq < (line4 ? tTry : tElse) + .35) pops(g, HOLE.x, HOLE.y, 100, 7, { a0: -Math.PI, span: TAU * .88, w: 6 });
    // the head-scratch's question mark (it lingers into line 4 until the antenna's "!" takes over)
    const qk = !line4 ? (tq > tWhy - .1 ? backOut(ramp(tq, tWhy - .1, .25), 2.4) : 0) : 1 - ramp(tq, tClue - .05, .12);
    if (qk > .02) { g.save(); g.translate(gx + G.bw * .62, G.top - 96); g.scale(qk, qk); qmark(g, 0, 0, 110, CREAM, { seed: 251 }); g.restore(); }
    if (line4 && tq > tClue && tq < tClue + .4) pops(g, gx + 4, G.top - 130 * GS, 60, 7, { a0: -Math.PI, span: Math.PI, w: 5 });
    if (flag > .5 && tq > (line4 ? tTry : tElse)) { const k = checkGeo(KX, Y, KS); sparkle(g, KX - 150, k.top - 170, 120, tq, 5, GOLD, 241); }
    g.restore();
    spotBeam(g, c, sp, t);
    stalls(g, c, sp, t, { blur: close ? 3 : 0 });
  };
  const SP3 = { x: 1090, y: Y, rx: 310, ry: 64, k: 1 };
  // 3a. Guess steps in and holds up a small ball
  shot(L3a, L3b, (g, t) => triesScene(g, t, now(), cam([[L3a, fc(1110, 1.68)], [L3b, fc(1116, 1.76)]], t), SP3), { id: 'bd-ball' });
  // 3b. close: it slips through the star, and the flag goes up green
  insert(L3b, L3c, 'bd-else', (g, t, tq) => triesScene(g, t, tq, cam([[L3b, icam(990, 1470, 1.8)], [L3c, icam(985, 1460, 1.86)]], t), SP3, true));
  // 3c. Guess scratches his head: why?
  shot(L3c, L4a, (g, t) => triesScene(g, t, now(), cam([[L3c, fc(1085, 1.58)], [L4a, fc(1090, 1.62)]], t), SP3), { id: 'bd-why' });
  // 4a. "!": he reaches past the big blocks for a tiny pebble
  shot(L4a, L4b, (g, t) => triesScene(g, t, now(), cam([[L4a, fc(1095, 1.64)], [tNext, fc(1110, 1.74)], [L4b, fc(1110, 1.78)]], t), SP3), { id: 'bd-clue' });
  // 4b. close: that slips through too
  insert(L4b, L5a, 'bd-try', (g, t, tq) => triesScene(g, t, tq, cam([[L4b, icam(990, 1470, 1.8)], [L5a, icam(985, 1460, 1.86)]], t), SP3, true));

  // ---------------------------------------------------------------- lines 5 and 6: the sums agree
  const PX = 790, PS = .62, QX = 1225, QS = 2.0, G6 = 1000, G6S = .84, G6Y = Y - 34;
  const appSum = (tq, o = {}) => sumScreen(tq, { sum: '2+2', ans: '5', look: o.look });
  const copiedCard = tq => (g, x, y, w, h, s) => code(g, x - w * .42, y - h * .36, w * .84, { t: tq, bugScale: .9 });
  const QG = checkGeo(QX, Y, QS);
  const sumsScene = (g, t, tq, c, sp, close = false) => {
    bareStage(g, c, sp);
    g.save(); look(g, c);
    const line6 = tq >= L6a, stop = tq > 141.1 && tq < 142.53, dance = stop ? 0 : .4;
    footShadow(g, PX, Y, 200, .4); footShadow(g, QX, Y, 200, .4);
    const agree = tq > tAgree, lid = line6 ? easeOut(ramp(tq, L6b + .02, .2), 2) : 0, caught = lid > .5;
    gymPhone(g, PX, Y, PS, appSum(tq, { look: caught ? .7 : -.6 }), { t: tq, dance, eyes: { expr: caught ? 'worried' : agree && !line6 ? 'happy' : 'open', lx: !line6 ? (tq > tThe5 ? .8 : .2) : .8, ly: -.1 } });
    const flag = !line6 ? (agree ? pop(tq, tAgree, .3) : 'down') : 1;
    check(g, QX, Y, QS, { t: tq, dance, flag, flagCol: GREEN, wave: !stop && tq > tAgree + .3, look: caught ? -.2 : tq > tThe5 ? -.8 : 0, squash: line6 ? 0 : kick(tq, tAgree, .14) * .16, card: copiedCard(tq), key: stop ? 0 : tq < tReports ? 5 : 2.2 });
    if (lid <= 0) reportSlip(g, QX + 8, QG.top - 12 * QS, QS * .56, line6 ? 1 : ramp(tq, tReports - .1, .5));
    if (!line6 && agree) { sparkle(g, QX - 140, QG.top - 150, 110, tq, 5, GOLD, 251); burst(g, QX - 140, QG.top - 150, 120, (tq - tAgree) / .45, 10, '!' + GREEN, 252); }
    if (line6) {
      // Guess, between them: points at both fives, four fingers, then the lid
      footShadow(g, G6, G6Y, 170, .35);
      const o = { t: tq, dance };
      const both = tq > tCould - .05 && tq < tBe - .05, four = tq >= tBe - .05 && tq < L6b + .3;
      const lidAt = [lerp(QX + 10, QX + 120, lid), lerp(QG.top - 4, QG.top - 250, lid)];
      const slap = ramp(tq, tSee - .08, .12), fl = QG.flag;
      const L = both ? guessReach(G6, G6Y, G6S, tq, o, 'L', [PX + 80, 1548], 'point', Math.PI + .1) : four && tq < tSee - .22 ? guessReach(G6, G6Y, G6S, tq, o, 'L', [PX + 150, 1490], 'four', -Math.PI / 2)
        : tq >= tSee - .22 && tq < tSee + .4 ? guessReach(G6, G6Y, G6S, tq, o, 'L', [lerp(fl[0] - 40, fl[0] - 6, slap), lerp(fl[1] - 70, fl[1] + 4, slap)], 'flat', .2) : 'hang';
      const R = both ? guessReach(G6, G6Y, G6S, tq, o, 'R', [QX - 110, QG.top - 120], 'point', -.4) : tq > tLets - .05 ? guessReach(G6, G6Y, G6S, tq, o, 'R', [lidAt[0] - 24, lidAt[1] + 4], 'grip') : 'hips';
      guess(g, G6, G6Y, G6S, { ...o, L, R, sing: true, brow: four ? 1 : .7, eyes: { lx: caught ? 1 : four ? -.3 : 0, ly: caught ? .5 : 0, expr: caught && tq > tSee + .1 ? 'smug' : 'open' } });
      openCheck(g, QX, Y, QS, lid, { t: tq, lidAt, lidRot: .5 * lid, look: Math.sin(tq * 3), slip: 1, slipS: QS * .56 });
      if (caught && tq < L6b + .45) pops(g, QX, QG.top - 60, 140, 8, { a0: -Math.PI, span: Math.PI, w: 7 });
      // the crew's mark over the check's still-green flag: the check said yes; testing says look!
      if (slap > 0) sticker(g, fl[0] + 14, fl[1] + 4, 44, { p: slap, ang: -.25, since: tq - (tSee + .04) });
    }
    g.restore();
    spotBeam(g, c, sp, t);
    stalls(g, c, sp, t, { blur: close ? 3 : 0 });
  };
  const SP5 = { x: 1000, y: Y, rx: 340, ry: 68, k: 1 };
  const c5 = fc(1000, 1.68);
  BUBBLE['A check reports, "'] = { from: 3, to: 5, tail: scr(c5, QX - 4, QG.eyes[1] + 10) };
  // 5. the phone's 5, the check's 5, green: "The sums agree!"
  shot(L5a, L6a, (g, t) => sumsScene(g, t, now(), cam([[L5a, fc(1000, 1.62)], [tAgree, c5], [L6a, fc(1000, 1.7)]], t), SP5), { id: 'bd-sums' });
  // 6a. Guess: could both be wrong? four fingers by the fives
  const c6 = fc(1000, 1.68), g6 = guessGeo(G6, G6Y, G6S, 140.6, { dance: .4 });
  const [f6x, f6y] = scr(c6, G6, g6.face[1]);
  BUBBLE['We test: "Could bo'] = { from: 0, to: 7, tail: [f6x - 60, f6y + 50] };   // Guess sings the whole line
  shot(L6a, L6b, (g, t) => sumsScene(g, t, now(), cam([[L6a, fc(1000, 1.64)], [tCould, c6], [L6b, fc(1005, 1.72)]], t), SP5), { id: 'bd-both' });
  // 6b. close, in the band's stop: the lid comes up on the two beetles, caught
  insert(L6b, L7a, 'bd-caught', (g, t, tq) => sumsScene(g, t, tq, cam([[L6b, icam(1130, 1350, 1.6)], [L7a, icam(1140, 1345, 1.72)]], t), SP5, true));

  // ---------------------------------------------------------------- line 7: into the bag
  const BX = 1000, BY = Y + 26, BSC = .95;
  shot(L7a, L8a, (g, t) => {
    const tq = now();
    const c = cam([[L7a, fc(1000, 1.38)], [tPart7, fc(1004, 1.44)], [L8a, fc(1006, 1.48)]], t);
    const sp = { x: 1000, y: Y, rx: 340, ry: 68, k: 1 };
    bareStage(g, c, sp);
    g.save(); look(g, c);
    footShadow(g, BX, BY, 380, .45); footShadow(g, 765, Y - 40, 260, .3); footShadow(g, 1250, Y - 40, 170, .3);
    const snap = tq >= tTest7, open = snap ? Math.max(0, Math.sin(ramp(tq, tTest7, .3) * Math.PI) * .12) : 1;
    const mw = 400 * BSC * .9, my = BY - 210 * BSC;
    clawd(g, 765, Y - 40, .85, { t: tq, L: tq > tChecks7 - .1 && tq < tPart7 + .3 ? { to: [.5, -.3], pose: 'open' } : 'hips', R: tq > tChecks7 - .1 && tq < tPart7 + .3 ? { to: [.45, -.1], pose: 'open' } : 'hips', eyes: { expr: snap ? 'happy' : 'open', lx: tq < tChecks7 + .2 ? -.8 : .6, ly: .4 }, sing: true });
    const go = { t: tq };
    guess(g, 1250, Y - 40, .82, { ...go, face: -.4, L: snap ? guessReach(1250, Y - 40, .82, tq, go, 'L', [BX + 70, my + 2], 'flat', .1) : guessReach(1250, Y - 40, .82, tq, go, 'L', [BX + 150, my - 60], 'open', -.7), R: 'hips', eyes: { lx: tq < tPart7 ? -.8 : -.4, ly: .4, expr: snap ? 'happy' : 'open' }, sing: true });
    // the check marches in from the dark and hops in among the kit
    const march = easeInOut(ramp(tq, L7a + .05, tPart7 - L7a - .1)), hopP = ramp(tq, tPart7 - .02, .36), cs = 1.12;
    const kit = (g, mx, my, mw) => {
      magnifier(g, mx - mw * .3, my + 70, -1.25, .62, { glass: '#d8e6e0' });
      playbook(g, mx - mw * .06, my - 30, 96, 120, .9, { rot: -.12 });
      browserWin(g, mx + mw * .26, my - 26, 130, 100, .9, { rot: .1 });
      if (hopP >= 1) check(g, mx + mw * .08, my + 62, cs, { t: tq, flag: 1, flagCol: GREEN, wave: true, look: .3, card: ruleCard() });
    };
    doctorBag(g, BX, BY, BSC, { open, inside: kit, click: kick(tq, tTest7, .1) });
    if (hopP < 1) {
      const sx = lerp(560, 860, march), hx = lerp(860, BX + mw * .08, hopP), hy = lerp(Y + 10, my + 62, hopP) - Math.sin(hopP * Math.PI) * 170;
      if (hopP <= 0) footShadow(g, sx, Y + 10, 130, .4);
      check(g, hopP > 0 ? hx : sx, hopP > 0 ? hy : Y + 10, cs, { t: tq, march: hopP <= 0, flag: 1, flagCol: GREEN, wave: true, look: hopP > 0 ? .5 : .8, card: ruleCard() });
    }
    if (snap && tq < tTest7 + .3) pops(g, BX, my - 20, 150, 8, { a0: -Math.PI, span: Math.PI, w: 7 });
    g.restore();
    spotBeam(g, c, sp, t);
    stalls(g, c, sp, t);
  }, { id: 'bd-bag' });

  // ---------------------------------------------------------------- line 8: the users
  const users = [['goose', 1335, .58], ['mabel', 1490, .55], ['cat', 1650, .58], ['pup', 1795, .55]];
  const swing = t => easeInOut(ramp(t, tServes - .15, tThe8 - tServes + .1));
  const usersScene = (g, t, tq, c, sp, close = false) => {
    bareStage(g, c, sp);
    g.save(); look(g, c);
    const step = easeOut(ramp(tq, tThe8 - .05, .35), 2), smile = tq > tUsers;
    footShadow(g, 860, Y, 300, .4 * (1 - swing(t))); footShadow(g, 1120, Y, 180, .4 * (1 - swing(t)));
    clawd(g, 860, Y, .9, { t: tq, dance: .4, L: 'hips', R: tq > tJudge - .1 && tq < tServes + .4 ? { to: [.5, -.4], pose: 'open' } : 'hips', eyes: { lx: tq > tWe8 ? .9 : .2, ly: -.1, expr: smile ? 'happy' : 'open' }, sing: true });
    guess(g, 1120, Y, .84, { t: tq, dance: .4, face: .4, L: 'hold', R: tq > tJudge - .1 ? { to: [1.2, -.3], pose: 'point', ang: -.15 } : 'hips',
      hold: { L: (g, x, y, a, s) => doctorBag(g, x, y + 104, .38, { open: 0 }) }, eyes: { lx: .9, ly: -.1, expr: smile ? 'happy' : 'open' }, sing: true });
    for (const [kind, x, s] of users) {
      const y = Y - 40 + step * 40;
      footShadow(g, x, y, kind === 'mabel' ? 220 : 150, .35 * step);
      const eyes = { expr: smile ? 'happy' : 'open', lx: tq < tThe8 ? -.7 : 0, ly: tq < tThe8 ? .1 : 0 };
      const wave = smile && tq > tBest - .1;
      const app = (g, hx, hy, a, ss) => memberPhone(g, hx + 4, hy + 36 * ss / .56, kind === 'mabel' ? .17 : .15, tq, { happy: smile, lean: .06 });
      if (kind === 'mabel') mabel(g, x, y, s, { t: tq, L: wave ? 'wave' : 'hips', R: 'phone', hold: { R: app }, eyes, sing: smile ? .2 : 0 });
      else critter(g, x, y, s, { t: tq, kind, phase: hash(x, 3) * 2, L: wave && kind !== 'pup' ? 'up' : 'hang', R: 'phone', hold: { R: app }, eyes, smile: 1 });
    }
    g.restore();
    spotBeam(g, c, sp, t);
    stalls(g, c, sp, t, { blur: close ? 3 : 0 });
  };
  // 8. the light swings to the users; they step into it, and the colour spreads back from them
  shot(L8a, tEnd, (g, t) => {
    const tq = now(), sw = swing(t);
    const c = cam([[L8a, fc(990, 1.62)], [tServes - .1, fc(1000, 1.62)], [tThe8 + .1, fc(1565, 1.72)], [tEnd, fc(1565, 1.84)]], t);
    const sp = { x: lerp(1000, 1565, sw), y: Y, rx: lerp(320, 400, ramp(t, tThe8 - .1, .4)), ry: lerp(64, 76, sw), k: 1 };
    usersScene(g, t, tq, c, sp);
    const flood = ramp(t, tUsers, tEnd - .08 - tUsers);
    if (flood > 0) {
      const m = mono(), [fx, fy] = scr(c, 1490, 1480), R = easeIn(flood, 1.6) * 1500 + 30;
      g.save(); g.beginPath();
      for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, r = R * (1 + noise(i * .5 + flood * 3, 61) * .14); i ? g.lineTo(fx + Math.cos(a) * r, fy + Math.sin(a) * r) : g.moveTo(fx + Math.cos(a) * r, fy + Math.sin(a) * r); }
      g.closePath(); g.clip();
      setMono(0); usersScene(g, t, tq, c, sp); setMono(m);
      g.restore();
    }
  }, { id: 'bd-users' });
}
