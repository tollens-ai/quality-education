---
name: write-episode
description: Write, revise or audit an episode treatment for Software Quality Theory 101, the animated music-video series. Use when starting a new episode, reworking one after expert feedback, or checking whether a draft will keep viewers watching.
---

# Write an episode

Each episode is a short music video. It teaches one idea from software quality theory to people
who build with AI coding agents. Each one ends with what that idea changes about how they brief
their agent.

**Roles.** You are the content creator: bring a specific, ambitious draft. Qing is the domain expert,
and she corrects what the draft *claims*. Do not ask her to supply the creative work. Research
behind the craft rules is in [CRAFT.md](../../../CRAFT.md). Where ideas come from, and who to
credit, is in [SOURCES.md](../../../SOURCES.md).

Write each episode to `episodes/NN-slug.md`. [Episode 1](../../../episodes/01-you-never-told-me.md)
is the worked example of the finished shape.

## Steps

1. **Collect the expert's truth.** Read [CANON.md](../../../CANON.md) for truths already approved
   across the series. Paste Qing's notes on this concept verbatim under *Expert notes*. When she
   states something other episodes will rely on, add it to CANON.md too.
   Keep her words separate from your interpretation. If she hasn't given notes yet, draft from
   SOURCES.md and mark the claims you're unsure of.
   *Done when* you can state the concept in one sentence she would sign.

2. **Find the misconception the audience actually holds.** Name the wrong belief a vibecoder holds
   about this concept, in their own voice (e.g. "the agent should know what I meant"). Then write
   the refutation as a single sentence.
   *Done when* the misconception is something a viewer would recognise saying or doing, not a
   textbook error.

3. **Pick the song.** Decide who sings (the agent, the user, the app, a stakeholder), which genre
   carries the emotion, and the one line people will remember. That line is usually the chorus.
   The line to remember is plain, fair and true, and it moves people; a surprising point of view
   helps. Qing's reaction to episode 1's line ("made me well up a little") is the benchmark to aim
   for. Write lyrics by [LYRICS.md](../../../LYRICS.md); add a lesson there only as a principle,
   checked against its rules and a song that worked, merged rather than appended.
   **Examples and cast.** These decide whether the idea feels rich or trivial:
   - *Spread the concept across scenarios.* When the idea has several facets, give each facet
     its own example, from whichever scenario makes it most vivid, one per line as in episode 1's
     verses. A single simple scenario makes the idea look like one thing, and the teaching
     boring; pick scenarios where the idea is non-obvious and pays off (Qing, 2026-09-27). Several
     scenarios also give the video a new world every few seconds.
   - *Invent a cast.* Fictional people are free. Give each line, or each singer, its own
     specific person, with a name and a job, so "you" stays one person talking to one person and
     the video has someone to draw. Don't strain the premise to keep one "you" (Qing, 2026-09-27).
   - *Trail later ideas by their plain words.* A concept that a later episode names can appear
     earlier as the common-sense care behind it ("does it install?", "is it safe?") without its
     jargon. That grounds the example, and it sets up the later episode.
   - *Play the genre all the way.* Use its recognisable moves, straight, with Weird-Al-level
     specifics; see LYRICS.md, *Borrow a genre's moves and titles*.

   Work on the lyric sheet alone, section by section, and note only the **key frames** a line
   depends on (a gag, a clip moment, an on-screen device). Don't storyboard yet: every lyric
   change would throw the storyboard away (Qing, 2026-09-24).
   *Done when* the line to remember is quotable out of context and still true, and Qing has
   locked the lyrics.

   **Song-fit limits.** Write each song's genre conventions ([MUSIC.md](../../../MUSIC.md)). In
   4/4, one bar lasts 240 ÷ bpm seconds. Outside patter, a line fits about 3–4 sung syllables a
   second: at episode 1's 180 bpm, 8–12 in a 2-bar line of 2.7 s. More than that blurs when sung,
   and the words on screen can't be read in time. For a synthetic singer, prefer short words, open
   vowels and few consonant clusters. The fuller rules are in [LYRICS.md](../../../LYRICS.md).

   **Then make the song, before any video work** (Qing, 2026-09-24: "let's get to a song we're
   happy with first before starting video"). The song's timings drive every shot. Use the
   [songwriting skill](../songwriting/SKILL.md) for the craft and
   [music/README.md](../../../music/README.md) for the toolchain and order of work.
   *Done when* Qing has heard the full mix and locked it.

4. **Make the video, once the song is locked.** The first process for this (a one-shot
   storyboard funnel, a grey-box animatic and a parallel section build) didn't work: Qing found
   the result dizzying, hard to follow, spoiling lyrics before they were sung, and plain rather
   than beautiful. It is archived with its post-mortem in
   [archive/ep01-video-v1/](../../../archive/ep01-video-v1/README.md). Don't reuse it. What
   worked instead (one auteur, no committee) is the [music-video skill](../music-video/SKILL.md),
   and the brief to start from is in [VIDEO.md](../../../VIDEO.md).

5. **Write the agent-facing takeaway.** Show the vague prompt at the start and the rewritten prompt
   at the end. The rewrite must use the concept, not just be longer. Assume every viewer is
   building their own, completely different app (Qing, 2026-09-27), so what they save is the
   questions to answer for their own app, not one example app's brief. But nobody learns from
   generalisations (Qing, 2026-09-27), so give every question a concrete worked example.

6. **Say why they'd like it and why they'd share it.** Name the specific reason for each (tagging
   someone, something useful to save, novelty, something to argue about). Draft the post text; it
   is the first thing people read, above the video.

7. **Review it yourself before the expert sees it.** Run independent reviewers in parallel, each
   with one lens:
   - a songwriter: scansion, rhyme, singability for the synthetic voice, hooks
   - a short-form editor: the muted first frame, where viewers drop off, share moments, cringe
   - simulated target viewers, from a novice vibecoder to a sceptical senior engineer
   - a quality-theory fact-checker, working against CANON.md and the sources

   Round structure, reusable briefs and what past rounds caught are in
   [reviewers.md](reviewers.md). Revise, and repeat until the reviewers find nothing significant.
   *Done when* you'd be proud to show it on content quality, enjoyment, usefulness, share-ability
   and lyric craft. The expert's time goes on truth, not on polish you could have done yourself.

8. **Quiz the expert on claims.** List only the questions where her answer would change the draft:
   wrong emphasis, half-truths, advice that backfires. Cut any contested claim from the lyrics
   until she answers.
   *Done when* she has approved or corrected every claim in the lyrics and on-screen text.

9. **After the build, write liner notes:** how it was checked, and where it falls short.

## Retention checks (below teaching and beauty; see [CRAFT.md](../../../CRAFT.md), *Decided*)

- **Opening (0–3s):** the first frame is the thumbnail and plays muted. It needs a tension the viewer
  recognises, not a title card, and the first lyric starts on the first beat.
- **Every moment:** the viewer can tell what's happening and has a reason to keep watching.
  Clarity beats density: if it's too complex to parse, people scroll away.
- **The chorus:** people swipe away once they feel they've got the point. Before the chorus
  resolves, open a new question (e.g. an empty prompt box that fills in at the end).
- **The end:** the final payoff pays off the question opened earlier, then the video loops. No end
  card or logo: people share teaching, not marketing (Qing, 2026-09-24). Invite replies in the post
  text, as a question between builders. (Episode 3 ends on a two-page card that teaches, every quality the
  song names in plain words to screenshot; the rule is against marketing.)
- **Sound off:** the lyrics appear on screen as captions, so the video makes sense on mute.
- **Credit:** credit on screen where an idea comes from Ed Pringle or another named source.
