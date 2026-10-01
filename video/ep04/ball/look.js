// Look development: character sheets and studies, one view at a time.
//   node video/lib/render.mjs --scene video/ep04/ball/look.js --song music/ep04/piano --stills 1 --w 1080 --query v=cast
import { W, H, setNow, twos, loadRecord, REC } from './kit.js';
import { CREAM, CARD, INK, TEAL, SKY, GREEN, RED, GOLD } from './palette.js';
import { clawd, cane } from './clawd.js';
import { guess, press, stress, check } from './crew.js';
import { mabel, critter } from './people.js';
import { phone, router, socket, plug, comma, bug, magnifier, wifiIcon } from './cast.js';
import { finish, weave } from './film.js';
import { workshop, WS } from './places.js';
import { place, floorCam, footShadow } from './common.js';

export const fonts = [['Corben', 'video/ep04/ball/fonts/Corben-Bold.ttf'], ['Lilita', 'video/ep04/ball/fonts/LilitaOne-Regular.ttf']];

const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const V = q.get('v') || 'cast';

export async function init(S) { await loadRecord(S, '/music/ep04/piano/audio.json'); }

function floor(g, y) { g.fillStyle = '#e2cfa6'; g.fillRect(0, y, W, 6); }

export function draw(g, t) {
  const tq = twos(t); setNow(tq);
  g.fillStyle = CREAM; g.fillRect(0, 0, W, H);
  if (V === 'cast') {
    floor(g, 560); floor(g, 1080); floor(g, 1600);
    clawd(g, 270, 560, 1, { t: tq, L: 'hips', R: { to: [.2, -.1], pose: 'grip' }, hold: { R: (g, x, y, a, s) => cane(g, x, y, 1.35, s) }, eyes: { expr: 'open', lx: .3 }, sing: .7 });
    clawd(g, 790, 560, 1, { t: tq, L: 'up', R: 'jazz', eyes: { expr: 'happy' }, sing: .9, hatTip: .5 });
    guess(g, 180, 1080, 1, { t: tq, L: 'chin', R: 'hold', hold: { R: (g, x, y, a, s) => magnifier(g, x, y, -1.1, s) }, eyes: { lx: .5 } });
    press(g, 520, 1080, 1, { t: tq, L: 'up', R: 'press', sing: .7 });
    stress(g, 850, 1080, 1, { t: tq, L: 'hips', R: 'cheer', gauge: .92, steam: 1, eyes: { lx: -.3 } });
    guess(g, 170, 1600, .85, { t: tq, L: 'up', R: 'cheer', bang: 1, eyes: { expr: 'happy' }, sing: .8 });
    clawd(g, 480, 1600, .8, { t: tq, L: 'chin', R: 'hold', hold: { R: (g, x, y, a, s) => magnifier(g, x, y, -.9, s) }, eyes: { expr: 'worried', lx: .6, ly: -.3 }, smile: -.5 });
    check(g, 730, 1600, 1.2, { t: tq, flag: 'up-green', wave: true });
    check(g, 930, 1600, 1.2, { t: tq, flag: 'up-red', wave: true, phase: 2 });
    clawd(g, 330, 1880, .55, { t: tq, hat: 'beanie', hatCol: '#7fc4a8', L: 'up', R: 'hang', eyes: { expr: 'wide' } });
    clawd(g, 560, 1880, .55, { t: tq, hat: 'beanie', hatCol: '#ebb942', L: 'hang', R: 'up', eyes: { expr: 'happy' }, sing: .6 });
    clawd(g, 790, 1880, .55, { t: tq, hat: 'beanie', hatCol: '#a990c9', L: 'hips', R: 'point', eyes: { lx: .7 } });
  }
  if (V === 'people') {
    floor(g, 820); floor(g, 1500);
    mabel(g, 290, 820, .95, { t: tq, L: 'flex', R: 'hips', eyes: { lx: .3 }, sing: .6 });
    mabel(g, 790, 820, .95, { t: tq, L: 'cry', R: 'hang', eyes: { expr: 'cry' }, smile: -1, tears: true });
    critter(g, 170, 1500, 1, { t: tq, kind: 'cat', R: 'up', sing: .5 });
    critter(g, 420, 1500, 1, { t: tq, kind: 'pup', L: 'phone', eyes: { expr: 'wide' } });
    critter(g, 670, 1500, 1, { t: tq, kind: 'goose', R: 'out', eyes: { expr: 'happy' } });
    critter(g, 900, 1500, .8, { t: tq, kind: 'bunny', L: 'up' });
    critter(g, 900, 1880, .8, { t: tq, kind: 'piglet', R: 'up', sing: .4 });
  }
  if (V === 'things') {
    floor(g, 720);
    phone(g, 230, 720, .8, { t: tq, wifi: 1, eyes: { expr: 'open' }, screen: (g, x, y, w, h, s) => { g.fillStyle = '#dfeee9'; g.fillRect(x, y + 70 * s, w, 60 * s); } });
    phone(g, 560, 720, .8, { t: tq, col: '#e98aa0', wifi: 0, eyes: { expr: 'wink' }, L: { to: [-40, -60], pose: 'wave' } });
    router(g, 860, 380, 1, { t: tq, on: 1 });
    router(g, 860, 640, 1, { t: tq, on: 0 });
    socket(g, 140, 1000, 1); plug(g, [300, 960], [196, 1000], Math.PI, 1, { sag: 60 });
    comma(g, 420, 980, 130, { t: tq, pose: 'stand' });
    comma(g, 600, 980, 130, { t: tq, pose: 'swoon', p: 1 });
    comma(g, 820, 1040, 130, { t: tq, pose: 'faint' });
    bug(g, 220, 1300, 1.6, { t: tq, walk: tq * 3 });
    bug(g, 520, 1300, 1.6, { t: tq, dir: -1, kick: .8 });
    magnifier(g, 700, 1450, -.7, 1.2, { inside: (g, x, y, r) => bug(g, x, y, 1.6, { t: tq }) });
    wifiIcon(g, 200, 1700, 60, 1); wifiIcon(g, 400, 1700, 60, 0);
  }
  if (V === 'hero') {
    g.save(); place(g, workshop(), floorCam(700, 1, WS.floor));
    const F = WS.floor;
    footShadow(g, 330, F, 250); footShadow(g, 700, F, 330); footShadow(g, 1060, F, 160);
    phone(g, 330, F, .78, { t: tq, wifi: 1, eyes: { expr: 'open', lx: .6 }, screen: (g, x, y, w, h, s) => { for (let i = 0; i < 9; i++) { const cols = ['#c94f3d', '#2f8f88', '#7a5aa8', '#d9a23c']; g.fillStyle = cols[i % 4]; g.fillRect(x + 24 * s + (i % 3) * 14 * s, y + 70 * s + i * 34 * s, (80 + (i * 37) % 120) * s, 14 * s); } } });
    clawd(g, 700, F, 1.05, { t: tq, L: { to: [.55, -.2], pose: 'grip' }, R: { to: [.5, -.3], pose: 'grip' }, eyes: { expr: 'open', lx: -.5 }, sing: .7 });
    check(g, 1060, F, 1.5, { t: tq, flag: 'down' });
    g.restore();
  }
  finish(g, t);
}
