# Style: Mirror Kei, G-pen ink and title-card type

Episode 2's style (v2, "The Mirror"): 90s cel anime inked with a G-pen, in the red, black and
bone of 2000s alternative rock, worn by a visual-kei band, with lyrics set as Evangelion-style
title cards. Qing's brief for it (2026-09-28): "an alternative rock music video of the 00s", "a
heavy dose of inspiration from Visual Kei, from J-rock in the '90s", "the more experimental and
alternative anime genres", and lyrics "almost a musical instrument in itself".

The worked example is the renderer, [video/ep02/mirror/](../../../../video/ep02/mirror/README.md).
The liner notes are in [episodes/02-video.md](../../../../episodes/02-video.md).

## When it suits

- Guitar music with drama in it: alt-rock, emo, post-hardcore, J-rock, anything with a strobe.
- A song that argues with itself (a singer and an echo, a question and its answer), because the
  mirror gives the echo a body.
- A lesson with a before and an after that can be lit: here, a mirror that turns to a window.

It suits less well a gentle or a pastoral song: its grounds are black and its light is hard.

## The look

- **The hand is in the line.** Every outline is a run of G-pen strokes: thick in the middle,
  sharp at both ends, broken where an inker lifts the pen at a corner, overshooting a little,
  redrawn on twos so it boils (`pen.js`: `gpen`, `ink`, `outline`). Nothing is laid over the
  colour: no paper, no grain, no screentone.
- **Cel colour.** Flat fills with one hard-edged shadow tone, made by cutting a copy of the shape
  moved toward the light out of it, and a rim of the scene's light cut the same way from the far
  side (`ink`'s `shade` and `rim`). No gradients, no blur.
- **Palette.** Ink black `#0b0a0e`, bone `#eee8dc`, blood red `#e0102f`, Clawd's orange
  `#d97757` (the only warm colour), steel greys for glass and frames, and one cold tint,
  glass-blue `#9fd8e6`, for reflections and echoes. People keep their own skin.
- **Light is shape.** A spotlight is a flat cone in three stepped bands; a strobe is a screen
  flash on the snare; a crash cymbal gets an impact frame (one or two frames inverted to a
  black-and-white negative, as anime does on a hit).
- **Glass.** A pane is a faint cold tint and two or three diagonal glint strokes. Cracks are
  jagged rays and ring chords; a shatter cuts the frame into polar shards that fly and fall,
  each carrying its piece of the picture (`glass.js`).
- **Silhouettes** are flat dark shapes with one clean edge of light: draw them flat into a layer,
  lay down a rim-coloured copy nudged up and left, then the dark copy (`people.js`: `rimmed`).
  Lines inside a silhouette make crowds look like grey noise.

## The band

Four Clawds, from the mascot's own proportions (a 6 x 4 body, tall square eyes at 1.75u either
side, nub arms at 62.5% of the height, four legs), with its sharp pixel corners kept. Visual kei
on top: eyeliner wings from the eyes' outer corners, a red eyeshadow stroke, catch-lights, four
platform boots with buckles, and one hairstyle each, drawn as a mass plus a few big blades that
swell from the root and taper to a point (anime hair is clumps, not strands):

| Member | Hair | Mark |
|---|---|---|
| Vo. CLAWD | black, swept over one eye, one red lock | a tall black collar, a chain |
| Gt. REGEX | six crimson spikes, flame-like | a sticking plaster |
| Ba. NULL | a bone-white curtain to the floor, blunt bangs | black lips, half-closed eyes |
| Dr. CRON | a black star of a mane, red at the tips | gaffer tape |

A mouth appears only while a Clawd sings, as the mascot has none. Hair swings with the groove
(`playing.js`: `groove`), and the reflection can differ from the Clawd: calm where he's
desperate, singing the echo while he's silent.

## People

90s anime proportions (about 6.7 heads tall), sloped shoulders, tapered capsule limbs, mitten
hands with a thumb, simple faces: almond eyes with a catch-light, a nose stroke, a mouth by
expression (`shock`, `squint`, `sweat`, `angry`, `deadpan`, `love`). Everyone sways and
breathes a little. The named cast wear the film's palette (Rosa's apron, Gran's red cardigan,
Sue's red dress, Jess's gown); strangers are varied by seed.

## Lettering

- **Noto Serif Display Black, extra-condensed,** in capitals, for every sung word: the
  title-card voice. Cut fixed-width instances from the variable font with fonttools
  (`varLib.instancer`): canvas ignored the width axis.
- **Italics, hollow and glass-blue,** for echoes: the reflection's voice (`lyric.js`: `echo`).
- **Mr Dafoe** for one word written in lipstick on the glass ("perfect"), revealed left to right
  as it's sung. **Grenze Gotisch** for the band's name. **Courier Prime** for tests, tags and the
  teaching card. **Covered By Your Grace** for the note a person writes by hand. **Shippori
  Mincho** for 第二話 and 合格.
- **Words land on the voice.** Each word finishes arriving 85 ms before its measured onset
  (`lyric.js`: `VLEAD`); the entrance starts a fraction of a beat before that.
- **Entrances by section:** `stamp` (in at once, pressed down from 128%) for the palm-muted
  verses; `slam` (from 190%) for the choruses; `drop` for the pre-choruses; `fog` for spoken
  words; `flip` for echoes. While up, words kick with the drums and chug on sixteenths.
- **Stressed words are red.** Every word carries an ink outline scaled to its size (3%, 4.5% for
  red), so it holds its edges on any ground, lit or dark.
- **A sung line is one block that holds across cuts.** Pictures cut on phrases; the line's type
  builds word by word as an overlay above them, so no word is up for less than about 0.6 s.

## Pitfalls met

- **A word dropped from above collides with the row over it.** Scale drop distances to the type.
- **Long lines shrink to fit and go unreadable.** Break them into three or four rows by hand.
- **Words in the lower half creep into the apps' button strip** on the right; `rows()` now
  keeps any row that reaches below y 950 left of x 930, allowing for its padding.
- **Text laid over a face.** Put subjects in the lower half of a frame whose top holds type.
- **A layer loses the camera.** Anything drawn into an offscreen layer must copy the caller's
  transform first, or it won't move with the shot.
- **A cut straight after a word leaves it up for a blink.** Hold the line across the cut.
- **The karaoke split puts stacked lead vocals in the backing stem.** Align words on the whole
  vocal stem (music/ep02/align_words.py).
