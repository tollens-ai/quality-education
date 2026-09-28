// "How Will I Know" — episode 2's music video. One timeline of shots, each a pure function of song
// time. The shot draws its world and its words; this file adds the camera, the cuts and the
// corner marks.
import { W, H, C, clamp, lerp, smooth, makeClock, INK } from './kit.js';
import { inkify } from './ink.js';
import { GROOVE } from './cast.js';
import { setLyrics, setShotEnd } from './lyrics.js';
import { letter, AUDIT } from './hand.js';
import { SHOTS, ENERGY } from './shots.js';
import { popups } from './scenes/popups.js';

export let markColor = C.cream;

// The two corner marks, small, lettered in the film's own hand.
export function drawMarks(g) {
  if (AUDIT.on) AUDIT.ctx = { mark: true };
  g.save();
  const col = markColor;
  letter(g, '@yanqingcheng', 36, 62, 22, { col, w: .16, seed: 5 });
  const tw = letter(g, 'TOLLENS', W - 160, 62, 22, { col, w: .16, align: 'right', seed: 9 });
  letter(g, '∴', W - 160 - tw - 36, 64, 34, { col, w: .2, seed: 8 });
  g.restore();
  if (AUDIT.on) AUDIT.ctx = null;
}

let K, S0;
export async function init(S) {
  const audio = await fetch('/video/ep02/garage/audio.json').then(r => r.json());
  K = makeClock(S.beats, audio);
  setLyrics(S.lyrics);
  S0 = S;
}

SHOTS.forEach((s, i) => { s.end = SHOTS[i + 1]?.t ?? 1e9; });
function shotAt(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t) s = x; return s; }

function energyAt(t) {
  let e = ENERGY[0][1];
  for (let i = 0; i < ENERGY.length; i++) {
    const [a, v] = ENERGY[i];
    if (t >= a) { const prev = i ? ENERGY[i - 1][1] : v; e = lerp(prev, v, smooth((t - a) / .3)); }
  }
  return e;
}

// Drawings change on twos, as in hand-drawn animation: fifteen a second, each held for two
// frames. The camera still moves on every frame.
export const DRAW_FPS = 15;
const onTwos = t => Math.floor(t * DRAW_FPS + 1e-4) / DRAW_FPS;

let buf, bg2;
export function draw(g0, t) {
  const g = inkify(g0);
  const tq = onTwos(t);
  INK.boil = Math.floor(t * DRAW_FPS + 1e-4) % 3;
  INK.res = g0.canvas.width / W;
  const shot = shotAt(t);
  const i = SHOTS.indexOf(shot);
  markColor = shot.mark || C.cream;
  // A wipe or dissolve in from the previous shot, drawn to a second canvas.
  const tr = shot.wipe || shot.xfade;
  if (tr && t - shot.t < tr && i > 0) {
    if (!buf || buf.width !== g0.canvas.width) { buf = document.createElement('canvas'); buf.width = g0.canvas.width; buf.height = g0.canvas.height; bg2 = inkify(buf.getContext('2d')); }
    bg2.setTransform(g0.getTransform());
    bg2.clearRect(0, 0, W, H);
    drawShot(bg2, SHOTS[i - 1], t, tq);
    drawShot(g, shot, t, tq);
    const p = smooth((t - shot.t) / tr);
    g0.save(); g0.setTransform(1, 0, 0, 1, 0, 0);
    if (shot.wipe) {
      // The old shot is torn away upwards like a page.
      const cw = g0.canvas.width, ch = g0.canvas.height, y = ch * (1 - p);
      g0.beginPath(); g0.moveTo(0, 0); g0.lineTo(cw, 0);
      for (let k = 0; k <= 24; k++) g0.lineTo(cw - k * cw / 24, y + ((k % 2) ? 14 : -10) * cw / 1080 + Math.sin(k * 1.7) * 8 * cw / 1080);
      g0.closePath(); g0.clip();
      g0.drawImage(buf, 0, 0);
    } else {
      g0.globalAlpha = 1 - p;
      g0.drawImage(buf, 0, 0);
    }
    g0.restore();
  } else drawShot(g, shot, t, tq);
  // The band's backing "oooh"s pop up over whatever shot is on screen.
  g.save(); popups(g, tq); g.restore();
  // A flash of paper at the big hits.
  if (shot.flash !== undefined) {
    const a = (1 - smooth((t - shot.flash) / .2)) * (shot.flashA ?? .8);
    if (a > 0) { g0.save(); g0.setTransform(1, 0, 0, 1, 0, 0); g0.globalAlpha = a; g0.fillStyle = shot.flashCol || C.cream; g0.fillRect(0, 0, g0.canvas.width, g0.canvas.height); g0.restore(); }
  }
  if (t > S0.duration - .9) { g0.save(); g0.setTransform(1, 0, 0, 1, 0, 0); g0.globalAlpha = smooth((t - S0.duration + .9) / .8); g0.fillStyle = C.ink; g0.fillRect(0, 0, g0.canvas.width, g0.canvas.height); g0.restore(); }
}

function drawShot(g, shot, t, tq) {
  const lt = tq - shot.t, dur = Math.min(shot.end, S0.duration) - shot.t;
  const c = { K, S: S0, lt, dur, p: clamp(lt / dur), shot, t0: shot.t };
  const energy = energyAt(tq);
  GROOVE.bp = K.beatPos(tq); GROOVE.amp = energy;
  c.energy = energy;
  g.save();
  // The camera breathes with the kick and drifts a touch, like a hand-held rostrum.
  const kick = clamp((K.env('low', t) - .5) * 2) * clamp(energy - .4);
  const zk = 1 + .014 * kick * (shot.breathe ?? 1);
  const dx = Math.sin(t * .37) * 5 * energy, dy = Math.cos(t * .29) * 5 * energy, rot = Math.sin(t * .23) * .002 * energy;
  g.translate(540 + dx, 960 + dy); g.rotate(rot); g.scale(zk, zk); g.translate(-540, -960);
  if (shot.push) {
    const z = lerp(shot.push[0], shot.push[1], smooth(clamp((t - shot.t) / dur)));
    const pc = shot.pushAt || [540, 960];
    g.translate(pc[0], pc[1]); g.scale(z, z); g.translate(-pc[0], -pc[1]);
  }
  g.translate(540, 960); g.scale(1.014, 1.014); g.translate(-540, -960);
  setShotEnd(shot.end);
  shot.draw(g, tq, c);
  g.restore();
}
