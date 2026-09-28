// Verse 2: the answers. "Give me a tool to run on every merge to check the load / I'll prompt a
// bot to act as Gran, make sure she can go / An isolation check to find the things that
// shouldn't show / But as for Dave and Sue, you really had to let me know!"
// Each oracle is a lamp switched on over a pane on the far side, so the band can see through it,
// and see the place checked: simulated customers flooding the bakery's till; NULL, who didn't
// build the app, in Gran's cardigan booking her check-up; the families' messages sealed in their
// own boxes, a light sweeping them. The last can't be a lamp: only you knew about Dave and Sue,
// so your hand presses a note to the glass.
import { C, W, H, TAU, clamp, lerp, easeOut, easeIn, env, hit, noise, rgba, hash } from '../kit.js';
import { fill, layer, put, cone } from '../world.js';
import { pane } from '../glass.js';
import { shot, overlay } from '../shots.js';
import { words, sing, rows, echo, STYLE } from '../lyric.js';
import { text } from '../type.js';
import { singer } from '../playing.js';
import { clawd } from '../clawd.js';
import { P, ink, gpen } from '../pen.js';
import { BRIEFS, plate, bakery, clinic, school, wedding, screen, deco } from '../places.js';
import { chug } from './verse1.js';

// The oracle's lamp: a stage light on the far side, its cone into the pane, and a tag.
function lamp(g, t, on, x, tag) {
  const p = clamp((t - on) / .08);
  if (p <= 0) return;
  cone(g, x, 700, 0, .9, 1200, C.bone, .09 * p, 3);
  ink(g, P().poly([[x - 70, 632], [x + 70, 632], [x + 52, 706], [x - 52, 706]]), { fill: C.ink2, line: 5, seed: 7, t });
  g.fillStyle = p > .5 ? C.bone : C.ink3; g.fillRect(x - 46, 700, 92, 12);
  // The tag hangs from the lamp on a string.
  gpen(g, [[x + 60, 690], [x + 110, 760]], 3, { col: C.bone2, t, seed: 8 });
  g.save(); g.translate(x + 110, 760); g.rotate(Math.sin(t * 2.3) * .06);
  const w = Math.max(220, tag.length * 22);
  ink(g, P().rect(-20, 0, w, 64), { fill: C.bone, line: 4, seed: 9, t });
  text(g, tag, -2, 44, 32, 'mono', { fill: C.ink, ctx: deco });
  g.restore();
}

// NULL, playing Gran: a bot in her cardigan, glasses and a white bun, on her old phone.
function granBot(g, t) {
  return (gg, x, y) => {
    clawd(gg, x, y, { who: 'null', s: 380, t, dress: 'gran', noHair: true, eyes: 'narrow', rim: C.bone, light: { x: .5, y: -.8 },
      armR: { a: -.9, len: 1.4 }, holdR: (g2, u) => { ink(g2, P().rect(-u * .3, -u * 1.2, u * .75, u * 1.3), { fill: C.ink, line: 3, seed: 3 }); g2.fillStyle = C.glass; g2.fillRect(-u * .22, -u * 1.1, u * .6, u * 1.1); } });
    const u = 380 / 6, top = y - (.72 + 1.05 + 4) * u;
    ink(gg, P().S([[x - 3.2 * u, top + .6 * u], [x - 2.8 * u, top - 1.2 * u], [x, top - 1.8 * u], [x + 2.8 * u, top - 1.2 * u], [x + 3.2 * u, top + .6 * u], [x, top - .2 * u]], true), { fill: C.bone, line: 4, seed: 5, t, shade: { dx: .3 * u, dy: -.3 * u, col: C.bone2 } });
    ink(gg, P().ell(x, top - 2.1 * u, 1.1 * u, .9 * u), { fill: C.bone, line: 4, seed: 6, t, shade: { dx: .2 * u, dy: -.2 * u, col: C.bone2 } });
  };
}

export function register(S) {
  const W1 = words('Verse 2', 'Give me a tool'), W2 = words('Verse 2', "I'll prompt"), W3 = words('Verse 2', 'An isolation'), W4 = words('Verse 2', 'But as for');
  const ohs = [0, 1, 2].map(i => words('Verse 2', 'ohhh', i));
  const lines = [
    [W1, 'bakery', [[0, 1, 2, 3], [4, 5, 6, 7, 8], [9, 10, 11, 12]], [3, 8, 12], 'LOAD TEST: EVERY MERGE'],
    [W2, 'clinic', [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11, 12]], [3, 7], 'PROMPT: ACT AS GRAN, 82'],
    [W3, 'school', [[0, 1, 2], [3, 4, 5, 6], [7, 8, 9]], [1, 2], 'ISOLATION CHECK'],
    [W4, 'wedding', [[0, 1, 2], [3, 4, 5], [6, 7, 8, 9], [10, 11, 12]], [3, 5, 7], null],
  ];
  const starts = [W1[0].v - .05, W2[0].v - .1, W3[0].v - .1, W4[0].v - .1, W4[12].v + .6];
  lines.forEach(([ws, place, rowIdx, stress, tag], i) => {
    const a = starts[i], b = starts[i + 1];
    shot(a, b, (g, t, S, sh) => {
      fill(g, C.ink);
      const F = layer(g, 'place2');
      F.save(); F.translate(0, 630);
      const z = lerp(1, 1.12, (t - a) / (b - a)) * (1 + .012 * hit('kick', t, .1));
      const px = lerp(-30, 30, (t - a) / (b - a)) * (i % 2 ? -1 : 1) + noise(t * .5, i) * 12;
      F.translate(540 + px, 700 + noise(t * .4, i + 9) * 10); F.scale(z, z); F.translate(-540, -700);
      if (place === 'bakery') bakery(F, t, 'checked');
      if (place === 'clinic') clinic(F, t, 'checked', { bot: granBot(g, t) });
      if (place === 'school') school(F, t, 'checked');
      if (place === 'wedding') wedding(F, t, t > ws[6].v ? 'fine' : 'broken');
      // The isolation check: a line of light sweeping the sealed boxes.
      if (place === 'school') {
        const sx = ((t - a) / (b - a)) * 1200 - 60;
        F.fillStyle = rgba(C.bone, .35); F.fillRect(sx, 0, 26, 1400);
        F.fillStyle = rgba(C.glass, .2); F.fillRect(sx - 90, 0, 90, 1400);
      }
      F.restore();
      // Lit steadily this time: the oracle's lamp is on.
      const on = clamp((t - (ws[0].v - .05)) / .1);
      put(g, F, { alpha: .1 + .9 * on, clip: [20, 560, 1040, 1360] });
      const R = layer(g, 'ghost2');
      singer(R, 560, 2250, 1250, t, { rim: C.red, eyes: 'open' });
      put(g, R, { alpha: .1, op: 'screen', clip: [20, 560, 1040, 1360] });
      if (tag) lamp(g, t, ws[0].v - .05, 300, tag);
      pane(g, 20, 560, 1040, 1360, { a: .03, n: 2, seed: 70 + i, glintA: .25 });
      g.fillStyle = C.steel2;
      g.fillRect(0, 548, W, 12); g.fillRect(0, 548, 20, 1372); g.fillRect(1060, 548, 20, 1372);
      // Whose brief this is: the plate, and the Clawd who built it, watching over his shoulder.
      const bf = BRIEFS[i];
      clawd(g, bf.who === 'regex' || bf.who === 'null' ? 930 : 150, 2300, { who: bf.who, s: 420, t, back: true, silhouette: .85, rim: bf.who === 'null' ? C.bone : C.red, whip: .06 * Math.sin(t * 3) });
      plate(g, bf, 560);
      // Dave and Sue: your hand, and your note on the glass.
      if (place === 'wedding') {
        const p = easeOut(clamp((t - (ws[3].v - .25)) / .3));
        if (p > 0) {
          g.save(); g.translate(0, (1 - p) * 700);
          g.rotate(-.05);
          ink(g, P().rect(250, 800, 600, 420), { fill: '#f4ecd0', line: 5, seed: 11, t, shade: { dx: 12, dy: -12, col: C.bone2 } });
          text(g, 'Dave + Sue', 290, 930, 88, 'hand', { fill: C.ink, ctx: deco });
          text(g, 'NOT the same', 290, 1040, 80, 'hand', { fill: C.red, ctx: deco });
          text(g, 'table!!', 290, 1140, 80, 'hand', { fill: C.red, ctx: deco });
          // Your hand, holding it to the glass.
          ink(g, P().S([[640, 1180], [760, 1120], [860, 1160], [900, 1300], [840, 1420], [700, 1440], [620, 1330]], true), { fill: '#d9a882', line: 5, seed: 12, t, shade: { dx: -14, dy: -14, col: '#a8775a' } });
          for (let f = 0; f < 4; f++) ink(g, P().S([[660 + f * 55, 1150], [700 + f * 55, 1090], [735 + f * 55, 1100], [715 + f * 55, 1170]], true), { fill: '#d9a882', line: 4, seed: 13 + f, t });
          g.restore();
        }
      }
      rows(g, t, ws, { y: rowIdx.length > 3 ? 50 : 62, face: 'black', maxW: 980, rows: rowIdx.map(r => ({ w: r, size: rowIdx.length > 3 ? 108 : 118, style: STYLE.bone, dy: rowIdx.length > 3 ? 112 : 124 })) },
        { enter: 'stamp', lead: .09, live: chug, stress });
    });
  });
  ohs.forEach(ow => overlay(ow[0].v - .14, ow[0].v + 1.0, (g, t) => {
    echo(g, t, ow, 1030, 500, 96, { align: 'right', style: { fill: C.glass, shadow: { dx: 0, dy: 6, col: C.ink } } });
  }));
}
