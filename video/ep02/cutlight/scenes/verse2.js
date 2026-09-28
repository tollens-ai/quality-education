// Verse 2: an oracle for each app, in the same order and the same colours, and each one cuts a
// window. In verse 1 each member faced the mirror and saw only himself; now the mirror opens
// where his reflection was, and he can see out: the load test's customers, twice the crowd, in
// REGEX's cyan; the clinic's booking site, tried by NULL playing Gran; each family's messages
// sealed in a cell of its own; and for Dave and Sue, no check at all: Jess at the glass with her
// note, in her own hand.
import { W, H, clamp, lerp, easeInOut, easeOut, words, hit } from '../kit.js';
import { cam, project, ap } from '../space.js';
import { posterLine, ticket, etchFlat, flat, CAPK, windowCut } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY } from '../box.js';
import { WALL } from '../room.js';
import { player, singer } from '../playing.js';
import { clawd } from '../clawd.js';
import { bakeryView, clinicWindow, cellsView, noteView, backdrop } from '../world.js';
import { BAND } from '../palette.js';

// Facing the mirror, as in verse 1: the day through the cuts lights his face.
const mirrorLights = (col, pos) => ({
  key: { dir: [.15, .55, -1], col: '#fff1d6', k: 1.25 },
  ambient: '#0d0f1c',
  extra: [{ dir: [-.3, .6, .8], col: '#8d93b8', k: .22 }, { pos, col, k: 1.1, range: 520 }],
});
const lights = (col, pos) => ({
  key: { dir: [-.5, .7, .8], col: KEY, k: 1.2 },
  ambient: '#12162a',
  extra: [{ dir: [0, .4, -1], col: '#fff3de', k: .5 }, { pos, col, k: 1, range: 560 }],
});
const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
const D = 2200;

export function register(S) {
  // --- 1. REGEX, the load test: GIVE ME A TOOL TO RUN ON EVERY MERGE TO CHECK THE LOAD. On TOOL his
  // laser cuts out his reflection, and through it the queue at Rosa's, doubled in cyan, moving.
  {
    const ws = words('Verse 2', 'Give me a tool');
    const camA = { pos: [-70, 92, 180], at: [40, 82, -160], fov: .76 }, camB = { pos: [-45, 80, 135], at: [45, 80, -160], fov: .74, roll: -.015 };
    const cM = C({ pos: [-58, 86, 158], at: [42, 81, -160], fov: .75 });
    const cuts = posterLine(ws, WALL, cM, [60, 210, 1020, 800], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6], k: .8, align: 'left' }, { w: [7, 8], k: .9, align: 'right' }, { w: [9, 10, 11, 12] }], { gap: .2 });
    const merge = cuts.find(cw => cw.w.wi === 8);
    const box = [100, 860, 660, 1560];
    const win = windowCut(cM, WALL, box, ws[3].v + .05, { dur: .5, laser: BAND.regex.col, glowK: .22 });
    shot(60.8, 64.3, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2 });
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.regex.col, [220, 140, 40]),
        cuts: [...cuts, win], cutOpt: { outside: L => backdrop(L, c, cM, D, L2 => bakeryView(L2, t, 'load', 420)), laser: BAND.regex.col, light: .6, haze: .08 },
        band: [{ name: 'regex', col: BAND.regex.col, rimDir: [-.3, -1], rim: 3.6, draw: (L, cc) => player(L, cc, { who: 'regex', pos: [40, 0, -70], yaw: Math.PI + .5, t, glow: 1 }) }],
        beams: [[[240, 460, 60], [40, 0, -70], 70, BAND.regex.col, .9]],
        refl: { floor: true, hero: true }, rays: .7, sun: [-200, 180, -6000],
        after: (g2, E) => {
          // Branches merging into MERGE: two lines of a history, joining where the word is.
          const k = clamp((t - (merge.w.v - .4)) / .35);
          if (k <= 0) return;
          const y0 = merge.v + merge.em * .4, x1 = merge.u - 12;
          const P = (u, v) => project(c, ap(WALL, [u, v, .5]));
          g2.save(); g2.lineCap = 'round'; g2.strokeStyle = BAND.regex.col; g2.lineWidth = 4;
          for (const dv of [-merge.em * .5, merge.em * .5]) {
            const a = P(x1 - merge.em * 2.4, y0 + dv), m1 = P(x1 - merge.em * .9, y0 + dv), b = P(x1, y0);
            g2.beginPath(); g2.moveTo(a.x, a.y); g2.lineTo(lerp(a.x, m1.x, k), lerp(a.y, m1.y, k));
            if (k > .6) g2.quadraticCurveTo(m1.x + 20, m1.y, lerp(m1.x, b.x, (k - .6) / .4), lerp(m1.y, b.y, (k - .6) / .4));
            g2.stroke();
            g2.fillStyle = BAND.regex.col; g2.beginPath(); g2.arc(a.x, a.y, 9, 0, Math.PI * 2); g2.fill();
          }
          g2.restore();
        },
      });
    });
  }
  // --- 2. The clinic, tried by NULL as Gran: I'LL PROMPT A BOT TO ACT AS GRAN MAKE SURE SHE CAN GO.
  // He plays her for us, her glasses on, her phone held out; behind him a window on the booking
  // site he's trying, which spins, and on SHE CAN GO, books.
  {
    const ws = words('Verse 2', "I'll prompt");
    const set = { pos: [60, 110, 700], at: [0, 140, -160], fov: .8, roll: .02 }, set2 = { pos: [30, 104, 640], at: [0, 138, -160], fov: .8 };
    const cM = C({ pos: [45, 107, 670], at: [0, 139, -160], fov: .8 });
    const cuts = posterLine(ws, WALL, cM, [60, 210, 1020, 720], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6, 7], k: .95 }, { w: [8, 9], k: .8, align: 'left' }, { w: [10, 11, 12] }], { gap: .2 });
    const box = [120, 760, 960, 1330];
    const win = windowCut(cM, WALL, box, ws[3].v + .05, { dur: .5, laser: BAND.cron.col, glowK: .22 });
    const booked = ws[12].v - .2;
    // His phone, at arm's length the way Gran holds hers; part of him, so the glass shows it too.
    const phone = (L, cc, tip, t) => {
      const p = project(cc, tip);
      if (p.z < cc.near) return;
      const s = p.s;
      L.save(); L.translate(p.x, p.y); L.rotate(.2);
      L.fillStyle = '#0d0e11'; L.fillRect(-10 * s, -17 * s, 20 * s, 34 * s);
      L.fillStyle = t > booked ? '#bdf5cf' : '#ffd9e2'; L.fillRect(-8 * s, -15 * s, 16 * s, 30 * s);
      L.restore();
    };
    shot(64.3, 67.8, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 2 });
      boxFrame(g, t, c, {
        lights: lights(BAND.null.col, [260, 200, 380]),
        cuts: [...cuts, win], cutOpt: { outside: L => backdrop(L, c, cM, D, L2 => clinicWindow(L2, t, t > booked ? 'fine' : 'down', box)), laser: BAND.cron.col, light: .6, haze: .06 },
        band: [{ name: 'null', col: BAND.null.col, rimDir: [-.5, -1], draw: (L, cc) => { const r = clawd(L, cc, { who: 'null', pos: [70, 0, 300], yaw: -.3, t, gran: true, armR: { to: [44, 26, 40], z: 12 }, armL: { up: -.2 } }); phone(L, cc, r.tipR, t); } }],
        beams: [[[260, 460, 330], [70, 0, 300], 70, BAND.null.col, .9]],
        refl: { floor: true, wall: 1 }, rays: .7, sun: [200, 200, -6000],
      });
    });
  }
  // --- 3. The school: AN ISOLATION CHECK TO FIND THE THINGS THAT SHOULDN'T SHOW. Each word in a
  // cell of its own; and where NULL's reflection was, four cells, a family in each, their
  // messages theirs alone.
  {
    const ws = words('Verse 2', 'An isolation');
    const camA = { pos: [-75, 70, 190], at: [35, 110, -160], fov: .82, roll: -.02 }, camB = { pos: [-55, 64, 160], at: [40, 112, -160], fov: .8, roll: .02 };
    const cM = C({ pos: [-65, 67, 175], at: [38, 111, -160], fov: .81 });
    const cuts = posterLine(ws, WALL, cM, [60, 210, 1020, 790], [{ w: [0, 1] }, { w: [2, 3], k: .85 }, { w: [4, 5, 6], k: .85 }, { w: [7, 8, 9] }], { gap: .3 });
    const cells = [[90, 870, 520, 1160], [560, 870, 990, 1160], [90, 1195, 520, 1485], [560, 1195, 990, 1485]];
    const wins = cells.map((b, i) => windowCut(cM, WALL, b, ws[2].v + .1 + i * .18, { dur: .3, r: 22, laser: BAND.null.col, glowK: .25 }));
    shot(67.8, 70.9, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2 });
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.null.col, [-240, 140, 40]),
        cuts: [...cuts, ...wins], cutOpt: { outside: L => backdrop(L, c, cM, D, L2 => cellsView(L2, t, cells)), laser: BAND.null.col, light: .6, haze: .06 },
        band: [{ name: 'null', col: BAND.null.col, rimDir: [.4, -1], rim: 3.6, draw: (L, cc) => player(L, cc, { who: 'null', pos: [45, 0, -40], yaw: Math.PI + .5, t, glow: 1 }) }],
        beams: [[[-260, 460, 60], [45, 0, -40], 70, BAND.null.col, .9]],
        refl: { floor: true, hero: true }, rays: .7, sun: [0, 900, -6000],
        after: (g2) => {
          // The cells: a frame of the mirror's chrome round each word, closing as it's cut.
          for (const cw of cuts) {
            const k = clamp((t - (cw.w.v - .1)) / .2);
            if (k <= 0) continue;
            const pad = cw.em * .12;
            const q = [[cw.u - pad, cw.v - pad], [cw.u + cw.wid + pad, cw.v - pad], [cw.u + cw.wid + pad, cw.v + cw.em * CAPK() + pad], [cw.u - pad, cw.v + cw.em * CAPK() + pad]].map(([u, v]) => project(c, ap(WALL, [u, v, .5])));
            g2.save(); g2.strokeStyle = `rgba(165,123,255,${.9 * k})`; g2.lineWidth = 3;
            g2.beginPath(); q.forEach((p, i) => i ? g2.lineTo(p.x, p.y) : g2.moveTo(p.x, p.y)); g2.closePath(); g2.stroke();
            g2.restore();
          }
        },
      });
    });
  }
  // --- 4. The wedding: BUT AS FOR DAVE AND SUE, YOU REALLY HAD TO LET ME KNOW! He sings to the
  // mirror, and on DAVE it opens where his reflection was: Jess, holding up her note.
  {
    const ws = words('Verse 2', 'But as for');
    const camA = { pos: [160, 112, 120], at: [18, 100, -160], fov: .76 }, camB = { pos: [115, 92, 55], at: [12, 88, -160], fov: .76, roll: .02 };
    const cM = C(camB);
    const cuts = posterLine(ws, WALL, cM, [70, 210, 1010, 760], [{ w: [0, 1, 2], k: .7, align: 'left' }, { w: [3, 4, 5] }, { w: [6, 7, 8, 9], k: .9 }, { w: [10, 11, 12] }], { gap: .2 });
    const box = [330, 790, 1040, 1540];
    const win = windowCut(cM, WALL, box, ws[3].v + .05, { dur: .5, laser: '#fff1dc', glowK: .2 });
    shot(70.9, 74.5, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2, ease: easeOut });
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.clawd.col, [220, 160, 60]),
        cuts: [...cuts, win], cutOpt: { outside: L => backdrop(L, c, cM, D, L2 => noteView(L2, t, box)), laser: BAND.clawd.col, light: .6, haze: .05 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [-.3, -1], rim: 3.6, draw: (L, cc) => singer(L, cc, { pos: [0, 0, -100], yaw: Math.PI - .45, t }) }],
        beams: [[[220, 460, 60], [0, 0, -100], 70, BAND.clawd.col, .9]],
        refl: { floor: true, hero: true }, rays: .7, sun: [0, 400, -6000],
      });
    });
  }
  // Labels, each up with its shot (with who tried it, for the one a bandmate tested), and the
  // echoes, etched beside whoever sings them.
  const starts = [60.8, 64.3, 67.8, 70.9];
  ['Give me a tool', "I'll prompt", 'An isolation', 'But as for'].forEach((l, n) => {
    const w0 = words('Verse 2', l)[0], a = Math.max(starts[n], w0.v - .25), b = w0.v + 2.6;
    overlay(a, b, (g, t) => {
      const al = clamp((t - a) / .15) * clamp((b - t) / .3);
      ticket(g, n, 40, 108, al);
      if (n === 1) flat(g, 'TRIED BY NULL, PLAYING GRAN', 136, 214, 24, 'monoB', { fill: BAND.null.col, alpha: al, track: 2 });
    });
  });
  const at = [[850, 930, 110, 64.45], [800, 1440, 110, 67.95], [190, 1010, 90, 74.6]];
  for (let i = 0; i < 3; i++) {
    let w;
    try { w = words('Verse 2', 'ohhh', i)[0]; } catch { continue; }
    const col = [BAND.regex.col, BAND.null.col, BAND.clawd.col][i], [x, y, px, end] = at[i];
    overlay(w.v - .2, Math.max(end, w.v + .8), (g, t) => {
      const p = clamp((t - (w.v - .2)) / .2), a = clamp((Math.max(end, w.v + .8) - t) / .15);
      etchFlat(g, 'OHHH', x, y, px, col, p, { align: 'center', alpha: a, w0: w });
    });
  }
}
