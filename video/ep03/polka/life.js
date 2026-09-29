// What makes a drawing live: things keep moving after the body stops, the eyes shut every few seconds,
// a body breathes, ears and tails lag behind the head, and the whole cast reacts to each sung word, not
// only to the beat. Every function is a pure function of the time, so a frame can be drawn on its own.
import { TAU, clamp, lerp, hash, noise, lastIndex, beatTimes, downTimes, wordTimes, beatPos, loud, REC } from './kit.js';

// A damped oscillation set off by each event in a list of times: how an ear, an arm or a tail keeps
// swinging after the thing it is attached to has moved. f is its frequency (Hz), z how quickly it dies.
export function ring(t, times, { f = 2.4, z = .16, amp = 1, span = 1.5 } = {}) {
  const w = TAU * f;
  let y = 0;
  for (let i = lastIndex(times, t); i >= 0 && t - times[i] < span; i--) {
    const d = t - times[i];
    y += Math.exp(-z * w * d) * Math.sin(w * d);
  }
  return y * amp;
}
export const beatRing = (t, o) => ring(t, beatTimes(), o);
export const downRing = (t, o) => ring(t, downTimes(), o);
// The whole cast reacts to each sung word: a small shake for every syllable-ish onset.
export const wordRing = (t, o) => ring(t, wordTimes(), { f: 3.4, z: .34, span: .7, ...o });

// A blink: 0 open, 1 shut, every couple of seconds at times of its own.
export function blink(t, seed = 1) {
  const period = 2.3 + hash(seed, 1) * 2.4;
  const ph = (t + hash(seed, 2) * period) % period;
  const d = .17;
  return ph < d ? Math.sin(ph / d * Math.PI) : 0;
}
// A slow drift, for the eyes' wander and for breathing.
export const wander = (t, seed = 1, rate = .5) => noise(t * rate + hash(seed, 3) * 50, seed);
export const breathe = (t, seed = 1, rate = .55) => Math.sin(t * TAU * rate + hash(seed, 4) * TAU);

// The bounce: contact on each beat (squash), a stretch as it leaves, air between; bigger on the oom.
// `k` scales it (0 stands still). Returns {lift px, sq -1..1 (positive squashed), on: is it the oom}.
export function bounce(t, k = 1, oomK = 1.5) {
  const B = beatTimes();
  const i = lastIndex(B, t);
  if (i < 0 || i >= B.length - 1) return { lift: 0, sq: 0, on: false };
  const ph = (t - B[i]) / (B[i + 1] - B[i]);
  const oom = REC.beats[i].down;
  const a = k * (oom ? oomK : 1);
  const air = Math.sin(Math.PI * ph);
  const land = Math.exp(-ph / .09) * .34 + Math.exp(-(1 - ph) / .06) * -.1;   // squash at contact, stretch just before it
  return { lift: air * 34 * a, sq: land * a - air * .06 * a, on: oom };
}
// A little acting on the eyes: where they look, with the wander of a live thing.
export function eyeDrift(t, seed = 1, amt = .5) {
  return [wander(t, seed + 1, .35) * amt, wander(t, seed + 2, .3) * amt * .6];
}
// The contact shadow under a character: smaller and fainter the higher they are.
export function shadowAt(g, x, y, w, lift = 0, alpha = .3) {
  const k = clamp(1 - lift / 160);
  g.save();
  g.translate(x, y);
  g.scale(1, .17);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, w * .55 * (.75 + .25 * k));
  gr.addColorStop(0, `rgba(44,43,54,${alpha * k})`);
  gr.addColorStop(.6, `rgba(44,43,54,${alpha * k * .55})`);
  gr.addColorStop(1, 'rgba(44,43,54,0)');
  g.fillStyle = gr;
  g.beginPath(); g.arc(0, 0, w * .55, 0, TAU); g.fill();
  g.restore();
}

// Everything a character does when nobody is directing it: shuts its eyes now and then, lets them wander,
// breathes. Characters call this themselves, so every drawing in the film is alive.
export function idle(t, seed = 1) {
  return { blink: blink(t, seed), look: eyeDrift(t, seed, .55), breath: breathe(t, seed) };
}

// ---------------------------------------------------------------- timing shapes for acting
// All pure functions of the time, so any frame can be drawn on its own.
// A value that goes 0 -> 1 from t0, overshooting and ringing like a spring: f its frequency (Hz), z its damping (0..1, smaller rings longer).
export function spring(t, t0, { f = 2.6, z = .3 } = {}) {
  if (t <= t0) return 0;
  const d = t - t0, w = TAU * f, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * d) * (Math.cos(wd * d) + z * w / wd * Math.sin(wd * d));
}
// A shake that starts at t0 and dies away: amplitude amp at the start, f Hz.
export function shake(t, t0, { dur = .6, amp = 1, f = 9 } = {}) {
  if (t < t0 || t > t0 + dur) return 0;
  const d = t - t0;
  return Math.sin(d * TAU * f) * amp * Math.pow(1 - d / dur, 1.6);
}
// A parabolic hop from t0 to t1, h px high: 0 on the ground, h at the top.
export function hop(t, t0, t1, h) {
  if (t <= t0 || t >= t1) return 0;
  const u = (t - t0) / (t1 - t0);
  return 4 * h * u * (1 - u);
}
// A pulse: rises at t0, holds to t1, falls (each edge `e` long), 0..1.
export function gate(t, t0, t1, e = .12) {
  return Math.max(0, Math.min(1, (t - t0) / e, (t1 - t) / e));
}
// 0 before a, 1 after b, eased between.
export function ease(t, a, b, fn = x => x * x * (3 - 2 * x)) {
  return fn(Math.max(0, Math.min(1, (t - a) / Math.max(1e-6, b - a))));
}
