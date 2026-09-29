# Style: Pencil Polka, coloured pencil and paper

Episode 3's style: a page of coloured-pencil doodles that dance to an oom-pah. Everything is drawn
as a talented child would draw it, in a sketchbook: wobbly outlines drawn twice, colour scribbled in
and spilling over the edges, hand-printed capitals, dogs and a mascot who are round and cartoony
because that is how a child draws a dog. The drawings are redrawn about twelve times a second (the
line boils) and pulse on the beat. Qing's brief (2026-09-29): "a dancing doodle style, almost like
pencil crayon or that kind of really hand-drawn messy sketch on paper [...] like a small child's
drawings come to life, but obviously a really talented small child"; "scraggly hand-drawn
frame-by-frame animation, classic 2D animation style"; the motion "almost a slight pulsing, like the
drawings are almost slightly pulsing or dancing to the umpa beat of the music".

The worked example is the renderer, [video/ep03/polka/](../../../../video/ep03/polka/README.md), and
the liner notes are in [episodes/03-video.md](../../../../episodes/03-video.md).

## When it suits

- A comic song with a strong pulse and a tune people sing along to: the doodles have something to
  dance to, and the words can be written on by the pencil as they are sung.
- A lesson with a running joke a child could draw (here, dogs), and many small concepts that each need
  a picture drawn in a second: the style is quick to draw and quick to read.
- Words that are the point, in quantity: hand-printed capitals write on fast and stay readable.

It suits less well a song that wants to look expensive or cool: it is warm and funny by nature.

## The look

- **A page, not a texture.** The paper is a cream ground laid down first (`paper.js`), never over the
  drawings. The hand is in the line and the colouring: every mark is a coloured-pencil stroke whose
  grain is in the stroke itself. Qing didn't like a texture over the whole frame in episode 1; this
  has none.
- **The pen (`pencil.js`).** A stroke is a ribbon, a polygon whose width swells and tapers like a
  pencil's pressure, filled with a tile of grain in the pencil's colour. `line()` draws a stroke
  twice, the second time fainter and a little to one side, and past its end. The wander is slow
  noise along the line plus a fine jitter, seeded by the shape and by the boil's version.
- **Colouring in (`hatch`, `blob`).** Zigzag hatching across the shape, clipped to a wandering copy
  of its outline, so the colour overshoots and falls short as a hand's does; a pale wash under it so
  the paper doesn't show through; a second darker hatch across the lower part for a shade; then the
  double outline. Backgrounds are broad crayon scribbles (`scrub`), not fills.
- **The boil.** Everything is redrawn on a 12-per-second clock, in a cycle of three versions that
  isn't a plain 1-2-3, so the drawing looks drawn and not noisy (`kit.js`: `variant`). The hatching
  re-randomises each time; the outlines wander differently. Camera moves, pops and pulses run at the
  full 30 frames a second on top.
- **The pulse.** The beat map, not a fixed tempo, drives it. Characters squash on the oom (the first
  beat of each bar), lean left and right, and lift on every beat (`common.js`: `groove`). Letters bob
  on the beats that fall inside them. In quiet music the pulse is small; in loud music it's big.
- **Joins.** A page turn up over the top edge, as a top-bound notebook's page goes (with its
  spiral rings showing, and the shadow it throws), on the big changes; a pencil scribble wiping the
  old picture away, top to bottom, between lines (`shots.js`).
- **Colour.** Waxy, slightly dusty pencils (`palette.js`) on cream, with a soft blue-black graphite
  for outlines. Each character has its own colours, so they're told apart at a glance: Clawd
  terracotta, Bruce warm brown with a blue collar. Paper and pencils change with the mood of the
  page (plain cream, graph paper for the code, ruled paper for the lesson, dark blue paper with
  light pencils at night).

## Drawing the characters

- **Clawd** is the mascot's own block: a wide body (3:2), two tall eyes set high and far apart, a
  stub of an arm on each side at about five-eighths height, four short legs, terracotta. He has no
  mouth until he sings; then a stroke opens to an O, driven by the vocal's loudness. His eyes carry
  every expression (tall, happy arcs, wide, squinting, crossed).
- **Dogs** are drawn as a child draws them: a long bean for a body, a big round head with a snout
  and a floppy or pointed ear, stick legs with round paws, a dot for an eye with a glint. The
  breeds are told apart by one shape each (`chars.js` for the side-on dachshund, `people.js` for
  front-on heads: bulldog, lab, poodle, corgi, sheepdog, beagle, pug, chihuahua, dalmatian,
  husky, greyhound). A pose is a few numbers, so one drawing can walk, wag, bob and sing.
- **People** are round heads, sausage limbs, mitten hands and a face from four marks (`people.js`).

## Lettering

Hand-printed capitals, one stroke each, in writing order (`hand.js`), so every word is written on
by the pencil as it is sung and finishes 85 ms before the voice, the lead Qing chose for episode 2.

- **Regular words** are graphite capitals, each letter tilted, lifted and sized a little differently
  and fixed for that letter, so it looks printed.
- **The tail of each patter line** (the "-ility") is set big on a row of its own, in bubble
  letters: outlined and coloured in, a flat-width stroke with no serifs. Bubble letters drawn with
  a tapered stroke looked like nails.
- **The lyric plays the rhythm** (`lyrics.js`): a word bobs on every beat inside it, and a long
  word ripples one letter group per beat, so the last three stressed syllables of "-ility"
  words each get their pop.
- **Other voices** get their own hand: the machine's labels in a plainer print, speech bubbles
  and signs written by their owners.

## Pitfalls met

- **Lettering drawn in scaled space wanders too little.** Letters are defined in a 100-unit box
  and scaled down, so the pen's wander and the grain scale with them; set both in master pixels.
- **A pattern scales with the transform it is filled under,** so a big letter has coarse grain
  and a small one fine. `pencil.js` cancels the local scale so the tooth is the same everywhere.
- **Offscreen canvases for joins need the base scale too,** or the outgoing page comes out at twice
  the size.
- **Bubble letters need a flat stroke and no serifs,** or they look like nails.
- **A striped awning with a rounded hem looks like a row of teeth** until it has a rail and poles.
- **Props in front of a face.** A clipboard held by a character hid one of Clawd's eyes; put held
  things beside the head.
- **An empty foot of page** reads as unfinished: run the ground to the bottom of the frame and keep
  the important drawing above the phone's button strip.
- **Scale things up:** the first cut's phone, phones held up and characters were too small for a
  phone screen; the objects a line is about should be as big as they can be.

## Tools

`video/ep03/polka/` holds the renderer; the shared harness is `video/lib/`. `look.js` is look
development (`--query v=sheet` for a character sheet, `v=type` for bubble-letter variants).
