---
name: songwriting
description: Write, revise or audit lyrics and performer phrasing for Software Quality Theory 101, prepare generated song takes, and carry the chosen recording into timing and video production.
---

# Songwriting

Write lyrics with Qing, generate music and singing with Suno, then build the video around the
chosen recording. Qing is the domain expert and the songwriting ear; [LYRICS.md](../../../LYRICS.md)
sets the craft priorities and each episode’s dated expert notes govern its claims.

- **Decide the scope before touching lines.** For a **fresh draft or form rethink**, decide the
  hook, whole-song shape and pacing first, then salvage lines from the scratchbook only if they
  fit. For a **local repair** (fixing an unclear claim or awkward line in a working song), skim
  the scratchbook first and preserve successful rhyme, rhythm and comic structure.
- **Readiness bar:** a draft is ready for a Suno trial when every line passes the six-axis review
  (meaning, tone/connotation, place in the story, scansion, stress and rhyme), phrases are natural,
  the hook is memorable and true, and the grid and rhymes are checked with `music/check/rhyme.py`.
  A song is ready for video only after Qing has locked both the lyric and a chosen recording.

*(The unsuccessful melody, harmony and code-composition workflow is
[archived](../../../archive/code-composition/README.md) and is not part of this skill.)*

## Write and revise the lyric

Start with the whole-song shape: find the hook, sketch how the song reaches it and what changes
after it, and pick only the sections that earn their slot. Use
[structure and process](../../../docs/lyrics/structure-and-process.md) for form, example curation
and pacing, and [meaning and teaching guidance](../../../docs/lyrics/meaning.md) for the six-axis
review, natural language and the claims the lyric makes. Consult the
[lyric research reference](references/lyrics.md) when craft theory helps a decision.

Park replaced lines and useful fragments in the episode’s scratchbook (`episodes/NN-scratchbook.md`).
Review the whole sheet after any fix: rhymes, callbacks, series-wide terms and section jobs
interlock.

## Fit the words to the performer

Write a beat grid for recurring lyric patterns (syllable positions, stresses, pickups, rhyme slots
and phrase joins) and check pacing landmarks and runtime from the bar count
([rhythm and form](references/rhythm-and-form.md)). Read
[rhythm and rhyme](../../../docs/lyrics/rhythm-and-rhyme.md) for rhyme craft, patter guidance and
`music/check/rhyme.py` caveats. For dense patter sections that split cleanly from one locked grid
and ledger, the [parallel-drafting method](references/drafting-with-parallel-drafters.md) is an
option; for groove or narrative songs, one writer drafting from a locked grid usually keeps voice
and callbacks tighter. Text checks cannot prove how a take phrases the lyric.

## Prepare and hear generated takes

Read [performer guidance](../../../docs/lyrics/performers.md) for Suno prompt, spelling and
punctuation defaults (and episode 1’s MiniMax notes if ever needed). Prepare a generator copy with
section labels and one sung breathing phrase per line, keeping ordinary spelling and punctuation on
the lyric sheet and in captions. Write the style brief around this song’s genre, voices and
delivery, using original words and a clear musical direction.

Try takes while the lyric is moving. Give Qing the whole song or complete alternatives to hear,
with uncertain joins and tradeoffs identified. Revise the lyric or grid where takes expose a
phrasing problem; preserve what works. Lyric approval and selection of a full take are separate
judgements.

## Carry the chosen recording into the video

Use [music/README.md](../../../music/README.md) for audio measurements, word alignment, captions
and a karaoke timing check. Derive timings from the recording, reconcile any sung-word changes
with the lyric sheet, and document the chosen take and remaining limits in the episode notes.

The handoff is ready when the chosen recording, lyric sheet and word timings agree, uncertain
onsets have been checked by ear, and the video can use those timings. Use the
[music-video skill](../music-video/SKILL.md) for the animation.

## Keep the guidance current

When an expert correction generalises, merge its principle into the focused reference that owns
it and update [LYRICS.md](../../../LYRICS.md) if needed. Keep dated tool observations and episode
examples scoped to what they demonstrate.
