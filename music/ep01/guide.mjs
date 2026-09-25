// Click-and-guide render of the score: click, root bass, soft chords and a plain voice-like
// tone for every sung part. It exists to check phrasing and harmony before any sound design.
// Run: node music/ep01/guide.mjs   → music/out/ep01-guide.wav and ep01-guide-events.json
// GUIDE_ONLY=lead (or gang, bots, spoken) renders just that part's tone.
// `guideVoices()` renders the voice tones alone, for other renders to layer (band.mjs).
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { biquad, mtof, rng, stereo, timing, writeWav } from '../lib/audio.mjs';
import { chordTones } from '../lib/notation.mjs';
import { chords, meta, sections, vocals } from './score.mjs';

const SR = meta.sampleRate;
const at = timing(meta.bpm, SR, meta.startT);
const beatSec = 60 / meta.bpm;
export const guideLength = at(meta.endT) + SR;
const total = guideLength;

// Bars where the band stops or drops out (the guide mirrors the arrangement's silences).
const silentBars = new Set([11, 12, 20, 44, 45, 53, 84, 96]);
const bandOn = (t) => !silentBars.has(Math.floor(t / 16)) || t % 16 < 1;

const adder = ([L, R]) => (i, l, r) => {
  if (i >= 0 && i < total) {
    L[i] += l;
    R[i] += r;
  }
};

// ---- Voice-like tone: additive harmonics under a vowel envelope ----------------------------
const VOWEL = { ah: [800, 1200, 2600], oh: [500, 900, 2500], ee: [350, 2200, 2900] };
function formantGain(f, [f1, f2, f3]) {
  const peak = (fc, bw) => 1 / (1 + ((f - fc) / bw) ** 2);
  return 0.15 + peak(f1, 180) + 0.7 * peak(f2, 220) + 0.35 * peak(f3, 300);
}

function sing(add, e, { gain, pan, vowel = 'ah', detune = 0, odd = false, seed = 1 }) {
  const start = at(e.t);
  const len = Math.max(at(e.t + e.dur) - start, 1);
  const rel = Math.round(0.04 * SR);
  const att = Math.round(0.015 * SR);
  const target = e.midi + detune;
  const from = e.glide.length ? e.glide[0] + detune : target;
  const glideLen = Math.min(0.12 * SR, len * 0.3);
  const rand = rng(seed);
  let phase = rand();
  const acc = e.stress ? 1.4 : 1;
  for (let k = 0; k < len + rel; k++) {
    const tSec = k / SR;
    const m = k < glideLen ? from + (target - from) * (k / glideLen) : target;
    const vib = tSec > 0.35 ? 0.25 * Math.sin(2 * Math.PI * 5.5 * tSec) * Math.min(1, (tSec - 0.35) / 0.3) : 0;
    const f0 = mtof(m + vib);
    phase += f0 / SR;
    let s = 0;
    for (let h = 1; h * f0 < 5000; h++) {
      if (odd && h % 2 === 0) continue;
      s += (formantGain(h * f0, VOWEL[vowel]) / h) * Math.sin(2 * Math.PI * h * phase);
    }
    const env = Math.min(1, k / att) * (k > len ? 1 - (k - len) / rel : 1);
    const v = s * env * gain * acc;
    add(start + k, v * (1 - pan) * 0.7, v * (1 + pan) * 0.7);
  }
}

// The voice tones alone (all parts, or just `only`), as a stereo pair. Sample 0 is meta.startT.
export function guideVoices(only) {
  const out = stereo(total);
  const add = adder(out);
  for (const e of vocals) {
    if (only && e.voice !== only) continue;
    if (e.voice === 'lead') sing(add, e, { gain: 0.16, pan: 0 });
    else if (e.voice === 'spoken') sing(add, { ...e, dur: Math.min(e.dur, 2) }, { gain: 0.12, pan: 0, vowel: 'oh' });
    else if (e.voice === 'gang') {
      sing(add, e, { gain: 0.06, pan: -0.6, vowel: 'oh', detune: -0.08, seed: 2 });
      sing(add, e, { gain: 0.06, pan: 0.6, vowel: 'oh', detune: 0.08, seed: 3 });
    } else if (e.voice === 'bots') sing(add, e, { gain: 0.1, pan: e.t % 8 < 4 ? -0.5 : 0.5, vowel: 'ee', odd: true });
  }
  return out;
}

// ---- Click, bass and chords ------------------------------------------------------------------
function accompany([L, R]) {
  const add = adder([L, R]);
  for (let t = meta.startT - (meta.startT % 4); t < meta.endT; t += 4) {
    const i0 = at(t);
    const down = t % 16 === 0;
    const f = down ? 1800 : 1200;
    for (let k = 0; k < 0.03 * SR; k++) {
      const v = Math.sin((2 * Math.PI * f * k) / SR) * Math.exp(-k / (0.006 * SR)) * (down ? 0.12 : 0.07);
      add(i0 + k, v, v);
    }
  }

  const bassLP = biquad('lp', 700, 0.7, SR);
  const bassBuf = new Float32Array(total);
  for (const c of chords) {
    const { root, tones } = chordTones(c.chord);
    if (root === null) continue;
    // Bass: root in octave 2, eighth notes.
    for (let t = c.t; t < c.t + c.dur; t += 2) {
      if (!bandOn(t)) continue;
      const i0 = at(t);
      const len = at(t + 2) - i0;
      const f = mtof(28 + ((root - 4 + 12) % 12)); // E1–Eb2
      for (let k = 0; k < len; k++) {
        let s = 0;
        for (let h = 1; h <= 8; h++) s += Math.sin((2 * Math.PI * h * f * k) / SR) / h;
        bassBuf[i0 + k] += s * 0.12 * Math.min(1, k / 100) * Math.exp(-k / (0.25 * SR));
      }
    }
    // Pad: the triad voiced between Bb3 and Bb4, soft and wide.
    const i0 = at(c.t);
    const len = at(c.t + c.dur) - i0;
    const voicing = tones.map((pc) => 58 + ((pc - 58 + 120) % 12));
    voicing.forEach((m, j) => {
      const f = mtof(m);
      const pan = (j - 1) * 0.6;
      for (let k = 0; k < len; k++) {
        const t = c.t + (k / SR) / beatSec * 4;
        if (!bandOn(t)) continue;
        const env = Math.min(1, k / (0.03 * SR)) * Math.min(1, (len - k) / (0.03 * SR));
        const s = (Math.sin((2 * Math.PI * f * k) / SR) + 0.3 * Math.sin((4 * Math.PI * f * k) / SR)) * 0.035 * env;
        add(i0 + k, s * (1 - pan), s * (1 + pan));
      }
    });
  }
  for (let i = 0; i < total; i++) {
    const b = bassLP(bassBuf[i]);
    L[i] += b;
    R[i] += b;
  }
}

function main() {
  const ONLY = process.env.GUIDE_ONLY; // e.g. 'lead' for pitch checks
  const out = guideVoices(ONLY);
  if (!ONLY) accompany(out);

  mkdirSync('music/out', { recursive: true });
  const peak = writeWav(ONLY ? `music/out/ep01-guide-${ONLY}.wav` : 'music/out/ep01-guide.wav', out, SR, 0.9);

  // Events for the karaoke page and later checks: seconds from the start of the file.
  const sec = (t) => at(t) / SR;
  writeFileSync('music/out/ep01-guide-events.json', JSON.stringify({
    bpm: meta.bpm,
    sections: sections.map((s) => ({ ...s, time: sec(s.bar * 16) })),
    bars: Array.from({ length: 116 }, (_, b) => sec(b * 16)),
    chords: chords.map((c) => ({ chord: c.chord, time: sec(c.t) })),
    vocals: vocals.map((e) => ({ voice: e.voice, text: e.text, stress: e.stress, melisma: e.melisma, t: e.t, time: sec(e.t), end: sec(e.t + e.dur), midi: e.midi })),
  }));
  console.log(`wrote ${ONLY ? `ep01-guide-${ONLY}` : 'ep01-guide'}.wav (${(total / SR).toFixed(1)} s, peak ${peak.toFixed(2)})`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
