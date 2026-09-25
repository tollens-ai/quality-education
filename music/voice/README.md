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
- `opts.voice` picks a preset: `'female'` (the default) or `'male'`. Any option you pass
  overrides the preset, so `{ voice: 'male', transpose: -12 }` is the male voice an octave down.

Phonemes are Southern British IPA, one string each: `['g', 'ʊ', 'd']`. The full set is at the top of
`phonemes.mjs`: 13 monophthongs, 8 diphthongs, stops, affricates, fricatives, nasals and approximants.

## Design

| File | Job |
|---|---|
| `phonemes.mjs` | Vowel formant targets for a young female voice and an adult male one; consonant place, voicing, durations and noise spectra |
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
- `node test.mjs --opts='{"voice":"male"}'` renders the male voice. Use `--out=` to keep its
  renders apart, and `python check.py --dir=` on the same folder. The checks compare against
  the sounding pitch, so transposed renders score correctly.
- `WHISPER_THREADS=4` sets Whisper's thread count for `check.py` and `constest.py`. Match it to
  the machine's CPU quota: oversubscribing a small container makes a run many times slower.
- `node test.mjs --bpm=90` renders slower, and `--opts='{"transpose":-12}'` renders an octave
  down. These separate timing and pitch problems from phoneme problems.

Whisper guesses from context, so a pass is a floor, not proof. It also misheard "Twelve subagents"
in the reference takes sung by a neural voice.

## The male voice

`{ voice: 'male' }` is a tenor chest voice: a preset in `index.mjs`, not a fork. It changes
four things.

- **Vowels.** Its own table in `phonemes.mjs`, `VOWELS_MALE`. F1 and F2 are the adult-male
  citation means for Standard Southern British English from Deterding (1990), as tabulated in
  Deterding (1997), *JIPA* 27, 47–55, Table 3; F3 is that paper's male connected-speech mean.
  The values sit 12–20% below the female ones, as a longer vocal tract predicts.
- **Consonants and upper resonances.** Consonant loci are scaled by 0.86, and F4 and up, the
  nasal poles and the nasal place zeros by 0.85.
- **Source.** It has less breath (0.03 against 0.05) and a weaker fundamental (firmer glottal
  closure), a lower tilt corner and slightly more jitter and shimmer.
- **Vibrato and key.** Vibrato is narrower and slower (±0.25 semitones at 5.2 Hz), because
  pop-punk leads sing nearly straight tone. The preset transposes down a fifth (`transpose: -7`).

### Which key

The song is in E♭. We tried the male voice down an octave, a major sixth and a fifth, with
seeds 7, 3 and 11:

| Transposition | Key | Hook peak | Verse range | Mean words (21 renders) | Pre-chorus |
|---|---|---|---|---|---|
| −12 | E♭ | E♭4 | B♭2–A♭3 | 74% | 60–80% ("I know we read in your prompt") |
| −9 | G♭ | G♭4 | D♭3–B3 | 78% | 100% |
| **−7** | **A♭** | **A♭4** | **E♭3–D♭4** | **82%** | **100%** |

We recommend **down a fifth, in A♭**. It scores best, and the octave-down version loses the
pre-chorus, because its low notes near C3 mumble. A♭ also matches the genre. A pop-punk tenor
belts the hook's A♭4 high in chest voice, where Blink-182 and Green Day leads sit. The verses run
E♭3–D♭4, under the D4 line where sparse harmonics start to miss the formants. Moving the song to
A♭ changes the band's key too, so that is a score decision, not a voice one.

## Results (2026-09-25, seeds 7, 3 and 11)

The table gives Whisper word accuracy per seed. The male voice uses the preset (down a fifth).
Both voices render bit-identically to the measured renders.

| Phrase | Female | Male | Male, typical hearing |
|---|---|---|---|
| Pre-chorus "I can't read your mind / I'm only reading your prompt" | 100 / 100 / 100 | 100 / 100 / 100 | exact |
| Hook "Good for who? Good for what?" | 100 / 100 / 100 | 100 / 100 / 100 | exact |
| Verse "Product demo? Wow them fast" | 20 / 20 / 40 | 60 / 60 / 80 | "Product demo will be fast" |
| "2FA on your gym log" | 50 / 50 / 50 | 50 / 83 / 83 | "2FA on your gene log" |
| "Kubernetes for your blog" | 100 / 100 / 100 | 100 / 100 / 100 | exact |
| "Twelve subagents round the clock" | 33 / 33 / 33 | 33 / 33 / 33 | "Twill salvation from the clock" |
| Spoken "Guess I didn't ask" | 100 / 100 / 100 | 100 / 100 / 100 | exact |
| **Mean** | **73%** | **82%** | |

- **Pitch:** the median per-phrase error is 10 cents for the female voice and 7.5 cents for the
  male one. Notes more than 30 cents out: 5 of 153 (female) and 6 of 153 (male), all on short
  verse notes. There is no NaN, no clipping and no DC.
- **Consonant test** (re-measured today): the female voice gets 58% of words and 67% of onsets,
  the male voice 42% of words and 75% of onsets. The male voice gets more onsets right, but more
  of its vowels and codas go wrong: dad→dead, hat→hot, jam→jab, coat→code. Last night's female
  figure was 67% and 75%; the gap is run-to-run and scorer variation. The scorer now also accepts
  Whisper's "the world is X" as the carrier phrase, which it heard for most male clips.
- **Female /æ/:** TRAP now has F2 1780 Hz (was 1650), well clear of STRUT, following Deterding's
  female means. "Cat" and "yak" are no longer heard as "cut" and "yuck". The consonant test
  stays at 58% of words, because two other words flipped (tack→pack, lap→lab).

The male voice fixes most of "Product demo" and some of "gym log". "Twelve subagents" still
fails in every key, seed and voice. That line squeezes a five-phoneme syllable and a
four-consonant coda cluster into one eighth note each, so it is a timing and lyric problem, not
a pitch one.

### Pleasantness experiments (opt-in, off by default)

We tried the options below on both voices. Each was measured with proxies on the held notes, and
with Whisper.

| Option | Proxy, before → after | Whisper |
|---|---|---|
| `texture: 1.5` (each harmonic's level wanders slowly) with `ripple: 1` (drifting open-quotient dips) | variation of each harmonic over time: 1.1 → 2.7 dB (female), 0.7 → 2.7 dB (male) | worse: the male verse fell from 60% to 20% on seed 7, and returned to 60% with texture off |
| `texture: 1.5` without ripple | 0.7 → 2.4 dB (male) | male verse 20% and 60% on seeds 7 and 3: not clearly harmful, not proven safe |
| `burstShape: 1` (quieter, longer bursts with a 2 ms rise) | burst crest: 6.1 → 5.3 dB (female), 7.5 → 6.1 dB (male) | no gain, within noise on the verse lines |
| `nasalAV: 0.8`, `nasalise: 0.4` (louder murmur, and a nasalised vowel before a nasal) | female murmur −15.6 → −12.5 dB against the vowel | no gain in the consonant test |

With all four on, "Kubernetes" dropped from 100% to 25–50% on two of three seeds for both
voices. So they stay off until an ear, or a better metric, shows which ones help. The
harmonic-to-noise ratio of held notes stays high whatever we do: 41 dB for the female voice and
31 dB for the male, against roughly 15–25 dB for natural singing. The breath noise is gated by
the glottal cycle, so it fills little of the space between harmonics. That is the next place to
look for the buzz.

## Results (first spike, seed 7)

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

- Fast verse lines are only partly intelligible. The male voice does better, but "Twelve
  subagents" fails with both voices.
- Held notes have rigid, evenly strong harmonics, which sounds a little buzzy and synthetic.
- Stop bursts are bright full-band clicks.
- The /æ/ vowel drifted towards /ʌ/ ("cat" was heard as "cut"). This is now fixed for the
  female voice.
- Nasal murmurs are weak cues at singing pitch.
