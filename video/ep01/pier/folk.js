// Crowds: people in numbers, drawn so they overlap the way a crowd does. Everyone stands on the
// ground at their own distance and the crowd is drawn from the back to the front, so whoever is
// nearer hides whoever is behind, and nobody is cut off in mid-air.
//
// folk(i)   a passer-by (skin, hair, clothes, height), seeded, for filling a crowd.
// behind()  someone seen from behind, head to heels, at k px per metre: shoulders, arms, legs,
//           a phone held up to film the stage (its screen shows the stage) or a hand in the air.
// facing()  someone facing us, head to heels, drawn like person() in cast.js with less detail,
//           for the rows of a crowd too far off or too many for person().
import { C, TAU, clamp, rnd, rr, circle, ellipse, glow, mixHex, shade, INK } from './kit.js';
import { SKINS } from './cast.js';

const HAIRS = ['#1b1420', '#2a1c18', '#3a2418', '#5a3a20', '#141018', '#7a4a26', '#b8662c', '#d9b173', '#2a1c18', '#141018'];
const TOPS = ['#5a4bff', '#ff6a8a', '#2fbfa0', '#ffb13b', '#b06bff', '#48a0ff', '#ff7a59', '#e0495d', '#7ad37a', '#f2efe6', '#2a2a36', '#ffd35a', '#3a8f6a', '#c2477f'];
const LEGS = ['#2b3350', '#1f2433', '#3a3f5a', '#4a3a2a', '#2a2a36', '#5a6a8a', '#6a4a3a'];
const STYLES = ['short', 'long', 'bun', 'curly', 'bob', 'short', 'cap', 'afro', 'bald', 'beanie', 'pony', 'long', 'short', 'bob', 'pony', 'curly'];

export function folk(i) {
  const r = s => rnd(i, 900 + s);
  const pick = (a, s) => a[Math.floor(r(s) * a.length) % a.length];
  let style = pick(STYLES, 1);
  if (r(7) > .9 && style !== 'cap' && style !== 'beanie') style = 'grey';
  return {
    skin: pick(SKINS, 2), hairStyle: style, hair: pick(HAIRS, 3), top: pick(TOPS, 4), legs: pick(LEGS, 5),
    hatColor: pick(TOPS, 6), glasses: r(8) > .84 ? 'round' : undefined, H: 1.58 + .26 * r(9),
    hood: r(10) > .78, pack: r(11) > .88,
  };
}

// A capsule from (x0, y0) to (x1, y1), w0 and w1 wide at its two ends: an arm or a leg.
export function limb(g, x0, y0, x1, y1, w0, w1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1e-6;
  const nx = -dy / L, ny = dx / L, a = Math.atan2(dy, dx);
  g.beginPath();
  g.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  g.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  g.arc(x1, y1, w1 / 2, a + Math.PI / 2, a - Math.PI / 2, true);
  g.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2);
  g.arc(x0, y0, w0 / 2, a - Math.PI / 2, a + Math.PI / 2, true);
  g.closePath();
}

// A phone held up to film the stage, seen from behind its owner: the screen, lit, shows the
// stage (pink light and a small orange Clawd) once it's big enough to see.
export function phoneScreen(g, x, y, w, o = {}) {
  const h = w * 1.9;
  if (o.glow !== 0) glow(g, x, y, w * 3.2, '#cfdcff', .32 * (o.glow ?? 1));
  g.save(); g.ink = null;
  g.fillStyle = '#16121e'; rr(g, x - w / 2, y - h / 2, w, h, w * .2); g.fill();
  const sw = w * .8, sh = h * .86;
  if (w < 9) { g.fillStyle = '#e6eeff'; rr(g, x - sw / 2, y - sh / 2, sw, sh, sw * .15); g.fill(); g.restore(); return; }
  g.fillStyle = o.bg || '#9a3d8e'; rr(g, x - sw / 2, y - sh / 2, sw, sh, sw * .15); g.fill();
  g.fillStyle = 'rgba(255,190,225,.75)'; g.fillRect(x - sw / 2, y - sh * .12, sw, sh * .08);
  g.fillStyle = '#ffd7a8'; circle(g, x, y - sh * .3, sw * .16); g.fill();
  g.fillStyle = C.clawd; rr(g, x - sw * .24, y - sh * .02, sw * .48, sh * .2, sw * .06); g.fill();
  g.fillStyle = '#2a1830'; g.fillRect(x - sw / 2, y + sh * .22, sw, sh * .28);
  g.restore();
}

// Someone seen from behind, standing at (x, fy) (their heels) at k px per metre, H metres tall.
// o: { skin, hair, hairStyle, top, legs, hatColor, H, hood, pack,
//      lit: how much of their colour shows (0 = silhouette against the light), night: the dark,
//      rim, rimA: the stage light catching the top of the head and the shoulders,
//      arm: 'down' | 'phone' | 'wave' | 'fist', side: which arm is up (1 = right), up: 0..1 how
//      high, both: both arms up, hop: px off the ground, lean: radians, ink: outline, sway }
export function behind(g, x, fy, k, o = {}) {
  const Hm = o.H ?? 1.7, R = .15;
  const night = o.night || '#0b0612', lit = o.lit ?? .3;
  const tint = c => mixHex(night, c, lit);
  const topC = o.top || '#3a2a5a';
  const top = tint(topC), sleeve = tint(shade(topC, -.22));
  const legs = tint(o.legs || '#2b3350'), skin = tint(o.skin || '#c98d67'), shoe = tint('#1a1620');
  const hs = o.hairStyle || 'short';
  const hair = tint(hs === 'grey' ? '#dcdae4' : o.hair || '#2a1c18'), hat = tint(o.hatColor || '#e0495d');
  const m = v => v * k, Y = h => -h * k;
  const shT = Hm - 2 * R - .05, hip = Hm * .45, headY = Hm - R;
  const cx = 0, cy = Y(headY), r = m(R);
  g.save(); g.translate(x, fy - (o.hop || 0)); if (o.lean) g.rotate(o.lean);
  g.ink = o.ink ? INK.col : null; g.inkW = clamp(k * .007, 1.2, 3.5);
  // Legs, with heels showing under them.
  g.fillStyle = legs;
  for (const s of [-1, 1]) { limb(g, m(s * .088), Y(hip + .03), m(s * .09), Y(.08), m(.165), m(.12)); g.fill(); }
  g.fillStyle = shoe;
  for (const s of [-1, 1]) { ellipse(g, m(s * .094), Y(.035), m(.075), m(.045)); g.fill(); }
  // Neck, then the back: shoulders, a little waist, hips.
  g.fillStyle = skin; rr(g, -r * .38, cy + r * .45, r * .76, Y(shT + .03) - cy - r * .45 + m(.06), r * .2); g.fill();
  const back = () => {
    g.beginPath();
    g.moveTo(m(-.178), Y(hip - .05));
    g.quadraticCurveTo(m(-.16), Y(hip + .2), m(-.198), Y(shT - .15));
    g.quadraticCurveTo(m(-.228), Y(shT - .02), m(-.155), Y(shT + .008));
    g.quadraticCurveTo(m(-.09), Y(shT + .02), m(-.062), Y(shT + .05));
    g.lineTo(m(.062), Y(shT + .05));
    g.quadraticCurveTo(m(.09), Y(shT + .02), m(.155), Y(shT + .008));
    g.quadraticCurveTo(m(.228), Y(shT - .02), m(.198), Y(shT - .15));
    g.quadraticCurveTo(m(.16), Y(hip + .2), m(.178), Y(hip - .05));
    g.closePath();
  };
  g.fillStyle = top; back(); g.fill();
  if (o.hood) { g.fillStyle = sleeve; ellipse(g, 0, Y(shT - .02), m(.12), m(.07)); g.fill(); }
  if (o.pack) {
    const pc = tint(shade(o.hatColor || '#3a8f6a', -.1));
    g.fillStyle = pc; rr(g, m(-.13), Y(shT - .05), m(.26), m(.33), m(.07)); g.fill();
    g.fillStyle = tint(shade(o.hatColor || '#3a8f6a', -.35)); rr(g, m(-.09), Y(shT - .2), m(.18), m(.12), m(.04)); g.fill();
  }
  // Arms: the ones hanging sit over the sides of the back; raised ones go up past the head.
  const up = clamp(o.up ?? 1);
  const sides = o.arm && o.arm !== 'down' ? (o.both ? [-1, 1] : [o.side || 1]) : [];
  const hands = [];
  for (const s of [-1, 1]) {
    if (sides.includes(s)) continue;
    g.fillStyle = sleeve; limb(g, m(s * .195), Y(shT - .06), m(s * .215), Y(hip - .02), m(.11), m(.088)); g.fill();
    g.fillStyle = skin; circle(g, m(s * .217), Y(hip - .05), m(.046)); g.fill();
  }
  for (const s of sides) {
    const sw = o.sway ? Math.sin(o.sway + s) * .03 : 0;
    const sx = m(s * .17), sy = Y(shT - .05);
    const hx = m(s * (.2 - .04 * up) + sw), hy = Y(shT + .12 + .42 * up);
    const ex = m(s * (.3 + .02 * (1 - up)) + sw * .5), ey = Y(shT + .03 + .14 * up);
    g.fillStyle = sleeve; limb(g, sx, sy, ex, ey, m(.12), m(.1)); g.fill();
    limb(g, ex, ey, hx, hy, m(.1), m(.082)); g.fill();
    hands.push([s, hx, hy, ex, ey]);
  }
  // Hair that hangs down the back goes on before the head.
  if (hs === 'long') { g.fillStyle = hair; g.beginPath(); g.arc(cx, cy, r * 1.06, 0, Math.PI, true); g.lineTo(-r * 1.02, cy + r * 1.95); g.quadraticCurveTo(0, cy + r * 2.25, r * 1.02, cy + r * 1.95); g.closePath(); g.fill(); }
  if (hs === 'bob') { g.fillStyle = hair; g.beginPath(); g.arc(cx, cy, r * 1.08, 0, Math.PI, true); g.lineTo(-r * 1.14, cy + r * 1.02); g.quadraticCurveTo(0, cy + r * 1.22, r * 1.14, cy + r * 1.02); g.closePath(); g.fill(); }
  if (hs === 'pony') {
    const sw = Math.sin((o.sway || 0) * 1.3) * r * .3;
    g.fillStyle = hair; g.beginPath(); g.moveTo(-r * .3, cy + r * .2); g.quadraticCurveTo(-r * .4, cy + r * 1.4, sw, cy + r * 2.3); g.quadraticCurveTo(r * .4, cy + r * 1.4, r * .3, cy + r * .2); g.closePath(); g.fill();
  }
  // Ears, where the hair leaves them showing; then the head.
  if (!['long', 'bob', 'afro', 'curly', 'grey', 'beanie'].includes(hs)) {
    g.fillStyle = skin; for (const s of [-1, 1]) { ellipse(g, s * r * .98, cy + r * .12, r * .2, r * .3); g.fill(); }
  }
  g.fillStyle = skin; circle(g, cx, cy, r); g.fill();
  // Hair over the head: from behind, all of it but the neck.
  let rimR = r * 1.04, rimY = cy;
  g.fillStyle = hair;
  if (hs === 'short' || hs === 'bun' || hs === 'pony' || hs === 'cap' || hs === 'beanie') { circle(g, cx, cy, r * 1.04); g.fill(); }
  if (hs === 'long' || hs === 'bob') { circle(g, cx, cy, r * 1.05); g.fill(); }
  if (hs === 'bun') { circle(g, cx, cy - r * .98, r * .44); g.fill(); }
  if (hs === 'pony') { g.fillStyle = hat; rr(g, -r * .2, cy + r * .62, r * .4, r * .13, r * .06); g.fill(); }
  if (hs === 'curly' || hs === 'grey') { circle(g, cx, cy, r * 1.02); g.fill(); for (let i = 0; i < 9; i++) { const a = Math.PI * (1.02 + i / 8 * .96); circle(g, cx + Math.cos(a) * r * .86, cy + Math.sin(a) * r * .86, r * .36); g.fill(); } rimR = r * 1.18; }
  if (hs === 'afro') { circle(g, cx, cy - r * .12, r * 1.24); g.fill(); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; circle(g, cx + Math.cos(a) * r * 1.2, cy - r * .12 + Math.sin(a) * r * 1.2, r * .26); g.fill(); } rimR = r * 1.4; rimY = cy - r * .12; }
  if (hs === 'bald') { g.beginPath(); g.arc(cx, cy, r * 1.03, .3, Math.PI - .3); g.arc(cx, cy + r * .1, r * .86, Math.PI - .5, .5, true); g.closePath(); g.fill(); }
  if (hs === 'cap') {
    g.fillStyle = hat; g.beginPath(); g.arc(cx, cy - r * .06, r * 1.07, Math.PI + .12, -.12); g.closePath(); g.fill();
    g.fillStyle = hair; g.beginPath(); g.ellipse(cx, cy - r * .1, r * .26, r * .2, 0, 0, Math.PI, true); g.fill();
    rimR = r * 1.08; rimY = cy - r * .06;
  }
  if (hs === 'beanie') {
    g.fillStyle = hat; g.beginPath(); g.arc(cx, cy - r * .04, r * 1.1, Math.PI + .02, -.02); g.closePath(); g.fill();
    g.fillStyle = tint(shade(o.hatColor || '#e0495d', -.2)); rr(g, -r * 1.1, cy - r * .22, r * 2.2, r * .34, r * .14); g.fill();
    g.fillStyle = hat; circle(g, cx, cy - r * 1.22, r * .26); g.fill();
    rimR = r * 1.1; rimY = cy - r * .04;
  }
  // Hands in the air, and phones.
  for (const [s, hx, hy] of hands) {
    g.fillStyle = skin;
    if (o.arm === 'wave') {
      g.save(); g.translate(hx, hy); g.rotate(s * .25 + (o.sway ? Math.sin(o.sway * 2) * .3 : 0));
      ellipse(g, 0, -m(.035), m(.048), m(.062)); g.fill();
      ellipse(g, -s * m(.05), -m(.01), m(.018), m(.034), s * .7); g.fill();
      g.restore();
    } else circle(g, hx, hy, m(.044));
    if (o.arm === 'phone') phoneScreen(g, hx, hy - m(.07), m(.085), { glow: o.glow });
  }
  // The stage light catching the top of the head and the shoulders.
  if (o.rim && (o.rimA ?? .5) > 0) {
    g.ink = null; g.strokeStyle = o.rim; g.globalAlpha *= o.rimA ?? .5; g.lineWidth = Math.max(1.3, k * .02);
    g.beginPath(); g.arc(cx, rimY, rimR, Math.PI * 1.14, Math.PI * 1.86); g.stroke();
    if (hs === 'bun') { g.beginPath(); g.arc(cx, cy - r * .98, r * .44, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    for (const s of [-1, 1]) {
      if (sides.includes(s)) continue;
      g.beginPath(); g.moveTo(m(s * .21), Y(shT - .05)); g.quadraticCurveTo(m(s * .2), Y(shT + .01), m(s * .1), Y(shT + .03)); g.stroke();
    }
    for (const [s, hx, hy, ex, ey] of hands) {
      const w = m(.05) * s;
      g.beginPath(); g.moveTo(m(s * .2) + w * .4, Y(shT - .02)); g.lineTo(ex + w, ey); g.lineTo(hx + w * .9, hy + m(.03)); g.stroke();
    }
  }
  g.restore();
}

// Someone facing us, standing at (x, fy), sized like person(): s is their head size, and they
// stand 2.5 s tall. Hair, face and clothes follow person(), with the detail a small figure needs.
// o: person()'s look (skin, hair, hairStyle, top, legs, hatColor, glasses) plus
//    lit (0..1, how much of the light reaches them), night (the colour they fade into),
//    arm: 'down' | 'torch' | 'wave' | 'fist', side, both, up (0..1), mouth (0..1), hop, lean
export function facing(g, x, fy, s, o = {}) {
  const u = s / 10;
  const lit = o.lit ?? 1, night = o.night || '#170c24';
  const tint = c => lit >= .999 ? c : mixHex(night, c, lit);
  const topC = o.top || '#4a7bff';
  const top = tint(topC), topT = tint(shade(topC, -.24)), skin = tint(o.skin || SKINS[1]);
  const legs = tint(o.legs || '#2b3350'), shoe = tint('#1b1b24');
  const hs = o.hairStyle || 'short';
  const hair = tint(hs === 'grey' ? '#ecebf2' : o.hair || '#2a1c18'), hat = tint(o.hatColor || '#e05a47');
  const detail = s >= 22, fine = s >= 40;
  g.save(); g.translate(x, fy - (o.hop || 0)); if (o.lean) g.rotate(o.lean);
  g.ink = fine ? INK.col : null; g.inkW = clamp(u * .12, 1.2, 4);
  // Legs and shoes.
  g.fillStyle = legs; rr(g, -u * 3.9, -u * 6.8, u * 3.3, u * 6.4, u * 1.1); g.fill(); rr(g, u * .6, -u * 6.8, u * 3.3, u * 6.4, u * 1.1); g.fill();
  g.fillStyle = shoe; rr(g, -u * 4.4, -u * 1.2, u * 3.9, u * 1.4, u * .65); g.fill(); rr(g, u * .5, -u * 1.2, u * 3.9, u * 1.4, u * .65); g.fill();
  // Body: person()'s rounded trapezoid, shaded on one side, with long hair hanging behind it.
  const by = -u * 6, th = u * 11;
  const hy = by - th - u * 3.6, hr = u * 4.3;
  g.fillStyle = hair;
  if (hs === 'long') { rr(g, -hr * 1.1, hy - hr * .7, hr * 2.2, hr * 2.25, hr * .9); g.fill(); }
  if (hs === 'bob') { rr(g, -hr * 1.16, hy - hr * .8, hr * 2.32, hr * 1.62, hr * .55); g.fill(); }
  if (hs === 'afro') { circle(g, 0, hy - hr * .22, hr * 1.2); g.fill(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; circle(g, Math.cos(a) * hr * 1.16, hy - hr * .22 + Math.sin(a) * hr * 1.16, hr * .3); g.fill(); } }
  if (hs === 'pony') { ellipse(g, hr * 1.02, hy + hr * .35, hr * .34, hr * .78, -.35); g.fill(); }
  const torso = (dx = 0, k = 1) => { g.beginPath(); g.moveTo(-u * 6 * k + dx, by + u * .5); g.lineTo(-u * 5.2 * k + dx, by - th + u * 2.4); g.quadraticCurveTo(-u * 5 * k + dx, by - th, -u * 2.5 * k + dx, by - th); g.lineTo(u * 2.5 * k + dx, by - th); g.quadraticCurveTo(u * 5 * k + dx, by - th, u * 5.2 * k + dx, by - th + u * 2.4); g.lineTo(u * 6 * k + dx, by + u * .5); g.closePath(); };
  g.fillStyle = topT; torso(); g.fill();
  if (detail) { const ink = g.ink; g.ink = null; g.fillStyle = top; torso(-u * .9, .86); g.fill(); g.ink = ink; }
  // Arms.
  const up = clamp(o.up ?? 1);
  const sides = o.arm && o.arm !== 'down' ? (o.both ? [-1, 1] : [o.side || 1]) : [];
  const ay = by - th + u * 2.6;
  for (const sd of [-1, 1]) {
    g.fillStyle = sd > 0 ? topT : top;
    if (!sides.includes(sd)) {
      limb(g, sd * u * 4.8, ay, sd * u * 5.6, by + u * .2, u * 2.8, u * 2.5); g.fill();
      g.fillStyle = skin; circle(g, sd * u * 5.6, by + u * .6, u * 1.45); g.fill();
      continue;
    }
    const hx = sd * u * (7.4 - 1.4 * up), hy = ay - u * (2 + 5.4 * up);
    limb(g, sd * u * 4.6, ay, hx, hy, u * 2.8, u * 2.5); g.fill();
    g.fillStyle = skin; circle(g, hx, hy, u * 1.45); g.fill();
    if (o.arm === 'torch') {
      // The back of a phone, its torch on, held up to the stage.
      g.save(); g.ink = null;
      g.fillStyle = '#1c1a26'; rr(g, hx - u * 1.2, hy - u * 4.1, u * 2.4, u * 3.8, u * .5); g.fill();
      glow(g, hx - u * .4, hy - u * 3.4, u * 5, '#fff6e0', .55 * lit + .2);
      g.fillStyle = '#fffaf0'; circle(g, hx - u * .4, hy - u * 3.4, Math.max(1.2, u * .45)); g.fill();
      g.restore();
    }
  }
  // Collar, neck, curls behind the head, ears, head.
  if (detail) { const ink = g.ink; g.ink = null; g.fillStyle = tint(shade(topC, -.35)); g.beginPath(); g.ellipse(0, by - th + u * .1, u * 1.9, u * 1.1, 0, 0, Math.PI); g.fill(); g.ink = ink; }
  g.fillStyle = tint(shade(o.skin || SKINS[1], -.16)); rr(g, -u * 1.3, hy + u * 2, u * 2.6, u * 2.6, u); g.fill();
  g.fillStyle = hair;
  if (hs === 'curly' || hs === 'grey') { circle(g, 0, hy - hr * .1, hr * 1.14); g.fill(); }
  if (detail) { g.fillStyle = skin; circle(g, -hr * .98, hy + u * .5, u * .95); g.fill(); circle(g, hr * .98, hy + u * .5, u * .95); g.fill(); }
  g.fillStyle = skin; ellipse(g, 0, hy + u * .15, hr * 1.02, hr * .98); g.fill();
  // Hair on top.
  g.fillStyle = hair;
  if (hs === 'short') { g.beginPath(); g.moveTo(-hr * 1.04, hy + u * .4); g.bezierCurveTo(-hr * 1.15, hy - hr * 1.05, hr * 1.1, hy - hr * 1.15, hr * 1.04, hy - u * .2); g.quadraticCurveTo(hr * .4, hy - hr * .55, -hr * .3, hy - hr * .5); g.quadraticCurveTo(-hr * .75, hy - hr * .35, -hr * 1.04, hy + u * .4); g.closePath(); g.fill(); }
  if (hs === 'long' || hs === 'pony') { g.beginPath(); g.ellipse(0, hy - hr * .3, hr * 1.08, hr * .8, 0, Math.PI, TAU); g.fill(); }
  if (hs === 'bob') { g.beginPath(); g.ellipse(0, hy - hr * .28, hr * 1.1, hr * .84, 0, Math.PI, TAU); g.fill(); rr(g, -hr * .98, hy - hr * .78, hr * 1.96, hr * .46, hr * .2); g.fill(); }
  if (hs === 'bun') { g.beginPath(); g.ellipse(0, hy - hr * .36, hr * 1.04, hr * .72, 0, Math.PI, TAU); g.fill(); circle(g, 0, hy - hr * 1.14, hr * .5); g.fill(); }
  if (hs === 'afro') { g.beginPath(); g.ellipse(0, hy - hr * .42, hr * 1.02, hr * .66, 0, Math.PI, TAU); g.fill(); }
  if (hs === 'curly' || hs === 'grey') { for (let i = 0; i < 7; i++) { const a = -Math.PI * .1 - i / 6 * Math.PI * .8; circle(g, Math.cos(a) * hr * .84, hy - hr * .14 + Math.sin(a) * hr * .78, hr * .4); g.fill(); } }
  if (hs === 'cap' || hs === 'beanie') {
    g.fillStyle = hat; g.beginPath(); g.ellipse(0, hy - hr * .32, hr * 1.07, hs === 'beanie' ? hr * .98 : hr * .84, 0, Math.PI, TAU); g.closePath(); g.fill();
    if (hs === 'cap') { g.fillStyle = tint(shade(o.hatColor || '#e05a47', -.25)); ellipse(g, 0, hy - hr * .34, hr * 1.3, hr * .2); g.fill(); }
    else { rr(g, -hr * 1.1, hy - hr * .45, hr * 2.2, hr * .42, hr * .16); g.fill(); circle(g, 0, hy - hr * 1.28, hr * .24); g.fill(); }
  }
  // Face: eyes, mouth, the odd pair of glasses.
  if (s >= 13) {
    g.ink = null;
    const ic = tint('#22160f'), ey = hy + u * .4;
    g.fillStyle = ic; g.strokeStyle = ic; g.lineCap = 'round';
    for (const sd of [-1, 1]) {
      if (o.eyes === 'happy' && detail) { g.lineWidth = u * .5; g.beginPath(); g.moveTo(sd * u * 1.55 - u * .62, ey + u * .2); g.quadraticCurveTo(sd * u * 1.55, ey - u * .72, sd * u * 1.55 + u * .62, ey + u * .2); g.stroke(); }
      else { ellipse(g, sd * u * 1.55, ey, u * .55, u * .66); g.fill(); }
    }
    if (o.glasses === 'round' && detail) { g.strokeStyle = tint('#2a2230'); g.lineWidth = u * .36; circle(g, -u * 1.55, ey, u * 1.25); g.stroke(); circle(g, u * 1.55, ey, u * 1.25); g.stroke(); }
    const mo = o.mouth ?? 0;
    if (detail && mo > .1) { g.fillStyle = tint('#5a1f1f'); ellipse(g, 0, hy + u * 2.3, u * (.8 + mo * .3), u * (.3 + mo * 1.1)); g.fill(); }
    else if (detail) { g.lineWidth = u * .34; g.beginPath(); g.moveTo(-u * .8, hy + u * 2.2); g.quadraticCurveTo(0, hy + u * 2.9, u * .8, hy + u * 2.2); g.stroke(); }
    if (fine) { g.fillStyle = 'rgba(255,110,120,.28)'; ellipse(g, -u * 2.6, ey + u * 1.4, u * .95, u * .52); g.fill(); ellipse(g, u * 2.6, ey + u * 1.4, u * .95, u * .52); g.fill(); }
  }
  g.restore();
}
