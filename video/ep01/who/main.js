// "Who Lives Here?": the scene entry for episode 1. It picks the section that owns time t, builds
// the world state for that moment, then draws: world (camera applied), the section's world-space
// action, the atmosphere, and the section's screen-space layer (lyrics, cards).
//
// Render: node video/lib/render.mjs --scene video/ep01/who/main.js --song music/ep01 --sheet 3
import { applyCamera, W, H } from '../../lib/stage.js';
import * as P from './plan.js';
import * as world from './world.js';
import * as A from './sec-a.js';
import * as B from './sec-b.js';
import * as C from './sec-c.js';
import * as D from './sec-d.js';

export const font = P.FONTS.display;
export const markColor = '#E9E4F5';
export const fonts = P.FONT_FILES;
export const images = P.IMAGE_FILES;
// export const debug = true;   // uncomment for a time/section readout while building

const SECS = [A, B, C, D];
const pick = t => SECS.find(s => t >= s.range[0] && t < s.range[1]) || D;

// Everything that persists across sections, as of time t. Sections then adjust it.
export function baseState(t) {
  const flats = {};
  for (const id of Object.keys(P.RESIDENTS)) flats[id] = { lit: 1, gold: 0 };
  return {
    t,
    quota: P.quota(t), sessionTag: P.sessionTag(t),
    builds: P.yourBuilds(t), ticket: P.ticketFill(t),
    blind: P.blind(t), bellRing: P.bellRing(t), bellGlow: P.bellGlow(t),
    baseWindow: P.baseWindow(t), directoryLit: P.directoryLit(t), bots: P.botsUp(t),
    youGold: P.youGold(t), autumn: P.autumn(t),
    flats,
    lift: { y: P.floorLevel(1), style: 'plain', styleP: 0, doors: 0 },
    cutWords: 0,        // the ceiling words "make it good" letting light through (pre-chorus 1)
    bulbSwing: 0,       // basement bulb swing angle
    dim: 0,             // 0..1 global darkening (band stops, quota gone)
    strata: 0,          // 0..1 how much of the older basements is revealed
  };
}

export async function init(S) { if (world.init) await world.init(S); }

// Builders work in parallel, so one module's runtime error must not blank everyone's frames:
// each stage is guarded, and a failure prints a red label naming the module.
function guard(g, label, fn) {
  try { fn(); } catch (e) {
    g.save(); g.setTransform(0.5, 0, 0, 0.5, 0, 0);
    g.fillStyle = '#f33'; g.font = '40px monospace';
    g.fillText(`${label}: ${String(e.message).slice(0, 60)}`, 40, 200 + 50 * ['state', 'camera', 'world', 'section', 'atmosphere', 'screen'].indexOf(label));
    g.restore();
  }
}

export function draw(g, t, S) {
  const sec = pick(t);
  const st = baseState(t);
  guard(g, 'state', () => sec.state(t, st, S));
  let cam = P.HANDOFF[0];
  guard(g, 'camera', () => { cam = sec.camera(t, S); });
  g.save();
  applyCamera(g, cam);
  g.save(); guard(g, 'world', () => world.drawWorld(g, t, S, st, cam)); g.restore();
  // The misfit builds installed at your door in verse 1 stay there until the final chorus
  // (section D takes them down itself), so sections B and C get them from section A's drawer.
  if ((sec === B || sec === C) && A.drawDoorBuilds) { g.save(); guard(g, 'section', () => A.drawDoorBuilds(g, t, S, st)); g.restore(); }
  g.save(); guard(g, 'section', () => sec.draw(g, t, S, st, cam)); g.restore();
  g.restore();
  g.save(); guard(g, 'atmosphere', () => world.drawAtmosphere(g, t, S, st, cam)); g.restore();
  g.save(); guard(g, 'screen', () => sec.screen(g, t, S, st, cam)); g.restore();
}
