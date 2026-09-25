// Synthesised drum kit. Each voice renders one hit into a new Float32Array (mono), starting at
// the stick's contact, from a velocity 0–1 and a seeded random stream. The caller places, pans
// and chokes the hits. Recipes follow MUSIC.md "Sound design" (Sound on Sound, TR-808).
import { biquad } from '../audio.mjs';
import { blepSquare, svf } from './dsp.mjs';

const TAU = 2 * Math.PI;
const ms = (sr, x) => Math.round((x / 1000) * sr);

// A short raised-cosine fade-in, so even transients start from zero.
const fadeIn = (k, n) => (k >= n ? 1 : 0.5 - 0.5 * Math.cos((Math.PI * k) / n));

// Kick: a sine swept down to the resting pitch, a beater click, a little saturation.
// Resting pitch B♭1 (58 Hz), the fifth of E♭, so it sits in the key under the bass.
export function kick(vel, rand, sr, { pitch = 58.3 } = {}) {
  const n = ms(sr, 450);
  const out = new Float32Array(n);
  const start = pitch * (2.4 + 0.3 * vel);
  const hp = biquad('hp', 1800, 0.7, sr);
  const click = biquad('bp', 3500, 1.2, sr);
  let phase = 0;
  for (let k = 0; k < n; k++) {
    const t = k / sr;
    const f = pitch + (start - pitch) * Math.exp(-t / 0.016);
    phase += f / sr;
    const body = Math.sin(TAU * phase) * Math.exp(-Math.max(0, t - 0.012) / 0.07);
    const noise = rand() * 2 - 1;
    const c = (hp(noise) * 0.5 + click(noise) * 1.2) * Math.exp(-t / 0.0025);
    const x = body * 1.15 + c * (0.4 + 0.5 * vel);
    out[k] = Math.tanh(1.6 * x) / Math.tanh(1.6) * vel * fadeIn(k, 12);
  }
  return out;
}

// Snare: two drum-head modes (about 185 and 330 Hz) plus filtered wire noise on a slower
// envelope. A harder hit opens the noise filter wider.
export function snare(vel, rand, sr, { ghost = false } = {}) {
  const n = ms(sr, 500);
  const out = new Float32Array(n);
  const f1 = 185 * (1 + 0.01 * (rand() - 0.5));
  const f2 = 330 * (1 + 0.01 * (rand() - 0.5));
  const nhp = biquad('hp', 900, 0.7, sr);
  const nlp = biquad('lp', 4000 + 5000 * vel, 0.6, sr);
  const npk = biquad('peak', 4200, 1, sr, 1.5);
  const crack = biquad('bp', 1800, 1.5, sr);
  let p1 = 0, p2 = 0;
  const tn = ghost ? 0.03 : 0.05 + 0.02 * vel;
  for (let k = 0; k < n; k++) {
    const t = k / sr;
    const drop = 1 + 0.12 * Math.exp(-t / 0.01);
    p1 += (f1 * drop) / sr;
    p2 += (f2 * drop) / sr;
    const tone = 1.4 * Math.sin(TAU * p1) * Math.exp(-t / 0.05) + 0.6 * Math.sin(TAU * p2) * Math.exp(-t / 0.03);
    const w = rand() * 2 - 1;
    const wires = npk(nlp(nhp(w))) * Math.exp(-t / tn);
    const stick = crack(w) * Math.exp(-t / 0.004);
    out[k] = (tone * (0.8 + 0.2 * (1 - vel)) + wires * (0.8 + 0.6 * vel) + stick * 1.4) * vel * fadeIn(k, 8);
  }
  return out;
}

// Toms: a sine that drops slightly in pitch, a weaker inharmonic second mode, a soft head noise.
export const TOM_PITCH = { high: 155.6, mid: 116.5, floor: 87.3 }; // E♭3, B♭2, F2
export function tom(vel, rand, sr, { pitch = 116.5 } = {}) {
  const n = ms(sr, 900);
  const out = new Float32Array(n);
  const tau = 0.12 + 18 / pitch; // bigger drums ring longer
  const nlp = biquad('lp', 3000, 0.7, sr);
  let p1 = 0, p2 = 0;
  for (let k = 0; k < n; k++) {
    const t = k / sr;
    const drop = 1 + 0.25 * Math.exp(-t / 0.03);
    p1 += (pitch * drop) / sr;
    p2 += (pitch * 1.59 * drop) / sr;
    const body = Math.sin(TAU * p1) * Math.exp(-t / tau) + 0.3 * Math.sin(TAU * p2) * Math.exp(-t / (tau * 0.4));
    const head = nlp(rand() * 2 - 1) * Math.exp(-t / 0.012);
    out[k] = Math.tanh(1.3 * (body + 0.6 * head)) * vel * fadeIn(k, 10);
  }
  return out;
}

// Metal: six band-limited square waves at inharmonic, non-octave ratios (the TR-808 recipe),
// mixed with noise, band-passed and high-passed. One generator makes hats, ride and crash.
const HAT_FREQS = [205.3, 304.4, 369.6, 522.7, 540, 800];
const CRASH_FREQS = [245, 367.5, 431.1, 563.3, 672.6, 941.2];
function metal(n, rand, sr, { freqs, tune, noiseMix, bp, bpQ, hp, env, lp = 16000 }) {
  const out = new Float32Array(n);
  const f = freqs.map((x) => x * tune * (1 + 0.004 * (rand() - 0.5)));
  const ph = f.map(() => rand());
  const band = biquad('bp', bp, bpQ, sr);
  const band2 = biquad('bp', bp * 2.1, bpQ, sr);
  const h1 = biquad('hp', hp, 0.7, sr);
  const h2 = biquad('hp', hp, 0.7, sr);
  const l1 = biquad('lp', lp, 0.7, sr);
  for (let k = 0; k < n; k++) {
    let sq = 0;
    for (let j = 0; j < 6; j++) {
      const dt = f[j] / sr;
      ph[j] += dt;
      if (ph[j] >= 1) ph[j] -= 1;
      sq += blepSquare(ph[j], dt);
    }
    const x = (sq / 6) * (1 - noiseMix) + (rand() * 2 - 1) * noiseMix;
    const y = l1(h2(h1(band(x) + 0.7 * band2(x))));
    out[k] = y * env(k / sr) * fadeIn(k, 4);
  }
  return out;
}

// Hi-hat: closed ~50 ms, half-open ~130 ms, open ~300 ms. The caller chokes an open hat.
export function hat(vel, rand, sr, { open = 0 } = {}) {
  const tau = 0.012 + open * 0.09;
  const n = ms(sr, 60 + open * 700);
  const bright = 0.7 + 0.3 * vel;
  const out = metal(n, rand, sr, {
    freqs: HAT_FREQS, tune: 1.6, noiseMix: 0.45, bp: 8000, bpQ: 0.9, hp: 6500, lp: 13000 + 4000 * bright,
    env: (t) => Math.exp(-t / tau) * (0.6 + 0.4 * Math.exp(-t / 0.004)),
  });
  for (let k = 0; k < n; k++) out[k] *= vel * 2.2;
  return out;
}

// Crash: brighter wash with a long tail (about 2.5 s to -60 dB).
export function crash(vel, rand, sr) {
  const n = ms(sr, 3200);
  const out = metal(n, rand, sr, {
    freqs: CRASH_FREQS, tune: 1.9, noiseMix: 0.6, bp: 5200, bpQ: 0.5, hp: 2800, lp: 15000,
    env: (t) => 0.55 * Math.exp(-t / 0.4) + 0.45 * Math.exp(-t / 0.05),
  });
  for (let k = 0; k < n; k++) out[k] *= vel * 2.4;
  return out;
}

// Cymbal swell (mallets rolled on a crash) under a build: noise through a band-pass sweeping
// 500 Hz → 8 kHz, rising in level, n samples long.
export function swell(n, vel, rand, sr) {
  const out = new Float32Array(n);
  const f = svf(sr);
  for (let k = 0; k < n; k++) {
    const x = k / n;
    f.set(500 * 16 ** x, 1.2);
    const [, band] = f.run(rand() * 2 - 1);
    out[k] = band * x * x * vel * 1.5;
  }
  return out;
}

// Ride: stick ping and bell partials over a quiet metallic wash.
const RIDE_PARTIALS = [[523, 1], [1172, 0.6], [2345, 0.35], [3150, 0.25], [4890, 0.15]];
export function ride(vel, rand, sr, { bell = false } = {}) {
  const n = ms(sr, 2000);
  const wash = metal(n, rand, sr, {
    freqs: CRASH_FREQS, tune: 2.3, noiseMix: 0.4, bp: 6500, bpQ: 0.7, hp: 3500,
    env: (t) => 0.3 * Math.exp(-t / 0.35) + 0.7 * Math.exp(-t / 0.03),
  });
  const ping = biquad('bp', 6000, 1, sr);
  const b = bell ? 1 : 0.35;
  for (let k = 0; k < n; k++) {
    const t = k / sr;
    let p = 0;
    for (const [f, a] of RIDE_PARTIALS) p += a * Math.sin(TAU * f * t) * Math.exp(-t / (0.25 + 60 / f));
    const stick = ping(rand() * 2 - 1) * Math.exp(-t / 0.003);
    wash[k] = (wash[k] * 1.4 + p * 0.12 * b + stick * 0.8) * vel * fadeIn(k, 4);
  }
  return wash;
}
