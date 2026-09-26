// Props, drawn in ink and gouache: phones and laptops with their app screens, the user's
// emoji-yellow hand, the quota battery, containers and the helm, the clock, padlocks and the vault
// door, papers, the guide dog, the prompt box. Screens keep typeset text: that's the machine's.
import { C, TAU, clamp, lerp, smooth, easeOut, easeOutBack, rnd, rr, circle, ellipse, line, poly, star, heart, glow, text, vgrad, rgrad, lgrad, rgba, mix, shade, INK } from './kit.js';
import { pen, nopen, tone } from './cast.js';

export const HAND = '#ffcc4d', HAND_D = '#e0a12c';

// A phone standing at (x, y) centre, w wide; screen(g, sx, sy, sw, sh) draws the app.
export function phone(g, x, y, w, rot, screen, o = {}) {
  const h = w * 2.05, r = w * .14;
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  if (o.glow !== false) glow(g, 0, 0, w * 1.3, o.glowCol || '#fff1dc', .3 * (o.glowA ?? 1));
  pen(g, w / 12, .8);
  const body = () => rr(g, -w / 2, -h / 2, w, h, r);
  body(); g.fillStyle = '#26243a'; g.fill();
  nopen(g); tone(g, body, '#26243a', '#15141f', -w * .03, -w * .03);
  const bz = w * .045;
  const sx = -w / 2 + bz, sy = -h / 2 + bz, sw = w - bz * 2, sh = h - bz * 2;
  g.save(); rr(g, sx, sy, sw, sh, r * .78); g.clip();
  g.fillStyle = o.bg || '#fbf7f0'; g.fillRect(sx, sy, sw, sh);
  screen?.(g, sx, sy, sw, sh);
  g.restore();
  g.fillStyle = '#07070c'; rr(g, -w * .14, sy + w * .03, w * .28, w * .075, w * .04); g.fill();
  g.restore();
  return { h };
}

// A laptop seen from the front: screen (w wide) above a keyboard deck in slight perspective.
export function laptop(g, x, baseY, w, screen, o = {}) {
  const sh = w * .64, deck = w * .09;
  const sy = baseY - deck - sh;
  if (o.glow !== false) glow(g, x, sy + sh / 2, w * .85, o.glowCol || '#ffe7cf', .3 * (o.glowA ?? 1));
  g.save();
  pen(g, w / 30, .8);
  const lid = () => rr(g, x - w / 2, sy, w, sh, w * .03);
  lid(); g.fillStyle = '#3a3848'; g.fill();
  nopen(g);
  const bz = w * .028;
  g.save(); rr(g, x - w / 2 + bz, sy + bz, w - bz * 2, sh - bz * 2, w * .012); g.clip();
  g.fillStyle = o.bg || '#12111a'; g.fillRect(x - w / 2 + bz, sy + bz, w - bz * 2, sh - bz * 2);
  screen?.(g, x - w / 2 + bz, sy + bz, w - bz * 2, sh - bz * 2);
  g.restore();
  pen(g, w / 30, .8);
  const deckP = () => poly(g, [[x - w / 2 - w * .02, baseY - deck], [x + w / 2 + w * .02, baseY - deck], [x + w / 2 + w * .1, baseY], [x - w / 2 - w * .1, baseY]]);
  deckP(); g.fillStyle = '#c9c5d4'; g.fill();
  nopen(g); tone(g, deckP, '#c9c5d4', '#9994aa', 0, -deck * .35);
  g.fillStyle = 'rgba(40,38,52,.35)'; g.fillRect(x - w * .1, baseY - deck * .45, w * .2, deck * .2);
  g.restore();
  return { sy, sh, top: sy };
}

// The user's hand, emoji yellow. pose: 'point' | 'hold' | 'fist' | 'thumb' | 'open'
export function hand(g, x, y, s, rot, pose = 'point', o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  const u = s / 10;
  const col = o.col || HAND, dk = o.dark || HAND_D;
  pen(g, u, .9);
  if (o.sleeve !== false) {
    const sc = o.sleeveCol || '#5b6cff';
    const sl = () => rr(g, -u * 3.4, u * 3.2, u * 6.8, u * 14, u * 1.6);
    sl(); g.fillStyle = sc; g.fill();
    nopen(g); tone(g, sl, sc, shade(sc, -.25), -u * 1.2, 0); pen(g, u, .9);
    g.fillStyle = shade(sc, -.2); rr(g, -u * 3.6, u * 3, u * 7.2, u * 1.6, u * .8); g.fill();
  }
  g.fillStyle = col;
  const palm = () => rr(g, -u * 3.2, -u * 2.6, u * 6.4, u * 6.4, u * 2.4);
  const finger = (fx, fy, len, ang, w2 = 1.35) => {
    g.save(); g.translate(fx, fy); g.rotate(ang);
    g.fillStyle = col; rr(g, -u * w2 / 2, -len, u * w2, len + u * .8, u * w2 / 2); g.fill();
    g.restore();
  };
  if (pose === 'point') {
    finger(-u * 3.1, u * .2, u * 2.4, -1.1, 1.5);
    palm(); g.fill();
    finger(-u * 1.5, -u * 2, u * 6.2, -.05);
    g.fillStyle = dk; for (let i = 0; i < 3; i++) { rr(g, -u * .2 + i * u * 1.1, -u * 3.1, u * 1.2, u * 2.2, u * .6); g.fill(); }
  } else if (pose === 'hold') {
    palm(); g.fill();
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? col : shade(col, -.05); rr(g, -u * 3 + i * u * 1.55, -u * 4.2, u * 1.45, u * 2.6, u * .7); g.fill(); }
    finger(-u * 3.4, -u * 1, u * 3, -.9, 1.6);
  } else if (pose === 'fist') {
    palm(); g.fill();
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? col : shade(col, -.05); rr(g, -u * 3 + i * u * 1.55, -u * 3.4, u * 1.45, u * 2.2, u * .7); g.fill(); }
    g.fillStyle = dk; rr(g, -u * 3.4, -u * .8, u * 3.6, u * 1.6, u * .8); g.fill();
  } else if (pose === 'thumb') {
    palm(); g.fill();
    for (let i = 0; i < 4; i++) { g.fillStyle = shade(col, -.04 * (i % 2)); rr(g, -u * 3, -u * 1.8 + i * u * 1.35, u * 3, u * 1.3, u * .65); g.fill(); }
    finger(u * 1.6, -u * 2.2, u * 3.6, .05, 1.8);
  } else if (pose === 'open') {
    finger(-u * 3.2, u * .4, u * 3, -1.0, 1.6);
    palm(); g.fill();
    for (let i = 0; i < 4; i++) finger(-u * 2.4 + i * u * 1.6, -u * 2.2, u * (4.2 + (i === 1 || i === 2 ? .8 : 0)), (i - 1.5) * .12);
  }
  g.restore();
}

// The quota battery: level 0..1, label shown from `label` on.
export function battery(g, x, y, w, level, o = {}) {
  const h = w * .46;
  g.save(); g.translate(x, y);
  const dead = level <= .001;
  const col = level > .5 ? '#5fd67f' : level > .2 ? '#ffc94a' : '#ff5a5f';
  if (!dead) glow(g, 0, 0, w * .8, col, .3 * (o.glowA ?? 1));
  pen(g, w / 14, .8);
  const shell = () => rr(g, -w / 2, -h / 2, w, h, h * .22);
  shell(); g.fillStyle = '#17162a'; g.fill();
  g.fillStyle = dead ? '#3a3a4a' : '#f4f1ea'; rr(g, w / 2 + w * .02, -h * .2, w * .07, h * .4, w * .02); g.fill();
  nopen(g);
  g.strokeStyle = dead ? '#3a3a4a' : '#f4f1ea'; g.lineWidth = w * .04; rr(g, -w / 2 + w * .03, -h / 2 + w * .03, w - w * .06, h - w * .06, h * .18); g.stroke();
  const pad = w * .08;
  const fw = (w - pad * 2) * clamp(level);
  if (fw > 1) {
    const blink = o.blink ? (Math.sin(o.blink * 20) > 0 ? 1 : .35) : 1;
    g.globalAlpha *= blink;
    const cell = () => rr(g, -w / 2 + pad, -h / 2 + pad, fw, h - pad * 2, h * .1);
    cell(); g.fillStyle = col; g.fill();
    tone(g, cell, col, shade(col, -.2), 0, -h * .12);
    g.globalAlpha = 1;
  }
  if (o.label) text(g, o.label, 0, h / 2 + w * .22, { size: w * .15, font: 'Mono', weight: 700, color: dead ? '#6a6a80' : '#f4f1ea', ls: 2 });
  g.restore();
}

// Shipping container, seen side-on: flat paint, corrugations in ink, a darker lower half.
export function container(g, x, y, w, h, col) {
  g.save();
  pen(g, w / 40, .8);
  const box = () => g.rect(x, y, w, h);
  g.beginPath(); box(); g.fillStyle = col; g.fill();
  nopen(g); tone(g, () => { g.beginPath(); box(); }, col, shade(col, -.22), 0, -h * .35);
  g.strokeStyle = rgba(shade(col, -.45), .7); g.lineWidth = Math.max(1, w * .01);
  const n = Math.max(6, Math.round(w / 18));
  for (let i = 1; i < n; i++) { line(g, x + i * w / n, y + h * .1, x + i * w / n, y + h * .9); g.stroke(); }
  g.restore();
}

// The helm (a nod to Kubernetes' wheel): a blue heptagon with a seven-spoke wheel.
export function helm(g, x, y, r, rot) {
  g.save(); g.translate(x, y);
  glow(g, 0, 0, r * 2, '#5aa2ff', .5);
  pen(g, r / 6, .8);
  const hept = () => { g.beginPath(); for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + i / 7 * TAU; const px = Math.cos(a) * r, py = Math.sin(a) * r; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); };
  hept(); g.fillStyle = '#3f7cf0'; g.fill();
  nopen(g); tone(g, hept, '#3f7cf0', '#2a57bf', -r * .15, -r * .15);
  g.rotate(rot);
  g.strokeStyle = '#ffffff'; g.lineWidth = r * .11; g.lineCap = 'round';
  circle(g, 0, 0, r * .5); g.stroke();
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; line(g, Math.cos(a) * r * .15, Math.sin(a) * r * .15, Math.cos(a) * r * .72, Math.sin(a) * r * .72); g.stroke(); }
  g.fillStyle = '#fff'; circle(g, 0, 0, r * .14); g.fill();
  g.restore();
}

// A clock face: ticks and hands; angleH/angleM in radians.
export function clockFace(g, x, y, r, angH, angM, o = {}) {
  glow(g, x, y, r * 1.5, '#ffe7b0', .4 * (o.glowA ?? 1));
  g.save();
  pen(g, r / 8, .9);
  const face = () => circle(g, x, y, r);
  face(); g.fillStyle = '#fcf3df'; g.fill();
  nopen(g); tone(g, face, '#fcf3df', '#e9d8b4', -r * .1, -r * .1);
  g.strokeStyle = '#c9a15a'; g.lineWidth = r * .05; circle(g, x, y, r * .95); g.stroke();
  g.strokeStyle = '#3a2a24';
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU, big = i % 5 === 0;
    g.lineWidth = big ? r * .026 : r * .01;
    line(g, x + Math.cos(a) * r * (big ? .78 : .85), y + Math.sin(a) * r * (big ? .78 : .85), x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9); g.stroke();
  }
  g.lineCap = 'round';
  g.strokeStyle = '#2a1c18'; g.lineWidth = r * .05;
  line(g, x, y, x + Math.cos(angH - Math.PI / 2) * r * .45, y + Math.sin(angH - Math.PI / 2) * r * .45); g.stroke();
  g.lineWidth = r * .032;
  line(g, x, y, x + Math.cos(angM - Math.PI / 2) * r * .7, y + Math.sin(angM - Math.PI / 2) * r * .7); g.stroke();
  g.fillStyle = C.clawd; circle(g, x, y, r * .055); g.fill();
  g.restore();
}

export function padlock(g, x, y, s, rot = 0, open = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  pen(g, s / 9, .9);
  g.strokeStyle = INK.col; g.lineWidth = s * .2;
  g.beginPath(); g.arc(0, -s * .45 - open * s * .3, s * .32, Math.PI, 0); g.lineTo(s * .32, -s * .2 - open * s * .3); g.stroke();
  g.strokeStyle = '#cfd2de'; g.lineWidth = s * .13;
  g.beginPath(); g.arc(0, -s * .45 - open * s * .3, s * .32, Math.PI, 0); g.lineTo(s * .32, -s * .2 - open * s * .3); g.stroke();
  const body = () => rr(g, -s * .5, -s * .3, s, s * .8, s * .14);
  body(); g.fillStyle = '#f2b93b'; g.fill();
  nopen(g); tone(g, body, '#f2b93b', '#c98a1e', -s * .12, -s * .1);
  g.fillStyle = '#5a3a0a'; circle(g, 0, s * .02, s * .1); g.fill(); g.fillRect(-s * .04, s * .02, s * .08, s * .22);
  g.restore();
}

export function chain(g, x1, y1, x2, y2, s) {
  const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / (s * .8)));
  const a = Math.atan2(y2 - y1, x2 - x1);
  g.save(); g.ink = null;
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    g.save(); g.translate(lerp(x1, x2, p), lerp(y1, y2, p)); g.rotate(a);
    for (const [col, w] of [[INK.col, s * .26], [i % 2 ? '#aeb2c4' : '#d7dae6', s * .15]]) {
      g.strokeStyle = col; g.lineWidth = w;
      if (i % 2) ellipse(g, 0, 0, s * .5, s * .16); else ellipse(g, 0, 0, s * .5, s * .3);
      g.stroke();
    }
    g.restore();
  }
  g.restore();
}

// A sheet of paper with a filename on it.
export function paper(g, x, y, s, rot, label, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.ink = null; g.fillStyle = 'rgba(0,0,0,.22)'; rr(g, -s * .38 + 3, -s * .5 + 4, s * .76, s, s * .04); g.fill();
  pen(g, s / 14, .7);
  g.fillStyle = o.col || '#fbf7ee'; rr(g, -s * .38, -s * .5, s * .76, s, s * .04); g.fill();
  nopen(g);
  g.fillStyle = 'rgba(60,50,80,.25)';
  for (let i = 0; i < 5; i++) g.fillRect(-s * .28, -s * .15 + i * s * .12, s * (.56 - (i === 4 ? .2 : 0)), s * .035);
  if (label) text(g, label, 0, -s * .3, { size: s * .1, font: 'Mono', weight: 700, color: '#3a2e52' });
  g.restore();
}

// A golden retriever guide dog lying down, harness on, tail going. Faces right. s = body length.
export function guideDog(g, x, y, s, t) {
  const u = s / 10;
  const fur = '#eab35c', furT = '#c98a3a';
  g.save(); g.translate(x, y);
  g.ink = null; g.fillStyle = 'rgba(0,0,0,.22)'; ellipse(g, 0, u * .4, u * 6, u * 1); g.fill();
  pen(g, u, .9);
  const wag = Math.sin(t * 12) * .5;
  g.save(); g.translate(-u * 4.4, -u * 1.6); g.rotate(-2.4 + wag);
  g.fillStyle = furT; rr(g, 0, -u * .45, u * 3.2, u * .9, u * .45); g.fill();
  g.restore();
  const bodyP = () => ellipse(g, -u * .6, -u * 1.5, u * 4.6, u * 1.9);
  g.fillStyle = fur;
  ellipse(g, -u * 3.6, -u * .7, u * 1.6, u * 1.1); g.fill();
  bodyP(); g.fill();
  nopen(g); tone(g, bodyP, fur, furT, 0, -u * .6); pen(g, u, .9);
  g.fillStyle = fur;
  rr(g, u * 1.6, -u * .8, u * 3.6, u * 1, u * .5); g.fill();
  rr(g, u * 1.2, -u * .5, u * 3.8, u * .9, u * .45); g.fill();
  g.fillStyle = '#e0495d'; rr(g, -u * .6, -u * 3.3, u * 1.1, u * 3, u * .3); g.fill();
  g.strokeStyle = '#3a2a30'; g.lineWidth = u * .35; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-u * .1, -u * 3.2); g.lineTo(-u * 1.2, -u * 5.2); g.lineTo(u * .8, -u * 5.4); g.stroke();
  g.fillStyle = fur;
  circle(g, u * 3.4, -u * 3.4, u * 1.7); g.fill();
  rr(g, u * 3.6, -u * 3.4, u * 2.6, u * 1.4, u * .7); g.fill();
  nopen(g);
  g.fillStyle = '#2a1a10'; circle(g, u * 6.1, -u * 2.95, u * .42); g.fill();
  circle(g, u * 3.9, -u * 3.9, u * .3); g.fill();
  pen(g, u, .7);
  g.fillStyle = furT; ellipse(g, u * 2.6, -u * 3, u * .8, u * 1.5, .3); g.fill();
  nopen(g);
  g.strokeStyle = '#8a5a2a'; g.lineWidth = u * .18; g.beginPath(); g.moveTo(u * 5.2, -u * 2.3); g.quadraticCurveTo(u * 5.6, -u * 2.0, u * 6, -u * 2.35); g.stroke();
  g.restore();
}

// The prompt box (a terminal input line): text typed up to `typed` characters, cursor blinks.
export function promptBox(g, x, y, w, str, typed, t, o = {}) {
  const h = o.h || w * .17;
  g.save(); g.translate(x, y);
  pen(g, w / 60, .8);
  g.fillStyle = o.bg || '#141320';
  rr(g, -w / 2, -h / 2, w, h, h * .22); g.fill();
  nopen(g);
  g.strokeStyle = o.border || rgba(C.clawd, .9); g.lineWidth = Math.max(2, w * .005);
  rr(g, -w / 2 + w * .012, -h / 2 + w * .012, w - w * .024, h - w * .024, h * .2); g.stroke();
  if (o.flash) glow(g, 0, 0, w * .6, C.clawd, .7 * o.flash);
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

// A flame, painted: three tongues of red, orange and yellow, wavering, outlined in ink. (y is the
// base, s the height.) The film's own 🔥.
export function flame(g, x, y, s, t = 0) {
  if (s <= 1) return;
  const wob = k => Math.sin(t * 9 + k) * .06 + Math.sin(t * 14 + k * 2) * .03;
  const tongue = (w, h, k) => {
    g.beginPath(); g.moveTo(0, 0);
    g.bezierCurveTo(-w, 0, -w * 1.12, -h * .45, -w * .36, -h * (.72 + wob(k)));
    g.bezierCurveTo(-w * .26, -h * .55, -w * .06, -h * .62, w * wob(k + 1) * 2, -h * (1 + wob(k + 2)));
    g.bezierCurveTo(w * .22, -h * .7, w * .5, -h * .62, w * .46, -h * (.44 + wob(k + 3)));
    g.bezierCurveTo(w * .92, -h * .52, w * 1.06, -h * .2, w * .7, -h * .05);
    g.quadraticCurveTo(w * .4, h * .02, 0, 0); g.closePath();
  };
  glow(g, x, y - s * .4, s * .9, '#ff8a3a', .7);
  g.save(); g.translate(x, y);
  pen(g, s / 30, .9);
  g.fillStyle = '#f2502a'; tongue(s * .44, s, 0); g.fill();
  nopen(g);
  g.fillStyle = '#ff9a2e'; tongue(s * .32, s * .74, 3); g.fill();
  g.fillStyle = '#ffe070'; tongue(s * .19, s * .44, 6); g.fill();
  g.restore();
}
