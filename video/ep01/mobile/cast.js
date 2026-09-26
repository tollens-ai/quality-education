// Clawd, the scrap of prompt, the little apps and the cut-paper lyrics, all in the paper kit.
import { PAL, TAU, cut, paint, pin, shape, at, hash, clamp01, easeOut, settle, lerp, between } from './paper.js';

export const FONT = 'Bricolage';
export const HAND = 'Caveat';

// ================= Clawd =================
// Cut from one orange sheet: body 120 × 72 with four legs, feet at y = 0; arm nubs are separate
// pieces pinned at the body's sides. The eyes are holes cut through the sheet, so the wall shows.
const EYES = {
  slit: side => shape.rect(10, 25, side * 30 - 5, -84),
  wide: side => shape.rect(12, 30, side * 30 - 6, -87),
  happy: side => [[side * 30 - 9, -64], [side * 30, -78], [side * 30 + 9, -64], [side * 30 + 5, -61], [side * 30, -70], [side * 30 - 5, -61]],
  shut: side => shape.rect(16, 5, side * 30 - 8, -70),
  worried: side => side < 0 ? [[-35, -82], [-25, -78], [-25, -59], [-35, -59]] : [[25, -78], [35, -82], [35, -59], [25, -59]],
  sad: side => side < 0 ? [[-35, -76], [-25, -82], [-25, -60], [-35, -60]] : [[25, -82], [35, -76], [35, -60], [25, -60]],
};
function clawdBody(eyes, look) {
  const dx = Math.round(look * 3) * 3;
  const out = [[-60, -94], [60, -94], [60, -22], [46, -22], [46, 0], [34, 0], [34, -22], [25, -22], [25, 0], [13, 0], [13, -22],
    [-13, -22], [-13, 0], [-25, 0], [-25, -22], [-34, -22], [-34, 0], [-46, 0], [-46, -22], [-60, -22]];
  const e = EYES[eyes] || EYES.slit;
  return [out, shape.move(e(-1), dx, 0), shape.move(e(1), dx, 0)];
}
const ARM = () => shape.rect(34, 14, -3, -7);

// pose: { eyes, look -1..1, armL, armR (radians; 0 = straight out, + raises), hop 0..1,
// squash, rot, flip, lift, color, seed }
export function clawd(g, x, y, s = 1, pose = {}) {
  const eyes = pose.eyes || 'slit', look = pose.look || 0;
  const sq = pose.squash || 0, hop = pose.hop || 0, col = pose.color || PAL.clawd;
  const seed = pose.seed ?? 3;
  g.save();
  g.translate(x, y); g.scale(s * (pose.flip ? -1 : 1), s);
  g.translate(0, -60 * hop);
  if (pose.rot) g.rotate(pose.rot);
  g.scale(1 + 0.25 * sq, 1 - 0.25 * sq);
  const lift = pose.lift ?? 1;
  for (const side of [-1, 1]) {
    const a = side < 0 ? (pose.armL ?? -0.2) : (pose.armR ?? -0.2);
    g.save(); g.translate(side * 56, -58); g.scale(side, 1); g.rotate(-a);
    paint(g, cut(`clawd-arm${side}-${seed}`, ARM, { amp: 1.2 }), col, { lift, seed: seed + side, tex: 0.9 });
    g.restore();
  }
  paint(g, cut(`clawd-${eyes}-${Math.round(look * 3)}-${seed}`, () => clawdBody(eyes, look), { amp: 1.6, seed: 40 + seed }), col, { lift, seed, tex: 0.9 });
  g.restore();
}

// Where Clawd's nub tips are, for holding things (local to its x, y at scale s, flip ignored).
export function clawdTip(side, a, s = 1) {
  const L = 31;
  return [side * (56 + Math.cos(a) * L) * s, (-58 - Math.sin(a) * L) * s];
}

// Clawd dancing on the beat: little hops and arm swings, from the song's beat position.
export function danceBeat(S, t, amt = 1, phase = 0) {
  const b = S.beatPos(t) + phase, f = b - Math.floor(b);
  const hop = amt * Math.max(0, Math.sin(Math.PI * Math.min(1, f * 1.6))) * 0.35;
  const sw = Math.sin((b / 2) * Math.PI) * 0.5 * amt;
  return { hop, squash: amt * (f < 0.12 ? 0.18 * (1 - f / 0.12) : 0), armL: 0.3 + sw, armR: 0.3 - sw };
}

// ================= the scrap: your prompt =================
// A torn corner of paper with your handwriting. p reveals the handwriting (0..1).
export function scrap(g, x, y, s, text, { rot = 0, p = 1, pinned = true, lift = 1, w = 400, h = 150, size = 76, seed = 5 } = {}) {
  at(g, x, y, rot, s, () => {
    const torn = cut(`scrap-${w}-${h}-${seed}`, () => {
      const pts = [];
      for (let i = 0; i <= 16; i++) pts.push([-w / 2 + w * i / 16, -h / 2 + (hash(seed + i) - 0.5) * 7]);
      for (let i = 0; i <= 8; i++) pts.push([w / 2 + (hash(seed + 30 + i) - 0.5) * 12, -h / 2 + h * i / 8]);
      for (let i = 16; i >= 0; i--) pts.push([-w / 2 + w * i / 16, h / 2 + (hash(seed + 60 + i) - 0.5) * 14]);
      return pts;
    }, { amp: 1.4, seed });
    paint(g, torn, PAL.scrap, { lift, tex: 0.35, seed });
    // ruled lines, as torn from a notebook
    g.save(); g.clip(torn);
    g.strokeStyle = 'rgba(80,120,190,0.22)'; g.lineWidth = 2;
    for (let yy = -h / 2 + 34; yy < h / 2; yy += 38) { g.beginPath(); g.moveTo(-w / 2, yy); g.lineTo(w / 2, yy); g.stroke(); }
    g.restore();
    if (text) handwrite(g, text, -w / 2 + 34, 14, size, p, PAL.ink);
    if (pinned) pin(g, 0, -h / 2 + 18, PAL.red);
  });
}

// Handwriting that writes itself left to right (p 0..1), with a pen-blot at the moving tip.
export function handwrite(g, text, x, y, size, p = 1, color = PAL.ink, align = 'left') {
  g.save();
  g.font = `700 ${size}px ${HAND}`;
  g.textBaseline = 'alphabetic'; g.textAlign = align;
  const w = g.measureText(text).width;
  const x0 = align === 'center' ? x - w / 2 : x;
  if (p < 1) { g.beginPath(); g.rect(x0 - 10, y - size * 1.2, (w + 20) * clamp01(p), size * 1.8); g.clip(); }
  g.fillStyle = color;
  g.fillText(text, x, y);
  g.restore();
  return w;
}

// ================= a little app =================
// A phone-shaped white card with one icon: 'floss' (a checkbox and tooth), 'gym' (a dumbbell),
// 'blog' (a heading and paragraph lines). No words: nothing on screen before it's sung.
export function appCard(g, x, y, s, kind, { rot = 0, lift = 1, tick = 0, seed = 11 } = {}) {
  at(g, x, y, rot, s, () => {
    const card = cut(`app-${seed}`, () => shape.smooth([[-120, -210], [120, -210], [130, -200], [130, 200], [120, 210], [-120, 210], [-130, 200], [-130, -200]], 3), { amp: 1.4, seed });
    paint(g, card, PAL.white, { lift, tex: 0.3, seed });
    const bar = cut(`app-bar-${seed}`, () => shape.rect(200, 20, -100, -180), { amp: 0.8, seed: seed + 1 });
    paint(g, bar, '#E4DED2', { lift: 0, tex: 0, edge: false });
    if (kind === 'floss') {
      paint(g, cut('tooth', () => shape.smooth([[-34, -40], [0, -48], [34, -40], [38, 0], [22, 44], [10, 10], [-10, 10], [-22, 44], [-38, 0]], 6)), PAL.white, { lift: 0.5, tex: 0.2, seed: 3 });
      g.lineWidth = 5; g.strokeStyle = PAL.black; g.stroke(cut('box', () => shape.rect(70, 70, -35, 80), { amp: 1 }));
      if (tick > 0) {
        g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 11; g.strokeStyle = PAL.red;
        g.beginPath(); const p = clamp01(tick);
        g.moveTo(-24, 118); g.lineTo(-24 + 18 * Math.min(1, p * 2), 118 + 18 * Math.min(1, p * 2));
        if (p > 0.5) g.lineTo(-6 + 44 * (p - 0.5) * 2, 136 - 60 * (p - 0.5) * 2);
        g.stroke(); g.restore();
      }
    } else if (kind === 'gym') {
      paint(g, cut('db-bar', () => shape.rect(150, 14, -75, -7)), PAL.black, { lift: 0.3, tex: 0.3 });
      for (const sx of [-1, 1]) {
        paint(g, cut(`db-w1${sx}`, () => shape.rect(26, 90, sx * 62 - 13, -45)), PAL.red, { lift: 0.4, seed: 7 });
        paint(g, cut(`db-w2${sx}`, () => shape.rect(20, 64, sx * 88 - 10, -32)), PAL.red, { lift: 0.4, seed: 8 });
      }
      for (let i = 0; i < 3; i++) paint(g, cut(`gl${i}`, () => shape.rect(180 - i * 40, 12, -90, 90 + i * 34), { amp: 0.6 }), '#D9D2C4', { lift: 0, tex: 0, edge: false });
    } else if (kind === 'blog') {
      paint(g, cut('blog-h', () => shape.rect(190, 26, -95, -120), { amp: 0.8 }), PAL.black, { lift: 0.2, tex: 0.3 });
      for (let i = 0; i < 7; i++) paint(g, cut(`bl${i}`, () => shape.rect(i % 3 === 2 ? 130 : 190, 11, -95, -60 + i * 30), { amp: 0.6 }), '#CFC7B8', { lift: 0, tex: 0, edge: false });
      paint(g, cut('blog-img', () => shape.rect(190, 70, -95, 150 - 20), { amp: 1 }), PAL.teal, { lift: 0.2, seed: 9 });
    }
  });
}

// ================= cut-paper lyrics =================
// Each word is placed on the wall at its sung onset like a cut-out being pressed down: it lands a
// touch large and settles. Letters are cut one by one, so each sits at its own slight angle.
// box: { x, y, w, size, align, color, accent: {word: color}, lead (line gap), backing }
const wordCache = new Map();
function measure(g, text, size) {
  const k = `${size}|${text}`;
  if (!wordCache.has(k)) { g.font = `800 ${size}px ${FONT}`; wordCache.set(k, g.measureText(text).width); }
  return wordCache.get(k);
}

export function layoutLine(g, line, box) {
  const size = box.size || 90, space = size * 0.28;
  const words = line.words.filter(w => box.backing !== false || !w.backing);
  const rows = [[]];
  let rw = 0;
  for (const w of words) {
    const sz = w.backing ? size * 0.55 : size, ww = measure(g, w.w, sz);
    if (rw + ww > box.w && rows[rows.length - 1].length) { rows.push([]); rw = 0; }
    rows[rows.length - 1].push({ ...w, ww, sz });
    rw += ww + space;
  }
  return { rows, space, size };
}

export function lyric(g, t, line, box, li = 0) {
  if (!line) return;
  const { rows, space, size } = layoutLine(g, line, box);
  const lead = box.lead || size * 1.02;
  const lastLead = Math.max(...line.words.filter(w => !w.backing && w.s !== null).map(w => w.e ?? w.s), line.start);
  const out = box.out ?? Infinity;
  const fade = 1 - between(t, out, out + 0.25);
  if (fade <= 0) return;
  g.save();
  g.textBaseline = 'alphabetic';
  rows.forEach((row, ri) => {
    const rowW = row.reduce((a, w) => a + w.ww, 0) + space * (row.length - 1);
    let x = box.align === 'center' ? box.x - rowW / 2 : box.align === 'right' ? box.x - rowW : box.x;
    const y = box.y + ri * lead;
    row.forEach((w, wi) => {
      const on = w.s ?? lastLead;
      const p = (t - on) / 0.16;
      if (p > 0) {
        const bare = w.w.replace(/[^A-Za-z0-9']/g, '').toLowerCase();
        const col = (box.accent && box.accent[bare]) || (w.backing ? (box.backingColor || PAL.blue) : (box.color || PAL.black));
        const sc = lerp(1.18, 1, settle(p)), lift = lerp(3, 0.7, easeOut(p));
        g.save();
        g.globalAlpha = fade * clamp01(p * 3);
        g.translate(x + w.ww / 2, y - w.sz * 0.35);
        g.scale(sc, sc);
        g.translate(-w.ww / 2, w.sz * 0.35);
        letters(g, w.w, 0, 0, w.sz, col, lift, li * 97 + ri * 13 + wi * 7);
        g.restore();
      }
      x += w.ww + space;
    });
  });
  g.restore();
}

// Letters as individual cut-outs: each gets its own tilt and a hair of baseline drift.
export function letters(g, text, x, y, size, color, lift = 0.7, seed = 0, K = null) {
  g.font = `800 ${size}px ${FONT}`;
  const k = g.getTransform().a;   // device scale, for the shadow
  g.shadowColor = 'rgba(55,38,20,0.26)';
  g.shadowBlur = (3 + 5 * lift) * k; g.shadowOffsetX = (1.5 + 3 * lift) * k; g.shadowOffsetY = (2 + 4.5 * lift) * k;
  g.fillStyle = color;
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], cw = g.measureText(ch).width;
    const r = (hash(seed + i * 3.1) - 0.5) * 0.09, dy = (hash(seed + i * 5.7) - 0.5) * size * 0.05;
    g.save(); g.translate(cx + cw / 2, y + dy - size * 0.35); g.rotate(r); g.fillText(ch, -cw / 2, size * 0.35); g.restore();
    cx += cw;
  }
  g.shadowColor = 'transparent';
}
