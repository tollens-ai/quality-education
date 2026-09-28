// The intro. A whisper in the dark: the band waiting, only their colours showing, the dedication
// etched small on the glass, and on EVERYONE, dim behind the glass, the four they built for,
// looking in. Then the riff, which is the laser: every note a cut across the mirror, and on the
// hard notes a shard drops out and the day comes in. Each member in turn, as an anime opening
// brings on its cast: his name cut a letter a note, his label under it, and behind him, washed in
// his colour like a double exposure, the one he built for. Then the whole band, and the title,
// HOW WILL I KNOW, one letter on each of the bar's twelve notes.
import { W, H, clamp, lerp, hash, easeOut, easeInOut, words, hit, A, SONG } from '../kit.js';
import { cam, project, screenToPlane, ap, M, T } from '../space.js';
import { posterLine, lettersOn, shardCut, width100, ticket, flat, drawEtch, CAPK, cutWord } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY, LINEUP, STAGE_LIGHTS, STAGE_SMOKE, STAGE_BEAMS } from '../box.js';
import { WALL } from '../room.js';
import { player, singer, drummer } from '../playing.js';
import { sky, backdrop } from '../world.js';
import { scenePane, row } from '../windows.js';
import { BAND } from '../palette.js';
import { INK } from '../ink.js';

const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
const riff = (a, b) => A.riff.filter(r => r[0] >= a && r[0] < b);
// Where a word of a given string should sit on a plane to fill a screen box's width.
function fit(str, c, m, x0, x1, yBase) {
  const a = screenToPlane(c, m, x0, yBase), b = screenToPlane(c, m, x1, yBase);
  const em = (b[0] - a[0]) / (width100(str) / 100);
  return { u: a[0], v: a[1], em };
}
// The day through the first cuts: blue sky and cloud, the sun high to one side, so a shard shows
// the sky and the one that catches the sun blazes.
const dayOut = (c, t = 0) => L => sky(L, c, t, { sun: [900, 1700, -6000], sunR: 300, top: '#1d5aa6', mid: '#4c8fd0', low: '#a9d2ee', hor: '#ffd79c' });

// Each member, playing, where he stands for his intro.
const MEMBER = {
  regex: t => ({ name: 'regex', col: BAND.regex.col, rimDir: [.6, -1], draw: (L, cc) => player(L, cc, { who: 'regex', pos: [0, 0, 200], yaw: .3, t, glow: 1.2 }) }),
  cron: t => ({ name: 'cron', col: BAND.cron.col, rimDir: [.3, -1], draw: (L, cc) => drummer(L, cc, { pos: [0, 0, 220], t, col: BAND.cron.col }) }),
  null: t => ({ name: 'null', col: BAND.null.col, rimDir: [-.5, -1], draw: (L, cc) => player(L, cc, { who: 'null', pos: [0, 0, 210], yaw: -.3, t, glow: 1.2 }) }),
  clawd: t => ({ name: 'clawd', col: BAND.clawd.col, rimDir: [0, -1], draw: (L, cc) => singer(L, cc, { pos: [0, 0, 220], yaw: .05, t, mouth: .25 }) }),
};
const ROLE = { regex: 'GUITAR', cron: 'DRUMS', null: 'BASS', clawd: 'VOCALS' };
const lightFor = who => ({
  key: { dir: [-.5, .7, .8], col: KEY, k: 1.15 },
  ambient: '#12162a',
  extra: [{ dir: [0, .4, -1], col: '#fff3de', k: .5 }, { pos: [-200, 220, 480], col: BAND[who].col, k: 1.1, range: 600 }, { pos: [240, 120, 380], col: BAND[who].col, k: .6, range: 500 }],
});

export function register(S) {
  // --- The whisper: the band in the dark, the dedication etched above them.
  const ded = words('Intro', 'This one');
  const cWh = C({ pos: [0, 120, 820], at: [0, 200, -160], fov: .8 });
  const dedCuts = posterLine(ded, WALL, cWh, [150, 330, 930, 760], [{ w: [0, 1, 2] }, { w: [3, 4, 5] }, { w: [6, 7, 8, 9] }], { gap: .3 });
  for (const cw of dedCuts) cw.o.dur = .18;
  const WHO = [['bakery', 'stand'], ['clinic', 'stand'], ['school', 'built'], ['wedding', 'stand']];
  const lookIn = row(4, 40, 1040, 790, 1330, 18);
  shot(0, 2.27, (g, t, sh) => {
    const c = move(t, sh, { pos: [0, 120, 840], at: [0, 200, -160], fov: .8 }, { pos: [0, 118, 800], at: [0, 200, -160], fov: .78 }, { hand: .6 });
    boxFrame(g, t, c, {
      panes: WHO.map(([b, st], i) => ({ ...scenePane(c, cWh, t, lookIn[i], b, st, {}, { t0: ded[3].v - .1 + i * .12, seed: 110 + i, k: 1.15 }), dim: .55, light: .12 })),
      lights: { key: { dir: [0, .5, -1], col: '#8a8fa8', k: .35 }, ambient: '#0a0b14', extra: [] },
      band: ['cron', 'null', 'regex', 'clawd'].map(w => ({ name: w, col: BAND[w].col, rimDir: [0, -1], rim: 1.6,
        draw: (L, cc) => w === 'cron' ? drummer(L, cc, { pos: LINEUP.cron.pos, riser: 44, t, col: BAND.cron.col }) : w === 'clawd' ? singer(L, cc, { pos: LINEUP.clawd.pos, t, mouth: 0, eyes: 'open' }) : player(L, cc, { who: w, ...LINEUP[w], t, play: 0, glow: .2 }) })),
      refl: { floor: true, wall: 0 }, post: { shafts: 0, glow: [.4, .5], vignette: .8 },
      after: (g2, E) => drawEtch(g2, c, t, dedCuts, { laser: '#f3efe6', E, out: 9, w: 1.8 }),
    });
  });
  // --- Bar 1: the riff as a storm of cuts.
  const b1 = riff(2.2, 4.18);
  const cSt = C({ pos: [0, 330, 760], at: [0, 330, -160], fov: .78 });
  const slashes = b1.map(([tt, midi, st], i) => {
    const a = (midi % 12) / 12 * Math.PI + i * .35, len = 180 + (midi - 50) * 4;
    const cx = (hash(i, 1) - .5) * 360, cy = 180 + hash(i, 2) * 380;
    return { t: tt, st, a: [cx - Math.cos(a) * len / 2, cy - Math.sin(a) * len / 2], b: [cx + Math.cos(a) * len / 2, cy + Math.sin(a) * len / 2] };
  });
  // The shards: on every note after the first few, a sliver along the cut drops out, bigger as
  // the bar goes on, so the wall comes apart into a lattice of light.
  const shards = slashes.filter((s, i) => i > 2).map((s, i) => {
    const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
    const grow = 1 + i * .08;
    const w = (22 + hash(i, 5) * 40) * grow, k0 = .1 + hash(i, 6) * .2, k1 = .7 + hash(i, 7) * .25;
    const P = (k, off) => [s.a[0] + dx * k + nx * off, s.a[1] + dy * k + ny * off];
    return shardCut([P(k0, 0), P(k1, 0), P(k1 - .12, w), P(k0 + .1, w * .85)], s.t + .02, WALL);
  });
  shot(2.27, 4.18, (g, t, sh) => {
    const c0 = move(t, sh, { pos: [0, 300, 800], at: [0, 310, -160], fov: .8 }, { pos: [0, 250, 920], at: [0, 265, -160], fov: .75 }, { shake: 7, ease: easeOut });
    const c = cam(c0.pos, c0.target, { fov: c0.fov, roll: (t - 2.27) * .06 - .04 });
    boxFrame(g, t, c, {
      lights: lightFor('regex'),
      cuts: shards, cutOpt: { outside: dayOut(c, t), laser: BAND.regex.col, light: .5, haze: .08, fall: 'blow', fallDur: .6 },
      band: ['cron', 'null', 'regex', 'clawd'].map(w => ({ name: w, col: BAND[w].col, rimDir: [0, -1], rim: 2,
        draw: (L, cc) => w === 'cron' ? drummer(L, cc, { pos: LINEUP.cron.pos, riser: 44, t, col: BAND.cron.col }) : w === 'clawd' ? singer(L, cc, { pos: LINEUP.clawd.pos, t, mouth: 0 }) : player(L, cc, { who: w, ...LINEUP[w], t, glow: w === 'regex' ? 1.2 : .3 }) })),
      refl: { floor: true, wall: 0 }, rays: 1, post: { shafts: .55, glow: [.22, .3], split: hit('snare', t, .06) * 4, focus: hit('crash', t, .15) },
      after: (g2, E) => {
        // The dedication, still glowing on the glass as the first cuts cross it, then gone.
        drawEtch(g2, c, t, dedCuts, { laser: '#f3efe6', E, out: 2.75, w: 1.8 });
        slashes2(g2, E, c, t);
      },
    });
  });
  const slashes2 = (g2, E, c, t) => {
    for (const s of slashes) {
      if (t < s.t) continue;
      const p = clamp((t - s.t) / .06), age = t - s.t;
      const pa = project(c, ap(WALL, [s.a[0], s.a[1], 0])), pb = project(c, ap(WALL, [lerp(s.a[0], s.b[0], p), lerp(s.a[1], s.b[1], p), 0]));
      const heat = Math.exp(-age / .25);
      for (const [ctx, w, col] of [[g2, 5 * heat + 1.2, `rgba(46,230,255,${.35 + .5 * heat})`], [g2, 1.4, `rgba(255,255,255,${.3 + .7 * heat})`], [E, 10 * heat + 2, `rgba(46,230,255,${.6 * heat + .15})`]]) {
        ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      }
      if (p < 1) { E.fillStyle = '#fff'; E.beginPath(); E.arc(pb.x, pb.y, 12, 0, Math.PI * 2); E.fill(); }
    }
  };
  // --- Bars 2-5: each member, his name cut a letter a note, his label under it.
  const bars = [4.18, 5.921, 7.69, 9.45, 11.2];
  ['regex', 'cron', 'null', 'clawd'].forEach((who, n) => {
    const a = bars[n], b = bars[n + 1];
    const notes = riff(a - .1, b).map(r => r[0]);
    const name = BAND[who].name;
    const setA = { pos: [n % 2 ? 90 : -90, 60, 560], at: [0, 150, -160], fov: .84, roll: n % 2 ? .04 : -.04 };
    const setB = { pos: [n % 2 ? 50 : -50, 70, 480], at: [0, 150, -160], fov: .84, roll: n % 2 ? .02 : -.02 };
    const cRef = C({ ...setA, pos: setA.pos.map((v, i) => (v + setB.pos[i]) / 2) });
    const f = fit(name, cRef, WALL, 60, 1020, 640);
    const cuts = lettersOn(name, notes.slice(0, name.length).map(x => x - .03), WALL, f.u, f.v, f.em, { dur: .08 });
    const done = notes[Math.min(name.length, notes.length) - 1] ?? a + .8;
    // Behind him, washed in his colour, the one he built for.
    const USER = { regex: ['bakery', 'built'], cron: ['clinic', 'built'], null: ['school', 'built'], clawd: ['wedding', 'show'] }[who];
    const behind = [40, 690, 1040, 1560];
    shot(a, b, (g, t, sh) => {
      const c = move(t, sh, setA, setB, { shake: 5, ease: easeOut });
      boxFrame(g, t, c, {
        panes: [{ ...scenePane(c, cRef, t, behind, USER[0], USER[1], who === 'cron' ? { fit: { u: .5, v: .46, x: 790, y: 690, w: 1100 } } : { chart: 'bad' }, { t0: (notes[0] ?? a) - .02, seed: 120 + n, k: 1.05 }), dim: .42, tint: BAND[who].col, light: .2 }],
        lights: lightFor(who),
        cuts, cutOpt: { outside: dayOut(c), laser: BAND[who].col, light: .8, fall: 'blow', fallDur: .6 },
        band: [MEMBER[who](t)],
        beams: [[[-200, 480, 380], [0, 0, 210], 80, BAND[who].col, 1]],
        smoke: [[0, 60, 260, 70, BAND[who].col, 8 + n, .7]],
        refl: { floor: true, wall: 2 }, rays: .9, post: { shafts: .45, glow: [.3, .42], split: hit('crash', t, .1) * 5 },
        after: (g2, E) => {
          // The label, once the name is cut: the role, then the brief he keeps.
          const k = clamp((t - done - .02) / .12);
          if (k > 0) {
            flat(g2, ROLE[who], 60, 1080 + (1 - k) * 20, 56, 'monoB', { fill: BAND[who].col, alpha: k, track: 8 });
            ticket(g2, BAND[who].brief, 60, 1110 + (1 - k) * 20, k);
          }
        },
      });
    });
  });
  // --- Bar 6: the band, and the title, a letter on each note.
  const tn = riff(11.15, 12.97).map(r => r[0]);
  const cT = C({ pos: [0, 150, 1100], at: [0, 210, -160], fov: .56 });
  // Three rows, each as wide as the frame allows, stacked by their own cap heights.
  const title = [];
  const rowsT = ['HOW', 'WILL I', 'KNOW'];
  const tl = screenToPlane(cT, WALL, 110, 200), tr = screenToPlane(cT, WALL, 970, 200);
  const uw = tr[0] - tl[0];
  let k = 0, v = tl[1];
  for (const str of rowsT) {
    const em = Math.min(uw / (width100(str) / 100), 150);
    const wdt = width100(str) / 100 * em;
    v -= em * CAPK();
    title.push(...lettersOn(str, tn.slice(k, k + str.replace(/ /g, '').length).map(x => x - .03), WALL, tl[0] + (uw - wdt) / 2, v, em, { dur: .08 }));
    k += str.replace(/ /g, '').length;
    v -= em * CAPK() * .16;
  }
  shot(11.2, 14.0, (g, t, sh) => {
    const c = move(t, sh, { pos: [0, 150, 1150], at: [0, 210, -160], fov: .56 }, { pos: [0, 140, 1040], at: [0, 205, -160], fov: .55 }, { shake: 4 });
    boxFrame(g, t, c, {
      lights: STAGE_LIGHTS,
      cuts: title, cutOpt: { outside: dayOut(c), laser: BAND.clawd.col, light: .8, fall: 'blow', fallDur: .6 },
      band: ['cron', 'null', 'regex', 'clawd'].map(w => ({ name: w, col: BAND[w].col, rimDir: [w === 'regex' ? .6 : w === 'null' ? -.6 : 0, -1],
        draw: (L, cc) => w === 'cron' ? drummer(L, cc, { pos: LINEUP.cron.pos, riser: 44, t, col: BAND.cron.col }) : w === 'clawd' ? singer(L, cc, { pos: LINEUP.clawd.pos, t, mouth: .1 }) : player(L, cc, { who: w, ...LINEUP[w], t, glow: 1 }) })),
      smoke: STAGE_SMOKE, beams: STAGE_BEAMS,
      refl: { floor: true, wall: 2 }, rays: .9, post: { shafts: .45, glow: [.3, .42], split: hit('crash', t, .12) * 6 },
      after: (g2, E) => {
        const k2 = clamp((t - 12.9) / .3);
        if (k2 > 0) flat(g2, 'SOFTWARE QUALITY THEORY 101  ·  EPISODE 2', W / 2, 150, 28, 'monoB', { fill: INK.paper, alpha: k2 * .9, align: 'center', track: 4 });
      },
    });
  });
}
