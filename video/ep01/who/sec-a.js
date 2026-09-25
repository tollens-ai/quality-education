// STUB for section A (intro, verse 1, pre-chorus 1, chorus 1), 0–50.5 s. The section builder replaces this file.
// Exports: range, camera(t, S), state(t, st, S), draw(g, t, S, st, cam) in world space (after the
// world), screen(g, t, S, st, cam) in screen space (lyrics, cards). Start and end the camera exactly
// on plan.HANDOFF[0] and plan.HANDOFF[50.5].
import { cameraAt, smooth } from '../../lib/stage.js';
import * as P from './plan.js';
import * as cast from './cast.js';
import * as type from './type.js';

export const range = [0, 50.5];

export function camera(t, S) {
  return cameraAt([[0, P.HANDOFF[0]], [50.5, { ...P.HANDOFF[50.5], ease: smooth }]], t);
}

export function state(t, st, S) {}

export function draw(g, t, S, st, cam) {
  cast.clawd(g, 400, P.BASE.floor, 1.4, {});
}

export function screen(g, t, S, st, cam) {
  type.band(g, t, S, {});
}
