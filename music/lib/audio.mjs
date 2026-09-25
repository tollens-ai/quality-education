// Small audio helpers shared by the renderers: time conversion, WAV output, seeded noise,
// biquad filters.
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

// Stable 32-bit hash of any keys, so each event gets its own random stream:
// seeded('gtrL', 'pluck', t) never shifts when another event is added.
export function hash(...keys) {
  let h = 0x811c9dc5;
  for (const ch of keys.join('|')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
export const seeded = (...keys) => rng(hash(...keys));

// Approximately Gaussian, unit variance (sum of four uniforms).
export const gauss = (rand) => (rand() + rand() + rand() + rand() - 2) * Math.sqrt(3);

export const db = (x) => 10 ** (x / 20);

// Constant-power pan, p in [-1, 1].
export const panGains = (p) => [Math.cos(((p + 1) * Math.PI) / 4), Math.sin(((p + 1) * Math.PI) / 4)];

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

// 32-bit float WAV, any number of channels (stems and mixes, before any bit-depth reduction).
export function writeWavFloat(path, channels, sampleRate) {
  const n = channels[0].length;
  const nc = channels.length;
  const buf = Buffer.alloc(44 + n * nc * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * nc * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(3, 20); // IEEE float
  buf.writeUInt16LE(nc, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * nc * 4, 28);
  buf.writeUInt16LE(nc * 4, 32);
  buf.writeUInt16LE(32, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * nc * 4, 40);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++, o += 4) buf.writeFloatLE(channels[c][i], o);
  writeFileSync(path, buf);
}

// Biquad filters (RBJ cookbook): lp, hp, bp (0 dB peak), peak, lowshelf, highshelf.
// Returns a per-sample function; gainDb is used by peak and shelves.
export function biquad(type, f, q, sr, gainDb = 0) {
  const w = (2 * Math.PI * f) / sr;
  const alpha = Math.sin(w) / (2 * q);
  const cos = Math.cos(w);
  const A = 10 ** (gainDb / 40);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'peak') {
    [b0, b1, b2] = [1 + alpha * A, -2 * cos, 1 - alpha * A];
    [a0, a1, a2] = [1 + alpha / A, -2 * cos, 1 - alpha / A];
  } else if (type === 'lowshelf' || type === 'highshelf') {
    const s = type === 'lowshelf' ? -1 : 1;
    const r = 2 * Math.sqrt(A) * alpha;
    b0 = A * (A + 1 + s * (A - 1) * cos + r);
    b1 = -2 * s * A * (A - 1 + s * (A + 1) * cos);
    b2 = A * (A + 1 + s * (A - 1) * cos - r);
    a0 = A + 1 - s * (A - 1) * cos + r;
    a1 = 2 * s * (A - 1 - s * (A + 1) * cos);
    a2 = A + 1 - s * (A - 1) * cos - r;
  } else {
    if (type === 'lp') [b0, b1, b2] = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2];
    else if (type === 'hp') [b0, b1, b2] = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
    else [b0, b1, b2] = [alpha, 0, -alpha]; // band-pass, 0 dB peak
    [a0, a1, a2] = [1 + alpha, -2 * cos, 1 - alpha];
  }
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

// Run a chain of per-sample filters over a buffer, in place.
export function filterInPlace(buf, ...filters) {
  for (let i = 0; i < buf.length; i++) {
    let x = buf[i];
    for (const f of filters) x = f(x);
    buf[i] = x;
  }
  return buf;
}
