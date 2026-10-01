// The testing crew's office: a 1930s detective agency by day, painted to the workshop's standard.
// The crew work on top of a long mahogany partners' desk (its front edge is the floor line; its dark
// front is the lyric's apron). Behind it: the left wall in perspective with a tall window of venetian
// blinds on a hazy town, the sun coming through them in stripes across the back wall; a corkboard of
// pinned pictures joined by red string; a hat stand with a trench coat and fedora; oak filing
// cabinets; a wall clock; a green banker's lamp warming the middle of the desk. No lettering anywhere.
import { TAU, clamp, lerp, rng, noise, hash, mix, rgba } from './kit.js';
import { C } from './palette.js';
import { bake, wash, glaze, light, gloom, shadow, streaks, dabs, inkLine, paper, ao, path, wob, dense, box } from './bg.js';
import { ellipse, spline, rrect } from './ink.js';

// The canvas is 2400 wide so the camera can visit the window, the corkboard and the cabinets.
// floor: the desk's front edge (the floor line); top: the desk top's back edge; cx: the middle of
// the stage, in front of the corkboard; cork: the corkboard's face.
export const OFC = { w: 2400, h: 2400, floor: 1350, cx: 1240, top: 1266, cork: [980, 640, 1500, 1110], lamp: [1730, 1284] };
const VP = [1240, 720];        // the vanishing point, at the crew's eye level
const CORNER = 760;            // where the left wall meets the back wall
// A height on the corner line, carried along the left wall to screen x (lines converge on VP).
const sideY = (h, x) => VP[1] + (h - VP[1]) * (VP[0] - x) / (VP[0] - CORNER);

// A hazy town by day, seen through the window: deco towers, water tanks, rooftops.
function dayTown(g, x0, x1, base, seed) {
  const rows = [['#d3d6e2', -60, 300, 560], ['#b7bfd2', 30, 190, 380], ['#97a2b8', 120, 90, 230]];
  rows.forEach(([col, dy, hmin, hmax], row) => {
    const R = rng(seed + row); let x = x0 - 40;
    while (x < x1 + 40) {
      const bw = lerp(46, 104, R()), bh = lerp(hmin, hmax, R()), by = base + dy;
      const kind = R();
      let top;
      if (kind < .3) top = [[x, by - bh], [x + bw * .2, by - bh], [x + bw * .2, by - bh - 30], [x + bw * .35, by - bh - 30], [x + bw * .5, by - bh - 110], [x + bw * .65, by - bh - 30], [x + bw * .8, by - bh - 30], [x + bw * .8, by - bh], [x + bw, by - bh]];
      else if (kind < .55) top = [[x, by - bh], [x + bw * .15, by - bh], [x + bw * .15, by - bh - 24], [x + bw * .85, by - bh - 24], [x + bw * .85, by - bh], [x + bw, by - bh]];
      else top = [[x, by - bh], [x + bw, by - bh]];
      wash(g, [[x, by + 600], ...top, [x + bw, by + 600]], col, { seed: seed + 9 + x, gran: .3, rim: .15, blooms: 1, amt: .5 });
      if (row === 2 && R() < .45) { const tx = x + bw * .5; wash(g, box(tx - 16, by - bh - 44, 32, 30), mix(col, '#3a3040', .25), { seed: seed + 13 + x, gran: .3, rim: .2, amt: .3 }); wash(g, [[tx - 18, by - bh - 44], [tx, by - bh - 58], [tx + 18, by - bh - 44]], mix(col, '#3a3040', .3), { seed: seed + 14 + x, gran: .2, rim: .1, amt: .2 }); }
      for (let k = 0; k < 6; k++) if (R() < .5) { const wx = x + lerp(8, bw - 14, R()), wy = by - bh + lerp(20, bh - 20, R()); g.fillStyle = rgba(row === 2 ? '#6a7690' : '#f0f2f4', .5); g.fillRect(wx, wy, 7, 10); }
      x += bw + lerp(2, 10, R());
    }
    g.save(); g.globalAlpha = .26; g.fillStyle = C('#fbf0d8'); g.fillRect(x0 - 40, base + dy - hmin * .2, x1 - x0 + 80, 900); g.restore();
  });
}
// Greeked handwriting: wavy lines standing in for writing (never letters).
export function squiggles(g, x0, y0, len, n, gap, seed, col = '#5a4a40', a = .6, w = 2) {
  for (let i = 0; i < n; i++) {
    const P = [], L = len * (i === n - 1 ? .6 : lerp(.8, 1, hash(seed, i)));
    for (let k = 0; k <= 14; k++) P.push([x0 + k / 14 * L, y0 + i * gap + Math.sin(k * 1.9 + i + seed) * w * 1.5]);
    inkLine(g, P, { w, a, gap: 0, col, seed: seed + i });
  }
}

// The desk top nearest the camera, below the floor line (top), from x0 to x1: the wood running on
// toward you in deepening shadow (dark and low in contrast where the lyric sits), a leather blotter,
// and the detective's things in the foreground, rim-lit by the lamp: [kind, x, y, rot] with kind
// 'hat' | 'inkwell' | 'pencil' | 'papers' | 'cup'.
// One of the detective's things on the desk nearest the camera, at (x, y) turned by rot, scale k:
// 'hat' | 'inkwell' | 'pencil' | 'papers' | 'cup'. Painted, so close-ups can set one in the corners too.
export function deskThing(g, kind, x, y, rot = 0, k = 1, seed = 2700) {
  const rim = (P, a = .5) => inkLine(g, P, { w: 3.2, a, gap: 0, col: '#e8b070', seed: seed + 9 });
  {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    if (kind === 'hat') {
      shadow(g, ellipse(18, 30, 250, 86, 0, 40), .55, 18);
      wash(g, ellipse(0, 0, 240, 82, 0, 50), '#3a2a20', { seed: seed + 20, grad: [[0, '#5a4232'], [1, '#2a1c14']], gran: .4, rim: .4, blooms: 3, ink: 2, inkA: .5 });
      wash(g, spline([[-130, -10], [-122, -84], [-40, -118], [40, -112], [124, -80], [132, -6], [0, 24]], true, 6), '#4a3628', { seed: seed + 21, grad: [[0, '#6a5040'], [1, '#2e2018']], dir: [[-130, -110], [130, 20]], gran: .4, rim: .4, blooms: 3, ink: 2, inkA: .55 });
      wash(g, spline([[-132, -14], [0, 8], [132, -12], [130, 18], [0, 40], [-130, 14]], true, 5), '#1a120e', { seed: seed + 22, gran: .2, rim: .2, amt: .3 });
      inkLine(g, [[-40, -112], [-6, -70], [36, -104]], { w: 3, a: .5, gap: 0, col: '#1a120e' });
      rim([[-120, -76], [-60, -112], [10, -118], [60, -112]], .55); rim([[-230, -20], [-160, -66], [-60, -82]], .35);
    } else if (kind === 'inkwell') {
      shadow(g, ellipse(24, 20, 96, 30, 0, 30), .55, 12);
      wash(g, rrect(-74, -112, 148, 120, 22), '#1a2230', { seed: seed + 30, grad: [[0, '#2e3a50'], [1, '#0e1018']], dir: [[-74, 0], [74, 0]], gran: .3, rim: .4, ink: 2, inkA: .6 });
      wash(g, ellipse(0, -112, 44, 14, 0, 24), '#b08a40', { seed: seed + 31, grad: [[0, '#e0bc70'], [1, '#7a5a20']], gran: .2, rim: .3, ink: 1.6, inkA: .7 });
      inkLine(g, [[-6, -116], [70, -300]], { w: 9, a: .95, gap: 0, col: '#1a1416' });
      wash(g, [[66, -296], [82, -330], [76, -292]], '#d0a44a', { seed: seed + 32, gran: .1, rim: .2, amt: .1 });
      rim([[-70, -100], [-60, -110], [40, -112]], .6); rim([[-62, -60], [-62, -10]], .3);
    } else if (kind === 'pencil') {
      shadow(g, box(-150, 14, 300, 18), .5, 8);
      wash(g, box(-150, -12, 280, 24), '#d6a640', { seed: seed + 40, grad: [[0, '#f0c460'], [.5, '#c8962c'], [1, '#8a5e14']], dir: [[0, -12], [0, 12]], gran: .2, rim: .3, ink: 1.6, inkA: .6 });
      wash(g, [[130, -12], [178, 0], [130, 12]], '#e8c896', { seed: seed + 41, gran: .1, rim: .2, ink: 1.4, inkA: .6 });
      wash(g, [[166, -4], [180, 0], [166, 4]], '#3a3a3a', { seed: seed + 42, gran: 0, rim: 0, amt: 0 });
      wash(g, box(-176, -12, 26, 24), '#b8b8b0', { seed: seed + 43, gran: .1, rim: .3, ink: 1.2, inkA: .6 });
      wash(g, rrect(-208, -11, 34, 22, 6), '#c88a8a', { seed: seed + 44, gran: .1, rim: .3, ink: 1.2, inkA: .6 });
      rim([[-150, -12], [130, -12]], .45);
    } else if (kind === 'papers') {
      for (let k = 0; k < 3; k++) {
        g.save(); g.rotate((k - 1) * .09);
        shadow(g, box(-150 + 10, -110 + 14, 300, 220), .45, 12);
        wash(g, box(-150, -110, 300, 220), '#c9b994', { seed: seed + 50 + k, grad: [[0, '#d8c8a2'], [1, '#9a8a68']], dir: [[0, -110], [0, 110]], gran: .3, rim: .3, ink: 1.4, inkA: .5 });
        if (k === 2) for (let r = 0; r < 6; r++) inkLine(g, Array.from({ length: 14 }, (_, j) => [-120 + j * 17, -80 + r * 30 + Math.sin(j * 1.7 + r) * 3]), { w: 2, a: .45, gap: 0, col: '#4a3c30', seed: seed + 60 + r });
        g.restore();
      }
      inkLine(g, [[-120, -118], [-120, -88], [-104, -88], [-104, -112]], { w: 3, a: .7, gap: 0, col: '#9a9a92' });
      rim([[-150, -110], [150, -110]], .4);
    } else if (kind === 'cup') {
      shadow(g, ellipse(16, 22, 120, 40, 0, 30), .5, 12);
      wash(g, ellipse(0, 0, 118, 40, 0, 40), '#d8ccb4', { seed: seed + 70, grad: [[0, '#e8dcc4'], [1, '#8a7e6a']], gran: .2, rim: .3, ink: 1.6, inkA: .5 });
      wash(g, spline([[-62, -70], [62, -70], [56, -6], [0, 8], [-56, -6]], true, 5), '#e4d8c0', { seed: seed + 71, grad: [[0, '#f0e6d0'], [1, '#9a8e78']], dir: [[-62, 0], [62, 0]], gran: .2, rim: .3, ink: 1.6, inkA: .55 });
      wash(g, ellipse(0, -70, 62, 18, 0, 30), '#3a2010', { seed: seed + 72, gran: .2, rim: .3, ink: 1.4, inkA: .6 });
      rim([[-62, -70], [0, -88], [62, -70]], .4);
    }
    g.restore();
  }
}

function nearDesk(g, x0, x1, top, h, cx, items, seed) {
  const R = rng(seed);
  wash(g, box(x0, top - 2, x1 - x0, h - top + 2), '#4a2614', { seed, grad: [[0, '#6e3c20'], [.06, '#4e2814'], [.25, '#2e170c'], [1, '#120804']], gran: .5, rim: 0, blooms: 18, amt: 0 });
  g.save(); g.beginPath(); g.rect(x0, top, x1 - x0, h - top); g.clip();
  for (let i = 0; i < 380; i++) {
    const v = R(), y = top + (h - top) * Math.pow(v, 1.7), x = lerp(x0 - 200, x1, R()), L = lerp(160, 520, R()) * (1 + v * 2);
    g.strokeStyle = rgba(R() < .6 ? '#1a0a04' : '#8a5030', lerp(.04, .1, R())); g.lineWidth = lerp(1, 2.4, R()) * (1 + v * 1.6);
    g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + L * .3, y + (R() - .5) * 6, x + L * .6, y + (R() - .5) * 6, x + L, y + (R() - .5) * 4); g.stroke();
  }
  g.restore();
  // the lamp's spill along the near side of the floor line, and the sun's stripes fading out
  light(g, cx + 80, top + 10, 620, '#ffd59a', .26, 70);
  g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(4px)';
  for (let k = 0; k < 9; k++) { const sx = cx - 560 + k * 70; g.fillStyle = rgba('#ffd9a0', .07); g.beginPath(); g.moveTo(sx, top); g.lineTo(sx + 34, top); g.lineTo(sx + 120, top + 140); g.lineTo(sx + 80, top + 140); g.closePath(); g.fill(); }
  g.restore();
  // a leather blotter under where the lyric sits, its border tooled in faint gold
  const bl = [cx - 540, top + 70, 1080, 640];
  wash(g, rrect(bl[0], bl[1], bl[2], bl[3], 18), '#2a1610', { seed: seed + 1, grad: [[0, '#3a2018'], [1, '#1a0c08']], gran: .5, rim: .3, blooms: 6, amt: .5 });
  inkLine(g, rrect(bl[0] + 22, bl[1] + 22, bl[2] - 44, bl[3] - 44, 12), { w: 2, a: .25, gap: .1, col: '#a07a3a', closed: true, seed: seed + 2 });
  for (const [x, y, a, b] of [[bl[0], bl[1], 1, 1], [bl[0] + bl[2], bl[1], -1, 1], [bl[0], bl[1] + bl[3], 1, -1], [bl[0] + bl[2], bl[1] + bl[3], -1, -1]]) wash(g, [[x, y], [x + a * 60, y], [x, y + b * 60]], '#6a5024', { seed: seed + 3 + x, gran: .2, rim: .3, amt: .2 });
  for (const [kind, x, y, rot] of items) deskThing(g, kind, x, y, rot, 1, seed);
  // the nearer it is, the deeper the shadow: a calm dark band under the lyric
  g.save(); g.globalCompositeOperation = 'multiply';
  const dk = g.createLinearGradient(0, top, 0, h);
  dk.addColorStop(0, 'rgba(255,255,255,1)'); dk.addColorStop(.07, 'rgba(160,150,150,1)'); dk.addColorStop(.3, 'rgba(120,112,118,1)'); dk.addColorStop(1, 'rgba(170,160,160,1)');
  g.fillStyle = dk; g.fillRect(x0, top, x1 - x0, h - top);
  g.restore();
}

export function office() {
  return bake('office', OFC.w, OFC.h, (g, w, h) => {
    const F = OFC.floor, top0 = OFC.top, cx = OFC.cx;

    // ---- the ceiling, the back wall (slate plaster, darker up under the ceiling) and the left wall
    wash(g, box(0, 0, w, 200), '#2a2a34', { seed: 2001, grad: [[0, '#1a1a22'], [1, '#34343e']], gran: .5, rim: 0, blooms: 10, amt: 0 });
    wash(g, box(CORNER, 150, w - CORNER, top0 - 150), '#62737e', { seed: 2002, grad: [[0, '#3e4a56'], [.4, '#5d6e79'], [1, '#71807f']], gran: .6, rim: 0, blooms: 44, amt: 0, bloomScale: 2.4, bloom: 1.6 });
    streaks(g, box(CORNER, 150, w - CORNER, top0 - 150), '#62737e', { seed: 2003, ang: Math.PI / 2, len: 180, n: 1100, a: .06, w: 3 });
    wash(g, box(CORNER, 150, w - CORNER, 40), '#4a3020', { seed: 2004, grad: [[0, '#5e3e28'], [1, '#2e1c10']], gran: .4, rim: .3, blooms: 4, ink: 2, inkA: .5 });
    ao(g, CORNER, 190, w, 190, 50, .4);
    const SW = [[0, sideY(150, 0)], [CORNER, 150], [CORNER, top0 + 60], [0, sideY(top0 + 60, 0)]];
    wash(g, SW, '#566570', { seed: 2010, grad: [[0, '#333d46'], [.7, '#4f5e69'], [1, '#43505a']], dir: [[0, 0], [CORNER, 0]], gran: .55, rim: 0, blooms: 20, amt: 0 });
    wash(g, [[0, sideY(150, 0)], [CORNER, 150], [CORNER, 190], [0, sideY(190, 0)]], '#3a2618', { seed: 2011, gran: .4, rim: .3, blooms: 2, amt: .3, ink: 2, inkA: .5 });
    ao(g, CORNER, 150, CORNER, top0, 70, .4); ao(g, CORNER + 1, top0, CORNER + 1, 150, 36, .35);

    // ---- the wall clock, high and quiet above the corkboard (ticks, no numerals)
    const ckx = 1240, cky = 420, ckr = 74;
    shadow(g, ellipse(ckx + 12, cky + 16, ckr + 12, ckr + 12, 0, 40), .4, 12);
    wash(g, ellipse(ckx, cky, ckr + 14, ckr + 14, 0, 44), '#4a2e1c', { seed: 2020, grad: [[0, '#6e4628'], [1, '#2e1a0e']], dir: [[ckx - ckr, cky - ckr], [ckx + ckr, cky + ckr]], gran: .3, rim: .3, ink: 2.2, inkA: .7 });
    wash(g, ellipse(ckx, cky, ckr, ckr, 0, 44), '#efe4c8', { seed: 2021, grad: [[0, '#fbf2dc'], [1, '#c8b896']], dir: [[ckx - ckr, cky - ckr], [ckx + ckr, cky + ckr]], gran: .15, rim: .3, ink: 1.6, inkA: .6 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; inkLine(g, [[ckx + Math.cos(a) * ckr * .78, cky + Math.sin(a) * ckr * .78], [ckx + Math.cos(a) * ckr * (i % 3 ? .88 : .92), cky + Math.sin(a) * ckr * (i % 3 ? .88 : .92)]], { w: i % 3 ? 2 : 4, a: .85, gap: 0, col: '#2a1e18' }); }
    inkLine(g, [[ckx, cky], [ckx - 30, cky - 26]], { w: 5, a: .9, gap: 0, col: '#1d1612' }); inkLine(g, [[ckx, cky], [ckx + 8, cky - 56]], { w: 3.4, a: .9, gap: 0, col: '#1d1612' });

    // ---- the corkboard: cork in a dark frame, a few old cases pinned round its edges, red string
    const [kx0, ky0, kx1, ky1] = OFC.cork;
    shadow(g, box(kx0 + 18, ky0 + 22, kx1 - kx0, ky1 - ky0), .5, 18);
    wash(g, box(kx0 - 24, ky0 - 24, kx1 - kx0 + 48, ky1 - ky0 + 48), '#4a2e1c', { seed: 2070, grad: [[0, '#6a4428'], [1, '#2e1a0e']], dir: [[kx0, ky0], [kx1, ky1]], gran: .4, rim: .4, blooms: 3, ink: 2.4, inkA: .7 });
    wash(g, box(kx0, ky0, kx1 - kx0, ky1 - ky0), '#b48655', { seed: 2071, grad: [[0, '#c4945f'], [1, '#93653a']], gran: .8, rim: .3, blooms: 16, amt: .4, ink: 1.8, inkA: .5 });
    dabs(g, box(kx0, ky0, kx1 - kx0, ky1 - ky0), ['#7a4e28', '#e0b884', '#8e5e30', '#f0cc98'], { seed: 2072, n: 2400, r: 2.2, a: .5 });
    ao(g, kx0, ky0, kx1, ky0, 22, .3); ao(g, kx0, ky0, kx0, ky1, 18, .25);
    const card = (x, y, cw, ch, rot, col, draw, seed) => {
      g.save(); g.translate(x, y); g.rotate(rot);
      shadow(g, box(-cw / 2 + 6, -ch / 2 + 8, cw, ch), .35, 6);
      wash(g, box(-cw / 2, -ch / 2, cw, ch), col, { seed, gran: .2, rim: .3, blooms: 1, amt: .4, ink: 1.6, inkA: .6 });
      draw && draw(cw, ch, seed);
      g.restore();
    };
    const photo = (x, y, rot, seed, draw) => card(x, y, 116, 106, rot, '#f2ead6', (cw, ch, s) => { wash(g, box(-cw / 2 + 10, -ch / 2 + 10, cw - 20, ch - 32), '#c2b49a', { seed: s + 1, gran: .3, rim: .2, amt: .2 }); draw(s); }, seed);
    const pins = [];
    // the bug from the first case
    photo(1050, 712, -.08, 2080, s => { wash(g, ellipse(-4, -8, 22, 15, 0, 20), '#8c2f2a', { seed: s + 2, gran: .2, rim: .3, ink: 1.4 }); wash(g, ellipse(18, -9, 9, 8, 0, 14), '#2a2224', { seed: s + 3, gran: .1, rim: .2, ink: 1.2 }); for (let i = -1; i <= 1; i++) inkLine(g, [[i * 11 - 4, 4], [i * 13 - 4, 16]], { w: 1.6, a: .8, gap: 0, col: '#2a2224' }); });
    pins.push([1050, 664]);
    // the router whose net dropped
    photo(1432, 706, .07, 2085, s => { wash(g, box(-24, -4, 48, 22), '#b77441', { seed: s + 2, gran: .2, rim: .3, ink: 1.4 }); inkLine(g, [[-12, -4], [-18, -22], [-30, -18]], { w: 2.4, a: .9, gap: 0 }); inkLine(g, [[12, -4], [18, -22], [30, -18]], { w: 2.4, a: .9, gap: 0 }); });
    pins.push([1432, 658]);
    // the gym's empty drawer
    photo(1440, 1040, -.05, 2088, s => { wash(g, box(-30, -20, 60, 34), '#8a5a32', { seed: s + 2, gran: .2, rim: .3, ink: 1.4 }); wash(g, box(-22, -12, 44, 18), '#2a1a10', { seed: s + 3, gran: .1, rim: .2, amt: .2 }); });
    pins.push([1440, 992]);
    // index cards of squiggles
    card(1046, 1042, 124, 80, .05, '#fbf4e2', (cw, ch, s) => squiggles(g, -cw / 2 + 14, -ch / 2 + 20, cw - 28, 3, 19, s), 2090); pins.push([1046, 1008]);
    // the red string between the old cases, sagging a little
    const string = (a, b, sag, seed) => { const P = []; for (let k = 0; k <= 20; k++) { const u = k / 20; P.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag]); } inkLine(g, P, { w: 3, a: .85, gap: 0, col: '#b8342a', seed }); };
    string(pins[0], pins[3], 18, 2100); string(pins[1], pins[2], 16, 2101); string(pins[0], pins[1], 34, 2102);
    for (const [px, py] of pins) { wash(g, ellipse(px, py, 9, 9, 0, 14), '#d8a840', { seed: 2110 + px, gran: .1, rim: .3, ink: 1.4, inkA: .7 }); light(g, px - 3, py - 3, 8, '#ffffff', .5); }

    // ---- the hat stand right of the corkboard: a trench coat and a fedora
    const hx = 1640;
    shadow(g, [[hx + 30, 330], [hx + 70, 330], [hx + 130, top0], [hx + 60, top0]], .35, 18);
    wash(g, box(hx - 9, 360, 18, top0 - 360), '#4a2c1a', { seed: 2060, grad: [[0, '#6e4428'], [1, '#2e1a0e']], dir: [[hx - 9, 0], [hx + 9, 0]], gran: .3, rim: .3, ink: 1.8, inkA: .6 });
    for (const [dx, dy] of [[-58, 440], [58, 434], [-48, 500], [48, 506]]) inkLine(g, [[hx, dy - 24], [hx + dx, dy - 50], [hx + dx * 1.08, dy - 64]], { w: 6, a: .9, gap: 0, col: '#3e2414' });
    const coat = spline([[hx - 30, 450], [hx + 40, 448], [hx + 92, 550], [hx + 106, 820], [hx + 116, 1060], [hx + 40, 1080], [hx - 20, 1076], [hx - 92, 1060], [hx - 84, 810], [hx - 70, 550]], true, 6);
    shadow(g, coat.map(([x, y]) => [x + 26, y + 18]), .4, 16);
    wash(g, coat, '#b39466', { seed: 2062, grad: [[0, '#c9ab7e'], [.6, '#a48558'], [1, '#735836']], dir: [[hx - 90, 0], [hx + 110, 0]], gran: .45, rim: .4, blooms: 6, ink: 2.2, inkA: .65 });
    wash(g, spline([[hx - 30, 450], [hx + 10, 460], [hx + 4, 730], [hx - 30, 720]], true, 4), '#957648', { seed: 2063, gran: .3, rim: .3, amt: .4, ink: 1.6, inkA: .5 });
    wash(g, box(hx - 86, 730, 196, 26), '#856438', { seed: 2064, gran: .3, rim: .3, amt: .4, ink: 1.6, inkA: .6 });
    for (const yy of [570, 650, 820, 910]) wash(g, ellipse(hx - 4, yy, 7, 7, 0, 12), '#5a4028', { seed: 2065 + yy, gran: .1, rim: .2, amt: 0 });
    wash(g, ellipse(hx + 4, 366, 88, 18, -.06, 30), '#5c4434', { seed: 2066, grad: [[0, '#7a5c48'], [1, '#3c2a1e']], gran: .3, rim: .3, ink: 2, inkA: .7 });
    wash(g, spline([[hx - 52, 366], [hx - 50, 320], [hx - 18, 300], [hx + 4, 312], [hx + 30, 298], [hx + 58, 320], [hx + 56, 366]], true, 5), '#6a4e3c', { seed: 2067, grad: [[0, '#80644e'], [1, '#4a3426']], dir: [[hx - 52, 0], [hx + 58, 0]], gran: .3, rim: .3, ink: 2, inkA: .7 });
    wash(g, spline([[hx - 52, 348], [hx + 56, 348], [hx + 56, 364], [hx - 52, 364]], true, 3), '#2a1e18', { seed: 2068, gran: .2, rim: .2, amt: .3 });

    // ---- the filing cabinets on the right, a stack of folders and a desk fan on top
    const cabinet = (x0, cw, yTop, seed) => {
      shadow(g, box(x0 + 22, yTop + 26, cw, top0 - yTop), .45, 20);
      wash(g, box(x0, yTop, cw, top0 - yTop + 40), '#8a5a32', { seed, grad: [[0, '#a8743e'], [1, '#5e3a1c']], dir: [[x0, 0], [x0 + cw, 0]], gran: .55, rim: .35, blooms: 6, ink: 2.4, inkA: .7 });
      streaks(g, box(x0, yTop, cw, top0 - yTop), '#8a5a32', { seed: seed + 1, ang: Math.PI / 2, len: 220, n: 140, a: .12, w: 1.6 });
      wash(g, box(x0 - 8, yTop - 18, cw + 16, 22), '#6e4426', { seed: seed + 2, gran: .4, rim: .3, ink: 2, inkA: .6 });
      for (let i = 0; i < 4; i++) {
        const dy = yTop + 30 + i * 150;
        if (dy + 130 > top0 + 40) break;
        wash(g, box(x0 + 16, dy, cw - 32, 128), '#94643a', { seed: seed + 10 + i, gran: .4, rim: .4, blooms: 1, amt: .3, ink: 1.6, inkA: .55 });
        wash(g, box(x0 + cw / 2 - 30, dy + 22, 60, 26), '#e8dcc0', { seed: seed + 20 + i, gran: .1, rim: .3, ink: 1.4, inkA: .7 });
        wash(g, rrect(x0 + cw / 2 - 34, dy + 64, 68, 18, 8), '#c9a45a', { seed: seed + 30 + i, grad: [[0, '#e6c578'], [1, '#8e6c2c']], gran: .1, rim: .3, ink: 1.4, inkA: .8 });
      }
    };
    cabinet(1880, 250, 660, 2120); cabinet(2140, 250, 660, 2130);
    for (let i = 0; i < 4; i++) wash(g, box(1910 + i * 3, 620 - i * 14, 190, 14), ['#d9b77a', '#cfa96c', '#e2c48a', '#c99e60'][i], { seed: 2140 + i, gran: .2, rim: .3, ink: 1.4, inkA: .6 });
    wash(g, ellipse(2260, 580, 60, 60, 0, 30), '#7d8a8c', { seed: 2145, gran: .2, rim: .3, ink: 2, inkA: .7, grad: [[0, '#a3b0b2'], [1, '#56625f']] });
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; inkLine(g, [[2260, 580], [2260 + Math.cos(a) * 56, 580 + Math.sin(a) * 56]], { w: 2, a: .6, gap: 0, col: '#3e4846' }); }
    wash(g, box(2250, 636, 20, 24), '#4c5656', { seed: 2146, gran: .2, rim: .3, ink: 1.6 });

    // ---- light and shade: warmth gathers at the middle; darkness and cool shade in the corners
    gloom(g, w, top0 + 2, cx - 60, 860, 240, 1250, '#0e0814', .92);
    g.save(); g.globalCompositeOperation = 'multiply'; const cool = g.createRadialGradient(cx, 860, 360, cx, 860, 1400); cool.addColorStop(0, 'rgba(255,255,255,1)'); cool.addColorStop(1, 'rgba(140,140,196,1)'); g.fillStyle = cool; g.fillRect(0, 0, w, top0); g.restore();
    light(g, cx + 40, 930, 560, '#ffc27a', .36);
    light(g, cx + 40, 1000, 300, '#ffd9a0', .2);

    // ---- the window on the left wall, painted after the shade so it stays the brightest thing
    const nx = 300, fx = 640, hT = 380, hB = 1100;
    const WQ = [[nx, sideY(hT, nx)], [fx, sideY(hT, fx)], [fx, sideY(hB, fx)], [nx, sideY(hB, nx)]];
    g.save(); path(g, WQ); g.clip();
    wash(g, box(nx - 20, sideY(hT, nx) - 20, fx - nx + 40, sideY(hB, nx) - sideY(hT, nx) + 40), '#f6ead0', { seed: 2030, grad: [[0, '#e2ebec'], [.5, '#fbf0d8'], [1, '#fff0c4']], gran: .25, rim: 0, blooms: 6, amt: 0 });
    light(g, nx + 90, sideY(hT, nx) + 140, 280, '#fffaf0', .9);
    dayTown(g, nx - 30, fx + 30, sideY(hB, nx) - 110, 2031);
    // the blinds: slats converging on the vanishing point, their tops lit, gaps of bright day
    const pitch = 30, slat = 18;
    for (let hh = hT + 34; hh < hB - 4; hh += pitch) {
      const P = [[nx, sideY(hh, nx)], [fx, sideY(hh, fx)], [fx, sideY(hh + slat, fx)], [nx, sideY(hh + slat, nx)]];
      wash(g, P, '#efe2c4', { seed: 2040 + hh, grad: [[0, '#fffaea'], [.5, '#efe0be'], [1, '#c4ab84']], dir: [[0, sideY(hh, 470)], [0, sideY(hh + slat, 470)]], gran: .15, rim: .2, blooms: 0, amt: .3 });
      inkLine(g, [[nx, sideY(hh + slat, nx)], [fx, sideY(hh + slat, fx)]], { w: 1.4, a: .35, seed: 2041 + hh, col: '#6a5436' });
    }
    for (const k of [.25, .72]) { const lx = lerp(nx, fx, k); inkLine(g, [[lx, sideY(hT + 20, lx)], [lx, sideY(hB, lx)]], { w: 3, a: .45, gap: 0, col: '#a08a66' }); }
    light(g, (nx + fx) / 2 - 40, sideY((hT + hB) / 2, 470), 300, '#fff6dc', .35);
    g.restore();
    const quad = (h0, h1, x0, x1) => [[x0, sideY(h0, x0)], [x1, sideY(h0, x1)], [x1, sideY(h1, x1)], [x0, sideY(h1, x0)]];
    wash(g, quad(hT - 10, hT + 34, nx - 6, fx + 4), '#d9c7a0', { seed: 2050, grad: [[0, '#efe0bc'], [1, '#a88e64']], dir: [[0, sideY(hT, 470)], [0, sideY(hT + 34, 470)]], gran: .3, rim: .3, ink: 2, inkA: .6 });
    wash(g, quad(hT - 50, hT - 10, nx - 44, fx + 36), '#4e301c', { seed: 2051, gran: .45, rim: .35, blooms: 2, amt: .4, ink: 2, inkA: .6 });
    wash(g, quad(hB, hB + 36, nx - 64, fx + 40), '#5e3a22', { seed: 2052, gran: .45, rim: .35, blooms: 2, amt: .4, ink: 2, inkA: .6 });
    wash(g, quad(hT - 50, hB, nx - 44, nx), '#3e2614', { seed: 2053, gran: .45, rim: .35, amt: .3, ink: 2, inkA: .6 });
    wash(g, quad(hT - 50, hB, fx, fx + 36), '#5e3a22', { seed: 2054, gran: .45, rim: .35, amt: .3, ink: 2, inkA: .6 });
    const cX = fx - 24; inkLine(g, [[cX, sideY(hT + 30, cX)], [cX + 4, sideY(hT + 30, cX) + 500]], { w: 2.4, a: .8, gap: 0, col: '#6a5232' });
    wash(g, ellipse(cX + 4, sideY(hT + 30, cX) + 516, 9, 16, 0, 16), '#c9a868', { seed: 2055, gran: .2, rim: .3, ink: 1.6 });
    // the day spilling off the window into the room: a broad shaft in the dusty air
    light(g, (nx + fx) / 2, sideY((hT + hB) / 2, 470), 460, '#ffe6b0', .3);
    g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(40px)';
    const shaft = g.createLinearGradient(fx, 500, 1500, 1200); shaft.addColorStop(0, rgba('#ffe2a8', .22)); shaft.addColorStop(1, rgba('#ffe2a8', 0));
    g.fillStyle = shaft; g.beginPath(); g.moveTo(fx, sideY(hT, fx)); g.lineTo(1500, 760); g.lineTo(1500, 1260); g.lineTo(fx, sideY(hB, fx)); g.closePath(); g.fill(); g.restore();

    // ---- the sun through the blinds: slanted stripes across the back wall, the coat and the cork
    g.save(); g.globalCompositeOperation = 'screen';
    const sx0 = CORNER + 20, sx1 = 1560, sy0 = 330, sy1 = 640, n = 15, hgt = 600, pitch2 = hgt / n;
    const fade = g.createLinearGradient(sx0, 0, sx1, 0); fade.addColorStop(0, rgba('#ffd896', .36)); fade.addColorStop(.6, rgba('#ffd896', .24)); fade.addColorStop(1, rgba('#ffd896', 0));
    g.fillStyle = fade; g.filter = 'blur(2.5px)';
    g.beginPath();
    for (let k = 0; k < n; k++) { const off = k * pitch2, th = pitch2 * .56; g.moveTo(sx0, sy0 + off); g.lineTo(sx1, sy1 + off); g.lineTo(sx1, sy1 + off + th); g.lineTo(sx0, sy0 + off + th); g.closePath(); }
    g.fill();
    g.filter = 'blur(50px)'; g.fillStyle = rgba('#ffc884', .14); g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(sx1, sy1); g.lineTo(sx1, sy1 + hgt); g.lineTo(sx0, sy0 + hgt); g.closePath(); g.fill();
    g.restore();

    // ---- the desk: a long mahogany top in the light, its dark front the lyric's apron
    wash(g, box(0, top0, w, F - top0 + 4), '#8a4a2c', { seed: 2200, grad: [[0, '#401e10'], [.5, '#784026'], [1, '#a65e38']], gran: .55, rim: .1, blooms: 14, amt: .5 });
    streaks(g, box(0, top0, w, F - top0), '#8a4a2c', { seed: 2201, ang: 0, len: 300, n: 300, a: .18, w: 1.5 });
    ao(g, 0, top0 + 1, w, top0 + 1, 26, .55, '#1a0a04');
    // the sun's stripes across the desk top
    g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(2px)';
    for (let k = 0; k < 11; k++) { const x = 700 + k * 62; g.fillStyle = rgba('#ffd9a0', .26 - k * .02); g.beginPath(); g.moveTo(x, top0 + 6); g.lineTo(x + 30, top0 + 6); g.lineTo(x + 84, F - 2); g.lineTo(x + 50, F - 2); g.closePath(); g.fill(); }
    g.restore();
    light(g, cx + 80, F - 30, 640, '#ffd59a', .45, 70);
    gloom(g, w, F + 20, cx, F - 40, 500, 1500, '#0e0814', .7);
    // ---- below the floor line, the desk top runs on toward you: dark, low in contrast under the
    // lyric, with the detective's things nearest the camera (his hat, the inkwell, a pencil, papers)
    nearDesk(g, 0, w, F, h, cx, [['papers', 260, F + 470, -.2], ['inkwell', 720, F + 430, 0], ['hat', 1235, F + 610, -.05], ['pencil', 1720, F + 520, -.35], ['papers', 2130, F + 450, .15], ['cup', 2330, F + 600, 0]], 2700);

    // ---- desk clutter at the ends, out of the way of the action
    const tx = 380, ty = top0 + 40;
    shadow(g, box(tx - 150, ty - 4, 320, 26), .45, 10);
    wash(g, spline([[tx - 150, ty], [tx - 136, ty - 96], [tx + 136, ty - 96], [tx + 150, ty], [tx + 150, ty + 20], [tx - 150, ty + 20]], true, 4), '#262426', { seed: 2300, grad: [[0, '#4a4648'], [1, '#141214']], gran: .3, rim: .3, ink: 2, inkA: .8 });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) wash(g, ellipse(tx - 112 + k * 28 + r * 8, ty - 70 + r * 22, 9, 7, 0, 12), '#c8c0ac', { seed: 2310 + r * 10 + k, gran: .1, rim: .2, amt: .1 });
    wash(g, box(tx - 130, ty - 150, 260, 34), '#3a3638', { seed: 2301, gran: .3, rim: .3, ink: 1.8 });
    wash(g, [[tx - 90, ty - 150], [tx + 90, ty - 150], [tx + 84, ty - 330], [tx - 84, ty - 326]], '#e9dfc8', { seed: 2302, gran: .15, rim: .3, ink: 1.6, inkA: .6 });
    squiggles(g, tx - 66, ty - 300, 132, 5, 26, 2303);
    for (let i = 0; i < 3; i++) wash(g, box(2080 + i * 6, top0 + 30 - i * 16, 260, 18), ['#d9b77a', '#cfa96c', '#e2c48a'][i], { seed: 2320 + i, gran: .2, rim: .3, ink: 1.4, inkA: .6 });
    shadow(g, box(2400 - 470, top0 + 30, 90, 18), .4, 8);
    wash(g, [[1930, top0 - 40], [2010, top0 - 40], [2004, top0 + 34], [1936, top0 + 34]], '#efe6d2', { seed: 2330, grad: [[0, '#fbf3e2'], [1, '#bdb29c']], dir: [[1930, 0], [2010, 0]], gran: .2, rim: .3, ink: 1.8, inkA: .7 });
    wash(g, ellipse(1970, top0 - 40, 40, 9, 0, 20), '#5a3218', { seed: 2331, gran: .2, rim: .3, ink: 1.4 });

    // ---- the banker's lamp at the back of the desk, right of the middle: brass, a green glass shade
    const [lx, lb] = OFC.lamp;
    shadow(g, ellipse(lx + 40, lb + 4, 120, 14, 0, 30), .5, 10);
    wash(g, ellipse(lx, lb, 96, 18, 0, 30), '#a8823a', { seed: 2400, grad: [[0, '#e0bc6a'], [1, '#7a5a1e']], dir: [[lx - 96, 0], [lx + 96, 0]], gran: .2, rim: .3, ink: 2, inkA: .8 });
    wash(g, box(lx - 9, lb - 210, 18, 210), '#b08a40', { seed: 2401, grad: [[0, '#e8c876'], [1, '#7a5a1e']], dir: [[lx - 9, 0], [lx + 9, 0]], gran: .2, rim: .3, ink: 1.8, inkA: .8 });
    const shadeP = spline([[lx - 150, lb - 196], [lx - 132, lb - 252], [lx, lb - 270], [lx + 132, lb - 252], [lx + 150, lb - 196], [lx, lb - 184]], true, 6);
    wash(g, shadeP, '#2a6a48', { seed: 2402, grad: [[0, '#5fa47c'], [.45, '#2a6a48'], [1, '#123c26']], dir: [[lx - 150, 0], [lx + 150, 0]], gran: .3, rim: .4, blooms: 3, ink: 2.4, inkA: .8 });
    wash(g, ellipse(lx - 60, lb - 240, 34, 8, -.2, 16), '#c4ecd2', { seed: 2403, gran: 0, rim: 0, blooms: 0, amt: .3 });
    light(g, lx, lb - 172, 170, '#fff0c0', .75, 34);
    light(g, lx - 80, lb - 20, 460, '#ffd590', .45, 80);
    light(g, lx, lb - 200, 360, '#ffcc88', .2);

    paper(g, w, h, .45);
  });
}

// ---------------------------------------------------------------- the desk top, close, from above
// An insert of the same desk seen from higher up, for things laid flat on it (the board game): the
// mahogany top filling the frame above the floor line (its front edge), the dark wall beyond it, the
// sun's stripes slanting across the wood, the lamp's warm pool in the middle, the dark front below.
export const DI = { w: 1400, h: 2300, near: 1360, cx: 700 };
export function deskInsert() {
  return bake('desk-insert', DI.w, DI.h, (g, w, h) => {
    const N = DI.near, back = 420;
    wash(g, box(0, 0, w, back + 10), '#3a4250', { seed: 2500, grad: [[0, '#1c2028'], [1, '#4a5260']], gran: .5, rim: 0, blooms: 10, amt: 0 });
    wash(g, box(0, back, w, N - back), '#7a4026', { seed: 2501, grad: [[0, '#4a2414'], [.4, '#74401f'], [1, '#a65e36']], gran: .6, rim: .1, blooms: 24, amt: .5, bloomScale: 1.6 });
    // the grain, running across, a little closer together toward the far edge
    const R = rng(2502);
    g.save(); g.beginPath(); g.rect(0, back, w, N - back); g.clip();
    for (let i = 0; i < 260; i++) {
      const v = R(), y = lerp(back, N, Math.pow(v, .8)), x = R() * w, L = lerp(120, 420, R());
      g.strokeStyle = rgba(R() < .5 ? '#3a1a0a' : '#c88a5a', lerp(.06, .16, R())); g.lineWidth = lerp(1, 2.6, R()) * lerp(.6, 1.2, v);
      g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + L * .3, y + (R() - .5) * 8, x + L * .6, y + (R() - .5) * 8, x + L, y + (R() - .5) * 6); g.stroke();
    }
    g.restore();
    ao(g, 0, back + 2, w, back + 2, 60, .6, '#120804');
    // a leather blotter under where the board goes, its corners in brass
    wash(g, [[180, 560], [1220, 560], [1290, 1300], [110, 1300]], '#5a3a2a', { seed: 2510, grad: [[0, '#4a2e20'], [1, '#6e4a34']], gran: .5, rim: .4, blooms: 8, amt: .6, ink: 2, inkA: .4 });
    for (const [x, y, a] of [[180, 560, 1], [1220, 560, -1], [110, 1300, 1], [1290, 1300, -1]]) wash(g, [[x, y], [x + a * 70, y], [x, y + (y < 900 ? 60 : -60)]], '#b08a40', { seed: 2511 + x, gran: .2, rim: .3, ink: 1.6, inkA: .6 });
    // clutter at the edges: a pencil, a coffee ring, a sheet of squiggles
    wash(g, [[1140, 1170], [1330, 1060], [1342, 1078], [1152, 1190]], '#e6b84a', { seed: 2520, gran: .2, rim: .3, ink: 1.6, inkA: .7 });
    wash(g, [[1330, 1060], [1362, 1044], [1342, 1078]], '#f1d3a8', { seed: 2521, gran: .1, rim: .2, ink: 1.2 });
    g.save(); g.strokeStyle = rgba('#3a1a0a', .25); g.lineWidth = 6; g.beginPath(); g.ellipse(160, 1180, 70, 44, 0, 0, TAU); g.stroke(); g.restore();
    wash(g, [[40, 640], [230, 610], [262, 840], [64, 872]], '#f2e8d2', { seed: 2522, gran: .15, rim: .3, ink: 1.6, inkA: .6 });
    for (let i = 0; i < 5; i++) inkLine(g, Array.from({ length: 12 }, (_, k) => [80 + k * 13 + i * 3, 660 + i * 38 + Math.sin(k * 1.8 + i) * 3 - k * 2]), { w: 2, a: .55, gap: 0, col: '#5a4a40', seed: 2523 + i });
    // the sun through the blinds, in slanting stripes across the top
    g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(3px)';
    for (let k = 0; k < 12; k++) { const x0 = -200 + k * 120; g.fillStyle = rgba('#ffd9a0', .2 - k * .008); g.beginPath(); g.moveTo(x0, back); g.lineTo(x0 + 60, back); g.lineTo(x0 + 520, N); g.lineTo(x0 + 420, N); g.closePath(); g.fill(); }
    g.restore();
    gloom(g, w, N + 10, DI.cx, 900, 260, 1050, '#0e0814', .85);
    light(g, DI.cx, 880, 560, '#ffc884', .34, 420);
    // below the board's near edge the desk top runs on toward you, with his things on it
    nearDesk(g, 0, w, N, h, DI.cx, [['pencil', 330, N + 430, -.3], ['papers', 1150, N + 470, .2], ['inkwell', 120, N + 600, 0], ['hat', 760, N + 720, .05]], 2560);
    paper(g, w, h, .45);
  });
}
