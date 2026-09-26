// The outro: summer, by day. The gym log is exactly as good as it needs to be. It's a toy, and
// a toy is allowed to wash away when summer's done.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, confetti } from '../kit.js';
import { ferrisWheel } from '../world.js';
import { clawd, person, molty, grok, blossom, muse } from '../cast.js';
import { blinkAt } from '../band.js';
import { phone, hand } from '../props.js';
import { gymApp } from './final.js';

// A summer sky and sea; `sunset` 0..1 turns the day gold, then pink, then dusky.
export function beachDay(g, t, o = {}) {
  const ss = o.sunset || 0;
  const hz = o.hz ?? 1000;
  const top = ss < .5 ? mixHex('#5fc6f2', '#ff9a6a', ss * 2) : mixHex('#ff9a6a', '#4a3a8a', (ss - .5) * 2);
  const low = ss < .5 ? mixHex('#c8f0ff', '#ffd08a', ss * 2) : mixHex('#ffd08a', '#ff7a8a', (ss - .5) * 2);
  g.fillStyle = vgrad(g, 0, hz, [[0, top], [1, low]]);
  g.fillRect(0, 0, W, hz + 2);
  // The sun, going down across the outro.
  const sx = o.sunX ?? 780, sy = lerp(260, hz + 40, ss);
  glow(g, sx, sy, 700, ss > .3 ? '#ffb070' : '#fff6d0', .55);
  g.fillStyle = rgrad(g, sx, sy, 0, 90, [[0, '#fffdf0'], [.8, ss > .3 ? '#ffd08a' : '#fff6c8'], [1, ss > .3 ? '#ffb070' : '#ffe9a0']]);
  circle(g, sx, sy, 90); g.fill();
  // Soft clouds.
  for (let i = 0; i < 5; i++) { const cx = ((rnd(i, 801) * 1.4 - .2) * W + t * 8) % (W + 400) - 200, cy = 180 + rnd(i, 802) * 400; g.fillStyle = rgba(ss < .5 ? '#ffffff' : '#ffc0b0', .6); for (let k = 0; k < 5; k++) { circle(g, cx + (k - 2) * 50, cy + Math.sin(k * 2) * 12, 50 + (k % 2) * 16); g.fill(); } }
  // Sea with sun glitter.
  g.fillStyle = vgrad(g, hz, o.sandY ?? 1300, [[0, ss < .5 ? '#2fa8c9' : mixHex('#2fa8c9', '#8a4a7a', (ss - .5) * 2)], [1, ss < .5 ? '#7fdce0' : mixHex('#7fdce0', '#ff9a8a', (ss - .5) * 2)]]);
  g.fillRect(0, hz, W, (o.sandY ?? 1300) - hz);
  for (let i = 0; i < 60; i++) { const x = (rnd(i, 811) * W + t * 20) % W, y = hz + rnd(i, 812) * ((o.sandY ?? 1300) - hz); g.fillStyle = rgba('#ffffff', .35 * (.5 + .5 * Math.sin(t * 4 + i))); g.fillRect(x, y, 30 + 30 * rnd(i, 813), 3); }
  // The pier by day, far off, its wheel turning.
  if (o.pier !== false) {
    g.fillStyle = shade('#6a5a7a', ss * -.3); g.fillRect(-20, hz - 30, 460, 16);
    for (let x = 0; x < 440; x += 36) g.fillRect(x, hz - 16, 6, 30);
    ferrisWheel(g, t, 360, hz - 170, 130, { rot: t * .05, on: ss, frame: '#ffffff' });
  }
  // Sand.
  const sandY = o.sandY ?? 1300;
  g.fillStyle = vgrad(g, sandY, H, [[0, mixHex('#f2d7a2', '#e0a080', ss)], [1, mixHex('#e8c68a', '#9a6a6a', ss)]]);
  g.fillRect(0, sandY, W, H - sandY);
  for (let i = 0; i < 200; i++) { g.fillStyle = rgba('#b08a5a', .15); circle(g, rnd(i, 821) * W, sandY + rnd(i, 822) * (H - sandY), 1.5); g.fill(); }
}

// Surf: a foamy edge at y, advancing with `tide`.
function surf(g, t, y, amp = 1) {
  g.fillStyle = rgba('#ffffff', .85);
  g.beginPath(); g.moveTo(0, y);
  for (let x = 0; x <= W; x += 20) g.lineTo(x, y + Math.sin(x * .02 + t * 2) * 10 * amp + Math.sin(x * .05 - t * 3) * 5);
  g.lineTo(W, y - 40); g.lineTo(0, y - 40); g.closePath(); g.fill();
}

// ---------------------------------------------------------------- 183.7 – 187.7: good for you
export function summerTap(g, t, c) {
  const K = c.K;
  beachDay(g, t, { sunset: 0, sandY: 1250 });
  surf(g, t, 1255);
  // A towel on the sand, a water bottle, flip-flops.
  g.fillStyle = '#ff6a8a'; g.save(); g.translate(540, 1500); g.rotate(-.06); rr(g, -420, -160, 840, 360, 20); g.fill(); g.fillStyle = '#fff'; for (let i = 0; i < 5; i++) g.fillRect(-420 + i * 180, -160, 60, 360); g.restore();
  // Your hand holds the phone up to the sun and taps LOG SET.
  const tap = 185.88;
  phone(g, 540, 930, 440, -.04, (g2, sx, sy, sw, sh) => gymApp(g2, sx, sy, sw, sh, t, { tap }), { glowA: .5 });
  hand(g, 560, 1480, 250, 0, 'hold', { sleeveCol: '#ffd166' });
  const tp = inv(tap - .45, tap, t);
  if (t < tap + .5) hand(g, lerp(900, 640, easeOut(tp)), lerp(1600, 1290, easeOut(tp)), 200, -.4, 'point', { sleeve: false });
  if (t > tap) { confetti(g, t, tap, 540, 1100, { n: 60, spread: 2.4, speed: 1200, seed: 91, life: 2.2, colors: [C.coral, C.gold, '#ff4a3a', '#ffffff'] }); for (let i = 0; i < 6; i++) { const p = inv(tap + i * .08, tap + .9 + i * .08, t); if (p <= 0 || p >= 1) continue; g.save(); g.globalAlpha = 1 - p; g.font = '64px Bricolage'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText('🔥', 380 + i * 70, 1000 - p * 300); g.restore(); } }
  // Clawd in sunglasses, claw up.
  clawd(g, 880, 1640, { s: 220, glasses: true, eyes: 'open', armR: -1.5, armL: -.2, rim: '#fff6d0', smile: 1, hat: 'sun' });
}

// ---------------------------------------------------------------- 187.7 – 190.4: good for that
export function beachBots(g, t, c) {
  const K = c.K;
  beachDay(g, t, { sunset: .08, sandY: 1180 });
  surf(g, t, 1185);
  // Parasol and Muse.
  g.strokeStyle = '#f4f1ea'; g.lineWidth = 10; line(g, 220, 1480, 260, 1000); g.stroke();
  g.fillStyle = '#ff6a8a'; g.beginPath(); g.moveTo(40, 1070); g.quadraticCurveTo(250, 840, 470, 1010); g.closePath(); g.fill();
  g.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(40 + i * 150, 1070 - i * 20); g.quadraticCurveTo(110 + i * 150, 920, 180 + i * 150, 1040 - i * 10); g.lineTo(120 + i * 150, 1050); g.closePath(); g.fill(); }
  muse(g, 230, 1470, { s: 190, t, eyes: 'happy' });
  // Molty and Grok with a beach ball.
  const bt = (t * 1.3) % 2;
  const bx = lerp(520, 900, bt < 1 ? bt : 2 - bt), by = 1180 - Math.sin((bt % 1) * Math.PI) * 300;
  molty(g, 470, 1500, { s: 180, t, eyes: 'happy', clawL: -1.2, clawR: -1.2 });
  grok(g, 930, 1500, { s: 170, arms: false, rim: '#fff6d0' });
  g.save(); g.translate(bx, by); g.rotate(t * 4);
  const cols = ['#ff4a5a', '#ffd166', '#48c6ff', '#ffffff'];
  for (let k = 0; k < 4; k++) { g.fillStyle = cols[k]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 60, k * Math.PI / 2, (k + 1) * Math.PI / 2); g.closePath(); g.fill(); }
  g.restore();
  // Blossom with an ice cream.
  blossom(g, 700, 1640, { s: 160, eyes: 'happy', rim: '#fff6d0' });
  g.save(); g.translate(785, 1470); g.rotate(.2);
  g.fillStyle = '#e8b86a'; poly(g, [[-30, 0], [30, 0], [0, 90]]); g.fill();
  g.fillStyle = '#ffd1e0'; circle(g, 0, -10, 36); g.fill(); g.fillStyle = '#fff4d8'; circle(g, -14, -40, 28); g.fill();
  g.restore();
  // Gulls wheeling.
  for (let i = 0; i < 3; i++) { const gx = (t * 60 + i * 300) % (W + 200) - 100, gy = 300 + i * 80 + Math.sin(t * 2 + i) * 20; g.strokeStyle = '#3a3a4a'; g.lineWidth = 5; g.beginPath(); g.moveTo(gx - 30, gy); g.quadraticCurveTo(gx - 15, gy - 18 - Math.sin(t * 8 + i) * 8, gx, gy); g.quadraticCurveTo(gx + 15, gy - 18 - Math.sin(t * 8 + i) * 8, gx + 30, gy); g.stroke(); }
}

// ---------------------------------------------------------------- sandcastle
function sandcastle(g, x, y, s, wash = 0, t = 0) {
  // wash 0..1: the tide slumping it down.
  const k = 1 - wash;
  if (k <= 0.02) { g.fillStyle = rgba('#d9b07a', .6); ellipse(g, x, y, 220 * s, 30 * s); g.fill(); return; }
  g.save(); g.translate(x, y); g.scale(s, s * (.25 + .75 * k));
  g.fillStyle = '#e2bb7c';
  rr(g, -180, -120, 360, 120, 16); g.fill();
  for (const [tx, tw, th] of [[-150, 70, 220], [0, 110, 300], [150, 70, 220]]) {
    rr(g, tx - tw / 2, -th, tw, th, 10); g.fill();
    for (let k2 = 0; k2 < 3; k2++) rr(g, tx - tw / 2 + k2 * tw / 3 + 4, -th - 22, tw / 3 - 8, 26, 4), g.fill();
  }
  g.fillStyle = 'rgba(160,110,60,.35)'; rr(g, -30, -80, 60, 80, 30); g.fill();
  g.fillStyle = 'rgba(255,240,210,.35)'; g.fillRect(-180, -120, 360, 10);
  // A little flag with a flame.
  g.strokeStyle = '#6a4a2a'; g.lineWidth = 5; line(g, 0, -320, 0, -430); g.stroke();
  g.fillStyle = '#ff6a4a'; poly(g, [[0, -430], [70, -410], [0, -390]]); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- 190.4 – 193.26: just a toy
export function toyShot(g, t, c) {
  const K = c.K;
  beachDay(g, t, { sunset: .2, sandY: 1150 });
  surf(g, t, 1155);
  const built = easeOut(inv(190.3, 192.3, t));
  sandcastle(g, 540, 1420, .8 + .2 * built, 0, t);
  // Bucket and spade.
  g.fillStyle = '#48c6ff'; poly(g, [[140, 1340], [260, 1340], [240, 1480], [160, 1480]]); g.fill();
  g.strokeStyle = '#2a8ab0'; g.lineWidth = 6; g.beginPath(); g.arc(200, 1340, 60, Math.PI, 0); g.stroke();
  const dig = Math.sin(t * 9);
  clawd(g, 850, 1540, { s: 240, eyes: 'happy', hat: 'sun', armL: -.8 + dig * .4, armR: -.2, rim: '#fff6d0', holdL: (g2, u) => { g2.save(); g2.rotate(.6 + dig * .3); g2.fillStyle = '#ff4a5a'; rr(g2, -u * .15, -u * 2.2, u * .3, u * 2, u * .1); g2.fill(); g2.fillStyle = '#ffd166'; rr(g2, -u * .5, -u * 2.9, u, u * .9, u * .2); g2.fill(); g2.restore(); }, smile: 1, blush: .6 });
  // Sand flicking up.
  for (let i = 0; i < 8; i++) { const p = ((t * 2 + i * .13) % 1); g.fillStyle = rgba('#d9a860', 1 - p); circle(g, 750 - p * 120 + i * 6, 1420 - Math.sin(p * Math.PI) * 120, 6); g.fill(); }
}

// ---------------------------------------------------------------- 193.26 – end: when summer's done
export function tideShot(g, t, c) {
  const K = c.K;
  const ss = smooth(inv(193.2, 199.5, t));
  beachDay(g, t, { sunset: .25 + .75 * ss, sandY: 1150, sunX: 560 });
  // The tide creeps up the sand and takes the castle, gently.
  const tide = smooth(inv(195.2, 197.8, t));
  const surfY = lerp(1160, 1560, tide);
  sandcastle(g, 540, 1440, 1, smooth(inv(196.6, 198.2, t)), t);
  // Wet sand shine where the water has been.
  g.fillStyle = rgba('#ffffff', .12 * tide); g.fillRect(0, 1150, W, surfY - 1150);
  g.fillStyle = vgrad(g, 1150, surfY, [[0, rgba(mixHex('#7fdce0', '#ff9a8a', ss), .9)], [1, rgba(mixHex('#bff0ee', '#ffc0b0', ss), .6)]]);
  g.fillRect(0, 1150, W, surfY - 1150);
  surf(g, t, surfY, 1.4);
  // Leaves on the wind: summer's end.
  for (let i = 0; i < 10; i++) { const lt = t - 195 - i * .25; if (lt < 0) continue; const x = -60 + lt * (200 + 40 * rnd(i, 831)), y = 700 + i * 60 + Math.sin(lt * 3 + i) * 60; g.save(); g.translate(x, y); g.rotate(lt * 3 + i); g.fillStyle = ['#e0703a', '#f2a640', '#c9502a'][i % 3]; ellipse(g, 0, 0, 22, 10); g.fill(); g.restore(); }
  // Clawd waves goodbye to it, perfectly happy; the bots beside.
  const wave = Math.sin(t * 7) * .5;
  muse(g, 170, 1640, { s: 160, t, eyes: 'happy', rim: '#ffb070' });
  molty(g, 330, 1650, { s: 150, t, eyes: 'happy', clawR: -1 - wave, rim: '#ffb070' });
  clawd(g, 820, 1660, { s: 260, eyes: 'happy', armL: -.3, armR: -1.9 + wave, rim: '#ffb070', rimSide: -1, smile: 1, blush: .8 });
}
