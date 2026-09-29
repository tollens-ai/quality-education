# Style: Pencil Polka, coloured pencil and paper

Episode 3's style: doodles in coloured pencil on cream paper that dance to an oom-pah, drawn by an
expert doodler: obviously a doodle on paper, never clumsy for its own sake. Outlines are strokes
that overshoot a corner or stop short of it, colour is scribbled in and spills over the edges,
capitals are hand-printed, dogs and a mascot are round and cartoony. The outlines are redrawn
fifteen times a second and the whole cast bounces on the beat. Qing's brief (2026-09-29): "a
dancing doodle style, almost like pencil crayon or that kind of really hand-drawn messy sketch on
paper [...] like a small child's drawings come to life, but obviously a really talented small
child"; "scraggly hand-drawn frame-by-frame animation, classic 2D animation style"; the motion
"almost a slight pulsing, like the drawings are almost slightly pulsing or dancing to the umpa beat
of the music". Her notes on the look, in the order she made them, are in the episode's video file.

The worked example is the renderer, [video/ep03/polka/](../../../../video/ep03/polka/README.md), and
the liner notes are in [episodes/03-video.md](../../../../episodes/03-video.md).

## When it suits

- A comic song with a strong pulse and a tune people sing along to: the doodles have something to
  dance to, and the words can be written on as they are sung.
- A lesson with a running joke a doodler can draw (here, dogs), and many small concepts that each
  need a picture drawn in a second: the style is quick to draw and quick to read.
- Words that are the point, in quantity: hand-printed capitals write on fast and stay readable.

It suits less well a song that wants to look expensive or cool: it is warm and funny by nature.

## What the film is about, and what it isn't

The world is the dogs, the app and the show. The pencil, the paper and the sketchbook are how it is
drawn and never what a picture is about: no page turns, no pencil wipes, no graph or ruled paper as
a place, no gag about the pencil (Qing, 2026-09-29: "you don't need to make the art style a part of
the content. That sounds too confusing."). Places are physical: a park, a show ring, a shed, a
training class on the meadow, a night, a golden hour.

## The look

- **A drawing on paper, not a texture on a screen.** The paper is a cream ground laid down first
  (`paper.js`), never over the drawings. The hand is in the line and the colouring: every mark is a
  coloured-pencil stroke whose grain is in the stroke itself.
- **Draw every shape as a hand does, as a process.** This is the lesson of the first two rounds.
  Clean boxes and ovals with a pencil texture on them read as "a child's drawing made in Paint"
  (Qing's words); noise added to a smooth path doesn't fix it. What does (her suggestion: "hand-draw
  as a actual pencil-to-paper scribble in JavaScript"): a shape with corners is drawn as a few strokes,
  each starting somewhere on a corner's curve and running past the next corner or stopping short of
  it; a shape without corners is one loop that doesn't quite close and drifts where it overlaps;
  colour is one scribble, back and forth, that overruns the edge in places and stops short in
  others, with no clip line, gone over again more lightly at another angle. (`pencil.js`: `outline`,
  `hatch`, `line`, `blob`.)
- **Opaque.** A drawn shape covers what was drawn beneath it (`blob` first paints the page's own
  colour under it, `paper.js: pageTone`), as a real drawing does. Without it, legs show through the
  body and the picture reads as transparent shapes.
- **The dial.** How clumsy the hand is is one number, `HAND.clumsy` in `kit.js` (1 was the first cut;
  Qing found it adorable but "slightly too clumsy" and asked for an expert doodler, so it is .5).
  Lumps and slants of shapes, corner overshoots, the wander of a line, the spill of the colour all
  scale with it. Move it, don't add exceptions.
- **The pen.** A stroke is a ribbon, a polygon whose width swells and tapers like a pencil's
  pressure, filled with a tile of grain in the pencil's colour. The grain is fixed to the stroke, so
  it doesn't sparkle.
- **Motion of the line.** Outlines are redrawn fifteen times a second (drawing on twos, `kit.js`:
  `twos`), each time a little differently, in a cycle of three versions that isn't a plain 1-2-3, so
  it looks drawn and not noisy. **Colour does not flash:** the scribble is decided once per shape
  and moves by a pixel or two between drawings; the big crayon sky and meadow are still. (Qing, on
  the second round: "the colouring strokes are flashing a bit too much and it's kind of
  distracting". Measured, the meadow's change from one drawing to the next fell to a quarter and the sky's
  to nothing.) A shot is drawn on that same clock, so its camera pushes, bounces and pops also move
  fifteen times a second, as in a film drawn on twos; only the joins between shots run at the full 30
  frames a second.
- **The pulse.** The beat map, not a fixed tempo, drives it. The cast bounces off each beat and lands
  on the next, squashing as it lands and stretching in the air, a little higher on the oom, and
  leans left and right (`common.js`: `groove`, `life.js`: `bounce`). Letters bob on the beats that
  fall inside them. In quiet music the pulse is small; in loud music it's big.
- **Life that nobody directs.** Every character blinks now and then, lets its eyes wander and
  breathes (`life.js`: `idle`); ears, tails, arms and the tag on a collar keep swinging after the body
  has stopped, on damped springs set going by the beats (`ring`). The world moves too (`world.js`): a
  sun with a face that pulses on the oom and reacts, clouds that drift, flowers that lean, a pigeon
  that bobs and watches. Nothing on screen is quite still.
- **Joins** are plain and run at 30 frames a second: a push off the side (`push`), an iris opening on
  the picture's subject (`iris`), or a cut (`shots.js`).
- **Colour.** Waxy, slightly dusty pencils (`palette.js`) on cream, with a soft blue-black graphite
  for outlines. Each character has its own colours, so they're told apart at a glance: Clawd
  terracotta, Bruce warm brown with a blue collar. Night is dark blue with cream pencil.

## Drawing the characters

- **Clawd** is the mascot's own block, tidied: a wide loaf (3:2), two tall dark eyes with a glint,
  set high and far apart, a stub of an arm on each side, four short legs with little feet,
  terracotta. His body is his face: eyes carry the expression (open, happy arcs, wide, squint, sad
  with brows, half-lidded, crossed) and the mouth is a small smile until he sings, then a D that
  opens with the vocal's loudness and shows a tongue when wide. He blinks and looks about by
  himself.
- **Bruce** is a dachshund seen from the side: a long loaf that sags in the middle, four short legs,
  a big round head with a long snout and a black nose, one long soft ear that swings, a big glossy
  eye, a collar with a bone-shaped tag, a tail that never stops. Other dogs borrow the drawing with
  their own colours.
- **Front-on dogs** (`people.js: dogFront`): head, ears by breed, a muzzle, a nose, big eyes; a body
  and paws when they sit on a counter. Breeds are told apart by one shape each.
- **People** are big round heads, sausage limbs, mitten hands and a face from four marks.
- **Every character is a handful of shapes in its own space (feet on y = 0)**, so a pose is a few
  numbers: bob, squash, lean, flip, eyes, mouth, arms.

## Lettering

Hand-printed capitals, one stroke each, in writing order (`hand.js`), so every word is written on as
it is sung and finishes 85 ms before the voice, the lead Qing chose for episode 2.

- **Regular words** are graphite capitals, each letter tilted, lifted and sized a little differently
  and fixed for that letter, so it looks printed.
- **The tail of each patter line** (the "-ility") is set big on a row of its own, in bubble
  letters: outlined and coloured in, a flat-width stroke with no serifs. Bubble letters drawn with
  a tapered stroke looked like nails.
- **The lyric plays the rhythm** (`lyrics.js`): a word bobs on every beat inside it, and a long
  word ripples one letter group per beat.
- **Other voices** get their own hand: the machine's labels in a plainer print, speech bubbles
  and signs written by their owners.

## Pitfalls met

- **Lettering drawn in scaled space wanders too little.** Letters are defined in a 100-unit box
  and scaled down, so the pen's wander and the grain scale with them; set both in master pixels.
- **A pattern scales with the transform it is filled under,** so a big letter has coarse grain
  and a small one fine. `pencil.js` cancels the local scale so the tooth is the same everywhere.
- **Offscreen canvases for joins need the base scale too,** or the outgoing picture comes out at
  twice the size.
- **Bubble letters need a flat stroke and no serifs,** or they look like nails.
- **A gradient between two different colours gives a pale ring.** A vignette on a dark page went from
  a pale colour to a dark one and showed a lighter halo mid-way; use one colour, fading its alpha.
- **Semi-transparent colour makes overlapping shapes see through each other.** Legs that run up into
  a body showed through it. Shapes are opaque; and legs hang from the body's edge, not through it.
- **Smooth scallops make spiky clouds.** A cloud is the top of overlapping circles on a flat base
  (`world.js: cloudShape`), not an alternating-radius star.
- **A ruled horizon line** through trees and a bird read as a ruler. The meadow's own ragged edge is
  the horizon.
- **An empty foot of page** reads as unfinished: run the ground to the bottom of the frame and keep
  the important drawing above the phone's button strip.
- **Scale things up:** the objects a line is about should be as big as they can be.
- **Props in front of a face.** Put held things beside the head, not over an eye.
- **A drawing clock that rounds down makes every picture late.** Flooring the film's time to a fifteenth
  of a second put a drawing up to 67 ms behind the sound, so the 85 ms lead the lettering had been given
  was eaten. Round to the nearest tick (`kit.js: twos`): a picture is then never more than 33 ms out.
- **Pictures land as early as the lettering.** A picture that answers a word is timed to land 85 ms before
  it, like the word's own lettering, so a stamp or a hit is that much early. The lead is one number for the
  lettering and for anything timed from a word's `v` (`VLEAD` in `kit.js`), but about twenty gags write
  `.085` out (`grep -rn '\.085' video/ep03/polka`), so a different lead is a small edit per gag. Qing approved
  the film at 85 ms without comment on the timing.

## Tools

`video/ep03/polka/` holds the renderer; the shared harness is `video/lib/`. `look.js` is look
development (`--query v=sheet` for a character sheet, `v=big` the two main characters at film size,
`v=shapes` the plain shapes as the pen draws them, `v=park` the backdrop and its cast, `v=dogs`,
`v=people`, `v=type`).
