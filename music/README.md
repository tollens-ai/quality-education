# Making an episode's song

How a song goes from a locked lyric sheet to a checked mix with this repo's tools. The craft
itself (what to write, and why) is in the [songwriting skill](../.claude/skills/songwriting/SKILL.md),
[MUSIC.md](../MUSIC.md) and [LYRICS.md](../LYRICS.md). This page covers the machinery and the
order of work that episode 1 settled on, often by trial and error. Episode 1 is the worked example
throughout.

## Where things live

| Path | What it is | Reused per episode? |
|---|---|---|
| `lib/notation.mjs`, `lib/audio.mjs` | Grid notation parser; timing, WAV output, seeded noise, filters | Shared |
| `lib/band/` | Synthesised drums, bass, guitars, DSP ([README](lib/band/README.md)) | Shared |
| `voice/` | The all-code singing voice ([README](voice/README.md)) | Shared |
| `check/` | Measurements: prosody, band checks, pitch against the score, the model ear | Shared |
| `reference/` | Analysis of reference takes: beat grid, sung notes, chords | Shared |
| `epNN/score.mjs` | The song as data: form, chords, arrangement, every syllable and pitch | Per episode |
| `epNN/band.mjs` | The episode's feels (one function per arrangement feel), mix and render | Per episode; copy and adapt |
| `epNN/{audit,leaps,grids,guide,karaoke}.mjs` | Pre-sound checks, the song-map generator, guide render, listening page | Per episode for now; they read that episode's score |
| `out/` | Every render (git-ignored) | |

## Running things

The renderers are plain Node 22 with no dependencies. The checks and analysis are Python 3.12
with [`requirements.txt`](requirements.txt). Anything heavy (renders, Whisper, Demucs) belongs in
a dev container, not on the host. Keep the exact container route for your machine out of tracked
files.

## Order of work

Each stage is cheap to change before the next one is built on it. The songwriting skill has the
craft for each stage; these are the repo-specific steps.

1. **Lyrics, with quick generated takes.** While the lyric is still moving, a lyrics-to-song
   generator (episode 1 used MiniMax) is the fastest scansion check. See LYRICS.md, "Generating
   the song", for how to prompt it. The expert labels what she likes in each take. Keep the takes
   local; they're references, not the song.
2. **Analyse the chosen takes.** Separate the stems with Demucs, then read tempo, rhythm, melody
   and chords off them:
   ```
   python -m demucs -n htdemucs -o <sep_dir> take.wav
   python music/reference/transcribe.py take.wav          # word timestamps
   python music/reference/rhythm.py <stem_dir> 0          # beat grid, vocal onsets
   python music/reference/notes_chords.py <stem_dir> 0 <bar1_beat>
   python music/reference/pitch.py <stem_dir>/vocals.wav take.words.json 0 <t0> <t1> <beat0> <beat>
   ```
   Pitch is reliable to a semitone on held notes; watch for octave slips. Word times are ±0.1–0.2 s,
   so treat the rhythm as a draft for the expert to correct.
3. **Song map and score.** Write `epNN/score.mjs` (start from episode 1's), then generate the map's
   grids with `node music/epNN/grids.mjs --write`. Never hand-edit the grids. Keep alternatives
   behind environment switches (`HARMONY=v1`, `PC_BARS=5`) so the expert can compare them by ear.
4. **Check before sound:** `node music/epNN/audit.mjs`, `node music/epNN/leaps.mjs` and
   `python music/check/prosody.py`. The prosody checker was calibrated against the expert's
   verdicts; add each new verdict to its tests.
5. **Guide render and listening page.** `node music/epNN/guide.mjs` renders click, bass, chords
   and a tone for each sung part. `node music/epNN/karaoke.mjs <mp3> <events.json> <out.html>`
   builds a page that lights up each syllable as it plays. The expert corrects the phrasing here,
   before any sound design.
6. **Band.** `node music/epNN/band.mjs`, then `python music/check/band_check.py --ref <stems>`.
   Look at the PNGs it writes.
7. **Voice.** Render the lead from the score and check it with Whisper and pYIN (see
   [voice/README.md](voice/README.md)). A voice that fails intelligibility on the fast lines
   isn't ready, however good it sounds held.
8. **Mix, the MUSIC.md checks, then the expert's ear** on the full song.

## Working with the expert

- **Bring comparisons, not questions.** Render each alternative as a short mp3 (the same bars,
  the same band) and ask which one. Open questions about rhythm cost her more than choosing.
- **Record every correction** in the episode file verbatim, then as a rule in LYRICS.md or
  MUSIC.md if it generalises, then in a check if it can be measured.
- **The model can't hear.** Every judgement of sound is a hypothesis until a measurement or a
  human ear confirms it. `check/ear.py` gives an audio model's second opinion; calibrate it with a
  question you know the answer to.

## Parallel work that went well

Episode 1 split the heavy builds across agents working at the same time, each owning its own
files: the band, the voice, songwriting options and research for the skill pack. What made that
work:
- Each brief names the files the agent owns and the files it must not touch.
- Each brief says where to run, sets a time box, and asks for numbers and a verdict, not "done".
- The parent reviews the numbers and the PNGs, then commits only that agent's paths.
- After an interruption (a power cut, in episode 1), a resumed agent gets the original brief plus
  where it stopped. Its code is on disk, so it continues rather than restarting.
