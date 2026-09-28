// Outside, after the box has broken: daylight, the town square, the people, and the pieces of
// mirror still in the air, turning and catching the sun. What's sung is cut into the pieces.
import { W, H, clamp, lerp, mix, rgba, hash, noise } from './kit.js';
import { setLights, project, ap, M, T, RX, RY, RZ, STYLE, projPoly, tracePoly } from './space.js';
import { drawCuts } from './type.js';
import { layer, put, glow, shafts, grain, vignette, rimmed } from './post.js';
import { sky } from './world.js';
import { person, SHADE } from './people.js';
import { sunlit } from './world.js';
import { INK } from './ink.js';
import { square, inkClouds, DAYINK } from './square.js';

// A piece of mirror in the air: an irregular pane at world point p, size s cm, turning slowly.
export function paneM(p, rx, ry, rz) { return M(T(...p), RY(ry), RX(rx), RZ(rz)); }
export function shardPoly(s, seed) {
  const n = 5 + Math.floor(hash(seed) * 3), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + hash(seed, i) * .5; const r = s * (.72 + hash(seed, i, 2) * .38); pts.push([Math.cos(a) * r * 1.3, Math.sin(a) * r]); }
  return pts;
}
function drawShard(g, c, m, poly, E, t, seed) {
  const pp = projPoly(c, poly.map(([u, v]) => ap(m, [u, v, 0])));
  if (!pp) return;
  // Dark glass, the sky's gleam across it where it faces up, a bright bevel round the edge.
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pp) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  g.save();
  g.beginPath(); tracePoly(g, pp);
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  const gl = .5 + .5 * Math.sin(t * .9 + seed);
  // A mirror in daylight shows the deep blue overhead: dark enough that what's cut in it reads.
  gr.addColorStop(0, mix('#27496f', '#6f9cc8', gl * .5)); gr.addColorStop(.4, '#142236'); gr.addColorStop(.62, '#1d2f48'); gr.addColorStop(1, mix('#3a3448', '#8a7a86', (1 - gl) * .4));
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(40,60,90,.8)'; g.lineWidth = 2; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.stroke();
  g.restore();
  if (E && gl > .8) { E.save(); E.beginPath(); tracePoly(E, pp); E.strokeStyle = `rgba(255,245,220,${(gl - .8) * 3})`; E.lineWidth = 6; E.stroke(); E.restore(); }
}

// o: { lights, sunAt, people: [[spec, x, z, h, pose]], band: [{ name, col, draw(L, c) }],
//      shards: [{ m, poly, cuts, seed }], after(g, E), post }
// Golden hour: the sun low behind the square, so everything faces us from the shade side, rimmed
// with gold, and the sky blazes round them.
export const GOLD = { sun: [-420, 230, -6000], top: '#4f7fc4', mid: '#f0c79c', low: '#ffd48e', hor: '#ffae62' };
export function dayFrame(g, t, c, o) {
  STYLE.ink = true; INK.t = t;
  const gold = o.golden !== false;
  setLights(gold
    ? { key: { dir: [-.35, .45, -.85], col: '#ffd9a0', k: 1.25 }, ambient: '#6f6a90', extra: [{ dir: [.2, .6, .8], col: '#b9c3ea', k: .55 }], ...o.lights, view: c.pos }
    : { key: { dir: [-.55, .6, .75], col: '#fff4dc', k: 1.3 }, ambient: '#8a86a8', extra: [{ dir: [.3, .5, -.8], col: '#ffe2b0', k: .6 }], ...o.lights, view: c.pos });
  const E = layer('emit');
  const sunAt = o.sunAt || (gold ? GOLD.sun : [0, 260, -6000]);
  const sp = sky(g, c, t, gold ? { sun: sunAt, top: GOLD.top, mid: GOLD.mid, low: GOLD.low, hor: GOLD.hor, sunR: 620 } : { sun: sunAt, top: '#3f8dd0', mid: '#a6d2ee', low: '#ffe6ba', hor: '#ffc987' });
  if (!gold) inkClouds(g, c, t);
  // The square: warm stone, going away to the town.
  const gnd = [[-4000, 0, -3000], [4000, 0, -3000], [4000, 0, 2000], [-4000, 0, 2000]].map(p => project(c, p));
  const gg = g.createLinearGradient(0, gnd[0].y, 0, H);
  gg.addColorStop(0, '#dcb98e'); gg.addColorStop(1, '#b08962');
  g.fillStyle = gg; g.beginPath(); gnd.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.fill();
  // Paving, inked: the joints in perspective, and a few flags hatched where they're worn.
  g.strokeStyle = rgba(DAYINK, .3); g.lineWidth = 1.3; g.lineCap = 'round';
  for (let x = -1200; x <= 1200; x += 120) { const a = project(c, [x, 0, -3000]), b = project(c, [x, 0, 1200]); if (a.z > c.near && b.z > c.near) { g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } }
  for (let z = -3000; z <= 1200; z += 120) { const a = project(c, [-1400, 0, z]), b = project(c, [1400, 0, z]); if (a.z > c.near && b.z > c.near) { g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } }
  // The town beyond: roofs against the sky, hazed with distance, inked lightly.
  for (let i = 0; i < 16; i++) {
    const x = -2400 + i * 320, h = 500 + hash(i, 3) * 500;
    const q = [[x, 0], [x + 300, 0], [x + 300, h], [x + 150, h + 140], [x, h]].map(([u, v]) => project(c, [u, v, -2900]));
    g.beginPath(); q.forEach((p, k) => k ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath();
    g.fillStyle = mix('#c9b6b2', '#b8a6b4', hash(i, 5)); g.fill();
    g.strokeStyle = rgba(DAYINK, .28); g.lineWidth = 1.2; g.stroke();
    const wx = project(c, [x + 60, h * .55, -2900]), wx2 = project(c, [x + 240, h * .55, -2900]);
    g.fillStyle = 'rgba(255,236,190,.5)'; for (let k = 0; k < 3; k++) g.fillRect(lerp(wx.x, wx2.x, k / 3), wx.y, (wx2.x - wx.x) * .16, (wx2.x - wx.x) * .22);
  }
  // The square's own fronts: the four places, and the bunting across. Against the sun they're
  // in their own shade, cooled, with the sky's gold along their tops.
  if (gold) {
    const Sq = layer('square');
    Sq.setTransform(g.getTransform());
    square(Sq, c, t);
    Sq.save(); Sq.setTransform(1, 0, 0, 1, 0, 0); Sq.globalCompositeOperation = 'source-atop';
    Sq.fillStyle = 'rgba(58,44,86,.42)'; Sq.fillRect(0, 0, Sq.canvas.width, Sq.canvas.height);
    Sq.restore();
    rimmed(g, 'squareRim', L2 => { L2.setTransform(1, 0, 0, 1, 0, 0); L2.drawImage(Sq.canvas, 0, 0); }, [{ col: '#ffd99a', lx: -.3, ly: -1, d: 2, k: .8, glow: .3 }], { E });
  } else square(g, c, t);
  // The shards in the air, the far ones first.
  const shards = (o.shards || []).slice().sort((a, b) => project(c, ap(b.m, [0, 0, 0])).z - project(c, ap(a.m, [0, 0, 0])).z);
  const rimSun = [{ col: '#fff1c8', lx: 0, ly: -1, d: 3, k: 1, glow: .5 }];
  if (o.people?.length) {
    // Their shadows on the stone, long in the late sun, falling away to the right.
    for (const [spec, x, z, hh] of o.people) {
      const a = project(c, [x, 0, z]), b = project(c, [x + (hh ?? 172) * .55, 0, z - (hh ?? 172) * .25]);
      if (a.z < c.near) continue;
      const w0 = 18 * a.s;
      g.save(); g.fillStyle = 'rgba(60,40,50,.28)'; g.beginPath();
      g.moveTo(a.x - w0, a.y); g.lineTo(b.x - w0 * .6, b.y); g.lineTo(b.x + w0 * .6, b.y); g.lineTo(a.x + w0, a.y); g.closePath(); g.fill(); g.restore();
    }
    // In the sun: their own colours, a shade side away from the light, a rim from the sky, and
    // an ink line round each, as the pen draws everything else.
    SHADE.lit = !gold;
    const keep = { col: SHADE.col, k: SHADE.k };
    if (gold) { SHADE.col = '#3a2c48'; SHADE.k = .48; }
    rimmed(g, 'dayPeople', L => sunlit(L, 'dayPpl', L2 => {
      const ppl = o.people.slice().sort((a, b) => a[2] - b[2]);
      for (const [spec, x, z, hh, pose] of ppl) { const p = project(c, [x, 0, z]); if (p.z > c.near) person(L2, p.x, p.y, (hh ?? 172) * p.s, spec, pose || {}, t); }
    }, gold ? 1 : -1), gold ? [{ col: '#ffe0a6', lx: -.35, ly: -1, d: 3, k: 1, glow: .6 }, { col: '#fff4d8', lx: -1, ly: -.2, d: 1.6, k: .7, glow: .3 }] : [{ col: '#fff6e0', lx: -.4, ly: -1, d: 2.4, k: .9 }], { E, outline: gold ? null : { d: 2.2, col: DAYINK } });
    SHADE.lit = false; SHADE.col = keep.col; SHADE.k = keep.k;
  }
  // Shards behind the band first; any nearer than the band go over it.
  const bandD = project(c, o.bandAt || [0, 60, 0]).z;
  const oneShard = sh => {
    drawShard(g, c, sh.m, sh.poly, E, t, sh.seed || 0);
    if (sh.cuts) drawCuts(g, c, t, sh.cuts, { outside: L => sky(L, c, t, gold ? { sun: sunAt, top: GOLD.top, mid: GOLD.mid, low: GOLD.low, hor: GOLD.hor, sunR: 620 } : { sun: sunAt, top: '#4a95d3', low: '#ffe6ba', hor: '#ffc987' }), E, laser: sh.laser || '#ff8a5c', light: .5, haze: .1, both: true, fall: 'blow', fallDur: .5 });
    sh.after?.(g, E);
  };
  const near = [];
  for (const sh of shards) { if (project(c, ap(sh.m, [0, 0, 0])).z < bandD) near.push(sh); else oneShard(sh); }
  for (const it of o.band || []) rimmed(g, 'dayM_' + it.name, L => it.draw(L, c), [{ col: gold ? '#ffdca0' : '#fff4dc', lx: gold ? -.35 : 0, ly: -1, d: 3.4, k: 1, glow: .5 }, { col: it.col, lx: .6, ly: .2, d: 2.2, k: .8, glow: .4 }], { E });
  for (const sh of near) oneShard(sh);
  o.after?.(g, E);
  if (gold) {
    // The sun itself in the emissive layer, so it flares through the shards and round the heads.
    const s0 = project(c, sunAt);
    const sg = E.createRadialGradient(s0.x, s0.y, 0, s0.x, s0.y, 260);
    sg.addColorStop(0, 'rgba(255,248,225,1)'); sg.addColorStop(.25, 'rgba(255,220,160,.5)'); sg.addColorStop(1, 'rgba(255,200,130,0)');
    E.fillStyle = sg; E.fillRect(s0.x - 260, s0.y - 260, 520, 520);
  }
  shafts(g, E, sp.x, sp.y, { len: gold ? .85 : .6, k: gold ? .42 : .3, n: 22, soft: 4 });
  glow(g, E, { k1: .25, k2: gold ? .38 : .3, r1: 6, r2: 40 });
  vignette(g, .35, '#3a2a1e');
  grain(g, t, .03);
  return E;
}
