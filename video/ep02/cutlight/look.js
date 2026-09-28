// Look development: hero frames, built before any shots.
//   node video/lib/render.mjs --scene video/ep02/cutlight/look.js --song music/ep02 --stills 41 --w 1080 --query v=wide
import { W, H, clamp, lerp, mix, rgba, hash, noise, loadAudio, setSong, setLyrics, words, env, hit, beatPhase } from './kit.js';
import { cam, setLights, LIGHT, M, T, RY, RX, RZ, ap, project, norm, STYLE } from './space.js';
import { INK } from './ink.js';
import { fonts as typeFonts, loadGlyphs, layLine, posterLine, drawCuts, AUDIT } from './type.js';
import { layer, put, glow, shafts, grain, vignette, setScale, R, rimmed, blurred } from './post.js';
import { clawd } from './clawd.js';
import { micStand, guitar, amp } from './gear.js';
import { player, singer, drummer } from './playing.js';
import { ROOM, WALL, backWall, floorPlane, floorReflection, wallReflection, beam } from './room.js';
import { P, BAND } from './palette.js';
import { beamInk, smoke, rays, streaks } from './air.js';
import { person, stranger, SKIN, HAIRC } from './people.js';

export const fonts = typeFonts;
export function drawMarks() {}
let HOOK, HWS;
const CAM = { wide: () => cam([0, 112, 1050], [0, 150, -160], { fov: .5, roll: -.02 }), close: () => cam([46, 40, 330], [-4, 44, 120], { fov: .52, roll: -.05 }), sheet: () => cam([0, 60, 1500], [0, 40, 0], { fov: .5 }) };
export async function init(S) {
  await loadAudio('/video/ep02/cutlight/audio.json');
  setSong(S); setLyrics(S.lyrics);
  await loadGlyphs();
  HWS = words('Chorus 1', 'How do I know');
}

// The daylight outside, as seen through the cuts: a warm sky, a low sun, the town's roofs.
function outside(L, c, t) {
  L.save();
  const sun = project(c, [60, 380, -3000]);
  const zen = project(c, [0, 2400, -3000]), hor = project(c, [0, 0, -3000]);
  const gr = L.createLinearGradient(zen.x, zen.y, hor.x, hor.y);
  gr.addColorStop(0, '#3f8fd0'); gr.addColorStop(.5, '#8cc3e6'); gr.addColorStop(.8, '#ffd9a0'); gr.addColorStop(1, '#ffb873');
  L.fillStyle = gr; L.fillRect(0, 0, W, H);
  const sg = L.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, 380);
  sg.addColorStop(0, 'rgba(255,255,250,1)'); sg.addColorStop(.08, 'rgba(255,250,232,.95)'); sg.addColorStop(.3, 'rgba(255,230,180,.3)'); sg.addColorStop(1, 'rgba(255,220,160,0)');
  L.fillStyle = sg; L.fillRect(0, 0, W, H);
  L.globalAlpha = .6;
  for (let i = 0; i < 9; i++) {
    const cx = hash(i, 1) * W, cy = zen.y + (hor.y - zen.y) * (.25 + hash(i, 2) * .5), rw = 120 + hash(i, 3) * 240;
    const cg = L.createRadialGradient(cx, cy, 0, cx, cy, rw);
    cg.addColorStop(0, 'rgba(255,255,255,.95)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
    L.fillStyle = cg; L.beginPath(); L.ellipse(cx, cy, rw, rw * .2, 0, 0, Math.PI * 2); L.fill();
  }
  L.globalAlpha = 1;
  const hz = project(c, [0, 60, -3000]).y;
  L.fillStyle = '#9fb3c9';
  L.beginPath(); L.moveTo(0, H * 2);
  let x = -40;
  while (x < W + 60) {
    const h = 26 + hash(x) * 60, w = 36 + hash(x, 2) * 70;
    L.lineTo(x, hz - h); if (hash(x, 3) > .6) { L.lineTo(x + w / 2, hz - h - 26); } L.lineTo(x + w, hz - h);
    x += w;
  }
  L.lineTo(W, H * 2); L.closePath(); L.fill();
  L.restore();
}

// The band, in the painter's order. Each member is its own layer so it can be rim-lit.
const KEY = '#fff0d8';
function bandItems(t, E) {
  return [
    { name: 'cron', col: BAND.cron.col, rimDir: [.2, -1], draw: (L, cc) => drummer(L, cc, { pos: [0, 0, -40], t, E, col: BAND.cron.col, riser: 44 }) },
    { name: 'null', col: BAND.null.col, rimDir: [-.6, -1], draw: (L, cc) => player(L, cc, { who: 'null', pos: [84, 0, 40], yaw: -.42, t, E, glow: .9 }) },
    { name: 'regex', col: BAND.regex.col, rimDir: [.6, -1], draw: (L, cc) => player(L, cc, { who: 'regex', pos: [-82, 0, 50], yaw: .42, t, E, glow: .9 }) },
    { name: 'clawd', col: BAND.clawd.col, rimDir: [0, -1], draw: (L, cc) => singer(L, cc, { pos: [0, 0, 120], yaw: .03, t, mouth: .8, eyes: 'narrow' }) },
  ];
}
function band(L, cc, t) { for (const it of bandItems(t, null)) it.draw(L, cc); }

function sheet(g, t) {
  const c = CAM.sheet();
  setLights({ key: { dir: [-.55, .7, .75], col: KEY, k: 1.25 }, ambient: '#15162c', view: c.pos,
    extra: [{ dir: [.3, .4, -1], col: '#fff3de', k: .5 }, { pos: [-400, 100, 200], col: '#3a5cff', k: .3, range: 900 }] });
  g.fillStyle = INK.col; g.fillRect(0, 0, W, H);
  const E = layer('emit');
  const xs = [-120, -40, 40, 120];
  const who = ['clawd', 'regex', 'null', 'cron'];
  // Top row: plain, facing us three-quarter. Bottom: playing.
  for (let i = 0; i < 4; i++) {
    const w = who[i];
    rimmed(g, 's' + i, L => clawd(L, c, { who: w, pos: [xs[i], 80, 0], yaw: .35, t, eyes: 'open', emit: f => f(E), shadow: false }), [{ col: INK.paper, lx: .4, ly: -1, d: 2.5, k: .9 }], { E });
  }
  rimmed(g, 'p1', L => singer(L, c, { pos: [-120, -40, 0], yaw: .3, t, mouth: .8, eyes: 'narrow' }), [{ col: BAND.clawd.col, lx: .6, ly: -1, d: 2.5, k: .9 }], { E });
  rimmed(g, 'p2', L => player(L, c, { who: 'regex', pos: [-40, -40, 0], yaw: .3, t, E, glow: .9 }), [{ col: BAND.regex.col, lx: .6, ly: -1, d: 2.5, k: .9 }], { E });
  rimmed(g, 'p3', L => player(L, c, { who: 'null', pos: [45, -40, 0], yaw: .3, t, E, glow: .9 }), [{ col: BAND.null.col, lx: .6, ly: -1, d: 2.5, k: .9 }], { E });
  rimmed(g, 'p4', L => drummer(L, c, { pos: [125, -40, 30], t, E, col: BAND.cron.col }), [{ col: BAND.cron.col, lx: .6, ly: -1, d: 2.5, k: .9 }], { E });
  glow(g, E, { k1: .3, k2: .3 });
}

function peopleSheet(g, t) {
  // A low sun behind them.
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, '#8fc3e3'); gr.addColorStop(.45, '#f7e3bd'); gr.addColorStop(.62, '#ffd08a'); gr.addColorStop(1, '#e9b27a');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const sg = g.createRadialGradient(W / 2, H * .5, 0, W / 2, H * .5, 700);
  sg.addColorStop(0, 'rgba(255,252,236,1)'); sg.addColorStop(.25, 'rgba(255,240,200,.6)'); sg.addColorStop(1, 'rgba(255,230,180,0)');
  g.fillStyle = sg; g.fillRect(0, 0, W, H);
  g.fillStyle = '#c99a6e'; g.fillRect(0, 1570, W, 350);
  const E = layer('emit');
  const rim = [{ col: '#ffe9b8', lx: 0, ly: -1, d: 3, k: 1, glow: .6 }, { col: '#fff4d6', lx: -1, ly: -.3, d: 2.2, k: .8, glow: .3 }];
  const poses = ['down', 'phone', 'cross', 'pockets', 'watch', 'hips', 'phoneFar', 'down', 'up', 'point'];
  const faces = ['front', 'right', 'front', 'left', 'front', 'right', 'left', 'front', 'front', 'right'];
  rimmed(g, 'crowdA', L => {
    for (let i = 0; i < 10; i++) {
      const sp = stranger(i * 7 + 3);
      const x = 110 + (i % 5) * 215, y = 600 + Math.floor(i / 5) * 470;
      person(L, x, y, 400 * sp.height, sp, { arms: poses[i], face: faces[i], look: poses[i].startsWith('phone') ? 'phone' : 'ahead' }, t);
    }
  }, rim, { E });
  const rosa = { sex: 'f', skin: SKIN[2], hair: { style: 'bun', col: HAIRC.black }, top: { kind: 'apron', col: '#e7e2d6', col2: '#f6f1e6' }, legs: { col: '#2e3446' }, build: 1.02, seed: 11 };
  const gran = { sex: 'f', age: 'old', skin: SKIN[0], hair: { style: 'curly', col: HAIRC.white }, top: { kind: 'coat', col: '#8a4f7d' }, legs: { kind: 'skirt', col: '#5a4a5e' }, glasses: true, bag: '#6b3a2a', build: .95, seed: 12 };
  const jess = { sex: 'f', skin: SKIN[1], hair: { style: 'bun', col: HAIRC.auburn }, top: { kind: 'gown', col: '#fbf8f2' }, legs: { kind: 'dress', col: '#fbf8f2' }, veil: '#ffffff', seed: 13 };
  const dave = { sex: 'm', skin: SKIN[1], hair: { style: 'bald', col: HAIRC.grey }, top: { kind: 'coat', col: '#2d3340' }, legs: { col: '#2d3340' }, build: 1.25, seed: 14 };
  const sue = { sex: 'f', skin: SKIN[3], hair: { style: 'long', col: HAIRC.black }, top: { kind: 'dress', col: '#7a2f3a' }, legs: { kind: 'skirt', col: '#7a2f3a' }, seed: 15 };
  rimmed(g, 'crowdB', L => {
    person(L, 120, 1580, 450, rosa, { arms: 'hips', face: 'front' }, t);
    person(L, 330, 1580, 380, gran, { arms: 'phoneFar', face: 'right', look: 'phone' }, t);
    person(L, 545, 1580, 440, jess, { arms: 'hold', face: 'front' }, t);
    person(L, 770, 1580, 460, dave, { arms: 'pockets', face: 'right' }, t);
    person(L, 960, 1580, 430, sue, { arms: 'cross', face: 'left' }, t);
  }, rim, { E });
  glow(g, E, { k1: .4, k2: .3 });
}

export function draw(g, t, S) {
  if (new URLSearchParams(location.search).get('v') === 'people') { setScale(g.canvas.width / W); return peopleSheet(g, t); }
  if (new URLSearchParams(location.search).get('v') === 'sheet') { setScale(g.canvas.width / W); STYLE.ink = true; INK.t = t; return sheet(g, t); }
  setScale(g.canvas.width / W);
  const q = new URLSearchParams(location.search);
  const v = q.get('v') || 'wide';
  STYLE.ink = q.get('ink') !== '0'; INK.t = t;
  const c = CAM[v]();
  if (!HOOK) HOOK = posterLine(HWS, WALL, c, [80, 60, 1000, 900], [{ w: [0] }, { w: [1, 2], k: 1 }, { w: [3] }], { gap: .1 });
  // Light: a warm white key from the front left, high, as a follow spot; the daylight from the
  // words behind as a rim; each member's colour from the side.
  setLights({
    key: { dir: [-.55, .7, .75], col: KEY, k: 1.25 },
    ambient: '#15162c',
    view: c.pos,
    extra: [
      { dir: [0.05, .4, -1], col: '#fff3de', k: .5 },
      { pos: [-260, 160, 160], col: BAND.regex.col, k: .7, range: 380 },
      { pos: [270, 160, 150], col: BAND.null.col, k: .7, range: 380 },
      { pos: [60, 260, 0], col: BAND.cron.col, k: .6, range: 300 },
      { pos: [120, 120, 300], col: BAND.clawd.col, k: .45, range: 360 },
    ],
  });
  const E = layer('emit');
  g.fillStyle = STYLE.ink ? INK.col : P.void; g.fillRect(0, 0, W, H);
  backWall(g, c, { ink: STYLE.ink, col: STYLE.ink ? INK.col : undefined, frame: STYLE.ink ? '#3a3a40' : undefined });
  wallReflection(g, c, (L, cc) => band(L, cc, t), { alpha: .3, levels: 3, decay: .5 });
  const cuts = { outside: L => outside(L, c, t), E, laser: BAND.clawd.col, light: .55, thick: 4 };
  drawCuts(g, c, 45, HOOK, cuts);
  floorPlane(g, c, { col: STYLE.ink ? INK.col : undefined, frame: STYLE.ink ? '#2c2c33' : undefined });
  floorReflection(g, c, (L, cc) => {
    drawCuts(L, cc, 45, HOOK, { ...cuts, outside: L2 => outside(L2, cc, t), E: null });
    band(L, cc, t);
    streaks(L, project(c, [0, 0, 60]).y, t, 1);
  }, { alpha: .8, fade: 1100, blur: 1.5 });
  // Rays from the words, down towards the stage.
  const rp = [];
  for (const cw of HOOK) for (const pc of cw.pieces) if (hash(pc.c[0], pc.c[1]) < .5) { const p = project(c, ap(cw.m, [pc.c[0], pc.c[1], 0])); rp.push([p.x, p.y]); }
  rays(g, rp, [W / 2, H * 1.3], 900, '#fff3dc', .9, t);
  smoke(g, c, -150, -20, 160, 50, BAND.regex.col, t, 1, .55);
  smoke(g, c, 160, -30, 160, 50, BAND.null.col, t, 2, .55);
  smoke(g, c, 0, -110, 220, 60, BAND.cron.col, t, 3, .4);
  beamInk(g, c, [110, 460, 260], [0, 0, 120], 64, BAND.clawd.col, .8, E, t);
  beamInk(g, c, [-240, 460, 60], [-82, 0, 50], 56, BAND.regex.col, .9, E, t);
  beamInk(g, c, [240, 460, 40], [84, 0, 40], 56, BAND.null.col, .9, E, t);
  beamInk(g, c, [0, 480, -90], [0, 44, -60], 60, BAND.cron.col, .7, E, t);
  // Each member: drawn, then edged with the daylight from behind and his own colour.
  for (const it of bandItems(t, E)) {
    rimmed(g, 'm_' + it.name, L => it.draw(L, c), [
      { col: STYLE.ink ? INK.paper : KEY, lx: it.rimDir[0], ly: it.rimDir[1], d: 3.2, k: .95, glow: .5 },
      { col: it.col, lx: -it.rimDir[0] * 2 - (it.name === 'regex' ? 1 : it.name === 'null' ? -1 : 0), ly: .2, d: 2.4, k: .9, glow: .5 },
    ], { E });
  }
  const sun = project(c, [60, 380, -3000]);
  shafts(g, E, sun.x, sun.y, { len: .7, k: .38, n: 26, soft: 4 });
  glow(g, E, { k1: .22, k2: .3, r1: 6, r2: 40 });
  vignette(g, .62);
  grain(g, t, .035);
}
