// Look development: character sheets and studies, one view at a time.
//   node video/lib/render.mjs --scene video/ep04/ball/look.js --song .private/ep04-piano/stub --stills 1 --w 1080 --query v=clawd
import { W, H, setNow, twos, loadRecord } from './kit.js';
import { CREAM, CARD, INK, TEAL, SKY } from './palette.js';
import { clawd, cane } from './clawd.js';
import { magnifier } from './props.js';
import { guess, press, stress, check } from './crew.js';
import { mabel, person } from './people.js';
import { townSquare } from './paint.js';
import { finish, weave } from './film.js';
import { drawLyrics } from './lyrics.js';
import { REC } from './kit.js';

export const fonts = [['Corben', 'video/ep04/ball/fonts/Corben-Bold.ttf'], ['Lilita', 'video/ep04/ball/fonts/LilitaOne-Regular.ttf'], ['Oleo', 'video/ep04/ball/fonts/OleoScript-Bold.ttf']];

const q = new URLSearchParams(location.search);
const V = q.get('v') || 'clawd';

export async function init(S) {
  await loadRecord(S, '/music/ep04/piano/audio.json');
  if (!REC.lines.length) {
    // stand-in words for look development
    const mk = (text, s0, dt, sec, c, k) => ({ text, section: sec, couplet: c, line_in_couplet: k, words: text.split(' ').map((w, i) => ({ w, s: s0 + i * dt, e: s0 + (i + 1) * dt })) });
    REC.lines = [mk('Two hundred "tests", each one is green;', 1, .5, 'Intro', 1, 0), mk("The finest score you've ever seen!", 4.6, .5, 'Intro', 1, 1),
      mk('Did you actually test it?', 20, .35, 'Chorus', 5, 0), mk('Press it, stress it, second-guess it!', 22, .3, 'Chorus', 5, 1)];
  }
}

export function draw(g, t) {
  const tq = twos(t); setNow(tq);
  g.fillStyle = CREAM; g.fillRect(0, 0, W, H);
  if (V === 'clawd') {
    clawd(g, 290, 520, 1, { t: tq, L: 'hips', R: 'wave', eyes: { expr: 'open' } });
    clawd(g, 790, 520, 1, { t: tq, L: 'up', R: 'up', eyes: { expr: 'happy' }, sing: .8, hatTip: .6 });
    clawd(g, 290, 1000, 1, { t: tq, L: 'present', R: { to: [.2, -.1], pose: 'grip' }, hold: { R: (g, x, y, a, s) => cane(g, x, y, 1.35, s) }, eyes: { expr: 'smug' } });
    clawd(g, 790, 1000, 1, { t: tq, L: 'cover', R: 'shrug', eyes: { expr: 'wide', lx: .5 }, smile: -1 });
    clawd(g, 290, 1480, 1, { t: tq, L: 'chin', R: 'hold', hold: { R: (g, x, y, a, s) => magnifier(g, x, y, -.9, s) }, eyes: { expr: 'worried', lx: .6, ly: -.3 }, smile: -.5 });
    clawd(g, 790, 1480, 1, { t: tq, L: 'point', R: 'cheer', eyes: { expr: 'open', lx: -.6 }, sing: .5, walk: tq * 2 });
    clawd(g, 540, 1860, .5, { t: tq, L: 'hang', R: 'hang', hat: 'none', eyes: {} });
  }
  if (V === 'crew') {
    guess(g, 200, 700, 1, { t: tq, L: 'chin', R: 'hold', hold: { R: (g, x, y, a, s) => magnifier(g, x, y, -1.1, s) } });
    press(g, 560, 700, 1, { t: tq, L: 'up', R: 'press', sing: .7 });
    stress(g, 870, 700, 1, { t: tq, L: 'hips', R: 'cheer', gauge: .9, steam: 1 });
    guess(g, 200, 1300, 1, { t: tq, L: 'up', R: 'cheer', bang: 1, eyes: { expr: 'happy' }, sing: .8 });
    press(g, 560, 1300, 1, { t: tq, L: 'hips', R: 'hang', eyes: { expr: 'wide', lx: .7 }, pressed: 1 });
    stress(g, 870, 1300, 1, { t: tq, L: 'out', R: 'out', gauge: .2, eyes: { expr: 'shut' }, sing: .5 });
    for (let i = 0; i < 5; i++) check(g, 130 + i * 190, 1800, 1, { t: tq, card: i < 2 ? '2+2=5' : 'SAVED?', flag: i === 2 ? 'up-red' : i === 3 ? 0 : 'up-green', wave: true, phase: i, march: i === 4 });
  }
  if (V === 'hero') {
    const [wx, wy] = weave(t);
    g.save(); g.translate(wx, wy);
    g.drawImage(townSquare(), -160, -140);
    // the massed checks, rows receding
    for (let r = 5; r >= 0; r--) {
      const sc = .42 + r * -.0 + (5 - r) * .09, y = 1080 + (5 - r) * 62, n = Math.round(10 - (5 - r) * .6);
      for (let i = 0; i < n; i++) { const x = 540 + (i - (n - 1) / 2) * (1000 / n) * (1 + (5 - r) * .06); if (Math.abs(x - 540) < 170 && r < 2) continue; check(g, x, y, sc, { t: tq, card: '✓', flag: 'up-green', wave: true, phase: i * .7 + r }); }
    }
    clawd(g, 540, 1500, 1.15, { t: tq, L: 'up', R: { to: [.25, -.05], pose: 'grip' }, hold: { R: (g, x, y, a, s) => cane(g, x, y, 1.2, s) }, eyes: { expr: 'happy' }, sing: .7, hatTip: .3 });
    drawLyrics(g, t);
    g.restore();
    finish(g, t);
  }
  if (V === 'people') {
    mabel(g, 290, 900, 1, { t: tq, L: 'flex', R: 'phone', eyes: { lx: .5, ly: .3 } });
    mabel(g, 790, 900, 1, { t: tq, L: 'cry', R: 'hang', eyes: { expr: 'cry' }, smile: -1, sing: .3 });
    person(g, 160, 1600, 1, { t: tq, kind: 'pat' });
    person(g, 410, 1600, 1, { t: tq, kind: 'sam', eyes: { expr: 'wide' } });
    person(g, 660, 1600, 1, { t: tq, kind: 'me', eyes: { expr: 'happy' } });
    person(g, 910, 1600, 1, { t: tq, kind: 'customer' });
  }
}
