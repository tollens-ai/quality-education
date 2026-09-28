# Style: cut paper and marker, a pop-punk zine

Episode 2's style: a zine come to life. Flat paper colour, pieces cut by hand that stand off the
page on a hard shadow, and a felt-tip line that boils. The lyrics are marker capitals on strips
of paper slapped down a word at a time. It was chosen for a pop-punk take (Qing, 2026-09-28: "I
would actively prefer a different art style of your choice - to go with the new genre!").

**Retired.** Qing turned v1 down (2026-09-28): it looked and felt like episode 1, because it kept
episode 1's alphabet, cast and props under a new surface. See VIDEO.md, "Every episode draws its
own". This file is a record of the attempt, not a look to reuse.

The worked example is the episode-2 renderer, [video/ep02/garage/](../../../../video/ep02/garage/README.md).
Its liner notes are in [episodes/02-video.md](../../../../episodes/02-video.md).

## When it suits

- Guitar music with attitude: pop-punk, emo, indie, anything with a gig poster.
- A story told as a scrapbook: notes, lists, flyers, things pinned up and handed over.
- A song with lots of words, since strips and chips carry lyrics well.

It suits less well a song that wants atmosphere, soft light or depth. The look is flat on purpose.

## The look

- **Flat colour, no texture.** Every fill is one flat colour, with no paper grain and no gouache.
  Qing's note on episode 1 (2026-09-28): "the texture that ended up over everything, not
  everyone liked, so we should think hand drawn more for the line art style than as a uniform
  texture over the colouring".
- **The hand is in the line.** Felt-tip outlines of nearly even weight that wobble and boil on
  twos. A closed shape's outline overshoots where it began, so the two ends cross, as a quick
  marker drawing does (`INK.overshoot`).
- **Cut paper.** Props, signs, strips and panels are pieces of paper. Each casts a hard, offset
  shadow (`g.drop`), never a soft one. Tape and pins hold them up.
- **Shading.** At most one flat darker tone on the side away from the light. No gradients.
- **Palette.** Pop colours at full strength (hot pink, tangerine, sun yellow, teal, cobalt,
  lilac, mint) on a deep ink purple, plus Clawd's own orange. Each shot takes one ground colour.
- **Grounds.** A flat field, a sunburst of flat wedges, or a hand-drawn checkerboard. Doodles
  (stars, bolts, hearts, spirals) fill empty space in marker.
- **Light is flat too.** A cone of light is a pale flat wedge; a fairy light is a dot.

## Lettering

- **Marker capitals on paper.** A lyric row is a torn strip; its words' strips slap down at their
  onsets, so the paper grows with the voice. Tape holds an end.
- **Emphasis on paper takes the deep version of its colour** (`deep()` in `lyrics.js`). A pink
  word on a pink strip, or green on mint, blends away. The audit flags this as "edges blend".
- **Sticker lettering** (cream capitals, a thick ink outline, a hard coloured shadow) is for the
  big hooks on a coloured ground. Its outline must be at least .11 of the cap height to hold on a
  light ground, and even then keep it off yellow and sky.
- **Backing vocals go on paper chips,** ink on cream, so they read on any ground.
- **Ransom-note letters** (each on its own coloured chip) are for the title only. They're
  slower to read than a strip.
- The rules on size, order, timing and safe zones are in [VIDEO.md](../../../../VIDEO.md).

## People and props

- v1 reused episode 1's Clawd and `person()` with the texture off, which is part of why it
  looked like episode 1. Costumes went on Clawd through `dress` (over the body) and `dressTop`
  (hats, hair). A costume must know the back view (`b.back`): no face, fringe or tie on the back of a head.
- A subject must fill the middle band of the frame (y 800 to 1500). Episode 2's first cuts left
  small figures at the bottom under an empty field, and they read as unfinished.
- Floating hands read as mistakes: a thumbs-up needs an arm.

## Pitfalls in the code

- `g.drop` and `g.border` apply to every fill until restored, including shading and contact
  shadows. `tone()` and `contactShadow()` switch them off.
- A word's writing speed depends on the shot's end (`writeDur`). Anything drawn over the shots,
  such as the backing pop-ups, must set its own shot end, or a word written before a cut
  un-writes itself after it.
