// The Instrumental: the agility trials (108.2-121.8 s, sixteen bars, no voice, the full band). Four dogs run one
// course in four four-bar phrases, and no two score alike: a greyhound (flat out, knocks everything down),
// a basset hound (perfect and slow, the crowd naps), a great dane in a gold collar (fast and clean, and a
// price tag falls out of his collar) and Bruce (wobbles, falls off things and is adored). A scoreboard of four
// dials (SPEED, CARE, THRIFT, FUN: each better the higher it goes, no total anywhere) fills as each runs, and
// the judge hands out four different rosettes, one per dog, each for a different dial: no dog wins everything.
//
// The music sets the times: the first hit of each phrase is a page-wide pulse (the bar's downbeat), the
// dane's paw-prints are the stabs of his phrase (the measured `other` hits), and Bruce's legs are the trill
// under the last phrase's stabs.
import { W, TAU, clamp, lerp, easeOut, easeIn, backOut, smooth, REC } from '../kit.js';
import { shot } from '../shots.js';
import { line, dot } from '../pencil.js';
import { write } from '../hand.js';
import { dogFront } from '../people.js';
import { groove, pop } from '../common.js';
import { ringBackdrop } from '../ring.js';
import { pigeon } from '../world.js';
import { confetti, judgeBulldog, bowlerDog } from '../ringcast.js';
import { rosette, paw, sparkle, burst } from '../props.js';
import { C, GRAPHITE } from '../palette.js';
import * as T from '../props-trials.js';

const T0 = 108.2, T1 = 121.8;
const { OB, LANE } = T;

// ------------------------------------------------------------------- the phrases and their beats
let PH = null;
function phases() {
  if (PH) return PH;
  const bs = REC.beats;
  PH = [0, 1, 2, 3].map(k => { const i = bs.findIndex(b => b.bar === 127 + 4 * k && b.beat === 1); return Array.from({ length: 9 }, (_, n) => bs[i + n].t); });
  return PH;
}
const phraseOf = t => { const P = phases(); return t < P[1][0] ? 0 : t < P[2][0] ? 1 : t < P[3][0] ? 2 : 3; };
// Beats since phrase k began (fractional; negative before, more than 8 after).
function beatsIn(k, t) {
  const B = phases()[k];
  if (t < B[0]) return (t - B[0]) / (B[1] - B[0]);
  for (let n = 0; n < 8; n++) if (t < B[n + 1]) return n + (t - B[n]) / (B[n + 1] - B[n]);
  return 8 + (t - B[8]) / (B[8] - B[7]);
}
const timeOf = (k, b) => { const B = phases()[k]; const n = clamp(Math.floor(b), 0, 7); return B[n] + (b - n) * (B[n + 1] - B[n]); };

// ------------------------------------------------------------------- each dog's run: where its centre is, by beat
// (beat, distance along the course in px). The greyhound and the dane come in from off the left of the page on the
// phrase's first hit; the basset is asleep at the gate; Bruce drops in. The hits are set so each smash lands on a beat
// or an off-beat: the greyhound's hurdle on 1, tunnel 1.5, poles 2-2.5, hoop 3.5, seesaw 4, finish 4.5.
const LEAD = 190;                 // a dog's nose is about this far ahead of its centre, in course pixels
const WP = [
  [[-9, -250], [0, -250], [.5, -190], [1, 65], [1.5, 320], [1.78, 455], [2.08, 615], [3.05, 1215], [3.55, 1340], [4.05, 1600], [5, 1970], [5.5, 2130], [6.1, 2195], [9, 2195]],
  [[-9, 0], [.5, 0], [1.1, 45], [2, 344], [3, 676], [4, 1008], [5, 1340], [6, 1672], [6.9, 1970], [7.4, 2100], [8, 2195], [9, 2195]],
  [[-9, -300], [0, -300], [1.6, 65], [2.4, 320], [2.9, 455], [3.3, 615], [4.3, 1215], [4.75, 1340], [5.25, 1600], [6, 1970], [6.5, 2150], [7, 2195], [9, 2195]],
  [[-9, 0], [.3, 0], [1.8, 30], [1.95, 65], [2.4, 150], [3, 320], [3.4, 455], [3.95, 615], [4.5, 1215], [5, 1340], [5.9, 1790], [6.45, 2100], [7.2, 2195], [9, 2195]],
];
const FIN = [5, 6.9, 6, 6.45];   // the beat each dog's nose crosses the finish line
const x_ok = p => p.x > -230 && p.x < 1300;
const sAt = (k, b) => T.pchip(WP[k], b);
function bAtS(k, s) { let lo = -9, hi = 9; for (let i = 0; i < 28; i++) { const m = (lo + hi) / 2; if (sAt(k, m) < s) lo = m; else hi = m; } return (lo + hi) / 2; }
let HB = null;                    // the beat each dog's nose reaches each obstacle
const hitBeats = () => HB || (HB = WP.map((_, k) => Object.fromEntries(Object.entries(OB).map(([n, s]) => [n, bAtS(k, s - LEAD)]))));
const arc = (s, s0, r, h) => { const u = (s - s0) / r; return Math.abs(u) >= 1 ? 0 : h * (1 - u * u); };
const arcSlope = (s, s0, r, h) => { const u = (s - s0) / r; return Math.abs(u) >= 1 ? 0 : -2 * h * u / r; };

// ------------------------------------------------------------------- what the four dials read, by beat
// The dial is the run, live: SPEED follows how fast, CARE loses a bit at every fault, THRIFT is a slow tally of
// savings (the dane's is eaten by his running cost), FUN follows the crowd.
const KEYS = [
  [ // greyhound
    [[0, 0], [.8, 24], [1.7, 96], [9, 96]],
    [[0, 0], [.3, 100], [.95, 100], [1.15, 82], [1.45, 82], [1.65, 64], [1.95, 64], [2.2, 46], [3.5, 46], [3.7, 30], [4, 30], [4.25, 12], [9, 12]],
    [[0, 0], [1, 8], [4.5, 50], [9, 50]],
    [[0, 0], [1, 22], [4, 62], [9, 62]]],
  [ // basset
    [[0, 0], [1, 3], [7, 10], [9, 10]],
    [[0, 0], [.6, 96], [9, 96]],
    [[0, 0], [1, 6], [7, 92], [9, 92]],
    [[0, 0], [1, 4], [7, 6], [9, 6]]],
  [ // dane
    [[0, 0], [1, 34], [2, 82], [9, 82]],
    [[0, 0], [.4, 100], [9, 100]],
    [[0, 0], [.7, 52], [1.6, 60], [6.35, 60], [6.9, 6], [9, 6]],
    [[0, 0], [3, 30], [5, 44], [9, 44]]],
  [ // Bruce
    [[0, 0], [1, 10], [4, 28], [9, 28]],
    [[0, 0], [.3, 100], [1.9, 100], [2.1, 70], [3.8, 70], [4, 48], [4.85, 48], [5.05, 34], [5.8, 34], [6, 22], [9, 22]],
    [[0, 0], [1, 10], [6.5, 78], [9, 78]],
    [[0, 0], [1.4, 8], [1.9, 28], [3.9, 34], [4.1, 52], [5, 70], [5.9, 80], [6.5, 98], [9, 98]]],
];
const levels = (k, b) => KEYS[k].map(ks => T.pchip(ks, b));
// A dog's rosette goes on it at AWARD (beats), and later flies to its dial. A rosette's colour is its dial's, never a place.
const AWARD = [6.6, 7.3, 7.3, 6.5];
const ROS = T.WIN.map(i => T.DIALS[i].col);
const FLY = [.5, .5, .5, .24];

export function register(S) {
  const P = phases();
  const edges = [T0, P[1][0], P[2][0], P[3][0], T1];
  for (let k = 0; k < 4; k++) shot(edges[k], edges[k + 1], (g, t) => drawTrials(g, t), { id: 'trials-' + (k + 1) });
}

// ------------------------------------------------------------------- the dogs' poses
function poseOf(k, b) {
  const s = sAt(k, b), path = T.pathAt(s);
  const HBk = hitBeats()[k];
  const p = { k, b, s, path, x: path.x, y: path.y, flip: path.flip, sc: path.sc, walk: 0, pitch: 0, lift: 0, squash: 0, spin: 0, eyes: 'open', mouth: 0, tongue: false, brow: 0, ear: 0, look: 0, legPop: null, show: true, sleep: false, wag: .6 };
  const step = (per, off = 0) => ((s + off) / per) % 1;
  if (k === 0) {
    // The greyhound: flat out, a bound every 250 px, over everything and through most of it.
    const run = b < FIN[0], moving = b > 0;
    const bound = run && moving ? 26 * Math.abs(Math.sin(Math.PI * s / 250)) : 0;
    const J = [[OB.hurdle - 10, 95, 84], [OB.tunnel - 10, 110, 62], [OB.hoop, 85, 84], [OB.seesaw, 135, 92]];
    p.lift = bound + J.reduce((a, j) => a + arc(s, ...j), 0);
    const sl = J.reduce((a, j) => a + arcSlope(s, ...j), 0);
    p.pitch = clamp(Math.atan(sl) * .8, -.45, .45) * (p.flip >= 0 ? 1 : 1);
    p.walk = step(250);
    p.eyes = 'wide'; p.mouth = .5; p.tongue = true; p.ear = -1;
    p.squash = run ? -.18 : 0;
    if (b >= FIN[0]) {          // through the tape and into a cartwheel, then dizzy
      const u = clamp((b - FIN[0]) / .9);
      p.spin = -TAU * 1.5 * easeOut(u, 1.6); p.lift = 34 * Math.sin(Math.min(1, u * 1.3) * Math.PI); p.walk = (b * 6) % 1;
      if (u >= 1) { p.eyes = 'x'; p.mouth = 0; p.tongue = true; p.spin = 0; p.lift = 0; p.squash = .12; p.walk = 0; }
    }
    p.show = !path.hidden && x_ok(p);
  } else if (k === 1) {
    // The basset: asleep at the gate, a yawn, then a plod, one step a beat, ears trailing; perfect over everything.
    p.eyes = 'sad'; p.ear = Math.sin(b * Math.PI * 2) * .4;
    p.walk = ((b - .7) % 1 + 1) % 1;
    p.lift = b > .8 && b < FIN[1] ? 5 * Math.abs(Math.sin(b * Math.PI)) : 0;
    if (b < .7) { p.sleep = true; p.squash = .2; p.walk = 0; }
    else if (b < 1.5) { const y = clamp((b - .7) / .8); p.mouth = Math.sin(y * Math.PI) ; p.eyes = 'happy'; p.tongue = y > .3; p.pitch = Math.sin(y * Math.PI) * .12; }
    const J = [[OB.hurdle, 80, 44], [OB.hoop, 70, 26]];
    p.lift += J.reduce((a, j) => a + arc(s, ...j), 0);
    p.pitch += clamp(Math.atan(J.reduce((a, j) => a + arcSlope(s, ...j), 0)) * .6, -.3, .3);
    if (s > OB.weave - 90 && s < OB.weave + 90) p.lift += 4 * Math.sin(s / 40 * Math.PI);
    if (b > FIN[1]) { p.walk = 0; p.mouth = 0; p.eyes = b > 7.4 ? 'happy' : 'sad'; p.squash = clamp((b - 7.4) / .4) * .22; }
  } else if (k === 2) {
    // The dane: long, clean strides, head high; the tag comes out at the end.
    p.walk = step(300); p.eyes = 'open'; p.mouth = .15; p.wag = .9; p.ear = -.5;
    const run = b < 6.2;
    p.lift = run && b > 0 ? 30 * Math.abs(Math.sin(Math.PI * s / 300)) : 0;
    const J = [[OB.hurdle - 10, 95, 74], [OB.hoop, 85, 78]];
    p.lift += J.reduce((a, j) => a + arc(s, ...j), 0);
    p.pitch = clamp(Math.atan(J.reduce((a, j) => a + arcSlope(s, ...j), 0)) * .8, -.4, .4) + (b > 5.9 ? .1 : 0);
    if (s > OB.weave - 90 && s < OB.weave + 90) { p.pitch += .07 * Math.sin(s / 40 * Math.PI); }
    if (b > 6.3) { p.walk = 0; p.eyes = 'wide'; p.mouth = .3; p.brow = 1; }
  } else {
    // Bruce: drops in, revs (the trill), bonks, wobbles, boings, is flung off the seesaw and lands on his back.
    const drop = clamp(b / .35);
    p.lift = (1 - easeIn(drop, 1.6)) * 520;
    p.show = !path.hidden && b > -.02;
    const trill = (b > .4 && b < 1.85) || (b > 2.3 && b < 3.9);
    p.walk = trill ? (b * 9) % 1 : step(150);
    p.eyes = 'wide'; p.mouth = .5; p.tongue = true; p.ear = Math.sin(b * 9) * .8;
    p.squash = b > .35 && b < .6 ? .3 * (1 - (b - .35) / .25) : 0;
    if (trill) p.lift += 3 * Math.abs(Math.sin(b * 40));
    if (s > OB.weave - 90 && s < OB.weave + 90) p.pitch = .16 * Math.sin(s / 40 * Math.PI);
    const hop = b > 4.85 && b < 5.35 ? 70 * Math.sin((b - 4.85) / .5 * Math.PI) : 0; p.lift += hop;
    if (b >= 5.9) {          // the catapult
      const u = clamp((b - 5.9) / .55);
      p.lift = 230 * Math.sin(u * Math.PI); p.spin = -TAU * 2.5 * easeOut(u, 1.4);
      p.walk = (b * 10) % 1; p.mouth = .8;
      if (u >= 1) { p.spin = -TAU * 2.5; p.eyes = 'happy'; p.mouth = 1; p.lift = 0; p.walk = (b * 12) % 1; }
    }
  }
  if (k === 1 || k === 2) p.show = !path.hidden;
  // Riding the seesaw (the near lane, dogs going left): the dog stands on the plank.
  if (k !== 0) {
    const cx = T.OBX.seesaw, half = 172;
    const on = smooth(clamp((half + 20 - Math.abs(p.x - cx)) / 30)) * (p.path.lane ? 1 : 0);
    if (on > 0 && !(k === 3 && b >= 5.9)) {
      const ang = seesawAng(k, b, s);
      p.lift += (LANE.yB - T.seesawSurface(cx, LANE.yB, 1.15, ang, 0, p.x)) * on;
      p.pitch += ang * on;
    }
  }
  return p;
}
// The seesaw's tilt: right end down (+) until the dog's weight passes the fulcrum, then left end down.
function seesawAng(k, b, s) {
  if (k === 3) return b < 5.9 ? .2 : lerp(.2, -.3, easeOut(clamp((b - 5.9) / .2), 2));
  const u = smooth(clamp((s - OB.seesaw + 10) / 60));
  return lerp(.2, -.2, u);
}

// ------------------------------------------------------------------- the whole picture
function drawTrials(g, t0) {
  // Drawings are made on twos, so on average a drawing is a third of a frame late: draw everything a hair ahead.
  const t = t0 + .033;
  if (typeof window !== 'undefined') window.__markInk = GRAPHITE;
  const P = phases();
  const k = phraseOf(t), b = beatsIn(k, t);
  // The pulse: the first hit of each phrase shakes the whole page (full strength on the first drawing after it).
  const da = t - P[k][0];
  const pulse = da < 0 ? 0 : da < .066 ? 1 : Math.exp(-(da - .066) / .11);
  const pk = 1 + .035 * pulse;
  const dp = poseOf(k, b);
  g.save();
  g.translate(W / 2, 1050); g.scale(pk, pk); g.translate(-W / 2, -1050);
  const mood = moods(k, b, dp);
  ringBack(g, t, k, b, mood, dp);
  T.scoreboard(g, t, boardState(k, b, t));
  pigeon(g, t, 118, 156, .62, { seed: 5, state: mood.pigeon, look: 1 });
  prints(g, t, k);
  course(g, t, k, b, dp, pulse);
  crowd(g, t, k, b, pulse, dp);
  extras(g, t, k, b, pulse, dp);
  g.restore();
}
function ringBack(g, t, k, b, mood, dp) {
  ringBackdrop(g, t, { mood: 'day', sunMood: mood.sun, look: [clamp((dp.x - 990) / 500, -1, 1), .4], bunt: true, seed: 21 });
}
// The sun and the pigeon feel what the crowd does.
function moods(k, b, dp) {
  const H = hitBeats()[k];
  const m = { sun: 'happy', pigeon: 'perch' };
  if (k === 0) { m.sun = b < 1 ? 'shades' : b < FIN[0] + .1 ? 'gasp' : 'happy'; m.pigeon = b > 1 && b < 5.5 ? 'gasp' : 'perch'; }
  if (k === 1) { m.sun = b > 1.2 && b < FIN[1] ? 'sleepy' : 'happy'; m.pigeon = b > .8 && b < FIN[1] ? 'sleep' : 'perch'; }
  if (k === 2) { m.sun = b > 6.3 ? 'gasp' : 'happy'; m.pigeon = b > 6.3 ? 'gasp' : 'perch'; }
  if (k === 3) { m.sun = 'happy'; m.pigeon = b > 5.9 ? 'flap' : b > 1.9 ? 'gasp' : 'perch'; }
  return m;
}
function boardState(k, b, t) {
  const P = phases();
  let lv = levels(k, b);
  if (k > 0 && b < .7) { const prev = levels(k - 1, 9); const u = smooth(b / .7); lv = lv.map((v, i) => lerp(prev[i], v, u)); }
  const beads = [], crowns = [];
  for (let j = 0; j < k; j++) {
    beads.push({ k: j, a: j === k - 1 ? clamp((t - P[k][0]) / .4) : 1 });
    const c = crownState(j, t);
    if (c.landed) crowns.push({ i: T.WIN[j], col: ROS[j], pop: c.pop });
  }
  let cursor = k;
  const iconLv = lv.slice();
  if (k === 3) {   // at the very end Bruce's marker slides aside too and the tubes are left with the four dogs' marks
    const t0 = timeOf(3, 6.4), a = clamp((t - t0) / .22);
    if (a > 0) { beads.push({ k: 3, a }); cursor = -1; lv = lv.map(v => v * (1 - smooth(a))); }
  }
  const c = crownState(k, t);
  if (c.landed) crowns.push({ i: T.WIN[k], col: ROS[k], pop: c.pop });
  const shake = [0, 0, 0, 0];
  for (let j = 0; j <= k; j++) { const [, t1] = crownTimes(j); if (t > t1) shake[T.WIN[j]] = Math.exp(-(t - t1) / .12) * (t - t1 < .5 ? 1 : 0); }
  return { lv, iconLv, cursor, beads, crowns, shake, pop: 1 };
}
// A rosette's life after it is awarded: on its dog until the next phrase's first hit (Bruce's a little sooner),
// then it flies to the top of the dial it is for.
function crownTimes(j) {
  const P = phases();
  const t0 = j < 3 ? P[j + 1][0] : timeOf(3, 6.6);
  return [t0, t0 + FLY[j]];
}
function crownState(j, t) {
  const [t0, t1] = crownTimes(j);
  if (t < t0) return { flying: false, landed: false, p: 0, pop: 0 };
  if (t < t1) return { flying: true, landed: false, p: (t - t0) / (t1 - t0), pop: 0 };
  return { flying: false, landed: true, p: 1, pop: backOut(clamp((t - t1) / .18), 2.4) };
}

// The dane's paw-prints are the stabs of his phrase.
function prints(g, t, k) {
  if (k !== 2) return;
  const P = phases();
  const stabs = REC.hitT.other.filter(x => x > P[2][0] + .3 && x < P[2][0] + .4305 * 7.6);
  stabs.forEach((ts, i) => {
    if (t < ts - .03) return;
    const bs = beatsIn(2, ts), q = T.pathAt(sAt(2, bs));
    if (q.hidden) return;
    const dir = q.flip >= 0 ? 1 : -1, kk = pop(t, ts - .03, .16);
    const jy = (i % 2 ? 1 : -1) * 9;
    g.save(); g.translate(q.x - dir * 30, q.y - 8 + jy); g.rotate(dir * Math.PI / 2); g.scale(kk, kk);
    paw(g, 0, 0, 58, t, { col: '#34374f', seed: 500 + i, alpha: .85 });
    g.restore();
  });
}

// ------------------------------------------------------------------- the course, the judge and the dog
function course(g, t, k, b, dp, pulse) {
  const HBk = hitBeats()[k];
  const yA = LANE.yA, yB = LANE.yB, X = T.OBX;
  const pk = k > 0 ? .55 + .45 * pop(t, phases()[k][0] - .03, .3) : 1;      // everything springs back at the first hit
  const since = n => b - HBk[n];
  // What each dog does to each obstacle.
  let hur = { dx: 0, dy: 0, rot: 0 }, tun = { sq: 1, bump: null, dx: 0 }, pol = { knock: () => 0, wob: () => 0 }, hoo = { rot: 0, dx: 0, dy: 0 }, see = { ang: .2, lift: 0 }, torn = 0;
  const front = dp.s + LEAD;
  if (k === 0) {
    const h = clamp(since('hurdle') / .7); hur = { dx: 300 * easeOut(h, 1.6), dy: -Math.sin(h * Math.PI) * 190 + h * h * 118, rot: h * TAU };
    const ht = clamp(since('tunnel') / .45); tun = { sq: 1 - .68 * easeOut(ht, 2), dx: Math.sin(ht * 40) * 5 * (1 - ht), bump: null };
    pol = { knock: i => clamp((front - T.POLE_S[i]) / 80), wob: () => 0, dir: () => 1 };
    const hh = clamp(since('hoop') / .6); hoo = { rot: -1.45 * easeOut(hh, 2), dx: -40 * hh, dy: 0 };
    const hs = clamp(since('seesaw') / .7); see = { ang: lerp(.2, -.4, easeOut(hs, 2)), lift: 150 * Math.sin(Math.min(1, hs * 1.4) * Math.PI) };
  } else if (k === 3) {
    const h = clamp((b - 1.95) / .5); hur = { dx: 30 * h, dy: 124 - 10, rot: 0.25 * h };
    hur = { dx: 40 * easeOut(h, 2), dy: (124 - 8) * easeIn(h, 2), rot: .3 * h };
    const inT = Math.abs(dp.x - X.tunnel) < 100;
    tun = { sq: 1, dx: 0, bump: inT ? { x: dp.x - X.tunnel, h: 24 } : null };
    pol = { knock: i => (i === 4 && b > 3.95) ? clamp((b - 3.95) / .5) : 0, wob: i => { const d = Math.abs(dp.x - (X.weave + (i - 2) * 40)); return d < 60 ? Math.sin(b * 40) * (1 - d / 60) : 0; }, dir: () => 1 };
    hoo = { rot: b > 4.95 ? .16 * Math.sin((b - 4.95) * 20) * Math.exp(-(b - 4.95) * 3) : 0, dx: 0, dy: 0 };
    see = { ang: seesawAng(3, b, dp.s), lift: 0 };
  } else {
    if (k === 1) pol.wob = i => { const d = Math.abs(dp.x - (X.weave + (i - 2) * 40)); return d < 50 ? Math.sin(b * 12) * (1 - d / 50) * .5 : 0; };
    see = { ang: seesawAng(k, b, dp.s), lift: 0 };
  }
  torn = clamp((b - HBk.finish) / .6);
  // Far lane.
  const farDog = dp.path.lane === 0, dog = () => { if (dp.show) drawDog(g, t, k, dp); };
  T.startGate(g, t, 112, yA + 6, { pop: pk });
  T.hurdleX(g, t, X.hurdle, yA, .75, { ...hur, pop: pk });
  T.tunnelMouth(g, t, X.tunnel, yA, { pop: pk, sq: tun.sq });
  T.poles(g, t, X.weave, yA, { which: 'back', knock: pol.knock, wob: pol.wob, pop: pk, dir: pol.dir });
  if (farDog) dog();
  T.tunnelDome(g, t, X.tunnel, yA, { pop: pk, sq: tun.sq, bump: tun.bump, dx: tun.dx });
  T.poles(g, t, X.weave, yA, { which: 'front', knock: pol.knock, wob: pol.wob, pop: pk, dir: pol.dir });
  // Near lane: the hoop's back half, the seesaw, the finish, the dog, the hoop's front half.
  T.hoop(g, t, X.hoop, yB, { part: 'back', pop: pk, rot: hoo.rot, dx: hoo.dx, dy: hoo.dy, sz: 1 });
  T.seesaw(g, t, X.seesaw, yB, { ...see, pop: pk, sz: 1.15 });
  T.finishLine(g, t, X.finish, yB - 8, { pop: pk, torn: b < HBk.finish ? 0 : Math.max(torn, .01) });
  if (!farDog) dog();
  T.hoop(g, t, X.hoop, yB, { part: 'front', pop: pk, rot: hoo.rot, dx: hoo.dx, dy: hoo.dy, sz: 1 });
}
function drawDog(g, t, k, dp) {
  const o = { x: dp.x, y: dp.y, flip: dp.flip, sc: dp.sc, walk: dp.walk, pitch: dp.pitch, bob: dp.lift, squash: dp.squash, eyes: dp.eyes, mouth: dp.mouth, tongue: dp.tongue, brow: dp.brow, ear: dp.ear, look: dp.look, tail: t * 3, legPop: dp.legPop, wag: dp.wag };
  if (dp.spin) {
    const cx = dp.x, cy = dp.y - dp.lift - 50 * dp.sc * 2;
    g.save(); g.translate(cx, cy); g.rotate(dp.spin); g.translate(-cx, -cy);
    T.runner(g, t, k, o);
    g.restore();
  } else T.runner(g, t, k, o);
  if (dp.sleep) sleepEye(g, t, k, o);
}
// Closed eyes for a sleeping dog (the dachshund has only open ones): a coat-coloured patch, then a curve.
function sleepEye(g, t, k, o) {
  const [ex, ey] = T.dogPt(o, k, 260, -224 * (T.LOOKS[k].bodyH || 1) - 12 - 10);
  dot(g, ex, ey, 13, { col: T.LOOKS[k].coat, seed: 610, t });
  line(g, [[ex - 12, ey - 2], [ex, ey + 6], [ex + 12, ey - 2]], { w: 5, col: GRAPHITE, seed: 611, t, spline: true, passes: 1 });
}
const OBX = T.OBX;

// ------------------------------------------------------------------- the judge
function judge(g, t, k, b, dp, lift = 0) {
  const P = phases();
  const cx = { gr: groove(t, 1), vox: 0 };
  const o = { x: 98, y: 1490 + 150 * (.95 / 1.7) - lift, s: .95, body: false, eyes: 'dot', mouth: 0, collar: C.red };
  const tA = timeOf(k, AWARD[k]);
  let hatLift = 0, hatRot = 0;
  if (k === 0) { if (b > 1 && b < FIN[0]) o.eyes = 'wide'; if (b >= FIN[0]) { hatLift = 120 * Math.sin(clamp((b - FIN[0]) / 1.1) * Math.PI); hatRot = (b - FIN[0]) * 4; o.eyes = 'wide'; o.mouth = .5; } }
  if (k === 1) { if (b > 1.6 && b < FIN[1]) { o.eyes = 'shut'; hatRot = .16; } if (b >= FIN[1]) { o.eyes = 'wide'; hatLift = 60 * Math.sin(clamp((b - FIN[1]) / .6) * Math.PI); } }
  if (k === 2) { if (b > 6.3) { o.eyes = 'wide'; o.brow = 1; hatLift = 90 * Math.sin(clamp((b - 6.3) / 1) * Math.PI); o.sweat = true; } else o.eyes = 'dot'; }
  if (k === 3) { if (b > 1.9) { o.eyes = 'happy'; o.mouth = clamp(.4 + .5 * Math.abs(Math.sin(b * 6))); } }
  o.hat = (g2, top, rx) => { g2.save(); g2.translate(0, -hatLift); g2.translate(0, top); g2.rotate(hatRot); g2.translate(0, -top); bowlerDog(g2, top, rx, t); g2.restore(); };
  judgeBulldog(g, t, cx, o);
}
// Where dog k stands when it has finished (for pinning its rosette on).
function drawX(k) { const p = poseOf(k, 8); return { x: p.x, y: p.y, p }; }

// ------------------------------------------------------------------- the audience, along the foot
function crowd(g, t, k, b, pulse, dp) {
  const B = ['lab', 'beagle', 'corgi', 'poodle', 'pug', 'husky', 'mutt', 'dalmatian'];
  for (let i = 0; i < 8; i++) {
    if (i === 0) { judge(g, t, k, b, dp, pulse * 26 + (k === 3 && b > 1.9 ? Math.abs(Math.sin(b * Math.PI)) * 16 : 0)); continue; }
    let eyes = i % 3 === 1 ? 'happy' : 'dot', mouth = 0, tilt = Math.sin(t * 2.2 + i * 1.7) * .06, lift = pulse * 26, sweat = false;
    const beat = Math.abs(Math.sin(b * Math.PI));
    if (k === 0) { const e = b > 1 ? 1 : .2; if (b > 1 && b < FIN[0] + .1) { eyes = 'wide'; mouth = .5; lift += beat * 12; } if (b >= FIN[0] + .1) { eyes = 'happy'; mouth = .8; lift += beat * 22; } }
    if (k === 1) {
      const sleepAt = 1.2 + i * .3;
      if (b > sleepAt && b < FIN[1]) { eyes = 'shut'; tilt = .17 * (i % 2 ? 1 : -1) + Math.sin(t * 1.3 + i) * .04; lift = 0; }
      if (b >= FIN[1]) { eyes = 'happy'; mouth = .4; lift += beat * 8; }
    }
    if (k === 2) { if (b > .5 && b < 6.3) { eyes = 'wide'; mouth = .25; lift += beat * 10; } if (b >= 6.3) { eyes = 'wide'; mouth = .7; sweat = i % 2 === 0; lift += 6; } }
    if (k === 3) { if (b > 1.9) { eyes = 'happy'; mouth = clamp(.5 + .4 * Math.abs(Math.sin(b * 5 + i))); lift += beat * (14 + Math.max(0, b - 4) * 8); tilt += Math.sin(b * 6 + i) * .06; } }
    const x = 90 + i * 128 + Math.sin(t * 2.2 + i) * 3;
    dogFront(g, { x, y: 1490 + (i % 2) * 14 - lift, s: .72, t, seed: 40 + i, breed: B[i], eyes, mouth, tongue: mouth > .6, collar: [C.red, C.blue, C.green, C.purple, C.orange][i % 5], tilt, sweat });
  }
}

// ------------------------------------------------------------------- what is thrown about: dust, stars, words, the price tag, rosettes
function pow(g, t, text, x, y, size, t0, col, rot = 0) {
  const a = t - t0;
  if (a < 0 || a > .75) return;
  const k = backOut(clamp(a / .15), 2.6) * (1 - clamp((a - .55) / .2));
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  write(g, text, 0, size * .5, size, { col: GRAPHITE, seed: 700 + text.length, t, align: 'center', bubble: { fill: col, edge: GRAPHITE, e: 2, f: 1.25 }, track: 6 });
  g.restore();
}
function extras(g, t, k, b, pulse, dp) {
  const P = phases(), HBk = hitBeats()[k];
  const at = n => timeOf(k, HBk[n]);
  const gateX = LANE.x0, gateY = LANE.yA;
  // The first hit: dust at the gate, and rays.
  const t0 = P[k][0];
  T.dust(g, t, gateX - 20, gateY, t - t0, { n: 5, big: 1.3, seed: 30 + k, dir: -1 });
  if (t > t0 - .03 && t < t0 + .28) burst(g, gateX + 10, gateY - 90, 70, 150, t, { col: C.yellow, n: 12, seed: 40 + k, prog: easeOut(clamp((t - t0 + .03) / .28)), w: 9 });
  // A sparkle where each rosette lands on its dial.
  for (let j = 0; j <= k; j++) {
    const [, t1] = crownTimes(j), a = t - t1;
    if (a > 0 && a < .35) { const [cx0, cy0] = T.crownPos(T.WIN[j]); sparkle(g, cx0 + 30, cy0 - 30, 22 * (1 - a / .35), t, { seed: 780 + j, rot: a * 6 }); sparkle(g, cx0 - 36, cy0 + 26, 14 * (1 - a / .35), t, { seed: 790 + j, rot: -a * 5 }); }
  }
  if (k === 0) {
    // Speed lines behind him, dust where he lands, the words for each smash, stars when he is dizzy.
    if (b > .2 && b < FIN[0] && dp.show) [-30, 0, 30].forEach((dy, i) => line(g, [[dp.x - dp.flip * 140, dp.y - 90 + dy - dp.lift], [dp.x - dp.flip * (240 + i * 30), dp.y - 90 + dy - dp.lift]], { w: 7, col: '#8d8c97', seed: 720 + i, t, spline: false, passes: 1, taper: [.3, .05], alpha: .7 }));
    if (b > .6 && b < FIN[0] && dp.show) for (let i = 1; i <= 4; i++) {          // a trail of dust where he has been
      const bp = b - i * .13, q = T.pathAt(sAt(0, bp));
      if (!q.hidden) T.dust(g, t, q.x - 60 * q.flip, q.y, i * .11, { n: 2, big: .8, seed: 90 + i, dir: q.flip });
    }
    pow(g, t, 'CRACK!', T.OBX.hurdle + 60, 940, 64, at('hurdle'), C.orange, -.1);
    pow(g, t, 'CLATTER!', 800, 890, 58, at('weave') + .05, C.yellow, .08);
    pow(g, t, 'SLAM!', T.OBX.seesaw, 1010, 66, at('seesaw'), C.sky, -.06);
    T.dust(g, t, T.obX('hoop'), LANE.yB, t - at('hoop'), { n: 4, big: 1, seed: 50, dir: -1 });
    T.dust(g, t, T.obX('finish') - 40, LANE.yB, t - at('finish'), { n: 6, big: 1.4, seed: 51, dir: -1 });
    if (b > FIN[0] + .9 && b < 7.8) for (let i = 0; i < 3; i++) { const a = t * 4 + i * TAU / 3; sparkle(g, dp.x - 60 + Math.cos(a) * 70, dp.y - 250 + Math.sin(a) * 18, 15, t, { seed: 730 + i, rot: a }); }
  }
  if (k === 1) {
    if (b > 1.2 && b < 6.5) for (let i = 0; i < 4; i++) zzzAt(g, t, 240 + i * 250, 1440, i);
    if (dp.sleep) zzzAt(g, t, dp.x + 120, dp.y - 150, 5);
  }
  if (k === 2 && dp.show && b > 5 && b < 7.4) {          // the gold collar catches the light
    const [gx, gy] = T.dogPt({ x: dp.x, y: dp.y, flip: dp.flip, sc: dp.sc, pitch: dp.pitch, bob: dp.lift }, 2, 205, -140);
    sparkle(g, gx, gy - 10, 14 + 8 * Math.abs(Math.sin(t * 9)), t, { col: '#fff6b0', seed: 800, rot: t * 3 });
  }
  if (k === 2) {
    // The tag drops out of his collar: a running cost, £999 A MONTH.
    const tt = timeOf(2, 6.3), a = t - tt;
    if (a > 0) {
      const src = T.dogPt({ x: dp.x, y: dp.y, flip: dp.flip, sc: dp.sc, pitch: dp.pitch, bob: dp.lift }, 2, 228, -104);
      const u = clamp(a / 1.0), sx = src[0] + Math.sin(u * 9) * 46 * (1 - u * .5), sy = lerp(src[1], LANE.yB + 20, easeIn(u, 1.7)) - Math.sin(Math.min(1, u * 2) * Math.PI) * 60;
      T.priceTag(g, t, sx, sy, lerp(1, 1.5, easeOut(u)), Math.sin(u * 9 + 1) * .5 * (1 - u * .8));
    }
    if (b > 6.3 && b < 7.6) pow(g, t, 'GULP!', dp.x + 40, dp.y - 330, 60, tt, C.teal, .06);
  }
  if (k === 3) {
    // The trill is his legs: they whirl.
    const trill = (b > .4 && b < 1.85) || (b > 2.3 && b < 3.9);
    if (trill && dp.show) {
      const s3 = dp.sc;
      [[-206, 0], [-176, 1], [158, 2], [126, 3]].forEach(([lx, i]) => {
        const [wx, wy] = T.dogPt({ x: dp.x, y: dp.y, flip: dp.flip, sc: dp.sc, pitch: dp.pitch, bob: dp.lift }, 3, lx, -30);
        for (let n = 0; n < 4; n++) { const a = t * 38 + n * Math.PI / 2 + i; line(g, [[wx, wy], [wx + Math.cos(a) * 46 * s3 * 2, wy + Math.sin(a) * 36 * s3 * 2]], { w: 9, col: '#8f4a1c', seed: 810 + i * 4 + n, t, spline: false, passes: 1, alpha: .55, taper: [.1, .3] }); }
      });
    }
    pow(g, t, 'BONK!', T.OBX.hurdle + 40, 930, 64, timeOf(3, 1.95), C.orange, -.08);
    pow(g, t, 'BOING!', T.OBX.seesaw + 20, 1000, 70, timeOf(3, 5.9), C.pink, .06);
    if (b > 0 && b < .9) T.dust(g, t, dp.x, dp.y, (b - .35) * .4305, { n: 4, big: 1, seed: 60, dir: 1 });
    if (b > .5 && b < 1.8) T.dust(g, t, dp.x - 40, dp.y, ((b * 3) % 1) * .5, { n: 3, big: .8, seed: 61, dir: 1 });
    if (b > 2.4 && b < 3.9) T.dust(g, t, dp.x - 40, dp.y, ((b * 3) % 1) * .5, { n: 3, big: .8, seed: 62, dir: 1 });
    confetti(g, t, timeOf(3, 6.1), 1.5, { n: 110, seed: 9, y0: 160, y1: 1500 });
    T.dust(g, t, dp.x, dp.y, t - timeOf(3, FIN[3]), { n: 6, big: 1.5, seed: 63, dir: -1 });
  }
  // Rosettes: on the dog once awarded; then flying up to their dial.
  for (let j = 0; j <= k; j++) {
    const cs = crownState(j, t), tA = timeOf(j, AWARD[j]);
    if (cs.landed || t < tA) continue;
    const fin = drawX(j).p;
    const chest = T.dogPt({ x: fin.x, y: fin.y, flip: fin.flip, sc: fin.sc, pitch: 0, bob: 0 }, j, 210, -104 * (T.LOOKS[j].bodyH || 1));
    let x = chest[0], y = chest[1] - 6, r = 46 * pop(t, tA, .3), tilt = .1;
    if (cs.flying) {
      const [cxp, cyp] = T.crownPos(T.WIN[j]), u = smooth(cs.p);
      x = lerp(chest[0], cxp, u); y = lerp(chest[1], cyp, u) - Math.sin(u * Math.PI) * 200; r = lerp(46, 34, u); tilt = u * 1.2;
    } else if (t < tA + .5) {
      burst(g, chest[0], chest[1], 40, 110, t, { col: ROS[j], n: 10, seed: 750 + j, prog: easeOut(clamp((t - tA) / .3)), w: 8 });
      sparkle(g, chest[0] + 50, chest[1] - 50, 20 * clamp(1 - (t - tA) / .5), t, { seed: 760 + j });
    }
    rosette(g, x, y, r, ROS[j], t, { seed: 770 + j * 7, tilt });
  }
}
function zzzAt(g, t, x, y, i) { T.zzz(g, t, x, y, 1, i + 1); }

export const __t = { WP, FIN, KEYS, AWARD };
