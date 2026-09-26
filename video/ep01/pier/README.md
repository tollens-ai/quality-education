# Episode 1 video: "The Pier"

The renderer for the episode-1 video, v4 ([episodes/01-video.md](../../../episodes/01-video.md)).
Every frame is a pure function of the song's time, drawn with Canvas 2D in ink and gouache.
Drawings change on twos (15 a second) while the camera moves on every frame.

## Render

From the repo root, on a machine with Playwright's Chromium and ffmpeg:

```
node video/lib/render.mjs --scene video/ep01/pier/main.js --song music/ep01 --stills 28.9,133.6 --w 1080
bash video/lib/render-parallel.sh video/ep01/pier/main.js music/ep01 <take.mp3> out.mp4 3 30 1080
```

Three segments suit a box with 4 cores and 8 GB; four full-width Chromiums can run out of memory.

The bots' marks load from `.private/ep01-assets/`, which isn't in git. Without them, the
characters draw simple stand-ins where their badges would go.

## Files

| File | What it holds |
|---|---|
| `main.js` | The shot list, and the frame pipeline: camera drift and kick "breathing", captions, finishing, dissolves |
| `ink.js` | The hand-drawn layer: wraps the canvas so every path comes out drawn by hand (wandering fills with a gouache texture, brush-pen outlines that boil on twos), and the paper |
| `hand.js` | The film's alphabet: brush capitals defined as strokes in writing order, written on as they're sung; letters along arcs; stroke skeletons for bulbs, stitches and stars |
| `kit.js` | Maths, easing, seeded noise, colour, shapes, painted light, deterministic particles (confetti, streamers, fireworks), and the song clock |
| `cast.js` | Clawd, Molty, Grok's bot, the OpenAI bot, Jolly, the people, and the mark badges (drawn exact); `pen` and `tone` for outlines and shading; `GROOVE` makes everyone dance to the beat |
| `band.js` | The instruments and the band playing to the record |
| `lyrics.js` | The sung words, lettered into each shot: `sing` lays a line out in rows and writes each word on at its onset; `backing` letters the backing vocals |
| `props.js` | Phones, laptops, the user's hand, the quota battery, containers, the clock, padlocks, the guide dog |
| `world.js` | Night sky, sea reflections, bulb strings, the bandstand, the Ferris wheel, the lighthouse, beams |
| `post.js` | The paper laid over each frame, and a soft vignette |
| `scenes/` | One file per part of the song: `verse1`, `pre`, `pier` and `stage` (the gig), `chorus`, `huts`, `pre2`, `bridge`, `break`, `final`, `outro`, plus `void` and `crowd` |
| `sheet.js` | A cast sheet, for checking the characters side by side |
| `tools/analyse.py` | Measures the take into `audio.json`: vocal, kick and mix loudness at 60 per second |
