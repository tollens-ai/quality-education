// A look proof for the type alone: every glyph at cap height and at small size, and the words the
// film actually sets, so I can see whether the alphabet holds up before anything is drawn on it.
import { drawText, drawWord } from '../type.js';
import { P } from '../palette.js';
import { rect, inkFill, outline, stipple } from '../kit.js';
import { impression, stencil, marked, label, form, crossed, stampTool, tag } from '../marks.js';

export function draw(g, t) {
  g.fillStyle = P.paper;
  g.fillRect(0, 0, 1080, 1920);

  let y = 130;
  drawText(g, 'ABCDEFGHIJKLM', 60, y, 120, { colour: P.ink, boil: 0 });
  y += 190;
  drawText(g, 'NOPQRSTUVWXYZ', 60, y, 120, { colour: P.ink, boil: 0 });
  y += 190;
  drawText(g, 'abcdefghijklm', 60, y, 120, { colour: P.ink, boil: 1 });
  y += 190;
  drawText(g, 'nopqrstuvwxyz', 60, y, 120, { colour: P.ink, boil: 1 });
  y += 175;
  drawText(g, '0123456789 .,!?\'-:%', 60, y, 104, { colour: P.ink, boil: 2 });
  y += 150;
  drawText(g, 'the quick brown fox jumps over', 60, y, 62, { colour: P.inkSoft, boil: 0 });
  y += 100;
  drawText(g, 'the quick brown fox jumps over', 60, y, 46, { colour: P.inkSoft, boil: 1 });
  y += 80;
  drawText(g, 'the quick brown fox jumps over', 60, y, 34, { colour: P.inkSoft, boil: 2 });

  // The stamps' own sizes: the hook lines, at the sizes they are actually set.
  y += 150;
  drawText(g, 'MAKE IT GOOD FOR WHO?', 60, y, 84, { colour: P.ox, boil: 2 });
  y += 120;
  drawText(g, "I can't read your mind", 60, y, 78, { colour: P.ink, boil: 0 });
  y += 130;
  drawText(g, "I'm only reading your prompt", 60, y, 66, { colour: P.petrol, boil: 1 });

  // A stamp impression: the raised type prints, the recessed field does not, so it is a double
  // rule and the letters, both bitten at the edges.
  y += 190;
  impression(g, 'GUESS I DIDN\'T ASK', 480, y, 84, { w: 820, h: 152, colour: P.ox, seed: 7, boil: 2 });
  stampTool(g, 1000, y - 40, 0.62, { boil: 0 });
  y += 210;
  stencil(g, 'KUBERNETES', 470, y, 74, { colour: P.petrol, boil: 1 });
  marked(g, 'over the wall', 60, y + 96, 62, { colour: P.ink, boil: 2 });
  y += 170;
  label(g, 'TO: NOBODY KNOWN', 60, y - 40, 46, { colour: P.ox, boil: 0 });
  const f = form(g, 540, y - 30, 420, 260, { boil: 1, head: 'FORM 7' });
  crossed(g, 'f1', f.left, f.top + 40, f.right - f.left, f.rowH);
  tag(g, 130, y + 170, 1.5, { text: 'MUM', ang: -0.3, boil: 2 });
}

export const lyricSlot = () => null;
export const drawMarks = () => {};