// The painted places, each baked once: Clawd's workshop, the circus ring, the schoolroom, the
// factory, Mabel's basement gym, the crew's office (by day and by night), the title card's sunburst
// and the breakdown's bare stage.
import { W, H, TAU, clamp, lerp, rng, noise, mix, rgba } from './kit.js';
import { INK, CREAM, CARD, PAPER, SKY, MINT, TEAL, DEEP, CORAL, OCHRE, ROSE, PLUM, WOOD, WOOD_SH, BROWN, GOLD, RED, GREEN, SLATE, WHITE } from './palette.js';
import { spline, ellipse, rrect } from './ink.js';
import { bake, wash, sky, cloud, paper, house, bunting, cobbles, lamp, tree, BGINK } from './paint.js';

const PW = 1300, PH = 2200;   // places are painted a little bigger than the frame, for the camera
export const PLACE_OFF = [(PW - W) / 2, (PH - H) / 2];

function planks(g, x0, y0, x1, y1, col, seed, vertical = true) {
  const R = rng(seed);
  const n = Math.round((vertical ? x1 - x0 : y1 - y0) / 90);
  for (let i = 0; i < n; i++) {
    const c = mix(col, R() < .5 ? '#ffffff' : '#3a2010', R() * .12);
    if (vertical) { const a = x0 + i * (x1 - x0) / n, b = x0 + (i + 1) * (x1 - x0) / n; wash(g, [[a, y0], [b, y0], [b, y1], [a, y1]], c, { seed: seed + i, ink: 2, inkA: .5, amt: 1, blooms: 12, bloomScale: 1.4 }); }
    else { const a = y0 + i * (y1 - y0) / n, b = y0 + (i + 1) * (y1 - y0) / n; wash(g, [[x0, a], [x1, a], [x1, b], [x0, b]], c, { seed: seed + i, ink: 2, inkA: .5, amt: 1, blooms: 12 }); }
  }
}
function windowFrame(g, x, y, w, h, seed, inside) {
  wash(g, [[x - 18, y - 18], [x + w + 18, y - 18], [x + w + 18, y + h + 26], [x - 18, y + h + 26]], WOOD_SH, { seed, ink: 3 });
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); inside(g); g.restore();
  g.strokeStyle = BGINK; g.lineWidth = 12; g.strokeRect(x, y, w, h);
  g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h / 2); g.lineTo(x + w, y + h / 2); g.stroke();
}
function shelf(g, x, y, w, seed, items) {
  wash(g, [[x, y], [x + w, y], [x + w, y + 22], [x, y + 22]], WOOD, { seed, ink: 2.5 });
  items(g, x, y);
}
function tin(g, x, y, w, h, col, text, seed) {
  wash(g, [[x, y - h], [x + w, y - h], [x + w, y], [x, y]], col, { seed, ink: 2.5, grad: .15 });
  if (text) { g.save(); g.fillStyle = CREAM; g.font = `${Math.round(h * .28)}px Lilita`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x + w / 2, y - h / 2); g.restore(); }
}

// Clawd's workshop: plank walls, a window on the town, shelves of boxed checks, a workbench.
export function workshop() {
  return bake('workshop', PW, PH, (g) => {
    planks(g, 0, 0, PW, PH, '#a86b3e', 101);
    // a darker band high up, behind the lyric
    const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, 'rgba(40,20,8,.45)'); gr.addColorStop(1, 'rgba(40,20,8,0)'); g.fillStyle = gr; g.fillRect(0, 0, PW, 900);
    windowFrame(g, 110, 820, 330, 380, 111, (g) => { sky(g, 1300, 2200, '#a9d7cf', '#f4e2c0', { clouds: 2, y0: 850, y1: 950, seed: 3 }); house(g, 100, 1210, 150, 260, '#e7b99c', 5, { chimney: true }); house(g, 260, 1210, 170, 300, '#9dc4b9', 6); });
    shelf(g, 700, 900, 520, 121, (g, x, y) => { for (let i = 0; i < 4; i++) tin(g, x + 20 + i * 125, y, 105, 130, [CORAL, TEAL, OCHRE, ROSE][i], 'CHECKS', 122 + i); });
    shelf(g, 700, 1180, 520, 131, (g, x, y) => { for (let i = 0; i < 3; i++) tin(g, x + 30 + i * 165, y, 140, 110, [OCHRE, CORAL, TEAL][i], i === 1 ? 'PASTE' : 'CHECKS', 132 + i); });
    // pegboard with tools
    wash(g, [[470, 800], [660, 800], [660, 1260], [470, 1260]], '#d6b489', { seed: 141, ink: 2.5 });
    for (let i = 0; i < 5; i++) for (let j = 0; j < 9; j++) { g.fillStyle = rgba(BGINK, .5); g.beginPath(); g.arc(490 + i * 38, 820 + j * 50, 4, 0, TAU); g.fill(); }
    // workbench
    wash(g, [[0, 1640], [PW, 1640], [PW, 1720], [0, 1720]], '#8a5129', { seed: 151, ink: 3, grad: .2 });
    planks(g, 0, 1720, PW, PH, '#6e4128', 152, false);
    paper(g, PW, PH, 7, .8);
  });
}

// The circus ring: a striped big top, a ring of sawdust, a spotlight.
export function circus() {
  return bake('circus', PW, PH, (g) => {
    g.fillStyle = '#2a1a22'; g.fillRect(0, 0, PW, PH);
    const cx = PW / 2, cy = -200;
    for (let i = 0; i < 24; i++) {
      const a0 = Math.PI * .05 + i / 24 * Math.PI * .9, a1 = Math.PI * .05 + (i + 1) / 24 * Math.PI * .9;
      wash(g, [[cx, cy], [cx + Math.cos(a0) * 2600, cy + Math.sin(a0) * 2600], [cx + Math.cos(a1) * 2600, cy + Math.sin(a1) * 2600]], i % 2 ? '#b33a3a' : '#efd9b0', { seed: 201 + i, amt: 0, blooms: 20, rim: .2 });
    }
    const gr = g.createLinearGradient(0, 0, 0, PH); gr.addColorStop(0, 'rgba(20,10,20,.55)'); gr.addColorStop(.45, 'rgba(20,10,20,.1)'); gr.addColorStop(1, 'rgba(20,10,20,.5)'); g.fillStyle = gr; g.fillRect(0, 0, PW, PH);
    // the ring
    wash(g, ellipse(cx, 1700, 760, 230, 0, 60), '#d9b27a', { seed: 211, ink: 0, blooms: 40 });
    wash(g, ellipse(cx, 1700, 760, 230, 0, 60).concat(ellipse(cx, 1700, 700, 195, 0, 60).reverse()), '#c0392b', { seed: 212, amt: 0 });
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.fillStyle = CREAM; g.beginPath(); g.arc(cx + Math.cos(a) * 730, 1700 + Math.sin(a) * 212, 8, 0, TAU); g.fill(); }
    // spotlight
    g.save(); g.globalCompositeOperation = 'lighter'; const sp = g.createRadialGradient(cx, 1500, 50, cx, 1500, 700); sp.addColorStop(0, 'rgba(255,240,200,.35)'); sp.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = sp; g.beginPath(); g.moveTo(cx - 90, 0); g.lineTo(cx + 90, 0); g.lineTo(cx + 600, 1900); g.lineTo(cx - 600, 1900); g.closePath(); g.fill(); g.restore();
    paper(g, PW, PH, 8, .6);
  });
}

// The schoolroom: a chalkboard wall and rows of little desks.
export function schoolroom() {
  return bake('school', PW, PH, (g) => {
    wash(g, [[0, 0], [PW, 0], [PW, PH], [0, PH]], '#cfd9b8', { seed: 301, amt: 0, blooms: 60, bloomScale: 2 });
    const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, 'rgba(30,40,20,.5)'); gr.addColorStop(1, 'rgba(30,40,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, PW, 900);
    // chalkboard
    wash(g, [[140, 700], [1160, 700], [1160, 1230], [140, 1230]], WOOD, { seed: 311, ink: 3 });
    wash(g, [[170, 730], [1130, 730], [1130, 1200], [170, 1200]], '#2f4a3c', { seed: 312, ink: 2, blooms: 40, bloom: 1.4 });
    wash(g, [[160, 1200], [1140, 1200], [1140, 1228], [160, 1228]], WOOD_SH, { seed: 313, ink: 2 });
    // floor
    planks(g, 0, 1500, PW, PH, '#b98a55', 321, false);
    paper(g, PW, PH, 9, .8);
  });
}

// The factory: brick, pipes and a gauge; the press and conveyor are drawn as props.
export function factory() {
  return bake('factory', PW, PH, (g) => {
    wash(g, [[0, 0], [PW, 0], [PW, PH], [0, PH]], '#a4533e', { seed: 401, amt: 0, blooms: 50 });
    const R = rng(402);
    for (let y = 0; y < PH; y += 56) for (let x = ((y / 56) % 2) * 60 - 60; x < PW; x += 120) wash(g, [[x + 4, y + 4], [x + 116, y + 4], [x + 116, y + 52], [x + 4, y + 52]], mix('#b5604a', R() < .5 ? '#ffffff' : '#401810', R() * .15), { seed: 403 + x + y * 7, amt: .5, blooms: 1, rim: .25, ink: 1.5, inkA: .35 });
    const gr = g.createLinearGradient(0, 0, 0, PH); gr.addColorStop(0, 'rgba(30,10,5,.55)'); gr.addColorStop(.5, 'rgba(30,10,5,.1)'); gr.addColorStop(1, 'rgba(30,10,5,.45)'); g.fillStyle = gr; g.fillRect(0, 0, PW, PH);
    for (const x of [120, 1180]) wash(g, [[x - 26, 600], [x + 26, 600], [x + 26, PH], [x - 26, PH]], '#6d7f7c', { seed: 410 + x, ink: 2.5, grad: .3 });
    wash(g, [[0, 1700], [PW, 1700], [PW, PH], [0, PH]], '#4a4440', { seed: 420, ink: 3 });
    paper(g, PW, PH, 10, .6);
  });
}

// Mabel's basement gym: brick walls, a high window at pavement level, a rubber floor, the kit.
export function gym(o = {}) {
  return bake('gym', PW, PH, (g) => {
    wash(g, [[0, 0], [PW, 0], [PW, PH], [0, PH]], '#b77b5c', { seed: 501, amt: 0, blooms: 50 });
    const R = rng(502);
    for (let y = 0; y < 1560; y += 50) for (let x = ((y / 50) % 2) * 55 - 55; x < PW; x += 110) wash(g, [[x + 3, y + 3], [x + 107, y + 3], [x + 107, y + 47], [x + 3, y + 47]], mix('#c68d6c', R() < .5 ? '#ffffff' : '#401810', R() * .16), { seed: 503 + x + y * 7, amt: .5, blooms: 1, rim: .2, ink: 1.2, inkA: .3 });
    // painted wall stripe and a sign
    wash(g, [[0, 1080], [PW, 1080], [PW, 1130], [0, 1130]], TEAL, { seed: 510, ink: 2 });
    const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, 'rgba(30,12,6,.6)'); gr.addColorStop(1, 'rgba(30,12,6,0)'); g.fillStyle = gr; g.fillRect(0, 0, PW, 900);
    // the high window at pavement level, with passing feet outside
    windowFrame(g, 820, 720, 360, 150, 520, (g) => { g.fillStyle = '#c9e1d6'; g.fillRect(800, 700, 400, 200); wash(g, [[800, 820], [1200, 820], [1200, 900], [800, 900]], '#9a9486', { seed: 521, amt: 0 }); });
    // rack of dumbbells
    wash(g, [[80, 1290], [520, 1290], [520, 1310], [80, 1310]], SLATE, { seed: 530, ink: 2 });
    for (let i = 0; i < 5; i++) { const x = 120 + i * 85; wash(g, ellipse(x, 1270, 26, 26, 0, 20), INK, { seed: 531 + i, amt: .3 }); }
    wash(g, [[90, 1310], [110, 1310], [110, 1560], [90, 1560]], SLATE, { seed: 540, ink: 2 }); wash(g, [[490, 1310], [510, 1310], [510, 1560], [490, 1560]], SLATE, { seed: 541, ink: 2 });
    // Indian clubs hanging, a skipping rope
    for (let i = 0; i < 3; i++) wash(g, spline([[960 + i * 70, 1150], [975 + i * 70, 1160], [985 + i * 70, 1300], [965 + i * 70, 1360], [945 + i * 70, 1300], [955 + i * 70, 1160]], true, 4), [CREAM, CORAL, CREAM][i], { seed: 550 + i, ink: 2.5 });
    // floor: green rubber mats
    wash(g, [[0, 1560], [PW, 1560], [PW, PH], [0, PH]], '#5d7a5c', { seed: 560, ink: 0, blooms: 40, grad: .15 });
    for (let x = -100; x < PW + 200; x += 260) { g.strokeStyle = rgba(INK, .35); g.lineWidth = 3; g.beginPath(); g.moveTo(PW / 2 + (x - PW / 2) * .6, 1560); g.lineTo(x, PH); g.stroke(); }
    g.strokeStyle = rgba(INK, .35); g.beginPath(); g.moveTo(0, 1800); g.lineTo(PW, 1800); g.stroke();
    paper(g, PW, PH, 11, .7);
  });
}

// The crew's office: wallpaper, a corkboard of evidence, a window on the square; night version darker.
export function office(night = false) {
  return bake('office' + (night ? 'n' : ''), PW, PH, (g) => {
    wash(g, [[0, 0], [PW, 0], [PW, PH], [0, PH]], night ? '#3e4a5c' : '#e3cf9f', { seed: 601, amt: 0, blooms: 60 });
    // wallpaper: little diamonds
    g.save(); g.globalAlpha = night ? .25 : .3;
    for (let y = 20; y < 1560; y += 80) for (let x = ((y / 80) % 2) * 50; x < PW; x += 100) { g.fillStyle = night ? '#8ca0b0' : '#c58b5a'; g.beginPath(); g.moveTo(x, y - 12); g.lineTo(x + 9, y); g.lineTo(x, y + 12); g.lineTo(x - 9, y); g.fill(); }
    g.restore();
    const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, `rgba(30,15,6,${night ? .6 : .5})`); gr.addColorStop(1, 'rgba(30,15,6,0)'); g.fillStyle = gr; g.fillRect(0, 0, PW, 900);
    // wainscot
    wash(g, [[0, 1250], [PW, 1250], [PW, 1560], [0, 1560]], night ? '#3a2a24' : '#8a5129', { seed: 610, ink: 2.5, grad: .15 });
    wash(g, [[0, 1240], [PW, 1240], [PW, 1262], [0, 1262]], night ? '#2a1c16' : WOOD_SH, { seed: 611, ink: 2 });
    // window with the square beyond
    windowFrame(g, 120, 760, 320, 400, 620, (g) => {
      if (night) { g.fillStyle = '#1c2a44'; g.fillRect(100, 740, 360, 440); for (let i = 0; i < 20; i++) { g.fillStyle = '#f5ecd0'; g.beginPath(); g.arc(130 + (i * 71) % 300, 770 + (i * 53) % 200, 2.5, 0, TAU); g.fill(); } wash(g, ellipse(360, 830, 34, 34, 0, 30), '#f3e6b8', { seed: 625, amt: .5 }); }
      else sky(g, 1300, 2200, '#a9d7cf', '#f4e2c0', { clouds: 2, y0: 780, y1: 880, seed: 4 });
      house(g, 110, 1160, 150, 250, night ? '#4b5870' : '#e7b99c', 7); house(g, 270, 1160, 170, 300, night ? '#3c4c5e' : '#9dc4b9', 8);
    });
    // corkboard
    wash(g, [[640, 720], [1200, 720], [1200, 1160], [640, 1160]], WOOD, { seed: 630, ink: 3 });
    wash(g, [[665, 745], [1175, 745], [1175, 1135], [665, 1135]], night ? '#8d6a45' : '#c9955c', { seed: 631, ink: 2, blooms: 50, bloom: 1.5 });
    // floor boards
    planks(g, 0, 1560, PW, PH, night ? '#4a3226' : '#a0673c', 640, false);
    paper(g, PW, PH, 12, .7);
  });
}

// The title card: a sunburst of teal and cream rays.
export function sunburst(g, cx, cy, rot, cols = [TEAL, '#e7d4a6']) {
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a0 = rot + i / n * TAU, a1 = rot + (i + 1) / n * TAU;
    g.fillStyle = i % 2 ? cols[0] : cols[1];
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * 2600, cy + Math.sin(a0) * 2600); g.lineTo(cx + Math.cos(a1) * 2600, cy + Math.sin(a1) * 2600); g.closePath(); g.fill();
  }
}

// The bare stage for the breakdown: cream boards, a black drop, one spotlight.
export function stage() {
  return bake('stage', PW, PH, (g) => {
    g.fillStyle = '#20150f'; g.fillRect(0, 0, PW, PH);
    wash(g, [[0, 1500], [PW, 1500], [PW, PH], [0, PH]], '#6b4a30', { seed: 701, amt: 0, blooms: 30 });
    for (let x = 0; x < PW; x += 110) { g.strokeStyle = rgba(INK, .5); g.lineWidth = 3; g.beginPath(); g.moveTo(x, 1500); g.lineTo(PW / 2 + (x - PW / 2) * 1.5, PH); g.stroke(); }
    paper(g, PW, PH, 13, .5);
  });
}
// A spotlight pool: drawn live so it can move.
export function spot(g, x, y, r, a = .5) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const sp = g.createRadialGradient(x, y, r * .1, x, y, r); sp.addColorStop(0, `rgba(255,240,205,${a})`); sp.addColorStop(.7, `rgba(255,240,205,${a * .6})`); sp.addColorStop(1, 'rgba(255,240,205,0)');
  g.fillStyle = sp; g.beginPath(); g.ellipse(x, y, r, r * .32, 0, 0, TAU); g.fill();
  const cone = g.createLinearGradient(0, 0, 0, y); cone.addColorStop(0, `rgba(255,240,205,${a * .05})`); cone.addColorStop(1, `rgba(255,240,205,${a * .35})`);
  g.fillStyle = cone; g.beginPath(); g.moveTo(x - r * .15, -50); g.lineTo(x + r * .15, -50); g.lineTo(x + r, y); g.lineTo(x - r, y); g.closePath(); g.fill();
  g.restore();
}
