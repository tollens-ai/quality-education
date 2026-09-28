// The bridge, tight and angry: the definition, set like one. ORACLE as the headword, the rest
// its meaning, bracketed. RUN AND RUN THEM ALL DAY LONG round a disc of mirror that turns like a
// clock while CRON keeps time. HEURISTICS, and NONE crossed through: NULL's empty set. DONE,
// stamped. After each line the whole band shouts OH YEAH, four voices, four colours.
import { W, H, clamp, lerp, hash, easeOut, easeInOut, words, hit, beatPos, eventsIn } from '../kit.js';
import { cam, project, ap, M, T, RZ } from '../space.js';
import { posterLine, etchFlat, flat, ringCut, drawCuts, CAPK, shardCut, width100, windowCut } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY, STAGE_LIGHTS, STAGE_SMOKE, STAGE_BEAMS, bandLine } from '../box.js';
import { WALL } from '../room.js';
import { player, singer, drummer } from '../playing.js';
import { sky, backdrop } from '../world.js';
import { story, aim } from '../story.js';
import { sceneFit, HOLDK, KNOW } from '../windows.js';
import { clawd } from '../clawd.js';
import { tickPoly } from '../air.js';
import { BAND } from '../palette.js';
import { INK } from '../ink.js';

const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
const D = 2200;
const FOUR = [BAND.clawd.col, BAND.regex.col, BAND.cron.col, BAND.null.col];
const out = c => L => sky(L, c, 0, { sun: [0, 380, -6000], top: '#3f86c8' });
const lights = (col, pos) => ({
  key: { dir: [-.5, .7, .8], col: KEY, k: 1.2 }, ambient: '#100f22',
  extra: [{ dir: [0, .4, -1], col: '#fff3de', k: .5 }, { pos, col, k: 1.1, range: 560 }],
});

export function register(S) {
  const B1 = words('Bridge', 'An oracle'), B2 = words('Bridge', 'Cos if'), B3 = words('Bridge', 'And even'), B4 = words('Bridge', 'So I can');
  const yeahs = [0, 1, 2, 3].map(i => words('Bridge', 'oh yeah', i));
  // Camera punches on the stabs: a little zoom on every snare.
  const punch = t => 1 - .05 * hit('snare', t, .07);
  // --- 1. AN ORACLE IS SOMETHING THAT CAN HELP ME FIGURE OUT WHAT'S WRONG! The definition, and
  // under it, as it's sung, the four windows verse 2's oracles opened, one after another: the
  // load test's queue, the booking site booked, a family's messages sealed, Jess's note.
  {
    const set = { pos: [0, 150, 800], at: [0, 205, -160], fov: .76 }, set2 = { pos: [-18, 145, 740], at: [0, 200, -160], fov: .76, roll: -.015 };
    const cR = C(set2);
    const cuts = posterLine(B1, WALL, cR, [70, 170, 1010, 790], [{ w: [0], k: .3, align: 'left' }, { w: [1] }, { w: [2, 3, 4, 5], k: .85, align: 'right' }, { w: [6, 7, 8, 9], k: .85, align: 'right' }, { w: [10, 11], k: .9, align: 'right' }], { gap: .16 });
    const head = cuts.find(cw => cw.w.wi === 1);
    const cells = [[80, 850, 520, 1135], [560, 850, 1000, 1135], [80, 1170, 520, 1455], [560, 1170, 1000, 1455]];
    const who = ['regex', 'cron', 'null', 'clawd'];
    const wins = cells.map((b, i) => windowCut(cR, WALL, b, B1[3 + i * 2].v + .05, { dur: .22, r: 22, laser: BAND[who[i]].col, glowK: .25 }));
    // Each window, the oracle at work: the load test's doubled queue, the site booked, the
    // messages locked, Jess's note.
    const OR = [['bakery', 'load', {}], ['clinic', 'booked', {}], ['school', 'locked', { times: { lock: -9 } }], ['wedding', 'note', { hold: 1.5 }]];
    const views = (t, c) => L => { out(c)(L); backdrop(L, c, cR, D, L2 => cells.forEach((b, i) => {
      const [brief, state, so] = OR[i];
      // Framed for a small window: the queue, the screen saying BOOKED, the gate, Jess and her note.
      const bw = b[2] - b[0], cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
      const fit = [{ u: .45, v: .68, x: cx, y: cy, w: bw * 2.1 }, { u: .5, v: .2, x: cx, y: cy, w: bw * 1.6 }, sceneFit(brief, b, 1.05), aim('wedding', 'jess-note', b, .26, { dy: .1 })][i];
      L2.save(); L2.beginPath(); L2.rect(b[0] - 40, b[1] - 40, b[2] - b[0] + 80, b[3] - b[1] + 80); L2.clip();
      story(L2, t, brief, state, [0, 0, W, H], { ...so, fit, clip: b, px: 22 });
      L2.restore();
    })); };
    shot(102.4, B2[0].v - .12, (g, t, sh) => {
      const c0 = move(t, sh, set, set2, { shake: 5 });
      const c = cam(c0.pos, c0.target, { fov: c0.fov * punch(t), roll: 0 });
      boxFrame(g, t, c, {
        lights: lights(BAND.clawd.col, [200, 240, 420]), cuts: [...cuts, ...wins], cutOpt: { outside: views(t, c), laser: BAND.clawd.col, light: .75, fall: 'blow', fallDur: .5, haze: .08 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [0, -1], draw: (L, cc) => singer(L, cc, { pos: [0, 0, 300], yaw: .12, t, eyes: 'narrow' }) }],
        beams: [[[200, 460, 360], [0, 0, 300], 70, BAND.clawd.col, .9]],
        refl: { floor: true, wall: 1 }, rays: .6, post: { shafts: .35, split: hit('crash', t, .08) * 5 },
        after: (g2, E) => {
          // What each window's oracle is, labelled as it opens.
          ['LOAD TEST', 'BOT AS GRAN', 'ISOLATION CHECK', 'JESS'].forEach((lab, i) => {
            const a = clamp((t - (B1[3 + i * 2].v + .12)) / .15);
            if (a <= 0) return;
            const [x0, y0] = cells[i];
            g2.save(); g2.globalAlpha *= a;
            g2.font = '800 24px Mono'; const lw = g2.measureText(lab).width;
            g2.fillStyle = 'rgba(10,11,14,.85)'; g2.fillRect(x0 + 10, y0 + 10, lw + 24, 38);
            flat(g2, lab, x0 + 22, y0 + 38, 24, 'monoB', { fill: BAND[who[i]].col });
            g2.restore();
          });
          // The definition's bracket: from under ORACLE down beside the rest.
          const k = clamp((t - (B1[2].v - .15)) / .3);
          if (k <= 0) return;
          const P = (u, v) => project(c, ap(WALL, [u, v, .5]));
          const u0 = head.u + head.em * .05, vTop = head.v - head.em * .12, vBot = cuts.find(cw => cw.w.wi === 11).v;
          const a = P(u0, vTop), b = P(u0, lerp(vTop, vBot, k)), e = P(u0 + head.em * .35, lerp(vTop, vBot, k));
          g2.save(); g2.strokeStyle = BAND.clawd.col; g2.lineWidth = 5; g2.lineCap = 'round';
          g2.beginPath(); g2.moveTo(a.x, a.y); g2.lineTo(b.x, b.y); g2.lineTo(e.x, e.y); g2.stroke(); g2.restore();
          flat(g2, 'n.', P(head.u + head.wid, head.v).x + 16, P(head.u + head.wid, head.v).y, 56, 'monoB', { fill: BAND.clawd.col, alpha: k });
        },
      });
    });
  }
  // --- 2. COS IF I KNOW YOUR RULES THEN I CAN / RUN AND RUN THEM ALL DAY LONG, round a disc.
  {
    const set = { pos: [60, 150, 760], at: [0, 200, -160], fov: .8 }, set2 = { pos: [30, 140, 700], at: [0, 195, -160], fov: .8 };
    const cR = C(set);
    const top = posterLine(B2, WALL, cR, [70, 170, 1010, 470], [{ w: [0, 1, 2, 3, 4, 5] }, { w: [6, 7, 8], k: .7 }], { gap: .15 });
    const R = 92, dc = [-30, 140];
    const ring = ringCut(B2, [9, 10, 11, 12, 13, 14, 15], R, 30, -1.4, .3);
    const dm = t => M(WALL, T(dc[0], dc[1], .2), RZ(-(t - B2[9].v) * 1.1));
    shot(B2[0].v - .12, B3[0].v - .12, (g, t, sh) => {
      const c0 = move(t, sh, set, set2, { shake: 5 });
      const c = cam(c0.pos, c0.target, { fov: c0.fov * punch(t) });
      for (const cw of ring) cw.m = dm(t);
      boxFrame(g, t, c, {
        lights: lights(BAND.cron.col, [300, 200, 380]), cuts: top, cutOpt: { outside: out(c), laser: BAND.cron.col, light: .75, fall: 'blow', fallDur: .5 },
        band: [{ name: 'cron', col: BAND.cron.col, rimDir: [-.4, -1], draw: (L, cc) => drummer(L, cc, { pos: [110, 0, 260], t, col: BAND.cron.col }) }],
        beams: [[[300, 460, 300], [110, 40, 220], 70, BAND.cron.col, .9]],
        refl: { floor: true, wall: 1 }, rays: .7, post: { shafts: .4, split: hit('crash', t, .08) * 5 },
        behind: (Bl, E) => {
          // The disc: a round of mirror in its steel ring, turning, the words cut round it.
          const ringPts = n => Array.from({ length: 72 }, (_, i) => { const a = i / 72 * Math.PI * 2; const p = project(c, ap(WALL, [dc[0] + Math.cos(a) * n, dc[1] + Math.sin(a) * n, .3])); return [p.x, p.y]; });
          const outer = ringPts(R + 58), inner = ringPts(R - 16);
          Bl.save();
          Bl.fillStyle = '#16181d'; Bl.beginPath(); outer.forEach((p, i) => i ? Bl.lineTo(p[0], p[1]) : Bl.moveTo(p[0], p[1])); Bl.closePath(); Bl.fill();
          Bl.strokeStyle = BAND.cron.col; Bl.lineWidth = 3; Bl.stroke();
          Bl.strokeStyle = 'rgba(190,255,63,.5)'; Bl.lineWidth = 2; Bl.beginPath(); inner.forEach((p, i) => i ? Bl.lineTo(p[0], p[1]) : Bl.moveTo(p[0], p[1])); Bl.closePath(); Bl.stroke();
          // Its ticks, like a clock's minutes, turning with it.
          const rot = -(t - B2[9].v) * 1.1;
          for (let i = 0; i < 60; i++) {
            const a = i / 60 * Math.PI * 2 + rot, r0 = R - 26, r1 = R - (i % 5 ? 32 : 44);
            const p0 = project(c, ap(WALL, [dc[0] + Math.cos(a) * r0, dc[1] + Math.sin(a) * r0, .3])), p1 = project(c, ap(WALL, [dc[0] + Math.cos(a) * r1, dc[1] + Math.sin(a) * r1, .3]));
            Bl.strokeStyle = 'rgba(243,239,230,.6)'; Bl.lineWidth = i % 5 ? 1.2 : 2.6; Bl.beginPath(); Bl.moveTo(p0.x, p0.y); Bl.lineTo(p1.x, p1.y); Bl.stroke();
          }
          Bl.restore();
          drawCuts(Bl, c, t, ring, { outside: out(c), laser: BAND.cron.col, light: .75, E, fallDur: .4 });
        },
      });
    });
  }
  // --- 3. AND EVEN ONLY HEURISTICS I'D BE BETTER OFF THAN HAVING NONE! A rule of thumb is a
  // torch in the dark: NULL faces the glass and shines one at it, and where the beam falls the
  // glass clears a little, and the families outside show through. NONE, crossed through.
  {
    const camA = { pos: [-150, 70, 330], at: [-10, 150, -160], fov: .82, roll: .01 }, camB = { pos: [-118, 66, 300], at: [0, 152, -160], fov: .81, roll: -.01 };
    const cR = C(camB);
    const cuts = posterLine(B3, WALL, cR, [80, 210, 1000, 800], [{ w: [0, 1, 2], k: .8, align: 'left' }, { w: [3] }, { w: [4, 5, 6, 7], k: .85, align: 'right' }, { w: [8, 9, 10] }], { gap: .18 });
    const none = cuts.find(cw => cw.w.wi === 10);
    const nullAt = [-5, 0, -30];
    // Where the beam lands on the glass (wall u, v), sweeping as he plays the light over it.
    const spot = t => [-20 + Math.sin((t - B3[0].v) * 1.3) * 55, 62 + Math.sin((t - B3[0].v) * .9 + 1) * 14];
    const fam = [[90, 880, 520, 1160], [560, 880, 990, 1160], [90, 1195, 520, 1475], [560, 1195, 990, 1475]];
    shot(B3[0].v - .12, B4[0].v - .12, (g, t, sh) => {
      const c0 = move(t, sh, camA, camB, { shake: 4 });
      const c = cam(c0.pos, c0.target, { fov: c0.fov * punch(t), roll: c0.roll });
      const [su, sv] = spot(t);
      const sp = project(c, ap(WALL, [su, sv, 0])), sr = project(c, ap(WALL, [su + 52, sv, 0]));
      const rad = Math.abs(sr.x - sp.x);
      boxFrame(g, t, c, {
        lights: { key: { dir: [.15, .55, -1], col: '#fff1d6', k: .9 }, ambient: '#0b0c18', extra: [{ dir: [-.3, .6, .8], col: '#8d93b8', k: .18 }, { pos: [-200, 120, 40], col: BAND.null.col, k: 1.1, range: 480 }] },
        cuts, cutOpt: { outside: out(c), laser: BAND.null.col, light: .75, fall: 'blow', fallDur: .5 },
        band: [{ name: 'null', col: BAND.null.col, rimDir: [.4, -1], rim: 3.6, draw: (L, cc) => {
          const r = clawd(L, cc, { who: 'null', pos: nullAt, yaw: Math.PI + .45, t, armR: { to: [24, 16, 44], z: 10 }, armL: { up: -.25 } });
          // The torch in his hand: a short black barrel, lit at the lens.
          const tip = r.tipR, aim = ap(WALL, [su, sv, 0]);
          const d = [aim[0] - tip[0], aim[1] - tip[1], aim[2] - tip[2]], dl = Math.hypot(...d);
          const back = [tip[0] - d[0] / dl * 14, tip[1] - d[1] / dl * 14, tip[2] - d[2] / dl * 14];
          const pa = project(cc, back), pb = project(cc, tip);
          L.save(); L.lineCap = 'round'; L.strokeStyle = '#0d0e11'; L.lineWidth = Math.max(3, 5.5 * pb.s); L.beginPath(); L.moveTo(pa.x, pa.y); L.lineTo(pb.x, pb.y); L.stroke();
          L.fillStyle = '#fff6dc'; L.beginPath(); L.arc(pb.x, pb.y, Math.max(2, 2.6 * pb.s), 0, Math.PI * 2); L.fill(); L.restore();
        } }],
        beams: [[[-240, 460, 60], nullAt, 60, BAND.null.col, .7]],
        refl: { floor: true, hero: true }, rays: .5, post: { shafts: .35, split: hit('crash', t, .08) * 5 },
        // What the torch finds: the four of them, each with a rule of thumb on a card.
        see: .95, seeView: L => backdrop(L, c, cR, D, L2 => fam.forEach((b, i) => {
          const [brief, fig] = [['bakery', 'rosa-card'], ['clinic', 'gran-card'], ['school', 'parent-card'], ['wedding', 'jess-card']][i];
          L2.save(); L2.beginPath(); L2.rect(b[0] - 20, b[1] - 20, b[2] - b[0] + 40, b[3] - b[1] + 40); L2.clip();
          story(L2, t, brief, 'card', [0, 0, W, H], { fit: aim(brief, fig, b, .4, { dy: fig === 'rosa-card' ? -.2 : .06 }), hold: HOLDK[fig], text: KNOW[i] });
          L2.restore();
        })),
        seeMask: L => {
          const gr = L.createRadialGradient(sp.x, sp.y, rad * .2, sp.x, sp.y, rad);
          gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.7, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
          L.fillStyle = gr; L.fillRect(0, 0, W, H);
        },
        after: (g2, E) => {
          // The beam, in the haze, from his hand to the spot; and the empty set: a slash
          // through NONE's O, in NULL's violet.
          const r0 = project(c, ap(M(T(...nullAt)), [0, 0, 0]));
          const k = clamp((t - (none.w.v + .05)) / .12);
          if (k <= 0) return;
          const P = (u, v) => project(c, ap(WALL, [u, v, .6]));
          const oc = none.u + none.wid * .38, vc = none.v + none.em * .4;
          const a = P(oc - none.em * .45, vc - none.em * .55), b = P(lerp(oc - none.em * .45, oc + none.em * .45, k), lerp(vc - none.em * .55, vc + none.em * .55, k));
          for (const [ctx, w] of [[g2, 12], [E, 26]]) { ctx.strokeStyle = BAND.null.col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        },
        behind: (Bl, E) => {
          // The torch's light on the glass: a warm pool, brightest at its heart.
          const gr = E.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, rad * 1.1);
          gr.addColorStop(0, 'rgba(255,244,214,.55)'); gr.addColorStop(1, 'rgba(255,244,214,0)');
          E.fillStyle = gr; E.fillRect(sp.x - rad * 1.2, sp.y - rad * 1.2, rad * 2.4, rad * 2.4);
        },
      });
    });
  }
  // --- 4. SO I CAN KEEP ON CHECKING TILL THEY PASS BEFORE I SAY IT'S DONE! A tick after each
  // row as it passes; DONE stamped.
  {
    const set = { pos: [0, 150, 900], at: [0, 210, -160], fov: .66 }, set2 = { pos: [0, 140, 760], at: [0, 205, -160], fov: .7 };
    const cR = C(set);
    const cuts = posterLine(B4, WALL, cR, [70, 170, 1010, 1120], [{ w: [0, 1, 2, 3, 4] }, { w: [5, 6, 7], k: .85 }, { w: [8, 9, 10, 11, 12] }, { w: [13], k: .8 }], { gap: .18 });
    const rows = [[0, 4], [5, 7], [8, 12]].map(([a, b]) => { const ws = cuts.filter(cw => cw.w.wi >= a && cw.w.wi <= b); const last = ws[ws.length - 1]; return shardCut(tickPoly(last.u + last.wid + last.em * .45, last.v + last.em * .4, last.em * .7), last.w.v + .12, WALL, { dur: .06, laser: '#ffffff' }); });
    const done = cuts.find(cw => cw.w.wi === 13);
    shot(B4[0].v - .12, 116.9, (g, t, sh) => {
      const c0 = move(t, sh, set, set2, { shake: 6, ease: easeOut });
      const c = cam(c0.pos, c0.target, { fov: c0.fov * punch(t) });
      boxFrame(g, t, c, {
        lights: STAGE_LIGHTS, cuts: [...cuts, ...rows], cutOpt: { outside: out(c), laser: BAND.clawd.col, light: .8, fall: 'blow', fallDur: .5 },
        band: bandLine(t, { hops: eventsIn('crash', B4[0].v - .12, 116.9) }), smoke: STAGE_SMOKE, beams: STAGE_BEAMS,
        refl: { floor: true, wall: 2 }, rays: .8, post: { shafts: .45, split: hit('crash', t, .08) * 5 },
        after: (g2, E) => {
          // The stamp: a heavy frame slammed round DONE.
          const k = clamp((t - (done.w.v + .02)) / .06);
          if (k <= 0) return;
          const s = 1 + (1 - k) * .4, pad = done.em * .16;
          const cx = done.u + done.wid / 2, cy = done.v + done.em * .4;
          const q = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => project(c, ap(WALL, [cx + x * (done.wid / 2 + pad) * s, cy + y * (done.em * .4 + pad) * s, .7])));
          for (const [ctx, w, col] of [[g2, 14, BAND.clawd.col], [E, 30, BAND.clawd.col]]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'miter'; ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.stroke(); }
        },
      });
    });
  }
  // OH YEAH after each line: the four voices, four colours, stacked a little apart.
  yeahs.forEach((yw, i) => {
    const a = yw[0].v - .15, b = yw[1].v + .55;
    overlay(a, b, (g, t) => {
      const alpha = clamp((b - t) / .2);
      const px = 150, full = width100('OH YEAH!') / 100 * px, x0 = W / 2 - full / 2, x1 = x0 + width100('OH ') / 100 * px;
      FOUR.forEach((col, j) => {
        const dx = (j - 1.5) * 10, dy = (j - 1.5) * 10, al = alpha * (j === 0 ? 1 : .6);
        etchFlat(g, 'OH', x0 + dx, 1470 + dy, px, col, clamp((t - (yw[0].v - .15 + j * .03)) / .12), { alpha: al, w0: j === 0 ? yw[0] : null, w: 3 });
        etchFlat(g, 'YEAH!', x1 + dx, 1470 + dy, px, col, clamp((t - (yw[1].v - .15 + j * .03)) / .14), { alpha: al, w0: j === 0 ? yw[1] : null, w: 3 });
      });
    });
  });
}
