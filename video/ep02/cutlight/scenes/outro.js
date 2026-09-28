// The outro, outside, in the day. The band shows its work: what's sung is cut in the pieces of
// mirror still in the air, and a card for each brief says how it was checked; one more says what
// they can't know. SO, DO YOU LOVE IT? And the four people answer, in their own hands. Then
// Jess, about Dave. Then the teaching card, and the end.
import { W, H, clamp, lerp, hash, easeOut, easeInOut, words, hit, noise, beatPos } from '../kit.js';
import { cam, project, ap, M, T, RX, RY, RZ, screenToPlane } from '../space.js';
import { posterLine, etchFlat, flat, auditFlat, CAPK, width100, drawCuts, cutWord, shardCut, carry } from '../type.js';
import { shot, move, overlay } from '../shots.js';
import { boxFrame, KEY, bandLine, LINEUP } from '../box.js';
import { WALL } from '../room.js';
import { singer } from '../playing.js';
import { clawd } from '../clawd.js';
import { tickPoly } from '../air.js';
import { dayFrame, paneM, shardPoly } from '../day.js';
import { ROSA, GRAN, PARENT, JESS, DAVE, SUE, sky } from '../world.js';
import { stranger } from '../people.js';
import { BAND, BRIEFS } from '../palette.js';
import { INK } from '../ink.js';

const C = s => cam(s.pos, s.at, { fov: s.fov, roll: s.roll || 0 });
// The people, round the band in the square.
const CROWD = [[ROSA, -260, -300, 172, { arms: 'hips', face: 'front' }], [GRAN, -110, -360, 160, { arms: 'down', face: 'front' }], [PARENT, 120, -340, 180, { arms: 'pockets', face: 'front' }], [JESS, 280, -300, 170, { arms: 'hold', face: 'front' }],
  ...Array.from({ length: 10 }, (_, i) => [stranger(200 + i), -700 + i * 150 + hash(i) * 60, -700 - hash(i, 2) * 300, 170 * stranger(200 + i).height, { arms: ['down', 'pockets', 'cross', 'phone'][i % 4], face: 'front' }])];
const DAYBAND = { cron: { pos: [0, 0, -120], riser: 0 }, null: { pos: [110, 0, -40], yaw: -.35 }, regex: { pos: [-110, 0, -30], yaw: .35 }, clawd: { pos: [0, 0, 40], yaw: 0 } };
const CHECKS = [
  ['CHECKOUT', 'load test at twice the Saturday crowd, nothing lost'],
  ['BOOKING', 'NULL, playing Gran, booked a check-up on her phone'],
  ['FEEDBACK APP', 'signed in as each parent: no one sees another family'],
  ['SEATING PLAN', 'your list: Dave and Sue at different tables'],
];

// A card of evidence: a dark strip, the brief's number block, the check, and a tick when it's in.
function card(g, n, x, y, a, tick, o = {}) {
  if (a <= 0) return;
  const b = BRIEFS[n], col = BAND[b.who].col;
  g.save(); g.globalAlpha *= a;
  const w = 960, h = 86;
  g.fillStyle = 'rgba(12,11,13,.9)'; g.fillRect(x, y, w, h);
  g.fillStyle = col; g.fillRect(x, y, 90, h);
  g.font = '900 58px Stencil'; g.fillStyle = '#0c0b0d'; g.textAlign = 'center'; g.fillText(String(b.n).padStart(2, '0'), x + 45, y + 64);
  g.textAlign = 'left';
  g.font = '800 30px Mono'; g.fillStyle = '#f3efe6'; g.fillText(CHECKS[n][0], x + 110, y + 36);
  g.font = '500 23px Mono'; g.fillStyle = col; g.fillText(CHECKS[n][1], x + 110, y + 70);
  if (tick > 0) {
    g.strokeStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
    const k = clamp(tick);
    g.beginPath(); g.moveTo(x + w - 70, y + 44); g.lineTo(x + w - 52, y + 62);
    if (k > .4) g.lineTo(x + w - 52 + (k - .4) / .6 * 34, y + 62 - (k - .4) / .6 * 40);
    g.stroke();
  }
  g.restore();
}

export function register(S) {
  const O1 = words('Outro', 'Here are'), O2 = words('Outro', 'What I'), O3 = words('Outro', 'So, do');
  const loves = [0, 1, 2, 3].map(i => words('Outro', 'I love it', i));
  const dave = words('Outro', "Dave's");
  const tail = words('Tail', 'ooh');
  const bandDay = t => bandLine(t, { at: DAYBAND, jump: .5 });
  // --- A and B: low in the square, looking up past the band at the big piece of mirror, the
  // low sun right behind it, so what's cut in it blazes.
  const setA = { pos: [0, 40, 860], at: [0, 250, -150], fov: .76 }, setA2 = { pos: [0, 46, 780], at: [0, 256, -150], fov: .76 };
  const cA = C(setA2);
  const bigM = t => paneM([0, 470, -170], .05 * Math.sin(t * .7), .07 * Math.sin(t * .5), .025 * Math.sin(t * .6));
  const m0 = bigM(143.5);
  const cuts1 = posterLine(O1, m0, cA, [100, 150, 980, 700], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6, 7] }, { w: [8, 9, 10, 11], k: .9 }, { w: [12, 13] }], { gap: .16 });
  const cuts2 = posterLine(O2, m0, cA, [100, 150, 980, 700], [{ w: [0, 1, 2, 3] }, { w: [4, 5, 6, 7] }, { w: [8, 9, 10] }, { w: [11, 12, 13] }], { gap: .16 });
  // The pane's outline: round the text, jagged.
  const bounds = cs => { let u0 = 1e9, v0 = 1e9, u1 = -1e9, v1 = -1e9; for (const cw of cs) { u0 = Math.min(u0, cw.u); u1 = Math.max(u1, cw.u + cw.wid); v0 = Math.min(v0, cw.v); v1 = Math.max(v1, cw.v + cw.em * CAPK()); } return [u0, v0, u1, v1]; };
  const paneOf = cs => { const [u0, v0, u1, v1] = bounds(cs), mx = (u1 - u0) * .08, my = (v1 - v0) * .12; return [[u0 - mx, v0 - my * 1.4], [lerp(u0, u1, .4), v0 - my * 2.2], [u1 + mx * 1.3, v0 - my], [u1 + mx, lerp(v0, v1, .6)], [u1 + mx * .6, v1 + my * 1.6], [lerp(u0, u1, .55), v1 + my * 2.4], [u0 - mx * 1.2, v1 + my]]; };
  const pane1 = paneOf(cuts1), pane2 = paneOf(cuts2);
  const SUN_A = [0, 1500, -6000];
  // The evidence: a piece of mirror for each brief, hanging round the big one, its number cut in
  // it and, as CAME THROUGH is sung, a tick, in its member's colour.
  const EV = [[-121, 214, 100], [-41, 194, 120], [41, 194, 120], [121, 214, 100]];
  const evCuts = EV.map((p, n) => {
    const b = BRIEFS[n];
    const num = cutWord({ w: '0' + b.n, v: 141.95 }, m0, -30, -10, 27, { str: '0' + b.n });
    num.o.pre = true; num.o.noAudit = true;
    const tk = shardCut(tickPoly(16, 4, 23), O1[12].v + n * .14, m0, { dur: .12 });
    return [num, tk];
  });
  const evidence = (t, lit = true) => EV.map((p, n) => {
    const m = paneM([p[0] + noise(t * .3, n) * 5, p[1] + noise(t * .25, n + 4) * 6, p[2]], .1 * Math.sin(t * .6 + n), p[0] * -.0014 + .1 * Math.sin(t * .5 + n * 2), .05 * Math.sin(t * .7 + n));
    const cs = evCuts[n]; for (const cw of cs) cw.m = m;
    return { m, poly: shardPoly(36, 40 + n), cuts: lit ? cs : [cs[0]], seed: 40 + n, laser: BAND[BRIEFS[n].who].col };
  });
  const small = Array.from({ length: 14 }, (_, i) => ({ p: [(hash(i, 1) - .5) * 1100, 160 + hash(i, 2) * 620, -300 - hash(i, 3) * 700], s: 18 + hash(i, 4) * 36, seed: i }));
  const air = t => small.map(sm => ({ m: paneM([sm.p[0] + noise(t * .3, sm.seed) * 20, sm.p[1] + noise(t * .25, sm.seed + 3) * 16 - (t - 141.9) * 6, sm.p[2]], t * .6 + sm.seed, t * .4 + sm.seed * 2, sm.seed), poly: shardPoly(sm.s, sm.seed), seed: sm.seed }));
  // The four they built for, round the band, turned in to it; others further off.
  const FOUR = [[ROSA, -330, 150, 172, { arms: 'hips', face: 'right' }], [GRAN, -215, 250, 160, { arms: 'down', face: 'right' }], [PARENT, 230, 240, 180, { arms: 'pockets', face: 'left' }], [JESS, 335, 150, 170, { arms: 'hold', face: 'left' }]];
  const OTHERS = Array.from({ length: 9 }, (_, i) => [stranger(200 + i), -620 + i * 155 + hash(i) * 50, -520 - hash(i, 2) * 380, 170 * stranger(200 + i).height, { arms: ['down', 'pockets', 'cross', 'phone'][i % 4], face: 'front' }]);
  // Out of the flash of the box breaking: the day, fading up from white.
  overlay(141.9, 142.3, (g, t) => { g.fillStyle = `rgba(255,250,240,${.5 * (1 - clamp((t - 141.9) / .4))})`; g.fillRect(0, 0, W, H); });
  const tB = O2[0].v + .05;
  carry(cuts2, tB);
  shot(141.9, tB, (g, t, sh) => {
    const c = move(t, sh, setA, setA2, { hand: .8 });
    const m = bigM(t);
    for (const cw of cuts1) cw.m = m;
    dayFrame(g, t, c, {
      sunAt: SUN_A, people: [...OTHERS, ...FOUR], band: bandDay(t),
      shards: [...air(t), ...evidence(t), { m, poly: pane1, cuts: cuts1, seed: 99, laser: BAND.clawd.col }],
    });
  });
  // --- B: WHAT I DON'T KNOW, THAT I WILL SHOW, AND LEAVE THE REST TO YOU. The one piece they
  // can't tick, a question mark cut in it, comes down to the four of them.
  const qCut = cutWord({ w: '?', v: O2[4].v }, m0, -20, -32, 86, { str: '?' });
  qCut.o.noAudit = true;
  shot(tB, O3[0].v - .5, (g, t, sh) => {
    const c = move(t, sh, setA2, { ...setA2, pos: [0, 52, 700] }, { hand: .8 });
    const m = bigM(t);
    for (const cw of cuts2) cw.m = m;
    const k = easeInOut(clamp((t - O2[4].v) / (O2[11].v - O2[4].v)));
    // The question mark comes out from the band, towards us: the rest is ours.
    const k2 = easeInOut(clamp((t - O2[11].v) / (O3[0].v - .5 - O2[11].v)));
    const qm = paneM([lerp(170, 30, k) - k2 * 25, lerp(120, 130, k) - k2 * 70 + Math.sin(t * 2) * 5, lerp(40, 230, k) + k2 * 380], .1 * Math.sin(t * .8), -.35 * (1 - k) + .08 * Math.sin(t * .6), .05 * Math.sin(t));
    qCut.m = qm;
    dayFrame(g, t, c, {
      sunAt: SUN_A, people: [...OTHERS, ...FOUR], band: bandDay(t),
      shards: [...air(t), ...evidence(t), { m, poly: pane2, cuts: cuts2, seed: 98, laser: BAND.clawd.col }, ...(t > O2[4].v - .3 ? [{ m: qm, poly: shardPoly(52, 7), cuts: [qCut], seed: 7, laser: '#fff1dc' }] : [])],
    });
  });
  // --- C: SO, DO YOU LOVE IT? CLAWD alone in the middle of the square, facing us, the sun behind
  // his head, the question cut huge in the piece above him.
  const setC = { pos: [0, 34, 430], at: [0, 150, -200], fov: .8 }, setC2 = { pos: [0, 30, 370], at: [0, 156, -200], fov: .78 };
  const cC = C(setC2);
  const qM = t => paneM([0, 300, -40], .03 * Math.sin(t * .8), .05 * Math.sin(t * .6), .02 * Math.sin(t * .7));
  const cutsQ = posterLine(O3, qM(152), cC, [70, 140, 1010, 760], [{ w: [0, 1, 2] }, { w: [3, 4] }], { gap: .14 });
  const paneQ = paneOf(cutsQ);
  shot(O3[0].v - .5, loves[0][0].v - .3, (g, t, sh) => {
    const c = move(t, sh, setC, setC2, { hand: .5 });
    const m = qM(t);
    for (const cw of cutsQ) cw.m = m;
    dayFrame(g, t, c, {
      sunAt: [60, 520, -6000],
      people: OTHERS,
      band: [...bandLine(t, { at: { ...DAYBAND, regex: { pos: [-190, 0, -260], yaw: .25 }, null: { pos: [190, 0, -270], yaw: -.25 }, cron: { pos: [0, 0, -420], riser: 0 } } }).filter(b => b.name !== 'clawd'),
        { name: 'clawd', col: BAND.clawd.col, draw: (L, cc) => singer(L, cc, { pos: [0, 0, 60], yaw: 0, t, eyes: 'wide', armL: { up: -.1 }, armR: { up: -.1 }, noMic: true }) }],
      shards: [...air(t), { m, poly: paneQ, cuts: cutsQ, seed: 97, laser: BAND.clawd.col }],
    });
  });
  // --- D: (I LOVE IT) x4: the four of them, facing him, each answering in their own hand, in the
  // colour of their brief, and cheering.
  const who = [[ROSA, 'regex'], [GRAN, 'cron'], [PARENT, 'null'], [JESS, 'clawd']];
  const setD = { pos: [0, 62, 560], at: [0, 140, -200], fov: .84 }, setD2 = { pos: [0, 60, 520], at: [0, 142, -200], fov: .84 };
  shot(loves[0][0].v - .3, dave[0].v - .2, (g, t, sh) => {
    const c = move(t, sh, setD, setD2, { hand: .8 });
    const people = who.map(([sp], i) => {
      const said = t >= loves[i][0].v - .1;
      return [sp, -108 + i * 72, -60 - (i % 2) * 34, [170, 156, 178, 168][i], { arms: said ? 'cheer' : ['hips', 'phoneFar', 'strap', 'hold'][i], face: ['right', 'right', 'left', 'left'][i], joy: said, mood: said ? 'joy' : null, look: !said && i === 1 ? 'phone' : 'ahead', weight: (i - 1.5) * .3 }];
    });
    dayFrame(g, t, c, {
      sunAt: [-80, 600, -6000], people: [...OTHERS, ...people], shards: air(t),
      band: [{ name: 'clawd', col: BAND.clawd.col, draw: (L, cc) => clawd(L, cc, { who: 'clawd', pos: [0, 0, 330], yaw: Math.PI, t, armL: { up: .3 }, armR: { up: .3 } }) }],
      after: (g2) => {
        who.forEach(([sp, w], i) => {
          const L = loves[i];
          const a = clamp((t - (L[0].v - .12)) / .12);
          if (a <= 0) return;
          const x = [330, 750, 350, 730][i], y = [330, 480, 640, 800][i];
          const pop = 1 + .25 * Math.exp(-(t - L[0].v) / .12) * (t > L[0].v ? 1 : 0);
          g2.save(); g2.globalAlpha *= a;
          g2.translate(x, y); g2.rotate([-.12, .08, -.06, .1][i]); g2.scale(pop, pop);
          g2.font = '88px Hand'; g2.textAlign = 'center'; g2.lineJoin = 'round';
          g2.strokeStyle = 'rgba(12,11,13,.9)'; g2.lineWidth = 16; g2.strokeText('I love it!', 0, 0);
          g2.fillStyle = BAND[w].col; g2.fillText('I love it!', 0, 0);
          g2.restore();
          const wd = 440;
          L.forEach((lw, k) => auditFlat(lw.str, [x - wd / 2 + k * wd / 3, y - 70, x - wd / 2 + (k + 1) * wd / 3, y], 66, 0, lw, { alpha: a }));
        });
      },
    });
  });
  // --- E: (DAVE'S STILL COMING, THOUGH). Jess, near, deadpan, the sun through her veil; Dave,
  // far off across the square, beaming, waving; Sue, arms folded.
  shot(dave[0].v - .2, tail[0].v - 2.2, (g, t, sh) => {
    const c = move(t, sh, { pos: [40, 80, 560], at: [10, 130, -300], fov: .74 }, { pos: [36, 78, 520], at: [10, 130, -300], fov: .72 }, { hand: .7 });
    dayFrame(g, t, c, {
      sunAt: [-500, 700, -6000],
      people: [[JESS, 50, 150, 170, { arms: 'cross', face: 'left', mood: 'deadpan' }], [DAVE, -190, -700, 176, { arms: 'wave', face: 'front', joy: true }], [SUE, 380, -900, 168, { arms: 'cross', face: 'left' }], ...OTHERS.slice(0, 5).map(([s, x, z, h, p]) => [s, x, z - 500, h, p])],
      shards: air(t),
      after: (g2) => {
        const L = dave;
        // In her hand, on two lines: the second lands with "though".
        const a = clamp((t - (L[0].v - .12)) / .15), a2 = clamp((t - (L[3].v - .12)) / .15);
        if (a <= 0) return;
        const x = 470, y = 1380;
        const line = (txt, dy, al) => {
          if (al <= 0) return;
          g2.save(); g2.globalAlpha *= al;
          g2.font = '80px Hand'; g2.textAlign = 'center'; g2.lineJoin = 'round';
          g2.translate(x, y + dy); g2.rotate(-.05);
          g2.strokeStyle = 'rgba(12,11,13,.9)'; g2.lineWidth = 14; g2.strokeText(txt, 0, 0);
          g2.fillStyle = BAND.clawd.col; g2.fillText(txt, 0, 0);
          g2.restore();
        };
        line("Dave's still coming,", 0, a);
        line('though.', 120, a2);
        const wd = 760;
        L.slice(0, 3).forEach((lw, k) => auditFlat(lw.str, [x - wd / 2 + k * wd / 3, y - 66, x - wd / 2 + (k + 1) * wd / 3, y], 62, 0, lw, { alpha: a }));
        auditFlat(L[3].str, [x - 160, y + 120 - 66, x + 160, y + 120], 62, 0, L[3], { alpha: a2 });
      },
    });
  });
  // --- F: the teaching card, over the band's last jam. G: the end card.
  teach(tail[0].v - 2.2, 171.0, tail[0]);
  endCard(171.0, 175.0);
}

// HOW YOUR AGENT CAN KNOW: four common kinds of oracle (there are more), one a beat.
const KINDS = [
  ['MECHANICAL CHECKS', 'Tools that test it: a linter, a load test on every merge.'],
  ['COMPARISONS', 'Something to match: a mockup, a screenshot, other software.'],
  ['HEURISTICS', 'Rules of thumb an agent applies: a skill file, a reviewer prompt.'],
  ['SIMULATED USERS', 'Another agent plays your user and judges it as they would.'],
];
function wrap(g, s, maxW) {
  const out = []; let cur = '';
  for (const w of s.split(' ')) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > maxW && cur) { out.push(cur); cur = w; } else cur = tr; }
  if (cur) out.push(cur); return out;
}
function teach(a, b, ooh) {
  const cT = C({ pos: [0, 300, 700], at: [0, 300, -160], fov: .9 });
  const title = posterLine([{ w: 'HOW', v: a + .4 }, { w: 'YOUR', v: a + .55 }, { w: 'AGENT', v: a + .7 }, { w: 'CAN', v: a + .85 }, { w: 'KNOW', v: a + 1.0 }], WALL, cT, [60, 150, 1020, 440], [{ w: [0, 1, 2] }, { w: [3, 4] }], { gap: .12 });
  for (const cw of title) cw.o.noAudit = true;
  shot(a, b, (g, t, sh) => {
    const c = move(t, sh, { pos: [0, 300, 700], at: [0, 300, -160], fov: .9 }, { pos: [0, 300, 680], at: [0, 300, -160], fov: .9 }, { hand: .4 });
    boxFrame(g, t, c, {
      lights: { key: { dir: [0, .5, 1], col: KEY, k: .8 }, ambient: '#10122a', extra: [] },
      cuts: title, cutOpt: { outside: L => sky(L, c, t, { sun: [0, 900, -6000] }), laser: BAND.clawd.col, light: .6 },
      refl: { floor: false, wall: 0 }, post: { shafts: .2, glow: [.25, .3], vignette: .5 },
      after: (g2) => {
        const k0 = clamp((t - (a + 1.2)) / .3);
        flat(g2, 'four common kinds of oracle (there are more)', 70, 560, 34, 'mono', { fill: '#f3efe6', alpha: k0 });
        const cols = ['#f3efe6', '#f3efe6', '#f3efe6', '#f3efe6'];
        KINDS.forEach(([name, ex], i) => {
          const k = clamp((t - (a + 1.8 + i * .9)) / .3);
          if (k <= 0) return;
          const y = 660 + i * 205;
          g2.save(); g2.globalAlpha *= k;
          g2.fillStyle = '#f3efe6'; g2.fillRect(70, y, 76, 76);
          g2.font = '900 66px Stencil'; g2.fillStyle = '#0c0b0d'; g2.textAlign = 'center'; g2.fillText(String(i + 1), 108, y + 66);
          g2.textAlign = 'left';
          g2.font = '800 40px Mono'; g2.fillStyle = BAND.clawd.col; g2.fillText(name, 176, y + 36);
          g2.font = '500 30px Mono'; g2.fillStyle = '#f3efe6';
          wrap(g2, ex, 820).forEach((ln, j) => g2.fillText(ln, 176, y + 82 + j * 40));
          g2.restore();
        });
        const kz = clamp((t - (a + 5.6)) / .3);
        flat(g2, 'Give it these before it says "done".', 70, 1520, 38, 'monoB', { fill: BAND.clawd.col, alpha: kz });
        flat(g2, 'Oracles: an old idea in testing (Howden; Weyuker; Bach & Bolton).', 70, 1580, 22, 'mono', { fill: '#b9b3a8', alpha: kz });
        flat(g2, 'For agentic coding: Yanqing Cheng.', 70, 1612, 22, 'mono', { fill: '#b9b3a8', alpha: kz });
        // The last "ooh", etched small in the corner.
        const po = clamp((t - (ooh.v - .15)) / .2);
        etchFlat(g2, 'OOH', 920, 1470, 80, BAND.clawd.col, po, { align: 'right', alpha: clamp((ooh.v + 3.2 - t) / .4), w0: ooh });
      },
    });
  });
}

function endCard(a, b) {
  const cE = C({ pos: [0, 260, 800], at: [0, 260, -160], fov: .8 });
  const title = posterLine([{ w: 'HOW', v: a + .1 }, { w: 'WILL', v: a + .2 }, { w: 'I', v: a + .28 }, { w: 'KNOW', v: a + .38 }], WALL, cE, [90, 420, 990, 1150], [{ w: [0] }, { w: [1, 2] }, { w: [3] }], { gap: .1 });
  for (const cw of title) cw.o.noAudit = true;
  shot(a, b, (g, t, sh) => {
    const c = move(t, sh, { pos: [0, 260, 800], at: [0, 260, -160], fov: .8 }, { pos: [0, 260, 760], at: [0, 260, -160], fov: .8 }, { hand: .3 });
    boxFrame(g, t, c, {
      lights: { key: { dir: [0, .5, 1], col: KEY, k: .8 }, ambient: '#10122a', extra: [] },
      cuts: title, cutOpt: { outside: L => sky(L, c, t, { sun: [0, 500, -6000] }), laser: BAND.clawd.col, light: .7 },
      refl: { floor: false, wall: 0 }, post: { shafts: .35, glow: [.3, .35], vignette: .5 },
      after: (g2) => {
        const k = clamp((t - (a + .7)) / .4);
        flat(g2, 'SOFTWARE QUALITY THEORY 101', W / 2, 1330, 36, 'monoB', { fill: '#f3efe6', alpha: k, align: 'center', track: 4 });
        flat(g2, 'EPISODE 2', W / 2, 1382, 30, 'mono', { fill: BAND.clawd.col, alpha: k, align: 'center', track: 6 });
        const dots = ['clawd', 'regex', 'cron', 'null'];
        dots.forEach((w, i) => { g2.fillStyle = BAND[w].col; g2.globalAlpha = k; g2.fillRect(W / 2 - 110 + i * 60, 1430, 40, 8); });
        g2.globalAlpha = 1;
      },
    });
  });
}
