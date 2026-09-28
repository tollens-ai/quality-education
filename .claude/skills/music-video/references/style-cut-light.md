# Style: Cut Light, ink and neon

Episode 2's style (v3, "Cut Light"): a manga page that moves, inked in black and paper white,
where the only colour inside is light. The band plays in a box of black mirror glass; every word
they sing is laser-cut out of the mirror, and the daylight outside comes in through the letters.
Qing's note that set the bar for it (2026-09-28): "just have all your conditions at every stage
be 'do I stand behind this artistically?' in character, set, design, colour, lineart,
creativity, dynamicism, story clarity... I can forgive most things if it's beautiful enough."

The worked example is the renderer, [video/ep02/cutlight/](../../../../video/ep02/cutlight/README.md).
The liner notes are in [episodes/02-video.md](../../../../episodes/02-video.md).

## When it suits

- A song whose words are the point, sung by someone who can't see out: the letters are
  literally the only windows.
- A lesson with a before and an after that can be lit. Here, the box of mirrors is building
  without an oracle, a bigger window is an oracle, and the box breaking is proof.
- Loud guitar music at a quick tempo: lasers, strobes and cuts on every note.

It suits less well a song that wants warmth all the way through: the inside is black, and the
day only arrives at the end.

## The look

- **Ink first, colour as light.** Every surface is inked from its light: paper white where the
  key hits, parallel hatching in the half-tones, cross-hatching deeper, solid black in shadow
  (`ink.js`: `hatch`, `tone`). Dark materials (NULL's cloak, the bass, the drum shells) go black
  with white scratch lines, the way scratchboard is drawn (`space.js`: `drawSolid`, by albedo).
  Colour inside the box is only ever light: Clawd's terracotta body, the four members' lights,
  and the daylight through the cuts.
- **The line boils on twos.** Hatching and grain are redrawn 12 times a second, so the page
  lives even when the camera holds.
- **Four colours, one per member,** so you can always tell who's who: CLAWD orange `#ff8a5c`,
  REGEX cyan `#2ee6ff`, CRON lime `#bdff3f`, NULL violet `#a57bff`, over ink `#0c0b0d` and paper
  `#f3efe6`. Each member's brief is tinted by his light every time it comes back.
- **Air has texture.** Stage beams are bundles of fine white lines, not soft cones; smoke is white
  billows with an inked edge; light from the cut words pours as rays and shafts; the floor is wet
  black glass whose reflections break into streaks (`air.js`).
- **Speed lines on the hits.** Focus lines close in on the crashes, as a manga panel does on an
  impact (`ink.js`: `focusLines`).
- **The day is the same pen on a page in daylight.** Outside, the square is inked in warm ink,
  every front outlined and its shade side hatched, the trees in scalloped clumps (`square.js`).
  The sun is low behind it: golden hour, so the fronts face us from their shade, rimmed in gold,
  and the sky blazes behind the pieces of mirror still in the air (`day.js`). The contrast is the
  story: nothing inside has a colour of its own but the band.

## The band

Four Clawds from the mascot's proportions (a six-by-four block, tall eyes set high and wide, stub
arms at five-eighths height, four legs), each posed as a solid in 3D so the camera can go
anywhere, then drawn over the pose by hand: a silhouette with softened corners, a hand-inked
outline that swells on the shadow side, hatching and grain in the shade, a rim of his own colour
(`soft.js`, `clawd.js`). A 3D render inked with hatching looks like a crate; drawing the
silhouette by hand is what makes him a character.

| Member | Mark | Plays |
|---|---|---|
| CLAWD, vocals | the plain mascot, the only one without a costume | the mic |
| REGEX, guitar | a visor with his colour scrolling across it | a white offset guitar |
| CRON, drums | headphones with lime rings | a kit with a lime ring on the kick, brass cymbals |
| NULL, bass | a black hooded cloak, two violet eyes in the hood | a black bass with long horns |

Guitars are smooth outlines (Catmull-Rom through a few points, `gear.js`: `curve`) with a second
outline behind for the body's thickness. Built from polygons they looked like potatoes.

## Staging: the mirror and the window

The world is a box of mirrors, so the staging uses them:

- **Face the mirror.** A member who faces the glass meets his own reflection, lit by the day
  through the cuts, while he is a dark shape with an edge of light in the foreground. Over the
  shoulder, the frame fills from the bottom up: his back, his reflection, the line cut above
  (`box.js`: `refl.hero`, drawn under the glass's gloss and frames so it reads as in the mirror).
- **An oracle is a window.** Cut a big window where the reflection was, and through it put what
  the oracle shows (`type.js`: `windowCut`). The same framing, before and after, tells the story.
- **One-way glass clears when the far side is brighter.** Late in the film the people come to
  the glass and it turns see-through below the words (`boxFrame`'s `see`), or only where a torch
  shines (`seeMask`).
- **The frame is narrow.** The camera's field of view is vertical, so a 9:16 frame at 45° is
  only about 25° wide. Over-the-shoulder shots need the camera well to one side of the member
  and near the glass, or the reflection hides behind him or slides out of frame.

## People

Backlit silhouettes, inside and out, on seven-and-a-half-head anatomy: tapered limbs, weight on
one leg, a pose that says one thing (`people.js`). A silhouette is all pose and proportion, so it
forgives no clumsiness in either, and it's why people drawn this way read as people and not clip
art. Lit flat from the front, the same figures looked like paper dolls; the outro puts the sun
low behind the square, so they're rimmed in gold against a blazing sky and their shade sides keep
their clothes' colours (`day.js`: golden hour). Poses carry the feeling: `cheer`, `wave`, `hold`.

## Lettering

Three voices, and each one is made of something different:

- **The band's words are cut out of the mirror.** Big Shoulders Stencil Display at its heaviest
  weight: a stencil face, so every letter is already a set of separate pieces with no counters to
  fall out, which is what a laser cutter needs. The glyph outlines are exported with fonttools
  (`tools/glyphs.py`) so each piece can be traced, cut and dropped (`type.js`: `cutWord`).
- **The machine's voice** (labels, test output, the brief tickets, the teaching card) is JetBrains
  Mono.
- **The people's hand** (Jess's note, "I love it!", "Dave's still coming, though.") is Rock
  Salt, written outside the glass, never cut into it.

How the cut words behave:

- **A laser runs round each piece as the word nears,** white-hot with the member's colour round
  it, and the cut finishes 85 ms before the voice (`kit.js`: `VLEAD`). Then the piece drops out
  and the day comes in.
- **Every line is a poster.** `posterLine()` sets the line in rows that fill a box on screen,
  words scaled by weight, so the lettering is the frame's composition, not a caption over it.
- **Through the letters you see the place the line is about:** the bakery's queue, the clinic's
  error page, the school gate, the wedding (`world.js`), drawn as planes at depth so they move
  like a real view through a window.
- **A daylight haze and a bright rim** on every hole, so a letter keeps its shape whatever is
  behind it.
- **Words mean with their cuts:** BROKEN cracks out from CLAWD's hand, THROUGH stays stuck in
  the glass, PERFECT is cut round a perfect circle, CHECKS and TESTS are ticks all over the wall
  round the words, RUN AND RUN circles a disc like a clock, NONE is struck through, DONE is
  stamped.
- **Echoes are etched, not cut:** the reflections' voice is a glowing line drawn on the glass,
  in the colour of whoever sings it, beside the reflection that sings it.

## Pitfalls met

- **3D solids inked with hatching look like CG crates.** Pose in 3D, draw the silhouette by hand.
- **Dark materials go white under a strong key.** Shade by albedo, and scratch dark ones white on
  black.
- **Daylight through a cut blows out to flat white** once glow and shafts are added on top. Give
  the view deep colours, keep the sun off the letters, and let big holes bloom less than words
  (`windowCut`'s `glowK`).
- **Busy views make letters unreadable.** A haze of daylight over the view and a bright rim round
  each hole fixed it.
- **A line cut in one shot vanishes at the next cut.** Carry already-cut words into the next shot
  open (`type.js`: `carry`), so each line holds until it's done.
- **Low rows stray into the phone's button strip.** `posterLine()` keeps rows below y 950 left of
  x 930.
- **Anything across the top of the frame fights the words.** A lighting truss did; it went.
- **A view that fills its whole layer paints over the views beside it.** Clip each window's view
  to its window when several share one outside.
- **See-through glass behind cut words drowns them:** the letters show the same view as the
  glass round them. Keep the glass dark where the words are.
- **Words at the top of the frame collide with the brief's label.** Start the rows below it.
- **WebGL through a software rasteriser is slower than Canvas 2D** for this much blur: about
  75 ms a heavy pass. Keep the blurs at a quarter size in 2D.
