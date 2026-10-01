// The end card, after the music: the title, the series, the credits, and the company taking a bow
// in front of the curtain. (The only lettering in the film that isn't sung, with the corner marks.)
import { W, H, TAU, clamp, lerp, now, easeOut, backOut } from '../kit.js';
import { INK, CREAM, GOLD, GOLD_SH, RED, WHITE, C } from '../palette.js';
import { shot } from '../shots.js';
import { bake, wash, light, gloom, paper, box } from '../bg.js';
import { shape, stroke, ellipse, rrect, spline } from '../ink.js';
import { word, textW, label, fitSize, DISPLAY, PATTER } from '../type.js';
import { pop, ramp } from '../common.js';
import { clawd } from '../clawd.js';
import { guess, press, stress } from '../crew.js';
import { mabel } from '../people.js';
import { magnifier } from '../cast.js';

const END = 182.61, CARD = 8;
export const CREDITS = [
  'Lyrics: gpt-6.1-sol',
  'Music and voice: Suno',
  'Drawn and animated in JavaScript by Claude',
  'Testing vs checking, after James Bach & Michael Bolton',
  'Agent-led testing approach: Yanqing Cheng',
  'Bouncing ball after the Fleischers\u2019 sing-alongs',
  'Character design inspired by Cuphead (Studio MDHR)',
  'Overhead formations after Busby Berkeley',
];
function velvet() {
  return bake('endVelvet', W, H, (g, w, h) => {
    wash(g, box(0, 0, w, h), '#8a1a1c', { seed: 9001, gran: .5, rim: 0, blooms: 20, amt: 0 });
    for (let i = 0; i <= 16; i++) { const x = i / 16 * w, w2 = w / 16; const gr = g.createLinearGradient(x - w2 / 2, 0, x + w2 / 2, 0); gr.addColorStop(0, 'rgba(40,0,6,.5)'); gr.addColorStop(.45, 'rgba(255,140,120,.2)'); gr.addColorStop(1, 'rgba(40,0,6,.5)'); g.fillStyle = gr; g.fillRect(x - w2 / 2, 0, w2, h); }
    light(g, w / 2, h * .42, 900, '#ffcf9a', .25);
    gloom(g, w, h, w / 2, h * .45, 300, 1200, '#1a0204', .8);
    paper(g, w, h, .4);
  });
}
export function register() {
  shot(END, END + CARD, (g, T) => {
    const t = now(), u = t - END;
    g.drawImage(velvet(), 0, 0);
    if (typeof window !== 'undefined') window.__textTag = 'endcard';
    // the title, as it opened the film
    const rows = [['Did', 'You'], ['Actually'], ['Test', 'It?']], sizes = [104, 120, 134];
    let wi = 0;
    rows.forEach((row, ri) => {
      const size = sizes[ri], sp = textW(g, ' ', DISPLAY, size) * 1.3, total = row.reduce((a, w) => a + textW(g, w, DISPLAY, size), 0) + sp * (row.length - 1);
      let x = W / 2 - total / 2;
      for (const w of row) { const ww = textW(g, w, DISPLAY, size), p = clamp((u - wi * .08) / .25); if (p > 0) { g.save(); g.translate(x + ww / 2, 250 + ri * size * 1.02); const sc = backOut(p, 1.8); g.scale(sc, sc); word(g, w, -ww / 2, 0, size, DISPLAY, { fill: '#f3c94e', ink: '#3a1004', shadow: '#2a0806', sh: .06, ow: .12, seed: 9100 + wi }); g.restore(); } x += ww + sp; wi++; }
    });
    const series = 'Software Quality Theory 101 · Episode 4';
    label(g, series, W / 2, 640, fitSize(g, series, PATTER, 46, 900), { font: PATTER, col: CREAM, ow: .18, ink: INK });
    // the credits, on a cream card with a gold rule
    const cp = easeOut(ramp(u, .5, .4));
    g.save(); g.globalAlpha = cp;
    shape(g, rrect(110, 710, W - 220, 540, 26), { fill: '#f6ecd2', form: 'block', k: .5, w: 8, seed: 9200 });
    shape(g, rrect(130, 730, W - 260, 500, 18), { fill: null, w: 3, seed: 9201, line: GOLD_SH });
    CREDITS.forEach((c, i) => label(g, c, W / 2, 792 + i * 57, fitSize(g, c, PATTER, 38, 760), { font: PATTER, col: i === 0 ? '#7a2a1c' : '#3a2a20' }));
    g.restore();
    if (typeof window !== 'undefined') window.__textTag = null;
    // the company bows along the stage's edge
    const bow = Math.sin(clamp((u - 1.4) / 1.4) * Math.PI) * .28;
    const fl = 1640;
    g.save(); g.fillStyle = 'rgba(20,6,4,.55)'; g.fillRect(0, fl - 10, W, H); g.restore();
    mabel(g, 170, fl, .42, { t, L: 'up', R: 'hips', eyes: { expr: 'happy' }, lean: bow * .5 });
    guess(g, 360, fl, .52, { t, L: 'up', R: 'hips', bang: 1, eyes: { expr: 'happy' }, lean: bow });
    clawd(g, 560, fl, .58, { t, L: 'up', R: { to: [.3, -.2], pose: 'grip' }, hold: { R: (g, x, y, a, s) => magnifier(g, x, y, -2.2, s * .8) }, eyes: { expr: 'happy' }, hatTip: clamp((u - 1.4) / .4) * (1 - clamp((u - 3) / .4)), lean: bow });
    press(g, 760, fl, .5, { t, L: 'up', R: 'up', eyes: { expr: 'happy' }, lean: bow });
    stress(g, 930, fl, .46, { t, L: 'up', R: 'hips', steam: .6, eyes: { expr: 'happy' }, lean: bow });
  }, { id: 'endcard' });
}
