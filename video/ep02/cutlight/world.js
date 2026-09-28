// The world outside the mirror box: daylight, full colour, the people the band built for. It's
// what shows through every cut. Each view is a painted backdrop of the place with the people in
// front of it as paper cut-outs (paper.js), drawn in the screen space of the shot's reference
// camera and moved with the real camera as a view through a window moves.
import { W, H, clamp, lerp, rgba, hash } from './kit.js';
import { project } from './space.js';
import { figure, backImage, frontOf, BACK, CAST } from './paper.js';

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

// Every backdrop is laid out the same way in its view: 1300 wide, centred on the frame.
const BX = -110, BW = 1300;
function rr(L, x, y, w, h, r) { L.beginPath(); L.moveTo(x + r, y); L.arcTo(x + w, y, x + w, y + h, r); L.arcTo(x + w, y + h, x, y + h, r); L.arcTo(x, y + h, x, y, r); L.arcTo(x, y, x + w, y, r); L.closePath(); }
// Paint a name on a blank sign board, sized to fit it.
function letterSign(L, m, rect, text, col, font, k, o = {}) {
  const [x0, y0] = m.at(rect[0], rect[1]), [x1, y1] = m.at(rect[2], rect[3]);
  let px = (y1 - y0) * k;
  L.save();
  L.font = font.replace('#', Math.round(px));
  const wd = L.measureText(text).width;
  if (wd > (x1 - x0) * .86) { px *= (x1 - x0) * .86 / wd; L.font = font.replace('#', Math.round(px)); }
  L.textAlign = 'center'; L.textBaseline = 'middle';
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + (o.dy || 0) * px;
  L.lineJoin = 'round'; L.strokeStyle = rgba('#1a120c', .55); L.lineWidth = px * .06;
  L.strokeText(text, cx, cy);
  L.fillStyle = col; L.fillText(text, cx, cy);
  L.restore();
}

// ROSA'S BAKERY, 8 a.m. The shop straight on, its sign painted by hand; along the pavement the
// queue, facing the door. state: 'down' (the checkout's down: a long queue, near, fed up) or
// 'load' (the load test: the queue with a simulated customer beside every real one, in REGEX's
// cyan, all moving).
const QUEUE = [
  // [figure, x, feet, height], the back row first
  ['queue-1', 200, 1440, 760], ['queue-3', 460, 1450, 740], ['queue-8', 720, 1440, 760], ['queue-10', 975, 1450, 770],
  ['queue-2', 70, 1640, 900], ['queue-5', 330, 1650, 880], ['queue-7', 590, 1640, 900], ['queue-9', 840, 1650, 880], ['queue-12', 1080, 1640, 860],
];
const QUEUE_LOAD = [
  ['queue-1', 230, 1500, 600], ['queue-3', 450, 1510, 590], ['queue-8', 690, 1500, 600], ['queue-10', 930, 1510, 610],
  ['queue-2', 130, 1680, 700], ['queue-5', 360, 1690, 690], ['queue-7', 590, 1680, 700], ['queue-9', 820, 1690, 690], ['queue-12', 1050, 1680, 680],
];
export function bakeryView(L, t, state = 'down') {
  const m = backImage(L, 'bg-bakery', BX, -140, BW);
  if (!m) return;
  letterSign(L, m, m.b.sign, "Rosa's", '#f0d27a', '#px Hand', .62);
  const load = state === 'load';
  (load ? QUEUE_LOAD : QUEUE).forEach(([n, x, y, h], i) => {
    if (load) {
      // The simulated customer, beside and a little behind: cyan, lit from within, marching on
      // the beat as the test runs.
      figure(L, n, x + 58, y - 14, h * .98, { t, seed: 40 + i, wash: ['#39e2ff', .72], halo: ['#39e2ff', .55, 10], edge: '#b8f6ff', shadow: false, bounce: .5, beatOff: i * .13, alpha: .92 });
    }
    figure(L, n, x, y, h, { t, seed: 20 + i, sway: 1.3 });
  });
}

// THE CLINIC's waiting room, its screen showing the booking site, which looked cute; Gran in
// front with her phone held out, squinting.
export function bookingUI(L, t, state, x, y, w, h) {
  L.save();
  L.beginPath(); L.rect(x, y, w, h); L.clip();
  L.fillStyle = '#fff4f6'; L.fillRect(x, y, w, h);
  const hb = h * .21;
  L.fillStyle = '#ffc9d6'; L.fillRect(x, y, w, hb);
  // The heart for a logo, and the name.
  const hx = x + hb * .62, hy = y + hb * .52, hs = hb * .34;
  L.fillStyle = '#ff7a9c'; L.beginPath();
  L.moveTo(hx, hy + hs); L.bezierCurveTo(hx - hs * 2, hy - hs * .3, hx - hs * .7, hy - hs * 1.8, hx, hy - hs * .6); L.bezierCurveTo(hx + hs * .7, hy - hs * 1.8, hx + hs * 2, hy - hs * .3, hx, hy + hs); L.fill();
  L.fillStyle = '#b9375e'; L.font = `${Math.round(hb * .46)}px Hand`; L.textBaseline = 'middle'; L.textAlign = 'left'; L.fillText('Book a visit', x + hb * 1.25, y + hb * .54);
  // The calendar: soft buttons in a grid, a week a row.
  const gx = x + w * .05, gy = y + hb + h * .07, gw = w * .9, gh = h - hb - h * .12;
  const cw = gw / 7, ch = gh / 4;
  for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) {
    L.fillStyle = (r * 7 + k) % 5 === 2 ? '#ffb3c6' : '#ffe3ea';
    rr(L, gx + k * cw + cw * .08, gy + r * ch + ch * .1, cw * .84, ch * .8, ch * .28); L.fill();
    L.fillStyle = '#c06a84'; L.font = `600 ${Math.round(ch * .34)}px Mono`; L.textAlign = 'center';
    L.fillText(String(1 + r * 7 + k), gx + k * cw + cw / 2, gy + r * ch + ch * .52);
  }
  const cx = x + w / 2, cy = y + hb + (h - hb) / 2;
  if (state === 'down') {
    // It doesn't work: the spinner that never stops, and the message.
    const bw = w * .5, bh = (h - hb) * .72;
    L.fillStyle = 'rgba(255,244,246,.9)'; rr(L, cx - bw / 2, cy - bh / 2, bw, bh, bh * .12); L.fill();
    L.strokeStyle = '#ff7a9c'; L.lineWidth = bh * .06; L.lineCap = 'round';
    const r0 = bh * .14, r1 = bh * .24, sy = cy - bh * .1;
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 5; L.globalAlpha = .15 + i / 10 * .85; L.beginPath(); L.moveTo(cx + Math.cos(a) * r0, sy + Math.sin(a) * r0); L.lineTo(cx + Math.cos(a) * r1, sy + Math.sin(a) * r1); L.stroke(); }
    L.globalAlpha = 1;
    L.fillStyle = '#b9375e'; L.font = `600 ${Math.round(bh * .1)}px Mono`; L.textAlign = 'center'; L.fillText('please try again later', cx, cy + bh * .3);
  } else {
    const bw = w * .5, bh = (h - hb) * .5;
    L.fillStyle = '#5fbf8f'; rr(L, cx - bw / 2, cy - bh / 2, bw, bh, bh * .2); L.fill();
    L.fillStyle = '#fff'; L.font = `900 ${Math.round(bh * .42)}px Stencil`; L.textAlign = 'center'; L.fillText('BOOKED', cx - bw * .08, cy + bh * .04);
    L.strokeStyle = '#fff'; L.lineWidth = bh * .08; L.lineCap = 'round'; L.lineJoin = 'round';
    L.beginPath(); L.moveTo(cx + bw * .26, cy); L.lineTo(cx + bw * .31, cy + bh * .15); L.lineTo(cx + bw * .41, cy - bh * .2); L.stroke();
  }
  L.restore();
}
function clinicScreen() {
  const b = BACK['bg-clinic'], k = BW / b.w, s = b.screen;
  return [BX + s[0] * k, -100 + s[1] * k, BX + s[2] * k, -100 + s[3] * k];
}
export function clinicView(L, t, state = 'down', o = {}) {
  const m = backImage(L, 'bg-clinic', BX, -100, BW);
  if (!m) return;
  const [x0, y0, x1, y1] = clinicScreen();
  bookingUI(L, t, state, x0 + 6, y0 + 6, x1 - x0 - 12, y1 - y0 - 12);
  if (!o.noGran) figure(L, 'gran-phone', 690, 1620, 1020, { t, seed: 12, sway: .8 });
}
// The booking site, filling a window: the screen scaled into the box.
export function clinicWindow(L, t, state, box) {
  const [sx0, sy0, sx1, sy1] = clinicScreen();
  const [x0, y0, x1, y1] = box;
  const k = Math.max((x1 - x0) / (sx1 - sx0), (y1 - y0) / (sy1 - sy0)) * 1.04;
  L.save();
  L.translate((x0 + x1) / 2, (y0 + y1) / 2); L.scale(k, k); L.translate(-(sx0 + sx1) / 2, -(sy0 + sy1) / 2);
  clinicView(L, t, state, { noGran: true });
  L.restore();
}

// PARKSIDE PRIMARY at home time: the school, and at its gate the parents, each reading their
// phone, with each other's private messages floating over them for anyone to read.
const PRIVATE = ['is the rash contagious??', "can't pay for the trip", 'running late AGAIN sorry', "Jamie's dad moved out"];
function bubble(L, text, x, y, px, o = {}) {
  L.font = `600 ${px}px Mono`;
  const tw = L.measureText(text).width, bw = tw + px * 1.3, bh = px * 2;
  L.save();
  L.fillStyle = o.fill || '#ffffff'; rr(L, x, y, bw, bh, bh * .45); L.fill();
  L.strokeStyle = rgba('#2a201b', .75); L.lineWidth = Math.max(1.5, px * .07); L.stroke();
  // The tail, towards whoever it belongs to.
  L.beginPath(); L.moveTo(x + bw * .22, y + bh - 1); L.lineTo(x + bw * .16, y + bh + px * .6); L.lineTo(x + bw * .32, y + bh - 1); L.closePath(); L.fill();
  L.fillStyle = '#23272e'; L.textAlign = 'left'; L.textBaseline = 'middle'; L.fillText(text, x + px * .65, y + bh / 2 + px * .04);
  L.restore();
  return [bw, bh];
}
export function schoolView(L, t) {
  const m = backImage(L, 'bg-school', BX, -150, BW);
  if (!m) return;
  letterSign(L, m, m.b.sign, 'PARKSIDE PRIMARY', '#f5e7b8', '900 #px Stencil', .5);
  [['parent-phone-1', 150, 1330, 600], ['parent-phone-2', 420, 1340, 590], ['parent-phone-3', 700, 1330, 600], ['parent-phone-4', 960, 1340, 580]]
    .forEach(([n, x, y, h], i) => figure(L, n, x, y, h, { t, seed: 90 + i, sway: .7 }));
  PRIVATE.forEach((msg, i) => {
    const x = 40 + (i % 2) * 470 + Math.sin(t * 1.4 + i) * 8, y = 360 + Math.floor(i / 2) * 105 + Math.cos(t * 1.2 + i) * 6;
    bubble(L, msg, x, y, 30, { fill: ['#ffffff', '#dff5d0', '#ffe9e9', '#e6f0ff'][i] });
  });
}
// Isolation: one family in each cell, a parent at their phone and their own message, locked,
// that no one else's cell can show. Each cell's wall is a part of the school.
const CELL_CROPS = [[40, 330, 470, 620], [480, 330, 910, 620], [40, 780, 470, 1070], [480, 780, 910, 1070]];
export function cellsView(L, t, cells) {
  L.fillStyle = '#e8f1f2'; L.fillRect(-400, -400, W + 800, H + 800);
  cells.forEach((b, i) => {
    const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0;
    L.save(); L.beginPath(); L.rect(x0 - 20, y0 - 20, w + 40, h + 40); L.clip();
    const bk = BACK['bg-school'], cr = CELL_CROPS[i % 4];
    if (bk) {
      const k = Math.max((w + 40) / (cr[2] - cr[0]), (h + 40) / (cr[3] - cr[1]));
      L.drawImage(bk.img, cr[0], cr[1], cr[2] - cr[0], cr[3] - cr[1], x0 - 20, y0 - 20, (cr[2] - cr[0]) * k, (cr[3] - cr[1]) * k);
    }
    figure(L, `parent-phone-${i % 4 + 1}`, x0 + w * .3, y1 + h * .42, h * 1.3, { t, seed: 90 + i, sway: .6 });
    // The message, theirs alone, with a lock.
    const px = Math.round(h * .075), m = PRIVATE[i % PRIVATE.length];
    L.font = `600 ${px}px Mono`;
    const tw = Math.min(L.measureText(m).width, w * .56);
    const bw = tw + px * 1.3, bx = x1 - bw - w * .04, by = y0 + h * .5 + Math.sin(t * 1.4 + i) * 3;
    L.save(); L.fillStyle = '#ffffff'; rr(L, bx, by, bw, px * 2, px * .9); L.fill(); L.strokeStyle = rgba('#2a201b', .7); L.lineWidth = 2; L.stroke();
    L.fillStyle = '#23272e'; L.textAlign = 'left'; L.textBaseline = 'middle'; L.fillText(m, bx + px * .65, by + px, tw); L.restore();
    const lx = bx + bw - px * .2, ly = by - px * .2, ls = px * 1.1;
    L.fillStyle = '#a57bff'; rr(L, lx - ls, ly - ls * .2, ls * 1.6, ls * 1.2, ls * .2); L.fill();
    L.strokeStyle = '#a57bff'; L.lineWidth = ls * .28; L.beginPath(); L.arc(lx - ls * .2, ly - ls * .2, ls * .45, Math.PI, 0); L.stroke();
    L.restore();
  });
}

// JESS'S WEDDING: the reception in the marquee; at the table in front, Dave, beaming and waving,
// and right next to him the ex he's not speaking to, glaring. Their place cards on the table.
export function weddingView(L, t) {
  const m = backImage(L, 'bg-wedding', BX, -150, BW);
  if (!m) return;
  figure(L, 'dave-lit', 390, 1640, 1080, { t, seed: 14, sway: .7 });
  const sue = figure(L, 'sue-lit', 720, 1640, 1040, { t, seed: 15, sway: .5 });
  frontOf(L, 'bg-wedding', m);
  // The place cards, folded, on the cloth in front of each.
  for (const [x, name] of [[390, 'DAVE'], [720, 'SUE']]) {
    L.save(); L.translate(x, 1200);
    L.fillStyle = '#fffdf8'; L.beginPath(); L.moveTo(-78, 34); L.lineTo(78, 34); L.lineTo(70, -30); L.lineTo(-70, -30); L.closePath(); L.fill();
    L.strokeStyle = rgba('#2a201b', .8); L.lineWidth = 2.5; L.stroke();
    L.strokeStyle = '#c9a36a'; L.lineWidth = 2; L.strokeRect(-62, -22, 124, 48);
    L.fillStyle = '#5a3a2a'; L.font = '34px Hand'; L.textAlign = 'center'; L.textBaseline = 'middle'; L.fillText(name, 0, 4);
    L.restore();
  }
  // Her anger, drawn the way a manga draws it: the popping vein by her temple, throbbing.
  if (sue) {
    const [cx, cy] = [sue.box[0] + (sue.box[2] - sue.box[0]) * .82, sue.box[1] + 70];
    const s = 30 * (1 + .12 * Math.abs(Math.sin(t * 7)));
    L.save(); L.translate(cx, cy); L.strokeStyle = '#d9241f'; L.lineWidth = 7; L.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      L.save(); L.rotate(i * Math.PI / 2 + .3);
      L.beginPath(); L.moveTo(s * .25, -s * .9); L.quadraticCurveTo(s * .3, -s * .3, s * .9, -s * .25); L.stroke();
      L.restore();
    }
    L.restore();
  }
}

// For Dave and Sue, no check could know: Jess, right up at the glass, holding up her note, in
// her own hand, the reception behind her.
const NOTE = { box: [.2515, .386, .8195, .7433] };
export function noteView(L, t, box) {
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
  const bk = BACK['bg-wedding'];
  if (bk) {
    // The marquee's fairy lights and drapes, big behind her.
    const k = (w + 260) / bk.w;
    L.drawImage(bk.img, 0, 0, bk.w, bk.h * .5, x0 - 130, y0 - 60, bk.w * k, bk.h * .5 * k);
  }
  const f = CAST['jess-note'];
  if (!f) return;
  const s = (h - 40) / (NOTE.box[3] * f.h);
  const ih = f.h * s;
  figure(L, 'jess-note', (x0 + x1) / 2, y0 + 30 + ih, ih * (1 - f.head), {
    t, seed: 13, sway: .45,
    draw: (g, X, Y, iw, ihh) => {
      // The words, on her paper.
      const px0 = X + NOTE.box[0] * iw, py0 = Y + NOTE.box[1] * ihh, pw = (NOTE.box[2] - NOTE.box[0]) * iw, ph = (NOTE.box[3] - NOTE.box[1]) * ihh;
      g.save(); g.translate(px0 + pw / 2, py0 + ph / 2); g.rotate(-.025);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      const fit = (str, px) => { g.font = `${px}px Hand`; const mw = g.measureText(str).width; return mw > pw * .86 ? Math.floor(px * pw * .86 / mw) : px; };
      g.fillStyle = '#2a2320'; g.font = `${fit('Dave + Sue:', Math.round(ph * .17))}px Hand`; g.fillText('Dave + Sue:', 0, -ph * .27);
      g.fillStyle = '#c4302a'; const p2 = fit('NOT the same', Math.round(ph * .2)); g.font = `${p2}px Hand`; g.fillText('NOT the same', 0, ph * .02);
      g.fillText('table!!', 0, ph * .29);
      g.restore();
    },
  });
}

// ---------------------------------------------------------------- the town square
// The square as a painted flat, standing across the far side at z, its ground line on the floor:
// the fronts of the four places, the bunting, the low sun behind. `width` is in cm, so the flat
// is the same size to every camera. Returns where its sun is on screen.
export const SQUARE = { z: -1500, width: 1520, base: 1030 };
export function squarePlane(L, c, o = {}) {
  const b = BACK['bg-square'];
  if (!b) return null;
  const cm = (o.width ?? SQUARE.width) / b.w, Z = o.z ?? SQUARE.z, top = (o.base ?? SQUARE.base) * cm, left = -b.w * cm / 2;
  const p0 = project(c, [left, top, Z]), px = project(c, [left + b.w * cm, top, Z]), py = project(c, [left, top - b.h * cm, Z]);
  if (p0.z < c.near) return null;
  const t0 = L.getTransform();
  L.save();
  L.setTransform(t0.a * (px.x - p0.x) / b.w, t0.a * (px.y - p0.y) / b.w, t0.a * (py.x - p0.x) / b.h, t0.a * (py.y - p0.y) / b.h, t0.a * p0.x + t0.e, t0.a * p0.y + t0.f);
  L.drawImage(b.img, 0, 0);
  L.restore();
  return project(c, [left + b.sun[0] * cm, top - b.sun[1] * cm, Z]);
}

// The people the band built for, outside the box, come to the glass: Rosa, Gran, a parent, Jess
// at the front, and the town behind them, the square beyond. o.joy: they bounce with the band.
const FOUR_AT_GLASS = [['rosa-stand', -300, -430, 170], ['gran-stand', -105, -470, 156], ['parent-stand', 110, -440, 180], ['jess-stand', 310, -420, 168]];
const TOWN = [['town-1', -640, -980, 168], ['town-2', -470, -1120, 164], ['town-3', -320, -900, 170], ['town-7', -170, -1180, 166], ['town-4', 0, -1000, 170],
  ['town-8', 170, -1150, 172], ['town-5', 330, -920, 166], ['town-9', 480, -1100, 164], ['town-11', 640, -960, 170], ['town-6', -560, -800, 160], ['town-10', 560, -780, 150]];
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
