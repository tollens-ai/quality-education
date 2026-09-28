// The world outside the mirror box: daylight, full colour, the people the band built for. It's
// what shows through every cut. The places and the people in them are story.js's; here are the
// sky, the way a view is moved with the camera as a view through a window moves, and the town
// square with its crowd.
import { W, H, clamp, lerp, rgba, hash } from './kit.js';
import { project } from './space.js';
import { figure, BACK } from './paper.js';

// A morning sky: the sun low ahead, a haze of gold along the horizon, a few clouds.
export function sky(L, c, t, o = {}) {
  const zen = project(c, [0, 4000, -6000]), hor = project(c, [0, 0, -6000]);
  const gr = L.createLinearGradient(zen.x, zen.y, hor.x, hor.y);
  gr.addColorStop(0, o.top || '#5ea5d8'); gr.addColorStop(.55, o.mid || '#b9dcec'); gr.addColorStop(.85, o.low || '#ffe2b0'); gr.addColorStop(1, o.hor || '#ffc27e');
  L.fillStyle = gr; L.fillRect(-W, -H, W * 3, H * 3);
  const sp = project(c, o.sun || [120, 260, -6000]);
  const sg = L.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, o.sunR || 420);
  sg.addColorStop(0, 'rgba(255,255,248,1)'); sg.addColorStop(.07, 'rgba(255,250,230,.96)'); sg.addColorStop(.3, 'rgba(255,228,170,.38)'); sg.addColorStop(1, 'rgba(255,215,150,0)');
  L.fillStyle = sg; L.fillRect(-W, -H, W * 3, H * 3);
  L.save();
  for (let i = 0; i < 10; i++) {
    const cp = project(c, [(hash(i, 1) - .5) * 9000 + t * 12, 900 + hash(i, 2) * 2200, -5500]);
    const rw = (260 + hash(i, 3) * 500) * cp.s;
    L.globalAlpha = .5;
    const cg = L.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, rw);
    cg.addColorStop(0, 'rgba(255,255,255,.95)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
    L.fillStyle = cg; L.beginPath(); L.ellipse(cp.x, cp.y, rw, rw * .18, 0, 0, Math.PI * 2); L.fill();
  }
  L.restore();
  return sp;
}

// A view behind the wall drawn in the screen space of a reference camera, then moved with the
// real camera as a backdrop at depth D would be: the parallax of looking through a window. The
// view is designed around where the words are in the reference framing.
export function backdrop(L, c, ref, D, draw) {
  const P0 = [ref.pos[0] + ref.f[0] * D, ref.pos[1] + ref.f[1] * D, ref.pos[2] + ref.f[2] * D];
  const p = project(c, P0);
  const k = L.getTransform().a;
  L.save();
  L.setTransform(k, 0, 0, k, 0, 0);
  L.translate(p.x - W / 2, p.y - H / 2);
  draw(L);
  L.restore();
}

// ---------------------------------------------------------------- the town square
// The square as a painted flat, standing across the far side at z, its ground line on the floor:
// the fronts of the four places, the bunting, the low sun behind. `width` is in cm, so the flat
// is the same size to every camera. Returns where its sun is on screen.
// base: where the fronts meet the paving, as a fraction of the picture's height.
export const SQUARE = { z: -1500, width: 1520, base: .585 };
export function squarePlane(L, c, o = {}) {
  const b = BACK['bg-square'];
  if (!b) return null;
  const cm = (o.width ?? SQUARE.width) / b.w, Z = o.z ?? SQUARE.z, top = (o.base ?? SQUARE.base) * b.h * cm, left = -b.w * cm / 2;
  const p0 = project(c, [left, top, Z]), px = project(c, [left + b.w * cm, top, Z]), py = project(c, [left, top - b.h * cm, Z]);
  if (p0.z < c.near) return null;
  const t0 = L.getTransform();
  L.save();
  L.setTransform(t0.a * (px.x - p0.x) / b.w, t0.a * (px.y - p0.y) / b.w, t0.a * (py.x - p0.x) / b.h, t0.a * (py.y - p0.y) / b.h, t0.a * p0.x + t0.e, t0.a * p0.y + t0.f);
  L.drawImage(b.img, 0, 0);
  L.restore();
  const sun = b.feat?.sun || [.6, .36];
  return project(c, [left + sun[0] * b.w * cm, top - sun[1] * b.h * cm, Z]);
}

// The people the band built for, outside the box, come to the glass: Rosa, Gran, a parent, Jess
// at the front, and the town behind them, the square beyond. o.joy: they bounce with the band.
// Standing, each as themselves.
export const STANDING = { rosa: 'rosa-proud', gran: 'gran-stand', parent: 'parent-stand', jess: 'jess-bouquet' };
export const CROWD = ['c-hoodie', 'c-raincoat', 'c-paper', 'c-girl', 'c-sari', 'c-overalls', 'c-stick', 'c-denim', 'c-delivery', 'c-floral', 'q-flatcap'];
const FOUR_AT_GLASS = [[STANDING.rosa, -300, -430, 170], [STANDING.gran, -105, -470, 156], [STANDING.parent, 110, -440, 180], [STANDING.jess, 310, -420, 168]];
const TOWN = [[CROWD[0], -640, -980, 168], [CROWD[1], -470, -1120, 164], [CROWD[2], -320, -900, 170], [CROWD[6], -170, -1180, 166], [CROWD[3], 0, -1000, 150],
  [CROWD[7], 170, -1150, 172], [CROWD[4], 330, -920, 166], [CROWD[8], 480, -1100, 170], [CROWD[10], 640, -960, 170], [CROWD[5], -560, -800, 172], [CROWD[9], 560, -780, 164]];
export function onlookers(L, c, t, o = {}) {
  L.fillStyle = '#5f86c0'; L.fillRect(-W, -H, W * 3, H * 3);
  squarePlane(L, c);
  const ppl = [...TOWN, ...FOUR_AT_GLASS].map(([n, x, z, hh], i) => ({ n, x, z, hh, i })).sort((a, b) => a.z - b.z);
  for (const p of ppl) {
    const q = project(c, [p.x, 0, p.z]);
    if (q.z < c.near) continue;
    figure(L, p.n, q.x, q.y, p.hh * q.s, { t, seed: 300 + p.i, bounce: o.joy ? .55 : 0, beatOff: p.i * .07, edge: '#ffe8c2', edgeW: 1.2 });
  }
}
