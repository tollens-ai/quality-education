// Chorus 2's third and fourth gags, by night, with the tables turned. Chorus 1's ship and booth gags already had
// Clawd as the one at the wheel and at the booth, so the same pictures are told again in cream pencil with the
// bulldog judge at the ring's edge in front, watching him and reacting: the bulldog is what is new.
import { clamp, lerp } from '../kit.js';
import { spring, ease } from '../life.js';
import { SPOT, judgeClawd, judgeBulldog } from '../ringcast.js';
import { spotlight } from '../ring.js';
import { gag3 as ship, gag4 as booth } from './c1gags34.js';

const CREAM = '#f5eedd';
// Clawd without the judge's bowler (he is being judged now).
const bare = (g, t, cx, o) => judgeClawd(g, t, cx, { ...o, prop: null });
const CAST = { ink: CREAM, captain: bare, judge: bare };

// The bulldog at the ring's edge, front right, following the action with his eyes and his brows.
function bulldogWatching(g, t, cx, o = {}) {
  judgeBulldog(g, t, cx, { x: 940, y: 1610, s: 1.2, look: [-.9, -.2], ...o });
}

export function gag3(g, t, ws, cx) {
  const V = i => ws[i].s - .085;
  spotlight(g, t, 600, 1330, 380, { from: [560, 700], alpha: .16 });
  ship(g, t, ws, cx, CAST);
  const pain = t > V(6), pop = t > V(8), slow = t > V(10);
  bulldogWatching(g, t, cx, { eyes: pop ? 'wide' : pain ? 'squint' : 'dot', brow: pain && !pop ? 1 : 0, mouth: slow ? .5 : pop ? .3 : 0, tongue: slow });
}

export function gag4(g, t, ws, cx) {
  const V = i => ws[i].s - .085;
  spotlight(g, t, 600, 1330, 380, { from: [560, 700], alpha: .16 });
  booth(g, t, ws, cx, CAST);
  const bugs = t > V(6), wreck = t > V(8);
  bulldogWatching(g, t, cx, { eyes: wreck ? 'wide' : bugs ? 'wide' : 'dot', brow: wreck ? -.5 : 0, mouth: wreck ? .5 : 0, sweat: wreck });
}
