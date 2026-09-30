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
- **The line boils on a 12-Hz clock.** Hatching and grain are redrawn 12 times a second, so the page
  lives even when the camera holds.
- **Four colours, one per member,** so you can always tell who's who: CLAWD orange `#ff8a5c`,
  REGEX cyan `#2ee6ff`, CRON lime `#bdff3f`, NULL violet `#a57bff`, over ink `#0c0b0d` and paper
  `#f3efe6`. Each member's brief is tinted by his light every time it comes back.
- **Air has texture.** Stage beams are bundles of fine white lines, not soft cones; smoke is white
  billows with an inked edge; light from the cut words pours as rays and shafts; the floor is wet
  black glass whose reflections break into streaks (`air.js`).
- **Speed lines on the hits.** Focus lines close in on the crashes, as a manga panel does on an
  impact (`ink.js`: `focusLines`).
- **The day is a painted world.** Outside, the town square is a hand-inked illustration at
  golden hour, the sun low behind its fronts, so they and the people face us from their shade,
  rimmed in gold, and the sky blazes behind the pieces of mirror still in the air (`day.js`).
  The contrast is the story: nothing inside has a colour of its own but the band.

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

## People, and the places outside

The people and places are generated art, cut out and animated as paper (`paper.js`), and the
story is composed from them in code (`story.js`). Drawing people in code never got past
construction you could see (capsule limbs, oval hands, curls that were rings of circles).

- **Give the image model the film.** The first generated cast came back as glossy semi-realism
  that didn't belong ("this screenshot screams ai slop"; "did you give chatgpt your art and ask
  what would be in keeping at least?", Qing, 2026-09-28). What worked: attach frames of the film
  and describe its concepts, ask the model what would be in keeping, then generate studies in the
  styles it proposes and choose. Qing chose "ink and neon": angular people about five heads tall,
  heavy brush-ink contours, solid black shadow masses with white scratchboard hatching, one muted
  local colour each and a thin neon rim, never realistic or semi-realistic ("it uncanny valleys
  the hell out of people"), clearly less cute than the band. Their eyes are human eyes, small and
  inked: the square eyes are the Clawds' own, because they're robots.
- **Character sheets, then poses.** Each named person in the poses the film needs, with their sheet
  attached as a reference so faces and clothes hold; crowds for the queue and the square ten at a
  time; props (Gran's wig, glasses, shawl and handbag, for the bot that plays her). Ask for a flat
  chroma-magenta background, whole figures well apart, and every screen, card and board blank.
  `tools/cutout.py` removes the magenta and its spill and splits the sheet into figures;
  `tools/blanks.py` finds each blank so the scenes can draw on it.
- **Places are whole pictures, drawn as simply as the people:** big flat shapes, a few decisive
  marks, blank signs and screens, room where people stand, fully opaque. `tools/backdrops.py`
  measures the screens, boards, signs, table edge and sun as fractions of the picture.
- **A scene library, not views.** `story.js` draws each brief in each state the song takes it
  through (built, broken, what perfect means, shown, carded, loved), placing people by fractions
  of their place so any shot can frame it (`fit`) or aim at what someone holds (`aim`). Code draws
  what only code can say: the terminal's X, the clock landing on eight, the booking site and its
  spinner, the leaked messages, the seating plan, the cards, the load test's readout.
- **What they hold is its own paper piece.** The generated cards and phones are postcard-sized, so
  the scenes draw a bigger one over the hands (`hold`), pushed up to the glass, and write on it in
  the person's hand as we watch (`textP`).
- **Animated as paper:** each figure is a card that sways on its feet, breathes, bobs on the beat
  and is swapped for another pose with a pop on the 12-Hz clock, while the camera moves on
  every frame. A thin paper edge and a soft shadow make each one read as card.
- **The square is a painted flat** standing across the far side, softened and hazed with the low
  sun so it sits back as distance. Its paving is drawn in the camera's own perspective and in the
  places' manner (`world.js`: `squareGround`): flat-toned flagstones, warm in the sun's path and
  violet in the fronts' shade, the joints inked and boiling on the 12-Hz clock. The people
  stand on it, with a dark patch under their feet and long shadows towards us; they're lit from behind, a gold edge
  round each.

## The story leads

Qing, on the first cut with the new art (2026-09-28): "a whole minute through and all I've seen
is the band", "way too much band, way too much repetitiveness, not enough illustrating the
content". The rules that answered it:

- **Every sung line shows what it says, animated:** a person, a place, a thing going wrong or
  right on the words. The band frames it: a reflection, a silhouette, a close-up for a feeling.
- **Lit panes** (`box.js`: `panes`): where the far side of the one-way glass is lit, it's a window,
  lit pane by pane like tubes starting. In verse 1 the camera stands where the member stands
  (`reflOnly`: he's seen only in the mirror), his reflection plays for a beat, then the glass
  lights where it was and the disaster plays out in it, the view moving inside the pane on the
  words; at the line's end it goes dark and he's alone with himself again.
- **Windows onto the four** (`windows.js`): the users at the glass holding up what went wrong,
  then what the checks fixed, then cards saying what they know; a porthole that lights a quarter
  at a time; a row of them at the words that name them.
- **A progression through the repeats.** The pre-choruses and choruses show the same things
  further on each time: the report's lines change (the naive checks, then the oracles, then the
  users' own rules); the cards are a question mark, then half written, then full.
- **The band jumps only on the big hits** (`bandLine`'s `hops`), not on every beat.

## Lettering

Three voices, and each one is made of something different:

- **The band's words are cut out of the mirror.** Big Shoulders Stencil Display at its heaviest
  weight: a stencil face, so every letter is already a set of separate pieces with no counters to
  fall out, which is what a laser cutter needs. The glyph outlines are exported with fonttools
  (`tools/glyphs.py`) so each piece can be traced, cut and dropped (`type.js`: `cutWord`).
- **The machine's voice** (labels, the brief tickets, the test report typed line by line with
  its PASSes, the bot's prompt, the load test's readout) is JetBrains Mono.
- **The people's hand** (their cards, Jess's note, "I love it!", "Dave's still coming, though.")
  is Rock Salt, written outside the glass, never cut into it.

How the cut words behave:

- **A laser runs round each piece as the word nears,** white-hot with the member's colour round
  it, and the cut finishes 85 ms before the voice (`kit.js`: `VLEAD`). Then the piece drops out
  and the day comes in.
- **Every line is a poster.** `posterLine()` sets the line in rows that fill a box on screen,
  words scaled by weight, so the lettering is the frame's composition, not a caption over it.
- **Through the letters you see the place the line is about:** the bakery, the clinic, the
  school gate, the wedding (`story.js`), drawn at depth so they move like a real view through a
  window (`world.js`: `backdrop`).
- **A daylight haze and a bright rim** on every hole, so a letter keeps its shape whatever is
  behind it.
- **Words mean with their cuts:** BROKEN cracks out from CLAWD's hand, THROUGH stays stuck in
  the glass, PERFECT is cut round a perfect circle, CHECKS and TESTS are ticks all over the wall
  round the words, RUN AND RUN circles a disc like a clock, NONE is struck through, DONE is
  stamped.
- **Echoes are etched, not cut:** the reflections' voice is a glowing line drawn on the glass,
  in the colour of whoever sings it, beside the reflection that sings it.

## Pitfalls met

- **The story only through the letters doesn't carry it.** Listeners could only parse the lyrics
  with context animation; show each line's story big (a pane, a window), not only in the holes.
- **A member in front of the pane blocks it,** and from behind a Clawd is a plain block. Stand the
  camera where he stands and show him in the mirror.
- **A Clawd just behind the camera is drawn across the whole frame** as a blur (his parts project
  from behind the lens): draw him only in the mirror (`reflOnly`).
- **A cut-out enlarged past about 1.6 times its own pixels goes soft.** Frame the people no
  closer; for small things they hold, draw a bigger piece of paper over the hands.
- **The floor cuts off windows set below where the wall meets it.** Keep the camera level and
  near enough that the wall runs down to the foot of the frame.
- **A prop's size in `figure()` is its height:** size a pair of glasses by its width and convert,
  or it's four times too big.

- **3D solids inked with hatching look like CG crates.** Pose in 3D, draw the silhouette by hand.
- **People built from shapes show their construction.** Flat shapes looked like paper dolls;
  inked shapes still showed their circles and capsules (Qing, 2026-09-28: "it's not really good
  art if I can see the circles"). Generated artwork, cut out and animated as paper, got past it.
- **Cut-outs in front of a painted place float unless the ground is the camera's.** A plain
  ground in front of the painting read as a gap; the painting's own paving, in its own
  perspective, left the people hovering in the finale (Qing, 2026-09-28: "the finale scene (where
  people hover against the cartoony background)"). What worked: stand the painting's fronts
  across the far side, draw the ground in the camera's perspective up to them, in the film's own
  hand and at human scale (a flagstone a third of a person's height), give each person a contact
  shadow and a long cast shadow, and soften and haze the painting so it reads as distance and
  doesn't compete with the inked people. A smooth gradient for the ground read as an empty CG
  floor.
- **Depth-sort people, props and pieces of glass together,** far to near, or a far piece lands on
  a near face.
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
