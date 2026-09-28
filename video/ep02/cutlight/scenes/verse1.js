// Verse 1: the four apps that went wrong, one per member, each in his colour. Each line is cut
// into the wall as a poster, and through its letters you see the place it's about. The brief's
// label comes up as the line starts, and the backing "oooh" is etched by the reflections.
import { W, H, clamp, lerp, easeInOut, easeOut, words, hit, env } from '../kit.js';
import { cam, project } from '../space.js';
import { posterLine, ticket, etchFlat } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY } from '../box.js';
import { WALL } from '../room.js';
import { player, singer, drummer } from '../playing.js';
import { bakeryView, clinicView, schoolView, weddingView, backdrop } from '../world.js';
import { BAND } from '../palette.js';

const lights = (col, pos) => ({
  key: { dir: [-.5, .7, .8], col: KEY, k: 1.2 },
  ambient: '#12162a',
  extra: [{ dir: [0, .4, -1], col: '#fff3de', k: .45 }, { pos, col, k: 1, range: 560 }],
});
// Facing the mirror: the day through the cuts lights his face, so his reflection is lit and he,
// from behind, is a dark shape with an edge of light.
const mirrorLights = (col, pos) => ({
  key: { dir: [.15, .55, -1], col: '#fff1d6', k: 1.25 },
  ambient: '#0d0f1c',
  extra: [{ dir: [-.3, .6, .8], col: '#8d93b8', k: .22 }, { pos, col, k: 1.1, range: 520 }],
});
const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
// The depth the view behind the wall sits at, for its parallax.
const D = 2200;

export function register(S) {
  // --- 1. REGEX, Rosa's bakery: YOUR CHECKOUT JUST WENT DOWN AT EIGHT WITH FIFTY IN THE QUEUE.
  // He faces the mirror and plays to himself; his reflection, clear as day, is all he can see.
  // The camera sinks slowly to him as the line is cut above.
  {
    const ws = words('Verse 1', 'Your checkout');
    const camA = { pos: [72, 112, 250], at: [-22, 100, -160], fov: .76 }, camB = { pos: [80, 80, 150], at: [-27, 78, -160], fov: .74 };
    const cM = C(camB);
    const cuts = posterLine(ws, WALL, cM, [70, 210, 1010, 850], [{ w: [0, 1] }, { w: [2, 3, 4], k: .9 }, { w: [5, 6, 7, 8], k: .85 }, { w: [9, 10, 11] }], { gap: .2 });
    shot(13.95, 17.65, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2, ease: easeInOut });
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.regex.col, [-220, 140, 60]),
        cuts, cutOpt: { outside: L => backdrop(L, c, cM, D, L2 => bakeryView(L2, t, 'down', 300)), laser: BAND.regex.col, light: .6 },
        band: [{ name: 'regex', col: BAND.regex.col, rimDir: [.3, -1], rim: 3.6, draw: (L, cc) => player(L, cc, { who: 'regex', pos: [-30, 0, -70], yaw: Math.PI - .5, t, glow: 1 }) }],
        beams: [[[-240, 460, 60], [-30, 0, -70], 70, BAND.regex.col, .9]],
        smoke: [[-120, -60, 160, 50, BAND.regex.col, 4, .5]],
        refl: { floor: true, hero: true }, rays: .8, sun: [-200, 180, -6000],
      });
    });
  }
  // --- 2. CRON, the clinic: YOUR CLINIC'S BOOKING SITE LOOKED CUTE BUT GRAN COULD NOT GET THROUGH.
  // From behind his kit, over his shoulder: in the mirror, CRON and the kit from the front, the
  // lime ring of the kick. The camera slides past him; THROUGH won't open.
  {
    const ws = words('Verse 1', "Your clinic's");
    const camA = { pos: [170, 175, 360], at: [10, 150, -160], fov: .8, roll: .02 }, camB = { pos: [60, 160, 330], at: [-20, 150, -160], fov: .8, roll: -.01 };
    const cM = C({ pos: [115, 168, 345], at: [-5, 150, -160], fov: .8 });
    const cuts = posterLine(ws, WALL, cM, [60, 210, 1020, 830], [
      { w: [0, 1], k: .72, align: 'left' }, { w: [2, 3] }, { w: [4, 5], k: .86, align: 'right' }, { w: [6, 7] }, { w: [8, 9], k: .7, align: 'left' }, { w: [10, 11] },
    ], { gap: .2 });
    for (const cw of cuts) if (cw.w.wi >= 10) cw.o.stuck = true;
    shot(17.65, 21.05, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 3 });
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.cron.col, [260, 180, 40]),
        cuts, cutOpt: { outside: L => backdrop(L, c, cM, D, L2 => clinicView(L2, t, 'down')), laser: BAND.cron.col, light: .6 },
        band: [{ name: 'cron', col: BAND.cron.col, rimDir: [-.3, -1], rim: 3.4, draw: (L, cc) => drummer(L, cc, { pos: [20, 0, -20], riser: 30, t, col: BAND.cron.col, flip: true }) }],
        beams: [[[260, 460, 60], [20, 30, -20], 70, BAND.cron.col, .9]],
        smoke: [[140, -80, 180, 50, BAND.cron.col, 5, .5]],
        refl: { floor: true, hero: true }, rays: .7, sun: [200, 200, -6000],
      });
    });
  }
  // --- 3. NULL, Parkside School: YOUR SCHOOL'S NEW FEEDBACK APP LET PARENTS READ EACH OTHERS' TEXTS.
  // From low down, the words tower over him; he faces the glass, his hood up, and in the mirror
  // the two violet eyes look back.
  {
    const ws = words('Verse 1', "Your school's");
    const camA = { pos: [-150, 58, 330], at: [-20, 168, -160], fov: .85, roll: .01 }, camB = { pos: [-115, 60, 300], at: [-5, 174, -160], fov: .84, roll: .015 };
    const cM = C(camB);
    const cuts = posterLine(ws, WALL, cM, [80, 210, 960, 860], [
      { w: [0, 1], k: .7, align: 'left' }, { w: [2, 3, 4] }, { w: [5, 6], k: .9, align: 'left' }, { w: [7, 8], k: .75, align: 'right' }, { w: [9, 10] },
    ], { gap: .2 });
    shot(21.05, 24.6, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2 });
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.null.col, [-260, 140, 40]),
        cuts, cutOpt: { outside: L => backdrop(L, c, cM, D, L2 => schoolView(L2, t, 'down')), laser: BAND.null.col, light: .6 },
        band: [{ name: 'null', col: BAND.null.col, rimDir: [.4, -1], rim: 3.6, draw: (L, cc) => player(L, cc, { who: 'null', pos: [-10, 0, -20], yaw: Math.PI + .5, t, glow: 1 }) }],
        beams: [[[-280, 460, 60], [-10, 0, -20], 70, BAND.null.col, .9]],
        smoke: [[-110, -60, 180, 40, BAND.null.col, 6, .5]],
        refl: { floor: true, hero: true }, rays: .7, sun: [0, 900, -6000],
      });
    });
  }
  // --- 4. CLAWD, Jess's wedding: YOUR WEDDING SEATING SITE PUT DAVE NEXT TO HIS ANGRY EX!
  // He sings it to the mirror, the mic between him and his reflection; pushing in; a jolt on EX!
  {
    const ws = words('Verse 1', 'Your wedding');
    const camA = { pos: [150, 110, 110], at: [20, 100, -160], fov: .76 }, camB = { pos: [110, 90, 50], at: [12, 88, -160], fov: .76, roll: .02 };
    const cM = C(camB);
    const cuts = posterLine(ws, WALL, cM, [60, 210, 1020, 960], [
      { w: [0, 1], k: .8, align: 'left' }, { w: [2, 3] }, { w: [4, 5], k: .9 }, { w: [6, 7, 8], k: .72, align: 'right' }, { w: [9, 10] },
    ], { gap: .2 });
    const ex = ws[10].v;
    shot(24.6, 28.85, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 3, ease: easeOut });
      const jolt = t > ex - .1 ? hit('snare', t, .1) : 0;
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.clawd.col, [220, 160, 60]),
        cuts, cutOpt: { outside: L => backdrop(L, c, cM, D, L2 => weddingView(L2, t, 'down')), laser: BAND.clawd.col, light: .6 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [-.3, -1], rim: 3.6, draw: (L, cc) => singer(L, cc, { pos: [20, 0, -100], yaw: Math.PI - .45, t }) }],
        beams: [[[220, 460, 60], [20, 0, -100], 70, BAND.clawd.col, .9]],
        smoke: [[60, -70, 200, 50, BAND.clawd.col, 7, .5]],
        refl: { floor: true, hero: true }, rays: .7, sun: [0, 400, -6000],
        post: { split: t > ex - .05 && t < ex + .4 ? 6 * (1 - (t - ex) / .45) : 0, glitch: jolt * .6 },
      });
    });
  }
  // The labels, each up with its shot; the backing "oooh", etched beside the reflection that
  // sings it, gone just after the cut.
  const starts = [13.95, 17.65, 21.05, 24.6];
  ["Your checkout", "Your clinic's", "Your school's", "Your wedding"].forEach((l, n) => {
    const w0 = words('Verse 1', l)[0], a = Math.max(starts[n], w0.v - .25), b = w0.v + 2.6;
    overlay(a, b, (g, t) => ticket(g, n, 40, 108, clamp((t - a) / .15) * clamp((b - t) / .3)));
  });
  const who = ['regex', 'cron', 'null'];
  const at = [[620, 930, 120, 18.55], [430, 945, 100, 21.5], [770, 1250, 110, 25.1]];
  for (let i = 0; i < 3; i++) {
    const w = words('Verse 1', 'oooh', i)[0], [x, y, px, end] = at[i];
    overlay(w.v - .2, end, (g, t) => {
      const p = clamp((t - (w.v - .2)) / .2), a = clamp((end - t) / .12);
      etchFlat(g, 'OOOH', x, y, px, BAND[who[i]].col, p, { align: 'center', alpha: a, w0: w });
    });
  }
}
