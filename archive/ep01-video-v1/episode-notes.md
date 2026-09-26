# Episode 1 video v1: notes moved from the episode file

Moved here from [the episode file](../../episodes/01-you-never-told-me.md) on 2026-09-26, when this
build was archived. Links are as they were written and may point to the old paths.

## Storyboard funnel (one shot, 2026-09-25)

Run by the [storyboard guide](../.claude/skills/write-episode/storyboard.md). Working files
(briefs, every concept, every verdict) are local in `.private/ep01-storyboard/`.

**Stage 2, world-rule concepts.** Seven separate generators wrote 21 concepts, three each: six
Opus subagents with one lens each (the song's layers as objects, the loop that accumulates,
scale, the interface as the world, the machine or stage set, a random-seed wildcard) and one GPT
generator with an open brief.

**Blind judging.** The concepts were shuffled and stripped of names. Four fresh judges (a
short-form editor, a panel of three target viewers, a one-shot animation director, and a GPT
creative director) applied the five gates, ranked a top 6 and named ideas worth keeping.

| Concept | Points (6 for 1st … 1 for 6th, four judges) | Top-6 lists |
|---|---|---|
| Fetch! (a robot pup fetches everything but the right thing, round one city block) | 15 | 4 of 4 |
| Scroll Back Up (one chat; each pre-chorus flings back up to "make it good") | 15 | 3 |
| The Drop (a "make it good" ball falls through a marble-run tower) | 14 | 3 |
| Round the Block (each lap leaves a copy of the singer; the copies become the girl group) | 9 | 2 |

**Pairwise knockout** of those four, by two fresh judges in opposite orders (an Opus panel and
GPT): Fetch! won all six of its matches. The Drop and Scroll Back Up split second and third.
Round the Block is out.

**Stage 3, treatments.** Fresh writers turned each finalist into a one-page treatment with a timed
camera path, folding in the judges' fixes and the ideas they wanted kept. Four reviews followed:

| Reviewer | Pick | Runner-up |
|---|---|---|
| Craft panel (editor, one-shot director, muted viewer), 3-second swipe walk | The Drop | Scroll Back Up |
| GPT judge, same walk, opposite order | Fetch! | The Drop |
| Fact-checker | Scroll Back Up is truest to the lesson | Fetch! shares the blame best |
| Head-to-head, target-viewer panel (fixes assumed applied) | Fetch! | |
| Head-to-head, editor and director, opposite order | The Drop | |

Scroll Back Up drops out: it parks the camera at the top of the scroll for about 70 seconds of the
loudest choruses. Fetch! and The Drop split two–two, along the judges' lenses:
- **Fetch!** A robot pup fetches everything but the right thing, round one city block. It has
  the character, the best title line ("I told my AI to fetch. It brought back Kubernetes."), and
  the fairest blame: the pup runs past the ASK button twice, then goes back and asks. Each
  chorus returns to the same corner with a bigger pile. The risk is scale on a phone.
- **The Drop.** The singer is a ball falling through a marble-run tower, so height is time. It
  fits 9:16 naturally. Every pre-chorus ends in a trapdoor drop, so the seams are built into the
  physics. The sorters escalate: 4 chutes, then 8, then 1. The risks are a long descent that
  feels like scrolling, and a ball that can't really choose.

**Fixes that apply whichever wins** (from the fact-checker):
- **No Community Note.** A credit styled as one mimics X's real interface and implies Weinberg,
  Bach & Bolton and Ed endorse the video. Use a plain credit in the video's own style, and end it
  before "I'm someone too", which is Qing's point.
- **Logos stay flat and unmodified.** The post text says the video isn't affiliated with or
  endorsed by any company shown.
- **The payoff brief mustn't teach a bad habit** ("skip: logins" did). It names who, what they
  value, cost ("don't burn my quota") and lifespan.
- **Generic pods, not the Kubernetes logo.**

**Graveyard** (losing ideas and why, kept to seed later episodes):
- *Round the Block*: a strong one-shot rule, but the lesson is thin; a weaker version of Fetch!'s
  block loop. A judge's rescue worth keeping: each lap is a "Regenerate" from the same vague
  prompt ("re-rolling won't fix a vague prompt").
- *Powers of You* (a zoom out to the Moon and back): the best camera arc and seams, but "a
  planet-scale zoom to say 'write a spec' is a bit much".
- *Circle Line* (git log as a Tube map): the final map is poster-worthy, but it needs git
  literacy and "who" arrives late.
- *Guess Who It's For*: the truest metaphor, but trade-dress risk and tiny faces.
- *Made to Measure* ("My AI made me a ballgown for leg day"): the funniest line in the pool, but
  one room for 3:20.
- *GOOD, From Exactly One Angle* (a sculpture that only reads GOOD from the demo angle): the
  strongest visual contradiction, but it leans towards "quality is opinion".
- *Powers of Time*, *The Sequencer Ring*, *The Feed Is the Score*: failed the truth gate. They
  teach "quality is how long it lasts", or they're visualisers with no lesson.
- *The App Is the Band*: "loudness = feature count" is invisible on mute and can teach "less is
  better".

**Round 2 (after "too gimmicky", 2026-09-25).** The teaching plan came first; then nine
theme-first concepts (Opus generators with the lenses *the agent's perception*, *the people who
matter* and *making*, two of GPT's from before, and one of mine), judged blind by three fresh Opus
judges: an educator-artist in the Tim Blais mould, a viewer panel, and a quality-theory
fact-checker. They applied a gimmick test first ("would this world front any other song about vague
prompts?"), then craft carrying the ideas, second-by-second wow and feeling, the seams, truth, and
buildability.

| Concept | Viewer panel | Fact-checker | Educator-artist |
|---|---|---|---|
| **Who Lives Here?** (a cutaway tower block; each flat a life; gold where the build serves them) | 1st | 1st | 2nd |
| In Good Hands (one phone passed hand to hand; value is the glow on the hand) | 2nd | 3rd | 1st |
| Cast for Who? (a foundry; good is a fit to an imprint) | 3rd | 2nd | 3rd |

**Chosen: Who Lives Here?**, with grafts from the others. The storyboard is in
[01-storyboard.md](01-storyboard.md). Round-2 graveyard: *It's Behind You!* and *Can't Read Between
the Lines* failed the gimmick test with two of three judges (the premise fits any vague-prompt
song); *The Shape of Good* (mine) was "a bar chart with a crab"; *Round the Clock* had twelve labels
at phone size; *Made to Measure* and *The Best Seat* stayed abstract.

## Post text (draft v2, for the one-shot video)

> POV: you're Claude and the whole spec is "make it good" 🦀
> good for WHO?
>
> a one-shot music video about the idea every prompt forgets: quality is value to people who matter
>
> what's the vaguest prompt you've ever sent?
>
> (every frame drawn in code by Claude Opus · song: our lyrics, sung by a MiniMax take · not
> affiliated with or endorsed by any company or mascot shown)

The earlier draft said "every note, frame and syllable in this is code". That was true of the
all-code plan and isn't any more: the singing is a MiniMax generation.

## Liner notes

**What it is.** A 3:20 one-shot animated music video, 1080×1920 at 30 fps. Every frame is drawn in
code (Canvas 2D, a pure function of the song's time) by Claude Opus, from
[the storyboard](01-storyboard.md); the code is in `video/ep01/who/`. The song is our lyrics, sung
by a MiniMax generation Qing chose.

**How it was made.**
- **Teaching first.** Qing set the lesson ("quality is value to people who matter"), approved a
  section-by-section teaching plan, and ruled that the storyline serves the theme.
- **Concepts, judged blind.** Nine theme-first world concepts were judged by three fresh judges
  (craft carrying the ideas, second-by-second wow and feeling, truth). "Who Lives Here?" won, with
  grafts from the runners-up.
- **Built in parallel.** Six builders, one file each, on a shared plan: the world, the cast, and
  four sections joined at fixed camera handoffs so the shot never cuts.
- **Screened twice, then fixed.** Fresh viewers (an editor and motion designer, a target-viewer
  panel, a quality teacher) walked contact sheets second by second looking for swipe points,
  unreadable text, pictures that only repeat the lyric, and anything subtly wrong.

**How it was checked.**
- **Timing:** word onsets from Whisper on the take, with four hook lines corrected by hand where
  Whisper stretched them ([lyrics-fixes.json](../music/ep01/lyrics-fixes.json)).
- **Continuity:** every section starts and ends on the shared handoff; the loop's last frame
  matches frame 0 to within an ordinary frame step.
- **Rendering:** parallel segments, each verified by frame count before joining.
- **Truth:** the final brief matches the fact-checked wording word for word; the credit is a plain
  card, on screen 128.8–134.7 s only; the official marks appear exactly as provided.

**Where it falls short.**
- **No human has watched it at speed yet.** The screenings were models looking at frames; timing,
  humour and feeling need Qing's eye (the model can't hear the song at all).
- **Some text is still small on a phone:** the directory board's names and the ticket's
  handwriting in the chorus close-ups are readable when paused, less so at full speed.
- **Two mascots are drawn by us:** Jolly in his flat and the Hermes bot are our own cartoons; the
  Molty art, Jolly's portrait and the name-plate marks are official. See [SOURCES.md](../SOURCES.md).
- **It's long for X:** 3:20. Standard X accounts have capped uploads at 2:20 (longer needs
  Premium; check the current limit). A shorter cut is an open question for Qing.
- **Frame 0's top-left** shows the lobby directory's names faintly behind the @yanqingcheng mark.
