// The title and the intro, in the theatre.
//  (piano) — the curtain, the title painted on it; Clawd pokes his head through, tips his boater.
//  "Two hundred "tests", each one is green;" — the curtain flies up: Clawd tap-dances in the
//     spotlight; the camera pulls back on three tiers of wind-up checks; on "each one is green"
//     their flags flip up green in a ripple from the centre out.
//  "The finest score you've ever seen!" — from overhead, as in the 1930s musicals: the checks lie
//     on their backs in a giant green tick with Clawd at its corner, and the whole tick turns.
import { W, H, TAU, clamp, lerp, now, hash, beatPos, easeOut, easeInOut, backOut, smooth, rng } from '../kit.js';
import { INK, CREAM, GOLD, GREEN, RED, WHITE, CORAL, TEAL, ROSE, OCHRE } from '../palette.js';
import { shot } from '../shots.js';
import { SPLIT } from '../lyrics.js';
import { theatre, mainCurtain, TH } from '../places.js';
import { clawd, cane } from '../clawd.js';
import { check } from '../crew.js';
import { at, ramp, pop, ease, kick, place, look, cam, floorCam, sparkle, footShadow, confetti, burst } from '../common.js';
import { word, textW, DISPLAY } from '../type.js';
import { bake, wash, light, gloom, paper, inkLine, box } from '../bg.js';
import { stroke, shape, ellipse } from '../ink.js';
import { star } from '../rig.js';

const F = TH.floor, CX = TH.cx, STAGE_Y = 1600;
const fc = (x, z, at2) => floorCam(x, z, F, at2);

// The spotlight: a cone from the flies and a pool on the floor.
function spot(g, x, y, r, a = .5) {
  g.save(); g.globalCompositeOperation = 'screen';
  const cone = g.createLinearGradient(0, y - 1400, 0, y);
  cone.addColorStop(0, 'rgba(255,244,214,0)'); cone.addColorStop(1, `rgba(255,240,205,${a * .45})`);
  g.fillStyle = cone; g.beginPath(); g.moveTo(x - r * .18, y - 1400); g.lineTo(x + r * .18, y - 1400); g.lineTo(x + r, y); g.lineTo(x - r, y); g.closePath(); g.fill();
  const pool = g.createRadialGradient(x, y, 10, x, y, r);
  pool.addColorStop(0, `rgba(255,240,205,${a})`); pool.addColorStop(1, 'rgba(255,240,205,0)');
  g.fillStyle = pool; g.save(); g.translate(x, y); g.scale(1, .28); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.restore();
  g.restore();
}
// The chorus of checks on the risers: positions, back row first.
const RISERS = (() => {
  const out = [], [ox0, ox1] = TH.open;
  TH.tiers.forEach((ty, i) => {
    const inset = (2 - i) * 70, x0 = ox0 + 110 + inset, x1 = ox1 - 110 - inset, n = 9 + i, s = .5 + i * .07;
    for (let k = 0; k < n; k++) out.push({ x: lerp(x0, x1, k / (n - 1)), y: ty + 2, s, tier: i, k, n });
  });
  return out;
})();

// The overhead floor: the stage's planks from above, a pool of light in the middle.
function topFloor() {
  return bake('stageTop', 2800, 3000, (g, w, h) => {
    const cx = w / 2, cy = 1500 - 220;
    // dark polished boards, as the musicals shot them from the flies
    wash(g, box(0, 0, w, h), '#2a1710', { seed: 501, gran: .5, rim: 0, blooms: 30, amt: 0 });
    const R = rng(502);
    for (let x = 0; x < w; x += 92) { inkLine(g, [[x, 0], [x, h]], { w: 2.4, a: .55, gap: 0, col: '#120804' }); for (let y = R() * 400; y < h; y += 300 + R() * 300) inkLine(g, [[x, y], [x + 92, y]], { w: 1.8, a: .45, gap: 0, col: '#120804' }); }
    // the shine of the polish: long soft streaks
    g.save(); g.globalCompositeOperation = 'screen'; g.filter = 'blur(18px)';
    for (let i = 0; i < 14; i++) { const x = R() * w; g.fillStyle = `rgba(255,214,160,${.04 + R() * .05})`; g.fillRect(x, 0, 30 + R() * 60, h); }
    g.restore();
    // the spotlight's pool, hard-edged as a theatre spot is, and its glow
    light(g, cx, cy, 700, '#ffcf8a', .2);
    g.save(); g.globalCompositeOperation = 'screen';
    const pool = g.createRadialGradient(cx, cy, 330, cx, cy, 470);
    pool.addColorStop(0, 'rgba(255,226,170,.55)'); pool.addColorStop(.85, 'rgba(255,226,170,.5)'); pool.addColorStop(1, 'rgba(255,226,170,0)');
    g.fillStyle = pool; g.beginPath(); g.arc(cx, cy, 470, 0, TAU); g.fill(); g.restore();
    // four smaller spots out in the dark, in a ring
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + .5; light(g, cx + Math.cos(a) * 1050, cy + Math.sin(a) * 1050, 220, '#ffd8a0', .3); }
    gloom(g, w, h, cx, cy, 480, 1300, '#060302', .92);
    paper(g, w, h, .35);
  });
}
// Where each check lies in the giant tick (overhead, screen coordinates around the frame's centre).
const TICK = (() => {
  const out = [], V = [520, 980], A = [300, 770], B = [930, 420];
  const along = (p, q, n, row) => { for (let i = 0; i < n; i++) { const u = (i + .5) / n, nx = -(q[1] - p[1]), ny = q[0] - p[0], L = Math.hypot(nx, ny); out.push({ x: lerp(p[0], q[0], u) + nx / L * row * 62, y: lerp(p[1], q[1], u) + ny / L * row * 62 }); } };
  along(A, V, 5, -.5); along(A, V, 5, .5); along(V, B, 10, -.5); along(V, B, 10, .5);
  return out;
})();

export function register() {
  const A = 'Two hundred "tests"', B = 'The finest score';
  const tTwo = at(A, 'Two'), tHund = at(A, 'hundred'), tTests = at(A, 'tests'), tEach = at(A, 'each'), tGreen = at(A, 'green');
  const tThe = at(B, 'The'), tFinest = at(B, 'finest'), tScore = at(B, 'score'), tEver = at(B, 'ever'), tSeen = at(B, 'seen');
  const tUp = 2.28, tCut = 7.62, tEnd = 12.74;

  // ---- the title on the curtain, and Clawd peeking through
  shot(0, tUp + .6, (g, T) => {
    const c = cam([[0, fc(CX, .86, 1180)], [tUp, fc(CX, .9, 1180)], [tUp + .6, fc(CX, 1.3, 1100)]], T), t = now();
    g.save(); place(g, theatre(), c);
    spot(g, CX, STAGE_Y, 300, ramp(t, tUp, .3) * .6);
    const lift = easeInOut(ramp(t, tUp, .36));
    mainCurtain(g, lift, t);
    // Clawd out front of the curtain from the first frame: he watches the title land word by word,
    // tips his boater on the piano's run, winks, and steps back as the curtain flies
    {
      const look = [.18, .45, .71, .98, 1.26].filter(x => t >= x - .1).length;
      const lx = [-.6, .4, 0, -.4, .5, 0][look], ly = -.9;
      clawd(g, CX, F, 1.05, { t, dance: .5, L: t > tUp ? 'jazz' : 'hips', R: t > tUp ? 'jazz' : t > 1.45 ? { to: [.06, -.62], pose: 'grip' } : 'present', eyes: { expr: t > tUp ? 'happy' : t > 1.95 && t < 2.15 ? 'smug' : 'open', lx: t > tUp ? 0 : lx, ly: t > tUp ? 0 : ly }, hatTip: kick(t, 1.53, .4) * .8, smile: 1 });
    }
    // the title, painted on the curtain in gold: it rises with it
    if (lift < .98) titleCard(g, t, lift);
    g.restore();
  }, { id: 'title' });

  // ---- Two hundred "tests", each one is green
  shot(tUp + .6, tCut, (g, T) => {
    const c = cam([[tUp + .6, fc(CX, 1.3, 1100)], [tHund, fc(CX, 1.18, 1100)], [tTests + .35, fc(CX, .8, 1100)], [tCut, fc(CX, .76, 1100)]], T), t = now();
    g.save(); place(g, theatre(), c);
    for (const r of RISERS) {
      const d = Math.abs(r.x - CX) / 700 + (2 - r.tier) * .08;
      const up = clamp((t - (tEach + d * (tGreen - tEach + .1))) / .18);
      const hop = kick(t, tTests + r.k * .02, .2) * .5;
      check(g, r.x, r.y, r.s, { t, flag: up, flagCol: GREEN, wave: up > .9, phase: r.k * .7 + r.tier, hop, seed: r.k });
    }
    spot(g, CX, STAGE_Y, 300, .6);
    footShadow(g, CX, STAGE_Y, 320, .45);
    const spin = t > tHund && t < tTests ? (t - tHund) / (tTests - tHund) : 0;
    const k = clawd(g, CX, STAGE_Y, 1, { t, dance: .9,
      L: t < tTests ? 'up' : t < tEach ? 'hips' : 'jazz', R: t < tTests ? { to: [.3, -.25], pose: 'grip' } : t < tEach ? { to: [.62, -.42], pose: 'grip' } : 'jazz',
      hold: { R: t < tEach ? (g, x, y, a, s) => cane(g, x, y, t < tTests ? 1.6 + spin * TAU : -.4, s) : null },
      eyes: { expr: t > tGreen ? 'happy' : 'open', lx: t > tTests && t < tEach ? .6 : 0, ly: t > tTests && t < tEach ? -.5 : 0 }, sing: true, kick: t > tGreen ? kick(t, tGreen, .4) : 0, hatTip: kick(t, tGreen + .2, .4) * .6 });
    if (t > tGreen) sparkle(g, CX, STAGE_Y - 160, 260, t, 6, GOLD, 21);
    g.restore();
  }, { id: 'intro-stage' });

  // ---- The finest score you've ever seen: the tick, from overhead
  shot(tCut, tEnd, (g, T) => {
    // the camera turns and pulls back on every frame; the drawings change on twos
    const rot = (T > tEver ? easeInOut(ramp(T, tEver, tEnd - tEver)) * .9 : 0) + (T > 12.3 ? (T - 12.3) * (T - 12.3) * 6 : 0);
    const z = lerp(1.06, .94, ramp(T, tCut, tEnd - tCut)), t = now();
    g.save(); g.translate(W / 2, 780); g.rotate(rot); g.scale(z, z); g.translate(-W / 2, -780);
    g.drawImage(topFloor(), W / 2 - 1400 + 50, 720 - 1280);
    // the checks slide in from their rows to the tick, lying on their backs
    const form = easeInOut(ramp(t, tCut + .1, tScore - tCut - .05));
    TICK.forEach((p, i) => {
      const R = rng(700 + i), sx = lerp(80, 1000, R()), sy = lerp(260, 1240, R());
      const x = lerp(sx, p.x, form), y = lerp(sy, p.y, form) - Math.sin(form * Math.PI) * 30;
      g.save(); g.globalAlpha = .45; g.fillStyle = '#000'; g.filter = 'blur(6px)'; g.beginPath(); g.ellipse(x + 10, y + 50, 40, 46, 0, 0, TAU); g.fill(); g.restore();
      check(g, x, y + 60, .52, { t, flag: 1, flagCol: GREEN, wave: true, phase: i * .5, seed: i });
    });
    // Clawd at the corner, on his back, waving up at us
    clawd(g, 520, 1060, .62, { t, L: 'up', R: 'wave', eyes: { expr: t > tSeen ? 'happy' : 'open', ly: -.6 }, sing: true, dance: .4 });
    g.restore();
    if (t > tScore) { const p = (t - tScore) / .5; burst(g, 520, 780, 380, p, 14, GOLD, 31); }
    if (t > tSeen) { confetti(g, t, tSeen, 70, { seed: 41 }); for (const [fx, fy, ft] of [[250, 420, tSeen + .2], [820, 330, tSeen + .7], [560, 250, tSeen + 1.2]]) { const p = (t - ft) / .9; if (p > 0 && p < 1) { burst(g, fx, fy, 120, p, 16, [GOLD, CORAL, TEAL][Math.floor(ft) % 3], 50 + ft); star(g, fx, fy, 22 * (1 - p), GOLD, { seed: 60 }); } } }
  }, { id: 'intro-tick' });
}

// The title, lettered in gold on the curtain: it drops in word by word on the piano's notes and
// rides up as the curtain flies.
function titleCard(g, t, lift) {
  if (typeof window !== 'undefined') window.__textTag = 'title';
  const rows = [['Did', 'You'], ['Actually'], ['Test', 'It?']], sizes = [150, 170, 190];
  const y0 = 640 - lift * 1300, wx = TH.cx;
  let wi = 0;
  rows.forEach((row, ri) => {
    const size = sizes[ri], sp = textW(g, ' ', DISPLAY, size) * 1.3;
    const total = row.reduce((a, w) => a + textW(g, w, DISPLAY, size), 0) + sp * (row.length - 1);
    let x = wx - total / 2;
    for (const w of row) {
      const ww = textW(g, w, DISPLAY, size), note = [.18, .45, .71, .98, 1.26][wi], since = t - note, p = 1;
      const hop = since > -.1 && since < .22 ? Math.sin(clamp((since + .1) / .32) * Math.PI) : 0;
      if (p > 0) {
        const y = y0 + ri * size * 1.02 - hop * 26;
        g.save(); g.globalAlpha *= 1 - clamp(lift * 1.6); g.translate(x + ww / 2, y); g.rotate(Math.sin(wi * 1.7) * .03); g.scale(1 + hop * .06, 1 - hop * .04);
        word(g, w, -ww / 2, 0, size, DISPLAY, { fill: '#f3c94e', ink: '#3a1004', shadow: '#2a0806', sh: .06, ow: .12, seed: 900 + wi });
        g.restore();
      }
      x += ww + sp; wi++;
    }
  });
  if (typeof window !== 'undefined') window.__textTag = null;
}
