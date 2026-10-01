// Bridge, first half: the crew's office. How to brief a fresh crew of testing bots.
//  "A fresh bot crew? Here's what to do:"  A crate marked FRESH BOT CREW; three new bots spring out;
//     Guess turns to us: this part is for you.
//  "Real browsers, a playbook, and users in mind."  Each is handed a real browser, the playbook, and
//     a thought of the people who'll use the app (Mabel, a shopper).
//  "The goals you name will guide the game;"  A board-game path with signposts: KEEP MY SETS,
//     PRIVATE CHATS, RIGHT TOTALS. The bots hop along it.
//  "Your oracles help them to judge what they find."  A balance: Mabel's own notebook (an oracle)
//     against the app's log. They don't match, and the bot can tell.
//  "One probes the chat—just me and Pat:"  A chat meant for two: ME and PAT.
//  "Does Sam's new account show the text Pat just sent?"  Sam's brand-new account; Pat's message
//     turns up on Sam's screen, and the bot's flag goes up.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, easeOut, backOut } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED, WHITE, MINT, PEACH, WOOD, WOOD_SH, GREY } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { office } from '../places.js';
import { clawd } from '../clawd.js';
import { guess, press, stress, check } from '../crew.js';
import { mabel, person } from '../people.js';
import { freshBot, browser, chatBubble, playbook, miniBrowser, signpost, scale } from '../props-bridge.js';
import { shape, rrect, ellipse, stroke, dot, spline } from '../ink.js';
import { label, DISPLAY, PATTER, SCRIPT, fitSize } from '../type.js';
import { at, ramp, pop, ease, kick, place, cam, burst, sparkle, confetti, floorCam, bubble, speedLines } from '../common.js';
import { cardText } from './verse1.js';

export const OF = 1420;
export const OC = (x, z, atY = 1600) => floorCam(x, z * 1.15, OF, atY);
// The corkboard's pinned findings (world coordinates of the painted board: 555..1065 × 605..995).
export function cork(g, t, extra = []) {
  const notes = [['CASE 1', 'SUMS', 600, 640, -.06, '#fbf6e8'], ['CASE 2', 'GYM', 790, 660, .05, '#f7c6d0'], ...extra];
  for (const [a, b, x, y, r, col] of notes) {
    g.save(); g.translate(x + 70, y + 60); g.rotate(r);
    shape(g, rrect(-70, -60, 140, 120, 4), { fill: col, w: 4, seed: 9600 + x });
    label(g, a, 0, -24, 24, { font: PATTER, col: PLUM }); label(g, b, 0, 12, 34, { font: DISPLAY });
    g.restore(); dot(g, x + 70, y + 10, 8, RED);
  }
  stroke(g, [[670, 650], [860, 670], [990, 760]], { w: 3, color: RED, seed: 9610, raw: true, taper: false });
}

export function register() {
  const B1 = 'A fresh bot crew', B2 = 'Real browsers', B3 = 'The goals you name', B4 = 'Your oracles', B5 = 'One probes the chat', B6 = "Does Sam's new";
  const t0 = at(B1, 'A') - .12;
  const tFresh = at(B1, 'fresh'), tCrew = at(B1, 'crew'), tHere = at(B1, "Here's"), tDo = at(B1, 'do');
  const tBrowsers = at(B2, 'browsers'), tPlaybook = at(B2, 'playbook'), tUsers = at(B2, 'users'), tMind = at(B2, 'mind');
  const tGoals = at(B3, 'goals'), tName = at(B3, 'name'), tGuide = at(B3, 'guide'), tGame = at(B3, 'game');
  const tOracles = at(B4, 'oracles'), tJudge = at(B4, 'judge'), tFind = at(B4, 'find');
  const tProbes = at(B5, 'probes'), tChat = at(B5, 'chat'), tMe = at(B5, 'me'), tPat = at(B5, 'Pat');
  const tSam = at(B6, "Sam's"), tNew = at(B6, 'new'), tShow = at(B6, 'show'), tText = at(B6, 'text'), tSent = at(B6, 'sent');
  const next = at('One tests the cart', 'One') - .12;

  // ---- 1-2. the crate, the fresh crew, their kit
  shot(t0, tGoals - .3, (g, t) => {
    const c = cam([[t0, OC(540, 1.0)], [tHere, OC(560, 1.05)], [tMind + .3, OC(560, 1.02)]], t);
    g.save(); place(g, office(), c); cork(g, t);
    // the crate
    const lid = ease(t, tFresh - .1, .25);
    shape(g, rrect(300, OF - 230, 480, 230, 10), { fill: WOOD, shade: WOOD_SH, shadeOff: [-10, -10], w: 8, seed: 9201 });
    for (let i = 0; i < 3; i++) stroke(g, [[310, OF - 230 + i * 76 + 38], [770, OF - 230 + i * 76 + 38]], { w: 4, color: WOOD_SH, seed: 9202 + i, taper: false });
    label(g, 'FRESH BOT CREW', 540, OF - 118, 46, { font: PATTER, col: CREAM, ow: .18 });
    // the three pop up on springs
    const kit = [tBrowsers, tPlaybook, tUsers];
    for (let k = 0; k < 3; k++) {
      const up = pop(t, tCrew - .15 + k * .12, .4);
      if (up <= 0) continue;
      const bx = 380 + k * 160, by = OF - 220 - up * 150;
      // spring
      const P = []; for (let i = 0; i <= 20; i++) P.push([bx + Math.sin(i * 1.6) * 16, OF - 220 - i / 20 * up * 150]);
      stroke(g, P, { w: 5, color: GREY, seed: 9210 + k, raw: true, taper: false });
      const got = t > kit[k] - .1;
      freshBot(g, bx, by, .72, k, { t, eyes: { expr: got ? 'happy' : 'wide', lx: -.3 }, light: got,
        R: got ? { to: [.4, -.9], pose: 'grip' } : { to: [.5, -.8], pose: 'wave' },
        hold: got ? { R: (g, x, y, s) => k === 0 ? miniBrowser(g, x + 10, y - 60, .7, -.1) : k === 1 ? playbook(g, x + 10, y - 50, .8, .2) : null } : {} });
      if (k === 2 && got) { // users in mind: a thought of Mabel and a shopper
        const p = pop(t, tUsers - .05, .35);
        g.save(); g.translate(bx + 70, by - 330); g.scale(p, p);
        bubble(g, 0, 0, 330, 210, -80, 170);
        mabel(g, -70, 90, .28, { t, eyes: { expr: 'happy' }, L: 'hang', R: 'hang' });
        person(g, 80, 90, .5, { t, kind: 'customer', eyes: { expr: 'happy' } });
        g.restore();
      }
    }
    if (lid < 1) shape(g, rrect(290, OF - 250 - lid * 300, 500, 30, 6), { fill: WOOD, w: 6, seed: 9205 });
    // Guess presents, then turns to the camera on "Here's what to do"
    const toUs = t > tHere - .1;
    guess(g, 170, OF, .78, { t, L: toUs ? { to: [.4, -1.25], pose: 'point', ang: -1.8 } : 'present', R: 'hips', eyes: { lx: toUs ? 0 : .6, ly: toUs ? .2 : 0 }, face: toUs ? 0 : .5, sing: true, brow: toUs ? 1 : .4 });
    if (toUs && t < tBrowsers) label(g, 'YOU!', 330, 820, 60, { font: DISPLAY, col: GOLD, ow: .2 });
    clawd(g, 930, OF, .6, { t, L: 'up', R: 'hips', eyes: { expr: 'happy', lx: -.6 } });
    g.restore();
  }, { id: 'br-crate' });

  // ---- 3. goals guide the game: a board-game path with signposts
  shot(tGoals - .3, tOracles - .15, (g, t) => {
    const c = cam([[tGoals - .3, OC(560, 1.0)], [tGame + .3, OC(580, 1.05)]], t);
    g.save(); place(g, office(), c); cork(g, t);
    // the board on the floor: a winding path of squares
    const path = []; for (let i = 0; i < 12; i++) { const u = i / 11; path.push([120 + u * 860, OF + 90 - Math.sin(u * Math.PI * 1.5) * 60 - u * 120]); }
    shape(g, spline([[60, OF + 170], [1020, OF + 30], [1040, OF - 120], [80, OF - 30]], true, 4), { fill: '#e9d9ad', w: 6, seed: 9301 });
    path.forEach(([x, y], i) => shape(g, ellipse(x, y, 42, 22), { fill: [CORAL, TEAL, GOLD, ROSE][i % 4], w: 4, seed: 9302 + i }));
    signpost(g, 760, OF - 20, 1.0, [['KEEP MY SETS', 1, CREAM, pop(t, tGoals, .3)], ['PRIVATE CHATS', -1, CREAM, pop(t, tGoals + .15, .3)], ['RIGHT TOTALS', 1, CREAM, pop(t, tName, .3)]], t);
    // the three bots hop along the squares on the beat from "guide"
    for (let k = 0; k < 3; k++) {
      const hopT = Math.max(0, t - tGuide + k * .1), step = Math.floor(hopT * 4.2), f = (hopT * 4.2) % 1;
      const i0 = clamp(2 + step - k * 2, 0, 11), i1 = clamp(i0 + 1, 0, 11);
      const [x0, y0] = path[i0], [x1, y1] = path[i1];
      const moving = t > tGuide - k * .1 && i0 < 11;
      const x = moving ? lerp(x0, x1, f) : x0, y = (moving ? lerp(y0, y1, f) : y0) - (moving ? Math.sin(f * Math.PI) * 50 : 0);
      freshBot(g, x, y + 10, .55, k, { t, eyes: { expr: 'happy' }, tag: false, dance: .3 });
    }
    g.restore();
  }, { id: 'br-game' });

  // ---- 4. oracles: Mabel's notebook against the app's log, on a balance
  shot(tOracles - .15, tProbes - .15, (g, t) => {
    const c = cam([[tOracles - .15, OC(540, 1.0)], [tFind + .3, OC(540, 1.05)]], t);
    g.save(); place(g, office(), c); cork(g, t);
    const tilt = t > tJudge ? lerp(0, -1, ease(t, tJudge, .4)) : Math.sin(t * 3) * .1;
    scale(g, 540, OF, 1.05, tilt,
      (g, x, y) => { // Mabel's notebook: the oracle
        shape(g, rrect(x - 115, y - 230, 230, 230, 6), { fill: '#fbf6e8', w: 5, seed: 9401 });
        label(g, "MABEL'S NOTES", x, y - 204, 30, { font: PATTER, col: PLUM });
        for (let i = 0; i < 4; i++) label(g, 'set ' + (i + 1) + '  ' + (i < 2 ? 60 : 80), x, y - 160 + i * 40, 36, { font: SCRIPT, col: INK });
      },
      (g, x, y) => { // the phone's log: three sets
        shape(g, rrect(x - 90, y - 250, 180, 250, 22), { fill: ROSE, w: 5, seed: 9402 });
        shape(g, rrect(x - 74, y - 226, 148, 204, 8), { fill: CREAM, w: 3, seed: 9403 });
        for (let i = 0; i < 3; i++) label(g, 'SET ' + (i + 1), x, y - 196 + i * 44, 34, { font: PATTER });
        label(g, '?', x, y - 50, 44, { font: DISPLAY, col: RED });
      });
    // the ORACLE label and arrow
    if (t > tOracles) { const p = pop(t, tOracles, .3); g.save(); g.translate(330, 780); g.scale(p, p); shape(g, rrect(-130, -44, 260, 88, 16), { fill: GOLD, w: 6, seed: 9410 }); label(g, 'ORACLE', 0, 3, 54, { font: DISPLAY }); g.restore(); stroke(g, [[330, 830], [300, 960]], { w: 8, seed: 9411 }); }
    // a fresh bot judges: flags it
    freshBot(g, 900, OF, .7, 0, { t, eyes: { expr: t > tJudge ? 'wide' : 'open', lx: -.6 }, L: t > tFind ? { to: [.2, -1.1], pose: 'fist' } : 'hips' });
    if (t > tFind) { const p = pop(t, tFind, .3); g.save(); g.translate(880, 900); g.scale(p, p); shape(g, rrect(-170, -46, 340, 92, 20), { fill: WHITE, w: 6, seed: 9412 }); label(g, "DOESN'T MATCH!", 0, 3, 42, { font: DISPLAY, col: RED }); g.restore(); }
    g.restore();
  }, { id: 'br-oracle' });

  // ---- 5-6. the chat: me and Pat; then Sam's new account shows Pat's text
  shot(tProbes - .15, next, (g, t) => {
    const c = cam([[tProbes - .15, OC(540, .9)], [tSent + .4, OC(540, .93)]], t);
    g.save(); place(g, office(), c); cork(g, t);
    const sam = t > tSam - .2;
    // the ME + PAT window, slid left when Sam's opens
    const slide = ease(t, tSam - .3, .4);
    const w1x = lerp(540, 290, slide), w1w = lerp(760, 470, slide);
    browser(g, w1x, 1020, w1w, 560, 'ME + PAT', (g, px, py, pw, ph) => {
      label(g, 'PRIVATE: ME + PAT', px + pw / 2, py + 30, 28, { font: PATTER, col: PLUM });
      if (t > tMe - .2) chatBubble(g, px + 16, py + 100, 'Gym at 6?', 'ME', '#f7c6d0');
      if (t > tPat - .2) chatBubble(g, px + pw - 16, py + 190, 'See you!', 'PAT', '#bfe3d6', true);
    }, { url: 'chat.app/me-pat', seed: 1 });
    if (slide > 0) {
      const p = pop(t, tSam - .3, .35);
      g.save(); g.translate(800, 1020); g.scale(p, p); g.translate(-800, -1020);
      browser(g, 800, 1020, 470, 560, "SAM (NEW)", (g, px, py, pw, ph) => {
        person(g, px + pw / 2, py + 230, .5, { t, kind: 'sam', eyes: { expr: t > tText ? 'wide' : 'open' } });
        if (t > tNew) { g.save(); g.translate(px + pw - 60, py + 40); g.rotate(.2); shape(g, rrect(-44, -18, 88, 36, 6), { fill: GOLD, w: 3, seed: 9501 }); label(g, 'NEW', 0, 1, 24, { font: PATTER }); g.restore(); }
        if (t > tText) chatBubble(g, px + 16, py + 330, 'See you!', 'PAT', '#bfe3d6');
      }, { url: 'chat.app/sam', seed: 2 });
      g.restore();
    }
    // the mint bot probing with a stethoscope at the window
    const bx = lerp(820, 560, slide);
    freshBot(g, bx, OF + 20, .62, 0, { t, eyes: { expr: t > tText ? 'wide' : 'open', lx: -.5, ly: -.5 }, L: { to: [.3, -1.0], pose: 'grip' } });
    if (t > tSent) {
      check(g, 1010, OF + 20, 1.1, { t, card: cardText('ONLY ME+PAT?'), flag: pop(t, tSent, .3), flagCol: RED, wave: true });
      burst(g, 800, 1280, 120, (t - tText) / .4, 10, RED, 31);
    }
    g.restore();
  }, { id: 'br-chat' });
}
