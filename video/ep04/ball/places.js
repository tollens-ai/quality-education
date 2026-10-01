// The painted places. Each is built around a lit centre, where the action stands, and a dark, calm
// apron below the floor line, where the lyric sits. World coordinates are the place canvas's own;
// a scene's camera puts the floor line at screen y FLOOR_Y.
import { W, H, TAU, clamp, lerp, rng, noise, hash, mix, rgba, beatPos } from './kit.js';
import { C } from './palette.js';
import { bake, wash, glaze, light, gloom, shadow, streaks, dabs, inkLine, paper, ao, path, wob, dense, box } from './bg.js';
import { ellipse, spline, rrect, glove } from './ink.js';

export const FLOOR_Y = 1100;          // where every place's floor line sits on screen at rest

// ---------------------------------------------------------------- shared pieces
// Planks: vertical boards with grain and gaps, lit by a radial light.
function planks(g, x0, y0, x1, y1, col, seed, o = {}) {
  const R = rng(seed);
  let a = x0, i = 0;
  while (a < x1) {
    const bw = (o.bw ?? 96) * lerp(.75, 1.3, R()), b = Math.min(x1, a + bw);
    const c = mix(mix(col, R() < .5 ? '#c0603a' : '#9a7a3a', R() * .25), R() < .5 ? '#ffe6c0' : '#1c0c04', R() * .12);
    const P = box(a, y0, b - a, y1 - y0);
    wash(g, P, c, { seed: seed + i * 7, gran: .6, rim: .2, blooms: 8, amt: .8, bloom: 1.4 });
    streaks(g, P, c, { seed: seed + i * 13, ang: Math.PI / 2 + (R() - .5) * .02, len: 200, n: Math.round((b - a) * (y1 - y0) / 1100), a: .14, w: 1.5 });
    // a joint where two boards meet end to end, with its nails
    const jy = lerp(y0 + 200, y1 - 200, R());
    g.save(); g.fillStyle = rgba('#1c0c04', .35); g.fillRect(a, jy, b - a, 2); g.restore();
    for (const ny of [jy - 14, jy + 14]) { g.save(); g.fillStyle = rgba('#1c0c04', .5); g.beginPath(); g.arc(a + 12, ny, 2.6, 0, TAU); g.arc(b - 12, ny, 2.6, 0, TAU); g.fill(); g.restore(); }
    if (R() < .4) { const kx = lerp(a + 20, b - 20, R()), ky = lerp(y0 + 60, y1 - 60, R()); g.save(); g.strokeStyle = rgba(mix(c, '#1c0c04', .5), .28); g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(kx, ky, 6 + k * 6, 14 + k * 10, 0, 0, TAU); g.stroke(); } g.restore(); }
    // the gap between boards, soft
    g.save(); g.filter = 'blur(1.2px)'; g.fillStyle = rgba('#140804', .4); g.fillRect(b - 1.5, y0, 2.5, y1 - y0); g.restore();
    a = b; i++;
  }
}

// A night town seen through a window: three rows of roofs, chimneys, a spire and a water tower,
// the far rows paler in the haze, windows lit. Clip to the window first.
export function nightTown(g, x0, x1, base, seed = 120, o = {}) {
  const rows = o.rows || [['#3a5278', 0, 60, 140], ['#273b5e', 50, 90, 190], ['#182742', 110, 110, 240]];
  rows.forEach(([col, dy, hmin, hmax], row) => {
    const RR = rng(seed + row); let x = x0 - 30;
    while (x < x1 + 30) {
      const bw = lerp(48, 100, RR()), bh = lerp(hmin, hmax, RR()), by = base + dy;
      const kind = RR();
      let roof;
      if (kind < .45) roof = [[x, by - bh], [x + bw / 2, by - bh - bw * .5], [x + bw, by - bh]];
      else if (kind < .7) roof = [[x, by - bh], [x + bw * .2, by - bh - 16], [x + bw * .8, by - bh - 16], [x + bw, by - bh]];
      else roof = [[x, by - bh], [x + bw, by - bh]];
      const P = [[x, by + 400], ...roof, [x + bw, by + 400]];
      wash(g, P, col, { seed: seed + 9 + x, gran: .35, rim: .15, blooms: 1, amt: .5 });
      if (RR() < .5) wash(g, box(x + bw * .65, by - bh - 40 - bw * .2, 14, 50), col, { seed: seed + 11 + x, gran: .3, rim: .1, amt: .3 });
      if (row === 1 && RR() < .12) { wash(g, [[x + bw / 2 - 10, by - bh], [x + bw / 2, by - bh - 120], [x + bw / 2 + 10, by - bh]], col, { seed: seed + 13 + x, gran: .3, rim: .1, amt: .3 }); }
      for (let k = 0; k < 4; k++) if (RR() < .45) { const lx = x + lerp(8, bw - 16, RR()), ly = by - bh + lerp(16, bh - 10, RR()); g.fillStyle = C(RR() < .7 ? '#f3c96a' : '#e58b4a'); g.fillRect(lx, ly, 8, 11); light(g, lx + 4, ly + 5, 16, '#f3c96a', .2); }
      x += bw + lerp(0, 8, RR());
    }
    // haze between the rows
    g.save(); g.globalAlpha = .18; g.fillStyle = C('#8aa2c8'); g.fillRect(x0 - 40, base + dy - hmin * .3, x1 - x0 + 80, 400); g.restore();
  });
}

// An audience in silhouette, row on row from just below the floor line `F` down to the camera,
// spanning 0..w, the light from the stage (or ring) catching the tops of heads and hats. A place's
// lower band, under the lyric: atmosphere, no story. o.rim: the light's colour; o.rows: [[dy, r, n]];
// o.x0/o.x1: extent; o.hats: how many wear hats (0..1).
export function audience(g, F, w, o = {}) {
  const RR = rng(o.seed ?? 395), rim = o.rim || '#f6c070', x0 = o.x0 ?? -80, x1 = o.x1 ?? w + 80, hats = o.hats ?? .6;
  const rows = o.rows || [[110, 40, 30], [270, 56, 21], [480, 76, 16], [750, 100, 12], [1080, 126, 9]];
  for (const [dy, r, n] of rows) {
    const y = F + dy;
    for (let k = 0; k < n; k++) {
      const x = lerp(x0, x1, (k + .5) / n) + (RR() - .5) * r * .6, yy = y + (RR() - .5) * r * .3;
      g.save(); g.fillStyle = RR() < .3 ? '#160a07' : '#0c0504';
      g.beginPath(); g.ellipse(x, yy + r * 1.45, r * 2.05, r * 1.1, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(x, yy, r * .92, r * 1.08, 0, 0, TAU); g.fill();
      const hat = RR() / hats;
      if (hat < .33) { g.fillRect(x - r * .62, yy - r * 2.0, r * 1.24, r * 1.1); g.beginPath(); g.ellipse(x, yy - r * .9, r * 1.15, r * .22, 0, 0, TAU); g.fill(); }
      else if (hat < .63) { g.beginPath(); g.ellipse(x, yy - r * .78, r * .82, r * .62, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(x, yy - r * .72, r * 1.12, r * .2, 0, 0, TAU); g.fill(); }
      else if (hat < .83) { g.beginPath(); g.ellipse(x - r * .5, yy - r * .9, r * .34, r * .2, -.5, 0, TAU); g.ellipse(x + r * .5, yy - r * .9, r * .34, r * .2, .5, 0, TAU); g.fill(); }
      else if (hat < 1) { g.beginPath(); g.ellipse(x + r * .1, yy - r * .95, r * .5, r * .34, .2, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x + r * .4, yy - r * 1.1); g.quadraticCurveTo(x + r * 1.1, yy - r * 2.1, x + r * .3, yy - r * 1.9); g.lineWidth = r * .12; g.strokeStyle = '#0c0504'; g.stroke(); }
      g.restore();
      g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = Math.max(.2, .7 - dy / 2600); g.strokeStyle = rim; g.lineWidth = Math.max(2.5, r * .1);
      g.beginPath(); g.ellipse(x, yy, r * .86, r * 1.02, 0, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      g.globalAlpha *= .5; g.beginPath(); g.ellipse(x, yy + r * 1.45, r * 1.95, r * 1.02, 0, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); g.restore();
    }
  }
}

// The same audience drawn live, so it can be into the show: o.bop (0..1) is how much. Near 0 they sit
// attentive with a little sway; from about .3 the front rows clap on the beat; past .55 the keenest
// put their hands up and wave, and wave their hats. In silhouette a crowd's movement is invisible, so
// what shows it is the rubber hose's white gloves, and a brighter rim on the front rows as they bounce.
// Only the rows below the lyric's band (dy >= 500) clap or raise their hands. Draw it after place(), in
// the same transform; the place must be baked without its audience (theatre({ live: true }),
// circus({ live: true })).
// Two hands clapping on the beat: p (0..1) is how close together they are, 1 on the beat.
export const clapAt = (bp, ph) => Math.pow(Math.abs(Math.cos((bp + ph) * Math.PI)), 3);
// The crowd's gloves are cream, lit by the stage: they read in the dark without glaring under the lyric.
export const CROWD_GLOVE = { col: '#ecdfc4', shade: '#a39274' };
export function clapHands(g, x, y, r, p, seed) {
  const sep = r * (.1 + .42 * (1 - p));
  for (const d of [-1, 1]) glove(g, x + d * sep, y, -Math.PI / 2 - d * (.35 + .25 * (1 - p)), r * .34, 'flat', { flip: d < 0, seed: seed + d, ...CROWD_GLOVE });
}
export function audienceLive(g, F, w, t, o = {}) {
  const RR = rng(o.seed ?? 395), rim = o.rim || '#f6c070', x0 = o.x0 ?? -80, x1 = o.x1 ?? w + 80, hats = o.hats ?? .6;
  const rows = o.rows || [[110, 40, 30], [270, 56, 21], [480, 76, 16], [750, 100, 12], [1080, 126, 9]];
  const bop = clamp(o.bop ?? .15), bp = beatPos(t);
  for (const [dy, r, n] of rows) {
    const y = F + dy;
    for (let k = 0; k < n; k++) {
      const x = lerp(x0, x1, (k + .5) / n) + (RR() - .5) * r * .6, yy0 = y + (RR() - .5) * r * .3;
      const dark = RR() < .3 ? '#160a07' : '#0c0504', hat = RR() / hats;
      // their own groove: a phase, how keen they are, and a bounce once a beat
      const ph = hash(k + dy, 17), keen = .35 + .65 * hash(dy, k + 3);
      const b = Math.max(0, Math.sin((bp + ph * .35) * Math.PI));
      const front = dy >= 500;
      const hop = bop * keen * b * r * (front ? .6 : .22), sway = Math.sin((bp * .5 + ph) * Math.PI) * r * (.05 + bop * .14);
      const hx = x + sway, yy = yy0 - hop, sy = yy0 - hop * .55;
      // only the front rows put their hands up or clap: further back, hands would reach the lyric's band
      const up = bop > .55 && keen > .74 && front ? clamp((bop - .55) / .25) : 0;
      const clap = !up && front && keen > .45 ? clamp((bop - .3) / .2) : 0;
      g.save(); g.fillStyle = dark;
      // hands up, waving on the beat (behind the head, in front of the row behind)
      if (up > 0) for (const d of [-1, 1]) {
        const wave = Math.sin((bp + ph) * Math.PI * 2) * r * .3 * d, hx2 = hx + d * r * 1.25 + wave, hy2 = yy - r * (.95 + .55 * up);
        g.strokeStyle = dark; g.lineWidth = r * .3; g.lineCap = 'round';
        g.beginPath(); g.moveTo(hx + d * r * 1.15, sy + r * 1.1); g.quadraticCurveTo(hx + d * r * 1.6, sy + r * .2, hx2, hy2); g.stroke();
        glove(g, hx2, hy2 - r * .1, -Math.PI / 2 + d * .3 + Math.sin((bp + ph) * Math.PI * 2) * .35, r * .38 * up, 'open', { flip: d < 0, seed: 7900 + k + d, ...CROWD_GLOVE });
      }
      g.beginPath(); g.ellipse(hx, sy + r * 1.45, r * 2.05, r * 1.1, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(hx, yy, r * .92, r * 1.08, 0, 0, TAU); g.fill();
      // hats, and the keenest wave theirs: it lifts off the head on the beat
      const lift = up > 0 && hat < .63 ? b * r * .7 * up : 0, hy = yy - lift;
      if (hat < .33) { g.fillRect(hx - r * .62, hy - r * 2.0, r * 1.24, r * 1.1); g.beginPath(); g.ellipse(hx, hy - r * .9, r * 1.15, r * .22, 0, 0, TAU); g.fill(); }
      else if (hat < .63) { g.beginPath(); g.ellipse(hx, hy - r * .78, r * .82, r * .62, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(hx, hy - r * .72, r * 1.12, r * .2, 0, 0, TAU); g.fill(); }
      else if (hat < .83) { g.beginPath(); g.ellipse(hx - r * .5, yy - r * .9, r * .34, r * .2, -.5, 0, TAU); g.ellipse(hx + r * .5, yy - r * .9, r * .34, r * .2, .5, 0, TAU); g.fill(); }
      else if (hat < 1) { g.beginPath(); g.ellipse(hx + r * .1, yy - r * .95, r * .5, r * .34, .2, 0, TAU); g.fill(); g.beginPath(); g.moveTo(hx + r * .4, yy - r * 1.1); g.quadraticCurveTo(hx + r * 1.1, yy - r * 2.1, hx + r * .3, yy - r * 1.9); g.lineWidth = r * .12; g.strokeStyle = '#0c0504'; g.stroke(); }
      g.restore();
      g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = Math.min(.95, Math.max(.2, .7 - dy / 2600) * (front ? 1 + bop * .6 : 1)); g.strokeStyle = rim; g.lineWidth = Math.max(2.5, r * (front ? .1 + bop * .04 : .1));
      g.beginPath(); g.ellipse(hx, yy, r * .86, r * 1.02, 0, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      g.globalAlpha *= .5; g.beginPath(); g.ellipse(hx, sy + r * 1.45, r * 1.95, r * 1.02, 0, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); g.restore();
      // applause: two white gloves in front of the chest, meeting on the beat
      if (clap > 0) { g.save(); g.globalAlpha *= clap; clapHands(g, hx, sy + r * .95, r, clapAt(bp, ph * .3), 7950 + k); g.restore(); }
    }
  }
}

// The front of the stage seen from the flies, for the overhead shots: the footlights' gold shells
// along its edge (floor y E), throwing light back onto the boards, and beyond them the tops of the
// front stalls' heads and hats, the footlights catching their stage side. Atmosphere under the
// lyric: dark and quiet.
export function stallsAbove(g, w, h, E, o = {}) {
  stallsFloor(g, w, h, E);
  if (o.heads !== false) stallsHeads(g, w, h, E, rng(o.seed ?? 511), 0, null);   // heads: false, and the scene draws them live
}
// The edge, the footlights and the dark pit, without the heads (for a scene that draws them live).
function stallsFloor(g, w, h, E) {
  const step = 190;
  for (let x = 96; x < w; x += step) light(g, x, E - 24, 150, '#ffd88a', .2, 70);
  wash(g, box(0, E + 14, w, h - E - 14), '#1a0c07', { seed: 512, grad: [[0, '#3a1c10'], [.25, '#1e0e08'], [1, '#0c0504']], gran: .5, rim: 0, blooms: 6, amt: 0 });
  ao(g, 0, E + 14, w, E + 14, 50, .5);
  wash(g, box(0, E - 4, w, 20), '#5a3418', { seed: 513, gran: .4, rim: .3, blooms: 2, amt: .3, grad: [[0, '#8a5a30'], [1, '#3a2010']] });
  for (let x = 96; x < w; x += step) {
    const P = []; for (let q = 0; q <= 10; q++) { const a = q / 10 * Math.PI; P.push([x + Math.cos(a) * 40, E + 4 + Math.sin(a) * 26]); }
    wash(g, P, '#d9a83c', { seed: 514 + x, gran: .3, rim: .4, ink: 2, inkCol: '#5a3a0c', radial: [x, E + 2, 4, 40, [[0, '#ffe7a0'], [1, '#a8741a']]] });
    light(g, x, E - 2, 44, '#fff2c0', .5, 14);
  }
}
// The stalls' heads from the flies, live: o.bop (0..1) as for audienceLive. From above a bounce shows as
// a head swelling toward the camera, and the keenest show their hands either side of their hats.
export function stallsAboveLive(g, w, h, E, t, o = {}) { stallsHeads(g, w, h, E, rng(o.seed ?? 511), clamp(o.bop ?? .15), beatPos(t)); }
function stallsHeads(g, w, h, E, R, bop, bp) {
  for (let row = 0; row < Math.ceil((h - E - 120) / 170) + 1; row++) {
    const y = E + 120 + row * 170, n = Math.ceil(w / 150);
    for (let k = 0; k < n; k++) {
      const x = (k + .5) * (w / n) + (row % 2 ? 40 : -20) + (R() - .5) * 50, yy = y + (R() - .5) * 30, r0 = 52 + R() * 10, hat = R();
      const ph = hash(k + row * 31, 23), keen = .35 + .65 * hash(row, k + 7), b = bp == null ? 0 : Math.max(0, Math.sin((bp + ph * .35) * Math.PI));
      const r = r0 * (1 + bop * keen * b * .12);
      // from above, applause is two white gloves either side of the head, meeting on the beat in front of
      // it (toward the stage, up the frame)
      const hands = bp != null && keen > .6 ? clamp((bop - .35) / .2) : 0;
      g.fillStyle = '#0c0504'; g.beginPath(); g.ellipse(x, yy + r * .2, r * 1.7, r * .8, 0, 0, TAU); g.fill();
      g.fillStyle = R() < .3 ? '#1a0d08' : '#120806';
      let rx, ry;
      if (hat < .35) { // a boater: the flat brim and the crown's band
        [rx, ry] = [r * 1.15, r * 1.05]; g.beginPath(); g.ellipse(x, yy, rx, ry, 0, 0, TAU); g.fill();
        g.strokeStyle = '#2a1a0e'; g.lineWidth = 5; g.beginPath(); g.ellipse(x, yy, r * .62, r * .58, 0, 0, TAU); g.stroke();
      } else if (hat < .65) { // a bowler: the dome inside a narrow brim
        [rx, ry] = [r * .98, r * .9]; g.beginPath(); g.ellipse(x, yy, rx, ry, 0, 0, TAU); g.fill();
        g.fillStyle = '#1e100a'; g.beginPath(); g.ellipse(x, yy - r * .04, r * .7, r * .64, 0, 0, TAU); g.fill();
      } else { // a bare head and its ears
        [rx, ry] = [r * .74, r * .86]; g.beginPath(); g.ellipse(x, yy, rx, ry, 0, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(x - rx * .98, yy + r * .1, r * .16, r * .26, 0, 0, TAU); g.ellipse(x + rx * .98, yy + r * .1, r * .16, r * .26, 0, 0, TAU); g.fill();
      }
      g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = Math.max(.12, .55 - row * .09) * (1 + bop * .5); g.strokeStyle = '#f6c070'; g.lineWidth = 4 + bop * 2;
      g.beginPath(); g.ellipse(x, yy, rx * .97, ry * .97, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.restore();
      if (hands > 0) { g.save(); g.globalAlpha *= hands; clapHands(g, x, yy - r * 1.05, r * 1.1, clapAt(bp, ph * .3), 7980 + k + row * 13); g.restore(); }
    }
  }
}

// ---------------------------------------------------------------- the workshop
// Clawd's workshop at night: a long bench under a green-shaded lamp, a round window on the moonlit
// town, a pegboard of tools, shelves of toys. The bench's front edge is the floor line.
export const WS = { w: 1400, h: 2400, floor: 1350, cx: 700 };
export function workshop() {
  return bake('workshop', WS.w, WS.h, (g, w, h) => {
    const F = WS.floor, cx = WS.cx;
    // the back wall: warm planks
    planks(g, 0, 0, w, F - 70, '#7c4a2a', 101, { bw: 118 });
    // a dado rail
    wash(g, box(0, 1040, w, 24), '#5e3418', { seed: 102, gran: .4, rim: .3, blooms: 3, ink: 1.6, inkA: .4 });
    ao(g, 0, 1064, w, 1064, 26, .3);
    // the round window on the town
    const wx = 330, wy = 760, wr = 186;
    g.save(); g.beginPath(); g.arc(wx, wy, wr, 0, TAU); g.clip();
    wash(g, box(wx - wr, wy - wr, wr * 2, wr * 2), '#1d3354', { seed: 110, grad: [[0, '#0e1a33'], [.55, '#23406a'], [1, '#41648f']], gran: .6, rim: 0, blooms: 10, amt: 0 });
    const R = rng(111);
    for (let i = 0; i < 46; i++) { g.fillStyle = rgba('#fff3cf', .4 + R() * .6); g.beginPath(); g.arc(wx - wr + R() * wr * 2, wy - wr + R() * wr * 1.1, .7 + R() * 1.7, 0, TAU); g.fill(); }
    light(g, wx + 70, wy - 90, 130, '#fff0c0', .3);
    wash(g, ellipse(wx + 70, wy - 90, 40, 40, 0, 40), '#f6ebc6', { seed: 112, gran: .4, rim: .3, blooms: 3 });
    wash(g, ellipse(wx + 84, wy - 98, 34, 36, 0, 40), '#20385e', { seed: 113, gran: .3, rim: 0, blooms: 0, amt: .5 });
    nightTown(g, wx - wr, wx + wr, wy + 30, 120);
    g.restore();
    // the window's frame, cross and sill
    const ring = (r0, r1) => { const P = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; P.push([wx + Math.cos(a) * r1, wy + Math.sin(a) * r1]); } for (let i = 64; i >= 0; i--) { const a = i / 64 * TAU; P.push([wx + Math.cos(a) * r0, wy + Math.sin(a) * r0]); } return P; };
    shadow(g, ring(wr + 10, wr + 52).map(([x, y]) => [x + 10, y + 14]), .4, 12);
    wash(g, ring(wr - 2, wr + 40), '#6a3a1c', { seed: 140, gran: .5, rim: .4, blooms: 4, amt: .4, ink: 2.2, grad: [[0, '#8a5230'], [1, '#4a260f']], dir: [[wx - wr, wy - wr], [wx + wr, wy + wr]] });
    wash(g, box(wx - 8, wy - wr, 16, wr * 2), '#5e3418', { seed: 141, gran: .4, rim: .3, blooms: 1, amt: .3 });
    wash(g, box(wx - wr, wy - 8, wr * 2, 16), '#5e3418', { seed: 142, gran: .4, rim: .3, blooms: 1, amt: .3 });
    light(g, wx + 40, wy - 60, 240, '#9fb8d8', .12);

    // shelves of toys, high on the left and right
    const shelf = (x0, x1, y, seed) => {
      shadow(g, box(x0 + 10, y + 26, x1 - x0, 34), .4, 14);
      wash(g, box(x0, y, x1 - x0, 24), '#6a3a1c', { seed, gran: .5, rim: .4, blooms: 2, amt: .5, ink: 2 });
      for (const bx of [x0 + 30, x1 - 44]) wash(g, [[bx, y + 24], [bx + 14, y + 24], [bx + 14, y + 74], [bx, y + 52]], '#5a3018', { seed: seed + bx, gran: .4, rim: .3, blooms: 1, amt: .3 });
    };
    const SY = 470;
    shelf(-10, 450, SY, 150); shelf(950, w + 10, SY, 160);
    const toy = {
      drum: (x, y) => { wash(g, box(x - 46, y - 70, 92, 70), '#b0402e', { seed: 170, gran: .4, rim: .4, blooms: 2, ink: 2, grad: [[0, '#c85a40'], [1, '#8a2c1e']], dir: [[x - 46, 0], [x + 46, 0]] }); wash(g, ellipse(x, y - 70, 46, 12, 0, 30), '#e8d9b0', { seed: 171, gran: .3, rim: .3, ink: 2 }); for (let i = 0; i < 4; i++) inkLine(g, [[x - 46 + i * 30, y - 66], [x - 30 + i * 30, y - 6]], { w: 2, seed: 172 + i, col: '#e8d9b0' }); },
      top: (x, y) => { wash(g, [[x, y], [x - 40, y - 46], [x, y - 72], [x + 40, y - 46]], '#2f7f86', { seed: 175, gran: .4, rim: .4, blooms: 2, ink: 2 }); wash(g, box(x - 40, y - 50, 80, 8), '#e6b84a', { seed: 176, gran: .3, rim: .2, amt: .3 }); inkLine(g, [[x, y - 72], [x, y - 92]], { w: 4, col: '#3a2010', a: .9 }); },
      ball: (x, y) => { wash(g, ellipse(x, y - 34, 34, 34, 0, 40), '#d8b04a', { seed: 177, gran: .4, rim: .4, blooms: 2, ink: 2 }); wash(g, [[x - 34, y - 34], [x, y - 68], [x + 2, y - 34], [x, y]], '#c24a3a', { seed: 178, gran: .3, rim: .2, amt: .3 }); },
      train: (x, y) => { wash(g, box(x - 70, y - 46, 110, 40), '#356a8a', { seed: 180, gran: .4, rim: .4, blooms: 2, ink: 2 }); wash(g, box(x + 10, y - 86, 34, 44), '#356a8a', { seed: 181, gran: .4, rim: .4, ink: 2 }); wash(g, box(x - 60, y - 70, 18, 26), '#2a2a2a', { seed: 182, gran: .3, rim: .3, ink: 2 }); for (const k of [-50, -10, 26]) wash(g, ellipse(x + k, y - 6, 13, 13, 0, 24), '#2a2a2a', { seed: 183 + k, gran: .3, rim: .3, ink: 2 }); },
      soldier: (x, y) => { wash(g, box(x - 14, y - 88, 28, 60), '#b0402e', { seed: 186, gran: .4, rim: .4, ink: 2 }); wash(g, box(x - 12, y - 122, 24, 34), '#2a2a2a', { seed: 187, gran: .3, rim: .3, ink: 2 }); wash(g, ellipse(x, y - 94, 11, 11, 0, 20), '#efc9a0', { seed: 188, gran: .2, rim: .2, ink: 1.6 }); wash(g, box(x - 12, y - 30, 10, 30), '#2a2a50', { seed: 189, gran: .3, rim: .2, ink: 1.6 }); wash(g, box(x + 2, y - 30, 10, 30), '#2a2a50', { seed: 190, gran: .3, rim: .2, ink: 1.6 }); },
      boat: (x, y) => { wash(g, [[x - 50, y - 30], [x + 50, y - 30], [x + 34, y], [x - 34, y]], '#8a4a26', { seed: 192, gran: .4, rim: .4, ink: 2 }); wash(g, [[x, y - 30], [x, y - 130], [x + 46, y - 40]], '#efe2c0', { seed: 193, gran: .3, rim: .3, ink: 2 }); inkLine(g, [[x, y - 30], [x, y - 134]], { w: 3, seed: 194 }); },
      bear: (x, y) => { for (const [ex, ey, r] of [[-26, -112, 14], [26, -112, 14]]) wash(g, ellipse(x + ex, y + ey, r, r, 0, 20), '#a8703c', { seed: 195 + ex, gran: .4, rim: .4, ink: 1.8 }); wash(g, ellipse(x, y - 40, 40, 42, 0, 34), '#a8703c', { seed: 197, gran: .4, rim: .4, ink: 2 }); wash(g, ellipse(x, y - 96, 32, 30, 0, 30), '#b47c44', { seed: 198, gran: .4, rim: .4, ink: 2 }); wash(g, ellipse(x, y - 88, 12, 9, 0, 16), '#e8c896', { seed: 199, gran: .2, rim: .2, ink: 1.4 }); },
    };
    toy.drum(90, SY); toy.top(205, SY); toy.boat(330, SY);
    toy.train(1060, SY); toy.bear(1185, SY); toy.soldier(1290, SY);

    // the pegboard of tools on the right
    const px0 = 920, py0 = 640, pw = 400, ph = 360;
    shadow(g, box(px0 + 14, py0 + 16, pw, ph), .45, 16);
    wash(g, box(px0, py0, pw, ph), '#b48a5a', { seed: 200, gran: .6, rim: .5, blooms: 8, amt: .8, ink: 2.4 });
    g.save(); g.fillStyle = rgba('#3a2010', .45);
    for (let yy = py0 + 24; yy < py0 + ph - 10; yy += 34) for (let xx = px0 + 22; xx < px0 + pw - 10; xx += 34) { g.beginPath(); g.arc(xx, yy, 3.6, 0, TAU); g.fill(); }
    g.restore();
    const steel = '#7d8a8c', handle = '#8c3a26';
    const tool = (P, col, seed) => { shadow(g, P.map(([x, y]) => [x + 6, y + 8]), .35, 5); wash(g, P, col, { seed, gran: .3, rim: .4, ink: 2, blooms: 1 }); };
    tool(box(px0 + 60, py0 + 70, 22, 220), steel, 210); tool(ellipse(px0 + 71, py0 + 66, 30, 30, 0, 30), steel, 211); wash(g, box(px0 + 62, py0 + 34, 18, 30), '#b48a5a', { seed: 212, gran: .2, rim: 0, amt: 0, blooms: 0 });
    tool(box(px0 + 150, py0 + 76, 20, 220), handle, 213); tool(box(px0 + 116, py0 + 58, 88, 36), '#5d6668', 214);
    tool([[px0 + 250, py0 + 60], [px0 + 380, py0 + 60], [px0 + 380, py0 + 130], [px0 + 250, py0 + 100]], '#a9b2b0', 215); tool(box(px0 + 228, py0 + 50, 34, 60), handle, 216);
    for (let i = 0; i < 4; i++) { const x = px0 + 236 + i * 36; tool(box(x, py0 + 180, 14, 80), ['#d0a03c', '#2f7f86', '#b0402e', '#d0a03c'][i], 217 + i); wash(g, box(x + 5, py0 + 260, 4, 66), steel, { seed: 221 + i, gran: .2, rim: .2, ink: 1.4 }); }

    // the lamp's cord
    inkLine(g, [[cx, 0], [cx, 330]], { w: 5, a: .9, gap: 0 });
    // the light: a cone from the shade, warming the wall, pooling on the bench
    g.save(); g.globalCompositeOperation = 'screen';
    const cone = g.createLinearGradient(0, 430, 0, F);
    cone.addColorStop(0, rgba('#ffd590', .3)); cone.addColorStop(1, rgba('#ffcf80', .08));
    g.fillStyle = cone; g.filter = 'blur(30px)'; g.beginPath(); g.moveTo(cx - 150, 450); g.lineTo(cx + 150, 450); g.lineTo(cx + 600, F); g.lineTo(cx - 600, F); g.closePath(); g.fill();
    g.restore();
    // darkness gathering in the corners and up under the ceiling, cool in the shadows
    gloom(g, w, F, cx, 860, 180, 980, '#120814', .9);
    g.save(); g.globalCompositeOperation = 'multiply'; const cool = g.createRadialGradient(cx, 860, 300, cx, 860, 1100); cool.addColorStop(0, 'rgba(255,255,255,1)'); cool.addColorStop(1, 'rgba(150,140,190,1)'); g.fillStyle = cool; g.fillRect(0, 0, w, F); g.restore();
    light(g, cx, 760, 420, '#ffc070', .3);
    light(g, cx, F - 80, 600, '#ffd08a', .4, 200);

    // the lamp: a green enamel shade, its cream inside, the bulb
    const lx = cx, ly = 380;
    wash(g, [[lx - 20, ly - 66], [lx + 20, ly - 66], [lx + 26, ly - 38], [lx - 26, ly - 38]], '#3a3a36', { seed: 230, gran: .3, rim: .3, ink: 2.4 });
    wash(g, spline([[lx - 165, ly + 70], [lx - 120, ly - 10], [lx - 40, ly - 48], [lx + 40, ly - 48], [lx + 120, ly - 10], [lx + 165, ly + 70]], false, 6).concat([[lx + 165, ly + 76], [lx - 165, ly + 76]]), '#2f6b4a', { seed: 231, grad: [[0, '#5a9a74'], [.45, '#2f6b4a'], [1, '#183a28']], dir: [[lx - 160, 0], [lx + 160, 0]], gran: .5, rim: .5, blooms: 4, ink: 3 });
    wash(g, ellipse(lx - 70, ly + 6, 28, 12, -.5, 20), '#9fd0b0', { seed: 234, gran: .1, rim: 0, blooms: 0, amt: .3 });
    wash(g, ellipse(lx, ly + 74, 165, 22, 0, 50), '#f7e6b8', { seed: 232, gran: .2, rim: .2, blooms: 2, ink: 2.4 });
    light(g, lx, ly + 84, 120, '#fff2c8', .9, 50);
    wash(g, ellipse(lx, ly + 86, 34, 24, 0, 30), '#fffbe8', { seed: 233, gran: 0, rim: 0, blooms: 0 });
    light(g, lx, ly + 90, 70, '#ffffff', .75);

    // the bench: its top in the light, its front in shadow (the lyric's apron)
    const top0 = F - 78;
    wash(g, box(0, top0, w, 80), '#b98250', { seed: 240, grad: [[0, '#7a4a28'], [1, '#c8925c']], gran: .55, rim: .2, blooms: 10, amt: .6 });
    streaks(g, box(0, top0, w, 80), '#b98250', { seed: 241, ang: 0, len: 260, n: 160, a: .2, w: 1.6 });
    light(g, cx, F - 30, 560, '#ffdca0', .35, 60);
    wash(g, box(0, F - 4, w, 22), '#d7a56c', { seed: 242, gran: .3, rim: .2, blooms: 2, amt: .4, grad: [[0, '#e6b882'], [1, '#a8743e']] });
    // below the bench top, the frame's lower band: the bench's front (drawers and cupboard doors with
    // brass pulls catching the lamp), then the floor in front of it, falling into the dark, with a crate
    // of spare checks and the workshop cat asleep on a cushion. Atmosphere under the lyric, no story.
    const kick = F + 340;
    wash(g, box(0, F + 18, w, kick - F - 18), '#4a2c16', { seed: 243, grad: [[0, '#5a361c'], [.5, '#3a2212'], [1, '#26150a']], gran: .5, rim: 0, blooms: 10, amt: 0 });
    streaks(g, box(0, F + 18, w, kick - F - 18), '#3a2212', { seed: 244, ang: Math.PI / 2, len: 200, n: 160, a: .1, w: 2 });
    ao(g, 0, F + 18, w, F + 18, 60, .5);
    // three drawers, then two cupboard doors, each panel inked and lit along its top
    for (let k = 0; k < 4; k++) {
      const dx = 30 + k * 340, dy = F + 52;
      wash(g, box(dx, dy, 310, 110), '#56331a', { seed: 245 + k, gran: .45, rim: .4, blooms: 2, amt: .5, ink: 1.8, inkA: .5, grad: [[0, '#6a4222'], [1, '#3e2410']] });
      inkLine(g, [[dx + 6, dy + 3], [dx + 304, dy + 3]], { w: 2.5, col: '#c8925c', a: .5, gap: 0 });
      wash(g, ellipse(dx + 155, dy + 58, 22, 8, 0, 20), '#8a6420', { seed: 249 + k, gran: .2, rim: .3, ink: 1.4, grad: [[0, '#b8913e'], [1, '#5a3c0a']] });
      light(g, dx + 155, dy + 50, 30, '#ffd890', .12);
    }
    for (let k = 0; k < 2; k++) {
      const dx = 60 + k * 650, dy = F + 190;
      wash(g, box(dx, dy, 600, 130), '#4a2a14', { seed: 253 + k, gran: .45, rim: .4, blooms: 2, amt: .5, ink: 1.8, inkA: .45, grad: [[0, '#56331a'], [1, '#2e1a0c']] });
      inkLine(g, [[dx + 300, dy + 6], [dx + 300, dy + 124]], { w: 2, a: .5, gap: 0 });
      for (const hx of [dx + 284, dx + 316]) wash(g, box(hx - 5, dy + 50, 10, 30), '#b58a3a', { seed: 255 + hx, gran: .2, rim: .3, ink: 1.2 });
    }
    // the kick, and the floor beyond it in the dark: boards running to the camera
    wash(g, box(0, kick, w, 26), '#1e1108', { seed: 257, gran: .3, rim: .2, amt: .3 });
    wash(g, box(0, kick + 26, w, h - kick - 26), '#2a170b', { seed: 258, grad: [[0, '#3a2210'], [.4, '#22130a'], [1, '#0e0703']], gran: .55, rim: 0, blooms: 8, amt: 0 });
    for (let k = -8; k <= 8; k++) inkLine(g, [[cx + k * 90, kick + 26], [cx + k * 210, h]], { w: 2, col: '#120a04', a: .55, gap: 0, seed: 259 + k });
    // a crate of spare checks, left: tin heads and a green flag or two showing over its edge
    { const x = 260, y = kick + 330;
      shadow(g, box(x - 170, y - 10, 340, 40), .5, 14);
      for (let k = 0; k < 4; k++) { const hx = x - 105 + k * 70, hy = y - 196 + (k % 2) * 12; wash(g, box(hx - 26, hy, 52, 46), '#8a979a', { seed: 260 + k, gran: .3, rim: .4, ink: 1.6, grad: [[0, '#aab6b8'], [1, '#5c6668']] }); for (const d of [-1, 1]) wash(g, ellipse(hx + d * 10, hy + 18, 4, 5, 0, 10), '#1c1410', { seed: 264 + k + d, gran: 0, rim: 0, amt: 0 }); }
      for (const fx of [x - 60, x + 70]) { inkLine(g, [[fx, y - 170], [fx + 6, y - 250]], { w: 3, a: .9, gap: 0 }); wash(g, [[fx + 6, y - 250], [fx + 52, y - 238], [fx + 8, y - 222]], '#4a8a3a', { seed: 266 + fx, gran: .3, rim: .3, ink: 1.4 }); }
      wash(g, box(x - 160, y - 160, 320, 160), '#6a4222', { seed: 268, gran: .5, rim: .4, blooms: 2, ink: 2, grad: [[0, '#7a4e28'], [1, '#3a2210']] });
      for (const yy of [y - 110, y - 56]) inkLine(g, [[x - 156, yy], [x + 156, yy]], { w: 2.5, col: '#2a1608', a: .7, gap: 0 });
      light(g, x, y - 200, 110, '#ffcf88', .18);
    }
    // the cat, asleep on a cushion, right: a curl of dark fur, one ear, the tail over its nose
    { const x = 1080, y = kick + 380;
      shadow(g, ellipse(x, y + 26, 190, 30, 0, 30), .5, 14);
      wash(g, ellipse(x, y, 190, 60, 0, 40), '#7a2a2a', { seed: 270, gran: .4, rim: .4, blooms: 2, ink: 2, grad: [[0, '#9a3a34'], [1, '#4a1616']] });
      wash(g, ellipse(x - 10, y - 66, 130, 70, 0, 40), '#2a2420', { seed: 271, gran: .4, rim: .3, blooms: 2, ink: 2, grad: [[0, '#3c342e'], [1, '#18120e']] });
      wash(g, ellipse(x - 116, y - 92, 46, 38, 0, 30), '#2a2420', { seed: 272, gran: .3, rim: .3, ink: 2 });
      wash(g, [[x - 146, y - 116], [x - 136, y - 154], [x - 112, y - 124]], '#2a2420', { seed: 273, gran: .3, rim: .3, ink: 1.6 });
      inkLine(g, [[x + 100, y - 70], [x + 40, y - 30], [x - 70, y - 40], [x - 104, y - 74]], { w: 14, col: '#2a2420', a: 1, gap: 0, seed: 274 });
      inkLine(g, [[x - 132, y - 92], [x - 118, y - 88]], { w: 2.5, col: '#c8b090', a: .8, gap: 0 });
      light(g, x - 40, y - 110, 120, '#ffcf88', .14);
    }
    // wood shavings curled on the boards
    { const RR = rng(275); for (let k = 0; k < 14; k++) { const x = 120 + RR() * 1160, y = kick + 120 + RR() * 420, r = 10 + RR() * 14; inkLine(g, [[x - r, y], [x - r * .3, y - r * .7], [x + r * .5, y - r * .2], [x + r * .2, y + r * .4]], { w: 3, col: '#c8925c', a: .55, gap: 0, seed: 276 + k }); } }
    // clutter at the bench's ends: a jar of brushes, paint pots, a vice
    const bx = 120, by = top0 + 30;
    shadow(g, box(bx - 34, by - 6, 280, 20), .4, 8);
    wash(g, box(bx - 40, by - 110, 80, 110), '#9cb0a6', { seed: 260, gran: .3, rim: .4, blooms: 2, ink: 2, grad: [[0, '#b8cbc1'], [1, '#6f847a']], dir: [[bx - 40, 0], [bx + 40, 0]] });
    for (let i = 0; i < 5; i++) { const x = bx - 28 + i * 14; inkLine(g, [[x, by - 100], [x - 6 + i * 3, by - 210]], { w: 6, col: '#7a4a24', a: .9, gap: 0 }); wash(g, ellipse(x - 6 + i * 3, by - 214, 7, 16, .1, 16), ['#c24a3a', '#e6b84a', '#2f7f86', '#efe2c0', '#7a4a8a'][i], { seed: 261 + i, gran: .2, rim: .3, ink: 1.6 }); }
    for (const [x, c] of [[250, '#c24a3a'], [320, '#2f7f86']]) { wash(g, box(x - 32, by - 62, 64, 62), '#c9c2b0', { seed: 270 + x, gran: .3, rim: .4, ink: 2, grad: [[0, '#ddd6c4'], [1, '#9a9282']], dir: [[x - 32, 0], [x + 32, 0]] }); wash(g, ellipse(x, by - 62, 32, 9, 0, 26), c, { seed: 271 + x, gran: .2, rim: .3, ink: 1.8 }); }
    const vx = 1230;
    shadow(g, box(vx - 110, by - 6, 260, 20), .4, 8);
    wash(g, box(vx - 70, by - 120, 140, 90), '#4c5a5a', { seed: 280, gran: .4, rim: .4, blooms: 3, ink: 2.4, grad: [[0, '#6c7a7a'], [1, '#34403f']], dir: [[0, by - 120], [0, by - 30]] });
    wash(g, box(vx - 110, by - 92, 40, 30), '#4c5a5a', { seed: 281, gran: .3, rim: .3, ink: 2 });
    inkLine(g, [[vx + 70, by - 70], [vx + 140, by - 70]], { w: 8, col: '#3a4444', a: 1, gap: 0 });
    paper(g, w, h, .45);
  });
}

// ---------------------------------------------------------------- the theatre
// A vaudeville stage: a carved gold proscenium with a shell at its crown, red velvet swags and side
// curtains, a painted sunburst backdrop with clouds, three tiers of risers for the chorus of
// checks, a plank stage, shell footlights along its front edge (the floor line), and the dark
// orchestra pit below for the lyric. TH.tiers are the risers' standing lines, back to front.
export const TH = { w: 1700, h: 2700, floor: 1650, cx: 850, tiers: [1190, 1310, 1430], stage: [1470, 1650], open: [190, 1510, 250] };
function sunburst(g, cx, cy, n, r, cols, rot = 0) {
  for (let i = 0; i < n; i++) {
    const a0 = rot + i / n * TAU, a1 = rot + (i + 1) / n * TAU;
    g.fillStyle = C(cols[i % cols.length]);
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r); g.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r); g.closePath(); g.fill();
  }
}
// Velvet: a curtain's folds as vertical bands of light and shadow, in a deep red.
function velvet(g, P, x0, x1, seed, o = {}) {
  const b = { x0, x1 };
  wash(g, P, '#8e1c1c', { seed, gran: .5, rim: .3, blooms: 6, amt: .4 });
  g.save(); path(g, P); g.clip();
  const n = Math.round((x1 - x0) / (o.fold ?? 70));
  for (let i = 0; i <= n; i++) {
    const x = lerp(x0, x1, i / n), w2 = (x1 - x0) / n;
    const gr = g.createLinearGradient(x - w2 / 2, 0, x + w2 / 2, 0);
    gr.addColorStop(0, 'rgba(40,0,6,.55)'); gr.addColorStop(.35, 'rgba(255,120,110,.18)'); gr.addColorStop(.55, 'rgba(255,150,130,.24)'); gr.addColorStop(1, 'rgba(40,0,6,.55)');
    g.fillStyle = gr; g.fillRect(x - w2 / 2, -10, w2, 4000);
  }
  g.restore();
}
function goldFrame(g, P, seed) {
  wash(g, P, '#c9962e', { seed, gran: .45, rim: .5, blooms: 6, amt: .3, ink: 2.4, inkCol: '#5a3a0c', grad: [[0, '#f0cf6a'], [.5, '#c9962e'], [1, '#8a5f12']] });
}
export function theatre(o = {}) {
  return bake('theatre' + (o.closed ? 'c' : '') + (o.live ? 'L' : ''), TH.w, TH.h, (g, w, h) => {
    const F = TH.floor, cx = TH.cx, [ox0, ox1, oy] = TH.open;
    // the backdrop: a sunburst over painted clouds
    g.save(); g.beginPath(); g.rect(ox0, oy, ox1 - ox0, F - oy); g.clip();
    wash(g, box(ox0, oy, ox1 - ox0, F - oy), '#e9c98a', { seed: 301, gran: .5, rim: 0, blooms: 20, amt: 0 });
    sunburst(g, cx, 1060, 36, 1400, ['#f1d796', '#e4b36a'], .02);
    g.save(); g.globalAlpha = .55; wash(g, box(ox0, oy, ox1 - ox0, F - oy), '#f2d79a', { seed: 302, gran: .7, rim: 0, blooms: 30, amt: 0, bloom: 2 }); g.restore();
    light(g, cx, 1060, 520, '#fff2c8', .6);
    wash(g, ellipse(cx, 1060, 150, 150, 0, 60), '#f6dd92', { seed: 303, gran: .4, rim: .4, blooms: 6, radial: [cx, 1040, 20, 150, [[0, '#fff3c2'], [1, '#f0c868']]] });
    // painted clouds along the bottom of the backdrop
    const R = rng(304);
    for (let i = 0; i < 9; i++) { const x = lerp(ox0 - 60, ox1 + 60, i / 8), y = 1120 + R() * 40, s = lerp(.8, 1.3, R()); const P = []; for (let k = 0; k <= 9; k++) { const a = Math.PI + k / 9 * Math.PI; P.push([x + Math.cos(a) * 150 * s, y + Math.sin(a) * (k % 2 ? 70 : 100) * s]); } P.push([x + 150 * s, y + 80], [x - 150 * s, y + 80]); wash(g, spline(P, true, 4), '#f7ecd2', { seed: 305 + i, gran: .4, rim: .35, blooms: 4, amt: 1.5, grad: [[0, '#fff8e6'], [1, '#e8cfa4']] }); }
    gloom(g, w, F, cx, 1000, 300, 900, '#3a0a10', .55);
    // the risers: three tiers, red-carpeted fronts, gold edging
    TH.tiers.forEach((ty, i) => {
      const inset = (2 - i) * 70, x0 = ox0 + 40 + inset, x1 = ox1 - 40 - inset;
      shadow(g, box(x0, ty - 10, x1 - x0, 30), .45, 10);
      wash(g, box(x0, ty, x1 - x0, 34), '#d9b26a', { seed: 310 + i, gran: .4, rim: .3, blooms: 3, amt: .4, grad: [[0, '#f0d08a'], [1, '#b8893e']] });
      wash(g, box(x0, ty + 34, x1 - x0, 86), '#7a1a22', { seed: 313 + i, gran: .5, rim: .3, blooms: 4, amt: .4, grad: [[0, '#9a2a2e'], [1, '#4e0e14']] });
      inkLine(g, [[x0, ty + 34], [x1, ty + 34]], { w: 2.4, a: .6 });
    });
    // the stage floor: planks running back to the backdrop, lit warm
    const [s0, s1] = TH.stage;
    wash(g, [[ox0 - 20, s0], [ox1 + 20, s0], [w, F], [0, F]], '#b07a46', { seed: 320, gran: .55, rim: .2, blooms: 16, amt: 0, grad: [[0, '#8a5a30'], [1, '#c98e52']] });
    for (let i = -12; i <= 12; i++) inkLine(g, [[cx + i * 52, s0], [cx + i * 120, F]], { w: 2, a: .35, gap: 0, seed: 321 + i });
    for (const yy of [1520, 1580]) inkLine(g, [[0, yy], [w, yy]], { w: 1.6, a: .25, gap: .3 });
    g.restore();
    // side curtains (tormentors), gathered and tied back with gold rope
    for (const d of [-1, 1]) {
      const xa = d < 0 ? ox0 - 40 : ox1 + 40, xb = d < 0 ? ox0 + 190 : ox1 - 190;
      const P = d < 0 ? [[xa, oy - 40], [xb, oy - 40], [xb - 30, 900], [xa + 70, 1140], [xb - 40, 1400], [xb, F + 10], [xa, F + 10]] : [[xb, oy - 40], [xa, oy - 40], [xa, F + 10], [xb, F + 10], [xb + 40, 1400], [xa - 70, 1140], [xb + 30, 900]];
      velvet(g, spline(P, true, 4), Math.min(xa, xb) - 40, Math.max(xa, xb) + 40, 330 + d, { fold: 55 });
      const ry = 1140; wash(g, ellipse(d < 0 ? xa + 74 : xa - 74, ry, 22, 34, 0, 24), '#e2b84c', { seed: 333 + d, gran: .3, rim: .4, ink: 2 });
      inkLine(g, [[d < 0 ? xa + 74 : xa - 74, ry + 30], [d < 0 ? xa + 86 : xa - 86, ry + 140]], { w: 6, col: '#c99a3a', a: 1, gap: 0 });
    }
    // the valance: swags of red velvet with gold fringe across the top
    for (let i = 0; i < 5; i++) {
      const x0 = lerp(ox0 - 60, ox1 + 60, i / 5), x1 = lerp(ox0 - 60, ox1 + 60, (i + 1) / 5), mx = (x0 + x1) / 2;
      const P = spline([[x0, oy - 60], [x1, oy - 60], [x1, oy + 20], [mx, oy + 120], [x0, oy + 20]], true, 6);
      velvet(g, P, x0, x1, 340 + i, { fold: 48 });
      for (let k = 0; k <= 16; k++) { const u = k / 16, fx = lerp(x0, x1, u), fy = oy + 20 + Math.sin(u * Math.PI) * 100; inkLine(g, [[fx, fy], [fx, fy + 26]], { w: 4, col: '#d8a83a', a: 1, gap: 0 }); }
    }
    // the proscenium: carved gold, a shell at its crown
    const pw = 70;
    goldFrame(g, box(0, 0, w, oy - 60), 350);
    goldFrame(g, box(0, 0, ox0 - 40, F + 10), 351);
    goldFrame(g, box(ox1 + 40, 0, w - ox1 - 40, F + 10), 352);
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; g.fillStyle = '#5a3008'; g.fillRect(0, 0, w, oy - 60); g.fillRect(0, 0, ox0 - 40, F); g.fillRect(ox1 + 40, 0, w - ox1 - 40, F); g.restore();
    // carving: scrolls and flutes, painted in light and shade
    for (const d of [-1, 1]) for (let k = 0; k < 9; k++) { const x = d < 0 ? (ox0 - 40) / 2 : ox1 + 40 + (w - ox1 - 40) / 2, y = 300 + k * 150; wash(g, ellipse(x, y, 52, 60, 0, 30), '#d9a83c', { seed: 360 + k + d * 20, gran: .3, rim: .5, ink: 2, inkCol: '#5a3a0c', radial: [x - 14, y - 18, 4, 64, [[0, '#ffe7a0'], [1, '#9a6a18']]] }); }
    const shx = cx, shy = 120;
    const shell = []; for (let k = 0; k <= 14; k++) { const a = Math.PI + k / 14 * Math.PI; shell.push([shx + Math.cos(a) * 170, shy + 40 + Math.sin(a) * 150 * (k % 2 ? .86 : 1)]); }
    wash(g, shell, '#e6b84a', { seed: 370, gran: .3, rim: .5, ink: 2.6, inkCol: '#5a3a0c', radial: [shx, shy, 10, 190, [[0, '#ffe9a6'], [1, '#a8741a']]] });
    for (let k = 1; k < 14; k += 2) { const a = Math.PI + k / 14 * Math.PI; inkLine(g, [[shx, shy + 40], [shx + Math.cos(a) * 150, shy + 40 + Math.sin(a) * 130]], { w: 2.4, col: '#7a5010', a: .6 }); }
    // footlights: shells along the stage's front edge, glowing up
    wash(g, box(0, F - 6, w, 26), '#5a3418', { seed: 380, gran: .4, rim: .3, blooms: 2, amt: .3, grad: [[0, '#8a5a30'], [1, '#3a2010']] });
    for (let k = 0; k < 9; k++) {
      const x = lerp(ox0 + 40, ox1 - 40, k / 8), y = F;
      light(g, x, y - 30, 170, '#ffd88a', .38, 120);
      const P = []; for (let q = 0; q <= 10; q++) { const a = Math.PI + q / 10 * Math.PI; P.push([x + Math.cos(a) * 46, y + Math.sin(a) * 40]); }
      wash(g, P, '#e2b04a', { seed: 381 + k, gran: .3, rim: .4, ink: 2, inkCol: '#5a3a0c', radial: [x, y - 10, 4, 46, [[0, '#fff2c0'], [1, '#c58a24']]] });
    }
    // the stalls: the audience in silhouette, row on row down to the camera, the stage's warm light
    // spilling over them and catching the tops of heads and hats. Atmosphere for the frame's lower
    // band, under the lyric: dark, quiet, no story.
    wash(g, box(0, F + 20, w, h - F - 20), '#3a1c10', { seed: 390, grad: [[0, '#8a4a26'], [.22, '#5a2c18'], [.6, '#2a140c'], [1, '#140905']], gran: .5, rim: 0, blooms: 10, amt: 0 });
    light(g, cx, F + 60, 900, '#ffb870', .35, 300);
    ao(g, 0, F + 20, w, F + 20, 60, .45);
    if (!o.live) audience(g, F, w, { seed: 395 });   // live: the scene draws audienceLive() over it
    paper(g, w, h, .4);
  });
}
// The main curtain, closed: drawn live so it can rise. Covers the proscenium opening from y0 down.
export function mainCurtain(g, lift = 0, t = 0) {
  const [ox0, ox1, oy] = TH.open, F = TH.floor, y1 = lerp(F + 10, oy - 80, lift);
  if (y1 <= oy - 70) return;
  g.save(); g.beginPath(); g.rect(ox0 - 40, oy - 60, ox1 - ox0 + 80, y1 - oy + 60); g.clip();
  const c = bake('curtain', ox1 - ox0 + 80, F - oy + 120, (cg, cw, ch) => {
    velvet(cg, box(0, 0, cw, ch), 0, cw, 395, { fold: 64 });
    // a gold fringe at the hem
    for (let k = 0; k <= 70; k++) inkLine(cg, [[k / 70 * cw, ch - 40], [k / 70 * cw, ch - 6]], { w: 5, col: '#d8a83a', a: 1, gap: 0 });
    wash(cg, box(0, ch - 52, cw, 16), '#c9962e', { seed: 396, gran: .3, rim: .3, amt: .3 });
    paper(cg, cw, ch, .35);
  });
  // the hem sways a little as it rises
  g.drawImage(c, ox0 - 40, y1 - (F - oy + 120) + 10);
  g.restore();
}

// ---------------------------------------------------------------- the workshop's door
// The other wall of the workshop: planks, a heavy door frame, and beyond it (once the door bursts
// open) a blaze of light. The door itself is drawn live. DOOR.open is the doorway's box.
export const DOOR = { w: 1400, h: 2400, floor: 1350, cx: 700, open: [470, 520, 460, 830] };
export function workshopDoor() {
  return bake('door', DOOR.w, DOOR.h, (g, w, h) => {
    const F = DOOR.floor, [dx, dy, dw, dh] = DOOR.open;
    planks(g, 0, 0, w, F, '#6e4024', 151, { bw: 120 });
    // the light beyond the doorway
    wash(g, box(dx, dy, dw, dh), '#fff2cc', { seed: 152, gran: .2, rim: 0, blooms: 4, amt: 0, radial: [dx + dw / 2, dy + dh * .6, 20, dh * .8, [[0, '#ffffff'], [.5, '#fff0c0'], [1, '#f2c878']]] });
    // the frame
    for (const P of [box(dx - 60, dy - 60, dw + 120, 60), box(dx - 60, dy, 60, dh), box(dx + dw, dy, 60, dh)]) wash(g, P, '#4a2a14', { seed: 153 + P[0][0], gran: .5, rim: .4, blooms: 3, ink: 2.4, grad: [[0, '#6a3e20'], [1, '#3a1e0c']] });
    gloom(g, w, F, dx + dw / 2, dy + dh * .6, 300, 1000, '#120804', .88);
    // the floor and the apron
    wash(g, box(0, F, w, h - F), '#2a1810', { seed: 154, grad: [[0, '#4a2c18'], [.25, '#24140a'], [1, '#100804']], gran: .5, rim: 0, blooms: 8, amt: 0 });
    for (let k = 0; k < 12; k++) inkLine(g, [[w / 2 + (k - 6) * 70, F], [w / 2 + (k - 6) * 240, h]], { w: 2, a: .25, gap: 0 });
    ao(g, 0, F, w, F, 60, .5);
    // the frame's lower band: a braided rag rug before the door, shavings on the boards, all in the dark
    { const rx = dx + dw / 2, ry = F + 300;
      shadow(g, ellipse(rx + 10, ry + 16, 440, 120, 0, 60), .45, 16);
      for (let k = 0; k < 6; k++) wash(g, ellipse(rx, ry, 430 - k * 62, 116 - k * 17, 0, 60), ['#3e1c16', '#4a3a24', '#2c2430', '#46221a', '#4a422c', '#361814'][k], { seed: 156 + k, gran: .5, rim: .4, blooms: 2, ink: 1.4, inkA: .3 });   // worn and dark: it sits under the hook line
      g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = .72; g.fillStyle = '#2a1408'; g.beginPath(); g.ellipse(rx, ry, 440, 122, 0, 0, TAU); g.fill(); g.restore();   // dim: it sits under the lyric
      const RR = rng(162); for (let k = 0; k < 10; k++) { const x = 160 + RR() * 1080, y = F + 520 + RR() * 400, r = 10 + RR() * 12; inkLine(g, [[x - r, y], [x - r * .3, y - r * .7], [x + r * .5, y - r * .2], [x + r * .2, y + r * .4]], { w: 3, col: '#a8743e', a: .45, gap: 0, seed: 163 + k }); }
    }
    paper(g, w, h, .4);
  });
}
// The door: a slab of planks hinged at the doorway's left edge; open 0..1 swings it flat to the wall.
export function door(g, open, t = 0) {
  const [dx, dy, dw, dh] = DOOR.open;
  const k = Math.cos(open * Math.PI * .5), w2 = dw * k;
  if (w2 < 4) return;
  const skew = (1 - k) * 60;
  const P = [[dx, dy], [dx + w2, dy + skew], [dx + w2, dy + dh - skew * .4], [dx, dy + dh]];
  wash(g, P, '#7a4a28', { seed: 160, gran: .5, rim: .4, blooms: 3, ink: 2.6, grad: [[0, '#8a5a32'], [1, '#5a3218']], dir: [[dx, 0], [dx + w2, 0]], amt: .4 });
  for (let i = 1; i < 4; i++) inkLine(g, [[dx + w2 * i / 4, dy + skew * i / 4 + 10], [dx + w2 * i / 4, dy + dh - skew * .4 * i / 4 - 10]], { w: 2, a: .5, gap: 0 });
  wash(g, ellipse(dx + w2 * .85, dy + dh * .52 + skew * .5, 14 * k + 4, 16, 0, 20), '#d9a83c', { seed: 161, gran: .2, rim: .3, ink: 2 });
}
