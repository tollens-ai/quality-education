// The choruses. The whole band, all four lasers. HOW DO I KNOW cut huge and blown out at the
// camera; PERFECT inside a perfect circle; CHECKS and TESTS as ticks cut all over the glass,
// passing, passing, and then the bugs you'd find come in through them: moths. GUIDE draws its
// guide lines first. I WANT YOU TO LOVE IT to his face, the reflections answer. PROVE! on the
// crash. The third time, the people are outside, and PROVE! breaks the box.
import { W, H, clamp, lerp, hash, easeOut, easeInOut, words, hit, env, eventsIn, beatPos } from '../kit.js';
import { cam, project, ap, screenToPlane } from '../space.js';
import { posterLine, etchFlat, flat, shardCut, drawEtch, carry } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY, LINEUP, STAGE_LIGHTS, STAGE_SMOKE, STAGE_BEAMS, bandLine } from '../box.js';
import { WALL } from '../room.js';
import { singer, player } from '../playing.js';
import { sky, onlookers } from '../world.js';
import { swarm, tickPoly } from '../air.js';
import { BAND } from '../palette.js';

const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
const FOUR = [BAND.clawd.col, BAND.regex.col, BAND.cron.col, BAND.null.col];
const ENDS = { 1: 53.9, 2: 99.6, 3: 141.9 };

export function register(S) {
  for (const k of [1, 2, 3]) chorus(k);
}

function chorus(k) {
  const sec = 'Chorus ' + k;
  const L1 = words(sec, 'How do I'), L2 = words(sec, 'All of my'), L3 = words(sec, 'Give me a'), L4 = words(sec, 'I want you'), L5 = words(sec, 'love it'), L6 = words(sec, 'so give me');
  const outOf = (c, t = 0) => L => k === 3 ? onlookers(L, c, t, { joy: true }) : sky(L, c, 0, { sun: [0, 380, -6000] });
  const flip = k === 2 ? -1 : 1;
  const tA = L1[0].v - .45, tB = L1[4].v - .12, tC = L2[0].v - .2, tD = L3[0].v - .2, tE = L4[3].v - .12, tF = L6[0].v - .1, end = ENDS[k];
  // The backing (ooh-ooh)s of chorus 2, etched by the reflections.
  if (k === 2) for (let i = 0; i < 2; i++) {
    let e; try { e = words(sec, 'ooh-ooh', i)[0]; } catch { continue; }
    overlay(e.v - .15, e.v + .9, (g, t) => {
      etchFlat(g, 'OOH-OOH', 910, 1480, 120, [BAND.regex.col, BAND.null.col][i], clamp((t - (e.v - .15)) / .2), { align: 'right', alpha: clamp((e.v + .9 - t) / .3), w0: e });
    });
  }
  // --- A: HOW DO I KNOW, huge, over the whole band, blown out at the camera.
  {
    const set = { pos: [flip * 40, 120, 1120], at: [0, 200, -160], fov: .56, roll: flip * -.02 }, set2 = { pos: [flip * 10, 110, 980], at: [0, 195, -160], fov: .56 };
    const cR = C(set2);
    const cuts = posterLine(L1, WALL, cR, [70, 150, 1010, 1040], [{ w: [0] }, { w: [1, 2] }, { w: [3] }], { gap: .12 });
    cuts.forEach((cw, i) => { cw.o.laser = FOUR[i % 4]; cw.o.dur = .16; });
    shot(tA, tB, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 8, ease: easeOut });
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts, cutOpt: { outside: outOf(c, t), light: .8, fall: 'blow', fallDur: .7 },
        band: bandLine(t, { jump: 1 }), smoke: STAGE_SMOKE, beams: STAGE_BEAMS,
        refl: { floor: true, wall: 2 }, rays: 1, set: true, post: { shafts: .55, glow: [.32, .45], split: hit('crash', t, .12) * 7, focus: hit('crash', t, .18) },
      });
    });
  }
  // --- B: HOW CAN YOU SHOW, WHAT PERFECT MEANS TO YOU? Low on CLAWD; a perfect circle round PERFECT.
  {
    const set = { pos: [flip * 60, 30, 520], at: [0, 170, -160], fov: .86, roll: flip * .04 }, set2 = { pos: [flip * 30, 36, 460], at: [0, 175, -160], fov: .84, roll: flip * .02 };
    const cR = C(set2);
    const cuts = carry(posterLine(L1, WALL, cR, [80, 140, 1000, 950], [{ w: [0, 1, 2, 3], k: .62 }, { w: [4, 5] }, { w: [6, 7], k: .9 }, { w: [8, 9], k: 1 }, { w: [10, 11, 12], k: .8 }], { gap: .14 }), tB);
    // The circle: centred on PERFECT, a hair bigger than it, drawn by the laser in one sweep.
    const pf = cuts.find(cw => cw.w.wi === 9);
    const cu = pf.u + pf.wid / 2, cv = pf.v + pf.em * .42, rad = pf.wid * .55;
    const ring = Array.from({ length: 64 }, (_, i) => { const a = Math.PI / 2 - i / 64 * Math.PI * 2; return [cu + Math.cos(a) * rad, cv + Math.sin(a) * rad * .92]; });
    const circle = shardCut(ring, pf.w.v + .02, WALL, { dur: .3, stuck: true, laser: BAND.clawd.col, fill: .1 });
    shot(tB, tC, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 5 });
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts: [...cuts, circle], cutOpt: { outside: outOf(c, t), laser: BAND.clawd.col, light: .75, fall: 'blow', fallDur: .6 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [0, -1], draw: (L, cc) => singer(L, cc, { pos: [0, 0, 250], yaw: flip * .15, t, eyes: 'narrow' }) }],
        beams: [STAGE_BEAMS[0]], smoke: [[0, 200, 220, 60, BAND.clawd.col, 12, .6]],
        refl: { floor: true, wall: 2 }, rays: .9, post: { shafts: .5, glow: [.3, .42] },
      });
    });
  }
  // --- C: ALL OF MY CHECKS, ALL OF MY TESTS: ticks cut all over the glass on every kick.
  // DON'T FIND THE BUGS YOU DO: and in through them come the moths.
  {
    const set = { pos: [flip * -70, 150, 820], at: [0, 220, -160], fov: .72, roll: flip * -.03 }, set2 = { pos: [flip * 60, 150, 800], at: [0, 220, -160], fov: .72, roll: flip * .03 };
    const cR = C({ pos: [0, 150, 810], at: [0, 220, -160], fov: .72 });
    const cuts = posterLine(L2, WALL, cR, [60, 150, 1020, 1060], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6, 7] }, { w: [8, 9, 10], k: .82 }, { w: [11, 12, 13] }], { gap: .16 });
    const occupied = cuts.map(cw => [cw.u, cw.v, cw.u + cw.wid, cw.v + cw.em * .8]);
    const kicks = eventsIn('kick', L2[0].v, L2[8].v);
    const ticks = [];
    // The ticks go wherever the words aren't: round them and below them, never on them.
    const tl = screenToPlane(cR, WALL, 40, 120), br = screenToPlane(cR, WALL, 1040, 1500);
    kicks.forEach((kt, i) => {
      for (let j = 0; j < 3; j++) {
        const sz = 34 + hash(i, j, 3) * 26;
        let u, v, tries = 0, hitWord = true;
        while (tries < 60 && hitWord) {
          u = lerp(tl[0], br[0], hash(i, j, k, tries)); v = lerp(br[1], tl[1], hash(i, j, k + 9, tries)); tries++;
          hitWord = occupied.some(([a, b, c2, d]) => u > a - sz * .7 && u < c2 + sz * .7 && v > b - sz * .7 && v < d + sz * .7);
        }
        if (!hitWord) ticks.push(shardCut(tickPoly(u, v, sz), kt, WALL, { dur: .05, laser: FOUR[(i + j) % 4] }));
      }
    });
    const bugsAt = L2[11].v;
    shot(tC, tD, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 5 });
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts: [...ticks, ...cuts], cutOpt: { outside: outOf(c, t), laser: BAND.regex.col, light: .75, fallDur: .45 },
        band: bandLine(t, { jump: .6 }).filter(b => b.name !== 'cron').map(b => ({ ...b, draw: (L, cc) => b.draw(L, cc) })), smoke: STAGE_SMOKE, beams: STAGE_BEAMS.slice(0, 3),
        refl: { floor: true, wall: 2 }, rays: .8, post: { shafts: .45, glow: [.3, .42] },
        after: (g2, E) => {
          // The bugs, from the ticks nearest the words.
          const from = ticks.slice(0, 18).map(tk => { const p = project(c, ap(WALL, [tk.u, tk.v, 0])); return [p.x, p.y]; });
          swarm(g2, from, t, bugsAt - .15, 46, k, E, true);
        },
      });
    });
  }
  // --- D: GIVE ME A GUIDE, SOMETHING TO TRY, TO MAKE YOUR DREAMS COME TRUE! Guide lines first.
  {
    const set = { pos: [0, 230, 900], at: [0, 240, -160], fov: .7 }, set2 = { pos: [0, 200, 760], at: [0, 230, -160], fov: .74, roll: flip * .03 };
    const cR = C(set);
    const cuts = posterLine([...L3, ...L4], WALL, cR, [70, 170, 1010, 1180], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6] }, { w: [7, 8, 9], k: .8 }, { w: [10, 11, 12] }, { w: [13, 14, 15], k: .6 }], { gap: .2 });
    // Guide lines: a line along each row's baseline and cap height, drawn just before the row.
    const rows = [];
    for (const cw of cuts) { const r = rows.find(x => Math.abs(x.v - cw.v) < 1); if (r) { r.t = Math.min(r.t, cw.w.v); r.u0 = Math.min(r.u0, cw.u); r.u1 = Math.max(r.u1, cw.u + cw.wid); } else rows.push({ v: cw.v, em: cw.em, t: cw.w.v, u0: cw.u, u1: cw.u + cw.wid }); }
    shot(tD, tE, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 6, ease: easeOut });
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts, cutOpt: { outside: outOf(c, t), laser: BAND.cron.col, light: .8, fall: 'blow', fallDur: .6 },
        band: bandLine(t, { jump: 1.2 }), smoke: STAGE_SMOKE, beams: STAGE_BEAMS,
        refl: { floor: true, wall: 2 }, rays: .9, set: true, post: { shafts: .5, glow: [.32, .45], split: hit('crash', t, .1) * 5, focus: hit('crash', t, .18) },
        after: (g2, E) => {
          for (const r of rows) {
            const p = clamp((t - (r.t - .35)) / .18), fade = clamp(1 - (t - r.t - .5) / .6);
            if (p <= 0 || fade <= 0) continue;
            for (const vv of [r.v, r.v + r.em * .8]) {
              const a = project(c, ap(WALL, [r.u0 - 400, vv, .5])), b = project(c, ap(WALL, [lerp(r.u0 - 400, r.u1 + 400, p), vv, .5]));
              for (const [ctx, w, col] of [[g2, 1.4, `rgba(189,255,63,${.8 * fade})`], [E, 4, `rgba(189,255,63,${.5 * fade})`]]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
            }
          }
        },
      });
    });
  }
  // --- E: I WANT YOU TO LOVE IT, to his face. The reflections sing back (LOVE IT).
  {
    const set = { pos: [flip * 20, 58, 400], at: [0, 110, -160], fov: .74 }, set2 = { pos: [flip * 12, 55, 350], at: [0, 106, -160], fov: .72 };
    const cR = C(set);
    const cuts = carry(posterLine(L4, WALL, cR, [70, 170, 1010, 820], [{ w: [0, 1, 2, 3] }, { w: [4, 5] }], { gap: .16 }), tE);
    shot(tE, tF, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 3 });
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts, cutOpt: { outside: outOf(c, t), laser: BAND.clawd.col, light: .8 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [0, -1], draw: (L, cc) => singer(L, cc, { pos: [0, 0, 170], yaw: flip * .06, t, eyes: 'narrow' }) }],
        refl: { floor: true, wall: 4, wallA: .5 }, rays: .8, post: { shafts: .45 },
      });
    });
    const e0 = L5[0], e1 = L5[1];
    const eEnd = Math.max(tF + .3, e1.v + .7);
    overlay(e0.v - .15, eEnd, (g, t) => {
      const a = clamp((eEnd - t) / .25);
      etchFlat(g, 'LOVE', 910, 1330, 140, BAND.clawd.col, clamp((t - (e0.v - .15)) / .18), { align: 'right', alpha: a, w0: e0 });
      etchFlat(g, 'IT', 910, 1470, 140, BAND.clawd.col, clamp((t - (e1.v - .15)) / .15), { align: 'right', alpha: a, w0: e1 });
    });
  }
  // --- F: SO GIVE ME SOMETHING I CAN PROVE! PROVE! on the crash, blown out; the third time, the
  // whole box goes with it.
  {
    const set = { pos: [0, 120, 1100], at: [0, 200, -160], fov: .56 }, set2 = { pos: [0, 100, 820], at: [0, 190, -160], fov: .6 };
    const cR = C(set);
    const cuts = posterLine(L6, WALL, cR, [70, 150, 1010, 1080], [{ w: [0, 1, 2], k: .7 }, { w: [3, 4, 5], k: .8 }, { w: [6] }], { gap: .14 });
    cuts.forEach((cw, i) => { cw.o.laser = FOUR[i % 4]; if (cw.w.wi === 6) cw.o.dur = .25; });
    const prove = L6[6].v;
    // The third time, PROVE! breaks the whole box: the wall goes in a hundred pieces.
    const shatter = [];
    if (k === 3) {
      const n = 11, m = 9;
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
        const U = (a, b) => [lerp(-420, 420, (a + (b % 2 ? .5 : 0) * 0 + (hash(a, b, 1) - .5) * .5 * (a > 0 && a < n ? 1 : 0)) / n), lerp(-40, 760, (b + (hash(a, b, 2) - .5) * .5 * (b > 0 && b < m ? 1 : 0)) / m)];
        const p00 = U(i, j), p10 = U(i + 1, j), p01 = U(i, j + 1), p11 = U(i + 1, j + 1);
        const dl = hash(i, j, 3) * .22 + Math.hypot(i - n / 2, j - m / 2) * .012;
        shatter.push(shardCut([p00, p10, p11], prove + .02 + dl, WALL, { dur: .03, laser: '#ffffff' }));
        shatter.push(shardCut([p00, p11, p01], prove + .04 + dl, WALL, { dur: .03, laser: '#ffffff' }));
      }
    }
    shot(tF, end, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 9, ease: easeInOut });
      const boom = clamp(1 - (t - prove - .12) / (k === 3 ? .22 : .35)) * (t >= prove + .12 ? 1 : 0) * (k === 3 ? 1.2 : .7);
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts: [...cuts, ...shatter], cutOpt: { outside: outOf(c, t), light: .85, fall: 'blow', fallDur: .8 },
        band: bandLine(t, { jump: 1.3 }), smoke: STAGE_SMOKE, beams: STAGE_BEAMS,
        // The third time the whole wall opens, so the light needs no help: a short flash, and the
        // pieces flying out stay visible through it.
        refl: { floor: true, wall: 2 }, rays: 1, set: true, post: { shafts: .55 + boom * (k === 3 ? .15 : .4), glow: [.32 + boom * (k === 3 ? .08 : .3), .45 + boom * (k === 3 ? .1 : .4)], split: boom * 9, glitch: boom * .5, focus: Math.max(boom, hit('crash', t, .18)) },
        after: (g2) => { if (boom > 0) { g2.fillStyle = `rgba(255,250,240,${Math.min(k === 3 ? .3 : .8, boom * .35)})`; g2.fillRect(0, 0, W, H); } },
      });
    });
  }
}
