// The world of "Who Lives Here?": the night city, the tower as a lit dollhouse cutaway (every flat
// a life), the glass lift and its car, the quota tube, the lobby, Clawd's basement, the older
// basements beneath, and the screen-space atmosphere. Every frame is a pure function of t and st.
//
// Exports (the contract): drawWorld(g, t, S, st, cam), drawLiftCar(g, t, S, st, o), drawAtmosphere(g,
// t, S, st, cam), init(S). Extras sections may use: drawLiftFront (glass and posts over Clawd),
// drawDirectory (the lobby board anywhere, at any scale), roomRect / doorRect / residentAt (where
// things are), GOLD_FROM (each resident's device and face, for aiming effects).
//
// Optional st fields read here (all default off): st.lift.from (style fading out, default 'plain'),
// st.lift.buttons (array of lit floor buttons), st.fuseNote (0..1 "diags pls" note on the fuse box),
// st.fuseLabel (0..1 the rewritten label glows), st.lockerOpen (0..1 courier locker door),
// st.lockersGold (0..1; also read from st.flats['1R'].gold), st.letterbox (0..1 flap open),
// st.capsule ({ p: 0..1 up the chute pipe }), st.directoryGlint (0..1 sweep), st.lob (0..1 the old
// builders' throw), st.flats[id].served for every resident, including '9R' (you tap the phone).
// st.youPause (0..1) freezes your curl mid-rep, blind shadow included. st.clawdLine (0..1, default
// st.baseWindow) writes the directory's CLAWD line left to right. st.quotaY (a screen y, 1080x1920
// frame) places the quota readout; otherwise it parks at 38-58% of the frame height.
// Debug: set st._prof = [] to collect per-stage timings (forces a flush between stages).

import { W, H, clamp01, lerp, smooth, easeOut, between } from '../../lib/stage.js';
import * as P from './plan.js';
import * as cast from './cast.js';

const TAU = Math.PI * 2;
const PAL = P.PAL, OUT = PAL.outline, F = P.FONTS;
const SH = P.SHAFT;
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const frac = x => x - Math.floor(x);
const tri = x => 1 - Math.abs(2 * frac(x) - 1);          // 0..1..0 triangle wave
const pulse = (t, period, dur, ph = 0) => { const u = frac((t + ph) / period) * period; return u < dur ? Math.sin(Math.PI * u / dur) : 0; };

// ---------- colour ----------
const _rgb = new Map();
function rgb(c) {
  let v = _rgb.get(c);
  if (!v) { const n = parseInt(c.slice(1), 16); v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; _rgb.set(c, v); }
  return v;
}
const rgba = (c, a) => { const v = rgb(c); return `rgba(${v[0]},${v[1]},${v[2]},${clamp(a, 0, 1).toFixed(3)})`; };
function mix(a, b, p) {
  const A = rgb(a), B = rgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * p)},${Math.round(A[1] + (B[1] - A[1]) * p)},${Math.round(A[2] + (B[2] - A[2]) * p)})`;
}
function mixHex(a, b, p) {
  const A = rgb(a), B = rgb(b), h = x => Math.round(x).toString(16).padStart(2, '0');
  return '#' + h(A[0] + (B[0] - A[0]) * p) + h(A[1] + (B[1] - A[1]) * p) + h(A[2] + (B[2] - A[2]) * p);
}

// ---------- drawing helpers ----------
function mk(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(Math.max(1, w), Math.max(1, h));
  const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c;
}
function inked(g, fill, lw = 3) {
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (lw) { g.lineWidth = lw; g.strokeStyle = OUT; g.stroke(); }
}
function box(g, x, y, w, h, fill, lw = 3, r = 0) { g.beginPath(); if (r) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); inked(g, fill, lw); }
function circ(g, x, y, r, fill, lw = 3) { g.beginPath(); g.arc(x, y, Math.max(0.1, r), 0, TAU); inked(g, fill, lw); }
function ell(g, x, y, rx, ry, fill, lw = 3, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); inked(g, fill, lw); }
function poly(g, pts, fill, lw = 3) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath(); inked(g, fill, lw);
}
function seg(g, x1, y1, x2, y2, col, w, cap = 'round') {
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineCap = cap; g.strokeStyle = col; g.lineWidth = w; g.stroke();
}
// A thick round limb with a bold outline (two strokes), through points [x0,y0,x1,y1,...].
function limb(g, pts, w, col, lw = 3) {
  g.beginPath(); g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (lw) { g.strokeStyle = OUT; g.lineWidth = w + lw * 2; g.stroke(); }
  g.strokeStyle = col; g.lineWidth = w; g.stroke();
}
function txt(g, s, x, y, size, col, o = {}) {
  g.font = `${o.weight || 700} ${size}px ${o.font || F.display}`;
  g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle';
  if (o.stroke) { g.lineJoin = 'round'; g.lineWidth = o.stroke; g.strokeStyle = o.strokeCol || OUT; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y);
}
function glow(g, x, y, r, col, a, mode = 'lighter') {
  if (a <= 0.004 || r <= 0) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(col, a)); gr.addColorStop(0.35, rgba(col, a * 0.5)); gr.addColorStop(1, rgba(col, 0));
  const op = g.globalCompositeOperation; g.globalCompositeOperation = mode;
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.globalCompositeOperation = op;
}
function sparkle(g, x, y, r, col, a) {
  if (a <= 0.01) return;
  g.globalAlpha = a; g.fillStyle = col; g.beginPath();
  g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill(); g.globalAlpha = 1;
}
function ik(ax, ay, bx, by, l1, l2, bend) {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 0.001;
  const dm = Math.min(d, l1 + l2 - 0.01), ang = Math.atan2(dy, dx);
  const A = Math.acos(clamp((l1 * l1 + dm * dm - l2 * l2) / (2 * l1 * dm), -1, 1));
  return [ax + Math.cos(ang + bend * A) * l1, ay + Math.sin(ang + bend * A) * l1];
}
// 0..1: how far a world y sits below the top 120 px of the frame (the corner marks live there).
function topFade(g, wy) {
  const m = g.getTransform(), k = g.canvas.width / W, sy = (m.d * wy + m.f) / k;
  return clamp01((sy - 90) / 50);
}
function safe(g, fn) { g.save(); try { fn(); } catch (e) { /* another builder's module is mid-change */ } g.restore(); }

// ---------- geometry the sections may use ----------
const LAND_W = 104, ROOM_W = 312;
export function roomRect(k, side) {
  const y = P.floorTop(k) + 26, h = P.floorLevel(k) - y;
  return { x: side === 'L' ? 12 : 756, y, w: ROOM_W, h };
}
export function doorRect(k, side) {
  const y = P.floorLevel(k) - 220;
  return { x: side === 'L' ? SH.x0 - 84 : SH.x1 + 14, y, w: 70, h: 220 };
}
// Each resident's device and face in room-local coordinates (x from the room's left, y up from its
// floor is negative). residentAt(id) converts to world: { x, y } of the face, { dx, dy } of the device.
export const GOLD_FROM = {};
export function residentAt(id) {
  const m = /^(\d+)([LR])$/.exec(id); if (!m) return null;
  const r = roomRect(+m[1], m[2]), a = GOLD_FROM[id] || [[150, -120], [150, -150]];
  return { x: r.x + a[1][0], y: r.y + r.h + a[1][1], dx: r.x + a[0][0], dy: r.y + r.h + a[0][1] };
}

// ---------- caches ----------
const C = { ready: false };
let VIEW_Z = 1;   // the current camera zoom, for level of detail inside helpers
export async function init(S) { build(); await toBitmaps(); }
// Static caches become ImageBitmaps so the browser keeps them as textures instead of re-uploading.
async function toBitmaps() {
  if (typeof createImageBitmap === 'undefined' || C.bitmaps) return;
  C.bitmaps = true;
  try {
    for (const L of C.city) L.c = await createImageBitmap(L.c);
    C.stars = await createImageBitmap(starLayer());
    C.moon = await createImageBitmap(moonImg());
    if (C.beam) C.beam.c = await createImageBitmap(C.beam.c);
  } catch (e) { /* keep the canvases */ }
}
function build() {
  if (C.ready) return;
  C.city = CITY.map(makeCityLayer);
  C.grain = makeGrain(384);
  C.bloomA = mk(8, 8); C.bloomB = mk(8, 8);
  try { wordBeam(); } catch (e) { /* fonts not ready: built on first use */ }
  C.ready = true;
}

// ---------- the city (three parallax layers, cached) ----------
const CITY = [
  { k: 0.2, res: 0.24, x0: -7800, x1: 8800, hmin: 900, hmax: 6000, wmin: 240, wmax: 600, body: '#1B2452', rim: '#2B3670', win: 0.22, winA: 0.5, seed: 11 },
  { k: 0.36, res: 0.32, x0: -5000, x1: 6000, hmin: 700, hmax: 4200, wmin: 170, wmax: 460, body: '#141B42', rim: '#232D5E', win: 0.28, winA: 0.72, seed: 23 },
  { k: 0.58, res: 0.44, x0: -3400, x1: 4400, hmin: 480, hmax: 2700, wmin: 150, wmax: 380, body: '#0F1534', rim: '#1E2752', win: 0.32, winA: 0.95, seed: 37 },
];
const WARM = ['#F4C77A', '#FFD9A3', '#E9A860', '#F7B863', '#FFE3B0', '#F4C77A', '#9FC9FF'];
function makeCityLayer(L) {
  const top = -L.hmax - 700;
  const cw = Math.ceil((L.x1 - L.x0) * L.res), ch = Math.ceil(-top * L.res);
  const c = mk(cw, ch), g = c.getContext('2d');
  g.scale(L.res, L.res); g.translate(-L.x0, -top);
  const lights = [];
  let x = L.x0, i = 0;
  while (x < L.x1) {
    const r1 = hash(L.seed * 977 + i * 1.13), r2 = hash(L.seed * 331 + i * 2.71), r3 = hash(L.seed * 71 + i * 5.3);
    const w = lerp(L.wmin, L.wmax, r1);
    const cl = Math.exp(-(((x - 2700) / 1700) ** 2)) + 0.75 * Math.exp(-(((x + 2100) / 1500) ** 2)) + 0.35 * Math.exp(-(((x - 6500) / 1300) ** 2));
    const h = lerp(L.hmin, L.hmax, clamp(0.12 + 0.3 * r2 + 0.7 * r2 * cl, 0, 1));
    const body = mixHex(L.body, L.rim, 0.25 * r3);
    // body
    g.fillStyle = body; g.fillRect(x, -h, w, h);
    // moonlit rim on the left edge
    g.fillStyle = L.rim; g.fillRect(x, -h, Math.max(6, w * 0.05), h);
    // roof
    const kind = Math.floor(r3 * 5);
    if (kind === 1) { g.fillStyle = body; g.fillRect(x + w * 0.2, -h - h * 0.08, w * 0.6, h * 0.08 + 2); g.fillRect(x + w * 0.35, -h - h * 0.14, w * 0.3, h * 0.07); }
    if (kind === 2 && h > L.hmax * 0.45) {
      g.beginPath(); g.moveTo(x + w * 0.3, -h); g.lineTo(x + w * 0.5, -h - h * 0.12); g.lineTo(x + w * 0.7, -h); g.fill();
      g.strokeStyle = body; g.lineWidth = 8; g.beginPath(); g.moveTo(x + w * 0.5, -h - h * 0.1); g.lineTo(x + w * 0.5, -h - h * 0.12 - 260); g.stroke();
      lights.push([x + w * 0.5, -h - h * 0.12 - 260, r1 * 1.6]);
    }
    if (kind === 3 && L.k > 0.5) {
      g.fillRect(x + w * 0.55, -h - 70, 10, 70); g.fillRect(x + w * 0.55 + 70, -h - 70, 10, 70);
      g.beginPath(); g.roundRect(x + w * 0.5, -h - 170, 100, 110, [40, 40, 8, 8]); g.fill();
    }
    if (kind === 4) { g.beginPath(); g.moveTo(x, -h); g.lineTo(x + w, -h - w * 0.35); g.lineTo(x + w, -h); g.fill(); }
    if (kind === 0 && r2 > 0.5) { g.fillRect(x + w * 0.1, -h - 40, 14, 40); lights.push([x + w * 0.1 + 7, -h - 44, r2 * 1.6]); }
    // windows
    const sp = L.k > 0.5 ? 42 : L.k > 0.3 ? 52 : 64, spv = sp * 1.25;
    const cols = Math.max(1, Math.floor((w - 30) / sp)), rows = Math.floor((h - 60) / spv);
    const ox = x + (w - cols * sp) / 2 + sp * 0.28;
    for (let rr = 0; rr < rows; rr++) for (let cc = 0; cc < cols; cc++) {
      const hv = hash(L.seed * 13 + i * 97.1 + rr * 7.7 + cc * 3.1);
      const wy = -h + 50 + rr * spv, wx = ox + cc * sp;
      if (hv < L.win * (0.6 + 0.8 * hash(i * 3.3 + rr * 0.21))) {
        g.fillStyle = rgba(WARM[Math.floor(hash(hv * 91 + cc) * WARM.length)], L.winA * (0.55 + 0.45 * hash(hv * 17)));
      } else g.fillStyle = rgba('#0A0F26', 0.35);
      g.fillRect(wx, wy, sp * 0.44, spv * 0.46);
    }
    x += w + (r2 < 0.22 ? 30 + r3 * 120 : -r3 * 50);
    i++;
  }
  // haze where the city meets the ground
  g.globalCompositeOperation = 'source-atop';
  const hz = g.createLinearGradient(0, -900, 0, 0);
  hz.addColorStop(0, 'rgba(46,44,94,0)'); hz.addColorStop(1, 'rgba(46,44,94,0.8)');
  g.fillStyle = hz; g.fillRect(L.x0, -900, L.x1 - L.x0, 900);
  g.globalCompositeOperation = 'source-over';
  return { ...L, c, top, lights };
}

function hatchPattern(g) {
  if (!C.hatch) {
    const c = mk(44, 44), h = c.getContext('2d');
    h.strokeStyle = 'rgba(255,255,255,0.035)'; h.lineWidth = 4;
    for (const o of [-44, 0, 44]) { h.beginPath(); h.moveTo(o, 0); h.lineTo(o + 44, 44); h.stroke(); }
    C.hatchC = c;
    C.hatch = g.createPattern(c, 'repeat');
    C.hatch.setTransform(new DOMMatrix([0.5, 0, 0, 0.5, 0, 0]));
  }
  return C.hatch;
}
function earthPattern(g) {
  if (!C.earth) {
    const n = 960, c = mk(n, n), e = c.getContext('2d');
    e.scale(2, 2);
    for (let i = 0; i < 70; i++) {
      const hv = hash(i * 13.37), px = hash(i * 7.1) * 480, py = hash(i * 3.9) * 480;
      for (const [ox, oy] of [[0, 0], [-480, 0], [480, 0], [0, -480], [0, 480]]) {
        const x = px + ox, y = py + oy; if (x < -40 || x > 520 || y < -40 || y > 520) continue;
        ell(e, x, y, 5 + hv * 16, 4 + hv * 9, hv > 0.3 ? '#2E2530' : '#3A2F36', 2, hv * 3);
      }
    }
    C.earthC = c;
    C.earth = g.createPattern(c, 'repeat');
    C.earth.setTransform(new DOMMatrix([0.5, 0, 0, 0.5, 0, 0]));
  }
  return C.earth;
}
function starLayer() {
  if (C.stars) return C.stars;
  const c = mk(W / 2, 480), g = c.getContext('2d');
  g.scale(0.5, 0.5);
  for (let i = 0; i < 260; i++) {
    const x = hash(i * 1.7) * W, y = hash(i * 2.3 + 4) * 940;
    const r = 0.8 + 2 * hash(i * 3.1) ** 3;
    g.globalAlpha = clamp((0.35 + 0.65 * hash(i * 9.9)) * (1 - y / 1000), 0, 1);
    g.fillStyle = hash(i * 7) > 0.85 ? '#FFE3B0' : '#DDE6FF';
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  C.stars = c; return c;
}
function moonImg() {
  if (C.moon) return C.moon;
  const c = mk(260, 260), g = c.getContext('2d'), mx = 130, my = 130;
  glow(g, mx, my, 120, '#FFF1D6', 0.22, 'source-over');
  g.beginPath(); g.arc(mx, my, 62, 0, TAU); g.fillStyle = '#F4EBD3'; g.fill();
  g.fillStyle = 'rgba(160,150,140,0.28)';
  for (const [dx, dy, r] of [[-18, -14, 13], [16, 8, 9], [-6, 22, 7], [22, -22, 6], [-26, 12, 5]]) { g.beginPath(); g.arc(mx + dx, my + dy, r, 0, TAU); g.fill(); }
  g.lineWidth = 3; g.strokeStyle = 'rgba(14,19,40,0.5)'; g.beginPath(); g.arc(mx, my, 62, 0, TAU); g.stroke();
  C.moon = c; return c;
}
function makeGrain(n) {
  const c = mk(n, n), g = c.getContext('2d'), im = g.createImageData(n, n), d = im.data;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = (y * n + x) * 4;
    const fine = hash(x * 12.9898 + y * 78.233) - 0.5;
    const fib = Math.sin(x * 0.21 + Math.sin(y * 0.05) * 3) * Math.sin(y * 0.33 + x * 0.02) * 0.25;
    const blot = Math.sin(x * 0.031 + 1.3) * Math.sin(y * 0.027 + 0.4) * 0.25 + Math.sin((x + y) * 0.013) * 0.15;
    const v = 128 + fine * 46 + fib * 22 + blot * 30;
    d[i] = d[i + 1] = d[i + 2] = clamp(v, 0, 255); d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return c;
}

// ---------- view ----------
function viewOf(cam) {
  const hw = (W / 2) / cam.zoom, hh = (H / 2) / cam.zoom, m = Math.abs(cam.rot || 0) > 0.001 ? 1.25 : 1.02;
  return { x0: cam.x - hw * m, x1: cam.x + hw * m, y0: cam.y - hh * m, y1: cam.y + hh * m, z: cam.zoom };
}
const seen = (V, x0, y0, x1, y1) => x1 > V.x0 && x0 < V.x1 && y1 > V.y0 && y0 < V.y1;

// ===================================================================================================
// drawWorld
// ===================================================================================================
export function drawWorld(g, t, S, st, cam) {
  build();
  const V = viewOf(cam);
  const lod = V.z >= 0.95 ? 2 : V.z >= 0.6 ? 1 : 0;
  const k = g.canvas.width / W;
  VIEW_Z = V.z;
  const prof = st._prof, mark = prof ? name => { g.getImageData(0, 0, 1, 1); prof.push([name, performance.now()]); } : () => {};
  mark('start');
  // the night beyond the tower, in screen space with parallax
  if (!(V.x0 >= -20 && V.x1 <= 1100 && V.y0 >= -3640) && V.y0 < 0) {
    g.save(); g.setTransform(k, 0, 0, k, 0, 0);
    // only where the sky can be seen: above the ground line and outside the tower
    const sx = x => W / 2 + (x - cam.x) * cam.zoom, sy = y => H / 2 + (y - cam.y) * cam.zoom;
    const gy = clamp(sy(0), 0, H), tx0 = clamp(sx(-18), 0, W), tx1 = clamp(sx(1098), 0, W), ty0 = clamp(sy(-3640), 0, gy);
    g.beginPath(); g.rect(0, 0, W, gy); if (tx1 > tx0 && gy > ty0) g.rect(tx0, ty0, tx1 - tx0, gy - ty0); g.clip('evenodd');
    drawBackdrop(g, t, st, cam, V);
    g.restore();
  }
  mark('backdrop');
  g.lineJoin = 'round'; g.lineCap = 'round';
  drawStreet(g, t, st, V, lod);
  drawEarth(g, t, st, V, lod);
  mark('street+earth');
  if (V.y1 > 440) drawStrata(g, t, S, st, V, lod);
  mark('strata');
  drawTowerShell(g, t, st, V, lod);
  mark('shell');
  if (seen(V, -200, -320, 20, 0)) drawEntrance(g, t, V);
  if (seen(V, 12, 0, 1068, 470)) drawBasement(g, t, S, st, V, lod);
  mark('basement');
  drawShaft(g, t, st, V, lod);
  mark('shaft');
  if (seen(V, 0, -360, 1080, 0)) drawLobby(g, t, S, st, V, lod);
  mark('lobby');
  for (let fl = 2; fl <= 10; fl++) for (const side of ['L', 'R']) drawFlat(g, t, S, st, fl, side, V, lod);
  mark('flats');
  if (seen(V, P.DOOR.x - 80, P.DOOR.y - 100, P.DOOR.x + 180, P.DOOR.y + 240)) drawYourDoorExtras(g, t, st, lod);
  drawRoof(g, t, S, st, V, lod);
  drawGoldHalos(g, t, st, V);
  drawPipe(g, t, st, V, lod);
  mark('roof+halos+pipe');
  drawLiftCar(g, t, S, st, { V, lod });
  mark('car');
  drawTube(g, t, st, cam, V, lod);
  mark('tube');
}

// ---------- backdrop: sky, stars, moon, clouds, ground plane, city ----------
function drawBackdrop(g, t, st, cam, V) {
  const z = cam.zoom, cx = cam.x, cy = cam.y;
  const au = st.autumn || 0;
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#040816'); sky.addColorStop(0.22, '#081030'); sky.addColorStop(0.4, PAL.sky0);
  sky.addColorStop(0.47, mix(PAL.sky1, '#3A2E55', 0.2 + 0.2 * au)); sky.addColorStop(0.5, mix('#3B3466', '#6A3E4A', au * 0.6));
  sky.addColorStop(0.505, '#141A38'); sky.addColorStop(1, '#0A0F22');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // stars (fixed to the sky, a whisper of parallax): cached, with a few twinkling live
  const sp = -cy * z * 0.008;
  g.drawImage(starLayer(), 0, sp, W, 960);
  for (let i = 0; i < 26; i++) {
    const x = hash(i * 5.7 + 2) * W, y = hash(i * 8.3 + 1) * 820 + sp, tw = 0.5 + 0.5 * Math.sin(t * (1.3 + hash(i)) + i * 2);
    sparkle(g, x, y, 4 + 4 * hash(i * 3.3), '#EEF2FF', 0.55 * tw * (1 - y / 1000));
  }
  // a shooting star now and then
  for (const ts of [11.3, 46.2, 87.7, 131.6, 175.4]) {
    const u = (t - ts) / 0.7;
    if (u > 0 && u < 1) {
      const x0 = 900 - 520 * u, y0 = 120 + 190 * u + sp;
      const gr = g.createLinearGradient(x0, y0, x0 + 140, y0 - 50);
      gr.addColorStop(0, `rgba(255,248,230,${0.9 * Math.sin(Math.PI * u)})`); gr.addColorStop(1, 'rgba(255,248,230,0)');
      g.strokeStyle = gr; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 140, y0 - 50); g.stroke();
    }
  }
  // moon
  const mx = 205 - (cx - 540) * z * 0.02, my = 330 + sp * 2;
  if (my > -120) {
    glow(g, mx, my, 250, '#9FB3FF', 0.15);
    g.drawImage(moonImg(), mx - 130, my - 130, 260, 260);
  }
  // slow clouds
  g.fillStyle = 'rgba(40,52,100,0.35)';
  for (let i = 0; i < 5; i++) {
    const cxl = ((hash(i * 9.1) * 1600 + t * (6 + 5 * hash(i))) % 1700) - 300, cyl = 140 + hash(i * 4.4) * 520 + sp * 1.5;
    for (let j = 0; j < 5; j++) { g.beginPath(); g.ellipse(cxl + j * 46 - 90, cyl + Math.sin(j * 1.7 + i) * 10, 70 - Math.abs(j - 2) * 12, 26, 0, 0, TAU); g.fill(); }
  }
  // the ground plane beneath the city
  const gy = H / 2 + (0 - cy) * z * 0.12;
  if (gy < H) {
    const gp = g.createLinearGradient(0, gy, 0, H);
    gp.addColorStop(0, '#2A2A56'); gp.addColorStop(0.08, '#121834'); gp.addColorStop(1, '#0B1024');
    g.fillStyle = gp; g.fillRect(0, gy, W, H - gy);
  }
  // city layers, far to near
  for (const L of C.city) {
    const s = z * L.k;
    const dx = W / 2 + (L.x0 - cx) * s, dy = H / 2 + (L.top - cy) * s;
    const dw = (L.x1 - L.x0) * s, dh = -L.top * s;
    if (dy > H || dy + dh < 0) continue;
    g.drawImage(L.c, dx, dy, dw, dh);
    for (const [lx, ly, ph] of L.lights) {
      const on = frac(t / 1.7 + ph) < 0.18;
      if (!on) continue;
      const sx = W / 2 + (lx - cx) * s, sy = H / 2 + (ly - cy) * s;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H) continue;
      glow(g, sx, sy, 14, '#FF4A4A', 0.9);
    }
    // street lamps between this layer and the next
    const ks = L.k + 0.12, s2 = z * ks, by = H / 2 + (0 - cy) * s2;
    if (by > 0 && by < H + 40) {
      for (let i = -30; i < 40; i++) {
        const lx = i * 300 + (L.seed % 7) * 40, sx = W / 2 + (lx - cx) * s2;
        if (sx < -10 || sx > W + 10) continue;
        glow(g, sx, by - 90 * s2, 26 * Math.max(0.6, s2 * 1.4), '#FFC98A', 0.55);
      }
    }
  }
}

// ---------- street level outside the tower ----------
function drawStreet(g, t, st, V, lod) {
  if (!seen(V, -3000, -700, 4100, 20)) return;
  const au = st.autumn || 0;
  // pavement and kerb
  g.fillStyle = '#262C4C'; g.fillRect(-9000, -14, 18000, 14);
  g.fillStyle = '#3A4168'; g.fillRect(-9000, -16, 18000, 4);
  // lamp posts
  for (const lx of [-270, 1350, -1500, 2600]) {
    if (!seen(V, lx - 200, -500, lx + 200, 0)) continue;
    glow(g, lx, -300, 300, PAL.lamp, 0.22);
    glow(g, lx, -8, 160, PAL.lamp, 0.18);
    box(g, lx - 6, -330, 12, 316, '#1A1F38', 3);
    box(g, lx - 22, -360, 44, 36, '#1A1F38', 3, 6);
    box(g, lx - 14, -352, 28, 22, '#FFE0A8', 2, 3);
    glow(g, lx, -340, 60, '#FFE0A8', 0.6);
  }
  // trees, turning with the season
  for (const [tx, sc] of [[-620, 1.1], [1700, 1], [-2100, 0.9], [3000, 1.05]]) {
    if (!seen(V, tx - 250, -700, tx + 250, 0)) continue;
    box(g, tx - 14 * sc, -260 * sc, 28 * sc, 250 * sc, '#1C1622', 3);
    const leaf = mix('#173A36', '#C4652A', au), leaf2 = mix('#21504A', '#E08A35', au);
    for (let j = 0; j < 6; j++) {
      const a = j / 6 * TAU + 0.3, r = 70 * sc;
      circ(g, tx + Math.cos(a) * r * 0.9 + Math.sin(t * 0.8 + j) * 3, -330 * sc + Math.sin(a) * r * 0.6, 62 * sc, j % 2 ? leaf : leaf2, 3);
    }
    circ(g, tx, -350 * sc, 72 * sc, leaf2, 3);
    glow(g, tx - 40, -380 * sc, 120, PAL.lamp, 0.08);
  }
  // a fox on its rounds
  if (lod >= 1 || V.z > 0.35) {
    const fx = -2400 + frac(t / 70) * 5600;
    if (seen(V, fx - 60, -60, fx + 60, 0) && (fx < -30 || fx > 1110)) fox(g, fx, -14, t);
  }
}
// The entrance: a canopy and a lit glass door in the lobby's outer wall.
function drawEntrance(g, t, V) {
  glow(g, -90, -240, 190, PAL.lamp, 0.28);
  box(g, -190, -296, 190, 20, '#3B2A2A', 3);
  for (let i = 0; i < 6; i++) seg(g, -182 + i * 30, -276, -170 + i * 30, -262, '#8A3B3B', 8, 'butt');
  seg(g, -180, -276, -180, -14, '#1A1F38', 5);
  box(g, -20, -250, 32, 236, '#1A1F38', 3);
  box(g, -15, -244, 22, 224, 'rgba(255,217,163,0.55)', 2);
  seg(g, -4, -150, -4, -110, '#C9A24E', 3);
  box(g, -150, -14, 150, 8, '#5A3A3A', 2);
  txt(g, '1', -95, -286, 14, '#E9E1CF', { weight: 800 });
}
function fox(g, x, y, t) {
  const b = Math.sin(t * 9) * 2;
  g.save(); g.translate(x, y);
  limb(g, [-14, -18, -18 + Math.sin(t * 9) * 5, 0], 5, '#2A1A14', 2);
  limb(g, [14, -18, 18 - Math.sin(t * 9) * 5, 0], 5, '#2A1A14', 2);
  ell(g, 0, -24 + b, 26, 11, '#D9772F', 2.5);
  limb(g, [-24, -26 + b, -44, -34 + b, -54, -24 + b], 9, '#D9772F', 2.5);
  circ(g, -56, -24 + b, 5, '#F3E6D0', 0);
  poly(g, [22, -30 + b, 40, -34 + b, 46, -26 + b, 30, -18 + b], '#D9772F', 2.5);
  poly(g, [28, -32 + b, 32, -44 + b, 36, -32 + b], '#D9772F', 2);
  circ(g, 37, -29 + b, 1.8, OUT, 0);
  g.restore();
}

// ---------- the earth the tower stands in ----------
function drawEarth(g, t, st, V, lod) {
  if (V.y1 < 0) return;
  const y1 = 3400;
  const eg = g.createLinearGradient(0, 0, 0, 2400);
  eg.addColorStop(0, '#221B26'); eg.addColorStop(0.4, '#1B1520'); eg.addColorStop(1, '#130F17');
  g.fillStyle = eg; g.fillRect(V.x0 - 10, 0, V.x1 - V.x0 + 20, y1);
  // soil bands
  g.strokeStyle = 'rgba(70,52,60,0.35)'; g.lineWidth = 10;
  for (let b = 0; b < 14; b++) {
    const by = 120 + b * 190;
    if (by < V.y0 - 60 || by > V.y1 + 60) continue;
    g.beginPath();
    for (let x = Math.floor(V.x0 / 80) * 80; x <= V.x1 + 80; x += 80) g.lineTo(x, by + Math.sin(x * 0.004 + b) * 18 + Math.sin(x * 0.013 + b * 3) * 6);
    g.stroke();
  }
  // pebbles
  if (lod >= 1) {
    const cs = 150;
    g.fillStyle = '#2E2530';
    for (let gx = Math.floor(V.x0 / cs); gx <= Math.ceil(V.x1 / cs); gx++) for (let gy = Math.max(0, Math.floor(V.y0 / cs)); gy <= Math.ceil(V.y1 / cs); gy++) {
      const hv = hash(gx * 31.7 + gy * 17.3);
      if (hv > 0.5) continue;
      const px = gx * cs + hash(hv * 91) * cs, py = gy * cs + hash(hv * 37) * cs;
      if (py < 24 || (px > -20 && px < 1100 && py < 2010)) continue;
      g.beginPath(); g.ellipse(px, py, 5 + hv * 16, 4 + hv * 9, hv * 3, 0, TAU); g.fill();
    }
  }
  // buried things (a second-watch reward)
  const fossils = [[-360, 700, 'phone'], [-300, 1250, 'floppy'], [1380, 1180, 'floppy'], [1320, 1760, 'card'], [-420, 1840, 'card'], [1450, 620, 'phone']];
  for (const [fx, fy, kind] of fossils) {
    if (!seen(V, fx - 60, fy - 60, fx + 60, fy + 60)) continue;
    g.save(); g.translate(fx, fy); g.rotate(hash(fx) - 0.5); g.globalAlpha = 0.55;
    if (kind === 'floppy') { box(g, -30, -30, 60, 60, '#4A4050', 3, 3); box(g, -16, -30, 32, 20, '#6A6070', 2); box(g, -20, 6, 40, 20, '#7A7080', 2); }
    if (kind === 'card') { box(g, -46, -20, 92, 40, '#6A5E4A', 3, 2); for (let i = 0; i < 9; i++) box(g, -38 + i * 9, -10 + (i % 3) * 8, 4, 6, '#2A2226', 0); }
    if (kind === 'phone') { box(g, -16, -30, 32, 60, '#3C3444', 3, 7); box(g, -12, -24, 24, 44, '#241E2A', 0, 3); }
    g.restore();
  }
  // a service pipe and a cable duct beside the basement
  if (seen(V, -500, 100, -250, 350)) { circ(g, -380, 240, 46, '#2C2A36', 4); circ(g, -380, 240, 30, '#141018', 3); }
  if (seen(V, 1150, 60, 1450, 200)) { box(g, 1150, 110, 300, 34, '#2C2A36', 3, 8); }
}

// ---------- the tower's structure (cut faces) ----------
function drawTowerShell(g, t, st, V, lod) {
  const top = P.ROOF_Y, bot = 470;
  if (!seen(V, -30, top - 60, 1110, bot)) return;
  // body: walls and slabs
  g.fillStyle = PAL.tower; g.fillRect(-18, top, 1116, bot - top);
  // slab bands (walking surface on top)
  for (let fl = 1; fl <= P.FLOORS + 1; fl++) {
    const y = P.floorLevel(fl);
    if (y < V.y0 - 40 || y > V.y1 + 40) continue;
    g.fillStyle = PAL.slab; g.fillRect(-18, y, 1116, fl === 1 ? 16 : 26);
    g.fillStyle = 'rgba(255,217,163,0.08)'; g.fillRect(-18, y, 1116, 3);
  }
  // section hatching on the cut faces

  // brick courses on the outer walls
  if (lod >= 2) {
    g.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = Math.max(top, Math.floor(V.y0 / 16) * 16); y < Math.min(bot, V.y1); y += 16) { g.fillRect(-18, y, 30, 2); g.fillRect(1068, y, 30, 2); }
  }
  g.lineWidth = 6; g.strokeStyle = OUT; g.strokeRect(-18, top, 1116, bot - top);
}

// ===================================================================================================
// People and animals (papercut kit)
// ===================================================================================================
// A papercut person. x, y is the hip joint; targets (hl, hr hands; fl, fr feet) are absolute points
// in the same space. face: 1 right, -1 left. hs: hair style.
function person(g, o) {
  const s = o.s ?? 1, f = o.face ?? 1, lw = 3 * clamp(s, 0.75, 1.1);
  const lean = o.lean ?? 0, sn = Math.sin(lean), cs = Math.cos(lean);
  const hx = o.x, hy = o.y;
  const at = (lx, ly) => [hx + lx * cs - ly * sn, hy + lx * sn + ly * cs];
  const T = 54 * s, hr = (o.hr ?? 21) * s;
  const skin = o.skin ?? '#E3AE87', top = o.top ?? '#C8553D', bot = o.bot ?? '#34406B', shoe = o.shoe ?? '#20202E';
  const sil = o.sil;   // silhouette colour: everything one tone
  const c = col => sil || col;
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (!o.noLegs) for (const side of [-1, 1]) {
    const hip = at(side * 7 * s, 0);
    const ft = (side < 0 ? o.fl : o.fr) ?? [hx + side * 9 * s, hy + 74 * s];
    const kn = ik(hip[0], hip[1], ft[0], ft[1], 38 * s, 38 * s, o.knees ?? -f);
    limb(g, [hip[0], hip[1], kn[0], kn[1], ft[0], ft[1]], 14 * s, c(o.legCol ?? bot), sil ? 0 : lw);
    if (!o.noShoes) ell(g, ft[0] + f * 5 * s, ft[1] + 1 * s, 10 * s, 5.5 * s, c(shoe), sil ? 0 : lw);
  }
  const arms = () => {
    for (const side of [-1, 1]) {
      const sh = at(side * 13 * s, -T + 9 * s);
      const tgt = (side < 0 ? o.hl : o.hrt) ?? [sh[0] + side * 5 * s, sh[1] + 56 * s];
      const bend = side < 0 ? (o.bendL ?? f) : (o.bendR ?? f);
      const el = ik(sh[0], sh[1], tgt[0], tgt[1], 30 * s, 29 * s, bend);
      limb(g, [sh[0], sh[1], el[0], el[1], tgt[0], tgt[1]], 10.5 * s, c(o.sleeve ?? top), sil ? 0 : lw);
      circ(g, tgt[0], tgt[1], 6.3 * s, c(skin), sil ? 0 : lw * 0.8);
    }
  };
  if (o.armsBehind) arms();
  // torso
  g.save(); g.translate(hx, hy); g.rotate(lean);
  g.beginPath();
  g.moveTo(-13 * s, 7 * s);
  g.bezierCurveTo(-15 * s, -18 * s, -19 * s, -T + 22 * s, -17 * s, -T + 8 * s);
  g.quadraticCurveTo(0, -T - 5 * s, 17 * s, -T + 8 * s);
  g.bezierCurveTo(19 * s, -T + 22 * s, 15 * s, -18 * s, 13 * s, 7 * s);
  g.closePath(); inked(g, c(top), sil ? 0 : lw);
  if (o.torso && !sil) o.torso(g, s, T);
  g.restore();
  // head
  const nk = at(0, -T), a = lean + (o.tilt ?? 0);
  const hc = [nk[0] + Math.sin(a) * hr * 0.9, nk[1] - Math.cos(a) * hr * 0.9];
  head(g, hc[0], hc[1], hr, { ...o, skin: c(skin), hair: c(o.hair ?? '#2A1E1A'), sil, lw, f, a });
  if (!o.armsBehind) arms();
  return { head: hc, neck: nk };
}
function head(g, x, y, r, o) {
  const f = o.f ?? o.face ?? 1, lw = o.lw ?? 3, hs = o.hs ?? 'short', hair = o.hair ?? '#2A1E1A', sil = o.sil;
  if (sil) o = { ...o, capCol: sil };
  g.save(); g.translate(x, y); if (o.a) g.rotate(o.a);
  // hair behind
  if (hs === 'long') { g.beginPath(); g.roundRect(-r * 1.12, -r * 0.95, r * 2.24, r * 2.45, r * 0.9); inked(g, hair, sil ? 0 : lw); }
  if (hs === 'bob') { g.beginPath(); g.roundRect(-r * 1.16, -r * 0.98, r * 2.32, r * 1.85, [r, r, r * 0.4, r * 0.4]); inked(g, hair, sil ? 0 : lw); }
  if (hs === 'pony' || hs === 'you') ell(g, -f * r * 1.02, r * 0.1, r * 0.34, r * 0.95, hair, sil ? 0 : lw, f * 0.45);
  if (hs === 'bun') circ(g, -f * r * 0.15, -r * 1.02, r * 0.45, hair, sil ? 0 : lw);
  if (hs === 'afro' || hs === 'curly') for (let i = 0; i < 9; i++) { const aa = Math.PI * (0.95 + i * 0.14); circ(g, Math.cos(aa) * r * 0.98, Math.sin(aa) * r * 0.9 - r * 0.08, r * (hs === 'afro' ? 0.52 : 0.4), hair, sil ? 0 : lw); }
  if (hs === 'pigtails') { for (const sd of [-1, 1]) ell(g, sd * r * 1.08, r * 0.05, r * 0.3, r * 0.55, hair, sil ? 0 : lw, sd * 0.5); }
  // face
  circ(g, 0, 0, r, o.skin, sil ? 0 : lw);
  // hair front
  const cap = (dip = 0.16) => {
    g.beginPath(); g.arc(0, 0, r * 1.04, Math.PI * 1.02, Math.PI * 1.98);
    g.quadraticCurveTo(f * r * 0.35, -r * dip - r * 0.05, -r * 1.02, -r * 0.1);
    g.closePath(); inked(g, hair, sil ? 0 : lw);
  };
  if (['short', 'long', 'bob', 'pony', 'bun', 'pigtails', 'curly', 'you'].includes(hs)) cap(hs === 'bob' ? 0.35 : 0.16);
  if (hs === 'afro') cap(0.3);
  if (hs === 'cap') {
    g.beginPath(); g.arc(0, 0, r * 1.05, Math.PI, TAU); g.closePath(); inked(g, o.capCol ?? '#C8553D', sil ? 0 : lw);
    g.beginPath(); g.ellipse(f * r * 0.95, -r * 0.05, r * 0.7, r * 0.16, 0, 0, TAU); inked(g, o.capCol ?? '#C8553D', sil ? 0 : lw);
  }
  if (hs === 'beanie') { g.beginPath(); g.arc(0, -r * 0.1, r * 1.05, Math.PI, TAU); g.closePath(); inked(g, o.capCol ?? '#5B7FA8', sil ? 0 : lw); box(g, -r * 1.07, -r * 0.3, r * 2.14, r * 0.34, o.capCol ?? '#5B7FA8', sil ? 0 : lw, 3); }
  if (hs === 'wrap') {
    g.beginPath(); g.ellipse(0, -r * 0.62, r * 1.12, r * 0.78, 0, Math.PI * 0.95, Math.PI * 2.05); g.closePath(); inked(g, o.capCol ?? '#E0A13A', sil ? 0 : lw);
    circ(g, f * r * 0.5, -r * 1.2, r * 0.36, o.capCol ?? '#E0A13A', sil ? 0 : lw);
  }
  if (hs === 'bald' && !sil) { g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = r * 0.12; g.beginPath(); g.arc(0, 0, r * 0.7, Math.PI * 1.2, Math.PI * 1.45); g.stroke(); }
  if (sil) { g.restore(); return; }
  // features
  const ex = f * r * 0.18, ey = r * 0.08, es = r * 0.36;
  g.fillStyle = OUT; g.strokeStyle = OUT; g.lineWidth = Math.max(1.4, r * 0.1); g.lineCap = 'round';
  const eyes = o.eyes ?? 'dot';
  for (const sd of [-1, 1]) {
    const exx = ex + sd * es;
    if (eyes === 'shut') { g.beginPath(); g.arc(exx, ey - r * 0.02, r * 0.13, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
    else if (eyes === 'happy') { g.beginPath(); g.arc(exx, ey + r * 0.1, r * 0.14, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    else { g.beginPath(); g.arc(exx, ey, r * (eyes === 'wide' ? 0.16 : 0.12), 0, TAU); g.fill(); }
  }
  if (o.glasses) {
    g.lineWidth = Math.max(1.3, r * 0.08);
    for (const sd of [-1, 1]) { g.beginPath(); g.arc(ex + sd * es, ey, r * 0.27, 0, TAU); if (o.glasses === 'dark') { g.fillStyle = '#15161F'; g.fill(); } g.stroke(); }
    g.beginPath(); g.moveTo(ex - es * 0.3, ey); g.lineTo(ex + es * 0.3, ey); g.stroke();
  }
  if (o.blush !== false) { g.fillStyle = 'rgba(240,120,120,0.4)'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(ex + sd * r * 0.55, ey + r * 0.32, r * 0.17, 0, TAU); g.fill(); } }
  const m = o.mouth ?? 'smile', mx = ex, my = r * 0.46;
  g.strokeStyle = OUT; g.lineWidth = Math.max(1.3, r * 0.09);
  if (m === 'smile') { g.beginPath(); g.arc(mx, my - r * 0.14, r * 0.2, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
  if (m === 'flat') { g.beginPath(); g.moveTo(mx - r * 0.14, my); g.lineTo(mx + r * 0.14, my); g.stroke(); }
  if (m === 'o') { g.beginPath(); g.arc(mx, my, r * 0.1, 0, TAU); g.fillStyle = '#5A1E2A'; g.fill(); }
  if (m === 'laugh' || m === 'grin') {
    g.beginPath(); g.moveTo(mx - r * 0.26, my - r * 0.08); g.quadraticCurveTo(mx, my + r * (m === 'laugh' ? 0.5 : 0.34), mx + r * 0.26, my - r * 0.08); g.closePath();
    g.fillStyle = '#6A1E2A'; g.fill(); g.lineWidth = Math.max(1.2, r * 0.07); g.stroke();
  }
  if (o.mask) { box(g, -r * 0.8, ey - r * 0.25, r * 1.6, r * 0.4, '#7F5A9A', lw * 0.7, r * 0.2); }
  g.restore();
}
function cat(g, x, y, s, t, o = {}) {
  const st = o.stretch ?? 0, col = o.col ?? '#E0914A', dk = o.dk ?? '#B86A2E';
  g.save(); g.translate(x, y); g.scale(s * (o.face ?? 1), s);
  const tail = Math.sin(t * 2.2) * 0.4;
  limb(g, [-22, -14, -34 - 6 * st, -30 + 14 * st, -30 + 10 * tail - 8 * st, -50 + 22 * st], 6, col, 2.5);
  // back legs, front legs (stretch pushes the front paws forward and the chest down)
  limb(g, [-14, -12, -14, 0], 7, dk, 2.5);
  limb(g, [14, -12 + 6 * st, 18 + 18 * st, 0], 7, dk, 2.5);
  g.save(); g.rotate(0.28 * st);
  ell(g, 0, -16, 26 + 6 * st, 13 - 2 * st, col, 2.5);
  g.restore();
  const hx = 24 + 14 * st, hy = -28 + 14 * st;
  poly(g, [hx - 10, hy - 6, hx - 7, hy - 20, hx - 1, hy - 9], col, 2.5);
  poly(g, [hx + 2, hy - 9, hx + 8, hy - 20, hx + 10, hy - 5], col, 2.5);
  circ(g, hx, hy, 11, col, 2.5);
  g.fillStyle = OUT;
  if (st > 0.5) { g.strokeStyle = OUT; g.lineWidth = 1.6; g.beginPath(); g.arc(hx - 2, hy, 2.4, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); g.beginPath(); g.arc(hx + 5, hy, 2.4, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); }
  else { g.beginPath(); g.arc(hx - 2, hy - 1, 1.8, 0, TAU); g.arc(hx + 5, hy - 1, 1.8, 0, TAU); g.fill(); }
  circ(g, hx + 2, hy + 4, 1.4, '#E07A8A', 0);
  g.restore();
}
function dog(g, x, y, s, t, o = {}) {
  const col = '#D9A55B', dk = '#9A6A36';
  g.save(); g.translate(x, y); g.scale(s * (o.face ?? 1), s);
  const wag = Math.sin(t * 16) * 0.6, tilt = Math.sin(t * 0.9) * 0.18 + (o.look ?? 0);
  limb(g, [-24, -30, -42, -44 + wag * 10, -48 + wag * 14, -60 + wag * 8], 7, col, 2.5);
  ell(g, -6, -30, 26, 20, col, 2.5, -0.3);
  limb(g, [-18, -16, -24, 0], 9, col, 2.5);
  limb(g, [10, -26, 12, 0], 8, col, 2.5); limb(g, [20, -26, 22, 0], 8, col, 2.5);
  g.save(); g.translate(16, -54); g.rotate(tilt);
  ell(g, 0, 0, 18, 16, col, 2.5);
  ell(g, 14, 6, 11, 8, '#E9C084', 2.5);
  circ(g, 23, 3, 3.2, OUT, 0);
  if (o.tongue !== false) { g.beginPath(); g.ellipse(15, 15 + Math.sin(t * 8) * 1.5, 4, 6, 0, 0, TAU); g.fillStyle = '#E36A7A'; g.fill(); }
  ell(g, -8, 2, 7, 14, dk, 2.5, 0.25);
  circ(g, 5, -4, 2.4, OUT, 0);
  g.restore();
  g.restore();
}

// ===================================================================================================
// Flats
// ===================================================================================================
const DOOR_COL = {
  '9L': '#3E6B4A', '9R': '#1B2553', '8L': '#5A3B7A', '8R': '#35347A', '7L': '#274060', '7R': '#8E3B2E', '6L': '#2F6B6E',
  '6R': '#D86A8E', '5L': '#4A5570', '5R': '#B08A3E', '4L': '#7E5C86', '4R': '#6B2E3E', '3L': '#3E7A6A', '3R': '#A67A3A',
  '2L': '#3F5A80', '2R': '#B5763A', '10L': '#235A6E', '10R': '#C9A77A',
};
function drawFlat(g, t, S, st, fl, side, V, lod) {
  const id = `${fl}${side}`;
  const yTop = P.floorTop(fl) + 26, yBot = P.floorLevel(fl);
  const LX = side === 'L' ? SH.x0 - 12 - LAND_W : SH.x1 + 12;
  if (!seen(V, side === 'L' ? 0 : 630, yTop - 40, side === 'L' ? 450 : 1080, yBot + 30)) return;
  const f = st.flats[id] || { lit: 1, gold: 0 };
  drawLanding(g, t, st, id, fl, side, LX, yTop, yBot, lod);
  const R = roomRect(fl, side);
  g.save(); g.beginPath(); g.rect(R.x, R.y, R.w, R.h); g.clip();
  g.translate(R.x, yBot);
  if (id === '9R') drawYou(g, t, S, st, f, lod);
  else if (fl === 10) drawTopFlat(g, t, S, st, id, f, lod);
  else drawRoom(g, t, S, st, id, f, lod);
  g.restore();
  // partition between landing and room, and the cut outlines
  const px = side === 'L' ? R.x + R.w : LX + LAND_W;
  g.fillStyle = PAL.tower; g.fillRect(px, yTop, 10, yBot - yTop);
  g.lineWidth = 4; g.strokeStyle = OUT; g.strokeRect(R.x, R.y, R.w, R.h); g.strokeRect(LX, yTop, LAND_W, yBot - yTop);
}

// The landing strip beside the shaft: the flat's front door, its number, a lamp, a small clue.
function drawLanding(g, t, st, id, fl, side, LX, y0, y1, lod) {
  g.save(); g.beginPath(); g.rect(LX, y0, LAND_W, y1 - y0); g.clip();
  const lit = (st.flats[id]?.lit ?? 1), dark = fl === 10 ? 1 - Math.max(st.bots?.molty || 0, st.bots?.jolly || 0) : 0;
  g.fillStyle = '#1D2340'; g.fillRect(LX, y0, LAND_W, y1 - y0);
  g.fillStyle = '#181D36'; g.fillRect(LX, y1 - 110, LAND_W, 84);
  g.fillStyle = '#2C3458'; g.fillRect(LX, y1 - 112, LAND_W, 4);
  g.fillStyle = '#151A30'; g.fillRect(LX, y1 - 26, LAND_W, 26);
  const d = doorRect(fl, side), dc = id === '9R' ? DOOR_COL[id] : mixHex(DOOR_COL[id] || '#444444', '#161A32', 0.38);
  glow(g, d.x + d.w / 2, d.y - 10, 130, PAL.lamp, 0.2 * (1 - dark * 0.8));
  // door
  box(g, d.x - 5, d.y - 5, d.w + 10, d.h + 5, '#1A1F36', 3);
  box(g, d.x, d.y, d.w, d.h, dc, 3);
  if (lod >= 1) {
    box(g, d.x + 9, d.y + 14, d.w - 18, 60, mix(dc, '#000000', 0.18), 2, 3);
    box(g, d.x + 9, d.y + 92, d.w - 18, 110, mix(dc, '#000000', 0.18), 2, 3);
    circ(g, d.x + (side === 'L' ? 12 : d.w - 12), d.y + 118, 4.5, '#D9B45A', 2);
    circ(g, d.x + d.w / 2, d.y + 30, 3, '#10131F', 1.5);
    if (id !== '9R') box(g, d.x + d.w / 2 - 14, d.y + 102, 28, 7, '#C9A24E', 1.5, 2);
    // number plate
    const num = `${fl}${side === 'L' ? 1 : 2}`;
    box(g, d.x + d.w / 2 - 13, d.y + 44, 26, 18, '#D9B45A', 2, 3);
    txt(g, num, d.x + d.w / 2, d.y + 53.5, 12, '#2A1E10', { weight: 800 });
  }
  // sconce
  box(g, d.x + d.w / 2 - 9, d.y - 36, 18, 14, '#D9B45A', 2, [8, 8, 2, 2]);
  circ(g, d.x + d.w / 2, d.y - 24, 5, dark > 0.5 ? '#3A3A48' : '#FFE9C0', 1.5);
  // mat
  box(g, d.x - 6, y1 - 9, d.w + 12, 7, '#6E4A36', 2, 2);
  if (lod >= 1) landingProp(g, t, st, id, side, d, y1);
  if (dark > 0.02) { g.fillStyle = `rgba(4,6,18,${0.72 * dark})`; g.fillRect(LX, y0, LAND_W, y1 - y0); }
  if (lit < 1) { g.fillStyle = `rgba(4,6,18,${(1 - lit) * 0.4})`; g.fillRect(LX, y0, LAND_W, y1 - y0); }
  g.restore();
}
function landingProp(g, t, st, id, side, d, y1) {
  const ox = side === 'L' ? d.x - 22 : d.x + d.w + 16;   // floor spot on the far side of the door from the shaft
  switch (id) {
    case '9R': box(g, ox - 16, y1 - 34, 34, 26, '#2A2F45', 2, 10); seg(g, ox - 8, y1 - 34, ox + 10, y1 - 34, '#4FA3C8', 3); break;
    case '9L': box(g, ox - 12, y1 - 34, 24, 26, '#B0603A', 2, 3); for (let i = 0; i < 4; i++) ell(g, ox - 8 + i * 5, y1 - 44 - (i % 2) * 8, 6, 12, '#3F8A4A', 2, (i - 1.5) * 0.5 + Math.sin(t + i) * 0.1); break;
    case '8L': box(g, ox - 10, y1 - 70, 20, 62, '#E9E1CF', 2, 2); txt(g, 'DEMO', ox, y1 - 40, 7, '#5A3B7A', { weight: 800 }); break;
    case '8R': box(g, ox - 16, y1 - 32, 32, 24, '#B08A5A', 2, 2); break;
    case '7L': limb(g, [ox - 4, y1 - 80, ox + 4, y1 - 10], 4, '#1A1F36', 1.5); ell(g, ox - 4, y1 - 84, 10, 6, '#2A5A8A', 2); break;
    case '7R': for (let i = 0; i < 3; i++) ell(g, ox - 10 + i * 8, y1 - 10, 6 - (i === 2) * 2, 3.5, ['#C8553D', '#2A2F45', '#E9B84A'][i], 1.5); break;
    case '6L': for (let i = 0; i < 5; i++) ell(g, ox - 14 + i * 7, y1 - 10 - (i % 2) * 4, 5, 3, ['#E9E1CF', '#C8553D', '#2A2F45', '#8ACB88', '#E9B84A'][i], 1.5, i); break;
    case '6R': { const bx = d.x + (side === 'L' ? 8 : d.w - 8), by = d.y + 70 - 70 + Math.sin(t * 1.6) * 4; seg(g, bx, d.y + 118, bx + 4, by + 30, '#EDE3CF', 1.5); ell(g, bx + 4, by + 8, 14, 17, '#FFC23D', 2.5); txt(g, '7', bx + 4, by + 9, 16, '#8A2E4A', { weight: 800 }); } break;
    case '5L': for (let i = 0; i < 3; i++) box(g, ox - 16, y1 - 10 - i * 7, 32, 7, '#E0B070', 1.5); break;
    case '5R': box(g, ox - 12, y1 - 38, 24, 30, '#3E6FA8', 2, 6); break;
    case '4L': box(g, ox - 5, y1 - 26, 10, 18, '#F4F1EA', 1.5, 3); box(g, d.x + d.w / 2 - 16, d.y + 76, 32, 12, '#F4F1EA', 1.5, 2); break;
    case '4R': box(g, ox - 8, y1 - 34, 16, 26, '#3A3048', 2, 3); break;
    case '3L': box(g, ox - 12, y1 - 30, 24, 22, '#C9A77A', 2, 3); seg(g, ox - 4, y1 - 30, ox + 6, y1 - 58, '#E0B070', 5); break;
    case '3R': for (let i = 0; i < 6; i++) circ(g, d.x + d.w / 2 - 6 + (i % 2) * 7, d.y + 80 + Math.floor(i / 2) * 6, 1.6, '#D9B45A', 0); break;
    case '2L': box(g, d.x + d.w / 2 - 22, d.y + 70, 44, 26, '#F6EEDC', 2, 3); txt(g, 'shh', d.x + d.w / 2, d.y + 80, 11, PAL.ink, { font: F.hand, weight: 700 }); txt(g, 'night shift', d.x + d.w / 2, d.y + 90, 7, PAL.ink, { font: F.hand }); break;
    case '2R': ell(g, ox, y1 - 12, 12, 5, '#C8553D', 2); seg(g, d.x + (side === 'L' ? -8 : d.w + 8), d.y + 60, d.x + (side === 'L' ? -12 : d.w + 12), d.y + 110, '#C8553D', 3); break;
    default: break;
  }
}

// A room's shared shell: wall, pattern, back window, floor, lamp glow.
function roomShell(g, R, lit, lod, t) {
  const w = ROOM_W, h = 334;
  g.fillStyle = R.wall; g.fillRect(0, -h, w, h);
  if (lod >= 1 && R.pat) {
    g.fillStyle = R.patCol || 'rgba(255,255,255,0.07)';
    if (R.pat === 'stripes') for (let x = 10; x < w; x += 30) g.fillRect(x, -h, 12, h - 26);
    if (R.pat === 'dots') for (let y = -h + 20, r = 0; y < -40; y += 30, r++) for (let x = 12 + (r % 2) * 15; x < w; x += 30) { g.beginPath(); g.arc(x, y, 3.2, 0, TAU); g.fill(); }
    if (R.pat === 'diamonds') for (let y = -h + 24, r = 0; y < -40; y += 34, r++) for (let x = 10 + (r % 2) * 17; x < w; x += 34) { g.beginPath(); g.moveTo(x, y - 7); g.lineTo(x + 6, y); g.lineTo(x, y + 7); g.lineTo(x - 6, y); g.fill(); }
    if (R.pat === 'floral') for (let y = -h + 26, r = 0; y < -40; y += 38, r++) for (let x = 14 + (r % 2) * 19; x < w; x += 38) { for (let p = 0; p < 5; p++) { g.beginPath(); g.arc(x + Math.cos(p * 1.257) * 4.5, y + Math.sin(p * 1.257) * 4.5, 3, 0, TAU); g.fill(); } }
    if (R.pat === 'tiles') { g.strokeStyle = R.patCol || 'rgba(255,255,255,0.12)'; g.lineWidth = 2; for (let y = -h; y < -26; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, -h); g.lineTo(x, -26); g.stroke(); } }
    if (R.pat === 'brick') { g.strokeStyle = R.patCol || 'rgba(0,0,0,0.18)'; g.lineWidth = 2; for (let y = -h, r = 0; y < -26; y += 20, r++) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (r % 2) * 22; x < w; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 20); g.stroke(); } } }
  }
  if (R.win) nightWindow(g, R.win[0], R.win[1], R.win[2], R.win[3], t, R.curtain);
  // floor
  g.fillStyle = R.floor; g.fillRect(0, -26, w, 26);
  g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 2;
  for (let i = 1; i < 9; i++) { g.beginPath(); g.moveTo(i * w / 9 * 0.94 + 9, -26); g.lineTo(i * w / 9, 0); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, -26, w, 3);
  g.fillStyle = mix(R.wall, '#000000', 0.35); g.fillRect(0, -34, w, 8);
  if (R.rug) { g.beginPath(); g.ellipse(R.rug[0], -11, R.rug[1], 9, 0, 0, TAU); inked(g, R.rug[2], 2.5); }
  // lamplight
  const L = R.lamp || [156, -250];
  glow(g, L[0], L[1], L[2] || 250, R.lampCol || PAL.lamp, 0.38 * lit);
}
function nightWindow(g, x, y, w, h, t, curtain) {
  box(g, x - 6, y - 6, w + 12, h + 12, '#5A4636', 3, 3);
  const sk = g.createLinearGradient(0, y, 0, y + h); sk.addColorStop(0, '#0A1030'); sk.addColorStop(1, '#27325F');
  g.fillStyle = sk; g.fillRect(x, y, w, h);
  g.fillStyle = '#DDE6FF';
  for (let i = 0; i < 5; i++) { const sx = x + hash(x + i) * w, sy = y + hash(y + i * 3) * h * 0.7; g.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + i); g.fillRect(sx, sy, 2, 2); }
  g.globalAlpha = 1;
  seg(g, x + w / 2, y, x + w / 2, y + h, '#5A4636', 4, 'butt'); seg(g, x, y + h / 2, x + w, y + h / 2, '#5A4636', 4, 'butt');
  box(g, x - 10, y + h + 2, w + 20, 8, '#6E5646', 2.5, 2);
  if (curtain) { for (const sd of [0, 1]) { const cx = sd ? x + w - 8 : x - 12; g.beginPath(); g.moveTo(cx, y - 12); g.lineTo(cx + 20, y - 12); g.quadraticCurveTo(cx + 14 - sd * 8, y + h * 0.5, cx + 22 - sd * 4, y + h + 4); g.lineTo(cx - 2, y + h + 4); g.closePath(); inked(g, curtain, 2.5); } }
}
// After the contents: ceiling shade, lamplight level, then the gold of being served.
function roomLight(g, t, R, f, beams, lod, seed) {
  const w = ROOM_W, h = 334, lit = clamp01(f.lit ?? 1), gold = clamp01(f.gold || 0);
  const cs = g.createLinearGradient(0, -h, 0, -h + 90); cs.addColorStop(0, 'rgba(5,7,22,0.5)'); cs.addColorStop(1, 'rgba(5,7,22,0)');
  g.fillStyle = cs; g.fillRect(0, -h, w, 90);
  const sd = g.createLinearGradient(0, 0, w, 0); sd.addColorStop(0, 'rgba(5,7,22,0.22)'); sd.addColorStop(0.12, 'rgba(5,7,22,0)'); sd.addColorStop(0.88, 'rgba(5,7,22,0)'); sd.addColorStop(1, 'rgba(5,7,22,0.22)');
  g.fillStyle = sd; g.fillRect(0, -h, w, h);
  if (lit < 1) { g.fillStyle = `rgba(5,7,24,${(1 - lit) * 0.8})`; g.fillRect(0, -h, w, h); }
  if (gold > 0.003) goldFx(g, t, beams, gold, lod, seed);
}
function goldFx(g, t, beams, gold, lod, seed, strength = 1) {
  const w = ROOM_W, h = 334, share = 1 / Math.sqrt(Math.max(1, beams.length));
  g.save();
  g.globalCompositeOperation = 'multiply'; g.fillStyle = rgba('#FFE28E', clamp01(0.55 * gold * strength)); g.fillRect(0, -h, w, h);
  g.globalCompositeOperation = 'soft-light'; g.fillStyle = rgba(PAL.gold, clamp01(0.55 * gold * strength)); g.fillRect(0, -h, w, h);
  g.globalCompositeOperation = 'lighter'; g.fillStyle = rgba('#FF9E1E', 0.07 * gold * strength); g.fillRect(0, -h, w, h);
  if (beams.length) { const p0 = beams[0][1]; glow(g, p0[0], p0[1] + 20, 230, '#FFB84A', 0.3 * gold * strength); }
  const lit = new Set();
  for (const b of beams) {
    const [dx, dy] = b[0], px = b[1][0], py = b[1][1] + (b[2] === 'rings' ? 0 : 16);
    const devKey = `${Math.round(dx)},${Math.round(dy)}`, firstDev = !lit.has(devKey); lit.add(devKey);
    if (b[2] === 'rings') {
      for (let i = 0; i < 4; i++) {
        const u = frac(t * 0.7 + i / 4), r = 14 + u * 150;
        g.strokeStyle = rgba(PAL.goldHi, (1 - u) * 0.85 * gold); g.lineWidth = 6 * (1 - u) + 2;
        g.beginPath(); g.arc(dx, dy, r, 0, TAU); g.stroke();
      }
      glow(g, dx, dy, 90, PAL.gold, 0.6 * gold);
      glow(g, px, py, 90, PAL.gold, 0.35 * gold);
      continue;
    }
    const vx = px - dx, vy = py - dy, len = Math.hypot(vx, vy) || 1, nx = -vy / len, ny = vx / len;
    const w0 = 5, w1 = Math.min(40, b[2] || 40);
    const bg = g.createLinearGradient(dx, dy, px, py);
    bg.addColorStop(0, rgba(PAL.goldHi, 0.75 * gold * share)); bg.addColorStop(0.55, rgba(PAL.gold, 0.3 * gold * share)); bg.addColorStop(1, rgba(PAL.gold, 0.04 * gold * share));
    g.fillStyle = bg; g.beginPath();
    g.moveTo(dx + nx * w0, dy + ny * w0); g.lineTo(px + nx * w1, py + ny * w1); g.lineTo(px - nx * w1, py - ny * w1); g.lineTo(dx - nx * w0, dy - ny * w0);
    g.closePath(); g.fill();
    if (firstDev) glow(g, dx, dy, 34, PAL.goldHi, 0.75 * gold);
    glow(g, (px * 2 + dx) / 3, (py * 2 + dy) / 3, 40, PAL.gold, 0.2 * gold * share);
    const n = lod >= 1 ? 7 : 3;
    for (let i = 0; i < n; i++) {
      const u = frac(t * 0.55 + i / n + seed * 0.13), off = (hash(i * 7 + seed) - 0.5) * 1.6 * (w0 + (w1 - w0) * u);
      sparkle(g, dx + vx * u + nx * off, dy + vy * u + ny * off, 3 + 5 * hash(i + seed) * (1 - Math.abs(u - 0.5)), '#FFF6D8', gold * Math.sin(Math.PI * u));
    }
  }
  const n2 = lod >= 1 ? 6 : 2;
  for (let i = 0; i < n2; i++) {
    const sx = 20 + hash(seed * 11 + i) * 270, sy = -300 + hash(seed * 5 + i * 3) * 250;
    sparkle(g, sx, sy - frac(t * 0.2 + hash(i)) * 30, 4 + 4 * hash(i * 9 + seed), '#FFF1B8', gold * (0.5 + 0.5 * Math.sin(t * 3 + i * 2 + seed)));
  }
  g.restore();
}
// Soft gold light spilling out of served flats onto the facade.
function drawGoldHalos(g, t, st, V) {
  for (let fl = 2; fl <= 10; fl++) for (const side of ['L', 'R']) {
    const id = `${fl}${side}`, f = st.flats[id]; if (!f) continue;
    let gold = clamp01(f.gold || 0);
    if (id === '9R') gold = Math.max(gold, clamp01(st.youGold || 0) * 1.1);
    if (gold < 0.01) continue;
    const R = roomRect(fl, side), cx = R.x + R.w / 2, cy = R.y + R.h / 2;
    if (!seen(V, cx - 400, cy - 400, cx + 400, cy + 400)) continue;
    glow(g, cx, cy, 220 + 40 * gold, PAL.gold, 0.11 * Math.min(gold, 1.1));
  }
}

// ---------- the residents ----------
const ROOMS = {
  '9L': { wall: '#55735A', pat: 'dots', patCol: 'rgba(210,240,200,0.08)', floor: '#7A5236', lamp: [262, -236, 260], win: [36, -292, 104, 110], curtain: '#C98C5A', rug: [200, 110, '#B0603A'] },
  '8L': { wall: '#35295A', floor: '#2A2238', lamp: [160, -310, 260], lampCol: '#F2C6FF' },
  '8R': { wall: '#26275A', floor: '#3A3050', lamp: [170, -170, 230], lampCol: '#C9B2FF' },
  '7L': { wall: '#23405E', pat: 'stripes', patCol: 'rgba(255,255,255,0.05)', floor: '#5A4636', lamp: [60, -230, 230], win: [196, -300, 96, 90], curtain: '#8A6A4A' },
  '7R': { wall: '#9B503A', pat: 'diamonds', patCol: 'rgba(255,220,180,0.1)', floor: '#6B4A34', lamp: [200, -290, 280], rug: [200, 120, '#5E8C5A'] },
  '6L': { wall: '#2C6668', floor: '#4B3A30', lamp: [120, -200, 270] },
  '6R': { wall: '#BF5E7E', pat: 'stripes', patCol: 'rgba(255,230,240,0.1)', floor: '#8A6A4A', lamp: [170, -270, 280] },
  '5L': { wall: '#3C4966', floor: '#394050', lamp: [160, -320, 300], lampCol: '#FFE9C8' },
  '5R': { wall: '#6C6E9E', pat: 'dots', patCol: 'rgba(255,255,255,0.06)', floor: '#6E5038', lamp: [150, -170, 230], rug: [230, 70, '#5B7FA8'] },
  '4L': { wall: '#7A5883', pat: 'floral', patCol: 'rgba(255,220,240,0.12)', floor: '#6A4A38', lamp: [58, -150, 240], rug: [190, 120, '#B0603A'] },
  '4R': { wall: '#682C3D', pat: 'stripes', patCol: 'rgba(255,200,200,0.05)', floor: '#5A3E2E', lamp: [270, -240, 250], win: [30, -300, 84, 100], curtain: '#C9A24E' },
  '3L': { wall: '#44877A', pat: 'tiles', patCol: 'rgba(255,255,255,0.13)', floor: '#6E6A62', lamp: [200, -300, 250] },
  '3R': { wall: '#3E6A80', pat: 'brick', patCol: 'rgba(0,0,0,0.12)', floor: '#5E4632', lamp: [40, -230, 250], win: [200, -300, 90, 96], curtain: '#5B7FA8' },
  '2L': { wall: '#3B5779', floor: '#4A3C34', lamp: [36, -130, 170], lampCol: '#FFC98A', win: [190, -300, 100, 80], curtain: '#2B2F55' },
  '2R': { wall: '#A35E6F', pat: 'dots', patCol: 'rgba(255,255,255,0.08)', floor: '#7A5A3C', lamp: [286, -230, 250], rug: [230, 80, '#C8553D'] },
};
function drawRoom(g, t, S, st, id, f, lod) {
  const R = ROOMS[id]; if (!R) return;
  roomShell(g, R, clamp01(f.lit ?? 1), lod, t);
  const fn = RES[id], sv = clamp01(f.served || 0);
  let beams = [];
  if (fn) beams = fn(g, t, f, sv, st, lod) || [];
  if (beams.length) GOLD_FROM[id] = beams[0];
  roomLight(g, t, R, f, beams, lod, id.charCodeAt(0) * 3 + id.charCodeAt(1));
  if (fn && fn.after) fn.after(g, t, f, sv, st, lod);
}
const SK = ['#F2D2B6', '#E3AE87', '#C68B59', '#A86B4C', '#7A4A30', '#5A3522'];
const RES = {};

// 9L Priya: plants, a cat on the sill, a tablet
RES['9L'] = (g, t) => {
  // shelf of succulents
  box(g, 170, -250, 120, 8, '#6E5646', 2.5);
  for (let i = 0; i < 4; i++) { box(g, 178 + i * 28, -268, 18, 18, ['#C8553D', '#E0A13A', '#F4F1EA', '#5B7FA8'][i], 2, 3); ell(g, 187 + i * 28, -274, 7, 8, '#4E9A5A', 2); }
  // hanging pothos
  const sw = Math.sin(t * 0.9) * 4;
  seg(g, 150, -334, 150 + sw * 0.3, -300, '#2A1E1A', 2);
  box(g, 138 + sw * 0.3, -300, 24, 16, '#E9E1CF', 2, [2, 2, 8, 8]);
  for (let v = 0; v < 3; v++) for (let i = 0; i < 6; i++) {
    const vx = 141 + v * 9 + sw * (0.4 + i * 0.12), vy = -284 + i * 16;
    ell(g, vx + (i % 2 ? 5 : -5), vy, 6, 4, '#4FA35C', 1.6, i % 2 ? 0.6 : -0.6);
  }
  // monstera
  box(g, 20, -54, 44, 34, '#C8653A', 2.5, [3, 3, 8, 8]);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.42 + Math.sin(t * 1.1 + i) * 0.05, L = 70 + (i % 3) * 22;
    const lx = 42 + Math.cos(a) * L, ly = -58 + Math.sin(a) * L;
    seg(g, 42, -56, lx, ly, '#2F6E3A', 3);
    ell(g, lx, ly, 24, 15, i % 2 ? '#3F8A4A' : '#4FA35C', 2.5, a + Math.PI / 2);
  }
  // armchair + Priya with tablet
  box(g, 160, -120, 110, 70, '#C98C5A', 3, 16);
  box(g, 150, -70, 130, 36, '#D9A06A', 3, 10);
  box(g, 150, -80, 22, 54, '#C98C5A', 3, 8); box(g, 258, -80, 22, 54, '#C98C5A', 3, 8);
  const br = Math.sin(t * 1.3) * 1.2, tap = pulse(t, 2.6, 0.5) * 6;
  const tab = [178, -104];
  const P1 = person(g, { x: 215, y: -76 + br, s: 0.92, face: -1, skin: SK[3], hs: 'long', hair: '#1A1212', top: '#D9707A', bot: '#2E5A6B', lean: -0.05,
    fl: [168, -30], fr: [180, -28], hl: [tab[0] - 6, tab[1] + 6], hrt: [tab[0] + 10, tab[1] - 2 - tap], mouth: 'smile' });
  box(g, tab[0] - 16, tab[1] - 14, 30, 22, '#23252F', 2.5, 3);
  box(g, tab[0] - 13, tab[1] - 11, 24, 16, '#9FC9FF', 0, 2);
  // side table + mug
  box(g, 284, -72, 26, 46, '#6E5646', 2.5);
  box(g, 288, -88, 14, 16, '#F4F1EA', 2, 2);
  for (let i = 0; i < 2; i++) { const u = frac(t * 0.5 + i / 2); g.strokeStyle = `rgba(255,255,255,${0.35 * (1 - u)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(294 + i * 4, -92 - u * 30); g.quadraticCurveTo(290 + Math.sin(t * 2 + i) * 6, -100 - u * 30, 296, -108 - u * 30); g.stroke(); }
  // floor lamp (arc)
  seg(g, 300, -26, 300, -200, '#2A2A36', 5); g.beginPath(); g.moveTo(300, -200); g.quadraticCurveTo(300, -250, 268, -244); g.strokeStyle = '#2A2A36'; g.lineWidth = 5; g.stroke();
  poly(g, [252, -246, 284, -246, 278, -228, 258, -228], '#F2C86A', 2.5);
  // the cat on the sill, stretching every few seconds
  const stc = smooth(tri(t / 7) * 1.6 - 0.3);
  cat(g, 84, -178, 0.8, t, { stretch: stc, face: 1, col: '#3A3A48', dk: '#262632' });
  return [[tab, P1.head, 46]];
};

// 8L Dev: a demo on a stage, a facade that turns out to be on studs
RES['8L'] = (g, t, f, sv) => {
  const crowd = smooth(between(sv, 0, 0.25)), fw = smooth(between(sv, 0.12, 0.45)), tilt = smooth(between(sv, 0.55, 0.95));
  // stage
  box(g, 40, -56, 272, 30, '#1E1A2A', 3);
  seg(g, 40, -56, 312, -56, '#C9A24E', 3);
  // bare studs behind the facade
  g.fillStyle = '#35295A'; g.fillRect(70, -312, 236, 250);
  for (let i = 0; i < 6; i++) box(g, 78 + i * 44, -306, 14, 250, '#B8864A', 2.5);
  box(g, 72, -310, 236, 12, '#B8864A', 2.5); box(g, 72, -70, 236, 12, '#B8864A', 2.5);
  seg(g, 86, -80, 290, -296, '#9A6A36', 10); seg(g, 86, -80, 290, -296, OUT, 2);
  box(g, 250, -86, 36, 26, '#6E6A5A', 2.5, 5);  // sandbag
  if (tilt > 0.3) { txt(g, 'FRONT →', 190, -140, 13, '#6A4A2A', { weight: 800, font: F.pixel }); }
  // the dazzling facade, hinged at its left edge
  const fwid = 236 * Math.cos(tilt * 1.25), fx = 70;
  if (fwid > 2) {
    g.save(); g.beginPath(); g.rect(fx, -312, fwid, 250); g.clip();
    g.fillStyle = '#16102A'; g.fillRect(fx, -312, fwid, 250);
    g.save(); g.translate(fx, 0); g.scale(fwid / 236, 1);
    // slide
    const slide = Math.floor(t / 2.2) % 3;
    if (fw < 0.5) {
      if (slide === 0) { txt(g, 'DEMO', 118, -222, 44, '#FFF1B8', { weight: 800 }); txt(g, 'DAY', 118, -178, 44, '#FFC23D', { weight: 800 }); }
      if (slide === 1) { g.strokeStyle = '#8CE08A'; g.lineWidth = 7; g.beginPath(); g.moveTo(30, -110); g.lineTo(80, -140); g.lineTo(120, -130); g.lineTo(200, -250); g.stroke(); poly(g, [200, -250, 184, -238, 200, -232], '#8CE08A', 0); }
      if (slide === 2) { circ(g, 118, -196, 56, '#D97757', 3); txt(g, '✦', 118, -196, 60, '#FFF1B8'); }
    }
    // fireworks
    for (let i = 0; i < 5; i++) {
      const u = frac(t * 0.8 + i * 0.23), cxx = 30 + hash(i * 3.3 + Math.floor(t * 0.8 + i * 0.23)) * 176, cyy = -270 + hash(i * 5.1 + Math.floor(t * 0.8)) * 120;
      const colr = ['#FFC23D', '#FF6A8A', '#8CE0FF', '#FFF1B8', '#B08CFF'][i];
      for (let r = 0; r < 12; r++) { const a = r / 12 * TAU, d = 10 + u * 46; g.globalAlpha = fw * (1 - u); g.fillStyle = colr; g.beginPath(); g.arc(cxx + Math.cos(a) * d, cyy + Math.sin(a) * d + u * u * 16, 3.2, 0, TAU); g.fill(); }
      g.globalAlpha = 1;
    }
    g.restore();
    g.restore();
    g.lineWidth = 3; g.strokeStyle = OUT; g.strokeRect(fx, -312, fwid, 250);
    if (tilt > 0.02) { g.fillStyle = '#C9A77A'; g.fillRect(fx + fwid, -312, 8 * Math.sin(tilt * 1.25), 250); }
  }
  // spotlight on Dev
  g.save(); g.globalCompositeOperation = 'lighter';
  const sp = g.createLinearGradient(0, -334, 0, -56); sp.addColorStop(0, 'rgba(255,240,210,0.25)'); sp.addColorStop(1, 'rgba(255,240,210,0.05)');
  g.fillStyle = sp; g.beginPath(); g.moveTo(150, -334); g.lineTo(186, -334); g.lineTo(240, -56); g.lineTo(96, -56); g.fill(); g.restore();
  // Dev
  const ges = Math.sin(t * 2.4), hop = crowd * Math.abs(Math.sin(t * 5)) * 4;
  const D = person(g, { x: 168, y: -132 - hop, s: 0.95, face: 1, skin: SK[1], hs: 'short', hair: '#6A3E1E', top: '#1E1A2A', bot: '#2A2F45', shoe: '#E9E1CF',
    fl: [160, -58 - hop], fr: [180, -58 - hop], hl: [140 - ges * 6, -196 - crowd * 40 + ges * 8], hrt: [206, -160], mouth: crowd > 0.3 ? 'grin' : 'smile', eyes: crowd > 0.3 ? 'happy' : 'dot',
    torso: (g2, s) => { seg(g2, -6 * s, -44 * s, 0, -8 * s, '#E9E1CF', 3); } });
  seg(g, D.head[0] + 12, D.head[1] + 4, D.head[0] + 22, D.head[1] + 14, '#2A2A36', 2);
  box(g, 203, -166, 8, 14, '#2A2A36', 1.5, 2);
  // lectern + laptop
  box(g, 224, -132, 44, 76, '#2A2238', 3, 3);
  poly(g, [228, -134, 262, -134, 258, -158, 232, -158], '#B8BCC8', 2.5);
  box(g, 234, -156, 22, 18, '#9FC9FF', 0, 2);
  // the crowd filming
  if (crowd > 0.01) {
    for (let i = 0; i < 7; i++) {
      const cx = 14 + i * 44, cy = -2 + Math.sin(t * 4 + i) * 2 * crowd + (1 - crowd) * 60;
      circ(g, cx, cy - 20, 17, i % 2 ? '#1A1626' : '#231C30', 2.5);
      const ph = [cx + (i % 2 ? 10 : -6), cy - 60 - Math.sin(t * 3 + i * 2) * 4];
      seg(g, cx + (i % 2 ? 8 : -4), cy - 8, ph[0], ph[1] + 10, '#1A1626', 7);
      box(g, ph[0] - 7, ph[1] - 11, 14, 22, '#101018', 2, 3);
      box(g, ph[0] - 5, ph[1] - 9, 10, 17, '#E6F0FF', 0, 2);
      if (frac(t * 1.5 + i * 0.3) < 0.5) circ(g, ph[0] + 3, ph[1] - 6, 1.6, '#FF4A4A', 0);
    }
  }
  return [[[245, -148], D.head, 44]];
};

// 8R Kai: streamer; a stadium watching live
RES['8R'] = (g, t, f, sv) => {
  const stad = smooth(between(sv, 0, 0.5));
  // RGB strip
  const hue = (t * 40) % 360;
  g.fillStyle = `hsl(${hue},90%,62%)`; g.fillRect(0, -334, 312, 6);
  g.save(); g.globalCompositeOperation = 'lighter';
  const rg = g.createLinearGradient(0, -334, 0, -250); rg.addColorStop(0, `hsla(${hue},90%,60%,0.3)`); rg.addColorStop(1, `hsla(${hue},90%,60%,0)`);
  g.fillStyle = rg; g.fillRect(0, -334, 312, 84); g.restore();
  // acoustic foam
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) box(g, 16 + i * 24, -300 + j * 24, 20, 20, '#3A3070', 2, 3);
  // wall screen (grows into the stadium)
  const sx = lerp(130, 14, stad), sw = lerp(150, 290, stad), sy = lerp(-290, -318, stad), sh = lerp(92, 176, stad);
  box(g, sx - 4, sy - 4, sw + 8, sh + 8, '#101018', 3, 4);
  g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
  const sg = g.createLinearGradient(0, sy, 0, sy + sh); sg.addColorStop(0, '#1B3A6A'); sg.addColorStop(1, '#0E1A34');
  g.fillStyle = sg; g.fillRect(sx, sy, sw, sh);
  if (stad < 0.5) {
    // the game: a little runner
    g.fillStyle = '#3FA35C'; g.fillRect(sx, sy + sh - 18, sw, 18);
    const rx = sx + frac(t * 0.25) * sw; box(g, rx - 5, sy + sh - 34 - Math.abs(Math.sin(t * 6)) * 10, 10, 14, '#FFC23D', 1.5);
    // chat
    for (let i = 0; i < 4; i++) { const cy = sy + 12 + ((i * 14 - t * 16) % 60 + 60) % 60; g.fillStyle = ['#FF8AB0', '#8CE0FF', '#FFF1B8', '#B08CFF'][i]; g.fillRect(sx + sw - 42, cy, 34 - (i % 2) * 10, 5); }
  } else {
    // stadium tiers, a sea of heads and phone lights
    for (let r = 0; r < 9; r++) {
      const ry = sy + 22 + r * (sh - 30) / 9, n = 14 + r * 2;
      g.fillStyle = r % 2 ? '#2A3E6E' : '#223463'; g.fillRect(sx, ry, sw, (sh - 30) / 9);
      for (let i = 0; i < n; i++) {
        const hx = sx + (i + 0.5) * sw / n, hy = ry + 4 + Math.sin(t * 6 + i + r) * 1.2;
        g.fillStyle = ['#E3AE87', '#A86B4C', '#7A4A30', '#F2D2B6'][(i + r) % 4]; g.beginPath(); g.arc(hx, hy, 2.6, 0, TAU); g.fill();
        if (hash(i * 3 + r * 17 + Math.floor(t * 3)) > 0.85) { g.fillStyle = '#FFFFFF'; g.fillRect(hx - 1, hy - 7, 2.5, 3.5); }
      }
    }
    g.fillStyle = '#3FA35C'; g.fillRect(sx, sy + sh - 12, sw, 12);
  }
  g.restore();
  // live counter
  box(g, sx + 6, sy + 6, 52 + stad * 40, 16, '#E0304A', 0, 3);
  txt(g, stad > 0.5 ? `● LIVE ${Math.floor(12000 + stad * 36210 + t * 7).toLocaleString('en-GB')}` : '● LIVE 3', sx + 10, sy + 14.5, 10, '#FFFFFF', { align: 'left', weight: 800 });
  // desk, monitor, ring light, mic
  box(g, 90, -104, 220, 12, '#1E1A2A', 3);
  box(g, 110, -92, 10, 66, '#1E1A2A', 2.5); box(g, 286, -92, 10, 66, '#1E1A2A', 2.5);
  box(g, 196, -168, 96, 60, '#101018', 3, 4);
  box(g, 200, -164, 88, 52, '#2A5AA8', 0, 2);
  box(g, 236, -110, 16, 8, '#101018', 2);
  circ(g, 60, -250, 28, null, 0); g.lineWidth = 8; g.strokeStyle = '#FFF1D6'; g.beginPath(); g.arc(60, -250, 24, 0, TAU); g.stroke();
  glow(g, 60, -250, 90, '#FFF1D6', 0.25); seg(g, 60, -222, 60, -26, '#2A2A36', 4);
  // Kai in the chair
  box(g, 56, -170, 50, 90, '#C8304A', 3, 12);
  box(g, 64, -82, 36, 10, '#1E1A2A', 2);
  const talk = Math.sin(t * 7) > 0;
  const K = person(g, { x: 92, y: -92, s: 0.9, face: 1, skin: SK[4], hs: 'cap', capCol: '#2A2F45', top: '#F2A65A', bot: '#2A2F45', shoe: '#E9E1CF',
    fl: [128, -30], fr: [138, -28], hl: [168, -108], hrt: [184, -106 + Math.sin(t * 9) * 2], mouth: talk ? 'o' : 'smile' });
  // headset + mic arm
  g.strokeStyle = '#15161F'; g.lineWidth = 4; g.beginPath(); g.arc(K.head[0], K.head[1], 21, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  seg(g, 200, -170, 150, -150, '#15161F', 3); box(g, 142, -156, 12, 16, '#15161F', 1.5, 4);
  return [[[244, -138], K.head, 46]];
};

// 7L Mo: trader; a login that fits
RES['7L'] = (g, t, f, sv) => {
  const lock = smooth(between(sv, 0, 0.35)), ok = smooth(between(sv, 0.45, 0.7));
  // wall of charts
  for (let m = 0; m < 3; m++) {
    const mx = 14 + m * 60, my = -300;
    box(g, mx, my, 56, 44, '#101018', 2.5, 3);
    g.save(); g.beginPath(); g.rect(mx + 3, my + 3, 50, 38); g.clip();
    g.fillStyle = '#0E1A2A'; g.fillRect(mx + 3, my + 3, 50, 38);
    for (let c = 0; c < 8; c++) {
      const up = hash(c * 3 + m + Math.floor(t * 1.5 + c * 0.1)) > (ok > 0.5 ? 0.15 : 0.45);
      const base = my + 24 - (ok * c * 2) + (hash(c + m * 9) - 0.5) * 10, hh = 4 + hash(c * 7 + m) * 10;
      g.fillStyle = up ? '#4ADE80' : '#F05A5A'; g.fillRect(mx + 5 + c * 6, base - hh / 2, 4, hh);
    }
    g.restore();
  }
  // desk
  box(g, 140, -100, 170, 12, '#5A4636', 3);
  box(g, 150, -88, 10, 62, '#5A4636', 2.5); box(g, 292, -88, 10, 62, '#5A4636', 2.5);
  box(g, 176, -126, 24, 26, '#F4F1EA', 2, 3);  // mug
  for (let i = 0; i < 2; i++) { const u = frac(t * 0.6 + i / 2); g.strokeStyle = `rgba(255,255,255,${0.35 * (1 - u)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(184 + i * 6, -130 - u * 26); g.quadraticCurveTo(180 + Math.sin(t * 2 + i) * 6, -140 - u * 26, 188, -150 - u * 26); g.stroke(); }
  box(g, 230, -114, 60, 14, '#2A2A36', 2, 2);  // keyboard
  // Mo standing with phone and coffee
  const tap = Math.sin(t * 5) * 3, sip = pulse(t, 5.5, 1.4, 1);
  const phone = [104 - lock * 6, -196 - lock * 16];
  const M = person(g, { x: 96, y: -94, s: 0.95, face: 1, skin: SK[2], hs: 'short', hair: '#1A1212', top: '#E9E1CF', bot: '#2A2F45', shoe: '#5A3A2A',
    fl: [84, -14], fr: [108, -14 + (tap > 0 ? -tap : 0)], hl: phone, hrt: [128, -128 - sip * 50], mouth: ok > 0.5 ? 'grin' : 'flat', eyes: ok > 0.5 ? 'happy' : 'dot', lean: 0.02,
    torso: (g2, s) => { poly(g2, [-3 * s, -46 * s, 3 * s, -46 * s, 5 * s, -14 * s, 0, -8 * s, -5 * s, -14 * s], '#C8304A', 2); } });
  box(g, phone[0] - 9, phone[1] - 15, 18, 30, '#15161F', 2.5, 4);
  box(g, phone[0] - 7, phone[1] - 12, 14, 22, lock > 0.1 ? '#1E2A48' : '#9FC9FF', 0, 2);
  if (lock > 0.05) {
    // the 2FA prompt that suits him
    const bx = 150, by = -236;
    g.globalAlpha = lock;
    box(g, bx, by - 50, 142, 92, '#F6EEDC', 3, 10);
    circ(g, bx + 30, by - 6, 18, ok > 0.5 ? '#4ADE80' : '#FFC23D', 3);
    txt(g, ok > 0.5 ? '✓' : '🔒', bx + 30, by - 5, ok > 0.5 ? 22 : 16, OUT, { weight: 800 });
    txt(g, ok > 0.5 ? 'secure' : '••• •••', bx + 92, by - 12, ok > 0.5 ? 18 : 16, PAL.ink, { weight: 800 });
    txt(g, ok > 0.5 ? 'just right' : 'code sent', bx + 92, by + 12, 12, '#5A5A6A', { weight: 600 });
    g.globalAlpha = 1;
  }
  return [[phone, M.head, 44]];
};

// 7R the Okafors: subscribers; "renews monthly"; the vault door fits here
RES['7R'] = (g, t, f, sv) => {
  const vault = smooth(between(sv, 0.1, 0.5)), bolt = smooth(between(sv, 0.4, 0.8));
  // family photos
  for (let i = 0; i < 3; i++) { box(g, 150 + i * 42, -300, 32, 26, '#E9D2A8', 2.5, 2); box(g, 154 + i * 42, -296, 24, 18, ['#8AB0D0', '#D0A08A', '#A0C08A'][i], 0); }
  // fridge with its note
  box(g, 8, -250, 72, 224, '#EDE7DA', 3, 8);
  seg(g, 8, -170, 80, -170, OUT, 2.5); seg(g, 70, -236, 70, -186, '#9A9A9A', 3); seg(g, 70, -156, 70, -110, '#9A9A9A', 3);
  for (let i = 0; i < 3; i++) circ(g, 22 + i * 18, -150 + (i % 2) * 70, 5, ['#C8553D', '#FFC23D', '#5B7FA8'][i], 1.5);
  g.save(); g.translate(40, -214); g.rotate(-0.06);
  box(g, -30, -20, 60, 38, '#FFF8D8', 2, 2);
  txt(g, 'renews', 0, -8, 12, PAL.ink, { font: F.hand, weight: 700 }); txt(g, 'monthly ✓', 0, 7, 12, PAL.ink, { font: F.hand, weight: 700 });
  circ(g, 0, -20, 3, '#C8553D', 1); g.restore();
  // the vault door that fits them
  if (vault > 0.01) {
    g.save(); g.translate(114, -262); g.scale(vault, vault);
    circ(g, 0, 0, 34, '#8A8F9A', 3.5); circ(g, 0, 0, 26, '#A9AEB8', 2.5);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t * 0.4; seg(g, 0, 0, Math.cos(a) * 20, Math.sin(a) * 20, '#5A5E68', 4); }
    circ(g, 0, 0, 6, '#FFC23D', 2);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; circ(g, Math.cos(a) * 30, Math.sin(a) * 30, 2.2, '#5A5E68', 0); }
    g.restore();
  }
  // sofa + parents
  box(g, 120, -126, 186, 62, '#3E6FA8', 3, 14);
  box(g, 112, -76, 202, 40, '#5B8FC8', 3, 10);
  box(g, 112, -90, 26, 60, '#3E6FA8', 3, 8); box(g, 288, -90, 26, 60, '#3E6FA8', 3, 8);
  const laugh = pulse(t, 6, 1.2, 2);
  const tablet = [214, -86];
  const A = person(g, { x: 170, y: -84, s: 0.92, face: 1, skin: SK[4], hs: 'wrap', capCol: '#E0A13A', top: '#2F8A6A', bot: '#6A3E6A', fl: [184, -26], fr: [198, -26],
    hl: [196, -98], hrt: [206, -92], mouth: laugh > 0.3 ? 'laugh' : 'smile', eyes: laugh > 0.3 ? 'happy' : 'dot' });
  const B = person(g, { x: 262, y: -84, s: 0.95, face: -1, skin: SK[5], hs: 'short', hair: '#15100E', top: '#B0506A', bot: '#2A2F45', fl: [246, -26], fr: [232, -26],
    hl: [236, -100], hrt: [222, -96], glasses: true, mouth: laugh > 0.4 ? 'grin' : 'smile' });
  // kid on the rug with the tablet
  const kb = Math.abs(Math.sin(t * 3)) * 3;
  const K = person(g, { x: 214, y: -44 - kb, s: 0.62, face: 1, skin: SK[4], hs: 'curly', hair: '#15100E', top: '#FF6A5A', bot: '#3E6FA8', fl: [196, -16], fr: [232, -16],
    hl: [tablet[0] - 10, tablet[1] + 6 - kb], hrt: [tablet[0] + 10, tablet[1] + 6 - kb], mouth: 'grin', eyes: 'happy' });
  g.save(); g.translate(tablet[0], tablet[1] - kb);
  box(g, -18, -14, 36, 26, '#23252F', 2.5, 3); box(g, -14, -11, 28, 19, '#8CE0FF', 0, 2);
  if (bolt > 0.05) { for (const [bx, by] of [[-18, -14], [18, -14], [-18, 12], [18, 12]]) circ(g, bx, by, 3.2 * bolt, '#C9A24E', 1.5); }
  g.restore();
  if (bolt > 0.05) {
    g.globalAlpha = bolt;
    g.save(); g.translate(tablet[0] + 6, tablet[1] - 64);
    g.beginPath(); g.arc(-10, 4, 12, Math.PI * 0.5, Math.PI * 1.5); g.arc(4, -4, 15, Math.PI, Math.PI * 1.9); g.arc(16, 6, 10, Math.PI * 1.5, Math.PI * 0.5); g.closePath(); inked(g, '#FFFFFF', 2.5);
    txt(g, '✓', 2, 3, 15, '#2F8A6A', { weight: 800 });
    g.restore(); txt(g, 'backed up', tablet[0] + 8, tablet[1] - 38, 11, '#FFF6E6', { weight: 800, stroke: 3 });
    g.globalAlpha = 1;
  }
  return [[tablet, K.head, 40], [tablet, A.head, 30], [tablet, B.head, 30]];
};

// 6L the group chat and its cardboard bot
RES['6L'] = (g, t, f, sv) => {
  const set = smooth(between(sv, 0.02, 0.2)), punch = smooth(between(sv, 0.3, 0.42)), howl = smooth(between(sv, 0.38, 0.55));
  // fairy lights
  g.strokeStyle = '#1A1A24'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -318);
  for (let x = 0; x <= 312; x += 26) g.lineTo(x, -318 + Math.sin(x / 312 * Math.PI * 3) * 14 + 10);
  g.stroke();
  for (let x = 13, i = 0; x <= 312; x += 26, i++) { const y = -318 + Math.sin(x / 312 * Math.PI * 3) * 14 + 14; const tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7); circ(g, x, y, 3.5, ['#FFD9A3', '#FF9AB0', '#9FE0FF'][i % 3], 1); glow(g, x, y, 18, '#FFD9A3', 0.3 * tw); }
  // poster
  box(g, 196, -290, 70, 50, '#E9D2A8', 2.5, 2); txt(g, 'LOL', 231, -265, 22, '#C8553D', { weight: 800 });
  // sofa
  box(g, 14, -128, 196, 64, '#7A4A8A', 3, 14);
  box(g, 6, -78, 212, 42, '#8E5AA0', 3, 10);
  // friends with phones
  const ppl = [
    { x: 54, skin: SK[0], hs: 'curly', hair: '#C8553D', top: '#4FA3C8' },
    { x: 112, skin: SK[3], hs: 'bob', hair: '#1A1212', top: '#F28C8C' },
    { x: 170, skin: SK[5], hs: 'beanie', capCol: '#C8553D', top: '#8ACB88' },
  ];
  const beams = [];
  ppl.forEach((p, i) => {
    const hw = howl * (0.8 + 0.2 * Math.sin(t * 9 + i * 2));
    const scroll = Math.sin(t * 2 + i * 1.3) * 2;
    const ph = [p.x + 14 - hw * 10, -110 - hw * 26 + scroll];
    const r = person(g, { x: p.x, y: -86 + hw * 4 * Math.abs(Math.sin(t * 10 + i)), s: 0.8, face: 1, skin: p.skin, hs: p.hs, hair: p.hair, capCol: p.capCol, top: p.top, bot: '#2A2F45',
      fl: [p.x + 16, -26], fr: [p.x + 28, -26], hl: [ph[0] - 4, ph[1] + 4], hrt: hw > 0.3 ? [p.x + 30, -84] : [ph[0] + 6, ph[1] + 2],
      lean: -0.28 * hw, tilt: -0.3 * hw, mouth: hw > 0.3 ? 'laugh' : 'smile', eyes: hw > 0.3 ? 'shut' : 'dot' });
    box(g, ph[0] - 6, ph[1] - 10, 12, 20, '#15161F', 2, 3); box(g, ph[0] - 4, ph[1] - 8, 8, 15, '#BDE3FF', 0, 1.5);
    if (hw > 0.3) { for (let k = 0; k < 2; k++) { const u = frac(t * 1.5 + k * 0.5 + i * 0.3); ell(g, r.head[0] + (k ? 16 : -16), r.head[1] + u * 18, 2.5, 4, '#8CE0FF', 1); } }
    beams.push([ph, r.head, 28]);
  });
  // cardboard cutout bot
  const bx = 262, by = -26;
  seg(g, bx + 14, by, bx + 30, by - 90, '#9A7A4A', 5);
  box(g, bx - 28, by - 150, 56, 90, '#C8A06A', 3, 6);
  box(g, bx - 34, by - 212, 68, 56, '#D6B07A', 3, 10);
  seg(g, bx, by - 212, bx, by - 232, '#9A7A4A', 3); circ(g, bx, by - 236, 5, '#E0304A', 2);
  circ(g, bx - 14, by - 188, 6, '#2A2A36', 0); circ(g, bx + 14, by - 188, 6, '#2A2A36', 0);
  g.strokeStyle = OUT; g.lineWidth = 3; g.beginPath(); g.arc(bx, by - 180, 14, Math.PI * 0.2, Math.PI * 0.8); g.stroke();
  limb(g, [bx - 28, by - 140, bx - 44, by - 110 - punch * 30], 9, '#C8A06A', 2.5); limb(g, [bx + 28, by - 140, bx + 44, by - 110], 9, '#C8A06A', 2.5);
  txt(g, 'BOT', bx, by - 108, 13, '#6A4A2A', { weight: 800, font: F.pixel });
  // the pun
  const bubA = Math.max(set, punch);
  if (bubA > 0.02) {
    g.globalAlpha = bubA;
    box(g, 150, -318, 156, 62, '#FFFFFF', 3, 12);
    poly(g, [250, -258, 264, -258, 262, -236], '#FFFFFF', 0); seg(g, 250, -257, 262, -238, OUT, 3); seg(g, 264, -257, 262, -238, OUT, 3);
    if (punch < 0.5) { txt(g, "a bot's fave", 228, -298, 14, PAL.ink, { weight: 700 }); txt(g, 'snack?', 228, -278, 14, PAL.ink, { weight: 700 }); }
    else { txt(g, 'micro-', 228, -300, 20, PAL.ink, { weight: 800 }); txt(g, 'chips!', 228, -276, 20, PAL.ink, { weight: 800 }); }
    g.globalAlpha = 1;
  }
  if (howl > 0.3) for (let i = 0; i < 3; i++) { const u = frac(t * 1.2 + i / 3); g.globalAlpha = howl * (1 - u); txt(g, 'HA', 30 + i * 70 + u * 10, -160 - u * 60, 18 + i * 3, '#FFF1B8', { weight: 800, stroke: 3 }); g.globalAlpha = 1; }
  return beams;
};

// 6R Lily's seventh birthday
RES['6R'] = (g, t, f, sv) => {
  const joy = smooth(between(sv, 0, 0.3));
  // bunting
  g.strokeStyle = '#2A1E1A'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -310); g.quadraticCurveTo(156, -280, 312, -310); g.stroke();
  for (let i = 0; i < 11; i++) { const x = 14 + i * 28, y = -310 + Math.sin(i / 10 * Math.PI) * 15; poly(g, [x - 10, y, x + 10, y, x, y + 20], ['#FFC23D', '#4FA3C8', '#8ACB88', '#FF6A5A', '#B08CFF'][i % 5], 2); }
  // balloons
  for (let i = 0; i < 3; i++) {
    const bx = 30 + i * 22 + Math.sin(t * 1.3 + i) * 5, by = -250 + i * 12 + Math.sin(t * 1.7 + i * 2) * 5;
    seg(g, bx, by + 20, 44, -90, '#EDE3CF', 1.2);
    ell(g, bx, by, 17, 21, ['#FF6A5A', '#FFC23D', '#4FA3C8'][i], 2.5);
    ell(g, bx - 6, by - 7, 4, 6, 'rgba(255,255,255,0.5)', 0);
  }
  // table + cake
  box(g, 96, -96, 170, 12, '#F6EEDC', 3, 4);
  g.fillStyle = '#FF9AB0'; g.fillRect(96, -86, 170, 16); seg(g, 96, -86, 266, -86, OUT, 2);
  box(g, 110, -70, 8, 44, '#8A6A4A', 2.5); box(g, 244, -70, 8, 44, '#8A6A4A', 2.5);
  box(g, 150, -134, 64, 38, '#FFF1E6', 3, 6); g.fillStyle = '#FF6A8A'; g.fillRect(150, -122, 64, 6); seg(g, 150, -134, 214, -134, OUT, 2);
  for (let i = 0; i < 7; i++) {
    const cx = 156 + i * 8.5; box(g, cx - 1.5, -150, 3, 16, ['#8CE0FF', '#FFC23D', '#FF6A8A'][i % 3], 1);
    const fl = 1 + 0.25 * Math.sin(t * 12 + i * 2);
    ell(g, cx, -155, 2.4, 4.5 * fl, '#FFD27A', 0); glow(g, cx, -155, 16, '#FFD27A', 0.25);
  }
  // tablet on the table (the party game)
  const tab = [238, -110];
  box(g, tab[0] - 14, tab[1] - 18, 28, 22, '#23252F', 2, 3); box(g, tab[0] - 11, tab[1] - 15, 22, 16, '#FFE08A', 0, 2);
  // Lily and a friend, a parent
  const hop = joy * Math.abs(Math.sin(t * 7)) * 16;
  const L = person(g, { x: 130, y: -80 - hop, s: 0.66, face: 1, skin: SK[1], hs: 'pigtails', hair: '#8A4A2A', top: '#7FD1C8', bot: '#4FA3C8', shoe: '#FF6A5A',
    fl: [124, -26 - hop], fr: [138, -26 - hop], hl: joy > 0.3 ? [110, -170 - hop] : [118, -110], hrt: joy > 0.3 ? [152, -172 - hop] : [148, -108], mouth: 'grin', eyes: joy > 0.3 ? 'happy' : 'dot' });
  poly(g, [L.head[0] - 10, L.head[1] - 12, L.head[0] + 10, L.head[1] - 12, L.head[0] + 2, L.head[1] - 38], '#4FA3C8', 2.5); circ(g, L.head[0] + 2, L.head[1] - 39, 3.5, '#FFC23D', 1.5);
  const blow = pulse(t, 2.4, 0.7);
  const Fr = person(g, { x: 282, y: -80, s: 0.64, face: -1, skin: SK[4], hs: 'afro', hair: '#15100E', top: '#8ACB88', bot: '#B08CFF', fl: [276, -26], fr: [290, -26],
    hl: [262, -134], hrt: [292, -110], mouth: 'o' });
  poly(g, [Fr.head[0] - 10, Fr.head[1] - 12, Fr.head[0] + 10, Fr.head[1] - 12, Fr.head[0] - 2, Fr.head[1] - 38], '#FF6A5A', 2.5);
  seg(g, Fr.head[0] - 12, Fr.head[1] + 8, Fr.head[0] - 22 - blow * 28, Fr.head[1] + 8, '#FF6A8A', 5);
  // confetti joy
  if (joy > 0.02) {
    for (let i = 0; i < 46; i++) {
      const u = frac(t * 0.45 + hash(i * 3.7)), x = hash(i * 9.1) * 312 + Math.sin(t * 3 + i) * 8, y = -334 + u * 320;
      g.save(); g.translate(x, y); g.rotate(t * 4 + i); g.globalAlpha = joy * Math.min(1, (1 - u) * 3);
      g.fillStyle = ['#FFC23D', '#FF6A8A', '#4FA3C8', '#8ACB88', '#B08CFF', '#FFF1B8'][i % 6]; g.fillRect(-4, -2.5, 8, 5);
      g.restore();
    }
    g.globalAlpha = 1;
  }
  return [[tab, L.head, 40]];
};

// 5L the launch war room
RES['5L'] = (g, t, f, sv) => {
  const ship = smooth(between(sv, 0.35, 0.6)), more = smooth(between(sv, 0, 0.4));
  // whiteboard
  box(g, 14, -300, 128, 94, '#F4F4F0', 3, 3);
  txt(g, 'LAUNCH', 78, -278, 18, '#2A5AA8', { weight: 800 });
  txt(g, ship > 0.5 ? 'SHIPPED ✓' : 'T-1 day', 78, -254, 15, ship > 0.5 ? '#2F8A4A' : '#C8304A', { weight: 800, font: F.hand });
  for (let i = 0; i < 4; i++) box(g, 22 + i * 30, -238, 22, 20, ['#FFE36A', '#FF9AB0', '#8CE0FF', '#FFE36A'][i], 1.5, 1);
  // countdown clock
  box(g, 176, -312, 118, 34, '#101018', 3, 4);
  const secs = Math.max(0, 3600 - Math.floor(t * 3) % 3600);
  txt(g, ship > 0.5 ? 'LIVE' : `00:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`, 235, -294, 18, ship > 0.5 ? '#4ADE80' : '#FF6A5A', { font: F.pixel, weight: 700 });
  // big dashboard
  box(g, 166, -270, 136, 74, '#101018', 3, 3);
  g.fillStyle = ship > 0.5 ? '#123A24' : '#0E1A34'; g.fillRect(170, -266, 128, 66);
  g.strokeStyle = ship > 0.5 ? '#4ADE80' : '#8CE0FF'; g.lineWidth = 3; g.beginPath();
  for (let i = 0; i <= 12; i++) g.lineTo(174 + i * 10, -216 - (ship * i * 3) - Math.sin(i * 1.3 + t * 2) * 6);
  g.stroke();
  // extra screens pop up
  for (let i = 0; i < 4; i++) {
    const p = smooth(between(more, i * 0.2, i * 0.2 + 0.4)); if (p < 0.02) continue;
    const mx = 20 + i * 36, my = -196 + (i % 2) * 8;
    g.save(); g.translate(mx + 15, my); g.scale(p, p); box(g, -15, -11, 30, 22, '#101018', 2, 2); g.fillStyle = ship > 0.5 ? '#4ADE80' : '#8CE0FF'; g.fillRect(-12, -8, 24, 16); g.restore();
  }
  // table, laptops, team
  box(g, 10, -94, 296, 12, '#6E5646', 3);
  box(g, 22, -82, 10, 56, '#6E5646', 2.5); box(g, 284, -82, 10, 56, '#6E5646', 2.5);
  const team = [
    { x: 64, skin: SK[2], hs: 'bun', hair: '#2A1E1A', top: '#4FA3C8' },
    { x: 156, skin: SK[0], hs: 'short', hair: '#C8A060', top: '#E9E1CF', glasses: true },
    { x: 248, skin: SK[4], hs: 'afro', hair: '#15100E', top: '#C8553D' },
  ];
  const beams = [];
  team.forEach((p, i) => {
    const cheer = ship * (0.8 + 0.2 * Math.sin(t * 8 + i));
    const type = Math.sin(t * 14 + i * 2) * 2;
    const r = person(g, { x: p.x, y: -110 - cheer * 6, s: 0.8, face: 1, skin: p.skin, hs: p.hs, hair: p.hair, top: p.top, bot: '#2A2F45', glasses: p.glasses,
      noLegs: true, hl: cheer > 0.3 ? [p.x - 20, -214] : [p.x - 12, -104 + type], hrt: cheer > 0.3 ? [p.x + 22, -216] : [p.x + 14, -104 - type],
      mouth: cheer > 0.3 ? 'laugh' : (i === 1 ? 'flat' : 'smile'), eyes: cheer > 0.3 ? 'happy' : 'dot' });
    poly(g, [p.x - 20, -94, p.x + 20, -94, p.x + 16, -122, p.x - 16, -122], '#B8BCC8', 2.5);
    circ(g, p.x, -108, 4, '#FFFFFF', 0);
    beams.push([[p.x, -110], r.head, 26]);
  });
  box(g, 120, -104, 36, 10, '#E0B070', 2, 1); box(g, 206, -110, 10, 16, '#4ADE80', 1.5, 2);
  return beams;
};

// 5R Sam: due at nine; submitted at 08:59; asleep at 09:00
RES['5R'] = (g, t, f, sv, st) => {
  const sub = smooth(between(sv, 0.12, 0.3)), nine = sv > 0.52, sleep = smooth(between(sv, 0.55, 0.75));
  // posters and the deadline
  box(g, 16, -306, 70, 94, '#2A2F45', 2.5, 2); txt(g, '♪', 51, -270, 34, '#FFC23D'); txt(g, 'TOUR', 51, -232, 12, '#E9E1CF', { weight: 800 });
  g.save(); g.translate(150, -262); g.rotate(0.05);
  box(g, -44, -30, 88, 58, '#FFE36A', 2.5, 2);
  txt(g, 'DUE', 0, -12, 20, '#C8304A', { weight: 800, font: F.hand }); txt(g, '9AM', 0, 12, 24, '#C8304A', { weight: 800, font: F.hand });
  g.restore();
  // clock
  const mins = nine ? 0 : lerp(56, 59, clamp01(sv / 0.3) + 0 * t) + (sv < 0.01 ? Math.floor(frac(t / 20) * 3) : 0);
  circ(g, 262, -278, 28, '#F6EEDC', 3);
  const ma = (mins / 60) * TAU - Math.PI / 2, ha = ((nine ? 9 : 8 + mins / 60) / 12) * TAU - Math.PI / 2;
  seg(g, 262, -278, 262 + Math.cos(ha) * 14, -278 + Math.sin(ha) * 14, OUT, 3.5); seg(g, 262, -278, 262 + Math.cos(ma) * 21, -278 + Math.sin(ma) * 21, OUT, 2.5);
  // bed
  box(g, 232, -80, 80, 54, '#5B7FA8', 3, 8); box(g, 240, -96, 40, 18, '#F4F1EA', 2.5, 6);
  // desk
  box(g, 52, -100, 164, 12, '#8A6A4A', 3);
  box(g, 60, -88, 10, 62, '#8A6A4A', 2.5); box(g, 200, -88, 10, 62, '#8A6A4A', 2.5);
  for (let i = 0; i < 4; i++) box(g, 176, -112 - i * 9, 34 - i * 3, 9, ['#C8553D', '#4FA3C8', '#E0A13A', '#8ACB88'][i], 2, 1);
  // coffee
  box(g, 64, -120, 16, 20, '#F4F1EA', 2, 2);
  if (sleep < 0.5) for (let i = 0; i < 2; i++) { const u = frac(t * 0.6 + i / 2); g.strokeStyle = `rgba(255,255,255,${0.35 * (1 - u)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(70 + i * 4, -124 - u * 24); g.quadraticCurveTo(66 + Math.sin(t * 2 + i) * 5, -132 - u * 24, 72, -142 - u * 24); g.stroke(); }
  // laptop
  const lap = [132, -128];
  poly(g, [104, -100, 160, -100, 164, -104, 100, -104], '#B8BCC8', 2.5);
  poly(g, [106, -104, 156, -104, 162, -150, 112, -150], '#B8BCC8', 2.5);
  poly(g, [111, -108, 153, -108, 158, -146, 116, -146], sub > 0.5 ? '#2F8A4A' : '#E9F2FF', 0);
  if (sub < 0.5) { box(g, 120, -122, 30, 10, '#2A5AA8', 0, 2); txt(g, 'SUBMIT', 135, -117, 6.5, '#FFFFFF', { weight: 800 }); }
  else txt(g, '✓', 136, -126, 18, '#FFFFFF', { weight: 800 });
  // Nana's call buzzes Sam's phone
  const nana = clamp01(st.flats['4L']?.served || 0), ring = nana > 0.55 && nana < 0.98;
  const pz = ring ? Math.sin(t * 60) * 1.5 : 0;
  box(g, 88 + pz, -110, 16, 10, '#15161F', 2, 2);
  if (ring) { for (let i = 0; i < 2; i++) { const u = frac(t * 1.5 + i / 2); g.strokeStyle = `rgba(140,224,138,${1 - u})`; g.lineWidth = 2.5; g.beginPath(); g.arc(96, -110, 8 + u * 18, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }
  // Sam
  const jig = Math.sin(t * 13) * 2 * (1 - sleep), type = Math.sin(t * 18) * 3 * (1 - sleep);
  const Sm = person(g, { x: 70 - sleep * 4, y: -86, s: 0.86, face: 1, skin: SK[2], hs: 'beanie', capCol: '#2F8A6A', top: '#7A4A8A', bot: '#2A2F45', shoe: '#E9E1CF',
    fl: [96, -26], fr: [110 + jig, -26], lean: sleep * 0.95, tilt: sleep * 0.4,
    hl: sleep > 0.5 ? [118, -108] : [114, -106 + type], hrt: sleep > 0.5 ? [124, -110] : (sub > 0.02 && sub < 0.6 ? [124, -118] : [126, -104 - type]),
    mouth: sleep > 0.5 ? 'o' : (sub > 0.5 ? 'grin' : 'flat'), eyes: sleep > 0.5 ? 'shut' : (sub > 0.5 ? 'happy' : 'wide') });
  // chair
  box(g, 40, -82, 50, 8, '#3A3048', 2.5); seg(g, 46, -74, 46, -26, '#3A3048', 5); seg(g, 84, -74, 84, -26, '#3A3048', 5); seg(g, 42, -82, 36, -150, '#3A3048', 6);
  if (sub > 0.05) {
    g.globalAlpha = sub * (1 - 0.6 * sleep);
    box(g, 110, -214, 128, 46, '#F6EEDC', 3, 10);
    txt(g, 'SUBMITTED ✓', 174, -198, 14, '#2F8A4A', { weight: 800 }); txt(g, '08:59', 174, -180, 13, PAL.ink, { weight: 700, font: F.pixel });
    g.globalAlpha = 1;
  }
  if (sleep > 0.3) for (let i = 0; i < 3; i++) { const u = frac(t * 0.5 + i / 3); g.globalAlpha = sleep * (1 - u); txt(g, 'z', Sm.head[0] + 18 + u * 30, Sm.head[1] - 20 - u * 60, 14 + i * 4, '#E9F2FF', { weight: 800, stroke: 3 }); g.globalAlpha = 1; }
  return [[lap, Sm.head, 40]];
};

// 4L Nana: one big button, "call Sam"
RES['4L'] = (g, t, f, sv) => {
  const hold = smooth(between(sv, 0, 0.25)), tap = smooth(between(sv, 0.4, 0.5)) * (1 - smooth(between(sv, 0.55, 0.65))), calling = sv > 0.5;
  // photo of Sam on the wall
  box(g, 132, -300, 50, 60, '#C9A24E', 3, 2); box(g, 138, -294, 38, 48, '#8AB0D0', 0);
  circ(g, 157, -276, 9, SK[2], 1.5); g.beginPath(); g.arc(157, -278, 10, Math.PI, TAU); g.fillStyle = '#2F8A6A'; g.fill(); box(g, 147, -266, 20, 20, '#7A4A8A', 0);
  // cuckoo clock
  poly(g, [250, -296, 290, -296, 296, -276, 244, -276], '#6E4A2A', 2.5); box(g, 248, -276, 44, 44, '#8A5A36', 2.5, 2); circ(g, 270, -254, 11, '#F6EEDC', 2);
  const pend = Math.sin(t * 3) * 0.35; seg(g, 270, -232, 270 + Math.sin(pend) * 30, -232 + Math.cos(pend) * 30, '#C9A24E', 2); circ(g, 270 + Math.sin(pend) * 30, -232 + Math.cos(pend) * 30, 5, '#C9A24E', 1.5);
  // side table with lamp and tea
  box(g, 36, -78, 50, 10, '#6E4A2A', 2.5); box(g, 44, -68, 8, 42, '#6E4A2A', 2); box(g, 70, -68, 8, 42, '#6E4A2A', 2);
  seg(g, 58, -78, 58, -118, '#C9A24E', 4); poly(g, [40, -118, 76, -118, 68, -148, 48, -148], '#F2C6A0', 2.5);
  for (let i = 0; i < 7; i++) seg(g, 42 + i * 5, -118, 42 + i * 5, -112, '#C98C5A', 1.5);
  box(g, 72, -90, 14, 12, '#F4F1EA', 1.5, 2);
  // rocking chair
  const rock = Math.sin(t * 1.4) * 0.05 * (1 - hold * 0.8);
  g.save(); g.translate(200, -26); g.rotate(rock);
  g.strokeStyle = '#6E4A2A'; g.lineWidth = 6; g.beginPath(); g.arc(0, -120, 120, Math.PI * 0.33, Math.PI * 0.67); g.stroke();
  box(g, -46, -64, 92, 12, '#8A5A36', 2.5); seg(g, -40, -52, -36, -12, '#6E4A2A', 5); seg(g, 40, -52, 36, -12, '#6E4A2A', 5);
  box(g, 30, -170, 14, 112, '#8A5A36', 2.5, 4);
  box(g, 26, -150, 20, 70, '#E9E1CF', 1.5, 6);
  // Nana
  const knit = Math.sin(t * 6);
  const ph = [-30 - hold * 6, -110 - hold * 20];
  const N = person(g, { x: 8, y: -72, s: 0.9, face: -1, skin: SK[0], hs: 'bun', hair: '#D8D4D0', top: '#C98C9A', bot: '#6A4A7A', shoe: '#5A3A2A', glasses: true,
    fl: [-24, 22], fr: [-12, 22], hl: hold > 0.3 ? [ph[0] + 4, ph[1] + 8] : [-22 + knit * 3, -76], hrt: hold > 0.3 ? (tap > 0.05 ? [ph[0] - 2, ph[1] - 4 + (1 - tap) * 14] : [-14, -80]) : [-8 - knit * 3, -78],
    mouth: calling ? 'grin' : 'smile', eyes: calling ? 'happy' : 'dot',
    torso: (g2, s) => { for (let i = 0; i < 4; i++) circ(g2, 0, (-40 + i * 10) * s, 1.8 * s, '#F6EEDC', 0); } });
  if (hold < 0.3) { seg(g, -26 + knit * 3, -80, -10, -100, '#C9A24E', 2); seg(g, -6 - knit * 3, -82, -22, -100, '#C9A24E', 2); ell(g, -16, -70, 12, 6, '#6AA0D0', 2); }
  else { box(g, ph[0] - 8, ph[1] - 13, 16, 26, '#15161F', 2, 3); circ(g, ph[0], ph[1], 5, '#3FB45A', 1); }
  g.restore();
  // yarn basket
  box(g, 250, -50, 50, 24, '#B8864A', 2.5, 4); circ(g, 262, -54, 9, '#6AA0D0', 2); circ(g, 282, -56, 9, '#E07A8A', 2);
  // the callout: her phone, big, one button
  if (hold > 0.02) {
    const pop = easeOut(hold);
    g.save(); g.translate(86, -214); g.scale(pop, pop);
    box(g, -50, -92, 100, 176, '#15161F', 4, 16);
    box(g, -42, -80, 84, 150, '#F6F2E8', 0, 8);
    const pr = 1 - 0.12 * tap;
    circ(g, 0, -14, 34 * pr, calling ? '#2FB45A' : '#3FC46A', 3.5);
    txt(g, '📞', 0, -14, 26 * pr, '#FFFFFF');
    txt(g, calling ? 'calling…' : 'call Sam', 0, 42, 17, PAL.ink, { weight: 800 });
    if (tap > 0.1) { g.strokeStyle = `rgba(63,196,106,${tap})`; g.lineWidth = 4; g.beginPath(); g.arc(0, -14, 44 + (1 - tap) * 20, 0, TAU); g.stroke(); }
    g.restore();
    seg(g, 60, -150, 130, -120, 'rgba(255,255,255,0.35)', 2);
  }
  const hd = [200 + N.head[0] * Math.cos(rock) - N.head[1] * Math.sin(rock), -26 + N.head[0] * Math.sin(rock) + N.head[1] * Math.cos(rock)];
  return [[[200 + ph[0], -26 + ph[1]], hd, 40]];
};

// 4R Ines: violin practice
RES['4R'] = (g, t) => {
  // poster, metronome, stand
  box(g, 150, -306, 64, 84, '#E9D2A8', 2.5, 2); txt(g, '𝄞', 182, -262, 48, '#6A2E3E');
  const mt = Math.sin(t * 5.2) * 0.5;
  poly(g, [240, -110, 270, -110, 262, -160, 248, -160], '#4A2A2A', 2.5); seg(g, 255, -114, 255 + Math.sin(mt) * 40, -114 - Math.cos(mt) * 40, '#C9A24E', 2.5);
  box(g, 232, -110, 46, 84, '#6E4A2A', 2.5);
  seg(g, 80, -26, 80, -150, '#2A2A36', 4); poly(g, [48, -150, 112, -150, 106, -196, 54, -196], '#2A2A36', 2.5);
  box(g, 56, -192, 48, 38, '#F6F2E8', 0); for (let i = 0; i < 4; i++) seg(g, 60, -186 + i * 9, 100, -186 + i * 9, '#6A6A7A', 1);
  const ph = [96, -160]; box(g, ph[0] - 7, ph[1] - 12, 14, 20, '#15161F', 1.5, 3);
  // floor lamp
  seg(g, 282, -26, 282, -220, '#2A2A36', 4); poly(g, [262, -220, 302, -220, 294, -252, 270, -252], '#F2C86A', 2.5);
  // Ines and her violin
  const sway = Math.sin(t * 1.2) * 0.06, bow = Math.sin(t * 2.6) * 26;
  const I = person(g, { x: 170, y: -96, s: 0.95, face: -1, skin: SK[1], hs: 'long', hair: '#3A1E14', top: '#2A2F45', bot: '#2A2F45', shoe: '#6A2E3E', lean: sway,
    fl: [158, -14], fr: [182, -14], hl: [136, -168], hrt: [178 + bow, -150 + bow * 0.2], tilt: 0.3, eyes: 'shut', mouth: 'smile' });
  g.save(); g.translate(150, -168); g.rotate(-0.35 + sway);
  ell(g, 0, 0, 30, 12, '#A0522D', 2.5); ell(g, -8, 0, 8, 5, '#6A2E14', 0); seg(g, -30, 0, -58, 0, '#2A1A10', 5);
  g.restore();
  seg(g, 178 + bow - 50, -152 + bow * 0.2 - 30, 178 + bow + 20, -148 + bow * 0.2 + 12, '#E9D2A8', 2.5);
  for (let i = 0; i < 3; i++) { const u = frac(t * 0.35 + i / 3); g.globalAlpha = 1 - u; txt(g, i % 2 ? '♪' : '♫', 130 - u * 40 + Math.sin(u * 8 + i) * 10, -190 - u * 110, 20 + i * 4, '#FFE3B0', { weight: 700 }); g.globalAlpha = 1; }
  return [[ph, I.head, 40]];
};

// 3L Tom: cooking
RES['3L'] = (g, t) => {
  // shelf and utensils
  box(g, 20, -270, 120, 8, '#6E5646', 2.5);
  for (let i = 0; i < 5; i++) box(g, 26 + i * 22, -294, 16, 24, ['#E0A13A', '#C8553D', '#F4F1EA', '#8ACB88', '#6E4A2A'][i], 2, 3);
  seg(g, 170, -300, 300, -300, '#2A2A36', 3);
  for (let i = 0; i < 4; i++) { const sw = Math.sin(t * 1.5 + i) * 0.1; g.save(); g.translate(186 + i * 30, -300); g.rotate(sw); seg(g, 0, 0, 0, 40, '#8A8F9A', 3); circ(g, 0, 46, i % 2 ? 8 : 5, '#8A8F9A', 2); g.restore(); }
  // hood, counter, hob
  poly(g, [180, -250, 290, -250, 300, -214, 170, -214], '#9AA0AC', 3);
  box(g, 150, -98, 162, 72, '#E9E1CF', 3, 2); box(g, 146, -104, 170, 10, '#6E5646', 3);
  for (let i = 0; i < 3; i++) box(g, 158 + i * 52, -88, 44, 50, '#DCD3C0', 2, 2);
  // pot with steam
  box(g, 250, -134, 44, 30, '#5A5E68', 3, 4); seg(g, 246, -134, 298, -134, '#3A3E48', 4);
  for (let i = 0; i < 4; i++) { const u = frac(t * 0.45 + i / 4); g.strokeStyle = `rgba(255,255,255,${0.45 * (1 - u)})`; g.lineWidth = 3 + u * 4; g.beginPath(); g.moveTo(262 + i * 7, -140 - u * 70); g.quadraticCurveTo(258 + Math.sin(t * 2 + i) * 10, -155 - u * 70, 266 + i * 5, -170 - u * 70); g.stroke(); }
  // Tom tossing the pan
  const toss = pulse(t, 3.2, 0.9), food = Math.sin(Math.PI * clamp01((frac(t / 3.2) * 3.2) / 0.9));
  const pan = [200, -118 - toss * 16];
  const T = person(g, { x: 110, y: -96, s: 0.96, face: 1, skin: SK[0], hs: 'short', hair: '#B8683A', top: '#F4F1EA', bot: '#2A2F45', shoe: '#2A2A36',
    fl: [98, -14], fr: [122, -14], hl: [80, -104], hrt: [pan[0] - 34, pan[1] + 2], mouth: toss > 0.3 ? 'grin' : 'smile',
    torso: (g2, s) => { box(g2, -12 * s, -40 * s, 24 * s, 44 * s, '#C8553D', 2, 4); } });
  seg(g, pan[0] - 36, pan[1] + 2, pan[0] - 14, pan[1] - 2, '#2A2A36', 5);
  ell(g, pan[0], pan[1], 20, 6, '#3A3E48', 2.5);
  ell(g, pan[0] + 2, pan[1] - 6 - food * 46, 12, 4, '#F2C86A', 2, food * Math.PI);
  box(g, 76, -110, 8, 20, '#8A8F9A', 1.5); // spatula
  // recipe tablet
  const tab = [296, -128];
  box(g, tab[0] - 12, tab[1] - 26, 24, 32, '#23252F', 2, 3); box(g, tab[0] - 9, tab[1] - 23, 18, 26, '#FFF1D6', 0, 2);
  return [[tab, T.head, 44]];
};

// 3R Ade: a screen that speaks
RES['3R'] = (g, t, f, sv) => {
  // woven hanging
  box(g, 26, -300, 90, 110, '#C8553D', 3, 2);
  for (let i = 0; i < 6; i++) { g.fillStyle = ['#E0A13A', '#2F6B6E', '#F6EEDC'][i % 3]; g.fillRect(30, -292 + i * 17, 82, 6); }
  for (let i = 0; i < 9; i++) seg(g, 30 + i * 10, -190, 30 + i * 10, -176, '#C8553D', 2);
  // radio
  box(g, 218, -154, 70, 44, '#8A5A36', 3, 8); circ(g, 238, -132, 12, '#3A2A20', 2); box(g, 256, -146, 24, 8, '#F6EEDC', 1.5, 2);
  box(g, 212, -110, 82, 84, '#6E4A2A', 2.5);
  for (let i = 0; i < 2; i++) { const u = frac(t * 0.4 + i / 2); g.globalAlpha = 1 - u; txt(g, '♪', 246 + u * 20, -170 - u * 60, 16, '#FFE3B0'); g.globalAlpha = 1; }
  // Ade, cane and phone
  const nod = Math.sin(t * 2.2) * 0.06, foot = pulse(t, 0.8, 0.3) * 4;
  const ph = [158, -150];
  const A = person(g, { x: 130, y: -96, s: 0.96, face: 1, skin: SK[5], hs: 'short', hair: '#15100E', top: '#4FA3C8', bot: '#3A3048', shoe: '#2A2A36', glasses: 'dark', tilt: nod + 0.1,
    fl: [118, -14], fr: [142, -14 - foot], hl: [96, -96], hrt: [ph[0] - 6, ph[1] + 8], mouth: sv > 0.3 ? 'grin' : 'smile' });
  seg(g, 96, -96, 74, -16, '#F4F4F0', 5); seg(g, 96, -96, 74, -16, OUT, 1); seg(g, 78, -26, 74, -16, '#C8304A', 5);
  box(g, ph[0] - 9, ph[1] - 15, 18, 30, '#15161F', 2.5, 4); box(g, ph[0] - 7, ph[1] - 12, 14, 23, '#05060A', 0, 2);
  return [[ph, A.head, 'rings']];
};

// 2L Jo: asleep after the night shift
RES['2L'] = (g, t) => {
  // scrubs folded on a shelf, the badge on top
  box(g, 92, -236, 90, 8, '#6E5646', 2.5);
  box(g, 104, -258, 58, 11, '#4FB0A8', 2, 3); box(g, 106, -270, 54, 12, '#3F9A92', 2, 3);
  box(g, 126, -281, 18, 11, '#F6EEDC', 1.5, 2); seg(g, 116, -276, 126, -276, '#2F8A84', 2);
  // bedside table, lamp, alarm
  box(g, 8, -80, 52, 54, '#6E5646', 2.5); seg(g, 34, -80, 34, -104, '#C9A24E', 3); poly(g, [22, -104, 46, -104, 42, -124, 26, -124], '#F2C6A0', 2);
  box(g, 16, -92, 18, 12, '#15161F', 1.5, 2); txt(g, '14:00', 25, -86, 5.5, '#FF6A5A', { font: F.pixel });
  const ph = [48, -86]; box(g, ph[0] - 6, ph[1] - 4, 12, 8, '#15161F', 1.5, 2); txt(g, '☾', ph[0], ph[1], 7, '#FFE3B0');
  // bed
  box(g, 66, -150, 16, 124, '#6E4A2A', 3, 4);
  box(g, 66, -74, 240, 30, '#E9E1CF', 3, 6);
  box(g, 296, -104, 12, 78, '#6E4A2A', 3, 4);
  box(g, 84, -100, 56, 28, '#F6F2E8', 2.5, 10);
  // Jo's head on the pillow
  head(g, 116, -100, 18, { f: 1, skin: SK[2], hs: 'bob', hair: '#2A1A14', eyes: 'shut', mouth: 'flat', mask: true, lw: 2.5 });
  const br = Math.sin(t * 1.1) * 4;
  g.beginPath(); g.moveTo(128, -72); g.bezierCurveTo(150, -106 - br, 250, -96 - br * 0.6, 300, -76); g.lineTo(300, -58); g.lineTo(128, -58); g.closePath(); inked(g, '#7FA8D8', 3);
  g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(150, -80 - br * 0.5); g.quadraticCurveTo(220, -90 - br * 0.6, 290, -70); g.stroke();
  for (let i = 0; i < 3; i++) { const u = frac(t * 0.3 + i / 3); g.globalAlpha = 1 - u; txt(g, 'z', 138 + u * 30 + i * 4, -130 - u * 80, 14 + i * 5, '#E9F2FF', { weight: 800, stroke: 3 }); g.globalAlpha = 1; }
  return [[ph, [116, -100], 30]];
};

// 2R Rui and Biscuit
RES['2R'] = (g, t) => {
  box(g, 180, -300, 70, 56, '#E9D2A8', 2.5, 2); box(g, 186, -294, 58, 44, '#9AC8E0', 0);
  circ(g, 215, -270, 12, '#D9A55B', 1.5);
  seg(g, 290, -250, 290, -236, '#2A2A36', 3); g.strokeStyle = '#C8553D'; g.lineWidth = 3; g.beginPath(); g.moveTo(290, -236); g.quadraticCurveTo(278, -190, 294, -170); g.stroke();
  // sofa
  box(g, 14, -126, 150, 62, '#4E7A5A', 3, 14); box(g, 6, -76, 166, 40, '#5E8E6A', 3, 10);
  // the ball, thrown now and then
  const cyc = frac(t / 4.2), u = clamp01((cyc - 0.1) / 0.5);
  const bx = lerp(92, 236, u), by = cyc < 0.1 ? -150 : cyc < 0.6 ? lerp(-150, -60, u) - Math.sin(Math.PI * u) * 90 : -60 + Math.abs(Math.sin((cyc - 0.6) * 20)) * -10;
  const P2 = person(g, { x: 74, y: -86, s: 0.92, face: 1, skin: SK[3], hs: 'short', hair: '#15100E', top: '#E9E1CF', bot: '#3E6FA8', shoe: '#C8553D',
    fl: [96, -26], fr: [110, -26], hl: [60, -80], hrt: cyc < 0.12 ? [bx, by] : [104, -150 + Math.sin(t) * 3], mouth: 'grin', eyes: cyc < 0.6 ? 'happy' : 'dot' });
  const ph = [52, -84]; box(g, ph[0] - 7, ph[1] - 5, 14, 10, '#15161F', 1.5, 2);
  box(g, 234, -48, 74, 22, '#8A5A8A', 2.5, 10);
  dog(g, 214, -18, 1.25, t, { face: -1, look: cyc < 0.6 ? -0.3 + u * 0.4 : 0 });
  circ(g, bx, cyc > 0.6 ? -40 : by, 8, '#C8F04A', 2);
  return [[ph, P2.head, 40]];
};

// ---------- floor 10: the agents' flats, dark until they're counted ----------
function drawTopFlat(g, t, S, st, id, f, lod) {
  const isM = id === '10L', up = clamp01(isM ? (st.bots?.molty || 0) : (st.bots?.jolly || 0));
  // While a bot is arriving its light flickers on; st.botsSteady (set once they're settled but
  // quiet, in the final chorus) keeps a low light steady instead.
  const flick = !st.botsSteady && frac(t * 13) > 0.5 && up < 0.6 ? 1 : 0;
  const on = up > 0 ? clamp01(up * 1.4 - 0.1 * flick) : 0;
  const R = isM
    ? { wall: '#205466', floor: '#B89A62', lamp: [230, -250, 260], lampCol: '#BFF0FF' }
    : { wall: '#8FA6BA', floor: '#9C7A56', lamp: [240, -200, 260] };
  roomShell(g, R, on, lod, t);
  if (isM) {
    // porthole, net, aquarium
    circ(g, 62, -236, 40, '#7A5A36', 4); circ(g, 62, -236, 30, '#0E2440', 2.5);
    for (let i = 0; i < 4; i++) { g.fillStyle = '#DDE6FF'; g.fillRect(50 + hash(i) * 30, -254 + hash(i + 3) * 30, 2, 2); }
    g.strokeStyle = 'rgba(230,210,170,0.5)'; g.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(130 + i * 16, -310); g.quadraticCurveTo(140 + i * 14, -270, 126 + i * 18, -236); g.stroke(); }
    box(g, 220, -130, 84, 60, 'rgba(90,190,230,0.55)', 3, 4); box(g, 214, -70, 96, 44, '#6E4A2A', 3);
    for (let i = 0; i < 4; i++) { const u = frac(t * 0.6 + i / 4); circ(g, 234 + i * 16, -76 - u * 50, 2.4, 'rgba(255,255,255,0.7)', 0); }
    const fx = 262 + Math.sin(t * 0.8) * 24; ell(g, fx, -104, 8, 5, '#FF8A3A', 1.5); poly(g, [fx - 8, -104, fx - 15, -109, fx - 15, -99], '#FF8A3A', 1.5);
  } else {
    // plant in a speckled vase, desk, laptop with Muse's mark, paper crane
    box(g, 22, -92, 36, 66, '#E9DCC8', 3, [4, 4, 12, 12]);
    for (let i = 0; i < 12; i++) circ(g, 28 + hash(i) * 24, -84 + hash(i + 5) * 54, 1.3, '#8A7A66', 0);
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.3 + Math.sin(t + i) * 0.04; g.strokeStyle = '#4FA35C'; g.lineWidth = 4; g.beginPath(); g.moveTo(40, -92); g.quadraticCurveTo(40 + Math.cos(a) * 30, -92 + Math.sin(a) * 60, 40 + Math.cos(a) * 60, -92 + Math.sin(a) * 90); g.stroke(); }
    box(g, 150, -100, 160, 12, '#EDE3CF', 3); box(g, 160, -88, 10, 62, '#B8A07A', 2.5); box(g, 290, -88, 10, 62, '#B8A07A', 2.5);
    poly(g, [196, -100, 268, -100, 262, -150, 202, -150], '#B8BCC8', 3);
    if (S && S.img && S.img.muse) g.drawImage(S.img.muse, 222, -138, 20, 20);
    poly(g, [282, -100, 298, -118, 304, -100], '#F2A65A', 2); poly(g, [284, -104, 276, -120, 292, -108], '#E08A35', 2);
  }
  const lx = 156;
  GOLD_FROM[id] = [[lx + 40, -120], [lx, -130]];
  roomLight(g, t, R, { lit: Math.max(0.04, on), gold: f.gold || 0 }, [[[lx + 50, -110], [lx, -140], 40]], lod, isM ? 5 : 6);
  // The mascots are drawn after the room light, so the gold sits behind them and their official
  // colours are never tinted.
  if (on > 0.02) {
    // quick fade-in as they arrive, then fully opaque: quiet bots are shown by the room's light,
    // never as see-through ghosts
    g.save(); g.globalAlpha *= clamp01(on * 3);
    safe(g, () => cast.bot(g, isM ? 'molty' : 'jolly', lx, -30, 1.5, { wave: st.botWave ?? up, lit: on, t }));
    g.restore();
  }
  if (on < 0.98) {
    // moonlight through the window when empty
    glow(g, 60, -240, 120, '#9FB3FF', 0.08 * (1 - on));
  }
}

// ---------- your flat (9R) ----------
// You stand mid-set doing dumbbell curls: one arm pumps the dumbbell on every bar of the song, the
// other hand holds the phone (one sweaty hand is all that's free). When served rises, your thumb
// taps the phone's one button. The blind shows the same pose as a flat shadow.
const YOU_HIP = [178, -86];
let YOU_PAUSE = 0;   // st.youPause, set per frame in drawYou
function youPose(t, S, f) {
  const served = clamp01(f.served || 0);
  const bp = S && S.barPos ? S.barPos(t) : t / 1.393;
  return { curl: lerp(0.5 - 0.5 * Math.cos(bp * TAU), 0.62, YOU_PAUSE), served };
}
function dumbbell(g, x, y, s, fill, lw) {
  box(g, x - 17 * s, y - 3 * s, 34 * s, 6 * s, fill || '#9AA0AC', lw, 3 * s);
  for (const sd of [-1, 1]) {
    ell(g, x + sd * 13 * s, y, 5 * s, 14 * s, fill || '#2A2A36', lw);
    ell(g, x + sd * 19.5 * s, y, 4 * s, 10.5 * s, fill || '#3E3E4E', lw);
  }
}
function gymKit(g, fill, lw) {
  // a dumbbell rack
  box(g, 20, -106, 8, 80, fill || '#3A3E54', lw, 2); box(g, 104, -106, 8, 80, fill || '#3A3E54', lw, 2);
  box(g, 14, -106, 104, 7, fill || '#5A5E70', lw, 2); box(g, 14, -66, 104, 7, fill || '#5A5E70', lw, 2);
  dumbbell(g, 44, -114, 0.55, fill, lw); dumbbell(g, 88, -114, 0.55, fill, lw);
  dumbbell(g, 44, -75, 0.62, fill, lw); dumbbell(g, 88, -75, 0.62, fill, lw);
  // a flat bench with a towel
  box(g, 222, -54, 72, 12, fill || '#2A2F45', lw, 5);
  box(g, 230, -42, 8, 16, fill || '#3A3E54', lw); box(g, 278, -42, 8, 16, fill || '#3A3E54', lw);
  if (!fill) { box(g, 240, -60, 30, 10, '#EDE7DA', 2, 3); box(g, 290, -76, 12, 24, '#4FA3C8', 2, 4); }
}
function drawYouBody(g, t, S, f, sil) {
  const { curl, served } = youPose(t, S, f);
  const hip = [YOU_HIP[0], YOU_HIP[1] + 2 * curl];
  const sh = [hip[0] + 13, hip[1] - 45], el = [sh[0] + 5, sh[1] + 29];
  const th = lerp(Math.PI / 2 - 0.12, -Math.PI / 2 + 0.5, curl);
  const hand = [el[0] + Math.cos(th) * 28, el[1] + Math.sin(th) * 28];
  const phone = [hip[0] - 4, hip[1] - 46];
  const tap = served > 0.3 && served < 0.8 ? Math.sin(Math.PI * clamp01((served - 0.3) / 0.5)) : 0;
  const grip = [phone[0] + 1, phone[1] + 9];
  const B = person(g, { x: hip[0], y: hip[1], s: 1, face: -1, skin: '#F2D2B6', hs: 'you', hair: '#2A1A14', top: '#E86A5B', bot: '#2A2F45', shoe: '#F4F1EA', sil,
    hl: grip, hrt: hand, bendL: 1, bendR: 1, fl: [hip[0] - 15, -12], fr: [hip[0] + 15, -12],
    tilt: -0.14, mouth: served > 0.6 ? 'grin' : curl > 0.75 ? 'o' : 'smile', eyes: served > 0.6 ? 'happy' : 'dot' });
  dumbbell(g, hand[0], hand[1], sil ? 1.2 : 1, sil, sil ? 0 : 2.5);
  circ(g, hand[0], hand[1], 6.3, sil || '#F2D2B6', sil ? 0 : 2);
  // the phone, and the hand holding it
  box(g, phone[0] - 8, phone[1] - 14, 16, 26, sil || '#15161F', sil ? 0 : 2.5, 3);
  if (!sil) {
    box(g, phone[0] - 6, phone[1] - 11, 12, 19, '#F6F2E8', 0, 2);
    circ(g, phone[0], phone[1] - 1, 4.2 * (1 - 0.2 * tap), '#D97757', 1);
    if (tap > 0.05) { g.strokeStyle = rgba('#D97757', tap); g.lineWidth = 1.5; g.beginPath(); g.arc(phone[0], phone[1] - 1, 6 + tap * 7, 0, TAU); g.stroke(); }
  }
  circ(g, grip[0], grip[1], 6.3, sil || '#F2D2B6', sil ? 0 : 2);
  circ(g, phone[0] - 7 + tap * 7, phone[1] + 5 - tap * 5, 3.3, sil || '#F2D2B6', sil ? 0 : 1.2);   // the thumb
  if (!sil) {
    circ(g, B.head[0] + 20, B.head[1] - 2, 3.2, '#FFC23D', 1.2);   // hair tie
    if (curl > 0.8) { const u = (curl - 0.8) / 0.2; circ(g, B.head[0] - 16 - u * 12, B.head[1] - 4 - u * 8, 2.4, '#9FE0FF', 1); }
  }
  return { hip, head: B.head, phone };
}
// The shadow as one flat layer (so overlapping limbs don't darken), cast a little larger on the blind.
function youShadow(t, S, f) {
  if (!C.shadow) C.shadow = mk(624, 668);
  const c = C.shadow, sg = c.getContext('2d');
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.clearRect(0, 0, c.width, c.height);
  sg.setTransform(2, 0, 0, 2, 0, 668);
  sg.lineCap = 'round'; sg.lineJoin = 'round';
  gymKit(sg, '#000000', 0);
  drawYouBody(sg, t, S, f, '#000000');
  return c;
}
function drawYou(g, t, S, st, f, lod) {
  const R = { wall: '#34466E', pat: 'stripes', patCol: 'rgba(255,255,255,0.04)', floor: '#5A4A3C', lamp: [292, -240, 280] };
  const yg = clamp01(st.youGold || 0), bl = clamp01(st.blind || 0), au = clamp01(st.autumn || 0);
  YOU_PAUSE = clamp01(st.youPause || 0);
  roomShell(g, R, clamp01(f.lit ?? 1), lod, t);
  // calendar: August, then September
  const flip = smooth(between(au, 0.2, 0.55));
  box(g, 22, -300, 64, 70, '#F6EEDC', 2.5, 2); box(g, 22, -300, 64, 16, '#C8304A', 2.5, 2);
  txt(g, flip > 0.5 ? 'SEP' : 'AUG', 54, -266, 18, PAL.ink, { weight: 800 });
  for (let i = 0; i < 12; i++) g.fillRect(28 + (i % 6) * 9, -252 + Math.floor(i / 6) * 8, 5, 4);
  if (flip > 0.02 && flip < 0.98) { g.save(); g.translate(22, -284); g.scale(1, 1 - flip); box(g, 0, 0, 64, 54, '#F6EEDC', 2, 0); txt(g, 'AUG', 32, 18, 18, PAL.ink, { weight: 800 }); g.restore(); }
  // floor lamp
  seg(g, 300, -26, 300, -226, '#2A2A36', 4); poly(g, [280, -226, 312, -226, 306, -256, 286, -256], '#F2C86A', 2.5);
  gymKit(g, null, 2.5);
  const B = drawYouBody(g, t, S, f, null);
  // the brightest gold in the video
  if (yg > 0.003) {
    goldFx(g, t, [[B.phone, B.head, 60]], yg, lod, 41, 1.35);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + t * 0.2, r0 = 30, r1 = 260;
      g.fillStyle = rgba(PAL.goldHi, 0.12 * yg);
      g.beginPath(); g.moveTo(B.head[0] + Math.cos(a) * r0, B.head[1] + Math.sin(a) * r0);
      g.lineTo(B.head[0] + Math.cos(a - 0.06) * r1, B.head[1] + Math.sin(a - 0.06) * r1);
      g.lineTo(B.head[0] + Math.cos(a + 0.06) * r1, B.head[1] + Math.sin(a + 0.06) * r1); g.fill();
    }
    g.restore();
  } else roomLight(g, t, R, f, [], lod, 41);
  // the blind: down, with your shadow on it; up an inch; then all the way up
  const drop = 334 * (1 - bl);
  if (drop > 1) {
    g.save(); g.beginPath(); g.rect(0, -334, 312, drop); g.clip();
    g.fillStyle = '#A9B1C2'; g.fillRect(0, -334, 312, drop);
    glow(g, 250, -220, 330, '#FFC9A0', 0.34, 'source-over');
    g.fillStyle = 'rgba(80,90,120,0.12)';
    for (let x = 6; x < 312; x += 12) g.fillRect(x, -334, 2, drop);
    const sh = youShadow(t, S, f);
    const proj = (k, a) => { g.save(); g.globalAlpha = a; g.translate(180, -12); g.scale(k, k); g.translate(-180, 12); g.drawImage(sh, 0, -334, 312, 334); g.restore(); };
    proj(1.09, 0.14); proj(1.05, 0.42);
    g.restore();
    // bottom slat and pull cord
    const by = -334 + drop;
    box(g, -2, by - 8, 316, 10, '#8E97AA', 2.5, 2);
    seg(g, 156, by + 2, 156, by + 26, '#5A6070', 2); circ(g, 156, by + 30, 5, '#C9A24E', 2);
  }
  box(g, -2, -334, 316, 14, '#9AA3B6', 3, 3);  // the roller
  GOLD_FROM['9R'] = [B.phone, B.head];
}

// Your front door: the bell (glowing, never rung) and the letterbox, with a chalky print.
function drawYourDoorExtras(g, t, st, lod) {
  const d = P.DOOR, b = P.BELL, lb = P.LETTERBOX;
  const ring = clamp01(st.bellRing || 0), gl = clamp01(st.bellGlow ?? 0.6);
  // chalk handprint on the door edge
  if (lod >= 1) { g.fillStyle = 'rgba(255,255,255,0.3)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(d.x + d.w - 6, d.y + 104 + i * 6, 3, 2, 0.3, 0, TAU); g.fill(); } g.beginPath(); g.ellipse(d.x + d.w - 12, d.y + 124, 6, 8, 0, 0, TAU); g.fill(); }
  // letterbox
  const flap = clamp01(st.letterbox || 0);
  box(g, lb.x - 20, lb.y - 7, 40, 14, '#C9A24E', 2.5, 3);
  g.fillStyle = '#0B0D18'; g.fillRect(lb.x - 15, lb.y - 3, 30, 6);
  if (flap > 0.02) { g.save(); g.translate(lb.x, lb.y - 3); g.scale(1, 1 - flap * 1.8); box(g, -15, 0, 30, 6, '#D9B45A', 1.5); g.restore(); }
  // bell
  const push = ring > 0.05 ? 1.5 : 0;
  glow(g, b.x, b.y, 44 + 10 * gl, '#FFD9A3', 0.35 * gl + 0.5 * ring);
  box(g, b.x - 12, b.y - 16, 24, 32, '#C9A24E', 2.5, 5);
  circ(g, b.x, b.y + push * 0.5, 7 - push * 0.6, mix('#FFE9C0', '#FFFFFF', gl * 0.5), 2);
  if (ring > 0.02) {
    for (let i = 0; i < 3; i++) {
      const u = frac(t * 2.2 + i / 3), r = 14 + u * 60;
      g.strokeStyle = rgba(PAL.goldHi, ring * (1 - u)); g.lineWidth = 4 * (1 - u) + 1.5;
      g.beginPath(); g.arc(b.x, b.y, r, -Math.PI * 0.35, Math.PI * 0.35); g.stroke();
      g.beginPath(); g.arc(b.x, b.y, r, Math.PI * 0.65, Math.PI * 1.35); g.stroke();
    }
    const wob = Math.sin(t * 40) * 0.3 * ring;
    g.save(); g.translate(b.x, b.y - 42); g.rotate(wob); g.globalAlpha = ring;
    g.beginPath(); g.moveTo(-10, 8); g.quadraticCurveTo(-10, -12, 0, -12); g.quadraticCurveTo(10, -12, 10, 8); g.closePath(); inked(g, PAL.gold, 2.5);
    circ(g, 0, 11, 3, PAL.gold, 2);
    g.restore(); g.globalAlpha = 1;
  }
}

// ---------- the lobby (floor 1) ----------
function drawLobby(g, t, S, st, V, lod) {
  const y0 = P.floorTop(1) + 26, y1 = 0;
  for (const side of ['L', 'R']) {
    const x0 = side === 'L' ? 12 : SH.x1 + 12, w = 426;
    g.save(); g.beginPath(); g.rect(x0, y0, w, y1 - y0); g.clip();
    g.fillStyle = '#233B36'; g.fillRect(x0, y0, w, y1 - y0);
    if (lod >= 1) { g.fillStyle = 'rgba(255,255,255,0.035)'; for (let x = x0 + 8; x < x0 + w; x += 26) g.fillRect(x, y0, 10, y1 - y0 - 110); }
    // wood panelling and rail
    g.fillStyle = '#4A3226'; g.fillRect(x0, -110, w, 84);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let x = x0 + 30; x < x0 + w; x += 60) { g.strokeRect(x - 22, -100, 44, 64); }
    g.fillStyle = '#8A6A3C'; g.fillRect(x0, -114, w, 6);
    // chequer floor
    for (let row = 0; row < 2; row++) for (let i = 0; i < 22; i++) {
      g.fillStyle = (i + row) % 2 ? '#7E7564' : '#33333E'; g.beginPath();
      const tw = w / 20, xa = x0 + i * tw - 12, ya = -26 + row * 13, sk = (1 - row) * 3;
      g.moveTo(xa + sk + 3, ya); g.lineTo(xa + tw + sk + 3, ya); g.lineTo(xa + tw + sk, ya + 13); g.lineTo(xa + sk, ya + 13); g.fill();
    }
    g.fillStyle = 'rgba(10,12,30,0.4)'; g.fillRect(x0, -26, w, 26);
    // recessed lights
    for (const lx of [x0 + 110, x0 + 320]) { box(g, lx - 14, y0, 28, 6, '#FFE9C0', 1.5); glow(g, lx, y0 + 20, 220, PAL.lamp, 0.22); }
    if (side === 'L') drawDirectory(g, S, st, t, P.DIRECTORY.x, P.DIRECTORY.y, 1, lod);
    else drawLockers(g, t, st, lod);
    // cut words: the holes in the lobby floor when light comes through
    const cw = clamp01(st.cutWords || 0);
    if (side === 'L' && cw > 0.01) {
      g.save(); g.translate(232, -12); g.scale(1, 0.32); g.globalAlpha = cw;
      txt(g, 'make it good', 0, 0, 70, '#07080F', { font: F.hand, weight: 700 }); g.restore(); g.globalAlpha = 1;
    }
    const cs = g.createLinearGradient(0, y0, 0, y0 + 80); cs.addColorStop(0, 'rgba(5,7,22,0.45)'); cs.addColorStop(1, 'rgba(5,7,22,0)');
    g.fillStyle = cs; g.fillRect(x0, y0, w, 80);
    g.restore();
    g.lineWidth = 4; g.strokeStyle = OUT; g.strokeRect(x0, y0, w, y1 - y0);
  }
}

// The directory board: WHO LIVES HERE. x, y is its top-left; s scales it (1 = 380 × 280).
export function drawDirectory(g, S, st, t, x, y, s = 1, lod = 2) {
  const Wd = 380, Hd = 280, bots = st.bots || {};
  g.save(); g.translate(x, y); g.scale(s, s);
  box(g, 0, 0, Wd, Hd, '#7A5A34', 4, 8);
  box(g, 8, 8, Wd - 16, Hd - 16, '#9A7444', 2, 5);
  box(g, 14, 14, Wd - 28, Hd - 28, '#15161F', 2.5, 3);
  g.fillStyle = 'rgba(255,255,255,0.025)'; for (let yy = 16; yy < Hd - 16; yy += 5) g.fillRect(14, yy, Wd - 28, 1.5);
  txt(g, 'WHO LIVES HERE', Wd / 2, 32, 19, '#E9E1CF', { weight: 800 });
  seg(g, 30, 46, Wd - 30, 46, 'rgba(233,225,207,0.4)', 1.5);
  seg(g, Wd / 2 + 6, 52, Wd / 2 + 6, 226, 'rgba(233,225,207,0.15)', 1.5);
  const lit = clamp01(st.directoryLit || 0);
  const order = []; for (let fl = 2; fl <= 9; fl++) { order.push(`${fl}L`); order.push(`${fl}R`); }
  const rows = ['roof', 10, 9, 8, 7, 6, 5, 4, 3, 2, 'B'];
  const rh = 16, ry0 = 60;
  if (lod === 0 && s * VIEW_Z < 0.7) {
    // too small to read: rows of light
    rows.forEach((fl, i) => {
      const yy = ry0 + i * rh - 2;
      for (const side of ['L', 'R']) {
        const id = `${fl}${side}`, idx = order.indexOf(id), on = idx >= 0 ? clamp01(lit * order.length - idx) : fl === 'B' ? clamp01(st.baseWindow || 0) : fl === 10 ? clamp01(side === 'L' ? bots.molty || 0 : bots.jolly || 0) : fl === 'roof' && side === 'L' ? clamp01(bots.hermes || 0) : 0;
        if (idx < 0 && on <= 0) continue;
        g.fillStyle = on > 0 ? mix('#8C8574', '#FFE9B0', on) : '#8C8574';
        g.fillRect(side === 'L' ? 56 : Wd / 2 + 16, yy, 40 + hash(i * 3 + (side === 'L' ? 0 : 1)) * 60, 5);
      }
    });
    g.fillStyle = '#8A6A3C'; g.fillRect(0, 270, Wd, 34);
    g.restore(); return;
  }
  const short = id => (P.RESIDENTS[id]?.name || '').replace(/\s*\(.*\)/, '');
  rows.forEach((fl, i) => {
    const yy = ry0 + i * rh;
    if (fl === 'B') return;
    txt(g, fl === 'roof' ? 'ROOF' : String(fl), 34, yy, fl === 'roof' ? 9 : 12, '#C9A24E', { weight: 800 });
    const entry = (id, xx, name, on, opts = {}) => {
      const col = on > 0 ? mix('#8C8574', '#FFE9B0', on) : '#8C8574';
      if (on > 0.02) glow(g, xx + 4, yy, 30, PAL.gold, 0.25 * on);
      if (opts.mark) { if (opts.img) g.drawImage(opts.img, xx, yy - 6.5, 13, 13); else box(g, xx, yy - 6, 12, 12, '#555', 1, 2); }
      txt(g, name, xx + (opts.mark ? 17 : 0), yy + 0.5, opts.size || 12.5, opts.col || col, { align: 'left', weight: opts.weight || 700, font: opts.font });
    };
    if (fl === 'roof') { if (bots.hermes > 0.02) { g.globalAlpha = bots.hermes; entry('roof', 56, 'Hermes ☤', 1, { col: '#E9E1CF' }); g.globalAlpha = 1; } else txt(g, '—', 60, yy, 11, '#4A4550', { align: 'left' }); return; }
    if (fl === 10) {
      if (bots.molty > 0.02) { g.globalAlpha = bots.molty; entry('10L', 56, 'Molty · OpenClaw', 1, { mark: 1, img: S?.img?.molty, col: '#E9E1CF', size: 11.5 }); g.globalAlpha = 1; } else txt(g, '—', 60, yy, 11, '#4A4550', { align: 'left' });
      if (bots.jolly > 0.02) { g.globalAlpha = bots.jolly; entry('10R', Wd / 2 + 16, 'Jolly · Muse', 1, { mark: 1, img: S?.img?.muse, col: '#E9E1CF', size: 11.5 }); g.globalAlpha = 1; } else txt(g, '—', Wd / 2 + 20, yy, 11, '#4A4550', { align: 'left' });
      return;
    }
    for (const side of ['L', 'R']) {
      const id = `${fl}${side}`, idx = order.indexOf(id);
      const on = clamp01(lit * order.length - idx);
      const xx = side === 'L' ? 56 : Wd / 2 + 16;
      if (id === '9R') entry(id, xx, 'you', on, { font: F.hand, size: 15, col: on > 0 ? mix('#B8C4F0', '#FFE9B0', on) : '#9AA6D8' });
      else entry(id, xx, short(id), on);
    }
  });
  // CLAWD, basement: its own big line once its window lights (>= 48 px at 1.55 zoom)
  const bwin = clamp01(st.baseWindow || 0), cl = st.clawdLine != null ? clamp01(st.clawdLine) : bwin;
  txt(g, 'B', 34, 231, 12, '#C9A24E', { weight: 800 });
  const pa = Math.max(bwin, cl > 0.001 ? 1 : 0);
  if (pa > 0.02) {
    g.save(); g.globalAlpha = pa;
    glow(g, Wd / 2, 231, 190, '#FFE9C0', 0.4 * pa);
    box(g, 22, 213, Wd - 44, 36, '#2A1A12', 2.5, 5);
    g.lineWidth = 2; g.strokeStyle = '#FF9A5A'; g.strokeRect(25, 216, Wd - 50, 30);
    // written left to right as st.clawdLine rises, with a glowing cursor at the edge
    g.font = `700 31px ${F.pixel}`;
    const line = 'CLAWD · basement', tw = g.measureText(line).width, x0 = Wd / 2 - tw / 2, edge = x0 + tw * cl;
    if (cl > 0.001) {
      g.save(); g.beginPath(); g.rect(0, 205, edge, 52); g.clip();
      txt(g, line, Wd / 2, 232, 31, '#FFB27A', { font: F.pixel, weight: 700 });
      g.restore();
    }
    if (cl > 0.001 && cl < 0.999) {
      glow(g, edge + 3, 232, 26, '#FFE9C0', 0.9);
      g.fillStyle = '#FFF4DC'; g.fillRect(edge + 1, 218, 5, 28);
    }
    g.restore();
  } else txt(g, '—', 60, 231, 11, '#4A4550', { align: 'left' });
  txt(g, 'ALSO HERE ↓', 34, 258, 9, '#C9A24E', { weight: 800, align: 'left' });
  // the rail under the board, with the agents' plates (marks exactly as provided)
  box(g, 0, 270, Wd, 34, '#8A6A3C', 3, 4);
  const plate = (px, pw, p, fn) => {
    if (p <= 0.01) { box(g, px, 274, pw, 26, 'rgba(0,0,0,0.18)', 1.5, 3); return; }
    g.save(); g.translate(px + pw / 2, 287); const k = 0.6 + 0.4 * easeOut(p) + 0.08 * Math.sin(Math.PI * clamp01(p * 1.2)); g.scale(k, k); g.globalAlpha = clamp01(p * 2);
    box(g, -pw / 2, -13, pw, 26, '#F4EEDD', 2.5, 3); fn(-pw / 2); g.restore(); g.globalAlpha = 1;
  };
  plate(2, 224, clamp01(bots.molty || 0), x0 => { if (S?.img?.openai) g.drawImage(S.img.openai, x0 + 4, -10, 20, 20); txt(g, 'Astra ★ · Sol ☀ · Luna ☾', x0 + 28, 0.5, 14.5, '#15161F', { align: 'left', weight: 700 }); });
  plate(232, 70, clamp01(bots.jolly || 0), x0 => { if (S?.img?.grok) g.drawImage(S.img.grok, x0 + 4, -10, 20, 20); txt(g, 'Grok', x0 + 28, 0.5, 16, '#15161F', { align: 'left', weight: 800 }); });
  plate(308, 72, clamp01(bots.hermes || 0), x0 => { txt(g, 'Instinct', x0 + 36, 0.5, 14.5, '#15161F', { weight: 800 }); });
  // the glint
  const gp = st.directoryGlint != null ? clamp01(st.directoryGlint) : frac(t / 7.3) * 2.2;
  if (gp > 0 && gp < 1) {
    g.save(); g.beginPath(); g.rect(0, 0, Wd, Hd); g.clip(); g.globalCompositeOperation = 'lighter';
    const gx = -80 + gp * (Wd + 160), gr = g.createLinearGradient(gx - 40, 0, gx + 40, 0);
    gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(0.5, 'rgba(255,240,200,0.28)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(gx - 40, 0); g.lineTo(gx + 40, 0); g.lineTo(gx - 20, Hd); g.lineTo(gx - 100, Hd); g.fill(); g.restore();
  }
  g.restore();
}

// Parcel lockers: each with a neighbour's name and face; one for the courier.
const LOCKER_FOLK = [
  ['Priya', SK[3], 'long', '#1A1212'], ['Dev', SK[1], 'short', '#6A3E1E'], ['Kai', SK[4], 'cap', '#2A2F45'], ['Mo', SK[2], 'short', '#1A1212'], ['Okafor', SK[4], 'wrap', '#E0A13A'],
  ['Lily', SK[1], 'pigtails', '#8A4A2A'], ['Sam', SK[2], 'beanie', '#2F8A6A'], ['courier', null], ['Nana', SK[0], 'bun', '#D8D4D0'], ['Ines', SK[1], 'long', '#3A1E14'],
  ['Tom', SK[0], 'short', '#B8683A'], ['Ade', SK[5], 'short', '#15100E'], ['Jo', SK[2], 'bob', '#2A1A14'], ['Rui', SK[3], 'short', '#15100E'], ['92', '#F2D2B6', 'you', '#2A1A14'],
];
function drawLockers(g, t, st, lod) {
  const L = P.LOCKERS, cols = 5, rows = 3, cw = L.w / cols, ch = L.h / rows;
  const gold = clamp01(Math.max(st.lockersGold || 0, st.flats?.['1R']?.gold || 0));
  const open = clamp01(st.lockerOpen || 0);
  box(g, L.x - 8, L.y - 8, L.w + 16, L.h + 16, '#2A2F45', 4, 4);
  LOCKER_FOLK.forEach(([name, skin, hs, hair], i) => {
    const c = i % cols, r = Math.floor(i / cols), x = L.x + c * cw + 3, y = L.y + r * ch + 3, w = cw - 6, h = ch - 6;
    box(g, x, y, w, h, '#5B6784', 2.5, 3);
    if (name === 'courier') {
      // inside: its own parcel
      box(g, x + 3, y + 3, w - 6, h - 6, '#141826', 0);
      box(g, x + w / 2 - 18, y + h - 36, 36, 28, '#C9A06A', 2, 2); seg(g, x + w / 2, y + h - 36, x + w / 2, y + h - 8, '#8A6A3A', 2);
      const dw = w * Math.cos(open * 1.35);
      if (dw > 1) { box(g, x, y, dw, h, '#6A7896', 2.5, 3); if (dw > w * 0.5) { txt(g, '📦', x + dw / 2, y + 28, 22, '#FFFFFF'); txt(g, 'courier', x + dw / 2, y + h - 16, 12, '#E9E1CF', { weight: 800 }); } }
      return;
    }
    if (lod >= 1) {
      for (let k = 0; k < 3; k++) seg(g, x + 10, y + 8 + k * 5, x + w - 10, y + 8 + k * 5, 'rgba(0,0,0,0.3)', 2);
      head(g, x + w / 2, y + 40, 15, { f: 1, skin, hs, hair, capCol: hair, lw: 2, mouth: 'smile' });
      box(g, x + 8, y + h - 26, w - 16, 18, '#E9E1CF', 1.5, 2);
      txt(g, name === '92' ? 'you' : name, x + w / 2, y + h - 16.5, name === '92' ? 14 : 11.5, PAL.ink, { weight: 800, font: name === '92' ? F.hand : F.display });
    } else {
      circ(g, x + w / 2, y + 40, 15, skin, 2); g.fillStyle = hair; g.beginPath(); g.arc(x + w / 2, y + 38, 16, Math.PI, TAU); g.fill();
      g.fillStyle = '#E9E1CF'; g.fillRect(x + 8, y + h - 26, w - 16, 18);
    }
    // the lock
    const lx = x + w - 13, ly = y + 40;
    box(g, lx - 5, ly - 2, 10, 9, gold > 0.2 ? PAL.gold : '#9AA0AC', 1.5, 1.5);
    g.strokeStyle = gold > 0.2 ? PAL.gold : '#9AA0AC'; g.lineWidth = 2; g.beginPath(); g.arc(lx, ly - 2, 3.5, Math.PI, TAU); g.stroke();
    if (gold > 0.01) { glow(g, x + w / 2, y + 40, 40, PAL.gold, 0.45 * gold); glow(g, lx, ly, 14, PAL.goldHi, 0.8 * gold); }
  });
}

// ---------- Clawd's basement ----------
function drawBasement(g, t, S, st, V, lod) {
  const x0 = 12, x1 = 1068, y0 = 16, y1 = 440;
  const sw = (st.bulbSwing || 0) + 0.035 * Math.sin(t * 1.1);
  const piv = [300, y0], len = 118;
  const bulb = [piv[0] + Math.sin(sw) * len, piv[1] + Math.cos(sw) * len];
  const bw = clamp01(st.baseWindow || 0), cw = clamp01(st.cutWords || 0);
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  // concrete
  g.fillStyle = '#2A2F48'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 2.5;
  for (let x = x0 + 170; x < x1; x += 180) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1 - 26); g.stroke(); }
  g.beginPath(); g.moveTo(x0, 230); g.lineTo(x1, 230); g.stroke();
  if (lod >= 1) {
    g.fillStyle = 'rgba(0,0,0,0.28)';
    for (let x = x0 + 45; x < x1; x += 90) for (const yy of [120, 330]) { g.beginPath(); g.arc(x, yy, 4, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(10,12,24,0.18)';
    for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(80 + i * 150 + hash(i) * 60, 30 + hash(i + 3) * 30, 24 + hash(i) * 20, 50 + hash(i * 3) * 60, 0, 0, TAU); g.fill(); }
  }
  // floor
  g.fillStyle = '#23263C'; g.fillRect(x0, y1 - 26, x1 - x0, 26); g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x0, y1 - 26, x1 - x0, 3);
  box(g, 700, y1 - 18, 50, 8, '#15161F', 1.5, 2);
  // pipes along the ceiling
  box(g, x0, 30, 426, 14, '#4A4E64', 2.5, 7); for (let x = 60; x < 430; x += 90) box(g, x, 26, 10, 22, '#3A3E54', 2, 2);
  box(g, 642, 38, 426, 10, '#5A4A3A', 2, 5);
  // pegboard and bench
  const B = P.BENCH;
  box(g, 70, 170, 300, 120, '#6E5A44', 3, 3);
  if (lod >= 1) { g.fillStyle = 'rgba(0,0,0,0.3)'; for (let yy = 180; yy < 285; yy += 14) for (let xx = 80; xx < 365; xx += 14) g.fillRect(xx, yy, 3, 3); }
  // tool outlines (one missing) and tools
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2.5; g.setLineDash([5, 4]); g.strokeRect(300, 190, 44, 70); g.setLineDash([]);
  seg(g, 96, 188, 96, 260, '#9AA0AC', 6); box(g, 84, 184, 24, 14, '#5A5E68', 2, 2);
  seg(g, 140, 190, 140, 262, '#C9A24E', 5); circ(g, 140, 190, 9, null, 2.5);
  g.strokeStyle = '#C8553D'; g.lineWidth = 7; g.beginPath(); g.moveTo(186, 200); g.lineTo(204, 250); g.moveTo(214, 200); g.lineTo(196, 250); g.stroke();
  box(g, 236, 196, 44, 60, '#8A8F9A', 2.5, 3); for (let i = 0; i < 5; i++) seg(g, 240, 204 + i * 10, 276, 204 + i * 10, '#5A5E68', 2);
  box(g, B.x, B.y, B.w, 18, '#8A6A44', 3, 2);
  box(g, B.x + 10, B.y + 18, 14, B.h - 44, '#6E5A44', 2.5); box(g, B.x + B.w - 24, B.y + 18, 14, B.h - 44, '#6E5A44', 2.5);
  box(g, B.x + 10, B.y + 86, B.w - 20, 10, '#6E5A44', 2.5);
  for (let i = 0; i < 4; i++) box(g, B.x + 30 + i * 70, B.y + 60, 54, 26, ['#8A6A44', '#5B6784', '#8A6A44', '#6E4A36'][i], 2, 2);
  // on the bench: a terminal glowing orange, a vice, a jar, a mug of pens
  box(g, 96, 240, 96, 60, '#2A2A36', 3, 6); box(g, 104, 247, 80, 44, '#120C08', 0, 3);
  g.fillStyle = '#FF9A5A'; g.font = `600 11px ${F.pixel}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillText('> make it good', 108, 262); g.fillText('> for: ____', 108, 276); if (frac(t * 1.6) < 0.5) g.fillRect(108, 280, 7, 9);
  glow(g, 144, 270, 90, PAL.clawd, 0.25);
  box(g, 206, 280, 34, 20, '#5A5E68', 2.5, 2); box(g, 214, 268, 18, 14, '#5A5E68', 2, 2);
  box(g, 256, 272, 26, 28, 'rgba(180,220,255,0.35)', 2.5, 4); for (let i = 0; i < 5; i++) circ(g, 262 + (i % 3) * 7, 292 - Math.floor(i / 3) * 7, 2.5, '#C9A24E', 0);
  box(g, 300, 276, 24, 24, '#D97757', 2.5, 3); seg(g, 306, 276, 302, 258, '#FFC23D', 3); seg(g, 314, 276, 318, 256, '#4FA3C8', 3);
  box(g, 336, 286, 40, 14, '#F6EEDC', 2, 1);
  // the small high window
  const Wn = P.BASE_WINDOW;
  box(g, Wn.x - 7, Wn.y - 5, Wn.w + 14, Wn.h + 12, '#3A3E54', 3, 3);
  const wg = g.createLinearGradient(0, Wn.y, 0, Wn.y + Wn.h);
  wg.addColorStop(0, mix('#0A0F26', '#FFF4DC', bw)); wg.addColorStop(1, mix('#141A38', '#FFE9C0', bw));
  g.fillStyle = wg; g.fillRect(Wn.x, Wn.y, Wn.w, Wn.h);
  if (bw < 0.5) { g.fillStyle = 'rgba(160,180,255,0.12)'; g.beginPath(); g.moveTo(Wn.x + 20, Wn.y); g.lineTo(Wn.x + 50, Wn.y); g.lineTo(Wn.x + 20, Wn.y + Wn.h); g.lineTo(Wn.x - 10, Wn.y + Wn.h); g.fill(); }
  // bars on the window, then grass tufts at street level outside
  for (let i = 1; i < 4; i++) seg(g, Wn.x + i * Wn.w / 4, Wn.y, Wn.x + i * Wn.w / 4, Wn.y + Wn.h, '#3A3E54', 4, 'butt');
  g.lineWidth = 3; g.strokeStyle = OUT; g.strokeRect(Wn.x, Wn.y, Wn.w, Wn.h);
  // the chute: the pipe comes down the wall into a brass receiver with a flap, a basket beneath
  const Cm = P.CHUTE_MOUTH, rx = Cm.x - 6;
  box(g, Cm.x - 9, 44, 18, 40, '#B58A4A', 2.5);
  box(g, Cm.x - 12, 60, 24, 6, '#8A6A3A', 1.5, 2);
  box(g, rx - 34, Cm.y - 40, 68, 56, '#B58A4A', 3, 8);
  g.fillStyle = 'rgba(255,230,170,0.35)'; g.fillRect(rx - 28, Cm.y - 36, 6, 46);
  for (const [bx, by] of [[-28, -34], [28, -34], [-28, 10], [28, 10]]) circ(g, rx + bx, Cm.y + by, 2.2, '#6E4A22', 0);
  box(g, rx - 22, Cm.y - 30, 44, 14, '#2A1E10', 1.5, 2);
  txt(g, 'TICKETS', rx, Cm.y - 22.5, 8.5, '#E0B870', { font: F.pixel, weight: 700 });
  box(g, rx - 26, Cm.y - 8, 52, 20, '#8A6A3A', 2.5, 3);
  g.fillStyle = '#0B0D18'; g.fillRect(rx - 20, Cm.y + 4, 40, 5);
  if (st.capsule && st.capsule.p != null && st.capsule.p < 0.03) glow(g, rx, Cm.y + 8, 50, PAL.lamp, 0.6);
  // wire basket
  g.strokeStyle = '#8A8F9A'; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(rx - 30, Cm.y + 26); g.lineTo(rx - 24, Cm.y + 52); g.lineTo(rx + 24, Cm.y + 52); g.lineTo(rx + 30, Cm.y + 26); g.stroke();
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(rx + i * 12, Cm.y + 26); g.lineTo(rx + i * 10, Cm.y + 52); g.stroke(); }
  // right side: boiler, crates, mop, the fuse box
  box(g, 690, 160, 90, 254, '#6E7482', 3, 30); box(g, 704, 250, 62, 44, '#5A5E68', 2, 4); circ(g, 735, 210, 14, '#F6EEDC', 2); seg(g, 735, 210, 735 + Math.cos(t * 0.3) * 9, 210 + Math.sin(t * 0.3) * 9, OUT, 2);
  glow(g, 735, 380, 40, '#FF6A3A', 0.25 + 0.1 * Math.sin(t * 5));
  for (let i = 0; i < 3; i++) box(g, 800 + (i % 2) * 20, 414 - (i + 1) * 40, 64, 40, '#7A5A3A', 2.5, 2);
  seg(g, 1046, 414, 1030, 250, '#9A7A4A', 5); ell(g, 1030, 246, 14, 8, '#C9C3B0', 2);
  // lighting: dark everywhere the bulb doesn't reach
  const shade = g.createRadialGradient(bulb[0], bulb[1] + 40, 60, bulb[0], bulb[1] + 60, 620);
  shade.addColorStop(0, 'rgba(4,6,16,0)'); shade.addColorStop(0.45, 'rgba(4,6,16,0.35)'); shade.addColorStop(1, 'rgba(4,6,16,0.72)');
  g.fillStyle = shade; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  // light: the lobby's life through the cut words, on top of the dark
  if (cw > 0.01) drawCutWords(g, t, st, cw, sw);
  drawFuseBox(g, t, st, lod);
  glow(g, 960, 150, 170, '#FFE6B8', 0.18);   // the fuse box's own little lamp
  // bulb light
  glow(g, bulb[0], bulb[1], 420, PAL.bulb, 0.34 * (1 - 0.55 * cw));
  glow(g, bulb[0], y1 - 12, 200, PAL.bulb, 0.18 * (1 - 0.5 * cw));
  // dust in the light
  if (lod >= 1) for (let i = 0; i < 26; i++) {
    const a = hash(i * 3.1) * TAU, rr = 30 + hash(i * 7.7) * 200;
    const dx = bulb[0] + Math.cos(a + t * 0.05) * rr + Math.sin(t * 0.3 + i) * 10, dy = bulb[1] + 30 + Math.sin(a) * rr * 0.8 + Math.cos(t * 0.23 + i) * 12;
    g.globalAlpha = 0.25 + 0.35 * Math.sin(t + i); g.fillStyle = '#FFF1D6'; g.fillRect(dx, dy, 2.2, 2.2);
  }
  g.globalAlpha = 1;
  // the window lights warm white (Clawd mattering; gold stays for "served by this build")
  if (bw > 0.01) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const bgr = g.createLinearGradient(Wn.x, Wn.y, Wn.x + 260, 440);
    bgr.addColorStop(0, rgba('#FFF4DC', 0.55 * bw)); bgr.addColorStop(1, rgba('#FFE9C0', 0));
    g.fillStyle = bgr; g.beginPath(); g.moveTo(Wn.x, Wn.y + Wn.h); g.lineTo(Wn.x + Wn.w, Wn.y); g.lineTo(Wn.x + Wn.w + 330, 440); g.lineTo(Wn.x + 160, 440); g.closePath(); g.fill();
    g.restore();
    glow(g, Wn.x + Wn.w / 2, Wn.y + Wn.h / 2, 220, '#FFE9C0', 0.5 * bw);
    for (let i = 0; i < 8; i++) { const u = frac(t * 0.3 + i / 8); sparkle(g, Wn.x + 60 + u * 250 + hash(i) * 60, Wn.y + 80 + u * 280, 4 + 4 * hash(i * 3), '#FFF8EC', bw * Math.sin(Math.PI * u)); }
  }
  // the bulb on its flex
  seg(g, piv[0], piv[1], bulb[0], bulb[1] - 16, '#15161F', 2.5);
  box(g, bulb[0] - 7, bulb[1] - 20, 14, 12, '#3A3E54', 2, 2);
  circ(g, bulb[0], bulb[1], 12, '#FFF3D0', 2.5);
  glow(g, bulb[0], bulb[1], 60, '#FFF3D0', 0.8);
  g.restore();
  // basement outline and walls around the shaft pit
  g.lineWidth = 4; g.strokeStyle = OUT; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
}
function drawFuseBox(g, t, st, lod) {
  const Fb = P.FUSE, note = clamp01(st.fuseNote || 0), fl = clamp01(st.fuseLabel || 0);
  box(g, Fb.x - 24, 96, 48, 24, '#3A3E54', 2, 3); box(g, Fb.x - 16, 104, 32, 14, '#FFE6B8', 1.5, 6);  // caged lamp
  box(g, Fb.x, Fb.y, Fb.w, Fb.h, '#7A8090', 3.5, 6);
  box(g, Fb.x + 10, Fb.y + 10, Fb.w - 20, Fb.h - 20, '#DCD8CC', 2.5, 3);
  const labels = ['LOBBY', 'LIFT', 'FL 2-5', 'FL 6-9', 'TOP', 'LOGS'];
  labels.forEach((lb, i) => {
    const yy = Fb.y + 24 + i * 29;
    box(g, Fb.x + 20, yy - 9, 22, 18, '#2A2A36', 2, 3);
    box(g, Fb.x + 25 + (hash(i) > 0.3 ? 8 : 0), yy - 6, 8, 12, '#E9E1CF', 1.2, 2);
    circ(g, Fb.x + 52, yy, 3.5, i === 5 && fl < 0.5 ? '#FFC23D' : '#4ADE80', 1);
    if (i === 5) {
      // the smudged label, rewritten later in your hand
      if (fl < 0.5) { box(g, Fb.x + 62, yy - 9, 66, 18, '#EFE8D8', 1.5, 2); g.fillStyle = 'rgba(40,40,60,0.45)'; g.beginPath(); g.ellipse(Fb.x + 94, yy, 26, 6, 0.1, 0, TAU); g.fill(); txt(g, 'L??S', Fb.x + 94, yy + 0.5, 11, 'rgba(30,30,50,0.6)', { font: F.pixel }); }
      else { box(g, Fb.x + 62, yy - 11, 70, 22, '#F6EEDC', 1.5, 2); txt(g, 'diags ✓', Fb.x + 97, yy + 1, 15, PAL.ink, { font: F.hand, weight: 700 }); if (fl > 0.5) glow(g, Fb.x + 97, yy, 60, PAL.gold, 0.6 * fl); }
    } else { box(g, Fb.x + 62, yy - 9, 66, 18, '#F6F2E8', 1.5, 2); txt(g, lb, Fb.x + 95, yy + 0.5, 11, '#2A2A36', { font: F.pixel, weight: 700 }); }
  });
  if (note > 0.01) {
    g.save(); g.translate(Fb.x + Fb.w - 10, Fb.y - 16); g.rotate(0.08); g.globalAlpha = note;
    box(g, -44, -22, 88, 44, '#FFF3A8', 2, 2); box(g, -12, -26, 24, 8, 'rgba(255,255,255,0.6)', 0);
    txt(g, 'diags pls', 0, 2, 19, PAL.ink, { font: F.hand, weight: 700 });
    g.restore(); g.globalAlpha = 1;
  }
}
// "make it good", cut through the basement ceiling in your handwriting: the only light from upstairs.
// Crisp shafts: the words extruded downward (cached), the words themselves legible at three depths
// inside the light, and projected on the floor; all of it leans as the bulb swings.
const WORDS = 'make it good';
function wordBeam() {
  if (C.beam) return C.beam;
  const k = 2, bw = 560, bh = 430, c = mk(bw * k, bh * k), g = c.getContext('2d');
  g.scale(k, k);
  for (let i = 0; i < 150; i++) {
    const u = i / 150;
    g.save(); g.translate(bw / 2, 12 + i * 2.6); g.scale(1 + u * 0.16, 0.34 + u * 0.3);
    g.globalAlpha = 0.03 * Math.pow(1 - u, 1.1);
    txt(g, WORDS, 0, 0, 74, '#FFE9B8', { font: F.hand, weight: 700 });
    g.restore();
  }
  C.beam = { c, w: bw, h: bh };
  return C.beam;
}
function drawCutWords(g, t, st, cw, sw) {
  const cx = 232, cy = 22, B = wordBeam();
  const shear = Math.tan(sw * 0.9);
  g.save();
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, cw * 1.2);
  g.translate(cx, cy - 12); g.transform(1, 0, shear, 1, 0, 0);
  g.drawImage(B.c, -B.w / 2, 0, B.w, B.h);
  g.restore();
  // the words, legible inside the light
  for (let i = 1; i <= 3; i++) {
    const d = i * 98, u = d / 400;
    g.save(); g.globalCompositeOperation = 'lighter';
    g.translate(cx + d * shear, cy + d); g.scale(1 + u * 0.16, 0.34 + u * 0.3 + 0.08);
    g.globalAlpha = cw * (0.62 - i * 0.12);
    txt(g, WORDS, 0, 0, 74, '#FFF1CC', { font: F.hand, weight: 700 });
    g.restore();
  }
  // the projection on the floor
  g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx + 400 * shear, 420); g.scale(1.3, 0.46); g.globalAlpha = cw * 0.75;
  txt(g, WORDS, 0, 0, 74, '#FFE6A8', { font: F.hand, weight: 700 }); g.restore();
  // the letters themselves, bright in the ceiling
  g.save(); g.translate(cx, cy); g.scale(1, 0.34);
  g.globalAlpha = cw; txt(g, WORDS, 0, 0, 74, '#FFF6DE', { font: F.hand, weight: 700 });
  g.restore(); g.globalAlpha = 1;
  glow(g, cx, cy + 10, 200, PAL.lamp, 0.18 * cw);
}

// ---------- the older basements (bridge) ----------
// Three eras, each with its own palette and kit. Geometry (room rects, desk, builder, the wall and its
// top) is mirrored by sec-c.js, so it stays fixed: desk at (x0 + 150, floor - 110), the wall from
// x1 - 400 to x1 - 40 with its top at floor - 330. The wall carries a handoff sign, not a slogan.
const ERAS = [
  { i: 0, x0: 40, x1: 1040, glow: '#9FC9FF', wall: ['#2E4664', '#3C5A7C'], floor: '#46506A', pwall: '#DCE2EA', label: ['#FFFFFF', '#2E6BD8'] },
  { i: 1, x0: 90, x1: 990, glow: '#E9E2C8', wall: ['#8E8468', '#A99C7C'], floor: '#56607A', pwall: '#CFC3A2', label: ['#EFE6CF', '#2F6E6E'] },
  { i: 2, x0: 140, x1: 940, glow: '#7CFF9B', wall: ['#3E2C1C', '#54402A'], floor: '#7A4A2A', pwall: '#6E5234', label: ['#E0782E', '#2A1A0E'] },
];
function floppy(g, x, y, s, col) {
  box(g, x - 10 * s, y - 10 * s, 20 * s, 20 * s, col, 1.5, 1.5);
  g.fillStyle = '#C9CED6'; g.fillRect(x - 5 * s, y - 10 * s, 10 * s, 7 * s);
  g.fillStyle = '#EFE6CF'; g.fillRect(x - 7 * s, y + 1 * s, 14 * s, 8 * s);
}
function handoffSign(g, t, E, wx0, wx1, wy0, y1) {
  const wc = (wx0 + wx1) / 2, py = wy0 + 118;
  // the arrow: up from the sign and over the top of the wall
  g.strokeStyle = E.i === 0 ? '#2E6BD8' : E.i === 1 ? '#2F6E6E' : '#E0782E'; g.lineWidth = 11; g.lineCap = 'round';
  g.beginPath(); g.moveTo(wc + 110, py - 52); g.lineTo(wc + 110, wy0 + 28); g.quadraticCurveTo(wc + 110, wy0 - 34, wc + 150, wy0 - 34); g.stroke();
  const hx = wc + 162, hy = wy0 - 34;
  poly(g, [hx + 12, hy, hx - 8, hy - 16, hx - 8, hy + 16], g.strokeStyle, 2.5);
  // the sign
  const sw = 300, sh = 104, sx = wc - sw / 2, sy = py - 52;
  if (E.i === 0) { box(g, sx, sy, sw, sh, '#1E2A44', 3, 10); }
  else if (E.i === 1) { box(g, sx, sy, sw, sh, '#F6F4EC', 3, 1); g.fillStyle = 'rgba(220,210,160,0.7)'; g.fillRect(sx + 20, sy - 6, 40, 12); g.fillRect(sx + sw - 60, sy - 6, 40, 12); }
  else { box(g, sx, sy, sw, sh, '#C9A24E', 3, 4); box(g, sx + 6, sy + 6, sw - 12, sh - 12, null, 1.5, 2); for (const [bx, by] of [[10, 10], [sw - 10, 10], [10, sh - 10], [sw - 10, sh - 10]]) circ(g, sx + bx, sy + by, 3, '#8A6A2A', 1); }
  const ink = E.i === 0 ? '#FFFFFF' : E.i === 1 ? '#15161F' : '#2A1A0E', font = E.i === 1 ? F.mono : F.display;
  txt(g, 'USERS', wc, py - 20, 40, ink, { weight: 800, font });
  txt(g, '→ PRODUCT TEAM', wc, py + 24, 30, ink, { weight: 800, font });
}
function drawStrata(g, t, S, st, V, lod) {
  const sv = clamp01(st.strata || 0);
  ERAS.forEach((E, i) => {
    const Sd = P.STRATA[i], y0 = Sd.top + 34, y1 = Sd.floor;
    if (!seen(V, E.x0, y0, E.x1, y1)) return;
    const a = smooth(clamp01(sv * 3 - i));
    if (a < 0.005) {
      if (i === 0 && lod >= 1) { g.strokeStyle = rgba(E.glow, 0.12); g.lineWidth = 3; g.beginPath(); g.moveTo(300, y0 - 2); g.lineTo(330, y0 + 30); g.lineTo(318, y0 + 60); g.stroke(); }
      return;
    }
    const flick = a < 1 ? (frac(t * 11 + i) > 0.35 ? 1 : 0.55) : 1;
    const dx = E.x0 + 150, dy = y1 - 110, wx0 = E.x1 - 400, wx1 = E.x1 - 40, wy0 = y1 - 330;
    g.save(); g.globalAlpha = a;
    g.beginPath(); g.rect(E.x0, y0, E.x1 - E.x0, y1 - y0); g.clip();
    const wg = g.createLinearGradient(0, y0, 0, y1); wg.addColorStop(0, E.wall[0]); wg.addColorStop(1, E.wall[1]);
    g.fillStyle = wg; g.fillRect(E.x0, y0, E.x1 - E.x0, y1 - y0);
    g.fillStyle = E.floor; g.fillRect(E.x0, y1 - 28, E.x1 - E.x0, 28);
    g.lineWidth = 2;
    if (i === 0) {
      // 2010s: painted brick, a neon </>, a whiteboard of stickies, a beanbag, a plant
      g.strokeStyle = 'rgba(255,255,255,0.06)';
      for (let y = y0, r = 0; y < y1 - 28; y += 22, r++) { g.beginPath(); g.moveTo(E.x0, y); g.lineTo(E.x1, y); g.stroke(); for (let x = E.x0 + (r % 2) * 24; x < E.x1; x += 48) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 22); g.stroke(); } }
      box(g, E.x0 + 30, y0 + 96, 150, 96, '#F4F6F8', 3, 3);
      for (let k = 0; k < 6; k++) box(g, E.x0 + 42 + (k % 3) * 44, y0 + 108 + Math.floor(k / 3) * 40, 32, 30, ['#FFE36A', '#FF9AB0', '#8CE0FF', '#B8F08A', '#FFB86A', '#FFE36A'][k], 1.5, 1);
      glow(g, E.x0 + 330, y0 + 120, 120, '#FF5AA8', 0.35 * flick);
      txt(g, '</>', E.x0 + 330, y0 + 122, 56, '#FF8AC8', { weight: 800, font: F.mono, stroke: 0 });
      ell(g, E.x0 + 62, y1 - 52, 50, 30, '#E0703A', 3);
      box(g, E.x1 - 452, y1 - 80, 34, 52, '#F4F4F0', 2.5, [3, 3, 8, 8]);
      for (let k = 0; k < 5; k++) ell(g, E.x1 - 435 + (k - 2) * 9, y1 - 96 - (k % 2) * 10, 7, 14, '#3F9A5A', 2, (k - 2) * 0.4);
      // standing desk and a laptop seen from behind, its lid covered in stickers
      box(g, dx - 30, dy, 250, 12, '#D8D2C4', 3); seg(g, dx - 10, dy + 12, dx - 10, y1 - 28, '#8A9AB0', 7); seg(g, dx + 200, dy + 12, dx + 200, y1 - 28, '#8A9AB0', 7);
      glow(g, dx + 150, dy - 34, 200, E.glow, 0.5 * flick);
      poly(g, [dx + 108, dy, dx + 192, dy, dx + 186, dy - 62, dx + 114, dy - 62], '#C9CED8', 3);
      circ(g, dx + 132, dy - 44, 7, '#FF6A8A', 1.5); box(g, dx + 150, dy - 50, 16, 12, '#FFE36A', 1.5, 3);
      poly(g, [dx + 170, dy - 30, dx + 176, dy - 20, dx + 170, dy - 12, dx + 162, dy - 12, dx + 156, dy - 20, dx + 162, dy - 30], '#6AD0A0', 1.5);
      circ(g, dx + 128, dy - 18, 5, '#8CB8FF', 1.5); txt(g, '★', dx + 150, dy - 20, 13, '#B08CFF');
      box(g, dx + 20, dy - 34, 18, 34, '#3A3A48', 2, 3);
    } else if (i === 1) {
      // 1990s: a drop ceiling and a strip light, a cubicle, a beige CRT, a grey tower, floppies
      g.fillStyle = '#D8D2C0'; g.fillRect(E.x0, y0, E.x1 - E.x0, 40);
      g.strokeStyle = 'rgba(0,0,0,0.18)'; for (let x = E.x0; x < E.x1; x += 60) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + 40); g.stroke(); }
      box(g, E.x0 + 180, y0 + 34, 200, 12, '#F4FAFF', 2, 2); glow(g, E.x0 + 280, y0 + 60, 260, '#E8F4FF', 0.3 * flick);
      box(g, dx - 50, dy - 170, 300, 170, '#6E7C8E', 3, 3);
      g.fillStyle = 'rgba(255,255,255,0.05)'; for (let k = 0; k < 30; k++) g.fillRect(dx - 44 + hash(k * 3) * 288, dy - 164 + hash(k * 7) * 160, 3, 3);
      box(g, dx - 30, dy, 260, 14, '#C9B99A', 3); box(g, dx - 24, dy + 14, 90, y1 - 28 - dy - 14, '#B8A888', 2.5);
      glow(g, dx + 150, dy - 60, 190, E.glow, 0.42 * flick);
      box(g, dx + 96, dy - 104, 108, 92, '#DCD2B4', 3, 6); box(g, dx + 108, dy - 94, 84, 64, '#EDE6CC', 2, 8);
      g.fillStyle = 'rgba(40,60,50,0.55)'; for (let k = 0; k < 5; k++) g.fillRect(dx + 116, dy - 86 + k * 11, 30 + hash(k) * 36, 4);
      box(g, dx + 110, dy - 12, 80, 12, '#C9B99A', 2);
      box(g, dx + 208, dy - 96, 40, 96, '#B8B8B0', 3, 2); box(g, dx + 214, dy - 84, 28, 6, '#8A8A84', 1); circ(g, dx + 228, dy - 20, 4, '#4ADE80', 1);
      floppy(g, dx - 8, dy - 12, 1, '#2F4E8C'); floppy(g, dx + 18, dy - 12, 1, '#15161F'); floppy(g, dx + 44, dy - 12, 1, '#C8304A');
      box(g, dx + 60, dy - 20, 30, 18, '#DCD2B4', 2, 3);
    } else {
      // 1970s: wood panelling and a supergraphic, a mainframe with tape reels, green phosphor, punch cards
      g.strokeStyle = 'rgba(0,0,0,0.25)'; for (let x = E.x0 + 24; x < E.x1; x += 48) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1 - 28); g.stroke(); }
      ['#8A3A1A', '#C8642A', '#E0A040'].forEach((c, k) => { g.fillStyle = c; g.fillRect(E.x0, y0 + 60 + k * 16, E.x1 - E.x0, 12); });
      box(g, E.x0 + 16, y0 + 120, 104, y1 - 28 - y0 - 120, '#C9C2AE', 3, 3);
      for (let k = 0; k < 2; k++) { const cy = y0 + 170 + k * 90; circ(g, E.x0 + 68, cy, 30, '#2A2420', 3); g.save(); g.translate(E.x0 + 68, cy); g.rotate(t * (k ? -2 : 2.4)); for (let q = 0; q < 3; q++) { g.rotate(TAU / 3); seg(g, 0, 0, 24, 0, '#8A8270', 4); } g.restore(); circ(g, E.x0 + 68, cy, 6, '#8A8270', 1.5); }
      for (let k = 0; k < 12; k++) circ(g, E.x0 + 34 + (k % 4) * 22, y0 + 350 + Math.floor(k / 4) * 20, 4.5, frac(t * 2 + k * 0.37) > 0.5 ? ['#7CFF9B', '#FF6A5A', '#FFC23D'][k % 3] : '#3A3226', 1);
      box(g, dx, dy, 220, 14, '#8A5A36', 3); box(g, dx + 8, dy + 14, 12, y1 - 28 - dy - 14, '#6E4A2A', 2); box(g, dx + 200, dy + 14, 12, y1 - 28 - dy - 14, '#6E4A2A', 2);
      glow(g, dx + 160, dy - 48, 220, E.glow, 0.5 * flick);
      box(g, dx + 116, dy - 90, 92, 90, '#B8AE92', 3, 4); box(g, dx + 126, dy - 80, 72, 54, '#061A0C', 2, 6);
      g.fillStyle = E.glow; g.font = `600 10px ${F.mono}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      for (let k = 0; k < 4; k++) g.fillText(['RUN JOB', 'OK', 'READY', '> _'][k], dx + 132, dy - 66 + k * 12);
      for (let k = 0; k < 6; k++) box(g, dx + 8 + k * 5, dy - 20 - k * 2, 56, 18, '#EFE6CF', 1.2, 1);
      g.fillStyle = '#6A5642'; for (let q = 0; q < 8; q++) g.fillRect(dx + 44 + q * 2.5, dy - 26, 1.5, 3);
      // green-bar fanfold spilling to the floor
      for (let k = 0; k < 5; k++) { box(g, dx + 216 - k * 6, dy + 16 + k * 16, 60, 16, k % 2 ? '#E9F2DE' : '#CFE6C6', 1.2, 0); }
    }
    // the wall, with its handoff sign
    box(g, wx0, wy0, wx1 - wx0, y1 - wy0, E.pwall, 3, 2);
    if (i === 0) { g.strokeStyle = 'rgba(0,0,0,0.08)'; for (let y = wy0 + 20, r = 0; y < y1; y += 20, r++) { g.beginPath(); g.moveTo(wx0, y); g.lineTo(wx1, y); g.stroke(); } }
    if (i === 2) { g.strokeStyle = 'rgba(0,0,0,0.22)'; for (let x = wx0 + 30; x < wx1; x += 30) { g.beginPath(); g.moveTo(x, wy0); g.lineTo(x, y1); g.stroke(); } }
    handoffSign(g, t, E, wx0, wx1, wy0, y1);
    // the builder, alone at the desk
    const lob = st.lob != null ? clamp01(st.lob - i * 0.08) : 0;
    const type = Math.sin(t * 12 + i * 2) * 3;
    const sil = ['#101A2A', '#2A2418', '#1E140A'][i];
    const throwing = lob > 0.01;
    const bp = person(g, { x: dx + 60, y: dy - 20, s: 0.95, face: 1, sil, fl: [dx + 70, y1 - 30], fr: [dx + 86, y1 - 30],
      hl: throwing ? [dx + 40 + lob * 60, dy - 110 - Math.sin(lob * Math.PI) * 60] : [dx + 110, dy - 6 + type], hrt: [dx + 124, dy - 6 - type],
      hs: ['short', 'bob', 'short'][i], lean: -0.1 * Math.sin(lob * Math.PI) });
    if (i === 0) { g.strokeStyle = sil; g.lineWidth = 5; g.beginPath(); g.arc(bp.head[0], bp.head[1], 22, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    if (i === 2) { g.strokeStyle = '#E9E2C8'; g.lineWidth = 2; for (const sd of [-1, 1]) { g.beginPath(); g.arc(bp.head[0] + 6 + sd * 7, bp.head[1] + 1, 6, 0, TAU); g.stroke(); } }
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(E.glow, 0.6 * flick); g.lineWidth = 3;
    g.beginPath(); g.arc(bp.head[0], bp.head[1], 19, -Math.PI * 0.4, Math.PI * 0.35); g.stroke(); g.restore();
    box(g, dx + 36, dy + 30, 50, 8, sil, 0); seg(g, dx + 40, dy + 38, dx + 40, y1 - 28, sil, 5);
    g.restore();
    g.globalAlpha = a; g.lineWidth = 5; g.strokeStyle = OUT; g.strokeRect(E.x0, y0, E.x1 - E.x0, y1 - y0);
    // the decade, big
    if (a > 0.3) {
      g.globalAlpha = smooth((a - 0.3) / 0.7);
      box(g, E.x0 + 22, y0 + 20, 176, 64, E.label[0], 3.5, E.i === 0 ? 14 : 4);
      txt(g, Sd.era, E.x0 + 110, y0 + 53, 46, E.label[1], { weight: 800, font: E.i === 1 ? F.pixel : F.display });
    }
    g.globalAlpha = 1;
  });
}

// ---------- the glass lift shaft ----------
function drawShaft(g, t, st, V, lod) {
  const x0 = SH.x0, x1 = SH.x1, top = P.ROOF_Y - 110, bot = P.BASE.floor;
  if (!seen(V, x0, top, x1, bot)) return;
  const ya = Math.max(top, V.y0 - 20), yb = Math.min(bot, V.y1 + 20);
  g.fillStyle = '#121833'; g.fillRect(x0, ya, x1 - x0, yb - ya);
  // back-wall rails and cables
  for (const rx of [462, 618]) { g.fillStyle = '#3A4264'; g.fillRect(rx - 4, ya, 8, yb - ya); }
  const carTop = st.lift.y - P.CAR.h;
  if (carTop > top) { seg(g, 532, top + 40, 532, carTop, '#6A7090', 2.5, 'butt'); seg(g, 548, top + 40, 548, carTop, '#6A7090', 2.5, 'butt'); }
  // landings: doors in the back wall, floor numbers, sills
  for (let fl = 0; fl <= P.FLOORS; fl++) {
    const y = fl === 0 ? P.BASE.floor : P.floorLevel(fl);
    if (y < V.y0 - 20 || y - 300 > V.y1) continue;
    box(g, 482, y - 228, 116, 228, '#1C2244', 2.5, 2);
    box(g, 486, y - 222, 53, 222, '#2A3258', 2); box(g, 541, y - 222, 53, 222, '#2A3258', 2);
    const lbl = fl === 0 ? 'B' : String(fl);
    const tf = topFade(g, y - 290);
    if (tf < 0.02) continue;
    g.globalAlpha = tf;
    circ(g, 540, y - 290, 19, '#15161F', 2.5);
    txt(g, lbl, 540, y - 289, 22, fl === 9 ? PAL.goldHi : '#FFE3B0', { weight: 800 });
    glow(g, 540, y - 290, 40, PAL.lamp, 0.18);
    g.globalAlpha = 1;
    // call button
    box(g, 604, y - 150, 10, 22, '#3A4264', 1.5, 2); circ(g, 609, y - 139, 3, '#FFC23D', 0);
    // sills
    g.fillStyle = '#5A6288'; g.fillRect(x0, y - 2, 14, 8); g.fillRect(x1 - 14, y - 2, 14, 8);
  }
  // glass: soft reflections
  g.save(); g.globalCompositeOperation = 'lighter';
  const refl = g.createLinearGradient(x0, 0, x1, 0);
  refl.addColorStop(0, 'rgba(160,190,255,0.07)'); refl.addColorStop(0.2, 'rgba(160,190,255,0)'); refl.addColorStop(0.7, 'rgba(160,190,255,0)'); refl.addColorStop(0.82, 'rgba(160,190,255,0.06)'); refl.addColorStop(1, 'rgba(160,190,255,0)');
  g.fillStyle = refl; g.fillRect(x0, ya, x1 - x0, yb - ya);
  g.restore();
  g.lineWidth = 4; g.strokeStyle = OUT; g.beginPath(); g.moveTo(x0, ya); g.lineTo(x0, yb); g.moveTo(x1, ya); g.lineTo(x1, yb); g.stroke();
}

// The brass pneumatic pipe: basement chute mouth → up the shaft's back wall → your letterbox.
function drawPipe(g, t, st, V, lod) {
  const Cm = P.CHUTE_MOUTH, d = P.DOOR, yTop = d.y - 30;
  const pts = [[Cm.x, 44], [Cm.x, 20], [470, 20], [470, yTop], [700, yTop], [700, d.y - 4]];
  // in the basement the pipe runs in the ceiling; above it, on the shaft's back wall, then over your door
  const len = []; let L = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); len.push(l); L += l; }
  if (!seen(V, 400, yTop - 20, 720, 60)) return;
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.lineJoin = 'round'; g.strokeStyle = OUT; g.lineWidth = 16; g.stroke();
  g.strokeStyle = '#B58A4A'; g.lineWidth = 10; g.stroke();
  g.strokeStyle = 'rgba(255,230,170,0.35)'; g.lineWidth = 3; g.stroke();
  // joints
  if (lod >= 1) for (let y = Math.max(yTop + 40, Math.floor(V.y0 / 180) * 180); y < Math.min(20, V.y1); y += 180) box(g, 462, y - 4, 16, 8, '#8A6A3A', 1.5, 2);
  // a capsule on its way
  const cp = st.capsule && st.capsule.p != null ? clamp01(st.capsule.p) : -1;
  if (cp >= 0) {
    let dist = cp * L, i = 0; while (i < len.length - 1 && dist > len[i]) { dist -= len[i]; i++; }
    const a = pts[i], b = pts[i + 1], u = clamp01(dist / len[i]);
    const px = lerp(a[0], b[0], u), py = lerp(a[1], b[1], u);
    glow(g, px, py, 40, PAL.lamp, 0.8); ell(g, px, py, 7, 11, '#F6EEDC', 2);
  }
  // where it enters your door
  box(g, 692, d.y - 12, 16, 10, '#C9A24E', 2, 2);
}

// ---------- the lift car ----------
const STYLE_DRAW = {};
export function drawLiftCar(g, t, S, st, o = {}) {
  const L = st.lift || { y: 0, style: 'plain', styleP: 0, doors: 0 };
  const y = o.y ?? L.y, cr = P.carRect(y), V = o.V;
  if (V && !seen(V, cr.x - 60, cr.y - 420, cr.x + cr.w + 60, cr.y + cr.h + 420)) return;
  const from = L.from || 'plain', to = L.style || 'plain', p = clamp01(L.styleP ?? 0);
  const doors = clamp01(L.doors || 0);
  const x0 = cr.x, y0 = cr.y, w = cr.w, h = cr.h;
  // opening behind the doors: the landing's light if we're at a floor
  let at = null;
  for (let fl = 0; fl <= P.FLOORS; fl++) { const fy = fl === 0 ? P.BASE.floor : P.floorLevel(fl); if (Math.abs(y - fy) < 36) at = fl; }
  const ox = x0 + 30, ow = w - 60, oy = y0 + 44, oh = h - 56;
  const paintOpening = () => {
    if (doors <= 0.01) return;
    const og = g.createLinearGradient(0, oy, 0, oy + oh);
    if (at !== null) { og.addColorStop(0, '#F2C88A'); og.addColorStop(0.7, '#B07A4A'); og.addColorStop(1, '#6A4630'); } else { og.addColorStop(0, '#0B0F22'); og.addColorStop(1, '#141A36'); }
    g.fillStyle = og; g.fillRect(ox, oy, ow, oh);
    if (at !== null) { glow(g, x0 + w / 2, oy + 24, 80, '#FFF1D6', 0.5 * doors); g.fillStyle = 'rgba(40,24,16,0.35)'; g.fillRect(ox, oy + oh - 30, ow, 30); }
  };
  // the style (a cross-fade from `from` to `to`)
  const draw = (name, a) => { if (a <= 0.01) return; g.save(); g.globalAlpha = a; (STYLE_DRAW[name] || STYLE_DRAW.plain)(g, t, x0, y0, w, h, doors, { ox, ow, oy, oh, at, y, paintOpening }); g.restore(); };
  if (to === from || p >= 0.999) draw(to, 1); else { draw(from, 1); draw(to, p); }
  // floor indicator
  const lbl = y > 200 ? 'B' : String(clamp(Math.round(1 - y / P.FH), 1, 10));
  box(g, x0 + w / 2 - 20, y0 - 4, 40, 22, '#15161F', 2.5, 4);
  txt(g, lbl, x0 + w / 2, y0 + 8, 17, '#FF9A5A', { weight: 800 });
  // buttons
  const lit = Array.isArray(L.buttons) ? L.buttons : [];
  box(g, x0 + w - 26, y0 + 104, 16, 60, '#2A2F45', 2, 3);
  for (let i = 0; i < 11; i++) circ(g, x0 + w - 18, y0 + 110 + i * 5, 1.9, lit.includes(i) || lit.includes(String(i)) || (i === 0 ? lbl === 'B' : String(i) === lbl) ? '#FFC23D' : '#6A7090', 0);
  // the floor plate
  box(g, x0 - 2, y - 10, w + 4, 12, '#2A2F45', 3, 2);
}
// Glass and the front posts, for sections to draw over Clawd if they like.
export function drawLiftFront(g, t, S, st, o = {}) {
  const L = st.lift || { y: 0 }, cr = P.carRect(o.y ?? L.y);
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(cr.x, cr.y, cr.x + cr.w, cr.y + cr.h);
  gr.addColorStop(0, 'rgba(180,210,255,0.1)'); gr.addColorStop(0.3, 'rgba(180,210,255,0)'); gr.addColorStop(0.55, 'rgba(180,210,255,0.08)'); gr.addColorStop(0.6, 'rgba(180,210,255,0)');
  g.fillStyle = gr; g.fillRect(cr.x, cr.y, cr.w, cr.h); g.restore();
  box(g, cr.x - 2, cr.y, 8, cr.h, '#3A3F58', 2.5); box(g, cr.x + cr.w - 6, cr.y, 8, cr.h, '#3A3F58', 2.5);
}
function carShell(g, x0, y0, w, h, back, frame, doors, O, doorCol, lw = 3, r = 6) {
  g.fillStyle = back; g.fillRect(x0 + 6, y0 + 16, w - 12, h - 26);
  if (O.paintOpening) O.paintOpening();
  // doors on the back wall, sliding apart
  const dw = O.ow / 2, sl = doors * (dw - 4);
  if (doors < 0.999) {
    box(g, O.ox - sl, O.oy, dw, O.oh, doorCol || mix(back, '#000000', 0.12), 2);
    box(g, O.ox + dw + sl, O.oy, dw, O.oh, doorCol || mix(back, '#000000', 0.12), 2);
  }
  g.lineWidth = 2.5; g.strokeStyle = OUT; g.strokeRect(O.ox, O.oy, O.ow, O.oh);
  // header and ceiling light
  box(g, x0, y0, w, 18, frame, lw, [r, r, 0, 0]);
  g.fillStyle = '#FFF3D6'; g.fillRect(x0 + 24, y0 + 18, w - 48, 4);
  const lg = g.createLinearGradient(0, y0 + 20, 0, y0 + 120); lg.addColorStop(0, 'rgba(255,240,210,0.22)'); lg.addColorStop(1, 'rgba(255,240,210,0)');
  g.fillStyle = lg; g.fillRect(x0 + 8, y0 + 20, w - 16, 100);
  // posts
  box(g, x0, y0 + 14, 8, h - 14, frame, lw); box(g, x0 + w - 8, y0 + 14, 8, h - 14, frame, lw);
  // handrail
  seg(g, x0 + 10, y0 + h - 92, x0 + w - 10, y0 + h - 92, '#C9D3E0', 4);
}
STYLE_DRAW.plain = (g, t, x0, y0, w, h, doors, O) => {
  carShell(g, x0, y0, w, h, '#3C4864', '#252B48', doors, O, '#4A5876');
  g.fillStyle = 'rgba(255,255,255,0.05)'; for (let x = x0 + 12; x < x0 + w - 10; x += 9) g.fillRect(x, y0 + 22, 2, h - 40);
  seg(g, x0 + 10, y0 + h - 92, x0 + w - 10, y0 + h - 92, '#C9A24E', 4);
};
STYLE_DRAW.fast = (g, t, x0, y0, w, h, doors, O) => {
  for (let i = 0; i < 9; i++) {
    const lx = x0 + 10 + i * (w - 20) / 8, ln = 120 + hash(i) * 220, off = frac(t * 3 + hash(i * 3)) * 60;
    const gr = g.createLinearGradient(0, y0 + h, 0, y0 + h + ln); gr.addColorStop(0, 'rgba(200,240,255,0.5)'); gr.addColorStop(1, 'rgba(200,240,255,0)');
    g.fillStyle = gr; g.fillRect(lx, y0 + h + off * 0.2, 3, ln);
    const gr2 = g.createLinearGradient(0, y0, 0, y0 - ln * 0.6); gr2.addColorStop(0, 'rgba(200,240,255,0.35)'); gr2.addColorStop(1, 'rgba(200,240,255,0)');
    g.fillStyle = gr2; g.fillRect(lx, y0 - ln * 0.6, 2, ln * 0.6);
  }
  carShell(g, x0, y0, w, h, '#1F5C6B', '#C9D3E0', doors, O, '#2A7488', 3, 18);
  g.save(); g.beginPath(); g.rect(x0 + 6, y0 + 16, w - 12, h - 26); g.clip();
  g.fillStyle = 'rgba(200,240,255,0.5)'; g.beginPath(); g.moveTo(x0, y0 + 150); g.lineTo(x0 + w, y0 + 60); g.lineTo(x0 + w, y0 + 76); g.lineTo(x0, y0 + 166); g.fill();
  g.restore();
};
STYLE_DRAW.sturdy = (g, t, x0, y0, w, h, doors, O) => {
  carShell(g, x0, y0, w, h, '#6B6F7A', '#2F3240', doors, O, '#7A7F8C', 5, 2);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const px = x0 + 8 + c * (w - 16) / 2, py = y0 + 18 + r * (h - 28) / 3; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2; g.strokeRect(px + 2, py + 2, (w - 16) / 2 - 4, (h - 28) / 3 - 4); for (const [bx, by] of [[6, 6], [(w - 16) / 2 - 8, 6], [6, (h - 28) / 3 - 8], [(w - 16) / 2 - 8, (h - 28) / 3 - 8]]) circ(g, px + bx, py + by, 2.6, '#B8BCC8', 1); }
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#15161F' : '#FFC23D'; g.beginPath(); const hx = x0 + i * w / 8; g.moveTo(hx, y0 + h - 10); g.lineTo(hx + w / 8, y0 + h - 10); g.lineTo(hx + w / 8 - 8, y0 + h); g.lineTo(hx - 8, y0 + h); g.fill(); }
  box(g, x0 - 6, y0, 10, h, '#2F3240', 3); box(g, x0 + w - 4, y0, 10, h, '#2F3240', 3);
};
STYLE_DRAW.cheap = (g, t, x0, y0, w, h, doors, O) => {
  g.strokeStyle = '#6A6E7A'; g.lineWidth = 1.5;
  g.save(); g.beginPath(); g.rect(x0 + 4, y0 + 10, w - 8, h - 18); g.clip();
  for (let k = -h; k < w + h; k += 16) { g.beginPath(); g.moveTo(x0 + k, y0); g.lineTo(x0 + k + h, y0 + h); g.moveTo(x0 + k + h, y0); g.lineTo(x0 + k, y0 + h); g.stroke(); }
  g.restore();
  box(g, x0, y0, w, 8, '#555A66', 2); box(g, x0, y0 + 8, 5, h - 8, '#555A66', 2); box(g, x0 + w - 5, y0 + 8, 5, h - 8, '#555A66', 2);
  seg(g, x0 + w / 2, y0 + 8, x0 + w / 2, y0 + 40, '#15161F', 1.5); circ(g, x0 + w / 2, y0 + 46, 7, '#FFF3D0', 1.5); glow(g, x0 + w / 2, y0 + 46, 50, '#FFF3D0', 0.4);
  for (let i = 0; i < 5; i++) circ(g, x0 + 10 + hash(i * 3) * (w - 20), y0 + 20 + hash(i * 5) * (h - 40), 3 + hash(i) * 4, 'rgba(160,80,40,0.45)', 0);
};
STYLE_DRAW.wow = (g, t, x0, y0, w, h, doors, O, bright = 1) => {
  carShell(g, x0, y0, w, h, '#8E1F3A', '#E8B84A', doors, O, '#A82A48', 4, 10);
  g.strokeStyle = '#E8B84A'; g.lineWidth = 4; g.strokeRect(x0 + 14, y0 + 26, w - 28, h - 42);
  for (const [cx, cy] of [[x0 + 14, y0 + 26], [x0 + w - 14, y0 + 26], [x0 + 14, y0 + h - 16], [x0 + w - 14, y0 + h - 16]]) circ(g, cx, cy, 7, '#FFD76A', 2);
  mirrorBall(g, t, x0 + w / 2, y0 + 54, 20, bright);
};
function mirrorBall(g, t, x, y, r, bright = 1) {
  seg(g, x, y - 34, x, y - r, '#C9D3E0', 2);
  circ(g, x, y, r, '#B8C4D8', 2.5);
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const on = frac(hash(i * 7 + j * 13) + t * 1.3) < 0.3; g.fillStyle = on ? '#FFFFFF' : (i + j) % 2 ? '#8A96AE' : '#D8E0EE'; g.fillRect(x + i * r / 3.2 - 3, y + j * r / 3.2 - 3, 5.2, 5.2); }
  g.restore();
  for (let i = 0; i < 6; i++) { const a = t * 1.1 + i * 1.05; sparkle(g, x + Math.cos(a) * r * 3, y + 30 + Math.sin(a * 1.3) * r * 3, 4, '#FFF6D8', 0.8 * bright * (0.5 + 0.5 * Math.sin(t * 5 + i))); }
}
STYLE_DRAW.keep = (g, t, x0, y0, w, h, doors, O) => {
  carShell(g, x0, y0, w, h, '#A87C3C', '#6E4A22', doors, O, '#B8894A', 4, 4);
  for (let r = 0; r < 5; r++) { const yy = y0 + 30 + r * (h - 50) / 4; seg(g, x0 + 8, yy, x0 + w - 8, yy, 'rgba(60,36,10,0.35)', 2); for (let c = 0; c < 9; c++) circ(g, x0 + 14 + c * (w - 28) / 8, yy + 5, 2, '#E0B870', 0.8); }
  box(g, x0 + w / 2 - 40, y0 + 26, 80, 18, '#2A1E10', 2, 2); txt(g, 'since 2026', x0 + w / 2, y0 + 35.5, 11, '#E0B870', { weight: 700, font: F.display });
};
STYLE_DRAW.ship = (g, t, x0, y0, w, h, doors, O) => {
  carShell(g, x0, y0, w, h, '#9A9A9A', '#5A5E68', doors, O, '#A8A8A8', 3, 4);
  g.save(); g.beginPath(); g.rect(x0 + 6, y0 + 16, w - 12, h - 26); g.clip();
  g.fillStyle = '#3E86C8'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + w * 0.5, y0);
  for (let k = 0; k <= 10; k++) g.lineTo(x0 + w * 0.5 + Math.sin(k * 2.1) * 10, y0 + k * h / 10);
  g.lineTo(x0, y0 + h); g.fill();
  for (let k = 0; k < 4; k++) { const dx = x0 + w * 0.5 + Math.sin(k * 5) * 8; g.beginPath(); g.moveTo(dx - 2, y0 + 40 + k * 50); g.lineTo(dx + 2, y0 + 40 + k * 50); g.lineTo(dx + 1, y0 + 60 + k * 50 + (k % 2) * 14); g.lineTo(dx - 1, y0 + 60 + k * 50 + (k % 2) * 14); g.fill(); }
  g.restore();
  // scaffold outside the car
  for (const sx of [x0 - 22, x0 + w + 14]) { box(g, sx, y0 - 30, 8, h + 30, '#8A8F9A', 2); }
  for (let k = 0; k < 3; k++) { const yy = y0 + k * 100; seg(g, x0 - 22, yy, x0 + w + 22, yy, '#8A8F9A', 5); seg(g, x0 - 22, yy, x0 + w + 22, yy, OUT, 1); }
  seg(g, x0 - 18, y0 + h, x0 - 18 + 30, y0 - 20, '#8A8F9A', 4);
  box(g, x0 + w - 60, y0 + 30, 44, 18, '#FFE36A', 2, 2); txt(g, 'WET', x0 + w - 38, y0 + 39.5, 10, '#C8304A', { weight: 800 });
};
STYLE_DRAW.polish = (g, t, x0, y0, w, h, doors, O) => {
  carShell(g, x0, y0, w, h, '#C8D2E0', '#E8EEF6', doors, O, '#D8E0EC', 3, 8);
  g.save(); g.beginPath(); g.rect(x0 + 6, y0 + 16, w - 12, h - 26); g.clip(); g.globalCompositeOperation = 'lighter';
  const u = frac(t * 0.45);
  const gx = x0 - 60 + u * (w + 120);
  const gr = g.createLinearGradient(gx - 30, 0, gx + 30, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(gx - 30, y0); g.lineTo(gx + 30, y0); g.lineTo(gx - 10, y0 + h); g.lineTo(gx - 70, y0 + h); g.fill();
  g.restore();
  for (let i = 0; i < 4; i++) sparkle(g, x0 + 20 + hash(i) * (w - 40), y0 + 30 + hash(i * 3) * (h - 60), 6 + 4 * hash(i * 5), '#FFFFFF', 0.5 + 0.5 * Math.sin(t * 6 + i * 2));
  for (let i = 0; i < 10; i++) { const u2 = frac(t * 2 + hash(i)), a = -0.6 - hash(i * 7) * 1.8; g.fillStyle = `rgba(255,190,90,${1 - u2})`; g.fillRect(x0 + w - 30 + Math.cos(a) * u2 * 60, y0 + h - 100 + Math.sin(a) * u2 * 60 + u2 * u2 * 50, 3, 3); }
};
STYLE_DRAW.show = (g, t, x0, y0, w, h, doors, O) => {
  STYLE_DRAW.wow(g, t, x0, y0, w, h, doors, O, 1.5);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const a = Math.sin(t * 1.6 + i * 2.1) * 0.5, colr = ['rgba(255,110,160,0.18)', 'rgba(120,200,255,0.18)', 'rgba(255,210,90,0.2)'][i];
    g.fillStyle = colr; g.beginPath(); g.moveTo(x0 + w / 2, y0 + 54); g.lineTo(x0 + w / 2 + Math.sin(a - 0.12) * 260, y0 + 54 + Math.cos(a - 0.12) * 260); g.lineTo(x0 + w / 2 + Math.sin(a + 0.12) * 260, y0 + 54 + Math.cos(a + 0.12) * 260); g.fill();
  }
  g.restore();
  for (let i = 0; i < 26; i++) {
    const u = frac(t * 0.5 + hash(i * 3.7)), cx = x0 + 10 + hash(i * 9.1) * (w - 20) + Math.sin(t * 3 + i) * 6, cy = y0 + 20 + u * (h - 30);
    g.save(); g.translate(cx, cy); g.rotate(t * 4 + i); g.fillStyle = ['#FFC23D', '#FF6A8A', '#4FA3C8', '#8ACB88', '#FFF1B8'][i % 5]; g.fillRect(-3.5, -2, 7, 4); g.restore();
  }
};

// ---------- the quota tube ----------
// A glass tube of orange tokens up the shaft's right side. Drawn wider than plan.TUBE (same centre).
function drawTube(g, t, st, cam, V, lod) {
  const T = P.TUBE, cx = T.x + T.w / 2, w = 24, x = cx - w / 2, y1 = T.y1, y0 = T.y0, Hh = y0 - y1;
  if (!seen(V, x - 120, y1 - 20, x + w + 20, y0 + 20)) return;
  const q = clamp01(st.quota ?? 1), lvl = y0 - Hh * q;
  const ya = Math.max(y1, V.y0 - 10), yb = Math.min(y0, V.y1 + 10);
  // glass body
  g.fillStyle = 'rgba(160,200,255,0.16)'; g.fillRect(x, ya, w, yb - ya);
  // tokens
  const ta = Math.max(lvl, ya), tb = yb;
  if (tb > ta) {
    if (V.z >= 0.7) {
      const step = 8.5;
      for (let yy = y0 - 5 - Math.max(0, Math.floor((y0 - 5 - tb) / step)) * step; yy >= ta - 1; yy -= step) {
        g.beginPath(); g.ellipse(cx, yy, w / 2 - 2, 4.2, 0, 0, TAU);
        g.fillStyle = PAL.token; g.fill(); g.lineWidth = 1.5; g.strokeStyle = '#8A3E1E'; g.stroke();
        g.fillStyle = 'rgba(255,220,180,0.55)'; g.fillRect(cx - 5, yy - 2.2, 7, 1.6);
      }
    } else {
      g.fillStyle = PAL.token; g.fillRect(x + 2, ta, w - 4, tb - ta);
      g.fillStyle = 'rgba(138,62,30,0.45)'; for (let yy = y0 - 10; yy > ta; yy -= 17) if (yy < tb) g.fillRect(x + 2, yy, w - 4, 2.5);
    }
    glow(g, cx, lvl, 34, PAL.token, 0.55);
  }
  // glass highlights and shade
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 4, ya, 3, yb - ya);
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x + 9, ya, 1.5, yb - ya);
  g.fillStyle = 'rgba(10,14,40,0.28)'; g.fillRect(x + w - 6, ya, 4, yb - ya);
  g.lineWidth = 3.5; g.strokeStyle = OUT; g.beginPath(); g.moveTo(x, ya); g.lineTo(x, yb); g.moveTo(x + w, ya); g.lineTo(x + w, yb); g.stroke();
  if (y1 > V.y0 - 20) { g.beginPath(); g.ellipse(cx, y1, w / 2, 6, 0, 0, TAU); inked(g, '#9AA3B6', 3); }
  if (y0 < V.y1 + 20) { box(g, x - 4, y0 - 4, w + 8, 14, '#5A6070', 3, 3); }
  // brass clamps, one per floor
  for (let fl = 1; fl <= P.FLOORS; fl++) { const by = P.floorLevel(fl) - 180; if (by > ya && by < yb) { box(g, x - 5, by - 6, w + 10, 12, '#C9A24E', 2.5, 3); circ(g, x - 1, by, 2, '#8A6A2A', 0); } }
  // The readout sits beside the tube in the calm middle of the frame (its centre within 38-58% of the
  // height, clear of the hook rows at 150-560 px and the lyric band at 1150-1520 px), riding the level
  // when the level is there and pointing to it when not. st.quotaY (a screen y) places it instead.
  if (V.z >= 0.4) {
    const z = cam.zoom, toW = sy => cam.y + (sy - H / 2) / z;
    const tag = clamp01(st.sessionTag || 0), hb = 34 * z, tagH = tag > 0.01 ? 50 * z : 0;
    const bandLo = toW(0.38 * H + hb + tagH), bandHi = toW(0.58 * H - hb);
    const ry = st.quotaY != null ? toW(st.quotaY) : clamp(lvl, bandLo, Math.max(bandLo, bandHi)), rx = x - 90;
    if (ry >= y1 + 40 && ry <= y0 - 40) {
      const used = Math.round((1 - q) * 100);
      box(g, rx - 4, ry - 34, 84, 68, '#15161F', 3, 8);
      txt(g, 'QUOTA', rx + 38, ry - 20, 12, '#C9C3D8', { font: F.pixel, weight: 700 });
      txt(g, `${used}%`, rx + 38, ry + 4, 27, used >= 100 ? '#FF6A5A' : '#FFB27A', { weight: 800 });
      txt(g, 'used', rx + 38, ry + 24, 12, '#C9C3D8', { font: F.pixel });
      seg(g, rx + 80, ry, x, ry, '#15161F', 4);
      if (Math.abs(ry - lvl) > 4) txt(g, lvl > ry ? '▼' : '▲', rx - 16, ry, 16, PAL.token, { weight: 800 });
      if (tag > 0.01) {
        // the new-session tag rides just above the readout
        g.save(); g.translate(rx + 38, ry - 34); g.rotate(Math.sin(t * 2.2) * 0.04); g.globalAlpha = tag;
        seg(g, 0, 0, 0, -12, '#C9C3D8', 2);
        box(g, -76, -48, 152, 36, '#FFF3E0', 3, 6);
        txt(g, '↻ new session', 0, -29.5, 17, '#C0502A', { font: F.pixel, weight: 700 });
        g.restore(); g.globalAlpha = 1;
      }
    }
  }
}

// ---------- the roof ----------
function drawRoof(g, t, S, st, V, lod) {
  const R = P.ROOF_Y;
  if (!seen(V, -40, R - 700, 1120, R + 30)) return;
  const hb = clamp01(st.bots?.hermes || 0);
  // parapet
  box(g, -18, R - 40, 1116, 44, '#262E52', 4);
  g.fillStyle = '#3A4470'; g.fillRect(-18, R - 44, 1116, 6);
  // lift machine room with its pulley
  box(g, 440, R - 150, 200, 112, '#262E52', 4, 4);
  box(g, 456, R - 136, 168, 84, '#141A36', 2.5, 3);
  const ang = -(st.lift?.y || 0) / 40;
  g.save(); g.translate(540, R - 96); g.rotate(ang);
  circ(g, 0, 0, 30, '#6A7090', 3); for (let i = 0; i < 6; i++) { g.rotate(TAU / 6); seg(g, 0, 0, 26, 0, '#3A4264', 4); }
  circ(g, 0, 0, 7, '#C9D3E0', 2); g.restore();
  txt(g, 'LIFT', 540, R - 128, 11, '#8A90B0', { font: F.pixel });
  // water tank
  for (const lx of [812, 872, 932]) box(g, lx, R - 120, 8, 80, '#1C2240', 2.5);
  box(g, 790, R - 250, 170, 132, '#3A4470', 4, [60, 60, 6, 6]);
  for (let i = 0; i < 4; i++) seg(g, 794, R - 220 + i * 30, 956, R - 220 + i * 30, 'rgba(0,0,0,0.3)', 3);
  // antenna with a red light
  seg(g, 1010, R - 44, 1010, R - 380, '#1C2240', 6); for (let i = 0; i < 4; i++) seg(g, 994, R - 300 + i * 50, 1026, R - 300 + i * 50, '#1C2240', 3);
  if (frac(t / 1.4) < 0.2) glow(g, 1010, R - 386, 40, '#FF4A4A', 0.9);
  circ(g, 1010, R - 386, 5, '#FF4A4A', 2);
  // string lights from the shed to the tank
  g.strokeStyle = '#15161F'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(370, R - 230); g.quadraticCurveTo(580, R - 170, 800, R - 236); g.stroke();
  for (let i = 1; i < 12; i++) { const u = i / 12, lx = lerp(370, 800, u), ly = (1 - u) * (1 - u) * (R - 230) + 2 * u * (1 - u) * (R - 170) + u * u * (R - 236) + 4; circ(g, lx, ly, 4, ['#FFD9A3', '#FF9AB0', '#9FE0FF'][i % 3], 1); glow(g, lx, ly, 18, '#FFD9A3', 0.35 * (0.6 + 0.4 * Math.sin(t * 2 + i))); }
  // Hermes' shed
  const sx = 70, sw = 300, sy = R - 40, sh = 190;
  poly(g, [sx - 16, sy - sh, sx + sw / 2, sy - sh - 70, sx + sw + 16, sy - sh], '#5A3A2A', 4);
  box(g, sx, sy - sh, sw, sh, '#7A5236', 4);
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let x = sx + 20; x < sx + sw; x += 20) { g.beginPath(); g.moveTo(x, sy - sh); g.lineTo(x, sy); g.stroke(); }
  const winC = mix('#141A36', '#FFD98A', hb);
  box(g, sx + 26, sy - sh + 40, 80, 60, winC, 3, 3); seg(g, sx + 66, sy - sh + 40, sx + 66, sy - sh + 100, '#5A3A2A', 4); seg(g, sx + 26, sy - sh + 70, sx + 106, sy - sh + 70, '#5A3A2A', 4);
  const dox = sx + 170, dow = 90;
  box(g, dox, sy - 150, dow, 150, mix('#141A36', '#FFD98A', hb * 0.9), 3);
  if (hb < 0.99) { const dw = dow * (1 - hb); box(g, dox, sy - 150, Math.max(2, dw), 150, '#6E4A2A', 3); }
  if (hb > 0.01) { glow(g, dox + dow / 2, sy - 70, 240, PAL.lamp, 0.4 * hb); glow(g, sx + 66, sy - sh + 70, 140, PAL.lamp, 0.35 * hb); }
  // weathervane: the caduceus
  seg(g, sx + sw / 2, sy - sh - 70, sx + sw / 2, sy - sh - 130, '#C9A24E', 4);
  g.strokeStyle = '#C9A24E'; g.lineWidth = 3; g.beginPath(); for (let k = 0; k <= 20; k++) { const yy = sy - sh - 74 - k * 2.6, xx = sx + sw / 2 + Math.sin(k * 0.8) * 8; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
  poly(g, [sx + sw / 2, sy - sh - 128, sx + sw / 2 - 22, sy - sh - 138, sx + sw / 2 - 8, sy - sh - 124], '#C9A24E', 2);
  poly(g, [sx + sw / 2, sy - sh - 128, sx + sw / 2 + 22, sy - sh - 138, sx + sw / 2 + 8, sy - sh - 124], '#C9A24E', 2);
  // a pigeon on the parapet
  const pb = Math.abs(Math.sin(t * 3)) > 0.9 ? 4 : 0;
  g.save(); g.translate(700, R - 44); ell(g, 0, -10, 14, 9, '#8A90B0', 2); circ(g, 12, -20 + pb, 6, '#8A90B0', 2); poly(g, [17, -21 + pb, 23, -19 + pb, 17, -17 + pb], '#E0A13A', 1); circ(g, 13, -21 + pb, 1.2, OUT, 0); poly(g, [-12, -12, -22, -6, -12, -6], '#6A7090', 1.5); g.restore();
  // Hermes
  if (hb > 0.01) safe(g, () => cast.bot(g, 'hermes', dox + dow / 2, sy, 1.4, { wave: st.botWave ?? hb, lit: hb, t }));
}

// ===================================================================================================
// Atmosphere (screen space): bloom, season, dimming, sepia below, falling leaves, vignette, grain
// ===================================================================================================
export function drawAtmosphere(g, t, S, st, cam) {
  build();
  const cv = g.canvas;
  // bloom: a blurred, contrast-pushed copy, screened back
  const bw = Math.max(16, Math.round(cv.width / 6)), bh = Math.max(16, Math.round(cv.height / 6));
  if (C.bloomA.width !== bw || C.bloomA.height !== bh) { C.bloomA = mk(bw, bh); C.bloomB = mk(bw, bh); }
  const a = C.bloomA.getContext('2d'), b = C.bloomB.getContext('2d');
  a.globalCompositeOperation = 'copy'; a.filter = 'none'; a.drawImage(cv, 0, 0, bw, bh);
  b.globalCompositeOperation = 'copy'; b.filter = `blur(${(bw / 70).toFixed(1)}px) brightness(0.85) contrast(2.2)`; b.drawImage(C.bloomA, 0, 0);
  b.filter = 'none';
  // cap: the bloom may lift a highlight, never blow a column of flats white
  b.globalCompositeOperation = 'multiply'; b.fillStyle = '#8C7E70'; b.fillRect(0, 0, bw, bh); b.globalCompositeOperation = 'source-over';
  g.save();
  g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.5;
  g.drawImage(C.bloomB, 0, 0, W, H);
  g.restore();
  // season
  const au = clamp01(st.autumn || 0);
  if (au > 0.01) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = rgba('#E07A2A', 0.35 * au); g.fillRect(0, 0, W, H); g.restore(); }
  // sepia when looking into the old basements

  // leaves
  if (au > 0.01) {
    const n = Math.round(1 + 13 * au);
    for (let i = 0; i < n; i++) {
      const sp = 0.6 + hash(i * 5.3) * 0.8, x = ((hash(i * 1.9) * 1400 + t * 38 * sp) % 1400) - 160, y = ((hash(i * 3.7) * 2200 + t * 95 * sp) % 2200) - 140;
      leaf(g, x + Math.sin(t * 1.3 + i) * 40, y, 18 + hash(i) * 16, t * (1 + hash(i * 2)) + i, ['#D9772F', '#C9542A', '#E8A33A', '#B5452A'][i % 4], i === 0 ? 1 : au);
    }
  }
  // dimming
  const dim = clamp01(st.dim || 0);
  if (dim > 0.002) { g.fillStyle = `rgba(3,4,14,${0.82 * dim})`; g.fillRect(0, 0, W, H); }
  // vignette and paper grain, cached at the output size
  g.drawImage(finish(cv.width, cv.height), 0, 0, W, H);
}
function finish(cw, ch) {
  if (C.finish && C.finish.width === cw && C.finish.height === ch) return C.finish;
  if (C.finish && C.finishSize && C.finishSize[0] === cw && C.finishSize[1] === ch) return C.finish;
  const c = mk(cw, ch), g = c.getContext('2d'), sx = cw / W;
  const vg = g.createRadialGradient(cw / 2, ch * 0.47, ch * 0.28, cw / 2, ch * 0.5, ch * 0.72);
  vg.addColorStop(0, 'rgba(3,5,16,0)'); vg.addColorStop(1, 'rgba(3,5,16,0.5)');
  g.fillStyle = vg; g.fillRect(0, 0, cw, ch);
  // grain: light and dark specks as translucent paint, plus soft fibres
  const n = C.grain.width, src = C.grain.getContext('2d').getImageData(0, 0, n, n).data;
  const tile = mk(n, n), tg = tile.getContext('2d'), im = tg.createImageData(n, n), d = im.data;
  for (let i = 0; i < n * n; i++) {
    const v = (src[i * 4] - 128) / 128, a = Math.min(1, Math.abs(v) * 0.22);
    const c8 = v > 0 ? 255 : 0; d[i * 4] = c8; d[i * 4 + 1] = c8 * 0.96; d[i * 4 + 2] = c8 * 0.9; d[i * 4 + 3] = Math.round(a * 255);
  }
  tg.putImageData(im, 0, 0);
  g.save(); g.scale(sx, sx); g.fillStyle = g.createPattern(tile, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
  C.finish = c;
  if (typeof createImageBitmap !== 'undefined') createImageBitmap(c).then(b => { if (C.finish === c) C.finish = Object.assign(b, {}); C.finishSize = [cw, ch]; }).catch(() => {});
  return c;
}
function leaf(g, x, y, s, rot, col, a) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s / 20, s / 20); g.globalAlpha = a;
  g.beginPath(); g.moveTo(0, -20); g.quadraticCurveTo(15, -8, 0, 20); g.quadraticCurveTo(-15, -8, 0, -20);
  g.fillStyle = col; g.fill(); g.lineWidth = 2.5; g.strokeStyle = OUT; g.stroke();
  g.beginPath(); g.moveTo(0, -16); g.lineTo(0, 24); g.lineWidth = 1.5; g.stroke();
  g.restore();
}
