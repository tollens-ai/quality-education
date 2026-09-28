---
name: music-video
description: Make, revise or audit an episode's animated music video for Software Quality Theory 101, from the brief and the look through shots, lettering and crowds to a checked master and the report to Qing. Use once the song is locked, when revising a cut after Qing's notes, or to check a cut before anyone watches it.
---

# Make the music video

One auteur makes each video: you, with your own taste, and no reviewer committee. Qing
(2026-09-26): "no reviewer committees, just you and your taste and your work". This file gives
the order of work and says what to read when. [VIDEO.md](../../../VIDEO.md) holds the reasons:
what worked and what didn't, Qing's briefs verbatim, the bar as checks, and the pitfalls met so
far, for any style. Each style has a reference for drawing in it. Episode 1's is
[ink and gouache, with the lyrics lettered in](references/style-ink-and-gouache.md).

**Whose notes win.** Qing's. Keep her words verbatim in the episode's video file. Fold any lesson
that generalises into VIDEO.md if it holds for any style, or into the style's reference if it's
about drawing in that style. The model can't hear the song. Another model's description
(step 2) helps, but sync and feel still need her eyes and ears.

## Steps

**Maximum effort, or don't start.** Before making a video Qing will judge, check that the effort
setting is at maximum. You can't see the setting yourself, so ask her to confirm it, and don't
begin until she has. Qing (2026-09-28): "you should refuse to do me the final video unless effort
is set to max". Episode 1 v1 and v2 and episode 2 v1 all ran below maximum. Looks, tests and
checks don't need it.

Hold the bar to the end (VIDEO.md, *How the auteur works*). There's no rush.

1. **Orient.** Read the episode file: the teaching plan, what the song says, and the guardrails
   for the pictures. Read the lyric timings, and VIDEO.md's brief. Don't study earlier attempts
   unless the job is to revise one.
   *Done when* you can say in one sentence what the viewer must understand by the end, and which
   line they'll remember.

2. **Hear and measure the record.** You can't hear it. Start with the generator's style note:
   ask Qing for it if it isn't in the episode's files, since it describes the take as made. Then
   have a model that can listen describe it: give Gemini the audio alone, under a neutral name with no lyrics beside it, and ask for the
   genre, the instruments and the vocal section by section, the arc, the feel, what would match
   it and what would clash. Check what it says against the measurements, and against Qing's word
   for the genre. Episode 2's is `music/ep02/listening-notes.md`. Then get the bars, the kick and
   the vocal's loudness into a file the renderer reads (episode 1:
   `video/ep01/pier/tools/analyse.py`). Time every sung word, lead and backing, from the voice
   itself, never from the beat grid (VIDEO.md, "Word timing comes from the voice").
   *Done when* you can say how the song feels and what would clash with it, the characters can
   groove on the beat, the camera can breathe with the kick, and Qing has watched a karaoke
   preview and found every word on time.

3. **Choose the world and the style together.** One world that follows the lesson. Episode 1's
   pier is dark while the agent works without context, lit when the chorus asks who it's for, and
   in daylight once you answer. Decide the style and what the words are made of in the same
   choice. Every episode gets a new style and draws everything new: the lettering, the cast, the
   props and the palette (VIDEO.md, "Every episode draws its own"). Start a reference beside
   this file and fill it in as you build. Earlier references show the shape of one, not the
   look to reuse.
   *Done when* you can describe the world, the style and where the words live in three
   sentences.

4. **Build the look before any shots.** In this order: the drawing kit, the layer that makes the
   style (episode 1's `inkify`), the lettering, the cast on a character sheet, the hero
   environment, and one hero frame. A look built as a layer can still change late without
   redrawing every shot. Style studies from Codex's image generation can help you find the look
   (VIDEO.md, *How the auteur works*); draw your own.
   *Done when* the hero frame could be printed.

5. **Build the shots in song order.** For each sung line, decide the one thing to read, where
   its words live and what they're made of, and how they arrive with the voice. Hold the line to
   remember on screen as one block. For words and crowds, mind VIDEO.md's *Pitfalls*.
   *Done when* every line has its shot, and every word has finished arriving just before it's
   sung (VIDEO.md, "Land a little ahead of the voice"), and holds across the cuts until its line
   is done.

6. **Watch the whole film, early and often.** A 540-wide preview renders in minutes. Look at it
   three ways:
   - a contact sheet at one frame a second (`video/lib/strip.sh <video> <start> 20 1 <out.jpg>`
     for each 20 seconds)
   - motion per second (`python3 video/lib/motion.py <video>` lists the near-still seconds)
   - frame strips at 30 fps across the big moves and every cut (`video/lib/strip.sh`)

   *Done when* nothing is still that shouldn't be, and every cut lands.

7. **Measure what the eye misses.** Run the checks in VIDEO.md's *The bar, as checks*:
   - **The words.** Check every sung word's size, time fully on screen, contrast, cover, tilt
     and reading order, and whether it strays into the phone apps' button strip. In the ep01
     renderer, `tools/typo-audit.mjs` records a frame every 0.1 s (run it in three parallel time
     ranges on a small box) and `tools/typo-report.py` judges the result. A new renderer needs
     the same record: every lettered string, with its box, size, opacity, how far it's written,
     and the sung word it shows.
   - **The crowds and props,** by eye, shot by shot: overlaps in the right order, nobody
     floating, props in hands.

   Fix every flag, or write it down as deliberate.
   *Done when* every flag left is there on purpose.

8. **Make a craft pass at full size and at phone size.** Render stills of every shot in song
   order at 1080 and look at a few at a time. Then tile the lyric frames at phone size, 390 px
   wide (`video/lib/sheet.sh <dir> 6 390`), and read them as a viewer would.
   *Done when* you'd post it yourself.

   **Then pass the hand-back gate, every time, before Qing sees anything.** Judging a fix only
   against the note it answers is how v3 of episode 2 kept slipping: people redrawn without their
   circles but off-style, and a verse that lost its pictures while nobody checked. Answer each
   item with frames from the cut, in writing:
   - **Her notes, all of them.** Re-read every note Qing has given on this video, verbatim from
     the episode's video file, and show where the cut answers each. Nothing she praised has got
     worse, and nothing fixed has come back.
   - **The story, from the pictures alone.** Every sung line has a picture of what it says,
     animated, and a stranger with the sound off could follow each story. No stretch of the film
     is only the band.
   - **One world.** Everything is in the film's own style; nothing is even slightly realistic,
     and nothing has the tells of generic AI illustration. Generated art is made from the
     film's own frames and style concepts, never from earlier generations alone.
   - **Motion.** No still stretches (`video/lib/motion.py`, then watch each flagged second).
   - **Fresh eyes.** Give an independent model only the frames and the bar, and ask what a sharp
     viewer would pick on. Answer each point: fix it, or say why it stays. This is an audience
     check, not design by committee.

9. **Render the master and verify it.** Render at 1080×1920 and 30 fps in parallel segments
   (`video/lib/render-parallel.sh`). Verify the file itself: its duration, the frame count from
   decoding it, and stills pulled from it at every fix. Make the upload copy and a thumbnail.
   *Done when* stills from the master show every fix.

10. **Document, land and report.** Write the liner notes in the episode's video file: how it was
    made, how it was checked, and where it falls short. Commit and push. Then tell Qing where the
    cut is, what changed (before-and-after stills help), what's worth her eye, and which
    decisions are hers.
    *Done when* she has the cut and everything she needs to judge it.

## Revising after notes

Put her notes verbatim in the video file. Fix what she named, then check the whole film for the
same kind of fault. On episode 1, one hard-to-read frame led to a check of all 400 sung words,
and that check found much more than the one frame. Re-run the checks from step 6 on, and say in
the report what the wider check found.

## Adding to the pack

When a correction generalises, write the principle under it, not the fix. Check it against the
existing rules and a video that worked, and merge or replace rather than append. Keep each rule
in one place:
- VIDEO.md, if it holds for any style
- the style's reference, if it's about drawing in that style
