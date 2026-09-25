# The band

Drums, bass, two rhythm guitars and a lead guitar, all synthesised in plain JavaScript (Node 22,
no dependencies, no samples). `music/ep01/band.mjs` reads the score's `chords`, `arrangement`,
`sections`, `leadGuitar` and `lead` and renders 48 kHz float stems. It's deterministic: every
random choice comes from a stream seeded by player and event, so the same score always renders
the same bits, and adding a note never changes any other note.

```
node music/ep01/band.mjs                   # about 90 s
python music/check/band_check.py [--ref DIR]
```

Outputs go to `music/out/` (git-ignored): `ep01-band-{drums,bass,gtrL,gtrR,lead}.wav`, the band
mix `ep01-band.wav`, `ep01-band+guide.wav` (band plus the guide-vocal tones, at −14 LUFS, for a
human to hear the song's shape) and `ep01-band-events.json` for the checks.

## How it's built

| File | What it does |
|---|---|
| `dsp.mjs` | 4x polyphase oversampler for anything nonlinear, band-limited oscillators (polyBLEP), a state-variable filter, a feed-forward compressor, a small room, a true-peak limiter, BS.1770 loudness, mono-below-a-frequency and a 1–4 kHz ducker |
| `drums.mjs` | Kick: a sine swept down to B♭1 plus a beater click. Snare: two head modes plus wire noise. Toms: pitched sines tuned to E♭3, B♭2 and F2. Hats, ride and crash: the TR-808 recipe of six inharmonic square waves plus noise. A cymbal swell sits under the rolls. |
| `bass.mjs` | Picked bass: a saw plus a sine, through a filter that closes after the pick, then gentle drive. A parallel copy is driven hard and band-passed to 150–700 Hz, so phone speakers still hear the line. |
| `guitar.mjs` | Extended Karplus–Strong strings (loop low-pass for palm mutes, all-pass tuning) into an amp: pre-EQ, two oversampled tanh stages and a cabinet. The lead is one string with bends and delayed vibrato. |
| `band.mjs` (in `ep01/`) | Turns each arrangement feel into events, humanises them, renders, mixes and writes everything out. |

**Feels.** Each feel named in the comment block above `arrangement` in the score is a function
that emits one bar of drum, bass and guitar events. The `level`, `rise`, `crash` and `fill`
options scale and decorate that bar. `stop` spans and `cut`s are multiplied by an exact zero,
so the band stops dead before every chorus.

**Performances.** The drums wander on a smooth seeded drift of about 3 ms, with a little jitter
per hit, and the bass rides the drummer's drift so it stays locked to the kick. Each side's
guitar is two separately seeded performances: own timing, strum spread and amp settings, hard
panned. None of them is a delayed copy, so the L/R correlation is about 0.03. In the final
chorus one performance per side moves up an octave.

**Mix.** Stem levels are set to target loudness over the first chorus, following the reference
take's separated stems. On top of that, per-section fader rides (dB per stem, derived from the
feel, the section and `rise`) do what velocity alone can't. The drums carry most of the
loudness, and compression and distortion flatten velocity. The guitars leave room for the
voice: a static 0.75–1.4 kHz scoop, plus a 3 dB dynamic cut at 1–4 kHz whenever the score's
lead vocal is singing. Lows are mono below 120–160 Hz. The drum bus uses parallel compression
plus a slow-attack 4:1 bus compressor, and the mix bus a gentle 2:1.

## How it's checked

The model can't hear, so `band_check.py` measures (see MUSIC.md, "Checking"):

- **Sanity:** NaN, DC, sample peak and true peak for every stem, the mix and band+guide.
- **Stops:** the maximum level inside every stop and cut. They should all read digital
  silence.
- **Drum onsets:** detected onsets against the event list, per instrument, after removing the
  detector's bias.
- **Loudness shape:** loudness per section for the mix and each stem, then the checks from
  `production.md`: chorus ≥ verse + 2 LU, final chorus ≥ chorus 1, and each pre-chorus rising
  bar by bar.
- **Dynamics and stereo:** PSR, PLR and crest factor. Per octave, side-to-mid ratio,
  correlation and mono loss. The cross-correlation of the two guitar sides.
- **Lead pitch:** pYIN pitch of each lead-guitar note against the score, in cents.
- **Reference (`--ref`, a Demucs stem folder):** stem loudness against the reference's
  separated stems, and 1/3-octave band differences at matched loudness.
- **Phone proxy:** each stem's loudness in a mono mix high-passed at 300 Hz, and whether the
  bass line's pitch still tracks.
- **PNGs in `music/out/check/`,** to look at: long-term spectra against the reference, a
  whole-song spectrogram, and linear spectrograms of the guitar, lead and bass for aliasing.

What measurement can't settle (groove, tone, and whether it sounds like a band) still needs a
human ear.
