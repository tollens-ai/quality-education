# Episode 1 video: "The Pier"

The renderer for the third episode-1 video ([episodes/01-video.md](../../../episodes/01-video.md)).
Every frame is a pure function of the song's time, drawn with Canvas 2D.

## Render

From the repo root, on a machine with Playwright's Chromium and ffmpeg:

```
node video/lib/render.mjs --scene video/ep01/pier/main.js --song music/ep01 --stills 28.9,133.6 --w 1080
bash video/lib/render-parallel.sh video/ep01/pier/main.js music/ep01 <take.mp3> out.mp4 3 30 1080
```

The bots' marks load from `.private/ep01-assets/`, which isn't in git. Without them, the
characters draw simple stand-ins where their badges would go.

## Files

| File | What it holds |
|---|---|
| `main.js` | The shot list, and the frame pipeline: camera drift and kick "breathing", captions, finishing, dissolves |
| `kit.js` | Maths, easing, seeded noise, colour, shapes, glows, deterministic particles (confetti, streamers, fireworks), and the song clock |
| `cast.js` | Clawd, Molty, Grok's bot, the OpenAI bot, Jolly, the people, and the mark badges; `GROOVE` makes everyone dance to the beat |
| `band.js` | The instruments and the band playing to the record |
| `lyrics.js` | The sung words on screen: each word appears on its onset; lines break at sung phrases |
| `sign.js` | Fairground marquee lettering with bulbs set inside the strokes |
| `props.js` | Phones, laptops, the user's hand, the quota battery, containers, the clock, padlocks, the guide dog |
| `world.js` | Night sky, sea reflections, bulb strings, the bandstand, the Ferris wheel, the lighthouse, beams |
| `post.js` | Bloom (thresholded), grade, vignette and film grain |
| `scenes/` | One file per part of the song: `verse1`, `pre`, `pier` and `stage` (the gig), `chorus`, `huts`, `pre2`, `bridge`, `break`, `final`, `outro`, plus `void` and `crowd` |
| `sheet.js` | A cast sheet, for checking the characters side by side |
| `tools/analyse.py` | Measures the take into `audio.json`: vocal, kick and mix loudness at 60 per second |
