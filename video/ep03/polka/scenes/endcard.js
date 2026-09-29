// The end card: a show poster with every quality the song names, a rosette in its colour and its
// meaning in a few plain words, for screenshotting. The wording is a claim (a draft from the episode's
// glossary, episodes/03-name-your-ilities.md, waiting for Qing's answers); it holds for about six seconds
// after the music ends, the one place the film is still on purpose.
import { W, H, TAU, clamp, lerp, hash, inv, easeOut, backOut } from '../kit.js';
import { paper } from '../paper.js';
import { blob, line, dot } from '../pencil.js';
import { write } from '../hand.js';
import { rrect, ellipse, scallop } from '../shapes.js';
import { GRAPHITE, C } from '../palette.js';

export const QUALITIES = [
  ['functional correctness', 'Does it do what it should?'],
  ['compatibility', 'Works with the devices people already have'],
  ['performance', 'How fast does it respond?'],
  ['scalability', 'Can it cope as it grows?'],
  ['reliability', 'Does it keep working over time?'],
  ['accessibility', 'Can people with disabilities use it?'],
  ['usability', 'How easy is it to use?'],
  ['extensibility', 'How easy is it to add features?'],
  ['debuggability', 'Can you reproduce and fix bugs easily?'],
  ['diagnosability', "How easy is it to tell what's wrong?"],
  ['recoverability', 'Can you get back to a good state?'],
  ['testability', "Poking it, can you tell if it's good?"],
  ['readability', 'Can a newcomer or agent follow the code?'],
  ['maintainability', 'How easy is it to change the code?'],
  ['resilience', 'What happens when things go wrong?'],
  ['compliance', 'Does it meet the rules for its industry?'],
  ['upgradability', 'Can you move to newer versions easily?'],
  ['replaceability', 'Can you swap it for another easily?'],
  ['explainability', 'Can it tell you why it did that?'],
  ['traceability', 'Can you follow it back to its source?'],
  ['observability', "Can you see what it's doing, even normally?"],
  ['reversibility', 'Can you undo it?'],
  ['installability', 'How easy is it to set up?'],
  ['portability', 'Can it run in different places?'],
  ['flexibility', 'Can it adapt when needs change?'],
  ['detectability', 'Would you notice when it goes wrong?'],
  ['suitability', 'Does it fit what the person needs?'],
  ['reusability', 'Can you use it again elsewhere?'],
  ['sustainability', 'Does it last without wasting energy?'],
  ['changeability', 'How easy is it to make changes?'],
  ['deployability', 'How easy is it to ship changes live?'],
  ['enjoyability', 'Is it a pleasure to use?'],
];
const COLS = [C.red, C.orange, C.yellow, C.lime, C.green, C.teal, C.sky, C.blue, C.purple, C.pink];

export function endCard(g, t) {
  paper(g, { base: '#f8efc9', vignette: .08 });
  // The poster's border, a red rope line with gold corners.
  blob(g, rrect(W / 2, 800, W - 70, 1500, 26, 3, 5), { fill: 'paper', line: C.red, lw: 9, seed: 5, t });
  blob(g, rrect(W / 2, 800, W - 110, 1462, 20, 3, 6), { fill: 'paper', line: '#c9a24a', lw: 5, seed: 6, t });
  write(g, "THE 'ILITIES", W / 2, 232, 86, { seed: 7, t, align: 'center', bubble: { fill: '#f5a03a', edge: '#8a4a1d', e: 2.0, f: 1.3 }, w: .09, track: 5 });
  write(g, 'EVERY QUALITY IN THE SONG, IN PLAIN WORDS', W / 2, 296, 22, { col: C.blue, seed: 8, t, align: 'center', track: 6 });
  const rows = 16, top = 380, dy = 68, cx = [66, 570];
  QUALITIES.forEach(([name, gloss], i) => {
    const col = Math.floor(i / rows), row = i % rows;
    const x = cx[col], y = top + row * dy;
    const c = COLS[i % COLS.length];
    // A small rosette in this quality's colour.
    blob(g, scallop(x + 22, y - 6, 20, 9, .16, 0, 300 + i), { fill: c, line: GRAPHITE, lw: 3.6, seed: 300 + i, t, gap: 5, hw: 4, tone: .7 });
    blob(g, ellipse(x + 22, y - 6, 9, 9, 8, 0, 340 + i), { fill: C.cream, line: null, seed: 340 + i, t, gap: 4, hw: 3.4, tone: .8 });
    write(g, name.toUpperCase(), x + 60, y + 2, 25, { col: GRAPHITE, seed: 400 + i, t, track: 3, w: .1 });
    write(g, gloss.toUpperCase(), x + 60, y + 32, 15, { col: '#3a4a7a', seed: 450 + i, t, track: 2, w: .1 });
  });
  write(g, 'WHICH ARE YOURS?', W / 2, 1490, 30, { col: C.red, seed: 9, t, align: 'center', track: 6, w: .1 });
}
