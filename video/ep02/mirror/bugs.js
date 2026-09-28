// Bugs are moths. The first computer "bug" was a moth, taped into the Harvard Mark II's logbook
// in 1947 ("First actual case of bug being found"); here they gather on your side of the glass,
// where the band can't see them. And the band's own verdicts: a red 合格 seal ("passed"), and a
// tick.
import { C, TAU, clamp, lerp, noise, hash, twos, rgba } from './kit.js';
import { P, ink, gpen } from './pen.js';
import { text } from './type.js';

// A moth, wings spread, flapping on twos. s: wingspan.
export function moth(g, x, y, s, t, seed = 1, o = {}) {
  const flap = Math.abs(Math.sin(twos(t) * 16 + seed * 5)) * .6 + .4;
  const col = o.col || C.bone2, dark = o.dark || C.ink3;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? (noise(t * 2, seed) * .5));
  const h = s / 2;
  for (const sd of [-1, 1]) {
    g.save(); g.scale(sd * flap, 1);
    // Forewing: a long rounded triangle; hindwing: a smaller round one below it.
    const fw = P().S([[2, -h * .1], [h * .5, -h * .62], [h * 1.02, -h * .55], [h * .9, -h * .1], [h * .45, h * .12]], true, .4);
    ink(g, fw, { fill: col, line: Math.max(1.5, s * .025), seed: seed + sd, t, shade: { dx: -h * .08, dy: -h * .08, col: rgba(dark, .5) } });
    const hw = P().S([[2, h * .05], [h * .55, h * .1], [h * .6, h * .45], [h * .22, h * .55]], true, .5);
    ink(g, hw, { fill: col, line: Math.max(1.5, s * .025), seed: seed + sd + 3, t });
    // An eyespot on each forewing, and a band.
    g.fillStyle = dark; g.beginPath(); g.ellipse(h * .6, -h * .32, h * .12, h * .09, .3, 0, TAU); g.fill();
    g.fillStyle = C.bone; g.beginPath(); g.ellipse(h * .6, -h * .32, h * .04, h * .03, .3, 0, TAU); g.fill();
    gpen(g, [[h * .2, -h * .02], [h * .75, -h * .4]], s * .03, { col: dark, t, seed: seed + 9, taper: [.3, .3] });
    g.restore();
  }
  // Body and feathered antennae.
  ink(g, P().ell(0, 0, h * .09, h * .42), { fill: dark, line: Math.max(1.5, s * .02), seed: seed + 7, t });
  for (const sd of [-1, 1]) gpen(g, [[0, -h * .38], [sd * h * .18, -h * .62], [sd * h * .3, -h * .7]], s * .02, { col: dark, t, seed: seed + 8, taper: [.1, .4] });
  g.restore();
}

// A swarm: n moths drifting in a region, each on its own path.
export function swarm(g, t, n, x0, y0, w, h, o = {}) {
  for (let i = 0; i < n; i++) {
    const px = x0 + w * (hash(i, 1) + noise(t * .4 + i, 2) * .12);
    const py = y0 + h * (hash(i, 3) + noise(t * .4 + i, 4) * .12);
    moth(g, px, py, lerp(o.min ?? 50, o.max ?? 120, hash(i, 5)), t + i * .03, i + (o.seed ?? 0), o);
  }
}

// The red 合格 seal of a Japanese exam pass, inked on a slant. p: 0..1 as it's pressed down.
export function hanko(g, x, y, r, p, o = {}) {
  if (p <= 0) return;
  const s = lerp(1.6, 1, clamp(p * 1.2));
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.18); g.scale(s, s);
  g.globalAlpha *= clamp(p * 2);
  g.strokeStyle = o.col || C.red; g.lineWidth = r * .14;
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  g.lineWidth = r * .05; g.beginPath(); g.arc(0, 0, r * .8, 0, TAU); g.stroke();
  text(g, '合格', 0, r * .3, r * .8, 'jp', { align: 'center', fill: o.col || C.red, ctx: { deco: true }, noAudit: true });
  g.restore();
}

// A tick, as a teacher marks one, in one stroke.
export function tick(g, x, y, s, p, col = C.red, t = 0) {
  if (p <= 0) return;
  const pts = [[x - s * .5, y], [x - s * .12, y + s * .4], [x + s * .6, y - s * .55]];
  const q = clamp(p);
  const n = q < .4 ? [pts[0], [lerp(pts[0][0], pts[1][0], q / .4), lerp(pts[0][1], pts[1][1], q / .4)]]
    : [pts[0], pts[1], [lerp(pts[1][0], pts[2][0], (q - .4) / .6), lerp(pts[1][1], pts[2][1], (q - .4) / .6)]];
  gpen(g, n, s * .16, { col, t, taper: [.1, .5], seed: x });
}
