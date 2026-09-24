// Small audio helpers shared by the renderers: time conversion, WAV output, seeded noise.
import { writeFileSync } from 'node:fs';

export const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// Sixteenths to samples, once, through the tempo (no accumulated float durations).
export const timing = (bpm, sampleRate, startT = 0) => (t) =>
  Math.round(((t - startT) / 4) * (60 / bpm) * sampleRate);

// Mulberry32: a small seeded PRNG, so renders are repeatable.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stereo(length) {
  return [new Float32Array(length), new Float32Array(length)];
}

// Write 16-bit PCM stereo, with TPDF dither.
export function writeWav(path, [l, r], sampleRate, gain = 1) {
  const n = l.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  const rand = rng(1);
  let peak = 0;
  for (let i = 0; i < n; i++) {
    for (const [c, ch] of [[0, l], [1, r]]) {
      const x = ch[i] * gain;
      peak = Math.max(peak, Math.abs(x));
      const d = (rand() - rand()) / 32768;
      const v = Math.max(-1, Math.min(1, x + d));
      buf.writeInt16LE(Math.round(v * 32767), 44 + i * 4 + c * 2);
    }
  }
  writeFileSync(path, buf);
  return peak;
}

// One-pole and biquad filters, enough for guide sounds.
export function biquad(type, f, q, sr) {
  const w = (2 * Math.PI * f) / sr;
  const alpha = Math.sin(w) / (2 * q);
  const cos = Math.cos(w);
  let b0, b1, b2;
  if (type === 'lp') [b0, b1, b2] = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2];
  else if (type === 'hp') [b0, b1, b2] = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
  else [b0, b1, b2] = [alpha, 0, -alpha]; // band-pass, 0 dB peak
  const a0 = 1 + alpha;
  const a1 = -2 * cos;
  const a2 = 1 - alpha;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}
