---
name: songwriting
description: Write, revise or audit a song, from lyrics and song map through melody, harmony and arrangement to a mix made in code. Use when composing or fixing any part of a song, or checking one before a listener hears it.
---

# Songwriting

Research-grounded craft for writing songs, organised by stage. The references hold the rules and
their sources; this file says which to read when. The worked example is episode 1 of *Software
Quality Theory 101*: a pop-punk song made entirely in JavaScript
([song map](../../../episodes/01-song-map.md), [score](../../../music/ep01/score.mjs)).

**Whose rules win.** A human expert's verdicts outrank the theory here. In this repo that's Qing:
her rules are in [LYRICS.md](../../../LYRICS.md) and [MUSIC.md](../../../MUSIC.md), and her words
on each song are kept verbatim in its episode file. When a reference and a house rule disagree,
follow the house rule and note the tension. The model can't hear, so treat every judgement of
sound as a hypothesis until a human ear or a measurement confirms it.

## Steps

Work in this order. Each stage is cheap to change before the next one is built on it, and
expensive after.

1. **Words.** Write or revise the lyric. Read [lyrics.md](references/lyrics.md) for prosody,
   rhyme, hooks and titles, comedy and patter, teaching in a song, and writing for a synthetic
   voice.
   To draft a whole song fast, use the parallel-drafter loop in
   [drafting-with-parallel-drafters.md](references/drafting-with-parallel-drafters.md).
   Before rewriting, skim the song's scratchbook of past drafts and fragments; afterwards, add
   the replaced lines and any stray fragment worth keeping (LYRICS.md, *Keep every draft*).
   *Done when* each line says something new, every stressed word is a real, natural phrase, and
   the title or hook sits in a power position.

2. **Song map.** Fix the form, bar counts, tempo, key, a chord for every bar, and every syllable
   on the rhythm grid, before making any sound. Read
   [rhythm-and-form.md](references/rhythm-and-form.md) for text-setting, syncopation, phrase
   lengths and form, and [harmony.md](references/harmony.md) for choosing the chords.
   *Done when* parallel lines share a rhythm, stresses land on beats or on deliberate pushes, and
   each section's chords do its job (verses loop, pre-choruses build, choruses arrive).

3. **Melody.** Write pitches to the grid. Read [melody.md](references/melody.md) for contour,
   leaps, motifs, the climax note, fit to the chords, and singability.
   *Done when* the hook holds the song's biggest leap and top note, the rest moves mostly by step,
   and strong-beat notes are chord tones or written-down colours.

4. **Check before sound.** Run the mechanical checks, then render a click-and-guide track for a
   human to hear the phrasing (in this repo: `music/ep01/audit.mjs`, `leaps.mjs`,
   `music/check/prosody.py`, and `guide.mjs` with `karaoke.mjs`). Each reference ends with a
   *Checkable* section listing more checks worth automating.
   *Done when* every flag is fixed or written down as deliberate, and the human's corrections are
   in the map and the house rules.

5. **Arrangement and production.** Decide what plays in each bar, then synthesise, mix and master.
   Read [production.md](references/production.md), and MUSIC.md's sound-design, engineering and
   mix sections for doing it in code.
   *Done when* the energy curve matches the plan, the vocal owns its frequency band, the mix
   translates to a phone speaker, and the measurements in production.md's *Checkable* section
   pass.

## Changing the song later

Go back to the earliest stage the change touches and redo the checks from there on. A new rhythm
means re-checking melody and harmony; a new chord means re-checking the melody against it.

## Adding to the pack

When a human corrects a song and the lesson generalises, add it as a house rule (LYRICS.md or
MUSIC.md). If research explains or extends it, add the rule and its source to the matching
reference. Keep each rule in one place.
