# What the episode 3 take sounds like

The model making the video can't hear the song, "The _ilities_". This file is what stands in for its
ears: Suno's own style note for the take, and what could be measured from the file. No listening
model was used on this take (the music-video skill's step 2 asks for one; Qing asked for a
Sonnet-only effort on this video, so the description below is from measurement alone). Anything
that would need an ear is marked as inferred, and is for Qing to correct.

## Suno's style note for the take (from Qing, 2026-09-29, verbatim)

> Comic opera with light orchestral room reverb, nimble close-miked baritone patter and crisp
> spoken breaks, close piano with a small orchestra, strongly singalong men's chorus refrain,
> brisk bouncy 2/4 with traditional chord progressions and cadences.

This is the generator's own description of what it made, so it outranks anything inferred below.

## Measured

- **Length and pulse.** 213.2 s. A steady 139.2 bpm in 2/4: a beat every 0.431 s, a bar every
  0.862 s, 247 bars. The beat tracker's tempo wobbles by a few percent from beat to beat and
  drifts no more than about 100 ms against a straight grid over 20 seconds, so there is a beat
  map (`beats.json`), and cuts and pulses follow it, not a fixed tempo.
- **Oom-pah.** The bass and low piano are stronger on the first beat of each bar than the second
  (of the bass notes that sit on the grid, 44 fall on beat 1 and 26 on beat 2). The stress falls
  where it would in a polka: down on 1, up on 2.
- **Every sung line is four bars, starting on the second beat (the list's lines are two).** The first word is a pick-up on
  the "pah" of the bar before, the first stressed syllable lands on the next downbeat, and the
  last stressed syllable lands on the last beat of the fourth bar. The patter lines have 16
  syllables over 8 beats. The sung list in the break is two bars a line; the choruses' lines are
  four.
- **Word times** come from the voice, not the grid (`lyrics.json`): two aligners at three
  playback speeds, voted, snapped to the voice's own onsets. The two aligners' word starts differ by a median of 16 to 26 ms (90th percentile 40 to 52 ms);
  12 words are flagged for a reason (see the episode's video file).

## The arrangement, by section

Times are the first sung word to the moment the voice stops. Levels are average dB from the
separated stems (piano and orchestra together are "other"); each section is louder than the last
by degrees, and each new chorus adds instruments.

| Section | Seconds | Bars | What's playing |
|---|---|---|---|
| Intro | 0.0-3.3 | 1-4 | one orchestral flourish and piano; no bass or drums |
| Verse 1 | 3.3-30.9 | 5-36 | piano and a light orchestra only, the voice alone on top (baritone patter); the quietest section |
| Chorus 1 | 31.8-52.1 | 38-61 | a crash on the downbeat, then the group of voices over piano and orchestra, a little louder; still no bass or drums to speak of |
| Break 1 | 52.8-56.8 | 63-67 | the band falls to nearly nothing under the spoken line "Right. You want me to fix the code?..." |
| Verse 2 | 58.9-86.7 | 70-101 | the baritone again; a bass line enters (the bass stem goes from silent to audible), and a few percussion accents |
| Chorus 2 | 87.7-108.5 | 103-126 | the group of voices with drums and bass now (drums about 20 dB up on chorus 1) |
| Instrumental | 108.5-121.8 | 127-142 | 16 bars, no voice: full band. Four 4-bar phrases, the last thinning to bass climbing, stabs on the second beat, a high repeated trill, and a fill into the bridge |
| Bridge | 121.8-151.2 | 143-176 | the baritone over piano and bass; the band nearly stops for the hunt (about 133-137 s) |
| Break 2 | 151.7-178.0 | 177-206 | the sung list, two bars a line, over a loud bass; "I could name you a hundred..." and then a held "you" (about 173.3-177.9 s, 4.6 s) |
| Lead-in | 178.0-181.4 | 207-210 | no voice: a drum build into the last chorus |
| Chorus 3 | 181.4-208.6 | 211-242 | the loudest: the full band and the group of voices. A pause of about 2.5 s before the last line (198.1-200.6 s); the last "know" is held about 3.5 s (204.7-208.2 s) |
| Outro | 208.6-213.2 | 243-247 | after the voice stops, a short band tag: drum hits at 209.3, 209.8 and a strong one at 210.8 s, bass down to a low note at 210.4 s, the last chord at 211.3 s ringing out to about 212.5 s |

The spoken break's words sit in the gap the band leaves, and the sung list's words are the
fastest in the song: about 7 syllables a second.

## What would match and what would clash (inferred, for Qing to correct)

- **Matches:** anything that bounces on the beat and leans left and right (the oom-pah), on twos,
  brightly; a picture that grows busier and louder as the arrangement does (verse 1 is the
  quietest and plainest; chorus 3 the fullest); cuts on the four-bar line, with the gag landing on
  the last beat; a drum or cymbal hit as a hit on screen; a big silence and stillness for the
  spoken break and the held notes.
- **Clashes:** a slow camera, a drone, moody dark grading, smooth realism; anything that moves on
  every quarter note in the verses (they are one instrument and a voice); the same motion at the
  same size in all three choruses (each chorus has a bigger band than the last).
