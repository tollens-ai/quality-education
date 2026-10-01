# Style: Rubber Hose, a 1930s sing-along cartoon

Episode 4's second film (the piano take): a two-colour cartoon of around 1930, drawn entirely in
JavaScript. Characters are inked cels: a warm black brush line, thick where a shape turns away from
the light and thin where it faces it, over flat paint laid a hair out of register. Arms and legs are
rubber hoses ending in white four-finger gloves and big shoes; eyes are pie-cut. Places are painted
backgrounds in watercolour and gouache, paler and softer than the cels. The lyric is lettered like a
cartoon's title card, and a red ball bounces along it, after the sing-along cartoons of the 1920s and
'30s, landing on each word as it's sung. The worked example is
[video/ep04/ball/](../../../../video/ep04/ball/README.md); the liner notes are in
[episodes/04-video-piano.md](../../../../episodes/04-video-piano.md).

## When it suits

- A comic patter song led by a piano, recorded as if in one room: the era's sound, and the era's
  cartoons were cut to exactly that.
- A story that needs lovable characters fast: rubber-hose figures read at a glance, act broadly and
  bounce on every beat.
- Lessons that can be shown as physical gags. The era made everything literal: here a paste pot
  for pasted code, a camera for screenshots, a real cable and wall socket for "the net", a STORE
  drawer inside a phone, wind-up toys with flags for checks.

## The look

- **The cel and the background are two different media.** Cels (`ink.js`): flat fills that hold
  still, a brush line that boils between three inkings of each drawing. Backgrounds (`paint.js`,
  `places.js`): watercolour washes with blooms and dried rims, baked once per place, a thin brown
  background ink, paper speckle only in the paint. No texture over the cels.
- **Weight in the line.** `line()` is a ribbon whose width follows the light (heavy on the lower right)
  and tapers where an open stroke lifts. Every shape goes through it; nothing is a canvas stroke.
- **One shade per cel.** A darker copy of the fill shows as a rim on the lower right (`shape(...,
  { shade })`), and a hard white gloss bean sits on the upper left. No gradients on characters.
- **Two-colour palette** (`palette.js`): terracotta and coral against teal, over cream card and warm
  ink, with ochre and rose for the crew. Green and red are kept for meaning (a check's flag), apart
  from the teal.
- **The finish of a print** (`film.js`): a little gate weave on twos, a breathing light, a vignette.
  Joins are cuts and irises.
- **Drawn on twos.** Drawings change twelve times a second (`twos()` in `kit.js`); the camera and the
  joins move every frame.

## The cast

Each character is a function with poses by name (`clawd.js`, `crew.js`, `people.js`):

- **Clawd** keeps his wide terracotta block, tall black eyes, side stubs and four little legs; the
  era adds pie-cut eyes, black hose arms, white gloves, a straw boater and a cane (swapped for a
  magnifying glass once he learns to test).
- **The crew, billed PRESS, STRESS & GUESS**: Press (small, round, teal, a push-button on his head),
  Stress (a brass boiler with a pressure gauge and a steam whistle), Guess (tall, rose, monocle, a
  question-mark antenna that springs into "!" on a clue). One verb each, told apart by colour and
  silhouette.
- **Checks** are tin wind-up toys: a rule card on the chest, one flag, dot eyes and no brows. They
  can't wonder; that is the point.
- **Mabel**, the strongwoman whose gym log loses her sets, and small parts (Pat, Sam, the customer).

## The lettering

- Corben (a soft fat serif of the Cooper kind) for the intro, refrains and outro; Lilita One
  (rounded, condensed) for patter; Oleo Script for asides and echoes. Cream letters, a brush-weight
  ink outline, a hard ink drop shadow, each letter wobbling a little as the drawing boils
  (`type.js`).
- A couplet is one block at the top of the frame; a refrain's line is a block of its own, bigger.
  Rows are split so the longest row is as short as possible (no orphans).
- The ball (`lyrics.js`) lands on each word 85 ms before it's sung; the word springs up to meet it and
  squashes on the impact; the word being sung is gold. On a held word the ball keeps time in small
  hops. It carries on from block to block, and drops away in long gaps.
- Echoes from the backing voices are small rose script under the block.

## Pitfalls met

- Canvas text state leaks: a prop that sets `textAlign = 'center'` without restoring it made every
  later letter shift by half its width. `word()` now sets its own alignment.
- Characters stood small at the bottom of a tall frame with an empty wall above. Frame every set by
  its floor line (`floorCam`): put the floor near the bottom of the picture zone and zoom until the
  cast fills the middle third.
- A sepia "drain" for the breakdown must reach the baked backgrounds too (a canvas filter in
  `place()`), and colours that carry meaning are marked to keep their colour (`'!' + colour`).
