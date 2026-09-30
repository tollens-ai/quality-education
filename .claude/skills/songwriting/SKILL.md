---
name: songwriting
description: Write, revise or audit lyrics and performer phrasing for Software Quality Theory 101, prepare generated song takes, and carry the chosen recording into timing and video production.
---

# Songwriting

The series writes lyrics with Qing, uses a music generator for the music and singing, then
builds the video around the chosen recording. Qing is the domain expert and the songwriting ear.
Her [lyric guidance](../../../LYRICS.md) and the dated expert notes in each episode govern the work.

The unsuccessful melody, harmony and code-composition workflow is
[archived](../../../archive/code-composition/README.md). It is not a step in this skill.

## Write and revise the lyric

Use the [meaning and teaching guidance](../../../docs/lyrics/meaning.md) for the six-axis review,
natural language and the claims the lyric makes. When choosing section jobs or revising a draft,
read [structure and process](../../../docs/lyrics/structure-and-process.md).
The [lyric research reference](references/lyrics.md) explains the craft behind individual rules;
consult it when that explanation would help the current decision.

Before rewriting, skim the episode’s scratchbook. Identify the specific claim, actionable or
phrasing problem; preserve successful rhyme, rhythm and comic structure, and park replaced
lines and useful fragments in the scratchbook. Check technical connotations as well as literal
meaning. Review the whole sheet after a fix: rhymes, callbacks and section jobs interlock.

The draft is ready to try when every line passes the six-axis review, phrases are natural,
and the hook is memorable and true. Refrains and callbacks can reinforce the lesson.

## Fit the words to the performer

Read [rhythm and rhyme](../../../docs/lyrics/rhythm-and-rhyme.md) when selecting rhyme families
or checking recurring patterns. For dense comic lyrics, use its *Patter songs* section and the
[parallel-drafting method](references/drafting-with-parallel-drafters.md) when independent section
drafts would help.

Write a beat grid for recurring lyric patterns: syllable positions, intended stresses, pickups,
rhyme slots and phrase joins. [Rhythm and form](references/rhythm-and-form.md) explains the
notation. Different sections can have different patterns; answering phrases match precisely.
Use `music/check/rhyme.py` for dictionary vowel/stress comparisons, then inspect unfamiliar
pronunciations and intended stress bends. Text checks cannot prove how a take phrases the lyric.

Suno repeated a verse melody under changed words in episode 3 when the beat grid matched exactly
(Qing, 2026-09-30). MiniMax’s episode 1 workaround used contrasting verses, identical repeated
sections and a separate outro. Apply the guidance for the generator actually being used.

## Prepare and hear generated takes

Read the [chosen-performer guidance](../../../docs/lyrics/performers.md) for generator-specific
capabilities, pronunciation and phrasing observations. Prepare a generator copy with section labels, one sung breathing phrase per line, and sounded-out
spellings where pronunciation needs help. Keep ordinary spelling on the lyric sheet and in captions.
Adjust generator-copy punctuation when it causes an unwanted pause. Write the style brief around
this song’s genre, voices and delivery, using original words and a clear musical direction.

Try takes while the lyric is moving. Give Qing the whole song or complete alternatives to hear,
with the uncertain joins and tradeoffs identified. Revise the lyric/grid where takes expose a
phrasing problem; preserve what works. Lyric approval and selection of a full take are separate
judgements. The song is ready for final video work when Qing is happy with the lyric and recording.

## Carry the chosen recording into the video

Use [music/README.md](../../../music/README.md) for audio measurements, word alignment, captions
and a karaoke timing check. Derive timings from the recording, reconcile any sung-word changes
with the lyric sheet, and document the chosen take and remaining limits in the episode notes.

The handoff is ready when the chosen recording, lyric sheet and word timings agree, uncertain
onsets have been checked by ear, and the video can use those timings. Use the
[music-video skill](../music-video/SKILL.md) for the animation.

## Keep the guidance current

When an expert correction generalises, merge its principle into the focused reference that owns
it and update LYRICS.md’s navigation if needed.
Keep dated tool observations and episode examples scoped to what they demonstrate. Melody and
harmony research belongs to the archived attempt, not this active workflow.
