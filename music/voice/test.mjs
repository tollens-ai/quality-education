// Renders the voice test phrases a cappella (and over a quiet click) to music/out/voice/.
// Usage: node music/voice/test.mjs [phraseName ...] [--out=dir] [--opts=json]
// Then:  python music/voice/check.py   (Whisper word accuracy, pitch in cents, sanity stats)

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLine, speakLine, writeWav } from './index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const flag = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
// --out=dir renders elsewhere; --opts='{"reverb":0}' overrides voice options (for sweeps)
const OUT = flag('out') ?? join(here, '..', 'out', 'voice');
const OPTS = JSON.parse(flag('opts') ?? '{}');
mkdirSync(OUT, { recursive: true });

// --bpm=N re-renders at another tempo (diagnostic: separates timing squeeze from segment quality)
const BPM = Number(flag('bpm') ?? 180), E = 60 / BPM / 2; // eighth note = 1/6 s at 180
const LEAD = 0.6;
// Notes in E♭ major
const N = { Bb3: 58, C4: 60, D4: 62, Eb4: 63, F4: 65, G4: 67, Ab4: 68, Bb4: 70, C5: 72, D5: 74, Eb5: 75 };

// ev(slot, lengthInSlots, note, phonemes, stress, extra): slot = bar * 8 + eighth
const ev = (slot, len, note, phonemes, stress = 0, extra = {}) => ({
  start: LEAD + slot * E, end: LEAD + (slot + len) * E, midi: N[note], phonemes, stress, ...extra,
});

const phrases = {
  // Pre-chorus end, 6-bar version (music/ep01/score.mjs PRE_TAIL[6]): pickup "I" on the & of 4.
  prechorus: {
    text: "I can't read your mind. I'm only reading your prompt.",
    events: [
      ev(7, 1, 'C4', ['aɪ']),
      ev(8, 2, 'Eb4', ['k', 'ɑː', 'n', 't'], 1),
      ev(12, 1, 'F4', ['r', 'iː', 'd'], 1),
      ev(13, 1, 'G4', ['j', 'ɔː']),
      ev(14, 3, 'F4', ['m', 'aɪ', 'n', 'd'], 1),
      ev(17, 1, 'F4', ['aɪ', 'm']),
      ev(18, 1, 'F4', ['əʊ', 'n'], 1),
      ev(19, 1, 'G4', ['l', 'i']),
      ev(20, 1, 'F4', ['r', 'iː'], 1),
      ev(21, 1, 'Eb4', ['d', 'ɪ', 'ŋ']),
      ev(22, 1, 'Eb4', ['j', 'ɔː']),
      ev(24, 7, 'F4', ['p', 'r', 'ɒ', 'm', 'p', 't'], 1),
    ],
  },
  // Chorus hook (c0-c4): "Good for who-o-o? Good for wha-a-at?"
  hook: {
    text: 'Good for who? Good for what?',
    events: [
      ev(4, 2, 'G4', ['g', 'ʊ', 'd'], 1, { scoop: 2 }),
      ev(6, 2, 'Eb4', ['f', 'ɔː']),
      ev(8, 4, 'Eb5', ['h', 'uː'], 1, { scoop: { semis: 1, dur: 0.15 } }),
      ev(12, 4, 'G4', ['uː']),
      ev(16, 2, 'Ab4', ['uː']),
      ev(18, 2, 'Bb4', ['uː']),
      ev(20, 2, 'Bb4', ['g', 'ʊ', 'd'], 1),
      ev(22, 2, 'Bb4', ['f', 'ɔː']),
      ev(24, 4, 'Eb5', ['w', 'ɒ'], 1, { scoop: { semis: 2, dur: 0.15 } }),
      ev(28, 4, 'G4', ['ɒ']),
      ev(32, 5, 'Bb4', ['ɒ', 't']),
    ],
  },
  // Verse lines: straight eighths, one syllable per eighth, pitches from score.mjs VERSE_PITCH.
  // Verse 2 line 1.
  verse: {
    text: 'Product demo? Wow them fast.',
    events: [
      ev(0, 1, 'C4', ['p', 'r', 'ɒ'], 1),
      ev(1, 1, 'C4', ['d', 'ʌ', 'k', 't']),
      ev(2, 1, 'Eb4', ['d', 'e'], 1),
      ev(3, 1, 'Eb4', ['m', 'əʊ']),
      ev(4, 1, 'Eb4', ['w', 'aʊ'], 1),
      ev(5, 1, 'D4', ['ð', 'e', 'm']),
      ev(6, 1.5, 'Bb3', ['f', 'ɑː', 's', 't'], 1),
    ],
  },
  // Verse 1 line 2: TWO(1) eff(&) AY(2) on(&) YOUR(3) gym(&) LOG(4).
  gym: {
    text: '2FA on your gym log.',
    events: [
      ev(0, 1, 'D4', ['t', 'uː'], 1),
      ev(1, 1, 'D4', ['e', 'f']),
      ev(2, 1, 'F4', ['eɪ'], 1),
      ev(3, 1, 'D4', ['ɒ', 'n']),
      ev(4, 1, 'F4', ['j', 'ɔː'], 1),
      ev(5, 1, 'Eb4', ['dʒ', 'ɪ', 'm']),
      ev(6, 1.5, 'D4', ['l', 'ɒ', 'g'], 1),
    ],
  },
  // Verse 1 line 3.
  kube: {
    text: 'Kubernetes for your blog.',
    events: [
      ev(0, 1, 'Eb4', ['k', 'uː'], 1),
      ev(1, 1, 'Eb4', ['b', 'ə']),
      ev(2, 1, 'G4', ['n', 'e'], 1),
      ev(3, 1, 'Eb4', ['t', 'iː', 'z']),
      ev(4, 1, 'Eb4', ['f', 'ə']),
      ev(5, 1, 'D4', ['j', 'ɔː']),
      ev(6, 1.5, 'C4', ['b', 'l', 'ɒ', 'g'], 1),
    ],
  },
  // Verse 1 line 4 (Qing's grid): TWELVE(1) sub(&) A(2) gents(&) ROUND(3) the(&) CLOCK(4).
  twelve: {
    text: 'Twelve subagents round the clock.',
    events: [
      ev(0, 1, 'Eb4', ['t', 'w', 'e', 'l', 'v'], 1),
      ev(1, 1, 'F4', ['s', 'ʌ', 'b']),
      ev(2, 1, 'Ab4', ['eɪ'], 1),
      ev(3, 1, 'G4', ['dʒ', 'ə', 'n', 't', 's']),
      ev(4, 1, 'F4', ['r', 'aʊ', 'n', 'd'], 1),
      ev(5, 1, 'Eb4', ['ð', 'ə']),
      ev(6, 1.5, 'F4', ['k', 'l', 'ɒ', 'k'], 1),
    ],
  },
  // Verse 1 tag, spoken.
  spoken: {
    text: "Guess I didn't ask.",
    spoken: true,
    events: speakLine([
      { ph: ['g', 'e', 's'], stress: 1, dur: 0.2 },
      { ph: ['aɪ'], dur: 0.14, gap: 0.03 },
      { ph: ['d', 'ɪ'], stress: 1, dur: 0.12, gap: 0 },
      { ph: ['d', 'n', 't'], dur: 0.12, gap: 0.05 },
      { ph: ['ɑː', 's', 'k'], stress: 1, dur: 0.3 },
    ], { at: LEAD, hi: 57, lo: 52 }),
  },
};

function click(len, events) {
  const x = new Float32Array(len), sr = 48000;
  const endT = Math.max(...events.map((e) => e.end)) + 0.5;
  for (let b = 0; LEAD + b * 2 * E < endT; b++) {
    const i0 = Math.round((LEAD + b * 2 * E) * sr), f = b % 4 === 0 ? 2000 : 1500;
    for (let i = 0; i < 1200 && i0 + i < len; i++) x[i0 + i] += 0.12 * Math.sin((2 * Math.PI * f * i) / sr) * Math.exp(-i / 200);
  }
  return x;
}

const want = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const manifest = [];
for (const [name, p] of Object.entries(phrases)) {
  if (want.length && !want.includes(name)) continue;
  const t0 = Date.now();
  const { audio, syls } = renderLine(p.events, { seed: 7, ...(p.opts ?? {}), ...OPTS });
  const file = join(OUT, `${name}.wav`);
  writeWav(file, audio);
  const c = click(audio.length, p.events);
  writeWav(join(OUT, `${name}_click.wav`), audio.map((v, i) => 0.8 * v + c[i]));
  manifest.push({ name, text: p.text, file: `${name}.wav`, spoken: !!p.spoken, notes: p.spoken ? [] : syls });
  console.log(`${name}: ${(audio.length / 48000).toFixed(2)} s rendered in ${Date.now() - t0} ms`);
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
