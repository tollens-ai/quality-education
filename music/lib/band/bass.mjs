// Picked electric bass: a band-limited saw plus a sine at the fundamental, through a
// state-variable low-pass whose cutoff drops after the pick, then light oversampled drive so
// the notes still read on phone speakers. A parallel, harder-driven copy band-passed to
// 150–700 Hz adds the 2nd–4th harmonics a phone plays in place of the fundamental.
// Palm-muted notes are darker and shorter.
import { biquad, filterInPlace, mtof } from '../audio.mjs';
import { blepSaw, dcBlock, oversample4, svf } from './dsp.mjs';

// notes: [{ i, len, midi, vel, mute, rand }] (sample start and length).
export function renderBass(notes, total, sr) {
  const di = new Float32Array(total);
  for (const nt of notes) {
    const f = mtof(nt.midi);
    const dt = f / sr;
    const rel = Math.round(0.012 * sr);
    const n = Math.min(nt.len + rel, total - nt.i);
    const filt = svf(sr);
    const click = biquad('bp', 2200, 1.5, sr);
    const peak = (450 + 1000 * nt.vel) * (1 - 0.5 * nt.mute);
    const base = 220 - 60 * nt.mute;
    const tau = 0.09 - 0.05 * nt.mute;
    let ph = nt.rand() * 0.2;
    for (let k = 0; k < n; k++) {
      const t = k / sr;
      ph += dt;
      if (ph >= 1) ph -= 1;
      const osc = 0.45 * blepSaw(ph, dt) + 0.9 * Math.sin(2 * Math.PI * ph);
      filt.set(base + (peak - base) * Math.exp(-t / tau), 0.9);
      const [lp] = filt.run(osc);
      const env = Math.min(1, k / (0.002 * sr)) // attack
        * (0.72 + 0.28 * Math.exp(-t / 0.12)) // pluck decay to sustain
        * Math.exp(-t / (2.5 - 2.25 * nt.mute)) // string decay
        * (k > nt.len ? 1 - (k - nt.len) / rel : 1); // release
      const pick = click(nt.rand() * 2 - 1) * Math.exp(-t / 0.002) * 0.25;
      di[nt.i + k] += (lp + pick) * env * nt.vel;
    }
  }
  const driven = oversample4(di, (v) => Math.tanh(1.8 * v) / 1.8 * 1.6);
  const grit = filterInPlace(oversample4(di, (v) => Math.tanh(5 * v)),
    biquad('hp', 150, 0.7, sr), biquad('hp', 150, 0.7, sr), biquad('lp', 700, 0.7, sr), biquad('lp', 700, 0.7, sr));
  for (let i = 0; i < total; i++) driven[i] += 0.2 * grit[i];
  return filterInPlace(driven,
    dcBlock(sr),
    biquad('hp', 35, 0.7, sr),
    biquad('hp', 35, 0.7, sr),
    biquad('peak', 60, 0.9, sr, -4),
    biquad('peak', 150, 0.8, sr, 3),
    biquad('peak', 400, 1, sr, -3), // out of the guitars' and the voice's way
    biquad('peak', 700, 1.2, sr, 1.5), // a little growl for small speakers
    biquad('lp', 1700, 0.7, sr),
    biquad('lp', 2200, 0.7, sr),
  );
}
