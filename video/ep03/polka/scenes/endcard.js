// The end card: a show poster with every quality the song names, a rosette in its colour and its
// meaning in a few plain words, for screenshotting. The wording is a claim (a draft from the episode's
// glossary, episodes/03-name-your-ilities.md, waiting for Qing's answers); it holds for about six seconds
// after the music ends, the one place the film is still on purpose.
import { W, H, TAU, clamp, lerp, hash, inv, easeOut, backOut } from '../kit.js';
import { paper } from '../paper.js';
import { blob, line, dot } from '../pencil.js';
import { write, measure } from '../hand.js';
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

// The card is two pages of sixteen (a viewer read the one dense card as unreadable at phone size): the verses' and the
// bridge's qualities first, then the list's. Each page is a poster: two columns of eight, a name and its meaning wrapped
// to two lines, big enough to read on a phone or to screenshot.
export const PAGE_BREAK = 215.1;
const PAGES = [
  { from: 0, sub: 'FROM THE VERSES AND THE BRIDGE, IN PLAIN WORDS', note: 'DEBUGGABILITY TO MAINTAINABILITY: THE AGENT-FACING ONES (AND MORE)', tag: '1 OF 2' },
  { from: 16, sub: 'FROM THE LIST, IN PLAIN WORDS', note: 'THERE ARE A HUNDRED MORE.', tag: '2 OF 2' },
];
// Break a string into at most two lines that each fit `room` px.
function wrap2(str, size, track, room) {
  const words = str.split(' ');
  if (measure(str, size, track) <= room) return [str];
  let best = [str, ''], bestGap = 1e9;
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).join(' '), b = words.slice(k).join(' ');
    const wa = measure(a, size, track), wb = measure(b, size, track);
    if (wa <= room && wb <= room && Math.abs(wa - wb) < bestGap) { best = [a, b]; bestGap = Math.abs(wa - wb); }
  }
  return best[1] ? best : [str];
}

// The meanings follow Ed Pringle's catalogue of qualities, ISO/IEC 25010 and ordinary usage (SOURCES.md), and the series
// credits its sources on screen, so each page carries the credit in small print.
const CREDIT = "MEANINGS AFTER ED PRINGLE'S CATALOGUE, ISO/IEC 25010 AND COMMON USE";

export function endCard(g, t, pageIdx = 0) {
  const P = PAGES[pageIdx];
  paper(g, { base: '#f8efc9', vignette: .08 });
  // The poster's border, a red rope line with gold corners.
  blob(g, rrect(W / 2, 813, W - 70, 1526, 26, 3, 5), { fill: 'paper', line: C.red, lw: 9, seed: 5, t });
  blob(g, rrect(W / 2, 813, W - 110, 1488, 20, 3, 6), { fill: 'paper', line: '#c9a24a', lw: 5, seed: 6, t });
  write(g, "THE 'ILITIES", W / 2, 232, 86, { seed: 7, t, align: 'center', bubble: { fill: '#f5a03a', edge: '#8a4a1d', e: 2.0, f: 1.3 }, w: .09, track: 5 });
  write(g, P.sub, W / 2, 298, 24, { col: '#2a4fa8', seed: 8, t, align: 'center', track: 5 });
  write(g, P.note, W / 2, 338, 19, { col: '#6b6b78', seed: 13, t, align: 'center', track: 3, w: .1 });
  const x0 = [72, 552], room = 392, top = 398, dy = 126;
  QUALITIES.slice(P.from, P.from + 16).forEach(([name, gloss], i) => {
    const col = Math.floor(i / 8), row = i % 8;
    const x = x0[col], y = top + row * dy;
    const c = COLS[(P.from + i) % COLS.length];
    // A small rosette in this quality's colour.
    blob(g, scallop(x + 26, y - 8, 26, 9, .16, 0, 300 + P.from + i), { fill: c, line: GRAPHITE, lw: 4, seed: 300 + P.from + i, t, gap: 5, hw: 4, tone: .7 });
    blob(g, ellipse(x + 26, y - 8, 12, 12, 8, 0, 340 + P.from + i), { fill: C.cream, line: null, seed: 340 + P.from + i, t, gap: 4, hw: 3.4, tone: .8 });
    const N = name.toUpperCase(), G = gloss.toUpperCase();
    const ns = Math.min(40, 40 * room / measure(N, 40, 3));
    write(g, N, x + 68, y + 4, ns, { col: GRAPHITE, seed: 400 + P.from + i, t, track: 3, w: .1 });
    wrap2(G, 26, 2, room).forEach((ln, k) => write(g, ln, x + 68, y + 42 + k * 34, 26, { col: '#2f3f75', seed: 450 + (P.from + i) * 2 + k, t, track: 2, w: .1 }));
  });
  write(g, P.tag, W - 96, 236, 24, { col: '#8d8c97', seed: 12, t, align: 'right', track: 6 });
  // The share hook, big: the film asks it three times and the card asks it once more.
  write(g, 'WHICH ARE YOURS?', W / 2, 1434, 58, { col: '#c93a2e', seed: 9, t, align: 'center', track: 7, w: .11 });
  const cs = Math.min(24, 24 * 900 / measure(CREDIT, 24, 2));
  write(g, CREDIT, W / 2, 1474, cs, { col: '#4a4a60', seed: 14, t, align: 'center', track: 2, w: .1 });
  // The artist's signature, as the poster's corner: small, in the film's own hand, with a flourish under it. It sits above
  // y = 1520, where the phone's button strip begins.
  write(g, 'DOODLED BY SONNET', W / 2, 1512, 22, { col: '#3a4a7a', seed: 10, t, align: 'center', track: 7, w: .1 });
  line(g, [[W / 2 - 150, 1526], [W / 2 - 70, 1520], [W / 2 + 10, 1528], [W / 2 + 90, 1520], [W / 2 + 150, 1526]], { w: 4, col: '#3a4a7a', seed: 11, t, spline: true, passes: 1, alpha: .8 });
}
