// Fairground marquee lettering: painted letters with light bulbs set inside the strokes.
// Letters light up (with a quick flicker) from their own onset time.
import { C, clamp, lerp, smooth, rnd, rr, glow, bulb, vgrad, lgrad, rgba, mix, shade } from './kit.js';

const cache = new Map();
function grid(txt, size, spacing, weight, stretch) {
  const key = `${txt}|${size}|${spacing}|${weight}|${stretch}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  const x = c.getContext('2d');
  const font = `${weight} ${size}px Bricolage`;
  x.font = font; x.fontStretch = stretch || 'normal';
  const letters = [...txt];
  const widths = letters.map(l => x.measureText(l).width);
  const w = Math.ceil(x.measureText(txt).width + size * .2), h = Math.ceil(size * 1.3);
  c.width = w; c.height = h;
  x.font = font; x.fontStretch = stretch || 'normal'; x.textBaseline = 'alphabetic'; x.fillStyle = '#fff';
  x.fillText(txt, size * .1, size * 1.02);
  const data = x.getImageData(0, 0, w, h).data;
  const A = (px, py) => (px < 0 || py < 0 || px >= w || py >= h) ? 0 : data[(Math.round(py) * w + Math.round(px)) * 4 + 3];
  // Letter spans, to tag each bulb with its letter.
  const spans = []; let acc = size * .1;
  for (const lw of widths) { spans.push([acc, acc + lw]); acc += lw; }
  const pts = [];
  const r = spacing * .34;
  for (let py = spacing / 2; py < h; py += spacing) for (let px = spacing / 2; px < w; px += spacing) {
    if (A(px, py) > 200 && A(px - r, py) > 100 && A(px + r, py) > 100 && A(px, py - r) > 100 && A(px, py + r) > 100) {
      const li = spans.findIndex(([a, b]) => px >= a && px < b);
      pts.push([px, py, Math.max(0, li)]);
    }
  }
  const out = { w, h, pts, spans, n: letters.length };
  cache.set(key, out);
  return out;
}

// Draw txt centred at (x, y) (y = baseline), size px. o: { onAt: [per-letter times] or t0,
// letterGap (s), face, edge, bulbCol, spacing, t, chase, alpha, weight, stretch, depth }
export function bulbText(g, txt, x, y, size, o = {}) {
  const weight = o.weight || 800, spacing = o.spacing || Math.max(10, size * .13);
  const G = grid(txt, size, spacing, weight, o.stretch);
  const t = o.t || 0;
  const ox = x - G.w / 2, oy = y - size * 1.02;
  const letterOn = i => {
    const t0 = Array.isArray(o.onAt) ? o.onAt[i] : (o.t0 ?? -1e9) + i * (o.letterGap ?? .04);
    const d = t - t0;
    if (d < 0) return 0;
    if (d < .12) return d < .04 ? 1 : d < .08 ? .25 : 1;
    return 1;
  };
  g.save();
  g.globalAlpha *= o.alpha ?? 1;
  const font = `${weight} ${size}px Bricolage`;
  g.font = font; g.fontStretch = o.stretch || 'normal'; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  // Painted letter faces, drawn letter by letter so each can light on its own.
  const letters = [...txt];
  letters.forEach((l, i) => {
    const on = letterOn(i);
    const lx = ox + G.spans[i][0];
    const depth = o.depth ?? size * .06;
    g.fillStyle = shade(o.edge || '#7a1030', -.45);
    for (let d = depth; d > 0; d -= Math.max(1, depth / 6)) g.fillText(l, lx + d * .5, oy + size * 1.02 + d);
    g.fillStyle = on > .5 ? lgrad(g, 0, oy, 0, oy + size * 1.1, [[0, shade(o.face || '#ff4a6e', .2)], [1, shade(o.face || '#ff4a6e', -.25)]]) : shade(o.face || '#ff4a6e', -.55);
    g.fillText(l, lx, oy + size * 1.02);
    g.lineWidth = Math.max(2, size * .025); g.strokeStyle = on > .5 ? (o.rim || '#ffe7b0') : '#3a2030';
    g.strokeText(l, lx, oy + size * 1.02);
  });
  // Bulbs.
  const r = spacing * (o.bulbR || .26);
  for (let k = 0; k < G.pts.length; k++) {
    const [px, py, li] = G.pts[k];
    const on = letterOn(li);
    if (on <= 0) { g.fillStyle = 'rgba(60,40,50,.9)'; g.beginPath(); g.arc(ox + px, oy + py, r, 0, 7); g.fill(); continue; }
    const ch = o.chase ? .55 + .45 * (Math.sin((px * .03 - t * o.chase)) > -.3 ? 1 : 0) : 1;
    bulb(g, ox + px, oy + py, r, o.bulbCol || C.bulb, on * ch);
  }
  if ((o.glowA ?? 1) > 0) {
    const lit = letters.reduce((a, l, i) => a + letterOn(i), 0) / letters.length;
    glow(g, x, y - size * .45, G.w * .7, o.bulbCol || C.bulb, .22 * lit * (o.glowA ?? 1));
  }
  g.restore();
  return G;
}

export function measureBulb(txt, size, o = {}) { return grid(txt, size, o.spacing || Math.max(10, size * .13), o.weight || 800, o.stretch).w; }
