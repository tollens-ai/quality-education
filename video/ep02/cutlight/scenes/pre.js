// The pre-choruses: CLAWD alone at the glass. He puts a hand to the mirror and his reflection
// puts one back; BROKEN cracks out from the hand. HOW WILL I KNOW FOR MYSELF, and the reflection
// sings the echo. SOMETHING ELSE, down the tunnel of reflections, while the band's lights come up
// one at a time for the chorus. The third time, the people are outside, looking in.
import { W, H, clamp, lerp, hash, easeOut, easeInOut, words, hit, env, line } from '../kit.js';
import { cam, project, ap, screenToPlane } from '../space.js';
import { posterLine, etchFlat, flat, carry, width100 } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY, LINEUP, STAGE_LIGHTS, STAGE_SMOKE, STAGE_BEAMS } from '../box.js';
import { WALL, ROOM } from '../room.js';
import { player, singer, drummer } from '../playing.js';
import { clawd } from '../clawd.js';
import { sky, backdrop, onlookers } from '../world.js';
import { BAND } from '../palette.js';
import { INK } from '../ink.js';

const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
const D = 2200;
const soloLights = (k = 1) => ({
  key: { dir: [.3, .6, .9], col: KEY, k: .9 },
  ambient: '#10122a',
  extra: [{ dir: [0, .35, -1], col: '#fff3de', k: .6 * k }, { pos: [160, 200, 160], col: BAND.clawd.col, k: .9, range: 500 }],
});

// A crack in the mirror from the point (u, v) on the wall: rays out and rings round, growing.
function crack(g, c, u, v, p, seed, E) {
  if (p <= 0) return;
  const P = (x, y) => project(c, ap(WALL, [x, y, .5]));
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + hash(i, seed) * .5, len = (60 + hash(i, seed, 2) * 140) * easeOut(p);
    let x = u, y = v;
    g.beginPath(); const s0 = P(x, y); g.moveTo(s0.x, s0.y);
    for (let k = 1; k <= 4; k++) { x = u + Math.cos(a + (hash(i, k, seed) - .5) * .4) * len * k / 4; y = v + Math.sin(a + (hash(i, k, seed) - .5) * .4) * len * k / 4; const s = P(x, y); g.lineTo(s.x, s.y); }
    g.strokeStyle = 'rgba(255,245,230,.85)'; g.lineWidth = 1.6; g.stroke();
    if (E) { E.strokeStyle = 'rgba(255,170,130,.5)'; E.lineWidth = 4; E.stroke(); }
  }
  for (let r = 1; r <= 3; r++) {
    g.beginPath();
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = r * 32 * easeOut(p) * (.8 + hash(i, r, seed) * .4); const s = P(u + Math.cos(a) * rr, v + Math.sin(a) * rr); i ? g.lineTo(s.x, s.y) : g.moveTo(s.x, s.y); }
    g.strokeStyle = 'rgba(255,245,230,.55)'; g.lineWidth = 1.1; g.stroke();
  }
  g.restore();
}

export function register(S) {
  for (const k of [1, 2, 3]) prechorus(k);
}

function prechorus(k) {
  const sec = 'Pre-chorus ' + k;
  const L1 = words(sec, 'You can tell'), L2 = words(sec, 'for myself'), L3 = words(sec, 'So baby');
  const echoes = [0, 1].map(i => { try { return words(sec, 'something else', i); } catch { return null; } }).filter(Boolean);
  const start = L1[0].v - .3, pb = L1[6].v - .12, pc = L3[0].v - .12, pd = L3[11].v + .45;
  const end = { 1: 38.9, 2: 84.6, 3: 127.0 }[k];
  const outsideOf = (c, t = 0) => L => k === 3 ? onlookers(L, c, t) : sky(L, c, 0, { sun: [0, 300, -6000] });
  // --- PA: his back to us, his stub on the glass; his reflection looks back. BROKEN cracks out.
  {
    const set = { pos: [45, 82, 110], at: [-35, 76, -165], fov: .9, roll: -.01 };
    const set2 = { pos: [42, 80, 84], at: [-35, 75, -165], fov: .87, roll: -.015 };
    const cR = C(set2);
    const cuts = posterLine(L1, WALL, cR, [70, 230, 1000, 800], [{ w: [0, 1, 2, 3, 4] }, { w: [5], k: 1 }], { gap: .25 });
    for (const cw of cuts) if (cw.w.wi === 5) cw.o.stuck = true;
    const handAt = [-44, 46];
    const brk = L1[5].v;
    shot(start, pb, (g, t, sh) => {
      const c = move(t, sh, set, set2, { hand: .8 });
      const clawdAt = { who: 'clawd', pos: [-30, 0, -118], yaw: Math.PI - .55, t, eyes: 'sad', armL: { to: [4, 6, 36], z: 12 }, armR: { up: -.1 } };
      boxFrame(g, t, c, {
        see: k === 3 ? .4 : 0,
        lights: soloLights(), cuts, cutOpt: { outside: outsideOf(c, t), laser: BAND.clawd.col, light: .5 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [-.5, -1], draw: (L, cc) => clawd(L, cc, clawdAt) }],
        refl: { floor: true, wall: 1, wallA: .85 }, post: { shafts: .3, glow: [.3, .35], glitch: t > brk ? hit('snare', t, .08) * .3 : 0 },
        behind: (B, E) => crack(B, c, handAt[0], handAt[1], clamp((t - brk + .12) / .5), k, E),
      });
    });
  }
  // --- PB: BUT HOW WILL I KNOW FOR MYSELF? The camera pulls back; the reflection sings the echo.
  {
    const set = { pos: [-60, 110, 520], at: [0, 150, -160], fov: .8, roll: .02 }, set2 = { pos: [-90, 120, 640], at: [0, 160, -160], fov: .82 };
    const cR = C({ pos: [-75, 115, 580], at: [0, 155, -160], fov: .81 });
    const cuts = carry(posterLine(L1, WALL, cR, [70, 140, 1010, 950], [{ w: [0, 1, 2, 3, 4, 5], k: .9 }, { w: [6, 7] }, { w: [8, 9, 10] }, { w: [11, 12] }], { gap: .18 }), pb);
    shot(pb, pc, (g, t, sh) => {
      const c = move(t, sh, set, set2, { hand: 1, ease: easeOut });
      boxFrame(g, t, c, {
        see: k === 3 ? .5 : 0,
        lights: soloLights(), cuts, cutOpt: { outside: outsideOf(c, t), laser: BAND.clawd.col, light: .55 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [.4, -1], draw: (L, cc) => clawd(L, cc, { who: 'clawd', pos: [60, 0, 120], yaw: Math.PI - .5, t, eyes: 'sad' }) }],
        refl: { floor: true, wall: 2, wallA: .6 }, rays: .6, post: { shafts: .35 },
      });
    });
    // The echo, sung by his reflection: FOR, then MYSELF?, in the gap between the words and his
    // head, which in the next shot is his face.
    const px = 96, x0 = 920 - width100('FOR MYSELF?') / 100 * px;
    L2.slice(0, 2).forEach((e, i) => {
      overlay(e.v - .15, pc + .4, (g, t) => {
        const p = clamp((t - (e.v - .15)) / .2), a = clamp((pc + .4 - t) / .3);
        etchFlat(g, i ? 'MYSELF?' : 'FOR', x0 + (i ? width100('FOR ') / 100 * px : 0), 1045, px, BAND.clawd.col, p, { alpha: a * .95, w0: e });
      });
    });
  }
  // --- PC: SO BABY NOW I'M HOPING, THAT YOU CAN GIVE ME SOMETHING ELSE, to his face, the tunnel
  // of reflections behind him.
  {
    const set = { pos: [0, 64, 380], at: [0, 120, -160], fov: .8 }, set2 = { pos: [10, 60, 330], at: [0, 118, -160], fov: .78 };
    const cR = C({ pos: [5, 62, 355], at: [0, 119, -160], fov: .79 });
    const cuts = posterLine(L3, WALL, cR, [70, 170, 1010, 900], [{ w: [0, 1] }, { w: [2, 3, 4], k: .9 }, { w: [5, 6, 7], k: .8 }, { w: [8, 9, 10, 11] }], { gap: .2 });
    shot(pc, pd, (g, t, sh) => {
      const c = move(t, sh, set, set2, { hand: .8 });
      const v = env('vocal', t);
      boxFrame(g, t, c, {
        see: k === 3 ? .55 : 0,
        lights: soloLights(), cuts, cutOpt: { outside: outsideOf(c, t), laser: BAND.clawd.col, light: .55 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [0, -1], draw: (L, cc) => clawd(L, cc, { who: 'clawd', pos: [0, 0, 150], yaw: .08, t, eyes: 'sad', mouth: clamp(v * 1.4), look: [0, .3] }) }],
        refl: { floor: true, wall: 4, wallA: .55 }, rays: .5, post: { shafts: .3 },
      });
    });
  }
  // --- PD: the echoes of SOMETHING ELSE, and the band's lights coming up one by one.
  {
    const set = { pos: [0, 120, 1000], at: [0, 170, -160], fov: .56 }, set2 = { pos: [0, 110, 900], at: [0, 165, -160], fov: .56 };
    const order = ['regex', 'null', 'cron', 'clawd'];
    shot(pd, end, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 3 * clamp((t - (end - 1.2)) / 1.2) });
      const up = w => clamp((t - (pd + order.indexOf(w) * (end - pd - .6) / 4)) / .25);
      const lights = { ...STAGE_LIGHTS, extra: STAGE_LIGHTS.extra.map(L => ({ ...L, k: L.k * (L.col && order.find(w => BAND[w].col === L.col) ? up(order.find(w => BAND[w].col === L.col)) : 1) })) };
      boxFrame(g, t, c, {
        see: k === 3 ? .6 : 0,
        lights,
        band: ['cron', 'null', 'regex', 'clawd'].map(w => ({ name: w, col: up(w) > .5 ? BAND[w].col : null, rimDir: [w === 'regex' ? .6 : w === 'null' ? -.6 : 0, -1], rim: 1 + up(w) * 2.2,
          draw: (L, cc) => w === 'cron' ? drummer(L, cc, { pos: LINEUP.cron.pos, riser: 44, t, col: BAND.cron.col }) : w === 'clawd' ? singer(L, cc, { pos: LINEUP.clawd.pos, t, eyes: 'narrow' }) : player(L, cc, { who: w, ...LINEUP[w], t, glow: up(w) }) })),
        beams: STAGE_BEAMS.filter((b, i) => up(['clawd', 'regex', 'null', 'cron'][i]) > .5),
        smoke: STAGE_SMOKE, refl: { floor: true, wall: 3 }, post: { shafts: 0, glow: [.35, .45] }, seeView: k === 3 ? L => onlookers(L, c, t) : null,
      });
    });
    echoes.forEach((ew, i) => {
      const e = ew[0];
      overlay(e.v - .15, end, (g, t) => {
        const p = clamp((t - (e.v - .15)) / .22);
        const s = i ? .72 : 1;
        etchFlat(g, 'SOMETHING', W / 2, 520 + i * 330, 170 * s, BAND.clawd.col, p, { align: 'center', alpha: .95 - i * .15, w0: e, w: 3.2 * s });
        const e2 = ew[1];
        const p2 = clamp((t - (e2.v - .15)) / .22);
        etchFlat(g, 'ELSE', W / 2, 520 + i * 330 + 170 * s * .95, 170 * s, BAND.clawd.col, p2, { align: 'center', alpha: .95 - i * .15, w0: e2, w: 3.2 * s });
      });
    });
  }
}
