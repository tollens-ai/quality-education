// The far side of the glass: the four places the band built apps for, where the people are.
// Each is drawn for a window about 1080 x 1300, and takes a state: 'broken' (verse 1, the
// disaster), 'checked' (verse 2, the oracle at work), or 'fine' (the outro).
//   bakery  Rosa's shop at eight in the morning, the checkout down, fifty in the queue
//   clinic  Gran and the clinic's cute booking site
//   school  two parents at the school gate, one reading the other's texts
//   wedding table four: Dave, and next to him Sue, his angry ex
import { C, W, TAU, clamp, lerp, easeOut, rgba, hash, noise, twos, mix } from './kit.js';
import { P, ink, gpen, glint, hatchRect } from './pen.js';
import { text } from './type.js';
export { deco };
import { person, stranger, rimmed, SKIN, HAIRC } from './people.js';

export const CAST = {
  rosa: { sex: 'f', skin: SKIN.b, hair: { style: 'bun', col: HAIRC.brown }, top: { type: 'apron', col: C.steel2, col2: C.bone }, bottom: { type: 'trousers', col: C.ink2 }, seed: 3 },
  gran: { sex: 'f', old: true, skin: SKIN.e, hair: { style: 'bun', col: HAIRC.white }, glasses: true, top: { type: 'cardigan', col: C.red2, col2: C.bone }, bottom: { type: 'skirt', col: C.ink3 }, build: .95, seed: 5 },
  mum: { sex: 'f', skin: SKIN.d, hair: { style: 'curly', col: HAIRC.black }, top: { type: 'coat', col: C.glass2, col2: C.bone }, bottom: { type: 'trousers', col: C.ink2 }, seed: 7 },
  dad: { sex: 'm', skin: SKIN.a, hair: { style: 'short', col: HAIRC.auburn }, top: { type: 'hoodie', col: C.steel2 }, bottom: { type: 'trousers', col: C.ink3 }, seed: 9 },
  dave: { sex: 'm', skin: SKIN.a, hair: { style: 'bald', col: HAIRC.grey }, top: { type: 'suit', col: C.ink2, col2: C.bone, tie: C.red }, bottom: { type: 'trousers', col: C.ink2 }, build: 1.15, seed: 11 },
  sue: { sex: 'f', skin: SKIN.c, hair: { style: 'bob', col: HAIRC.auburn }, top: { type: 'tee', col: C.red, sleeve: 'none' }, bottom: { type: 'skirt', col: C.red }, seed: 13 },
  jess: { sex: 'f', skin: SKIN.a, hair: { style: 'updo', col: HAIRC.blonde }, top: { type: 'wedding', col: C.bone }, bottom: { type: 'gown', col: C.bone }, seed: 15 },
};

const deco = { deco: true };
const label = (g, s, x, y, size, col, o = {}) => text(g, s, x, y, size, o.face || 'mono', { fill: col, align: o.align, ctx: deco, noAudit: o.noAudit });

// A phone or tablet screen, face on: a rounded black slab and a lit screen.
export function screen(g, x, y, w, h, draw, o = {}) {
  ink(g, P().rect(x, y, w, h), { fill: C.ink, line: 4, seed: o.seed ?? 7 });
  g.save();
  g.beginPath(); g.rect(x + w * .06, y + h * .05, w * .88, h * .9); g.clip();
  g.fillStyle = o.bg || C.bone; g.fillRect(x, y, w, h);
  g.translate(x + w * .06, y + h * .05);
  draw(g, w * .88, h * .9);
  g.restore();
}

// A wall clock at 8:00.
function clock(g, x, y, r, t) {
  ink(g, P().ell(x, y, r, r), { fill: C.bone, line: 5, seed: 17, t });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; gpen(g, [[x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8], [x + Math.cos(a) * r * .92, y + Math.sin(a) * r * .92]], 4, { col: C.ink, boil: false }); }
  gpen(g, [[x, y], [x, y - r * .72]], 7, { col: C.ink, taper: [0, .3], boil: false });
  gpen(g, [[x, y], [x - r * .5 * Math.cos(Math.PI / 6), y + r * .5 * Math.sin(Math.PI / 6)]], 9, { col: C.ink, taper: [0, .3], boil: false });
  g.fillStyle = C.red; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill();
}

// A spinner that never stops.
function spinner(g, x, y, r, t, col = C.ink) {
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + Math.floor(t * 12) / 12 * TAU;
    g.fillStyle = rgba(col === C.ink ? '#0b0a0e' : col, (i + 1) / 8);
    g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * .22, 0, TAU); g.fill();
  }
}

// ---------------------------------------------------------------- the bakery
export function bakery(g, t, st = 'broken', o = {}) {
  // A cold morning light through the shop window; the counter; the queue out of the door.
  g.fillStyle = '#1d2227'; g.fillRect(0, 0, W, 1400);
  g.fillStyle = '#262c33'; g.fillRect(0, 760, W, 640);
  // Shelves of bread behind the counter.
  for (let r = 0; r < 3; r++) {
    g.fillStyle = C.ink2; g.fillRect(560, 250 + r * 130, 500, 14);
    for (let i = 0; i < 6; i++) ink(g, P().ell(600 + i * 78, 225 + r * 130, 32, 22), { fill: mix('#b88a55', C.bone, .15), line: 3, seed: r * 10 + i, t, shade: { dx: 6, dy: -6, col: '#8a6238' } });
  }
  clock(g, 230, 240, 95, t);
  label(g, '8:00', 230, 400, 56, C.bone, { align: 'center', face: 'black' });
  // The queue: fifty people, from the door at the back to right in front of us.
  const n = 18;
  const at = i => {
    const d = i / n;
    return { d, x: lerp(470, 140, d) + Math.sin(i * 1.7) * 30 * (1 - d) + (st === 'fine' ? -((t * 60) % 50) : 0),
      y: lerp(1330, 820, Math.pow(d, .8)), h: lerp(560, 190, Math.pow(d, .7)) };
  };
  if (st === 'checked') {
    // A load test: simulated customers, ghosts edged in glass-blue, surging through twice as thick.
    rimmed(g, 'ghosts', C.glass, L => {
      for (let i = n - 1; i >= 0; i--) {
        const { x, y, h } = at(i), surge = ((t * .9 + i * .13) % 1);
        stranger(L, x + surge * 90, y, h, 200 + i, { t, silhouette: 1 });
        if (i % 2 === 0) stranger(L, x + 40 + surge * 90, y - 10, h * .96, 260 + i, { t, silhouette: 1 });
      }
    }, { fill: '#26303a' });
  } else {
    // The back of the queue in silhouette, out of the door; the front in the shop's light.
    rimmed(g, 'queue', C.bone2, L => {
      for (let i = n - 1; i >= 0; i--) { const { d, x, y, h } = at(i); if (d > .55) stranger(L, x, y, h, 200 + i, { t, silhouette: 1 }); }
    });
    for (let i = n - 1; i >= 0; i--) {
      const { d, x, y, h } = at(i);
      if (d > .55) continue;
      const phone = st === 'broken' && hash(i, 3) < .6;
      stranger(g, x, y, h, 200 + i, { t, rim: C.bone, armL: phone ? 'phone' : 'down', expr: st === 'broken' && d < .3 ? 'angry' : undefined });
    }
  }
  // The counter, and on it the till: the checkout, down.
  ink(g, P().rect(560, 820, 540, 560), { fill: C.ink3, line: 5, seed: 21, t, shade: { dx: 0, dy: -20, col: C.ink2 } });
  person(g, 830, 1100, 640, CAST.rosa, { armL: 'hip', armR: st === 'broken' ? 'phone' : 'wave', phone: st === 'broken' ? 'R' : null, expr: st === 'broken' ? 'shock' : 'smile', turn: -.3 }, t);
  ink(g, P().rect(560, 800, 540, 40), { fill: C.bone2, line: 5, seed: 22, t });
  screen(g, 600, 560, 300, 240, (s, w, h) => {
    if (st === 'broken') {
      s.fillStyle = C.bone; s.fillRect(0, 0, w, h);
      label(s, 'CHECKOUT', w / 2, 60, 34, C.ink, { align: 'center' });
      text(s, '503', w / 2, 150, 92, 'black', { align: 'center', fill: C.red, ctx: deco });
      spinner(s, w / 2, 185, 14, t, C.ink);
    } else {
      s.fillStyle = C.bone; s.fillRect(0, 0, w, h);
      label(s, 'ORDER', w / 2, 60, 34, C.ink, { align: 'center' });
      text(s, 'PAID', w / 2, 150, 80, 'black', { align: 'center', fill: C.ink, ctx: deco });
    }
  }, { seed: 23 });
  // A "now serving" ticket board: the queue in numbers.
  ink(g, P().rect(40, 520, 330, 170), { fill: C.ink, line: 5, seed: 24, t });
  label(g, 'IN THE QUEUE', 205, 575, 30, C.bone2, { align: 'center' });
  text(g, st === 'broken' ? '50' : st === 'checked' ? '100' : '0', 205, 670, 96, 'black', { align: 'center', fill: st === 'broken' ? C.red : C.glass, ctx: deco });
}

// ---------------------------------------------------------------- the clinic
export function clinic(g, t, st = 'broken', o = {}) {
  g.fillStyle = '#23262b'; g.fillRect(0, 0, W, 1400);
  // A waiting-room wall: a noticeboard and a potted plant, in the cold light.
  ink(g, P().rect(640, 180, 380, 260), { fill: C.bone3, line: 5, seed: 31, t });
  for (let i = 0; i < 4; i++) ink(g, P().rect(670 + (i % 2) * 170, 205 + Math.floor(i / 2) * 115, 140, 95), { fill: C.bone, line: 3, seed: 32 + i, t });
  label(g, 'CLINIC', 830, 520, 44, C.bone2, { align: 'center', face: 'black' });
  // Gran, holding her phone at arm's length, squinting at it.
  const ok = st !== 'broken';
  if (st === 'checked' && o.bot) o.bot(g, 300, 1360);
  else person(g, 300, 1360, 800, CAST.gran, { armR: 'phoneFar', phone: 'R', armL: 'down', expr: ok ? 'smile' : 'squint', turn: .3 }, t);
  // The booking site, big: cute, and impossible.
  screen(g, 540, 560, 460, 780, (s, w, h) => {
    s.fillStyle = '#f3d9d9'; s.fillRect(0, 0, w, h);
    // A kawaii bunny, hearts, and a heading in a rounded hand.
    ink(s, P().ell(w / 2, 150, 90, 78), { fill: C.bone, line: 4, seed: 33 });
    for (const sd of [-1, 1]) ink(s, P().ell(w / 2 + sd * 45, 55, 22, 60), { fill: C.bone, line: 4, seed: 34 + sd });
    for (const sd of [-1, 1]) { s.fillStyle = C.ink; s.beginPath(); s.arc(w / 2 + sd * 32, 145, 11, 0, TAU); s.fill(); s.fillStyle = rgba(C.red, .5); s.beginPath(); s.ellipse(w / 2 + sd * 55, 175, 16, 9, 0, 0, TAU); s.fill(); }
    for (let i = 0; i < 5; i++) heart(s, 40 + i * 80, 285 + (i % 2) * 20, 16, C.red);
    text(s, 'book your', w / 2, 380, 40, 'hand', { align: 'center', fill: C.red2, ctx: deco });
    text(s, 'check-up!', w / 2, 430, 44, 'hand', { align: 'center', fill: C.red2, ctx: deco });
    if (ok) {
      ink(s, P().rect(40, 480, w - 80, 110), { fill: C.ink, line: 4, seed: 36 });
      label(s, 'BOOKED', w / 2, 555, 52, C.bone, { align: 'center', face: 'black' });
      label(s, 'Tue 10:30', w / 2, 650, 36, C.ink, { align: 'center' });
    } else {
      // "Prove you're human": a grid of tiny pictures, and a button the size of a grain of rice.
      label(s, 'select all the', w / 2, 500, 22, C.ink, { align: 'center' });
      label(s, 'traffic lights', w / 2, 528, 22, C.ink, { align: 'center' });
      for (let i = 0; i < 9; i++) { s.fillStyle = i % 3 === 1 ? C.steel2 : C.steel; s.fillRect(70 + (i % 3) * 90, 548 + Math.floor(i / 3) * 42, 84, 38); }
      s.fillStyle = C.red; s.fillRect(w - 70, h - 40, 30, 12);
      spinner(s, w / 2, 710, 16, t, C.ink);
    }
  }, { seed: 37, bg: '#f3d9d9' });
}
function heart(g, x, y, r, col) {
  g.fillStyle = col;
  g.beginPath(); g.moveTo(x, y + r * .9);
  g.bezierCurveTo(x - r * 1.6, y - r * .2, x - r * .6, y - r * 1.3, x, y - r * .4);
  g.bezierCurveTo(x + r * .6, y - r * 1.3, x + r * 1.6, y - r * .2, x, y + r * .9); g.fill();
}

// ---------------------------------------------------------------- the school gate
export function school(g, t, st = 'broken', o = {}) {
  g.fillStyle = '#1e2329'; g.fillRect(0, 0, W, 1400);
  // Railings of the school gate behind them.
  for (let i = 0; i < 14; i++) {
    const x = 30 + i * 78;
    gpen(g, [[x, 200], [x, 900]], 12, { col: C.ink2, taper: [0, 0], boil: false });
    g.fillStyle = C.ink2; g.beginPath(); g.moveTo(x - 14, 205); g.lineTo(x, 170); g.lineTo(x + 14, 205); g.fill();
  }
  g.fillStyle = C.ink2; g.fillRect(0, 300, W, 16); g.fillRect(0, 820, W, 16);
  label(g, 'PARKSIDE PRIMARY', 540, 260, 44, C.bone3, { align: 'center', face: 'black' });
  const leak = st === 'broken';
  person(g, 300, 1380, 820, CAST.dad, { armR: 'phone', phone: 'R', expr: leak ? 'shock' : 'neutral', lanyard: true, turn: .4, screen: leak ? C.red3 : C.glass }, t);
  person(g, 790, 1380, 780, CAST.mum, { armL: 'phone', phone: 'L', expr: leak ? 'shock' : 'smile', turn: -.5 }, t);
  // Her private message, on his phone.
  if (leak) {
    const bob = Math.sin(t * 3) * 6;
    bubble(g, 120, 360 + bob, 560, 190, C.bone, 'Honestly Mr Hill is', 'the WORST teacher', C.ink);
    ink(g, P().rect(130, 322 + bob, 186, 42), { fill: C.red, line: 3, seed: 41, t });
    label(g, 'PRIVATE', 223, 354 + bob, 28, C.bone, { align: 'center' });
    gpen(g, [[460, 560 + bob], [390, 700]], 6, { col: C.bone, taper: [.1, .7], t, seed: 42 });
  } else {
    // Each family's messages sealed in its own box.
    for (let i = 0; i < 3; i++) {
      ink(g, P().rect(90 + i * 310, 380, 280, 170), { fill: rgba(C.glass, .18), line: 5, seed: 43 + i, t });
      label(g, ['FAMILY A', 'FAMILY B', 'FAMILY C'][i], 230 + i * 310, 440, 30, C.glass, { align: 'center' });
      padlock(g, 230 + i * 310, 505, 34, t);
    }
  }
}
function bubble(g, x, y, w, h, col, l1, l2, tc) {
  ink(g, P().S([[x, y + 30], [x + 30, y], [x + w - 30, y], [x + w, y + 30], [x + w, y + h - 30], [x + w - 30, y + h], [x + 160, y + h], [x + 110, y + h + 60], [x + 110, y + h], [x + 30, y + h], [x, y + h - 30]], true, .2), { fill: col, line: 5, seed: 45 });
  text(g, l1, x + 36, y + 100, 44, 'semi', { fill: tc, ctx: deco });
  text(g, l2, x + 36, y + 155, 44, 'black', { fill: C.red, ctx: deco });
}

// ---------------------------------------------------------------- the wedding
export function wedding(g, t, st = 'broken', o = {}) {
  g.fillStyle = '#20232a'; g.fillRect(0, 0, W, 1400);
  // Strings of fairy lights; the marquee's drape.
  for (let r = 0; r < 2; r++) for (let i = 0; i < 16; i++) {
    const x = i * 72 + 20, y = 160 + r * 90 + Math.sin(i / 15 * Math.PI) * 40;
    g.fillStyle = rgba(C.bone, .8); g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill();
  }
  // The seating plan on an easel, made by the site.
  ink(g, P().rect(700, 330, 330, 420), { fill: C.bone, line: 5, seed: 51, t });
  label(g, 'TABLE 4', 865, 400, 40, C.ink, { align: 'center', face: 'black' });
  const names = st === 'broken' ? ['Aunt Pat', 'DAVE', 'SUE', 'Raj', 'Mo'] : ['Aunt Pat', 'DAVE', 'Raj', 'Mo', 'Lin'];
  names.forEach((nm, i) => label(g, nm, 865, 470 + i * 52, 34, nm === 'SUE' || nm === 'DAVE' ? C.red : C.ink, { align: 'center', face: nm === nm.toUpperCase() ? 'black' : 'mono' }));
  // The table: Dave, and next to him Sue.
  if (st === 'broken') {
    person(g, 300, 1330, 760, CAST.dave, { armL: 'down', armR: 'down', expr: 'sweat', turn: .35 }, t);
    person(g, 560, 1330, 720, CAST.sue, { armL: 'cross', armR: 'cross', expr: 'angry', turn: -.6 }, t);
  } else {
    person(g, 300, 1330, 760, CAST.dave, { armL: 'down', armR: 'wave', expr: 'smile', turn: .2 }, t);
  }
  ink(g, P().S([[40, 1060], [1040, 1060], [1000, 1150], [80, 1150]], true, .3), { fill: C.bone, line: 5, seed: 52, t, shade: { dx: 0, dy: -20, col: C.bone2 } });
  g.fillStyle = C.bone2; g.fillRect(80, 1150, 920, 250);
  // Place cards.
  const cards = st === 'broken' ? [['DAVE', 250], ['SUE', 560]] : [['DAVE', 250]];
  for (const [nm, x] of cards) {
    ink(g, P().poly([[x - 90, 1045], [x + 90, 1045], [x + 80, 985], [x - 80, 985]]), { fill: C.bone, line: 4, seed: 53 + x, t });
    label(g, nm, x, 1033, 40, C.red, { align: 'center', face: 'black' });
  }
}

// A padlock, drawn (no emoji fonts in the renderer).
export function padlock(g, x, y, r, t) {
  g.save();
  g.strokeStyle = C.ink; g.lineWidth = r * .5; g.lineCap = 'round';
  g.beginPath(); g.arc(x, y - r * .45, r * .62, Math.PI, 0); g.stroke();
  g.strokeStyle = C.bone2; g.lineWidth = r * .26;
  g.beginPath(); g.arc(x, y - r * .45, r * .62, Math.PI, 0); g.stroke();
  g.restore();
  ink(g, P().rect(x - r, y - r * .45, r * 2, r * 1.5), { fill: C.bone, line: r * .14, seed: 47, t, shade: { dx: r * .2, dy: -r * .2, col: C.bone2 } });
  g.fillStyle = C.ink; g.beginPath(); g.arc(x, y + r * .15, r * .22, 0, TAU); g.fill(); g.fillRect(x - r * .08, y + r * .2, r * .16, r * .4);
}

// The four briefs, one per band member, in the order the intro introduces them and the verses
// visit them (Qing, 2026-09-28: a test listener couldn't tell the song was four separate stories;
// "you could even have it so that it's a separate band mate working each brief").
export const BRIEFS = [
  { n: 1, who: 'regex', name: 'REGEX', place: "ROSA'S BAKERY", app: 'CHECKOUT', built: "built Rosa's checkout" },
  { n: 2, who: 'cron', name: 'CRON', place: 'THE CLINIC', app: 'BOOKING SITE', built: "built the clinic's booking site" },
  { n: 3, who: 'null', name: 'NULL', place: 'PARKSIDE PRIMARY', app: 'FEEDBACK APP', built: 'built the school feedback app' },
  { n: 4, who: 'clawd', name: 'CLAWD', place: "JESS'S WEDDING", app: 'SEATING PLAN', built: "built Jess's seating plan" },
];

// The plate on a pane's top rail: which of the four it is, whose app, and who built it.
export function plate(g, b, y = 470) {
  g.fillStyle = C.steel2; g.fillRect(0, y, W, 72);
  g.fillStyle = C.ink; g.fillRect(14, y + 10, W - 28, 52);
  text(g, `${b.n}/4`, 30, y + 52, 50, 'black', { fill: C.bone, ctx: deco });
  text(g, `${b.place} · ${b.app}`, 140, y + 48, 36, 'mono', { fill: C.bone, ctx: deco });
  text(g, 'by ' + b.name, W - 30, y + 50, 44, 'black', { fill: C.red, align: 'right', ctx: deco });
}
