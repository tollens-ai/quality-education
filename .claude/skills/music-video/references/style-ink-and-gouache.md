# Style: ink and gouache, with the lyrics lettered in

Episode 1's style, from v4 on: a picture book brought to life. Flat gouache paint, a brush-pen
line that boils, paper over every frame, and the lyrics written on by hand as they're sung. Qing
on the result (2026-09-26): "It looks amazing. It's exactly what I wanted", and after the second
pass, "it's so good! I think it's good to go".

The worked example is the episode-1 renderer, [video/ep01/pier/](../../../../video/ep01/pier/README.md).
Its liner notes, [episodes/01-video.md](../../../../episodes/01-video.md), describe the look and
the lettering shot by shot.

## When it suits

- A song with warmth and humour, and a world that can be a storybook: a pier, a street, a kitchen.
- A story that moves between light and dark. Washes of lamplight suit night, and flat colour
  suits day.
- Words that should feel made by hand for this film, not typeset.

It suits less well a song that needs photographic depth, or the slick feel of a product ad.

## The look

- **Paint.** Every shape is flat colour laid on with a brush. The brush texture shows inside
  each fill, and the paint is a little denser at the edges, the way gouache dries.
- **Shading.** One darker tone on the side away from the light, cut like a cel, and at most one
  painted highlight. No gloss, no gradient sheen.
- **Line.** Characters and built things have a brush-pen outline that swells and tapers.
  Scenery and light have none.
- **Boil.** Drawings change on twos (15 a second), cycling through three versions, like a pencil
  line test. The camera still moves on every frame, like a rostrum camera over cels.
- **Light.** Lamplight, bulbs, beams and moonlight are thin washes of colour, screened over the
  paint. There's no bloom, and nothing blows out to white.
- **Paper.** One sheet of paper texture over every frame, moving with the camera.
- **What stays exact.** Camera moves, app screens and code (typeset, because that's the machine
  talking), and corporate marks, which sit on the drawings like printed stickers.

## How it's built

Everything is Canvas 2D in headless Chromium, and every frame is a pure function of the song's
time. The episode-1 renderer splits into the style, which you keep, and the episode, which you
replace:

| Keep (the style) | What it gives you |
|---|---|
| `ink.js` | `inkify(ctx)`: every path comes out hand-made. Fills wander and take a gouache texture, and outlines are brush strokes that boil. Set `g.ink` to outline, and `g.plain` to draw exactly |
| `post.js` | The paper, and a soft vignette |
| `kit.js` | Maths, easing, seeded noise, colour, shapes, painted light (`glow`, `bulb`), confetti, fireworks, and the song clock |
| `hand.js` | The brush alphabet: capitals, digits and punctuation as strokes in writing order. `letter`, `letterArc`, skeletons for bulbs, stitches and stars, and the hooks the typography audit reads |
| `lyrics.js` | `sing` lays out a line in rows and writes each word on at its onset; `keyLine` holds episode 1's line to remember as one block; `writeDur` finishes each word before the cut; `backing` letters backing vocals |
| `cast.js` | Clawd, the bots, and `person()`: a chunky picture-book person, waist up or whole, in eleven hairstyles |
| `folk.js` | Crowds: `folk(i)` for varied strangers, `behind()` and `facing()` for people seen from the back and the front, `limb()` for arms and legs |
| `world.js`, `props.js`, `band.js` | Sky, sea, bulb strings and fairground; phones, laptops and hands; the band. Keep what fits the new world |
| `tools/` | `analyse.py` measures the record; `typo-audit.mjs` and `typo-report.py` check the words |

Replace (the episode): `main.js`'s shot list and `scenes/`. To start episode N:

1. Copy the renderer to `video/epNN/<world>/`.
2. Measure the new take into `audio.json` with `tools/analyse.py` (it needs Demucs's instrumental
   stem), and point `init` in `main.js` at it.
3. Change the episode settings at the top of `tools/typo-audit.mjs` and `tools/typo-report.py`.
4. Rewrite `keyLine` in `lyrics.js` for the new line to remember, and set the lettering colours
   in its `STYLE`.
5. Change the cast and the world, then build the shots in song order.

## Lettering

- **Every sung word is lettered,** written on stroke by stroke from its sung onset. No word
  appears before it's sung. The one exception is an opening line that doubles as the thumbnail.
- **Every line lives somewhere in its picture,** made of something that belongs there: a sign,
  bulbs, chalk, stitches, stars, cards, placards, sand. Decide the one thing to read first.
- **Size.** Cap height at least 50 master pixels, which is about 18 px on a phone 390 points
  wide. Hero words go much bigger.
- **Contrast.** The painted style carries a dark shade and a thin ink outline. On a busy ground,
  put the words on a board, a ribbon or a dark band.
- **Order.** Stack a line's words in the order they're sung, at sizes a phone can read. Scattered
  words at mixed sizes were the one frame Qing found hard to read.
- **Time.** Finish writing each word about 0.45 s before its shot's cut (`writeDur`). If a line
  ends on the cut, move the cut to the next beat. Hold the line to remember as one block
  (`keyLine`).
- **Safe zones.** Keep words out of the bottom 400 px, and out of the right 140 px between about
  y 950 and 1800, where phone apps put their buttons. `sing` caps a row at `maxW` (940 by
  default), so a wide row keeps its width whatever its size: narrow `maxW` to pull it in.
- **Spacing.** Between capitals, a word space needs about 0.42 of the size, or "DID I" reads as
  "DIDI".
- **Capitals only.** The alphabet has no lower case, so the corner mark reads TOLLENS.

## People and crowds

- **Proportions.** `person()` has a picture-book head, about a third of their height, and arms
  too short to reach above it. Anything held up high goes on a stick. Draw it with `gripL` or
  `gripR`, which put it in the hand, under the fingers.
- **Nobody floats.** Someone drawn from the waist up needs something in front of them: the
  frame's edge (`below` carries the body down past it), a counter, a wall, the edge of a stage.
  Otherwise draw them whole (`full: true`), feet on the ground, with a shadow.
- **Crowds are drawn from the back.** Give everyone a place on the ground at their own distance,
  sort far to near, and draw in that order, so whoever is nearer hides whoever is behind. Don't
  draw rows in any other order: episode 1's bridge once drew the front row first, and the back
  row's bodies covered the front row's faces.
- **Named people stand out.** Dim the crowd behind the characters we know, and put each named
  character in a crowd once, among strangers from `folk(i)`, not repeated as clones.
- **Seen from behind,** hair covers the whole back of the head, and only the neck shows. A patch
  of skin there reads as a face with no features. A phone held up to film shows its screen to us,
  so put the stage on it.
- **Seen from the front,** long hair hangs behind the body, or it reads as a beard. A phone held
  up shows its back and its torch.
- **Arms and legs are filled shapes** (`limb()`), not strokes: `inkify` turns every stroke into a
  tapering brush line.

## Marks

- Corporate marks are drawn exactly as provided, with `g.plain = true`, and worn as badges. See
  [research/bot-marks.md](../../../../research/bot-marks.md).
- **Tollens's mark, ∴, is three dots at the corners of an equilateral triangle** (Qing,
  2026-09-26). The glyph in `hand.js` is built that way.
- The corner marks, @yanqingcheng and ∴ TOLLENS, are lettered small in the film's hand, in the
  top corners.

## Checks for this style

- **Frame strips at 30 fps** across big moves: drawings change on twos, and the camera moves on
  every frame.
- **The same wobble at every size.** The wobble is measured in master pixels (`INK.res`), so a
  540-wide preview looks like the 1080 master.
- **The typography audit reads `hand.js`'s hooks.** Tag what isn't a lyric, so it isn't judged
  as one: `AUDIT.ctx = { deco: true }` for decoration, `{ mark: true }` for the corner marks, and
  `{ line, word }` for lettering that isn't laid out by `sing`.

## Pitfalls in the code

- Colour emoji on a canvas take their opacity from `fillStyle`. In a hand-drawn film, paint your
  own (v4's flame).
- A canvas font of size 0 is invalid, so the previous font stays in place: text scaled to nothing
  draws at full size. Skip drawing anything that has scaled to nothing.
- An ease that should return 0 can return about 1e-16, and a `> 0` check then draws the thing
  early. Blank cards appeared a beat before their letters until the ease returned exactly 0.
- A prop in a grip sways with its holder, who dances to the beat. A tall placard's top swings
  furthest, so leave room between neighbouring placards.
