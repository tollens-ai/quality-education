// Verse 2: a row of beach huts on the promenade at night. Each line opens a door on someone
// else, and what "good" means for them. The camera slides one hut along per line.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeInOut, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, confetti, firework } from '../kit.js';
import { nightSky, sea, town, reflection, ferrisWheel } from '../world.js';
import { clawd, person, molty, grok, blossom, muse, SKINS } from '../cast.js';
import { blinkAt } from '../band.js';
import { phone, laptop, hand, padlock, paper, guideDog } from '../props.js';
import { wordTimes } from './stage.js';

export const HUT_COLS = ['#c9b3ff', '#9fe3c8', '#ffe08a', '#9fd4ff', '#ffb3c7', '#ffab91', '#7fdad0', '#ff9a6a'];
export const HUT_X = i => 540 + i * 900;          // hut centres along the promenade (world x)
const BASE = 1420;                                  // promenade level

// The line start times of verse 2, one per hut.
export const V2 = [51.0, 53.38, 56.1, 58.44, 61.64, 64.32, 66.98, 69.74];

// People of verse 2 (also used later in the crowd and the bridge).
export const PEOPLE = {
  demo: { skin: '#e8b48f', hairStyle: 'short', hair: '#1b1b24', top: '#1a1a22', glasses: 'round' },
  baker: { skin: '#c98d67', hairStyle: 'bun', hair: '#2a1c18', top: '#f2efe6' },
  chat1: { skin: '#f6d0b1', hairStyle: 'curly', hair: '#c46a2a', top: '#48a0ff' },
  chat2: { skin: '#7c4a32', hairStyle: 'short', hair: '#111', top: '#ff7a59' },
  chat3: { skin: '#e8b48f', hairStyle: 'long', hair: '#3a2418', top: '#7ad37a' },
  student: { skin: '#f6d0b1', hairStyle: 'beanie', hatColor: '#3a8f6a', top: '#e0495d' },
  nana: { skin: '#f6d0b1', hairStyle: 'grey', top: '#b06bff', glasses: 'round' },
  blind: { skin: '#a86b4a', hairStyle: 'short', hair: '#1b1b24', top: '#2fbf8f', glasses: 'dark' },
};

// ---------------------------------------------------------------- the promenade backdrop
function backdrop(g, t, camX) {
  const hz = 1000;
  nightSky(g, t, { horizon: hz, clouds: .6 });
  // The pier far off, twinkling, parallaxing slowly.
  const px = 300 - camX * .08;
  g.fillStyle = '#1a1030'; g.fillRect(px - 400, hz - 18, 900, 10);
  for (let i = 0; i < 40; i++) bulb(g, px - 390 + i * 22, hz - 24, 2.4, i % 3 ? C.bulb : C.pink, .6 + .4 * Math.sin(t * 3 + i));
  ferrisWheel(g, t, px + 380, hz - 120, 110, { rot: t * .05, on: .9 });
  town(g, t, hz, { on: .9 });
  sea(g, t, hz, { reflections: [{ x: 860, col: C.moon, w: 26, a: .45 }, { x: px + 380, col: C.pink, w: 20, a: .35 }, { x: px, col: C.bulb, w: 30, a: .3 }] });
  // Sand and the promenade.
  g.fillStyle = vgrad(g, BASE - 40, H, [[0, '#4a3a5a'], [.3, '#2a1f38'], [1, '#140e1c']]);
  g.fillRect(0, BASE - 40, W, H - BASE + 40);
  g.fillStyle = vgrad(g, BASE, BASE + 180, [[0, '#6a5a78'], [1, '#3a2f48']]);
  g.fillRect(0, BASE, W, 180);
  g.strokeStyle = 'rgba(20,12,30,.35)'; g.lineWidth = 2;
  for (let i = -2; i < 16; i++) { const x = ((i * 120 - camX) % 1200 + 1200) % 1200 - 60; line(g, x, BASE, x - 40, BASE + 180); g.stroke(); }
}

// One hut at screen x (centre), with its doors opening by `open` 0..1 and `inside` drawn in the opening.
function hut(g, t, x, i, open, inside, o = {}) {
  const w = 720, hH = 660, roof = 250;
  const col = HUT_COLS[i];
  const y0 = BASE - hH;
  // Shadow.
  g.fillStyle = 'rgba(0,0,10,.35)'; ellipse(g, x, BASE + 10, w * .6, 30); g.fill();
  // Walls: painted planks, moonlit from the right.
  g.fillStyle = lgrad(g, x - w / 2, 0, x + w / 2, 0, [[0, shade(col, -.42)], [.5, shade(col, -.28)], [1, shade(col, -.16)]]);
  g.fillRect(x - w / 2, y0, w, hH);
  g.strokeStyle = rgba(shade(col, -.6), .35); g.lineWidth = 3;
  for (let k = 1; k < 12; k++) { const px = x - w / 2 + k * w / 12; line(g, px, y0, px, BASE); g.stroke(); }
  // Roof.
  g.fillStyle = lgrad(g, x - w * .6, 0, x + w * .6, 0, [[0, '#2a2038'], [1, '#4a3a5a']]);
  poly(g, [[x - w * .58, y0 + 10], [x, y0 - roof], [x + w * .58, y0 + 10]]); g.fill();
  g.strokeStyle = shade(col, .1); g.lineWidth = 16; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - w * .58, y0 + 10); g.lineTo(x, y0 - roof); g.lineTo(x + w * .58, y0 + 10); g.stroke();
  // The doorway.
  const dw = 500, dh = 540, dx = x - dw / 2, dy = BASE - dh;
  g.fillStyle = '#120a1a'; g.fillRect(dx, dy, dw, dh);
  if (open > 0 && inside) {
    g.save(); g.beginPath(); g.rect(dx, dy, dw, dh); g.clip();
    // Warm interior light.
    g.fillStyle = vgrad(g, dy, BASE, [[0, '#3a2a30'], [1, '#1f1418']]); g.fillRect(dx, dy, dw, dh);
    glow(g, x, dy + dh * .35, dw * .9, C.amber, .55 * open);
    inside(g, t, x, dy, dw, dh, open);
    g.restore();
    // Light spilling onto the promenade.
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = lgrad(g, 0, BASE, 0, BASE + 260, [[0, rgba(C.amber, .35 * open)], [1, rgba(C.amber, 0)]]);
    poly(g, [[dx, BASE], [dx + dw, BASE], [dx + dw + 140, BASE + 260], [dx - 140, BASE + 260]]); g.fill();
    g.restore();
  }
  // Doors hinged at the doorway's edges, swinging out until they lie against the walls.
  const th = easeOutBack(open, 1.3) * Math.PI * .92;
  for (const s of [-1, 1]) {
    const hinge = s < 0 ? dx : dx + dw;
    const free = hinge - s * (dw / 2) * Math.cos(th) * -1 * -1;
    const fx = s < 0 ? dx + (dw / 2) * Math.cos(th) : dx + dw - (dw / 2) * Math.cos(th);
    const a = Math.min(hinge, fx), b = Math.max(hinge, fx);
    const pw = b - a;
    if (pw < 1) continue;
    const back = th > Math.PI / 2;
    // A panel swung toward us looks a little taller at its free edge.
    const grow = Math.sin(th) * 26;
    g.fillStyle = back ? lgrad(g, a, 0, b, 0, s < 0 ? [[0, shade(col, -.35)], [1, shade(col, -.2)]] : [[0, shade(col, -.2)], [1, shade(col, -.35)]]) : lgrad(g, a, 0, b, 0, [[0, shade(col, -.08)], [1, shade(col, -.22)]]);
    g.beginPath();
    if (s < 0) { g.moveTo(hinge, dy); g.lineTo(fx, dy - grow); g.lineTo(fx, BASE + grow * .3); g.lineTo(hinge, BASE); }
    else { g.moveTo(hinge, dy); g.lineTo(fx, dy - grow); g.lineTo(fx, BASE + grow * .3); g.lineTo(hinge, BASE); }
    g.closePath(); g.fill();
    g.strokeStyle = rgba(shade(col, -.5), .4); g.lineWidth = 3;
    for (let k = 1; k < 4; k++) { const lx2 = lerp(hinge, fx, k / 4); line(g, lx2, dy + 10 - grow * k / 4, lx2, BASE - 10 + grow * .3 * k / 4); g.stroke(); }
    if (!back) { g.fillStyle = C.gold; circle(g, lerp(hinge, fx, .9), dy + dh * .5, 7); g.fill(); }
    // The hut's number, painted on the left door like an advent calendar.
    if (s < 0 && !back && pw > 60) {
      g.save(); g.translate(lerp(hinge, fx, .5), dy + dh * .3); g.scale(pw / (dw / 2), 1);
      g.fillStyle = '#fff8ee'; circle(g, 0, 0, 58); g.fill();
      g.fillStyle = shade(col, -.45); g.font = '800 76px Bricolage'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), 0, 4);
      g.restore();
    }
  }
  // Door frame.
  g.strokeStyle = '#f4ead8'; g.lineWidth = 14; g.strokeRect(dx - 7, dy - 7, dw + 14, dh + 7);
  // A lantern by the door.
  glow(g, x + w / 2 - 50, y0 + 70, 120, C.amber, .5);
  g.fillStyle = '#ffe2a8'; rr(g, x + w / 2 - 66, y0 + 44, 32, 50, 8); g.fill();
}

// Bunting strung between huts.
function bunting(g, t, x1, x2, y) {
  g.strokeStyle = 'rgba(240,230,255,.4)'; g.lineWidth = 2;
  const sag = 60;
  g.beginPath(); for (let k = 0; k <= 20; k++) { const p = k / 20; const x = lerp(x1, x2, p), yy = y + Math.sin(p * Math.PI) * sag; k ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke();
  const cols = [C.pink, C.gold, C.cyan, '#ffffff', C.coral];
  for (let k = 1; k < 10; k++) {
    const p = k / 10; const x = lerp(x1, x2, p), yy = y + Math.sin(p * Math.PI) * sag;
    g.fillStyle = cols[k % cols.length];
    const sw = Math.sin(t * 3 + k) * 4;
    poly(g, [[x - 16, yy], [x + 16, yy], [x + sw, yy + 40]]); g.fill();
  }
}

// ---------------------------------------------------------------- interiors
const INSIDE = [
  // 1. Product demo: wow them fast.
  (g, t, x, dy, dw, dh, open, T) => {
    const [tPD, , tWow] = [T[0], T[1], T[2]];
    // Big screen with a slick app.
    g.fillStyle = '#0c0a18'; rr(g, x - 210, dy + 50, 420, 250, 14); g.fill();
    const lg = lgrad(g, x - 200, dy + 60, x + 200, dy + 290, [[0, '#6a4bff'], [.5, '#ff4fa3'], [1, '#ffb13b']]);
    g.fillStyle = lg; rr(g, x - 200, dy + 60, 400, 230, 10); g.fill();
    g.fillStyle = '#fff'; g.font = '800 46px Bricolage'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LAUNCH', x, dy + 150);
    g.font = '600 24px Bricolage'; g.fillText('it’s live ✨', x, dy + 200);
    glow(g, x, dy + 175, 300, '#ff9ad0', .35);
    // Founder with clicker, arm up.
    person(g, x - 90, dy + dh + 10, { s: 150, ...PEOPLE.demo, armR: -2.3, armL: .3, eyes: t > tWow ? 'happy' : 'open', mouth: .4 + .3 * Math.sin(t * 9) });
    // A tiny audience, wowed on "wow".
    for (let k = 0; k < 4; k++) {
      const ax = x - 150 + k * 100, ay = dy + dh + 60;
      g.fillStyle = '#1a1024'; circle(g, ax, ay - 70, 40); g.fill(); rr(g, ax - 55, ay - 40, 110, 80, 30); g.fill();
      if (t > tWow) { g.fillStyle = C.gold; star(g, ax - 14, ay - 76, 12, 5); g.fill(); star(g, ax + 14, ay - 76, 12, 5); g.fill(); }
    }
    if (t > tWow) for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; const p = inv(tWow, tWow + .8, t); g.fillStyle = rgba(k % 2 ? C.gold : '#fff', 1 - p); star(g, x + Math.cos(a) * (60 + p * 260), dy + 175 + Math.sin(a) * (40 + p * 180), 14, 6); g.fill(); }
  },
  // 2. Paying users: make it last.
  (g, t, x, dy, dw, dh, open, T) => {
    const tLast = T[4] ?? T[T.length - 1];
    // Shelves of bread.
    for (let r = 0; r < 2; r++) { g.fillStyle = '#6a4030'; g.fillRect(x - 230, dy + 90 + r * 90, 460, 12); for (let k = 0; k < 6; k++) { g.fillStyle = shade('#d99a4e', (k % 3) * -.1); ellipse(g, x - 190 + k * 76, dy + 70 + r * 90, 32, 22); g.fill(); g.strokeStyle = 'rgba(120,60,20,.5)'; g.lineWidth = 3; line(g, x - 205 + k * 76, dy + 64 + r * 90, x - 180 + k * 76, dy + 76 + r * 90); g.stroke(); } }
    for (let k = 0; k < 4; k++) { const sp = ((t * .5 + k * .25) % 1); g.strokeStyle = rgba('#ffffff', .25 * (1 - sp)); g.lineWidth = 5; g.beginPath(); g.moveTo(x - 150 + k * 90, dy + 160 - sp * 60); g.quadraticCurveTo(x - 140 + k * 90 + Math.sin(t * 3 + k) * 12, dy + 130 - sp * 60, x - 150 + k * 90, dy + 100 - sp * 60); g.stroke(); }
    // A wall calendar flipping through the years.
    const flips = Math.min(83, Math.floor(Math.max(0, (t - (T[2] ?? T[0])) * 9)));
    const year = 2025 + Math.floor(flips / 12), month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][flips % 12];
    g.fillStyle = '#fffaf0'; rr(g, x + 150, dy + 250, 110, 120, 8); g.fill();
    g.fillStyle = '#e0495d'; rr(g, x + 150, dy + 250, 110, 34, 8); g.fill();
    g.fillStyle = '#fff'; g.font = '800 20px Bricolage'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(month, x + 205, dy + 268);
    g.fillStyle = '#2a2038'; g.font = '800 30px Bricolage'; g.fillText(String(year), x + 205, dy + 322);
    // Baker behind the counter with the card reader.
    person(g, x - 60, dy + dh - 60, { s: 140, ...PEOPLE.baker, armR: -.9, eyes: 'happy', torso: (g2, u, by, th) => { g2.fillStyle = '#ffffff'; rr(g2, -u * 3.4, by - th + u * 3, u * 6.8, th, u * 1.5); g2.fill(); } });
    g.fillStyle = vgrad(g, dy + dh - 120, dy + dh, [[0, '#8a5a3a'], [1, '#5a3a24']]); g.fillRect(x - 250, dy + dh - 120, 500, 120);
    // The till app: still green, still working.
    g.fillStyle = '#1a1a24'; rr(g, x + 40, dy + dh - 190, 130, 90, 10); g.fill();
    g.fillStyle = '#2fbf6f'; rr(g, x + 50, dy + dh - 180, 110, 70, 6); g.fill();
    g.fillStyle = '#fff'; g.font = '800 30px Bricolage'; g.fillText('✓', x + 105, dy + dh - 145);
    if (t > tLast) glow(g, x + 105, dy + dh - 145, 90, '#6dff9a', .5 * (.5 + .5 * Math.sin(t * 6)));
  },
  // 3. Group chat bot: just make 'em laugh.
  (g, t, x, dy, dw, dh, open, T) => {
    const tLaugh = T[5] ?? T[T.length - 1];
    const laugh = t > tLaugh - .1;
    // A big chat bubble with the bot's joke.
    g.fillStyle = 'rgba(255,255,255,.95)'; rr(g, x - 200, dy + 50, 400, 150, 30); g.fill();
    g.fillStyle = '#6dd36d'; circle(g, x - 150, dy + 125, 36); g.fill();
    g.fillStyle = '#fff'; circle(g, x - 162, dy + 115, 9); g.fill(); circle(g, x - 138, dy + 115, 9); g.fill();
    g.fillStyle = '#111'; circle(g, x - 160, dy + 116, 4); g.fill(); circle(g, x - 136, dy + 116, 4); g.fill();
    g.fillStyle = '#2a2038'; g.font = '800 34px Bricolage'; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText('ba-dum-tss', x - 96, dy + 108);
    g.font = '600 24px Bricolage'; g.fillStyle = '#8a8298'; g.fillText('joke bot', x - 96, dy + 150);
    // Three friends on a bench; they crack up.
    const bob = laugh ? Math.abs(Math.sin(t * 16)) * 10 : 0;
    person(g, x - 150, dy + dh + 20 - bob, { s: 115, ...PEOPLE.chat1, eyes: laugh ? 'closed' : 'open', mouth: laugh ? .9 : 0, lean: laugh ? -.15 : 0, armL: -.4 });
    person(g, x, dy + dh + 20 - bob, { s: 120, ...PEOPLE.chat2, eyes: laugh ? 'closed' : 'open', mouth: laugh ? 1 : 0 });
    person(g, x + 150, dy + dh + 20 - bob, { s: 112, ...PEOPLE.chat3, eyes: laugh ? 'closed' : 'open', mouth: laugh ? .8 : 0, lean: laugh ? .25 : 0 });
    // Laughing faces float up.
    if (laugh) for (let k = 0; k < 10; k++) { const p = ((t - tLaugh) * .8 + k * .1) % 1; const ex = x - 200 + k * 45, ey = dy + dh - 120 - p * 330; g.save(); g.globalAlpha = 1 - p; g.fillStyle = '#ffd23a'; circle(g, ex, ey, 22); g.fill(); g.strokeStyle = '#6a3a00'; g.lineWidth = 3; g.beginPath(); g.arc(ex, ey + 2, 12, .1, Math.PI - .1); g.stroke(); g.fillStyle = '#7fd6ff'; ellipse(g, ex - 14, ey - 2, 5, 8); g.fill(); ellipse(g, ex + 14, ey - 2, 5, 8); g.fill(); g.restore(); }
  },
  // 4. Uni project: make it pass.
  (g, t, x, dy, dw, dh, open, T) => {
    const tPass = T[5] ?? T[T.length - 1];
    // Desk lamp, a clock at 2:59, coffee cups.
    g.fillStyle = '#fffaf0'; circle(g, x + 170, dy + 90, 50); g.fill();
    g.strokeStyle = '#2a2038'; g.lineWidth = 5; line(g, x + 170, dy + 90, x + 170, dy + 58); g.stroke(); line(g, x + 170, dy + 90, x + 150, dy + 96); g.stroke();
    g.fillStyle = '#fff'; g.font = '700 20px Mono'; g.textAlign = 'center'; g.fillText('DUE 9AM', x - 150, dy + 80);
    g.fillStyle = '#ffe36b'; rr(g, x - 215, dy + 55, 130, 60, 4); g.fill(); g.fillStyle = '#2a2038'; g.fillText('DUE 9AM', x - 150, dy + 90);
    for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? '#f4ead8' : '#e8dcc6'; rr(g, x + 110 + (k % 3) * 34, dy + dh - 190 - Math.floor(k / 3) * 58, 30, 52, 6); g.fill(); }
    // Student at the laptop.
    const done = t > tPass;
    const tap = done ? 0 : Math.sin(t * 38) * .18;
    person(g, x - 40, dy + dh + 10, { s: 130, ...PEOPLE.student, eyes: done ? 'closed' : 'wide', armR: done ? -2.6 : -.5 + tap, armL: done ? -2.6 : -.5 - tap, mouth: done ? .8 : 0 });
    g.fillStyle = vgrad(g, dy + dh - 130, dy + dh, [[0, '#6a5040'], [1, '#3a2a20']]); g.fillRect(x - 250, dy + dh - 130, 500, 130);
    g.fillStyle = '#2b2940'; rr(g, x - 120, dy + dh - 230, 190, 110, 8); g.fill();
    g.fillStyle = '#bfe0ff'; rr(g, x - 112, dy + dh - 222, 174, 94, 5); g.fill();
    g.fillStyle = '#2f7bff'; rr(g, x - 70, dy + dh - 190, 90, 32, 8); g.fill();
    g.fillStyle = '#fff'; g.font = '800 18px Bricolage'; g.fillText('SUBMIT', x - 25, dy + dh - 169);
    // The stamp.
    if (t > tPass - .2) {
      const p = inv(tPass - .2, tPass, t);
      const s = lerp(2.4, 1, easeIn(p));
      g.save(); g.translate(x + 20, dy + 250); g.rotate(-.18); g.scale(s, s); g.globalAlpha = clamp(p * 2);
      g.strokeStyle = '#e0304a'; g.lineWidth = 10; rr(g, -130, -55, 260, 110, 16); g.stroke();
      g.fillStyle = '#e0304a'; g.font = '800 84px Bricolage'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PASS', 0, 6);
      g.restore();
    }
  },
  // 5. Nana's phone: let's keep it sweet.
  (g, t, x, dy, dw, dh, open, T) => {
    const tSweet = T[5] ?? T[T.length - 1];
    // Floral wallpaper, a framed photo.
    for (let k = 0; k < 18; k++) { g.fillStyle = rgba('#ffb3c7', .25); circle(g, x - 230 + (k % 6) * 92, dy + 40 + Math.floor(k / 6) * 90, 14); g.fill(); }
    g.fillStyle = '#c9a15a'; rr(g, x + 110, dy + 60, 110, 90, 6); g.fill(); g.fillStyle = '#9fd4ff'; rr(g, x + 120, dy + 70, 90, 70, 4); g.fill();
    // Armchair, rocking gently.
    g.save(); g.translate(x, dy + dh); g.rotate(Math.sin(t * 2.2) * .035); g.translate(-x, -(dy + dh));
    g.fillStyle = vgrad(g, dy + 200, dy + dh, [[0, '#d9607a'], [1, '#8a2f45']]);
    rr(g, x - 210, dy + 200, 420, dh - 150, 60); g.fill();
    // Nana, the cat on her lap, the one-button phone.
    person(g, x, dy + dh - 20, { s: 140, ...PEOPLE.nana, eyes: t > tSweet ? 'happy' : 'open', armR: -1.2, torso: (g2, u, by, th) => { g2.fillStyle = '#f7e3a6'; rr(g2, -u * 6, by - th * .45, u * 12, th * .5, u * 2); g2.fill(); } });
    g.fillStyle = '#e8a04a'; ellipse(g, x - 60, dy + dh - 60, 70, 34); g.fill(); circle(g, x - 120, dy + dh - 80, 26); g.fill();
    g.beginPath(); g.moveTo(x - 138, dy + dh - 100); g.lineTo(x - 130, dy + dh - 124); g.lineTo(x - 118, dy + dh - 104); g.fill();
    g.beginPath(); g.moveTo(x - 110, dy + dh - 102); g.lineTo(x - 100, dy + dh - 124); g.lineTo(x - 94, dy + dh - 98); g.fill();
    g.strokeStyle = '#6a3a10'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 130, dy + dh - 78); g.quadraticCurveTo(x - 124, dy + dh - 72, x - 118, dy + dh - 78); g.stroke();
    const px = x + 120, py = dy + 250;
    phone(g, px, py, 120, .12, (g2, sx, sy, sw, sh) => {
      g2.fillStyle = '#fffaf0'; g2.fillRect(sx, sy, sw, sh);
      g2.fillStyle = '#2fbf6f'; rr(g2, sx + sw * .1, sy + sh * .3, sw * .8, sh * .4, sw * .12); g2.fill();
      g2.fillStyle = '#fff'; g2.font = `800 ${sw * .22}px Bricolage`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText('Sam', sx + sw / 2, sy + sh * .5);
    }, { glowA: .8 });
    g.restore();
    if (t > tSweet - .3) for (let k = 0; k < 5; k++) { const p = ((t - tSweet + .3) * .6 + k * .2) % 1; g.fillStyle = rgba(C.pink, 1 - p); heart(g, x + 60 + k * 30 + Math.sin(p * 6 + k) * 10, dy + 200 - p * 200, 30); g.fill(); }
    // Tea, steaming.
    g.fillStyle = '#fffaf0'; rr(g, x + 170, dy + dh - 150, 60, 50, 10); g.fill();
    for (let k = 0; k < 3; k++) { g.strokeStyle = rgba('#ffffff', .3); g.lineWidth = 4; g.beginPath(); g.moveTo(x + 185 + k * 15, dy + dh - 160); g.bezierCurveTo(x + 175 + k * 15, dy + dh - 190, x + 200 + k * 15, dy + dh - 200 + Math.sin(t * 3 + k) * 6, x + 188 + k * 15, dy + dh - 230); g.stroke(); }
  },
  // 6. Can't see screens: it needs to speak.
  (g, t, x, dy, dw, dh, open, T) => {
    const tSpeak = T[5] ?? T[T.length - 1];
    // The guide dog, lying down, tail going.
    guideDog(g, x + 110, dy + dh - 10, 200, t);
    // The person, phone at their ear, cane resting.
    g.strokeStyle = '#f4f1ea'; g.lineWidth = 9; line(g, x - 200, dy + dh, x - 120, dy + 180); g.stroke();
    g.strokeStyle = '#e0304a'; g.lineWidth = 9; line(g, x - 200, dy + dh, x - 185, dy + dh - 40); g.stroke();
    person(g, x - 30, dy + dh + 10, { s: 140, ...PEOPLE.blind, eyes: 'open', armR: -2.9, armLenR: .8, mouth: t > tSpeak + .3 ? .1 : 0, extra: (g2, u, hy, hr) => { g2.fillStyle = '#fff'; circle(g2, hr * 1.02, hy + u * .6, u * .8); g2.fill(); } });
    // Speech, as light.
    const sp = t > tSpeak - .15;
    const cx = x + 60, cy = dy + 170;
    for (let k = 0; k < 4; k++) { const p = ((t * .9) + k * .25) % 1; if (!sp && k > 0) continue; g.strokeStyle = rgba(C.cyan, (1 - p) * (sp ? .8 : .3)); g.lineWidth = 6; g.beginPath(); g.arc(cx - 60, cy + 30, 40 + p * 180, -1, .4); g.stroke(); }
    if (sp) {
      g.fillStyle = rgba('#e8fbff', .95); rr(g, cx - 40, cy - 100, 250, 100, 30); g.fill();
      g.fillStyle = '#123'; g.font = '700 26px Bricolage'; g.textAlign = 'left'; g.textBaseline = 'middle';
      const msg = 'Bus in 2 minutes'.slice(0, Math.floor((t - tSpeak + .15) * 30));
      g.fillText(msg, cx - 20, cy - 62);
      g.fillStyle = C.cyan; for (let k = 0; k < 14; k++) { const h2 = 6 + Math.abs(Math.sin(t * 20 + k * .9)) * 22; rr(g, cx - 20 + k * 14, cy - 34 - h2 / 2 + 8, 8, h2, 3); g.fill(); }
    }
  },
  // 7. Agent bots: no data leak.
  (g, t, x, dy, dw, dh, open, T) => {
    const tLeak = T[3] ?? T[T.length - 1];
    // A wall of lockers, each with a face: the people whose data it is.
    const faces = [PEOPLE.demo, PEOPLE.baker, PEOPLE.chat1, PEOPLE.student, PEOPLE.nana, PEOPLE.blind, PEOPLE.chat2, PEOPLE.chat3];
    for (let k = 0; k < 8; k++) {
      const lx = x - 220 + (k % 4) * 112, ly = dy + 40 + Math.floor(k / 4) * 150;
      g.fillStyle = '#4a5a78'; rr(g, lx, ly, 100, 136, 8); g.fill();
      g.fillStyle = '#2a3450'; rr(g, lx + 8, ly + 8, 84, 84, 6); g.fill();
      g.save(); g.beginPath(); g.rect(lx + 8, ly + 8, 84, 84); g.clip();
      g.fillStyle = shade(HUT_COLS[k], -.1); g.fillRect(lx + 8, ly + 8, 84, 84);
      person(g, lx + 50, ly + 112, { s: 44, ...faces[k], eyes: 'happy', still: true });
      g.restore();
      padlock(g, lx + 50, ly + 116, 30, 0);
      if (t > tLeak) glow(g, lx + 50, ly + 112, 40, '#6dff9a', .35);
    }
    // The hatch: a bot asks, gets the one thing it needs.
    g.fillStyle = vgrad(g, dy + 360, dy + dh, [[0, '#6a5040'], [1, '#3a2a20']]); g.fillRect(x - 250, dy + 380, 500, dh - 380);
    const hand2 = inv(T[1] ?? T[0], (T[1] ?? T[0]) + .6, t);
    grok(g, x - 110, dy + dh + 20, { s: 120, arms: false, rim: C.cyan });
    blossom(g, x + 110, dy + dh + 30, { s: 115, eyes: t > tLeak ? 'happy' : 'open', rim: C.pink });
    // The public card handed over the counter.
    g.save(); g.translate(lerp(x + 40, x + 90, hand2), dy + 400); g.rotate(-.1);
    g.fillStyle = '#fffaf0'; rr(g, -70, -40, 140, 80, 8); g.fill();
    g.fillStyle = '#2a2038'; g.font = '700 20px Mono'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('open 9–5', 0, -8); g.fillText('menu.pdf', 0, 18);
    g.restore();
  },
  // 8. For us: keep diags neat.
  (g, t, x, dy, dw, dh, open, T) => {
    const tNeat = T[5] ?? T[T.length - 1];
    // A tidy diagnostics panel.
    g.fillStyle = '#0f0e17'; rr(g, x - 220, dy + 40, 440, 280, 14); g.fill();
    const rows = [['✓', 'build', '1.2s', '#6dff9a'], ['✓', 'tests', '42/42', '#6dff9a'], ['✓', 'deploy', 'ok', '#6dff9a'], ['✖', 'gym_log:42', 'weight is undefined', '#ff6a7a'], ['→', 'expected', 'kg, got ""', '#ffd166']];
    rows.forEach(([ic, a, b, col], k) => {
      const ry = dy + 85 + k * 50;
      const p = clamp((t - (T[0] + k * .18)) / .2);
      g.globalAlpha = p;
      g.fillStyle = col; g.font = '800 26px Mono'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(ic, x - 195, ry);
      g.fillStyle = '#e8e4f4'; g.font = '600 22px Mono'; g.fillText(a, x - 160, ry);
      g.fillStyle = rgba(col, .9); g.fillText(b, x - 160 + g.measureText(a + ' ').width + 10, ry);
      g.globalAlpha = 1;
    });
    if (t > tNeat) glow(g, x, dy + 180, 300, '#9fffc8', .2);
    // The builders: Clawd and the band.
    molty(g, x - 170, dy + dh + 20, { s: 120, t, eyes: 'happy', clawL: -1, rim: C.cyan });
    clawd(g, x, dy + dh + 30, { s: 190, eyes: t > tNeat ? 'happy' : 'open', look: [0, -1], armR: -1.3, armL: -.2, smile: 1, rim: C.amber });
    muse(g, x + 175, dy + dh + 20, { s: 110, t, eyes: 'happy' });
  },
];

// ---------------------------------------------------------------- the verse 2 shot
// Slides one hut to the next on each line; the current hut's doors open on the line's first word.
export function hutsShot(g, t, c) {
  let idx = 0;
  for (let i = 0; i < V2.length; i++) if (t >= V2[i] - .02) idx = i;
  const slide = .5;
  const prevX = HUT_X(Math.max(0, idx - 1)), curX = HUT_X(idx);
  const sp = idx === 0 ? 1 : easeInOut(inv(V2[idx] - .12, V2[idx] - .12 + slide, t));
  const camX = lerp(prevX, curX, sp) - 540;
  // Close on the doorway so each person fills the frame, easing in as the line goes on.
  const lineP = inv(V2[idx], V2[idx + 1] ?? 72.48, t);
  const z = 1.62 + .1 * smooth(lineP);
  g.save();
  g.translate(540, 1080); g.scale(z, z); g.translate(-540, -(BASE - 270));
  backdrop(g, t, camX);
  for (let i = 0; i < 8; i++) {
    const sx = HUT_X(i) - camX;
    if (sx < -900 || sx > W + 900) continue;
    const T = wordTimes(V2[i]).map(w => w.s);
    const open = i < idx ? 1 : i === idx ? easeOut(inv(V2[i] + .02, V2[i] + .38, t)) : 0;
    hut(g, t, sx, i, open, (g2, t2, x, dy, dw, dh, op) => INSIDE[i](g2, t2, x, dy, dw, dh, op, T));
    if (i < 7) bunting(g, t, sx + 360, sx + 540, BASE - 640);
  }
  g.restore();
}

// ---------------------------------------------------------------- 72.48 – 76.54: everyone, all at once
export function hutsWide(g, t, c) {
  const K = c.K;
  // Pull back and glide down the whole row: every door open, everyone out waving.
  const pull = easeOut(inv(72.48, 73.4, t));
  const z = lerp(1.62, .56, pull);
  const pan = easeInOut(inv(72.9, 76.4, t));
  const focus = lerp(HUT_X(7), HUT_X(0), pan);
  const camX = focus - 540;
  // Backdrop and huts share the promenade line; the huts shrink faster, so the sky opens up.
  const baseY = lerp(1080 + 270 * 1.62, BASE, pull);
  const zb = lerp(1.62, 1, pull);
  g.save();
  g.translate(540, baseY); g.scale(zb, zb); g.translate(-540, -BASE);
  backdrop(g, t, camX * .3);
  g.restore();
  g.save();
  g.translate(540, baseY); g.scale(z, z); g.translate(-540, -BASE);
  for (let i = 0; i < 8; i++) {
    const sx = HUT_X(i) - camX;
    if (sx * z < -1400 || sx * z > W + 1400) continue;
    const T = wordTimes(V2[i]).map(w => w.s);
    hut(g, t, sx, i, 1, (g2, t2, x, dy, dw, dh, op) => INSIDE[i](g2, t2, x, dy, dw, dh, op, T));
    if (i < 7) bunting(g, t, sx + 360, sx + 540, BASE - 640);
  }
  g.restore();
  firework(g, t, 73.4, 260, 330, { color: C.pink, color2: C.gold, n: 70, speed: 380, seed: 71 });
  firework(g, t, 74.9, 820, 280, { color: C.cyan, color2: '#fff', n: 70, speed: 380, seed: 72 });
  // Clawd walks the promenade, taking them all in.
  const bp = K.beatPos(t);
  const turn = Math.sin((t - 72.5) * 1.6);
  clawd(g, 540 + Math.sin(t * 1.2) * 20, 1700, { s: 250, look: [turn, -.6], eyes: 'wide', rim: C.amber, armL: -.2, armR: -.2, legs: bp * .5, squash: .04 * Math.abs(Math.sin(bp * Math.PI)) });
}
