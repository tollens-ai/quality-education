# Internal review loop

Read this for step 7 of [SKILL.md](SKILL.md). The briefs below are the ones that took episode 1
from a first script to "ready" in three rounds. Its *Review log* shows what each round caught.

## How the rounds run

- **Round 1: four separate reviewers, run in parallel.** Wait for all four before you revise.
  Their findings overlap, and one revision pass handles them together.
- **Round 2: one combined craft reviewer and a fresh fact-checker.** Use new agents. They read
  cold and report only significant issues.
- **Round 3 onwards: one final cold read** that covers everything, including internal
  consistency. Episode 1's round 3 caught mismatches the earlier lenses missed: a lyric that sets
  a dial nobody drew, a prompt fill that ran longer than its slot, and a word sung but never shown
  on screen for muted viewers.
- **Stop** when a round reports nothing that would hold up the build. After each round, record
  what changed in the episode's *Review log*.
- Audience cold reads omit *Expert notes* and *Review log*, so they see what viewers see.
  Craft and factual reviewers receive the applicable expert notes and approved claims.
  Every brief says: don’t edit files and keep to its assigned scope and word cap.
- Every brief states the production facts: length, 9:16, tempo and bar length, the synthetic
  voice, locked lines, and that many viewers watch muted, some at 1.5x.

## Round 1 briefs

**Songwriter.** A professional songwriter in the episode's genre. Review scansion against the
time slots, rhyme (including internal rhyme), singability for the synthetic voice, hooks and genre
feel, applying [LYRICS.md](../../../LYRICS.md). Point out clunky, cringe or try-hard lines. Return
findings and complete alternatives for the affected sections, with syllable counts and claimed
rhyme matches checked. Preserve successful lines and structure; a local repair does not need a
whole replacement lyric sheet.

**Short-form editor.** Someone who has grown educational and developer accounts on X, TikTok and
Shorts, reviewing against CRAFT.md. Cover:
- whether a muted viewer would stop on the first frame
- where a viewer would lose track of what's happening, or lose a reason to keep watching (clarity
  beats density, and this ranks below teaching and beauty)
- whether the payoff and the open loop work
- the moments people would clip, screenshot or quote-tweet, and what they'd say
- cringe risk
- the post text, and whether the ending loops cleanly (the series uses no end card)
- length

Return the top 5 changes ranked by impact, each with a concrete rewrite.

**Simulated viewers.** Three people, each giving a first-person, moment-by-moment reaction:
- a sound-off novice who ships with AI and has never written a test
- a sceptical senior engineer looking for something to dunk on
- a meme-native teenager watching at 1.5x

For each: when they'd scroll past, what made them laugh or wince, what confused them, their
takeaway in their own words, and exactly what they'd post. Then step out of role and list any
claim one of them could fairly call wrong or smug.

**Fact-checker.** A context-driven testing expert grounded in Weinberg, Bach and Bolton's Rapid
Software Testing and Ed Pringle's work. Check every claim in the lyrics, the on-screen text and
the before/after prompt against CANON.md, SOURCES.md, `research/` and the primary sources. Look for:
- anything false or misleading, or a bad habit it would teach
- claims inconsistent with CANON
- missing or wrong credits
- whether the "after" prompt would actually produce better results

Flag an omission only if it makes the episode misleading. Give each issue a severity
(misleading / imprecise / nitpick) and a fix.

## What the reviewers caught on episode 1

Use these as prompts for your own first read, before any reviewer sees the draft:
- **Lyrics that barely rhyme** or are prose squeezed into bars. See the song-fit limits in SKILL.md.
- **A gag that undercuts the thesis.** Episode 1's robot gold-plated instead of asking, which
  argued against "it's not the agent's fault". Letting the singer own part of the blame fixed it.
- **An end card that contradicts the lesson.** It promised the robot would rewrite prompts, which
  is the same guessing the song criticises.
- **Advice that overshoots the source.** The "after" prompt moved the *why* out of the code, which
  contradicts the Martin Davidson source it was based on.
- **Credits that imply endorsement.** A credit line placed near a claim can suggest the credited
  people endorse that claim.
- **Lines that are misheard when sung.** "That's what product's for" was heard as "that's what
  *the* product's for", which reverses the point. A quote sung by the lead sounds like the singer's
  own view.
- **Credits given to the wrong person.** The bridge credited Ed Pringle for agents as team members,
  which is Qing's point; Ed's is "someone *or something*". Check each credit against SOURCES.md
  and CANON.md.
- **Text on screen too small or too brief to read on a phone.** Hold the payoff full screen long
  enough to screenshot.
