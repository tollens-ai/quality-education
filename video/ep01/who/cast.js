// Cast and props for episode 1, "Who Lives Here?": Clawd and the subagent minis, your hand, the
// ticket, tokens, the misfit builds, the bots, the directory plates, notes and the PB flame.
//
// Style: papercut. Each piece is a flat colour cut-out with a bold dark outline and a small drop
// shadow, so it reads at phone size on the night-blue tower.
//
// Coordinates are the caller's (world units). (x, y) is the ground point between the feet, or an
// object's bottom centre, except where noted: the ticket, notes and the phone are centred on
// (x, y), and plates take a top-left rectangle. s scales everything (1 = standard size). Motion
// that needs time takes t in the pose or opts (pose.t gives Clawd blinks and breathing).
// Nothing uses Math.random: every frame is a pure function of its arguments.
import * as P from './plan.js';

const PAL = P.PAL, FONTS = P.FONTS, OL = PAL.outline;
const TAU = Math.PI * 2;
const INK = '#17131F';
const clamp01 = v => Math.max(0, Math.min(1, v));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const smooth = p => { p = clamp01(p); return p * p * (3 - 2 * p); };
const hash = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const backOut = p => { p = clamp01(p); const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };

// ---------- colour ----------
const RGB = new Map();
function rgb(c) {
  let v = RGB.get(c);
  if (!v) {
    const h = c.replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, x => x + x) : h, 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; RGB.set(c, v);
  }
  return v;
}
// Mix two hex colours (p = 0 gives a, 1 gives b).
export function mix(a, b, p) {
  const A = rgb(a), B = rgb(b); p = clamp01(p);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * p)},${Math.round(A[1] + (B[1] - A[1]) * p)},${Math.round(A[2] + (B[2] - A[2]) * p)})`;
}
const rgba = (c, a) => { const A = rgb(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };
const DEADC = '#2C3150';
const pc = (c, pow) => (pow >= 0.999 ? c : mix(c, DEADC, 0.62 * (1 - pow)));   // powered vs dead

// ---------- paths ----------
const rr = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
const ell = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, TAU); return p; };
const circ = (x, y, r) => ell(x, y, r, r);
function poly(pts) { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; }
function union(paths) { const p = new Path2D(); for (const q of paths) p.addPath(q); return p; }
function moved(path, x, y, rot = 0, sx = 1, sy = 1) {
  const m = new DOMMatrix().translateSelf(x, y).rotateSelf(rot * 180 / Math.PI).scaleSelf(sx, sy);
  const p = new Path2D(); p.addPath(path, m); return p;
}
// A capsule from (x0, y0) along angle a for length L, th thick (round ends).
const cap = (x0, y0, a, L, th) => moved(rr(-th / 2, -th / 2, L + th, th, th / 2), x0, y0, a);

// The papercut treatment: a drop shadow, a bold outline and a flat fill, as one piece.
// Paths should all wind clockwise (rect, roundRect, ellipse and arc do), so they merge.
function cut(g, paths, fill, o = {}) {
  const lw = o.lw ?? 5, all = Array.isArray(paths) ? union(paths) : paths;
  g.save();
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (o.shadow !== false && lw > 0) {
    const sd = o.sd ?? 3;
    g.save(); g.translate(lw + sd, lw + sd * 1.6);
    g.fillStyle = o.shadowColor || 'rgba(3,5,18,0.42)'; g.fill(all); g.restore();
  }
  if (lw > 0) { g.strokeStyle = o.ol || OL; g.lineWidth = lw * 2; g.stroke(all); }
  g.fillStyle = fill; g.fill(all);
  g.restore();
  return all;
}

// Additive light, for glows on the dark tower.
function glow(g, x, y, r, color, a) {
  if (a <= 0.003) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(color, a)); gr.addColorStop(0.4, rgba(color, a * 0.38)); gr.addColorStop(1, rgba(color, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.restore();
}
function groundShadow(g, x, y, w, a) {
  g.save(); g.fillStyle = `rgba(3,5,18,${a})`; g.beginPath(); g.ellipse(x, y, w, w * 0.15, 0, 0, TAU); g.fill(); g.restore();
}
function mkCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
}
// Paper grain, made once, as a repeating pattern.
let GRAIN;
function grain(g) {
  if (GRAIN === undefined) {
    GRAIN = null;
    try {
      const c = mkCanvas(128, 128), x = c.getContext('2d');
      for (let i = 0; i < 1100; i++) {
        x.fillStyle = hash(i * 3.1) < 0.5 ? 'rgba(255,250,240,0.6)' : 'rgba(60,35,20,0.4)';
        const r = 0.6 + hash(i + 0.37) * 1.4;
        x.fillRect(hash(i + 0.11) * 128, hash(i + 0.73) * 128, r, r);
      }
      x.strokeStyle = 'rgba(120,90,60,0.22)'; x.lineWidth = 0.7;
      for (let i = 0; i < 40; i++) {
        const px = hash(i + 5.5) * 128, py = hash(i + 9.1) * 128, a = hash(i + 2.2) * TAU, L = 4 + hash(i + 7.7) * 12;
        x.beginPath(); x.moveTo(px, py);
        x.quadraticCurveTo(px + Math.cos(a) * L * 0.5 + 2, py + Math.sin(a) * L * 0.5, px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke();
      }
      GRAIN = g.createPattern(c, 'repeat');
    } catch (e) { GRAIN = null; }
  }
  return GRAIN;
}
function grainOver(g, path, a) {
  const pat = grain(g); if (!pat) return;
  g.save(); g.globalAlpha *= a; g.fillStyle = pat; g.fill(path); g.restore();
}

// ---------- images (the official marks) ----------
// The player loads plan.IMAGE_FILES into S.img; bot() has no S, so the cast also loads its own copy.
const OWN = {};
if (typeof Image !== 'undefined') {
  for (const [k, url] of Object.entries(P.IMAGE_FILES)) {
    if (url.endsWith('grok.svg')) continue;
    const im = new Image();
    im.onload = () => { OWN[k] = im; };
    im.src = '/' + url;
  }
}
// grok.svg holds a <foreignObject>, and Chrome taints any canvas that draws it (every later
// toDataURL then fails), so the Grok plate uses the PNG of the same mark instead.
const SAFE = { grok: '.private/ep01-assets/grok-512.png' };
if (typeof Image !== 'undefined') {
  for (const [k, url] of Object.entries(SAFE)) { const im = new Image(); im.onload = () => { OWN['safe_' + k] = im; }; im.src = '/' + url; }
}
let SIMG = null;
export function useImages(S) { if (S && S.img) SIMG = S.img; }
const imgOf = k => (SAFE[k] ? OWN['safe_' + k] || null : (SIMG && SIMG[k]) || OWN[k] || null);
// Drawing an SVG image re-rasterises it every time (~35 ms), so marks are baked into bitmaps once.
const BMP = new Map();
function bitmap(im, size, pad = 0) {
  const key = im.src + '|' + size + '|' + pad;
  let c = BMP.get(key);
  if (!c) { c = mkCanvas(size + 2 * pad, size + 2 * pad); c.getContext('2d').drawImage(im, pad, pad, size, size); BMP.set(key, c); }
  return c;
}
// Molty as a papercut sticker: the official art untouched, with a dark outline ring and a drop
// shadow baked round it. 704 px of art in a 768 px canvas.
function moltySticker(im) {
  const key = im.src + '|sticker';
  let c = BMP.get(key);
  if (!c) {
    const art = bitmap(im, 704, 32), tint = col => { const t = mkCanvas(768, 768), x = t.getContext('2d'); x.drawImage(art, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, 768, 768); return t; };
    const sil = tint(OL), shade = tint('#03050F');
    c = mkCanvas(768, 768); const x = c.getContext('2d');
    x.globalAlpha = 0.42; x.drawImage(shade, 18, 26); x.globalAlpha = 1;
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; x.drawImage(sil, Math.cos(a) * 19, Math.sin(a) * 19); }
    x.drawImage(art, 0, 0);
    BMP.set(key, c);
  }
  return c;
}

// ---------- little shared marks ----------
function glint(g, x, y, r) { g.fillStyle = 'rgba(255,250,240,0.95)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
function starPath(x, y, r, n = 4, inner = 0.38, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr2 = i % 2 ? r * inner : r; pts.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); }
  return poly(pts);
}
function drop(x, y, r) {   // a sweat or tear drop, point up
  const p = new Path2D();
  p.moveTo(x, y - r * 1.9);
  p.bezierCurveTo(x + r * 0.35, y - r * 1.1, x + r, y - r * 0.4, x + r, y + r * 0.15);
  p.arc(x, y + r * 0.15, r, 0, Math.PI);
  p.bezierCurveTo(x - r, y - r * 0.4, x - r * 0.35, y - r * 1.1, x, y - r * 1.9);
  p.closePath();
  return p;
}
function heartPath(x, y, r) {
  const p = new Path2D();
  p.moveTo(x, y + r * 0.9);
  p.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.8, y - r * 1.2, x, y - r * 0.45);
  p.bezierCurveTo(x + r * 0.8, y - r * 1.2, x + r * 1.5, y - r * 0.1, x, y + r * 0.9);
  p.closePath();
  return p;
}
// Emotes that pop above a character: '!', '?', 'sparkle', 'sweat', 'zzz', 'heart', 'cloud'.
function emote(g, kind, x, y, k = 1, t = 0) {
  if (!kind || k <= 0) return;
  g.save(); g.translate(x, y);
  const b = backOut(k); g.scale(b, b);
  switch (kind) {
    case '!': cut(g, [rr(-5, -30, 10, 21, 4.5), circ(0, 0, 5.2)], PAL.gold, { lw: 2.8, sd: 1.5 }); break;
    case '?':
      g.font = `800 36px ${FONTS.display}`; g.textAlign = 'center'; g.lineJoin = 'round';
      g.strokeStyle = OL; g.lineWidth = 6; g.strokeText('?', 0, 4); g.fillStyle = PAL.goldHi; g.fillText('?', 0, 4); break;
    case 'sparkle': {
      const w = 1 + 0.12 * Math.sin(t * 7);
      cut(g, [starPath(0, -8, 13 * w, 4, 0.34), starPath(15, 7, 6.5 / w, 4, 0.34)], PAL.goldHi, { lw: 2.2, sd: 1 });
      break;
    }
    case 'sweat': cut(g, [drop(4, -6 + 3 * Math.sin(t * 3), 5.5)], '#9FDBFF', { lw: 2.2, sd: 1 }); glint(g, 2.5, -6, 1.5); break;
    case 'zzz':
      g.font = `800 20px ${FONTS.display}`; g.fillStyle = PAL.textDim;
      for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; g.globalAlpha = Math.sin(ph * Math.PI); g.fillText('z', i * 9, -ph * 26); }
      break;
    case 'heart': cut(g, [heartPath(0, -6, 10)], '#FF6F91', { lw: 2.4, sd: 1 }); break;
    case 'cloud':
      cut(g, [circ(-12, -10, 11), circ(2, -16, 14), circ(16, -9, 10), rr(-22, -12, 46, 14, 7)], '#8C95B8', { lw: 2.6, sd: 1 });
      g.strokeStyle = '#8FC7FF'; g.lineWidth = 2.4; g.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const ph = (t * 1.6 + i * 0.27) % 1; g.globalAlpha = 1 - ph; g.beginPath(); g.moveTo(-14 + i * 10, 8 + ph * 18); g.lineTo(-16 + i * 10, 14 + ph * 18); g.stroke(); }
      break;
  }
  g.restore();
}

// ================= Clawd =================
// Front view, feet at y = 0: body 120 × 72 (y -94..-22), four legs 12 wide, arm nubs pivoting at
// the body sides, slit eyes at x ±30. Proportions follow the mascot's model sheet.
const LEGS = [-40, -19, 19, 40];
const ARM = { x: 59, y: -57, L: 28, th: 13 };
const MOODS = {
  neutral: { eyes: 'slit', mouth: null, arms: [-0.3, -0.3] },
  happy: { eyes: 'happy', mouth: 'smile', arms: [0.5, 0.5] },
  proud: { eyes: 'closed', mouth: 'smile', arms: [-0.65, -0.65], emote: 'sparkle', stretch: 0.08, lean: -0.05 },
  sad: { eyes: 'sad', mouth: 'frown', arms: [-1.05, -1.05], squash: 0.1, lookY: 0.6, gloom: 1, sing: 'sad' },
  surprise: { eyes: 'wide', mouth: 'O', arms: [1.0, 1.0], emote: '!', stretch: 0.12, sing: 'O' },
  hope: { eyes: 'round', mouth: 'smile', arms: [0.35, 0.35], lookY: -0.7, emote: 'sparkle' },
  determined: { eyes: 'determined', mouth: 'flat', arms: [0.1, 0.1] },
  beam: { eyes: 'happy', mouth: 'grin', arms: [0.95, 0.95], blush: 1, emote: 'sparkle', stretch: 0.07 },
  tired: { eyes: 'tired', mouth: 'wobble', arms: [-1.1, -1.1], squash: 0.12, emote: 'sweat', gloom: 0.6 },
  worried: { eyes: 'worried', mouth: 'wobble', arms: [-0.6, 0.2], emote: 'sweat' },
};
export const CLAWD_MOODS = Object.keys(MOODS);

function blinkAt(t, seed = 0) {
  const period = 3.3 + hash(seed + 0.5) * 1.7, ph = (((t + hash(seed + 1.5) * 5) % period) + period) % period;
  return ph < 0.13 ? 1 : 0;
}

function eye(g, cx, cy, side, kind) {
  g.fillStyle = INK; g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  const w = 9.5, h = 23;
  switch (kind) {
    case 'happy': g.lineWidth = 4.8; g.beginPath(); g.moveTo(cx - 8, cy + 5); g.lineTo(cx, cy - 5); g.lineTo(cx + 8, cy + 5); g.stroke(); return;
    case 'closed': g.lineWidth = 4.6; g.beginPath(); g.arc(cx, cy - 3, 8, 0.16 * Math.PI, 0.84 * Math.PI); g.stroke(); return;
    case 'blink': g.lineWidth = 4.6; g.beginPath(); g.moveTo(cx - 6, cy + 3); g.lineTo(cx + 6, cy + 3); g.stroke(); return;
    case 'round':
      g.beginPath(); g.ellipse(cx, cy + 1, 7.8, 10.8, 0, 0, TAU); g.fill();
      glint(g, cx - 2.4, cy - 3.4, 3); glint(g, cx + 2.8, cy + 4.6, 1.5); return;
    case 'wide': g.fill(rr(cx - 6.4, cy - 15.5, 12.8, 31, 3.5)); glint(g, cx - 2, cy - 9, 2.5); return;
    case 'tired':
      g.fill(rr(cx - w / 2, cy, w, h * 0.42, 2.5));
      g.lineWidth = 3.6; g.beginPath(); g.moveTo(cx - 8.5, cy); g.lineTo(cx + 8.5, cy); g.stroke();
      g.strokeStyle = 'rgba(90,30,15,0.5)'; g.lineWidth = 2.2; g.beginPath(); g.arc(cx, cy + 9, 6.5, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); return;
    case 'sad': case 'determined': case 'worried': {
      const ix = cx - side * w / 2, ox = cx + side * w / 2;
      const [ti, to] = kind === 'determined' ? [-0.12, -0.52] : kind === 'sad' ? [-0.46, -0.08] : [-0.52, -0.26];
      const bot = kind === 'determined' ? 0.42 : 0.36;
      const p = poly([[ix, cy + h * ti], [ox, cy + h * to], [ox, cy + h * bot], [ix, cy + h * bot]]);
      g.lineWidth = 2.4; g.fill(p); g.stroke(p);
      if (kind !== 'determined') glint(g, cx - side * 0.6, cy - h * 0.02, 1.9);
      return;
    }
    default: g.fill(rr(cx - w / 2, cy - h / 2, w, h, 3)); glint(g, cx - 1.5, cy - h * 0.3, 2);
  }
}

function mouth(g, cx, cy, kind, open, sing) {
  g.save();
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  if (open > 0.04) {
    const w = 9 + 9 * open, h = 3 + 13 * open, p = new Path2D();
    if (sing === 'O' || kind === 'O') p.ellipse(cx, cy, w * 0.36, h * 0.55, 0, 0, TAU);
    else if (sing === 'sad') {
      p.moveTo(cx - w / 2, cy + h / 2); p.quadraticCurveTo(cx - w / 2, cy - h / 2, cx, cy - h / 2);
      p.quadraticCurveTo(cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2); p.closePath();
    } else {
      p.moveTo(cx - w / 2, cy - h / 2); p.lineTo(cx + w / 2, cy - h / 2);
      p.quadraticCurveTo(cx + w / 2, cy + h / 2, cx, cy + h / 2); p.quadraticCurveTo(cx - w / 2, cy + h / 2, cx - w / 2, cy - h / 2); p.closePath();
    }
    g.fillStyle = '#3B1411'; g.fill(p); g.lineWidth = 2.4; g.stroke(p);
    if (open > 0.3) { g.clip(p); g.fillStyle = '#EA8472'; g.beginPath(); g.ellipse(cx, cy + h * 0.52, w * 0.34, h * 0.32, 0, 0, TAU); g.fill(); }
    g.restore();
    return;
  }
  g.lineWidth = 3.2;
  switch (kind) {
    case 'smile': g.beginPath(); g.arc(cx, cy - 4.5, 6.5, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); break;
    case 'grin': {
      const p = new Path2D(); p.moveTo(cx - 9, cy - 4); p.lineTo(cx + 9, cy - 4); p.quadraticCurveTo(cx + 9, cy + 7, cx, cy + 7); p.quadraticCurveTo(cx - 9, cy + 7, cx - 9, cy - 4); p.closePath();
      g.fillStyle = '#3B1411'; g.fill(p); g.lineWidth = 2.4; g.stroke(p);
      g.save(); g.clip(p); g.fillStyle = '#EA8472'; g.beginPath(); g.ellipse(cx, cy + 6, 5.5, 3.5, 0, 0, TAU); g.fill(); g.restore();
      break;
    }
    case 'frown': g.beginPath(); g.arc(cx, cy + 5, 6.5, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke(); break;
    case 'flat': g.beginPath(); g.moveTo(cx - 5.5, cy); g.lineTo(cx + 5.5, cy); g.stroke(); break;
    case 'O': g.fillStyle = '#3B1411'; g.beginPath(); g.ellipse(cx, cy, 3.8, 5, 0, 0, TAU); g.fill(); g.lineWidth = 2; g.stroke(); break;
    case 'wobble': g.lineWidth = 2.6; g.beginPath(); g.moveTo(cx - 7, cy + 1); g.quadraticCurveTo(cx - 3.5, cy - 3, cx, cy + 1); g.quadraticCurveTo(cx + 3.5, cy + 4, cx + 7, cy); g.stroke(); break;
  }
  g.restore();
}

function armPath(side, a, py = ARM.y) {
  const th = side > 0 ? -a : Math.PI + a;
  return moved(rr(-2, -ARM.th / 2, ARM.L + 2, ARM.th, 3.5), side * ARM.x, py, th);
}
const armTip = (side, a, py = ARM.y) => { const th = side > 0 ? -a : Math.PI + a; return [side * ARM.x + Math.cos(th) * ARM.L, py + Math.sin(th) * ARM.L]; };

function clawdFill(g, y0 = -94, y1 = 0) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, '#E8906C'); gr.addColorStop(0.42, PAL.clawd); gr.addColorStop(0.74, '#C8653F'); gr.addColorStop(1, '#B25234');
  return gr;
}

function hardHat(g, lw) {
  const dome = new Path2D(); dome.arc(0, -94, 36, Math.PI, 0); dome.closePath();
  cut(g, [dome, rr(-47, -100, 94, 10, 5)], '#F4C542', { lw, sd: 2 });
  g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(-12, -117, 10, 5, -0.4, 0, TAU); g.fill();
  g.fillStyle = '#E0A82E'; g.fill(rr(-5, -129, 10, 30, 4));
}

function heldItem(g, kind, tx, ty, k, pose, flip) {
  g.save(); g.translate(tx, ty); if (flip < 0) g.scale(-1, 1);
  const d = flip < 0 ? -1 : 1;
  if (kind === 'note') {
    const sz = noteSize(g, pose.item ?? '', { hand: pose.itemHand });
    note(g, d * (sz.w * k / 2 - 8), -sz.h * k * 0.3, k, pose.item ?? '', { hand: pose.itemHand, rot: -0.1 * d, t: pose.t });
  } else if (kind === 'token') token(g, d * 6, -6, k * 2.2, { spin: pose.itemSpin ?? 0 });
  else if (kind === 'sheet') summarySheet(g, d * 26 * k * 2, -20 * k * 2, k * 1.3, -0.12 * d);
  g.restore();
}

// Clawd, the Claude Code crab. pose: { mood, look -1..1, lookY -1..1, mouth 0..1 (open, singing),
// armL/armR (radians; 0 = straight out, + raises, ±1.5 vertical), hop 0..1, squash (+ squashes,
// - stretches), rot (lean), flip, walk (leg phase), holding: 'ticket' (held up like a placard) |
// 'note' | 'token' | 'sheet', item (note text), itemHand, itemScale, fill / ticket (placard ticket
// fill and opts), salute 0..1, lit 0..1 (gold glow), dim 0..1, blink 0..1, blush, tear 0..1,
// emote ('!'|'?'|'sparkle'|'sweat'|'zzz'|'heart'|'cloud'|null), emoteK 0..1 (pop), eyes / mouthShape
// overrides, hat ('hard'), t (blinks and breathing), seed, lw, shadow }. About 120 wide, 94 tall.
// Returns the nub tips { tipL, tipR } in the caller's coordinates.
export function clawd(g, x, y, s = 1, pose = {}) {
  const m = MOODS[pose.mood] || MOODS.neutral, t = pose.t, seed = pose.seed ?? 0;
  const lw = pose.lw ?? 5, lit = clamp01(pose.lit ?? 0), hop = pose.hop ?? 0, sal = clamp01(pose.salute ?? 0);
  const mini = !!pose.mini, flip = pose.flip ? -1 : 1;
  let sq = (pose.squash ?? 0) + (m.squash || 0) - (m.stretch || 0) - 0.1 * sal;
  if (t !== undefined && !pose.still) sq += 0.025 * Math.sin(t * 2.7 + seed * 1.7);
  const sx = 1 + 0.3 * sq, sy = 1 - 0.3 * sq;
  const hold = pose.holding || null, itemS = pose.itemScale ?? (hold === 'ticket' ? 0.42 : 0.5);
  let aL = pose.armL ?? m.arms[0], aR = pose.armR ?? m.arms[1];
  if (hold === 'ticket') {
    const a = Math.acos(clamp((150 * itemS - ARM.x) / ARM.L, -1, 1));
    if (pose.armL === undefined) aL = a;
    if (pose.armR === undefined) aR = a;
  } else if (hold && pose.armR === undefined) aR = 0.55;
  aR = lerp(aR, 2.5, sal);
  const pyR = lerp(ARM.y, -72, sal);
  const lx = clamp(pose.look ?? 0, -1, 1), ly = pose.lookY ?? m.lookY ?? 0;
  const closed = pose.blink ?? (t !== undefined ? blinkAt(t, seed) : 0);
  const lean = (pose.rot ?? 0) + (m.lean || 0);

  g.save();
  g.translate(x, y); g.scale(s * flip, s);
  if (lit > 0) glow(g, 0, -58, 175, PAL.gold, 0.6 * lit);
  if (pose.shadow !== false) groundShadow(g, 0, 0, 62 - 20 * clamp01(hop), 0.32 * (1 - 0.5 * clamp01(hop)));
  g.translate(0, -46 * hop);
  if (lean) g.rotate(lean);
  g.scale(sx, sy);

  // held things sit behind the nubs, so the nubs grip them
  if (hold === 'ticket') {
    g.save(); if (flip < 0) g.scale(-1, 1);
    ticket(g, 0, -76 - 190 * itemS, itemS, pose.fill || {}, { lw: 3, t, ...(pose.ticket || {}) });
    g.restore();
  } else if (hold) { const [tx, ty] = armTip(1, aR, pyR); heldItem(g, hold, tx, ty, itemS, pose, flip); }

  // legs behind the body, then the body, then the nubs stuck on its sides
  const legs = [];
  for (let i = 0; i < 4; i++) {
    const lift = pose.walk !== undefined ? Math.max(0, Math.sin(pose.walk + (i === 0 || i === 3 ? 0 : Math.PI))) * 6 : 0;
    legs.push(rr(LEGS[i] - 6, -30, 12, 30 - lift, 2.5));
  }
  const fill = clawdFill(g);
  cut(g, legs, fill, { lw });
  const body = rr(-60, -94, 120, 72, 6);
  cut(g, [body], fill, { lw });
  if (!mini) {
    g.fillStyle = 'rgba(255,232,210,0.34)'; g.fill(rr(-54, -90, 108, 4.5, 2.2));
    g.fillStyle = 'rgba(120,40,18,0.15)'; g.fill(rr(-56, -46, 112, 21, 3));
    grainOver(g, body, 0.14);
  }
  if (Math.abs(lx) > 0.06) {   // turned: a side plane shows opposite the look
    const wpl = 30 * Math.abs(lx), xl = lx > 0 ? -60 + wpl : 60 - wpl;
    g.save(); g.clip(body);
    g.fillStyle = 'rgba(110,38,20,0.3)'; g.fillRect(lx > 0 ? -62 : xl, -96, wpl + 2, 76);
    g.restore();
    g.strokeStyle = OL; g.lineWidth = lw * 0.6; g.beginPath(); g.moveTo(xl, -93); g.lineTo(xl, -23); g.stroke();
  }
  const arms = [armPath(-1, aL), armPath(1, aR, pyR)];
  cut(g, arms, PAL.clawd, { lw, sd: 1.5 });
  const all = union([...legs, body, ...arms]);
  if (lit > 0) {
    g.fillStyle = rgba(PAL.gold, 0.3 * lit); g.fill(all);
    g.strokeStyle = rgba(PAL.goldHi, 0.85 * lit); g.lineWidth = lw * 0.55; g.stroke(body);
  }
  if (m.gloom) { g.fillStyle = `rgba(30,36,82,${0.2 * m.gloom})`; g.fill(all); }

  // face
  const fx = lx * 12, ey = -71 + ly * 6;
  const ek = closed > 0.5 ? 'blink' : (pose.eyes || m.eyes);
  eye(g, fx - 30, ey, -1, ek); eye(g, fx + 30, ey, 1, ek);
  if (pose.blush ?? m.blush) {
    g.fillStyle = 'rgba(255,120,130,0.5)';
    g.beginPath(); g.ellipse(fx - 42, -55, 7, 4, 0, 0, TAU); g.ellipse(fx + 42, -55, 7, 4, 0, 0, TAU); g.fill();
  }
  mouth(g, fx * 0.9, -49 + ly * 3, pose.mouthShape ?? m.mouth, clamp01(pose.mouth ?? 0), m.sing);
  if (pose.tear) {
    const tr = clamp01(pose.tear);
    g.save(); g.globalAlpha *= Math.min(1, tr * 3);
    cut(g, [drop(fx + 34, ey + 10 + tr * 26, 4)], '#9FDBFF', { lw: 1.8, shadow: false });
    g.restore();
  }
  if ((pose.hat ?? null) === 'hard') hardHat(g, lw);
  const em = pose.emote === undefined ? m.emote : pose.emote;
  if (em) emote(g, em, 52, mini ? -140 : -116, pose.emoteK ?? 1, t ?? 0);
  if (pose.dim) { g.fillStyle = `rgba(7,10,30,${0.62 * clamp01(pose.dim)})`; g.fill(all); }
  g.restore();

  const M = new DOMMatrix().translateSelf(x, y).scaleSelf(s * flip, s).translateSelf(0, -46 * hop).rotateSelf(lean * 180 / Math.PI).scaleSelf(sx, sy);
  const [lxT, lyT] = armTip(-1, aL), [rxT, ryT] = armTip(1, aR, pyR);
  const a = M.transformPoint({ x: lxT, y: lyT }), b = M.transformPoint({ x: rxT, y: ryT });
  return { tipL: { x: a.x, y: a.y }, tipR: { x: b.x, y: b.y } };
}

// A mini subagent Clawd (0.35 size) in a hard hat. pose.tired 0..1 droops it; pose.hat = null
// takes the hat off. Otherwise the same pose options as clawd().
export function miniClawd(g, x, y, s = 1, pose = {}) {
  const tired = clamp01(pose.tired ?? 0);
  const mood = pose.mood ?? (tired > 0.5 ? 'tired' : 'determined');
  return clawd(g, x, y, 0.35 * s, {
    hat: 'hard', lw: 8, ...pose, mood, mini: true,
    squash: (pose.squash ?? 0) + 0.08 * tired,
    emote: pose.emote === undefined ? (tired > 0.5 ? 'sweat' : null) : pose.emote,
  });
}

// A hop, for p running 0..1: crouch, a stretched flight, a squashed landing. Spread it into a
// Clawd or bot pose: clawd(g, x, y, s, { ...hopPose(p), mood: 'happy' }).
export function hopPose(p, height = 1) {
  p = clamp01(p);
  if (p < 0.15) return { hop: 0, squash: 0.4 * smooth(p / 0.15) };
  if (p < 0.8) { const q = (p - 0.15) / 0.65; return { hop: height * Math.sin(Math.PI * q), squash: -0.25 * (1 - q) + 0.05 * q }; }
  const q = (p - 0.8) / 0.2;
  return { hop: 0, squash: 0.35 * Math.sin(Math.PI * q) * (1 - 0.5 * q) };
}

// ================= handwriting and printed text =================
// Lays out the whole text once (cached), then reveals it character by character, so words never
// jump lines while being written. Emoji become drawn doodles (🔥 a flame, 😤 a huffy face).
const PICTO = /\p{Extended_Pictographic}/u;
const LAYOUTS = new Map();
function layout(g, text, font, size, maxW, indent = 0) {
  const key = font + '|' + maxW + '|' + indent + '|' + text;
  let L = LAYOUTS.get(key);
  if (L) return L;
  g.save(); g.font = font;
  const space = g.measureText(' ').width, runs = [], lineW = [0];
  let x = indent, line = 0, n = 0;
  for (let w of String(text).replace(/\n/g, ' \n ').split(' ')) {
    if (w === '\n') { if (x > (line === 0 ? indent : 0)) { line++; x = 0; lineW.push(0); } continue; }
    if (!w) { n++; continue; }
    const icon = PICTO.test(w);
    const ww = icon ? size * (w.startsWith('😤') ? 1.5 : 1.2) : g.measureText(w).width;
    const start = line === 0 ? indent : 0;
    if (x + ww > maxW && x > start + 0.5) { line++; x = 0; lineW.push(0); }
    const len = icon ? 1 : [...w].length;
    runs.push({ w, x, ww, line, icon, n0: n, n1: n + len });
    lineW[line] = x + ww;
    x += ww + space; n += len + 1;
  }
  g.restore();
  L = { runs, lines: line + 1, lineW, total: Math.max(1, n - 1), width: Math.max(...lineW) };
  LAYOUTS.set(key, L);
  return L;
}
// Draw a layout at (x0, y0) (first baseline), revealing a fraction of it. Returns the pen point.
function drawLayout(g, L, font, size, x0, y0, lineH, reveal, color, o = {}) {
  const shown = clamp01(reveal) * L.total + 1e-6;
  g.font = font; g.fillStyle = color; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  let pen = null;
  for (let i = 0; i < L.runs.length; i++) {
    const r = L.runs[i];
    if (shown <= r.n0 + 0.5) break;
    const lx = x0 + r.x - (o.center ? L.lineW[r.line] / 2 : 0);
    const ly = y0 + r.line * lineH + (o.wobble ? (hash(i + o.wobble) - 0.5) * size * 0.08 : 0);
    if (r.icon) { doodle(g, r.w, lx + r.ww / 2, ly - size * 0.3, size, color); pen = [lx + r.ww, ly]; continue; }
    const c = Math.min(r.n1 - r.n0, Math.floor(shown - r.n0));
    if (c <= 0) break;
    const sub = c >= r.n1 - r.n0 ? r.w : [...r.w].slice(0, c).join('');
    if (o.halo) {
      g.save(); g.lineJoin = 'round';
      g.strokeStyle = o.halo; g.globalAlpha *= 0.4; g.lineWidth = o.haloW * 1.6; g.strokeText(sub, lx, ly);
      g.globalAlpha *= 1.6; g.lineWidth = o.haloW * 0.7; g.strokeText(sub, lx, ly);
      g.restore();
    }
    g.fillText(sub, lx, ly);
    g.fillStyle = color;
    pen = [lx + (sub === r.w ? r.ww : g.measureText(sub).width), ly];
  }
  return pen;
}
// Doodles standing in for emoji, drawn like pen marks.
function doodle(g, glyph, cx, cy, size, color) {
  g.save(); g.translate(cx, cy);
  const k = size / 30;
  g.scale(k, k);
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (glyph.startsWith('🔥')) {
    const outer = flamePath(24, 31, 3, 0, 13);
    g.fillStyle = PAL.gold; g.fill(outer); g.strokeStyle = color; g.lineWidth = 2.6; g.stroke(outer);
    g.fillStyle = '#FFF1B8'; g.fill(flamePath(10, 14, 1, 0, 13));
  } else if (glyph.startsWith('😤')) {
    g.strokeStyle = color; g.lineWidth = 2.4;
    g.beginPath(); g.arc(0, 0, 12, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(-8, -6); g.lineTo(-2, -3); g.moveTo(8, -6); g.lineTo(2, -3); g.stroke();
    g.fillStyle = color; g.beginPath(); g.arc(-4.5, 0.5, 1.6, 0, TAU); g.arc(4.5, 0.5, 1.6, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(-4, 6.5); g.lineTo(4, 6.5); g.stroke();
    for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 15.5, 8, 2.4, 0, TAU); g.stroke(); g.beginPath(); g.arc(sd * 19.5, 4, 1.8, 0, TAU); g.stroke(); }
  } else {
    g.font = `30px ${FONTS.display}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(glyph, 0, 0);
  }
  g.restore();
}
// Letter-spaced printed caps.
function spaced(g, text, x, y, px, align = 'left') {
  if ('letterSpacing' in g) { g.letterSpacing = `${px}px`; g.textAlign = align; g.fillText(text, x, y); g.letterSpacing = '0px'; return; }
  g.textAlign = align; g.fillText(text, x, y);
}

// ================= the ticket =================
// A cream work ticket, 300 × 380 at s = 1, centred on (x, y). Printed boxes FOR · GOOD = ·
// DON'T NEED · COST · FOR YOU; "make it good" is in your handwriting in the GOOD = box from the
// start. fill[key] 0..1 writes plan.BRIEF[key] into its box (for, good, dont, cost, you); writing
// GOOD = first strikes out "make it good". opts: { t, flicker 0..1 (the vague "good" cycles through
// confetti, a padlock, server pods), glow 0..1 (light through the paper and the words), who 0..1
// (the empty FOR box glows, asking), mycall 0..1 (writes and underlines "(my call)" in DON'T NEED),
// rot, pin (true | 'clip'), no (ticket number), make (text instead of "make it good"), lw, shadow }.
// Returns { nib: {x, y} | null, w, h } in the caller's coordinates (nib = the pen point while writing).
export const TICKET = { w: 300, h: 380 };
const PRINT = '#A4553F';
const TK_ROWS = [
  { key: 'for', label: 'FOR', y: -150, h: 62, size: 27, big: true },
  { key: 'good', label: 'GOOD =', y: -84, h: 80, size: 23 },
  { key: 'dont', label: "DON'T NEED", y: 0, h: 76, size: 22 },
  { key: 'cost', label: 'COST', y: 80, h: 44, size: 24 },
  { key: 'you', label: 'FOR YOU', y: 128, h: 56, size: 23 },
];
let TK_PATH = null;
function ticketPath() {
  if (TK_PATH) return TK_PATH;
  const p = new Path2D(), r = 12, n = 10, ny = -154;
  p.moveTo(-150 + r, -190);
  p.lineTo(150 - r, -190); p.arcTo(150, -190, 150, -190 + r, r);
  p.lineTo(150, ny - n); p.arc(150, ny, n, -Math.PI / 2, Math.PI / 2, true);
  p.lineTo(150, 190 - r); p.arcTo(150, 190, 150 - r, 190, r);
  p.lineTo(-150 + r, 190); p.arcTo(-150, 190, -150, 190 - r, r);
  p.lineTo(-150, ny + n); p.arc(-150, ny, n, Math.PI / 2, -Math.PI / 2, true);
  p.lineTo(-150, -190 + r); p.arcTo(-150, -190, -150 + r, -190, r);
  p.closePath();
  TK_PATH = p;
  return p;
}
function vagueIcon(g, k, x, y, w, h) {   // what "good" might mean: 1 confetti, 2 padlock, 3 pods
  g.save(); g.translate(x + w / 2, y - h * 0.34); g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = PAL.ink; g.lineWidth = 2.2;
  if (k === 1) {
    const cone = poly([[-14, 10], [-2, -2], [4, 4]]);
    g.fillStyle = PAL.token; g.fill(cone); g.stroke(cone);
    const cols = [PAL.gold, '#FF6FA3', '#4FD1C5', '#9B8CFF'];
    for (let i = 0; i < 7; i++) { g.fillStyle = cols[i % 4]; g.save(); g.translate(2 + hash(i) * 16, -12 + hash(i + 3) * 14); g.rotate(hash(i + 5) * 3); g.fillRect(-2.5, -1.5, 5, 3); g.restore(); }
  } else if (k === 2) {
    g.beginPath(); g.arc(0, -3, 6, Math.PI, 0); g.stroke();
    const b = rr(-9, -3, 18, 14, 3); g.fillStyle = PAL.gold; g.fill(b); g.stroke(b);
    g.fillStyle = PAL.ink; g.beginPath(); g.arc(0, 3, 2, 0, TAU); g.fill();
  } else {
    for (const [px, py] of [[-9, 2], [3, 2], [-3, -9]]) { const b = rr(px, py, 11, 9, 2); g.fillStyle = PAL.token; g.fill(b); g.stroke(b); }
  }
  g.restore();
}
export function ticket(g, x, y, s = 1, fill = {}, opts = {}) {
  const t = opts.t ?? 0, gl = clamp01(opts.glow ?? 0), rot = opts.rot ?? 0;
  const B = P.BRIEF, hand = FONTS.hand;
  let nib = null;
  g.save();
  g.translate(x, y); if (rot) g.rotate(rot); g.scale(s, s);
  if (gl > 0) {
    glow(g, 0, 0, 360, PAL.gold, 0.5 * gl);
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= 0.14 * gl; g.fillStyle = PAL.gold;
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU + 0.3 + 0.05 * Math.sin(t * 0.7 + i), L = 330 + 80 * hash(i);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - 0.07) * L, Math.sin(a - 0.07) * L); g.lineTo(Math.cos(a + 0.07) * L, Math.sin(a + 0.07) * L); g.closePath(); g.fill();
    }
    g.restore();
  }
  const card = ticketPath();
  cut(g, [card], gl > 0 ? mix(PAL.paper, '#FFF3C4', gl * 0.75) : PAL.paper, { lw: opts.lw ?? 3.5, sd: 4, shadow: opts.shadow });
  const vg = g.createRadialGradient(0, 0, 120, 0, 0, 260);
  vg.addColorStop(0, 'rgba(160,115,60,0)'); vg.addColorStop(1, `rgba(160,115,60,${0.2 * (1 - gl * 0.6)})`);
  g.fillStyle = vg; g.fill(card);
  grainOver(g, card, 0.42);
  if (opts.pin) {
    if (opts.pin === 'clip') { cut(g, [rr(-26, -200, 52, 22, 5)], '#9AA3BF', { lw: 2.6, sd: 1.5 }); }
    else { cut(g, [circ(0, -176, 9)], '#E4574B', { lw: 2.4, sd: 2 }); glint(g, -3, -179, 2.6); }
  }
  // header
  g.fillStyle = PRINT; g.font = `800 15px ${FONTS.display}`; g.textBaseline = 'alphabetic';
  spaced(g, 'BUILD TICKET', -134, -166, 2.4);
  g.font = `600 12px ${FONTS.mono}`; g.textAlign = 'right'; g.fillText(`Nº ${opts.no ?? '0042'}`, 134, -166);
  g.save(); g.strokeStyle = rgba(PRINT, 0.55); g.setLineDash([4, 5]); g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-136, -154); g.lineTo(136, -154); g.stroke(); g.restore();

  const inkCol = gl > 0 ? mix(PAL.ink, '#6B3A00', gl * 0.45) : PAL.ink;
  const glowText = () => {};   // light through the words: a gold halo stroked under the ink
  const halo = sz => (gl > 0.02 ? { halo: rgba(PAL.gold, 0.55 * gl), haloW: sz * 0.3 } : {});
  for (const row of TK_ROWS) {
    const box = rr(-140, row.y, 280, row.h, 6);
    if (row.big) { g.fillStyle = rgba(PRINT, 0.07); g.fill(box); }
    g.strokeStyle = rgba(PRINT, 0.72); g.lineWidth = row.big ? 2 : 1.5; g.stroke(box);
    if (row.key === 'for' && opts.who) {
      const w = clamp01(opts.who) * (0.65 + 0.35 * Math.sin(t * 5));
      g.save(); g.strokeStyle = rgba(PAL.gold, 0.3 * w); g.lineWidth = 12; g.stroke(box); g.strokeStyle = rgba(PAL.gold, w); g.lineWidth = 3.5; g.stroke(box); g.restore();
    }
    g.fillStyle = PRINT; g.font = `800 ${row.big ? 17 : 12.5}px ${FONTS.display}`;
    const lab = row.big ? 22 : 17;
    spaced(g, row.label, -131, row.y + lab, row.big ? 2 : 1.4);
    g.font = `800 ${row.big ? 17 : 12.5}px ${FONTS.display}`;
    const labW = g.measureText(row.label).width + row.label.length * (row.big ? 2 : 1.4);
    const indent = labW + 10, maxW = 262;
    const x0 = -131;
    if (row.key === 'for') {   // the blank: a printed line waiting for a name
      g.strokeStyle = rgba(PRINT, 0.6); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0 + indent, row.y + lab + 5); g.lineTo(131, row.y + lab + 5); g.stroke();
    }
    const txt = (row.key === 'dont' ? `${B.dont} (my\u00A0call)` : B[row.key]).replace(/ · /g, ' ·\n');
    const p = clamp01(fill[row.key] ?? 0);
    if (row.key === 'good') {
      // "make it good", in your hand, from the start
      const mk = opts.make ?? 'make it good', f26 = `600 26px ${hand}`;
      const Lm = layout(g, mk, f26, 26, 999, 0);
      const mx = x0 + indent, my = row.y + 22;
      g.save(); glowText(true);
      const fl = clamp01(opts.flicker ?? 0), step = Math.floor(t * 7.5), k = fl > 0 && hash(step * 1.37) < fl ? 1 + (step % 3) : 0;
      if (k && mk === 'make it good') {
        const pre = 'make it ', Lp = layout(g, pre, f26, 26, 999, 0);
        g.font = f26; g.fillStyle = inkCol; g.textAlign = 'left'; g.fillText(pre, mx, my);
        const goodW = Lm.width - Lp.width - 6;
        g.restore(); vagueIcon(g, k, mx + Lp.width + 5, my, goodW, 26); g.save();
      } else drawLayout(g, Lm, f26, 26, mx, my, 26, 1, inkCol, { wobble: 3, ...halo(26) });
      g.restore();
      const strike = clamp01(p / 0.18);
      if (strike > 0) {
        g.save(); g.strokeStyle = inkCol; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath();
        const W = Lm.width * strike;
        for (let i = 0; i <= 12; i++) { const u = i / 12; const px = mx - 3 + (W + 6) * u, py = my - 8 + Math.sin(u * 9) * 1.4 - u * 2; i ? g.lineTo(px, py) : g.moveTo(px, py); }
        g.stroke(); g.restore();
      }
      const q = clamp01((p - 0.18) / 0.82);
      if (q > 0) {
        const fs = `600 ${row.size}px ${hand}`, L = layout(g, txt, fs, row.size, maxW, 0);
        g.save(); glowText(true);
        const pen = drawLayout(g, L, fs, row.size, x0, row.y + 47, row.size * 1.08, q, inkCol, { wobble: 7, ...halo(row.size) });
        g.restore();
        if (q < 1 && pen) nib = pen;
      }
      continue;
    }
    const fs = `600 ${row.size}px ${hand}`, L = layout(g, txt, fs, row.size, maxW, indent);
    const lh = row.big ? 26 : row.size * 0.95;
    let q = p;
    if (row.key === 'dont') { const k = B.dont.length / (B.dont.length + 10); q = p * k + clamp01(opts.mycall ?? 0) * (1 - k); }
    if (q > 0) {
      g.save(); glowText(true);
      const pen = drawLayout(g, L, fs, row.size, x0, row.y + (row.big ? 23 : 19), lh, q, inkCol, { wobble: row.key.length * 5, ...halo(row.size) });
      g.restore();
      if (p > 0 && p < 1 && pen) nib = pen;
      if (row.key === 'dont' && (opts.mycall ?? 0) > 0.85) {   // underline "(my call)"
        const last = L.runs[L.runs.length - 1];
        const u = clamp01(((opts.mycall ?? 0) - 0.85) / 0.15);
        const ux0 = x0 + last.x, ux1 = x0 + last.x + last.ww, uy = row.y + 19 + last.line * lh + 5;
        g.strokeStyle = inkCol; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(ux0, uy); g.lineTo(lerp(ux0, ux1, u), uy + 1.5); g.stroke();
      }
    }
  }
  if (nib) { g.fillStyle = PAL.ink; g.beginPath(); g.arc(nib[0] + 3, nib[1] - 5, 2.4, 0, TAU); g.fill(); }
  g.restore();
  const out = { w: 300 * s, h: 380 * s, nib: null };
  if (nib) {
    const c = Math.cos(rot), sn = Math.sin(rot), nx = (nib[0] + 3) * s, ny = (nib[1] - 5) * s;
    out.nib = { x: x + c * nx - sn * ny, y: y + sn * nx + c * ny };
  }
  return out;
}

// ================= notes =================
function noteLayout(g, text, o) {
  const hand = !!o.hand, size = o.size ?? (hand ? 30 : 21);
  const font = hand ? `600 ${size}px ${FONTS.hand}` : `500 ${size}px ${FONTS.pixel}`;
  const maxW = o.w ? o.w - 36 : (o.maxW ?? 230);
  const L = layout(g, text, font, size, maxW, 0);
  const lineH = size * (hand ? 1.0 : 1.25);
  const w = o.w ?? Math.max(hand ? 130 : 120, L.width + 38), h = o.h ?? Math.max(hand ? 84 : 76, L.lines * lineH + (hand ? 38 : 44));
  return { L, font, size, lineH, w, h, hand };
}
// Size of a note (world units at s = 1) without drawing it.
export function noteSize(g, text = '', opts = {}) { const n = noteLayout(g, text, opts); return { w: n.w, h: n.h }; }
// A scrap of paper centred on (x, y). opts: { hand (your handwriting on torn notebook paper; else
// Clawd's pixel font on a peach index card), p 0..1 (how much is written), rot, crumple 0..1,
// flutter (radians of flip as it falls), glow 0..1, size, w, h, color }. Returns { w, h } (scaled).
export function note(g, x, y, s = 1, text = '', opts = {}) {
  const n = noteLayout(g, text, opts), { w, h } = n, cr = clamp01(opts.crumple ?? 0);
  const rot = opts.rot ?? (hash(text.length + 0.3) - 0.5) * 0.14;
  g.save();
  g.translate(x, y); g.rotate(rot); g.scale(s, s);
  if (opts.flutter) g.scale(Math.cos(opts.flutter), 1);
  if (opts.glow) glow(g, 0, 0, Math.max(w, h) * 0.95, PAL.gold, 0.45 * opts.glow);
  const paperC = n.hand ? '#F7F0DF' : '#FBE3D1';
  // outline: a torn top edge on your notes; crumpling pulls the edge into a wad
  const pts = [], N = 28;
  for (let i = 0; i < N; i++) {
    const u = i / N; let px, py;
    if (u < 0.25) { px = -w / 2 + w * (u / 0.25); py = -h / 2 + (n.hand ? (hash(i + 1) - 0.5) * 7 : 0); }
    else if (u < 0.5) { px = w / 2; py = -h / 2 + h * ((u - 0.25) / 0.25); }
    else if (u < 0.75) { px = w / 2 - w * ((u - 0.5) / 0.25); py = h / 2; }
    else { px = -w / 2; py = h / 2 - h * ((u - 0.75) / 0.25); }
    if (cr > 0) {
      const a = Math.atan2(py, px), R = Math.min(w, h) * 0.36 * (0.7 + 0.6 * hash(i * 1.7 + text.length));
      px = lerp(px, Math.cos(a) * R, cr); py = lerp(py, Math.sin(a) * R, cr);
    }
    pts.push([px, py]);
  }
  const paper = poly(pts);
  cut(g, [paper], cr > 0 ? mix(paperC, '#D9CDB4', cr * 0.5) : paperC, { lw: 3, sd: 2.5 });
  grainOver(g, paper, 0.35);
  if (n.hand && cr < 0.6) {   // notebook rules and a margin
    g.save(); g.clip(paper); g.globalAlpha *= 1 - cr;
    g.strokeStyle = 'rgba(90,140,210,0.28)'; g.lineWidth = 1.2;
    for (let yy = -h / 2 + 30; yy < h / 2; yy += n.lineH) { g.beginPath(); g.moveTo(-w / 2, yy + 6); g.lineTo(w / 2, yy + 6); g.stroke(); }
    g.strokeStyle = 'rgba(220,90,90,0.35)'; g.beginPath(); g.moveTo(-w / 2 + 14, -h / 2); g.lineTo(-w / 2 + 14, h / 2); g.stroke();
    g.restore();
  } else if (!n.hand && cr < 0.6) {   // Clawd's card: an orange header strip with a tiny Clawd
    g.save(); g.clip(paper); g.globalAlpha *= 1 - cr;
    g.fillStyle = rgba(PAL.clawd, 0.85); g.fillRect(-w / 2, -h / 2, w, 12);
    g.fillStyle = PAL.clawdDk; g.fillRect(w / 2 - 22, -h / 2 + 2, 14, 8);
    g.restore();
  }
  if (cr > 0) {   // facets and creases
    g.save(); g.clip(paper);
    for (let i = 0; i < N; i += 3) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 3) % N];
      g.fillStyle = i % 2 ? `rgba(255,255,255,${0.22 * cr})` : `rgba(90,60,30,${0.2 * cr})`;
      g.beginPath(); g.moveTo((hash(i) - 0.5) * 10 * cr, (hash(i + 1) - 0.5) * 10 * cr); g.lineTo(ax, ay); g.lineTo(bx, by); g.closePath(); g.fill();
    }
    g.strokeStyle = `rgba(90,70,50,${0.45 * cr})`; g.lineWidth = 1.4;
    for (let i = 0; i < 7; i++) { const a = hash(i + 9) * TAU, r0 = Math.min(w, h) * 0.34; g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a + 2.2) * r0 * 0.3, Math.sin(a + 2.2) * r0 * 0.3); g.stroke(); }
    g.restore();
  }
  if (cr < 0.7) {
    g.save(); g.clip(paper); g.globalAlpha *= 1 - cr / 0.7;
    const nh = opts.glow ? { halo: rgba(PAL.gold, 0.45 * opts.glow), haloW: n.size * 0.34 } : {};
    const top = -((n.L.lines - 1) * n.lineH) / 2 + n.size * (n.hand ? 0.3 : 0.42) + (n.hand ? 0 : 5);
    drawLayout(g, n.L, n.font, n.size, 0, top, n.lineH, opts.p ?? 1, opts.color ?? (n.hand ? PAL.ink : '#6A2A14'), { center: true, wobble: n.hand ? 11 : 0, ...nh });
    g.restore();
  }
  g.restore();
  return { w: w * s, h: h * s };
}

// ================= your phone =================
// An upright phone centred on (x, y), 54 × 96 at s = 1. screen: 'floss' (a to-do with a tick,
// opts.tick 0..1), 'hello' ("hello world · 1 view", a heart from mum), 'keypad' (six code dots,
// opts.digits 0..6, opts.err 0..1), 'log' (the finished app: one big button, opts.tap 0..1),
// 'pb' (🔥 PB!), 'call' (one big "call Sam" button), 'off'. opts: { glow 0..1 (screen light), rot, t }.
export function phone(g, x, y, s = 1, screen = 'off', o = {}) {
  const t = o.t ?? 0;
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(s, s);
  cut(g, [rr(-27, -48, 54, 96, 10)], '#1E2234', { lw: 3.4, sd: 2 });
  const sc = rr(-22, -41, 44, 80, 6);
  const bg = { floss: '#FFF9EE', hello: '#FFF9EE', keypad: '#141A2E', log: '#18204A', pb: '#3A2206', call: '#FFF9EE', off: '#0B0E1A' }[screen] || '#0B0E1A';
  g.fillStyle = bg; g.fill(sc);
  g.save(); g.clip(sc);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const small = (txt, yy, col) => { g.fillStyle = col; g.font = `800 7.5px ${FONTS.display}`; spaced(g, txt, 0, yy, 1, 'center'); };
  if (screen === 'floss') {
    small('TO DO', -28, '#9AA3BF');
    const box = rr(-9, -18, 18, 18, 3.5); g.strokeStyle = PAL.ink; g.lineWidth = 2.4; g.stroke(box);
    g.fillStyle = PAL.ink; g.font = `800 14px ${FONTS.display}`; g.textAlign = 'center'; g.fillText('floss', 0, 20);
    const tk = clamp01(o.tick ?? 0);
    if (tk > 0) {
      g.strokeStyle = '#2BB673'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
      g.moveTo(-6, -10); const a2 = clamp01(tk * 2), b2 = clamp01(tk * 2 - 1);
      g.lineTo(-6 + 5 * a2, -10 + 5 * a2); if (b2 > 0) g.lineTo(-1 + 13 * b2, -5 - 14 * b2); g.stroke();
    }
  } else if (screen === 'hello') {
    g.fillStyle = PAL.ink; g.font = `800 10px ${FONTS.display}`; g.fillText('hello', 0, -24); g.fillText('world', 0, -13);
    g.font = `800 14px ${FONTS.display}`; g.fillStyle = '#E4574B'; g.fillText('1 view', 0, 8);
    const hb = 1 + 0.15 * Math.max(0, Math.sin(t * 6));
    g.save(); g.translate(-9, 26); g.scale(hb, hb); g.fillStyle = '#FF5F7E'; g.fill(heartPath(0, 0, 5)); g.restore();
    g.fillStyle = '#6B7290'; g.font = `600 11px ${FONTS.hand}`; g.textAlign = 'left'; g.fillText('mum', -2, 29);
  } else if (screen === 'keypad') {
    const d = Math.round(clamp(o.digits ?? 0, 0, 6)), err = clamp01(o.err ?? 0);
    if (err > 0) { g.fillStyle = rgba('#E4574B', 0.5 * err); g.fillRect(-24, -44, 48, 88); }
    small('2FA', -26, '#9AA3BF');
    for (let i = 0; i < 6; i++) {
      const px = -13 + (i % 3) * 13, py = -8 + Math.floor(i / 3) * 15;
      g.beginPath(); g.arc(px, py, 4.4, 0, TAU);
      if (i < d) { g.fillStyle = err > 0.3 ? '#FF8A80' : '#8CFFC1'; g.fill(); } else { g.strokeStyle = '#6B7290'; g.lineWidth = 1.8; g.stroke(); }
    }
    if (err > 0.3) { g.fillStyle = '#FF8A80'; g.font = `800 12px ${FONTS.display}`; g.fillText('✕ wrong', 0, 30); }
  } else if (screen === 'log') {
    const tap = clamp01(o.tap ?? 0), k = 1 - 0.1 * Math.sin(Math.PI * tap);
    if (tap > 0) { g.strokeStyle = rgba(PAL.gold, 1 - tap); g.lineWidth = 2.5; g.beginPath(); g.arc(0, 4, 16 + 18 * tap, 0, TAU); g.stroke(); }
    g.save(); g.translate(0, 4); g.scale(k, k);
    cut(g, [circ(0, 0, 16)], PAL.gold, { lw: 2.2, sd: 1 });
    g.fillStyle = PAL.ink; g.font = `800 10px ${FONTS.display}`; g.fillText('LOG', 0, 3.6);
    g.restore();
    small('ONE TAP', -27, '#C9C3D8');
  } else if (screen === 'pb') {
    glow(g, 0, -4, 46, PAL.gold, 0.8);
    flame(g, 0, 12, 0.26, t, { glow: false });
    g.fillStyle = PAL.goldHi; g.font = `800 15px ${FONTS.display}`; g.fillText('PB!', 0, 31);
  } else if (screen === 'call') {
    cut(g, [rr(-18, -12, 36, 26, 8)], '#2BB673', { lw: 2, sd: 1 });
    g.fillStyle = '#fff'; g.font = `800 8px ${FONTS.display}`; g.fillText('call Sam', 0, 4);
  }
  g.fillStyle = 'rgba(255,255,255,0.07)'; g.beginPath(); g.moveTo(-22, -41); g.lineTo(8, -41); g.lineTo(-22, 0); g.closePath(); g.fill();
  g.restore();
  if (o.glow) glow(g, 0, 0, 100, screen === 'pb' || screen === 'log' ? PAL.gold : '#CFE3FF', 0.4 * o.glow);
  g.restore();
}

// ================= your hand =================
// A bold papercut hand in a heather-grey hoodie sleeve, chalk dust on the fingers, a coral hair tie
// on the wrist. The arm comes out of (x, y), pointing along rot (radians; 0 = right, PI/2 = down),
// or from = 'up'|'down'|'left'|'right' (the side it comes from). Nothing shows behind (x, y), so it
// can come out of a letterbox or a chute. pose: { reach 0..1 (how far out), arm (forearm length,
// default 80; make it long to reach down the chute), holding: 'phone'|'pen'|'ticket'|'note'|'token'
// |null, point 0..1, tap 0..1 (the pointing finger pushes), grip ('open'|'point'|'fist'|'pinch'|
// 'phone'), screen + screenOpts (the phone's app state), item (note text), itemScale, fill +
// ticket (a held ticket's fill and opts), sweat 0..1, chalk 0..1 (default 1), t, flipY, sleeve, lw }.
// Returns { tip, grip, wrist } in the caller's coordinates (tip = fingertip or pen nib).
const SKIN = '#EDB48A', SKIN_DK = '#CF9166', NAIL = '#F8DCCB', SLEEVE = '#9AA3BF', CUFF = '#7F88A6', TIE = '#FF5F8F';
const FROM = { left: 0, right: Math.PI, up: Math.PI / 2, down: -Math.PI / 2 };
function gripFor(holding, point) {
  if (holding === 'phone') return 'phone';
  if (holding === 'pen') return 'fist';
  if (holding === 'ticket' || holding === 'note' || holding === 'token') return 'pinch';
  return point ? 'point' : 'open';
}
export function hand(g, x, y, s = 1, pose = {}) {
  const reach = clamp01(pose.reach ?? 1), t = pose.t ?? 0, lw = pose.lw ?? 4;
  const rot = pose.rot ?? (pose.from ? FROM[pose.from] : Math.PI / 2);
  const armLen = pose.arm ?? 80, HL = 64, out = reach * (armLen + HL), xw = out - HL;
  const flipY = pose.flipY ?? Math.cos(rot) < -0.01;
  const grip = pose.grip || gripFor(pose.holding, pose.point);
  const tap = clamp01(pose.tap ?? 0) * 7, chalk = clamp01(pose.chalk ?? 1), sweat = clamp01(pose.sweat ?? 0);
  const M = new DOMMatrix().translateSelf(x, y).rotateSelf(rot * 180 / Math.PI).scaleSelf(s, flipY ? -s : s);
  const W = (px, py) => { const q = M.transformPoint({ x: px, y: py }); return { x: q.x, y: q.y }; };
  const dir = [Math.cos(rot), Math.sin(rot)];

  // what the fingers do
  let fingers = [], bumps = [], thumb, tip, gp;
  if (grip === 'open') {
    fingers = [[xw + 30, -11, -0.12, 25, 8.8], [xw + 32, -3.5, -0.04, 28, 9], [xw + 31, 4, 0.05, 25, 8.6], [xw + 28, 11, 0.14, 19, 7.8]];
    thumb = [xw + 12, -12, -0.85, 20, 9.6]; tip = [xw + 62, -4]; gp = [xw + 56, -4];
  } else if (grip === 'point') {
    fingers = [[xw + 30, -10, -0.05, 30 + tap, 8.8]];
    bumps = [[xw + 30, -3, 12, 8.6], [xw + 29, 4, 11, 8.4], [xw + 27, 11, 9, 7.6]];
    thumb = [xw + 12, -13, -0.25, 18, 9.4]; tip = [xw + 66 + tap, -11.5]; gp = tip;
  } else if (grip === 'fist') {
    bumps = [[xw + 30, -12, 11, 8.6], [xw + 31, -4, 12, 8.8], [xw + 30, 4, 11, 8.6], [xw + 28, 11, 9, 7.8]];
    thumb = [xw + 12, -13, -0.08, 22, 9.8]; tip = [xw + 2 + Math.cos(0.8) * 90, -36 + Math.sin(0.8) * 90]; gp = [xw + 36, 0];
  } else if (grip === 'pinch') {
    fingers = [[xw + 30, -9, -0.2, 17, 8.8]];
    bumps = [[xw + 30, -1, 11, 8.6], [xw + 29, 6, 10, 8.4], [xw + 27, 12, 8, 7.6]];
    thumb = [xw + 14, -15, 0.12, 27, 9.6]; tip = [xw + 50, -12]; gp = [xw + 48, -11];
  } else {   // phone: fingers curl round behind it
    bumps = [[xw + 30, -12, 10, 8.6], [xw + 31, -4, 11, 8.8], [xw + 30, 4, 10, 8.6], [xw + 28, 11, 8, 7.8]];
    tip = [xw + 44, 0]; gp = [xw + 44, 0];
  }
  const gW = W(gp[0], gp[1]);

  // a held ticket, note or token sits under the thumb, upright for reading
  const ext = (w, h) => Math.abs(dir[0]) * w / 2 + Math.abs(dir[1]) * h / 2;
  if (pose.holding === 'ticket') {
    const k = (pose.itemScale ?? 0.4) * s, e = ext(300 * k, 380 * k) - 14 * k;
    ticket(g, gW.x + dir[0] * e, gW.y + dir[1] * e, k, pose.fill || {}, { t, lw: 3, ...(pose.ticket || {}) });
  } else if (pose.holding === 'note') {
    const k = (pose.itemScale ?? 0.6) * s, sz = noteSize(g, pose.item ?? '', { hand: pose.itemHand ?? true }), e = ext(sz.w * k, sz.h * k) - 10 * k;
    note(g, gW.x + dir[0] * e, gW.y + dir[1] * e, k, pose.item ?? '', { hand: pose.itemHand ?? true, rot: 0.05, t });
  } else if (pose.holding === 'token') token(g, gW.x + dir[0] * 10 * s, gW.y + dir[1] * 10 * s, (pose.itemScale ?? 1) * s * 1.2, { spin: pose.itemSpin ?? 0 });

  g.save();
  g.transform(M.a, M.b, M.c, M.d, M.e, M.f);
  if (pose.clip !== false) { g.beginPath(); g.rect(0, -900, 9000, 1800); g.clip(); }
  // forearm, sleeve and cuff, hair tie
  cut(g, [rr(xw - 34, -14, 42, 28, 8)], SKIN, { lw, sd: 2 });
  const cuffX = xw - 40;
  if (cuffX > -30) cut(g, [rr(-30, -19, cuffX + 34, 38, 9)], pose.sleeve || SLEEVE, { lw, sd: 2 });
  cut(g, [rr(cuffX - 4, -20.5, 16, 41, 5)], CUFF, { lw, sd: 1.5 });
  g.strokeStyle = 'rgba(40,45,70,0.35)'; g.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) { const rx = cuffX + i * 3.5; g.beginPath(); g.moveTo(rx, -18); g.lineTo(rx, 18); g.stroke(); }
  if (pose.sleeve === undefined) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fill(rr(-30, -15, Math.max(0, cuffX + 30), 5, 2.5)); }
  cut(g, [rr(xw - 20, -17.5, 8, 35, 4), circ(xw - 16, -17, 4.2), circ(xw - 16, 17, 4.2)], TIE, { lw: lw * 0.8, sd: 1 });
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.fill(rr(xw - 19, -13, 2.5, 22, 1.2));

  // the pen goes under the fist
  if (grip === 'fist' && pose.holding === 'pen') {
    const px0 = xw + 2, py0 = -36, pa = 0.8, PL = 80;
    cut(g, [moved(rr(0, -4.2, PL, 8.4, 4.2), px0, py0, pa)], '#2E47B8', { lw: lw * 0.8, sd: 1.5 });
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill(moved(rr(4, -2.6, PL - 10, 2, 1), px0, py0, pa));
    cut(g, [moved(rr(0, -4.8, 16, 9.6, 3), px0, py0, pa)], '#1B2553', { lw: lw * 0.6, shadow: false });
    const nb = moved(poly([[0, -4], [10, 0], [0, 4]]), px0 + Math.cos(pa) * PL, py0 + Math.sin(pa) * PL, pa);
    cut(g, [nb], '#D5DAE4', { lw: lw * 0.6, shadow: false });
  }
  // palm, fingers, thumb: one cut-out
  cut(g, [rr(xw - 2, -15.5, 38, 31, 11)], SKIN, { lw, sd: 2.5 });
  g.fillStyle = rgba(SKIN_DK, 0.45); g.fill(rr(xw + 2, 6, 30, 8, 4));
  for (let i = bumps.length - 1; i >= 0; i--) { const b = bumps[i]; cut(g, [rr(b[0], b[1] - b[3] / 2, b[2], b[3], b[3] / 2)], SKIN, { lw: lw * 0.75, sd: 0.6 }); }
  for (let i = fingers.length - 1; i >= 0; i--) { const f = fingers[i]; cut(g, [cap(f[0], f[1], f[2], f[3], f[4])], SKIN, { lw: lw * 0.75, sd: 0.6 }); }
  if (thumb) cut(g, [cap(thumb[0], thumb[1], thumb[2], thumb[3], thumb[4])], SKIN, { lw: lw * 0.8, sd: 1.2 });
  // nails and knuckles
  g.fillStyle = NAIL;
  for (const f of fingers) {
    const L = f[3] - 2;
    g.beginPath(); g.ellipse(f[0] + Math.cos(f[2]) * L, f[1] + Math.sin(f[2]) * L, 3.4, 2.7, f[2], 0, TAU); g.fill();
  }
  g.strokeStyle = SKIN_DK; g.lineWidth = 1.6; g.lineCap = 'round';
  for (const ky of [-8, 0, 8]) { g.beginPath(); g.arc(xw + 26, ky, 3, -0.9, 0.9); g.stroke(); }
  // chalk: white on the fingertips and the palm edge, specks around
  if (chalk > 0) {
    g.fillStyle = `rgba(255,255,255,${0.34 * chalk})`;
    for (const f of fingers) { const L = f[3] - 6; g.beginPath(); g.ellipse(f[0] + Math.cos(f[2]) * L, f[1] + Math.sin(f[2]) * L, 5.5, 3.4, f[2], 0, TAU); g.fill(); }
    for (const b of bumps) { g.beginPath(); g.ellipse(b[0] + b[2] - 4, b[1], 3.6, 3, 0, 0, TAU); g.fill(); }
    g.fillStyle = `rgba(255,255,255,${0.2 * chalk})`; g.beginPath(); g.ellipse(xw + 16, 3, 12, 7, 0.2, 0, TAU); g.fill();
    g.fillStyle = `rgba(255,255,255,${0.8 * chalk})`;
    for (let i = 0; i < 26; i++) { const r = 0.8 + hash(i + 4.4) * 1.3; g.fillRect(xw - 6 + hash(i + 0.5) * 66, -17 + hash(i + 1.5) * 34, r, r); }
  }
  if (sweat > 0) {   // shine on the skin
    g.strokeStyle = `rgba(255,255,255,${0.8 * sweat})`; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.arc(xw + 12, -4, 7, -2.4, -1.4); g.stroke();
    g.beginPath(); g.arc(xw - 20, -3, 6, -2.2, -1.3); g.stroke();
  }
  g.restore();

  // the phone, upright, gripped by a thumb and two fingertips
  if (grip === 'phone') {
    const ps = pose.phoneScale ?? 1;
    const c = W(xw + 46, 0);
    phone(g, c.x, c.y, s * ps, pose.screen ?? 'off', { t, ...(pose.screenOpts || {}) });
    g.save(); g.translate(c.x, c.y); g.scale(s * ps, s * ps);
    const nubs = [cap(-31, 16, -Math.PI / 2 + 0.1, 15, 10), cap(29, -12, Math.PI / 2 + 0.1, 8, 9), cap(29, 2, Math.PI / 2 + 0.1, 8, 9)];
    cut(g, nubs, SKIN, { lw, sd: 1.5 });
    if (chalk > 0) { g.fillStyle = `rgba(255,255,255,${0.6 * chalk})`; for (const [nx, ny] of [[-30, 0], [30, -6], [30, 8]]) { g.beginPath(); g.arc(nx, ny, 3.6, 0, TAU); g.fill(); } }
    g.restore();
  }
  // sweat drops fall in world space
  if (sweat > 0) {
    const n = 1 + Math.round(sweat * 3), hc = W(xw + 16, 0), side = grip === 'phone' ? 46 : 22;
    for (let i = 0; i < n; i++) {
      const ph = (t * (0.8 + 0.3 * hash(i + 2)) + hash(i)) % 1;
      const dx = (i % 2 ? 1 : -1) * (side + 14 * hash(i + 7)) * s, dy = (-18 + ph * 46) * s;   // either side, clear of the screen
      g.save(); g.globalAlpha *= Math.sin(ph * Math.PI) * sweat;
      g.translate(hc.x + dx, hc.y + dy); g.scale(s, s);
      cut(g, [drop(0, 0, 4.2)], '#A6E1FF', { lw: 1.8, shadow: false }); glint(g, -1.2, -1, 1.3);
      g.restore();
    }
  }
  return { tip: W(tip[0], tip[1]), grip: gW, wrist: W(xw, 0) };
}

// ================= tokens =================
// An orange quota coin, radius 14 at s = 1, centred on (x, y). opts: { spin 0..1 (a turn),
// glow 0..1, powered 0..1 (0 = spent, grey) }.
export function token(g, x, y, s = 1, opts = {}) {
  const spin = opts.spin ?? 0, k = Math.cos(spin * TAU), dead = 1 - clamp01(opts.powered ?? 1);
  g.save(); g.translate(x, y);
  if (opts.glow) glow(g, 0, 0, 44 * s, PAL.token, 0.55 * opts.glow);
  g.scale(s * Math.max(0.1, Math.abs(k)), s);
  const face = mix(PAL.token, '#5A5F78', dead * 0.75);
  cut(g, [circ(0, 0, 14)], face, { lw: 2.8, sd: 1.2 });
  g.strokeStyle = rgba('#FFE3CC', 0.6 * (1 - dead)); g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, 10, 0, TAU); g.stroke();
  g.strokeStyle = mix(PAL.clawdDk, '#3A3F55', dead); g.lineWidth = 2.6; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.3; g.beginPath(); g.moveTo(Math.cos(a) * 6, Math.sin(a) * 6); g.lineTo(-Math.cos(a) * 6, -Math.sin(a) * 6); g.stroke(); }
  g.strokeStyle = `rgba(255,248,236,${0.75 * (1 - dead)})`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 11.5, 3.5, 4.6); g.stroke();
  g.restore();
}

// ================= the misfit builds =================
// build(g, which, x, y, s, opts), bottom centre at (x, y). which: 'confetti' (a party cannon;
// opts.fire 0..1 is one burst, opts.aim radians, opts.melt 0..1 melts it into the PB flame),
// 'vault' (a vault door with a 6-digit keypad; opts.digits 0..6, err 0..1, open 0..1, spin),
// 'pods' (a tower of generic containers spinning up as p runs 0..1), 'clock' (hands spinning with
// t; opts.speed), 'summary' (SUMMARY.md sheets pinned up, opts.n of them, appearing as p runs),
// 'sheet' (one big readable SUMMARY.md). Shared opts: { p 0..1 (install), powered 0..1 (lit vs
// dead), t, flip (confetti only) }.
const INSTALL_INSIDE = { pods: 1, summary: 1 };
export function build(g, which, x, y, s = 1, opts = {}) {
  const p = clamp01(opts.p ?? 1);
  if (p <= 0) return;
  const pow = clamp01(opts.powered ?? 1), t = opts.t ?? 0;
  g.save(); g.translate(x, y);
  if (!INSTALL_INSIDE[which] && p < 1) {
    const k = backOut(p); g.scale(s * k, s * lerp(1.3, 1, smooth(p)) * k); g.globalAlpha *= clamp01(p * 4);
  } else g.scale(s, s);
  switch (which) {
    case 'confetti': cannon(g, pow, opts, t); break;
    case 'vault': vault(g, pow, opts, t); break;
    case 'pods': pods(g, pow, opts, t, p); break;
    case 'clock': clock(g, pow, opts, t); break;
    case 'summary': sheets(g, pow, opts, p); break;
    case 'sheet': summarySheet(g, 0, -62, 1.3, 0, pow); break;
  }
  if (!INSTALL_INSIDE[which] && p > 0.55 && p < 1) {   // bolts going in
    const k = Math.sin(Math.PI * (p - 0.55) / 0.45);
    for (const sx of [-1, 1]) cut(g, [starPath(sx * 44, -4, 11 * k, 4, 0.3)], PAL.goldHi, { lw: 1.6, shadow: false });
  }
  g.restore();
}

function cannon(g, pow, o, t) {
  const fire = clamp01(o.fire ?? 0), melt = clamp01(o.melt ?? 0), lw = 4.5;
  let aim = o.aim ?? -0.95;
  if (o.flip) g.scale(-1, 1);
  if (melt > 0) {   // wow was right, just aimed: it melts down to one small flame
    const k = smooth(melt);
    g.save(); g.globalAlpha *= 1 - smooth((melt - 0.5) / 0.4);
    g.scale(1 + 0.25 * k, 1 - 0.75 * k);
    aim = lerp(aim, 0.25, k);
  }
  const col = c => (melt > 0 ? mix(pc(c, pow).startsWith('#') ? c : c, PAL.gold, smooth(melt) * 0.8) : pc(c, pow));
  const recoil = fire > 0 && fire < 0.25 ? 8 * (1 - fire / 0.25) : 0;
  cut(g, [poly([[-48, 0], [48, 0], [38, -30], [-36, -30]])], col(PAL.clawdDk), { lw });
  g.save(); g.translate(0, -36); g.rotate(aim); g.translate(-recoil, 0);
  const barrel = poly([[-16, -15], [50, -17], [56, -23], [72, -25], [72, 25], [56, 23], [50, 17], [-16, 15]]);
  cut(g, [barrel, circ(-16, 0, 15)], col(PAL.clawd), { lw });
  g.fillStyle = col(PAL.gold);
  for (const bx of [12, 32]) { const b = rr(bx, -17, 8, 34, 2); g.fill(b); g.strokeStyle = OL; g.lineWidth = 2; g.stroke(b); }
  g.fill(starPath(-14, 0, 8, 5, 0.45));
  g.fillStyle = '#2A1410'; g.beginPath(); g.ellipse(72, 0, 5, 22, 0, 0, TAU); g.fill(); g.strokeStyle = OL; g.lineWidth = 3; g.stroke();
  if (pow > 0.5 && fire === 0 && melt === 0) {   // confetti peeking out
    const cols = [PAL.gold, '#FF6FA3', '#4FD1C5', '#9B8CFF'];
    for (let i = 0; i < 5; i++) { g.fillStyle = cols[i % 4]; g.save(); g.translate(73, -14 + i * 7); g.rotate(i * 1.3 + Math.sin(t * 3 + i) * 0.2); g.fillRect(-3, -2, 7, 4); g.restore(); }
  }
  g.restore();
  for (const wx of [-27, 27]) {
    cut(g, [circ(wx, -17, 17)], col('#8B3E27'), { lw });
    g.strokeStyle = col(PAL.gold); g.lineWidth = 2.6;
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + (pow > 0.5 ? 0 : 0.4); g.beginPath(); g.moveTo(wx + Math.cos(a) * 12, -17 + Math.sin(a) * 12); g.lineTo(wx - Math.cos(a) * 12, -17 - Math.sin(a) * 12); g.stroke(); }
    cut(g, [circ(wx, -17, 5)], col(PAL.gold), { lw: 2, shadow: false });
  }
  if (melt > 0) {
    g.restore();
    for (let i = 0; i < 4; i++) {   // drips
      const ph = clamp01(melt * 1.6 - i * 0.12), dx = -34 + i * 22;
      if (ph > 0 && melt < 0.95) { g.fillStyle = rgba(PAL.gold, 1 - melt); g.beginPath(); g.ellipse(dx, -4 + ph * 6, 5, 7 * ph + 2, 0, 0, TAU); g.fill(); }
    }
    const fk = smooth((melt - 0.35) / 0.65);
    if (fk > 0) flame(g, 0, 0, 0.62 * fk, t);
    return;
  }
  if (fire > 0 && pow > 0.5) {
    const mx = Math.cos(aim) * (72 - recoil), my = -36 + Math.sin(aim) * (72 - recoil);
    confettiBurst(g, mx, my, aim, fire);
  }
}
function confettiBurst(g, mx, my, aim, f) {
  const cols = [PAL.gold, '#FF6FA3', '#4FD1C5', '#9B8CFF', '#FFF1B8', '#FF8A3D', '#7EE081'];
  const tau = f * 1.35, fade = 1 - smooth((f - 0.72) / 0.28);
  if (f < 0.2) {
    const k = 1 - f / 0.2;
    glow(g, mx, my, 120, PAL.goldHi, 0.8 * k);
    cut(g, [starPath(mx + Math.cos(aim) * 16, my + Math.sin(aim) * 16, 38 * backOut(f / 0.08), 8, 0.45, aim)], PAL.goldHi, { lw: 2.5, shadow: false });
  }
  for (let i = 0; i < 48; i++) {
    const a = aim + (hash(i) - 0.5) * 1.15, v = 240 + 380 * hash(i + 17);
    const d = v * (1 - Math.exp(-tau * 2.2)) / 2.2;
    const px = mx + Math.cos(a) * d + Math.sin(tau * 5 + i) * 7 * tau, py = my + Math.sin(a) * d + 150 * tau * tau;
    const sz = 5 + 6 * hash(i + 7);
    g.save(); g.translate(px, py); g.rotate(hash(i + 3) * TAU + tau * (6 + 8 * hash(i + 5))); g.scale(1, Math.max(0.15, Math.abs(Math.cos(tau * 9 + i))));
    g.globalAlpha *= fade; g.fillStyle = cols[i % cols.length]; g.fillRect(-sz / 2, -sz * 0.32, sz, sz * 0.64);
    g.restore();
  }
  g.save(); g.globalAlpha *= fade; g.lineWidth = 3; g.lineCap = 'round';
  for (let j = 0; j < 4; j++) {   // curly streamers
    const a = aim + (j - 1.5) * 0.28, v = 300 + 60 * j;
    g.strokeStyle = cols[(j * 2 + 1) % cols.length]; g.beginPath();
    for (let q = 0; q <= 16; q++) {
      const u = tau * (0.35 + 0.65 * q / 16), d = v * (1 - Math.exp(-u * 2.2)) / 2.2;
      const px = mx + Math.cos(a) * d + Math.sin(q * 1.3 + j) * 9, py = my + Math.sin(a) * d + 150 * u * u + Math.cos(q * 1.3 + j) * 6;
      q ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
  }
  g.restore();
}

function vault(g, pow, o, t) {
  const lw = 4.5, digits = Math.round(clamp(o.digits ?? 0, 0, 6)), err = clamp01(o.err ?? 0), open = clamp01(o.open ?? 0);
  cut(g, [rr(-92, -168, 144, 168, 10)], pc('#9E4E33', pow), { lw });
  g.fillStyle = pc('#7C3A25', pow);
  for (const [bx, by] of [[-82, -158], [42, -158], [-82, -10], [42, -10]]) { g.beginPath(); g.arc(bx, by, 4, 0, TAU); g.fill(); }
  const cx = -20, cy = -84;
  if (open > 0) {
    cut(g, [circ(cx, cy, 58)], '#120E18', { lw: 3, shadow: false });
    glow(g, cx, cy + 20, 50, PAL.gold, 0.5 * open);
    for (let i = 0; i < 6; i++) token(g, cx - 25 + i * 10, cy + 40 - (i % 2) * 6, 0.6);
  }
  g.save(); g.translate(cx - 58 * (1 - Math.cos(open * 1.35)), cy); g.scale(Math.max(0.12, Math.cos(open * 1.35)), 1);
  cut(g, [circ(0, 0, 60)], pc(PAL.clawd, pow), { lw });
  g.strokeStyle = pc(PAL.clawdDk, pow); g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 50, 0, TAU); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; cut(g, [circ(Math.cos(a) * 50, Math.sin(a) * 50, 4.2)], pc(PAL.gold, pow), { lw: 1.6, shadow: false }); }
  cut(g, [circ(0, 0, 30)], pc('#E8906C', pow), { lw: 3, shadow: false });
  g.rotate(o.spin ?? 0);
  const spokes = [];
  for (let i = 0; i < 3; i++) spokes.push(moved(rr(-40, -3.5, 80, 7, 3.5), 0, 0, i * Math.PI / 3));
  cut(g, spokes, pc('#E0B04A', pow), { lw: 2.6, sd: 1.5 });
  const knobs = [];
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; knobs.push(circ(Math.cos(a) * 40, Math.sin(a) * 40, 6)); }
  knobs.push(circ(0, 0, 10));
  cut(g, knobs, pc(PAL.gold, pow), { lw: 2.6, sd: 1.5 });
  g.restore();
  const kx = 58, ky = -132;
  cut(g, [rr(kx, ky, 38, 76, 7)], pc('#262B44', pow), { lw: 3.4, sd: 2 });
  g.fillStyle = pow > 0.5 ? (err > 0.3 ? '#5A1616' : '#0F3328') : '#141828'; g.fill(rr(kx + 4, ky + 5, 30, 15, 3));
  for (let i = 0; i < 6; i++) {
    const px = kx + 8.5 + i * 4.3, py = ky + 12.5;
    g.beginPath(); g.arc(px, py, 1.7, 0, TAU);
    if (i < digits && pow > 0.5) { g.fillStyle = err > 0.3 ? '#FF8A80' : '#8CFFC1'; g.fill(); }
    else { g.strokeStyle = pow > 0.5 ? '#3E6E5E' : '#2A2F45'; g.lineWidth = 0.9; g.stroke(); }
  }
  if (pow > 0.5) glow(g, kx + 19, ky + 12, 22, err > 0.3 ? '#FF6B6B' : '#8CFFC1', 0.35);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const b = rr(kx + 6 + c * 9.5, ky + 26 + r * 11.5, 7.5, 8, 2);
    g.fillStyle = pc(PAL.token, pow); g.fill(b); g.strokeStyle = OL; g.lineWidth = 1.3; g.stroke(b);
  }
}

function pods(g, pow, o, t, p) {
  const N = 8, lw = 4;
  const cols = ['#E8834F', PAL.clawd, '#F09A63', '#DD7F55'];
  for (let i = 0; i < N; i++) {
    const row = Math.floor(i / 2), col = i % 2;
    const p0 = i / N * 0.78, a = clamp01((p - p0) / 0.12), ready = clamp01((p - p0 - 0.1) / 0.12);
    if (a <= 0) continue;
    const sway = row * 1.6 * Math.sin(t * 1.9 + 0.4) * pow;
    const px = (col ? 27 : -27) + sway + (hash(i) - 0.5) * 4, py = -36 * (row + 1) - (1 - backOut(a)) * 50;
    g.save(); g.translate(px, py); g.rotate((hash(i + 3) - 0.5) * 0.06); g.globalAlpha *= clamp01(a * 3);
    cut(g, [rr(-25, 0, 50, 33, 6)], pc(cols[i % 4], pow), { lw, sd: 2 });
    g.strokeStyle = pow > 0.5 ? rgba(PAL.clawdDk, 0.55) : 'rgba(30,34,60,0.5)'; g.lineWidth = 2.2;
    for (const rx of [-13, -5, 3]) { g.beginPath(); g.moveTo(rx, 7); g.lineTo(rx, 26); g.stroke(); }
    const on = pow > 0.5 && ready >= 1;
    g.fillStyle = on ? '#FFE27A' : '#3A2A2A'; g.beginPath(); g.arc(15, 9, 3.4, 0, TAU); g.fill();
    if (on) glow(g, 15, 9, 12, PAL.gold, 0.6);
    if (pow > 0.5 && ready < 1) {
      g.strokeStyle = '#FFF6E6'; g.lineWidth = 2.6; g.lineCap = 'round';
      g.beginPath(); g.arc(14, 21, 5.5, t * 9 + i, t * 9 + i + 4.2); g.stroke();
    }
    g.restore();
  }
  if (p >= 0.95) {   // a beacon on top
    const bx = 1.6 * 3 * Math.sin(t * 1.9 + 0.4) * pow, by = -36 * 4;
    cut(g, [rr(bx - 3, by - 16, 6, 16, 2), circ(bx, by - 20, 6)], pc('#9AA3BF', pow), { lw: 3 });
    if (pow > 0.5 && Math.sin(t * 6) > 0) { g.fillStyle = '#FF6B6B'; g.beginPath(); g.arc(bx, by - 20, 5, 0, TAU); g.fill(); glow(g, bx, by - 20, 24, '#FF6B6B', 0.6); }
  }
}

function clock(g, pow, o, t) {
  const spd = o.speed ?? 7, run = pow > 0.5, ang = (run ? t : (o.stopAt ?? 0.6)) * spd;
  if (run) g.translate(Math.sin(t * 57) * 1.4, 0);
  const lw = 4.5;
  cut(g, [rr(-40, -22, 11, 22, 3), rr(29, -22, 11, 22, 3)], pc(PAL.clawdDk, pow), { lw });
  const bell = (bx, by, r) => { const p = new Path2D(); p.ellipse(bx, by, 18, 15, r, Math.PI, TAU); p.closePath(); return p; };
  const shake = run ? Math.sin(t * 40) * 0.12 : 0;
  cut(g, [bell(-38, -120, -0.5 + shake), bell(38, -120, 0.5 - shake), rr(-3, -142, 6, 14, 2)], pc(PAL.gold, pow), { lw: 3.6 });
  cut(g, [circ(0, -76, 60)], pc(PAL.clawd, pow), { lw });
  const face = circ(0, -76, 47);
  g.fillStyle = pc('#FFF4E2', pow); g.fill(face); g.strokeStyle = OL; g.lineWidth = 3; g.stroke(face);
  g.strokeStyle = pc(PAL.ink, pow); g.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r0 = i % 3 ? 39 : 35; g.lineWidth = i % 3 ? 2 : 3.6; g.beginPath(); g.moveTo(Math.cos(a) * r0, -76 + Math.sin(a) * r0); g.lineTo(Math.cos(a) * 43, -76 + Math.sin(a) * 43); g.stroke(); }
  g.fillStyle = pc(PAL.clawdDk, pow); g.font = `800 13px ${FONTS.display}`; g.textAlign = 'center'; g.fillText('24/7', 0, -50);
  const m = ang - Math.PI / 2, h = ang / 12 - Math.PI / 2;
  if (run) {
    g.fillStyle = rgba(PAL.clawd, 0.28); g.beginPath(); g.moveTo(0, -76); g.arc(0, -76, 38, m - 1.0, m); g.closePath(); g.fill();
    g.strokeStyle = rgba(PAL.ink, 0.5); g.lineWidth = 2;
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + sx * (0.7 + i * 0.25); g.beginPath(); g.moveTo(sx * 60 + Math.cos(a) * 8, -128 + Math.sin(a) * 8); g.lineTo(sx * 60 + Math.cos(a) * 16, -128 + Math.sin(a) * 16); g.stroke(); }
  }
  cut(g, [moved(rr(-3, -3, 42, 6, 3), 0, -76, m), moved(rr(-3, -3.5, 27, 7, 3.5), 0, -76, h), circ(0, -76, 5)], pc(PAL.ink, pow), { lw: 1.5, shadow: false });
}

// One SUMMARY.md sheet, centred on (x, y), 68 × 88 at s = 1, pinned at the top.
export function summarySheet(g, x, y, s = 1, rot = 0, pow = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  cut(g, [rr(-34, -44, 68, 88, 3)], pc('#FBF7EE', pow), { lw: 3, sd: 2 });
  g.fillStyle = pc('#243066', pow); g.font = `800 9.5px ${FONTS.mono}`; g.textAlign = 'center'; g.fillText('SUMMARY.md', 0, -28);
  g.fillStyle = pc('#9AA3BF', pow);
  for (let i = 0; i < 7; i++) { const w = 22 + 30 * hash(i + x * 0.01 + 3); g.fillRect(-27, -18 + i * 8.5, i === 0 ? 30 : w, 3); }
  g.fillStyle = pc(PAL.token, pow); g.fillRect(-27, -18, 4, 3);
  cut(g, [circ(0, -42, 5)], pc('#E4574B', pow), { lw: 1.6, sd: 1 });
  g.restore();
}
function sheets(g, pow, o, p) {
  const n = Math.round((o.n ?? 6) * p);
  for (let i = 0; i < n; i++) {
    const cx = ((i % 3) - 1) * 42 + (hash(i) - 0.5) * 10, cy = -46 - Math.floor(i / 3) * 52 + (hash(i + 3) - 0.5) * 8;
    summarySheet(g, cx, cy, 0.62, (hash(i + 5) - 0.5) * 0.36, pow);
  }
}

// ================= the PB flame =================
// Gold, flickering, papercut, bottom centre on (x, y); about 105 tall at s = 1. opts.glow false
// drops the light around it.
function flamePath(w, h, sway, x0 = 0, y0 = 0) {
  const p = new Path2D(), hw = w / 2;
  p.moveTo(x0, y0);
  p.bezierCurveTo(x0 - hw * 1.05, y0, x0 - hw * 1.12, y0 - h * 0.34, x0 - hw * 0.74, y0 - h * 0.56);
  p.bezierCurveTo(x0 - hw * 0.42, y0 - h * 0.74, x0 + sway * 0.6 - hw * 0.1, y0 - h * 0.84, x0 + sway, y0 - h);
  p.bezierCurveTo(x0 + sway * 0.5 + hw * 0.52, y0 - h * 0.8, x0 + hw * 0.96, y0 - h * 0.62, x0 + hw * 0.96, y0 - h * 0.4);
  p.bezierCurveTo(x0 + hw * 1.06, y0 - h * 0.12, x0 + hw * 0.7, y0, x0, y0);
  p.closePath();
  return p;
}
export function flame(g, x, y, s = 1, t = 0, opts = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const f1 = Math.sin(t * 9.1), f2 = Math.sin(t * 13.7 + 1.3), f3 = Math.sin(t * 6.3 + 2.1), f4 = Math.sin(t * 17.9 + 0.4);
  const H = 104 * (1 + 0.06 * f1 + 0.04 * f2), Wd = 66 * (1 + 0.04 * f3), sway = 7 * f3 + 4 * f4;
  if (opts.glow !== false) { glow(g, 0, -H * 0.42, 170, PAL.gold, 0.6); glow(g, 0, -H * 0.3, 70, PAL.goldHi, 0.4); }
  for (let i = 0; i < 8; i++) {   // embers
    const ph = (t * (0.5 + 0.35 * hash(i)) + hash(i + 3)) % 1;
    const ex = (hash(i + 7) - 0.5) * Wd * 0.9 + Math.sin(t * 3 + i) * 8 * ph, ey = -H * 0.5 - ph * H * 0.95;
    g.fillStyle = rgba(ph < 0.5 ? PAL.goldHi : PAL.gold, (1 - ph) * 0.95);
    g.beginPath(); g.arc(ex, ey, (1 - ph) * (2 + 2.6 * hash(i + 9)), 0, TAU); g.fill();
  }
  for (let j = 0; j < 2; j++) {   // licks that break off the tip
    const ph = (t / 0.62 + j * 0.5) % 1, lx = sway * 0.8 + (j ? 6 : -5) + Math.sin(t * 5 + j) * 4, ly = -H * 0.92 - ph * 34;
    const sz = (1 - ph) * 11;
    if (sz > 1) cut(g, [flamePath(sz, sz * 1.7, 0, lx, ly)], PAL.gold, { lw: 2, shadow: false, ol: '#3A160A' });
  }
  const outer = [flamePath(Wd, H, sway), flamePath(Wd * 0.46, H * 0.6 * (1 + 0.1 * f4), sway * 1.4 - 6, -Wd * 0.26, 0), flamePath(Wd * 0.4, H * 0.5 * (1 + 0.1 * f2), sway * 1.2 + 5, Wd * 0.25, 0)];
  const gr = g.createLinearGradient(0, 0, 0, -H);
  gr.addColorStop(0, '#FF7A1A'); gr.addColorStop(0.45, '#FFA92A'); gr.addColorStop(1, '#FFC23D');
  cut(g, outer, gr, { lw: 4, sd: 2, ol: '#3A160A' });
  g.fillStyle = PAL.gold; g.fill(flamePath(Wd * 0.68, H * 0.74, sway * 0.8));
  g.fillStyle = '#FFE58A'; g.fill(flamePath(Wd * 0.46, H * 0.52, sway * 0.6));
  g.fillStyle = '#FFF8E0'; g.fill(flamePath(Wd * 0.26, H * 0.3, sway * 0.4));
  g.restore();
}

// ================= bots =================
// bot(g, id, x, y, s, pose), feet at (x, y). id: 'molty' (OpenClaw's official lobster: the official
// art, animated only by transforms), 'jolly' (Muse's mascot), 'hermes' (a winged-staff ☤ bot),
// 'courier' (a delivery robot). pose: { wave 0..1, hop 0..1, lit 0..1, t, flip, rot, squash,
// happy (courier eyes), arm 0..1 + holding: 'parcel' (courier), headphones (jolly, default on) }.
export function bot(g, id, x, y, s = 1, pose = {}) {
  const t = pose.t ?? 0, hop = pose.hop ?? 0, lit = clamp01(pose.lit ?? 0), sq = pose.squash ?? 0;
  g.save(); g.translate(x, y); g.scale(s * (pose.flip ? -1 : 1), s);
  if (lit > 0) glow(g, 0, -70, 175, PAL.gold, 0.6 * lit);
  if (pose.shadow !== false) groundShadow(g, 0, 0, 48 * (1 - 0.35 * clamp01(hop)), 0.3);
  g.translate(0, -44 * hop);
  if (sq) g.scale(1 + 0.3 * sq, 1 - 0.3 * sq);
  if (id === 'molty') molty(g, pose, t);
  else if (id === 'jolly') jolly(g, pose, t);
  else if (id === 'hermes') hermes(g, pose, t);
  else courier(g, pose, t);
  g.restore();
}

// Molty: OpenClaw's lobster, exactly as published (openclaw.svg, kept locally in .private and not
// in this repo). The art is drawn as an image and only moved (rock, bob, squash). If the file is
// missing (a fresh clone), a plain generic stand-in is drawn instead; it deliberately doesn't copy
// the official artwork into this public file.
function moltyVector(g, x0, y0, D) {
  g.save(); g.translate(x0 + D / 2, y0 + D / 2); g.scale(D / 120, D / 120);
  g.lineWidth = 6; g.strokeStyle = OL; g.fillStyle = '#d93a3a';
  for (const [x, y, rx, ry] of [[0, 2, 40, 46], [-48, -8, 14, 12], [48, -8, 14, 12]]) {
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.stroke();
  }
  g.strokeStyle = '#d93a3a'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-14, -40); g.quadraticCurveTo(-24, -54, -32, -50); g.moveTo(14, -40); g.quadraticCurveTo(24, -54, 32, -50); g.stroke();
  g.fillStyle = '#0b0e18'; g.beginPath(); g.arc(-14, -16, 6, 0, TAU); g.arc(14, -16, 6, 0, TAU); g.fill();
  g.restore();
}
function molty(g, pose, t) {
  const D = 124, im = imgOf('molty'), wave = clamp01(pose.wave ?? 0);
  const rock = wave * 0.15 * Math.sin(t * 8.4) + (pose.rot ?? 0), bob = wave * 4 * Math.abs(Math.sin(t * 8.4));
  g.save(); g.translate(0, -bob); g.rotate(rock);
  const x0 = -D / 2, y0 = -D * 110 / 120;
  if (im) {
    const k = D / 704;
    g.drawImage(moltySticker(im), x0 - 32 * k, y0 - 32 * k, 768 * k, 768 * k);
  } else moltyVector(g, x0, y0, D);
  g.restore();
  if (wave > 0.05) {   // motion ticks by both claws
    g.save(); g.strokeStyle = rgba(PAL.goldHi, 0.85 * wave); g.lineWidth = 3.2; g.lineCap = 'round';
    for (const sd of [-1, 1]) {
      const ph = Math.sin(t * 8.4 + (sd > 0 ? 0 : Math.PI)) * 0.3;
      for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(sd * 60, -62, 16 + i * 8, sd > 0 ? -1.1 + ph : Math.PI + 1.1 - ph - 0.7, sd > 0 ? -0.4 + ph : Math.PI + 0.4 - ph + 0.0); g.stroke(); }
    }
    g.restore();
  }
}

// Jolly, Muse's mascot: a fuzzy beige bean, head and body one piece, an oval peach face panel,
// black dot eyes, a small curved smile, pink blush, stubby arms (and his headphones).
let JOLLY = null;
function jollyShape() {
  if (JOLLY) return JOLLY;
  const pts = [], N = 72;
  for (let i = 0; i < N; i++) {
    const th = (i / N) * TAU, c = Math.cos(th), sn = Math.sin(th);
    const lower = sn > 0;
    const yy = lower ? Math.pow(sn, 0.55) : -Math.pow(-sn, 1.0);
    const wx = 50 * (1 + 0.05 * sn) * Math.sign(c) * Math.pow(Math.abs(c), lower ? 0.8 : 0.95);
    pts.push([wx, -66 + 66 * yy * (lower ? 1 : 1.05)]);
  }
  const body = poly(pts), tufts = [];
  for (let i = 0; i < N; i += 2) {
    const [px, py] = pts[i], nx = px, ny = py + 66, L = Math.hypot(nx, ny) || 1;
    if (py > -4) continue;
    tufts.push(circ(px + nx / L * 1.6, py + ny / L * 1.6, 4.2 + hash(i) * 1.8));
  }
  JOLLY = { body, parts: [body, ...tufts] };
  return JOLLY;
}
function furArm(x0, y0, a, L, th) {
  const parts = [cap(x0, y0, a, L, th)];
  for (let i = 1; i <= 3; i++) { const u = i / 3.4; parts.push(circ(x0 + Math.cos(a) * L * u + Math.cos(a + 1.57) * th * 0.45, y0 + Math.sin(a) * L * u + Math.sin(a + 1.57) * th * 0.45, 3.6)); }
  parts.push(circ(x0 + Math.cos(a) * L, y0 + Math.sin(a) * L + 2, th * 0.55));
  return parts;
}
function jolly(g, pose, t) {
  const wave = clamp01(pose.wave ?? 0), lw = 4.2, FUR = '#EBD5BA', FUR_DK = '#D4B593';
  const { body, parts } = jollyShape();
  cut(g, [ell(-18, -3, 13, 7), ell(18, -3, 13, 7)], FUR_DK, { lw });
  const gr = g.createLinearGradient(-50, -136, 40, 0);
  gr.addColorStop(0, '#F4E4CE'); gr.addColorStop(0.55, FUR); gr.addColorStop(1, '#DDBF9C');
  cut(g, parts, gr, { lw });
  g.save(); g.clip(body); g.lineCap = 'round';
  for (let i = 0; i < 46; i++) {   // fur
    const px = (hash(i + 0.2) - 0.5) * 92, py = -128 + hash(i + 0.9) * 124;
    if (Math.abs(px) < 36 && py > -118 && py < -54) continue;
    const a = 1.2 + (hash(i + 3) - 0.5) * 1.2;
    g.strokeStyle = i % 3 ? 'rgba(170,130,90,0.4)' : 'rgba(255,248,236,0.55)'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + Math.cos(a) * 3 + 1.5, py + Math.sin(a) * 3, px + Math.cos(a) * 6, py + Math.sin(a) * 6); g.stroke();
  }
  g.fillStyle = 'rgba(120,80,40,0.12)'; g.beginPath(); g.ellipse(26, -40, 30, 50, 0, 0, TAU); g.fill();
  g.restore();
  // the face panel
  const face = rr(-34, -116, 68, 58, 27);
  const fg = g.createLinearGradient(0, -116, 0, -58); fg.addColorStop(0, '#FBE4CF'); fg.addColorStop(1, '#F6D2B8');
  cut(g, [face], fg, { lw: 2.4, ol: '#9A7358', shadow: false });
  const bl = pose.blink ?? (hash(Math.floor(t / 3.7) + 0.4) < 0.9 && (t % 3.7) < 0.12 ? 1 : 0);
  g.fillStyle = '#1B1311';
  if (bl) { g.strokeStyle = '#1B1311'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-17, -88); g.lineTo(-10, -88); g.moveTo(10, -88); g.lineTo(17, -88); g.stroke(); }
  else { g.beginPath(); g.ellipse(-13.5, -89, 4.3, 5.4, 0, 0, TAU); g.ellipse(13.5, -89, 4.3, 5.4, 0, 0, TAU); g.fill(); glint(g, -15, -91, 1.5); glint(g, 12, -91, 1.5); }
  g.strokeStyle = '#3A2418'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.arc(0, -85.5, 5.2, 0.22 * Math.PI, 0.78 * Math.PI); g.stroke();
  g.fillStyle = 'rgba(245,135,140,0.55)'; g.beginPath(); g.ellipse(-22.5, -80, 7.5, 4.6, 0, 0, TAU); g.ellipse(22.5, -80, 7.5, 4.6, 0, 0, TAU); g.fill();
  // arms: the right one waves
  const aL = Math.PI / 2 + 0.42 + 0.06 * Math.sin(t * 2.3);
  const aR = lerp(Math.PI / 2 - 0.42, -Math.PI / 2 + 0.55, smooth(wave)) + wave * 0.38 * Math.sin(t * 9);
  cut(g, furArm(-42, -56, aL, 22, 17), FUR, { lw, sd: 1.5 });
  cut(g, furArm(42, -56, aR, 22, 17), FUR, { lw, sd: 1.5 });
  if (pose.headphones !== false) {
    g.save(); g.lineCap = 'round';
    g.strokeStyle = OL; g.lineWidth = 12; g.beginPath(); g.arc(0, -90, 53, Math.PI * 1.06, Math.PI * 1.94); g.stroke();
    g.strokeStyle = '#34343F'; g.lineWidth = 6.5; g.beginPath(); g.arc(0, -90, 53, Math.PI * 1.06, Math.PI * 1.94); g.stroke();
    g.restore();
    cut(g, [rr(-61, -108, 17, 34, 7), rr(44, -108, 17, 34, 7)], '#2B2B35', { lw: 3.6, sd: 1.5 });
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fill(rr(-58, -104, 4, 22, 2)); g.fill(rr(47, -104, 4, 22, 2));
  }
}

// Hermes ☤: a friendly caduceus bot. A gold staff with a round face on top, two small wings and two
// coiled snakes that face each other.
function hermes(g, pose, t) {
  const wave = clamp01(pose.wave ?? 0);
  const flap = Math.sin(t * (5 + 8 * wave)) * (0.1 + 0.3 * wave);
  const GOLD = '#F2C24E', GOLD_DK = '#C9922F', WING = '#FBF5E8';
  const snake = sgn => {
    const pts = [];
    for (let y = -16; y >= -114; y -= 3) { const a = -(y + 16) * 0.075 + (sgn > 0 ? 0 : Math.PI) + Math.sin(t * 1.6) * 0.15; pts.push([13 * Math.sin(a), y, Math.cos(a)]); }
    return pts;
  };
  const snakes = [[snake(1), '#46C2A8'], [snake(-1), '#8CD16C']];
  const runs = (pts, front) => {
    const out = []; let cur = null;
    for (let i = 0; i < pts.length; i++) {
      const f = pts[i][2] > 0;
      if (f === front) { if (!cur) { cur = []; if (i) cur.push(pts[i - 1]); out.push(cur); } cur.push(pts[i]); }
      else if (cur) { cur.push(pts[i]); cur = null; }
    }
    return out;
  };
  const drawRuns = (front) => {
    for (const [pts, col] of snakes) for (const r of runs(pts, front)) {
      g.beginPath(); r.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.strokeStyle = OL; g.lineWidth = 12.5; g.stroke();
      g.strokeStyle = front ? col : mix(col, '#1E2A40', 0.35); g.lineWidth = 7.5; g.stroke();
    }
  };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.rotate(wave * 0.06 * Math.sin(t * 4.2));
  cut(g, [ell(0, -6, 25, 8)], GOLD_DK, { lw: 3.5 });
  drawRuns(false);
  cut(g, [rr(-4.5, -130, 9, 126, 4)], GOLD, { lw: 3.6, sd: 2 });
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fill(rr(-2.5, -126, 2, 110, 1));
  g.lineCap = 'round'; drawRuns(true);
  for (const [pts, col] of snakes) {   // heads facing each other
    const [hx, hy] = pts[pts.length - 1], sd = hx > 0 ? 1 : -1;
    cut(g, [ell(hx + sd * 3, hy - 5, 8, 6, sd * -0.3)], col, { lw: 2.8, sd: 1 });
    g.fillStyle = INK; g.beginPath(); g.arc(hx - sd * 0.5, hy - 7, 1.6, 0, TAU); g.fill();
    g.strokeStyle = '#E4574B'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx - sd * 5, hy - 4); g.lineTo(hx - sd * 9, hy - 3 + Math.sin(t * 9) * 1.2); g.stroke();
  }
  for (const sd of [-1, 1]) {   // wings: swept up, three feather scallops underneath
    g.save(); g.translate(sd * 12, -152); g.scale(sd, 1); g.rotate(-0.12 - flap);
    const wp = new Path2D();
    wp.moveTo(0, 5);
    wp.bezierCurveTo(6, -8, 20, -26, 42, -36);
    wp.quadraticCurveTo(40, -23, 32, -18);
    wp.quadraticCurveTo(34, -9, 24, -6);
    wp.quadraticCurveTo(24, 3, 13, 2);
    wp.quadraticCurveTo(9, 9, 0, 5);
    wp.closePath();
    cut(g, [wp], WING, { lw: 3, sd: 1 });
    g.strokeStyle = 'rgba(150,125,95,0.65)'; g.lineWidth = 1.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(8, -3); g.quadraticCurveTo(19, -12, 31, -21); g.moveTo(6, 1); g.quadraticCurveTo(14, -2, 22, -5); g.stroke();
    g.restore();
  }
  cut(g, [circ(0, -146, 17)], GOLD, { lw: 3.6, sd: 2 });
  g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.ellipse(-6, -153, 5, 3, -0.5, 0, TAU); g.fill();
  const bl = (t % 4.1) < 0.12;
  g.fillStyle = INK;
  if (bl) { g.fillRect(-9, -147, 6, 2.2); g.fillRect(3, -147, 6, 2.2); }
  else { g.beginPath(); g.ellipse(-6, -147, 2.8, 3.8, 0, 0, TAU); g.ellipse(6, -147, 2.8, 3.8, 0, 0, TAU); g.fill(); glint(g, -7, -148.5, 1); glint(g, 5, -148.5, 1); }
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(0, -142.5, 4, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  g.fillStyle = 'rgba(255,130,120,0.45)'; g.beginPath(); g.ellipse(-11, -141, 3.5, 2.2, 0, 0, TAU); g.ellipse(11, -141, 3.5, 2.2, 0, 0, TAU); g.fill();
  g.restore();
}

// A delivery robot: a white box on wheels, screen face, a flag, a telescoping arm for parcels.
function courier(g, pose, t) {
  const lw = 4, arm = clamp01(pose.arm ?? (pose.holding === 'parcel' ? 1 : 0)), hold = pose.holding === 'parcel';
  cut(g, [circ(-32, -11, 11), circ(0, -11, 11), circ(32, -11, 11)], '#262A3E', { lw });
  g.fillStyle = '#8A90A8'; for (const wx of [-32, 0, 32]) { g.beginPath(); g.arc(wx, -11, 3.6, 0, TAU); g.fill(); }
  const flagA = Math.sin(t * 6) * 0.25;
  g.save(); g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(36, -80); g.lineTo(36, -120); g.stroke(); g.restore();
  cut(g, [moved(poly([[0, 0], [26, 7 + 3 * flagA], [0, 14]]), 36, -121, flagA * 0.3)], '#FF7A59', { lw: 2.6, sd: 1 });
  const body = rr(-50, -82, 100, 64, 16);
  cut(g, [body], '#EEF1F6', { lw });
  g.save(); g.clip(body); g.fillStyle = '#39B6C6'; g.fillRect(-52, -46, 104, 10); g.fillStyle = 'rgba(40,50,80,0.12)'; g.fillRect(-52, -32, 104, 16); g.restore();
  g.strokeStyle = 'rgba(14,19,40,0.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-46, -68); g.lineTo(46, -68); g.stroke();
  cut(g, [rr(-27, -76, 54, 26, 9)], '#1B2036', { lw: 3, shadow: false });
  const happy = pose.happy || (pose.lit ?? 0) > 0.5;
  g.save(); g.shadowColor = '#7DF3E8'; g.shadowBlur = 8; g.fillStyle = '#7DF3E8'; g.strokeStyle = '#7DF3E8'; g.lineWidth = 3; g.lineCap = 'round';
  if (happy) { for (const ex of [-10, 10]) { g.beginPath(); g.moveTo(ex - 5, -60); g.lineTo(ex, -66); g.lineTo(ex + 5, -60); g.stroke(); } }
  else if ((t % 3.1) < 0.12) { g.fillRect(-14, -63, 8, 2.5); g.fillRect(6, -63, 8, 2.5); }
  else { g.fill(rr(-14, -70, 7, 11, 3)); g.fill(rr(7, -70, 7, 11, 3)); }
  g.restore();
  if (arm > 0) {   // shoulder on the lid, arm reaching up and forward
    const sx0 = -30, sy0 = -82, a1 = lerp(-Math.PI / 2, -0.55, arm), L1 = 22 + 16 * arm;
    const ex = sx0 + Math.cos(a1) * L1, ey = sy0 + Math.sin(a1) * L1, a2 = a1 + 0.9 * arm, L2 = 20;
    const hx = ex + Math.cos(a2) * L2, hy = ey + Math.sin(a2) * L2;
    cut(g, [cap(sx0, sy0, a1, L1, 8), cap(ex, ey, a2, L2, 7), circ(sx0, sy0, 7), circ(ex, ey, 6)], '#AEB6CC', { lw: 3, sd: 1.5 });
    if (hold) parcel(g, hx + 4, hy + 16, pose.parcelName);
    cut(g, [cap(hx, hy, a2 - 0.6, 9, 4.5), cap(hx, hy, a2 + 0.6, 9, 4.5)], '#8A90A8', { lw: 2.4, shadow: false });
  }
}
function parcel(g, x, y, name) {
  g.save(); g.translate(x, y);
  cut(g, [rr(-15, -13, 30, 26, 3)], '#C99A62', { lw: 2.8, sd: 1.5 });
  g.fillStyle = '#E9D6A8'; g.fillRect(-3, -13, 6, 26);
  g.fillStyle = '#FBF7EE'; g.fillRect(-12, -2, 13, 9);
  if (name) { g.fillStyle = PAL.ink; g.font = `700 5px ${FONTS.display}`; g.textAlign = 'center'; g.fillText(name, -5.5, 4.5); }
  g.restore();
}

// ================= directory plates =================
// A name plate on the lobby directory: an enamel plate with a brass rim, the exact official mark
// in its own tile (drawn as provided, never recoloured), and names. (x, y, w, h) is the plate's
// rectangle. id: 'openai' (the Blossom; Astra ★ · Sol ☀ · Luna ☾), 'grok', 'muse' (Jolly),
// 'openclaw' (Molty), 'hermes' (☤), 'instinct' (text only), 'clawd' (CLAWD, basement), or any id
// with opts.name. opts: { lit 0..1, name, sub, dim 0..1 }.
const PLATES = {
  openai: { name: 'Astra ★ · Sol ☀ · Luna ☾', mark: 'openai' },
  grok: { name: 'Grok', mark: 'grok' },
  muse: { name: 'Jolly', sub: 'Muse', mark: 'muse', tile: true },
  openclaw: { name: 'Molty', sub: 'OpenClaw', mark: 'molty', tile: true },
  hermes: { name: 'Hermes', mark: 'caduceus' },
  instinct: { name: 'Instinct' },
  clawd: { name: 'CLAWD', sub: 'basement', mark: 'clawd', pixel: true },
};
function glyphIcon(g, ch, cx, cy, sz, color) {
  g.save(); g.translate(cx, cy); g.fillStyle = color; g.strokeStyle = color; g.lineCap = 'round';
  const r = sz * 0.42;
  if (ch === '★') g.fill(starPath(0, 0, r, 5, 0.45));
  else if (ch === '☀') {
    g.beginPath(); g.arc(0, 0, r * 0.5, 0, TAU); g.fill(); g.lineWidth = sz * 0.08;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.stroke(); }
  } else if (ch === '☾') {
    const p = new Path2D(); p.arc(0, 0, r * 0.85, 0.5 * Math.PI, 1.5 * Math.PI); p.arc(r * 0.35, 0, r * 0.62, 1.5 * Math.PI, 0.5 * Math.PI, true); p.closePath(); g.fill(p);
  } else if (ch === '☤') caduceus(g, 0, r * 1.05, sz * 0.9, color);
  g.restore();
}
// A small ☤ drawn in lines, for plates and labels. (x, y) is its foot.
export function caduceus(g, x, y, h, color = PAL.gold) {
  g.save(); g.translate(x, y); const k = h / 40; g.scale(k, k);
  g.strokeStyle = color; g.fillStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -34); g.stroke();
  g.beginPath(); g.arc(0, -36, 3.2, 0, TAU); g.fill();
  g.lineWidth = 2.4;
  for (const sd of [-1, 1]) {
    g.beginPath(); g.moveTo(sd * 2, -34); g.quadraticCurveTo(sd * 10, -42, sd * 16, -36); g.quadraticCurveTo(sd * 10, -36, sd * 3, -31); g.stroke();
    g.beginPath();
    for (let i = 0; i <= 20; i++) { const u = i / 20, yy = -4 - u * 26, xx = sd * 6 * Math.sin(u * 3 * Math.PI); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
    g.stroke();
  }
  g.restore();
}
function plateText(g, text, x, y, size, color, weight, family, halo = null) {
  g.font = `${weight} ${size}px ${family}`; g.fillStyle = color; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  let cx = x;
  for (const seg of text.split(/([★☀☾☤])/)) {
    if (!seg) continue;
    if (/[★☀☾☤]/.test(seg)) { glyphIcon(g, seg, cx + size * 0.45, y - size * 0.34, size, PAL.gold); cx += size * 0.95; continue; }
    if (halo) { g.save(); g.strokeStyle = halo; g.lineWidth = size * 0.3; g.lineJoin = 'round'; g.strokeText(seg, cx, y); g.restore(); }
    g.fillText(seg, cx, y); cx += g.measureText(seg).width;
  }
  return cx - x;
}
function plateTextWidth(g, text, size, weight, family) {
  g.save(); g.font = `${weight} ${size}px ${family}`; let w = 0;
  for (const seg of text.split(/([★☀☾☤])/)) { if (!seg) continue; w += /[★☀☾☤]/.test(seg) ? size * 0.95 : g.measureText(seg).width; }
  g.restore(); return w;
}
export function plate(g, S, id, x, y, w, h, opts = {}) {
  useImages(S);
  const def = PLATES[id] || {}, lit = clamp01(opts.lit ?? 0);
  const name = opts.name ?? def.name ?? id, sub = opts.sub ?? def.sub;
  g.save();
  if (lit > 0) glow(g, x + w / 2, y + h / 2, w * 0.75, PAL.gold, 0.4 * lit);
  const r = h * 0.14, body = rr(x, y, w, h, r);
  cut(g, [body], mix('#1B2248', '#7A5214', lit * 0.8), { lw: Math.max(1.5, h * 0.045), sd: h * 0.035 });
  g.strokeStyle = mix('#B8924F', PAL.goldHi, lit); g.lineWidth = Math.max(1, h * 0.04);
  g.stroke(rr(x + h * 0.07, y + h * 0.07, w - h * 0.14, h - h * 0.14, r * 0.6));
  let tx = x + h * 0.22;
  const mk = def.mark, m = h * 0.7, mx = x + h * 0.16, my = y + (h - m) / 2;
  if (mk) {
    const im = mk === 'openai' || mk === 'grok' || mk === 'muse' || mk === 'molty' ? imgOf(mk) : null;
    if (def.tile || mk === 'caduceus' || mk === 'clawd' || (!im && mk !== 'clawd')) {
      g.fillStyle = mk === 'caduceus' || mk === 'clawd' ? '#0F1430' : '#F6F1E6'; g.fill(rr(mx, my, m, m, m * 0.2));
    }
    if (im && mk === 'grok') {
      g.save(); g.clip(rr(mx, my, m, m, m * 0.22)); g.drawImage(im, mx, my, m, m); g.restore();
    } else if (im) {
      const inset = def.tile ? m * 0.1 : 0;
      g.drawImage(bitmap(im, 256), mx + inset, my + inset, m - 2 * inset, m - 2 * inset);
    } else if (mk === 'caduceus') caduceus(g, mx + m / 2, my + m * 0.92, m * 0.84, PAL.gold);
    else if (mk === 'clawd') clawd(g, mx + m / 2, my + m * 0.84, m / 150, { shadow: false, lw: 7, mini: true, lit: lit * 0.6 });
    else { g.fillStyle = '#6B7290'; g.font = `800 ${m * 0.5}px ${FONTS.display}`; g.textAlign = 'center'; g.fillText(name[0], mx + m / 2, my + m * 0.68); }
    tx = mx + m + h * 0.16;
  }
  const avail = x + w - h * 0.18 - tx;
  const fam = def.pixel ? FONTS.pixel : FONTS.display, wt = def.pixel ? 700 : 700;
  let ns = h * (sub ? 0.36 : 0.42);
  const nw = plateTextWidth(g, name, ns, wt, fam);
  if (nw > avail) ns *= avail / nw;
  const col = mix('#F4ECD8', PAL.goldHi, lit);
  plateText(g, name, tx, y + (sub ? h * 0.5 : h * 0.5 + ns * 0.36), ns, col, wt, fam, lit > 0.05 ? rgba(PAL.gold, 0.45 * lit) : null);
  if (sub) {
    const ss = Math.min(h * 0.24, ns * 0.75);
    g.font = `600 ${ss}px ${FONTS.display}`; g.fillStyle = mix('#9AA3BF', '#F2D9A0', lit); g.textAlign = 'left';
    g.fillText(sub, tx, y + h * 0.8);
  }
  if (opts.dim) { g.fillStyle = `rgba(7,10,30,${0.6 * clamp01(opts.dim)})`; g.fill(body); }
  g.restore();
}
