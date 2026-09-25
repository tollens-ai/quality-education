// Prints each consonant's level relative to the vowel /ɑː/ in an /ɑː C ɑː/ frame (dry, no post),
// so frication, burst and aspiration levels can be set against speech norms.
// Usage: node music/voice/calibrate.mjs
import { schedule, buildTracks, buildPitch } from './score.mjs';
import { synthesise } from './synth.mjs';

const sr = 48000;
const rms = (x, a, b) => {
  let s = 0;
  for (let i = Math.floor(a * sr); i < Math.floor(b * sr); i++) s += x[i] * x[i];
  return Math.sqrt(s / Math.max(1, Math.floor(b * sr) - Math.floor(a * sr)));
};
const db = (v) => (20 * Math.log10(v)).toFixed(1);

export function renderRaw(events, opts = {}) {
  const { syls, segs } = schedule(events, opts);
  const dur = Math.max(...segs.map((s) => s.t1)) + 0.3;
  const T = buildTracks(segs, syls, dur, opts);
  const f0 = buildPitch(syls, T.N, opts);
  return { x: synthesise(T, f0, { sr, ...opts }), segs };
}

const cons = process.argv.slice(2).length ? process.argv.slice(2) : ['s', 'z', 'ʃ', 'f', 'v', 'θ', 'ð', 'h', 'p', 't', 'k', 'b', 'd', 'g', 'tʃ', 'm', 'n', 'l', 'r', 'w', 'j'];
for (const c of cons) {
  const evs = [
    { start: 0.2, end: 0.6, midi: 65, phonemes: ['ɑː'], stress: 1 },
    { start: 0.8, end: 1.2, midi: 65, phonemes: [c, 'ɑː'], stress: 1 },
  ];
  const { x, segs } = renderRaw(evs, { seed: 1 });
  const v = rms(x, 0.3, 0.5);
  const g = segs.find((s) => s.ph === c && s.pos === 'onset');
  // loudest 5 ms window inside the consonant, and its mean level
  let peak = 0;
  for (let t = g.t0; t < g.t1 - 0.005; t += 0.001) peak = Math.max(peak, rms(x, t, t + 0.005));
  console.log(`${c.padEnd(3)} mean ${db(rms(x, g.t0, g.t1) / v).padStart(6)} dB  peak5ms ${db(peak / v).padStart(6)} dB  (${((g.t1 - g.t0) * 1000).toFixed(0)} ms)`);
}
