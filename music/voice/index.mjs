// All-code singing voice. Public interface:
//
//   singLine(events, opts) -> Float32Array (mono, 48 kHz)
//
// events: one per syllable, times in seconds from the start of the returned buffer:
//   { start,        // vowel onset, on the beat; onset consonants are placed before it
//     end,         // end of the syllable; coda consonants finish here (or earlier if the
//                  //   next syllable's onset needs the room)
//     midi,        // note, or pitch: [[t, midi], ...] for a free curve (speech)
//     phonemes,    // IPA strings, e.g. ['g', 'ʊ', 'd']; see phonemes.mjs
//     stress,      // 0 | 1 (louder, brighter)
//     scoop,       // optional: semitones below to start from, or { semis, dur }
//     dyn }        // optional 0..1 loudness override
// opts: { seed, tract, breath, brightness, jitter, shimmer, vibratoRate, vibratoDepth,
//         reverb (wet 0..1), deess (bool), dry (skip post), tail (s) }
//
// speakLine(words, opts) builds events for a spoken line (free timing, falling contour).

import { schedule, buildTracks, buildPitch, FR } from './score.mjs';
import { synthesise } from './synth.mjs';
import { CONS } from './phonemes.mjs';
import { highpass, deess, reverb, normalise, removeDC } from './post.mjs';

export { writeWav } from './util.mjs';

export function singLine(events, opts = {}) {
  return renderLine(events, opts).audio;
}

// Same as singLine, plus the resolved syllable timing (vowel onsets/ends) for checks.
export function renderLine(events, opts = {}) {
  const sr = 48000;
  const { syls, segs } = schedule(events, opts);
  const last = Math.max(...segs.map((s) => s.t1));
  const dur = last + (opts.tail ?? 0.8);
  const T = buildTracks(segs, syls, dur, opts);
  const f0 = buildPitch(syls, T.N, opts);
  modifyHighVowels(T, f0, opts);
  let x = synthesise(T, f0, { ...opts, sr });
  removeDC(x);
  const timing = syls.map((s) => ({ start: s.start, vowelEnd: s.vowelEnd, midi: s.midi, onsetStart: s.onsetStart }));
  if (!opts.dry) {
    highpass(x, 90, sr);
    if (opts.deess !== false) deess(x, { sr });
    x = reverb(x, { sr, wet: opts.reverb ?? 0.06 });
  }
  return { audio: normalise(x, opts.peakDb ?? -1), syls: timing };
}

// Formant tuning: when f0 rises past F1, sopranos raise F1 to follow it (and open the vowel).
// Only inside vowels: consonant transitions keep their low F1 (a manner and voicing cue).
// High notes also get more breath noise, which fills in the formant envelope between the
// sparse harmonics.
function modifyHighVowels(T, f0, opts = {}) {
  const hb = opts.highBreath ?? 0;
  for (let f = 0; f < T.N; f++) {
    if (hb) T.AH[f] *= 1 + hb * Math.max(0, (f0[f] - 250) / 250);
    const w = T.VOW[f] * Math.max(0, 1 - T.MUR[f]);
    const want = f0[f] * 1.12;
    if (T.F1[f] < want) {
      T.F1[f] += (want - T.F1[f]) * w;
      T.B1[f] = Math.max(T.B1[f], 90);
    }
    if (T.F2[f] < f0[f] * 2.1) T.F2[f] += (f0[f] * 2.1 - T.F2[f]) * w * 0.5;
  }
}

// words: [{ ph: [...], stress, dur? }] -> events with speech timing and a falling contour
// from `hi` to `lo` (midi), a pitch accent on stressed syllables.
export function speakLine(words, { at = 0.3, hi = 58, lo = 51, rate = 1, accent = 2.5 } = {}) {
  const evs = [];
  let t = at;
  const n = words.length;
  words.forEach((w, i) => {
    // vowels lengthen before voiced codas and shorten before voiceless ones
    const last = CONS[w.ph[w.ph.length - 1]];
    const vf = !last ? 1 : last.voiced || ['nasal', 'approx'].includes(last.kind) ? 1.15 : 0.85;
    const d = ((w.dur ?? (w.stress ? 0.2 : 0.13)) * vf) / rate;
    const pre = w.ph.findIndex((p) => /[aeiouæʌɑɒɔʊɜəɪ]/.test(p));
    t += pre > 0 ? 0.06 * pre : 0;
    const base = hi + ((lo - hi) * i) / Math.max(1, n - 1);
    const a = w.stress ? accent : 0;
    const pitch = i === n - 1
      ? [[t, base + a], [t + d * 0.9, lo - 2]]
      : [[t, base + a * 0.6], [t + d * 0.4, base + a], [t + d, base]];
    evs.push({ start: t, end: t + d, pitch, phonemes: w.ph, stress: w.stress ? 1 : 0, dyn: w.stress ? 0.95 : 0.8 });
    t += d + (w.gap ?? 0.02);
  });
  return evs;
}

export { FR };
