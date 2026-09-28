// Verse 1: the four apps that went wrong, one per member, each in his colour. We stand where he
// stands, facing the mirror, and see what he sees: himself. Then, where his reflection was, the
// one-way glass lights from the far side, pane by pane like tubes starting: they're showing him.
// Through it, the place the line is about and the thing going wrong as it's sung, his reflection
// a ghost over it; the line is cut into the dark glass above, the day through its letters. At the
// cut the panes go dark and he's alone with himself again.
import { W, H, clamp, lerp, easeInOut, easeOut, words, hit, env } from '../kit.js';
import { cam, project, ap } from '../space.js';
import { posterLine, ticket, etchFlat } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY, wallRect, once } from '../box.js';
import { WALL, ROOM } from '../room.js';
import { player, singer, drummer } from '../playing.js';
import { sky, backdrop } from '../world.js';
import { story } from '../story.js';
import { BAND } from '../palette.js';

// Facing the mirror, lit from the panes in front of him.
const mirrorLights = (col, pos) => ({
  key: { dir: [.15, .55, -1], col: '#fff1d6', k: 1.25 },
  ambient: '#0d0f1c',
  extra: [{ dir: [-.3, .6, .8], col: '#8d93b8', k: .22 }, { pos, col, k: 1.1, range: 520 }],
});
const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
// The depth the view behind the wall sits at, for its parallax.
const D = 2200;
// Where the wall meets the floor, on screen, for camera c.
const floorY = c => project(c, [0, 0, ROOM.back]).y;
// The world outside for a shot: the day, and the place drawn in the reference camera's frame,
// moved with the real camera as a view through a window is.
const outside = (c, cM, t, draw) => L => { sky(L, c, t, { sun: [0, 420, -6000] }); backdrop(L, c, cM, D, draw); };
const WORDS = [70, 232, 1010, 700];
const TOP = 736;
const glass = (pane, out, t0, t1, seed) => ({ rect: pane, view: out, t0, t1, ghost: .16, dim: .03, seed, light: .3 });
// A view that moves inside its pane: keys [[t, fit, dur]], each easing from the one before to
// its fit over dur seconds from t (the zoom evenly, in log).
function fitAt(t, keys) {
  let f = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ti, fi, d] = keys[i];
    if (t <= ti) break;
    const p = easeInOut(clamp((t - ti) / d));
    f = { u: lerp(f.u, fi.u, p), v: lerp(f.v, fi.v, p), x: lerp(f.x, fi.x, p), y: lerp(f.y, fi.y, p), w: Math.exp(lerp(Math.log(f.w), Math.log(fi.w), p)) };
  }
  return f;
}

export function register(S) {
  const starts = [13.95, 17.65, 21.05, 24.6], ends = [17.65, 21.05, 24.6, 28.85];
  // --- 1. REGEX, Rosa's bakery: YOUR CHECKOUT JUST WENT DOWN AT EIGHT WITH FIFTY IN THE QUEUE.
  // The counter: Rosa proud, the terminal green, the clock at 7:59. DOWN: the terminal's red X,
  // her hands to her head. EIGHT: the clock lands on the hour. FIFTY IN THE QUEUE: the view runs
  // along, out of the door, to the queue down the street. A slow push in.
  {
    const ws = words('Verse 1', 'Your checkout');
    const camA = { pos: [-6, 112, 172], at: [-4, 102, -160], fov: .78 }, camB = { pos: [0, 108, 150], at: [-2, 99, -160], fov: .77 };
    const cM = C({ pos: [-3, 110, 161], at: [-3, 100.5, -160], fov: .775 });
    const cuts = posterLine(ws, WALL, cM, WORDS, [{ w: [0, 1] }, { w: [2, 3, 4], k: .9 }, { w: [5, 6, 7, 8], k: .85 }, { w: [9, 10, 11] }], { gap: .2 });
    const fy = floorY(cM), pane = wallRect(cM, [60, TOP, 1020, fy - 4]);
    const times = { down: ws[4].v, eight: ws[6].v, queue: ws[8].v };
    // Close on Rosa and her terminal; pulled back as the clock lands on eight.
    const keys = [[0, { u: .72, v: .2, x: 540, y: TOP, w: 1500 }], [times.eight - .12, { u: .575, v: .06, x: 540, y: TOP, w: 1185 }, .32]];
    const view = t => ({ fit: fitAt(t, keys), fitFront: { u: .5, v: .45, x: 540, y: TOP, w: 1100 }, fu: .62, times });
    const [a, b] = [starts[0], ends[0]];
    shot(a, b, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2, ease: easeInOut });
      const out = once(outside(c, cM, t, L => story(L, t, 'bakery', 'down', [0, 0, W, H], view(t))), 'v1');
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.regex.col, [-220, 140, 60]),
        cuts, cutOpt: { outside: out, laser: BAND.regex.col, light: .6 },
        panes: [glass(pane, out, ws[1].v - .1, b - .24, 1)],
        band: [{ name: 'regex', col: BAND.regex.col, rimDir: [.3, -1], rim: 3.6, reflOnly: true, draw: (L, cc) => player(L, cc, { who: 'regex', pos: [2, 0, 196], yaw: Math.PI, t, glow: 1 }) }],
        smoke: [[-120, -60, 160, 50, BAND.regex.col, 4, .25]],
        refl: { floor: true, hero: true }, rays: .5, sun: [-200, 180, -6000],
      });
    });
  }
  // --- 2. CRON, the clinic: YOUR CLINIC'S BOOKING SITE LOOKED CUTE BUT GRAN COULD NOT GET THROUGH.
  // His reflection at his kit on the right; on the left the panes light: the waiting room, the
  // pink booking site on its big screen, all tiny pale slots, Gran pleased with her phone. GRAN:
  // she squints at it at arm's length, and her thumb, bigger than any slot, keeps landing on the
  // wrong one: oops! try again; GET THROUGH: she shakes the phone.
  // THROUGH is cut all round and won't come out. The camera slides along.
  {
    const ws = words('Verse 1', "Your clinic's");
    const camA = { pos: [-64, 112, 160], at: [-50, 102, -160], fov: .78 }, camB = { pos: [-38, 110, 146], at: [-30, 100, -160], fov: .775 };
    const cM = C({ pos: [-51, 111, 153], at: [-40, 101, -160], fov: .7775 });
    const cuts = posterLine(ws, WALL, cM, WORDS, [
      { w: [0, 1], k: .8, align: 'left' }, { w: [2, 3, 4, 5] }, { w: [6, 7, 8], k: .86, align: 'right' }, { w: [9, 10, 11] },
    ], { gap: .2 });
    for (const cw of cuts) if (cw.w.wi >= 10) cw.o.stuck = true;
    const fy = floorY(cM), pane = wallRect(cM, [40, TOP, 720, fy - 4]);
    const times = { stuck: ws[7].v, shake: ws[10].v };
    // The cute site, big; pulled back to Gran as she's named.
    const keys = [[0, { u: .5, v: .07, x: 380, y: TOP, w: 1056 }], [times.stuck - .2, { u: .5, v: .06, x: 380, y: TOP, w: 760 }, .38]];
    const view = t => ({ fit: fitAt(t, keys), fu: .5, fv: 1.04, fh: .58, times });
    shot(starts[1], ends[1], (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2 });
      const out = once(outside(c, cM, t, L => story(L, t, 'clinic', 'down', [0, 0, W, H], view(t))), 'v1');
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.cron.col, [260, 180, 40]),
        cuts, cutOpt: { outside: out, laser: BAND.cron.col, light: .6 },
        panes: [glass(pane, out, ws[2].v - .1, ends[1] - .24, 2)],
        band: [{ name: 'cron', col: BAND.cron.col, rimDir: [-.3, -1], rim: 3.4, reflOnly: true, draw: (L, cc) => drummer(L, cc, { pos: [40, 0, 176], riser: 20, t, col: BAND.cron.col, flip: true }) }],
        smoke: [[140, -80, 180, 50, BAND.cron.col, 5, .25]],
        refl: { floor: true, hero: true, heroA: .95 }, rays: .5, sun: [200, 200, -6000],
      });
    });
  }
  // --- 3. NULL, Parkside School: YOUR SCHOOL'S NEW FEEDBACK APP LET PARENTS READ EACH OTHERS' TEXTS.
  // The school gate at home time, four parents on their phones, each with a private message over
  // them. READ: the messages fly, each to someone else's head, and a dad recoils. The camera
  // rises as it pushes in.
  {
    const ws = words('Verse 1', "Your school's");
    const camA = { pos: [20, 102, 170], at: [18, 98, -160], fov: .78, roll: -.01 }, camB = { pos: [14, 114, 150], at: [14, 101, -160], fov: .775, roll: -.003 };
    const cM = C({ pos: [17, 108, 160], at: [16, 99.5, -160], fov: .7775 });
    const cuts = posterLine(ws, WALL, cM, WORDS, [
      { w: [0, 1], k: .75, align: 'left' }, { w: [2, 3, 4] }, { w: [5, 6, 7], k: .9, align: 'right' }, { w: [8, 9, 10] },
    ], { gap: .2 });
    const fy = floorY(cM), pane = wallRect(cM, [60, TOP, 1020, fy - 4]);
    const times = { leak: ws[7].v };
    // A slow push in on the gate.
    const keys = [[0, { u: .5, v: .38, x: 540, y: TOP, w: 1060 }], [ws[3].v, { u: .52, v: .4, x: 540, y: TOP, w: 1180 }, 2.6]];
    const view = t => ({ fit: fitAt(t, keys), times, clip: [70, TOP, 1010, H], px: 30 });
    shot(starts[2], ends[2], (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2 });
      const out = once(outside(c, cM, t, L => story(L, t, 'school', 'down', [0, 0, W, H], view(t))), 'v1');
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.null.col, [-260, 140, 40]),
        cuts, cutOpt: { outside: out, laser: BAND.null.col, light: .6 },
        panes: [glass(pane, out, ws[3].v - .1, ends[2] - .24, 3)],
        band: [{ name: 'null', col: BAND.null.col, rimDir: [.4, -1], rim: 3.6, reflOnly: true, draw: (L, cc) => player(L, cc, { who: 'null', pos: [-30, 0, 200], yaw: Math.PI + .2, t, glow: 1 }) }],
        smoke: [[-110, -60, 180, 40, BAND.null.col, 6, .25]],
        refl: { floor: true, hero: true }, rays: .5, sun: [0, 900, -6000],
      });
    });
  }
  // --- 4. CLAWD, Jess's wedding: YOUR WEDDING SEATING SITE PUT DAVE NEXT TO HIS ANGRY EX!
  // The marquee, the seating plan on its easel with TABLE 4 and two names circled; Dave beaming at
  // the table, Sue beside him, arms folded. EX!: she points, the vein pops, a jolt; Jess, at the
  // side, aghast. Pushing in, rolling.
  {
    const ws = words('Verse 1', 'Your wedding');
    const camA = { pos: [8, 110, 174], at: [6, 100, -160], fov: .78 }, camB = { pos: [4, 106, 146], at: [4, 98, -160], fov: .77, roll: .02 };
    const cM = C({ pos: [6, 108, 160], at: [5, 99, -160], fov: .775 });
    const cuts = posterLine(ws, WALL, cM, WORDS, [
      { w: [0, 1], k: .8, align: 'left' }, { w: [2, 3, 4] }, { w: [5, 6, 7], k: .9 }, { w: [8, 9, 10], k: .9, align: 'right' },
    ], { gap: .2 });
    const ex = ws[10].v;
    const fy = floorY(cM), pane = wallRect(cM, [60, TOP, 1020, fy - 4]);
    const times = { ex };
    // A slow push in, to Dave and Sue.
    const keys = [[0, { u: .48, v: .28, x: 540, y: TOP, w: 1100 }], [ws[4].v, { u: .56, v: .36, x: 540, y: TOP, w: 1420 }, ex - ws[4].v]];
    const view = t => ({ fit: fitAt(t, keys), times });
    shot(starts[3], ends[3], (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 3, ease: easeOut });
      const jolt = t > ex - .1 ? hit('snare', t, .1) : 0;
      const out = once(outside(c, cM, t, L => story(L, t, 'wedding', 'down', [0, 0, W, H], view(t))), 'v1');
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.clawd.col, [220, 160, 60]),
        cuts, cutOpt: { outside: out, laser: BAND.clawd.col, light: .6 },
        panes: [glass(pane, out, ws[2].v - .1, ends[3] - .22, 4)],
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [-.3, -1], rim: 3.6, reflOnly: true, draw: (L, cc) => singer(L, cc, { pos: [10, 0, 196], yaw: Math.PI, t }) }],
        smoke: [[60, -70, 200, 50, BAND.clawd.col, 7, .25]],
        refl: { floor: true, hero: true }, rays: .5, sun: [0, 400, -6000],
        post: { split: t > ex - .05 && t < ex + .4 ? 6 * (1 - (t - ex) / .45) : 0, glitch: jolt * .6 },
      });
    });
  }
  // The labels, each up with its shot; the backing "oooh", etched on the glass as the panes go
  // dark, gone just after the cut.
  ["Your checkout", "Your clinic's", "Your school's", "Your wedding"].forEach((l, n) => {
    const w0 = words('Verse 1', l)[0], a = Math.max(starts[n], w0.v - .25), b = w0.v + 2.6;
    overlay(a, b, (g, t) => ticket(g, n, 40, 108, clamp((t - a) / .15) * clamp((b - t) / .3)));
  });
  const who = ['regex', 'cron', 'null'];
  for (let i = 0; i < 3; i++) {
    const w = words('Verse 1', 'oooh', i)[0], end = ends[i] + .5;
    overlay(w.v - .2, end, (g, t) => {
      const p = clamp((t - (w.v - .2)) / .2), a = clamp((end - t) / .12);
      etchFlat(g, 'OOOH', 540, 1470, 120, BAND[who[i]].col, p, { align: 'center', alpha: a, w0: w });
    });
  }
}
