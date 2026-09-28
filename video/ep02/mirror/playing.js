// The band playing: each member with their instrument, moving with the record. Hands go where
// the notes are: REGEX's fretting hand jumps along the neck with the riff's pitch, his picking
// hand hits each note, CRON's sticks come down on the drum that's struck, NULL plucks on the
// bass notes, CLAWD's mouth opens with his voice.
import { C, TAU, clamp, lerp, easeOut, env, hit, last, next, noise, twos, A, lastIndex } from './kit.js';
import { clawd, aim } from './clawd.js';
import { guitar, guitarHands, bass, kit, micStand, mic } from './gear.js';
import { gpen } from './pen.js';

// A headbang on the beat: the body pitches forward on the kick and the hair whips after it.
export function groove(t, amt = 1, phase = 0) {
  const k = hit('kick', t, .16), s = hit('snare', t, .12);
  return { tilt: (k * .07 - s * .03) * amt, lift: s * 10 * amt, whip: (Math.sin((t + phase) * 7.4) * .25 + k * .5) * amt, squash: (k * .25 - s * .1) * amt };
}

// The riff note sounding at t: its index, how long ago it started, its pitch.
export function riffNote(t) {
  const i = lastIndex(A.ev.riff, t);
  if (i < 0) return null;
  const [t0, midi, st] = A.riff[i];
  return { i, t0, midi, st, age: t - t0 };
}

export function regex(g, x, y, s, t, o = {}) {
  const gr = groove(t, o.groove ?? 1, .3);
  const n = riffNote(t);
  const fret = n && n.age < .5 ? ((n.midi % 12) / 11) : .5;
  const tap = n ? Math.exp(-n.age / .05) : 0;
  const rot = -.42 + gr.tilt * .5;
  return clawd(g, x, y, {
    who: 'regex', s, t, rim: o.rim ?? C.red, light: o.light, eyes: o.eyes || (tap > .5 ? 'fierce' : 'open'),
    tilt: gr.tilt, lift: gr.lift, whip: gr.whip, squash: gr.squash, look: [-.3, .2], silhouette: o.silhouette, flash: o.flash,
    armL: { a: 0, len: .1 }, armR: { a: 0, len: .1 }, noArms: true,
    between: (g2, b) => {
      const u = b.u, gs = s * .95;
      const bx = u * .9, by = b.top + 3.3 * u;
      guitar(g2, bx, by, gs, { rot, t, strum: tap, rim: o.rim });
      const H = guitarHands(bx, by, gs, rot, fret);
      // Fretting hand on the neck; the picking hand dips on each note.
      const pick = [H.pick[0] - u * .3, H.pick[1] - tap * u * .4];
      drawArm(g2, -1, b.shL, H.fret, u, o);
      drawArm(g2, 1, b.shR, pick, u, o);
    },
  });
}

export function nullBass(g, x, y, s, t, o = {}) {
  const gr = groove(t, (o.groove ?? 1) * .45, 1.1);
  const pl = hit('kick', t, .12);
  const rot = -.62 + gr.tilt * .3;
  return clawd(g, x, y, {
    who: 'null', s, t, rim: o.rim ?? C.bone, light: o.light, eyes: 'narrow', tilt: gr.tilt * .5, whip: gr.whip * .6,
    look: [.2, .3], silhouette: o.silhouette, flash: o.flash, noArms: true,
    between: (g2, b) => {
      const u = b.u, bs = s * 1.0;
      const bx = u * .6, by = b.top + 3.5 * u;
      bass(g2, bx, by, bs, { rot, t, pluck: pl, rim: o.rim });
      const k = bs / 300, c = Math.cos(rot), sn = Math.sin(rot);
      const at = (lx, ly) => [bx + (lx * c - ly * sn) * k, by + (lx * sn + ly * c) * k];
      drawArm(g2, -1, b.shL, at(-50 - 600 * .22, 0), u, o);
      drawArm(g2, 1, b.shR, [at(40, 0)[0] - u * .2, at(40, 0)[1] - pl * u * .3], u, o);
    },
  });
}

// CRON behind the kit: we see him from the chest up over the drums, sticks flying.
export function cron(g, x, y, s, t, o = {}) {
  const gr = groove(t, (o.groove ?? 1) * 1.3, .7);
  const hk = hit('kick', t, .1), hs = hit('snare', t, .1), hc = hit('crash', t, .25);
  const u = s / 6;
  const body = clawd(g, x, y - s * .35, {
    who: 'cron', s, t, rim: o.rim ?? C.red, light: o.light, eyes: hs > .6 || hc > .5 ? 'fierce' : 'open',
    tilt: gr.tilt, lift: gr.lift * .5, whip: gr.whip * 1.2, mouth: hc > .3 ? .6 : 0, silhouette: o.silhouette, flash: o.flash,
    noArms: true,
    between: (g2, b) => {
      // Sticks: the left comes down on the snare, the right on the crash or hat.
      const lt = [b.shL[0] - u * 1.6, b.top + 4.6 * u + hs * u * .8];
      const rt = [b.shR[0] + u * 1.5, b.top + (hc > .2 ? 1.2 : 3.8) * u + (hc > .2 ? -hc : hk * .3) * u * .7];
      drawArm(g2, -1, b.shL, lt, u, o, stick(-1));
      drawArm(g2, 1, b.shR, rt, u, o, stick(1));
    },
  });
  kit(g, x, y, s * 2.1, { t, hit: { kick: hk, snare: hs, crash: hc, hat: hit('kick', t + .22, .08) * .5, tom1: 0, tom2: 0, floor: 0 } });
  return body;
}
function stick(side) {
  return (g, u) => {
    gpen(g, [[0, 0], [side * u * 2.4, -u * 1.9]], u * .22, { col: C.bone2, taper: [0, .6], wobble: .2 });
    gpen(g, [[0, 0], [side * u * 2.4, -u * 1.9]], u * .08, { col: C.bone3, taper: [0, .8], wobble: 0, boil: false });
  };
}

export function singer(g, x, y, s, t, o = {}) {
  const gr = groove(t, (o.groove ?? 1) * .6, 0);
  const m = o.mouth ?? clamp((env('vocal', t) - .2) * 1.5);
  return clawd(g, x, y, {
    who: 'clawd', s, t, rim: o.rim ?? C.red, light: o.light, eyes: o.eyes || (m > .5 ? 'fierce' : 'open'), mouth: m,
    tilt: gr.tilt + (o.tilt || 0), whip: gr.whip, lift: gr.lift * .5, look: o.look || [0, 0], tears: o.tears,
    silhouette: o.silhouette, flash: o.flash,
    armL: o.armL || { a: .5, len: .9 }, armR: o.armR || { a: -.7, len: 1.2 },
    holdR: o.mic === false ? null : (g2, u) => mic(g2, u * .2, -u * .1, u / 22, -.4),
  });
}

// An arm drawn outside the figure (for reaching instruments): shoulder to target.
function drawArm(g, side, sh, to, u, o, hold) {
  const { a, len } = aim(side, sh, to, u);
  g.save();
  g.translate(sh[0] - side * .15 * u, sh[1]);
  g.rotate(side > 0 ? a : Math.PI - a);
  const th = u * .9, tip = u * .76, L = len * u;
  const P0 = [[0, -th / 2], [L + .15 * u, -tip / 2], [L + .15 * u, tip / 2], [0, th / 2]];
  g.beginPath(); g.moveTo(...P0[0]); for (const p of P0.slice(1)) g.lineTo(...p); g.closePath();
  g.fillStyle = o.silhouette > .5 ? C.ink2 : C.clawd; g.fill();
  g.fillStyle = C.clawd2; g.fillRect(0, -th / 2, L + .15 * u, th * .28);
  if (o.rim) { g.fillStyle = o.rim; g.fillRect(0, th / 2 - th * .16, L + .15 * u, th * .16); }
  gpen(g, [P0[0], P0[1], P0[2], P0[3]], Math.max(2.2, u * .075), { col: C.ink, taper: [.05, .05], seed: side * 7 });
  if (hold) { g.translate(L + .1 * u, 0); g.rotate(-(side > 0 ? a : Math.PI - a)); hold(g, u); }
  g.restore();
}
