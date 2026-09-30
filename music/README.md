# Making an episode’s song

The current route is lyrics and performer phrasing, generated music and singing, then Qing’s
selection of a recording. The [songwriting skill](../.claude/skills/songwriting/SKILL.md) and
[LYRICS.md](../LYRICS.md) cover the words and the generator brief. Episode 1 used MiniMax;
episodes 2 and 3 used Suno.

The unsuccessful code-composition route, including its melody/harmony instructions, is
[archived](../archive/code-composition/README.md). The old band, voice and score files remain
for historical inspection; they are not prerequisites for the next episode.

## From takes to timings

1. **Try takes while the lyric is moving.** Qing hears the full alternatives and names what works
   or needs repair. Suno can reuse a verse melody when the beat grid matches exactly; it managed
   this on episode 3. MiniMax’s episode 1 limitation is recorded in LYRICS.md.
2. **Choose and document the recording.** Reconcile the sung words with the lyric sheet. Keep
   working audio local and record the take’s duration, sections and review status in episode notes.
3. **Measure the recording and align the known lyrics.** The scripts in `reference/` and the
   episode’s music directory measure beats and energy and derive word timings. Choose the
   episode-specific route from its notes: episode 2 uses `ep02/align_words.py`; episode 3’s
   fast-patter route uses `ep03/align_multi.py` and `ep03/combine.py`.
4. **Check alignment in the recording.** Compare estimates where available, inspect uncertain
   onsets against the vocal, and render a plain karaoke preview for Qing to hear. Compare the
   full mix and relevant vocal stem when transcription is doubtful: episode 1’s stem confused
   backing and lead vocals, but that does not make the full mix the best input for every take.
   Held sung words can legitimately be long; avoid shortening them by a blanket rule.
5. **Write captions and hand off the timing data.** Store beat/section data, word times and
   captions under `epNN/`. Reconcile revisions before building final shots: new lyric words
   do not update the chosen recording’s timings automatically.

The shared caption helper is `reference/captions.py`; its generator-route invocation is:

```
python3 music/reference/captions.py captions.txt take.words.json out.srt lyrics.json [fixes.json]
```

Word timings come from the sung recording, not the intended lyric grid. See
[VIDEO.md](../VIDEO.md#word-timing-comes-from-the-voice) for alignment lessons and kinetic-word timing.

## Tools and data

`check/rhyme.py` compares a lyric’s dictionary vowels and stresses; it does not classify perfect
rhymes by consonant endings. `reference/` and episode-local scripts analyse recordings.
The Python dependencies are in [requirements.txt](requirements.txt); rendering and audio analysis
use the project’s existing Node/Python/ffmpeg toolchain. Keep heavy analysis in a dev container.

The generated recording is not stored in git. Episode timing JSON and captions are tracked;
renders go in `out/` or `video/out/`, both ignored. Clearly label draft data until the recording
and timings are approved.
