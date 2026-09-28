// Paper cut-outs: the people, and the places they stand in, drawn by an image model (Codex's
// built-in image generation) from our briefs and reference sheets, then cut out of their sheets
// (tools/cutout.py, tools/backdrops.py). They move the way paper cut-out animation does: each
// figure is a flat piece of card that sways on its feet, breathes, bobs on the beat and is swapped
// for another pose with a pop, and it moves on twos (twelve drawings a second, each placed by a
// slightly different hand) while the camera moves on every frame. A thin edge of paper and a soft
// shadow behind each piece make it read as card.
import { clamp, hash, beatPos } from './kit.js';

export const CAST = {};   // figure name -> { img, w, h, head: fraction of h above the crown }
export const BACK = {};   // backdrop name -> { img, w, h, and what tools/backdrops.py measured }
const BASE = '/video/ep02/cutlight/cast/';

export async function loadCast() {
  const get = u => fetch(BASE + u).then(r => r.json());
  const [idx, bk] = await Promise.all([get('index.json'), get('backdrops.json')]);
  const load = async n => { const img = new Image(); img.src = BASE + n + '.webp'; await img.decode(); return img; };
  await Promise.all([
    ...Object.entries(idx).map(async ([n, d]) => { CAST[n] = { ...d, img: await load(n) }; }),
    ...Object.entries(bk).map(async ([n, d]) => { BACK[n] = { ...d, img: await load(n) }; }),
  ]);
}

const seedOf = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; };

// A figure's silhouette in one colour (softened by blur px), or the figure washed with a colour
// (wash: the tint's strength over the picture), made once and kept.
const CACHE = new Map();
function cached(key, w, h, draw) {
  let c = CACHE.get(key);
  if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')); CACHE.set(key, c); }
  return c;
}
const PAD = 12;
function silhouette(name, col, blur = 0) {
  const f = CAST[name];
  return cached(`${name}|s|${col}|${blur}`, f.w + PAD * 2, f.h + PAD * 2, x => {
    if (blur) x.filter = `blur(${blur}px)`;
    x.drawImage(f.img, PAD, PAD);
    x.filter = 'none';
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = col; x.fillRect(0, 0, f.w + PAD * 2, f.h + PAD * 2);
  });
}
function washed(name, col, k) {
  const f = CAST[name];
  return cached(`${name}|w|${col}|${k}`, f.w, f.h, x => {
    x.drawImage(f.img, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.globalAlpha = k; x.fillStyle = col; x.fillRect(0, 0, f.w, f.h);
  });
}

// Jointed figures: a piece of the card (a forearm and hand) cut free along a line and pinned, as a
// paper puppet's limb is, swung about its pin each drawing. The piece is cut a little past its
// joint and feathered there, so no gap opens as it swings. In image px: poly, pin, and the swing.
export const JOINTS = {};
function jointed(name, t) {
  const f = CAST[name], parts = JOINTS[name];
  const c = CACHE.get(name + '|j') || (() => { const cv = document.createElement('canvas'); cv.width = f.w; cv.height = f.h; CACHE.set(name + '|j', cv); return cv; })();
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  x.clearRect(0, 0, f.w, f.h);
  x.drawImage(f.img, 0, 0);
  const path = (ctx, poly, grow = 0) => { ctx.beginPath(); poly.forEach(([px, py], i) => { const q = [px, py + (py > poly[0][1] + 100 ? grow : 0)]; i ? ctx.lineTo(...q) : ctx.moveTo(...q); }); ctx.closePath(); };
  for (const pt of parts) {
    // The piece, cut a little past its joint, the extra feathered away.
    // Solid over all of the cut, feathered only below it, where the card beneath is whole.
    const cutY = Math.max(...pt.poly.map(q => q[1]));
    const pc = cached(name + '|piece|' + pt.pin, f.w, f.h, y => {
      y.save(); path(y, pt.poly, 34); y.clip(); y.drawImage(f.img, 0, 0); y.restore();
      y.globalCompositeOperation = 'destination-in';
      const gr = y.createLinearGradient(0, cutY + 2, 0, cutY + 30);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      y.fillStyle = gr; y.fillRect(0, 0, f.w, f.h);
    });
    x.globalCompositeOperation = 'destination-out';
    path(x, pt.poly); x.fill();
    x.globalCompositeOperation = 'source-over';
    x.save(); x.translate(pt.pin[0], pt.pin[1]); x.rotate(pt.swing(t)); x.translate(-pt.pin[0], -pt.pin[1]);
    x.drawImage(pc, 0, 0); x.restore();
  }
  return c;
}
// A silhouette of a canvas made this frame (a jointed figure), not kept.
function silNow(src, col, blur = 0) {
  const c = CACHE.get('|now|' + col + blur) || document.createElement('canvas');
  CACHE.set('|now|' + col + blur, c);
  c.width = src.width + PAD * 2; c.height = src.height + PAD * 2;
  const x = c.getContext('2d');
  if (blur) x.filter = `blur(${blur}px)`;
  x.drawImage(src, PAD, PAD); x.filter = 'none';
  x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  return c;
}

// figure(g, name, x, y, h, o): the cut-out `name` with its feet (or its cut edge) at (x, y), the
// person h tall from the feet to the crown, in g's units.
//   o: { t, seed, flip, sway, breathe, jitter (px), bounce, beatOff, pop (time of a pose change),
//        lift (px up), rot, alpha, edge (colour, or false), edgeW (px), shadow ([dx, dy, a] or
//        false), wash ([colour, strength]), halo ([colour, alpha, blur px]),
//        draw (g, x, y, w, h): drawn on the card, in the image's box }
// Returns the figure's crown and its drawn box, for placing things by it.
export const TWOS = 12;
export function figure(g, name, x, y, h, o = {}) {
  const f = CAST[name];
  if (!f || h < 2) return null;
  const t = o.t ?? 0, seed = o.seed ?? seedOf(name);
  const fr = Math.floor(t * TWOS), tq = fr / TWOS;
  const k = h / (f.h * (1 - (f.head || 0)));
  const w = f.w * k, hh = f.h * k;
  // The card's own life, on twos: a sway about the feet, breath, a hand that never sets it down in
  // quite the same place twice.
  const sway = (o.sway ?? 1) * .011 * Math.sin(tq * 2 * Math.PI / (2.4 + hash(seed, 1) * 1.6) + seed);
  const br = (o.breathe ?? 1) * .006 * Math.sin(tq * 2 * Math.PI / (2.8 + hash(seed, 2) * 1.2) + seed * 2);
  const jit = o.jitter ?? .6;
  const jx = (hash(fr, seed, 3) - .5) * jit, jy = (hash(fr, seed, 4) - .5) * jit * .5, jr = (hash(fr, seed, 5) - .5) * .003 * (jit ? 1 : 0);
  let bounce = 0;
  if (o.bounce) bounce = o.bounce * h * .05 * Math.abs(Math.sin(Math.PI * beatPos(tq + (o.beatOff || 0))));
  let pop = 1;
  if (o.pop !== undefined && t >= o.pop) pop = 1 + .16 * Math.pow(1 - clamp((t - o.pop) / .22), 2);
  const fl = o.flip ? -1 : 1;
  g.save();
  g.translate(x + jx, y + jy - bounce - (o.lift || 0));
  g.rotate(sway + jr + (o.rot || 0));
  g.scale(fl * pop * (1 - br * .5), pop * (1 + br));
  const a0 = g.globalAlpha * (o.alpha ?? 1);
  const X = -w / 2, Y = -hh, pk = k;                     // image px -> g units
  const drawSil = (c, dx = 0, dy = 0) => g.drawImage(c, X - PAD * pk + dx, Y - PAD * pk + dy, c.width * pk, c.height * pk);
  const joint = JOINTS[name] ? jointed(name, tq) : null;
  const sil = (col, blur) => joint ? silNow(joint, col, blur) : silhouette(name, col, blur);
  if (o.halo) { g.globalAlpha = a0 * o.halo[1]; drawSil(sil(o.halo[0], o.halo[2] ?? 8)); }
  if (o.shadow !== false) {
    const [sx, sy, sa] = o.shadow || [3.5, 3, .3];
    g.globalAlpha = a0 * sa;
    drawSil(sil('#1a1018', 3), sx * fl, sy);
  }
  if (o.edge !== false) {
    const e = sil(o.edge || '#f7f0e2', 0), ew = o.edgeW ?? 1.5;
    g.globalAlpha = a0 * (o.edgeA ?? .95);
    for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; drawSil(e, Math.cos(an) * ew, Math.sin(an) * ew); }
  }
  g.globalAlpha = a0;
  g.drawImage(joint || (o.wash ? washed(name, o.wash[0], o.wash[1]) : f.img), X, Y, w, hh);
  // Anything that belongs on the card (the words on Jess's note) moves with it.
  o.draw?.(g, X, Y, w, hh);
  g.restore();
  return { crown: [x, y - h - bounce], box: [x - w / 2, y - hh, x + w / 2, y] };
}
