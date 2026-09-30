> **ARCHIVED — unsuccessful code-composition attempt.** Historical notes, not current instructions.
> See  [archive status](../README.md).

# Drafting a patter song with parallel drafters

How episode 3's lyric got from a parked first pass to a checked, expert-corrected sheet in about a
day (2026-09-28 to 2026-09-29). Qing on the result (2026-09-29): "it worked astonishingly well".
This is the loop that produced it, what made it work, and what went wrong on the way. The rules
about lyrics themselves live in [LYRICS.md](../../../LYRICS.md); this file is only about the
process.

## What good looked like

- Every line right on all six axes (meaning, tone, place, scansion, stress, rhyme), *checked*
  rather than believed, because the model can't hear.
- Lines that answer each other share one stress grid exactly, and rhyme in the same slots.
- Qing's time goes on truth and ear: claims, and whether a line sounds right. She never spends it
  on cleanup an agent could have done (CLAUDE.md, *Roles*).
- Every correction of hers lands as a rule or a brief amendment, not as a one-off patch.

## The loop

1. **Write the brief before drafting.** One file, which every drafter reads first. It holds:
   - Qing's rules *verbatim* with dates, kept apart from our interpretation of them.
   - The grid, written as a machine-checkable stress pattern (beats by syllable position), plus
     the shape a tail word must have. Choose the grid around the terms the lesson must say;
     sections can have different grids, but answering phrases share their grid and rhyme slots.
     Check joins between breathing phrases as well as individual lines (LYRICS.md,
     *Writing for the performer*).
   - A **ledger** of which ideas go in which section, so nothing repeats (here: each quality
     named at most once in the whole song).
   - The hard limits: never quote a real song (describe its rhythm as beat positions), write only
     to the assigned file, don't edit tracked files or commit.
2. **Split by section, not by line, and run drafters in parallel.** Episode 3 used one drafter for
   each verse and one for the frame (bridge, break, outro, recurring section). Sections are
   independent once the grid and ledger are fixed; a line-level split would fight over rhymes.
3. **Ask for options and evidence, not one answer.** Each drafter returns three full versions,
   per-line alternates, the checker output for every stress match and rhyme it claims, and a list
   of lines it's unsure of, with why. The list of doubts is where the review starts.
4. **Judge on meaning first, then report side by side.** The parent reads every recommended line
   for what it literally says and implies, then shows Qing whole options with a recommendation
   (LYRICS.md, *Bring the expert whole options*). Small swaps the parent makes itself get
   re-checked before they're shown.
5. **Fold each correction into the brief’s governing rule and redispatch.** Keep the expert’s
   dated wording alongside the updated interpretation, and remove superseded instructions.
   Redirect drafters that are still running with a short message rather than waiting. Episode 3 ran four such rounds; the amendments stayed
   short because each one changed one thing. A clarity repair should target the unclear
   claim or actionable and retain the successful rhyme, rhythm and comic structure; preserve
   displaced material in the scratchbook.
6. **Assemble, then re-read the whole sheet.** Conflicts show up only now: a quality named twice,
   an image that belongs to a rejected idea, a word in a rhyme that another fix changed.

## What made it work

- **A grid you can verify.** The brief gave the beat positions of the target rhythm, so every
  drafter’s proposed text pattern came with checker output. The checker’s `lines` mode
  compares each line to a reference; its rhyme and tail modes check the stressed vowels.
- **Per-drafter pronunciation overrides.** The dictionary lacks jargon ("installability") and has a
  few wrong stresses. Each drafter copied the checker wrapper under its own name and added
  entries, never editing the shared tool. Two drafters found the same shared-tool bugs
  independently, which is how they got flagged.
- **Options, not answers.** Three versions with a recommendation let Qing say "these lines are very
  good, that half rhyme doesn't work" and keep the good ones; the next round started from her picks.
- **Doubts in writing.** Drafters flagged lines that needed a picture, lines whose meaning bent
  for the rhyme, and claims to check with her. That list drove the review.
- **The expert steers structure early and cheaply.** The biggest improvements came as one-line
  corrections: the eighth line becomes a two-line refrain that teaches the moral; drop the chorus
  the genre doesn't need; drop the second image set; days of the week are storyboard, not lyric.
  Each was cheap to apply because sections were independent.

## How the density and the precision were produced

Both came from making the rhyme and the stress into positions a program can check, then holding every
line to them. Qing's guidance (2026-09-28) is in [LYRICS.md](../../../LYRICS.md), *Patter songs*.

- **One grid, written as beat positions.** The verse line is 16 syllables with a beat on every even
  syllable (2, 4, ... 16), and a beat may land on a function word; Qing's own line
  ("ac-CES-si-BI-li-TY's a MESS and SO is USE-a-BI-li-TY") is the reference. Every verse line
  used it, so the checker could compare any line to it, exactly. (The first version of this grid was
  wrong: see *What went wrong*.)
- **The rhyme in the same slots on every line.** The words on beats 4 and 10 rhymed, line after line, so
  a listener could predict where the next rhyme would land. Where a couplet couldn't manage it, both
  lines shared another pair of beats, and the drafter said so.
- **The words that don't rhyme took a beat inside the line.** Performance sat on beat 4 with its stress
  on "for"; the "-ility" words took the tails. Grouping tails by stress meant a five-syllable word and a
  six-syllable word each got a pattern (the six-syllable one starts a syllable earlier), fudging the long
  ones the way she allowed.
- **A light lexical-stress span over the alternating beat grid.** Positions 7 to 9 are function words ("and so I've",
  "as it was"); position 8 still takes a musical beat. Dictionary stress and beat placement
  are different: write both in the brief. Planning around that span helped the lines read
  as speech rather than filler.
- **Every claim came with evidence.** Stress with the checker's line comparison, rhyme with its stressed
  vowels, half-rhyme tails with a tail check that the last stressed vowel is the short "i" and the line ends
  on "ee". Inspect flagged pronunciations before changing a line; keep sung overrides for jargon
  and compressed words (LYRICS.md, *Checking*). Record any intended stress bend. The checker
  compares text and dictionary pronunciations; it cannot prove where a singer puts a beat.
- **The expert supplied the taste.** Her rules told the drafters what to optimise; her corrections
  ("those half rhymes don't work", "the chorus is weak") told us which of the checked lines to keep.

## What went wrong, and the fix

- **Answering from a stale file.** The first reply worked from an early draft in the episode file
  and missed the previous night's drafts, which lived in a private working folder. Before
  answering "write out last night's work", find the last session's actual outputs (its drafts
  folder, its transcript) first.
- **Deriving a rhythm from natural word stress.** The first grid was worked out from where the words
  of a famous line stress naturally, which gave beats on 4, 6, 10, 12 and 14 and three weak syllables
  in a row. Qing's own line showed the real pattern: an alternating beat on every even syllable, with
  light beats on function words. Three rounds of drafting had used the wrong grid before she wrote
  her line out with capitals. When you can't hear the rhythm, ask the ear for one exemplar line with
  the beats capitalised, early, and derive the grid from that.
- **A near-rhyme rule that looked satisfied.** Endings like "bit of it" pass a loose rhyme test
  but aren't the sound she meant. The rule she gave was exact: a short stressed "i" and then a
  long "ee". Encode a rule like this as a checker test, not as prose.
- **A second conceit that muddied the first.** A costume-and-medals frame sat on top of the
  dog-walking story. Qing's test: does it add anything the existing images don't? Cut it, and keep
  the idea for the storyboard stage, where it can be pictures rather than words.
- **Quoting the model's source.** The hard limit against quoting real lyrics applies to reasoning
  as well as output; describe a device by its beat positions instead.
- **Silent waits.** Drafters take 10 to 20 minutes each. Say what is running, and what will come
  back, while they work.

## Applying the method to generated swing patter

Suno reused a verse melody under changed lyrics in episode 3 when the beat grid matched exactly
(Qing, 2026-09-30). Read LYRICS.md’s *Writing for the performer* when deciding whether verses
share a melody: MiniMax’s episode 1 workaround does not constrain Suno’s form.

Episode 4’s Suno trial (2026-09-30) exposed an unreliable join from the screenshot line to
“notification”, despite takes that sometimes managed it. Read LYRICS.md’s *Writing for the
performer* before setting the grid: a conversational genre still needs precise syllable and
stress matches for the generator. Mark phrase joins on the grid and compare repeated shapes;
use a generated take to hear uncertain joins before locking the lyric. Checker agreement
establishes the chosen text pattern; the take and the expert ear establish how it phrases.
The current [episode 4 draft](../../../episodes/04-did-you-actually-test-it.md) remains
provisional, so its phrasing is evidence for a repair, not a validated template.

## Recipe

1. Read the expert's rules and the last session's outputs. 2. Fix the grid, ledger and hard limits
in a brief. 3. Dispatch one drafter per section, in parallel, asking for options, checker
evidence and doubts. 4. Judge on meaning, show whole options with a recommendation. 5. Turn each
correction into an updated brief rule and redispatch, redirecting live drafters. 6. Assemble, re-read the
whole sheet, and only then take it to her ear.
