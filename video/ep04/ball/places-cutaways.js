// The three cutaways in verse 1, each with its own light: the circus ring under a spotlight, the
// schoolroom in window light, and the factory in a furnace's glow. Each keeps the film's grammar: a
// floor line that the camera puts at screen y 1100; below it, the frame's lower band is filled with
// what's nearest the camera (the circus crowd, the backs of the pupils' desks, the near conveyor),
// dark and quiet under the lyric.
import { W, H, TAU, clamp, lerp, rng, noise, hash, mix, rgba } from './kit.js';
import { C } from './palette.js';
import { bake, wash, glaze, light, gloom, shadow, streaks, dabs, inkLine, paper, ao, path, box } from './bg.js';
import { ellipse, spline, rrect } from './ink.js';
import { audience } from './places.js';

// ---------------------------------------------------------------- the circus ring
export const CIRCUS = { w: 1500, h: 2500, floor: 1500, cx: 750 };
// the crowd round the ring: drawn by the bake, or live by the scene
export const CIRCUS_CROWD = { seed: 445, rim: '#ffd9a0', rows: [[150, 44, 24], [330, 62, 17], [560, 84, 12], [860, 108, 9]], hats: .7 };
export function circus(o = {}) {
  return bake('circus' + (o.live ? 'L' : ''), CIRCUS.w, CIRCUS.h, (g, w, h) => {
    const F = CIRCUS.floor, cx = CIRCUS.cx;
    // the big top's canvas: red and cream panels converging on the king pole above the frame
    const apex = [cx, -500];
    for (let i = 0; i < 26; i++) {
      const a0 = Math.PI * .08 + i / 26 * Math.PI * .84, a1 = Math.PI * .08 + (i + 1) / 26 * Math.PI * .84;
      const P = [apex, [apex[0] + Math.cos(a0) * 3400, apex[1] + Math.sin(a0) * 3400], [apex[0] + Math.cos(a1) * 3400, apex[1] + Math.sin(a1) * 3400]];
      wash(g, P, i % 2 ? '#a8302c' : '#eadbb8', { seed: 401 + i, gran: .5, rim: .25, blooms: 10, amt: 0 });
    }
    // the stands, dark tiers of a crowd in silhouette
    for (let r = 0; r < 4; r++) {
      const y = F - 330 + r * 70, R = rng(410 + r);
      wash(g, box(0, y, w, 80), mix('#2a1418', '#000000', r * .1), { seed: 411 + r, gran: .4, rim: .2, blooms: 4, amt: 0 });
      for (let x = 10; x < w; x += 46 + R() * 14) { const hr = 18 + R() * 6; wash(g, ellipse(x, y - 4, hr, hr * 1.1, 0, 18), '#1c0c10', { seed: 412 + x + r, gran: .2, rim: 0, blooms: 0, amt: .5 }); }
    }
    // a band of bunting above the stands
    for (let k = 0; k < 18; k++) { const x = k / 17 * w, y = F - 420 + Math.sin(k / 17 * Math.PI) * 60; wash(g, [[x - 26, y], [x + 26, y], [x, y + 50]], ['#e2b84c', '#2f8f88', '#c24a3a'][k % 3], { seed: 420 + k, gran: .3, rim: .3, amt: .4, ink: 1.6 }); }
    // the ring: sawdust, a painted curb
    wash(g, ellipse(cx, F + 40, 900, 210, 0, 80), '#d6b07a', { seed: 430, gran: .6, rim: .2, blooms: 20, amt: 0, grad: [[0, '#c8a066'], [1, '#e8c890']] });
    const curb = ellipse(cx, F + 40, 900, 210, 0, 90).concat(ellipse(cx, F + 40, 840, 180, 0, 90).reverse());
    wash(g, curb, '#b8322e', { seed: 431, gran: .4, rim: .3, amt: 0 });
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; wash(g, ellipse(cx + Math.cos(a) * 870, F + 40 + Math.sin(a) * 195, 10, 6, 0, 12), '#f2e2b0', { seed: 432 + i, gran: 0, rim: 0, amt: 0 }); }
    // darkness all round, the ring lit
    gloom(g, w, h, cx, F - 200, 260, 1100, '#14060a', .92);
    // the apron: the ring's near side falling quickly into dark
    g.save(); g.globalCompositeOperation = 'multiply'; const ap = g.createLinearGradient(0, F + 10, 0, F + 140); ap.addColorStop(0, 'rgba(255,255,255,1)'); ap.addColorStop(1, 'rgba(40,20,22,1)'); g.fillStyle = ap; g.fillRect(0, F + 10, w, 140); g.fillStyle = 'rgb(40,20,22)'; g.fillRect(0, F + 150, w, h); g.restore();
    wash(g, box(0, F + 150, w, h - F - 150), '#2a140e', { seed: 440, grad: [[0, '#4a2418'], [.35, '#2a120c'], [1, '#0e0504']], gran: .4, rim: 0, blooms: 6, amt: 0 });
    // the crowd's front rows, heads and hats against the ring's light, and three balloons on strings
    if (!o.live) audience(g, F + 60, w, CIRCUS_CROWD);   // live: the scene draws audienceLive() over it
    // (low in the crowd and dim, well below the lyric and out of its way)
    for (const [bx, by, col] of [[150, F + 560, '#a8302c'], [1330, F + 520, '#2f8f88'], [1220, F + 640, '#d8a83a']]) {
      inkLine(g, [[bx, by + 70], [bx + 14, by + 420]], { w: 2.5, col: '#0c0504', a: .9, gap: 0 });
      wash(g, ellipse(bx, by, 52, 64, 0, 30), mix(col, '#140806', .7), { seed: 446 + bx, gran: .3, rim: .4, ink: 1.8, inkCol: '#0c0504' });
      g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .3; g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.ellipse(bx, by, 48, 60, 0, Math.PI * 1.1, Math.PI * 1.7); g.stroke(); g.restore();
    }
    paper(g, w, h, .4);
  });
}
// The spotlight on the ring, drawn live so it can follow.
export function ringSpot(g, x, y, r, a = .55) {
  g.save(); g.globalCompositeOperation = 'screen';
  const cone = g.createLinearGradient(0, y - 1500, 0, y);
  cone.addColorStop(0, 'rgba(255,244,214,.02)'); cone.addColorStop(1, `rgba(255,240,205,${a * .5})`);
  g.fillStyle = cone; g.beginPath(); g.moveTo(x - r * .12, y - 1500); g.lineTo(x + r * .12, y - 1500); g.lineTo(x + r, y); g.lineTo(x - r, y); g.closePath(); g.fill();
  const pool = g.createRadialGradient(x, y, 10, x, y, r);
  pool.addColorStop(0, `rgba(255,240,205,${a})`); pool.addColorStop(1, 'rgba(255,240,205,0)');
  g.fillStyle = pool; g.save(); g.translate(x, y); g.scale(1, .26); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.restore();
  g.restore();
}

// ---------------------------------------------------------------- the schoolroom
export const SCHOOL = { w: 1500, h: 2500, floor: 1450, cx: 750 };
export function schoolroom() {
  return bake('school', SCHOOL.w, SCHOOL.h, (g, w, h) => {
    const F = SCHOOL.floor, cx = SCHOOL.cx;
    // a sage plaster wall, a dado of boards
    wash(g, box(0, 0, w, F), '#a9b48a', { seed: 501, gran: .55, rim: 0, blooms: 30, amt: 0, grad: [[0, '#7e8a62'], [1, '#bcc69c']] });
    dabs(g, box(0, 0, w, F), ['#8a9670', '#c8d0a8'], { seed: 502, n: 500, r: 14, a: .12 });
    wash(g, box(0, F - 300, w, 300), '#8a5a32', { seed: 503, gran: .5, rim: .3, blooms: 8, amt: 0, grad: [[0, '#9a6a3a'], [1, '#6a4020']] });
    for (let x = 0; x < w; x += 70) inkLine(g, [[x, F - 300], [x, F]], { w: 2, a: .35, gap: 0 });
    // the blackboard (only chalk pictures on it: a star, a sum's shape, a smiling sun)
    const bx0 = 260, by0 = 420, bw = 980, bh = 520;
    shadow(g, box(bx0 + 14, by0 + 18, bw, bh), .45, 14);
    wash(g, box(bx0 - 26, by0 - 26, bw + 52, bh + 52), '#8a5a32', { seed: 510, gran: .5, rim: .4, blooms: 4, ink: 2.4 });
    wash(g, box(bx0, by0, bw, bh), '#2e4a3c', { seed: 511, gran: .6, rim: .2, blooms: 30, bloom: 1.5, amt: 0 });
    g.save(); g.strokeStyle = 'rgba(240,236,220,.55)'; g.lineWidth = 5; g.lineCap = 'round';
    const star = (x, y, r) => { g.beginPath(); for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? r * .45 : r; i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.stroke(); };
    star(bx0 + 170, by0 + 170, 90);
    g.beginPath(); g.arc(bx0 + 780, by0 + 160, 60, 0, TAU); g.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.moveTo(bx0 + 780 + Math.cos(a) * 80, by0 + 160 + Math.sin(a) * 80); g.lineTo(bx0 + 780 + Math.cos(a) * 110, by0 + 160 + Math.sin(a) * 110); g.stroke(); }
    // ticks in rows, as if marked work
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { const x = bx0 + 360 + k * 70, y = by0 + 300 + r * 60; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14, y + 16); g.lineTo(x + 40, y - 18); g.stroke(); }
    g.restore();
    wash(g, box(bx0 - 30, by0 + bh + 20, bw + 60, 22), '#6a4020', { seed: 512, gran: .4, rim: .3, ink: 1.6 });
    // a tall window on the left, its light falling across the room
    const wx = 40, wy = 300;
    wash(g, box(wx, wy, 180, 520), '#e8f0d8', { seed: 520, gran: .3, rim: .3, blooms: 6, grad: [[0, '#f6f8e8'], [1, '#c8d8b8']] });
    for (const [a, b] of [[[wx + 90, wy], [wx + 90, wy + 520]], [[wx, wy + 260], [wx + 180, wy + 260]]]) inkLine(g, [a, b], { w: 10, col: '#6a4020', a: 1, gap: 0 });
    g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .25; g.fillStyle = '#fff4d0'; g.filter = 'blur(20px)';
    g.beginPath(); g.moveTo(wx + 180, wy); g.lineTo(wx + 180, wy + 520); g.lineTo(cx + 500, F + 100); g.lineTo(cx + 200, F - 200); g.closePath(); g.fill(); g.restore();
    // a globe on a cupboard at the right
    wash(g, box(1290, F - 360, 180, 360), '#7a4a26', { seed: 530, gran: .5, rim: .4, ink: 2 });
    wash(g, ellipse(1380, F - 450, 70, 70, 0, 40), '#5a8aa8', { seed: 531, gran: .4, rim: .4, ink: 2, radial: [1360, F - 470, 6, 80, [[0, '#9cc8e0'], [1, '#3a6a88']]] });
    dabs(g, ellipse(1380, F - 450, 66, 66, 0, 40), ['#8aa86a', '#6a8a4a'], { seed: 532, n: 30, r: 12, a: .7 });
    gloom(g, w, F, cx, F - 500, 300, 1100, '#1a1408', .7);
    // the floor and the apron: boards falling into shadow
    wash(g, box(0, F, w, h - F), '#5a3a20', { seed: 540, grad: [[0, '#6a4428'], [.25, '#3a2414'], [1, '#140a04']], gran: .5, rim: 0, blooms: 10, amt: 0 });
    for (let k = 0; k < 14; k++) inkLine(g, [[cx + (k - 7) * 60, F], [cx + (k - 7) * 260, h]], { w: 2, a: .25, gap: 0 });
    ao(g, 0, F, w, F, 50, .5);
    // nearest the camera: the backs of the front row's desks and their pupils' heads (ears and all),
    // in silhouette against the window light
    { const kids = [[500, 'pig'], [770, 'bunny'], [1040, 'pup']];
      for (const [x, kind] of kids) {
        const y = F + 330, r = 72;
        g.save(); g.fillStyle = '#140c06';
        g.beginPath(); g.ellipse(x, y + r * 1.5, r * 2.0, r * 1.1, 0, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(x, y, r * .95, r * 1.0, 0, 0, TAU); g.fill();
        if (kind === 'bunny') for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * r * .35, y - r * 1.35, r * .22, r * .7, d * .15, 0, TAU); g.fill(); }
        if (kind === 'pup') for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * r * .95, y + r * .1, r * .3, r * .62, d * -.3, 0, TAU); g.fill(); }
        if (kind === 'pig') for (const d of [-1, 1]) { g.beginPath(); g.moveTo(x + d * r * .3, y - r * .8); g.lineTo(x + d * r * .8, y - r * 1.25); g.lineTo(x + d * r * .85, y - r * .55); g.closePath(); g.fill(); }
        g.restore();
        g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .55; g.strokeStyle = '#f2e6b8'; g.lineWidth = 7; g.beginPath(); g.ellipse(x, y, r * .9, r * .95, 0, Math.PI * 1.1, Math.PI * 1.7); g.stroke(); g.restore();
      }
      // the desks' backs: lids and an inkwell's glint
      for (const x of [500, 770, 1040]) { wash(g, box(x - 130, F + 500, 260, 80), '#4a2c16', { seed: 545 + x, gran: .5, rim: .4, ink: 2, inkCol: '#140a04', grad: [[0, '#5a3a20'], [1, '#2a1a0c']] }); wash(g, ellipse(x + 80, F + 500, 20, 9, 0, 16), '#2a3a5a', { seed: 547 + x, gran: .2, rim: .3, ink: 1.4 }); }
    }
    paper(g, w, h, .4);
  });
}

// ---------------------------------------------------------------- the factory
export const FACTORY = { w: 1500, h: 2500, floor: 1450, cx: 750 };
export function factory() {
  return bake('factory', FACTORY.w, FACTORY.h, (g, w, h) => {
    const F = FACTORY.floor, cx = FACTORY.cx;
    // soot-dark brick, a furnace glow from below right
    wash(g, box(0, 0, w, F), '#5a2a1e', { seed: 601, gran: .6, rim: 0, blooms: 30, amt: 0 });
    const R = rng(602);
    for (let y = 0; y < F; y += 54) for (let x = ((y / 54) % 2) * 60 - 60; x < w; x += 120) wash(g, box(x + 4, y + 4, 112, 46), mix('#6e3424', R() < .5 ? '#c07050' : '#200a06', R() * .2), { seed: 603 + x + y * 3, gran: .4, rim: .3, blooms: 1, amt: .5, ink: 1.2, inkA: .25 });
    // pipes and a gauge
    for (const x of [140, 1360]) { wash(g, box(x - 30, 0, 60, F), '#4c5452', { seed: 610 + x, gran: .4, rim: .4, blooms: 4, ink: 2, grad: [[0, '#6c7472'], [.5, '#4c5452'], [1, '#2c3230']], dir: [[x - 30, 0], [x + 30, 0]] }); for (let y = 200; y < F; y += 320) wash(g, box(x - 40, y, 80, 26), '#3a403e', { seed: 611 + x + y, gran: .3, rim: .3, ink: 1.6 }); }
    wash(g, box(140, 300, 1220, 50), '#4c5452', { seed: 615, gran: .4, rim: .4, ink: 2, grad: [[0, '#6c7472'], [1, '#2c3230']] });
    // a furnace mouth at the right, chains hanging, gauges on the wall
    const fx = 1180, fy = F - 420;
    wash(g, box(fx - 150, fy - 40, 300, 460), '#3a2a26', { seed: 630, gran: .5, rim: .4, blooms: 6, ink: 2.4, grad: [[0, '#4a3a34'], [1, '#2a1c18']] });
    wash(g, (() => { const P = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; P.push([fx + Math.cos(a) * 100, fy + 210 + Math.sin(a) * 110]); } P.push([fx + 100, fy + 330], [fx - 100, fy + 330]); return P; })(), '#ff9a3a', { seed: 631, gran: .3, rim: .3, ink: 2, radial: [fx, fy + 260, 10, 160, [[0, '#fff2b0'], [.5, '#ffb050'], [1, '#c8501c']]] });
    light(g, fx, fy + 250, 380, '#ff9040', .55);
    for (const [x0, len] of [[420, 520], [520, 380], [980, 600]]) { for (let y = 0; y < len; y += 26) wash(g, ellipse(x0 + (Math.floor(y / 26) % 2) * 3, y + 13, 9, 14, 0, 14), '#3a3a38', { seed: 640 + x0 + y, gran: .2, rim: .3, amt: .3, ink: 1.4 }); wash(g, box(x0 - 18, len, 36, 30), '#2a2a28', { seed: 645 + x0, gran: .3, rim: .3, ink: 1.6 }); }
    for (const [gx, gy] of [[300, 720], [1040, 690]]) { wash(g, ellipse(gx, gy, 46, 46, 0, 30), '#d9a83c', { seed: 650 + gx, gran: .3, rim: .4, ink: 2 }); wash(g, ellipse(gx, gy, 34, 34, 0, 30), '#f2e8d0', { seed: 651 + gx, gran: .2, rim: .2 }); inkLine(g, [[gx, gy], [gx + 20, gy - 18]], { w: 4, col: '#c0392b', a: 1, gap: 0 }); }
    // the furnace's glow and the steam
    light(g, cx + 400, F - 100, 700, '#ff8a3a', .35);
    light(g, cx, F - 500, 600, '#ffb060', .22);
    gloom(g, w, F, cx, F - 450, 260, 1100, '#0a0404', .9);
    // the floor: iron plates; the apron below the conveyor
    wash(g, box(0, F, w, h - F), '#1c1412', { seed: 620, grad: [[0, '#2c2220'], [.3, '#140e0c'], [1, '#080505']], gran: .5, rim: 0, blooms: 8, amt: 0 });
    for (let x = 0; x < w; x += 160) inkLine(g, [[x, F], [x, h]], { w: 2, a: .25, gap: 0 });
    // nearest the camera: a second conveyor running across the frame, its rollers and belt in the
    // furnace's glow, carrying a file of star-shaped checks in silhouette; crates of them below
    { const by = F + 300;
      wash(g, box(-20, by, w + 40, 70), '#2a2220', { seed: 621, gran: .4, rim: .3, ink: 2, inkCol: '#080505', grad: [[0, '#3c3230'], [1, '#141010']] });
      for (let x = 30; x < w; x += 120) { wash(g, ellipse(x, by + 82, 26, 26, 0, 20), '#3a3030', { seed: 622 + x, gran: .3, rim: .3, ink: 1.8, inkCol: '#080505' }); }
      g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .4; g.strokeStyle = '#ff8a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(-20, by + 3); g.lineTo(w + 20, by + 3); g.stroke(); g.restore();
      for (let k = 0; k < 6; k++) { const x = 120 + k * 250, y = by - 70, P = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, r = i % 2 ? 26 : 62; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } wash(g, P, '#1a1412', { seed: 630 + k, gran: .3, rim: .2, ink: 2, inkCol: '#080505' }); g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .45; g.strokeStyle = '#ffb060'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < 4; i++) g.lineTo(P[i][0], P[i][1]); g.stroke(); g.restore(); }
      for (const cx2 of [260, 1250]) { wash(g, box(cx2 - 170, by + 300, 340, 220), '#2a1c14', { seed: 640 + cx2, gran: .5, rim: .4, ink: 2, inkCol: '#080505', grad: [[0, '#3a281c'], [1, '#140c08']] }); for (const yy of [by + 370, by + 440]) inkLine(g, [[cx2 - 166, yy], [cx2 + 166, yy]], { w: 2.5, col: '#0a0605', a: .8, gap: 0 }); }
    }
    paper(g, w, h, .35);
  });
}
