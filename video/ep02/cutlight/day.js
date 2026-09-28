// Outside, after the box has broken: the town square at golden hour, the people, and the pieces of
// mirror still in the air, turning and catching the sun. What's sung is cut into the pieces. The
// square is a painted flat across the far side (world.js: squarePlane) with the paving running
// up to it; the people stand on the paving as paper cut-outs, their long shadows behind them.
import { W, H, clamp, lerp, mix, rgba, hash } from './kit.js';
import { setLights, project, ap, M, T, RX, RY, RZ, STYLE, projPoly, tracePoly } from './space.js';
import { drawCuts } from './type.js';
import { layer, glow, shafts, grain, vignette, rimmed } from './post.js';
import { squarePlane } from './world.js';
import { figure } from './paper.js';
import { INK } from './ink.js';

// A piece of mirror in the air: an irregular pane at world point p, size s cm, turning slowly.
export function paneM(p, rx, ry, rz) { return M(T(...p), RY(ry), RX(rx), RZ(rz)); }
export function shardPoly(s, seed) {
  const n = 5 + Math.floor(hash(seed) * 3), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + hash(seed, i) * .5; const r = s * (.72 + hash(seed, i, 2) * .38); pts.push([Math.cos(a) * r * 1.3, Math.sin(a) * r]); }
  return pts;
}
function drawShard(g, c, m, poly, E, t, seed, text) {
  const pp = projPoly(c, poly.map(([u, v]) => ap(m, [u, v, 0])));
  if (!pp) return;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pp) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const gl = .5 + .5 * Math.sin(t * .9 + seed);
  g.save();
  g.beginPath(); tracePoly(g, pp);
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  if (text) {
    // The pane the words are cut in: dark glass, the deep blue overhead, so what's cut reads.
    gr.addColorStop(0, mix('#27496f', '#6f9cc8', gl * .5)); gr.addColorStop(.4, '#142236'); gr.addColorStop(.62, '#1d2f48'); gr.addColorStop(1, mix('#3a3448', '#8a7a86', (1 - gl) * .4));
  } else {
    // A piece of mirror turning in the air: it shows the sky it faces, blue overhead, gold towards
    // the sun, with a streak of light across it.
    const sun = gl, a = .88;
    gr.addColorStop(0, rgba(mix('#3f6fa8', '#ffd594', sun), a)); gr.addColorStop(.5, rgba(mix('#8fb4d9', '#fff0c8', sun), a)); gr.addColorStop(1, rgba(mix('#2c4d7a', '#e8a15a', sun * .8), a));
  }
  g.fillStyle = gr; g.fill();
  if (!text) {
    g.clip();
    g.strokeStyle = rgba('#ffffff', .35 + .5 * gl); g.lineWidth = Math.max(1.5, (x1 - x0) * .08);
    g.beginPath(); g.moveTo(lerp(x0, x1, .15), lerp(y1, y0, .1)); g.lineTo(lerp(x0, x1, .85), lerp(y1, y0, .9)); g.stroke();
  }
  g.restore();
  g.save(); g.beginPath(); tracePoly(g, pp);
  g.strokeStyle = text ? 'rgba(40,60,90,.8)' : rgba('#2a2230', .55); g.lineWidth = text ? 2 : 1.6; g.stroke();
  g.strokeStyle = rgba('#fffaf0', text ? .9 : .7 + .3 * gl); g.lineWidth = 1; g.stroke();
  g.restore();
  if (E && gl > .75) { E.save(); E.beginPath(); tracePoly(E, pp); E.strokeStyle = `rgba(255,245,220,${(gl - .75) * 3})`; E.lineWidth = 6; E.stroke(); E.restore(); }
}

// The square beyond, and the sky over it if a camera looks higher than the flat reaches.
function scene(L, c) {
  const gr = L.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#1f4f8f'); gr.addColorStop(1, '#f2a857');
  L.fillStyle = gr; L.fillRect(-W, -H, W * 3, H * 3);
  return squarePlane(L, c);
}

// o: { lights, people: [[figure, x, z, height, figure options]], band: [{ name, col, draw(L, c) }],
//      shards: [{ m, poly, cuts, seed }], after(g, E), bandAt }
export function dayFrame(g, t, c, o) {
  STYLE.ink = true; INK.t = t;
  // Golden hour: the sun low behind the square, so everything faces us from the shade side,
  // rimmed with gold.
  // The sky and the stone light the side facing us, so in daylight the band reads as flat colour
  // with a gold rim, not hatched shade.
  setLights({ key: { dir: [-.35, .45, -.85], col: '#ffd9a0', k: 1.25 }, ambient: '#8a86a8', extra: [{ dir: [.2, .6, .8], col: '#dfe4f6', k: 1.05 }], ...o.lights, view: c.pos });
  const E = layer('emit');
  const sp = scene(g, c) || { x: W / 2, y: H * .35 };
  // The paving is the flat's own, painted running up to its fronts, so the people stand on it; only
  // their long shadows are laid on it here.
  // Their shadows on the stone first, long in the low sun, falling towards us.
  for (const [, x, z, hh] of o.people || []) {
    const a = project(c, [x, 0, z]), b = project(c, [x - (hh ?? 172) * .18, 0, z + (hh ?? 172) * .9]);
    if (a.z < c.near) continue;
    const w0 = 20 * a.s;
    g.save(); g.fillStyle = 'rgba(46,26,30,.3)'; g.beginPath();
    g.moveTo(a.x - w0, a.y); g.lineTo(b.x - w0 * .7, b.y); g.lineTo(b.x + w0 * .7, b.y); g.lineTo(a.x + w0, a.y); g.closePath(); g.fill(); g.restore();
  }
  // Then everything standing or hanging in the square, the far things first: the people as cards,
  // the pieces of mirror, the band.
  const items = [];
  (o.people || []).forEach(([name, x, z, hh, fo], i) => {
    const p = project(c, [x, 0, z]);
    if (p.z > c.near) items.push({ z: p.z, draw: () => figure(g, name, p.x, p.y, (hh ?? 172) * p.s, { t, seed: 500 + i, edge: '#ffe9c4', edgeW: 1.3, shadow: [2.5, 2, .25], ...fo }) });
  });
  for (const sh of o.shards || []) {
    const z = project(c, ap(sh.m, [0, 0, 0])).z;
    items.push({ z, draw: () => {
      drawShard(g, c, sh.m, sh.poly, E, t, sh.seed || 0, !!sh.cuts);
      // The day through the words: lifted, so the deep blue at the top of the sky still reads as
      // light against the dark glass.
      if (sh.cuts) drawCuts(g, c, t, sh.cuts, { outside: L => scene(L, c), E, laser: sh.laser || '#ff8a5c', light: .5, haze: .34, both: true, fall: 'blow', fallDur: .5 });
      sh.after?.(g, E);
    } });
  }
  if (o.band?.length) items.push({ z: project(c, o.bandAt || [0, 60, 0]).z, draw: () => {
    for (const it of o.band) rimmed(g, 'dayM_' + it.name, L => it.draw(L, c), [{ col: '#ffdca0', lx: -.35, ly: -1, d: 3.4, k: 1, glow: .5 }, { col: it.col, lx: .6, ly: .2, d: 2.2, k: .8, glow: .4 }], { E });
  } });
  items.sort((a, b) => b.z - a.z);
  for (const it of items) it.draw();
  o.after?.(g, E);
  // The sun itself in the emissive layer, so it flares through the shards and round the heads.
  const sg = E.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 260);
  sg.addColorStop(0, 'rgba(255,248,225,1)'); sg.addColorStop(.25, 'rgba(255,220,160,.5)'); sg.addColorStop(1, 'rgba(255,200,130,0)');
  E.fillStyle = sg; E.fillRect(sp.x - 260, sp.y - 260, 520, 520);
  shafts(g, E, sp.x, sp.y, { len: .85, k: .42, n: 22, soft: 4 });
  glow(g, E, { k1: .25, k2: .38, r1: 6, r2: 40 });
  vignette(g, .35, '#3a2a1e');
  grain(g, t, .03);
  return E;
}
