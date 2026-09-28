// Character sheet: the band in their looks and expressions, for checking the designs.
//   node video/lib/render.mjs --scene video/ep02/mirror/sheet.js --song music/ep02 --stills 1 --w 1080
import { C, W, H } from './kit.js';
import { fonts as typeFonts, text } from './type.js';
import { clawd } from './clawd.js';

export const fonts = typeFonts;
export function drawMarks() {}

export function draw(g, t) {
  const q = new URLSearchParams(location.search);
  if (q.get('big')) return big(g, t);
  if (q.get('people')) return peopleSheet(g, t);
  g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
  // A red floor line and a pale backdrop panel so both dark and light parts read.
  g.fillStyle = C.ink2; g.fillRect(0, 0, W, 980);
  g.fillStyle = C.red3; g.fillRect(0, 975, W, 10);
  text(g, 'LOOKING GLASS', 540, 120, 110, 'goth', { align: 'center', fill: C.bone, noAudit: true });
  const who = ['clawd', 'regex', 'null', 'cron'];
  who.forEach((w, i) => {
    const x = 150 + i * 260;
    clawd(g, x, 940, { who: w, s: 190, t, rim: C.red, mouth: w === 'clawd' ? .6 : 0, eyes: w === 'cron' ? 'fierce' : undefined });
    text(g, w.toUpperCase(), x, 1030, 44, 'black', { align: 'center', fill: C.bone, noAudit: true });
  });
  // Expressions on CLAWD.
  const ex = ['open', 'wide', 'sad', 'fierce', 'shut', 'dead'];
  ex.forEach((e, i) => {
    const x = 110 + (i % 3) * 330, y = 1450 + Math.floor(i / 3) * 400;
    clawd(g, x + 60, y, { who: 'clawd', s: 170, t, eyes: e, tears: e === 'sad' ? 1 : 0, mouth: e === 'wide' ? .9 : e === 'fierce' ? .4 : 0, light: { x: -.6, y: -.8 }, rim: C.glass });
    text(g, e, x + 60, y + 60, 34, 'mono', { align: 'center', fill: C.bone3, noAudit: true });
  });
}

// Close-ups on a mid-tone ground, to judge silhouettes and details.
function big(g, t) {
  g.fillStyle = '#6d6875'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#3c3a44'; g.fillRect(0, 960, W, 960);
  clawd(g, 290, 900, { who: 'clawd', s: 380, t, rim: C.red, mouth: .5 });
  clawd(g, 800, 900, { who: 'null', s: 380, t, rim: C.red });
  clawd(g, 290, 1830, { who: 'cron', s: 380, t, rim: C.red, eyes: 'fierce' });
  clawd(g, 800, 1830, { who: 'regex', s: 380, t, rim: C.red });
}

// The people, on a mid-tone ground: ?people=1
import { person, stranger, SKIN, HAIRC } from './people.js';
export const CAST = {
  rosa: { sex: 'f', skin: SKIN.b, hair: { style: 'bun', col: HAIRC.brown }, top: { type: 'apron', col: C.steel2, col2: C.bone }, bottom: { type: 'trousers', col: C.ink2 }, seed: 3 },
  gran: { sex: 'f', old: true, skin: SKIN.e, hair: { style: 'bun', col: HAIRC.white }, glasses: true, top: { type: 'cardigan', col: C.red2, col2: C.bone }, bottom: { type: 'skirt', col: C.ink3 }, build: .95, seed: 5 },
  mum: { sex: 'f', skin: SKIN.d, hair: { style: 'curly', col: HAIRC.black }, top: { type: 'coat', col: C.glass2, col2: C.bone }, bottom: { type: 'trousers', col: C.ink2 }, seed: 7 },
  dad: { sex: 'm', skin: SKIN.a, hair: { style: 'short', col: HAIRC.auburn }, top: { type: 'hoodie', col: C.steel2 }, bottom: { type: 'trousers', col: C.ink3 }, seed: 9 },
  dave: { sex: 'm', skin: SKIN.a, hair: { style: 'bald', col: HAIRC.grey }, top: { type: 'suit', col: C.ink2, col2: C.bone, tie: C.red }, bottom: { type: 'trousers', col: C.ink2 }, build: 1.15, seed: 11 },
  sue: { sex: 'f', skin: SKIN.c, hair: { style: 'bob', col: HAIRC.auburn }, top: { type: 'tee', col: C.red, sleeve: 'none' }, bottom: { type: 'skirt', col: C.red }, seed: 13 },
  jess: { sex: 'f', skin: SKIN.a, hair: { style: 'updo', col: HAIRC.blonde }, top: { type: 'wedding', col: C.bone }, bottom: { type: 'gown', col: C.bone }, seed: 15 },
};
export function peopleSheet(g, t) {
  g.fillStyle = '#6d6875'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#3c3a44'; g.fillRect(0, 960, W, 960);
  person(g, 170, 900, 700, CAST.rosa, { armL: 'hip', armR: 'phone', phone: 'R', expr: 'shock' }, t);
  person(g, 450, 900, 560, CAST.gran, { armR: 'phoneFar', phone: 'R', expr: 'squint', armL: 'down' }, t);
  person(g, 720, 900, 690, CAST.mum, { armL: 'phone', phone: 'L', expr: 'shock', turn: -.5 }, t);
  person(g, 950, 900, 740, CAST.dad, { armR: 'phone', phone: 'R', expr: 'neutral', lanyard: true, turn: .4 }, t);
  person(g, 190, 1850, 760, CAST.dave, { armL: 'down', armR: 'wave', expr: 'sweat' }, t);
  person(g, 480, 1850, 700, CAST.sue, { armL: 'cross', armR: 'cross', expr: 'angry', turn: -.5 }, t);
  person(g, 800, 1850, 720, CAST.jess, { armL: 'down', armR: 'down', expr: 'deadpan' }, t);
  for (let i = 0; i < 4; i++) stranger(g, 960 + (i % 2) * 70, 1860 - Math.floor(i / 2) * 20, 330, 100 + i, { t });
}
