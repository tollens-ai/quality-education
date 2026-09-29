# Episode 3 video: "Pencil Polka"

The renderer for episode 3's video ([episodes/03-video.md](../../../episodes/03-video.md)): doodles in
coloured pencil that dance to an oom-pah, drawn by an expert doodler. Every frame is a pure function
of the song's time, drawn with Canvas 2D in headless Chromium, in the style described in
[style-pencil-polka.md](../../../.claude/skills/music-video/references/style-pencil-polka.md). It was
written from a blank page for this song; only the render harness in `video/lib/` and the
measurements in `music/ep03/` are shared with the other episodes.

**Status:** being built, part by part (2026-09-29). Each part's scene file registers its own shots;
`main.js` loads whichever exist, so a cut renders at any stage. See the episode's video file for the
plan and what is done.

## Render

From the repo root, on a machine with Playwright's Chromium and ffmpeg:

```
node video/lib/render.mjs --scene video/ep03/polka/main.js --song music/ep03 --stills 5.6,8.6 --w 1080
bash video/lib/render-range.sh video/ep03/polka/main.js music/ep03 take.wav proof.mp4 0 16.9 3 30 1080
node video/lib/render.mjs --scene video/ep03/polka/look.js --song music/ep03 --stills 5 --w 1080 --query v=big
```

`--query v=...` selects a look-development view of `look.js`: `sheet` (Clawd's faces and Bruce), `big`
(Clawd and Bruce at film size), `shapes` (plain shapes as the pen draws them), `park` (the backdrop
and its cast), `dogs` (the front-on breeds), `people`, `type` (bubble-letter variants). A 540-wide
preview renders at about 20 frames a second on four cores. The take isn't in git: `music/ep03/`
holds its beat grid and sections (`beats.json`), the measurements (`audio.json`), the word times
(`lyrics.json`) and the captions. Without the take, stills and silent videos still render.

`video/ep03/karaoke/` is the plain timing check (each word lights up 85 ms before its measured
onset, with a dot on the beat), rendered the same way with `lead-085.js` as the scene.

## Files

| File | What it holds |
|---|---|
| `main.js` | Loads the record, registers each scene's shots, draws the frame (its drawings on twos), the corner marks |
| `kit.js` | Maths, noise, colour; **`HAND.clumsy`**, the one dial for how clumsy the hand is; the drawing clock (`twos`, `variant`); the record: the beat map (`beatPos`, `beatPulse`, `downPulse`, `sway`, `beatTimes`), the stems' loudness (`loud`) and hits (`hit`); the sung words (`words()`, each with `s`, `e`, `v`, `str`) |
| `pencil.js` | The pen: `line` (a stroke that sags a little and may run on), `outline` (a shape as a hand's strokes), `hatch` and `blob` (colouring in that spills over, is opaque, has a shade), `dot`, `scrub` (broad crayon scribble), grain |
| `shapes.js` | Outline generators, all a little hand-made: `rrect`, `ellipse`, `capsule` (a limb), `star`, `scallop`, `bean`, `roundPoly` |
| `paper.js` | The page, and `pageTone`, its colour at a point (what an opaque shape is knocked out in) |
| `hand.js` | The alphabet: hand-printed capitals as strokes in writing order; `write()` with write-on, bounce on the beat and outlined bubble letters |
| `lyrics.js` | `sing()`: a sung line as a block of body rows and a big tail row, each word written on to finish 85 ms before the voice |
| `board.js` | The sing-along board: a chorus line on a sign, the ball's path from the beat map and the word times, Bruce racing after it |
| `chars.js` | `clawd()` (every expression, arms, legs, a mouth that follows the voice) and `dachshund()` (Bruce; walk, wag, ear, mouth) |
| `people.js` | `person()` (posed, holding things) and `dogFront()`: front-on dogs in twelve breeds |
| `props.js` | Rosettes (new, wilting, empty), ticks, bursts, sparkles, paw prints, speech bubbles, phones, a clipboard, a calendar, a rubber stamp |
| `world.js` | The park and what lives in it: `park()`, `sun` (with a face), `cloud`, `tree`, `flower`, `pigeon`, `butterfly`, `bunting`, `crowdRow` |
| `ring.js` | The dog show ring in three moods (`ringBackdrop`: day, night, golden hour), fairy lights, spotlights, the judge's table |
| `ringcast.js` | What belongs to the ring: the judge's bowler, Clawd as judge, the show dog with his WALKIES badge, a hurdle, confetti; and for the tables-turned chorus the bulldog judge and Clawd on the table |
| `life.js` | What makes a drawing live: `idle` (blinks, wandering eyes, breath), `ring` and friends (damped springs set going by beats), `bounce`, and acting shapes `spring`, `shake`, `hop`, `gate`, `ease` |
| `common.js` | `groove` (the dance), timing ramps and pops, the sky and the meadow |
| `shots.js` | Shots (a time range and a draw function) and the joins between them: `push` and `iris` |
| `palette.js` | Paper, graphite, the pencil colours, Clawd's terracotta |
| `scenes/` | One file per part of the song (`intro`, `verse1`, `verse1b`, `chorus1`, `verse2`, `chorus2`, `trials`, `bridge`, `parade1`, `parade2`, `leadin`, `chorus3`, `outro`, and `joins` for the joins between parts); `chorus-core.js` is the machinery the three choruses share |
| `preview.js` | Renders one part alone: `--scene video/ep03/polka/preview.js --query part=verse2` |
| `marks.js` | The corner marks |
| `tools/` | The typography audit (`typo-audit.mjs` records every sung word as drawn, `typo-report.py` judges it), and `render-film.sh` (the whole film, with six seconds of end card held after the music) |
| `look.js` | Look development |

## Building a shot

A shot is `shot(a, b, draw, { id })` in a scene's `register(S)`: it draws the whole frame (page,
picture and lettering) as a pure function of `t`, the drawing's own clock: the film's time rounded to the
nearest fifteenth of a second (drawing on twos), so a picture is never more than 33 ms early or late against
the sound. Read `scenes/verse1.js` for worked examples. What every shot needs:

1. **Start from a backdrop, end on the words.** `park(g, t, opts)` (or your own place, always
   beginning with `paper(g)`), then the picture, then `sing(g, t, ws, {...})` last so the lyric is
   never covered.
2. **Time everything from the words.** `const ws = words('Verse 1', 'It died at night')` gives each
   word `s` (its onset) and `e`; a picture that answers a word should land at `ws[i].s - .085`
   (`v`), or on the nearest beat (`beatTimes()`). Never hard-code a time that a word owns.
3. **Nothing static.** Every character is alive by itself (`idle`); add the dance with
   `groove(t, k)` (`bob`, `squash`, `lean`), and one thing that happens on each line. A picture that
   only *sits* there is not finished.
4. **Draw with the pen, not the canvas.** Shapes: `blob(g, rrect(...)/ellipse(...)/capsule(...), { fill,
   shade, line: GRAPHITE, lw, seed, t })`; lines: `line(g, pts, {...})`; give each shape its own
   `seed`. Never use `fillRect`/`arc`/`stroke` directly for something that shows, or it will look
   like it was made in Paint. Colour with `palette.js`; be quiet with saturated colours behind text.
5. **Keep the frame's zones.** Lyrics own the top of the frame (to about y = 620); the picture is
   y 640-1520; the last 400 px is the phone's button strip, so only grass and dogs' feet go there.
   Big things: the object a line is about should fill a third of the picture.
6. **Look at it.** Render stills of the shot at a handful of times (the start, each landing, the
   end) at 1080 wide, look at them at full size and at 400 px wide, and fix what is off before
   handing it back: overlaps, text covered, anything clipped by the frame, a head without its eye.

Ambient life is cheap: a `pigeon` on a prop, `butterfly`, a sun with a mood that follows the
story (`worried` when it crashes, `shades` when it's fine), clouds, flowers, a crowd. Use one or two,
and none of them should upstage the gag.
