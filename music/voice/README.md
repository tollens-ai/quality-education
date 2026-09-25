# The all-code singing voice

A singing voice written as DSP code in plain JavaScript (Node 22, no dependencies). It uses no
audio samples and no trained voice or speech models. It is the lead-vocal candidate for episode 1.
If it isn't good enough, an external singing voice renders the same score instead (see
[MUSIC.md](../../MUSIC.md), "Sound design").

## Interface

```js
import { singLine, speakLine, writeWav } from './index.mjs';
const audio = singLine(events, opts); // Float32Array, mono, 48 kHz
```

Each event is one syllable:
`{ start, end, midi | pitch: [[t, midi], ...], phonemes, stress, scoop?, dyn? }`.

- `start` is the vowel onset, on the beat. Onset consonants are placed before it.
- Coda consonants finish by `end`.
- `speakLine(words)` builds events for a spoken line, with free timing and a falling contour.
- The options are listed in the header of `index.mjs`.

Phonemes are Southern British IPA, one string each: `['g', 'ʊ', 'd']`. The full set is at the top of
`phonemes.mjs`: 13 monophthongs, 8 diphthongs, stops, affricates, fricatives, nasals and approximants.

## Design

| File | Job |
|---|---|
| `phonemes.mjs` | Vowel formant targets for a young female voice; consonant place, voicing, durations and noise spectra |
| `score.mjs` | Schedules syllables into phoneme segments, then builds 1 kHz control tracks and the f0 track |
| `synth.mjs` | Klatt-style formant synthesiser |
| `post.mjs` | High-pass, gentle de-esser, small room, normalise |

The synthesiser works as follows:

- **Source.** A band-limited glottal source made of additive harmonics, with a loudness-dependent
  tilt, jitter and shimmer. Aspiration noise is pitch-synchronous.
- **Filter.** A cascade of formant resonators: F1–F3 move and F4–F11 are fixed. Nasal pole/zero
  pairs are included, and high shelves correct the tilt against a reference vocal's long-term
  spectrum.
- **Noise branch.** A parallel band-pass bank shapes frication and bursts.
- **Closed-tract low-pass.** During stop closures, nasal murmurs and voiced fricatives, a low-pass
  mix removes nearly everything above ~450 Hz, as a closed mouth does.

The scheduling rules are singer's rules:

- Vowels take at least half of each sung note, and consonants are squeezed to fit.
- The first stop of a stop+stop cluster is unreleased ("duct", "prompt").
- British pre-glottalised voiceless codas.
- Soprano F1 tuning on high notes applies inside vowels only.

The pitch line has scoops, second-order overshoot, late vibrato on long notes, and slight
fluctuation. There is also microprosody: f0 is raised after a voiceless onset.

## How it was checked

We can't hear the output, so every claim is measured:

- `node test.mjs`, then `python check.py`: test phrases at 180 bpm in E♭, with pitches from
  `music/ep01/score.mjs`. `check.py` reports faster-whisper (medium.en) word accuracy, pYIN pitch
  error per note in cents, NaN/clipping/DC, and a spectrogram PNG per phrase. The renders go to
  `music/out/voice/`, which is git-ignored.
- `node constest.mjs`, then `python constest.py`: 24 minimal-pair words in "The word is X",
  scored by exact word and by onset consonant.
- `node calibrate.mjs`: each consonant's level relative to the vowel, compared with speech norms.
- `node test.mjs --bpm=90` renders slower, and `--opts='{"transpose":-12}'` renders an octave
  down. These separate timing and pitch problems from phoneme problems.

Whisper guesses from context, so a pass is a floor, not proof. It also misheard "Twelve subagents"
in the reference takes sung by a neural voice.

## Results (2026-09-25, seed 7)

| Phrase | Whisper heard | Words | Median pitch error |
|---|---|---|---|
| Pre-chorus "I can't read your mind / I'm only reading your prompt" | exact | 100% | 5 c |
| Hook "Good for who? Good for what?" | exact | 100% | 1 c |
| Verse "Product demo? Wow them fast" | "Producting will work then fast" | 20% | 19 c |
| "2FA on your gym log" | "2FA on YouTube vlog" | 50% | 4 c |
| "Kubernetes for your blog" | exact (3 of 3 seeds) | 100% | 11 c |
| "Twelve subagents round the clock" | "Twill some pictures from the clock" | 33% | 11 c |
| Spoken "Guess I didn't ask" | exact | 100% | n/a |

- **Consonant test:** 67% of words and 75% of onsets. Misses: cat→cut, van→bad, thin→been,
  sat→that, shack→jack, chat→cat, jam→jab, mat→that.
- **Signal checks:** no NaN, no clipping and no DC. Every note is within 31 cents of the score.

Every line scores 100% when spoken with speech timing, except "Twelve subagents" (33%). So the
phoneme models work. What fails is fast one-syllable-per-eighth singing above about D4: sparse
harmonics sample the formants poorly, and the equal syllable lengths leave no stress timing.

## Known weaknesses

- Fast verse lines are only partly intelligible.
- Held notes have rigid, evenly strong harmonics, which sounds a little buzzy and synthetic.
- Stop bursts are bright full-band clicks.
- The /æ/ vowel drifts towards /ʌ/ ("cat" is heard as "cut").
- Nasal murmurs are weak cues at singing pitch.
