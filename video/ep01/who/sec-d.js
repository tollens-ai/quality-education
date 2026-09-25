// STUB for section D (final pre-chorus, final chorus, outro, loop), 147.56–200.74 s. The section builder replaces this file.
// Exports: range, camera(t, S), state(t, st, S), draw(g, t, S, st, cam) in world space (after the
// world), screen(g, t, S, st, cam) in screen space (lyrics, cards). Start and end the camera exactly
// on plan.HANDOFF[147.56] and plan.HANDOFF[200.74].
import { cameraAt, smooth } from '../../lib/stage.js';
import * as P from './plan.js';
import * as cast from './cast.js';
import * as type from './type.js';

export const range = [147.56, 200.74];

export function camera(t, S) {
  return cameraAt([[147.56, P.HANDOFF[147.56]], [200.74, { ...P.HANDOFF[200.74], ease: smooth }]], t);
}

export function state(t, st, S) {}

export function draw(g, t, S, st, cam) {
  cast.clawd(g, 400, P.BASE.floor, 1.4, {});
}

export function screen(g, t, S, st, cam) {
  type.band(g, t, S, {});
}
