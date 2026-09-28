// ASYNC, the boy band: five Clawds, one of each boy-band type, and what they play.
//   lead    the heart-throb: frosted quiff, sings lead, rhythm guitar
//   elder   the older one: suit and tie, lead guitar; turns into Gran for verse 2
//   builder the builder: hard hat and tool belt, bass
//   soft    the sensitive one: beanie and an emo fringe, keytar
//   bad     the bad boy: backwards cap and a chain, drums
// Every move is driven by the song clock: beats for the bounce, the kick for the drummer, the
// vocal for mouths.
import { C, TAU, clamp, lerp, smooth, rr, circle, ellipse, poly, line, star, heart, INK, rgba, shade, rnd } from './kit.js';
import { clawd, pen, nopen, tone, contactShadow } from './cast.js';
import { letter } from './hand.js';

// ---------------------------------------------------------------- costumes
// Each costume draws over the body (dress) or on top of everything (top). b: the body box.
function jacket(col, lapel, tie) {
  return (g, u, b) => {
    g.save();
    b.bodyPath(); g.clip();
    g.ink = INK.col; g.inkW = clamp(u * .12, 1.5, 7);
    const y0 = b.by + b.bh * .52;
    g.fillStyle = col;
    if (b.back) { g.beginPath(); g.rect(b.bx - 4, y0 - u * .2, b.bw + 8, b.bh); g.fill(); g.restore(); return; }
    poly(g, [[b.bx - 4, y0 - u * .2], [b.bx + b.bw * .38, y0 + u * .3], [b.bx + b.bw * .44, b.by + b.bh + 4], [b.bx - 4, b.by + b.bh + 4]]); g.fill();
    poly(g, [[b.bx + b.bw + 4, y0 - u * .2], [b.bx + b.bw * .62, y0 + u * .3], [b.bx + b.bw * .56, b.by + b.bh + 4], [b.bx + b.bw + 4, b.by + b.bh + 4]]); g.fill();
    if (tie) {
      g.fillStyle = tie;
      poly(g, [[-u * .32, y0 + u * .25], [u * .32, y0 + u * .25], [u * .2, y0 + u * .6], [u * .42, b.by + b.bh - u * .2], [0, b.by + b.bh + u * .1], [-u * .42, b.by + b.bh - u * .2], [-u * .2, y0 + u * .6]]); g.fill();
    }
    if (lapel) {
      g.ink = null; g.fillStyle = lapel;
      circle(g, b.bx + b.bw * .3, y0 + u * 1.1, u * .16); g.fill();
    }
    g.restore();
  };
}

// Gran's cardigan: pink knit with buttons, a string of pearls and glasses on a chain.
function cardigan(g, u, b) {
  g.save();
  b.bodyPath(); g.clip();
  g.ink = INK.col; g.inkW = clamp(u * .12, 1.5, 7);
  const y0 = b.by + b.bh * .5;
  g.fillStyle = '#f59bbd';
  poly(g, [[b.bx - 4, y0 - u * .5], [b.bx + b.bw * .44, y0 + u * .2], [b.bx + b.bw * .46, b.by + b.bh + 4], [b.bx - 4, b.by + b.bh + 4]]); g.fill();
  poly(g, [[b.bx + b.bw + 4, y0 - u * .5], [b.bx + b.bw * .56, y0 + u * .2], [b.bx + b.bw * .54, b.by + b.bh + 4], [b.bx + b.bw + 4, b.by + b.bh + 4]]); g.fill();
  g.ink = null;
  // Knit ribs, in marker.
  g.strokeStyle = rgba('#c9577f', .9); g.lineWidth = u * .08;
  for (let i = 0; i < 6; i++) { const x = b.bx + u * .4 + i * u * .45; line(g, x, y0 + u * .2, x, b.by + b.bh); g.stroke(); line(g, -x, y0 + u * .2, -x, b.by + b.bh); g.stroke(); }
  g.fillStyle = C.cream;
  for (let i = 0; i < 2; i++) { circle(g, b.bx + b.bw * .41, y0 + u * .9 + i * u * .8, u * .16); g.fill(); }
  g.restore();
  // Pearls round the neck line.
  g.save(); g.ink = null;
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (.15 + i / 8 * .7);
    g.fillStyle = C.cream; circle(g, Math.cos(a) * u * 1.7, b.by + b.bh * .42 + Math.sin(a) * u * .75, u * .18); g.fill();
  }
  g.restore();
}
function granTop(g, u, b) {
  // A grey perm and reading glasses.
  g.save();
  g.ink = INK.col; g.inkW = clamp(u * .11, 1.4, 6);
  g.fillStyle = '#e4e0ea';
  for (let i = 0; i < 9; i++) {
    const x = b.bx + u * .2 + i * (b.bw - u * .4) / 8;
    circle(g, x, b.by - u * .05 + Math.sin(i * 1.7) * u * .1, u * .62); g.fill();
  }
  g.ink = null;
  g.strokeStyle = '#6a4a8a'; g.lineWidth = u * .16;
  for (const s of [-1, 1]) { circle(g, s * b.ex + b.lookX, b.ey, u * .72); g.stroke(); }
  line(g, -b.ex + u * .72 + b.lookX, b.ey, b.ex - u * .72 + b.lookX, b.ey); g.stroke();
  // The glasses chain, looping down to the cardigan.
  g.strokeStyle = C.gold; g.lineWidth = u * .07;
  g.beginPath(); g.moveTo(-b.ex - u * .72 + b.lookX, b.ey); g.quadraticCurveTo(-b.ex - u * 1.2, b.ey + u * 2.2, -u * .4, b.by + b.bh * .52); g.stroke();
  g.restore();
}

function quiff(g, u, b) {
  // A frosted-tip quiff, swept up and over: brown roots, bleached tips.
  g.save();
  g.ink = INK.col; g.inkW = clamp(u * .12, 1.5, 7);
  const y = b.by + u * .15;
  const pts = [[-2.9, 0], [-2.6, -1.1], [-2.0, -.8], [-1.6, -1.9], [-.9, -1.3], [-.3, -2.5], [.4, -1.5], [1.2, -2.6], [1.6, -1.2], [2.6, -1.9], [2.4, -.6], [3.0, -.4], [2.9, 0]];
  g.fillStyle = '#6b3b22';
  g.beginPath(); pts.forEach(([x, yy], i) => i ? g.lineTo(x * u, y + yy * u) : g.moveTo(x * u, y + yy * u)); g.closePath(); g.fill();
  g.ink = null; g.fillStyle = '#ffe36a';
  for (const k of [3, 5, 7, 9]) { const [x, yy] = pts[k]; poly(g, [[x * u, y + yy * u], [(x - .35) * u, y + (yy + .75) * u], [(x + .35) * u, y + (yy + .75) * u]]); g.fill(); }
  g.restore();
}
function hardHat(g, u, b) {
  g.save(); g.ink = INK.col; g.inkW = clamp(u * .12, 1.5, 7);
  const y = b.by + u * .2;
  g.fillStyle = '#ffc928';
  g.beginPath(); g.ellipse(0, y, u * 2.3, u * 1.6, 0, Math.PI, TAU); g.closePath(); g.fill();
  g.fillStyle = '#f0a800'; rr(g, -u * 3.1, y - u * .12, u * 6.2, u * .5, u * .25); g.fill();
  g.fillStyle = '#ffe07a'; rr(g, -u * .3, y - u * 1.55, u * .6, u * 1.4, u * .25); g.fill();
  g.restore();
}
function toolBelt(g, u, b) {
  g.save(); g.ink = INK.col; g.inkW = clamp(u * .1, 1.4, 6);
  const y = b.by + b.bh - u * 1.05;
  g.fillStyle = '#8a5a2e'; rr(g, b.bx - u * .1, y, b.bw + u * .2, u * .55, u * .12); g.fill();
  g.fillStyle = '#b07a3e'; rr(g, b.bx + u * .6, y + u * .2, u * 1.2, u * 1.1, u * .2); g.fill(); rr(g, b.bx + b.bw - u * 1.8, y + u * .2, u * 1.2, u * 1.1, u * .2); g.fill();
  g.fillStyle = '#d9d4e4'; rr(g, -u * .3, y + u * .06, u * .6, u * .42, u * .1); g.fill();
  g.restore();
}
function beanieFringe(g, u, b) {
  g.save(); g.ink = INK.col; g.inkW = clamp(u * .12, 1.5, 7);
  const y = b.by + u * .25;
  // The fringe sweeps across one eye, as it must.
  if (!b.back) {
    g.fillStyle = '#2a1f3a';
    g.beginPath(); g.moveTo(-u * 2.95, y); g.quadraticCurveTo(-u * 2.9, y + u * 1.7, -u * 2.1, y + u * 2.05); g.quadraticCurveTo(-u * 1.4, y + u * 1.25, -u * .2, y + u * .75); g.quadraticCurveTo(u * 1.2, y + u * .5, u * 2.2, y); g.closePath(); g.fill();
  }
  g.fillStyle = C.teal;
  g.beginPath(); g.ellipse(0, y, u * 2.8, u * 2.1, 0, Math.PI, TAU); g.closePath(); g.fill();
  rr(g, -u * 3.05, y - u * .45, u * 6.1, u * .8, u * .3); g.fill();
  g.fillStyle = C.mint; circle(g, u * .2, y - u * 2.15, u * .55); g.fill();
  g.ink = null; g.strokeStyle = shade(C.teal, -.3); g.lineWidth = u * .08;
  for (let i = -5; i <= 5; i++) { line(g, i * u * .5, y - u * .35, i * u * .5, y + u * .25); g.stroke(); }
  g.restore();
}
function backCap(g, u, b) {
  g.save(); g.ink = INK.col; g.inkW = clamp(u * .12, 1.5, 7);
  const y = b.by + u * .3;
  g.fillStyle = C.red;
  g.beginPath(); g.ellipse(0, y, u * 2.6, u * 1.5, 0, Math.PI, TAU); g.closePath(); g.fill();
  // The peak, round the back, sticking out behind.
  g.fillStyle = shade(C.red, -.25); rr(g, u * 1.6, y - u * .55, u * 2.1, u * .5, u * .25); g.fill();
  g.fillStyle = C.cream; rr(g, -u * .9, y - u * .75, u * 1.8, u * .5, u * .2); g.fill();
  g.restore();
}
function chain(g, u, b) {
  g.save(); g.ink = null; g.strokeStyle = C.gold; g.lineWidth = u * .14;
  g.beginPath(); g.moveTo(-u * 1.8, b.by + b.bh * .4); g.quadraticCurveTo(0, b.by + b.bh * .78, u * 1.8, b.by + b.bh * .4); g.stroke();
  g.fillStyle = C.gold; circle(g, 0, b.by + b.bh * .66, u * .3); g.fill();
  g.restore();
}
function leather(g, u, b) {
  g.save();
  b.bodyPath(); g.clip();
  g.ink = INK.col; g.inkW = clamp(u * .12, 1.5, 7);
  const y0 = b.by + b.bh * .5;
  g.fillStyle = '#2b2440';
  poly(g, [[b.bx - 4, y0 - u * .3], [b.bx + b.bw * .34, y0 + u * .6], [b.bx + b.bw * .36, b.by + b.bh + 4], [b.bx - 4, b.by + b.bh + 4]]); g.fill();
  poly(g, [[b.bx + b.bw + 4, y0 - u * .3], [b.bx + b.bw * .66, y0 + u * .6], [b.bx + b.bw * .64, b.by + b.bh + 4], [b.bx + b.bw + 4, b.by + b.bh + 4]]); g.fill();
  g.ink = null; g.fillStyle = '#c9c4d6';
  for (let i = 0; i < 3; i++) { circle(g, b.bx + b.bw * .2, y0 + u * .5 + i * u * .6, u * .12); g.fill(); }
  g.restore();
}

export const MEMBERS = {
  lead: { top: quiff, eyes: 'open' },
  elder: { dress: jacket('#2d3f8f', C.pink, C.red), top: (g, u, b) => {
    // A neat grey side parting and a moustache: the older one.
    g.save(); g.ink = INK.col; g.inkW = clamp(u * .1, 1.4, 6); g.fillStyle = '#b9b4c6';
    const y = b.by + u * .2;
    g.beginPath(); g.moveTo(-u * 2.9, y + u * .2); g.quadraticCurveTo(-u * 2.8, y - u * 1.1, -u * .6, y - u * 1.05); g.lineTo(-u * .9, y - u * .2); g.quadraticCurveTo(u * 1.4, y - u * 1.5, u * 2.9, y - u * .1); g.lineTo(u * 2.9, y + u * .3); g.closePath(); g.fill();
    g.fillStyle = '#8e889e';
    if (b.back) { g.restore(); return; }
    g.beginPath(); g.moveTo(b.lookX, b.ey + u * .75); g.quadraticCurveTo(b.lookX - u * .9, b.ey + u * .55, b.lookX - u * 1.25, b.ey + u * 1.15); g.quadraticCurveTo(b.lookX - u * .6, b.ey + u * 1.05, b.lookX, b.ey + u * .95); g.quadraticCurveTo(b.lookX + u * .6, b.ey + u * 1.05, b.lookX + u * 1.25, b.ey + u * 1.15); g.quadraticCurveTo(b.lookX + u * .9, b.ey + u * .55, b.lookX, b.ey + u * .75); g.fill();
    g.restore();
  } },
  gran: { dress: cardigan, top: granTop },
  builder: { dress: toolBelt, top: hardHat },
  soft: { top: beanieFringe, eyeL: 'hidden' },
  bad: { dress: (g, u, b) => { leather(g, u, b); if (!b.back) chain(g, u, b); }, top: backCap },
};

// One member of ASYNC. who: key of MEMBERS. o passes through to clawd().
export function member(g, x, y, who, o = {}) {
  const m = MEMBERS[who] || {};
  clawd(g, x, y, {
    ...o,
    dress: (g2, u, b) => { if (m.dress) m.dress(g2, u, b); if (o.dress) o.dress(g2, u, b); },
    dressTop: (g2, u, b) => { if (m.top) m.top(g2, u, b); if (o.dressTop) o.dressTop(g2, u, b); },
  });
}

// ---------------------------------------------------------------- instruments
// Each is drawn in the instrument's own frame; `strum`, `hit` and the like are 0..1 pulses.

// A pointy pop-punk electric guitar (or bass, longer), slung at `rot`, body centre at (x, y).
export function guitar(g, x, y, s, rot, col = C.pink, o = {}) {
  const u = s / 10, bass = o.bass;
  g.save(); g.translate(x, y); g.rotate(rot);
  g.ink = INK.col; g.inkW = clamp(u * .5, 1.6, 6);
  const neckL = bass ? 13 : 10.5;
  g.fillStyle = '#e8c38a'; rr(g, u * 2, -u * .5, u * neckL, u * 1, u * .3); g.fill();
  g.fillStyle = C.ink; poly(g, [[u * (neckL + 1.6), -u * 1.1], [u * (neckL + 3.4), -u * .6], [u * (neckL + 3.2), u * .7], [u * (neckL + 1.6), u * .6]]); g.fill();
  g.ink = null; g.fillStyle = '#c99b5c';
  for (let i = 1; i < 7; i++) { line(g, u * (2 + i * neckL / 7), -u * .5, u * (2 + i * neckL / 7), u * .5); g.strokeStyle = '#a07a44'; g.lineWidth = u * .12; g.stroke(); }
  g.ink = INK.col;
  const body = () => {
    g.beginPath();
    g.moveTo(u * 2.4, -u * 1.1);
    g.lineTo(u * .6, -u * 3.4); g.lineTo(-u * 1.2, -u * 2.2);
    g.lineTo(-u * 4.4, -u * 3.2); g.lineTo(-u * 3.2, -u * .4);
    g.lineTo(-u * 4.6, u * 2.8); g.lineTo(-u * .6, u * 2.3);
    g.lineTo(u * 1.4, u * 3.3); g.lineTo(u * 2.4, u * 1.1);
    g.closePath();
  };
  body(); g.fillStyle = col; g.fill();
  g.ink = null;
  g.fillStyle = C.cream; poly(g, [[-u * 2.8, -u * 1.4], [u * .6, -u * 1.6], [u * .9, u * 1.2], [-u * 2.2, u * 1.6]]); g.fill();
  g.fillStyle = C.ink; rr(g, -u * 1.9, -u * .8, u * .7, u * 1.6, u * .2); g.fill(); rr(g, -u * .5, -u * .8, u * .7, u * 1.6, u * .2); g.fill();
  g.strokeStyle = rgba(C.cream, .85); g.lineWidth = u * .09;
  const n = bass ? 4 : 6;
  for (let i = 0; i < n; i++) { const yy = -u * .38 + i * u * .76 / (n - 1); line(g, -u * 2.6, yy, u * (neckL + 1.8), yy + (o.strum || 0) * Math.sin(i * 3 + (o.t || 0) * 60) * u * .08); g.stroke(); }
  if (o.lightning) { g.fillStyle = C.yellow; poly(g, [[-u * 3.8, -u * 2.6], [-u * 2.6, -u * 2.9], [-u * 3.1, -u * 2.2], [-u * 2.2, -u * 2.35], [-u * 3.5, -u * 1.6], [-u * 3.1, -u * 2.2]]); g.fill(); }
  g.restore();
}

// A drum kit, seen from the front, kick drum with the band's name; `hitL`, `hitR` for the
// toms/snare, `crash` for the cymbal. Returns nothing; sticks belong to the drummer.
export function drumKit(g, x, y, s, o = {}) {
  const u = s / 10;
  g.save(); g.translate(x, y);
  g.ink = INK.col; g.inkW = clamp(u * .4, 1.6, 6);
  // Cymbals on stands.
  for (const [cx, cy, w, ph] of [[-5.2, -10.5, 3.4, o.crash || 0], [5.4, -9.6, 3, (o.hat || 0) * .6]]) {
    g.save(); g.translate(cx * u, cy * u);
    g.ink = null; g.strokeStyle = INK.col; g.lineWidth = u * .28; line(g, 0, 0, 0, u * 10); g.stroke();
    g.ink = INK.col; g.rotate(.18 * Math.sin(ph * 10) * ph);
    g.fillStyle = C.gold; ellipse(g, 0, 0, w * u, u * .5); g.fill();
    g.restore();
  }
  // Toms.
  for (const [tx, ty, h] of [[-2.4, -7.6, o.hitL || 0], [2.4, -7.8, o.hitR || 0]]) {
    const d = h * u * .25;
    g.fillStyle = C.teal; rr(g, (tx - 1.9) * u, ty * u + d, u * 3.8, u * 1.9, u * .3); g.fill();
    g.fillStyle = C.cream; ellipse(g, tx * u, ty * u + d, u * 1.9, u * .5); g.fill();
  }
  // Kick drum.
  const kr = u * 4.3 * (1 + (o.kick || 0) * .035);
  g.fillStyle = C.teal; circle(g, 0, -kr, kr); g.fill();
  g.fillStyle = C.cream; circle(g, 0, -kr, kr * .82); g.fill();
  g.ink = null;
  letter(g, 'ASYNC', 0, -kr + kr * .2, kr * .44, { col: C.pink, w: .2, align: 'center', seed: 4, outline: { col: INK.col, w: .06 } });
  g.fillStyle = C.ink; star(g, 0, -kr - kr * .45, kr * .14, kr * .06, 5); g.fill();
  g.restore();
}

// A keytar, worn like a guitar.
export function keytar(g, x, y, s, rot, o = {}) {
  const u = s / 10;
  g.save(); g.translate(x, y); g.rotate(rot);
  g.ink = INK.col; g.inkW = clamp(u * .5, 1.6, 6);
  g.fillStyle = C.lilac;
  poly(g, [[-u * 5, -u * 1.6], [u * 3.5, -u * 1.6], [u * 5, -u * .6], [u * 9.5, -u * .6], [u * 9.5, u * .6], [u * 4.2, u * .6], [u * 3.2, u * 1.8], [-u * 5, u * 1.8]]); g.fill();
  g.fillStyle = C.cream; rr(g, -u * 4.4, -u * .9, u * 7.2, u * 2.1, u * .2); g.fill();
  g.ink = null;
  const press = o.press || [];
  for (let i = 0; i < 12; i++) {
    const kx = -u * 4.4 + i * u * .6;
    g.strokeStyle = INK.col; g.lineWidth = u * .08; line(g, kx, -u * .9, kx, u * 1.2); g.stroke();
    if (i % 7 !== 2 && i % 7 !== 6) { g.fillStyle = INK.col; rr(g, kx + u * .38, -u * .9, u * .36, u * 1.15, u * .06); g.fill(); }
    if (press.includes(i)) { g.fillStyle = C.yellow; rr(g, kx + u * .05, u * .3, u * .5, u * .85, u * .08); g.fill(); }
  }
  g.fillStyle = C.pink; circle(g, u * 8.6, 0, u * .35); g.fill();
  g.restore();
}

// A microphone in a hand (drawn at the arm tip), and a stand.
export function mic(g, u, o = {}) {
  g.save(); g.rotate(o.rot ?? -.6);
  g.ink = INK.col; g.inkW = clamp(u * .1, 1.4, 5);
  g.fillStyle = C.ink; rr(g, -u * .2, -u * .2, u * .4, u * 1.9, u * .15); g.fill();
  g.fillStyle = '#c9c4d6'; circle(g, 0, -u * .5, u * .5); g.fill();
  g.ink = null; g.strokeStyle = rgba(C.ink, .6); g.lineWidth = u * .06;
  for (let i = -2; i <= 2; i++) { line(g, -u * .42, -u * .5 + i * u * .17, u * .42, -u * .5 + i * u * .17); g.stroke(); }
  g.restore();
}
export function micStand(g, x, y, h, u) {
  g.save(); g.ink = null; g.strokeStyle = INK.col; g.lineWidth = u * .24; g.lineCap = 'round';
  line(g, x, y, x, y - h); g.stroke();
  line(g, x - u * 1.1, y, x, y - u * .6); g.stroke(); line(g, x + u * 1.1, y, x, y - u * .6); g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- the band playing
// A natural blink every few seconds, different per character.
export function blinkAt(t, seed) {
  const period = 2.6 + (seed % 5) * .7;
  const ph = ((t + seed * 1.37) % period) / period;
  return ph < .04 ? Math.sin(ph / .04 * Math.PI) : 0;
}

// Draw one member playing their instrument. K: the song clock. o: { s, energy, mouth, eyes,
// sing (0..1, mouth follows the vocal), noInst, look, facing }.
export function play(g, t, K, who, x, y, o = {}) {
  const s = o.s || 260, u = s / 6, e = o.energy ?? 1;
  const bp = K.beatPos(t), ph = bp - Math.floor(bp);
  const bounce = Math.pow(1 - ph, 3) * e;
  const voc = clamp(K.vocal(t) * 1.25);
  const mouth = o.mouth ?? (o.sing ? voc * o.sing : 0);
  const base = { s, t, legs: bp, blink: blinkAt(t, x | 0), squash: bounce * .06, look: o.look, eyes: o.eyes, mouth, blush: o.blush, smile: o.smile };
  if (who === 'bad') {
    // The drummer sits behind his kit; sticks come down on the beat.
    const hitL = Math.pow(1 - ((bp + .5) % 1), 5) * e, hitR = Math.pow(1 - (bp % 1), 5) * e;
    member(g, x, y - u * 2.6, 'bad', { ...base, shadow: false, armL: -.7 + hitL * .9, armR: -.7 + hitR * .9, extL: 1.3, extR: 1.3,
      holdL: (g2, uu) => stick(g2, uu, .9 - hitL * .9), hold: (g2, uu) => stick(g2, uu, .9 - hitR * .9) });
    if (!o.noInst) drumKit(g, x, y + u * .6, s * .82, { kick: K.kick(t) * e, hitL, hitR, crash: Math.pow(1 - (K.barPos(t) % 1), 4) * e, hat: hitR });
    return;
  }
  const strum = Math.pow(Math.abs(Math.sin(bp * Math.PI)), 3) * e;
  const lean = Math.sin(bp * Math.PI / 2) * .05 * e + (o.lean || 0);
  if (who === 'soft') {
    const press = e > .1 ? [Math.floor(bp * 2) % 12, (Math.floor(bp * 2) * 5 + 3) % 12] : [];
    member(g, x, y, 'soft', { ...base, lean, armL: -.15, armR: .35 - strum * .2 });
    if (!o.noInst) keytar(g, x - u * .9, y - u * 1.9, s * .62, -.22 + lean * .5, { press });
    return;
  }
  const inst = { lead: [C.pink, false, true], elder: [C.yellow, false, false], builder: [C.blue, true, false], gran: [C.yellow, false, false] }[who];
  member(g, x, y, who, { ...base, lean, armL: -.1, armR: .45 - strum * .5, ...(o.pose || {}) });
  if (inst && !o.noInst) guitar(g, x - u * 1.1, y - u * 1.7, s * .72, -.42 + lean, inst[0], { bass: inst[1], lightning: inst[2], strum, t });
}
function stick(g, u, rot) {
  g.save(); g.rotate(rot); g.ink = INK.col; g.inkW = clamp(u * .08, 1.2, 4);
  g.fillStyle = '#f0d9a8'; rr(g, -u * .12, -u * 2.6, u * .24, u * 2.8, u * .12); g.fill();
  g.restore();
}
