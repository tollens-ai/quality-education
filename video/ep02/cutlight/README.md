# Episode 2 video: "Cut Light"

The renderer for episode 2's video, v3 ([episodes/02-video.md](../../../episodes/02-video.md)).
A band of four Clawds plays inside a box of mirrors, where all they can see is themselves. Every
word they sing is laser-cut out of the mirror, and the day outside, where the people they built
for are, shines in through the letters. Every frame is a pure function of the song's time, drawn
with Canvas 2D over a small 3D kit: an ink-and-neon manga page that moves. It was written from a
blank page; only the render harness in `video/lib/` and the record's measurements are shared with
v2. The style is described in
[style-cut-light.md](../../../.claude/skills/music-video/references/style-cut-light.md).

## Render

From the repo root, on a machine with Playwright's Chromium and ffmpeg:

```
node video/lib/render.mjs --scene video/ep02/cutlight/main.js --song music/ep02 --stills 15,41.5 --w 1080
node video/lib/render.mjs --scene video/ep02/cutlight/main.js --song music/ep02 --w 540 --fps 30 --frames 0:1748 --video part0.mp4
node video/lib/render.mjs --scene video/ep02/cutlight/look.js --song music/ep02 --stills 41 --w 1080 --query v=wide
```

A 540-wide preview renders at about ten frames a second on four cores, and the 1080 master at
about two, so split the film's 5,245 frames across machines with `--frames a:b` and join the parts
with ffmpeg's concat (on one machine, `video/lib/render-parallel.sh` does both). The take
isn't in git. `music/ep02/` holds its beat grid, the word timings (`lyrics.json`) and the
captions; `audio.json` here holds the drums, the guitar riff's notes and the loudness of each
stem (copied from v2's, which `video/ep02/mirror/tools/` measured). Without the take, stills and
silent videos still render.

## Files

| File | What it holds |
|---|---|
| `main.js` | Loads the song, the measurements and the fonts, registers each scene's shots, draws the shot (and any overlays) up at a time, and the corner marks |
| `kit.js` | Maths, noise and colour; the record: envelopes, drum and riff events, `hit()` for a decaying pulse; `words()`, which finds a sung line and gives each word the time its cut must finish (85 ms before the voice) |
| `shots.js` | `shot` and `overlay`, and `move()`, the camera between two set-ups, hand-held, shaken and breathing with the kick |
| `space.js` | The 3D kit: camera and projection, affine transforms, clipped polygons, lights, and solids shaded as ink (hatched half-tones, scratchboard on dark materials) |
| `post.js` | Offscreen layers, glow from what emits light, shafts, chromatic split, glitch, vignette, grain, and `rimmed()`, a silhouette's edge of light |
| `ink.js` | Hatching and tone ramps that boil on twos, and focus lines for the hits |
| `air.js` | Stage beams as bundles of fine lines, smoke, rays from the cut words, streaks in the floor's reflection, moths |
| `soft.js` | The hand-drawn outline over a 3D pose: hull, rounded corners, a line that swells on the shadow side, grain |
| `palette.js` | Ink, paper, the four members' colours and the four briefs |
| `room.js` | The mirror box: black glass walls and floor in chrome frames, and the reflections, down to a tunnel of them |
| `box.js` | One frame inside the box, layered the same way every time: wall, cuts and the day behind them, reflections (`refl.hero`: a member's clear reflection when he faces the glass), one-way glass turning see-through (`see`, `seeMask`), smoke, beams, the band rim-lit, the light; the band's line-up and the stage set |
| `type.js` | The fonts; `posterLine()`, which lays a sung line into rows that fill a box on screen and keep out of the phone's button strip; `drawCuts()`, the laser, the hole, the light through it and the falling piece; `windowCut()`, a window cut out of the mirror; etched and flat lettering; the brief tickets; and the audit hook that records every sung word |
| `clawd.js` | The four Clawds from the mascot's proportions, posed in 3D and drawn by hand: REGEX's visor, CRON's headphones, NULL's hooded cloak, Gran's glasses for NULL in verse 2 |
| `gear.js` | The mic and stand, REGEX's offset guitar, NULL's long-horned bass, CRON's kit, the amps |
| `playing.js` | The members playing to the record: the groove, hands on the riff, sticks on the drums, the singer at the mic |
| `paper.js` | The paper cut-outs: loads the cast and backdrops, and draws a figure as a card that sways, breathes, bobs on the beat, swaps poses with a pop and moves on twos, with a paper edge and a shadow; jointed pieces (Dave's wave); backdrops, and what stands in front of people in them |
| `cast/` | The cut-outs (WebP with transparency) and backdrops, with `index.json` (each figure's size and where its crown is) and `backdrops.json` (the sign boards, the clinic's screen, the sun, the wedding table) |
| `world.js` | What shows through the cuts: each place as its backdrop with its people in front (the bakery's queue, the clinic's booking screen and Gran, the parents at the school gate, Dave and Sue at the table), drawn in a reference camera's screen space so it moves like a view through a window; verse 2's windows; the people at the glass; the town square as a painted flat (`squarePlane`) |
| `day.js` | Outside, after the box breaks: the square at golden hour, the people on its paving with their long shadows, and pieces of mirror in the air, the words cut in them; everything drawn far to near |
| `look.js` | Look development: the hero frames, a character sheet, and every cut-out in the cast, moving (`--query v=wide`, `close`, `sheet`, `cast`) |
| `scenes/` | `intro` (the dedication, the riff's storm of cuts, the members, the title), `verse1` (each member facing his reflection), `pre` (all three pre-choruses), `chorus` (all three), `brk`, `verse2` (the oracles' windows), `bridge` (the definition over four windows, the disc, the torch, DONE), `outro` (the evidence, the question, the answers, the teaching card and end card) |
| `fonts/` | Big Shoulders Stencil Display and JetBrains Mono (OFL), Rock Salt (Apache 2.0), with their licences; `stencil-900.json` holds the stencil face's glyph outlines at its heaviest weight |
| `tools/` | `glyphs.py` exports the glyph outlines; `cutout.py` cuts figures out of generated sheets; `backdrops.py` prepares and measures the backdrops; `typo-audit.mjs`, `typo-report.py` and `typo-run.sh` check every sung word; `shots.mjs` lists gaps and overlaps between shots |

## How a word is cut

`words()` gives each sung word the time its cut must finish. `posterLine()` sets the line into
rows on the wall, sized from the screen so it fills its box, and cuts each word into pieces: the
stencil face's letters are already separate pieces, with no counters to fall out. `drawCuts()`
runs a laser round each piece as the word nears, then drops the piece out and draws, through the
hole, the view outside, with a haze of daylight and a bright rim round each letter. A word cut
before a shot starts is carried into it already open, so a line holds across its cuts.
