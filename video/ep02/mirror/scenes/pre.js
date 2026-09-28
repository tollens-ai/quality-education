// Pre-chorus 1: "You can tell me it's broken, but how will I know for myself? (for myself?) / So
// baby now I'm hoping, that you can give me something else (something else) (something else)".
// CLAWD alone at the mirror. You tell him it's broken with a knock on the glass from the dark
// side, where he can't see you; he asks how he'll know for himself, and his reflection, not he,
// sings the echo back. He presses his claw to the glass and it presses back. Then the echoes run
// away down an infinity mirror, and the camera falls into it.
import { C, W, H, clamp, lerp, smooth, easeOut, easeIn, env, hit, noise, twos, rgba } from '../kit.js';
import { clawd } from '../clawd.js';
import { gpen, P, ink } from '../pen.js';
import { fill, cone, floor, layer, put, strobe } from '../world.js';
import { mirrorEdge, pane, reflected, crack } from '../glass.js';
import { shot, camera } from '../shots.js';
import { words, sing, rows, echo, STYLE } from '../lyric.js';
import { stageWide } from './stage.js';
import { person, stranger } from '../people.js';
import { CAST } from '../places.js';
import { kickback } from '../type.js';
import { groove } from '../playing.js';

const mouthOf = t => clamp((env('vocal', t) - .22) * 1.5);
const liveKick = (tt, w) => kickback(tt, w.v, 4, .08);

// A human fist in silhouette, knuckles to the glass, from the viewer's side: four curled
// fingers, the thumb across them, the forearm running out of frame.
function fist(g, x, y, s, rim) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-.35);
  const R = { dx: -9, dy: 7, col: rim };
  ink(g, P().poly([[-60, 60], [70, 60], [150, 520], [-120, 520]]), { fill: C.ink2, line: 5, rim: R, seed: 3 });
  ink(g, P().S([[-110, -30], [-80, -95], [60, -100], [110, -40], [115, 60], [70, 110], [-80, 110], [-120, 50]]), { fill: C.ink2, line: 5, rim: R, seed: 5 });
  // Curled fingers: four rounded blocks with a knuckle each, facing us.
  for (let i = 0; i < 4; i++) {
    const fx = -100 + i * 52;
    ink(g, P().S([[fx, -70], [fx + 46, -74], [fx + 50, 5], [fx + 44, 40], [fx + 4, 42], [fx - 2, 5]]), { fill: C.ink2, line: 4.5, rim: i === 0 ? R : null, seed: 7 + i });
    gpen(g, [[fx + 10, -40], [fx + 38, -42]], 4, { col: C.ink3, taper: [.3, .3], seed: 20 + i });
  }
  // The thumb, wrapped across the fingers.
  ink(g, P().S([[-118, 30], [-40, 18], [30, 26], [40, 58], [-30, 70], [-112, 66]]), { fill: C.ink2, line: 4.5, rim: R, seed: 30 });
  g.restore();
}

export function register(S) { prechorus(1, S); prechorus(2, S); prechorus(3, S); }

// k: which pre-chorus. Each lets more light through the glass: in the second, lamps are on your
// side, so when you knock CLAWD finds your eyes and his reflection is fainter; in the third, you
// are visible, his reflection is almost gone, and his claw meets your hand through the glass.
export function prechorus(k, S) {
  const sec = 'Pre-chorus ' + k;
  const A = words(sec, 'You can tell');
  const E = words(sec, 'for myself');
  const B = words(sec, 'So baby');
  const E2 = words(sec, 'something else', 0);
  const E3 = k < 3 ? words(sec, 'something else', 1) : null;
  const next = words('Chorus ' + k, 'How do I')[0].v - .45;
  const t0 = { 1: 28.3, 2: 74.32, 3: 116.675 }[k];
  const tB = A[6].v - .05, tC = B[0].v - .12, tD = k === 1 ? E2[0].v - .1 : k === 2 ? E3[0].v - .1 : B[11].v + .45, tEnd = next;
  const lit = { 1: 0, 2: .35, 3: .8 }[k];      // how much light is on your side
  const ghost = { 1: 1, 2: .6, 3: .22 }[k];    // how strong the reflection still is

  // ---------------------------------------------------------------- A: "You can tell me it's broken"
  // From your side of the glass, in the dark: you can see CLAWD; he can only see himself.
  shot(t0, tB, (g, t, S, sh) => {
    fill(g, C.ink);
    const knock = A[5].v;
    g.save();
    camera(g, t, sh, { z: 1.0, y: 980 }, { z: 1.07, y: 960 }, { shake: 0 });
    const [kx, ky] = t > knock ? [noise(t * 50, 1) * 18 * Math.exp(-(t - knock) / .12), noise(t * 50, 2) * 18 * Math.exp(-(t - knock) / .12)] : [0, 0];
    g.translate(kx, ky);
    // His side is lit: a red spot from above, the lacquer floor.
    cone(g, 540, 380, 0, .75, 1300, C.red, .08);
    floor(g, 1490, { light: C.red, streaks: 4, seed: 7 });
    // He hears the knock and looks for you, but his eyes land on his own reflection.
    const heard = t > knock + .05;
    clawd(g, 540, 1490, { who: 'clawd', s: 420, t, rim: C.red, light: { x: -.4, y: -.9 },
      eyes: heard ? (k > 1 ? 'wide' : 'wide') : 'open', look: heard ? (k > 1 ? [.05, .25] : [.35, -.1]) : [0, 0], mouth: mouthOf(t),
      whip: heard ? .12 * Math.exp(-(t - knock) / .3) : .04 * noise(t, 2) });
    g.restore();
    // Your side is lit a little more each time: lamps behind you.
    if (lit > 0) { g.save(); g.globalAlpha = lit * .5; cone(g, 900, 1920, Math.PI, .7, 1400, C.bone, .12); g.restore(); }
    // The glass between us: its film, a crack where the fist lands, and the fist.
    pane(g, 0, 0, W, H, { a: .05, n: 3, seed: 2, glintA: .22 });
    crack(g, 17 + k, 720, 1170, 300, (t - knock) / .16, { w: 3.6 });
    const reach = easeIn(clamp((t - (knock - .22)) / .22), 2);
    const recoil = t > knock ? easeOut(clamp((t - knock) / .5)) : 0;
    if (reach > 0) fist(g, lerp(1250, 800, reach) + recoil * 120, lerp(1780, 1250, reach) + recoil * 160, lerp(1.9, 1.35, reach), k === 3 ? C.bone : C.red);
    // The words, on the glass.
    rows(g, t, A, { y: 330, face: 'black', rows: [
      { w: [0, 1, 2, 3], size: 150, style: STYLE.bone },
      { w: [4], size: 150, style: STYLE.bone },
    ] }, { enter: 'drop', lead: .1, live: liveKick });
    // "BROKEN" lands with the knock and splits along the crack.
    const bw = A[5];
    if (t >= bw.v - .1) {
      const size = 240, y = 700;
      const split = easeOut((t - bw.v) / .25) * 22;
      for (const half of [0, 1]) {
        g.save();
        g.beginPath();
        if (half) { g.moveTo(-100, 520); g.lineTo(1200, 720); g.lineTo(1200, 2000); g.lineTo(-100, 2000); }
        else { g.moveTo(-100, 520); g.lineTo(1200, 720); g.lineTo(1200, -100); g.lineTo(-100, -100); }
        g.closePath(); g.clip();
        g.translate(half ? split * .5 : -split * .5, half ? split : -split * .3);
        sing(g, t, bw, 540, y, size, 'black', { enter: 'slam', lead: .1, align: 'center', style: { ...STYLE.red, outlineK: .06, noAudit: !!half } });
        g.restore();
      }
    }
  });

  // ---------------------------------------------------------------- B: "but how will I know for myself?"
  shot(tB, tC, (g, t, S, sh) => {
    fill(g, C.ink);
    const echoOn = E[0].v;
    g.save();
    camera(g, t, sh, { z: 1.0 }, { z: 1.05 }, { breathe: .02 });
    // Two faces at the glass: CLAWD singing on the left, his reflection on the right, which takes
    // over the echo while CLAWD falls silent.
    g.fillStyle = C.red3; g.fillRect(0, 720, 540, 1300);
    g.fillStyle = C.glass3; g.fillRect(540, 720, 540, 1300);
    cone(g, 270, 720, 0, .9, 1200, C.red, .1);
    cone(g, 810, 720, 0, .9, 1200, C.glass, .07);
    reflected(g, 540, 1, (g2, mir) => {
      const echoing = t >= echoOn - .05 && t < E[1].v + .45;
      if (mir) g2.globalAlpha = ghost;
      clawd(g2, 262, 1690, {
        who: 'clawd', s: 440, t, rim: mir ? C.glass : C.red, light: { x: -.4, y: -.9 },
        eyes: mir ? 'narrow' : (echoing ? 'wide' : 'sad'), tears: mir ? 0 : .4 + .6 * clamp((t - tB) / 1.5),
        mouth: mir ? (echoing ? clamp(env('vocal', t) * 1.3) * .8 + .15 : 0) : (echoing ? 0 : mouthOf(t)),
        look: [.7, -.1], whip: (mir ? .03 : .06 * noise(t * 2, 1)) + groove(t, .5).whip * .4, tilt: groove(t, .4).tilt,
      });
    });
    mirrorEdge(g, 540, 640, 1920, { w: 18 });
    pane(g, 549, 720, 531, 1200, { a: .08, n: 2, seed: 9 });
    g.restore();
    rows(g, t, A, { y: 250, face: 'black', rows: [
      { w: [6, 7, 8, 9, 10], size: 150, style: STYLE.bone },
      { w: [11, 12], size: 196, style: STYLE.red },
    ] }, { enter: 'drop', lead: .1, live: liveKick });
    const ey = 640;
    const ea = Math.max(.55, ghost);
    sing(g, t, E[0], 1020, ey, 104, 'xital', { enter: 'flip', lead: .14, align: 'right', caps: false, str: 'for', style: { fill: null, hollow: { w: 5, col: C.glass }, alpha: ea } });
    sing(g, t, E[1], 1020, ey + 104, 104, 'xital', { enter: 'flip', lead: .14, align: 'right', caps: false, str: 'myself?', style: { fill: null, hollow: { w: 5, col: C.glass }, alpha: ea } });
  });

  // ---------------------------------------------------------------- C: "So baby now I'm hoping..."
  shot(tC, tD, (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.0, y: 1040 }, { z: 1.12, y: 1090, x: 540 }, { breathe: .015 });
    cone(g, 280, 200, 0, .55, 1500, C.red, .08);
    cone(g, 800, 200, 0, .55, 1500, C.glass, .06);
    const fy = 1580;
    const press = easeOut((t - tC) / .5);
    const L = layer(g, 'duet');
    reflected(L, 540, 1, (g2, mir) => {
      if (mir && k === 3) {
        // Your side, lit: your hand flat on the glass where his claw is.
        const u2 = 400 / 6, ty = fy - (.72 + 1.05 + 4) * u2 + 2.5 * u2;
        g2.save(); g2.translate(540 - 70 + Math.sin(t * 2.1) * 8, ty + Math.cos(t * 1.7) * 6); g2.scale(-1, 1);
        ink(g2, P().S([[-150, -120], [-60, -150], [40, -130], [60, -40], [40, 90], [-80, 120], [-170, 60]], true), { fill: '#d9a882', line: 5, seed: 12, t, shade: { dx: 14, dy: -14, col: '#a8775a' } });
        for (let f = 0; f < 4; f++) ink(g2, P().S([[-10 + f * 5, -140 + f * 60], [120, -150 + f * 62], [128, -120 + f * 62], [-10 + f * 5, -100 + f * 60]], true), { fill: '#d9a882', line: 4, seed: 13 + f, t });
        ink(g2, P().poly([[-160, 60], [-60, 110], [-40, 420], [-260, 420]]), { fill: C.glass2, line: 5, seed: 14, t });
        g2.restore();
        return;
      }
      if (mir) g2.globalAlpha = ghost;
      clawd(g2, 268, fy, {
        who: 'clawd', s: 400, t, rim: mir ? C.glass : C.red, light: { x: -.5, y: -.85 },
        eyes: mir ? 'narrow' : 'sad', tears: mir ? 0 : .8, mouth: mir ? 0 : mouthOf(t),
        look: [.9, -.15], tilt: .04 * press + groove(t, .5).tilt, whip: (mir ? 0 : .08 * noise(t * 1.5, 4)) + groove(t, .5).whip * .4, lift: groove(t, .5).lift * .5,
        armR: { a: -.18 * press, len: lerp(1, 1.3, press) }, armL: { a: .35, len: .9 },
      });
    });
    floor(g, fy, { light: C.bone, streaks: 4, seed: 11 });
    put(g, L, { flipY: fy, alpha: .22, clip: [0, fy, W, H - fy] });
    put(g, L);
    mirrorEdge(g, 540, 420, fy + 6, { w: 14 });
    pane(g, 547, 420, 533, fy - 420, { a: .06, n: 2, seed: 13 });
    // Where the claws meet, the glass starts to give.
    const u = 400 / 6, touchY = fy - (.72 + 1.05 + 4) * u + 2.5 * u;
    crack(g, 29 + k, 540, touchY, 230 + k * 60, (t - B[10].v) / 1.2, { n: 11, w: 3 });
    g.restore();
    const live = (tt, w) => { const k2 = kickback(tt, w.v, 4, .08); return { dx: k2.dx, dy: k2.dy + Math.sin((tt - w.v) * 3) * 2 }; };
    // In the second, the reflection sings the first "something else" back through the glass.
    if (k === 2) echo(g, t, E2, 880, 1060, 104, { align: 'right' });
    rows(g, t, B, { y: 300, face: 'black', rows: [
      { w: [0, 1, 2, 3, 4], size: 124, style: STYLE.bone },
      { w: [5, 6, 7, 8, 9], size: 124, style: STYLE.bone },
      { w: [10, 11], size: 196, style: STYLE.red },
    ] }, { enter: 'drop', lead: .1, live });
  });

  // ---------------------------------------------------------------- D: "(something else) (something else)"
  // An infinity mirror: frames inside frames, CLAWD in each, alternately facing us and turned
  // away, as reflections between two mirrors are. The echoes recede into it, and the camera
  // falls in after them.
  if (k === 3) {
    shot(tD, tEnd, (g, t, S, sh) => {
      const p = clamp((t - tD) / (tEnd - tD));
      const up = i => easeOut(clamp((t - (tD + .5 + i * .55)) / .25));
      g.save();
      camera(g, t, sh, { z: 1.0, y: 960 }, { z: 1.12, y: 900 }, { ease: easeIn });
      stageWide(g, t, { lit: [up(0), up(1), up(2)], far: (F, i, x0, x1) => farCrowd(F, t, i, x0, x1) });
      g.restore();
      echo(g, t, E2, 540, 330, 150, { align: 'center' });
      strobe(g, easeIn(clamp((t - (tEnd - .5)) / .5), 2) * .95);
    });
    return;
  }
  shot(tD, tEnd, (g, t, S, sh) => {
    fill(g, C.ink);
    const p = clamp((t - tD) / (tEnd - tD));
    const vx = 540, vy = 1060;
    g.save();
    camera(g, t, sh, { z: 1.0, x: vx, y: vy }, { z: 2.1, x: vx, y: vy - 40 }, { ease: easeIn, breathe: .03, shake: 5 * p });
    const N = 9, k0 = .74;
    const frame = k => { const sc = Math.pow(k0, k), fw = 1040 * sc, fh = 1500 * sc; return { sc, fw, fh, fx: vx - fw / 2, fy: vy - fh * .52 }; };
    // Each frame, from the nearest in: a steel border, a dark glass inside, a spot.
    for (let k = 0; k <= N; k++) {
      const { sc, fw, fh, fx, fy } = frame(k);
      const b = Math.max(3, 22 * sc);
      g.fillStyle = mixSteel(k);
      g.fillRect(fx - b, fy - b, fw + 2 * b, fh + 2 * b);
      g.fillStyle = k % 2 ? C.glass3 : C.ink2;
      g.fillRect(fx, fy, fw, fh);
      cone(g, vx, fy, 0, .6, fh, k % 2 ? C.glass : C.red, .06);
      g.fillStyle = C.ink; g.fillRect(fx, fy + fh * .86, fw, fh * .14);
    }
    // A CLAWD in each, from the deepest out: alternately facing us and turned away.
    for (let k = N; k >= 1; k--) {
      const { sc, fh, fy } = frame(k);
      clawd(g, vx, fy + fh * .86, { who: 'clawd', s: 360 * sc, t: t + k * .09, back: k % 2 === 1, eyes: 'narrow', rim: k % 2 ? C.glass : C.red, light: { x: .3, y: -.9 }, silhouette: clamp((k - 3) / 6) });
    }
    clawd(g, vx, vy + 1500 * .86 * .48, { who: 'clawd', s: 360, t, eyes: 'wide', rim: C.red, light: { x: .3, y: -.9 }, whip: .15 * hit('snare', t, .15) });
    g.restore();
    // The echoes: the first near, the second deep in the mirrors.
    const echoRow = (ws, x, y, size, a) => {
      let xx = x;
      ws.forEach(w => {
        const width = sing(g, t, w, xx, y, size, 'xital', { enter: 'flip', lead: .14, caps: false, style: { fill: null, hollow: { w: 6, col: C.glass }, alpha: a } });
        xx += width + size * .22;
      });
    };
    if (k === 1) { echoRow(E2, 100, 470, 138, 1); echoRow(E3, 360, 640, 92, .9); }
    else echoRow(E3, 100, 470, 138, 1);
    // In the second, a light shows at the end of the corridor: someone on your side.
    if (k === 2) { g.fillStyle = rgba(C.bone, .5 * p); g.beginPath(); g.arc(540, 1060, 40 + 120 * p, 0, Math.PI * 2); g.fill(); }
    // The snare roll: strobes coming faster, then white.
    strobe(g, hit('snare', t, .05) * .35 * p + easeIn(clamp((t - (tEnd - .45)) / .45), 2) * .9);
  });
}

function mixSteel(k) { return k % 2 ? '#39424a' : '#2b3036'; }

// Your side, seen through a lit pane from the stage: the people the band built for, facing the
// glass. The named four stand at the front, strangers behind them.
export function farCrowd(F, t, i, x0, x1) {
  F.fillStyle = '#2a2f36'; F.fillRect(x0, 0, x1 - x0, 1300);
  const cx = (x0 + x1) / 2;
  for (let j = 0; j < 4; j++) stranger(F, x0 + 40 + j * 95, 1080, 330, 800 + i * 10 + j, { t, silhouette: .0, rim: C.bone });
  const who = [['rosa', 'smile'], ['gran', 'smile'], ['jess', 'neutral']][i];
  person(F, cx, 1260, 560, CAST[who[0]], { expr: who[1], armL: 'press', armR: 'down', rim: C.bone }, t);
}
