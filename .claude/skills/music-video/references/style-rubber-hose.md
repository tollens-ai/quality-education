# Style: Rubber Hose, a 1930s sing-along cartoon, polished

Episode 4's second film (the piano take): a rubber-hose cartoon of about 1930, drawn entirely in
JavaScript, with the character design polished the way modern games and films in that style do it.
Characters are inked cels: a warm black brush line, thick where a shape turns away from the light
and thin where it faces it, over flat paint with one soft rounded shade and a hard highlight. Arms
and legs are rubber hoses ending in white four-finger gloves and big round shoes; eyes are pie-cut,
often in whites. Places are painted backgrounds in watercolour and gouache, deep and lit, paler
and softer than the cels. The lyric sits in one place all film, just below the middle, with a red
ball bouncing along it, after the sing-along cartoons of the 1920s and '30s. The worked example is
[video/ep04/ball/](../../../../video/ep04/ball/README.md); the liner notes are in
[episodes/04-video-piano.md](../../../../episodes/04-video-piano.md).

The first version of this film was drawn in one night at less than maximum effort. Qing (2026-10-01)
liked "the idea and character design direction" and found "the text layouts and background work
ended up really sloppy"; she asked for the rubber hose to stay, with "inspiration from cuphead in
terms of character design". What changed is written down below as the look, so it isn't lost again.
Of the second version, the same day, she said "the animation is gorgeous though": keep it. Her notes
on that version were about the frame, the story and two details, not the drawing; VIDEO.md has the
general rules, and here they changed the band below the floor line, the close-ups and the testers'
mark.

## When it suits

- A comic patter song led by a piano, recorded as if in one room: the era's sound, and the era's
  cartoons were cut to exactly that.
- A story that needs lovable characters fast: rubber-hose figures read at a glance, act broadly and
  bounce on every beat.
- Lessons that can be shown as physical gags and mime. The era made everything literal and silent
  film made it legible without words: a paste pot for pasted code, a bellows camera for screenshots,
  a router whose antennas wilt for "no net", a padlocked logbook with an eye in its keyhole.

## The look

- **The cel and the background are two different media.** Cels (`ink.js`): flat paint, a soft form
  shade (`form()`: radial for round things, a lift on the broad face and a shade gathered on the lower
  right edge for blocks), a little reflected light just inside the lower edge, and a hard white bean
  of highlight. The paint holds still; only the line boils, a pixel or so, between three inkings on
  twos. Backgrounds (`bg.js`): washes with granulation, blooms and a dried rim, glazed with light and
  shadow, brush streaks for grain, a thin broken brown line where an edge wants one, and paper.
- **Places are lit, not flat-filled.** Every place has a warm light pooling where the action stands and
  darkness, cooler in hue, gathering in the corners and up top (`light`, `gloom`, a cool multiply).
  That one move is most of the difference between v1's flat brick and plank walls and v2's rooms.
  Depth comes from clutter that tells you where you are (a pegboard of tools, a round window on a
  moonlit town, toys on a shelf), painted softly and falling into shadow, never lettered.
- **Every place has a floor line, and its foreground fills the frame below it.** The camera puts the
  floor line at screen y 1100 (`floorCam`); the subject lives above it. Below it the place carries on
  to the foot of the frame: the stalls' audience in silhouette, the stage light catching their heads
  and hats (`audience()` in places.js); the bench's drawers and the boards in front of them; weights
  on a gym mat; the top of a desk. It's atmosphere, not story, painted dark and quiet because the
  lyric sits over it. v2 left this band a plain dark apron, and the picture filled only the top half
  of the frame.
- **Close-ups fill the frame.** v2 drew them as iris inserts, a circle on the detail with black all
  round, which left most of a tall frame black. Push in until the detail fills the frame, or grow
  into it from something in the shot (Guess's lens), never out of black.
- **Backlit figures** in a doorway are drawn into an offscreen layer and darkened together
  (`withLayer`, `backlit`).
- **Two-colour warmth with meaning kept apart:** each star has a colour of his own (Clawd terracotta,
  Press teal, Stress brass, Guess violet); green and red are kept for the checks' flags.
- **The finish of a print** (`film.js`): a little gate weave on twos, a breathing light, a vignette.
  Joins are cuts on the beat, irises between parts.

## The cast

Each character is a function with poses by name (`clawd.js`, `crew.js`, `people.js`, `cast.js`):

- **Clawd** keeps his wide terracotta block, tall black eyes, side stubs and four little legs; the
  era adds pie-cut eyes, a singing mouth, rosy cheeks, black hose arms, white gloves, a straw boater
  and a cane, swapped for a magnifying glass once he learns to test. Fresh bots are little Clawds in
  propeller beanies.
- **The crew, Press, Stress & Guess**: Press (small, round, teal, a red push-button on his head),
  Stress (a brass boiler with a pressure gauge, a whistle and a walrus moustache), Guess (a tall tin
  detective in a violet Inverness coat and a tweed deerstalker, with a monocle, a waxed moustache and a
  question-mark antenna that comes up through his cap and springs into "!" on a clue). One verb each,
  told apart by colour and silhouette. Guess began as a tall rose tin with a domed head, and Qing saw
  what that silhouette looked like: "what's... the pink guy... meant to be? he looks a bit... rude."
  The cap and the cape broke the shape and said "detective" at a glance.
- **Checks** are tin wind-up toys: a card on the chest, one flag, a turning key, dot eyes and no
  brows. They can't wonder; that is the point. The flag means only the check's rule: green when it's
  met, red when it isn't. Testing has its own mark: when the crew find what a check missed, they slap
  a "?!" sticker over its green flag.
- **Things act**: phones have eyes in their top edge; the router's antennas wilt when it's unplugged;
  the comma faints; the bug is a beetle in the code, copied with it.
- **"They"** (who trained the agent) are one shadowy silhouette who changes hats: ringmaster, teacher,
  factory boss.
- **Mabel** is a strongwoman, built like one; the townsfolk are animal folk (a tabby cat, a puppy, a
  goose), so each reads at a glance.

## The lettering

- Corben (a soft fat serif of the Cooper kind) for the intro, refrains, breakdown and outro; Lilita
  One (rounded, condensed) for the patter. Cream letters, a
  brush-weight ink outline, a hard ink drop shadow, each letter jiggling a little as the drawing boils
  (`type.js`).
- One sung line at a time, two rows at most, in one column for the whole film: top at y 1190,
  centred at x 500 so the widest row (850 px) stays clear of the apps' buttons on the right. Rows break
  where the phrase does (`BREAK` for the refrains). When the singing moves to the second row, the first
  lifts by half a line, so the ball has room to bounce (`lift`).
- The ball (`lyrics.js`) lands on each word 85 ms before it's sung; the word springs up to meet it
  and squashes on the impact; the word being sung is gold. A soft dark pool sits behind each block.
- Quoted speech is a white speech bubble pointing at the speaker (`BUBBLE`), lettered dark. Clawd's
  scare quotes ("tests") are in rose, as if the crew had pencilled them in with a red pencil.
- The backing voices' echoes ("What did you try?") aren't lettered: the matching words in the lead
  line glow rose while the echo is sung, so the eye stays on one line.
- Nothing else is lettered while the song plays: `tools/text-audit.mjs` checks every `fillText`.

## Pitfalls met

- Canvas text state leaks: a prop that sets `textAlign = 'center'` without restoring it made every
  later letter shift by half its width. `word()` sets its own alignment.
- A two-row block left the ball nowhere to land on the second row: it hopped into the row above. The
  lifting first row fixed it.
- A word popping in with a big overshoot collided with its neighbour ("Witlscreenshots"): keep the
  pop's overshoot small and the gap between words generous.
- A speech bubble sized for its whole line opened as an empty slab around its first word, and a
  wide line's bubble touched the frame's edge. Grow the bubble with its words, give bubbled lines a
  narrower column, and on a second row start the tail from the bubble's end, clear of the row above.
- The ball crossing back to the next line's start ran over letters still on screen, then waited
  alone where a line had been. It waits on the last word until its block goes, then makes the
  carriage return over the empty band. A section's last line leaves soon after it's sung, so it
  doesn't hang over the next section's first picture.
- The camera function returns its keyframe objects at the ends of its range: copy before nudging one
  (a knock shake once moved a keyframe for good).
- A rubber-hose arm can stretch across the frame, and that's a gag, but a long reach drawn straight
  across another subject reads as a slash. Route it: on episode 4's piano film Guess's arm swings
  under the nearer card to strike the far one (`arm()` with a strong `bend`), and an arm whose owner
  is out of shot gets its owner leaning in at the edge.
- Parts on different clocks move differently. A shot is handed the song time and moves its camera
  with it (`cam(keys, t)` in common.js); everything it draws takes `now()`, the song time on twos
  (`twos()` and `setNow()` in kit.js). Builders' parts that mixed the two moved unlike the rest until
  integration put them right, so the split belongs in the standing brief.
- A sepia drain for the breakdown must reach the baked backgrounds too (a canvas filter in `place()`),
  and colours that carry meaning are marked to keep their colour (`'!' + colour`).
