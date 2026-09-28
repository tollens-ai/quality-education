// The choruses: the hook is the band's, the rest is the argument, and each time it's further on.
// HOW DO I KNOW, huge over the band (the second time with the four checks from verse 2 lit round
// them). WHAT PERFECT MEANS TO YOU: PERFECT is cut in a circle that turns porthole, a quarter at a
// time, onto what perfect is for each of them. ALL OF MY CHECKS, ALL OF MY TESTS: the report,
// typed line by line, every line PASS; DON'T FIND THE BUGS YOU DO: and there they are at the glass,
// holding up what the tests missed (the second time only Jess, with her note). GIVE ME A GUIDE:
// they hold up cards, blank the first time, half written the second, the third saying what they
// know. I WANT YOU TO LOVE IT, to his face. PROVE! on the crash; the third time it breaks the box.
import { W, H, clamp, lerp, hash, easeOut, easeInOut, words, hit, env, eventsIn, beatPos } from '../kit.js';
import { cam, project, ap, screenToPlane } from '../space.js';
import { posterLine, etchFlat, flat, shardCut, carry } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY, LINEUP, STAGE_LIGHTS, STAGE_SMOKE, STAGE_BEAMS, bandLine, wallRect } from '../box.js';
import { WALL } from '../room.js';
import { singer } from '../playing.js';
import { sky, onlookers } from '../world.js';
import { swarm, tickPoly } from '../air.js';
import { HOLD, withText, windowPanes, scenePane, row, grid } from '../windows.js';
import { BAND } from '../palette.js';

const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
const FOUR = [BAND.clawd.col, BAND.regex.col, BAND.cron.col, BAND.null.col];
const ENDS = { 1: 53.9, 2: 99.6, 3: 141.9 };
const BRIEFS = ['bakery', 'clinic', 'school', 'wedding'];
// What perfect is, for each of them; and what the checks found each time.
const PERFECT = { 1: ['perfect', 'booked', 'locked', 'perfect'], 2: ['perfect', 'booked', 'locked', 'perfect'], 3: ['love', 'love', 'love', 'love'] };
const ORACLES = [['bakery', 'load'], ['clinic', 'booked'], ['school', 'locked'], ['wedding', 'note']];
const REPORT = {
  1: [['checkout page loads', 'PASS'], ['booking form submits', 'PASS'], ['messages send', 'PASS'], ['seating plan saves', 'PASS']],
  2: [['load: 2x the 8am rush', 'PASS'], ['a bot as Gran books', 'PASS'], ['nothing shows to others', 'PASS'], ['Dave + Sue apart?', '???']],
  3: [['Rosa: 50 at 8am', 'PASS'], ['Gran: big buttons', 'PASS'], ['Sam: only my messages', 'PASS'], ['Jess: Dave + Sue apart', 'PASS']],
};

// The report, in the machine's type: each line typed on at its moment, then its verdict, a tick
// and PASS in green (or ??? in yellow for what no check could know).
function report(g, E, x, y, lines, times, t, o = {}) {
  const px = o.px ?? 44, lh = px * 1.55, x1 = x + (o.w ?? 940);
  lines.forEach(([text, verdict], i) => {
    const at = times[i], p = clamp((t - at) / .2);
    if (p <= 0) return;
    const yy = y + i * lh, col = verdict === 'PASS' ? '#8fff5a' : '#ffd23f';
    flat(g, '>', x, yy, px, 'mono', { fill: '#7f8796' });
    flat(g, text.slice(0, Math.ceil(text.length * p)), x + px * .9, yy, px, 'mono', { fill: '#eef0f4' });
    const q = clamp((t - at - .2) / .1);
    if (q <= 0) return;
    for (const [ctx, a] of [[g, 1], [E, .8]]) {
      if (!ctx) continue;
      ctx.save(); ctx.globalAlpha *= a * q;
      flat(ctx, verdict, x1, yy, px, 'mono', { fill: col, align: 'right' });
      if (verdict === 'PASS') {
        const tx = x1 - px * 3.1, ty = yy - px * .34, s = px * .34;
        ctx.strokeStyle = col; ctx.lineWidth = px * .13; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(tx - s, ty); ctx.lineTo(tx - s * .3, ty + s * .7); ctx.lineTo(tx + s, ty - s * .8); ctx.stroke();
      }
      ctx.restore();
    }
  });
}

export function register(S) {
  for (const k of [1, 2, 3]) chorus(k);
}

function chorus(k) {
  const sec = 'Chorus ' + k;
  const L1 = words(sec, 'How do I'), L2 = words(sec, 'All of my'), L3 = words(sec, 'Give me a'), L4 = words(sec, 'I want you'), L5 = words(sec, 'love it'), L6 = words(sec, 'so give me');
  const outOf = (c, t = 0) => L => k === 3 ? onlookers(L, c, t, { joy: true }) : sky(L, c, 0, { sun: [0, 380, -6000] });
  const flip = k === 2 ? -1 : 1;
  const tA = L1[0].v - .45, tB = L1[4].v - .12, tC = L2[0].v - .2, tD = L3[0].v - .2, tE = L4[3].v - .12, tF = L6[0].v - .1, end = ENDS[k];
  const crashes = (a, b) => eventsIn('crash', a, b);
  // The backing (ooh-ooh)s of chorus 2, etched by the reflections.
  if (k === 2) for (let i = 0; i < 2; i++) {
    let e; try { e = words(sec, 'ooh-ooh', i)[0]; } catch { continue; }
    overlay(e.v - .15, e.v + .9, (g, t) => {
      etchFlat(g, 'OOH-OOH', 910, 1480, 120, [BAND.regex.col, BAND.null.col][i], clamp((t - (e.v - .15)) / .2), { align: 'right', alpha: clamp((e.v + .9 - t) / .3), w0: e });
    });
  }
  // --- A: HOW DO I KNOW, huge, over the whole band, blown out at the camera. They jump on the
  // crash, not on every beat. The second time, the four checks from verse 2 are lit round them.
  {
    // The second time from low on the side, tilted: the same hook, another way in.
    const set = k === 2 ? { pos: [240, 46, 860], at: [-10, 190, -160], fov: .6, roll: .1 } : { pos: [flip * 40, 120, 1120], at: [0, 200, -160], fov: .56, roll: flip * -.02 };
    const set2 = k === 2 ? { pos: [190, 52, 780], at: [0, 188, -160], fov: .6, roll: .07 } : { pos: [flip * 10, 110, 980], at: [0, 195, -160], fov: .56 };
    const cR = C(set2);
    const cuts = posterLine(L1, WALL, cR, [70, 150, 1010, 1040], [{ w: [0] }, { w: [1, 2] }, { w: [3] }], { gap: .12 });
    cuts.forEach((cw, i) => { cw.o.laser = FOUR[i % 4]; cw.o.dur = .16; });
    const hops = crashes(tA, tB + .2);
    const boxes = [[24, 1090, 262, 1400], [24, 1424, 262, 1734], [818, 1090, 1056, 1400], [818, 1424, 1056, 1734]];
    shot(tA, tB, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 8, ease: easeOut });
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts, cutOpt: { outside: outOf(c, t), light: .8, fall: 'blow', fallDur: .7 },
        panes: k === 2 ? ORACLES.map(([b, s], i) => scenePane(c, cR, t, boxes[i], b, s, {}, { t0: tA + .05 + i * .08, seed: 40 + i, k: 1.1 })) : [],
        band: bandLine(t, { hops }), smoke: STAGE_SMOKE, beams: STAGE_BEAMS,
        refl: { floor: true, wall: 2 }, rays: 1, set: true, post: { shafts: .55, glow: [.32, .45], split: hit('crash', t, .12) * 7, focus: hit('crash', t, .18) },
      });
    });
  }
  // --- B: HOW CAN YOU SHOW, WHAT PERFECT MEANS TO YOU? Low on CLAWD. PERFECT is cut in a circle,
  // and the circle turns porthole, a quarter at a time on the words after it, onto what perfect is
  // for each of them. The second time they're all four already lit, in the corners.
  {
    const set = { pos: [flip * 60, 30, 520], at: [0, 170, -160], fov: .86, roll: flip * .04 }, set2 = { pos: [flip * 30, 36, 460], at: [0, 175, -160], fov: .84, roll: flip * .02 };
    const cR = C(set2);
    const cuts = carry(posterLine(L1, WALL, cR, [80, 140, 1000, 950], [{ w: [0, 1, 2, 3], k: .62 }, { w: [4, 5] }, { w: [6, 7], k: .9 }, { w: [8, 9], k: 1 }, { w: [10, 11, 12], k: .8 }], { gap: .14 }), tB);
    // The circle: centred on PERFECT, a hair bigger than it, drawn by the laser in one sweep.
    const pf = cuts.find(cw => cw.w.wi === 9);
    const cu = pf.u + pf.wid / 2, cv = pf.v + pf.em * .42, rad = pf.wid * .55;
    const ring = Array.from({ length: 64 }, (_, i) => { const a = Math.PI / 2 - i / 64 * Math.PI * 2; return [cu + Math.cos(a) * rad, cv + Math.sin(a) * rad * .92]; });
    const circle = shardCut(ring, pf.w.v + .02, WALL, { dur: .3, stuck: true, laser: BAND.clawd.col, fill: .1 });
    // The porthole: a second circle, low and to the right of him, cut as PERFECT lands, lit a
    // quarter at a time.
    const pc = screenToPlane(cR, WALL, flip > 0 ? 690 : 390, 1250), pe = screenToPlane(cR, WALL, (flip > 0 ? 690 : 390) + 330, 1250);
    const r2 = Math.abs(pe[0] - pc[0]), porthole = [pc[0] - r2, pc[1] - r2, pc[0] + r2, pc[1] + r2];
    const pRing = Array.from({ length: 72 }, (_, i) => { const a = Math.PI / 2 - i / 72 * Math.PI * 2; return [pc[0] + Math.cos(a) * r2 * 1.02, pc[1] + Math.sin(a) * r2 * 1.02]; });
    const pCircle = shardCut(pRing, pf.w.v + .3, WALL, { dur: .32, stuck: true, laser: BAND.clawd.col, fill: .02 });
    // Each quarter's box on screen, for aiming its view.
    const P0 = project(cR, ap(WALL, [pc[0], pc[1], 0])), R = project(cR, ap(WALL, [pc[0] + r2, pc[1], 0])).x - P0.x;
    const qBox = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => [P0.x + (sx < 0 ? -R : 0), P0.y + (sy < 0 ? -R : 0), P0.x + (sx < 0 ? 0 : R), P0.y + (sy < 0 ? 0 : R)]);
    // Quarters: top left, top right, bottom right, bottom left; lit on MEANS, TO, YOU and the beat.
    const QS = ['q1', 'q0', 'q3', 'q2'], qAt = [pf.w.v + .38, L1[10].v, L1[11].v, L1[12].v];
    const corners = [[40, 1030, 330, 1330], [750, 1030, 1040, 1330], [40, 1360, 330, 1660], [750, 1360, 1040, 1660]];
    shot(tB, tC, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 5 });
      const panes = k === 2
        ? BRIEFS.map((b, i) => scenePane(c, cR, t, corners[i], b, PERFECT[k][i], {}, { t0: tB + .1 + i * .1, seed: 50 + i }))
        : BRIEFS.map((b, i) => scenePane(c, cR, t, qBox[i], b, PERFECT[k][i], {}, { rect: porthole, shape: QS[i], t0: qAt[i], seed: 60 + i, floor: false }));
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts: [...cuts, circle, ...(k === 2 ? [] : [pCircle])], cutOpt: { outside: outOf(c, t), laser: BAND.clawd.col, light: .75, fall: 'blow', fallDur: .6 },
        panes,
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [0, -1], draw: (L, cc) => singer(L, cc, { pos: [flip * -48, 0, 250], yaw: flip * .5, t, eyes: 'narrow' }) }],
        beams: [STAGE_BEAMS[0]], smoke: [[0, 200, 220, 60, BAND.clawd.col, 12, .6]],
        refl: { floor: true, wall: 2 }, rays: .9, post: { shafts: .5, glow: [.3, .42] },
      });
    });
  }
  // --- C: ALL OF MY CHECKS, ALL OF MY TESTS: the report, a line a beat, every one PASS. DON'T
  // FIND THE BUGS YOU DO: the people at the glass with what the tests missed, and the moths.
  {
    // Level and close enough that the wall runs down to the foot of the frame, for the windows.
    const set = { pos: [flip * -36, 190, 470], at: [flip * -10, 190, -160], fov: .72, roll: flip * -.015 }, set2 = { pos: [flip * 30, 188, 444], at: [flip * 8, 188, -160], fov: .72, roll: flip * .015 };
    const cR = C({ pos: [0, 189, 457], at: [0, 189, -160], fov: .72 });
    const cuts = posterLine(L2, WALL, cR, [60, 150, 1020, 700], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6, 7] }, { w: [8, 9, 10], k: .82 }, { w: [11, 12, 13] }], { gap: .16 });
    const kicks = eventsIn('kick', L2[0].v, L2[8].v);
    const times = [0, 1, 2, 3].map(i => kicks[Math.min(kicks.length - 1, Math.round(i * (kicks.length - 1) / 3))] ?? L2[0].v + i * .4);
    const bugsAt = L2[11].v;
    const found = k === 2 ? [HOLD.fixed[3]] : k === 3 ? withText(HOLD.cards, 1) : HOLD.broken;
    // The third time their cards are what the checks are made of: up from the start, whole.
    const wbox = k === 2 ? [[330, 1090, 750, 1740]] : k === 3 ? grid(60, 1020, 1090, 1750, 20) : row(4, 36, 1044, 1110, 1740, 16);
    const wOn = k === 3 ? i => L2[0].v - .1 + i * .1 : i => bugsAt - .12 + i * .07;
    // Meanwhile a tick is cut in the glass below on every kick: passing, passing.
    const allKicks = eventsIn('kick', L2[0].v, bugsAt);
    const ticks = k === 3 ? [] : allKicks.flatMap((kt, i) => [0, 1].map(j => {
      const sx = 90 + hash(i, j, k, 1) * 900, sy = 1130 + hash(i, j, k, 2) * 560, sz = 26 + hash(i, j, k, 3) * 22;
      const [u, v] = screenToPlane(cR, WALL, sx, sy);
      return shardCut(tickPoly(u, v, sz), kt, WALL, { dur: .05, laser: FOUR[(i + j) % 4], out: bugsAt - .16 + hash(i, j) * .1 });
    }));
    shot(tC, tD, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 4 });
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts: [...ticks, ...cuts], cutOpt: { outside: outOf(c, t), laser: BAND.regex.col, light: .75, fallDur: .45 },
        panes: windowPanes(c, cR, t, wbox, found, { on: wOn, seed: 70 + k * 4, k: k === 2 ? .42 : k === 3 ? .4 : .5, dy: .1 }),
        band: [{ name: 'clawd', col: BAND.clawd.col, reflOnly: true, draw: (L, cc) => singer(L, cc, { pos: [0, 0, 900], yaw: Math.PI, t, eyes: 'narrow' }) }],
        refl: { floor: true, hero: true }, rays: .6, post: { shafts: .35, glow: [.3, .42] },
        after: (g2, E) => {
          report(g2, E, 70, 800, REPORT[k], times, t);
          if (k < 3) {
            const from = wbox.map(b => [(b[0] + b[2]) / 2, b[1] + 10]);
            swarm(g2, from, t, bugsAt + .05, k === 2 ? 5 : 8, k, E, 'up');
          }
        },
      });
    });
  }
  // --- D: GIVE ME A GUIDE, SOMETHING TO TRY, TO MAKE YOUR DREAMS COME TRUE! Guide lines ruled
  // under each row before it's cut; below, the four hold up cards: blank, then half written, then
  // saying what they know.
  {
    const set = { pos: [0, 200, 480], at: [0, 200, -160], fov: .73 }, set2 = { pos: [0, 196, 428], at: [0, 198, -160], fov: .74, roll: flip * .02 };
    const cR = C(set);
    const cuts = posterLine([...L3, ...L4], WALL, cR, [70, 160, 1010, 900], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6] }, { w: [7, 8, 9], k: .8 }, { w: [10, 11, 12] }, { w: [13, 14, 15], k: .6 }], { gap: .2 });
    const rows = [];
    for (const cw of cuts) { const r = rows.find(x => Math.abs(x.v - cw.v) < 1); if (r) { r.t = Math.min(r.t, cw.w.v); r.u0 = Math.min(r.u0, cw.u); r.u1 = Math.max(r.u1, cw.u + cw.wid); } else rows.push({ v: cw.v, em: cw.em, t: cw.w.v, u0: cw.u, u1: cw.u + cw.wid }); }
    // The first time all they can put is a question mark.
    const cards = k === 1 ? HOLD.cards.map(([b, s2, f, o]) => [b, s2, f, { ...o, text: ['?'] }]) : withText(HOLD.cards, 0);
    const on = i => L3[3].v - .1 + i * .08;
    const textP = k === 1 ? (tt, i) => clamp((tt - on(i) - .5) / .3) : k === 2 ? (tt, i) => clamp((tt - on(i) - .3) / 1.6) * .5 : (tt, i) => clamp((tt - on(i) - .2) / 1.1);
    shot(tD, tE, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 4, ease: easeOut });
      boxFrame(g, t, c, {
        see: k === 3 ? .5 : 0,
        lights: STAGE_LIGHTS, cuts, cutOpt: { outside: outOf(c, t), laser: BAND.cron.col, light: .8, fall: 'blow', fallDur: .6 },
        panes: windowPanes(c, cR, t, grid(60, 1020, 930, 1770), cards, { on, textP, seed: 80 + k * 4, k: .42 }),
        band: [{ name: 'clawd', col: BAND.clawd.col, reflOnly: true, draw: (L, cc) => singer(L, cc, { pos: [0, 0, 1000], yaw: Math.PI, t, eyes: 'narrow' }) }],
        refl: { floor: true, hero: true }, rays: .7, post: { shafts: .45, glow: [.32, .45], split: hit('crash', t, .1) * 4, focus: hit('crash', t, .18) * .7 },
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
  // --- E: I WANT YOU TO LOVE IT, to his face. The reflections sing back (LOVE IT); the third time,
  // the four do, cheering at the glass behind him.
  {
    // The second time from low on his side; the third, further back, so the four are the picture.
    const set = k === 2 ? { pos: [-120, 36, 430], at: [26, 96, 40], fov: .8, roll: .04 } : { pos: [flip * 20, 58, 400], at: [0, 110, -160], fov: .74 };
    const set2 = k === 2 ? { pos: [-100, 38, 392], at: [22, 94, 40], fov: .78, roll: .02 } : { pos: [flip * 12, 55, 350], at: [0, 106, -160], fov: .72 };
    const cR = C(set);
    const cuts = carry(posterLine(L4, WALL, cR, [70, 170, 1010, 820], [{ w: [0, 1, 2, 3] }, { w: [4, 5] }], { gap: .16 }), tE);
    const cheer = row(4, 30, 1050, 880, 1200, 14), singAt = k === 3 ? 30 : 170;
    shot(tE, tF, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 3 });
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts, cutOpt: { outside: outOf(c, t), laser: BAND.clawd.col, light: .8 },
        panes: k === 3 ? BRIEFS.map((b, i) => scenePane(c, cR, t, cheer[i], b, 'love', {}, { t0: L5[0].v - .15 + i * .06, seed: 90 + i, k: .9 })) : [],
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [0, -1], draw: (L, cc) => singer(L, cc, { pos: [0, 0, singAt], yaw: flip * .06, t, eyes: 'narrow' }) }],
        refl: { floor: true, wall: 4, wallA: .5 }, rays: .8, post: { shafts: .45 },
      });
    });
    const e0 = L5[0], e1 = L5[1];
    const eEnd = Math.max(tF + .3, e1.v + .7);
    overlay(e0.v - .15, eEnd, (g, t) => {
      const a = clamp((eEnd - t) / .25);
      // The third time the four answer it from their windows; the echo goes beside him, clear of them.
      const [ex, ey, epx, al] = k === 3 ? [60, 1380, 118, 'left'] : [910, 1330, 140, 'right'];
      etchFlat(g, 'LOVE', ex, ey, epx, BAND.clawd.col, clamp((t - (e0.v - .15)) / .18), { align: al, alpha: a, w0: e0 });
      etchFlat(g, 'IT', ex, ey + epx, epx, BAND.clawd.col, clamp((t - (e1.v - .15)) / .15), { align: al, alpha: a, w0: e1 });
    });
  }
  // --- F: SO GIVE ME SOMETHING I CAN PROVE! PROVE! on the crash, blown out, and they jump with it;
  // the third time, the whole box goes with it.
  {
    // The second time pushing in from the side.
    const set = k === 2 ? { pos: [-330, 110, 950], at: [10, 190, -160], fov: .58, roll: .05 } : { pos: [0, 120, 1100], at: [0, 200, -160], fov: .56 };
    const set2 = k === 2 ? { pos: [-230, 100, 790], at: [0, 188, -160], fov: .6, roll: .02 } : { pos: [0, 100, 820], at: [0, 190, -160], fov: .6 };
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
    const hops = [prove, ...crashes(prove + .5, end)];
    shot(tF, end, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 9, ease: easeInOut });
      const boom = clamp(1 - (t - prove - .12) / (k === 3 ? .22 : .35)) * (t >= prove + .12 ? 1 : 0) * (k === 3 ? 1.2 : .7);
      boxFrame(g, t, c, {
        see: k === 3 ? .7 : 0,
        lights: STAGE_LIGHTS, cuts: [...cuts, ...shatter], cutOpt: { outside: outOf(c, t), light: .85, fall: 'blow', fallDur: .8 },
        band: bandLine(t, { hops }), smoke: STAGE_SMOKE, beams: STAGE_BEAMS,
        // The third time the whole wall opens, so the light needs no help: a short flash, and the
        // pieces flying out stay visible through it.
        refl: { floor: true, wall: 2 }, rays: 1, set: true, post: { shafts: .55 + boom * (k === 3 ? .15 : .4), glow: [.32 + boom * (k === 3 ? .08 : .3), .45 + boom * (k === 3 ? .1 : .4)], split: boom * 9, glitch: boom * .5, focus: Math.max(boom, hit('crash', t, .18)) },
        after: (g2) => { if (boom > 0) { g2.fillStyle = `rgba(255,250,240,${Math.min(k === 3 ? .3 : .8, boom * .35)})`; g2.fillRect(0, 0, W, H); } },
      });
    });
  }
}
