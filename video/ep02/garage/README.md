# Episode 2 video: "The Garage"

The renderer for the episode-2 video ([episodes/02-video.md](../../../episodes/02-video.md)).
Every frame is a pure function of the song's time, drawn with Canvas 2D in cut paper and marker:
flat paper colour, hard drop shadows, and a felt-tip line that boils on twos. It began as a copy
of [episode 1's renderer](../../ep01/pier/README.md); the style layer and the episode are new.

## Render

From the repo root, on a machine with Playwright's Chromium and ffmpeg:

```
node video/lib/render.mjs --scene video/ep02/garage/main.js --song music/ep02 --stills 42.3,128.5 --w 1080
bash video/lib/render-parallel.sh video/ep02/garage/main.js music/ep02 <take.m4a> out.mp4 3 30 1080
node video/lib/render.mjs --scene video/ep02/garage/sheet.js --song music/ep02 --stills 20 --w 1080
```

The take isn't in git. `music/ep02/` holds its beat grid, the timed lyrics and the captions.

## Files

| File | What it holds |
|---|---|
| `main.js` | The frame pipeline: camera drift and kick "breathing", cuts, wipes, flashes, the corner marks |
| `shots.js` | The shot list, in song order, and how hard everyone dances section by section |
| `ink.js` | Episode 1's hand-drawn layer, with the gouache texture off and cut paper added: `g.drop` (a hard shadow), `g.border` (a paper margin), `g.reg` (colour off its line). Closed outlines overshoot where they start, as a hand-drawn loop does |
| `zine.js` | Cut paper (`cut`), marker shapes and lines, tape, pins, torn strips, "HELLO my name is" tags, doodles, sunbursts, hand-drawn checkerboards, speed lines |
| `lyrics.js` | `sing` letters a line and writes each word on at its onset, on paper strips slapped down a word at a time (`paper`) or on chips (`paper: { chip: true }`); emphasis on paper takes the deep version of its colour |
| `band.js` | ASYNC, the boy band of Clawds: the five costumes (and Gran's), the guitars, bass, keytar and drum kit, and `play`, a member playing to the record |
| `people.js` | The people the band built apps for: Rosa, Gran, Dr Obi, Mo, Kim, Jess, Dave and Sue |
| `world.js` | The garage (roller door, pegboard, amps, fairy lights, posters) and the street outside |
| `cast.js`, `folk.js`, `props.js`, `hand.js`, `kit.js` | From episode 1: Clawd and `person()`, crowds, props, the lettering alphabet, maths and the song clock. Clawd gains costume hooks and a back view |
| `scenes/` | `intro`, `verse1` (the scrolling zine page), `pre`, `chorus`, `verse2`, `bridge`, `finale`, and `popups`: the band's backing "oooh"s, drawn over whatever shot is on screen |
| `sheet.js`, `people-sheet.js` | Cast sheets, for checking the characters side by side |
| `tools/` | `analyse.py` measures the take into `audio.json`; `typo-audit.mjs` and `typo-report.py` check every sung word |
