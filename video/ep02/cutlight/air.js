// The air in the mirror box, inked: stage beams as bundles of fine white lines, smoke as white
// billows with an inked edge, light pouring from the cut words as rays, and the wet shine of the
// floor, where reflections break into streaks.
import { W, H, clamp, lerp, hash, noise, rgba, mix } from './kit.js';
import { project } from './space.js';
import { INK, boil } from './ink.js';
import { layer, put, blurred } from './post.js';

// A stage beam from a lamp down to a pool on the floor: a faint coloured glow, and inside it a
// fan of fine lines, the way a pen draws light in smoke.
export function beamInk(g, c, from, to, radius, col, k = 1, E = null, t = 0) {
  const a = project(c, from), b = project(c, to);
  if (a.z < c.near || b.z < c.near) return;
  const r0 = Math.max(2, 5 * a.s), r1 = Math.max(4, radius * b.s);
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const poly = [[a.x + nx * r0, a.y + ny * r0], [b.x + nx * r1, b.y + ny * r1], [b.x - nx * r1, b.y - ny * r1], [a.x - nx * r0, a.y - ny * r0]];
  g.save();
  g.globalCompositeOperation = 'screen';
  const gr = g.createLinearGradient(a.x, a.y, b.x, b.y);
  gr.addColorStop(0, rgba(col, .22 * k)); gr.addColorStop(.6, rgba(col, .07 * k)); gr.addColorStop(1, rgba(col, .015 * k));
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(...poly[0]); for (const p of poly.slice(1)) g.lineTo(...p); g.closePath(); g.fill();
  // The lines: from the lamp outwards, each fading before the floor.
  const n = Math.round(4 + radius * .06), bb = boil(t);
  for (let i = 0; i < n; i++) {
    const u = (i + hash(i, bb, 2) * .8) / n * 2 - 1;
    const ex = b.x + nx * r1 * u, ey = b.y + ny * r1 * u;
    const len = .45 + hash(i, bb, 3) * .5;
    const lg = g.createLinearGradient(a.x, a.y, ex, ey);
    lg.addColorStop(0, rgba(mix(col, '#ffffff', .6), .16 * k)); lg.addColorStop(len * .55, rgba(col, 0));
    g.strokeStyle = lg; g.lineWidth = .7 + hash(i, bb, 4) * .9;
    g.beginPath(); g.moveTo(a.x + nx * r0 * u, a.y + ny * r0 * u); g.lineTo(ex, ey); g.stroke();
  }
  // The pool on the floor.
  const pool = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, r1 * 1.15);
  pool.addColorStop(0, rgba(col, .38 * k)); pool.addColorStop(1, rgba(col, 0));
  g.fillStyle = pool;
  g.beginPath(); g.ellipse(b.x, b.y, r1 * 1.15, r1 * .3, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  if (E) { E.save(); E.globalCompositeOperation = 'lighter'; E.fillStyle = rgba(col, .5 * k); E.beginPath(); E.arc(a.x, a.y, Math.max(3, 14 * a.s), 0, Math.PI * 2); E.fill(); E.restore(); }
}

// Smoke: billows at the floor, white and soft, with an inked underside, lit by a colour.
export function smoke(g, c, x, z, w, h, col, t, seed = 0, k = 1) {
  const bb = boil(t);
  g.save();
  for (let i = 0; i < 9; i++) {
    const u = hash(i, seed) - .5, drift = noise(t * .25 + i, seed) * 18;
    const p = project(c, [x + u * w + drift, h * (.25 + hash(i, seed, 2) * .75), z + (hash(i, seed, 3) - .5) * 60]);
    if (p.z < c.near) continue;
    const r = (30 + hash(i, seed, 4) * 40) * p.s * (w / 180);
    const gr = g.createRadialGradient(p.x, p.y - r * .2, r * .1, p.x, p.y, r);
    gr.addColorStop(0, rgba(mix('#ffffff', col, .35), .16 * k)); gr.addColorStop(.7, rgba(mix('#ffffff', col, .5), .07 * k)); gr.addColorStop(1, rgba(col, 0));
    g.fillStyle = gr;
    g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
    // An inked edge along the underside of the billow, broken, boiling.
    g.strokeStyle = rgba(mix('#ffffff', col, .4), .22 * k); g.lineWidth = .9;
    g.beginPath();
    const a0 = .2 + hash(i, bb, 5) * .4, a1 = Math.PI - .2 - hash(i, bb, 6) * .4;
    g.arc(p.x, p.y, r * .82, a0, a1); g.stroke();
  }
  g.restore();
}

// Rays: light from a cut in the wall, drawn as fine lines fanning out from the hole towards the
// camera and the floor. pts: screen points on the lit shapes; toward: where the rays go.
export function rays(g, pts, toward, len, col, k, t) {
  const bb = boil(t);
  g.save();
  g.globalCompositeOperation = 'screen';
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    const dx = toward[0] - x, dy = toward[1] - y, l = Math.hypot(dx, dy) || 1;
    const L = len * (.5 + hash(i, bb, 1) * .7);
    const ex = x + dx / l * L, ey = y + dy / l * L;
    const gr = g.createLinearGradient(x, y, ex, ey);
    gr.addColorStop(0, rgba(col, .26 * k)); gr.addColorStop(1, rgba(col, 0));
    g.strokeStyle = gr; g.lineWidth = 1 + hash(i, bb, 2) * 2.4;
    g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
  }
  g.restore();
}

// The wet floor: a reflection layer, sharp near the feet, broken into horizontal streaks further
// off, as a pen draws water.
export function streaks(L, y0, t, k = 1) {
  const bb = boil(t);
  L.save();
  L.globalCompositeOperation = 'destination-out';
  for (let y = y0; y < H; y += 3) {
    const f = clamp((y - y0) / 600);
    if (hash(Math.floor(y / 3), bb) < f * .75 * k) {
      L.fillStyle = 'rgba(0,0,0,.85)';
      const x0 = hash(y, bb, 2) * W * .3, x1 = W - hash(y, bb, 3) * W * .3;
      L.fillRect(x0, y, x1 - x0, 2 + f * 3);
    }
  }
  L.restore();
}

// Moths: the bugs. They come in through the holes from the outside, where the people are, and
// flutter in the shafts of light, black against it. Each is a body and two pairs of wings that beat.
export function moth(g, x, y, s, t, seed, col = '#d8cdb8') {
  const beat = Math.sin(t * 38 + seed * 7);
  const open = .35 + .65 * Math.abs(beat);
  const rot = Math.sin(t * 3 + seed) * .5;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = col;
  for (const side of [-1, 1]) {
    g.save(); g.scale(side * open, 1);
    g.beginPath(); g.moveTo(0, -2); g.bezierCurveTo(8, -14, 22, -12, 20, -2); g.bezierCurveTo(18, 4, 8, 4, 0, 1); g.fill();
    g.beginPath(); g.moveTo(0, 1); g.bezierCurveTo(10, 4, 16, 12, 10, 15); g.bezierCurveTo(5, 16, 2, 9, 0, 4); g.fill();
    g.restore();
  }
  g.beginPath(); g.ellipse(0, 2, 2.2, 8, 0, 0, Math.PI * 2); g.fill();
  // The dark marks on the wings, and the ink round them.
  g.fillStyle = 'rgba(40,30,26,.7)';
  for (const side of [-1, 1]) { g.beginPath(); g.ellipse(side * 11 * open, -4, 3.2 * open, 2.4, 0, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = .8; g.beginPath(); g.moveTo(-1, -5); g.quadraticCurveTo(-4, -12, -7, -13); g.moveTo(1, -5); g.quadraticCurveTo(4, -12, 7, -13); g.stroke();
  g.restore();
}
// A swarm: n moths from points (the holes) out into the room over time since t0.
export function swarm(g, from, t, t0, n, seed = 0, E = null, down = false) {
  const age = t - t0;
  if (age < 0) return;
  for (let i = 0; i < n; i++) {
    const src = from[i % from.length];
    const d = Math.max(0, age - hash(i, seed) * .35);
    if (d <= 0) continue;
    // down: they fly into the room and down, away from the words above.
    // down: into the room and down; 'up': up and away from where they came in.
    const ang = down === 'up' ? Math.PI + .25 + hash(i, seed, 2) * (Math.PI - .5) : down ? .15 + hash(i, seed, 2) * (Math.PI - .3) : hash(i, seed, 2) * Math.PI * 2;
    const r = 60 + d * (160 + hash(i, seed, 3) * 260);
    const x = src[0] + Math.cos(ang) * r * .8 + Math.sin(t * 2.3 + i) * 30, y = src[1] + Math.sin(ang) * r * .5 + (down === 'up' ? -d * 90 : d * 120) + Math.cos(t * 1.7 + i) * 24;
    moth(g, x, y, 1.8 + hash(i, seed, 4) * 2.2, t, i + seed);
    if (E) { E.fillStyle = 'rgba(255,240,210,.25)'; E.beginPath(); E.arc(x, y, 18, 0, Math.PI * 2); E.fill(); }
  }
}

// A tick, as a polygon (for cutting a check mark out of the glass). Centre (u, v), size s.
export function tickPoly(u, v, s) {
  return [[-.5, .05], [-.32, -.13], [-.12, .07], [.36, -.45], [.54, -.27], [-.12, .43]].map(([x, y]) => [u + x * s, v - y * s]);
}

// The riff's cuts: each note a laser sweeping a line across the wall, leaving a scar that cools.
// slashes: [{ t, a: [u, v], b: [u, v] }] on plane m.
import { ap } from './space.js';
export function slashes(g, E, c, m, list, t, col) {
  const [r, gg, b] = [parseInt(col.slice(1, 3), 16), parseInt(col.slice(3, 5), 16), parseInt(col.slice(5, 7), 16)];
  for (const s of list) {
    if (t < s.t) continue;
    const p = clamp((t - s.t) / .06), age = t - s.t;
    const pa = project(c, ap(m, [s.a[0], s.a[1], 0])), pb = project(c, ap(m, [lerp(s.a[0], s.b[0], p), lerp(s.a[1], s.b[1], p), 0]));
    if (pa.z < c.near || pb.z < c.near) continue;
    const heat = Math.exp(-age / .25);
    for (const [ctx, w, a] of [[g, 5 * heat + 1.2, .35 + .5 * heat], [E, 10 * heat + 2, .6 * heat + .15]]) {
      ctx.strokeStyle = `rgba(${r},${gg},${b},${a})`; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    }
    g.strokeStyle = `rgba(255,255,255,${.3 + .7 * heat})`; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(pa.x, pa.y); g.lineTo(pb.x, pb.y); g.stroke();
    if (p < 1) { E.fillStyle = '#fff'; E.beginPath(); E.arc(pb.x, pb.y, 12, 0, Math.PI * 2); E.fill(); }
  }
}
// Slashes from riff notes: angle from the pitch, spread over a region of the wall.
export function slashesFrom(notes, u0, u1, v0, v1, seed = 0) {
  return notes.map(([tt, midi, st], i) => {
    const a = (midi % 12) / 12 * Math.PI + i * .35, len = 160 + (midi - 50) * 4;
    const cx = lerp(u0, u1, hash(i, seed, 1)), cy = lerp(v0, v1, hash(i, seed, 2));
    return { t: tt, st, a: [cx - Math.cos(a) * len / 2, cy - Math.sin(a) * len / 2], b: [cx + Math.cos(a) * len / 2, cy + Math.sin(a) * len / 2] };
  });
}
