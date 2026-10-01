// Intro: "Two hundred "tests", each one is green; / The finest score you've ever seen!"
// The town square. Clawd, drum major of a parade of two hundred identical wind-up checks; on "green"
// their flags flip up in a ripple; the clock tower turns into a scoreboard reading 200/200; on the held
// "seen" he takes his bow in fireworks, and a rose-coloured hand with a magnifying glass creeps in.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, beatPos } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, GOLD, GREEN, WHITE, RED } from '../palette.js';
import { shot, irisJoin, wipeJoin } from '../shots.js';
import { townSquare } from '../paint.js';
import { clawd, cane } from '../clawd.js';
import { magnifier } from '../props.js';
import { shape, rrect, ellipse, stroke } from '../ink.js';
import { label, word, DISPLAY, PATTER } from '../type.js';
import { at, ramp, pop, ease, kick, stampCheck, confetti, burst, sparkle } from '../common.js';

export function square(g, c = {}) {
  const z = c.z ?? 1, x = c.x ?? W / 2, y = c.y ?? H / 2;
  g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-x, -y);
  g.drawImage(townSquare(), -160, 100);
}
// The clock face at (x, y) turning into a scoreboard as p goes 0 → 1.
export function scoreboard(g, x, y, p, text, t, o = {}) {
  const flip = Math.abs(Math.cos(clamp(p) * Math.PI));
  const showBoard = p > .5;
  g.save(); g.translate(x, y); g.scale(1, Math.max(.02, flip));
  if (!showBoard) return g.restore();
  shape(g, ellipse(0, 0, 118, 118, 0, 48), { fill: INK, w: 8, seed: 3101 });
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * 2; const on = (Math.floor(t * 8) + i) % 2; shape(g, ellipse(Math.cos(a) * 100, Math.sin(a) * 100, 8, 8), { fill: on ? GOLD : '#7a5a20', w: 2, seed: 3102 + i, amt: .2 }); }
  label(g, text, 0, -6, o.size || 70, { font: DISPLAY, col: o.col || GREEN, ow: .18, ink: INK });
  if (o.sub) label(g, o.sub, 0, 52, 30, { font: PATTER, col: CREAM });
  g.restore();
}
// The formation: rows of checks receding; `up(row, i)` gives each flag's raise (0..1).
export function formation(g, t, up, o = {}) {
  const rows = o.rows ?? 10, cols = o.cols ?? 20;
  for (let r = rows - 1; r >= 0; r--) {
    const k = r / (rows - 1);                         // 0 front, 1 back
    const y = lerp(1560, 1210, Math.pow(k, .8)), s = lerp(.62, .26, Math.pow(k, .7));
    const span = lerp(1500, 760, k);
    for (let i = 0; i < cols; i++) {
      const x = W / 2 + (i - (cols - 1) / 2) * span / (cols - 1);
      if (o.gap && Math.abs(x - W / 2) < o.gap * s && r < 2) continue;
      const u = up(r, i);
      const flag = u > .5 ? 'up-green' : 'down';
      stampCheck(g, x, y + (u > 0 && u < 1 ? -Math.sin(u * Math.PI) * 30 * s : 0), s, flag, t, o.unison ? 0 : (i * .13 + r * .21), '✓');
    }
  }
}

export function register() {
  const L1 = 'Two hundred', L2 = 'The finest score';
  const tTwo = at(L1, 'Two'), tHund = at(L1, 'hundred'), tTests = at(L1, 'tests'), tEach = at(L1, 'each'), tGreen = at(L1, 'green');
  const tFinest = at(L2, 'finest'), tScore = at(L2, 'score'), tSeen = at(L2, 'seen');
  const ws2 = wordsOf(L2), seenEnd = ws2[ws2.length - 1].e;
  const verse = at('My "tests"', 'My');
  const end = verse - .05;
  shot(tTwo - .12, end, (g, t) => {
    // camera: from close on Clawd, pulling out to reveal the formation; pushing back in for the bow
    const pull = ease(t, tHund, 1.4), push = ease(t, tSeen + .6, 1.8);
    const z = lerp(lerp(1.75, 1, pull), 1.04, push), cx = W / 2, cy = lerp(lerp(1420, 980, pull), 1030, push);
    g.save();
    square(g, { z, x: cx, y: cy });
    // the scoreboard on the tower
    const sb = ramp(t, tScore - .1, .35);
    scoreboard(g, W / 2, 860, sb, '200/200', t, { size: 58, sub: 'ALL GREEN!' });
    // the formation: flags up in a ripple from the front on "green"
    formation(g, t, (r, i) => clamp((t - tGreen - r * .045 - Math.abs(i - 9.5) * .012) / .18), { gap: 260, unison: t > tGreen + 1 });
    // Clawd, the drum major
    const dance = t > tFinest ? 1 : .6;
    const bow = t > tSeen + .2;
    const kickL = kick(t, tHund, .3), kickG = kick(t, tGreen, .3);
    clawd(g, W / 2, 1720, 1.05, {
      t, dance,
      L: t < tEach ? { to: [.55, -.45], pose: 'point' } : bow ? 'up' : 'cheer',
      R: { to: [.28, -.1 - kickG * .3], pose: 'grip' },
      hold: { R: (g, x, y, a, s) => cane(g, x, y, bow ? -1.2 : 1.2 - kickL * .6, s) },
      eyes: { expr: t < tGreen ? 'open' : 'happy', lx: t < tEach ? -.5 : 0 }, sing: true,
      hatTip: bow ? clamp((t - tSeen - .2) / .3) : 0, jump: kickG * .4,
    });
    // fireworks over the square on "score" and "seen"
    for (const [ft, fx, fy, col] of [[tScore, 300, 700, CORAL], [tScore + .35, 800, 640, GOLD], [tSeen + .3, 220, 560, TEAL], [tSeen + .7, 880, 520, ROSE], [tSeen + 1.2, 540, 480, GOLD]]) {
      const p = (t - ft) / .8;
      if (p > 0 && p < 1) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; const r = 40 + p * 150; shape(g, ellipse(fx + Math.cos(a) * r, fy + Math.sin(a) * r + p * p * 60, 10 * (1 - p) + 3, 10 * (1 - p) + 3), { fill: col, w: 2.5, seed: 3200 + i, amt: .2 }); }
    }
    sparkle(g, W / 2, 1400, 420, t, t > tSeen ? 8 : 0, GOLD, 31);
    g.restore();
    // a rose hand with a magnifying glass creeps in at the right as the note holds
    const peek = ease(t, seenEnd - 1.4, .7) * (1 - ease(t, seenEnd - .15, .25));
    if (peek > 0) {
      const hx = W + 90 - peek * 330, hy = 1180;
      stroke(g, [[W + 120, hy + 60], [hx + 40, hy + 20]], { w: 14, seed: 3301 });
      magnifier(g, hx, hy, -2.6, 1.1, { inside: (g, x, y, r) => { g.fillStyle = '#f8f0dc'; g.fillRect(x - r, y - r, 2 * r, 2 * r); label(g, '?', x, y + 4, 110, { font: DISPLAY, col: ROSE, ow: .12 }); } });
    }
  }, { id: 'intro' });
}
