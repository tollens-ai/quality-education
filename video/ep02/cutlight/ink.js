// Ink: the film is drawn like a manga page that moves. Every surface is inked from its light:
// paper white where the light hits, parallel hatching in the half-tones, cross-hatching deeper,
// solid black in shadow. The hatching is drawn in the face's own directions, so it turns with the
// thing it's on, and it boils on twos (12 drawings a second), as a hand-drawn line does. Colour is
// only light: Clawd's own terracotta, the band's four lights, and daylight.
import { clamp, lerp, hash, mix, rgba } from './kit.js';

export const INK = { col: '#0c0b0d', paper: '#f3efe6', t: 0 };
export const boil = t => Math.floor(t * 12);

// Hatch a screen polygon pp (from a projected face) at tone 0..1. dir is the hatch direction as a
// screen vector; spacing in master px. Deeper tones add a second pass across the first.
export function hatch(g, pp, tone, o = {}) {
  const ramp = o.ramp; // { a: [x, y], b: [x, y], ta, tb }: tone varies from a to b
  if (tone <= .04 && !(ramp && Math.max(ramp.ta, ramp.tb) > .04)) return;
  const t = o.t ?? INK.t, b = boil(t);
  const seed = (o.seed ?? 0) + b * 7.3;
  let [dx, dy] = o.dir || [1, -.55];
  const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const sp = o.spacing ?? lerp(o.max ?? 13, o.min ?? 4.2, clamp(tone));
  const w = o.w ?? 1.25;
  // Bounds of the polygon.
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pp) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  if (x1 - x0 < 1 || y1 - y0 < 1) return;
  g.save();
  g.beginPath(); g.moveTo(pp[0][0], pp[0][1]); for (let i = 1; i < pp.length; i++) g.lineTo(pp[i][0], pp[i][1]); g.closePath();
  g.clip();
  g.strokeStyle = o.col || INK.col;
  g.lineCap = 'round';
  const passes = (ramp ? Math.max(ramp.ta, ramp.tb) : tone) > .62 ? 2 : 1;
  for (let pass = 0; pass < passes; pass++) {
    // The second pass crosses the first at about 70 degrees.
    const a = pass ? Math.atan2(dy, dx) + 1.22 : Math.atan2(dy, dx);
    const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
    const s = pass ? sp * 1.35 : sp;
    const n = Math.ceil(R * 2 / s);
    for (let i = 0; i <= n; i++) {
      const off = -R + i * s + (hash(i, seed, pass) - .5) * s * .35;
      const px = cx + nx * off, py = cy + ny * off;
      // Each stroke starts and stops a little short, and swells in the middle: a pen, not a rule.
      const j0 = (hash(i, seed, 3 + pass) - .5) * R * .12, j1 = (hash(i, seed, 5 + pass) - .5) * R * .12;
      const ax = px - ux * (R + j0), ay = py - uy * (R + j0), bx = px + ux * (R + j1), by = py + uy * (R + j1);
      const bend = (hash(i, seed, 9) - .5) * s * .5;
      g.lineWidth = w * (.75 + hash(i, seed, 11) * .5) * (pass ? .9 : 1);
      if (ramp) {
        // Keep the part of the stroke where the local tone is deep enough for this line: strokes
        // start in the shadow and stop short as the light comes up, as a pen hatches.
        const need = (pass ? .55 : .12) + hash(i, seed, 13) * .3;
        const rx = ramp.b[0] - ramp.a[0], ry = ramp.b[1] - ramp.a[1], rl = rx * rx + ry * ry || 1;
        const toneAt = (x, y) => lerp(ramp.ta, ramp.tb, clamp(((x - ramp.a[0]) * rx + (y - ramp.a[1]) * ry) / rl));
        const N = 10;
        let on = false;
        g.beginPath();
        for (let q = 0; q <= N; q++) {
          const s2 = q / N, x = lerp(ax, bx, s2) + nx * bend * 4 * s2 * (1 - s2), y = lerp(ay, by, s2) + ny * bend * 4 * s2 * (1 - s2);
          const ok = toneAt(x, y) > need;
          if (ok && !on) { g.moveTo(x, y); on = true; } else if (ok) g.lineTo(x, y); else on = false;
        }
        g.stroke();
        continue;
      }
      g.beginPath(); g.moveTo(ax, ay);
      g.quadraticCurveTo((ax + bx) / 2 + nx * bend, (ay + by) / 2 + ny * bend, bx, by);
      g.stroke();
    }
  }
  g.restore();
}

// Screentone: dots on a grid, their size by tone, for skies, haze and soft light.
export function tone(g, pp, k, o = {}) {
  if (k <= .03) return;
  const s = o.spacing ?? 7;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pp) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  g.save();
  g.beginPath(); g.moveTo(pp[0][0], pp[0][1]); for (let i = 1; i < pp.length; i++) g.lineTo(pp[i][0], pp[i][1]); g.closePath();
  g.clip();
  g.fillStyle = o.col || INK.col;
  const r = Math.sqrt(clamp(k)) * s * .56;
  const a = o.angle ?? .785;
  const ca = Math.cos(a), sa = Math.sin(a);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + s;
  g.beginPath();
  for (let u = -R; u <= R; u += s) for (let v = -R; v <= R; v += s) {
    const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
    if (x < x0 - s || x > x1 + s || y < y0 - s || y > y1 + s) continue;
    const rr = o.grad ? r * clamp(o.grad(x, y)) : r;
    if (rr < .3) continue;
    g.moveTo(x + rr, y); g.arc(x, y, rr, 0, Math.PI * 2);
  }
  g.fill();
  g.restore();
}

// Speed lines, radiating from a point: the manga way to draw a hit, a rush of light, a shock.
export function focusLines(g, cx, cy, r0, r1, n, o = {}) {
  const t = o.t ?? INK.t, b = boil(t);
  g.save();
  g.fillStyle = o.col || INK.col;
  for (let i = 0; i < n; i++) {
    const a = (i + hash(i, b, 1) * .8) / n * Math.PI * 2;
    if (o.gap && hash(i, b, 4) < o.gap) continue;
    const w = (o.w ?? .012) * (.4 + hash(i, b, 2));
    const ra = r0 * (.85 + hash(i, b, 3) * .4);
    g.beginPath();
    g.moveTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1);
    g.lineTo(cx + Math.cos(a) * ra, cy + Math.sin(a) * ra);
    g.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1);
    g.closePath(); g.fill();
  }
  g.restore();
}
