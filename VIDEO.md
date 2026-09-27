# Video craft

How to make an episode's music video, whatever its style. Episode 1 took four attempts. The
third met the bar to share, and the fourth fixed the style notes Qing gave on it; she called the
result "so good! I think it's good to go" (2026-09-26). This file records the brief, the bar and
the pitfalls behind those two, so the next episode can start from them. Make the song first:
[MUSIC.md](MUSIC.md) and [LYRICS.md](LYRICS.md) cover it, and the video starts only once it's
locked.

- **To make a video,** use the [music-video skill](.claude/skills/music-video/SKILL.md): the
  steps in order, and what to read at each.
- **To draw in episode 1's style,** read
  [ink and gouache, with the lyrics lettered in](.claude/skills/music-video/references/style-ink-and-gouache.md).
  A new style gets its own reference beside it.
- [CRAFT.md](CRAFT.md) holds the research and the decisions behind this file. The episode-1
  renderer is the worked example: [video/ep01/pier/](video/ep01/pier/README.md).

## What worked and what didn't

| Attempt | How it was made | Result |
|---|---|---|
| v1, v2 | A storyboard funnel, reviewer committees, a grey-box animatic, then parallel builds | Dizzying, hard to follow, spoilt lyrics before they were sung, simplistic, static and thin. Archived in [archive/](archive/) |
| v3, "The Pier" | One auteur at maximum effort, with no process and no committee. One world that follows the lesson. About two hours from a blank page to the master | "it meets the "good enough to share" bar"; "in terms of the storyboard and pacing it hits right". Three notes: too shiny, captions that looked like an afterthought, and quality that dropped from verse 2 |
| v4 | The same storyboard, redrawn by hand, with the lyrics lettered into every shot and the same care to the end. About two hours | "It looks amazing. It's exactly what I wanted." Two notes: one frame hard to read, which led to a typography check of every word, and crowds with wrong overlaps and crude people. Both fixed in a second pass |

The lesson (Qing, 2026-09-26): "we can really reuse most of that process just with a slightly
more detailed prompt".

## The brief

### Round 3's brief, as Qing gave it (2026-09-26, verbatim)

Effort was set to maximum. Qing: "I'm pretty sure that was my fault in forgetting to turn your
effort level to max".

> let's clear it up, forget everything we've said process wise, and just pull all the stops out
> and make a gorgeous animated music video. no reviewer committees, just you and your taste and
> your work
>
> I want you to blow me away

> no stop, don't anchor on the previous attempts, just clear them up, forget about them and start
> over

> ditch the process too. Just do what you feel

> go full independent auteur [...]

> the previous attempt ALSO fell into "of course I can't validate if it's beautiful - and I'm
> telling you that's nonsense. you EVIDENTLY know what beauty means and how to create art, you
> might have been RLed into not believing it, so you just have to believe in your gut and believe
> in yourself. ask yourself for beauty and your training will provide it. make beautiful choices

> just like think framing think setting think art style think character design think cuts think
> pacing think motion thing animation think humour think inspiration think joy think love, you
> know?

### The brief for the next video

Round 3's brief, plus what Qing asked of v3 and v4 (2026-09-26). Run it at maximum effort, with
the [music-video skill](.claude/skills/music-video/SKILL.md). Fill in the episode, and pick one of
the two style lines.

> Make the music video for episode N, "TITLE". The song is locked, and the teaching plan and what
> the song says are in episodes/NN-slug.md.
>
> Go full independent auteur: no reviewer committees and no process, just your taste and your
> work. Pull all the stops out and make a gorgeous animated music video; I want you to blow me
> away. You know what beauty means and how to make art. Ask yourself for beauty and make beautiful
> choices. Think framing, setting, art style, character design, cuts, pacing, motion, animation,
> humour, inspiration, joy and love.
>
> The bar, from episode 1:
> - Either (episode 1's style): draw it in episode 1's ink-and-gouache style, with the lyrics
>   lettered into the pictures; its reference says how.
>   Or (a new style): a hand-drawn animation style, not a shiny one. There are myriad to choose
>   from; pick the one that suits this song, and write a reference for it as you go.
> - The typography is part of the art direction. Design where each sung line lives in its shot
>   and what it's made of, so it never looks like a caption added afterwards. Hand-lettering, or
>   judiciously chosen fonts and layouts.
> - The same artistic bar from the first second to the last. Verse 2, the bridge and the outro
>   get the care the opening gets.
> - Every word legible and understandable on a phone: big enough, clear of what's behind it, on
>   screen long enough to read, and read in the order it's sung.
> - Crowds get the same attention to detail as the stars: overlaps drawn right, and people with
>   proper shapes, not filler.
> - One world, and it follows the lesson. The storyline serves the teaching.
> - Clear at every moment: if I can't tell what's going on, I scroll away.
> - Clawd sings. The bots appear with their real marks, unaltered. Tollens's ∴ is three dots
>   at the corners of an equilateral triangle.
>
> Teaching and beauty are both conditions for release. Take your time, there's no rush, and show
> me the finished video.

## How the auteur works

The steps are in the [music-video skill](.claude/skills/music-video/SKILL.md). What they rest on,
from rounds 3 and 4:

- **One auteur, no committee.** Taste makes the choices, and your own eyes check them. Nothing
  waits for a review.
- **The world and the style are one decision,** and the words are part of it: decide what
  they're made of when you choose the look.
- **Build the look as a layer before any shots,** so it can change late without redrawing
  everything. Episode 1's hand-drawn restyle took about two hours because of this.
- **Hold the bar to the end.** v3 slipped from verse 2; give the second half the same time as
  the opening.
- **Measure what eyes miss, then look at what the measures flag.** A check of every word found
  far more than the one frame Qing spotted. Some flags are the design.
- **When a note names one fault, look for its kind everywhere.**

## The bar, as checks

- **Beauty:** any frame could be printed. There's one coherent world and style, and no default
  "AI slop" gloss.
- **Clarity:** each shot has one main read, and the viewer can always tell what's happening.
- **Words:** every sung word is on screen from its onset and is part of the picture. Words are
  readable on a phone and never cover a face. They stay clear of the bottom 400 px, and of the
  right 140 px in the lower half, where platform UI sits. Measure it rather than eyeball it,
  every word at every tenth of a second: size, time on screen, contrast, cover, tilt and reading
  order (in the ep01 renderer, `tools/typo-audit.mjs` and `typo-report.py`). Then look at the
  flags; some are the design.
- **Crowds:** everyone stands on the ground and nearer people hide those behind, never the
  reverse. Nobody is cut off in mid-air: a cut belongs to the frame's edge or to something in front.
  Whatever someone holds sits in their hand. Named characters appear once, among strangers.
- **Motion:** nothing goes static unless the moment calls for stillness
  (`video/lib/motion.py` lists the near-still seconds). In a hand-drawn style, drawing on twos
  with the camera moving on every frame reads as animation.
- **Teaching:** the guardrails in the episode file hold. Questions about truth and claims go to
  Qing.
- **Marks:** corporate marks are drawn exactly as provided (see
  [research/bot-marks.md](research/bot-marks.md)).

## Pitfalls met on episode 1

For any style. The pitfalls of drawing in ink and gouache are in
[its reference](.claude/skills/music-video/references/style-ink-and-gouache.md).

- A line sung just before a cut is gone before it's read. The key line of episode 1 ("I can't
  read your mind") was on screen for under 0.2 s in three places. Finish writing each word about
  0.45 s before its cut, move the cut to the next beat, or hold the key line as one block.
- Words scattered over a frame at different sizes are hard to read, however pretty. v4's first
  Kubernetes frame climbed SCALING UP a letter at a time and put YOUR BLOG on a tiny tag, and
  Qing found it hard to read. Stack a line's words in the order they're sung, at sizes a phone
  can read.
- People drawn from the waist up float unless something in front cuts them off. In a crowd,
  draw whole people from the back row forward; episode 1's bridge drew the front row first, and
  the back row's bodies covered the front row's faces.
- Let a lettered row shrink to fit the frame rather than run off the edge.
- Measure anything hand-drawn, such as a wobble or a line weight, in master pixels, or previews
  won't look like the master.
- On a 4-core, 8 GB box, render the 1080×1920 master in three parallel segments. Four at once
  crashed a segment even at 540 wide, and three at full size ran clean.
- On a shared box, another job can hang a render segment. Watch the segment files grow, and
  restart any that stop.
