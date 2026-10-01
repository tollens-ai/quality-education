// The end card, after the music: what to put in a testing crew's brief, and the credits.
import { W, H, TAU, clamp, lerp, now } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED } from '../palette.js';
import { shot } from '../shots.js';
import { sunburst } from '../places.js';
import { shape, rrect, ellipse, stroke } from '../ink.js';
import { label, word, textW, DISPLAY, PATTER, SCRIPT, fitSize } from '../type.js';
import { pop, ramp } from '../common.js';
import { clawd } from '../clawd.js';
import { guess, press, stress } from '../crew.js';
import { magnifier } from '../props.js';

const END = 182.61, CARD = 8;
const BRIEF = [
  ['WHO', 'uses it, and where'],
  ['WHAT', 'matters to them'],
  ['TOOLS', 'real browsers, a playbook'],
  ['ORACLES', 'to judge what they find'],
  ['CLUES', 'follow them; try new things'],
  ['CHECKS', 'for what you\u2019ve learned'],
  ['CALLS', 'bring the hard ones to you'],
  ['REPORT', 'tried, found, not tested yet'],
];
export const CREDITS = [
  'Testing and checking: James Bach & Michael Bolton',
  'Agent-led testing approach: Yanqing Cheng',
  'Bouncing ball: after the Fleischers’ sing-alongs',
  'Lyrics: Qing with Claude · Music: Suno',
  'Drawn in JavaScript by Claude',
];

export function register() {
  shot(END, END + CARD, (g, t) => {
    const u = t - END;
    g.fillStyle = '#efe0bd'; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = .35; sunburst(g, W / 2, 330, u * .08, ['#d9c08e', '#efe0bd']); g.restore();
    shape(g, rrect(60, 150, W - 120, 1360, 30), { fill: '#f7ecd2', w: 10, seed: 14001 });
    shape(g, rrect(80, 170, W - 160, 1320, 22), { fill: null, w: 4, seed: 14002 });
    label(g, 'BRIEF YOUR', W / 2, 270, 64, { font: DISPLAY, col: PLUM });
    word(g, 'TESTING CREW', W / 2 - textW(g, 'TESTING CREW', DISPLAY, 96) / 2, 400, 96, DISPLAY, { fill: GOLD });
    BRIEF.forEach(([h, s], i) => {
      const p = pop(u, .3 + i * .18, .35); if (p <= 0) return;
      const y = 510 + i * 92;
      g.save(); g.translate(150, y); g.scale(p, p);
      shape(g, rrect(0, -36, 230, 72, 36), { fill: [TEAL, CORAL, OCHRE, ROSE, GREEN, '#7a8a3a', '#3a6a9a', PLUM][i], w: 5, seed: 14010 + i });
      label(g, h, 115, 2, fitSize(g, h, PATTER, 44, 200), { font: PATTER, col: CREAM });
      label(g, s, 260, 2, fitSize(g, s, PATTER, 48, 530), { font: PATTER, col: INK, align: 'left' });
      g.restore();
    });
    CREDITS.forEach((c, i) => label(g, c, W / 2, 1270 + i * 42, fitSize(g, c, PATTER, 32, 860), { font: PATTER, col: '#5a4a40' }));
    // the crew take a bow along the bottom
    const bow = Math.sin(clamp((u - 1) / 1.2) * Math.PI) * .25;
    guess(g, 250, 1760, .55, { t, L: 'up', R: 'hips', bang: 1, eyes: { expr: 'happy' }, lean: bow });
    clawd(g, 540, 1760, .55, { t, L: 'up', R: { to: [.3, -.2], pose: 'grip' }, hold: { R: (g, x, y, a, s) => magnifier(g, x, y, -2.2, s * .8) }, eyes: { expr: 'happy' }, hatTip: clamp((u - 1) / .4), lean: bow });
    press(g, 760, 1760, .5, { t, L: 'up', R: 'up', eyes: { expr: 'happy' }, lean: bow });
    stress(g, 930, 1760, .45, { t, L: 'up', R: 'hips', steam: .6, lean: bow });
  }, { id: 'endcard' });
}
