// A frame inside the mirror box, put together: the back wall with its cuts and the day behind
// them, the reflections, the floor, the smoke and the beams, the band rim-lit in their colours,
// and the light. Scenes pass what's in the shot; this does the layering the same way every time.
import { W, H, clamp, lerp, mix, rgba, hash, hit, env } from './kit.js';
import { setLights, project, ap, STYLE, mirrored, reflector, projPoly, tracePoly, screenToPlane } from './space.js';
import { drawCuts } from './type.js';
import { layer, put, glow, shafts, grain, vignette, rimmed, blurred, split, glitch } from './post.js';
import { backWall, floorPlane, floorReflection, wallReflection, ROOM, WALL } from './room.js';
import { beamInk, smoke, rays, streaks } from './air.js';
import { INK, focusLines } from './ink.js';
import { amp } from './gear.js';
import { tube, drawSolid, boxFaces, M, T } from './space.js';
import { P, BAND } from './palette.js';

export const KEY = '#fff0d8';

// o: {
//   lights   setLights config (view is filled in)
//   cuts     [cut words], cutOpt { outside(L, c), laser, light, fall, ... }
//   band     [{ name, col, rimDir: [x, y], draw(L, c) }], drawn far to near in the order given
//   smoke    [[x, z, w, h, col, seed, k]], beams [[from, to, radius, col, k]]
//   refl     { floor: true, wall: levels }
//   rays     rays from the cuts (k)
//   sun      world point the shafts come from
//   blurBack px of depth-of-field blur on everything behind the band
//   before(g, E), after(g, E): shot-specific drawing, under and over the band
//   post     { glow: [k1, k2], shafts: k, split: px, glitch: amount, vignette, grain }
// }
export function boxFrame(g, t, c, o) {
  STYLE.ink = true; INK.t = t;
  setLights({ ...o.lights, view: c.pos });
  const E = layer('emit');
  const B = o.blurBack ? layer('back') : g;
  B.fillStyle = INK.col; B.fillRect(0, 0, W, H);
  const band = o.band || [];
  // A member with reflOnly stands behind the camera: only his reflection in the back wall is seen.
  const drawBand = (L, cc) => { for (const it of band) if (!it.reflOnly) it.draw(L, cc); };
  backWall(B, c, { ink: true, col: INK.col, frame: o.frame || '#34343c', under: L => {
    if (o.refl?.hero) heroReflection(L, c, band, o.refl);
    if (o.see > 0) seeThrough(L, o.seeView || o.cutOpt?.outside, o.see, o.seeTint, o.seeFade, o.seeMask);
    (o.panes || []).forEach((p, i) => litPanes(L, c, t, o.refl?.hero ? p : { ...p, ghost: 0 }, E, i));
  } });
  if (o.refl?.hero) {
    if (o.refl.wall) wallReflection(B, c, drawBand, { alpha: .12, levels: o.refl.wall, decay: .5 });
  } else if (o.refl?.wall) wallReflection(B, c, drawBand, { alpha: o.refl.wallA ?? .28, levels: o.refl.wall, decay: .5 });
  const co = { E, laser: BAND.clawd.col, light: .55, thick: 4, ...o.cutOpt };
  if (o.cuts?.length) drawCuts(B, c, t, o.cuts, co);
  o.behind?.(B, E);
  floorPlane(B, c, { col: INK.col, frame: '#2a2a31' });
  (o.panes || []).forEach((p, i) => { if (p.floor !== false) paneFloor(B, c, p, i); });
  if (o.refl?.floor !== false) floorReflection(B, c, (L, cc) => {
    if (o.cuts?.length) drawCuts(L, cc, t, o.cuts, { ...co, outside: L2 => co.outside(L2, cc), E: null, noAudit: true });
    drawBand(L, cc);
    streaks(L, project(c, [0, 0, 60]).y, t, 1);
  }, { alpha: o.refl?.floorA ?? .8, fade: 1100, blur: 1.5 });
  if (o.rays && o.cuts?.length) {
    const rp = [];
    for (const cw of o.cuts) for (const pc of cw.pieces) if (hash(pc.c[0], pc.c[1]) < .5 && t >= (cw.w.v ?? 0)) { const p = project(c, ap(cw.m, [pc.c[0], pc.c[1], 0])); rp.push([p.x, p.y]); }
    rays(B, rp, o.rayTo || [W / 2, H * 1.3], o.rayLen || 900, '#fff3dc', o.rays, t);
  }
  if (o.set) stageSet(B, c, t, E);
  for (const s of o.smoke || []) smoke(B, c, s[0], s[1], s[2], s[3], s[4], t, s[5] || 1, s[6] ?? .55);
  for (const b of o.beams || []) beamInk(B, c, b[0], b[1], b[2], b[3], b[4] ?? .8, E, t);
  if (o.blurBack) put(g, blurred('backBlur', B, o.blurBack, .5));
  o.before?.(g, E);
  for (const it of band) {
    if (it.reflOnly) continue;
    const rims = [{ col: INK.paper, lx: it.rimDir?.[0] ?? 0, ly: it.rimDir?.[1] ?? -1, d: it.rim ?? 3.2, k: .95, glow: .5 }];
    if (it.col) rims.push({ col: it.col, lx: it.side ?? -(it.rimDir?.[0] ?? 0) * 2, ly: .2, d: (it.rim ?? 3.2) * .75, k: .9, glow: .5 });
    rimmed(g, 'm_' + it.name, L => it.draw(L, c), rims, { E });
  }
  o.after?.(g, E);
  const po = o.post || {};
  const sun = project(c, o.sun || [60, 380, -3000]);
  if (po.shafts !== 0) shafts(g, E, sun.x, sun.y, { len: .7, k: po.shafts ?? .38, n: 26, soft: 4 });
  glow(g, E, { k1: po.glow?.[0] ?? .22, k2: po.glow?.[1] ?? .3, r1: 6, r2: 40 });
  // Manga speed lines on the big hits: white wedges rushing in from the frame's edge.
  if (po.focus > .05) { g.save(); g.globalAlpha = Math.min(1, po.focus) * .55; focusLines(g, W / 2, H * .42, H * .42, H * 1.1, 90, { col: '#f3efe6', t, w: .008, gap: .3 }); g.restore(); }
  if (po.split) split(g, po.split);
  if (po.glitch) glitch(g, t, po.glitch);
  vignette(g, po.vignette ?? .6);
  grain(g, t, po.grain ?? .035);
}

// Facing the mirror, he meets his own eyes: each member drawn again from the mirrored camera,
// clear and rimmed in his colour, the glass only cooling and dimming him a little.
function heroReflection(g, c, band, r) {
  const cm = mirrored(c, reflector([0, 0, ROOM.back], [0, 0, 1]));
  const R = layer('heroRefl');
  for (const it of band) rimmed(R, 'mr_' + it.name, L => it.draw(L, cm), [
    { col: INK.paper, lx: -(it.rimDir?.[0] ?? 0), ly: it.rimDir?.[1] ?? -1, d: 2.4, k: .7 },
    ...(it.col ? [{ col: it.col, lx: it.rimDir?.[0] ?? 0, ly: .2, d: 2, k: .8 }] : []),
  ]);
  R.save(); R.setTransform(1, 0, 0, 1, 0, 0); R.globalCompositeOperation = 'source-atop';
  R.fillStyle = rgba(r.tint || '#0c1624', r.tintK ?? .28); R.fillRect(0, 0, R.canvas.width, R.canvas.height);
  R.restore();
  put(g, blurred('heroReflB', R, r.blur ?? .6, 1), { alpha: r.heroA ?? .9 });
}

// One-way glass turns to a window when the far side is the brighter: the day outside shows
// through the dark glass, k of the way, the reflections fading as it comes.
// The words' part of the wall (the top) stays dark glass, so they keep their edge; the glass
// clears lower down, where the people are.
function seeThrough(g, view, k, tint, fade = [640, 1080], mask = null) {
  if (!view) return;
  const L = layer('see');
  view(L);
  L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'source-atop';
  L.fillStyle = rgba(tint || '#0a1322', .5 * (1 - k * .6)); L.fillRect(0, 0, L.canvas.width, L.canvas.height);
  L.restore();
  L.save(); L.globalCompositeOperation = 'destination-in';
  // A mask (drawn in alpha) says where the glass has cleared; without one, it clears below the words.
  if (mask) mask(L);
  else {
    const gr = L.createLinearGradient(0, fade[0], 0, fade[1]);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
    L.fillStyle = gr; L.fillRect(0, 0, W, H);
  }
  L.restore();
  put(g, L, { alpha: clamp(k) });
}

// Lit panes: where the far side of the one-way glass is lit, it's a window. p: { rect: [x0, y0,
// x1, y1] on the back wall (world cm), view(L) (the outside, full frame), t0 (the lights come on),
// t1 (they go off), dim (the glass's tint left, 0..1), ghost (how much of the reflection still
// shows on it), light (its share of the glow) }. The wall's chrome grid splits the rect into
// panes, and each comes on on its own, flickering like a tube starting, and goes off the same
// way.
export function paneOn(t, t0, t1, seed) {
  const d = t - t0 - hash(seed, 1) * .16;
  if (d < 0) return 0;
  const on = d < .04 ? .85 : d < .08 ? .12 : d < .12 ? .95 : d < .15 ? .45 : 1;
  if (t1 === undefined) return on;
  const e = t - t1 - hash(seed, 2) * .1;
  return e < 0 ? on : e < .03 ? .5 : e < .06 ? .9 : Math.max(0, .6 - (e - .06) * 12);
}
export function paneMask(c, rect, t, t0, t1, seed = 0, shape = null) {
  const [x0, y0, x1, y1] = rect, z = ROOM.back, P = ROOM.pane;
  // A porthole: the circle in the rect, lit all at once; or a quarter of it ('q0'..'q3').
  if (shape === 'circle' || /^q\d$/.test(shape || '')) return L => {
    const k = paneOn(t, t0, t1, seed * 31);
    if (k <= 0) return;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r = Math.min(x1 - x0, y1 - y0) / 2;
    const q = shape === 'circle' ? -1 : +shape[1];
    const pts = q < 0 ? Array.from({ length: 48 }, (_, i) => [cx + Math.cos(i / 48 * Math.PI * 2) * r, cy + Math.sin(i / 48 * Math.PI * 2) * r, z])
      : [[cx, cy, z], ...Array.from({ length: 13 }, (_, i) => { const a = (q + i / 12) * Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]; })];
    const pp = projPoly(c, pts);
    if (!pp) return;
    L.fillStyle = `rgba(0,0,0,${k})`; L.beginPath(); tracePoly(L, pp); L.fill();
  };
  return L => {
    for (let gx = Math.floor(x0 / P) * P; gx < x1; gx += P) for (let gy = Math.floor(y0 / 150) * 150; gy < y1; gy += 150) {
      const a = Math.max(x0, gx), b = Math.min(x1, gx + P), lo = Math.max(y0, gy), hi = Math.min(y1, gy + 150);
      if (b <= a || hi <= lo) continue;
      const k = paneOn(t, t0, t1, seed * 31 + gx * 7 + gy);
      if (k <= 0) continue;
      const pp = projPoly(c, [[a, lo, z], [b, lo, z], [b, hi, z], [a, hi, z]]);
      if (!pp) continue;
      L.fillStyle = `rgba(0,0,0,${k})`;
      L.beginPath(); tracePoly(L, pp); L.fill();
    }
  };
}
function litPanes(g, c, t, p, E, i = 0) {
  const mask = paneMask(c, p.rect, t, p.t0 ?? -1e9, p.t1, p.seed || 0, p.shape);
  const L = layer('panes' + i);
  p.view(L);
  L.save(); L.setTransform(1, 0, 0, 1, 0, 0);
  if (p.dim) { L.globalCompositeOperation = 'source-atop'; L.fillStyle = rgba(p.tint || '#0a1322', p.dim); L.fillRect(0, 0, L.canvas.width, L.canvas.height); }
  L.restore();
  // What's left of the reflection, faint over the view.
  if (p.ghost) { const R = layer('heroRefl', { keep: true }); put(L, R, { alpha: p.ghost }); }
  // The mask is built on its own (each pane its own fill), then cuts the view once.
  const Mk = layer('paneMask');
  mask(Mk);
  L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-in'; L.drawImage(Mk.canvas, 0, 0); L.restore();
  put(g, L);
  if (E && p.light !== 0) put(E, L, { alpha: p.light ?? .35 });
}
// The lit panes in the black mirror floor: the wall mirrored about the line where it meets the
// floor (for a camera near level, a flip about that line on screen), softened and fading away.
function paneFloor(g, c, p, i = 0) {
  const L = layer('panes' + i, { keep: true });
  const a = project(c, [p.rect[0], 0, ROOM.back]), b = project(c, [p.rect[2], 0, ROOM.back]);
  const yf = (a.y + b.y) / 2;
  const F = layer('paneFloor');
  F.save(); F.setTransform(1, 0, 0, 1, 0, 0);
  const k = F.canvas.width / W, Y = yf * k;
  F.translate(0, Y * 2); F.scale(1, -1);
  F.drawImage(L.canvas, 0, 0);
  F.restore();
  F.save(); F.globalCompositeOperation = 'destination-in';
  const gr = F.createLinearGradient(0, yf, 0, yf + (p.floorFade ?? 260));
  gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  F.fillStyle = gr; F.fillRect(0, yf, W, H - yf);
  F.fillStyle = 'rgba(0,0,0,0)';
  F.restore();
  F.save(); F.setTransform(1, 0, 0, 1, 0, 0); F.globalCompositeOperation = 'destination-out'; F.fillStyle = '#000'; F.fillRect(0, 0, F.canvas.width, Math.max(0, Y)); F.restore();
  put(g, blurred('paneFloorB', F, 2.5, .5), { alpha: p.floorA ?? .8 });
}
// A view drawn once a frame however often it's asked for (the letters, a pane and the floor's
// reflection of both can all show the same outside): make it per frame with a layer name.
export function once(draw, name) {
  let done = false;
  return L => {
    const C = layer('once_' + name, { keep: done });
    if (!done) { draw(C); done = true; }
    L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.drawImage(C.canvas, 0, 0); L.restore();
  };
}
// Where camera c's screen box falls on the back wall: the rect of wall (world cm) it shows.
export function wallRect(c, box) {
  const a = screenToPlane(c, WALL, box[0], box[1]), b = screenToPlane(c, WALL, box[2], box[3]);
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
}

// The band's standard places on the stage, and their lights.
export const LINEUP = {
  cron: { pos: [0, 0, -40], riser: 44 },
  null: { pos: [84, 0, 40], yaw: -.42 },
  regex: { pos: [-82, 0, 50], yaw: .42 },
  clawd: { pos: [0, 0, 120], yaw: .03 },
};
export const STAGE_LIGHTS = {
  key: { dir: [-.55, .7, .75], col: KEY, k: 1.25 },
  ambient: '#15162c',
  extra: [
    { dir: [0.05, .4, -1], col: '#fff3de', k: .5 },
    { pos: [-260, 160, 160], col: BAND.regex.col, k: .7, range: 380 },
    { pos: [270, 160, 150], col: BAND.null.col, k: .7, range: 380 },
    { pos: [60, 260, 0], col: BAND.cron.col, k: .6, range: 300 },
    { pos: [120, 120, 300], col: BAND.clawd.col, k: .45, range: 360 },
  ],
};
export const STAGE_SMOKE = [[-150, -20, 160, 50, BAND.regex.col, 1, .55], [160, -30, 160, 50, BAND.null.col, 2, .55], [0, -110, 220, 60, BAND.cron.col, 3, .4]];
export const STAGE_BEAMS = [
  [[110, 460, 260], [0, 0, 120], 64, BAND.clawd.col, .8],
  [[-240, 460, 60], [-82, 0, 50], 56, BAND.regex.col, .9],
  [[240, 460, 40], [84, 0, 40], 56, BAND.null.col, .9],
  [[0, 480, -90], [0, 44, -60], 60, BAND.cron.col, .7],
];

// The whole band in their places, playing; o.jump makes them jump on the beat (the choruses).
import { player, singer, drummer } from './playing.js';
import { beatPos } from './kit.js';
// o.hops instead: a jump each only at those moments (the big hits), each a little after the last.
export function bandLine(t, o = {}) {
  const hop = w => {
    let h = 0;
    for (const at of o.hops || []) { const q = (t - at - (w === 'null' ? .05 : w === 'regex' ? .09 : 0)) / .38; if (q > 0 && q < 1) h = Math.max(h, 4 * q * (1 - q) * 30); }
    return h;
  };
  const j = w => o.jump ? Math.max(0, Math.sin((beatPos(t) + (w === 'null' ? .5 : w === 'regex' ? .25 : 0)) * Math.PI)) * (o.jump * 22) : hop(w);
  const at = o.at || LINEUP;
  return ['cron', 'null', 'regex', 'clawd'].map(w => ({
    name: w, col: BAND[w].col, rimDir: [w === 'regex' ? .6 : w === 'null' ? -.6 : 0, -1],
    draw: (L, cc) => w === 'cron' ? drummer(L, cc, { pos: at.cron.pos, riser: at.cron.riser ?? 44, t, col: BAND.cron.col, E: o.E })
      : w === 'clawd' ? singer(L, cc, { pos: at.clawd.pos, yaw: at.clawd.yaw, t, jump: j(w), eyes: o.eyes })
        : player(L, cc, { who: w, pos: at[w].pos, yaw: at[w].yaw, t, glow: 1, jump: j(w), E: o.E }),
  }));
}

// The stage's kit: amp stacks either side at the back, and the cables across the floor from the
// instruments to them. (No truss: the words own the top of the frame.)
export function stageSet(g, c, t, E) {
  for (const [x, z] of [[-168, -135], [168, -135]]) {
    amp(g, c, { m: M(T(x, 0, z)), w: 76, h: 74, d: 36, E });
    amp(g, c, { m: M(T(x, 74, z)), w: 76, h: 62, d: 36, E });
  }
  // Cables: loose curves across the floor.
  for (const [a, b2, s] of [[[-80, 1, 50], [-168, 1, -110], 1], [[84, 1, 40], [168, 1, -110], 2], [[0, 1, 120], [-60, 1, -80], 3]]) {
    const pts = [];
    for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push([lerp(a[0], b2[0], k) + Math.sin(k * 7 + s) * 18, 1, lerp(a[2], b2[2], k) + Math.cos(k * 5 + s) * 14]); }
    tube(g, c, pts, 1.1, '#0d0e11', { line: .8, glint: 'rgba(200,210,225,.3)' });
  }
}
