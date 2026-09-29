# Episode 3 video: "Pencil Polka"

The renderer for episode 3's video ([episodes/03-video.md](../../../episodes/03-video.md)): a page of
coloured-pencil doodles that dance to an oom-pah. Every frame is a pure function of the song's time,
drawn with Canvas 2D in headless Chromium, in the style described in
[style-pencil-polka.md](../../../.claude/skills/music-video/references/style-pencil-polka.md). Drawings are
redrawn about twelve times a second (the boil) while cameras, pops and pulses run at every frame. It
was written from a blank page for this song; only the render harness in `video/lib/` and the
measurements in `music/ep03/` are shared with the other episodes.

**Status:** pre-production. The first 16.9 s (the title page and verse 1's first four lines, with a
page flip, two scribble wipes and the first dark page) and the first two lines of chorus 1 with
the sing-along board are built to test the style; the rest is planned in the episode's video file.

## Render

From the repo root, on a machine with Playwright's Chromium and ffmpeg:

```
node video/lib/render.mjs --scene video/ep03/polka/main.js --song music/ep03 --stills 5.6,8.6 --w 1080
bash video/lib/render-range.sh video/ep03/polka/main.js music/ep03 take.wav proof.mp4 0 16.9 3 30 1080
node video/lib/render.mjs --scene video/ep03/polka/look.js --song music/ep03 --stills 5 --w 1080 --query v=sheet
```

`--query v=sheet` is a character sheet of Clawd and Bruce, `v=dogs` the twelve front-on breeds, `v=people`
the people, `v=type` the bubble-letter variants. A 540-wide preview renders at about 20 frames a
second on four cores. The take isn't in git: `music/ep03/` holds its beat grid and sections
(`beats.json`), the measurements (`audio.json`), the word times (`lyrics.json`) and the captions.
Without the take, stills and silent videos still render.

`video/ep03/karaoke/` is the plain timing check (each word lights up 85 ms before its measured
onset, with a dot on the beat), rendered the same way with `lead-085.js` as the scene.

## Files

| File | What it holds |
|---|---|
| `main.js` | Loads the record, registers each scene's shots, draws the frame, and the corner marks (the handle and Tollens's ∴, three dots at the corners of an equilateral triangle) |
| `kit.js` | Maths, noise, colour; the boil (`variant`, `boil`); the record: the beat map (`beatPos`, `beatPulse`, `downPulse`, `sway`), the stems' loudness (`loud`) and hits (`hit`); the sung words (`words()`, with each word's `v`, the time it must be fully written) |
| `pencil.js` | The pen: `line` (a ribbon stroke, drawn twice, written on by `from`/`to`), `hatch` and `blob` (colouring in that spills over the outline, a shade, a double outline), `dot`, `scrub` (broad crayon scribble), the grain patterns |
| `hand.js` | The alphabet: hand-printed capitals as strokes in writing order; `write()` with write-on, per-letter differences, bounce on the beat, and outlined bubble letters |
| `lyrics.js` | `sing()`: a sung line as a block of body rows and a big tail row; each word written on to finish 85 ms before the voice, bobbing on the beats inside it and rippling letter by letter; the typography audit hook |
| `board.js` | The sing-along board: a chorus line on a sign, the tennis ball's path (a landing on a word at every beat, from the beat map and the word times), Bruce racing after it |
| `shapes.js` | Outline generators: rounded rectangles, ellipses, beans, stars, scallops |
| `palette.js` | Paper, graphite, the pencil colours, Clawd's terracotta |
| `paper.js` | The page everything is drawn on |
| `chars.js` | Clawd (every expression, arms, legs, a mouth that follows the voice) and Bruce the dachshund (walk, wag, ear, mouth) |
| `people.js` | `person()` (posed, holding things) and `dogFront()`: front-on dogs in twelve breeds |
| `props.js` | Rosettes (new, wilting, empty), ticks, bursts, sparkles, paw prints, speech bubbles, phones (new and old), a clipboard, a calendar, a rubber stamp |
| `common.js` | The dance (`groove`), timing ramps and pops, the sky and the meadow |
| `shots.js` | Shots (a time range and a draw function) and the joins between them: the notebook page flip and the pencil-scribble wipe |
| `scenes/` | One file per part of the song: `intro`, `verse1` (four lines so far), `chorus1` (two lines so far) |
| `look.js` | Look development: hero frame, character sheet, dogs, people, bubble letters |

## What isn't built yet

Everything after verse 1's fourth line and chorus 1's second; the typography audit and shot lister;
the master render script. See the plan in the episode's video file.
