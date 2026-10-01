// The finish of an old cartoon print: the picture weaves a little in the gate, the light breathes,
// and the corners fall off into shadow. No grain over the drawing: the hand is in the line.
// Also the joins the era used: the iris in and out, and the wipe.
import { W, H, TAU, noise, clamp, DRAW_FPS } from './kit.js';
import { INK } from './palette.js';

let VIG = null;
function vignette() {
  if (VIG) return VIG;
  VIG = document.createElement('canvas'); VIG.width = W; VIG.height = H;
  const g = VIG.getContext('2d');
  const gr = g.createRadialGradient(W / 2, H * .48, H * .28, W / 2, H * .5, H * .78);
  gr.addColorStop(0, 'rgba(40,20,5,0)'); gr.addColorStop(.7, 'rgba(40,20,5,.14)'); gr.addColorStop(1, 'rgba(30,14,4,.5)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  return VIG;
}
// The gate weave for a frame at time t: a small shift of the whole picture, changing on twos.
export function weave(t) {
  const k = Math.floor(t * DRAW_FPS);
  return [noise(k * .31, 901) * 1.6, noise(k * .29, 902) * 2.2];
}
export function finish(g, t, o = {}) {
  g.save();
  g.drawImage(vignette(), 0, 0);
  // the lamp's flicker
  const k = Math.floor(t * DRAW_FPS), f = noise(k * .7, 903) * .025 + (o.flicker ?? 0);
  if (f > 0) { g.fillStyle = `rgba(255,245,220,${f})`; g.fillRect(0, 0, W, H); }
  else { g.fillStyle = `rgba(30,15,5,${-f})`; g.fillRect(0, 0, W, H); }
  g.restore();
}
// An iris: black everywhere except a circle of radius r at (x, y).
export function iris(g, x, y, r, col = INK) {
  g.save();
  g.fillStyle = col;
  g.beginPath(); g.rect(-20, -20, W + 40, H + 40); g.arc(x, y, Math.max(0, r), 0, TAU, true); g.fill('evenodd');
  g.restore();
}
