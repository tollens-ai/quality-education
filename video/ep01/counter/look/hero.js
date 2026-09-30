// The hero frame, second time: the wall, the opening, Clawd framed in it, the crates that have gone
// over the top and landed in the street, and the queue cropped by the frame.
import { P } from '../palette.js';
import { ground, wall, opening, crate, meter, clock, slip, queue, SKY, WALLTOP, WALLBOT, HATCH } from '../world.js';
import { clawd, person, botBadge } from '../cast.js';
import { impression, stencil, marked, label, form, crossed, ticked, tag, stampTool, tollensMark } from '../marks.js';
import { drawText } from '../type.js';
import { rect, inkFill, line, stipple } from '../kit.js';

export function draw(g, t) {
  const b = Math.floor(t * 15) % 3;
  g.fillStyle = P.paper;
  g.fillRect(0, 0, 1080, 1920);

  ground(g, t, { boil: b });
  wall(g, b);
  opening(g, b);

  // Clawd, framed by the opening, at his bench, one claw up with the stamp
  clawd(g, 540, HATCH.y + HATCH.h - 6, 1.62, { arm: 0.85, look: 0.25, boil: b });

  // what has already gone over the wall, landing in the street
  crate(g, 214, 1500, 262, 148, { text: 'CONFETTI CANNONS', ang: -0.05, boil: b, mark: impression, markColour: P.ox });
  crate(g, 852, 1462, 236, 132, { text: '2FA', ang: 0.04, boil: (b + 1) % 3, mark: stencil, markColour: P.petrol });
  crate(g, 540, 1720, 300, 150, { text: 'KUBERNETES', ang: 0.02, boil: (b + 2) % 3 });

  const q = queue(g, 5, 1810, { boil: b, seed: 3, s: 1.35 });

  // the film's title, stamped on the wall itself
  impression(g, 'THE COUNTER', 540, 268, 52, { w: 640, colour: P.inkSoft, boil: b, ang: 0.012 });
  tollensMark(g, 1006, 1834, 20, { colour: P.inkSoft });
}

export const lyricSlot = () => null;
export const drawMarks = () => {};