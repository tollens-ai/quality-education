# Storyboarding a one-shot video

Read this for step 4 of [SKILL.md](SKILL.md), once the song is locked. Episode 1 is the first
episode made this way. The evidence behind each stage is in [CRAFT.md](../../../CRAFT.md),
"Pre-production".

Episode 1 is **one shot**: a single continuous camera, no cuts (Qing, 2026-09-25: "I really want
the music video to be one shot"). This guide assumes a one-shot video; for an episode with cuts,
drop the one-shot rules and keep the rest. A cut is the usual way to refresh attention, so a
one-shot video has to do that job with space instead: a change of scale, a return to a place that
has changed, a push through a surface. That makes the world's design the main creative decision,
and it has to be settled first.

## The principle

Ideas cost least as words, more as diagrams, more again as grey-box motion, and most as finished
frames. So generate widely while ideas are still words, and test every idea at the cheapest stage
that can show its flaw. Each stage ends in a gate; don't start the next stage until the gate
passes. Studios work the same way: Disney's story artists redo reels "over and over so other
departments won't have to", and at The Simpsons, once a scene is in colour, "the cost of changing
too much is prohibitive".

Our advantage is that the animatic and the final film are the same code. Fidelity rises layer by
layer on one renderer, so the cheap test is never thrown away.

## How ideas are generated

- **Separate generators, each with its own lens.** Brief several fresh subagents with the same
  facts and a different lens each: for a world rule, the Gondry map (one object per instrument),
  the loop that gains something each time round, the zoom, the scroll, the machine, the stage set
  that changes around a fixed camera, a wildcard seeded with a random string. Add one generator
  from another model family (the GPT route in the workstation's tool map). Generators never see
  each other's work. This is the gag room with the groupthink taken out.
- **Many cheap concepts, few treatments.** Concepts are a few lines each. Only the best two or
  three become one-page treatments, as in music-video commissioning.
- **Plussing, not blocking.** In the gag-room round, builders take the strongest ideas and add
  to them ("yes, and"). They don't list objections.
- **Keep a graveyard.** Log losing ideas with the reason they lost, in the episode file. They can
  seed later episodes.

## How ideas are assessed

- **Mechanical gates first, as yes/no.** These are checkable, so check them before anyone forms a
  taste judgement.
- **Judges are fresh and don't know who wrote what.** A reviewer who has seen a draft can't see it
  fresh again, so every screening uses new subagents.
- **Compare in pairs, not with scores.** "Which of these two would you watch to the end, and why?"
  is steadier than a 1–10 score. Run a small knockout and read the reasons, not just the winner.
- **The criteria are Qing's six questions:** why open it, why watch the next 3 seconds (at every
  3 seconds), why watch to the end, why like it, why share it. Two more: is it true, and can we
  build it in code?
- **Notes name problems, not fixes.** The creator (you) chooses the fix, as Pixar's Braintrust
  works.
- **Models rank; humans certify.** A model saying it laughed is not a laugh. Model viewers are a
  smoke test for confusion and dead air. Qing's eye is the final judge of what's funny and what
  lands.

## Stages

| # | Stage | Artifact | Gate | Qing |
|---|---|---|---|---|
| 1 | **Score the song** | `music/epNN/beats.json`: sections, bars, lines, band stops, energy, with every 3-second window listed | Generated from the take, not typed | No |
| 2 | **World-rule funnel** | ~20 concepts, each with a world rule, a first frame, a title line, the screenshot and the clip moment | Gates below; then a pairwise knockout down to 3 | No |
| 3 | **Treatments** | One page each for the top 3: the world, a timed camera-path map, how each repeat changes, key moments, the ending and loop | Read cold, while the song plays, by fresh judges; pick 1 | **Yes:** the pick and runner-up, and what they claim (a few minutes) |
| 4 | **Beat jobs and path map** | Every 3-second window gets a job (hook, escalate, re-engage, payoff) and a place on the camera path | No empty window; a re-engagement at each chorus return; seams planned | No |
| 5 | **Gag room** | Several ideas per window from lens generators, then a plussing round | Each window has at least one strong idea; ranked check/X | No |
| 6 | **Grey-box animatic** | A browser page: the real take, timed captions, grey shapes and labels, the camera moving on the path. Rendered to a low-res mp4 | Fresh model viewers give swipe points every 3 seconds; seams hold | Optional 3-minute watch |
| 7 | **Rebuild** | Stage 6 again, two or three times | Swipe points stop moving | No |
| 8 | **Style frames** (in parallel from stage 4) | 3 finished-look stills at the hook, a chorus and the climax, from the real code | Readable at phone size | Optional |
| 9 | **Layered final render**, section by section | Detail added to the animatic | Timing, typos, sync against the score; contact sheets | **Yes:** the final truth watch |
| 10 | **After release** | Swipe and retention curves | Each drop logged against its beat, as a hypothesis for the next episode | Summary |

### Concept gates (stage 2)

1. **Packages in one line and one frame.** A title line and a muted first frame carry it. MrBeast's
   rule: know the title and thumbnail before you make the video.
2. **Legitbait:** the video delivers what the frame promises, and teaches the episode's truth.
3. **The world rule covers the song's structure.** Repeats (each chorus return) arrive somewhere
   visibly changed; the band stops and the breakdown have a spatial move.
4. **One shot, for real.** No hidden cuts, no fades to a new scene.
5. **Buildable in code in 9:16,** with the caption band clear of the action.

### One-shot rules

- **Map the song to space.** Every famous one-shot video found a single rule that turns the
  song's structure into the world: one dancer group per instrument (Daft Punk's "Around the
  World"), the landscape as the score ("Star Guitar"), a loop that gains a copy each time round
  ("Come Into My World"), one power of ten every 10 seconds ("Powers of Ten").
- **Build in gated sections.** Each section is a pure function of song time between fixed
  handoff states (camera position, scale, what's on screen), so sections can be built and checked
  alone and handed to separate agents. OK Go built "This Too Shall Pass" this way.
- **The seams are the risk.** Physical one-shots failed most often at the start of a chorus.
  Ours will lose viewers where a cut would have refreshed attention, so plan each chorus return
  and the breakdown as a change of scale, a return or a push through.
- **The song is locked, so the space bends.** Where the world rule doesn't fit a section's
  length, rescale the space, never the song.

### What episode 1's funnel taught (2026-09-25)

- **Run the fact-checker at the treatment stage, not only at the end.** The craft judges missed
  every truth problem the fact-checker found in the three treatments: a credit styled as a
  Community Note (it mimics X's real interface and implies the credited people endorse the
  video), logos altered into characters' heads (implies endorsement, and brand rules usually
  forbid altering marks), and payoff-brief advice that backfires ("skip: logins" on a web app).
- **Judges split by lens, so mix the lenses.** Viewer panels favoured the likeable character and
  the fairness of the blame; editors and directors favoured the concept whose world rule fits the
  vertical frame and builds its seams into the physics. Neither alone is the answer: a split
  between well-argued lenses is the point to bring the expert the pick and the runner-up.
- **Absolute top-6 lists, then pairwise, both worked.** Round 1 (four judges ranking 21 shuffled,
  anonymous concepts) found the same four leaders from different angles; the pairwise round then
  separated them. Swap the A/B order between pairwise judges.
- **Let generators write their output to a named file** in the episode's private working folder.
  Transcribing returned text by hand into files for the judges was the slowest step.
- **Give every stage's brief the same fact sheet.** One concept brief (requirements, song table,
  existing ideas, gates) was reused by generators, judges and treatment writers, so every round
  judged against the same facts.

### Model viewers (stages 6 and 7)

- Gemini samples video at 1 frame per second by default and misses fast action. Raise the frame
  rate, or send frame strips at 4–8 fps with the captions.
- Calibrate first with questions you know the answer to (what's on screen at 0:30, when does the
  band stop). Episode 1's first ear test heard 180 bpm as 150.
- Ask the same question at every 3-second mark: would you swipe here, and why?
- Run 3–5 viewers from the simulated-viewer briefs in [reviewers.md](reviewers.md), each fresh.
