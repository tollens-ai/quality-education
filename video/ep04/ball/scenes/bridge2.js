// Bridge, second half.
//  "One tests the cart, then hits restart:"  The peach bot fills a shop's cart, then pulls RESTART.
//  "Do orders still match what the customer spent?"  The customer's receipt against the shop's
//     order, on the balance: they match. A finding worth reporting too.
//  "We trade the news, compare the views;"  The bots as newsboys: EXTRA! CHAT LEAK, ORDERS MATCH,
//     OFFLINE SETS LOST; they swap papers and hold their screens side by side.
//  "We share the doubts and observations."  Question marks and exclamation marks pinned up.
//  "Some calls need you. We'll talk them through;"  The telephone rings; Guess holds the receiver out
//     to us.
//  "We ask for fresh interpretations."  The crew holds up a question only the app's owner can answer:
//     with no internet at the gym, should it save for later, or warn that it hasn't saved? Your call.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, easeOut } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED, WHITE, MINT, PEACH, WOOD, GREY } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { office } from '../places.js';
import { clawd } from '../clawd.js';
import { guess, press, stress, check } from '../crew.js';
import { person } from '../people.js';
import { freshBot, browser, chatBubble, scale, lever, newspaper, candlestick, receiver, miniBrowser } from '../props-bridge.js';
import { shape, rrect, ellipse, stroke, dot, glove } from '../ink.js';
import { label, DISPLAY, PATTER, SCRIPT, fitSize } from '../type.js';
import { pops } from '../rig.js';
import { at, ramp, pop, ease, kick, place, cam, burst, sparkle, bubble } from '../common.js';
import { OF, OC, cork } from './bridge.js';

const ITEMS = [['Apples', '£1.00'], ['Bread', '£2.50']];
function shopPage(g, px, py, pw, ph, n, total) {
  label(g, "PAT'S GROCER", px + pw / 2, py + 34, 34, { font: DISPLAY, col: CORAL });
  for (let i = 0; i < n; i++) { label(g, ITEMS[i][0], px + 30, py + 100 + i * 56, 34, { font: PATTER, align: 'left' }); label(g, ITEMS[i][1], px + pw - 30, py + 100 + i * 56, 34, { font: PATTER, align: 'right' }); }
  stroke(g, [[px + 24, py + 220], [px + pw - 24, py + 220]], { w: 4, seed: 9701, taper: false });
  label(g, 'TOTAL', px + 30, py + 260, 38, { font: PATTER, align: 'left', col: PLUM }); label(g, total, px + pw - 30, py + 260, 40, { font: DISPLAY, align: 'right' });
}

export function register() {
  const B7 = 'One tests the cart', B8 = 'Do orders still', B9 = 'We trade the news', B10 = 'We share the doubts', B11 = 'Some calls need', B12 = 'We ask for fresh';
  const t0 = at(B7, 'One') - .12;
  const tCart = at(B7, 'cart'), tHits = at(B7, 'hits'), tRestart = at(B7, 'restart');
  const tOrders = at(B8, 'orders'), tMatch = at(B8, 'match'), tCustomer = at(B8, 'customer'), tSpent = at(B8, 'spent');
  const tTrade = at(B9, 'trade'), tNews = at(B9, 'news'), tCompare = at(B9, 'compare'), tViews = at(B9, 'views');
  const tShare = at(B10, 'share'), tDoubts = at(B10, 'doubts'), tObs = at(B10, 'observations');
  const tCalls = at(B11, 'calls'), tNeed = at(B11, 'need'), tYou = at(B11, 'you'), tTalk = at(B11, 'talk');
  const tAsk = at(B12, 'ask'), tFreshI = at(B12, 'fresh'), tInterp = at(B12, 'interpretations'), b12End = wordsOf(B12).at(-1).e;
  const breakdown = Math.min(at('A check applies', 'A') - .12, b12End + 1.2);

  // ---- 7-8. the cart, restart, and the orders still match
  shot(t0, tTrade - .15, (g, t) => {
    const c = cam([[t0, OC(540, 1.0)], [tSpent + .3, OC(560, 1.04)]], t);
    g.save(); place(g, office(), c); cork(g, t);
    const off = t > tRestart - .05 && t < tRestart + .55;
    const n = Math.min(2, Math.floor(clamp((t - t0) / (tCart - t0 + .3)) * 2.99));
    const pulled = ease(t, tRestart - .25, .2) * (1 - ease(t, tRestart + .6, .3));
    const left = t > tOrders - .3;
    const bx = left ? lerp(540, 300, ease(t, tOrders - .3, .4)) : 540, bw = left ? lerp(720, 520, ease(t, tOrders - .3, .4)) : 720;
    browser(g, bx, 980, bw, 520, 'SHOP', (g, px, py, pw, ph) => {
      if (off) { g.fillStyle = INK; g.fillRect(px, py, pw, ph); const a = (t - tRestart) * 12; g.strokeStyle = CREAM; g.lineWidth = 12; g.beginPath(); g.arc(px + pw / 2, py + ph / 2, 60, a, a + 4.5); g.stroke(); return; }
      shopPage(g, px, py, pw, ph, t > tRestart ? 2 : n, t > tRestart || n === 2 ? '£3.50' : n ? '£1.00' : '£0.00');
      if (t > tRestart + .55 && !left) label(g, 'BACK UP!', px + pw / 2, py + ph - 40, 40, { font: DISPLAY, col: TEAL });
    }, { url: 'pats-grocer.shop/cart', seed: 3 });
    if (!left) {
      const lp = lever(g, 880, OF, .9, pulled);
      freshBot(g, 700, OF, .66, 1, { t, eyes: { expr: off ? 'wide' : 'happy', lx: .6 }, R: pulled > .1 ? { to: [(lp[0] - 700 - 46) / 66, (lp[1] - (OF - 92 - 30 + 7)) / 66], pose: 'grip' } : 'up', L: 'hips' });
    } else {
      // the customer, her receipt on the scale against the shop's order
      const eq = t > tMatch ? 0 : Math.sin(t * 5) * .4;
      scale(g, 760, OF, .62, eq,
        (g, x, y) => { shape(g, rrect(x - 60, y - 150, 120, 150, 4), { fill: WHITE, w: 4, seed: 9710 }); label(g, 'RECEIPT', x, y - 125, 22, { font: PATTER, col: PLUM }); label(g, '£3.50', x, y - 60, 40, { font: DISPLAY }); },
        (g, x, y) => { shape(g, rrect(x - 60, y - 150, 120, 150, 4), { fill: '#e9efe2', w: 4, seed: 9711 }); label(g, 'ORDER', x, y - 125, 22, { font: PATTER, col: TEAL }); label(g, '£3.50', x, y - 60, 40, { font: DISPLAY }); });
      person(g, 330, OF + 40, .8, { t, kind: 'customer', eyes: { expr: t > tSpent ? 'happy' : 'open', lx: .6 } });
      if (t > tMatch) { const p = pop(t, tMatch + .1, .3); g.save(); g.translate(760, 800); g.scale(p, p); shape(g, rrect(-150, -46, 300, 92, 20), { fill: GREEN, w: 6, seed: 9712 }); label(g, 'MATCH!', 0, 3, 54, { font: DISPLAY, col: WHITE }); g.restore(); }
      freshBot(g, 1010, OF, .55, 1, { t, eyes: { expr: 'happy' }, L: 'up', R: 'hips' });
    }
    g.restore();
  }, { id: 'br-cart' });

  // ---- 9-10. trade the news, compare the views; pin up the doubts and observations
  shot(tTrade - .15, tCalls - .3, (g, t) => {
    const c = cam([[tTrade - .15, OC(540, .92)], [tShare - .2, OC(540, .94)], [tObs + .4, OC(760, 1.1, 1700)]], t);
    g.save(); place(g, office(), c);
    const pins = [];
    if (t > tDoubts - .2) pins.push(['DOUBT', '?', 880, 820, .08, '#fbf6e8']);
    if (t > tDoubts + .1) pins.push(['DOUBT', '?', 600, 830, -.1, '#fbf6e8']);
    if (t > tObs - .2) pins.push(['SEEN', '!', 960, 640, -.05, '#bfe3d6']);
    cork(g, t, [['CASE 3', 'CHAT', 960, 820, .04, '#f7c6d0'], ['CASE 4', 'SHOP', 700, 820, -.04, '#bfe3d6']].filter((_, i) => t > tShare - .2).concat(pins));
    const compare = t > tCompare - .1;
    const swap = clamp((t - tNews) / .5);
    const heads = [['CHAT LEAK', 'ORDERS MATCH', 'OFFLINE SETS LOST']];
    const xs = [210, 540, 870];
    for (let k = 0; k < 3; k++) {
      const x = xs[k];
      const head = ['CHAT LEAK', 'ORDERS MATCH', 'SETS LOST'][(k + (swap >= 1 ? 1 : 0)) % 3];
      if (k < 2) freshBot(g, x, OF, .7, k === 0 ? 0 : 1, { t, eyes: { expr: 'happy' }, L: 'up', R: 'up', tag: false, sing: true });
      else guess(g, x, OF, .7, { t, L: 'up', R: 'up', eyes: { expr: 'happy' }, sing: true, bang: 1 });
      const hy = k < 2 ? OF - 330 : OF - 420;
      if (!compare) newspaper(g, x + Math.sin(swap * Math.PI) * (k === 1 ? -110 : 110), hy, .9, head, Math.sin(t * 6 + k) * .05);
      else browser(g, x, hy - 30, 300, 240, ['CHAT', 'SHOP', 'GYM'][k], (g, px, py, pw, ph) => { label(g, ['LEAK!', 'MATCH', 'LOST'][k], px + pw / 2, py + ph / 2, 52, { font: DISPLAY, col: [RED, GREEN, RED][k] }); }, { seed: 10 + k });
    }
    if (t > tShare - .1) { // the doubts and observations float up to the board
      for (let i = 0; i < 6; i++) { const p = clamp((t - tShare - i * .15) / .7); if (p <= 0 || p >= 1) continue; label(g, i % 2 ? '!' : '?', lerp(xs[i % 3], 800 + (i - 3) * 60, p), lerp(OF - 500, 760, p), 90, { font: DISPLAY, col: i % 2 ? TEAL : ROSE, ow: .12 }); }
    }
    g.restore();
  }, { id: 'br-news' });

  // ---- 11-12. the telephone: some calls need you; fresh interpretations
  shot(tCalls - .3, breakdown, (g, t) => {
    const c = cam([[tCalls - .3, OC(540, 1.0)], [tYou, OC(540, 1.08)], [tAsk, OC(540, 1.12)], [b12End, OC(540, 1.2)]], t);
    g.save(); place(g, office(), c); cork(g, t, [['CASE 3', 'CHAT', 960, 820, .04, '#f7c6d0'], ['CASE 4', 'SHOP', 700, 820, -.04, '#bfe3d6']]);
    const ringing = t < tNeed + .1;
    // the desk with the telephone
    shape(g, rrect(150, OF - 300, 780, 40, 8), { fill: '#7a4a2c', w: 7, seed: 9801 });
    for (const x of [190, 890]) shape(g, rrect(x - 18, OF - 262, 36, 262, 6), { fill: '#6b3f25', w: 6, seed: 9802 + x });
    candlestick(g, 300, OF - 300, .9, ringing ? 1 : 0, t);
    if (ringing) { label(g, 'RING!', 300 + Math.sin(t * 40) * 6, OF - 700, 64, { font: DISPLAY, col: RED, ow: .2 }); pops(g, 300, OF - 560, 90, 5); }
    const toUs = t > tNeed - .2;
    // Guess holds the receiver out to us (the camera), cord sagging back to the phone
    const rx = toUs ? 430 : 330, ry = toUs ? 1330 : OF - 560, rs = toUs ? 1.5 : .9;
    stroke(g, [[300, OF - 330], [400, OF - 200], [rx, ry + 60 * rs]], { w: 6, seed: 9810 });
    guess(g, 640, OF, .85, { t, L: toUs ? { to: [-1.4, .55], pose: 'grip' } : 'hips', R: 'hips', eyes: { lx: toUs ? -.1 : -.6, ly: toUs ? .3 : 0 }, sing: true, brow: .3 });
    receiver(g, rx, ry, rs, toUs ? -.5 : 0);
    // the crew leans in; on "fresh interpretations" they hold up the question and wait
    const ask = t > tAsk - .3;
    press(g, 150, OF, .6, { t, L: 'up', R: 'hips', eyes: { expr: 'open', ly: .4 } });
    const pick = Math.floor((t - tAsk) * 1.1) % 2;
    clawd(g, 900, OF, .66, { t, L: ask ? { to: [pick ? .3 : .9, -1.1], pose: 'point' } : 'hips', R: ask ? 'hips' : 'chin', eyes: { expr: ask ? 'open' : 'worried', lx: ask ? (pick ? .2 : -.8) : 0, ly: -.5 }, sing: true, face: ask ? (pick ? 0 : -.5) : 0 });
    if (ask) {
      // the question only the person who owns the app can answer: what should it do with no internet?
      const p = pop(t, tAsk - .3, .4);
      g.save(); g.translate(560, 760); g.scale(p, p); g.rotate(Math.sin(t * 2) * .015);
      shape(g, rrect(-360, -150, 720, 300, 20), { fill: CREAM, w: 8, seed: 9820 });
      label(g, 'NO INTERNET AT THE GYM:', 0, -104, 42, { font: PATTER, col: PLUM });
      const pick = Math.floor((t - tAsk) * 1.1) % 2;   // Clawd points at each in turn while they wait
      [['A', 'SAVE IT', 'FOR LATER', TEAL], ['B', 'WARN:', 'NOT SAVED', CORAL]].forEach(([k, a, b, col], i) => {
        const x = i ? 175 : -175, lit = t > tFreshI && pick === i;
        shape(g, rrect(x - 160, -60, 320, 170, 16), { fill: lit ? '#fff3c4' : WHITE, w: lit ? 8 : 5, seed: 9821 + i });
        label(g, k, x - 118, -22, 46, { font: DISPLAY, col });
        label(g, a, x + 20, -10, 44, { font: DISPLAY, col: INK });
        label(g, b, x + 10, 50, 44, { font: DISPLAY, col: INK });
      });
      g.restore();
      if (t > tInterp) { const q = pop(t, tInterp, .35); g.save(); g.translate(560, 1000); g.scale(q, q); shape(g, rrect(-170, -40, 340, 80, 40), { fill: GOLD, w: 6, seed: 9830 }); label(g, 'YOUR CALL', 0, 3, 46, { font: DISPLAY }); g.restore(); }
      for (let i = 0; i < 3; i++) label(g, '?', 230 + i * 300, 560 - Math.abs(Math.sin(t * 3 + i)) * 30, 80, { font: DISPLAY, col: ROSE, ow: .12 });
    }
    g.restore();
  }, { id: 'br-call' });
  irisJoin(breakdown - .05, { close: .35, open: .4, x: 540, y: 1100 });
}
