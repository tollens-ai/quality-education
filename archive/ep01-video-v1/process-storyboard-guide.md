# Storyboarding a one-shot video

Read this for step 4 of [SKILL.md](../../.claude/skills/write-episode/SKILL.md), once the song is locked. Episode 1 is the first
episode made this way. The evidence behind each stage is in [CRAFT.md](../../CRAFT.md),
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

## The storyline serves the theme

The series exists to teach (Qing, 2026-09-25: "our purpose is to be educational so you want to
evoke as much of our quality philosophy and educational points relevant to this lesson as
possible"; "the storyline should serve the theme"). The world and its story are a model of the
episode's ideas: every landmark, prop and turn teaches something from the quality philosophy.
A device that could front any song on the same topic (a dog fetching, a marble run) is a gimmick,
however well it packages.

Teaching and presentation aren't a trade-off. People won't keep watching an educational video
unless it's presented well (Qing, 2026-09-25: "you gotta think like, Tim blais style craft"). In
A Capella Science the craft is the teaching: the form mirrors the content, every line is dense and
correct, and the picture shows the actual idea at the moment it's sung. Experts share it because
it's precise; newcomers stay because it's delightful. So judge concepts on how well the craft
carries the ideas, not on teaching and virality as separate scores.

**Visuals win the next second.** "the visuals are going to be what wow people first more than
the storyline - every second is about whether people watch the next second" (Qing, 2026-09-25).
The storyline serves the theme, but the picture itself (beautiful, surprising, satisfying motion)
is what holds each second. A world that teaches well but looks like an infographic fails. And the
artistry is itself the wow: "the reason these are going viral is because people are like wow opus
is such a good artist" (Qing). Aim for a distinctive artistic voice and visible mastery, the kind
of look that makes people stop and ask how an AI drew it.

**Feelings run through the whole video, not section by section:** viewers invested throughout,
sympathetic to the characters, curious about the answers (Qing: "invested throughout! sympathetic
for the characters! curious about answers!"). Plant open questions early and pay them off late;
give the characters something to want and something to lose.

**Picture and lyric carry different parts of the idea.** Tim Blais: showing "exactly what I was
singing on the screen … that's a real waste of space"; "tell part of the story with the with
visuals and part of the story with the lyrics" ([research](../../research/tim-blais-craft.md)).
For every line, write what the picture adds that the words don't: the consequence, the
counterexample, the person it's for. A shot that just illustrates the sung noun is a defect. The
biggest idea goes on the song's emotional peak, and the hook lines get the most precise picture.

The standard is "incredibly dense but still clear to parse" (Qing, 2026-09-25). Density comes
from layers, not clutter: one main read at a time, timed to the lyric and top of a strict visual
hierarchy, while background detail, callbacks and easter eggs reward a second watch without
competing with the main read.

## Our costs aren't a studio's

Qing (2026-09-25): "remember what's cheap and expensive and quick and slow for you isn't the same
as for the studios", and then: "it's not true that just because everything is quick compared to a
studio they're the same amount of cheap. there's still elapsed time. the whole timeline compresses
because I'm expecting you to be done in hours".

- **Elapsed time is the budget.** The whole episode is expected in hours, so the studio's ratios
  still hold inside that compressed timeline: text takes minutes, a grey-box animatic an hour or
  more, finished frames longer. Start with text, and move to motion only for questions text
  can't settle.
- **Qing's attention is the scarcest thing.** Bring her short things she can judge in seconds.
- **Our perception is expensive:** we can't hear, and we see video only as frames or through
  another model.
- **Paper judgements are fast but weak evidence,** because model judges react to prose. When
  well-argued judges split, that's the question for a short motion test or for Qing, not for more
  paper.

## How ideas are generated

- **Separate generators, each with its own lens.** Brief several fresh subagents with the same
  facts and a different lens each: for a world rule, the Gondry map (one object per instrument),
  the loop that gains something each time round, the zoom, the scroll, the machine, the stage set
  that changes around a fixed camera, a wildcard seeded with a random string. Generators never see
  each other's work. This is the gag room with the groupthink taken out. **It's an Opus job:**
  every generator, judge and builder is Opus (Qing, 2026-09-25: "I wouldn't bother with GPT
  honestly. make it an opus jon"). Part of the point is that Opus made it, so vary the briefs and
  lenses for independence rather than the model family. Work other models have already done can
  still be referenced ("if they're already there of course you can reference them tho").
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
- **Judge the craft that carries the ideas.** How much of the teaching inventory the concept makes
  visible, how precisely its world and storyline mirror the lesson's argument, and whether that
  precision is itself the delight: the thing an expert would share and a newcomer would stay for.
  Qing's six questions (why open it, why watch the next 3 seconds, why watch to the end, why like
  it, why share it) are answered by that craft, not by a hook bolted on. Then: is it true, and can
  we build it in code?
- **Notes name problems, not fixes.** The creator (you) chooses the fix, as Pixar's Braintrust
  works.
- **Models rank; humans certify.** A model saying it laughed is not a laugh. Model viewers are a
  smoke test for confusion and dead air. Qing's eye is the final judge of what's funny and what
  lands.

## Stages

| # | Stage | Artifact | Gate | Qing |
|---|---|---|---|---|
| 1 | **Score the song** | `music/epNN/beats.json`: sections, bars, lines, band stops, energy, with every 3-second window listed | Generated from the take, not typed | No |
| 1b | **Teaching inventory** | Every idea from the quality philosophy that bears on this lesson: plain wording, source and credit, CANON-approved or not, the lyric lines it deepens, a picture seed | Read from primary sources, not summaries; ranked core / supporting / tangential | Only for ideas not yet in CANON |
| 1c | **Teaching plan** (text) | For each part of the song: what it does in the story, what it teaches, what people come away knowing, how they should feel | Every section earns its place; the arc builds; Qing checks it | **Yes:** a one-page read |
| 2 | **World-rule funnel** | ~20 concepts, each with a world rule, a first frame, a title line, the screenshot and the clip moment | Gates below; then a pairwise knockout down to 3 | No |
| 3 | **Treatments** | One page each for the top 3: the world, a timed camera-path map, how each repeat changes, key moments, the ending and loop | Read cold, while the song plays, by fresh judges; pick 1. If they split, build the contenders as grey-box animatics and judge those | **Yes:** the pick and runner-up as short clips, and what they claim |
| 4 | **Beat jobs and path map** | Every 3-second window gets a job (hook, escalate, re-engage, payoff) and a place on the camera path | No empty window; a re-engagement at each chorus return; seams planned | No |
| 5 | **Gag room** | Several ideas per window from lens generators, then a plussing round | Each window has at least one strong idea; ranked check/X | No |
| 6 | **Grey-box animatic** | A browser page: the real take, the lyrics as kinetic type, grey shapes and labels, the camera moving on the path. Rendered to a low-res mp4 | Fresh model viewers give swipe points every 3 seconds; seams hold | Optional 3-minute watch |
| 7 | **Rebuild** | Stage 6 again, two or three times | Swipe points stop moving | No |
| 8 | **Style frames** (in parallel from stage 4) | 3 finished-look stills at the hook, a chorus and the climax, from the real code | Readable at phone size | Optional |
| 9 | **Layered final render**, section by section | Detail added to the animatic | Timing, typos, sync against the score; contact sheets | **Yes:** the final truth watch |
| 10 | **After release** | Swipe and retention curves | Each drop logged against its beat, as a hypothesis for the next episode | Summary |

### Concept gates (stage 2)

0. **The world is the lesson.** Its rule, its landmarks and its story turns are ideas from the
   teaching inventory. Test: swap in a different song on the same topic; if the world still fits
   just as well, it's a gimmick.

1. **Packages in one line and one frame.** A title line and a muted first frame carry it. MrBeast's
   rule: know the title and thumbnail before you make the video.
2. **Legitbait:** the video delivers what the frame promises, and teaches the episode's truth.
3. **The world rule covers the song's structure.** Repeats (each chorus return) arrive somewhere
   visibly changed; the band stops and the breakdown have a spatial move.
4. **One shot, for real.** No hidden cuts, no fades to a new scene.
5. **Buildable in code in 9:16,** with room composed for the lyrics: they're designed motion
   graphics, not a subtitle band (CRAFT.md, "The bar for craft").

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

- **Judging for packaging picks gimmicks.** Episode 1's first funnel led with virality and treated
  teaching as a pass/fail gate, and the winners (a robot pup fetching, a marble run) were devices
  that carried jokes, not the philosophy. Qing sent them back as too gimmicky. The fix isn't to
  flip the priority but to stop splitting them: build the teaching inventory first, then judge how
  well the craft carries the ideas.
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
- **Read the ambition brief before briefing anyone, for its level of ambition** (not its style:
  Qing, "I didn't want the style specifics from the prompt, more the level of ambition"). The
  concept brief also put the lyrics in a caption band, against CRAFT.md's own rule that on-screen
  text is the main tool for holding attention: the lyrics are designed motion graphics, huge at
  the hook and composed into the shot, with the background quiet where the words are big.
- **Give every stage's brief the same fact sheet.** One concept brief (requirements, song table,
  existing ideas, gates) was reused by generators, judges and treatment writers, so every round
  judged against the same facts.

### What episode 1's build taught (2026-09-26)

- **A shared plan with fixed handoffs makes a one-shot parallel.** `plan.js` held the geometry,
  the cast's positions and the camera at each section boundary; six builders (world, cast, four
  sections) each owned one file and met exactly at the handoffs. `main.js` guarded every stage,
  so one builder's runtime error never blanked everyone's frames.
- **Screen the whole cut early, with fresh viewers on 1 fps contact sheets.** They found what no
  builder saw in their own section: a chorus that repeated with nothing new, lyrics over the
  action, a pixel font whose C reads as O ("OLAWD"), a colour rule broken at the climax.
- **Define what each colour means, and check every section against it.** Gold meant "served by
  this build"; the definition and "I'm someone too" needed their own signal (warm white), or the
  climax would have said one build serves everyone.
- **Resume the builders for fixes.** They keep their context, so a fix list takes minutes.
- **Check the output, not the exit code.** A render that "succeeded" can still be frame 0 every
  frame (a playback loop repainting between draw and capture); a verification step can be the
  thing that's broken (ffmpeg prints no frame count in copy mode).
- **Know the box:** dev containers cap threads (512), so render with a few segments and small
  encoders (`render-parallel.sh` defaults to 4 × 4 threads) and launch Chromium with
  `--disable-dev-shm-usage`. Never trace a shell's start-up there (`bash -x`): it exports the
  workstation's secrets.

### Model viewers (stages 6 and 7)

- Gemini samples video at 1 frame per second by default and misses fast action. Raise the frame
  rate, or send frame strips at 4–8 fps with the captions.
- Calibrate first with questions you know the answer to (what's on screen at 0:30, when does the
  band stop). Episode 1's first ear test heard 180 bpm as 150.
- Ask the same question at every 3-second mark: would you swipe here, and why?
- Run 3–5 viewers from the simulated-viewer briefs in [reviewers.md](../../.claude/skills/write-episode/reviewers.md), each fresh.
