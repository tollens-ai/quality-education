// The breaks. After chorus 1, the riff again: REGEX's hands close, the strings lit note by note,
// the lasers slashing the glass behind; the band jumping; then SO GIVE ME SOMETHING I CAN PROVE!
// cut again, the camera rolling. After chorus 2, a bar of drums: CRON, hit by hit.
import { W, H, clamp, lerp, hash, easeOut, easeInOut, words, hit, A, eventsIn } from '../kit.js';
import { cam, project, ap } from '../space.js';
import { posterLine, shardCut } from '../type.js';
import { shot, move } from '../shots.js';
import { boxFrame, KEY, STAGE_LIGHTS, STAGE_SMOKE, STAGE_BEAMS, bandLine } from '../box.js';
import { WALL } from '../room.js';
import { player, drummer } from '../playing.js';
import { sky } from '../world.js';
import { slashes, slashesFrom } from '../air.js';
import { BAND } from '../palette.js';

const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
const riff = (a, b) => A.riff.filter(r => r[0] >= a && r[0] < b);
const noteGlow = t => { const r = A.riff.filter(x => x[0] <= t).pop(); return r ? Math.exp(-(t - r[0]) / .09) * clamp(r[2]) : 0; };
const FOUR = [BAND.clawd.col, BAND.regex.col, BAND.cron.col, BAND.null.col];

export function register(S) {
  const out = c => L => sky(L, c, 0, { sun: [0, 380, -6000] });
  // --- REGEX's hands, close, and the lasers behind him.
  const sl = slashesFrom(riff(53.4, 58.1), -260, 260, 60, 520, 3);
  const shards = sl.filter(s => s.st > .8).map((s, i) => {
    const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, w = 30 + hash(i, 5) * 50;
    const P = (k, off) => [s.a[0] + dx * k + nx * off, s.a[1] + dy * k + ny * off];
    return shardCut([P(.2, 0), P(.75, 0), P(.65, w), P(.28, w * .8)], s.t + .02, WALL);
  });
  shot(53.9, 56.0, (g, t, sh) => {
    const c = move(t, sh, { pos: [70, 70, 150], at: [-10, 36, 20], fov: .7, roll: .12 }, { pos: [60, 64, 120], at: [-10, 34, 20], fov: .66, roll: .08 }, { shake: 4 });
    boxFrame(g, t, c, {
      lights: { key: { dir: [-.5, .7, .8], col: KEY, k: 1.1 }, ambient: '#12162a', extra: [{ pos: [-200, 160, 200], col: BAND.regex.col, k: 1.2, range: 500 }] },
      cuts: shards, cutOpt: { outside: out(c), laser: BAND.regex.col, light: .9, fall: 'blow', fallDur: .6 },
      band: [{ name: 'regex', col: BAND.regex.col, rimDir: [.6, -1], draw: (L, cc) => player(L, cc, { who: 'regex', pos: [0, 0, 0], yaw: .25, t, play: 1, glow: .4 + noteGlow(t) * 1.6 }) }],
      refl: { floor: true, wall: 1 }, post: { shafts: .45, glow: [.34, .45], split: hit('crash', t, .1) * 5 },
      behind: (B, E) => slashes(B, E, c, WALL, sl, t, BAND.regex.col),
    });
  });
  // --- The band, jumping, the storm of cuts across the glass.
  shot(56.0, 58.05, (g, t, sh) => {
    const c = move(t, sh, { pos: [-40, 90, 1000], at: [0, 170, -160], fov: .56, roll: -.03 }, { pos: [40, 100, 1060], at: [0, 175, -160], fov: .56, roll: .03 }, { shake: 7 });
    boxFrame(g, t, c, {
      lights: STAGE_LIGHTS, cuts: shards, cutOpt: { outside: out(c), laser: BAND.regex.col, light: .9, fall: 'blow', fallDur: .6 },
      band: bandLine(t, { jump: 1.4 }), smoke: STAGE_SMOKE, beams: STAGE_BEAMS,
      refl: { floor: true, wall: 2 }, post: { shafts: .5, glow: [.32, .45], split: hit('crash', t, .1) * 6 },
      behind: (B, E) => slashes(B, E, c, WALL, sl, t, BAND.regex.col),
    });
  });
  // --- SO GIVE ME SOMETHING I CAN PROVE! again, the camera rolling as it's cut.
  const L = words('Break 1', 'So give me');
  const set = { pos: [0, 150, 860], at: [0, 210, -160], fov: .66, roll: -.12 }, set2 = { pos: [0, 140, 760], at: [0, 205, -160], fov: .68, roll: .1 };
  const cR = C({ pos: [0, 145, 810], at: [0, 208, -160], fov: .67 });
  const cuts = posterLine(L, WALL, cR, [70, 170, 1010, 1100], [{ w: [0, 1, 2], k: .7 }, { w: [3] }, { w: [4, 5] }, { w: [6] }], { gap: .14 });
  cuts.forEach((cw, i) => { cw.o.laser = FOUR[i % 4]; });
  shot(58.05, 60.85, (g, t, sh) => {
    const c = move(t, sh, set, set2, { shake: 7, ease: easeInOut });
    boxFrame(g, t, c, {
      lights: STAGE_LIGHTS, cuts, cutOpt: { outside: out(c), light: .85, fall: 'blow', fallDur: .7 },
      band: bandLine(t, { jump: 1 }), smoke: STAGE_SMOKE, beams: STAGE_BEAMS,
      refl: { floor: true, wall: 2 }, rays: 1, post: { shafts: .55, glow: [.32, .45], split: hit('crash', t, .12) * 6 },
    });
  });
  // --- After chorus 2: CRON, hit by hit, close.
  const hitsB2 = eventsIn('snare', 99.6, 102.5);
  shot(99.6, 102.6, (g, t, sh) => {
    const n = hitsB2.filter(x => x <= t).length;
    const angle = [[80, 110, 380], [-90, 100, 360], [60, 150, 300], [-60, 60, 420]][n % 4];
    const c = cam(angle, [0, 70, -40], { fov: .7, roll: (n % 2 ? .08 : -.08) });
    boxFrame(g, t, c, {
      lights: { key: { dir: [-.4, .7, .8], col: KEY, k: 1.1 }, ambient: '#12162a', extra: [{ pos: [0, 260, 100], col: BAND.cron.col, k: 1.1, range: 400 }] },
      band: [{ name: 'cron', col: BAND.cron.col, rimDir: [0, -1], draw: (L2, cc) => drummer(L2, cc, { pos: [0, 0, -40], riser: 20, t, col: BAND.cron.col }) }],
      beams: [[[0, 480, -40], [0, 20, -40], 70, BAND.cron.col, 1]], smoke: [[0, -40, 200, 60, BAND.cron.col, 9, .7]],
      refl: { floor: true, wall: 1 }, post: { shafts: 0, glow: [.34, .45], split: hit('snare', t, .08) * 5 },
    });
  });
}
