// Small shared helpers: seeded PRNG and a 32-bit float WAV writer.
import { writeFileSync } from 'node:fs';

// mulberry32: deterministic uniform [0, 1)
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

// approximately Gaussian (sum of 4 uniforms), unit variance
export function gaussian(R) {
  return (R() + R() + R() + R() - 2) * 1.732;
}

// Mono or multi-channel 32-bit float WAV.
export function writeWav(path, channels, sr = 48000) {
  const chs = Array.isArray(channels) ? channels : [channels];
  const n = chs[0].length, nc = chs.length;
  const buf = Buffer.alloc(44 + n * nc * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * nc * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(3, 20);
  buf.writeUInt16LE(nc, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * nc * 4, 28);
  buf.writeUInt16LE(nc * 4, 32); buf.writeUInt16LE(32, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * nc * 4, 40);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++, o += 4) buf.writeFloatLE(chs[c][i], o);
  writeFileSync(path, buf);
}
