# What the episode 4 piano take sounds like, by measurement

Draft timing data, 2026-10-01, for Qing to check by ear in the karaoke preview. This is a
different recording from the swing take measured in [../listening-notes.md](../listening-notes.md);
none of that take's timings carry over. No listening model was used. **Measured** means read off
the signal, the stems or the aligners; **inferred** means a reading of those measurements that
needs an ear to confirm.

Suno's style note for the take (from the brief): "Song, brisk pattering pace, light male
baritenor in sharply articulated comic patter delivery, mono room sound, upright piano with
jaunty chord stabs and nimble runs leading the arrangement."

## Length, tempo and metre

- **Length (measured).** 182.61 s decoded (container 182.60 s). The separated stems line up
  with the mix (cross-correlation lag 0.0 ms), so every time here is on the mix's clock.
- **Tempo (measured).** Median beat 0.5614 s, **106.9 BPM**. It drifts, so use the explicit
  beat list in `beats.json`, not a grid: 110.6 BPM over the piano-only intro, a steady 107 from
  verse 1 to chorus 2, slowing through the bridge to about 103 BPM around 117-126 s, then 105-106
  to the end. Against one straight grid the beats wander from −382 to +656 ms. Each beat is
  the tracker's, moved to the strongest onset within 40 ms and smoothed over 17 beats (median
  difference from the raw beat 6.1 ms; `raw_t` keeps the raw time).
- **Metre: 2/4, a bar every 1.123 s (two beats).** Why, from measurement:
  - Every sung line is four beats long, one stressed syllable per beat ("My TESTS? I PASTE app
    CODE in HASTE" puts the stresses on four successive beats, the patter on the eighths
    between).
  - The low end alternates strong and weak on every other beat: low-band onset strength 3.50
    against 2.75, drum stem 3.98 against 3.07, more harmonic change on the strong beat (0.205
    against 0.183). That is a two-beat "oom-pah" cycle.
  - A 4/4 bar doesn't survive the whole song: two extra beats come before chorus 1 and before
    chorus 3 (verse 1 → chorus 1 and breakdown → chorus 3 are 6.7-6.9 beats from the last line
    to the first, verse 2 → chorus 2 is 4.7). A fixed 4-beat bar puts chorus 1's lines on
    beat 1.4 and chorus 2's on beat 3.4. Two-beat bars keep the same downbeat throughout.
- **Bar phase (measured, confidence varies by section).** Downbeats are the even-numbered
  tracker beats. The downbeat/upbeat accent ratio is clear in verse 1 (1.50), the bridge (2.57)
  and the outro (1.92); weak in the choruses and breakdown (1.00-1.18), which inherit their phase
  from the sections around them; and unreliable in the intro (no drums or bass; ratio 0.43).
  Each line starts with a pickup and puts its first stress on a downbeat. One line is two bars,
  and a couplet is four.
- **Renderer note.** `video/lib/stage.js` derives `beat = bar_seconds / 4`, which assumes 4/4.
  For this take, use `beat_seconds` or the `beats` list.

## Sections

The sections run from the first word's onset to the moment the voice stops after the last word
(its measured decay). Levels are power-averaged RMS dBFS of the mix over the section (measured).

| Section | First word | Vocal end | Bars (2/4) | Mix level | What's playing (measured, stems leak) |
|---|---:|---:|---|---:|---|
| Instrumental intro | — | — (0.00-2.54) | 1-3 | −24.9 | piano only |
| Intro | 2.543 | 12.918 | 3-12 | −24.8 | voice and piano; no drums; a little low piano/bass (−44); the piano stops under "hundred "tests"," (2.67-3.77) and "is green" (5.53-6.00) |
| Verse 1 | 12.928 | 40.025 | 13-36 | −20.6 | the drums and bass come in at 12.4 s: a pitched low thump on every beat with occasional clap/snare-like noise bursts, plus piano. Bass drops out from about 30 s, and all the instruments drop out for "how tests get made." (38.0-42.4) |
| Chorus 1 | 41.523 | 58.729 | 38-53 | −18.7 | full band; backing voices; band stop on "Did you actually" (41.5-42.3) |
| Verse 2 | 59.971 | 78.176 | 55-70 | −19.3 | full band with stop-time: the instruments drop out under "but what's in store?" (63.4-64.1), "gone? Explore!" (68.0-68.9), "net, then save" and "set; A new" |
| Chorus 2 | 78.460 | 95.794 | 71-86 | −18.9 | full band; backing voices (slightly the strongest of the three choruses) |
| Bridge | 96.920 | 127.896 | 88-114 | −19.6 | many short stops (97.7-110.9) on "crew? Here's", "playbook", "guide", "the game; Your oracles" and others; bass mostly absent 99-109 and 118-129; the rhythm section stops at 122.3 s |
| Breakdown | 129.033 | 147.342 | 116-131 | −18.4 | **not a cappella**: drums (thump and clap-like bursts every beat) and bass come back at 129.25 s; the piano drops 5-10 dB in its first half (129.5-137); one full stop under "both be wrong? Let's see!" (141.0-142.6) |
| Chorus 3 | 148.799 | 166.563 | 133-148 | −17.6 | the loudest section; full band; band stop on "you actually test" (148.8-149.7) |
| Outro | 166.830 | 176.710 | 149-157 | −20.5 | rhythm section out under "without the net; Who sees the logs?" (168.0-173.5), a band stab at 173.56, out again under "tested yet." (174.9-176.4) |
| Instrumental tag | — | — (176.71-182.61) | 158-162 | −19.0 | band tag: piano, drums and bass, last notes at about 180.8 s ringing to 182.6 |

**Gaps (measured).** 40.02-41.52 (piano fill, strongest stab of the song at 39.80); 58.73-59.97
(band); 95.79-96.92 (band); 127.90-129.03 (soft piano only); 147.34-148.80 (band, the loudest
moment: piano −21.9, drums −20.3).

**Where the a cappella is (measured).** The sheet's "Breakdown - acapella" isn't a cappella in this
take. The nearest thing is the end of the **bridge**: drums and bass are silent from **122.3 to
129.4 s**, under "We ask for fresh interpretations.", while the piano plays 15-20 dB under the
voice. The band returns on the breakdown's first word, "A" (129.03), with a drum-and-bass hit at
129.25. The breakdown's only full stop is 141.0-142.6 s.

**Is the drum stem really drums? (inferred).** From 12.4 s the drum stem carries a regular
pitched low thump on the beat and broadband clap- or brush-like bursts. Its onsets coincide with
the piano's (correlation 0.5-0.9). It could be a kick and snare, a stomp-and-clap kit, or the
piano's low notes and hammer noise leaking into the drum stem. Its level (−24 to −31 dBFS,
about the piano's) and the noise bursts in the breakdown, where the piano is quiet, point to real
percussion. Suno's note doesn't mention any. An ear should settle it.

**Several voices (measured, then inferred).** The karaoke split of the vocal stem puts −7 to
−25 dB of backing against the lead in every chorus (verses and bridge: −37 to −49 dB, the
leakage floor).
- Chorus 3 ("Ensemble") is no more stacked than choruses 1 and 2 by this measure. Its group
  sound is in the backing echoes (below) and the doubled lines, as in the others.
- The most stacked line is the breakdown's second, "It tells us if that rule is met.": its
  backing is 5.7 dB louder than its lead, so the split heard more than one voice there.
- The outro's last line ("Who sees the logs? Not tested yet.") has backing at −12.6 dB. It may
  not be solo (inferred).

**Piano stabs (measured).** `audio.json` has 193 strong piano-stem onsets (w ≥ 0.35 of the 99th
percentile peak) in `stabs`, with time, weight, register and position in the 2/4 bar. 90 fall
on a beat and 87 on the half-beat. The strongest come where the band re-enters after a stop:
39.80, 64.37 and 68.87, each about 0.3 beat after beat 2, and 21.39, 45.20, 49.67 and 82.15,
on the beat. All the onset peaks are in `stabs_all`, and the per-frame `piano_onset` curve is
the bounce signal.

## Sheet against the sung take

1. **Backing echoes not on the sheet (measured, in all three choruses).** A backing group echoes
   "What did you try?" under the lead's held "try?", then "What did you find?" under its held
   "find?". Whisper heard them on the mix, the vocal stem and the backing stem, and the backing
   stem shows a four-syllable burst for each. They are in `lyrics.json` as `back: true` lines,
   timed on the backing stem: 51.55 and 53.75; 88.53 and 90.81; 158.90 and 161.17.
2. **Everything else is sung as written, as far as measurement can tell.** Whisper heard a few
   words differently: "calls" for "cause", "drama's" for "dramas", "I'll stay" for "all stay",
   "laws" for "logs", "My test" for "My "tests"". These are near-homophones, and both
   aligners accepted the sheet's words with tight agreement. **For Qing's ear:** "the sets all
   stay" (72.4 s), which both Whisper runs heard as "I'll stay".
3. "second-guess" is one display word, as asked.

## Word timing method and spread

The route is episode 3's ([../../ep03/listening-notes.md](../../ep03/listening-notes.md)), adapted:
- `rough.py` aligns each section with its neighbours' edge lines, using Suno's lyric track only
  to place the section.
- `align_range.py` (ep03's `align_multi.py`, splittable across machines) aligns each line in a
  window that holds its neighbours, on the htdemucs vocal stem slowed to 0.8 and 0.65 with the
  pitch kept, with MMS_FA and English wav2vec2.
- `combine.py` takes the median of those six votes and two Whisper large-v3 runs (vocal stem
  and mix, no prompt, bias −58/−60 ms removed). It snaps each onset to the stem's own onsets
  and measures each held word's tail from the stem's energy decay (20 dB below the word's
  peak). The three choruses are checked against each other.
- `finish.py` merges the lead and the echoes. `analyse.py` makes the beats, sections and curves.

- **Lead, 397 words (measured).** The inter-quartile range of the six aligner votes has a
  median of **20 ms** and a 90th percentile of 36 ms; 5 words are over 120 ms. The two aligners'
  median and 90th-percentile gaps are 20/28 ms at full speed, 16/48 ms at 0.8 and 13/52 ms at
  0.65. Snapping moved onsets by a median of 23 ms (90th percentile 51 ms). Whisper matched 387
  and 383 of the 397 words.
- **Backing echoes, 24 words (measured).** Median spread 36 ms, 90th percentile 315 ms. Chorus
  2's echo is the loosest (the MMS aligner lost it at the slower speeds; its English-aligner
  times were used).
- **Choruses compared by median shift (measured).** Chorus 2 is sung 36.94-36.98 s after chorus
  1, and chorus 3 107.29-107.41 s after. After the shift, almost every word is within 35 ms of
  its repeats. The larger residuals are:
  - **Fixed by hand.** Chorus 1's "Find": the snap took the vowel there and the /f/ in the
    others. Chorus 3's "you" in "What did you find?": the snap moved it 60 ms off the aligners'
    consistent time. Both are set and explained in `finish.py`.
  - **Left as sung.** Chorus 2's "you" in "What did you try?" is 57 ms late, and chorus 3's
    "What" before "find" is 54 ms late; the aligners agree on both.
- **Held tails (measured from the stem).** "seen!" 10.59-12.92 (2.3 s); "interpretations."
  holds 125.03-127.90; "mind?" holds 2.9 s, 3.0 s and 3.4 s in the three choruses (to 58.73,
  95.79 and 166.56). These are within roughly 0.1-0.2 s (reverb and leakage).

### Difficult boundaries, and how they were resolved

| Word | Onset | What was hard | Resolution |
|---|---:|---|---|
| "What" after the held "try?" (three choruses) | 52.63, 89.61, 160.07 | a glide out of a held vowel, with the backing echo sounding on top on the vocal stem | these six chorus-ending lines were re-aligned and snapped on the karaoke **lead** stem, where the echo is removed; the flags fell from 13 to 5 |
| "aim" in "I aim to pass" | 36.689 | vowel into vowel; the aligners spread 219 ms | the onset sits on the visible formant change; least sure in verse 1 |
| "ever" in "you've ever seen" | 9.660 | vowel into vowel; spread 207 ms | sits on a dip and a formant change |
| "The" (intro line 2) | 7.811 | a soft voiced "th" (sound from 7.72, vowel at 7.87); spread 121 ms | median kept |
| Chorus 1 "your", "mind?" | 55.507, 55.803 | one MMS vote out by up to 2.5 s | the other five votes agree within 50 ms |
| Outro "tested yet." | 175.247, 176.363 | Whisper puts "yet" about 0.6 s earlier | all six aligner votes agree within 50 ms, and the syllables NOT-TES-TED-YET fall one per beat (174.62, 175.24, 175.84, 176.36); "yet" is a voiced d-to-y join with no gap, so it is short (to 176.71) |
| Chorus 3 echo "What" (find) | 161.170 | low backing energy at the /w/; MMS a second early | moved to where its repeats put it |

**Least sure overall:** "aim" 36.69, "ever" 9.66, "The" 7.81, the three "What"s after the held
"try?" (52.63, 89.61, 160.07), "yet." 176.36, and chorus 2's echo (88.53-92.15).

## Files

- `beats.json`: `meter` "2/4", `bpm`, `beat_seconds`, `bar_seconds`, `beats` [{t, bar, beat,
  down, raw_t}], `bars` [{bar, t, db}], `sections` [{name, start, end, kind, bars, seconds, db
  per stem}], and `measurement` (accent evidence, local tempo, drift).
- `audio.json`: 30 fps. `db` holds per-frame RMS dBFS for the mix, vocals, lead, backing, piano,
  bass and drums. Also `piano_onset` (0-1, the stab/bounce curve), `drum_onset`, `voice` (1
  where the vocal stem is above −40 dBFS), `stabs` (strong), `stabs_all` and `stops` (all
  instruments 18 dB under their surroundings).
- `lyrics.json`: 68 lines (62 lead and 6 backing echoes) and 421 words, in the shape of
  `../lyrics.json`. `captions.srt` holds the same lines, with the echoes in brackets.
- Scripts: `sheet.txt`, `rough.py`, `align_range.py`, `merge_estimates.py`, `echoes.py`,
  `combine.py`, `finish.py`, `analyse.py`, `explore.py`, `probe.py`; the karaoke scene is
  `karaoke/main.js`, with `karaoke/lead-085.js` lighting words 85 ms early.
