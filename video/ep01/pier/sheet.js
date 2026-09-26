// Character sheet: the cast side by side under stage light, for checking the look.
import { W, H, C, vgrad, rgrad, glow, text, circle } from './kit.js';
import { clawd, molty, grok, blossom, muse, person, loadMarks, mic } from './cast.js';
import { finish } from './post.js';

export const fonts = [
  ['Bricolage', 'video/fonts/BricolageGrotesque.ttf', { weight: '200 800', stretch: '75% 100%' }],
  ['Mono', 'video/fonts/JetBrainsMono.ttf', { weight: '100 800' }],
];
export const font = 'Bricolage';
export let markColor = 'rgba(255,255,255,.7)';

export async function init() { await loadMarks('/.private/ep01-assets'); }

export function draw(g, t) {
  g.fillStyle = vgrad(g, 0, H, [[0, C.night0], [.6, C.night2], [1, '#3b1f55']]);
  g.fillRect(0, 0, W, H);
  glow(g, 540, 700, 700, C.violet, .35);
  glow(g, 540, 1500, 600, C.pink, .2);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 1180, W, 740);
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
  text(g, 'Make it good for who?', 540, 1860, { size: 72, color: C.cream, shadow: 'rgba(20,8,40,.6)' });
  finish(g, { bloom: .5, vignette: .5, grain: .6 });
}
