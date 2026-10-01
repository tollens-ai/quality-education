// The bare stage, for the breakdown, and the stage floor seen from the flies, for chorus 3's
// formations.
//
// The bare stage is the theatre with everything flown out and the house dark: old boards running back
// to a sooty brick wall, the fly rail's ropes and sandbags on the left, scenery flats turned to the
// wall on the right, a ladder, a trunk, a chair, the black void of the flies with its battens and
// lanterns, black masking legs at the sides, the stage's lip and its dead footlights, and the pit
// below, and nearest the camera the stalls: rows of the audience in silhouette, rim-lit by the
// spotlight, filling the bottom of the frame under the lyric. The stage is painted twice, as the work lights would show it and in the dark. A frame
// lays the dark painting down and lets the lit one through where the spotlight's pool falls; after the
// cast are drawn, whatever stands outside the beam sinks into the dark, and the beam's haze and dust
// are breathed in over everything.
import { W, H, TAU, clamp, lerp, rng, noise, hash, mix, rgba, now, mono, setMono, beatPos } from './kit.js';
import { C } from './palette.js';
import { bake, wash, glaze, light, gloom, shadow, streaks, dabs, inkLine, paper, ao, path, wob, dense, box } from './bg.js';
import { ellipse, spline } from './ink.js';
import { look } from './common.js';
import { stallsAbove, clapHands, clapAt } from './places.js';

// World of the bare stage: the floor's front edge (the lip) is the floor line; the boards run back to
// the wall at `back`, converging on `vp`; the spotlight hangs high above the centre, off the top.
export const BS = { w: 2200, h: 2800, floor: 1760, back: 1520, vp: 1235, cx: 1000, lamp: [1000, -320] };
const F = BS.floor, BK = BS.back, VP = BS.vp, CX = BS.cx;
// Where a board line that meets the lip at xf runs at depth y (toward the vanishing point).
const along = (xf, y) => CX + (xf - CX) * (y - VP) / (F - VP);

// ---------------------------------------------------------------- the painting
function wall(g, w) {
  // the back wall: sooty brick under old plaster, darkening up into the flies
  wash(g, box(0, 0, w, BK + 12), '#4a3628', { seed: 3001, grad: [[0, '#0d0907'], [.3, '#1c140f'], [.62, '#3a2a1e'], [1, '#5e4532']], gran: .7, rim: 0, blooms: 40, amt: 0, bloom: 1.5 });
  // brick, coursed but irregular, showing through where the plaster has gone
  const R = rng(3002);
  g.save(); path(g, box(0, 560, w, BK - 560)); g.clip();
  for (let row = 0, y = 560; y < BK; row++, y += 46) {
    let x = -R() * 80;
    while (x < w) {
      const bw = lerp(96, 124, R()), c = mix(mix('#6e4430', R() < .5 ? '#5a3424' : '#7e5038', R()), '#2a1a12', R() * .3);
      g.fillStyle = rgba(c, lerp(.35, .7, R())); g.beginPath(); g.rect(x + 3, y + 3, bw - 6, 40); g.fill();
      x += bw;
    }
  }
  g.restore();
  // plaster: big pale patches over the brick, chipped at their edges
  for (let i = 0; i < 9; i++) {
    const px = lerp(-100, w + 100, R()), py = lerp(640, 1380, R()), rx = lerp(160, 420, R()), ry = lerp(120, 300, R());
    const P = []; for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; const rr = 1 + noise(k * .7, 3003 + i) * .35; P.push([px + Math.cos(a) * rx * rr, py + Math.sin(a) * ry * rr]); }
    wash(g, spline(P, true, 3), '#6b5442', { seed: 3004 + i, gran: .7, rim: .6, rimW: 5, blooms: 6, amt: 4, grad: [[0, '#7a6250'], [1, '#54402f']] });
  }
  // water stains running down from the flies
  for (let i = 0; i < 7; i++) { const x = lerp(80, w - 80, R()), y0 = lerp(300, 700, R()); streaks(g, box(x - 40, y0, 80, lerp(500, 900, R())), '#2a1a10', { seed: 3020 + i, ang: Math.PI / 2, len: 300, n: 40, a: .12, w: 3, dark: 2.5, lite: 0 }); }
  ao(g, 0, BK + 4, w, BK + 4, -60, .55);
}

// The fly rail: a heavy timber pin rail, belaying pins, a curtain of ropes running up into the dark,
// sandbags hanging at their ends.
function flyRail(g) {
  const R = rng(3100), x0 = 40, x1 = 470, ry = 1250;
  for (let i = 0; i < 16; i++) {
    const x = lerp(x0 + 10, x1 - 10, i / 15) + (R() - .5) * 8, sway = (R() - .5) * 10;
    inkLine(g, [[x + sway, 0], [x + sway * .5, ry * .5], [x, ry + 6]], { w: lerp(3, 4.6, R()), col: '#8a6a44', a: .85, gap: 0, seed: 3101 + i });
    inkLine(g, [[x + sway - 1.2, 0], [x - 1.2, ry]], { w: 1, col: '#c9a878', a: .35, gap: .4, seed: 3130 + i });
    if (R() < .35) {
      const by = lerp(640, 1080, R());
      shadow(g, ellipse(x + 12, by + 30, 30, 46, 0, 20), .4, 8);
      wash(g, spline([[x - 22, by - 30], [x + 22, by - 30], [x + 30, by + 30], [x + 18, by + 58], [x - 18, by + 58], [x - 30, by + 30]], true, 4), '#7c6a4c', { seed: 3150 + i, gran: .7, rim: .5, blooms: 2, ink: 1.8, inkA: .6, grad: [[0, '#9a8660'], [1, '#5a4a32']] });
      inkLine(g, [[x - 18, by - 22], [x + 18, by - 22]], { w: 2.4, col: '#3a2a1a', a: .8, gap: 0, seed: 3170 + i });
    }
  }
  // the rail itself, its pins, and a coil hung on a pin
  shadow(g, box(x0 - 10, ry + 26, x1 - x0 + 30, 26), .5, 10);
  wash(g, box(x0 - 20, ry, x1 - x0 + 40, 34), '#6a4426', { seed: 3190, gran: .5, rim: .4, blooms: 3, ink: 2.2, grad: [[0, '#8a5a34'], [1, '#4a2c16']] });
  for (let i = 0; i < 12; i++) { const x = lerp(x0, x1, (i + .5) / 12); wash(g, box(x - 5, ry - 34, 10, 100), '#a07a4a', { seed: 3200 + i, gran: .3, rim: .3, ink: 1.4, inkA: .6, amt: .3 }); }
  for (const [cx, cy] of [[150, ry + 110], [360, ry + 96]]) for (let k = 0; k < 4; k++) inkLine(g, ellipse(cx, cy + k * 6, 54 - k * 4, 26 - k * 2, 0, 28), { w: 3.6, col: '#8a6a44', a: .85, gap: .05, seed: 3220 + cx + k, closed: true });
  // the rail's posts down to the floor
  for (const x of [x0 - 10, x1 + 10]) wash(g, box(x - 12, ry + 30, 24, BK - ry - 26), '#4a2c16', { seed: 3240 + x, gran: .4, rim: .3, ink: 1.8, inkA: .5 });
}

// The scenery dock door: two tall ledged-and-braced leaves with strap hinges and an iron bar.
function dockDoor(g) {
  const x0 = 560, x1 = 900, y0 = 560, mid = (x0 + x1) / 2;
  shadow(g, box(x0 - 10, y0 - 10, x1 - x0 + 40, BK - y0 + 10), .5, 14);
  wash(g, box(x0 - 22, y0 - 26, x1 - x0 + 44, BK - y0 + 26), '#3a2416', { seed: 3300, gran: .5, rim: .4, ink: 2.4, inkA: .5 });
  const R = rng(3301);
  for (let i = 0; i < 8; i++) {
    const bx = lerp(x0, x1, i / 8), bw = (x1 - x0) / 8;
    wash(g, box(bx, y0, bw, BK - y0), mix('#6a4a32', R() < .5 ? '#4e3220' : '#7e5a3c', R() * .6), { seed: 3302 + i, gran: .6, rim: .3, blooms: 3, amt: .4, ink: 1.4, inkA: .45 });
    streaks(g, box(bx, y0, bw, BK - y0), '#6a4a32', { seed: 3310 + i, ang: Math.PI / 2, len: 220, n: 30, a: .14, w: 1.4 });
  }
  // ledges and braces on each leaf
  for (const [a, b] of [[x0, mid - 4], [mid + 4, x1]]) {
    for (const y of [y0 + 90, (y0 + BK) / 2, BK - 110]) wash(g, box(a + 6, y - 18, b - a - 12, 36), '#5a3a24', { seed: 3320 + y + a, gran: .5, rim: .4, ink: 1.8, inkA: .6, amt: .4 });
    for (const [ya, yb] of [[y0 + 108, (y0 + BK) / 2 - 18], [(y0 + BK) / 2 + 18, BK - 128]]) wash(g, [[a + 10, yb], [a + 34, yb], [b - 10, ya], [b - 34, ya]], '#5a3a24', { seed: 3330 + ya + a, gran: .5, rim: .4, ink: 1.6, inkA: .55, amt: .4 });
  }
  // the gap between the leaves, strap hinges, the bar
  inkLine(g, [[mid, y0], [mid, BK]], { w: 6, col: '#120804', a: .9, gap: 0 });
  for (const y of [y0 + 90, BK - 110]) for (const [hx, dir] of [[x0, 1], [x1, -1]]) { wash(g, [[hx, y - 10], [hx + dir * 150, y - 6], [hx + dir * 162, y], [hx + dir * 150, y + 6], [hx, y + 10]], '#2a2a2c', { seed: 3340 + y + hx, gran: .3, rim: .2, ink: 1.4, inkA: .7, amt: .2 }); for (let k = 0; k < 4; k++) { g.fillStyle = rgba('#8a8a84', .6); g.beginPath(); g.arc(hx + dir * (20 + k * 36), y, 3.2, 0, TAU); g.fill(); } }
  wash(g, box(x0 + 40, (y0 + BK) / 2 - 64, x1 - x0 - 80, 16), '#2a2a2c', { seed: 3350, gran: .3, rim: .3, ink: 1.6, inkA: .7, amt: .2 });
}

// Scenery flats turned to the wall: their backs, canvas on timber frames with corner braces,
// leaning in an overlapping stack.
function flats(g) {
  const R = rng(3400);
  const stack = [[1240, 1450, 640, .03], [1300, 1530, 700, -.02], [1390, 1610, 610, .05], [1470, 1690, 760, .01]];
  for (const [x0, x1, top, lean] of stack) {
    const P = [[x0 + lean * 800, top], [x1 + lean * 800, top + 6], [x1, BK], [x0, BK]];
    shadow(g, P.map(([x, y]) => [x - 24, y + 10]), .55, 16);
    wash(g, P, '#bfa77c', { seed: 3401 + x0, gran: .7, rim: .5, blooms: 8, amt: .6, grad: [[0, '#cdb88e'], [1, '#9a845c']], ink: 1.8, inkA: .5 });
    // the frame: stiles, rails, and the corner braces
    const at = (u, v) => [lerp(lerp(P[0][0], P[1][0], u), lerp(P[3][0], P[2][0], u), v), lerp(lerp(P[0][1], P[1][1], u), lerp(P[3][1], P[2][1], u), v)];
    const bar = (a, b, wd, seed) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L * wd / 2, ny = dx / L * wd / 2; wash(g, [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], '#8a6a42', { seed, gran: .4, rim: .4, ink: 1.4, inkA: .55, amt: .3, blooms: 1 }); };
    bar(at(.04, 0), at(.04, 1), 22, 3410 + x0); bar(at(.96, 0), at(.96, 1), 22, 3411 + x0);
    bar(at(0, .02), at(1, .02), 20, 3412 + x0); bar(at(0, .98), at(1, .98), 20, 3413 + x0); bar(at(0, .5), at(1, .5), 18, 3414 + x0);
    bar(at(.04, .1), at(.4, .02), 14, 3415 + x0); bar(at(.6, .98), at(.96, .9), 14, 3416 + x0);
    // old paint bled through the canvas from the front: faint blots
    for (let k = 0; k < 4; k++) { const [px, py] = at(lerp(.15, .85, R()), lerp(.1, .9, R())); g.save(); g.globalAlpha = .18; wash(g, ellipse(px, py, lerp(30, 80, R()), lerp(20, 60, R()), R() * 3, 20), ['#7a5a8a', '#4a6a8a', '#8a4a3a'][k % 3], { seed: 3420 + k + x0, gran: .5, rim: .5, blooms: 2, amt: 3 }); g.restore(); }
  }
}

function ladder(g) {
  const a = [[1790, BK], [1856, 720]], b = [[1880, BK], [1944, 724]];
  shadow(g, [[1800, BK], [1890, BK], [1960, 740], [1870, 736]], .45, 14);
  for (const [p, q] of [a, b]) wash(g, [[p[0] - 9, p[1]], [p[0] + 9, p[1]], [q[0] + 8, q[1]], [q[0] - 8, q[1]]], '#8a6a42', { seed: 3500 + p[0], gran: .4, rim: .4, ink: 1.8, inkA: .6, amt: .3, grad: [[0, '#a07c4e'], [1, '#6a4a2a']] });
  for (let i = 1; i < 13; i++) { const u = i / 13, y = lerp(BK, 722, u), xa = lerp(a[0][0], a[1][0], u), xb = lerp(b[0][0], b[1][0], u); wash(g, box(xa, y - 6, xb - xa, 12), '#7a5a36', { seed: 3510 + i, gran: .3, rim: .3, ink: 1.4, inkA: .55, amt: .2 }); }
}

// What stands about at the back: a bentwood chair, a strapped trunk, a sandbag, a coil of rope.
function clutter(g) {
  // the chair, a little left of the door
  const cx = 1020, cy = BK + 34;
  shadow(g, ellipse(cx + 10, cy + 4, 70, 14, 0, 20), .5, 8);
  for (const [x0, x1] of [[cx - 44, cx - 50], [cx + 44, cx + 50], [cx - 30, cx - 34], [cx + 30, cx + 34]]) inkLine(g, [[x0, cy - 70], [x1, cy]], { w: 6, col: '#3a2416', a: .9, gap: 0 });
  wash(g, ellipse(cx, cy - 74, 54, 14, 0, 26), '#7a5030', { seed: 3601, gran: .4, rim: .4, ink: 1.8, inkA: .6 });
  inkLine(g, spline([[cx - 46, cy - 76], [cx - 50, cy - 160], [cx, cy - 196], [cx + 50, cy - 160], [cx + 46, cy - 76]], false, 6), { w: 6, col: '#3a2416', a: .9, gap: 0 });
  inkLine(g, spline([[cx - 30, cy - 120], [cx, cy - 136], [cx + 30, cy - 120]], false, 5), { w: 4, col: '#3a2416', a: .8, gap: 0 });
  // the trunk, lid strapped, at the foot of the flats
  const tx = 1900, ty = BK + 40;
  shadow(g, box(tx - 110, ty - 6, 240, 22), .5, 10);
  wash(g, box(tx - 120, ty - 120, 240, 120), '#5a3a22', { seed: 3610, gran: .5, rim: .4, blooms: 3, ink: 2.2, inkA: .6, grad: [[0, '#7a5232'], [1, '#3a2414']] });
  wash(g, box(tx - 126, ty - 140, 252, 30), '#4a2e1a', { seed: 3611, gran: .5, rim: .4, ink: 2, inkA: .6 });
  for (const x of [tx - 70, tx + 60]) wash(g, box(x - 9, ty - 140, 18, 140), '#2e2018', { seed: 3612 + x, gran: .3, rim: .3, ink: 1.4, inkA: .6, amt: .2 });
  for (const x of [tx - 120, tx + 112]) wash(g, box(x, ty - 140, 10, 140), '#8a7a52', { seed: 3614 + x, gran: .3, rim: .3, amt: .2 });
  // a sandbag slumped by the fly rail, and a coil of rope by the door
  wash(g, spline([[300, BK + 28], [330, BK - 30], [390, BK - 38], [420, BK + 24], [360, BK + 34]], true, 4), '#7a6a4a', { seed: 3620, gran: .7, rim: .5, ink: 1.8, inkA: .6, grad: [[0, '#9a8a62'], [1, '#5a4a30']] });
  for (let k = 0; k < 5; k++) inkLine(g, ellipse(760, BK + 26 - k * 7, 64 - k * 5, 15 - k, 0, 30), { w: 4, col: '#8a6a44', a: .85, gap: .04, seed: 3630 + k, closed: true });
}

// The flies: black borders hung across the top, pipe battens with old lanterns, and lines.
function flies(g, w) {
  const R = rng(3700);
  for (const [y, n] of [[230, 7], [420, 5]]) {
    inkLine(g, [[0, y], [w, y + 4]], { w: 8, col: '#3a3634', a: .9, gap: 0, seed: 3701 + y });
    inkLine(g, [[0, y - 2], [w, y + 2]], { w: 2, col: '#8a8078', a: .35, gap: .2, seed: 3702 + y });
    for (let i = 0; i < n; i++) {
      const x = lerp(160, w - 160, (i + .5) / n) + (R() - .5) * 60;
      if (Math.abs(x - CX) < 200) continue;
      // a lantern: a yoke, a drum-shaped body with a cowl, hanging from the pipe
      inkLine(g, [[x - 26, y], [x - 26, y + 56], [x + 26, y + 56], [x + 26, y]], { w: 4, col: '#2a2624', a: .95, gap: 0 });
      const P = [[x - 34, y + 40], [x + 30, y + 30], [x + 44, y + 110], [x - 22, y + 122]];
      wash(g, P, '#2c2a28', { seed: 3710 + x, gran: .4, rim: .3, ink: 2, inkA: .7, grad: [[0, '#4a4642'], [1, '#1a1816']] });
      wash(g, ellipse(x + 11, y + 118, 32, 9, -.2, 20), '#4a4440', { seed: 3711 + x, gran: .2, rim: .2, ink: 1.6, inkA: .6 });
      inkLine(g, [[x - 30, y + 46], [x + 34, y + 36]], { w: 1.6, col: '#9a8e80', a: .35, gap: 0 });
    }
  }
  // the borders: black velour hung across, folds catching a little light, a wavy hem
  for (const [y0, y1, seed] of [[0, 150, 3720], [300, 372, 3721]]) {
    const P = [[0, y0], [w, y0], [w, y1]]; for (let k = 40; k >= 0; k--) P.push([k / 40 * w, y1 + Math.sin(k * 1.7) * 6]);
    wash(g, P, '#161212', { seed, gran: .5, rim: 0, blooms: 6, amt: 0 });
    g.save(); path(g, P); g.clip();
    for (let k = 0; k < 40; k++) { const x = k / 40 * w; const gr = g.createLinearGradient(x - 30, 0, x + 30, 0); gr.addColorStop(0, 'rgba(0,0,0,.4)'); gr.addColorStop(.5, 'rgba(120,100,90,.12)'); gr.addColorStop(1, 'rgba(0,0,0,.4)'); g.fillStyle = gr; g.fillRect(x - 30, y0, 60, y1 - y0 + 20); }
    g.restore();
  }
  // lines dropping out of the dark
  for (let i = 0; i < 6; i++) { const x = lerp(560, 1800, R()); if (Math.abs(x - CX) < 160) continue; inkLine(g, [[x, 0], [x + (R() - .5) * 20, lerp(500, 900, R())]], { w: 2.4, col: '#5a4a3a', a: .7, gap: 0, seed: 3730 + i }); }
}

// The boards: running back to the wall, each its own colour, grain, butt joints with their nails,
// gaps between, the centre worn pale by feet, scuffs, spike marks, a trap.
function boards(g, w) {
  const R = rng(3800), BW = 108, k = (BK - VP) / (F - VP);
  for (let i = -12; i < 12; i++) {
    const xf0 = CX + i * BW, xf1 = CX + (i + 1) * BW, xb0 = CX + i * BW * k, xb1 = CX + (i + 1) * BW * k;
    const P = [[xb0, BK], [xb1, BK], [xf1, F], [xf0, F]];
    const base = mix(mix('#a87448', R() < .5 ? '#8a5a34' : '#b8875a', R() * .6), R() < .5 ? '#3a2414' : '#e0b888', R() * .14);
    wash(g, P, base, { seed: 3801 + i * 7, gran: .65, rim: .12, blooms: 5, amt: .3, bloom: 1.2, grad: [[0, mix(base, '#3a2414', .3)], [1, base]] });
    g.save(); path(g, P); g.clip();
    for (let n = 0; n < 34; n++) {
      const u = R(), y0 = lerp(BK, F, Math.pow(R(), .8)), y1 = Math.min(F + 4, y0 + lerp(60, 260, R()));
      const at = y => lerp(lerp(xb0, xb1, u), lerp(xf0, xf1, u), (y - BK) / (F - BK));
      g.strokeStyle = rgba(R() < .62 ? '#2a160a' : '#f0d2a0', lerp(.05, .16, R())); g.lineWidth = lerp(.6, 2, R()) * lerp(.45, 1, (y0 - BK) / (F - BK));
      g.beginPath(); g.moveTo(at(y0), y0); g.quadraticCurveTo(at((y0 + y1) / 2) + (R() - .5) * 4, (y0 + y1) / 2, at(y1), y1); g.stroke();
    }
    // a knot now and then
    if (R() < .35) { const y = lerp(BK + 40, F - 30, R()), q = (y - BK) / (F - BK), x = lerp(lerp(xb0, xb1, .5), lerp(xf0, xf1, .5), q) + (R() - .5) * 20; g.strokeStyle = rgba('#2a160a', .3); g.lineWidth = 1.4; for (let r = 0; r < 3; r++) { g.beginPath(); g.ellipse(x, y, (5 + r * 5) * lerp(.5, 1, q), (2 + r * 2) * lerp(.5, 1, q), 0, 0, TAU); g.stroke(); } }
    g.restore();
    // butt joints across the board, nailed
    for (let j = 0; j < 2; j++) {
      const y = lerp(BK + 30, F - 30, R()), q = (y - BK) / (F - BK), xa = lerp(xb0, xf0, q), xb = lerp(xb1, xf1, q);
      inkLine(g, [[xa, y], [xb, y + .5]], { w: lerp(1.2, 2.6, q), col: '#1a0c05', a: .55, gap: 0 });
      for (const [dy, side] of [[-6 * q - 2, .18], [-6 * q - 2, .82], [6 * q + 2, .18], [6 * q + 2, .82]]) { g.fillStyle = rgba('#120804', .55); g.beginPath(); g.ellipse(lerp(xa, xb, side), y + dy, 2.6 * lerp(.6, 1, q), 1.6 * lerp(.6, 1, q), 0, 0, TAU); g.fill(); }
    }
    // the gap along the board's edge
    inkLine(g, [[xb0, BK], [xf0, F]], { w: 2.4, col: '#140904', a: .6, gap: 0, seed: 3850 + i });
  }
  // feet have worn the middle pale; grime gathers to the sides and the back
  g.save(); g.globalCompositeOperation = 'screen'; g.translate(CX, F - 90); g.scale(1, .2);
  const wr = g.createRadialGradient(0, 0, 20, 0, 0, 640); wr.addColorStop(0, rgba('#ffe2b0', .22)); wr.addColorStop(1, rgba('#ffe2b0', 0)); g.fillStyle = wr; g.beginPath(); g.arc(0, 0, 640, 0, TAU); g.fill(); g.restore();
  ao(g, 0, BK, w, BK, 56, .45);
  // scuffs and heel marks
  for (let i = 0; i < 46; i++) { const x = lerp(200, w - 200, R()), y = lerp(BK + 30, F - 12, R()), q = (y - BK) / (F - BK), L = lerp(10, 36, R()) * lerp(.5, 1, q), a = (R() - .5) * .8; g.strokeStyle = rgba('#1a0c05', lerp(.12, .3, R())); g.lineWidth = lerp(1.5, 3.5, R()) * q; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L * .5, y - L * .08, x + Math.cos(a) * L, y + Math.sin(a) * L * .3); g.stroke(); }
  // spike marks: little crosses of pale tape where someone once stood
  for (const [x, y] of [[CX - 230, F - 70], [CX + 260, F - 90], [CX + 40, BK + 80], [CX - 520, F - 50], [CX + 600, BK + 120]]) {
    const q = (y - BK) / (F - BK), s = lerp(.5, 1, q);
    for (const a of [.6, -.6]) { g.save(); g.translate(x, y); g.scale(1, .36); g.rotate(a); g.fillStyle = rgba('#efe2bf', .75); g.fillRect(-22 * s, -4 * s, 44 * s, 8 * s); g.restore(); }
  }
  // the trap: a square of boards with its hinges and a sunk ring
  const tq = [[along(CX - 620, BK + 70), BK + 70], [along(CX - 300, BK + 70), BK + 70], [along(CX - 300, BK + 170), BK + 170], [along(CX - 620, BK + 170), BK + 170]];
  inkLine(g, tq, { w: 3, col: '#140904', a: .7, gap: 0, closed: true });
  for (const u of [.25, .75]) { const x = lerp(tq[0][0], tq[1][0], u); g.fillStyle = rgba('#2a2a2a', .7); g.fillRect(x - 12, BK + 66, 24, 8); }
  g.strokeStyle = rgba('#2a2018', .7); g.lineWidth = 2.4; g.beginPath(); g.ellipse((tq[2][0] + tq[3][0]) / 2, BK + 150, 14, 5, 0, 0, TAU); g.stroke();
}

// The lip of the stage, its dead footlight shells, and the pit below.
function lipAndPit(g, w, h) {
  wash(g, box(0, F - 4, w, 34), '#6a4426', { seed: 3900, gran: .5, rim: .3, blooms: 4, amt: .3, grad: [[0, '#b07a48'], [.25, '#7a4a28'], [1, '#2e1a0c']] });
  inkLine(g, [[0, F - 3], [w, F - 2]], { w: 2.4, col: '#1a0c05', a: .7, gap: .05 });
  const R = rng(3901);
  for (let k = 0; k < 10; k++) {
    const x = lerp(170, w - 170, k / 9), y = F + 2;
    const P = []; for (let q = 0; q <= 10; q++) { const a = Math.PI + q / 10 * Math.PI; P.push([x + Math.cos(a) * 42, y + Math.sin(a) * 30]); }
    wash(g, P, '#5a4a36', { seed: 3910 + k, gran: .4, rim: .4, ink: 1.8, inkA: .6, radial: [x - 10, y - 18, 2, 44, [[0, '#a08a62'], [1, '#3a2a1a']]] });
    for (let q = 1; q < 6; q++) { const a = Math.PI + q / 6 * Math.PI; inkLine(g, [[x, y], [x + Math.cos(a) * 36, y + Math.sin(a) * 26]], { w: 1.4, col: '#2a1a10', a: .5, gap: 0, seed: 3920 + k * 7 + q }); }
  }
  wash(g, box(0, F + 30, w, h - F - 30), '#120a06', { seed: 3930, grad: [[0, '#24140a'], [.25, '#120904'], [1, '#070302']], gran: .5, rim: 0, blooms: 12, amt: 0 });
  streaks(g, box(0, F + 30, w, 300), '#1a0e08', { seed: 3931, ang: 0, len: 360, n: 160, a: .07, w: 2 });
  ao(g, 0, F + 30, w, F + 30, 90, .6);
}

// The black masking legs at the sides, downstage, standing on the boards.
function legs(g, w) {
  for (const [x0, x1, seed] of [[-40, 130, 3950], [w - 130, w + 40, 3951]]) {
    const P = [[x0, 0], [x1, 0], [x1 + (x0 < 0 ? 10 : -10), F - 40], [x0, F - 40]];
    shadow(g, P.map(([x, y]) => [x + (x0 < 0 ? 26 : -26), y + 8]), .55, 18);
    wash(g, P, '#141010', { seed, gran: .4, rim: 0, blooms: 4, amt: 0 });
    g.save(); path(g, P); g.clip();
    for (let k = 0; k < 6; k++) { const x = lerp(x0, x1, (k + .5) / 6); const gr = g.createLinearGradient(x - 16, 0, x + 16, 0); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(.5, 'rgba(140,120,105,.1)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = gr; g.fillRect(x - 16, 0, 32, F); }
    g.restore();
  }
}

function paintBare(g, w, h) {
  wall(g, w);
  flies(g, w);
  dockDoor(g);
  flyRail(g);
  flats(g);
  ladder(g);
  clutter(g);
  boards(g, w);
  legs(g, w);
  lipAndPit(g, w, h);
  // the air: cooler and darker up in the flies, the far corners gathering shadow
  g.save(); g.globalCompositeOperation = 'multiply';
  const cool = g.createLinearGradient(0, 0, 0, F);
  cool.addColorStop(0, 'rgb(120,116,140)'); cool.addColorStop(.45, 'rgb(205,196,200)'); cool.addColorStop(1, 'rgb(255,250,244)');
  g.fillStyle = cool; g.fillRect(0, 0, w, F); g.restore();
  paper(g, w, h, .42);
}

// The two paintings: as the work lights would show it, and in the dark. Baked with the colour on,
// whenever they're first asked for (the breakdown drains them as it draws them).
export function bareLit() { const m = mono(); setMono(0); const c = bake('bareStageLit', BS.w, BS.h, paintBare); setMono(m); return c; }
export function bareDark() {
  const m = mono(); setMono(0);
  const lit = bareLit();
  const c = bake('bareStageDark', BS.w, BS.h, (g, w, h) => {
    g.drawImage(lit, 0, 0);
    g.save(); g.globalCompositeOperation = 'multiply';
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, 'rgb(34,28,34)'); gr.addColorStop(BK / h, 'rgb(70,58,60)'); gr.addColorStop((BK + 60) / h, 'rgb(82,68,64)'); gr.addColorStop(F / h, 'rgb(104,86,76)'); gr.addColorStop((F + 40) / h, 'rgb(70,58,54)'); gr.addColorStop(1, 'rgb(60,50,48)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore();
    gloom(g, w, h, CX, F - 200, 500, 1500, '#08050a', .7);
  });
  setMono(m);
  return c;
}

// ---------------------------------------------------------------- the spotlight
// A spotlight: its pool on the floor centred (x, y) with radii rx, ry; k its strength (0..1); the
// lamp it hangs from, high in the flies (BS.lamp unless given).
// The canvas filter that drains a painting as the palette drains the cels.
export const drainFilter = () => { const m = mono(); return m > 0 ? `sepia(${m.toFixed(3)}) saturate(${(1 - m * .6).toFixed(3)})` : 'none'; };

const LAYERS = {};
function layerFor(g, key, scale = 1) {
  const cv = g.canvas, w = Math.round(cv.width * scale), h = Math.round(cv.height * scale);
  let L = LAYERS[key];
  if (!L || L.width !== w || L.height !== h) { L = document.createElement('canvas'); L.width = w; L.height = h; LAYERS[key] = L; }
  return L;
}

// The stage under a camera: the dark painting, and the lit one let through in the spotlight's pool.
export function bareStage(g, cam, sp) {
  const lit = bareLit(), dark = bareDark(), filt = drainFilter();
  g.save(); look(g, cam); g.filter = filt; g.drawImage(dark, 0, 0); g.restore();
  if (!sp || sp.k <= 0) return;
  const L = layerFor(g, 'pool'), lg = L.getContext('2d');
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.filter = 'none'; lg.clearRect(0, 0, L.width, L.height);
  lg.setTransform(g.getTransform());
  lg.save(); look(lg, cam); lg.filter = filt; lg.drawImage(lit, 0, 0); lg.filter = 'none';
  lg.globalCompositeOperation = 'destination-in';
  lg.translate(sp.x, sp.y); lg.scale(1, sp.ry / sp.rx);
  const R = sp.rx * 1.9, k = clamp(sp.k), gr = lg.createRadialGradient(0, 0, 0, 0, 0, R);
  gr.addColorStop(0, `rgba(0,0,0,${k})`); gr.addColorStop(.36, `rgba(0,0,0,${k * .96})`); gr.addColorStop(.52, `rgba(0,0,0,${k * .55})`); gr.addColorStop(.72, `rgba(0,0,0,${k * .14})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
  lg.fillStyle = gr; lg.fillRect(-R, -R, R * 2, R * 2);
  lg.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(L, 0, 0); g.restore();
  // the hot centre of the pool
  g.save(); look(g, cam); g.globalCompositeOperation = 'screen'; g.translate(sp.x, sp.y); g.scale(1, sp.ry / sp.rx);
  const hot = g.createRadialGradient(0, 0, 0, 0, 0, sp.rx);
  hot.addColorStop(0, `rgba(255,236,196,${.32 * k})`); hot.addColorStop(.6, `rgba(255,226,180,${.12 * k})`); hot.addColorStop(1, 'rgba(255,226,180,0)');
  g.fillStyle = hot; g.beginPath(); g.arc(0, 0, sp.rx, 0, TAU); g.fill(); g.restore();
}

// The cone from the lamp to the pool, in world coordinates: [left top, right top, right foot, left foot].
function coneOf(sp, spread = 1) {
  const [lx, ly] = sp.lamp || BS.lamp, top = (sp.top ?? 26) * spread;
  return [[lx - top, ly], [lx + top, ly], [sp.x + sp.rx * spread, sp.y], [sp.x - sp.rx * spread, sp.y]];
}

// After the cast: what stands outside the beam sinks into the dark; then the beam's haze, its dust,
// and the faint glow where it meets the floor. o.dark sets how dark the dark is (0..1).
export function spotBeam(g, cam, sp, t, o = {}) {
  const k = clamp(sp?.k ?? 0), darkK = o.dark ?? .62;
  // the dark: a light map, white in the beam, multiplied over the frame
  const M = layerFor(g, 'lightmap', .5), mg = M.getContext('2d');
  const dk = [lerp(255, 52, darkK), lerp(255, 42, darkK), lerp(255, 48, darkK)].map(Math.round);
  mg.setTransform(1, 0, 0, 1, 0, 0); mg.filter = 'none'; mg.globalCompositeOperation = 'source-over';
  mg.fillStyle = `rgb(${dk.join(',')})`; mg.fillRect(0, 0, M.width, M.height);
  if (k > 0) {
    const T = g.getTransform(); mg.setTransform(T.a * .5, T.b * .5, T.c * .5, T.d * .5, T.e * .5, T.f * .5);
    look(mg, cam);
    mg.filter = `blur(${(22 * M.width / W).toFixed(1)}px)`;
    const P = coneOf(sp, 1.04), lit = c => Math.round(lerp(c, 255, k));
    const [lx, ly] = sp.lamp || BS.lamp;
    const gr = mg.createLinearGradient(lx, ly, sp.x, sp.y);
    gr.addColorStop(0, `rgb(${dk.map(c => Math.round(lerp(c, 255, k * .35))).join(',')})`);
    gr.addColorStop(.55, `rgb(${dk.map(lit).join(',')})`); gr.addColorStop(1, `rgb(${dk.map(lit).join(',')})`);
    mg.fillStyle = gr; mg.beginPath(); P.forEach(([x, y], i) => i ? mg.lineTo(x, y) : mg.moveTo(x, y)); mg.closePath(); mg.fill();
    mg.fillStyle = `rgb(${dk.map(lit).join(',')})`; mg.beginPath(); mg.ellipse(sp.x, sp.y, sp.rx * 1.08, sp.ry * 1.5, 0, 0, TAU); mg.fill();
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.drawImage(M, 0, 0, g.canvas.width, g.canvas.height); g.restore();
  if (k <= 0) return;
  // the haze: the beam made visible, brighter toward the floor, soft at its edges
  g.save(); look(g, cam); g.globalCompositeOperation = 'screen';
  const [lx, ly] = sp.lamp || BS.lamp;
  for (const [spread, a] of [[1.06, .05], [.92, .06], [.74, .07], [.5, .06]]) {
    const P = coneOf(sp, spread), gr = g.createLinearGradient(lx, ly, sp.x, sp.y);
    gr.addColorStop(0, `rgba(255,240,210,${a * .2 * k})`); gr.addColorStop(.7, `rgba(255,236,200,${a * k})`); gr.addColorStop(1, `rgba(255,230,190,${a * 1.3 * k})`);
    g.fillStyle = gr; g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
  }
  // dust turning slowly in the beam
  const n = o.motes ?? 80, T0 = now();
  for (let i = 0; i < n; i++) {
    const u = (hash(i, 41) + T0 * (.006 + hash(i, 42) * .012)) % 1;          // height up the beam
    const v = (hash(i, 43) * 2 - 1) * .92 + noise(T0 * .25 + i * 1.3, 44) * .12;  // across it
    const yy = lerp(sp.y - 20, ly, Math.pow(u, 1.15)), q = (yy - ly) / (sp.y - ly);
    const half = lerp(sp.top ?? 26, sp.rx, q), xx = lerp(lx, sp.x, q) + v * half;
    const tw = .5 + .5 * Math.sin(T0 * (1.3 + hash(i, 45) * 2) + i * 2.1);
    const r = (1.1 + hash(i, 46) * 2.6) / Math.max(.6, cam.z ?? 1) * 1.2;
    g.fillStyle = `rgba(255,244,220,${(.25 + .6 * tw) * k * clamp(q * 3) * (1 - Math.abs(v) * .5)})`;
    g.beginPath(); g.arc(xx, yy, r, 0, TAU); g.fill();
  }
  g.restore();
}

// ---------------------------------------------------------------- the floor from the flies
// The boards straight down, a warm pool of light in the middle at (1300, 1300), dark gathering to the
// edges; downstage, nearest the camera, the footlights and the stalls, as the film's opening overhead
// has them, so the frame is full below the lyric. The boards' first 2600 square is v2's.
export const TOP = { w: 2600, h: 2900, edge: 2230 };
export function stageTop() {
  const m = mono(); setMono(0);
  const c = bake('c3StageTop', TOP.w, TOP.h, (g, w, h) => {
    const R = rng(4000), BW = 96, H0 = 2600;
    for (let i = 0, x = 0; x < w; i++, x += BW) {
      const base = mix(mix('#b07c4c', R() < .5 ? '#8e5e36' : '#c4925e', R() * .6), R() < .5 ? '#3a2414' : '#f0c890', R() * .12);
      wash(g, box(x, 0, BW, H0), base, { seed: 4001 + i, gran: .6, rim: .12, blooms: 14, amt: .3, bloom: 1.2 });
      streaks(g, box(x, 0, BW, H0), base, { seed: 4100 + i, ang: Math.PI / 2, len: 300, n: 180, a: .13, w: 1.5 });
      for (let y = R() * 500; y < H0; y += lerp(380, 820, R())) { inkLine(g, [[x, y], [x + BW, y + 1]], { w: 2, col: '#1a0c05', a: .5, gap: 0 }); for (const [dx, dy] of [[12, -9], [BW - 12, -9], [12, 9], [BW - 12, 9]]) { g.fillStyle = rgba('#120804', .55); g.beginPath(); g.arc(x + dx, y + dy, 3, 0, TAU); g.fill(); } }
      inkLine(g, [[x, 0], [x, H0]], { w: 2.6, col: '#140904', a: .6, gap: 0, seed: 4200 + i });
    }
    for (let i = 0; i < 90; i++) { const x = R() * w, y = R() * H0, L = lerp(12, 40, R()), a = R() * TAU; g.strokeStyle = rgba('#1a0c05', lerp(.1, .26, R())); g.lineWidth = lerp(1.5, 3.5, R()); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + .4) * L * .5, y + Math.sin(a + .4) * L * .5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
    light(g, 1300, 1300, 900, '#ffe2a8', .42);
    gloom(g, w, h, 1300, 1300, 420, 1300, '#140a06', .9);
    // downstage the boards fall into shadow, then the footlights' edge and the stalls
    g.save(); g.globalCompositeOperation = 'multiply';
    const ds = g.createLinearGradient(0, TOP.edge - 520, 0, TOP.edge);
    ds.addColorStop(0, 'rgba(255,255,255,1)'); ds.addColorStop(1, rgba(mix('#ffffff', '#140a06', .7), 1));
    g.fillStyle = ds; g.fillRect(0, TOP.edge - 520, w, 520); g.restore();
    stallsAbove(g, w, h, TOP.edge, { seed: 4300, heads: false });   // the scene draws the heads live (stallsAboveLive)
    paper(g, w, h, .4);
  });
  setMono(m);
  return c;
}

// ---------------------------------------------------------------- the stalls
// The front of the house, nearest the camera, filling the bottom of the frame: rows of the audience
// seen from behind, heads and hats in silhouette against the stage's spill, rim-lit by the spotlight
// (brightest near its pool), bobbing a little on the beat. Drawn live under the camera after the
// stage's light, sliding a little faster than the stage when the camera pans. The rows that land
// behind the lyric keep their rims faint and their heads quiet. o.lean (0..1): rapt, leaning in and
// turned toward the spotlight; o.bop (0..1): how much they bounce on the beat (each their own keenness);
// past .5 the front rows below the lyric break into applause, white gloves over their heads.
// o.blur softens them for a close-up.
const HATS = ['none', 'bowler', 'cloche', 'none', 'boater', 'bun', 'top', 'feather', 'none', 'cap', 'bowler', 'none'];
function hat(g, kind, x, y, r, col) {
  g.fillStyle = col; g.beginPath();
  if (kind === 'bowler') { g.ellipse(x, y - r * .55, r * 1.18, r * .2, 0, 0, TAU); g.moveTo(x - r * .82, y - r * .55); g.ellipse(x, y - r * .6, r * .82, r * .7, 0, Math.PI, TAU); }
  else if (kind === 'top') { g.ellipse(x, y - r * .62, r * 1.2, r * .2, 0, 0, TAU); g.rect(x - r * .62, y - r * 1.95, r * 1.24, r * 1.36); }
  else if (kind === 'boater') { g.ellipse(x, y - r * .62, r * 1.3, r * .22, 0, 0, TAU); g.rect(x - r * .7, y - r * 1.12, r * 1.4, r * .52); }
  else if (kind === 'cloche' || kind === 'feather') { g.moveTo(x - r * 1.1, y - r * .05); g.quadraticCurveTo(x - r * 1.05, y - r * 1.25, x, y - r * 1.22); g.quadraticCurveTo(x + r * 1.05, y - r * 1.25, x + r * 1.1, y - r * .05); g.closePath(); }
  else if (kind === 'bun') { g.ellipse(x + r * .1, y - r * 1.08, r * .42, r * .36, 0, 0, TAU); }
  else if (kind === 'cap') { g.ellipse(x, y - r * .5, r * .95, r * .62, 0, Math.PI, TAU); g.ellipse(x + r * .7, y - r * .48, r * .65, r * .14, .1, 0, TAU); }
  g.fill();
  if (kind === 'feather') { g.strokeStyle = col; g.lineWidth = r * .16; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + r * .6, y - r * .9); g.bezierCurveTo(x + r * 1.1, y - r * 1.6, x + r * .6, y - r * 2.1, x + r * 1.3, y - r * 2.4); g.stroke(); }
}
// The rim of light along a silhouette's top, from the stage beyond: a soft wide glow and a fine bright
// edge inside it.
function rimArc(g, x, y, rx, ry, a0, a1, w, a) {
  g.lineCap = 'round';
  g.strokeStyle = `rgba(255,214,160,${(a * .35).toFixed(3)})`; g.lineWidth = w * 3; g.beginPath(); g.ellipse(x, y, rx, ry, 0, a0, a1); g.stroke();
  g.strokeStyle = `rgba(255,236,200,${a.toFixed(3)})`; g.lineWidth = w; g.beginPath(); g.ellipse(x, y, rx * .99, ry * .99, 0, a0 + .12, a1 - .12); g.stroke();
}
export function stalls(g, cam, sp, t, o = {}) {
  const z = cam.z ?? 1, par = ((cam.x ?? CX) - CX) * (o.parallax ?? .3), k = clamp(sp?.k ?? 1), bp = beatPos(t);
  const lean = clamp(o.lean ?? 0), bop = clamp(o.bop ?? .15), spx = sp?.x ?? CX;
  const sil = C('#100906'), seatTop = C('#2c1810'), seatDark = C('#0b0604');
  g.save(); look(g, cam); g.translate(-par, 0);
  if (o.blur) g.filter = `blur(${o.blur}px)`;
  for (let row = 0; row < 8; row++) {
    const y = F + 200 + row * 112 + row * row * 7, r = 28 + row * 7.5, step = r * 2.7;
    const sy = H / 2 + (y - cam.y) * z;
    if (sy - r * 2.6 * z > H + 60 || sy + r * 3 * z < -60) continue;
    const calm = sy > 1120 && sy < 1500 ? .35 : 1;
    // the seat backs of the row in front: dark velvet, a little warm spill on their tops
    const top = y + r * 1.3, gr = g.createLinearGradient(0, top - r * .3, 0, top + r * 1.2);
    gr.addColorStop(0, seatTop); gr.addColorStop(.35, seatDark); gr.addColorStop(1, seatDark);
    g.fillStyle = gr; g.fillRect(-900, top - r * .25, BS.w + 1800, r * 2.6);
    const R = rng(4300 + row);
    let x = -900 + (row % 2) * step * .5 + R() * step * .4;
    while (x < BS.w + 900) {
      const gap = R() < .08, kind = R() < .62 ? HATS[Math.floor(R() * HATS.length)] : 'none', hr = r * lerp(.82, 1.12, R()), tilt = (R() - .5) * .16;
      const ph = R() * .5, keen = .35 + .65 * R(), quiet = calm < 1 ? .3 : 1;
      const bob = (1.5 + bop * keen * 16) * Math.max(0, Math.sin((bp + ph) * Math.PI)) * (1 + row * .25) * quiet;
      const hx = x + (R() - .5) * r * .5, hy = y - bob + (R() - .5) * r * .2 - lean * hr * .14;
      // rapt, they turn a little toward the light, wherever it goes
      const turn = clamp((spx - (hx - par)) / 1700, -1, 1) * .16 * lean;
      x += step * lerp(.82, 1.2, R());
      if (gap) continue;
      g.save(); g.translate(hx, hy + hr * 1.6); g.rotate(tilt * (1 - lean * .6) + turn); g.translate(-hx, -(hy + hr * 1.6));
      // applause, for the keen in the rows below the lyric: arms up, white gloves meeting on the beat
      const clapK = keen > .5 && calm === 1 && sy - hr * 2.2 * z > 1490 ? clamp((bop - .5) / .3) : 0;
      if (clapK > 0) {
        const p = clapAt(bp, ph * .6), sep = hr * (.1 + .42 * (1 - p)), cy = hy - hr * 1.55;
        g.strokeStyle = sil; g.lineWidth = hr * .32; g.lineCap = 'round';
        for (const d of [-1, 1]) { g.beginPath(); g.moveTo(hx + d * hr * 1.2, hy + hr * 1.4); g.quadraticCurveTo(hx + d * hr * 1.5, hy - hr * .4, hx + d * sep, cy + hr * .3); g.stroke(); }
        g.save(); g.globalAlpha *= clapK; clapHands(g, hx, cy, hr * 1.05, p, 4400 + row * 37); g.restore();
      }
      // shoulders, neck, head, hat: one silhouette
      g.fillStyle = sil; g.beginPath(); g.ellipse(hx, hy + hr * 1.6, hr * lerp(1.55, 1.85, ph * 2), hr * .86, 0, 0, TAU); g.fill();
      g.fillRect(hx - hr * .34, hy + hr * .6, hr * .68, hr * .7);
      g.beginPath(); g.ellipse(hx, hy, hr * .9, hr * 1.04, 0, 0, TAU); g.fill();
      if (kind !== 'none') hat(g, kind, hx, hy, hr, sil);
      // the rim, brightest for those nearest the spotlight's pool
      const near = Math.exp(-Math.pow((hx - par - (sp?.x ?? CX)) / 640, 2)), a = (.1 + .42 * near) * k * calm;
      if (a > .02) {
        const lw = Math.max(1.2, hr * .06);
        if (kind === 'top' || kind === 'boater') { const yy = hy - (kind === 'top' ? hr * 1.95 : hr * 1.12), hw = hr * (kind === 'top' ? .62 : .7); g.strokeStyle = `rgba(255,236,200,${a.toFixed(3)})`; g.lineWidth = lw; g.beginPath(); g.moveTo(hx - hw, yy + 1); g.lineTo(hx + hw, yy + 1); g.stroke(); rimArc(g, hx, hy - hr * .6, hr * 1.2, hr * .2, -Math.PI * .95, -Math.PI * .05, lw * .8, a * .7); }
        else if (kind === 'bowler') rimArc(g, hx, hy - hr * .6, hr * .82, hr * .7, -Math.PI * .92, -Math.PI * .08, lw, a);
        else if (kind === 'cloche' || kind === 'feather') rimArc(g, hx, hy - hr * .1, hr * 1.06, hr * 1.12, -Math.PI * .9, -Math.PI * .1, lw, a);
        else if (kind === 'cap') rimArc(g, hx, hy - hr * .5, hr * .95, hr * .62, -Math.PI * .95, -Math.PI * .05, lw, a);
        else rimArc(g, hx, hy, hr * .9, hr * 1.04, -Math.PI * .88, -Math.PI * .12, lw, a);
        rimArc(g, hx, hy + hr * 1.6, hr * 1.7, hr * .86, -Math.PI * .96, -Math.PI * .74, lw * .8, a * .8);
        rimArc(g, hx, hy + hr * 1.6, hr * 1.7, hr * .86, -Math.PI * .26, -Math.PI * .04, lw * .8, a * .8);
      }
      g.restore();
    }
  }
  g.restore();
}
