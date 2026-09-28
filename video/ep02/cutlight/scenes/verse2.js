// Verse 2: an oracle for each app, in the same order and the same colours. In verse 1 they were
// shown what went wrong; now each builds something that can see, and cuts a window with it. The
// load test: a simulated customer marches in beside every real one in Rosa's queue, in REGEX's
// cyan. The bot: NULL, prompted to act as Gran, is dressed as her piece by piece and tries the
// booking site the way she would, beside the real Gran; it books. The isolation check: four
// families, each in a cell of its own, and a scan line that locks each one's messages in. And for
// Dave and Sue, no check at all: Jess at the glass, writing her note.
import { W, H, clamp, lerp, easeInOut, easeOut, words, hit } from '../kit.js';
import { cam, project, ap } from '../space.js';
import { posterLine, ticket, etchFlat, flat, windowCut } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY, wallRect, once } from '../box.js';
import { WALL, ROOM } from '../room.js';
import { player, singer } from '../playing.js';
import { clawd } from '../clawd.js';
import { sky, backdrop } from '../world.js';
import { story, aim, phoneScreen, bubble, PRIVATE } from '../story.js';
import { figure, CAST } from '../paper.js';
import { grid } from '../windows.js';
import { BAND } from '../palette.js';

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
const outside = (c, cM, t, draw) => L => { sky(L, c, t, { sun: [0, 420, -6000] }); backdrop(L, c, cM, D, draw); };
// Text typed on in the machine's voice, flat on the glass, glowing.
function typed(g, E, lines, x, y, px, t, t0, dur, col = '#e9ecf2') {
  const total = lines.reduce((a, l) => a + l.length, 0);
  let n = Math.floor(clamp((t - t0) / dur) * total + .001);
  lines.forEach((ln, i) => {
    if (n <= 0) return;
    const s = ln.slice(0, n); n -= ln.length;
    for (const [ctx, a] of [[g, 1], [E, .5]]) { if (!ctx) continue; ctx.save(); ctx.globalAlpha *= a; flat(ctx, s, x, y + i * px * 1.45, px, 'mono', { fill: col }); ctx.restore(); }
  });
}

export function register(S) {
  // --- 1. REGEX, the load test: GIVE ME A TOOL TO RUN ON EVERY MERGE TO CHECK THE LOAD. On TOOL his
  // laser cuts a window, and through it Rosa's queue; on MERGE two branches join; on CHECK THE LOAD
  // a simulated customer marches in beside every real one, and the terminal's meter fills.
  {
    const ws = words('Verse 2', 'Give me a tool');
    const camA = { pos: [30, 96, 350], at: [10, 104, -160], fov: .76 }, camB = { pos: [44, 92, 312], at: [16, 102, -160], fov: .75, roll: -.012 };
    const cM = C({ pos: [37, 94, 331], at: [13, 103, -160], fov: .755 });
    const cuts = posterLine(ws, WALL, cM, [60, 200, 1020, 740], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6], k: .8, align: 'left' }, { w: [7, 8], k: .9, align: 'right' }, { w: [9, 10, 11, 12] }], { gap: .2 });
    const merge = cuts.find(cw => cw.w.wi === 8);
    const box = [470, 800, 1040, 1640];
    const win = windowCut(cM, WALL, box, ws[3].v + .05, { dur: .5, laser: BAND.regex.col, glowK: .22 });
    const times = { load: ws[10].v - .05 };
    const view = { fit: { u: .5, v: .44, x: 755, y: 800, w: 1060 }, times };
    shot(60.8, 64.3, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2 });
      boxFrame(g, t, c, {
        lights: lights(BAND.regex.col, [-160, 160, 200]),
        cuts: [...cuts, win], cutOpt: { outside: once(outside(c, cM, t, L => story(L, t, 'bakery', 'load', [0, 0, W, H], view)), 'v2'), laser: BAND.regex.col, light: .6, haze: .08 },
        band: [{ name: 'regex', col: BAND.regex.col, rimDir: [.4, -1], rim: 3.6, draw: (L, cc) => player(L, cc, { who: 'regex', pos: [-14, 0, -56], yaw: Math.PI * .82, t, glow: 1 }) }],
        refl: { floor: true, wall: 1, wallA: .35 }, rays: .6, sun: [-200, 180, -6000],
        after: (g2, E) => {
          // Branches merging into MERGE: two lines of a history, joining where the word is.
          const k = clamp((t - (merge.w.v - .4)) / .35);
          if (k > 0) {
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
          }
          // The load test's readout, on the window's foot: the crowd doubling, the checkout fine.
          const q = clamp((t - times.load) / .9);
          if (q > 0) {
            const x = 500, y = 1446;
            g2.save(); g2.fillStyle = 'rgba(8,12,20,.8)'; g2.beginPath(); g2.roundRect(x - 16, y - 50, 540, 196, 16); g2.fill(); g2.restore();
            flat(g2, 'LOAD TEST', x, y, 40, 'monoB', { fill: BAND.regex.col });
            flat(g2, `${Math.round(50 + 50 * q)} customers at 8:00`, x, y + 56, 36, 'mono', { fill: '#eef0f4' });
            flat(g2, q >= 1 ? 'CHECKOUT OK' : 'checkout...', x, y + 112, 40, 'monoB', { fill: q >= 1 ? '#8fff5a' : '#7f8796' });
            if (q >= 1 && E) flat(E, 'CHECKOUT OK', x, y + 112, 40, 'monoB', { fill: '#8fff5a' });
          }
        },
      });
    });
  }
  // --- 2. The bot as Gran: I'LL PROMPT A BOT TO ACT AS GRAN MAKE SURE SHE CAN GO. The prompt is
  // typed on the glass; NULL, facing us, is dressed as her a piece at a time (her glasses, her
  // curls, her shawl, her handbag), his phone held out at arm's length the way she holds hers, the
  // booking site on it now with big clear times; in the window behind him, the real Gran, squinting
  // at hers. On GO the bot books, and so does she: she holds hers up, BOOKED.
  {
    const ws = words('Verse 2', "I'll prompt");
    const set = { pos: [-36, 88, 478], at: [-6, 104, -160], fov: .8, roll: .01 }, set2 = { pos: [-28, 86, 448], at: [-4, 104, -160], fov: .79 };
    const cM = C({ pos: [-32, 87, 463], at: [-5, 104, -160], fov: .795 });
    // Below the label and its TRIED BY line.
    const cuts = posterLine(ws, WALL, cM, [60, 262, 1020, 700], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6, 7], k: .95 }, { w: [8, 9], k: .8, align: 'left' }, { w: [10, 11, 12] }], { gap: .2 });
    const box = [40, 730, 500, 1290];
    const win = windowCut(cM, WALL, box, ws[3].v + .05, { dur: .45, laser: BAND.cron.col, glowK: .22 });
    const booked = ws[12].v - .15;
    const gran = t => ({ fit: { u: .5, v: .42, x: 270, y: 730, w: 700 }, fu: .5, fv: 1.0, fh: .56, times: { stuck: -1e9 } });
    // The costume, piece by piece on the words: [prop, when, where on him (body frame), width].
    const COSTUME = [['prop-glasses', ws[3].v, [0, 3.6, 22.5], 40], ['prop-wig', ws[5].v, [0, 43, 2], 64], ['prop-shawl', ws[7].v, [0, -21, 21], 42], ['prop-handbag', ws[8].v, null, 24]];
    const wear = (L, cc, r, t) => {
      for (const [name, at, where, wide] of COSTUME) {
        if (t < at) continue;
        const pop = 1 + .3 * Math.pow(1 - clamp((t - at) / .2), 2);
        const f = CAST[name], size = f ? wide * f.h / f.w : wide;
        let p, h;
        if (where) {
          const q = project(cc, ap(r.bodyM, where)), q2 = project(cc, ap(r.bodyM, [where[0], where[1] + size, where[2]]));
          p = q; h = Math.abs(q2.y - q.y);
          // Hung from its middle: its feet go half its height below the anchor.
          figure(L, name, p.x, p.y + h * .5 * pop, h * pop, { t, seed: 300 + name.length, sway: .3, jitter: .4, shadow: [2, 2, .25] });
        } else {
          p = project(cc, r.tipL); const q2 = project(cc, [r.tipL[0], r.tipL[1] + size, r.tipL[2]]); h = Math.abs(q2.y - p.y);
          figure(L, name, p.x, p.y + h * 1.05, h * pop, { t, seed: 305, sway: 1.2, jitter: .4 });
        }
      }
    };
    // His phone at arm's length, the booking site on it: spinning, then booked.
    const phone = (L, cc, tip, t) => {
      const p = project(cc, tip);
      if (p.z < cc.near) return;
      const s = p.s, w = 19 * s, h = 34 * s;
      L.save(); L.translate(p.x, p.y - h * .45); L.rotate(.12);
      L.fillStyle = '#16171c'; L.beginPath(); L.roundRect(-w / 2 - 3 * s, -h / 2 - 5 * s, w + 6 * s, h + 10 * s, 5 * s); L.fill();
      L.strokeStyle = '#050407'; L.lineWidth = Math.max(1.5, s * 1.2); L.stroke();
      phoneScreen(L, -w / 2, -h / 2, w, h, t > booked ? 'booked' : 'big', t);
      L.restore();
    };
    shot(64.3, 67.8, (g, t, sh) => {
      const c = move(t, sh, set, set2, { shake: 2 });
      const G = gran(t);
      if (t > booked + .1) { G.times = {}; }
      boxFrame(g, t, c, {
        lights: lights(BAND.null.col, [260, 200, 380]),
        // The real Gran squinting at hers; then, as the bot books, holding up her own: BOOKED.
        cuts: [...cuts, win], cutOpt: { outside: once(outside(c, cM, t, L => story(L, t, 'clinic', t > booked + .1 ? 'show' : 'down', [0, 0, W, H], t > booked + .1 ? { ...G, screen: 'booked', hold: 1.9, pop: booked + .1 } : G)), 'v2'), laser: BAND.cron.col, light: .6, haze: .06 },
        band: [{ name: 'null', col: BAND.null.col, rimDir: [-.5, -1], draw: (L, cc) => {
          const r = clawd(L, cc, { who: 'null', pos: [-6, 0, 126], yaw: -.18, t, armR: { to: [30, 36, 30], z: 12 }, armL: { up: -.35 }, eyes: t > booked ? 'happy' : 'narrow' });
          wear(L, cc, r, t); phone(L, cc, r.tipR, t);
        } }],
        beams: [[[260, 460, 330], [-6, 0, 126], 70, BAND.null.col, .6]],
        refl: { floor: true, wall: 1 }, rays: .6, sun: [200, 200, -6000],
        after: (g2, E) => {
          // The prompt, typed on the glass as it's sung, and under it, on GO, the test's result.
          typed(g2, E, ['> act as: Gran, 84', '> reading glasses,', '  big thumbs', '> book a check-up'], 560, 752, 32, t, ws[1].v - .05, .75);
          if (t > booked) typed(g2, E, ['PASS: booked'], 560, 752 + 4 * 32 * 1.45, 32, t, booked, .25, '#8fff5a');
        },
      });
    });
  }
  // --- 3. The school: AN ISOLATION CHECK TO FIND THE THINGS THAT SHOULDN'T SHOW. Four cells cut
  // in the glass, a family in each with its own message; a scan line runs down through them and
  // locks each one's message in its own cell.
  {
    const ws = words('Verse 2', 'An isolation');
    const camA = { pos: [-8, 112, 176], at: [-4, 101, -160], fov: .78 }, camB = { pos: [0, 108, 152], at: [0, 99, -160], fov: .77, roll: .012 };
    const cM = C({ pos: [-4, 110, 164], at: [-2, 100, -160], fov: .775 });
    const cuts = posterLine(ws, WALL, cM, [60, 200, 1020, 700], [{ w: [0, 1] }, { w: [2, 3, 4], k: .85 }, { w: [5, 6, 7], k: .85 }, { w: [8, 9] }], { gap: .26 });
    const cells = grid(60, 1020, 750, 1690, 28);
    const wins = cells.map((b, i) => windowCut(cM, WALL, b, ws[1].v + .1 + i * .14, { dur: .3, r: 22, laser: BAND.null.col, glowK: .25 }));
    const GU = [.12, .37, .6, .84];
    const scan0 = ws[4].v, scan1 = ws[9].v;
    const lockAt = i => lerp(scan0, scan1, (i < 2 ? .25 : .75));
    shot(67.8, 70.9, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2 });
      // Each cell's view: the gate, aimed at one parent and their message, which locks as the scan
      // passes it.
      const out = L => {
        sky(L, c, t, { sun: [0, 420, -6000] });
        backdrop(L, c, cM, D, L2 => cells.forEach(([x0, y0, x1, y1], i) => {
          L2.save(); L2.beginPath(); L2.rect(x0 - 30, y0 - 30, x1 - x0 + 60, y1 - y0 + 60); L2.clip();
          story(L2, t, 'school', 'locked', [0, 0, W, H], { fit: { u: GU[i], v: .57, x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: 900 }, times: { lock: lockAt(i) - i * .15 }, clip: [x0 + 10, y0, x1 - 10, y1], px: 30, only: i });
          L2.restore();
        }));
      };
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.null.col, [-240, 140, 40]),
        cuts: [...cuts, ...wins], cutOpt: { outside: once(out, 'v2'), laser: BAND.null.col, light: .6, haze: .06 },
        band: [{ name: 'null', col: BAND.null.col, rimDir: [.4, -1], rim: 3.6, reflOnly: true, draw: (L, cc) => player(L, cc, { who: 'null', pos: [0, 0, 200], yaw: Math.PI, t, glow: 1 }) }],
        refl: { floor: true, hero: true }, rays: .6, sun: [0, 900, -6000],
        after: (g2, E) => {
          // The leak: Amy's message, showing in Rob's cell. The scan finds it (SHOULDN'T SHOW, in
          // red), and it goes home to her cell, where it's locked in with hers.
          const [f0, f1] = [cells[1], cells[0]], fy = f0[1] + 196, found = lerp(scan0, scan1, (fy - 740) / 960);
          const back = easeInOut(clamp((t - found - .45) / .4));
          if (back < 1) {
            const bx = lerp(f0[0] + 26, f1[0] + 26, back), by = lerp(fy, f1[1] + 170, back) - Math.sin(back * Math.PI) * 60;
            const hot = t >= found && t < found + .45;
            g2.save(); g2.globalAlpha *= 1 - back * back;
            if (hot) { g2.fillStyle = 'rgba(196,34,28,.92)'; g2.beginPath(); g2.roundRect(bx - 10, by - 42, 424, 112, 22); g2.fill(); flat(g2, "SHOULDN'T SHOW", bx + 6, by - 12, 26, 'monoB', { fill: '#ffffff' }); }
            bubble(g2, PRIVATE[0], bx, by, 30, { fill: '#ffffff' });
            g2.restore();
            if (hot && E) { E.fillStyle = 'rgba(255,60,50,.5)'; E.fillRect(bx - 10, by - 42, 424, 112); }
          }
          // The scan: a violet line running down through the cells.
          const q = clamp((t - scan0) / (scan1 - scan0));
          if (q <= 0 || q >= 1) return;
          const y = lerp(740, 1700, q);
          for (const [ctx, w, a] of [[g2, 3, .95], [E, 10, .7]]) { ctx.save(); ctx.strokeStyle = `rgba(165,123,255,${a})`; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(1040, y); ctx.stroke(); ctx.restore(); }
          g2.save(); const gr = g2.createLinearGradient(0, y - 90, 0, y); gr.addColorStop(0, 'rgba(165,123,255,0)'); gr.addColorStop(1, 'rgba(165,123,255,.22)'); g2.fillStyle = gr; g2.fillRect(40, y - 90, 1000, 90); g2.restore();
        },
      });
    });
  }
  // --- 4. The wedding: BUT AS FOR DAVE AND SUE, YOU REALLY HAD TO LET ME KNOW! On DAVE his laser
  // opens a window, and there's Jess, at the glass, writing her note as he sings it.
  {
    const ws = words('Verse 2', 'But as for');
    const camA = { pos: [70, 104, 330], at: [20, 104, -160], fov: .76 }, camB = { pos: [58, 98, 290], at: [18, 101, -160], fov: .76, roll: .015 };
    const cM = C({ pos: [64, 101, 310], at: [19, 102.5, -160], fov: .76 });
    const cuts = posterLine(ws, WALL, cM, [70, 200, 1010, 740], [{ w: [0, 1, 2], k: .7, align: 'left' }, { w: [3, 4, 5] }, { w: [6, 7, 8, 9], k: .9 }, { w: [10, 11, 12] }], { gap: .2 });
    const box = [300, 780, 1040, 1680];
    const win = windowCut(cM, WALL, box, ws[3].v + .05, { dur: .5, laser: '#fff1dc', glowK: .2 });
    const fit = aim('wedding', 'jess-note', box, .5, { dy: .02 });
    const writeP = t => clamp((t - ws[6].v) / (ws[12].v - ws[6].v + .1));
    shot(70.9, 74.5, (g, t, sh) => {
      const c = move(t, sh, camA, camB, { shake: 2, ease: easeOut });
      boxFrame(g, t, c, {
        lights: mirrorLights(BAND.clawd.col, [220, 160, 60]),
        cuts: [...cuts, win], cutOpt: { outside: once(outside(c, cM, t, L => story(L, t, 'wedding', 'note', [0, 0, W, H], { fit, hold: 1.5, textP: writeP(t) })), 'v2'), laser: BAND.clawd.col, light: .6, haze: .05 },
        band: [{ name: 'clawd', col: BAND.clawd.col, rimDir: [-.3, -1], rim: 3.6, draw: (L, cc) => singer(L, cc, { pos: [-62, 0, 150], yaw: Math.PI * .78, t }) }],
        beams: [[[-220, 460, 160], [-62, 0, 150], 60, BAND.clawd.col, .6]],
        refl: { floor: true, wall: 1, wallA: .35 }, rays: .6, sun: [0, 400, -6000],
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
  const at = [[250, 1120, 110, 64.45], [270, 1440, 110, 67.95], [180, 1060, 90, 74.6]];
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
