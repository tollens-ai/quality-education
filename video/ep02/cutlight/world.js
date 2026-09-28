// The world outside the mirror box: daylight, full colour, the people the band built for. It's
// what shows through every cut. Each place is built from flat planes set at depths behind the
// wall, so it moves with the camera as a real view through a window does; each plane is
// painted in 2D, in centimetres, facing the camera.
import { W, H, clamp, lerp, mix, rgba, hash, noise, easeOut } from './kit.js';
import { ap, project, scaleAt, M, T } from './space.js';
import { person, stranger, SKIN, HAIRC, dim, SHADE } from './people.js';
import { rimmed, layer, put } from './post.js';
import { flat } from './type.js';

// Put the 2D context on a plane at world point p, facing the camera's way (+z), 1 unit = 1 cm,
// y up the plane. Returns the scale (px per cm) there. Exact for planes square to the lens,
// which these are.
export function onPlane(L, c, p) {
  const o = project(c, p), ex = project(c, [p[0] + 100, p[1], p[2]]), ey = project(c, [p[0], p[1] + 100, p[2]]);
  const k = L.getTransform();
  // Keep the layer's own scale (render size) and add the plane's map.
  L.setTransform(k.a, 0, 0, k.d, 0, 0);
  L.transform((ex.x - o.x) / 100, (ex.y - o.y) / 100, (ey.x - o.x) / 100, (ey.y - o.y) / 100, o.x, o.y);
  return o.s;
}
const reset = (L, k) => L.setTransform(k, 0, 0, k, 0, 0);

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

// Buildings in a row, backlit: flat shapes with a warm edge, windows catching the sky.
function terrace(L, c, x0, x1, z, h0, h1, col, seed, k) {
  let x = x0;
  while (x < x1) {
    const w = 260 + hash(x, seed) * 380, h = lerp(h0, h1, hash(x, seed, 2));
    const s = onPlane(L, c, [x, 0, z]);
    L.fillStyle = col; L.fillRect(0, 0, w, h);
    // Roof: a pitch or a flat parapet.
    if (hash(x, seed, 3) > .5) { L.beginPath(); L.moveTo(-10, h); L.lineTo(w / 2, h + 120 + hash(x, seed, 4) * 80); L.lineTo(w + 10, h); L.closePath(); L.fill(); }
    else L.fillRect(-8, h - 10, w + 16, 22);
    // Windows: a grid, some lit gold by the low sun behind.
    for (let wy = 110; wy < h - 60; wy += 150) for (let wx = 40; wx < w - 60; wx += 110) {
      L.fillStyle = hash(wx, wy, x) > .7 ? rgba('#ffd98f', .55) : rgba(mix(col, '#9ec8e8', .3), .6);
      L.fillRect(wx, wy, 52, 80);
    }
    // The warm edge where the sun catches the corner.
    L.fillStyle = rgba('#ffe2a6', .55 * k); L.fillRect(w - 10, 0, 10, h);
    reset(L, L.__k);
    x += w + 12;
  }
}

// ROSA'S BAKERY, 8 a.m. The street runs away from us to a low sun; the shop is on the right with
// its striped awning and its window full of bread; a clock on a post says eight; fifty people
// queue from the door along the pavement towards us. state: 'down' (the checkout's down: a
// spinner on every phone, people fed up), 'load' (the load test: the queue doubled in cyan
// ghosts, all moving), 'fine'.
export const ROSA = { sex: 'f', skin: SKIN[2], hair: { style: 'bun', col: HAIRC.black }, top: { kind: 'apron', col: '#e7e2d6', col2: '#f6f1e6' }, legs: { col: '#2e3446' }, build: 1.02, seed: 11 };
export function bakery(L, c, t, state = 'down', o = {}) {
  L.__k = L.getTransform().a;
  const sp = sky(L, c, t, { sun: [-200, 180, -6000], low: '#ffe0a8', hor: '#ffbf74' });
  // Far terrace, then the street's two sides.
  terrace(L, c, -2600, 2600, -4200, 500, 900, '#8d97b1', 3, .6);
  terrace(L, c, 900, 3600, -2400, 700, 1100, '#6f6f86', 5, .8);
  // The road and pavement: flat bands in perspective.
  const roadPts = [[-4000, 0, -5000], [4000, 0, -5000], [4000, 0, -700], [-4000, 0, -700]].map(p => project(c, p));
  L.fillStyle = '#b89a82'; L.beginPath(); roadPts.forEach((p, i) => i ? L.lineTo(p.x, p.y) : L.moveTo(p.x, p.y)); L.closePath(); L.fill();
  const kerb = [[500, 0, -5000], [560, 0, -5000], [560, 0, -700], [500, 0, -700]].map(p => project(c, p));
  L.fillStyle = '#e8d6bf'; L.beginPath(); kerb.forEach((p, i) => i ? L.lineTo(p.x, p.y) : L.moveTo(p.x, p.y)); L.closePath(); L.fill();
  // The shop front, on the right: a plane at z -1500.
  let s = onPlane(L, c, [640, 0, -1500]);
  L.fillStyle = '#2f5a4f'; L.fillRect(0, 0, 700, 560);            // painted wood, deep green
  L.fillStyle = '#f2c572'; L.fillRect(40, 60, 420, 300);           // the window, lit warm inside
  // Shelves of bread in the window.
  for (let row = 0; row < 3; row++) {
    L.fillStyle = '#8a5a2e'; L.fillRect(40, 90 + row * 95, 420, 8);
    for (let i = 0; i < 7; i++) {
      L.fillStyle = mix('#c98a45', '#a8652c', hash(i, row)); L.beginPath();
      L.ellipse(80 + i * 55, 120 + row * 95, 24, 15 + hash(i, row, 2) * 6, 0, 0, Math.PI * 2); L.fill();
      L.strokeStyle = 'rgba(90,50,20,.6)'; L.lineWidth = 2; L.beginPath(); L.moveTo(66 + i * 55, 118 + row * 95); L.lineTo(94 + i * 55, 126 + row * 95); L.stroke();
    }
  }
  L.fillStyle = '#1f3a33'; L.fillRect(500, 0, 150, 420);             // the door
  L.fillStyle = '#f7d9a0'; L.fillRect(520, 220, 110, 160);
  // Awning: stripes, cream and deep red.
  for (let i = 0; i < 9; i++) { L.fillStyle = i % 2 ? '#f3e8d2' : '#b3402f'; L.beginPath(); L.moveTo(i * 78, 560); L.lineTo((i + 1) * 78, 560); L.lineTo((i + 1) * 78 + 10, 470); L.lineTo(i * 78 + 10, 470); L.closePath(); L.fill(); }
  // The sign: ROSA'S, hand-painted gold on green.
  L.save(); L.scale(1, -1);
  L.fillStyle = '#2f5a4f'; L.fillRect(20, -700, 660, 120);
  L.fillStyle = '#f0d27a'; L.font = '700 96px Hand'; L.textAlign = 'center'; L.fillText("ROSA'S", 350, -610);
  L.font = '500 30px Mono'; L.fillStyle = '#e8dcc0'; L.fillText('BAKERY · EST. 1987', 350, -575);
  L.restore();
  reset(L, L.__k);
  // The clock on its post, on the kerb: eight o'clock.
  s = onPlane(L, c, [380, 0, -1100]);
  L.fillStyle = '#1d2a2a'; L.fillRect(-6, 0, 12, 360);
  L.beginPath(); L.arc(0, 400, 62, 0, Math.PI * 2); L.fillStyle = '#1d2a2a'; L.fill();
  L.beginPath(); L.arc(0, 400, 52, 0, Math.PI * 2); L.fillStyle = '#f7f1e3'; L.fill();
  L.strokeStyle = '#1d2a2a'; L.lineWidth = 3;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; L.beginPath(); L.moveTo(Math.sin(a) * 42, 400 + Math.cos(a) * 42); L.lineTo(Math.sin(a) * 48, 400 + Math.cos(a) * 48); L.stroke(); }
  const hr = (8 + (o.minute || 0) / 60) / 12 * Math.PI * 2, mn = (o.minute || 0) / 60 * Math.PI * 2;
  L.lineWidth = 6; L.beginPath(); L.moveTo(0, 400); L.lineTo(Math.sin(hr) * 28, 400 + Math.cos(hr) * 28); L.stroke();
  L.lineWidth = 4; L.beginPath(); L.moveTo(0, 400); L.lineTo(Math.sin(mn) * 42, 400 + Math.cos(mn) * 42); L.stroke();
  reset(L, L.__k);
  // The queue: out of the door and along the pavement towards us, fifty of them.
  const rim = [{ col: '#ffe6b0', lx: .5, ly: -1, d: 2.4, k: 1 }];
  rimmed(L, 'queue', Q => {
    Q.__k = L.__k;
    const n = o.n ?? 50;
    const people = [];
    for (let i = 0; i < n; i++) {
      const z = -1450 + i * 26 + hash(i, 4) * 8, x = 560 - i * 3.5 + (hash(i, 5) - .5) * 30;
      people.push([z, x, i]);
    }
    people.sort((a, b) => a[0] - b[0]);
    for (const [z, x, i] of people) {
      const p = project(c, [x, 0, z]);
      if (p.z < c.near) continue;
      const sp2 = stranger(i * 13 + 5);
      const h = 170 * sp2.height * p.s;
      const pose = state === 'down'
        ? { arms: ['phone', 'cross', 'watch', 'phone', 'hips', 'pockets'][i % 6], face: 'left', look: i % 6 === 0 || i % 6 === 3 ? 'phone' : 'ahead', screen: '#f3c1b6' }
        : { arms: ['phone', 'down', 'pockets'][i % 3], face: 'left', step: state === 'load' ? (Math.sin(t * 6 + i) * .5 + .5) : 0 };
      person(Q, p.x, p.y, h, sp2, pose, t);
      // The load test: a ghost of a customer beside each real one, in REGEX's cyan.
      if (state === 'load') {
        const gp = project(c, [x - 60, 0, z + 13]);
        Q.save(); Q.globalAlpha = .55;
        person(Q, gp.x, gp.y, h, { ...sp2, top: { kind: 'shirt', col: '#2ee6ff' }, legs: { col: '#2ee6ff' }, skin: '#9ff4ff', hair: { style: 'short', col: '#2ee6ff' } }, { ...pose, step: .5 + .5 * Math.sin(t * 7 + i * 1.3) }, t);
        Q.restore();
      }
    }
    // Rosa at her door, arms on her hips.
    const rp = project(c, [690, 0, -1480]);
    person(Q, rp.x, rp.y, 172 * rp.s, ROSA, { arms: state === 'down' ? 'hips' : 'down', face: 'left' }, t);
  }, rim);
  return sp;
}

// ---------------------------------------------------------------- views composed for the words
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

// A person lit from one side: their colours on the lit side, the shade side dark, and a line of
// sun down the lit edge. (For crowds in the street, where the sun comes from the side.)
export function sunlit(L, name, drawPeople, lightX = -1) {
  const lit = layer(name + 'Lit');
  lit.setTransform(L.getTransform());
  drawPeople(lit);
  // The shade: the same shapes darkened, offset away from the light, clipped to themselves.
  const sh = layer(name + 'Sh');
  sh.setTransform(1, 0, 0, 1, 0, 0);
  sh.drawImage(lit.canvas, 0, 0);
  sh.globalCompositeOperation = 'source-in';
  sh.fillStyle = 'rgba(30,22,48,.55)'; sh.fillRect(0, 0, sh.canvas.width, sh.canvas.height);
  sh.globalCompositeOperation = 'destination-out';
  sh.drawImage(lit.canvas, lightX * 7 * R.k, -2 * R.k);
  sh.globalCompositeOperation = 'source-over';
  put(L, lit);
  put(L, sh);
}
import { R } from './post.js';

// Rosa's bakery at 8 a.m., as a tall picture behind verse 1's first line: the shop's sign and
// awning high up (behind YOUR CHECKOUT), the clock and the queue at street level (behind AT
// EIGHT WITH FIFTY IN THE QUEUE), which the camera reaches when it drops. y grows downwards;
// `low` is how far below the first framing the second one sits.
export function bakeryView(L, t, state, low) {
  // Sky, sun low on the left.
  const sky = L.createLinearGradient(0, -600, 0, low + 900);
  sky.addColorStop(0, '#4f9ad6'); sky.addColorStop(.35, '#a9d3ec'); sky.addColorStop(.6, '#ffe3b4'); sky.addColorStop(1, '#ffc88c');
  L.fillStyle = sky; L.fillRect(-400, -800, W + 800, low + H + 1600);
  const sg = L.createRadialGradient(-80, 420, 0, -80, 420, 700);
  sg.addColorStop(0, 'rgba(255,253,240,1)'); sg.addColorStop(.2, 'rgba(255,240,200,.7)'); sg.addColorStop(1, 'rgba(255,225,170,0)');
  L.fillStyle = sg; L.fillRect(-400, -800, W + 800, low + H + 1600);
  // The shop: a green-painted front across the whole view, lit from the left.
  const top = 180, sign = [60, 250, 960, 470];
  L.fillStyle = '#2c5b4d'; L.fillRect(-200, top, W + 400, low + 700);
  L.fillStyle = '#3f7a66'; L.fillRect(-200, top, 260, low + 700);          // the lit pilaster
  // The sign board, and ROSA'S BAKERY painted in gold.
  L.fillStyle = '#1f3f36'; L.fillRect(sign[0], sign[1], sign[2] - sign[0], sign[3] - sign[1]);
  L.strokeStyle = '#d9b45c'; L.lineWidth = 8; L.strokeRect(sign[0] + 16, sign[1] + 16, sign[2] - sign[0] - 32, sign[3] - sign[1] - 32);
  L.fillStyle = '#f3d27c'; L.textAlign = 'center'; L.textBaseline = 'middle';
  L.font = '150px Hand'; L.fillText("Rosa's", 510, 350);
  L.font = '600 44px Mono'; L.fillStyle = '#efe2c2'; L.fillText('BAKERY  ·  SINCE 1987', 510, 438);
  // The awning, striped, and under it the window full of bread, lit warm.
  const aw = 520;
  for (let i = -2; i < 14; i++) {
    L.fillStyle = i % 2 ? '#f4e9d2' : '#b8412f';
    L.beginPath(); L.moveTo(i * 90, aw); L.lineTo((i + 1) * 90, aw); L.lineTo((i + 1) * 90 - 18, aw + 150); L.lineTo(i * 90 - 18, aw + 150); L.closePath(); L.fill();
  }
  L.fillStyle = 'rgba(0,0,0,.18)'; L.fillRect(-200, aw + 150, W + 400, 26);
  const win = [70, aw + 190, 1010, aw + 700];
  const wg = L.createLinearGradient(0, win[1], 0, win[3]);
  wg.addColorStop(0, '#ffe7a8'); wg.addColorStop(1, '#f3b35e');
  L.fillStyle = wg; L.fillRect(win[0], win[1], win[2] - win[0], win[3] - win[1]);
  for (let row = 0; row < 3; row++) {
    const y = win[1] + 120 + row * 150;
    L.fillStyle = '#7b4b25'; L.fillRect(win[0], y + 38, win[2] - win[0], 14);
    for (let i = 0; i < 9; i++) {
      const x = win[0] + 60 + i * 102 + (row % 2) * 40;
      L.fillStyle = mix('#c98640', '#9c5a24', hash(i, row)); L.beginPath(); L.ellipse(x, y + 8, 46, 30 + hash(i, row, 2) * 8, 0, 0, Math.PI * 2); L.fill();
      L.strokeStyle = 'rgba(80,44,16,.55)'; L.lineWidth = 4;
      for (let k = -1; k <= 1; k++) { L.beginPath(); L.moveTo(x - 22 + k * 16, y - 6); L.lineTo(x - 8 + k * 16, y + 16); L.stroke(); }
    }
  }
  // Street level, below: the pavement, the clock at eight, and the queue.
  const kerb = low + 820;
  L.fillStyle = '#d8c3a5'; L.fillRect(-400, low + 520, W + 800, 320);
  L.fillStyle = '#a58b72'; L.fillRect(-400, kerb, W + 800, 900);
  // The clock, big, on its post, where EIGHT is.
  const cx = 700, cy = low + 170;
  L.fillStyle = '#1b2a28'; L.fillRect(cx - 12, cy + 150, 24, 700);
  L.beginPath(); L.arc(cx, cy, 158, 0, Math.PI * 2); L.fill();
  L.fillStyle = '#f8f2e4'; L.beginPath(); L.arc(cx, cy, 136, 0, Math.PI * 2); L.fill();
  L.strokeStyle = '#1b2a28'; L.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; L.lineWidth = i % 3 ? 5 : 10; L.beginPath(); L.moveTo(cx + Math.sin(a) * 112, cy - Math.cos(a) * 112); L.lineTo(cx + Math.sin(a) * 128, cy - Math.cos(a) * 128); L.stroke(); }
  const hr = (8 + .02) / 12 * Math.PI * 2, mn = .02 * Math.PI * 2;
  L.lineWidth = 16; L.beginPath(); L.moveTo(cx, cy); L.lineTo(cx + Math.sin(hr) * 70, cy - Math.cos(hr) * 70); L.stroke();
  L.lineWidth = 10; L.beginPath(); L.moveTo(cx, cy); L.lineTo(cx + Math.sin(mn) * 110, cy - Math.cos(mn) * 110); L.stroke();
  L.fillStyle = '#b8412f'; L.beginPath(); L.arc(cx, cy, 12, 0, Math.PI * 2); L.fill();
  // The queue: along the pavement, from the far door on the right to the near left, getting
  // bigger as it comes; everyone fed up, on their phones, checking the time.
  const n = 22, spot = i => { const k = i / (n - 1); return { x: lerp(1060, -40, k), foot: low + lerp(820, 1180, k * k), h: lerp(260, 640, k * k), sp: stranger(i * 17 + 3) }; };
  // The load test first, behind: simulated customers, one beside each real one, twice the crowd,
  // in REGEX's cyan and lit from within, all moving.
  if (state === 'load') {
    const lit = SHADE.lit; SHADE.lit = true;
    const G = layer('ghosts');
    G.setTransform(L.getTransform());
    for (let i = n - 1; i >= 0; i--) {
      const { x, foot, h, sp } = spot(i);
      const gs = { ...sp, top: { kind: 'shirt', col: '#39e2ff' }, legs: { col: '#1bb7d8' }, skin: '#b8f6ff', hair: { style: 'short', col: '#15a9c8' }, bag: null };
      person(G, x + 46 + Math.sin(t * 5 + i) * 8, foot - 8, h * sp.height * .97, gs, { arms: 'phone', face: 'left', look: 'phone', step: .5 + .5 * Math.sin(t * 6 + i * 1.3), screen: '#ffffff' }, t);
    }
    SHADE.lit = lit;
    const k0 = L.getTransform().a;
    L.save(); L.setTransform(1, 0, 0, 1, 0, 0);
    L.globalAlpha = .82; L.drawImage(G.canvas, 0, 0);
    L.globalCompositeOperation = 'lighter'; L.globalAlpha = .28; L.filter = `blur(${6 * k0}px)`; L.drawImage(G.canvas, 0, 0);
    L.restore();
  }
  sunlit(L, 'queue', Q => {
    for (let i = n - 1; i >= 0; i--) {
      const { x, foot, h, sp } = spot(i);
      const arms = state === 'down' ? ['phone', 'cross', 'watch', 'phone', 'hips', 'pockets', 'phoneFar'][i % 7] : ['phone', 'down', 'pockets'][i % 3];
      person(Q, x, foot, h * sp.height, sp, { arms, face: 'left', look: arms.startsWith('phone') ? 'phone' : 'ahead', screen: state === 'down' ? '#ffd2c4' : '#dff0ff', step: state === 'load' ? .5 + .5 * Math.sin(t * 6 + i) : 0 }, t);
    }
  }, -1);
}
const backShift = Q => 0;

// A rounded rectangle path.
function rr(L, x, y, w, h, r) { L.beginPath(); L.moveTo(x + r, y); L.arcTo(x + w, y, x + w, y + h, r); L.arcTo(x + w, y + h, x, y + h, r); L.arcTo(x, y + h, x, y, r); L.arcTo(x, y, x + w, y, r); L.closePath(); }

// Gran, at the clinic's door: her coat, her bag, her phone held out as far as it'll go.
export const GRAN = { sex: 'f', age: 'old', skin: SKIN[0], hair: { style: 'curly', col: HAIRC.white }, top: { kind: 'coat', col: '#8a4f7d' }, legs: { kind: 'skirt', col: '#5a4a5e' }, glasses: true, bag: '#6b3a2a', build: .95, seed: 12 };

// THE CLINIC: its booking site, which looked cute, big behind the line; Gran with her phone below.
export function clinicView(L, t, state = 'down') {
  // A mint waiting room in morning light through tall windows.
  const bg = L.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#dff3ec'); bg.addColorStop(1, '#bfe3d6');
  L.fillStyle = bg; L.fillRect(-400, -400, W + 800, H + 800);
  for (let i = 0; i < 4; i++) { L.fillStyle = 'rgba(255,255,245,.75)'; L.fillRect(-60 + i * 330, -200, 200, 1100); }
  // The booking site, on a big screen: pastel, rounded, a heart for a logo, a calendar.
  const sx = 90, sy = 160, sw = 900, shh = 720;
  L.fillStyle = '#26303a'; rr(L, sx - 26, sy - 26, sw + 52, shh + 52, 40); L.fill();
  L.fillStyle = '#fff4f6'; rr(L, sx, sy, sw, shh, 22); L.fill();
  L.fillStyle = '#ffc9d6'; rr(L, sx, sy, sw, 150, 22); L.fill(); L.fillRect(sx, sy + 110, sw, 40);
  L.fillStyle = '#ff7a9c'; L.beginPath(); const hx = sx + 90, hy = sy + 78;
  L.moveTo(hx, hy + 30); L.bezierCurveTo(hx - 60, hy - 10, hx - 20, hy - 55, hx, hy - 20); L.bezierCurveTo(hx + 20, hy - 55, hx + 60, hy - 10, hx, hy + 30); L.fill();
  L.fillStyle = '#b9375e'; L.font = '64px Hand'; L.textBaseline = 'middle'; L.textAlign = 'left'; L.fillText('Book a visit', sx + 170, sy + 80);
  // The calendar: soft buttons in a grid.
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) {
    L.fillStyle = (r * 6 + k) % 5 === 2 ? '#ffb3c6' : '#ffe3ea';
    rr(L, sx + 40 + k * 140, sy + 200 + r * 110, 120, 88, 26); L.fill();
    L.fillStyle = '#c06a84'; L.font = '600 34px Mono'; L.textAlign = 'center'; L.fillText(String(3 + r * 6 + k), sx + 100 + k * 140, sy + 246 + r * 110);
  }
  // It doesn't work: the spinner that never stops, and the message.
  if (state === 'down') {
    L.fillStyle = 'rgba(255,244,246,.86)'; rr(L, sx + 210, sy + 250, 480, 300, 30); L.fill();
    L.strokeStyle = '#ff7a9c'; L.lineWidth = 14; L.lineCap = 'round';
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 5; L.globalAlpha = .15 + i / 10 * .85; L.beginPath(); L.moveTo(sx + 450 + Math.cos(a) * 46, sy + 360 + Math.sin(a) * 46); L.lineTo(sx + 450 + Math.cos(a) * 70, sy + 360 + Math.sin(a) * 70); L.stroke(); }
    L.globalAlpha = 1;
    L.fillStyle = '#b9375e'; L.font = '600 30px Mono'; L.fillText('please try again later', sx + 450, sy + 480);
  } else {
    L.fillStyle = '#5fbf8f'; rr(L, sx + 250, sy + 280, 400, 180, 30); L.fill();
    L.fillStyle = '#fff'; L.font = '900 70px Stencil'; L.fillText('BOOKED', sx + 420, sy + 372); L.strokeStyle = '#fff'; L.lineWidth = 12; L.lineCap = 'round'; L.beginPath(); L.moveTo(sx + 560, sy + 372); L.lineTo(sx + 585, sy + 398); L.lineTo(sx + 630, sy + 340); L.stroke();
  }
  // Gran, lower down, her phone held out at arm's length, squinting at it.
  sunlit(L, 'gran', Q => {
    person(Q, 640, 1500, 700, GRAN, { arms: 'phoneFar', face: 'right', look: 'phone', screen: '#ffd9e2' }, t);
    person(Q, 150, 1480, 560, stranger(71), { arms: 'pockets', face: 'right' }, t);
  }, -1);
}

// PARKSIDE SCHOOL at home time: the gate, and the parents, each on their phone, with each other's
// private messages floating over them for anyone to read.
export function schoolView(L, t, state = 'down') {
  const bg = L.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#8cc6ea'); bg.addColorStop(.55, '#e8f1f2'); bg.addColorStop(1, '#d9cdb4');
  L.fillStyle = bg; L.fillRect(-400, -400, W + 800, H + 800);
  // The school: red brick, a row of big windows, the sign.
  L.fillStyle = '#b5553d'; L.fillRect(-200, 250, W + 400, 700);
  for (let i = 0; i < 6; i++) { L.fillStyle = '#e9f4f6'; L.fillRect(-60 + i * 200, 330, 130, 190); L.fillStyle = '#7fb3cf'; L.fillRect(-52 + i * 200, 338, 114, 174); }
  L.fillStyle = '#20444f'; L.fillRect(120, 560, 840, 120);
  L.fillStyle = '#f5e7b8'; L.font = '900 76px Stencil'; L.textAlign = 'center'; L.textBaseline = 'middle'; L.fillText('PARKSIDE PRIMARY', 540, 622);
  // The gate: green railings.
  L.strokeStyle = '#2f6b4b'; L.lineWidth = 12;
  for (let x = -100; x < W + 100; x += 46) { L.beginPath(); L.moveTo(x, 1180); L.lineTo(x, 900); L.stroke(); }
  L.fillStyle = '#2f6b4b'; L.fillRect(-100, 930, W + 200, 16); L.fillRect(-100, 1120, W + 200, 16);
  L.fillStyle = '#cdbd9e'; L.fillRect(-400, 1180, W + 800, 800);
  // The parents, and their messages, which everyone can see.
  const msgs = ['is the rash contagious??', "can't pay for the trip", 'running late AGAIN sorry', "Jamie's dad moved out", 'who has the nits letter?'];
  const spots = [[140, 1480, 620], [420, 1520, 660], [700, 1470, 610], [960, 1500, 640]];
  sunlit(L, 'parents', Q => {
    spots.forEach(([x, y, h], i) => person(Q, x, y, h, stranger(90 + i * 3), { arms: i % 2 ? 'phone' : 'phoneFar', face: i % 2 ? 'left' : 'right', look: 'phone', screen: '#fff3c4' }, t));
  }, -1);
  msgs.forEach((m, i) => {
    const x = 110 + (i % 3) * 330 + Math.sin(t * 1.4 + i) * 10, y = 760 + Math.floor(i / 3) * 170 + Math.cos(t * 1.2 + i) * 8;
    L.font = '600 30px Mono'; const w = L.measureText(m).width + 44;
    L.fillStyle = state === 'down' ? ['#fff', '#dff5d0', '#fff', '#ffe9e9', '#e6f0ff'][i] : '#e8e8ea';
    rr(L, x - 22, y - 34, w, 70, 26); L.fill();
    L.fillStyle = '#23272e'; L.textAlign = 'left'; L.fillText(state === 'down' ? m : '— private —', x, y + 2);
  });
}

// JESS'S WEDDING: the reception, fairy lights, round tables; at table 4, Dave, and next to him
// the ex he's not speaking to.
export const DAVE = { sex: 'm', skin: SKIN[1], hair: { style: 'bald', col: HAIRC.grey }, top: { kind: 'coat', col: '#2d3340' }, legs: { col: '#2d3340' }, build: 1.28, seed: 14 };
export const SUE = { sex: 'f', skin: SKIN[3], hair: { style: 'long', col: HAIRC.black }, top: { kind: 'dress', col: '#8a2f3a' }, legs: { kind: 'skirt', col: '#8a2f3a' }, seed: 15 };
export const JESS = { sex: 'f', skin: SKIN[1], hair: { style: 'bun', col: HAIRC.auburn }, top: { kind: 'gown', col: '#fbf8f2' }, legs: { kind: 'dress', col: '#fbf8f2' }, veil: '#ffffff', seed: 13 };
export function weddingView(L, t, state = 'down') {
  const bg = L.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#f6d9b8'); bg.addColorStop(.6, '#fbeee0'); bg.addColorStop(1, '#e9cfb2');
  L.fillStyle = bg; L.fillRect(-400, -400, W + 800, H + 800);
  // Fairy lights across the top, strung in swags.
  for (let s = 0; s < 3; s++) {
    L.strokeStyle = 'rgba(90,70,50,.5)'; L.lineWidth = 3; L.beginPath();
    for (let x = -100; x <= W + 100; x += 20) { const y = 120 + s * 150 + Math.sin((x + s * 200) / W * Math.PI * 3) * 40; x === -100 ? L.moveTo(x, y) : L.lineTo(x, y); }
    L.stroke();
    for (let x = -80; x <= W + 100; x += 60) {
      const y = 120 + s * 150 + Math.sin((x + s * 200) / W * Math.PI * 3) * 40;
      const gl = L.createRadialGradient(x, y, 0, x, y, 26); gl.addColorStop(0, 'rgba(255,240,190,1)'); gl.addColorStop(1, 'rgba(255,220,150,0)');
      L.fillStyle = gl; L.beginPath(); L.arc(x, y, 26, 0, Math.PI * 2); L.fill();
    }
  }
  // The table: a round white cloth, flowers, the place cards.
  L.fillStyle = '#fffaf3'; L.beginPath(); L.ellipse(540, 1330, 520, 120, 0, 0, Math.PI * 2); L.fill();
  L.fillStyle = '#f0e6da'; L.fillRect(20, 1330, 1040, 400);
  L.fillStyle = '#d98a9a'; for (let i = 0; i < 6; i++) { L.beginPath(); L.arc(480 + i * 22, 1250 - (i % 2) * 18, 26, 0, Math.PI * 2); L.fill(); }
  L.fillStyle = '#6c9a6a'; L.fillRect(532, 1250, 16, 90);
  // Dave and Sue, side by side, not looking at each other.
  sunlit(L, 'table', Q => {
    person(Q, 330, 1400, 760, DAVE, { arms: 'cross', face: 'right', weight: .4 }, t);
    person(Q, 740, 1400, 700, SUE, { arms: 'cross', face: 'left', weight: -.4 }, t);
  }, -1);
  // The place cards, in front of them.
  for (const [x, name] of [[330, 'DAVE'], [740, 'SUE']]) {
    L.fillStyle = '#fffdf8'; L.fillRect(x - 90, 1390, 180, 90); L.strokeStyle = '#c9a36a'; L.lineWidth = 4; L.strokeRect(x - 82, 1398, 164, 74);
    L.fillStyle = '#5a3a2a'; L.font = '52px Hand'; L.textAlign = 'center'; L.textBaseline = 'middle'; L.fillText(name, x, 1438);
  }
  if (state === 'down') {
    // A crack of anger between them.
    L.strokeStyle = '#d9412f'; L.lineWidth = 8; L.lineCap = 'round'; L.beginPath();
    L.moveTo(540, 620); L.lineTo(560, 760); L.lineTo(520, 880); L.lineTo(556, 1010); L.lineTo(530, 1130); L.stroke();
  }
  if (state === 'note') {
    // Only you knew: your note, held up to the glass, in your own hand.
    L.save(); L.translate(540, 700); L.rotate(-.06);
    L.fillStyle = 'rgba(0,0,0,.18)'; L.fillRect(-392, -232, 800, 480);
    L.fillStyle = '#fff8dc'; L.fillRect(-400, -240, 800, 480);
    L.strokeStyle = 'rgba(120,150,200,.35)'; L.lineWidth = 3; for (let y = -170; y < 230; y += 70) { L.beginPath(); L.moveTo(-380, y); L.lineTo(380, y); L.stroke(); }
    L.fillStyle = '#2a2320'; L.font = '86px Hand'; L.textAlign = 'center'; L.textBaseline = 'middle';
    L.fillText('Dave + Sue:', 0, -90);
    L.fillStyle = '#c4302a'; L.font = '96px Hand'; L.fillText('NOT the same', 0, 40);
    L.fillText('table!!', 0, 160);
    L.restore();
    // Your hand, holding it.
    L.fillStyle = '#e8b894'; L.beginPath(); L.ellipse(930, 900, 70, 110, -.5, 0, Math.PI * 2); L.fill();
    L.beginPath(); L.ellipse(880, 760, 26, 60, -.3, 0, Math.PI * 2); L.fill();
  }
}

// The people the band built for, outside the box, looking in: Rosa, Gran, a parent, Jess, big
// in the light behind the glass.
export const PARENT = { sex: 'm', skin: SKIN[4], hair: { style: 'short', col: HAIRC.black }, top: { kind: 'coat', col: '#3f7a5a' }, legs: { col: '#2e3446' }, build: 1.05, seed: 21, bag: '#b8b24a' };
export function onlookers(L, c, t, o = {}) {
  L.__k = L.getTransform().a;
  sky(L, c, t, { sun: [0, 420, -6000], low: '#ffe8c0' });
  const rim = [{ col: '#fff0c8', lx: 0, ly: -1, d: 3, k: 1 }];
  // The four they built for, up at the glass, and others behind them, all looking in.
  const lit = SHADE.lit; SHADE.lit = !!o.lit;
  rimmed(L, 'onlook', Q => {
    const back = [];
    for (let i = 0; i < (o.crowd ?? 9); i++) back.push([stranger(200 + i * 7), -620 + i * 150 + (hash(i, 3) - .5) * 60, -900 - hash(i, 4) * 500, ['pockets', 'down', 'cross', 'phone'][i % 4]]);
    back.sort((a, b) => a[2] - b[2]);
    for (const [sp, x, z, arms] of back) { const p = project(c, [x, 0, z]); if (p.z > c.near) person(Q, p.x, p.y, 172 * sp.height * p.s, sp, { arms, face: 'front', joy: o.joy }, t); }
    const cast = [[ROSA, -300, -430, 'hips'], [GRAN, -100, -470, 'down'], [PARENT, 110, -440, 'pockets'], [JESS, 310, -420, 'hold']];
    for (const [sp, x, z, arms] of cast) {
      const p = project(c, [x, 0, z]);
      if (p.z > c.near) person(Q, p.x, p.y, 172 * (sp.build ? 1 : 1) * p.s, sp, { arms: o.arms || arms, face: 'front', joy: o.joy }, t);
    }
  }, rim);
  SHADE.lit = lit;
}

// ---------------------------------------------------------------- verse 2's windows
// What an oracle lets you see: views drawn to fill a window cut in the mirror (box, in the
// reference camera's screen space).

// The clinic's booking site, tried by the bot playing Gran: the screen scaled into the window.
export function clinicWindow(L, t, state, box) {
  const [x0, y0, x1, y1] = box, k = Math.min((x1 - x0) / 1000, (y1 - y0) / 820);
  L.save(); L.translate((x0 + x1) / 2, (y0 + y1) / 2); L.scale(k, k); L.translate(-540, -520);
  clinicView(L, t, state);
  L.restore();
}

// Isolation: one family in each cell, a parent at their phone and their own message, locked,
// that no one else's cell can show.
const PRIVATE = ['is the rash contagious??', "can't pay for the trip", 'running late AGAIN sorry', "Jamie's dad moved out"];
export function cellsView(L, t, cells) {
  const bg = L.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#8cc6ea'); bg.addColorStop(.5, '#e8f1f2'); bg.addColorStop(1, '#d9cdb4');
  L.fillStyle = bg; L.fillRect(-400, -400, W + 800, H + 800);
  cells.forEach((b, i) => {
    const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0;
    L.save(); L.beginPath(); L.rect(x0 - 20, y0 - 20, w + 40, h + 40); L.clip();
    // Their own bit of the school behind them: brick, a window.
    L.fillStyle = mix('#b5553d', '#a24a36', hash(i, 2)); L.fillRect(x0 - 20, y0 - 20, w + 40, h * .62);
    L.fillStyle = '#e9f4f6'; L.fillRect(x0 + w * .58, y0 + h * .08, w * .3, h * .36); L.fillStyle = '#7fb3cf'; L.fillRect(x0 + w * .6, y0 + h * .1, w * .26, h * .32);
    L.fillStyle = '#cdbd9e'; L.fillRect(x0 - 20, y0 + h * .62, w + 40, h * .5);
    sunlit(L, 'cell' + i, Q => person(Q, x0 + w * .3, y1 + h * .75, h * 1.7, stranger(90 + i * 3), { arms: 'phone', face: 'right', look: 'phone', screen: '#fff3c4' }, t), -1);
    // The message, theirs alone, with a lock.
    const m = PRIVATE[i % PRIVATE.length];
    L.font = `600 ${Math.round(h * .085)}px Mono`;
    const tw = L.measureText(m).width, bw = Math.min(w * .9, tw + h * .16), bh = h * .2;
    const bx = x1 - bw - w * .04, by = y0 + h * .5 + Math.sin(t * 1.4 + i) * 3;
    L.fillStyle = '#ffffff'; rr(L, bx, by, bw, bh, bh * .4); L.fill();
    L.fillStyle = '#23272e'; L.textAlign = 'left'; L.textBaseline = 'middle'; L.fillText(m, bx + h * .07, by + bh / 2, bw - h * .14);
    const lx = bx + bw - h * .02, ly = by - h * .02, ls = h * .09;
    L.fillStyle = '#a57bff'; rr(L, lx - ls, ly - ls * .2, ls * 1.6, ls * 1.2, ls * .2); L.fill();
    L.strokeStyle = '#a57bff'; L.lineWidth = ls * .28; L.beginPath(); L.arc(lx - ls * .2, ly - ls * .2, ls * .45, Math.PI, 0); L.stroke();
    L.restore();
  });
}

// For Dave and Sue, no check could know: Jess, right up at the glass, holding up her note.
export function noteView(L, t, box) {
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2;
  const bg = L.createLinearGradient(0, y0, 0, y1);
  bg.addColorStop(0, '#f6d9b8'); bg.addColorStop(.6, '#fbeee0'); bg.addColorStop(1, '#e9cfb2');
  L.fillStyle = bg; L.fillRect(-400, -400, W + 800, H + 800);
  // The reception's fairy lights behind her.
  for (let sw = 0; sw < 2; sw++) {
    const yb = y0 + h * (.1 + sw * .16);
    L.strokeStyle = 'rgba(90,70,50,.45)'; L.lineWidth = 3; L.beginPath();
    for (let x = x0 - 60; x <= x1 + 60; x += 16) { const y = yb + Math.sin((x - x0) / w * Math.PI * 2 + sw) * h * .04; x === x0 - 60 ? L.moveTo(x, y) : L.lineTo(x, y); }
    L.stroke();
    for (let x = x0 - 40; x <= x1 + 60; x += 52) {
      const y = yb + Math.sin((x - x0) / w * Math.PI * 2 + sw) * h * .04;
      const gl = L.createRadialGradient(x, y, 0, x, y, 22); gl.addColorStop(0, 'rgba(255,240,190,1)'); gl.addColorStop(1, 'rgba(255,220,150,0)');
      L.fillStyle = gl; L.beginPath(); L.arc(x, y, 22, 0, Math.PI * 2); L.fill();
    }
  }
  // Jess, close: her head and veil above the note, in the light of the room.
  const lit = SHADE.lit; SHADE.lit = true;
  sunlit(L, 'jess', Q => person(Q, cx + w * .02, y0 + h * 2.02, h * 2.05, JESS, { arms: 'down', face: 'front', joy: 0 }, t), -1);
  SHADE.lit = lit;
  // The note, pressed to the glass, a little crooked, in her own hand.
  const nw = w * .8, nh = h * .5;
  L.save(); L.translate(cx, y0 + h * .62); L.rotate(-.045);
  L.fillStyle = 'rgba(0,0,0,.16)'; L.fillRect(-nw / 2 + 8, -nh / 2 + 10, nw, nh);
  L.fillStyle = '#fff8dc'; L.fillRect(-nw / 2, -nh / 2, nw, nh);
  L.strokeStyle = 'rgba(120,150,200,.35)'; L.lineWidth = 3;
  for (let y = -nh / 2 + nh * .2; y < nh / 2; y += nh * .19) { L.beginPath(); L.moveTo(-nw / 2 + 14, y); L.lineTo(nw / 2 - 14, y); L.stroke(); }
  L.textAlign = 'center'; L.textBaseline = 'middle';
  const fit = (str, px) => { L.font = `${px}px Hand`; const m = L.measureText(str).width; return m > nw * .86 ? Math.floor(px * nw * .86 / m) : px; };
  L.fillStyle = '#2a2320'; L.font = `${fit('Dave + Sue:', Math.round(nh * .19))}px Hand`; L.fillText('Dave + Sue:', 0, -nh * .27);
  L.fillStyle = '#c4302a'; const px2 = fit('NOT the same', Math.round(nh * .22)); L.font = `${px2}px Hand`; L.fillText('NOT the same', 0, nh * .02);
  L.fillText('table!!', 0, nh * .3);
  L.restore();
  // Her hands, holding it up at each side.
  for (const sd of [-1, 1]) {
    const hx = cx + sd * nw * .5, hy = y0 + h * .58 + sd * 6;
    L.fillStyle = '#e8b894'; L.beginPath(); L.ellipse(hx, hy, w * .045, h * .085, sd * .25, 0, Math.PI * 2); L.fill();
    L.fillStyle = '#d9a17c'; L.beginPath(); L.ellipse(hx - sd * w * .02, hy - h * .05, w * .018, h * .04, sd * .2, 0, Math.PI * 2); L.fill();
  }
}

// A view drawn into a box: the part of it in src (its own coordinates) scaled to fill box,
// clipped a little outside the box so parallax never shows an edge.
export function fitView(L, box, src, draw, pad = 40) {
  const [x0, y0, x1, y1] = box, [sx0, sy0, sx1, sy1] = src;
  const k = Math.max((x1 - x0) / (sx1 - sx0), (y1 - y0) / (sy1 - sy0));
  L.save();
  L.beginPath(); L.rect(x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2); L.clip();
  L.translate((x0 + x1) / 2, (y0 + y1) / 2); L.scale(k, k); L.translate(-(sx0 + sx1) / 2, -(sy0 + sy1) / 2);
  draw(L);
  L.restore();
}
