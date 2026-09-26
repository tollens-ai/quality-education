# Video craft

How to make an episode's music video. Episode 1 took four attempts. The third met the bar to
share, and the fourth fixed the style notes Qing gave on it. This file records the brief and the
way of working behind those two, so the next episode can start from them. Make the song first:
[MUSIC.md](MUSIC.md) and [LYRICS.md](LYRICS.md) cover it, and the video starts only once it's
locked. [CRAFT.md](CRAFT.md) holds the research and the decisions behind this file. The episode-1
renderer is the worked example: [video/ep01/pier/](video/ep01/pier/README.md).

## What worked and what didn't

| Attempt | How it was made | Result |
|---|---|---|
| v1, v2 | A storyboard funnel, reviewer committees, a grey-box animatic, then parallel builds | Dizzying, hard to follow, spoilt lyrics before they were sung, simplistic, static and thin. Archived in [archive/](archive/) |
| v3, "The Pier" | One auteur at maximum effort, with no process and no committee. One world that follows the lesson. About two hours from a blank page to the master | "it meets the "good enough to share" bar"; "in terms of the storyboard and pacing it hits right". Three notes: too shiny, captions that looked like an afterthought, and quality that dropped from verse 2 |
| v4 | The same storyboard, redrawn by hand, with the lyrics lettered into every shot and the same care to the end. About two hours | Waiting for Qing |

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

Round 3's brief, plus what Qing asked of v3 (2026-09-26). Run it at maximum effort. Fill in the
episode.

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
> - A hand-drawn animation style, not a shiny one. There are myriad to choose from; pick the one
>   that suits this song.
> - The typography is part of the art direction. Design where each sung line lives in its shot
>   and what it's made of, so it never looks like a caption added afterwards. Hand-lettering, or
>   judiciously chosen fonts and layouts.
> - The same artistic bar from the first second to the last. Verse 2, the bridge and the outro
>   get the care the opening gets.
> - One world, and it follows the lesson. The storyline serves the teaching.
> - Clear at every moment: if I can't tell what's going on, I scroll away.
> - Clawd sings. The bots appear with their real marks, unaltered.
>
> Teaching and beauty are both conditions for release. Take your time, there's no rush, and show
> me the finished video.

## How the auteur works

This is what rounds 3 and 4 did, in order. It's a habit, not a gate: nothing here waits for a
review.

1. **Orient in under 20 minutes.** Read the episode file, especially the teaching plan, what the
   song says in prose, and the guardrails for the pictures. Read the lyric timings. Don't watch
   or read earlier attempts unless the job is to revise one.
2. **Measure the record.** Analyse the take for the bar grid, the kick and the vocal loudness
   (`tools/analyse.py` in the ep01 renderer). Everything then moves to the song: characters
   groove on the beat, the camera breathes with the kick, the singer's mouth follows the vocal.
3. **Choose one world that follows the lesson.** Episode 1's is a seaside pier: dark while Clawd
   works without context, lit when the chorus asks who it's for, daylight once you answer. At
   the same time, choose the art style and how the words will be made. They're one decision.
4. **Build the look before any shots.** Make the drawing kit and the hand-drawn layer (episode
   1's `ink.js` wraps the canvas so every path comes out drawn by hand), then the lettering.
   Then the cast on a character sheet, the hero environment, and one hero frame. Judge that frame
   for beauty before going on. A look built as a layer can be changed later without redrawing
   every shot.
5. **Build the shots in song order.** For each sung line, decide:
   - the one thing the viewer must read
   - where the words live in the picture, and what they're made of: a sign, bulbs, chalk,
     stitches, stars, sand
   - how they're written on as they're sung

   No word appears before it's sung, except an opening line that doubles as the thumbnail.
6. **Watch the whole film early and often.** At 540 wide a full preview renders in minutes.
   Watch it three ways:
   - a contact sheet at one frame a second
   - frame-to-frame motion measured per second, to find stretches that have gone static
   - frame strips at 30 fps across the big moves and every cut
7. **Make a craft pass at full resolution.** Look at every shot in song order, a few at a time,
   and fix whatever isn't beautiful or clear. Give verse 2 onwards the same time as the opening,
   because that's where v3 slipped. Then check the lyric-heavy frames at phone size, 390 px wide.
8. **Master, document and land.** While the master renders, write the liner notes: how it was
   made, how it was checked, where it falls short. Verify the master itself (duration, frame
   count, stills pulled from the file), make the upload copy and a thumbnail, then commit and
   push.

## The bar, as checks

- **Beauty:** any frame could be printed. There's one coherent world and style, and no default
  "AI slop" gloss.
- **Clarity:** each shot has one main read, and the viewer can always tell what's happening.
- **Words:** every sung word is on screen from its onset and is part of the picture. Words are
  readable on a phone and never cover a face. They stay clear of the bottom 400 px, and of the
  right 140 px in the lower half, where platform UI sits.
- **Motion:** nothing goes static unless the moment calls for stillness. Drawing on twos with
  the camera moving on every frame reads as animation.
- **Teaching:** the guardrails in the episode file hold. Questions about truth and claims go to
  Qing.
- **Marks:** corporate marks are drawn exactly as provided (see
  [research/bot-marks.md](research/bot-marks.md)).

## Pitfalls met on episode 1

- Colour emoji on a canvas take their opacity from `fillStyle`. In a hand-drawn film, draw your
  own (v4 paints its flame).
- A canvas font of size 0 is invalid, so the previous font stays in place: text scaled to zero
  size draws at full size. Skip drawing anything that has scaled to nothing.
- An ease that should return 0 can return about 1e-16, and a `> 0` check then draws the thing
  early. Blank cards appeared a beat before their letters until the ease returned exactly 0.
- Measure any hand-drawn wobble in master pixels, or previews won't look like the master.
- Let a lettered row shrink to fit the frame rather than run off the edge.
- Between capitals, word spaces need about 0.4 of the cap height, or "DID I" reads as "DIDI".
- On a 4-core, 8 GB box, render the 1080×1920 master in three parallel segments. Four at once
  crashed a segment even at 540 wide, and three at full size ran clean.
