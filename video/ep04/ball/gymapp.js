// Mabel's gym app, the one app in the whole film (v3): the pink phone, the app's header, the screens
// the scenes show (its code, the sets total, the chat), and the testers' "?!" sticker, slapped over a
// check's green flag when testing finds a problem the checks missed.
import { TAU, clamp, lerp, easeOut } from './kit.js';
import { INK, C } from './palette.js';
import { shape, stroke, spline, ellipse } from './ink.js';
import { phone, bug } from './cast.js';
import { code, digits } from './props.js';
import { greeting } from './props-workshop.js';
import { barbellIcon, netFan, PINK } from './props-gym.js';
import { qmark, bang, pops } from './rig.js';

// The app's look, the same on every page that shows it (the phone, a browser, a print, a snapshot): a
// raspberry header bar with the app's mark in the middle, a cream badge with a barbell. It's what tells
// the viewer it's the same app, whichever part of it a scene is in, so make it bold and keep it whole.
export const APP = { pink: PINK, header: '#c9466a', rule: '#a3304f', ink: '#b0405a', logo: '#fff6ee', icon: '#fff1e6', paper: '#fdf5f0' };
export const HEADER = 64;   // the header's height, in phone units (times the phone's s)

// The app's mark: the cream badge with the barbell. r is the badge's radius.
export function appLogo(g, x, y, r) {
  shape(g, ellipse(x, y, r, r, 0, 28), { fill: APP.logo, w: Math.max(2, r * .12), seed: 7810, form: false, amt: .2 });
  barbellIcon(g, x, y, r * 1.5, APP.header);
}
// The app's header: the raspberry bar, the mark and, if asked, the Wi-Fi fan. Icons drawn over it
// (a reload arrow, the fan) read in APP.icon.
export function appHeader(g, sx, sy, sw, s, o = {}) {
  g.fillStyle = C(APP.header); g.fillRect(sx, sy, sw, HEADER * s);
  g.fillStyle = C(APP.rule); g.fillRect(sx, sy + (HEADER - 4) * s, sw, 4 * s);
  appLogo(g, sx + sw * .5, sy + 32 * s, 24 * s);
  if (o.wifi != null) netFan(g, sx + sw - 38 * s, sy + 42 * s, 26 * s, o.wifi);
}
// The app on its pink phone. `screen(g, sx, sy, sw, sh, s)` draws the page below the header; the
// phone's other options (eyes, arms, lean, legs...) pass through.
export function gymPhone(g, x, y, s, screen, o = {}) {
  return phone(g, x, y, s, { ...o, col: APP.pink, wifi: null, screen: (g, sx, sy, sw, sh, ss) => {
    g.fillStyle = C(APP.paper); g.fillRect(sx, sy, sw, sh);
    appHeader(g, sx, sy, sw, ss, { wifi: o.appWifi });
    if (screen) screen(g, sx, sy + HEADER * ss, sw, sh - HEADER * ss, ss);
  } });
}

// Pages. Each returns a screen function for gymPhone (or for a check's card, which takes the same
// arguments).
// The app's code: rows of coloured bars, the beetle in one of them.
export const codeScreen = (t, o = {}) => (g, sx, sy, sw, sh, s) =>
  code(g, sx + sw * .1, sy + 30 * s, sw * .8, { t, bugAt: o.bug === false ? -1 : 2, look: o.look, bugScale: o.bugScale, kick: o.kick });
// Today's sets added up: the sum, a rule, and the answer, which `flip` (0..1) turns over from `ans`
// to `ans2` (4 to 5) when the beetle kicks it.
export const sumScreen = (t, o = {}) => (g, sx, sy, sw, sh, s) => {
  if (o.sum) digits(g, o.sum, sx + sw / 2, sy + 112 * s, 88 * s, { col: INK, ow: 0 });
  stroke(g, [[sx + 30 * s, sy + 168 * s], [sx + sw - 30 * s, sy + 168 * s]], { w: 5 * s, seed: 2001, taper: false });
  if (o.ans) {
    const f = o.flip ?? 0, sq = Math.abs(Math.cos(f * Math.PI));
    g.save(); g.translate(sx + sw / 2 - 50 * s, sy + 262 * s); g.scale(1, Math.max(.05, sq));
    digits(g, f < .5 ? o.ans : (o.ans2 || o.ans), 0, 0, 116 * s, { col: f < .5 ? INK : '#982218', ow: 0 });
    g.restore();
    // what the number counts: today's sets, so the app's barbell beside it, big and bold
    barbellIcon(g, sx + sw / 2 + 52 * s, sy + 222 * s, 92 * s, APP.header);
  }
  if (o.bug !== false) bug(g, sx + sw * .78 + (o.kick ? -10 * s : 0), sy + 300 * s, .55 * s, { t, kick: o.kick ?? 0, look: -.8, dir: -1 });
};
// The chat: Pat's message (squiggles and one comma). `comma: false` leaves the gap. Returns, through
// o.at, where the comma sits.
export const chatScreen = (t, o = {}) => (g, sx, sy, sw, sh, s) => {
  const r = greeting(g, sx + sw * .04, sy + 26 * s, sw * .92, s, { comma: o.comma, gap: o.gap });
  if (o.at) o.at(r.comma);
};

// The testers' mark: a round red seal with "?!" on it (Guess's antenna's two shapes). Slapped over a
// check's green flag, or the app's "Saved!" tick, it says: the check said yes; testing found a
// problem. r is its radius; p (0..1) slaps it on, landing big and settling; `since` (seconds since it
// landed) throws a few lines off it.
export function sticker(g, x, y, r, o = {}) {
  const p = clamp(o.p ?? 1);
  if (p <= 0) return;
  const sc = lerp(1.8, 1, easeOut(p, 2));
  g.save(); g.translate(x, y); g.rotate(o.ang ?? -.2); g.scale(sc, sc); g.globalAlpha *= clamp(p * 4);
  const P = [], n = 18;
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, rr = r * (i % 2 ? .92 : 1.03); P.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  shape(g, spline(P, true, 3), { fill: '!#d8432c', shade: '!#8d2216', lit: '!#ee7a5a', form: 'round', w: r * .075, seed: 7801, gloss: { x: .3, y: .22, w: .14, h: .1, dot: false } });
  g.save(); g.strokeStyle = C('!#f8e6c6'); g.lineWidth = r * .06; g.beginPath(); g.arc(0, 0, r * .76, 0, TAU); g.stroke(); g.restore();
  qmark(g, -r * .2, r * .12, r * .92, '!#fbf0da', { seed: 7802, w: r * .07 });
  bang(g, r * .32, r * .02, r * .92, '!#fbf0da', { seed: 7804, w: r * .07 });
  g.restore();
  if (o.since != null && o.since >= 0 && o.since < .35) pops(g, x, y, r * 1.25, 8, { a0: 0, span: TAU * .9, w: Math.max(3, r * .08) });
}
