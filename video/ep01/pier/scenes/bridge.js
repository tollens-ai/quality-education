// The bridge: where Clawd learned. A sky whose stars are everyone's code; a wall people throw
// their code over without looking; Clawd climbing up to look, and finding everyone there.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rrange, noise1, noise2, rr, circle, ellipse, line, poly, star, heart, glow, bulb, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, ballistic } from '../kit.js';
import { nightSky, sea, reflection, lighthouse, town, moon, ferrisWheel } from '../world.js';
import { clawd, person } from '../cast.js';
import { blinkAt } from '../band.js';
import { PEOPLE, HUT_COLS } from './huts.js';

// What the internet taught: fragments of code and comment, as stars.
const FRAGS = [
  '// TODO: fix later', 'it works on my machine', "git commit -m 'stuff'", 'catch (e) {}', 'SELECT * FROM users',
  'if (true) {', 'rm -rf node_modules', "// don't touch this", 'final_final_v2.js', 'console.log("here")',
  'npm install', 'lgtm', '#include <stdio.h>', 'def main():', '</div></div></div>', 'why does this work??',
  '+1', 'thanks, fixed it', 'wontfix', 'x = x + 1', '// magic number', 'sleep(1000)', 'print(debug)',
  'return null;', 'TODO: tests', '!important', 'try again later', '// hack', 'for (i = 0; ...', 'segfault',
  'works now', 'copy of copy', 'v2_new_REAL', 'import *', 'eval(input)', '// temporary', 'hotfix', 'yolo',
  'ship it', 'it compiles', 'ok', 'retry()', 'assert True', 'goto fail', 'TODO', 'FIXME', '???', 'legacy',
];

// The code sky: n text-stars, a river of them across the middle, twinkling. flow 0..1 draws
// light down toward (fx, fy).
function codeSky(g, t, hz, o = {}) {
  g.fillStyle = vgrad(g, 0, hz, [[0, '#02021a'], [.45, '#0a0a36'], [.8, '#1e1456'], [1, '#3a2266']]);
  g.fillRect(0, 0, W, hz + 2);
  // The Milky Way: layered clouds of colour along a diagonal.
  const band = (a, col, w, h, alpha) => {
    g.save(); g.translate(540, hz * .46); g.rotate(-.62 + a);
    g.fillStyle = rgrad(g, 0, 0, 0, w, [[0, rgba(col, alpha)], [.5, rgba(col, alpha * .35)], [1, rgba(col, 0)]]);
    g.scale(1, h); circle(g, 0, 0, w); g.fill();
    g.restore();
  };
  g.save(); g.globalCompositeOperation = 'lighter';
  band(0, '#6a4aff', 1300, .24, .38);
  band(.05, '#2fb0ff', 900, .12, .22);
  band(-.04, '#ff4fa3', 700, .1, .16);
  band(.02, '#ffd9a0', 420, .08, .22);
  for (let i = 0; i < 40; i++) {
    const p = rnd(i, 715) * 2 - 1;
    const cx = 540 + p * 900 * Math.cos(-.62), cy = hz * .46 + p * 900 * Math.sin(-.62) + (rnd(i, 716) - .5) * 180;
    const r = 60 + 160 * rnd(i, 717);
    g.fillStyle = rgrad(g, cx, cy, 0, r, [[0, rgba(['#7a5aff', '#3fb8ff', '#ff6ab0', '#ffd9a0'][i % 4], .12)], [1, 'rgba(0,0,0,0)']]);
    circle(g, cx, cy, r); g.fill();
  }
  g.restore();
  // Dark dust lanes through the band.
  g.save(); g.translate(540, hz * .46); g.rotate(-.62);
  g.fillStyle = 'rgba(4,2,20,.35)';
  for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse((rnd(i, 718) - .5) * 1400, (rnd(i, 719) - .5) * 60, 160 + 200 * rnd(i, 720), 14 + 12 * rnd(i, 721), (rnd(i, 722) - .5) * .3, 0, TAU); g.fill(); }
  g.restore();
  // Fragments sit one to a cell of a jittered grid, so they read as separate stars; the band
  // is denser and brighter.
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const cw = 150, ch = 46;
  const cols = Math.ceil(W / cw) + 1, rows = Math.ceil(hz / ch);
  for (let i = 0; i < cols * rows; i++) {
    const cx0 = (i % cols) * cw + ((Math.floor(i / cols)) % 2) * cw * .5 - cw * .5, cy0 = Math.floor(i / cols) * ch;
    const bx = cx0 + rnd(i, 701) * cw * .7, by = cy0 + rnd(i, 702) * ch * .6;
    if (by < 14 || by > hz - 24) continue;
    // Distance from the band's centre line.
    const d = Math.abs((by - hz * .46) * Math.cos(-.62) - (bx - 540) * Math.sin(-.62));
    const inBand = Math.exp(-d * d / (2 * 170 * 170));
    if (rnd(i, 703) > .28 + .62 * inBand) continue;
    const bright = Math.pow(rnd(i, 705), 4) * (.4 + .6 * inBand);
    const tw = .55 + .45 * Math.sin(t * (1 + rnd(i, 706) * 3) + i);
    const size = 9 + bright * 17;
    const a = (.16 + .5 * inBand * .5 + .8 * bright) * tw * (o.alpha ?? 1);
    let x = bx, y = by;
    // Drawn down toward Clawd while it's learning.
    const fl = o.flow ? clamp(o.flow * 1.3 - rnd(i, 707) * .3) : 0;
    if (fl > 0 && rnd(i, 708) > .55) {
      const ph = ((t * .35 + rnd(i, 709)) % 1);
      x = lerp(bx, o.fx, ph * ph * fl); y = lerp(by, o.fy, ph * ph * fl);
    }
    const txt = FRAGS[i % FRAGS.length];
    if (bright > .35) glow(g, x, y, size * 3, bright > .7 ? '#fff3d8' : '#bcc6ff', .35 * a);
    g.font = `500 ${size}px Mono`;
    g.fillStyle = rgba(bright > .6 ? '#fff6e0' : '#cfd6ff', a);
    g.fillText(txt, x, y);
  }
  // Plain pinprick stars between.
  for (let i = 0; i < 300; i++) { g.fillStyle = rgba('#e8ecff', .5 * rnd(i, 711) * (.6 + .4 * Math.sin(t * 2 + i))); circle(g, rnd(i, 712) * W, rnd(i, 713) * hz, .8 + rnd(i, 714)); g.fill(); }
  // Learning: threads of light pouring from the sky into Clawd.
  if (o.flow > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) {
      const sx = rnd(i, 731) * W, sy = rnd(i, 732) * hz * .8;
      const ph = (t * (.25 + .2 * rnd(i, 733)) + rnd(i, 734)) % 1;
      const cx = (sx + o.fx) / 2 + (rnd(i, 735) - .5) * 400, cy = Math.min(sy, o.fy) - 200;
      const pt = q => [(1 - q) * (1 - q) * sx + 2 * (1 - q) * q * cx + q * q * o.fx, (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * cy + q * q * o.fy];
      const col = ['#bcc6ff', '#ffd9a0', '#7fe8ff', '#ff9ad0'][i % 4];
      g.strokeStyle = rgba(col, .5 * o.flow); g.lineWidth = 2.2; g.lineCap = 'round';
      g.beginPath();
      for (let k = 0; k <= 8; k++) { const q = Math.max(0, ph - k * .025); const [x, y] = pt(q); k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      const [hx, hy] = pt(ph);
      glow(g, hx, hy, 18, col, .8 * o.flow);
    }
    g.restore();
  }
}

// ---------------------------------------------------------------- 106.2 – 112.3: the training set
export function trainingShot(g, t, c) {
  const K = c.K;
  const hz = 1240;
  const lp = inv(107.1, 111.2, t);
  codeSky(g, t, hz, { flow: smooth(inv(108.2, 110.5, t)), fx: 540, fy: 1500 });
  sea(g, t, hz, { reflections: [{ x: 540, col: '#cfd6ff', w: 60, a: .25 }] });
  // Sky reflected faintly in the calm sea.
  for (let i = 0; i < 70; i++) { const x = rnd(i, 721) * W, y = hz + 20 + rnd(i, 722) * 500; g.fillStyle = rgba('#cfd6ff', .12 * (.5 + .5 * Math.sin(t * 3 + i))); g.fillRect(x - 20, y, 40, 2); }
  // The end of the pier, quiet now.
  g.fillStyle = vgrad(g, 1560, H, [[0, '#2a1a36'], [1, '#0a0610']]);
  poly(g, [[140, 1560], [940, 1560], [1080, H], [0, H]]); g.fill();
  g.fillStyle = '#1a1024'; g.fillRect(140, 1540, 800, 24);
  for (let x = 150; x < 940; x += 50) g.fillRect(x, 1480, 10, 64);
  g.fillRect(140, 1476, 800, 10);
  // Clawd sits on the edge, legs over, looking up; the light of the sky pouring in.
  const up = smooth(inv(106.5, 108, t));
  const learn = smooth(inv(108.4, 110.5, t));
  if (learn > 0) glow(g, 540, 1470, 260 * learn, '#cfd6ff', .45 * learn);
  clawd(g, 540, 1560, { s: 240, look: [0, -1 * up], eyes: learn > .3 ? 'star' : 'open', armL: -.1, armR: -.1, rim: '#cfd6ff', rimSide: 1, shadow: false, blink: blinkAt(t, 6), mouth: clamp(K.vocal(t) * .8) });
}

// ---------------------------------------------------------------- 112.3 – 117.3: over the wall
function wallFace(g, t, top, bottom, o = {}) {
  // Big harbour stones, lamplit from below.
  g.fillStyle = vgrad(g, top, bottom, [[0, '#3a3450'], [1, '#1a1628']]);
  g.fillRect(0, top, W, bottom - top);
  const rows = 7;
  for (let r = 0; r < rows; r++) {
    const y0 = top + (bottom - top) * r / rows, y1 = top + (bottom - top) * (r + 1) / rows;
    const off = (r % 2) * 90;
    for (let x = -off; x < W; x += 180) {
      const shadeV = .08 * (rnd(r * 31 + Math.round(x), 731) - .5);
      g.fillStyle = mix('#2a2440', '#4a4262', .4 + shadeV + (r / rows) * -.2);
      rr(g, x + 3, y0 + 3, 174, y1 - y0 - 6, 10); g.fill();
    }
  }
  g.fillStyle = '#4a4266'; g.fillRect(0, top - 18, W, 22);
  g.fillStyle = rgba('#ffffff', .12); g.fillRect(0, top - 18, W, 4);
}

export function wallShot(g, t, c) {
  const K = c.K;
  // Above the wall: fog, glowing faintly — whatever is over there, nobody's looked.
  g.fillStyle = vgrad(g, 0, 760, [[0, '#0b0b30'], [1, '#3a3060']]);
  g.fillRect(0, 0, W, 760);
  for (let i = 0; i < 14; i++) { const x = ((rnd(i, 741) * 1.4 - .2) * W + t * 12 * (1 + rnd(i, 742))) % (W + 400) - 200; g.fillStyle = rgrad(g, x, 560 + rnd(i, 743) * 200, 0, 300, [[0, 'rgba(200,190,240,.25)'], [1, 'rgba(200,190,240,0)']]); circle(g, x, 560 + rnd(i, 743) * 200, 300); g.fill(); }
  // A moon somewhere behind the fog.
  glow(g, 780, 400, 420, '#d8d0ff', .35);
  g.fillStyle = rgba('#fff4e0', .55); circle(g, 780, 400, 60); g.fill();
  wallFace(g, t, 760, 1500);
  // Lamps along the top of the wall, pooling light down its face.
  for (let i = 0; i < 6; i++) {
    const lx = 90 + i * 180;
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = lgrad(g, 0, 750, 0, 1300, [[0, rgba(C.amber, .3)], [1, rgba(C.amber, 0)]]);
    poly(g, [[lx - 20, 750], [lx + 20, 750], [lx + 120, 1300], [lx - 120, 1300]]); g.fill();
    g.restore();
    g.fillStyle = '#1a1024'; g.fillRect(lx - 4, 690, 8, 60);
    bulb(g, lx, 686, 9, C.bulb, 1);
  }
  // The ground on our side.
  g.fillStyle = vgrad(g, 1500, H, [[0, '#2a1f38'], [1, '#0d0914']]); g.fillRect(0, 1500, W, H - 1500);
  // A line of coders along the wall, backs to us, lit by their screens, throwing planes over.
  const coders = [];
  for (let i = 0; i < 9; i++) coders.push({ x: 60 + i * 120 + (i % 2) * 20, y: 1560 + (i % 3) * 30, s: 70 + (i % 3) * 8, i });
  for (const cd of coders) {
    const ph = ((t * .55 + rnd(cd.i, 751)) % 1);
    const throwing = ph < .25;
    // Screen glow on the wall.
    glow(g, cd.x, cd.y - cd.s * 2.2, cd.s * 3, '#8fb4ff', .25);
    g.fillStyle = '#0f0a18';
    rr(g, cd.x - cd.s * .6, cd.y - cd.s * 2.6, cd.s * 1.2, cd.s * 2.6, cd.s * .4); g.fill();
    circle(g, cd.x, cd.y - cd.s * 3, cd.s * .5); g.fill();
    // Hood.
    g.beginPath(); g.arc(cd.x, cd.y - cd.s * 3, cd.s * .6, Math.PI, 0); g.fill();
    // Throwing arm.
    const a = throwing ? lerp(.4, -2.6, ph / .25) : .4;
    g.strokeStyle = '#0f0a18'; g.lineWidth = cd.s * .3; g.lineCap = 'round';
    line(g, cd.x + cd.s * .4, cd.y - cd.s * 2.2, cd.x + cd.s * .4 + Math.sin(a) * cd.s * 1.2, cd.y - cd.s * 2.2 - Math.cos(a) * cd.s * 1.2); g.stroke();
    // The plane they threw, arcing over the wall and gone into the fog.
    const ft = ((t * .55 + rnd(cd.i, 751)) % 1) * (1 / .55) - .45;
    if (ft > 0 && ft < 1.3) {
      const px = cd.x + ft * 200, py = cd.y - cd.s * 3.2 - ft * 1000 + ft * ft * 300;
      const fade = 1 - smooth(inv(.8, 1.3, ft));
      plane(g, px, py, 34, -.8 + ft * .6, fade);
    }
  }
  // Clawd among them, throwing too.
  const cph = inv(113.7, 114.3, t);
  const tossed = t > 114.2;
  clawd(g, 700, 1760, { s: 220, back: false, look: [.2, -1], eyes: tossed ? 'happy' : 'open', armR: lerp(.2, -2.4, easeOut(cph)), armL: -.2, rim: '#8fb4ff', mouth: clamp(K.vocal(t) * .8), hold: !tossed ? (g2, u) => plane(g2, u * .5, -u * .5, u * 1.6, -.8, 1) : undefined });
  if (tossed) { const ft = (t - 114.2) * .9; plane(g, 760 + ft * 250, 1500 - ft * 900 + ft * ft * 260, 44, -.7 + ft * .5, 1 - smooth(inv(.9, 1.4, ft))); }
}

function plane(g, x, y, s, rot, a = 1) {
  if (a <= 0) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= a;
  glow(g, 0, 0, s * 1.4, '#fff3d8', .25);
  g.fillStyle = '#fbf6ec'; poly(g, [[s, 0], [-s * .8, -s * .55], [-s * .45, 0]]); g.fill();
  g.fillStyle = '#d9d0c0'; poly(g, [[s, 0], [-s * .8, s * .55], [-s * .45, 0]]); g.fill();
  g.strokeStyle = 'rgba(80,70,110,.5)'; g.lineWidth = Math.max(1, s * .04); for (let k = 0; k < 3; k++) line(g, -s * .5 + k * s * .3, -s * .2, -s * .3 + k * s * .3, -s * .2); g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- 117.3 – 123.4: how do you know?
export function climbShot(g, t, c) {
  const K = c.K;
  g.fillStyle = vgrad(g, 0, H, [[0, '#0b0b30'], [1, '#2a2450']]);
  g.fillRect(0, 0, W, H);
  // Close on the wall, a ladder up it; Clawd with a lantern, climbing. The camera rises with
  // it, so the top of the wall (and the light beyond) comes down to meet it.
  const climb = easeInOut(inv(119.4, 123.3, t));
  const rise = climb * 700;
  const top = 260 - 700 + rise;
  g.fillStyle = vgrad(g, 0, Math.max(40, top), [[0, '#1a1a48'], [1, '#7a6aa0']]); g.fillRect(0, 0, W, Math.max(0, top + 20));
  // Light from the far side leaking over the top.
  glow(g, 540, top - 40, 700, '#ffcf8a', .25 + .35 * climb);
  wallFace(g, t, top, H + 800);
  for (let i = 0; i < 10; i++) { g.fillStyle = rgrad(g, rnd(i, 761) * W, top - 60, 0, 220, [[0, 'rgba(220,210,250,.3)'], [1, 'rgba(220,210,250,0)']]); circle(g, rnd(i, 761) * W, top - 60, 220); g.fill(); }
  // Ladder.
  const lx = 540;
  g.strokeStyle = '#8a6a4a'; g.lineWidth = 16;
  line(g, lx - 110, H, lx - 110, top - 60); g.stroke(); line(g, lx + 110, H, lx + 110, top - 60); g.stroke();
  g.lineWidth = 12; for (let y = top + ((H - top) % 110); y < H; y += 110) { line(g, lx - 110, y, lx + 110, y); g.stroke(); }
  // Other people's planes still sailing up past it and over.
  for (let i = 0; i < 6; i++) {
    const ph = ((t * .6 + i / 6) % 1);
    const px = (i % 2 ? 180 : 860) + (i % 3) * 60 + ph * 60, py = H + 60 - ph * (H + 200);
    plane(g, px, py, 40, -1.2 + Math.sin(ph * 6 + i) * .15, 1 - smooth(inv(.8, 1, ph)));
  }
  // Clawd: first puzzling over the plane it unfolded (build? test?), then climbing.
  const cy = lerp(1780, 1380, climb) - Math.abs(Math.sin(t * 6)) * 14 * (climb > 0 && climb < 1 ? 1 : 0);
  const unf = smooth(inv(117.3, 117.9, t));
  const lantern = (g2, u) => {
    g2.strokeStyle = '#3a3040'; g2.lineWidth = u * .2; line(g2, 0, 0, 0, u * 1.2); g2.stroke();
    glow(g2, 0, u * 1.9, u * 4, C.amber, .8);
    g2.fillStyle = '#3a3040'; rr(g2, -u * .6, u * 1.2, u * 1.2, u * .3, u * .1); g2.fill();
    g2.fillStyle = '#ffd98a'; rr(g2, -u * .5, u * 1.5, u * 1, u * 1, u * .3); g2.fill();
  };
  // The unfolded page: a blank plan and a blank checklist.
  if (t < 119.8) {
    const p = unf * (1 - smooth(inv(119.4, 119.8, t)));
    g.save(); g.translate(540, 1160); g.scale(p, p); g.rotate(-.05);
    g.fillStyle = '#fbf6ec'; rr(g, -300, -200, 600, 400, 16); g.fill();
    g.strokeStyle = '#7a8ad0'; g.lineWidth = 4; g.setLineDash([12, 10]); rr(g, -260, -160, 250, 250, 10); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#7a8ad0'; g.font = '800 34px Bricolage'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('build?', -135, 140);
    g.strokeStyle = '#2fbf6f'; g.lineWidth = 5;
    for (let k = 0; k < 4; k++) { rr(g, 40, -150 + k * 60, 40, 40, 6); g.stroke(); g.fillStyle = 'rgba(60,50,80,.2)'; g.fillRect(100, -135 + k * 60, 140, 10); }
    g.fillStyle = '#2fbf6f'; g.fillText('test?', 140, 140);
    g.restore();
  }
  clawd(g, 540, cy, { s: 260, look: t < 119.4 ? [0, .3] : [0, -1], eyes: t < 119.4 ? 'worried' : 'open', armR: -1.4, armL: t < 119.4 ? -.4 : -1.2 + Math.sin(t * 8) * .3, hold: t > 119.4 ? lantern : undefined, rim: C.amber, shadow: false, legs: climb > 0 && climb < 1 ? t * 2 : undefined, mouth: clamp(K.vocal(t) * .8) });
}

// ---------------------------------------------------------------- 123.4 – 128.8: who it's for
export function revealShot(g, t, c) {
  const K = c.K;
  const clear = smooth(inv(124.2, 127.6, t));
  // Beyond the wall: the town at night, the huts, the people — once the fog lifts.
  const hz = 760;
  nightSky(g, t, { horizon: hz, moon: { x: 900, y: 520, r: 44 }, glowCol: '#ff9a6a' });
  town(g, t, hz, { on: 1 });
  sea(g, t, hz, { reflections: [{ x: 850, col: C.moon, w: 28, a: .45 }] });
  lighthouse(g, t, 120, hz + 10, 260, { beamA: t * .8 + 1.4, beamLen: 1100 });
  // The beach and its huts, far below and lit up.
  g.fillStyle = vgrad(g, hz + 120, 1500, [[0, '#6a4a5a'], [1, '#2a1f38']]); g.fillRect(0, hz + 120, W, 1500 - hz - 120);
  for (let i = 0; i < 8; i++) {
    const x = 90 + i * 128, y = hz + 250, w2 = 100, h2 = 110;
    g.fillStyle = shade(HUT_COLS[i], -.2); g.fillRect(x - w2 / 2, y - h2, w2, h2);
    g.fillStyle = '#2a2038'; poly(g, [[x - w2 * .6, y - h2], [x, y - h2 - 50], [x + w2 * .6, y - h2]]); g.fill();
    glow(g, x, y - h2 * .45, 90, C.amber, .6 * clear);
    g.fillStyle = mix('#1a1020', '#ffcf8a', clear); g.fillRect(x - 32, y - 78, 64, 78);
  }
  // Everyone, holding the planes that landed on them, looking up; warm light finding them.
  const folk = ['demo', 'baker', 'chat1', 'student', 'nana', 'blind', 'chat2', 'chat3'];
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = rgrad(g, 700, 1150, 0, 900 * (.3 + clear * .7), [[0, rgba('#ffcf8a', .45 * clear)], [1, rgba('#ffcf8a', 0)]]);
  g.fillRect(0, 700, W, 900);
  g.restore();
  for (let row = 2; row >= 0; row--) for (let i = 0; i < 7 - row; i++) {
    const k = folk[(i * 3 + row * 5) % folk.length];
    const x = 90 + (i + row * .5) * (900 / (6 - row * .4)), y = 1290 + row * 95;
    const wave = t > 127.2 ? Math.sin(t * 7 + i + row) * .4 : 0;
    const lit = clamp(clear * 1.4 - Math.abs(x - 700) / 1400);
    person(g, x, y, { s: 58 + row * 12, ...PEOPLE[k], look: [(700 - x) / 900, -1], eyes: clear > .75 ? 'happy' : 'open', mouth: clear > .75 ? .5 : 0, armR: clear > .75 ? -2.6 + wave : -.9, shadow: false, hand: (g2, u) => { g2.fillStyle = '#fbf6ec'; poly(g2, [[u * 3, 0], [-u * 2, -u * 1.6], [-u * 1.2, 0]]); g2.fill(); } });
    if (lit > 0) glow(g, x, y - (58 + row * 12) * 1.4, 70 + row * 10, '#ffcf8a', .3 * lit);
  }
  // The fog, lifting from the lantern outward.
  for (let i = 0; i < 18; i++) {
    const fx = rnd(i, 771) * W, fy = hz - 100 + rnd(i, 772) * 900;
    const away = (fx - 540) * .9 * clear;
    g.fillStyle = rgrad(g, fx + away, fy, 0, 360, [[0, `rgba(190,180,230,${.55 * (1 - clear)})`], [1, 'rgba(190,180,230,0)']]);
    circle(g, fx + away, fy, 360); g.fill();
  }
  // The top of the wall in the foreground, Clawd on it from behind, lantern held high.
  g.fillStyle = vgrad(g, 1560, H, [[0, '#4a4266'], [1, '#1a1628']]); g.fillRect(0, 1560, W, H - 1560);
  g.fillStyle = rgba('#ffffff', .12); g.fillRect(0, 1560, W, 5);
  const raise = easeOutBack(inv(123.4, 124.4, t), 1.5);
  glow(g, 700, 1180, 520 * (.4 + clear * .6), C.amber, .55);
  clawd(g, 540, 1720, { s: 330, back: true, rim: C.amber, rimSide: 1, armR: lerp(-.2, -1.9, raise), extR: 1.6, armL: -.3, shadow: false, hold: (g2, u) => { g2.save(); g2.rotate(0); g2.strokeStyle = '#3a3040'; g2.lineWidth = u * .2; line(g2, 0, 0, 0, u * 1.2); g2.stroke(); glow(g2, 0, u * 1.9, u * 5, C.amber, .9); g2.fillStyle = '#ffd98a'; rr(g2, -u * .5, u * 1.5, u, u, u * .3); g2.fill(); g2.restore(); } });
}
