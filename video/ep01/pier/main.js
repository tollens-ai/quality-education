// "Good for Who?" — the music video. One timeline of shots, each a pure function of song time.
// The shot draws its world; this file adds the caption, the camera drift, the finishing and the
// corner marks' colour.
import { W, H, C, clamp, lerp, smooth, inv, makeClock } from './kit.js';
import { loadMarks, GROOVE } from './cast.js';
import { setLyrics, drawCaption } from './lyrics.js';
import { finish, fill } from './post.js';
import * as V1 from './scenes/verse1.js';
import * as PC from './scenes/pre.js';
import * as CH from './scenes/chorus.js';
import * as HU from './scenes/huts.js';
import * as P2 from './scenes/pre2.js';
import * as ST from './scenes/stage.js';
import * as BR from './scenes/bridge.js';
import * as BK from './scenes/break.js';
import * as FI from './scenes/final.js';
import * as OU from './scenes/outro.js';

// The people from the huts, in the front row of chorus 2.
const FRONT = [
  { x: 90, s: 112, o: HU.PEOPLE.nana },
  { x: 250, s: 120, o: HU.PEOPLE.demo, both: true },
  { x: 420, s: 116, o: HU.PEOPLE.chat1 },
  { x: 590, s: 120, o: HU.PEOPLE.student, both: true },
  { x: 760, s: 118, o: HU.PEOPLE.baker },
  { x: 930, s: 116, o: HU.PEOPLE.blind },
];

export const fonts = [
  ['Bricolage', 'video/fonts/BricolageGrotesque.ttf', { weight: '200 800', stretch: '75% 100%' }],
  ['Mono', 'video/fonts/JetBrainsMono.ttf', { weight: '100 800' }],
];
export const font = 'Bricolage';
export let markColor = 'rgba(255,255,255,.72)';

let K, S0;
export async function init(S) {
  await loadMarks('/.private/ep01-assets');
  const audio = await fetch('/video/ep01/pier/audio.json').then(r => r.json());
  K = makeClock(S.beats, audio);
  setLyrics(S.lyrics);
  S0 = S;
}

const DAY = { color: '#2a1640', hot: '#ff4a2a', shadowCol: 'rgba(255,250,240,.95)', shadowBlur: 26, backing: { color: '#e0306a' } };
const DUSK = { color: '#fff8ee', hot: '#ffe08a', shadowCol: 'rgba(80,20,60,.75)' };

// The shot list. cap: caption style (or false when the shot sets its own words). post: finishing.
// push: slow camera push-in over the shot [from, to]. xfade: dissolve in from the previous shot.
// flash: a white flash at that time. mark: corner-mark colour, dark on daylight.
const SHOTS = [
  { t: 0, draw: V1.intro, cap: { y: 330, size: 96, ahead: 5 }, post: { bloom: .6 }, push: [1, 1.03] },
  { t: 4.52, draw: V1.flossShot, cap: { y: 250, size: 88 }, post: { bloom: .7 }, push: [1.02, 1] },
  { t: 8.0, draw: V1.twoFAShot, cap: { y: 250, size: 92 }, post: { bloom: .55 }, push: [1, 1.03] },
  { t: 10.76, draw: V1.kubeShot, cap: { y: 220, size: 84 }, post: { bloom: .6 }, push: [1.03, 1] },
  { t: 13.2, draw: V1.subagentShot, cap: { y: 250, size: 84 }, post: { bloom: .6 }, push: [1, 1.04] },
  { t: 15.64, draw: V1.wrongShot, cap: { y: 330, size: 92 }, post: { bloom: .5 }, push: [1, 1.05] },
  { t: 17.04, draw: V1.quotaShot, cap: { y: 330, size: 100 }, post: { bloom: .6 }, push: [1, 1.02] },
  { t: 18.66, draw: V1.askShot, cap: { y: 1150, size: 70, weight: 600, color: '#d9d2ee', hot: '#ffffff' }, post: { bloom: .8, vignette: .3 } },
  { t: 20.8, draw: PC.pcWide, cap: { y: 210, size: 84 }, post: { bloom: .55 } },
  { t: 24.0, draw: PC.pcTorch, cap: { y: 1330, size: 96 }, post: { bloom: .6 }, push: [1.02, 1] },
  { t: 25.04, draw: PC.pcRead, cap: { y: 250, size: 90 }, post: { bloom: .5 }, push: [1, 1.05] },
  // Chorus 1: lights on, and nobody here but a seagull.
  { t: 27.2, draw: (g, t, c) => CH.hookWide(g, t, c, { line: 27.2, word: 'WHO?', seagull: { x: 610, y: 1560, s: 1.6 }, ignite: 27.2 }), cap: false, post: { bloom: .75 }, flash: 27.2, flashA: .35 },
  { t: 29.92, draw: (g, t, c) => CH.hookBand(g, t, c, { line: 29.92, word: 'WHAT?', back: 0 }), cap: false, post: { bloom: .7 } },
  { t: 32.72, draw: (g, t, c) => CH.triangleShot(g, t, c, { line: 32.72, variant: 1 }), cap: { y: 1440, size: 80 }, post: { bloom: .7 } },
  { t: 35.44, draw: (g, t, c) => CH.wowKeepShot(g, t, c, { line: 35.44, variant: 1 }), cap: { y: 170, size: 80 }, post: { bloom: .75 } },
  { t: 38.08, draw: (g, t, c) => CH.hookClose(g, t, c, { line: 38.08, word: 'WHO?' }), cap: false, post: { bloom: .7 } },
  { t: 40.76, draw: (g, t, c) => CH.hookWide(g, t, c, { line: 40.76, word: 'WHAT?', seagull: { x: 420, y: 1500, s: 1.5 } }), cap: false, post: { bloom: .75 } },
  { t: 43.62, draw: (g, t, c) => CH.shipShot(g, t, c, { line: 43.62 }), cap: { y: 250, size: 88 }, post: { bloom: .65 } },
  { t: 44.62, draw: (g, t, c) => CH.polishShot(g, t, c, { line: 43.62 }), cap: { y: 540, size: 88 }, post: { bloom: .6 } },
  { t: 46.46, draw: (g, t, c) => CH.needShot(g, t, c, { line: 46.46 }), cap: { y: 250, size: 88 }, post: { bloom: .6 } },
  { t: 47.6, draw: (g, t, c) => CH.showShot(g, t, c, { line: 46.46, boom: 47.82 }), cap: { y: 1450, size: 92 }, post: { bloom: .8 } },
  // Verse 2: the beach huts, one person per line.
  { t: 50.5, draw: HU.hutsShot, cap: { y: 250, size: 96 }, post: { bloom: .55 } },
  { t: 72.48, draw: HU.hutsWide, cap: false, post: { bloom: .6 } },
  // Pre-chorus 2: everyone at once.
  { t: 76.54, draw: P2.pc2Ring, cap: { y: 210, size: 84 }, post: { bloom: .5 } },
  { t: 79.76, draw: P2.pc2Dizzy, cap: { y: 240, size: 96 }, post: { bloom: .55 }, push: [1, 1.06] },
  // Chorus 2: the pier is full.
  { t: 82.96, draw: (g, t, c) => { ST.crowdReverse(g, t, c.K, { people: FRONT }); ST.hookSign(g, t, 82.96, 'WHO?', 540, 330, .9); ST.backingScript(g, t, 82.96, 540, 670, 62); }, cap: false, post: { bloom: .75 }, flash: 82.96 },
  { t: 85.68, draw: (g, t, c) => CH.hookBand(g, t, c, { line: 85.68, word: 'WHAT?', back: 0, crowd: 1 }), cap: false, post: { bloom: .7 } },
  { t: 88.44, draw: (g, t, c) => CH.triangleShot(g, t, c, { line: 88.44, variant: 2 }), cap: { y: 1440, size: 80 }, post: { bloom: .7 } },
  { t: 91.04, draw: (g, t, c) => CH.wowKeepShot(g, t, c, { line: 91.04, variant: 2 }), cap: { y: 170, size: 80 }, post: { bloom: .75 } },
  { t: 93.82, draw: (g, t, c) => CH.hookClose(g, t, c, { line: 93.82, word: 'WHO?', crowd: 1 }), cap: false, post: { bloom: .7 } },
  { t: 96.54, draw: (g, t, c) => CH.hookWide(g, t, c, { line: 96.54, word: 'WHAT?', crowd: 1 }), cap: false, post: { bloom: .75 } },
  { t: 99.3, draw: (g, t, c) => CH.shipShot(g, t, c, { line: 99.3, pusher: 'person', pusherO: HU.PEOPLE.student, flag: 'DUE 9AM' }), cap: { y: 250, size: 88 }, post: { bloom: .65 } },
  { t: 100.4, draw: (g, t, c) => CH.polishShot(g, t, c, { line: 99.3, who: 'person', whoO: HU.PEOPLE.baker }), cap: { y: 540, size: 88 }, post: { bloom: .6 } },
  { t: 102.2, draw: (g, t, c) => CH.needShot2(g, t, c, { line: 102.2, personO: HU.PEOPLE.blind }), cap: { y: 250, size: 88 }, post: { bloom: .6 } },
  { t: 103.1, draw: (g, t, c) => CH.showShot(g, t, c, { line: 102.2, boom: 103.58, crowd: 1 }), cap: { y: 1450, size: 92 }, post: { bloom: .8 } },
  // Bridge: the code sky, the wall, the climb, the people on the other side.
  { t: 106.3, draw: BR.trainingShot, cap: { y: 1330, size: 84, backing: { y: 1200, color: '#ff9ad0' } }, post: { bloom: .8, vignette: .6 }, push: [1.06, 1] },
  { t: 112.3, draw: BR.wallShot, xfade: .5, cap: { y: 300, size: 84 }, post: { bloom: .6 } },
  { t: 117.32, draw: BR.climbShot, xfade: .4, cap: { y: 140, size: 80 }, post: { bloom: .6 } },
  { t: 123.36, draw: BR.revealShot, xfade: .5, cap: { y: 170, size: 84 }, post: { bloom: .75 }, push: [1.04, 1] },
  // Break: the definition in lights, then everyone it's about.
  { t: 128.8, draw: BK.archShot, cap: false, post: { bloom: .8 } },
  { t: 134.68, draw: BK.mattersShot, xfade: .3, cap: false, post: { bloom: .7 } },
  { t: 137.48, draw: BK.someoneShot, cap: { y: 300, size: 110, until: 139.2 }, post: { bloom: .7 } },
  { t: 142.42, draw: BK.debugShot, cap: { y: 250, size: 88 }, post: { bloom: .6 } },
  // Final pre-chorus: the plea at first light, and you start to type.
  { t: 147.56, draw: FI.pleaShot, xfade: .5, cap: { y: 250, size: 88 }, post: { bloom: .6 }, push: [1, 1.06] },
  { t: 153.32, draw: FI.typeShot, xfade: .4, cap: { y: 250, size: 92 }, post: { bloom: .6 } },
  // Final chorus at sunrise: every question answered.
  { t: 160.5, draw: (g, t, c) => FI.finalWho(g, t, c, { line: 160.5, word: 'WHO?', answer: 'ME!', flip: 161.95, people: FRONT }), cap: false, post: { bloom: .7 }, flash: 160.5 },
  { t: 163.18, draw: (g, t, c) => FI.finalWhat(g, t, c, { line: 163.18, word: 'WHAT?', answer: 'ONE TAP!', flip: 164.62 }), cap: false, post: { bloom: .7 } },
  { t: 166.17, draw: (g, t, c) => CH.triangleShot(g, t, c, { line: 166.17, variant: 3 }), cap: { y: 1440, size: 80 }, post: { bloom: .7 } },
  { t: 168.74, draw: (g, t, c) => CH.wowKeepShot(g, t, c, { line: 168.74, variant: 3 }), cap: { y: 170, size: 80 }, post: { bloom: .75 } },
  { t: 171.34, draw: (g, t, c) => FI.finalWho(g, t, c, { line: 171.34, word: 'WHO?', answer: 'YOU TOO!', flip: 172.75, people: FRONT, point: true }), cap: false, post: { bloom: .7 } },
  { t: 174.12, draw: (g, t, c) => FI.finalWhat(g, t, c, { line: 174.12, word: 'WHAT?', answer: 'PBs!', flip: 175.45 }), cap: false, post: { bloom: .7 } },
  { t: 176.74, draw: (g, t, c) => CH.shipShot(g, t, c, { line: 176.74, pusher: 'hand', flag: 'MON' }), cap: { y: 250, size: 88 }, post: { bloom: .65 } },
  { t: 179.72, draw: FI.appShot, cap: { y: 250, size: 88 }, post: { bloom: .6 } },
  { t: 181.9, draw: FI.builtShot, cap: false, post: { bloom: .55 } },
  // Outro: summer.
  { t: 184.6, draw: OU.summerTap, cap: { y: 250, size: 92, ...DAY }, post: { bloom: .4, vignette: .3 }, mark: 'rgba(42,22,64,.7)' },
  { t: 187.7, draw: OU.beachBots, cap: { y: 250, size: 92, ...DAY }, post: { bloom: .4, vignette: .3 }, mark: 'rgba(42,22,64,.7)' },
  { t: 190.4, draw: OU.toyShot, cap: { y: 250, size: 96, ...DAY }, post: { bloom: .4, vignette: .3 }, mark: 'rgba(42,22,64,.7)' },
  { t: 193.26, draw: OU.tideShot, xfade: .4, cap: { y: 300, size: 96, hold: 3, ...DUSK }, post: { bloom: .55, vignette: .4 } },
];
SHOTS.forEach((s, i) => { s.end = SHOTS[i + 1]?.t ?? 1e9; });

function shotAt(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t) s = x; return s; }

// How hard everything dances, section by section: [from, energy].
const ENERGY = [[0, .2], [2.1, .7], [4.5, .85], [15.6, .35], [18.1, 0], [20.8, .5], [27.2, 1], [50.5, .8], [72.5, .95],
  [76.5, .6], [83, 1.1], [106.3, .3], [128.8, .9], [137.4, .6], [147.5, .35], [160.5, 1.2], [183.7, .75], [196, .4]];
function energyAt(t) {
  let e = ENERGY[0][1];
  for (let i = 0; i < ENERGY.length; i++) {
    const [a, v] = ENERGY[i];
    if (t >= a) { const prev = i ? ENERGY[i - 1][1] : v; e = lerp(prev, v, smooth((t - a) / .3)); }
  }
  return e;
}

// A second canvas for cross-dissolves between shots.
let buf, bg2;
export function draw(g, t) {
  const shot = shotAt(t);
  const i = SHOTS.indexOf(shot);
  markColor = shot.mark || 'rgba(255,255,255,.72)';
  if (shot.xfade && t - shot.t < shot.xfade && i > 0) {
    if (!buf || buf.width !== g.canvas.width) { buf = document.createElement('canvas'); buf.width = g.canvas.width; buf.height = g.canvas.height; bg2 = buf.getContext('2d'); }
    bg2.setTransform(g.getTransform());
    bg2.clearRect(0, 0, W, H);
    drawShot(bg2, SHOTS[i - 1], t);
    drawShot(g, shot, t);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1 - smooth((t - shot.t) / shot.xfade);
    g.drawImage(buf, 0, 0);
    g.restore();
  } else drawShot(g, shot, t);
  if (shot.cap !== false) drawCaption(g, t, shot.cap || {});
  finish(g, { bloom: .55, vignette: .5, grain: .6, frame: Math.round(t * 30), ...(shot.post || {}) });
  // A white flash when the lights come on.
  if (shot.flash !== undefined) fill(g, '#fff6ea', (1 - smooth((t - shot.flash) / .22)) * (shot.flashA ?? .9));
  // Fade out on the last note.
  if (t > 200.1) fill(g, '#07040f', smooth((t - 200.1) / .6));
}

function drawShot(g, shot, t) {
  const lt = t - shot.t, dur = Math.min(shot.end, 201) - shot.t;
  const c = { K, S: S0, lt, dur, p: clamp(lt / dur), shot };
  const energy = energyAt(t);
  GROOVE.bp = K.beatPos(t); GROOVE.amp = energy;
  g.save();
  // The camera breathes with the kick drum and drifts a touch, like a hand-held lens.
  const kick = clamp((K.env('low', t) - .5) * 2) * clamp(energy - .4);
  const zk = 1 + .012 * kick;
  const dx = Math.sin(t * .37) * 5 * energy, dy = Math.cos(t * .29) * 5 * energy, rot = Math.sin(t * .23) * .0022 * energy;
  g.translate(540 + dx, 960 + dy); g.rotate(rot); g.scale(zk, zk); g.translate(-540, -960);
  if (shot.push) {
    const z = lerp(shot.push[0], shot.push[1], smooth(c.p));
    const pc = shot.pushAt || [540, 960];
    g.translate(pc[0], pc[1]); g.scale(z, z); g.translate(-pc[0], -pc[1]);
  }
  // A little overscan so the drift never shows an edge.
  g.translate(540, 960); g.scale(1.012, 1.012); g.translate(-540, -960);
  shot.draw(g, t, c);
  g.restore();
}
