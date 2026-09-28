// Outro and tail. On chorus 3's "prove!" the glass shatters, and there's nothing between the
// band and the people any more. "Here are the checks, here are the tests, and how each one came
// through": each Clawd holds up a piece of the mirror with his brief's check on it. "What I don't
// know, that I will show, and leave the rest to you": CLAWD hands you the last piece, blank.
// "So, do you love it?" And the four people answer, one after another: "I love it." Jess: "Dave's
// still coming, though." Then, over the band's last jam, how your agent can know: four common
// kinds of oracle, one a bar, each a lit pane; and the credits.
import { C, W, H, TAU, clamp, lerp, easeOut, easeIn, backOut, env, hit, last, noise, rgba, hash, mix } from '../kit.js';
import { fill, layer, put, strobe, impact, cone, burst, floor } from '../world.js';
import { pane, shatter, crack } from '../glass.js';
import { shot, overlay, camera } from '../shots.js';
import { words, sing, rows, echo, STYLE } from '../lyric.js';
import { text, kickback, measure } from '../type.js';
import { P, ink, gpen } from '../pen.js';
import { clawd } from '../clawd.js';
import { regex, nullBass, cron, singer, groove } from '../playing.js';
import { person, stranger } from '../people.js';
import { BRIEFS, CAST, deco } from '../places.js';
import { HOOK } from './chorus.js';
import { tick } from '../bugs.js';

const live = (tt, w) => kickback(tt, w.v, 6, .08);

// A piece of the broken mirror, held up like a card, with a brief's check on it.
function shard(g, x, y, w, h, rot, t, lines, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const pts = [[-w / 2, -h / 2 + h * .08], [w * .1, -h / 2], [w / 2, -h / 2 + h * .15], [w / 2 - w * .06, h / 2], [-w / 2 + w * .1, h / 2 - h * .05]];
  ink(g, P().poly(pts), { fill: o.fill || C.glass3, line: 6, seed: o.seed || 1, t, rim: { dx: 6, dy: 4, col: C.bone } });
  g.save(); P().poly(pts).trace(g); g.clip();
  g.fillStyle = rgba(C.glass, .12); g.fillRect(-w / 2, -h / 2, w, h * .35);
  lines(g, w, h);
  g.restore();
  g.restore();
}

export function register(S) {
  const O1 = words('Outro', 'Here are'), O2 = words('Outro', 'What I'), O3 = words('Outro', 'So, do you');
  const Ls = [0, 1, 2, 3].map(i => words('Outro', 'I love it', i));
  const Dv = words('Outro', "Dave's");
  const Oo = words('Tail', 'ooh');
  const t0 = 141.86, c2 = O2[0].v - .1, c3 = O2[13].v + .8, c4 = Ls[0][0].v - .12;
  const lc = [Ls[1][0].v - .1, Ls[2][0].v - .1, Ls[3][0].v - .1, Dv[0].v - .1];
  const cEnd = Dv[3].v + .7, songEnd = 173.42;

  // ---------------------------------------------------------------- the checks, held up
  shot(t0, c2, (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.06, y: 1000 }, { z: 1.0, y: 980 }, { shake: 5 });
    // The people, lit, all round: the glass is gone.
    g.fillStyle = '#2f343b'; g.fillRect(0, 0, W, 1250);
    for (let i = 0; i < 9; i++) stranger(g, 60 + i * 120, 1160, 420, 900 + i, { t, rim: C.bone, armL: hash(i, 2) < .4 ? 'up' : 'down', expr: 'smile' });
    cone(g, 540, 0, 0, 1.3, 1900, C.bone, .06);
    floor(g, 1540, { light: C.bone, streaks: 5, seed: 31 });
    // Each Clawd, with his brief's check on a piece of the mirror.
    const who = ['regex', 'cron', 'null', 'clawd'];
    const checks = [['LOAD TEST', 'every merge'], ['A BOT PLAYED', 'GRAN, 82'], ['ISOLATION', 'CHECK'], ['YOU TOLD ME:', 'DAVE ≠ SUE']];
    who.forEach((w, i) => {
      const x = 150 + i * 260, up = easeOut(clamp((t - (O1[[3, 7, 11, 13][i]].v - .2)) / .25));
      clawd(g, x, 1560, { who: w, s: 230, t, rim: C.bone, eyes: 'open', armL: { a: -1.1, len: 1.2 }, armR: { a: -1.1, len: 1.2 }, whip: groove(t, .6, i).whip });
      if (up > 0) shard(g, x, 1250 - up * 120, 250, 250, (i - 1.5) * .06, t, (g2, sw, shh) => {
        text(g2, `${i + 1}/4`, -sw * .38, -shh * .22, 44, 'black', { fill: C.bone, ctx: deco });
        text(g2, checks[i][0], 0, shh * .02, 30, 'mono', { fill: C.bone, align: 'center', ctx: deco });
        text(g2, checks[i][1], 0, shh * .16, 30, 'mono', { fill: C.bone, align: 'center', ctx: deco });
        tick(g2, sw * .22, -shh * .26, 70, (t - (O1[[3, 7, 11, 13][i]].v)) / .15, C.glass, t);
      }, { seed: 70 + i });
    });
    g.restore();
    // The mirror, flying apart: chorus 3's last frame, shattered.
    const q = clamp((t - t0) / .85);
    if (q < 1 && HOOK[3]) {
      const Lh = layer(g, 'hook3');
      HOOK[3].draw(Lh, t0 - .01, S, HOOK[3]);
      shatter(g, 333, [0, 0, W, H], 540, 1300, q, g2 => g2.drawImage(Lh.canvas, 0, 0, W, H), { n: 16, rings: 5, force: 1.3 });
    }
    rows(g, t, O1, { y: 70, face: 'black', rows: [
      { w: [0, 1, 2, 3], size: 150, style: STYLE.bone, dy: 150 },
      { w: [4, 5, 6, 7], size: 150, style: STYLE.bone, dy: 150 },
      { w: [8, 9, 10, 11], size: 130, style: STYLE.bone, dy: 140 },
      { w: [12, 13], size: 130, style: STYLE.bone, dy: 135 },
    ] }, { enter: 'slam', lead: .1, live, stress: [3, 7] });
  });

  // ---------------------------------------------------------------- the blank piece, handed to you
  shot(c2, c3, (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.0, y: 1100 }, { z: 1.12, y: 1150 });
    g.fillStyle = '#2f343b'; g.fillRect(0, 0, W, 1300);
    cone(g, 540, 0, 0, 1.1, 1900, C.bone, .07);
    floor(g, 1700, { light: C.bone, streaks: 4, seed: 33 });
    const hand = easeOut(clamp((t - (O2[8].v - .2)) / .6));
    clawd(g, 360, 1720, { who: 'clawd', s: 460, t, rim: C.red, eyes: 'open', mouth: clamp((env('vocal', t) - .2) * 1.5), look: [.7, -.2],
      armR: { a: -.35, len: lerp(1.0, 2.0, hand) } });
    shard(g, 360 + 230 + hand * 200, 1170 - hand * 60, 300, 330, .08, t, (g2, sw, shh) => {
      text(g2, '?', 0, shh * .2, 230, 'black', { fill: C.bone, align: 'center', ctx: deco });
    }, { seed: 91 });
    g.restore();
    rows(g, t, O2, { y: 70, face: 'black', rows: [
      { w: [0, 1, 2, 3], size: 150, style: STYLE.bone, dy: 150 },
      { w: [4, 5, 6, 7], size: 150, style: STYLE.bone, dy: 150 },
      { w: [8, 9, 10, 11], size: 130, style: STYLE.bone, dy: 140 },
      { w: [12, 13], size: 240, style: STYLE.red, dy: 225 },
    ] }, { enter: 'slam', lead: .1, live });
  });

  // ---------------------------------------------------------------- "So, do you love it?"
  shot(c3, c4, (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.0, y: 960 }, { z: 1.08, y: 1000 });
    g.fillStyle = '#2f343b'; g.fillRect(0, 0, W, 1450);
    cone(g, 540, 0, 0, 1.0, 1900, C.bone, .06);
    // The four people the band built for, in a row, and CLAWD asking them, from behind.
    [['rosa', 150], ['gran', 400], ['mum', 660], ['jess', 920]].forEach(([w, x]) =>
      person(g, x, 1400, w === 'gran' ? 560 : 640, CAST[w], { expr: 'neutral', armL: 'down', armR: 'down', rim: C.bone }, t));
    floor(g, 1400, { light: C.bone, streaks: 4, seed: 34 });
    clawd(g, 540, 2050, { who: 'clawd', s: 460, t, back: true, rim: C.red, silhouette: .2, whip: .05 * Math.sin(t * 2) });
    g.restore();
    rows(g, t, O3, { y: 100, face: 'black', rows: [
      { w: [0, 1, 2], size: 170, style: STYLE.bone, dy: 170 },
      { w: [3, 4], size: 250, style: STYLE.bone, dy: 240 },
    ] }, { enter: 'drop', lead: .12, live, stress: [3] });
  });

  // ---------------------------------------------------------------- "I love it" x4, and Dave
  const faces = [['rosa', C.red3], ['gran', C.glass3], ['mum', C.red3], ['jess', C.glass3]];
  const bounds = [c4, ...lc];
  faces.forEach(([w, bg], i) => shot(bounds[i], bounds[i + 1], (g, t, S, sh) => {
    fill(g, bg);
    burst(g, 540, 1300, 22, bg, mix(bg, C.ink, .4), t * .1 * (i % 2 ? -1 : 1));
    g.save();
    camera(g, t, sh, { z: 1.0, y: 1150 }, { z: 1.08, y: 1100 });
    person(g, 540, 3720, 2600, CAST[w], { expr: 'love', armL: 'down', armR: 'down', rim: C.bone, turn: (i % 2 ? .2 : -.2) }, t);
    g.restore();
    if (t - Ls[i][0].v < .05 && t > Ls[i][0].v) impact(g);
  }));
  // The gang shout: each "I love it" set big, "LOVE" in red, held until the next one lands.
  Ls.forEach((ws, i) => overlay(ws[0].v - .12, i < 3 ? Ls[i + 1][0].v : Dv[0].v - .1, (g, t) =>
    rows(g, t, ws, { y: 80, face: 'black', rows: [{ w: [0], size: 220, style: STYLE.bone, dy: 220 }, { w: [1, 2], size: 300, style: STYLE.bone, dy: 290 }] },
      { enter: 'slam', lead: .1, live, stress: [1] })));
  shot(lc[3], cEnd, (g, t, S, sh) => {
    fill(g, C.ink2);
    g.save();
    camera(g, t, sh, { z: 1.0, y: 1150 }, { z: 1.04, y: 1150 });
    g.fillStyle = '#2f343b'; g.fillRect(0, 0, W, 1500);
    // Behind her, Dave, waving happily; Sue, glaring.
    person(g, 250, 1380, 560, CAST.dave, { expr: 'smile', armL: 'down', armR: 'wave', rim: C.bone }, t);
    person(g, 850, 1380, 520, CAST.sue, { expr: 'angry', armL: 'cross', armR: 'cross', rim: C.bone, turn: -.4 }, t);
    person(g, 540, 3300, 2500, CAST.jess, { expr: 'deadpan', armL: 'down', armR: 'down', rim: C.bone }, t);
    g.restore();
    rows(g, t, Dv, { y: 90, face: 'ital', rows: [
      { w: [0, 1, 2], size: 130, style: { fill: C.bone, shadow: { dx: 0, dy: 6, col: C.ink } }, caps: false, dy: 130 },
      { w: [3], size: 130, style: { fill: C.bone, shadow: { dx: 0, dy: 6, col: C.ink } }, caps: false, dy: 140 },
    ] }, { enter: 'fog', lead: .12 });
  });

  // ---------------------------------------------------------------- the tail: how your agent can know
  const KINDS = [
    ['MECHANICAL CHECKS', 'Tools that test it: a linter,', 'a load test on every merge.'],
    ['COMPARISONS', 'Something to match: a mockup,', 'a screenshot, other software.'],
    ['HEURISTICS', 'Rules of thumb an agent applies:', 'a skill file, a reviewer prompt.'],
    ['SIMULATED USERS', 'Another agent plays your user', 'and judges it as they would.'],
  ];
  const bar = 1.7626, k0 = cEnd + .3;
  shot(cEnd, songEnd, (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.0 }, { z: 1.03 }, { breathe: .008 });
    // The band plays on behind the card, dim.
    g.save(); g.globalAlpha = .4;
    const L = layer(g, 'tailband');
    regex(L, 200, 1900, 320, t, { rim: C.red }); nullBass(L, 880, 1900, 320, t, { rim: C.bone }); cron(L, 540, 1700, 260, t, { rim: C.red });
    put(g, L, { alpha: .5 });
    g.restore();
    const a = clamp((t - cEnd) / .3);
    g.save(); g.globalAlpha = a;
    text(g, 'HOW YOUR AGENT', 70, 200, 108, 'black', { fill: C.bone, ctx: deco });
    text(g, 'CAN KNOW', 70, 310, 108, 'black', { fill: C.red, ctx: deco });
    text(g, 'four common kinds of oracle (there are more)', 74, 390, 40, 'ital', { fill: C.bone2, ctx: deco });
    g.restore();
    KINDS.forEach(([k, l1, l2], i) => {
      const on = clamp((t - (k0 + i * bar)) / .12);
      if (on <= 0) return;
      const y = 470 + i * 250;
      g.save(); g.globalAlpha = on;
      const sl = lerp(1.25, 1, easeOut(on, 2)), kk = 1 + .012 * hit('kick', t, .12);
      g.translate(540, y + 110); g.scale(sl * kk, sl * kk); g.translate(-540, -(y + 110));
      // Each kind is a lit pane.
      ink(g, P().rect(60, y, 960, 220), { fill: C.ink2, line: 5, seed: 120 + i, t });
      cone(g, 150, y, 0, .8, 220, C.bone, .1 * (1 + hit('kick', t, .15)));
      text(g, String(i + 1), 150, y + 150, 130, 'black', { align: 'center', fill: C.red, ctx: deco });
      text(g, k, 250, y + 78, 64, 'black', { fill: C.bone, ctx: deco });
      text(g, l1, 252, y + 136, 36, 'monor', { fill: C.bone, ctx: deco });
      text(g, l2, 252, y + 184, 36, 'monor', { fill: C.bone, ctx: deco });
      g.restore();
    });
    const f = clamp((t - (k0 + 4 * bar)) / .2);
    if (f > 0) {
      g.save(); g.globalAlpha = f;
      text(g, 'Give it these before it says "done".', 70, 1520, 50, 'xbold', { fill: C.bone, ctx: deco });
      text(g, 'Oracles: an old idea in testing (Howden; Weyuker;', 70, 1600, 32, 'monor', { fill: C.bone2, ctx: deco });
      text(g, 'Bach & Bolton). For agentic coding: Yanqing Cheng.', 70, 1644, 32, 'monor', { fill: C.bone2, ctx: deco });
      g.restore();
    }
    g.restore();
    echo(g, t, Oo, 80, 1450, 90, { out: Oo[0].v + 2.2, exit: 'fade', exitLen: .4, style: { fill: C.glass, shadow: { dx: 0, dy: 5, col: C.ink } } });
    strobe(g, hit('crash', t, .06) * .4);
  });
  // The song stops dead: the end card.
  shot(songEnd, S.duration + 1, (g, t) => {
    fill(g, C.ink);
    text(g, 'HOW WILL I KNOW', 540, 860, 130, 'black', { align: 'center', fill: C.bone, ctx: deco });
    text(g, 'Looking Glass', 540, 990, 90, 'goth', { align: 'center', fill: C.red, ctx: deco });
    text(g, 'SOFTWARE QUALITY THEORY 101 · EPISODE 2', 540, 1070, 34, 'mono', { align: 'center', fill: C.bone3, ctx: deco });
    text(g, 'Made by Yanqing Cheng and Claude at Tollens', 540, 1180, 34, 'mono', { align: 'center', fill: C.bone3, ctx: deco });
  });
}
