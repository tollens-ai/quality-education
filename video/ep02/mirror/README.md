# Episode 2 video: "The Mirror"

The renderer for episode 2's video, v2 ([episodes/02-video.md](../../../episodes/02-video.md)).
Every frame is a pure function of the song's time, drawn with Canvas 2D: G-pen ink and flat cel
colour in the red, black and bone of 2000s alt-rock, and lyrics set as title-card type. It was
written from a blank page; nothing is shared with the episode-1 renderer or v1's except the
render harness in `video/lib/`. The style is described in
[style-mirror-kei.md](../../../.claude/skills/music-video/references/style-mirror-kei.md).

## Render

From the repo root, on a machine with Playwright's Chromium and ffmpeg:

```
node video/lib/render.mjs --scene video/ep02/mirror/main.js --song music/ep02 --stills 31.9,142.3 --w 1080
bash video/lib/render-parallel.sh video/ep02/mirror/main.js music/ep02 <take.wav> out.mp4 3 30 1080
node video/lib/render.mjs --scene video/ep02/mirror/sheet.js --song music/ep02 --stills 1 --w 1080 --query people=1
```

The take isn't in git. `music/ep02/` holds its beat grid, the word timings (`lyrics.json`) and
the captions; `audio.json` here holds the drums, the guitar riff's notes and the loudness of each
stem. Without the take, stills and silent videos still render.

## Files

| File | What it holds |
|---|---|
| `main.js` | Loads the song and the measurements, registers each scene's shots, and draws the shot (and any overlays) up at a time; the corner marks |
| `shots.js` | `shot` and `overlay` (lettering that holds across cuts), and the hand-held camera that drifts, rolls and breathes with the kick |
| `kit.js` | Palette, maths, noise, and the record: envelopes, drum and riff events, `hit()` for a decaying pulse, the lyric lines |
| `pen.js` | The G-pen: tapered strokes (`gpen`), paths (`P`), inked cel shapes with a shadow tone and a rim (`ink`), hatching, focus lines, glass cracks and shards |
| `type.js` | The fonts, `text()` with outlines, shadows, per-letter motion and floor reflections, the entrances (`slam`, `stamp`, `drop`, `fog`, `flip`...), and the audit hook that records every string drawn |
| `lyric.js` | `words()` finds a sung line and gives each word its landing time (85 ms before its onset); `sing()` draws a word with its entrance, life and exit; `rows()` lays a line out in designed rows that fit the frame and keep clear of the phone's UI; `echo()` sets a backing line |
| `clawd.js` | The four visual-kei Clawds: body from the mascot's proportions, faces, eyeliner, platform boots, the four hairstyles, costumes, a back view, Gran's cardigan for the bot who plays her |
| `gear.js` | REGEX's guitar, NULL's bass, the mic and stand, CRON's clear acrylic kit |
| `playing.js` | The members playing to the record: hands on the riff's notes, sticks on the drums, the groove (`groove`) |
| `people.js` | The people, and strangers varied by seed; `rimmed()` draws silhouettes with one clean edge of light |
| `places.js` | The far side of the glass: the bakery, the clinic, the school gate and the wedding, each broken, checked or fine; the four briefs and their plates |
| `bugs.js` | Moths (the bugs), the red 合格 seal, a teacher's tick |
| `glass.js` | Mirror edges, panes, a two-sided reflection (`reflected`), lasting cracks, shattering |
| `world.js` | Offscreen layers (`layer`, `put`), light as flat shapes, strobes, impact frames, grounds, the kaleidoscope |
| `scenes/` | `intro` (the dedication, the riff's rose windows, the title), `stage` (the mirror wall, the band from the front, the crowd), `verse1`, `pre` (all three pre-choruses), `chorus` (all three), `brk`, `verse2`, `bridge`, `outro` (with the teaching card and end card) |
| `sheet.js` | Character sheets: the band, close-ups (`?big=1`) and the people (`?people=1`) |
| `fonts/` | Noto Serif Display (cut to fixed-width instances and subset), Grenze Gotisch, Courier Prime, Mr Dafoe, Covered By Your Grace, Shippori Mincho (subset), each with its OFL licence |
| `tools/` | `analyse.py` measures the four Demucs stems into `audio.json`; `riff.py` adds the guitar riff's notes; `typo-audit.mjs`, `typo-report.py` and `typo-run.sh` check every sung word; `shots.mjs` lists gaps and overlaps between shots |

## How the words are timed

`music/ep02/align_words.py` times every sung word from the voice: two forced aligners and two
Whisper runs vote, each onset moves to the nearest onset of sound on the vocal stem, and repeated
lines are checked against each other. Its header says how, and VIDEO.md says why.
