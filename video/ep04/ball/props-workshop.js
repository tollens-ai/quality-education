// Verse 1's props, in Clawd's workshop: the calculator screen, the greeting with its comma, a bellows
// camera with flash powder, a photo, and a crate of checks.
import { TAU, clamp, lerp, now, hash, noise, rng, easeOut, backOut } from './kit.js';
import { INK, WHITE, CREAM, CORAL, TEAL, ROSE, PLUM, OCHRE, GOLD, GOLD_SH, GREEN, RED, RED_SH, WOOD, WOOD_SH, BROWN, SLATE, GREY, TIN, C, sh, lt } from './palette.js';
import { shape, line, stroke, rrect, ellipse, spline, xf, dot, paint, pathOf, arc, glove } from './ink.js';
import { digits } from './props.js';
import { bug, comma } from './cast.js';
import { pops } from './rig.js';

// The calculator on a phone's screen: the sum above, the answer below; `ans` is what it shows
// ('' for nothing yet), `flip` 0..1 turns the answer over (4 into 5).
export function calcScreen(t, o = {}) {
  return (g, sx, sy, sw, sh, s) => {
    g.fillStyle = C('#efe9da'); g.fillRect(sx, sy, sw, 40 * s);
    if (o.sum) digits(g, o.sum, sx + sw / 2, sy + 150 * s, 92 * s, { col: INK, ow: 0 });
    stroke(g, [[sx + 30 * s, sy + 215 * s], [sx + sw - 30 * s, sy + 215 * s]], { w: 5 * s, seed: 2001, taper: false });
    if (o.ans) {
      const f = o.flip ?? 0, sq = Math.abs(Math.cos(f * Math.PI));
      g.save(); g.translate(sx + sw / 2, sy + 300 * s); g.scale(1, Math.max(.05, sq));
      digits(g, f < .5 ? o.ans : (o.ans2 || o.ans), 0, 0, 120 * s, { col: f < .5 ? INK : RED_SH, ow: 0 });
      g.restore();
    }
    if (o.bug !== false) bug(g, sx + sw * .74 + (o.kick ? -10 * s : 0), sy + 330 * s, .55 * s, { t, kick: o.kick ?? 0, look: -.8, dir: -1 });
  };
}
// A greeting on a phone's screen: a little face, then squiggle "words", one comma, an
// exclamation mark. `comma` false leaves the gap where the comma was.
export function greetScreen(t, o = {}) {
  return (g, sx, sy, sw, sh, s) => {
    g.fillStyle = C('#efe9da'); g.fillRect(sx, sy, sw, 40 * s);
    greeting(g, sx + sw * .1, sy + 80 * s, sw * .8, s, o);
  };
}
export function greeting(g, x, y, w, s, o = {}) {
  // a round avatar with a smile, and beside it a message bubble: two squiggle words, a comma, two more
  shape(g, ellipse(x + w * .14, y + 60 * s, 42 * s, 42 * s), { fill: '#f2b98a', w: 4.5 * s, seed: 2010, k: .6 });
  for (const d of [-1, 1]) dot(g, x + w * .14 + d * 14 * s, y + 52 * s, 5 * s);
  stroke(g, [[x + w * .14 - 16 * s, y + 72 * s], [x + w * .14, y + 80 * s], [x + w * .14 + 16 * s, y + 72 * s]], { w: 3.5 * s, seed: 2011 });
  const bx = x + w * .3, by = y + 14 * s, bw = w * .7, bh = 150 * s;
  shape(g, rrect(bx, by, bw, bh, 26 * s), { fill: '#dff0e8', form: false, w: 4.5 * s, seed: 2016 });
  shape(g, [[bx + 6 * s, by + 34 * s], [bx - 22 * s, by + 46 * s], [bx + 8 * s, by + 58 * s]], { fill: '#dff0e8', w: 4 * s, seed: 2017, form: false });
  const ly = by + 58 * s;
  squiggle(g, bx + bw * .1, ly, bw * .34, s, 2012);
  if (o.comma !== false) commaGlyph(g, bx + bw * .5, ly + 6 * s, 30 * s);
  else if (o.gap) { g.save(); g.strokeStyle = C(RED); g.lineWidth = 6 * s; g.beginPath(); g.arc(bx + bw * .5, ly + 4 * s, 26 * s, 0, TAU); g.stroke(); g.restore(); }
  squiggle(g, bx + bw * .58, ly, bw * .32, s, 2013);
  squiggle(g, bx + bw * .1, ly + 50 * s, bw * .58, s, 2015, .7);
  return { comma: [bx + bw * .5, ly + 6 * s] };
}
export function squiggle(g, x, y, w, s, seed, a = 1) {
  const P = [], n = Math.max(8, Math.round(w / (9 * s)));
  for (let i = 0; i <= n; i++) { const u = i / n; P.push([x + u * w, y + Math.sin(u * w / (11 * s) + seed) * 9 * s - (i % 5 === 2 ? 8 * s : 0)]); }
  g.save(); g.globalAlpha *= a; line(g, P, { w: 6 * s, seed, taper: true, tipMin: .5 }); g.restore();
}
export function commaGlyph(g, x, y, h) {
  const s = h / 30;
  dot(g, x, y - 3 * s, 7.5 * s);
  shape(g, spline([[x + 3 * s, y - 2 * s], [x + 7 * s, y + 4 * s], [x + 3 * s, y + 13 * s], [x - 5 * s, y + 20 * s], [x - 1 * s, y + 11 * s], [x - 2 * s, y + 3 * s]], true, 4), { fill: INK, w: 0, seed: 2020, form: false });
}

// A 1930s bellows camera on a tripod, lens toward `dir`. Returns the lens point.
export function bellowsCamera(g, x, y, s = 1, o = {}) {
  const dir = o.dir ?? 1;
  // tripod
  for (const d of [-1, 0, 1]) stroke(g, [[x, y - 250 * s], [x + d * 70 * s, y]], { w: 9 * s, seed: 2030 + d, taper: false, color: '#4a3020' });
  shape(g, rrect(x - 26 * s, y - 270 * s, 52 * s, 26 * s, 6 * s), { fill: '#3a2a20', w: 4 * s, seed: 2033, form: 'block' });
  // the box, the bellows, the lens board
  const by = y - 360 * s;
  shape(g, rrect(x - 70 * s, by - 60 * s, 110 * s, 120 * s, 10 * s).map(([px, py]) => [x + (px - x) * dir, py]), { fill: WOOD, shade: WOOD_SH, form: 'block', w: 6 * s, seed: 2034 });
  const bel = [];
  for (let i = 0; i <= 6; i++) { const u = i / 6, bx = x + dir * (40 + u * 110) * s, hh = (52 - u * 14) * s * (i % 2 ? .9 : 1); bel.push([bx, by - hh]); }
  for (let i = 6; i >= 0; i--) { const u = i / 6, bx = x + dir * (40 + u * 110) * s, hh = (52 - u * 14) * s * (i % 2 ? .9 : 1); bel.push([bx, by + hh]); }
  shape(g, bel, { fill: '#2a2224', lit: '#5a5054', form: 'block', w: 5 * s, seed: 2035 });
  for (let i = 1; i < 6; i++) { const bx = x + dir * (40 + i / 6 * 110) * s; stroke(g, [[bx, by - 44 * s], [bx, by + 44 * s]], { w: 2.5 * s, seed: 2036 + i, color: '#6a5e60' }); }
  const lx = x + dir * 160 * s;
  shape(g, rrect(lx - 14 * s, by - 46 * s, 28 * s, 92 * s, 6 * s), { fill: WOOD, form: 'block', w: 5 * s, seed: 2042 });
  shape(g, ellipse(lx + dir * 22 * s, by, 26 * s, 30 * s), { fill: '#3a3a3a', w: 5 * s, seed: 2043, form: false });
  shape(g, ellipse(lx + dir * 24 * s, by, 16 * s, 20 * s), { fill: '#6fa4b8', w: 4 * s, seed: 2044, gloss: { x: .3, y: .25, w: .18, h: .14, dot: false } });
  // the black cloth over the back, with legs (and whoever's under it) below
  if (o.cloth !== false) shape(g, spline([[x - dir * 70 * s, by - 70 * s], [x - dir * 10 * s, by - 76 * s], [x - dir * 30 * s, by + 40 * s], [x - dir * 120 * s, by + 120 * s], [x - dir * 180 * s, by + 80 * s], [x - dir * 150 * s, by - 20 * s]], true, 5), { fill: '#1d1916', lit: '#4a4040', form: 'round', w: 5 * s, seed: 2045 });
  return [lx + dir * 46 * s, by];
}
// A flash: white light and a starburst at (x, y), p 0..1; smoke puffs drift after.
export function flash(g, x, y, p, W, H) {
  if (p <= 0 || p >= 1.6) return;
  if (p < .35) { g.save(); g.globalAlpha = (1 - p / .35) * .9; g.fillStyle = C('#fffbe8'); g.fillRect(-50, -50, W + 100, H + 100); g.restore(); }
  if (p < 1) { pops(g, x, y, 40 + p * 140, 10, { a0: 0, span: TAU * .9, w: 8 * (1 - p) + 2, col: GOLD }); }
  for (let i = 0; i < 4; i++) { const q = p - .1 - i * .08; if (q <= 0) continue; g.save(); g.globalAlpha *= Math.max(0, 1 - q / 1.4) * .8; shape(g, ellipse(x + i * 30 - 30, y - q * 160 - i * 20, 40 + q * 50, 32 + q * 40), { fill: '#e8e0d0', w: 4, seed: 2050 + i, form: false }); g.restore(); }
}
// A photo: a white-bordered print of the greeting, with or without its comma.
export function photo(g, x, y, w, ang, s, o = {}) {
  const h = w * 1.18;
  g.save(); g.translate(x, y); g.rotate(ang);
  shape(g, rrect(-w / 2, -h / 2, w, h, 6), { fill: '#fdfaf0', form: false, w: 4, seed: 2060 });
  g.fillStyle = C('#efe6d0'); g.fillRect(-w / 2 + w * .08, -h / 2 + w * .08, w * .84, h * .74);
  greeting(g, -w / 2 + w * .14, -h / 2 + w * .1, w * .72, w / 300, o);
  g.restore();
}
// A wooden crate, open at the top: its dark mouth shows, with checks inside ready to tip out.
export function crate(g, x, y, s, open = 0) {
  const top = y - 150 * s, back = top - 46 * s;
  // the open mouth: the far rim, the dark inside, and a few checks' tin heads at the lip
  shape(g, [[x - 130 * s, top], [x + 130 * s, top], [x + 104 * s, back], [x - 156 * s, back]], { fill: '#3a2410', w: 6 * s, seed: 2154, form: false });
  for (const [dx, dy, k] of [[-80, -22, 0], [-18, -30, 1], [48, -20, 2]]) {
    const cx = x + dx * s, cy = top + dy * s;
    shape(g, rrect(cx - 26 * s, cy - 22 * s, 52 * s, 40 * s, 6 * s), { fill: TIN, shade: sh(TIN, .35), form: 'block', w: 4 * s, seed: 2156 + k });
    for (const d of [-1, 1]) dot(g, cx + d * 9 * s, cy - 6 * s, 4 * s);
  }
  shape(g, [[x - 156 * s, back], [x + 104 * s, back], [x + 104 * s, back + 12 * s], [x - 156 * s, back + 12 * s]], { fill: '#d29a5e', w: 4 * s, seed: 2155, form: false });
  // the front face and its slats
  shape(g, rrect(x - 130 * s, top, 260 * s, 150 * s, 6 * s), { fill: '#c08a52', shade: '#7a5028', form: 'block', w: 6 * s, seed: 2150 });
  for (const yy of [-110, -60]) stroke(g, [[x - 128 * s, y + yy * s], [x + 128 * s, y + yy * s]], { w: 4 * s, seed: 2151 + yy, color: '#7a5028' });
  stroke(g, [[x - 120 * s, y - 140 * s], [x + 120 * s, y - 10 * s]], { w: 8 * s, seed: 2153, color: '#9a6a38', taper: false });
}
