// The band playing: each member with his instrument in his hands, moving with the record.
import { clamp, lerp, hash, noise, env, hit, beatPhase, beatPos, TAU } from './kit.js';
import { M, T, S, RX, RY, RZ, ap, depth } from './space.js';
import { clawd } from './clawd.js';
import { guitar, micStand, guitar2d, micStand2d, drumKit2d } from './gear.js';
import { BAND } from './palette.js';

const HZ = 18;

// How the band moves: a bob on the kick, a nod on the beat, a lean into the loud bits.
export function groove(t, k = 1, ph = 0) {
  const b = beatPos(t) + ph;
  const nod = Math.pow(Math.max(0, Math.sin(b * Math.PI)), 3);
  return { bob: hit('kick', t, .1) * 2.5 * k, nod: nod * k, sway: Math.sin(b * Math.PI / 2) * k };
}

// A guitarist (REGEX) or bassist (NULL): the Clawd, the instrument across his front, one arm
// strumming at the body, the other on the neck. o.play 0..1 scales the strumming.
export function player(g, c, o) {
  const who = o.who;
  const bass = who === 'null';
  const t = o.t || 0;
  const gr = groove(t, o.groove ?? 1, bass ? .5 : 0);
  const play = o.play ?? clamp(env('guitar', t) * 1.4);
  const strum = Math.sin(t * TAU * (bass ? 4 : 8)) * 2.6 * play;
  const tilt = (o.tilt || 0) + (bass ? -.05 : .06) * gr.nod;
  // The instrument hangs at his right hip (screen left, as he faces us), the neck rising across
  // him to the other side; both stubs of arms reach it, one at the strings, one on the neck.
  const neckA = bass ? .98 : .92;
  const nx = Math.sin(neckA), ny = Math.cos(neckA);
  const gpos = bass ? [-8, -12, HZ + 6] : [-9, -11, HZ + 6];
  const sc = bass ? .72 : .76;
  const fret = (bass ? 40 : 34) + noise(t * 2.2, bass ? 5 : 2) * 3;
  const r = clawd(g, c, {
    who, pos: o.pos, yaw: o.yaw || 0, tilt, lean: (o.lean || 0) + gr.nod * .05, bob: gr.bob + (o.jump || 0), t,
    eyes: o.eyes || 'narrow', blink: o.blink, look: o.look, emit: o.emit, shadow: o.shadow,
    armL: { to: [gpos[0] - 8, gpos[1] + 7 + strum, gpos[2] + 3], z: HZ - 5, zbias: -30 },
    armR: { to: [gpos[0] + nx * fret, gpos[1] + ny * fret, gpos[2] + 2.5], z: HZ - 5, zbias: -30 },
    inside: bodyM => {
      const m = M(bodyM, T(...gpos), RZ(-neckA + strum * .004), S(sc));
      return [{ z: depth(c, ap(m, [0, 0, 0])) - 12, draw: g2 => guitar2d(g2, c, { kind: bass ? 'bass' : 'guitar', m, t, strum: play, glow: (o.glow ?? .5) * (.4 + .6 * play), glowCol: BAND[who].col, edge: BAND[who].col, E: o.E }) }];
    },
  });
  return r;
}

// The singer: CLAWD at the mic, one hand on the stand, the other out, his mouth with the voice.
export function singer(g, c, o) {
  const t = o.t || 0;
  const gr = groove(t, o.groove ?? .8, .25);
  const v = clamp(env('vocal', t) * 1.6);
  const pos = o.pos || [0, 0, 0];
  // The stand turns with him: in front of him whichever way he faces.
  const yw = o.yaw || 0, cy = Math.cos(yw), sy = Math.sin(yw);
  const off = (dx, dy, dz) => [pos[0] + cy * dx + sy * dz, pos[1] + dy, pos[2] - sy * dx + cy * dz];
  const stand = off(16, 0, 36);
  const head = off(-2, 24 + gr.bob, 18);
  // The stand is in front of him: it joins his depth order, after the body.
  return clawd(g, c, {
    inside: () => o.noMic ? [] : [{ z: depth(c, [stand[0], stand[1] + 40, stand[2]]) - 6, draw: g2 => micStand2d(g2, c, { pos: stand, h: 34, aim: head }) }],
    who: 'clawd', pos, yaw: o.yaw || 0, tilt: (o.tilt || 0) + gr.sway * .03, lean: -.05 - v * .04 + (o.lean || 0), bob: gr.bob + (o.jump || 0), t,
    mouth: o.mouth ?? v, eyes: o.eyes || (v > .5 ? 'narrow' : 'open'), blink: o.blink, look: o.look, emit: o.emit, shadow: o.shadow,
    armR: o.armR || { to: [14, -12, 32], z: HZ - 6, zbias: -40 },
    armL: o.armL || { up: .35 + v * .7, fwd: .25 + v * .2 },
  });
}

// The drummer: CRON on his throne behind the kit, sticks coming down on the hits.
import { drumKit } from './gear.js';
import { tube, project, drawSolid, boxFaces } from './space.js';
export function drummer(g, c, o) {
  const t = o.t || 0;
  const pos = o.pos || [0, 0, -100];
  const hits = { kick: hit('kick', t, .09), snare: hit('snare', t, .08), crash: hit('crash', t, .25), hat: hit('kick', t + .11, .07) };
  const rz = o.riser || 0;
  // o.flip: he and his kit face the other way, into the mirror.
  const F = o.flip ? -1 : 1;
  const kitPos = [pos[0], rz, pos[2]];
  const K = (dx, dy, dz) => [kitPos[0] + F * dx, dy, kitPos[2] + F * dz];
  const seat = [pos[0], 36 + rz, pos[2] - 46 * F];
  // Sticks: the left comes down on the snare, the right on the hats or a cymbal on a crash.
  const lift = k => 22 * (1 - k);
  const snare = K(-32, rz + 60 + lift(hits.snare), 6);
  const right = hits.crash > .4 ? K(-40, rz + 112, -8) : K(-50, rz + 78 + lift(hits.hat), 10);
  let r;
  const body = g2 => {
    r = clawd(g2, c, {
      who: 'cron', pos: seat, yaw: o.flip ? Math.PI : 0, t, lean: .12 + hits.snare * .06, tilt: Math.sin(t * Math.PI * 2 / .88) * .04, bob: hits.kick * 3,
      eyes: o.eyes || 'narrow', emit: o.emit, shadow: false,
      armL: { to: [-24, 4, 30], z: 10 }, armR: { to: [24, 4, 30], z: 10 },
    });
  };
  // The riser: a black box with a lit edge.
  if (rz > 0) riser(g, c, [pos[0], 0, pos[2] - 20 * F], 110, rz, 70);
  // Draw order: whichever of him and the kit is further from the camera first; the sticks last.
  const kit = () => drumKit2d(g, c, { pos: kitPos, hits, t, E: o.E, col: o.col, kickHead: o.kickHead, flip: o.flip });
  if (depth(c, seat) > depth(c, kitPos)) { body(g); kit(); } else { kit(); body(g); }
  const lw = 1.4;
  const gripL = r.tipL, gripR = r.tipR;
  tube(g, c, [gripL, snare], .8, '#e8d9b8', { line: lw, glint: 'rgba(255,255,255,.6)' });
  tube(g, c, [gripR, right], .8, '#e8d9b8', { line: lw, glint: 'rgba(255,255,255,.6)' });
  return r;
}

// A riser: a black box, its top edge lit, carpet-dark.
import { roundPath, inkLine } from './soft.js';
import { rgba } from './kit.js';
function riser(g, c, p, hw, h, hd) {
  const P = (x, y, z) => { const q = project(c, [p[0] + x, p[1] + y, p[2] + z]); return [q.x, q.y]; };
  const front = [P(-hw, 0, hd), P(hw, 0, hd), P(hw, h, hd), P(-hw, h, hd)];
  const top = [P(-hw, h, hd), P(hw, h, hd), P(hw, h, -hd), P(-hw, h, -hd)];
  g.save();
  g.beginPath(); g.moveTo(...top[0]); for (const q of top.slice(1)) g.lineTo(...q); g.closePath(); g.fillStyle = '#1a1b20'; g.fill();
  g.beginPath(); g.moveTo(...front[0]); for (const q of front.slice(1)) g.lineTo(...q); g.closePath(); g.fillStyle = '#0c0c0f'; g.fill();
  g.strokeStyle = rgba('#dfe6ee', .45); g.lineWidth = 1.4; g.beginPath(); g.moveTo(...front[3]); g.lineTo(...front[2]); g.stroke();
  inkLine(g, () => { g.moveTo(...front[0]); g.lineTo(...front[1]); g.lineTo(...front[2]); g.lineTo(...top[2]); g.lineTo(...top[3]); g.lineTo(...front[3]); g.closePath(); }, 1.6, 0, -1);
  g.restore();
}
