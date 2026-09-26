// Props: phones and laptops with their app screens, the user's emoji-yellow hand, the quota
// battery, containers and the helm, the clock, padlocks and the vault door, papers.
import { C, TAU, clamp, lerp, smooth, easeOut, easeOutBack, rnd, rr, circle, ellipse, line, poly, star, heart, glow, text, vgrad, rgrad, lgrad, rgba, mix, shade } from './kit.js';

export const HAND = '#ffcc4d', HAND_D = '#e0a12c';

// A phone standing at (x, y) centre, w wide; screen(g, sx, sy, sw, sh) draws the app.
export function phone(g, x, y, w, rot, screen, o = {}) {
  const h = w * 2.05, r = w * .14;
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  if (o.glow !== false) glow(g, 0, 0, w * 1.3, o.glowCol || '#fff1dc', .28 * (o.glowA ?? 1));
  g.fillStyle = lgrad(g, -w / 2, -h / 2, w / 2, h / 2, [[0, '#3b3a4a'], [.5, '#15141e'], [1, '#08070d']]);
  rr(g, -w / 2, -h / 2, w, h, r); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = w * .008; rr(g, -w / 2 + w * .006, -h / 2 + w * .006, w - w * .012, h - w * .012, r); g.stroke();
  const bz = w * .045;
  const sx = -w / 2 + bz, sy = -h / 2 + bz, sw = w - bz * 2, sh = h - bz * 2;
  g.save(); rr(g, sx, sy, sw, sh, r * .78); g.clip();
  g.fillStyle = o.bg || '#fbf7f0'; g.fillRect(sx, sy, sw, sh);
  screen?.(g, sx, sy, sw, sh);
  // Glass sheen.
  g.fillStyle = lgrad(g, sx, sy, sx + sw, sy + sh * .6, [[0, 'rgba(255,255,255,.14)'], [.45, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0)']]);
  g.fillRect(sx, sy, sw, sh);
  g.restore();
  // Dynamic island.
  g.fillStyle = '#050508'; rr(g, -w * .14, sy + w * .03, w * .28, w * .075, w * .04); g.fill();
  g.restore();
  return { h };
}

// A laptop seen from the front: screen (w wide) above a keyboard deck in slight perspective.
export function laptop(g, x, baseY, w, screen, o = {}) {
  const sh = w * .64, deck = w * .09;
  const sy = baseY - deck - sh;
  if (o.glow !== false) glow(g, x, sy + sh / 2, w * .9, o.glowCol || '#ffe7cf', .22 * (o.glowA ?? 1));
  // Screen lid.
  g.fillStyle = lgrad(g, x - w / 2, sy, x + w / 2, sy + sh, [[0, '#4a4958'], [1, '#1b1a24']]);
  rr(g, x - w / 2, sy, w, sh, w * .03); g.fill();
  const bz = w * .028;
  g.save(); rr(g, x - w / 2 + bz, sy + bz, w - bz * 2, sh - bz * 2, w * .012); g.clip();
  g.fillStyle = o.bg || '#12111a'; g.fillRect(x - w / 2 + bz, sy + bz, w - bz * 2, sh - bz * 2);
  screen?.(g, x - w / 2 + bz, sy + bz, w - bz * 2, sh - bz * 2);
  g.fillStyle = lgrad(g, x - w / 2, sy, x + w / 2, sy + sh, [[0, 'rgba(255,255,255,.08)'], [.4, 'rgba(255,255,255,0)']]);
  g.fillRect(x - w / 2, sy, w, sh);
  g.restore();
  // Deck.
  g.fillStyle = lgrad(g, x - w * .6, 0, x + w * .6, 0, [[0, '#8d8a9c'], [.5, '#d9d6e2'], [1, '#7c798c']]);
  poly(g, [[x - w / 2 - w * .02, baseY - deck], [x + w / 2 + w * .02, baseY - deck], [x + w / 2 + w * .1, baseY], [x - w / 2 - w * .1, baseY]]); g.fill();
  g.fillStyle = 'rgba(40,38,52,.35)'; g.fillRect(x - w * .1, baseY - deck * .45, w * .2, deck * .2);
  return { sy, sh, top: sy };
}

// The user's hand, emoji yellow. pose: 'point' | 'hold' | 'fist' | 'thumb' | 'open' | 'pinch'
export function hand(g, x, y, s, rot, pose = 'point', o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  const u = s / 10;
  const col = o.col || HAND, dk = o.dark || HAND_D;
  // Sleeve.
  if (o.sleeve !== false) {
    g.fillStyle = o.sleeveCol || '#5b6cff';
    rr(g, -u * 3.4, u * 3.2, u * 6.8, u * 14, u * 1.6); g.fill();
    g.fillStyle = shade(o.sleeveCol || '#5b6cff', -.2); rr(g, -u * 3.6, u * 3, u * 7.2, u * 1.6, u * .8); g.fill();
  }
  g.fillStyle = vgrad(g, -u * 8, u * 4, [[0, shade(col, .12)], [1, col]]);
  // Palm.
  rr(g, -u * 3.2, -u * 2.6, u * 6.4, u * 6.4, u * 2.4); g.fill();
  const finger = (fx, fy, len, ang, w2 = 1.35) => {
    g.save(); g.translate(fx, fy); g.rotate(ang);
    g.fillStyle = col; rr(g, -u * w2 / 2, -len, u * w2, len + u * .8, u * w2 / 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; rr(g, -u * w2 * .25, -len + u * .3, u * w2 * .35, u * .9, u * .2); g.fill();
    g.restore();
  };
  if (pose === 'point') {
    finger(-u * 1.5, -u * 2, u * 6.2, -.05);
    g.fillStyle = dk; for (let i = 0; i < 3; i++) { rr(g, -u * .2 + i * u * 1.1, -u * 3.1, u * 1.2, u * 2.2, u * .6); g.fill(); }
    finger(-u * 3.1, u * .2, u * 2.4, -1.1, 1.5);
  } else if (pose === 'hold') {
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? col : shade(col, -.05); rr(g, -u * 3 + i * u * 1.55, -u * 4.2, u * 1.45, u * 2.6, u * .7); g.fill(); }
    finger(-u * 3.4, -u * 1, u * 3, -.9, 1.6);
  } else if (pose === 'fist') {
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? col : shade(col, -.05); rr(g, -u * 3 + i * u * 1.55, -u * 3.4, u * 1.45, u * 2.2, u * .7); g.fill(); }
    g.fillStyle = dk; rr(g, -u * 3.4, -u * .8, u * 3.6, u * 1.6, u * .8); g.fill();
  } else if (pose === 'thumb') {
    for (let i = 0; i < 4; i++) { g.fillStyle = shade(col, -.04 * (i % 2)); rr(g, -u * 3, -u * 1.8 + i * u * 1.35, u * 3, u * 1.3, u * .65); g.fill(); }
    finger(u * 1.6, -u * 2.2, u * 3.6, .05, 1.8);
  } else if (pose === 'open') {
    for (let i = 0; i < 4; i++) finger(-u * 2.4 + i * u * 1.6, -u * 2.2, u * (4.2 + (i === 1 || i === 2 ? .8 : 0)), (i - 1.5) * .12);
    finger(-u * 3.2, u * .4, u * 3, -1.0, 1.6);
  }
  g.restore();
}

// The quota battery: level 0..1, label shown from `label` on.
export function battery(g, x, y, w, level, o = {}) {
  const h = w * .46;
  g.save(); g.translate(x, y);
  const dead = level <= .001;
  const col = level > .5 ? '#4ee37a' : level > .2 ? '#ffc94a' : '#ff4a5a';
  if (!dead) glow(g, 0, 0, w * .9, col, .25 * (o.glowA ?? 1));
  g.fillStyle = '#10101c'; rr(g, -w / 2, -h / 2, w, h, h * .22); g.fill();
  g.strokeStyle = dead ? '#3a3a4a' : '#f4f1ea'; g.lineWidth = w * .045; rr(g, -w / 2, -h / 2, w, h, h * .22); g.stroke();
  g.fillStyle = dead ? '#3a3a4a' : '#f4f1ea'; rr(g, w / 2 + w * .02, -h * .2, w * .07, h * .4, w * .02); g.fill();
  const pad = w * .06;
  const fw = (w - pad * 2) * clamp(level);
  if (fw > 0) {
    const blink = o.blink ? (Math.sin(o.blink * 20) > 0 ? 1 : .35) : 1;
    g.globalAlpha *= blink;
    g.fillStyle = vgrad(g, -h / 2, h / 2, [[0, shade(col, .3)], [1, shade(col, -.15)]]);
    rr(g, -w / 2 + pad, -h / 2 + pad, fw, h - pad * 2, h * .12); g.fill();
    g.globalAlpha = 1;
  }
  if (o.label) text(g, o.label, 0, h / 2 + w * .22, { size: w * .15, font: 'Mono', weight: 700, color: dead ? '#6a6a80' : '#f4f1ea', ls: 2 });
  g.restore();
}

// Shipping container, seen side-on.
export function container(g, x, y, w, h, col) {
  g.fillStyle = vgrad(g, y, y + h, [[0, shade(col, .15)], [1, shade(col, -.2)]]);
  g.fillRect(x, y, w, h);
  g.strokeStyle = shade(col, -.35); g.lineWidth = Math.max(1, w * .008);
  const n = Math.max(6, Math.round(w / 18));
  for (let i = 1; i < n; i++) { line(g, x + i * w / n, y + h * .08, x + i * w / n, y + h * .92); g.stroke(); }
  g.fillStyle = shade(col, -.4); g.fillRect(x, y, w, h * .07); g.fillRect(x, y + h * .93, w, h * .07);
  g.fillRect(x, y, w * .02, h); g.fillRect(x + w * .98, y, w * .02, h);
}

// The helm (a nod to Kubernetes' wheel): a blue heptagon with a seven-spoke wheel.
export function helm(g, x, y, r, rot) {
  g.save(); g.translate(x, y);
  glow(g, 0, 0, r * 2.2, '#5aa2ff', .45);
  g.fillStyle = vgrad(g, -r, r, [[0, '#4f8dff'], [1, '#2a5fd8']]);
  g.beginPath();
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + i / 7 * TAU; const px = Math.cos(a) * r, py = Math.sin(a) * r; i ? g.lineTo(px, py) : g.moveTo(px, py); }
  g.closePath(); g.fill();
  g.rotate(rot);
  g.strokeStyle = '#ffffff'; g.lineWidth = r * .1; g.lineCap = 'round';
  circle(g, 0, 0, r * .5); g.stroke();
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; line(g, Math.cos(a) * r * .15, Math.sin(a) * r * .15, Math.cos(a) * r * .72, Math.sin(a) * r * .72); g.stroke(); }
  g.fillStyle = '#fff'; circle(g, 0, 0, r * .14); g.fill();
  g.restore();
}

// A clock face: numerals omitted, ticks and hands; angleH/angleM in radians.
export function clockFace(g, x, y, r, angH, angM, o = {}) {
  glow(g, x, y, r * 1.6, '#ffe7b0', .35 * (o.glowA ?? 1));
  g.fillStyle = rgrad(g, x - r * .3, y - r * .3, 0, r * 1.2, [[0, '#fffaf0'], [.8, '#f7ead0'], [1, '#e2cfaa']]);
  circle(g, x, y, r); g.fill();
  g.strokeStyle = '#c9a15a'; g.lineWidth = r * .05; circle(g, x, y, r); g.stroke();
  g.strokeStyle = '#3a2a24';
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU, big = i % 5 === 0;
    g.lineWidth = big ? r * .022 : r * .008;
    line(g, x + Math.cos(a) * r * (big ? .8 : .86), y + Math.sin(a) * r * (big ? .8 : .86), x + Math.cos(a) * r * .92, y + Math.sin(a) * r * .92); g.stroke();
  }
  g.lineCap = 'round';
  g.strokeStyle = '#2a1c18'; g.lineWidth = r * .045;
  line(g, x, y, x + Math.cos(angH - Math.PI / 2) * r * .45, y + Math.sin(angH - Math.PI / 2) * r * .45); g.stroke();
  g.lineWidth = r * .028;
  line(g, x, y, x + Math.cos(angM - Math.PI / 2) * r * .7, y + Math.sin(angM - Math.PI / 2) * r * .7); g.stroke();
  g.fillStyle = C.clawd; circle(g, x, y, r * .05); g.fill();
}

export function padlock(g, x, y, s, rot = 0, open = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.strokeStyle = '#c9ccd8'; g.lineWidth = s * .16;
  g.beginPath(); g.arc(0, -s * .45 - open * s * .3, s * .32, Math.PI, 0); g.lineTo(s * .32, -s * .2 - open * s * .3); g.stroke();
  g.fillStyle = vgrad(g, -s * .3, s * .5, [[0, '#ffd66b'], [1, '#c88a1e']]);
  rr(g, -s * .5, -s * .3, s, s * .8, s * .14); g.fill();
  g.fillStyle = '#5a3a0a'; circle(g, 0, s * .02, s * .1); g.fill(); g.fillRect(-s * .04, s * .02, s * .08, s * .22);
  g.restore();
}

export function chain(g, x1, y1, x2, y2, s) {
  const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / (s * .8)));
  const a = Math.atan2(y2 - y1, x2 - x1);
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    g.save(); g.translate(lerp(x1, x2, p), lerp(y1, y2, p)); g.rotate(a + (i % 2 ? Math.PI / 2 : 0) * 0);
    g.strokeStyle = i % 2 ? '#aeb2c4' : '#d7dae6'; g.lineWidth = s * .18;
    if (i % 2) { ellipse(g, 0, 0, s * .5, s * .16); } else { ellipse(g, 0, 0, s * .5, s * .3); }
    g.stroke();
    g.restore();
  }
}

// A sheet of paper with a filename on it.
export function paper(g, x, y, s, rot, label, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, -s * .38 + 3, -s * .5 + 4, s * .76, s, s * .04); g.fill();
  g.fillStyle = o.col || '#fbf7ee'; rr(g, -s * .38, -s * .5, s * .76, s, s * .04); g.fill();
  g.fillStyle = 'rgba(60,50,80,.25)';
  for (let i = 0; i < 5; i++) g.fillRect(-s * .28, -s * .15 + i * s * .12, s * (.56 - (i === 4 ? .2 : 0)), s * .035);
  if (label) text(g, label, 0, -s * .3, { size: s * .1, font: 'Mono', weight: 700, color: '#3a2e52' });
  g.restore();
}

// A golden retriever guide dog lying down, harness on, tail going. Faces right. s = body length.
export function guideDog(g, x, y, s, t) {
  const u = s / 10;
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,.25)'; ellipse(g, 0, u * .4, u * 6, u * 1); g.fill();
  // Tail, wagging.
  const wag = Math.sin(t * 12) * .5;
  g.save(); g.translate(-u * 4.4, -u * 1.6); g.rotate(-2.4 + wag);
  g.fillStyle = '#d99a4a'; rr(g, 0, -u * .45, u * 3.2, u * .9, u * .45); g.fill();
  g.restore();
  // Back legs tucked, body, front paws out.
  g.fillStyle = vgrad(g, -u * 3.4, 0, [[0, '#f0c070'], [1, '#c98a3a']]);
  ellipse(g, -u * .6, -u * 1.5, u * 4.6, u * 1.9); g.fill();
  ellipse(g, -u * 3.6, -u * .7, u * 1.6, u * 1.1); g.fill();
  rr(g, u * 1.6, -u * .8, u * 3.6, u * 1, u * .5); g.fill();
  rr(g, u * 1.2, -u * .5, u * 3.8, u * .9, u * .45); g.fill();
  // Harness and handle.
  g.fillStyle = '#e0495d'; rr(g, -u * .6, -u * 3.3, u * 1.1, u * 3, u * .3); g.fill();
  g.strokeStyle = '#3a2a30'; g.lineWidth = u * .35; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-u * .1, -u * 3.2); g.lineTo(-u * 1.2, -u * 5.2); g.lineTo(u * .8, -u * 5.4); g.stroke();
  // Head up, snout forward, a floppy ear.
  g.fillStyle = vgrad(g, -u * 5.5, -u * 1.5, [[0, '#f4c878'], [1, '#d99a4a']]);
  circle(g, u * 3.4, -u * 3.4, u * 1.7); g.fill();
  rr(g, u * 3.6, -u * 3.4, u * 2.6, u * 1.4, u * .7); g.fill();
  g.fillStyle = '#2a1a10'; circle(g, u * 6.1, -u * 2.95, u * .42); g.fill();
  g.fillStyle = '#2a1a10'; circle(g, u * 3.9, -u * 3.9, u * .3); g.fill();
  g.fillStyle = '#b87a30'; ellipse(g, u * 2.6, -u * 3, u * .8, u * 1.5, .3); g.fill();
  g.strokeStyle = '#8a5a2a'; g.lineWidth = u * .18; g.beginPath(); g.moveTo(u * 5.2, -u * 2.3); g.quadraticCurveTo(u * 5.6, -u * 2.0, u * 6, -u * 2.35); g.stroke();
  g.restore();
}

// The prompt box (a terminal input line): text typed up to `typed` characters, cursor blinks.
export function promptBox(g, x, y, w, str, typed, t, o = {}) {
  const h = o.h || w * .17;
  g.save(); g.translate(x, y);
  g.fillStyle = o.bg || 'rgba(12,11,20,.92)';
  rr(g, -w / 2, -h / 2, w, h, h * .22); g.fill();
  g.strokeStyle = o.border || rgba(C.clawd, .9); g.lineWidth = Math.max(2, w * .004);
  rr(g, -w / 2, -h / 2, w, h, h * .22); g.stroke();
  if (o.flash) { glow(g, 0, 0, w * .7, C.clawd, .6 * o.flash); }
  const size = o.size || h * .42;
  g.font = `500 ${size}px Mono`; g.textBaseline = 'middle'; g.textAlign = 'left';
  const px = -w / 2 + h * .45;
  g.fillStyle = '#8e8aa6'; g.fillText('>', px, 0);
  const s = str.slice(0, Math.max(0, Math.floor(typed)));
  g.fillStyle = o.color || '#f3efe6';
  const tx = px + size * 1.1;
  g.fillText(s, tx, 0);
  const cw = g.measureText(s).width;
  if (Math.floor(t * 2.2) % 2 === 0 || o.cursorOn) { g.fillStyle = '#f3efe6'; g.fillRect(tx + cw + size * .08, -size * .55, size * .55, size * 1.1); }
  g.restore();
}
