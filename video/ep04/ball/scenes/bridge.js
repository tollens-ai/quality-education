// The bridge, in the crew's office: the practical brief, sung to you. You (the viewer, who briefs the
// crew) are the camera: the crew point at you and present the comma to you, and your own hand reaches
// in from the side to equip the fresh bots and, at the end, to carry the comma.
//  "A fresh bot crew? Here's what to do:"  a crate thuds down and bursts; three little Clawds in
//     propeller beanies spring out on springs; Guess turns and points at you.
//  "Real browsers, a playbook, and users in mind."  three quick cuts: your hand gives bot 1 a browser
//     (a globe in it), bot 2 a coach's playbook, and sets a thought of Mabel, Pat and the goose over
//     bot 3's head.
//  "The goals you name will guide the game;"  a board game on the desk: your finger plants three flags
//     (a padlock, a coin, a barbell) and the bots hop up their lanes toward them.
//  "Your oracles help them to judge what they find."  you hand bot 3 Mabel's own notebook; close, full
//     frame: her four pencilled barbells against the app's log of three, row by row; at the gap,
//     on "judge", the gavel.
//  "One probes the chat—just me and Pat:"  bot 1, a little safecracker hovering on its propeller,
//     listens at the padlock of a chat between itself and Pat; Pat sends a pink heart.
//  "Does Sam's new account show the text Pat just sent?"  Sam unwraps a new phone and Pat's heart is
//     on it; the padlock springs open, Sam's face pops into the chat, the bot's eyes pop: a leak.
//  "One tests the cart, then hits restart:"  in bot 2's browser the goose's shopping hops into the
//     cart and she pays; bot 2 hangs on a big power lever; the page goes black and spins.
//  "Do orders still match what the customer spent?"  the order on one pan, her coins on the other:
//     level; a tick; the goose beams. A pass is a finding too.
//  "We trade the news, compare the views;"  the bots swap picture cards of their finds, then hold
//     their screens up side by side.
//  "We share the doubts and observations."  question marks and eyes rise from the bots and pin
//     themselves to the corkboard, joined by red string.
//  "Some calls need you. We'll talk them through;"  the candlestick telephone rings on the desk;
//     Guess lifts the receiver to his ear and points at you; Clawd skips in with a thumbs-up.
//  "We ask for fresh interpretations."  piano alone: Press presents the fainted comma from verse 1 on
//     a velvet cushion; close, full frame: the app's chat with a comma-shaped hole in Pat's line; the
//     comma wakes, looks up at its empty place, turns to you: "?"; your palm comes in from the side,
//     it hops on, and the iris closes on it.
import { W, H, TAU, clamp, lerp, hash, now, easeOut, easeIn, easeInOut, backOut, beatPos } from '../kit.js';
import { INK, WHITE, GOLD, GOLD_SH, C } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { iris } from '../film.js';
import { office, OFC, deskInsert, DI, deskThing } from '../places-office.js';
import { guess, press, stress } from '../crew.js';
import { clawd } from '../clawd.js';
import { mabel, critter } from '../people.js';
import { phone, comma, magnifier } from '../cast.js';
import { greeting } from '../props-workshop.js';
import { gymPhone, appHeader, appLogo, APP, sticker, HEADER } from '../gymapp.js';
import { logScreen as appLog, mabelPhone, notebook as mabelNotebook, barbellIcon as appBarbell, ROWY } from '../props-gym.js';
import { qmark, bang, sweat, pops, heart } from '../rig.js';
import { at, ramp, pop, ease, kick, shakeAt, place, cam, floorCam, sparkle, speedLines, footShadow, burst } from '../common.js';
import { shape, stroke, ellipse, rrect, spline, dot, line, hose, glove, pathOf } from '../ink.js';
import {
  bot, BOT_COLS, yourHand, pointAtYou, crate, spring, browserWin, globe, playbook, thought, padlock, coin, tick,
  spinner, eyeMark, pin, redString, board, boardPt, PATHS, GOAL_AT, GOAL_ICON, pennant, pawnBase, gavel,
  avatar, chatBubble, stethoscope, gift, bow, cart, till, lever, balance, coins, findCard, candlestick, receiver, ringMarks,
  cushion, yourPalm, kettlebell, dumbbells, skipRope, priceTag,
} from '../props-office.js';

const F = OFC.floor;
const fc = (x, z) => floorCam(x, z, F);
const fi = (x, z) => floorCam(x, z, DI.near);
const APPINK = APP.header;

// Dust turning in the sun's stripes: specks drifting, catching the light.
function motes(g, t, x0 = 780, x1 = 1600, y0 = 340, y1 = 1240) {
  for (let i = 0; i < 54; i++) {
    const x = lerp(x0, x1, hash(i, 1)) + Math.sin(t * .31 + i) * 34 + ((t * 9 + i * 13) % 50), y = lerp(y0, y1, hash(i, 2)) + Math.sin(t * .23 + i * 1.7) * 26 - ((t * 5) % 30);
    const tw = .5 + .5 * Math.sin(t * 2.1 + i * 3.1);
    g.fillStyle = `rgba(255,240,205,${(.22 + .4 * tw).toFixed(3)})`; g.beginPath(); g.arc(x, y, 1.6 + hash(i, 3) * 2.2, 0, TAU); g.fill();
  }
}
function room(g, c, t) { place(g, office(), c); motes(g, t); }

// The 'to' that puts Clawd's hand at (tx, ty) (with dance 0, so the body holds still).
function clawdTo(x, y, s, side, tx, ty, jump = 0) {
  const bw = 300 * s, bh = 214 * s, cy = y - 54 * s - bh / 2 - jump * 60 * s, dir = side === 'L' ? -1 : 1;
  return [(tx - (x + dir * bw * .52)) / bw * dir, (ty - (cy + bh * .08)) / bw];
}
// Your hand's centre, given where its grip (the knuckles) or its fingertip should be.
const rot = (lx, ly, a) => [lx * Math.cos(a) - ly * Math.sin(a), lx * Math.sin(a) + ly * Math.cos(a)];
function gripAt(px, py, ang, s) { const [dx, dy] = rot(0, -62 * s, ang + Math.PI / 2); return [px - dx, py - dy]; }
function tipAt(px, py, ang, s) { const [dx, dy] = rot(-43 * s, -152 * s, ang + Math.PI / 2); return [px - dx, py - dy]; }
// Your hand bringing something in from a side of the frame and leaving again: `side` 1 from the
// right, −1 from the left; returns the offset to add to the thing's x (0 once it's arrived).
function slideIn(t, t0, tGive, side, d = .26, dist = 900) {
  if (t < tGive) return side * (1 - easeOut(clamp((t - t0) / d), 3)) * dist;
  return 0;
}
function slideOut(t, tGive, side, d = .3, dist = 900) { return side * easeIn(clamp((t - tGive) / d), 2) * dist; }
// Eyes popping out on stalks, the classic take, over a bot drawn by clawd() (k is its return).
function eyesPop(g, k, s, p, face = 0) {
  if (p <= 0) return;
  const ex = k.bw * .19, fx = face * 30 * s;
  for (const d of [-1, 1]) {
    const bx = k.x + d * ex + fx, by = k.eyY, q = backOut(clamp(p), 3);
    const ox = bx + d * 26 * s * q, oy = by - 84 * s * q, r = 32 * s * (1 + .55 * q);
    shape(g, [[bx - 20 * s, by + 18 * s], [bx + 20 * s, by + 18 * s], [ox + 14 * s, oy], [ox - 14 * s, oy]], { fill: WHITE, shade: '#d8ccb8', form: 'block', w: 4.5 * s, seed: 6100 + d });
    shape(g, ellipse(ox, oy, r, r * 1.08), { fill: WHITE, shade: '#d8ccb8', form: 'round', w: 5 * s, seed: 6102 + d });
    dot(g, ox - d * 5 * s, oy + 5 * s, r * .42);
    dot(g, ox - d * 5 * s - r * .14, oy - r * .08, r * .13, WHITE);
  }
}
// ---------------------------------------------------------------- the app's pages, in a browser
// Every page carries the app's pink header (the barbell). `k` scales the page's furniture.
const withHeader = (draw, boost = 1.45) => (g, cx, cy, cw, ch, k) => {
  const hs = Math.min(cw / 256, ch / 290) * boost, hh = HEADER * hs, s = Math.min(cw / 256, (ch - hh) / 226);
  g.fillStyle = C('#fdf5f0'); g.fillRect(cx, cy, cw, ch);
  appHeader(g, cx, cy, cw, hs);
  draw(g, cx, cy + hh, cw, ch - hh, s);
};
// The app's log, as Mabel's phone shows it (its own header, reload arrow and all).
const logScr = (rows, wifi = 1) => (g, sx, sy, sw, sh, s) => { appLog({ rows, wifi })(g, sx, sy, sw, sh, s); g.fillStyle = C(APP.rule); g.fillRect(sx, sy + 60 * s, sw, 7 * s); appHeader(g, sx, sy, sw, s, { wifi }); };
const logPage = (rows) => (g, cx, cy, cw, ch) => logScr(rows)(g, cx, cy, cw, ch, Math.min(cw / 256, ch / (90 + 66 * rows.length)));
// Mabel's pink phone with the app's log on it
const logPhone = (g, x, y, s, rows, o = {}) => phone(g, x, y, s, { col: APP.pink, ...o, wifi: null, screen: logScr(rows) });
// The app's chat, just bot 1 ("me") and Pat. o: m1/m2 (when the messages pop in), meAt/patAt (their
// faces bounce), sam (0..1: Sam's face pushing in), seal (0..1, the "?!" slapped on), sealSince.
function chatPage(t, o = {}) {
  return withHeader((g, cx, cy, cw, ch, s) => {
    const mb = kick(t, o.meAt ?? 1e9, .25), pb = kick(t, o.patAt ?? 1e9, .25), sam = clamp(o.sam ?? 0), shift = sam * 40 * s;
    const ay = cy + 40 * s;
    avatar(g, cx + cw / 2 - 50 * s - shift, ay - pb * 14 * s, 30 * s, 'cat', { t, expr: pb > .3 ? 'happy' : 'open' });
    avatar(g, cx + cw / 2 + 50 * s - shift, ay - mb * 14 * s, 30 * s, 'bot', { t, k: 0, expr: mb > .3 ? 'happy' : 'open' });
    if (sam > 0) { const q = backOut(sam, 2.4); avatar(g, cx + cw / 2 + 125 * s, ay + (1 - q) * 90 * s, 30 * s, 'pup', { t, expr: 'open' }); }
    else heart(g, cx + cw / 2, ay + 2 * s, 10 * s, '#e8789c', 6200);
    const m1 = pop(t, o.m1 ?? -1, .25), m2 = pop(t, o.m2 ?? 1e9, .3);
    const at_ = (sx, sy, sc, f) => { if (sc <= 0) return; g.save(); g.translate(sx, sy); g.scale(sc, sc); g.translate(-sx, -sy); f(); g.restore(); };
    at_(cx + cw - 20 * s, cy + 100 * s, m1, () => chatBubble(g, cx + cw - 200 * s, cy + 86 * s, 180 * s, 52 * s, { right: true, lines: 2, seed: 1 }));
    at_(cx + 20 * s, cy + 160 * s, m2, () => chatBubble(g, cx + 18 * s, cy + 146 * s, 206 * s, 62 * s, { lines: 2, heart: true, heartS: s * .75, seed: 2 }));
    if ((o.seal ?? 0) > 0) sticker(g, cx + cw * .66, cy + 70 * s, 34 * s, { p: o.seal, ang: -.25, since: o.sealSince });
  });
}
// The app's shop: gym gear on a shelf, each with its price in coins; the cart, the till and the
// goose, who buys the kettlebell and the dumbbells.
function shopPage(t, o = {}) {
  return withHeader((g, cx, cy, cw, ch, s) => {
    const floor = cy + ch * .92, shelfY = cy + ch * .4;
    g.fillStyle = C('#efe2d8'); g.fillRect(cx, floor, cw, ch);
    shape(g, rrect(cx + 10 * s, shelfY, 210 * s, 9 * s, 3 * s), { fill: '#a87444', form: 'block', w: 2.5 * s, seed: 6310 });
    const goods = [['kettle', 3], ['dumb', 2], ['rope', 1]];
    const shelfX = i => cx + 46 * s + i * 66 * s;
    const cartX = cx + cw * .3;
    const drawGood = (kind, x, y, k) => kind === 'kettle' ? kettlebell(g, x, y, .5 * k) : kind === 'dumb' ? dumbbells(g, x, y, .42 * k) : skipRope(g, x, y, .5 * k);
    const hops = o.hops || [];
    const landed = hops.filter(h => t > h + .3).length;
    cart(g, cartX, floor, .5 * s, { inside: (g, x, y) => { for (let i = 0; i < landed; i++) drawGood(goods[i][0], x + (i - .5) * 30 * s, y - 2 * s, .9 * s); } });
    goods.forEach(([kind, price], i) => {
      priceTag(g, shelfX(i), shelfY + 22 * s, price, .6 * s);
      const h = hops[i];
      if (h == null || t < h) { drawGood(kind, shelfX(i), shelfY, s); return; }
      const u = clamp((t - h) / .3); if (u >= 1) return;
      drawGood(kind, lerp(shelfX(i), cartX + (i - .5) * 30 * s, u), lerp(shelfY, floor - 40 * s, u) - Math.sin(u * Math.PI) * 60 * s, s);
    });
    shape(g, rrect(cx + cw * .64, floor - 46 * s, cw * .34, 46 * s, 4 * s), { fill: '#a87444', form: 'block', w: 3 * s, seed: 6320 });
    till(g, cx + cw * .86, floor - 46 * s, .42 * s, { open: ramp(t, (o.pay ?? 1e9) + .25, .12) });
    const paid = o.pay ?? 1e9;
    critter(g, cx + cw * .66, floor, .3 * s, { t, kind: 'goose', R: t > paid - .3 ? { to: [.85, -.55], pose: 'open' } : 'hang', eyes: { expr: t > paid + .35 ? 'happy' : 'open', lx: .6 } });
    for (let i = 0; i < 5; i++) { const ct = paid + i * .06, u = clamp((t - ct) / .22); if (t < ct || u >= 1) continue; coin(g, lerp(cx + cw * .72, cx + cw * .86, u), lerp(floor - 110 * s, floor - 76 * s, u) - Math.sin(u * Math.PI) * 34 * s, 8 * s, { seed: 6330 + i }); }
    if (t > paid + .3) sparkle(g, cx + cw * .86, floor - 100 * s, 34 * s, t, 4, GOLD, 6340);
    if (o.black != null && t > o.black) { g.fillStyle = C('#141016'); g.fillRect(cx, cy - HEADER * s, cw, ch + HEADER * s); spinner(g, cx + cw / 2, cy + ch / 2 - 20 * s, 28 * s, t); }
  });
}
// Small pages for the screens held side by side: the chat's open lock under the "?!", the shop's
// order weighed level, the log's lost set.
const lockPage = t => withHeader((g, cx, cy, cw, ch, s) => { chatBubble(g, cx + 12 * s, cy + ch * .44, cw * .6, 48 * s, { lines: 1, heart: true, heartS: s * .7, seed: 5 }); padlock(g, cx + cw * .78, cy + ch * .44, .55 * s, { open: 1 }); sticker(g, cx + cw * .3, cy + ch * .22, 24 * s, { ang: -.3 }); }, 1.1);
const scalePage = t => withHeader((g, cx, cy, cw, ch, s) => { balance(g, cx + cw / 2, cy + ch - 6 * s, .34 * s, 0, { left: (g, x, y) => kettlebell(g, x, y, .26 * s), right: (g, x, y) => coins(g, x, y, .34 * s, 3) }); tick(g, cx + cw * .5, cy + ch * .16, .5 * s, GOLD); }, 1.1);

export function register() {
  const L1 = 'A fresh bot crew', L2 = 'Real browsers', L3 = 'The goals you name', L4 = 'Your oracles', L5 = 'One probes the chat', L6 = "Does Sam's new",
    L7 = 'One tests the cart', L8 = 'Do orders still', L9 = 'We trade the news', L10 = 'We share the doubts', L11 = 'Some calls need', L12 = 'We ask for fresh';
  const tCrew = at(L1, 'crew'), tHere = at(L1, 'Here'), tWhat = at(L1, 'what'), tDo = at(L1, 'do');
  const tBrowsers = at(L2, 'browsers'), tPlaybook = at(L2, 'playbook'), tUsers = at(L2, 'users'), tMind = at(L2, 'mind');
  const tGoals = at(L3, 'goals'), tName = at(L3, 'name'), tGuide = at(L3, 'guide'), tGame = at(L3, 'game');
  const tOracles = at(L4, 'oracles'), tHelp = at(L4, 'help'), tThem = at(L4, 'them'), tTo = at(L4, 'to'), tJudge = at(L4, 'judge'), tFind = at(L4, 'find');
  const tProbes = at(L5, 'probes'), tChat = at(L5, 'chat'), tMe = at(L5, 'me'), tPat = at(L5, 'Pat');
  const tNew = at(L6, 'new'), tAccount = at(L6, 'account'), tText = at(L6, 'text'), tPat2 = at(L6, 'Pat'), tSent = at(L6, 'sent');
  const tTests = at(L7, 'tests'), tCart = at(L7, 'cart'), tThen = at(L7, 'then'), tHits = at(L7, 'hits');
  const tOrders = at(L8, 'orders'), tStill = at(L8, 'still'), tCustomer = at(L8, 'customer'), tSpent = at(L8, 'spent');
  const tTrade = at(L9, 'trade'), tNews = at(L9, 'news'), tCompare = at(L9, 'compare'), tViews = at(L9, 'views');
  const tShare = at(L10, 'share'), tDoubts = at(L10, 'doubts'), tObs = at(L10, 'observations');
  const tCalls = at(L11, 'calls'), tNeed = at(L11, 'need'), tYou = at(L11, 'you'), tWell = at(L11, 'We'), tThrough = at(L11, 'through');
  const tAsk = at(L12, 'ask'), tFresh2 = at(L12, 'fresh'), tInterp = at(L12, 'interpretations');

  // the cuts
  const T0 = 96.4, C1 = 99.06, C2 = 99.86, C3 = 100.52, C4 = 101.52, C5 = 103.6, C5b = 104.12, C6 = 105.95, C7 = 108.0, C8 = 109.55,
    C9 = 110.48, C10 = 111.85, C11 = 112.66, C12 = 115.02, C13 = 117.26, C14 = 119.46, C15 = 122.7, C15b = 123.62, END = 128.9;

  // ---- 1. a fresh bot crew? A crate thuds down and bursts; three little bots spring out; Guess
  //      turns and points at you: here's what to do.
  irisJoin(T0, { close: .3, open: .45, x: 250, y: 450, x2: W / 2, y2: 940 });
  const tLand = 97.27, CX = 1110, GX = 1420, KX = 930;
  shot(T0, C1, (g, T) => { const t = now();
    const c = { ...cam([[T0, fc(1110, 1.1)], [tLand, fc(1120, 1.12)], [tCrew + .15, fc(1140, 1.16)], [tHere + .3, fc(1222, 1.28)], [C1, fc(1226, 1.3)]], T), sy: shakeAt(T, tLand, 16, .28) };
    g.save(); room(g, c, t);
    const fall = clamp((t - 96.9) / (tLand - 96.9));
    if (t < tLand) { g.save(); g.globalAlpha = .15 + .35 * fall; g.fillStyle = '#1a0c04'; g.filter = 'blur(8px)'; g.beginPath(); g.ellipse(CX, F + 2, 60 + 140 * fall, 12 + 10 * fall, 0, 0, TAU); g.fill(); g.restore(); }
    else footShadow(g, CX, F, 380, .4);
    footShadow(g, GX, F, 200); footShadow(g, KX, F, 230);
    if (t >= tCrew) for (let k = 0; k < 3; k++) {
      const tk = tCrew + k * .05, u = t - tk; if (u < 0) continue;
      const e = 1 - Math.exp(-u * 6) * Math.cos(u * 22), bx = CX + (k - 1) * 168, top = F - 26 - 230 * e;
      spring(g, bx, F - 20, top, .62, { lean: Math.sin(u * 13) * 20 * Math.exp(-u * 1.5) });
      const open = t > tk + .25 + k * .12;
      bot(g, bx, top, .5, k, { t, dance: 0, lean: Math.sin(u * 13) * .28 * Math.exp(-u * 1.5), eyes: { expr: open ? 'wide' : 'shut', lx: open ? Math.sin(t * 2.5 + k * 2) * .7 : 0, ly: -.1 }, L: open ? 'up' : 'hang', R: open && k === 1 ? 'wave' : 'hang', sing: open ? .2 : 0 });
    }
    if (t < tCrew) {
      const y = t < tLand ? lerp(F - 1500, F, fall * fall) : F, sq = kick(t, tLand, .12) * .5;
      crate(g, CX, y, 1.1, { squash: sq });
      if (t > tLand && t < tLand + .3) { for (const d of [-1, 1]) for (let i = 0; i < 3; i++) { const u = (t - tLand) / .3; shape(g, ellipse(CX + d * (200 + u * 120 + i * 40), F - 20 - i * 18 - u * 30, 30 * (1 - u * .5), 22 * (1 - u * .5)), { fill: '#e8dcc4', w: 3, seed: 6000 + i + d, form: false }); } burst(g, CX, F - 150, 230, (t - tLand) / .25, 12, INK, 6010); }
    } else { g.save(); g.beginPath(); g.rect(-5000, -5000, 12000, 5000 + F - 2); g.clip(); crate(g, CX, F, 1.1, { age: t - tCrew }); g.restore(); }
    {
      const peer = t > tLand + .08 && t < tCrew ? ease(t, tLand + .08, .25) : 0, blown = kick(t, tCrew, .35);
      clawd(g, KX, F, .75, { t, jump: kick(t, tLand, .16) * .5 + blown * .4, lean: peer * .12 - blown * .25, face: .5, hatTip: blown * .9, eyes: { expr: blown > .3 ? 'wide' : 'open', lx: .8, ly: t < tLand ? -.9 : .1 }, sing: 0, smile: blown > .3 ? -.4 : .6,
        L: 'hips', R: { to: [lerp(.3, .62, peer), lerp(-.3, -.1, peer)], pose: 'grip' }, hold: { R: (g, x, y, a, s) => magnifier(g, x, y, lerp(-1.1, -.2, peer) - blown * .6, s * .8) } });
    }
    const turned = t > tHere - .05, hop = kick(t, tLand, .16) * .6;
    const R = turned ? { to: [-.1, lerp(.2, -.42, ease(t, tHere, .2))], pose: 'fist' } : 'hips';
    const thrust = kick(t, tWhat, .2) + kick(t, tDo, .2) * .6;
    guess(g, GX, F, .95, { t, jump: hop, face: turned ? 0 : -.6, eyes: { expr: t > tLand && t < tCrew + .5 ? 'wide' : 'open', lx: turned ? 0 : -.8, ly: t < tLand ? -.9 : 0 }, brow: turned ? 1 : .5, lean: turned ? -.04 : -hop * .1, sing: turned ? true : 0, smile: turned ? .8 : .4, L: 'hips', R, hold: turned ? { R: (g, x, y, a, s) => { if (t > tWhat - .12) pointAtYou(g, x, y, s * (1.25 + thrust * .18), { from: .9 }); } } : {} });
    g.restore();
  }, { id: 'br-crate' });

  // ---- 2a. real browsers: your hand, in from the right, gives bot 1 a browser; it peers at the globe
  shot(C1, C2, (g, T) => { const t = now();
    const c = cam([[C1, fc(890, 1.46)], [C2, fc(900, 1.52)]], T);
    g.save(); room(g, c, t);
    const BX = 700, s = .88, WX = 850, WY = F - 380, WW = 360, WH = 300, got = t > tBrowsers;
    footShadow(g, BX, F, 250);
    const dx = slideIn(t, C1, tBrowsers, 1);
    browserWin(g, WX + dx, WY, WW, WH, { content: logPage([{}, {}, {}]), favicon: APPINK });
    if (got && t < tBrowsers + .5) sparkle(g, WX + WW / 2, WY + WH / 2, 160, t, 6, GOLD, 6020);
    bot(g, BX, F, s, 0, { t, dance: 0, lean: got ? .05 : 0, eyes: { expr: t > tBrowsers + .3 ? 'happy' : 'wide', lx: .85, ly: .25 }, L: got ? 'hips' : 'hang', R: got ? { to: clawdTo(BX, F, s, 'R', WX + 6, WY + WH * .5), pose: 'grip' } : { to: [.42, -.3], pose: 'open' }, sing: true });
    if (t < tBrowsers + .3) { const [hx, hy] = gripAt(WX + WW + dx, WY + WH * .5, Math.PI, 1); yourHand(g, hx + slideOut(t, tBrowsers, 1), hy, Math.PI, 1, 'hold'); }
    g.restore();
  }, { id: 'br-browser' });

  // ---- 2b. a playbook: your hand, in from the left, gives bot 2 a coach's plays; it flips them open
  shot(C2, C3, (g, T) => { const t = now();
    const c = cam([[C2, fc(1252, 1.46)], [C3, fc(1246, 1.52)]], T);
    g.save(); room(g, c, t);
    const BX = 1430, s = .88, PX = 1110, PY = F - 210, got = t > tPlaybook - .05;
    footShadow(g, BX, F, 250);
    const dx = slideIn(t, C2 - .04, tPlaybook - .05, -1, .22);
    playbook(g, PX + dx, PY, 340, { open: ease(t, tPlaybook, .22) });
    bot(g, BX, F, s, 1, { t, dance: 0, eyes: { expr: 'wide', lx: -.85 + Math.sin(t * 9) * .3 * ramp(t, tPlaybook + .2, .2), ly: .35 }, L: got ? { to: clawdTo(BX, F, s, 'L', PX + 176, PY), pose: 'grip' } : { to: [.42, -.3], pose: 'open' }, R: t > 100.3 ? { to: [.28, -.52], pose: 'point' } : 'hips', sing: true, lean: -.04 });
    if (t < tPlaybook + .25) { const [hx, hy] = gripAt(PX - 178 + dx, PY, 0, 1); yourHand(g, hx + slideOut(t, tPlaybook, -1), hy, 0, 1, 'hold'); }
    g.restore();
  }, { id: 'br-playbook' });

  // ---- 2c. and users in mind: your hand sets a thought of Mabel, Pat and the goose over bot 3
  shot(C3, C4, (g, T) => { const t = now();
    const c = cam([[C3, fc(1500, 1.32)], [C4, fc(1500, 1.38)]], T);
    g.save(); room(g, c, t);
    const BX = 1325, QX = 1622, QY = F - 330, set = t > tUsers + .05;
    footShadow(g, BX, F, 250);
    const inMind = t > tMind - .1;
    const k = bot(g, BX, F, .88, 2, { t, eyes: { expr: inMind ? 'happy' : 'wide', lx: 0, ly: inMind ? 0 : -.9 }, L: 'hang', R: inMind ? { to: [-.08, -.42], pose: 'point', ang: -2.2 } : 'hang', sing: true });
    const dx = slideIn(t, C3 - .02, tUsers + .05, 1, .3, 1000);
    thought(g, QX + dx, QY, 470, 290, { from: dx === 0 ? [BX + 120, k.top + 30] : null, inside: (g, x, y, w, h) => {
      mabel(g, x - 140, y + 140, .28, { t, L: 'flex', R: 'hips', eyes: { expr: 'happy' }, sing: .4 });
      critter(g, x + 5, y + 130, .48, { t, kind: 'cat', R: { to: [.25, -.9], pose: 'grip' }, eyes: { expr: 'happy' }, hold: { R: (g, hx, hy) => dumbbells(g, hx + 28, hy + 10, .28) } });
      critter(g, x + 145, y + 130, .46, { t, kind: 'goose', L: 'up', eyes: { expr: 'happy' }, sing: .5, hold: { L: (g, hx, hy) => skipRope(g, hx - 8, hy + 38, .46) } });
    } });
    if (t < tUsers + .4) { const [hx, hy] = gripAt(QX + 243 + dx, QY + 10, Math.PI, 1.05); yourHand(g, hx + slideOut(t, tUsers + .08, 1), hy, Math.PI, 1.05, 'hold'); }
    g.restore();
  }, { id: 'br-users' });

  // ---- 3. the goals you name will guide the game: your finger, in from the right, plants three flags
  //      (a padlock, a coin, a barbell); the bots hop up their lanes toward them
  const taps = [tGoals, tGoals + .27, tName + .02];
  const hops = [tGuide - .02, tGuide + .3, tGame + .14];
  shot(C4, C5, (g, T) => { const t = now();
    const c = cam([[C4, fi(DI.cx, 1.0)], [C5, fi(DI.cx, 1.05)]], T);
    g.save(); place(g, deskInsert(), c);
    const NY = DI.near - 40, BXC = DI.cx;
    board(g, BXC, NY, { header: (g, x, y) => appLogo(g, x, y, 34) });
    const order = [2, 1, 0];
    order.forEach((k, i) => { const [u, v] = GOAL_AT[k]; const [px, py] = boardPt(BXC, NY, u, v); pennant(g, px, py, .88, GOAL_ICON[k], { t, p: ramp(t, taps[i], .22), col: APP.header, badge: true, ball: BOT_COLS[k] }); });
    for (const k of [1, 0, 2]) {
      const P = PATHS[k];
      let step = 0; hops.forEach(h => { if (t > h) step++; });
      const h0 = hops[step - 1] ?? -9, u = clamp((t - h0) / .22);
      const a = P[Math.max(0, step - 1)], b = P[step];
      const uv = step === 0 ? P[0] : [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
      const [px, py] = boardPt(BXC, NY, uv[0], uv[1]);
      const sc = lerp(.42, .3, uv[1]), air = step > 0 && u < 1 ? Math.sin(u * Math.PI) * 70 : 0;
      const crouch = t > tName + .3 && step === 0 ? ramp(t, tName + .3, .2) * .25 : 0;
      footShadow(g, px, py, 120 * sc / .4, .3);
      pawnBase(g, px, py - air, sc * 1.4, BOT_COLS[k]);
      const handOver = t > taps[0] - .3 && t < taps[2] + .4;
      bot(g, px, py - air - 8 * sc, sc, k, { t, dance: .4, squash: crouch, eyes: { expr: step >= 3 ? 'happy' : 'wide', lx: k === 0 ? -.6 : k === 2 ? .6 : 0, ly: handOver ? -.9 : -.5 }, L: air > 10 ? 'up' : 'hang', R: air > 10 ? 'up' : 'hang' });
    }
    // your hand, in from the right edge at the flags' height, tapping three spots in turn
    const tin = C4 + .02, tout = taps[2] + .22;
    if (t > tin && t < tout + .4) {
      const pts = order.map(k => { const [u, v] = GOAL_AT[k]; return boardPt(BXC, NY, u, v); });
      let tx, ty;
      if (t < taps[0]) { const u = easeOut(clamp((t - tin) / (taps[0] - tin)), 2); tx = lerp(1700, pts[0][0], u); ty = lerp(pts[0][1] - 80, pts[0][1], u); }
      else if (t < taps[1]) { const u = easeInOut(clamp((t - taps[0] - .06) / (taps[1] - taps[0] - .1))); tx = lerp(pts[0][0], pts[1][0], u); ty = lerp(pts[0][1], pts[1][1], u) - Math.sin(u * Math.PI) * 60; }
      else if (t < taps[2]) { const u = easeInOut(clamp((t - taps[1] - .06) / (taps[2] - taps[1] - .1))); tx = lerp(pts[1][0], pts[2][0], u); ty = lerp(pts[1][1], pts[2][1], u) - Math.sin(u * Math.PI) * 60; }
      else { const u = easeIn(clamp((t - tout) / .35), 2); tx = lerp(pts[2][0], 1900, u); ty = lerp(pts[2][1], pts[2][1] - 60, u); }
      const press = taps.reduce((m, tp) => Math.max(m, kick(t, tp, .08)), 0);
      const ang = Math.PI - .42;
      const [hx, hy] = tipAt(tx, ty + press * 8 - 4, ang, .9);
      yourHand(g, hx, hy, ang, .9, 'tap');
    }
    g.restore();
  }, { id: 'br-game' });

  // ---- 4a. your oracles: your hand, in from the left, gives bot 3 Mabel's own notebook, beside the
  //      app's log on her pink phone
  const LOGROWS = [{}, {}, {}, { ghost: true }];
  shot(C5, C5b, (g, T) => { const t = now();
    const c = cam([[C5, fc(1214, 1.42)], [C5b, fc(1220, 1.46)]], T);
    g.save(); room(g, c, t);
    const BX = 1240, s = .85, PX = 1460, NBX = 985, NBY = F - 190, got = t > tOracles;
    footShadow(g, BX, F, 250); footShadow(g, PX, F, 160);
    logPhone(g, PX, F, .5, LOGROWS, { t, eyes: { expr: 'open', lx: -.6 } });
    const dx = slideIn(t, C5 - .04, tOracles, -1, .26);
    mabelNotebook(g, NBX + dx, NBY, 1.1, 4);
    bot(g, BX, F, s, 2, { t, dance: 0, eyes: { expr: 'wide', lx: t < tOracles + .2 ? -.8 : .85, ly: .15 }, L: got ? { to: clawdTo(BX, F, s, 'L', NBX + 94, NBY), pose: 'grip' } : { to: [.4, -.25], pose: 'open' }, R: { to: [.3, -.5], pose: 'grip' }, sing: true,
      hold: { R: (g, x, y, a, s2) => gavel(g, x, y, -1.7, .75 * s2) } });
    if (t < tOracles + .3) { const [hx, hy] = gripAt(NBX - 94 + dx, NBY, 0, 1); yourHand(g, hx + slideOut(t, tOracles, -1), hy, 0, 1, 'hold'); }
    g.restore();
  }, { id: 'br-oracle-give' });

  // ---- 4b. help them to judge what they find: close, filling the frame: her four pencilled sets
  //      beside the app's three, joined row by row; the fourth finds a gap; on "judge" the gavel comes
  //      down on it and leaves the testers' "?!" seal
  shot(C5b, C6, (g, T) => { const t = now();
    const z = lerp(2.46, 2.54, ramp(T, C5b, C6 - C5b));
    const c = { ...fc(1226, z), sy: shakeAt(T, tJudge, 9, .2) };
    g.save(); room(g, c, t);
    const NX = 1132, NY2 = F - 128, NS = 1.15, PX = 1336, PS = .5, hit = kick(t, tJudge, .25);
    footShadow(g, PX, F, 160); footShadow(g, NX, F, 220);
    mabelNotebook(g, NX, NY2, NS, 4);
    const ph = logPhone(g, PX, F, PS, LOGROWS, { t, dance: 0, lean: hit * .06, eyes: { expr: t > tJudge ? 'worried' : 'open', lx: -.7 } });
    if (t > tJudge + .15) sweat(g, PX + 80, F - 300, .7);
    // row by row, a pencil line joins each of her sets to the app's; the fourth finds a gap
    const nh = 190 * NS, nRow = i => NY2 - nh / 2 + (i + .62) * nh / 7 + 6 * NS;
    const [sx, sy] = ph.screen, rowY = i => sy + ROWY(PS, i) + 27 * PS, rowX = sx + 15 * PS;
    const pairT = [tHelp - .05, tThem - .05, tTo - .12, tJudge - .12];
    for (let i = 0; i < 4; i++) {
      const p = ramp(t, pairT[i], .14); if (p <= 0) continue;
      const a = [NX + 150 * NS * .5, nRow(i)], b = [rowX - 2, rowY(i)];
      const e = [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
      g.save(); g.setLineDash([7, 6]); g.strokeStyle = C(i < 3 ? '#6a5a52' : '#d08a1c'); g.lineWidth = 2.6; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(e[0], e[1]); g.stroke(); g.restore();
      if (i < 3 && p >= 1) dot(g, b[0], b[1], 3, '#6a5a52');
    }
    // the gavel: the bot's arm swings it in from the right and down on the empty row
    const gap = [rowX + 110 * PS, rowY(3)], H0 = [gap[0] + 120, gap[1] - 24];
    const up = ease(t, tTo - .12, .2), slam = ease(t, tJudge - .07, .07) - ease(t, tJudge + .2, .22) * .6;
    const angDown = Math.atan2(gap[1] - H0[1], gap[0] - H0[0]) - TAU, ang = slam > 0 ? lerp(-1.75, angDown, slam) : lerp(-1.2, -1.75, up);
    if (t > tJudge) sticker(g, gap[0] - 4, gap[1] - 2, 21, { p: ramp(t, tJudge, .1), ang: -.22, since: t - tJudge - .1 });
    if (t > tHelp - .1) {
      const inn = easeOut(ramp(t, tHelp - .1, .2), 3), hx = H0[0] + (1 - inn) * 260, hy = H0[1];
      hose(g, [hx + 300, hy + 30], [hx, hy], { w: 7, bend: .12, seed: 6500 });
      gavel(g, hx, hy, ang, .64);
      glove(g, hx, hy, ang, 13, 'grip', { seed: 6501 });
    }
    if (t > tJudge && t < tJudge + .3) burst(g, gap[0], gap[1], 56, (t - tJudge) / .3, 10, INK, 6030);
    // the near desk, close: a pencil and the inkwell in the corners below the lyric
    deskThing(g, 'pencil', 1080, F + 250, -.25, .5, 2900); deskThing(g, 'inkwell', 1400, F + 300, 0, .42, 2910);
    g.restore();
  }, { id: 'br-oracle-judge' });

  // ---- 5. one probes the chat, just me and Pat: bot 1, a little safecracker hovering on its propeller,
  //      listens at the padlock on the chat's window; Pat sends a pink heart
  const BRW = { x: 1560, w: 500, h: 420, foot: 70 };
  const LOCK = [BRW.x + BRW.w + 30, F - BRW.foot - 262];
  const chatSet = (g, t, o = {}) => {
    const bx = BRW.x, by = F - BRW.foot - BRW.h;
    for (const d of [.15, .85]) shape(g, rrect(bx + BRW.w * d - 14, F - BRW.foot - 6, 28, BRW.foot + 6, 6), { fill: '#6e4426', form: 'block', w: 5, seed: 6050 + d });
    browserWin(g, bx, by, BRW.w, BRW.h, { content: chatPage(t, o), favicon: APPINK });
    // the hasp on the window's edge, and the padlock through it
    shape(g, rrect(BRW.x + BRW.w - 10, LOCK[1] - 70, 34, 50, 8), { fill: '#a8a294', form: 'block', w: 4, seed: 6055 });
    padlock(g, LOCK[0], LOCK[1], .95, { open: o.open ?? 0 });
  };
  const hover = (t, x0, y0) => [x0 + Math.sin(t * 2.3) * 6, y0 + Math.sin(t * 4.1) * 12];
  shot(C6, C7, (g, T) => { const t = now();
    const c = cam([[C6, fc(1952, 1.28)], [C7, fc(1958, 1.32)]], T);
    g.save(); room(g, c, t);
    chatSet(g, t, { m1: tChat - .1, m2: tPat, meAt: tMe, patAt: tPat });
    const [bx, by] = hover(t, 2235, F - 215);
    footShadow(g, bx, F, 170 - (F - by - 200) * .2, .22);
    const onLock = ease(t, tProbes - .12, .2);
    const k = bot(g, bx, by, .7, 0, { t, dance: 0, face: -.5, eyes: { expr: t > tPat + .2 ? 'happy' : 'open', lx: -.9, ly: t > tChat ? -.6 : .2 }, L: t > tMe - .05 && t < tMe + .35 ? { to: [-.05, -.06], pose: 'point' } : { to: clawdTo(bx, by, .7, 'L', lerp(bx - 120, LOCK[0] + 30, onLock), lerp(by - 90, LOCK[1], onLock)), pose: 'grip' }, R: 'hang', sing: true });
    speedLines(g, bx, k.top - 50, 1, 30, 3, 6510, '#8a7e6a');
    stethoscope(g, [[k.x - k.bw * .5, k.eyY - 10], [k.x + k.bw * .5, k.eyY - 10]], [k.x - 10, k.eyY + 80], onLock > .5 ? [LOCK[0] + 26, LOCK[1] + 2] : [k.hands.L.x, k.hands.L.y], .8);
    g.restore();
  }, { id: 'br-chat' });

  // ---- 6a. does Sam's new account show the text Pat just sent? Sam unwraps a new phone; Pat's heart is on it
  shot(C7, C8, (g, T) => { const t = now();
    const c = cam([[C7, fc(860, 1.32)], [C8, fc(860, 1.38)]], T);
    g.save(); room(g, c, t);
    const SX = 800;
    footShadow(g, SX, F, 230);
    const torn = ramp(t, tNew - .05, .2), shown = t > tText, raised = ease(t, tNew + .1, .25);
    const holdBox = { to: [-.45, .15], pose: 'grip' };
    const holdUp = { to: [lerp(-.45, .9, raised), lerp(.15, -.75, raised)], pose: 'grip' };
    const info = critter(g, SX, F, 1.05, { t, kind: 'pup', L: torn < 1 ? holdBox : { to: [.3, -.1], pose: 'open' }, R: torn < .3 ? holdBox : holdUp, eyes: { expr: t > tAccount && !shown ? 'happy' : 'wide', lx: raised > .5 ? .8 : 0, ly: raised > .5 ? -.2 : .4 },
      hold: { R: torn >= .3 ? (g, x, y, a) => {
        const ps = .38, px = x + 62, py = y + 96;
        gymPhone(g, px, py, ps, (g, sx, sy, sw, sh, ss) => {
          if (shown) { const p = pop(t, tText, .25), k = (sw - 6) / 270; g.save(); g.translate(sx + sw / 2, sy + sh * .36); g.scale(p * k, p * k); chatBubble(g, -135, -50, 270, 100, { lines: 2, heart: true, heartS: 1, seed: 2 }); g.restore(); }
          else sparkle(g, sx + sw / 2, sy + sh / 2, sw * .4, t, 4, GOLD, 6060);
        }, { t, legs: false, eyes: { expr: shown ? 'wide' : 'happy' } });
        bow(g, px, py - 560 * ps - 2, .66);
        glove(g, x, y, a, 17 * 1.05, 'grip', { seed: 6075 });
      } : null } });
    if (torn < 1) { const bx = (info.hands.L.x + info.hands.R.x) / 2, by = Math.max(info.hands.L.y, info.hands.R.y); gift(g, bx, by + 60, 190, { torn }); }
    if (torn > 0 && torn < 1) for (let i = 0; i < 5; i++) { const a = -Math.PI * (.15 + i * .17), d = torn * 320, ox = SX, oy = F - 120; shape(g, [[ox + Math.cos(a) * d, oy + Math.sin(a) * d], [ox + Math.cos(a) * d + 50, oy - 20 + Math.sin(a) * d], [ox + Math.cos(a) * d + 30, oy + 40 + Math.sin(a) * d]], { fill: '#b9a2d8', w: 4, seed: 6070 + i, form: false }); }
    if (shown) { const p = pop(t, tText + .12, .3); g.save(); g.translate(SX - 20, info.top - 60); g.scale(p, p); qmark(g, 0, 0, 110, GOLD); g.restore(); }
    g.restore();
  }, { id: 'br-sam' });

  // ---- 6b. the padlock springs open; Sam's face pushes into the chat; the bot's eyes pop: a leak
  shot(C8, C9, (g, T) => { const t = now();
    const c = cam([[C8, fc(1965, 1.28)], [C9, fc(1965, 1.33)]], T);
    g.save(); room(g, c, t);
    const open = t > tPat2 ? backOut(clamp((t - tPat2) / .25), 3) : 0;
    const tSeal = tSent + .02;
    chatSet(g, t, { m1: -1, m2: -1, open, sam: ramp(t, tPat2 + .12, .28), seal: ramp(t, tSeal, .12), sealSince: t - tSeal - .12 });
    const startle = kick(t, tSent - .2, .3);
    const [bx, by] = hover(t, 2235, F - 215 - startle * 40);
    footShadow(g, bx, F, 140, .18);
    const slap = ease(t, tSeal - .12, .12) * (1 - ease(t, tSeal + .25, .2));
    const k = bot(g, bx, by, .7, 0, { t, dance: 0, face: -.5, eyes: { expr: 'wide', lx: -.9, ly: -.2 }, L: { to: clawdTo(bx, by, .7, 'L', LOCK[0] + 30, LOCK[1]), pose: 'grip' }, R: slap > 0 ? { to: [lerp(.2, -.9, slap), lerp(-.5, -.75, slap)], pose: 'flat' } : 'hang', sing: 0 });
    speedLines(g, bx, k.top - 50, 1, 30, 3, 6510, '#8a7e6a');
    stethoscope(g, [[k.x - k.bw * .5, k.eyY - 10], [k.x + k.bw * .5, k.eyY - 10]], [k.x - 10, k.eyY + 80], [LOCK[0] + 26, LOCK[1] + 2], .8);
    if (t > tPat2 && t < tPat2 + .4) pops(g, LOCK[0], LOCK[1] - 50, 70, 6, { w: 6 });
    eyesPop(g, k, .7, ramp(t, tSent - .2, .12) * (1 - ramp(t, tSeal + .1, .15)), -.5);
    g.restore();
  }, { id: 'br-leak' });

  // ---- 7a. one tests the cart: the goose's shopping hops into the cart, and she pays
  const SHOP = { x: 560, w: 540, h: 420, foot: 70 };
  const shopHops = [tTests, tCart - .05];
  const shopStand = g => { for (const d of [.15, .85]) shape(g, rrect(SHOP.x + SHOP.w * d - 14, F - SHOP.foot - 6, 28, SHOP.foot + 6, 6), { fill: '#6e4426', form: 'block', w: 5, seed: 6080 + d }); };
  shot(C9, C10, (g, T) => { const t = now();
    const c = cam([[C9, fc(880, 1.26)], [C10, fc(890, 1.32)]], T);
    g.save(); room(g, c, t);
    const BX = 1165;
    shopStand(g);
    browserWin(g, SHOP.x, F - SHOP.foot - SHOP.h, SHOP.w, SHOP.h, { content: shopPage(t, { hops: shopHops, pay: tThen - .1 }), favicon: APPINK });
    footShadow(g, BX, F, 200);
    const tapK = shopHops.reduce((m, h) => Math.max(m, kick(t, h - .05, .12)), 0);
    bot(g, BX, F, .64, 1, { t, face: -.5, eyes: { expr: 'wide', lx: -.9, ly: -.3 }, L: { to: [.5 + tapK * .1, -.42], pose: 'point' }, R: 'hips', sing: true });
    g.restore();
  }, { id: 'br-cart' });

  // ---- 7b. then hits restart: bot 2 hangs on the power lever; the page goes black and spins
  shot(C10, C11, (g, T) => { const t = now();
    const c = cam([[C10, fc(850, 1.24)], [C11, fc(850, 1.3)]], T);
    g.save(); room(g, c, t);
    const LX = 800, p = clamp((t - (tHits + .06)) / .22);
    shopStand(g);
    browserWin(g, SHOP.x, F - SHOP.foot - SHOP.h, SHOP.w, SHOP.h, { content: shopPage(t, { hops: [0, 0], pay: 0, black: tHits + .26 }), favicon: APPINK, spin: t > tHits + .26 ? t * 6 : 0 });
    footShadow(g, LX, F, 220);
    const lv = lever(g, LX, F, .9, p);
    const [kx, ky] = lv.grip;
    const s = .62, reachH = 198 * s / .6, jumpIn = ease(t, C10, .15);
    const feet = Math.min(F, ky + reachH * .9);
    const bxp = lerp(LX + 260, kx + 20, jumpIn), byp = lerp(F, feet, jumpIn);
    footShadow(g, bxp, F, 180, .25);
    bot(g, bxp, byp, s, 1, { t, dance: 0, eyes: { expr: p > .9 ? 'happy' : 'cross', lx: -.4, ly: -.8 }, L: { to: clawdTo(bxp, byp, s, 'L', kx - 6, ky + 4), pose: 'grip' }, R: { to: clawdTo(bxp, byp, s, 'R', kx + 6, ky + 4), pose: 'grip' }, sing: true, lean: -.05 });
    if (p > .95 && t < tHits + .6) { g.save(); g.beginPath(); g.rect(-5000, -5000, 12000, 5000 + F - 4); g.clip(); burst(g, kx, ky, 90, (t - tHits - .28) / .25, 8, INK, 6090); g.restore(); }
    g.restore();
  }, { id: 'br-restart' });

  // ---- 8. do orders still match what the customer spent? A balance: the bag against her coins
  shot(C11, C12, (g, T) => { const t = now();
    const c = cam([[C11, fc(1250, 1.38)], [C12, fc(1250, 1.44)]], T);
    g.save(); room(g, c, t);
    const SX = 1240, s = .9, BX = 985, GX2 = 1512;
    footShadow(g, SX, F, 260); footShadow(g, BX, F, 200); footShadow(g, GX2, F, 200);
    const bagIn = t > tOrders, coinsIn = t > tStill + .1;
    let tilt = Math.sin(t * 2) * .02;
    if (bagIn) tilt = -.32 * (1 - Math.exp(-(t - tOrders) * 12));
    if (coinsIn) { const u = t - tStill - .1; tilt = -.32 * Math.exp(-u * 1.8) * Math.cos(u * 8.5) * (1 - ramp(t, tCustomer - .3, .25)); }
    const level = t > tCustomer - .05;
    const order = (x, y) => { kettlebell(g, x - 22, y, .46); dumbbells(g, x + 32, y, .38); };
    const B = balance(g, SX, F, s, tilt, { left: bagIn ? (g, x, y) => order(x, y) : null, right: coinsIn ? (g, x, y) => coins(g, x, y, .75, 5) : null });
    if (!bagIn && t > tOrders - .25) { const u = clamp((t - (tOrders - .25)) / .25); order(B.pans[0][0], lerp(F - 1100, B.pans[0][1] - 6, u * u)); }
    if (!coinsIn && t > tStill - .2) for (let i = 0; i < 4; i++) { const u = clamp((t - (tStill - .2) - i * .04) / .25); if (u <= 0) continue; coin(g, lerp(GX2 - 40, B.pans[1][0] + (i - 1.5) * 20, u), lerp(F - 300, B.pans[1][1] - 20, u) - Math.sin(u * Math.PI) * 120, 16, { flat: .5, seed: 6100 + i }); }
    const cheer = level && t > tCustomer + .2;
    bot(g, BX, F, .66, 1, { t, eyes: { expr: cheer ? 'happy' : 'wide', lx: .7, ly: -.3 }, L: cheer ? 'up' : 'hang', R: cheer ? 'cheer' : 'hips', sing: true });
    const beam = t > tSpent - .05;
    critter(g, GX2, F, .64, { t, kind: 'goose', L: t > tStill - .35 && t < tStill + .1 ? { to: [.9, -.6], pose: 'open' } : 'hang', R: beam ? 'up' : 'hang', eyes: { expr: beam ? 'happy' : 'open', lx: -.7, ly: -.2 }, sing: beam ? .5 : 0 });
    if (beam) for (let i = 0; i < 3; i++) { const u = ((t - tSpent) * .8 + i / 3) % 1; g.save(); g.globalAlpha *= 1 - u; heart(g, GX2 + Math.sin(u * 6 + i) * 30, F - 320 - u * 160, 18, '#e8789c', 6110 + i); g.restore(); }
    if (level) { const p = pop(t, tCustomer, .3); g.save(); g.translate(B.pivot[0], B.pivot[1] - 170); g.scale(p, p); tick(g, 0, 0, 1.1, GOLD); g.restore(); sparkle(g, B.pivot[0], B.pivot[1] - 170, 120, t, 5, GOLD, 6120); }
    g.restore();
  }, { id: 'br-balance' });

  // ---- 9. we trade the news, compare the views: close on the three, each holding a card of its find up
  //      overhead; on "trade" the cards pass round the ring; on "news" each reads its new one; on
  //      "compare" up come the app's three pages, side by side, and they look from one to another
  shot(C12, C13, (g, T) => { const t = now();
    const c = cam([[C12, fc(1240, 1.42)], [C13, fc(1240, 1.48)]], T);
    g.save(); room(g, c, t);
    const X = [1036, 1240, 1444], s = .8, kinds = ['lock', 'scale', 'row'];
    const tPass = tTrade - .02, flying = t > tPass && t < tPass + .4, swapped = t >= tPass + .4;
    const showing = t > tCompare - .05;
    X.forEach(x => footShadow(g, x, F, 240));
    const pages = [lockPage(t), scalePage(t), logPage([{}, {}, {}, { ghost: true }])];
    X.forEach((x, k) => {
      const lookAt = showing ? Math.sin((t - tCompare) * 7 + k * 2) * .9 : swapped && t < tNews + .35 ? 0 : (k === 0 ? .6 : k === 2 ? -.6 : 0);
      if (showing) {
        // the page comes up into both hands, its foot in the gloves
        const up = backOut(clamp((t - tCompare + .05) / .25), 1.6), w = 198, h = 168, foot = F - lerp(210, 300, up);
        browserWin(g, x - w / 2, foot - h, w, h, { content: pages[k], favicon: APPINK, tabs: 1 });
        bot(g, x, F, s, k, { t, dance: 0, eyes: { expr: 'open', lx: lookAt, ly: -.75 }, L: { to: clawdTo(x, F, s, 'L', x - 80, foot + 4), pose: 'grip' }, R: { to: clawdTo(x, F, s, 'R', x + 80, foot + 4), pose: 'grip' }, sing: true });
        return;
      }
      // a card held up overhead in both hands (none while they're in the air)
      const cy = F - 372, held = !flying, kind = kinds[swapped ? (k + 2) % 3 : k];
      if (held) findCard(g, x, cy, .85, kind, { rot: Math.sin(t * 2 + k) * .04, seed: k });
      const reading = swapped && t > tNews - .1 && t < tNews + .4;
      bot(g, x, F, s, k, { t, dance: held ? 0 : .5, eyes: { expr: reading ? 'wide' : 'open', lx: lookAt, ly: held ? -.8 : -.4 }, L: held ? { to: clawdTo(x, F, s, 'L', x - 48, cy + 70), pose: 'grip' } : 'up', R: held ? { to: clawdTo(x, F, s, 'R', x + 48, cy + 70), pose: 'grip' } : 'up', sing: true });
      if (reading) pops(g, x, cy - 110, 40, 5, { w: 5 });
    });
    // the cards in the air: one hop to the right each, the last one arcing back over the top
    if (flying) X.forEach((x, k) => { const u = easeInOut((t - tPass) / .4), to = X[(k + 1) % 3]; const fx = lerp(x, to, u), fy = F - 372 - Math.sin(u * Math.PI) * (k === 2 ? 240 : 90); findCard(g, fx, fy, .85, kinds[k], { rot: u * TAU * (k === 2 ? -1 : 1), seed: k }); });
    g.restore();
  }, { id: 'br-trade' });

  // ---- 10. we share the doubts and observations: close, the three under the corkboard; question marks
  //      and eyes rise from them and pin themselves up, and red string runs between them
  const QP = [[1100, 780], [1250, 735], [1400, 785]], EP = [[1150, 950], [1320, 925], [1420, 900]];
  shot(C13, C14, (g, T) => { const t = now();
    const c = cam([[C13, fc(1245, 1.34)], [C14, fc(1245, 1.4)]], T);
    g.save(); room(g, c, t);
    const X = [1092, 1245, 1398], s = .8;
    X.forEach(x => footShadow(g, x, F, 230));
    const tops = [];
    X.forEach((x, k) => { const k2 = bot(g, x, F, s, k, { t, eyes: { expr: 'wide', lx: (1245 - x) / 400, ly: t > tShare ? -1 : 0 }, L: t > tDoubts - .1 ? 'up' : 'hang', R: t > tObs - .1 ? 'wave' : 'hang', sing: true }); tops.push([x, k2.top - 50]); });
    const chain = [[1050, 664], QP[0], EP[0], QP[1], EP[1], QP[2], EP[2], [1432, 658]];
    for (let i = 0; i < chain.length - 1; i++) redString(g, chain[i], chain[i + 1], 26, ramp(t, tObs + .25 + i * .09, .12), 6200 + i);
    const fly = (from, to, t0, draw) => { const u = clamp((t - t0) / .32); if (t < t0) return; const e = easeOut(u, 2); draw(lerp(from[0], to[0], e), lerp(from[1], to[1], e) - Math.sin(u * Math.PI) * 50); if (u >= 1) pin(g, to[0], to[1] - 50, 1.1); };
    QP.forEach((q, k) => fly(tops[k], q, tDoubts + k * .06, (x, y) => qmark(g, x, y, 120, GOLD, { seed: 6210 + k })));
    EP.forEach((q, k) => fly(tops[k], q, tObs + k * .06, (x, y) => eyeMark(g, x, y, .76, { seed: 6220 + k, lx: Math.sin(t * 3 + k) })));
    g.restore();
  }, { id: 'br-cork' });

  // ---- 11. some calls need you; we'll talk them through: the candlestick telephone rings on the desk;
  //      Guess lifts the receiver off its hook to his ear, listens, then turns and points at you: it's
  //      for you. Clawd leans in with a thumbs-up: we'll talk them through
  shot(C14, C15, (g, T) => { const t = now();
    const c = cam([[C14, fc(1360, 1.3)], [tYou + .1, fc(1380, 1.4)], [C15, fc(1390, 1.46)]], T);
    g.save(); room(g, c, t);
    const PX = 1180, GX2 = 1400, KX2 = 1580, gs = .92, ps = .64;
    const ringing = t < tNeed + .05 ? 1 : 0, lean = ease(t, tWell - .1, .5);
    const up = t > tNeed - .05, toYou = t > tYou - .05, thrust = kick(t, tYou, .2);
    const reach = ease(t, tCalls, .3), lift = ease(t, tNeed - .05, .24);
    // Clawd skips in from the right edge on "We'll" and leans in with a thumbs-up
    const kIn = slideIn(t, tWell - .24, tWell + .2, 1, .34, 620), kX = KX2 + kIn;
    if (t > tWell - .24) {
      footShadow(g, kX, F, 230);
      clawd(g, kX, F, .76, { t, walk: kIn > 2 ? t * 4 : undefined, face: -.2, lean: -lean * .08, eyes: { expr: t > tThrough ? 'happy' : 'open', lx: -.3, ly: 0 }, L: 'hips', R: lean > .5 ? { to: [.05, -.75], pose: 'thumb' } : 'hips', sing: lean > .5 ? true : 0 });
    }
    footShadow(g, PX, F, 200);
    const stand = candlestick(g, PX, F, ps, { t, ring: ringing, off: up });
    if (ringing) ringMarks(g, PX, F - 330, 96, t, 1);
    footShadow(g, GX2, F, 210);
    // Guess's left hand: to the hook, then the receiver up to his ear; his right points at you on "you"
    const hookTo = [1.12, -.4], ear = [-.05, -.9], pointing = toYou && t < tWell - .02;
    const Lh = up ? { to: [lerp(hookTo[0], ear[0], lift), lerp(hookTo[1], ear[1], lift)], pose: 'grip' } : (reach > 0 ? { to: [lerp(.45, hookTo[0], reach), lerp(.35, hookTo[1], reach)], pose: 'open' } : 'hips');
    const Rh = pointing ? { to: [-.1, lerp(.2, -.3, ease(t, tYou - .05, .2))], pose: 'fist' } : 'hips';
    const hold = {};
    if (up) hold.L = (g, x, y, a, s) => {
      const k = ps * lerp(1, 1.15, lift), ang = lerp(Math.PI / 2 - .08, -1.24, lift);
      const end = [x - Math.cos(ang) * 74 * k, y - Math.sin(ang) * 74 * k];
      stroke(g, spline([end, [(end[0] + stand.cord[0]) / 2 - 10, Math.max(end[1], stand.cord[1]) + 30], stand.cord], false, 10), { w: 6, seed: 6451, taper: false, raw: true });
      receiver(g, x, y, ang, k); glove(g, x, y, a, 24 * s, 'grip', { flip: true, seed: 6450 });
    };
    if (pointing) hold.R = (g, x, y, a, s) => pointAtYou(g, x, y, s * (1.08 + thrust * .16), { from: .9 });
    guess(g, GX2, F, gs, { t, face: toYou ? 0 : -.5, lean: toYou ? -lean * .04 : 0, eyes: { expr: toYou ? 'wide' : 'open', lx: toYou ? 0 : -.7, ly: toYou ? 0 : (up ? -.1 : .3) }, brow: toYou ? 1 : .6, L: Lh, R: Rh, sing: toYou ? true : 0, smile: .7, hold });
    if (toYou) sparkle(g, GX2, F - 420, 160, t, 5, GOLD, 6460);
    g.restore();
  }, { id: 'br-call' });

  // ---- 12. we ask for fresh interpretations: Press brings up the fainted comma on a velvet cushion
  shot(C15, C15b, (g, T) => { const t = now();
    const c = cam([[C15, fc(920, 1.4)], [C15b, fc(920, 1.56)]], T);
    g.save(); room(g, c, t);
    const PX = 920, s = 1.1, raise = ease(t, tAsk - .1, .4);
    footShadow(g, PX, F, 260);
    const hand = { to: [lerp(-.1, -.2, raise), lerp(-.55, -1.5, raise)], pose: 'open' };
    const info = press(g, PX, F, s, { t, dance: .3, eyes: { expr: 'open', lx: 0, ly: lerp(.3, -.4, raise) }, L: hand, R: hand, sing: true, smile: .9 });
    const hx = (info.hands.L.x + info.hands.R.x) / 2, hy = Math.min(info.hands.L.y, info.hands.R.y) - 10;
    cushion(g, hx, hy, 300);
    drawComma(g, hx + 40, hy - 96, 124, t, false);
    g.restore();
  }, { id: 'br-comma-wide' });

  //      close, filling the frame: on the wall, the new screenshot of the app's chat, big: Pat's message,
  //      and in its line of words the comma's empty place, a comma-shaped hole. Below it, on the cushion,
  //      the comma itself wakes, sits up, looks up at its place and throws up its arms; then turns to
  //      you: "?". On "interpretations" your hand comes in from the side, palm up; the comma hops onto
  //      it, looks up at you, and the iris closes on it. Whether that change matters is your call.
  const tSit = tFresh2 + .12, tLook = tSit + .18, tArms = tLook + .3, tToUs = tArms + .3;
  const tHop = tInterp + .85, tLand2 = tHop + .32, tShut = END - 1.1;
  shot(C15b, END, (g, T) => { const t = now();
    const shut = easeInOut(ramp(T, tShut, END - tShut));
    // the place behind, close: the striped wall, the desk top at the floor line, the near desk below
    g.save(); place(g, office(), { ...fc(930 + (T - C15b) * 3, 2.2) }); g.restore();
    const CU = [540, 1052], HC = 168;
    const palmIn = easeOut(ramp(t, tInterp, .38), 3), cradle = Math.sin(clamp((t - tLand2) / .35) * Math.PI) * 10;
    const PALM = [lerp(1500, 860, palmIn), 1004 + cradle];
    // the screenshot, pinned up, with the comma's place glowing while the comma looks at it
    const looking = t > tLook && t < tToUs + .2, glow = looking ? .5 + .5 * Math.sin((t - tLook) * 14) : 0;
    const gap = chatCloseUp(g, 540, 578, t, { glow });
    pin(g, 110, 344, 1.5); pin(g, 972, 340, 1.5);
    // the cushion on the desk, and the comma
    const bob = Math.sin(beatPos(t) * Math.PI) * 4;
    footShadow(g, CU[0], 1104, 420, .4);
    cushion(g, CU[0], CU[1] + bob, 410);
    const onPalm = t > tLand2, hopping = t > tHop && !onPalm;
    const seat = [CU[0] + 8, CU[1] + bob - 204], perch = [PALM[0] + 26, PALM[1] - 150];
    let head = seat;
    if (t < tSit) drawComma(g, CU[0] + 62, CU[1] + bob - 134, HC, t, t > tFresh2);
    else {
      let pose = 'stand', lx = 0, sq = 0, ly = 0;
      if (t < tLook) { const u = clamp((t - tSit) / .18); sq = Math.sin(u * Math.PI) * .25; }
      else if (t < tToUs) { lx = .4; ly = -1; pose = t > tArms ? 'up' : 'stand'; sq = kick(t, tArms, .12) * .2; }
      else if (t < tHop) { lx = t > tInterp + .4 ? 1 : 0; }
      if (hopping) { const u = (t - tHop) / (tLand2 - tHop); head = [lerp(seat[0], perch[0], u), lerp(seat[1], perch[1], u) - Math.sin(u * Math.PI) * 150]; pose = 'up'; }
      if (onPalm) { head = perch; pose = t < tLand2 + .45 ? 'up' : 'stand'; sq = kick(t, tLand2, .12) * .3; const back = t > tLand2 + .8 && t < tLand2 + 1.15; lx = back ? -.5 : 0; ly = back ? -1 : 0; }
      g.save(); g.translate(head[0], head[1] + 84 * HC / 100); g.scale(1 + sq * .5, 1 - sq); g.translate(-head[0], -(head[1] + 84 * HC / 100));
      comma(g, head[0], head[1], HC, { t, pose, lx });
      g.restore();
      // its gaze up to its place: a dotted line from its eyes to the hole while it looks
      if (looking) { const p = ramp(t, tLook, .15); g.save(); g.setLineDash([6, 10]); g.strokeStyle = C(GOLD); g.lineWidth = 4; g.globalAlpha *= .8; g.beginPath(); g.moveTo(head[0] + 6, head[1] - 46); g.lineTo(lerp(head[0] + 6, gap[0], p), lerp(head[1] - 46, gap[1] + 40, p)); g.stroke(); g.restore(); }
    }
    if (t > tToUs) { const p = pop(t, tToUs, .35), qb = Math.sin((t - tToUs) * 2.4) * 8; g.save(); g.translate(head[0] + (onPalm || hopping ? -126 : 120), head[1] - (onPalm || hopping ? 60 : 70) + qb); g.scale(p, p); qmark(g, 0, 0, 104, GOLD); g.restore(); }
    // your hand, palm up, in from the right at the cushion's height
    if (t > tInterp) yourPalm(g, PALM[0], PALM[1], 1.2, 1, { cup: onPalm ? .5 : 0 });
    // the near desk under the lyric: the inkwell and a pencil low in the corners
    deskThing(g, 'inkwell', 120, 1760, 0, .7, 2920); deskThing(g, 'pencil', 900, 1820, -.3, .75, 2930);
    // the iris closes on the comma in your hand, into the breakdown
    if (shut > 0) iris(g, lerp(W / 2, PALM[0] + 10, shut), lerp(1000, PALM[1] - 120, shut), Math.hypot(W, H) * .62 * (1 - shut));
  }, { id: 'br-comma' });
}

// The new screenshot of the app's chat, seen close: a photo pinned up, the app's pink header across
// its top, Pat's face, and Pat's message in a bubble, big. In its line of words, where the comma was,
// the comma's empty place: a comma-shaped hole, dashed round, glowing gold by `glow`. Returns the hole's
// middle.
function chatCloseUp(g, x, y, t, o = {}) {
  const w = 960, h = 500, rot = -.015;
  g.save(); g.translate(x, y); g.rotate(rot);
  g.save(); g.globalAlpha *= .4; g.fillStyle = '#1a0c06'; g.filter = 'blur(12px)'; g.fillRect(-w / 2 + 16, -h / 2 + 22, w, h); g.restore();
  shape(g, rrect(-w / 2, -h / 2, w, h, 8), { fill: '#fbf6ea', shade: '#d8ccb4', form: 'block', k: .4, w: 6, seed: 7720 });
  const px = -w / 2 + 32, py = -h / 2 + 32, pw = w - 64, ph = h - 92;
  g.fillStyle = C('#fdf5f0'); g.fillRect(px, py, pw, ph);
  appHeader(g, px, py, pw, 1.8);
  const top = py + 64 * 1.8;
  avatar(g, px + 76, top + 112, 52, 'cat', { t });
  // the bubble
  const bx = px + 150, by = top + 22, bw = pw - 176, bh = ph - 64 * 1.8 - 40;
  shape(g, [[bx + 10, by + 70], [bx - 34, by + 92], [bx + 12, by + 112]], { fill: '#dff0e8', w: 5, seed: 7721, form: false });
  shape(g, rrect(bx, by, bw, bh, 40), { fill: '#dff0e8', shade: '#bcd8cc', form: 'block', k: .4, w: 6, seed: 7722 });
  // the words, as squiggles, and the comma's place between the first two
  const ly = by + bh * .38, word = (x0, x1, yy, seed) => { const P = []; for (let i = 0; i <= 26; i++) { const u = i / 26; P.push([lerp(x0, x1, u), yy + Math.sin(u * (x1 - x0) / 26 + seed) * 11 - (i % 7 === 3 ? 12 : 0)]); } stroke(g, P, { w: 13, seed, taper: true, tipMin: .5, raw: true }); };
  word(bx + 46, bx + 300, ly, 7730);
  const gx = bx + 352, gy = ly + 4, k = 3.3;
  word(bx + 412, bx + bw - 46, ly, 7731);
  word(bx + 46, bx + bw * .62, ly + bh * .36, 7732);
  // the hole: a comma's shape, empty, dashed round
  const dotP = ellipse(gx, gy - 3 * k, 7.5 * k, 7.5 * k, 0, 30);
  const tailP = spline([[gx + 3 * k, gy - 2 * k], [gx + 7 * k, gy + 4 * k], [gx + 3 * k, gy + 13 * k], [gx - 5 * k, gy + 20 * k], [gx - 1 * k, gy + 11 * k], [gx - 2 * k, gy + 3 * k]], true, 6);
  const glow = clamp(o.glow ?? 0);
  if (glow > 0) { g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha *= .55 * glow; g.fillStyle = C('#ffd46a'); g.filter = 'blur(10px)'; g.beginPath(); g.arc(gx, gy + 10 * k, 15 * k, 0, TAU); g.fill(); g.restore(); }
  for (const P of [dotP, tailP]) { g.save(); g.fillStyle = C(glow > .5 ? '#f6e3a8' : '#c8e0d6'); pathOf(g, P, true); g.fill(); g.setLineDash([9, 7]); g.lineWidth = 5; g.strokeStyle = C(glow > .5 ? GOLD_SH : '#4a6a5e'); g.stroke(); g.restore(); }
  g.restore();
  const c = Math.cos(rot), sn = Math.sin(rot);
  return [x + gx * c - gy * sn, y + gx * sn + gy * c];
}

// The fainted comma from verse 1, big enough to read as a comma with a face: its round head up and to
// the right, its tail curling down to the left, reclining on the cushion as if swooned. `hope` opens
// one eye.
function drawComma(g, x, y, h, t, hope) {
  g.save(); g.translate(x, y);
  if (hope) { g.rotate(.62); comma(g, 0, 0, h, { t, pose: 'hope', lx: -.5 }); }
  else { g.rotate(.85 + 1.1); comma(g, 0, 0, h, { t, pose: 'swoon', p: 1 }); }
  g.restore();
}

