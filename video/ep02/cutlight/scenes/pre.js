// The pre-choruses. YOU CAN TELL ME IT'S BROKEN: four windows light in the glass, and in each,
// someone the band built for holds up what they have to show him: the first time what went wrong,
// the second what the checks put right (but Jess still has her note), the third what they know,
// written on a card. BROKEN won't come out, and the glass cracks. BUT HOW WILL I KNOW FOR MYSELF:
// the camera pulls back, the windows go dark a word at a time, and he's alone with his reflection,
// which sings the echo. SO BABY NOW I'M HOPING, to his face. SOMETHING ELSE: back down the tunnel
// of reflections, and the band's lights slam on one by one, a whip to each as his comes on, then in
// on the roll to the chorus.
import { W, H, clamp, lerp, hash, easeOut, easeInOut, words, hit, env, eventsIn } from '../kit.js';
import { cam, project, ap, projPoly, tracePoly } from '../space.js';
import { layer, put } from '../post.js';
import { posterLine, etchFlat, carry, width100 } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY, LINEUP, STAGE_LIGHTS, STAGE_SMOKE, STAGE_BEAMS, wallRect } from '../box.js';
import { WALL, ROOM } from '../room.js';
import { player, singer, drummer } from '../playing.js';
import { clawd } from '../clawd.js';
import { sky, backdrop, onlookers } from '../world.js';
import { HOLD, withText, windowPanes, scenePane, row } from '../windows.js';
import { BAND } from '../palette.js';

const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
const D = 2200;
const soloLights = (k = 1) => ({
  key: { dir: [.3, .6, .9], col: KEY, k: .9 },
  ambient: '#10122a',
  extra: [{ dir: [0, .35, -1], col: '#fff3de', k: .6 * k }, { pos: [160, 200, 160], col: BAND.clawd.col, k: .9, range: 500 }],
});
const outside = (c, cR, t, draw) => L => { sky(L, c, t, { sun: [0, 420, -6000] }); backdrop(L, c, cR, D, draw); };

// A crack in the mirror from the point (u, v) on the wall: rays out and rings round, growing.
// Where the glass is lit (the rects in `lit`, wall cm), it runs behind what's shown, not over it.
function crack(g0, c, u, v, p, seed, E0, lit = []) {
  if (p <= 0) return;
  const g = layer('crack'), E = E0 ? layer('crackE') : null;
  const P = (x, y) => project(c, ap(WALL, [x, y, .5]));
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + hash(i, seed) * .5, len = (60 + hash(i, seed, 2) * 140) * easeOut(p);
    let x = u, y = v;
    g.beginPath(); const s0 = P(x, y); g.moveTo(s0.x, s0.y);
    for (let k = 1; k <= 4; k++) { x = u + Math.cos(a + (hash(i, k, seed) - .5) * .4) * len * k / 4; y = v + Math.sin(a + (hash(i, k, seed) - .5) * .4) * len * k / 4; const s = P(x, y); g.lineTo(s.x, s.y); }
    g.strokeStyle = 'rgba(255,245,230,.85)'; g.lineWidth = 1.8; g.stroke();
    if (E) { E.strokeStyle = 'rgba(255,170,130,.5)'; E.lineWidth = 4; E.stroke(); }
  }
  for (let r = 1; r <= 3; r++) {
    g.beginPath();
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = r * 32 * easeOut(p) * (.8 + hash(i, r, seed) * .4); const s = P(u + Math.cos(a) * rr, v + Math.sin(a) * rr); i ? g.lineTo(s.x, s.y) : g.moveTo(s.x, s.y); }
    g.strokeStyle = 'rgba(255,245,230,.55)'; g.lineWidth = 1.2; g.stroke();
  }
  g.restore();
  for (const L of [g, E]) {
    if (!L) continue;
    L.save(); L.globalCompositeOperation = 'destination-out'; L.fillStyle = '#000';
    for (const [x0, y0, x1, y1] of lit) { const pp = projPoly(c, [[x0, y0, ROOM.back], [x1, y0, ROOM.back], [x1, y1, ROOM.back], [x0, y1, ROOM.back]]); if (pp) { L.beginPath(); tracePoly(L, pp); L.fill(); } }
    L.restore();
  }
  put(g0, g);
  if (E) put(E0, E);
}

// What the four hold up to the glass, each time: what went wrong; what the checks put right (and
// Jess's note); what they know, written as we watch.
const SHOWN = { 1: HOLD.broken, 2: HOLD.fixed, 3: withText(HOLD.cards, 0) };
// The four windows, as the first shot's camera sees them: two by two under the words.
const WINS = [[60, 650, 528, 1170], [552, 650, 1020, 1170], [60, 1194, 528, 1714], [552, 1194, 1020, 1714]];

export function register(S) {
  for (const k of [1, 2, 3]) prechorus(k);
}

function prechorus(k) {
  const sec = 'Pre-chorus ' + k;
  const L1 = words(sec, 'You can tell'), L2 = words(sec, 'for myself'), L3 = words(sec, 'So baby');
  const echoes = [0, 1].map(i => { try { return words(sec, 'something else', i); } catch { return null; } }).filter(Boolean);
  const start = L1[0].v - .3, pb = L1[6].v - .12, pc = L3[0].v - .12, pd = L3[11].v + .45;
  const end = { 1: 38.9, 2: 84.6, 3: 127.0 }[k];
  // Through the letters, the day; the third time, from SO BABY on, the town come to the glass.
  const outsideOf = (c, t = 0, town = false) => L => k === 3 && town ? onlookers(L, c, t) : sky(L, c, 0, { sun: [0, 300, -6000] });
  // The windows' shared setup: where they are on the wall, and what each shows.
  const cA = C({ pos: [0, 112, 160], at: [0, 100, -160], fov: .775 });
  const rects = WINS.map(b => wallRect(cA, b));
  const brk = L1[5].v;
  const on = i => L1[2].v - .08 + i * .09, off = i => L1[7 + i].v - .05;
  const wins = (c, cR, t, lit) => windowPanes(c, cA, t, WINS, SHOWN[k], {
    rects, on, off: lit ? null : off, seed: 10 * k, textP: k === 3 ? (tt, i) => clamp((tt - on(i) - .15) / .9) : null,
  });
  // --- PA: the four at the glass. BROKEN is cut and won't come out, and the glass cracks from it.
  {
    const set = { pos: [0, 114, 172], at: [0, 101, -160], fov: .78 }, set2 = { pos: [0, 110, 150], at: [0, 99, -160], fov: .77 };
    const cuts = posterLine(L1, WALL, cA, [70, 200, 1010, 616], [{ w: [0, 1, 2, 3, 4] }, { w: [5], k: .96 }], { gap: .22 });
    for (const cw of cuts) if (cw.w.wi === 5) cw.o.stuck = true;
    const at = [0, (rects[0][1] + rects[2][3]) / 2];
    shot(start, pb, (g, t, sh) => {
      const c = move(t, sh, set, set2, { hand: .7, ease: easeInOut });
      boxFrame(g, t, c, {
        lights: soloLights(), cuts, cutOpt: { outside: outsideOf(c, t), laser: BAND.clawd.col, light: .5 },
        panes: wins(c, cA, t, true),
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [-.5, -1], reflOnly: true, draw: (L, cc) => clawd(L, cc, { who: 'clawd', pos: [0, 0, 204], yaw: Math.PI, t, eyes: 'sad' }) }],
        refl: { floor: true, hero: true }, post: { shafts: .25, glow: [.3, .35], glitch: t > brk ? hit('snare', t, .08) * .3 : 0 },
        after: (G, E) => crack(G, c, at[0], at[1], clamp((t - brk + .1) / .45), k, E, rects),
      });
    });
  }
  // --- PB: BUT HOW WILL I KNOW FOR MYSELF? The camera pulls back past him; the windows go dark a
  // word at a time; the reflection sings the echo.
  {
    const set = { pos: [-20, 124, 420], at: [0, 120, -160], fov: .8, roll: .015 }, set2 = { pos: [-50, 132, 610], at: [0, 138, -160], fov: .82 };
    const cR = C({ pos: [-35, 128, 515], at: [0, 129, -160], fov: .81 });
    const cuts = carry(posterLine(L1, WALL, cR, [70, 140, 1010, 790], [{ w: [0, 1, 2, 3, 4, 5], k: .9 }, { w: [6, 7] }, { w: [8, 9, 10] }, { w: [11, 12] }], { gap: .18 }), pb);
    const at = [0, (rects[0][1] + rects[2][3]) / 2];
    shot(pb, pc, (g, t, sh) => {
      const c = move(t, sh, set, set2, { hand: 1, ease: easeOut });
      boxFrame(g, t, c, {
        lights: soloLights(), cuts, cutOpt: { outside: outsideOf(c, t), laser: BAND.clawd.col, light: .55 },
        panes: wins(c, cA, t, false),
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [.4, -1], draw: (L, cc) => clawd(L, cc, { who: 'clawd', pos: [0, 0, 110], yaw: Math.PI, t, eyes: 'sad' }) }],
        refl: { floor: true, wall: 2, wallA: .6, hero: true }, rays: .5, post: { shafts: .3 },
        behind: (B, E) => crack(B, c, at[0], at[1], 1, k, E, rects.filter((r, i) => t < off(i) + .15)),
      });
    });
    // The echo, sung by his reflection: FOR, then MYSELF?, in the gap between the words and his
    // head, which in the next shot is his face.
    const px = 96, x0 = 920 - width100('FOR MYSELF?') / 100 * px;
    L2.slice(0, 2).forEach((e, i) => {
      overlay(e.v - .15, pc + .4, (g, t) => {
        const p = clamp((t - (e.v - .15)) / .2), a = clamp((pc + .4 - t) / .3);
        etchFlat(g, i ? 'MYSELF?' : 'FOR', x0 + (i ? width100('FOR ') / 100 * px : 0), 1010, px, BAND.clawd.col, p, { alpha: a * .95, w0: e });
      });
    });
  }
  // --- PC: SO BABY NOW I'M HOPING, THAT YOU CAN GIVE ME SOMETHING ELSE, to his face, the tunnel
  // of reflections behind him; on YOU, dim in the glass over his head, the four he's asking.
  {
    const set = { pos: [0, 64, 380], at: [0, 120, -160], fov: .8 }, set2 = { pos: [10, 60, 330], at: [0, 118, -160], fov: .78, roll: -.03 };
    const cR = C({ pos: [5, 62, 355], at: [0, 119, -160], fov: .79 });
    const cuts = posterLine(L3, WALL, cR, [70, 170, 1010, 900], [{ w: [0, 1] }, { w: [2, 3, 4], k: .9 }, { w: [5, 6, 7], k: .8 }, { w: [8, 9, 10, 11] }], { gap: .2 });
    const faint = row(4, 60, 1020, 935, 1235, 16), youAt = i => L3[6].v - .1 + i * .1;
    const STAND = [['bakery', 'stand'], ['clinic', 'stand'], ['school', 'built'], ['wedding', 'stand']];
    shot(pc, pd, (g, t, sh) => {
      const c = move(t, sh, set, set2, { hand: .8 });
      const v = env('vocal', t);
      const users = k === 1 ? STAND.map(([b, st], i) => ({ ...scenePane(c, cR, t, faint[i], b, st, {}, { t0: youAt(i), seed: 130 + i, k: 1.1 }), dim: .5, light: .1 }))
        : k === 2 ? windowPanes(c, cR, t, faint, HOLD.fixed, { on: youAt, seed: 134, k: .5 }).map(p => ({ ...p, dim: .45, light: .1 })) : [];
      boxFrame(g, t, c, {
        panes: users,
        see: k === 3 ? .55 : 0,
        lights: soloLights(), cuts, cutOpt: { outside: outsideOf(c, t, true), laser: BAND.clawd.col, light: .55 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [0, -1], draw: (L, cc) => clawd(L, cc, { who: 'clawd', pos: [0, 0, 150], yaw: .08, t, eyes: 'sad', mouth: clamp(v * 1.4), look: [0, .3] }) }],
        refl: { floor: true, wall: 4, wallA: .55 }, rays: .5, post: { shafts: .3 },
      });
    });
  }
  // --- PD: SOMETHING ELSE. Out of his face and back down the tunnel; then each member's light
  // slams on with a snare hit, and the camera whips to him; then in on the roll.
  {
    const order = ['regex', 'null', 'cron', 'clawd'];
    const snares = eventsIn('snare', pd + .62, end - 1.1);
    const whips = [];
    for (const s of snares) if (!whips.length || s - whips[whips.length - 1] > .38) whips.push(s);
    while (whips.length > 4) whips.splice(1 + Math.floor((whips.length - 2) / 2), 1);
    const lightAt = w => whips[order.indexOf(w)] ?? pd + order.indexOf(w) * .5;
    // Each whip lands on one member, close, from a little to his side.
    const SIDE = { regex: -40, null: 40, cron: 30, clawd: -20 };
    const aimOf = w => { const p = LINEUP[w].pos; return { at: [p[0], w === 'cron' ? 84 : 44, p[2]], pos: [p[0] + SIDE[w], w === 'cron' ? 168 : 62, p[2] + (w === 'cron' ? 280 : 250)] }; };
    const WIDE = { pos: [0, 120, 1000], at: [0, 170, -160], fov: .56 };
    const camAt = t => {
      // Back down the tunnel from his face, first.
      const r = easeOut(clamp((t - pd) / .6));
      let pos = [lerp(10, 0, r), lerp(64, 120, r), lerp(260, 900, r)], at = [0, lerp(110, 150, r), -160], fov = lerp(.78, .5, r), roll = lerp(-.03, 0, r);
      // Then a whip to each member as his light comes on.
      for (const w of order) {
        const tw = lightAt(w), q = easeInOut(clamp((t - tw + .07) / .14));
        if (q <= 0) continue;
        const a = aimOf(w);
        at = at.map((x, j) => lerp(x, a.at[j], q));
        pos = pos.map((x, j) => lerp(x, a.pos[j], q));
        fov = lerp(fov, .62, q); roll = lerp(roll, (hash(order.indexOf(w), 7) - .5) * .08, q);
      }
      // And in on the roll, the whole band.
      const last = whips[whips.length - 1] ?? end - 1;
      const z = easeInOut(clamp((t - last - .25) / (end - last - .25)));
      if (z > 0) { at = [lerp(at[0], 0, z), lerp(at[1], 150, z), lerp(at[2], -160, z)]; pos = [lerp(pos[0], 0, z), lerp(pos[1], 118, z), lerp(pos[2], 820, z)]; fov = lerp(fov, .62, z); }
      return { pos, at, fov, roll };
    };
    shot(pd, end, (g, t, sh) => {
      const s = camAt(t);
      const c = move(t, sh, s, s, { shake: 4 * clamp((t - (end - 1.2)) / 1.2), hand: .6 });
      const up = w => clamp((t - lightAt(w)) / .06);
      const lights = { ...STAGE_LIGHTS, extra: STAGE_LIGHTS.extra.map(L => { const w = order.find(m => BAND[m].col === L.col); return { ...L, k: L.k * (w ? up(w) : 1) }; }) };
      const flash = Math.max(...order.map(w => clamp(1 - (t - lightAt(w)) / .18) * (t >= lightAt(w) ? 1 : 0)));
      boxFrame(g, t, c, {
        see: k === 3 ? .6 : 0,
        lights,
        band: ['cron', 'null', 'regex', 'clawd'].map(w => ({ name: w, col: up(w) > .5 ? BAND[w].col : null, rimDir: [w === 'regex' ? .6 : w === 'null' ? -.6 : 0, -1], rim: 1 + up(w) * 2.2,
          draw: (L, cc) => w === 'cron' ? drummer(L, cc, { pos: LINEUP.cron.pos, riser: 44, t, col: BAND.cron.col }) : w === 'clawd' ? singer(L, cc, { pos: LINEUP.clawd.pos, t, eyes: 'narrow' }) : player(L, cc, { who: w, ...LINEUP[w], t, glow: up(w) }) })),
        beams: STAGE_BEAMS.filter((b, i) => up(['clawd', 'regex', 'null', 'cron'][i]) > .5),
        smoke: STAGE_SMOKE, refl: { floor: true, wall: 3 }, post: { shafts: 0, glow: [.35 + flash * .3, .45 + flash * .3], focus: flash * .8 }, seeView: k === 3 ? L => onlookers(L, c, t) : null,
      });
    });
    echoes.forEach((ew, i) => {
      const e = ew[0];
      overlay(e.v - .15, end, (g, t) => {
        const p = clamp((t - (e.v - .15)) / .22);
        const s = i ? .72 : 1;
        // The first echo high, the second low, both clear of the faces the camera whips to.
        const y = i ? 1390 : 330;
        etchFlat(g, 'SOMETHING', W / 2, y, 170 * s, BAND.clawd.col, p, { align: 'center', alpha: .95 - i * .15, w0: e, w: 3.2 * s });
        const e2 = ew[1];
        const p2 = clamp((t - (e2.v - .15)) / .22);
        etchFlat(g, 'ELSE', W / 2, y + 170 * s * .95, 170 * s, BAND.clawd.col, p2, { align: 'center', alpha: .95 - i * .15, w0: e2, w: 3.2 * s });
      });
    });
  }
}
