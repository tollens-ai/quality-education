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
| `check/` | Measurements: prosody, rhymes and line stresses in a lyric draft (`rhyme.py`), band checks, pitch against the score, the model ear | Shared |
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

## Two routes

- **The generator performs the song** (episode 1 from v8 on). Write the lyrics for the performer
  (LYRICS.md, "Writing for the performer"), generate takes, and let the expert pick. Then use the
  analysis tools below to get the chosen take's timings for captions and the storyboard. The code
  band and voices aren't needed.
- **Everything is rendered in code** (the route below). It gives exact control of melody and
  vowels, but in episode 1 neither the code voice nor a local neural voice could sing fast lines
  clearly, and melodies composed by a model that can't hear didn't satisfy the expert.

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
   For the generator route, `python music/reference/captions.py captions.txt take.words.json
   out.srt lyrics.json [fixes.json]` times the caption lines (`epNN/captions.txt`) against the
   take and writes every word's timing for the kinetic lyrics. Check the word timings of the hook
   lines: Whisper can stretch a line's first words back into the previous backing vocal, and
   `epNN/lyrics-fixes.json` corrects those by hand (episode 1 needed four). A blanket rule
   shortening long words is wrong: sung notes are legitimately long. Transcribe the full
   mix for this, not the vocal stem: on episode 1 the stem's transcript ran backing vocals into
   the lead's lines and misheard more words. Then `python music/reference/beats.py take.mp3
   captions.txt captions.srt epNN/beats.json` scores the take for storyboarding: bars, sections,
   lines, energy dips and every 3-second window.
   Pitch is reliable to a semitone on held notes; watch for octave slips. Word times are ±0.1–0.2 s,
   so treat the rhythm as a draft for the expert to correct.
   **For a lyric video, time every word again from the voice.** Whisper's word times ran about
   130 ms early on episode 2. `music/ep02/align_words.py` (its header gives the arguments)
   re-times the captions' words: two forced aligners and two Whisper runs vote on each word, each
   onset snaps to the nearest onset of sound on the stem, and the report lists every word's four
   estimates, the lines re-aligned, the words set by hand, and repeated lines that disagree. It
   needs torchaudio, and downloads its aligner models on the first run. VIDEO.md, "Word timing
   comes from the voice", says how to check the result by ear with Qing.
   **Transcribe the ornaments, not just the held notes.** Scoops, falls, turns, grace notes and
   backing echoes are much of why a take sounds good. Episode 1's first transcription kept only
   held notes, so the chorus tail read as near-monotone, and a whole round of rewrites was aimed
   at a problem the take didn't have (Qing: "there's vocal embellishments there that make it
   sound much better", 2026-09-25). Before anything is built on a transcription, check it by ear
   against the take: render it and play the two side by side.
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
  human ear confirms it. `check/ear.py` gives an audio model's second opinion through OpenRouter.
  The Antigravity CLI does the same with Gemini: cut an excerpt to mp3, then from its folder run
  `agy --model gemini-3.1-pro-high -p "Open and listen to the audio file X.mp3 ..."` (put `-p`
  last). Calibrate every ear with a question you know the answer to. On 2026-09-25 Gemini 3.1 Pro
  got a band stop's length right (1 s) but put it 4 s late, and heard 180 bpm as 150. Trust it
  for broad impressions, not timings.

## Parallel work that went well

Episode 1 split the heavy builds across agents working at the same time, each owning its own
files: the band, the voice, songwriting options and research for the skill pack. What made that
work:
- Each brief names the files the agent owns and the files it must not touch.
- Each brief says where to run, sets a time box, and asks for numbers and a verdict, not "done".
- The parent reviews the numbers and the PNGs, then commits only that agent's paths.
- After an interruption (a power cut, in episode 1), a resumed agent gets the original brief plus
  where it stopped. Its code is on disk, so it continues rather than restarting.
