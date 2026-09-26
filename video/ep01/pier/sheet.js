// Character sheet: the cast side by side on a painted night, for checking the look.
import { W, H, C, INK } from './kit.js';
import { clawd, molty, grok, blossom, muse, person, loadMarks, mic } from './cast.js';
import { inkify } from './ink.js';
import { paperOver } from './post.js';

export const fonts = [
  ['Mono', 'video/fonts/JetBrainsMono.ttf', { weight: '100 800' }],
];
export const font = 'Mono';
export let markColor = 'rgba(255,255,255,.7)';

export async function init() { await loadMarks('/.private/ep01-assets'); }

export function draw(g0, t) {
  const g = inkify(g0);
  INK.boil = Math.floor(t * 15 + 1e-4) % 3;
  g.fillStyle = '#231e4f'; g.fillRect(0, 0, W, 1180);
  g.fillStyle = '#3a2748'; g.fillRect(0, 1180, W, 740);
  clawd(g, 330, 560, { s: 420, eyes: 'open', rim: C.cyan, rimSide: 1, mouth: 0, smile: 1, armR: -.5, hold: (g2, u) => mic(g2, u) });
  clawd(g, 820, 520, { s: 260, eyes: 'happy', mouth: .8, rim: C.pink, rimSide: -1, armL: -.9, armR: -.9, hat: 'party', blush: 1 });
  clawd(g, 810, 820, { s: 200, eyes: 'worried', sweat: 1, rim: C.cyan, frown: 1 });
  molty(g, 170, 1150, { s: 230, rim: C.cyan, t: 0, clawL: .3, clawR: -.3 });
  grok(g, 430, 1150, { s: 230, rim: C.pink, armL: .5, armR: -.6 });
  blossom(g, 680, 1150, { s: 210, rim: C.cyan, eyes: 'happy', mouth: .5 });
  muse(g, 920, 1150, { s: 200, rim: C.pink, t: 0 });
  const tops = ['#4a7bff', '#ff7a59', '#2fbf8f', '#f2c14e', '#b06bff', '#ff4fa3'];
  const styles = ['short', 'long', 'bun', 'curly', 'grey', 'beanie'];
  for (let i = 0; i < 6; i++) person(g, 110 + i * 172, 1640, { s: 110, skin: ['#f6d0b1', '#c98d67', '#7c4a32', '#e8b48f', '#f6d0b1', '#a86b4a'][i], hairStyle: styles[i], top: tops[i], eyes: i % 2 ? 'happy' : 'open', mouth: i === 3 ? .6 : 0, glasses: i === 4 ? 'round' : i === 5 ? 'dark' : null });
  paperOver(g);
}
